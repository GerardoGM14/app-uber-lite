import { useAuthStore } from '../store/authStore';
import { 
  User, Star, LifeBuoy, Wallet, Clock, 
  Settings, MessageSquare, Briefcase, Users, 
  ArrowLeft, ClipboardCheck, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import carImage from '../assets/car.webp';
import checkImage from '../assets/privacidad.png';

export default function Profile() {
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
          <h1 className="text-4xl font-bold text-black mb-2">{user?.name || 'Usuario'}</h1>
          <div className="flex items-center bg-gray-100 w-fit px-3 py-1 rounded-full">
            <Star className="h-3 w-3 text-black fill-current mr-1" />
            <span className="text-sm font-bold text-black">5.00</span>
          </div>
        </div>
        <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200">
             <img 
              src={`https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(user?.name || 'User')}&backgroundColor=e5e7eb`} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="px-4 grid grid-cols-3 gap-3 mb-8">
        <button className="bg-gray-100 rounded-xl py-4 px-2 flex flex-col items-center justify-center space-y-2 active:scale-95 transition-transform">
          <LifeBuoy className="h-8 w-8 text-black" />
          <span className="text-xs font-semibold text-gray-900">Ayuda</span>
        </button>
        <button className="bg-gray-100 rounded-xl py-4 px-2 flex flex-col items-center justify-center space-y-2 active:scale-95 transition-transform">
          <Wallet className="h-8 w-8 text-black" />
          <span className="text-xs font-semibold text-gray-900">Billetera</span>
        </button>
        <button 
          onClick={() => navigate('/history')}
          className="bg-gray-100 rounded-xl py-4 px-2 flex flex-col items-center justify-center space-y-2 active:scale-95 transition-transform"
        >
          <Clock className="h-8 w-8 text-black" />
          <span className="text-xs font-semibold text-gray-900">Actividad</span>
        </button>
      </div>

      {/* Promo Cards */}
      <div className="px-4 space-y-4 mb-8">
        <div className="bg-gray-100 p-5 rounded-xl flex justify-between items-center cursor-pointer active:bg-gray-200 transition-colors">
          <div>
            <h3 className="font-bold text-lg text-gray-900 mb-1">Prueba Urban One gratis</h3>
            <p className="text-xs text-gray-600 leading-relaxed max-w-[200px]">
              Desbloquea 6% de Urban Cash en viajes y más beneficios exclusivos.
            </p>
          </div>
          <div className="w-40 h-32 flex items-center justify-center -mr-6">
             <img src={carImage} alt="Urban One Car" className="w-full h-full object-contain" />
          </div>
        </div>

        <div className="bg-gray-100 p-5 rounded-xl flex justify-between items-center cursor-pointer active:bg-gray-200 transition-colors">
          <div>
            <h3 className="font-bold text-lg text-gray-900 mb-1">Revisión de privacidad</h3>
            <p className="text-xs text-gray-600 leading-relaxed max-w-[200px]">
              Toma un tour interactivo de tu configuración de privacidad.
            </p>
          </div>
          <div className="w-32 h-24 flex items-center justify-center -mr-4">
             <img src={checkImage} alt="Privacy Check" className="w-full h-full object-contain" />
          </div>
        </div>
      </div>

      {/* Menu List */}
      <div className="px-4 space-y-1">
        <button className="w-full flex items-center py-4 hover:bg-gray-50 transition-colors">
          <Users className="h-6 w-6 text-black mr-4" />
          <span className="flex-1 text-left font-medium text-lg text-gray-900">Familia y adolescentes</span>
        </button>
        
        <button 
          onClick={() => navigate('/settings')}
          className="w-full flex items-center py-4 hover:bg-gray-50 transition-colors"
        >
          <Settings className="h-6 w-6 text-black mr-4" />
          <span className="flex-1 text-left font-medium text-lg text-gray-900">Configuración</span>
        </button>
        
        <button className="w-full flex items-center py-4 hover:bg-gray-50 transition-colors">
          <MessageSquare className="h-6 w-6 text-black mr-4" />
          <span className="flex-1 text-left font-medium text-lg text-gray-900">Mensajes</span>
          <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
        </button>
        
        <button className="w-full flex items-center py-4 hover:bg-gray-50 transition-colors">
          <Briefcase className="h-6 w-6 text-black mr-4" />
          <span className="flex-1 text-left font-medium text-lg text-gray-900">Configura tu perfil de negocios</span>
        </button>

        <button className="w-full flex items-center py-4 hover:bg-gray-50 transition-colors">
            <span className="text-gray-400 text-sm">Cerrar sesión</span>
        </button>
      </div>

      {/* Bottom Nav Simulation (Optional, consistent with reference but maybe redundant if we have back button) 
          Keeping it clean without bottom nav for now as per specific page request, but adding padding bottom.
      */}
    </div>
  );
}
