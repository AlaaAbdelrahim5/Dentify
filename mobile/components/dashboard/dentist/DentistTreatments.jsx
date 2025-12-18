import React from 'react';
import { treatmentsAPI } from '../../../services/api';
import { SharedTreatments } from '../shared';

const DentistTreatments = () => {
  return (
    <SharedTreatments 
      fetchTreatmentsAPI={treatmentsAPI.getDentistTreatments} 
      role="dentist"
      showCount={true}
    />
  );
};

export default DentistTreatments;
