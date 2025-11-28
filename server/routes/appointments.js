const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const prisma = require('../utils/prisma');

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
            treatmentType: true,
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
    console.error('Error fetching patient appointments:', error);
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
            treatmentType: true,
            description: true,
            status: true
          }
        }
      },
      orderBy: {
        appointmentDate: 'desc'
      }
    });

    // Debug: Log the first appointment to see if treatment is included
    if (appointments.length > 0) {
      console.log('Sample appointment with treatment:', JSON.stringify({
        id: appointments[0].id,
        treatmentId: appointments[0].treatmentId,
        treatment: appointments[0].treatment
      }, null, 2));
    }

    res.json({ appointments });
  } catch (error) {
    console.error('Error fetching dentist appointments:', error);
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
            treatmentType: true,
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
    console.error('Error fetching clinic appointments:', error);
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
            treatmentType: true,
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
    console.error('Error fetching appointments:', error);
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
            treatmentType: true,
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
    console.error('Error fetching appointment:', error);
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

    res.status(201).json({ 
      message: 'Appointment created successfully',
      appointment 
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
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
    console.error('Error updating appointment:', error);
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

    res.json({ 
      message: 'Appointment cancelled successfully',
      appointment 
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
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

    res.json({ 
      message: 'Appointment completed successfully',
      appointment 
    });
  } catch (error) {
    console.error('Error completing appointment:', error);
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
    console.error('Error deleting appointment:', error);
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

    console.log(`Fetching slots for dentist ${dentistId} on ${date}`);
    console.log(`Found ${appointments.length} appointments:`, appointments);

    res.json({ 
      appointments,
      appointmentDuration: dentist.appointmentDuration,
      workingHours: workingHours || null,
      dayOfWeek
    });
  } catch (error) {
    console.error('Error fetching available slots:', error);
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
    console.error('Error fetching clinic dentists:', error);
    res.status(500).json({ error: 'Failed to fetch dentists' });
  }
});

module.exports = router;
