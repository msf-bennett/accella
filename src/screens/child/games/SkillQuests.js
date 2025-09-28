import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Animated,
  RefreshControl,
  Alert,
  StatusBar,
  Dimensions,
  TouchableOpacity,
  Vibration,
  Text as RNText,
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
  Searchbar,
  Portal,
  Text,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Design System Constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#f44336',
  warning: '#ff9800',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  accent: '#ff6b6b',
  gold: '#ffd700',
  silver: '#c0c0c0',
  bronze: '#cd7f32',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subheading: {
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
    color: COLORS.textSecondary,
  },
};

const { width, height } = Dimensions.get('window');

// Mock data for skill quests
const SKILL_CATEGORIES = [
  {
    id: 'football',
    name: 'Football ⚽',
    color: '#4CAF50',
    icon: 'sports-soccer',
    quests: 15,
    completed: 8,
    level: 3,
    xp: 1250,
  },
  {
    id: 'basketball',
    name: 'Basketball 🏀',
    color: '#ff9800',
    icon: 'sports-basketball',
    quests: 12,
    completed: 5,
    level: 2,
    xp: 750,
  },
  {
    id: 'tennis',
    name: 'Tennis 🎾',
    color: '#2196F3',
    icon: 'sports-tennis',
    quests: 10,
    completed: 3,
    level: 1,
    xp: 300,
  },
  {
    id: 'swimming',
    name: 'Swimming 🏊',
    color: '#00BCD4',
    icon: 'pool',
    quests: 8,
    completed: 1,
    level: 1,
    xp: 150,
  },
];

const ACTIVE_QUESTS = [
  {
    id: 'dribbling_master',
    title: 'Dribbling Master',
    description: 'Complete 100 successful dribbles',
    category: 'Football',
    difficulty: 'Easy',
    progress: 75,
    maxProgress: 100,
    reward: '50 XP + ⚽ Badge',
    timeLeft: '2 days',
    icon: 'sports-soccer',
    color: COLORS.success,
  },
  {
    id: 'free_throw_champion',
    title: 'Free Throw Champion',
    description: 'Make 25 free throws in a row',
    category: 'Basketball',
    difficulty: 'Medium',
    progress: 18,
    maxProgress: 25,
    reward: '100 XP + 🏀 Badge',
    timeLeft: '5 days',
    icon: 'sports-basketball',
    color: COLORS.warning,
  },
  {
    id: 'endurance_runner',
    title: 'Endurance Runner',
    description: 'Run 5km without stopping',
    category: 'Fitness',
    difficulty: 'Hard',
    progress: 3.2,
    maxProgress: 5,
    reward: '200 XP + 🏃 Badge',
    timeLeft: '1 week',
    icon: 'directions-run',
    color: COLORS.error,
  },
];

const ACHIEVEMENTS = [
  {
    id: 'first_quest',
    title: 'First Steps',
    description: 'Complete your first quest',
    icon: 'jump-rope',
    color: COLORS.gold,
    unlocked: true,
    date: '2024-08-20',
  },
  {
    id: 'week_streak',
    title: 'Week Warrior',
    description: '7 days training streak',
    icon: 'local-fire-department',
    color: COLORS.accent,
    unlocked: true,
    date: '2024-08-25',
  },
  {
    id: 'skill_master',
    title: 'Skill Master',
    description: 'Reach level 5 in any skill',
    icon: 'military-tech',
    color: COLORS.silver,
    unlocked: false,
    date: null,
  },
];

const DAILY_CHALLENGES = [
  {
    id: 'daily_1',
    title: 'Morning Warm-up',
    description: '10 minutes of stretching',
    reward: '25 XP',
    completed: false,
    icon: 'self-improvement',
  },
  {
    id: 'daily_2',
    title: 'Skill Practice',
    description: 'Practice any skill for 20 minutes',
    reward: '50 XP',
    completed: true,
    icon: 'fitness-center',
  },
  {
    id: 'daily_3',
    title: 'Hydration Hero',
    description: 'Drink 8 glasses of water',
    reward: '15 XP',
    completed: false,
    icon: 'local-drink',
  },
];

