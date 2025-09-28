import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StatusBar,
  Alert,
  TouchableOpacity,
  Animated,
  Dimensions,
  FlatList,
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
  Divider,
  Menu,
  Portal,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your established constants
import { COLORS } from '../../../styles/colors';
import { SPACING } from '../../../styles/spacing';
import { TEXT_STYLES } from '../../../styles/textStyles';
import { TYPOGRAPHY } from '../../../styles/typography';
import { LAYOUT } from '../../../styles/layout';

const { width, height } = Dimensions.get('window');

const ProgressTracking = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { players, progressData, loading } = useSelector(state => state.progress);

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('overall');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [viewType, setViewType] = useState('overview'); // 'overview', 'detailed', 'comparison'
  const [showMenu, setShowMenu] = useState(false);
  const [sortBy, setSortBy] = useState('progress');

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const chartAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate screen entrance
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
      Animated.timing(chartAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]).start();

    loadProgressData();
  }, []);

  const loadProgressData = useCallback(async () => {
    try {
      // Dispatch actions to load progress data
      // dispatch(fetchProgressData({ timeframe: selectedTimeframe }));
      // dispatch(fetchPlayers());
    } catch (error) {
      console.error('Error loading progress data:', error);
    }
  }, [selectedTimeframe, dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProgressData();
    setRefreshing(false);
  }, [loadProgressData]);

  // Mock data for demonstration
  const mockTimeframes = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'Quarter' },
    { value: 'year', label: 'Year' },
  ];

  const mockMetrics = [
    { value: 'overall', label: 'Overall', icon: 'dashboard', color: COLORS.primary },
    { value: 'fitness', label: 'Fitness', icon: 'fitness-center', color: COLORS.success },
    { value: 'skills', label: 'Technical Skills', icon: 'sports-soccer', color: COLORS.warning },
    { value: 'tactical', label: 'Tactical', icon: 'psychology', color: COLORS.error },
    { value: 'mental', label: 'Mental', icon: 'psychology-alt', color: COLORS.info },
  ];

  const mockProgressData = [
    {
      id: 1,
      player: { id: 1, name: 'Alex Johnson', avatar: 'AJ', position: 'Forward' },
      overallProgress: 85,
      trend: 'up',
      trendValue: '+12%',
      lastUpdate: '2024-08-15',
      metrics: {
        overall: { current: 85, previous: 78, target: 90 },
        fitness: { current: 88, previous: 82, target: 92 },
        skills: { current: 82, previous: 79, target: 88 },
        tactical: { current: 80, previous: 75, target: 85 },
        mental: { current: 86, previous: 83, target: 90 },
      },
      recentActivities: [
        { date: '2024-08-15', type: 'training', value: 8.5, description: 'Sprint Training' },
        { date: '2024-08-14', type: 'skills', value: 7.8, description: 'Ball Control' },
        { date: '2024-08-13', type: 'fitness', value: 9.2, description: 'Endurance Test' },
      ],
      goals: [
        { id: 1, title: 'Sprint Speed', progress: 75, target: 'Sep 15' },
        { id: 2, title: 'Ball Control', progress: 60, target: 'Sep 20' },
      ],
    },
    {
      id: 2,
      player: { id: 2, name: 'Maria Santos', avatar: 'MS', position: 'Midfielder' },
      overallProgress: 78,
      trend: 'up',
      trendValue: '+8%',
      lastUpdate: '2024-08-15',
      metrics: {
        overall: { current: 78, previous: 72, target: 85 },
        fitness: { current: 82, previous: 78, target: 88 },
        skills: { current: 85, previous: 80, target: 90 },
        tactical: { current: 75, previous: 70, target: 82 },
        mental: { current: 72, previous: 68, target: 80 },
      },
      recentActivities: [
        { date: '2024-08-15', type: 'skills', value: 8.8, description: 'Passing Accuracy' },
        { date: '2024-08-14', type: 'tactical', value: 7.5, description: 'Position Play' },
        { date: '2024-08-13', type: 'mental', value: 8.0, description: 'Focus Training' },
      ],
      goals: [
        { id: 3, title: 'Passing Accuracy', progress: 90, target: 'Aug 25' },
        { id: 4, title: 'Position Awareness', progress: 45, target: 'Sep 10' },
      ],
    },
    {
      id: 3,
      player: { id: 3, name: 'David Chen', avatar: 'DC', position: 'Defender' },
      overallProgress: 72,
      trend: 'stable',
      trendValue: '+2%',
      lastUpdate: '2024-08-15',
      metrics: {
        overall: { current: 72, previous: 70, target: 80 },
        fitness: { current: 85, previous: 83, target: 90 },
        skills: { current: 68, previous: 65, target: 75 },
        tactical: { current: 88, previous: 85, target: 92 },
        mental: { current: 70, previous: 68, target: 78 },
      },
      recentActivities: [
        { date: '2024-08-15', type: 'tactical', value: 9.0, description: 'Defensive Positioning' },
        { date: '2024-08-14', type: 'fitness', value: 8.7, description: 'Strength Training' },
        { date: '2024-08-13', type: 'skills', value: 6.8, description: 'Ball Handling' },
      ],
      goals: [
        { id: 5, title: 'Defensive Positioning', progress: 85, target: 'Sep 01' },
        { id: 6, title: 'Ball Distribution', progress: 30, target: 'Oct 01' },
      ],
    },
  ];

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return 'trending-up';
      case 'down': return 'trending-down';
      case 'stable': return 'trending-flat';
      default: return 'trending-flat';
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return COLORS.success;
      case 'down': return COLORS.error;
      case 'stable': return COLORS.warning;
      default: return COLORS.textSecondary;
    }
  };

  const renderHeader = () => (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{
          borderRadius: 12,
          margin: SPACING.medium,
          overflow: 'hidden',
        }}
      >
        <Card style={{ backgroundColor: 'transparent', elevation: 0 }}>
          <Card.Content style={{ padding: SPACING.large }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.medium }}>
              <Text style={[TEXT_STYLES.heading, { color: 'white' }]}>
                Progress Tracking 📈
              </Text>
              <View style={{ flexDirection: 'row' }}>
                <Portal>
                  <Menu
                    visible={showMenu}
                    onDismiss={() => setShowMenu(false)}
                    anchor={
                      <IconButton
                        icon="dots-vertical"
                        iconColor="white"
                        size={24}
                        onPress={() => setShowMenu(true)}
                      />
                    }
                  >
                    <Menu.Item
                      onPress={() => {
                        setShowMenu(false);
                        navigation.navigate('ProgressReports');
                      }}
                      title="Generate Report"
                      leadingIcon="file-document"
                    />
                    <Menu.Item
                      onPress={() => {
                        setShowMenu(false);
                        navigation.navigate('ExportData');
                      }}
                      title="Export Data"
                      leadingIcon="download"
                    />
                    <Menu.Item
                      onPress={() => {
                        setShowMenu(false);
                        Alert.alert('Settings', 'Progress tracking settings');
                      }}
                      title="Settings"
                      leadingIcon="settings"
                    />
                  </Menu>
                </Portal>
              </View>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>Tracking Players</Text>
                <Text style={[TEXT_STYLES.title, { color: 'white', fontWeight: 'bold' }]}>24</Text>
              </View>

              <View style={{ alignItems: 'center' }}>
                <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>Avg Progress</Text>
                <Text style={[TEXT_STYLES.title, { color: 'white', fontWeight: 'bold' }]}>78%</Text>
              </View>

              <View style={{ alignItems: 'center' }}>
                <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>Improving</Text>
                <Text style={[TEXT_STYLES.title, { color: COLORS.success, fontWeight: 'bold' }]}>18</Text>
              </View>

              <View style={{ alignItems: 'center' }}>
                <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>Goals Met</Text>
                <Text style={[TEXT_STYLES.title, { color: 'white', fontWeight: 'bold' }]}>85%</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </LinearGradient>
    </Animated.View>
  );

  const renderFilters = () => (
    <View style={{ paddingHorizontal: SPACING.medium, marginBottom: SPACING.medium }}>
      <Searchbar
        placeholder="Search players..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={{ marginBottom: SPACING.medium, elevation: 2 }}
        iconColor={COLORS.primary}
      />

      {/* Timeframe Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.small }}>
        <View style={{ flexDirection: 'row' }}>
          {mockTimeframes.map((timeframe) => (
            <Chip
              key={timeframe.value}
              mode={selectedTimeframe === timeframe.value ? 'flat' : 'outlined'}
              selected={selectedTimeframe === timeframe.value}
              onPress={() => setSelectedTimeframe(timeframe.value)}
              style={{
                marginRight: SPACING.small,
                backgroundColor: selectedTimeframe === timeframe.value ? COLORS.primary : 'transparent',
              }}
              textStyle={{
                color: selectedTimeframe === timeframe.value ? 'white' : COLORS.primary,
              }}
            >
              {timeframe.label}
            </Chip>
          ))}
        </View>
      </ScrollView>

      {/* Metric Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row' }}>
          {mockMetrics.map((metric) => (
            <TouchableOpacity
              key={metric.value}
              onPress={() => setSelectedMetric(metric.value)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: SPACING.medium,
                paddingVertical: SPACING.small,
                marginRight: SPACING.small,
                borderRadius: 20,
                backgroundColor: selectedMetric === metric.value ? metric.color : COLORS.background,
                borderWidth: 1,
                borderColor: selectedMetric === metric.value ? metric.color : COLORS.border,
              }}
            >
              <Icon
                name={metric.icon}
                size={16}
                color={selectedMetric === metric.value ? 'white' : metric.color}
                style={{ marginRight: SPACING.xsmall }}
              />
              <Text
                style={[
                  TEXT_STYLES.caption,
                  { color: selectedMetric === metric.value ? 'white' : metric.color }
                ]}
              >
                {metric.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const renderMetricChart = (playerData) => {
    const selectedMetricData = playerData.metrics[selectedMetric];
    const progress = selectedMetricData.current / selectedMetricData.target;
    const improvement = selectedMetricData.current - selectedMetricData.previous;
    const improvementPercent = ((improvement / selectedMetricData.previous) * 100).toFixed(1);

    return (
      <View style={{ marginVertical: SPACING.medium }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.small }}>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
            {mockMetrics.find(m => m.value === selectedMetric)?.label}
          </Text>
          <Text style={[TEXT_STYLES.caption, { color: improvement >= 0 ? COLORS.success : COLORS.error }]}>
            {improvement >= 0 ? '+' : ''}{improvementPercent}%
          </Text>
        </View>

        <ProgressBar
          progress={progress}
          color={progress >= 0.8 ? COLORS.success : progress >= 0.6 ? COLORS.warning : COLORS.primary}
          style={{ height: 8, borderRadius: 4, marginBottom: SPACING.xsmall }}
        />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
            Current: {selectedMetricData.current}
          </Text>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
            Target: {selectedMetricData.target}
          </Text>
        </View>
      </View>
    );
  };

  const renderProgressCard = (progressData) => (
    <Animated.View style={{ opacity: chartAnim }}>
      <TouchableOpacity
        onPress={() => navigation.navigate('PlayerProgressDetail', { playerId: progressData.player.id })}
        activeOpacity={0.9}
      >
        <Card style={{ margin: SPACING.medium, marginBottom: SPACING.medium, elevation: 4 }}>
          <Card.Content style={{ padding: SPACING.medium }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.medium }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Avatar.Text
                  size={48}
                  label={progressData.player.avatar}
                  style={{ backgroundColor: COLORS.primary, marginRight: SPACING.medium }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[TEXT_STYLES.subheading, { fontWeight: '600' }]}>
                    {progressData.player.name}
                  </Text>
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                    {progressData.player.position}
                  </Text>
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, fontSize: 10 }]}>
                    Last updated: {new Date(progressData.lastUpdate).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              <View style={{ alignItems: 'flex-end' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xsmall }}>
                  <Icon
                    name={getTrendIcon(progressData.trend)}
                    size={18}
                    color={getTrendColor(progressData.trend)}
                    style={{ marginRight: SPACING.xsmall }}
                  />
                  <Text style={[TEXT_STYLES.body, { color: getTrendColor(progressData.trend), fontWeight: '600' }]}>
                    {progressData.trendValue}
                  </Text>
                </View>
                <Text style={[TEXT_STYLES.title, { fontWeight: 'bold', color: COLORS.primary }]}>
                  {progressData.overallProgress}%
                </Text>
              </View>
            </View>

            {/* Overall Progress */}
            <View style={{ marginBottom: SPACING.medium }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xsmall }}>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Overall Progress</Text>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.primary, fontWeight: '600' }]}>
                  {progressData.overallProgress}%
                </Text>
              </View>
              <ProgressBar
                progress={progressData.overallProgress / 100}
                color={progressData.overallProgress >= 80 ? COLORS.success : progressData.overallProgress >= 60 ? COLORS.warning : COLORS.primary}
                style={{ height: 6, borderRadius: 3 }}
              />
            </View>

            {/* Metric Breakdown */}
            <View style={{ marginBottom: SPACING.medium }}>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginBottom: SPACING.small }]}>
                Performance Metrics
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                {mockMetrics.slice(1, 5).map((metric) => {
                  const metricData = progressData.metrics[metric.value];
                  const progress = (metricData.current / metricData.target) * 100;
                  return (
                    <View key={metric.value} style={{ alignItems: 'center', flex: 1 }}>
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor: `${metric.color}20`,
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginBottom: SPACING.xsmall,
                        }}
                      >
                        <Icon name={metric.icon} size={20} color={metric.color} />
                      </View>
                      <Text style={[TEXT_STYLES.caption, { color: metric.color, fontWeight: '600', fontSize: 12 }]}>
                        {Math.round(progress)}%
                      </Text>
                      <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, fontSize: 10 }]}>
                        {metric.label.split(' ')[0]}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Selected Metric Detail */}
            {renderMetricChart(progressData)}

            {/* Recent Activities */}
            <View style={{ marginBottom: SPACING.medium }}>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginBottom: SPACING.small }]}>
                Recent Activities (Last 3 days)
              </Text>
              {progressData.recentActivities.slice(0, 2).map((activity, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingVertical: SPACING.xsmall,
                    borderBottomWidth: index < 1 ? 1 : 0,
                    borderBottomColor: COLORS.border,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[TEXT_STYLES.caption, { fontWeight: '500' }]}>{activity.description}</Text>
                    <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, fontSize: 10 }]}>
                      {new Date(activity.date).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.success, fontWeight: '600' }]}>
                    {activity.value}/10
                  </Text>
                </View>
              ))}
            </View>

            {/* Active Goals */}
            <View>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginBottom: SPACING.small }]}>
                Active Goals ({progressData.goals.length})
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {progressData.goals.map((goal) => (
                  <View
                    key={goal.id}
                    style={{
                      backgroundColor: `${COLORS.primary}10`,
                      paddingHorizontal: SPACING.small,
                      paddingVertical: 4,
                      borderRadius: 12,
                      marginRight: SPACING.xsmall,
                      marginBottom: SPACING.xsmall,
                      borderWidth: 1,
                      borderColor: `${COLORS.primary}30`,
                    }}
                  >
                    <Text style={[TEXT_STYLES.caption, { color: COLORS.primary, fontSize: 10 }]}>
                      {goal.title} ({goal.progress}%)
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Footer Actions */}
            <Divider style={{ marginVertical: SPACING.medium }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Button
                mode="text"
                onPress={() => navigation.navigate('PlayerProgressDetail', { playerId: progressData.player.id })}
                labelStyle={{ color: COLORS.primary }}
                icon="analytics"
              >
                View Details
              </Button>
              <Button
                mode="text"
                onPress={() => navigation.navigate('AddProgressEntry', { playerId: progressData.player.id })}
                labelStyle={{ color: COLORS.success }}
                icon="add-circle"
              >
                Add Entry
              </Button>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderProgressList = () => {
    const filteredData = mockProgressData.filter(data =>
      data.player.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const sortedData = [...filteredData].sort((a, b) => {
      switch (sortBy) {
        case 'progress':
          return b.overallProgress - a.overallProgress;
        case 'name':
          return a.player.name.localeCompare(b.player.name);
        case 'improvement':
          return parseFloat(b.trendValue) - parseFloat(a.trendValue);
        default:
          return 0;
      }
    });

    return (
      <FlatList
        data={sortedData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => renderProgressCard(item)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        nestedScrollEnabled={false}
      />
    );
  };

  const renderQuickActions = () => (
    <View style={{ 
      flexDirection: 'row', 
      paddingHorizontal: SPACING.medium, 
      paddingBottom: SPACING.large,
      justifyContent: 'space-between'
    }}>
      <Button
        mode="outlined"
        onPress={() => navigation.navigate('TeamProgressSummary')}
        style={{ flex: 1, marginRight: SPACING.small }}
        icon="group"
      >
        Team Summary
      </Button>

      <Button
        mode="contained"
        onPress={() => navigation.navigate('ProgressComparison')}
        style={{ flex: 1, marginLeft: SPACING.small, backgroundColor: COLORS.primary }}
        icon="compare"
      >
        Compare Players
      </Button>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            progressBackgroundColor={COLORS.background}
          />
        }
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        {renderHeader()}
        {renderFilters()}
        {renderProgressList()}
        {renderQuickActions()}
      </ScrollView>

      <FAB
        icon="add"
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.primary,
        }}
        onPress={() => {
          Alert.alert(
            'Quick Actions',
            'Choose an action',
            [
              { text: 'Add Progress Entry', onPress: () => navigation.navigate('AddProgressEntry') },
              { text: 'Bulk Update', onPress: () => navigation.navigate('BulkProgressUpdate') },
              { text: 'Schedule Assessment', onPress: () => navigation.navigate('ScheduleAssessment') },
              { text: 'Generate Report', onPress: () => navigation.navigate('ProgressReports') },
              { text: 'Cancel', style: 'cancel' },
            ]
          );
        }}
      />
    </View>
  );
};

// Screen configuration for navigation
ProgressTracking.navigationOptions = {
  title: 'Progress Tracking',
  headerShown: true,
  headerStyle: {
    backgroundColor: COLORS.primary,
  },
  headerTintColor: 'white',
  headerTitleStyle: {
    fontWeight: 'bold',
  },
};

export default ProgressTracking;