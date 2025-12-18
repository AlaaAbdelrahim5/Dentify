import React from 'react';
import { paymentsAPI } from '../../../services/api';
import { SharedPayments } from '../shared';

const SecretaryPayments = () => {
  return (
    <SharedPayments 
      fetchPaymentsAPI={paymentsAPI.getClinicPayments} 
      role="secretary" 
    />
  );
};

export default SecretaryPayments;
