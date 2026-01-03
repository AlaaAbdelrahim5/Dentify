import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTheme } from '../../../contexts/ThemeContext';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Component to handle map clicks
const LocationMarker = ({ position, setPosition, disabled }) => {
  const map = useMapEvents({
    click(e) {
      if (!disabled) {
        setPosition(e.latlng);
        map.flyTo(e.latlng, map.getZoom());
      }
    },
  });

  return position === null ? null : <Marker position={position} />;
};

/**
 * LocationPicker Component
 * Interactive map for selecting geographical coordinates
 * 
 * @param {Object} props
 * @param {string} props.value - Current coordinates in "lat,lng" format
 * @param {Function} props.onChange - Callback when coordinates change
 * @param {string} props.label - Label for the map section
 * @param {string} props.error - Error message to display
 * @param {number} props.height - Height of the map in pixels (default: 400)
 * @param {boolean} props.showMyLocationButton - Show "Use My Location" button (default: true)
 * @param {boolean} props.disabled - Make the map read-only (default: false)
 */
const LocationPicker = ({ 
  value = '', 
  onChange, 
  label = 'Select Location on Map',
  error = '',
  height = 400,
  showMyLocationButton = true,
  disabled = false
}) => {
  const { isDarkMode } = useTheme();
  const [position, setPosition] = useState(null);
  const [center, setCenter] = useState([31.9522, 35.2332]); // Default: Ramallah, Palestine
  const [gettingLocation, setGettingLocation] = useState(false);
  const mapRef = useRef(null);

  // Parse initial coordinates from value prop
  useEffect(() => {
    if (value && value.trim()) {
      try {
        const [lat, lng] = value.split(',').map(coord => parseFloat(coord.trim()));
        if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          const newPos = { lat, lng };
          setPosition(newPos);
          setCenter([lat, lng]);
          
          // Update map view if ref exists
          if (mapRef.current) {
            mapRef.current.setView([lat, lng], 13);
          }
        }
      } catch (error) {
        console.error('Error parsing coordinates:', error);
      }
    }
  }, [value]);

  // Update parent component when position changes
  useEffect(() => {
    if (position) {
      const coordString = `${position.lat.toFixed(6)},${position.lng.toFixed(6)}`;
      onChange(coordString);
    }
  }, [position]);

  // Handle manual coordinate input
  const handleManualInput = (e) => {
    const inputValue = e.target.value;
    onChange(inputValue);
    
    // Try to update map if valid coordinates
    if (inputValue.trim()) {
      try {
        const [lat, lng] = inputValue.split(',').map(coord => parseFloat(coord.trim()));
        if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          const newPos = { lat, lng };
          setPosition(newPos);
          setCenter([lat, lng]);
          if (mapRef.current) {
            mapRef.current.setView([lat, lng], 13);
          }
        }
      } catch (error) {
        // Invalid format, ignore
      }
    }
  };

  // Get user's current location
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude.toFixed(6);
        const longitude = position.coords.longitude.toFixed(6);
        const coordinates = `${latitude},${longitude}`;
        
        onChange(coordinates);
        setGettingLocation(false);
      },
      (error) => {
        let errorMessage = "Unable to retrieve your location";
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location permissions.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
          default:
            errorMessage = "An unknown error occurred while getting location.";
        }
        
        alert(errorMessage);
        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className={`block text-sm font-medium ${
          isDarkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          {label}
        </label>
      )}
      
      {/* Manual coordinate input */}
      <input
        type="text"
        value={value}
        onChange={handleManualInput}
        disabled={disabled}
        placeholder="Click on map or enter: latitude,longitude (e.g., 31.9522,35.2332)"
        autoComplete="off"
        className={`w-full px-3 py-2 rounded-lg border text-sm transition-all duration-200
          focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
          isDarkMode 
            ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
            : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
        } ${error ? 'border-red-300 focus:ring-red-500' : ''} ${
          disabled ? 'opacity-60 cursor-not-allowed' : ''
        }`}
      />

      {error && (
        <p className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
          {error}
        </p>
      )}

      {/* Use My Location Button */}
      {showMyLocationButton && !disabled && (
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={gettingLocation}
          className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
            gettingLocation
              ? 'opacity-50 cursor-not-allowed bg-gray-400'
              : 'bg-teal-600 hover:bg-teal-700 hover:scale-105'
          } text-white`}
          title="Get current location from your device"
        >
          {gettingLocation ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Getting Location...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Use My Location</span>
            </>
          )}
        </button>
      )}

      {/* Map Container */}
      <div 
        className={`rounded-lg overflow-hidden border ${
          isDarkMode ? 'border-gray-600' : 'border-gray-300'
        } ${disabled ? 'opacity-80' : ''}`}
        style={{ height: `${height}px` }}
      >
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={setPosition} disabled={disabled} />
        </MapContainer>
      </div>

      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        {disabled ? (
          position ? (
            <span className="block font-medium text-teal-600">
              Current Location: {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
            </span>
          ) : (
            'No location set'
          )
        ) : (
          <>
            Click anywhere on the map to set the location, or enter coordinates manually above.
            {position && (
              <span className="block mt-1 font-medium text-teal-600">
                Selected: {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
              </span>
            )}
          </>
        )}
      </p>
    </div>
  );
};

export default LocationPicker;
