import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaCheck,
  FaExclamationTriangle,
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
import { useTheme } from "../contexts/ThemeContext";

const SignUp = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  // Palestinian cities list (alphabetically sorted)
  const palestinianCities = [
    { value: "acre", label: "Acre (Akka)" },
    { value: "al_bireh", label: "Al-Bireh" },
    { value: "beersheba", label: "Beersheba (Bir as-Saba)" },
    { value: "beit_hanoun", label: "Beit Hanoun" },
    { value: "beit_jala", label: "Beit Jala" },
    { value: "beit_lahia", label: "Beit Lahia" },
    { value: "beit_sahour", label: "Beit Sahour" },
    { value: "bethlehem", label: "Bethlehem (Beit Lahm)" },
    { value: "deir_al_balah", label: "Deir al-Balah" },
    { value: "gaza", label: "Gaza" },
    { value: "haifa", label: "Haifa" },
    { value: "hebron", label: "Hebron (Al-Khalil)" },
    { value: "jabalya", label: "Jabalya" },
    { value: "jaffa", label: "Jaffa (Yafa)" },
    { value: "jenin", label: "Jenin" },
    { value: "jericho", label: "Jericho (Ariha)" },
    { value: "jerusalem", label: "Jerusalem (Al-Quds)" },
    { value: "khan_yunis", label: "Khan Yunis" },
    { value: "lydd", label: "Lydd (Al-Ludd)" },
    { value: "nablus", label: "Nablus" },
    { value: "nazareth", label: "Nazareth (An-Nasira)" },
    { value: "qalqilya", label: "Qalqilya" },
    { value: "rafah", label: "Rafah" },
    { value: "ramallah", label: "Ramallah" },
    { value: "ramla", label: "Ramla (Ar-Ramla)" },
    { value: "safad", label: "Safad" },
    { value: "salfit", label: "Salfit" },
    { value: "tiberias", label: "Tiberias (Tabariyyah)" },
    { value: "tubas", label: "Tubas" },
    { value: "tulkarm", label: "Tulkarm" },
  ];

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    countryCode: "+970", // Default to Palestine
    phoneNumber: "",
    dateOfBirth: "",
    city: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [apiError, setApiError] = useState("");

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

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";

    if (!formData.phoneNumber) newErrors.phone = "Phone number is required";
    else if (formData.phoneNumber.length < 7)
      newErrors.phone = "Phone number must be at least 7 digits";
    if (!formData.dateOfBirth)
      newErrors.dateOfBirth = "Date of birth is required";
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
      // Prepare data for API
      const signupData = {
        fullName: formData.fullName.trim(),
        email: formData.email.toLowerCase().trim(),
        countryCode: formData.countryCode,
        phoneNumber: formData.phoneNumber,
        dateOfBirth: formData.dateOfBirth,
        city: formData.city,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      };

      const response = await authAPI.signup(signupData);

      if (response.success) {
        setIsSuccess(true);

        // Show success message for 2 seconds then redirect
        setTimeout(() => {
          navigate("/login", {
            state: {
              message:
                "Account created successfully! Please sign in with your credentials.",
              email: formData.email,
            },
          });
        }, 2000);
      }
    } catch (error) {
      console.error("Signup error:", error);

      if (error.message.includes("email already exists")) {
        setErrors({ email: "An account with this email already exists" });
      } else if (error.message.includes("phone number already exists")) {
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
    <div className={`min-h-screen py-12 px-4 transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
        : 'bg-gradient-to-br from-teal-50 via-blue-50 to-cyan-50'
    }`}>
      <div className="max-w-md mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <Logo className="justify-center" size="text-3xl" />
          <p className={`mt-4 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Create your patient account to get started.
          </p>
        </div>

        {/* Signup Form */}
        <Card className="shadow-2xl">
          <Card.Header>
            <h2 className={`text-2xl font-bold text-center ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Create Account
            </h2>
            <p className={`text-sm text-center mt-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Join thousands of patients managing their dental care
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

            <form onSubmit={handleSubmit} className="space-y-6">
              {!isSuccess && (
                <>
                  {/* Full Name */}
                  <Input
                    label="Full Name"
                    type="text"
                    name="fullName"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    error={errors.fullName}
                    icon={FaUser}
                  />

                  {/* Email */}
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

                  {/* Phone */}
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

                  {/* Date of Birth */}
                  <Input
                    label="Date of Birth"
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    error={errors.dateOfBirth}
                    icon={FaCalendarAlt}
                  />

                  {/* City Selection */}
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

                  {/* Password */}
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

                  {/* Confirm Password */}
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
                  <div>
                    <label className="flex items-start gap-3">
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
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <LoadingSpinner size="sm" />
                        Creating Account...
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
            isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <p className={`text-sm ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-teal-600 hover:text-teal-500"
              >
                Sign in here
              </Link>
            </p>
          </Card.Footer>
        </Card>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <div className={`rounded-lg p-4 mb-4 ${
            isDarkMode 
              ? 'bg-gray-800/50 border border-gray-700'
              : 'bg-white/50 border border-gray-200'
          }`}>
            <h3 className={`text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Why create an account?
            </h3>
            <ul className={`text-xs space-y-1 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              <li className="flex items-center gap-2">
                <FaCheck className="text-teal-500" />
                Book appointments with your preferred dentist
              </li>
              <li className="flex items-center gap-2">
                <FaCheck className="text-teal-500" />
                View your treatment history and X-ray results
              </li>
              <li className="flex items-center gap-2">
                <FaCheck className="text-teal-500" />
                Receive appointment reminders and notifications
              </li>
            </ul>
          </div>

          <div className={`flex items-center justify-center space-x-4 text-xs ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <Link to="/" className="hover:text-teal-600">
              Home
            </Link>
            <span>•</span>
            <span>Patient Registration</span>
            <span>•</span>
            <span>Secure & Private</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
