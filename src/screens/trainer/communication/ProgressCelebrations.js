import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Animated,
  Dimensions,
  Vibration,
  Alert,
  RefreshControl,
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
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '../../../components/shared/BlurView';

// Import your design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const ProgressCelebration = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user, achievements, progress } = useSelector(state => state.user);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);
  const [celebrationData, setCelebrationData] = useState(null);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [showShareModal, setShowShareModal] = useState(false);

  // Mock celebration data - replace with Redux state
  const mockCelebrationData = {
    type: 'milestone', // 'achievement', 'level_up', 'streak', 'goal_complete'
    title: '🎉 Milestone Achieved!',
    subtitle: '30 Days Training Streak',
    description: 'Incredible dedication! You\'ve completed 30 consecutive training days.',
    points: 500,
    badge: 'streak-master',
    level: 5,
    progress: 85,
    nextGoal: 'Complete 50 days streak',
    stats: {
      totalSessions: 45,
      totalMinutes: 2250,
      caloriesBurned: 15750,
      improvements: '+15% strength, +20% endurance'
    }
  };

  useEffect(() => {
    // Get celebration data from route params or Redux
    const data = route.params?.celebrationData || mockCelebrationData;
    setCelebrationData(data);
    
    // Start celebration animations
    startCelebrationSequence();
    
    // Vibration feedback
    Vibration.vibrate([0, 200, 100, 200]);
  }, []);

  const startCelebrationSequence = useCallback(() => {
    // Sequence of animations
    Animated.sequence([
      // Fade in background
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      // Scale up main content
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Confetti animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(confettiAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(confettiAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Progress bar animation
    setTimeout(() => {
      Animated.timing(progressAnim, {
        toValue: celebrationData?.progress || 85,
        duration: 2000,
        useNativeDriver: false,
      }).start();
    }, 1000);
  }, [fadeAnim, scaleAnim, confettiAnim, progressAnim]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleContinue = () => {
    navigation.goBack();
  };

  const handleViewStats = () => {
    Alert.alert(
      'Feature Coming Soon',
      'Detailed analytics dashboard is under development! 🚧',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const renderConfetti = () => {
    const confettiElements = Array.from({ length: 20 }, (_, index) => {
      const randomX = Math.random() * width;
      const randomDelay = Math.random() * 2000;
      
      return (
        <Animated.View
          key={index}
          style={[
            styles.confettiPiece,
            {
              left: randomX,
              transform: [
                {
                  translateY: confettiAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-50, height + 100],
                  }),
                },
                {
                  rotate: confettiAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        >
          <MaterialIcons
            name="star"
            size={16}
            color={index % 2 === 0 ? COLORS.primary : COLORS.secondary}
          />
        </Animated.View>
      );
    });

    return showConfetti ? confettiElements : null;
  };

  const renderCelebrationHeader = () => (
    <Animated.View
      style={[
        styles.headerContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <Avatar.Icon
            size={80}
            icon="trophy"
            style={styles.trophyIcon}
            theme={{ colors: { primary: COLORS.success } }}
          />
          
          <Text style={[TEXT_STYLES.h1, styles.celebrationTitle]}>
            {celebrationData?.title}
          </Text>
          
          <Text style={[TEXT_STYLES.body, styles.celebrationSubtitle]}>
            {celebrationData?.subtitle}
          </Text>

          <Chip
            mode="outlined"
            icon="star"
            style={styles.pointsChip}
            textStyle={styles.pointsText}
          >
            +{celebrationData?.points} Points
          </Chip>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderProgressSection = () => (
    <Card style={styles.progressCard}>
      <Card.Content>
        <View style={styles.progressHeader}>
          <MaterialIcons name="trending-up" size={24} color={COLORS.primary} />
          <Text style={[TEXT_STYLES.h3, styles.progressTitle]}>
            Your Progress
          </Text>
        </View>

        <View style={styles.levelContainer}>
          <Text style={[TEXT_STYLES.body, styles.levelText]}>
            Level {celebrationData?.level || 5}
          </Text>
          <ProgressBar
            progress={progressAnim}
            color={COLORS.primary}
            style={styles.levelProgress}
          />
          <Text style={[TEXT_STYLES.caption, styles.nextGoalText]}>
            Next: {celebrationData?.nextGoal}
          </Text>
        </View>

        <Text style={[TEXT_STYLES.body, styles.descriptionText]}>
          {celebrationData?.description}
        </Text>
      </Card.Content>
    </Card>
  );

  const renderStatsGrid = () => (
    <Card style={styles.statsCard}>
      <Card.Content>
        <Text style={[TEXT_STYLES.h3, styles.statsTitle]}>
          Achievement Stats 📊
        </Text>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <MaterialIcons name="fitness-center" size={24} color={COLORS.primary} />
            <Text style={[TEXT_STYLES.h3, styles.statNumber]}>
              {celebrationData?.stats?.totalSessions}
            </Text>
            <Text style={[TEXT_STYLES.caption, styles.statLabel]}>
              Sessions
            </Text>
          </View>

          <View style={styles.statItem}>
            <MaterialIcons name="schedule" size={24} color={COLORS.secondary} />
            <Text style={[TEXT_STYLES.h3, styles.statNumber]}>
              {Math.floor((celebrationData?.stats?.totalMinutes || 0) / 60)}h
            </Text>
            <Text style={[TEXT_STYLES.caption, styles.statLabel]}>
              Training Time
            </Text>
          </View>

          <View style={styles.statItem}>
            <MaterialIcons name="local-fire-department" size={24} color={COLORS.error} />
            <Text style={[TEXT_STYLES.h3, styles.statNumber]}>
              {celebrationData?.stats?.caloriesBurned?.toLocaleString()}
            </Text>
            <Text style={[TEXT_STYLES.caption, styles.statLabel]}>
              Calories
            </Text>
          </View>
        </View>

        <Surface style={styles.improvementSurface}>
          <MaterialIcons name="trending-up" size={20} color={COLORS.success} />
          <Text style={[TEXT_STYLES.body, styles.improvementText]}>
            {celebrationData?.stats?.improvements}
          </Text>
        </Surface>
      </Card.Content>
    </Card>
  );

  const renderActionButtons = () => (
    <View style={styles.actionContainer}>
      <Button
        mode="outlined"
        icon="share"
        style={styles.shareButton}
        labelStyle={styles.buttonLabel}
        onPress={handleShare}
      >
        Share Achievement
      </Button>

      <Button
        mode="outlined"
        icon="analytics"
        style={styles.statsButton}
        labelStyle={styles.buttonLabel}
        onPress={handleViewStats}
      >
        View Detailed Stats
      </Button>

      <Button
        mode="contained"
        icon="arrow-forward"
        style={styles.continueButton}
        labelStyle={styles.continueButtonLabel}
        onPress={handleContinue}
      >
        Continue Training
      </Button>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Confetti Animation */}
      <View style={styles.confettiContainer}>
        {renderConfetti()}
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
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
        {renderCelebrationHeader()}
        
        <View style={styles.contentContainer}>
          {renderProgressSection()}
          {renderStatsGrid()}
          {renderActionButtons()}
        </View>
      </ScrollView>

      {/* Share Modal */}
      <Portal>
        {showShareModal && (
          <BlurView style={styles.modalOverlay} blurType="dark" blurAmount={10}>
            <View style={styles.modalContent}>
              <Text style={[TEXT_STYLES.h3, styles.modalTitle]}>
                Share Your Achievement! 🎉
              </Text>
              <Text style={[TEXT_STYLES.body, styles.modalText]}>
                Feature coming soon! You'll be able to share your progress with friends and social media.
              </Text>
              <Button
                mode="contained"
                onPress={() => setShowShareModal(false)}
                style={styles.modalButton}
              >
                Close
              </Button>
            </View>
          </BlurView>
        )}
      </Portal>

      {/* Floating Action Button */}
      <FAB
        icon="home"
        style={styles.fab}
        onPress={() => navigation.navigate('Dashboard')}
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
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    pointerEvents: 'none',
  },
  confettiPiece: {
    position: 'absolute',
  },
  scrollContainer: {
    flex: 1,
    zIndex: 2,
  },
  scrollContent: {
    paddingBottom: SPACING.xl + 60, // Extra space for FAB
  },
  headerContainer: {
    marginBottom: SPACING.md,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  trophyIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: SPACING.md,
  },
  celebrationTitle: {
    color: 'white',
    textAlign: 'center',
    marginBottom: SPACING.xs,
    fontWeight: 'bold',
  },
  celebrationSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  pointsChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'white',
  },
  pointsText: {
    color: 'white',
    fontWeight: 'bold',
  },
  contentContainer: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
  },
  progressCard: {
    elevation: 4,
    borderRadius: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  progressTitle: {
    color: COLORS.text,
  },
  levelContainer: {
    marginBottom: SPACING.md,
  },
  levelText: {
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
    color: COLORS.primary,
  },
  levelProgress: {
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.xs,
  },
  nextGoalText: {
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  descriptionText: {
    color: COLORS.text,
    lineHeight: 22,
  },
  statsCard: {
    elevation: 4,
    borderRadius: 12,
  },
  statsTitle: {
    textAlign: 'center',
    marginBottom: SPACING.lg,
    color: COLORS.text,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.lg,
  },
  statItem: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statNumber: {
    color: COLORS.text,
    fontWeight: 'bold',
  },
  statLabel: {
    color: COLORS.textSecondary,
  },
  improvementSurface: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 8,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    gap: SPACING.xs,
  },
  improvementText: {
    color: COLORS.success,
    fontWeight: '500',
    flex: 1,
  },
  actionContainer: {
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  shareButton: {
    borderColor: COLORS.primary,
    borderRadius: 8,
  },
  statsButton: {
    borderColor: COLORS.secondary,
    borderRadius: 8,
  },
  continueButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: SPACING.xs,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  continueButtonLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: SPACING.xl,
    padding: SPACING.xl,
    borderRadius: 16,
    alignItems: 'center',
    gap: SPACING.md,
  },
  modalTitle: {
    textAlign: 'center',
    color: COLORS.text,
  },
  modalText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  modalButton: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.xl,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default ProgressCelebration;
