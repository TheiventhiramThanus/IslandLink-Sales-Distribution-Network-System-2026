import { useState, useEffect } from 'react';
import { userService } from '../../services/api';
import { Layout } from '../Layout';
import { NavItem } from '../NavItem';
import { StatCard } from '../StatCard';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  Users,
  Settings,
  Shield,
  Database,
  Bell,
  FileText,
  Activity,
  HardDrive,
  Lock,
  Truck,
  ShieldCheck
} from 'lucide-react';
import { DriverManagement } from './DriverManagement';
import { VehicleManagementView } from './VehicleManagementView';

interface AdminDashboardProps {
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeView, setActiveView] = useState('dashboard');
  const [isSystemLocked, setIsSystemLocked] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSessions: 38,
    systemUptime: '99.9%',
    failedLogins: 12
  });
  const [users, setUsers] = useState<any[]>([]);
  const [, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await userService.getAll();
      const userData = response.data as any[];
      setUsers(userData);
      setStats(prev => ({
        ...prev,
        totalUsers: userData.length
      }));
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const sidebar = (
    <div className="space-y-1">
      <NavItem
        icon={LayoutDashboard}
        label="Dashboard"
        active={activeView === 'dashboard'}
        onClick={() => setActiveView('dashboard')}
      />
      <NavItem
        icon={Users}
        label="User Management"
        active={activeView === 'users'}
        onClick={() => setActiveView('users')}
      />
      <NavItem
        icon={ShieldCheck}
        label="Driver Approvals"
        active={activeView === 'drivers'}
        onClick={() => setActiveView('drivers')}
      />
      <NavItem
        icon={Truck}
        label="Vehicle Management"
        active={activeView === 'vehicles'}
        onClick={() => setActiveView('vehicles')}
      />
      <NavItem
        icon={Shield}
        label="Roles & Permissions"
        active={activeView === 'roles'}
        onClick={() => setActiveView('roles')}
      />
      <NavItem
        icon={Database}
        label="Module Connections"
        active={activeView === 'modules'}
        onClick={() => setActiveView('modules')}
      />
      <NavItem
        icon={Settings}
        label="System Config"
        active={activeView === 'config'}
        onClick={() => setActiveView('config')}
      />
      <NavItem
        icon={Bell}
        label="Notifications"
        active={activeView === 'notifications'}
        onClick={() => setActiveView('notifications')}
      />
      <NavItem
        icon={FileText}
        label="Audit Logs"
        active={activeView === 'logs'}
        onClick={() => setActiveView('logs')}
      />
      <NavItem
        icon={Activity}
        label="Performance"
        active={activeView === 'performance'}
        onClick={() => setActiveView('performance')}
      />
      <NavItem
        icon={HardDrive}
        label="Backup & Recovery"
        active={activeView === 'backup'}
        onClick={() => setActiveView('backup')}
      />
      <NavItem
        icon={Lock}
        label="Security"
        active={activeView === 'security'}
        onClick={() => setActiveView('security')}
      />
    </div>
  );

  return (
    <Layout
      sidebar={sidebar}
      userRole="System Administrator"
      userName="Admin User"
      onLogout={onLogout}
    >
      {activeView === 'dashboard' && <DashboardView stats={stats} />}
      {activeView === 'users' && <UserManagementView />}
      {activeView === 'roles' && <RolesView users={users} />}
      {activeView === 'modules' && <ModulesView />}
      {activeView === 'config' && <ConfigView />}
      {activeView === 'notifications' && <NotificationsView />}
      {activeView === 'logs' && <AuditLogsView />}
      {activeView === 'performance' && <PerformanceView />}
      {activeView === 'backup' && <BackupView />}
      {activeView === 'security' && <SecurityView isLocked={isSystemLocked} onToggleLock={() => setIsSystemLocked(!isSystemLocked)} />}
      {activeView === 'drivers' && <DriverManagement />}
      {activeView === 'vehicles' && <VehicleManagementView />}
    </Layout>
  );
}

