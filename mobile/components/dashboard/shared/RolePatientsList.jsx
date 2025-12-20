import React from 'react';
import { patientsAPI, treatmentsAPI } from '../../../services/api';
import { filterPatients } from '../../../utils/searchUtils';
import SharedPatientsList from './SharedPatientsList';

/**
 * Unified Patients List component that handles all roles
 * @param {string} role - The user role ('dentist', 'secretary')
 */
const RolePatientsList = ({ role }) => {
  const config = React.useMemo(() => {
    switch (role) {
      case 'dentist':
        return {
          fetchAPI: treatmentsAPI.getDentistTreatments,
          searchPlaceholder: 'Search patients...'
        };
      case 'secretary':
        return {
          fetchAPI: patientsAPI.getAll,
          searchPlaceholder: 'Search patients...'
        };
      default:
        throw new Error(`Invalid role for patients list: ${role}`);
    }
  }, [role]);

  return (
    <SharedPatientsList
      fetchPatientsAPI={config.fetchAPI}
      filterFunction={filterPatients}
      searchPlaceholder={config.searchPlaceholder}
    />
  );
};

export default RolePatientsList;
