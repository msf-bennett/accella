import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
  StatusBar,
  Keyboard,
  Animated,
  Dimensions
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import {
  Text,
  Searchbar,
  Avatar,
  Surface,
  IconButton,
  Chip,
  ProgressBar,
  Button,
  Divider,
  Portal,
  Modal
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { COLORS } from '../../styles/colors';
import { SPACING } from '../../styles/layout';
import { TEXT_STYLES } from '../../styles/typography';
import { useChatWithAuth } from '../../hooks/useChatWithAuth'; // Use the hook instead of direct service

const { width, height } = Dimensions.get('window');

const NewChatScreen = ({ navigation, route }) => {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  
  // Use the chat hook instead of direct ChatService calls
  const { 
    searchUsers, 
    createOrGetChat, 
    authReady, 
    currentFirebaseUser 
  } = useChatWithAuth();
  
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recentContacts, setRecentContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isGroupMode, setIsGroupMode] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [animationsReady, setAnimationsReady] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    userType: '',
    sport: '',
    location: ''
  });
  
  // Animation refs
  const searchBarScale = useRef(new Animated.Value(1)).current;
  const resultsOpacity = useRef(new Animated.Value(0)).current;
  
  // Debounce search
  const searchTimeoutRef = useRef(null);

  // Initialize component - wait for auth to be ready
  useEffect(() => {
    if (authReady && currentFirebaseUser) {
      loadRecentContacts();
    }
    setupKeyboardListeners();
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [authReady, currentFirebaseUser]);

    // Initialize animations
    useEffect(() => {
      // Ensure all animated values are properly initialized
     searchBarScale.setValue(1);
     resultsOpacity.setValue(0);
      setAnimationsReady(true);
    }, []);

  // Search when query changes - but only if auth is ready
  useEffect(() => {
    if (!authReady || !currentFirebaseUser) {
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      performSearch();
    }, 300);
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, activeFilters, authReady, currentFirebaseUser]);

  const setupKeyboardListeners = () => {
    const keyboardWillShow = Keyboard.addListener('keyboardWillShow', () => {
      Animated.timing(searchBarScale.current, {
        toValue: 0.95,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });
    
    const keyboardWillHide = Keyboard.addListener('keyboardWillHide', () => {
      Animated.timing(searchBarScale.current, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  };

  const loadRecentContacts = async () => {
    if (!authReady || !currentFirebaseUser) {
      console.log('Auth not ready for loading recent contacts');
      return;
    }

    try {
      setLoading(true);
      
      // Use the hook's searchUsers method with empty query to get recent contacts
      const result = await searchUsers('', {});
      
      if (result.success) {
        setRecentContacts(result.recent || []);
      }
      
    } catch (error) {
      console.error('Error loading recent contacts:', error);
      // Don't show alert for this, just log the error
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async () => {
    if (!authReady || !currentFirebaseUser) {
      console.log('Auth not ready for search');
      return;
    }

    if (!searchQuery.trim() && !Object.values(activeFilters).some(f => f)) {
      setSearchResults([]);
      Animated.timing(resultsOpacity.current, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
      return;
    }

    try {
      setLoading(true);
      
      // Use the hook's searchUsers method instead of direct ChatService call
      const result = await searchUsers(searchQuery, activeFilters);
      
      if (result.success) {
        setSearchResults(result.users || []);
        
        Animated.timing(resultsOpacity.current, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
      
    } catch (error) {
      console.error('Error searching users:', error);
      Alert.alert('Error', 'Failed to search users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = async (selectedUser) => {
    if (isGroupMode) {
      handleGroupUserSelection(selectedUser);
    } else {
      await createIndividualChat(selectedUser);
    }
  };

  const handleGroupUserSelection = (selectedUser) => {
    const isAlreadySelected = selectedUsers.some(u => u.id === selectedUser.id);
    
    if (isAlreadySelected) {
      setSelectedUsers(prev => prev.filter(u => u.id !== selectedUser.id));
    } else {
      if (selectedUsers.length >= 49) { // Max 50 people including current user
        Alert.alert('Limit Reached', 'Groups can have a maximum of 50 members.');
        return;
      }
      setSelectedUsers(prev => [...prev, selectedUser]);
    }
  };

  const createIndividualChat = async (selectedUser) => {
    if (!authReady || !currentFirebaseUser) {
      Alert.alert('Error', 'Authentication not ready. Please wait a moment and try again.');
      return;
    }

    try {
      setCreating(true);
      
      // Use Firebase UIDs for participants - the hook handles this automatically
      const participants = [selectedUser.firebaseUid || selectedUser.id];
      
      // Use the hook's createOrGetChat method instead of direct ChatService call
      const result = await createOrGetChat(participants, 'individual');
      
      if (result.success) {
        // Navigate to the chat
        navigation.replace('Chat', {
          chatId: result.chat.id,
          chatName: `${selectedUser.firstName} ${selectedUser.lastName}`.trim(),
          chatPartner: {
            id: selectedUser.firebaseUid || selectedUser.id,
            name: `${selectedUser.firstName} ${selectedUser.lastName}`.trim(),
            avatar: selectedUser.profileImage
          }
        });
      } else {
        throw new Error(result.error || 'Failed to create chat');
      }
      
    } catch (error) {
      console.error('Error creating individual chat:', error);
      Alert.alert('Error', error.message || 'Failed to create chat. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const createGroupChat = async () => {
    if (!authReady || !currentFirebaseUser) {
      Alert.alert('Error', 'Authentication not ready. Please wait a moment and try again.');
      return;
    }

    if (selectedUsers.length < 1) {
      Alert.alert('Invalid Selection', 'Please select at least one person to create a group.');
      return;
    }

    Alert.prompt(
      'Group Name',
      'Enter a name for your group:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create',
          onPress: async (groupName) => {
            if (!groupName?.trim()) {
              Alert.alert('Error', 'Please enter a group name.');
              return;
            }
            
            try {
              setCreating(true);
              
              // Use Firebase UIDs for participants - the hook handles adding current user
              const participants = selectedUsers.map(u => u.firebaseUid || u.id);
              
              // Use the hook's createOrGetChat method instead of direct ChatService call
              const result = await createOrGetChat(
                participants,
                'group',
                {
                  name: groupName.trim(),
                  description: `Group created by ${user.firstName} ${user.lastName}`
                }
              );
              
              if (result.success) {
                navigation.replace('Chat', {
                  chatId: result.chat.id,
                  chatName: groupName.trim(),
                  chatPartner: null
                });
              } else {
                throw new Error(result.error || 'Failed to create group');
              }
              
            } catch (error) {
              console.error('Error creating group chat:', error);
              Alert.alert('Error', error.message || 'Failed to create group. Please try again.');
            } finally {
              setCreating(false);
            }
          }
        }
      ],
      'plain-text',
      '',
      'default'
    );
  };

  const toggleGroupMode = () => {
    setIsGroupMode(!isGroupMode);
    setSelectedUsers([]);
  };

  const handleFilterPress = () => {
    setShowFilters(true);
  };

  const applyFilters = (newFilters) => {
    setActiveFilters(newFilters);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setActiveFilters({
      userType: '',
      sport: '',
      location: ''
    });
  };

  const renderUserItem = ({ item, isRecent = false }) => {
    const isSelected = selectedUsers.some(u => (u.firebaseUid || u.id) === (item.firebaseUid || item.id));
    const userRole = item.userType || item.customRole || 'User';
    const userSport = item.sport || '';
    
    return (
      <TouchableOpacity
        onPress={() => handleUserSelect(item)}
        disabled={creating}
        activeOpacity={0.7}>
        
        <Surface style={[
          styles.userItem,
          isSelected && styles.selectedUserItem,
          creating && styles.disabledUserItem
        ]} elevation={1}>
          
          {/* User Avatar */}
          <View style={styles.avatarContainer}>
            {item.profileImage ? (
              <Avatar.Image 
                size={45} 
                source={{ uri: item.profileImage }}
                style={styles.userAvatar}
              />
            ) : (
              <Avatar.Text 
                size={45} 
                label={`${item.firstName?.charAt(0)}${item.lastName?.charAt(0)}`.toUpperCase()}
                style={styles.userAvatar}
                labelStyle={styles.avatarLabel}
              />
            )}
            
            {/* Selection indicator for group mode */}
            {isGroupMode && (
              <View style={[
                styles.selectionIndicator,
                isSelected && styles.selectedIndicator
              ]}>
                {isSelected && (
                  <Icon name="check" size={16} color="white" />
                )}
              </View>
            )}
            
            {/* Online status */}
            {item.isOnline && (
              <View style={styles.onlineIndicator} />
            )}
          </View>
          
          {/* User Info */}
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>
              {`${item.firstName} ${item.lastName}`.trim() || 'Unknown User'}
            </Text>
            
            <View style={styles.userDetails}>
              <Text style={styles.userRole} numberOfLines={1}>
                {userRole}
              </Text>
              {userSport && (
                <>
                  <Text style={styles.separator}>•</Text>
                  <Text style={styles.userSport} numberOfLines={1}>
                    {userSport}
                  </Text>
                </>
              )}
            </View>
            
            {/* Username */}
            {item.username && (
              <Text style={styles.username} numberOfLines={1}>
                @{item.username}
              </Text>
            )}
            
            {/* Academy/Organization */}
            {item.academy && (
              <Text style={styles.academy} numberOfLines={1}>
                {item.academy}
              </Text>
            )}
          </View>
          
          {/* Action indicator */}
          <View style={styles.actionContainer}>
            {isRecent && (
              <Chip compact style={styles.recentChip}>
                Recent
              </Chip>
            )}
            
            {!isGroupMode && (
              <Icon 
                name="chat" 
                size={20} 
                color={COLORS.primary} 
              />
            )}
          </View>
        </Surface>
      </TouchableOpacity>
    );
  };

  const renderSelectedUsers = () => {
    if (!isGroupMode || selectedUsers.length === 0) return null;
    
    return (
      <View style={styles.selectedUsersContainer}>
        <Text style={styles.selectedUsersTitle}>
          Selected ({selectedUsers.length})
        </Text>
        
        <FlatList
          horizontal
          data={selectedUsers}
          keyExtractor={(item) => (item.firebaseUid || item.id).toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.selectedUserItem}
              onPress={() => handleGroupUserSelection(item)}>
              
              <Avatar.Text 
                size={35} 
                label={`${item.firstName?.charAt(0)}${item.lastName?.charAt(0)}`.toUpperCase()}
                style={styles.selectedUserAvatar}
                labelStyle={styles.selectedAvatarLabel}
              />
              
              <View style={styles.removeButton}>
                <Icon name="close" size={12} color="white" />
              </View>
            </TouchableOpacity>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.selectedUsersList}
        />
      </View>
    );
  };

  const renderFilterChips = () => {
    const activeFilterCount = Object.values(activeFilters).filter(f => f).length;
    
    return (
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilterCount > 0 && styles.activeFilterButton
          ]}
          onPress={handleFilterPress}>
          <Icon 
            name="tune" 
            size={18} 
            color={activeFilterCount > 0 ? COLORS.primary : COLORS.textSecondary} 
          />
          <Text style={[
            styles.filterButtonText,
            activeFilterCount > 0 && styles.activeFilterButtonText
          ]}>
            Filters
            {activeFilterCount > 0 && ` (${activeFilterCount})`}
          </Text>
        </TouchableOpacity>
        
        {activeFilterCount > 0 && (
          <TouchableOpacity
            style={styles.clearFiltersButton}
            onPress={clearFilters}>
            <Text style={styles.clearFiltersText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderEmptyState = () => {
    if (loading) return null;
    
    const hasQuery = searchQuery.trim().length > 0;
    const hasFilters = Object.values(activeFilters).some(f => f);
    
    return (
      <View style={styles.emptyContainer}>
        <Icon 
          name={hasQuery || hasFilters ? "search-off" : "people-outline"} 
          size={64} 
          color={COLORS.textSecondary} 
        />
        <Text style={styles.emptyTitle}>
          {hasQuery || hasFilters ? 'No users found' : 'Search for people'}
        </Text>
        <Text style={styles.emptySubtitle}>
          {hasQuery || hasFilters 
            ? 'Try adjusting your search or filters' 
            : 'Start typing to find coaches, trainers, or teammates'
          }
        </Text>
        
        {(hasQuery || hasFilters) && (
          <Button
            mode="outlined"
            onPress={() => {
              setSearchQuery('');
              clearFilters();
            }}
            style={styles.resetButton}>
            Reset Search
          </Button>
        )}
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
          <Text style={styles.filterModalTitle}>Filter Users</Text>
          
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>User Type</Text>
            <View style={styles.filterOptions}>
              {['COACH', 'PLAYER', 'PARENT', 'TRAINER'].map((type) => (
                <Chip
                  key={type}
                  selected={activeFilters.userType === type}
                  onPress={() => setActiveFilters(prev => ({
                    ...prev,
                    userType: prev.userType === type ? '' : type
                  }))}
                  style={[
                    styles.filterOptionChip,
                    activeFilters.userType === type && styles.selectedFilterChip
                  ]}>
                  {type.charAt(0) + type.slice(1).toLowerCase()}
                </Chip>
              ))}
            </View>
          </View>
          
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Sport</Text>
            <View style={styles.filterOptions}>
              {['Football', 'Basketball', 'Soccer', 'Tennis', 'Swimming', 'Athletics'].map((sport) => (
                <Chip
                  key={sport}
                  selected={activeFilters.sport === sport}
                  onPress={() => setActiveFilters(prev => ({
                    ...prev,
                    sport: prev.sport === sport ? '' : sport
                  }))}
                  style={[
                    styles.filterOptionChip,
                    activeFilters.sport === sport && styles.selectedFilterChip
                  ]}>
                  {sport}
                </Chip>
              ))}
            </View>
          </View>
          
          <View style={styles.filterActions}>
            <Button
              mode="outlined"
              onPress={() => setShowFilters(false)}
              style={styles.filterCancelButton}>
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={() => applyFilters(activeFilters)}
              style={styles.filterApplyButton}>
              Apply Filters
            </Button>
          </View>
        </BlurView>
      </Modal>
    </Portal>
  );

  // Show loading screen while authentication is not ready
  if (!authReady) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ProgressBar indeterminate color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading authentication...</Text>
      </View>
    );
  }

  // Show authentication required screen
  if (!currentFirebaseUser) {
    return (
      <View style={[styles.container, styles.authRequiredContainer]}>
        <Icon name="error-outline" size={64} color={COLORS.error} />
        <Text style={styles.authRequiredTitle}>Authentication Required</Text>
        <Text style={styles.authRequiredSubtitle}>
          Please sign in to search for users and create chats.
        </Text>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Dashboard', { screen: 'LoginScreen' })}
          style={styles.signInButton}>
          Sign In
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}>
        
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <IconButton
              icon="arrow-back"
              iconColor="white"
              size={24}
              onPress={() => navigation.goBack()}
            />
            
            <Text style={styles.headerTitle}>
              {isGroupMode ? 'New Group' : 'New Chat'}
            </Text>
            
            <TouchableOpacity
              style={styles.groupToggle}
              onPress={toggleGroupMode}>
              <Icon 
                name={isGroupMode ? "person" : "group"} 
                size={24} 
                color="white" 
              />
            </TouchableOpacity>
          </View>
          
          {/* Search Bar */}
          <Animated.View 
            style={[
              styles.searchContainer,
              { transform: [{ scale: searchBarScale.current }] }
            ]}>
            <Searchbar
              placeholder={isGroupMode ? "Search people to add..." : "Search coaches, trainers..."}
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
              inputStyle={styles.searchInput}
              iconColor={COLORS.primary}
              loading={loading}
            />
          </Animated.View>
        </View>
      </LinearGradient>
      
      {/* Filters */}
      {renderFilterChips()}
      
      {/* Selected Users (Group Mode) */}
      {renderSelectedUsers()}
      
      {/* Results */}
      <Animated.View 
        style={[
          styles.resultsContainer,
          { opacity: resultsOpacity.current }
        ]}>
        
        {searchQuery.trim() || Object.values(activeFilters).some(f => f) ? (
          <FlatList
            data={searchResults}
            keyExtractor={(item) => (item.firebaseUid || item.id).toString()}
            renderItem={({ item }) => renderUserItem({ item, isRecent: false })}
            style={styles.resultsList}
            contentContainerStyle={styles.resultsContent}
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <Divider style={styles.separator} />}
          />
        ) : (
          <View style={styles.recentContainer}>
            <Text style={styles.sectionTitle}>Recent Contacts</Text>
            
            <FlatList
              data={recentContacts}
              keyExtractor={(item) => (item.firebaseUid || item.id).toString()}
              renderItem={({ item }) => renderUserItem({ item, isRecent: true })}
              style={styles.resultsList}
              contentContainerStyle={styles.resultsContent}
              ListEmptyComponent={renderEmptyState}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <Divider style={styles.separator} />}
            />
          </View>
        )}
      </Animated.View>
      
      {/* Group Creation Button */}
      {isGroupMode && selectedUsers.length > 0 && (
        <Surface style={styles.groupActionContainer} elevation={8}>
          <Button
            mode="contained"
            onPress={createGroupChat}
            loading={creating}
            disabled={creating || selectedUsers.length === 0}
            style={styles.createGroupButton}
            contentStyle={styles.createGroupButtonContent}>
            Create Group ({selectedUsers.length} members)
          </Button>
        </Surface>
      )}
      
      {/* Loading Overlay */}
      {creating && (
        <View style={styles.loadingOverlay}>
          <Surface style={styles.loadingCard} elevation={4}>
            <ProgressBar indeterminate color={COLORS.primary} />
            <Text style={styles.loadingText}>
              {isGroupMode ? 'Creating group...' : 'Starting chat...'}
            </Text>
          </Surface>
        </View>
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
  // Add styles for the new loading and auth required states
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  authRequiredContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  authRequiredTitle: {
    ...TEXT_STYLES.h2,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  authRequiredSubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
  signInButton: {
    backgroundColor: COLORS.primary,
  },
  header: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    paddingHorizontal: SPACING.lg,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: SPACING.md,
  },
  groupToggle: {
    padding: SPACING.xs,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  searchContainer: {
    marginTop: SPACING.sm,
  },
  searchBar: {
    elevation: 2,
    backgroundColor: 'white',
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.background,
  },
  activeFilterButton: {
    backgroundColor: COLORS.primarySurface,
  },
  filterButtonText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.sm,
    color: COLORS.textSecondary,
  },
  activeFilterButtonText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  clearFiltersButton: {
    marginLeft: SPACING.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  clearFiltersText: {
    ...TEXT_STYLES.caption,
    color: COLORS.error,
  },
  selectedUsersContainer: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  selectedUsersTitle: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  selectedUsersList: {
    paddingHorizontal: SPACING.md,
  },
  selectedUserItem: {
    position: 'relative',
    marginHorizontal: SPACING.xs,
  },
  selectedUserAvatar: {
    backgroundColor: COLORS.primary,
  },
  selectedAvatarLabel: {
    fontSize: 12,
  },
  removeButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultsContainer: {
    flex: 1,
  },
  recentContainer: {
    flex: 1,
  },
  sectionTitle: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  resultsList: {
    flex: 1,
  },
  resultsContent: {
    flexGrow: 1,
  },
  separator: {
    marginLeft: 70,
    backgroundColor: COLORS.border,
  },
  userItem: {
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
  },
  selectedUserItem: {
    backgroundColor: COLORS.primarySurface,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  disabledUserItem: {
    opacity: 0.5,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: SPACING.md,
  },
  userAvatar: {
    backgroundColor: COLORS.primary,
  },
  avatarLabel: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
  },
  selectionIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  selectedIndicator: {
    backgroundColor: COLORS.primary,
  },
  onlineIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: 'white',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  userDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs / 2,
  },
  userRole: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: '500',
  },
  separator: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginHorizontal: SPACING.xs,
  },
  userSport: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  username: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginBottom: SPACING.xs / 2,
  },
  academy: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontSize: 10,
  },
  actionContainer: {
    alignItems: 'center',
  },
  recentChip: {
    backgroundColor: COLORS.primarySurface,
    marginBottom: SPACING.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xl * 2,
  },
  emptyTitle: {
    ...TEXT_STYLES.h3,
    textAlign: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
  resetButton: {
    borderColor: COLORS.primary,
  },
  groupActionContainer: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  createGroupButton: {
    backgroundColor: COLORS.primary,
  },
  createGroupButtonContent: {
    paddingVertical: SPACING.sm,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingCard: {
    padding: SPACING.xl,
    marginHorizontal: SPACING.xl,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
  },
  loadingText: {
    ...TEXT_STYLES.body,
    marginTop: SPACING.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  filterModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  filterModal: {
    width: width * 0.9,
    maxHeight: height * 0.7,
    padding: SPACING.lg,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
  },
  filterModalTitle: {
    ...TEXT_STYLES.h3,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  filterSection: {
    marginBottom: SPACING.lg,
  },
  filterSectionTitle: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
    color: COLORS.text,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  filterOptionChip: {
    backgroundColor: COLORS.background,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  selectedFilterChip: {
    backgroundColor: COLORS.primary,
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
  },
  filterCancelButton: {
    flex: 1,
    marginRight: SPACING.sm,
    borderColor: COLORS.textSecondary,
  },
  filterApplyButton: {
    flex: 1,
    marginLeft: SPACING.sm,
    backgroundColor: COLORS.primary,
  },
});

export default NewChatScreen;