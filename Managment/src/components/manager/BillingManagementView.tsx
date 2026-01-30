import { useState, useEffect } from 'react';
import { orderService, invoiceService } from '../../services/api';
import { toast } from 'sonner';
import { FileText, Download, Mail, Send } from 'lucide-react';

interface OrderItem {
    product?: { name: string };
    quantity: number;
    price: number;
}

interface Order {
    _id: string;
    orderId: string;
    customer: string;
    totalAmount: number;
    status: string;
    orderDate: string;
    address: string;
    items: OrderItem[];
}

export function BillingManagementView() {
    const [orders, setOrders] = useState<Order[]>([]);

    useEffect(() => {
        // Self-fetch for this view
        orderService.getAll().then((res: any) => setOrders(res.data as Order[]));
    }, []);

    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [emailData, setEmailData] = useState({ email: '', name: '' });
    const [sendingEmail, setSendingEmail] = useState(false);

    const totalInvoiced = orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
    const paidAmount = orders.filter(o => o.status === 'Delivered').reduce((acc, o) => acc + (o.totalAmount || 0), 0);
    const outstanding = totalInvoiced - paidAmount;

    const handleSendInvoice = async () => {
        if (!selectedOrder || !emailData.email) {
            toast.error('Please enter a valid email address');
            return;
        }
        setSendingEmail(true);
        try {
            await invoiceService.send({
                orderId: selectedOrder._id,
                recipientEmail: emailData.email,
                recipientName: emailData.name || selectedOrder.customer
            });
            toast.success(`Invoice sent to ${emailData.email}`);
            setShowEmailModal(false);
            setEmailData({ email: '', name: '' });
        } catch (error) {
            console.error('Failed to send invoice:', error);
            toast.error('Failed to send invoice email');
        } finally {
            setSendingEmail(false);
        }
    };

    const handleViewInvoice = (order: Order) => {
        setSelectedOrder(order);
        setShowInvoiceModal(true);
    };

    const handleOpenEmailModal = (order: Order) => {
        setSelectedOrder(order);
        setEmailData({ email: '', name: order.customer });
        setShowEmailModal(true);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Billing Management</h2>
                <button
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    onClick={() => toast.info('Select an order to create invoice')}
                >
                    <FileText size={18} />
                    Create Invoice
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Total Invoiced</p>
                    <p className="text-3xl font-bold text-gray-900">${totalInvoiced.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Estimated Paid</p>
                    <p className="text-3xl font-bold text-green-600">${paidAmount.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Outstanding</p>
                    <p className="text-3xl font-bold text-red-600">${outstanding.toLocaleString()}</p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Order ID</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {orders.map((order) => (
                            <tr key={order._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.orderId}</td>
                                <td className="px-6 py-4 text-sm text-gray-700">{order.customer}</td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">${order.totalAmount?.toLocaleString()}</td>
                                <td className="px-6 py-4">
                                    <span
                                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                            order.status === 'In Transit' ? 'bg-orange-100 text-orange-700' :
                                                order.status === 'Approved' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                            }`}
                                    >
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 space-x-2">
                                    <button
                                        onClick={() => handleViewInvoice(order)}
                                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                    >
                                        View
                                    </button>
                                    <button
                                        onClick={() => handleOpenEmailModal(order)}
                                        className="text-green-600 hover:text-green-700 text-sm font-medium"
                                    >
                                        Send Invoice
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Invoice Preview Modal */}
            {showInvoiceModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="bg-blue-600 text-white p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold">ISDN Distribution System</h3>
                                    <p className="text-blue-100">Official Invoice</p>
                                </div>
                                <button onClick={() => setShowInvoiceModal(false)} className="text-white hover:text-blue-200 text-2xl">×</button>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <p className="text-sm text-gray-500">Invoice Number</p>
                                    <p className="font-bold text-gray-900">INV-{selectedOrder.orderId}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Date</p>
                                    <p className="font-bold text-gray-900">{new Date(selectedOrder.orderDate).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Customer</p>
                                    <p className="font-bold text-gray-900">{selectedOrder.customer}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Address</p>
                                    <p className="font-bold text-gray-900">{selectedOrder.address}</p>
                                </div>
                            </div>

                            <table className="w-full mb-6">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Item</th>
                                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Qty</th>
                                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Price</th>
                                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedOrder.items?.map((item: any, idx: number) => (
                                        <tr key={idx} className="border-b">
                                            <td className="px-4 py-3 text-sm">{item.product?.name || 'Product'}</td>
                                            <td className="px-4 py-3 text-sm">{item.quantity}</td>
                                            <td className="px-4 py-3 text-sm">${item.price?.toLocaleString()}</td>
                                            <td className="px-4 py-3 text-sm font-medium">${(item.quantity * item.price)?.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                                <span className="text-lg font-semibold text-gray-700">Total Amount:</span>
                                <span className="text-2xl font-bold text-blue-600">${selectedOrder.totalAmount?.toLocaleString()}</span>
                            </div>

                            <div className="mt-6 flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowInvoiceModal(false);
                                        handleOpenEmailModal(selectedOrder);
                                    }}
                                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                                >
                                    <Mail size={18} />
                                    Send via Email
                                </button>
                                <button
                                    onClick={() => {
                                        toast.success('Invoice downloaded (simulated)');
                                    }}
                                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                                >
                                    <Download size={18} />
                                    Download PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Email Send Modal */}
            {showEmailModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
                        <div className="p-6 border-b">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-gray-900">Send Invoice via Email</h3>
                                <button onClick={() => setShowEmailModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-600">Sending invoice for:</p>
                                <p className="font-bold text-gray-900">{selectedOrder.orderId} - {selectedOrder.customer}</p>
                                <p className="text-lg font-semibold text-blue-600">${selectedOrder.totalAmount?.toLocaleString()}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Name</label>
                                <input
                                    type="text"
                                    value={emailData.name}
                                    onChange={(e) => setEmailData({ ...emailData, name: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    placeholder="Customer name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                                <input
                                    type="email"
                                    value={emailData.email}
                                    onChange={(e) => setEmailData({ ...emailData, email: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    placeholder="customer@email.com"
                                    required
                                />
                            </div>

                            <button
                                onClick={handleSendInvoice}
                                disabled={sendingEmail || !emailData.email}
                                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {sendingEmail ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send size={18} />
                                        Send Invoice
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
