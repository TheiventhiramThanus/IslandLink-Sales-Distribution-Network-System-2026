import { useState, useEffect } from 'react';
import { Package, Eye, Download, Ban, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { orderService } from '../../services/api';
import { formatPrice } from '../../utils/currencyUtils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface MyOrdersProps {
  user: { id: string, name: string, email: string, company?: string } | null;
}

export function MyOrders({ user }: MyOrdersProps) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchOrders = () => {
    if (user?.id) {
      orderService.getByUser(user.id).then(res => {
        setOrders(res.data);
        setLoading(false);
      }).catch(err => {
        console.error('Failed to fetch orders:', err);
        setLoading(false);
      });
    }
  };

  useEffect(() => {
    fetchOrders();
    const pollInterval = setInterval(fetchOrders, 30000);
    return () => clearInterval(pollInterval);
  }, [user]);

  const handleDownloadInvoice = (order: any) => {
    const doc = new jsPDF();
    const currency = 'USD'; // Default or fetch from order if available

    // Add Company Header
    doc.setFillColor(37, 99, 235); // blue-600 text-black
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('INVOICE', 20, 25);

    doc.setFontSize(10);
    doc.text('ISDN - IslandLink Sales Distribution', 20, 32);

    doc.text('Invoice Number', 150, 20);
    doc.setFontSize(16);
    doc.text(order.invoiceNumber || 'INV-PENDING', 150, 28);

    // Add Customer & Order Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);

    // Bill To
    doc.text('Bill To:', 20, 55);
    doc.setFont('helvetica', 'bold');
    doc.text(user?.name || order.customer || 'Customer', 20, 60);
    doc.setFont('helvetica', 'normal');
    if (user?.company) doc.text(user.company, 20, 65);

    // Order Details
    doc.text('Order Details:', 120, 55);
    doc.text(`Order Date: ${new Date(order.orderDate).toLocaleDateString()}`, 120, 60);
    doc.text(`Order ID: ${order.orderId}`, 120, 65);
    doc.text(`Payment: ${order.paymentMethod || 'N/A'}`, 120, 70);

    // Table
    const tableBody = order.items.map((item: any) => [
      item.product?.name || 'Item',
      item.product?.sku || '-',
      item.quantity.toString(),
      formatPrice(item.price || item.product?.price || 0, currency),
      formatPrice((item.price || item.product?.price || 0) * item.quantity, currency)
    ]);

    autoTable(doc, {
      startY: 85,
      head: [['Item', 'SKU', 'Qty', 'Price', 'Total']],
      body: tableBody,
      headStyles: { fillColor: [249, 250, 251], textColor: [75, 85, 99], fontStyle: 'bold' },
      bodyStyles: { textColor: [17, 24, 39] },
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 3 },
    });

    // Totals
    const finalY = (doc as any).lastAutoTable.finalY + 10;

    doc.text(`Total:`, 140, finalY);
    doc.setFont('helvetica', 'bold');
    doc.text(formatPrice(order.totalAmount, currency), 170, finalY, { align: 'right' });

    // Save
    doc.save(`Invoice-${order.invoiceNumber || order.orderId}.pdf`);
  };

  const confirmCancellation = async () => {
    if (!confirmCancelId) return;

    setActionLoading(confirmCancelId);
    try {
      await orderService.cancel(confirmCancelId);
      // No alert needed unless error
      fetchOrders();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setActionLoading(null);
      setConfirmCancelId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'In Transit': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Processing': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
      case 'Paid': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">View and manage all your orders</p>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          {/* Desktop View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Order Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Delivery Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.orderId}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{order.items?.length || 0} items</td>
                    <td className="px-6 py-4 text-sm text-gray-900">${(order.totalAmount || 0).toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {order.deliveryDate || 'Not scheduled'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-blue-600 text-black hover:text-blue-700 p-1 rounded-full hover:bg-blue-50"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>

                        <button
                          onClick={() => handleDownloadInvoice(order)}
                          className="text-gray-600 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                          title="Download Invoice"
                        >
                          <Download className="w-5 h-5" />
                        </button>

                        {['Pending', 'Processing', 'Paid'].includes(order.status) && (
                          <button
                            onClick={() => setConfirmCancelId(order._id)}
                            className="text-red-600 hover:text-red-700 p-1 rounded-full hover:bg-red-50 disabled:opacity-50"
                            title="Cancel Order"
                            disabled={actionLoading === order._id}
                          >
                            <Ban className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="md:hidden divide-y divide-gray-200">
            {orders.map((order) => (
              <div key={order._id} className="p-4">
                {/* ... Mobile view content ... */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-medium text-gray-900">{order.orderId}</p>
                    <p className="text-sm text-gray-600">{new Date(order.orderDate).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  {/* ... Details ... */}
                  <div><span className="text-gray-600">Items:</span> <span className="text-gray-900">{order.items?.length || 0}</span></div>
                  <div><span className="text-gray-600">Total:</span> <span className="text-gray-900">${(order.totalAmount || 0).toFixed(2)}</span></div>
                </div>

                <div className="flex space-x-2">
                  <button onClick={() => setSelectedOrder(order)} className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium flex justify-center items-center">
                    <Eye className="w-4 h-4 mr-1" /> View
                  </button>
                  <button onClick={() => handleDownloadInvoice(order)} className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium flex justify-center items-center">
                    <Download className="w-4 h-4 mr-1" /> PDF
                  </button>
                  {['Pending', 'Processing', 'Paid'].includes(order.status) && (
                    <button onClick={() => setConfirmCancelId(order._id)} className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium flex justify-center items-center">
                      <Ban className="w-4 h-4 mr-1" /> Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmCancelId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-8 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Cancel Order?</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Are you sure you want to cancel this order? If you have already paid, a refund will be initiated to your original payment method.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setConfirmCancelId(null)}
                className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                disabled={!!actionLoading}
              >
                Keep Order
              </button>
              <button
                onClick={confirmCancellation}
                disabled={!!actionLoading}
                style={{ backgroundColor: '#dc2626', color: 'white' }}
                className="flex-1 py-2 rounded-lg hover:bg-red-700 font-bold transition-colors flex items-center justify-center shadow-sm"
              >
                {actionLoading ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
                <p className="text-sm text-gray-500">#{selectedOrder.orderId}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className={`p-4 rounded-lg border ${getStatusColor(selectedOrder.status)} bg-opacity-10 flex items-center space-x-3`}>
                <div className="font-medium flex-1">Status: {selectedOrder.status}</div>
                {selectedOrder.status === 'Cancelled' && <AlertTriangle className="w-5 h-5" />}
                {selectedOrder.status === 'Delivered' && <CheckCircle className="w-5 h-5" />}
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Items Purchased</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <div className="h-16 w-16 bg-white rounded border border-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center text-gray-400">
                        {item.product?.image ? <img src={item.product.image} className="w-full h-full object-cover" /> : <Package className="w-8 h-8" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.product?.name || 'Unknown Product'}</h4>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{formatPrice(item.price || item.product?.price || 0, 'USD')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatPrice(selectedOrder.totalAmount * 0.92, 'USD')}</span></div>
                <div className="flex justify-between text-gray-600"><span>Tax (8%)</span><span>{formatPrice(selectedOrder.totalAmount * 0.08, 'USD')}</span></div>
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-100"><span>Total</span><span>{formatPrice(selectedOrder.totalAmount, 'USD')}</span></div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Delivery Information</h4>
                <p className="text-sm text-blue-800">{selectedOrder.address || selectedOrder.deliveryAddress}</p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button onClick={() => handleDownloadInvoice(selectedOrder)} className="flex-1 py-3 bg-blue-600 text-black text-black text-white rounded-lg hover:bg-blue-700 font-medium flex justify-center items-center">
                  <Download className="w-5 h-5 mr-2" /> Download Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
