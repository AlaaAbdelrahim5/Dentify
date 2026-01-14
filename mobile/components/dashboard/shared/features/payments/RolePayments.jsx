import React from 'react';
import { paymentsAPI, treatmentsAPI } from '../../../../../services/api';
import SharedPayments from './SharedPayments';

/**
 * Unified Payments component that handles all roles
 * @param {string} role - The user role ('dentist', 'patient', 'secretary')
 */
const RolePayments = ({ role }) => {
  const fetchPaymentsAPI = React.useMemo(() => {
    switch (role) {
      case 'dentist':
        return paymentsAPI.getDentistPayments;
      case 'patient':
        return paymentsAPI.getPatientPayments;
      case 'secretary':
        return paymentsAPI.getClinicPayments;
      default:
        throw new Error(`Invalid role: ${role}`);
    }
  }, [role]);

  const fetchTreatmentsAPI = React.useMemo(() => {
    // Only provide treatments API for patient role
    if (role === 'patient') {
      return treatmentsAPI.getPatientTreatments;
    }
    return null;
  }, [role]);

  return (
    <SharedPayments 
      fetchPaymentsAPI={fetchPaymentsAPI} 
      fetchTreatmentsAPI={fetchTreatmentsAPI}
      role={role} 
    />
  );
};

export default RolePayments;
