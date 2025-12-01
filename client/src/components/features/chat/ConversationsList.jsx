import { useState } from 'react';
import { useChat } from '../../../contexts/ChatContext';
import { FiSearch, FiMessageSquare, FiPlus, FiX } from 'react-icons/fi';
import { formatDistanceToNow } from '../../../utils/dateUtils';

const ConversationsList = ({ onSelectConversation, users = [] }) => {
  const { conversations, setActiveConversation, userId, startConversation } = useChat();
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');

  const getUserInfo = (participants) => {
    const otherUserId = participants.find(p => p !== userId);
    return users.find(u => u.id === otherUserId) || { name: 'Unknown User', role: 'User' };
  };

  const filteredConversations = conversations.filter((conv) => {
    const otherUser = getUserInfo(conv.participants);
    return otherUser.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleSelectConversation = (conversation) => {
    setActiveConversation(conversation);
    onSelectConversation?.(conversation);
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
  console.log('Users prop:', users);
  console.log('Current userId:', userId);
  const availableUsers = users.filter(u => u.id !== userId);
  console.log('Available users after filter:', availableUsers);
  const filteredUsers = availableUsers.filter(u => 
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    u.role?.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  return (
    <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Messages
          </h2>
          <button
            onClick={() => setShowNewChatModal(true)}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            title="New Chat"
          >
            <FiPlus className="w-5 h-5" />
          </button>
        </div>
        {/* Search */}
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center">
            <FiMessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm ? 'No conversations found' : 'No conversations yet'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowNewChatModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiPlus className="w-4 h-4" />
                Start a conversation
              </button>
            )}
          </div>
        ) : (
          filteredConversations.map((conversation) => {
            const otherUser = getUserInfo(conversation.participants);
            const unreadCount = conversation.unreadCount?.[userId] || 0;

            return (
              <div
                key={conversation.id}
                onClick={() => handleSelectConversation(conversation)}
                className="p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {otherUser.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {otherUser.name}
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {conversation.lastMessageAt && formatDistanceToNow(conversation.lastMessageAt.toDate())}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {conversation.lastMessage || 'No messages yet'}
                      </p>
                      {unreadCount > 0 && (
                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-600 rounded-full">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </div>
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
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowNewChatModal(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  New Chat
                </h3>
                <button
                  onClick={() => setShowNewChatModal(false)}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Search Users */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    placeholder="Search users..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
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
                        <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded">
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
