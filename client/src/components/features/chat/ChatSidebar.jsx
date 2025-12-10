import { useState, useEffect, useRef } from 'react';
import { FiX, FiSearch, FiMessageCircle, FiMoreVertical, FiUserPlus, FiSend } from 'react-icons/fi';
import { useTheme } from '../../../contexts/ThemeContext';
import { useChat } from '../../../contexts/ChatContext';
import { authUtils } from '../../../utils/auth';
import { getImageUrl } from '../../../utils/helpers';

const ChatSidebar = ({ isOpen, onClose }) => {
  const { isDarkMode } = useTheme();
  const { conversations, userId, startConversation, setActiveConversation, markConversationAsRead } = useChat();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeChat, setActiveChat] = useState(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [contactSearchTerm, setContactSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
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
    }
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredContacts = users.filter(user =>
    user.name?.toLowerCase().includes(contactSearchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(contactSearchTerm.toLowerCase())
  );

  const handleUserClick = async (user) => {
    try {
      const conversation = await startConversation(user.id);
      setActiveChat({ ...user, conversationId: conversation.id });
      setIsSearchModalOpen(false);
      setContactSearchTerm('');
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
          className="fixed top-16 left-0 right-0 bottom-0 bg-black/20 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-16 right-0 h-[calc(100vh-4rem)] w-96 z-50 transform transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } ${
          isDarkMode
            ? 'bg-gray-900 border-l border-gray-800'
            : 'bg-white border-l border-gray-200'
        } shadow-2xl`}
      >
        {/* Header */}
        <div className={`p-4 border-b flex items-center justify-between ${
          isDarkMode ? 'border-gray-800' : 'border-gray-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'
            }`}>
              <FiMessageCircle className={`w-5 h-5 ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
            <h2 className={`text-lg font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Chats
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
              isDarkMode
                ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-300'
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <FiSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search conversations..."
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-blue-500/50 focus:border-blue-500'
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-blue-500/50 focus:border-blue-500'
                }`}
              />
            </div>
            <button
              onClick={() => setIsSearchModalOpen(true)}
              className={`p-2.5 rounded-xl transition-all duration-200 hover:scale-110 bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg hover:shadow-xl`}
              title="New Conversation"
            >
              <FiUserPlus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {/* Recent Conversations */}
          {conversations.length > 0 ? (
            <div className="px-4 mb-4">
              <h3 className={`text-xs font-bold uppercase mb-2 ${
                isDarkMode ? 'text-gray-500' : 'text-gray-500'
              }`}>
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
                    className={`w-full flex items-center gap-3 p-3 rounded-xl mb-2 transition-all duration-200 hover:scale-[1.02] ${
                      isActiveChatOpen
                        ? isDarkMode
                          ? 'bg-blue-500/20'
                          : 'bg-blue-50'
                        : isDarkMode
                        ? 'hover:bg-gray-800'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      {otherUser.profileImage ? (
                        <img
                          src={getImageUrl(otherUser.profileImage)}
                          alt={otherUser.name}
                          className="w-12 h-12 rounded-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {otherUser.name?.[0]?.toUpperCase() || '?'}
                          </span>
                        </div>
                      )}
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className={`font-semibold truncate ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {otherUser.name}
                          </h4>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                            isDarkMode
                              ? 'bg-gray-700 text-gray-400'
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            {otherUser.role}
                          </span>
                        </div>
                        {conversation.lastMessageAt && (
                          <span className={`text-xs ${
                            isDarkMode ? 'text-gray-500' : 'text-gray-500'
                          }`}>
                            {new Date(conversation.lastMessageAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <p className={`text-xs truncate ${
                        isDarkMode ? 'text-gray-500' : 'text-gray-500'
                      }`}>
                        {otherUser.email}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <p className={`text-sm truncate ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {conversation.lastMessage || 'Start chatting...'}
                        </p>
                        {showUnreadCount && (
                          <span className="ml-2 px-2 py-0.5 text-xs font-bold rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                            {unreadCount}
                          </span>
                        )}
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
              <FiMessageCircle className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-sm text-center mb-6">No conversations yet. Start chatting with someone!</p>
            </div>
          )}
        </div>

        {/* Active Chat Window (Mini) */}
        {activeChat && (
          <div className={`fixed bottom-4 right-[25rem] w-80 h-[500px] rounded-2xl shadow-2xl z-50 overflow-hidden ${
            isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}>
            <ChatWindow user={activeChat} onClose={() => setActiveChat(null)} />
          </div>
        )}
      </div>

      {/* Search Contacts Modal */}
      {isSearchModalOpen && (
        <>
          {/* Modal Overlay */}
          <div
            className="fixed top-16 left-0 right-0 bottom-0 bg-black/50 z-[60] backdrop-blur-sm"
            onClick={() => {
              setIsSearchModalOpen(false);
              setContactSearchTerm('');
            }}
          />
          
          {/* Modal Content */}
          <div style={{ top: 'calc(50vh + 2rem)' }} className={`fixed left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[480px] max-h-[600px] rounded-2xl shadow-2xl z-[70] ${
            isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}>
              {/* Modal Header */}
              <div className={`p-4 border-b flex items-center justify-between ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500`}>
                    <FiUserPlus className="w-5 h-5 text-white" />
                  </div>
                  <h2 className={`text-lg font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Find Contacts
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setIsSearchModalOpen(false);
                    setContactSearchTerm('');
                  }}
                  className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                    isDarkMode
                      ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300'
                      : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Search Input */}
              <div className="p-4">
                <div className="relative">
                  <FiSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <input
                    type="text"
                    value={contactSearchTerm}
                    onChange={(e) => setContactSearchTerm(e.target.value)}
                    placeholder="Search by name or email..."
                    autoFocus
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500/50 focus:border-blue-500'
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-blue-500/50 focus:border-blue-500'
                    }`}
                  />
                </div>
              </div>

              {/* Contacts List */}
              <div className="overflow-y-auto max-h-[450px] px-4 pb-4">
                {filteredContacts.length === 0 ? (
                  <div className={`flex flex-col items-center justify-center py-12 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    <FiSearch className="w-12 h-12 mb-3 opacity-30" />
                    <p className="text-sm">
                      {contactSearchTerm ? 'No contacts found' : 'Start typing to search contacts'}
                    </p>
                  </div>
                ) : (
                  filteredContacts.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleUserClick(user)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl mb-2 transition-all duration-200 hover:scale-[1.02] ${
                        isDarkMode
                          ? 'hover:bg-gray-700'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        {user.profileImage ? (
                          <img
                            src={getImageUrl(user.profileImage)}
                            alt={user.name}
                            className="w-12 h-12 rounded-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextElementSibling.style.display = 'flex';
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {user.name?.[0]?.toUpperCase() || '?'}
                            </span>
                          </div>
                        )}
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1 min-w-0 text-left">
                        <h4 className={`font-semibold truncate ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {user.name}
                        </h4>
                        <p className={`text-sm truncate ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {user.email}
                        </p>
                      </div>

                      {/* Role Badge */}
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        isDarkMode
                          ? 'bg-gray-700 text-gray-400'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {user.role}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </>
        )}
    </>
  );
};

// Mini Chat Window Component
const ChatWindow = ({ user, onClose }) => {
  const { isDarkMode } = useTheme();
  const { messages, sendChatMessage, activeConversation, userId, markConversationAsRead } = useChat();
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mark messages as read when viewing the conversation
  useEffect(() => {
    if (activeConversation?.id) {
      markConversationAsRead(activeConversation.id);
    }
  }, [activeConversation?.id]);

  const handleSend = async () => {
    if (!messageText.trim()) return;
    
    try {
      await sendChatMessage(messageText);
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Debug: Log messages
  useEffect(() => {
    console.log('ChatWindow - Messages:', messages);
    console.log('ChatWindow - Active conversation:', activeConversation);
    console.log('ChatWindow - User ID:', userId);
  }, [messages, activeConversation, userId]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={`p-3 flex items-center justify-between flex-shrink-0 ${
        isDarkMode
          ? 'bg-gradient-to-r from-blue-600 to-cyan-600'
          : 'bg-gradient-to-r from-blue-500 to-cyan-500'
      }`}>
        <div className="flex items-center gap-3">
          {user.profileImage ? (
            <img
              src={getImageUrl(user.profileImage)}
              alt={user.name}
              className="w-9 h-9 rounded-full object-cover border-2 border-white/30"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'flex';
              }}
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {user.name?.[0]?.toUpperCase() || '?'}
              </span>
            </div>
          )}
          <div>
            <h3 className="text-white font-bold text-sm">{user.name}</h3>
            <p className="text-white/80 text-xs capitalize">{user.role}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-white"
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className={`flex flex-col items-center justify-center h-full ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <FiMessageCircle className="w-12 h-12 mb-2 opacity-50" />
            <p className="text-sm">Start your conversation</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.senderId === userId ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-2xl ${
                    message.senderId === userId
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-br-sm'
                      : isDarkMode
                      ? 'bg-gray-700 text-white rounded-bl-sm'
                      : 'bg-gray-200 text-gray-900 rounded-bl-sm'
                  }`}
                >
                  <p className="text-sm break-words">{message.text || message.message || message.content || 'No message'}</p>
                  <p className={`text-[10px] mt-1 ${
                    message.senderId === userId
                      ? 'text-white/70'
                      : isDarkMode
                      ? 'text-gray-400'
                      : 'text-gray-500'
                  }`}>
                    {message.createdAt && new Date(message.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className={`p-3 border-t flex-shrink-0 ${
        isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
      }`}>
        <div className="flex gap-2">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className={`flex-1 px-4 py-2 rounded-full text-sm transition-all duration-200 focus:outline-none focus:ring-2 ${
              isDarkMode
                ? 'bg-gray-800 text-white placeholder-gray-400 focus:ring-blue-500'
                : 'bg-white text-gray-900 placeholder-gray-500 focus:ring-blue-500'
            }`}
          />
          <button
            onClick={handleSend}
            disabled={!messageText.trim()}
            className={`p-2.5 rounded-full transition-all duration-200 flex-shrink-0 ${
              messageText.trim()
                ? isDarkMode
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white'
                  : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white'
                : isDarkMode
                  ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <FiSend className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;
