// src/services/ChatService.js
import { Platform } from 'react-native';
import { auth, db, storage } from '../config/firebase.config';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FirebaseService from './FirebaseService';
import PasswordSecurityService from './PasswordSecurityService';
//import AuthDebugUtility, { debugAuth, debugAll } from '../utils/AuthDebugUtility';
// Constants
const STORAGE_KEYS = {
  CHAT_LIST: '@acceilla:chat_list',
  CHAT_MESSAGES: '@acceilla:chat_messages_',
  CHAT_DRAFTS: '@acceilla:chat_drafts',
  OFFLINE_MESSAGE_QUEUE: '@acceilla:offline_message_queue',
  CHAT_SETTINGS: '@acceilla:chat_settings',
  BLOCKED_USERS: '@acceilla:blocked_users'
};

const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file',
  AUDIO: 'audio',
  VIDEO: 'video',
  SYSTEM: 'system'
};

const MESSAGE_STATUS = {
  PENDING: 'pending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
  FAILED: 'failed'
};

const CHAT_TYPES = {
  INDIVIDUAL: 'individual',
  GROUP: 'group',
  ACADEMY: 'academy',
  TEAM: 'team'
};

const MAX_MESSAGE_LENGTH = 4000;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const TYPING_TIMEOUT = 3000; // 3 seconds
const MESSAGE_BATCH_SIZE = 50;

class ChatService {
  constructor() {
    this.auth = auth;
    this.firestore = db;
    this.storage = storage;
    this.isWeb = Platform.OS === 'web';
    this.eventListeners = new Set();
    this.activeListeners = new Map();
    this.typingTimeouts = new Map();
    this.messageQueue = [];
    this.isOnline = true;
    this.isInitialized = false;
    this.allowAnonymousMessaging = false;
    
    this.setupNetworkListener();
    this.initializeService();
    this.setupAuthStateListener();

    // Initialize request tracking
    this.activeRequests = new Map();
    this.requestCounter = 0;

    
  // Initialize with delay to allow other services to load
  setTimeout(() => {
    this.initializeService();
  }, 1000);

    // Debug authentication state
    this.auth.onAuthStateChanged((user) => {
      console.log('Auth state changed:', user ? user.uid : 'No user');
      if (user) {
        console.log('User authenticated, ready for Firebase operations');
      }
    });
  }

  // Event system for real-time updates
  addEventListener(callback) {
    this.eventListeners.add(callback);
    return () => this.eventListeners.delete(callback);
  }

  emitEvent(type, data) {
    this.eventListeners.forEach(listener => {
      try {
        listener({ type, data });
      } catch (error) {
        console.warn('Chat event listener error:', error);
      }
    });
  }

  // Initialize service
async initializeService() {
  try {
    console.log('💬 Initializing Chat Service...');
    
    // Initialize authentication first
    const authUser = await this.waitForAuth();
    
    if (!authUser) {
      console.warn('⚠️ Chat Service initialized without authentication');
      return { success: false, error: 'No authenticated user' };
    }

    console.log('✅ Chat Service authenticated as:', {
      uid: authUser.uid,
      email: authUser.email,
      mode: authUser.isOfflineMode ? 'offline' : 'online'
    });
    
    // Load cached data
    await this.loadCachedData();
    
    // Start message queue processor
    this.startMessageQueueProcessor();
    
    // Set initialized flag
    this.isInitialized = true;
    
    console.log('✅ Chat Service initialized successfully');
    return { success: true, authUser };
    
  } catch (error) {
    console.error('❌ Chat Service initialization failed:', error);
    return { success: false, error: error.message };
  }
}

// 9. NEW: Auth state change listener for ChatService
setupAuthStateListener() {
  return this.auth.onAuthStateChanged((user) => {
    console.log('🔄 Chat Auth state changed:', user ? user.uid : 'No user');
    
    if (user) {
      console.log('✅ Firebase user authenticated for chat:', user.uid);
      this.emitEvent('authStateChanged', { 
        authenticated: true, 
        user: user 
      });
    } else {
      console.log('❌ No Firebase user for chat');
      this.emitEvent('authStateChanged', { 
        authenticated: false, 
        user: null 
      });
    }
  });
}

//wait for authentication
// Updated waitForAuth method in ChatService.js
async waitForAuth() {
  return new Promise(async (resolve) => {
    try {
      console.log('💬 ChatService: Waiting for authentication...');
      
      // Step 1: Get local user
      const localUserJson = await AsyncStorage.getItem('authenticatedUser');
      if (!localUserJson) {
        console.log('❌ No local user found');
        resolve(null);
        return;
      }

      const localUser = JSON.parse(localUserJson);
      console.log('✅ Local user found:', localUser.email);

      // Step 2: Check if Firebase is already authenticated
      if (this.auth.currentUser) {
        console.log('✅ Firebase user already authenticated:', this.auth.currentUser.uid);
        resolve(this.auth.currentUser);
        return;
      }

      // Step 3: Attempt Firebase authentication bridge
      console.log('🔄 Attempting Firebase authentication bridge...');
      
      try {
        // Import AuthService dynamically to avoid circular imports
        const AuthService = (await import('./AuthService')).default;
        
        // Use the enhanced bridge method
        const authResult = await this.bridgeToFirebaseAuth(localUser, AuthService);
        
        if (authResult.success) {
          console.log('✅ Firebase auth bridge successful');
          resolve(authResult.user);
        } else {
          console.log('⚠️ Firebase auth failed, using offline mode');
          resolve(this.createOfflineUser(localUser));
        }

      } catch (authError) {
        console.warn('❌ Firebase auth bridge failed:', authError.message);
        console.log('📱 Falling back to offline mode');
        resolve(this.createOfflineUser(localUser));
      }

    } catch (error) {
      console.error('❌ Error in waitForAuth:', error);
      resolve(null);
    }
  });
}


// 2. NEW: Enhanced Firebase authentication bridge
async bridgeToFirebaseAuth(localUser, AuthService) {
  try {
    console.log('🔐 Starting Firebase Auth bridge...');
    
    // Method 1: Check local user
    let password = localUser.password;
    
    // Method 2: Check registered users array
    if (!password) {
      console.log('Checking registered users for password...');
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const registeredUsersJson = await AsyncStorage.getItem('registeredUsers');
      
      if (registeredUsersJson) {
        const registeredUsers = JSON.parse(registeredUsersJson);
        const userWithPassword = registeredUsers.find(u => 
          u.email === localUser.email && u.password
        );
        
        if (userWithPassword) {
          console.log('✅ Found password in registered users');
          password = userWithPassword.password;
        }
      }
    }
    
    if (password) {
      console.log('🔐 Attempting Firebase authentication...');
      
      const { signInWithEmailAndPassword } = require('firebase/auth');
      const userCredential = await signInWithEmailAndPassword(
        this.auth, 
        localUser.email, 
        password
      );
      
      console.log('✅ Firebase Auth successful!', userCredential.user.uid);
      return { success: true, user: userCredential.user };
    }
    
    // Fallback to offline mode
    console.log('⚠️ No password available, using offline mode');
    return {
      success: true,
      user: this.createOfflineUser(localUser),
      mode: 'offline'
    };
    
  } catch (error) {
    console.error('Firebase auth error:', error);
    return { success: false, error: error.message };
  }
}


// 3. NEW: Create Firebase account for existing local user
async createFirebaseAccountForExistingUser(localUser, password) {
  try {
    console.log('🆕 Creating Firebase account for existing local user');
    
    let userCredential;
    
    if (this.isWeb) {
      const { createUserWithEmailAndPassword } = require('firebase/auth');
      userCredential = await createUserWithEmailAndPassword(
        this.auth, 
        localUser.email, 
        password
      );
    } else {
      userCredential = await this.auth.createUserWithEmailAndPassword(
        localUser.email, 
        password
      );
    }

    // Update local user with Firebase UID
    const updatedUser = {
      ...localUser,
      firebaseUid: userCredential.user.uid,
      syncedToServer: true,
      lastSyncAt: new Date().toISOString()
    };

    await AsyncStorage.setItem('authenticatedUser', JSON.stringify(updatedUser));
    
    // Also update in registered users list
    const registeredUsers = await AsyncStorage.getItem('registeredUsers');
    if (registeredUsers) {
      const users = JSON.parse(registeredUsers);
      const userIndex = users.findIndex(u => u.email === localUser.email);
      if (userIndex >= 0) {
        users[userIndex] = updatedUser;
        await AsyncStorage.setItem('registeredUsers', JSON.stringify(users));
      }
    }

    console.log('✅ Firebase account created and local user updated');
    return { success: true, user: userCredential.user };

  } catch (error) {
    console.error('❌ Failed to create Firebase account:', error);
    throw error;
  }
}

// 4. NEW: Anonymous authentication for messaging (fallback)
async createAnonymousFirebaseSession(localUser) {
  try {
    console.log('👤 Creating anonymous Firebase session for messaging');
    
    let userCredential;
    
    if (this.isWeb) {
      const { signInAnonymously } = require('firebase/auth');
      userCredential = await signInAnonymously(this.auth);
    } else {
      userCredential = await this.auth.signInAnonymously();
    }

    // Link the anonymous account with user data for messaging
    const anonymousUser = userCredential.user;
    
    // Store mapping for message attribution
    await AsyncStorage.setItem(`anonymous_user_${anonymousUser.uid}`, JSON.stringify({
      localUserId: localUser.id || localUser.firebaseUid,
      email: localUser.email,
      displayName: `${localUser.firstName} ${localUser.lastName}`,
      createdAt: new Date().toISOString()
    }));

    console.log('✅ Anonymous Firebase session created');
    return { 
      success: true, 
      user: {
        ...anonymousUser,
        displayName: `${localUser.firstName} ${localUser.lastName}`,
        email: localUser.email,
        isAnonymous: true,
        localUser: localUser
      }
    };

  } catch (error) {
    console.error('❌ Anonymous auth failed:', error);
    throw error;
  }
}

// 5. NEW: Create offline user object for messaging
createOfflineUser(localUser) {
  return {
    uid: localUser.firebaseUid || localUser.id || `offline_${Date.now()}`,
    email: localUser.email,
    displayName: `${localUser.firstName} ${localUser.lastName}`,
    isOfflineMode: true,
    localUser: localUser
  };
}

// 6. NEW: Check if anonymous auth should be used
shouldUseAnonymousAuth() {
  // Only use anonymous auth if explicitly enabled and online
  return this.isOnline && this.allowAnonymousMessaging;
}

// Add helper method to get stored password
async getStoredPasswordForUser(userId) {
  try {
    // Try to get the password hash first
    const passwordData = await PasswordSecurityService.getPasswordSecurely(userId);
    if (passwordData) {
      // If it's a hash object, we need the plain password for Firebase Auth
      // This is a limitation - we can't recover plain password from hash
      console.warn('Cannot authenticate with Firebase using stored hash');
      return null;
    }
    
    // Alternative: Check if we have a legacy plain password stored
    const localUser = await AsyncStorage.getItem('authenticatedUser');
    if (localUser) {
      const userData = JSON.parse(localUser);
      // If user has legacy password field, use it (but migrate to hash)
      return userData.password || null;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting stored password:', error);
    return null;
  }
}

// Add helper method to sign in to Firebase
async signInToFirebase(email, password) {
  try {
    if (this.isWeb) {
      const { signInWithEmailAndPassword } = require('firebase/auth');
      return await signInWithEmailAndPassword(this.auth, email, password);
    } else {
      return await this.auth.signInWithEmailAndPassword(email, password);
    }
  } catch (error) {
    console.error('Firebase sign in failed:', error);
    throw error;
  }
}

  // Network monitoring
  setupNetworkListener() {
    NetInfo.addEventListener(async (state) => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected ?? false;
      
      if (!wasOnline && this.isOnline) {
        // Process pending messages when back online
        setTimeout(() => {
          this.processPendingMessages();
        }, 2000);
      }
      
      this.emitEvent('networkStatusChanged', { isOnline: this.isOnline });
    });
  }

