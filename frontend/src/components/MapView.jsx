// MapView.jsx
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { io } from 'socket.io-client';
import 'leaflet/dist/leaflet.css';

// Default center coordinates for Delhi
const DELHI_CENTER = [28.7041, 77.1025];

// Marker colors and styles
const MARKER_STYLES = {
  host: {
    fillColor: '#FF0000',     // Red for host
    color: '#FF0000',
    fillOpacity: 0.8,
    radius: 10
  },
  'Bus-1': {
    fillColor: '#8A2BE2',     // BlueViolet
    color: '#8A2BE2',
    fillOpacity: 0.8,
    radius: 9
  },
  'Bus-2': {
    fillColor: '#1E90FF',     // DodgerBlue
    color: '#1E90FF',
    fillOpacity: 0.8,
    radius: 9
  },
  'Bus-3': {
    fillColor: '#FFA500',     // Orange
    color: '#FFA500',
    fillOpacity: 0.8,
    radius: 9
  },
  'Bus-4': {
    fillColor: '#00CED1',     // DarkTurquoise
    color: '#00CED1',
    fillOpacity: 0.8,
    radius: 9
  },
  'Bus-5': {
    fillColor: '#FF1493',     // DeepPink
    color: '#FF1493',
    fillOpacity: 0.8,
    radius: 9
  },
  'Bus-6': {
    fillColor: '#32CD32',     // LimeGreen
    color: '#32CD32',
    fillOpacity: 0.8,
    radius: 9
  },
  'Bus-7': {
    fillColor: '#FF6347',     // Tomato
    color: '#FF6347',
    fillOpacity: 0.8,
    radius: 9
  },
  'Bus-8': {
    fillColor: '#9370DB',     // MediumPurple
    color: '#9370DB',
    fillOpacity: 0.8,
    radius: 9
  },
  'Bus-9': {
    fillColor: '#20B2AA',     // LightSeaGreen
    color: '#20B2AA',
    fillOpacity: 0.8,
    radius: 9
  },
  'Bus-10': {
    fillColor: '#FF69B4',     // HotPink
    color: '#FF69B4',
    fillOpacity: 0.8,
    radius: 9
  },
  default: {
    fillColor: '#808080',     // Gray for unknown
    color: '#808080',
    fillOpacity: 0.7,
    radius: 8
  }
};

function getMarkerStyle(busId) {
  return MARKER_STYLES[busId] || MARKER_STYLES.default;
}

function formatTime(timestamp) {
  if (!timestamp) return '—';
  return new Date(timestamp).toLocaleTimeString();
}

function MapView() {
  const [buses, setBuses] = useState({});
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    const socket = io(`http://${window.location.hostname}:5000`);

    socket.on('connect', () => {
      console.log('Map connected:', socket.id);
      setConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Map disconnected');
      setConnected(false);
    });

    socket.on('location-update', (data) => {
      console.log('Received location:', data);
      setBuses(prev => ({ ...prev, [data.busId]: data }));
      setLastUpdate(new Date());
    });

    return () => socket.disconnect();
  }, []);

  // Center on host if available, else first bus, else Delhi
  const center = buses['host']
    ? [buses['host'].lat, buses['host'].lng]
    : Object.values(buses)[0]
      ? [Object.values(buses)[0].lat, Object.values(buses)[0].lng]
      : DELHI_CENTER;

  // Count only actual vehicles (exclude host)
  const vehicleCount = Object.keys(buses).filter(busId => busId !== 'host').length;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <MapContainer
        center={center}
        zoom={13}
        style={{ width: '100%', height: '100%', position: 'absolute' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {Object.values(buses).map(bus => (
          <CircleMarker
            key={bus.busId}
            center={[bus.lat, bus.lng]}
            {...getMarkerStyle(bus.busId)}
          >
            <Popup>
              <div style={{ fontSize: '13px' }}>
                <strong>{bus.busId === 'host' ? '💻 Host System' : `🚌 ${bus.busId}`}</strong><br />
                Speed: {bus.speed || '0'} km/h<br />
                Updated: {formatTime(bus.ts)}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      <div style={{
        position: 'fixed',
        left: '50%',
        transform: 'translateX(-50%)',
        top: 10,
        backgroundColor: 'rgba(255,255,255,0.9)',
        padding: '8px',
        borderRadius: '4px',
        fontSize: '12px',
        zIndex: 1000
      }}>
        {connected ? '🟢 Connected' : '🔴 Disconnected'}
        {lastUpdate && ` • Last update: ${formatTime(lastUpdate.getTime())}`}
        {vehicleCount > 0 && ` • ${vehicleCount} vehicles tracked`}
      </div>
    </div>
  );
}

export default MapView;
