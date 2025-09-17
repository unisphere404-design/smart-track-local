// SendLocation.jsx
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

function getISTFormattedString(date = new Date()) {
  const istOffsetMinutes = 330;
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const istDate = new Date(utc + istOffsetMinutes * 60000);

  const year = istDate.getFullYear();
  const month = String(istDate.getMonth() + 1).padStart(2, '0');
  const day = String(istDate.getDate()).padStart(2, '0');
  const hours = String(istDate.getHours()).padStart(2, '0');
  const minutes = String(istDate.getMinutes()).padStart(2, '0');
  const seconds = String(istDate.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function SendLocation({ busId = 'Bus-1' }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [sending, setSending] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState(null);
  const [locationData, setLocationData] = useState(null);

  useEffect(() => {
    const newSocket = io(`http://${window.location.hostname}:5000`);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log(`📱 ${busId} connected:`, newSocket.id);
      setConnected(true);
      setError(null);
    });

    newSocket.on('disconnect', () => {
      console.log(`📱 ${busId} disconnected`);
      setConnected(false);
      setSending(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Connection error:', err);
      setError('Connection failed. Check server IP.');
      setConnected(false);
    });

    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, speed, accuracy } = position.coords;
          const timestamp = position.timestamp;

          const data = {
            busId,
            lat: latitude,
            lng: longitude,
            speed: speed ? Math.round(speed * 3.6) : 0,  // m/s to km/h
            ts: getISTFormattedString(new Date(timestamp)), // IST formatted string
            accuracy: Math.round(accuracy)
          };

          setLocationData(data);
          setSending(true);
          setError(null);

          if (newSocket && newSocket.connected) {
            console.log(`📱 ${busId} sending location:`, data);
            newSocket.emit('bus-location', data);
            setLastUpdate(new Date());
          }
        },
        (err) => {
          console.error(`${busId} Location error:`, err);
          setSending(false);

          switch (err.code) {
            case err.PERMISSION_DENIED:
              setError("Location permission denied. Please allow location access.");
              break;
            case err.POSITION_UNAVAILABLE:
              setError("Location unavailable. Check GPS settings.");
              break;
            case err.TIMEOUT:
              setError("Location request timed out.");
              break;
            default:
              setError("Unknown location error occurred.");
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 1000
        }
      );

      return () => {
        if (watchId) navigator.geolocation.clearWatch(watchId);
        if (newSocket) newSocket.disconnect();
      };
    } else {
      setError('Geolocation is not supported on this device.');
    }
  }, [busId]);

  const getStatusColor = () => {
    if (error) return '#ff4444';
    if (!connected) return '#ffaa00';
    if (sending) return '#44ff44';
    return '#888888';
  };

  const getStatusText = () => {
    if (error) return 'Error';
    if (!connected) return 'Connecting...';
    if (sending) return 'Active';
    return 'Waiting...';
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '15px',
      boxShadow: '0 -2px 10px rgba(0,0,0,0.3)',
      zIndex: 1000,
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: getStatusColor(),
            animation: sending ? 'pulse 2s infinite' : 'none'
          }}></div>
          <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
            🚌 {busId}
          </span>
        </div>
        <span style={{
          fontSize: '14px',
          background: 'rgba(255,255,255,0.2)',
          padding: '4px 8px',
          borderRadius: '12px'
        }}>
          {getStatusText()}
        </span>
      </div>

      <div style={{ fontSize: '12px', opacity: '0.9', marginBottom: '8px' }}>
        Server: {connected ? '🟢 Connected' : '🔴 Disconnected'} •
        GPS: {sending ? '🟢 Active' : '🔴 Inactive'}
        {lastUpdate && (
          <> • Last: {lastUpdate.toLocaleTimeString()}</>
        )}
      </div>

      {locationData && !error && (
        <div style={{
          fontSize: '11px',
          opacity: '0.8',
          background: 'rgba(255,255,255,0.1)',
          padding: '6px',
          borderRadius: '4px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '4px'
        }}>
          <div>📍 Lat: {locationData.lat.toFixed(6)}</div>
          <div>📍 Lng: {locationData.lng.toFixed(6)}</div>
          <div>🚀 Speed: {locationData.speed} km/h</div>
          <div>🎯 Accuracy: ±{locationData.accuracy} m</div>
        </div>
      )}

      {error && (
        <div style={{
          marginTop: '10px',
          backgroundColor: '#ffdddd',
          color: '#990000',
          padding: '10px',
          borderRadius: '5px',
          fontSize: '13px',
          textAlign: 'center'
        }}>
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}

export default SendLocation;

// // SendLocation.jsx
// import React, { useEffect, useState } from 'react';
// import { io } from 'socket.io-client';

// function SendLocation({ busId = 'Bus-1' }) {
//   const [socket, setSocket] = useState(null);
//   const [connected, setConnected] = useState(false);
//   const [sending, setSending] = useState(false);
//   const [lastUpdate, setLastUpdate] = useState(null);
//   const [error, setError] = useState(null);
//   const [locationData, setLocationData] = useState(null);

//   useEffect(() => {
//     const newSocket = io(`http://${window.location.hostname}:5000`);
//     setSocket(newSocket);

//     newSocket.on('connect', () => {
//       console.log(`📱 ${busId} connected:`, newSocket.id);
//       setConnected(true);
//       setError(null);
//     });

//     newSocket.on('disconnect', () => {
//       console.log(`📱 ${busId} disconnected`);
//       setConnected(false);
//       setSending(false);
//     });

//     newSocket.on('connect_error', (err) => {
//       console.error('Connection error:', err);
//       setError('Connection failed. Check server IP.');
//       setConnected(false);
//     });

//     if ('geolocation' in navigator) {
//       const watchId = navigator.geolocation.watchPosition(
//         (position) => {
//           const { latitude, longitude, speed, accuracy } = position.coords;
//           const data = {
//             busId,
//             lat: latitude,
//             lng: longitude,
//             speed: speed ? Math.round(speed * 3.6) : 0,
//             ts: new Date().toISOString(), // ✅ ISO format
//             accuracy: Math.round(accuracy)
//           };

//           setLocationData(data);
//           setSending(true);
//           setError(null);

//           if (newSocket && newSocket.connected) {
//             console.log(`📱 ${busId} sending location:`, data);
//             newSocket.emit('bus-location', data);
//             setLastUpdate(new Date());
//           }
//         },
//         (err) => {
//           console.error(`${busId} Location error:`, err);
//           setSending(false);

//           switch (err.code) {
//             case err.PERMISSION_DENIED:
//               setError("Location permission denied. Please allow location access.");
//               break;
//             case err.POSITION_UNAVAILABLE:
//               setError("Location unavailable. Check GPS settings.");
//               break;
//             case err.TIMEOUT:
//               setError("Location request timed out.");
//               break;
//             default:
//               setError("Unknown location error occurred.");
//           }
//         },
//         {
//           enableHighAccuracy: true,
//           timeout: 10000,
//           maximumAge: 1000
//         }
//       );

//       return () => {
//         if (watchId) navigator.geolocation.clearWatch(watchId);
//         if (newSocket) newSocket.disconnect();
//       };
//     } else {
//       setError('Geolocation is not supported on this device.');
//     }
//   }, [busId]);

//   const getStatusColor = () => {
//     if (error) return '#ff4444';
//     if (!connected) return '#ffaa00';
//     if (sending) return '#44ff44';
//     return '#888888';
//   };

//   const getStatusText = () => {
//     if (error) return 'Error';
//     if (!connected) return 'Connecting...';
//     if (sending) return 'Active';
//     return 'Waiting...';
//   };

//   return (
//     <div style={{
//       position: 'fixed',
//       bottom: 0,
//       left: 0,
//       right: 0,
//       background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//       color: 'white',
//       padding: '15px',
//       boxShadow: '0 -2px 10px rgba(0,0,0,0.3)',
//       zIndex: 1000,
//       fontFamily: 'Arial, sans-serif'
//     }}>
//       <div style={{
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         marginBottom: '10px'
//       }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
//           <div style={{
//             width: '12px',
//             height: '12px',
//             borderRadius: '50%',
//             backgroundColor: getStatusColor(),
//             animation: sending ? 'pulse 2s infinite' : 'none'
//           }}></div>
//           <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
//             🚌 {busId}
//           </span>
//         </div>
//         <span style={{
//           fontSize: '14px',
//           background: 'rgba(255,255,255,0.2)',
//           padding: '4px 8px',
//           borderRadius: '12px'
//         }}>
//           {getStatusText()}
//         </span>
//       </div>

//       <div style={{ fontSize: '12px', opacity: '0.9', marginBottom: '8px' }}>
//         Server: {connected ? '🟢 Connected' : '🔴 Disconnected'} •
//         GPS: {sending ? '🟢 Active' : '🔴 Inactive'}
//         {lastUpdate && (
//           <> • Last: {lastUpdate.toLocaleTimeString()}</>
//         )}
//       </div>

//       {locationData && !error && (
//         <div style={{
//           fontSize: '11px',
//           opacity: '0.8',
//           background: 'rgba(255,255,255,0.1)',
//           padding: '6px',
//           borderRadius: '4px',
//           display: 'grid',
//           gridTemplateColumns: '1fr 1fr',
//           gap: '4px'
//         }}>
//           <div>📍 Lat: {locationData.lat.toFixed(6)}</div>
//           <div>📍 Lng: {locationData.lng.toFixed(6)}</div>
//           <div>🚀 Speed: {locationData.speed} km/h</div>
//           <div>🎯 Accuracy: ±{locationData.accuracy} m</div>
//         </div>
//       )}

//       {error && (
//         <div style={{
//           marginTop: '10px',
//           backgroundColor: '#ffdddd',
//           color: '#990000',
//           padding: '10px',
//           borderRadius: '5px',
//           fontSize: '13px',
//           textAlign: 'center'
//         }}>
//           ⚠️ {error}
//         </div>
//       )}
//     </div>
//   );
// }

// export default SendLocation;
