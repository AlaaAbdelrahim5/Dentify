import { Alert } from 'react-native';
import { appointmentsAPI } from '../services/api';
import { showErrorAlert } from './errorUtils';

/**
 * Create appointment action handlers
 * These functions return configured handlers for different roles and contexts
 */

/**
 * Create a cancel appointment handler
 * @param {Object} config - Configuration object
 * @param {string} config.role - User role ('patient', 'dentist', 'secretary')
 * @param {Function} config.onSuccess - Callback after successful cancellation
 * @returns {Function} Cancel handler function
 */
export const createCancelHandler = ({ role, onSuccess }) => {
  return (appointment) => {
    // Create role-specific alert messages
    const getMessage = () => {
      switch (role) {
        case 'patient':
          return `Are you sure you want to cancel your appointment with Dr. ${appointment.dentist?.firstName} ${appointment.dentist?.lastName}?`;
        case 'dentist':
          return `Are you sure you want to cancel the appointment with ${appointment.patient?.firstName} ${appointment.patient?.lastName}?`;
        case 'secretary':
          return `Are you sure you want to cancel the appointment for ${appointment.patient?.firstName} ${appointment.patient?.lastName} with Dr. ${appointment.dentist?.firstName} ${appointment.dentist?.lastName}?`;
        default:
          return 'Are you sure you want to cancel this appointment?';
      }
    };

    Alert.alert(
      'Cancel Appointment',
      getMessage(),
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await appointmentsAPI.cancel(appointment.id);
              Alert.alert('Success', 'Appointment cancelled successfully');
              onSuccess?.();
            } catch (error) {
              showErrorAlert(error, 'Failed to cancel appointment');
            }
          },
        },
      ]
    );
  };
};

/**
 * Create a confirm appointment handler (for dentist/secretary)
 * @param {Object} config - Configuration object
 * @param {string} config.role - User role ('dentist' or 'secretary')
 * @param {Function} config.onSuccess - Callback after successful confirmation
 * @returns {Function} Confirm handler function
 */
export const createConfirmHandler = ({ role, onSuccess }) => {
  return (appointment) => {
    const getMessage = () => {
      if (role === 'secretary') {
        return `Confirm appointment for ${appointment.patient?.firstName} ${appointment.patient?.lastName} with Dr. ${appointment.dentist?.firstName} ${appointment.dentist?.lastName}?`;
      }
      return `Confirm appointment with ${appointment.patient?.firstName} ${appointment.patient?.lastName}?`;
    };

    Alert.alert(
      'Confirm Appointment',
      getMessage(),
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await appointmentsAPI.update(appointment.id, { status: 'CONFIRMED' });
              Alert.alert('Success', 'Appointment confirmed successfully');
              onSuccess?.();
            } catch (error) {
              showErrorAlert(error, 'Failed to confirm appointment');
            }
          },
        },
      ]
    );
  };
};

/**
 * Create a complete appointment handler with session cost modal
 * @param {Object} config - Configuration object
 * @param {Function} config.setSelectedAppointment - State setter for selected appointment
 * @param {Function} config.setModalVisible - State setter for modal visibility
 * @returns {Function} Complete handler function
 */
