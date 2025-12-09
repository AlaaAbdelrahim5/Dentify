import { useState, useEffect, useRef } from 'react';
import { useChat } from '../../../contexts/ChatContext';
import { FiSend, FiPaperclip, FiSmile, FiMoreVertical, FiMessageSquare } from 'react-icons/fi';
import { formatDistanceToNow } from '../../../utils/dateUtils';
import { LoadingSpinner } from '../../common';

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
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center px-6">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-800 dark:to-gray-700 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg">
            <FiMessageSquare className="w-16 h-16 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
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
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
            {otherUser?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">
              {otherUser?.name || 'Unknown User'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              {otherUser?.role || 'User'}
            </p>
          </div>
        </div>
        <button className="p-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
          <FiMoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-gray-50 dark:bg-gray-900">
        {isLoadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <LoadingSpinner size="lg" />
              <p className="text-gray-500 dark:text-gray-400 mt-4">Loading messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <FiMessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">Start your conversation</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Send a message to begin chatting</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => {
              const isSender = message.senderId === userId;
              return (
                <div
                  key={message.id}
                  className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md xl:max-w-lg ${
                      isSender
                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-gray-700'
                    } rounded-2xl px-4 py-3`}
                  >
                    <p className="text-sm break-words leading-relaxed">{message.message}</p>
                    <p
                      className={`text-xs mt-1.5 ${
                        isSender ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
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
      <div className="px-6 py-5 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <form onSubmit={handleSendMessage} className="flex items-end gap-3">
          <button
            type="button"
            className="p-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200"
          >
            <FiPaperclip className="w-5 h-5" />
          </button>
          <button
            type="button"
            className="p-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200"
          >
            <FiSmile className="w-5 h-5" />
          </button>
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 resize-none rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-32 transition-all"
            rows={1}
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg disabled:shadow-none"
          >
            <FiSend className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
