import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
  TextInput,
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
  Portal,
  Modal,
  Searchbar,
  FAB,
  Divider,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { LineChart } from 'react-native-chart-kit';

// Design System Imports
import { COLORS, SPACING, TEXT_STYLES } from '../styles/designSystem';
import PlaceholderScreen from '../components/PlaceholderScreen';

const { width, height } = Dimensions.get('window');

const PerformanceMetricsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, metricsData, loading } = useSelector(state => state.performance);
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [newMetricValue, setNewMetricValue] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  // Mock metrics data - replace with actual data from Redux store
  const mockMetricsData = [
    {
      id: 1,
      name: 'Bench Press 1RM',
      category: 'strength',
      unit: 'kg',
      currentValue: 85,
      previousValue: 80,
      personalBest: 90,
      target: 100,
      lastUpdated: '2024-08-25',
      trend: 'up',
      importance: 'high',
      history: [
        { date: '2024-07-01', value: 75 },
        { date: '2024-07-15', value: 78 },
        { date: '2024-08-01', value: 80 },
        { date: '2024-08-15', value: 83 },
        { date: '2024-08-25', value: 85 },
      ],
      notes: 'Steady improvement with proper form',
      coach: 'Mike Johnson',
    },
    {
      id: 2,
      name: '5K Run Time',
      category: 'endurance',
      unit: 'min:sec',
      currentValue: '26:12',
      previousValue: '27:45',
      personalBest: '25:30',
      target: '24:00',
      lastUpdated: '2024-08-24',
      trend: 'up',
      importance: 'high',
      history: [
        { date: '2024-07-01', value: '29:15' },
        { date: '2024-07-15', value: '28:30' },
        { date: '2024-08-01', value: '27:45' },
        { date: '2024-08-15', value: '26:58' },
        { date: '2024-08-24', value: '26:12' },
      ],
      notes: 'Great progress with interval training',
      coach: 'Sarah Davis',
    },
    {
      id: 3,
      name: 'Body Fat Percentage',
      category: 'body_composition',
      unit: '%',
      currentValue: 16.2,
      previousValue: 17.5,
      personalBest: 15.8,
      target: 15.0,
      lastUpdated: '2024-08-20',
      trend: 'up',
      importance: 'medium',
      history: [
        { date: '2024-07-01', value: 19.2 },
        { date: '2024-07-15', value: 18.5 },
        { date: '2024-08-01', value: 17.8 },
        { date: '2024-08-15', value: 17.5 },
        { date: '2024-08-20', value: 16.2 },
      ],
      notes: 'Excellent progress with nutrition plan',
      coach: 'Emma Wilson',
    },
    {
      id: 4,
      name: 'Squat Depth',
      category: 'flexibility',
      unit: 'degrees',
      currentValue: 95,
      previousValue: 85,
      personalBest: 98,
      target: 110,
      lastUpdated: '2024-08-26',
      trend: 'up',
      importance: 'high',
      history: [
        { date: '2024-07-01', value: 75 },
        { date: '2024-07-15', value: 80 },
        { date: '2024-08-01', value: 85 },
        { date: '2024-08-15', value: 92 },
        { date: '2024-08-26', value: 95 },
      ],
      notes: 'Daily mobility work paying off',
      coach: 'Mike Johnson',
    },
    {
      id: 5,
      name: 'Sleep Quality Score',
      category: 'recovery',
      unit: '/10',
      currentValue: 8.2,
      previousValue: 7.5,
      personalBest: 8.7,
      target: 9.0,
      lastUpdated: '2024-08-26',
      trend: 'up',
      importance: 'medium',
      history: [
        { date: '2024-07-01', value: 6.8 },
        { date: '2024-07-15', value: 7.2 },
        { date: '2024-08-01', value: 7.5 },
        { date: '2024-08-15', value: 7.9 },
        { date: '2024-08-26', value: 8.2 },
      ],
      notes: 'Improved sleep hygiene routine',
      coach: 'Emma Wilson',
    },
    {
      id: 6,
      name: 'Vertical Jump',
      category: 'power',
      unit: 'cm',
      currentValue: 62,
      previousValue: 58,
      personalBest: 64,
      target: 70,
      lastUpdated: '2024-08-23',
      trend: 'up',
      importance: 'medium',
      history: [
        { date: '2024-07-01', value: 55 },
        { date: '2024-07-15', value: 57 },
        { date: '2024-08-01', value: 58 },
        { date: '2024-08-15', value: 60 },
        { date: '2024-08-23', value: 62 },
      ],
      notes: 'Plyometric training showing results',
      coach: 'Mike Johnson',
    },
  ];

  const categories = [
    { key: 'all', label: 'All Metrics', icon: 'dashboard', color: COLORS.primary },
    { key: 'strength', label: 'Strength', icon: 'fitness-center', color: '#E53E3E' },
    { key: 'endurance', label: 'Endurance', icon: 'directions-run', color: COLORS.success },
    { key: 'flexibility', label: 'Flexibility', icon: 'self-improvement', color: '#FF9800' },
    { key: 'body_composition', label: 'Body Comp', icon: 'monitor-weight', color: '#9C27B0' },
    { key: 'recovery', label: 'Recovery', icon: 'bedtime', color: '#00BCD4' },
    { key: 'power', label: 'Power', icon: 'flash-on', color: '#FF5722' },
  ];

  const sortOptions = [
    { key: 'recent', label: 'Most Recent', icon: 'schedule' },
    { key: 'importance', label: 'Importance', icon: 'priority-high' },
    { key: 'progress', label: 'Best Progress', icon: 'trending-up' },
    { key: 'alphabetical', label: 'A-Z', icon: 'sort-by-alpha' },
  ];

  const getImportanceColor = (importance) => {
    switch (importance) {
      case 'high': return COLORS.error;
      case 'medium': return '#FF9800';
      case 'low': return COLORS.success;
      default: return COLORS.primary;
    }
  };

  const getCategoryColor = (category) => {
    const cat = categories.find(c => c.key === category);
    return cat ? cat.color : COLORS.primary;
  };

  const calculateProgress = (current, target, unit) => {
    if (unit === 'min:sec') {
      // Convert time to seconds for calculation
      const currentSeconds = timeToSeconds(current);
      const targetSeconds = timeToSeconds(target);
      return Math.min(100, Math.max(0, ((currentSeconds - targetSeconds) / currentSeconds) * 100));
    }
    return Math.min(100, (current / target) * 100);
  };

  const timeToSeconds = (timeString) => {
    const [minutes, seconds] = timeString.split(':').map(Number);
    return minutes * 60 + seconds;
  };

  const getChangePercentage = (current, previous, unit) => {
    if (unit === 'min:sec') {
      const currentSeconds = timeToSeconds(current);
      const previousSeconds = timeToSeconds(previous);
      return (((previousSeconds - currentSeconds) / previousSeconds) * 100).toFixed(1);
    }
    return (((current - previous) / previous) * 100).toFixed(1);
  };

  const filteredMetrics = mockMetricsData.filter(metric => {
    const matchesCategory = selectedCategory === 'all' || metric.category === selectedCategory;
    const matchesSearch = metric.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedMetrics = [...filteredMetrics].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.lastUpdated) - new Date(a.lastUpdated);
      case 'importance':
        const importanceOrder = { high: 3, medium: 2, low: 1 };
        return importanceOrder[b.importance] - importanceOrder[a.importance];
      case 'progress':
        const aProgress = getChangePercentage(a.currentValue, a.previousValue, a.unit);
        const bProgress = getChangePercentage(b.currentValue, b.previousValue, b.unit);
        return Math.abs(bProgress) - Math.abs(aProgress);
      case 'alphabetical':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={{
        paddingTop: StatusBar.currentHeight + SPACING.lg,
        paddingHorizontal: SPACING.md,
        paddingBottom: SPACING.lg,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
        <IconButton
          icon="arrow-back"
          iconColor={COLORS.white}
          size={24}
          onPress={() => navigation.goBack()}
        />
        <Text style={[TEXT_STYLES.h2, { color: COLORS.white, flex: 1, textAlign: 'center' }]}>
          Performance Metrics 📏
        </Text>
        <IconButton
          icon="filter-list"
          iconColor={COLORS.white}
          size={24}
          onPress={() => Alert.alert('Filter', 'Advanced filtering options coming soon!')}
        />
      </View>

      <Searchbar
        placeholder="Search metrics..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={{
          backgroundColor: 'rgba(255,255,255,0.9)',
          marginBottom: SPACING.md,
        }}
        inputStyle={{ fontSize: 14 }}
      />

      {/* Quick Stats */}
      <Card style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
        <Card.Content style={{ padding: SPACING.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={[TEXT_STYLES.h2, { color: COLORS.white }]}>
                {mockMetricsData.length}
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.white, opacity: 0.8 }]}>
                Total Metrics
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={[TEXT_STYLES.h2, { color: COLORS.white }]}>
                {mockMetricsData.filter(m => m.trend === 'up').length}
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.white, opacity: 0.8 }]}>
                Improving
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={[TEXT_STYLES.h2, { color: COLORS.white }]}>
                {mockMetricsData.filter(m => m.importance === 'high').length}
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.white, opacity: 0.8 }]}>
                High Priority
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </LinearGradient>
  );

  const renderFilters = () => (
    <View style={{ paddingVertical: SPACING.md }}>
      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: SPACING.md }}
        style={{ marginBottom: SPACING.sm }}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.key}
            onPress={() => setSelectedCategory(category.key)}
            style={{ marginRight: SPACING.sm }}
          >
            <Surface
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: SPACING.md,
                paddingVertical: SPACING.sm,
                borderRadius: 20,
                backgroundColor: selectedCategory === category.key ? category.color : COLORS.background,
                elevation: selectedCategory === category.key ? 2 : 0,
              }}
            >
              <Icon
                name={category.icon}
                size={18}
                color={selectedCategory === category.key ? COLORS.white : category.color}
                style={{ marginRight: SPACING.xs }}
              />
              <Text
                style={[
                  TEXT_STYLES.body,
                  {
                    color: selectedCategory === category.key ? COLORS.white : category.color,
                    fontWeight: selectedCategory === category.key ? 'bold' : 'normal',
                  }
                ]}
              >
                {category.label}
              </Text>
            </Surface>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sort Options */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: SPACING.md }}
      >
        {sortOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            onPress={() => setSortBy(option.key)}
            style={{ marginRight: SPACING.sm }}
          >
            <Chip
              mode={sortBy === option.key ? 'flat' : 'outlined'}
              selected={sortBy === option.key}
              onPress={() => setSortBy(option.key)}
              icon={option.icon}
              style={{
                backgroundColor: sortBy === option.key ? `${COLORS.primary}20` : 'transparent',
              }}
            >
              {option.label}
            </Chip>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderMetricCard = (metric, index) => (
    <Animated.View
      key={metric.id}
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        marginHorizontal: SPACING.md,
        marginBottom: SPACING.md,
      }}
    >
      <Card
        style={{
          backgroundColor: COLORS.white,
          elevation: 3,
          borderRadius: 15,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            setSelectedMetric(metric);
            setShowDetailModal(true);
          }}
          activeOpacity={0.7}
        >
          <Card.Content style={{ padding: SPACING.md }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
              <Surface
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: `${getCategoryColor(metric.category)}20`,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: SPACING.sm,
                }}
              >
                <Icon
                  name={categories.find(c => c.key === metric.category)?.icon || 'timeline'}
                  size={20}
                  color={getCategoryColor(metric.category)}
                />
              </Surface>
              <View style={{ flex: 1 }}>
                <Text style={[TEXT_STYLES.h4, { marginBottom: 2 }]}>{metric.name}</Text>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                  Coach: {metric.coach}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Chip
                  mode="flat"
                  style={{
                    backgroundColor: `${getImportanceColor(metric.importance)}20`,
                    marginRight: SPACING.xs,
                  }}
                  textStyle={{ color: getImportanceColor(metric.importance), fontSize: 10 }}
                >
                  {metric.importance.toUpperCase()}
                </Chip>
                <Icon
                  name={metric.trend === 'up' ? 'trending-up' : 'trending-down'}
                  size={20}
                  color={metric.trend === 'up' ? COLORS.success : COLORS.error}
                />
              </View>
            </View>

            {/* Current Value */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
              <View style={{ flex: 1 }}>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                  Current Value
                </Text>
                <Text style={[TEXT_STYLES.h2, { color: getCategoryColor(metric.category) }]}>
                  {metric.currentValue} {metric.unit}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                  Change from last
                </Text>
                <Text
                  style={[
                    TEXT_STYLES.body,
                    {
                      color: metric.trend === 'up' ? COLORS.success : COLORS.error,
                      fontWeight: 'bold',
                    }
                  ]}
                >
                  {metric.trend === 'up' ? '+' : ''}{getChangePercentage(metric.currentValue, metric.previousValue, metric.unit)}%
                </Text>
              </View>
            </View>

            {/* Progress to Target */}
            <View style={{ marginBottom: SPACING.md }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xs }}>
                <Text style={TEXT_STYLES.body}>Progress to Target</Text>
                <Text style={[TEXT_STYLES.body, { color: getCategoryColor(metric.category) }]}>
                  {calculateProgress(metric.currentValue, metric.target, metric.unit).toFixed(0)}%
                </Text>
              </View>
              <ProgressBar
                progress={calculateProgress(metric.currentValue, metric.target, metric.unit) / 100}
                color={getCategoryColor(metric.category)}
                style={{ height: 8, borderRadius: 4 }}
              />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.xs }}>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                  Current: {metric.currentValue} {metric.unit}
                </Text>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                  Target: {metric.target} {metric.unit}
                </Text>
              </View>
            </View>

            {/* Stats Row */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md }}>
              <View style={{ alignItems: 'center' }}>
                <Icon name="jump-rope" size={20} color="#FFD700" />
                <Text style={[TEXT_STYLES.caption, { marginTop: 2, color: COLORS.textSecondary }]}>
                  PB: {metric.personalBest} {metric.unit}
                </Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Icon name="history" size={20} color={COLORS.primary} />
                <Text style={[TEXT_STYLES.caption, { marginTop: 2, color: COLORS.textSecondary }]}>
                  {metric.history.length} records
                </Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Icon name="calendar-today" size={20} color={COLORS.success} />
                <Text style={[TEXT_STYLES.caption, { marginTop: 2, color: COLORS.textSecondary }]}>
                  {new Date(metric.lastUpdated).toLocaleDateString()}
                </Text>
              </View>
            </View>

            {/* Notes */}
            {metric.notes && (
              <View style={{ backgroundColor: `${getCategoryColor(metric.category)}10`, padding: SPACING.sm, borderRadius: 8 }}>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, fontStyle: 'italic' }]}>
                  "{metric.notes}"
                </Text>
              </View>
            )}
          </Card.Content>
        </TouchableOpacity>
      </Card>
    </Animated.View>
  );

  const renderDetailModal = () => (
    <Portal>
      <Modal
        visible={showDetailModal}
        onDismiss={() => setShowDetailModal(false)}
        contentContainerStyle={{
          backgroundColor: COLORS.white,
          margin: SPACING.md,
          borderRadius: 15,
          maxHeight: '90%',
        }}
      >
        {selectedMetric && (
          <ScrollView>
            {/* Modal Header */}
            <LinearGradient
              colors={[getCategoryColor(selectedMetric.category), `${getCategoryColor(selectedMetric.category)}CC`]}
              style={{
                borderTopLeftRadius: 15,
                borderTopRightRadius: 15,
                padding: SPACING.md,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Icon
                name={categories.find(c => c.key === selectedMetric.category)?.icon || 'timeline'}
                size={24}
                color={COLORS.white}
              />
              <Text style={[TEXT_STYLES.h3, { color: COLORS.white, marginLeft: SPACING.sm, flex: 1 }]}>
                {selectedMetric.name}
              </Text>
              <IconButton
                icon="close"
                iconColor={COLORS.white}
                size={24}
                onPress={() => setShowDetailModal(false)}
              />
            </LinearGradient>

            <View style={{ padding: SPACING.md }}>
              {/* Current Stats */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.lg }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={[TEXT_STYLES.h1, { color: getCategoryColor(selectedMetric.category) }]}>
                    {selectedMetric.currentValue}
                  </Text>
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                    Current ({selectedMetric.unit})
                  </Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={[TEXT_STYLES.h2, { color: '#FFD700' }]}>
                    {selectedMetric.personalBest}
                  </Text>
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                    Personal Best
                  </Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={[TEXT_STYLES.h2, { color: COLORS.primary }]}>
                    {selectedMetric.target}
                  </Text>
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                    Target
                  </Text>
                </View>
              </View>

              <Divider style={{ marginBottom: SPACING.md }} />

              {/* Progress Chart */}
              <Text style={[TEXT_STYLES.h4, { marginBottom: SPACING.md }]}>
                Progress History
              </Text>
              {selectedMetric.history.length > 1 && (
                <LineChart
                  data={{
                    labels: selectedMetric.history.map(h => new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
                    datasets: [{
                      data: selectedMetric.unit === 'min:sec' 
                        ? selectedMetric.history.map(h => timeToSeconds(h.value))
                        : selectedMetric.history.map(h => parseFloat(h.value)),
                      color: () => getCategoryColor(selectedMetric.category),
                    }],
                  }}
                  width={width - (SPACING.md * 4)}
                  height={200}
                  chartConfig={{
                    backgroundColor: COLORS.white,
                    backgroundGradientFrom: COLORS.white,
                    backgroundGradientTo: COLORS.white,
                    color: (opacity = 1) => `${getCategoryColor(selectedMetric.category)}${Math.round(opacity * 255).toString(16)}`,
                    strokeWidth: 3,
                    barPercentage: 0.7,
                    useShadowColorFromDataset: false,
                    decimalPlaces: selectedMetric.unit === '%' ? 1 : 0,
                    propsForLabels: {
                      fontSize: 10,
                    },
                  }}
                  bezier
                  style={{ borderRadius: 10, marginBottom: SPACING.lg }}
                />
              )}

              <Divider style={{ marginBottom: SPACING.md }} />

              {/* Add New Entry */}
              <Text style={[TEXT_STYLES.h4, { marginBottom: SPACING.md }]}>
                Record New Entry
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg }}>
                <TextInput
                  style={{
                    flex: 1,
                    borderWidth: 1,
                    borderColor: COLORS.border,
                    borderRadius: 8,
                    paddingHorizontal: SPACING.md,
                    paddingVertical: SPACING.sm,
                    marginRight: SPACING.sm,
                    fontSize: 16,
                  }}
                  placeholder={`Enter value (${selectedMetric.unit})`}
                  value={newMetricValue}
                  onChangeText={setNewMetricValue}
                  keyboardType={selectedMetric.unit === 'min:sec' ? 'default' : 'numeric'}
                />
                <Button
                  mode="contained"
                  onPress={() => {
                    if (newMetricValue.trim()) {
                      Alert.alert('Success', 'New metric value recorded!');
                      setNewMetricValue('');
                      setShowDetailModal(false);
                    }
                  }}
                  style={{ backgroundColor: getCategoryColor(selectedMetric.category) }}
                >
                  Add
                </Button>
              </View>

              {/* Notes */}
              {selectedMetric.notes && (
                <View>
                  <Text style={[TEXT_STYLES.h4, { marginBottom: SPACING.sm }]}>
                    Coach Notes
                  </Text>
                  <View style={{ backgroundColor: `${getCategoryColor(selectedMetric.category)}10`, padding: SPACING.md, borderRadius: 8, marginBottom: SPACING.md }}>
                    <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary, fontStyle: 'italic' }]}>
                      "{selectedMetric.notes}"
                    </Text>
                  </View>
                </View>
              )}

              {/* Action Buttons */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Button
                  mode="outlined"
                  onPress={() => {
                    setShowDetailModal(false);
                    navigation.navigate('MetricHistory', { metricId: selectedMetric.id });
                  }}
                  style={{ flex: 1, marginRight: SPACING.xs }}
                  contentStyle={{ paddingVertical: 4 }}
                >
                  View History
                </Button>
                <Button
                  mode="contained"
                  onPress={() => {
                    setShowDetailModal(false);
                    navigation.navigate('WorkoutSession', { focusMetric: selectedMetric.id });
                  }}
                  style={{ 
                    flex: 1, 
                    marginLeft: SPACING.xs,
                    backgroundColor: getCategoryColor(selectedMetric.category)
                  }}
                  contentStyle={{ paddingVertical: 4 }}
                >
                  Train Now
                </Button>
              </View>
            </View>
          </ScrollView>
        )}
      </Modal>
    </Portal>
  );

  const renderAddMetricModal = () => (
    <Portal>
      <Modal
        visible={showAddModal}
        onDismiss={() => setShowAddModal(false)}
        contentContainerStyle={{
          backgroundColor: COLORS.white,
          margin: SPACING.lg,
          borderRadius: 15,
          padding: SPACING.lg,
          maxHeight: '80%',
        }}
      >
        <ScrollView>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
            <Icon name="add-chart" size={24} color={COLORS.primary} />
            <Text style={[TEXT_STYLES.h3, { marginLeft: SPACING.sm, flex: 1 }]}>
              Add New Metric
            </Text>
            <IconButton
              icon="close"
              size={24}
              onPress={() => setShowAddModal(false)}
            />
          </View>

          <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary, marginBottom: SPACING.lg }]}>
            Track a new performance metric to monitor your progress over time.
          </Text>

          {/* Quick Metric Templates */}
          <Text style={[TEXT_STYLES.h4, { marginBottom: SPACING.md }]}>Popular Metrics</Text>
          
          {['Deadlift 1RM', 'Push-ups Max', '10K Run Time', 'Flexibility Score', 'Resting Heart Rate'].map((metric, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                Alert.alert('Add Metric', `Add ${metric} to your tracking?`, [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Add', 
                    onPress: () => {
                      Alert.alert('Success', `${metric} added to your metrics!`);
                      setShowAddModal(false);
                    }
                  }
                ]);
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: SPACING.md,
                backgroundColor: COLORS.background,
                borderRadius: 8,
                marginBottom: SPACING.sm,
              }}
            >
              <Icon name="add" size={20} color={COLORS.primary} />
              <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.sm, flex: 1 }]}>
                {metric}
              </Text>
              <Icon name="chevron-right" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          ))}

          <Button
            mode="contained"
            onPress={() => {
              setShowAddModal(false);
              Alert.alert('Custom Metric', 'Custom metric builder coming soon!');
            }}
            style={{ marginTop: SPACING.md }}
            icon="build"
          >
            Create Custom Metric
          </Button>
        </ScrollView>
      </Modal>
    </Portal>
  );

  if (loading) {
    return (
      <PlaceholderScreen
        icon="speed"
        title="Loading Metrics"
        message="Fetching your performance data..."
      />
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <ScrollView
        style={{ flex: 1 }}
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
        {renderHeader()}
        {renderFilters()}
        
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {sortedMetrics.length > 0 ? (
            <>
              {sortedMetrics.map(renderMetricCard)}
              
              {/* Add More Metrics Card */}
              <TouchableOpacity
                onPress={() => setShowAddModal(true)}
                style={{
                  marginHorizontal: SPACING.md,
                  marginBottom: SPACING.md,
                }}
              >
                <Card
                  style={{
                    backgroundColor: COLORS.white,
                    elevation: 2,
                    borderRadius: 15,
                    borderStyle: 'dashed',
                    borderWidth: 2,
                    borderColor: COLORS.primary,
                  }}
                >
                  <Card.Content style={{ 
                    padding: SPACING.lg, 
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 100,
                  }}>
                    <Icon name="add-circle-outline" size={40} color={COLORS.primary} />
                    <Text style={[TEXT_STYLES.h4, { color: COLORS.primary, marginTop: SPACING.sm }]}>
                      Track New Metric
                    </Text>
                    <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary, textAlign: 'center', marginTop: 4 }]}>
                      Add more metrics to monitor your progress
                    </Text>
                  </Card.Content>
                </Card>
              </TouchableOpacity>
            </>
          ) : (
            <View style={{ padding: SPACING.xl, alignItems: 'center' }}>
              <Icon name="timeline" size={64} color={COLORS.textSecondary} />
              <Text style={[TEXT_STYLES.h3, { marginTop: SPACING.md, textAlign: 'center' }]}>
                No Metrics Found
              </Text>
              <Text style={[TEXT_STYLES.body, { marginTop: SPACING.sm, textAlign: 'center', color: COLORS.textSecondary }]}>
                {searchQuery ? 'Try adjusting your search or filters' : 'Start tracking your first performance metric!'}
              </Text>
              <Button
                mode="contained"
                onPress={() => setShowAddModal(true)}
                style={{ marginTop: SPACING.lg }}
                icon="add"
              >
                Add First Metric
              </Button>
            </View>
          )}
        </Animated.View>

        <View style={{ height: SPACING.xl }} />
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={{
          position: 'absolute',
          margin: SPACING.md,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.primary,
        }}
        onPress={() => setShowAddModal(true)}
      />

      {renderDetailModal()}
      {renderAddMetricModal()}
    </View>
  );
};

export default PerformanceMetricsScreen;