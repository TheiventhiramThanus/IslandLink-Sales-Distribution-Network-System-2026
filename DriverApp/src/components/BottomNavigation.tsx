import { Home, Package, Navigation, User, Plus } from 'lucide-react';
import { Screen } from '../App';

interface BottomNavigationProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

export function BottomNavigation({ currentScreen, onNavigate }: BottomNavigationProps) {
  const navItems = [
    { id: 'dashboard' as Screen, icon: Home, label: 'Home' },
    { id: 'orders' as Screen, icon: Package, label: 'Orders' },
    { id: 'tracking' as Screen, icon: Navigation, label: 'Tracking' },
    { id: 'profile' as Screen, icon: User, label: 'Profile' }
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 pb-6 pt-3 rounded-t-3xl shadow-lg">
      <div className="flex items-center justify-between relative">
        {navItems.slice(0, 2).map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="flex flex-col items-center gap-1 py-2 px-4 transition-colors"
            >
              <Icon
                className={`w-6 h-6 transition-colors ${isActive ? 'text-[#008000]' : 'text-gray-400'
                  }`}
              />
              <span
                className={`text-xs font-medium ${isActive ? 'text-[#008000]' : 'text-gray-400'
                  }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}

        {/* Center Plus Button */}
        <button className="absolute left-1/2 transform -translate-x-1/2 -top-8 w-14 h-14 bg-gradient-to-br from-[#008000] to-green-600 rounded-full shadow-lg shadow-green-500/50 flex items-center justify-center hover:scale-105 transition-transform active:scale-95">
          <Plus className="w-7 h-7 text-white" />
        </button>

        {navItems.slice(2).map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="flex flex-col items-center gap-1 py-2 px-4 transition-colors"
            >
              <Icon
                className={`w-6 h-6 transition-colors ${isActive ? 'text-[#008000]' : 'text-gray-400'
                  }`}
              />
              <span
                className={`text-xs font-medium ${isActive ? 'text-[#008000]' : 'text-gray-400'
                  }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}