const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI for embeddings
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Knowledge base for appointment booking scenarios
const bookingKnowledgeBase = [
  {
    id: 'booking_first_available',
    scenario: 'Patient wants first available appointment',
    query: 'I want to book the earliest appointment available with any dentist',
    intent: 'find_first_available',
    keywords: ['first available', 'earliest', 'soonest', 'next available', 'any time', 'any dentist'],
    context: 'Patient is flexible with time and dentist. Check all dentists working hours and find the soonest slot.',
    tips: [
      'Check current date and time to avoid past slots',
      'Consider dentist working hours and breaks',
      'Check for existing appointments conflicts',
      'Use appointment duration from dentist profile'
    ]
  },
  {
    id: 'booking_specific_time',
    scenario: 'Patient requests specific time slot',
    query: 'I want to book an appointment tomorrow at 2 PM',
    intent: 'check_availability',
    keywords: ['tomorrow', 'next week', 'monday', 'tuesday', 'at', 'specific time', "o'clock"],
    context: 'Patient has a specific time in mind. Validate the time is within working hours and available.',
    tips: [
      'Parse the date and time carefully (handle tomorrow, next week, etc.)',
      'Check if requested time is in the past',
      'Verify dentist is working at that time',
      'Check for breaks during that time',
      'Confirm no conflicting appointments exist'
    ]
  },
  {
    id: 'booking_specific_dentist',
    scenario: 'Patient wants specific dentist',
    query: 'I want to book with Dr. Smith next Monday',
    intent: 'check_availability',
    keywords: ['dr.', 'doctor', 'dentist', 'with', 'specific dentist'],
    context: 'Patient prefers a specific dentist. Check only that dentist\'s availability.',
    tips: [
      'Fetch the requested dentist\'s working hours',
      'Check appointment duration for that dentist',
      'Consider the dentist\'s breaks',
      'Show only that dentist\'s available slots'
    ]
  },
  {
    id: 'booking_time_preference',
    scenario: 'Patient has time preference (morning/afternoon)',
    query: 'I need a morning appointment this week',
    intent: 'find_first_available',
    keywords: ['morning', 'afternoon', 'evening', 'night', 'before noon', 'after', 'lunch'],
    context: 'Patient prefers certain time of day. Filter slots accordingly.',
    tips: [
      'Morning: 8 AM - 12 PM',
      'Afternoon: 12 PM - 5 PM',
      'Evening: 5 PM - 9 PM',
      'Apply preference filter after checking availability'
    ]
  },
  {
    id: 'rescheduling',
    scenario: 'Patient wants to reschedule existing appointment',
    query: 'I need to change my appointment to a different day',
    intent: 'reschedule',
    keywords: ['reschedule', 'change', 'move', 'different time', 'different day', 'cancel and rebook'],
    context: 'Patient has existing appointment and needs new time.',
    tips: [
      'First identify which appointment to reschedule',
      'Check status is SCHEDULED (not completed/cancelled)',
      'Find new available slot',
      'Update appointment with new date/time'
    ]
  },
  {
    id: 'booking_urgent',
    scenario: 'Patient needs urgent appointment',
    query: 'I have a dental emergency, I need to see someone today',
    intent: 'find_first_available',
    keywords: ['emergency', 'urgent', 'today', 'now', 'asap', 'immediately', 'pain', 'hurts'],
    context: 'Patient needs immediate care. Prioritize today\'s slots.',
    tips: [
      'Filter for today\'s date only',
      'Start from current time forward',
      'Find the absolute earliest slot',
      'If no slots today, inform about emergency services'
    ]
  },
  {
    id: 'booking_treatment_specific',
    scenario: 'Patient needs specific treatment',
    query: 'I need a root canal treatment',
    intent: 'find_first_available',
    keywords: ['root canal', 'filling', 'cleaning', 'extraction', 'whitening', 'crown', 'bridge'],
    context: 'Patient needs specific treatment type. Find dentist who offers it.',
    tips: [
      'Check clinic\'s available treatments',
      'Consider treatment might require longer appointment',
      'Some treatments may need specialist dentist',
      'Provide treatment information if available'
    ]
  },
  {
    id: 'working_hours_validation',
    scenario: 'Understanding working hours format',
    query: 'How to check if dentist is working at specific time',
    intent: 'validation',
    keywords: ['working hours', 'schedule', 'hours', 'open', 'closed', 'business hours'],
    context: 'Working hours are stored as array of day objects with start/end times and breaks using day names.',
    tips: [
      'workingHours format: [{day: "Monday", start: "HH:MM", end: "HH:MM", breaks: [{start: "HH:MM", end: "HH:MM"}]}]',
      'day field uses day names: "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"',
      'start and end fields use 24-hour format (e.g., "09:00", "17:00")',
      'Check if slot falls within start and end times',
      'Exclude breaks from available time slots',
      'Compare times as minutes from midnight for accuracy',
      'Handle edge cases: overnight shifts, no working hours for specific day'
    ]
  },
  {
    id: 'timezone_handling',
    scenario: 'Proper timezone handling for appointments',
    query: 'How to handle date and time correctly',
    intent: 'technical',
    keywords: ['time', 'date', 'timezone', 'UTC', 'local time'],
    context: 'Always use local time components without timezone conversion to avoid date shifts.',
    tips: [
      'For date strings like "2026-01-15": Parse as components, create Date with new Date(year, month-1, day, hours, minutes, 0)',
      'NEVER use new Date("YYYY-MM-DD") directly as it may apply UTC offset',
      'Format: "YYYY-MM-DD" for dates, "YYYY-MM-DDTHH:mm:ss" for ISO timestamps',
      'When getting day of week: use getDay() on properly constructed local date',
      'For time comparisons: convert to minutes since midnight',
      'Example: "09:30" → (9 * 60 + 30) = 570 minutes',
      'Always validate parsed dates are not Invalid Date'
    ]
  },
  {
    id: 'appointment_conflicts',
    scenario: 'Checking for appointment conflicts',
    query: 'How to ensure no double booking',
    intent: 'validation',
    keywords: ['conflict', 'double book', 'overlap', 'busy', 'available'],
    context: 'Check database for overlapping appointments to prevent double booking.',
    tips: [
      'Query appointments for same dentist and date range',
      'Check overlap: (newStart < existingEnd) && (newEnd > existingStart)',
      'Use dentist.appointmentDuration to calculate slot end time',
      'Filter by status not equal to CANCELLED',
      'Compare times as Date objects for accuracy',
      'Include appointments with status: PENDING, CONFIRMED, SCHEDULED'
    ]
  },
  {
    id: 'duration_calculation',
    scenario: 'Calculating appointment end time from duration',
    query: 'How to properly calculate appointment end time',
    intent: 'technical',
    keywords: ['duration', 'end time', 'calculate', 'minutes', 'appointment length'],
    context: 'Each dentist has specific appointment duration that must be used for calculations. CRITICAL: Only use times that were provided by the system in requestedDateTime context.',
    tips: [
      '⚠️ CRITICAL: NEVER create your own start times - ONLY use times from requestedDateTime in context',
      '⚠️ The backend has already validated available slots - do NOT suggest different times',
      'Get dentist.appointmentDuration (usually 30, 45, or 60 minutes)',
      'Use EXACT startTime from requestedDateTime.time (this was already validated by backend)',
      'Parse start time to get hours and minutes',
      'Add duration to minutes: totalMinutes = startMinutes + duration',
      'Handle overflow: if totalMinutes >= 60, add hours and subtract 60 from minutes',
      'Example: 11:00 + 45 mins → 11 hrs, 0 mins + 45 → 11 hrs, 45 mins',
      'Example: 14:30 + 45 mins → 14 hrs, 30 mins + 45 → 14 hrs, 75 mins → 15 hrs, 15 mins',
      'Format result as "HH:MM" with zero padding',
      'Create ISO timestamp: date + "T" + formattedTime + ":00"',
      '⚠️ NEVER suggest times outside working hours, breaks, or past appointments'
    ]
  },
  {
    id: 'date_parsing_natural_language',
    scenario: 'Parsing natural language date expressions',
    query: 'How to convert tomorrow, next week, etc. to actual dates',
    intent: 'technical',
    keywords: ['tomorrow', 'today', 'next week', 'next monday', 'parse date', 'date conversion'],
    context: 'Users often use natural language for dates that need to be converted to YYYY-MM-DD format.',
    tips: [
      'Get current date: const today = new Date(); today.setHours(0, 0, 0, 0)',
      '"today" → use today',
      '"tomorrow" → add 1 day to today',
      '"next Monday/Tuesday/etc." → find next occurrence of that weekday',
      '"in X days" → add X days to today',
      'Always output as YYYY-MM-DD format',
      'Validate the resulting date is in the future',
      'Handle month boundaries correctly (e.g., Jan 31 + 1 day = Feb 1)'
    ]
  },
  {
    id: 'time_preference_filtering',
    scenario: 'Filtering slots by time preference (morning/afternoon/evening)',
    query: 'How to filter available slots by time of day',
    intent: 'technical',
    keywords: ['morning', 'afternoon', 'evening', 'time preference', 'filter slots'],
    context: 'Users may prefer certain times of day, which should filter available slots.',
    tips: [
      'Morning: 08:00-12:00 (8 AM to noon)',
      'Afternoon: 12:00-17:00 (noon to 5 PM)',
      'Evening: 17:00-21:00 (5 PM to 9 PM)',
      'Filter slots after checking working hours and conflicts',
      'Respect dentist working hours boundaries',
      'If preference is "morning" but dentist starts at 13:00, no slots available',
      'Return empty array if no slots match preference'
    ]
  }
];

