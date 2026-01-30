import { useState, useEffect } from 'react';
import { analyticsService } from '../../services/api';
import { Layout } from '../Layout';
import { NavItem } from '../NavItem';
import { toast } from 'sonner';

import {
  LayoutDashboard,
  FileText,
  DollarSign,
  TrendingUp,
  Package,
  Truck,
  BarChart3,
  Calendar,
  Map
} from 'lucide-react';

// Import extracted views
import { ExecutiveDashboardView } from './ExecutiveDashboardView';
import { BillingManagementView } from './BillingManagementView';
import { SalesPerformanceView } from './SalesPerformanceView';
import { InventoryReportsView } from './InventoryReportsView';
import { DeliveryAnalyticsView } from './DeliveryAnalyticsView';
import { StaffPerformanceView } from './StaffPerformanceView';
import { RouteEfficiencyView } from './RouteEfficiencyView';
import { FinancialReportsView } from './FinancialReportsView';
import { RealTimeDashboardView } from './RealTimeDashboardView';
import { ScheduledReportsView } from './ScheduledReportsView';
import { CustomerManagementView } from './CustomerManagementView';
import { Users } from 'lucide-react';

interface ManagerDashboardProps {
  onLogout: () => void;
}

export function ManagerDashboard({ onLogout }: ManagerDashboardProps) {
  const [activeView, setActiveView] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [salesData, setSalesData] = useState<any>(null);
  const [inventoryData, setInventoryData] = useState<any>(null);
  const [deliveryData, setDeliveryData] = useState<any>(null);
  const [staffData, setStaffData] = useState<any>(null);
  const [routeData, setRouteData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 30000); // 30s Real-time pulse
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    try {
      // Use prompt handling to prevent one failure from breaking everything
      const [dashRes, salesRes, invRes, delRes, staffRes, routeRes] = await Promise.allSettled([
        analyticsService.getDashboardStats(),
        analyticsService.getSalesStats(),
        analyticsService.getInventoryStats(),
        analyticsService.getDeliveryStats(),
        analyticsService.getStaffStats(),
        analyticsService.getRouteStats()
      ]);

      if (dashRes.status === 'fulfilled') setDashboardData(dashRes.value.data);
      if (salesRes.status === 'fulfilled') setSalesData(salesRes.value.data);
      if (invRes.status === 'fulfilled') setInventoryData(invRes.value.data);
      if (delRes.status === 'fulfilled') setDeliveryData(delRes.value.data);
      if (staffRes.status === 'fulfilled') setStaffData(staffRes.value.data);
      if (routeRes.status === 'fulfilled') setRouteData(routeRes.value.data);

      // Log specific failures for debugging
      if (staffRes.status === 'rejected') console.error('Staff API Failed:', staffRes.reason);
      if (routeRes.status === 'rejected') console.error('Route API Failed:', routeRes.reason);

    } catch (error) {
      console.error('Critical failure in data fetch:', error);
      toast.error('Failed to sync dashboard data');
    } finally {
      setLoading(false);
    }
  };


  const sidebar = (
    <div className="space-y-1">
      <NavItem
        icon={LayoutDashboard}
        label="Executive Dashboard"
        active={activeView === 'dashboard'}
        onClick={() => setActiveView('dashboard')}
      />
      <NavItem
        icon={DollarSign}
        label="Billing Management"
        active={activeView === 'billing'}
        onClick={() => setActiveView('billing')}
      />
      <NavItem
        icon={TrendingUp}
        label="Sales Performance"
        active={activeView === 'sales'}
        onClick={() => setActiveView('sales')}
      />
      <NavItem
        icon={Package}
        label="Inventory Reports"
        active={activeView === 'inventory'}
        onClick={() => setActiveView('inventory')}
      />
      <NavItem
        icon={Truck}
        label="Delivery Analytics"
        active={activeView === 'delivery'}
        onClick={() => setActiveView('delivery')}
      />
      <NavItem
        icon={TrendingUp}
        label="Staff Performance"
        active={activeView === 'staff'}
        onClick={() => setActiveView('staff')}
      />
      <NavItem
        icon={Map}
        label="Route Efficiency"
        active={activeView === 'routes'}
        onClick={() => setActiveView('routes')}
      />
      <NavItem
        icon={FileText}
        label="Financial Reports"
        active={activeView === 'financial'}
        onClick={() => setActiveView('financial')}
      />
      <NavItem
        icon={BarChart3}
        label="Real-Time Dashboards"
        active={activeView === 'realtime'}
        onClick={() => setActiveView('realtime')}
      />
      <NavItem
        icon={Calendar}
        label="Scheduled Reports"
        active={activeView === 'scheduled'}
        onClick={() => setActiveView('scheduled')}
      />
      <NavItem
        icon={Users}
        label="Customer Management"
        active={activeView === 'customers'}
        onClick={() => setActiveView('customers')}
      />
    </div>
  );

  if (loading) return <div>Loading reports...</div>;

  return (
    <Layout
      sidebar={sidebar}
      userRole="Head Office Manager"
      userName="Emily Brown"
      onLogout={onLogout}
    >
      {activeView === 'dashboard' && <ExecutiveDashboardView data={dashboardData} />}
      {activeView === 'billing' && <BillingManagementView />}
      {activeView === 'sales' && <SalesPerformanceView data={salesData} />}
      {activeView === 'inventory' && <InventoryReportsView data={inventoryData} />}
      {activeView === 'delivery' && <DeliveryAnalyticsView data={deliveryData} />}
      {activeView === 'staff' && <StaffPerformanceView data={staffData} />}
      {activeView === 'routes' && <RouteEfficiencyView data={routeData} />}
      {activeView === 'financial' && <FinancialReportsView />}
      {activeView === 'realtime' && <RealTimeDashboardView />}
      {activeView === 'scheduled' && <ScheduledReportsView />}
      {activeView === 'customers' && <CustomerManagementView />}
    </Layout>
  );
}
