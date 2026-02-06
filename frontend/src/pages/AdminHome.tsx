import { useState, useLayoutEffect, useRef, useEffect } from 'react';
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import * as am5percent from "@amcharts/amcharts5/percent";
import * as am5radar from "@amcharts/amcharts5/radar";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Bell,
  Search
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';

// --- Reusable Chart Components ---

// 1. StatWidget: Small sparkline-style chart for top metrics
// Props: id, title, value, change, trend ('up' | 'down'), color (hex string)
function StatWidget({ id, title, value, change, trend, color }: any) {
  useLayoutEffect(() => {
    let root = am5.Root.new(id);
    root.setThemes([am5themes_Animated.new(root)]);

    let chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        wheelX: "none",
        wheelY: "none",
        layout: root.verticalLayout,
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 20,
        paddingBottom: 20
      })
    );

    // Generate random trend data
    let data = [];
    let baseValue = 100;
    for (let i = 0; i < 20; i++) {
      baseValue += Math.round((Math.random() < 0.5 ? 1 : -1) * Math.random() * 20);
      if (baseValue < 10) baseValue = 10;
      data.push({ date: new Date(2023, 0, i).getTime(), value: baseValue });
    }

    let yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, { 
            visible: false,
            minGridDistance: 1000 
        }),
        visible: false
      })
    );

    let xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(root, {
        baseInterval: { timeUnit: "day", count: 1 },
        renderer: am5xy.AxisRendererX.new(root, { 
            visible: false,
            minGridDistance: 1000 
        }),
        visible: false
      })
    );

    let series = chart.series.push(
      am5xy.SmoothedXLineSeries.new(root, {
        name: "Series",
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "value",
        valueXField: "date",
        stroke: am5.color(color),
        fill: am5.color(color)
      })
    );

    series.fills.template.setAll({
      fillOpacity: 0.1,
      visible: true
    });

    series.strokes.template.setAll({
        strokeWidth: 2
    });

    series.data.setAll(data);

    // Add labels inside the chart container (no HTML cards!)
    
    // Title
    chart.children.unshift(am5.Label.new(root, {
        text: title,
        fontSize: 14,
        fontWeight: "500",
        fill: am5.color(0x888888),
        x: 0,
        y: 0
    }));

    // Value
    chart.children.unshift(am5.Label.new(root, {
        text: value,
        fontSize: 28,
        fontWeight: "700",
        fill: am5.color(0x000000),
        x: 0,
        y: 25
    }));

    // Change indicator
    let changeColor = trend === 'up' ? 0x22c55e : 0xef4444; // green-500 : red-500
    chart.children.unshift(am5.Label.new(root, {
        text: change,
        fontSize: 13,
        fontWeight: "600",
        fill: am5.color(changeColor),
        background: am5.RoundedRectangle.new(root, {
            fill: am5.color(changeColor),
            fillOpacity: 0.1,
            cornerRadiusTL: 4,
            cornerRadiusTR: 4,
            cornerRadiusBR: 4,
            cornerRadiusBL: 4
        }),
        paddingTop: 2,
        paddingBottom: 2,
        paddingLeft: 6,
        paddingRight: 6,
        x: 0,
        y: 65
    }));

    return () => { root.dispose(); };
  }, [id, title, value, change, trend, color]);

  return <div id={id} className="w-full h-[160px] bg-white/50 rounded-2xl overflow-hidden"></div>;
}

// 2. RevenueChart: Full graph with embedded title
function RevenueChart() {
  const chartRef = useRef<any>(null);

  useLayoutEffect(() => {
    let root = am5.Root.new("revenuechart");
    root.setThemes([am5themes_Animated.new(root)]);

    let chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panY: false,
        layout: root.verticalLayout,
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 20,
        paddingBottom: 20
      })
    );

    // Title inside chart
    chart.children.unshift(am5.Label.new(root, {
        text: "Ingresos Semanales",
        fontSize: 20,
        fontWeight: "700",
        fill: am5.color(0x111827),
        marginBottom: 10
    }));

    let data = [
      { date: new Date(2023, 0, 1).getTime(), value: 1000 },
      { date: new Date(2023, 0, 2).getTime(), value: 1200 },
      { date: new Date(2023, 0, 3).getTime(), value: 850 },
      { date: new Date(2023, 0, 4).getTime(), value: 1500 },
      { date: new Date(2023, 0, 5).getTime(), value: 1350 },
      { date: new Date(2023, 0, 6).getTime(), value: 2000 },
      { date: new Date(2023, 0, 7).getTime(), value: 1800 }
    ];

    let yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {
            strokeOpacity: 0.1
        })
      })
    );

    let xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(root, {
        baseInterval: { timeUnit: "day", count: 1 },
        renderer: am5xy.AxisRendererX.new(root, {
            minGridDistance: 50
        }),
        tooltip: am5.Tooltip.new(root, {})
      })
    );

    let series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: "Revenue",
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "value",
        valueXField: "date",
        tooltip: am5.Tooltip.new(root, { labelText: "{valueY}" })
      })
    );

    series.columns.template.setAll({
        cornerRadiusTL: 5,
        cornerRadiusTR: 5,
        strokeOpacity: 0
    });

    series.columns.template.adapters.add("fill", function(fill, target) {
        return chart.get("colors")?.getIndex(series.columns.indexOf(target));
    });
    series.columns.template.adapters.add("stroke", function(stroke, target) {
        return chart.get("colors")?.getIndex(series.columns.indexOf(target));
    });

    series.data.setAll(data);
    chart.set("cursor", am5xy.XYCursor.new(root, {}));
    chartRef.current = chart;

    return () => { root.dispose(); };
  }, []);

  return <div id="revenuechart" className="w-full h-[400px] bg-white/50 rounded-2xl"></div>;
}

