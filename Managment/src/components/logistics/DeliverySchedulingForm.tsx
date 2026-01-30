import { useState, useEffect } from 'react';
import { logisticsService, userService, vehicleService } from '../../services/api';
import { toast } from 'sonner';
import { Truck, User as UserIcon, X, MapPin } from 'lucide-react';
import './LogisticsCommon.css';

interface DeliverySchedulingFormProps {
    order: any;
    onClose: () => void;
    onSuccess: () => void;
}

export function DeliverySchedulingForm({ order, onClose, onSuccess }: DeliverySchedulingFormProps) {
    const [drivers, setDrivers] = useState<any[]>([]);
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        driverId: '',
        vehicleId: '',
        notes: ''
    });

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            const orderCenter = order.deliveryCenter || 'Central';
            const [driversRes, vehiclesRes] = await Promise.all([
                logisticsService.getAvailableDrivers(orderCenter),
                logisticsService.getAvailableVehicles(orderCenter)
            ]);

            setDrivers(Array.isArray(driversRes.data) ? driversRes.data : []);
            setVehicles(Array.isArray(vehiclesRes.data) ? vehiclesRes.data : []);
        } catch (error) {
            toast.error('Failed to load scheduling resources');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.driverId || !formData.vehicleId) {
            toast.error('Please assign both a driver and a vehicle');
            return;
        }

        setSubmitting(true);
        try {
            const userStr = localStorage.getItem('currentUser');
            const user = userStr ? JSON.parse(userStr) : null;
            const adminId = user?._id || user?.id || 'admin_id_placeholder';

            await logisticsService.assignDriver({
                orderId: order._id,
                driverId: formData.driverId,
                vehicleId: formData.vehicleId,
                center: order.deliveryCenter || 'Central',
                adminId,
                notes: formData.notes
            });
            toast.success('Driver assigned and dispatch confirmed');
            onSuccess();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to assign driver');
        } finally {
            setSubmitting(false);
        }
    };

    const orderCenter = order.deliveryCenter || 'Central';

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                    <div>
                        <h2>Assign <span style={{ color: '#2563eb' }}>Dispatch</span></h2>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                            <span className="badge badge-active" style={{ fontSize: '0.6rem' }}>{orderCenter} Center</span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#9ca3af' }}>#{order.orderId}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="modal-close-btn">
                        <X size={18} />
                    </button>
                </header>

                <div className="modal-body">
                    {loading ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280', fontWeight: 700 }}>Checking fleet availability...</div>
                    ) : (
                        <form id="schedule-form" onSubmit={handleSubmit} className="modal-form-grid">
                            <div style={{ background: '#eff6ff', padding: '16px', borderRadius: '16px', display: 'flex', gap: '12px', border: '1px solid #dbeafe' }}>
                                <MapPin size={20} color="#2563eb" />
                                <div>
                                    <p style={{ fontSize: '0.65rem', fontWeight: 900, color: '#2563eb', textTransform: 'uppercase', marginBottom: '2px' }}>Destination</p>
                                    <p style={{ fontSize: '0.875rem', fontWeight: 800, color: '#111827' }}>{order.customer}</p>
                                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280' }}>{order.address}</p>
                                </div>
                            </div>

                            <div className="modal-form-group">
                                <label className="modal-form-label">
                                    <UserIcon size={14} color="#2563eb" /> Select Driver ({orderCenter})
                                </label>
                                <select
                                    className="modal-input-field"
                                    value={formData.driverId}
                                    onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                                    disabled={drivers.length === 0}
                                >
                                    <option value="">{drivers.length > 0 ? 'Choose an available driver...' : 'No drivers available'}</option>
                                    {drivers.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                                </select>
                            </div>

                            <div className="modal-form-group">
                                <label className="modal-form-label">
                                    <Truck size={14} color="#2563eb" /> Select Vehicle ({orderCenter})
                                </label>
                                <select
                                    className="modal-input-field"
                                    value={formData.vehicleId}
                                    onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                                    disabled={vehicles.length === 0}
                                >
                                    <option value="">{vehicles.length > 0 ? 'Choose an available vehicle...' : 'No vehicles available'}</option>
                                    {vehicles.map(v => <option key={v._id} value={v._id}>{v.model} - {v.licensePlate}</option>)}
                                </select>
                            </div>

                            <div className="modal-form-group">
                                <label className="modal-form-label">Dispatch Notes</label>
                                <textarea
                                    className="modal-input-field"
                                    style={{ height: '100px', resize: 'none' }}
                                    placeholder="Add delivery instructions..."
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>
                        </form>
                    )}
                </div>

                <footer className="modal-footer">
                    <button type="button" onClick={onClose} className="modal-btn modal-btn-cancel">Cancel</button>
                    <button
                        type="submit"
                        form="schedule-form"
                        className="modal-btn modal-btn-confirm"
                        disabled={submitting || drivers.length === 0 || vehicles.length === 0}
                    >
                        {submitting ? 'Assigning...' : 'Confirm Assignment'}
                    </button>
                </footer>
            </div>
        </div>
    );
}
