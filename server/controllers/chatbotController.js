// Change this line to switch between Gemini and OpenAI
const geminiService = require('../services/chatbot/geminiService'); // Using Google Gemini (Free)
// const geminiService = require('../services/chatbot/openaiService'); // Using OpenAI (Paid)
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Chat with AI assistant
 */
exports.chat = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Get user context for better responses
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        patient: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        dentist: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        admin: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // Get user name based on role
    let userName = 'User';
    if (user?.patient) {
      userName = `${user.patient.firstName} ${user.patient.lastName}`;
    } else if (user?.dentist) {
      userName = `${user.dentist.firstName} ${user.dentist.lastName}`;
    } else if (user?.admin) {
      userName = `${user.admin.firstName} ${user.admin.lastName}`;
    }

    // Fetch comprehensive database information
    const [
      clinics,
      dentists,
      treatments,
      upcomingAppointments,
      recentAppointments
    ] = await Promise.all([
      // Get all active clinics with basic info
      prisma.clinic.findMany({
        select: {
          userId: true,
          clinicName: true,
          city: true,
          location: true,
          description: true,
          workingHours: true,
          availableTreatments: true,
          user: {
            select: {
              phone: true,
              email: true
            }
          }
        },
        take: 10
      }),
      
      // Get all dentists with their specializations
      prisma.dentist.findMany({
        select: {
          userId: true,
          firstName: true,
          lastName: true,
          specialization: true,
          city: true,
          workingHours: true,
          clinic: {
            select: {
              clinicName: true,
              city: true
            }
          }
        },
        take: 20
      }),
      
      // Get all treatments (grouped by treatment name to show available treatment types)
      prisma.treatment.findMany({
        select: {
          treatmentName: true,
          description: true
        },
        distinct: ['treatmentName'],
        take: 50
      }),
      
      // Get upcoming appointments count if patient
      user?.role === 'patient' ? prisma.appointment.count({
        where: {
          patientId: userId,
          appointmentDate: {
            gte: new Date()
          },
          status: {
            in: ['scheduled', 'confirmed']
          }
        }
      }) : 0,
      
      // Get recent appointments if patient
      user?.role === 'patient' ? prisma.appointment.findMany({
        where: {
          patientId: userId
        },
        select: {
          appointmentDate: true,
          startTime: true,
          status: true,
          dentist: {
            select: {
              firstName: true,
              lastName: true,
              specialization: true
            }
          },
          treatment: {
            select: {
              treatmentName: true
            }
          }
        },
        orderBy: {
          appointmentDate: 'desc'
        },
        take: 5
      }) : []
    ]);

    const context = {
      userName,
      userRole: user?.role,
      upcomingAppointments,
      recentAppointments,
      systemData: {
        clinics: clinics.map(c => ({
          name: c.clinicName,
          city: c.city,
          location: c.location,
          description: c.description,
          phone: c.user?.phone,
          email: c.user?.email,
          workingHours: c.workingHours
        })),
        dentists: dentists.map(d => ({
          userId: d.userId,
          name: `Dr. ${d.firstName} ${d.lastName}`,
          specialization: d.specialization,
          city: d.city,
          clinic: d.clinic?.clinicName,
          workingHours: d.workingHours,
          appointmentDuration: d.appointmentDuration
        })),
        treatments: treatments.map(t => ({
          name: t.treatmentName,
          description: t.description
        }))
      }
    };

    // Get AI response
    const response = await geminiService.chat(userId, message, context);

    // If the response contains an appointment booking intent, handle it
    if (response.appointmentBooking) {
      const booking = response.appointmentBooking;
      
      // Check if it's an availability check request
      if (booking.type === 'check_availability' && booking.date && booking.time) {
        // Find dentists available at the specified time
        const requestedDate = new Date(booking.date);
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayOfWeek = dayNames[requestedDate.getDay()];
        
        // Parse the time (could be "14:00" or "2pm" format)
        let requestedTime = booking.time;
        if (requestedTime.includes('pm') || requestedTime.includes('am')) {
          // Convert to 24-hour format
          requestedTime = requestedTime.replace(/\s/g, '');
          const hour = parseInt(requestedTime);
          if (requestedTime.includes('pm') && hour !== 12) {
            requestedTime = `${hour + 12}:00`;
          } else if (requestedTime.includes('am') && hour === 12) {
            requestedTime = '00:00';
          } else {
            requestedTime = `${hour.toString().padStart(2, '0')}:00`;
          }
        }
        
        // Filter dentists by availability
        const availableDentists = [];
        
        for (const dentist of dentists) {
          // Check if dentist works on this day
          if (dentist.workingHours && Array.isArray(dentist.workingHours)) {
            const daySchedule = dentist.workingHours.find(day => day.day === dayOfWeek);
            
            if (daySchedule && daySchedule.start && daySchedule.end) {
              const requestedTimeMinutes = parseInt(requestedTime.split(':')[0]) * 60 + parseInt(requestedTime.split(':')[1] || 0);
              const startMinutes = parseInt(daySchedule.start.split(':')[0]) * 60 + parseInt(daySchedule.start.split(':')[1] || 0);
              const endMinutes = parseInt(daySchedule.end.split(':')[0]) * 60 + parseInt(daySchedule.end.split(':')[1] || 0);
              
              if (requestedTimeMinutes >= startMinutes && requestedTimeMinutes < endMinutes) {
                // Check if not on break
                let onBreak = false;
                if (daySchedule.breaks && Array.isArray(daySchedule.breaks)) {
                  for (const breakTime of daySchedule.breaks) {
                    const breakStart = parseInt(breakTime.start.split(':')[0]) * 60 + parseInt(breakTime.start.split(':')[1] || 0);
                    const breakEnd = parseInt(breakTime.end.split(':')[0]) * 60 + parseInt(breakTime.end.split(':')[1] || 0);
                    if (requestedTimeMinutes >= breakStart && requestedTimeMinutes < breakEnd) {
                      onBreak = true;
                      break;
                    }
                  }
                }
                
                if (!onBreak) {
                  // Check if no conflicting appointments
                  const startOfDay = new Date(booking.date);
                  startOfDay.setHours(0, 0, 0, 0);
                  const endOfDay = new Date(booking.date);
                  endOfDay.setHours(23, 59, 59, 999);
                  
                  const [hours, minutes] = requestedTime.split(':');
                  const requestedDateTime = new Date(booking.date);
                  requestedDateTime.setHours(parseInt(hours), parseInt(minutes || 0), 0, 0);
                  
                  const endDateTime = new Date(requestedDateTime);
                  endDateTime.setMinutes(endDateTime.getMinutes() + (dentist.appointmentDuration || 30));
                  
                  const conflicts = await prisma.appointment.findFirst({
                    where: {
                      dentistId: dentist.userId,
                      appointmentDate: {
                        gte: startOfDay,
                        lte: endOfDay
                      },
                      status: { not: 'CANCELLED' },
                      OR: [
                        {
                          AND: [
                            { startTime: { lte: requestedDateTime } },
                            { endTime: { gt: requestedDateTime } }
                          ]
                        },
                        {
                          AND: [
                            { startTime: { lt: endDateTime } },
                            { endTime: { gte: endDateTime } }
                          ]
                        }
                      ]
                    }
                  });
                  
                  if (!conflicts) {
                    availableDentists.push({
                      userId: dentist.userId,
                      name: `Dr. ${dentist.firstName} ${dentist.lastName}`,
                      specialization: dentist.specialization,
                      city: dentist.city,
                      clinic: dentist.clinic?.clinicName,
                      appointmentDuration: dentist.appointmentDuration
                    });
                  }
                }
              }
            }
          }
        }
        
        // Now send available dentists back to AI to generate a proper response
        if (availableDentists.length > 0) {
          const dentistListText = availableDentists.map((d, idx) => 
            `${idx + 1}. ${d.name} (ID: ${d.userId}) - ${d.specialization.join(', ')} at ${d.clinic}, ${d.city} (Duration: ${d.appointmentDuration} minutes)`
          ).join('\n');
          
          const followUpMessage = `Available dentists for ${booking.date} at ${requestedTime}:\n${dentistListText}\n\nPlease ask the patient to select one of these dentists. Remember to use the dentist's ID and appointment duration when creating the booking.`;
          
          // Make a second AI call with the dentist information
          const updatedContext = {
            ...context,
            availableDentists,
            requestedDateTime: {
              date: booking.date,
              time: requestedTime,
              dayOfWeek
            }
          };
          
          const followUpResponse = await geminiService.chat(userId, followUpMessage, updatedContext);
          
          // Return the follow-up response with dentist selection request
          return res.json({
            success: true,
            data: {
              ...followUpResponse,
              availableDentists,
              requestedDateTime: {
                date: booking.date,
                time: requestedTime,
                dayOfWeek
              }
            }
          });
        } else {
          // No dentists available
          const noAvailabilityMessage = `No dentists are available at ${requestedTime} on ${booking.date}. Please suggest alternative times to the patient.`;
          const followUpResponse = await geminiService.chat(userId, noAvailabilityMessage, context);
          
          return res.json({
            success: true,
            data: followUpResponse
          });
        }
      }
      // If it's a final booking request with dentist ID
      else if (booking.type === 'appointment_booking' && booking.dentistId) {
        // Just pass it through - the frontend will handle the actual booking
        response.readyToBook = true;
        
        // Remove the JSON block from the message shown to user
        let cleanMessage = response.message;
        // Remove ```json...``` blocks
        cleanMessage = cleanMessage.replace(/```json[\s\S]*?```/g, '');
        // Remove standalone JSON objects
        cleanMessage = cleanMessage.replace(/\{[\s\S]*?"type"\s*:\s*"appointment_booking"[\s\S]*?\}/g, '');
        // Remove extra whitespace
        cleanMessage = cleanMessage.trim();
        
        response.message = cleanMessage;
      }
    }

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Chat error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error message:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to process chat message',
      details: error.message
    });
  }
};

