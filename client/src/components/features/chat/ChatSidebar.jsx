import { useState, useEffect, useRef } from 'react';
import { FiX, FiSearch, FiMessageCircle, FiMoreVertical, FiUserPlus, FiSend } from 'react-icons/fi';
import { useTheme } from '../../../contexts/ThemeContext';
import { useChat } from '../../../contexts/ChatContext';
import { authUtils } from '../../../utils/auth';
import { getImageUrl } from '../../../utils/helpers';
import LoadingSpinner from '../../common/states/LoadingSpinner';
import FindContactsModal from './FindContactsModal';
import ChatWindow from './ChatWindow';

const ChatSidebar = ({ isOpen, onClose }) => {
  const { isDarkMode } = useTheme();
  const { conversations, userId, startConversation, setActiveConversation, markConversationAsRead, isLoadingConversations } = useChat();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeChat, setActiveChat] = useState(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Close chat window and clear active conversation
  const handleCloseChat = () => {
    setActiveChat(null);
    setActiveConversation(null);
  };

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const token = authUtils.getAccessToken();
      const currentUser = authUtils.getCurrentUser();
      const currentUserRole = currentUser?.role?.toLowerCase();
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        const filteredUsers = Array.isArray(data) ? data.filter(u => {
          // Exclude current user
          if (u.id === userId) return false;
          
          // If current user is a patient, exclude other patients
          if (currentUserRole === 'patient' && u.role?.toLowerCase() === 'patient') {
            return false;
          }
          
          return true;
        }) : [];
        setUsers(filteredUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUserClick = async (user) => {
    try {
      const conversation = await startConversation(user.id);
      setActiveChat({ ...user, conversationId: conversation.id });
      setActiveConversation(conversation); // Set active conversation in context
      setIsSearchModalOpen(false);
      // Mark conversation as read when opening
      await markConversationAsRead(conversation.id);
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  const getOtherUserFromConversation = (conversation) => {
    const otherUserId = conversation.participants.find(id => id !== userId);
    return users.find(u => u.id === otherUserId);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed top-16 left-0 right-0 bottom-0 bg-black/30 backdrop-blur-sm z-40 transition-all duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-16 right-0 h-[calc(100vh-4rem)] w-96 z-50 transform transition-all duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } ${
          isDarkMode
            ? 'bg-linear-to-b from-gray-900 via-gray-900 to-gray-800 border-l border-gray-800'
            : 'bg-linear-to-b from-white via-gray-50 to-white border-l border-gray-200'
        } shadow-2xl`}
      >
        {/* Header */}
        <div className={`p-5 border-b flex items-center justify-between shrink-0 ${
          isDarkMode ? 'border-gray-800 bg-gray-900/50 backdrop-blur-sm' : 'border-gray-200 bg-white/50 backdrop-blur-sm'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-linear-to-br from-teal-500 via-cyan-500 to-blue-500 shadow-lg">
              <FiMessageCircle className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold bg-linear-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
              Chats
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2.5 rounded-xl transition-all duration-200 hover:scale-110 ${
              isDarkMode
                ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-300'
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-teal-500 dark:text-teal-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search conversations..."
                className={`w-full pl-11 pr-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 shadow-sm hover:shadow-md ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-teal-500/50 focus:border-teal-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-teal-500/50 focus:border-teal-500'
                }`}
              />
            </div>
            <button
              onClick={() => setIsSearchModalOpen(true)}
              className="p-3 rounded-xl transition-all duration-200 hover:scale-110 bg-linear-to-r from-teal-600 via-cyan-600 to-blue-600 text-white shadow-lg hover:shadow-xl"
              title="New Conversation"
            >
              <FiUserPlus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto min-h-0" style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#14b8a6 transparent'
        }}>
          {/* Loading State */}
          {isLoading || isLoadingConversations ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <LoadingSpinner size="lg" message="Loading chats..." />
            </div>
          ) : (
            <>
          {/* Recent Conversations */}
          {conversations.length > 0 ? (
            <div className="px-3 mb-4">
              <h3 className="text-xs font-bold uppercase mb-3 tracking-wider text-teal-600 dark:text-teal-400">
                Recent
              </h3>
              {conversations
                .filter(conversation => conversation.lastMessage) // Only show conversations with messages
                .map((conversation) => {
                const otherUser = getOtherUserFromConversation(conversation);
                if (!otherUser) return null;
                
                const isActiveChatOpen = activeChat?.conversationId === conversation.id;
                const unreadCount = conversation.unreadCount?.[userId] || 0;
                // Don't show unread count if this conversation is currently active
                const showUnreadCount = !isActiveChatOpen && unreadCount > 0;
                
                return (
                  <button
                    key={conversation.id}
                    onClick={() => handleUserClick(otherUser)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl mb-2 transition-all duration-200 hover:scale-[1.02] shadow-sm hover:shadow-md ${
                      isActiveChatOpen
                        ? isDarkMode
                          ? 'bg-linear-to-r from-teal-900/40 to-cyan-900/40 ring-2 ring-teal-500'
                          : 'bg-linear-to-r from-teal-50 to-cyan-50 ring-2 ring-teal-500'
                        : isDarkMode
                        ? 'hover:bg-gray-800/80'
                        : 'hover:bg-white'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      {otherUser.profileImage ? (
                        <img
                          src={getImageUrl(otherUser.profileImage)}
                          alt={otherUser.name}
                          className="w-13 h-13 rounded-full object-cover ring-2 ring-teal-100 dark:ring-teal-900"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : (
                        <div className="w-13 h-13 rounded-full bg-linear-to-br from-teal-500 via-cyan-500 to-blue-500 flex items-center justify-center shadow-lg ring-2 ring-teal-100 dark:ring-teal-900">
                          <span className="text-white font-bold text-base">
                            {otherUser.name?.[0]?.toUpperCase() || '?'}
                          </span>
                        </div>
                      )}
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 shadow-sm"></div>
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0 text-left flex flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`font-bold text-base break-words flex-1 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {otherUser.name}
                        </h4>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize shrink-0 ${
                          isDarkMode 
                            ? 'bg-teal-900/50 text-teal-300 border border-teal-700' 
                            : 'bg-teal-100 text-teal-700 border border-teal-200'
                        }`}>
                          {otherUser.role}
                        </span>
                      </div>
                      <p className={`text-xs truncate mt-1 ${
                        isDarkMode ? 'text-gray-500' : 'text-gray-500'
                      }`}>
                        {otherUser.email}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <p className={`text-sm truncate font-medium ${
                          showUnreadCount
                            ? 'text-gray-900 dark:text-white'
                            : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {conversation.lastMessage || 'Start chatting...'}
                        </p>
                        <div className="flex items-center gap-2 shrink-0">
                          {showUnreadCount && (
                            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-linear-to-r from-red-500 to-pink-600 text-white shadow-md animate-pulse">
                              {unreadCount}
                            </span>
                          )}
                          {conversation.lastMessageAt && (
                            <span className="text-xs font-medium text-teal-600 dark:text-teal-400">
                              {new Date(conversation.lastMessageAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className={`flex flex-col items-center justify-center h-full px-4 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-4 shadow-lg ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-gray-800 to-gray-700' 
                  : 'bg-gradient-to-br from-teal-100 to-cyan-100'
              }`}>
                <FiMessageCircle className={`w-10 h-10 ${
                  isDarkMode ? 'text-teal-400' : 'text-teal-600'
                }`} />
              </div>
              <p className={`text-sm text-center font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>No conversations yet</p>
              <p className={`text-xs text-center ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>Start chatting with someone!</p>
            </div>
          )}
            </>
          )}
        </div>

        {/* Active Chat Window (Mini) */}
        {activeChat && (
          <div className={`fixed bottom-4 right-100 w-80 h-125 rounded-2xl shadow-2xl z-50 overflow-hidden border-2 transform transition-all duration-300 ${
            isDarkMode ? 'bg-gray-800 border-teal-900' : 'bg-white border-teal-200'
          }`}>
            <ChatWindow user={activeChat} onClose={handleCloseChat} miniMode={true} />
          </div>
        )}
      </div>

      {/* Find Contacts Modal */}
      <FindContactsModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        users={users}
        onSelectUser={handleUserClick}
      />
    </>
  );
};

export default ChatSidebar;
