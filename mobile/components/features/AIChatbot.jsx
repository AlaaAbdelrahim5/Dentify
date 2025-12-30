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
  Alert,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  sendChatMessage, 
  clearChatHistory 
} from '../../services/chatbotService';

const AIChatbot = ({ isOpen, onClose }) => {
  const { isDarkMode } = useTheme();
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

  const handleConfirmBooking = (appointmentDetails) => {
    const confirmMessage = {
      id: messages.length + 1,
      text: `Great! I'll help you book this appointment:\n\nDate: ${appointmentDetails.date}\nTime: ${appointmentDetails.time}\nReason: ${appointmentDetails.reason}\n\nPlease go to the Appointments page in your dashboard to complete the booking process.`,
      sender: 'bot',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, confirmMessage]);
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
    <Modal
      visible={isOpen}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View 
          className={isDarkMode ? 'bg-gray-900' : 'bg-white'}
          style={{
            paddingTop: 48,
            paddingHorizontal: 16,
            paddingBottom: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isDarkMode ? 0.3 : 0.1,
            shadowRadius: 8,
            elevation: 4,
            borderBottomWidth: 3,
            borderBottomColor: '#14B8A6'
          }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center" style={{ gap: 12 }}>
              <View 
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: isDarkMode ? '#1F2937' : '#F0FDFA',
                  borderWidth: 1.5,
                  borderColor: '#14B8A6',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Ionicons name="sparkles" size={22} color="#14B8A6" />
              </View>
              <View>
                <Text className={`font-bold text-2xl ${isDarkMode ? 'text-white' : 'text-gray-900'}`} style={{ letterSpacing: -0.8 }}>Dentify AI</Text>
                <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} style={{ letterSpacing: 0.2 }}>Your dental assistant</Text>
              </View>
            </View>
            <View className="flex-row items-center" style={{ gap: 8 }}>
              <TouchableOpacity
                onPress={handleClearHistory}
                className={`w-10 h-10 rounded-xl items-center justify-center`}
                style={{
                  backgroundColor: isDarkMode ? '#1F2937' : '#F0FDFA',
                  borderWidth: 1,
                  borderColor: isDarkMode ? '#374151' : '#14B8A6'
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={20} color={isDarkMode ? '#10B981' : '#14B8A6'} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onClose}
                className={`w-10 h-10 rounded-xl items-center justify-center`}
                style={{
                  backgroundColor: isDarkMode ? '#1F2937' : '#F0FDFA',
                  borderWidth: 1,
                  borderColor: isDarkMode ? '#374151' : '#14B8A6'
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={20} color={isDarkMode ? '#10B981' : '#14B8A6'} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          className={`flex-1 p-4 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
        {messages.map(message => (
          <View
            key={message.id}
            className={`mb-3 ${message.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <View
              style={[
                {
                  maxWidth: '80%',
                  borderRadius: 16,
                  padding: 12
                },
                message.sender === 'user'
                  ? {
                      backgroundColor: '#14B8A6',
                      shadowColor: '#14B8A6',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      elevation: 2
                    }
                  : message.isError
                  ? {
                      backgroundColor: '#FEE2E2',
                      borderWidth: 1,
                      borderColor: '#FCA5A5'
                    }
                  : {
                      backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                      borderWidth: 1,
                      borderColor: isDarkMode ? '#374151' : '#E5E7EB'
                    }
              ]}
            >
              <Text
                className={`text-sm ${
                  message.sender === 'user' 
                    ? 'text-white' 
                    : isDarkMode 
                    ? 'text-gray-100' 
                    : 'text-gray-800'
                }`}
              >
                {message.text}
              </Text>
              {message.appointmentBooking && (
                <View className={`mt-2 pt-2 ${isDarkMode ? 'border-t border-gray-600' : 'border-t border-gray-200'}`}>
                  <Text className={`text-xs font-bold mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Appointment Details:</Text>
                  <Text className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Date: {message.appointmentBooking.date}</Text>
                  <Text className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Time: {message.appointmentBooking.time}</Text>
                  <Text className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Reason: {message.appointmentBooking.reason}</Text>
                  <TouchableOpacity 
                    style={{
                      marginTop: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 8,
                      backgroundColor: '#14B8A6',
                      alignItems: 'center'
                    }}
                    onPress={() => handleConfirmBooking(message.appointmentBooking)}
                    activeOpacity={0.7}
                  >
                    <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600' }}>Confirm Booking</Text>
                  </TouchableOpacity>
                </View>
              )}
              <Text
                style={{
                  fontSize: 11,
                  marginTop: 4,
                  color: message.sender === 'user' ? '#D1FAE5' : (isDarkMode ? '#9CA3AF' : '#6B7280')
                }}
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
              <View style={{
                borderRadius: 16,
                padding: 12,
                backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                borderWidth: 1,
                borderColor: isDarkMode ? '#374151' : '#E5E7EB'
              }}>
                <ActivityIndicator size="small" color="#14B8A6" />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View 
          className={isDarkMode ? 'bg-gray-900' : 'bg-white'}
          style={{
            padding: 16,
            borderTopWidth: 1,
            borderTopColor: isDarkMode ? '#374151' : '#E5E7EB'
          }}
        >
          <View className="flex-row" style={{ gap: 8 }}>
            <TextInput
              value={inputMessage}
              onChangeText={setInputMessage}
              placeholder="Type your message..."
              placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
              style={{
                flex: 1,
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderRadius: 12,
                backgroundColor: isDarkMode ? '#1F2937' : '#F9FAFB',
                borderWidth: 1,
                borderColor: isDarkMode ? '#374151' : '#D1D5DB',
                color: isDarkMode ? '#FFFFFF' : '#111827',
                fontSize: 15,
                maxHeight: 100
              }}
              editable={!isLoading}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              onPress={() => handleSendMessage()}
              disabled={isLoading || !inputMessage.trim()}
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                backgroundColor: isLoading || !inputMessage.trim() ? '#D1D5DB' : '#14B8A6',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#14B8A6',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isLoading || !inputMessage.trim() ? 0 : 0.3,
                shadowRadius: 4,
                elevation: isLoading || !inputMessage.trim() ? 0 : 3
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="send" size={20} color="white" />
            </TouchableOpacity>
          </View>
          <Text style={{ fontSize: 11, marginTop: 8, textAlign: 'center', color: isDarkMode ? '#6B7280' : '#9CA3AF' }}>
            <Text>Powered by </Text>
            <Text style={{ fontWeight: '600', color: '#14B8A6' }}>Google Gemini AI</Text>
            <Text> - Free & Private</Text>
          </Text>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default AIChatbot;
