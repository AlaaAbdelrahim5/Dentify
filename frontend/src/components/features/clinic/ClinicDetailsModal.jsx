import { useState, useEffect } from 'react'
import {
  FaBuilding,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaUserMd,
  FaUser,
  FaClock,
  FaCalendarPlus,
  FaEye,
  FaStethoscope,
  FaGlobe,
  FaTimes,
  FaCheckCircle,
  FaTimesCircle,
  FaDollarSign,
  FaCheck
} from 'react-icons/fa'
import { Card, Button, LoadingSpinner, BaseModal, LocationMap } from '../../common'
import DentistDetailsModal from '../dentist/DentistDetailsModal'
import SecretaryDetailsModal from '../secretary/SecretaryDetailsModal'
import { useTheme } from '../../../contexts/ThemeContext'
import { dentistsAPI, clinicsAPI, secretariesAPI } from '../../../services/api'
import { getImageUrl } from '../../../utils/helpers'

const ClinicDetailsModal = ({ 
  isOpen, 
  onClose, 
  clinic,
  onBookAppointment
}) => {
  const { isDarkMode } = useTheme()
  const [dentists, setDentists] = useState([])
  const [secretaries, setSecretaries] = useState([])
  const [isLoadingDentists, setIsLoadingDentists] = useState(false)
  const [isLoadingSecretaries, setIsLoadingSecretaries] = useState(false)
  const [selectedDentist, setSelectedDentist] = useState(null)
  const [selectedSecretary, setSelectedSecretary] = useState(null)
  const [showDentistModal, setShowDentistModal] = useState(false)
  const [showSecretaryModal, setShowSecretaryModal] = useState(false)
  const [availableTreatments, setAvailableTreatments] = useState([])
  const [showTreatments, setShowTreatments] = useState(false)
  const [isLoadingTreatments, setIsLoadingTreatments] = useState(false)
  
  // Determine if clinic is active
  const isActive = clinic?.user?.status === 'ACTIVE'

  const convertTo12Hour = (time24) => {
    if (!time24) return ''
    const [hours, minutes] = time24.split(':')
    const hour = parseInt(hours, 10)
    const period = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${hour12}:${minutes} ${period}`
  }

  useEffect(() => {
    if (isOpen && clinic) {
      fetchDentists()
      fetchSecretaries()
    }
  }, [isOpen, clinic?._id, clinic?.userId])

  const fetchDentists = async () => {
    try {
      setIsLoadingDentists(true)
      // Fetch all dentists and filter by clinic
      const response = await dentistsAPI.getAll({ limit: 1000, includeAll: 'true' })
      const allDentists = response.dentists || response.data || response || []
      
      // Filter dentists for this specific clinic
      // The clinicId in dentist references the clinic's userId (which is the primary key)
      // Try multiple possible clinic ID fields
      const clinicPrimaryKey = clinic._id || clinic.userId || clinic.id || clinic.user?.id
      
      if (!clinicPrimaryKey) {
        setDentists([])
        return
      }
      
      const clinicDentists = allDentists.filter(d => {
        const dentistClinicId = d.clinicId
        const match = dentistClinicId === clinicPrimaryKey
        return match
      })
      
      setDentists(clinicDentists)
    } catch (err) {
      console.error('Error fetching dentists:', err)
      setDentists([])
    } finally {
      setIsLoadingDentists(false)
    }
  }

  const fetchSecretaries = async () => {
    try {
      setIsLoadingSecretaries(true)
      const response = await secretariesAPI.getAll()
      const allSecretaries = response.data || response.secretaries || response || []
      
      const clinicPrimaryKey = clinic._id || clinic.userId || clinic.id || clinic.user?.id
      
      if (!clinicPrimaryKey) {
        setSecretaries([])
        return
      }
      
      const clinicSecretaries = allSecretaries.filter(s => {
        const secretaryClinicId = s.clinicId
        return secretaryClinicId === clinicPrimaryKey
      })
      
      setSecretaries(clinicSecretaries)
    } catch (err) {
      console.error('Error fetching secretaries:', err)
      setSecretaries([])
    } finally {
      setIsLoadingSecretaries(false)
    }
  }

  if (!clinic) return null

  const handleViewTreatments = async () => {
    try {
      setIsLoadingTreatments(true)
      const clinicUserId = clinic._id || clinic.userId || clinic.id || clinic.user?.id
      const response = await clinicsAPI.getAvailableTreatments(clinicUserId)
      const treatments = response.data || response
      setAvailableTreatments(Array.isArray(treatments) ? treatments : [])
      setShowTreatments(true)
    } catch (error) {
      console.error('Error fetching treatments:', error)
      setAvailableTreatments([])
      setShowTreatments(true)
    } finally {
      setIsLoadingTreatments(false)
    }
  }

  const handleBookAppointmentWithDentist = (dentist) => {
    if (onBookAppointment) {
      // Ensure the dentist object includes clinic information
      const dentistWithClinic = {
        ...dentist,
        clinic: dentist.clinic || clinic
      }
      onBookAppointment(dentistWithClinic)
    }
  }

  return (
    <>
      <BaseModal
        isOpen={isOpen && !showDentistModal && !showSecretaryModal}
        onClose={onClose}
        title="Clinic Details"
        size="2xl"
      >
        {/* Fixed Profile Section */}
        <div className="flex items-center gap-4 pb-6 border-b border-gray-200 dark:border-gray-700 mb-6">
          <div className="relative">
            <div className={`w-20 h-20 rounded-full ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
            } flex items-center justify-center`}>
              <FaBuilding className="w-10 h-10 text-teal-500" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className={`text-xl font-bold mb-1 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {clinic.name || clinic.clinicName}
            </h3>
            <p className={`text-sm mb-2 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Dental Clinic
            </p>
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${
              isActive
                ? isDarkMode
                  ? 'bg-green-900/20 text-green-400 border-green-800'
                  : 'bg-green-100 text-green-800 border-green-200'
                : isDarkMode
                  ? 'bg-red-900/20 text-red-400 border-red-800'
                  : 'bg-red-100 text-red-800 border-red-200'
            }`}>
              {isActive ? (
                <><FaCheckCircle className="w-3 h-3" /> Active</>
              ) : (
                <><FaTimesCircle className="w-3 h-3" /> Inactive</>
              )}
            </span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="space-y-6 overflow-y-auto overflow-x-hidden max-h-[calc(90vh-280px)] pr-2">
        {/* Clinic Information */}
        <div>
          <h3 className={`text-lg font-semibold mb-6 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Clinic Information
          </h3>
          
          {/* Contact Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Location */}
            <div className={`flex items-start gap-3 p-4 rounded-lg border ${
              isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}>
              <FaMapMarkerAlt className="text-teal-500 mt-1 text-xl" />
              <div className="flex-1">
                <p className={`text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Location
                </p>
                <p className={`font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {clinic.city || clinic.address?.city || 'N/A'}
                </p>
                {(clinic.address?.fullAddress || clinic.location) && (
                  <p className={`text-sm mt-1 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {clinic.address?.fullAddress || clinic.location}
                  </p>
                )}
              </div>
            </div>

            {/* Phone */}
            <div className={`flex items-start gap-3 p-4 rounded-lg border ${
              isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}>
              <FaPhone className="text-teal-500 mt-1 text-xl" />
              <div className="flex-1">
                <p className={`text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Phone Number
                </p>
                <p className={`font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {clinic.user?.phone || clinic.phone?.full || clinic.phone || 'N/A'}
                </p>
              </div>
            </div>

            {/* Email */}
            <div className={`flex items-start gap-3 p-4 rounded-lg border ${
              isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}>
              <FaEnvelope className="text-teal-500 mt-1 text-xl" />
              <div className="flex-1">
                <p className={`text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Email
                </p>
                <p className={`font-semibold wrap-break-word ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {clinic.user?.email || clinic.email || 'N/A'}
                </p>
              </div>
            </div>

            {/* Status */}
            <div className={`flex items-start gap-3 p-4 rounded-lg border ${
              isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}>
              <FaClock className="text-teal-500 mt-1 text-xl" />
              <div className="flex-1">
                <p className={`text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Status
                </p>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    isActive ? 'bg-green-500' : 'bg-red-500'
                  }`}></span>
                  <p className={`font-semibold ${
                    isActive 
                      ? isDarkMode ? 'text-green-400' : 'text-green-600'
                      : isDarkMode ? 'text-red-400' : 'text-red-600'
                  }`}>
                    {isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            {/* View Treatments Button */}
            <div className={`p-4 rounded-lg border ${
              isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaDollarSign className="text-teal-500" />
                  <p className={`text-sm font-medium ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Available Treatments & Pricing
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleViewTreatments}
                  disabled={isLoadingTreatments}
                  leftIcon={isLoadingTreatments ? undefined : FaStethoscope}
                >
                  {isLoadingTreatments ? 'Loading...' : 'View Treatments'}
                </Button>
              </div>
              
              {/* Treatments List */}
              {showTreatments && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  {availableTreatments.length === 0 ? (
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      No treatments configured for this clinic yet.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {availableTreatments.map((treatment, index) => (
                        <div 
                          key={index}
                          className={`flex justify-between items-center p-3 rounded-lg ${
                            isDarkMode ? 'bg-gray-700/50' : 'bg-white'
                          }`}
                        >
                          <span className={`font-medium ${
                            isDarkMode ? 'text-gray-200' : 'text-gray-800'
                          }`}>
                            {treatment.name}
                          </span>
                          <span className={`font-semibold ${
                            isDarkMode ? 'text-teal-400' : 'text-teal-600'
                          }`}>
                            ${treatment.cost}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Website */}
            {clinic.website && (
              <div className={`p-4 rounded-lg border ${
                isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <FaGlobe className="text-teal-500" />
                  <p className={`text-sm font-medium ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Website
                  </p>
                </div>
                <a 
                  href={clinic.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`font-medium hover:underline wrap-break-word ${
                    isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                  }`}
                >
                  {clinic.website}
                </a>
              </div>
            )}

            {/* Description */}
            {clinic.description && (
              <div className={`p-4 rounded-lg border ${
                isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}>
                <p className={`text-sm font-medium mb-3 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Description
                </p>
                <p className={`leading-relaxed ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {clinic.description}
                </p>
              </div>
            )}

            {/* Working Hours */}
            {clinic.workingHours && (
              <div className={`p-4 rounded-lg border ${
                isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center gap-2 mb-3">
                  <FaClock className="text-teal-500" />
                  <p className={`text-sm font-medium ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Working Hours
                  </p>
                </div>
                <div className="space-y-2">
                  {(() => {
                    const hours = clinic.workingHours;
                    if (Array.isArray(hours)) {
                      return hours.map((schedule, index) => (
                        <div key={index} className="flex justify-between items-center py-1">
                          <span className={`font-medium ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            {schedule.day}
                          </span>
                          <span className={`${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {convertTo12Hour(schedule.startTime)} - {convertTo12Hour(schedule.endTime)}
                          </span>
                        </div>
                      ));
                    } else if (typeof hours === 'object') {
                      return Object.entries(hours).map(([day, schedule]) => (
                        <div key={day} className="flex justify-between items-center py-1">
                          <span className={`font-medium capitalize ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            {day}
                          </span>
                          <span className={`${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {schedule.isOpen ? `${convertTo12Hour(schedule.start)} - ${convertTo12Hour(schedule.end)}` : 'Closed'}
                          </span>
                        </div>
                      ));
                    }
                    return <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>No hours set</p>;
                  })()}
                </div>
              </div>
            )}

            {/* Map View */}
            {clinic.coordinates && (
              <div className={`p-4 rounded-lg border ${
                isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center gap-2 mb-3">
                  <FaMapMarkerAlt className="text-teal-500" />
                  <p className={`text-sm font-medium ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Location Map
                  </p>
                </div>
                <LocationMap
                  coordinates={clinic.coordinates}
                  title={clinic.name || clinic.clinicName}
                  address={clinic.address?.fullAddress || clinic.location || clinic.city}
                  height={300}
                  isDarkMode={isDarkMode}
                />
                <p className={`text-xs mt-2 ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  Coordinates: {clinic.coordinates}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Dentists Section */}
        <div>
          <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <FaUserMd className="text-teal-500" />
            Dentists at this Clinic
            {!isLoadingDentists && (
              <span className={`text-sm font-normal ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                ({dentists.length} {dentists.length === 1 ? 'dentist' : 'dentists'})
              </span>
            )}
          </h3>

          {isLoadingDentists ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner />
            </div>
          ) : dentists.length === 0 ? (
            <div className={`text-center py-12 rounded-lg ${
              isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
            }`}>
              <FaUserMd className={`mx-auto text-4xl mb-3 ${
                isDarkMode ? 'text-gray-600' : 'text-gray-400'
              }`} />
              <p className={`${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                No dentists found at this clinic
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {dentists.map((dentist, index) => (
                <div
                  key={dentist._id || dentist.userId || `dentist-${index}`}
                  className={`p-5 rounded-lg border transition-all ${
                    isDarkMode
                      ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="shrink-0 h-14 w-14">
                            {dentist.user?.profileImage ? (
                              <img
                                className="h-14 w-14 rounded-full object-cover"
                                src={getImageUrl(dentist.user.profileImage)}
                                alt={`Dr. ${dentist.firstName} ${dentist.lastName}`}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.parentElement.querySelector('.fallback-avatar').classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <div className={`w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center fallback-avatar ${dentist.user?.profileImage ? 'hidden' : ''}`}>
                              <FaUserMd className="text-white text-lg" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-semibold text-lg mb-2 ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              Dr. {dentist.firstName} {dentist.lastName}
                            </h4>
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2">
                                <FaStethoscope className={`text-sm shrink-0 ${
                                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                }`} />
                                <span className={`text-sm ${
                                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                }`}>
                                  {dentist.specialty || 'General Dentistry'}
                                </span>
                              </div>
                              {dentist.user?.email && (
                                <div className="flex items-center gap-2">
                                  <FaEnvelope className={`text-sm shrink-0 ${
                                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                  }`} />
                                  <span className={`text-sm truncate ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                  }`}>
                                    {dentist.user.email}
                                  </span>
                                </div>
                              )}
                              {dentist.user?.phone && (
                                <div className="flex items-center gap-2">
                                  <FaPhone className={`text-sm shrink-0 ${
                                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                  }`} />
                                  <span className={`text-sm ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                  }`}>
                                    {dentist.user.phone}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedDentist(dentist)
                              setShowDentistModal(true)
                            }}
                            title="View Profile"
                            className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 dark:hover:bg-teal-900/20 whitespace-nowrap"
                          >
                            <FaEye className="w-4 h-4 mr-2" />
                            View Profile
                          </Button>
                          {onBookAppointment && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleBookAppointmentWithDentist(dentist)}
                              title="Book Appointment"
                              className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 dark:hover:bg-teal-900/20 whitespace-nowrap"
                            >
                              <FaCalendarPlus className="w-4 h-4 mr-2" />
                              Book Appointment
                            </Button>
                          )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Secretaries Section */}
        <div>
          <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <FaUser className="text-teal-500" />
            Secretaries at this Clinic
            {!isLoadingSecretaries && (
              <span className={`text-sm font-normal ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                ({secretaries.length} {secretaries.length === 1 ? 'secretary' : 'secretaries'})
              </span>
            )}
          </h3>

          {isLoadingSecretaries ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner />
            </div>
          ) : secretaries.length === 0 ? (
            <div className={`text-center py-12 rounded-lg ${
              isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
            }`}>
              <FaUser className={`mx-auto text-4xl mb-3 ${
                isDarkMode ? 'text-gray-600' : 'text-gray-400'
              }`} />
              <p className={`${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                No secretaries found at this clinic
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {secretaries.map((secretary, index) => (
                <div
                  key={secretary._id || secretary.userId || `secretary-${index}`}
                  className={`p-5 rounded-lg border transition-all ${
                    isDarkMode
                      ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="shrink-0 h-14 w-14">
                        {secretary.user?.profileImage || secretary.userId?.profileImage ? (
                          <img
                            className="h-14 w-14 rounded-full object-cover"
                            src={getImageUrl(secretary.user?.profileImage || secretary.userId?.profileImage)}
                            alt={`${secretary.firstName} ${secretary.lastName}`}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.querySelector('.fallback-avatar').classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center fallback-avatar ${secretary.user?.profileImage || secretary.userId?.profileImage ? 'hidden' : ''}`}>
                          <FaUser className="text-white text-lg" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-semibold text-lg mb-2 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {secretary.firstName} {secretary.lastName}
                        </h4>
                        <div className="space-y-1.5">
                          {secretary.user?.email && (
                            <div className="flex items-center gap-2">
                              <FaEnvelope className={`text-sm shrink-0 ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                              }`} />
                              <span className={`text-sm truncate ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-600'
                              }`}>
                                {secretary.user.email}
                              </span>
                            </div>
                          )}
                          {secretary.user?.phone && (
                            <div className="flex items-center gap-2">
                              <FaPhone className={`text-sm shrink-0 ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                              }`} />
                              <span className={`text-sm ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-600'
                              }`}>
                                {secretary.user.phone}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedSecretary(secretary)
                          setShowSecretaryModal(true)
                        }}
                        title="View Profile"
                        className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 dark:hover:bg-teal-900/20 whitespace-nowrap"
                      >
                        <FaEye className="w-4 h-4 mr-2" />
                        View Profile
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        </div>
      </BaseModal>

      {/* Dentist Details Modal */}
      {showDentistModal && (
        <DentistDetailsModal
          isOpen={showDentistModal}
          dentistData={selectedDentist}
          onClose={() => {
            setShowDentistModal(false)
            setSelectedDentist(null)
          }}
        />
      )}

      {/* Secretary Details Modal */}
      {showSecretaryModal && (
        <SecretaryDetailsModal
          isOpen={showSecretaryModal}
          secretary={selectedSecretary}
          onClose={() => {
            setShowSecretaryModal(false)
            setSelectedSecretary(null)
          }}
        />
      )}
    </>
  )
}

export default ClinicDetailsModal
