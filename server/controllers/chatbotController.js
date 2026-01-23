// Change this line to switch between Gemini and OpenAI
const geminiService = require('../services/chatbot/geminiService'); // Using Google Gemini (Free)
// const geminiService = require('../services/chatbot/openaiService'); // Using OpenAI (Paid)
const { PrismaClient } = require('@prisma/client');
const { generateAvailableSlots } = require('../services/appointment/appointmentService');
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
          appointmentDuration: true,
          clinic: {
            select: {
              clinicName: true,
              city: true
            }
          }
        },
        take: 20
      }).then(dentists => {
        console.log(`[DENTISTS] Fetched ${dentists.length} dentists from database`);
        dentists.forEach((d, idx) => {
          console.log(`  ${idx + 1}. Dr. ${d.firstName} ${d.lastName} - Duration: ${d.appointmentDuration}min`);
          console.log(`     Working Hours Type: ${typeof d.workingHours}, Array: ${Array.isArray(d.workingHours)}`);
          if (d.workingHours) {
            console.log(`     Working Hours:`, JSON.stringify(d.workingHours).substring(0, 150));
          }
        });
        return dentists;
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
      console.log('📋 Booking Request:', JSON.stringify(booking, null, 2));
      
      // Handle "first available slot" request WITHOUT specific dentist (show available dentists)
      if (booking.type === 'find_first_available' && !booking.dentistName) {
        // Determine start date
        let startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        
        if (booking.date) {
          startDate = new Date(booking.date);
          startDate.setHours(0, 0, 0, 0);
        }

        // Find all dentists who have availability on this date/time preference
        const availableDentists = [];
        
        for (const dentist of dentists) {
          // Get existing appointments for this dentist on the requested date
          const startOfDay = new Date(startDate);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(startDate);
          endOfDay.setHours(23, 59, 59, 999);
          
          const existingAppointments = await prisma.appointment.findMany({
            where: {
              dentistId: dentist.userId,
              appointmentDate: {
                gte: startOfDay,
                lte: endOfDay
              },
              status: { notIn: ['CANCELLED', 'COMPLETED'] }
            },
            orderBy: { startTime: 'asc' }
          });
          
          // Use centralized slot generation function
          const availableSlots = generateAvailableSlots(
            dentist, 
            startDate, 
            existingAppointments,
            { timePreference: booking.timePreference }
          );
          
          if (availableSlots.length > 0) {
            availableDentists.push({
              userId: dentist.userId,
              name: `Dr. ${dentist.firstName} ${dentist.lastName}`,
              specialization: dentist.specialization,
              city: dentist.city,
              clinic: dentist.clinic?.clinicName,
              appointmentDuration: dentist.appointmentDuration,
              availableSlotsCount: availableSlots.length
            });
          }
        }

        if (availableDentists.length > 0) {
          // Format date for display
          const displayDate = startDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          
          const timePreferenceText = booking.timePreference 
            ? ` in the ${booking.timePreference}` 
            : '';
          
          const dentistListText = availableDentists.map((d, idx) => 
            `${idx + 1}. ${d.name} (ID: ${d.userId}) - ${d.specialization.join(', ')} at ${d.clinic}, ${d.city} (Duration: ${d.appointmentDuration} minutes)`
          ).join('\n');
          
          const followUpMessage = `Available dentists for ${displayDate}${timePreferenceText}:\n${dentistListText}\n\nPlease present these dentists nicely to the patient and ask them to select one.`;
          
          // Build year-month-day format for date
          const year = startDate.getFullYear();
          const month = String(startDate.getMonth() + 1).padStart(2, '0');
          const day = String(startDate.getDate()).padStart(2, '0');
          const dateStr = `${year}-${month}-${day}`;
          
          const updatedContext = {
            ...context,
            availableDentists,
            requestedDateTime: {
              date: dateStr,
              displayDate,
              timePreference: booking.timePreference
            }
          };
          
          const followUpResponse = await geminiService.chat(userId, followUpMessage, updatedContext);
          
          return res.json({
            success: true,
            data: {
              ...followUpResponse,
              availableDentists,
              requestedDateTime: updatedContext.requestedDateTime
            }
          });
        } else {
          const displayDate = startDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          const timePreferenceText = booking.timePreference 
            ? ` in the ${booking.timePreference}` 
            : '';
          
          const noSlotsMessage = `I'm sorry, but there are no available appointments on ${displayDate}${timePreferenceText}. This could be because:
- All time slots are fully booked
- Dentists don't work on this day
- The requested time is outside working hours

Would you like me to:
1. Check availability on a different date?
2. Show you the first available slot${booking.timePreference ? ' for any time of day' : ''}?
3. See availability for the next few days?`;
          
          return res.json({
            success: true,
            data: {
              message: noSlotsMessage,
              readyToBook: false
            }
          });
        }
      }
      // Handle "first available slot" request with specific dentist
      else if (booking.type === 'find_first_available' && booking.dentistName) {
        // Find the dentist by name (case-insensitive partial match)
        const dentistNameLower = booking.dentistName.toLowerCase().replace('dr. ', '').replace('dr ', '');
        const matchedDentist = dentists.find(d => {
          const fullName = `${d.firstName} ${d.lastName}`.toLowerCase();
          return fullName.includes(dentistNameLower) || dentistNameLower.includes(fullName);
        });

        if (!matchedDentist) {
          const errorMessage = `I couldn't find a dentist named "${booking.dentistName}" in our system. Please check the name or browse our available dentists.`;
          const followUpResponse = await geminiService.chat(userId, errorMessage, context);
          
          return res.json({
            success: true,
            data: followUpResponse
          });
        }

        // Find the first available slot for this dentist
        // Start from specified date or today and check up to 30 days in the future
        let firstAvailableSlot = null;
        
        // Determine start date based on booking.date or default to today
        let startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        
        const wasSpecificDateRequested = !!booking.date;
        
        if (booking.date) {
          // If specific date provided, start from that date
          startDate = new Date(booking.date);
          startDate.setHours(0, 0, 0, 0);
          console.log(`📅 Using specified date: ${startDate.toDateString()}`);
        } else {
          console.log(`📅 No date specified, using today: ${startDate.toDateString()}`);
        }
        
        // Search for first available slot
        // If specific date was requested, only check that date. Otherwise search 30 days.
        const maxDaysToCheck = wasSpecificDateRequested ? 1 : 30;
        
        for (let daysAhead = 0; daysAhead < maxDaysToCheck && !firstAvailableSlot; daysAhead++) {
          const checkDate = new Date(startDate);
          checkDate.setDate(startDate.getDate() + daysAhead);
          
          // Get all appointments for this dentist on this day
          const startOfDay = new Date(checkDate);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(checkDate);
          endOfDay.setHours(23, 59, 59, 999);
          
          const existingAppointments = await prisma.appointment.findMany({
            where: {
              dentistId: matchedDentist.userId,
              appointmentDate: {
                gte: startOfDay,
                lte: endOfDay
              },
              status: { notIn: ['CANCELLED', 'COMPLETED'] }
            },
            orderBy: { startTime: 'asc' }
          });
          
          // Use centralized slot generation function
          const availableSlots = generateAvailableSlots(
            matchedDentist, 
            checkDate, 
            existingAppointments,
            { timePreference: booking.timePreference }
          );
          
          if (availableSlots.length > 0) {
            const slot = availableSlots[0]; // Get first available slot
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            
            // Format date as YYYY-MM-DD without timezone conversion
            const year = checkDate.getFullYear();
            const month = String(checkDate.getMonth() + 1).padStart(2, '0');
            const day = String(checkDate.getDate()).padStart(2, '0');
            const slotDateStr = `${year}-${month}-${day}`;
            
            firstAvailableSlot = {
              date: slotDateStr,
              time: slot.time,
              startTime: slot.startTime.toISOString(),
              endTime: slot.endTime.toISOString(),
              dentist: matchedDentist,
              dayOfWeek: dayNames[checkDate.getDay()],
              displayDate: checkDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })
            };
            console.log(`✅ Found slot on ${firstAvailableSlot.displayDate} (${slotDateStr}) at ${slot.time}`);
            break;
          }
        }
        
        if (firstAvailableSlot) {
          // Format time for display
          const timeHour = parseInt(firstAvailableSlot.time.split(':')[0]);
          const timeMinute = firstAvailableSlot.time.split(':')[1];
          const displayTime = timeHour > 12 
            ? `${timeHour - 12}:${timeMinute} PM` 
            : timeHour === 12 
            ? `12:${timeMinute} PM` 
            : `${timeHour}:${timeMinute} AM`;
          
          console.log(`✅ Formatted: ${firstAvailableSlot.displayDate} at ${displayTime} - Duration: ${matchedDentist.appointmentDuration} mins`);
          
          // Build a message for the AI to generate a nice response with booking JSON
          const foundSlotMessage = `The first available slot for ${booking.dentistName} is on ${firstAvailableSlot.displayDate} at ${displayTime}. Generate the appointment booking JSON with these details: dentistId=${firstAvailableSlot.dentist.userId}, date=${firstAvailableSlot.date}, startTime=${firstAvailableSlot.startTime}, endTime=${firstAvailableSlot.endTime}, time=${displayTime}`;
          
          const updatedContext = {
            ...context,
            firstAvailableSlot: {
              dentist: {
                userId: firstAvailableSlot.dentist.userId,
                name: `Dr. ${firstAvailableSlot.dentist.firstName} ${firstAvailableSlot.dentist.lastName}`,
                appointmentDuration: firstAvailableSlot.dentist.appointmentDuration
              },
              date: firstAvailableSlot.date,
              time: firstAvailableSlot.time,
              displayTime,
              displayDate: firstAvailableSlot.displayDate,
              startTime: firstAvailableSlot.startTime,
              endTime: firstAvailableSlot.endTime
            }
          };
          
          const followUpResponse = await geminiService.chat(userId, foundSlotMessage, updatedContext);
          
          // Remove the JSON block from the message shown to user
          let cleanMessage = followUpResponse.message;
          // Remove ```json...``` blocks
          cleanMessage = cleanMessage.replace(/```json[\s\S]*?```/g, '');
          // Remove standalone JSON objects
          cleanMessage = cleanMessage.replace(/\{[\s\S]*?"type"\s*:\s*"appointment_booking"[\s\S]*?\}/g, '');
          // Remove extra whitespace and ellipsis
          cleanMessage = cleanMessage.replace(/\.\.\.+/g, '').trim();
          
          followUpResponse.message = cleanMessage;
          followUpResponse.readyToBook = true;
          
          return res.json({
            success: true,
            data: {
              ...followUpResponse,
              firstAvailableSlot: updatedContext.firstAvailableSlot
            }
          });
        } else {
          // No slots found - provide specific error message based on context
          if (wasSpecificDateRequested) {
            const requestedDateDisplay = startDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
            const timePreferenceText = booking.timePreference ? ` in the ${booking.timePreference}` : '';
            
            const noSlotsMessage = `I'm sorry, but ${booking.dentistName} is not available on ${requestedDateDisplay}${timePreferenceText}. This could be because:
- They don't work on this day
- All time slots are fully booked
- The requested time is outside their working hours
- It's during their break time

Would you like me to:
1. Find their first available slot on any other day${booking.timePreference ? ' ' + booking.timePreference : ''}?
2. Check a different date?
3. Show you other available dentists for ${requestedDateDisplay}${timePreferenceText}?`;
            
            // Return message directly without AI paraphrasing to preserve detailed information
            return res.json({
              success: true,
              data: {
                message: noSlotsMessage,
                readyToBook: false
              }
            });
          } else {
            // No date specified, searched 30 days
            const timePreferenceText = booking.timePreference ? ` ${booking.timePreference} appointments` : ' appointments';
            const noSlotsMessage = `I'm sorry, but ${booking.dentistName} has no available${timePreferenceText} in the next 30 days. This could be because:
- Their schedule is fully booked
- They haven't set up working hours yet
- They don't work during the requested time period

Would you like me to:
1. Show you other available dentists?
2. Check availability beyond 30 days?
3. Remove the time preference filter${booking.timePreference ? ' (currently: ' + booking.timePreference + ')' : ''}?`;
            
            // Return message directly without AI paraphrasing to preserve detailed information
            return res.json({
              success: true,
              data: {
                message: noSlotsMessage,
                readyToBook: false
              }
            });
          }
        }
      }
      // Check if it's an availability check request
      else if (booking.type === 'check_availability' && booking.date && booking.time) {
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
                      status: { notIn: ['CANCELLED', 'COMPLETED'] },
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
          // No dentists available at the requested time
          const displayDate = requestedDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          
          // Convert time to 12-hour format for display
          const [hour24, min] = requestedTime.split(':');
          const hour12 = parseInt(hour24) > 12 ? parseInt(hour24) - 12 : (parseInt(hour24) === 0 ? 12 : parseInt(hour24));
          const ampm = parseInt(hour24) >= 12 ? 'PM' : 'AM';
          const displayTime = `${hour12}:${min} ${ampm}`;
          
          const noAvailabilityMessage = `I'm sorry, but no dentists are available at ${displayTime} on ${displayDate}. This time slot may be:
- Outside of working hours
- During a break time
- Already booked
- On a non-working day

Would you like me to:
1. Find the first available time on ${displayDate}?
2. Suggest alternative dates?
3. Show you all available dentists for a different time?`;
          
          return res.json({
            success: true,
            data: {
              message: noAvailabilityMessage,
              readyToBook: false
            }
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
    
    // Check if it's a Gemini API overload error
    if (error.status === 503) {
      return res.status(503).json({
        success: false,
        error: 'AI service is temporarily busy',
        message: 'Our AI assistant is experiencing high demand right now. Please try again in a few moments.',
        retryAfter: 3000 // Suggest retry after 3 seconds
      });
    }
    
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
        status: { notIn: ['CANCELLED', 'COMPLETED'] }
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

    console.log('Booking request received:', {
      dentistId,
      date,
      startTime,
      endTime,
      reason,
      userId,
      userRole: req.user.role
    });

    // Validate required fields
    if (!dentistId || !date || !startTime || !endTime) {
      console.error('❌ Missing required fields:', {
        dentistId: !!dentistId,
        date: !!date,
        startTime: !!startTime,
        endTime: !!endTime
      });
      return res.status(400).json({
        success: false,
        error: 'Missing required booking information. Please ensure dentist, date, and time are selected.'
      });
    }

    // Verify user is a patient
    if (req.user.role !== 'Patient') {
      console.error('❌ Non-patient user trying to book:', req.user.role);
      return res.status(403).json({
        success: false,
        error: 'Only patients can book appointments through the chatbot.'
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
      console.error('❌ Dentist not found:', dentistId);
      return res.status(404).json({
        success: false,
        error: 'The selected dentist could not be found. Please try selecting another dentist.'
      });
    }

    if (dentist.user.status !== 'ACTIVE') {
      console.error('❌ Dentist not active:', dentist.user.status);
      return res.status(400).json({
        success: false,
        error: 'The selected dentist is currently unavailable. Please choose another dentist.'
      });
    }

    const clinicId = dentist.clinicId;

    // Parse dates and validate
    const appointmentDate = new Date(date);
    if (isNaN(appointmentDate.getTime())) {
      console.error('❌ Invalid date format:', date);
      return res.status(400).json({
        success: false,
        error: 'Invalid date format. Please try booking again.'
      });
    }

    const startDateTime = new Date(startTime);
    if (isNaN(startDateTime.getTime())) {
      console.error('❌ Invalid start time format:', startTime);
      return res.status(400).json({
        success: false,
        error: 'Invalid time format. Please try booking again.'
      });
    }
    
    // Calculate end time based on dentist's appointment duration
    // This ensures we always use the correct duration from the database
    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + dentist.appointmentDuration);
    
    console.log('📅 Appointment timing:', {
      date: appointmentDate.toISOString().split('T')[0],
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      duration: dentist.appointmentDuration
    });

    // Check if the appointment time is in the past (not just the date)
    const now = new Date();
    if (startDateTime < now) {
      console.error('❌ Appointment in the past:', { startDateTime, now });
      return res.status(400).json({
        success: false,
        error: 'Cannot book appointments in the past. Please choose a future time slot.'
      });
    }

    // Validate against dentist's working hours
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = dayNames[appointmentDate.getDay()];
    
    if (dentist.workingHours && Array.isArray(dentist.workingHours)) {
      const daySchedule = dentist.workingHours.find(day => day.day === dayOfWeek);
      
      // Check if dentist works on this day
      if (!daySchedule || !daySchedule.isWorking || !daySchedule.start || !daySchedule.end || daySchedule.start === '' || daySchedule.end === '') {
        console.error('❌ Dentist does not work on this day:', { dayOfWeek, daySchedule });
        return res.status(400).json({
          success: false,
          error: `The dentist does not work on ${dayOfWeek}s. Please choose a different day.`
        });
      }
      
      // Check if time is within working hours
      const requestedTimeMinutes = startDateTime.getHours() * 60 + startDateTime.getMinutes();
      const [startHour, startMin] = daySchedule.start.split(':').map(Number);
      const [endHour, endMin] = daySchedule.end.split(':').map(Number);
      const workStartMinutes = startHour * 60 + startMin;
      const workEndMinutes = endHour * 60 + endMin;
      
      const appointmentEndMinutes = endDateTime.getHours() * 60 + endDateTime.getMinutes();
      
      if (requestedTimeMinutes < workStartMinutes || appointmentEndMinutes > workEndMinutes) {
        const workHoursDisplay = `${daySchedule.start} - ${daySchedule.end}`;
        console.error('❌ Time outside working hours:', { 
          requested: `${startDateTime.getHours()}:${startDateTime.getMinutes()}`, 
          workingHours: workHoursDisplay 
        });
        return res.status(400).json({
          success: false,
          error: `This time is outside the dentist's working hours. Working hours on ${dayOfWeek}: ${workHoursDisplay}`
        });
      }
      
      // Check if time falls during a break
      if (daySchedule.breaks && Array.isArray(daySchedule.breaks)) {
        for (const breakTime of daySchedule.breaks) {
          const [breakStartHour, breakStartMin] = breakTime.start.split(':').map(Number);
          const [breakEndHour, breakEndMin] = breakTime.end.split(':').map(Number);
          const breakStartMinutes = breakStartHour * 60 + breakStartMin;
          const breakEndMinutes = breakEndHour * 60 + breakEndMin;
          
          // Check if appointment overlaps with break
          if (requestedTimeMinutes < breakEndMinutes && appointmentEndMinutes > breakStartMinutes) {
            const breakDisplay = `${breakTime.start} - ${breakTime.end}`;
            console.error('❌ Time during break:', { 
              requested: `${startDateTime.getHours()}:${String(startDateTime.getMinutes()).padStart(2, '0')}`, 
              break: breakDisplay 
            });
            return res.status(400).json({
              success: false,
              error: `This time falls during the dentist's break (${breakDisplay}). Please choose a different time.`
            });
          }
        }
      }
    } else {
      // No working hours configured
      console.error('❌ Dentist has no working hours configured');
      return res.status(400).json({
        success: false,
        error: 'The dentist has not configured their working hours. Please contact the clinic or choose another dentist.'
      });
    }

    // Check for conflicting appointments
    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        dentistId: parseInt(dentistId),
        appointmentDate,
        status: { notIn: ['CANCELLED', 'COMPLETED'] },
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
      },
      select: {
        id: true,
        startTime: true,
        endTime: true
      }
    });

    if (conflictingAppointment) {
      const conflictTime = new Date(conflictingAppointment.startTime).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      console.error('❌ Time slot conflict:', {
        requested: startDateTime.toISOString(),
        conflict: conflictingAppointment.startTime.toISOString()
      });
      return res.status(409).json({
        success: false,
        error: `This time slot is no longer available. There's a conflicting appointment at ${conflictTime}. Please choose another time.`
      });
    }

    console.log('✅ No conflicts found, creating appointment...');

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
        message: `✓ Appointment requested successfully! Your consultation with Dr. ${dentistName} on ${dateTimeStr} is pending confirmation. You'll receive a notification once confirmed.`
      }
    });
    
    console.log('✅ Appointment booked successfully:', appointment.id);
  } catch (error) {
    console.error('❌ Book appointment error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'An error occurred while booking your appointment. Please try again or contact support.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
