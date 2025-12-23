const prisma = require('../../config/database');

/**
 * Standard include configuration for appointment queries
 * Includes patient, dentist, clinic with user details, and treatment info
 */
const appointmentInclude = {
  patient: {
    include: {
      user: {
        select: {
          id: true,
          email: true,
          phone: true
        }
      }
    }
  },
  dentist: {
    include: {
      user: {
        select: {
          id: true,
          email: true,
          phone: true
        }
      }
    }
  },
  clinic: {
    include: {
      user: {
        select: {
          id: true,
          email: true,
          phone: true
        }
      }
    }
  },
  treatment: {
    select: {
      id: true,
      treatmentName: true,
      description: true,
      status: true
    }
  }
};

/**
 * Auto-cancel pending appointments that have passed their end time
 * @param {Object} whereCondition - Additional where conditions (e.g., { patientId: 123 })
 * @returns {Promise<Object>} Prisma update result
 */
async function autoCancelExpiredAppointments(whereCondition = {}) {
  const now = new Date();
  return await prisma.appointment.updateMany({
    where: {
      ...whereCondition,
      status: 'PENDING',
      endTime: {
        lt: now
      }
    },
    data: {
      status: 'CANCELLED'
    }
  });
}

/**
 * Get clinic ID for the current user
 * If user is a secretary, fetches their associated clinic ID
 * If user is a clinic, returns their user ID
 * @param {Object} user - User object with id and role
 * @returns {Promise<number|null>} Clinic ID or null if not found
 */
async function getClinicIdForUser(user) {
  if (user.role === 'Secretary') {
    const secretary = await prisma.secretary.findUnique({
      where: { userId: user.id },
      select: { clinicId: true }
    });
    return secretary ? secretary.clinicId : null;
  }
  return user.id;
}

/**
 * Format date and time for display
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
function formatDateTime(date) {
  return new Date(date).toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

module.exports = {
  appointmentInclude,
  autoCancelExpiredAppointments,
  getClinicIdForUser,
  formatDateTime
};
