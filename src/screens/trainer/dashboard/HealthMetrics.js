import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Animated,
  Alert,
  Modal,
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
  TextInput,
  Portal,
  DataTable,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LineChart, BarChart } from 'react-native-chart-kit';

// Import your constants (adjust path as needed)
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width: screenWidth } = Dimensions.get('window');

const HealthMetrics = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, healthData, clients } = useSelector(state => ({
    user: state.auth.user,
    healthData: state.health.metrics,
    clients: state.clients.list
  }));

  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview'); // overview, vitals, body-comp, fitness, clients
  const [fadeAnim] = useState(new Animated.Value(0));
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [timeRange, setTimeRange] = useState('week'); // week, month, quarter

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
    
    loadHealthData();
  }, [selectedTab, timeRange]);

  const loadHealthData = useCallback(() => {
    try {
      // Simulate API call - replace with actual health data fetch
      // dispatch(fetchHealthMetrics({ tab: selectedTab, timeRange }));
    } catch (error) {
      Alert.alert('Error', 'Failed to load health metrics');
    }
  }, [selectedTab, timeRange, dispatch]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadHealthData();
    setTimeout(() => setRefreshing(false), 1000);
  }, [loadHealthData]);

  // Mock data - replace with actual data from Redux store
  const myHealthMetrics = {
    vitals: {
      heartRate: { current: 68, trend: 'stable', optimal: '60-100' },
      bloodPressure: { systolic: 118, diastolic: 78, trend: 'good', optimal: '<120/80' },
      restingHR: { current: 58, trend: 'improving', optimal: '40-60' },
      vo2Max: { current: 42, trend: 'improving', optimal: '>35' }
    },
    bodyComposition: {
      weight: { current: 175, change: -2.5, unit: 'lbs' },
      bodyFat: { current: 12.8, change: -0.8, unit: '%' },
      muscleMass: { current: 152, change: +1.2, unit: 'lbs' },
      bmi: { current: 22.4, status: 'Normal', range: '18.5-24.9' }
    },
    fitness: {
      steps: { current: 12450, goal: 10000, streak: 15 },
      activeMinutes: { current: 85, goal: 60, streak: 8 },
      calories: { current: 2840, goal: 2500, deficit: -340 },
      sleep: { current: 7.2, goal: 8.0, quality: 'Good' }
    }
  };

  const clientHealthData = [
    {
      id: 1,
      name: 'Sarah Johnson',
      avatar: '👩‍💼',
      age: 28,
      lastUpdate: '2025-08-19',
      vitals: { hr: 72, bp: '115/75' },
      weight: { current: 145, change: -5.2 },
      bodyFat: { current: 22.5, change: -2.1 },
      fitnessScore: 78,
      status: 'improving'
    },
    {
      id: 2,
      name: 'Mike Chen',
      avatar: '👨‍💻',
      age: 35,
      lastUpdate: '2025-08-18',
      vitals: { hr: 65, bp: '125/80' },
      weight: { current: 185, change: +3.5 },
      bodyFat: { current: 15.2, change: -1.8 },
      fitnessScore: 85,
      status: 'excellent'
    },
    {
      id: 3,
      name: 'Emma Davis',
      avatar: '👩‍🎨',
      age: 24,
      lastUpdate: '2025-08-20',
      vitals: { hr: 70, bp: '110/70' },
      weight: { current: 132, change: -1.8 },
      bodyFat: { current: 18.9, change: -0.5 },
      fitnessScore: 82,
      status: 'good'
    }
  ];

  // Chart data for trends
  const weightTrendData = {
    labels: ['6w ago', '5w ago', '4w ago', '3w ago', '2w ago', '1w ago', 'Now'],
    datasets: [{
      data: [177.5, 176.8, 176.2, 175.8, 175.3, 175.1, 175.0]
    }]
  };

  const heartRateData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: [65, 68, 62, 70, 66, 64, 68]
    }]
  };

  const chartConfig = {
    backgroundColor: '#fff',
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: COLORS.primary
    }
  };

  const tabs = [
    { key: 'overview', label: 'Overview', icon: 'dashboard' },
    { key: 'vitals', label: 'Vitals', icon: 'favorite' },
    { key: 'body-comp', label: 'Body Comp', icon: 'accessibility' },
    { key: 'fitness', label: 'Fitness', icon: 'directions-run' },
    { key: 'clients', label: 'Client Data', icon: 'people' }
  ];

  const timeRanges = [
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
    { key: 'quarter', label: 'Quarter' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return COLORS.success;
      case 'good': case 'improving': return COLORS.primary;
      case 'stable': return COLORS.warning;
      case 'concerning': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving': return 'trending-up';
      case 'declining': return 'trending-down';
      case 'stable': return 'trending-flat';
      default: return 'remove';
    }
  };

  const renderOverviewTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Quick Stats */}
      <Surface style={styles.quickStatsContainer}>
        <Text style={styles.sectionTitle}>📊 Today's Snapshot</Text>
        <View style={styles.quickStatsGrid}>
          <View style={styles.quickStat}>
            <Text style={styles.quickStatValue}>68</Text>
            <Text style={styles.quickStatLabel}>Heart Rate</Text>
            <Text style={styles.quickStatUnit}>bpm</Text>
          </View>
          <View style={styles.quickStat}>
            <Text style={[styles.quickStatValue, { color: COLORS.success }]}>175</Text>
            <Text style={styles.quickStatLabel}>Weight</Text>
            <Text style={styles.quickStatUnit}>lbs</Text>
          </View>
          <View style={styles.quickStat}>
            <Text style={[styles.quickStatValue, { color: COLORS.primary }]}>12.8</Text>
            <Text style={styles.quickStatLabel}>Body Fat</Text>
            <Text style={styles.quickStatUnit}>%</Text>
          </View>
          <View style={styles.quickStat}>
            <Text style={[styles.quickStatValue, { color: COLORS.warning }]}>42</Text>
            <Text style={styles.quickStatLabel}>VO₂ Max</Text>
            <Text style={styles.quickStatUnit}>ml/kg/min</Text>
          </View>
        </View>
      </Surface>

      {/* Health Score */}
      <Card style={styles.healthScoreCard}>
        <LinearGradient
          colors={[COLORS.success, '#4CAF50']}
          style={styles.healthScoreGradient}
        >
          <Card.Content>
            <View style={styles.healthScoreContent}>
              <View>
                <Text style={styles.healthScoreTitle}>🎯 Health Score</Text>
                <Text style={styles.healthScoreValue}>85</Text>
                <Text style={styles.healthScoreLabel}>Excellent</Text>
              </View>
              <View style={styles.healthScoreChart}>
                <Text style={styles.healthScoreChange}>+5 this week</Text>
                <Icon name="trending-up" size={32} color="#fff" />
              </View>
            </View>
          </Card.Content>
        </LinearGradient>
      </Card>

      {/* Recent Trends */}
      <Card style={styles.trendsCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>📈 Recent Trends</Text>
          <LineChart
            data={weightTrendData}
            width={screenWidth - SPACING.xl * 2 - 32}
            height={180}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
          <Text style={styles.chartCaption}>Weight trend over 6 weeks</Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );

  const renderVitalsTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Vital Signs Cards */}
      {Object.entries(myHealthMetrics.vitals).map(([key, vital]) => (
        <Animated.View
          key={key}
          style={{
            opacity: fadeAnim,
            transform: [{
              translateX: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0]
              })
            }]
          }}
        >
          <Card style={styles.vitalCard}>
            <Card.Content>
              <View style={styles.vitalHeader}>
                <Text style={styles.vitalTitle}>
                  {key === 'heartRate' ? '💓 Heart Rate' : 
                   key === 'bloodPressure' ? '🩺 Blood Pressure' :
                   key === 'restingHR' ? '😴 Resting HR' : '🫁 VO₂ Max'}
                </Text>
                <Chip
                  mode="outlined"
                  textStyle={{ 
                    color: getStatusColor(vital.trend), 
                    fontSize: 10 
                  }}
                  style={{ 
                    backgroundColor: `${getStatusColor(vital.trend)}20`
                  }}
                >
                  <Icon name={getTrendIcon(vital.trend)} size={12} />
                  {' ' + vital.trend}
                </Chip>
              </View>
              
              <View style={styles.vitalContent}>
                <Text style={styles.vitalValue}>
                  {key === 'bloodPressure' 
                    ? `${vital.systolic}/${vital.diastolic}` 
                    : vital.current}
                  <Text style={styles.vitalUnit}>
                    {key === 'heartRate' || key === 'restingHR' ? ' bpm' :
                     key === 'bloodPressure' ? ' mmHg' : 
                     key === 'vo2Max' ? ' ml/kg/min' : ''}
                  </Text>
                </Text>
                <Text style={styles.vitalOptimal}>
                  Optimal: {vital.optimal}
                </Text>
              </View>
            </Card.Content>
          </Card>
        </Animated.View>
      ))}

      {/* Heart Rate Chart */}
      <Card style={styles.chartCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>💓 Weekly Heart Rate</Text>
          <BarChart
            data={heartRateData}
            width={screenWidth - SPACING.xl * 2 - 32}
            height={200}
            chartConfig={chartConfig}
            style={styles.chart}
          />
        </Card.Content>
      </Card>
    </ScrollView>
  );

  const renderBodyCompTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Body Composition Metrics */}
      {Object.entries(myHealthMetrics.bodyComposition).map(([key, metric]) => (
        <Animated.View
          key={key}
          style={{
            opacity: fadeAnim,
            transform: [{
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0]
              })
            }]
          }}
        >
          <Card style={styles.bodyMetricCard}>
            <Card.Content>
              <View style={styles.bodyMetricHeader}>
                <Text style={styles.bodyMetricTitle}>
                  {key === 'weight' ? '⚖️ Weight' :
                   key === 'bodyFat' ? '📊 Body Fat' :
                   key === 'muscleMass' ? '💪 Muscle Mass' : '📏 BMI'}
                </Text>
                {key !== 'bmi' && (
                  <View style={styles.changeIndicator}>
                    <Icon
                      name={metric.change > 0 ? 'arrow-upward' : 'arrow-downward'}
                      size={16}
                      color={
                        (key === 'weight' || key === 'bodyFat') && metric.change < 0 ? COLORS.success :
                        key === 'muscleMass' && metric.change > 0 ? COLORS.success :
                        COLORS.error
                      }
                    />
                    <Text style={[
                      styles.changeText,
                      {
                        color: (key === 'weight' || key === 'bodyFat') && metric.change < 0 ? COLORS.success :
                               key === 'muscleMass' && metric.change > 0 ? COLORS.success :
                               COLORS.error
                      }
                    ]}>
                      {Math.abs(metric.change)} {metric.unit}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.bodyMetricContent}>
                <Text style={styles.bodyMetricValue}>
                  {metric.current}
                  <Text style={styles.bodyMetricUnit}>
                    {key !== 'bmi' ? ` ${metric.unit}` : ''}
                  </Text>
                </Text>
                {key === 'bmi' && (
                  <Text style={styles.bmiStatus}>
                    Status: {metric.status} ({metric.range})
                  </Text>
                )}
              </View>
            </Card.Content>
          </Card>
        </Animated.View>
      ))}

      {/* Body Composition Chart */}
      <Card style={styles.chartCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>📊 Composition Breakdown</Text>
          <View style={styles.compositionChart}>
            <View style={styles.compositionItem}>
              <View style={[styles.compositionBar, { backgroundColor: COLORS.primary, flex: 0.6 }]} />
              <Text style={styles.compositionLabel}>Muscle 60%</Text>
            </View>
            <View style={styles.compositionItem}>
              <View style={[styles.compositionBar, { backgroundColor: COLORS.warning, flex: 0.13 }]} />
              <Text style={styles.compositionLabel}>Fat 13%</Text>
            </View>
            <View style={styles.compositionItem}>
              <View style={[styles.compositionBar, { backgroundColor: COLORS.success, flex: 0.27 }]} />
              <Text style={styles.compositionLabel}>Other 27%</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );

  const renderFitnessTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Daily Fitness Metrics */}
      {Object.entries(myHealthMetrics.fitness).map(([key, metric]) => (
        <Animated.View
          key={key}
          style={{
            opacity: fadeAnim,
            transform: [{
              scale: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1]
              })
            }]
          }}
        >
          <Card style={styles.fitnessCard}>
            <Card.Content>
              <View style={styles.fitnessHeader}>
                <Text style={styles.fitnessTitle}>
                  {key === 'steps' ? '👣 Steps' :
                   key === 'activeMinutes' ? '🏃‍♂️ Active Minutes' :
                   key === 'calories' ? '🔥 Calories' : '😴 Sleep'}
                </Text>
                {metric.streak && (
                  <View style={styles.streakBadge}>
                    <Icon name="local-fire-department" size={14} color="#FF6B35" />
                    <Text style={styles.streakText}>{metric.streak} day streak</Text>
                  </View>
                )}
              </View>

              <View style={styles.fitnessContent}>
                <Text style={styles.fitnessValue}>
                  {key === 'calories' && metric.deficit 
                    ? `${metric.current} (${metric.deficit})` 
                    : metric.current}
                  <Text style={styles.fitnessUnit}>
                    {key === 'sleep' ? ' hrs' :
                     key === 'activeMinutes' ? ' min' :
                     key === 'steps' ? ' steps' : ' cal'}
                  </Text>
                </Text>
                
                {metric.goal && (
                  <>
                    <ProgressBar
                      progress={Math.min(metric.current / metric.goal, 1)}
                      color={
                        metric.current >= metric.goal ? COLORS.success :
                        metric.current >= metric.goal * 0.8 ? COLORS.warning :
                        COLORS.primary
                      }
                      style={styles.fitnessProgress}
                    />
                    <Text style={styles.fitnessGoal}>
                      Goal: {metric.goal} {key === 'sleep' ? 'hrs' : key === 'activeMinutes' ? 'min' : key === 'steps' ? 'steps' : 'cal'}
                    </Text>
                  </>
                )}
                
                {key === 'sleep' && (
                  <Text style={styles.sleepQuality}>
                    Quality: {metric.quality}
                  </Text>
                )}
              </View>
            </Card.Content>
          </Card>
        </Animated.View>
      ))}
    </ScrollView>
  );

  const renderClientsTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>👥 Client Health Overview</Text>
      
      {clientHealthData.map((client) => (
        <Animated.View
          key={client.id}
          style={{
            opacity: fadeAnim,
            transform: [{
              translateX: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-50, 0]
              })
            }]
          }}
        >
          <Card style={styles.clientHealthCard}>
            <TouchableOpacity
              onPress={() => Alert.alert('Client Details', `View detailed health metrics for ${client.name}`)}
              activeOpacity={0.7}
            >
              <Card.Content>
                <View style={styles.clientHeader}>
                  <View style={styles.clientInfo}>
                    <Text style={styles.clientAvatar}>{client.avatar}</Text>
                    <View>
                      <Text style={styles.clientName}>{client.name}</Text>
                      <Text style={styles.clientAge}>Age: {client.age} • Updated: {client.lastUpdate}</Text>
                    </View>
                  </View>
                  <Chip
                    mode="filled"
                    textStyle={{ color: '#fff', fontSize: 10 }}
                    style={{ backgroundColor: getStatusColor(client.status) }}
                  >
                    {client.status.toUpperCase()}
                  </Chip>
                </View>

                <View style={styles.clientMetrics}>
                  <View style={styles.clientMetricRow}>
                    <View style={styles.clientMetric}>
                      <Text style={styles.clientMetricLabel}>💓 HR</Text>
                      <Text style={styles.clientMetricValue}>{client.vitals.hr} bpm</Text>
                    </View>
                    <View style={styles.clientMetric}>
                      <Text style={styles.clientMetricLabel}>🩺 BP</Text>
                      <Text style={styles.clientMetricValue}>{client.vitals.bp}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.clientMetricRow}>
                    <View style={styles.clientMetric}>
                      <Text style={styles.clientMetricLabel}>⚖️ Weight</Text>
                      <Text style={styles.clientMetricValue}>
                        {client.weight.current} lbs
                        <Text style={[
                          styles.clientMetricChange,
                          { color: client.weight.change < 0 ? COLORS.success : COLORS.error }
                        ]}>
                          {' '}({client.weight.change > 0 ? '+' : ''}{client.weight.change})
                        </Text>
                      </Text>
                    </View>
                    <View style={styles.clientMetric}>
                      <Text style={styles.clientMetricLabel}>📊 Body Fat</Text>
                      <Text style={styles.clientMetricValue}>
                        {client.bodyFat.current}%
                        <Text style={[
                          styles.clientMetricChange,
                          { color: client.bodyFat.change < 0 ? COLORS.success : COLORS.error }
                        ]}>
                          {' '}({client.bodyFat.change > 0 ? '+' : ''}{client.bodyFat.change})
                        </Text>
                      </Text>
                    </View>
                  </View>

                  <View style={styles.fitnessScoreContainer}>
                    <Text style={styles.fitnessScoreLabel}>🎯 Fitness Score</Text>
                    <View style={styles.fitnessScoreBar}>
                      <ProgressBar
                        progress={client.fitnessScore / 100}
                        color={getStatusColor(client.status)}
                        style={styles.clientProgressBar}
                      />
                      <Text style={styles.fitnessScoreValue}>{client.fitnessScore}/100</Text>
                    </View>
                  </View>
                </View>
              </Card.Content>
            </TouchableOpacity>
          </Card>
        </Animated.View>
      ))}
    </ScrollView>
  );

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'overview': return renderOverviewTab();
      case 'vitals': return renderVitalsTab();
      case 'body-comp': return renderBodyCompTab();
      case 'fitness': return renderFitnessTab();
      case 'clients': return renderClientsTab();
      default: return renderOverviewTab();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} translucent />
      
      <LinearGradient
        colors={[COLORS.primary, '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>🏥 Health Metrics</Text>
          <Text style={styles.headerSubtitle}>Monitor wellness & performance</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
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
        {/* Search Bar */}
        <Searchbar
          placeholder="Search health metrics..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          iconColor={COLORS.primary}
        />

        {/* Tab Navigation */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabContainer}
        >
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setSelectedTab(tab.key)}
              style={[
                styles.tab,
                selectedTab === tab.key && styles.activeTab
              ]}
            >
              <Icon
                name={tab.icon}
                size={18}
                color={selectedTab === tab.key ? '#fff' : COLORS.primary}
              />
              <Text style={[
                styles.tabLabel,
                { color: selectedTab === tab.key ? '#fff' : COLORS.primary }
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Time Range Selector (for relevant tabs) */}
        {['overview', 'vitals', 'body-comp'].includes(selectedTab) && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.timeRangeContainer}
          >
            {timeRanges.map(range => (
              <Chip
                key={range.key}
                selected={timeRange === range.key}
                onPress={() => setTimeRange(range.key)}
                style={[
                  styles.timeRangeChip,
                  timeRange === range.key && styles.selectedTimeRange
                ]}
                textStyle={{
                  color: timeRange === range.key ? '#fff' : COLORS.primary,
                  fontSize: 12
                }}
              >
                {range.label}
              </Chip>
            ))}
          </ScrollView>
        )}

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {renderTabContent()}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => setShowAddModal(true)}
      />

      {/* Add Metric Modal */}
      <Portal>
        <Modal
          visible={showAddModal}
          onDismiss={() => setShowAddModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card style={styles.modalCard}>
            <Card.Title title="📊 Add Health Metric" />
            <Card.Content>
              <Text style={styles.modalText}>
                Add new health measurement:
                {'\n'}• Weight, body fat, muscle mass
                {'\n'}• Blood pressure, heart rate
                {'\n'}• Sleep, steps, calories
                {'\n'}• Custom health markers
              </Text>
              <Button
                mode="contained"
                onPress={() => {
                  setShowAddModal(false);
                  Alert.alert('Metric Added! 📈', 'Your health data has been recorded.');
                }}
                style={styles.modalButton}
              >
                Add Metric
              </Button>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>
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
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: '#fff',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: '#fff',
    opacity: 0.9,
    marginTop: SPACING.xs,
  },
  content: {
    flex: 1,
    marginTop: -SPACING.md,
  },
  searchbar: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    elevation: 2,
  },
  tabContainer: {
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    backgroundColor: '#fff',
    borderRadius: 20,
    elevation: 1,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabLabel: {
    marginLeft: SPACING.xs,
    fontSize: 11,
    fontWeight: 'bold',
  },
  timeRangeContainer: {
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  timeRangeChip: {
    marginRight: SPACING.sm,
    backgroundColor: '#fff',
  },
  selectedTimeRange: {
    backgroundColor: COLORS.primary,
  },
  tabContent: {
    paddingHorizontal: SPACING.lg,
  },
  
  // Overview Tab Styles
  quickStatsContainer: {
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    borderRadius: 12,
    elevation: 2,
  },
  quickStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickStat: {
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  quickStatLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  quickStatUnit: {
    fontSize: 10,
    color: COLORS.textSecondary,
    opacity: 0.8,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  healthScoreCard: {
    marginBottom: SPACING.lg,
    elevation: 3,
  },
  healthScoreGradient: {
    borderRadius: 8,
  },
  healthScoreContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  healthScoreTitle: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
  },
  healthScoreValue: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
    marginVertical: SPACING.xs,
  },
  healthScoreLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  healthScoreChart: {
    alignItems: 'center',
  },
  healthScoreChange: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.9,
    marginBottom: SPACING.xs,
  },
  trendsCard: {
    marginBottom: SPACING.lg,
    elevation: 3,
  },
  chart: {
    borderRadius: 16,
    marginVertical: SPACING.sm,
  },
  chartCaption: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },

  // Vitals Tab Styles
  vitalCard: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  vitalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  vitalTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
  },
  vitalContent: {
    alignItems: 'flex-start',
  },
  vitalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  vitalUnit: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: 'normal',
  },
  vitalOptimal: {
    ...TEXT_STYLES.caption,
    color: COLORS.success,
    backgroundColor: `${COLORS.success}20`,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  chartCard: {
    marginBottom: SPACING.lg,
    elevation: 3,
  },

  // Body Composition Tab Styles
  bodyMetricCard: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  bodyMetricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  bodyMetricTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
  },
  changeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  bodyMetricContent: {
    alignItems: 'flex-start',
  },
  bodyMetricValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  bodyMetricUnit: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: 'normal',
  },
  bmiStatus: {
    ...TEXT_STYLES.caption,
    color: COLORS.success,
    backgroundColor: `${COLORS.success}20`,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  compositionChart: {
    marginTop: SPACING.md,
  },
  compositionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  compositionBar: {
    height: 20,
    borderRadius: 4,
    marginRight: SPACING.md,
  },
  compositionLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
  },

  // Fitness Tab Styles
  fitnessCard: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  fitnessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  fitnessTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 12,
  },
  streakText: {
    fontSize: 10,
    color: '#FF6B35',
    fontWeight: 'bold',
    marginLeft: 2,
  },
  fitnessContent: {
    alignItems: 'flex-start',
  },
  fitnessValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  fitnessUnit: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: 'normal',
  },
  fitnessProgress: {
    width: '100%',
    height: 6,
    marginBottom: SPACING.xs,
  },
  fitnessGoal: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  sleepQuality: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    backgroundColor: `${COLORS.primary}20`,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: SPACING.xs,
  },

  // Client Tab Styles
  clientHealthCard: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  clientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  clientAvatar: {
    fontSize: 28,
    marginRight: SPACING.md,
  },
  clientName: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
  },
  clientAge: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  clientMetrics: {
    marginTop: SPACING.sm,
  },
  clientMetricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  clientMetric: {
    flex: 1,
  },
  clientMetricLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  clientMetricValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  clientMetricChange: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  fitnessScoreContainer: {
    marginTop: SPACING.md,
  },
  fitnessScoreLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  fitnessScoreBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clientProgressBar: {
    flex: 1,
    height: 8,
    marginRight: SPACING.sm,
  },
  fitnessScoreValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },

  // Modal Styles
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalCard: {
    elevation: 5,
  },
  modalText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  modalButton: {
    backgroundColor: COLORS.primary,
  },
};

export default HealthMetrics;
