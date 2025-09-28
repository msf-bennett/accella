import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  TouchableOpacity,
  StatusBar,
  Animated,
  Dimensions
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import {
  Text,
  Searchbar,
  Avatar,
  Badge,
  Surface,
  IconButton,
  FAB,
  Chip,
  ProgressBar,
  Portal,
  Modal,
  Button,
  Menu
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { COLORS } from '../../styles/colors';
import { SPACING } from '../../styles/layout';
import { TEXT_STYLES } from '../../styles/typography';
import { useChatWithAuth } from '../../hooks/useChatWithAuth'; // Use the hook instead of direct service
import ChatService from '../../services/ChatService'; // Still needed for event listeners

const { width, height } = Dimensions.get('window');

const ChatListScreen = ({ navigation }) => {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  
  // Use the chat hook instead of direct ChatService calls
  const { 
    getChatList, 
    subscribeToChatList, 
    authReady, 
    currentFirebaseUser 
  } = useChatWithAuth();
  
  // State management
  const [chats, setChats] = useState([]);
  const [filteredChats, setFilteredChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [syncStatus, setSyncStatus] = useState({ syncing: false, count: 0 });
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [animationsReady, setAnimationsReady] = useState(false);

  // Animation refs
  const scrollY = useRef(new Animated.Value(0)).current;
  const searchBarOpacity = useRef(new Animated.Value(1)).current;
  const fabScale = useRef(new Animated.Value(1)).current;
  
  // Service refs
  const unsubscribeChatListRef = useRef(null);
  const chatServiceListenerRef = useRef(null);

  // Initialize screen - wait for auth to be ready
  useFocusEffect(
    useCallback(() => {
      if (authReady && currentFirebaseUser) {
        initializeChatList();
      }
      setupEventListeners();
      
      return () => {
        cleanup();
      };
    }, [authReady, currentFirebaseUser])
  );

  // Initialize animations
  useEffect(() => {
    // Ensure all animated values are properly initialized
    scrollY.setValue(0);
    searchBarOpacity.setValue(1);
    fabScale.setValue(1);
    setAnimationsReady(true);
  }, []);

  // Search functionality
  useEffect(() => {
    filterChats();
  }, [chats, searchQuery, selectedFilter]);

  const initializeChatList = async () => {
    if (!authReady || !currentFirebaseUser) {
      console.log('Auth not ready for chat list initialization');
      return;
    }

    try {
      setLoading(true);

      // Load cached chats first for immediate display
      await loadChats();
      
      // Subscribe to real-time updates
      subscribeToChats();
      
    } catch (error) {
      console.error('Error initializing chat list:', error);
      Alert.alert('Error', 'Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  const setupEventListeners = () => {
    chatServiceListenerRef.current = ChatService.addEventListener((event) => {
      switch (event.type) {
        case 'networkStatusChanged':
          setIsOnline(event.data.isOnline);
          break;
        case 'chatsLoaded':
          setChats(event.data.chats);
          break;
        case 'chatCreated':
          handleNewChat(event.data.chat);
          break;
        case 'syncStarted':
          setSyncStatus({ syncing: true, count: 0 });
          break;
        case 'syncCompleted':
          setSyncStatus({ syncing: false, count: event.data.processed || 0 });
          break;
      }
    });
  };

  const loadChats = async () => {
    if (!authReady || !currentFirebaseUser) {
      console.log('Auth not ready for loading chats');
      return;
    }

    try {
      // Use the hook's getChatList method instead of direct ChatService call
      const result = await getChatList();
      
      if (result.success) {
        setChats(result.chats);
      } else {
        throw new Error(result.error || 'Failed to load chats');
      }
      
    } catch (error) {
      console.error('Error loading chats:', error);
      // Don't show alert here as it might be network-related
    }
  };

  const subscribeToChats = () => {
    if (!authReady || !currentFirebaseUser) {
      console.log('Auth not ready for chat subscription');
      return;
    }

    // Use the hook's subscribeToChatList method instead of direct ChatService call
    unsubscribeChatListRef.current = subscribeToChatList((updatedChats) => {
      setChats(updatedChats);
    });
  };

  const cleanup = () => {
    if (unsubscribeChatListRef.current) {
      unsubscribeChatListRef.current();
    }
    if (chatServiceListenerRef.current) {
      chatServiceListenerRef.current();
    }
  };

  const handleNewChat = (newChat) => {
    setChats(prevChats => {
      const existingIndex = prevChats.findIndex(chat => chat.id === newChat.id);
      if (existingIndex >= 0) {
        const updated = [...prevChats];
        updated[existingIndex] = newChat;
        return updated;
      } else {
        return [newChat, ...prevChats];
      }
    });
    
    // Animate FAB
    Animated.sequence([
      Animated.timing(fabScale.current, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fabScale.current, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChats();
    setRefreshing(false);
  };

  const filterChats = () => {
    let filtered = [...chats];
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(chat => 
        chat.displayName?.toLowerCase().includes(query) ||
        chat.lastMessage?.text?.toLowerCase().includes(query)
      );
    }
    
    // Apply type filter
    switch (selectedFilter) {
      case 'unread':
        filtered = filtered.filter(chat => (chat.unreadCount || 0) > 0);
        break;
      case 'favourite':
        filtered = filtered.filter(chat => chat.favourite === true);
        break;
      case 'groups':
        filtered = filtered.filter(chat => chat.type === 'group' || chat.type === 'team');
        break;
      case 'archived':
        filtered = filtered.filter(chat => chat.archived === true);
        break;
      default: // 'all'
        filtered = filtered.filter(chat => !chat.archived);
        break;
    }
    
    setFilteredChats(filtered);
  };

  const handleChatPress = (chat) => {
    // Find the other participant for individual chats
    let chatPartner = null;
    if (chat.type === 'individual') {
      const otherParticipantId = chat.participants.find(id => 
        id !== currentFirebaseUser?.uid && id !== user?.id
      );
      if (otherParticipantId) {
        chatPartner = {
          id: otherParticipantId,
          name: chat.displayName,
          avatar: chat.displayAvatar
        };
      }
    }

    // Navigate to individual chat
    navigation.navigate('Chat', {
      chatId: chat.id,
      chatName: chat.displayName,
      chatPartner: chatPartner
    });
  };

  const handleChatLongPress = (chat) => {
    const options = [
      { text: 'Mark as Read', onPress: () => markChatAsRead(chat) },
      { text: 'Add to Favourites', onPress: () => toggleFavouriteChat(chat) },
      { text: 'Mute Chat', onPress: () => toggleMuteChat(chat) },
      { text: 'Pin Chat', onPress: () => togglePinChat(chat) },
      { text: 'Archive Chat', onPress: () => archiveChat(chat), style: 'destructive' },
      { text: 'Cancel', style: 'cancel' }
    ];

    Alert.alert('Chat Options', '', options);
  };

  const markChatAsRead = async (chat) => {
    if (!authReady || !currentFirebaseUser) {
      Alert.alert('Error', 'Authentication not ready');
      return;
    }

    try {
      await ChatService.updateUnreadCount(chat.id, currentFirebaseUser.uid, 0);
    } catch (error) {
      Alert.alert('Error', 'Failed to mark chat as read');
    }
  };

  const toggleFavouriteChat = async (chat) => {
    // TODO: Implement favourite functionality
    Alert.alert('Favourite Chat', 'Favourite functionality coming soon!');
  };

  const toggleMuteChat = async (chat) => {
    // TODO: Implement mute functionality
    Alert.alert('Mute Chat', 'Mute functionality coming soon!');
  };

  const togglePinChat = async (chat) => {
    // TODO: Implement pin functionality
    Alert.alert('Pin Chat', 'Pin functionality coming soon!');
  };

  const archiveChat = async (chat) => {
    // TODO: Implement archive functionality
    Alert.alert('Archive Chat', 'Archive functionality coming soon!');
  };

  const handleNewChatPress = () => {
    if (!authReady || !currentFirebaseUser) {
      Alert.alert('Authentication Required', 'Please wait for authentication to complete');
      return;
    }
    navigation.navigate('NewChat');
  };

  const handleMoreMenuOption = (option) => {
    setShowMoreMenu(false);
    
    switch (option) {
      case 'settings':
        navigation.navigate('Settings');
        break;
      case 'archived':
        setSelectedFilter('archived');
        break;
      case 'help':
        Alert.alert('Help', 'Help functionality coming soon!');
        break;
      case 'logout':
        Alert.alert(
          'Logout',
          'Are you sure you want to logout?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', style: 'destructive', onPress: () => {
              // TODO: Implement logout
              Alert.alert('Logout', 'Logout functionality coming soon!');
            }}
          ]
        );
        break;
    }
  };

const handleSearchFocus = () => {
  // Add null check to prevent the error
  if (searchBarOpacity.current) {
    Animated.timing(searchBarOpacity.current, {
      toValue: 0.9,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }
};

const handleSearchBlur = () => {
  // Add null check to prevent the error
  if (searchBarOpacity.current) {
    Animated.timing(searchBarOpacity.current, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }
};

  const handleScroll = (event) => {
    const { contentOffset } = event.nativeEvent;
    scrollY.setValue(contentOffset.y);
    
    // Hide/show search bar based on scroll direction
    const showSearchBar = contentOffset.y < 50;
    Animated.timing(searchBarOpacity.current, {
      toValue: showSearchBar ? 1 : 0.3,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffHours / 24;
    
    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return diffMins < 1 ? 'now' : `${diffMins}m`;
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)}h`;
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en', { month: 'short', day: 'numeric' });
    }
  };

  const renderChatItem = ({ item }) => {
    const unreadCount = item.unreadCount || 0;
    const hasUnread = unreadCount > 0;
    const isGroup = item.type === 'group' || item.type === 'team';
    
    return (
      <TouchableOpacity
        onPress={() => handleChatPress(item)}
        onLongPress={() => handleChatLongPress(item)}
        activeOpacity={0.7}>
        
        <Surface style={[
          styles.chatItem,
          hasUnread && styles.unreadChatItem
        ]} elevation={1}>
          
          {/* Chat Avatar */}
          <View style={styles.avatarContainer}>
            {item.displayAvatar ? (
              <Avatar.Image 
                size={50} 
                source={{ uri: item.displayAvatar }}
                style={styles.chatAvatar}
              />
            ) : (
              <Avatar.Text 
                size={50} 
                label={item.displayName?.substring(0, 2).toUpperCase() || 'C'}
                style={[
                  styles.chatAvatar,
                  isGroup && styles.groupAvatar
                ]}
                labelStyle={styles.avatarLabel}
              />
            )}
            
            {/* Online indicator for individual chats */}
            {!isGroup && item.isOnline && (
              <View style={styles.onlineIndicator} />
            )}
            
            {/* Group indicator */}
            {isGroup && (
              <View style={styles.groupIndicator}>
                <Icon name="group" size={12} color="white" />
              </View>
            )}
          </View>
          
          {/* Chat Content */}
          <View style={styles.chatContent}>
            <View style={styles.chatHeader}>
              <Text 
                style={[
                  styles.chatName,
                  hasUnread && styles.unreadChatName
                ]}
                numberOfLines={1}>
                {item.displayName || 'Unknown Chat'}
              </Text>
              
              <Text style={styles.chatTime}>
                {formatLastMessageTime(item.lastMessage?.timestamp)}
              </Text>
            </View>
            
            <View style={styles.chatFooter}>
              <Text 
                style={[
                  styles.lastMessage,
                  hasUnread && styles.unreadLastMessage
                ]}
                numberOfLines={2}>
                {item.lastMessage ? 
                  `${item.lastMessage.senderId === currentFirebaseUser?.uid ? 'You: ' : ''}${item.lastMessage.text}` :
                  'No messages yet'
                }
              </Text>
              
              {/* Unread badge */}
              {hasUnread && (
                <Badge 
                  style={styles.unreadBadge}
                  size={20}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </View>
            
            {/* Chat status indicators */}
            <View style={styles.chatStatusRow}>
              {item.muted && (
                <Chip compact style={styles.statusChip}>
                  <Icon name="volume-off" size={12} />
                </Chip>
              )}
              {item.pinned && (
                <Chip compact style={styles.statusChip}>
                  <Icon name="push-pin" size={12} />
                </Chip>
              )}
              {item.favourite && (
                <Chip compact style={[styles.statusChip, styles.favouriteChip]}>
                  <Icon name="favorite" size={12} />
                </Chip>
              )}
              {!isOnline && (
                <Chip compact style={[styles.statusChip, styles.offlineChip]}>
                  <Icon name="wifi-off" size={12} />
                </Chip>
              )}
            </View>
          </View>
        </Surface>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.headerGradient}>
        
        <View style={styles.headerContent}>
          {/* Main Header */}
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text style={styles.appName}>acceilla</Text>
              <Text style={styles.userName}>
                @{user?.username || user?.name || 'user'}
                {currentFirebaseUser && (
                  <Text style={styles.authStatus}> • Authenticated</Text>
                )}
              </Text>
            </View>
            
            <View style={styles.headerRight}>
              <IconButton
                icon="plus"
                iconColor="white"
                size={24}
                onPress={handleNewChatPress}
                disabled={!authReady || !currentFirebaseUser}
              />
              <IconButton
                icon="magnify"
                iconColor="white"
                size={24}
                onPress={() => {
                  // Focus search bar - will be handled by search bar ref
                }}
              />
              <Menu
                visible={showMoreMenu}
                onDismiss={() => setShowMoreMenu(false)}
                anchor={
                  <IconButton
                    icon="dots-vertical"
                    iconColor="white"
                    size={24}
                    onPress={() => setShowMoreMenu(true)}
                  />
                }
                contentStyle={styles.moreMenu}>
                <Menu.Item 
                  onPress={() => handleMoreMenuOption('settings')} 
                  title="Settings"
                  leadingIcon="cog"
                />
                <Menu.Item 
                  onPress={() => handleMoreMenuOption('archived')} 
                  title="Archived Chats"
                  leadingIcon="archive"
                />
                <Menu.Item 
                  onPress={() => handleMoreMenuOption('help')} 
                  title="Help & Support"
                  leadingIcon="account"
                />
                <Menu.Item 
                  onPress={() => handleMoreMenuOption('logout')} 
                  title="Logout"
                  leadingIcon="logout"
                />
              </Menu>
            </View>
          </View>
          
          {/* Authentication status */}
          {!authReady && (
            <View style={styles.connectionStatus}>
              <Icon name="hourglass-empty" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.connectionText}>
                Initializing authentication...
              </Text>
            </View>
          )}
          
          {authReady && !currentFirebaseUser && (
            <View style={styles.connectionStatus}>
              <Icon name="person-off" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.connectionText}>
                Authentication required - Please sign in
              </Text>
            </View>
          )}
          
          {/* Connection status */}
          {!isOnline && (
            <View style={styles.connectionStatus}>
              <Icon name="wifi-off" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.connectionText}>
                Offline - Messages will sync when connected
              </Text>
            </View>
          )}
          
          {/* Sync status */}
          {syncStatus.syncing && (
            <View style={styles.syncStatus}>
              <ProgressBar 
                indeterminate 
                color="rgba(255,255,255,0.8)" 
                style={styles.syncProgress}
              />
              <Text style={styles.syncText}>
                Syncing messages...
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>
      
      {/* Search Bar */}
      <Animated.View 
        style={[
          styles.searchContainer,
          { opacity: searchBarOpacity.current }
        ]}>
        <Searchbar
          placeholder="Search chats..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor={COLORS.primary}
          onFocus={handleSearchFocus}
          onBlur={handleSearchBlur}
        />
      </Animated.View>
      
      {/* Filter Chips */}
      <View style={styles.filterChipsContainer}>
        {['all', 'unread', 'favourite', 'groups'].map((filter) => (
          <Chip
            key={filter}
            selected={selectedFilter === filter}
            onPress={() => setSelectedFilter(filter)}
            style={[
              styles.filterChip,
              selectedFilter === filter && styles.selectedFilterChip
            ]}
            textStyle={[
              styles.filterChipText,
              selectedFilter === filter && styles.selectedFilterChipText
            ]}>
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </Chip>
        ))}
        
        {/* Add Filter Button */}
        <TouchableOpacity
          style={styles.addFilterButton}
          onPress={() => setShowFilters(true)}>
          <Icon name="add" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => {
    if (!authReady) {
      return (
        <View style={styles.emptyContainer}>
          <Icon name="hourglass-empty" size={80} color={COLORS.textSecondary} />
          <Text style={styles.emptyTitle}>Initializing...</Text>
          <Text style={styles.emptySubtitle}>
            Please wait while we set up your chat system
          </Text>
        </View>
      );
    }

    if (!currentFirebaseUser) {
      return (
        <View style={styles.emptyContainer}>
          <Icon name="person-off" size={80} color={COLORS.error} />
          <Text style={styles.emptyTitle}>Authentication Required</Text>
          <Text style={styles.emptySubtitle}>
            Please sign in to view your conversations
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Dashboard', { screen: 'LoginScreen' })}
            style={styles.emptyButton}
            contentStyle={styles.emptyButtonContent}>
            Sign In
          </Button>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Icon name="chat-bubble-outline" size={80} color={COLORS.textSecondary} />
        <Text style={styles.emptyTitle}>No conversations yet</Text>
        <Text style={styles.emptySubtitle}>
          Start a conversation with coaches, trainers, or teammates
        </Text>
        <Button
          mode="contained"
          onPress={handleNewChatPress}
          style={styles.emptyButton}
          contentStyle={styles.emptyButtonContent}>
          Start New Chat
        </Button>
      </View>
    );
  };

  const renderFilterModal = () => (
    <Portal>
      <Modal
        visible={showFilters}
        onDismiss={() => setShowFilters(false)}
        contentContainerStyle={styles.filterModalContainer}>
        <BlurView intensity={20} style={styles.filterModal}>
          <Text style={styles.filterModalTitle}>Filter Chats</Text>
          
          {[
            { key: 'all', label: 'All Chats', icon: 'chat' },
            { key: 'unread', label: 'Unread', icon: 'fiber-manual-record' },
            { key: 'favourite', label: 'Favourites', icon: 'favorite' },
            { key: 'groups', label: 'Group Chats', icon: 'group' },
            { key: 'archived', label: 'Archived', icon: 'archive' }
          ].map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterOption,
                selectedFilter === filter.key && styles.selectedFilterOption
              ]}
              onPress={() => {
                setSelectedFilter(filter.key);
                setShowFilters(false);
              }}>
              <Icon 
                name={filter.icon} 
                size={24} 
                color={selectedFilter === filter.key ? COLORS.primary : COLORS.textSecondary} 
              />
              <Text style={[
                styles.filterOptionText,
                selectedFilter === filter.key && styles.selectedFilterOptionText
              ]}>
                {filter.label}
              </Text>
              {selectedFilter === filter.key && (
                <Icon name="check" size={20} color={COLORS.primary} />
              )}
            </TouchableOpacity>
          ))}
        </BlurView>
      </Modal>
    </Portal>
  );

  // Show loading screen while authentication is not ready
  if (!authReady && chats.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        {renderHeader()}
        <View style={styles.loadingContent}>
          <ProgressBar indeterminate color={COLORS.primary} />
          <Text style={styles.loadingText}>Initializing authentication...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      
      <FlatList
        data={filteredChats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        style={styles.chatList}
        contentContainerStyle={[
          styles.chatListContent,
          filteredChats.length === 0 && styles.emptyListContent
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
            progressViewOffset={200}
          />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
      
      {/* New Chat FAB */}
      {authReady && currentFirebaseUser && (
        <Animated.View style={[
          styles.fabContainer,
          { transform: animationsReady ? [{ scale: fabScale.current }] : [] }
        ]}>
          <FAB
            icon="plus"
            onPress={handleNewChatPress}
            style={styles.fab}
            color="white"
            label="New chat"
          />
        </Animated.View>
      )}
      
      {renderFilterModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  loadingText: {
    ...TEXT_STYLES.body,
    marginTop: SPACING.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  headerContainer: {
    backgroundColor: COLORS.primary,
  },
  headerGradient: {
    paddingTop: SPACING.md,
  },
  headerContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  headerLeft: {
    flex: 1,
  },
  appName: {
    ...TEXT_STYLES.h1,
    color: 'white',
    fontWeight: 'bold',
    fontSize: 28,
    letterSpacing: -0.5,
  },
  userName: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
    fontSize: 16,
  },
  authStatus: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moreMenu: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  connectionText: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: SPACING.sm,
  },
  syncStatus: {
    paddingVertical: SPACING.xs,
  },
  syncProgress: {
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  syncText: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
    marginTop: SPACING.xs,
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  searchBar: {
    elevation: 2,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  filterChipsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.background,
    alignItems: 'center',
  },
  filterChip: {
    marginRight: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedFilterChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  selectedFilterChipText: {
    color: 'white',
    fontWeight: 'bold',
  },
  addFilterButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },
  chatList: {
    flex: 1,
  },
  chatListContent: {
    paddingBottom: 100,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 70,
  },
  chatItem: {
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
  },
  unreadChatItem: {
    backgroundColor: COLORS.primarySurface,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: SPACING.md,
  },
  chatAvatar: {
    backgroundColor: COLORS.primary,
  },
  groupAvatar: {
    backgroundColor: COLORS.secondary,
  },
  avatarLabel: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: 'white',
  },
  groupIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  chatName: {
    ...TEXT_STYLES.body,
    fontWeight: '500',
    flex: 1,
    color: COLORS.text,
  },
  unreadChatName: {
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  chatTime: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  chatFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
  unreadLastMessage: {
    color: COLORS.text,
    fontWeight: '500',
  },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    marginLeft: SPACING.sm,
  },
  chatStatusRow: {
    flexDirection: 'row',
    marginTop: SPACING.xs,
  },
  statusChip: {
    height: 20,
    marginRight: SPACING.xs,
    backgroundColor: COLORS.border,
  },
  favouriteChip: {
    backgroundColor: COLORS.error,
  },
  offlineChip: {
    backgroundColor: COLORS.errorSurface,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xl * 2,
  },
  emptyTitle: {
    ...TEXT_STYLES.h2,
    textAlign: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    color: COLORS.text,
  },
  emptySubtitle: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
  },
  emptyButtonContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  fabContainer: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.lg,
  },
  fab: {
    backgroundColor: COLORS.primary,
  },
  filterModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  filterModal: {
    width: width * 0.8,
    padding: SPACING.lg,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
  },
  filterModalTitle: {
    ...TEXT_STYLES.h3,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.sm,
  },
  selectedFilterOption: {
    backgroundColor: COLORS.primarySurface,
  },
  filterOptionText: {
    ...TEXT_STYLES.body,
    flex: 1,
    marginLeft: SPACING.md,
    color: COLORS.text,
  },
  selectedFilterOptionText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});

export default ChatListScreen;