import { CheckCircle, Download, Mail, Package, MapPin, Calendar, CreditCard } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatPrice } from '../../utils/currencyUtils';
import type { Page, Order, User } from '../../types';

interface OrderConfirmationProps {
  order: Order | null;
  user: User | null;
  onNavigate: (page: Page) => void;
  currency: 'USD' | 'LKR';
}

export function OrderConfirmation({ order, user, onNavigate, currency }: OrderConfirmationProps) {
  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No order found</p>
          <button
            onClick={() => onNavigate('catalogue')}
            className="mt-4 px-6 py-2 bg-blue-600 text-black text-black text-white rounded-lg hover:bg-blue-700"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  const handleDownloadInvoice = () => {
    const doc = new jsPDF();

    // Add Company Header
    doc.setFillColor(255, 255, 255); // White background
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(0, 128, 0); // Green text
    doc.setFontSize(24);
    doc.text('INVOICE', 20, 25);

    doc.setTextColor(100, 100, 100);
    doc.setFontSize(10);
    doc.text('ISDN - IslandLink Sales Distribution', 20, 32);

    doc.text('Invoice Number', 150, 20);
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(order.invoiceNumber || 'INV-PENDING', 150, 28);

    // Add Customer & Order Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);

    // Bill To
    doc.text('Bill To:', 20, 55);
    doc.setFont('helvetica', 'bold');
    doc.text(user?.name || 'Customer', 20, 60);
    doc.setFont('helvetica', 'normal');
    if (user?.company) doc.text(user.company, 20, 65);
    doc.text(user?.email || '', 20, user?.company ? 70 : 65);

    // Order Details
    doc.text('Order Details:', 120, 55);
    doc.text(`Order Date: ${order.date}`, 120, 60);
    doc.text(`Order ID: ${order.orderId}`, 120, 65);
    doc.text(`Payment: ${order.paymentMethod}`, 120, 70);

    // Table
    const tableBody = order.items.map(item => [
      item.product.name,
      item.product.sku,
      item.quantity.toString(),
      formatPrice(item.product.price, currency),
      formatPrice(item.product.price * item.quantity, currency)
    ]);

    autoTable(doc, {
      startY: 85,
      head: [['Item', 'SKU', 'Qty', 'Price', 'Total']],
      body: tableBody,
      headStyles: { fillColor: [0, 128, 0], textColor: [255, 255, 255], fontStyle: 'bold' }, // Green header
      bodyStyles: { textColor: [17, 24, 39] },
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 3 },
    });

    // Totals
    const finalY = (doc as any).lastAutoTable.finalY + 10;

    doc.text(`Subtotal:`, 140, finalY);
    doc.text(formatPrice(order.subtotal, currency), 170, finalY, { align: 'right' });

    doc.text(`Tax (8%):`, 140, finalY + 7);
    doc.text(formatPrice(order.tax, currency), 170, finalY + 7, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(0, 128, 0);
    doc.text(`Total:`, 140, finalY + 15);
    doc.text(formatPrice(order.total, currency), 170, finalY + 15, { align: 'right' });

    // Save
    doc.save(`Invoice-${order.invoiceNumber || 'Draft'}.pdf`);
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'credit-card':
        return 'Credit/Debit Card';
      case 'bank-transfer':
        return 'Bank Transfer';
      case 'cash-on-delivery':
        return 'Cash on Delivery';
      default:
        return method;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Success Message */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl text-gray-900 mb-2">Order Confirmed!</h1>
            <p className="text-lg text-gray-600 mb-4">
              Thank you for your order. We've sent a confirmation email to <strong>{user?.email}</strong>
            </p>
            <p className="text-sm text-gray-600">
              Order ID: <span className="font-mono font-medium text-gray-900">{order.orderId}</span>
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto grid lg:grid-cols-3 gap-8">
          {/* Invoice/Order Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              {/* Invoice Header */}
              <div className="bg-white p-6 border-b-4 border-[#008000]">
                <div className="flex justify-between items-start">
                  <div>
                    <img
                      src="/isdn_logo_green.png"
                      alt="IslandLink ISDN"
                      className="h-12 w-auto mb-4"
                    />
                    <h2 className="text-2xl font-bold text-[#008000] mb-1">INVOICE</h2>
                    <p className="text-gray-600">ISDN - IslandLink Sales Distribution</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Invoice Number</p>
                    <p className="text-xl font-mono font-bold text-gray-900">{order.invoiceNumber}</p>
                  </div>
                </div>
              </div>

              {/* Invoice Body */}
              <div className="p-6 space-y-6">
                {/* Customer & Order Info */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm text-gray-600 mb-2">Bill To:</h3>
                    <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                      <p className="text-gray-900 font-medium">{user?.name}</p>
                      <p className="text-gray-600">{user?.company}</p>
                      <p className="text-gray-600">{user?.email}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-600 mb-2">Order Details:</h3>
                    <div className="bg-green-50 rounded-lg p-4 space-y-2 border border-green-100">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Order Date:</span>
                        <span className="text-gray-900 font-medium">{order.date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Order ID:</span>
                        <span className="text-gray-900 font-mono">{order.orderId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment:</span>
                        <span className="text-gray-900">{getPaymentMethodLabel(order.paymentMethod)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items Table */}
                <div>
                  <h3 className="text-sm text-gray-600 mb-3">Order Items:</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[#008000] text-white">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase rounded-l-lg">Item</th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase">SKU</th>
                          <th className="px-4 py-3 text-center text-xs font-medium uppercase">Qty</th>
                          <th className="px-4 py-3 text-right text-xs font-medium uppercase">Price</th>
                          <th className="px-4 py-3 text-right text-xs font-medium uppercase rounded-r-lg">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {order.items.map((item) => (
                          <tr key={item.product.id} className="hover:bg-green-50">
                            <td className="px-4 py-3 text-sm text-gray-900">{item.product.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 font-mono">{item.product.sku}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-center">{item.quantity}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatPrice(item.product.price, currency)}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                              {formatPrice(item.product.price * item.quantity, currency)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Totals */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-end">
                    <div className="w-full max-w-xs space-y-2">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal:</span>
                        <span>{formatPrice(order.subtotal, currency)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Tax (8%):</span>
                        <span>{formatPrice(order.tax, currency)}</span>
                      </div>
                      <div className="flex justify-between text-xl font-bold text-[#008000] pt-2 border-t-2 border-gray-300">
                        <span>Total:</span>
                        <span>{formatPrice(order.total, currency)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Download Button */}
                <div className="flex justify-center pt-4">
                  <button
                    onClick={handleDownloadInvoice}
                    className="px-6 py-3 bg-[#008000] text-white rounded-lg hover:bg-[#006400] font-medium transition-colors flex items-center space-x-2 shadow-lg shadow-green-100"
                  >
                    <Download className="w-5 h-5" />
                    <span>Download Invoice (PDF)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Next Steps */}
          <div className="lg:col-span-1 space-y-6">
            {/* Delivery Info */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <MapPin className="w-5 h-5 text-green-600 text-black" />
                <h3 className="text-lg text-gray-900 font-medium">Delivery Address</h3>
              </div>
              <p className="text-gray-600 text-sm">{order.deliveryAddress}</p>
            </div>

            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Calendar className="w-5 h-5 text-green-600 text-black" />
                <h3 className="text-lg text-gray-900 font-medium">Delivery Date</h3>
              </div>
              <p className="text-gray-900 font-medium">{order.deliveryDate}</p>
            </div>

            {/* Email Confirmation */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-start space-x-3 mb-4">
                <Mail className="w-6 h-6 text-green-600 text-black flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg text-gray-900 font-medium mb-1">Email Sent</h3>
                  <p className="text-sm text-gray-600">
                    Order confirmation and invoice have been automatically sent to your email address.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <button
                onClick={() => onNavigate('track')}
                className="w-full py-3 bg-green-600 text-black text-black text-white rounded-lg hover:bg-green-700 font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <Package className="w-5 h-5" />
                <span>Track Order</span>
              </button>
              <button
                onClick={() => onNavigate('catalogue')}
                className="w-full py-3 bg-white border-2 border-green-600 text-black text-green-600 text-black rounded-lg hover:bg-green-50 font-medium transition-colors"
              >
                Continue Shopping
              </button>
              <button
                onClick={() => onNavigate('dashboard')}
                className="w-full py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Go to Dashboard
              </button>
            </div>

            {/* Support Info */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Need help with your order?</p>
              <p className="text-sm text-gray-900">
                <strong>Email:</strong> support@isdn.com<br />
                <strong>Phone:</strong> +1 (555) 123-4567
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
