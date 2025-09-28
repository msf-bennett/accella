import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
  Alert,
  Vibration,
  Animated,
  Dimensions,
  TouchableOpacity,
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
  Searchbar,
  Badge,
} from 'react-native-paper';
import { Text } from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../../../constants/theme';

const { width } = Dimensions.get('window');

const LearningCenter = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { learningProgress, achievements } = useSelector(state => state.learning);

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('overview');
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  // Mock learning data
  const learningStats = {
    totalXP: 2450,
    currentLevel: 12,
    nextLevelXP: 2800,
    weeklyGoal: 300,
    weeklyProgress: 180,
    streak: 7,
    completedCourses: 8,
    certificates: 3,
    hoursLearned: 45.5,
  };

  const recentAchievements = [
    {
      id: 1,
      title: 'Speed Demon',
      description: 'Completed 5 sprint training videos',
      icon: 'speed',
      rarity: 'gold',
      xp: 250,
      unlockedDate: '2024-01-25',
      isNew: true,
    },
    {
      id: 2,
      title: 'Knowledge Seeker',
      description: 'Watched 10 expert interviews',
      icon: 'school',
      rarity: 'silver',
      xp: 150,
      unlockedDate: '2024-01-23',
      isNew: false,
    },
    {
      id: 3,
      title: 'Nutrition Guru',
      description: 'Completed nutrition certification',
      icon: 'restaurant',
      rarity: 'diamond',
      xp: 500,
      unlockedDate: '2024-01-20',
      isNew: false,
    },
  ];

  const quickActions = [
    {
      id: 1,
      title: 'Certificate Programs',
      icon: 'school',
      color: COLORS.primary,
      screen: 'CertificatePrograms',
      count: 12,
      badge: 'New',
    },
    {
      id: 2,
      title: 'Expert Interviews',
      icon: 'video_call',
      color: '#FF6B35',
      screen: 'ExpertInterviews',
      count: 25,
      badge: null,
    },
    {
      id: 3,
      title: 'Skill Assessments',
      icon: 'quiz',
      color: '#4ECDC4',
      screen: 'SkillAssessments',
      count: 8,
      badge: 'Popular',
    },
    {
      id: 4,
      title: 'Study Materials',
      icon: 'library_books',
      color: '#45B7D1',
      screen: 'StudyMaterials',
      count: 156,
      badge: null,
    },
    {
      id: 5,
      title: 'Practice Tests',
      icon: 'assignment',
      color: '#96CEB4',
      screen: 'PracticeTests',
      count: 15,
      badge: null,
    },
    {
      id: 6,
      title: 'Learning Goals',
      icon: 'flag',
      color: '#FFEAA7',
      screen: 'LearningGoals',
      count: 5,
      badge: 'Track',
    },
  ];

  const continueWatching = [
    {
      id: 1,
      title: 'Mental Performance Mastery',
      type: 'Certificate Program',
      progress: 0.65,
      timeRemaining: '2h 15m',
      thumbnail: 'psychology',
      color: '#9C27B0',
      lastWatched: '2 hours ago',
    },
    {
      id: 2,
      title: 'Nutrition for Endurance Athletes',
      type: 'Expert Interview',
      progress: 0.35,
      timeRemaining: '18m',
      thumbnail: 'restaurant',
      color: '#4CAF50',
      lastWatched: '1 day ago',
    },
    {
      id: 3,
      title: 'Strength Training Fundamentals',
      type: 'Course',
      progress: 0.80,
      timeRemaining: '45m',
      thumbnail: 'fitness_center',
      color: '#FF5722',
      lastWatched: '3 days ago',
    },
  ];

  const recommendedContent = [
    {
      id: 1,
      title: 'Advanced Recovery Techniques',
      type: 'Interview',
      expert: 'Dr. Sarah Johnson',
      duration: '42:15',
      rating: 4.9,
      thumbnail: 'healing',
      difficulty: 'Advanced',
      tags: ['Recovery', 'Performance'],
    },
    {
      id: 2,
      title: 'Sports Psychology Certification',
      type: 'Program',
      provider: 'Elite Academy',
      modules: 16,
      rating: 4.8,
      thumbnail: 'psychology',
      difficulty: 'Intermediate',
      tags: ['Mental Health', 'Performance'],
    },
  ];

  const tabs = [
    { id: 'overview', title: 'Overview', icon: 'dashboard' },
    { id: 'progress', title: 'Progress', icon: 'trending_up' },
    { id: 'achievements', title: 'Achievements', icon: 'emoji_events' },
    { id: 'library', title: 'My Library', icon: 'library_books' },
  ];

  useEffect(() => {
    // Animate screen entrance
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
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Vibration.vibrate(50);
    }, 1000);
  }, []);

  const handleQuickAction = (action) => {
    Vibration.vibrate(30);
    navigation.navigate(action.screen);
  };

  const handleContinueWatching = (item) => {
    Vibration.vibrate(30);
    navigation.navigate('VideoPlayer', { contentId: item.id });
  };

  const renderLevelProgress = () => {
    const progress = (learningStats.totalXP - (learningStats.currentLevel - 1) * 200) / 200;
    return (
      <Surface style={styles.levelCard} elevation={3}>
        <LinearGradient
          colors={[COLORS.primary + '20', COLORS.primary + '10']}
          style={styles.levelGradient}
        >
          <View style={styles.levelHeader}>
            <View style={styles.levelInfo}>
              <Text style={[TEXT_STYLES.heading3, { color: COLORS.primary }]}>
                Level {learningStats.currentLevel}
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                {learningStats.totalXP} XP
              </Text>
            </View>
            <Surface style={styles.xpBadge} elevation={2}>
              <Icon name="star" size={16} color="#FFD700" />
              <Text style={[TEXT_STYLES.caption, { color: COLORS.primary, fontWeight: '600' }]}>
                +{learningStats.totalXP}
              </Text>
            </Surface>
          </View>
          <ProgressBar
            progress={progress}
            color={COLORS.primary}
            style={styles.levelProgressBar}
          />
          <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginTop: SPACING.xs }]}>
            {learningStats.nextLevelXP - learningStats.totalXP} XP to next level
          </Text>
        </LinearGradient>
      </Surface>
    );
  };

  const renderStatsGrid = () => (
    <View style={styles.statsGrid}>
      <Surface style={styles.statCard} elevation={2}>
        <Icon name="local_fire_department" size={24} color="#FF5722" />
        <Text style={TEXT_STYLES.heading3}>{learningStats.streak}</Text>
        <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Day Streak 🔥</Text>
      </Surface>
      <Surface style={styles.statCard} elevation={2}>
        <Icon name="school" size={24} color="#4CAF50" />
        <Text style={TEXT_STYLES.heading3}>{learningStats.completedCourses}</Text>
        <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Completed</Text>
      </Surface>
      <Surface style={styles.statCard} elevation={2}>
        <Icon name="certificate" size={24} color="#FF9800" />
        <Text style={TEXT_STYLES.heading3}>{learningStats.certificates}</Text>
        <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Certificates</Text>
      </Surface>
      <Surface style={styles.statCard} elevation={2}>
        <Icon name="access_time" size={24} color="#9C27B0" />
        <Text style={TEXT_STYLES.heading3}>{learningStats.hoursLearned}h</Text>
        <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Learned</Text>
      </Surface>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.section}>
      <Text style={[TEXT_STYLES.heading3, styles.sectionTitle]}>Quick Actions</Text>
      <View style={styles.quickActionsGrid}>
        {quickActions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={styles.quickActionCard}
            onPress={() => handleQuickAction(action)}
            activeOpacity={0.8}
          >
            <Surface style={styles.quickActionSurface} elevation={3}>
              <LinearGradient
                colors={[action.color + '20', action.color + '10']}
                style={styles.quickActionGradient}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: action.color + '20' }]}>
                  <Icon name={action.icon} size={24} color={action.color} />
                </View>
                <Text style={[TEXT_STYLES.body, styles.quickActionTitle]} numberOfLines={2}>
                  {action.title}
                </Text>
                <View style={styles.quickActionFooter}>
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                    {action.count} items
                  </Text>
                  {action.badge && (
                    <Chip
                      mode="flat"
                      compact
                      style={[styles.actionBadge, { backgroundColor: action.color + '20' }]}
                      textStyle={{ color: action.color, fontSize: 9 }}
                    >
                      {action.badge}
                    </Chip>
                  )}
                </View>
              </LinearGradient>
            </Surface>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderContinueWatching = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[TEXT_STYLES.heading3, styles.sectionTitle]}>Continue Watching</Text>
        <TouchableOpacity onPress={() => navigation.navigate('MyLibrary')}>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.primary }]}>View All</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {continueWatching.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.continueCard}
            onPress={() => handleContinueWatching(item)}
            activeOpacity={0.9}
          >
            <Card style={styles.continueCardInner}>
              <LinearGradient
                colors={[item.color + '80', item.color + '60']}
                style={styles.continueThumbnail}
              >
                <Icon name={item.thumbnail} size={32} color="white" />
                <View style={styles.playOverlay}>
                  <Icon name="play-arrow" size={20} color="white" />
                </View>
              </LinearGradient>
              <View style={styles.continueContent}>
                <Text style={[TEXT_STYLES.body, styles.continueTitle]} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                  {item.type} • {item.lastWatched}
                </Text>
                <View style={styles.progressContainer}>
                  <ProgressBar
                    progress={item.progress}
                    color={item.color}
                    style={styles.continueProgressBar}
                  />
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginTop: 2 }]}>
                    {item.timeRemaining} remaining
                  </Text>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderRecommendations = () => (
    <View style={styles.section}>
      <Text style={[TEXT_STYLES.heading3, styles.sectionTitle]}>Recommended for You</Text>
      {recommendedContent.map((item) => (
        <Card key={item.id} style={styles.recommendationCard}>
          <TouchableOpacity style={styles.recommendationContent} activeOpacity={0.8}>
            <Surface style={styles.recommendationIcon} elevation={2}>
              <Icon name={item.thumbnail} size={24} color={COLORS.primary} />
            </Surface>
            <View style={styles.recommendationInfo}>
              <Text style={[TEXT_STYLES.body, { fontWeight: '600' }]} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                {item.type === 'Interview' ? `${item.expert} • ${item.duration}` : 
                 `${item.provider} • ${item.modules} modules`}
              </Text>
              <View style={styles.recommendationTags}>
                {item.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    mode="outlined"
                    compact
                    style={styles.recommendationTag}
                    textStyle={{ fontSize: 9 }}
                  >
                    {tag}
                  </Chip>
                ))}
              </View>
            </View>
            <View style={styles.recommendationMeta}>
              <View style={styles.ratingContainer}>
                <Icon name="star" size={14} color="#FFD700" />
                <Text style={[TEXT_STYLES.caption, { marginLeft: 2 }]}>{item.rating}</Text>
              </View>
              <Chip
                mode="flat"
                compact
                style={styles.difficultyChip}
                textStyle={{ fontSize: 9 }}
              >
                {item.difficulty}
              </Chip>
            </View>
          </TouchableOpacity>
        </Card>
      ))}
    </View>
  );

  const renderWeeklyGoal = () => {
    const goalProgress = learningStats.weeklyProgress / learningStats.weeklyGoal;
    return (
      <Surface style={styles.goalCard} elevation={3}>
        <LinearGradient
          colors={['#4ECDC4', '#44A08D']}
          style={styles.goalGradient}
        >
          <View style={styles.goalHeader}>
            <Icon name="flag" size={24} color="white" />
            <Text style={[TEXT_STYLES.heading3, { color: 'white', marginLeft: SPACING.sm }]}>
              Weekly Goal
            </Text>
          </View>
          <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.9)', marginVertical: SPACING.sm }]}>
            {learningStats.weeklyProgress} / {learningStats.weeklyGoal} XP this week
          </Text>
          <ProgressBar
            progress={goalProgress}
            color="white"
            style={styles.goalProgressBar}
          />
          <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)', marginTop: SPACING.xs }]}>
            {Math.round(goalProgress * 100)}% completed • {learningStats.weeklyGoal - learningStats.weeklyProgress} XP to go
          </Text>
        </LinearGradient>
      </Surface>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={[TEXT_STYLES.heading2, { color: 'white' }]}>
                Learning Center 📚
              </Text>
              <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.9)' }]}>
                Welcome back, {user?.name || 'Athlete'}! 
              </Text>
            </View>
            <Surface style={styles.streakBadge} elevation={2}>
              <Icon name="local_fire_department" size={16} color="#FF5722" />
              <Text style={[TEXT_STYLES.caption, { color: '#FF5722', fontWeight: '600' }]}>
                {learningStats.streak} day streak
              </Text>
            </Surface>
          </View>
        </View>
      </LinearGradient>

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {/* Tab Navigation */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}
          contentContainerStyle={styles.tabsContent}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, selectedTab === tab.id && styles.activeTab]}
              onPress={() => setSelectedTab(tab.id)}
            >
              <Icon 
                name={tab.icon} 
                size={18} 
                color={selectedTab === tab.id ? COLORS.primary : COLORS.textSecondary} 
              />
              <Text style={[
                TEXT_STYLES.caption, 
                { marginLeft: SPACING.xs },
                selectedTab === tab.id ? { color: COLORS.primary, fontWeight: '600' } : { color: COLORS.textSecondary }
              ]}>
                {tab.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView
          style={styles.scrollContent}
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
          <View style={styles.scrollContainer}>
            {selectedTab === 'overview' && (
              <>
                {renderLevelProgress()}
                {renderWeeklyGoal()}
                {renderStatsGrid()}
                {renderQuickActions()}
                {renderContinueWatching()}
                {renderRecommendations()}
              </>
            )}
            
            {selectedTab === 'progress' && (
              <View style={styles.placeholderContent}>
                <Icon name="trending_up" size={80} color={COLORS.textSecondary} />
                <Text style={[TEXT_STYLES.heading3, { color: COLORS.textSecondary, marginTop: SPACING.md }]}>
                  Progress Tracking
                </Text>
                <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.sm }]}>
                  Detailed progress analytics coming soon! 📈
                </Text>
              </View>
            )}

            {selectedTab === 'achievements' && (
              <View style={styles.achievementsContent}>
                <Text style={[TEXT_STYLES.heading3, styles.sectionTitle]}>Recent Achievements</Text>
                {recentAchievements.map((achievement) => (
                  <Card key={achievement.id} style={styles.achievementCard}>
                    <View style={styles.achievementContent}>
                      <View style={[styles.achievementIcon, { 
                        backgroundColor: achievement.rarity === 'diamond' ? '#B9F2FF' :
                                       achievement.rarity === 'gold' ? '#FFF3C4' : '#E8E8E8'
                      }]}>
                        <Icon name={achievement.icon} size={24} color={
                          achievement.rarity === 'diamond' ? '#0891B2' :
                          achievement.rarity === 'gold' ? '#D97706' : '#6B7280'
                        } />
                      </View>
                      <View style={styles.achievementInfo}>
                        <Text style={[TEXT_STYLES.body, { fontWeight: '600' }]}>
                          {achievement.title}
                        </Text>
                        <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                          {achievement.description}
                        </Text>
                        <Text style={[TEXT_STYLES.caption, { color: COLORS.primary, marginTop: 2 }]}>
                          +{achievement.xp} XP • {achievement.unlockedDate}
                        </Text>
                      </View>
                      {achievement.isNew && (
                        <Badge style={styles.newBadge}>New</Badge>
                      )}
                    </View>
                  </Card>
                ))}
              </View>
            )}

            {selectedTab === 'library' && (
              <View style={styles.placeholderContent}>
                <Icon name="library_books" size={80} color={COLORS.textSecondary} />
                <Text style={[TEXT_STYLES.heading3, { color: COLORS.textSecondary, marginTop: SPACING.md }]}>
                  My Library
                </Text>
                <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.sm }]}>
                  Your saved courses and materials will appear here! 📖
                </Text>
              </View>
            )}

            <View style={styles.bottomSpacing} />
          </View>
        </ScrollView>
      </Animated.View>

      <FAB
        icon="school"
        label="Browse All"
        style={styles.fab}
        color="white"
        onPress={() => navigation.navigate('CourseBrowser')}
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
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
    backgroundColor: 'white',
    gap: 4,
  },
  content: {
    flex: 1,
    marginTop: -SPACING.md,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: COLORS.background,
  },
  tabsContainer: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  tabsContent: {
    paddingHorizontal: SPACING.lg,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  activeTab: {
    backgroundColor: COLORS.primary + '10',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: SPACING.lg,
  },
  levelCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
  },
  levelGradient: {
    padding: SPACING.md,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  levelInfo: {
    flex: 1,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 16,
    backgroundColor: 'white',
    gap: 4,
  },
  levelProgressBar: {
    height: 8,
    borderRadius: 4,
  },
  goalCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
  },
  goalGradient: {
    padding: SPACING.md,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalProgressBar: {
    height: 6,
    borderRadius: 3,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.md,
    marginHorizontal: 2,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '48%',
    marginBottom: SPACING.sm,
  },
  quickActionSurface: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  quickActionGradient: {
    padding: SPACING.md,
    minHeight: 100,
    justifyContent: 'space-between',
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  quickActionTitle: {
    fontWeight: '600',
    flex: 1,
  },
  quickActionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionBadge: {
    height: 18,
  },
  continueCard: {
    width: 200,
    marginRight: SPACING.md,
  },
  continueCardInner: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  continueThumbnail: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  playOverlay: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueContent: {
    padding: SPACING.sm,
  },
  continueTitle: {
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  progressContainer: {
    marginTop: SPACING.xs,
  },
  continueProgressBar: {
    height: 4,
    borderRadius: 2,
  },
  recommendationCard: {
    marginBottom: SPACING.sm,
    borderRadius: 12,
    overflow: 'hidden',
  },
  recommendationContent: {
    flexDirection: 'row',
    padding: SPACING.md,
    alignItems: 'center',
  },
  recommendationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary + '20',
    marginRight: SPACING.sm,
  },
  recommendationInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  recommendationTags: {
    flexDirection: 'row',
    marginTop: SPACING.xs,
    gap: 4,
  },
  recommendationTag: {
    height: 18,
  },
  recommendationMeta: {
    alignItems: 'flex-end',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  difficultyChip: {
    height: 20,
    backgroundColor: COLORS.primary + '10',
  },
  placeholderContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  achievementsContent: {
    flex: 1,
  },
  achievementCard: {
    marginBottom: SPACING.sm,
    borderRadius: 12,
    overflow: 'hidden',
  },
  achievementContent: {
    flexDirection: 'row',
    padding: SPACING.md,
    alignItems: 'center',
    position: 'relative',
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  achievementInfo: {
    flex: 1,
  },
  newBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.primary,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  bottomSpacing: {
    height: SPACING.xl * 2,
  },
});

export default LearningCenter;