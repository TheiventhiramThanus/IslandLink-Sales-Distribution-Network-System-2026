import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Package, Truck, CheckCircle2, Clock, Phone, MessageCircle, Navigation2 } from 'lucide-react';
import { GoogleMap, useJsApiLoader, Marker, Polyline } from '@react-google-maps/api';
import type { Page, Order } from '../../types';

interface OrderTrackingProps {
    order: Order | null;
    onNavigate: (page: Page) => void;
}

const mapContainerStyle = {
    width: '100%',
    height: '100%'
};

const defaultCenter = {
    lat: 6.9271,
    lng: 79.8612
};

const GOOGLE_MAPS_LIBRARIES: ("geometry" | "places")[] = ['geometry', 'places'];

export function OrderTracking({ order, onNavigate }: OrderTrackingProps) {
    const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [destinationLocation, setDestinationLocation] = useState<{ lat: number; lng: number } | null>(null);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: GOOGLE_MAPS_LIBRARIES
    });

    // Geocode delivery address
    useEffect(() => {
        if (isLoaded && order?.deliveryAddress) {
            const geocoder = new google.maps.Geocoder();
            let addressToGeocode = order.deliveryAddress;

            if (!addressToGeocode.toLowerCase().includes('sri lanka')) {
                addressToGeocode += ', Sri Lanka';
            }

            geocoder.geocode({
                address: addressToGeocode,
                region: 'LK'
            }, (results, status) => {
                if (status === 'OK' && results && results[0]) {
                    const location = results[0].geometry.location;
                    setDestinationLocation({
                        lat: location.lat(),
                        lng: location.lng()
                    });
                } else {
                    setDestinationLocation({
                        lat: 6.9271,
                        lng: 79.8612
                    });
                }
            });
        }
    }, [isLoaded, order?.deliveryAddress]);

    // Mock driver location (in production, fetch from backend)
    useEffect(() => {
        if (destinationLocation) {
            setDriverLocation({
                lat: destinationLocation.lat - 0.01,
                lng: destinationLocation.lng - 0.01
            });
        }
    }, [destinationLocation]);

    const getStatusProgress = (status: string) => {
        const statuses = ['Pending', 'Approved', 'Processing', 'Confirmed', 'Ready for Delivery', 'ReadyForDispatch', 'Assigned', 'In Transit', 'Delivered'];
        const currentIndex = statuses.indexOf(status);
        if (currentIndex === -1) return 0;
        return ((currentIndex + 1) / statuses.length) * 100;
    };

    const getStatusIcon = (status: string, currentStatus: string) => {
        const statuses = ['Pending', 'Approved', 'Processing', 'Confirmed', 'Ready for Delivery', 'ReadyForDispatch', 'Assigned', 'In Transit', 'Delivered'];
        const statusIndex = statuses.indexOf(status);
        const currentIndex = statuses.indexOf(currentStatus);

        if (statusIndex < currentIndex) {
            return <CheckCircle2 className="w-5 h-5 text-green-500" />;
        } else if (statusIndex === currentIndex) {
            return <div className="w-5 h-5 rounded-full bg-orange-500 animate-pulse" />;
        } else {
            return <div className="w-5 h-5 rounded-full border-2 border-gray-300 bg-white" />;
        }
    };

    if (!order) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-500">No order selected</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => onNavigate('dashboard')}
                            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-700" />
                        </button>
                        <div className="text-center">
                            <h1 className="text-lg font-bold text-gray-900">Location Tracking</h1>
                            <p className="text-xs text-gray-500">Real-time delivery updates</p>
                        </div>
                        <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                            <MessageCircle className="w-5 h-5 text-gray-700" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Map */}
            <div className="relative h-[400px] bg-gray-200">
                {isLoaded ? (
                    <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={driverLocation || destinationLocation || defaultCenter}
                        zoom={14}
                        options={{
                            zoomControl: false,
                            streetViewControl: false,
                            mapTypeControl: false,
                            fullscreenControl: false,
                            styles: [
                                {
                                    "featureType": "all",
                                    "elementType": "labels.text.fill",
                                    "stylers": [{ "color": "#7c93a3" }]
                                }
                            ]
                        }}
                    >
                        {/* Driver Location */}
                        {driverLocation && (
                            <Marker
                                position={driverLocation}
                                icon={{
                                    path: google.maps.SymbolPath.CIRCLE,
                                    scale: 12,
                                    fillColor: '#1f2937',
                                    fillOpacity: 1,
                                    strokeColor: '#ffffff',
                                    strokeWeight: 3
                                }}
                                title="Driver Location"
                            />
                        )}

                        {/* Destination */}
                        {destinationLocation && (
                            <Marker
                                position={destinationLocation}
                                icon={{
                                    url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                                    scaledSize: new google.maps.Size(40, 40)
                                }}
                                title="Delivery Location"
                            />
                        )}

                        {/* Route Line */}
                        {driverLocation && destinationLocation && (
                            <Polyline
                                path={[driverLocation, destinationLocation]}
                                options={{
                                    strokeColor: '#6b7280',
                                    strokeWeight: 4,
                                    strokeOpacity: 0.8,
                                    geodesic: true
                                }}
                            />
                        )}
                    </GoogleMap>
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-4 border-gray-400 border-t-transparent rounded-full animate-spin" />
                            <p className="text-sm text-gray-500">Loading map...</p>
                        </div>
                    </div>
                )}

                {/* Map Overlay - Status Badge */}
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-gray-200">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs font-bold text-gray-700">Live Tracking</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-6 space-y-6">
                {/* Order ID Card */}
                <div className="bg-white rounded-3xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Tracking Number</p>
                            <p className="text-2xl font-black text-gray-900">ID: {order.orderId}</p>
                        </div>
                        <div className="px-4 py-2 bg-orange-50 rounded-full">
                            <p className="text-xs font-bold text-orange-600">{order.status}</p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative">
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-500"
                                style={{ width: `${getStatusProgress(order.status)}%` }}
                            />
                        </div>
                        <div className="flex justify-between mt-3">
                            <div className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-orange-500" />
                                <span className="text-xs font-medium text-gray-600">Warehouse</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-orange-500" />
                                <span className="text-xs font-medium text-gray-600">Delivery</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Delivery Info */}
                <div className="bg-white rounded-3xl shadow-sm p-6 border border-gray-100">
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4">Delivery Information</h3>

                    <div className="space-y-4">
                        {/* From */}
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                <Package className="w-5 h-5 text-blue-600 text-black" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">From</p>
                                <p className="text-sm font-bold text-gray-900">ISDN Warehouse</p>
                                <p className="text-xs text-gray-500 mt-1">Colombo Distribution Center</p>
                            </div>
                        </div>

                        {/* Dotted Line */}
                        <div className="ml-5 border-l-2 border-dashed border-gray-200 h-8" />

                        {/* To */}
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                                <MapPin className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">To</p>
                                <p className="text-sm font-bold text-gray-900">{order.customer}</p>
                                <p className="text-xs text-gray-500 mt-1">{order.deliveryAddress}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Package Details */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-3xl shadow-sm p-6 border border-orange-200/50">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="relative">
                            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                <Package className="w-10 h-10 text-orange-500" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold text-white">{order.items?.length || 1}</span>
                            </div>
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">Package Details</p>
                            <p className="text-lg font-black text-gray-900">Order #{order.orderId}</p>
                            <p className="text-xs text-gray-600 mt-1">{order.items?.length || 1} item(s)</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Estimated</p>
                            <p className="text-sm font-black text-gray-900">18 Oct 2025</p>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Amount</p>
                            <p className="text-sm font-black text-gray-900">${order.totalAmount?.toFixed(2) || '0.00'}</p>
                        </div>
                    </div>
                </div>

                {/* Driver Info (if in transit) */}
                {order.status === 'In Transit' && (
                    <div className="bg-white rounded-3xl shadow-sm p-6 border border-gray-100">
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4">Your Driver</h3>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-black flex items-center justify-center text-white shadow-lg">
                                    <span className="text-xl font-black">D</span>
                                </div>
                                <div>
                                    <p className="text-base font-black text-gray-900">Driver Name</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="flex items-center gap-1">
                                            <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                            <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                            <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                            <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                            <div className="w-3 h-3 rounded-full bg-gray-200" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-500">4.0</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button className="w-12 h-12 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center hover:bg-green-100 transition-all">
                                    <Phone className="w-5 h-5 text-green-600" />
                                </button>
                                <button className="w-12 h-12 rounded-full bg-blue-50 border-2 border-blue-200 flex items-center justify-center hover:bg-blue-100 transition-all">
                                    <MessageCircle className="w-5 h-5 text-blue-600 text-black" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Status Timeline */}
                <div className="bg-white rounded-3xl shadow-sm p-6 border border-gray-100">
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-6">Order Status</h3>

                    <div className="space-y-6">
                        {['Pending', 'Approved', 'Processing', 'Confirmed', 'Ready for Delivery', 'ReadyForDispatch', 'Assigned', 'In Transit', 'Delivered'].map((status, index) => (
                            <div key={status} className="flex items-start gap-4">
                                <div className="flex flex-col items-center">
                                    {getStatusIcon(status, order.status)}
                                    {index < 8 && (
                                        <div className={`w-0.5 h-12 mt-2 ${['Pending', 'Approved', 'Processing', 'Confirmed', 'Ready for Delivery', 'ReadyForDispatch', 'Assigned', 'In Transit', 'Delivered'].indexOf(order.status) > index
                                            ? 'bg-green-500'
                                            : 'bg-gray-200'
                                            }`} />
                                    )}
                                </div>
                                <div className="flex-1 pb-4">
                                    <p className={`text-sm font-bold ${status === order.status ? 'text-orange-600' :
                                        ['Pending', 'Approved', 'Processing', 'Confirmed', 'Ready for Delivery', 'ReadyForDispatch', 'Assigned', 'In Transit', 'Delivered'].indexOf(order.status) > index
                                            ? 'text-green-600'
                                            : 'text-gray-400'
                                        }`}>
                                        {status}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {status === order.status ? 'Current status' :
                                            ['Pending', 'Approved', 'Processing', 'Confirmed', 'Ready for Delivery', 'ReadyForDispatch', 'Assigned', 'In Transit', 'Delivered'].indexOf(order.status) > index
                                                ? 'Completed'
                                                : 'Pending'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Button */}
                <button
                    onClick={() => onNavigate('dashboard')}
                    className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white font-black py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                    <ArrowLeft className="w-5 h-5" />
                    BACK TO ORDERS
                </button>
            </div>
        </div>
    );
}
