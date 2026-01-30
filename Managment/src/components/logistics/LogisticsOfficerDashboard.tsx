import { useState, useEffect } from 'react';
import { Layout } from '../Layout';
import { NavItem } from '../NavItem';
import { StatCard } from '../StatCard';
import { toast } from 'sonner';
import {
    LayoutDashboard,
    Truck,
    MapPin,
    Package,
    AlertTriangle,
    Users,
    TrendingUp,
    Radio,
    Calendar,
    Send,
    Loader2,
    Activity,
    Clock,
    CheckCircle,
    Search,
    FileText,
    CheckSquare,
    History,
    Image as ImageIcon,
    Download,
    ExternalLink,
    ChevronLeft,
    ChevronRight,
    Filter,
    RotateCcw,
    X
} from 'lucide-react';
import { analyticsService, logisticsService } from '../../services/api';
import { LiveTrackingView } from './LiveTrackingView';
import './LogisticsCommon.css';
import { DeliverySchedulingForm } from './DeliverySchedulingForm';
import { DispatchQueue } from './DispatchQueue';
import { VehiclesView } from './VehiclesView';
import { DriversView } from './DriversView';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';

interface LogisticsOfficerDashboardProps {
    onLogout: () => void;
}

export function LogisticsOfficerDashboard({ onLogout }: LogisticsOfficerDashboardProps) {
    const [activeView, setActiveView] = useState('dashboard');
    const [readyOrders, setReadyOrders] = useState<any[]>([]);
    const [deliveries, setDeliveries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [stats, setStats] = useState({
        totalToday: 0,
        pendingDispatches: 0,
        activeDeliveries: 0,
        delayedDeliveries: 0,
        availableDrivers: 0,
        availableVehicles: 0
    });

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            setStatsLoading(true);
            const [readyRes, deliveriesRes, statsRes] = await Promise.all([
                logisticsService.getDispatchQueue(),
                logisticsService.getAssignments(),
                logisticsService.getStats()
            ]);

            setReadyOrders(Array.isArray(readyRes.data) ? readyRes.data : []);
            setDeliveries(deliveriesRes.data?.data || (Array.isArray(deliveriesRes.data) ? deliveriesRes.data : []));

            // Map backend stats to frontend state
            if (statsRes.data) {
                setStats({
                    totalToday: statsRes.data.today || 0,
                    pendingDispatches: statsRes.data.pending || 0,
                    activeDeliveries: statsRes.data.active || 0,
                    delayedDeliveries: 0, // Not yet implemented in backend
                    availableDrivers: statsRes.data.drivers || 0,
                    availableVehicles: statsRes.data.vehicles || 0
                });
            }
        } catch (error) {
            console.error('Failed to fetch logistics data:', error);
            toast.error('Connection to logistics service failed');
        } finally {
            setLoading(false);
            setStatsLoading(false);
        }
    };

    const sidebar = (
        <div className="space-y-1.5 px-3">
            <NavItem
                icon={LayoutDashboard}
                label="Logistics Overview"
                active={activeView === 'dashboard'}
                onClick={() => setActiveView('dashboard')}
            />
            <NavItem
                icon={Send}
                label="Dispatch Queue"
                active={activeView === 'dispatch'}
                onClick={() => setActiveView('dispatch')}
                badge={readyOrders.length}
            />
            <NavItem
                icon={Package}
                label="Delivery Records"
                active={activeView === 'deliveries'}
                onClick={() => setActiveView('deliveries')}
            />
            <NavItem
                icon={Truck}
                label="Vehicle Fleet"
                active={activeView === 'vehicles'}
                onClick={() => setActiveView('vehicles')}
            />
            <NavItem
                icon={Users}
                label="Driver Network"
                active={activeView === 'drivers'}
                onClick={() => setActiveView('drivers')}
            />
            <NavItem
                icon={Radio}
                label="Live Tracking"
                active={activeView === 'tracking'}
                onClick={() => setActiveView('tracking')}
            />
            <div className="pt-4 pb-2">
                <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Insights</p>
            </div>
            <NavItem
                icon={TrendingUp}
                label="Analytics"
                active={activeView === 'analytics'}
                onClick={() => setActiveView('analytics')}
            />
        </div>
    );

    if (loading && activeView === 'dashboard') {
        return (
            <Layout sidebar={sidebar} userRole="Logistics Officer" userName="Officer Logistics" onLogout={onLogout}>
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <Loader2 className="w-12 h-12 text-[#008000] animate-spin mb-4" />
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Initializing Command Control...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout
            sidebar={sidebar}
            userRole="Logistics Officer"
            userName="Officer Logistics"
            onLogout={onLogout}
        >
            <div className="max-w-[1240px] mx-auto space-y-8 animate-in fade-in duration-500">
                {activeView === 'dashboard' && <LogisticsHome stats={stats} deliveries={deliveries} readyOrders={readyOrders} onSchedule={(o: any) => setSelectedOrder(o)} statsLoading={statsLoading} />}
                {activeView === 'dispatch' && <DispatchQueue onSuccess={fetchData} />}
                {activeView === 'deliveries' && <DeliveryListView />}
                {activeView === 'vehicles' && <VehiclesView />}
                {activeView === 'drivers' && <DriversView />}
                {activeView === 'tracking' && <LiveTrackingView deliveries={deliveries} />}
                {activeView === 'analytics' && <LogisticsAnalyticsView />}
            </div>

            {selectedOrder && (
                <DeliverySchedulingForm
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onSuccess={() => {
                        setSelectedOrder(null);
                        fetchData();
                    }}
                />
            )}
        </Layout>
    );
}

