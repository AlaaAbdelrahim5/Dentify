import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
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

// Component to handle map centering
const MapCenter = ({ center, zoom }) => {
  const map = useMap()
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom)
    }
  }, [center, zoom, map])
  
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
        <MapCenter center={position} zoom={zoom} />
      </MapContainer>
    </div>
  )
}

export default LocationMap
