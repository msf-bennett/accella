import React, { useState, useEffect, useCallback } from 'react';
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
  Searchbar,
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
  mood: {
    amazing: '#4CAF50',
    good: '#8BC34A',
    okay: '#FFC107',
    sad: '#FF9800',
    terrible: '#F44336',
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

const { width } = Dimensions.get('window');

const MentalWellness = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, mentalWellness } = useSelector((state) => state.user);
  
  const [refreshing, setRefreshing] = useState(false);
  const [currentMood, setCurrentMood] = useState(null);
  const [dailyStreak, setDailyStreak] = useState(7);
  const [wellnessPoints, setWellnessPoints] = useState(245);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [animatedValue] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const moods = [
    { id: 'amazing', emoji: '🤩', label: 'Amazing', color: COLORS.mood.amazing },
    { id: 'good', emoji: '😊', label: 'Good', color: COLORS.mood.good },
    { id: 'okay', emoji: '😐', label: 'Okay', color: COLORS.mood.okay },
    { id: 'sad', emoji: '😢', label: 'Sad', color: COLORS.mood.sad },
    { id: 'terrible', emoji: '😰', label: 'Tough', color: COLORS.mood.terrible },
  ];

  const wellnessActivities = [
    { id: 1, title: 'Breathing Exercise', icon: 'air', duration: '5 min', points: 10, type: 'breathing' },
    { id: 2, title: 'Gratitude Journal', icon: 'book', duration: '3 min', points: 15, type: 'journal' },
    { id: 3, title: 'Body Scan', icon: 'accessibility', duration: '8 min', points: 20, type: 'meditation' },
    { id: 4, title: 'Happy Playlist', icon: 'music-note', duration: '10 min', points: 10, type: 'music' },
    { id: 5, title: 'Nature Walk', icon: 'nature-people', duration: '15 min', points: 25, type: 'outdoor' },
    { id: 6, title: 'Drawing Time', icon: 'brush', duration: '12 min', points: 15, type: 'creative' },
  ];

  const achievements = [
    { id: 1, title: 'Mood Tracker', description: '7 days in a row!', icon: 'emoji-emotions', earned: true },
    { id: 2, title: 'Zen Master', description: '10 meditation sessions', icon: 'self-improvement', earned: true },
    { id: 3, title: 'Grateful Heart', description: '5 journal entries', icon: 'favorite', earned: false },
    { id: 4, title: 'Nature Lover', description: '3 outdoor activities', icon: 'park', earned: false },
  ];

  const handleMoodSelection = (mood) => {
    setCurrentMood(mood);
    // Add haptic feedback
    Alert.alert(
      'Mood Recorded! 🎉',
      `Thanks for sharing how you feel! You earned 5 wellness points.`,
      [{ text: 'Awesome!', style: 'default' }]
    );
  };

  const handleActivityStart = (activity) => {
    Alert.alert(
      'Coming Soon! 🚀',
      `The ${activity.title} feature is being built with love! It will include guided sessions, progress tracking, and fun rewards.`,
      [{ text: 'Can\'t Wait!', style: 'default' }]
    );
  };

  const renderMoodSelector = () => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <Icon name="mood" size={24} color={COLORS.primary} />
          <Text style={[TEXT_STYLES.h3, { marginLeft: SPACING.sm }]}>
            How are you feeling today? 😊
          </Text>
        </View>
        <View style={styles.moodContainer}>
          {moods.map((mood) => (
            <TouchableOpacity
              key={mood.id}
              style={[
                styles.moodButton,
                currentMood?.id === mood.id && { backgroundColor: mood.color + '20' }
              ]}
              onPress={() => handleMoodSelection(mood)}
            >
              <Text style={styles.moodEmoji}>{mood.emoji}</Text>
              <Text style={[styles.moodLabel, { color: mood.color }]}>
                {mood.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {currentMood && (
          <Surface style={styles.moodFeedback}>
            <Text style={styles.moodFeedbackText}>
              {currentMood.id === 'amazing' && "That's fantastic! Keep that positive energy! ⚡"}
              {currentMood.id === 'good' && "Great to hear! You're doing awesome! 🌟"}
              {currentMood.id === 'okay' && "Every day is a new chance to feel better! 💪"}
              {currentMood.id === 'sad' && "It's okay to feel sad sometimes. You're brave for sharing! 🤗"}
              {currentMood.id === 'terrible' && "Tough days make you stronger. We're here for you! 💙"}
            </Text>
          </Surface>
        )}
      </Card.Content>
    </Card>
  );

  const renderWellnessStats = () => (
    <Card style={styles.card}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.statsGradient}
      >
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Icon name="local-fire-department" size={32} color={COLORS.white} />
            <Text style={styles.statNumber}>{dailyStreak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Icon name="stars" size={32} color={COLORS.white} />
            <Text style={styles.statNumber}>{wellnessPoints}</Text>
            <Text style={styles.statLabel}>Wellness Points</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Icon name="jump-rope" size={32} color={COLORS.white} />
            <Text style={styles.statNumber}>
              {achievements.filter(a => a.earned).length}
            </Text>
            <Text style={styles.statLabel}>Badges Earned</Text>
          </View>
        </View>
      </LinearGradient>
    </Card>
  );

  const renderActivities = () => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <Icon name="psychology" size={24} color={COLORS.primary} />
          <Text style={[TEXT_STYLES.h3, { marginLeft: SPACING.sm }]}>
            Wellness Activities 🌈
          </Text>
        </View>
        <Text style={[TEXT_STYLES.caption, { color: COLORS.textLight, marginBottom: SPACING.md }]}>
          Choose an activity to boost your mood and earn points!
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {wellnessActivities.map((activity) => (
            <TouchableOpacity
              key={activity.id}
              style={styles.activityCard}
              onPress={() => handleActivityStart(activity)}
            >
              <Surface style={styles.activityIcon}>
                <Icon name={activity.icon} size={28} color={COLORS.primary} />
              </Surface>
              <Text style={styles.activityTitle}>{activity.title}</Text>
              <Text style={styles.activityDuration}>{activity.duration}</Text>
              <Chip
                mode="outlined"
                style={styles.pointsChip}
                textStyle={styles.pointsText}
              >
                +{activity.points} pts
              </Chip>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Card.Content>
    </Card>
  );

  const renderAchievements = () => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <Icon name="jump-rope" size={24} color={COLORS.primary} />
          <Text style={[TEXT_STYLES.h3, { marginLeft: SPACING.sm }]}>
            Your Badges 🏆
          </Text>
        </View>
        <View style={styles.achievementsGrid}>
          {achievements.map((achievement) => (
            <Surface
              key={achievement.id}
              style={[
                styles.achievementCard,
                !achievement.earned && styles.achievementCardLocked
              ]}
            >
              <Icon
                name={achievement.icon}
                size={32}
                color={achievement.earned ? COLORS.success : COLORS.textLight}
              />
              <Text style={[
                styles.achievementTitle,
                !achievement.earned && { color: COLORS.textLight }
              ]}>
                {achievement.title}
              </Text>
              <Text style={[
                styles.achievementDescription,
                !achievement.earned && { color: COLORS.textLight }
              ]}>
                {achievement.description}
              </Text>
              {achievement.earned && (
                <Chip
                  mode="flat"
                  style={styles.earnedChip}
                  textStyle={{ color: COLORS.white, fontSize: 10 }}
                >
                  EARNED ✨
                </Chip>
              )}
            </Surface>
          ))}
        </View>
      </Card.Content>
    </Card>
  );

  const renderQuickTips = () => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <Icon name="lightbulb" size={24} color={COLORS.primary} />
          <Text style={[TEXT_STYLES.h3, { marginLeft: SPACING.sm }]}>
            Quick Wellness Tips 💡
          </Text>
        </View>
        <View style={styles.tipsContainer}>
          <Surface style={styles.tipCard}>
            <Icon name="water-drop" size={20} color={COLORS.primary} />
            <Text style={styles.tipText}>
              Drink water regularly to stay hydrated and focused! 💧
            </Text>
          </Surface>
          <Surface style={styles.tipCard}>
            <Icon name="bedtime" size={20} color={COLORS.primary} />
            <Text style={styles.tipText}>
              Get 8-10 hours of sleep for better mood and energy! 😴
            </Text>
          </Surface>
          <Surface style={styles.tipCard}>
            <Icon name="directions-run" size={20} color={COLORS.primary} />
            <Text style={styles.tipText}>
              Move your body daily - dance, play, or stretch! 🏃‍♀️
            </Text>
          </Surface>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" translucent />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Mental Wellness 🧠✨</Text>
          <Text style={styles.headerSubtitle}>
            Take care of your mind, you're amazing! 💖
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
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
          {renderWellnessStats()}
          {renderMoodSelector()}
          {renderActivities()}
          {renderAchievements()}
          {renderQuickTips()}
        </Animated.View>
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="psychology"
        onPress={() => {
          Alert.alert(
            'Emergency Support 🚨',
            'If you need someone to talk to right away, ask a trusted adult like a parent, teacher, or counselor. You matter and help is always available! 💙',
            [{ text: 'Thank You', style: 'default' }]
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
  statsGradient: {
    borderRadius: 12,
    padding: SPACING.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    ...TEXT_STYLES.h2,
    color: COLORS.white,
    fontWeight: 'bold',
    marginTop: SPACING.xs,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: SPACING.xs,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.white,
    opacity: 0.3,
    marginHorizontal: SPACING.md,
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  moodButton: {
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: 12,
    minWidth: 60,
    margin: SPACING.xs,
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: SPACING.xs,
  },
  moodLabel: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
  },
  moodFeedback: {
    padding: SPACING.md,
    borderRadius: 8,
    backgroundColor: COLORS.primary + '10',
  },
  moodFeedbackText: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
  activityCard: {
    alignItems: 'center',
    padding: SPACING.md,
    marginRight: SPACING.md,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    elevation: 2,
    width: 120,
  },
  activityIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '15',
    marginBottom: SPACING.sm,
    elevation: 2,
  },
  activityTitle: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  activityDuration: {
    ...TEXT_STYLES.small,
    color: COLORS.textLight,
    marginBottom: SPACING.sm,
  },
  pointsChip: {
    backgroundColor: COLORS.success + '20',
    borderColor: COLORS.success,
  },
  pointsText: {
    color: COLORS.success,
    fontSize: 12,
    fontWeight: 'bold',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementCard: {
    width: (width - 64) / 2,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: SPACING.md,
    elevation: 2,
  },
  achievementCardLocked: {
    opacity: 0.5,
  },
  achievementTitle: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  achievementDescription: {
    ...TEXT_STYLES.small,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  earnedChip: {
    backgroundColor: COLORS.success,
  },
  tipsContainer: {
    gap: SPACING.sm,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 8,
    elevation: 1,
    backgroundColor: COLORS.white,
  },
  tipText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.sm,
    flex: 1,
    color: COLORS.text,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.error,
  },
});

export default MentalWellness;