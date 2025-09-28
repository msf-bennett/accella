import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
  Vibration,
  RefreshControl,
  Modal,
  TextInput,
  Dimensions,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  ProgressBar,
  Surface,
  FAB,
  Portal,
  Dialog,
  IconButton,
  Divider,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LineChart, AreaChart } from 'recharts';
import { useSelector, useDispatch } from 'react-redux';

// Design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4caf50',
  error: '#f44336',
  warning: '#ff9800',
  background: '#f5f5f5',
  white: '#ffffff',
  text: '#333333',
  textLight: '#666666',
  cardBg: '#ffffff',
  accent: '#00bcd4',
  heart: '#e91e63',
  muscle: '#ff5722',
  scale: '#9c27b0',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  body: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  caption: {
    fontSize: 10,
    color: COLORS.textLight,
  },
  number: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
};

const { width } = Dimensions.get('window');

// Biometric data types configuration
const BIOMETRIC_TYPES = {
  WEIGHT: {
    id: 'weight',
    name: 'Weight',
    icon: 'monitor-weight',
    unit: 'kg',
    color: COLORS.scale,
    gradient: [COLORS.scale, '#ba68c8'],
    min: 30,
    max: 200,
    step: 0.1,
    decimals: 1,
  },
  BODY_FAT: {
    id: 'bodyFat',
    name: 'Body Fat',
    icon: 'fitness-center',
    unit: '%',
    color: COLORS.warning,
    gradient: [COLORS.warning, '#ffb74d'],
    min: 5,
    max: 50,
    step: 0.1,
    decimals: 1,
  },
  MUSCLE_MASS: {
    id: 'muscleMass',
    name: 'Muscle Mass',
    icon: 'fitness-center',
    unit: 'kg',
    color: COLORS.muscle,
    gradient: [COLORS.muscle, '#ff8a65'],
    min: 20,
    max: 100,
    step: 0.1,
    decimals: 1,
  },
  HEART_RATE: {
    id: 'heartRate',
    name: 'Resting HR',
    icon: 'favorite',
    unit: 'bpm',
    color: COLORS.heart,
    gradient: [COLORS.heart, '#f06292'],
    min: 40,
    max: 120,
    step: 1,
    decimals: 0,
  },
  BLOOD_PRESSURE: {
    id: 'bloodPressure',
    name: 'Blood Pressure',
    icon: 'bloodtype',
    unit: 'mmHg',
    color: COLORS.error,
    gradient: [COLORS.error, '#ef5350'],
    format: 'systolic/diastolic',
  },
  SLEEP: {
    id: 'sleep',
    name: 'Sleep Duration',
    icon: 'bedtime',
    unit: 'hrs',
    color: COLORS.accent,
    gradient: [COLORS.accent, '#4dd0e1'],
    min: 4,
    max: 12,
    step: 0.5,
    decimals: 1,
  },
  HYDRATION: {
    id: 'hydration',
    name: 'Water Intake',
    icon: 'local-drink',
    unit: 'L',
    color: COLORS.primary,
    gradient: [COLORS.primary, '#7986cb'],
    min: 1,
    max: 8,
    step: 0.1,
    decimals: 1,
  },
};

