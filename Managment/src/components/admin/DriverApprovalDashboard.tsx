import { useState, useEffect } from 'react';
import {
    UserCheck, UserX, Eye, CheckCircle, XCircle, Clock,
    Search, Filter, Truck, FileText, Image as ImageIcon, Phone, Mail, MapPin
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export function DriverApprovalDashboard() {
    const [drivers, setDrivers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('Pending');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDriver, setSelectedDriver] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchDrivers();
    }, []);

    const fetchDrivers = async () => {
        try {
            const response = await axios.get(`${API_URL}/drivers`);
            setDrivers(response.data);
        } catch (error) {
            console.error('Failed to fetch drivers:', error);
            toast.error('Failed to load drivers');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (driverId: string) => {
        setActionLoading(true);
        try {
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            const adminId = currentUser._id || currentUser.id;

            await axios.put(`${API_URL}/drivers/${driverId}/approve`, {
                adminId: adminId
            });

            toast.success('Driver approved successfully!');
            fetchDrivers();
            setShowModal(false);
            setSelectedDriver(null);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to approve driver');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async (driverId: string) => {
        if (!rejectionReason.trim()) {
            toast.error('Please provide a rejection reason');
            return;
        }

        setActionLoading(true);
        try {
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            const adminId = currentUser._id || currentUser.id;

            await axios.put(`${API_URL}/drivers/${driverId}/reject`, {
                reason: rejectionReason,
                adminId: adminId
            });

            toast.success('Driver application rejected');
            fetchDrivers();
            setShowModal(false);
            setSelectedDriver(null);
            setRejectionReason('');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to reject driver');
        } finally {
            setActionLoading(false);
        }
    };

    const filteredDrivers = drivers.filter(driver => {
        const matchesFilter = filter === 'All' || driver.approvalStatus === filter;
        const matchesSearch =
            driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            driver.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            driver.phone?.includes(searchQuery);
        return matchesFilter && matchesSearch;
    });

    const pendingCount = drivers.filter(d => d.approvalStatus === 'Pending').length;

    const getStatusBadge = (status: string) => {
        const styles = {
            Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            Approved: 'bg-green-100 text-green-800 border-green-200',
            Rejected: 'bg-red-100 text-red-800 border-red-200'
        };

        const icons = {
            Pending: <Clock className="w-4 h-4" />,
            Approved: <CheckCircle className="w-4 h-4" />,
            Rejected: <XCircle className="w-4 h-4" />
        };

        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${styles[status as keyof typeof styles]}`}>
                {icons[status as keyof typeof icons]}
                {status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black mb-2">Driver Approvals</h1>
                        <p className="text-green-100">Review and manage driver applications</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3">
                        <div className="text-4xl font-black">{pendingCount}</div>
                        <div className="text-xs text-green-100">Pending</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none"
                    />
                </div>

                <div className="flex gap-2">
                    {['All', 'Pending', 'Approved', 'Rejected'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-3 rounded-xl font-bold text-sm transition-all ${filter === status
                                ? 'bg-green-600 text-white shadow-lg'
                                : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-green-300'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Drivers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDrivers.map(driver => (
                    <div
                        key={driver._id}
                        className="bg-white rounded-2xl border-2 border-gray-100 p-6 hover:shadow-xl transition-all cursor-pointer"
                        onClick={() => {
                            setSelectedDriver(driver);
                            setShowModal(true);
                        }}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <Truck className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{driver.name}</h3>
                                    <p className="text-sm text-gray-500">{driver.vehicleType}</p>
                                </div>
                            </div>
                            {getStatusBadge(driver.approvalStatus)}
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                                <Mail className="w-4 h-4" />
                                <span className="truncate">{driver.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <Phone className="w-4 h-4" />
                                <span>{driver.phone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <Truck className="w-4 h-4" />
                                <span>{driver.vehicleNumber}</span>
                            </div>
                        </div>

                        {driver.approvalStatus === 'Pending' && (
                            <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleApprove(driver._id);
                                    }}
                                    className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-green-700 transition-colors"
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedDriver(driver);
                                        setShowModal(true);
                                    }}
                                    className="flex-1 bg-red-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-red-700 transition-colors"
                                >
                                    Reject
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {filteredDrivers.length === 0 && (
                <div className="text-center py-16">
                    <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-semibold">No drivers found</p>
                </div>
            )}

            {/* Driver Details Modal */}
            {showModal && selectedDriver && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-black">{selectedDriver.name}</h2>
                                    <p className="text-green-100">{selectedDriver.email}</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        setSelectedDriver(null);
                                        setRejectionReason('');
                                    }}
                                    className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Personal Info */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Personal Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-semibold text-gray-500">Phone</label>
                                        <p className="text-gray-900">{selectedDriver.phone}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-gray-500">Email</label>
                                        <p className="text-gray-900">{selectedDriver.email}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-sm font-semibold text-gray-500">Address</label>
                                        <p className="text-gray-900">{selectedDriver.address}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Vehicle Info */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Vehicle Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-semibold text-gray-500">Vehicle Type</label>
                                        <p className="text-gray-900">{selectedDriver.vehicleType}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-gray-500">Vehicle Number</label>
                                        <p className="text-gray-900 font-mono">{selectedDriver.vehicleNumber}</p>
                                    </div>
                                </div>
                                {selectedDriver.vehiclePhoto && (
                                    <div className="mt-4">
                                        <label className="text-sm font-semibold text-gray-500 block mb-2">Vehicle Photo</label>
                                        <img
                                            src={selectedDriver.vehiclePhoto}
                                            alt="Vehicle"
                                            className="max-w-full h-auto rounded-lg border-2 border-gray-200"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Documents */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Documents</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-semibold text-gray-500">License Number</label>
                                        <p className="text-gray-900 font-mono">{selectedDriver.licenseNumber}</p>
                                        {selectedDriver.licensePhoto && (
                                            <img
                                                src={selectedDriver.licensePhoto}
                                                alt="License"
                                                className="mt-2 max-w-full h-auto rounded-lg border-2 border-gray-200"
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-gray-500">NIC Number</label>
                                        <p className="text-gray-900 font-mono">{selectedDriver.nicNumber}</p>
                                        {selectedDriver.nicPhoto && (
                                            <img
                                                src={selectedDriver.nicPhoto}
                                                alt="NIC"
                                                className="mt-2 max-w-full h-auto rounded-lg border-2 border-gray-200"
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            {selectedDriver.approvalStatus === 'Pending' && (
                                <div className="border-t border-gray-200 pt-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                                Rejection Reason (if rejecting)
                                            </label>
                                            <textarea
                                                value={rejectionReason}
                                                onChange={(e) => setRejectionReason(e.target.value)}
                                                placeholder="Enter reason for rejection..."
                                                rows={3}
                                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-500 focus:outline-none resize-none"
                                            />
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleApprove(selectedDriver._id)}
                                                disabled={actionLoading}
                                                className="flex-1 bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                <UserCheck className="w-5 h-5" />
                                                {actionLoading ? 'Processing...' : 'Approve Driver'}
                                            </button>
                                            <button
                                                onClick={() => handleReject(selectedDriver._id)}
                                                disabled={actionLoading}
                                                className="flex-1 bg-red-600 text-white py-4 rounded-xl font-bold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                <UserX className="w-5 h-5" />
                                                {actionLoading ? 'Processing...' : 'Reject Application'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectedDriver.approvalStatus === 'Rejected' && selectedDriver.rejectionReason && (
                                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                                    <p className="text-sm font-bold text-red-900">Rejection Reason:</p>
                                    <p className="text-sm text-red-700 mt-1">{selectedDriver.rejectionReason}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
