import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Map from '../components/Map';
import { apiRequest } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { MapPin, Navigation, DollarSign } from 'lucide-react';

export default function PassengerHome() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  const [pickup, setPickup] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [dropoff, setDropoff] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [selecting, setSelecting] = useState<'pickup' | 'dropoff'>('pickup');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<'trip' | 'delivery'>('trip');
  const [nearbyDrivers, setNearbyDrivers] = useState<any[]>([]);

  // Mock nearby drivers poll
  useEffect(() => {
    const interval = setInterval(() => {
      // In a real app, we would poll the backend with current location
      // For MVP, we simulate some drivers around the user or pickup location
      if (pickup) {
        setNearbyDrivers([
          { id: '1', lat: pickup.lat + 0.001, lng: pickup.lng + 0.001 },
          { id: '2', lat: pickup.lat - 0.002, lng: pickup.lng - 0.001 },
        ]);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [pickup]);

  const handleLocationSelect = async (lat: number, lng: number) => {
    const address = `${lat.toFixed(4)}, ${lng.toFixed(4)}`; // Fallback
    // Optional: Call Nominatim for address
    
    if (selecting === 'pickup') {
      setPickup({ lat, lng, address });
      setSelecting('dropoff');
    } else {
      setDropoff({ lat, lng, address });
    }
  };

  const handleCreateTrip = async () => {
    if (!pickup || !dropoff || !price) return;
    setLoading(true);
    try {
      const result = await apiRequest<any>('/trips/create', 'POST', {
        passenger_id: user?.id,
        pickup_lat: pickup.lat,
        pickup_lng: pickup.lng,
        pickup_address: pickup.address,
        dropoff_lat: dropoff.lat,
        dropoff_lng: dropoff.lng,
        dropoff_address: dropoff.address,
        proposed_price: Number(price),
        type: type
      }, token);
      
      navigate(`/trip/${result.id}`);
    } catch (error) {
      console.error(error);
      alert('Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col md:flex-row">
      {/* Sidebar / Form */}
      <div className="w-full md:w-1/3 bg-white p-6 shadow-xl z-10 flex flex-col overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6 text-blue-600">Where to?</h1>
        
        {/* Service Type Toggle */}
        <div className="flex p-1 bg-gray-100 rounded-lg mb-6">
          <button
            onClick={() => setType('trip')}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition ${type === 'trip' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
          >
            Ride
          </button>
          <button
            onClick={() => setType('delivery')}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition ${type === 'delivery' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
          >
            Delivery
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div 
            className={`p-4 border rounded-lg cursor-pointer transition ${selecting === 'pickup' ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}
            onClick={() => setSelecting('pickup')}
          >
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Pickup Location</label>
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-green-500 mr-2" />
              <input 
                type="text" 
                value={pickup?.address || ''} 
                readOnly 
                placeholder="Select on map"
                className="bg-transparent w-full focus:outline-none cursor-pointer"
              />
            </div>
          </div>

          <div 
            className={`p-4 border rounded-lg cursor-pointer transition ${selecting === 'dropoff' ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}
            onClick={() => setSelecting('dropoff')}
          >
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Dropoff Location</label>
            <div className="flex items-center">
              <Navigation className="h-5 w-5 text-red-500 mr-2" />
              <input 
                type="text" 
                value={dropoff?.address || ''} 
                readOnly 
                placeholder="Select on map"
                className="bg-transparent w-full focus:outline-none cursor-pointer"
              />
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Offer Your Price</label>
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
              <input 
                type="number" 
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="w-full focus:outline-none text-lg font-semibold"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleCreateTrip}
          disabled={!pickup || !dropoff || !price || loading}
          className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed mt-auto shadow-lg"
        >
          {loading ? 'Creating Request...' : 'Find a Driver'}
        </button>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <Map 
          pickup={pickup || undefined} 
          dropoff={dropoff || undefined} 
          onLocationSelect={handleLocationSelect}
          driverLocations={nearbyDrivers}
        />
        
        {/* Floating Instruction */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg z-[1000] text-sm font-medium text-gray-700">
          Tap on map to select {selecting} location
        </div>
      </div>
    </div>
  );
}
