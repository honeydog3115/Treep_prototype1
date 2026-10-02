// Haversine formula to calculate distance between two lat/lng coordinates in meters
export function getDistanceInMeters(lat1, lon1, lat2, lon2) {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) {
    return 0;
  }
  const R = 6371000; // Radius of the Earth in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in meters
}

export function formatDistance(meters) {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(2)} km`;
  }
  return `${Math.round(meters)} m`;
}

// CO2 reduction and point calculations
// Standard gasoline passenger car emits ~210g CO2 per km.
// 1g CO2 saved = 1 Eco Point. (So 1km = 210g CO2 = 210 Points)
export function calculateEcoImpact(distanceKm) {
  const co2Gram = Math.round(distanceKm * 210);
  const points = co2Gram; // 1g CO2 = 1 Point
  const treesEquivalent = (co2Gram / 8800).toFixed(2); // 1 mature tree absorbs ~8.8kg CO2/year
  return {
    co2Gram,
    co2Kg: (co2Gram / 1000).toFixed(2),
    points,
    treesEquivalent,
  };
}

// Generate random voucher/barcode code
export function generateVoucherCode() {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 16; i++) {
    if (i > 0 && i % 4 === 0) code += '-';
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
