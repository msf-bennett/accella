import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Animated,
  TouchableOpacity,
  Dimensions,
  Alert,
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
  Searchbar,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Design system imports
import { COLORS, SPACING, TEXT_STYLES } from '../styles/designSystem';

const { width, height } = Dimensions.get('window');

const SkillChallenges = ({ navigation }) => {
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('challenges');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  // Redux state
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const challenges = useSelector(state => state.challenges.challenges);
  const userProgress = useSelector(state => state.progress.skillProgress);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Mock data for challenges
  const mockChallenges = [
    {
      id: 1,
      title: 'Perfect Free Throws 🎯',
      description: 'Make 8 out of 10 free throws in a row',
      category: 'basketball',
      difficulty: 'intermediate',
      points: 150,
      timeLimit: '10 min',
      completed: false,
      progress: 0.6,
      icon: 'sports-basketball',
      participants: 1240,
      completionRate: '67%',
      rewards: ['150 XP', 'Free Throw Master Badge'],
      videoUrl: 'drill_demo_1.mp4',
    },
    {
      id: 2,
      title: 'Speed Dribbling Master ⚡',
      description: 'Complete cone dribbling drill under 30 seconds',
      category: 'basketball',
      difficulty: 'advanced',
      points: 200,
      timeLimit: '30 sec',
      completed: false,
      progress: 0.3,
      icon: 'directions-run',
      participants: 890,
      completionRate: '43%',
      rewards: ['200 XP', 'Speed Demon Badge', 'Unlock: Advanced Drills'],
      videoUrl: 'drill_demo_2.mp4',
    },
    {
      id: 3,
      title: 'Endurance Runner 🏃‍♂️',
      description: 'Run 5km under 25 minutes',
      category: 'fitness',
      difficulty: 'intermediate',
      points: 175,
      timeLimit: '25 min',
      completed: true,
      progress: 1.0,
      icon: 'directions-run',
      participants: 2100,
      completionRate: '78%',
      rewards: ['175 XP', 'Endurance Champion Badge'],
      completedDate: '2 days ago',
    },
    {
      id: 4,
      title: 'Football Juggling Pro ⚽',
      description: 'Keep the ball in the air for 50+ touches',
      category: 'football',
      difficulty: 'beginner',
      points: 100,
      timeLimit: 'No limit',
      completed: false,
      progress: 0.8,
      icon: 'sports-soccer',
      participants: 1560,
      completionRate: '72%',
      rewards: ['100 XP', 'Ball Control Badge'],
      videoUrl: 'drill_demo_3.mp4',
    },
    {
      id: 5,
      title: 'Tennis Serve Accuracy 🎾',
      description: 'Hit 7/10 serves in the service box',
      category: 'tennis',
      difficulty: 'intermediate',
      points: 140,
      timeLimit: '15 min',
      completed: false,
      progress: 0.4,
      icon: 'sports-tennis',
      participants: 670,
      completionRate: '59%',
      rewards: ['140 XP', 'Ace Server Badge'],
      videoUrl: 'drill_demo_4.mp4',
    },
  ];

  const categories = [
    { id: 'all', name: 'All Sports', icon: 'sports', count: 25 },
    { id: 'basketball', name: 'Basketball', icon: 'sports-basketball', count: 8 },
    { id: 'football', name: 'Football', icon: 'sports-soccer', count: 6 },
    { id: 'tennis', name: 'Tennis', icon: 'sports-tennis', count: 4 },
    { id: 'fitness', name: 'Fitness', icon: 'fitness-center', count: 7 },
  ];

  const difficulties = [
    { id: 'all', name: 'All Levels', color: COLORS.primary },
    { id: 'beginner', name: 'Beginner', color: COLORS.success },
    { id: 'intermediate', name: 'Intermediate', color: '#ff9800' },
    { id: 'advanced', name: 'Advanced', color: COLORS.error },
  ];

  // Component lifecycle
  useEffect(() => {
    initializeAnimations();
    // Simulate loading challenges
    // dispatch(fetchChallenges());
  }, []);

  const initializeAnimations = () => {
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
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Event handlers
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      Vibration.vibrate(50);
    }, 1500);
  }, []);

  const handleChallengePress = (challenge) => {
    Vibration.vibrate(30);
    if (challenge.completed) {
      Alert.alert(
        "Challenge Completed! 🎉",
        `You already completed this challenge ${challenge.completedDate}. Want to try again for bonus points?`,
        [
          { text: "View Results", style: "default" },
          { text: "Retry Challenge", style: "default" },
          { text: "Cancel", style: "cancel" }
        ]
      );
    } else {
      Alert.alert(
        "Start Challenge? 🚀",
        `Ready to take on "${challenge.title}"?\n\nRewards: ${challenge.rewards.join(', ')}`,
        [
          { text: "View Details", style: "default" },
          { text: "Start Now!", style: "default" },
          { text: "Cancel", style: "cancel" }
        ]
      );
    }
  };

  const handleVideoDemo = (challenge) => {
    Vibration.vibrate(30);
    Alert.alert(
      "Video Demo 📹",
      `Watch demonstration video for "${challenge.title}"?`,
      [
        { text: "Watch Now", style: "default" },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const getDifficultyColor = (difficulty) => {
    const difficultyObj = difficulties.find(d => d.id === difficulty);
    return difficultyObj ? difficultyObj.color : COLORS.primary;
  };

  const filteredChallenges = mockChallenges.filter(challenge => {
    const matchesSearch = challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         challenge.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || challenge.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || challenge.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  // Render components
  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.header}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <Text style={[TEXT_STYLES.h2, { color: 'white' }]}>
            Skill Challenges 💪
          </Text>
          <IconButton
            icon="trophy"
            iconColor="white"
            size={28}
            onPress={() => Alert.alert("Achievements", "Feature coming soon!")}
          />
        </View>
        <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.9)', marginTop: SPACING.xs }]}>
          Level up your skills with fun challenges
        </Text>
        
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <Surface style={styles.statCard}>
            <Icon name="jump-rope" size={20} color={COLORS.primary} />
            <Text style={[TEXT_STYLES.caption, styles.statLabel]}>Completed</Text>
            <Text style={[TEXT_STYLES.h3, styles.statValue]}>12</Text>
          </Surface>
          <Surface style={styles.statCard}>
            <Icon name="local-fire-department" size={20} color="#ff5722" />
            <Text style={[TEXT_STYLES.caption, styles.statLabel]}>Streak</Text>
            <Text style={[TEXT_STYLES.h3, styles.statValue]}>7 days</Text>
          </Surface>
          <Surface style={styles.statCard}>
            <Icon name="star" size={20} color="#ffc107" />
            <Text style={[TEXT_STYLES.caption, styles.statLabel]}>Points</Text>
            <Text style={[TEXT_STYLES.h3, styles.statValue]}>2,840</Text>
          </Surface>
        </View>
      </View>
    </LinearGradient>
  );

  const renderSearchAndFilters = () => (
    <View style={styles.searchContainer}>
      <Searchbar
        placeholder="Search challenges..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
        iconColor={COLORS.primary}
      />
      
      {/* Category Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipContainer}
      >
        {categories.map((category) => (
          <Chip
            key={category.id}
            selected={selectedCategory === category.id}
            onPress={() => setSelectedCategory(category.id)}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && { backgroundColor: COLORS.primary }
            ]}
            textStyle={{
              color: selectedCategory === category.id ? 'white' : COLORS.text
            }}
            icon={category.icon}
          >
            {category.name} ({category.count})
          </Chip>
        ))}
      </ScrollView>

      {/* Difficulty Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.chipContainer, { paddingTop: SPACING.xs }]}
      >
        {difficulties.map((difficulty) => (
          <Chip
            key={difficulty.id}
            selected={selectedDifficulty === difficulty.id}
            onPress={() => setSelectedDifficulty(difficulty.id)}
            style={[
              styles.difficultyChip,
              selectedDifficulty === difficulty.id && { backgroundColor: difficulty.color }
            ]}
            textStyle={{
              color: selectedDifficulty === difficulty.id ? 'white' : difficulty.color
            }}
          >
            {difficulty.name}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const renderChallengeCard = (challenge) => (
    <Animated.View
      key={challenge.id}
      style={[
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }
      ]}
    >
      <Card style={styles.challengeCard}>
        <View style={styles.cardHeader}>
          <View style={styles.challengeInfo}>
            <View style={styles.titleRow}>
              <Icon name={challenge.icon} size={24} color={COLORS.primary} />
              <Text style={[TEXT_STYLES.h4, styles.challengeTitle]}>
                {challenge.title}
              </Text>
              {challenge.completed && (
                <Icon name="check-circle" size={20} color={COLORS.success} />
              )}
            </View>
            <Text style={[TEXT_STYLES.body, styles.challengeDescription]}>
              {challenge.description}
            </Text>
          </View>
          
          <TouchableOpacity
            style={styles.videoButton}
            onPress={() => handleVideoDemo(challenge)}
            activeOpacity={0.7}
          >
            <Icon name="play-circle-filled" size={32} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        {!challenge.completed && challenge.progress > 0 && (
          <View style={styles.progressContainer}>
            <Text style={[TEXT_STYLES.caption, styles.progressLabel]}>
              Progress: {Math.round(challenge.progress * 100)}%
            </Text>
            <ProgressBar
              progress={challenge.progress}
              color={COLORS.primary}
              style={styles.progressBar}
            />
          </View>
        )}

        {/* Challenge Meta */}
        <View style={styles.challengeMeta}>
          <View style={styles.metaRow}>
            <Chip
              style={[styles.difficultyTag, { backgroundColor: getDifficultyColor(challenge.difficulty) + '20' }]}
              textStyle={{ color: getDifficultyColor(challenge.difficulty), fontSize: 12 }}
            >
              {challenge.difficulty.toUpperCase()}
            </Chip>
            <View style={styles.metaInfo}>
              <Icon name="schedule" size={16} color={COLORS.textSecondary} />
              <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs }]}>
                {challenge.timeLimit}
              </Text>
            </View>
            <View style={styles.metaInfo}>
              <Icon name="people" size={16} color={COLORS.textSecondary} />
              <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs }]}>
                {challenge.participants}
              </Text>
            </View>
          </View>

          <View style={styles.rewardRow}>
            <Icon name="stars" size={16} color="#ffc107" />
            <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs, flex: 1 }]}>
              {challenge.rewards.join(' • ')}
            </Text>
          </View>
        </View>

        {/* Action Button */}
        <Button
          mode={challenge.completed ? "outlined" : "contained"}
          onPress={() => handleChallengePress(challenge)}
          style={styles.actionButton}
          icon={challenge.completed ? "refresh" : "play-arrow"}
          buttonColor={challenge.completed ? 'transparent' : COLORS.primary}
          textColor={challenge.completed ? COLORS.primary : 'white'}
        >
          {challenge.completed ? 'Try Again' : 'Start Challenge'}
        </Button>
      </Card>
    </Animated.View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="search-off" size={64} color={COLORS.textSecondary} />
      <Text style={[TEXT_STYLES.h3, styles.emptyTitle]}>No challenges found</Text>
      <Text style={[TEXT_STYLES.body, styles.emptySubtitle]}>
        Try adjusting your search or filters
      </Text>
      <Button
        mode="outlined"
        onPress={() => {
          setSearchQuery('');
          setSelectedCategory('all');
          setSelectedDifficulty('all');
        }}
        style={{ marginTop: SPACING.md }}
      >
        Clear Filters
      </Button>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <ScrollView
        style={styles.content}
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
        {renderSearchAndFilters()}
        
        <View style={styles.challengesContainer}>
          {filteredChallenges.length > 0 ? (
            <>
              <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
                {filteredChallenges.length} Challenge{filteredChallenges.length !== 1 ? 's' : ''} Available
              </Text>
              {filteredChallenges.map(renderChallengeCard)}
            </>
          ) : (
            renderEmptyState()
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => Alert.alert("Create Challenge", "Feature coming soon! 🚀")}
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
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    marginTop: SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: SPACING.xs,
    elevation: 2,
  },
  statLabel: {
    marginTop: SPACING.xs,
    color: COLORS.textSecondary,
  },
  statValue: {
    marginTop: SPACING.xs,
    color: COLORS.text,
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    padding: SPACING.lg,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchbar: {
    backgroundColor: COLORS.background,
    elevation: 0,
  },
  chipContainer: {
    paddingVertical: SPACING.md,
  },
  categoryChip: {
    marginRight: SPACING.sm,
    backgroundColor: 'white',
  },
  difficultyChip: {
    marginRight: SPACING.sm,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  challengesContainer: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    marginBottom: SPACING.lg,
    color: COLORS.text,
  },
  challengeCard: {
    marginBottom: SPACING.lg,
    backgroundColor: 'white',
    elevation: 3,
    borderRadius: 16,
    padding: SPACING.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  challengeInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  challengeTitle: {
    marginLeft: SPACING.sm,
    flex: 1,
    color: COLORS.text,
  },
  challengeDescription: {
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  videoButton: {
    padding: SPACING.xs,
  },
  progressContainer: {
    marginBottom: SPACING.md,
  },
  progressLabel: {
    marginBottom: SPACING.sm,
    color: COLORS.textSecondary,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  challengeMeta: {
    marginBottom: SPACING.lg,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  difficultyTag: {
    marginRight: SPACING.md,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    borderRadius: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyTitle: {
    marginTop: SPACING.lg,
    color: COLORS.textSecondary,
  },
  emptySubtitle: {
    marginTop: SPACING.sm,
    textAlign: 'center',
    color: COLORS.textSecondary,
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.lg,
    backgroundColor: COLORS.primary,
  },
});

export default SkillChallenges;