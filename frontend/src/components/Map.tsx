import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import L from 'leaflet';
import { useEffect, useRef } from 'react';
import 'leaflet-routing-machine';
import carMapImage from '../assets/automaps.webp';

// Fix for default marker icons in React Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
  pickup?: { lat: number; lng: number };
  dropoff?: { lat: number; lng: number };
  onLocationSelect?: (lat: number, lng: number) => void;
  driverLocations?: Array<{ lat: number; lng: number; id: string }>;
}

function LocationMarker({ onSelect }: { onSelect?: (lat: number, lng: number) => void }) {
  const map = useMapEvents({
    click(e) {
      if (onSelect) {
        onSelect(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

// Componente para ajustar la vista del mapa y dibujar la ruta
function MapUpdater({ pickup, dropoff }: { pickup?: { lat: number; lng: number }, dropoff?: { lat: number; lng: number } }) {
  const map = useMap();
  const routingControlRef = useRef<L.Routing.Control | null>(null);

  useEffect(() => {
    // Si hay una ruta previa, la eliminamos
    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
      routingControlRef.current = null;
    }

    if (pickup && dropoff) {
      // Crear nueva ruta usando OSRM (gratuito)
      routingControlRef.current = L.Routing.control({
        waypoints: [
          L.latLng(pickup.lat, pickup.lng),
          L.latLng(dropoff.lat, dropoff.lng)
        ],
        routeWhileDragging: false,
        addWaypoints: false,
        fitSelectedRoutes: true,
        showAlternatives: false,
        lineOptions: {
          styles: [{ color: 'black', opacity: 0.8, weight: 5 }],
          extendToWaypoints: true,
          missingRouteTolerance: 0
        },
        createMarker: () => null as any // No crear marcadores automáticos, usamos los nuestros
      } as any).addTo(map);

      // Ocultar el panel de instrucciones de texto
      const container = routingControlRef.current.getContainer();
      if (container) {
        container.style.display = 'none';
      }

    } else if (pickup) {
      map.flyTo([pickup.lat, pickup.lng], 15);
    }
  }, [pickup, dropoff, map]);

  return null;
}

export default function Map({ pickup, dropoff, onLocationSelect, driverLocations = [] }: MapProps) {
  // Center map on pickup or default location
  const center: [number, number] = pickup 
    ? [pickup.lat, pickup.lng] 
    : [-12.0464, -77.0428]; // Default to Lima, Peru

  return (
    <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      
      <LocationMarker onSelect={onLocationSelect} />
      <MapUpdater pickup={pickup} dropoff={dropoff} />

      {/* Pickup Marker (Blue Dot) */}
      {pickup && (
        <Marker 
          position={[pickup.lat, pickup.lng]}
          icon={L.divIcon({
            className: 'custom-icon',
            html: `<div style="background-color: #2563EB; width: 24px; height: 24px; border-radius: 50%; border: 4px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"></div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          })}
        >
          <Popup>Punto de partida</Popup>
        </Marker>
      )}

      {/* Dropoff Marker (Black Square) */}
      {dropoff && (
        <Marker 
          position={[dropoff.lat, dropoff.lng]}
          icon={L.divIcon({
            className: 'custom-icon',
            html: `<div style="background-color: #000; width: 24px; height: 24px; border-radius: 4px; border: 4px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"></div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          })}
        >
          <Popup>Destino</Popup>
        </Marker>
      )}

      {/* Drivers */}
      {driverLocations.map((driver) => (
        <Marker key={driver.id} position={[driver.lat, driver.lng]} icon={
          L.icon({
            iconUrl: carMapImage, // Custom car icon
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          })
        }>
        </Marker>
      ))}
    </MapContainer>
  );
}
