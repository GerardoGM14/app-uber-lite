import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Map from '../components/Map';
import { apiRequest } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { getAddressFromCoordinates, calculateDistance, calculateEstimatedPrice, getCoordinatesFromAddress, getCurrentCountryCode } from '../lib/map';
import { MapPin, Navigation, DollarSign, Car, Package, User, Menu, Home, Activity, X, LogOut, Settings, History, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PassengerHome() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);

  const [pickup, setPickup] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [dropoff, setDropoff] = useState<{ lat: number; lng: number; address: string } | null>(null);
  
  // Input text states for editing
  const [pickupInput, setPickupInput] = useState('');
  const [dropoffInput, setDropoffInput] = useState('');
  
  const [selecting, setSelecting] = useState<'pickup' | 'dropoff'>('pickup');
  const [price, setPrice] = useState('');
  const [recommendedPrice, setRecommendedPrice] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<'trip' | 'delivery'>('trip');
  const [nearbyDrivers, setNearbyDrivers] = useState<any[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [countryCode, setCountryCode] = useState<string | undefined>(undefined);

  // Initialize location and country
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Alta precisión: Reverse geocoding exacto de la posición GPS
        const address = await getAddressFromCoordinates(latitude, longitude);
        const country = await getCurrentCountryCode(latitude, longitude);
        
        setPickup({ lat: latitude, lng: longitude, address });
        setPickupInput(address);
        if (country) setCountryCode(country);
        
      }, (error) => {
        console.error("Error getting location:", error);
        // Fallback
        setCountryCode('pe'); 
      }, {
        enableHighAccuracy: true, // Solicitar GPS de alta precisión
        timeout: 5000,
        maximumAge: 0
      });
    }
  }, []);

  // Mock nearby drivers poll
  useEffect(() => {
    const interval = setInterval(() => {
      if (pickup) {
        setNearbyDrivers([
          { id: '1', lat: pickup.lat + 0.001, lng: pickup.lng + 0.001 },
          { id: '2', lat: pickup.lat - 0.002, lng: pickup.lng - 0.001 },
          { id: '3', lat: pickup.lat + 0.0015, lng: pickup.lng - 0.002 },
        ]);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [pickup]);

  // Calculate price and distance when points change
  useEffect(() => {
    if (pickup && dropoff) {
      const dist = calculateDistance(pickup.lat, pickup.lng, dropoff.lat, dropoff.lng);
      setDistance(Math.round(dist * 10) / 10);
      const recPrice = calculateEstimatedPrice(dist, type);
      setRecommendedPrice(recPrice);
      // Only set price if user hasn't manually entered one (or if it matches old recommended)
      if (!price) {
        setPrice(recPrice.toString());
      }
    }
  }, [pickup, dropoff, type]);

  const handleLocationSelect = async (lat: number, lng: number) => {
    // Show loading state for address?
    const address = await getAddressFromCoordinates(lat, lng);
    
    if (selecting === 'pickup') {
      setPickup({ lat, lng, address });
      setPickupInput(address);
      setSelecting('dropoff');
    } else {
      setDropoff({ lat, lng, address });
      setDropoffInput(address);
    }
  };

  const handleAddressSearch = async (inputType: 'pickup' | 'dropoff') => {
    const query = inputType === 'pickup' ? pickupInput : dropoffInput;
    if (!query) return;

    const result = await getCoordinatesFromAddress(query, countryCode);
    if (result) {
      if (inputType === 'pickup') {
        setPickup({ lat: result.lat, lng: result.lng, address: result.displayName });
        setPickupInput(result.displayName);
      } else {
        setDropoff({ lat: result.lat, lng: result.lng, address: result.displayName });
        setDropoffInput(result.displayName);
      }
    } else {
      alert('Dirección no encontrada');
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
      
      navigate(`/passenger/negotiation/${result.id}`);
    } catch (error) {
      console.error(error);
      alert('Error al crear el viaje');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="h-screen flex flex-col relative bg-gray-100 overflow-hidden">
      {/* Map Layer - Full Screen Background */}
      <div className="absolute inset-0 z-0">
        <Map 
          pickup={pickup || undefined} 
          dropoff={dropoff || undefined} 
          onLocationSelect={handleLocationSelect}
          driverLocations={nearbyDrivers}
        />
      </div>

      {/* Top Bar - Safe Area Aware */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 pt-safe-top pointer-events-none">
        <div className="flex justify-between items-start mt-2">
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="bg-white p-3 rounded-full shadow-lg pointer-events-auto hover:bg-gray-50 transition-colors active:scale-95"
          >
            <Menu className="h-6 w-6 text-gray-800" />
          </button>
        </div>
      </div>

      {/* Side Menu Drawer */}
      <AnimatePresence>
      {isMenuOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 z-40 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="absolute top-0 left-0 bottom-0 w-[85%] max-w-[280px] bg-white z-50 shadow-2xl flex flex-col"
          >
            {/* Header with Avatar */}
            <div className="p-6 bg-black text-white relative overflow-hidden">
              {/* Decorative Circle */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-gray-800 rounded-full opacity-50 blur-2xl pointer-events-none"></div>
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="h-16 w-16 bg-white rounded-full p-0.5 shadow-lg ring-2 ring-white/20">
                  <img 
                    src={`https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(user?.name || 'User')}&backgroundColor=e5e7eb`} 
                    alt="Profile" 
                    className="h-full w-full rounded-full object-cover"
                  />
                </div>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="bg-white/10 p-1.5 rounded-full hover:bg-white/20 transition-colors backdrop-blur-sm"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
              
              <div className="relative z-10">
                <h2 className="text-lg font-bold tracking-tight truncate">{user?.name || 'Usuario'}</h2>
                <div className="flex items-center mt-1 text-gray-300 text-xs">
                  <span className="bg-yellow-400 text-black text-[10px] font-bold px-1.5 py-0.5 rounded mr-2 flex items-center">
                    4.9 ★
                  </span>
                  <span className="truncate max-w-[150px]">{user?.email}</span>
                </div>
              </div>
            </div>
            
            {/* Menu Items */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              <button onClick={() => navigate('/profile')} className="w-full flex items-center p-2.5 text-gray-700 hover:bg-gray-50 rounded-xl transition-all group active:bg-gray-100">
                <div className="bg-gray-100 p-2 rounded-lg mr-3 group-hover:bg-black group-hover:text-white transition-colors">
                  <User className="h-4 w-4" />
                </div>
                <span className="font-medium text-sm">Mi Perfil</span>
              </button>
              
              <button onClick={() => navigate('/history')} className="w-full flex items-center p-2.5 text-gray-700 hover:bg-gray-50 rounded-xl transition-all group active:bg-gray-100">
                <div className="bg-gray-100 p-2 rounded-lg mr-3 group-hover:bg-black group-hover:text-white transition-colors">
                  <History className="h-4 w-4" />
                </div>
                <span className="font-medium text-sm">Mis Viajes</span>
              </button>
              
              <button onClick={() => navigate('/settings')} className="w-full flex items-center p-2.5 text-gray-700 hover:bg-gray-50 rounded-xl transition-all group active:bg-gray-100">
                <div className="bg-gray-100 p-2 rounded-lg mr-3 group-hover:bg-black group-hover:text-white transition-colors">
                  <Settings className="h-4 w-4" />
                </div>
                <span className="font-medium text-sm">Configuración</span>
              </button>
            </nav>

            {/* Footer Logout */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center p-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-full transition-colors font-semibold text-sm active:scale-95"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span>Cerrar Sesión</span>
              </button>
              <p className="text-center text-[10px] text-gray-400 mt-3">UrbanGo v1.0.0</p>
            </div>
          </motion.div>
        </>
      )}
      </AnimatePresence>

      {/* Floating Action Panel (Bottom Sheet style) */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none flex justify-center pb-[calc(80px+env(safe-area-inset-bottom))] md:pb-8 px-0 md:px-4">
        <div className="w-full md:max-w-md bg-white rounded-t-3xl md:rounded-3xl shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] p-5 pb-6 pointer-events-auto transition-all duration-300 ease-in-out">
          
          {/* Service Selector Tabs */}
          <div className="flex p-1 bg-gray-100 rounded-xl mb-4">
            <button
              onClick={() => setType('trip')}
              className={`flex-1 flex items-center justify-center py-2.5 rounded-lg text-sm font-semibold transition-all ${
                type === 'trip' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Car className="h-4 w-4 mr-2" />
              Viaje
            </button>
            <button
              onClick={() => setType('delivery')}
              className={`flex-1 flex items-center justify-center py-2.5 rounded-lg text-sm font-semibold transition-all ${
                type === 'delivery' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Package className="h-4 w-4 mr-2" />
              Envíos
            </button>
          </div>

          {/* Location Inputs - Compact */}
          <div className="space-y-3 mb-4 relative">
            {/* Connecting Line */}
            <div className="absolute left-[1.3rem] top-8 bottom-8 w-0.5 bg-gray-200 -z-10 border-l border-dashed border-gray-300"></div>

            <div 
              className={`flex items-center p-3 border rounded-xl bg-gray-50 transition-all ${selecting === 'pickup' ? 'ring-2 ring-black border-transparent bg-white shadow-sm' : 'border-transparent hover:bg-gray-100'}`}
              onClick={() => setSelecting('pickup')}
            >
              <div className="h-2.5 w-2.5 rounded-full bg-blue-600 mx-3 ring-4 ring-blue-50 flex-shrink-0"></div>
              <input 
                type="text" 
                value={pickupInput}
                onChange={(e) => setPickupInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddressSearch('pickup')}
                placeholder="Punto de partida"
                className="w-full text-sm font-medium bg-transparent focus:outline-none text-gray-900 placeholder-gray-500"
              />
              {pickupInput && selecting === 'pickup' && (
                 <button onClick={(e) => { e.stopPropagation(); handleAddressSearch('pickup'); }} className="p-1 text-blue-600">
                    <Search className="h-4 w-4" />
                 </button>
              )}
            </div>

            <div 
              className={`flex items-center p-3 border rounded-xl bg-gray-50 transition-all ${selecting === 'dropoff' ? 'ring-2 ring-black border-transparent bg-white shadow-sm' : 'border-transparent hover:bg-gray-100'}`}
              onClick={() => setSelecting('dropoff')}
            >
              <div className="h-2.5 w-2.5 rounded-sm bg-black mx-3 ring-4 ring-gray-200 flex-shrink-0"></div>
              <input 
                type="text" 
                value={dropoffInput}
                onChange={(e) => setDropoffInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddressSearch('dropoff')}
                placeholder="¿A dónde vas?"
                className="w-full text-sm font-medium bg-transparent focus:outline-none text-gray-900 placeholder-gray-500"
              />
              {dropoffInput && selecting === 'dropoff' && (
                 <button onClick={(e) => { e.stopPropagation(); handleAddressSearch('dropoff'); }} className="p-1 text-blue-600">
                    <Search className="h-4 w-4" />
                 </button>
              )}
            </div>
          </div>

          {/* Info Stats (Distance / Time) */}
          {distance && (
            <div className="flex justify-between text-xs text-gray-500 px-2 mb-2 font-medium">
              <span>Distancia: {distance} km</span>
              <span>Recomendado: S/ {recommendedPrice}</span>
            </div>
          )}

          {/* Price & Action Row */}
          <div className="flex gap-3">
            <div className="relative w-1/3">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-500 font-bold text-sm">S/</span>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-2 py-3.5 bg-gray-50 border-none rounded-xl text-lg font-bold text-gray-900 focus:ring-2 focus:ring-black focus:bg-white transition-all text-center placeholder-gray-400"
              />
            </div>

            <button
              onClick={handleCreateTrip}
              disabled={!pickup || !dropoff || !price || loading}
              className="flex-1 bg-black text-white py-3.5 rounded-xl font-bold text-base shadow-lg hover:bg-gray-800 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex justify-center items-center"
            >
              {loading ? (
                <span className="animate-pulse">Buscando...</span>
              ) : (
                'Solicitar ahora'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation - Fixed & Functional */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 py-3 pb-[calc(12px+env(safe-area-inset-bottom))] px-6 flex justify-around items-center z-30 md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => navigate('/passenger')}
          className="flex flex-col items-center text-black p-2 active:scale-95 transition-transform"
        >
          <Home className="h-6 w-6" />
          <span className="text-[10px] font-semibold mt-1">Inicio</span>
        </button>
        <button 
          className="flex flex-col items-center text-gray-400 p-2 hover:text-gray-600 active:scale-95 transition-all"
        >
          <Activity className="h-6 w-6" />
          <span className="text-[10px] font-medium mt-1">Actividad</span>
        </button>
        <button 
          onClick={() => navigate('/profile')}
          className="flex flex-col items-center text-gray-400 p-2 hover:text-gray-600 active:scale-95 transition-all"
        >
          <User className="h-6 w-6" />
          <span className="text-[10px] font-medium mt-1">Cuenta</span>
        </button>
      </div>
    </div>
  );
}
