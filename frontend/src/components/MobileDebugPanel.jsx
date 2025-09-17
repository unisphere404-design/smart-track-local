// MobileDebugPanel.jsx - Add this to components folder
import React, { useState } from 'react';

function MobileDebugPanel({ socket, busId, locationData, connected, sending }) {
  const [showDebug, setShowDebug] = useState(false);

  const testConnection = () => {
    if (socket && socket.connected) {
      console.log('🧪 Testing connection...');
      const testData = {
        busId: busId,
        lat: 28.7041 + (Math.random() - 0.5) * 0.01,
        lng: 77.1025 + (Math.random() - 0.5) * 0.01,
        speed: Math.floor(Math.random() * 60),
        ts: Date.now(),
        accuracy: 10
      };
      socket.emit('bus-location', testData);
      alert('Test data sent! Check server console.');
    } else {
      alert('Socket not connected!');
    }
  };

  const forceReconnect = () => {
    if (socket) {
      console.log('🔄 Force reconnecting...');
      socket.disconnect();
      setTimeout(() => socket.connect(), 1000);
    }
  };

  if (!showDebug) {
    return (
      <button
        onClick={() => setShowDebug(true)}
        style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          background: '#ff6b6b',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          fontSize: '16px',
          zIndex: 9999,
          cursor: 'pointer'
        }}
      >
        🐛
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      left: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.9)',
      color: 'white',
      padding: '10px',
      borderRadius: '8px',
      fontSize: '12px',
      zIndex: 9999,
      maxHeight: '300px',
      overflow: 'auto'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <strong>🐛 Debug Panel - {busId}</strong>
        <button onClick={() => setShowDebug(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
          ❌
        </button>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <div>Socket ID: {socket?.id || 'N/A'}</div>
        <div>Connected: {connected ? '✅' : '❌'}</div>
        <div>Sending: {sending ? '✅' : '❌'}</div>
        <div>Server: {window.location.hostname}:5000</div>
        <div>Transport: {socket?.io?.engine?.transport?.name || 'N/A'}</div>
      </div>

      {locationData && (
        <div style={{ marginBottom: '10px', background: 'rgba(255,255,255,0.1)', padding: '8px', borderRadius: '4px' }}>
          <div><strong>Last Location Data:</strong></div>
          <div>Lat: {locationData.lat?.toFixed(6)}</div>
          <div>Lng: {locationData.lng?.toFixed(6)}</div>
          <div>Speed: {locationData.speed} km/h</div>
          <div>Accuracy: {locationData.accuracy}m</div>
          <div>Timestamp: {new Date(locationData.ts).toLocaleTimeString()}</div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
        <button onClick={testConnection} style={buttonStyle}>
          🧪 Test Send
        </button>
        <button onClick={forceReconnect} style={buttonStyle}>
          🔄 Reconnect
        </button>
        <button onClick={() => console.log('Socket:', socket)} style={buttonStyle}>
          📋 Log Socket
        </button>
      </div>
    </div>
  );
}

const buttonStyle = {
  background: '#4CAF50',
  color: 'white',
  border: 'none',
  padding: '5px 8px',
  borderRadius: '4px',
  fontSize: '10px',
  cursor: 'pointer'
};

export default MobileDebugPanel;