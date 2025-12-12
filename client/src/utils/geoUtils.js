/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371 // Radius of the Earth in kilometers
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  return distance
}

/**
 * Convert degrees to radians
 */
const toRad = (degrees) => {
  return degrees * (Math.PI / 180)
}

/**
 * Parse coordinates string to lat/lng array
 * @param {string} coords - Coordinates in format "lat,lng" or "lat, lng"
 * @returns {Array|null} [lat, lng] or null if invalid
 */
export const parseCoordinates = (coords) => {
  if (!coords) return null
  
  try {
    const [lat, lng] = coords.split(',').map(c => parseFloat(c.trim()))
    if (isNaN(lat) || isNaN(lng)) return null
    return [lat, lng]
  } catch (error) {
    return null
  }
}

/**
 * Sort locations by distance from user location
 * @param {Array} locations - Array of locations with coordinates property
 * @param {Array} userLocation - User's location [lat, lng]
 * @returns {Array} Sorted array with distance property added
 */
export const sortByDistance = (locations, userLocation) => {
  if (!userLocation || !Array.isArray(userLocation) || userLocation.length !== 2) {
    return locations
  }

  const [userLat, userLng] = userLocation

  return locations
    .map(location => {
      const coords = parseCoordinates(location.coordinates)
      if (!coords) {
        return { ...location, distance: Infinity }
      }
      
      const [locLat, locLng] = coords
      const distance = calculateDistance(userLat, userLng, locLat, locLng)
      
      return { ...location, distance }
    })
    .sort((a, b) => a.distance - b.distance)
}

/**
 * Format distance for display
 * @param {number} distance - Distance in kilometers
 * @returns {string} Formatted distance string
 */
export const formatDistance = (distance) => {
  if (distance === Infinity || isNaN(distance)) {
    return 'Distance unknown'
  }
  
  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`
  }
  
  return `${distance.toFixed(1)} km`
}