/**
 * Get FAQ response
 */
exports.getFAQ = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Question is required'
      });
    }

    const response = await geminiService.getDentalFAQ(question);

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('FAQ error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get FAQ response'
    });
  }
};

/**
 * Get treatment information
 */
exports.getTreatmentInfo = async (req, res) => {
  try {
    const { treatment } = req.params;

    if (!treatment) {
      return res.status(400).json({
        success: false,
        error: 'Treatment name is required'
      });
    }

    const response = await geminiService.getTreatmentInfo(treatment);

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Treatment info error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get treatment information'
    });
  }
};

/**
 * Get post-care instructions
 */
exports.getPostCare = async (req, res) => {
  try {
    const { treatment } = req.params;

    if (!treatment) {
      return res.status(400).json({
        success: false,
        error: 'Treatment type is required'
      });
    }

    const response = await geminiService.getPostCareInstructions(treatment);

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Post-care error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get post-care instructions'
    });
  }
};

/**
 * Clear chat history
 */
exports.clearHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    
    geminiService.clearConversationHistory(userId);

    res.json({
      success: true,
      message: 'Chat history cleared successfully'
    });
  } catch (error) {
    console.error('Clear history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear chat history'
    });
  }
};

/**
 * Get available dentists for appointment booking
 */
exports.getAvailableDentists = async (req, res) => {
  try {
    const { city, specialization, date } = req.query;

    const where = {};
    if (city) where.city = city;
    if (specialization) where.specialization = { has: specialization };

    const dentists = await prisma.dentist.findMany({
      where,
      include: {
        user: {
          select: {
            email: true,
            phone: true,
            status: true
          }
        },
        clinic: {
          select: {
            clinicName: true,
            city: true,
            location: true
          }
        }
      },
      take: 20
    });

    // Filter out inactive dentists
    const activeDentists = dentists.filter(d => d.user.status === 'ACTIVE');

    res.json({
      success: true,
      data: activeDentists
    });
  } catch (error) {
    console.error('Get dentists error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch available dentists'
    });
  }
};

