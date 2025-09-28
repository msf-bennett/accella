import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
  Vibration,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  ProgressBar,
  Surface,
  Portal,
  Modal,
  TextInput,
  Menu,
  Divider,
  IconButton,
  FAB,
  Searchbar,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import { useSelector, useDispatch } from 'react-redux';
import {
  LineChart,
  BarChart,
  XAxis,
  YAxis,
  Grid,
  AreaChart,
} from 'recharts';

// Design system imports
import { COLORS, SPACING, TEXT_STYLES } from '../styles/theme';

const { width, height } = Dimensions.get('window');
const chartWidth = width - (SPACING.md * 2);

const PerformanceMetrics = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, performanceData, achievements } = useSelector(state => state.athlete);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [showAddMetric, setShowAddMetric] = useState(false);
  const [timeRange, setTimeRange] = useState('week');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [chartType, setChartType] = useState('line');
  const [metricForm, setMetricForm] = useState({
    name: '',
    value: '',
    unit: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);
  const [timeRangeMenuVisible, setTimeRangeMenuVisible] = useState(false);

  // Sample performance data
  const [sampleMetrics] = useState([
    {
      id: 1,
      name: 'Sprint Speed',
      category: 'speed',
      value: 28.5,
      unit: 'km/h',
      previousValue: 27.2,
      trend: 'up',
      lastUpdated: '2025-08-23',
      history: [
        { date: '2025-08-16', value: 26.8 },
        { date: '2025-08-17', value: 27.1 },
        { date: '2025-08-18', value: 27.5 },
        { date: '2025-08-19', value: 27.8 },
        { date: '2025-08-20', value: 28.0 },
        { date: '2025-08-21', value: 28.2 },
        { date: '2025-08-22', value: 28.3 },
        { date: '2025-08-23', value: 28.5 },
      ]
    },
    {
      id: 2,
      name: 'Vertical Jump',
      category: 'power',
      value: 65,
      unit: 'cm',
      previousValue: 62,
      trend: 'up',
      lastUpdated: '2025-08-23',
      history: [
        { date: '2025-08-16', value: 60 },
        { date: '2025-08-17', value: 61 },
        { date: '2025-08-18', value: 62 },
        { date: '2025-08-19', value: 63 },
        { date: '2025-08-20', value: 63 },
        { date: '2025-08-21', value: 64 },
        { date: '2025-08-22', value: 64 },
        { date: '2025-08-23', value: 65 },
      ]
    },
    {
      id: 3,
      name: 'VO2 Max',
      category: 'endurance',
      value: 52.3,
      unit: 'ml/kg/min',
      previousValue: 51.8,
      trend: 'up',
      lastUpdated: '2025-08-22',
      history: [
        { date: '2025-08-16', value: 50.5 },
        { date: '2025-08-17', value: 50.8 },
        { date: '2025-08-18', value: 51.0 },
        { date: '2025-08-19', value: 51.2 },
        { date: '2025-08-20', value: 51.5 },
        { date: '2025-08-21', value: 51.8 },
        { date: '2025-08-22', value: 52.3 },
        { date: '2025-08-23', value: 52.3 },
      ]
    },
    {
      id: 4,
      name: 'Body Fat',
      category: 'body_composition',
      value: 12.5,
      unit: '%',
      previousValue: 13.2,
      trend: 'down',
      lastUpdated: '2025-08-21',
      history: [
        { date: '2025-08-16', value: 14.0 },
        { date: '2025-08-17', value: 13.8 },
        { date: '2025-08-18', value: 13.5 },
        { date: '2025-08-19', value: 13.2 },
        { date: '2025-08-20', value: 13.0 },
        { date: '2025-08-21', value: 12.5 },
        { date: '2025-08-22', value: 12.5 },
        { date: '2025-08-23', value: 12.5 },
      ]
    },
    {
      id: 5,
      name: 'Resting Heart Rate',
      category: 'recovery',
      value: 48,
      unit: 'bpm',
      previousValue: 52,
      trend: 'down',
      lastUpdated: '2025-08-23',
      history: [
        { date: '2025-08-16', value: 55 },
        { date: '2025-08-17', value: 54 },
        { date: '2025-08-18', value: 53 },
        { date: '2025-08-19', value: 52 },
        { date: '2025-08-20', value: 51 },
        { date: '2025-08-21', value: 50 },
        { date: '2025-08-22', value: 49 },
        { date: '2025-08-23', value: 48 },
      ]
    }
  ]);

  const metricCategories = [
    { label: 'All Metrics', value: 'all', icon: 'analytics', color: COLORS.primary },
    { label: 'Speed', value: 'speed', icon: 'speed', color: '#FF6B6B' },
    { label: 'Power', value: 'power', icon: 'flash-on', color: '#4ECDC4' },
    { label: 'Endurance', value: 'endurance', icon: 'favorite', color: '#45B7D1' },
    { label: 'Strength', value: 'strength', icon: 'fitness-center', color: '#96CEB4' },
    { label: 'Recovery', value: 'recovery', icon: 'spa', color: '#FFEAA7' },
    { label: 'Body Composition', value: 'body_composition', icon: 'accessibility', color: '#DDA0DD' },
  ];

  const timeRanges = [
    { label: 'Last 7 Days', value: 'week' },
    { label: 'Last 30 Days', value: 'month' },
    { label: 'Last 3 Months', value: 'quarter' },
    { label: 'Last Year', value: 'year' },
  ];

  const chartTypes = [
    { label: 'Line Chart', value: 'line', icon: 'show-chart' },
    { label: 'Bar Chart', value: 'bar', icon: 'bar-chart' },
    { label: 'Area Chart', value: 'area', icon: 'area-chart' },
  ];

  // Animations
  useEffect(() => {
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

  // Event handlers
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      Vibration.vibrate(50);
    }, 1000);
  }, []);

  const handleAddMetric = () => {
    if (!metricForm.name || !metricForm.value) {
      Alert.alert('Error', 'Please fill in the required fields');
      return;
    }
    
    Alert.alert('Success', '📊 Metric recorded successfully!');
    setShowAddMetric(false);
    setMetricForm({
      name: '',
      value: '',
      unit: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    Vibration.vibrate(100);
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return 'trending-up';
      case 'down': return 'trending-down';
      default: return 'trending-flat';
    }
  };

  const getTrendColor = (trend, category) => {
    // For some metrics, down trend is good (like body fat, resting heart rate)
    const reverseTrendCategories = ['body_composition', 'recovery'];
    const isReverseTrend = reverseTrendCategories.includes(category);
    
    if (trend === 'up') {
      return isReverseTrend ? COLORS.error : COLORS.success;
    } else if (trend === 'down') {
      return isReverseTrend ? COLORS.success : COLORS.error;
    }
    return COLORS.secondary;
  };

  const getCategoryData = (category) => {
    return metricCategories.find(cat => cat.value === category) || metricCategories[0];
  };

  const calculateImprovement = (current, previous) => {
    const improvement = ((current - previous) / previous * 100).toFixed(1);
    return improvement > 0 ? `+${improvement}%` : `${improvement}%`;
  };

  const filteredMetrics = sampleMetrics.filter(metric => {
    const categoryMatch = selectedCategory === 'all' || metric.category === selectedCategory;
    const searchMatch = metric.name.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && searchMatch;
  });

  const renderMetricCard = (metric) => {
    const categoryData = getCategoryData(metric.category);
    const trendColor = getTrendColor(metric.trend, metric.category);
    const improvement = calculateImprovement(metric.value, metric.previousValue);

    return (
      <TouchableOpacity
        key={metric.id}
        onPress={() => setSelectedMetric(metric)}
        activeOpacity={0.7}
      >
        <Card style={styles.metricCard} elevation={4}>
          <LinearGradient
            colors={[`${categoryData.color}15`, `${categoryData.color}05`]}
            style={styles.metricCardGradient}
          >
            <View style={styles.metricHeader}>
              <View style={styles.metricTitleSection}>
                <View style={[styles.metricIcon, { backgroundColor: categoryData.color }]}>
                  <Icon name={categoryData.icon} size={20} color="white" />
                </View>
                <View style={styles.metricInfo}>
                  <Text style={styles.metricName}>{metric.name}</Text>
                  <Text style={styles.metricCategory}>{categoryData.label}</Text>
                </View>
              </View>
              <View style={styles.trendIndicator}>
                <Icon 
                  name={getTrendIcon(metric.trend)} 
                  size={24} 
                  color={trendColor} 
                />
              </View>
            </View>

            <View style={styles.metricValueSection}>
              <View style={styles.currentValue}>
                <Text style={styles.metricValue}>{metric.value}</Text>
                <Text style={styles.metricUnit}>{metric.unit}</Text>
              </View>
              <View style={styles.improvementBadge}>
                <Text style={[styles.improvementText, { color: trendColor }]}>
                  {improvement}
                </Text>
                <Text style={styles.improvementLabel}>vs last</Text>
              </View>
            </View>

            <View style={styles.metricFooter}>
              <Text style={styles.lastUpdated}>
                📅 Updated: {new Date(metric.lastUpdated).toLocaleDateString()}
              </Text>
              <Button 
                mode="text" 
                onPress={() => setSelectedMetric(metric)}
                compact
                labelStyle={styles.viewDetailsText}
              >
                View Details 📊
              </Button>
            </View>
          </LinearGradient>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderChart = (metric) => {
    const data = metric.history.map(item => ({
      date: new Date(item.date).getDate(),
      value: item.value,
    }));

    switch (chartType) {
      case 'bar':
        return (
          <BarChart
            style={styles.chart}
            data={data}
            width={chartWidth - 40}
            height={200}
            chartConfig={{
              backgroundColor: COLORS.surface,
              backgroundGradientFrom: COLORS.surface,
              backgroundGradientTo: COLORS.surface,
              color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
            }}
            fromZero
          />
        );
      case 'area':
        return (
          <AreaChart
            style={styles.chart}
            data={data}
            width={chartWidth - 40}
            height={200}
            chartConfig={{
              backgroundColor: COLORS.surface,
              backgroundGradientFrom: COLORS.surface,
              backgroundGradientTo: COLORS.surface,
              color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
            }}
          />
        );
      default:
        return (
          <LineChart
            style={styles.chart}
            data={data}
            width={chartWidth - 40}
            height={200}
            chartConfig={{
              backgroundColor: COLORS.surface,
              backgroundGradientFrom: COLORS.surface,
              backgroundGradientTo: COLORS.surface,
              color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
              strokeWidth: 3,
            }}
            bezier
          />
        );
    }
  };

  const renderMetricModal = () => (
    <Portal>
      <Modal 
        visible={!!selectedMetric} 
        onDismiss={() => setSelectedMetric(null)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.blurOverlay} blurType="light" blurAmount={10}>
          <Surface style={styles.modalContent} elevation={8}>
            {selectedMetric && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalTitleSection}>
                    <Text style={styles.modalTitle}>{selectedMetric.name}</Text>
                    <Text style={styles.modalSubtitle}>
                      {getCategoryData(selectedMetric.category).label}
                    </Text>
                  </View>
                  <IconButton 
                    icon="close" 
                    onPress={() => setSelectedMetric(null)}
                    iconColor={COLORS.text}
                  />
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={styles.modalStats}>
                    <View style={styles.statBox}>
                      <Text style={styles.statLabel}>Current</Text>
                      <Text style={styles.statValue}>
                        {selectedMetric.value} {selectedMetric.unit}
                      </Text>
                    </View>
                    <View style={styles.statBox}>
                      <Text style={styles.statLabel}>Previous</Text>
                      <Text style={styles.statValue}>
                        {selectedMetric.previousValue} {selectedMetric.unit}
                      </Text>
                    </View>
                    <View style={styles.statBox}>
                      <Text style={styles.statLabel}>Change</Text>
                      <Text style={[
                        styles.statValue,
                        { color: getTrendColor(selectedMetric.trend, selectedMetric.category) }
                      ]}>
                        {calculateImprovement(selectedMetric.value, selectedMetric.previousValue)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.chartSection}>
                    <View style={styles.chartHeader}>
                      <Text style={styles.chartTitle}>📈 Progress Chart</Text>
                      <View style={styles.chartControls}>
                        {chartTypes.map((type) => (
                          <TouchableOpacity
                            key={type.value}
                            onPress={() => setChartType(type.value)}
                            style={[
                              styles.chartTypeButton,
                              chartType === type.value && styles.activeChartType
                            ]}
                          >
                            <Icon 
                              name={type.icon} 
                              size={16} 
                              color={chartType === type.value ? 'white' : COLORS.text} 
                            />
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                    
                    <Surface style={styles.chartContainer} elevation={2}>
                      {renderChart(selectedMetric)}
                    </Surface>
                  </View>

                  <View style={styles.historySection}>
                    <Text style={styles.historyTitle}>📋 Recent History</Text>
                    {selectedMetric.history.slice(-5).reverse().map((entry, index) => (
                      <View key={index} style={styles.historyItem}>
                        <Text style={styles.historyDate}>
                          {new Date(entry.date).toLocaleDateString()}
                        </Text>
                        <Text style={styles.historyValue}>
                          {entry.value} {selectedMetric.unit}
                        </Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </>
            )}
          </Surface>
        </BlurView>
      </Modal>
    </Portal>
  );

  const renderAddMetricModal = () => (
    <Portal>
      <Modal 
        visible={showAddMetric} 
        onDismiss={() => setShowAddMetric(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Surface style={styles.addMetricModal} elevation={8}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>📊 Record New Metric</Text>
            <IconButton 
              icon="close" 
              onPress={() => setShowAddMetric(false)}
              iconColor={COLORS.text}
            />
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            <TextInput
              label="Metric Name *"
              value={metricForm.name}
              onChangeText={(text) => setMetricForm({...metricForm, name: text})}
              style={styles.textInput}
              mode="outlined"
            />

            <View style={styles.inputRow}>
              <TextInput
                label="Value *"
                value={metricForm.value}
                onChangeText={(text) => setMetricForm({...metricForm, value: text})}
                style={[styles.textInput, { flex: 1, marginRight: SPACING.sm }]}
                mode="outlined"
                keyboardType="numeric"
              />
              <TextInput
                label="Unit"
                value={metricForm.unit}
                onChangeText={(text) => setMetricForm({...metricForm, unit: text})}
                style={[styles.textInput, { flex: 1, marginLeft: SPACING.sm }]}
                mode="outlined"
                placeholder="kg, cm, %"
              />
            </View>

            <Menu
              visible={categoryMenuVisible}
              onDismiss={() => setCategoryMenuVisible(false)}
              anchor={
                <TouchableOpacity 
                  style={styles.menuButton}
                  onPress={() => setCategoryMenuVisible(true)}
                >
                  <Text style={styles.menuButtonText}>
                    {metricForm.category ? 
                      metricCategories.find(c => c.value === metricForm.category)?.label : 
                      'Select Category'
                    }
                  </Text>
                  <Icon name="arrow-drop-down" size={24} color={COLORS.text} />
                </TouchableOpacity>
              }
            >
              {metricCategories.slice(1).map((category) => (
                <Menu.Item
                  key={category.value}
                  title={category.label}
                  onPress={() => {
                    setMetricForm({...metricForm, category: category.value});
                    setCategoryMenuVisible(false);
                  }}
                  leadingIcon={category.icon}
                />
              ))}
            </Menu>

            <TextInput
              label="Date"
              value={metricForm.date}
              onChangeText={(text) => setMetricForm({...metricForm, date: text})}
              style={styles.textInput}
              mode="outlined"
              placeholder="YYYY-MM-DD"
            />

            <TextInput
              label="Notes"
              value={metricForm.notes}
              onChangeText={(text) => setMetricForm({...metricForm, notes: text})}
              style={styles.textInput}
              mode="outlined"
              multiline
              numberOfLines={3}
            />

            <Button 
              mode="contained" 
              onPress={handleAddMetric}
              style={styles.addButton}
              contentStyle={styles.addButtonContent}
            >
              📊 Record Metric
            </Button>
          </ScrollView>
        </Surface>
      </Modal>
    </Portal>
  );

  const calculateOverallProgress = () => {
    const improvingMetrics = sampleMetrics.filter(metric => {
      const reverseTrendCategories = ['body_composition', 'recovery'];
      const isReverseTrend = reverseTrendCategories.includes(metric.category);
      return (metric.trend === 'up' && !isReverseTrend) || (metric.trend === 'down' && isReverseTrend);
    });
    return Math.round((improvingMetrics.length / sampleMetrics.length) * 100);
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTitleSection}>
            <Text style={styles.headerTitle}>📊 Performance Metrics</Text>
            <Text style={styles.headerSubtitle}>Track your progress, unlock your potential! 🚀</Text>
          </View>
          <View style={styles.headerStats}>
            <View style={styles.statCircle}>
              <Text style={styles.statNumber}>{calculateOverallProgress()}%</Text>
              <Text style={styles.statLabel}>Improving</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.controlsSection}>
          <Searchbar
            placeholder="Search metrics..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
            iconColor={COLORS.primary}
          />

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoryFilter}
            contentContainerStyle={styles.categoryFilterContent}
          >
            {metricCategories.map((category) => (
              <Chip
                key={category.value}
                selected={selectedCategory === category.value}
                onPress={() => setSelectedCategory(category.value)}
                style={[
                  styles.categoryChip,
                  selectedCategory === category.value && { backgroundColor: category.color }
                ]}
                textStyle={[
                  styles.categoryChipText,
                  selectedCategory === category.value && { color: 'white' }
                ]}
                icon={category.icon}
              >
                {category.label}
              </Chip>
            ))}
          </ScrollView>
        </View>

        <ScrollView 
          style={styles.metricsList}
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
          {filteredMetrics.length > 0 ? (
            filteredMetrics.map(renderMetricCard)
          ) : (
            <View style={styles.emptyState}>
              <Icon name="analytics" size={80} color={COLORS.secondary} />
              <Text style={styles.emptyTitle}>No Metrics Found!</Text>
              <Text style={styles.emptySubtitle}>
                Start tracking your performance data 📈
              </Text>
            </View>
          )}
          
          <View style={styles.bottomPadding} />
        </ScrollView>
      </Animated.View>

      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => setShowAddMetric(true)}
        color="white"
      />

      {renderMetricModal()}
      {renderAddMetricModal()}
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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitleSection: {
    flex: 1,
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: 'white',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  headerStats: {
    alignItems: 'center',
  },
  statCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statNumber: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: 'bold',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
  },
  content: {
    flex: 1,
  },
  controlsSection: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  searchBar: {
    marginBottom: SPACING.sm,
    elevation: 2,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  categoryFilter: {
    marginBottom: SPACING.sm,
  },
  categoryFilterContent: {
    paddingRight: SPACING.md,
  },
  categoryChip: {
    marginRight: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  categoryChipText: {
    color: COLORS.text,
  },
  metricsList: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  metricCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
  },
  metricCardGradient: {
    padding: SPACING.md,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  metricTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  metricInfo: {
    flex: 1,
  },
  metricName: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  metricCategory: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
    textTransform: 'capitalize',
  },
  trendIndicator: {
    padding: SPACING.xs,
  },
  metricValueSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  currentValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  metricValue: {
    ...TEXT_STYLES.h1,
    color: COLORS.text,
    fontWeight: 'bold',
    marginRight: SPACING.xs,
  },
  metricUnit: {
    ...TEXT_STYLES.body,
    color: COLORS.secondary,
    fontWeight: '500',
  },
  improvementBadge: {
    alignItems: 'flex-end',
  },
  improvementText: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
  },
  improvementLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
  },
  metricFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastUpdated: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
  },
  viewDetailsText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: SPACING.xl,
    marginTop: SPACING.xl,
  },
  emptyTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.secondary,
    textAlign: 'center',
  },
  bottomPadding: {
    height: 100,
  },
  fab: {
    position: 'absolute',
    right: SPACING.md,
    bottom: SPACING.xl,
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modalContent: {
    width: width - (SPACING.md * 2),
    maxHeight: height * 0.8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    overflow: 'hidden',
  },
  addMetricModal: {
    width: width - (SPACING.md * 2),
    maxHeight: height * 0.8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  modalTitleSection: {
    flex: 1,
  },
  modalTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  modalSubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.secondary,
  },
  modalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.background,
    margin: SPACING.md,
    borderRadius: 12,
  },
  statBox: {
    alignItems: 'center',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
    marginBottom: SPACING.xs,
  },
  statValue: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  chartSection: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  chartTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  chartControls: {
    flexDirection: 'row',
  },
  chartTypeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.xs,
    backgroundColor: COLORS.background,
  },
  activeChartType: {
    backgroundColor: COLORS.primary,
  },
  chartContainer: {
    borderRadius: 12,
    padding: SPACING.sm,
    alignItems: 'center',
  },
  chart: {
    borderRadius: 8,
  },
  historySection: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  historyTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.background,
    marginBottom: SPACING.xs,
    borderRadius: 8,
  },
  historyDate: {
    ...TEXT_STYLES.body,
    color: COLORS.secondary,
  },
  historyValue: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: '600',
  },
  textInput: {
    marginBottom: SPACING.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.divider,
    marginBottom: SPACING.md,
  },
  menuButtonText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
  },
  addButton: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.primary,
  },
  addButtonContent: {
    paddingVertical: SPACING.sm,
  },
});

export default PerformanceMetrics;