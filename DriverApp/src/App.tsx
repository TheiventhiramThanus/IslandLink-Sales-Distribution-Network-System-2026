import { useState, useEffect } from 'react';
import { OnboardingScreen } from './components/OnboardingScreen';
import { DriverDashboard } from './components/DriverDashboard';
import { OrdersScreen } from './components/OrdersScreen';
import { LiveTrackingScreen } from './components/LiveTrackingScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { DriverLoginScreen } from './components/DriverLoginScreen';
import { DriverRegistrationScreen } from './components/DriverRegistrationScreen';
import { orderService } from './services/api';
import { Toaster } from 'sonner';

export type Screen = 'onboarding' | 'login' | 'register' | 'dashboard' | 'orders' | 'tracking' | 'profile';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('onboarding');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [driver, setDriver] = useState<any>(null);

  useEffect(() => {
    // Check for saved driver session
    const savedDriver = localStorage.getItem('driver');
    if (savedDriver) {
      try {
        const driverData = JSON.parse(savedDriver);
        setDriver(driverData);
        setCurrentScreen('dashboard');
      } catch (error) {
        console.error('Failed to parse saved driver data:', error);
        localStorage.removeItem('driver');
      }
    }
  }, []);

  useEffect(() => {
    if (driver) {
      fetchOrders();
      // Refresh orders every 30 seconds
      const interval = setInterval(fetchOrders, 30000);
      return () => clearInterval(interval);
    }
  }, [driver]);

  const fetchOrders = async () => {
    try {
      const response = await orderService.getAll();
      const allOrders = response.data;

      if (driver && driver.id) {
        // Filter orders assigned to the logged-in driver
        const filtered = allOrders.filter((o: any) => o.driver === driver.id);
        setOrders(filtered);
      } else {
        setOrders(allOrders);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTracking = (orderId: string) => {
    setSelectedOrderId(orderId);
    setCurrentScreen('tracking');
  };

  const handleLoginSuccess = (driverData: any) => {
    setDriver(driverData);
    localStorage.setItem('driver', JSON.stringify(driverData));
  };

  const handleLogout = () => {
    setDriver(null);
    localStorage.removeItem('driver');
    setCurrentScreen('login');
  };

  const renderScreen = () => {
    if (loading && currentScreen !== 'onboarding' && currentScreen !== 'login' && currentScreen !== 'register') {
      return (
        <div className="h-full flex items-center justify-center bg-white">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    switch (currentScreen) {
      case 'onboarding':
        return <OnboardingScreen onGetStarted={() => setCurrentScreen('login')} />;
      case 'login':
        return <DriverLoginScreen onNavigate={setCurrentScreen} onLoginSuccess={handleLoginSuccess} />;
      case 'register':
        return <DriverRegistrationScreen onNavigate={setCurrentScreen} />;
      case 'dashboard':
        return <DriverDashboard onNavigate={setCurrentScreen} onStartTracking={handleStartTracking} orders={orders} driver={driver} />;
      case 'orders':
        return <OrdersScreen onNavigate={setCurrentScreen} onStartTracking={handleStartTracking} orders={orders} />;
      case 'tracking':
        return <LiveTrackingScreen onNavigate={setCurrentScreen} orderId={selectedOrderId} orders={orders} />;
      case 'profile':
        return <ProfileScreen onNavigate={setCurrentScreen} onLogout={handleLogout} driver={driver} />;
      default:
        return <DriverDashboard onNavigate={setCurrentScreen} onStartTracking={handleStartTracking} orders={orders} driver={driver} />;
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 overflow-hidden">
      <div className="relative w-full max-w-[390px] h-[844px] bg-white rounded-[60px] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden border-[8px] border-slate-800">
        {/* Dynamic Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-slate-800 rounded-b-2xl z-50"></div>

        <div className="h-full w-full overflow-hidden">
          {renderScreen()}
        </div>
        <Toaster position="top-center" richColors />
      </div>
    </div>
  );
}