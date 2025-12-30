import { useState, useRef, useEffect } from 'react';
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
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { isDarkMode } = useTheme();

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

  if (!isOpen) return null;

  return (
    <div className={`fixed bottom-4 right-4 w-96 h-[600px] rounded-lg shadow-2xl flex flex-col z-50 transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gray-800 border border-gray-700' 
        : 'bg-white border border-gray-200'
    }`}>
      {/* Header */}
      <div className={`p-4 rounded-t-lg flex items-center justify-between transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white' 
          : 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-2xl">
            🤖
          </div>
          <div>
            <h3 className="font-semibold text-lg">Dentify AI</h3>
            <p className="text-xs text-blue-100">Your dental assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleClearHistory}
            className="p-2 hover:bg-blue-600 rounded-full transition-colors"
            title="Clear chat history"
          >
            🗑️
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-600 rounded-full transition-colors text-xl"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className={`flex-1 overflow-y-auto p-4 space-y-4 transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'
      }`}>
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.sender === 'user'
                  ? isDarkMode
                    ? 'bg-purple-600 text-white'
                    : 'bg-teal-600 text-white'
                  : message.isError
                  ? isDarkMode
                    ? 'bg-red-900/50 text-red-200 border border-red-800'
                    : 'bg-red-50 text-red-800 border border-red-200'
                  : isDarkMode
                    ? 'bg-gray-800 text-gray-200 border border-gray-700'
                    : 'bg-white text-gray-800 border border-gray-200'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
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
              <p className="text-xs opacity-70 mt-1">
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
            <div className={`rounded-lg p-3 border ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={`p-4 border-t rounded-b-lg transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none transition-colors duration-300 ${
              isDarkMode 
                ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-purple-500' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-teal-500'
            }`}
            disabled={isLoading}
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !inputMessage.trim()}
            className={`px-4 py-2 rounded-lg disabled:cursor-not-allowed transition-colors font-medium ${
              isDarkMode 
                ? 'bg-purple-600 text-white hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500' 
                : 'bg-teal-600 text-white hover:bg-teal-700 disabled:bg-gray-300 disabled:text-gray-500'
            }`}
          >
            Send
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Powered by Google Gemini AI - Free & Private
        </p>
      </div>
    </div>
  );
};

export default AIChatbot;
