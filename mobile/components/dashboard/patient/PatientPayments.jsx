import React from 'react';
import { paymentsAPI } from '../../../services/api';
import { SharedPayments } from '../shared';

const PatientPayments = () => {
  return (
    <SharedPayments 
      fetchPaymentsAPI={paymentsAPI.getPatientPayments} 
      role="patient" 
    />
  );
};

export default PatientPayments;
