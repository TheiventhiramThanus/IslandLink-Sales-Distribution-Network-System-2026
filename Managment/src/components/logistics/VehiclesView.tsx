import { useState, useEffect } from 'react';
import { Search, Truck, Info, X, Activity } from 'lucide-react';
import { vehicleService } from '../../services/api';
import { toast } from 'sonner';
import './LogisticsCommon.css';

export function VehiclesView() {
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [centerFilter, setCenterFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedVehicle, setSelectedVehicle] = useState<any>(null);

    useEffect(() => {
        fetchVehicles();
    }, [centerFilter, statusFilter]);

    const fetchVehicles = async () => {
        try {
            setLoading(true);
            const res = await vehicleService.getAll({
                center: centerFilter,
                status: statusFilter,
                search: searchTerm
            });
            setVehicles(res.data);
        } catch (error) {
            toast.error('Failed to fetch vehicles');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchVehicles();
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'Active': return 'badge-approved';
            case 'Inactive': return 'badge-inactive';
            case 'Under Maintenance': return 'badge-rejected';
            default: return '';
        }
    };

    return (
        <div className="logistics-view-container">
            <header className="view-header">
                <div className="view-title">
                    <h1>Vehicle <span style={{ color: '#2563eb' }}>Fleet</span></h1>
                    <p>Managing {vehicles.length} distribution vehicles</p>
                </div>
            </header>

            <div className="view-filters">
                <form className="filter-group" onSubmit={handleSearch}>
                    <label className="filter-label">Search</label>
                    <div className="filter-control-wrap">
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            className="filter-input has-icon"
                            placeholder="Search ID, Model, or Plate..."
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
                    <label className="filter-label">Status</label>
                    <select className="filter-input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="All">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Under Maintenance">Maintenance</option>
                    </select>
                </div>
            </div>

            <div className="table-responsive-wrapper">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Vehicle</th>
                            <th>Plate Number</th>
                            <th>Center</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'right' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vehicles.map(v => (
                            <tr key={v._id}>
                                <td>
                                    <div className="avatar-cell">
                                        <div className="thumbnail-box">
                                            {v.vehiclePhoto ? (
                                                <img src={v.vehiclePhoto} alt={v.model} />
                                            ) : (
                                                <Truck size={24} color="#94a3b8" />
                                            )}
                                        </div>
                                        <div className="driver-info-main">
                                            <p>{v.model}</p>
                                            <p>ID: {v.vehicleId}</p>
                                        </div>
                                    </div>
                                </td>
                                <td><span className="card-value" style={{ fontFamily: 'monospace' }}>{v.licensePlate}</span></td>
                                <td><span className="card-value" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>{v.distributionCenter}</span></td>
                                <td><span className="card-value">{v.type}</span></td>
                                <td><span className={`badge ${getStatusClass(v.status)}`}>{v.status}</span></td>
                                <td style={{ textAlign: 'right' }}>
                                    <button onClick={() => setSelectedVehicle(v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                                        <Info size={20} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mobile-driver-list">
                {vehicles.map(v => (
                    <div key={v._id} className="driver-card">
                        <div className="card-header">
                            <div className="avatar-cell">
                                <div className="thumbnail-box">
                                    {v.vehiclePhoto ? <img src={v.vehiclePhoto} alt={v.model} /> : <Truck size={24} color="#94a3b8" />}
                                </div>
                                <div className="driver-info-main">
                                    <p>{v.model}</p>
                                    <p>{v.distributionCenter} Center</p>
                                </div>
                            </div>
                            <span className={`badge ${getStatusClass(v.status)}`}>{v.status}</span>
                        </div>
                        <div className="card-body">
                            <div className="card-body-item">
                                <span className="card-label">Plate No</span>
                                <span className="card-value">{v.licensePlate}</span>
                            </div>
                            <div className="card-body-item">
                                <span className="card-label">Type</span>
                                <span className="card-value">{v.type}</span>
                            </div>
                        </div>
                        <button className="view-btn-mobile" onClick={() => setSelectedVehicle(v)}>View Vehicle Details</button>
                    </div>
                ))}
            </div>

            {selectedVehicle && (
                <div className="modal-overlay" onClick={() => setSelectedVehicle(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setSelectedVehicle(null)}><X size={20} /></button>

                        <div className="modal-photo-hero">
                            {selectedVehicle.vehiclePhoto ? (
                                <img src={selectedVehicle.vehiclePhoto} alt={selectedVehicle.model} />
                            ) : (
                                <Truck size={64} color="#2563eb" />
                            )}
                        </div>

                        <div className="modal-profile-header">
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827' }}>{selectedVehicle.model}</h2>
                            <span className={`badge ${getStatusClass(selectedVehicle.status)}`} style={{ marginTop: '0.5rem' }}>{selectedVehicle.status}</span>
                        </div>

                        <div className="modal-info-grid">
                            <div className="info-block">
                                <label>Vehicle ID</label>
                                <p>{selectedVehicle.vehicleId}</p>
                            </div>
                            <div className="info-block">
                                <label>License Plate</label>
                                <p>{selectedVehicle.licensePlate}</p>
                            </div>
                            <div className="info-block">
                                <label>Distribution Center</label>
                                <p>{selectedVehicle.distributionCenter}</p>
                            </div>
                            <div className="info-block">
                                <label>Vehicle Type</label>
                                <p>{selectedVehicle.type}</p>
                            </div>
                            <div className="info-block">
                                <label>Registered On</label>
                                <p>{new Date(selectedVehicle.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div className="doc-section">
                            <h3 style={{ fontSize: '0.875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Activity size={18} color="#2563eb" /> Maintenance History
                            </h3>
                            <p style={{ fontSize: '0.875rem', color: '#9ca3af', fontStyle: 'italic' }}>No recent maintenance logs for this vehicle.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
