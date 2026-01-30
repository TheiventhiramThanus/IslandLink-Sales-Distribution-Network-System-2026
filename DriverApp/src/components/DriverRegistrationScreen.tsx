import { useState, useRef } from 'react';
import { Screen } from '../App';
import {
    ArrowLeft, ArrowRight, User, Mail, Lock, Phone, MapPin,
    Truck, FileText, Upload, Eye, EyeOff, CheckCircle, Camera
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

interface DriverRegistrationScreenProps {
    onNavigate: (screen: Screen) => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export function DriverRegistrationScreen({ onNavigate }: DriverRegistrationScreenProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Form data
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        licenseNumber: '',
        nicNumber: '',
        distributionCenter: 'Central'
    });

    // File uploads (stored as base64)
    const [files, setFiles] = useState({
        driverPhoto: '',
        licensePhoto: '',
        nicPhoto: ''
    });

    // Refs for file inputs
    const driverPhotoRef = useRef<HTMLInputElement>(null);
    const licensePhotoRef = useRef<HTMLInputElement>(null);
    const nicPhotoRef = useRef<HTMLInputElement>(null);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFileUpload = (field: string, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size must be less than 5MB');
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }

        // Convert to base64
        const reader = new FileReader();
        reader.onloadend = () => {
            setFiles(prev => ({ ...prev, [field]: reader.result as string }));
            toast.success('Photo uploaded successfully');
        };
        reader.readAsDataURL(file);
    };

    const validateStep = () => {
        if (step === 1) {
            if (!formData.name || !formData.email || !formData.password || !formData.phone || !formData.address) {
                toast.error('Please fill in all personal information');
                return false;
            }
            if (formData.password.length < 6) {
                toast.error('Password must be at least 6 characters');
                return false;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                toast.error('Please enter a valid email address');
                return false;
            }
        } else if (step === 2) {
            if (!files.driverPhoto) {
                toast.error('Please upload your profile photo');
                return false;
            }
        } else if (step === 3) {
            if (!formData.licenseNumber || !files.licensePhoto || !formData.nicNumber || !files.nicPhoto) {
                toast.error('Please upload all required documents');
                return false;
            }
        }
        return true;
    };

    const handleNext = () => {
        if (validateStep()) {
            setStep(step + 1);
        }
    };

    const handleBack = () => {
        setStep(step - 1);
    };

    const handleSubmit = async () => {
        if (!validateStep()) return;

        setLoading(true);

        try {
            const registrationData = {
                ...formData,
                ...files
            };

            await axios.post(`${API_URL}/drivers/register`, registrationData);

            toast.success('Registration successful! Please check your email for approval status.');

            // Navigate to login after 2 seconds
            setTimeout(() => {
                onNavigate('login' as Screen);
            }, 2000);
        } catch (error: any) {
            const message = error.response?.data?.message || 'Registration failed';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const renderStepIndicator = () => (
        <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3].map((num) => (
                <div key={num} className="flex items-center">
                    <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${step >= num
                            ? 'bg-[#008000] text-white shadow-lg'
                            : 'bg-gray-200 text-gray-400'
                            }`}
                    >
                        {step > num ? <CheckCircle className="w-5 h-5" /> : num}
                    </div>
                    {num < 3 && (
                        <div
                            className={`w-12 h-1 mx-1 transition-all ${step > num ? 'bg-[#008000]' : 'bg-gray-200'
                                }`}
                        />
                    )}
                </div>
            ))}
        </div>
    );

    const renderStep1 = () => (
        <div className="space-y-4">
            <h2 className="text-2xl font-black text-gray-900 mb-6">Personal Information</h2>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="John Doe"
                        className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#008000] focus:outline-none"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="driver@example.com"
                        className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#008000] focus:outline-none"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="Minimum 6 characters"
                        className="w-full pl-12 pr-12 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="+94 77 123 4567"
                        className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#008000] focus:outline-none"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Address</label>
                <div className="relative">
                    <MapPin className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                    <textarea
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="Enter your full address"
                        rows={3}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#008000] focus:outline-none resize-none"
                    />
                </div>
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Distribution Center</label>
                <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                        value={formData.distributionCenter}
                        onChange={(e) => handleInputChange('distributionCenter', e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#008000] focus:outline-none appearance-none bg-white"
                    >
                        <option value="Central">Central (Main Hub)</option>
                        <option value="North">North Center</option>
                        <option value="South">South Center</option>
                        <option value="East">East Center</option>
                        <option value="West">West Center</option>
                    </select>
                </div>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-4">
            <h2 className="text-2xl font-black text-gray-900 mb-6">Profile Photo</h2>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Driver Photo</label>
                <div className="relative">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload('driverPhoto', e)}
                        className="hidden"
                        id="driverPhoto"
                        ref={driverPhotoRef}
                    />
                    <label
                        htmlFor="driverPhoto"
                        className="flex items-center justify-center w-full p-8 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#008000] transition-colors bg-white shadow-sm"
                    >
                        {files.driverPhoto ? (
                            <div className="flex flex-col items-center gap-4">
                                <img src={files.driverPhoto} alt="Driver" className="w-32 h-32 rounded-full object-cover border-4 border-[#008000] shadow-lg" />
                                <div className="text-center">
                                    <p className="text-sm text-green-600 font-bold mb-2">✓ Photo Ready</p>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setFiles(prev => ({ ...prev, driverPhoto: '' }));
                                            if (driverPhotoRef.current) driverPhotoRef.current.value = '';
                                        }}
                                        className="px-4 py-1.5 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-wider hover:bg-red-100 transition-colors"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Camera className="w-8 h-8 text-blue-500" />
                                </div>
                                <p className="text-sm font-bold text-gray-900">Click to upload photo</p>
                                <p className="text-xs text-gray-400 mt-1">Upload a clear face photo</p>
                            </div>
                        )}
                    </label>
                </div>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-4">
            <h2 className="text-2xl font-black text-gray-900 mb-6">Documents</h2>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">License Number</label>
                <div className="relative">
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={formData.licenseNumber}
                        onChange={(e) => handleInputChange('licenseNumber', e.target.value.toUpperCase())}
                        placeholder="B1234567"
                        className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#008000] focus:outline-none uppercase"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">License Photo</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload('licensePhoto', e)}
                    className="hidden"
                    id="licensePhoto"
                    ref={licensePhotoRef}
                />
                <label
                    htmlFor="licensePhoto"
                    className="flex items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#008000] transition-colors"
                >
                    {files.licensePhoto ? (
                        <div className="text-center">
                            <img src={files.licensePhoto} alt="License" className="max-h-40 mx-auto rounded-lg mb-2" />
                            <div className="flex items-center justify-between px-4">
                                <p className="text-sm text-green-600 font-semibold">✓ License uploaded</p>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setFiles(prev => ({ ...prev, licensePhoto: '' }));
                                        if (licensePhotoRef.current) licensePhotoRef.current.value = '';
                                    }}
                                    className="text-[10px] text-red-500 font-bold uppercase"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center">
                            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm font-semibold text-gray-600">Upload driving license</p>
                        </div>
                    )}
                </label>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">NIC Number</label>
                <div className="relative">
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={formData.nicNumber}
                        onChange={(e) => handleInputChange('nicNumber', e.target.value)}
                        placeholder="123456789V or 199812345678"
                        className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#008000] focus:outline-none"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">NIC Photo</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload('nicPhoto', e)}
                    className="hidden"
                    id="nicPhoto"
                    ref={nicPhotoRef}
                />
                <label
                    htmlFor="nicPhoto"
                    className="flex items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#008000] transition-colors"
                >
                    {files.nicPhoto ? (
                        <div className="text-center">
                            <img src={files.nicPhoto} alt="NIC" className="max-h-40 mx-auto rounded-lg mb-2" />
                            <div className="flex items-center justify-between px-4">
                                <p className="text-sm text-green-600 font-semibold">✓ NIC uploaded</p>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setFiles(prev => ({ ...prev, nicPhoto: '' }));
                                        if (nicPhotoRef.current) nicPhotoRef.current.value = '';
                                    }}
                                    className="text-[10px] text-red-500 font-bold uppercase"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center">
                            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm font-semibold text-gray-600">Upload NIC (both sides)</p>
                        </div>
                    )}
                </label>
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-gray-50 overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#008000] to-green-700 text-white p-6">
                <button
                    onClick={() => step === 1 ? onNavigate('login' as Screen) : handleBack()}
                    className="mb-4 flex items-center gap-2 text-white/80 hover:text-white"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-semibold">Back</span>
                </button>
                <h1 className="text-2xl font-black">Driver Registration</h1>
                <p className="text-green-100 text-sm mt-1">Step {step} of 3</p>
            </div>

            {/* Content */}
            <div className="flex-1 p-6">
                {renderStepIndicator()}

                <div className="max-w-md mx-auto">
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}

                    {/* Navigation Buttons */}
                    <div className="mt-8 flex gap-3">
                        {step < 3 ? (
                            <button
                                onClick={handleNext}
                                className="flex-1 bg-[#008000] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"
                            >
                                Next
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex-1 bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Submitting...</span>
                                    </div>
                                ) : (
                                    'Submit Application'
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