class RAGService {
  constructor() {
    this.model = genAI.getGenerativeModel({ model: 'embedding-001' });
    this.knowledgeBase = bookingKnowledgeBase;
    this.embeddingsCache = new Map();
    this.useEmbeddings = true; // Try embeddings first, fallback to keywords
  }

  /**
   * Generate embedding for a text query
   */
  async generateEmbedding(text) {
    if (!this.useEmbeddings) return null;
    
    try {
      const result = await this.model.embedContent(text);
      return result.embedding.values;
    } catch (error) {
      if (error.status === 429 || error.status === 400) {
        console.log('⚠️ Embedding API unavailable, switching to keyword matching');
        this.useEmbeddings = false;
        return null;
      }
      console.error('Error generating embedding:', error);
      this.useEmbeddings = false;
      return null;
    }
  }

  /**
   * Keyword-based matching (fallback when embeddings unavailable)
   */
  keywordMatch(query, item) {
    const lowerQuery = query.toLowerCase();
    let score = 0;
    
    // Check each keyword
    item.keywords.forEach(keyword => {
      if (lowerQuery.includes(keyword.toLowerCase())) {
        score += 1;
      }
    });
    
    // Bonus for matching scenario or context
    if (lowerQuery.includes(item.scenario.toLowerCase().split(' ').slice(0, 3).join(' '))) {
      score += 0.5;
    }
    
    // Normalize score (0-1 range)
    return Math.min(score / (item.keywords.length * 0.7), 1.0);
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  cosineSimilarity(vecA, vecB) {
    if (vecA.length !== vecB.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Retrieve relevant context from knowledge base
   */
  async retrieveContext(query, topK = 3) {
    try {
      // Try embeddings first
      if (this.useEmbeddings) {
        const queryEmbedding = await this.generateEmbedding(query);
        
        if (queryEmbedding) {
          // Use embeddings
          const similarities = await Promise.all(
            this.knowledgeBase.map(async (item) => {
              let itemEmbedding;
              
              if (this.embeddingsCache.has(item.id)) {
                itemEmbedding = this.embeddingsCache.get(item.id);
              } else {
                const combinedText = `${item.scenario} ${item.query} ${item.context}`;
                itemEmbedding = await this.generateEmbedding(combinedText);
                if (itemEmbedding) {
                  this.embeddingsCache.set(item.id, itemEmbedding);
                }
              }
              
              const similarity = this.cosineSimilarity(queryEmbedding, itemEmbedding);
              
              return { item, similarity };
            })
          );
          
          return similarities
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, topK);
        }
      }
      
      // Fallback to keyword matching
      console.log('📝 Using keyword-based matching for RAG');
      const scores = this.knowledgeBase.map(item => ({
        item,
        similarity: this.keywordMatch(query, item)
      }));
      
      return scores
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, topK);
      
    } catch (error) {
      console.error('Error retrieving context:', error);
      return [];
    }
  }

  /**
   * Get enhanced context for appointment booking
   */
  async getBookingContext(userMessage) {
    const relevantContext = await this.retrieveContext(userMessage, 3);
    
    // Format context for AI
    let contextText = '\n=== RELEVANT BOOKING KNOWLEDGE ===\n';
    
    relevantContext.forEach((match, index) => {
      if (match.similarity > 0.3) { // Lower threshold for keyword matching
        contextText += `\n${index + 1}. ${match.item.scenario}\n`;
        contextText += `   Context: ${match.item.context}\n`;
        contextText += `   Tips:\n`;
        match.item.tips.forEach(tip => {
          contextText += `   - ${tip}\n`;
        });
      }
    });
    
    contextText += '\n=== END KNOWLEDGE ===\n';
    
    return contextText;
  }

  /**
   * Add new booking scenario to knowledge base
   */
  async addScenario(scenario) {
    this.knowledgeBase.push(scenario);
    // Clear cache to regenerate embeddings
    this.embeddingsCache.clear();
  }

  /**
   * Get all scenarios of specific type
   */
  getScenariosByIntent(intent) {
    return this.knowledgeBase.filter(item => item.intent === intent);
  }
}

// Export singleton instance
module.exports = new RAGService();
