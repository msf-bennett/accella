import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Animated,
  StatusBar,
  Dimensions,
  Alert,
  TouchableOpacity,
  Vibration,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  Avatar,
  Surface,
  IconButton,
  Badge,
  FAB,
  Portal,
  Modal,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const QuickActions = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnims] = useState(Array.from({ length: 8 }, () => new Animated.Value(0.8)));
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);

  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const notifications = useSelector(state => state.notifications.unread) || [];

  // Mock data for quick actions
  const quickActions = [
    {
      id: 1,
      title: 'Today\'s Session',
      subtitle: 'Strength Training',
      icon: 'fitness-center',
      color: COLORS.primary,
      gradient: ['#667eea', '#764ba2'],
      badge: null,
      action: 'startSession',
      time: '2:30 PM',
      status: 'scheduled'
    },
    {
      id: 2,
      title: 'Log Workout',
      subtitle: 'Quick Entry',
      icon: 'add-circle',
      color: COLORS.success,
      gradient: ['#11998e', '#38ef7d'],
      badge: null,
      action: 'logWorkout',
      status: 'available'
    },
    {
      id: 3,
      title: 'Coach Chat',
      subtitle: 'Messages',
      icon: 'chat',
      color: COLORS.error,
      gradient: ['#ff9a9e', '#fecfef'],
      badge: 3,
      action: 'openChat',
      status: 'notification'
    },
    {
      id: 4,
      title: 'Progress Check',
      subtitle: 'Weekly Review',
      icon: 'trending-up',
      color: '#9c27b0',
      gradient: ['#667eea', '#764ba2'],
      badge: 1,
      action: 'progressCheck',
      status: 'new'
    },
    {
      id: 5,
      title: 'Nutrition Log',
      subtitle: 'Track Meals',
      icon: 'restaurant',
      color: '#ff9800',
      gradient: ['#ffecd2', '#fcb69f'],
      badge: null,
      action: 'nutritionLog',
      status: 'available'
    },
    {
      id: 6,
      title: 'Recovery',
      subtitle: 'Sleep & Rest',
      icon: 'bedtime',
      color: '#3f51b5',
      gradient: ['#667eea', '#764ba2'],
      badge: null,
      action: 'recovery',
      status: 'available'
    },
    {
      id: 7,
      title: 'Video Analysis',
      subtitle: 'Form Review',
      icon: 'video-library',
      color: '#e91e63',
      gradient: ['#ff9a9e', '#fecfef'],
      badge: 2,
      action: 'videoAnalysis',
      status: 'pending'
    },
    {
      id: 8,
      title: 'Goals',
      subtitle: 'Set Targets',
      icon: 'jump-rope',
      color: '#4caf50',
      gradient: ['#11998e', '#38ef7d'],
      badge: null,
      action: 'goals',
      status: 'available'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      title: 'Completed Lower Body Workout',
      time: '2 hours ago',
      icon: 'check-circle',
      color: COLORS.success
    },
    {
      id: 2,
      title: 'Coach feedback received',
      time: '4 hours ago',
      icon: 'message',
      color: COLORS.primary
    },
    {
      id: 3,
      title: 'Weekly goal achieved! 🎉',
      time: 'Yesterday',
      icon: 'star',
      color: COLORS.error
    }
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: 'Team Practice',
      time: 'Tomorrow 9:00 AM',
      location: 'Main Field',
      type: 'practice'
    },
    {
      id: 2,
      title: 'Performance Test',
      time: 'Friday 3:00 PM',
      location: 'Gym',
      type: 'test'
    }
  ];

  useEffect(() => {
    const animations = [
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      ...scaleAnims.map((anim, index) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 400,
          delay: index * 100,
          useNativeDriver: true,
        })
      ),
    ];

    Animated.parallel(animations).start();
  }, [fadeAnim, scaleAnims]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('Updated! ✨', 'Your quick actions have been refreshed.');
    }, 1500);
  }, []);

  const handleActionPress = (action) => {
    Vibration.vibrate(50);
    
    switch (action.action) {
      case 'startSession':
        Alert.alert(
          '🏋️‍♂️ Start Session',
          `Ready to begin your ${action.subtitle}? Let's crush this workout!`,
          [
            { text: 'Later', style: 'cancel' },
            { text: 'Start Now!', onPress: () => navigation.navigate('WorkoutSession') }
          ]
        );
        break;
      case 'logWorkout':
        setSelectedAction(action);
        setModalVisible(true);
        break;
      case 'openChat':
        Alert.alert('💬 Coach Chat', 'Opening chat with your coach...', [
          { text: 'OK', onPress: () => navigation.navigate('Chat') }
        ]);
        break;
      case 'progressCheck':
        Alert.alert('📊 Progress Check', 'Time for your weekly progress review!', [
          { text: 'Skip', style: 'cancel' },
          { text: 'Review Now', onPress: () => navigation.navigate('ProgressReview') }
        ]);
        break;
      case 'nutritionLog':
        Alert.alert('🍎 Nutrition Log', 'Track your meals and stay on top of your nutrition goals!', [
          { text: 'Later', style: 'cancel' },
          { text: 'Log Meal', onPress: () => navigation.navigate('NutritionLog') }
        ]);
        break;
      case 'recovery':
        Alert.alert('😴 Recovery Tracking', 'Log your sleep, rest, and recovery data.', [
          { text: 'Skip', style: 'cancel' },
          { text: 'Log Recovery', onPress: () => navigation.navigate('Recovery') }
        ]);
        break;
      case 'videoAnalysis':
        Alert.alert('🎥 Video Analysis', 'Your coach has reviewed 2 videos! Check the feedback.', [
          { text: 'Later', style: 'cancel' },
          { text: 'View Feedback', onPress: () => navigation.navigate('VideoAnalysis') }
        ]);
        break;
      case 'goals':
        Alert.alert('🎯 Goals', 'Set new targets and track your progress towards success!', [
          { text: 'Later', style: 'cancel' },
          { text: 'Set Goals', onPress: () => navigation.navigate('Goals') }
        ]);
        break;
      default:
        Alert.alert('Feature Coming Soon! 🚀', 'This feature is currently in development.');
    }
  };

  const renderQuickActionCard = (action, index) => (
    <Animated.View
      key={action.id}
      style={[
        styles.actionCardContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnims[index] }],
        },
      ]}
    >
      <TouchableOpacity onPress={() => handleActionPress(action)} activeOpacity={0.8}>
        <Card style={styles.actionCard} elevation={3}>
          <LinearGradient
            colors={action.gradient}
            style={styles.actionGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.actionContent}>
              <View style={styles.actionHeader}>
                <Icon name={action.icon} size={28} color="white" />
                {action.badge && (
                  <Badge
                    size={20}
                    style={{ backgroundColor: 'white', position: 'absolute', top: -8, right: -8 }}
                  >
                    {action.badge}
                  </Badge>
                )}
              </View>
              <View style={styles.actionInfo}>
                <Text style={[TEXT_STYLES.h5, { color: 'white', marginBottom: 2 }]}>
                  {action.title}
                </Text>
                <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
                  {action.subtitle}
                </Text>
                {action.time && (
                  <Chip
                    mode="outlined"
                    compact
                    textStyle={{ color: 'white', fontSize: 10 }}
                    style={styles.timeChip}
                  >
                    {action.time}
                  </Chip>
                )}
              </View>
            </View>
          </LinearGradient>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderRecentActivity = () => (
    <Card style={styles.sectionCard} elevation={2}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <Text style={TEXT_STYLES.h4}>Recent Activity 📋</Text>
          <IconButton
            icon="history"
            size={20}
            onPress={() => Alert.alert('Full History', 'Feature coming soon!')}
          />
        </View>
        {recentActivities.map((activity) => (
          <View key={activity.id} style={styles.activityItem}>
            <Avatar.Icon
              size={36}
              icon={activity.icon}
              style={{ backgroundColor: activity.color }}
            />
            <View style={styles.activityText}>
              <Text style={TEXT_STYLES.body}>{activity.title}</Text>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.secondary }]}>
                {activity.time}
              </Text>
            </View>
          </View>
        ))}
      </Card.Content>
    </Card>
  );

  const renderUpcomingEvents = () => (
    <Card style={styles.sectionCard} elevation={2}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <Text style={TEXT_STYLES.h4}>Upcoming Events 📅</Text>
          <IconButton
            icon="calendar-today"
            size={20}
            onPress={() => Alert.alert('Full Calendar', 'Feature coming soon!')}
          />
        </View>
        {upcomingEvents.map((event) => (
          <Surface key={event.id} style={styles.eventItem} elevation={1}>
            <View style={styles.eventContent}>
              <View style={styles.eventInfo}>
                <Text style={TEXT_STYLES.body}>{event.title}</Text>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.secondary }]}>
                  {event.time}
                </Text>
                <Text style={[TEXT_STYLES.small, { color: COLORS.primary }]}>
                  📍 {event.location}
                </Text>
              </View>
              <Chip
                mode="outlined"
                compact
                style={{ backgroundColor: event.type === 'practice' ? COLORS.success : COLORS.primary }}
                textStyle={{ color: 'white', fontSize: 10 }}
              >
                {event.type}
              </Chip>
            </View>
          </Surface>
        ))}
      </Card.Content>
    </Card>
  );

  const renderQuickLogModal = () => (
    <Portal>
      <Modal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        contentContainerStyle={styles.modalContent}
      >
        <Text style={[TEXT_STYLES.h4, { marginBottom: SPACING.lg, textAlign: 'center' }]}>
          Quick Workout Log 📝
        </Text>
        
        <View style={styles.quickLogOptions}>
          <Button
            mode="contained"
            icon="fitness-center"
            onPress={() => {
              setModalVisible(false);
              Alert.alert('Strength Training', 'Logging strength workout...');
            }}
            style={styles.logButton}
          >
            Strength
          </Button>
          <Button
            mode="contained"
            icon="directions-run"
            onPress={() => {
              setModalVisible(false);
              Alert.alert('Cardio Training', 'Logging cardio workout...');
            }}
            style={styles.logButton}
          >
            Cardio
          </Button>
          <Button
            mode="contained"
            icon="sports-soccer"
            onPress={() => {
              setModalVisible(false);
              Alert.alert('Sport Specific', 'Logging sport-specific training...');
            }}
            style={styles.logButton}
          >
            Sport
          </Button>
        </View>

        <Button
          mode="text"
          onPress={() => setModalVisible(false)}
          style={{ marginTop: SPACING.md }}
        >
          Cancel
        </Button>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
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
        {/* Header */}
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.header}
        >
          <Text style={[TEXT_STYLES.h3, { color: 'white', marginBottom: SPACING.xs }]}>
            Quick Actions ⚡
          </Text>
          <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.9)' }]}>
            Your training shortcuts
          </Text>
        </LinearGradient>

        {/* Quick Actions Grid */}
        <View style={styles.actionsGrid}>
          {quickActions.map((action, index) => renderQuickActionCard(action, index))}
        </View>

        {/* Recent Activity */}
        {renderRecentActivity()}

        {/* Upcoming Events */}
        {renderUpcomingEvents()}

        <View style={{ height: SPACING.xl }} />
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => Alert.alert('Quick Add', 'What would you like to add?', [
          { text: 'Workout', onPress: () => setModalVisible(true) },
          { text: 'Meal', onPress: () => Alert.alert('Add Meal', 'Feature coming soon!') },
          { text: 'Note', onPress: () => Alert.alert('Add Note', 'Feature coming soon!') },
          { text: 'Cancel', style: 'cancel' }
        ])}
      />

      {renderQuickLogModal()}
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl + 30,
    paddingBottom: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.md,
    justifyContent: 'space-between',
  },
  actionCardContainer: {
    width: (width - SPACING.md * 3) / 2,
    marginBottom: SPACING.md,
  },
  actionCard: {
    borderRadius: 16,
    overflow: 'hidden',
    height: 120,
  },
  actionGradient: {
    flex: 1,
    padding: SPACING.md,
    justifyContent: 'space-between',
  },
  actionContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
  actionInfo: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  timeChip: {
    marginTop: SPACING.xs,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderColor: 'rgba(255,255,255,0.3)',
    alignSelf: 'flex-start',
  },
  sectionCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  activityText: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  eventItem: {
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  eventContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventInfo: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: SPACING.lg,
    margin: SPACING.lg,
    borderRadius: 16,
  },
  quickLogOptions: {
    gap: SPACING.md,
  },
  logButton: {
    marginBottom: SPACING.sm,
  },
};

export default QuickActions;