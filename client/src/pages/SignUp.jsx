import { useState, useEffect } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaCheck,
  FaExclamationTriangle,
  FaVenusMars,
} from "react-icons/fa";
import {
  Logo,
  Button,
  Input,
  Select,
  PhoneInput,
  Card,
  LoadingSpinner,
} from "../components";
import { authAPI } from "../services/api";
import { authUtils } from "../utils/auth";
import { useTheme } from "../contexts/ThemeContext";

const SignUp = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  // Palestinian cities list (alphabetically sorted)
  const palestinianCities = [
    { value: "Acre", label: "Acre (Akka)" },
    { value: "Al-Bireh", label: "Al-Bireh" },
    { value: "Beersheba", label: "Beersheba (Bir as-Saba)" },
    { value: "Beit Hanoun", label: "Beit Hanoun" },
    { value: "Beit Jala", label: "Beit Jala" },
    { value: "Beit Lahia", label: "Beit Lahia" },
    { value: "Beit Sahour", label: "Beit Sahour" },
    { value: "Bethlehem", label: "Bethlehem (Beit Lahm)" },
    { value: "Deir al-Balah", label: "Deir al-Balah" },
    { value: "Gaza", label: "Gaza" },
    { value: "Haifa", label: "Haifa" },
    { value: "Hebron", label: "Hebron (Al-Khalil)" },
    { value: "Jabalya", label: "Jabalya" },
    { value: "Jaffa", label: "Jaffa (Yafa)" },
    { value: "Jenin", label: "Jenin" },
    { value: "Jericho", label: "Jericho (Ariha)" },
    { value: "Jerusalem", label: "Jerusalem (Al-Quds)" },
    { value: "Khan Yunis", label: "Khan Yunis" },
    { value: "Lydd", label: "Lydd (Al-Ludd)" },
    { value: "Nablus", label: "Nablus" },
    { value: "Nazareth", label: "Nazareth (An-Nasira)" },
    { value: "Qalqilya", label: "Qalqilya" },
    { value: "Rafah", label: "Rafah" },
    { value: "Ramallah", label: "Ramallah" },
    { value: "Ramla", label: "Ramla (Ar-Ramla)" },
    { value: "Safad", label: "Safad" },
    { value: "Salfit", label: "Salfit" },
    { value: "Tiberias", label: "Tiberias (Tabariyyah)" },
    { value: "Tubas", label: "Tubas" },
    { value: "Tulkarm", label: "Tulkarm" },
  ];

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    countryCode: "+970", // Default to Palestine
    phoneNumber: "",
    dateOfBirth: "",
    gender: "",
    city: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [apiError, setApiError] = useState("");

  // Clear logout flag when component mounts
  useEffect(() => {
    authUtils.clearLogoutFlag();
  }, []);

  // Check if user is already authenticated (quick check without async)
  const isAlreadyAuthenticated = () => {
    // Don't redirect if user just logged out
    if (authUtils.wasLoggedOut()) {
      return false;
    }
    const token = authUtils.getAccessToken();
    const user = authUtils.getCurrentUser();
    return !!(token && user);
  };

  // If already authenticated, redirect immediately
  if (isAlreadyAuthenticated()) {
    const dashboardRoute = authUtils.getDashboardRoute();
    return <Navigate to={dashboardRoute} replace />;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";

    if (!formData.phoneNumber) newErrors.phone = "Phone number is required";
    else if (formData.phoneNumber.length < 7)
      newErrors.phone = "Phone number must be at least 7 digits";
    if (!formData.dateOfBirth)
      newErrors.dateOfBirth = "Date of birth is required";
    if (!formData.gender) newErrors.gender = "Please select your gender";
    if (!formData.city) newErrors.city = "Please select your city";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";

    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    if (!acceptedTerms)
      newErrors.terms = "You must accept the terms and conditions";

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setApiError("");

    try {
      // Prepare data for API in the format expected by backend
      const signupData = {
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        role: 'Patient',
        phone: `${formData.countryCode}${formData.phoneNumber}`,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        gender: formData.gender, // Already capitalized: Male/Female
        birthDate: new Date(formData.dateOfBirth).toISOString(),
        city: formData.city,
      };

      console.log('Sending signup data:', { ...signupData, password: '***' });

      const response = await authAPI.register(signupData);

      console.log('Signup response:', response);

      // Backend returns { message, user, token, refreshToken }
      if (response && response.token) {
        setIsSuccess(true);

        // Use authUtils to properly store authentication data
        authUtils.login(
          response.user,
          {
            token: response.token,
            refreshToken: response.refreshToken
          },
          false // Don't remember me by default on signup
        );

        // Show success message for 2 seconds then redirect to dashboard
        setTimeout(() => {
          const dashboardRoute = authUtils.getDashboardRoute();
          navigate(dashboardRoute, {
            replace: true,
          });
        }, 2000);
      }
    } catch (error) {
      console.error("Signup error:", error);

      if (error.message.includes("User already exists") || error.message.includes("email")) {
        setErrors({ email: "An account with this email already exists" });
      } else if (error.message.includes("phone")) {
        setErrors({
          phone: "An account with this phone number already exists",
        });
      } else {
        setApiError(
          error.message || "An error occurred during signup. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = () => {
    const password = formData.password;
    if (!password) return { strength: 0, text: "", color: "" };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const levels = [
      { text: "Very Weak", color: "bg-red-500" },
      { text: "Weak", color: "bg-orange-500" },
      { text: "Fair", color: "bg-yellow-500" },
      { text: "Good", color: "bg-blue-500" },
      { text: "Strong", color: "bg-green-500" },
    ];

    return { strength, ...levels[strength] };
  };

  const passwordInfo = passwordStrength();

  return (
    <div className={`min-h-screen py-8 px-4 transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
        : 'bg-gradient-to-br from-teal-50 via-blue-50 to-cyan-50'
    }`}>
      <div className="max-w-4xl mx-auto">
        {/* Logo */}
        <div className="text-center mb-6">
          <Logo className="justify-center" size="text-3xl" />
          <p className={`mt-3 text-sm ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Create your patient account to get started
          </p>
        </div>

        {/* Signup Form */}
        <Card className="shadow-2xl backdrop-blur-sm bg-opacity-95">
          <Card.Header className={isDarkMode ? 'bg-gradient-to-r from-gray-800 to-gray-700' : 'bg-gradient-to-r from-teal-500 to-blue-500'}>
            <h2 className="text-2xl font-bold text-center text-white">
              Patient Registration
            </h2>
            <p className="text-sm text-center mt-1 text-white text-opacity-90">
              Join our dental care community
            </p>
          </Card.Header>

          <Card.Content className="p-8">
            {/* Success Message */}
            {isSuccess && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <FaCheck className="text-green-600" />
                  <div>
                    <h3 className="font-medium text-green-800">
                      Account Created Successfully!
                    </h3>
                    <p className="text-sm text-green-600 mt-1">
                      Redirecting you to the login page...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* API Error Message */}
            {apiError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <FaExclamationTriangle className="text-red-600" />
                  <div>
                    <h3 className="font-medium text-red-800">Signup Failed</h3>
                    <p className="text-sm text-red-600 mt-1">{apiError}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isSuccess && (
                <>
                  {/* Row 1: First Name and Last Name */}
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="First Name"
                      type="text"
                      name="firstName"
                      placeholder="Enter your first name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      error={errors.firstName}
                      icon={FaUser}
                    />
                    <Input
                      label="Last Name"
                      type="text"
                      name="lastName"
                      placeholder="Enter your last name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      error={errors.lastName}
                      icon={FaUser}
                    />
                  </div>

                  {/* Row 2: Email and Phone */}
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Email Address"
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      error={errors.email}
                      icon={FaEnvelope}
                    />
                    <PhoneInput
                      label="Phone Number"
                      countryCode={formData.countryCode}
                      phoneNumber={formData.phoneNumber}
                      onCountryChange={handleCountryCodeChange}
                      onPhoneChange={handlePhoneNumberChange}
                      placeholder="Enter your phone number"
                      error={errors.phone}
                      icon={FaPhone}
                    />
                  </div>

                  {/* Row 3: Date of Birth and Gender */}
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Date of Birth"
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      error={errors.dateOfBirth}
                      icon={FaCalendarAlt}
                    />
                    <Select
                      label="Gender"
                      name="gender"
                      placeholder="Select your gender"
                      options={[
                        { value: "Male", label: "Male" },
                        { value: "Female", label: "Female" },
                      ]}
                      value={formData.gender}
                      onChange={handleInputChange}
                      error={errors.gender}
                      icon={FaVenusMars}
                    />
                  </div>

                  {/* City Selection - Full Width */}
                  <Select
                    label="City"
                    name="city"
                    placeholder="Select your city"
                    options={palestinianCities}
                    value={formData.city}
                    onChange={handleInputChange}
                    error={errors.city}
                    icon={FaMapMarkerAlt}
                  />

                  {/* Row 4: Password and Confirm Password */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Input
                        label="Password"
                        type="password"
                        name="password"
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={handleInputChange}
                        error={errors.password}
                        icon={FaLock}
                      />
                      {/* Password Strength Indicator */}
                      {formData.password && (
                        <div className="mt-2">
                          <div className="flex items-center gap-2">
                            <div className={`flex-1 rounded-full h-2 ${
                              isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                            }`}>
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${passwordInfo.color}`}
                                style={{
                                  width: `${(passwordInfo.strength / 5) * 100}%`,
                                }}
                              ></div>
                            </div>
                            <span className={`text-xs ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                              {passwordInfo.text}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <Input
                      label="Confirm Password"
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      error={errors.confirmPassword}
                      icon={FaLock}
                    />
                  </div>

                  {/* Password Match Indicator */}
                  {formData.confirmPassword && formData.password && (
                    <div className="mt-2">
                      {formData.password === formData.confirmPassword ? (
                        <div className={`flex items-center gap-2 text-sm ${
                          isDarkMode ? 'text-green-400' : 'text-green-600'
                        }`}>
                          <FaCheck className="text-xs" />
                          <span>Passwords match</span>
                        </div>
                      ) : (
                        <div className={`text-sm ${
                          isDarkMode ? 'text-red-400' : 'text-red-600'
                        }`}>
                          Passwords do not match
                        </div>
                      )}
                    </div>
                  )}

                  {/* Terms and Conditions */}
                  <div className={`p-4 rounded-lg ${
                    isDarkMode ? 'bg-gray-700 bg-opacity-50' : 'bg-gray-50'
                  }`}>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        className={`rounded text-teal-600 shadow-sm focus:border-teal-300 focus:ring focus:ring-teal-200 focus:ring-opacity-50 mt-1 ${
                          isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
                        }`}
                      />
                      <span className={`text-sm leading-relaxed ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        I accept the{" "}
                        <Link
                          to="/terms"
                          className="text-teal-600 hover:text-teal-500 font-medium"
                        >
                          Terms and Conditions
                        </Link>{" "}
                        and{" "}
                        <Link
                          to="/privacy"
                          className="text-teal-600 hover:text-teal-500 font-medium"
                        >
                          Privacy Policy
                        </Link>
                      </span>
                    </label>
                    {errors.terms && (
                      <p className={`mt-2 text-sm ${
                        isDarkMode ? 'text-red-400' : 'text-red-600'
                      }`}>
                        {errors.terms}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <LoadingSpinner size="sm" />
                      </div>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </>
              )}
            </form>
          </Card.Content>

          {/* Login Link */}
          <Card.Footer className={`text-center ${
            isDarkMode ? 'bg-gray-800 bg-opacity-50' : 'bg-gradient-to-r from-gray-50 to-gray-100'
          }`}>
            <p className={`text-sm ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-teal-600 hover:text-teal-500 transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </Card.Footer>
        </Card>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <div className={`inline-flex items-center gap-6 text-xs px-6 py-3 rounded-full ${
            isDarkMode ? 'bg-gray-800 bg-opacity-50 text-gray-400' : 'bg-white bg-opacity-80 text-gray-500'
          } shadow-md`}>
            <Link to="/" className="hover:text-teal-600 transition-colors flex items-center gap-1">
              🏠 Home
            </Link>
            <span>•</span>
            <span className="flex items-center gap-1">🔒 Secure & Private</span>
            <span>•</span>
            <span className="flex items-center gap-1">⚡ Fast & Easy</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
