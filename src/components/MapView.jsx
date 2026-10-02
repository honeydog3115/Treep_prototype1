import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, MapPin, Flag, Bike } from 'lucide-react';

// Fix default leaflet icons in React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Custom Icons for User, Departure, Arrival
const userIcon = L.divIcon({
  className: 'custom-user-icon',
  html: `<div style="background-color: #2563eb; color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); font-size: 18px;">🚴</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const startIcon = L.divIcon({
  className: 'custom-start-icon',
  html: `<div style="background-color: #16a34a; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); font-weight: bold; font-size: 14px;">출발</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const arrivalIcon = L.divIcon({
  className: 'custom-arrival-icon',
  html: `<div style="background-color: #dc2626; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); font-weight: bold; font-size: 14px;">도착</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Helper component to recenter map view dynamically
function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center.lat && center.lng) {
      map.panTo([center.lat, center.lng], { animate: true });
    }
  }, [center, map]);
  return null;
}

export default function MapView({ userLocation, departure, arrival, onMapClick, selectionMode }) {
  const center = [userLocation.lat, userLocation.lng];

  // Helper map click listener component
  function MapEvents() {
    const map = useMap();
    useEffect(() => {
      const handleClick = (e) => {
        if (onMapClick && selectionMode) {
          onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
        }
      };
      map.on('click', handleClick);
      return () => map.off('click', handleClick);
    }, [map]);
    return null;
  }

  const polylinePositions = [
    [departure.lat, departure.lng],
    [arrival.lat, arrival.lng],
  ];

  return (
    <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-lg border border-slate-200">
      {selectionMode && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-emerald-600 text-white px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold shadow-md flex items-center gap-2 animate-bounce">
          <MapPin className="w-4 h-4" />
          {selectionMode === 'departure' ? '지도를 클릭하여 출발지 선택' : '지도를 클릭하여 도착지 선택'}
        </div>
      )}

      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <RecenterMap center={userLocation} />
        <MapEvents />

        {/* Departure Marker */}
        {departure && (
          <Marker position={[departure.lat, departure.lng]} icon={startIcon}>
            <Popup>
              <div className="font-semibold text-slate-800">
                🚀 출발지: {departure.name || '선택한 장소'}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Arrival Marker */}
        {arrival && (
          <Marker position={[arrival.lat, arrival.lng]} icon={arrivalIcon}>
            <Popup>
              <div className="font-semibold text-slate-800">
                🏁 도착지: {arrival.name || '선택한 장소'}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route Line between Departure and Arrival */}
        {departure && arrival && (
          <Polyline
            positions={polylinePositions}
            color="#059669"
            weight={4}
            dashArray="8, 8"
            opacity={0.8}
          />
        )}

        {/* Current User Location Marker */}
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
          <Popup>
            <div className="font-bold text-blue-600 flex items-center gap-1">
              <Navigation className="w-4 h-4" /> 내 현재 위치
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
