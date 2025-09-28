import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Dimensions,
  RefreshControl,
  Alert,
  StatusBar,
  TouchableOpacity,
  FlatList,
  Animated,
  Vibration,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  Surface,
  Searchbar,
  FAB,
  Portal,
  Dialog,
  ProgressBar,
  Badge,
  Divider,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { COLORS } from '../../../styles/colors';
import { SPACING } from '../../../styles/spacing';
import { TEXT_STYLES } from '../../../styles/textStyles';
import { TYPOGRAPHY } from '../../../styles/typography';
import { LAYOUT } from '../../../styles/layout';

const { width, height } = Dimensions.get('window');

const ParentCommunication = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { players, notifications } = useSelector(state => state.coach);
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showComposeDialog, setShowComposeDialog] = useState(false);
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [progressData, setProgressData] = useState({
    playerId: '',
    subject: '',
    achievements: [],
    areas_improvement: '',
    upcoming_goals: '',
    attendance_rate: 85,
    performance_score: 7.8,
  });

  // Mock data - replace with actual API calls
  const mockConversations = [
    {
      id: '1',
      parentId: 'parent1',
      parentName: 'Jennifer Smith',
      parentAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c76a?w=150&h=150&fit=crop&crop=face',
      playerName: 'Alex Smith',
      lastMessage: 'Thank you for the detailed progress report! Alex is really motivated.',
      timestamp: '2024-08-16T10:30:00Z',
      unreadCount: 0,
      isRead: true,
      priority: 'normal',
      tags: ['progress', 'motivation'],
      messageType: 'text',
      playerId: 'p1',
    },
    {
      id: '2',
      parentId: 'parent2',
      parentName: 'Michael Johnson',
      parentAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      playerName: 'Emma Johnson',
      lastMessage: 'Could we schedule a meeting to discuss Emma\'s training schedule?',
      timestamp: '2024-08-16T08:15:00Z',
      unreadCount: 2,
      isRead: false,
      priority: 'high',
      tags: ['meeting', 'schedule'],
      messageType: 'meeting_request',
      playerId: 'p2',
    },
    {
      id: '3',
      parentId: 'parent3',
      parentName: 'Sarah Wilson',
      parentAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      playerName: 'Jake Wilson',
      lastMessage: '📹 Shared training video - Great improvement in technique!',
      timestamp: '2024-08-15T16:45:00Z',
      unreadCount: 1,
      isRead: false,
      priority: 'normal',
      tags: ['video', 'improvement'],
      messageType: 'video_share',
      playerId: 'p3',
    },
    {
      id: '4',
      parentId: 'parent4',
      parentName: 'David Brown',
      parentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      playerName: 'Mia Brown',
      lastMessage: 'Mia loved the personalized training plan! When is the next assessment?',
      timestamp: '2024-08-15T14:20:00Z',
      unreadCount: 0,
      isRead: true,
      priority: 'normal',
      tags: ['assessment', 'training_plan'],
      messageType: 'text',
      playerId: 'p4',
    },
  ];

  const mockMessages = [
    {
      id: 'm1',
      conversationId: '1',
      senderId: 'coach1',
      senderName: 'Coach Miller',
      senderType: 'coach',
      message: 'Hello Jennifer! I wanted to share Alex\'s progress from this week\'s training sessions.',
      timestamp: '2024-08-16T09:00:00Z',
      messageType: 'text',
      attachments: [],
      isRead: true,
    },
    {
      id: 'm2',
      conversationId: '1',
      senderId: 'parent1',
      senderName: 'Jennifer Smith',
      senderType: 'parent',
      message: 'Hi Coach! I\'d love to hear about Alex\'s progress. How has he been doing?',
      timestamp: '2024-08-16T09:15:00Z',
      messageType: 'text',
      attachments: [],
      isRead: true,
    },
    {
      id: 'm3',
      conversationId: '1',
      senderId: 'coach1',
      senderName: 'Coach Miller',
      senderType: 'coach',
      message: 'Alex has shown tremendous improvement in his ball control and passing accuracy. His attendance is excellent at 95%, and he\'s really embracing the new drills.',
      timestamp: '2024-08-16T10:00:00Z',
      messageType: 'progress_report',
      attachments: [
        {
          type: 'progress_chart',
          title: 'Weekly Performance Metrics',
          data: { skills: 85, fitness: 78, teamwork: 92 }
        }
      ],
      isRead: true,
    },
  ];

  const parentFilters = [
    { value: 'all', label: 'All Parents', icon: 'group', count: 12 },
    { value: 'unread', label: 'Unread', icon: 'mark-chat-unread', count: 3 },
    { value: 'priority', label: 'Priority', icon: 'priority-high', count: 1 },
    { value: 'recent', label: 'Recent', icon: 'schedule', count: 8 },
    { value: 'meetings', label: 'Meetings', icon: 'event', count: 2 },
  ];

  const quickActions = [
    { id: 'progress', title: 'Send Progress', icon: 'trending-up', color: '#4CAF50' },
    { id: 'schedule', title: 'Schedule Meeting', icon: 'event', color: '#2196F3' },
    { id: 'video', title: 'Share Video', icon: 'videocam', color: '#FF9800' },
    { id: 'announcement', title: 'Send Announcement', icon: 'campaign', color: '#9C27B0' },
  ];

  const achievementBadges = [
    { id: 1, title: 'Improved Ball Control', icon: 'sports-soccer', earned: true },
    { id: 2, title: 'Perfect Attendance', icon: 'event-available', earned: true },
    { id: 3, title: 'Team Player', icon: 'group-work', earned: false },
    { id: 4, title: 'Leadership Skills', icon: 'military-tech', earned: false },
  ];

  useEffect(() => {
    loadConversations();
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadConversations = useCallback(() => {
    setConversations(mockConversations);
    setMessages(mockMessages);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Vibration.vibrate(50);
    loadConversations();
    setTimeout(() => setRefreshing(false), 1000);
  }, [loadConversations]);

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conv.playerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || 
      (selectedFilter === 'unread' && conv.unreadCount > 0) ||
      (selectedFilter === 'priority' && conv.priority === 'high') ||
      (selectedFilter === 'recent' && new Date(conv.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)) ||
      (selectedFilter === 'meetings' && conv.messageType === 'meeting_request');
    
    return matchesSearch && matchesFilter;
  });

  const handleSendMessage = () => {
    if (!messageText.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }

    const newMessage = {
      id: `m${Date.now()}`,
      conversationId: selectedParent?.id,
      senderId: user?.id || 'coach1',
      senderName: user?.name || 'Coach Miller',
      senderType: 'coach',
      message: messageText,
      timestamp: new Date().toISOString(),
      messageType: 'text',
      attachments: [],
      isRead: false,
    };

    setMessages([...messages, newMessage]);
    setMessageText('');
    Vibration.vibrate(30);
    Alert.alert('Success', 'Message sent successfully! 📨');
  };

  const handleSendProgressReport = () => {
    if (!progressData.playerId || !progressData.subject) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }

    const progressMessage = {
      id: `m${Date.now()}`,
      conversationId: selectedParent?.id,
      senderId: user?.id || 'coach1',
      senderName: user?.name || 'Coach Miller',
      senderType: 'coach',
      message: `Progress Report: ${progressData.subject}`,
      timestamp: new Date().toISOString(),
      messageType: 'progress_report',
      attachments: [
        {
          type: 'progress_data',
          data: progressData,
        }
      ],
      isRead: false,
    };

    setMessages([...messages, progressMessage]);
    resetProgressDialog();
    Vibration.vibrate([50, 200, 50]);
    Alert.alert('Success', 'Progress report sent successfully! 📊');
  };

  const resetProgressDialog = () => {
    setShowProgressDialog(false);
    setProgressData({
      playerId: '',
      subject: '',
      achievements: [],
      areas_improvement: '',
      upcoming_goals: '',
      attendance_rate: 85,
      performance_score: 7.8,
    });
  };

  const handleQuickAction = (action) => {
    Vibration.vibrate(30);
    
    switch (action.id) {
      case 'progress':
        setShowProgressDialog(true);
        break;
      case 'schedule':
        Alert.alert('Feature Coming Soon', 'Meeting scheduling will be available in the next update! 📅');
        break;
      case 'video':
        Alert.alert('Feature Coming Soon', 'Video sharing capabilities coming soon! 🎥');
        break;
      case 'announcement':
        Alert.alert('Feature Coming Soon', 'Announcement system will be available soon! 📢');
        break;
      default:
        Alert.alert('Info', `${action.title} feature coming soon!`);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const getMessageTypeIcon = (type) => {
    switch (type) {
      case 'meeting_request': return 'event';
      case 'video_share': return 'videocam';
      case 'progress_report': return 'assessment';
      default: return 'chat';
    }
  };

  const renderHeader = () => (
    <Animated.View style={[styles.headerContainer, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <IconButton
            icon="arrow-back"
            iconColor="white"
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTitle}>Parent Communication</Text>
          <IconButton
            icon="notifications"
            iconColor="white"
            onPress={() => Alert.alert('Feature Coming Soon', 'Notification center will be available soon! 🔔')}
          />
        </View>
        
        <View style={styles.headerStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{conversations.filter(c => c.unreadCount > 0).length}</Text>
            <Text style={styles.statLabel}>Unread</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{conversations.length}</Text>
            <Text style={styles.statLabel}>Total Chats</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{conversations.filter(c => c.priority === 'high').length}</Text>
            <Text style={styles.statLabel}>Priority</Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderQuickActions = () => (
    <Animated.View style={[styles.quickActionsContainer, { opacity: fadeAnim }]}>
      <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {quickActions.map((action, index) => (
          <Animated.View
            key={action.id}
            style={[
              styles.quickActionCard,
              {
                transform: [{
                  translateY: scrollY.interpolate({
                    inputRange: [0, 100],
                    outputRange: [0, -10],
                    extrapolate: 'clamp',
                  }),
                }]
              }
            ]}
          >
            <TouchableOpacity
              onPress={() => handleQuickAction(action)}
              style={[styles.quickActionButton, { backgroundColor: action.color }]}
            >
              <Icon name={action.icon} size={24} color="white" />
              <Text style={styles.quickActionText}>{action.title}</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>
    </Animated.View>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <Text style={styles.sectionTitle}>📋 Filter Conversations</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {parentFilters.map((filter) => (
          <TouchableOpacity
            key={filter.value}
            onPress={() => {
              setSelectedFilter(filter.value);
              Vibration.vibrate(30);
            }}
            style={[
              styles.filterChip,
              selectedFilter === filter.value && styles.selectedFilterChip
            ]}
          >
            <Icon 
              name={filter.icon} 
              size={18} 
              color={selectedFilter === filter.value ? 'white' : COLORS.primary} 
            />
            <Text style={[
              styles.filterText,
              selectedFilter === filter.value && styles.selectedFilterText
            ]}>
              {filter.label}
            </Text>
            <Badge style={[
              styles.filterBadge,
              selectedFilter === filter.value && { backgroundColor: 'rgba(255,255,255,0.3)' }
            ]}>
              {filter.count}
            </Badge>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderConversationCard = ({ item }) => (
    <Animated.View
      style={[
        styles.conversationCard,
        {
          transform: [{
            scale: scrollY.interpolate({
              inputRange: [0, 50],
              outputRange: [1, 0.98],
              extrapolate: 'clamp',
            }),
          }]
        }
      ]}
    >
      <TouchableOpacity
        onPress={() => navigation.navigate('ChatDetail', { 
          conversationId: item.id,
          parentName: item.parentName,
          playerName: item.playerName 
        })}
        style={styles.conversationTouchable}
      >
        <Card style={[styles.conversationCardContent, !item.isRead && styles.unreadCard]}>
          <View style={styles.conversationHeader}>
            <View style={styles.avatarContainer}>
              <Avatar.Image 
                size={50} 
                source={{ uri: item.parentAvatar }}
                style={styles.parentAvatar}
              />
              {item.unreadCount > 0 && (
                <Badge style={styles.unreadBadge}>{item.unreadCount}</Badge>
              )}
              {item.priority === 'high' && (
                <View style={styles.priorityIndicator}>
                  <Icon name="priority-high" size={16} color="#F44336" />
                </View>
              )}
            </View>
            
            <View style={styles.conversationInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.parentName}>{item.parentName}</Text>
                <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
              </View>
              <Text style={styles.playerName}>Parent of {item.playerName}</Text>
              <View style={styles.messageRow}>
                <Icon 
                  name={getMessageTypeIcon(item.messageType)} 
                  size={16} 
                  color={COLORS.secondary} 
                />
                <Text style={[
                  styles.lastMessage,
                  !item.isRead && styles.unreadMessage
                ]} numberOfLines={2}>
                  {item.lastMessage}
                </Text>
              </View>
            </View>
          </View>
          
          {item.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {item.tags.map((tag, index) => (
                <Chip key={index} compact style={styles.messageTag}>
                  {tag}
                </Chip>
              ))}
            </View>
          )}
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderProgressDialog = () => (
    <Portal>
      <Dialog visible={showProgressDialog} onDismiss={resetProgressDialog} style={styles.dialog}>
        <Dialog.Title style={styles.dialogTitle}>📊 Send Progress Report</Dialog.Title>
        <Dialog.Content>
          <ScrollView showsVerticalScrollIndicator={false} style={styles.dialogContent}>
            <Text style={styles.dialogLabel}>Select Player *</Text>
            <View style={styles.playerSelector}>
              {mockConversations.map(conv => (
                <TouchableOpacity
                  key={conv.playerId}
                  onPress={() => setProgressData({ ...progressData, playerId: conv.playerId })}
                  style={[
                    styles.playerOption,
                    progressData.playerId === conv.playerId && styles.selectedPlayerOption
                  ]}
                >
                  <Avatar.Image size={40} source={{ uri: conv.parentAvatar }} />
                  <Text style={styles.playerOptionText}>{conv.playerName}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.dialogLabel}>Report Subject *</Text>
            <TextInput
              placeholder="e.g., Weekly Performance Update"
              value={progressData.subject}
              onChangeText={(text) => setProgressData({ ...progressData, subject: text })}
              style={styles.textInput}
            />

            <Text style={styles.dialogLabel}>Key Achievements</Text>
            <View style={styles.achievementsGrid}>
              {achievementBadges.map(badge => (
                <TouchableOpacity
                  key={badge.id}
                  onPress={() => {
                    const achievements = progressData.achievements.includes(badge.id)
                      ? progressData.achievements.filter(id => id !== badge.id)
                      : [...progressData.achievements, badge.id];
                    setProgressData({ ...progressData, achievements });
                  }}
                  style={[
                    styles.achievementBadge,
                    progressData.achievements.includes(badge.id) && styles.selectedAchievement
                  ]}
                >
                  <Icon 
                    name={badge.icon} 
                    size={20} 
                    color={progressData.achievements.includes(badge.id) ? 'white' : COLORS.primary} 
                  />
                  <Text style={[
                    styles.achievementText,
                    progressData.achievements.includes(badge.id) && styles.selectedAchievementText
                  ]}>
                    {badge.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.dialogLabel}>Performance Metrics</Text>
            <View style={styles.metricsContainer}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Attendance Rate</Text>
                <View style={styles.metricRow}>
                  <ProgressBar 
                    progress={progressData.attendance_rate / 100} 
                    color={COLORS.success}
                    style={styles.metricBar}
                  />
                  <Text style={styles.metricValue}>{progressData.attendance_rate}%</Text>
                </View>
              </View>
              
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Performance Score</Text>
                <View style={styles.metricRow}>
                  <ProgressBar 
                    progress={progressData.performance_score / 10} 
                    color={COLORS.primary}
                    style={styles.metricBar}
                  />
                  <Text style={styles.metricValue}>{progressData.performance_score}/10</Text>
                </View>
              </View>
            </View>

            <Text style={styles.dialogLabel}>Areas for Improvement</Text>
            <TextInput
              placeholder="Specific areas where the player can focus on improvement..."
              value={progressData.areas_improvement}
              onChangeText={(text) => setProgressData({ ...progressData, areas_improvement: text })}
              style={[styles.textInput, styles.multilineInput]}
              multiline
              numberOfLines={3}
            />

            <Text style={styles.dialogLabel}>Upcoming Goals</Text>
            <TextInput
              placeholder="Goals and objectives for the next period..."
              value={progressData.upcoming_goals}
              onChangeText={(text) => setProgressData({ ...progressData, upcoming_goals: text })}
              style={[styles.textInput, styles.multilineInput]}
              multiline
              numberOfLines={3}
            />
          </ScrollView>
        </Dialog.Content>
        <Dialog.Actions style={styles.dialogActions}>
          <Button onPress={resetProgressDialog} textColor={COLORS.secondary}>
            Cancel
          </Button>
          <Button 
            mode="contained" 
            onPress={handleSendProgressReport}
            buttonColor={COLORS.primary}
          >
            Send Report
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );

  const renderComposeDialog = () => (
    <Portal>
      <Dialog visible={showComposeDialog} onDismiss={() => setShowComposeDialog(false)} style={styles.dialog}>
        <Dialog.Title style={styles.dialogTitle}>✉️ New Message</Dialog.Title>
        <Dialog.Content>
          <Text style={styles.dialogLabel}>Send to: {selectedParent?.parentName}</Text>
          <TextInput
            placeholder="Type your message here..."
            value={messageText}
            onChangeText={setMessageText}
            style={[styles.textInput, styles.messageInput]}
            multiline
            numberOfLines={4}
          />
        </Dialog.Content>
        <Dialog.Actions style={styles.dialogActions}>
          <Button onPress={() => setShowComposeDialog(false)} textColor={COLORS.secondary}>
            Cancel
          </Button>
          <Button 
            mode="contained" 
            onPress={handleSendMessage}
            buttonColor={COLORS.primary}
          >
            Send
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );

  const renderEmptyState = () => (
    <Surface style={styles.emptyState}>
      <Icon name="forum" size={80} color={COLORS.secondary} />
      <Text style={styles.emptyTitle}>No Conversations Found</Text>
      <Text style={styles.emptySubtitle}>
        Start connecting with parents to build stronger team relationships
      </Text>
      <Button
        mode="contained"
        onPress={() => Alert.alert('Feature Coming Soon', 'Parent invitation system coming soon! 👥')}
        style={styles.emptyButton}
        buttonColor={COLORS.primary}
      >
        Invite Parents
      </Button>
    </Surface>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      {renderHeader()}

      <Animated.ScrollView
        style={styles.content}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {renderQuickActions()}
        {renderFilters()}

        <Searchbar
          placeholder="Search parents, players, or messages..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={COLORS.primary}
        />

        <View style={styles.conversationsSection}>
          <Text style={styles.sectionTitle}>
            💬 Recent Conversations ({filteredConversations.length})
          </Text>
          
          {filteredConversations.length > 0 ? (
            <FlatList
              data={filteredConversations}
              keyExtractor={(item) => item.id}
              renderItem={renderConversationCard}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            renderEmptyState()
          )}
        </View>
      </Animated.ScrollView>

      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => Alert.alert('Feature Coming Soon', 'Compose new message feature coming soon! ✉️')}
        color="white"
      />

      {renderProgressDialog()}
      {renderComposeDialog()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerContainer: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    paddingTop: SPACING.xl + 20,
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.md,
  },
  headerTitle: {
    ...TEXT_STYLES.heading,
    color: 'white',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: SPACING.md,
  },
  headerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: SPACING.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...TEXT_STYLES.heading,
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  quickActionsContainer: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TEXT_STYLES.subheading,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    fontWeight: '600',
  },
  quickActionCard: {
    marginRight: SPACING.md,
  },
  quickActionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 12,
    minWidth: 120,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
  },
  quickActionText: {
    ...TEXT_STYLES.caption,
    color: 'white',
    marginTop: SPACING.xs,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  filtersContainer: {
    marginBottom: SPACING.lg,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 1,
  },
  selectedFilterChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    marginLeft: SPACING.xs,
    marginRight: SPACING.xs,
    fontSize: 14,
  },
  selectedFilterText: {
    color: 'white',
  },
  filterBadge: {
    backgroundColor: COLORS.primary,
    minWidth: 20,
    height: 20,
  },
  searchBar: {
    marginBottom: SPACING.lg,
    elevation: 2,
    borderRadius: 8,
  },
  conversationsSection: {
    marginBottom: SPACING.xl,
  },
  conversationCard: {
    marginBottom: SPACING.md,
  },
  conversationTouchable: {
    borderRadius: 12,
  },
  conversationCardContent: {
    padding: SPACING.md,
    elevation: 2,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    backgroundColor: '#F8F9FF',
  },
  conversationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: SPACING.md,
  },
  parentAvatar: {
    backgroundColor: COLORS.background,
  },
  unreadBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: COLORS.primary,
    minWidth: 20,
    height: 20,
  },
  priorityIndicator: {
    position: 'absolute',
    top: -8,
    left: -8,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 2,
    elevation: 2,
  },
  conversationInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  parentName: {
    ...TEXT_STYLES.subheading,
    color: COLORS.text,
    fontWeight: 'bold',
    flex: 1,
  },
  timestamp: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
    fontSize: 12,
  },
  playerName: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  lastMessage: {
    ...TEXT_STYLES.body,
    color: COLORS.secondary,
    flex: 1,
    marginLeft: SPACING.sm,
    lineHeight: 20,
  },
  unreadMessage: {
    color: COLORS.text,
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.sm,
  },
  messageTag: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
    backgroundColor: COLORS.background,
  },
  dialog: {
    borderRadius: 16,
  },
  dialogTitle: {
    ...TEXT_STYLES.heading,
    color: COLORS.text,
    textAlign: 'center',
  },
  dialogContent: {
    maxHeight: height * 0.6,
    paddingHorizontal: 0,
  },
  dialogLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: '600',
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  playerSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  playerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedPlayerOption: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  playerOptionText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    marginLeft: SPACING.sm,
    fontWeight: '500',
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    ...TEXT_STYLES.body,
    color: COLORS.text,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  messageInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  achievementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedAchievement: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  achievementText: {
    ...TEXT_STYLES.caption,
    color: COLORS.text,
    marginLeft: SPACING.xs,
    fontSize: 12,
  },
  selectedAchievementText: {
    color: 'white',
  },
  metricsContainer: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  metricItem: {
    marginBottom: SPACING.md,
  },
  metricLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.md,
  },
  metricValue: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    fontWeight: 'bold',
    minWidth: 50,
  },
  dialogActions: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    marginVertical: SPACING.xl,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    elevation: 1,
  },
  emptyTitle: {
    ...TEXT_STYLES.heading,
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.secondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  emptyButton: {
    marginTop: SPACING.sm,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
    borderRadius: 28,
  },
});

export default ParentCommunication;