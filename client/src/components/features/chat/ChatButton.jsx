import { useChat } from '../../../contexts/ChatContext';
import { FiMessageCircle } from 'react-icons/fi';
import { useTheme } from '../../../contexts/ThemeContext';

const ChatButton = ({ onClick }) => {
  const { totalUnreadCount } = useChat();
  const { isDarkMode } = useTheme();

  return (
    <button
      onClick={onClick}
      className={`relative p-2.5 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 group ${
        isDarkMode 
          ? 'hover:bg-gradient-to-br from-blue-500/20 to-cyan-500/20 hover:shadow-lg hover:shadow-blue-500/20' 
          : 'hover:bg-gradient-to-br from-blue-50 to-cyan-50 hover:shadow-md'
      }`}
      title="Messages"
    >
      <div className={`relative transition-all duration-200 ${
        isDarkMode
          ? 'text-gray-400 group-hover:text-blue-400'
          : 'text-gray-600 group-hover:text-blue-600'
      }`}>
        <FiMessageCircle className="w-6 h-6" strokeWidth={2.5} />
        {totalUnreadCount > 0 && (
          <>
            {/* Animated ping effect */}
            <span className="absolute -top-1 -right-1 flex h-5 w-5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 opacity-75"></span>
              <span className="relative inline-flex items-center justify-center rounded-full h-5 w-5 bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-[10px] font-bold shadow-lg ring-2 ring-white dark:ring-gray-800">
                {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
              </span>
            </span>
          </>
        )}
      </div>
    </button>
  );
};

export default ChatButton;
