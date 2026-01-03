/**
 * Example Client-Side Implementation for Chatbot Appointment Booking
 * 
 * This file demonstrates how to integrate the chatbot appointment booking
 * feature in your React/JavaScript frontend application.
 */

// ============================================
// 1. CHATBOT SERVICE MODULE
// ============================================

class ChatbotService {
  constructor(apiBaseUrl, authToken) {
    this.apiBaseUrl = apiBaseUrl;
    this.authToken = authToken;
  }

  /**
   * Send a message to the chatbot
   */
  async sendMessage(message) {
    const response = await fetch(`${this.apiBaseUrl}/api/chatbot/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`
      },
      body: JSON.stringify({ message })
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    return await response.json();
  }

  /**
   * Get available dentists
   */
  async getAvailableDentists(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await fetch(
      `${this.apiBaseUrl}/api/chatbot/available-dentists?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${this.authToken}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch dentists');
    }

    return await response.json();
  }

  /**
   * Get available time slots for a dentist
   */
  async getAvailableSlots(dentistId, date) {
    const params = new URLSearchParams({ dentistId, date });
    const response = await fetch(
      `${this.apiBaseUrl}/api/chatbot/available-slots?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${this.authToken}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch time slots');
    }

    return await response.json();
  }

  /**
   * Book an appointment
   */
  async bookAppointment(bookingData) {
    const response = await fetch(`${this.apiBaseUrl}/api/chatbot/book-appointment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`
      },
      body: JSON.stringify(bookingData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to book appointment');
    }

    return await response.json();
  }
}

// ============================================
// 2. REACT COMPONENT EXAMPLE
// ============================================

import React, { useState } from 'react';

