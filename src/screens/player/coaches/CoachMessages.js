import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  Alert,
  StatusBar,
  Animated,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Vibration,
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Searchbar,
  Badge,
  Portal,
  Modal,
  Divider,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '@react-native-blur/blur';
import { useSelector, useDispatch } from 'react-redux';

// Import your design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../styles/designSystem';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const CoachMessages = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, conversations, unreadCount } = useSelector(state => ({
    user: state.auth.user,
    conversations: state.messages.conversations || [],
    unreadCount: state.messages.unreadCount || 0,
  }));

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Mock data for conversations
  const [mockConversations] = useState([
    {
      id: '1',
      playerName: 'Marcus Johnson',
      playerAvatar: 'https://i.pravatar.cc/100?img=1',
      lastMessage: 'Great session today! Really feeling the improvement 💪',
      timestamp: '2 min ago',
      unread: 3,
      online: true,
      sport: 'Football',
      type: 'player',
      performance: 85,
    },
    {
      id: '2',
      playerName: 'Sarah Williams',
      playerAvatar: 'https://i.pravatar.cc/100?img=2',
      lastMessage: 'Can we reschedule tomorrow\'s training?',
      timestamp: '15 min ago',
      unread: 1,
      online: false,
      sport: 'Basketball',
      type: 'player',
      performance: 92,
    },
    {
      id: '3',
      playerName: 'Team Alpha Group',
      playerAvatar: null,
      lastMessage: 'Training schedule updated for next week',
      timestamp: '1 hour ago',
      unread: 0,
      online: false,
      sport: 'Football',
      type: 'group',
      memberCount: 12,
    },
    {
      id: '4',
      playerName: 'Emily Davis',
      playerAvatar: 'https://i.pravatar.cc/100?img=3',
      lastMessage: 'Thank you for the nutrition tips! 🥗',
      timestamp: '2 hours ago',
      unread: 0,
      online: true,
      sport: 'Tennis',
      type: 'player',
      performance: 78,
    },
    {
      id: '5',
      playerName: 'David Park (Parent)',
      playerAvatar: 'https://i.pravatar.cc/100?img=4',
      lastMessage: 'How is Alex progressing with his training?',
      timestamp: '1 day ago',
      unread: 2,
      online: false,
      sport: 'Soccer',
      type: 'parent',
      childName: 'Alex Park',
    }
  ]);

  // Filter options
  const filterOptions = [
    { key: 'all', label: 'All', icon: 'chat', count: mockConversations.length },
    { key: 'unread', label: 'Unread', icon: 'mark-chat-unread', count: mockConversations.filter(c => c.unread > 0).length },
    { key: 'players', label: 'Players', icon: 'person', count: mockConversations.filter(c => c.type === 'player').length },
    { key: 'groups', label: 'Groups', icon: 'group', count: mockConversations.filter(c => c.type === 'group').length },
    { key: 'parents', label: 'Parents', icon: 'family-restroom', count: mockConversations.filter(c => c.type === 'parent').length },
  ];

  // Animation effects
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

  // Refresh functionality
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // dispatch(refreshConversations());
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh messages');
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Filter conversations
  const filteredConversations = mockConversations.filter(conversation => {
    const matchesSearch = conversation.playerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = 
      activeFilter === 'all' ||
      (activeFilter === 'unread' && conversation.unread > 0) ||
      (activeFilter === 'players' && conversation.type === 'player') ||
      (activeFilter === 'groups' && conversation.type === 'group') ||
      (activeFilter === 'parents' && conversation.type === 'parent');
    
    return matchesSearch && matchesFilter;
  });

  // Handle conversation press
  const handleConversationPress = (conversation) => {
    Vibration.vibrate(50);
    // Navigate to individual chat screen
    navigation.navigate('ChatScreen', { conversationId: conversation.id, playerName: conversation.playerName });
  };

  // Handle quick reply
  const handleQuickReply = (conversationId, message) => {
    setSelectedConversation(conversationId);
    setNewMessage(message);
    setModalVisible(true);
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    setLoading(true);
    try {
      // Simulate sending message
      await new Promise(resolve => setTimeout(resolve, 500));
      setNewMessage('');
      setModalVisible(false);
      Vibration.vibrate(100);
      Alert.alert('Success', 'Message sent! 📤');
    } catch (error) {
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  // Render conversation item
  const renderConversationItem = ({ item, index }) => {
    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{
            translateY: slideAnim.interpolate({
              inputRange: [0, 50],
              outputRange: [0, 50],
            })
          }],
        }}
      >
        <TouchableOpacity
          onPress={() => handleConversationPress(item)}
          activeOpacity={0.7}
          style={{ marginBottom: SPACING.md }}
        >
          <Card style={{
            marginHorizontal: SPACING.md,
            elevation: 3,
            backgroundColor: item.unread > 0 ? COLORS.primary + '10' : COLORS.background,
            borderLeftWidth: item.unread > 0 ? 4 : 0,
            borderLeftColor: COLORS.primary,
          }}>
            <Card.Content style={{ padding: SPACING.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {/* Avatar */}
                <View style={{ position: 'relative' }}>
                  {item.type === 'group' ? (
                    <Surface style={{
                      width: 50,
                      height: 50,
                      borderRadius: 25,
                      backgroundColor: COLORS.primary,
                      justifyContent: 'center',
                      alignItems: 'center',
                      elevation: 2,
                    }}>
                      <Icon name="group" size={24} color="white" />
                    </Surface>
                  ) : (
                    <Avatar.Image
                      size={50}
                      source={{ uri: item.playerAvatar }}
                      style={{ backgroundColor: COLORS.primary }}
                    />
                  )}
                  
                  {/* Online indicator */}
                  {item.online && (
                    <View style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: 16,
                      height: 16,
                      borderRadius: 8,
                      backgroundColor: COLORS.success,
                      borderWidth: 2,
                      borderColor: 'white',
                    }} />
                  )}

                  {/* Unread badge */}
                  {item.unread > 0 && (
                    <Badge
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

                {/* Content */}
                <View style={{ flex: 1, marginLeft: SPACING.md }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={[TEXT_STYLES.subtitle, { flex: 1, fontWeight: item.unread > 0 ? 'bold' : 'normal' }]}>
                      {item.playerName}
                    </Text>
                    <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                      {item.timestamp}
                    </Text>
                  </View>

                  {/* Sport/Type chip */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: SPACING.xs }}>
                    <Chip
                      mode="outlined"
                      compact
                      style={{ marginRight: SPACING.xs }}
                      textStyle={{ fontSize: 10 }}
                    >
                      {item.sport}
                    </Chip>
                    {item.type === 'group' && (
                      <Chip
                        mode="outlined"
                        compact
                        icon="group"
                        textStyle={{ fontSize: 10 }}
                      >
                        {item.memberCount} members
                      </Chip>
                    )}
                    {item.type === 'parent' && (
                      <Chip
                        mode="outlined"
                        compact
                        icon="child-care"
                        textStyle={{ fontSize: 10 }}
                      >
                        {item.childName}
                      </Chip>
                    )}
                    {item.performance && (
                      <Chip
                        mode="outlined"
                        compact
                        icon="trending-up"
                        textStyle={{ 
                          fontSize: 10,
                          color: item.performance >= 85 ? COLORS.success : item.performance >= 70 ? COLORS.warning : COLORS.error
                        }}
                        style={{
                          borderColor: item.performance >= 85 ? COLORS.success : item.performance >= 70 ? COLORS.warning : COLORS.error
                        }}
                      >
                        {item.performance}%
                      </Chip>
                    )}
                  </View>

                  {/* Last message */}
                  <Text 
                    style={[TEXT_STYLES.body2, { 
                      color: COLORS.textSecondary,
                      fontWeight: item.unread > 0 ? '500' : 'normal',
                    }]}
                    numberOfLines={2}
                  >
                    {item.lastMessage}
                  </Text>
                </View>

                {/* Quick actions */}
                <View style={{ marginLeft: SPACING.xs }}>
                  <IconButton
                    icon="reply"
                    size={20}
                    onPress={() => handleQuickReply(item.id, '')}
                  />
                </View>
              </View>
            </Card.Content>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Render filter chips
  const renderFilterChips = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm }}
    >
      {filterOptions.map((filter) => (
        <Chip
          key={filter.key}
          mode={activeFilter === filter.key ? 'flat' : 'outlined'}
          selected={activeFilter === filter.key}
          onPress={() => setActiveFilter(filter.key)}
          icon={filter.icon}
          style={{ 
            marginRight: SPACING.sm,
            backgroundColor: activeFilter === filter.key ? COLORS.primary : 'transparent',
          }}
          textStyle={{
            color: activeFilter === filter.key ? 'white' : COLORS.textPrimary,
            fontWeight: activeFilter === filter.key ? 'bold' : 'normal',
          }}
        >
          {filter.label} ({filter.count})
        </Chip>
      ))}
    </ScrollView>
  );

  // Quick reply modal
  const renderQuickReplyModal = () => (
    <Portal>
      <Modal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        contentContainerStyle={{
          backgroundColor: 'white',
          margin: SPACING.lg,
          borderRadius: 12,
          maxHeight: screenHeight * 0.7,
        }}
      >
        <BlurView
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
          }}
          blurType="light"
          blurAmount={10}
        />
        
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ padding: SPACING.lg }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md }}>
            <Text style={TEXT_STYLES.h3}>Quick Reply</Text>
            <IconButton
              icon="close"
              onPress={() => setModalVisible(false)}
            />
          </View>

          {/* Quick response templates */}
          <Text style={[TEXT_STYLES.subtitle, { marginBottom: SPACING.sm, color: COLORS.textSecondary }]}>
            Quick Responses:
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: SPACING.md }}
          >
            {[
              'Great work! 💪',
              'Keep it up! 🔥',
              'See you at training!',
              'Let\'s discuss this',
              'Well done today! ⭐',
              'Need more practice',
            ].map((template, index) => (
              <Chip
                key={index}
                mode="outlined"
                onPress={() => setNewMessage(template)}
                style={{ marginRight: SPACING.sm }}
              >
                {template}
              </Chip>
            ))}
          </ScrollView>

          {/* Message input */}
          <TextInput
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type your message..."
            multiline
            numberOfLines={4}
            style={{
              borderWidth: 1,
              borderColor: COLORS.border,
              borderRadius: 8,
              padding: SPACING.md,
              textAlignVertical: 'top',
              marginBottom: SPACING.md,
              backgroundColor: 'white',
            }}
          />

          {/* Action buttons */}
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <Button
              mode="outlined"
              onPress={() => setModalVisible(false)}
              style={{ marginRight: SPACING.sm }}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={sendMessage}
              loading={loading}
              disabled={!newMessage.trim()}
            >
              Send
            </Button>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </Portal>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{
          paddingTop: StatusBar.currentHeight + SPACING.lg,
          paddingBottom: SPACING.lg,
          paddingHorizontal: SPACING.lg,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={[TEXT_STYLES.h2, { color: 'white', fontWeight: 'bold' }]}>
              Messages 💬
            </Text>
            <Text style={[TEXT_STYLES.body2, { color: 'rgba(255,255,255,0.8)' }]}>
              Stay connected with your team
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {unreadCount > 0 && (
              <Badge
                style={{ 
                  backgroundColor: COLORS.error,
                  marginRight: SPACING.sm,
                }}
              >
                {unreadCount}
              </Badge>
            )}
            <IconButton
              icon="video-call"
              iconColor="white"
              size={28}
              onPress={() => Alert.alert('Video Call', 'Video calling feature coming soon! 📹')}
            />
            <IconButton
              icon="group-add"
              iconColor="white"
              size={28}
              onPress={() => Alert.alert('New Group', 'Group creation feature coming soon! 👥')}
            />
          </View>
        </View>
      </LinearGradient>

      {/* Search bar */}
      <Surface style={{ margin: SPACING.md, borderRadius: 12, elevation: 2 }}>
        <Searchbar
          placeholder="Search conversations..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={{ backgroundColor: 'white' }}
          iconColor={COLORS.primary}
        />
      </Surface>

      {/* Filter chips */}
      {renderFilterChips()}

      {/* Conversations list */}
      <FlatList
        data={filteredConversations}
        renderItem={renderConversationItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        contentContainerStyle={{
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={{ 
            alignItems: 'center', 
            justifyContent: 'center', 
            paddingVertical: SPACING.xl * 2 
          }}>
            <Icon name="chat-bubble-outline" size={80} color={COLORS.textSecondary} />
            <Text style={[TEXT_STYLES.h3, { marginTop: SPACING.lg, color: COLORS.textSecondary }]}>
              No conversations found
            </Text>
            <Text style={[TEXT_STYLES.body2, { marginTop: SPACING.sm, color: COLORS.textSecondary, textAlign: 'center' }]}>
              Start a conversation with your players!
            </Text>
          </View>
        )}
      />

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={{
          position: 'absolute',
          margin: SPACING.lg,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.primary,
        }}
        onPress={() => Alert.alert('New Chat', 'Start new conversation feature coming soon! 💭')}
      />

      {/* Quick Reply Modal */}
      {renderQuickReplyModal()}
    </View>
  );
};

export default CoachMessages;