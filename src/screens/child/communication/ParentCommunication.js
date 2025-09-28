import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
  Alert,
  Animated,
  Vibration,
  Dimensions,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  Surface,
  Badge,
  FAB,
  Searchbar,
  Portal,
  Modal,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const ParentCommunication = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, children, coaches, messages } = useSelector(state => state.auth);
  
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('messages');
  const [searchQuery, setSearchQuery] = useState('');
  const [showComposer, setShowComposer] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      // dispatch(fetchCommunications());
    } catch (error) {
      console.error('Error refreshing communications:', error);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const handleMessagePress = (conversation) => {
    Vibration.vibrate(50);
    navigation.navigate('ChatScreen', { 
      conversationId: conversation.id,
      participantName: conversation.coachName,
      childName: conversation.childName 
    });
  };

  const handleCoachPress = (coach) => {
    Vibration.vibrate(50);
    navigation.navigate('CoachProfile', { coachId: coach.id });
  };

  const handleNewMessage = () => {
    setShowComposer(true);
    Vibration.vibrate(50);
  };

  const handleProgressUpdate = (update) => {
    Vibration.vibrate(50);
    navigation.navigate('ChildProgress', { 
      childId: update.childId,
      updateId: update.id 
    });
  };

  // Mock data for conversations
  const mockConversations = [
    {
      id: '1',
      coachName: 'Coach Sarah Martinez',
      coachAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
      childName: 'Emma',
      lastMessage: 'Emma showed great improvement in her passing technique today! 🌟',
      timestamp: '2 hours ago',
      unreadCount: 2,
      isOnline: true,
      sport: 'Football',
    },
    {
      id: '2',
      coachName: 'Coach Mike Johnson',
      coachAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      childName: 'Alex',
      lastMessage: 'Please remind Alex to bring his shin guards for tomorrow\'s practice.',
      timestamp: '1 day ago',
      unreadCount: 0,
      isOnline: false,
      sport: 'Basketball',
    },
    {
      id: '3',
      coachName: 'Coach Lisa Chen',
      coachAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
      childName: 'Emma',
      lastMessage: 'Great job completing the weekly fitness challenge! 💪',
      timestamp: '3 days ago',
      unreadCount: 1,
      isOnline: true,
      sport: 'Swimming',
    },
  ];

  // Mock data for progress updates
  const mockProgressUpdates = [
    {
      id: '1',
      childName: 'Emma',
      childAvatar: '👧',
      coachName: 'Coach Sarah',
      sport: 'Football',
      type: 'skill_assessment',
      title: 'Monthly Skill Assessment',
      summary: 'Emma has shown excellent progress in dribbling and ball control.',
      timestamp: '1 hour ago',
      metrics: ['Dribbling: 8/10', 'Passing: 7/10', 'Shooting: 6/10'],
      isNew: true,
    },
    {
      id: '2',
      childName: 'Alex',
      childAvatar: '👦',
      coachName: 'Coach Mike',
      sport: 'Basketball',
      type: 'attendance',
      title: 'Attendance Update',
      summary: 'Alex has attended 9 out of 10 sessions this month. Keep it up!',
      timestamp: '2 days ago',
      isNew: false,
    },
    {
      id: '3',
      childName: 'Emma',
      childAvatar: '👧',
      coachName: 'Coach Lisa',
      sport: 'Swimming',
      type: 'achievement',
      title: 'New Personal Best! 🏆',
      summary: 'Emma achieved a new personal best in 50m freestyle: 32.5 seconds!',
      timestamp: '1 week ago',
      isNew: false,
    },
  ];

  const renderTabBar = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'messages' && styles.activeTab]}
        onPress={() => setActiveTab('messages')}
      >
        <MaterialIcons 
          name="message" 
          size={20} 
          color={activeTab === 'messages' ? COLORS.white : COLORS.textSecondary} 
        />
        <Text style={[
          styles.tabText, 
          activeTab === 'messages' && styles.activeTabText
        ]}>
          Messages
        </Text>
        {mockConversations.filter(c => c.unreadCount > 0).length > 0 && (
          <Badge style={styles.tabBadge} size={16}>
            {mockConversations.reduce((sum, c) => sum + c.unreadCount, 0)}
          </Badge>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === 'updates' && styles.activeTab]}
        onPress={() => setActiveTab('updates')}
      >
        <MaterialIcons 
          name="trending-up" 
          size={20} 
          color={activeTab === 'updates' ? COLORS.white : COLORS.textSecondary} 
        />
        <Text style={[
          styles.tabText, 
          activeTab === 'updates' && styles.activeTabText
        ]}>
          Updates
        </Text>
        {mockProgressUpdates.filter(u => u.isNew).length > 0 && (
          <Badge style={styles.tabBadge} size={16}>
            {mockProgressUpdates.filter(u => u.isNew).length}
          </Badge>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === 'coaches' && styles.activeTab]}
        onPress={() => setActiveTab('coaches')}
      >
        <MaterialIcons 
          name="people" 
          size={20} 
          color={activeTab === 'coaches' ? COLORS.white : COLORS.textSecondary} 
        />
        <Text style={[
          styles.tabText, 
          activeTab === 'coaches' && styles.activeTabText
        ]}>
          Coaches
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderConversationCard = (conversation) => (
    <TouchableOpacity
      key={conversation.id}
      onPress={() => handleMessagePress(conversation)}
      activeOpacity={0.7}
    >
      <Card style={[
        styles.conversationCard,
        conversation.unreadCount > 0 && styles.unreadConversation
      ]}>
        <Card.Content style={styles.conversationContent}>
          <View style={styles.conversationRow}>
            <View style={styles.avatarContainer}>
              <Avatar.Image 
                source={{ uri: conversation.coachAvatar }} 
                size={50}
              />
              {conversation.isOnline && (
                <View style={styles.onlineIndicator} />
              )}
            </View>
            
            <View style={styles.messageContainer}>
              <View style={styles.messageHeader}>
                <Text style={[TEXT_STYLES.h4, styles.coachName]}>
                  {conversation.coachName}
                </Text>
                <Text style={[TEXT_STYLES.caption, styles.timestamp]}>
                  {conversation.timestamp}
                </Text>
              </View>
              
              <Text style={[TEXT_STYLES.caption, styles.childTag]}>
                {conversation.childName} • {conversation.sport}
              </Text>
              
              <Text style={[
                TEXT_STYLES.body, 
                styles.lastMessage,
                conversation.unreadCount > 0 && styles.unreadMessage
              ]}>
                {conversation.lastMessage}
              </Text>
            </View>
            
            <View style={styles.conversationActions}>
              {conversation.unreadCount > 0 && (
                <Badge style={styles.unreadBadge} size={20}>
                  {conversation.unreadCount}
                </Badge>
              )}
              <MaterialIcons 
                name="chevron-right" 
                size={24} 
                color={COLORS.textSecondary} 
              />
            </View>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderProgressUpdateCard = (update) => (
    <TouchableOpacity
      key={update.id}
      onPress={() => handleProgressUpdate(update)}
      activeOpacity={0.7}
    >
      <Card style={[
        styles.updateCard,
        update.isNew && styles.newUpdate
      ]}>
        <Card.Content style={styles.updateContent}>
          <View style={styles.updateHeader}>
            <View style={styles.updateAvatarContainer}>
              <Text style={styles.childAvatar}>{update.childAvatar}</Text>
              {update.isNew && (
                <View style={styles.newIndicator} />
              )}
            </View>
            
            <View style={styles.updateInfo}>
              <Text style={[TEXT_STYLES.h4, styles.updateTitle]}>
                {update.title}
              </Text>
              <Text style={[TEXT_STYLES.caption, styles.updateMeta]}>
                {update.childName} • {update.sport} • {update.coachName}
              </Text>
            </View>
            
            <Text style={[TEXT_STYLES.caption, styles.updateTime]}>
              {update.timestamp}
            </Text>
          </View>
          
          <Text style={[TEXT_STYLES.body, styles.updateSummary]}>
            {update.summary}
          </Text>
          
          {update.metrics && (
            <View style={styles.metricsContainer}>
              {update.metrics.map((metric, index) => (
                <Chip key={index} style={styles.metricChip} textStyle={styles.metricText}>
                  {metric}
                </Chip>
              ))}
            </View>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderCoachCard = (coach) => (
    <TouchableOpacity
      key={coach.id}
      onPress={() => handleCoachPress(coach)}
      activeOpacity={0.7}
    >
      <Card style={styles.coachCard}>
        <Card.Content style={styles.coachContent}>
          <View style={styles.coachRow}>
            <Avatar.Image 
              source={{ uri: coach.avatar }} 
              size={60}
            />
            <View style={styles.coachInfo}>
              <Text style={[TEXT_STYLES.h4, styles.coachName]}>
                {coach.name}
              </Text>
              <Text style={[TEXT_STYLES.body, styles.coachSpecialty]}>
                {coach.specialty}
              </Text>
              <Text style={[TEXT_STYLES.caption, styles.coachDetails]}>
                Training {coach.childName} • {coach.rating} ⭐
              </Text>
            </View>
            <View style={styles.coachActions}>
              <IconButton
                icon="message"
                size={24}
                iconColor={COLORS.primary}
                onPress={() => handleMessagePress({ 
                  id: coach.conversationId, 
                  coachName: coach.name,
                  childName: coach.childName 
                })}
              />
              <IconButton
                icon="phone"
                size={24}
                iconColor={COLORS.success}
                onPress={() => Alert.alert('📞 Call Coach', `Would you like to call ${coach.name}?`)}
              />
            </View>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const mockCoaches = [
    {
      id: '1',
      name: 'Coach Sarah Martinez',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
      specialty: 'Youth Football Coach',
      childName: 'Emma',
      rating: 4.9,
      conversationId: '1',
    },
    {
      id: '2',
      name: 'Coach Mike Johnson',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      specialty: 'Basketball Development',
      childName: 'Alex',
      rating: 4.8,
      conversationId: '2',
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'messages':
        return (
          <View style={styles.tabContent}>
            <Searchbar
              placeholder="Search conversations..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
            />
            {mockConversations.map(renderConversationCard)}
          </View>
        );
      
      case 'updates':
        return (
          <View style={styles.tabContent}>
            <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
              Progress & Updates 📊
            </Text>
            {mockProgressUpdates.map(renderProgressUpdateCard)}
          </View>
        );
      
      case 'coaches':
        return (
          <View style={styles.tabContent}>
            <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
              Your Child's Coaches 👨‍🏫
            </Text>
            {mockCoaches.map(renderCoachCard)}
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={[TEXT_STYLES.h2, styles.headerTitle]}>
            Communication Hub 💬
          </Text>
          <IconButton
            icon="notifications"
            size={24}
            iconColor={COLORS.white}
            onPress={() => navigation.navigate('ParentNotifications')}
            style={styles.notificationButton}
          />
        </View>
        <Text style={[TEXT_STYLES.body, styles.headerSubtitle]}>
          Stay connected with your child's coaches and progress
        </Text>
      </LinearGradient>

      {renderTabBar()}

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        >
          {renderContent()}
          <View style={styles.bottomPadding} />
        </ScrollView>
      </Animated.View>

      {activeTab === 'messages' && (
        <FAB
          icon="message-plus"
          style={styles.fab}
          onPress={handleNewMessage}
          color={COLORS.white}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.md,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  headerTitle: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: COLORS.white + 'CC',
    fontSize: 14,
  },
  notificationButton: {
    margin: 0,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    elevation: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    backgroundColor: COLORS.surface,
    position: 'relative',
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    marginLeft: SPACING.xs,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.white,
  },
  tabBadge: {
    position: 'absolute',
    top: 6,
    right: 8,
    backgroundColor: COLORS.error,
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: SPACING.md,
  },
  searchBar: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.white,
    elevation: 2,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  conversationCard: {
    backgroundColor: COLORS.white,
    elevation: 2,
    borderRadius: 12,
    marginBottom: SPACING.sm,
  },
  unreadConversation: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  conversationContent: {
    paddingVertical: SPACING.sm,
  },
  conversationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: SPACING.sm,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  messageContainer: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  coachName: {
    flex: 1,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  timestamp: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  childTag: {
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  lastMessage: {
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  unreadMessage: {
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  conversationActions: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.xs,
  },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  updateCard: {
    backgroundColor: COLORS.white,
    elevation: 2,
    borderRadius: 12,
    marginBottom: SPACING.sm,
  },
  newUpdate: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  updateContent: {
    paddingVertical: SPACING.sm,
  },
  updateHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  updateAvatarContainer: {
    position: 'relative',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  childAvatar: {
    fontSize: 20,
  },
  newIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  updateInfo: {
    flex: 1,
  },
  updateTitle: {
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  updateMeta: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  updateTime: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  updateSummary: {
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  metricChip: {
    backgroundColor: COLORS.primary + '20',
    height: 28,
  },
  metricText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
  },
  coachCard: {
    backgroundColor: COLORS.white,
    elevation: 2,
    borderRadius: 12,
    marginBottom: SPACING.sm,
  },
  coachContent: {
    paddingVertical: SPACING.sm,
  },
  coachRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coachInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  coachSpecialty: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  coachDetails: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  coachActions: {
    flexDirection: 'row',
  },
  fab: {
    position: 'absolute',
    right: SPACING.md,
    bottom: SPACING.md,
    backgroundColor: COLORS.primary,
  },
  bottomPadding: {
    height: SPACING.xl,
  },
});

export default ParentCommunication;