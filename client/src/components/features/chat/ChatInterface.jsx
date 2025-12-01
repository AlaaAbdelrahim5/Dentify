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
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900">
      <ConversationsList 
        onSelectConversation={handleSelectConversation}
        users={users}
      />
      <ChatWindow 
        conversation={activeConversation || selectedConversation}
        otherUser={getOtherUser(activeConversation || selectedConversation)}
      />
    </div>
  );
};

export default ChatInterface;
