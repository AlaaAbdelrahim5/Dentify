import { useState, useEffect, useRef } from 'react';
import { useChat } from '../../../contexts/ChatContext';
import { FiSend, FiPaperclip, FiSmile, FiMoreVertical, FiMessageSquare, FiX } from 'react-icons/fi';
import { formatDistanceToNow } from '../../../utils/dateUtils';
import { LoadingSpinner } from '../../common';
import { getImageUrl } from '../../../utils/helpers';
import { useTheme } from '../../../contexts/ThemeContext';

const ChatWindow = ({ conversation, otherUser, user, onClose, miniMode = false }) => {
  const { isDarkMode } = useTheme();
  const { messages, sendChatMessage, markConversationAsRead, activeConversation, userId } = useChat();
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const messagesEndRef = useRef(null);

  // Support both prop patterns: (conversation, otherUser) or (user)
  const displayUser = otherUser || user;
  const conv = conversation || activeConversation;

  useEffect(() => {
    // Scroll to bottom when new messages arrive or messages change
    if (messages.length > 0) {
      // Use setTimeout to ensure DOM has updated
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
    }
  }, [messages]);

  useEffect(() => {
    // Scroll to bottom immediately after loading completes
    if (!isLoadingMessages && messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'instant', block: 'end' });
      }, 100);
    }
  }, [isLoadingMessages]);

  useEffect(() => {
    // Mark messages as read when opening conversation
    if (conv?.id) {
      // Only show loading spinner the first time
      if (!hasLoadedOnce) {
        setIsLoadingMessages(true);
        const timer = setTimeout(() => {
          setIsLoadingMessages(false);
          setHasLoadedOnce(true);
        }, 500);
        return () => clearTimeout(timer);
      }
      markConversationAsRead(conv.id);
    } else {
      setIsLoadingMessages(false);
      setHasLoadedOnce(false);
    }
  }, [conv?.id, markConversationAsRead, hasLoadedOnce]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await sendChatMessage(newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // Helper function to format date
  const formatDate = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  // Helper function to group messages by date
  const groupMessagesByDate = (messages) => {
    const groups = [];
    let currentGroup = null;

    messages.forEach((message) => {
      const messageDate = message.createdAt?.seconds 
        ? new Date(message.createdAt.seconds * 1000).toDateString()
        : message.createdAt?.toDate
        ? message.createdAt.toDate().toDateString()
        : new Date().toDateString();

      if (!currentGroup || currentGroup.date !== messageDate) {
        currentGroup = { date: messageDate, messages: [] };
        groups.push(currentGroup);
      }
      currentGroup.messages.push(message);
    });

    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  if (!conv) {
    return (
      <div className="flex-1 flex items-center justify-center bg-linear-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center px-6">
          <div className="w-32 h-32 bg-linear-to-br from-teal-100 via-cyan-100 to-blue-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-xl transform hover:scale-105 transition-transform duration-300">
            <FiMessageSquare className="w-16 h-16 text-teal-600 dark:text-teal-400" />
          </div>
          <h3 className="text-2xl font-bold bg-linear-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent mb-3">
            Select a conversation
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Choose a conversation from the list to start chatting
          </p>
        </div>
      </div>
    );
  }

  // Mini mode (popup window)
  if (miniMode) {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 flex items-center justify-between shrink-0 bg-linear-to-r from-teal-600 via-cyan-600 to-blue-600 shadow-lg">
          <div className="flex items-center gap-3">
            {displayUser?.profileImage ? (
              <img
                src={getImageUrl(displayUser.profileImage)}
                alt={displayUser.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-white/50 shadow-md"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center shadow-md border-2 border-white/50">
                <span className="text-white font-bold text-base">
                  {displayUser?.name?.[0]?.toUpperCase() || '?'}
                </span>
              </div>
            )}
            <div>
              <h3 className="text-white font-bold text-base">{displayUser?.name}</h3>
              <p className="text-white/90 text-xs capitalize font-medium">{displayUser?.role}</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/20 transition-all duration-200 text-white hover:scale-110"
            >
              <FiX className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Messages */}
        <div className={`flex-1 overflow-y-auto p-4 space-y-3 ${
          isDarkMode ? 'bg-linear-to-b from-gray-900 to-gray-800' : 'bg-linear-to-b from-gray-50 to-white'
        }`}>
          {isLoadingMessages ? (
            <div className="flex flex-col items-center justify-center h-full">
              <LoadingSpinner size="lg" message="Loading messages..." />
            </div>
          ) : messages.length === 0 ? (
            <div className={`flex flex-col items-center justify-center h-full ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-3 shadow-lg ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-gray-800 to-gray-700' 
                  : 'bg-gradient-to-br from-teal-100 to-cyan-100'
              }`}>
                <FiMessageSquare className={`w-8 h-8 ${
                  isDarkMode ? 'text-teal-400' : 'text-teal-600'
                }`} />
              </div>
              <p className={`text-sm font-medium ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Start your conversation</p>
            </div>
          ) : (
            <>
              {messageGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="space-y-3">
                  {/* Date separator */}
                  <div className="flex items-center justify-center my-4">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${
                      isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-600 border border-gray-200'
                    }`}>
                      {formatDate(group.date)}
                    </div>
                  </div>
                  {/* Messages for this date */}
                  {group.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex mb-3 ${
                        message.senderId === userId ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-200 ${
                          message.senderId === userId
                            ? 'bg-linear-to-r from-teal-600 via-cyan-600 to-blue-600 text-white rounded-br-sm'
                            : isDarkMode
                            ? 'bg-gray-700 text-white rounded-bl-sm border border-gray-600'
                            : 'bg-white text-gray-900 rounded-bl-sm border border-gray-200'
                        }`}
                      >
                        <p className="text-sm wrap-break-word leading-relaxed">{message.text || message.message || message.content || 'No message'}</p>
                        <p className={`text-[10px] mt-1.5 ${
                          message.senderId === userId
                            ? 'text-teal-100'
                            : isDarkMode
                            ? 'text-gray-400'
                            : 'text-gray-500'
                        }`}>
                          {message.createdAt && new Date(message.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <div className={`p-4 border-t shrink-0 ${
          isDarkMode ? 'border-gray-700 bg-gray-900/80 backdrop-blur-sm' : 'border-gray-200 bg-white/80 backdrop-blur-sm'
        }`}>
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(e)}
              placeholder="Type a message..."
              className={`flex-1 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 focus:outline-none focus:ring-2 border-2 ${
                isDarkMode
                  ? 'bg-gray-800 text-white placeholder-gray-400 focus:ring-teal-500 focus:border-teal-500 border-gray-700'
                  : 'bg-white text-gray-900 placeholder-gray-500 focus:ring-teal-500 focus:border-teal-500 border-gray-300'
              }`}
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className={`p-3 rounded-xl transition-all duration-200 shrink-0 shadow-lg ${
                newMessage.trim()
                  ? 'bg-linear-to-r from-teal-600 via-cyan-600 to-blue-600 hover:from-teal-700 hover:via-cyan-700 hover:to-blue-700 text-white hover:shadow-xl hover:scale-105'
                  : isDarkMode
                    ? 'bg-gray-800 text-gray-600 cursor-not-allowed opacity-50'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
              }`}
            >
              <FiSend className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Full page mode (default)

  // Full page mode (default)
  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-linear-to-r from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="relative">
            {displayUser?.profileImage ? (
              <img
                src={getImageUrl(displayUser.profileImage)}
                alt={displayUser.name}
                className="w-12 h-12 rounded-full object-cover shadow-lg ring-2 ring-teal-100 dark:ring-teal-900"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className={`w-12 h-12 bg-linear-to-br from-teal-500 via-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ring-2 ring-teal-100 dark:ring-teal-900 ${displayUser?.profileImage ? 'hidden' : ''}`}>
              {displayUser?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 shadow-sm"></div>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">
              {displayUser?.name || 'Unknown User'}
            </h3>
            <p className="text-sm text-teal-600 dark:text-teal-400 font-medium capitalize">
              {displayUser?.role || 'User'}
            </p>
          </div>
        </div>
        <button className="p-2.5 text-gray-600 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 hover:scale-110">
          <FiMoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-linear-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        {isLoadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <LoadingSpinner size="lg" message="Loading messages..." />
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-20 h-20 bg-linear-to-br from-teal-100 to-cyan-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                <FiMessageSquare className="w-10 h-10 text-teal-600 dark:text-teal-400" />
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-lg font-semibold">Start your conversation</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Send a message to begin chatting</p>
            </div>
          </div>
        ) : (
          <>
            {messageGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="space-y-4">
                {/* Date separator */}
                <div className="flex items-center justify-center my-6">
                  <div className="px-4 py-1.5 bg-white dark:bg-gray-800 rounded-full text-xs font-semibold text-gray-600 dark:text-gray-300 shadow-md border border-gray-200 dark:border-gray-700">
                    {formatDate(group.date)}
                  </div>
                </div>
                {/* Messages for this date */}
                {group.messages.map((message) => {
                  const isSender = message.senderId === userId;
                  const messageDate = message.createdAt?.toDate ? message.createdAt.toDate() : new Date();
                  return (
                    <div
                      key={message.id}
                      className={`flex mb-4 ${isSender ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md xl:max-w-lg ${
                          isSender
                            ? 'bg-linear-to-r from-teal-600 via-cyan-600 to-blue-600 text-white shadow-lg transform hover:scale-[1.02] transition-transform duration-200'
                            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200'
                        } rounded-2xl px-4 py-3`}
                      >
                        <p className="text-sm wrap-break-word leading-relaxed">{message.message}</p>
                        <p
                          className={`text-xs mt-1.5 ${
                            isSender ? 'text-teal-100' : 'text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          {messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="px-6 py-5 border-t border-gray-200 dark:border-gray-700 bg-linear-to-r from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-800 dark:to-gray-800">
        <form onSubmit={handleSendMessage} className="flex items-end gap-3">
          <button
            type="button"
            className="p-3 text-gray-600 dark:text-gray-400 hover:bg-teal-50 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 hover:text-teal-600 dark:hover:text-teal-400 hover:scale-110"
            title="Attach file"
          >
            <FiPaperclip className="w-5 h-5" />
          </button>
          <button
            type="button"
            className="p-3 text-gray-600 dark:text-gray-400 hover:bg-teal-50 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 hover:text-teal-600 dark:hover:text-teal-400 hover:scale-110"
            title="Add emoji"
          >
            <FiSmile className="w-5 h-5" />
          </button>
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 resize-none rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:focus:ring-teal-400 max-h-32 transition-all"
            rows={1}
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-3 bg-linear-to-r from-teal-600 via-cyan-600 to-blue-600 text-white rounded-xl hover:from-teal-700 hover:via-cyan-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 disabled:shadow-none disabled:scale-100"
            title="Send message"
          >
            <FiSend className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
