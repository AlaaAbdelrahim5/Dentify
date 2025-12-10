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
]

// Cities as select options (for dropdowns)
export const CITY_OPTIONS = PALESTINIAN_CITIES.map(city => ({
  value: city,
  label: city
}))

// Cities as lowercase options (for some forms that use lowercase values)
export const CITY_OPTIONS_LOWERCASE = PALESTINIAN_CITIES.map(city => ({
  value: city.toLowerCase().replace(/\s+/g, '_'),
  label: city
}))

// Cities with underscore format (for radiology and other specific forms)
export const CITY_OPTIONS_UNDERSCORE = PALESTINIAN_CITIES.map(city => ({
  value: city.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_'),
  label: city
}))

// Dental Specializations
export const DENTAL_SPECIALIZATIONS = [
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
]

// Specializations as select options
export const SPECIALIZATION_OPTIONS = DENTAL_SPECIALIZATIONS.map(spec => ({
  value: spec,
  label: spec
}))

// Gender Options
export const GENDER_OPTIONS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' }
]

// Default Working Hours Structure
export const DEFAULT_WORKING_HOURS = {
  sunday: { isOpen: true, start: '09:00', end: '17:00' },
  monday: { isOpen: true, start: '09:00', end: '17:00' },
  tuesday: { isOpen: true, start: '09:00', end: '17:00' },
  wednesday: { isOpen: true, start: '09:00', end: '17:00' },
  thursday: { isOpen: true, start: '09:00', end: '17:00' },
  friday: { isOpen: false, start: '09:00', end: '17:00' },
  saturday: { isOpen: true, start: '09:00', end: '17:00' }
}

// Days of the Week
export const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
]

// Status Options
export const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending Approval' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'DEACTIVATED', label: 'Deactivated' }
]

// Dental Specializations as select options for dropdowns
export const DENTAL_SPECIALIZATIONS_OPTIONS = DENTAL_SPECIALIZATIONS.map(spec => ({
  value: spec,
  label: spec
}))

// Treatment Status Options
export const TREATMENT_STATUS_OPTIONS = [
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Cancelled', label: 'Cancelled' }
]

// Appointment Status Options
export const APPOINTMENT_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' }
]

// Radiology Request Status Options
export const RADIOLOGY_STATUS_OPTIONS = [
  { value: 'Requested', label: 'Requested' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Cancelled', label: 'Cancelled' }
]

// Treatment Priority Options
export const PRIORITY_OPTIONS = [
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' }
]

// Treatment Types
export const TREATMENT_TYPES = [
  { value: 'Root Canal', label: 'Root Canal' },
  { value: 'Extraction', label: 'Extraction' },
  { value: 'Cleaning', label: 'Cleaning' },
  { value: 'Filling', label: 'Filling' },
  { value: 'Crown Installation', label: 'Crown Installation' },
  { value: 'Bridge', label: 'Bridge' },
  { value: 'Implant', label: 'Implant' },
  { value: 'Whitening', label: 'Whitening' },
  { value: 'Orthodontics', label: 'Orthodontics' },
  { value: 'Veneer', label: 'Veneer' },
  { value: 'Other', label: 'Other' }
]

// Tooth Condition Options
export const TOOTH_CONDITION_OPTIONS = [
  { value: 'healthy', label: 'Healthy' },
  { value: 'cavity', label: 'Cavity' },
  { value: 'root-canal', label: 'Root Canal' },
  { value: 'crown', label: 'Crown' },
  { value: 'extracted', label: 'Extracted' },
  { value: 'implant', label: 'Implant' },
  { value: 'filling', label: 'Filling' },
  { value: 'bridge', label: 'Bridge' }
]

// Appointment Duration Options
export const APPOINTMENT_DURATION_OPTIONS = [
  { value: '15', label: '15 minutes' },
  { value: '30', label: '30 minutes' },
  { value: '45', label: '45 minutes' },
  { value: '60', label: '1 hour' },
  { value: '90', label: '1.5 hours' },
  { value: '120', label: '2 hours' }
]

// Inventory Categories
export const INVENTORY_CATEGORIES = [
  'Instruments',
  'Materials',
  'Medications',
  'Consumables',
  'Equipment',
  'Other'
]

// Inventory Units
export const INVENTORY_UNITS = [
  { value: 'units', label: 'Units' },
  { value: 'boxes', label: 'Boxes' },
  { value: 'bottles', label: 'Bottles' },
  { value: 'packs', label: 'Packs' },
  { value: 'pieces', label: 'Pieces' }
]

// Treatment Options for Appointments
export const TREATMENT_OPTIONS = [
  'Dental Cleaning',
  'Dental Filling',
  'Root Canal',
  'Tooth Extraction',
  'Crown Installation',
  'Teeth Whitening',
  'Orthodontic Consultation',
  'Periodontal Treatment',
  'Dental Implant',
  'Emergency Care',
  'General Consultation'
]
