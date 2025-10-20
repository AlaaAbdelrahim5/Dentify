import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaCheck,
  FaExclamationTriangle,
} from "react-icons/fa";
import { Logo, Button, Input, Card, LoadingSpinner } from "../components";
import { authAPI } from "../services/api";
import { authUtils } from "../utils/auth";
import { useTheme } from "../contexts/ThemeContext";

const Login = () => {
  const navigate = useNavigate()
  const { isDarkMode } = useTheme();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

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

  // Check for success message from signup
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      if (location.state?.email) {
        setFormData((prev) => ({ ...prev, email: location.state.email }));
      }
    }
  }, [location.state]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";
    if (!formData.password) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setApiError("");

    try {
      console.log('Attempting login with email:', formData.email);
      
      const response = await authAPI.login({
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
      });

      console.log('Login response received:', { 
        hasUser: !!response.user, 
        hasToken: !!response.token,
        userRole: response.user?.role 
      });

      // Backend returns { message, user, token, refreshToken } directly
      if (response && response.token && response.user) {
        // Clear any existing error states first
        setApiError("");
        setErrors({});

        // Store user data and tokens using auth utils
        authUtils.login(
          response.user, 
          {
            token: response.token,
            refreshToken: response.refreshToken
          }, 
          rememberMe
        );

        console.log('Login successful, navigating to dashboard...');

        // Navigate to appropriate dashboard based on user role
        const dashboardRoute = authUtils.getDashboardRoute();
        navigate(dashboardRoute, { replace: true });
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error("Login error:", error);

      // Handle specific error messages from backend
      if (error.message.includes("Invalid credentials")) {
        setApiError(
          "Invalid email or password. Please check your credentials and try again."
        );
      } else if (error.message.includes("not active") || error.message.includes("deactivated")) {
        setApiError(
          "Your account has been deactivated. Please contact support for assistance."
        );
      } else if (error.message.includes("Email and password are required")) {
        setApiError("Please enter both email and password.");
      } else {
        setApiError(
          error.message || "An error occurred during login. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
        : 'bg-gradient-to-br from-teal-50 via-blue-50 to-cyan-50'
    }`}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Logo className="justify-center" size="text-3xl" />
          <p className={`mt-4 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Welcome to Dentify! Please sign in to continue.
          </p>
        </div>

        {/* Login Form */}
        <Card className="shadow-2xl">
          <Card.Header>
            <h2 className={`text-2xl font-bold text-center ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Sign In
            </h2>
            <p className={`text-sm text-center mt-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Access your Dentify account
            </p>
          </Card.Header>
          <Card.Content className="p-8">
            {/* Success Message from Signup */}
            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <FaCheck className="text-green-600" />
                  <div>
                    <h3 className="font-medium text-green-800">Success!</h3>
                    <p className="text-sm text-green-600 mt-1">
                      {successMessage}
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
                    <h3 className="font-medium text-red-800">Login Failed</h3>
                    <p className="text-sm text-red-600 mt-1">{apiError}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
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

              {/* Password Input with Toggle */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Password
                </label>
                <div className={`
                  relative flex items-center rounded-lg border shadow-sm transition-all duration-200
                  ${isDarkMode 
                    ? 'border-gray-600 bg-gray-700'
                    : 'border-gray-300 bg-white'
                  }
                  ${errors.password 
                    ? 'border-red-300 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500 focus-within:ring-opacity-20' 
                    : 'focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500 focus-within:ring-opacity-20'
                  }
                `}>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className={`h-5 w-5 ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    }`} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`flex-1 block w-full border-0 pl-10 pr-3 py-3 text-sm focus:ring-0 focus:outline-none bg-transparent rounded-l-lg ${
                      isDarkMode 
                        ? 'text-white placeholder-gray-400'
                        : 'text-gray-900 placeholder-gray-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`px-3 py-3 hover:text-teal-600 focus:outline-none transition-colors duration-200 rounded-r-lg ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    }`}
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-5 w-5" />
                    ) : (
                      <FaEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className={`mt-2 text-sm ${
                    isDarkMode ? 'text-red-400' : 'text-red-600'
                  }`}>{errors.password}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className={`rounded text-teal-600 shadow-sm focus:border-teal-300 focus:ring focus:ring-teal-200 focus:ring-opacity-50 ${
                      isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
                    }`}
                  />
                  <span className={`ml-2 text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Remember me
                  </span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-teal-600 hover:text-teal-500 font-medium"
                >
                  Forgot password?
                </Link>
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
                    Signing In...
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </Card.Content>

          {/* Sign Up Link */}
          <Card.Footer className={`text-center ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <p className={`text-sm ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-medium text-teal-600 hover:text-teal-500"
              >
                Sign up here
              </Link>
            </p>
          </Card.Footer>
        </Card>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <div className={`flex items-center justify-center space-x-4 text-xs ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <Link to="/" className="hover:text-teal-600">
              Home
            </Link>
            <span>•</span>
            <span>Secure Login</span>
            <span>•</span>
            <span>24/7 Support</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