/**
 * Get available time slots for a dentist
 */
exports.getAvailableSlots = async (req, res) => {
  try {
    const { dentistId, date } = req.query;

    if (!dentistId || !date) {
      return res.status(400).json({
        success: false,
        error: 'Dentist ID and date are required'
      });
    }

    const dentist = await prisma.dentist.findUnique({
      where: { userId: parseInt(dentistId) }
    });

    if (!dentist) {
      return res.status(404).json({
        success: false,
        error: 'Dentist not found'
      });
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
      success: true,
      data: {
        appointments,
        appointmentDuration: dentist.appointmentDuration,
        workingHours: workingHours || null,
        dayOfWeek
      }
    });
  } catch (error) {
    console.error('Get slots error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch available slots'
    });
  }
};

/**
 * Book appointment from chatbot
 */
exports.bookAppointment = async (req, res) => {
  try {
    const { dentistId, date, startTime, endTime, reason } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!dentistId || !date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        error: 'Dentist ID, date, start time, and end time are required'
      });
    }

    // Verify user is a patient
    if (req.user.role !== 'Patient') {
      return res.status(403).json({
        success: false,
        error: 'Only patients can book appointments'
      });
    }

    // Default to "Consultation" if no reason provided
    const bookingReason = reason && reason.trim() ? reason : 'Consultation';

    // Get dentist and verify they exist
    const dentist = await prisma.dentist.findUnique({
      where: { userId: parseInt(dentistId) },
      include: {
        user: {
          select: { status: true }
        }
      }
    });

    if (!dentist) {
      return res.status(404).json({
        success: false,
        error: 'Dentist not found'
      });
    }

    if (dentist.user.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        error: 'Dentist is not available'
      });
    }

    const clinicId = dentist.clinicId;

    // Parse dates
    const appointmentDate = new Date(date);
    const startDateTime = new Date(startTime);
    
    // Calculate end time based on dentist's appointment duration
    // This ensures we always use the correct duration from the database
    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + dentist.appointmentDuration);

    // Check if the date is in the past
    const now = new Date();
    if (appointmentDate < now) {
      return res.status(400).json({
        success: false,
        error: 'Cannot book appointments in the past'
      });
    }

    // Check for conflicting appointments
    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        dentistId: parseInt(dentistId),
        appointmentDate,
        status: { not: 'CANCELLED' },
        OR: [
          {
            AND: [
              { startTime: { lte: startDateTime } },
              { endTime: { gt: startDateTime } }
            ]
          },
          {
            AND: [
              { startTime: { lt: endDateTime } },
              { endTime: { gte: endDateTime } }
            ]
          },
          {
            AND: [
              { startTime: { gte: startDateTime } },
              { endTime: { lte: endDateTime } }
            ]
          }
        ]
      }
    });

    if (conflictingAppointment) {
      return res.status(409).json({
        success: false,
        error: 'This time slot is already booked. Please choose another time.'
      });
    }

    // Create the appointment
    const { appointmentInclude } = require('../services/appointment/appointmentService');
    const { sendAppointmentNotification } = require('../services/notification/notificationService');
    const { formatDateTime } = require('../services/appointment/appointmentService');

    const appointment = await prisma.appointment.create({
      data: {
        patientId: userId,
        dentistId: parseInt(dentistId),
        clinicId,
        appointmentDate,
        startTime: startDateTime,
        endTime: endDateTime,
        patientNotes: bookingReason,
        status: 'PENDING' // Patient bookings are pending until confirmed
      },
      include: appointmentInclude
    });

    // Send notifications
    const dateTimeStr = formatDateTime(appointment.startTime);
    const patientName = `${appointment.patient.firstName} ${appointment.patient.lastName}`;
    const dentistName = `${appointment.dentist.firstName} ${appointment.dentist.lastName}`;

    // Notify dentist about new appointment request
    await sendAppointmentNotification(
      parseInt(dentistId),
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

    res.json({
      success: true,
      data: {
        appointment,
        message: `Appointment requested successfully! Your appointment with Dr. ${dentistName} on ${dateTimeStr} is pending confirmation.`
      }
    });
  } catch (error) {
    console.error('Book appointment error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Failed to book appointment',
      details: error.message
    });
  }
};
