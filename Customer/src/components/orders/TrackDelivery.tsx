import { useState, useEffect } from 'react';
import { Package, TruckIcon, MapPin, CheckCircle, Clock, Trash2, Search, Filter, RefreshCw } from 'lucide-react';
import { orderService } from '../../services/api';

interface TrackDeliveryProps {
  user: { id: string; name: string } | null;
}

export function TrackDelivery({ user }: TrackDeliveryProps) {
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hiddenIds, setHiddenIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('hiddenTrackingIds');
    return saved ? JSON.parse(saved) : [];
  });
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchShipments = () => {
    if (user?.id) {
      setLoading(true);
      orderService.getByUser(user.id).then(res => {
        const orderData = res.data.map((order: any) => {
          const status = order.status || 'Pending';
          const isConfirmed = ['Approved', 'Processing', 'Confirmed', 'Ready for Delivery', 'ReadyForDispatch', 'Assigned', 'In Transit', 'Delivered', 'Paid'].includes(status);
          const isPicked = ['Processing', 'Ready for Delivery', 'ReadyForDispatch', 'Assigned', 'In Transit', 'Delivered'].includes(status);
          const isInTransit = ['In Transit', 'Delivered'].includes(status);
          const isDelivered = status === 'Delivered';

          return {
            orderId: order.orderId,
            trackingNumber: `TRK-${order.orderId}`,
            status: status,
            currentLocation: isDelivered ? 'Delivered' : isInTransit ? 'On Route' : 'Distribution Center',
            estimatedDelivery: isDelivered ? 'Delivered' : new Date(new Date(order.orderDate).getTime() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString(),
            timeline: [
              { label: 'Order Placed', date: new Date(order.orderDate).toLocaleString(), completed: true },
              {
                label: 'Order Confirmed',
                date: isConfirmed ? new Date(order.orderDate).toLocaleString() : 'Pending',
                completed: isConfirmed
              },
              {
                label: 'Picked & Packed',
                date: isPicked ? 'Done' : 'Pending',
                completed: isPicked
              },
              {
                label: 'In Transit',
                date: status === 'In Transit' ? 'Current' : isDelivered ? 'Done' : 'Pending',
                completed: isInTransit,
                current: status === 'In Transit'
              },
              {
                label: 'Out for Delivery',
                date: status === 'In Transit' ? 'Current' : isDelivered ? 'Done' : 'Pending',
                completed: isInTransit,
                current: status === 'In Transit'
              },
              {
                label: 'Delivered',
                date: isDelivered ? 'Success' : 'Pending',
                completed: isDelivered,
                current: isDelivered
              },
            ]
          };
        });
        setShipments(orderData);
        setLoading(false);
      }).catch(err => {
        console.error('Track error:', err);
        setLoading(false);
      });
    }
  };

  useEffect(() => {
    fetchShipments();
  }, [user]);

  const handleDelete = (orderId: string) => {
    if (confirm('Remove this shipment from your tracking view?')) {
      const newHidden = [...hiddenIds, orderId];
      setHiddenIds(newHidden);
      localStorage.setItem('hiddenTrackingIds', JSON.stringify(newHidden));
    }
  };

  const clearHidden = () => {
    if (confirm('Restore all hidden shipments?')) {
      setHiddenIds([]);
      localStorage.removeItem('hiddenTrackingIds');
    }
  };

  const filteredShipments = shipments
    .filter(s => !hiddenIds.includes(s.orderId))
    .filter(s => {
      // Search Filter
      const matchesSearch =
        s.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase());

      // Status Filter
      let matchesStatus = true;
      if (filterStatus === 'Active') {
        matchesStatus = ['Pending', 'Processing', 'In Transit', 'Ready for Delivery'].includes(s.status);
      } else if (filterStatus === 'Delivered') {
        matchesStatus = s.status === 'Delivered';
      }

      return matchesSearch && matchesStatus;
    });

  if (loading && shipments.length === 0) return <div className="p-8 text-center text-gray-600">Loading tracking data...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl text-gray-900 mb-2">Track Delivery</h1>
          <p className="text-gray-600">Monitor your shipments in real-time</p>
        </div>

        {/* Filters & Actions */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search Order ID..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white w-full md:w-48"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active Shipments</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            {hiddenIds.length > 0 && (
              <button
                onClick={clearHidden}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-blue-600 text-black hover:bg-blue-50 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Restore Hidden ({hiddenIds.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        {filteredShipments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500">No shipments found matching your filters.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredShipments.map((shipment) => (
              <div key={shipment.orderId} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden group">
                {/* Header */}
                <div className="bg-blue-50 border-b border-blue-100 p-6 relative">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Package className="w-5 h-5 text-blue-600 text-black" />
                        <h3 className="text-lg font-medium text-gray-900">{shipment.orderId}</h3>
                      </div>
                      <p className="text-sm text-gray-600">Tracking: <span className="font-mono font-medium">{shipment.trackingNumber}</span></p>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="text-left md:text-right">
                        <p className="text-sm text-gray-600 mb-1">Current Location</p>
                        <div className="flex items-center space-x-2 text-blue-600 text-black justify-end">
                          <MapPin className="w-4 h-4" />
                          <span className="font-medium">{shipment.currentLocation}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDelete(shipment.orderId)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title="Remove from tracking view"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center space-x-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-600">Estimated Delivery:</span>
                    <span className="font-medium text-gray-900">{shipment.estimatedDelivery}</span>
                  </div>
                </div>

                {/* Timeline */}
                <div className="p-6">
                  <div className="space-y-4">
                    {shipment.timeline.map((item: any, index: number) => (
                      <div key={index} className="flex items-start space-x-4">
                        {/* Icon */}
                        <div className="flex-shrink-0 mt-1">
                          {item.completed ? (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.current ? 'bg-blue-600 text-black text-black' : 'bg-green-600'
                              }`}>
                              {item.current ? (
                                <TruckIcon className="w-4 h-4 text-white" />
                              ) : (
                                <CheckCircle className="w-4 h-4 text-white" />
                              )}
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full border-2 border-gray-300 bg-white"></div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 pb-6 border-l-2 border-gray-200 -ml-4 pl-8 last:border-0">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                            <p className={`font-medium ${item.completed ? 'text-gray-900' : 'text-gray-500'
                              } ${item.current ? 'text-blue-600 text-black' : ''}`}>
                              {item.label}
                            </p>
                            <p className={`text-sm ${item.completed ? 'text-gray-600' : 'text-gray-400'
                              }`}>
                              {item.date}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
