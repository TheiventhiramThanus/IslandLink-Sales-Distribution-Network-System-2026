import { Shield, ShoppingCart, Package, Truck, Navigation, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function RoleSelection() {
  const navigate = useNavigate();
  const roles = [
    {
      id: 'admin',
      title: 'System Administrator',
      description: 'Full system control and configuration',
      icon: Shield,
      color: 'bg-blue-600'
    },
    {
      id: 'sales',
      title: 'Sales Representative',
      description: 'Create and manage orders',
      icon: ShoppingCart,
      color: 'bg-blue-500'
    },
    {
      id: 'inventory',
      title: 'RDC Inventory Clerk',
      description: 'Stock management and operations',
      icon: Package,
      color: 'bg-blue-500'
    },
    {
      id: 'logistics',
      title: 'Logistics Officer',
      description: 'Delivery control and monitoring',
      icon: Truck,
      color: 'bg-blue-500'
    },
    {
      id: 'driver',
      title: 'Delivery Driver',
      description: 'Mobile delivery operations',
      icon: Navigation,
      color: 'bg-blue-500'
    },
    {
      id: 'manager',
      title: 'Head Office Manager',
      description: 'Analytics and reporting',
      icon: BarChart3,
      color: 'bg-blue-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">ISDN <span className="text-blue-600">Distribution</span></h1>
          <p className="text-xl text-gray-600 font-medium">Enterprise Management System</p>
          <p className="text-sm text-gray-400 mt-2">Select an authorized role to access the terminal</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <button
                key={role.id}
                onClick={() => navigate(`/${role.id}`)}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-2xl hover:border-blue-200 transition-all duration-300 hover:-translate-y-1 text-left group overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 group-hover:bg-blue-100 transition-colors" />
                <div className={`${role.color} w-14 h-14 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg relative z-10`}>
                  <Icon className="text-white" size={28} />
                </div>
                <div className="relative z-10">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{role.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed font-medium">{role.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2026 ISDN Management System. Internal Use Only.</p>
        </div>
      </div>
    </div>
  );
}
