import { useState, useEffect } from 'react';
import { Search, Truck, Info, X, Shield } from 'lucide-react';
import { driverService } from '../../services/api';
import { toast } from 'sonner';
import './LogisticsCommon.css';

export function DriversView() {
    const [drivers, setDrivers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [centerFilter, setCenterFilter] = useState('All');
    const [approvalFilter, setApprovalFilter] = useState('All');
    const [activeFilter, setActiveFilter] = useState('All');
    const [selectedDriver, setSelectedDriver] = useState<any>(null);

    useEffect(() => {
        fetchDrivers();
    }, [centerFilter, approvalFilter, activeFilter]);

    const fetchDrivers = async () => {
        try {
            setLoading(true);
            const res = await driverService.getAll({
                center: centerFilter,
                approvalStatus: approvalFilter,
                activeStatus: activeFilter,
                search: searchTerm
            });
            setDrivers(res.data);
        } catch (error) {
            toast.error('Failed to fetch drivers');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchDrivers();
    };

    const getApprovalClass = (status: string) => {
        switch (status) {
            case 'Approved': return 'badge-approved';
            case 'Rejected': return 'badge-rejected';
            case 'Pending': return 'badge-pending';
            default: return '';
        }
    };

    const getStatusClass = (status: string) => {
        return status === 'Active' ? 'badge-active' : 'badge-inactive';
    };

    return (
        <div className="logistics-view-container">
            <header className="view-header">
                <div className="view-title">
                    <h1>Driver <span style={{ color: '#2563eb' }}>Network</span></h1>
                    <p>Managing {drivers.length} registered distribution drivers</p>
                </div>
            </header>

            {/* Filters Row */}
            <div className="view-filters">
                <form className="filter-group" onSubmit={handleSearch}>
                    <label className="filter-label">Search</label>
                    <div className="filter-control-wrap">
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            className="filter-input has-icon"
                            placeholder="Search Name, Email, or Plate..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </form>
                <div className="filter-group">
                    <label className="filter-label">Center</label>
                    <select className="filter-input" value={centerFilter} onChange={(e) => setCenterFilter(e.target.value)}>
                        <option value="All">All Centers</option>
                        <option value="North">North</option>
                        <option value="South">South</option>
                        <option value="East">East</option>
                        <option value="West">West</option>
                        <option value="Central">Central</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label className="filter-label">Approval</label>
                    <select className="filter-input" value={approvalFilter} onChange={(e) => setApprovalFilter(e.target.value)}>
                        <option value="All">All Status</option>
                        <option value="Approved">Approved</option>
                        <option value="Pending">Pending</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label className="filter-label">Active</label>
                    <select className="filter-input" value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)}>
                        <option value="All">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                </div>
            </div>

            {/* Desktop Table */}
            <div className="table-responsive-wrapper">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Driver</th>
                            <th>Contact</th>
                            <th>Center</th>
                            <th>Vehicle No.</th>
                            <th>Approval</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'right' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {drivers.map(d => (
                            <tr key={d._id}>
                                <td>
                                    <div className="avatar-cell">
                                        <div className="thumbnail-box">
                                            {d.image ? (
                                                <img src={d.image} alt={d.name} />
                                            ) : (
                                                <span className="thumbnail-placeholder">{d.name.charAt(0)}</span>
                                            )}
                                        </div>
                                        <div className="driver-info-main">
                                            <p>{d.name}</p>
                                            <p>{d.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td><span className="card-value">{d.phone || 'N/A'}</span></td>
                                <td><span className="card-value" style={{ textTransform: 'uppercase', fontSize: '0.75rem' }}>{d.company || 'Unassigned'}</span></td>
                                <td><span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{d.vehicleNumber || 'N/A'}</span></td>
                                <td><span className={`badge ${getApprovalClass(d.approvalStatus)}`}>{d.approvalStatus}</span></td>
                                <td><span className={`badge ${getStatusClass(d.status)}`}>{d.status}</span></td>
                                <td style={{ textAlign: 'right' }}>
                                    <button onClick={() => setSelectedDriver(d)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                                        <Info size={20} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {drivers.length === 0 && !loading && (
                    <div style={{ padding: '5rem', textAlign: 'center', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>No drivers found</div>
                )}
            </div>

            {/* Mobile Cards */}
            <div className="mobile-driver-list">
                {drivers.map(d => (
                    <div key={d._id} className="driver-card">
                        <div className="card-header">
                            <div className="avatar-cell">
                                <div className="thumbnail-box">
                                    {d.image ? <img src={d.image} alt={d.name} /> : <span className="thumbnail-placeholder">{d.name.charAt(0)}</span>}
                                </div>
                                <div className="driver-info-main">
                                    <p>{d.name}</p>
                                    <p>{d.company || 'Unassigned'} Center</p>
                                </div>
                            </div>
                            <span className={`badge ${getApprovalClass(d.approvalStatus)}`}>{d.approvalStatus}</span>
                        </div>
                        <div className="card-body">
                            <div className="card-body-item">
                                <span className="card-label">Email</span>
                                <span className="card-value">{d.email}</span>
                            </div>
                            <div className="card-body-item">
                                <span className="card-label">Vehicle No.</span>
                                <span className="card-value">{d.vehicleNumber || 'N/A'}</span>
                            </div>
                            <div className="card-body-item">
                                <span className="card-label">Status</span>
                                <span className={`badge ${getStatusClass(d.status)}`}>{d.status}</span>
                            </div>
                        </div>
                        <button className="view-btn-mobile" onClick={() => setSelectedDriver(d)}>View Full Profile</button>
                    </div>
                ))}
            </div>

            {/* Profile Modal */}
            {selectedDriver && (
                <div className="modal-overlay" onClick={() => setSelectedDriver(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setSelectedDriver(null)}><X size={20} /></button>

                        <div className="modal-photo-hero">
                            {selectedDriver.image ? (
                                <img src={selectedDriver.image} alt={selectedDriver.name} />
                            ) : (
                                <Truck size={64} color="#2563eb" />
                            )}
                        </div>

                        <div className="modal-profile-header">
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827' }}>{selectedDriver.name}</h2>
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                <span className={`badge ${getApprovalClass(selectedDriver.approvalStatus)}`}>{selectedDriver.approvalStatus}</span>
                                <span className={`badge ${getStatusClass(selectedDriver.status)}`}>{selectedDriver.status}</span>
                            </div>
                        </div>

                        <div className="modal-info-grid">
                            <div className="info-block">
                                <label>Email Address</label>
                                <p>{selectedDriver.email}</p>
                            </div>
                            <div className="info-block">
                                <label>Phone Number</label>
                                <p>{selectedDriver.phone || 'N/A'}</p>
                            </div>
                            <div className="info-block">
                                <label>Distribution Center</label>
                                <p>{selectedDriver.company || 'Unassigned'}</p>
                            </div>
                            <div className="info-block">
                                <label>Registration Plate</label>
                                <p>{selectedDriver.vehicleNumber || 'N/A'}</p>
                            </div>
                            <div className="info-block">
                                <label>Residential Address</label>
                                <p>{selectedDriver.address || 'N/A'}</p>
                            </div>
                            <div className="info-block">
                                <label>NIC Number</label>
                                <p>{selectedDriver.nicNumber || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="doc-section">
                            <h3 style={{ fontSize: '0.875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Shield size={18} color="#2563eb" /> Verified Credentials
                            </h3>
                            <div className="doc-grid">
                                <div>
                                    <span className="doc-item-title">NIC FRONT/BACK</span>
                                    <div className="doc-img-wrap">
                                        {selectedDriver.nicPhoto ? <img src={selectedDriver.nicPhoto} alt="NIC" /> : <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>No NIC Photo Attached</p>}
                                    </div>
                                </div>
                                <div>
                                    <span className="doc-item-title">DRIVING LICENSE</span>
                                    <div className="doc-img-wrap">
                                        {selectedDriver.licensePhoto ? <img src={selectedDriver.licensePhoto} alt="License" /> : <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>No License Photo Attached</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
