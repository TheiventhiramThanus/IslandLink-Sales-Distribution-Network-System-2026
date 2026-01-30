
export function InventoryReportsView({ data }: { data: any }) {
    if (!data) return null;
    const { totalStock, lowStock, rdcDistribution: _, products } = data;

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Inventory Summary Reports</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Total Stock Value</p>
                    <p className="text-3xl font-bold text-gray-900">${((totalStock * 150) / 1000).toFixed(0)}K</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Stock Items</p>
                    <p className="text-3xl font-bold text-gray-900">{totalStock.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Low Stock Alerts</p>
                    <p className="text-3xl font-bold text-red-600">{lowStock}</p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Product Inventory Detail</h3>
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Product</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Stock</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Available</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Location</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {products.map((p: any) => (
                            <tr key={p._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{p.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-700">{p.stock}</td>
                                <td className="px-6 py-4 text-sm text-gray-900">{p.available}</td>
                                <td className="px-6 py-4 text-sm text-gray-700">{p.location}</td>
                                <td className="px-6 py-4">
                                    <span
                                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${p.status === 'In Stock'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-yellow-100 text-yellow-700'
                                            }`}
                                    >
                                        {p.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
