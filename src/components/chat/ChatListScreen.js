// src/components/chat/ChatListScreen.js (or wherever your chat list component is)
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useChatWithAuth } from '../hooks/useChatWithAuth';

export function ChatListScreen({ navigation }) {
  const { getChatList, subscribeToChatList, authReady, currentFirebaseUser } = useChatWithAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authReady || !currentFirebaseUser) {
      return;
    }

    // Load initial chat list
    loadChatList();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToChatList((updatedChats) => {
      console.log('Chat list updated:', updatedChats.length, 'chats');
      setChats(updatedChats);
      setLoading(false);
    });

    return unsubscribe;
  }, [authReady, currentFirebaseUser]);

  const loadChatList = async () => {
    try {
      setLoading(true);
      const result = await getChatList();
      
      if (result.success) {
        setChats(result.chats);
      }
    } catch (error) {
      console.error('Error loading chat list:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while auth is not ready
  if (!authReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading authentication...</Text>
      </View>
    );
  }

  // Show auth required state
  if (!currentFirebaseUser) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Please sign in to view your chats</Text>
      </View>
    );
  }

  const renderChatItem = ({ item }) => (
    <TouchableOpacity
      style={{
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        flexDirection: 'row',
        alignItems: 'center'
      }}
      onPress={() => navigation.navigate('ChatScreen', { chatId: item.id })}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
          {item.displayName || 'Unknown Chat'}
        </Text>
        {item.lastMessage && (
          <Text style={{ color: '#666', marginTop: 4 }}>
            {item.lastMessage.text}
          </Text>
        )}
      </View>
      
      {item.unreadCount > 0 && (
        <View style={{
          backgroundColor: '#007AFF',
          borderRadius: 12,
          width: 24,
          height: 24,
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Text style={{ color: 'white', fontSize: 12 }}>
            {item.unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading chats...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={renderChatItem}
        ListEmptyComponent={
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 }}>
            <Text style={{ fontSize: 18, color: '#666' }}>No chats yet</Text>
            <Text style={{ color: '#666', marginTop: 8 }}>
              Search for users to start a conversation
            </Text>
          </View>
        }
      />
    </View>
  );
}