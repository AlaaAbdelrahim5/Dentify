import React from 'react';
import { dentistsAPI } from '../../../services/api';
import { filterDentists } from '../../../utils/searchUtils';
import { SharedDentistsList } from '../shared';

const SecretaryDentists = () => {
  return (
    <SharedDentistsList
      fetchDentistsAPI={dentistsAPI.getForClinic}
      filterFunction={filterDentists}
      searchPlaceholder="Search dentists..."
    />
  );
};

export default SecretaryDentists;