const ChatbotAppointmentBooking = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [pendingBooking, setPendingBooking] = useState(null);
  const [suggestedDentists, setSuggestedDentists] = useState([]);
  const [loading, setLoading] = useState(false);

  // Initialize service (get token from your auth context/store)
  const chatbot = new ChatbotService(
    process.env.REACT_APP_API_URL,
    localStorage.getItem('authToken')
  );

  /**
   * Send message to chatbot
   */
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Add user message to chat
    const userMessage = { role: 'user', content: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      // Send to chatbot
      const response = await chatbot.sendMessage(inputMessage);

      // Add AI response to chat
      const aiMessage = {
        role: 'assistant',
        content: response.data.message
      };
      setMessages(prev => [...prev, aiMessage]);

      // Check if appointment booking detected
      if (response.data.appointmentBooking) {
        handleAppointmentIntent(response.data);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'error',
        content: 'Sorry, something went wrong. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle appointment booking intent
   */
  const handleAppointmentIntent = (data) => {
    const booking = data.appointmentBooking;

    // If complete booking info with dentist
    if (booking.dentistId && booking.date && booking.startTime && booking.endTime) {
      setPendingBooking(booking);
      // Show confirmation UI
    }
    // If suggested dentists provided
    else if (data.suggestedDentists) {
      setSuggestedDentists(data.suggestedDentists);
      setPendingBooking(booking);
      // Show dentist selection UI
    }
  };

  /**
   * Select a dentist from suggestions
   */
  const handleSelectDentist = async (dentist) => {
    // Update pending booking with selected dentist
    const updatedBooking = {
      ...pendingBooking,
      dentistId: dentist.userId
    };
    setPendingBooking(updatedBooking);
    setSuggestedDentists([]);

    // Confirm with user
    const confirmMessage = `You selected Dr. ${dentist.name}. Would you like to confirm this appointment?`;
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: confirmMessage
    }]);
  };

  /**
   * Confirm and book the appointment
   */
  const handleConfirmBooking = async () => {
    if (!pendingBooking) return;

    setLoading(true);
    try {
      const result = await chatbot.bookAppointment(pendingBooking);

      if (result.success) {
        // Show success message
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: result.data.message
        }]);

        // Clear pending booking
        setPendingBooking(null);

        // Optionally navigate to appointments page
        // navigate('/appointments');
      }
    } catch (error) {
      console.error('Booking error:', error);
      setMessages(prev => [...prev, {
        role: 'error',
        content: error.message || 'Failed to book appointment. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cancel booking
   */
  const handleCancelBooking = () => {
    setPendingBooking(null);
    setSuggestedDentists([]);
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: 'Booking cancelled. How else can I help you?'
    }]);
  };

  return (
    <div className="chatbot-container">
      {/* Chat Messages */}
      <div className="messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
        {loading && <div className="message loading">Thinking...</div>}
      </div>

      {/* Dentist Selection UI */}
      {suggestedDentists.length > 0 && (
        <div className="dentist-selection">
          <h4>Select a Dentist:</h4>
          {suggestedDentists.map((dentist) => (
            <button
              key={dentist.userId}
              onClick={() => handleSelectDentist(dentist)}
              className="dentist-option"
            >
              <strong>{dentist.name}</strong>
              <span>{dentist.specialization.join(', ')}</span>
              <span>{dentist.clinic} - {dentist.city}</span>
            </button>
          ))}
        </div>
      )}

      {/* Booking Confirmation UI */}
      {pendingBooking && !suggestedDentists.length && (
        <div className="booking-confirmation">
          <h4>Confirm Appointment</h4>
          <p>Date: {pendingBooking.date}</p>
          <p>Time: {new Date(pendingBooking.startTime).toLocaleTimeString()}</p>
          <p>Reason: {pendingBooking.reason}</p>
          <div className="actions">
            <button onClick={handleConfirmBooking} disabled={loading}>
              Confirm Booking
            </button>
            <button onClick={handleCancelBooking}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="input-form">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type a message or say 'book appointment'..."
          disabled={loading}
        />
        <button type="submit" disabled={loading || !inputMessage.trim()}>
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatbotAppointmentBooking;

// ============================================
// 3. EXAMPLE USAGE SCENARIOS
// ============================================

/**
 * EXAMPLE 1: Simple booking request
 * 
 * User: "I want to book an appointment"
 * Bot: "I'd be happy to help! When would you like to come in?"
 * User: "Next Monday at 2pm"
 * Bot: "Great! What's the reason for your visit?"
 * User: "General checkup"
 * Bot: "Perfect! Let me find available dentists..." [Shows suggestions]
 */

/**
 * EXAMPLE 2: Complete request
 * 
 * User: "Book me with Dr. Ahmed on January 15th at 10am for a cleaning"
 * Bot: "I'll book that appointment for you..." [Shows confirmation]
 */

/**
 * EXAMPLE 3: Specialized treatment
 * 
 * User: "I need braces consultation"
 * Bot: "I can help with that! When would work for you?"
 * User: "This Friday afternoon"
 * Bot: "For orthodontics, I recommend these specialists..." [Shows orthodontists]
 */

// ============================================
// 4. CSS EXAMPLE
// ============================================

const exampleCSS = `
.chatbot-container {
  display: flex;
  flex-direction: column;
  height: 600px;
  max-width: 500px;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f5f5f5;
}

.message {
  margin-bottom: 15px;
  padding: 10px 15px;
  border-radius: 8px;
  max-width: 80%;
}

.message.user {
  background: #007bff;
  color: white;
  margin-left: auto;
}

.message.assistant {
  background: white;
  color: #333;
}

.message.error {
  background: #dc3545;
  color: white;
}

.dentist-selection {
  padding: 15px;
  border-top: 1px solid #ddd;
  background: white;
}

.dentist-option {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 12px;
  margin: 8px 0;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.dentist-option:hover {
  background: #f0f0f0;
  border-color: #007bff;
}

.booking-confirmation {
  padding: 15px;
  border-top: 1px solid #ddd;
  background: #e8f4f8;
}

.input-form {
  display: flex;
  padding: 15px;
  border-top: 1px solid #ddd;
  background: white;
}

.input-form input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-right: 10px;
}

.input-form button {
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.input-form button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
`;