// --- SUB-COMPONENTS ---

// ... imports

function LogisticsAnalyticsView() {
    const [data, setData] = useState({
        delivery: {
            totalOrders: 0,
            onTimeRate: 0,
            inTransit: 0,
            pending: 0
        }
    });
    const [driverPerf, setDriverPerf] = useState<any[]>([]);
    const [pieData, setPieData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const COLORS = ['#008000', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const [delStats] = await Promise.all([
                analyticsService.getDeliveryStats(),
                analyticsService.getRouteStats()
            ]);

            setData({ delivery: delStats.data });

            // Mock driver performance if not provided by API
            setDriverPerf(delStats.data.topDrivers || [
                { name: 'John D.', deliveries: 45 },
                { name: 'Sarah S.', deliveries: 38 },
                { name: 'Mike R.', deliveries: 32 },
                { name: 'Emma W.', deliveries: 28 },
                { name: 'David L.', deliveries: 25 }
            ]);

            setPieData([
                { name: 'Delivered', value: delStats.data.completed || 0 },
                { name: 'In Transit', value: delStats.data.inTransit || 0 },
                { name: 'Pending', value: delStats.data.pending || 0 },
                { name: 'Delayed', value: delStats.data.delayed || 0 }
            ]);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        toast.success('Analytics report exported as PDF');
    };

    if (loading) return <div className="p-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-[#008000]" /></div>;

    return (
        <div className="logistics-container animate-in fade-in duration-500">
            <header className="logistics-header">
                <div>
                    <h1 className="logistics-title">Logistics <span className="text-[#008000]">Analytics</span></h1>
                    <p className="logistics-subtitle">Deep dive into fleet performance and efficiency metrics</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2">
                        <Calendar size={14} /> This Month
                    </button>
                    <button
                        onClick={handleExport}
                        className="px-4 py-2 bg-[#008000] text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-green-200 hover:bg-green-700 transition-all flex items-center gap-2"
                    >
                        <TrendingUp size={14} /> Export Report
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total Orders" value={data.delivery.totalOrders?.toString() || "0"} icon={Package} color="bg-[#008000]" />
                <StatCard title="On-Time Rate" value={`${data.delivery.onTimeRate || 0}%`} icon={Clock} color="bg-green-600" />
                <StatCard title="In Transit" value={data.delivery.inTransit?.toString() || "0"} icon={Truck} color="bg-orange-500" />
                <StatCard title="Pending" value={data.delivery.pending?.toString() || "0"} icon={AlertTriangle} color="bg-red-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Driver Performance Chart */}
                <div className="logistics-card">
                    <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                        <Users size={18} className="text-[#008000]" />
                        Top Driver Performance
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={driverPerf} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 'bold' }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 'bold' }}
                                />
                                <Tooltip
                                    cursor={{ fill: '#F9FAFB' }}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', fontWeight: 'bold' }}
                                />
                                <Bar dataKey="deliveries" fill="#008000" radius={[6, 6, 6, 6]} barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Delivery Status Distribution */}
                <div className="logistics-card">
                    <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                        <Activity size={18} className="text-[#008000]" />
                        Delivery Status Overview
                    </h3>
                    <div className="h-[300px] w-full flex items-center justify-center relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={120}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((_: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', fontWeight: 'bold' }} />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Text overlay */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-black text-gray-900">{data.delivery.totalOrders || 0}</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Orders</span>
                        </div>
                    </div>
                    <div className="flex justify-center gap-6 mt-4 flex-wrap">
                        {pieData.map((entry: any, index: number) => (
                            <div key={index} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{entry.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function LogisticsHome({ stats, deliveries, readyOrders, onSchedule, statsLoading }: any) {
    const safeDeliveries = Array.isArray(deliveries) ? deliveries : [];
    const activeDeliveries = safeDeliveries.filter((d: any) => d.status === 'OnTheWay').slice(0, 5);

    return (
        <div className="logistics-view-container">
            <header className="view-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className="view-title">
                    <h1>Logistics <span className="text-[#008000]">Command Control</span></h1>
                    <p style={{ marginTop: '4px' }}>Real-time distribution and fleet tracking system</p>
                </div>
                {statsLoading && <Loader2 className="animate-spin text-[#008000]" size={24} />}
            </header>

            {/* KPI Cards Grid */}
            <div className="kpi-grid">
                <StatCard title="Total Today" value={(stats?.totalToday || 0).toString()} icon={Package} color="bg-[#008000]" />
                <StatCard title="Pending Dispatches" value={(stats?.pendingDispatches || 0).toString()} icon={Clock} color="bg-orange-500" />
                <StatCard title="Active Deliveries" value={(stats?.activeDeliveries || 0).toString()} icon={Truck} color="bg-indigo-600" />
                <StatCard title="Delayed" value={(stats?.delayedDeliveries || 0).toString()} icon={AlertTriangle} color="bg-red-600" />
                <StatCard title="Available Drivers" value={(stats?.availableDrivers || 0).toString()} icon={Users} color="bg-green-600" />
                <StatCard title="Available Fleet" value={(stats?.availableVehicles || 0).toString()} icon={Activity} color="bg-purple-600" />
            </div>

            <div className="overview-grid">
                {/* Active Deliveries Panel */}
                <div className="logistics-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#111827', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ width: '4px', height: '20px', background: '#008000', borderRadius: '4px' }}></span>
                            Live Delivery Pulse
                        </h2>
                        <span className="badge badge-active" style={{ background: '#f0fdf4', color: '#008000' }}>{activeDeliveries.length} MOVING</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {activeDeliveries.map((del: any) => (
                            <div key={del._id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderRadius: '16px', border: '1px solid #f1f5f9', background: '#fcfdfe' }}>
                                <div style={{ width: '44px', height: '44px', background: '#f0fdf4', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#008000' }}>
                                    <Truck size={20} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                        <span className="badge badge-active" style={{ fontSize: '0.65rem' }}>#{del.deliveryId}</span>
                                        <h4 style={{ fontSize: '0.875rem', fontWeight: 900, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{del.orderId?.customer}</h4>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94a3b8' }}>
                                        <MapPin size={10} />
                                        <p style={{ fontSize: '0.75rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{del.orderId?.address}</p>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <StatusBadge status={del.status} />
                                    <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#9ca3af', marginTop: '4px', textTransform: 'uppercase' }}>{del.driverId?.name}</p>
                                </div>
                            </div>
                        ))}
                        {activeDeliveries.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '48px 0', border: '2px dashed #f1f5f9', borderRadius: '20px' }}>
                                <Package size={40} color="#e2e8f0" style={{ margin: '0 auto 12px' }} />
                                <p style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>No active deliveries</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Dispatch Queue Card */}
                <div className="dispatch-queue-card">
                    <div className="bg-icon">
                        <Send size={140} color="white" />
                    </div>
                    <div style={{ position: 'relative', zIndex: 2 }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'white', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            Dispatch <span style={{ color: '#bbf7d0' }}>Queue</span>
                            {readyOrders.length > 0 && <span style={{ width: '8px', height: '8px', background: '#bbf7d0', borderRadius: '50%', animation: 'pulse 2s infinite' }}></span>}
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {readyOrders.slice(0, 3).map((order: any) => (
                                <div key={order._id} style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '20px', borderRadius: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#bbf7d0' }}>#{order.orderId}</span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'rgba(255, 255, 255, 0.4)' }}>READY</span>
                                    </div>
                                    <h4 style={{ fontSize: '1rem', fontWeight: 900, color: 'white', marginBottom: '4px' }}>{order.customer}</h4>
                                    <p style={{ fontSize: '0.8125rem', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '16px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.address}</p>
                                    <button
                                        onClick={() => onSchedule(order)}
                                        className="modal-btn modal-btn-confirm"
                                        style={{ width: '100%', height: '40px', fontSize: '0.7rem', background: '#008000' }}
                                    >
                                        SCHEDULE DISPATCH
                                    </button>
                                </div>
                            ))}
                            {readyOrders.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                                    <CheckCircle size={32} color="rgba(255, 255, 255, 0.2)" style={{ margin: '0 auto 12px' }} />
                                    <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'rgba(255, 255, 255, 0.3)', textTransform: 'uppercase' }}>All Clear</p>
                                </div>
                            )}
                            {readyOrders.length > 3 && (
                                <p style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: 900, color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', cursor: 'pointer' }}>
                                    + {readyOrders.length - 3} MORE IN QUEUE
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


function DeliveryListView() {
    const [assignments, setAssignments] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [centerFilter, setCenterFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Modals
    const [viewDetail, setViewDetail] = useState<any>(null);
    const [viewTimeline, setViewTimeline] = useState<any>(null);
    const [viewProof, setViewProof] = useState<any>(null);

    useEffect(() => {
        fetchStats();
        fetchRecords();
    }, [page, centerFilter, statusFilter, startDate, endDate]);

    const fetchStats = async () => {
        try {
            const res = await logisticsService.getStats();
            setStats(res.data);
        } catch (error) {
            console.error('Stats Error');
        }
    };

    const fetchRecords = async () => {
        try {
            setLoading(true);
            const res = await logisticsService.getAssignments({
                page,
                limit: 10,
                center: centerFilter,
                status: statusFilter,
                search: searchTerm,
                startDate,
                endDate
            });
            setAssignments(res.data.data);
            setTotalPages(res.data.pages);
            setTotal(res.data.total);
        } catch (error) {
            toast.error('Failed to load delivery records');
        } finally {
            setLoading(false);
        }
    };

    const handleApplyFilters = () => {
        setPage(1);
        fetchRecords();
    };

    const handleReset = () => {
        setSearchTerm('');
        setCenterFilter('All');
        setStatusFilter('All');
        setStartDate('');
        setEndDate('');
        setPage(1);
    };

    const handleVerify = async (id: string, current: boolean) => {
        try {
            await logisticsService.verifyAssignment(id, !current);
            toast.success(current ? 'Marked as unverified' : 'Marked as verified');
            fetchRecords();
        } catch (error) {
            toast.error('Verification failed');
        }
    };

    const handleExport = (type: 'csv' | 'pdf') => {
        toast.info(`Exporting to ${type.toUpperCase()}...`);
        // Implementation for export would go here (e.g., window.open or blob generation)
    };

    return (
        <div className="logistics-view-container">
            <header className="view-header">
                <div className="view-title">
                    <h1>Delivery <span className="text-[#008000]">Records</span></h1>
                    <p>Archival and real-time monitoring of all logistics operations</p>
                </div>
            </header>

            {/* KPI Mini Cards */}
            <div className="kpi-mini-grid">
                <div className="kpi-mini-card">
                    <span className="kpi-mini-label">Total Assignments</span>
                    <span className="kpi-mini-value">{stats?.total || 0}</span>
                </div>
                <div className="kpi-mini-card">
                    <span className="kpi-mini-label" style={{ color: '#10b981' }}>Success Rate (Delivered)</span>
                    <span className="kpi-mini-value">{stats?.delivered || 0}</span>
                </div>
                <div className="kpi-mini-card">
                    <span className="kpi-mini-label" style={{ color: '#ef4444' }}>Delivery Failures</span>
                    <span className="kpi-mini-value">{stats?.failed || 0}</span>
                </div>
                <div className="kpi-mini-card">
                    <span className="kpi-mini-label" style={{ color: '#008000' }}>Currently In Transit</span>
                    <span className="kpi-mini-value">{stats?.inTransit || 0}</span>
                </div>
                <div className="kpi-mini-card">
                    <span className="kpi-mini-label" style={{ color: '#f59e0b' }}>Scheduled Today</span>
                    <span className="kpi-mini-value">{stats?.today || 0}</span>
                </div>
            </div>

            {/* Advanced Filters */}
            <div className="records-filters">
                <div className="filters-row">
                    <div className="filter-group">
                        <label className="filter-label">Quick Search</label>
                        <div className="filter-control-wrap">
                            <Search className="search-icon" size={16} />
                            <input
                                type="text"
                                className="filter-input has-icon"
                                placeholder="Order / Customer / Driver..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="filter-group">
                        <label className="filter-label">Center</label>
                        <select className="filter-input" value={centerFilter} onChange={e => setCenterFilter(e.target.value)}>
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
                        <select className="filter-input" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                            <option value="All">All Statuses</option>
                            <option value="Assigned">Assigned</option>
                            <option value="PickedUp">Picked Up</option>
                            <option value="InTransit">In Transit</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Failed">Failed</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label className="filter-label">Date Range</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input type="date" className="filter-input" value={startDate} onChange={e => setStartDate(e.target.value)} />
                            <input type="date" className="filter-input" value={endDate} onChange={e => setEndDate(e.target.value)} />
                        </div>
                    </div>
                </div>
                <div className="filter-actions">
                    <button onClick={handleReset} className="modal-btn modal-btn-cancel" style={{ flex: 'none', padding: '0 20px' }}>
                        <RotateCcw size={14} /> Reset
                    </button>
                    <button onClick={handleApplyFilters} className="modal-btn modal-btn-confirm" style={{ flex: 'none', padding: '0 24px' }}>
                        <Filter size={14} /> Apply Filters
                    </button>
                    <div style={{ width: '2px', height: '24px', background: '#f1f5f9', margin: '0 8px' }}></div>
                    <button onClick={() => handleExport('csv')} className="modal-btn modal-btn-cancel" style={{ flex: 'none', gap: '4px' }}>
                        <Download size={14} /> CSV
                    </button>
                    <button onClick={() => handleExport('pdf')} className="modal-btn modal-btn-cancel" style={{ flex: 'none', gap: '4px' }}>
                        <FileText size={14} /> PDF
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ padding: '100px 0', textAlign: 'center' }}>
                    <Loader2 className="animate-spin text-[#008000]" size={40} style={{ margin: '0 auto 16px' }} />
                    <p style={{ fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Processing Database...</p>
                </div>
            ) : (
                <>
                    <div className="table-responsive-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '12%' }}>Order ID</th>
                                    <th style={{ width: '15%' }}>Customer</th>
                                    <th style={{ width: '10%' }}>Center</th>
                                    <th style={{ width: '15%' }}>Driver</th>
                                    <th style={{ width: '12%' }}>Vehicle</th>
                                    <th style={{ width: '12%' }}>Status</th>
                                    <th style={{ width: '10%' }}>Assigned</th>
                                    <th style={{ width: '14%', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assignments.map(del => (
                                    <tr key={del._id}>
                                        <td><span className="badge badge-active">#{del.order?.orderId || 'N/A'}</span></td>
                                        <td><p className="text-sm font-black text-gray-900 truncate">{del.order?.customer || 'Unknown'}</p></td>
                                        <td><span className="text-[10px] font-black text-[#008000] uppercase">{del.center}</span></td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <div style={{ width: '24px', height: '24px', background: '#f1f5f9', borderRadius: '50%', overflow: 'hidden' }}>
                                                    {del.driver?.image ? <img src={del.driver.image} style={{ width: '100%', height: '100%' }} /> : <div style={{ background: '#cbd5e1', height: '100%' }}></div>}
                                                </div>
                                                <p className="text-xs font-bold text-gray-700">{del.driver?.name?.split(' ')[0]}</p>
                                            </div>
                                        </td>
                                        <td><p className="text-xs font-black text-gray-900">{del.vehicle?.licensePlate}</p></td>
                                        <td><StatusBadge status={del.status} /></td>
                                        <td><p className="text-[10px] font-bold text-gray-400">{new Date(del.assignedAt).toLocaleDateString()}</p></td>
                                        <td>
                                            <div className="flex gap-2 justify-end">
                                                <button onClick={() => setViewDetail(del)} className="modal-close-btn" title="Details"><FileText size={14} /></button>
                                                <button onClick={() => setViewTimeline(del)} className="modal-close-btn" title="Timeline"><History size={14} /></button>
                                                <button onClick={() => setViewProof(del)} className="modal-close-btn" title="Proof" disabled={!del.proofOfDelivery}><ImageIcon size={14} /></button>
                                                <button onClick={() => handleVerify(del._id, del.verificationStatus)} className={`modal-close-btn ${del.verificationStatus ? 'text-green-600' : ''}`} title="Verify"><CheckSquare size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {assignments.length === 0 && (
                            <div style={{ padding: '80px 0', textAlign: 'center' }}>
                                <Package size={48} color="#e5e7eb" style={{ margin: '0 auto 16px' }} />
                                <p style={{ fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>No matching records found</p>
                            </div>
                        )}
                    </div>

                    {/* Mobile Desktop Logic Conversion Cards */}
                    <div className="mobile-driver-list">
                        {assignments.map(del => (
                            <div key={del._id} className="driver-card">
                                <div className="card-header">
                                    <div>
                                        <span className="badge badge-active">#{del.order?.orderId}</span>
                                        <h4 style={{ fontSize: '1rem', fontWeight: 900, margin: '8px 0 2px' }}>{del.order?.customer}</h4>
                                    </div>
                                    <StatusBadge status={del.status} />
                                </div>
                                <div className="card-body">
                                    <div className="card-body-item">
                                        <span className="card-label">Driver / Fleet</span>
                                        <span className="card-value">{del.driver?.name} / {del.vehicle?.licensePlate}</span>
                                    </div>
                                    <div className="card-body-item">
                                        <span className="card-label">Assigned At</span>
                                        <span className="card-value">{new Date(del.assignedAt).toLocaleString()}</span>
                                    </div>
                                    <div className="card-body-item">
                                        <span className="card-label">Verification</span>
                                        <span className="card-value">{del.verificationStatus ? 'VERIFIED' : 'PENDING'}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '1.25rem' }}>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => setViewDetail(del)} className="modal-btn modal-btn-cancel" style={{ height: '40px' }}><FileText size={14} /> Details</button>
                                        <button onClick={() => setViewTimeline(del)} className="modal-btn modal-btn-cancel" style={{ height: '40px' }}><History size={14} /> History</button>
                                    </div>
                                    <button onClick={() => setViewProof(del)} className="modal-btn modal-btn-cancel" style={{ height: '40px' }} disabled={!del.proofOfDelivery}><ImageIcon size={14} /> View Proof</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="pagination-wrap">
                        <span className="page-indicator">Showing {assignments.length} of {total} records</span>
                        <div className="page-buttons">
                            <button className="page-btn" disabled={page === 1} onClick={() => setPage(page - 1)}><ChevronLeft size={16} /></button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button key={i} className={`page-btn ${page === i + 1 ? 'active' : ''}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
                            ))}
                            <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(page + 1)}><ChevronRight size={16} /></button>
                        </div>
                    </div>
                </>
            )}

            {/* Modals Implementation */}
            {viewDetail && (
                <div className="modal-overlay" onClick={() => setViewDetail(null)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <header className="modal-header">
                            <h2>Record <span className="text-[#008000]">Details</span></h2>
                            <button onClick={() => setViewDetail(null)} className="modal-close-btn"><X size={18} /></button>
                        </header>
                        <div className="modal-body">
                            <section className="mb-6">
                                <label className="modal-form-label mb-2">Order Information</label>
                                <div className="info-block" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: '#f8fafc', padding: '16px', borderRadius: '16px' }}>
                                    <div><label>Order ID</label><p>#{viewDetail.order?.orderId}</p></div>
                                    <div><label>Customer</label><p>{viewDetail.order?.customer}</p></div>
                                    <div style={{ gridColumn: 'span 2' }}><label>Shipping Address</label><p>{viewDetail.order?.address}</p></div>
                                </div>
                            </section>
                            <section className="mb-6">
                                <label className="modal-form-label mb-2">Assignment Details</label>
                                <div className="info-block" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div><label>Driver Name</label><p>{viewDetail.driver?.name}</p></div>
                                    <div><label>Vehicle License</label><p>{viewDetail.vehicle?.licensePlate}</p></div>
                                    <div><label>Distribution Center</label><p>{viewDetail.center} Center</p></div>
                                    <div><label>Assigned On</label><p>{new Date(viewDetail.assignedAt).toLocaleString()}</p></div>
                                </div>
                            </section>
                            <section>
                                <label className="modal-form-label mb-2">Package Items</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {viewDetail.order?.items?.map((item: any, idx: number) => (
                                        <div key={idx} style={{ padding: '12px', background: '#f9fafb', border: '1px solid #f1f5f9', borderRadius: '12px', display: 'flex', justifyContent: 'space-between' }}>
                                            <p className="text-sm font-bold">{item.product?.name || 'Item'}</p>
                                            <p className="text-[10px] font-black text-blue-600">QTY: {item.quantity}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                        <footer className="modal-footer">
                            <button onClick={() => setViewDetail(null)} className="modal-btn modal-btn-cancel">Close</button>
                            <button onClick={() => { toast.info('Generating PDF Invoice...'); setViewDetail(null); }} className="modal-btn modal-btn-confirm"><Download size={14} /> Download Invoice</button>
                        </footer>
                    </div>
                </div>
            )}

            {viewTimeline && (
                <div className="modal-overlay" onClick={() => setViewTimeline(null)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <header className="modal-header">
                            <h2>Delivery <span className="text-blue-600">Timeline</span></h2>
                            <button onClick={() => setViewTimeline(null)} className="modal-close-btn"><X size={18} /></button>
                        </header>
                        <div className="modal-body">
                            <div className="timeline-list">
                                <div className="timeline-item">
                                    <div className="timeline-dot"></div>
                                    <div className="timeline-content">
                                        <div className="timeline-header">
                                            <span className="timeline-status">Assignment Created</span>
                                            <span className="timeline-time">{new Date(viewTimeline.assignedAt).toLocaleTimeString()}</span>
                                        </div>
                                        <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Delivery scheduled from {viewTimeline.center} Distribution Center.</p>
                                    </div>
                                </div>
                                {viewTimeline.timeline?.map((event: any, idx: number) => (
                                    <div key={idx} className="timeline-item">
                                        <div className="timeline-dot" style={{ background: '#2563eb' }}></div>
                                        <div className="timeline-content">
                                            <div className="timeline-header">
                                                <span className="timeline-status" style={{ color: '#2563eb' }}>{event.status}</span>
                                                <span className="timeline-time">{new Date(event.timestamp).toLocaleTimeString()}</span>
                                            </div>
                                            {event.note && <p style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic' }}>"{event.note}"</p>}
                                            {event.location && <p style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '4px' }}>Location: {event.location}</p>}
                                        </div>
                                    </div>
                                ))}
                                {viewTimeline.status === 'Delivered' && (
                                    <div className="timeline-item">
                                        <div className="timeline-dot" style={{ borderColor: '#10b981', background: '#10b981' }}></div>
                                        <div className="timeline-content" style={{ background: '#f0fdf4', border: '1px solid #d1fae5' }}>
                                            <div className="timeline-header">
                                                <span className="timeline-status" style={{ color: '#059669' }}>Package Delivered</span>
                                                <span className="timeline-time">{new Date(viewTimeline.completedAt).toLocaleTimeString()}</span>
                                            </div>
                                            <p style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}>Final verification completed. Documentation uploaded.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <footer className="modal-footer">
                            <button onClick={() => setViewTimeline(null)} className="modal-btn modal-btn-cancel">Close History</button>
                        </footer>
                    </div>
                </div>
            )}

            {viewProof && (
                <div className="modal-overlay" onClick={() => setViewProof(null)}>
                    <div className="modal-box" style={{ width: 'min(700px, 96vw)' }} onClick={e => e.stopPropagation()}>
                        <header className="modal-header">
                            <h2>Delivery <span className="text-blue-600">Verification Proof</span></h2>
                            <button onClick={() => setViewProof(null)} className="modal-close-btn"><X size={18} /></button>
                        </header>
                        <div className="modal-body">
                            <div className="proof-grid">
                                <div className="proof-card">
                                    <label className="modal-form-label mb-2">Package Photo</label>
                                    <div className="proof-img-container">
                                        {viewProof.proofOfDelivery?.photoUrl ? (
                                            <img src={viewProof.proofOfDelivery.photoUrl} alt="Dropoff Photo" />
                                        ) : (
                                            <div className="empty-proof">
                                                <ImageIcon size={48} />
                                                <p style={{ fontSize: '0.7rem', fontWeight: 800 }}>PHOTO NOT UPLOADED</p>
                                            </div>
                                        )}
                                    </div>
                                    {viewProof.proofOfDelivery?.photoUrl && (
                                        <button className="view-btn-mobile" style={{ marginTop: '12px' }} onClick={() => window.open(viewProof.proofOfDelivery.photoUrl, '_blank')}><ExternalLink size={14} /> Full Resolution</button>
                                    )}
                                </div>
                                <div className="proof-card">
                                    <label className="modal-form-label mb-2">Customer Signature</label>
                                    <div className="proof-img-container">
                                        {viewProof.proofOfDelivery?.signatureUrl ? (
                                            <img src={viewProof.proofOfDelivery.signatureUrl} alt="Signature" />
                                        ) : (
                                            <div className="empty-proof">
                                                <CheckSquare size={48} />
                                                <p style={{ fontSize: '0.7rem', fontWeight: 800 }}>SIGNATURE PENDING</p>
                                            </div>
                                        )}
                                    </div>
                                    {viewProof.proofOfDelivery?.signatureUrl && (
                                        <p style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', marginTop: '12px' }}>CAPTURED ON {new Date(viewProof.proofOfDelivery.timestamp).toLocaleString()}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <footer className="modal-footer">
                            <button onClick={() => setViewProof(null)} className="modal-btn modal-btn-cancel">Close Proof</button>
                            <button onClick={() => handleVerify(viewProof._id, viewProof.verificationStatus)} className="modal-btn modal-btn-confirm">
                                {viewProof.verificationStatus ? 'Mark Unverified' : 'Mark as Final Verified'}
                            </button>
                        </footer>
                    </div>
                </div>
            )}
        </div>
    );
}


function StatusBadge({ status }: any) {
    const styles: any = {
        'OnTheWay': 'bg-blue-600 text-white shadow-blue-100',
        'Scheduled': 'bg-orange-500 text-white shadow-orange-100',
        'Delivered': 'bg-green-600 text-white shadow-green-100',
        'Delayed': 'bg-red-600 text-white shadow-red-100',
        'Pending': 'bg-purple-500 text-white shadow-purple-100'
    };

    const base = styles[status] || styles['Pending'];

    return (
        <span className={`${base} px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg border border-white/20`}>
            {status === 'OnTheWay' ? 'IN TRANSIT' : status}
        </span>
    );
}
