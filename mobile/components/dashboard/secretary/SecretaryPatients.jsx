import React from 'react';
import { patientsAPI } from '../../../services/api';
import { filterPatients } from '../../../utils/searchUtils';
import { SharedPatientsList } from '../shared';

const SecretaryPatients = () => {
  return (
    <SharedPatientsList
      fetchPatientsAPI={patientsAPI.getAll}
      filterFunction={filterPatients}
      searchPlaceholder="Search patients..."
    />
  );
};

export default SecretaryPatients;
