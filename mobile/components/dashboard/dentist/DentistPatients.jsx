import React from 'react';
import { treatmentsAPI } from '../../../services/api';
import { filterPatients } from '../../../utils/searchUtils';
import { SharedPatientsList } from '../shared';

const DentistPatients = () => {
  return (
    <SharedPatientsList
      fetchPatientsAPI={treatmentsAPI.getDentistTreatments}
      filterFunction={filterPatients}
      searchPlaceholder="Search patients..."
    />
  );
};

export default DentistPatients;