// 3. StatusChart: Pie Chart with embedded title
function StatusChart() {
    useLayoutEffect(() => {
        let root = am5.Root.new("statuschart");
        root.setThemes([am5themes_Animated.new(root)]);
    
        let chart = root.container.children.push(
          am5percent.PieChart.new(root, {
            layout: root.verticalLayout,
            innerRadius: am5.percent(60)
          })
        );

        // Title inside chart
        chart.children.unshift(am5.Label.new(root, {
            text: "Estado de Viajes",
            fontSize: 20,
            fontWeight: "700",
            fill: am5.color(0x111827),
            align: "center",
            marginBottom: 10
        }));
    
        let data = [
          { category: "Completados", value: 500 },
          { category: "Cancelados", value: 30 },
          { category: "En curso", value: 50 }
        ];
    
        let series = chart.series.push(
          am5percent.PieSeries.new(root, {
            valueField: "value",
            categoryField: "category",
            alignLabels: false
          })
        );

        series.labels.template.setAll({
            textType: "circular",
            radius: 4
        });
    
        series.data.setAll(data);
        
        let legend = chart.children.push(am5.Legend.new(root, {
            centerX: am5.percent(50),
            x: am5.percent(50),
            marginTop: 15,
            marginBottom: 15
        }));
        legend.data.setAll(series.dataItems);

        // Center label for total or emphasis
        let label = chart.seriesContainer.children.push(am5.Label.new(root, {
            textAlign: "center",
            centerY: am5.percent(50),
            centerX: am5.percent(50),
            text: "[fontSize:18px]Total[/]\n[bold fontSize:30px]580[/]"
        }));
    
        return () => { root.dispose(); };
      }, []);
    
      return <div id="statuschart" className="w-full h-[400px] bg-white/50 rounded-2xl"></div>;
}

// 4. HourlyDemandChart (Replaces Heatmap)
function HourlyDemandChart() {
    useLayoutEffect(() => {
        let root = am5.Root.new("demandchart");
        root.setThemes([am5themes_Animated.new(root)]);

        let chart = root.container.children.push(
            am5xy.XYChart.new(root, {
                panX: true,
                panY: false,
                wheelX: "panX",
                wheelY: "zoomX",
                layout: root.verticalLayout,
                paddingLeft: 20,
                paddingRight: 20,
                paddingTop: 20,
                paddingBottom: 20
            })
        );

        chart.children.unshift(am5.Label.new(root, {
            text: "Demanda por Hora (Picos)",
            fontSize: 20,
            fontWeight: "700",
            fill: am5.color(0x111827),
            marginBottom: 10
        }));

        let data = [];
        for (let i = 0; i < 24; i++) {
            data.push({ 
                hour: i + ":00", 
                value: Math.floor(Math.random() * 100) + 20 
            });
        }

        let xAxis = chart.xAxes.push(
            am5xy.CategoryAxis.new(root, {
                categoryField: "hour",
                renderer: am5xy.AxisRendererX.new(root, { minGridDistance: 30 }),
                tooltip: am5.Tooltip.new(root, {})
            })
        );
        xAxis.data.setAll(data);

        let yAxis = chart.yAxes.push(
            am5xy.ValueAxis.new(root, {
                renderer: am5xy.AxisRendererY.new(root, {})
            })
        );

        let series = chart.series.push(
            am5xy.LineSeries.new(root, {
                name: "Demand",
                xAxis: xAxis,
                yAxis: yAxis,
                valueYField: "value",
                categoryXField: "hour",
                tooltip: am5.Tooltip.new(root, { labelText: "{valueY}" })
            })
        );

        series.strokes.template.setAll({ strokeWidth: 3 });
        series.bullets.push(function() {
            return am5.Bullet.new(root, {
                sprite: am5.Circle.new(root, {
                    radius: 5,
                    fill: series.get("fill")
                })
            });
        });

        let cursor = chart.set("cursor", am5xy.XYCursor.new(root, {}));
        cursor.lineY.set("visible", false);

        series.data.setAll(data);

        return () => { root.dispose(); };
    }, []);

    return <div id="demandchart" className="w-full h-[300px] bg-white/50 rounded-2xl"></div>;
}

