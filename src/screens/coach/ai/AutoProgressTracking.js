import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
  TextInput,
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
  Portal,
  Modal,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import { BlurView } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { COLORS } from '../../../styles/colors';
import { SPACING } from '../../../styles/spacing';
import { TEXT_STYLES } from '../../../styles/textStyles';
import { TYPOGRAPHY } from '../../../styles/typography';

const { width: screenWidth } = Dimensions.get('window');

const AutoProgressTrackingScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { trainees, loading } = useSelector(state => state.training);
  
  // State Management
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [selectedTrainees, setSelectedTrainees] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState(['performance', 'attendance', 'improvement']);
  const [notificationCount, setNotificationCount] = useState(3);

  // Mock data for demonstration
  const mockTrainees = [
    {
      id: 1,
      name: 'Alex Johnson',
      sport: 'Football',
      age: 16,
      joinDate: '2024-01-15',
      avatar: '🏃‍♂️',
      currentLevel: 'Intermediate',
      attendance: 92,
      performance: 85,
      improvement: 15,
      lastSession: '2024-08-14',
      nextSession: '2024-08-17',
      goals: ['Speed', 'Agility', 'Endurance'],
      recentScores: [78, 82, 85, 88, 85],
      status: 'on-track'
    },
    {
      id: 2,
      name: 'Sarah Williams',
      sport: 'Basketball',
      age: 14,
      joinDate: '2024-02-20',
      avatar: '⛹️‍♀️',
      currentLevel: 'Beginner',
      attendance: 88,
      performance: 78,
      improvement: 22,
      lastSession: '2024-08-15',
      nextSession: '2024-08-18',
      goals: ['Shooting', 'Dribbling', 'Defense'],
      recentScores: [65, 70, 75, 78, 78],
      status: 'needs-attention'
    },
    {
      id: 3,
      name: 'Michael Chen',
      sport: 'Tennis',
      age: 17,
      joinDate: '2024-03-10',
      avatar: '🎾',
      currentLevel: 'Advanced',
      attendance: 96,
      performance: 92,
      improvement: 8,
      lastSession: '2024-08-16',
      nextSession: '2024-08-19',
      goals: ['Serve Power', 'Backhand', 'Mental Game'],
      recentScores: [88, 90, 92, 94, 92],
      status: 'excellent'
    }
  ];

  const performanceData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
    datasets: [
      {
        data: [78, 82, 85, 88, 85],
        color: () => COLORS.primary,
        strokeWidth: 3,
      },
      {
        data: [65, 70, 75, 78, 78],
        color: () => COLORS.success,
        strokeWidth: 3,
      },
      {
        data: [88, 90, 92, 94, 92],
        color: () => COLORS.warning,
        strokeWidth: 3,
      },
    ],
    legend: ['Alex', 'Sarah', 'Michael']
  };

  const attendanceData = [
    {
      name: 'Present',
      population: 85,
      color: COLORS.success,
      legendFontColor: COLORS.text,
      legendFontSize: 12,
    },
    {
      name: 'Excused',
      population: 10,
      color: COLORS.warning,
      legendFontColor: COLORS.text,
      legendFontSize: 12,
    },
    {
      name: 'Unexcused',
      population: 5,
      color: COLORS.error,
      legendFontColor: COLORS.text,
      legendFontSize: 12,
    },
  ];

  const chartConfig = {
    backgroundColor: COLORS.background,
    backgroundGradientFrom: COLORS.background,
    backgroundGradientTo: COLORS.background,
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: COLORS.primary,
    },
  };

  // Navigation setup
  useEffect(() => {
    navigation.setOptions({
      title: 'Auto Progress Tracking 📊',
      headerShown: true,
      headerStyle: {
        backgroundColor: COLORS.primary,
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      headerRight: () => (
        <View style={{ flexDirection: 'row' }}>
          <IconButton
            icon="download"
            iconColor="#fff"
            onPress={handleExportReport}
          />
          <IconButton
            icon="settings"
            iconColor="#fff"
            onPress={handleSettings}
          />
        </View>
      ),
    });
  }, [navigation]);

  // Handlers
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate data refresh
      await new Promise(resolve => setTimeout(resolve, 2000));
      Vibration.vibrate(50);
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleExportReport = () => {
    Alert.alert(
      'Export Report 📄',
      'This feature is currently in development. You\'ll be able to export detailed progress reports soon!',
      [{ text: 'Got it! 👍', style: 'default' }]
    );
  };

  const handleSettings = () => {
    Alert.alert(
      'Progress Settings ⚙️',
      'Customize your tracking preferences and notification settings.',
      [{ text: 'Coming Soon! 🚀', style: 'default' }]
    );
  };

  const handleTraineeDetails = (trainee) => {
    Vibration.vibrate(50);
    Alert.alert(
      `${trainee.name} Details 👀`,
      `View detailed progress analytics and session history for ${trainee.name}.`,
      [{ text: 'Open Details', style: 'default' }]
    );
  };

  const handleSetGoals = () => {
    Alert.alert(
      'Set New Goals 🎯',
      'Create and assign new performance goals for your trainees.',
      [{ text: 'Create Goals', style: 'default' }]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return COLORS.success;
      case 'on-track': return COLORS.primary;
      case 'needs-attention': return COLORS.warning;
      default: return COLORS.text;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'excellent': return 'check-circle';
      case 'on-track': return 'trending-up';
      case 'needs-attention': return 'warning';
      default: return 'assessment';
    }
  };

  const filteredTrainees = mockTrainees.filter(trainee =>
    trainee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trainee.sport.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Quick Stats Component
  const QuickStats = () => (
    <View style={styles.statsContainer}>
      <Card style={styles.statCard}>
        <Card.Content>
          <View style={styles.statHeader}>
            <View>
              <Text style={styles.statLabel}>Total Trainees</Text>
              <Text style={styles.statValue}>{mockTrainees.length}</Text>
            </View>
            <Surface style={[styles.statIcon, { backgroundColor: `${COLORS.primary}20` }]}>
              <Icon name="people" size={24} color={COLORS.primary} />
            </Surface>
          </View>
          <View style={styles.statTrend}>
            <Icon name="trending-up" size={16} color={COLORS.success} />
            <Text style={[styles.trendText, { color: COLORS.success }]}>+2 this month</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.statCard}>
        <Card.Content>
          <View style={styles.statHeader}>
            <View>
              <Text style={styles.statLabel}>Avg Performance</Text>
              <Text style={styles.statValue}>85%</Text>
            </View>
            <Surface style={[styles.statIcon, { backgroundColor: `${COLORS.success}20` }]}>
              <Icon name="target" size={24} color={COLORS.success} />
            </Surface>
          </View>
          <View style={styles.statTrend}>
            <Icon name="trending-up" size={16} color={COLORS.success} />
            <Text style={[styles.trendText, { color: COLORS.success }]}>+5% from last week</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.statCard}>
        <Card.Content>
          <View style={styles.statHeader}>
            <View>
              <Text style={styles.statLabel}>Attendance Rate</Text>
              <Text style={styles.statValue}>92%</Text>
            </View>
            <Surface style={[styles.statIcon, { backgroundColor: `${COLORS.warning}20` }]}>
              <Icon name="event" size={24} color={COLORS.warning} />
            </Surface>
          </View>
          <View style={styles.statTrend}>
            <Icon name="check-circle" size={16} color={COLORS.success} />
            <Text style={[styles.trendText, { color: COLORS.success }]}>Excellent</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.statCard}>
        <Card.Content>
          <View style={styles.statHeader}>
            <View>
              <Text style={styles.statLabel}>Improvement</Text>
              <Text style={styles.statValue}>+15%</Text>
            </View>
            <Surface style={[styles.statIcon, { backgroundColor: `${COLORS.secondary}20` }]}>
              <Icon name="jump-rope" size={24} color={COLORS.secondary} />
            </Surface>
          </View>
          <View style={styles.statTrend}>
            <Icon name="star" size={16} color={COLORS.success} />
            <Text style={[styles.trendText, { color: COLORS.success }]}>Above target</Text>
          </View>
        </Card.Content>
      </Card>
    </View>
  );

  // Controls Component
  const Controls = () => (
    <Card style={styles.controlsCard}>
      <Card.Content>
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search trainees..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            iconColor={COLORS.primary}
          />
        </View>

        <View style={styles.filtersRow}>
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Timeframe</Text>
            <Surface style={styles.picker}>
              <Text style={styles.pickerText}>{selectedTimeframe}</Text>
              <Icon name="keyboard-arrow-down" size={20} color={COLORS.text} />
            </Surface>
          </View>

          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Sport</Text>
            <Surface style={styles.picker}>
              <Text style={styles.pickerText}>{selectedTrainees}</Text>
              <Icon name="keyboard-arrow-down" size={20} color={COLORS.text} />
            </Surface>
          </View>

          <TouchableOpacity
            style={styles.filtersButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Icon name="filter-list" size={20} color={COLORS.text} />
            <Text style={styles.filtersButtonText}>Filters</Text>
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );

  // Tab Navigation Component
  const TabNavigation = () => (
    <Surface style={styles.tabContainer}>
      {['overview', 'individual', 'analytics', 'goals'].map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[
            styles.tab,
            activeTab === tab && styles.activeTab
          ]}
          onPress={() => {
            setActiveTab(tab);
            Vibration.vibrate(30);
          }}
        >
          <Text style={[
            styles.tabText,
            activeTab === tab && styles.activeTabText
          ]}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </Surface>
  );

  // Overview Tab Content
  const OverviewContent = () => (
    <View style={styles.tabContent}>
      <Card style={styles.chartCard}>
        <Card.Content>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Performance Trends 📈</Text>
            <View style={styles.chartControls}>
              <IconButton icon="show-chart" size={20} />
              <IconButton icon="bar-chart" size={20} />
            </View>
          </View>
          <LineChart
            data={performanceData}
            width={screenWidth - 60}
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
            bezier
          />
        </Card.Content>
      </Card>

      <View style={styles.chartsRow}>
        <Card style={styles.halfCard}>
          <Card.Content>
            <Text style={styles.chartTitle}>Attendance Overview 📅</Text>
            <PieChart
              data={attendanceData}
              width={screenWidth / 2 - 40}
              height={180}
              chartConfig={chartConfig}
              accessor="population"
              style={styles.pieChart}
            />
          </Card.Content>
        </Card>

        <Card style={styles.halfCard}>
          <Card.Content>
            <Text style={styles.chartTitle}>Skill Development 🎯</Text>
            <View style={styles.skillsContainer}>
              {['Speed', 'Agility', 'Strength', 'Endurance'].map((skill, index) => (
                <View key={skill} style={styles.skillItem}>
                  <Text style={styles.skillName}>{skill}</Text>
                  <ProgressBar
                    progress={(85 + index * 5) / 100}
                    color={COLORS.primary}
                    style={styles.progressBar}
                  />
                  <Text style={styles.skillValue}>{85 + index * 5}%</Text>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>
      </View>
    </View>
  );

  // Individual Tab Content
  const IndividualContent = () => (
    <View style={styles.tabContent}>
      {filteredTrainees.map((trainee) => (
        <Card key={trainee.id} style={styles.traineeCard}>
          <Card.Content>
            <View style={styles.traineeHeader}>
              <View style={styles.traineeInfo}>
                <Text style={styles.traineeAvatar}>{trainee.avatar}</Text>
                <View>
                  <Text style={styles.traineeName}>{trainee.name}</Text>
                  <Text style={styles.traineeDetails}>{trainee.sport} • {trainee.age} years</Text>
                </View>
              </View>
              <Chip
                mode="outlined"
                textStyle={{ color: getStatusColor(trainee.status) }}
                style={{ borderColor: getStatusColor(trainee.status) }}
                icon={() => <Icon name={getStatusIcon(trainee.status)} size={16} color={getStatusColor(trainee.status)} />}
              >
                {trainee.status.replace('-', ' ')}
              </Chip>
            </View>

            <View style={styles.traineeMetrics}>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Performance</Text>
                <View style={styles.metricValue}>
                  <ProgressBar
                    progress={trainee.performance / 100}
                    color={COLORS.primary}
                    style={styles.metricBar}
                  />
                  <Text style={styles.metricText}>{trainee.performance}%</Text>
                </View>
              </View>

              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Attendance</Text>
                <View style={styles.metricValue}>
                  <ProgressBar
                    progress={trainee.attendance / 100}
                    color={COLORS.success}
                    style={styles.metricBar}
                  />
                  <Text style={styles.metricText}>{trainee.attendance}%</Text>
                </View>
              </View>

              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Improvement</Text>
                <View style={styles.improvementValue}>
                  <Icon name="trending-up" size={16} color={COLORS.success} />
                  <Text style={[styles.metricText, { color: COLORS.success }]}>+{trainee.improvement}%</Text>
                </View>
              </View>
            </View>

            <View style={styles.goalsSection}>
              <Text style={styles.goalsLabel}>Focus Areas</Text>
              <View style={styles.goalsContainer}>
                {trainee.goals.map((goal) => (
                  <Chip key={goal} mode="flat" style={styles.goalChip}>
                    {goal}
                  </Chip>
                ))}
              </View>
            </View>

            <View style={styles.traineeFooter}>
              <View style={styles.sessionDates}>
                <Text style={styles.sessionText}>Last: {new Date(trainee.lastSession).toLocaleDateString()}</Text>
                <Text style={styles.sessionText}>Next: {new Date(trainee.nextSession).toLocaleDateString()}</Text>
              </View>
              <Button
                mode="contained"
                onPress={() => handleTraineeDetails(trainee)}
                style={styles.detailsButton}
                icon="visibility"
              >
                Details
              </Button>
            </View>
          </Card.Content>
        </Card>
      ))}
    </View>
  );

  // Analytics Tab Content
  const AnalyticsContent = () => (
    <View style={styles.tabContent}>
      <Card style={styles.insightsCard}>
        <Card.Content>
          <Text style={styles.chartTitle}>Key Insights & Recommendations 💡</Text>
          <View style={styles.insightsContainer}>
            <View style={[styles.insightItem, { borderLeftColor: COLORS.success }]}>
              <Icon name="check-circle" size={20} color={COLORS.success} />
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>Strength</Text>
                <Text style={styles.insightText}>Overall attendance rate is excellent at 92%, showing strong commitment.</Text>
              </View>
            </View>

            <View style={[styles.insightItem, { borderLeftColor: COLORS.warning }]}>
              <Icon name="lightbulb-outline" size={20} color={COLORS.warning} />
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>Opportunity</Text>
                <Text style={styles.insightText}>Consider additional support for trainees showing declining performance trends.</Text>
              </View>
            </View>

            <View style={[styles.insightItem, { borderLeftColor: COLORS.primary }]}>
              <Icon name="flag" size={20} color={COLORS.primary} />
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>Action</Text>
                <Text style={styles.insightText}>Implement peer mentoring program to maintain momentum in skill development.</Text>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>
    </View>
  );

  // Goals Tab Content
  const GoalsContent = () => (
    <View style={styles.tabContent}>
      <Card style={styles.goalsOverviewCard}>
        <Card.Content>
          <View style={styles.goalsHeader}>
            <Text style={styles.chartTitle}>Goal Achievement Overview 🏆</Text>
            <Button
              mode="contained"
              onPress={handleSetGoals}
              style={styles.setGoalsButton}
              icon="add"
            >
              Set Goals
            </Button>
          </View>

          <View style={styles.teamGoalsContainer}>
            <Card style={styles.teamGoalCard}>
              <Card.Content>
                <View style={styles.teamGoalHeader}>
                  <Text style={styles.teamGoalTitle}>Team Performance</Text>
                  <Text style={styles.goalEmoji}>🎯</Text>
                </View>
                <View style={styles.goalProgress}>
                  <Text style={styles.goalMetric}>85% / 90%</Text>
                  <ProgressBar progress={0.94} color={COLORS.success} style={styles.goalBar} />
                  <Text style={[styles.goalStatus, { color: COLORS.success }]}>On track to achieve</Text>
                </View>
              </Card.Content>
            </Card>

            <Card style={styles.teamGoalCard}>
              <Card.Content>
                <View style={styles.teamGoalHeader}>
                  <Text style={styles.teamGoalTitle}>Attendance Goal</Text>
                  <Text style={styles.goalEmoji}>📅</Text>
                </View>
                <View style={styles.goalProgress}>
                  <Text style={styles.goalMetric}>92% / 95%</Text>
                  <ProgressBar progress={0.97} color={COLORS.primary} style={styles.goalBar} />
                  <Text style={[styles.goalStatus, { color: COLORS.primary }]}>Excellent progress</Text>
                </View>
              </Card.Content>
            </Card>
          </View>
        </Card.Content>
      </Card>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" translucent />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Auto Progress Tracking</Text>
        <Text style={styles.headerSubtitle}>Monitor and analyze your trainees' progress automatically</Text>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
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
        <QuickStats />
        <Controls />
        <TabNavigation />
        
        {activeTab === 'overview' && <OverviewContent />}
        {activeTab === 'individual' && <IndividualContent />}
        {activeTab === 'analytics' && <AnalyticsContent />}
        {activeTab === 'goals' && <GoalsContent />}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* AI Insights Panel */}
      <Portal>
        <Surface style={styles.aiInsightPanel}>
          <View style={styles.aiInsightHeader}>
            <Surface style={styles.aiIcon}>
              <Icon name="psychology" size={16} color={COLORS.secondary} />
            </Surface>
            <Text style={styles.aiInsightTitle}>AI Insight</Text>
          </View>
          <Text style={styles.aiInsightText}>
            Sarah Williams shows 22% improvement this month. Consider advancing her training level.
          </Text>
          <View style={styles.aiInsightActions}>
            <Button mode="contained" style={styles.aiActionButton}>Apply</Button>
            <Button mode="outlined" style={styles.aiActionButton}>Dismiss</Button>
          </View>
        </Surface>
      </Portal>

      {/* Floating Action Button */}
      <FAB
        icon={() => (
          <View>
            <Icon name="notifications" size={24} color="#fff" />
            {notificationCount > 0 && (
              <Surface style={styles.notificationBadge}>
                <Text style={styles.badgeText}>{notificationCount}</Text>
              </Surface>
            )}
          </View>
        )}
        style={styles.fab}
        onPress={() => {
          Alert.alert(
            'Notifications 🔔',
            '• 2 trainees missed sessions today\n• Performance review due for Alex\n• Sarah achieved speed goal!',
            [{ text: 'Got it! 👍', style: 'default' }]
          );
          Vibration.vibrate(50);
        }}
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
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  statCard: {
    width: (screenWidth - SPACING.md * 3) / 2,
    marginBottom: SPACING.sm,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  statValue: {
    ...TEXT_STYLES.h2,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statTrend: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
  },
  controlsCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  searchContainer: {
    marginBottom: SPACING.md,
  },
  searchbar: {
    elevation: 0,
    backgroundColor: COLORS.surface,
  },
  filtersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerContainer: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  pickerLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
    elevation: 1,
  },
  pickerText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    textTransform: 'capitalize',
  },
  filtersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filtersButtonText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.xs,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: 12,
    padding: SPACING.xs,
    backgroundColor: COLORS.surface,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#fff',
    elevation: 2,
  },
  tabText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  tabContent: {
    paddingHorizontal: SPACING.md,
  },
  chartCard: {
    marginBottom: SPACING.md,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  chartTitle: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  chartControls: {
    flexDirection: 'row',
  },
  chart: {
    borderRadius: 16,
  },
  chartsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  halfCard: {
    flex: 1,
  },
  pieChart: {
    marginVertical: SPACING.sm,
  },
  skillsContainer: {
    marginTop: SPACING.sm,
  },
  skillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  skillName: {
    ...TEXT_STYLES.body,
    flex: 1,
    color: COLORS.text,
  },
  progressBar: {
    flex: 2,
    marginHorizontal: SPACING.sm,
    height: 8,
  },
  skillValue: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    width: 40,
    textAlign: 'right',
  },
  traineeCard: {
    marginBottom: SPACING.md,
  },
  traineeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  traineeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  traineeAvatar: {
    fontSize: 32,
    marginRight: SPACING.sm,
  },
  traineeName: {
    ...TEXT_STYLES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  traineeDetails: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  traineeMetrics: {
    marginBottom: SPACING.md,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  metricLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    flex: 1,
  },
  metricValue: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
  },
  metricBar: {
    flex: 1,
    height: 8,
    marginRight: SPACING.sm,
  },
  metricText: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    color: COLORS.text,
    width: 40,
    textAlign: 'right',
  },
  improvementValue: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
    justifyContent: 'flex-end',
  },
  goalsSection: {
    marginBottom: SPACING.md,
  },
  goalsLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  goalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  goalChip: {
    backgroundColor: `${COLORS.primary}15`,
  },
  traineeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  sessionDates: {
    flex: 1,
  },
  sessionText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  detailsButton: {
    backgroundColor: `${COLORS.primary}15`,
  },
  insightsCard: {
    marginBottom: SPACING.md,
  },
  insightsContainer: {
    marginTop: SPACING.sm,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.sm,
    borderLeftWidth: 4,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  insightContent: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  insightTitle: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  insightText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  goalsOverviewCard: {
    marginBottom: SPACING.md,
  },
  goalsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  setGoalsButton: {
    backgroundColor: COLORS.primary,
  },
  teamGoalsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  teamGoalCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  teamGoalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  teamGoalTitle: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  goalEmoji: {
    fontSize: 24,
  },
  goalProgress: {
    gap: SPACING.xs,
  },
  goalMetric: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  goalBar: {
    height: 8,
  },
  goalStatus: {
    ...TEXT_STYLES.caption,
    fontWeight: '500',
  },
  aiInsightPanel: {
    position: 'absolute',
    bottom: 80,
    left: SPACING.md,
    right: screenWidth / 2,
    padding: SPACING.md,
    borderRadius: 12,
    elevation: 8,
    backgroundColor: '#fff',
  },
  aiInsightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  aiIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: `${COLORS.secondary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.xs,
  },
  aiInsightTitle: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  aiInsightText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: SPACING.sm,
  },
  aiInsightActions: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  aiActionButton: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.md,
    right: SPACING.md,
    backgroundColor: COLORS.primary,
  },
  notificationBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 100,
  },
};

export default AutoProgressTrackingScreen;