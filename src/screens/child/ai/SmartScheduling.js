import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  StatusBar,
  Animated,
  TouchableOpacity,
  RefreshControl,
  Vibration,
  Dimensions,
  FlatList,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  ProgressBar,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Portal,
  Modal,
  TextInput,
  Searchbar,
  Calendar,
  Switch,
  RadioButton,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import your design system constants
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
  disabled: '#cccccc',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  subtitle: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textSecondary },
  small: { fontSize: 12, color: COLORS.textSecondary },
};

const { width, height } = Dimensions.get('window');

const SmartScheduling = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const schedule = useSelector(state => state.schedule.childSchedule || []);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Animation references
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // State management
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // week, day, month
  const [showAIModal, setShowAIModal] = useState(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [points, setPoints] = useState(user?.points || 0);
  const [streak, setStreak] = useState(user?.scheduleStreak || 0);
  const [preferences, setPreferences] = useState({
    morningPerson: true,
    preferredDuration: 60,
    restDays: ['Sunday'],
    maxSessionsPerWeek: 4,
  });
  const [conflictResolution, setConflictResolution] = useState('auto');

  // Sample schedule data for children
  const sampleSchedule = [
    {
      id: '1',
      title: 'Soccer Practice ⚽',
      type: 'training',
      date: '2025-08-28',
      time: '16:00',
      duration: 90,
      location: 'Sports Center',
      coach: 'Coach Mike',
      status: 'confirmed',
      color: '#4CAF50',
      icon: 'sports-soccer',
      participants: 12,
      difficulty: 'beginner',
      pointsReward: 50,
      parentApproved: true,
    },
    {
      id: '2',
      title: 'Swimming Lesson 🏊',
      type: 'lesson',
      date: '2025-08-29',
      time: '15:30',
      duration: 60,
      location: 'Aquatic Center',
      coach: 'Coach Sarah',
      status: 'pending_parent_approval',
      color: '#03A9F4',
      icon: 'pool',
      participants: 8,
      difficulty: 'intermediate',
      pointsReward: 40,
      parentApproved: false,
    },
    {
      id: '3',
      title: 'Basketball Skills 🏀',
      type: 'training',
      date: '2025-08-30',
      time: '17:00',
      duration: 75,
      location: 'School Gym',
      coach: 'Coach Tony',
      status: 'confirmed',
      color: '#FF9800',
      icon: 'sports-basketball',
      participants: 10,
      difficulty: 'beginner',
      pointsReward: 45,
      parentApproved: true,
    },
    {
      id: '4',
      title: 'Free Play Time 🎮',
      type: 'break',
      date: '2025-08-28',
      time: '19:00',
      duration: 60,
      location: 'Home',
      status: 'auto_scheduled',
      color: '#9C27B0',
      icon: 'games',
      pointsReward: 15,
      isAIGenerated: true,
    },
  ];

  // AI scheduling suggestions
  const generateAISuggestions = useCallback(async () => {
    setLoading(true);
    try {
      const suggestions = [
        {
          id: 'ai_1',
          type: 'optimal_timing',
          title: 'Perfect Training Time! ⏰',
          description: 'Based on your energy levels, 4:00 PM is your best training time!',
          action: 'Schedule soccer practice at 4:00 PM',
          benefit: 'You\'ll perform 20% better! 📈',
          confidence: 95,
          icon: 'schedule',
          color: COLORS.success,
        },
        {
          id: 'ai_2',
          type: 'recovery_time',
          title: 'Rest Day Reminder 😴',
          description: 'You\'ve had 3 training days in a row. Time for some rest!',
          action: 'Schedule light activity or free play tomorrow',
          benefit: 'Prevents burnout and injuries 🛡️',
          confidence: 88,
          icon: 'hotel',
          color: COLORS.warning,
        },
        {
          id: 'ai_3',
          type: 'skill_balance',
          title: 'Mix It Up! 🎯',
          description: 'You\'ve focused on soccer. How about trying basketball?',
          action: 'Add basketball session this week',
          benefit: 'Develops different skills and muscles 💪',
          confidence: 82,
          icon: 'sports-basketball',
          color: COLORS.primary,
        },
        {
          id: 'ai_4',
          type: 'social_opportunity',
          title: 'Make New Friends! 👫',
          description: 'There\'s a group training session with kids your age!',
          action: 'Join group training on Saturday',
          benefit: 'Fun social experience and teamwork 🤝',
          confidence: 90,
          icon: 'group',
          color: COLORS.secondary,
        },
      ];

      setAiSuggestions(suggestions);
      setShowAIModal(true);
    } catch (error) {
      Alert.alert('Oops! 😅', 'The AI scheduler is thinking hard. Try again in a moment!');
    }
    setLoading(false);
  }, [preferences]);

  // Initialize animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for upcoming events
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
      Vibration.vibrate(50);
    }, 1000);
  }, []);

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getUpcomingEvent = () => {
    const today = new Date().toISOString().split('T')[0];
    return sampleSchedule.find(event => event.date >= today && event.status === 'confirmed');
  };

  const handleEventAction = (event, action) => {
    Vibration.vibrate(50);
    
    switch (action) {
      case 'confirm':
        Alert.alert(
          'Confirm Attendance ✅',
          `Confirm you'll attend ${event.title}?`,
          [
            {
              text: 'Yes, I\'ll be there! 🎉',
              onPress: () => {
                setPoints(prev => prev + 25);
                Alert.alert('Confirmed! 🎉', 'Your coach has been notified!');
              },
            },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
        break;
        
      case 'reschedule':
        Alert.alert(
          'Reschedule Session 📅',
          `Need to reschedule ${event.title}? Your parents will be notified.`,
          [
            {
              text: 'Request Reschedule 📝',
              onPress: () => Alert.alert('Request Sent! 📤', 'Your parents and coach will help you reschedule!'),
            },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
        break;
        
      case 'details':
        showEventDetails(event);
        break;
        
      default:
        break;
    }
  };

  const showEventDetails = (event) => {
    const statusEmoji = {
      confirmed: '✅',
      pending_parent_approval: '⏳',
      auto_scheduled: '🤖',
    };

    Alert.alert(
      `${event.title} Details`,
      `📅 Date: ${event.date}\n` +
      `⏰ Time: ${formatTime(event.time)}\n` +
      `⏱️ Duration: ${event.duration} minutes\n` +
      `📍 Location: ${event.location}\n` +
      `👨‍🏫 Coach: ${event.coach || 'TBD'}\n` +
      `👥 Participants: ${event.participants || 'TBD'}\n` +
      `📊 Level: ${event.difficulty}\n` +
      `⭐ Points: ${event.pointsReward}\n` +
      `${statusEmoji[event.status]} Status: ${event.status.replace(/_/g, ' ')}`,
      [
        {
          text: 'Get Directions 🗺️',
          onPress: () => Alert.alert('Directions 🗺️', `Opening directions to ${event.location}...`),
        },
        {
          text: 'Contact Coach 📞',
          onPress: () => Alert.alert('Contact 📞', `Calling ${event.coach}...`),
        },
        { text: 'Close', style: 'cancel' },
      ]
    );
  };

  const handleAISuggestion = (suggestion) => {
    Alert.alert(
      suggestion.title,
      `${suggestion.description}\n\n🎯 Action: ${suggestion.action}\n💡 Benefit: ${suggestion.benefit}\n🤖 AI Confidence: ${suggestion.confidence}%`,
      [
        {
          text: 'Apply Suggestion 🚀',
          onPress: () => applySuggestion(suggestion),
        },
        {
          text: 'Maybe Later 🤔',
          style: 'cancel',
        },
      ]
    );
  };

  const applySuggestion = (suggestion) => {
    setPoints(prev => prev + 30);
    setShowAIModal(false);
    
    switch (suggestion.type) {
      case 'optimal_timing':
        Alert.alert('Schedule Updated! ⏰', 'Your training has been moved to the optimal time!');
        break;
      case 'recovery_time':
        Alert.alert('Rest Day Added! 😴', 'A recovery day has been scheduled for you!');
        break;
      case 'skill_balance':
        Alert.alert('New Activity Added! 🎯', 'A basketball session has been added to your schedule!');
        break;
      case 'social_opportunity':
        Alert.alert('Group Session Joined! 👫', 'You\'re signed up for the group training!');
        break;
    }
  };

  const renderHeader = () => (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.headerContent}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={[TEXT_STYLES.title, { color: 'white', flex: 1, textAlign: 'center' }]}>
          Smart Scheduler 🤖📅
        </Text>
        <TouchableOpacity onPress={generateAISuggestions}>
          <Icon name="auto-awesome" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.streakContainer}>
        <View style={styles.pointsBadge}>
          <Icon name="star" size={16} color="#FFD700" />
          <Text style={styles.pointsText}>{points}</Text>
        </View>
        <View style={styles.streakBadge}>
          <Icon name="local-fire-department" size={16} color="#FF5722" />
          <Text style={styles.streakText}>{streak} day streak! 🔥</Text>
        </View>
      </View>
    </LinearGradient>
  );

  const renderViewModeSelector = () => (
    <Surface style={styles.viewModeContainer}>
      <View style={styles.viewModeButtons}>
        {[
          { id: 'day', label: 'Today 📅', icon: 'today' },
          { id: 'week', label: 'Week 📆', icon: 'view-week' },
          { id: 'month', label: 'Month 🗓️', icon: 'calendar-view-month' },
        ].map((mode) => (
          <TouchableOpacity
            key={mode.id}
            style={[
              styles.viewModeButton,
              viewMode === mode.id && styles.activeViewModeButton,
            ]}
            onPress={() => setViewMode(mode.id)}
          >
            <Icon 
              name={mode.icon} 
              size={20} 
              color={viewMode === mode.id ? 'white' : COLORS.primary} 
            />
            <Text style={[
              styles.viewModeText,
              viewMode === mode.id && styles.activeViewModeText,
            ]}>
              {mode.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </Surface>
  );

  const renderUpcomingEvent = () => {
    const upcomingEvent = getUpcomingEvent();
    if (!upcomingEvent) return null;

    return (
      <Animated.View style={[styles.upcomingContainer, { transform: [{ scale: pulseAnim }] }]}>
        <LinearGradient 
          colors={[upcomingEvent.color, upcomingEvent.color + '80']} 
          style={styles.upcomingGradient}
        >
          <View style={styles.upcomingHeader}>
            <Icon name={upcomingEvent.icon} size={32} color="white" />
            <View style={styles.upcomingInfo}>
              <Text style={styles.upcomingTitle}>Next Up! 🚀</Text>
              <Text style={styles.upcomingEventTitle}>{upcomingEvent.title}</Text>
              <Text style={styles.upcomingTime}>
                📅 {upcomingEvent.date} at {formatTime(upcomingEvent.time)}
              </Text>
            </View>
          </View>
          
          <View style={styles.upcomingActions}>
            <TouchableOpacity
              style={styles.upcomingActionButton}
              onPress={() => handleEventAction(upcomingEvent, 'confirm')}
            >
              <Icon name="check-circle" size={20} color="white" />
              <Text style={styles.upcomingActionText}>Confirm ✅</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.upcomingActionButton}
              onPress={() => handleEventAction(upcomingEvent, 'details')}
            >
              <Icon name="info" size={20} color="white" />
              <Text style={styles.upcomingActionText}>Details 📋</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderScheduleList = () => (
    <Surface style={styles.scheduleContainer}>
      <View style={styles.sectionHeader}>
        <Text style={[TEXT_STYLES.subtitle, styles.sectionTitle]}>
          {viewMode === 'day' ? 'Today\'s Schedule 📅' : 
           viewMode === 'week' ? 'This Week 📆' : 
           'This Month 🗓️'}
        </Text>
        <TouchableOpacity onPress={() => setShowAddEventModal(true)}>
          <Icon name="add-circle" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={sampleSchedule}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.scheduleItem}
            onPress={() => handleEventAction(item, 'details')}
          >
            <View style={[styles.scheduleColorBar, { backgroundColor: item.color }]} />
            
            <View style={styles.scheduleContent}>
              <View style={styles.scheduleHeader}>
                <Icon name={item.icon} size={24} color={item.color} />
                <View style={styles.scheduleInfo}>
                  <Text style={styles.scheduleTitle}>{item.title}</Text>
                  <Text style={styles.scheduleTime}>
                    📅 {item.date} • ⏰ {formatTime(item.time)}
                  </Text>
                  <Text style={styles.scheduleLocation}>
                    📍 {item.location} • ⏱️ {item.duration} min
                  </Text>
                </View>
              </View>

              <View style={styles.scheduleFooter}>
                <View style={styles.scheduleStatus}>
                  <Chip 
                    icon={item.status === 'confirmed' ? 'check' : 
                          item.status === 'pending_parent_approval' ? 'schedule' : 'smart-toy'}
                    compact 
                    style={[
                      styles.statusChip,
                      { backgroundColor: 
                        item.status === 'confirmed' ? COLORS.success :
                        item.status === 'pending_parent_approval' ? COLORS.warning :
                        COLORS.primary
                      }
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {item.status === 'confirmed' ? 'Ready!' :
                       item.status === 'pending_parent_approval' ? 'Waiting for Parents' :
                       'AI Scheduled'}
                    </Text>
                  </Chip>
                </View>
                
                <View style={styles.schedulePoints}>
                  <Icon name="star" size={16} color="#FFD700" />
                  <Text style={styles.schedulePointsText}>+{item.pointsReward}</Text>
                </View>
              </View>

              {!item.parentApproved && item.status === 'pending_parent_approval' && (
                <View style={styles.parentApprovalBar}>
                  <Icon name="family-restroom" size={16} color={COLORS.warning} />
                  <Text style={styles.parentApprovalText}>
                    Waiting for parent approval 👨‍👩‍👧
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scheduleList}
      />
    </Surface>
  );

  const renderAIModal = () => (
    <Portal>
      <Modal
        visible={showAIModal}
        onDismiss={() => setShowAIModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.modalBlur} blurType="light" blurAmount={10}>
          <Text style={[TEXT_STYLES.title, styles.modalTitle]}>
            AI Schedule Suggestions 🤖✨
          </Text>
          <Text style={[TEXT_STYLES.caption, styles.modalDescription]}>
            Your AI coach has some smart ideas for your schedule!
          </Text>

          <ScrollView style={styles.suggestionsList} showsVerticalScrollIndicator={false}>
            {aiSuggestions.map((suggestion) => (
              <TouchableOpacity
                key={suggestion.id}
                style={[styles.suggestionCard, { borderLeftColor: suggestion.color }]}
                onPress={() => handleAISuggestion(suggestion)}
              >
                <View style={styles.suggestionHeader}>
                  <Icon name={suggestion.icon} size={24} color={suggestion.color} />
                  <View style={styles.suggestionInfo}>
                    <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
                    <Text style={styles.suggestionDescription}>{suggestion.description}</Text>
                  </View>
                </View>
                
                <View style={styles.suggestionFooter}>
                  <View style={styles.confidenceBar}>
                    <Text style={styles.confidenceText}>
                      🤖 {suggestion.confidence}% confident
                    </Text>
                    <ProgressBar
                      progress={suggestion.confidence / 100}
                      color={suggestion.color}
                      style={styles.confidenceProgress}
                    />
                  </View>
                  <Icon name="chevron-right" size={20} color={COLORS.textSecondary} />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Button
            mode="outlined"
            onPress={() => setShowAIModal(false)}
            style={styles.modalCloseButton}
          >
            Maybe Later 😊
          </Button>
        </BlurView>
      </Modal>
    </Portal>
  );

  const renderAddEventModal = () => (
    <Portal>
      <Modal
        visible={showAddEventModal}
        onDismiss={() => setShowAddEventModal(false)}
        contentContainerStyle={styles.addEventModalContainer}
      >
        <BlurView style={styles.addEventModalBlur} blurType="light" blurAmount={10}>
          <Text style={[TEXT_STYLES.title, styles.modalTitle]}>
            Add to Schedule 📅
          </Text>
          <Text style={[TEXT_STYLES.caption, styles.modalDescription]}>
            What would you like to add to your schedule?
          </Text>

          <View style={styles.addEventOptions}>
            <TouchableOpacity
              style={[styles.addEventOption, { backgroundColor: COLORS.primary }]}
              onPress={() => {
                setShowAddEventModal(false);
                Alert.alert('Training Session 🏃‍♀️', 'This will notify your parents and coach!');
              }}
            >
              <Icon name="fitness-center" size={32} color="white" />
              <Text style={styles.addEventOptionText}>Training Session</Text>
              <Text style={styles.addEventOptionSubtext}>With coach approval 👨‍🏫</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.addEventOption, { backgroundColor: COLORS.success }]}
              onPress={() => {
                setShowAddEventModal(false);
                Alert.alert('Free Play 🎮', 'Added to your schedule!');
              }}
            >
              <Icon name="sports-esports" size={32} color="white" />
              <Text style={styles.addEventOptionText}>Free Play Time</Text>
              <Text style={styles.addEventOptionSubtext}>Fun and games! 🎯</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.addEventOption, { backgroundColor: COLORS.warning }]}
              onPress={() => {
                setShowAddEventModal(false);
                Alert.alert('Study Time 📚', 'Balance is important!');
              }}
            >
              <Icon name="school" size={32} color="white" />
              <Text style={styles.addEventOptionText}>Study Break</Text>
              <Text style={styles.addEventOptionSubtext}>Homework & learning 📖</Text>
            </TouchableOpacity>
          </View>

          <Button
            mode="outlined"
            onPress={() => setShowAddEventModal(false)}
            style={styles.modalCloseButton}
          >
            Cancel
          </Button>
        </BlurView>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <ScrollView
        style={styles.scrollContainer}
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
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {renderViewModeSelector()}
          {renderUpcomingEvent()}
          {renderScheduleList()}
        </Animated.View>
      </ScrollView>

      {renderAIModal()}
      {renderAddEventModal()}

      <FAB
        icon="auto-awesome"
        label="AI Suggestions 🤖"
        style={styles.fab}
        onPress={generateAISuggestions}
        loading={loading}
        color="white"
        customSize={60}
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
    paddingTop: StatusBar.currentHeight + SPACING.md,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  streakContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
  },
  pointsText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: SPACING.xs,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
  },
  streakText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
  },
  viewModeContainer: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: 16,
    elevation: 2,
  },
  viewModeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  viewModeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    marginHorizontal: SPACING.xs,
    borderRadius: 25,
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  activeViewModeButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  viewModeText: {
    marginLeft: SPACING.xs,
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 12,
  },
  activeViewModeText: {
    color: 'white',
  },
  upcomingContainer: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
  },
  upcomingGradient: {
    padding: SPACING.lg,
  },
  upcomingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  upcomingInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  upcomingTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  upcomingEventTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  upcomingTime: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
  },
  upcomingActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  upcomingActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    flex: 0.45,
    justifyContent: 'center',
  },
  upcomingActionText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: SPACING.xs,
    fontSize: 14,
  },
  scheduleContainer: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: 16,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    flex: 1,
  },
  scheduleList: {
    paddingBottom: SPACING.md,
  },
  scheduleItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginBottom: SPACING.md,
    borderRadius: 12,
    elevation: 2,
    overflow: 'hidden',
  },
  scheduleColorBar: {
    width: 4,
    backgroundColor: COLORS.primary,
  },
  scheduleContent: {
    flex: 1,
    padding: SPACING.md,
  },
  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  scheduleInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  scheduleTime: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  scheduleLocation: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  scheduleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scheduleStatus: {
    flex: 1,
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  schedulePoints: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  schedulePointsText: {
    marginLeft: SPACING.xs,
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  parentApprovalBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginTop: SPACING.sm,
    borderRadius: 8,
  },
  parentApprovalText: {
    marginLeft: SPACING.sm,
    color: COLORS.warning,
    fontSize: 12,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBlur: {
    width: width - SPACING.xl,
    maxHeight: height * 0.8,
    borderRadius: 20,
    padding: SPACING.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  modalDescription: {
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  suggestionsList: {
    maxHeight: height * 0.5,
    marginBottom: SPACING.lg,
  },
  suggestionCard: {
    padding: SPACING.md,
    borderRadius: 12,
    backgroundColor: 'white',
    marginBottom: SPACING.md,
    elevation: 2,
    borderLeftWidth: 4,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  suggestionInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  suggestionDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  suggestionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confidenceBar: {
    flex: 1,
  },
  confidenceText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  confidenceProgress: {
    height: 4,
    borderRadius: 2,
  },
  modalCloseButton: {
    borderColor: COLORS.textSecondary,
  },
  addEventModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addEventModalBlur: {
    width: width - SPACING.xl,
    maxHeight: height * 0.7,
    borderRadius: 20,
    padding: SPACING.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  addEventOptions: {
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  addEventOption: {
    padding: SPACING.lg,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 4,
  },
  addEventOptionText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: SPACING.sm,
  },
  addEventOptionSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: SPACING.xs,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default SmartScheduling;