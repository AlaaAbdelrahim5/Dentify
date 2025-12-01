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
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
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
