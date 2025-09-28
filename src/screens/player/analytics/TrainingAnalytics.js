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
  FlatList,
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
  FAB,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

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

const TrainingAnalytics = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, trainingData, isLoading } = useSelector(state => ({
    user: state.auth.user,
    trainingData: state.analytics.trainingData,
    isLoading: state.analytics.isLoading,
  }));

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  // Component state
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedMetric, setSelectedMetric] = useState('performance');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSession, setExpandedSession] = useState(null);

  // Mock data - replace with actual Redux data
  const periods = [
    { id: 'week', name: 'This Week', icon: 'date-range' },
    { id: 'month', name: 'This Month', icon: 'calendar-month' },
    { id: 'quarter', name: '3 Months', icon: 'calendar-today' },
    { id: 'year', name: 'This Year', icon: 'event' },
  ];

  const metrics = [
    { id: 'performance', name: 'Performance', icon: 'trending-up' },
    { id: 'attendance', name: 'Attendance', icon: 'event-available' },
    { id: 'intensity', name: 'Intensity', icon: 'fitness-center' },
    { id: 'consistency', name: 'Consistency', icon: 'schedule' },
  ];

  const trainingStats = {
    totalSessions: 28,
    completedSessions: 25,
    averageRating: 8.2,
    totalDuration: 42, // hours
    attendanceRate: 89.3,
    improvementRate: 12.5,
    streak: 7,
    personalBests: 3,
  };

  const recentSessions = [
    {
      id: 1,
      title: 'Technical Skills Training',
      date: '2025-08-17',
      duration: 90,
      intensity: 8.5,
      performance: 8.8,
      attendance: true,
      coach: 'Coach Martinez',
      drills: ['Ball Control', 'Passing Accuracy', 'First Touch'],
      feedback: 'Excellent improvement in ball control. Keep working on weak foot.',
      rating: 9,
      category: 'technical',
    },
    {
      id: 2,
      title: 'Tactical Awareness Session',
      date: '2025-08-15',
      duration: 75,
      intensity: 7.2,
      performance: 8.1,
      attendance: true,
      coach: 'Coach Smith',
      drills: ['Positioning', 'Decision Making', 'Game Reading'],
      feedback: 'Good tactical understanding. Work on quicker decision making.',
      rating: 8,
      category: 'tactical',
    },
    {
      id: 3,
      title: 'Physical Conditioning',
      date: '2025-08-13',
      duration: 60,
      intensity: 9.1,
      performance: 7.5,
      attendance: true,
      coach: 'Coach Johnson',
      drills: ['Sprint Training', 'Agility Ladder', 'Endurance Run'],
      feedback: 'Strong effort! Endurance is improving significantly.',
      rating: 8,
      category: 'physical',
    },
    {
      id: 4,
      title: 'Mental Preparation',
      date: '2025-08-11',
      duration: 45,
      intensity: 6.5,
      performance: 8.7,
      attendance: true,
      coach: 'Coach Williams',
      drills: ['Visualization', 'Concentration', 'Pressure Training'],
      feedback: 'Excellent mental focus during pressure situations.',
      rating: 9,
      category: 'mental',
    },
  ];

  const performanceChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [8.2, 8.5, 8.8, 8.1, 8.6, 9.0, 8.4],
        color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  const intensityBarData = {
    labels: ['Technical', 'Tactical', 'Physical', 'Mental'],
    datasets: [
      {
        data: [8.5, 7.2, 9.1, 6.5],
      },
    ],
  };

  const categoryDistribution = [
    {
      name: 'Technical',
      sessions: 12,
      color: COLORS.primary,
      legendFontColor: COLORS.text,
      legendFontSize: 14,
    },
    {
      name: 'Physical',
      sessions: 8,
      color: COLORS.success,
      legendFontColor: COLORS.text,
      legendFontSize: 14,
    },
    {
      name: 'Tactical',
      sessions: 6,
      color: COLORS.warning,
      legendFontColor: COLORS.text,
      legendFontSize: 14,
    },
    {
      name: 'Mental',
      sessions: 4,
      color: COLORS.accent,
      legendFontColor: COLORS.text,
      legendFontSize: 14,
    },
  ];

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

    loadTrainingData();
  }, [selectedPeriod]);

  const loadTrainingData = useCallback(async () => {
    try {
      // Dispatch action to load training analytics data
      // dispatch(loadTrainingAnalytics({ period: selectedPeriod, metric: selectedMetric }));
    } catch (error) {
      Alert.alert('Error', 'Failed to load training analytics');
    }
  }, [selectedPeriod, selectedMetric]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTrainingData();
    setRefreshing(false);
  }, [loadTrainingData]);

  const getIntensityColor = (intensity) => {
    if (intensity >= 8) return COLORS.error;
    if (intensity >= 6) return COLORS.warning;
    return COLORS.success;
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'technical': return 'precision-manufacturing';
      case 'tactical': return 'psychology';
      case 'physical': return 'fitness-center';
      case 'mental': return 'spa';
      default: return 'sports';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'technical': return COLORS.primary;
      case 'tactical': return COLORS.warning;
      case 'physical': return COLORS.success;
      case 'mental': return COLORS.accent;
      default: return COLORS.textSecondary;
    }
  };

  const StatsOverviewCard = () => (
    <Card style={styles.overviewCard} elevation={3}>
      <LinearGradient 
        colors={[COLORS.primary, COLORS.secondary]} 
        style={styles.overviewGradient}
      >
        <Card.Content>
          <View style={styles.overviewHeader}>
            <View>
              <Text style={[TEXT_STYLES.h2, styles.overviewTitle]}>Training Overview</Text>
              <Text style={styles.overviewSubtitle}>Your training journey at a glance 📈</Text>
            </View>
            <View style={styles.streakBadge}>
              <Icon name="local-fire-department" size={24} color={COLORS.warning} />
              <Text style={styles.streakNumber}>{trainingStats.streak}</Text>
              <Text style={styles.streakText}>day streak</Text>
            </View>
          </View>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Icon name="event-available" size={20} color="white" />
              <Text style={styles.statNumber}>{trainingStats.completedSessions}</Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="star" size={20} color="white" />
              <Text style={styles.statNumber}>{trainingStats.averageRating}</Text>
              <Text style={styles.statLabel}>Avg Rating</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="schedule" size={20} color="white" />
              <Text style={styles.statNumber}>{trainingStats.totalDuration}h</Text>
              <Text style={styles.statLabel}>Total Time</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="trending-up" size={20} color="white" />
              <Text style={styles.statNumber}>{trainingStats.attendanceRate}%</Text>
              <Text style={styles.statLabel}>Attendance</Text>
            </View>
          </View>
        </Card.Content>
      </LinearGradient>
    </Card>
  );

  const MetricsSection = () => (
    <Card style={styles.metricsCard} elevation={2}>
      <Card.Content>
        <View style={styles.metricsHeader}>
          <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>📊 Performance Metrics</Text>
          <View style={styles.periodSelector}>
            {periods.map(period => (
              <Chip
                key={period.id}
                mode={selectedPeriod === period.id ? 'flat' : 'outlined'}
                selected={selectedPeriod === period.id}
                onPress={() => setSelectedPeriod(period.id)}
                style={styles.periodChip}
                selectedColor={COLORS.primary}
                compact
              >
                {period.name}
              </Chip>
            ))}
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chartsContainer}>
          <View style={styles.chartSection}>
            <Text style={styles.chartTitle}>Weekly Performance</Text>
            <LineChart
              data={performanceChartData}
              width={width - 60}
              height={220}
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
                  stroke: COLORS.primary,
                }
              }}
              style={styles.chart}
              bezier
            />
          </View>

          <View style={styles.chartSection}>
            <Text style={styles.chartTitle}>Training Intensity</Text>
            <BarChart
              data={intensityBarData}
              width={width - 60}
              height={220}
              chartConfig={{
                backgroundColor: COLORS.surface,
                backgroundGradientFrom: COLORS.surface,
                backgroundGradientTo: COLORS.surface,
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
              }}
              style={styles.chart}
            />
          </View>

          <View style={styles.chartSection}>
            <Text style={styles.chartTitle}>Session Distribution</Text>
            <PieChart
              data={categoryDistribution}
              width={width - 60}
              height={220}
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="sessions"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
              style={styles.chart}
            />
          </View>
        </ScrollView>
      </Card.Content>
    </Card>
  );

  const QuickStatsCard = () => (
    <Card style={styles.quickStatsCard} elevation={2}>
      <Card.Content>
        <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>⚡ Quick Stats</Text>
        
        <View style={styles.quickStatsGrid}>
          <Surface style={styles.quickStatItem} elevation={1}>
            <Icon name="jump-rope" size={28} color={COLORS.warning} />
            <Text style={styles.quickStatNumber}>{trainingStats.personalBests}</Text>
            <Text style={styles.quickStatLabel}>Personal Bests</Text>
          </Surface>
          
          <Surface style={styles.quickStatItem} elevation={1}>
            <Icon name="auto-graph" size={28} color={COLORS.success} />
            <Text style={styles.quickStatNumber}>{trainingStats.improvementRate}%</Text>
            <Text style={styles.quickStatLabel}>Improvement</Text>
          </Surface>
          
          <Surface style={styles.quickStatItem} elevation={1}>
            <Icon name="schedule" size={28} color={COLORS.primary} />
            <Text style={styles.quickStatNumber}>4.2</Text>
            <Text style={styles.quickStatLabel}>Avg Session/Week</Text>
          </Surface>
          
          <Surface style={styles.quickStatItem} elevation={1}>
            <Icon name="groups" size={28} color={COLORS.accent} />
            <Text style={styles.quickStatNumber}>2</Text>
            <Text style={styles.quickStatLabel}>Active Teams</Text>
          </Surface>
        </View>
      </Card.Content>
    </Card>
  );

  const SessionItem = ({ session, index }) => {
    const isExpanded = expandedSession === session.id;
    
    return (
      <Card style={styles.sessionCard} elevation={1}>
        <TouchableOpacity
          onPress={() => setExpandedSession(isExpanded ? null : session.id)}
          activeOpacity={0.7}
        >
          <Card.Content style={styles.sessionContent}>
            <View style={styles.sessionHeader}>
              <View style={styles.sessionTitleContainer}>
                <View style={[styles.categoryDot, { backgroundColor: getCategoryColor(session.category) }]} />
                <View style={styles.sessionInfo}>
                  <Text style={[TEXT_STYLES.body, styles.sessionTitle]}>{session.title}</Text>
                  <Text style={styles.sessionDate}>
                    {new Date(session.date).toLocaleDateString()} • {session.duration} min
                  </Text>
                </View>
              </View>
              
              <View style={styles.sessionRating}>
                <Icon name="star" size={16} color={COLORS.warning} />
                <Text style={styles.ratingText}>{session.rating}</Text>
                <Icon 
                  name={isExpanded ? "expand-less" : "expand-more"} 
                  size={24} 
                  color={COLORS.textSecondary} 
                />
              </View>
            </View>

            <View style={styles.sessionMetrics}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Performance</Text>
                <View style={styles.metricBar}>
                  <ProgressBar 
                    progress={session.performance / 10} 
                    color={COLORS.primary}
                    style={styles.progressBar}
                  />
                  <Text style={styles.metricValue}>{session.performance}</Text>
                </View>
              </View>
              
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Intensity</Text>
                <View style={styles.metricBar}>
                  <ProgressBar 
                    progress={session.intensity / 10} 
                    color={getIntensityColor(session.intensity)}
                    style={styles.progressBar}
                  />
                  <Text style={styles.metricValue}>{session.intensity}</Text>
                </View>
              </View>
            </View>

            {isExpanded && (
              <Animated.View style={styles.expandedContent}>
                <View style={styles.coachInfo}>
                  <Avatar.Text 
                    size={32} 
                    label={session.coach.split(' ')[1]?.charAt(0) || 'C'} 
                    style={styles.coachAvatar}
                  />
                  <Text style={styles.coachName}>{session.coach}</Text>
                </View>

                <View style={styles.drillsSection}>
                  <Text style={styles.drillsTitle}>Drills Practiced:</Text>
                  <View style={styles.drillsList}>
                    {session.drills.map((drill, idx) => (
                      <Chip key={idx} mode="outlined" style={styles.drillChip}>
                        {drill}
                      </Chip>
                    ))}
                  </View>
                </View>

                <View style={styles.feedbackSection}>
                  <Text style={styles.feedbackTitle}>Coach Feedback:</Text>
                  <Text style={styles.feedbackText}>{session.feedback}</Text>
                </View>

                <View style={styles.sessionActions}>
                  <Button
                    mode="outlined"
                    onPress={() => Alert.alert('Feature Coming Soon', 'Session replay will be available soon!')}
                    style={styles.sessionActionBtn}
                    icon="play-circle-outline"
                  >
                    Replay
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => navigation.navigate('SessionFeedback', { sessionId: session.id })}
                    style={styles.sessionActionBtn}
                    buttonColor={COLORS.primary}
                    icon="feedback"
                  >
                    Feedback
                  </Button>
                </View>
              </Animated.View>
            )}
          </Card.Content>
        </TouchableOpacity>
      </Card>
    );
  };

  const GoalsProgressCard = () => (
    <Card style={styles.goalsCard} elevation={2}>
      <Card.Content>
        <View style={styles.goalsHeader}>
          <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>🎯 Training Goals</Text>
          <IconButton
            icon="add"
            size={24}
            onPress={() => navigation.navigate('SetGoals')}
            iconColor={COLORS.primary}
          />
        </View>

        <View style={styles.goalItem}>
          <View style={styles.goalInfo}>
            <Text style={styles.goalTitle}>Complete 30 Sessions This Month</Text>
            <Text style={styles.goalProgress}>25/30 sessions completed</Text>
          </View>
          <View style={styles.goalProgressContainer}>
            <ProgressBar 
              progress={25/30} 
              color={COLORS.success}
              style={styles.goalProgressBar}
            />
            <Text style={styles.goalPercentage}>83%</Text>
          </View>
        </View>

        <View style={styles.goalItem}>
          <View style={styles.goalInfo}>
            <Text style={styles.goalTitle}>Achieve 8.5 Average Performance</Text>
            <Text style={styles.goalProgress}>Current: 8.2/10</Text>
          </View>
          <View style={styles.goalProgressContainer}>
            <ProgressBar 
              progress={8.2/10} 
              color={COLORS.primary}
              style={styles.goalProgressBar}
            />
            <Text style={styles.goalPercentage}>82%</Text>
          </View>
        </View>

        <View style={styles.goalItem}>
          <View style={styles.goalInfo}>
            <Text style={styles.goalTitle}>Maintain 90% Attendance Rate</Text>
            <Text style={styles.goalProgress}>Current: 89.3%</Text>
          </View>
          <View style={styles.goalProgressContainer}>
            <ProgressBar 
              progress={0.893} 
              color={COLORS.warning}
              style={styles.goalProgressBar}
            />
            <Text style={styles.goalPercentage}>89%</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const ComparisonCard = () => (
    <Card style={styles.comparisonCard} elevation={2}>
      <Card.Content>
        <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>📈 Progress Comparison</Text>
        
        <View style={styles.comparisonMetrics}>
          <View style={styles.comparisonItem}>
            <Text style={styles.comparisonLabel}>vs Last Month</Text>
            <View style={styles.comparisonValue}>
              <Icon name="trending-up" size={16} color={COLORS.success} />
              <Text style={[styles.comparisonText, { color: COLORS.success }]}>+0.4 avg performance</Text>
            </View>
          </View>
          
          <View style={styles.comparisonItem}>
            <Text style={styles.comparisonLabel}>vs Team Average</Text>
            <View style={styles.comparisonValue}>
              <Icon name="trending-up" size={16} color={COLORS.success} />
              <Text style={[styles.comparisonText, { color: COLORS.success }]}>+0.8 above average</Text>
            </View>
          </View>
          
          <View style={styles.comparisonItem}>
            <Text style={styles.comparisonLabel}>vs Personal Best</Text>
            <View style={styles.comparisonValue}>
              <Icon name="trending-flat" size={16} color={COLORS.warning} />
              <Text style={[styles.comparisonText, { color: COLORS.warning }]}>-0.2 from best</Text>
            </View>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const filteredSessions = recentSessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.coach.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={[TEXT_STYLES.h2, styles.headerTitle]}>Training Analytics</Text>
            <Text style={styles.headerSubtitle}>Analyze your training performance 🏃‍♂️</Text>
          </View>
          <IconButton
            icon="share"
            size={24}
            iconColor="white"
            onPress={() => Alert.alert('Feature Coming Soon', 'Share analytics will be available soon!')}
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
          <StatsOverviewCard />

          <View style={styles.filterSection}>
            <Searchbar
              placeholder="Search sessions or coaches..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
              iconColor={COLORS.primary}
            />
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.metricFilter}
            >
              {metrics.map(metric => (
                <Chip
                  key={metric.id}
                  mode={selectedMetric === metric.id ? 'flat' : 'outlined'}
                  selected={selectedMetric === metric.id}
                  onPress={() => setSelectedMetric(metric.id)}
                  style={styles.metricChip}
                  icon={metric.icon}
                  selectedColor={COLORS.primary}
                >
                  {metric.name}
                </Chip>
              ))}
            </ScrollView>
          </View>

          <MetricsSection />
          <QuickStatsCard />
          <ComparisonCard />

          <Card style={styles.sessionsCard} elevation={2}>
            <Card.Content>
              <View style={styles.sessionsHeader}>
                <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>📋 Recent Sessions</Text>
                <Button
                  mode="outlined"
                  onPress={() => navigation.navigate('AllSessions')}
                  compact
                >
                  View All
                </Button>
              </View>

              {filteredSessions.map((session, index) => (
                <SessionItem key={session.id} session={session} index={index} />
              ))}
            </Card.Content>
          </Card>

          <Card style={styles.insightsCard} elevation={2}>
            <Card.Content>
              <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>🧠 AI Insights</Text>
              
              <View style={styles.insightItem}>
                <View style={styles.insightIcon}>
                  <Icon name="lightbulb" size={20} color={COLORS.warning} />
                </View>
                <View style={styles.insightContent}>
                  <Text style={styles.insightTitle}>Peak Performance Days</Text>
                  <Text style={styles.insightText}>
                    You perform best on Saturdays with an average rating of 9.0. Consider scheduling important sessions on weekends.
                  </Text>
                </View>
              </View>

              <View style={styles.insightItem}>
                <View style={styles.insightIcon}>
                  <Icon name="schedule" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.insightContent}>
                  <Text style={styles.insightTitle}>Optimal Training Duration</Text>
                  <Text style={styles.insightText}>
                    Your best performances occur in 75-90 minute sessions. Shorter sessions may not allow full skill development.
                  </Text>
                </View>
              </View>

              <View style={styles.insightItem}>
                <View style={styles.insightIcon}>
                  <Icon name="fitness-center" size={20} color={COLORS.success} />
                </View>
                <View style={styles.insightContent}>
                  <Text style={styles.insightTitle}>Recovery Pattern</Text>
                  <Text style={styles.insightText}>
                    You show 15% better performance after 1-day rest periods. Plan recovery days strategically.
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('DetailedAnalytics')}
              style={[styles.actionBtn, { backgroundColor: COLORS.primary }]}
              icon="analytics"
            >
              Detailed Analytics
            </Button>
            
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('ExportData')}
              style={styles.actionBtn}
              textColor={COLORS.primary}
              icon="download"
            >
              Export Data
            </Button>
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </Animated.View>

      <FAB
        style={styles.fab}
        icon="add"
        onPress={() => Alert.alert('Feature Coming Soon', 'Manual session logging will be available soon!')}
        color="white"
      />
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
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    marginTop: -SPACING.md,
  },
  overviewCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
  },
  overviewGradient: {
    borderRadius: 16,
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  overviewTitle: {
    color: 'white',
    marginBottom: SPACING.xs,
  },
  overviewSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
  },
  streakBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: SPACING.sm,
    borderRadius: 12,
  },
  streakNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  streakText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: SPACING.md,
    borderRadius: 12,
    marginHorizontal: SPACING.xs,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: SPACING.xs,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  filterSection: {
    marginBottom: SPACING.md,
  },
  searchBar: {
    marginBottom: SPACING.sm,
    borderRadius: 12,
  },
  metricFilter: {
    marginBottom: SPACING.sm,
  },
  metricChip: {
    marginRight: SPACING.sm,
  },
  metricsCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
  },
  metricsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    color: COLORS.text,
  },
  periodSelector: {
    flexDirection: 'row',
  },
  periodChip: {
    marginLeft: SPACING.xs,
  },
  chartsContainer: {
    marginHorizontal: -SPACING.md,
  },
  chartSection: {
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  chart: {
    borderRadius: 16,
  },
  quickStatsCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
  },
  quickStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickStatItem: {
    width: '48%',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.sm,
  },
  quickStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.sm,
  },
  quickStatLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  comparisonCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
  },
  comparisonMetrics: {
    marginTop: SPACING.sm,
  },
  comparisonItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  comparisonLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  comparisonValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  comparisonText: {
    marginLeft: SPACING.xs,
    fontSize: 14,
    fontWeight: '600',
  },
  goalsCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
  },
  goalsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  goalItem: {
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  goalInfo: {
    marginBottom: SPACING.sm,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  goalProgress: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  goalProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalProgressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.sm,
  },
  goalPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    minWidth: 35,
  },
  sessionsCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
  },
  sessionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sessionCard: {
    marginBottom: SPACING.sm,
    borderRadius: 12,
  },
  sessionContent: {
    padding: SPACING.md,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sessionTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.sm,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  sessionDate: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  sessionRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: SPACING.xs,
    marginRight: SPACING.sm,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  sessionMetrics: {
    marginBottom: SPACING.md,
  },
  metricItem: {
    marginBottom: SPACING.sm,
  },
  metricLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  metricBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    marginRight: SPACING.sm,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    minWidth: 25,
  },
  expandedContent: {
    borderTopWidth: 1,
    borderTopColor: COLORS.background,
    paddingTop: SPACING.md,
  },
  coachInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  coachAvatar: {
    marginRight: SPACING.sm,
    backgroundColor: COLORS.primary,
  },
  coachName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  drillsSection: {
    marginBottom: SPACING.md,
  },
  drillsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  drillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  drillChip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  feedbackSection: {
    marginBottom: SPACING.md,
  },
  feedbackTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  feedbackText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  sessionActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sessionActionBtn: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  insightsCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  insightText: {
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
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  bottomSpacing: {
    height: SPACING.xl,
  },
};

export default TrainingAnalytics;