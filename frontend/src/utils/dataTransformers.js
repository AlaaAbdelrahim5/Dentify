/**
 * Shared utility functions for data transformation
 * Reduces duplicate transformation logic across components
 */

/**
 * Transform patient data from API to consistent format
 * @param {Object|Array} patients - Patient data from API
 * @returns {Object|Array} Transformed patient data
 */
export const transformPatient = (patient) => {
  if (!patient) return null

  return {
    id: patient.userId || patient.id,
    name: `${patient.firstName || ''} ${patient.lastName || ''}`.trim(),
    firstName: patient.firstName,
    lastName: patient.lastName,
    email: patient.user?.email || patient.email || 'N/A',
    phone: patient.user?.phone || patient.phone || 'N/A',
    dateOfBirth: patient.birthDate || patient.dateOfBirth,
    birthDate: patient.birthDate || patient.dateOfBirth,
    city: patient.city || patient.address,
    gender: patient.gender,
    status: patient.user?.status === 'ACTIVE' || patient.status === 'active' ? 'active' : 'inactive',
    avatar: patient.user?.profileImage || patient.avatar,
    user: patient.user
  }
}

export const transformPatients = (patients) => {
  if (!Array.isArray(patients)) return []
  return patients.map(transformPatient)
}

/**
 * Transform appointment data from API to consistent format
 * @param {Object} appointment - Appointment data from API
 * @returns {Object} Transformed appointment data
 */
export const transformAppointment = (apt) => {
  if (!apt) return null

  const startTime = new Date(apt.startTime)
  const endTime = new Date(apt.endTime)
  const duration = Math.round((endTime - startTime) / 60000) // Convert ms to minutes

  return {
    id: apt.id,
    time: startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    duration: duration,
    appointmentDate: apt.appointmentDate,
    startTime: apt.startTime,
    endTime: apt.endTime,
    patient: apt.patient ? {
      id: apt.patient.userId || apt.patient.id,
      name: `${apt.patient.firstName} ${apt.patient.lastName}`,
      phone: apt.patient.user?.phone || apt.patient.phone || 'N/A',
      email: apt.patient.user?.email || 'N/A'
    } : null,
    dentist: apt.dentist ? {
      id: apt.dentist.userId || apt.dentist.id,
      name: `${apt.dentist.firstName} ${apt.dentist.lastName}`,
      specialization: apt.dentist.specialization
    } : null,
    clinic: apt.clinic ? {
      id: apt.clinic.id,
      name: apt.clinic.name
    } : null,
    status: apt.status,
    sessionNotes: apt.sessionNotes,
    treatmentId: apt.treatmentId,
    treatment: apt.treatment
  }
}

export const transformAppointments = (appointments) => {
  if (!Array.isArray(appointments)) return []
  return appointments.map(transformAppointment)
}

/**
 * Transform treatment data from API to consistent format
 * @param {Object} treatment - Treatment data from API
 * @returns {Object} Transformed treatment data
 */
export const transformTreatment = (treatment) => {
  if (!treatment) return null

  return {
    id: treatment.id,
    treatmentName: treatment.treatmentName,
    description: treatment.description,
    status: treatment.status === 'COMPLETED' ? 'Completed' : 
            treatment.status === 'IN_PROGRESS' ? 'In Progress' : 'Cancelled',
    rawStatus: treatment.status,
    createdAt: treatment.createdAt,
    completedAt: treatment.completedAt,
    totalAmount: treatment.totalAmount || 0,
    paidAmount: treatment.paidAmount || 0,
    remainingBalance: (treatment.totalAmount || 0) - (treatment.paidAmount || 0),
    patient: treatment.patient ? transformPatient(treatment.patient) : null,
    dentist: treatment.dentist ? {
      id: treatment.dentist.userId || treatment.dentist.id,
      name: `${treatment.dentist.firstName} ${treatment.dentist.lastName}`,
      specialization: treatment.dentist.specialization
    } : null,
    clinic: treatment.clinic,
    teeth: treatment.teeth,
    prescription: treatment.prescription,
    notes: treatment.notes
  }
}

export const transformTreatments = (treatments) => {
  if (!Array.isArray(treatments)) return []
  return treatments.map(transformTreatment)
}

/**
 * Transform dentist data from API to consistent format
 * @param {Object} dentist - Dentist data from API
 * @returns {Object} Transformed dentist data
 */
