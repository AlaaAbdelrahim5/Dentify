import { useState, useEffect } from 'react';
import { useChat } from '../../../contexts/ChatContext';
import { FiSearch, FiMessageSquare, FiPlus, FiX } from 'react-icons/fi';
import { formatDistanceToNow } from '../../../utils/dateUtils';
import { authUtils } from '../../../utils/auth';
import { LoadingSpinner } from '../../common';

const ConversationsList = ({ onSelectConversation, users = [] }) => {
  const { conversations, setActiveConversation, activeConversation, userId, startConversation, markConversationAsRead, isLoadingConversations } = useChat();
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');

  const getUserInfo = (participants) => {
    const otherUserId = participants.find(p => p !== userId);
    return users.find(u => u.id === otherUserId) || { name: 'Unknown User', role: 'User' };
  };

  const filteredConversations = conversations.filter((conv) => {
    const otherUser = getUserInfo(conv.participants);
    // Only show conversations that have at least one message
    if (!conv.lastMessage) {
      return false;
    }
    return otherUser.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleSelectConversation = (conversation) => {
    setActiveConversation(conversation);
    onSelectConversation?.(conversation);
    // Mark as read immediately when opening the conversation
    markConversationAsRead(conversation.id);
  };

  const handleStartNewChat = async (otherUserId) => {
    try {
      await startConversation(otherUserId);
      setShowNewChatModal(false);
      setUserSearchTerm('');
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  // Filter users excluding current user
  
  // Get current user info to check their role
  const currentUser = authUtils.getCurrentUser();
  const currentUserRole = currentUser?.role?.toLowerCase();
  
  // Ensure both values are numbers for comparison
  const availableUsers = users.filter(u => {
    const isCurrentUser = Number(u.id) === Number(userId);
    
    // If current user is a patient, exclude other patients
    if (currentUserRole === 'patient' && u.role?.toLowerCase() === 'patient') {
      return false;
    }
    
    return !isCurrentUser;
  });
  const filteredUsers = availableUsers.filter(u => 
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    u.role?.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  return (
    <div className="w-96 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-linear-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-linear-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold bg-linear-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
            Messages
          </h2>
          <button
            onClick={() => setShowNewChatModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-teal-600 to-cyan-600 text-white rounded-xl hover:from-teal-700 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 transform"
            title="New Chat"
          >
            <FiPlus className="w-5 h-5" />
            <span className="text-sm font-semibold">New</span>
          </button>
        </div>
        {/* Search */}
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-teal-500 dark:text-teal-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-teal-500 dark:focus:border-teal-400 transition-all shadow-sm hover:shadow-md"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {isLoadingConversations ? (
          <div className="flex items-center justify-center h-full py-20">
            <div className="text-center">
              <LoadingSpinner size="lg" message="Loading conversations..." />
            </div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-linear-to-br from-teal-100 via-cyan-100 to-blue-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300">
              <FiMessageSquare className="w-10 h-10 text-teal-600 dark:text-teal-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {searchTerm ? 'No conversations found' : 'No conversations yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm ? 'Try a different search term' : 'Start a new conversation to get started'}
            </p>
            {!searchTerm && (
              <Button
                onClick={() => setShowNewChatModal(true)}
                variant="primary"
                size="lg"
              >
                <FiPlus className="w-5 h-5 mr-2" />
                Start a conversation
              </Button>
            )}
          </div>
        ) : (
          filteredConversations.map((conversation) => {
            const otherUser = getUserInfo(conversation.participants);
            const unreadCount = conversation.unreadCount?.[userId] || 0;
            const isActive = activeConversation?.id === conversation.id;
            // Don't show unread indicator for active conversation
            const showUnread = !isActive && unreadCount > 0;
            
            return (
              <div
                key={conversation.id}
                onClick={() => handleSelectConversation(conversation)}
                className={`mx-3 my-2 p-4 rounded-xl cursor-pointer transition-all duration-200 transform hover:scale-[1.02] ${
                  isActive 
                    ? 'bg-linear-to-r from-teal-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700 shadow-lg ring-2 ring-teal-500 dark:ring-teal-400' 
                    : 'hover:bg-white dark:hover:bg-gray-800 hover:shadow-lg'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="w-14 h-14 bg-linear-to-br from-teal-500 via-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ring-2 ring-teal-100 dark:ring-teal-900">
                      {otherUser.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    {showUnread && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-linear-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg ring-2 ring-white dark:ring-gray-900 animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </div>
                    )}
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 shadow-sm"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 dark:text-white truncate text-base">
                        {otherUser.name}
                      </h3>
                      <span className="text-xs text-teal-600 dark:text-teal-400 whitespace-nowrap font-medium">
                        {conversation.lastMessageAt && formatDistanceToNow(conversation.lastMessageAt.toDate())}
                      </span>
                    </div>
                    <p className={`text-sm truncate ${
                      showUnread 
                        ? 'text-gray-900 dark:text-white font-semibold' 
                        : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {conversation.lastMessage || 'No messages yet'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40"
            onClick={() => setShowNewChatModal(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col border border-gray-200 dark:border-gray-700 transform transition-all">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700 bg-linear-to-r from-teal-50 to-cyan-50 dark:from-gray-800 dark:to-gray-800">
                <h3 className="text-lg font-bold bg-linear-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
                  New Chat
                </h3>
                <button
                  onClick={() => setShowNewChatModal(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-all hover:scale-110"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Search Users */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-teal-500 dark:text-teal-400 w-5 h-5" />
                  <input
                    type="text"
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    placeholder="Search users..."
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-teal-500 dark:focus:border-teal-400 transition-all"
                    autoFocus
                  />
                </div>
              </div>

              {/* Users List */}
              <div className="flex-1 overflow-y-auto">
                {filteredUsers.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-gray-600 dark:text-gray-400">
                      {userSearchTerm ? 'No users found' : 'No users available'}
                    </p>
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => handleStartNewChat(user.id)}
                      className="p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-linear-to-r hover:from-teal-50 hover:to-cyan-50 dark:hover:from-gray-700 dark:hover:to-gray-700 cursor-pointer transition-all hover:shadow-md"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-linear-to-br from-teal-500 via-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold shrink-0 shadow-lg ring-2 ring-teal-100 dark:ring-teal-900">
                          {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                            {user.name || user.email}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {user.email}
                          </p>
                        </div>
                        <div className="text-xs text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-900 px-2.5 py-1 rounded-full font-medium capitalize">
                          {user.role}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ConversationsList;
