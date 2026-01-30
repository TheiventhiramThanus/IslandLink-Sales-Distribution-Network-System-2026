/// <reference types="vite/client" />
import { useState, useEffect, useCallback } from 'react';
import { MapPin, Navigation, Truck, Clock, AlertCircle } from 'lucide-react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const containerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '0.75rem'
};

const defaultCenter = {
    lat: 6.9271,
    lng: 79.8612
};

const darkMapStyle = [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    {
        featureType: "administrative.locality",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
    },
    {
        featureType: "poi",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
    },
    {
        featureType: "poi.park",
        elementType: "geometry",
        stylers: [{ color: "#263c3f" }],
    },
    {
        featureType: "poi.park",
        elementType: "labels.text.fill",
        stylers: [{ color: "#6b9a76" }],
    },
    {
        featureType: "road",
        elementType: "geometry",
        stylers: [{ color: "#38414e" }],
    },
    {
        featureType: "road",
        elementType: "geometry.stroke",
        stylers: [{ color: "#212a37" }],
    },
    {
        featureType: "road",
        elementType: "labels.text.fill",
        stylers: [{ color: "#9ca5b3" }],
    },
    {
        featureType: "road.highway",
        elementType: "geometry",
        stylers: [{ color: "#746855" }],
    },
    {
        featureType: "road.highway",
        elementType: "geometry.stroke",
        stylers: [{ color: "#1f2835" }],
    },
    {
        featureType: "road.highway",
        elementType: "labels.text.fill",
        stylers: [{ color: "#f3d19c" }],
    },
    {
        featureType: "transit",
        elementType: "geometry",
        stylers: [{ color: "#2f3948" }],
    },
    {
        featureType: "transit.station",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
    },
    {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#17263c" }],
    },
    {
        featureType: "water",
        elementType: "labels.text.fill",
        stylers: [{ color: "#515c6d" }],
    },
    {
        featureType: "water",
        elementType: "labels.text.stroke",
        stylers: [{ color: "#17263c" }],
    },
];

interface MapViewProps {
    markers?: { lat: number; lng: number; title?: string; status?: string }[];
}

