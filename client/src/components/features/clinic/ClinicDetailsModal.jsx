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
  FaGlobe
} from 'react-icons/fa'
import { Card, Button, LoadingSpinner, BaseModal } from '../../common'
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
      
      console.log('=== CLINIC DENTISTS DEBUG ===')
      console.log('All dentists:', allDentists)
      console.log('Current clinic object:', clinic)
      console.log('Clinic keys:', Object.keys(clinic || {}))
      
      // Filter dentists for this specific clinic
      // The clinicId in dentist references the clinic's userId (which is the primary key)
      // Try multiple possible clinic ID fields
      const clinicPrimaryKey = clinic._id || clinic.userId || clinic.id || clinic.user?.id
      console.log('Clinic primary key (userId/id):', clinicPrimaryKey)
      
      if (!clinicPrimaryKey) {
        console.error('No valid clinic ID found!')
        setDentists([])
        return
      }
      
      const clinicDentists = allDentists.filter(d => {
        const dentistClinicId = d.clinicId
        const match = dentistClinicId === clinicPrimaryKey
        if (d.clinic) {
          console.log(`Dentist: ${d.firstName} ${d.lastName}`, {
            dentistClinicId,
            clinicPrimaryKey,
            match,
            dentistClinicName: d.clinic.clinicName
          })
        }
        return match
      })
      
      console.log('Filtered dentists count:', clinicDentists.length)
      console.log('Filtered dentists:', clinicDentists)
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
      {/* Header */}
      <div className={`px-8 py-6 border-b ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
              <FaBuilding className="text-white text-2xl" />
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {clinic.name || clinic.clinicName}
              </h2>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Registration: {clinic.registrationNumber || 'N/A'}
              </p>
            </div>
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
                  {clinic.phone?.full || clinic.phone || 'N/A'}
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
                <p className={`font-semibold break-words ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {clinic.email || 'N/A'}
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
                    clinic.isActive ? 'bg-green-500' : 'bg-red-500'
                  }`}></span>
                  <p className={`font-semibold ${
                    clinic.isActive 
                      ? isDarkMode ? 'text-green-400' : 'text-green-600'
                      : isDarkMode ? 'text-red-400' : 'text-red-600'
                  }`}>
                    {clinic.isActive ? 'Active' : 'Inactive'}
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
                  className={`font-medium hover:underline break-words ${
                    isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                  }`}
                >
                  {clinic.website}
                </a>
              </div>
            )}

            {/* Coordinates */}
            {clinic.coordinates && (
              <div className={`p-4 rounded-lg border ${
                isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <FaMapMarkerAlt className="text-teal-500" />
                  <p className={`text-sm font-medium ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    GPS Coordinates
                  </p>
                </div>
                <p className={`font-medium ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {clinic.coordinates}
                </p>
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
              {dentists.map((dentist) => (
                <div
                  key={dentist.id}
                  className={`p-5 rounded-lg border transition-all ${
                    isDarkMode
                      ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
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
                                <FaStethoscope className={`text-sm flex-shrink-0 ${
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
                                  <FaEnvelope className={`text-sm flex-shrink-0 ${
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
                                  <FaPhone className={`text-sm flex-shrink-0 ${
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
                        <div className="flex flex-col gap-2 flex-shrink-0">
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
