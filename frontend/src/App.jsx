// App.jsx
import React, { useState, useEffect } from 'react';
import './App.css';
import MapView from './components/MapView';
import SendLocation from './components/sendLocation';
import HostLocation from './components/HostLocation';

function App() {
  const [deviceType, setDeviceType] = useState('map'); // 'map', 'host', 'bus'
  const [busId, setBusId] = useState('Bus-1');

  // Generate unique Bus ID for new mobile connections
  const generateBusId = () => {
    const timestamp = Date.now().toString().slice(-4);
    const randomNum = Math.floor(Math.random() * 100);
    return `Bus-${randomNum}`;
  };

  // Detect device type from URL params or localStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type');
    const id = params.get('id');
    
    if (type) {
      setDeviceType(type);
      if (id) {
        setBusId(id);
      } else if (type === 'bus') {
        // Auto-generate unique Bus ID for mobile devices
        const savedBusId = localStorage.getItem('busId');
        if (savedBusId) {
          setBusId(savedBusId);
        } else {
          const newBusId = generateBusId();
          setBusId(newBusId);
          localStorage.setItem('busId', newBusId);
        }
      }
    } else {
      // Auto-detect device type (mobile = bus mode)
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile && !params.get('type')) {
        setDeviceType('bus');
        const savedBusId = localStorage.getItem('busId');
        if (savedBusId) {
          setBusId(savedBusId);
        } else {
          const newBusId = generateBusId();
          setBusId(newBusId);
          localStorage.setItem('busId', newBusId);
        }
      }
    }
  }, []);

  // Handle manual Bus ID change
  const handleBusIdChange = (e) => {
    const newBusId = e.target.value;
    setBusId(newBusId);
    localStorage.setItem('busId', newBusId);
  };

  return (
    <div className="App">
      <div className="header">
        <h1 style={{ margin: 0, fontSize: '20px' }}>
          🗺️ Real-Time Bus Tracking System
          {deviceType === 'host' && ' - Host Device'}
          {deviceType === 'bus' && ` - ${busId}`}
        </h1>
        
        {/* Device type switcher and Bus ID input */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* Bus ID input for bus mode */}
          {deviceType === 'bus' && (
            <input
              type="text"
              value={busId}
              onChange={handleBusIdChange}
              placeholder="Enter Bus ID"
              style={{
                padding: '5px 8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontSize: '12px',
                width: '80px'
              }}
            />
          )}
          
          <button 
            onClick={() => setDeviceType('map')}
            style={{
              padding: '5px 10px',
              background: deviceType === 'map' ? '#4CAF50' : '#666',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Map View
          </button>
          <button 
            onClick={() => setDeviceType('host')}
            style={{
              padding: '5px 10px',
              background: deviceType === 'host' ? '#4CAF50' : '#666',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Host Mode
          </button>
          <button 
            onClick={() => {
              setDeviceType('bus');
              if (!busId.startsWith('Bus-')) {
                const newBusId = generateBusId();
                setBusId(newBusId);
                localStorage.setItem('busId', newBusId);
              }
            }}
            style={{
              padding: '5px 10px',
              background: deviceType === 'bus' ? '#4CAF50' : '#666',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Bus Mode
          </button>
        </div>
      </div>
      
      <div className="content">
        {/* Always show map */}
        <div className="map-container">
          <MapView />
        </div>
        
        {/* Conditionally render location senders based on device type */}
        {deviceType === 'host' && <HostLocation />}
        {deviceType === 'bus' && <SendLocation busId={busId} />}
      </div>
    </div>
  );
}

export default App;






// // App.js
// import React, { useState, useEffect } from 'react';
// import './App.css';
// import MapView from './components/MapView';
// import SendLocation from './components/sendLocation';
// import HostLocation from './components/HostLocation';

// function App() {
//   const [deviceType, setDeviceType] = useState('map'); // 'map', 'host', 'bus'
//   const [busId, setBusId] = useState('bus-1');

//   // Detect device type from URL params or localStorage
//   useEffect(() => {
//     const params = new URLSearchParams(window.location.search);
//     const type = params.get('type');
//     const id = params.get('id');
    
//     if (type) {
//       setDeviceType(type);
//       if (id) setBusId(id);
//     }
//   }, []);

//   return (
//     <div className="App">
//       <div className="header">
//         <h1 style={{ margin: 0, fontSize: '20px' }}>
//           🗺️ Real-Time Bus Tracking System
//           {deviceType === 'host' && ' - Host Device'}
//           {deviceType === 'bus' && ` - ${busId}`}
//         </h1>
        
//         {/* Quick device type switcher for testing */}
//         <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
//           <button 
//             onClick={() => setDeviceType('map')}
//             style={{
//               padding: '5px 10px',
//               background: deviceType === 'map' ? '#4CAF50' : '#666',
//               color: 'white',
//               border: 'none',
//               borderRadius: '4px',
//               cursor: 'pointer'
//             }}
//           >
//             Map View
//           </button>
//           <button 
//             onClick={() => setDeviceType('host')}
//             style={{
//               padding: '5px 10px',
//               background: deviceType === 'host' ? '#4CAF50' : '#666',
//               color: 'white',
//               border: 'none',
//               borderRadius: '4px',
//               cursor: 'pointer'
//             }}
//           >
//             Host Mode
//           </button>
//           <button 
//             onClick={() => setDeviceType('bus')}
//             style={{
//               padding: '5px 10px',
//               background: deviceType === 'bus' ? '#4CAF50' : '#666',
//               color: 'white',
//               border: 'none',
//               borderRadius: '4px',
//               cursor: 'pointer'
//             }}
//           >
//             Bus Mode
//           </button>
//         </div>
//       </div>
      
//       <div className="content">
//         <div className="map-container">
//           <MapView />
//         </div>
        
//         {/* Conditionally render location senders based on device type */}
//         {deviceType === 'host' && <HostLocation />}
//         {deviceType === 'bus' && <SendLocation busId={busId} />}
//       </div>
//     </div>
//   );
// }

// export default App;

