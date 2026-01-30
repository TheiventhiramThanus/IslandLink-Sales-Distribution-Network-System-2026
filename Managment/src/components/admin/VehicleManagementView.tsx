import React, { useState, useEffect, useRef } from 'react';
import { vehicleService } from '../../services/api';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Search, Truck, CheckCircle, XCircle, AlertCircle, Upload, X, MapPin } from 'lucide-react';
import './VehicleManagementView.css';

export function VehicleManagementView() {
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Photo management
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        vehicleId: '',
        model: '',
        licensePlate: '',
        type: 'Van',
        status: 'Active',
        distributionCenter: 'Central'
    });

    useEffect(() => {
        fetchVehicles();
    }, []);

    // Disable scroll when modal is open
    useEffect(() => {
        if (showModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showModal]);

    const fetchVehicles = async () => {
        try {
            setLoading(true);
            const response = await vehicleService.getAll();
            setVehicles(response.data);
        } catch (error) {
            console.error('Failed to fetch vehicles:', error);
            toast.error('Failed to load vehicles');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            validateAndSetFile(file);
        }
    };

    const validateAndSetFile = (file: File) => {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            toast.error('Only JPG, PNG, and WebP images are allowed');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size must be less than 5MB');
            return;
        }
        setPhotoFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setPhotoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            validateAndSetFile(file);
        }
    };

    const removePhoto = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPhotoFile(null);
        setPhotoPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const data = new FormData();
            data.append('vehicleId', formData.vehicleId);
            data.append('model', formData.model);
            data.append('licensePlate', formData.licensePlate);
            data.append('type', formData.type);
            data.append('status', formData.status);
            data.append('distributionCenter', formData.distributionCenter);

            if (photoFile) {
                data.append('photo', photoFile);
            }

            if (editingVehicle) {
                await vehicleService.update(editingVehicle._id, data);
                toast.success('Vehicle updated successfully');
            } else {
                await vehicleService.create(data);
                toast.success('Vehicle added successfully');
            }

            setShowModal(false);
            resetForm();
            fetchVehicles();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this vehicle?')) return;
        try {
            await vehicleService.delete(id);
            toast.success('Vehicle deleted successfully');
            fetchVehicles();
        } catch (error) {
            toast.error('Failed to delete vehicle');
        }
    };

    const resetForm = () => {
        setFormData({
            vehicleId: '',
            model: '',
            licensePlate: '',
            type: 'Van',
            status: 'Active',
            distributionCenter: 'Central'
        });
        setEditingVehicle(null);
        setPhotoFile(null);
        setPhotoPreview(null);
    };

    const handleEdit = (vehicle: any) => {
        setEditingVehicle(vehicle);
        setFormData({
            vehicleId: vehicle.vehicleId,
            model: vehicle.model,
            licensePlate: vehicle.licensePlate,
            type: vehicle.type,
            status: vehicle.status,
            distributionCenter: vehicle.distributionCenter || 'Central'
        });
        setPhotoPreview(vehicle.vehiclePhoto ? `http://localhost:5001${vehicle.vehiclePhoto}` : null);
        setShowModal(true);
    };

    const filteredVehicles = vehicles.filter(v =>
        v.vehicleId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.model.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="vehicle-management">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Vehicle Management</h2>
                    <p className="text-sm text-gray-500 mt-1">Add and manage fleet vehicles</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search vehicles..."
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="flex items-center gap-2 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
                        style={{ backgroundColor: '#008000' }}
                    >
                        <Plus size={18} />
                        <span>Add Vehicle</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Photo & ID</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Model</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Plate Number</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Center</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Status</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredVehicles.map((vehicle) => (
                            <tr key={vehicle._id} className="hover:bg-gray-50 group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        {vehicle.vehiclePhoto ? (
                                            <img
                                                src={`http://localhost:5001${vehicle.vehiclePhoto}`}
                                                alt="Vehicle"
                                                className="w-10 h-10 rounded-lg object-cover border"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 bg-green-50 text-[#008000] rounded-lg flex items-center justify-center">
                                                <Truck size={20} />
                                            </div>
                                        )}
                                        <span className="text-sm font-medium text-gray-900">{vehicle.vehicleId}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700">{vehicle.model}</td>
                                <td className="px-6 py-4 text-sm text-gray-700 font-mono">{vehicle.licensePlate}</td>
                                <td className="px-6 py-4">
                                    <span className="flex items-center gap-1.5 text-xs text-gray-600">
                                        <MapPin size={14} className="text-green-500" />
                                        {vehicle.distributionCenter || 'Central'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${vehicle.status === 'Active' ? 'bg-green-100 text-green-700' :
                                        vehicle.status === 'Inactive' ? 'bg-gray-100 text-gray-700' : 'bg-orange-100 text-orange-700'
                                        }`}>
                                        {vehicle.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => handleEdit(vehicle)} className="p-1.5 text-[#008000] hover:bg-green-50 rounded-lg">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(vehicle._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingVehicle ? 'Edit Vehicle Details' : 'Add New Vehicle'}</h3>
                        </div>

                        <form onSubmit={handleSubmit} className="vehicle-form">
                            {/* Photo Upload Section */}
                            <div className="form-group">
                                <label>Vehicle Photo</label>
                                <div
                                    className={`photo-upload-area ${isDragging ? 'dragging' : ''}`}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input
                                        type="file"
                                        hidden
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept="image/*"
                                    />

                                    {photoPreview ? (
                                        <div className="photo-preview-container">
                                            <img src={photoPreview} alt="Preview" className="photo-preview" />
                                            <button type="button" className="remove-photo-btn" onClick={removePhoto}>
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="upload-placeholder">
                                            <Upload size={32} className="text-gray-400 mb-2" />
                                            <p className="text-sm font-medium text-gray-700">Click or drag to upload</p>
                                            <p className="text-xs text-gray-500 mt-1">JPG, PNG, WebP (Max 5MB)</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Vehicle ID</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Enter unique Vehicle ID"
                                    value={formData.vehicleId}
                                    onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Vehicle Model</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Toyota HiAce"
                                    value={formData.model}
                                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>License Plate Number</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Enter vehicle license plate"
                                    value={formData.licensePlate}
                                    onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label>Vehicle Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option>Van</option>
                                        <option>Truck</option>
                                        <option>Car</option>
                                        <option>Motorcycle</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Distribution Center</label>
                                    <select
                                        value={formData.distributionCenter}
                                        onChange={(e) => setFormData({ ...formData, distributionCenter: e.target.value })}
                                    >
                                        <option>North</option>
                                        <option>South</option>
                                        <option>East</option>
                                        <option>West</option>
                                        <option>Central</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Vehicle Status</label>
                                <div className="status-options">
                                    {['Active', 'Inactive', 'Under Maintenance'].map((status) => (
                                        <label key={status} className="status-label">
                                            <input
                                                type="radio"
                                                name="status"
                                                checked={formData.status === status}
                                                onChange={() => setFormData({ ...formData, status })}
                                            />
                                            <span className="text-sm">{status}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="form-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-submit">
                                    {editingVehicle ? 'Update Vehicle' : 'Save Vehicle'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
