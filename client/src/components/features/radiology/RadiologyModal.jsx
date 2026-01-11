import { useState, useEffect } from "react";
import {
  FaTimes,
  FaXRay,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaSave,
  FaLock,
  FaLocationArrow,
} from "react-icons/fa";
import { Button, Input, LoadingSpinner, BaseModal, PhoneInput, LocationPicker } from "../../common";
import { useTheme } from "../../../contexts/ThemeContext";
import { CITY_OPTIONS } from "../../../utils/constants";
import { validateEmail, validatePhone, validateRequired } from "../../../utils/validation";

const RadiologyModal = ({ isOpen, onClose, center = null, onSave }) => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    // User fields
    email: "",
    password: "",
    countryCode: "+970",
    phoneNumber: "",
    // RadiologyCenter fields
    centerName: "",
    registrationNumber: "",
    city: "",
    location: "",
    coordinates: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  // Reset form when modal opens/closes or center changes
  useEffect(() => {
    if (isOpen) {
      if (center) {
        // Parse phone number into country code and number
        const fullPhone = center.user?.phone || center.phone || '';
        let parsedCountryCode = '+970';
        let parsedPhoneNumber = '';
        
        if (fullPhone) {
          const countryCodeMatch = fullPhone.match(/^(\+\d{1,4})/);
          if (countryCodeMatch) {
            parsedCountryCode = countryCodeMatch[1];
            parsedPhoneNumber = fullPhone.slice(countryCodeMatch[1].length).replace(/\D/g, '');
          } else {
            parsedPhoneNumber = fullPhone.replace(/\D/g, '');
          }
        }

        setFormData({
          // User fields - get from backend structure (center.user.*)
          email: center.user?.email || center.email || "",
          countryCode: parsedCountryCode,
          phoneNumber: parsedPhoneNumber,
          password: "", // Password field should be empty when editing
          // RadiologyCenter fields - get from backend structure
          centerName: center.centerName || center.registrationNumber || "",
          registrationNumber: center.registrationNumber || "",
          city: center.city || "",
          location: center.location || "",
          coordinates: center.coordinates || "",
        });
      } else {
        // Adding new center - reset to defaults
        setFormData({
          // User fields
          email: "",
          countryCode: "+970",
          phoneNumber: "",
          password: "",
          // RadiologyCenter fields
          centerName: "",
          registrationNumber: "",
          city: "",
          location: "",
          coordinates: "",
        });
      }
      setErrors({});
    }
  }, [isOpen, center]);

  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleCountryCodeChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      countryCode: e.target.value,
    }));

    if (errors.phone) {
      setErrors((prev) => ({
        ...prev,
        phone: '',
      }));
    }
  };

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setFormData((prev) => ({
      ...prev,
      phoneNumber: value,
    }));

    if (errors.phone) {
      setErrors((prev) => ({
        ...prev,
        phone: '',
      }));
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrors(prev => ({ ...prev, coordinates: "Geolocation is not supported by your browser" }));
      return;
    }

    setGettingLocation(true);
    setErrors(prev => {
      const { coordinates, ...rest } = prev;
      return rest;
    });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude.toFixed(6);
        const longitude = position.coords.longitude.toFixed(6);
        const coordinates = `${latitude},${longitude}`;
        
        handleInputChange("coordinates", coordinates);
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
        }
        setErrors(prev => ({ ...prev, coordinates: errorMessage }));
        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.centerName.trim()) {
      newErrors.centerName = "Center name is required";
    }

    if (!formData.city) {
      newErrors.city = "City is required";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (!formData.phoneNumber) {
      newErrors.phone = "Phone number is required";
    } else if (formData.phoneNumber.length < 7) {
      newErrors.phone = "Phone number must be at least 7 digits";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else {
      const emailError = validateEmail(formData.email);
      if (emailError) {
        newErrors.email = emailError;
      }
    }

    if (!center && !formData.password.trim()) {
      newErrors.password = "Password is required for new centers";
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.registrationNumber.trim()) {
      newErrors.registrationNumber = "Registration number is required";
    }

    // Validate coordinates if provided
    if (formData.coordinates && formData.coordinates.trim()) {
      const coordinatePattern = /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/;
      if (!coordinatePattern.test(formData.coordinates.trim())) {
        newErrors.coordinates = "Coordinates must be in the format: latitude,longitude (e.g., 31.9522,35.2332)";
      } else {
        const [lat, lng] = formData.coordinates.split(',').map(coord => parseFloat(coord.trim()));
        if (lat < -90 || lat > 90) {
          newErrors.coordinates = "Latitude must be between -90 and 90";
        } else if (lng < -180 || lng > 180) {
          newErrors.coordinates = "Longitude must be between -180 and 180";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const token =
        localStorage.getItem("dentify_access_token") ||
        sessionStorage.getItem("dentify_access_token");

      const url = center
        ? `${import.meta.env.VITE_API_URL}/api/radiology-centers/${center.userId}`
        : `${import.meta.env.VITE_API_URL}/api/radiology-centers`;

      const method = center ? "PUT" : "POST";

      // Prepare data in the format expected by the API
      const requestData = {
        // User data
        email: formData.email,
        phone: `${formData.countryCode}${formData.phoneNumber}`,
        ...(formData.password && { password: formData.password }),
        // RadiologyCenter data
        centerName: formData.centerName,
        registrationNumber: formData.registrationNumber,
        city: formData.city,
        location: formData.location,
        ...(formData.coordinates && formData.coordinates.trim() && { coordinates: formData.coordinates.trim() })
      };

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (data.success) {
        onSave(data.data, center ? "updated" : "created");
        onClose();
      } else {
        // Handle specific validation errors
        if (response.status === 400 && data.errors) {
          setErrors(data.errors);
        } else {
          setErrors({
            general:
              data.message || "An error occurred while saving the center",
          });
        }
      }
    } catch (error) {
      console.error("Error saving center:", error);
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        setErrors({
          general:
            "Unable to connect to server. Please check if the server is running.",
        });
      } else {
        setErrors({ general: "Network error. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
      title={
        <div className="flex items-center gap-3">
          <FaXRay className="w-6 h-6 text-teal-600" />
          <span>{center ? "Edit Radiology Center" : "Add New Radiology Center"}</span>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="overflow-y-auto overflow-x-hidden max-h-[calc(90vh-250px)] pr-2 space-y-6">
              {/* General Error */}
              {errors.general && (
                <div
                  className={`border px-4 py-3 rounded-md ${
                    isDarkMode
                      ? "bg-red-900 border-red-700 text-red-300"
                      : "bg-red-50 border-red-200 text-red-700"
                  }`}
                >
                  {errors.general}
                </div>
              )}

              {/* Basic Information */}
              <div>
                <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                  isDarkMode ? "text-white" : "text-gray-800"
                }`}>
                  <FaXRay className="text-teal-600" />
                  Center Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Center Name *"
                    type="text"
                    value={formData.centerName}
                    onChange={(e) => handleInputChange("centerName", e.target.value)}
                    placeholder="Enter center name"
                    error={errors.centerName}
                    icon={FaXRay}
                  />

                  <Input
                    label="Registration Number *"
                    type="text"
                    value={formData.registrationNumber}
                    onChange={(e) =>
                      handleInputChange("registrationNumber", e.target.value)
                    }
                    placeholder="Enter registration number"
                    error={errors.registrationNumber}
                  />
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                  isDarkMode ? "text-white" : "text-gray-800"
                }`}>
                  <FaMapMarkerAlt className="text-teal-600" />
                  Address Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      City *
                    </label>
                    <select
                      value={formData.city}
                      onChange={(e) =>
                        handleInputChange("city", e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                        errors.city
                          ? "border-red-500"
                          : isDarkMode
                          ? "border-gray-600 bg-gray-700 text-white"
                          : "border-gray-300 bg-white text-gray-900"
                      }`}
                    >
                      <option value="">Select a city</option>
                      {CITY_OPTIONS.map((city) => (
                        <option key={city.value} value={city.value}>
                          {city.label}
                        </option>
                      ))}
                    </select>
                    {errors.city && (
                      <p
                        className={`mt-1 text-sm ${
                          isDarkMode ? "text-red-400" : "text-red-600"
                        }`}
                      >
                        {errors.city}
                      </p>
                    )}
                  </div>

                  <Input
                    label="Location *"
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                    placeholder="Enter location details"
                    error={errors.location}
                    icon={FaMapMarkerAlt}
                  />
                </div>

                {/* Location Map Picker */}
                <div className="mt-6">
                  <LocationPicker
                    label="Pin Location on Map (Optional)"
                    value={formData.coordinates}
                    onChange={(value) => handleInputChange("coordinates", value)}
                    error={errors.coordinates}
                    height={350}
                    showMyLocationButton={true}
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                  isDarkMode ? "text-white" : "text-gray-800"
                }`}>
                  <FaPhone className="text-teal-600" />
                  Contact Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Email *"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      handleInputChange("email", e.target.value)
                    }
                    placeholder="center@example.com"
                    error={errors.email}
                    icon={FaEnvelope}
                  />

                  <PhoneInput
                    label="Phone Number *"
                    countryCode={formData.countryCode}
                    phoneNumber={formData.phoneNumber}
                    onCountryChange={handleCountryCodeChange}
                    onPhoneChange={handlePhoneNumberChange}
                    placeholder="Enter phone number"
                    error={errors.phone}
                    icon={FaPhone}
                  />
                </div>
              </div>

              {/* Account Security */}
              {!center && (
                <div>
                  <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                      isDarkMode ? "text-white" : "text-gray-800"
                    }`}>
                    <FaLock className="text-teal-600" />
                    Account Security
                  </h3>
                  
                  <Input
                    label="Password *"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    placeholder="Enter password"
                    error={errors.password}
                    icon={FaLock}
                  />
                </div>
              )}
        </div>

              {/* Action Buttons */}
              <div
                className={`flex justify-end gap-3 pt-6 border-t ${
                  isDarkMode ? "border-gray-700" : "border-gray-200"
                }`}
              >
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600"
                >
                  {loading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <FaSave className="w-4 h-4" />
                  )}
                  {center ? "Update Center" : "Create Center"}
                </Button>
              </div>
            </form>
    </BaseModal>
  );
};

export default RadiologyModal;
