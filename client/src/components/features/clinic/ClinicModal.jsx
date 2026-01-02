import { useState, useEffect } from "react";
import {
  FaTimes,
  FaHospital,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaSave,
  FaLock,
  FaLocationArrow,
} from "react-icons/fa";
import { Button, Input, Select, LoadingSpinner, BaseModal, PhoneInput, LocationPicker } from "../../common";
import { useTheme } from "../../../contexts/ThemeContext";
import { CITY_OPTIONS } from "../../../utils/constants";
import { validateEmail, validatePhone, validatePassword } from "../../../utils/validation";

const ClinicModal = ({ isOpen, onClose, clinic = null, onSave }) => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    // User fields
    email: "",
    password: "",
    countryCode: "+970",
    phoneNumber: "",
    // Clinic fields
    clinicName: "",
    registrationNumber: "",
    city: "",
    location: "",
    coordinates: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  // Reset form when modal opens/closes or clinic changes
  useEffect(() => {
    if (isOpen) {
      if (clinic) {
        // Parse phone number into country code and number
        const fullPhone = clinic.phone?.full || clinic.user?.phone || clinic.phone || "";
        let parsedCountryCode = "+970";
        let parsedPhoneNumber = "";
        
        if (fullPhone) {
          // Try to extract country code (starts with + and has 1-4 digits)
          const countryCodeMatch = fullPhone.match(/^(\+\d{1,4})/);
          if (countryCodeMatch) {
            parsedCountryCode = countryCodeMatch[1];
            parsedPhoneNumber = fullPhone.slice(countryCodeMatch[1].length).replace(/\D/g, "");
          } else {
            // If no country code found, assume it's just the number
            parsedPhoneNumber = fullPhone.replace(/\D/g, "");
          }
        }

        setFormData({
          // User fields - get from transformed data structure
          email: clinic.email || clinic.user?.email || "",
          countryCode: parsedCountryCode,
          phoneNumber: parsedPhoneNumber,
          password: "", // Password field should be empty when editing
          // Clinic fields - get from transformed data structure
          clinicName: clinic.name || clinic.clinicName || "",
          registrationNumber: clinic.registrationNumber || "",
          city: clinic.address?.city || clinic.city || "",
          location: clinic.address?.fullAddress || clinic.location || "",
          coordinates: clinic.coordinates || "",
        });
      } else {
        // Adding new clinic - reset to defaults
        setFormData({
          // User fields
          email: "",
          countryCode: "+970",
          phoneNumber: "",
          password: "",
          // Clinic fields
          clinicName: "",
          registrationNumber: "",
          city: "",
          location: "",
          coordinates: "",
        });
      }
      setErrors({});
    }
  }, [isOpen, clinic]);

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

    // Clear phone error when country code changes
    if (errors.phone) {
      setErrors((prev) => ({
        ...prev,
        phone: "",
      }));
    }
  };

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Remove non-digits
    setFormData((prev) => ({
      ...prev,
      phoneNumber: value,
    }));

    // Clear phone error when user starts typing
    if (errors.phone) {
      setErrors((prev) => ({
        ...prev,
        phone: "",
      }));
    }
  };

  const getCurrentLocation = () => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setErrors(prev => ({
        ...prev,
        coordinates: "Geolocation is not supported by your browser"
      }));
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
          default:
            errorMessage = "An unknown error occurred while getting location.";
        }
        
        setErrors(prev => ({
          ...prev,
          coordinates: errorMessage
        }));
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

    if (!formData.clinicName.trim()) {
      newErrors.clinicName = "Clinic name is required";
    }

    if (!formData.city) {
      newErrors.city = "City is required";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    // Validate coordinates format (latitude,longitude)
    if (formData.coordinates && formData.coordinates.trim()) {
      const coordPattern = /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/;
      if (!coordPattern.test(formData.coordinates.trim())) {
        newErrors.coordinates = "Please enter coordinates in format: latitude,longitude (e.g., 31.9522,35.2332)";
      } else {
        const [lat, lng] = formData.coordinates.split(',').map(c => parseFloat(c.trim()));
        if (lat < -90 || lat > 90) {
          newErrors.coordinates = "Latitude must be between -90 and 90";
        }
        if (lng < -180 || lng > 180) {
          newErrors.coordinates = "Longitude must be between -180 and 180";
        }
      }
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

    if (!clinic && !formData.password.trim()) {
      newErrors.password = "Password is required for new clinics";
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.registrationNumber.trim()) {
      newErrors.registrationNumber = "Registration number is required";
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

      const url = clinic
        ? `${import.meta.env.VITE_API_URL}/api/clinics/${clinic.userId}`
        : `${import.meta.env.VITE_API_URL}/api/clinics`;

      const method = clinic ? "PUT" : "POST";

      // Prepare data in the format expected by the API
      const requestData = {
        // User data
        email: formData.email,
        phone: `${formData.countryCode}${formData.phoneNumber}`,
        ...(formData.password && { password: formData.password }),
        // Clinic data
        clinicName: formData.clinicName,
        registrationNumber: formData.registrationNumber,
        city: formData.city,
        location: formData.location,
        ...(formData.coordinates && formData.coordinates.trim() && { coordinates: formData.coordinates.trim() }),
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
        onSave(data.data, clinic ? "updated" : "created");
        onClose();
      } else {
        // Handle specific validation errors
        if (response.status === 400 && data.errors) {
          setErrors(data.errors);
        } else {
          setErrors({
            general:
              data.error || data.message || "An error occurred while saving the clinic",
          });
        }
      }
    } catch (error) {
      console.error("Error saving clinic:", error);
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
          <FaHospital className="w-6 h-6 text-teal-600" />
          <span>{clinic ? "Edit Clinic" : "Add New Clinic"}</span>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* General Error */}
              {errors.general && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{errors.general}</p>
                </div>
              )}

              {/* Basic Information */}
              <div>
                <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                  isDarkMode ? "text-white" : "text-gray-800"
                }`}>
                  <FaHospital className="text-teal-600" />
                  Clinic Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Clinic Name *"
                    type="text"
                    value={formData.clinicName}
                    onChange={(e) => handleInputChange("clinicName", e.target.value)}
                    placeholder="Enter clinic name"
                    error={errors.clinicName}
                    icon={FaHospital}
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

              {/* Address */}
              <div>
                <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                    isDarkMode ? "text-white" : "text-gray-800"
                  }`}>
                  <FaMapMarkerAlt className="text-teal-600" />
                  Address Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="City *"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    error={errors.city}
                    options={CITY_OPTIONS}
                    placeholder="Select City"
                    icon={FaMapMarkerAlt}
                  />

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
                    placeholder="clinic@example.com"
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
              {!clinic && (
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

              {/* Action Buttons */}
              <div
                className={`flex justify-end gap-3 pt-6 border-t ${
                  isDarkMode ? "border-gray-700" : "border-gray-200"
                }`}
              >
                <Button
                  type="button"
                  onClick={onClose}
                  variant="outline"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 bg-linear-to-r from-teal-600 to-cyan-600"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FaSave className="w-4 h-4" />
                  )}
                  {loading
                    ? "Saving..."
                    : clinic
                    ? "Update Clinic"
                    : "Add Clinic"}
                </Button>
              </div>
            </form>
    </BaseModal>
  );
};

export default ClinicModal;
