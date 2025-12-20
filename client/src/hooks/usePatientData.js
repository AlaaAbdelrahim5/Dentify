import { useMemo } from 'react'

/**
 * Custom hook for transforming and filtering patient data
 * Eliminates duplicate patient transformation logic
 * 
 * @param {Array} patients - Raw patient data from API
 * @param {string} searchTerm - Search term for filtering
 * @param {Object} filters - Additional filters (city, gender, status)
 * @returns {Object} Transformed and filtered patients
 */
export const usePatientData = (patients, searchTerm = '', filters = {}) => {
  /**
   * Transform patient data to consistent format
   */
  const transformedPatients = useMemo(() => {
    return patients.map(patient => ({
      id: patient.userId || patient.id,
      name: `${patient.firstName} ${patient.lastName}`,
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
    }))
  }, [patients])

  /**
   * Filter patients based on search and filters
   */
  const filteredPatients = useMemo(() => {
    return transformedPatients.filter(patient => {
      // Search filter
      const matchesSearch = !searchTerm || 
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone.includes(searchTerm)

      // City filter
      const matchesCity = !filters.city || 
        patient.city?.toLowerCase() === filters.city.toLowerCase()

      // Gender filter
      const matchesGender = !filters.gender || 
        patient.gender?.toLowerCase() === filters.gender.toLowerCase()

      // Status filter
      const matchesStatus = !filters.status || 
        patient.status === filters.status

      return matchesSearch && matchesCity && matchesGender && matchesStatus
    })
  }, [transformedPatients, searchTerm, filters])

  return {
    transformedPatients,
    filteredPatients,
    totalCount: filteredPatients.length
  }
}

/**
 * Custom hook for calculating patient-related statistics
 * 
 * @param {Array} treatments - Treatments data
 * @param {Array} patients - Patients data
 * @returns {Object} Calculated statistics
 */
export const usePatientStats = (treatments = [], patients = []) => {
  const stats = useMemo(() => {
    const activeTreatments = treatments.filter(t => t.status === 'IN_PROGRESS').length
    const totalRevenue = treatments.reduce((sum, t) => sum + (t.paidAmount || 0), 0)
    const pendingPayments = treatments.reduce((sum, t) => {
      const remaining = (t.totalAmount || 0) - (t.paidAmount || 0)
      return sum + (remaining > 0 ? remaining : 0)
    }, 0)

    return {
      totalPatients: patients.length,
      activeTreatments,
      totalRevenue,
      pendingPayments
    }
  }, [treatments, patients])

  return stats
}
