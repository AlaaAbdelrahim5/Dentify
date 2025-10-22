import { useState, useEffect } from 'react'
import {
  FaTimes,
  FaUserMd,
  FaStar,
  FaMapMarkerAlt,
  FaBuilding,
  FaPhone,
  FaEnvelope,
  FaStethoscope,
  FaClock,
  FaCalendarAlt,
  FaGraduationCap,
  FaCertificate,
  FaAward,
  FaHospital,
  FaLanguage,
  FaInfo
} from 'react-icons/fa'
import { Card, Button, LoadingSpinner, StatusBadge } from './index'
import { useTheme } from '../contexts/ThemeContext'

const DoctorProfileModal = ({ 
  isOpen, 
  onClose, 
  doctor, 
  onBookAppointment,
  isLoading = false 
}) => {
  const { isDarkMode } = useTheme()
  const [imageError, setImageError] = useState(false)
  const [activeTab, setActiveTab] = useState('about') // about, reviews, availability

  if (!isOpen) return null

  if (isLoading || !doctor) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className={`w-full max-w-4xl rounded-2xl shadow-2xl ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        } p-8`}>
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    )
  }

  const fullName = `Dr. ${doctor.firstName} ${doctor.lastName}`
  const specialty = doctor.specialty || 'General Dentistry'
  const clinic = doctor.clinic || {}
  const rating = doctor.rating || 4.5
  const totalReviews = doctor.totalReviews || 0
  const yearsOfExperience = doctor.yearsOfExperience || 0
  const isActive = doctor.isActive !== false

  // Mock data for additional profile details
  const education = doctor.education || [
    { degree: 'Doctor of Dental Surgery (DDS)', institution: 'University of Dental Medicine', year: '2015' }
  ]

  const certifications = doctor.certifications || [
    'Board Certified in General Dentistry',
    'Advanced Cosmetic Dentistry'
  ]

  const languages = doctor.languages || ['English', 'Arabic']

  const workingHours = doctor.workingHours || {
    monday: '9:00 AM - 5:00 PM',
    tuesday: '9:00 AM - 5:00 PM',
    wednesday: '9:00 AM - 5:00 PM',
    thursday: '9:00 AM - 5:00 PM',
    friday: '9:00 AM - 3:00 PM',
    saturday: 'Closed',
    sunday: 'Closed'
  }

  const reviews = doctor.reviews || [
    {
      id: 1,
      patientName: 'John D.',
      rating: 5,
      comment: 'Excellent dentist! Very professional and gentle.',
      date: '2025-01-10'
    },
    {
      id: 2,
      patientName: 'Sarah M.',
      rating: 4,
      comment: 'Great experience. The staff was friendly and helpful.',
      date: '2025-01-05'
    }
  ]

  const getAvatarPlaceholder = () => {
    const initials = `${doctor.firstName?.[0] || ''}${doctor.lastName?.[0] || ''}`.toUpperCase()
    return initials
  }

  const getAvatarColor = () => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-teal-500 to-teal-600',
      'from-purple-500 to-purple-600',
      'from-pink-500 to-pink-600',
      'from-indigo-500 to-indigo-600',
      'from-cyan-500 to-cyan-600'
    ]
    const index = (doctor.firstName?.charCodeAt(0) || 0) % colors.length
    return colors[index]
  }

  const renderAboutTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column */}
      <div className="space-y-6">
        {/* Bio */}
        {doctor.bio && (
          <div className={`p-5 rounded-xl ${
            isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
          }`}>
            <h3 className={`text-lg font-bold mb-3 flex items-center ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              <div className={`p-2 rounded-lg mr-3 ${
                isDarkMode ? 'bg-teal-600/20' : 'bg-teal-100'
              }`}>
                <FaUserMd className={isDarkMode ? 'text-teal-400' : 'text-teal-600'} />
              </div>
              About Me
            </h3>
            <p className={`text-sm leading-relaxed ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {doctor.bio || 'Dedicated dental professional committed to providing exceptional patient care with a focus on comfort and quality treatment outcomes.'}
            </p>
          </div>
        )}

        {/* Education */}
        <div className={`p-5 rounded-xl ${
          isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
        }`}>
          <h3 className={`text-lg font-bold mb-4 flex items-center ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <div className={`p-2 rounded-lg mr-3 ${
              isDarkMode ? 'bg-blue-600/20' : 'bg-blue-100'
            }`}>
              <FaGraduationCap className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} />
            </div>
            Education
          </h3>
          <div className="space-y-3">
            {education.map((edu, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg border-l-4 ${
                  isDarkMode 
                    ? 'bg-gray-800/50 border-blue-500' 
                    : 'bg-white border-blue-400'
                }`}
              >
                <h4 className={`font-semibold text-sm mb-1 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {edu.degree}
                </h4>
                <p className={`text-xs ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  📚 {edu.institution}
                </p>
                <p className={`text-xs ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  🗓️ {edu.year}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Languages */}
        <div className={`p-5 rounded-xl ${
          isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
        }`}>
          <h3 className={`text-lg font-bold mb-3 flex items-center ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <div className={`p-2 rounded-lg mr-3 ${
              isDarkMode ? 'bg-green-600/20' : 'bg-green-100'
            }`}>
              <FaLanguage className={isDarkMode ? 'text-green-400' : 'text-green-600'} />
            </div>
            Languages
          </h3>
          <div className="flex flex-wrap gap-2">
            {languages.map((lang, index) => (
              <span
                key={index}
                className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                  isDarkMode 
                    ? 'bg-green-600/20 text-green-400 border border-green-600/50' 
                    : 'bg-green-100 text-green-700 border border-green-200'
                }`}
              >
                🗣️ {lang}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        {/* Certifications & Awards */}
        <div className={`p-5 rounded-xl ${
          isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
        }`}>
          <h3 className={`text-lg font-bold mb-4 flex items-center ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <div className={`p-2 rounded-lg mr-3 ${
              isDarkMode ? 'bg-yellow-600/20' : 'bg-yellow-100'
            }`}>
              <FaAward className={isDarkMode ? 'text-yellow-400' : 'text-yellow-600'} />
            </div>
            Certifications & Awards
          </h3>
          <div className="space-y-2">
            {certifications.map((cert, index) => (
              <div 
                key={index}
                className={`flex items-start p-3 rounded-lg ${
                  isDarkMode ? 'bg-gray-800/50' : 'bg-white'
                }`}
              >
                <div className={`p-1.5 rounded-full mr-3 mt-0.5 ${
                  isDarkMode ? 'bg-yellow-600/20' : 'bg-yellow-100'
                }`}>
                  <FaCertificate className={`w-3 h-3 ${
                    isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
                  }`} />
                </div>
                <span className={`text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {cert}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Specializations */}
        <div className={`p-5 rounded-xl ${
          isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
        }`}>
          <h3 className={`text-lg font-bold mb-4 flex items-center ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <div className={`p-2 rounded-lg mr-3 ${
              isDarkMode ? 'bg-purple-600/20' : 'bg-purple-100'
            }`}>
              <FaStethoscope className={isDarkMode ? 'text-purple-400' : 'text-purple-600'} />
            </div>
            Specializations
          </h3>
          <div className="flex flex-wrap gap-2">
            <span className={`px-3 py-2 rounded-lg text-sm font-medium ${
              isDarkMode 
                ? 'bg-purple-600/20 text-purple-400' 
                : 'bg-purple-100 text-purple-700'
            }`}>
              {specialty}
            </span>
            <span className={`px-3 py-2 rounded-lg text-sm font-medium ${
              isDarkMode 
                ? 'bg-blue-600/20 text-blue-400' 
                : 'bg-blue-100 text-blue-700'
            }`}>
              General Dentistry
            </span>
            <span className={`px-3 py-2 rounded-lg text-sm font-medium ${
              isDarkMode 
                ? 'bg-pink-600/20 text-pink-400' 
                : 'bg-pink-100 text-pink-700'
            }`}>
              Preventive Care
            </span>
          </div>
        </div>

        {/* Professional Info */}
        <div className={`p-5 rounded-xl ${
          isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
        }`}>
          <h3 className={`text-lg font-bold mb-4 flex items-center ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <div className={`p-2 rounded-lg mr-3 ${
              isDarkMode ? 'bg-indigo-600/20' : 'bg-indigo-100'
            }`}>
              <FaHospital className={isDarkMode ? 'text-indigo-400' : 'text-indigo-600'} />
            </div>
            Professional Details
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                License Number:
              </span>
              <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {doctor.licenseNumber || 'DDS-' + (doctor.id || '12345')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                Years of Experience:
              </span>
              <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {yearsOfExperience} years
              </span>
            </div>
            <div className="flex justify-between">
              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                Patients Treated:
              </span>
              <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {doctor.patientsCount || '500+'} patients
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderReviewsTab = () => (
    <div className="space-y-4">
      {/* Overall Rating */}
      <div className={`p-6 rounded-lg text-center ${
        isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
      }`}>
        <div className="text-4xl font-bold mb-2">
          {rating.toFixed(1)}
        </div>
        <div className="flex items-center justify-center mb-2">
          {[...Array(5)].map((_, i) => (
            <FaStar
              key={i}
              className={`w-5 h-5 ${
                i < Math.floor(rating)
                  ? 'text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <p className={`text-sm ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Based on {totalReviews} reviews
        </p>
      </div>

      {/* Individual Reviews */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className={`p-4 rounded-lg ${
              isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {review.patientName}
              </span>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.rating
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className={`text-sm mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {review.comment}
            </p>
            <p className={`text-xs ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>
              {review.date}
            </p>
          </div>
        ))}
      </div>
    </div>
  )

  const renderAvailabilityTab = () => (
    <div className="space-y-6">
      {/* Working Hours */}
      <div>
        <h3 className={`text-lg font-semibold mb-4 flex items-center ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          <FaClock className="mr-2" />
          Working Hours
        </h3>
        <div className="space-y-2">
          {Object.entries(workingHours).map(([day, hours]) => (
            <div
              key={day}
              className={`flex justify-between items-center p-3 rounded-lg ${
                isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
              }`}
            >
              <span className={`font-medium capitalize ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {day}
              </span>
              <span className={`${
                hours === 'Closed'
                  ? 'text-red-500'
                  : isDarkMode ? 'text-teal-400' : 'text-teal-600'
              }`}>
                {hours}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Book Section */}
      {isActive && (
        <div className={`p-6 rounded-lg text-center ${
          isDarkMode 
            ? 'bg-gradient-to-br from-teal-600/20 to-cyan-600/20 border border-teal-600/30' 
            : 'bg-gradient-to-br from-teal-50 to-cyan-50'
        }`}>
          <FaCalendarAlt className={`mx-auto text-4xl mb-3 ${
            isDarkMode ? 'text-teal-400' : 'text-teal-600'
          }`} />
          <h4 className={`text-lg font-semibold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Ready to Book?
          </h4>
          <p className={`text-sm mb-4 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Schedule your appointment with {doctor.firstName} today
          </p>
          <Button
            onClick={() => {
              onClose()
              onBookAppointment(doctor)
            }}
            className="w-full"
          >
            Book Appointment Now
          </Button>
        </div>
      )}
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto animate-fadeIn">
      <div 
        className={`w-full max-w-5xl my-8 rounded-3xl shadow-2xl transition-all duration-300 transform ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modern Compact Header with Cover */}
        <div className="relative">
          {/* Cover gradient */}
          <div className={`h-32 rounded-t-3xl ${
            isDarkMode 
              ? 'bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-600' 
              : 'bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500'
          }`}>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm text-white transition-all duration-300 hover:scale-110"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          {/* Profile Content */}
          <div className="px-8 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end -mt-16 gap-6">
              {/* Avatar with enhanced design */}
              <div className="relative">
                {doctor.photoUrl && !imageError ? (
                  <div className="relative">
                    <img
                      src={doctor.photoUrl}
                      alt={fullName}
                      onError={() => setImageError(true)}
                      className="w-32 h-32 rounded-2xl object-cover shadow-2xl ring-4 ring-white"
                    />
                    {isActive && (
                      <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-lg animate-pulse" />
                    )}
                  </div>
                ) : (
                  <div className="relative">
                    <div className={`w-32 h-32 rounded-2xl flex items-center justify-center bg-gradient-to-br ${getAvatarColor()} shadow-2xl ring-4 ring-white`}>
                      <span className="text-white text-4xl font-bold">
                        {getAvatarPlaceholder()}
                      </span>
                    </div>
                    {isActive && (
                      <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-lg animate-pulse" />
                    )}
                  </div>
                )}
              </div>

              {/* Doctor Info - Compact Layout */}
              <div className="flex-grow">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <h2 className={`text-3xl font-bold mb-1 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {fullName}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className={`px-3 py-1 rounded-lg font-medium text-sm flex items-center ${
                        isDarkMode 
                          ? 'bg-teal-600/20 text-teal-400 border border-teal-600/50' 
                          : 'bg-teal-100 text-teal-700 border border-teal-200'
                      }`}>
                        <FaStethoscope className="mr-2" />
                        {specialty}
                      </span>
                      {yearsOfExperience > 0 && (
                        <span className={`px-3 py-1 rounded-lg font-medium text-sm flex items-center ${
                          isDarkMode 
                            ? 'bg-purple-600/20 text-purple-400 border border-purple-600/50' 
                            : 'bg-purple-100 text-purple-700 border border-purple-200'
                        }`}>
                          <FaClock className="mr-2" />
                          {yearsOfExperience} years exp.
                        </span>
                      )}
                      {isActive ? (
                        <span className={`px-3 py-1 rounded-lg font-medium text-sm flex items-center ${
                          isDarkMode 
                            ? 'bg-green-600/20 text-green-400 border border-green-600/50' 
                            : 'bg-green-100 text-green-700 border border-green-200'
                        }`}>
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                          Available Now
                        </span>
                      ) : (
                        <span className={`px-3 py-1 rounded-lg font-medium text-sm ${
                          isDarkMode 
                            ? 'bg-gray-700 text-gray-400' 
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          Not Available
                        </span>
                      )}
                    </div>

                    {/* Clinic & Location */}
                    <div className="flex flex-wrap gap-4 text-sm">
                      {clinic.name && (
                        <div className="flex items-center">
                          <FaBuilding className={`mr-2 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`} />
                          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                            {clinic.name}
                          </span>
                        </div>
                      )}
                      {clinic.city && (
                        <div className="flex items-center">
                          <FaMapMarkerAlt className={`mr-2 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`} />
                          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                            {clinic.city}
                          </span>
                        </div>
                      )}
                      {doctor.phone && (
                        <div className="flex items-center">
                          <FaPhone className={`mr-2 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`} />
                          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                            {doctor.phone}
                          </span>
                        </div>
                      )}
                      {doctor.email && (
                        <div className="flex items-center">
                          <FaEnvelope className={`mr-2 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`} />
                          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                            {doctor.email}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Rating Badge */}
                  {totalReviews > 0 && (
                    <div className={`px-4 py-3 rounded-xl text-center ${
                      isDarkMode ? 'bg-yellow-600/20' : 'bg-yellow-50'
                    }`}>
                      <div className="flex items-center justify-center mb-1">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(rating)
                                ? 'text-yellow-400'
                                : isDarkMode ? 'text-gray-600' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <div className={`text-2xl font-bold ${
                        isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
                      }`}>
                        {rating.toFixed(1)}
                      </div>
                      <div className={`text-xs ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {totalReviews} reviews
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs - Modern Design */}
        <div className={`px-8 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex gap-2">
            {[
              { id: 'about', label: 'About', icon: FaInfo },
              { id: 'reviews', label: 'Reviews', icon: FaStar },
              { id: 'availability', label: 'Availability', icon: FaClock }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-5 py-3 font-semibold transition-all duration-300 rounded-t-xl ${
                    activeTab === tab.id
                      ? isDarkMode
                        ? 'bg-gray-700 text-teal-400 border-b-2 border-teal-400'
                        : 'bg-gray-50 text-teal-600 border-b-2 border-teal-600'
                      : isDarkMode
                        ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="mr-2" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content - Compact scrollable area */}
        <div className="px-8 py-6 max-h-[50vh] overflow-y-auto custom-scrollbar">
          {activeTab === 'about' && renderAboutTab()}
          {activeTab === 'reviews' && renderReviewsTab()}
          {activeTab === 'availability' && renderAvailabilityTab()}
        </div>

        {/* Footer - Enhanced Booking Section */}
        <div className={`px-8 py-6 border-t ${
          isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50/50'
        }`}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className={`text-sm font-medium ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Ready to schedule your appointment?
              </p>
              <p className={`text-xs ${
                isDarkMode ? 'text-gray-500' : 'text-gray-500'
              }`}>
                Book now and get confirmation within 24 hours
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Close
              </button>
              {isActive && (
                <button
                  onClick={() => {
                    onClose()
                    onBookAppointment(doctor)
                  }}
                  className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center ${
                    isDarkMode
                      ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white'
                      : 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
                  }`}
                >
                  <FaCalendarAlt className="mr-2" />
                  Book Appointment
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorProfileModal
