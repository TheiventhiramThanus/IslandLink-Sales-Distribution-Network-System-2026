import { TrendingUp, Truck } from 'lucide-react';

interface StaffMetric {
    name: string;
    metric1: string;
    value1: number | string;
    metric2?: string;
    value2?: number | string;
    performanceScore: number;
}

interface StaffData {
    sales: StaffMetric[];
    drivers: StaffMetric[];
}

export function StaffPerformanceView({ data }: { data: StaffData }) {
    if (!data) return (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500 font-medium">No Staff Performance Data Available</p>
            <p className="text-sm text-gray-400 mt-1">Check server connection or try refreshing.</p>
        </div>
    );

    const { sales, drivers } = data;

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Staff Performance Analytics</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales Reps */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <TrendingUp size={20} className="text-blue-600" /> Top Sales Representatives
                    </h3>
                    <div className="space-y-4">
                        {sales && sales.length > 0 ? sales.map((rep, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">{rep.name}</p>
                                    <p className="text-xs text-gray-500">{rep.metric2}: {rep.value2}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-blue-600">${typeof rep.value1 === 'number' ? rep.value1.toLocaleString() : rep.value1}</p>
                                    <span className="text-xs font-medium text-green-600">Perf: {rep.performanceScore}%</span>
                                </div>
                            </div>
                        )) : <p className="text-sm text-gray-400 italic text-center py-4">No active sales representatives found.</p>}
                    </div>
                </div>

                {/* Drivers */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Truck size={20} className="text-indigo-600" /> Delivery Driver Performance
                    </h3>
                    <div className="space-y-4">
                        {drivers && drivers.length > 0 ? drivers.map((driver, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">{driver.name}</p>
                                    <p className="text-xs text-gray-500">{driver.metric1}: {driver.value1}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-indigo-600">{driver.value2}</p>
                                    <span className="text-xs font-medium text-green-600">Score: {driver.performanceScore}</span>
                                </div>
                            </div>
                        )) : <p className="text-sm text-gray-400 italic text-center py-4">No active drivers found.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
