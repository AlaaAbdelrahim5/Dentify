import { useState } from 'react';

const ChatbotButton = ({ onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full shadow-2xl hover:shadow-blue-500/50 hover:scale-110 transition-all duration-300 flex items-center justify-center z-40 group"
      title="Chat with Dentify AI"
    >
      <span className="text-3xl">
        {isHovered ? '💬' : '🤖'}
      </span>
      
      {/* Notification badge (optional - can be used for unread messages) */}
      {/* <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
        3
      </span> */}
      
      {/* Pulse animation */}
      <span className="absolute inset-0 rounded-full bg-blue-600 animate-ping opacity-20"></span>
      
      {/* Tooltip */}
      {isHovered && (
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap">
          Chat with AI Assistant
          <div className="absolute top-full right-6 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </button>
  );
};

export default ChatbotButton;
