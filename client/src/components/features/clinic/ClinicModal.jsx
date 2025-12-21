import { useState, useEffect } from "react";
import {
  FaTimes,
  FaHospital,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaGlobe,
  FaClock,
  FaSave,
  FaLock,
  FaLocationArrow,
} from "react-icons/fa";
import { Button, Input, LoadingSpinner, BaseModal } from "../../common";
import { useTheme } from "../../../contexts/ThemeContext";
import { CITY_OPTIONS, DENTAL_SPECIALIZATIONS, DEFAULT_WORKING_HOURS } from "../../../utils/constants";
import { validateEmail, validatePhone, validatePassword } from "../../../utils/validation";

const ClinicModal = ({ isOpen, onClose, clinic = null, onSave }) => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    // User fields
    email: "",
    password: "",
    phone: "",
    // Clinic fields
    clinicName: "",
    registrationNumber: "",
    city: "",
    location: "",
    coordinates: "",
    website: "",
    description: "",
    servicesAvailable: [],
    workingHours: DEFAULT_WORKING_HOURS,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  const dayNames = {
    sunday: "Sunday",
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
  };

  // Reset form when modal opens/closes or clinic changes
  useEffect(() => {
    if (isOpen) {
      if (clinic) {
        // Editing existing clinic - convert working hours array to object format
        const workingHoursObj = {};
        const dayMap = {
          'Sunday': 'sunday',
          'Monday': 'monday',
          'Tuesday': 'tuesday',
          'Wednesday': 'wednesday',
          'Thursday': 'thursday',
          'Friday': 'friday',
          'Saturday': 'saturday'
        };
        
        // Initialize all days as closed
        Object.values(dayMap).forEach(day => {
          workingHoursObj[day] = { isOpen: false, start: "09:00", end: "17:00" };
        });
        
        // Handle workingHours - it could be array, object, or null
        const workingHours = clinic.workingHours;
        
        if (workingHours && Array.isArray(workingHours)) {
          // Fill in actual working hours from array format
          workingHours.forEach(({ day, startTime, endTime }) => {
            const dayKey = dayMap[day];
            if (dayKey) {
              workingHoursObj[dayKey] = {
                isOpen: true,
                start: startTime,
                end: endTime
              };
            }
          });
        } else if (workingHours && typeof workingHours === 'object' && !Array.isArray(workingHours)) {
          // If it's already in object format, use it directly
          Object.keys(workingHours).forEach(day => {
            if (workingHours[day]) {
              workingHoursObj[day] = workingHours[day];
            }
          });
        }

        setFormData({
          // User fields - get from transformed data structure
          email: clinic.email || clinic.user?.email || "",
          phone: clinic.phone?.full || clinic.user?.phone || clinic.phone || "",
          password: "", // Password field should be empty when editing
          // Clinic fields - get from transformed data structure
          clinicName: clinic.name || clinic.clinicName || "",
          registrationNumber: clinic.registrationNumber || "",
          city: clinic.address?.city || clinic.city || "",
          location: clinic.address?.fullAddress || clinic.location || "",
          coordinates: clinic.coordinates || "",
          website: clinic.website || "",
          description: clinic.description || "",
          servicesAvailable: clinic.servicesAvailable || [],
          workingHours: workingHoursObj,
        });
      } else {
        // Adding new clinic - reset to defaults
        setFormData({
          // User fields
          email: "",
          phone: "",
          password: "",
          // Clinic fields
          clinicName: "",
          registrationNumber: "",
          city: "",
          location: "",
          coordinates: "",
          website: "",
          description: "",
          servicesAvailable: [],
          workingHours: {
            sunday: { isOpen: true, start: "09:00", end: "17:00" },
            monday: { isOpen: true, start: "09:00", end: "17:00" },
            tuesday: { isOpen: true, start: "09:00", end: "17:00" },
            wednesday: { isOpen: true, start: "09:00", end: "17:00" },
            thursday: { isOpen: true, start: "09:00", end: "17:00" },
            friday: { isOpen: false, start: "09:00", end: "17:00" },
            saturday: { isOpen: true, start: "09:00", end: "17:00" },
          },
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

  const handleWorkingHoursChange = (day, field, value) => {
    setFormData((prev) => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: {
          ...prev.workingHours[day],
          [field]: value,
        },
      },
    }));
  };

  const handleServiceToggle = (serviceValue) => {
    setFormData((prev) => ({
      ...prev,
      servicesAvailable: prev.servicesAvailable.includes(serviceValue)
        ? prev.servicesAvailable.filter((s) => s !== serviceValue)
        : [...prev.servicesAvailable, serviceValue],
    }));
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

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
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

    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website =
        "Please enter a valid website URL (include http:// or https://)";
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
        ? `http://localhost:5000/api/clinics/${clinic.userId}`
        : "http://localhost:5000/api/clinics";

      const method = clinic ? "PUT" : "POST";

      // Convert working hours object back to array format for the API
      const workingHoursArray = [];
      const dayMap = {
        'sunday': 'Sunday',
        'monday': 'Monday',
        'tuesday': 'Tuesday',
        'wednesday': 'Wednesday',
        'thursday': 'Thursday',
        'friday': 'Friday',
        'saturday': 'Saturday'
      };

      Object.keys(formData.workingHours).forEach(day => {
        const hours = formData.workingHours[day];
        if (hours.isOpen) {
          workingHoursArray.push({
            day: dayMap[day],
            startTime: hours.start,
            endTime: hours.end
          });
        }
      });

      // Prepare data in the format expected by the API
      const requestData = {
        // User data
        email: formData.email,
        phone: formData.phone,
        ...(formData.password && { password: formData.password }),
        // Clinic data
        clinicName: formData.clinicName,
        registrationNumber: formData.registrationNumber,
        city: formData.city,
        location: formData.location,
        ...(formData.coordinates && formData.coordinates.trim() && { coordinates: formData.coordinates.trim() }),
        website: formData.website,
        description: formData.description,
        servicesAvailable: formData.servicesAvailable,
        workingHours: workingHoursArray
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Clinic Name *
                  </label>
                  <Input
                    type="text"
                    value={formData.clinicName}
                    onChange={(e) => handleInputChange("clinicName", e.target.value)}
                    placeholder="Enter clinic name"
                    error={errors.clinicName}
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Registration Number
                  </label>
                  <Input
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
              <div className="space-y-4">
                <h3
                  className={`text-lg font-medium flex items-center gap-2 ${
                    isDarkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  <FaMapMarkerAlt className="w-5 h-5 text-teal-600" />
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
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                        errors.city
                          ? "border-red-500"
                          : isDarkMode
                          ? "border-gray-600 bg-gray-700 text-white"
                          : "border-gray-300 bg-white text-gray-900"
                      }`}
                    >
                      <option value="">Select City</option>
                      {CITY_OPTIONS.map((city) => (
                        <option key={city.value} value={city.value}>
                          {city.label}
                        </option>
                      ))}
                    </select>
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.city}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Location *
                    </label>
                    <Input
                      type="text"
                      value={formData.location}
                      onChange={(e) =>
                        handleInputChange("location", e.target.value)
                      }
                      placeholder="Enter location details"
                      error={errors.location}
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Coordinates (Optional)
                    </label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Input
                          type="text"
                          value={formData.coordinates}
                          onChange={(e) =>
                            handleInputChange("coordinates", e.target.value)
                          }
                          placeholder="e.g., 31.9522,35.2332"
                          error={errors.coordinates}
                          disabled={gettingLocation}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={getCurrentLocation}
                        disabled={gettingLocation || loading}
                        className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                          gettingLocation || loading
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:scale-105'
                        } ${
                          isDarkMode
                            ? 'bg-teal-600 hover:bg-teal-700 text-white'
                            : 'bg-teal-600 hover:bg-teal-700 text-white'
                        }`}
                        title="Get current location from your device"
                      >
                        {gettingLocation ? (
                          <>
                            <LoadingSpinner className="w-4 h-4" />
                            <span className="hidden sm:inline">Getting...</span>
                          </>
                        ) : (
                          <>
                            <FaLocationArrow className="w-4 h-4" />
                            <span className="hidden sm:inline">Get Location</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className={`mt-1 text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                      Enter latitude,longitude format or use "Get Location" button
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3
                  className={`text-lg font-medium flex items-center gap-2 ${
                    isDarkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  <FaPhone className="w-5 h-5 text-teal-600" />
                  Contact Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Phone Number *
                    </label>
                    <Input
                      type="text"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      placeholder="+970123456789"
                      error={errors.phone}
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Email
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      placeholder="clinic@example.com"
                      error={errors.email}
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Password {!clinic && "*"}
                    </label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      placeholder={
                        clinic
                          ? "Password cannot be edited"
                          : "Enter password"
                      }
                      error={errors.password}
                      disabled={clinic ? true : false}
                    />
                    {clinic && (
                      <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Password cannot be changed from this form
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-4">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Website
                    </label>
                    <Input
                      type="url"
                      value={formData.website}
                      onChange={(e) =>
                        handleInputChange("website", e.target.value)
                      }
                      placeholder="https://www.clinic.com"
                      error={errors.website}
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Brief description of the clinic"
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                    isDarkMode
                      ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                      : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                  }`}
                  maxLength={500}
                />
                <p
                  className={`mt-1 text-xs ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {formData.description.length}/500 characters
                </p>
              </div>

              {/* Services */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Services Offered
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {DENTAL_SPECIALIZATIONS.map((service) => (
                    <label
                      key={service}
                      className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${
                        isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.servicesAvailable.includes(service)}
                        onChange={() => handleServiceToggle(service)}
                        className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                      />
                      <span
                        className={`text-sm ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {service}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Working Hours */}
              <div>
                <h3
                  className={`text-lg font-medium flex items-center gap-2 mb-4 ${
                    isDarkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  <FaClock className="w-5 h-5 text-teal-600" />
                  Working Hours
                </h3>

                <div className="space-y-3">
                  {Object.keys(dayNames).map((day) => (
                    <div
                      key={day}
                      className={`flex items-center gap-4 p-3 rounded-lg ${
                        isDarkMode ? "bg-gray-700" : "bg-gray-50"
                      }`}
                    >
                      <div className="w-24">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={formData.workingHours[day].isOpen}
                            onChange={(e) =>
                              handleWorkingHoursChange(
                                day,
                                "isOpen",
                                e.target.checked
                              )
                            }
                            className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                          />
                          <span
                            className={`text-sm font-medium ${
                              isDarkMode ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            {dayNames[day]}
                          </span>
                        </label>
                      </div>

                      {formData.workingHours[day].isOpen && (
                        <div className="flex items-center gap-2">
                          <input
                            type="time"
                            value={formData.workingHours[day].start}
                            onChange={(e) =>
                              handleWorkingHoursChange(
                                day,
                                "start",
                                e.target.value
                              )
                            }
                            className={`px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                              isDarkMode
                                ? "border-gray-600 bg-gray-800 text-white"
                                : "border-gray-300 bg-white text-gray-900"
                            }`}
                          />
                          <span
                            className={`${
                              isDarkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            to
                          </span>
                          <input
                            type="time"
                            value={formData.workingHours[day].end}
                            onChange={(e) =>
                              handleWorkingHoursChange(
                                day,
                                "end",
                                e.target.value
                              )
                            }
                            className={`px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                              isDarkMode
                                ? "border-gray-600 bg-gray-800 text-white"
                                : "border-gray-300 bg-white text-gray-900"
                            }`}
                          />
                        </div>
                      )}

                      {!formData.workingHours[day].isOpen && (
                        <span
                          className={`text-sm italic ${
                            isDarkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Closed
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

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
