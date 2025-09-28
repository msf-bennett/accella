import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Dimensions,
  Animated,
  TouchableOpacity,
  Alert,
  Vibration,
  FlatList,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Card,
  Button,
  Chip,
  ProgressBar,
  Avatar,
  IconButton,
  Surface,
  Searchbar,
  Portal,
  Modal,
  FAB,
  Divider,
  Badge,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { RadarChart, LineChart, ProgressChart } from 'react-native-chart-kit';

// Design System Imports
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#28a745',
  error: '#dc3545',
  warning: '#ffc107',
  info: '#17a2b8',
  background: '#f8f9fa',
  surface: '#ffffff',
  text: '#2c3e50',
  textSecondary: '#6c757d',
  border: '#e9ecef',
  accent: '#ff6b6b',
  purple: '#9b59b6',
  orange: '#f39c12',
  teal: '#1abc9c',
  pink: '#e91e63',
  indigo: '#3f51b5',
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
    fontSize: 24,
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
    color: COLORS.textSecondary,
  },
  small: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
};

const screenWidth = Dimensions.get('window').width;

const PerformanceInsights = ({ navigation }) => {
  // Redux State
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const playerInsights = useSelector(state => state.player.insights);
  const isLoading = useSelector(state => state.player.loading);

  // Local State
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [expandedInsight, setExpandedInsight] = useState(null);
  const [showGoalModal, setShowGoalModal] = useState(false);

  // Animation References
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Sample Data (in real app, this would come from Redux/API)
  const [insightsData, setInsightsData] = useState({
    overallScore: 82,
    weeklyImprovement: 7,
    strengthsCount: 4,
    improvementAreas: 3,
    aiConfidence: 94,
    lastUpdated: '2 hours ago',
    
    keyInsights: [
      {
        id: 'strength_1',
        type: 'strength',
        title: 'Excellent Consistency',
        description: 'You\'ve maintained 90%+ attendance for 3 weeks straight! 🔥',
        impact: 'high',
        category: 'consistency',
        actionable: false,
        trend: 'positive',
        confidence: 96,
      },
      {
        id: 'improvement_1',
        type: 'improvement',
        title: 'Speed Training Opportunity',
        description: 'Your acceleration times have plateaued. Focus on explosive drills.',
        impact: 'medium',
        category: 'speed',
        actionable: true,
        trend: 'neutral',
        confidence: 87,
        recommendation: {
          title: 'Sprint Interval Training',
          details: '3x weekly 20m sprints with 90s recovery',
          duration: '2 weeks',
          expectedImprovement: '12-15%',
        }
      },
      {
        id: 'alert_1',
        type: 'alert',
        title: 'Recovery Attention Needed',
        description: 'Heart rate variability suggests you need more rest days.',
        impact: 'high',
        category: 'recovery',
        actionable: true,
        trend: 'negative',
        confidence: 91,
        recommendation: {
          title: 'Enhanced Recovery Protocol',
          details: 'Add 1 extra rest day, increase sleep to 8+ hours',
          duration: '1 week',
          expectedImprovement: 'Better performance consistency',
        }
      },
      {
        id: 'strength_2',
        type: 'strength',
        title: 'Technical Skills Peak',
        description: 'Ball control accuracy reached 94% - your highest ever! ⚽',
        impact: 'high',
        category: 'technical',
        actionable: false,
        trend: 'positive',
        confidence: 98,
      },
      {
        id: 'improvement_2',
        type: 'improvement',
        title: 'Tactical Awareness Gap',
        description: 'Decision-making under pressure could be improved.',
        impact: 'medium',
        category: 'tactical',
        actionable: true,
        trend: 'neutral',
        confidence: 84,
        recommendation: {
          title: 'Small-Sided Games',
          details: '4v4 games focusing on quick decisions',
          duration: '3 weeks',
          expectedImprovement: '20% faster decision time',
        }
      },
    ],

    performanceRadar: {
      labels: ['Speed', 'Strength', 'Endurance', 'Technical', 'Tactical', 'Mental'],
      datasets: [{
        data: [78, 85, 92, 94, 76, 88],
        color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
        strokeWidth: 3,
        fillShadowGradient: COLORS.primary,
        fillShadowGradientOpacity: 0.3,
      }],
    },

    trendData: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [{
        data: [75, 78, 80, 82],
        color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
        strokeWidth: 3,
      }],
    },

    goals: [
      {
        id: 'goal_1',
        title: 'Improve Sprint Speed',
        progress: 0.65,
        target: '10.5s 100m',
        current: '11.2s',
        deadline: '2024-09-01',
        priority: 'high',
        status: 'on_track',
      },
      {
        id: 'goal_2',
        title: 'Increase Training Frequency',
        progress: 0.80,
        target: '5 sessions/week',
        current: '4 sessions',
        deadline: '2024-08-15',
        priority: 'medium',
        status: 'ahead',
      },
      {
        id: 'goal_3',
        title: 'Master New Skills',
        progress: 0.45,
        target: '3 new techniques',
        current: '1 technique',
        deadline: '2024-10-01',
        priority: 'low',
        status: 'behind',
      },
    ],

    achievements: [
      {
        id: 'ach_1',
        title: 'Consistency Champion',
        description: '30 days streak',
        icon: 'jump-rope',
        color: COLORS.warning,
        unlocked: true,
        date: '2024-08-10',
      },
      {
        id: 'ach_2',
        title: 'Speed Demon',
        description: 'Personal best in sprints',
        icon: 'flash-on',
        color: COLORS.accent,
        unlocked: true,
        date: '2024-08-15',
      },
      {
        id: 'ach_3',
        title: 'Technical Master',
        description: '95% skill accuracy',
        icon: 'precision-manufacturing',
        color: COLORS.success,
        unlocked: false,
        progress: 0.94,
      },
    ],
  });

  const insightCategories = [
    { id: 'all', title: 'All Insights', icon: 'insights', color: COLORS.primary },
    { id: 'strength', title: 'Strengths', icon: 'trending-up', color: COLORS.success },
    { id: 'improvement', title: 'Areas to Improve', icon: 'build', color: COLORS.warning },
    { id: 'alert', title: 'Alerts', icon: 'warning', color: COLORS.error },
  ];

  const timeframes = [
    { id: 'week', title: 'This Week' },
    { id: 'month', title: 'This Month' },
    { id: '3months', title: '3 Months' },
  ];

  // Effects
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for new insights
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
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
    pulseLoop.start();

    return () => pulseLoop.stop();
  }, []);

  // Handlers
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Vibration.vibrate(50);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real app: dispatch(fetchPerformanceInsights());
      setRefreshing(false);
    } catch (error) {
      setRefreshing(false);
      Alert.alert('Error', 'Failed to refresh insights');
    }
  }, [dispatch]);

  const handleCategorySelect = useCallback((categoryId) => {
    Vibration.vibrate(30);
    setSelectedCategory(categoryId);
  }, []);

  const handleInsightAction = useCallback((insight) => {
    if (insight.actionable && insight.recommendation) {
      setSelectedRecommendation(insight.recommendation);
      setShowRecommendationModal(true);
    } else {
      setExpandedInsight(expandedInsight === insight.id ? null : insight.id);
    }
    Vibration.vibrate(30);
  }, [expandedInsight]);

  const handleApplyRecommendation = useCallback(() => {
    Alert.alert(
      '🎯 Recommendation Applied!',
      'This recommendation has been added to your training plan. Your coach will be notified.',
      [{ text: 'Great! 👍', style: 'default' }]
    );
    setShowRecommendationModal(false);
  }, []);

  const handleGoalAction = useCallback((goal) => {
    Alert.alert(
      '🚧 Goal Management',
      'Detailed goal management features are coming soon! You\'ll be able to modify targets, timelines, and track detailed progress.',
      [{ text: 'Got it! 👍', style: 'default' }]
    );
  }, []);

  const getInsightIcon = (type) => {
    switch (type) {
      case 'strength':
        return { name: 'trending-up', color: COLORS.success };
      case 'improvement':
        return { name: 'build', color: COLORS.warning };
      case 'alert':
        return { name: 'warning', color: COLORS.error };
      default:
        return { name: 'lightbulb', color: COLORS.info };
    }
  };

  const getGoalStatusColor = (status) => {
    switch (status) {
      case 'ahead':
        return COLORS.success;
      case 'on_track':
        return COLORS.info;
      case 'behind':
        return COLORS.warning;
      default:
        return COLORS.textSecondary;
    }
  };

  const filteredInsights = insightsData.keyInsights.filter(insight => 
    selectedCategory === 'all' || insight.type === selectedCategory
  );

  const renderOverviewCards = () => (
    <View style={styles.overviewContainer}>
      <View style={styles.overviewRow}>
        <Surface style={[styles.overviewCard, { backgroundColor: COLORS.primary }]} elevation={3}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <MaterialIcons name="psychology" size={32} color={COLORS.surface} />
          </Animated.View>
          <Text style={[styles.overviewValue, { color: COLORS.surface }]}>
            {insightsData.overallScore}
          </Text>
          <Text style={[styles.overviewLabel, { color: COLORS.surface }]}>
            Performance Score
          </Text>
        </Surface>

        <Surface style={[styles.overviewCard, { backgroundColor: COLORS.success }]} elevation={3}>
          <MaterialIcons name="trending-up" size={32} color={COLORS.surface} />
          <Text style={[styles.overviewValue, { color: COLORS.surface }]}>
            +{insightsData.weeklyImprovement}%
          </Text>
          <Text style={[styles.overviewLabel, { color: COLORS.surface }]}>
            Weekly Improvement
          </Text>
        </Surface>
      </View>

      <View style={styles.overviewRow}>
        <Surface style={[styles.overviewCard, { backgroundColor: COLORS.warning }]} elevation={3}>
          <MaterialIcons name="jump-rope" size={32} color={COLORS.surface} />
          <Text style={[styles.overviewValue, { color: COLORS.surface }]}>
            {insightsData.strengthsCount}
          </Text>
          <Text style={[styles.overviewLabel, { color: COLORS.surface }]}>
            Key Strengths
          </Text>
        </Surface>

        <Surface style={[styles.overviewCard, { backgroundColor: COLORS.accent }]} elevation={3}>
          <MaterialIcons name="build" size={32} color={COLORS.surface} />
          <Text style={[styles.overviewValue, { color: COLORS.surface }]}>
            {insightsData.improvementAreas}
          </Text>
          <Text style={[styles.overviewLabel, { color: COLORS.surface }]}>
            Improvement Areas
          </Text>
        </Surface>
      </View>
    </View>
  );

  const renderInsightCard = ({ item: insight }) => {
    const icon = getInsightIcon(insight.type);
    const isExpanded = expandedInsight === insight.id;

    return (
      <Card style={[styles.insightCard, insight.impact === 'high' && styles.highImpactCard]}>
        <TouchableOpacity onPress={() => handleInsightAction(insight)}>
          <Card.Content>
            <View style={styles.insightHeader}>
              <View style={styles.insightTitleContainer}>
                <MaterialIcons name={icon.name} size={24} color={icon.color} />
                <View style={styles.insightTitleText}>
                  <Text style={styles.insightTitle}>{insight.title}</Text>
                  <View style={styles.insightMeta}>
                    <Chip
                      mode="outlined"
                      compact
                      style={[styles.impactChip, { borderColor: icon.color }]}
                      textStyle={{ color: icon.color }}
                    >
                      {insight.impact.toUpperCase()}
                    </Chip>
                    <Text style={styles.confidenceText}>
                      {insight.confidence}% confidence
                    </Text>
                  </View>
                </View>
              </View>
              {insight.actionable && (
                <Badge style={{ backgroundColor: COLORS.primary }}>ACTION</Badge>
              )}
            </View>

            <Text style={styles.insightDescription}>{insight.description}</Text>

            {isExpanded && (
              <View style={styles.expandedContent}>
                <Divider style={styles.divider} />
                <Text style={styles.expandedTitle}>AI Analysis:</Text>
                <Text style={styles.expandedText}>
                  Based on your recent training data and performance patterns, 
                  this insight was generated with {insight.confidence}% confidence. 
                  The trend analysis shows {insight.trend} movement in this area.
                </Text>
                {insight.recommendation && (
                  <Button
                    mode="contained"
                    onPress={() => {
                      setSelectedRecommendation(insight.recommendation);
                      setShowRecommendationModal(true);
                    }}
                    style={styles.actionButton}
                    icon="lightbulb"
                  >
                    View Recommendation
                  </Button>
                )}
              </View>
            )}
          </Card.Content>
        </TouchableOpacity>
      </Card>
    );
  };

  const renderPerformanceRadar = () => (
    <Card style={styles.radarCard}>
      <Card.Content>
        <Text style={styles.cardTitle}>🎯 Performance Profile</Text>
        <RadarChart
          data={insightsData.performanceRadar}
          width={screenWidth - 64}
          height={220}
          chartConfig={{
            backgroundColor: COLORS.surface,
            backgroundGradientFrom: COLORS.surface,
            backgroundGradientTo: COLORS.background,
            color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
            strokeWidth: 2,
          }}
          style={styles.chart}
        />
        <Text style={styles.radarNote}>
          💡 Your strongest areas are Technical Skills and Endurance. 
          Focus on Tactical awareness for balanced improvement.
        </Text>
      </Card.Content>
    </Card>
  );

  const renderGoalCard = ({ item: goal }) => (
    <Card style={styles.goalCard}>
      <Card.Content>
        <View style={styles.goalHeader}>
          <View style={styles.goalTitleContainer}>
            <Text style={styles.goalTitle}>{goal.title}</Text>
            <Chip
              mode="flat"
              compact
              style={[styles.statusChip, { backgroundColor: getGoalStatusColor(goal.status) + '20' }]}
              textStyle={{ color: getGoalStatusColor(goal.status) }}
            >
              {goal.status.replace('_', ' ').toUpperCase()}
            </Chip>
          </View>
          <IconButton
            icon="dots-vertical"
            size={20}
            onPress={() => handleGoalAction(goal)}
          />
        </View>
        
        <View style={styles.goalProgress}>
          <View style={styles.goalProgressInfo}>
            <Text style={styles.goalCurrent}>{goal.current}</Text>
            <Text style={styles.goalTarget}>Target: {goal.target}</Text>
          </View>
          <ProgressBar
            progress={goal.progress}
            color={getGoalStatusColor(goal.status)}
            style={styles.goalProgressBar}
          />
          <Text style={styles.goalProgressText}>
            {Math.round(goal.progress * 100)}% Complete
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  const renderAchievementCard = ({ item: achievement }) => (
    <Surface style={[styles.achievementCard, !achievement.unlocked && styles.lockedAchievement]} elevation={2}>
      <LinearGradient
        colors={achievement.unlocked ? [achievement.color, `${achievement.color}40`] : [COLORS.textSecondary, `${COLORS.textSecondary}20`]}
        style={styles.achievementGradient}
      >
        <MaterialIcons 
          name={achievement.icon} 
          size={32} 
          color={achievement.unlocked ? COLORS.surface : COLORS.textSecondary} 
        />
        <Text style={[
          styles.achievementTitle, 
          { color: achievement.unlocked ? COLORS.surface : COLORS.textSecondary }
        ]}>
          {achievement.title}
        </Text>
        <Text style={[
          styles.achievementDescription,
          { color: achievement.unlocked ? COLORS.surface : COLORS.textSecondary }
        ]}>
          {achievement.description}
        </Text>
        {!achievement.unlocked && achievement.progress && (
          <ProgressBar
            progress={achievement.progress}
            color={COLORS.primary}
            style={styles.achievementProgress}
          />
        )}
      </LinearGradient>
    </Surface>
  );

  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={styles.header}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.primary}
        translucent
      />
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <IconButton
            icon="arrow-back"
            iconColor={COLORS.surface}
            size={24}
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTitle}>Performance Insights</Text>
          <IconButton
            icon="refresh"
            iconColor={COLORS.surface}
            size={24}
            onPress={onRefresh}
          />
        </View>
        <Text style={styles.headerSubtitle}>
          AI-powered analysis of your training performance 🤖
        </Text>
        <Text style={styles.headerLastUpdated}>
          Last updated: {insightsData.lastUpdated}
        </Text>
      </View>
    </LinearGradient>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      
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
          {/* Overview Cards */}
          <View style={styles.section}>
            {renderOverviewCards()}
          </View>

          {/* Performance Radar */}
          <View style={styles.section}>
            {renderPerformanceRadar()}
          </View>

          {/* Category Filter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Insights & Recommendations 💡</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryContainer}
            >
              {insightCategories.map((category) => (
                <Chip
                  key={category.id}
                  mode={selectedCategory === category.id ? 'flat' : 'outlined'}
                  selected={selectedCategory === category.id}
                  onPress={() => handleCategorySelect(category.id)}
                  icon={category.icon}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category.id && { backgroundColor: category.color },
                  ]}
                  textStyle={[
                    styles.categoryChipText,
                    selectedCategory === category.id && { color: COLORS.surface },
                  ]}
                >
                  {category.title}
                </Chip>
              ))}
            </ScrollView>
          </View>

          {/* Insights List */}
          <View style={styles.section}>
            <FlatList
              data={filteredInsights}
              renderItem={renderInsightCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.insightsList}
            />
          </View>

          {/* Goals Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Goals 🎯</Text>
            <FlatList
              data={insightsData.goals}
              renderItem={renderGoalCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.goalsList}
            />
          </View>

          {/* Achievements Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Achievements 🏆</Text>
            <FlatList
              data={insightsData.achievements}
              renderItem={renderAchievementCard}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.achievementsList}
            />
          </View>
        </ScrollView>
      </Animated.View>

      {/* Recommendation Modal */}
      <Portal>
        <Modal
          visible={showRecommendationModal}
          onDismiss={() => setShowRecommendationModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          {selectedRecommendation && (
            <>
              <View style={styles.modalHeader}>
                <MaterialIcons name="lightbulb" size={32} color={COLORS.primary} />
                <Text style={styles.modalTitle}>{selectedRecommendation.title}</Text>
              </View>
              
              <Text style={styles.modalDescription}>
                {selectedRecommendation.details}
              </Text>
              
              <View style={styles.modalDetails}>
                <View style={styles.modalDetailItem}>
                  <MaterialIcons name="schedule" size={20} color={COLORS.textSecondary} />
                  <Text style={styles.modalDetailText}>
                    Duration: {selectedRecommendation.duration}
                  </Text>
                </View>
                <View style={styles.modalDetailItem}>
                  <MaterialIcons name="trending-up" size={20} color={COLORS.success} />
                  <Text style={styles.modalDetailText}>
                    Expected: {selectedRecommendation.expectedImprovement}
                  </Text>
                </View>
              </View>
              
              <View style={styles.modalButtons}>
                <Button
                  mode="outlined"
                  onPress={() => setShowRecommendationModal(false)}
                  style={styles.modalCancelButton}
                >
                  Maybe Later
                </Button>
                <Button
                  mode="contained"
                  onPress={handleApplyRecommendation}
                  style={styles.modalApplyButton}
                  icon="check"
                >
                  Apply to Plan
                </Button>
              </View>
            </>
          )}
        </Modal>
      </Portal>

      {/* Floating Action Button */}
      <FAB
        icon="auto-awesome"
        style={styles.fab}
        onPress={() => Alert.alert('🤖 AI Coach', 'Advanced AI coaching features are coming soon!')}
        color={COLORS.surface}
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
    gap: SPACING.sm,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    ...TEXT_STYLES.title,
    color: COLORS.surface,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: SPACING.md,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.surface,
    textAlign: 'center',
    opacity: 0.9,
  },
  headerLastUpdated: {
    ...TEXT_STYLES.caption,
    color: COLORS.surface,
    textAlign: 'center',
    opacity: 0.7,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl * 2,
  },
  section: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TEXT_STYLES.subtitle,
    marginBottom: SPACING.md,
  },
  overviewContainer: {
    gap: SPACING.md,
  },
  overviewRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  overviewCard: {
    flex: 1,
    padding: SPACING.lg,
    borderRadius: 16,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  overviewValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  overviewLabel: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    opacity: 0.9,
  },
  radarCard: {
    alignItems: 'center',
  },
  cardTitle: {
    ...TEXT_STYLES.subtitle,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  chart: {
    marginVertical: SPACING.sm,
    borderRadius: 16,
  },
  radarNote: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    marginTop: SPACING.md,
    fontStyle: 'italic',
    color: COLORS.primary,
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  categoryChip: {
    backgroundColor: COLORS.surface,
  },
  categoryChipText: {
    color: COLORS.text,
  },
  insightsList: {
    gap: SPACING.md,
  },
  insightCard: {
    marginBottom: SPACING.sm,
  },
  highImpactCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  insightTitleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    flex: 1,
  },
  insightTitleText: {
    flex: 1,
    gap: SPACING.xs,
  },
  insightTitle: {
    ...TEXT_STYLES.subtitle,
    fontSize: 16,
  },
  insightMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  impactChip: {
    height: 24,
  },
  confidenceText: {
    ...TEXT_STYLES.small,
    fontWeight: '600',
    color: COLORS.primary,
  },
  insightDescription: {
    ...TEXT_STYLES.body,
    lineHeight: 22,
  },
  expandedContent: {
    marginTop: SPACING.md,
  },
  divider: {
    marginBottom: SPACING.md,
  },
  expandedTitle: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    marginBottom: SPACING.sm,
    color: COLORS.primary,
  },
  expandedText: {
    ...TEXT_STYLES.caption,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    marginTop: SPACING.sm,
  },
  goalsList: {
    gap: SPACING.md,
  },
  goalCard: {
    marginBottom: SPACING.sm,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  goalTitleContainer: {
    flex: 1,
    gap: SPACING.xs,
  },
  goalTitle: {
    ...TEXT_STYLES.subtitle,
    fontSize: 16,
  },
  statusChip: {
    height: 24,
    alignSelf: 'flex-start',
  },
  goalProgress: {
    gap: SPACING.sm,
  },
  goalProgressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalCurrent: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.primary,
  },
  goalTarget: {
    ...TEXT_STYLES.caption,
  },
  goalProgressBar: {
    height: 8,
    borderRadius: 4,
  },
  goalProgressText: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    fontWeight: '600',
  },
  achievementsList: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  achievementCard: {
    borderRadius: 16,
    overflow: 'hidden',
    width: 140,
  },
  lockedAchievement: {
    opacity: 0.7,
  },
  achievementGradient: {
    padding: SPACING.lg,
    alignItems: 'center',
    gap: SPACING.sm,
    minHeight: 120,
    justifyContent: 'center',
  },
  achievementTitle: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    textAlign: 'center',
  },
  achievementDescription: {
    ...TEXT_STYLES.small,
    textAlign: 'center',
    opacity: 0.9,
  },
  achievementProgress: {
    width: '100%',
    marginTop: SPACING.sm,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    padding: SPACING.xl,
    margin: SPACING.xl,
    borderRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    ...TEXT_STYLES.title,
    flex: 1,
  },
  modalDescription: {
    ...TEXT_STYLES.body,
    lineHeight: 24,
    marginBottom: SPACING.lg,
  },
  modalDetails: {
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  modalDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  modalDetailText: {
    ...TEXT_STYLES.body,
    flex: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  modalCancelButton: {
    flex: 1,
    borderColor: COLORS.textSecondary,
  },
  modalApplyButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
});

export default PerformanceInsights;