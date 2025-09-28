import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Dimensions,
  Alert,
  StatusBar,
  Animated,
  TouchableOpacity,
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
  SegmentedButtons,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  LineChart,
  BarChart,
  PieChart,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Constants
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
  chartColors: ['#667eea', '#764ba2', '#4CAF50', '#FF9800', '#F44336', '#9C27B0'],
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
const chartWidth = width - SPACING.md * 4;
const chartHeight = 220;

const ProgressCharts = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [timeframe, setTimeframe] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('overall');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [chartsAnim] = useState(new Animated.Value(0));

  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const progressData = useSelector(state => state.performance.progressData);

  // Mock progress data for charts
  const mockProgressData = {
    overall: {
      weekly: [
        { period: 'W1', score: 65, improvement: 5 },
        { period: 'W2', score: 70, improvement: 5 },
        { period: 'W3', score: 68, improvement: -2 },
        { period: 'W4', score: 75, improvement: 7 },
        { period: 'W5', score: 78, improvement: 3 },
        { period: 'W6', score: 82, improvement: 4 },
        { period: 'W7', score: 85, improvement: 3 },
        { period: 'W8', score: 88, improvement: 3 },
      ],
      monthly: [
        { period: 'Jan', score: 65, improvement: 0 },
        { period: 'Feb', score: 70, improvement: 5 },
        { period: 'Mar', score: 75, improvement: 5 },
        { period: 'Apr', score: 78, improvement: 3 },
        { period: 'May', score: 82, improvement: 4 },
        { period: 'Jun', score: 85, improvement: 3 },
        { period: 'Jul', score: 88, improvement: 3 },
        { period: 'Aug', score: 92, improvement: 4 },
      ],
    },
    skills: {
      current: [
        { skill: 'Speed', value: 85, target: 90, color: COLORS.chartColors[0] },
        { skill: 'Strength', value: 78, target: 85, color: COLORS.chartColors[1] },
        { skill: 'Endurance', value: 82, target: 88, color: COLORS.chartColors[2] },
        { skill: 'Technique', value: 90, target: 95, color: COLORS.chartColors[3] },
        { skill: 'Teamwork', value: 88, target: 92, color: COLORS.chartColors[4] },
      ],
      progress: [
        { period: 'W1', Speed: 75, Strength: 70, Endurance: 72, Technique: 80, Teamwork: 85 },
        { period: 'W2', Speed: 78, Strength: 72, Endurance: 74, Technique: 82, Teamwork: 86 },
        { period: 'W3', Speed: 80, Strength: 74, Endurance: 76, Technique: 84, Teamwork: 87 },
        { period: 'W4', Speed: 82, Strength: 76, Endurance: 78, Technique: 86, Teamwork: 87 },
        { period: 'W5', Speed: 83, Strength: 77, Endurance: 80, Technique: 88, Teamwork: 88 },
        { period: 'W6', Speed: 84, Strength: 78, Endurance: 81, Technique: 89, Teamwork: 88 },
        { period: 'W7', Speed: 85, Strength: 78, Endurance: 82, Technique: 90, Teamwork: 88 },
      ],
    },
    sessions: {
      attendance: [
        { period: 'Week 1', attended: 4, total: 5, percentage: 80 },
        { period: 'Week 2', attended: 5, total: 5, percentage: 100 },
        { period: 'Week 3', attended: 3, total: 4, percentage: 75 },
        { period: 'Week 4', attended: 5, total: 5, percentage: 100 },
        { period: 'Week 5', attended: 4, total: 5, percentage: 80 },
        { period: 'Week 6', attended: 5, total: 5, percentage: 100 },
        { period: 'Week 7', attended: 5, total: 5, percentage: 100 },
        { period: 'Week 8', attended: 4, total: 4, percentage: 100 },
      ],
      types: [
        { name: 'Technical Training', value: 35, color: COLORS.chartColors[0] },
        { name: 'Physical Training', value: 30, color: COLORS.chartColors[1] },
        { name: 'Match Play', value: 20, color: COLORS.chartColors[2] },
        { name: 'Recovery', value: 15, color: COLORS.chartColors[3] },
      ],
    },
    achievements: {
      monthly: [
        { period: 'Jan', badges: 2, records: 1 },
        { period: 'Feb', badges: 1, records: 2 },
        { period: 'Mar', badges: 3, records: 1 },
        { period: 'Apr', badges: 2, records: 3 },
        { period: 'May', badges: 4, records: 2 },
        { period: 'Jun', badges: 3, records: 4 },
        { period: 'Jul', badges: 5, records: 3 },
        { period: 'Aug', badges: 4, records: 5 },
      ],
    },
  };

  const timeframeOptions = [
    { value: 'week', label: 'Week', icon: 'date-range' },
    { value: 'month', label: 'Month', icon: 'calendar-today' },
    { value: 'quarter', label: '3 Months', icon: 'event-note' },
  ];

  const metricOptions = [
    { value: 'overall', label: 'Overall', icon: 'assessment' },
    { value: 'skills', label: 'Skills', icon: 'trending-up' },
    { value: 'sessions', label: 'Sessions', icon: 'event' },
    { value: 'achievements', label: 'Achievements', icon: 'jump-rope' },
  ];

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(chartsAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert('Updated! 📊', 'Your progress charts have been refreshed!');
    } catch (error) {
      Alert.alert('Oops! 😅', 'Unable to refresh charts. Please try again later.');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleExportCharts = () => {
    Alert.alert(
      'Export Charts! 📈',
      'This feature will let you save and share your progress charts!',
      [{ text: 'Coming Soon!', style: 'default' }]
    );
  };

  const renderOverviewCard = () => {
    const currentScore = mockProgressData.overall.weekly[mockProgressData.overall.weekly.length - 1]?.score || 0;
    const lastWeekScore = mockProgressData.overall.weekly[mockProgressData.overall.weekly.length - 2]?.score || 0;
    const improvement = currentScore - lastWeekScore;

    return (
      <Card style={styles.overviewCard} elevation={4}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.overviewGradient}
        >
          <View style={styles.overviewContent}>
            <View style={styles.overviewStats}>
              <View style={styles.overviewStatItem}>
                <Icon name="trending-up" size={32} color="#fff" />
                <Text style={styles.overviewStatValue}>{currentScore}%</Text>
                <Text style={styles.overviewStatLabel}>Current Score</Text>
              </View>
              <View style={styles.overviewStatItem}>
                <Icon name={improvement >= 0 ? "arrow-upward" : "arrow-downward"} size={32} color="#fff" />
                <Text style={styles.overviewStatValue}>
                  {improvement >= 0 ? '+' : ''}{improvement}%
                </Text>
                <Text style={styles.overviewStatLabel}>This Week</Text>
              </View>
              <View style={styles.overviewStatItem}>
                <Icon name="flag" size={32} color="#fff" />
                <Text style={styles.overviewStatValue}>95%</Text>
                <Text style={styles.overviewStatLabel}>Goal</Text>
              </View>
            </View>
            <Text style={styles.overviewMotivation}>
              Keep up the amazing progress! 🚀
            </Text>
          </View>
        </LinearGradient>
      </Card>
    );
  };

  const renderTimeframeSelector = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      style={styles.selectorContainer}
      contentContainerStyle={styles.selectorContent}
    >
      {timeframeOptions.map((option) => (
        <TouchableOpacity
          key={option.value}
          onPress={() => setTimeframe(option.value)}
          style={[
            styles.selectorButton,
            timeframe === option.value && styles.selectedSelectorButton
          ]}
        >
          <Icon 
            name={option.icon} 
            size={20} 
            color={timeframe === option.value ? '#fff' : COLORS.primary} 
          />
          <Text style={[
            styles.selectorText,
            timeframe === option.value && styles.selectedSelectorText
          ]}>
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderMetricSelector = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      style={styles.selectorContainer}
      contentContainerStyle={styles.selectorContent}
    >
      {metricOptions.map((option) => (
        <TouchableOpacity
          key={option.value}
          onPress={() => setSelectedMetric(option.value)}
          style={[
            styles.metricButton,
            selectedMetric === option.value && styles.selectedMetricButton
          ]}
        >
          <Icon 
            name={option.icon} 
            size={18} 
            color={selectedMetric === option.value ? '#fff' : COLORS.primary} 
          />
          <Text style={[
            styles.metricText,
            selectedMetric === option.value && styles.selectedMetricText
          ]}>
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderOverallProgressChart = () => (
    <Animated.View style={[styles.chartContainer, { opacity: chartsAnim }]}>
      <Card style={styles.chartCard} elevation={3}>
        <Card.Content>
          <View style={styles.chartHeader}>
            <Icon name="show-chart" size={24} color={COLORS.primary} />
            <Text style={styles.chartTitle}>Overall Progress Trend 📈</Text>
          </View>
          
          <View style={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={chartHeight}>
              <AreaChart data={mockProgressData.overall.weekly}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="period" axisLine={false} tickLine={false} />
                <YAxis hide />
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: COLORS.surface,
                    border: `1px solid ${COLORS.primary}`,
                    borderRadius: 8,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke={COLORS.primary}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorScore)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </View>

          <View style={styles.chartInsights}>
            <Surface style={styles.insightItem}>
              <Icon name="trending-up" size={16} color={COLORS.success} />
              <Text style={styles.insightText}>+23% improvement this month</Text>
            </Surface>
            <Surface style={styles.insightItem}>
              <Icon name="timeline" size={16} color={COLORS.primary} />
              <Text style={styles.insightText}>Consistent upward trend</Text>
            </Surface>
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderSkillsChart = () => (
    <Animated.View style={[styles.chartContainer, { opacity: chartsAnim }]}>
      <Card style={styles.chartCard} elevation={3}>
        <Card.Content>
          <View style={styles.chartHeader}>
            <Icon name="radar" size={24} color={COLORS.primary} />
            <Text style={styles.chartTitle}>Skills Breakdown 🎯</Text>
          </View>

          <View style={styles.skillsProgress}>
            {mockProgressData.skills.current.map((skill, index) => (
              <View key={skill.skill} style={styles.skillProgressItem}>
                <View style={styles.skillProgressHeader}>
                  <Text style={styles.skillProgressName}>{skill.skill}</Text>
                  <Text style={styles.skillProgressValue}>{skill.value}%</Text>
                </View>
                <ProgressBar 
                  progress={skill.value / 100} 
                  color={skill.color}
                  style={styles.skillProgressBar}
                />
                <View style={styles.skillProgressFooter}>
                  <Text style={styles.skillProgressTarget}>Target: {skill.target}%</Text>
                  <Text style={styles.skillProgressRemaining}>
                    {skill.target - skill.value}% to go
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={mockProgressData.skills.progress}>
                <XAxis dataKey="period" axisLine={false} tickLine={false} />
                <YAxis hide />
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <Tooltip />
                {Object.keys(mockProgressData.skills.progress[0] || {})
                  .filter(key => key !== 'period')
                  .map((skill, index) => (
                    <Line
                      key={skill}
                      type="monotone"
                      dataKey={skill}
                      stroke={COLORS.chartColors[index]}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  ))
                }
              </LineChart>
            </ResponsiveContainer>
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderSessionsChart = () => (
    <Animated.View style={[styles.chartContainer, { opacity: chartsAnim }]}>
      <Card style={styles.chartCard} elevation={3}>
        <Card.Content>
          <View style={styles.chartHeader}>
            <Icon name="event" size={24} color={COLORS.primary} />
            <Text style={styles.chartTitle}>Training Sessions 📅</Text>
          </View>

          <View style={styles.sessionStats}>
            <Surface style={styles.sessionStatItem}>
              <Icon name="event-available" size={20} color={COLORS.success} />
              <Text style={styles.sessionStatValue}>36</Text>
              <Text style={styles.sessionStatLabel}>Sessions Completed</Text>
            </Surface>
            <Surface style={styles.sessionStatItem}>
              <Icon name="percent" size={20} color={COLORS.primary} />
              <Text style={styles.sessionStatValue}>92%</Text>
              <Text style={styles.sessionStatLabel}>Attendance Rate</Text>
            </Surface>
          </View>

          <View style={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={mockProgressData.sessions.attendance}>
                <XAxis dataKey="period" axisLine={false} tickLine={false} />
                <YAxis hide />
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <Tooltip />
                <Bar dataKey="percentage" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </View>

          <View style={styles.pieChartContainer}>
            <Text style={styles.pieChartTitle}>Session Types Distribution</Text>
            <View style={styles.pieChartWrapper}>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={mockProgressData.sessions.types}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                    fill="#8884d8"
                  />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <View style={styles.pieChartLegend}>
                {mockProgressData.sessions.types.map((item, index) => (
                  <View key={item.name} style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                    <Text style={styles.legendText}>{item.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderAchievementsChart = () => (
    <Animated.View style={[styles.chartContainer, { opacity: chartsAnim }]}>
      <Card style={styles.chartCard} elevation={3}>
        <Card.Content>
          <View style={styles.chartHeader}>
            <Icon name="jump-rope" size={24} color={COLORS.primary} />
            <Text style={styles.chartTitle}>Achievements Timeline 🏆</Text>
          </View>

          <View style={styles.achievementStats}>
            <Surface style={styles.achievementStatItem}>
              <Icon name="military-tech" size={20} color={COLORS.warning} />
              <Text style={styles.achievementStatValue}>26</Text>
              <Text style={styles.achievementStatLabel}>Total Badges</Text>
            </Surface>
            <Surface style={styles.achievementStatItem}>
              <Icon name="jump-rope" size={20} color={COLORS.success} />
              <Text style={styles.achievementStatValue}>21</Text>
              <Text style={styles.achievementStatLabel}>Personal Records</Text>
            </Surface>
          </View>

          <View style={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={mockProgressData.achievements.monthly}>
                <XAxis dataKey="period" axisLine={false} tickLine={false} />
                <YAxis hide />
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <Tooltip />
                <Bar dataKey="badges" fill={COLORS.warning} radius={[2, 2, 0, 0]} />
                <Bar dataKey="records" fill={COLORS.success} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </View>

          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: COLORS.warning }]} />
              <Text style={styles.legendText}>Badges Earned</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: COLORS.success }]} />
              <Text style={styles.legendText}>Records Set</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderCurrentChart = () => {
    switch (selectedMetric) {
      case 'overall':
        return renderOverallProgressChart();
      case 'skills':
        return renderSkillsChart();
      case 'sessions':
        return renderSessionsChart();
      case 'achievements':
        return renderAchievementsChart();
      default:
        return renderOverallProgressChart();
    }
  };

  const renderQuickActions = () => (
    <Card style={styles.actionsCard} elevation={2}>
      <Card.Content>
        <Text style={[TEXT_STYLES.subheading, styles.actionsTitle]}>
          Quick Actions ⚡
        </Text>
        <View style={styles.actionsGrid}>
          <Button
            mode="contained"
            onPress={handleExportCharts}
            style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
            labelStyle={styles.actionButtonText}
            icon="download"
          >
            Export Charts
          </Button>
          <Button
            mode="contained"
            onPress={() => Alert.alert('Coming Soon! 📊', 'Detailed analytics feature coming soon!')}
            style={[styles.actionButton, { backgroundColor: COLORS.success }]}
            labelStyle={styles.actionButtonText}
            icon="analytics"
          >
            Detailed View
          </Button>
          <Button
            mode="outlined"
            onPress={() => Alert.alert('Share Progress! 📱', 'Share your amazing progress with coach and family!')}
            style={styles.actionButton}
            labelStyle={[styles.actionButtonText, { color: COLORS.primary }]}
            icon="share"
          >
            Share Progress
          </Button>
          <Button
            mode="outlined"
            onPress={() => Alert.alert('Set Goals! 🎯', 'Goal setting feature coming soon!')}
            style={styles.actionButton}
            labelStyle={[styles.actionButtonText, { color: COLORS.primary }]}
            icon="flag"
          >
            Set New Goals
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Progress Charts</Text>
        <Text style={styles.headerSubtitle}>Visualize your amazing journey! 📊</Text>
      </LinearGradient>

      <Animated.ScrollView
        style={[styles.content, { opacity: fadeAnim }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderOverviewCard()}
        {renderTimeframeSelector()}
        {renderMetricSelector()}
        {renderCurrentChart()}
        {renderQuickActions()}

        <View style={styles.bottomSpacing} />
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 50,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerTitle: {
    ...TEXT_STYLES.heading,
    color: '#fff',
    textAlign: 'center',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
    marginTop: SPACING.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    marginTop: -SPACING.md,
  },
  overviewCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    overflow: 'hidden',
  },
  overviewGradient: {
    padding: SPACING.lg,
  },
  overviewContent: {
    alignItems: 'center',
  },
  overviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: SPACING.md,
  },
  overviewStatItem: {
    alignItems: 'center',
  },
  overviewStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: SPACING.xs,
  },
  overviewStatLabel: {
    ...TEXT_STYLES.caption,
    color: '#fff',
    opacity: 0.9,
    marginTop: SPACING.xs,
  },
  overviewMotivation: {
    ...TEXT_STYLES.body,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  selectorContainer: {
    marginBottom: SPACING.md,
  },
  selectorContent: {
    paddingRight: SPACING.md,
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginRight: SPACING.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
    elevation: 1,
  },
  selectedSelectorButton: {
    backgroundColor: COLORS.primary,
  },
  selectorText: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  selectedSelectorText: {
    color: '#fff',
  },
  metricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    marginRight: SPACING.xs,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.primary,
    elevation: 1,
  },
  selectedMetricButton: {
    backgroundColor: COLORS.primary,
  },
  metricText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  selectedMetricText: {
    color: '#fff',
  },
  chartContainer: {
    marginBottom: SPACING.md,
  },
  chartCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  chartTitle: {
    ...TEXT_STYLES.subheading,
    marginLeft: SPACING.sm,
  },
  chartWrapper: {
    backgroundColor: '#fafafa',
    borderRadius: 8,
    padding: SPACING.xs,
    marginVertical: SPACING.sm,
  },
  chartInsights: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.md,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: 8,
    elevation: 1,
  },
  insightText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  skillsProgress: {
    marginBottom: SPACING.md,
  },
  skillProgressItem: {
    marginBottom: SPACING.md,
  },
  skillProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  skillProgressName: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
  },
  skillProgressValue: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  skillProgressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
  },
  skillProgressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
  },
  skillProgressTarget: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  skillProgressRemaining: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: '600',
  },
  sessionStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  sessionStatItem: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 12,
    elevation: 2,
    minWidth: 120,
  },
  sessionStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  sessionStatLabel: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  pieChartContainer: {
    marginTop: SPACING.lg,
  },
  pieChartTitle: {
    ...TEXT_STYLES.subheading,
    textAlign: 'center',
    marginBottom: SPACING.md,
    fontSize: 16,
  },
  pieChartWrapper: {
    alignItems: 'center',
  },
  pieChartLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: SPACING.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.sm,
    marginVertical: SPACING.xs,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.xs,
  },
  legendText: {
    ...TEXT_STYLES.caption,
    fontSize: 12,
  },
  achievementStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  achievementStatItem: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 12,
    elevation: 2,
    minWidth: 120,
  },
  achievementStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  achievementStatLabel: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.md,
  },
  actionsCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
  },
  actionsTitle: {
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: (width - SPACING.md * 4) / 2,
    marginBottom: SPACING.sm,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: SPACING.xl,
  },
});

// Export statement
export default ProgressCharts;