import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StatusBar,
  Alert,
  TouchableOpacity,
  Dimensions,
  Animated,
  Vibration,
  Platform,
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Searchbar,
  ProgressBar,
  Portal,
  Modal,
  Divider,
  SegmentedButtons,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
// Note: For production, install react-native-chart-kit or react-native-svg-charts
// For now, we'll create custom chart components using React Native primitives

// Design System Constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4ade80',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  background: '#f8fafc',
  surface: '#ffffff',
  text: '#1e293b',
  textSecondary: '#64748b',
  border: '#e2e8f0',
  chart1: '#667eea',
  chart2: '#4ade80',
  chart3: '#f59e0b',
  chart4: '#ef4444',
  chart5: '#8b5cf6',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 22, fontWeight: 'bold', color: COLORS.text },
  h3: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textSecondary },
  small: { fontSize: 12, color: COLORS.textSecondary },
};

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const chartWidth = screenWidth - (SPACING.md * 2);

const PerformanceAnalytics = ({ navigation }) => {
  // State Management
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [selectedMetric, setSelectedMetric] = useState('overall');
  const [selectedPlayer, setSelectedPlayer] = useState('all');
  const [analyticsData, setAnalyticsData] = useState({});
  const [playersData, setPlayersData] = useState([]);
  const [trendsData, setTrendsData] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [animatedValue] = useState(new Animated.Value(0));

  // Redux
  const dispatch = useDispatch();
  const { user, teams, players } = useSelector(state => ({
    user: state.auth.user,
    teams: state.teams.teams || [],
    players: state.players.players || [],
  }));

  // Configuration
  const timeframeOptions = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: '3 Months' },
    { value: 'year', label: 'This Year' },
  ];

  const metricOptions = [
    { key: 'overall', label: 'Overall', icon: 'analytics' },
    { key: 'physical', label: 'Physical', icon: 'fitness-center' },
    { key: 'technical', label: 'Technical', icon: 'sports-soccer' },
    { key: 'tactical', label: 'Tactical', icon: 'psychology' },
    { key: 'attendance', label: 'Attendance', icon: 'event-available' },
  ];

  // Animation Setup
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  // Data Fetching
  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedTimeframe, selectedMetric, selectedPlayer]);

  const fetchAnalyticsData = useCallback(async () => {
    try {
      // Simulate API call - replace with actual API integration
      const mockAnalyticsData = {
        summary: {
          totalSessions: 24,
          averageAttendance: 87,
          improvementRate: 12,
          topPerformer: 'Alex Johnson',
          totalPlayers: 15,
          activeGoals: 8,
        },
        trends: [
          { period: 'Week 1', overall: 75, physical: 80, technical: 70, tactical: 72, attendance: 85 },
          { period: 'Week 2', overall: 78, physical: 82, technical: 75, tactical: 76, attendance: 88 },
          { period: 'Week 3', overall: 82, physical: 85, technical: 78, tactical: 80, attendance: 90 },
          { period: 'Week 4', overall: 85, physical: 87, technical: 82, tactical: 84, attendance: 92 },
        ],
        playerPerformance: [
          {
            id: 'p1',
            name: 'Alex Johnson',
            avatar: 'https://via.placeholder.com/40',
            overall: 92,
            physical: 90,
            technical: 94,
            tactical: 88,
            attendance: 95,
            improvement: 8,
            position: 'Forward',
          },
          {
            id: 'p2',
            name: 'Sarah Smith',
            avatar: 'https://via.placeholder.com/40',
            overall: 88,
            physical: 85,
            technical: 92,
            tactical: 86,
            attendance: 92,
            improvement: 12,
            position: 'Midfielder',
          },
          {
            id: 'p3',
            name: 'Mike Wilson',
            avatar: 'https://via.placeholder.com/40',
            overall: 84,
            physical: 88,
            technical: 78,
            tactical: 86,
            attendance: 88,
            improvement: 5,
            position: 'Defender',
          },
        ],
        metricDistribution: [
          { name: 'Excellent (90-100)', value: 25, color: COLORS.success },
          { name: 'Good (80-89)', value: 40, color: COLORS.chart1 },
          { name: 'Average (70-79)', value: 25, color: COLORS.warning },
          { name: 'Needs Improvement', value: 10, color: COLORS.error },
        ],
        goalProgress: [
          { goal: 'Improve Speed', current: 75, target: 100, players: 8 },
          { goal: 'Ball Control', current: 82, target: 90, players: 12 },
          { goal: 'Team Coordination', current: 68, target: 85, players: 15 },
          { goal: 'Endurance', current: 78, target: 90, players: 10 },
        ],
      };

      setAnalyticsData(mockAnalyticsData);
      setPlayersData(mockAnalyticsData.playerPerformance);
      setTrendsData(mockAnalyticsData.trends);
      setComparisonData(mockAnalyticsData.metricDistribution);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      Alert.alert('Error', 'Failed to load performance analytics');
    }
  }, [selectedTimeframe, selectedMetric, selectedPlayer]);

  // Event Handlers
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAnalyticsData();
    setRefreshing(false);
  }, [fetchAnalyticsData]);

  const handlePlayerSelect = useCallback((playerId) => {
    setSelectedPlayer(playerId);
    Vibration.vibrate(25);
  }, []);

  const handleExportData = useCallback((format) => {
    Alert.alert(
      'Export Started',
      `Generating ${format.toUpperCase()} report with performance data...`,
      [{ text: 'OK' }]
    );
    setExportModalVisible(false);
    Vibration.vibrate(50);
  }, []);

  const getPerformanceColor = (score) => {
    if (score >= 90) return COLORS.success;
    if (score >= 80) return COLORS.chart1;
    if (score >= 70) return COLORS.warning;
    return COLORS.error;
  };

  const getImprovementIcon = (improvement) => {
    if (improvement > 10) return 'trending-up';
    if (improvement > 0) return 'trending-flat';
    return 'trending-down';
  };

  const getImprovementColor = (improvement) => {
    if (improvement > 10) return COLORS.success;
    if (improvement > 0) return COLORS.warning;
    return COLORS.error;
  };

  // Filtered data based on selections
  const filteredData = useMemo(() => {
    if (selectedPlayer === 'all') return analyticsData;
    
    const player = playersData.find(p => p.id === selectedPlayer);
    if (!player) return analyticsData;

    return {
      ...analyticsData,
      selectedPlayerData: player,
    };
  }, [analyticsData, playersData, selectedPlayer]);

  // Render Components
  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={{
        paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 10,
        paddingBottom: SPACING.lg,
        paddingHorizontal: SPACING.md,
      }}
    >
      <Animated.View
        style={{
          opacity: animatedValue,
          transform: [{
            translateY: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            }),
          }],
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
          <IconButton
            icon="arrow-back"
            iconColor="white"
            size={24}
            onPress={() => navigation.goBack()}
          />
          <Text style={[TEXT_STYLES.h2, { color: 'white', flex: 1, marginLeft: SPACING.sm }]}>
            📊 Performance Analytics
          </Text>
          <IconButton
            icon="filter-list"
            iconColor="white"
            size={24}
            onPress={() => setFilterModalVisible(true)}
          />
        </View>

        {/* Quick Stats */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.md }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>
              {analyticsData.summary?.totalSessions || 0}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
              Sessions
            </Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>
              {analyticsData.summary?.averageAttendance || 0}%
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
              Avg Performance
            </Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>
              +{analyticsData.summary?.improvementRate || 0}%
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
              Improvement
            </Text>
          </View>
        </View>

        {/* Timeframe Selector */}
        <SegmentedButtons
          value={selectedTimeframe}
          onValueChange={setSelectedTimeframe}
          buttons={timeframeOptions}
          style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
          theme={{ colors: { secondaryContainer: 'rgba(255,255,255,0.3)' } }}
        />
      </Animated.View>
    </LinearGradient>
  );

  const renderMetricFilters = () => (
    <View style={{ paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {metricOptions.map(metric => (
          <TouchableOpacity
            key={metric.key}
            onPress={() => setSelectedMetric(metric.key)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: SPACING.md,
              paddingVertical: SPACING.sm,
              marginRight: SPACING.sm,
              borderRadius: 20,
              backgroundColor: selectedMetric === metric.key ? COLORS.primary : COLORS.surface,
              borderWidth: 1,
              borderColor: selectedMetric === metric.key ? COLORS.primary : COLORS.border,
              elevation: selectedMetric === metric.key ? 2 : 0,
            }}
          >
            <MaterialIcons
              name={metric.icon}
              size={16}
              color={selectedMetric === metric.key ? 'white' : COLORS.textSecondary}
            />
            <Text style={{
              marginLeft: SPACING.xs,
              color: selectedMetric === metric.key ? 'white' : COLORS.text,
              fontWeight: selectedMetric === metric.key ? 'bold' : 'normal',
            }}>
              {metric.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderPerformanceTrends = () => (
    <Card style={{ margin: SPACING.md, elevation: 2 }}>
      <Card.Content>
        <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
          📈 Performance Trends
        </Text>
        
        {/* Custom Line Chart using React Native components */}
        <View style={{ 
          height: 200, 
          marginBottom: SPACING.md,
          backgroundColor: COLORS.background,
          borderRadius: 12,
          padding: SPACING.md,
          justifyContent: 'space-between'
        }}>
          {/* Y-axis labels */}
          <View style={{ position: 'absolute', left: 0, height: '100%', justifyContent: 'space-between', paddingVertical: SPACING.md }}>
            <Text style={TEXT_STYLES.small}>100</Text>
            <Text style={TEXT_STYLES.small}>80</Text>
            <Text style={TEXT_STYLES.small}>60</Text>
            <Text style={TEXT_STYLES.small}>40</Text>
            <Text style={TEXT_STYLES.small}>20</Text>
            <Text style={TEXT_STYLES.small}>0</Text>
          </View>
          
          {/* Chart area */}
          <View style={{ flex: 1, marginLeft: 30, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around' }}>
            {trendsData.map((item, index) => {
              const height = (item[selectedMetric === 'overall' ? 'overall' : selectedMetric] / 100) * 150;
              return (
                <View key={index} style={{ alignItems: 'center', flex: 1 }}>
                  <View style={{
                    width: 20,
                    height: height,
                    backgroundColor: COLORS.primary,
                    borderRadius: 4,
                    marginBottom: SPACING.xs,
                  }} />
                  <Text style={[TEXT_STYLES.small, { fontSize: 10, textAlign: 'center' }]}>
                    {item.period.split(' ')[1]}
                  </Text>
                  <Text style={[TEXT_STYLES.small, { fontSize: 10, color: COLORS.primary, fontWeight: 'bold' }]}>
                    {item[selectedMetric === 'overall' ? 'overall' : selectedMetric]}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
          <View style={{ alignItems: 'center' }}>
            <MaterialIcons name="trending-up" size={20} color={COLORS.success} />
            <Text style={TEXT_STYLES.caption}>Improving</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>
              {trendsData.length > 0 ? trendsData[trendsData.length - 1]?.overall : 0}
            </Text>
            <Text style={TEXT_STYLES.caption}>Current Avg</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <MaterialIcons name="speed" size={20} color={COLORS.warning} />
            <Text style={TEXT_STYLES.caption}>Peak: 92</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderPlayerRankings = () => (
    <Card style={{ margin: SPACING.md, elevation: 2 }}>
      <Card.Content>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md }}>
          <Text style={TEXT_STYLES.h3}>
            🏆 Player Rankings
          </Text>
          <Chip mode="outlined" style={{ height: 28 }}>
            Top {playersData.length}
          </Chip>
        </View>

        {playersData
          .sort((a, b) => b[selectedMetric] - a[selectedMetric])
          .slice(0, 10)
          .map((player, index) => (
          <Surface
            key={player.id}
            style={{
              padding: SPACING.md,
              marginBottom: SPACING.sm,
              borderRadius: 12,
              elevation: 1,
              backgroundColor: selectedPlayer === player.id ? COLORS.primary + '20' : COLORS.surface,
            }}
          >
            <TouchableOpacity
              onPress={() => handlePlayerSelect(player.id)}
              style={{ flexDirection: 'row', alignItems: 'center' }}
            >
              <View style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: index < 3 ? COLORS.warning : COLORS.textSecondary,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: SPACING.md,
              }}>
                <Text style={[TEXT_STYLES.small, { color: 'white', fontWeight: 'bold' }]}>
                  {index + 1}
                </Text>
              </View>

              <Avatar.Image
                size={40}
                source={{ uri: player.avatar }}
                style={{ marginRight: SPACING.md }}
              />

              <View style={{ flex: 1 }}>
                <Text style={TEXT_STYLES.body}>{player.name}</Text>
                <Text style={TEXT_STYLES.caption}>{player.position}</Text>
              </View>

              <View style={{ alignItems: 'flex-end' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs }}>
                  <Text style={[TEXT_STYLES.h3, { color: getPerformanceColor(player[selectedMetric]) }]}>
                    {player[selectedMetric]}
                  </Text>
                  <MaterialIcons
                    name={getImprovementIcon(player.improvement)}
                    size={16}
                    color={getImprovementColor(player.improvement)}
                    style={{ marginLeft: SPACING.xs }}
                  />
                </View>
                <ProgressBar
                  progress={player[selectedMetric] / 100}
                  color={getPerformanceColor(player[selectedMetric])}
                  style={{ width: 60 }}
                />
              </View>
            </TouchableOpacity>
          </Surface>
        ))}
      </Card.Content>
    </Card>
  );

  const renderPerformanceDistribution = () => (
    <Card style={{ margin: SPACING.md, elevation: 2 }}>
      <Card.Content>
        <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
          📊 Performance Distribution
        </Text>
        
        {/* Custom Pie Chart using React Native components */}
        <View style={{ alignItems: 'center', marginBottom: SPACING.md }}>
          <View style={{
            width: 200,
            height: 200,
            borderRadius: 100,
            backgroundColor: COLORS.background,
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
          }}>
            {/* Pie segments using positioned views */}
            {comparisonData.map((item, index) => {
              const total = comparisonData.reduce((sum, d) => sum + d.value, 0);
              const percentage = (item.value / total) * 100;
              return (
                <View
                  key={index}
                  style={{
                    position: 'absolute',
                    width: 80,
                    height: 20,
                    backgroundColor: item.color,
                    borderRadius: 10,
                    top: 50 + (index * 30),
                    right: 20,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={[TEXT_STYLES.small, { color: 'white', fontWeight: 'bold' }]}>
                    {percentage.toFixed(0)}%
                  </Text>
                </View>
              );
            })}
            
            {/* Center circle with total */}
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: COLORS.primary,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>
                {comparisonData.reduce((sum, d) => sum + d.value, 0)}
              </Text>
              <Text style={[TEXT_STYLES.small, { color: 'rgba(255,255,255,0.8)' }]}>
                Players
              </Text>
            </View>
          </View>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {comparisonData.map((item, index) => (
            <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs, width: '48%' }}>
              <View style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: item.color,
                marginRight: SPACING.xs,
              }} />
              <Text style={[TEXT_STYLES.small, { flex: 1 }]} numberOfLines={1}>
                {item.name}
              </Text>
            </View>
          ))}
        </View>
      </Card.Content>
    </Card>
  );

  const renderGoalProgress = () => (
    <Card style={{ margin: SPACING.md, elevation: 2 }}>
      <Card.Content>
        <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
          🎯 Goal Progress
        </Text>

        {analyticsData.goalProgress?.map((goal, index) => (
          <Surface
            key={index}
            style={{
              padding: SPACING.md,
              marginBottom: SPACING.sm,
              borderRadius: 12,
              elevation: 1,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm }}>
              <Text style={TEXT_STYLES.body}>{goal.goal}</Text>
              <Chip mode="outlined" style={{ height: 24 }}>
                {goal.players} players
              </Chip>
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs }}>
              <Text style={TEXT_STYLES.caption}>{goal.current}% / {goal.target}%</Text>
              <View style={{ flex: 1, marginLeft: SPACING.md }}>
                <ProgressBar
                  progress={goal.current / goal.target}
                  color={goal.current >= goal.target ? COLORS.success : COLORS.primary}
                />
              </View>
            </View>
            
            <Text style={[TEXT_STYLES.small, { color: goal.current >= goal.target ? COLORS.success : COLORS.textSecondary }]}>
              {goal.current >= goal.target ? '🎉 Goal Achieved!' : `${goal.target - goal.current}% to goal`}
            </Text>
          </Surface>
        ))}
      </Card.Content>
    </Card>
  );

  const renderFilterModal = () => (
    <Portal>
      <Modal
        visible={filterModalVisible}
        onDismiss={() => setFilterModalVisible(false)}
        contentContainerStyle={{
          backgroundColor: 'white',
          margin: SPACING.lg,
          borderRadius: 20,
          padding: SPACING.lg,
          maxHeight: screenHeight * 0.7,
        }}
      >
        <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md, textAlign: 'center' }]}>
          🔍 Analytics Filters
        </Text>
        
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.sm }]}>Select Player:</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.lg }}>
            <TouchableOpacity
              onPress={() => setSelectedPlayer('all')}
              style={{
                paddingHorizontal: SPACING.md,
                paddingVertical: SPACING.sm,
                marginRight: SPACING.sm,
                marginBottom: SPACING.sm,
                borderRadius: 20,
                backgroundColor: selectedPlayer === 'all' ? COLORS.primary : COLORS.background,
                borderWidth: 1,
                borderColor: selectedPlayer === 'all' ? COLORS.primary : COLORS.border,
              }}
            >
              <Text style={{
                color: selectedPlayer === 'all' ? 'white' : COLORS.text,
              }}>
                All Players
              </Text>
            </TouchableOpacity>
            
            {playersData.map(player => (
              <TouchableOpacity
                key={player.id}
                onPress={() => setSelectedPlayer(player.id)}
                style={{
                  paddingHorizontal: SPACING.md,
                  paddingVertical: SPACING.sm,
                  marginRight: SPACING.sm,
                  marginBottom: SPACING.sm,
                  borderRadius: 20,
                  backgroundColor: selectedPlayer === player.id ? COLORS.primary : COLORS.background,
                  borderWidth: 1,
                  borderColor: selectedPlayer === player.id ? COLORS.primary : COLORS.border,
                }}
              >
                <Text style={{
                  color: selectedPlayer === player.id ? 'white' : COLORS.text,
                }}>
                  {player.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        
        <Button
          mode="contained"
          onPress={() => setFilterModalVisible(false)}
          style={{ marginTop: SPACING.md }}
        >
          Apply Filters
        </Button>
      </Modal>
    </Portal>
  );

  const renderExportModal = () => (
    <Portal>
      <Modal
        visible={exportModalVisible}
        onDismiss={() => setExportModalVisible(false)}
        contentContainerStyle={{
          backgroundColor: 'white',
          margin: SPACING.lg,
          borderRadius: 20,
          padding: SPACING.lg,
        }}
      >
        <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md, textAlign: 'center' }]}>
          📤 Export Analytics
        </Text>
        
        <Text style={[TEXT_STYLES.caption, { textAlign: 'center', marginBottom: SPACING.lg }]}>
          Choose format to export performance data
        </Text>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
          <Button
            mode="contained"
            buttonColor={COLORS.success}
            onPress={() => handleExportData('pdf')}
            style={{ minWidth: 80 }}
          >
            PDF
          </Button>
          <Button
            mode="contained"
            buttonColor={COLORS.info}
            onPress={() => handleExportData('excel')}
            style={{ minWidth: 80 }}
          >
            Excel
          </Button>
          <Button
            mode="contained"
            buttonColor={COLORS.warning}
            onPress={() => handleExportData('csv')}
            style={{ minWidth: 80 }}
          >
            CSV
          </Button>
        </View>
      </Modal>
    </Portal>
  );

  const renderFloatingActions = () => (
    <>
      <FAB
        icon="share"
        style={{
          position: 'absolute',
          right: SPACING.md,
          bottom: 100,
          backgroundColor: COLORS.info,
        }}
        onPress={() => setExportModalVisible(true)}
      />
      <FAB
        icon="add-chart"
        style={{
          position: 'absolute',
          right: SPACING.md,
          bottom: SPACING.md,
          backgroundColor: COLORS.secondary,
        }}
        onPress={() => {
          Alert.alert(
            'Feature Development',
            'Create custom performance reports and advanced analytics dashboards. Coming soon!',
            [{ text: 'Got it! 👍', style: 'default' }]
          );
        }}
      />
    </>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {renderHeader()}
      {renderMetricFilters()}
      
      <ScrollView
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
        {renderPerformanceTrends()}
        {renderPlayerRankings()}
        {renderPerformanceDistribution()}
        {renderGoalProgress()}
        
        <View style={{ height: 120 }} />
      </ScrollView>

      {renderFilterModal()}
      {renderExportModal()}
      {renderFloatingActions()}
    </View>
  );
};

export default PerformanceAnalytics;