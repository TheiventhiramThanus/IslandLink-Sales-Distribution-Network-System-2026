import { useState, useEffect } from 'react';
import { Download, CreditCard, CheckCircle, Clock } from 'lucide-react';
import { orderService, invoiceService } from '../../services/api';
import { formatPrice } from '../../utils/currencyUtils';
import { toast } from 'sonner';

interface InvoicesProps {
  user: { id: string; name: string } | null;
  currency: 'USD' | 'LKR';
}

export function Invoices({ user, currency }: InvoicesProps) {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = () => {
      if (user?.id) {
        // In this system, invoices are derived from orders
        orderService.getByUser(user.id).then(res => {
          const invoiceData = res.data.map((order: any) => ({
            id: `INV-${order.orderId}`,
            orderId: order.orderId,
            date: new Date(order.orderDate).toLocaleDateString(),
            dueDate: new Date(new Date(order.orderDate).getTime() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString(),
            amount: order.totalAmount,
            status: (order.totalAmount === 0 || order.status === 'Delivered' || order.status === 'Paid') ? 'Paid' : 'Pending',
          }));
          setInvoices(invoiceData);
          setLoading(false);
        }).catch(err => {
          console.error('Invoice error:', err);
          setLoading(false);
        });
      }
    };

    fetchInvoices();
    const pollInterval = setInterval(fetchInvoices, 30000);
    return () => clearInterval(pollInterval);
  }, [user]);

  const handleDownload = (invoiceId: string) => {
    toast.info(`Generating invoice PDF for ${invoiceId}...`);

    // Simulate generation delay then download text file
    setTimeout(() => {
      try {
        const invoice = invoices.find(i => i.id === invoiceId);
        const content = `
INVOICE RECEIPT
--------------
Invoice ID: ${invoiceId}
Date: ${invoice?.date}
Amount: ${formatPrice(invoice?.amount || 0, currency)}
Status: ${invoice?.status}

Thank you for your business!
        `;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${invoiceId}.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast.success('Invoice downloaded successfully');
      } catch (e) {
        toast.error('Download failed');
      }
    }, 1500);
  };

  const handlePay = (invoiceId: string, amount: number) => {
    toast.loading(`Processing payment for ${invoiceId}...`);
    setTimeout(() => {
      toast.dismiss();
      toast.success('Payment successful!', {
        description: `Paid ${formatPrice(amount, currency)} for ${invoiceId}`
      });
      // Update local state to reflect payment
      setInvoices(prev => prev.map(inv =>
        inv.id === invoiceId ? { ...inv, status: 'Paid' } : inv
      ));
    }, 2000);
  };

  const handlePayAll = () => {
    if (totalPending === 0) {
      toast.info('No pending payments');
      return;
    }

    toast.loading(`Processing payment of ${formatPrice(totalPending, currency)}...`);

    setTimeout(() => {
      toast.dismiss();
      toast.success('All payments processed successfully!');

      // Mark all pending as paid
      setInvoices(prev => prev.map(inv =>
        inv.status === 'Pending' ? { ...inv, status: 'Paid' } : inv
      ));
    }, 2500);
  };

  const totalPending = invoices
    .filter(inv => inv.status === 'Pending')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const totalPaid = invoices
    .filter(inv => inv.status === 'Paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const getStatusColor = (status: string) => {
    return status === 'Paid'
      ? 'bg-green-100 text-green-700 border-green-200'
      : 'bg-yellow-100 text-yellow-700 border-yellow-200';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl text-gray-900 mb-2">Invoices & Payments</h1>
          <p className="text-gray-600">Manage your billing and payment history</p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md border-2 border-yellow-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600">Pending Payments</h3>
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <p className="text-3xl text-gray-900 mb-2 font-bold">{formatPrice(totalPending, currency)}</p>
            <button
              onClick={handlePayAll}
              disabled={totalPending === 0}
              className={`w-full mt-4 px-6 py-3 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${totalPending === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 text-black text-black hover:bg-blue-700'}`}
            >
              <CreditCard className="w-5 h-5" />
              <span>Pay Now</span>
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md border-2 border-green-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600">Total Paid</h3>
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-3xl text-gray-900 mb-2 font-bold">{formatPrice(totalPaid, currency)}</p>
            <p className="text-sm text-green-700 mt-4">All payments up to date</p>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          {/* Desktop View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Invoice ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Invoice Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{invoice.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{invoice.orderId}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{invoice.date}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{invoice.dueDate}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-bold">{formatPrice(invoice.amount, currency)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleDownload(invoice.id)}
                          className="text-blue-600 text-black hover:text-blue-700 flex items-center space-x-1"
                        >
                          <Download className="w-4 h-4" />
                          <span className="text-sm">Download</span>
                        </button>
                        {invoice.status === 'Pending' && (
                          <button
                            onClick={() => handlePay(invoice.id, invoice.amount)}
                            className="px-3 py-1 bg-blue-600 text-black text-black text-white rounded hover:bg-blue-700 text-sm font-medium"
                          >
                            Pay
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
            {invoices.map((invoice) => (
              <div key={invoice.id} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-medium text-gray-900">{invoice.id}</p>
                    <p className="text-sm text-gray-600">{invoice.orderId}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(invoice.status)}`}>
                    {invoice.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                    <span className="text-gray-600">Date:</span> <span className="text-gray-900">{invoice.date}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Due:</span> <span className="text-gray-900">{invoice.dueDate}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Amount:</span> <span className="text-gray-900 text-lg font-bold">{formatPrice(invoice.amount, currency)}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDownload(invoice.id)}
                    className="flex-1 px-4 py-2 bg-white border border-blue-600 text-black text-blue-600 text-black rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium flex items-center justify-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                  {invoice.status === 'Pending' && (
                    <button
                      onClick={() => handlePay(invoice.id, invoice.amount)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-black text-black text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Pay Now
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
