import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RepPerformance {
    name: string;
    revenue: number;
    orders: number;
    conversion: string;
}

interface SalesData {
    repPerformance: RepPerformance[];
    salesTrend: { month: string; sales: number }[];
}

export function SalesPerformanceView({ data }: { data: SalesData }) {
    if (!data) return null;
    const { repPerformance, salesTrend } = data;

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Sales Performance Analytics</h2>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Monthly Sales Trend</h3>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={salesTrend}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                            <Bar dataKey="sales" fill="#2563eb" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-4">Sales by Representative</h3>
                    <div className="space-y-3">
                        {repPerformance.map((rep, index) => (
                            <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="font-medium text-gray-900">{rep.name}</p>
                                    <p className="font-bold text-blue-600">${rep.revenue.toLocaleString()}</p>
                                </div>
                                <div className="flex items-center justify-between text-xs text-gray-600">
                                    <span>{rep.orders} orders</span>
                                    <span>{rep.conversion} conversion</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
