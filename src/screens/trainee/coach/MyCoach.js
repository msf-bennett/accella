import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  Dimensions,
  Animated,
  RefreshControl,
  TouchableOpacity,
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
  ProgressBar,
  Portal,
  Modal,
  Searchbar,
  Divider,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

const { width, height } = Dimensions.get('window');

// Design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#f44336',
  warning: '#FF9800',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  accent: '#FF6B6B',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
  h3: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textSecondary },
  small: { fontSize: 12, color: COLORS.textSecondary },
};

const MyCoach = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => ({
    user: state.auth.user,
  }));

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock coach data
  const [coachData] = useState({
    id: 'coach_001',
    name: 'Sarah Johnson',
    avatar: null,
    title: 'Certified Personal Trainer & Nutritionist',
    specializations: ['HIIT Training', 'Weight Loss', 'Strength Building', 'Nutrition'],
    rating: 4.9,
    reviewCount: 127,
    experience: '8 years',
    certifications: ['NASM-CPT', 'Precision Nutrition L1', 'HIIT Specialist'],
    bio: 'Passionate about helping people achieve their fitness goals through personalized training programs and sustainable lifestyle changes. Specializing in HIIT workouts and evidence-based nutrition coaching.',
    contact: {
      phone: '+1 (555) 123-4567',
      email: 'sarah.johnson@fitcoach.com',
      availability: 'Mon-Fri: 6AM-8PM, Sat: 8AM-6PM',
    },
    stats: {
      clientsHelped: 150,
      successRate: 94,
      avgWeightLoss: '15 lbs',
      totalSessions: 1847,
    },
    relationship: {
      since: '2024-01-15',
      totalSessions: 32,
      nextSession: '2024-08-26',
      sessionTime: '10:00 AM',
      plan: 'Premium Coaching Package',
    },
    recentProgress: {
      weightLoss: 8.5,
      sessionsCompleted: 32,
      streakDays: 15,
      goalsAchieved: 7,
    },
    upcomingSessions: [
      {
        id: 'session_001',
        title: 'Upper Body Strength',
        date: '2024-08-26',
        time: '10:00 AM',
        duration: 60,
        type: 'In-Person',
        location: 'FitLife Gym',
      },
      {
        id: 'session_002',
        title: 'HIIT Cardio Session',
        date: '2024-08-28',
        time: '2:00 PM',
        duration: 45,
        type: 'Virtual',
        location: 'Online',
      },
      {
        id: 'session_003',
        title: 'Nutrition Consultation',
        date: '2024-08-30',
        time: '11:00 AM',
        duration: 30,
        type: 'Video Call',
        location: 'Online',
      },
    ],
    recentMessages: [
      {
        id: 'msg_001',
        text: 'Great job on today\'s workout! Your form has improved significantly.',
        timestamp: '2024-08-24 15:30',
        isCoach: true,
      },
      {
        id: 'msg_002',
        text: 'Thank you! I\'m feeling much stronger. Question about tomorrow\'s session?',
        timestamp: '2024-08-24 15:35',
        isCoach: false,
      },
      {
        id: 'msg_003',
        text: 'Of course! What would you like to know?',
        timestamp: '2024-08-24 15:40',
        isCoach: true,
      },
    ],
  });

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, scaleAnim]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Vibration.vibrate(50);
    // Simulate data refresh
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const handleContactCoach = () => {
    setShowContactModal(true);
    Vibration.vibrate(50);
  };

  const handleBookSession = () => {
    Alert.alert(
      'Book Session',
      'Would you like to book a new session with Sarah?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Book Now', onPress: () => navigation.navigate('BookSession') },
      ]
    );
  };

  const handleMessageCoach = () => {
    navigation.navigate('Chat', { coachId: coachData.id, coachName: coachData.name });
  };

  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.header}
    >
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <Animated.View
        style={[
          styles.headerContent,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.coachProfile}>
          <Avatar.Text
            size={80}
            label={coachData.name.split(' ').map(n => n[0]).join('')}
            style={styles.coachAvatar}
            labelStyle={{ fontSize: 28, fontWeight: 'bold' }}
          />
          <View style={styles.coachInfo}>
            <Text style={[TEXT_STYLES.h2, { color: 'white', marginBottom: 4 }]}>
              {coachData.name}
            </Text>
            <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.9)', marginBottom: 8 }]}>
              {coachData.title}
            </Text>
            <View style={styles.ratingContainer}>
              <Icon name="star" size={16} color="#FFD700" />
              <Text style={[TEXT_STYLES.body, { color: 'white', marginLeft: 4, fontWeight: 'bold' }]}>
                {coachData.rating}
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)', marginLeft: 4 }]}>
                ({coachData.reviewCount} reviews)
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.relationshipInfo}>
          <Surface style={styles.relationshipCard}>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
              Your Coach Since
            </Text>
            <Text style={[TEXT_STYLES.body, { fontWeight: 'bold', marginTop: 2 }]}>
              January 2024
            </Text>
          </Surface>
          <Surface style={styles.relationshipCard}>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
              Total Sessions
            </Text>
            <Text style={[TEXT_STYLES.body, { fontWeight: 'bold', marginTop: 2 }]}>
              {coachData.relationship.totalSessions}
            </Text>
          </Surface>
          <Surface style={styles.relationshipCard}>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
              Plan
            </Text>
            <Text style={[TEXT_STYLES.caption, { fontWeight: 'bold', marginTop: 2 }]}>
              Premium
            </Text>
          </Surface>
        </View>
      </Animated.View>
    </LinearGradient>
  );

  const renderTabNavigation = () => (
    <Surface style={styles.tabContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabScrollContent}
      >
        {[
          { id: 'overview', label: 'Overview', icon: 'dashboard' },
          { id: 'sessions', label: 'Sessions', icon: 'event' },
          { id: 'progress', label: 'Progress', icon: 'trending-up' },
          { id: 'chat', label: 'Messages', icon: 'chat' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              selectedTab === tab.id && styles.activeTab,
            ]}
            onPress={() => {
              setSelectedTab(tab.id);
              Vibration.vibrate(30);
            }}
          >
            <Icon
              name={tab.icon}
              size={20}
              color={selectedTab === tab.id ? 'white' : COLORS.textSecondary}
            />
            <Text
              style={[
                TEXT_STYLES.caption,
                {
                  marginLeft: 6,
                  color: selectedTab === tab.id ? 'white' : COLORS.textSecondary,
                  fontWeight: selectedTab === tab.id ? 'bold' : 'normal',
                },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Surface>
  );

  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      {/* Quick Actions */}
      <Card style={styles.quickActionsCard}>
        <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>⚡ Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleMessageCoach}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.actionGradient}
            >
              <Icon name="chat" size={24} color="white" />
              <Text style={[TEXT_STYLES.caption, { color: 'white', marginTop: 4, textAlign: 'center' }]}>
                Message Coach
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleBookSession}
          >
            <LinearGradient
              colors={['#4CAF50', '#45A049']}
              style={styles.actionGradient}
            >
              <Icon name="add-circle" size={24} color="white" />
              <Text style={[TEXT_STYLES.caption, { color: 'white', marginTop: 4, textAlign: 'center' }]}>
                Book Session
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowProgressModal(true)}
          >
            <LinearGradient
              colors={['#FF9800', '#F57C00']}
              style={styles.actionGradient}
            >
              <Icon name="analytics" size={24} color="white" />
              <Text style={[TEXT_STYLES.caption, { color: 'white', marginTop: 4, textAlign: 'center' }]}>
                View Progress
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleContactCoach}
          >
            <LinearGradient
              colors={['#9C27B0', '#7B1FA2']}
              style={styles.actionGradient}
            >
              <Icon name="contact-phone" size={24} color="white" />
              <Text style={[TEXT_STYLES.caption, { color: 'white', marginTop: 4, textAlign: 'center' }]}>
                Contact Info
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Coach Specializations */}
      <Card style={styles.specializationsCard}>
        <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>🎯 Specializations</Text>
        <View style={styles.chipContainer}>
          {coachData.specializations.map((spec, index) => (
            <Chip
              key={index}
              mode="outlined"
              style={[styles.specChip, { marginRight: SPACING.sm, marginBottom: SPACING.sm }]}
              textStyle={{ fontSize: 12 }}
            >
              {spec}
            </Chip>
          ))}
        </View>
      </Card>

      {/* Coach Stats */}
      <Card style={styles.statsCard}>
        <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>📊 Coach Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Icon name="people" size={24} color={COLORS.primary} />
            <Text style={[TEXT_STYLES.h3, { marginTop: 4 }]}>{coachData.stats.clientsHelped}</Text>
            <Text style={TEXT_STYLES.caption}>Clients Helped</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="check-circle" size={24} color={COLORS.success} />
            <Text style={[TEXT_STYLES.h3, { marginTop: 4 }]}>{coachData.stats.successRate}%</Text>
            <Text style={TEXT_STYLES.caption}>Success Rate</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="fitness-center" size={24} color={COLORS.warning} />
            <Text style={[TEXT_STYLES.h3, { marginTop: 4 }]}>{coachData.stats.totalSessions}</Text>
            <Text style={TEXT_STYLES.caption}>Total Sessions</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="trending-down" size={24} color={COLORS.accent} />
            <Text style={[TEXT_STYLES.h3, { marginTop: 4 }]}>{coachData.stats.avgWeightLoss}</Text>
            <Text style={TEXT_STYLES.caption}>Avg Weight Loss</Text>
          </View>
        </View>
      </Card>

      {/* About Coach */}
      <Card style={styles.aboutCard}>
        <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>👨‍⚕️ About Your Coach</Text>
        <Text style={[TEXT_STYLES.body, { lineHeight: 22, marginBottom: SPACING.md }]}>
          {coachData.bio}
        </Text>
        <View style={styles.certificationContainer}>
          <Text style={[TEXT_STYLES.body, { fontWeight: 'bold', marginBottom: SPACING.sm }]}>
            Certifications:
          </Text>
          {coachData.certifications.map((cert, index) => (
            <Chip
              key={index}
              icon="verified"
              mode="flat"
              compact
              style={[styles.certChip, { marginRight: SPACING.sm, marginBottom: SPACING.sm }]}
              textStyle={{ fontSize: 11 }}
            >
              {cert}
            </Chip>
          ))}
        </View>
      </Card>
    </View>
  );

  const renderSessionsTab = () => (
    <View style={styles.tabContent}>
      {/* Next Session */}
      <Card style={styles.nextSessionCard}>
        <LinearGradient
          colors={['#4CAF50', '#45A049']}
          style={styles.nextSessionGradient}
        >
          <View style={styles.nextSessionHeader}>
            <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>🗓️ Next Session</Text>
            <Chip
              mode="flat"
              compact
              textStyle={{ color: 'white', fontSize: 10 }}
              style={styles.upcomingChip}
            >
              UPCOMING
            </Chip>
          </View>
          <Text style={[TEXT_STYLES.h2, { color: 'white', marginVertical: SPACING.sm }]}>
            {coachData.upcomingSessions[0].title}
          </Text>
          <View style={styles.sessionDetails}>
            <View style={styles.sessionDetailItem}>
              <Icon name="event" size={16} color="white" />
              <Text style={[TEXT_STYLES.body, { color: 'white', marginLeft: 6 }]}>
                Aug 26, 10:00 AM
              </Text>
            </View>
            <View style={styles.sessionDetailItem}>
              <Icon name="access-time" size={16} color="white" />
              <Text style={[TEXT_STYLES.body, { color: 'white', marginLeft: 6 }]}>
                60 minutes
              </Text>
            </View>
            <View style={styles.sessionDetailItem}>
              <Icon name="location-on" size={16} color="white" />
              <Text style={[TEXT_STYLES.body, { color: 'white', marginLeft: 6 }]}>
                FitLife Gym
              </Text>
            </View>
          </View>
          <Button
            mode="contained"
            onPress={() => Alert.alert('Session Reminder', 'Reminder set! You\'ll be notified 30 minutes before.')}
            style={styles.reminderButton}
            labelStyle={{ color: COLORS.success, fontWeight: 'bold' }}
          >
            Set Reminder 🔔
          </Button>
        </LinearGradient>
      </Card>

      {/* Upcoming Sessions */}
      <Card style={styles.upcomingSessionsCard}>
        <View style={styles.cardHeader}>
          <Text style={TEXT_STYLES.h3}>📅 Upcoming Sessions</Text>
          <Chip
            mode="outlined"
            compact
            textStyle={{ fontSize: 10 }}
          >
            {coachData.upcomingSessions.length} scheduled
          </Chip>
        </View>
        
        {coachData.upcomingSessions.map((session, index) => (
          <TouchableOpacity
            key={session.id}
            style={[styles.sessionItem, index === 0 && styles.nextSessionHighlight]}
            onPress={() => Alert.alert('Session Details', `${session.title}\n${session.date} at ${session.time}`)}
          >
            <View style={styles.sessionLeft}>
              <Avatar.Icon
                size={40}
                icon={session.type === 'Virtual' ? 'video-call' : 'fitness-center'}
                style={{
                  backgroundColor: index === 0 ? COLORS.success : 
                                 session.type === 'Virtual' ? COLORS.primary : COLORS.warning,
                }}
              />
              <View style={styles.sessionInfo}>
                <Text style={[TEXT_STYLES.body, { fontWeight: 'bold' }]}>
                  {session.title}
                </Text>
                <Text style={TEXT_STYLES.caption}>
                  {session.date} • {session.time}
                </Text>
                <Text style={[TEXT_STYLES.small, { color: COLORS.textSecondary }]}>
                  {session.duration}min • {session.location}
                </Text>
              </View>
            </View>
            <View style={styles.sessionRight}>
              <Chip
                mode="flat"
                compact
                style={{
                  backgroundColor: session.type === 'Virtual' ? 
                    'rgba(103, 126, 234, 0.1)' : 'rgba(255, 152, 0, 0.1)',
                }}
                textStyle={{ fontSize: 10 }}
              >
                {session.type}
              </Chip>
              <IconButton
                icon="chevron-right"
                size={20}
                onPress={() => Alert.alert('Feature Coming Soon', 'Session details will be available soon!')}
              />
            </View>
          </TouchableOpacity>
        ))}
      </Card>
    </View>
  );

  const renderProgressTab = () => (
    <View style={styles.tabContent}>
      {/* Progress Overview */}
      <Card style={styles.progressCard}>
        <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>📈 Your Progress</Text>
        
        <View style={styles.progressGrid}>
          <View style={styles.progressItem}>
            <Icon name="fitness-center" size={24} color={COLORS.success} />
            <Text style={[TEXT_STYLES.h2, { marginTop: 4, color: COLORS.success }]}>
              {coachData.recentProgress.sessionsCompleted}
            </Text>
            <Text style={TEXT_STYLES.caption}>Sessions Completed</Text>
          </View>
          <View style={styles.progressItem}>
            <Icon name="local-fire-department" size={24} color={COLORS.accent} />
            <Text style={[TEXT_STYLES.h2, { marginTop: 4, color: COLORS.accent }]}>
              {coachData.recentProgress.streakDays}
            </Text>
            <Text style={TEXT_STYLES.caption}>Day Streak</Text>
          </View>
          <View style={styles.progressItem}>
            <Icon name="trending-down" size={24} color={COLORS.primary} />
            <Text style={[TEXT_STYLES.h2, { marginTop: 4, color: COLORS.primary }]}>
              {coachData.recentProgress.weightLoss}
            </Text>
            <Text style={TEXT_STYLES.caption}>lbs Lost</Text>
          </View>
          <View style={styles.progressItem}>
            <Icon name="jump-rope" size={24} color={COLORS.warning} />
            <Text style={[TEXT_STYLES.h2, { marginTop: 4, color: COLORS.warning }]}>
              {coachData.recentProgress.goalsAchieved}
            </Text>
            <Text style={TEXT_STYLES.caption}>Goals Achieved</Text>
          </View>
        </View>
      </Card>

      {/* Progress Charts Placeholder */}
      <Card style={styles.chartsCard}>
        <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>📊 Progress Charts</Text>
        <Surface style={styles.chartPlaceholder}>
          <Icon name="insert-chart" size={48} color={COLORS.textSecondary} />
          <Text style={[TEXT_STYLES.body, { marginTop: SPACING.sm, textAlign: 'center' }]}>
            Detailed progress charts coming soon! 📈
          </Text>
          <Text style={[TEXT_STYLES.caption, { textAlign: 'center', marginTop: SPACING.xs }]}>
            Weight tracking, strength progression, and more
          </Text>
        </Surface>
      </Card>
    </View>
  );

  const renderChatTab = () => (
    <View style={styles.tabContent}>
      <Card style={styles.chatCard}>
        <View style={styles.chatHeader}>
          <Text style={TEXT_STYLES.h3}>💬 Recent Messages</Text>
          <Button
            mode="outlined"
            compact
            onPress={handleMessageCoach}
            style={styles.chatButton}
          >
            Open Chat
          </Button>
        </View>

        <View style={styles.messagesPreview}>
          {coachData.recentMessages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messagePreview,
                {
                  alignSelf: message.isCoach ? 'flex-start' : 'flex-end',
                  backgroundColor: message.isCoach ? COLORS.primary : COLORS.accent,
                },
              ]}
            >
              <Text style={[TEXT_STYLES.caption, { color: 'white', opacity: 0.8 }]}>
                {message.isCoach ? coachData.name : 'You'} • {message.timestamp.split(' ')[1]}
              </Text>
              <Text style={[TEXT_STYLES.body, { color: 'white', marginTop: 2 }]}>
                {message.text}
              </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.openChatButton}
          onPress={handleMessageCoach}
        >
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.openChatGradient}
          >
            <Icon name="chat" size={20} color="white" />
            <Text style={[TEXT_STYLES.body, { color: 'white', marginLeft: 8, fontWeight: 'bold' }]}>
              Continue Conversation
            </Text>
            <Icon name="arrow-forward" size={20} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </Card>
    </View>
  );

  const renderContactModal = () => (
    <Portal>
      <Modal
        visible={showContactModal}
        onDismiss={() => setShowContactModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Card style={styles.contactCard}>
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md, textAlign: 'center' }]}>
            📞 Contact {coachData.name}
          </Text>
          
          <View style={styles.contactItem}>
            <Icon name="phone" size={24} color={COLORS.primary} />
            <View style={styles.contactInfo}>
              <Text style={TEXT_STYLES.body}>Phone</Text>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.primary }]}>
                {coachData.contact.phone}
              </Text>
            </View>
            <IconButton
              icon="call"
              onPress={() => Alert.alert('Call Coach', 'Feature coming soon!')}
            />
          </View>

          <Divider style={styles.contactDivider} />

          <View style={styles.contactItem}>
            <Icon name="email" size={24} color={COLORS.primary} />
            <View style={styles.contactInfo}>
              <Text style={TEXT_STYLES.body}>Email</Text>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.primary }]}>
                {coachData.contact.email}
              </Text>
            </View>
            <IconButton
              icon="email"
              onPress={() => Alert.alert('Email Coach', 'Feature coming soon!')}
            />
          </View>

          <Divider style={styles.contactDivider} />

          <View style={styles.availabilitySection}>
            <Icon name="schedule" size={24} color={COLORS.success} />
            <View style={styles.contactInfo}>
              <Text style={TEXT_STYLES.body}>Availability</Text>
              <Text style={TEXT_STYLES.caption}>
                {coachData.contact.availability}
              </Text>
            </View>
          </View>

          <Button
            mode="contained"
            onPress={() => setShowContactModal(false)}
            style={styles.closeButton}
          >
            Close
          </Button>
        </Card>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderTabNavigation()}
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {selectedTab === 'overview' && renderOverviewTab()}
          {selectedTab === 'sessions' && renderSessionsTab()}
          {selectedTab === 'progress' && renderProgressTab()}
          {selectedTab === 'chat' && renderChatTab()}
        </Animated.View>
      </ScrollView>

      {renderContactModal()}

      <FAB
        icon="message"
        label="Message Coach"
        style={styles.fab}
        onPress={handleMessageCoach}
        color="white"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.sm,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    alignItems: 'center',
  },
  coachProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: SPACING.lg,
  },
  coachAvatar: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  coachInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  relationshipInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  relationshipCard: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.sm,
    marginHorizontal: SPACING.xs,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  tabContainer: {
    backgroundColor: COLORS.surface,
    elevation: 2,
  },
  tabScrollContent: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginHorizontal: SPACING.xs,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.md,
  },
  tabContent: {
    paddingVertical: SPACING.md,
  },
  quickActionsCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    marginBottom: SPACING.md,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  actionGradient: {
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  specializationsCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  specChip: {
    backgroundColor: 'rgba(103, 126, 234, 0.1)',
    borderColor: COLORS.primary,
  },
  statsCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  aboutCard: {
    padding: SPACING.md,
    marginBottom: 100, // Space for FAB
  },
  certificationContainer: {
    marginTop: SPACING.sm,
  },
  certChip: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  nextSessionCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    overflow: 'hidden',
  },
  nextSessionGradient: {
    padding: SPACING.lg,
  },
  nextSessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  upcomingChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  sessionDetails: {
    marginVertical: SPACING.md,
  },
  sessionDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  reminderButton: {
    backgroundColor: 'white',
    borderRadius: 25,
    marginTop: SPACING.md,
  },
  upcomingSessionsCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  nextSessionHighlight: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  sessionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sessionInfo: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  sessionRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  progressGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  progressItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  chartsCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  chartPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    borderRadius: 8,
    backgroundColor: COLORS.background,
  },
  chatCard: {
    padding: SPACING.md,
    marginBottom: 100, // Space for FAB
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  chatButton: {
    borderColor: COLORS.primary,
  },
  messagesPreview: {
    marginBottom: SPACING.md,
  },
  messagePreview: {
    maxWidth: '80%',
    padding: SPACING.sm,
    borderRadius: 12,
    marginBottom: SPACING.sm,
  },
  openChatButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  openChatGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: SPACING.lg,
    margin: SPACING.lg,
    borderRadius: 12,
  },
  contactCard: {
    padding: SPACING.md,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  contactInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  contactDivider: {
    marginVertical: SPACING.sm,
  },
  availabilitySection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: SPACING.md,
  },
  closeButton: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.primary,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default MyCoach;