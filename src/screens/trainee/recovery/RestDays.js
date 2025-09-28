import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Animated,
  Alert,
  Dimensions,
  TouchableOpacity,
  Platform,
  Vibration,
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
  Searchbar,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from 'expo-blur';

// Import established constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f8f9fa',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  accent: '#e91e63',
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
  h2: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  h3: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 14, color: COLORS.text },
  caption: { fontSize: 12, color: COLORS.textSecondary },
};

const { width, height } = Dimensions.get('window');

const RestDays = ({ navigation, route }) => {
  // Redux state
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const restDays = useSelector(state => state.recovery.restDays || []);
  const recoveryStreak = useSelector(state => state.recovery.streak || 0);
  const totalRestDays = useSelector(state => state.recovery.totalRestDays || 0);

  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [restActivities, setRestActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [recoveryScore, setRecoveryScore] = useState(85);
  const [weeklyProgress, setWeeklyProgress] = useState(0.7);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // Mock data for rest activities
  const mockRestActivities = [
    {
      id: 1,
      title: 'Active Recovery Walk',
      duration: 30,
      calories: 120,
      type: 'cardio',
      difficulty: 'Easy',
      icon: 'directions-walk',
      completed: false,
      description: 'Light 30-minute walk to promote blood flow and recovery',
    },
    {
      id: 2,
      title: 'Stretching Session',
      duration: 20,
      calories: 45,
      type: 'flexibility',
      difficulty: 'Easy',
      icon: 'accessibility',
      completed: true,
      description: 'Full body stretching routine for muscle recovery',
    },
    {
      id: 3,
      title: 'Meditation & Mindfulness',
      duration: 15,
      calories: 0,
      type: 'mental',
      difficulty: 'Easy',
      icon: 'self-improvement',
      completed: false,
      description: 'Guided meditation for mental recovery and stress relief',
    },
    {
      id: 4,
      title: 'Foam Rolling',
      duration: 25,
      calories: 80,
      type: 'recovery',
      difficulty: 'Easy',
      icon: 'fitness-center',
      completed: false,
      description: 'Self-myofascial release to reduce muscle tension',
    },
    {
      id: 5,
      title: 'Swimming (Easy Pace)',
      duration: 45,
      calories: 200,
      type: 'cardio',
      difficulty: 'Moderate',
      icon: 'pool',
      completed: false,
      description: 'Low-impact swimming for active recovery',
    },
    {
      id: 6,
      title: 'Yoga Flow',
      duration: 40,
      calories: 150,
      type: 'flexibility',
      difficulty: 'Moderate',
      icon: 'spa',
      completed: false,
      description: 'Gentle yoga flow to improve flexibility and relaxation',
    },
  ];

  // Recovery tips and recommendations
  const recoveryTips = [
    {
      id: 1,
      title: 'Hydration Check 💧',
      description: 'Aim for 8-10 glasses of water today',
      category: 'nutrition',
      priority: 'high',
    },
    {
      id: 2,
      title: 'Sleep Quality 😴',
      description: 'Target 7-9 hours of quality sleep tonight',
      category: 'sleep',
      priority: 'high',
    },
    {
      id: 3,
      title: 'Protein Intake 🥗',
      description: 'Include lean protein in every meal for muscle repair',
      category: 'nutrition',
      priority: 'medium',
    },
    {
      id: 4,
      title: 'Stress Management 🧘',
      description: 'Practice deep breathing or meditation for 10 minutes',
      category: 'mental',
      priority: 'medium',
    },
  ];

  // Initialize animations
  useEffect(() => {
    setRestActivities(mockRestActivities);
    
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
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update recovery data
      setRecoveryScore(Math.floor(Math.random() * 20) + 80);
      setWeeklyProgress(Math.random());
      
      dispatch({ type: 'REFRESH_RECOVERY_DATA' });
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh data. Please try again.');
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  // Handle activity completion
  const handleActivityCompletion = useCallback((activityId) => {
    Vibration.vibrate(50);
    
    setRestActivities(prevActivities =>
      prevActivities.map(activity =>
        activity.id === activityId
          ? { ...activity, completed: !activity.completed }
          : activity
      )
    );

    const activity = restActivities.find(a => a.id === activityId);
    if (activity && !activity.completed) {
      Alert.alert(
        '🎉 Activity Completed!',
        `Great job completing ${activity.title}! You earned +10 recovery points.`,
        [{ text: 'Awesome!', style: 'default' }]
      );
    }
  }, [restActivities]);

  // Handle rest day logging
  const handleLogRestDay = useCallback(() => {
    Alert.alert(
      'Log Rest Day',
      'Mark today as a complete rest day?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log It',
          style: 'default',
          onPress: () => {
            dispatch({ type: 'LOG_REST_DAY', payload: selectedDate });
            Alert.alert('✅ Rest Day Logged', 'Your rest day has been recorded. Great job prioritizing recovery!');
          },
        },
      ]
    );
  }, [selectedDate, dispatch]);

  // Render header with gradient
  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={styles.headerGradient}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Rest & Recovery</Text>
          <TouchableOpacity onPress={() => Alert.alert('Settings', 'Recovery settings coming soon!')}>
            <Icon name="settings" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <Animated.View
          style={[
            styles.statsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{recoveryStreak}</Text>
            <Text style={styles.statLabel}>Day Streak 🔥</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{recoveryScore}%</Text>
            <Text style={styles.statLabel}>Recovery Score</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalRestDays}</Text>
            <Text style={styles.statLabel}>Total Rest Days</Text>
          </View>
        </Animated.View>
      </View>
    </LinearGradient>
  );

  // Render weekly progress card
  const renderWeeklyProgress = () => (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }] }
      ]}
    >
      <Card style={styles.progressCard}>
        <Card.Content>
          <View style={styles.progressHeader}>
            <Icon name="trending-up" size={24} color={COLORS.primary} />
            <Text style={styles.progressTitle}>Weekly Recovery Progress</Text>
          </View>
          
          <View style={styles.progressContent}>
            <ProgressBar
              progress={weeklyProgress}
              color={COLORS.success}
              style={styles.progressBar}
            />
            <Text style={styles.progressText}>
              {Math.round(weeklyProgress * 100)}% of weekly recovery goals completed
            </Text>
          </View>
          
          <View style={styles.progressStats}>
            <Chip
              icon="check-circle"
              style={[styles.progressChip, { backgroundColor: COLORS.success + '20' }]}
              textStyle={{ color: COLORS.success }}
            >
              4/5 Rest Days
            </Chip>
            <Chip
              icon="schedule"
              style={[styles.progressChip, { backgroundColor: COLORS.warning + '20' }]}
              textStyle={{ color: COLORS.warning }}
            >
              6.5h Avg Sleep
            </Chip>
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  // Render tab navigation
  const renderTabNavigation = () => (
    <View style={styles.tabContainer}>
      {['today', 'activities', 'tips'].map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[styles.tab, activeTab === tab && styles.activeTab]}
          onPress={() => setActiveTab(tab)}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === tab && styles.activeTabText,
            ]}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // Render today's overview
  const renderTodayOverview = () => (
    <View style={styles.todayContainer}>
      <Surface style={styles.todayCard}>
        <View style={styles.todayHeader}>
          <Icon name="today" size={28} color={COLORS.primary} />
          <View style={styles.todayInfo}>
            <Text style={styles.todayTitle}>Today's Recovery Plan</Text>
            <Text style={styles.todayDate}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
          <Avatar.Text
            size={50}
            label={recoveryScore.toString()}
            style={{ backgroundColor: COLORS.success }}
          />
        </View>
        
        <View style={styles.todayActions}>
          <Button
            mode="contained"
            onPress={handleLogRestDay}
            style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
            labelStyle={{ color: '#fff' }}
          >
            Log Complete Rest Day
          </Button>
          
          <Button
            mode="outlined"
            onPress={() => setActiveTab('activities')}
            style={styles.actionButton}
            labelStyle={{ color: COLORS.primary }}
          >
            View Active Recovery
          </Button>
        </View>
      </Surface>
      
      <Card style={styles.recoveryTipsCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>🌟 Today's Recovery Focus</Text>
          {recoveryTips.slice(0, 2).map((tip) => (
            <View key={tip.id} style={styles.tipItem}>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipDescription}>{tip.description}</Text>
              </View>
              <IconButton
                icon="check-circle-outline"
                size={20}
                iconColor={COLORS.success}
                onPress={() => {
                  Vibration.vibrate(50);
                  Alert.alert('Tip Completed!', 'Great job staying on track with your recovery! 🎉');
                }}
              />
            </View>
          ))}
        </Card.Content>
      </Card>
    </View>
  );

  // Render recovery activities
  const renderActivities = () => {
    const filteredActivities = restActivities.filter(activity =>
      activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.type.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <View style={styles.activitiesContainer}>
        <Searchbar
          placeholder="Search recovery activities..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={COLORS.primary}
        />
        
        <View style={styles.activityFilters}>
          {['all', 'cardio', 'flexibility', 'recovery', 'mental'].map((filter) => (
            <Chip
              key={filter}
              selected={false}
              onPress={() => {}}
              style={styles.filterChip}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Chip>
          ))}
        </View>
        
        {filteredActivities.map((activity) => (
          <Card key={activity.id} style={styles.activityCard}>
            <Card.Content>
              <View style={styles.activityHeader}>
                <View style={styles.activityIcon}>
                  <Icon name={activity.icon} size={24} color={COLORS.primary} />
                </View>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activityDescription}>{activity.description}</Text>
                </View>
                <IconButton
                  icon={activity.completed ? 'check-circle' : 'check-circle-outline'}
                  size={28}
                  iconColor={activity.completed ? COLORS.success : COLORS.textSecondary}
                  onPress={() => handleActivityCompletion(activity.id)}
                />
              </View>
              
              <View style={styles.activityMeta}>
                <Chip
                  icon="schedule"
                  style={styles.metaChip}
                  textStyle={{ fontSize: 12 }}
                >
                  {activity.duration} min
                </Chip>
                <Chip
                  icon="local-fire-department"
                  style={styles.metaChip}
                  textStyle={{ fontSize: 12 }}
                >
                  {activity.calories} cal
                </Chip>
                <Chip
                  icon="fitness-center"
                  style={[
                    styles.metaChip,
                    {
                      backgroundColor:
                        activity.difficulty === 'Easy'
                          ? COLORS.success + '20'
                          : COLORS.warning + '20',
                    },
                  ]}
                  textStyle={{ fontSize: 12 }}
                >
                  {activity.difficulty}
                </Chip>
              </View>
            </Card.Content>
          </Card>
        ))}
      </View>
    );
  };

  // Render recovery tips
  const renderRecoveryTips = () => (
    <View style={styles.tipsContainer}>
      <Text style={styles.sectionTitle}>💡 Recovery Recommendations</Text>
      
      {recoveryTips.map((tip) => (
        <Card key={tip.id} style={styles.tipCard}>
          <Card.Content>
            <View style={styles.tipHeader}>
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Chip
                style={[
                  styles.priorityChip,
                  {
                    backgroundColor:
                      tip.priority === 'high'
                        ? COLORS.error + '20'
                        : COLORS.warning + '20',
                  },
                ]}
                textStyle={{
                  color: tip.priority === 'high' ? COLORS.error : COLORS.warning,
                  fontSize: 10,
                }}
              >
                {tip.priority.toUpperCase()}
              </Chip>
            </View>
            <Text style={styles.tipDescription}>{tip.description}</Text>
            
            <View style={styles.tipActions}>
              <Button
                mode="outlined"
                compact
                onPress={() => Alert.alert('Feature Coming Soon!', 'Learn more about this recovery tip.')}
                style={styles.tipButton}
              >
                Learn More
              </Button>
              <Button
                mode="contained"
                compact
                onPress={() => {
                  Vibration.vibrate(50);
                  Alert.alert('Tip Applied!', 'Great job implementing this recovery strategy! 🌟');
                }}
                style={[styles.tipButton, { backgroundColor: COLORS.primary }]}
                labelStyle={{ color: '#fff' }}
              >
                Mark Done
              </Button>
            </View>
          </Card.Content>
        </Card>
      ))}
    </View>
  );

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'today':
        return renderTodayOverview();
      case 'activities':
        return renderActivities();
      case 'tips':
        return renderRecoveryTips();
      default:
        return renderTodayOverview();
    }
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      
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
        {renderWeeklyProgress()}
        {renderTabNavigation()}
        {renderContent()}
        
        <View style={styles.bottomPadding} />
      </ScrollView>
      
      <FAB
        style={styles.fab}
        icon="add"
        onPress={() => Alert.alert('Feature Coming Soon!', 'Create custom recovery activities and plans.')}
        color="#fff"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    paddingHorizontal: SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: '#fff',
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    paddingVertical: SPACING.md,
    marginTop: SPACING.sm,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: SPACING.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  progressCard: {
    marginTop: -SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: 12,
    elevation: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  progressTitle: {
    ...TEXT_STYLES.h3,
    marginLeft: SPACING.sm,
  },
  progressContent: {
    marginBottom: SPACING.md,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.sm,
  },
  progressText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressChip: {
    borderRadius: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.xs,
    marginBottom: SPACING.md,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    ...TEXT_STYLES.body,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '600',
  },
  todayContainer: {
    marginBottom: SPACING.lg,
  },
  todayCard: {
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    elevation: 2,
  },
  todayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  todayInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  todayTitle: {
    ...TEXT_STYLES.h3,
  },
  todayDate: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
  },
  todayActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 0.48,
    borderRadius: 8,
  },
  recoveryTipsCard: {
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.md,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  tipDescription: {
    ...TEXT_STYLES.caption,
  },
  activitiesContainer: {
    marginBottom: SPACING.lg,
  },
  searchBar: {
    marginBottom: SPACING.md,
    borderRadius: 12,
  },
  activityFilters: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  filterChip: {
    marginRight: SPACING.sm,
    borderRadius: 16,
  },
  activityCard: {
    marginBottom: SPACING.sm,
    borderRadius: 12,
    elevation: 2,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  activityDescription: {
    ...TEXT_STYLES.caption,
  },
  activityMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metaChip: {
    marginRight: SPACING.sm,
    marginTop: SPACING.xs,
    height: 24,
  },
  tipsContainer: {
    marginBottom: SPACING.lg,
  },
  tipCard: {
    marginBottom: SPACING.sm,
    borderRadius: 12,
    elevation: 2,
  },
  tipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  priorityChip: {
    height: 20,
    borderRadius: 10,
  },
  tipActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  tipButton: {
    flex: 0.48,
    borderRadius: 6,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  bottomPadding: {
    height: 80,
  },
});

export default RestDays;