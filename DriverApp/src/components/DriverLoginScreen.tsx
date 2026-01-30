import { useState } from 'react';
import { Screen } from '../App';
import { Mail, Lock, Eye, EyeOff, Truck, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

interface DriverLoginScreenProps {
    onNavigate: (screen: Screen) => void;
    onLoginSuccess: (driver: any) => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export function DriverLoginScreen({ onNavigate, onLoginSuccess }: DriverLoginScreenProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error('Please fill in all fields');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(`${API_URL}/drivers/login`, {
                email,
                password
            });

            toast.success('Login successful!');
            localStorage.setItem('driver', JSON.stringify(response.data.driver));
            onLoginSuccess(response.data.driver);
            onNavigate('dashboard');
        } catch (error: any) {
            const message = error.response?.data?.message || 'Login failed';
            const approvalStatus = error.response?.data?.approvalStatus;

            if (approvalStatus === 'Pending') {
                toast.warning(message, { duration: 5000 });
            } else if (approvalStatus === 'Rejected') {
                const reason = error.response?.data?.rejectionReason;
                toast.error(`${message}${reason ? `\nReason: ${reason}` : ''}`, { duration: 7000 });
            } else {
                toast.error(message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-gradient-to-br from-[#008000] via-green-700 to-green-900 overflow-y-auto">
            {/* Header */}
            <div className="pt-12 pb-8 px-6 text-center">
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl p-2">
                    <img
                        src="/isdn_logo_green.png"
                        alt="IslandLink ISDN"
                        className="w-full h-full object-contain"
                    />
                </div>
                <h1 className="text-3xl font-black text-white mb-2">Driver Login</h1>
                <p className="text-green-100 font-medium">ISDN Distribution System</p>
            </div>

            {/* Login Form */}
            <div className="flex-1 bg-white rounded-t-[40px] px-6 py-8">
                <form onSubmit={handleLogin} className="space-y-6">
                    {/* Email Field */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="driver@example.com"
                                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-[#008000] focus:outline-none transition-colors font-medium"
                            />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 border-gray-200 focus:border-[#008000] focus:outline-none transition-colors font-medium"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="bg-green-50 border-l-4 border-[#008000] p-4 rounded-lg">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-green-900">Account Approval Required</p>
                                <p className="text-xs text-green-700 mt-1">
                                    Your account must be approved by an admin before you can log in. Check your email for approval status.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Login Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-[#008000] to-green-600 text-white font-black py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Logging in...</span>
                            </div>
                        ) : (
                            'Login'
                        )}
                    </button>

                    {/* Register Link */}
                    <div className="text-center pt-4">
                        <p className="text-gray-600 text-sm">
                            Don't have an account?{' '}
                            <button
                                type="button"
                                onClick={() => onNavigate('register' as Screen)}
                                className="text-[#008000] font-bold hover:underline"
                            >
                                Register as Driver
                            </button>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