export const createCompleteHandler = ({ setSelectedAppointment, setModalVisible }) => {
  return (appointment) => {
    // Check if appointment is linked to a treatment
    if (!appointment.treatmentId) {
      Alert.alert(
        'No Treatment Linked',
        'This appointment is not linked to a treatment. Session cost can only be added for treatment-related appointments.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Open session cost modal
    setSelectedAppointment(appointment);
    setModalVisible(true);
  };
};

/**
 * Create a view details handler
 * @param {string} role - User role ('patient', 'dentist', 'secretary')
 * @returns {Function} View details handler function
 */
export const createViewDetailsHandler = (role) => {
  return (appointment) => {
    let message = '';
    
    switch (role) {
      case 'patient':
        const dentistName = `Dr. ${appointment.dentist?.firstName} ${appointment.dentist?.lastName}`;
        const treatmentType = appointment.treatment?.treatmentType || 'General Checkup';
        const notes = appointment.patientNotes || appointment.sessionNotes || 'No notes';
        message = `Dentist: ${dentistName}\nTreatment: ${treatmentType}\nClinic: ${appointment.clinic?.clinicName}\nNotes: ${notes}`;
        break;
        
      case 'dentist':
        const patientName = `${appointment.patient?.firstName} ${appointment.patient?.lastName}`;
        const treatment = appointment.treatment?.treatmentType || 'General Checkup';
        const patientNotes = appointment.patientNotes || appointment.sessionNotes || 'No notes';
        const phone = appointment.patient?.user?.phone || 'N/A';
        message = `Patient: ${patientName}\nPhone: ${phone}\nTreatment: ${treatment}\nNotes: ${patientNotes}`;
        break;
        
      case 'secretary':
        const patName = `${appointment.patient?.firstName} ${appointment.patient?.lastName}`;
        const dentName = `Dr. ${appointment.dentist?.firstName} ${appointment.dentist?.lastName}`;
        const treat = appointment.treatment?.treatmentType || 'General Checkup';
        const note = appointment.patientNotes || appointment.sessionNotes || 'No notes';
        const phoneNum = appointment.patient?.user?.phone || 'N/A';
        message = `Patient: ${patName}\nPhone: ${phoneNum}\nDentist: ${dentName}\nTreatment: ${treat}\nNotes: ${note}`;
        break;
        
      default:
        message = 'Appointment details unavailable';
    }
    
    Alert.alert('Appointment Details', message, [{ text: 'OK' }]);
  };
};

/**
 * Create session cost save handler
 * @param {Object} config - Configuration object
 * @param {Object} config.selectedAppointment - Currently selected appointment
 * @param {Function} config.setModalVisible - State setter for modal visibility
 * @param {Function} config.setSelectedAppointment - State setter for selected appointment
 * @param {Function} config.onSuccess - Callback after successful save
 * @returns {Function} Save session cost handler
 */
export const createSessionCostSaveHandler = ({ 
  selectedAppointment, 
  setModalVisible, 
  setSelectedAppointment, 
  onSuccess 
}) => {
  return async (sessionCost) => {
    try {
      await appointmentsAPI.complete(selectedAppointment.id, { sessionCost });
      setModalVisible(false);
      setSelectedAppointment(null);
      onSuccess?.();
    } catch (error) {
      throw error; // Let modal handle the error
    }
  };
};

/**
 * Filter appointments by search term and status
 * @param {Array} appointments - Array of appointments to filter
 * @param {string} searchTerm - Search term to filter by
 * @param {string} selectedStatus - Status to filter by ('all' for no status filter)
 * @param {string} role - User role for determining search fields
 * @returns {Array} Filtered appointments
 */
export const filterAppointments = (appointments, searchTerm, selectedStatus, role) => {
  return appointments.filter(appointment => {
    // Build searchable text based on role
    let searchableText = '';
    
    if (role === 'patient') {
      const dentistName = `${appointment.dentist?.firstName || ''} ${appointment.dentist?.lastName || ''}`;
      searchableText = `${dentistName} ${appointment.treatment?.treatmentType || ''}`;
    } else if (role === 'dentist' || role === 'secretary') {
      const patientName = `${appointment.patient?.firstName || ''} ${appointment.patient?.lastName || ''}`;
      searchableText = `${patientName} ${appointment.treatment?.treatmentType || ''}`;
      
      if (role === 'secretary') {
        const dentistName = `${appointment.dentist?.firstName || ''} ${appointment.dentist?.lastName || ''}`;
        searchableText += ` ${dentistName}`;
      }
    }
    
    const matchesSearch = searchTerm === '' || 
      searchableText.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'all' || appointment.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });
};