const SkillQuest = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector(state => state.auth);
  
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAchievements, setShowAchievements] = useState(false);
  const [userLevel, setUserLevel] = useState(5);
  const [userXP, setUserXP] = useState(2450);
  const [currentStreak, setCurrentStreak] = useState(7);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const streakAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animations
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
    ]).start();

    // Streak fire animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Streak counter animation
    Animated.timing(streakAnim, {
      toValue: currentStreak,
      duration: 2000,
      useNativeDriver: false,
    }).start();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
    Vibration.vibrate(50);
  }, []);

  const handleQuestPress = (quest) => {
    Vibration.vibrate(30);
    Alert.alert(
      `${quest.title} 🎯`,
      `${quest.description}\n\nProgress: ${quest.progress}/${quest.maxProgress}\nReward: ${quest.reward}\nTime Left: ${quest.timeLeft}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'View Details', onPress: () => console.log('Quest details') },
        { text: 'Start Training', onPress: () => console.log('Start training') },
      ]
    );
  };

  const handleCategoryPress = (category) => {
    Vibration.vibrate(30);
    setSelectedCategory(category.id);
    Alert.alert(
      `${category.name} Skills`,
      `Level ${category.level} • ${category.xp} XP\n\nProgress: ${category.completed}/${category.quests} quests completed\n\nReady to level up your ${category.name.toLowerCase()} skills?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'View Quests', onPress: () => console.log(`View ${category.name} quests`) },
        { text: 'Start Training', onPress: () => console.log(`Start ${category.name} training`) },
      ]
    );
  };

  const handleDailyChallengePress = (challenge) => {
    if (challenge.completed) return;
    
    Vibration.vibrate(50);
    Alert.alert(
      `${challenge.title} 💪`,
      `${challenge.description}\n\nReward: ${challenge.reward}\n\nReady to complete this challenge?`,
      [
        { text: 'Later', style: 'cancel' },
        { text: 'Complete Now', onPress: () => {
          // Mark challenge as completed
          console.log('Challenge completed');
          Vibration.vibrate([50, 100, 50]);
        }},
      ]
    );
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={styles.header}
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={styles.headerContent}>
        <View style={styles.profileSection}>
          <Avatar.Image
            size={60}
            source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face' }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.welcomeText}>Welcome back! 👋</Text>
            <Text style={styles.userName}>{user?.name || 'Champion'}</Text>
            <View style={styles.levelInfo}>
              <MaterialIcons name="star" size={16} color={COLORS.gold} />
              <Text style={styles.levelText}>Level {userLevel}</Text>
              <Text style={styles.xpText}>• {userXP} XP</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.streakSection}>
          <Animated.View style={[styles.streakContainer, { transform: [{ scale: pulseAnim }] }]}>
            <MaterialIcons name="local-fire-department" size={24} color={COLORS.accent} />
            <Animated.Text style={styles.streakText}>
              {streakAnim}
            </Animated.Text>
          </Animated.View>
          <Text style={styles.streakLabel}>Day Streak 🔥</Text>
        </View>
      </View>
    </LinearGradient>
  );

  const renderSearchBar = () => (
    <Surface style={styles.searchContainer}>
      <Searchbar
        placeholder="Search quests, skills, challenges..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        inputStyle={styles.searchInput}
        iconColor={COLORS.primary}
        placeholderTextColor={COLORS.textSecondary}
      />
    </Surface>
  );

  const renderQuickStats = () => (
    <View style={styles.quickStatsContainer}>
      <Surface style={[styles.statCard, { backgroundColor: COLORS.success + '20' }]}>
        <MaterialIcons name="assignment-turned-in" size={24} color={COLORS.success} />
        <Text style={styles.statNumber}>12</Text>
        <Text style={styles.statLabel}>Completed</Text>
      </Surface>
      
      <Surface style={[styles.statCard, { backgroundColor: COLORS.warning + '20' }]}>
        <MaterialIcons name="schedule" size={24} color={COLORS.warning} />
        <Text style={styles.statNumber}>3</Text>
        <Text style={styles.statLabel}>In Progress</Text>
      </Surface>
      
      <Surface style={[styles.statCard, { backgroundColor: COLORS.primary + '20' }]}>
        <MaterialIcons name="jump-rope" size={24} color={COLORS.primary} />
        <Text style={styles.statNumber}>8</Text>
        <Text style={styles.statLabel}>Achievements</Text>
      </Surface>
    </View>
  );

  const renderSkillCategories = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Skill Categories 🎯</Text>
        <TouchableOpacity onPress={() => console.log('View all categories')}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {SKILL_CATEGORIES.map((category, index) => (
          <TouchableOpacity
            key={category.id}
            onPress={() => handleCategoryPress(category)}
            activeOpacity={0.8}
          >
            <Animated.View
              style={[
                styles.categoryCard,
                {
                  transform: [
                    {
                      translateY: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0],
                      }),
                    },
                  ],
                  opacity: fadeAnim,
                },
              ]}
            >
              <LinearGradient
                colors={[category.color, category.color + 'CC']}
                style={styles.categoryGradient}
              >
                <MaterialIcons name={category.icon} size={32} color="white" />
                <Text style={styles.categoryName}>{category.name}</Text>
                <View style={styles.categoryStats}>
                  <Text style={styles.categoryLevel}>Level {category.level}</Text>
                  <Text style={styles.categoryProgress}>
                    {category.completed}/{category.quests}
                  </Text>
                </View>
                <ProgressBar
                  progress={category.completed / category.quests}
                  color="white"
                  style={styles.categoryProgressBar}
                />
              </LinearGradient>
            </Animated.View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderActiveQuests = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Active Quests ⚡</Text>
        <TouchableOpacity onPress={() => console.log('View all quests')}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>
      
      {ACTIVE_QUESTS.map((quest, index) => (
        <TouchableOpacity
          key={quest.id}
          onPress={() => handleQuestPress(quest)}
          activeOpacity={0.9}
        >
          <Animated.View
            style={[
              styles.questCard,
              {
                transform: [{ translateX: slideAnim }],
                opacity: fadeAnim,
              },
            ]}
          >
            <Card style={styles.questCardContent}>
              <View style={styles.questHeader}>
                <View style={[styles.questIcon, { backgroundColor: quest.color + '20' }]}>
                  <MaterialIcons name={quest.icon} size={24} color={quest.color} />
                </View>
                <View style={styles.questInfo}>
                  <Text style={styles.questTitle}>{quest.title}</Text>
                  <Text style={styles.questDescription}>{quest.description}</Text>
                  <View style={styles.questMeta}>
                    <Chip
                      mode="outlined"
                      compact
                      textStyle={styles.chipText}
                      style={[styles.difficultyChip, {
                        borderColor: quest.difficulty === 'Easy' ? COLORS.success :
                                   quest.difficulty === 'Medium' ? COLORS.warning : COLORS.error
                      }]}
                    >
                      {quest.difficulty}
                    </Chip>
                    <Text style={styles.timeLeft}>⏰ {quest.timeLeft}</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.questProgress}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressText}>
                    {typeof quest.progress === 'number' && quest.progress % 1 !== 0
                      ? quest.progress.toFixed(1)
                      : quest.progress} / {quest.maxProgress}
                  </Text>
                  <Text style={styles.rewardText}>{quest.reward}</Text>
                </View>
                <ProgressBar
                  progress={quest.progress / quest.maxProgress}
                  color={quest.color}
                  style={styles.questProgressBar}
                />
              </View>
            </Card>
          </Animated.View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderDailyChallenges = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Daily Challenges 🌟</Text>
        <Text style={styles.challengesSubtitle}>Reset in 16h 42m</Text>
      </View>
      
      <View style={styles.challengesGrid}>
        {DAILY_CHALLENGES.map((challenge, index) => (
          <TouchableOpacity
            key={challenge.id}
            onPress={() => handleDailyChallengePress(challenge)}
            activeOpacity={0.8}
            disabled={challenge.completed}
          >
            <Surface style={[
              styles.challengeCard,
              challenge.completed && styles.challengeCompleted
            ]}>
              <MaterialIcons
                name={challenge.icon}
                size={28}
                color={challenge.completed ? COLORS.success : COLORS.primary}
              />
              <Text style={[
                styles.challengeTitle,
                challenge.completed && styles.challengeTitleCompleted
              ]}>
                {challenge.title}
              </Text>
              <Text style={[
                styles.challengeDescription,
                challenge.completed && styles.challengeDescriptionCompleted
              ]}>
                {challenge.description}
              </Text>
              <View style={styles.challengeReward}>
                <Text style={[
                  styles.challengeRewardText,
                  challenge.completed && styles.challengeRewardCompleted
                ]}>
                  {challenge.reward}
                </Text>
                {challenge.completed && (
                  <MaterialIcons name="check-circle" size={16} color={COLORS.success} />
                )}
              </View>
            </Surface>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderAchievements = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Achievements 🏆</Text>
        <TouchableOpacity onPress={() => setShowAchievements(true)}>
          <Text style={styles.seeAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.achievementsContainer}
      >
        {ACHIEVEMENTS.map((achievement, index) => (
          <Surface
            key={achievement.id}
            style={[
              styles.achievementCard,
              !achievement.unlocked && styles.achievementLocked
            ]}
          >
            <MaterialIcons
              name={achievement.icon}
              size={32}
              color={achievement.unlocked ? achievement.color : COLORS.textSecondary}
            />
            <Text style={[
              styles.achievementTitle,
              !achievement.unlocked && styles.achievementTitleLocked
            ]}>
              {achievement.title}
            </Text>
            <Text style={[
              styles.achievementDescription,
              !achievement.unlocked && styles.achievementDescriptionLocked
            ]}>
              {achievement.description}
            </Text>
            {achievement.unlocked && achievement.date && (
              <Text style={styles.achievementDate}>{achievement.date}</Text>
            )}
          </Surface>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <Animated.ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
            title="Pull to refresh"
            titleColor={COLORS.textSecondary}
          />
        }
      >
        {renderSearchBar()}
        {renderQuickStats()}
        {renderSkillCategories()}
        {renderActiveQuests()}
        {renderDailyChallenges()}
        {renderAchievements()}
        
        <View style={styles.bottomSpacing} />
      </Animated.ScrollView>

      <FAB
        style={styles.fab}
        icon="add"
        color="white"
        onPress={() => {
          Vibration.vibrate(50);
          Alert.alert(
            "Create New Quest 🎯",
            "What would you like to work on today?",
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Custom Quest', onPress: () => console.log('Custom quest') },
              { text: 'Browse Templates', onPress: () => console.log('Quest templates') },
            ]
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
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    marginRight: SPACING.md,
  },
  profileInfo: {
    flex: 1,
  },
  welcomeText: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
  },
  userName: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 2,
  },
  levelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 4,
    fontWeight: '600',
  },
  xpText: {
    color: 'white',
    fontSize: 14,
    opacity: 0.8,
    marginLeft: 4,
  },
  streakSection: {
    alignItems: 'center',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
  },
  streakText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: SPACING.sm,
  },
  streakLabel: {
    color: 'white',
    fontSize: 12,
    marginTop: SPACING.xs,
    opacity: 0.8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 80,
  },
  searchContainer: {
    margin: SPACING.md,
    elevation: 2,
  },
  searchBar: {
    backgroundColor: COLORS.surface,
  },
  searchInput: {
    fontSize: 16,
  },
  quickStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.md,
    marginHorizontal: SPACING.xs,
    borderRadius: 12,
    elevation: 1,
  },
  statNumber: {
    ...TEXT_STYLES.heading,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    fontSize: 12,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.subheading,
  },
  seeAllText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  challengesSubtitle: {
    ...TEXT_STYLES.caption,
    fontSize: 12,
  },
  categoriesContainer: {
    paddingLeft: SPACING.md,
  },
  categoryCard: {
    width: 140,
    height: 120,
    marginRight: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
  },
  categoryGradient: {
    flex: 1,
    padding: SPACING.md,
    justifyContent: 'space-between',
  },
  categoryName: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginTop: SPACING.sm,
  },
  categoryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryLevel: {
    color: 'white',
    fontSize: 12,
    opacity: 0.9,
  },
  categoryProgress: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  categoryProgressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginTop: SPACING.xs,
  },
  questCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  questCardContent: {
    padding: SPACING.md,
  },
  questHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  questIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  questInfo: {
    flex: 1,
  },
  questTitle: {
    ...TEXT_STYLES.subheading,
    fontSize: 16,
    marginBottom: SPACING.xs,
  },
  questDescription: {
    ...TEXT_STYLES.body,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  questMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyChip: {
    height: 24,
    marginRight: SPACING.sm,
  },
  chipText: {
    fontSize: 10,
    margin: 0,
  },
  timeLeft: {
    ...TEXT_STYLES.caption,
    fontSize: 12,
  },
  questProgress: {
    marginTop: SPACING.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  progressText: {
    ...TEXT_STYLES.body,
    fontSize: 14,
    fontWeight: '600',
  },
  rewardText: {
    ...TEXT_STYLES.caption,
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  questProgressBar: {
    height: 6,
    backgroundColor: COLORS.background,
  },
  challengesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
  },
  challengeCard: {
    width: '48%',
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.md,
    alignItems: 'center',
    elevation: 1,
    backgroundColor: COLORS.surface,
  },
  challengeCompleted: {
    backgroundColor: COLORS.success + '10',
    borderColor: COLORS.success + '30',
    borderWidth: 1,
  },
  challengeTitle: {
    ...TEXT_STYLES.body,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  challengeTitleCompleted: {
    color: COLORS.success,
  },
  challengeDescription: {
    ...TEXT_STYLES.caption,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  challengeDescriptionCompleted: {
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
  },
  challengeReward: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  challengeRewardText: {
    ...TEXT_STYLES.caption,
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
  },
  challengeRewardCompleted: {
    color: COLORS.success,
    marginRight: SPACING.xs,
  },
  achievementsContainer: {
    paddingLeft: SPACING.md,
  },
  achievementCard: {
    width: 120,
    height: 140,
    padding: SPACING.md,
    marginRight: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
    backgroundColor: COLORS.surface,
  },
  achievementLocked: {
    backgroundColor: COLORS.background,
    opacity: 0.7,
  },
  achievementTitle: {
    ...TEXT_STYLES.body,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  achievementTitleLocked: {
    color: COLORS.textSecondary,
  },
  achievementDescription: {
    ...TEXT_STYLES.caption,
    fontSize: 11,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  achievementDescriptionLocked: {
    color: COLORS.textSecondary,
  },
  achievementDate: {
    ...TEXT_STYLES.caption,
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '500',
  },
  bottomSpacing: {
    height: SPACING.xl,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default SkillQuest;
    