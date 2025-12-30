import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { 
  sendChatMessage, 
  clearChatHistory 
} from '../../services/chatbotService';

const AIChatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm your Dentify AI Assistant. I can help you with:\n\n• Booking appointments\n• Answering dental questions\n• Treatment information\n• Post-care instructions\n\nHow can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef(null);

  const quickActions = [
    { id: 1, label: 'Book Appointment', icon: '📅' },
    { id: 2, label: 'Treatment Info', icon: '🦷' },
    { id: 3, label: 'Post-Care Tips', icon: '💊' },
    { id: 4, label: 'Dental FAQs', icon: '❓' }
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const handleSendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage = {
      id: messages.length + 1,
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await sendChatMessage(messageText);
      
      const botMessage = {
        id: messages.length + 2,
        text: response.data.message,
        sender: 'bot',
        timestamp: new Date(response.data.timestamp),
        appointmentBooking: response.data.appointmentBooking
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: messages.length + 2,
        text: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        sender: 'bot',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (action) => {
    let message = '';
    
    switch (action.id) {
      case 1:
        message = "I'd like to book an appointment";
        break;
      case 2:
        message = "Can you tell me about different dental treatments?";
        break;
      case 3:
        message = "I need post-care instructions";
        break;
      case 4:
        message = "I have some questions about dental health";
        break;
      default:
        return;
    }

    await handleSendMessage(message);
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear Chat History',
      'Are you sure you want to clear the chat history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearChatHistory();
              setMessages([
                {
                  id: 1,
                  text: "Chat history cleared! How can I help you today?",
                  sender: 'bot',
                  timestamp: new Date()
                }
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to clear history');
            }
          }
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex-row items-center justify-between shadow-lg">
        <View className="flex-row items-center gap-3">
          <View className="w-12 h-12 bg-white rounded-full items-center justify-center">
            <Text className="text-3xl">🤖</Text>
          </View>
          <View>
            <Text className="text-white font-bold text-lg">Dentify AI</Text>
            <Text className="text-blue-100 text-xs">Your dental assistant</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={handleClearHistory}
          className="p-2 bg-blue-600 rounded-full"
        >
          <Text className="text-white text-lg">🗑️</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View className="p-3 bg-white border-b border-gray-200">
        <View className="flex-row justify-between gap-2">
          {quickActions.map(action => (
            <TouchableOpacity
              key={action.id}
              onPress={() => handleQuickAction(action)}
              className="flex-1 items-center gap-1 p-2 bg-gray-50 rounded-lg border border-gray-200"
              disabled={isLoading}
            >
              <Text className="text-2xl">{action.icon}</Text>
              <Text className="text-[10px] text-gray-700 text-center">
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 p-4"
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {messages.map(message => (
          <View
            key={message.id}
            className={`mb-3 ${message.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <View
              className={`max-w-[80%] rounded-lg p-3 ${
                message.sender === 'user'
                  ? 'bg-blue-600'
                  : message.isError
                  ? 'bg-red-50 border border-red-200'
                  : 'bg-white border border-gray-200'
              }`}
            >
              <Text
                className={`text-sm ${
                  message.sender === 'user' ? 'text-white' : 'text-gray-800'
                }`}
              >
                {message.text}
              </Text>
              {message.appointmentBooking && (
                <View className="mt-2 pt-2 border-t border-gray-200">
                  <Text className="text-xs font-bold mb-1">Appointment Details:</Text>
                  <Text className="text-xs">Date: {message.appointmentBooking.date}</Text>
                  <Text className="text-xs">Time: {message.appointmentBooking.time}</Text>
                  <Text className="text-xs">Reason: {message.appointmentBooking.reason}</Text>
                  <TouchableOpacity className="mt-2 bg-blue-500 px-3 py-1 rounded">
                    <Text className="text-white text-xs text-center">Confirm Booking</Text>
                  </TouchableOpacity>
                </View>
              )}
              <Text
                className={`text-xs mt-1 ${
                  message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}
              >
                {new Date(message.timestamp).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Text>
            </View>
          </View>
        ))}
        {isLoading && (
          <View className="items-start mb-3">
            <View className="bg-white border border-gray-200 rounded-lg p-3">
              <ActivityIndicator size="small" color="#2563eb" />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View className="p-4 bg-white border-t border-gray-200">
        <View className="flex-row gap-2">
          <TextInput
            value={inputMessage}
            onChangeText={setInputMessage}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
            editable={!isLoading}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            onPress={() => handleSendMessage()}
            disabled={isLoading || !inputMessage.trim()}
            className={`px-4 py-3 rounded-lg ${
              isLoading || !inputMessage.trim() 
                ? 'bg-gray-300' 
                : 'bg-blue-600'
            }`}
          >
            <Text className="text-white font-semibold">Send</Text>
          </TouchableOpacity>
        </View>
        <Text className="text-xs text-gray-500 mt-2 text-center">
          Powered by Google Gemini AI - Free & Private
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
};

export default AIChatbot;
