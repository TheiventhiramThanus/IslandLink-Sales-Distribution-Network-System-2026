import { ArrowLeft, User, Package, MapPin, Bell, HelpCircle, Settings, LogOut, Truck } from 'lucide-react';
import { BottomNavigation } from './BottomNavigation';
import { Screen } from '../App';

interface ProfileScreenProps {
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  driver?: any;
}

export function ProfileScreen({ onNavigate, onLogout, driver }: ProfileScreenProps) {
  const menuItems = [
    { icon: Package, label: 'My Orders', badge: '42' },
    { icon: MapPin, label: 'Earnings History', badge: null },
    { icon: Bell, label: 'Notifications', badge: '3' },
    { icon: HelpCircle, label: 'Help & Support', badge: null },
    { icon: Settings, label: 'Settings', badge: null }
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#008000] to-green-600 px-6 pt-12 pb-8 sticky top-0 z-[1000]">
        {/* Logo */}
        <div className="mb-4">
          <img
            src="/isdn_logo_green.png"
            alt="IslandLink ISDN"
            className="h-[30px] w-auto object-contain"
            style={{ objectFit: 'contain' }}
          />
        </div>

        <button
          onClick={() => onNavigate('dashboard')}
          className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mb-4 shadow-lg overflow-hidden">
            {driver?.image ? (
              <img src={driver.image} alt={driver.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-12 h-12 text-[#008000]" />
            )}
          </div>
          <h2 className="text-xl font-semibold text-white mb-1">{driver?.name || 'Driver Partner'}</h2>
          <p className="text-green-100 text-sm">{driver?.email || 'ISDN Logistics Team'}</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 -mt-4">
        {/* Stats Card */}
        <div className="bg-white rounded-2xl shadow-lg p-5 mb-6 grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">142</p>
            <p className="text-xs text-gray-500 mt-1">Total Orders</p>
          </div>
          <div className="text-center border-x border-gray-100">
            <p className="text-2xl font-bold text-blue-500">8</p>
            <p className="text-xs text-gray-500 mt-1">Today</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-500">$2.4k</p>
            <p className="text-xs text-gray-500 mt-1">This Week</p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-gray-600" />
                  </div>
                  <span className="font-medium text-gray-900">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="w-full bg-white rounded-2xl shadow-sm p-4 flex items-center justify-center gap-2 text-red-600 font-semibold hover:bg-red-50 transition-colors mb-4"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>

        {/* Spacing for bottom nav */}
        <div className="h-20"></div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation currentScreen="profile" onNavigate={onNavigate} />
    </div>
  );
}