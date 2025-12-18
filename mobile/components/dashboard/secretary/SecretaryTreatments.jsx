import React from 'react';
import { treatmentsAPI } from '../../../services/api';
import { SharedTreatments } from '../shared';

const SecretaryTreatments = () => {
  return (
    <SharedTreatments 
      fetchTreatmentsAPI={treatmentsAPI.getClinicTreatments} 
      role="secretary"
      showCount={true}
    />
  );
};

export default SecretaryTreatments;
