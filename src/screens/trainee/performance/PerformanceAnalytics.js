import React, { useState, useEffect, useCallback } from 'react';
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
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

// Design System Imports
import { COLORS, SPACING, TEXT_STYLES } from '../styles/designSystem';
import PlaceholderScreen from '../components/PlaceholderScreen';

const { width, height } = Dimensions.get('window');

const PerformanceAnalyticsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, performanceData, loading } = useSelector(state => state.performance);
  
  const [refreshing, setRefreshing] = useState(false);
  const [timeFilter, setTimeFilter] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

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

  // Mock analytics data - replace with actual data from Redux store
  const mockAnalyticsData = {
    overview: {
      totalWorkouts: 47,
      totalHours: 68.5,
      avgIntensity: 7.2,
      caloriesBurned: 12450,
      weeklyChange: '+12%',
      monthlyStreak: 18,
      personalBests: 8,
      completionRate: 89,
    },
    strengthProgress: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [{
        data: [45, 52, 58, 65],
        color: () => COLORS.primary,
      }],
    },
    enduranceProgress: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [{
        data: [20, 25, 32, 38],
        color: () => COLORS.success,
      }],
    },
    workoutDistribution: [
      { name: 'Strength', population: 40, color: COLORS.primary, legendFontColor: COLORS.text },
      { name: 'Cardio', population: 30, color: COLORS.success, legendFontColor: COLORS.text },
      { name: 'Flexibility', population: 20, color: '#FF9800', legendFontColor: COLORS.text },
      { name: 'Sports', population: 10, color: '#9C27B0', legendFontColor: COLORS.text },
    ],
    weeklyActivity: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        data: [3, 2, 4, 1, 3, 2, 1],
        color: () => COLORS.primary,
      }],
    },
    achievements: [
      {
        id: 1,
        title: 'Strength Master',
        description: 'Increased max bench press by 20kg',
        date: '2024-08-20',
        category: 'strength',
        icon: 'fitness-center',
        value: '85kg',
      },
      {
        id: 2,
        title: 'Endurance Beast',
        description: 'Ran 10K under 50 minutes',
        date: '2024-08-18',
        category: 'endurance',
        icon: 'directions-run',
        value: '48:32',
      },
      {
        id: 3,
        title: 'Consistency King',
        description: '30-day workout streak',
        date: '2024-08-15',
        category: 'consistency',
        icon: 'local-fire-department',
        value: '30 days',
      },
    ],
    improvements: [
      {
        metric: 'Squat 1RM',
        previous: '70kg',
        current: '85kg',
        change: '+15kg',
        percentage: '+21.4%',
        trend: 'up',
      },
      {
        metric: '5K Time',
        previous: '28:45',
        current: '26:12',
        change: '-2:33',
        percentage: '-8.9%',
        trend: 'up',
      },
      {
        metric: 'Body Fat %',
        previous: '18.5%',
        current: '16.2%',
        change: '-2.3%',
        percentage: '-12.4%',
        trend: 'up',
      },
      {
        metric: 'Sleep Quality',
        previous: '6.8/10',
        current: '8.2/10',
        change: '+1.4',
        percentage: '+20.6%',
        trend: 'up',
      },
    ],
  };

  const timeFilters = [
    { key: 'week', label: 'This Week', icon: 'calendar-view-week' },
    { key: 'month', label: 'This Month', icon: 'calendar-view-month' },
    { key: '3months', label: '3 Months', icon: 'date-range' },
    { key: 'year', label: 'This Year', icon: 'calendar-today' },
  ];

  const chartConfig = {
    backgroundColor: COLORS.white,
    backgroundGradientFrom: COLORS.white,
    backgroundGradientTo: COLORS.white,
    color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.7,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    propsForLabels: {
      fontSize: 12,
      fontFamily: 'System',
    },
  };

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
          Performance Analytics 📊
        </Text>
        <IconButton
          icon="share"
          iconColor={COLORS.white}
          size={24}
          onPress={() => Alert.alert('Share', 'Share your progress with friends!')}
        />
      </View>

      <Searchbar
        placeholder="Search metrics, achievements..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={{
          backgroundColor: 'rgba(255,255,255,0.9)',
          marginBottom: SPACING.md,
        }}
        inputStyle={{ fontSize: 14 }}
      />

      {/* Quick Stats Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: SPACING.md }}
      >
        <Card style={{ backgroundColor: 'rgba(255,255,255,0.15)', marginRight: SPACING.sm, width: 120 }}>
          <Card.Content style={{ padding: SPACING.sm, alignItems: 'center' }}>
            <Icon name="fitness-center" size={24} color={COLORS.white} />
            <Text style={[TEXT_STYLES.h2, { color: COLORS.white, marginTop: 4 }]}>
              {mockAnalyticsData.overview.totalWorkouts}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.white, opacity: 0.8 }]}>
              Workouts
            </Text>
          </Card.Content>
        </Card>

        <Card style={{ backgroundColor: 'rgba(255,255,255,0.15)', marginRight: SPACING.sm, width: 120 }}>
          <Card.Content style={{ padding: SPACING.sm, alignItems: 'center' }}>
            <Icon name="schedule" size={24} color={COLORS.white} />
            <Text style={[TEXT_STYLES.h2, { color: COLORS.white, marginTop: 4 }]}>
              {mockAnalyticsData.overview.totalHours}h
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.white, opacity: 0.8 }]}>
              Total Time
            </Text>
          </Card.Content>
        </Card>

        <Card style={{ backgroundColor: 'rgba(255,255,255,0.15)', marginRight: SPACING.sm, width: 120 }}>
          <Card.Content style={{ padding: SPACING.sm, alignItems: 'center' }}>
            <Icon name="local-fire-department" size={24} color={COLORS.white} />
            <Text style={[TEXT_STYLES.h2, { color: COLORS.white, marginTop: 4 }]}>
              {mockAnalyticsData.overview.caloriesBurned}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.white, opacity: 0.8 }]}>
              Calories
            </Text>
          </Card.Content>
        </Card>

        <Card style={{ backgroundColor: 'rgba(255,255,255,0.15)', width: 120 }}>
          <Card.Content style={{ padding: SPACING.sm, alignItems: 'center' }}>
            <Icon name="trending-up" size={24} color={COLORS.white} />
            <Text style={[TEXT_STYLES.h2, { color: COLORS.white, marginTop: 4 }]}>
              {mockAnalyticsData.overview.avgIntensity}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.white, opacity: 0.8 }]}>
              Avg Intensity
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>
    </LinearGradient>
  );

  const renderTimeFilter = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ paddingVertical: SPACING.md }}
      contentContainerStyle={{ paddingHorizontal: SPACING.md }}
    >
      {timeFilters.map((filter) => (
        <TouchableOpacity
          key={filter.key}
          onPress={() => setTimeFilter(filter.key)}
          style={{ marginRight: SPACING.sm }}
        >
          <Surface
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: SPACING.md,
              paddingVertical: SPACING.sm,
              borderRadius: 20,
              backgroundColor: timeFilter === filter.key ? COLORS.primary : COLORS.background,
              elevation: timeFilter === filter.key ? 2 : 0,
            }}
          >
            <Icon
              name={filter.icon}
              size={18}
              color={timeFilter === filter.key ? COLORS.white : COLORS.text}
              style={{ marginRight: SPACING.xs }}
            />
            <Text
              style={[
                TEXT_STYLES.body,
                {
                  color: timeFilter === filter.key ? COLORS.white : COLORS.text,
                  fontWeight: timeFilter === filter.key ? 'bold' : 'normal',
                }
              ]}
            >
              {filter.label}
            </Text>
          </Surface>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderProgressCharts = () => (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      {/* Strength Progress */}
      <Card style={{ marginHorizontal: SPACING.md, marginBottom: SPACING.md, elevation: 3 }}>
        <Card.Content style={{ padding: SPACING.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
            <Icon name="fitness-center" size={24} color={COLORS.primary} />
            <Text style={[TEXT_STYLES.h3, { marginLeft: SPACING.sm, flex: 1 }]}>
              Strength Progress
            </Text>
            <Chip mode="flat" style={{ backgroundColor: `${COLORS.primary}20` }}>
              +23%
            </Chip>
          </View>
          <LineChart
            data={mockAnalyticsData.strengthProgress}
            width={width - (SPACING.md * 4)}
            height={200}
            chartConfig={chartConfig}
            bezier
            style={{ borderRadius: 10 }}
          />
        </Card.Content>
      </Card>

      {/* Workout Distribution */}
      <Card style={{ marginHorizontal: SPACING.md, marginBottom: SPACING.md, elevation: 3 }}>
        <Card.Content style={{ padding: SPACING.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
            <Icon name="pie-chart" size={24} color={COLORS.success} />
            <Text style={[TEXT_STYLES.h3, { marginLeft: SPACING.sm }]}>
              Workout Distribution
            </Text>
          </View>
          <PieChart
            data={mockAnalyticsData.workoutDistribution}
            width={width - (SPACING.md * 4)}
            height={200}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
          />
        </Card.Content>
      </Card>

      {/* Weekly Activity */}
      <Card style={{ marginHorizontal: SPACING.md, marginBottom: SPACING.md, elevation: 3 }}>
        <Card.Content style={{ padding: SPACING.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
            <Icon name="bar-chart" size={24} color="#FF9800" />
            <Text style={[TEXT_STYLES.h3, { marginLeft: SPACING.sm }]}>
              Weekly Activity
            </Text>
          </View>
          <BarChart
            data={mockAnalyticsData.weeklyActivity}
            width={width - (SPACING.md * 4)}
            height={200}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => `rgba(255, 152, 0, ${opacity})`,
            }}
            style={{ borderRadius: 10 }}
          />
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderImprovements = () => (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: SPACING.md, marginBottom: SPACING.md }}>
        <Icon name="trending-up" size={24} color={COLORS.success} />
        <Text style={[TEXT_STYLES.h3, { marginLeft: SPACING.sm }]}>
          Key Improvements 📈
        </Text>
      </View>

      {mockAnalyticsData.improvements.map((improvement, index) => (
        <Card key={index} style={{ marginHorizontal: SPACING.md, marginBottom: SPACING.sm, elevation: 2 }}>
          <Card.Content style={{ padding: SPACING.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flex: 1 }}>
                <Text style={[TEXT_STYLES.body, { fontWeight: 'bold' }]}>
                  {improvement.metric}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                    {improvement.previous} → {improvement.current}
                  </Text>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon
                    name={improvement.trend === 'up' ? 'trending-up' : 'trending-down'}
                    size={16}
                    color={improvement.trend === 'up' ? COLORS.success : COLORS.error}
                  />
                  <Text
                    style={[
                      TEXT_STYLES.body,
                      {
                        color: improvement.trend === 'up' ? COLORS.success : COLORS.error,
                        fontWeight: 'bold',
                        marginLeft: 4,
                      }
                    ]}
                  >
                    {improvement.change}
                  </Text>
                </View>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                  {improvement.percentage}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      ))}
    </Animated.View>
  );

  const renderAchievements = () => (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: SPACING.md, marginBottom: SPACING.md }}>
        <Icon name="jump-rope" size={24} color="#FFD700" />
        <Text style={[TEXT_STYLES.h3, { marginLeft: SPACING.sm }]}>
          Recent Achievements 🏆
        </Text>
      </View>

      {mockAnalyticsData.achievements.map((achievement, index) => (
        <Card key={achievement.id} style={{ marginHorizontal: SPACING.md, marginBottom: SPACING.sm, elevation: 2 }}>
          <Card.Content style={{ padding: SPACING.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Surface
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  backgroundColor: `${COLORS.primary}20`,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: SPACING.md,
                }}
              >
                <Icon name={achievement.icon} size={24} color={COLORS.primary} />
              </Surface>
              <View style={{ flex: 1 }}>
                <Text style={[TEXT_STYLES.body, { fontWeight: 'bold' }]}>
                  {achievement.title}
                </Text>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginTop: 2 }]}>
                  {achievement.description}
                </Text>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.primary, marginTop: 4 }]}>
                  {new Date(achievement.date).toLocaleDateString()}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>
                  {achievement.value}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      ))}

      <Button
        mode="outlined"
        onPress={() => navigation.navigate('Achievements')}
        style={{ margin: SPACING.md }}
        icon="jump-rope"
      >
        View All Achievements
      </Button>
    </Animated.View>
  );

  const renderInsightsCard = () => (
    <Card style={{ marginHorizontal: SPACING.md, marginBottom: SPACING.md, elevation: 3 }}>
      <LinearGradient
        colors={['#4CAF50', '#45a049']}
        style={{ borderTopLeftRadius: 12, borderTopRightRadius: 12, padding: SPACING.md }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Icon name="psychology" size={24} color={COLORS.white} />
          <Text style={[TEXT_STYLES.h3, { color: COLORS.white, marginLeft: SPACING.sm }]}>
            AI Insights 🧠
          </Text>
        </View>
      </LinearGradient>
      <Card.Content style={{ padding: SPACING.md }}>
        <View style={{ marginBottom: SPACING.md }}>
          <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.sm }]}>
            💪 <Text style={{ fontWeight: 'bold' }}>Strength Focus:</Text> Your upper body strength has improved 23% this month. Consider adding more lower body exercises to balance development.
          </Text>
        </View>
        <View style={{ marginBottom: SPACING.md }}>
          <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.sm }]}>
            🏃‍♂️ <Text style={{ fontWeight: 'bold' }}>Cardio Optimization:</Text> Your endurance sessions show great consistency. Try interval training to break through your current plateau.
          </Text>
        </View>
        <View>
          <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.sm }]}>
            📅 <Text style={{ fontWeight: 'bold' }}>Recovery Pattern:</Text> You perform best after 1-2 rest days. Schedule intense workouts accordingly for optimal results.
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <PlaceholderScreen
        icon="analytics"
        title="Loading Analytics"
        message="Analyzing your performance data..."
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
        {renderTimeFilter()}
        {renderProgressCharts()}
        {renderInsightsCard()}
        {renderImprovements()}
        {renderAchievements()}

        <View style={{ height: SPACING.xl }} />
      </ScrollView>
    </View>
  );
};

export default PerformanceAnalyticsScreen;