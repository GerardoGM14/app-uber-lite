import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { MapPin, Navigation, DollarSign, RefreshCw, User, LogOut } from 'lucide-react';

interface Trip {
  id: string;
  pickup_address: string;
  dropoff_address: string;
  proposed_price: number;
  passenger: { name: string; rating_avg: number };
}

export default function DriverHome() {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => {
        console.error(err);
        // Default location if denied (Lima)
        setLocation({ lat: -12.0464, lng: -77.0428 });
      }
    );
  }, []);

  const fetchTrips = async () => {
    if (!location) return;
    setLoading(true);
    try {
      const result = await apiRequest<Trip[]>(
        `/trips/nearby?lat=${location.lat}&lng=${location.lng}&radius=10`,
        'GET',
        undefined,
        token
      );
      setTrips(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location) {
      fetchTrips();
      const interval = setInterval(fetchTrips, 5000); // Poll every 5s
      return () => clearInterval(interval);
    }
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto">
        <header className="flex justify-between items-center mb-6">
          <div>
              <h1 className="text-2xl font-bold text-gray-800">Solicitudes Cercanas</h1>
              <div className="flex items-center space-x-2 mt-1">
                 <span className={`inline-block w-2.5 h-2.5 rounded-full ${location ? 'bg-green-500' : 'bg-red-500'}`}></span>
                 <span className="text-sm text-gray-600">{location ? 'En línea' : 'Localizando...'}</span>
              </div>
          </div>
          
          <div className="flex items-center space-x-3">
             <button 
                onClick={() => navigate('/driver/profile')}
                className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center border border-gray-100 overflow-hidden"
             >
                 <img 
                    src={`https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(user?.name || 'Driver')}&backgroundColor=e5e7eb`} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                 />
             </button>
             <button 
                onClick={handleLogout}
                className="p-2 bg-white text-red-500 rounded-full shadow-sm hover:bg-red-50 transition-colors"
             >
                <LogOut className="h-5 w-5" />
             </button>
          </div>
        </header>

        {loading && trips.length === 0 ? (
          <div className="text-center py-10 text-gray-500">Escaneando zona...</div>
        ) : trips.length === 0 ? (
          <div className="text-center py-10 text-gray-500 bg-white rounded-lg shadow">
            No hay solicitudes cerca. Espera un momento...
            <button onClick={fetchTrips} className="block mx-auto mt-4 text-blue-600 hover:underline flex items-center justify-center">
              <RefreshCw className="h-4 w-4 mr-1" /> Actualizar
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {trips.map((trip) => (
              <div 
                key={trip.id} 
                className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500 cursor-pointer hover:shadow-lg transition"
                onClick={() => navigate(`/trip/${trip.id}`)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{trip.passenger.name}</h3>
                    <div className="text-sm text-gray-500">★ {trip.passenger.rating_avg}</div>
                  </div>
                  <div className="text-xl font-bold text-green-600 flex items-center">
                    <DollarSign className="h-5 w-5" />
                    {trip.proposed_price}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                    <span className="text-gray-700">{trip.pickup_address}</span>
                  </div>
                  <div className="flex items-start">
                    <Navigation className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
                    <span className="text-gray-700">{trip.dropoff_address}</span>
                  </div>
                </div>

                <button className="w-full mt-4 bg-blue-50 text-blue-600 py-2 rounded font-medium hover:bg-blue-100 transition">
                  Ver Detalles y Ofertar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
