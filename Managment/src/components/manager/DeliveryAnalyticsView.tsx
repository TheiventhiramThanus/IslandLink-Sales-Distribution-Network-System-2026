
export function DeliveryAnalyticsView({ data }: { data: any }) {
    if (!data) return null;
    const { totalOrders: _, delivered, inTransit, pending, onTimeRate } = data;

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Delivery Performance Analytics</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">On-Time Delivery</p>
                    <p className="text-3xl font-bold text-green-600">{onTimeRate}%</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Completed Deliveries</p>
                    <p className="text-3xl font-bold text-gray-900">{delivered}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">In Transit</p>
                    <p className="text-3xl font-bold text-blue-600">{inTransit}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Pending Orders</p>
                    <p className="text-3xl font-bold text-orange-600">{pending}</p>
                </div>
            </div>
        </div>
    );
}
