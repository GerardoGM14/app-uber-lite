import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, DollarSign, Star, Car, Shield, X, AlertCircle, Clock } from 'lucide-react';
import Map from '../components/Map';
import { apiRequest } from '../lib/api';
import { useAuthStore } from '../store/authStore';

interface Trip {
  id: string;
  pickup_lat: number;
  pickup_lng: number;
  pickup_address: string;
  dropoff_lat: number;
  dropoff_lng: number;
  dropoff_address: string;
  price: number;
  status: string;
}

interface Offer {
  id: string;
  driver_id: string;
  price: number;
  estimated_time: number;
  driver: {
    name: string;
    rating_avg: number;
    car_model?: string;
    car_plate?: string;
  };
}

export default function PassengerNegotiation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  
  const [trip, setTrip] = useState<Trip | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch Trip Details
  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const data = await apiRequest<Trip>(`/trips/${id}`, 'GET', undefined, token);
        setTrip(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('No se pudo cargar la información del viaje');
        setLoading(false);
      }
    };
    
    if (id) fetchTrip();
  }, [id, token]);

  // Poll for Offers
  useEffect(() => {
    if (!id) return;

    const fetchOffers = async () => {
      try {
        // En un caso real, esto traería las ofertas para este viaje
        // Por ahora simularemos ofertas si no hay backend endpoint o si está vacío
        const data = await apiRequest<Offer[]>(`/offers/by-trip/${id}`, 'GET', undefined, token);
        
        // Si el backend devuelve array vacío, podríamos simular para demo (opcional)
        // Pero intentaremos usar lo real primero.
        if (Array.isArray(data)) {
            setOffers(data);
        }
      } catch (err) {
        console.error("Error fetching offers", err);
      }
    };

    const interval = setInterval(fetchOffers, 3000); // Poll every 3 seconds
    fetchOffers(); // Initial fetch

    return () => clearInterval(interval);
  }, [id, token]);

  const handleAcceptOffer = async (offerId: string) => {
    try {
      await apiRequest('/offers/accept', 'POST', { offer_id: offerId }, token);
      navigate(`/trip/${id}`); // Ir a pantalla de viaje en curso
    } catch (err) {
      alert('Error al aceptar la oferta');
    }
  };

  const handleCancelTrip = async () => {
    if (confirm('¿Estás seguro de cancelar el viaje?')) {
        try {
            await apiRequest(`/trips/${id}/status`, 'PATCH', { status: 'cancelled' }, token);
            navigate('/passenger');
        } catch (err) {
            alert('Error al cancelar');
        }
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-100">Cargando...</div>;
  if (error) return <div className="h-screen flex items-center justify-center text-red-500">{error}</div>;
  if (!trip) return null;

  return (
    <div className="h-screen flex flex-col relative bg-gray-100 overflow-hidden">
      {/* Map Background */}
      <div className="absolute inset-0 z-0">
        <Map 
          pickup={{ lat: trip.pickup_lat, lng: trip.pickup_lng }}
          dropoff={{ lat: trip.dropoff_lat, lng: trip.dropoff_lng }}
        />
      </div>

      {/* Header Info */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 pt-safe-top">
         <div className="bg-white/90 backdrop-blur-md shadow-lg rounded-2xl p-4 mx-2 mt-2 border border-white/20">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center text-gray-800">
                    <Clock className="w-4 h-4 mr-2 text-green-600" />
                    <span className="text-xs font-bold uppercase tracking-wider">Buscando conductores</span>
                </div>
                <button onClick={handleCancelTrip} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                    <X className="w-4 h-4 text-gray-600" />
                </button>
            </div>
            
            <div className="flex items-start space-x-3">
                <div className="flex flex-col items-center mt-1">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <div className="w-0.5 h-6 bg-gray-300 border-l border-dashed border-gray-300 my-0.5"></div>
                    <div className="w-2 h-2 bg-black rounded-sm"></div>
                </div>
                <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium text-gray-900 truncate">{trip.pickup_address}</p>
                    <div className="h-4"></div>
                    <p className="text-sm font-medium text-gray-900 truncate">{trip.dropoff_address}</p>
                </div>
                <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">S/ {trip.price}</p>
                    <p className="text-[10px] text-gray-500">Oferta inicial</p>
                </div>
            </div>
         </div>
      </div>

      {/* Radar Animation (when no offers) */}
      {offers.length === 0 && (
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
            <div className="relative">
                <div className="absolute inset-0 bg-blue-500 rounded-full opacity-20 animate-ping h-32 w-32"></div>
                <div className="absolute inset-0 bg-blue-500 rounded-full opacity-10 animate-pulse h-64 w-64 -m-16"></div>
                <div className="bg-white p-4 rounded-full shadow-xl z-10 relative">
                    <Car className="w-8 h-8 text-blue-600" />
                </div>
            </div>
        </div>
      )}

      {/* Offers List (Bottom Sheet) */}
      <div className="absolute bottom-0 left-0 right-0 z-20 flex flex-col justify-end pb-[calc(20px+env(safe-area-inset-bottom))] px-4 pointer-events-none">
        <div className="w-full max-w-md mx-auto pointer-events-auto">
            <AnimatePresence>
                {offers.length === 0 ? (
                    <motion.div 
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="bg-white rounded-2xl shadow-xl p-6 text-center mb-4 mx-2"
                    >
                        <p className="text-gray-800 font-medium animate-pulse">Contactando conductores cercanos...</p>
                        <p className="text-xs text-gray-400 mt-1">Por favor espera, estamos negociando tu tarifa.</p>
                    </motion.div>
                ) : (
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pb-4 scrollbar-hide">
                        {offers.map((offer) => (
                            <motion.div
                                key={offer.id}
                                initial={{ x: 100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -100, opacity: 0 }}
                                className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center">
                                        <div className="h-12 w-12 bg-gray-200 rounded-full overflow-hidden mr-3">
                                            <img 
                                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${offer.driver.name}`} 
                                                alt={offer.driver.name} 
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{offer.driver.name}</h3>
                                            <div className="flex items-center text-xs text-gray-500 mt-0.5">
                                                <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                                                <span className="font-medium text-gray-700 mr-2">{offer.driver.rating_avg || '5.0'}</span>
                                                <span>• {offer.driver.car_model || 'Auto Sedán'}</span>
                                            </div>
                                            <div className="text-[10px] text-gray-400 mt-0.5">
                                                {offer.driver.car_plate} • a {offer.estimated_time || '5'} min
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-bold text-gray-900">S/ {offer.price.toFixed(2)}</p>
                                        {offer.price > trip.price && (
                                            <p className="text-[10px] text-red-500 font-medium">
                                                +S/ {(offer.price - trip.price).toFixed(2)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="flex gap-2 mt-4">
                                    <button 
                                        className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors"
                                    >
                                        Rechazar
                                    </button>
                                    <button 
                                        onClick={() => handleAcceptOffer(offer.id)}
                                        className="flex-[2] py-2.5 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors shadow-lg active:scale-95"
                                    >
                                        Aceptar Oferta
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
