import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  RefreshControl,
  Animated,
  Vibration,
  Alert,
  StyleSheet,
} from 'react-native';
import {
  Card,
  Button,
  ProgressBar,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Chip,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import your established constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const HydrationTracker = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, hydrationData, isLoading } = useSelector(state => ({
    user: state.auth.user,
    hydrationData: state.wellness.hydration || {},
    isLoading: state.wellness.isLoading,
  }));

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [dailyGoal, setDailyGoal] = useState(hydrationData.dailyGoal || 8); // glasses
  const [currentIntake, setCurrentIntake] = useState(hydrationData.todayIntake || 0);
  const [streak, setStreak] = useState(hydrationData.streak || 0);
  const [weeklyData, setWeeklyData] = useState(hydrationData.weeklyData || []);
  
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [waveAnim] = useState(new Animated.Value(0));

  // Component mount animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Start wave animation
    startWaveAnimation();
  }, []);

  const startWaveAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(waveAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Dispatch action to refresh hydration data
      // dispatch(refreshHydrationData());
      setTimeout(() => setRefreshing(false), 1000);
    } catch (error) {
      setRefreshing(false);
      Alert.alert('Error', 'Failed to refresh data. Please try again.');
    }
  }, [dispatch]);

  // Add water intake
  const addWaterIntake = (amount) => {
    Vibration.vibrate(50);
    const newIntake = Math.min(currentIntake + amount, dailyGoal + 5); // Allow slight overflow
    setCurrentIntake(newIntake);
    
    // Animate progress update
    Animated.spring(scaleAnim, {
      toValue: 1.1,
      tension: 150,
      friction: 3,
      useNativeDriver: true,
    }).start(() => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();
    });

    // Check for goal completion
    if (newIntake >= dailyGoal && currentIntake < dailyGoal) {
      Alert.alert(
        '🎉 Goal Achieved!',
        'Awesome! You\'ve reached your daily hydration goal! Keep it up! 💧',
        [{ text: 'Amazing!', style: 'default' }]
      );
      Vibration.vibrate([100, 50, 100]);
    }

    // Save to state/redux
    // dispatch(updateHydrationIntake(newIntake));
  };

  // Calculate progress percentage
  const progressPercentage = Math.min(currentIntake / dailyGoal, 1);
  const isGoalReached = currentIntake >= dailyGoal;

  // Get encouragement message
  const getEncouragementMessage = () => {
    const percentage = progressPercentage;
    if (percentage >= 1) return "🏆 Goal smashed! You're a hydration champion!";
    if (percentage >= 0.8) return "💪 Almost there! Just a little more!";
    if (percentage >= 0.5) return "⚡ Great progress! Keep going!";
    if (percentage >= 0.25) return "🌟 Good start! Let's keep drinking!";
    return "💧 Time to hydrate! Your body will thank you!";
  };

  // Quick intake options
  const quickIntakeOptions = [
    { amount: 0.5, label: 'Small Cup', icon: 'local-drink', color: COLORS.primary },
    { amount: 1, label: 'Glass', icon: 'local-bar', color: COLORS.success },
    { amount: 1.5, label: 'Bottle', icon: 'sports-bar', color: COLORS.secondary },
    { amount: 2, label: 'Large Bottle', icon: 'local-drink', color: '#4CAF50' },
  ];

  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.headerGradient}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.headerContent}>
        <Text style={[TEXT_STYLES.heading, styles.headerTitle]}>
          Daily Hydration 💧
        </Text>
        <Text style={[TEXT_STYLES.body, styles.headerSubtitle]}>
          Stay healthy, stay hydrated!
        </Text>
      </View>
    </LinearGradient>
  );

  const renderProgressCard = () => (
    <Animated.View
      style={[
        styles.progressCardContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <Card style={styles.progressCard}>
        <LinearGradient
          colors={isGoalReached ? ['#4CAF50', '#45A049'] : ['#667eea', '#764ba2']}
          style={styles.progressCardGradient}
        >
          <View style={styles.progressContent}>
            <Animated.View
              style={[
                styles.waterIcon,
                {
                  transform: [{
                    translateY: waveAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -10],
                    })
                  }]
                }
              ]}
            >
              <Icon
                name={isGoalReached ? "jump-rope" : "opacity"}
                size={60}
                color="#ffffff"
              />
            </Animated.View>
            
            <Text style={styles.progressText}>
              {currentIntake} / {dailyGoal} glasses
            </Text>
            
            <ProgressBar
              progress={progressPercentage}
              color="#ffffff"
              style={styles.progressBar}
            />
            
            <Text style={styles.percentageText}>
              {Math.round(progressPercentage * 100)}% Complete
            </Text>
            
            <Text style={styles.encouragementText}>
              {getEncouragementMessage()}
            </Text>
          </View>
        </LinearGradient>
      </Card>
    </Animated.View>
  );

  const renderQuickActions = () => (
    <Card style={styles.quickActionsCard}>
      <Text style={[TEXT_STYLES.heading, styles.sectionTitle]}>
        Quick Add 💧
      </Text>
      <View style={styles.quickActionsGrid}>
        {quickIntakeOptions.map((option, index) => (
          <Surface key={index} style={[styles.quickActionButton, { backgroundColor: option.color }]}>
            <IconButton
              icon={option.icon}
              iconColor="#ffffff"
              size={30}
              onPress={() => addWaterIntake(option.amount)}
            />
            <Text style={styles.quickActionLabel}>{option.label}</Text>
            <Text style={styles.quickActionAmount}>+{option.amount}</Text>
          </Surface>
        ))}
      </View>
    </Card>
  );

  const renderStatsCard = () => (
    <Card style={styles.statsCard}>
      <Text style={[TEXT_STYLES.heading, styles.sectionTitle]}>
        Your Progress 📊
      </Text>
      
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Icon name="local-fire-department" size={24} color={COLORS.error} />
          <Text style={styles.statNumber}>{streak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
        
        <View style={styles.statItem}>
          <Icon name="trending-up" size={24} color={COLORS.success} />
          <Text style={styles.statNumber}>85%</Text>
          <Text style={styles.statLabel}>Weekly Avg</Text>
        </View>
        
        <View style={styles.statItem}>
          <Icon name="jump-rope" size={24} color="#FFD700" />
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>Goals Met</Text>
        </View>
      </View>
    </Card>
  );

  const renderTipsCard = () => (
    <Card style={styles.tipsCard}>
      <Text style={[TEXT_STYLES.heading, styles.sectionTitle]}>
        Hydration Tips 💡
      </Text>
      
      <View style={styles.tipsContainer}>
        <View style={styles.tipItem}>
          <Icon name="schedule" size={20} color={COLORS.primary} />
          <Text style={styles.tipText}>Drink water as soon as you wake up</Text>
        </View>
        
        <View style={styles.tipItem}>
          <Icon name="restaurant" size={20} color={COLORS.primary} />
          <Text style={styles.tipText}>Have a glass before each meal</Text>
        </View>
        
        <View style={styles.tipItem}>
          <Icon name="fitness-center" size={20} color={COLORS.primary} />
          <Text style={styles.tipText}>Increase intake during exercise</Text>
        </View>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
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
        {renderProgressCard()}
        {renderQuickActions()}
        {renderStatsCard()}
        {renderTipsCard()}
        
        <View style={styles.bottomSpacer} />
      </ScrollView>

      <FAB
        icon="add"
        style={[styles.fab, { backgroundColor: COLORS.primary }]}
        onPress={() => {
          Alert.alert(
            'Custom Amount',
            'Add custom water intake coming soon! 🚧',
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
  headerGradient: {
    paddingTop: 50,
    paddingBottom: SPACING.large,
    paddingHorizontal: SPACING.medium,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerSubtitle: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: SPACING.small,
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.medium,
  },
  progressCardContainer: {
    marginBottom: SPACING.large,
  },
  progressCard: {
    elevation: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  progressCardGradient: {
    padding: SPACING.large,
    alignItems: 'center',
  },
  progressContent: {
    alignItems: 'center',
    width: '100%',
  },
  waterIcon: {
    marginBottom: SPACING.medium,
  },
  progressText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: SPACING.medium,
  },
  progressBar: {
    width: '80%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginBottom: SPACING.medium,
  },
  percentageText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: SPACING.small,
  },
  encouragementText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.9,
  },
  quickActionsCard: {
    marginBottom: SPACING.large,
    padding: SPACING.medium,
    elevation: 4,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.medium,
    textAlign: 'center',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  quickActionButton: {
    width: '48%',
    alignItems: 'center',
    padding: SPACING.medium,
    borderRadius: 12,
    marginBottom: SPACING.small,
    elevation: 3,
  },
  quickActionLabel: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: SPACING.small,
  },
  quickActionAmount: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statsCard: {
    marginBottom: SPACING.large,
    padding: SPACING.medium,
    elevation: 4,
    borderRadius: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.small,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.tiny,
  },
  tipsCard: {
    marginBottom: SPACING.large,
    padding: SPACING.medium,
    elevation: 4,
    borderRadius: 12,
  },
  tipsContainer: {
    gap: SPACING.medium,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.small,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  bottomSpacer: {
    height: 100,
  },
  fab: {
    position: 'absolute',
    right: SPACING.medium,
    bottom: SPACING.large,
    elevation: 8,
  },
});

export default HydrationTracker;