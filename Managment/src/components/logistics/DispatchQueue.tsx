import { useState, useEffect } from 'react';
import {
    Search,
    Info,
    Truck,
    User,
    X,
    Clock,
    Package,
    CheckCircle2,
    Loader2
} from 'lucide-react';
import { logisticsService } from '../../services/api';
import { toast } from 'sonner';
import './DispatchQueue.css';
import './LogisticsCommon.css';

interface DispatchQueueProps {
    onSuccess?: () => void;
}

export function DispatchQueue({ onSuccess }: DispatchQueueProps) {
    const [orders, setOrders] = useState<any[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [centerFilter, setCenterFilter] = useState('All');
    const [priorityFilter, setPriorityFilter] = useState('All');
    const [dateFilter, setDateFilter] = useState('');

    // Modals
    const [viewOrder, setViewOrder] = useState<any>(null);
    const [assignOrder, setAssignOrder] = useState<any>(null);

    // Assignment Form
    const [availableDrivers, setAvailableDrivers] = useState<any[]>([]);
    const [availableVehicles, setAvailableVehicles] = useState<any[]>([]);
    const [selectedDriver, setSelectedDriver] = useState('');
    const [selectedVehicle, setSelectedVehicle] = useState('');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [loadingResources, setLoadingResources] = useState(false);

    useEffect(() => {
        fetchDispatchQueue();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [searchTerm, centerFilter, priorityFilter, dateFilter, orders]);

    const fetchDispatchQueue = async () => {
        try {
            setLoading(true);
            const res = await logisticsService.getDispatchQueue();
            setOrders(res.data);
            setFilteredOrders(res.data);
        } catch (error) {
            toast.error('Failed to fetch dispatch queue');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let result = orders;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(o =>
                o.orderId.toLowerCase().includes(term) ||
                o.customer.toLowerCase().includes(term)
            );
        }

        if (centerFilter !== 'All') {
            result = result.filter(o => o.deliveryCenter === centerFilter);
        }

        if (priorityFilter !== 'All') {
            result = result.filter(o => o.priority === priorityFilter);
        }

        if (dateFilter) {
            result = result.filter(o => o.orderDate.startsWith(dateFilter));
        }

        setFilteredOrders(result);
    };

    const handleOpenAssign = async (order: any) => {
        setAssignOrder(order);
        setLoadingResources(true);
        setSelectedDriver('');
        setSelectedVehicle('');
        try {
            const [driversRes, vehiclesRes] = await Promise.all([
                logisticsService.getAvailableDrivers(order.deliveryCenter),
                logisticsService.getAvailableVehicles(order.deliveryCenter)
            ]);
            setAvailableDrivers(Array.isArray(driversRes.data) ? driversRes.data : []);
            setAvailableVehicles(Array.isArray(vehiclesRes.data) ? vehiclesRes.data : []);
        } catch (error) {
            toast.error('Failed to load available resources');
        } finally {
            setLoadingResources(false);
        }
    };

    const handleConfirmAssignment = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!selectedDriver || !selectedVehicle) {
            toast.error('Please select both a driver and a vehicle');
            return;
        }

        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const adminId = currentUser.id || currentUser._id;

        if (!adminId) {
            toast.error('User session expired. Please login again.');
            return;
        }

        try {
            setSubmitting(true);
            await logisticsService.assignDriver({
                orderId: assignOrder._id,
                driverId: selectedDriver,
                vehicleId: selectedVehicle,
                center: assignOrder.deliveryCenter,
                adminId: adminId,
                notes: notes
            });

            toast.success('Assignment confirmed successfully!');
            setAssignOrder(null);
            fetchDispatchQueue();
            if (onSuccess) onSuccess();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Assignment failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '5rem', textAlign: 'center' }}>
                <Loader2 className="animate-spin" size={40} color="#008000" style={{ margin: '0 auto 1rem' }} />
                <p style={{ color: '#6b7280', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem' }}>Syncing Queue...</p>
            </div>
        );
    }

    return (
        <div className="logistics-view-container">
            <header className="view-header">
                <div className="view-title">
                    <h1>Dispatch <span style={{ color: '#008000' }}>Queue</span></h1>
                    <p>Total pending dispatches: <span style={{ color: '#111827', fontWeight: 900 }}>{filteredOrders.length}</span></p>
                </div>
            </header>

            <div className="view-filters">
                <div className="filter-group">
                    <label className="filter-label">Search</label>
                    <div className="filter-control-wrap">
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            className="filter-input has-icon"
                            placeholder="Order ID or Customer..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
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
                    <label className="filter-label">Priority</label>
                    <select className="filter-input" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                        <option value="All">All Priorities</option>
                        <option value="High">High</option>
                        <option value="Normal">Normal</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label className="filter-label">Date</label>
                    <input type="date" className="filter-input" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
                </div>
            </div>

            <div className="table-responsive-wrapper">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Order Details</th>
                            <th>Items</th>
                            <th>Priority</th>
                            <th>Center</th>
                            <th>Total</th>
                            <th style={{ textAlign: 'right' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.map(order => (
                            <tr key={order._id}>
                                <td>
                                    <div className="flex flex-col">
                                        <span className="badge badge-active w-fit mb-1">#{order.orderId}</span>
                                        <span className="text-sm font-black text-gray-900">{order.customer}</span>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase truncate max-w-[200px]">{order.address}</span>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Package size={14} color="#94a3b8" />
                                        <span className="text-xs font-bold text-gray-600">{order.items?.length || 0} Items</span>
                                    </div>
                                </td>
                                <td>
                                    <span className={`badge ${order.priority === 'High' ? 'badge-rejected' : 'badge-approved'}`}>
                                        {order.priority}
                                    </span>
                                </td>
                                <td>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#6b7280', textTransform: 'uppercase' }}>{order.deliveryCenter}</span>
                                </td>
                                <td>
                                    <span style={{ fontSize: '0.875rem', fontWeight: 900, color: '#111827' }}>${order.totalAmount?.toLocaleString()}</span>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                        <button onClick={() => setViewOrder(order)} className="modal-close-btn">
                                            <Info size={18} />
                                        </button>
                                        <button onClick={() => handleOpenAssign(order)} className="modal-btn modal-btn-confirm" style={{ height: '36px', padding: '0 16px', fontSize: '0.65rem' }}>
                                            Assign
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredOrders.length === 0 && (
                    <div style={{ padding: '5rem', textAlign: 'center' }}>
                        <CheckCircle2 color="#e5e7eb" size={48} style={{ margin: '0 auto 1rem' }} />
                        <p style={{ color: '#9ca3af', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Queue is Clear</p>
                    </div>
                )}
            </div>

            <div className="mobile-driver-list">
                {filteredOrders.map(order => (
                    <div key={order._id} className="driver-card">
                        <div className="card-header">
                            <div>
                                <span className="badge badge-active">#{order.orderId}</span>
                                <h4 style={{ fontSize: '1rem', fontWeight: 900, margin: '8px 0 2px' }}>{order.customer}</h4>
                                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af' }}>{order.address}</p>
                            </div>
                            <span className={`badge ${order.priority === 'High' ? 'badge-rejected' : 'badge-approved'}`}>{order.priority}</span>
                        </div>
                        <div className="card-body">
                            <div className="card-body-item">
                                <span className="card-label">Items</span>
                                <span className="card-value">{order.items?.length || 0}</span>
                            </div>
                            <div className="card-body-item">
                                <span className="card-label">Center</span>
                                <span className="card-value" style={{ textTransform: 'uppercase' }}>{order.deliveryCenter}</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '1rem' }}>
                            <button onClick={() => setViewOrder(order)} className="modal-btn modal-btn-cancel" style={{ height: '40px' }}>Details</button>
                            <button onClick={() => handleOpenAssign(order)} className="modal-btn modal-btn-confirm" style={{ height: '40px' }}>Assign</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal: View Details */}
            {viewOrder && (
                <div className="modal-overlay" onClick={() => setViewOrder(null)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <header className="modal-header">
                            <h2>Order <span style={{ color: '#008000' }}>Details</span></h2>
                            <button onClick={() => setViewOrder(null)} className="modal-close-btn"><X size={18} /></button>
                        </header>
                        <div className="modal-body">
                            <section style={{ marginBottom: '2rem' }}>
                                <p className="card-label" style={{ marginBottom: '1rem' }}>Order Summary</p>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                    <div className="info-block">
                                        <label>Order ID</label>
                                        <p>#{viewOrder.orderId}</p>
                                    </div>
                                    <div className="info-block">
                                        <label>Priority</label>
                                        <p>{viewOrder.priority}</p>
                                    </div>
                                    <div className="info-block">
                                        <label>Customer Name</label>
                                        <p>{viewOrder.customer}</p>
                                    </div>
                                    <div className="info-block">
                                        <label>Contact/Address</label>
                                        <p>{viewOrder.address}</p>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <p className="card-label" style={{ marginBottom: '1rem' }}>Package Contents ({viewOrder.items?.length})</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {viewOrder.items?.map((item: any, idx: number) => (
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f9fafb', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                                            <div>
                                                <p style={{ fontSize: '0.875rem', fontWeight: 800 }}>{item.product?.name || 'Product'}</p>
                                                <p style={{ fontSize: '0.7rem', fontWeight: 600, color: '#9ca3af' }}>QUANTITY: {item.quantity}</p>
                                            </div>
                                            <p style={{ fontSize: '0.875rem', fontWeight: 900 }}>${(item.price * item.quantity).toLocaleString()}</p>
                                        </div>
                                    ))}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '2px dashed #f1f5f9' }}>
                                        <p style={{ fontSize: '0.75rem', fontWeight: 900, color: '#9ca3af', textTransform: 'uppercase' }}>Grand Total</p>
                                        <p style={{ fontSize: '1.25rem', fontWeight: 900, color: '#008000' }}>${viewOrder.totalAmount?.toLocaleString()}</p>
                                    </div>
                                </div>
                            </section>
                        </div>
                        <footer className="modal-footer">
                            <button onClick={() => setViewOrder(null)} className="modal-btn modal-btn-cancel">Close</button>
                            <button
                                onClick={() => { setAssignOrder(viewOrder); setViewOrder(null); handleOpenAssign(viewOrder); }}
                                className="modal-btn modal-btn-confirm"
                            >
                                Assign Now
                            </button>
                        </footer>
                    </div>
                </div>
            )}

            {/* Modal: Assign Dispatch */}
            {assignOrder && (
                <div className="modal-overlay" onClick={() => !submitting && setAssignOrder(null)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <header className="modal-header">
                            <h2>Dispatch <span style={{ color: '#008000' }}>Assignment</span></h2>
                            <button onClick={() => !submitting && setAssignOrder(null)} className="modal-close-btn"><X size={18} /></button>
                        </header>
                        <div className="modal-body">
                            <div style={{ background: '#eff6ff', padding: '20px', borderRadius: '20px', border: '1px solid #dbeafe', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <span className="badge badge-active">#{assignOrder.orderId}</span>
                                    <span className="badge badge-pending" style={{ background: '#008000', color: 'white' }}>{assignOrder.deliveryCenter} Center</span>
                                </div>
                                <h4 style={{ fontSize: '1.125rem', fontWeight: 900, color: '#111827' }}>{assignOrder.customer}</h4>
                                <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#008000', marginTop: '4px' }}>{assignOrder.address}</p>
                            </div>

                            {loadingResources ? (
                                <div style={{ textAlign: 'center', padding: '2rem' }}>
                                    <Loader2 className="animate-spin" size={24} color="#008000" style={{ margin: '0 auto 0.5rem' }} />
                                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280' }}>LOADING RESOURCES...</p>
                                </div>
                            ) : (
                                <form id="assignment-modal-form" onSubmit={handleConfirmAssignment} className="modal-form-grid">
                                    <div className="modal-form-group">
                                        <label className="modal-form-label"><User size={14} color="#008000" /> Select Driver</label>
                                        <select
                                            className="modal-input-field"
                                            value={selectedDriver}
                                            onChange={e => setSelectedDriver(e.target.value)}
                                            disabled={availableDrivers.length === 0}
                                        >
                                            <option value="">{availableDrivers.length > 0 ? '-- Choose Available Driver --' : 'No Drivers in this Center'}</option>
                                            {availableDrivers.map(d => <option key={d._id} value={d._id}>{d.name} ({d.phone})</option>)}
                                        </select>
                                    </div>

                                    <div className="modal-form-group">
                                        <label className="modal-form-label"><Truck size={14} color="#008000" /> Select Vehicle</label>
                                        <select
                                            className="modal-input-field"
                                            value={selectedVehicle}
                                            onChange={e => setSelectedVehicle(e.target.value)}
                                            disabled={availableVehicles.length === 0}
                                        >
                                            <option value="">{availableVehicles.length > 0 ? '-- Choose Available Vehicle --' : 'No Vehicles in this Center'}</option>
                                            {availableVehicles.map(v => <option key={v._id} value={v._id}>{v.model} - {v.licensePlate}</option>)}
                                        </select>
                                    </div>

                                    <div className="modal-form-group">
                                        <label className="modal-form-label"><Clock size={14} color="#008000" /> Dispatch Notes</label>
                                        <textarea
                                            className="modal-input-field"
                                            placeholder="Special instructions for driver..."
                                            value={notes}
                                            onChange={e => setNotes(e.target.value)}
                                            style={{ height: '80px', resize: 'none' }}
                                        />
                                    </div>
                                </form>
                            )}
                        </div>
                        <footer className="modal-footer">
                            <button type="button" onClick={() => setAssignOrder(null)} className="modal-btn modal-btn-cancel" disabled={submitting}>Cancel</button>
                            <button
                                type="submit"
                                form="assignment-modal-form"
                                className="modal-btn modal-btn-confirm"
                                disabled={submitting || !selectedDriver || !selectedVehicle}
                            >
                                {submitting ? 'Confirming...' : 'Assign Dispatch'}
                            </button>
                        </footer>
                    </div>
                </div>
            )}
        </div>
    );
}