  // Load cached data on startup
  async loadCachedData() {
    try {
      const chatListJson = await AsyncStorage.getItem(STORAGE_KEYS.CHAT_LIST);
      if (chatListJson) {
        const cachedChats = JSON.parse(chatListJson);
        this.emitEvent('chatsLoaded', { chats: cachedChats, source: 'cache' });
      }
    } catch (error) {
      console.warn('Failed to load cached chat data:', error);
    }
  }

  // ===== CHAT LIST METHODS =====

  // Get user's chat list
  async getChatList(userId) {
    try {
      console.log('📋 Getting chat list for user:', userId);
      
      if (!userId) {
        throw new Error('User ID is required');
      }

      // Try to get from Firebase first if online
      if (this.isOnline) {
        try {
          const firebaseChats = await this.getChatListFromFirebase(userId);
          
          // Cache the results
          await AsyncStorage.setItem(STORAGE_KEYS.CHAT_LIST, JSON.stringify(firebaseChats));
          
          this.emitEvent('chatsLoaded', { chats: firebaseChats, source: 'firebase' });
          return { success: true, chats: firebaseChats, source: 'online' };
          
        } catch (firebaseError) {
          console.warn('Firebase chat list failed, trying cache:', firebaseError.message);
        }
      }

      // Fallback to cached data
      const cachedChats = await this.getCachedChatList();
      this.emitEvent('chatsLoaded', { chats: cachedChats, source: 'cache' });
      
      return { 
        success: true, 
        chats: cachedChats, 
        source: 'cache',
        message: this.isOnline ? 'Using cached data due to connection issues' : 'Offline mode - using cached data'
      };
      
    } catch (error) {
      console.error('❌ Error getting chat list:', error);
      throw error;
    }
  }

  // Get chat list from Firebase
async getChatListFromFirebase(userId) {
  try {
    // Enhanced auth check - accept local users too
    const localUser = await AsyncStorage.getItem('authenticatedUser');
    const firebaseUser = this.auth.currentUser;
    
    if (!firebaseUser && !localUser) {
      throw new Error('User not authenticated');
    }

    if (!this.isOnline) {
      throw new Error('Device is offline');
    }

    // Use Firebase UID if available, otherwise use local user ID
    const searchUserId = firebaseUser?.uid || 
                        (localUser ? JSON.parse(localUser).firebaseUid || JSON.parse(localUser).id : userId);

    console.log('Searching chats for user ID:', searchUserId);

    let chats = [];

    if (this.isWeb) {
      const { collection, query, where, orderBy, limit, getDocs } = require('firebase/firestore');
      
      const chatsRef = collection(this.firestore, 'chats');
      const q = query(
        chatsRef,
        where('participants', 'array-contains', searchUserId),
        orderBy('updatedAt', 'desc'),
        limit(100)
      );
      
      const querySnapshot = await getDocs(q);
      chats = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastMessage: this.convertTimestamp(doc.data().lastMessage)
      }));
      
    } else {
      const querySnapshot = await this.firestore
        .collection('chats')
        .where('participants', 'array-contains', searchUserId)
        .orderBy('updatedAt', 'desc')
        .limit(100)
        .get();
        
      chats = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastMessage: this.convertTimestamp(doc.data().lastMessage)
      }));
    }

    return await this.enrichChatListWithUserData(chats, searchUserId);
    
  } catch (error) {
    console.error('Firebase chat list error:', error);
    throw error;
  }
}

