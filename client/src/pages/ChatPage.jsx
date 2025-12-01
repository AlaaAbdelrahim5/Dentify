import ChatInterface from '../components/features/chat/ChatInterface';
import Navbar from '../components/layout/Navbar';
import { useEffect, useState } from 'react';
import { authUtils } from '../utils/auth';

const ChatPage = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Fetch all users for chat
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = authUtils.getAccessToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Fetched users:', data); // Debug log
      // Ensure data is an array
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]); // Set empty array on error
    }
  };

  return (
    <>
      <Navbar />
      <div className="pt-16 h-screen">
        <ChatInterface users={users} />
      </div>
    </>
  );
};

export default ChatPage;
