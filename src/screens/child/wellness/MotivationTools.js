import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  RefreshControl,
  Animated,
  TouchableOpacity,
  Dimensions,
  Vibration,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
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
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f5f5',
  white: '#FFFFFF',
  text: '#333333',
  textLight: '#666666',
  motivation: {
    energy: '#FF6B6B',
    focus: '#4ECDC4',
    confidence: '#45B7D1',
    joy: '#FFA726',
    strength: '#66BB6A',
  }
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold' },
  h2: { fontSize: 24, fontWeight: '600' },
  h3: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16 },
  caption: { fontSize: 14 },
  small: { fontSize: 12 },
};

const { width, height } = Dimensions.get('window');

const MotivationalTools = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, motivation } = useSelector((state) => state.user);
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [animatedValue] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));
  const scrollRef = useRef(null);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Start pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      generateDailyQuote();
    }, 1500);
  }, []);

  const motivationalQuotes = [
    { text: "You are AMAZING just the way you are! ⭐", category: "confidence" },
    { text: "Every small step takes you closer to your dreams! 🌟", category: "progress" },
    { text: "Believe in yourself - you've got this! 💪", category: "strength" },
    { text: "Your hard work will pay off! Keep going! 🚀", category: "persistence" },
    { text: "You make the world brighter just by being you! ☀️", category: "joy" },
    { text: "Challenges help you grow stronger! 🌱", category: "growth" },
    { text: "Today is full of possibilities! ✨", category: "optimism" },
    { text: "You are capable of incredible things! 🦋", category: "potential" },
  ];

  const goals = [
    {
      id: 1,
      title: "Drink 6 Glasses of Water",
      progress: 4,
      total: 6,
      icon: "water-drop",
      color: COLORS.motivation.focus,
      type: "daily",
      points: 20,
    },
    {
      id: 2,
      title: "Practice 30 Minutes",
      progress: 20,
      total: 30,
      icon: "sports-soccer",
      color: COLORS.motivation.energy,
      type: "daily",
      points: 30,
    },
    {
      id: 3,
      title: "Read for 15 Minutes",
      progress: 8,
      total: 15,
      icon: "book",
      color: COLORS.motivation.confidence,
      type: "daily",
      points: 25,
    },
    {
      id: 4,
      title: "Complete Week Challenge",
      progress: 5,
      total: 7,
      icon: "jump-rope",
      color: COLORS.motivation.strength,
      type: "weekly",
      points: 100,
    },
  ];

  const achievements = [
    {
      id: 1,
      title: "Goal Crusher",
      description: "Complete 5 daily goals",
      icon: "military-tech",
      progress: 3,
      total: 5,
      earned: false,
    },
    {
      id: 2,
      title: "Consistency King",
      description: "7-day streak",
      icon: "local-fire-department",
      progress: 7,
      total: 7,
      earned: true,
    },
    {
      id: 3,
      title: "Motivation Master",
      description: "Use tools 20 times",
      icon: "psychology",
      progress: 15,
      total: 20,
      earned: false,
    },
  ];

  const motivationTools = [
    {
      id: 1,
      title: "Power Poses",
      description: "Strike a superhero pose!",
      icon: "accessibility-new",
      color: COLORS.motivation.strength,
      type: "activity",
    },
    {
      id: 2,
      title: "Victory Dance",
      description: "Celebrate your wins!",
      icon: "celebration",
      color: COLORS.motivation.joy,
      type: "activity",
    },
    {
      id: 3,
      title: "Affirmations",
      description: "Positive self-talk",
      icon: "record-voice-over",
      color: COLORS.motivation.confidence,
      type: "mental",
    },
    {
      id: 4,
      title: "Goal Visualizer",
      description: "See your success!",
      icon: "visibility",
      color: COLORS.motivation.focus,
      type: "mental",
    },
  ];

  const generateDailyQuote = () => {
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    setCurrentQuoteIndex(randomIndex);
  };

  const handleGoalProgress = (goalId) => {
    Vibration.vibrate(50);
    Alert.alert(
      "Goal Progress! 🎯",
      "Great job working towards your goal! Keep it up, champion!",
      [{ text: "Thanks!", style: "default" }]
    );
  };

  const handleToolActivate = (tool) => {
    switch (tool.type) {
      case 'activity':
        Alert.alert(
          `${tool.title} Time! 🎉`,
          `Let's do this together! ${tool.description} Remember, you're awesome!`,
          [
            { text: "Let's Go!", onPress: () => startToolActivity(tool) },
            { text: "Maybe Later", style: "cancel" }
          ]
        );
        break;
      case 'mental':
        Alert.alert(
          'Coming Soon! 🚀',
          `The ${tool.title} feature is being crafted with care! It will include guided sessions and interactive experiences.`,
          [{ text: 'Exciting!', style: 'default' }]
        );
        break;
    }
  };

  const startToolActivity = (tool) => {
    if (tool.title === "Power Poses") {
      Alert.alert(
        "Superhero Time! 🦸‍♀️",
        "Stand tall, put your hands on your hips, and feel your inner strength! Hold for 10 seconds and feel the power!",
        [{ text: "I Feel Strong!", style: "default" }]
      );
    } else if (tool.title === "Victory Dance") {
      Alert.alert(
        "Dance Party! 🕺",
        "Put on your favorite song and dance like nobody's watching! Celebrate every small win!",
        [{ text: "Dancing Now!", style: "default" }]
      );
    }
  };

  const renderDailyQuote = () => (
    <TouchableOpacity onPress={() => setShowQuoteModal(true)}>
      <Card style={[styles.card, styles.quoteCard]}>
        <LinearGradient
          colors={[COLORS.motivation.joy, COLORS.motivation.confidence]}
          style={styles.quoteGradient}
        >
          <View style={styles.quoteContent}>
            <Icon name="format-quote" size={32} color={COLORS.white} style={styles.quoteIcon} />
            <Text style={styles.quoteText}>
              {motivationalQuotes[currentQuoteIndex]?.text}
            </Text>
            <Surface style={styles.quoteRefreshButton}>
              <IconButton
                icon="refresh"
                size={20}
                iconColor={COLORS.motivation.joy}
                onPress={generateDailyQuote}
              />
            </Surface>
          </View>
        </LinearGradient>
      </Card>
    </TouchableOpacity>
  );

  const renderGoals = () => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <Icon name="flag" size={24} color={COLORS.primary} />
          <Text style={[TEXT_STYLES.h3, { marginLeft: SPACING.sm }]}>
            Your Goals Today 🎯
          </Text>
        </View>
        {goals.map((goal) => (
          <TouchableOpacity
            key={goal.id}
            style={styles.goalItem}
            onPress={() => handleGoalProgress(goal.id)}
          >
            <Surface style={[styles.goalIcon, { backgroundColor: goal.color + '20' }]}>
              <Icon name={goal.icon} size={24} color={goal.color} />
            </Surface>
            <View style={styles.goalContent}>
              <View style={styles.goalHeader}>
                <Text style={styles.goalTitle}>{goal.title}</Text>
                <Chip
                  mode="outlined"
                  style={[styles.goalChip, { borderColor: goal.color }]}
                  textStyle={{ color: goal.color, fontSize: 12 }}
                >
                  +{goal.points} pts
                </Chip>
              </View>
              <Text style={styles.goalProgress}>
                {goal.progress} of {goal.total} {goal.type === 'daily' ? 'today' : 'this week'}
              </Text>
              <ProgressBar
                progress={goal.progress / goal.total}
                color={goal.color}
                style={styles.progressBar}
              />
            </View>
          </TouchableOpacity>
        ))}
      </Card.Content>
    </Card>
  );

  const renderMotivationTools = () => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <Icon name="psychology" size={24} color={COLORS.primary} />
          <Text style={[TEXT_STYLES.h3, { marginLeft: SPACING.sm }]}>
            Power-Up Tools 🚀
          </Text>
        </View>
        <Text style={[TEXT_STYLES.caption, { color: COLORS.textLight, marginBottom: SPACING.md }]}>
          Use these tools to boost your confidence and energy!
        </Text>
        <View style={styles.toolsGrid}>
          {motivationTools.map((tool) => (
            <TouchableOpacity
              key={tool.id}
              style={[styles.toolCard, { borderColor: tool.color }]}
              onPress={() => handleToolActivate(tool)}
            >
              <LinearGradient
                colors={[tool.color + '20', tool.color + '10']}
                style={styles.toolGradient}
              >
                <Icon name={tool.icon} size={32} color={tool.color} />
                <Text style={[styles.toolTitle, { color: tool.color }]}>
                  {tool.title}
                </Text>
                <Text style={styles.toolDescription}>
                  {tool.description}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </Card.Content>
    </Card>
  );

  const renderAchievements = () => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <Icon name="jump-rope" size={24} color={COLORS.primary} />
          <Text style={[TEXT_STYLES.h3, { marginLeft: SPACING.sm }]}>
            Achievement Zone 🏆
          </Text>
        </View>
        {achievements.map((achievement) => (
          <Surface key={achievement.id} style={styles.achievementItem}>
            <View style={styles.achievementContent}>
              <Surface style={[
                styles.achievementIcon,
                { backgroundColor: achievement.earned ? COLORS.success + '20' : COLORS.textLight + '20' }
              ]}>
                <Icon
                  name={achievement.icon}
                  size={24}
                  color={achievement.earned ? COLORS.success : COLORS.textLight}
                />
              </Surface>
              <View style={styles.achievementDetails}>
                <Text style={[
                  styles.achievementTitle,
                  !achievement.earned && { color: COLORS.textLight }
                ]}>
                  {achievement.title}
                </Text>
                <Text style={styles.achievementDescription}>
                  {achievement.description}
                </Text>
                <View style={styles.achievementProgress}>
                  <ProgressBar
                    progress={achievement.progress / achievement.total}
                    color={achievement.earned ? COLORS.success : COLORS.primary}
                    style={styles.achievementProgressBar}
                  />
                  <Text style={styles.achievementProgressText}>
                    {achievement.progress}/{achievement.total}
                  </Text>
                </View>
              </View>
              {achievement.earned && (
                <Chip
                  mode="flat"
                  style={styles.earnedBadge}
                  textStyle={styles.earnedText}
                >
                  EARNED! ✨
                </Chip>
              )}
            </View>
          </Surface>
        ))}
      </Card.Content>
    </Card>
  );

  const renderEncouragementCenter = () => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <Icon name="favorite" size={24} color={COLORS.primary} />
          <Text style={[TEXT_STYLES.h3, { marginLeft: SPACING.sm }]}>
            Encouragement Center 💖
          </Text>
        </View>
        <View style={styles.encouragementGrid}>
          <Surface style={styles.encouragementCard}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Icon name="stars" size={28} color={COLORS.motivation.joy} />
            </Animated.View>
            <Text style={styles.encouragementTitle}>You're a Star!</Text>
            <Text style={styles.encouragementText}>
              Your effort and dedication shine bright! ⭐
            </Text>
          </Surface>
          <Surface style={styles.encouragementCard}>
            <Icon name="trending-up" size={28} color={COLORS.motivation.strength} />
            <Text style={styles.encouragementTitle}>Growing Stronger!</Text>
            <Text style={styles.encouragementText}>
              Every day you're becoming better! 📈
            </Text>
          </Surface>
        </View>
      </Card.Content>
    </Card>
  );

  const renderQuoteModal = () => (
    <Portal>
      <Modal
        visible={showQuoteModal}
        onDismiss={() => setShowQuoteModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <LinearGradient
          colors={[COLORS.motivation.confidence, COLORS.motivation.joy]}
          style={styles.modalGradient}
        >
          <Icon name="format-quote" size={48} color={COLORS.white} />
          <Text style={styles.modalQuoteText}>
            {motivationalQuotes[currentQuoteIndex]?.text}
          </Text>
          <Button
            mode="contained"
            onPress={() => setShowQuoteModal(false)}
            style={styles.modalButton}
            buttonColor={COLORS.white}
            textColor={COLORS.motivation.confidence}
          >
            Thanks! 💙
          </Button>
        </LinearGradient>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" translucent />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Motivation Station 🚀</Text>
          <Text style={styles.headerSubtitle}>
            Power up your day with positivity! 💫
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        ref={scrollRef}
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: animatedValue,
              transform: [
                {
                  translateY: animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {renderDailyQuote()}
          {renderGoals()}
          {renderMotivationTools()}
          {renderAchievements()}
          {renderEncouragementCenter()}
        </Animated.View>
      </ScrollView>

      {renderQuoteModal()}

      <FAB
        style={styles.fab}
        icon="celebration"
        onPress={() => {
          Vibration.vibrate(100);
          Alert.alert(
            'Celebration Time! 🎉',
            'You\'re doing amazing! Take a moment to celebrate all your hard work and progress. You should be proud of yourself! 🌟',
            [{ text: 'I\'m Proud!', style: 'default' }]
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
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  content: {
    padding: SPACING.md,
  },
  card: {
    marginBottom: SPACING.md,
    elevation: 4,
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  quoteCard: {
    overflow: 'hidden',
  },
  quoteGradient: {
    padding: SPACING.lg,
    borderRadius: 12,
  },
  quoteContent: {
    alignItems: 'center',
    position: 'relative',
  },
  quoteIcon: {
    marginBottom: SPACING.sm,
    opacity: 0.3,
  },
  quoteText: {
    ...TEXT_STYLES.h3,
    color: COLORS.white,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 28,
  },
  quoteRefreshButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    borderRadius: 20,
    elevation: 2,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  goalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    elevation: 2,
  },
  goalContent: {
    flex: 1,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  goalTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    flex: 1,
  },
  goalChip: {
    backgroundColor: 'transparent',
  },
  goalProgress: {
    ...TEXT_STYLES.caption,
    color: COLORS.textLight,
    marginBottom: SPACING.xs,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.background,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  toolCard: {
    width: (width - 64) / 2,
    marginBottom: SPACING.md,
    borderRadius: 12,
    borderWidth: 2,
    overflow: 'hidden',
  },
  toolGradient: {
    padding: SPACING.md,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  toolTitle: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  toolDescription: {
    ...TEXT_STYLES.small,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  achievementItem: {
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: 8,
    elevation: 1,
  },
  achievementContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  achievementDetails: {
    flex: 1,
  },
  achievementTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  achievementDescription: {
    ...TEXT_STYLES.caption,
    color: COLORS.textLight,
    marginBottom: SPACING.sm,
  },
  achievementProgress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementProgressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.background,
    marginRight: SPACING.sm,
  },
  achievementProgressText: {
    ...TEXT_STYLES.small,
    color: COLORS.textLight,
    minWidth: 40,
  },
  earnedBadge: {
    backgroundColor: COLORS.success,
  },
  earnedText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  encouragementGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  encouragementCard: {
    width: (width - 64) / 2,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    marginBottom: SPACING.sm,
  },
  encouragementTitle: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  encouragementText: {
    ...TEXT_STYLES.small,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 16,
  },
  modalContainer: {
    margin: SPACING.xl,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalGradient: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  modalQuoteText: {
    ...TEXT_STYLES.h2,
    color: COLORS.white,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 32,
    marginVertical: SPACING.lg,
  },
  modalButton: {
    marginTop: SPACING.md,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.motivation.joy,
  },
});

export default MotivationalTools;