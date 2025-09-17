// HostLocation.jsx
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

function HostLocation() {
  const [connected, setConnected] = useState(false);
  const [sending, setSending] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    const socket = io(`http://${window.location.hostname}:5000`);
    let watchId = null;

    socket.on('connect', () => {
      console.log('Host connected:', socket.id);
      setConnected(true);

      if ('geolocation' in navigator) {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude, speed, accuracy } = position.coords;
            const timestamp = position.timestamp;

            setSending(true);

            const data = {
              lat: latitude,
              lng: longitude,
              speed: speed ? speed * 3.6 : 0, // m/s to km/h
              ts: getISTFormattedString(new Date(timestamp)), // IST formatted string
              accuracy,
              timestamp
            };

            console.log('Host location:', data);
            socket.emit('host-location', data);
            setLastUpdate(new Date());
          },
          (error) => {
            console.error('Location error:', error);
            setSending(false);
            switch (error.code) {
              case error.PERMISSION_DENIED:
                alert("Please allow location access to share host position.");
                break;
              case error.POSITION_UNAVAILABLE:
                console.warn("Location information unavailable.");
                break;
              case error.TIMEOUT:
                console.warn("Location request timed out.");
                break;
              default:
                console.warn("Unknown location error:", error);
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          }
        );
      }
    });

    socket.on('disconnect', () => {
      console.log('Host disconnected');
      setConnected(false);
      setSending(false);
    });

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
      socket.disconnect();
    };
  }, []);

  if (!('geolocation' in navigator)) {
    return (
      <div style={{
        position: 'fixed',
        left: 10,
        top: 70,
        background: 'rgba(255,0,0,0.9)',
        color: 'white',
        padding: '5px 10px',
        borderRadius: '4px',
        fontSize: '12px',
        zIndex: 1000
      }}>
        ⚠️ Geolocation not supported
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      left: 10,
      top: 70,
      background: 'rgba(255,255,255,0.9)',
      padding: '5px 10px',
      borderRadius: '4px',
      fontSize: '12px',
      zIndex: 1000
    }}>
      💻 Host: {!connected ? 'Connecting...' : (sending ? 'Sending location' : 'Waiting for location...')}
      {lastUpdate && <div style={{ fontSize: '10px', marginTop: '2px' }}>
        Last update: {lastUpdate.toLocaleTimeString()}
      </div>}
    </div>
  );
}

export default HostLocation;

/////////////////////////////////////////
// // HostLocation.jsx
// import React, { useEffect, useState } from 'react';
// import { io } from 'socket.io-client';

// function HostLocation() {
//     const [connected, setConnected] = useState(false);
//     const [sending, setSending] = useState(false);
//     const [lastUpdate, setLastUpdate] = useState(null);

//     useEffect(() => {
//         const socket = io(`http://${window.location.hostname}:5000`);
//         // const socket = io(`https://smart-track-3fkx.vercel.app`);
//         let watchId = null;

//         socket.on('connect', () => {
//             console.log('Host connected:', socket.id);
//             setConnected(true);

//             if ('geolocation' in navigator) {
//                 watchId = navigator.geolocation.watchPosition(
//                     (position) => {
//                         const { latitude, longitude, speed, timestamp } = position.coords;
//                         setSending(true);
                        
//                         // Fixed: Use the correct event name and data structure that server expects
//                         const data = {
//                             lat: latitude,
//                             lng: longitude,
//                             speed: speed ? speed * 3.6 : 0, // Convert m/s to km/h
//                             ts: Date.now(),
//                             accuracy: position.coords.accuracy,
//                             timestamp: timestamp
//                         };
                        
//                         console.log('Host location:', data);
//                         // Changed from 'location-update' to 'host-location' to match server
//                         socket.emit('host-location', data);
//                         setLastUpdate(new Date());
//                     },
//                     (error) => {
//                         console.error('Location error:', error);
//                         setSending(false);
//                         // Show error to user based on error code
//                         switch(error.code) {
//                             case error.PERMISSION_DENIED:
//                                 alert("Please allow location access to share host position.");
//                                 break;
//                             case error.POSITION_UNAVAILABLE:
//                                 console.warn("Location information unavailable.");
//                                 break;
//                             case error.TIMEOUT:
//                                 console.warn("Location request timed out.");
//                                 break;
//                             default:
//                                 console.warn("Unknown location error:", error);
//                         }
//                     },
//                     { 
//                         enableHighAccuracy: true,
//                         timeout: 5000,
//                         maximumAge: 0
//                     }
//                 );
//             }
//         });

//         socket.on('disconnect', () => {
//             console.log('Host disconnected');
//             setConnected(false);
//             setSending(false);
//         });

//         return () => {
//             if (watchId) {
//                 navigator.geolocation.clearWatch(watchId);
//             }
//             socket.disconnect();
//         };
//     }, []);

//     if (!('geolocation' in navigator)) {
//         return (
//             <div style={{
//                 position: 'fixed',
//                 left: 10,
//                 top: 70,
//                 background: 'rgba(255,0,0,0.9)',
//                 color: 'white',
//                 padding: '5px 10px',
//                 borderRadius: '4px',
//                 fontSize: '12px',
//                 zIndex: 1000
//             }}>
//                 ⚠️ Geolocation not supported
//             </div>
//         );
//     }

//     return (
//         <div style={{
//             position: 'fixed',
//             left: 10,
//             top: 70,
//             background: 'rgba(255,255,255,0.9)',
//             padding: '5px 10px',
//             borderRadius: '4px',
//             fontSize: '12px',
//             zIndex: 1000
//         }}>
//             💻 Host: {!connected ? 'Connecting...' : (sending ? 'Sending location' : 'Waiting for location...')}
//             {lastUpdate && <div style={{ fontSize: '10px', marginTop: '2px' }}>
//                 Last update: {lastUpdate.toLocaleTimeString()}
//             </div>}
//         </div>
//     );
// }

// export default HostLocation;
