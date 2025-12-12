import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet'
import { useEffect, useState } from 'react'
import { FaMapMarkerAlt, FaMapPin } from 'react-icons/fa'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix default icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Create custom icon for user location using a simpler SVG
const userLocationIcon = new L.DivIcon({
  html: `<div style="background-color: #3B82F6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>`,
  className: 'user-location-marker',
  iconSize: [26, 26],
  iconAnchor: [13, 13],
  popupAnchor: [0, -13]
})

// Component to fit bounds when markers change
const FitBounds = ({ locations, userLocation }) => {
  const map = useMap()
  
  useEffect(() => {
    const allPositions = []
    
    // Add clinic/center locations
    if (locations && locations.length > 0) {
      const validLocations = locations.filter(loc => loc.position)
      allPositions.push(...validLocations.map(loc => loc.position))
    }
    
    // Add user location if available
    if (userLocation) {
      allPositions.push(userLocation)
    }
    
    if (allPositions.length === 0) return
    
    if (allPositions.length === 1) {
      map.setView(allPositions[0], 13)
    } else {
      const bounds = L.latLngBounds(allPositions)
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [locations, userLocation, map])
  
  return null
}

/**
 * MultiLocationMap Component
 * 
 * A map component for displaying multiple locations (clinics/radiology centers)
 * 
 * @param {Object} props
 * @param {Array} props.locations - Array of location objects with {id, name, coordinates, address}
 * @param {Function} props.onMarkerClick - Callback when marker is clicked
 * @param {number} props.height - Height of the map in pixels (default: 400)
 * @param {boolean} props.isDarkMode - Dark mode flag
 */
const MultiLocationMap = ({ 
  locations = [], 
  onMarkerClick,
  height = 400,
  isDarkMode = false 
}) => {
  const [userLocation, setUserLocation] = useState(null)
  const [locationError, setLocationError] = useState(null)

  // Get user's current location
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = [position.coords.latitude, position.coords.longitude]
          console.log('User location obtained:', userPos)
          setUserLocation(userPos)
        },
        (error) => {
          console.error('Geolocation error:', error)
          setLocationError(error.message)
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000
        }
      )
    } else {
      console.log('Geolocation not available')
    }
  }, [])

  // Parse coordinates and prepare locations data
  const parseCoordinates = (coords) => {
    if (!coords) return null
    
    try {
      const [lat, lng] = coords.split(',').map(c => parseFloat(c.trim()))
      if (isNaN(lat) || isNaN(lng)) return null
      return [lat, lng]
    } catch (error) {
      console.error('Error parsing coordinates:', error)
      return null
    }
  }

  const processedLocations = locations.map(loc => ({
    ...loc,
    position: parseCoordinates(loc.coordinates)
  })).filter(loc => loc.position) // Only include locations with valid coordinates

  // Default center - use user location if available, otherwise Palestine coordinates
  const defaultCenter = [31.9522, 35.2332]
  const center = userLocation || (processedLocations.length > 0 ? processedLocations[0].position : defaultCenter)

  // If no valid locations, show message
  if (processedLocations.length === 0) {
    return (
      <div 
        className={`flex items-center justify-center rounded-lg ${
          isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'
        }`}
        style={{ height: `${height}px` }}
      >
        <div className="text-center">
          <FaMapMarkerAlt className={`w-12 h-12 mx-auto mb-2 ${
            isDarkMode ? 'text-gray-500' : 'text-gray-400'
          }`} />
          <p className={`text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            No locations with coordinates available
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg overflow-hidden shadow-md relative z-0">
      <MapContainer
        center={center}
        zoom={10}
        style={{ height: `${height}px`, width: '100%', zIndex: 0 }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User Location Marker */}
        {userLocation && Array.isArray(userLocation) && userLocation.length === 2 && (
          <>
            <Marker 
              position={userLocation} 
              icon={userLocationIcon}
              key="user-location"
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold text-blue-600 mb-1">📍 Your Location</h3>
                  <p className="text-xs text-gray-600">You are here</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {userLocation[0].toFixed(4)}, {userLocation[1].toFixed(4)}
                  </p>
                </div>
              </Popup>
            </Marker>
            <Circle
              center={userLocation}
              radius={100}
              pathOptions={{
                color: '#3B82F6',
                fillColor: '#3B82F6',
                fillOpacity: 0.1,
                weight: 2
              }}
            />
          </>
        )}

        {/* Clinic/Center Markers */}
        {processedLocations.map((location) => (
          <Marker 
            key={location.id} 
            position={location.position}
            eventHandlers={{
              click: () => {
                if (onMarkerClick) {
                  onMarkerClick(location)
                }
              }
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-gray-900 mb-1">{location.name}</h3>
                {location.address && (
                  <p className="text-sm text-gray-600 mb-2">{location.address}</p>
                )}
                {onMarkerClick && (
                  <button
                    onClick={() => onMarkerClick(location)}
                    className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                  >
                    View Details →
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
        
        <FitBounds locations={processedLocations} userLocation={userLocation} />
      </MapContainer>
    </div>
  )
}

export default MultiLocationMap
