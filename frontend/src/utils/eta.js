// frontend/src/utils/eta.js
export function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = x => x * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon/2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getETA(distanceKm, speedKmh = 25) {
  return Math.round((distanceKm / speedKmh) * 60); // in minutes
}


// // frontend/src/utils/eta.js
// export function haversine(lat1, lon1, lat2, lon2) {
//   const R = 6371;
//   const toRad = x => x * Math.PI / 180;
//   const dLat = toRad(lat2 - lat1);
//   const dLon = toRad(lon2 - lon1);
//   const a = Math.sin(dLat/2) ** 2 +
//             Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
//             Math.sin(dLon/2) ** 2;
//   return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
// }

// export function getETA(distanceKm, speedKmh = 25) {
//   return Math.round((distanceKm / speedKmh) * 60);
// }




///////////////////////
// export function haversine(lat1, lon1, lat2, lon2) {
//   const R = 6371; // km
//   const toRad = x => x * Math.PI / 180;
//   const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1);
//   const a = Math.sin(dLat/2)**2 +
//             Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
//             Math.sin(dLon/2)**2;
//   return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
// }

// export function getETA(distanceKm, speedKmh = 25) {
//   return Math.round((distanceKm / speedKmh) * 60); // minutes
// }
