import React from 'react';
import { treatmentsAPI } from '../../../services/api';
import { SharedTreatments } from '../shared';

const PatientTreatments = () => {
  return (
    <SharedTreatments 
      fetchTreatmentsAPI={treatmentsAPI.getPatientTreatments} 
      role="patient"
      showCount={false}
    />
  );
};

export default PatientTreatments;
