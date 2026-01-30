import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { SalesRepDashboard } from './components/sales/SalesRepDashboard';
import { InventoryClerkDashboard } from './components/inventory/InventoryClerkDashboard';
import { LogisticsOfficerDashboard } from './components/logistics/LogisticsOfficerDashboard';
import { ManagerDashboard } from './components/manager/ManagerDashboard';
import { LoginPage } from './components/LoginPage';
import { Toaster } from 'sonner';

const handleLogout = () => {
  localStorage.removeItem('currentUser');
  window.location.href = '/';
};

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/admin" element={<AdminDashboard onLogout={handleLogout} />} />
        <Route path="/sales" element={<SalesRepDashboard onLogout={handleLogout} />} />
        <Route path="/inventory" element={<InventoryClerkDashboard onLogout={handleLogout} />} />
        <Route path="/logistics" element={<LogisticsOfficerDashboard onLogout={handleLogout} />} />
        <Route path="/manager" element={<ManagerDashboard onLogout={handleLogout} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

