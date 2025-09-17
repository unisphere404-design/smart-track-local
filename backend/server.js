// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(express.static(path.join(__dirname, 'public')));

const locations = {}; // Latest positions
const locationHistory = {}; // Full path for each bus

function isValidCoords(lat, lng) {
  return typeof lat === 'number' && typeof lng === 'number' &&
         lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Send current locations to new client
  socket.emit('init', { busId: 'bus-' + socket.id.slice(-4), locations });

  // Handle mobile/bus location updates
  socket.on('bus-location', (data) => {
    console.log('📱 Received from mobile/bus:', JSON.stringify(data, null, 2));
    if (data && data.busId && isValidCoords(data.lat, data.lng)) {
      locations[data.busId] = data;
      locationHistory[data.busId] = locationHistory[data.busId] || [];
      locationHistory[data.busId].push(data);
      
      // Broadcast to all clients
      io.emit('location-update', data);
      console.log(`📡 Broadcasting bus location for ${data.busId}:`, {
        busId: data.busId,
        lat: data.lat,
        lng: data.lng,
        speed: data.speed
      });
    } else {
      console.error('❌ Invalid bus location data:', data);
    }
  });

  // Handle host location updates - Fixed the data structure
  socket.on('host-location', (coords) => {
    console.log('💻 Received from HOST:', coords);
    if (coords && isValidCoords(coords.lat, coords.lng)) {
      // Create proper data structure for host
      const hostData = { 
        ...coords, 
        busId: 'host'
      };
      
      locations['host'] = hostData;
      locationHistory['host'] = locationHistory['host'] || [];
      locationHistory['host'].push(hostData);
      
      // Broadcast to all clients
      io.emit('location-update', hostData);
      console.log('📡 Broadcasting host location:', hostData);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// API endpoint to get location history
app.get('/history/:busId', (req, res) => {
  const busId = req.params.busId;
  res.json(locationHistory[busId] || []);
});

app.get('/', (req, res) => res.send('Backend is running...'));

server.listen(5000, () => console.log('🚀 Server running on port 5000'));


// require('dotenv').config(); // Load .env variables

// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');
// const path = require('path');

// const app = express();
// const server = http.createServer(app);

// // Read environment variables
// const PORT = process.env.PORT || 5000;
// const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// // Setup Socket.IO with CORS
// const io = new Server(server, {
//   cors: {
//     origin: CORS_ORIGIN,
//     methods: ['GET', 'POST']
//   }
// });

// // Serve static files from /public
// app.use(express.static(path.join(__dirname, 'public')));

// // Store latest locations and history
// const locations = {};
// const locationHistory = {};

// function isValidCoords(lat, lng) {
//   return typeof lat === 'number' && typeof lng === 'number' &&
//          lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
// }

// // Health check route
// app.get('/', (req, res) => {
//   res.json({
//     activeStatus: true,
//     error: false,
//     message: 'Backend is running...'
//   });
// });

// // Get location history for a bus
// app.get('/history/:busId', (req, res) => {
//   const busId = req.params.busId;
//   res.json(locationHistory[busId] || []);
// });

// // Socket.IO events
// io.on('connection', (socket) => {
//   console.log('Client connected:', socket.id);

//   // Send initial data
//   socket.emit('init', { busId: 'bus-' + socket.id.slice(-4), locations });

//   // Handle bus location updates
//   socket.on('bus-location', (data) => {
//     if (data && data.busId && isValidCoords(data.lat, data.lng)) {
//       locations[data.busId] = data;
//       locationHistory[data.busId] = locationHistory[data.busId] || [];
//       locationHistory[data.busId].push(data);

//       io.emit('location-update', data);
//     } else {
//       console.error('Invalid bus location data:', data);
//     }
//   });

//   // Handle host location updates
//   socket.on('host-location', (coords) => {
//     if (coords && isValidCoords(coords.lat, coords.lng)) {
//       const hostData = { ...coords, busId: 'host' };
//       locations['host'] = hostData;
//       locationHistory['host'] = locationHistory['host'] || [];
//       locationHistory['host'].push(hostData);

//       io.emit('location-update', hostData);
//     }
//   });

//   socket.on('disconnect', () => {
//     console.log('Client disconnected:', socket.id);
//   });
// });

// // Start server
// server.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });


