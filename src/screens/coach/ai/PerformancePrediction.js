import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  StatusBar,
  Alert,
  RefreshControl,
  Animated,
  Vibration,
  TouchableOpacity,
  Modal,
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
  ActivityIndicator,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

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
  border: '#e0e0e0',
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
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  caption: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
};

const { width, height } = Dimensions.get('window');

const PerformancePrediction = ({ navigation }) => {
  // Redux state
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const players = useSelector(state => state.players.players);
  const performanceData = useSelector(state => state.performance.data);
  
  // Local state
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('overall');
  const [timeRange, setTimeRange] = useState('3months');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const [insights, setInsights] = useState([]);
  const [chartData, setChartData] = useState(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // Performance metrics
  const metrics = [
    { id: 'overall', label: 'Overall', icon: 'trending-up', color: COLORS.primary },
    { id: 'speed', label: 'Speed', icon: 'flash-on', color: COLORS.success },
    { id: 'strength', label: 'Strength', icon: 'fitness-center', color: COLORS.warning },
    { id: 'endurance', label: 'Endurance', icon: 'favorite', color: COLORS.error },
    { id: 'skill', label: 'Technical', icon: 'sports-soccer', color: COLORS.secondary },
  ];

  const timeRanges = [
    { id: '1month', label: '1 Month' },
    { id: '3months', label: '3 Months' },
    { id: '6months', label: '6 Months' },
    { id: '1year', label: '1 Year' },
  ];

  // Mock data for demonstration
  const mockPredictions = [
    {
      id: 1,
      playerId: 'player_1',
      playerName: 'John Smith',
      metric: 'overall',
      currentScore: 85,
      predictedScore: 92,
      confidence: 89,
      trend: 'upward',
      factors: ['Consistent training', 'Improved nutrition', 'Better recovery'],
      nextMilestone: 'Elite level (95+)',
      timeToMilestone: '4 weeks',
      riskFactors: ['Minor injury history'],
      recommendations: [
        'Increase strength training by 20%',
        'Focus on agility drills',
        'Monitor fatigue levels',
      ],
    },
    {
      id: 2,
      playerId: 'player_2',
      playerName: 'Emma Johnson',
      metric: 'speed',
      currentScore: 78,
      predictedScore: 83,
      confidence: 92,
      trend: 'upward',
      factors: ['Speed-focused training', 'Lightweight reduction'],
      nextMilestone: 'Advanced level (85+)',
      timeToMilestone: '6 weeks',
      riskFactors: [],
      recommendations: [
        'Continue sprint intervals',
        'Add plyometric exercises',
        'Maintain current nutrition plan',
      ],
    },
  ];

  const mockInsights = [
    {
      id: 1,
      type: 'trend',
      title: '🔥 Performance Surge Detected',
      description: 'Team average improved by 12% this month',
      severity: 'positive',
      actionRequired: false,
    },
    {
      id: 2,
      type: 'alert',
      title: '⚠️ Potential Burnout Risk',
      description: '3 players showing fatigue indicators',
      severity: 'warning',
      actionRequired: true,
    },
    {
      id: 3,
      type: 'achievement',
      title: '🎯 Milestone Reached',
      description: '5 players achieved personal bests this week',
      severity: 'positive',
      actionRequired: false,
    },
  ];

  // Chart configuration
  const chartConfig = {
    backgroundGradientFrom: COLORS.surface,
    backgroundGradientTo: COLORS.surface,
    color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    propsForLabels: {
      fontSize: 12,
      fontWeight: '500',
    },
  };

  // Initialize component
  useEffect(() => {
    initializeScreen();
  }, []);

  useEffect(() => {
    if (selectedPlayer && selectedMetric) {
      generatePredictions();
    }
  }, [selectedPlayer, selectedMetric, timeRange]);

  const initializeScreen = useCallback(async () => {
    try {
      setLoading(true);
      
      // Animate screen entrance
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Load initial data
      await loadPerformanceData();
      setPredictions(mockPredictions);
      setInsights(mockInsights);
      
      // Set default player if available
      if (players.length > 0) {
        setSelectedPlayer(players[0]);
      }
      
    } catch (error) {
      console.error('Error initializing screen:', error);
      Alert.alert('Error', 'Failed to load performance predictions');
    } finally {
      setLoading(false);
    }
  }, [fadeAnim, slideAnim, scaleAnim, players]);

  const loadPerformanceData = async () => {
    // Simulate API call
    return new Promise(resolve => setTimeout(resolve, 1000));
  };

  const generatePredictions = useCallback(async () => {
    if (!selectedPlayer) return;
    
    try {
      setLoading(true);
      
      // Simulate AI prediction generation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate chart data
      const chartData = {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Predicted'],
        datasets: [{
          data: [75, 78, 82, 85, 92],
          color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
          strokeWidth: 3,
        }],
      };
      
      setChartData(chartData);
      
    } catch (error) {
      console.error('Error generating predictions:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedPlayer, selectedMetric, timeRange]);

  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await loadPerformanceData();
      await generatePredictions();
      Vibration.vibrate(50);
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  }, [generatePredictions]);

  const handlePlayerSelect = (player) => {
    setSelectedPlayer(player);
    Vibration.vibrate(30);
  };

  const handleMetricSelect = (metric) => {
    setSelectedMetric(metric);
    Vibration.vibrate(30);
  };

  const handleShowDetails = (prediction) => {
    setSelectedPlayer(prediction);
    setShowDetailsModal(true);
    Vibration.vibrate(50);
  };

  const handleExportPredictions = () => {
    Alert.alert(
      'Export Predictions',
      'Export functionality is coming soon! 📊',
      [{ text: 'OK', style: 'default' }]
    );
    Vibration.vibrate(100);
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={styles.header}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>🔮 Performance Predictions</Text>
        <Text style={styles.headerSubtitle}>AI-powered performance forecasting</Text>
      </View>
      <IconButton
        icon="download"
        iconColor={COLORS.surface}
        size={24}
        onPress={handleExportPredictions}
        style={styles.headerAction}
      />
    </LinearGradient>
  );

  const renderSearchBar = () => (
    <Surface style={styles.searchContainer} elevation={2}>
      <Searchbar
        placeholder="Search players..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        iconColor={COLORS.primary}
        inputStyle={{ color: COLORS.text }}
      />
    </Surface>
  );

  const renderMetricSelector = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>📊 Performance Metrics</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
        {metrics.map((metric) => (
          <Chip
            key={metric.id}
            mode={selectedMetric === metric.id ? 'flat' : 'outlined'}
            selected={selectedMetric === metric.id}
            onPress={() => handleMetricSelect(metric.id)}
            style={[
              styles.metricChip,
              selectedMetric === metric.id && { backgroundColor: metric.color }
            ]}
            textStyle={[
              styles.chipText,
              selectedMetric === metric.id && { color: COLORS.surface }
            ]}
            icon={metric.icon}
          >
            {metric.label}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const renderTimeRangeSelector = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>⏰ Prediction Timeline</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
        {timeRanges.map((range) => (
          <Chip
            key={range.id}
            mode={timeRange === range.id ? 'flat' : 'outlined'}
            selected={timeRange === range.id}
            onPress={() => setTimeRange(range.id)}
            style={[
              styles.timeChip,
              timeRange === range.id && { backgroundColor: COLORS.primary }
            ]}
            textStyle={[
              styles.chipText,
              timeRange === range.id && { color: COLORS.surface }
            ]}
          >
            {range.label}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const renderPredictionChart = () => {
    if (!chartData || loading) {
      return (
        <Card style={styles.chartCard}>
          <Card.Content style={styles.chartLoadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Generating AI predictions...</Text>
          </Card.Content>
        </Card>
      );
    }

    return (
      <Card style={styles.chartCard} elevation={4}>
        <Card.Content>
          <Text style={styles.chartTitle}>Performance Trajectory</Text>
          <LineChart
            data={chartData}
            width={width - 64}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withDots={true}
            withInnerLines={false}
            withOuterLines={true}
            withVerticalLines={true}
            withHorizontalLines={true}
          />
        </Card.Content>
      </Card>
    );
  };

  const renderInsights = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>💡 AI Insights</Text>
      {insights.map((insight) => (
        <Card key={insight.id} style={styles.insightCard} elevation={2}>
          <Card.Content style={styles.insightContent}>
            <View style={styles.insightHeader}>
              <Text style={styles.insightTitle}>{insight.title}</Text>
              {insight.actionRequired && (
                <Chip
                  mode="flat"
                  compact
                  style={[styles.actionChip, { backgroundColor: COLORS.warning }]}
                  textStyle={{ color: COLORS.surface, fontSize: 10 }}
                >
                  Action Required
                </Chip>
              )}
            </View>
            <Text style={styles.insightDescription}>{insight.description}</Text>
          </Card.Content>
        </Card>
      ))}
    </View>
  );

  const renderPredictionCards = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>🎯 Player Predictions</Text>
      {predictions.map((prediction) => (
        <Card key={prediction.id} style={styles.predictionCard} elevation={3}>
          <Card.Content>
            <View style={styles.predictionHeader}>
              <View style={styles.playerInfo}>
                <Avatar.Text
                  size={40}
                  label={prediction.playerName.split(' ').map(n => n[0]).join('')}
                  style={{ backgroundColor: COLORS.primary }}
                />
                <View style={styles.playerDetails}>
                  <Text style={styles.playerName}>{prediction.playerName}</Text>
                  <Text style={styles.playerMetric}>{metrics.find(m => m.id === prediction.metric)?.label}</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => handleShowDetails(prediction)}
                style={styles.detailsButton}
              >
                <Icon name="chevron-right" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.scoreContainer}>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreLabel}>Current</Text>
                <Text style={styles.scoreValue}>{prediction.currentScore}</Text>
              </View>
              <Icon 
                name="trending-up" 
                size={24} 
                color={COLORS.success} 
                style={styles.trendIcon} 
              />
              <View style={styles.scoreItem}>
                <Text style={styles.scoreLabel}>Predicted</Text>
                <Text style={[styles.scoreValue, { color: COLORS.success }]}>
                  {prediction.predictedScore}
                </Text>
              </View>
            </View>
            
            <View style={styles.confidenceContainer}>
              <Text style={styles.confidenceLabel}>Confidence: {prediction.confidence}%</Text>
              <ProgressBar
                progress={prediction.confidence / 100}
                color={COLORS.success}
                style={styles.confidenceBar}
              />
            </View>
            
            <Text style={styles.milestoneText}>
              🎯 Next: {prediction.nextMilestone} in {prediction.timeToMilestone}
            </Text>
          </Card.Content>
        </Card>
      ))}
    </View>
  );

  const renderDetailsModal = () => (
    <Portal>
      <Modal
        visible={showDetailsModal}
        onDismiss={() => setShowDetailsModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView
          style={styles.blurView}
          blurType="light"
          blurAmount={10}
          reducedTransparencyFallbackColor={COLORS.background}
        >
          <Surface style={styles.modalContent} elevation={8}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Performance Details</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setShowDetailsModal(false)}
              />
            </View>
            
            {selectedPlayer && (
              <ScrollView style={styles.modalBody}>
                <Text style={styles.detailSection}>🎯 Key Factors</Text>
                {selectedPlayer.factors?.map((factor, index) => (
                  <Text key={index} style={styles.detailItem}>• {factor}</Text>
                ))}
                
                <Text style={styles.detailSection}>💡 Recommendations</Text>
                {selectedPlayer.recommendations?.map((rec, index) => (
                  <Text key={index} style={styles.detailItem}>• {rec}</Text>
                ))}
                
                {selectedPlayer.riskFactors?.length > 0 && (
                  <>
                    <Text style={styles.detailSection}>⚠️ Risk Factors</Text>
                    {selectedPlayer.riskFactors.map((risk, index) => (
                      <Text key={index} style={[styles.detailItem, { color: COLORS.error }]}>
                        • {risk}
                      </Text>
                    ))}
                  </>
                )}
              </ScrollView>
            )}
          </Surface>
        </BlurView>
      </Modal>
    </Portal>
  );

  const renderFAB = () => (
    <FAB
      icon="auto-awesome"
      label="Generate Report"
      style={styles.fab}
      onPress={() => Alert.alert('AI Report', 'Report generation coming soon! 🤖')}
      color={COLORS.surface}
      customSize={56}
    />
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading performance predictions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        >
          {renderSearchBar()}
          {renderMetricSelector()}
          {renderTimeRangeSelector()}
          {renderPredictionChart()}
          {renderInsights()}
          {renderPredictionCards()}
          
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </Animated.View>
      
      {renderDetailsModal()}
      {renderFAB()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    ...TEXT_STYLES.title,
    color: COLORS.surface,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  headerAction: {
    margin: 0,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  searchContainer: {
    margin: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: 12,
  },
  searchBar: {
    backgroundColor: COLORS.surface,
    elevation: 0,
  },
  sectionContainer: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TEXT_STYLES.subtitle,
    marginBottom: SPACING.md,
  },
  chipContainer: {
    flexDirection: 'row',
  },
  metricChip: {
    marginRight: SPACING.sm,
    borderColor: COLORS.border,
  },
  timeChip: {
    marginRight: SPACING.sm,
    borderColor: COLORS.border,
  },
  chipText: {
    fontSize: 12,
  },
  chartCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
  },
  chartTitle: {
    ...TEXT_STYLES.subtitle,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  chart: {
    marginVertical: SPACING.sm,
    borderRadius: 12,
  },
  chartLoadingContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  insightCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
  },
  insightContent: {
    padding: SPACING.md,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  insightTitle: {
    ...TEXT_STYLES.subtitle,
    fontSize: 16,
    flex: 1,
  },
  insightDescription: {
    ...TEXT_STYLES.body,
    lineHeight: 20,
  },
  actionChip: {
    height: 24,
  },
  predictionCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
  },
  predictionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  playerDetails: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  playerName: {
    ...TEXT_STYLES.subtitle,
    fontSize: 16,
  },
  playerMetric: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
  },
  detailsButton: {
    padding: SPACING.sm,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 12,
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreLabel: {
    ...TEXT_STYLES.caption,
    marginBottom: SPACING.xs,
  },
  scoreValue: {
    ...TEXT_STYLES.title,
    fontSize: 28,
    fontWeight: 'bold',
  },
  trendIcon: {
    alignSelf: 'center',
  },
  confidenceContainer: {
    marginBottom: SPACING.md,
  },
  confidenceLabel: {
    ...TEXT_STYLES.body,
    marginBottom: SPACING.xs,
  },
  confidenceBar: {
    height: 8,
    borderRadius: 4,
  },
  milestoneText: {
    ...TEXT_STYLES.body,
    fontStyle: 'italic',
    textAlign: 'center',
    color: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurView: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    width: width - 32,
    maxHeight: height * 0.8,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    ...TEXT_STYLES.title,
    fontSize: 20,
  },
  modalBody: {
    padding: SPACING.lg,
  },
  detailSection: {
    ...TEXT_STYLES.subtitle,
    fontSize: 16,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  detailItem: {
    ...TEXT_STYLES.body,
    marginBottom: SPACING.sm,
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    ...TEXT_STYLES.body,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 120,
  },
});

export default PerformancePrediction;
