/**
 * Search utility functions for filtering lists
 */

/**
 * Filter patients by search term
 * Searches through: full name, email, phone
 */
export const filterPatients = (patients, searchTerm) => {
  if (!searchTerm.trim()) return patients;
  
  const term = searchTerm.toLowerCase();
  return patients.filter(patient =>
    `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(term) ||
    patient.user?.email?.toLowerCase().includes(term) ||
    patient.user?.phone?.includes(searchTerm)
  );
};

/**
 * Filter dentists by search term
 * Searches through: full name, email, license number
 */
export const filterDentists = (dentists, searchTerm) => {
  if (!searchTerm.trim()) return dentists;
  
  const term = searchTerm.toLowerCase();
  return dentists.filter(dentist =>
    `${dentist.firstName} ${dentist.lastName}`.toLowerCase().includes(term) ||
    dentist.user?.email?.toLowerCase().includes(term) ||
    dentist.licenseNumber?.includes(searchTerm)
  );
};

/**
 * Generic filter function for objects with name/email fields
 */
export const filterByNameEmail = (items, searchTerm, nameKey = 'name', emailKey = 'email') => {
  if (!searchTerm.trim()) return items;
  
  const term = searchTerm.toLowerCase();
  return items.filter(item =>
    item[nameKey]?.toLowerCase().includes(term) ||
    item[emailKey]?.toLowerCase().includes(term)
  );
};
