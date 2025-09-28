import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  StatusBar,
  RefreshControl,
  Dimensions,
  Animated,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  ProgressBar,
  Avatar,
  IconButton,
  Surface,
  Searchbar,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { LineChart, BarChart, RadarChart } from 'react-native-chart-kit';

// Design System Constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  accent: '#FF6B6B',
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
  h2: { fontSize: 24, fontWeight: 'bold' },
  h3: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16 },
  caption: { fontSize: 14, color: COLORS.textSecondary },
};

const { width, height } = Dimensions.get('window');

const SkillProgressAnalytics = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, skillData, isLoading } = useSelector(state => ({
    user: state.auth.user,
    skillData: state.analytics.skillProgress,
    isLoading: state.analytics.isLoading,
  }));

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  // Component state
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('3M');
  const [selectedSkillCategory, setSelectedSkillCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showComparison, setShowComparison] = useState(false);

  // Mock data - replace with actual Redux data
  const skillCategories = [
    { id: 'all', name: 'All Skills', icon: 'dashboard' },
    { id: 'technical', name: 'Technical', icon: 'precision-manufacturing' },
    { id: 'tactical', name: 'Tactical', icon: 'psychology' },
    { id: 'physical', name: 'Physical', icon: 'fitness-center' },
    { id: 'mental', name: 'Mental', icon: 'psychology' },
  ];

  const timeframes = [
    { id: '1M', name: '1 Month' },
    { id: '3M', name: '3 Months' },
    { id: '6M', name: '6 Months' },
    { id: '1Y', name: '1 Year' },
  ];

  const skillProgressData = [
    {
      skill: 'Ball Control',
      category: 'technical',
      currentLevel: 7.5,
      previousLevel: 6.8,
      targetLevel: 8.5,
      trend: 'up',
      lastAssessed: '2025-08-15',
      sessions: 24,
      improvement: 0.7,
      rank: 'Advanced',
      achievements: ['First Touch Master', 'Control Wizard'],
    },
    {
      skill: 'Passing Accuracy',
      category: 'technical',
      currentLevel: 8.2,
      previousLevel: 7.9,
      targetLevel: 9.0,
      trend: 'up',
      lastAssessed: '2025-08-14',
      sessions: 18,
      improvement: 0.3,
      rank: 'Expert',
      achievements: ['Precision Passer'],
    },
    {
      skill: 'Speed & Agility',
      category: 'physical',
      currentLevel: 6.9,
      previousLevel: 7.1,
      targetLevel: 8.0,
      trend: 'down',
      lastAssessed: '2025-08-12',
      sessions: 15,
      improvement: -0.2,
      rank: 'Intermediate',
      achievements: [],
    },
    {
      skill: 'Game Awareness',
      category: 'tactical',
      currentLevel: 7.8,
      previousLevel: 7.2,
      targetLevel: 8.8,
      trend: 'up',
      lastAssessed: '2025-08-16',
      sessions: 12,
      improvement: 0.6,
      rank: 'Advanced',
      achievements: ['Vision Master'],
    },
    {
      skill: 'Mental Resilience',
      category: 'mental',
      currentLevel: 8.5,
      previousLevel: 8.0,
      targetLevel: 9.2,
      trend: 'up',
      lastAssessed: '2025-08-13',
      sessions: 8,
      improvement: 0.5,
      rank: 'Expert',
      achievements: ['Never Give Up', 'Pressure Performer'],
    },
  ];

  const chartData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
    datasets: [
      {
        data: [6.5, 6.8, 7.0, 7.2, 7.4, 7.5],
        color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  const radarData = {
    labels: ['Technical', 'Tactical', 'Physical', 'Mental', 'Leadership'],
    datasets: [
      {
        data: [7.5, 7.8, 6.9, 8.5, 7.2],
        color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
        strokeWidth: 2,
        fillShadowGradient: COLORS.primary,
        fillShadowGradientOpacity: 0.3,
      },
    ],
  };

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Load skill progress data
    loadSkillData();
  }, []);

  const loadSkillData = useCallback(async () => {
    try {
      // Dispatch action to load skill progress data
      // dispatch(loadSkillProgressData({ timeframe: selectedTimeframe }));
    } catch (error) {
      Alert.alert('Error', 'Failed to load skill progress data');
    }
  }, [selectedTimeframe]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSkillData();
    setRefreshing(false);
  }, [loadSkillData]);

  const filteredSkills = skillProgressData.filter(skill => {
    const matchesCategory = selectedSkillCategory === 'all' || skill.category === selectedSkillCategory;
    const matchesSearch = skill.skill.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return 'trending-up';
      case 'down': return 'trending-down';
      default: return 'trending-flat';
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return COLORS.success;
      case 'down': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 'Expert': return COLORS.primary;
      case 'Advanced': return COLORS.success;
      case 'Intermediate': return COLORS.warning;
      default: return COLORS.textSecondary;
    }
  };

  const SkillCard = ({ skill }) => (
    <Card style={styles.skillCard} elevation={2}>
      <Card.Content style={styles.skillCardContent}>
        <View style={styles.skillHeader}>
          <View style={styles.skillTitleContainer}>
            <Text style={[TEXT_STYLES.h3, styles.skillTitle]}>{skill.skill}</Text>
            <Chip 
              mode="outlined" 
              style={[styles.rankChip, { borderColor: getRankColor(skill.rank) }]}
              textStyle={{ color: getRankColor(skill.rank), fontSize: 12 }}
            >
              {skill.rank}
            </Chip>
          </View>
          <View style={styles.trendContainer}>
            <Icon 
              name={getTrendIcon(skill.trend)} 
              size={24} 
              color={getTrendColor(skill.trend)} 
            />
            <Text style={[styles.improvementText, { color: getTrendColor(skill.trend) }]}>
              {skill.improvement > 0 ? '+' : ''}{skill.improvement}
            </Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressInfo}>
            <Text style={TEXT_STYLES.caption}>Current: {skill.currentLevel}/10</Text>
            <Text style={TEXT_STYLES.caption}>Target: {skill.targetLevel}/10</Text>
          </View>
          <ProgressBar 
            progress={skill.currentLevel / 10} 
            color={COLORS.primary}
            style={styles.progressBar}
          />
        </View>

        <View style={styles.skillStats}>
          <View style={styles.statItem}>
            <Icon name="event" size={16} color={COLORS.textSecondary} />
            <Text style={styles.statText}>{skill.sessions} sessions</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="schedule" size={16} color={COLORS.textSecondary} />
            <Text style={styles.statText}>Last: {new Date(skill.lastAssessed).toLocaleDateString()}</Text>
          </View>
        </View>

        {skill.achievements.length > 0 && (
          <View style={styles.achievementsContainer}>
            <Text style={styles.achievementsTitle}>🏆 Recent Achievements:</Text>
            <View style={styles.achievementsList}>
              {skill.achievements.map((achievement, index) => (
                <Chip key={index} mode="flat" style={styles.achievementChip}>
                  {achievement}
                </Chip>
              ))}
            </View>
          </View>
        )}

        <View style={styles.cardActions}>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('SkillDetail', { skillId: skill.skill })}
            style={styles.actionButton}
          >
            View Details
          </Button>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('TrainSkill', { skillId: skill.skill })}
            style={styles.actionButton}
            buttonColor={COLORS.primary}
          >
            Train Now
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const OverallProgressCard = () => {
    const overallProgress = skillProgressData.reduce((sum, skill) => sum + skill.currentLevel, 0) / skillProgressData.length;
    const overallImprovement = skillProgressData.reduce((sum, skill) => sum + skill.improvement, 0);
    
    return (
      <Card style={styles.overallCard} elevation={3}>
        <LinearGradient 
          colors={[COLORS.primary, COLORS.secondary]} 
          style={styles.overallGradient}
        >
          <Card.Content>
            <View style={styles.overallHeader}>
              <View>
                <Text style={[TEXT_STYLES.h2, styles.overallTitle]}>Overall Progress</Text>
                <Text style={styles.overallSubtitle}>Your skill development journey 🚀</Text>
              </View>
              <View style={styles.overallScore}>
                <Text style={styles.scoreNumber}>{overallProgress.toFixed(1)}</Text>
                <Text style={styles.scoreMax}>/10</Text>
              </View>
            </View>
            
            <View style={styles.overallStats}>
              <View style={styles.statCard}>
                <Icon name="trending-up" size={20} color={COLORS.success} />
                <Text style={styles.statValue}>+{overallImprovement.toFixed(1)}</Text>
                <Text style={styles.statLabel}>This Month</Text>
              </View>
              <View style={styles.statCard}>
                <Icon name="military-tech" size={20} color={COLORS.warning} />
                <Text style={styles.statValue}>{skillProgressData.filter(s => s.achievements.length > 0).length}</Text>
                <Text style={styles.statLabel}>Achievements</Text>
              </View>
              <View style={styles.statCard}>
                <Icon name="schedule" size={20} color={COLORS.accent} />
                <Text style={styles.statValue}>{skillProgressData.reduce((sum, s) => sum + s.sessions, 0)}</Text>
                <Text style={styles.statLabel}>Sessions</Text>
              </View>
            </View>
          </Card.Content>
        </LinearGradient>
      </Card>
    );
  };

  const ChartSection = () => (
    <Card style={styles.chartCard} elevation={2}>
      <Card.Content>
        <View style={styles.chartHeader}>
          <Text style={[TEXT_STYLES.h3, styles.chartTitle]}>📈 Progress Trends</Text>
          <View style={styles.timeframeChips}>
            {timeframes.map(timeframe => (
              <Chip
                key={timeframe.id}
                mode={selectedTimeframe === timeframe.id ? 'flat' : 'outlined'}
                selected={selectedTimeframe === timeframe.id}
                onPress={() => setSelectedTimeframe(timeframe.id)}
                style={styles.timeframeChip}
                selectedColor={COLORS.primary}
              >
                {timeframe.name}
              </Chip>
            ))}
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chartsContainer}>
          <View style={styles.chartWrapper}>
            <Text style={styles.chartSubtitle}>Weekly Progress</Text>
            <LineChart
              data={chartData}
              width={width - 60}
              height={200}
              chartConfig={{
                backgroundColor: COLORS.surface,
                backgroundGradientFrom: COLORS.surface,
                backgroundGradientTo: COLORS.surface,
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
                style: { borderRadius: 16 },
                propsForDots: {
                  r: "6",
                  strokeWidth: "2",
                  stroke: COLORS.primary
                }
              }}
              style={styles.chart}
              bezier
            />
          </View>

          <View style={styles.chartWrapper}>
            <Text style={styles.chartSubtitle}>Skill Categories</Text>
            <RadarChart
              data={radarData}
              width={width - 60}
              height={200}
              chartConfig={{
                backgroundColor: COLORS.surface,
                backgroundGradientFrom: COLORS.surface,
                backgroundGradientTo: COLORS.surface,
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
              }}
              style={styles.chart}
            />
          </View>
        </ScrollView>
      </Card.Content>
    </Card>
  );

  const AchievementsSection = () => {
    const allAchievements = skillProgressData.flatMap(skill => skill.achievements);
    const recentAchievements = allAchievements.slice(0, 5);

    return (
      <Card style={styles.achievementsCard} elevation={2}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>🏆 Recent Achievements</Text>
            <IconButton
              icon="chevron-right"
              size={24}
              onPress={() => navigation.navigate('Achievements')}
            />
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {recentAchievements.map((achievement, index) => (
              <Surface key={index} style={styles.achievementBadge} elevation={1}>
                <Icon name="military-tech" size={24} color={COLORS.warning} />
                <Text style={styles.achievementText}>{achievement}</Text>
              </Surface>
            ))}
          </ScrollView>
        </Card.Content>
      </Card>
    );
  };

  const RecommendationsSection = () => (
    <Card style={styles.recommendationsCard} elevation={2}>
      <Card.Content>
        <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>💡 AI Recommendations</Text>
        
        <View style={styles.recommendationItem}>
          <View style={styles.recommendationIcon}>
            <Icon name="fitness-center" size={20} color={COLORS.error} />
          </View>
          <View style={styles.recommendationContent}>
            <Text style={styles.recommendationTitle}>Focus on Speed & Agility</Text>
            <Text style={styles.recommendationText}>
              Your speed has declined slightly. Consider adding 2 sprint sessions per week.
            </Text>
          </View>
          <Button
            mode="outlined"
            compact
            onPress={() => Alert.alert('Feature Coming Soon', 'Training recommendations will be available in the next update!')}
          >
            Train
          </Button>
        </View>

        <View style={styles.recommendationItem}>
          <View style={styles.recommendationIcon}>
            <Icon name="psychology" size={20} color={COLORS.success} />
          </View>
          <View style={styles.recommendationContent}>
            <Text style={styles.recommendationTitle}>Maintain Mental Strength</Text>
            <Text style={styles.recommendationText}>
              Excellent mental resilience! Keep practicing mindfulness exercises.
            </Text>
          </View>
          <Button
            mode="outlined"
            compact
            onPress={() => Alert.alert('Feature Coming Soon', 'Mental training modules coming soon!')}
          >
            Practice
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={[TEXT_STYLES.h2, styles.headerTitle]}>Skill Analytics</Text>
            <Text style={styles.headerSubtitle}>Track your progress and improve 📊</Text>
          </View>
          <Avatar.Text 
            size={50} 
            label={user?.name?.charAt(0) || 'P'} 
            style={styles.avatar}
          />
        </View>
      </LinearGradient>

      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <ScrollView
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
          <OverallProgressCard />

          <Searchbar
            placeholder="Search skills..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor={COLORS.primary}
          />

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoryFilter}
          >
            {skillCategories.map(category => (
              <Chip
                key={category.id}
                mode={selectedSkillCategory === category.id ? 'flat' : 'outlined'}
                selected={selectedSkillCategory === category.id}
                onPress={() => setSelectedSkillCategory(category.id)}
                style={styles.categoryChip}
                icon={category.icon}
                selectedColor={COLORS.primary}
              >
                {category.name}
              </Chip>
            ))}
          </ScrollView>

          <ChartSection />

          <View style={styles.skillsHeader}>
            <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>📋 Individual Skills</Text>
            <TouchableOpacity
              onPress={() => setShowComparison(!showComparison)}
              style={styles.comparisonToggle}
            >
              <Icon 
                name={showComparison ? "compare" : "compare-arrows"} 
                size={20} 
                color={COLORS.primary} 
              />
              <Text style={styles.comparisonText}>
                {showComparison ? 'Hide' : 'Show'} Comparison
              </Text>
            </TouchableOpacity>
          </View>

          {filteredSkills.map((skill, index) => (
            <SkillCard key={skill.skill} skill={skill} />
          ))}

          <AchievementsSection />
          <RecommendationsSection />

          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('SkillAssessment')}
              style={[styles.actionBtn, { backgroundColor: COLORS.primary }]}
              icon="assignment"
            >
              Take Skill Assessment
            </Button>
            
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('TrainingPlan')}
              style={styles.actionBtn}
              textColor={COLORS.primary}
            >
              View Training Plan
            </Button>
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 50,
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
  headerTitle: {
    color: 'white',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
  },
  avatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    marginTop: -SPACING.md,
  },
  overallCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
  },
  overallGradient: {
    borderRadius: 16,
  },
  overallHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  overallTitle: {
    color: 'white',
    marginBottom: SPACING.xs,
  },
  overallSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
  },
  overallScore: {
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  scoreMax: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  overallStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: SPACING.sm,
    borderRadius: 12,
    marginHorizontal: SPACING.xs,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: SPACING.xs,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: SPACING.xs,
  },
  searchBar: {
    marginBottom: SPACING.md,
    borderRadius: 12,
  },
  categoryFilter: {
    marginBottom: SPACING.md,
  },
  categoryChip: {
    marginRight: SPACING.sm,
  },
  chartCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  chartTitle: {
    color: COLORS.text,
  },
  timeframeChips: {
    flexDirection: 'row',
  },
  timeframeChip: {
    marginLeft: SPACING.xs,
  },
  chartsContainer: {
    marginHorizontal: -SPACING.md,
  },
  chartWrapper: {
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  chartSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  chart: {
    borderRadius: 16,
  },
  skillsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    color: COLORS.text,
  },
  comparisonToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  comparisonText: {
    marginLeft: SPACING.xs,
    color: COLORS.primary,
    fontSize: 14,
  },
  skillCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
  },
  skillCardContent: {
    padding: SPACING.md,
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  skillTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  skillTitle: {
    flex: 1,
    color: COLORS.text,
    marginRight: SPACING.sm,
  },
  rankChip: {
    height: 28,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  improvementText: {
    marginLeft: SPACING.xs,
    fontWeight: 'bold',
    fontSize: 16,
  },
  progressContainer: {
    marginBottom: SPACING.md,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  skillStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: SPACING.xs,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  achievementsContainer: {
    marginBottom: SPACING.md,
  },
  achievementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: SPACING.sm,
    color: COLORS.text,
  },
  achievementsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  achievementChip: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
    backgroundColor: COLORS.warning + '20',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  achievementsCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  achievementBadge: {
    padding: SPACING.md,
    marginRight: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 120,
  },
  achievementText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: SPACING.xs,
    color: COLORS.text,
  },
  recommendationsCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  recommendationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  recommendationText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  actionButtons: {
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  actionBtn: {
    marginBottom: SPACING.sm,
    borderRadius: 12,
  },
  bottomSpacing: {
    height: SPACING.xl,
  },
};

export default SkillProgressAnalytics;