function DashboardView({ stats }: { stats: any }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">System Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toString()}
          icon={Users}
          trend={{ value: '+5 this week', isPositive: true }}
        />
        <StatCard
          title="Active Sessions"
          value={stats.activeSessions.toString()}
          icon={Activity}
          color="bg-green-600"
        />
        <StatCard
          title="System Uptime"
          value={stats.systemUptime}
          icon={HardDrive}
          color="bg-blue-500"
        />
        <StatCard
          title="Failed Logins"
          value={stats.failedLogins.toString()}
          icon={Lock}
          color="bg-red-500"
          trend={{ value: '-3 from yesterday', isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Recent User Activity</h3>
          <div className="space-y-3">
            {[
              { user: 'John Smith', action: 'Created new order', time: '2 minutes ago' },
              { user: 'Sarah Johnson', action: 'Updated inventory', time: '15 minutes ago' },
              { user: 'Mike Davis', action: 'Assigned delivery route', time: '32 minutes ago' },
              { user: 'Emily Brown', action: 'Generated report', time: '1 hour ago' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                  <p className="text-xs text-gray-500">{activity.action}</p>
                </div>
                <span className="text-xs text-gray-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="space-y-4">
            {[
              { module: 'Orders Module', status: 'Operational', color: 'bg-green-500' },
              { module: 'Inventory Module', status: 'Operational', color: 'bg-green-500' },
              { module: 'Logistics Module', status: 'Operational', color: 'bg-green-500' },
              { module: 'Billing Module', status: 'Operational', color: 'bg-green-500' },
              { module: 'Reports Module', status: 'Operational', color: 'bg-green-500' }
            ].map((module, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{module.module}</span>
                <span className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${module.color}`}></span>
                  <span className="text-xs text-gray-600">{module.status}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function UserManagementView() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Sales Representative', status: 'Active' });

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 30000);
    return () => clearInterval(interval);
  }, []);


  const fetchUsers = async () => {
    try {
      const response = await userService.getAll();
      setUsers(response.data as any[]);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      if (!formData.name || !formData.email) {
        toast.error('Name and Email are required');
        return;
      }

      const roleMap: Record<string, string> = {
        'Sales Representative': 'sales',
        'RDC Inventory Clerk': 'inventory',
        'Logistics Officer': 'logistics',
        'Delivery Driver': 'driver',
        'Head Office Manager': 'manager',
        'System Administrator': 'admin'
      };

      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: roleMap[formData.role] || 'sales',
        status: formData.status
      };

      await userService.create(payload);
      toast.success('User created successfully');
      setShowCreateModal(false);
      setFormData({ name: '', email: '', password: '', role: 'Sales Representative', status: 'Active' });
      await fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Failed to create user:', error);
      toast.error('Failed to create user. Please check if email is unique.');
    }
  };

  const handleDeactivate = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
      await userService.update(id, { status: newStatus });
      toast.success(`User status updated to ${newStatus}`);
      await fetchUsers();
    } catch (error) {
      console.error('Failed to update user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user forever?')) return;
    try {
      await userService.delete(id);
      toast.success('User deleted successfully');
      await fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error('Failed to delete user');
    }
  };

  if (loading) return <div>Loading users...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create New User
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Last Login</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user._id || user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{user.name}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{user.role}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${user.status === 'Active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                      }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setFormData({ name: user.name, email: user.email, password: '', role: user.role, status: user.status });
                        setShowCreateModal(true);
                        // In a real app, we'd add an isEditing state to handle PUT instead of POST
                      }}
                      className="text-blue-600 hover:text-blue-700 text-sm font-bold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeactivate(user._id, user.status)}
                      className={`${user.status === 'Active' ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'} text-sm font-bold`}
                    >
                      {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="text-red-600 hover:text-red-700 text-sm font-bold"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-white/20 transform animate-in zoom-in-95 duration-300">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Create New User</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Enter password (optional)"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option>Sales Representative</option>
                  <option>RDC Inventory Clerk</option>
                  <option>Logistics Officer</option>
                  <option>Delivery Driver</option>
                  <option>Head Office Manager</option>
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateUser}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RolesView({ users }: { users: any[] }) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    permissions: [] as string[]
  });

  // Calculate roles from users
  const roleData = [
    { key: 'admin', name: 'System Administrator', permissions: 'All Access', defaultPerms: ['dashboard', 'users', 'roles', 'config', 'backup', 'security'] },
    { key: 'manager', name: 'Head Office Manager', permissions: 'Management + Analytics', defaultPerms: ['dashboard', 'reports', 'billing', 'analytics'] },
    { key: 'logistics', name: 'Logistics Officer', permissions: 'Logistics + Tracking', defaultPerms: ['dashboard', 'routes', 'tracking', 'drivers'] },
    { key: 'inventory', name: 'RDC Inventory Clerk', permissions: 'Inventory + Processing', defaultPerms: ['dashboard', 'stock', 'orders', 'receiving'] },
    { key: 'sales', name: 'Sales Representative', permissions: 'Sales + Orders', defaultPerms: ['dashboard', 'orders', 'customers', 'products'] },
    { key: 'driver', name: 'Delivery Driver', permissions: 'Delivery + Navigation', defaultPerms: ['routes', 'deliveries', 'proof'] }
  ];

  const roles = roleData.map(role => ({
    ...role,
    users: users.filter(u => u.role === role.key).length
  }));

  const allPermissions = [
    'dashboard', 'users', 'roles', 'config', 'backup', 'security',
    'reports', 'billing', 'analytics', 'routes', 'tracking', 'drivers',
    'stock', 'orders', 'receiving', 'customers', 'products', 'deliveries', 'proof'
  ];

  const handleEdit = (role: any) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      permissions: role.defaultPerms || []
    });
    setShowEditModal(true);
  };

  const handleSave = async () => {
    if (!selectedRole) return;
    setIsSubmitting(true);
    // Simulate API call (in real app, would update role in database)
    await new Promise(r => setTimeout(r, 500));
    toast.success(`Role "${formData.name}" updated successfully`);
    setShowEditModal(false);
    setIsSubmitting(false);
  };

  const togglePermission = (perm: string) => {
    if (formData.permissions.includes(perm)) {
      setFormData({ ...formData, permissions: formData.permissions.filter(p => p !== perm) });
    } else {
      setFormData({ ...formData, permissions: [...formData.permissions, perm] });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Roles & Permissions</h2>
        <button
          onClick={() => toast.success('Opening role definition wizard...')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
        >
          Define New Role
        </button>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Role Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Active Users</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Primary Permissions</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {roles.map((role, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-bold text-gray-900">{role.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{role.users}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{role.permissions}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleEdit(role)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Role Modal */}
      {showEditModal && selectedRole && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Edit Role: {selectedRole.name}</h3>
                <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                  {allPermissions.map(perm => (
                    <label key={perm} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(perm)}
                        onChange={() => togglePermission(perm)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm capitalize">{perm}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ModulesView() {
  const modules = [
    { name: 'MongoDB Atlas', category: 'Database', status: 'Connected', latency: '42ms' },
    { name: 'Google Maps API', category: 'Geography', status: 'Connected', latency: '120ms' },
    { name: 'Sonner Toast', category: 'UI/UX', status: 'Active', latency: 'N/A' },
    { name: 'Express Server', category: 'Backend', status: 'Running', port: '5001' }
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Module Connections</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modules.map((mod, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${mod.status === 'Connected' || mod.status === 'Running' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                <Database size={24} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">{mod.name}</h4>
                <p className="text-xs text-gray-500">{mod.category} {mod.port ? `• Port ${mod.port}` : ''}</p>
              </div>
            </div>
            <div className="text-right">
              <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${mod.status === 'Connected' || mod.status === 'Running' || mod.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {mod.status}
              </span>
              {mod.latency && <p className="text-[10px] text-gray-400 mt-1">{mod.latency}</p>}
              <button
                onClick={() => toast.info(`Managing ${mod.name} endpoint configuration...`)}
                className="text-blue-600 hover:text-blue-700 text-sm font-bold mt-2 block"
              >
                Manage
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConfigView() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">System Configuration</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">RDC Configuration</h3>
          <div className="space-y-4">
            {['RDC North Terminal', 'RDC South Logistics', 'RDC East Distribution', 'RDC West Hub'].map((rdc, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">{rdc}</span>
                <button
                  onClick={() => toast.promise(new Promise(r => setTimeout(r, 1000)), { loading: `Connecting to ${rdc}...`, success: `${rdc} settings synchronized`, error: 'Connection failed' })}
                  className="text-blue-600 text-xs font-bold hover:underline"
                >
                  Manage
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Global Parameters</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Default Currency</span>
              <span className="font-bold">USD ($)</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">System Language</span>
              <span className="font-bold">English (US)</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Timezone</span>
              <span className="font-bold">UTC+5:30</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationsView() {
  const notifications = [
    { id: 1, type: 'Alert', message: 'System maintenance scheduled for Sunday at 02:00 AM', status: 'Sent' },
    { id: 2, type: 'Update', message: 'New driver app version 1.2.5 published', status: 'Pending' },
    { id: 3, type: 'Security', message: 'Unauthorized login attempt blocked from IP 45.12.33.1', status: 'Sent' }
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">System Notifications</h2>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Message</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {notifications.map((notif) => (
              <tr key={notif.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${notif.type === 'Alert' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                    {notif.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">{notif.message}</td>
                <td className="px-6 py-4 text-sm font-medium">{notif.status}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => toast.info(`Viewing details for: ${notif.message.substring(0, 30)}...`)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-bold"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AuditLogsView() {
  const logs = [
    { id: 1, timestamp: '2026-01-18 10:15:32', user: 'admin@isdn.com', action: 'User Created', details: 'Created user: John Doe', ip: '192.168.1.100' },
    { id: 2, timestamp: '2026-01-18 10:10:15', user: 'manager@isdn.com', action: 'Report Generated', details: 'Sales Report Q4 2025', ip: '192.168.1.105' },
    { id: 3, timestamp: '2026-01-18 09:45:22', user: 'sales@isdn.com', action: 'Order Created', details: 'Order #ORD-2026-001', ip: '192.168.1.110' },
    { id: 4, timestamp: '2026-01-18 09:30:10', user: 'admin@isdn.com', action: 'Settings Updated', details: 'Email notification settings', ip: '192.168.1.100' }
  ];

  const [search, setSearch] = useState('');

  const filteredLogs = logs.filter(log =>
    log.user.toLowerCase().includes(search.toLowerCase()) ||
    log.action.toLowerCase().includes(search.toLowerCase()) ||
    log.details.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Audit Logs</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search logs..."
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            onClick={() => toast.success('Filtering logs...')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-blue-700"
          >
            Filter
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Timestamp</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Action</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Details</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{log.timestamp}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{log.user}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{log.details}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{log.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end mt-4">
        <button
          onClick={() => toast.success('Exporting logs for the last 24 hours...')}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-bold"
        >
          Export
        </button>
      </div>
    </div>
  );
}

function PerformanceView() {
  const metrics = [
    { label: 'API Response Time', value: '45ms', status: 'Optimal' },
    { label: 'Database Load', value: '12%', status: 'Normal' },
    { label: 'Server Memory', value: '2.4GB / 8GB', status: 'Stable' },
    { label: 'Error Rate', value: '0.02%', status: 'Healthy' }
  ];

  const fetchStats = () => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 1500)),
      {
        loading: 'Refreshing performance metrics...',
        success: 'Performance stats updated',
        error: 'Failed to refresh stats'
      }
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">System Performance</h2>
        <button
          onClick={fetchStats}
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 font-bold text-sm"
        >
          Refresh Stats
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map((m, i) => (
          <div key={i} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500 uppercase font-bold">{m.label}</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{m.value}</p>
            <span className="text-[10px] text-green-600 font-bold">● {m.status}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4 text-center">CPU Usage (Last 24h)</h3>
          <div className="h-48 flex items-end justify-between gap-1 px-2">
            {[40, 35, 50, 45, 60, 55, 40, 30, 45, 50, 70, 65, 50, 40, 35].map((h, i) => (
              <div key={i} className="bg-blue-500 w-full rounded-t-sm transition-all hover:bg-blue-600" style={{ height: `${h}%` }}></div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-gray-400 mt-2 italic">
            <span>00:00</span>
            <span>12:00</span>
            <span>23:59</span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4 text-center">Concurrent Users</h3>
          <div className="h-48 flex items-end justify-between gap-1 px-2">
            {[20, 25, 30, 45, 50, 40, 35, 30, 45, 60, 80, 75, 60, 40, 30].map((h, i) => (
              <div key={i} className="bg-green-500 w-full rounded-t-sm transition-all hover:bg-green-600" style={{ height: `${h}%` }}></div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-gray-400 mt-2 italic">
            <span>00:00</span>
            <span>12:00</span>
            <span>23:59</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function BackupView() {
  const handleManualBackup = () => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 3000)),
      {
        loading: 'Backing up system data to AWS S3...',
        success: 'Manual backup completed successfully',
        error: 'Backup failed'
      }
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Backup & Recovery</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Backup History</h3>
          <div className="space-y-3">
            {[
              { date: '2026-01-18 02:00 AM', size: '2.4 GB', status: 'Success', type: 'System' },
              { date: '2026-01-17 02:00 AM', size: '2.3 GB', status: 'Success', type: 'Database' },
              { date: '2026-01-16 02:00 AM', size: '2.3 GB', status: 'Success', type: 'Full' },
              { date: '2026-01-15 02:00 AM', size: '2.3 GB', status: 'Failed', type: 'Incremental' }
            ].map((backup, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${backup.status === 'Success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    <Database size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{backup.date}</p>
                    <p className="text-xs text-gray-500">{backup.type} • {backup.size}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${backup.status === 'Success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {backup.status}
                  </span>
                  <button
                    onClick={() => toast.success(`Starting download: backup_${backup.type.toLowerCase()}.zip`)}
                    className="text-blue-600 text-xs font-bold hover:underline"
                  >
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-4">
            <button
              onClick={handleManualBackup}
              className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 font-bold transition-all shadow-md"
            >
              Trigger Manual Backup
            </button>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h4 className="text-sm font-bold text-blue-900 mb-2">Automated Schedule</h4>
              <p className="text-xs text-blue-700 leading-relaxed">
                Daily backups are scheduled for **02:00 AM UTC**. Retention policy: 30 days stored on AWS S3.
              </p>
            </div>
            <button
              onClick={() => toast.error('Emergency Restore requires supervisor authorization override')}
              className="w-full text-red-600 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 text-xs font-bold"
            >
              Restore System from Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SecurityView({ isLocked, onToggleLock }: { isLocked: boolean, onToggleLock: () => void }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Security & Policies</h2>
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Access Controls</h3>
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                <p className="text-xs text-gray-500">Require 2FA for all roles</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="font-medium text-gray-900">IP Whitelisting</p>
                <p className="text-xs text-gray-500">Limit access to office IP range</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Password Policies</h3>
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="font-medium text-gray-900">Force Expiration</p>
                <p className="text-xs text-gray-500">Passwords expire every 90 days</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="font-medium text-gray-900">Biometric Login</p>
                <p className="text-xs text-gray-500">Allow FaceID/TouchID on mobile</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        <div className={`mt-12 p-4 rounded-lg border transition-all ${isLocked ? 'bg-red-600 border-red-700 text-white' : 'bg-red-50 border-red-100'}`}>
          <h4 className={`text-sm font-bold mb-2 ${isLocked ? 'text-white' : 'text-red-900'}`}>Emergency Protocol</h4>
          <p className={`text-xs leading-relaxed mb-4 ${isLocked ? 'text-white/90' : 'text-red-700'}`}>
            {isLocked
              ? 'SYSTEM IS CURRENTLY LOCKED. All active sessions are suspended and new logins are blocked.'
              : 'In case of a breach, use the "System Lock" to freeze all active sessions and suspend new logins.'}
          </p>
          <button
            onClick={onToggleLock}
            className={`px-6 py-2 rounded-lg font-bold text-sm shadow-sm transition-all ${isLocked ? 'bg-white text-red-600 hover:bg-gray-100' : 'bg-red-600 text-white hover:bg-red-700'}`}
          >
            {isLocked ? 'UNLOCK SYSTEM' : 'SYSTEM LOCK (EMERGENCY)'}
          </button>
        </div>
      </div>
    </div>
  );
}
