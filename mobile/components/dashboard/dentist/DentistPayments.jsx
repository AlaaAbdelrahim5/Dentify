import React from 'react';
import { paymentsAPI } from '../../../services/api';
import { SharedPayments } from '../shared';

const DentistPayments = () => {
  return (
    <SharedPayments 
      fetchPaymentsAPI={paymentsAPI.getDentistPayments} 
      role="dentist" 
    />
  );
};

export default DentistPayments;
