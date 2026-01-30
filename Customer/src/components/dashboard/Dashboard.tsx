import { useState, useEffect } from 'react';
import { Package, TruckIcon, DollarSign, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';
import { orderService } from '../../services/api';
import { formatPrice } from '../../utils/currencyUtils';
import type { User, Page } from '../../types';

interface DashboardProps {
  user: User | null;
  onNavigate: (page: Page) => void;
  currency: 'USD' | 'LKR';
}

export function Dashboard({ user, onNavigate, currency }: DashboardProps) {
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([
    { label: 'Total Orders', value: '0', icon: ShoppingBag, color: 'blue' },
    { label: 'In Transit', value: '0', icon: TruckIcon, color: 'yellow' },
    { label: 'Delivered', value: '0', icon: Package, color: 'green' },
    { label: 'Total Spent', value: formatPrice(0, currency), icon: DollarSign, color: 'purple' },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user?.id) return;
    try {
      const res = await orderService.getByUser(user.id);
      const orders = res.data;

      // Update recent orders
      setRecentOrders(orders.slice(0, 5));

      // Calculate stats
      const totalOrders = orders.length;
      const inTransit = orders.filter((o: any) => o.status === 'In Transit').length;
      const delivered = orders.filter((o: any) => o.status === 'Delivered').length;
      const totalSpent = orders.reduce((sum: number, o: any) => sum + o.totalAmount, 0);

      setStats([
        { label: 'Total Orders', value: totalOrders.toString(), icon: ShoppingBag, color: 'blue' },
        { label: 'In Transit', value: inTransit.toString(), icon: TruckIcon, color: 'yellow' },
        { label: 'Delivered', value: delivered.toString(), icon: Package, color: 'green' },
        { label: 'Total Spent', value: formatPrice(totalSpent, currency), icon: DollarSign, color: 'purple' },
      ]);
    } catch (err: any) {
      if (err.response && err.response.status === 404) {
        // User not found or no orders found - quiet fail or reset
        console.warn('Dashboard data not found (404) - New user or deleted?');
        setRecentOrders([]);
      } else {
        console.error('Dashboard fetch error:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'In Transit': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Processing': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading && recentOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-blue-600 text-black animate-spin mb-4" />
        <p className="text-gray-600">Loading your summary...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl text-gray-900 mb-2 font-poppins font-bold">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 font-medium">{user?.company}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-12 h-12 bg-${stat.color}-50 rounded-xl flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
                <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
              </div>
              <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <button onClick={() => onNavigate('catalogue')} className="bg-blue-600 text-black text-black text-white rounded-xl p-6 hover:bg-blue-700 transition-all text-left shadow-lg">
            <ShoppingBag className="w-8 h-8 mb-3" />
            <h3 className="font-bold mb-1">Browse Products</h3>
            <p className="text-sm text-blue-100">Explore our catalogue and place new orders</p>
          </button>
          <button onClick={() => onNavigate('track')} className="bg-white border border-gray-200 text-blue-600 text-black rounded-xl p-6 hover:border-blue-300 hover:bg-blue-50/50 transition-all text-left shadow-sm">
            <TruckIcon className="w-8 h-8 mb-3" />
            <h3 className="font-bold mb-1 text-gray-900">Track Deliveries</h3>
            <p className="text-sm text-gray-500">Monitor your shipments in real-time</p>
          </button>
          <button onClick={() => onNavigate('invoices')} className="bg-white border border-gray-200 text-blue-600 text-black rounded-xl p-6 hover:border-blue-300 hover:bg-blue-50/50 transition-all text-left shadow-sm">
            <DollarSign className="w-8 h-8 mb-3" />
            <h3 className="font-bold mb-1 text-gray-900">Invoices & Payments</h3>
            <p className="text-sm text-gray-500">View and manage your billing history</p>
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
            <button onClick={() => onNavigate('orders')} className="text-blue-600 text-black hover:text-blue-700 font-bold flex items-center space-x-1 transition-colors">
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-x-auto">
            {recentOrders.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentOrders.map((order) => (
                    <tr key={order.orderId} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">{order.orderId}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{new Date(order.orderDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">{formatPrice(order.totalAmount, currency)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(order.status)} uppercase tracking-wide`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => onNavigate('track')} className="text-blue-600 text-black hover:text-blue-700 text-sm font-bold transition-colors">
                          Track
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center">
                <p className="text-gray-500">No recent orders found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
