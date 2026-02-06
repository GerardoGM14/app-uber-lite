import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Globe, Moon, Shield, CircleHelp, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export default function Settings() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white px-4 py-4 shadow-sm sticky top-0 z-10 flex items-center">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="h-6 w-6 text-gray-800" />
        </button>
        <h1 className="text-xl font-bold text-gray-900 ml-2">Configuración</h1>
      </div>

      <div className="flex-1 p-4 space-y-6">
        
        {/* Section 1: Preferences */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-gray-50/50 border-b border-gray-100">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Preferencias</h3>
            </div>
            
            <div className="divide-y divide-gray-100">
                <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg mr-3">
                            <Bell className="h-5 w-5" />
                        </div>
                        <span className="font-medium text-gray-900">Notificaciones</span>
                    </div>
                    <div 
                        onClick={() => setNotifications(!notifications)}
                        className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors ${notifications ? 'bg-green-500' : 'bg-gray-300'}`}
                    >
                        <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${notifications ? 'translate-x-5' : 'translate-x-0'}`}></div>
                    </div>
                </div>

                <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg mr-3">
                            <Moon className="h-5 w-5" />
                        </div>
                        <span className="font-medium text-gray-900">Modo Oscuro</span>
                    </div>
                    <div 
                        onClick={() => setDarkMode(!darkMode)}
                        className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors ${darkMode ? 'bg-black' : 'bg-gray-300'}`}
                    >
                        <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${darkMode ? 'translate-x-5' : 'translate-x-0'}`}></div>
                    </div>
                </div>

                <div className="p-4 flex items-center justify-between active:bg-gray-50 cursor-pointer">
                    <div className="flex items-center">
                        <div className="p-2 bg-orange-50 text-orange-600 rounded-lg mr-3">
                            <Globe className="h-5 w-5" />
                        </div>
                        <span className="font-medium text-gray-900">Idioma</span>
                    </div>
                    <div className="flex items-center text-gray-400">
                        <span className="text-sm mr-2">Español (PE)</span>
                        <ChevronRight className="h-4 w-4" />
                    </div>
                </div>
            </div>
        </div>

        {/* Section 2: Support */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-gray-50/50 border-b border-gray-100">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Soporte</h3>
            </div>
            
            <div className="divide-y divide-gray-100">
                <div className="p-4 flex items-center justify-between active:bg-gray-50 cursor-pointer">
                    <div className="flex items-center">
                        <div className="p-2 bg-red-50 text-red-600 rounded-lg mr-3">
                            <Shield className="h-5 w-5" />
                        </div>
                        <span className="font-medium text-gray-900">Privacidad y Seguridad</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>

                <div className="p-4 flex items-center justify-between active:bg-gray-50 cursor-pointer">
                    <div className="flex items-center">
                        <div className="p-2 bg-teal-50 text-teal-600 rounded-lg mr-3">
                            <CircleHelp className="h-5 w-5" />
                        </div>
                        <span className="font-medium text-gray-900">Ayuda y Soporte</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
            </div>
        </div>

        <div className="text-center pt-4">
            <p className="text-xs text-gray-400">UrbanGo v1.0.0 (Build 2024)</p>
            <p className="text-[10px] text-gray-300 mt-1">Made with love by Trae</p>
        </div>
      </div>
    </div>
  );
}