const BiometricData = ({
  userId = null,
  showChart = true,
  editable = true,
  compactView = false,
  onDataUpdate = null,
  style = {},
}) => {
  const dispatch = useDispatch();
  const userBiometrics = useSelector(state => state.user?.biometrics || {});
  const isLoading = useSelector(state => state.user?.loading || false);
  
  // Component state
  const [selectedMetric, setSelectedMetric] = useState('weight');
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newValue, setNewValue] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [chartData, setChartData] = useState([]);
  const [trends, setTrends] = useState({});
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Sample data for demonstration
  const sampleBiometricData = {
    weight: [
      { date: '2025-08-20', value: 75.5, timestamp: Date.now() - 6 * 24 * 60 * 60 * 1000 },
      { date: '2025-08-22', value: 75.2, timestamp: Date.now() - 4 * 24 * 60 * 60 * 1000 },
      { date: '2025-08-24', value: 75.0, timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000 },
      { date: '2025-08-26', value: 74.8, timestamp: Date.now() },
    ],
    bodyFat: [
      { date: '2025-08-20', value: 15.2, timestamp: Date.now() - 6 * 24 * 60 * 60 * 1000 },
      { date: '2025-08-26', value: 14.8, timestamp: Date.now() },
    ],
    muscleMass: [
      { date: '2025-08-20', value: 45.2, timestamp: Date.now() - 6 * 24 * 60 * 60 * 1000 },
      { date: '2025-08-26', value: 45.8, timestamp: Date.now() },
    ],
    heartRate: [
      { date: '2025-08-26', value: 62, timestamp: Date.now() },
    ],
  };

  const currentBiometrics = userBiometrics.data || sampleBiometricData;

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
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Calculate trends
    calculateTrends();
  }, []);

  useEffect(() => {
    // Update chart data when metric changes
    updateChartData();
  }, [selectedMetric, currentBiometrics]);

  const calculateTrends = useCallback(() => {
    const newTrends = {};
    
    Object.keys(BIOMETRIC_TYPES).forEach(key => {
      const metricId = BIOMETRIC_TYPES[key].id;
      const data = currentBiometrics[metricId] || [];
      
      if (data.length >= 2) {
        const latest = data[data.length - 1].value;
        const previous = data[data.length - 2].value;
        const change = latest - previous;
        const percentChange = ((change / previous) * 100);
        
        newTrends[metricId] = {
          change: change,
          percentChange: percentChange,
          direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
          isImproving: assessImprovement(metricId, change),
        };
      }
    });
    
    setTrends(newTrends);
  }, [currentBiometrics]);

  const assessImprovement = (metricId, change) => {
    // Define what constitutes improvement for each metric
    const improvementMap = {
      weight: change <= 0, // Weight loss is generally good
      bodyFat: change < 0, // Body fat reduction is good
      muscleMass: change > 0, // Muscle gain is good
      heartRate: change < 0, // Lower resting HR is good
      sleep: change > 0, // More sleep is good
      hydration: change > 0, // More water is good
    };
    
    return improvementMap[metricId] || false;
  };

  const updateChartData = useCallback(() => {
    const data = currentBiometrics[selectedMetric] || [];
    const formattedData = data.map((item, index) => ({
      x: index,
      y: item.value,
      date: item.date,
      label: `${item.value}${BIOMETRIC_TYPES[selectedMetric.toUpperCase()]?.unit || ''}`,
    }));
    
    setChartData(formattedData);
  }, [selectedMetric, currentBiometrics]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      // dispatch(fetchUserBiometrics(userId));
      calculateTrends();
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh biometric data');
    } finally {
      setRefreshing(false);
    }
  }, [userId, calculateTrends]);

  const handleAddMeasurement = () => {
    if (!newValue.trim()) {
      Alert.alert('Invalid Input', 'Please enter a valid measurement');
      return;
    }

    const metric = BIOMETRIC_TYPES[selectedMetric.toUpperCase()];
    const value = parseFloat(newValue);
    
    if (isNaN(value) || value < metric.min || value > metric.max) {
      Alert.alert('Invalid Value', `Please enter a value between ${metric.min} and ${metric.max}`);
      return;
    }

    // Vibration feedback
    Vibration.vibrate(50);

    // Add new measurement (would normally dispatch to Redux)
    const newMeasurement = {
      date: selectedDate.toISOString().split('T')[0],
      value: value,
      timestamp: Date.now(),
    };

    // Pulse animation for success
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    if (onDataUpdate) {
      onDataUpdate(selectedMetric, newMeasurement);
    }

    setShowAddModal(false);
    setNewValue('');
    
    Alert.alert('Success! 🎉', 'Measurement added successfully');
  };

  const renderMetricCard = (metricKey) => {
    const metric = BIOMETRIC_TYPES[metricKey];
    const data = currentBiometrics[metric.id] || [];
    const latestValue = data.length > 0 ? data[data.length - 1].value : 0;
    const trend = trends[metric.id];

    return (
      <TouchableOpacity
        key={metric.id}
        onPress={() => setSelectedMetric(metric.id)}
        activeOpacity={0.8}
        style={[
          styles.metricCard,
          selectedMetric === metric.id && styles.selectedMetricCard,
        ]}
      >
        <Surface style={styles.metricSurface} elevation={4}>
          <LinearGradient
            colors={metric.gradient}
            style={styles.metricGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.metricHeader}>
              <Icon name={metric.icon} size={24} color={COLORS.white} />
              {trend && (
                <View style={styles.trendContainer}>
                  <Icon
                    name={trend.direction === 'up' ? 'trending-up' : 'trending-down'}
                    size={16}
                    color={trend.isImproving ? COLORS.success : COLORS.warning}
                  />
                  <Text style={[styles.trendText, {
                    color: trend.isImproving ? COLORS.success : COLORS.warning
                  }]}>
                    {Math.abs(trend.percentChange).toFixed(1)}%
                  </Text>
                </View>
              )}
            </View>
            
            <Text style={styles.metricValue}>
              {latestValue.toFixed(metric.decimals || 0)}
              <Text style={styles.metricUnit}> {metric.unit}</Text>
            </Text>
            
            <Text style={styles.metricName}>{metric.name}</Text>
            
            {data.length > 1 && (
              <View style={styles.progressIndicator}>
                <Text style={styles.progressText}>
                  {data.length} measurements
                </Text>
              </View>
            )}
          </LinearGradient>
        </Surface>
      </TouchableOpacity>
    );
  };

  const renderChart = () => {
    if (!showChart || chartData.length < 2) {
      return (
        <Card style={styles.chartCard}>
          <View style={styles.noDataContainer}>
            <Icon name="show-chart" size={48} color={COLORS.textLight} />
            <Text style={styles.noDataText}>
              Add more measurements to see your progress chart 📈
            </Text>
          </View>
        </Card>
      );
    }

    return (
      <Card style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={TEXT_STYLES.title}>
            {BIOMETRIC_TYPES[selectedMetric.toUpperCase()]?.name} Trend
          </Text>
          <Chip
            icon="timeline"
            mode="outlined"
            style={styles.periodChip}
          >
            Last 30 days
          </Chip>
        </View>
        
        <View style={styles.chartContainer}>
          {/* Placeholder for chart - would use actual chart library */}
          <View style={styles.chartPlaceholder}>
            <Icon name="trending-up" size={64} color={COLORS.primary} />
            <Text style={styles.chartPlaceholderText}>
              Interactive Chart Coming Soon! 📊
            </Text>
          </View>
        </View>
      </Card>
    );
  };

  const renderQuickStats = () => (
    <Card style={styles.statsCard}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.statsGradient}
      >
        <Text style={styles.statsTitle}>📊 Quick Stats</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {Object.keys(currentBiometrics).length}
            </Text>
            <Text style={styles.statLabel}>Metrics Tracked</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {Object.values(currentBiometrics).reduce((acc, curr) => acc + curr.length, 0)}
            </Text>
            <Text style={styles.statLabel}>Total Measurements</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {Object.values(trends).filter(t => t.isImproving).length}
            </Text>
            <Text style={styles.statLabel}>Improving 💪</Text>
          </View>
        </View>
      </LinearGradient>
    </Card>
  );

  return (
    <View style={[styles.container, style]}>
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <ScrollView
          style={styles.scrollView}
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
          {/* Quick stats */}
          {!compactView && renderQuickStats()}

          {/* Metrics grid */}
          <View style={styles.metricsGrid}>
            {Object.keys(BIOMETRIC_TYPES).map(renderMetricCard)}
          </View>

          {/* Chart section */}
          {renderChart()}

          {/* Health insights */}
          <Card style={styles.insightsCard}>
            <LinearGradient
              colors={['#e8f5e8', '#f0f8ff']}
              style={styles.insightsGradient}
            >
              <View style={styles.insightsHeader}>
                <Icon name="lightbulb" size={24} color={COLORS.warning} />
                <Text style={styles.insightsTitle}>💡 Health Insights</Text>
              </View>
              
              <Text style={styles.insightsText}>
                {trends[selectedMetric]?.isImproving
                  ? `Great progress on your ${BIOMETRIC_TYPES[selectedMetric.toUpperCase()]?.name.toLowerCase()}! Keep up the excellent work! 🌟`
                  : `Consider focusing on improving your ${BIOMETRIC_TYPES[selectedMetric.toUpperCase()]?.name.toLowerCase()}. Small consistent changes make a big difference! 💪`
                }
              </Text>
              
              <Button
                mode="outlined"
                icon="psychology"
                style={styles.insightsButton}
                onPress={() => Alert.alert('AI Insights', 'Personalized recommendations coming soon!')}
              >
                Get AI Recommendations
              </Button>
            </LinearGradient>
          </Card>
        </ScrollView>

        {/* Floating Action Button */}
        {editable && (
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <FAB
              icon="add"
              style={styles.fab}
              onPress={() => setShowAddModal(true)}
              label="Add Measurement"
            />
          </Animated.View>
        )}

        {/* Add Measurement Modal */}
        <Portal>
          <Dialog visible={showAddModal} onDismiss={() => setShowAddModal(false)}>
            <Dialog.Title>
              📊 Add {BIOMETRIC_TYPES[selectedMetric.toUpperCase()]?.name}
            </Dialog.Title>
            <Dialog.Content>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.valueInput}
                  value={newValue}
                  onChangeText={setNewValue}
                  placeholder={`Enter value in ${BIOMETRIC_TYPES[selectedMetric.toUpperCase()]?.unit}`}
                  keyboardType="numeric"
                  returnKeyType="done"
                />
                <Text style={styles.inputHint}>
                  Range: {BIOMETRIC_TYPES[selectedMetric.toUpperCase()]?.min} - {BIOMETRIC_TYPES[selectedMetric.toUpperCase()]?.max}
                </Text>
              </View>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setShowAddModal(false)}>Cancel</Button>
              <Button
                mode="contained"
                onPress={handleAddMeasurement}
                style={styles.addButton}
              >
                Add Measurement 💾
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  statsCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statsGradient: {
    padding: SPACING.md,
  },
  statsTitle: {
    ...TEXT_STYLES.title,
    color: COLORS.white,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.white,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  metricCard: {
    width: (width - SPACING.md * 3) / 2,
    marginBottom: SPACING.md,
  },
  selectedMetricCard: {
    transform: [{ scale: 1.02 }],
  },
  metricSurface: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  metricGradient: {
    padding: SPACING.md,
    minHeight: 120,
    justifyContent: 'space-between',
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
  },
  trendText: {
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
  },
  metricUnit: {
    fontSize: 14,
    fontWeight: 'normal',
  },
  metricName: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.white,
    textAlign: 'center',
    fontSize: 12,
  },
  progressIndicator: {
    alignItems: 'center',
  },
  progressText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  chartCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    padding: SPACING.md,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  periodChip: {
    backgroundColor: COLORS.background,
  },
  chartContainer: {
    height: 200,
  },
  chartPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartPlaceholderText: {
    ...TEXT_STYLES.subtitle,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
  },
  noDataText: {
    ...TEXT_STYLES.subtitle,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  insightsCard: {
    marginBottom: 100,
    borderRadius: 16,
    overflow: 'hidden',
  },
  insightsGradient: {
    padding: SPACING.md,
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  insightsTitle: {
    ...TEXT_STYLES.title,
    marginLeft: SPACING.sm,
    color: COLORS.text,
  },
  insightsText: {
    ...TEXT_STYLES.body,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: SPACING.md,
    color: COLORS.text,
  },
  insightsButton: {
    alignSelf: 'flex-start',
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  inputContainer: {
    marginVertical: SPACING.md,
  },
  valueInput: {
    borderWidth: 1,
    borderColor: COLORS.textLight,
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: 16,
    marginBottom: SPACING.sm,
  },
  inputHint: {
    ...TEXT_STYLES.caption,
    fontStyle: 'italic',
  },
  addButton: {
    backgroundColor: COLORS.primary,
  },
});

export default BiometricData;