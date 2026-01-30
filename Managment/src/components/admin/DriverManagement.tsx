import { useState, useEffect } from 'react';
import {
    Users, Search, CheckCircle, XCircle, Clock,
    Phone, Mail, Eye, Info, Calendar, User, Truck, FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { driverService } from '../../services/api';
import './DriverManagement.css';

export function DriverManagement() {
    const [drivers, setDrivers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDriver, setSelectedDriver] = useState<any>(null);
    const [statusFilter, setStatusFilter] = useState('');
    const [centerFilter, setCenterFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [adminNote, setAdminNote] = useState('');

    useEffect(() => {
        fetchDrivers();
    }, [statusFilter, centerFilter]);

    const fetchDrivers = async () => {
        try {
            setLoading(true);
            const params: any = {};
            if (statusFilter) params.status = statusFilter;
            if (centerFilter) params.center = centerFilter;
            if (searchQuery) params.search = searchQuery;

            const res = await driverService.getAll(params);
            setDrivers(res.data);
        } catch (error) {
            toast.error('Failed to load drivers');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchDrivers();
    };

    const handleApproval = async (id: string, status: 'Approved' | 'Rejected') => {
        try {
            // Get current admin ID from localStorage
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;
            const adminId = user?._id || user?.id;

            await driverService.updateStatus(id, {
                status,
                note: adminNote,
                adminId
            });

            toast.success(`Driver ${status.toLowerCase()} successfully`);
            setAdminNote('');
            setSelectedDriver(null);
            fetchDrivers();
        } catch (error) {
            toast.error('Operation failed');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Approved':
                return <span className="status-badge approved"><CheckCircle size={12} /> Approved</span>;
            case 'Rejected':
                return <span className="status-badge rejected"><XCircle size={12} /> Rejected</span>;
            default:
                return <span className="status-badge pending"><Clock size={12} /> Pending</span>;
        }
    };

    return (
        <div className="driver-hub-wrapper">
            <div className="driver-hub-container animate-in fade-in duration-500">
                <header className="driver-hub-header">
                    <div className="header-title">
                        <h1>Driver <span>Approval Hub</span></h1>
                        <p>Review and manage ISDN distribution network drivers</p>
                    </div>
                    <div className="stats-container">
                        <div className="stat-item">
                            <p className="stat-label">Total</p>
                            <p className="stat-value">{drivers.length}</p>
                        </div>
                        <div className="stat-item">
                            <p className="stat-label pending">Pending</p>
                            <p className="stat-value pending">{drivers.filter(d => d.approvalStatus === 'Pending').length}</p>
                        </div>
                    </div>
                </header>

                {/* Filters */}
                <div className="filters-section">
                    <form onSubmit={handleSearch} className="filters-form">
                        {/* Search Bar Row */}
                        <div className="search-wrapper">
                            <Search className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search by name, email or phone..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-input"
                            />
                        </div>

                        {/* Filter Controls Row */}
                        <div className="filters-row">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="filter-select"
                            >
                                <option value="">All Statuses</option>
                                <option value="Pending">Pending</option>
                                <option value="Approved">Approved</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                            <select
                                value={centerFilter}
                                onChange={(e) => setCenterFilter(e.target.value)}
                                className="filter-select"
                            >
                                <option value="">All Centers</option>
                                <option value="Central">Central</option>
                                <option value="North">North</option>
                                <option value="South">South</option>
                                <option value="East">East</option>
                                <option value="West">West</option>
                            </select>
                            <button type="submit" className="filter-btn">
                                Apply Filters
                            </button>
                        </div>
                    </form>
                </div>

                {/* Drivers List */}
                <div className="drivers-grid">
                    {drivers.map((driver) => (
                        <div key={driver._id} className="driver-card">
                            <div className="card-blue-bar"></div>

                            <div className="card-content">
                                <div className="card-header">
                                    <div className="driver-image-container">
                                        <img
                                            src={driver.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(driver.name)}&background=random`}
                                            alt={driver.name}
                                            className="driver-image"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(driver.name)}&background=random`;
                                            }}
                                        />
                                    </div>
                                    <div className="driver-title">
                                        <h3 className="driver-name" title={driver.name}>{driver.name}</h3>
                                        <p className="driver-center">{driver.company || 'Central Center'}</p>
                                    </div>
                                </div>

                                <div className="driver-stats">
                                    <div className="stat-row">
                                        <Mail size={14} />
                                        <span className="stat-text" title={driver.email}>{driver.email}</span>
                                    </div>
                                    <div className="stat-row">
                                        <Phone size={14} />
                                        <span className="stat-text">{driver.phone || 'No phone'}</span>
                                    </div>
                                    <div className="pt-2">
                                        {getStatusBadge(driver.approvalStatus)}
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSelectedDriver(driver)}
                                    className="view-profile-btn"
                                >
                                    <Eye size={14} />
                                    View Profile
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {drivers.length === 0 && !loading && (
                    <div className="empty-state">
                        <Users className="empty-icon" />
                        <h3 className="empty-text">No drivers found</h3>
                    </div>
                )}

                {/* Detailed View Modal */}
                {selectedDriver && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            {/* Modal Header */}
                            <div className="modal-header">
                                <div className="modal-title">
                                    <h2 className="text-3xl font-black text-gray-900 m-0 leading-tight">{selectedDriver.name}</h2>
                                    <div className="modal-subtitle">
                                        {getStatusBadge(selectedDriver.approvalStatus)}
                                        <span className="text-gray-400 text-xs font-bold uppercase flex items-center gap-1">
                                            <Calendar size={12} /> Applied {new Date(selectedDriver.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedDriver(null)}
                                    className="close-modal-btn"
                                >
                                    <XCircle size={24} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="modal-body">
                                {/* Hero Image Container */}
                                <div className="modal-image-container">
                                    <img
                                        src={selectedDriver.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedDriver.name)}&background=random`}
                                        alt={selectedDriver.name}
                                        className="modal-hero-image"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedDriver.name)}&background=random`;
                                        }}
                                    />
                                </div>

                                <div className="details-grid">
                                    <div className="space-y-6">
                                        <div className="detail-section-title">
                                            <User size={18} className="text-[#008000]" />
                                            <h4>Personal Details</h4>
                                        </div>
                                        <div className="detail-item">
                                            <p className="detail-label">Full Name</p>
                                            <p className="detail-value">{selectedDriver.name}</p>
                                        </div>
                                        <div className="detail-item">
                                            <p className="detail-label">Email Address</p>
                                            <p className="detail-value">{selectedDriver.email}</p>
                                        </div>
                                        <div className="detail-item">
                                            <p className="detail-label">Phone Number</p>
                                            <p className="detail-value">{selectedDriver.phone}</p>
                                        </div>
                                        <div className="detail-item">
                                            <p className="detail-label">Residential Address</p>
                                            <p className="detail-value">{selectedDriver.address}</p>
                                        </div>
                                        <div className="detail-item">
                                            <p className="detail-label">Distribution Center</p>
                                            <p className="detail-value">{selectedDriver.company}</p>
                                        </div>

                                        <div className="detail-section-title mt-8">
                                            <Truck size={18} className="text-[#008000]" />
                                            <h4>Vehicle Details</h4>
                                        </div>
                                        <div className="detail-item">
                                            <p className="detail-label">Vehicle Type</p>
                                            <p className="detail-value">{selectedDriver.vehicleType}</p>
                                        </div>
                                        <div className="detail-item">
                                            <p className="detail-label">License Plate</p>
                                            <p className="detail-value">{selectedDriver.vehicleNumber}</p>
                                        </div>
                                        <DocumentPreview label="Vehicle Photo" src={selectedDriver.vehiclePhoto} />
                                    </div>

                                    <div className="space-y-6">
                                        <div className="detail-section-title">
                                            <FileText size={18} className="text-[#008000]" />
                                            <h4>Identity & Documents</h4>
                                        </div>
                                        <div className="detail-item">
                                            <p className="detail-label">NIC Number</p>
                                            <p className="detail-value">{selectedDriver.nicNumber}</p>
                                        </div>
                                        <DocumentPreview label="NIC Photo" src={selectedDriver.nicPhoto} />

                                        <div className="detail-item mt-4">
                                            <p className="detail-label">Driving Licence No</p>
                                            <p className="detail-value">{selectedDriver.licenseNumber}</p>
                                        </div>
                                        <DocumentPreview label="Licence Photo" src={selectedDriver.licensePhoto} />
                                    </div>
                                </div>

                                {selectedDriver.approvalStatus === 'Pending' && (
                                    <div className="approval-actions">
                                        <h4 className="action-title">Approval Decision</h4>
                                        <textarea
                                            placeholder="Add an internal note or rejection reason..."
                                            value={adminNote}
                                            onChange={(e) => setAdminNote(e.target.value)}
                                            className="approval-textarea"
                                        />
                                        <div className="action-buttons">
                                            <button
                                                onClick={() => handleApproval(selectedDriver._id, 'Rejected')}
                                                className="action-btn reject-btn"
                                            >
                                                Reject Candidate
                                            </button>
                                            <button
                                                onClick={() => handleApproval(selectedDriver._id, 'Approved')}
                                                className="action-btn approve-btn"
                                            >
                                                Approve for Fleet
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {selectedDriver.approvalStatus !== 'Pending' && (
                                    <div className="decision-box">
                                        <div className="decision-info">
                                            <div className="decision-icon">
                                                <Info size={20} />
                                            </div>
                                            <div className="decision-text">
                                                <label>Decision finalized</label>
                                                <p>{selectedDriver.approvalStatus} on {new Date(selectedDriver.approvedAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        {selectedDriver.rejectionReason && (
                                            <p className="text-xs font-medium text-red-500 italic max-w-sm text-right">" {selectedDriver.rejectionReason} "</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function SectionTitle({ icon: Icon, title }: any) {
    return (
        <div className="flex items-center gap-2 border-b border-gray-100 pb-2 mb-4">
            <Icon size={18} className="text-[#008000]" />
            <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">{title}</h4>
        </div>
    );
}

function DetailItem({ label, value }: any) {
    return (
        <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-sm font-bold text-gray-900">{value || 'Not provided'}</p>
        </div>
    );
}

function DocumentPreview({ label, src }: any) {
    if (!src) return <DetailItem label={label} value="No document uploaded" />;

    return (
        <div className="space-y-2">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
            <div className="relative group cursor-pointer overflow-hidden rounded-2xl border border-gray-100 h-32 bg-gray-50">
                <img src={src} alt={label} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Eye className="text-white" size={24} />
                </div>
            </div>
        </div>
    );
}
