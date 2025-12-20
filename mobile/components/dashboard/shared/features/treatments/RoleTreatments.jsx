import React from 'react';
import { treatmentsAPI } from '../../../../../services/api';
import SharedTreatments from './SharedTreatments';

/**
 * Unified Treatments component that handles all roles
 * @param {string} role - The user role ('dentist', 'patient', 'secretary')
 */
const RoleTreatments = ({ role }) => {
  const config = React.useMemo(() => {
    switch (role) {
      case 'dentist':
        return {
          fetchAPI: treatmentsAPI.getDentistTreatments,
          showCount: true
        };
      case 'patient':
        return {
          fetchAPI: treatmentsAPI.getPatientTreatments,
          showCount: false
        };
      case 'secretary':
        return {
          fetchAPI: treatmentsAPI.getClinicTreatments,
          showCount: true
        };
      default:
        throw new Error(`Invalid role: ${role}`);
    }
  }, [role]);

  return (
    <SharedTreatments 
      fetchTreatmentsAPI={config.fetchAPI} 
      role={role}
      showCount={config.showCount}
    />
  );
};

export default RoleTreatments;
