import { useState, useEffect, useRef } from 'react';
import { useChat } from '../../../contexts/ChatContext';
import { FiSend, FiPaperclip, FiSmile, FiMoreVertical, FiMessageSquare } from 'react-icons/fi';
import { formatDistanceToNow } from '../../../utils/dateUtils';
import { LoadingSpinner } from '../../common';
import { getImageUrl } from '../../../utils/helpers';

const ChatWindow = ({ conversation, otherUser }) => {
  const { messages, sendChatMessage, markConversationAsRead, userId } = useChat();
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Mark messages as read when opening conversation
    if (conversation?.id) {
      setIsLoadingMessages(true);
      markConversationAsRead(conversation.id);
      // Give a brief moment for messages to load
      const timer = setTimeout(() => {
        setIsLoadingMessages(false);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setIsLoadingMessages(false);
    }
  }, [conversation?.id, markConversationAsRead]);

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

  if (!conversation) {
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

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-linear-to-r from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="relative">
            {otherUser?.profileImage ? (
              <img
                src={getImageUrl(otherUser.profileImage)}
                alt={otherUser.name}
                className="w-12 h-12 rounded-full object-cover shadow-lg ring-2 ring-teal-100 dark:ring-teal-900"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className={`w-12 h-12 bg-linear-to-br from-teal-500 via-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ring-2 ring-teal-100 dark:ring-teal-900 ${otherUser?.profileImage ? 'hidden' : ''}`}>
              {otherUser?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 shadow-sm"></div>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">
              {otherUser?.name || 'Unknown User'}
            </h3>
            <p className="text-sm text-teal-600 dark:text-teal-400 font-medium capitalize">
              {otherUser?.role || 'User'}
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
            {messages.map((message) => {
              const isSender = message.senderId === userId;
              return (
                <div
                  key={message.id}
                  className={`flex ${isSender ? 'justify-end' : 'justify-start'} animate-fadeIn`}
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
                      {message.createdAt && formatDistanceToNow(message.createdAt.toDate())}
                    </p>
                  </div>
                </div>
              );
            })}
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
