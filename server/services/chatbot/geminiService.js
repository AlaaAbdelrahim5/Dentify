const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini AI with API key from environment
// Get your free API key from: https://makersuite.google.com/app/apikey
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'YOUR_FREE_API_KEY_HERE');

class GeminiService {
  constructor() {
    this.model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    this.conversationHistory = new Map(); // Store conversation history per user
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
2. Help patients book appointments
3. Provide treatment education and post-care instructions
4. Answer questions about dental procedures
5. Provide general dental health advice

Important guidelines:
- Be professional, friendly, and empathetic
- For medical emergencies, always advise to call emergency services or visit immediately
- For specific medical advice, recommend consulting with their dentist
- When booking appointments, ask for: preferred date, time, and reason for visit
- Keep responses concise and helpful
- Use simple language that patients can understand

Available appointment time slots:
- Monday to Friday: 9:00 AM - 5:00 PM
- Saturday: 9:00 AM - 2:00 PM
- Closed on Sundays

Common treatments available:
- General checkup and cleaning
- Tooth filling
- Root canal treatment
- Tooth extraction
- Dental crowns and bridges
- Teeth whitening
- Orthodontics (braces)
- Dental implants

If a patient wants to book an appointment, respond with a JSON object in this format:
{
  "type": "appointment_booking",
  "data": {
    "date": "YYYY-MM-DD",
    "time": "HH:MM",
    "reason": "reason for visit"
  }
}

Otherwise, provide helpful conversational responses.`;
  }

  /**
   * Chat with the AI assistant
   */
  async chat(userId, userMessage, context = {}) {
    try {
      const history = this.getConversationHistory(userId);
      
      // Build the full prompt with context
      let fullPrompt = this.buildSystemPrompt() + "\n\n";
      
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
      // Check if message contains JSON for appointment booking
      const jsonMatch = message.match(/\{[\s\S]*"type":\s*"appointment_booking"[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        if (data.type === 'appointment_booking' && data.data) {
          return data.data;
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
}

// Singleton instance
const geminiService = new GeminiService();

module.exports = geminiService;
