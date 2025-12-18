// Palestinian Cities
export const PALESTINIAN_CITIES = [
  'Acre',
  'Al-Bireh',
  'Beersheba',
  'Beit Hanoun',
  'Beit Jala',
  'Beit Lahia',
  'Beit Sahour',
  'Bethlehem',
  'Deir al-Balah',
  'Gaza',
  'Haifa',
  'Hebron',
  'Jabalya',
  'Jaffa',
  'Jenin',
  'Jericho',
  'Jerusalem',
  'Khan Yunis',
  'Lydd',
  'Nablus',
  'Nazareth',
  'Qalqilya',
  'Rafah',
  'Ramallah',
  'Ramla',
  'Safad',
  'Salfit',
  'Tiberias',
  'Tubas',
  'Tulkarm'
];

// Cities as select options (for dropdowns)
export const CITY_OPTIONS = PALESTINIAN_CITIES.map(city => ({
  value: city,
  label: city
}));

// Gender Options
export const GENDER_OPTIONS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' }
];

// Country Codes (focused on Palestinian region)
export const COUNTRY_CODES = [
  { value: '+970', label: '+970 (Palestine)' },
  { value: '+972', label: '+972 (Israel)' },
  { value: '+962', label: '+962 (Jordan)' },
  { value: '+20', label: '+20 (Egypt)' },
  { value: '+961', label: '+961 (Lebanon)' },
  { value: '+963', label: '+963 (Syria)' }
];

// Allowed user roles for mobile app (Patient, Dentist, Secretary only)
export const ALLOWED_MOBILE_ROLES = ['patient', 'dentist', 'secretary'];

// Role display names
export const ROLE_DISPLAY_NAMES = {
  patient: 'Patient',
  dentist: 'Dentist',
  secretary: 'Secretary'
};
// Dental Specializations
export const SPECIALIZATIONS = [
  'General Dentistry',
  'Orthodontics',
  'Endodontics',
  'Periodontics',
  'Oral Surgery',
  'Prosthodontics',
  'Pediatric Dentistry',
  'Oral Pathology',
  'Cosmetic Dentistry',
  'Implantology'
];

// Specializations as select options (for dropdowns)
export const SPECIALIZATION_OPTIONS = SPECIALIZATIONS.map(spec => ({
  value: spec,
  label: spec
}));