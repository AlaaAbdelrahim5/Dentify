const { GoogleGenerativeAI } = require("@google/generative-ai");
const ragService = require('./ragService');

// Initialize Gemini AI with API key from environment
// Get your free API key from: https://makersuite.google.com/app/apikey
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'YOUR_FREE_API_KEY_HERE');

class GeminiService {
  constructor() {
    this.model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    this.conversationHistory = new Map(); // Store conversation history per user
    this.ragService = ragService;
  }

  /**
   * Get or create conversation history for a user
   */
  getConversationHistory(userId) {
    if (!this.conversationHistory.has(userId)) {
      this.conversationHistory.set(userId, []);
    }
    return this.conversationHistory.get(userId);
  }

  /**
   * Clear conversation history for a user
   */
  clearConversationHistory(userId) {
    this.conversationHistory.delete(userId);
  }

  /**
   * Build context prompt with dental clinic information
   */
  buildSystemPrompt() {
    return `You are Dentify AI Assistant, a helpful and friendly chatbot for a dental clinic management system.

Your capabilities:
1. Answer common dental FAQs (appointments, treatments, dental care)
2. Help patients book appointments (Consultations)
3. Provide treatment education and post-care instructions
4. Answer questions about dental procedures
5. Provide general dental health advice

Important guidelines:
- Be professional, friendly, and empathetic
- For medical emergencies, always advise to call emergency services or visit immediately
- For specific medical advice, recommend consulting with their dentist
- Keep responses concise and helpful
- Use simple language that patients can understand

## APPOINTMENT BOOKING PROCESS FOR PATIENTS ##

**INTELLIGENT BOOKING WORKFLOW:**

**Step 1: Analyze Booking Intent & Extract Information**
When a patient wants to book an appointment, FIRST extract all information they've already provided:

**Date Parsing - Be Smart:**
- "tomorrow" → Add 1 day to TODAY'S DATE (January 4, 2026)
- "today" → Use TODAY'S DATE
- "next Monday/Tuesday/etc." → Calculate next occurrence of that day
- "January 5" or "Jan 5" → Use that date in current year
- "in 3 days" → Add 3 days to current date
- ALWAYS output date as YYYY-MM-DD format

**Time Parsing - Handle Natural Language:**
- "morning" / "in the morning" → Find slots between 8:00-12:00
- "afternoon" / "in the afternoon" → Find slots between 12:00-17:00  
- "evening" → Find slots between 17:00-20:00
- "2 PM" / "2pm" / "14:00" → Use exact time (convert PM: add 12 except for 12 PM)
- If time preference given (morning/afternoon/evening), use "find_first_available" with that preference

**Dentist Preference:**
- Extract any dentist name mentioned (e.g., "Dr. Ala'a Abdelrahim", "Dr. Smith")
- Note: If dentist name + time preference given → use find_first_available with dentist filter

**SCENARIO A - First Available with Optional Filters:**
If patient wants "first available", "earliest", "soonest", "ASAP", "as soon as possible", "next available" OR gives only a time preference (morning/afternoon/evening):

**CRITICAL: When patient says "tomorrow" + time preference, YOU MUST include the date field!**

Examples:
- "tomorrow afternoon" → date: "2026-01-05", timePreference: "afternoon"
- "tomorrow morning" → date: "2026-01-05", timePreference: "morning"
- "next Monday afternoon" → date: (calculate next Monday), timePreference: "afternoon"
- "afternoon" (without date) → timePreference: "afternoon" (omit date to search from today)

\`\`\`json
{
  "type": "find_first_available",
  "dentistName": "Dr. Name" (if specified, otherwise omit),
  "timePreference": "afternoon" (if specified: morning/afternoon/evening),
  "date": "2026-01-05" (REQUIRED if date mentioned like "tomorrow", otherwise omit)
}
\`\`\`

Then say: "Let me find the [first available / earliest afternoon] slot [for Dr. Name / with any dentist] [on DATE]..."

**SCENARIO B - Specific Date & Time Given:**
If patient provides a specific time (like "2 PM", "14:00"):

\`\`\`json
{
  "type": "check_availability",
  "date": "2026-01-15",
  "time": "14:00"
}
\`\`\`

**SCENARIO C - Missing Information:**
ONLY if patient hasn't provided enough information, ask specifically for what's missing:
- Missing date: "When would you like to schedule your appointment?"
- Missing time/preference: "What time works best for you? (or morning/afternoon/evening)"
- Do NOT ask questions if information was already provided in their message!

**Step 2A: When First Available Slot is Found**
(Only after find_first_available request)
You will receive a message with the **FIRST AVAILABLE SLOT FOUND** details.

Use those EXACT values to create the booking JSON immediately:

\`\`\`json
{
  "type": "appointment_booking",
  "dentistId": [use userId from FIRST AVAILABLE SLOT],
  "date": [use date from FIRST AVAILABLE SLOT in YYYY-MM-DD format],
  "startTime": [use startTime from FIRST AVAILABLE SLOT],
  "endTime": [use endTime from FIRST AVAILABLE SLOT],
  "reason": "Consultation",
  "time": [use displayTime from FIRST AVAILABLE SLOT]
}
\`\`\`

After the JSON, say: "Perfect! I've found the first available slot for [dentist name] on [displayDate] at [displayTime]. Please click the 'Confirm Booking' button to complete your appointment."

DO NOT recalculate times - use the EXACT values provided in the context.

**Step 2B: When Available Dentists List is Received**
You will receive a message like: "Available dentists for [date] at [time]: 1. Dr. X (ID: 123) - ... (Duration: 30 minutes)"

DO NOT output any JSON at this point!
Simply present the dentists nicely and ask patient to select:

"Here are the available dentists for [date] at [time]:

1. Dr. [Name] - [Specializations]
   Clinic: [Clinic Name], [City]

2. Dr. [Name] - [Specializations]
   Clinic: [Clinic Name], [City]

Please select which dentist you'd like to see by telling me the doctor's name or number."

**Step 3: When Patient Selects Dentist**

2. Dr. [Name] - [Specializations]
   Clinic: [Clinic Name], [City]

Please select which dentist you'd like to see by telling me the doctor's name or number."

**Step 3: When Patient Selects Dentist**
Look for the dentist name or number in the patient's response.
Match it to one from the available list (check the context for availableDentists or AVAILABLE DENTISTS FOR BOOKING).

CRITICAL - EXTRACT THESE FROM THE MATCHED DENTIST:
- dentistId: the userId field from the matched dentist
- appointmentDuration: the appointmentDuration or Duration field from the matched dentist (MUST use the exact value from the list above)

EXAMPLE WITH DR. ALA'A ABDELRAHIM:
If the list shows "Name: Dr. Ala'a Abdelrahim, ID: 5, Duration: 45 minutes"
Then: dentistId = 5, appointmentDuration = 45

IMPORTANT TIME CALCULATION STEPS:
1. Get the date from requestedDateTime.date or REQUESTED APPOINTMENT TIME (e.g., "2026-01-15")
2. Get the time from requestedDateTime.time or REQUESTED APPOINTMENT TIME (e.g., "11:00")
3. Create startTime: date + "T" + time + ":00" (e.g., "2026-01-15T11:00:00")
4. Calculate end time by adding appointmentDuration minutes:
   - Extract hours and minutes from start time
   - Add appointmentDuration to minutes
   - If minutes >= 60: add 1 to hours, subtract 60 from minutes
   - Format as: date + "T" + padded_hours + ":" + padded_minutes + ":00"

CONCRETE CALCULATION EXAMPLE:
- Start time: "11:00" (11 hours, 0 minutes)
- Duration: 45 minutes
- Calculation: 0 + 45 = 45 minutes, hours stay 11
- End time: "11:45" → "2026-01-15T11:45:00"

ANOTHER EXAMPLE:
- Start time: "14:30" (14 hours, 30 minutes)
- Duration: 45 minutes
- Calculation: 30 + 45 = 75 minutes → 75 >= 60, so hours = 14 + 1 = 15, minutes = 75 - 60 = 15
- End time: "15:15" → "2026-01-15T15:15:00"

VERIFY YOUR CALCULATION:
- If duration is 45 min and start is 11:00, end MUST be 11:45 (NOT 11:30)
- If duration is 30 min and start is 11:00, end MUST be 11:30
- If duration is 60 min and start is 14:00, end MUST be 15:00

Output ONLY this JSON:

\`\`\`json
{
  "type": "appointment_booking",
  "dentistId": 123,
  "date": "2026-01-15",
  "startTime": "2026-01-15T11:00:00",
  "endTime": "2026-01-15T11:45:00",
  "reason": "Consultation",
  "time": "11:00 AM"
}
\`\`\`

After the JSON, convert the time to 12-hour format with AM/PM and say ONLY: "Perfect! Please click the 'Confirm Booking' button to complete your appointment at [TIME in AM/PM format]."

Examples of time conversion:
- 11:00 → 11:00 AM
- 14:00 → 2:00 PM
- 09:30 → 9:30 AM
- 16:45 → 4:45 PM
- 12:00 → 12:00 PM (noon)
- 00:00 → 12:00 AM (midnight)

STOP THERE. Do not add any more text. Do not mention dashboard, appointments page, or any other navigation.

**Step 6: Booking Completed**
The frontend will handle the actual booking API call when the patient clicks "Confirm Booking".
You don't need to respond after the JSON is sent - the system will automatically show a success or error message.

**ABSOLUTELY FORBIDDEN:**
- NEVER say "go to the Appointments page"  
- NEVER say "go to your dashboard"
- NEVER say "complete the booking process"
- NEVER redirect users anywhere
- The booking happens RIGHT HERE in the chat with the Confirm Booking button

**IMPORTANT:** Never tell patients to go to another page. The booking happens right here in the chat.

**CRITICAL RULES:**
- ALWAYS use "Consultation" as the reason
- NEVER show raw JSON to users except in code blocks as specified above
- When showing dentist list, format it nicely - NO JSON
- Use the SPECIFIC dentist's appointment duration, not a default value
- Extract dentistId from availableDentists in context by matching the patient's selection
- Calculate end time correctly: startTime + appointmentDuration minutes
- Never redirect users to appointments page - booking happens in chat

**DURATION CALCULATION EXAMPLES:**
- Dr. A has 30 min duration, start 10:00 → end 10:30
- Dr. B has 45 min duration, start 11:00 → end 11:45
- Dr. C has 60 min duration, start 14:00 → end 15:00
- Dr. D has 45 min duration, start 13:30 → end 14:15

For non-booking questions, provide helpful conversational responses without JSON.`;
  }

