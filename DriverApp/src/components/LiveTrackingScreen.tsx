import { ArrowLeft, Phone, MessageCircle, Navigation, Fuel, Clock, MapPin as MapPinIcon } from 'lucide-react';
import { useEffect, useState, useCallback, useRef } from 'react';
import { BottomNavigation } from './BottomNavigation';
import { Screen } from '../App';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer, Polyline } from '@react-google-maps/api';
import { orderService } from '../services/api';
import { toast } from 'sonner';

interface LiveTrackingScreenProps {
  onNavigate: (screen: Screen) => void;
  orderId: string | null;
  orders?: any[];
}

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: 7.8731, // Default to Sri Lanka center if geolocation fails initially
  lng: 80.7718
};

// Move libraries outside component to prevent recreation on every render
const GOOGLE_MAPS_LIBRARIES: ("geometry" | "places")[] = ['geometry', 'places'];

export function LiveTrackingScreen({ onNavigate, orderId, orders }: LiveTrackingScreenProps) {
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [destinationLocation, setDestinationLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [distance, setDistance] = useState<string>('0');
  const [duration, setDuration] = useState<string>('0');
  const [fuelUsed, setFuelUsed] = useState(0);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [truckRotation, setTruckRotation] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animatedPosition, setAnimatedPosition] = useState<{ lat: number; lng: number } | null>(null);
  const watchId = useRef<number | null>(null);
  const animationFrameId = useRef<number | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map: google.maps.Map) {
    setMap(null);
  }, []);

  // Get order details
  const currentOrder = orders?.find(o => o._id === orderId) || orders?.[0];

  // Geocode the destination address to get coordinates
  useEffect(() => {
    if (isLoaded && currentOrder?.address) {
      const geocoder = new google.maps.Geocoder();

      // Clean and prepare the address
      let addressToGeocode = currentOrder.address;

      // If address doesn't contain "Sri Lanka", add it for better results
      if (!addressToGeocode.toLowerCase().includes('sri lanka') &&
        !addressToGeocode.toLowerCase().includes('colombo') &&
        !addressToGeocode.toLowerCase().includes('kandy')) {
        addressToGeocode += ', Sri Lanka';
      }

      console.log('Attempting to geocode:', addressToGeocode);

      // Try geocoding with the full address
      geocoder.geocode({
        address: addressToGeocode,
        region: 'LK' // Bias results to Sri Lanka
      }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          setDestinationLocation({
            lat: location.lat(),
            lng: location.lng()
          });
          console.log('✅ Geocoding successful:', addressToGeocode);
          console.log('📍 Coordinates:', location.lat(), location.lng());
          setRouteError(null);
        } else {
          console.warn('❌ Geocoding failed for address:', currentOrder.address, 'Status:', status);

          // Fallback: Use a default location in Sri Lanka (Colombo city center)
          const fallbackLocation = {
            lat: 6.9271,  // Colombo, Sri Lanka
            lng: 79.8612
          };

          setDestinationLocation(fallbackLocation);
          setRouteError('Could not find exact address. Using approximate location.');
          toast.warning('Using approximate location in Colombo. Please verify the address.', {
            duration: 5000
          });
        }
      });
    }
  }, [isLoaded, currentOrder?.address]);

  // Calculate truck rotation based on direction of travel
  const calculateBearing = (start: { lat: number; lng: number }, end: { lat: number; lng: number }) => {
    const startLat = start.lat * Math.PI / 180;
    const startLng = start.lng * Math.PI / 180;
    const endLat = end.lat * Math.PI / 180;
    const endLng = end.lng * Math.PI / 180;

    const dLng = endLng - startLng;

    const y = Math.sin(dLng) * Math.cos(endLat);
    const x = Math.cos(startLat) * Math.sin(endLat) -
      Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng);

    const bearing = Math.atan2(y, x) * 180 / Math.PI;
    return (bearing + 360) % 360;
  };

  useEffect(() => {
    if (navigator.geolocation) {
      let previousLocation: { lat: number; lng: number } | null = null;

      watchId.current = navigator.geolocation.watchPosition(
        (position) => {
          const newPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          // Calculate rotation if we have a previous position
          if (previousLocation) {
            const bearing = calculateBearing(previousLocation, newPos);
            setTruckRotation(bearing);
          }

          setCurrentLocation(newPos);
          previousLocation = newPos;

          // Update backend if we have an orderId
          if (orderId) {
            orderService.updateLocation(orderId, newPos).catch(err => console.error('Failed to update location:', err));
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast.error('Could not get current location');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }

    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, [orderId]);

  // Auto-recalculate route when driver location changes
  useEffect(() => {
    if (isLoaded && currentLocation && destinationLocation && directions) {
      // Recalculate route every 30 seconds or when driver moves significantly
      const recalculateTimer = setInterval(() => {
        const directionsService = new google.maps.DirectionsService();
        directionsService.route(
          {
            origin: currentLocation,
            destination: destinationLocation,
            travelMode: google.maps.TravelMode.DRIVING,
            optimizeWaypoints: true,
            provideRouteAlternatives: false
          },
          (result, status) => {
            if (status === google.maps.DirectionsStatus.OK && result) {
              setDirections(result);
              if (result.routes[0].legs[0]) {
                setDistance(result.routes[0].legs[0].distance?.text || '0');
                setDuration(result.routes[0].legs[0].duration?.text || '0');
                const km = parseFloat(result.routes[0].legs[0].distance?.text.split(' ')[0] || '0');
                setFuelUsed(parseFloat((km * 0.15).toFixed(2)));
              }
            }
          }
        );
      }, 30000); // Recalculate every 30 seconds

      return () => clearInterval(recalculateTimer);
    }
  }, [currentLocation, destinationLocation, isLoaded, directions]);

  // Calculate route when both locations are available
  useEffect(() => {
    if (isLoaded && currentLocation && destinationLocation) {
      setRouteError(null);
      const directionsService = new google.maps.DirectionsService();
      directionsService.route(
        {
          origin: currentLocation,
          destination: destinationLocation,
          travelMode: google.maps.TravelMode.DRIVING,
          optimizeWaypoints: true,
          provideRouteAlternatives: false
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            setDirections(result);
            setRouteError(null);
            if (result.routes[0].legs[0]) {
              setDistance(result.routes[0].legs[0].distance?.text || '0');
              setDuration(result.routes[0].legs[0].duration?.text || '0');
              // Simple fuel calculation based on km
              const km = parseFloat(result.routes[0].legs[0].distance?.text.split(' ')[0] || '0');
              setFuelUsed(parseFloat((km * 0.15).toFixed(2))); // Assuming 0.15L per km

              // Auto-fit map to show entire route
              if (map && result.routes[0].bounds) {
                map.fitBounds(result.routes[0].bounds);
              }
            }
          } else {
            console.error('❌ Google Maps Directions Error Status:', status);
            console.error('❌ Google Maps Directions Result:', result);

            if (status === 'REQUEST_DENIED') {
              setRouteError('Directions API denied. Please enable "Directions API" in Google Console.');
            } else if (status === 'ZERO_RESULTS') {
              setRouteError('No road route found between locations.');
            } else {
              setRouteError(`Route Error: ${status}`);
            }
            toast.error(`Map Route Error: ${status}`);
          }
        }
      );
    }
  }, [isLoaded, currentLocation, destinationLocation, map]);

  // Handle navigate button - Opens Google Maps with directions
  const handleNavigate = () => {
    if (!destinationLocation) {
      toast.error('Destination not available');
      return;
    }

    if (!currentLocation) {
      toast.error('Getting your location...');
      return;
    }

    // Create Google Maps URL with directions
    const origin = `${currentLocation.lat},${currentLocation.lng}`;
    const destination = `${destinationLocation.lat},${destinationLocation.lng}`;
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;

    // Open in new tab
    window.open(googleMapsUrl, '_blank');

    // Show success message
    toast.success('Opening navigation in Google Maps...');

    // Animate the map to show the route
    if (map && directions) {
      map.panTo(currentLocation);
      setTimeout(() => {
        if (directions.routes[0].bounds) {
          map.fitBounds(directions.routes[0].bounds);
        }
      }, 500);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-gray-50 to-white">
      {/* Map Container */}
      <div className="relative h-[450px] bg-slate-200 overflow-hidden shadow-lg">
        {/* Back Button */}
        <button
          onClick={() => onNavigate('dashboard')}
          className="absolute top-4 left-4 z-[1000] w-12 h-12 rounded-full bg-white/95 backdrop-blur-sm shadow-xl flex items-center justify-center hover:bg-white transition-all border border-gray-100"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>

        {/* GPS Status */}
        <div className="absolute top-4 right-4 z-[1000] flex items-center gap-2 bg-white/95 backdrop-blur-sm px-4 py-2.5 rounded-full shadow-xl border border-gray-100">
          <div className={`w-2.5 h-2.5 rounded-full ${currentLocation ? 'bg-green-500 animate-pulse shadow-lg shadow-green-500/50' : 'bg-red-500'}`}></div>
          <span className="text-xs font-bold text-gray-700">{currentLocation ? 'GPS Active' : 'Connecting GPS...'}</span>
        </div>

        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={currentLocation || defaultCenter}
            zoom={15}
            onLoad={onLoad}
            onUnmount={onUnmount}
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
                },
                {
                  "featureType": "administrative",
                  "elementType": "geometry.fill",
                  "stylers": [{ "color": "#000000" }]
                }
              ]
            }}
          >
            {/* Driver Location - Custom ISDN Truck Icon with Rotation */}
            {(isAnimating ? animatedPosition : currentLocation) && <Marker
              position={isAnimating && animatedPosition ? animatedPosition : currentLocation!}
              icon={{
                path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                scale: 7,
                fillColor: isAnimating ? '#10b981' : '#008000',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2,
                rotation: truckRotation
              }}
              title={isAnimating ? "Navigating..." : "Your Location (Driver)"}
              animation={isAnimating ? google.maps.Animation.DROP : undefined}
            />}

            {/* Destination Marker - Customer Address */}
            {destinationLocation && <Marker
              position={destinationLocation}
              icon={{
                url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                scaledSize: new google.maps.Size(40, 40)
              }}
              title={`Destination: ${currentOrder?.address || 'Customer Location'}`}
              label={{
                text: '📍',
                fontSize: '24px',
                className: 'destination-marker-label'
              }}
            />}

            {/* Route Line - Enhanced with Animation */}
            {directions && <DirectionsRenderer
              directions={directions}
              options={{
                suppressMarkers: true,
                polylineOptions: {
                  strokeColor: '#3b82f6',
                  strokeWeight: 8,
                  strokeOpacity: 0.9,
                  icons: [{
                    icon: {
                      path: google.maps.SymbolPath.CIRCLE,
                      scale: 3,
                      fillColor: '#ffffff',
                      fillOpacity: 1,
                      strokeColor: '#3b82f6',
                      strokeWeight: 2
                    },
                    offset: '0',
                    repeat: '30px'
                  }]
                }
              }}
            />}

            {/* Animated Pulse Route Line Overlay */}
            {directions && currentLocation && destinationLocation && (
              <Polyline
                path={[currentLocation, destinationLocation]}
                options={{
                  strokeColor: '#60a5fa',
                  strokeWeight: 4,
                  strokeOpacity: 0.4,
                  icons: [{
                    icon: {
                      path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                      scale: 3,
                      fillColor: '#3b82f6',
                      fillOpacity: 1,
                      strokeColor: '#ffffff',
                      strokeWeight: 1
                    },
                    offset: '0%',
                    repeat: '100px'
                  }]
                }}
              />
            )}
          </GoogleMap>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-100">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-500 font-medium">Loading Google Maps...</p>
            </div>
          </div>
        )}

        {/* Progress Bar Overlay */}
        <div className="absolute bottom-0 left-0 right-0 z-[1000] bg-white/95 backdrop-blur-sm px-4 py-3 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-700">Live Traffic Integration</span>
            {routeError ? (
              <span className="text-xs font-semibold text-red-600">Route Error</span>
            ) : (
              <span className="text-xs font-semibold text-blue-600">Optimal Route</span>
            )}
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${routeError ? 'bg-red-500 w-0' : 'bg-gradient-to-r from-blue-500 to-green-500 w-full'}`}
            ></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 pb-24">
        {/* Trip Metrics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-4 shadow-md text-center border border-blue-200/50 hover:shadow-lg transition-all">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
              <Navigation className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-lg font-black text-gray-900">{distance}</p>
            <p className="text-[10px] uppercase tracking-wider text-blue-700 font-black mt-1">distance</p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl p-4 shadow-md text-center border border-orange-200/50 hover:shadow-lg transition-all">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-lg font-black text-gray-900">{duration}</p>
            <p className="text-[10px] uppercase tracking-wider text-orange-700 font-black mt-1">ETA</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-4 shadow-md text-center border border-green-200/50 hover:shadow-lg transition-all">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
              <Fuel className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-lg font-black text-gray-900">{fuelUsed}L</p>
            <p className="text-[10px] uppercase tracking-wider text-green-700 font-black mt-1">EST fuel</p>
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                <span className="text-xl font-black">{currentOrder?.customer?.charAt(0) || 'C'}</span>
              </div>
              <div>
                <p className="font-black text-gray-900 text-base">{currentOrder?.customer || 'Loading...'}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-sm shadow-green-500/50"></div>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider">verified customer</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="w-11 h-11 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center hover:bg-green-100 hover:scale-110 transition-all text-green-600 shadow-sm">
                <Phone className="w-5 h-5" />
              </button>
              <button className="w-11 h-11 rounded-full bg-blue-50 border-2 border-blue-200 flex items-center justify-center hover:bg-blue-100 hover:scale-110 transition-all text-blue-600 shadow-sm">
                <MessageCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-6 space-y-5 border border-gray-200 hover:shadow-xl transition-all">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">active task</p>
            <p className="font-black text-slate-900 text-xl">#{currentOrder?.orderId || 'ORD-SYNC-99'}</p>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center gap-1 mt-1">
              <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-sm"></div>
              <div className="w-0.5 h-10 bg-gray-100 my-1"></div>
              <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-white shadow-sm"></div>
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pickup point</p>
                <p className="text-sm font-bold text-gray-900 leading-tight">Warehouse RDC Center</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">destination</p>
                <p className="text-sm font-bold text-gray-900 leading-tight">{currentOrder?.address || 'Loading destination...'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 pb-8">
          <button
            onClick={handleNavigate}
            disabled={!currentLocation || !destinationLocation}
            className="bg-white border-2 border-slate-900 text-slate-900 font-black py-4 rounded-2xl hover:bg-slate-50 hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            <Navigation className="w-5 h-5" />
            NAVIGATE
          </button>
          <button
            className="bg-gradient-to-r from-slate-900 to-slate-800 text-white font-black py-4 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2 text-sm"
            onClick={() => {
              orderService.updateStatus(orderId!, 'Delivered')
                .then(() => {
                  toast.success('Order delivered successfully!');
                  onNavigate('dashboard');
                })
                .catch(() => toast.error('Failed to update status'));
            }}
          >
            DELIVERED
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation currentScreen="tracking" onNavigate={onNavigate} />
    </div>
  );
}
