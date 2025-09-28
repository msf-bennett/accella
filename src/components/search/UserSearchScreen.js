// src/components/search/UserSearchScreen.js (or wherever your search component is)
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useChatWithAuth } from '../hooks/useChatWithAuth';

export function UserSearchScreen() {
  const { searchUsers, authReady, currentFirebaseUser } = useChatWithAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentContacts, setRecentContacts] = useState([]);

  // Updated search function using the hook
  const performSearch = async (query) => {
    if (!authReady || !currentFirebaseUser) {
      console.warn('Authentication not ready');
      Alert.alert('Authentication Required', 'Please wait for authentication to complete');
      return;
    }

    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      // Now using the hook's searchUsers method which handles Firebase UID properly
      const results = await searchUsers(query.trim(), {});
      
      setSearchResults(results.users || []);
      
      // Handle recent contacts if no search results
      if (results.recent && results.users.length === 0) {
        setRecentContacts(results.recent);
      }
      
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Search Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle search input changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchQuery);
    }, 500); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchQuery, authReady, currentFirebaseUser]);

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
        <Text>Please sign in to search for users</Text>
      </View>
    );
  }

  const renderUserItem = ({ item }) => (
    <TouchableOpacity
      style={{
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee'
      }}
      onPress={() => handleUserSelect(item)}
    >
      <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
        {item.firstName} {item.lastName}
      </Text>
      <Text style={{ color: '#666' }}>@{item.username}</Text>
      <Text style={{ color: '#666' }}>{item.email}</Text>
    </TouchableOpacity>
  );

  const handleUserSelect = (user) => {
    // Handle user selection for chat creation
    console.log('Selected user:', user);
    // Navigate to chat or create chat
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <TextInput
        style={{
          height: 40,
          borderColor: '#ddd',
          borderWidth: 1,
          borderRadius: 8,
          paddingHorizontal: 12,
          marginBottom: 16
        }}
        placeholder="Search users by name, username, or email"
        value={searchQuery}
        onChangeText={setSearchQuery}
        autoCorrect={false}
        autoCapitalize="none"
      />

      {loading && <Text>Searching...</Text>}

      <FlatList
        data={searchResults}
        keyExtractor={(item) => item.id || item.firebaseUid}
        renderItem={renderUserItem}
        ListEmptyComponent={
          searchQuery.length >= 2 ? (
            <Text style={{ textAlign: 'center', color: '#666', marginTop: 20 }}>
              No users found
            </Text>
          ) : recentContacts.length > 0 ? (
            <View>
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
                Recent Contacts
              </Text>
              {recentContacts.map(contact => (
                <TouchableOpacity
                  key={contact.id}
                  style={{
                    padding: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: '#eee'
                  }}
                  onPress={() => handleUserSelect(contact)}
                >
                  <Text>{contact.firstName} {contact.lastName}</Text>
                  <Text style={{ color: '#666' }}>@{contact.username}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={{ textAlign: 'center', color: '#666', marginTop: 20 }}>
              Start typing to search for users
            </Text>
          )
        }
      />
    </View>
  );
}