export function MapView({ markers = [] }: MapViewProps) {
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'isdn-google-maps-loader',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyDYJnXBqSu74EfF6PuUy7geqeKvj-nMApY',
        libraries: ['geometry', 'places']
    });

    const [, setMap] = useState<google.maps.Map | null>(null);

    const onLoad = useCallback(function callback(map: google.maps.Map) {
        setMap(map);
    }, []);

    const onUnmount = useCallback(function callback(_map: google.maps.Map) {
        setMap(null);
    }, []);

    const activeMarkers = markers.length > 0 ? markers : [
        { lat: 6.9271, lng: 79.8612, title: 'Colombo Central', status: 'In Transit' },
        { lat: 6.9344, lng: 79.8428, title: 'Fort Station', status: 'Ready for Delivery' },
        { lat: 6.9147, lng: 79.8772, title: 'Kollupitiya', status: 'Pending' }
    ];

    const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyDYJnXBqSu74EfF6PuUy7geqeKvj-nMApY';

    if (loadError) {
        return (
            <div className="h-full w-full bg-red-50 border border-red-200 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                <AlertCircle className="w-10 h-10 text-red-500 mb-2" />
                <h3 className="text-red-900 font-bold">Map Loading Error</h3>
                <p className="text-red-700 text-sm mt-1">{loadError.message}</p>
                <div className="mt-4 text-[10px] text-red-400 bg-white p-2 rounded border border-red-100">
                    Error Code: {loadError.name}
                </div>
            </div>
        );
    }

    if (!API_KEY) {
        return <FallbackMap markers={activeMarkers} />;
    }

    if (!isLoaded) {
        return <div className="h-full w-full bg-slate-900 animate-pulse rounded-xl" />;
    }

    return (
        <div className="h-full w-full rounded-xl overflow-hidden relative">
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={defaultCenter}
                zoom={13}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={{
                    styles: darkMapStyle,
                    disableDefaultUI: false,
                    zoomControl: true,
                    streetViewControl: false,
                    mapTypeControl: false
                }}
            >
                {activeMarkers.map((marker, idx) => (
                    <Marker
                        key={idx}
                        position={{ lat: marker.lat, lng: marker.lng }}
                        title={marker.title}
                        icon={window.google ? {
                            path: window.google.maps.SymbolPath.CIRCLE,
                            scale: 8,
                            fillColor: marker.status === 'In Transit' ? '#f97316' : '#22c55e',
                            fillOpacity: 1,
                            strokeWeight: 2,
                            strokeColor: 'white',
                        } : undefined}
                    />
                ))}
            </GoogleMap>

            {/* Overlay Legend */}
            <div className="absolute bottom-4 left-4 right-4 z-[9999] pointer-events-none">
                <div className="bg-white/90 backdrop-blur-md rounded-xl p-3 border border-gray-200 shadow-lg inline-block pointer-events-auto">
                    <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-700">Live Fleet</span>
                        </div>
                        <div className="h-4 w-px bg-gray-300"></div>
                        <div className="flex items-center gap-2">
                            <Clock size={14} className="text-gray-500" />
                            <span className="text-gray-500">Updated now</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function FallbackMap({ markers }: { markers: any[] }) {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl overflow-hidden relative">
            {/* Simulated Map Background */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234ade80' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundSize: '60px 60px'
                }} />
            </div>

            {/* Header */}
            <div className="absolute top-4 left-4 right-4 z-10">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-green-500 w-10 h-10 rounded-lg flex items-center justify-center">
                                <Navigation size={20} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold">Live Tracking (Simulation)</h3>
                                <p className="text-gray-400 text-xs">
                                    {currentTime.toLocaleTimeString()} • {markers.length} Active Routes
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 bg-green-500/20 px-3 py-1 rounded-full">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-green-400 text-xs font-medium">LIVE</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Grid Visualization */}
            <div className="absolute inset-0 flex items-center justify-center p-16">
                <div className="relative w-full h-full max-w-2xl">
                    {/* Connection lines */}
                    <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
                        {markers.map((_, i) => {
                            if (i === markers.length - 1) return null;
                            const x1 = (i / (markers.length - 1)) * 100;
                            const x2 = ((i + 1) / (markers.length - 1)) * 100;
                            return (
                                <line
                                    key={i}
                                    x1={`${x1}%`}
                                    y1="50%"
                                    x2={`${x2}%`}
                                    y2="50%"
                                    stroke="#4ade80"
                                    strokeWidth="2"
                                    strokeDasharray="8,4"
                                    className="animate-pulse"
                                />
                            );
                        })}
                    </svg>

                    {/* Delivery Points */}
                    {markers.map((point, i) => (
                        <div
                            key={i}
                            className="absolute transform -translate-x-1/2 -translate-y-1/2"
                            style={{
                                left: `${(i / Math.max(markers.length - 1, 1)) * 100}%`,
                                top: '50%',
                                zIndex: 10
                            }}
                        >
                            <div className="flex flex-col items-center gap-2">
                                <div className={`relative w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${point.status === 'In Transit' ? 'bg-orange-500' :
                                    point.status === 'Delivered' ? 'bg-green-500' :
                                        point.status === 'Ready for Delivery' ? 'bg-blue-500' :
                                            'bg-gray-500'
                                    }`}>
                                    {point.status === 'In Transit' ? (
                                        <Truck size={20} className="text-white" />
                                    ) : (
                                        <MapPin size={20} className="text-white" />
                                    )}
                                    {point.status === 'In Transit' && (
                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-ping" />
                                    )}
                                </div>
                                <div className="bg-slate-800/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg border border-slate-700 text-center min-w-max">
                                    <p className="text-white text-xs font-semibold">{point.title}</p>
                                    <p className="text-gray-400 text-[10px]">
                                        {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
