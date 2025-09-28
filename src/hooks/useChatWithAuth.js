// src/hooks/useChatWithAuth.js
import { useEffect, useState } from 'react';
import { auth } from '../config/firebase.config';
import ChatService from '../services/ChatService';

export function useChatWithAuth() {
  const [currentFirebaseUser, setCurrentFirebaseUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      console.log('Firebase Auth State Changed:', firebaseUser?.uid || 'No user');
      setCurrentFirebaseUser(firebaseUser);
      setAuthReady(true);
    });

    return unsubscribe;
  }, []);

  // Method to get chat list using Firebase UID
  const getChatList = async () => {
    if (!currentFirebaseUser) {
      throw new Error('User not authenticated with Firebase');
    }

    return await ChatService.getChatList(currentFirebaseUser.uid);
  };

  // Method to search users using Firebase UID
  const searchUsers = async (query, filters = {}) => {
    if (!currentFirebaseUser) {
      throw new Error('User not authenticated with Firebase');
    }

    return await ChatService.searchUsers(query, currentFirebaseUser.uid, filters);
  };

  // Method to subscribe to chat list using Firebase UID
  const subscribeToChatList = (callback) => {
    if (!currentFirebaseUser) {
      console.warn('User not authenticated, cannot subscribe to chat list');
      return () => {};
    }

    return ChatService.subscribeToChatList(currentFirebaseUser.uid, callback);
  };

  // Method to create or get chat
  const createOrGetChat = async (participants, chatType, chatData) => {
    if (!currentFirebaseUser) {
      throw new Error('User not authenticated with Firebase');
    }

    // Ensure current user is in participants
    const allParticipants = [...new Set([currentFirebaseUser.uid, ...participants])];
    return await ChatService.createOrGetChat(allParticipants, chatType, chatData);
  };

  // Method to send message
  const sendMessage = async (chatId, messageData) => {
    if (!currentFirebaseUser) {
      throw new Error('User not authenticated with Firebase');
    }

    const messageWithSender = {
      ...messageData,
      senderId: currentFirebaseUser.uid
    };

    return await ChatService.sendMessage(chatId, messageWithSender);
  };

  // Method to get chat messages
  const getChatMessages = async (chatId, limit, lastMessageId) => {
    if (!currentFirebaseUser) {
      throw new Error('User not authenticated with Firebase');
    }

    return await ChatService.getChatMessages(chatId, limit, lastMessageId);
  };

  // Method to subscribe to chat messages
  const subscribeToChat = (chatId, callback) => {
    if (!currentFirebaseUser) {
      console.warn('User not authenticated, cannot subscribe to chat');
      return () => {};
    }

    return ChatService.subscribeToChat(chatId, callback);
  };

  // Method to send typing indicator
  const sendTypingIndicator = async (chatId, isTyping = true) => {
    if (!currentFirebaseUser) {
      console.warn('User not authenticated, cannot send typing indicator');
      return;
    }

    return await ChatService.sendTypingIndicator(chatId, currentFirebaseUser.uid, isTyping);
  };

  // Method to subscribe to typing indicators
  const subscribeToTyping = (chatId, callback) => {
    if (!currentFirebaseUser) {
      console.warn('User not authenticated, cannot subscribe to typing');
      return () => {};
    }

    return ChatService.subscribeToTyping(chatId, callback);
  };

  // Method to mark messages as read
  const markMessagesAsRead = async (chatId, messageIds = []) => {
    if (!currentFirebaseUser) {
      console.warn('User not authenticated, cannot mark messages as read');
      return;
    }

    return await ChatService.markMessagesAsRead(chatId, currentFirebaseUser.uid, messageIds);
  };

  // Method to add message reaction
  const addMessageReaction = async (chatId, messageId, reaction) => {
    if (!currentFirebaseUser) {
      throw new Error('User not authenticated with Firebase');
    }

    return await ChatService.addMessageReaction(chatId, messageId, currentFirebaseUser.uid, reaction);
  };

  // Method to upload file
  const uploadFile = async (file, chatId, messageId, onProgress) => {
    if (!currentFirebaseUser) {
      throw new Error('User not authenticated with Firebase');
    }

    return await ChatService.uploadFile(file, chatId, messageId, onProgress);
  };

  // Method to update unread count
  const updateUnreadCount = async (chatId, count) => {
    if (!currentFirebaseUser) {
      console.warn('User not authenticated, cannot update unread count');
      return;
    }

    return await ChatService.updateUnreadCount(chatId, currentFirebaseUser.uid, count);
  };

  // Method to unsubscribe from chat
  const unsubscribeFromChat = (chatId) => {
    return ChatService.unsubscribeFromChat(chatId);
  };

  // Method to unsubscribe from chat list
  const unsubscribeFromChatList = () => {
    if (!currentFirebaseUser) {
      return;
    }

    return ChatService.unsubscribeFromChatList(currentFirebaseUser.uid);
  };

  // Method to get user info
  const getUserInfo = async (userId) => {
    return await ChatService.getUserInfo(userId);
  };

  // Method to add event listener
  const addEventListener = (callback) => {
    return ChatService.addEventListener(callback);
  };

  return {
    currentFirebaseUser,
    authReady,
    getChatList,
    searchUsers,
    subscribeToChatList,
    createOrGetChat,
    sendMessage,
    getChatMessages,
    subscribeToChat,
    sendTypingIndicator,
    subscribeToTyping,
    markMessagesAsRead,
    addMessageReaction,
    uploadFile,
    updateUnreadCount,
    unsubscribeFromChat,
    unsubscribeFromChatList,
    getUserInfo,
    addEventListener
  };
}