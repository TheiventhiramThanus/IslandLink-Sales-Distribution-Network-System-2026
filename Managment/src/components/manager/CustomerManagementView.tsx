import { useState, useEffect } from 'react';
import { userService } from '../../services/api';
import { toast } from 'sonner';
import { User, UserPlus, Search, Edit2, Trash2, Mail, X, Lock, Eye, Phone, MapPin, Building2 } from 'lucide-react';

interface Customer {
    _id: string;
    name: string;
    email: string;
    role: string;
    status: 'Active' | 'Inactive';
    lastLogin?: string;
    createdAt: string;
    phone?: string;
    address?: string;
    company?: string;
}

export function CustomerManagementView() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        status: 'Active',
        phone: '',
        address: '',
        company: ''
    });

    useEffect(() => {
        fetchCustomers();
        const pollInterval = setInterval(fetchCustomers, 30000);
        return () => clearInterval(pollInterval);
    }, []);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const res = await userService.getAll();
            // Filter only customers
            const customerList = (res.data as Customer[]).filter(u => u.role === 'customer');
            setCustomers(customerList);
        } catch (error) {
            console.error('Failed to fetch customers:', error);
            toast.error('Failed to load customers');
        } finally {
            setLoading(false);
        }
    };

    const handlePrepareAdd = () => {
        setEditingCustomer(null);
        setFormData({ name: '', email: '', password: '', status: 'Active', phone: '', address: '', company: '' });
        setIsModalOpen(true);
    };

    const handlePrepareEdit = (customer: Customer) => {
        setEditingCustomer(customer);
        setFormData({
            name: customer.name,
            email: customer.email,
            password: '',
            status: customer.status,
            phone: customer.phone || '',
            address: customer.address || '',
            company: customer.company || ''
        });
        setIsModalOpen(true);
    };

    const handleViewDetails = (customer: Customer) => {
        setViewingCustomer(customer);
        setIsViewModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingCustomer) {
                // Update
                const payload: any = {
                    name: formData.name,
                    email: formData.email,
                    status: formData.status,
                    phone: formData.phone,
                    address: formData.address,
                    company: formData.company
                };
                if (formData.password) payload.password = formData.password;

                await userService.update(editingCustomer._id, payload);
                toast.success('Customer updated successfully');
            } else {
                // Create
                if (!formData.password) {
                    toast.error('Password is required for new customers');
                    return;
                }
                const payload = {
                    ...formData,
                    role: 'customer'
                };
                await userService.create(payload);
                toast.success('Customer created successfully');
            }
            setIsModalOpen(false);
            fetchCustomers();
        } catch (error: any) {
            console.error('Save failed:', error);
            toast.error(error.response?.data?.message || 'Failed to save customer');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this customer?')) return;
        try {
            await userService.delete(id);
            toast.success('Customer deleted successfully');
            fetchCustomers();
        } catch (error) {
            toast.error('Failed to delete customer');
        }
    };

    const handleToggleStatus = async (customer: Customer) => {
        try {
            const newStatus = customer.status === 'Active' ? 'Inactive' : 'Active';
            await userService.update(customer._id, { status: newStatus });
            toast.success(`Customer set to ${newStatus}`);
            fetchCustomers();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 relative">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Customer Management</h2>
                    <p className="text-gray-500 text-sm">Manage registered customers and their account status</p>
                </div>
                <button
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors shadow-sm"
                    onClick={handlePrepareAdd}
                >
                    <UserPlus size={18} />
                    Add Customer
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center gap-3 text-blue-600 mb-2">
                        <User size={20} />
                        <p className="text-sm font-medium">Total Customers</p>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{customers.length}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center gap-3 text-green-600 mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <p className="text-sm font-medium">Active Accounts</p>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                        {customers.filter(c => c.status === 'Active').length}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center gap-3 text-purple-600 mb-2">
                        <Mail size={20} />
                        <p className="text-sm font-medium">New This Month</p>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                        {customers.filter(c => {
                            const date = new Date(c.createdAt);
                            const now = new Date();
                            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                        }).length}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Login</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined Date</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-6 py-4">
                                            <div className="h-4 bg-gray-100 rounded w-full" />
                                        </td>
                                    </tr>
                                ))
                            ) : filteredCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No customers found matching your search.
                                    </td>
                                </tr>
                            ) : (
                                filteredCustomers.map((customer) => (
                                    <tr key={customer._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                                    {customer.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">{customer.name}</p>
                                                    <p className="text-xs text-gray-500">{customer.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleToggleStatus(customer)}
                                                className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full cursor-pointer transition-colors ${customer.status === 'Active'
                                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                                                    }`}
                                            >
                                                {customer.status}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {customer.lastLogin ? new Date(customer.lastLogin).toLocaleDateString() : 'Never'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(customer.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button
                                                className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                                                onClick={() => handleViewDetails(customer)}
                                                title="View Details"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                                onClick={() => handlePrepareEdit(customer)}
                                                title="Edit Customer"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(customer._id)}
                                                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                                title="Delete Customer"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* CRU Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900">{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">
                                    {editingCustomer ? 'Reset Password (optional)' : 'Password'}
                                </label>
                                <div className="relative">
                                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="password"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        required={!editingCustomer}
                                        placeholder={editingCustomer ? "Leave blank to keep current" : "Enter secure password"}
                                        minLength={6}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
                                <select
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' })}
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
                                <input
                                    type="tel"
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+94 77 123 4567"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Company (Optional)</label>
                                <input
                                    type="text"
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.company}
                                    onChange={e => setFormData({ ...formData, company: e.target.value })}
                                    placeholder="Company name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Address</label>
                                <textarea
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    rows={3}
                                    placeholder="Full address"
                                />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                                >
                                    {editingCustomer ? 'Save Changes' : 'Create Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Details Modal */}
            {isViewModalOpen && viewingCustomer && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl font-black">
                                        {viewingCustomer.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black">{viewingCustomer.name}</h3>
                                        <p className="text-blue-100 text-sm">Customer Details</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsViewModalOpen(false)}
                                    className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-500 mb-2">
                                        <Mail size={16} />
                                        Email Address
                                    </label>
                                    <p className="text-gray-900 font-medium">{viewingCustomer.email}</p>
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-500 mb-2">
                                        <Phone size={16} />
                                        Phone Number
                                    </label>
                                    <p className="text-gray-900 font-medium">{viewingCustomer.phone || 'Not provided'}</p>
                                </div>
                            </div>

                            {viewingCustomer.company && (
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-500 mb-2">
                                        <Building2 size={16} />
                                        Company
                                    </label>
                                    <p className="text-gray-900 font-medium">{viewingCustomer.company}</p>
                                </div>
                            )}

                            {viewingCustomer.address && (
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-500 mb-2">
                                        <MapPin size={16} />
                                        Address
                                    </label>
                                    <p className="text-gray-900 font-medium">{viewingCustomer.address}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                                <div>
                                    <label className="text-sm font-semibold text-gray-500 mb-2 block">Account Status</label>
                                    <span className={`inline-flex px-3 py-1.5 text-sm font-bold rounded-full ${viewingCustomer.status === 'Active'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                        }`}>
                                        {viewingCustomer.status}
                                    </span>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-500 mb-2 block">Last Login</label>
                                    <p className="text-gray-900 font-medium">
                                        {viewingCustomer.lastLogin
                                            ? new Date(viewingCustomer.lastLogin).toLocaleString()
                                            : 'Never'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-500 mb-2 block">Joined Date</label>
                                    <p className="text-gray-900 font-medium">
                                        {new Date(viewingCustomer.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    onClick={() => {
                                        setIsViewModalOpen(false);
                                        handlePrepareEdit(viewingCustomer);
                                    }}
                                    className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Edit2 size={18} />
                                    Edit Customer
                                </button>
                                <button
                                    onClick={() => setIsViewModalOpen(false)}
                                    className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
