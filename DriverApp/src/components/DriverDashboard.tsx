import { DollarSign, Package, CheckCircle, Clock, TrendingUp, Navigation } from 'lucide-react';
import { BottomNavigation } from './BottomNavigation';
import { Screen } from '../App';

interface DriverDashboardProps {
  onNavigate: (screen: Screen) => void;
  onStartTracking: (orderId: string) => void;
  orders: any[];
  driver: any;
}

export function DriverDashboard({ onNavigate, onStartTracking, orders, driver }: DriverDashboardProps) {
  // Filter active and pending orders
  const activeOrders = orders.filter(o =>
    ['Ready for Delivery', 'In Transit', 'Processing'].includes(o.status)
  );

  const pendingOrdersCount = orders.filter(o => o.status === 'Approved').length;
  const completedOrdersCount = orders.filter(o => o.status === 'Delivered').length;

  const todayStats = {
    earnings: completedOrdersCount * 25.00, // Simulated earnings per delivery
    completed: completedOrdersCount,
    pending: activeOrders.length,
    distance: activeOrders.length * 15.2 // Simulated distance
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#008000] via-green-700 to-green-900 px-6 pt-12 pb-8 rounded-b-[40px] shadow-xl sticky top-0 z-[1000]">
        {/* Logo */}
        <div className="mb-4">
          <img
            src="/isdn_logo_green.png"
            alt="IslandLink ISDN"
            className="h-[30px] w-auto object-contain"
            style={{ objectFit: 'contain' }}
          />
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Driver Partner</p>
            <h1 className="text-2xl font-black text-white">{driver?.name || 'Driver Partner'}</h1>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#008000] flex items-center justify-center shadow-lg transform rotate-3">
            <span className="text-lg font-black text-white">{driver?.name?.charAt(0) || 'D'}</span>
          </div>
        </div>

        {/* Today's Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Earnings</p>
            </div>
            <p className="text-2xl font-black text-white">${todayStats.earnings.toFixed(2)}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Completed</p>
            </div>
            <p className="text-2xl font-black text-white">{todayStats.completed}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-orange-500" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Task</p>
            </div>
            <p className="text-2xl font-black text-slate-900">{activeOrders.length}</p>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Ready to go</p>
          </div>
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Efficiency</p>
            </div>
            <p className="text-2xl font-black text-slate-900">98%</p>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Top Driver</p>
          </div>
        </div>

        {/* Active Orders */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Active Deliveries</h2>
            <button
              onClick={() => onNavigate('orders')}
              className="text-xs font-black text-[#008000] uppercase tracking-widest bg-green-50 px-3 py-2 rounded-full"
            >
              View List
            </button>
          </div>

          <div className="space-y-4">
            {activeOrders.length > 0 ? activeOrders.map((order) => (
              <div key={order._id} className="bg-white rounded-[32px] shadow-sm p-6 border border-slate-100 space-y-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Task ID: #{order.orderId}</p>
                    <p className="text-lg font-black text-slate-900">{order.customer}</p>
                    <span className="inline-block px-3 py-1 text-[10px] font-black uppercase tracking-tight rounded-full bg-green-50 text-[#008000] border border-green-100">
                      {order.status}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <p className="text-lg font-black text-slate-900">${order.totalAmount.toFixed(2)}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#008000] ring-4 ring-green-50 mt-1.5 shadow-sm"></div>
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">From Warehouse</p>
                      <p className="text-xs font-bold text-slate-700">Central Distribution Center</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 ring-4 ring-green-50 mt-1.5 shadow-sm"></div>
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">To Customer</p>
                      <p className="text-xs font-bold text-slate-700">{order.address}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-5 border-t border-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <p className="text-[10px] font-black text-slate-900">12.3 KM</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onStartTracking(order._id)}
                    className="bg-slate-900 hover:bg-[#008000] text-white px-6 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shadow-lg shadow-slate-200"
                  >
                    <Navigation className="w-4 h-4" />
                    START NAVIGATION
                  </button>
                </div>
              </div>
            )) : (
              <div className="bg-slate-50 rounded-[32px] p-8 text-center border-2 border-dashed border-slate-200">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">No Active Deliveries</p>
              </div>
            )}
          </div>
        </div>

        {/* Spacing for bottom nav */}
        <div className="h-20"></div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation currentScreen="dashboard" onNavigate={onNavigate} />
    </div>
  );
}
