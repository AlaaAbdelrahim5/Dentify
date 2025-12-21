const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const prisma = require('../utils/prisma');
const { db } = require('../config/firebase-admin');
const admin = require('firebase-admin');

// Helper function to send appointment notifications
async function sendAppointmentNotification(userId, title, body, data = {}) {
  try {
    // Store notification in Firestore
    await db.collection('notifications').add({
      userId: userId.toString(),
      title,
      body,
      data,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      type: 'appointment'
    });
  } catch (error) {
  }
}

// Helper function to format date and time
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

// Get patient's appointments
router.get('/patient/my-appointments', authenticate, authorize('Patient'), async (req, res) => {
  try {
    // Auto-cancel pending appointments that have passed
    const now = new Date();
    await prisma.appointment.updateMany({
      where: {
        patientId: req.user.id,
        status: 'PENDING',
        endTime: {
          lt: now
        }
      },
      data: {
        status: 'CANCELLED'
      }
    });

    const appointments = await prisma.appointment.findMany({
      where: { patientId: req.user.id },
      include: {
        dentist: {
          include: {
            user: {
              select: {
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
      },
      orderBy: {
        appointmentDate: 'desc'
      }
    });

    res.json({ appointments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Get dentist's appointments
router.get('/dentist/my-appointments', authenticate, authorize('Dentist'), async (req, res) => {
  try {
    // Auto-cancel pending appointments that have passed
    const now = new Date();
    await prisma.appointment.updateMany({
      where: {
        dentistId: req.user.id,
        status: 'PENDING',
        endTime: {
          lt: now
        }
      },
      data: {
        status: 'CANCELLED'
      }
    });

    const appointments = await prisma.appointment.findMany({
      where: { dentistId: req.user.id },
      include: {
        patient: {
          include: {
            user: {
              select: {
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
      },
      orderBy: {
        appointmentDate: 'desc'
      }
    });

    res.json({ appointments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Get clinic's appointments
router.get('/clinic/my-appointments', authenticate, authorize('Clinic', 'Secretary'), async (req, res) => {
  try {
    let clinicId;

    // If user is a secretary, get their clinic ID
    if (req.user.role === 'Secretary') {
      const secretary = await prisma.secretary.findUnique({
        where: { userId: req.user.id },
        select: { clinicId: true }
      });

      if (!secretary) {
        return res.status(404).json({ error: 'Secretary profile not found' });
      }

      clinicId = secretary.clinicId;
    } else {
      // User is a clinic owner
      clinicId = req.user.id;
    }

    // Auto-cancel pending appointments that have passed
    const now = new Date();
    await prisma.appointment.updateMany({
      where: {
        clinicId: clinicId,
        status: 'PENDING',
        endTime: {
          lt: now
        }
      },
      data: {
        status: 'CANCELLED'
      }
    });

    const appointments = await prisma.appointment.findMany({
      where: { clinicId: clinicId },
      include: {
        patient: {
          include: {
            user: {
              select: {
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
      },
      orderBy: {
        appointmentDate: 'desc'
      }
    });

    res.json({ appointments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Get all appointments (Admin only)
router.get('/', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        patient: {
          include: {
            user: {
              select: {
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
      },
      orderBy: {
        appointmentDate: 'desc'
      }
    });

    res.json({ appointments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Get appointment by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await prisma.appointment.findUnique({
      where: { id: parseInt(id) },
      include: {
        patient: {
          include: {
            user: {
              select: {
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
      }
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Check authorization - user must be involved in the appointment
    const isAuthorized = 
      req.user.role === 'Admin' ||
      appointment.patientId === req.user.id ||
      appointment.dentistId === req.user.id ||
      appointment.clinicId === req.user.id;

    if (!isAuthorized) {
      return res.status(403).json({ error: 'Not authorized to view this appointment' });
    }

    res.json({ appointment });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch appointment' });
  }
});

// Create new appointment
router.post('/', authenticate, authorize('Patient', 'Clinic', 'Dentist', 'Secretary'), async (req, res) => {
  try {
    const { 
      patientId, 
      dentistId, 
      clinicId, 
      appointmentDate, 
      startTime, 
      endTime, 
      patientNotes,
      sessionNotes,
      sessionCost,
      treatmentId 
    } = req.body;

    // Validation
    if (!patientId || !dentistId || !clinicId || !appointmentDate || !startTime || !endTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // If patient is creating, ensure they're booking for themselves
    if (req.user.role === 'Patient' && patientId !== req.user.id) {
      return res.status(403).json({ error: 'Patients can only book appointments for themselves' });
    }

    // Check if dentist exists and belongs to the clinic
    const dentist = await prisma.dentist.findUnique({
      where: { userId: dentistId }
    });

    if (!dentist) {
      return res.status(404).json({ error: 'Dentist not found' });
    }

    if (dentist.clinicId !== clinicId) {
      return res.status(400).json({ error: 'Dentist does not belong to the specified clinic' });
    }

    // Check for conflicting appointments
    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        dentistId,
        appointmentDate: new Date(appointmentDate),
        status: { not: 'CANCELLED' },
        OR: [
          {
            AND: [
              { startTime: { lte: new Date(startTime) } },
              { endTime: { gt: new Date(startTime) } }
            ]
          },
          {
            AND: [
              { startTime: { lt: new Date(endTime) } },
              { endTime: { gte: new Date(endTime) } }
            ]
          },
          {
            AND: [
              { startTime: { gte: new Date(startTime) } },
              { endTime: { lte: new Date(endTime) } }
            ]
          }
        ]
      }
    });

    if (conflictingAppointment) {
      return res.status(409).json({ error: 'Time slot is already booked' });
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        dentistId,
        clinicId,
        appointmentDate: new Date(appointmentDate),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        patientNotes,
        sessionNotes,
        sessionCost: sessionCost ? parseFloat(sessionCost) : null,
        treatmentId,
        status: req.user.role === 'Patient' ? 'PENDING' : 'CONFIRMED'
      },
      include: {
        patient: {
          include: {
            user: {
              select: {
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
                email: true,
                phone: true
              }
            }
          }
        }
      }
    });

    // Send notifications
    const dateTimeStr = formatDateTime(appointment.startTime);
    const patientName = `${appointment.patient.firstName} ${appointment.patient.lastName}`;
    const dentistName = `${appointment.dentist.firstName} ${appointment.dentist.lastName}`;

    if (req.user.role === 'Patient') {
      // Notify dentist about new appointment request
      await sendAppointmentNotification(
        dentistId,
        'New Appointment Request',
        `${patientName} requested an appointment on ${dateTimeStr}`,
        { appointmentId: appointment.id, type: 'new_request' }
      );

      // Notify clinic
      await sendAppointmentNotification(
        clinicId,
        'New Appointment Request',
        `${patientName} requested an appointment with Dr. ${dentistName} on ${dateTimeStr}`,
        { appointmentId: appointment.id, type: 'new_request' }
      );
    } else {
      // Notify patient about confirmed appointment
      await sendAppointmentNotification(
        patientId,
        'Appointment Confirmed',
        `Your appointment with Dr. ${dentistName} is confirmed for ${dateTimeStr}`,
        { appointmentId: appointment.id, type: 'confirmed' }
      );
    }

    res.status(201).json({ 
      message: 'Appointment created successfully',
      appointment 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

// Update appointment
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      appointmentDate, 
      startTime, 
      endTime, 
      status,
      patientNotes,
      sessionNotes,
      sessionCost,
      treatmentId
    } = req.body;

    // Get existing appointment
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingAppointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Check authorization
    let isAuthorized = 
      req.user.role === 'Admin' ||
      (req.user.role === 'Patient' && existingAppointment.patientId === req.user.id) ||
      (req.user.role === 'Dentist' && existingAppointment.dentistId === req.user.id) ||
      (req.user.role === 'Clinic' && existingAppointment.clinicId === req.user.id);

    // Check if Secretary and belongs to the same clinic
    if (req.user.role === 'Secretary' && !isAuthorized) {
      const secretary = await prisma.secretary.findUnique({
        where: { userId: req.user.id }
      });
      
      if (secretary && secretary.clinicId === existingAppointment.clinicId) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({ error: 'Not authorized to update this appointment' });
    }

    // Patients can only update notes, not status or time
    if (req.user.role === 'Patient') {
      const updateData = { patientNotes };
      const appointment = await prisma.appointment.update({
        where: { id: parseInt(id) },
        data: updateData,
        include: {
          dentist: {
            include: {
              user: {
                select: {
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
                  email: true,
                  phone: true
                }
              }
            }
          }
        }
      });

      return res.json({ 
        message: 'Appointment updated successfully',
        appointment 
      });
    }

    // Build update data
    const updateData = {};
    if (appointmentDate !== undefined) updateData.appointmentDate = new Date(appointmentDate);
    if (startTime !== undefined) updateData.startTime = new Date(startTime);
    if (endTime !== undefined) updateData.endTime = new Date(endTime);
    if (status !== undefined) updateData.status = status;
    if (patientNotes !== undefined) updateData.patientNotes = patientNotes;
    if (sessionNotes !== undefined) updateData.sessionNotes = sessionNotes;
    if (sessionCost !== undefined) updateData.sessionCost = sessionCost;
    if (treatmentId !== undefined) updateData.treatmentId = treatmentId;

    // Check for conflicts if time is being changed
    if (startTime || endTime || appointmentDate) {
      const checkDate = appointmentDate ? new Date(appointmentDate) : existingAppointment.appointmentDate;
      const checkStartTime = startTime ? new Date(startTime) : existingAppointment.startTime;
      const checkEndTime = endTime ? new Date(endTime) : existingAppointment.endTime;

      const conflictingAppointment = await prisma.appointment.findFirst({
        where: {
          dentistId: existingAppointment.dentistId,
          appointmentDate: checkDate,
          status: { not: 'CANCELLED' },
          id: { not: parseInt(id) },
          OR: [
            {
              AND: [
                { startTime: { lte: checkStartTime } },
                { endTime: { gt: checkStartTime } }
              ]
            },
            {
              AND: [
                { startTime: { lt: checkEndTime } },
                { endTime: { gte: checkEndTime } }
              ]
            },
            {
              AND: [
                { startTime: { gte: checkStartTime } },
                { endTime: { lte: checkEndTime } }
              ]
            }
          ]
        }
      });

      if (conflictingAppointment) {
        return res.status(409).json({ error: 'Time slot is already booked' });
      }
    }

    const appointment = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        patient: {
          include: {
            user: {
              select: {
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
                email: true,
                phone: true
              }
            }
          }
        }
      }
    });

    // Send notifications if status changed
    if (status && status !== existingAppointment.status) {
      const dateTimeStr = formatDateTime(appointment.startTime);
      const patientName = `${appointment.patient.firstName} ${appointment.patient.lastName}`;
      const dentistName = `${appointment.dentist.firstName} ${appointment.dentist.lastName}`;

      if (status === 'CONFIRMED') {
        // Notify patient
        await sendAppointmentNotification(
          appointment.patientId,
          'Appointment Confirmed',
          `Your appointment with Dr. ${dentistName} has been confirmed for ${dateTimeStr}`,
          { appointmentId: appointment.id, type: 'confirmed' }
        );
      } else if (status === 'CANCELLED') {
        // Notify patient and dentist
        await sendAppointmentNotification(
          appointment.patientId,
          'Appointment Cancelled',
          `Your appointment with Dr. ${dentistName} on ${dateTimeStr} has been cancelled`,
          { appointmentId: appointment.id, type: 'cancelled' }
        );

        if (req.user.id !== appointment.dentistId) {
          await sendAppointmentNotification(
            appointment.dentistId,
            'Appointment Cancelled',
            `Appointment with ${patientName} on ${dateTimeStr} has been cancelled`,
            { appointmentId: appointment.id, type: 'cancelled' }
          );
        }
      } else if (status === 'COMPLETED') {
        // Notify patient
        await sendAppointmentNotification(
          appointment.patientId,
          'Appointment Completed',
          `Your appointment with Dr. ${dentistName} has been completed`,
          { appointmentId: appointment.id, type: 'completed' }
        );
      }
    }

    // Notify if time/date changed
    if ((appointmentDate || startTime || endTime) && 
        (new Date(appointmentDate || existingAppointment.appointmentDate).getTime() !== existingAppointment.appointmentDate.getTime() ||
         new Date(startTime || existingAppointment.startTime).getTime() !== existingAppointment.startTime.getTime())) {
      const newDateTimeStr = formatDateTime(appointment.startTime);
      const patientName = `${appointment.patient.firstName} ${appointment.patient.lastName}`;
      const dentistName = `${appointment.dentist.firstName} ${appointment.dentist.lastName}`;

      // Notify patient
      await sendAppointmentNotification(
        appointment.patientId,
        'Appointment Rescheduled',
        `Your appointment with Dr. ${dentistName} has been rescheduled to ${newDateTimeStr}`,
        { appointmentId: appointment.id, type: 'rescheduled' }
      );

      // Notify dentist if not the one making the change
      if (req.user.id !== appointment.dentistId) {
        await sendAppointmentNotification(
          appointment.dentistId,
          'Appointment Rescheduled',
          `Appointment with ${patientName} has been rescheduled to ${newDateTimeStr}`,
          { appointmentId: appointment.id, type: 'rescheduled' }
        );
      }
    }

    // If status is being changed to CONFIRMED, cancel any other pending appointments in the same time slot
    if (status === 'CONFIRMED') {
      const appointmentStartTime = appointment.startTime;
      const appointmentEndTime = appointment.endTime;
      const appointmentDate = appointment.appointmentDate;

      await prisma.appointment.updateMany({
        where: {
          dentistId: appointment.dentistId,
          appointmentDate: appointmentDate,
          status: 'PENDING',
          id: { not: parseInt(id) },
          OR: [
            {
              AND: [
                { startTime: { lte: appointmentStartTime } },
                { endTime: { gt: appointmentStartTime } }
              ]
            },
            {
              AND: [
                { startTime: { lt: appointmentEndTime } },
                { endTime: { gte: appointmentEndTime } }
              ]
            },
            {
              AND: [
                { startTime: { gte: appointmentStartTime } },
                { endTime: { lte: appointmentEndTime } }
              ]
            }
          ]
        },
        data: {
          status: 'CANCELLED'
        }
      });
    }

    res.json({ 
      message: 'Appointment updated successfully',
      appointment 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

// Cancel appointment
router.patch('/:id/cancel', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Get existing appointment
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingAppointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Check authorization
    let isAuthorized = 
      req.user.role === 'Admin' ||
      existingAppointment.patientId === req.user.id ||
      existingAppointment.dentistId === req.user.id ||
      existingAppointment.clinicId === req.user.id;

    // Check if Secretary and belongs to the same clinic
    if (req.user.role === 'Secretary' && !isAuthorized) {
      const secretary = await prisma.secretary.findUnique({
        where: { userId: req.user.id }
      });
      
      if (secretary && secretary.clinicId === existingAppointment.clinicId) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({ error: 'Not authorized to cancel this appointment' });
    }

    const appointment = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: { status: 'CANCELLED' },
      include: {
        patient: {
          include: {
            user: {
              select: {
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
                email: true,
                phone: true
              }
            }
          }
        }
      }
    });

    // Send notifications
    const dateTimeStr = formatDateTime(appointment.startTime);
    const patientName = `${appointment.patient.firstName} ${appointment.patient.lastName}`;
    const dentistName = `${appointment.dentist.firstName} ${appointment.dentist.lastName}`;

    // Notify patient if not the one cancelling
    if (req.user.id !== appointment.patientId) {
      await sendAppointmentNotification(
        appointment.patientId,
        'Appointment Cancelled',
        `Your appointment with Dr. ${dentistName} on ${dateTimeStr} has been cancelled`,
        { appointmentId: appointment.id, type: 'cancelled' }
      );
    }

    // Notify dentist if not the one cancelling
    if (req.user.id !== appointment.dentistId) {
      await sendAppointmentNotification(
        appointment.dentistId,
        'Appointment Cancelled',
        `Appointment with ${patientName} on ${dateTimeStr} has been cancelled`,
        { appointmentId: appointment.id, type: 'cancelled' }
      );
    }

    // Notify clinic if not the one cancelling
    if (req.user.id !== appointment.clinicId) {
      await sendAppointmentNotification(
        appointment.clinicId,
        'Appointment Cancelled',
        `Appointment between ${patientName} and Dr. ${dentistName} on ${dateTimeStr} has been cancelled`,
        { appointmentId: appointment.id, type: 'cancelled' }
      );
    }

    res.json({ 
      message: 'Appointment cancelled successfully',
      appointment 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel appointment' });
  }
});

// Complete appointment (Dentist and Secretary)
router.patch('/:id/complete', authenticate, authorize('Dentist', 'Secretary'), async (req, res) => {
  try {
    const { id } = req.params;
    const { sessionCost } = req.body;

    // Get existing appointment
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingAppointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Check if dentist owns this appointment or secretary belongs to the same clinic
    let isAuthorized = existingAppointment.dentistId === req.user.id;
    
    if (req.user.role === 'Secretary' && !isAuthorized) {
      const secretary = await prisma.secretary.findUnique({
        where: { userId: req.user.id }
      });
      
      if (secretary && secretary.clinicId === existingAppointment.clinicId) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({ error: 'Not authorized to complete this appointment' });
    }

    // Check if appointment can be completed (not already completed or cancelled)
    if (existingAppointment.status === 'COMPLETED') {
      return res.status(400).json({ error: 'Appointment is already completed' });
    }

    if (existingAppointment.status === 'CANCELLED') {
      return res.status(400).json({ error: 'Cannot complete a cancelled appointment' });
    }

    // Update appointment status to COMPLETED
    const appointment = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: { 
        status: 'COMPLETED',
        sessionCost: sessionCost ? parseFloat(sessionCost) : null
      },
      include: {
        patient: {
          include: {
            user: {
              select: {
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
                email: true,
                phone: true
              }
            }
          }
        }
      }
    });

    // If appointment has a sessionCost and is linked to a treatment, add the cost to treatment's totalAmount
    if (appointment.sessionCost && appointment.treatmentId) {
      const treatment = await prisma.treatment.findUnique({
        where: { id: appointment.treatmentId }
      });

      if (treatment) {
        await prisma.treatment.update({
          where: { id: appointment.treatmentId },
          data: {
            totalAmount: treatment.totalAmount + appointment.sessionCost
          }
        });
      }
    }

    // Send notification to patient
    const dateTimeStr = formatDateTime(appointment.startTime);
    const dentistName = `${appointment.dentist.firstName} ${appointment.dentist.lastName}`;

    await sendAppointmentNotification(
      appointment.patientId,
      'Appointment Completed',
      `Your appointment with Dr. ${dentistName} has been completed`,
      { appointmentId: appointment.id, type: 'completed' }
    );

    res.json({ 
      message: 'Appointment completed successfully',
      appointment 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to complete appointment' });
  }
});

// Delete appointment (soft delete by cancelling)
router.delete('/:id', authenticate, authorize('Admin', 'Clinic'), async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await prisma.appointment.delete({
      where: { id: parseInt(id) }
    });

    res.json({ 
      message: 'Appointment deleted successfully',
      appointment 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete appointment' });
  }
});

// Get available time slots for a dentist on a specific date
router.get('/dentist/:dentistId/available-slots', authenticate, async (req, res) => {
  try {
    const { dentistId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    const dentist = await prisma.dentist.findUnique({
      where: { userId: parseInt(dentistId) }
    });

    if (!dentist) {
      return res.status(404).json({ error: 'Dentist not found' });
    }

    // Get the day of week from the date
    const selectedDate = new Date(date);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = dayNames[selectedDate.getDay()];

    // Get working hours for that day
    let workingHours = null;
    if (dentist.workingHours && Array.isArray(dentist.workingHours)) {
      workingHours = dentist.workingHours.find(day => day.day === dayOfWeek);
    }

    // Create start and end of day for date comparison
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Get all appointments for the dentist on that date
    const appointments = await prisma.appointment.findMany({
      where: {
        dentistId: parseInt(dentistId),
        appointmentDate: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: { not: 'CANCELLED' }
      },
      select: {
        startTime: true,
        endTime: true
      }
    });

    res.json({ 
      appointments,
      appointmentDuration: dentist.appointmentDuration,
      workingHours: workingHours || null,
      dayOfWeek
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch available slots' });
  }
});

// Get dentists by clinic
router.get('/clinics/:clinicId/dentists', authenticate, async (req, res) => {
  try {
    const { clinicId } = req.params;

    const dentists = await prisma.dentist.findMany({
      where: { clinicId: parseInt(clinicId) },
      include: {
        user: {
          select: {
            email: true,
            phone: true,
            profileImage: true,
            status: true
          }
        }
      }
    });

    res.json({ dentists });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dentists' });
  }
});

module.exports = router;