// Method 2: If you need to map your custom ID to Firebase UID
// Add this method to your ChatService:
async mapCustomUserIdToFirebaseUid(customUserId) {
  try {
    // Check if current user matches
    if (this.auth.currentUser) {
      // You could store the mapping in your user document
      const userDoc = await this.getUserInfo(this.auth.currentUser.uid);
      if (userDoc && userDoc.customId === customUserId) {
        return this.auth.currentUser.uid;
      }
    }
    return null;
  } catch (error) {
    console.warn('Error mapping user ID:', error);
    return null;
  }
}

  // Enrich chat data with user information
  async enrichChatListWithUserData(chats, currentUserId) {
    try {
      const enrichedChats = await Promise.all(
        chats.map(async (chat) => {
          try {
            // Get participant info (excluding current user for individual chats)
            const otherParticipants = chat.participants.filter(id => id !== currentUserId);
            let chatName = chat.name || '';
            let chatAvatar = chat.avatar || '';
            
            if (chat.type === CHAT_TYPES.INDIVIDUAL && otherParticipants.length === 1) {
              // For individual chats, get the other user's info
              const otherUser = await this.getUserInfo(otherParticipants[0]);
              if (otherUser) {
                chatName = `${otherUser.firstName} ${otherUser.lastName}`.trim();
                chatAvatar = otherUser.profileImage || '';
              }
            } else if (chat.type === CHAT_TYPES.GROUP && !chatName) {
              // For group chats without names, create a name from participants
              const participantNames = await Promise.all(
                otherParticipants.slice(0, 3).map(async (id) => {
                  const user = await this.getUserInfo(id);
                  return user ? user.firstName : 'Unknown';
                })
              );
              chatName = participantNames.join(', ');
              if (otherParticipants.length > 3) {
                chatName += ` +${otherParticipants.length - 3}`;
              }
            }

            return {
              ...chat,
              displayName: chatName,
              displayAvatar: chatAvatar,
              participantCount: chat.participants.length,
              unreadCount: chat.unreadCounts?.[currentUserId] || 0
            };
            
          } catch (error) {
            console.warn('Error enriching chat:', chat.id, error);
            return {
              ...chat,
              displayName: chat.name || 'Unknown Chat',
              displayAvatar: '',
              participantCount: chat.participants.length,
              unreadCount: 0
            };
          }
        })
      );

      return enrichedChats;
    } catch (error) {
      console.error('Error enriching chat list:', error);
      return chats;
    }
  }

  // Get cached chat list
  async getCachedChatList() {
    try {
      const cachedJson = await AsyncStorage.getItem(STORAGE_KEYS.CHAT_LIST);
      return cachedJson ? JSON.parse(cachedJson) : [];
    } catch (error) {
      console.warn('Error getting cached chat list:', error);
      return [];
    }
  }

  //debug

  handleDebugAll = async () => {
    await debugAll();
  };



  // ===== USER SEARCH METHODS =====

  // Search users for new chats
async searchUsers(query, currentUserId, filters = {}) {
  let requestId = null;
  
  try {
    console.log('🔍 Searching users:', query, 'filters:', filters);
    
    if (!query || query.trim().length < 2) {
      return { success: true, users: [], recent: await this.getRecentContacts(currentUserId) };
    }

    const searchQuery = query.trim().toLowerCase();
    let searchResults = [];

    if (this.isOnline) {
      try {
        // Create request tracking
        requestId = `search_${this.requestCounter++}`;
        const requestTracker = {
          id: requestId,
          type: 'userSearch',
          startTime: Date.now(),
          abortController: new AbortController()
        };
        
        this.activeRequests.set(requestId, requestTracker);
        
        // Add timeout and abort signal
        const searchPromise = this.searchUsersInFirebase(
          searchQuery, 
          currentUserId, 
          filters,
          requestTracker.abortController.signal
        );
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => {
            this.cancelRequest(requestId);
            reject(new Error('Search timeout'));
          }, 10000)
        );
        
        searchResults = await Promise.race([searchPromise, timeoutPromise]);
        
        // Clean up successful request
        this.cleanupRequest(requestId);
        
      } catch (firebaseError) {
        console.warn('Firebase user search failed:', firebaseError.message);
        this.cleanupRequest(requestId);
        searchResults = [];
      }
    }

    // Search in local contacts/cached users
    const localResults = await this.searchUsersLocally(searchQuery, currentUserId);
    
    // Combine and deduplicate results
    const combinedResults = this.deduplicateUsers([...searchResults, ...localResults]);
    
    return { 
      success: true, 
      users: combinedResults,
      source: this.isOnline && searchResults.length > 0 ? 'online' : 'cache'
    };
    
  } catch (error) {
    console.error('❌ User search error:', error);
    
    // Clean up failed request
    if (requestId) {
      this.cleanupRequest(requestId);
    }
    
    throw error;
  }
}

// Add request management methods
cancelRequest(requestId) {
  const request = this.activeRequests.get(requestId);
  if (request && request.abortController) {
    try {
      request.abortController.abort();
      console.log('Cancelled request:', requestId);
    } catch (error) {
      console.warn('Error cancelling request:', requestId, error);
    }
  }
}

cleanupRequest(requestId) {
  if (requestId && this.activeRequests.has(requestId)) {
    this.activeRequests.delete(requestId);
  }
}

  // Search users in Firebase
