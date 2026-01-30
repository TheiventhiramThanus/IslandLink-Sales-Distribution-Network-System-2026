import { ArrowLeft, Filter, Navigation } from 'lucide-react';
import { useState } from 'react';
import { BottomNavigation } from './BottomNavigation';
import { Screen } from '../App';

type Tab = 'all' | 'pending' | 'active' | 'completed';

interface OrdersScreenProps {
    onNavigate: (screen: Screen) => void;
    onStartTracking: (orderId: string) => void;
    orders: any[];
}

export function OrdersScreen({ onNavigate, onStartTracking, orders }: OrdersScreenProps) {
    const [activeTab, setActiveTab] = useState<Tab>('all');

    const mappedOrders = orders.map((order: any) => ({
        id: order.orderId,
        _id: order._id,
        customerName: order.customer,
        pickupAddress: 'Warehouse RDC Center', // Simulated warehouse location
        deliveryAddress: order.address,
        distance: 12.3, // Mocked
        time: 25, // Mocked
        payment: order.totalAmount,
        status: order.status === 'Delivered' ? 'completed' : order.status === 'In Transit' ? 'active' : 'pending',
        fuel: 1.2
    }));

    const filteredOrders = activeTab === 'all'
        ? mappedOrders
        : mappedOrders.filter(order => order.status === activeTab);

    const tabs = [
        { id: 'all', label: 'All Orders', count: orders.length },
        { id: 'pending', label: 'Pending', count: orders.filter(o => o.status === 'pending').length },
        { id: 'active', label: 'Active', count: orders.filter(o => o.status === 'active').length },
        { id: 'completed', label: 'Completed', count: orders.filter(o => o.status === 'completed').length }
    ] as const;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-orange-100 text-orange-700';
            case 'active': return 'bg-green-100 text-[#008000]';
            case 'completed': return 'bg-green-100 text-green-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending': return 'Pending Accept';
            case 'active': return 'In Progress';
            case 'completed': return 'Completed';
            default: return status;
        }
    };

    return (
        <div className="h-full flex flex-col bg-gray-50">
            {/* Header */}
            <div className="bg-white px-6 pt-12 pb-4 sticky top-0 z-[1000]" style={{ overflowX: 'visible' }}>
                {/* Logo */}
                <div className="mb-4">
                    <img
                        src="/isdn_logo_green.png"
                        alt="IslandLink ISDN"
                        className="h-[30px] w-auto object-contain"
                        style={{ objectFit: 'contain' }}
                    />
                </div>

                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => onNavigate('dashboard')}
                        className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    <h1 className="text-xl font-semibold text-gray-900">My Orders</h1>
                    <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <Filter className="w-5 h-5 text-gray-700" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${activeTab === tab.id
                                ? 'bg-[#008000] text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {tab.label}
                            <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === tab.id
                                ? 'bg-white/30'
                                : 'bg-gray-200'
                                }`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders List */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                {filteredOrders.map((order) => (
                    <div key={order.id} className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">{order.id}</p>
                                <p className="font-semibold text-gray-900">{order.customerName}</p>
                                <span className={`inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                                    {getStatusLabel(order.status)}
                                </span>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-green-600">${order.payment}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-start gap-2">
                                <div className="w-3 h-3 rounded-full bg-[#008000] mt-1"></div>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500">Pickup</p>
                                    <p className="text-sm text-gray-900">{order.pickupAddress}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="w-3 h-3 rounded-full bg-green-500 mt-1"></div>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500">Delivery</p>
                                    <p className="text-sm text-gray-900">{order.deliveryAddress}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                    <span className="font-semibold text-gray-700">{order.distance} km</span>
                                </span>
                                <span>•</span>
                                <span>{order.time} min</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    ⛽ {order.fuel}L
                                </span>
                            </div>
                            {order.status === 'active' && (
                                <button
                                    onClick={() => onStartTracking(order._id)}
                                    className="bg-[#008000] hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1"
                                >
                                    <Navigation className="w-4 h-4" />
                                    Track
                                </button>
                            )}
                            {order.status === 'pending' && (
                                <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                                    Accept
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {/* Spacing for bottom nav */}
                <div className="h-20"></div>
            </div>

            {/* Bottom Navigation */}
            <BottomNavigation currentScreen="orders" onNavigate={onNavigate} />
        </div>
    );
}
