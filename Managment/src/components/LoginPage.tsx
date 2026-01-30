import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Shield, User, Lock, LogIn, Loader2 } from 'lucide-react';

interface LoginUser {
    _id: string;
    name: string;
    email: string;
    role: string;
}

export function LoginPage() {
    const navigate = useNavigate();
    const [mode, setMode] = useState<'select' | 'login'>('select');
    const [users, setUsers] = useState<LoginUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [formData, setFormData] = useState({ email: 'admin@isdn.com', password: 'password123' });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('http://localhost:5001/api/auth/users');
            const data = await res.json();

            if (Array.isArray(data)) {
                setUsers(data);
            } else {
                console.error('Invalid user data received:', data);
                setUsers([]);
                toast.error(data.message || 'Failed to load user selection');
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
            setUsers([]);
            toast.error('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    const handleQuickLogin = async (user: LoginUser) => {
        setIsLoggingIn(true);
        try {
            const res = await fetch('http://localhost:5001/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email, password: 'password123' })
            });
            const data = await res.json();

            if (data.success) {
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                toast.success(`Welcome back, ${data.user.name}!`);
                navigateToRole(data.user.role);
            } else {
                toast.error(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error('Login failed');
        } finally {
            setIsLoggingIn(false);
        }
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.email) {
            toast.error('Please enter your email');
            return;
        }

        setIsLoggingIn(true);
        try {
            const res = await fetch('http://localhost:5001/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (data.success) {
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                toast.success(`Welcome back, ${data.user.name}!`);
                navigateToRole(data.user.role);
            } else {
                toast.error(data.message || 'Invalid credentials');
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error('Login failed - Please check server connection');
        } finally {
            setIsLoggingIn(false);
        }
    };

    const navigateToRole = (role: string) => {
        const routes: Record<string, string> = {
            admin: '/admin',
            sales: '/sales',
            inventory: '/inventory',
            logistics: '/logistics',
            driver: '/driver',
            manager: '/manager'
        };

        if (role === 'driver') {
            window.open('http://localhost:3005', '_blank');
            // No internal navigation for driver as the dashboard is removed
            toast.info('Opening Driver App in new tab...');
        } else {
            navigate(routes[role] || '/');
        }
    };

    const getRoleColor = (role: string) => {
        const colors: Record<string, string> = {
            admin: 'bg-purple-600',
            sales: 'bg-blue-500',
            inventory: 'bg-green-500',
            logistics: 'bg-orange-500',
            driver: 'bg-cyan-500',
            manager: 'bg-indigo-600'
        };
        return colors[role] || 'bg-gray-500';
    };

    const getRoleLabel = (role: string) => {
        const labels: Record<string, string> = {
            admin: 'System Administrator',
            sales: 'Sales Representative',
            inventory: 'RDC Inventory Clerk',
            logistics: 'Logistics Officer',
            driver: 'Delivery Driver',
            manager: 'Head Office Manager'
        };
        return labels[role] || role;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Logo & Title */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 mb-4">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        ISDN <span className="text-blue-600">Distribution</span>
                    </h1>
                    <p className="text-gray-500 mt-2">Enterprise Management System</p>
                </div>

                {mode === 'select' ? (
                    <>
                        {/* Quick Login - User Selection */}
                        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <User size={20} />
                                Quick Login
                            </h2>
                            <p className="text-sm text-gray-500 mb-4">Select your account to continue</p>

                            <div className="space-y-3">
                                {users.map((user) => (
                                    <button
                                        key={user._id}
                                        onClick={() => handleQuickLogin(user)}
                                        disabled={isLoggingIn}
                                        className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group disabled:opacity-50"
                                    >
                                        <div className={`w-12 h-12 ${getRoleColor(user.role)} rounded-xl flex items-center justify-center text-white font-bold shadow-md`}>
                                            {user.name.charAt(0)}
                                        </div>
                                        <div className="flex-1 text-left">
                                            <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                {user.name}
                                            </p>
                                            <p className="text-xs text-gray-500">{getRoleLabel(user.role)}</p>
                                        </div>
                                        <LogIn size={20} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
                                    </button>
                                ))}
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => setMode('login')}
                                    className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Login with Email & Password
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Email Login Form */}
                        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Lock size={20} />
                                Login with Credentials
                            </h2>

                            <form onSubmit={handleEmailLogin} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter password (any for demo)"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoggingIn}
                                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isLoggingIn ? (
                                        <>
                                            <Loader2 size={20} className="animate-spin" />
                                            Logging in...
                                        </>
                                    ) : (
                                        <>
                                            <LogIn size={20} />
                                            Login
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="mt-6 pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => setMode('select')}
                                    className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Back to Quick Login
                                </button>
                            </div>
                        </div>
                    </>
                )}

                <p className="text-center text-sm text-gray-400 mt-6">
                    © 2026 ISDN Management System. Internal Use Only.
                </p>
            </div>
        </div>
    );
}