// --- Layout Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-center p-3 rounded-xl transition-all mb-1 ${
            active 
            ? 'bg-black text-white shadow-md' 
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
        }`}
    >
        <Icon className="h-5 w-5 mr-3" />
        <span className="font-medium text-sm">{label}</span>
    </button>
);

export default function AdminHome() {
    const navigate = useNavigate();
    const logout = useAuthStore((state) => state.logout);
    const user = useAuthStore((state) => state.user);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    // In a real app, useLocation would determine active state
    const [activeTab, setActiveTab] = useState('dashboard');

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex overflow-hidden">
            {/* Mobile Sidebar Backdrop */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar Navigation */}
            <motion.aside 
                className={`
                    fixed lg:static inset-y-0 left-0 z-50
                    w-64 bg-white border-r border-gray-200 shadow-xl lg:shadow-none
                    flex flex-col
                    transform lg:transform-none transition-transform duration-300 ease-in-out
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
            >
                {/* Logo Area */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between lg:justify-center">
                    <h1 className="text-2xl font-bold tracking-tighter">Urban<span className="text-blue-600">Go</span><span className="text-xs ml-1 text-gray-400 font-normal border border-gray-200 px-1 rounded">ADMIN</span></h1>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1 text-gray-500">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Nav Items */}
                <nav className="flex-1 p-4 overflow-y-auto">
                    <div className="mb-6">
                        <p className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Principal</p>
                        <SidebarItem 
                            icon={LayoutDashboard} 
                            label="Dashboard" 
                            active={activeTab === 'dashboard'} 
                            onClick={() => setActiveTab('dashboard')} 
                        />
                        <SidebarItem 
                            icon={Users} 
                            label="Usuarios" 
                            active={activeTab === 'users'} 
                            onClick={() => setActiveTab('users')} 
                        />
                        <SidebarItem 
                            icon={Car} 
                            label="Conductores" 
                            active={activeTab === 'drivers'} 
                            onClick={() => setActiveTab('drivers')} 
                        />
                    </div>
                    
                    <div>
                        <p className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Sistema</p>
                        <SidebarItem 
                            icon={Settings} 
                            label="Configuración" 
                            active={activeTab === 'settings'} 
                            onClick={() => setActiveTab('settings')} 
                        />
                    </div>
                </nav>
            </motion.aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8">
                    <div className="flex items-center">
                        <button 
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 mr-4 lg:hidden hover:bg-gray-100 rounded-full text-gray-600"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        
                        {/* Search Bar */}
                        <div className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2 w-64 lg:w-96 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white transition-all">
                            <Search className="h-4 w-4 text-gray-400 mr-2" />
                            <input 
                                type="text" 
                                placeholder="Buscar usuarios, viajes..." 
                                className="bg-transparent border-none focus:outline-none text-sm w-full placeholder-gray-400"
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 md:space-x-4">
                        <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-full relative">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        
                        <div className="h-8 w-px bg-gray-200 mx-2 hidden md:block"></div>

                        <div className="flex items-center pl-2">
                            <div className="text-right mr-3 hidden md:block">
                                <p className="text-sm font-bold text-gray-900 leading-tight">{user?.name || 'Admin'}</p>
                                <p className="text-xs text-gray-500">Administrador</p>
                            </div>
                            <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 shadow-sm bg-gray-100">
                                <img 
                                    src={`https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(user?.name || 'Admin')}&backgroundColor=e5e7eb`} 
                                    alt="Profile" 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <button 
                                onClick={handleLogout}
                                className="ml-3 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                title="Cerrar Sesión"
                            >
                                <LogOut className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Dashboard Content Scrollable Area */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                    <div className="max-w-7xl mx-auto space-y-6">
                        
                        {/* Stats Row */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                            <StatWidget 
                                id="stat1"
                                title="Ingresos Totales"
                                value="S/ 45,231"
                                change="+20.1%"
                                trend="up"
                                color="#3b82f6"
                            />
                            <StatWidget 
                                id="stat2"
                                title="Viajes Activos"
                                value="1,234"
                                change="+180"
                                trend="up"
                                color="#6366f1"
                            />
                            <StatWidget 
                                id="stat3"
                                title="Nuevos Usuarios"
                                value="573"
                                change="+201"
                                trend="up"
                                color="#10b981"
                            />
                            <StatWidget 
                                id="stat4"
                                title="Tasa Cancelación"
                                value="2.4%"
                                change="-1.2%"
                                trend="down"
                                color="#f43f5e"
                            />
                        </div>

                        {/* Charts Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <RevenueChart />
                            <StatusChart />
                        </div>
                        
                        {/* Bottom Full Width Chart/Table Area */}
                        <div className="w-full">
                             <HourlyDemandChart />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
