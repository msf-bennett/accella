import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
  Animated,
  Alert,
  Dimensions,
  TouchableOpacity,
  Platform,
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
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#f44336',
  warning: '#ff9800',
  background: '#f8f9fa',
  surface: '#ffffff',
  text: '#333333',
  textLight: '#666666',
  border: '#e0e0e0',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  body: {
    fontSize: 16,
    color: COLORS.text,
  },
  caption: {
    fontSize: 14,
    color: COLORS.textLight,
  },
};

const { width, height } = Dimensions.get('window');

const QuickStarts = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];

  // Redux state
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const todaySession = useSelector(state => state.training.todaySession);
  const achievements = useSelector(state => state.user.achievements);
  const streak = useSelector(state => state.user.streak);

  useEffect(() => {
    // Animate screen entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Dispatch actions to refresh user data
      // dispatch(refreshUserData());
      // dispatch(refreshTodaySession());
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const quickActions = [
    {
      id: 'start_training',
      title: 'Start Training',
      subtitle: "Today's session ready 💪",
      icon: 'play-arrow',
      color: COLORS.success,
      gradient: ['#4CAF50', '#45a049'],
      action: () => handleQuickAction('start_training'),
      badge: todaySession?.isScheduled ? '1' : null,
    },
    {
      id: 'track_performance',
      title: 'Track Performance',
      subtitle: 'Log your results 📊',
      icon: 'assessment',
      color: COLORS.primary,
      gradient: ['#667eea', '#764ba2'],
      action: () => handleQuickAction('track_performance'),
    },
    {
      id: 'nutrition_log',
      title: 'Nutrition Log',
      subtitle: 'Fuel your progress 🥗',
      icon: 'restaurant',
      color: COLORS.warning,
      gradient: ['#ff9800', '#f57c00'],
      action: () => handleQuickAction('nutrition_log'),
    },
    {
      id: 'chat_coach',
      title: 'Chat with Coach',
      subtitle: 'Get instant feedback 💬',
      icon: 'chat',
      color: COLORS.secondary,
      gradient: ['#9c27b0', '#7b1fa2'],
      action: () => handleQuickAction('chat_coach'),
      badge: '2', // New messages
    },
  ];

  const achievements_data = [
    { id: 1, title: 'Week Warrior', emoji: '⚡', unlocked: true },
    { id: 2, title: 'Perfect Form', emoji: '🎯', unlocked: true },
    { id: 3, title: 'Consistency King', emoji: '👑', unlocked: false },
    { id: 4, title: 'Nutrition Master', emoji: '🥇', unlocked: false },
  ];

  const handleQuickAction = (actionId) => {
    setSelectedAction(actionId);
    
    switch (actionId) {
      case 'start_training':
        // navigation.navigate('TodaySession');
        Alert.alert(
          'Starting Training! 🏃‍♂️',
          'Feature in development - Your training session will be loaded here.',
          [{ text: 'Got it!', style: 'default' }]
        );
        break;
      case 'track_performance':
        // navigation.navigate('PerformanceTracker');
        Alert.alert(
          'Performance Tracking 📈',
          'Feature in development - Track your reps, sets, and personal records here.',
          [{ text: 'Got it!', style: 'default' }]
        );
        break;
      case 'nutrition_log':
        // navigation.navigate('NutritionLog');
        Alert.alert(
          'Nutrition Logger 🍎',
          'Feature in development - Log your meals and track your nutrition goals.',
          [{ text: 'Got it!', style: 'default' }]
        );
        break;
      case 'chat_coach':
        // navigation.navigate('CoachChat');
        Alert.alert(
          'Coach Chat 💬',
          'Feature in development - Real-time messaging with your coach coming soon.',
          [{ text: 'Got it!', style: 'default' }]
        );
        break;
      default:
        break;
    }
  };

  const renderQuickActionCard = (action, index) => (
    <Animated.View
      key={action.id}
      style={[
        styles.quickActionContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={action.action}
        activeOpacity={0.8}
        style={styles.quickActionTouchable}
      >
        <LinearGradient
          colors={action.gradient}
          style={styles.quickActionCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.quickActionContent}>
            <View style={styles.quickActionHeader}>
              <View style={styles.iconContainer}>
                <Icon name={action.icon} size={32} color="white" />
                {action.badge && (
                  <Surface style={styles.badge}>
                    <Text style={styles.badgeText}>{action.badge}</Text>
                  </Surface>
                )}
              </View>
            </View>
            <Text style={styles.actionTitle}>{action.title}</Text>
            <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderStatsCard = () => (
    <Card style={styles.statsCard}>
      <Card.Content style={styles.statsContent}>
        <Text style={[TEXT_STYLES.subtitle, { marginBottom: SPACING.md }]}>
          Your Progress 🚀
        </Text>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{streak || 0}</Text>
            <Text style={styles.statLabel}>Day Streak 🔥</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {achievements_data.filter(a => a.unlocked).length}
            </Text>
            <Text style={styles.statLabel}>Achievements ⭐</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>87</Text>
            <Text style={styles.statLabel}>Completion % 📈</Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <Text style={styles.progressLabel}>Weekly Goal Progress</Text>
          <ProgressBar
            progress={0.65}
            color={COLORS.primary}
            style={styles.progressBar}
          />
          <Text style={styles.progressText}>65% Complete - Keep it up! 💪</Text>
        </View>
      </Card.Content>
    </Card>
  );

  const renderAchievements = () => (
    <Card style={styles.achievementsCard}>
      <Card.Content>
        <Text style={[TEXT_STYLES.subtitle, { marginBottom: SPACING.md }]}>
          Achievements 🏆
        </Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {achievements_data.map((achievement, index) => (
            <Surface
              key={achievement.id}
              style={[
                styles.achievementItem,
                {
                  opacity: achievement.unlocked ? 1 : 0.5,
                  backgroundColor: achievement.unlocked ? COLORS.success : COLORS.border,
                },
              ]}
            >
              <Text style={styles.achievementEmoji}>{achievement.emoji}</Text>
              <Text style={[
                styles.achievementTitle,
                { color: achievement.unlocked ? 'white' : COLORS.textLight }
              ]}>
                {achievement.title}
              </Text>
            </Surface>
          ))}
        </ScrollView>
      </Card.Content>
    </Card>
  );

  const renderUpcomingSession = () => {
    if (!todaySession) return null;

    return (
      <Card style={styles.sessionCard}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.sessionGradient}
        >
          <Card.Content style={styles.sessionContent}>
            <View style={styles.sessionHeader}>
              <Icon name="schedule" size={24} color="white" />
              <Text style={styles.sessionTime}>Today - 3:00 PM</Text>
            </View>
            
            <Text style={styles.sessionTitle}>Upper Body Strength</Text>
            <Text style={styles.sessionDescription}>
              Focus on chest, shoulders, and triceps 💪
            </Text>
            
            <View style={styles.sessionStats}>
              <Chip
                icon="timer"
                style={styles.sessionChip}
                textStyle={styles.sessionChipText}
              >
                45 min
              </Chip>
              <Chip
                icon="fitness-center"
                style={styles.sessionChip}
                textStyle={styles.sessionChipText}
              >
                8 exercises
              </Chip>
            </View>
          </Card.Content>
        </LinearGradient>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor="transparent"
        barStyle="light-content"
        translucent={true}
      />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>
              Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, {user?.name || 'Athlete'}! 👋
            </Text>
            <Text style={styles.motivationalText}>
              Ready to crush your goals today?
            </Text>
          </View>
          <Avatar.Text
            size={50}
            label={user?.name?.charAt(0) || 'A'}
            style={styles.avatar}
          />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
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
        {renderUpcomingSession()}
        
        <Text style={[TEXT_STYLES.subtitle, styles.sectionTitle]}>
          Quick Actions ⚡
        </Text>
        
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action, index) => renderQuickActionCard(action, index))}
        </View>

        {renderStatsCard()}
        {renderAchievements()}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <FAB
        icon="add"
        style={styles.fab}
        color="white"
        onPress={() => {
          Alert.alert(
            'Quick Add 📝',
            'Feature in development - Quickly log workouts, meals, or notes.',
            [{ text: 'Got it!', style: 'default' }]
          );
        }}
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
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 20,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: SPACING.xs,
  },
  motivationalText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  avatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  sectionTitle: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionContainer: {
    width: '48%',
    marginBottom: SPACING.md,
  },
  quickActionTouchable: {
    borderRadius: 12,
  },
  quickActionCard: {
    borderRadius: 12,
    minHeight: 120,
    padding: SPACING.md,
  },
  quickActionContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  quickActionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginTop: SPACING.sm,
  },
  actionSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: SPACING.xs,
  },
  statsCard: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  statsContent: {
    padding: SPACING.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.sm,
  },
  progressSection: {
    marginTop: SPACING.sm,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  achievementsCard: {
    marginBottom: SPACING.md,
  },
  achievementItem: {
    padding: SPACING.md,
    marginRight: SPACING.sm,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 100,
  },
  achievementEmoji: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  achievementTitle: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  sessionCard: {
    marginTop: -SPACING.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  sessionGradient: {
    padding: 0,
  },
  sessionContent: {
    padding: SPACING.lg,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sessionTime: {
    color: 'rgba(255, 255, 255, 0.9)',
    marginLeft: SPACING.sm,
    fontSize: 14,
  },
  sessionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: SPACING.xs,
  },
  sessionDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: SPACING.md,
  },
  sessionStats: {
    flexDirection: 'row',
  },
  sessionChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: SPACING.sm,
  },
  sessionChipText: {
    color: 'white',
    fontSize: 12,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default QuickStarts;