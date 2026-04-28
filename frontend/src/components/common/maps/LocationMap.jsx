import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet'
import { FaMapMarkerAlt } from 'react-icons/fa'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix default icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Create custom icon for user location
const userLocationIcon = new L.DivIcon({
  html: `<div style="background-color: #3B82F6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>`,
  className: 'user-location-marker',
  iconSize: [26, 26],
  iconAnchor: [13, 13],
  popupAnchor: [0, -13]
})

// Component to handle map centering and bounds
const MapCenter = ({ locationPosition, userLocation }) => {
  const map = useMap()
  
  useEffect(() => {
    const positions = []
    
    if (locationPosition) positions.push(locationPosition)
    if (userLocation) positions.push(userLocation)
    
    if (positions.length === 0) return
    
    if (positions.length === 1) {
      map.setView(positions[0], 13)
    } else {
      const bounds = L.latLngBounds(positions)
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [locationPosition, userLocation, map])
  
  return null
}

/**
 * LocationMap Component
 * 
 * A reusable map component for displaying locations of clinics and radiology centers
 * 
 * @param {Object} props
 * @param {string} props.coordinates - Coordinates in format "lat,lng" or "lat, lng"
 * @param {string} props.title - Title to display in the popup
 * @param {string} props.address - Address to display in the popup
 * @param {number} props.height - Height of the map in pixels (default: 300)
 * @param {number} props.zoom - Initial zoom level (default: 13)
 * @param {boolean} props.isDarkMode - Dark mode flag
 * @param {boolean} props.showPopup - Whether to show popup on marker (default: false)
 */
const LocationMap = ({ 
  coordinates, 
  title, 
  address, 
  height = 300,
  zoom = 13,
  isDarkMode = false,
  showPopup = false
}) => {
  const [userLocation, setUserLocation] = useState(null)
  
  // Get user's current location
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = [position.coords.latitude, position.coords.longitude]
          setUserLocation(userPos)
        },
        (error) => {
          console.error('Geolocation error:', error)
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000
        }
      )
    }
  }, [])
  
  // Parse coordinates
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

  const position = parseCoordinates(coordinates)

  // If no valid coordinates, show message
  if (!position) {
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
            Location not available
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg overflow-hidden shadow-md relative z-0">
      <MapContainer
        center={position}
        zoom={zoom}
        style={{ height: `${height}px`, width: '100%', zIndex: 0 }}
        scrollWheelZoom={false}
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
        
        {/* Location Marker */}
        <Marker position={position}>
          {showPopup && (
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                {address && (
                  <p className="text-sm text-gray-600">{address}</p>
                )}
              </div>
            </Popup>
          )}
        </Marker>
        
        <MapCenter locationPosition={position} userLocation={userLocation} />
      </MapContainer>
    </div>
  )
}

export default LocationMap