export const transformDentist = (dentist) => {
  if (!dentist) return null

  return {
    id: dentist.userId || dentist.id,
    name: `${dentist.firstName} ${dentist.lastName}`,
    firstName: dentist.firstName,
    lastName: dentist.lastName,
    email: dentist.user?.email || dentist.email || 'N/A',
    phone: dentist.user?.phone || dentist.phone || 'N/A',
    specialization: dentist.specialization,
    experience: dentist.experience,
    city: dentist.city,
    rating: dentist.rating || 0,
    reviewsCount: dentist.reviewsCount || 0,
    status: dentist.user?.status || dentist.status,
    avatar: dentist.user?.profileImage || dentist.avatar,
    clinic: dentist.clinic,
    user: dentist.user
  }
}

export const transformDentists = (dentists) => {
  if (!Array.isArray(dentists)) return []
  return dentists.map(transformDentist)
}

/**
 * Transform clinic data from API to consistent format
 * @param {Object} clinic - Clinic data from API
 * @returns {Object} Transformed clinic data
 */
export const transformClinic = (clinic) => {
  if (!clinic) return null

  return {
    id: clinic.id,
    name: clinic.name,
    phone: clinic.phone,
    email: clinic.email,
    city: clinic.city,
    address: clinic.address,
    workingHours: clinic.workingHours,
    services: clinic.services,
    rating: clinic.rating || 0,
    status: clinic.status,
    user: clinic.user
  }
}

export const transformClinics = (clinics) => {
  if (!Array.isArray(clinics)) return []
  return clinics.map(transformClinic)
}

/**
 * Extract unique patients from treatments
 * @param {Array} treatments - Array of treatments with patient data
 * @returns {Array} Array of unique patients
 */
export const extractPatientsFromTreatments = (treatments) => {
  if (!Array.isArray(treatments)) return []

  const patientMap = new Map()
  
  treatments.forEach(treatment => {
    if (treatment.patient) {
      const patientId = treatment.patient.userId || treatment.patient.id
      if (!patientMap.has(patientId)) {
        patientMap.set(patientId, transformPatient(treatment.patient))
      }
    }
  })

  return Array.from(patientMap.values())
}

/**
 * Calculate statistics from treatment data
 * @param {Array} treatments - Array of treatments
 * @returns {Object} Calculated statistics
 */
export const calculateTreatmentStats = (treatments) => {
  if (!Array.isArray(treatments)) {
    return {
      total: 0,
      inProgress: 0,
      completed: 0,
      cancelled: 0,
      totalRevenue: 0,
      pendingPayments: 0
    }
  }

  return {
    total: treatments.length,
    inProgress: treatments.filter(t => t.status === 'IN_PROGRESS').length,
    completed: treatments.filter(t => t.status === 'COMPLETED').length,
    cancelled: treatments.filter(t => t.status === 'CANCELLED').length,
    totalRevenue: treatments.reduce((sum, t) => sum + (t.paidAmount || 0), 0),
    pendingPayments: treatments.reduce((sum, t) => {
      const remaining = (t.totalAmount || 0) - (t.paidAmount || 0)
      return sum + (remaining > 0 ? remaining : 0)
    }, 0)
  }
}

/**
 * Group appointments by date
 * @param {Array} appointments - Array of appointments
 * @returns {Object} Appointments grouped by date
 */
export const groupAppointmentsByDate = (appointments) => {
  if (!Array.isArray(appointments)) return {}

  const grouped = {}
  
  appointments.forEach(apt => {
    const date = apt.appointmentDate
    if (!grouped[date]) {
      grouped[date] = []
    }
    grouped[date].push(apt)
  })

  // Sort appointments within each date by time
  Object.keys(grouped).forEach(date => {
    grouped[date].sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
  })

  return grouped
}

/**
 * Filter appointments by status and date range
 * @param {Array} appointments - Array of appointments
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered appointments
 */
export const filterAppointments = (appointments, filters = {}) => {
  if (!Array.isArray(appointments)) return []

  const { status, startDate, endDate, patientId, dentistId } = filters

  return appointments.filter(apt => {
    if (status && apt.status !== status) return false
    
    if (startDate && new Date(apt.appointmentDate) < new Date(startDate)) return false
    
    if (endDate && new Date(apt.appointmentDate) > new Date(endDate)) return false
    
    if (patientId && apt.patient?.id !== patientId) return false
    
    if (dentistId && apt.dentist?.id !== dentistId) return false

    return true
  })
}
