import { useState } from 'react';
import { useChat } from '../../../contexts/ChatContext';
import ConversationsList from './ConversationsList';
import ChatWindow from './ChatWindow';

const ChatInterface = ({ users = [] }) => {
  const { activeConversation, userId } = useChat();
  const [selectedConversation, setSelectedConversation] = useState(null);

  const getOtherUser = (conversation) => {
    if (!conversation) return null;
    const otherUserId = conversation.participants.find(p => p !== userId);
    return users.find(u => u.id === otherUserId);
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  return (
    <div className="bg-linear-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
      <div className="flex h-[calc(100vh-14rem)]">
        <ConversationsList 
          onSelectConversation={handleSelectConversation}
          users={users}
        />
        <ChatWindow 
          conversation={activeConversation || selectedConversation}
          otherUser={getOtherUser(activeConversation || selectedConversation)}
        />
      </div>
    </div>
  );
};

export default ChatInterface;
