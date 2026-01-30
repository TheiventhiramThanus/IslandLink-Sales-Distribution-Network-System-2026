import { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { Navigation, Clock, Truck, PlayCircle, Users, Activity } from 'lucide-react';
import { logisticsService } from '../../services/api';
import { toast } from 'sonner';

interface LiveTrackingViewProps {
    deliveries: any[];
}

const mapContainerStyle = {
    width: '100%',
    height: '600px'
};

const defaultCenter = {
    lat: 6.9271,
    lng: 79.8612 // Colombo, Sri Lanka
};

export function LiveTrackingView({ deliveries }: LiveTrackingViewProps) {
    const [selectedDelivery, setSelectedDelivery] = useState<any>(null);
    const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [isSimulating, setIsSimulating] = useState(false);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
        libraries: ['geometry', 'places']
    });

    const safeDeliveries = Array.isArray(deliveries) ? deliveries : [];
    const activeDeliveries = safeDeliveries.filter(
        (d) => d.status === 'OnTheWay' || d.status === 'Scheduled'
    );

    // Calculate route when delivery is selected
    useEffect(() => {
        if (isLoaded && selectedDelivery && map) {
            const startLocation = selectedDelivery.orderId?.currentLocation || defaultCenter;
            const destinationAddress = selectedDelivery.orderId?.address;

            if (destinationAddress) {
                const directionsService = new google.maps.DirectionsService();
                directionsService.route(
                    {
                        origin: startLocation,
                        destination: destinationAddress,
                        travelMode: google.maps.TravelMode.DRIVING,
                    },
                    (result, status) => {
                        if (status === google.maps.DirectionsStatus.OK && result) {
                            setDirections(result);
                        } else {
                            // toast.error('Failed to calculate route');
                        }
                    }
                );
            }
        }
    }, [isLoaded, selectedDelivery, map]);

    // Mock Simulation Logic
    const startSimulation = () => {
        if (!selectedDelivery || isSimulating) return;
        setIsSimulating(true);
        toast.info("Starting real-time tracking simulation...");

        let steps = 0;
        const interval = setInterval(async () => {
            if (steps > 10) {
                clearInterval(interval);
                setIsSimulating(false);
                toast.success("Delivery reached destination!");
                return;
            }

            // Mock moving coordinates towards a certain direction
            const newLat = (selectedDelivery.orderId?.currentLocation?.lat || defaultCenter.lat) + 0.005;
            const newLng = (selectedDelivery.orderId?.currentLocation?.lng || defaultCenter.lng) + 0.005;

            try {
                await logisticsService.updateTracking({
                    deliveryId: selectedDelivery._id,
                    lat: newLat,
                    lng: newLng,
                    speed: 45,
                    heading: 90
                });
                steps++;
            } catch (err) {
                clearInterval(interval);
                setIsSimulating(false);
            }
        }, 3000);
    };

    if (activeDeliveries.length === 0) {
        return (
            <div className="bg-white rounded-[32px] shadow-xl p-12 text-center border border-gray-100">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Truck className="w-12 h-12 text-gray-300" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Fleet Stationary</h3>
                <p className="text-gray-500 font-medium">No active deliveries are currently on the road.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* List */}
                <div className="lg:col-span-1 space-y-4">
                    <h3 className="text-xl font-black text-gray-900 flex items-center gap-3 mb-6">
                        <span className="w-1.5 h-6 bg-[#008000] rounded-full"></span>
                        Active Monitoring
                    </h3>
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 no-scrollbar">
                        {activeDeliveries.map((del) => (
                            <button
                                key={del._id}
                                onClick={() => setSelectedDelivery(del)}
                                className={`w-full text-left p-6 rounded-[28px] border-2 transition-all ${selectedDelivery?._id === del._id
                                    ? 'border-[#008000] bg-green-50/50 shadow-xl shadow-green-100'
                                    : 'border-gray-50 bg-white hover:border-green-200'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-[10px] font-black text-[#008000] tracking-widest uppercase">#{del.deliveryId}</span>
                                    <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase ${del.status === 'OnTheWay' ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'}`}>
                                        {del.status === 'OnTheWay' ? 'MOVING' : 'IDLE'}
                                    </span>
                                </div>
                                <h4 className="font-black text-gray-900 mb-1">{del.orderId?.customer}</h4>
                                <p className="text-xs font-medium text-gray-500 truncate mb-4">{del.orderId?.address}</p>
                                <div className="flex items-center gap-3 pt-4 border-t border-gray-100/50">
                                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                                        <Users size={14} />
                                    </div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-tight">{del.driverId?.name}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Map */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden relative">
                        {selectedDelivery && (
                            <div className="absolute top-6 left-6 right-6 z-10 bg-white/90 backdrop-blur-md p-6 rounded-[24px] shadow-xl border border-white/20 flex justify-between items-center animate-in slide-in-from-top duration-500">
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 bg-[#008000] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-green-200">
                                        <Truck size={28} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-gray-900 tracking-tight">{selectedDelivery.orderId?.customer}</h2>
                                        <p className="text-xs font-bold text-[#008000] uppercase tracking-widest flex items-center gap-2">
                                            <Navigation size={12} fill="currentColor" /> {selectedDelivery.driverId?.name}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={startSimulation}
                                    disabled={isSimulating}
                                    className="bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all disabled:opacity-50"
                                >
                                    <PlayCircle size={16} /> {isSimulating ? 'SIMULATING...' : 'MOCK TRACKING'}
                                </button>
                            </div>
                        )}

                        <div style={mapContainerStyle}>
                            {isLoaded ? (
                                <GoogleMap
                                    mapContainerStyle={mapContainerStyle}
                                    center={selectedDelivery?.orderId?.currentLocation || defaultCenter}
                                    zoom={12}
                                    onLoad={(map) => setMap(map)}
                                >
                                    {activeDeliveries.map((del) => (
                                        <Marker
                                            key={del._id}
                                            position={del.orderId?.currentLocation || defaultCenter}
                                            icon={{
                                                path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                                                scale: selectedDelivery?._id === del._id ? 8 : 6,
                                                fillColor: selectedDelivery?._id === del._id ? '#008000' : '#64748b',
                                                fillOpacity: 1,
                                                strokeWeight: 2,
                                                strokeColor: '#fff',
                                            }}
                                            onClick={() => setSelectedDelivery(del)}
                                        />
                                    ))}
                                    {directions && <DirectionsRenderer directions={directions} />}
                                </GoogleMap>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400 font-bold uppercase tracking-widest">
                                    Initializing Fleet Intelligence...
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-lg text-center">
                            <Clock className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                            <p className="text-2xl font-black text-gray-900 tracking-tight">18<span className="text-sm ml-1 text-gray-400 font-bold">m</span></p>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Est. Completion</p>
                        </div>
                        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-lg text-center">
                            <Navigation className="w-6 h-6 text-[#008000] mx-auto mb-2" />
                            <p className="text-2xl font-black text-gray-900 tracking-tight">4.2<span className="text-sm ml-1 text-gray-400 font-bold">km</span></p>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Distance Remaining</p>
                        </div>
                        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-lg text-center">
                            <Activity className="w-6 h-6 text-green-500 mx-auto mb-2" />
                            <p className="text-2xl font-black text-gray-900 tracking-tight">92<span className="text-sm ml-1 text-gray-400 font-bold">%</span></p>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Driver Performance</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Map View helper (optional, can be integrated into main component)
