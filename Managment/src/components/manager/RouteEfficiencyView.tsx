import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function RouteEfficiencyView({ data }: { data: any }) {
    if (!data || data.length === 0) return (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500 font-medium">No Route Efficiency Data Available</p>
            <p className="text-sm text-gray-400 mt-1">Wait for deliveries to populate route statistics.</p>
        </div>
    );

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Route Efficiency Analytics</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-4">Delivery Volume by Region</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="region" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="deliveries" fill="#4f46e5" name="Deliveries" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-4">Efficiency & Speed</h3>
                    <div className="space-y-4">
                        {data.map((route: any, i: number) => (
                            <div key={i} className="p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-medium text-gray-900">{route.region}</h4>
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${route.efficiency > 90 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {route.efficiency}% Eff.
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="flex flex-col">
                                        <span className="text-gray-500">Avg Delivery Time</span>
                                        <span className="font-semibold">{route.avgTime} mins</span>
                                    </div>
                                    <div className="flex flex-col text-right">
                                        <span className="text-gray-500">Success Rate</span>
                                        <span className="font-semibold text-blue-600">{Math.floor((route.deliveries * 0.98))} Orders</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