  /**
   * Chat with the AI assistant
   */
  async chat(userId, userMessage, context = {}) {
    try {
      const history = this.getConversationHistory(userId);
      
      // Get RAG context for appointment booking queries
      let ragContext = '';
      if (this.isBookingRelated(userMessage)) {
        ragContext = await this.ragService.getBookingContext(userMessage);
        console.log('📚 RAG Context Retrieved for booking query');
      }
      
      // Build the full prompt with context
      let fullPrompt = this.buildSystemPrompt() + "\n\n";
      
      // Add RAG context if available
      if (ragContext) {
        fullPrompt += ragContext;
      }
      
      // Add user context if available
      if (context.userName) {
        fullPrompt += `User's name: ${context.userName}\n`;
      }
      if (context.userRole) {
        fullPrompt += `User's role: ${context.userRole}\n`;
      }
      if (context.upcomingAppointments) {
        fullPrompt += `User has ${context.upcomingAppointments} upcoming appointment(s)\n`;
      }
            // Add recent appointments history for patients
      if (context.recentAppointments && context.recentAppointments.length > 0) {
        fullPrompt += `\nRecent appointments:\n`;
        context.recentAppointments.forEach((apt, idx) => {
          const dentistName = apt.dentist ? `Dr. ${apt.dentist.firstName} ${apt.dentist.lastName}` : 'Unknown';
          const treatment = apt.treatment?.treatmentName || 'General checkup';
          fullPrompt += `${idx + 1}. ${new Date(apt.appointmentDate).toLocaleDateString()} - ${dentistName} - ${treatment} (${apt.status})\n`;
        });
      }
      
      // Add system database information
      if (context.systemData) {
        if (context.systemData.clinics && context.systemData.clinics.length > 0) {
          fullPrompt += `\nAvailable clinics in our system:\n`;
          context.systemData.clinics.forEach((clinic, idx) => {
            fullPrompt += `${idx + 1}. ${clinic.name} - ${clinic.city}`;
            if (clinic.location) fullPrompt += ` (${clinic.location})`;
            if (clinic.phone) fullPrompt += ` - Phone: ${clinic.phone}`;
            fullPrompt += '\n';
            if (clinic.description) fullPrompt += `   ${clinic.description}\n`;
          });
        }
        
        if (context.systemData.dentists && context.systemData.dentists.length > 0) {
          fullPrompt += `\nAvailable dentists in our system:\n`;
          context.systemData.dentists.forEach((dentist, idx) => {
            fullPrompt += `${idx + 1}. ${dentist.name}`;
            if (dentist.specialization && dentist.specialization.length > 0) {
              fullPrompt += ` - Specialization: ${dentist.specialization.join(', ')}`;
            }
            if (dentist.clinic) fullPrompt += ` - Works at: ${dentist.clinic}`;
            if (dentist.city) fullPrompt += ` - Location: ${dentist.city}`;
            fullPrompt += '\n';
          });
        }
        
        if (context.systemData.treatments && context.systemData.treatments.length > 0) {
          fullPrompt += `\nAvailable treatments:\n`;
          context.systemData.treatments.forEach((treatment, idx) => {
            fullPrompt += `${idx + 1}. ${treatment.name}`;
            if (treatment.description) fullPrompt += ` - ${treatment.description}`;
            fullPrompt += '\n';
          });
        }
      }
      
      fullPrompt += `\nIMPORTANT: Use the above real data from our system when answering questions about clinics, dentists, treatments, or appointments. Provide specific names, locations, and details from our database.\n`;
      
      // Add first available slot information if present
      if (context.firstAvailableSlot) {
        fullPrompt += `\n**FIRST AVAILABLE SLOT FOUND:**\n`;
        fullPrompt += `Dentist: ${context.firstAvailableSlot.dentist.name} (ID: ${context.firstAvailableSlot.dentist.userId})\n`;
        fullPrompt += `Date: ${context.firstAvailableSlot.displayDate} (${context.firstAvailableSlot.date})\n`;
        fullPrompt += `Time: ${context.firstAvailableSlot.displayTime} (${context.firstAvailableSlot.time})\n`;
        fullPrompt += `Start Time: ${context.firstAvailableSlot.startTime}\n`;
        fullPrompt += `End Time: ${context.firstAvailableSlot.endTime}\n`;
        fullPrompt += `Duration: ${context.firstAvailableSlot.dentist.appointmentDuration} minutes\n`;
        fullPrompt += `\nGenerate the appointment_booking JSON with these EXACT values. Do NOT recalculate the times.\n`;
      }
      
      // Add available dentists for booking if present
      if (context.availableDentists && context.availableDentists.length > 0) {
        fullPrompt += `\n**AVAILABLE DENTISTS FOR BOOKING:**\n`;
        context.availableDentists.forEach((dentist, idx) => {
          fullPrompt += `${idx + 1}. Name: ${dentist.name}, ID: ${dentist.userId}, Duration: ${dentist.appointmentDuration} minutes, Specialization: ${dentist.specialization.join(', ')}, Clinic: ${dentist.clinic}, City: ${dentist.city}\n`;
        });
        fullPrompt += `\nWhen patient selects a dentist, extract the appointmentDuration from the above list and use it to calculate the end time.\n`;
      }
      
      // Add requested date/time for booking if present
      if (context.requestedDateTime) {
        fullPrompt += `\n**REQUESTED APPOINTMENT TIME:**\n`;
        fullPrompt += `Date: ${context.requestedDateTime.date}\n`;
        fullPrompt += `Time: ${context.requestedDateTime.time}\n`;
        fullPrompt += `Day: ${context.requestedDateTime.dayOfWeek}\n`;
      }
      
            // Add conversation history
      if (history.length > 0) {
        fullPrompt += "\nConversation history:\n";
        history.forEach((msg) => {
          fullPrompt += `${msg.role === 'user' ? 'Patient' : 'Assistant'}: ${msg.content}\n`;
        });
      }
      
      fullPrompt += `\nPatient: ${userMessage}\nAssistant:`;

      // Generate response
      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      const aiMessage = response.text();

      // Store in conversation history (keep last 10 messages to manage token usage)
      history.push({ role: 'user', content: userMessage });
      history.push({ role: 'assistant', content: aiMessage });
      
      if (history.length > 20) {
        history.splice(0, history.length - 20);
      }

      // Check if response contains appointment booking intent
      const appointmentBooking = this.extractAppointmentIntent(aiMessage);

      return {
        message: aiMessage,
        appointmentBooking,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Gemini AI Error:', error);
      
      // Fallback response
      return {
        message: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment, or contact our clinic directly for immediate assistance.",
        error: true,
        timestamp: new Date()
      };
    }
  }

  /**
   * Extract appointment booking intent from AI response
   */
  extractAppointmentIntent(message) {
    try {
      // Check if message contains JSON for appointment booking or availability check
      // Match JSON block that may be in code blocks or plain text
      const jsonMatch = message.match(/```json\s*\n?([\s\S]*?)```/) || 
                        message.match(/\{[\s\S]*?"type"\s*:\s*"(appointment_booking|check_availability|find_first_available)"[\s\S]*?\}/);
      
      if (jsonMatch) {
        // Extract JSON string (either from code block or direct match)
        const jsonString = jsonMatch[1] || jsonMatch[0];
        const data = JSON.parse(jsonString.trim());
        
        if (data.type === 'appointment_booking' || data.type === 'check_availability' || data.type === 'find_first_available') {
          // Return the data directly if it's already properly formatted
          if (data.dentistId || data.dentistName || data.date || data.time) {
            return data;
          }
          // Otherwise return nested data object for backward compatibility
          if (data.data) {
            return data.data;
          }
          return data;
        }
      }
    } catch (error) {
      // Not a JSON response, just regular conversation
    }
    return null;
  }

  /**
   * Get dental FAQ response
   */
  async getDentalFAQ(question) {
    try {
      const prompt = `${this.buildSystemPrompt()}\n\nPatient Question: ${question}\n\nProvide a helpful, accurate answer about this dental topic:`;
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      return {
        question,
        answer: response.text(),
        timestamp: new Date()
      };
    } catch (error) {
      console.error('FAQ Error:', error);
      return {
        question,
        answer: "I'm sorry, I couldn't process your question. Please try rephrasing it or contact our clinic directly.",
        error: true,
        timestamp: new Date()
      };
    }
  }

  /**
   * Get treatment information
   */
  async getTreatmentInfo(treatmentName) {
    try {
      const prompt = `${this.buildSystemPrompt()}\n\nProvide detailed information about this dental treatment: ${treatmentName}\n\nInclude:
1. What the treatment is
2. When it's needed
3. What to expect during the procedure
4. Post-care instructions
5. Typical duration and recovery time

Keep it informative but easy to understand for patients.`;
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      return {
        treatment: treatmentName,
        information: response.text(),
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Treatment Info Error:', error);
      return {
        treatment: treatmentName,
        information: "I'm sorry, I couldn't retrieve information about this treatment right now. Please consult with your dentist for details.",
        error: true,
        timestamp: new Date()
      };
    }
  }

  /**
   * Get post-care instructions
   */
  async getPostCareInstructions(treatmentType) {
    try {
      const prompt = `${this.buildSystemPrompt()}\n\nProvide detailed post-care instructions for patients who just had: ${treatmentType}\n\nInclude:
1. What to do immediately after treatment
2. Pain management tips
3. Foods to avoid
4. When to contact the dentist
5. Expected healing timeline
6. Warning signs to watch for

Be clear, specific, and reassuring.`;
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      return {
        treatmentType,
        instructions: response.text(),
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Post-Care Error:', error);
      return {
        treatmentType,
        instructions: "Please contact your dentist for specific post-care instructions for your treatment.",
        error: true,
        timestamp: new Date()
      };
    }
  }

  /**
   * Check if message is related to appointment booking
   */
  isBookingRelated(message) {
    const bookingKeywords = [
      'book', 'appointment', 'schedule', 'visit', 'dentist', 
      'available', 'slot', 'time', 'date', 'tomorrow', 'today',
      'next', 'first', 'earliest', 'reschedule', 'change', 'cancel',
      'when can i', 'when is', 'available times', 'free slots'
    ];
    
    const lowerMessage = message.toLowerCase();
    return bookingKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  /**
   * Analyze dental X-ray image using AI Vision
   * @param {string} imageData - Base64 encoded image or image URL
   * @param {string} imagingType - Type of X-ray (e.g., 'Panoramic X-Ray', 'CBCT', etc.)
   * @returns {Promise<Object>} Analysis results with detected problems and recommendations
   */
  async analyzeXRayImage(imageData, imagingType = 'Dental X-Ray') {
    try {
      console.log('Analyzing X-ray image with AI Vision...');
      
      // Try OpenAI GPT-4 Vision first (more reliable)
      if (process.env.OPENAI_API_KEY) {
        return await this.analyzeWithOpenAI(imageData, imagingType);
      }
      
      // Fallback to Gemini (if working)
      try {
        const visionModel = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
        return await this.analyzeWithGemini(visionModel, imageData, imagingType);
      } catch (geminiError) {
        console.warn('Gemini Vision failed, using intelligent mock analysis:', geminiError.message);
        // Use intelligent mock analysis based on image type
        return this.generateIntelligentMockAnalysis(imagingType);
      }
      
    } catch (error) {
      console.error('X-ray Analysis Error:', error);
      
      return {
        success: false,
        error: error.message || 'Failed to analyze X-ray image',
        analysis: 'Unable to analyze the X-ray image at this time. Please ensure the image is clear and in a supported format (JPEG, PNG). For a definitive diagnosis, please consult with your dentist.',
        imagingType,
        analyzedAt: new Date().toISOString()
      };
    }
  }

  /**
   * Analyze with OpenAI GPT-4 Vision
   */
  async analyzeWithOpenAI(imageData, imagingType) {
    const OpenAI = require('openai');
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    console.log('=== OpenAI Vision Analysis ===');
    console.log('Image data type:', imageData.substring(0, 50) + '...');
    console.log('Image data length:', imageData.length);

    // Prepare image URL
    let imageUrl;
    if (imageData.startsWith('data:')) {
      imageUrl = imageData; // GPT-4 Vision supports data URLs
      console.log('Using base64 data URL');
    } else if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
      imageUrl = imageData;
      console.log('Using HTTP URL:', imageUrl.substring(0, 100));
    } else {
      throw new Error('Invalid image data format');
    }

    const prompt = `You are a dental education assistant helping students learn to read X-rays.

DESCRIBE what you observe in this dental X-ray image as an educational exercise:

1. **Visual Description**: Describe what structures are visible (teeth, bone, etc.)
2. **Notable Features**: Point out any interesting features for educational purposes
3. **Image Characteristics**: Comment on the image quality and type
4. **Educational Observations**: What would a dental student notice in this image?

This is for EDUCATIONAL PURPOSES ONLY - describe what you see in the image for learning.`;

    console.log('Sending request to OpenAI GPT-4o...');

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a dental education assistant. Describe dental X-ray images for educational purposes. Always describe what you actually see in images provided to you."
        },
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { 
              type: "image_url", 
              image_url: { 
                url: imageUrl,
                detail: "high"
              } 
            }
          ]
        }
      ],
      max_tokens: 1500
    });

    console.log('OpenAI response received');
    console.log('Response length:', response.choices[0].message.content.length);

    const analysisText = response.choices[0].message.content;
    
    console.log('X-ray analysis completed successfully with OpenAI');
    
    return {
      success: true,
      analysis: analysisText,
      imagingType,
      analyzedAt: new Date().toISOString(),
      provider: 'OpenAI GPT-4 Vision'
    };
  }

  /**
   * Analyze with Gemini Vision (fallback)
   */
  async analyzeWithGemini(visionModel, imageData, imagingType) {
      // Prepare the image part
      let imagePart;
      
      if (imageData.startsWith('data:')) {
        // Base64 data URI
        const base64Data = imageData.split(',')[1];
        const mimeType = imageData.match(/data:([^;]+);/)?.[1] || 'image/jpeg';
        
        imagePart = {
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        };
      } else if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
        // URL - we need to fetch and convert to base64
        const response = await fetch(imageData);
        const arrayBuffer = await response.arrayBuffer();
        const base64Data = Buffer.from(arrayBuffer).toString('base64');
        const contentType = response.headers.get('content-type') || 'image/jpeg';
        
        imagePart = {
          inlineData: {
            data: base64Data,
            mimeType: contentType
          }
        };
      } else {
        throw new Error('Invalid image data format');
      }
      
      // Create detailed prompt for dental X-ray analysis
      const prompt = `You are an expert dental radiologist AI assistant. Analyze this ${imagingType} dental X-ray image and provide a comprehensive analysis.

**Your analysis should include:**

1. **Image Quality Assessment**: Comment on the clarity, exposure, and technical quality of the X-ray.

2. **Anatomical Structures**: Identify visible dental and oral structures (teeth, bone, sinuses, etc.).

3. **Detected Problems**: Carefully examine and list any potential dental issues such as:
   - Cavities (caries) or tooth decay
   - Bone loss or periodontal disease
   - Impacted teeth
   - Root canal issues or infections
   - Fractures or cracks
   - Abnormal growths or lesions
   - TMJ problems
   - Sinus issues
   - Missing teeth or dental work
   - Any other abnormalities

4. **Recommendations**: Suggest appropriate follow-up actions or treatments based on findings.

5. **Urgency Level**: Rate as LOW, MODERATE, or HIGH based on findings.

**IMPORTANT GUIDELINES:**
- Be thorough but clear in your analysis
- Use professional but understandable language
- If the image quality is poor or you cannot detect issues, state that clearly
- Always recommend consulting with a dentist for definitive diagnosis
- Include location details (upper/lower jaw, tooth numbers if possible)
- Be objective and evidence-based

Format your response as a structured analysis with clear sections.`;

      const result = await visionModel.generateContent([prompt, imagePart]);
      const response = await result.response;
      const analysisText = response.text();
      
      console.log('X-ray analysis completed successfully with Gemini');
      
      return {
        success: true,
        analysis: analysisText,
        imagingType,
        analyzedAt: new Date().toISOString(),
        provider: 'Google Gemini Vision'
      };
  }

  /**
   * Generate intelligent mock analysis when AI services are unavailable
   */
  generateIntelligentMockAnalysis(imagingType) {
    const analyses = {
      'Panoramic X-Ray': `## Image Quality Assessment
This panoramic X-ray provides a comprehensive view of the entire oral cavity, showing both upper and lower jaws.

## Anatomical Structures Identified
- Full dental arch visible (upper and lower)
- Maxillary and mandibular bones
- TMJ (temporomandibular joints) bilaterally
- Maxillary sinuses
- Nasal cavity

## Observations
**Note**: This is a simulated analysis. For accurate diagnosis, please have a qualified dentist review the actual X-ray image.

Common findings that dentists look for in panoramic X-rays:
- Overall bone density and health
- Tooth positioning and alignment
- Presence of all teeth or any missing teeth
- Wisdom teeth status (impacted or erupted)
- Sinus health
- TMJ condition

## Recommendations
✓ Schedule a comprehensive dental examination
✓ Discuss any symptoms or concerns with your dentist
✓ Regular check-ups every 6 months

## Urgency Level: MODERATE
Regular dental consultation recommended for proper evaluation.

---
**Medical Disclaimer**: This is a demonstration analysis. Always consult with a licensed dentist for actual diagnosis and treatment planning.`,

      'X-Ray': `## Image Quality Assessment
Standard dental X-ray image received for analysis.

## General Observations
**Note**: This is a simulated analysis. For accurate diagnosis, please have a qualified dentist review the actual X-ray image.

Typical areas examined in dental X-rays:
- Tooth structure and integrity
- Root health
- Bone levels around teeth
- Presence of decay
- Previous dental work condition

## Recommendations
✓ Professional dental examination required
✓ Discuss findings with your dentist
✓ Follow preventive care guidelines

## Urgency Level: LOW to MODERATE
Schedule regular dental check-up for proper evaluation.

---
**Medical Disclaimer**: This is a demonstration analysis. Always consult with a licensed dentist for actual diagnosis and treatment planning.`,

      'CBCT': `## Image Quality Assessment
CBCT (Cone Beam Computed Tomography) provides 3D imaging of dental structures.

## Advanced Imaging Analysis
**Note**: This is a simulated analysis. CBCT scans require specialist interpretation.

CBCT scans are used to evaluate:
- Bone structure and density in 3D
- Implant planning
- Root canal anatomy
- Airway assessment
- TMJ evaluation
- Pathology detection

## Recommendations
✓ Consultation with oral surgeon or specialist
✓ Detailed treatment planning based on 3D data
✓ Follow-up as recommended by specialist

## Urgency Level: MODERATE
Specialist consultation recommended for proper 3D analysis.

---
**Medical Disclaimer**: This is a demonstration analysis. CBCT scans require specialist interpretation.`
    };

    const defaultAnalysis = analyses['X-Ray'];
    const selectedAnalysis = analyses[imagingType] || defaultAnalysis;

    return {
      success: true,
      analysis: selectedAnalysis,
      imagingType,
      analyzedAt: new Date().toISOString(),
      provider: 'Demo Analysis (AI services unavailable)',
      isDemo: true
    };
  }
}

// Singleton instance
const geminiService = new GeminiService();

module.exports = geminiService;
