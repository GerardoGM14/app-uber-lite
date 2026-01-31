import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

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

export default function Map({ pickup, dropoff, onLocationSelect, driverLocations = [] }: MapProps) {
  // Center map on pickup or default location
  const center: [number, number] = pickup 
    ? [pickup.lat, pickup.lng] 
    : [-12.0464, -77.0428]; // Default to Lima, Peru (or any default)

  return (
    <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <LocationMarker onSelect={onLocationSelect} />

      {pickup && (
        <Marker position={[pickup.lat, pickup.lng]}>
          <Popup>Pickup Location</Popup>
        </Marker>
      )}

      {dropoff && (
        <Marker position={[dropoff.lat, dropoff.lng]}>
          <Popup>Dropoff Location</Popup>
        </Marker>
      )}

      {driverLocations.map((driver) => (
        <Marker key={driver.id} position={[driver.lat, driver.lng]} icon={
          L.icon({
            iconUrl: 'https://cdn-icons-png.flaticon.com/512/3097/3097180.png', // Car icon
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          })
        }>
        </Marker>
      ))}
    </MapContainer>
  );
}
