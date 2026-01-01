import { useState, useRef, useEffect } from 'react';
import { HiOutlineSparkles } from 'react-icons/hi';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  sendChatMessage, 
  getTreatmentInfo, 
  getPostCareInstructions,
  clearChatHistory 
} from '../../services/chatbotService';

const AIChatbot = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm your Dentify AI Assistant. I can help you with:\n\n• Booking appointments\n• Answering dental questions\n• Treatment information\n• Post-care instructions\n\nHow can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { isDarkMode } = useTheme();

  // Handle open/close animation
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage = {
      id: messages.length + 1,
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await sendChatMessage(messageText);
      
      const botMessage = {
        id: messages.length + 2,
        text: response.data.message,
        sender: 'bot',
        timestamp: new Date(response.data.timestamp),
        appointmentBooking: response.data.appointmentBooking
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: messages.length + 2,
        text: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        sender: 'bot',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmBooking = (appointmentDetails) => {
    // Show confirmation message
    const confirmMessage = {
      id: messages.length + 1,
      text: `Great! I'll help you book this appointment:\n\nDate: ${appointmentDetails.date}\nTime: ${appointmentDetails.time}\nReason: ${appointmentDetails.reason}\n\nPlease go to the Appointments page in your dashboard to complete the booking process.`,
      sender: 'bot',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, confirmMessage]);
  };



  const handleClearHistory = async () => {
    if (confirm('Are you sure you want to clear the chat history?')) {
      try {
        await clearChatHistory();
        setMessages([
          {
            id: 1,
            text: "Chat history cleared! How can I help you today?",
            sender: 'bot',
            timestamp: new Date()
          }
        ]);
      } catch (error) {
        console.error('Failed to clear history:', error);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 200); // Wait for animation to complete
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed bottom-6 right-6 w-[420px] h-[650px] rounded-2xl flex flex-col z-50 transition-all duration-300 ${
        isAnimating ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
      } overflow-hidden`}
      style={{
        boxShadow: isDarkMode 
          ? '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(75, 85, 99, 0.3)'
          : '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(229, 231, 235, 0.5)',
        background: isDarkMode 
          ? 'linear-gradient(to bottom, #1F2937, #111827)' 
          : 'linear-gradient(to bottom, #FFFFFF, #F9FAFB)'
      }}
    >
      {/* Header */}
      <div 
        className="p-5 flex items-center justify-between text-white relative overflow-hidden"
        style={{
          background: isDarkMode
            ? 'linear-gradient(135deg, #0D9488 0%, #06B6D4 100%)'
            : 'linear-gradient(135deg, #14B8A6 0%, #06B6D4 100%)'
        }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl transform translate-x-20 -translate-y-20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full blur-2xl transform -translate-x-10 translate-y-10"></div>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-white/30">
            <HiOutlineSparkles className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-xl tracking-tight">Dentify AI</h3>
            <p className="text-xs text-white/80 font-medium">Your dental assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-2 relative z-10">
          <button
            onClick={handleClearHistory}
            className="w-9 h-9 hover:bg-white/20 rounded-xl transition-all duration-200 flex items-center justify-center backdrop-blur-sm active:scale-95"
            title="Clear chat history"
          >
            <span className="text-lg">🗑️</span>
          </button>
          <button
            onClick={handleClose}
            className="w-9 h-9 hover:bg-white/20 rounded-xl transition-all duration-200 flex items-center justify-center backdrop-blur-sm active:scale-95"
            title="Close"
          >
            <span className="text-2xl font-light leading-none">×</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div 
        className="flex-1 overflow-y-auto p-5 space-y-3.5"
        style={{
          background: isDarkMode 
            ? 'linear-gradient(to bottom, #111827, #0F172A)' 
            : 'linear-gradient(to bottom, #F9FAFB, #F3F4F6)'
        }}
      >
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className="max-w-[85%] rounded-2xl p-3.5 shadow-sm"
              style={{
                ...(message.sender === 'user'
                  ? {
                      background: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)',
                      color: 'white',
                      boxShadow: '0 4px 6px -1px rgba(20, 184, 166, 0.3), 0 2px 4px -1px rgba(20, 184, 166, 0.2)'
                    }
                  : message.isError
                  ? {
                      backgroundColor: isDarkMode ? '#7F1D1D' : '#FEE2E2',
                      color: isDarkMode ? '#FCA5A5' : '#991B1B',
                      border: `1px solid ${isDarkMode ? '#991B1B' : '#FECACA'}`
                    }
                  : {
                      backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                      color: isDarkMode ? '#E5E7EB' : '#1F2937',
                      border: `1px solid ${isDarkMode ? '#374151' : '#E5E7EB'}`,
                      boxShadow: isDarkMode ? 'none' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                    })
              }}
            >
              <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">{message.text}</p>
              {message.appointmentBooking && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-xs font-semibold mb-1">Appointment Details:</p>
                  <p className="text-xs">Date: {message.appointmentBooking.date}</p>
                  <p className="text-xs">Time: {message.appointmentBooking.time}</p>
                  <p className="text-xs">Reason: {message.appointmentBooking.reason}</p>
                  <button 
                    onClick={() => handleConfirmBooking(message.appointmentBooking)}
                    className="mt-2 text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                  >
                    Confirm Booking
                  </button>
                </div>
              )}
              <p className="text-[11px] mt-2 font-medium" style={{ opacity: 0.6 }}>
                {new Date(message.timestamp).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div 
              className="rounded-2xl p-4 shadow-sm"
              style={{
                backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                border: `1px solid ${isDarkMode ? '#374151' : '#E5E7EB'}`
              }}
            >
              <div className="flex space-x-1.5">
                <div className="w-2.5 h-2.5 rounded-full animate-bounce" style={{ backgroundColor: '#14B8A6' }}></div>
                <div className="w-2.5 h-2.5 rounded-full animate-bounce" style={{ backgroundColor: '#14B8A6', animationDelay: '0.1s' }}></div>
                <div className="w-2.5 h-2.5 rounded-full animate-bounce" style={{ backgroundColor: '#14B8A6', animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div 
        className="p-5 border-t"
        style={{
          backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
          borderColor: isDarkMode ? '#374151' : '#E5E7EB'
        }}
      >
        <div className="flex gap-2.5">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 rounded-xl focus:outline-none transition-all duration-200 text-[15px]"
            style={{
              backgroundColor: isDarkMode ? '#111827' : '#F9FAFB',
              border: `2px solid ${isDarkMode ? '#374151' : '#E5E7EB'}`,
              color: isDarkMode ? '#FFFFFF' : '#111827',
              boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#14B8A6';
              e.target.style.boxShadow = '0 0 0 3px rgba(20, 184, 166, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = isDarkMode ? '#374151' : '#E5E7EB';
              e.target.style.boxShadow = 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)';
            }}
            disabled={isLoading}
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !inputMessage.trim()}
            className="px-5 py-3 rounded-xl disabled:cursor-not-allowed transition-all duration-200 font-semibold text-[15px] active:scale-95"
            style={{
              background: (isLoading || !inputMessage.trim()) 
                ? (isDarkMode ? '#374151' : '#D1D5DB')
                : 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)',
              color: 'white',
              boxShadow: (isLoading || !inputMessage.trim())
                ? 'none'
                : '0 4px 6px -1px rgba(20, 184, 166, 0.3), 0 2px 4px -1px rgba(20, 184, 166, 0.2)'
            }}
          >
            Send
          </button>
        </div>
        <p className="text-[11px] mt-3 text-center font-medium" style={{ color: isDarkMode ? '#6B7280' : '#9CA3AF' }}>
          Powered by <span style={{ color: '#14B8A6', fontWeight: '600' }}>Google Gemini AI</span> - Free & Private
        </p>
      </div>
    </div>
  );
};

export default AIChatbot;
