import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  FlatList,
  Alert,
  Animated,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Vibration,
  Dimensions,
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Portal,
  Modal,
  Searchbar,
  Badge,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  accent: '#E91E63',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  bodySmall: { fontSize: 14, color: COLORS.textSecondary },
  caption: { fontSize: 12, color: COLORS.textSecondary },
};

const { width, height } = Dimensions.get('window');

const PlayerCommunication = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth?.user);
  const communications = useSelector(state => state.communications?.playerChats || []);
  const isLoading = useSelector(state => state.communications?.isLoading || false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [activeConversations, setActiveConversations] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Mock data for development
  const mockConversations = [
    {
      id: '1',
      type: 'coach',
      name: 'Coach Johnson',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      lastMessage: 'Great job in today\'s training session! 🏆',
      timestamp: '2 min ago',
      unread: 2,
      isOnline: true,
      role: 'Head Coach',
    },
    {
      id: '2',
      type: 'team',
      name: 'Team Eagles',
      avatar: null,
      lastMessage: 'Mike: See you all at tomorrow\'s practice! 💪',
      timestamp: '1 hour ago',
      unread: 5,
      isOnline: false,
      memberCount: 15,
    },
    {
      id: '3',
      type: 'teammate',
      name: 'Sarah Miller',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b1e0?w=150',
      lastMessage: 'Thanks for the passing tips! 🙏',
      timestamp: '3 hours ago',
      unread: 0,
      isOnline: false,
      position: 'Midfielder',
    },
    {
      id: '4',
      type: 'coach',
      name: 'Assistant Coach Davis',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      lastMessage: 'Recovery session scheduled for tomorrow',
      timestamp: '1 day ago',
      unread: 1,
      isOnline: true,
      role: 'Assistant Coach',
    },
  ];

  const filterOptions = [
    { key: 'all', label: 'All', icon: 'forum', count: mockConversations.length },
    { key: 'coaches', label: 'Coaches', icon: 'school', count: 2 },
    { key: 'team', label: 'Team', icon: 'group', count: 1 },
    { key: 'teammates', label: 'Players', icon: 'people', count: 1 },
  ];

  // Initialize animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Calculate unread messages
  useEffect(() => {
    const total = mockConversations.reduce((sum, conv) => sum + conv.unread, 0);
    setUnreadCount(total);
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert('Communication Updated', 'Latest messages loaded! 📱', [
        { text: 'OK', style: 'default' },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh communications');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const filteredConversations = mockConversations.filter(conv => {
    const matchesSearch = conv.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || 
      (selectedFilter === 'coaches' && conv.type === 'coach') ||
      (selectedFilter === 'team' && conv.type === 'team') ||
      (selectedFilter === 'teammates' && conv.type === 'teammate');
    
    return matchesSearch && matchesFilter;
  });

  const handleConversationPress = useCallback((conversation) => {
    Vibration.vibrate(50);
    navigation.navigate('ChatScreen', { 
      conversationId: conversation.id,
      conversationName: conversation.name,
      conversationType: conversation.type 
    });
  }, [navigation]);

  const handleNewMessage = useCallback(() => {
    setShowNewMessageModal(true);
  }, []);

  const sendMessage = useCallback(() => {
    if (!newMessage.trim()) return;
    
    Alert.alert(
      'Message Sent! ✅',
      `Your message has been sent successfully.`,
      [{ text: 'OK', style: 'default' }]
    );
    
    setNewMessage('');
    setShowNewMessageModal(false);
    Vibration.vibrate(100);
  }, [newMessage]);

  const renderConversationCard = ({ item, index }) => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <TouchableOpacity
        onPress={() => handleConversationPress(item)}
        activeOpacity={0.7}
        style={{ marginBottom: SPACING.sm }}
      >
        <Card style={{
          marginHorizontal: SPACING.md,
          elevation: 3,
          borderRadius: 12,
          backgroundColor: item.unread > 0 ? '#f8f9ff' : COLORS.surface,
          borderLeftWidth: item.unread > 0 ? 4 : 0,
          borderLeftColor: COLORS.primary,
        }}>
          <Card.Content style={{ padding: SPACING.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ position: 'relative' }}>
                <Avatar.Image
                  size={50}
                  source={item.avatar ? { uri: item.avatar } : null}
                  style={{ backgroundColor: COLORS.primary }}
                >
                  {!item.avatar && item.name.charAt(0)}
                </Avatar.Image>
                {item.isOnline && (
                  <View style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    backgroundColor: COLORS.success,
                    borderWidth: 2,
                    borderColor: COLORS.surface,
                  }} />
                )}
                {item.unread > 0 && (
                  <Badge
                    size={20}
                    style={{
                      position: 'absolute',
                      top: -5,
                      right: -5,
                      backgroundColor: COLORS.error,
                    }}
                  >
                    {item.unread}
                  </Badge>
                )}
              </View>
              
              <View style={{ flex: 1, marginLeft: SPACING.md }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={[TEXT_STYLES.h3, { fontSize: 16, flex: 1 }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.sm }]}>
                    {item.timestamp}
                  </Text>
                </View>
                
                {(item.role || item.position || item.memberCount) && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                    <Icon 
                      name={item.type === 'coach' ? 'school' : item.type === 'team' ? 'group' : 'person'} 
                      size={12} 
                      color={COLORS.textSecondary} 
                    />
                    <Text style={[TEXT_STYLES.caption, { marginLeft: 4 }]}>
                      {item.role || item.position || `${item.memberCount} members`}
                    </Text>
                  </View>
                )}
                
                <Text 
                  style={[
                    TEXT_STYLES.bodySmall, 
                    { 
                      marginTop: 4, 
                      fontWeight: item.unread > 0 ? '600' : 'normal',
                      color: item.unread > 0 ? COLORS.text : COLORS.textSecondary,
                    }
                  ]} 
                  numberOfLines={2}
                >
                  {item.lastMessage}
                </Text>
              </View>
              
              <IconButton
                icon="chevron-right"
                size={20}
                iconColor={COLORS.textSecondary}
                onPress={() => handleConversationPress(item)}
              />
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderFilterChip = (filter) => (
    <Chip
      key={filter.key}
      selected={selectedFilter === filter.key}
      onPress={() => setSelectedFilter(filter.key)}
      icon={filter.icon}
      style={{
        marginRight: SPACING.sm,
        backgroundColor: selectedFilter === filter.key ? COLORS.primary : COLORS.surface,
      }}
      textStyle={{
        color: selectedFilter === filter.key ? '#fff' : COLORS.text,
        fontWeight: selectedFilter === filter.key ? '600' : 'normal',
      }}
    >
      {filter.label} {filter.count > 0 && `(${filter.count})`}
    </Chip>
  );

  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={{
        paddingTop: StatusBar.currentHeight + SPACING.lg,
        paddingBottom: SPACING.lg,
        paddingHorizontal: SPACING.md,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <Text style={[TEXT_STYLES.h2, { color: '#fff' }]}>
            Communications 💬
          </Text>
          <Text style={[TEXT_STYLES.bodySmall, { color: 'rgba(255,255,255,0.8)', marginTop: 4 }]}>
            Stay connected with your team
          </Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <IconButton
            icon="notifications"
            size={24}
            iconColor="#fff"
            onPress={() => Alert.alert('Notifications', 'Feature coming soon! 🔔')}
          />
          {unreadCount > 0 && (
            <Badge
              size={18}
              style={{
                position: 'absolute',
                top: 5,
                right: 5,
                backgroundColor: COLORS.error,
              }}
            >
              {unreadCount}
            </Badge>
          )}
        </View>
      </View>
    </LinearGradient>
  );

  const renderEmptyState = () => (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: SPACING.xl,
    }}>
      <Icon name="forum" size={80} color={COLORS.textSecondary} />
      <Text style={[TEXT_STYLES.h3, { textAlign: 'center', marginTop: SPACING.md }]}>
        No conversations yet
      </Text>
      <Text style={[TEXT_STYLES.bodySmall, { textAlign: 'center', marginTop: SPACING.sm }]}>
        Start chatting with your coaches and teammates to stay connected!
      </Text>
      <Button
        mode="contained"
        onPress={handleNewMessage}
        style={{
          marginTop: SPACING.lg,
          backgroundColor: COLORS.primary,
        }}
        icon="message-plus"
      >
        Start New Chat
      </Button>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      
      {renderHeader()}
      
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={{ flex: 1 }}>
          {/* Search Bar */}
          <View style={{ paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm }}>
            <Searchbar
              placeholder="Search conversations..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              icon="search"
              clearIcon="close"
              style={{
                backgroundColor: COLORS.surface,
                elevation: 2,
              }}
            />
          </View>

          {/* Filter Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: SPACING.md,
              paddingBottom: SPACING.sm,
            }}
          >
            {filterOptions.map(renderFilterChip)}
          </ScrollView>

          {/* Conversations List */}
          <FlatList
            data={filteredConversations}
            keyExtractor={(item) => item.id}
            renderItem={renderConversationCard}
            contentContainerStyle={{
              paddingTop: SPACING.sm,
              paddingBottom: 100,
            }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </KeyboardAvoidingView>

      {/* Floating Action Button */}
      <FAB
        icon="message-plus"
        style={{
          position: 'absolute',
          margin: SPACING.md,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.primary,
        }}
        onPress={handleNewMessage}
        color="#fff"
      />

      {/* New Message Modal */}
      <Portal>
        <Modal
          visible={showNewMessageModal}
          onDismiss={() => setShowNewMessageModal(false)}
          contentContainerStyle={{
            backgroundColor: COLORS.surface,
            margin: SPACING.lg,
            borderRadius: 12,
            maxHeight: height * 0.7,
          }}
        >
          <View style={{ padding: SPACING.lg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={TEXT_STYLES.h3}>New Message 📝</Text>
              <IconButton
                icon="close"
                onPress={() => setShowNewMessageModal(false)}
                size={24}
              />
            </View>
            
            <Text style={[TEXT_STYLES.bodySmall, { marginTop: SPACING.sm }]}>
              Send a message to your coach or teammates
            </Text>
            
            <TextInput
              style={{
                backgroundColor: COLORS.background,
                borderRadius: 8,
                padding: SPACING.md,
                marginTop: SPACING.md,
                textAlignVertical: 'top',
                minHeight: 120,
                borderWidth: 1,
                borderColor: '#e0e0e0',
              }}
              placeholder="Type your message here..."
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
              numberOfLines={6}
            />
            
            <View style={{ flexDirection: 'row', marginTop: SPACING.lg }}>
              <Button
                mode="outlined"
                onPress={() => setShowNewMessageModal(false)}
                style={{ flex: 1, marginRight: SPACING.sm }}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={sendMessage}
                style={{ flex: 1, backgroundColor: COLORS.primary }}
                disabled={!newMessage.trim()}
              >
                Send
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

export default PlayerCommunication;