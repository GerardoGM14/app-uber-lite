import { useState, useEffect } from 'react';
import { apiRequest } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Clock, ChevronRight, Car } from 'lucide-react';

interface Trip {
  id: string;
  pickup_address: string;
  dropoff_address: string;
  final_price: number;
  proposed_price: number;
  status: string;
  created_at: string;
  driver?: {
    name: string;
  };
}

export default function TripHistory() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.id) return;
      try {
        const data = await apiRequest<Trip[]>(`/trips/history?passenger_id=${user.id}`, 'GET', undefined, token);
        if (Array.isArray(data)) {
            setTrips(data);
        }
      } catch (error) {
        console.error('Failed to fetch history', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user, token]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-PE', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'text-green-600 bg-green-50';
      case 'CANCELLED': return 'text-red-600 bg-red-50';
      case 'IN_PROGRESS': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white px-4 py-4 shadow-sm sticky top-0 z-10 flex items-center">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="h-6 w-6 text-gray-800" />
        </button>
        <h1 className="text-xl font-bold text-gray-900 ml-2">Mis Viajes</h1>
      </div>

      <div className="flex-1 p-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-white rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : trips.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Car className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Sin viajes aún</h3>
            <p className="text-gray-500 mt-2 text-sm">Tus viajes completados aparecerán aquí.</p>
            <button 
                onClick={() => navigate('/passenger')}
                className="mt-6 px-6 py-3 bg-black text-white rounded-full font-bold text-sm shadow-lg active:scale-95 transition-transform"
            >
                Pedir un viaje
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {trips.map((trip) => (
              <div 
                key={trip.id} 
                onClick={() => navigate(`/trip/${trip.id}`)}
                className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 active:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center text-xs font-medium text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(trip.created_at)}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${getStatusColor(trip.status)}`}>
                    {trip.status}
                  </span>
                </div>

                <div className="space-y-2 mb-3 relative">
                    {/* Line connecting dots */}
                    <div className="absolute left-[5px] top-2 bottom-2 w-0.5 bg-gray-200"></div>
                    
                    <div className="flex items-start">
                        <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-sm relative z-10 flex-shrink-0"></div>
                        <p className="text-sm font-medium text-gray-900 ml-3 line-clamp-1">{trip.pickup_address}</p>
                    </div>
                    <div className="flex items-start">
                        <div className="w-3 h-3 rounded-sm bg-black border-2 border-white shadow-sm relative z-10 flex-shrink-0"></div>
                        <p className="text-sm font-medium text-gray-900 ml-3 line-clamp-1">{trip.dropoff_address}</p>
                    </div>
                </div>

                <div className="flex justify-between items-center border-t border-gray-50 pt-3 mt-2">
                    <div className="flex items-center">
                        <div className="text-lg font-bold text-gray-900">
                            S/ {trip.final_price || trip.proposed_price}
                        </div>
                    </div>
                    <div className="flex items-center text-gray-400">
                        <span className="text-xs mr-1">Ver detalles</span>
                        <ChevronRight className="h-4 w-4" />
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
