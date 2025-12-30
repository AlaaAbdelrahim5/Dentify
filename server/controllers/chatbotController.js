const geminiService = require('../services/chatbot/geminiService');
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
          name: `Dr. ${d.firstName} ${d.lastName}`,
          specialization: d.specialization,
          city: d.city,
          clinic: d.clinic?.clinicName,
          workingHours: d.workingHours
        })),
        treatments: treatments.map(t => ({
          name: t.treatmentName,
          description: t.description
        }))
      }
    };

    // Get AI response
    const response = await geminiService.chat(userId, message, context);

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
 * Book appointment from chatbot
 */
exports.bookAppointment = async (req, res) => {
  try {
    const { date, time, reason, dentistId, clinicId } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!date || !time || !reason) {
      return res.status(400).json({
        success: false,
        error: 'Date, time, and reason are required'
      });
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        patientId: userId,
        dentistId: dentistId || null,
        clinicId: clinicId || null,
        date: new Date(date),
        time,
        reason,
        status: 'scheduled',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        patient: {
          select: {
            name: true,
            email: true
          }
        },
        dentist: {
          select: {
            name: true
          }
        },
        clinic: {
          select: {
            name: true,
            address: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: appointment,
      message: 'Appointment booked successfully via AI assistant!'
    });
  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to book appointment'
    });
  }
};
