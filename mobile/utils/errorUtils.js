import { Alert } from 'react-native';

/**
 * Extract error message from error object
 * @param {Error} error - The error object
 * @param {string} defaultMessage - Default message if no specific message found
 * @returns {string} The error message
 */
export const getErrorMessage = (error, defaultMessage = 'An error occurred') => {
  return error.response?.data?.message || error.message || defaultMessage;
};

/**
 * Show error alert
 * @param {Error} error - The error object
 * @param {string} defaultMessage - Default message if no specific message found
 */
export const showErrorAlert = (error, defaultMessage = 'An error occurred') => {
  const errorMsg = getErrorMessage(error, defaultMessage);
  Alert.alert('Error', errorMsg);
};

/**
 * Show success alert
 * @param {string} message - Success message
 * @param {string} title - Alert title (default: 'Success')
 */
export const showSuccessAlert = (message, title = 'Success') => {
  Alert.alert(title, message);
};

/**
 * Show confirmation alert
 * @param {string} title - Alert title
 * @param {string} message - Alert message
 * @param {Function} onConfirm - Callback when user confirms
 * @param {Function} onCancel - Callback when user cancels (optional)
 */
export const showConfirmAlert = (title, message, onConfirm, onCancel) => {
  Alert.alert(
    title,
    message,
    [
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: onCancel
      },
      {
        text: 'OK',
        onPress: onConfirm
      }
    ]
  );
};
