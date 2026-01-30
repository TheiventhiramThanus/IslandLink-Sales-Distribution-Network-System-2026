import { StatCard } from '../StatCard';
import { DollarSign, FileText, Truck, Package } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DashboardData {
    totalRevenue: number;
    totalOrders: number;
    pendingDeliveries: number;
    inventoryValue: number;
    deliveryRate: number;
}

export function ExecutiveDashboardView({ data }: { data: DashboardData }) {
    if (!data) return null;
    const { totalRevenue, totalOrders, pendingDeliveries: _, inventoryValue, deliveryRate } = data;

    const salesData = [
        { month: 'Jul', revenue: totalRevenue * 0.1 },
        { month: 'Aug', revenue: totalRevenue * 0.12 },
        { month: 'Sep', revenue: totalRevenue * 0.15 },
        { month: 'Oct', revenue: totalRevenue * 0.11 },
        { month: 'Nov', revenue: totalRevenue * 0.2 },
        { month: 'Dec', revenue: totalRevenue * 0.18 },
        { month: 'Jan', revenue: totalRevenue * 0.14 }
    ];

    const rdcData = [
        { name: 'RDC North', value: 400 },
        { name: 'RDC South', value: 300 },
        { name: 'RDC East', value: 300 },
        { name: 'RDC West', value: 200 }
    ];

    const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd'];

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Executive Dashboard</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Revenue (YTD)"
                    value={`$${(totalRevenue / 1000).toFixed(1)}K`}
                    icon={DollarSign}
                    trend={{ value: '+18.2% vs last year', isPositive: true }}
                    color="bg-green-600"
                />
                <StatCard
                    title="Total Orders"
                    value={totalOrders.toString()}
                    icon={FileText}
                    trend={{ value: '+12.5%', isPositive: true }}
                    color="bg-blue-600"
                />
                <StatCard
                    title="Delivery Rate"
                    value={`${deliveryRate}%`}
                    icon={Truck}
                    trend={{ value: '+2.1%', isPositive: true }}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Inventory Value"
                    value={`$${(inventoryValue / 1000).toFixed(0)}K`}
                    icon={Package}
                    color="bg-purple-600"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-4">Revenue Trend (Est.)</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={salesData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                                <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-4">RDC Distribution</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={rdcData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }: { name: string, percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {rdcData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
