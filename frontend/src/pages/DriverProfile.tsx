import { useAuthStore } from '../store/authStore';
import { 
  Star, LifeBuoy, Wallet, Clock, 
  Settings, MessageSquare, Briefcase, 
  ArrowLeft, ChevronRight, Car, Award, TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import driverCarImage from '../assets/carroconductor.webp';
import walletImage from '../assets/billetera.png';

export default function DriverProfile() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Top Header / Back Button */}
      <div className="px-4 pt-4 pb-2">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="h-6 w-6 text-black" />
        </button>
      </div>

      {/* Profile Header */}
      <div className="px-4 mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-black mb-2">{user?.name || 'Conductor'}</h1>
          <div className="flex items-center bg-gray-100 w-fit px-3 py-1 rounded-full">
            <Star className="h-3 w-3 text-black fill-current mr-1" />
            <span className="text-sm font-bold text-black">4.95</span>
          </div>
        </div>
        <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200">
             <img 
              src={`https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(user?.name || 'Driver')}&backgroundColor=e5e7eb`} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
        </div>
      </div>

      {/* Driver Stats Grid */}
      <div className="px-4 grid grid-cols-3 gap-3 mb-8">
        <button className="bg-gray-100 rounded-xl py-4 px-2 flex flex-col items-center justify-center space-y-2 active:scale-95 transition-transform">
          <TrendingUp className="h-8 w-8 text-black" />
          <span className="text-xs font-semibold text-gray-900">Ganancias</span>
        </button>
        <button className="bg-gray-100 rounded-xl py-4 px-2 flex flex-col items-center justify-center space-y-2 active:scale-95 transition-transform">
          <Award className="h-8 w-8 text-black" />
          <span className="text-xs font-semibold text-gray-900">Nivel Oro</span>
        </button>
        <button 
          onClick={() => navigate('/history')} // Could be a driver specific history
          className="bg-gray-100 rounded-xl py-4 px-2 flex flex-col items-center justify-center space-y-2 active:scale-95 transition-transform"
        >
          <Clock className="h-8 w-8 text-black" />
          <span className="text-xs font-semibold text-gray-900">Viajes</span>
        </button>
      </div>

      {/* Promo Cards */}
      <div className="px-4 space-y-4 mb-8">
        <div className="bg-gray-100 p-5 rounded-xl flex justify-between items-center cursor-pointer active:bg-gray-200 transition-colors">
          <div>
            <h3 className="font-bold text-lg text-gray-900 mb-1">Tu vehículo</h3>
            <p className="text-xs text-gray-600 leading-relaxed max-w-[200px]">
              Toyota Corolla • ABC-123<br/>
              Color Gris Metálico
            </p>
          </div>
          <div className="w-40 h-32 flex items-center justify-center -mr-6">
             <img src={driverCarImage} alt="Vehicle" className="w-full h-full object-contain" />
          </div>
        </div>

        <div className="bg-gray-100 p-5 rounded-xl flex justify-between items-center cursor-pointer active:bg-gray-200 transition-colors">
          <div>
            <h3 className="font-bold text-lg text-gray-900 mb-1">Metas semanales</h3>
            <p className="text-xs text-gray-600 leading-relaxed max-w-[200px]">
              Has completado 15 de 20 viajes para ganar un bono de S/ 50.
            </p>
          </div>
          <div className="w-40 h-32 flex items-center justify-center -mr-6">
             <img src={walletImage} alt="Wallet" className="w-full h-full object-contain" />
          </div>
        </div>
      </div>

      {/* Menu List */}
      <div className="px-4 space-y-1">
        <button className="w-full flex items-center py-4 hover:bg-gray-50 transition-colors">
          <Car className="h-6 w-6 text-black mr-4" />
          <span className="flex-1 text-left font-medium text-lg text-gray-900">Documentos del vehículo</span>
        </button>
        
        <button className="w-full flex items-center py-4 hover:bg-gray-50 transition-colors">
          <Settings className="h-6 w-6 text-black mr-4" />
          <span className="flex-1 text-left font-medium text-lg text-gray-900">Configuración</span>
        </button>
        
        <button className="w-full flex items-center py-4 hover:bg-gray-50 transition-colors">
          <MessageSquare className="h-6 w-6 text-black mr-4" />
          <span className="flex-1 text-left font-medium text-lg text-gray-900">Bandeja de entrada</span>
          <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
        </button>
        
        <button className="w-full flex items-center py-4 hover:bg-gray-50 transition-colors">
          <LifeBuoy className="h-6 w-6 text-black mr-4" />
          <span className="flex-1 text-left font-medium text-lg text-gray-900">Ayuda</span>
        </button>
      </div>
    </div>
  );
}