async searchUsersInFirebase(query, currentUserId, filters, abortSignal = null) {
  const requestId = `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    // Check for cancellation at start
    if (abortSignal && abortSignal.aborted) {
      throw new Error('Request aborted');
    }
    
    // Check authentication first
    if (!this.auth.currentUser) {
      throw new Error('User not authenticated');
    }

    console.log('Starting Firebase user search for:', query);
    
    const searchFields = ['firstName', 'lastName', 'username', 'email'];
    const allResults = [];
    const searchPromises = [];

    for (const field of searchFields) {
      // Check for cancellation before each field search
      if (abortSignal && abortSignal.aborted) {
        break;
      }
      
      const searchPromise = this.performFieldSearch(field, query, abortSignal, requestId)
        .then(users => {
          if (abortSignal && abortSignal.aborted) {
            return [];
          }
          return users || [];
        })
        .catch(error => {
          // Log the error but don't throw - just return empty array
          console.warn(`Field search failed for ${field}:`, error.message);
          
          // Check if it's the tracking error and handle it gracefully
          if (error.message && error.message.includes('stopTracking')) {
            console.warn('Network tracking error detected, continuing with empty results');
            return [];
          }
          
          return [];
        });
      
      searchPromises.push(searchPromise);
    }

    // Wait for all searches with proper error handling
    try {
      const searchResults = await Promise.allSettled(searchPromises);
      
      searchResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && Array.isArray(result.value)) {
          allResults.push(...result.value);
        } else if (result.status === 'rejected') {
          console.warn(`Search rejected for field ${searchFields[index]}:`, result.reason);
        }
      });
    } catch (promiseError) {
      console.warn('Promise.allSettled error:', promiseError);
      // Continue with whatever results we have
    }

    if (abortSignal && abortSignal.aborted) {
      return [];
    }

    // Filter and process results
    let filteredResults = allResults.filter(user => 
      user && 
      typeof user === 'object' &&
      user.id !== currentUserId && 
      user.firebaseUid !== currentUserId
    );

    // Apply additional filters
    if (filters.userType) {
      filteredResults = filteredResults.filter(user => 
        user.userType === filters.userType
      );
    }

    if (filters.sport) {
      filteredResults = filteredResults.filter(user => 
        user.sport && user.sport.toLowerCase().includes(filters.sport.toLowerCase())
      );
    }

    const deduplicatedResults = this.deduplicateUsers(filteredResults);
    console.log(`Firebase search completed: ${deduplicatedResults.length} results`);
    
    return deduplicatedResults.slice(0, 20);
    
  } catch (error) {
    console.error('Firebase user search error:', error);
    
    // Handle specific tracking errors gracefully
    if (error.message && error.message.includes('stopTracking')) {
      console.warn('Network tracking error - returning empty results');
      return [];
    }
    
    if (error.name === 'AbortError' || error.message === 'Request aborted') {
      console.log('Search request was cancelled');
      return [];
    }
    
    return [];
  }
}

// Update performFieldSearch to handle tracking errors
async performFieldSearch(field, query, abortSignal = null, requestId = null) {
  try {
    // Check for abort signal
    if (abortSignal && abortSignal.aborted) {
      return [];
    }

    let users = [];
    const searchValue = query.toLowerCase().trim();

    if (this.isWeb) {
      const { collection, query: firestoreQuery, where, limit, getDocs } = require('firebase/firestore');
      
      const usersRef = collection(this.firestore, 'users');
      const q = firestoreQuery(
        usersRef,
        where(field, '>=', searchValue),
        where(field, '<=', searchValue + '\uf8ff'),
        limit(20)
      );
      
      // Wrap getDocs in error handling
      try {
        const querySnapshot = await getDocs(q);
        users = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (firestoreError) {
        console.warn(`Firestore query failed for field ${field}:`, firestoreError);
        
        // Handle specific Firestore errors
        if (firestoreError.code === 'permission-denied') {
          console.warn('Permission denied - user may not be properly authenticated');
          return [];
        }
        
        // For other errors, throw to be caught by caller
        throw firestoreError;
      }
      
    } else {
      try {
        const querySnapshot = await this.firestore
          .collection('users')
          .where(field, '>=', searchValue)
          .where(field, '<=', searchValue + '\uf8ff')
          .limit(20)
          .get();
          
        users = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (firestoreError) {
        console.warn(`Firestore query failed for field ${field}:`, firestoreError);
        throw firestoreError;
      }
    }

    return users.filter(user => user && typeof user === 'object');
    
  } catch (error) {
    console.warn(`Search error for field ${field}:`, error.message);
    
    // Handle tracking errors specifically
    if (error.message && error.message.includes('stopTracking')) {
      console.warn(`Network tracking error in field search for ${field} - returning empty array`);
      return [];
    }
    
    throw error;
  }
}

  // Search users locally
  async searchUsersLocally(query, currentUserId) {
    try {
      // Search in recent contacts first
      const recentContacts = await this.getRecentContacts(currentUserId);
      
      return recentContacts.filter(user => {
        const searchableText = `${user.firstName} ${user.lastName} ${user.username} ${user.email}`.toLowerCase();
        return searchableText.includes(query) && user.id !== currentUserId;
      });
      
    } catch (error) {
      console.warn('Local user search error:', error);
      return [];
    }
  }

  // Get recent contacts
  async getRecentContacts(userId) {
    try {
      const chats = await this.getCachedChatList();
      const recentUserIds = new Set();
      
      // Extract user IDs from recent chats
      chats.forEach(chat => {
        chat.participants.forEach(participantId => {
          if (participantId !== userId) {
            recentUserIds.add(participantId);
          }
        });
      });

      // Get user info for recent contacts
      const recentContacts = await Promise.all(
        Array.from(recentUserIds).slice(0, 10).map(async (userId) => {
          const userInfo = await this.getUserInfo(userId);
          return userInfo;
        })
      );

      return recentContacts.filter(Boolean);
      
    } catch (error) {
      console.warn('Error getting recent contacts:', error);
      return [];
    }
  }

  // Deduplicate users array
  deduplicateUsers(users) {
    const seen = new Set();
    return users.filter(user => {
      const key = user.id || user.firebaseUid || user.email;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  // ===== CHAT CREATION METHODS =====

  // Create or get existing chat
  async createOrGetChat(participants, chatType = CHAT_TYPES.INDIVIDUAL, chatData = {}) {
    try {
      console.log('💬 Creating/getting chat for participants:', participants);
      
      if (!participants || participants.length < 2) {
        throw new Error('At least 2 participants required');
      }

      // Sort participants for consistent chat ID generation
      const sortedParticipants = [...participants].sort();
      
      // Check if chat already exists (for individual chats)
      if (chatType === CHAT_TYPES.INDIVIDUAL && participants.length === 2) {
        const existingChat = await this.findExistingIndividualChat(sortedParticipants);
        if (existingChat) {
          return { success: true, chat: existingChat, created: false };
        }
      }

      // Create new chat
      const newChat = {
        id: this.generateChatId(),
        participants: sortedParticipants,
        type: chatType,
        name: chatData.name || '',
        description: chatData.description || '',
        avatar: chatData.avatar || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastMessage: null,
        unreadCounts: {},
        settings: {
          notifications: true,
          muteUntil: null
        }
      };

      // Initialize unread counts
      participants.forEach(participantId => {
        newChat.unreadCounts[participantId] = 0;
      });

      if (this.isOnline) {
        try {
          // Save to Firebase
          await this.saveChatToFirebase(newChat);
          
          // Update local cache
          await this.updateChatInCache(newChat);
          
          this.emitEvent('chatCreated', { chat: newChat });
          
          return { success: true, chat: newChat, created: true };
          
        } catch (firebaseError) {
          console.warn('Failed to save chat to Firebase, saving locally:', firebaseError.message);
        }
      }

      // Save locally (offline or Firebase failed)
      await this.updateChatInCache(newChat);
      
      // Queue for sync when online
      await this.queueChatOperation('CREATE_CHAT', newChat);
      
      this.emitEvent('chatCreated', { chat: newChat, queued: true });
      
      return { 
        success: true, 
        chat: newChat, 
        created: true,
        mode: 'offline',
        message: 'Chat created offline. Will sync when connected.'
      };
      
    } catch (error) {
      console.error('❌ Error creating chat:', error);
      throw error;
    }
  }

  // Find existing individual chat
  async findExistingIndividualChat(participants) {
    try {
      if (this.isOnline) {
        // Check Firebase first
        if (this.isWeb) {
          const { collection, query, where, limit, getDocs } = require('firebase/firestore');
          
          const chatsRef = collection(this.firestore, 'chats');
          const q = query(
            chatsRef,
            where('participants', '==', participants),
            where('type', '==', CHAT_TYPES.INDIVIDUAL),
            limit(1)
          );
          
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            return { id: doc.id, ...doc.data() };
          }
          
        } else {
          const querySnapshot = await this.firestore
            .collection('chats')
            .where('participants', '==', participants)
            .where('type', '==', CHAT_TYPES.INDIVIDUAL)
            .limit(1)
            .get();
            
          if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            return { id: doc.id, ...doc.data() };
          }
        }
      }

      // Check local cache
      const cachedChats = await this.getCachedChatList();
      return cachedChats.find(chat => 
        chat.type === CHAT_TYPES.INDIVIDUAL &&
        JSON.stringify(chat.participants.sort()) === JSON.stringify(participants.sort())
      );
      
    } catch (error) {
      console.warn('Error finding existing chat:', error);
      return null;
    }
  }

  // Save chat to Firebase
  async saveChatToFirebase(chat) {
    try {
      const chatData = { ...chat };
      
      // Convert timestamps for Firebase
      if (this.isWeb) {
        const { serverTimestamp } = require('firebase/firestore');
        chatData.createdAt = serverTimestamp();
        chatData.updatedAt = serverTimestamp();
      } else {
        chatData.createdAt = this.firestore.FieldValue.serverTimestamp();
        chatData.updatedAt = this.firestore.FieldValue.serverTimestamp();
      }

      if (this.isWeb) {
        const { doc, setDoc } = require('firebase/firestore');
        const chatDocRef = doc(this.firestore, 'chats', chat.id);
        await setDoc(chatDocRef, chatData);
      } else {
        await this.firestore.collection('chats').doc(chat.id).set(chatData);
      }
      
    } catch (error) {
      console.error('Error saving chat to Firebase:', error);
      throw error;
    }
  }

  // ===== MESSAGE METHODS =====

  // Get messages for a chat
  async getChatMessages(chatId, limit = MESSAGE_BATCH_SIZE, lastMessageId = null) {
    try {
      console.log('📨 Getting messages for chat:', chatId);
      
      if (this.isOnline) {
        try {
          const firebaseMessages = await this.getMessagesFromFirebase(chatId, limit, lastMessageId);
          
          // Cache the messages
          await this.cacheMessages(chatId, firebaseMessages);
          
          return { success: true, messages: firebaseMessages, source: 'firebase' };
          
        } catch (firebaseError) {
          console.warn('Firebase messages failed, using cache:', firebaseError.message);
        }
      }

      // Fallback to cached messages
      const cachedMessages = await this.getCachedMessages(chatId, limit, lastMessageId);
      
      return { 
        success: true, 
        messages: cachedMessages, 
        source: 'cache',
        message: this.isOnline ? 'Using cached data due to connection issues' : 'Offline mode'
      };
      
    } catch (error) {
      console.error('❌ Error getting chat messages:', error);
      throw error;
    }
  }

  // Get messages from Firebase
  async getMessagesFromFirebase(chatId, limit, lastMessageId) {
    try {
      let messages = [];

      if (this.isWeb) {
        const { collection, query, where, orderBy, limit: limitQuery, startAfter, getDocs, doc, getDoc } = require('firebase/firestore');
        
        const messagesRef = collection(this.firestore, 'messages');
        let q = query(
          messagesRef,
          where('chatId', '==', chatId),
          orderBy('timestamp', 'desc'),
          limitQuery(limit)
        );
        
        if (lastMessageId) {
          const lastDoc = await getDoc(doc(this.firestore, 'messages', lastMessageId));
          if (lastDoc.exists()) {
            q = query(
              messagesRef,
              where('chatId', '==', chatId),
              orderBy('timestamp', 'desc'),
              startAfter(lastDoc),
              limitQuery(limit)
            );
          }
        }
        
        const querySnapshot = await getDocs(q);
        messages = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: this.convertTimestamp(doc.data().timestamp)
        }));
        
      } else {
        let query = this.firestore
          .collection('messages')
          .where('chatId', '==', chatId)
          .orderBy('timestamp', 'desc')
          .limit(limit);
          
        if (lastMessageId) {
          const lastDoc = await this.firestore.collection('messages').doc(lastMessageId).get();
          if (lastDoc.exists) {
            query = query.startAfter(lastDoc);
          }
        }
        
        const querySnapshot = await query.get();
        messages = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: this.convertTimestamp(doc.data().timestamp)
        }));
      }

      return messages.reverse(); // Return in chronological order
      
    } catch (error) {
      console.error('Firebase messages error:', error);
      throw error;
    }
  }

  // Send message
  async sendMessage(chatId, messageData) {
    try {
      console.log('📤 Sending message to chat:', chatId);
      
      const message = {
        id: this.generateMessageId(),
        chatId,
        senderId: messageData.senderId,
        text: messageData.text?.substring(0, MAX_MESSAGE_LENGTH) || '',
        type: messageData.type || MESSAGE_TYPES.TEXT,
        timestamp: new Date().toISOString(),
        status: MESSAGE_STATUS.PENDING,
        attachments: messageData.attachments || [],
        metadata: messageData.metadata || {},
        replyTo: messageData.replyTo || null,
        reactions: {}
      };

      // Add to message queue for processing
      this.addToMessageQueue(message);
      
      // Store locally immediately for instant UI feedback
      await this.addMessageToCache(chatId, message);
      
      // Update chat's last message
      await this.updateChatLastMessage(chatId, message);
      
      this.emitEvent('messageSent', { message, chatId });
      
      return { success: true, message };
      
    } catch (error) {
      console.error('❌ Error sending message:', error);
      throw error;
    }
  }

  // Add message to processing queue
  addToMessageQueue(message) {
    this.messageQueue.push({
      ...message,
      attempts: 0,
      maxAttempts: 3,
      nextAttempt: Date.now()
    });
    
    // Process immediately if online
    if (this.isOnline) {
      this.processNextMessage();
    }
  }

  // Process message queue
  async processNextMessage() {
    if (this.messageQueue.length === 0 || !this.isOnline) {
      return;
    }

    const message = this.messageQueue[0];
    
    if (Date.now() < message.nextAttempt) {
      // Wait for retry delay
      setTimeout(() => this.processNextMessage(), message.nextAttempt - Date.now());
      return;
    }

    try {
      await this.sendMessageToFirebase(message);
      
      // Remove from queue on success
      this.messageQueue.shift();
      
      // Update message status locally
      await this.updateMessageStatus(message.chatId, message.id, MESSAGE_STATUS.SENT);
      
      this.emitEvent('messageStatusUpdated', {
        chatId: message.chatId,
        messageId: message.id,
        status: MESSAGE_STATUS.SENT
      });
      
      // Process next message
      this.processNextMessage();
      
    } catch (error) {
      console.error('Failed to send message:', error);
      
      message.attempts++;
      
      if (message.attempts >= message.maxAttempts) {
        // Mark as failed and remove from queue
        this.messageQueue.shift();
        await this.updateMessageStatus(message.chatId, message.id, MESSAGE_STATUS.FAILED);
        
        this.emitEvent('messageStatusUpdated', {
          chatId: message.chatId,
          messageId: message.id,
          status: MESSAGE_STATUS.FAILED
        });
      } else {
        // Retry with exponential backoff
        message.nextAttempt = Date.now() + (1000 * Math.pow(2, message.attempts));
      }
      
      // Continue processing
      setTimeout(() => this.processNextMessage(), 1000);
    }
  }

  // Send message to Firebase
  async sendMessageToFirebase(message) {
    try {
      const messageData = { ...message };
      
      // Convert timestamp for Firebase
      if (this.isWeb) {
        const { serverTimestamp } = require('firebase/firestore');
        messageData.timestamp = serverTimestamp();
      } else {
        messageData.timestamp = this.firestore.FieldValue.serverTimestamp();
      }

      if (this.isWeb) {
        const { doc, setDoc } = require('firebase/firestore');
        const messageDocRef = doc(this.firestore, 'messages', message.id);
        await setDoc(messageDocRef, messageData);
      } else {
        await this.firestore.collection('messages').doc(message.id).set(messageData);
      }
      
      // Update chat's last message
      await this.updateChatLastMessageInFirebase(message.chatId, message);
      
    } catch (error) {
      console.error('Error sending message to Firebase:', error);
      throw error;
    }
  }

  // ===== REAL-TIME LISTENERS =====

  // Subscribe to chat messages
  subscribeToChat(chatId, callback) {
    try {
      console.log('🔄 Subscribing to chat:', chatId);
      
      if (!this.isOnline) {
        console.log('Device offline, using cached chat list only');
        return () => {}; // Return empty unsubscribe function
      }

      let unsubscribe;

      if (this.isWeb) {
        const { collection, query, where, orderBy, onSnapshot } = require('firebase/firestore');
        
        const chatsRef = collection(this.firestore, 'chats');
        const q = query(
          chatsRef,
          where('participants', 'array-contains', userId),
          orderBy('updatedAt', 'desc')
        );
        
        unsubscribe = onSnapshot(q, (snapshot) => {
          const chats = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            lastMessage: this.convertTimestamp(doc.data().lastMessage)
          }));
          
          // Enrich and cache
          this.enrichChatListWithUserData(chats, userId).then(enrichedChats => {
            callback(enrichedChats);
            AsyncStorage.setItem(STORAGE_KEYS.CHAT_LIST, JSON.stringify(enrichedChats));
          });
        });
        
      } else {
        unsubscribe = this.firestore
          .collection('chats')
          .where('participants', 'array-contains', userId)
          .orderBy('updatedAt', 'desc')
          .onSnapshot((snapshot) => {
            const chats = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              lastMessage: this.convertTimestamp(doc.data().lastMessage)
            }));
            
            // Enrich and cache
            this.enrichChatListWithUserData(chats, userId).then(enrichedChats => {
              callback(enrichedChats);
              AsyncStorage.setItem(STORAGE_KEYS.CHAT_LIST, JSON.stringify(enrichedChats));
            });
          });
      }

      // Store the unsubscribe function
      this.activeListeners.set(`chatList_${userId}`, unsubscribe);
      
      return unsubscribe;
      
    } catch (error) {
      console.error('Error subscribing to chat list:', error);
      return () => {}; // Return empty unsubscribe function
    }
  }

  // Unsubscribe from listeners
  unsubscribeFromChat(chatId) {
    const unsubscribe = this.activeListeners.get(chatId);
    if (unsubscribe) {
      unsubscribe();
      this.activeListeners.delete(chatId);
      console.log('Unsubscribed from chat:', chatId);
    }
  }

  unsubscribeFromChatList(userId) {
    const unsubscribe = this.activeListeners.get(`chatList_${userId}`);
    if (unsubscribe) {
      unsubscribe();
      this.activeListeners.delete(`chatList_${userId}`);
      console.log('Unsubscribed from chat list for user:', userId);
    }
  }

  // ===== TYPING INDICATORS =====

  // Send typing indicator
  async sendTypingIndicator(chatId, userId, isTyping = true) {
    try {
      if (!this.isOnline || !chatId || !userId) return;

      const typingData = {
        userId,
        isTyping,
        timestamp: Date.now()
      };

      if (this.isWeb) {
        const { doc, setDoc } = require('firebase/firestore');
        const typingDocRef = doc(this.firestore, 'typing', `${chatId}_${userId}`);
        await setDoc(typingDocRef, typingData);
      } else {
        await this.firestore
          .collection('typing')
          .doc(`${chatId}_${userId}`)
          .set(typingData);
      }

      // Clear typing indicator after timeout
      if (isTyping) {
        const existingTimeout = this.typingTimeouts.get(`${chatId}_${userId}`);
        if (existingTimeout) clearTimeout(existingTimeout);

        const timeout = setTimeout(() => {
          this.sendTypingIndicator(chatId, userId, false);
        }, TYPING_TIMEOUT);

        this.typingTimeouts.set(`${chatId}_${userId}`, timeout);
      }
      
    } catch (error) {
      console.warn('Error sending typing indicator:', error);
    }
  }

  // Subscribe to typing indicators
  subscribeToTyping(chatId, callback) {
    try {
      if (!this.isOnline) return () => {};

      let unsubscribe;

      if (this.isWeb) {
        const { collection, query, where, onSnapshot } = require('firebase/firestore');
        
        const typingRef = collection(this.firestore, 'typing');
        const q = query(typingRef, where('chatId', '==', chatId));
        
        unsubscribe = onSnapshot(q, (snapshot) => {
          const typingUsers = snapshot.docs
            .map(doc => doc.data())
            .filter(data => data.isTyping && (Date.now() - data.timestamp < TYPING_TIMEOUT))
            .map(data => data.userId);
            
          callback(typingUsers);
        });
        
      } else {
        unsubscribe = this.firestore
          .collection('typing')
          .where('chatId', '==', chatId)
          .onSnapshot((snapshot) => {
            const typingUsers = snapshot.docs
              .map(doc => doc.data())
              .filter(data => data.isTyping && (Date.now() - data.timestamp < TYPING_TIMEOUT))
              .map(data => data.userId);
              
            callback(typingUsers);
          });
      }

      return unsubscribe;
      
    } catch (error) {
      console.error('Error subscribing to typing indicators:', error);
      return () => {};
    }
  }

  // ===== MESSAGE STATUS AND REACTIONS =====

  // Update message status
  async updateMessageStatus(chatId, messageId, status) {
    try {
      if (this.isOnline) {
        if (this.isWeb) {
          const { doc, updateDoc } = require('firebase/firestore');
          const messageDocRef = doc(this.firestore, 'messages', messageId);
          await updateDoc(messageDocRef, { status });
        } else {
          await this.firestore
            .collection('messages')
            .doc(messageId)
            .update({ status });
        }
      }

      // Update local cache
      await this.updateMessageInCache(chatId, messageId, { status });
      
    } catch (error) {
      console.warn('Error updating message status:', error);
    }
  }

  // Mark messages as read
  async markMessagesAsRead(chatId, userId, messageIds = []) {
    try {
      if (this.isOnline) {
        // Update message read status in Firebase
        const batch = this.isWeb ? 
          require('firebase/firestore').writeBatch(this.firestore) :
          this.firestore.batch();

        messageIds.forEach(messageId => {
          const messageRef = this.isWeb ?
            require('firebase/firestore').doc(this.firestore, 'messages', messageId) :
            this.firestore.collection('messages').doc(messageId);
            
          batch.update(messageRef, {
            [`readBy.${userId}`]: new Date().toISOString()
          });
        });

        await batch.commit();

        // Update chat unread count
        await this.updateUnreadCount(chatId, userId, 0);
      }

      // Update local cache
      messageIds.forEach(messageId => {
        this.updateMessageInCache(chatId, messageId, {
          [`readBy.${userId}`]: new Date().toISOString()
        });
      });
      
    } catch (error) {
      console.warn('Error marking messages as read:', error);
    }
  }

  // Add reaction to message
  async addMessageReaction(chatId, messageId, userId, reaction) {
    try {
      const reactionData = {
        userId,
        reaction,
        timestamp: new Date().toISOString()
      };

      if (this.isOnline) {
        if (this.isWeb) {
          const { doc, updateDoc, arrayUnion } = require('firebase/firestore');
          const messageDocRef = doc(this.firestore, 'messages', messageId);
          await updateDoc(messageDocRef, {
            [`reactions.${reaction}`]: arrayUnion(reactionData)
          });
        } else {
          await this.firestore
            .collection('messages')
            .doc(messageId)
            .update({
              [`reactions.${reaction}`]: this.firestore.FieldValue.arrayUnion(reactionData)
            });
        }
      }

      // Update local cache
      await this.addReactionToCache(chatId, messageId, reaction, reactionData);
      
      this.emitEvent('reactionAdded', { chatId, messageId, reaction, userId });
      
    } catch (error) {
      console.warn('Error adding reaction:', error);
    }
  }

  // ===== FILE UPLOAD METHODS =====

  // Upload file attachment
  async uploadFile(file, chatId, messageId, onProgress = null) {
    try {
      if (file.size > MAX_FILE_SIZE) {
        throw new Error('File size exceeds limit (10MB)');
      }

      if (!this.isOnline) {
        throw new Error('File uploads require internet connection');
      }

      const fileName = `chats/${chatId}/${messageId}/${Date.now()}_${file.name}`;
      let uploadTask;

      if (this.isWeb) {
        const { ref, uploadBytesResumable, getDownloadURL } = require('firebase/storage');
        const storageRef = ref(this.storage, fileName);
        uploadTask = uploadBytesResumable(storageRef, file);
      } else {
        const storageRef = this.storage.ref().child(fileName);
        uploadTask = storageRef.put(file);
      }

      // Monitor upload progress
      if (onProgress) {
        uploadTask.on('state_changed', (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress(progress);
        });
      }

      await uploadTask;

      // Get download URL
      let downloadURL;
      if (this.isWeb) {
        const { getDownloadURL } = require('firebase/storage');
        downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
      } else {
        downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
      }

      return {
        success: true,
        url: downloadURL,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      };
      
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  }

  // ===== UTILITY METHODS =====

  // Get user information
  async getUserInfo(userId) {
    try {
      // Try Firebase first if online
      if (this.isOnline) {
        try {
          let userData = null;

          if (this.isWeb) {
            const { doc, getDoc } = require('firebase/firestore');
            const userDocRef = doc(this.firestore, 'users', userId);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
              userData = { id: userDoc.id, ...userDoc.data() };
            }
          } else {
            const userDoc = await this.firestore.collection('users').doc(userId).get();
            if (userDoc.exists) {
              userData = { id: userDoc.id, ...userDoc.data() };
            }
          }

          if (userData) return userData;
        } catch (firebaseError) {
          console.warn('Firebase user lookup failed:', firebaseError.message);
        }
      }

      // Fallback to local users
      const localUsers = await FirebaseService.getStoredUsers();
      return localUsers.find(user => 
        user.id === userId || 
        user.firebaseUid === userId || 
        user.email === userId
      );
      
    } catch (error) {
      console.warn('Error getting user info:', error);
      return null;
    }
  }

  // Convert Firestore timestamp
  convertTimestamp(timestamp) {
    if (!timestamp) return null;
    
    if (timestamp.toDate) {
      return timestamp.toDate().toISOString();
    }
    
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toISOString();
    }
    
    return timestamp;
  }

  // Generate unique IDs
  generateChatId() {
    return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ===== CACHE MANAGEMENT =====

  // Cache messages locally
  async cacheMessages(chatId, messages) {
    try {
      const cacheKey = STORAGE_KEYS.CHAT_MESSAGES + chatId;
      await AsyncStorage.setItem(cacheKey, JSON.stringify(messages));
    } catch (error) {
      console.warn('Error caching messages:', error);
    }
  }

  // Get cached messages
  async getCachedMessages(chatId, limit = MESSAGE_BATCH_SIZE, lastMessageId = null) {
    try {
      const cacheKey = STORAGE_KEYS.CHAT_MESSAGES + chatId;
      const cachedJson = await AsyncStorage.getItem(cacheKey);
      
      if (!cachedJson) return [];
      
      let messages = JSON.parse(cachedJson);
      
      // Apply pagination if needed
      if (lastMessageId) {
        const lastIndex = messages.findIndex(msg => msg.id === lastMessageId);
        if (lastIndex >= 0) {
          messages = messages.slice(lastIndex + 1);
        }
      }
      
      return messages.slice(-limit);
      
    } catch (error) {
      console.warn('Error getting cached messages:', error);
      return [];
    }
  }

  // Add message to cache
  async addMessageToCache(chatId, message) {
    try {
      const cachedMessages = await this.getCachedMessages(chatId, 1000); // Get more for adding
      cachedMessages.push(message);
      
      // Keep only recent messages in cache
      const recentMessages = cachedMessages.slice(-500);
      await this.cacheMessages(chatId, recentMessages);
      
    } catch (error) {
      console.warn('Error adding message to cache:', error);
    }
  }

  // Update message in cache
  async updateMessageInCache(chatId, messageId, updates) {
    try {
      const cachedMessages = await this.getCachedMessages(chatId, 1000);
      const messageIndex = cachedMessages.findIndex(msg => msg.id === messageId);
      
      if (messageIndex >= 0) {
        cachedMessages[messageIndex] = { ...cachedMessages[messageIndex], ...updates };
        await this.cacheMessages(chatId, cachedMessages);
      }
      
    } catch (error) {
      console.warn('Error updating message in cache:', error);
    }
  }

  // Update chat in cache
  async updateChatInCache(chat) {
    try {
      const cachedChats = await this.getCachedChatList();
      const chatIndex = cachedChats.findIndex(c => c.id === chat.id);
      
      if (chatIndex >= 0) {
        cachedChats[chatIndex] = chat;
      } else {
        cachedChats.unshift(chat);
      }
      
      await AsyncStorage.setItem(STORAGE_KEYS.CHAT_LIST, JSON.stringify(cachedChats));
      
    } catch (error) {
      console.warn('Error updating chat in cache:', error);
    }
  }

  // Update chat last message
  async updateChatLastMessage(chatId, message) {
    try {
      const cachedChats = await this.getCachedChatList();
      const chatIndex = cachedChats.findIndex(c => c.id === chatId);
      
      if (chatIndex >= 0) {
        cachedChats[chatIndex].lastMessage = {
          text: message.text,
          timestamp: message.timestamp,
          senderId: message.senderId,
          type: message.type
        };
        cachedChats[chatIndex].updatedAt = message.timestamp;
        
        await AsyncStorage.setItem(STORAGE_KEYS.CHAT_LIST, JSON.stringify(cachedChats));
      }
      
    } catch (error) {
      console.warn('Error updating chat last message:', error);
    }
  }

  // Update chat last message in Firebase
  async updateChatLastMessageInFirebase(chatId, message) {
    try {
      const lastMessageData = {
        text: message.text,
        timestamp: message.timestamp,
        senderId: message.senderId,
        type: message.type
      };

      if (this.isWeb) {
        const { doc, updateDoc, serverTimestamp } = require('firebase/firestore');
        const chatDocRef = doc(this.firestore, 'chats', chatId);
        await updateDoc(chatDocRef, {
          lastMessage: lastMessageData,
          updatedAt: serverTimestamp()
        });
      } else {
        await this.firestore
          .collection('chats')
          .doc(chatId)
          .update({
            lastMessage: lastMessageData,
            updatedAt: this.firestore.FieldValue.serverTimestamp()
          });
      }
      
    } catch (error) {
      console.warn('Error updating chat last message in Firebase:', error);
    }
  }

  // Update unread count
  async updateUnreadCount(chatId, userId, count) {
    try {
      if (this.isOnline) {
        if (this.isWeb) {
          const { doc, updateDoc } = require('firebase/firestore');
          const chatDocRef = doc(this.firestore, 'chats', chatId);
          await updateDoc(chatDocRef, {
            [`unreadCounts.${userId}`]: count
          });
        } else {
          await this.firestore
            .collection('chats')
            .doc(chatId)
            .update({
              [`unreadCounts.${userId}`]: count
            });
        }
      }

      // Update local cache
      const cachedChats = await this.getCachedChatList();
      const chatIndex = cachedChats.findIndex(c => c.id === chatId);
      
      if (chatIndex >= 0) {
        if (!cachedChats[chatIndex].unreadCounts) {
          cachedChats[chatIndex].unreadCounts = {};
        }
        cachedChats[chatIndex].unreadCounts[userId] = count;
        
        await AsyncStorage.setItem(STORAGE_KEYS.CHAT_LIST, JSON.stringify(cachedChats));
      }
      
    } catch (error) {
      console.warn('Error updating unread count:', error);
    }
  }

  // Add reaction to cache
  async addReactionToCache(chatId, messageId, reaction, reactionData) {
    try {
      const cachedMessages = await this.getCachedMessages(chatId, 1000);
      const messageIndex = cachedMessages.findIndex(msg => msg.id === messageId);
      
      if (messageIndex >= 0) {
        const message = cachedMessages[messageIndex];
        if (!message.reactions) message.reactions = {};
        if (!message.reactions[reaction]) message.reactions[reaction] = [];
        
        message.reactions[reaction].push(reactionData);
        await this.cacheMessages(chatId, cachedMessages);
      }
      
    } catch (error) {
      console.warn('Error adding reaction to cache:', error);
    }
  }

  // ===== OFFLINE QUEUE MANAGEMENT =====

  // Queue chat operation for sync
  async queueChatOperation(type, data) {
    try {
      const queueJson = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_MESSAGE_QUEUE);
      const queue = queueJson ? JSON.parse(queueJson) : [];
      
      const operation = {
        id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        data,
        timestamp: new Date().toISOString(),
        attempts: 0,
        maxAttempts: 3
      };
      
      queue.push(operation);
      await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_MESSAGE_QUEUE, JSON.stringify(queue));
      
      return { success: true, operationId: operation.id };
      
    } catch (error) {
      console.error('Error queuing chat operation:', error);
      return { success: false, error: error.message };
    }
  }

  // Process pending messages when back online
  async processPendingMessages() {
    try {
      if (!this.isOnline) return;
      
      //console.log('Processing pending chat operations...');
      
      // Process message queue
      this.processNextMessage();
      
      // Process other chat operations
      const queueJson = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_MESSAGE_QUEUE);
      if (!queueJson) return;
      
      const queue = JSON.parse(queueJson);
      const processed = [];
      const remaining = [];
      
      for (const operation of queue) {
        try {
          await this.processChatOperation(operation);
          processed.push(operation.id);
        } catch (error) {
          console.warn('Failed to process operation:', operation.id, error.message);
          
          if (operation.attempts < operation.maxAttempts) {
            operation.attempts++;
            remaining.push(operation);
          }
        }
      }
      
      // Update queue
      await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_MESSAGE_QUEUE, JSON.stringify(remaining));
      
      if (processed.length > 0) {
        this.emitEvent('chatOperationsProcessed', { 
          processed: processed.length,
          remaining: remaining.length 
        });
      }
      
    } catch (error) {
      console.error('Error processing pending messages:', error);
    }
  }

  // Process individual chat operation
  async processChatOperation(operation) {
    switch (operation.type) {
      case 'CREATE_CHAT':
        return await this.saveChatToFirebase(operation.data);
      case 'SEND_MESSAGE':
        return await this.sendMessageToFirebase(operation.data);
      default:
        console.warn('Unknown chat operation type:', operation.type);
        return { success: false };
    }
  }

  // Start message queue processor
  startMessageQueueProcessor() {
    // Process queue every 5 seconds when online
    setInterval(() => {
      if (this.isOnline && this.messageQueue.length > 0) {
        this.processNextMessage();
      }
    }, 5000);

    // Process pending operations every 30 seconds
    setInterval(() => {
      if (this.isOnline) {
        this.processPendingMessages();
      }
    }, 30000);
  }

  // Subscribe to chat list updates
subscribeToChatList(userId, callback) {
  try {
    console.log('Subscribing to chat list for user:', userId);
    
    if (!this.isOnline) {
      console.log('Device offline, using cached chat list only');
      return () => {};
    }

    // Enhanced auth check
    const checkAuth = async () => {
      const localUser = await AsyncStorage.getItem('authenticatedUser');
      const firebaseUser = this.auth.currentUser;
      
      if (!firebaseUser && !localUser) {
        console.warn('No authenticated user found');
        return null;
      }
      
      return firebaseUser?.uid || (localUser ? JSON.parse(localUser).firebaseUid || JSON.parse(localUser).id : userId);
    };

    checkAuth().then((authenticatedUserId) => {
      if (!authenticatedUserId) {
        callback([]);
        return;
      }

      let unsubscribe;

      if (this.isWeb) {
        const { collection, query, where, orderBy, onSnapshot } = require('firebase/firestore');
        
        const chatsRef = collection(this.firestore, 'chats');
        const q = query(
          chatsRef,
          where('participants', 'array-contains', authenticatedUserId),
          orderBy('updatedAt', 'desc')
        );
        
        unsubscribe = onSnapshot(q, 
          (snapshot) => {
            const chats = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              lastMessage: this.convertTimestamp(doc.data().lastMessage)
            }));
            
            this.enrichChatListWithUserData(chats, authenticatedUserId).then(enrichedChats => {
              callback(enrichedChats);
              AsyncStorage.setItem(STORAGE_KEYS.CHAT_LIST, JSON.stringify(enrichedChats))
                .catch(err => console.warn('Failed to cache chats:', err));
            }).catch(err => {
              console.warn('Failed to enrich chat data:', err);
              callback(chats);
            });
          },
          (error) => {
            console.error('Chat list subscription error:', error);
            this.getCachedChatList().then(cachedChats => {
              callback(cachedChats);
            });
          }
        );
        
      } else {
        unsubscribe = this.firestore
          .collection('chats')
          .where('participants', 'array-contains', authenticatedUserId)
          .orderBy('updatedAt', 'desc')
          .onSnapshot(
            (snapshot) => {
              const chats = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                lastMessage: this.convertTimestamp(doc.data().lastMessage)
              }));
              
              this.enrichChatListWithUserData(chats, authenticatedUserId).then(enrichedChats => {
                callback(enrichedChats);
                AsyncStorage.setItem(STORAGE_KEYS.CHAT_LIST, JSON.stringify(enrichedChats))
                  .catch(err => console.warn('Failed to cache chats:', err));
              }).catch(err => {
                console.warn('Failed to enrich chat data:', err);
                callback(chats);
              });
            },
            (error) => {
              console.error('Chat list subscription error:', error);
              this.getCachedChatList().then(cachedChats => {
                callback(cachedChats);
              });
            }
          );
      }

      if (unsubscribe && typeof unsubscribe === 'function') {
        this.activeListeners.set(`chatList_${authenticatedUserId}`, unsubscribe);
        return unsubscribe;
      } else {
        console.warn('Failed to create subscription');
        return () => {};
      }
    });
    
    return () => {}; // Temporary return while async auth check runs
    
  } catch (error) {
    console.error('Error subscribing to chat list:', error);
    return () => {};
  }
}

// 4. Add network connectivity check before Firebase operations
async getChatListFromFirebase(userId) {
  try {
    // Enhanced auth check - accept local users too
    const localUser = await AsyncStorage.getItem('authenticatedUser');
    const firebaseUser = this.auth.currentUser;
    
    if (!firebaseUser && !localUser) {
      throw new Error('User not authenticated');
    }

    if (!this.isOnline) {
      throw new Error('Device is offline');
    }

    // Use Firebase UID if available, otherwise use local user ID
    const searchUserId = firebaseUser?.uid || 
                        (localUser ? JSON.parse(localUser).firebaseUid || JSON.parse(localUser).id : userId);

    console.log('Searching chats for user ID:', searchUserId);

    let chats = [];

    if (this.isWeb) {
      const { collection, query, where, orderBy, limit, getDocs } = require('firebase/firestore');
      
      const chatsRef = collection(this.firestore, 'chats');
      const q = query(
        chatsRef,
        where('participants', 'array-contains', searchUserId),
        orderBy('updatedAt', 'desc'),
        limit(100)
      );
      
      const querySnapshot = await getDocs(q);
      chats = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastMessage: this.convertTimestamp(doc.data().lastMessage)
      }));
      
    } else {
      const querySnapshot = await this.firestore
        .collection('chats')
        .where('participants', 'array-contains', searchUserId)
        .orderBy('updatedAt', 'desc')
        .limit(100)
        .get();
        
      chats = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastMessage: this.convertTimestamp(doc.data().lastMessage)
      }));
    }

    return await this.enrichChatListWithUserData(chats, searchUserId);
    
  } catch (error) {
    console.error('Firebase chat list error:', error);
    throw error;
  }
}

// 5. Add timeout and retry mechanism for network requests
async searchUsers(query, currentUserId, filters = {}) {
  try {
    console.log('🔍 Searching users:', query, 'filters:', filters);
    
    if (!query || query.trim().length < 2) {
      return { success: true, users: [], recent: await this.getRecentContacts(currentUserId) };
    }

    const searchQuery = query.trim().toLowerCase();
    let searchResults = [];

    if (this.isOnline) {
      try {
        // Add timeout to Firebase search
        const searchPromise = this.searchUsersInFirebase(searchQuery, currentUserId, filters);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Search timeout')), 10000)
        );
        
        searchResults = await Promise.race([searchPromise, timeoutPromise]);
      } catch (firebaseError) {
        console.warn('Firebase user search failed:', firebaseError.message);
        searchResults = []; // Continue with local search
      }
    }

    // Also search in local contacts/cached users
    const localResults = await this.searchUsersLocally(searchQuery, currentUserId);
    
    // Combine and deduplicate results
    const combinedResults = this.deduplicateUsers([...searchResults, ...localResults]);
    
    return { 
      success: true, 
      users: combinedResults,
      source: this.isOnline && searchResults.length > 0 ? 'online' : 'cache'
    };
    
  } catch (error) {
    console.error('❌ User search error:', error);
    throw error;
  }
}


  // ===== CLEANUP METHODS =====

  // Cleanup and destroy service
async cleanup() {
  try {
    console.log('Cleaning up ChatService...');
    
    // Cancel all active requests
    this.activeRequests.forEach((request, requestId) => {
      this.cancelRequest(requestId);
    });
    this.activeRequests.clear();
    
    // Clear all active listeners
    this.activeListeners.forEach((unsubscribe, key) => {
      try {
        unsubscribe();
        console.log('Cleaned up listener:', key);
      } catch (error) {
        console.warn('Error cleaning up listener:', key, error);
      }
    });
    this.activeListeners.clear();
    
    // Clear typing timeouts
    this.typingTimeouts.forEach((timeout, key) => {
      clearTimeout(timeout);
    });
    this.typingTimeouts.clear();
    
    // Clear event listeners
    this.eventListeners.clear();
    
    // Clear message queue
    this.messageQueue = [];
    
    console.log('ChatService cleanup complete');
    
  } catch (error) {
    console.error('Error during ChatService cleanup:', error);
  }
}
}

// Export singleton instance
export default new ChatService();
