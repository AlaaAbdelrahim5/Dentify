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
  FaTimesCircle
} from 'react-icons/fa'
import { Card, Button, LoadingSpinner, BaseModal, LocationMap } from '../../common'
import { useTheme } from '../../../contexts/ThemeContext'
import { dentistsAPI } from '../../../services/api'

const ClinicDetailsModal = ({ 
  isOpen, 
  onClose, 
  clinic,
  onBookAppointment
}) => {
  const { isDarkMode } = useTheme()
  const [dentists, setDentists] = useState([])
  const [isLoadingDentists, setIsLoadingDentists] = useState(false)
  const [selectedDentist, setSelectedDentist] = useState(null)
  
  // Determine if clinic is active
  const isActive = clinic?.user?.status === 'ACTIVE'

  useEffect(() => {
    if (isOpen && clinic) {
      fetchDentists()
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

  if (!clinic) return null

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
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      size="5xl"
      showCloseButton={false}
      noPadding={true}
    >
      {/* Header with gradient */}
      <div className="relative bg-linear-to-r from-teal-600 to-cyan-600 px-6 py-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg transition-colors hover:bg-white/10 text-white"
        >
          <FaTimes className="w-4 h-4" />
        </button>

        {/* Profile section */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg">
              <FaBuilding className="text-teal-600 text-2xl" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
              {isActive ? (
                <FaCheckCircle className="w-3 h-3 text-green-600" />
              ) : (
                <FaTimesCircle className="w-3 h-3 text-red-600" />
              )}
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">
              {clinic.name || clinic.clinicName}
            </h2>
            <p className="text-white/90 text-sm">
              Dental Clinic
            </p>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
              isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {isActive ? (
                <><FaCheckCircle className="w-2.5 h-2.5" /> Active</>
              ) : (
                <><FaTimesCircle className="w-2.5 h-2.5" /> Inactive</>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 space-y-8 max-h-[calc(100vh-200px)] overflow-y-auto">
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

            {/* Services Available */}
            {clinic.servicesAvailable && clinic.servicesAvailable.length > 0 && (
              <div className={`p-4 rounded-lg border ${
                isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}>
                <p className={`text-sm font-medium mb-3 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Available Services
                </p>
                <div className="flex flex-wrap gap-2">
                  {clinic.servicesAvailable.map((service, index) => (
                    <span
                      key={index}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                        isDarkMode
                          ? 'bg-teal-900/30 text-teal-400 border border-teal-700'
                          : 'bg-teal-50 text-teal-700 border border-teal-200'
                      }`}
                    >
                      {service}
                    </span>
                  ))}
                </div>
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
                            {schedule.startTime} - {schedule.endTime}
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
                            {schedule.isOpen ? `${schedule.start} - ${schedule.end}` : 'Closed'}
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
                  key={dentist.userId || dentist.id || dentist._id || index}
                  className={`p-5 rounded-lg border transition-all ${
                    isDarkMode
                      ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-14 h-14 rounded-full bg-linear-to-br from-teal-500 to-cyan-500 flex items-center justify-center shrink-0">
                            <FaUser className="text-white text-lg" />
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
      </div>
    </BaseModal>
  )
}

export default ClinicDetailsModal
