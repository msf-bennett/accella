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

const { width } = Dimensions.get('window');

const PerformanceDashboard = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { players, performanceData, loading } = useSelector(state => state.performance);

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMetric, setSelectedMetric] = useState('overall');
  const [showFilters, setShowFilters] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;

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
    ]).start();

    // Load performance data
    loadPerformanceData();
  }, []);

  const loadPerformanceData = useCallback(async () => {
    try {
      // Dispatch actions to load performance data
      // dispatch(fetchPerformanceData({ timeframe: selectedTimeframe }));
      // dispatch(fetchPlayers());
    } catch (error) {
      console.error('Error loading performance data:', error);
    }
  }, [selectedTimeframe, dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPerformanceData();
    setRefreshing(false);
  }, [loadPerformanceData]);

  // Mock data for demonstration
  const mockOverviewStats = {
    totalPlayers: 24,
    activeToday: 18,
    completionRate: 87,
    averageScore: 8.3,
    improvement: '+12%',
  };

  const mockTopPerformers = [
    { id: 1, name: 'Alex Johnson', avatar: 'AJ', score: 95, improvement: '+8%', position: 'Forward' },
    { id: 2, name: 'Maria Santos', avatar: 'MS', score: 93, improvement: '+15%', position: 'Midfielder' },
    { id: 3, name: 'David Chen', avatar: 'DC', score: 91, improvement: '+6%', position: 'Defender' },
  ];

  const mockRecentActivities = [
    { id: 1, player: 'Alex Johnson', activity: 'Completed Speed Training', time: '2 hours ago', type: 'training' },
    { id: 2, player: 'Maria Santos', activity: 'Submitted Performance Video', time: '3 hours ago', type: 'video' },
    { id: 3, player: 'David Chen', activity: 'Fitness Test Completed', time: '5 hours ago', type: 'test' },
  ];

  const timeframeOptions = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' },
  ];

  const metricOptions = [
    { value: 'overall', label: 'Overall', icon: 'dashboard' },
    { value: 'fitness', label: 'Fitness', icon: 'fitness-center' },
    { value: 'skills', label: 'Skills', icon: 'sports-soccer' },
    { value: 'attendance', label: 'Attendance', icon: 'event-available' },
  ];

  const renderOverviewCard = () => (
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
                Performance Overview 📊
              </Text>
              <IconButton
                icon="refresh"
                iconColor="white"
                size={24}
                onPress={() => {
                  Alert.alert('Refresh Data', 'Performance data will be refreshed');
                }}
              />
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              <View style={{ alignItems: 'center', marginBottom: SPACING.medium }}>
                <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>Total Players</Text>
                <Text style={[TEXT_STYLES.title, { color: 'white', fontWeight: 'bold' }]}>{mockOverviewStats.totalPlayers}</Text>
              </View>

              <View style={{ alignItems: 'center', marginBottom: SPACING.medium }}>
                <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>Active Today</Text>
                <Text style={[TEXT_STYLES.title, { color: 'white', fontWeight: 'bold' }]}>{mockOverviewStats.activeToday}</Text>
              </View>

              <View style={{ alignItems: 'center', marginBottom: SPACING.medium }}>
                <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>Avg Score</Text>
                <Text style={[TEXT_STYLES.title, { color: 'white', fontWeight: 'bold' }]}>{mockOverviewStats.averageScore}</Text>
              </View>

              <View style={{ alignItems: 'center', marginBottom: SPACING.medium }}>
                <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>Improvement</Text>
                <Text style={[TEXT_STYLES.title, { color: COLORS.success, fontWeight: 'bold' }]}>{mockOverviewStats.improvement}</Text>
              </View>
            </View>

            <View style={{ marginTop: SPACING.medium }}>
              <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)', marginBottom: SPACING.small }]}>
                Team Completion Rate
              </Text>
              <ProgressBar
                progress={mockOverviewStats.completionRate / 100}
                color={COLORS.success}
                style={{ height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.3)' }}
              />
              <Text style={[TEXT_STYLES.caption, { color: 'white', textAlign: 'right', marginTop: SPACING.xsmall }]}>
                {mockOverviewStats.completionRate}%
              </Text>
            </View>
          </Card.Content>
        </Card>
      </LinearGradient>
    </Animated.View>
  );

  const renderTimeframeSelector = () => (
    <View style={{ paddingHorizontal: SPACING.medium, marginBottom: SPACING.medium }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row' }}>
          {timeframeOptions.map((option) => (
            <Chip
              key={option.value}
              mode={selectedTimeframe === option.value ? 'flat' : 'outlined'}
              selected={selectedTimeframe === option.value}
              onPress={() => setSelectedTimeframe(option.value)}
              style={{
                marginRight: SPACING.small,
                backgroundColor: selectedTimeframe === option.value ? COLORS.primary : 'transparent',
              }}
              textStyle={{
                color: selectedTimeframe === option.value ? 'white' : COLORS.primary,
              }}
            >
              {option.label}
            </Chip>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const renderMetricSelector = () => (
    <View style={{ paddingHorizontal: SPACING.medium, marginBottom: SPACING.medium }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row' }}>
          {metricOptions.map((metric) => (
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
                backgroundColor: selectedMetric === metric.value ? COLORS.primary : COLORS.background,
                borderWidth: 1,
                borderColor: selectedMetric === metric.value ? COLORS.primary : COLORS.border,
              }}
            >
              <Icon
                name={metric.icon}
                size={18}
                color={selectedMetric === metric.value ? 'white' : COLORS.primary}
                style={{ marginRight: SPACING.xsmall }}
              />
              <Text
                style={[
                  TEXT_STYLES.caption,
                  { color: selectedMetric === metric.value ? 'white' : COLORS.primary }
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

  const renderTopPerformers = () => (
    <Card style={{ margin: SPACING.medium, elevation: 4 }}>
      <Card.Content>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.medium }}>
          <Text style={[TEXT_STYLES.heading, { color: COLORS.text }]}>Top Performers 🏆</Text>
          <Button
            mode="text"
            onPress={() => navigation.navigate('PlayerRankings')}
            labelStyle={{ color: COLORS.primary }}
          >
            View All
          </Button>
        </View>

        {mockTopPerformers.map((performer, index) => (
          <TouchableOpacity
            key={performer.id}
            onPress={() => navigation.navigate('PlayerProfile', { playerId: performer.id })}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: SPACING.small,
              borderBottomWidth: index < mockTopPerformers.length - 1 ? 1 : 0,
              borderBottomColor: COLORS.border,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: SPACING.small }}>
              <Text style={[TEXT_STYLES.title, { color: COLORS.primary, fontWeight: 'bold', minWidth: 24 }]}>
                #{index + 1}
              </Text>
              <Avatar.Text
                size={40}
                label={performer.avatar}
                style={{ marginLeft: SPACING.small, backgroundColor: COLORS.primary }}
              />
            </View>

            <View style={{ flex: 1, marginLeft: SPACING.small }}>
              <Text style={[TEXT_STYLES.body, { fontWeight: '600' }]}>{performer.name}</Text>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>{performer.position}</Text>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[TEXT_STYLES.title, { fontWeight: 'bold', color: COLORS.success }]}>
                {performer.score}
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.success }]}>
                {performer.improvement}
              </Text>
            </View>

            <Icon name="chevron-right" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
        ))}
      </Card.Content>
    </Card>
  );

  const renderQuickStats = () => (
    <View style={{ paddingHorizontal: SPACING.medium, marginBottom: SPACING.medium }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Surface style={{ padding: SPACING.medium, borderRadius: 12, flex: 1, marginRight: SPACING.small, elevation: 2 }}>
          <View style={{ alignItems: 'center' }}>
            <Icon name="trending-up" size={32} color={COLORS.success} />
            <Text style={[TEXT_STYLES.title, { fontWeight: 'bold', marginTop: SPACING.small }]}>+15%</Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, textAlign: 'center' }]}>
              Weekly Growth
            </Text>
          </View>
        </Surface>

        <Surface style={{ padding: SPACING.medium, borderRadius: 12, flex: 1, marginHorizontal: SPACING.xsmall, elevation: 2 }}>
          <View style={{ alignItems: 'center' }}>
            <Icon name="jump-rope" size={32} color={COLORS.warning} />
            <Text style={[TEXT_STYLES.title, { fontWeight: 'bold', marginTop: SPACING.small }]}>12</Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, textAlign: 'center' }]}>
              Goals This Week
            </Text>
          </View>
        </Surface>

        <Surface style={{ padding: SPACING.medium, borderRadius: 12, flex: 1, marginLeft: SPACING.small, elevation: 2 }}>
          <View style={{ alignItems: 'center' }}>
            <Icon name="schedule" size={32} color={COLORS.primary} />
            <Text style={[TEXT_STYLES.title, { fontWeight: 'bold', marginTop: SPACING.small }]}>4.2h</Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, textAlign: 'center' }]}>
              Avg Session Time
            </Text>
          </View>
        </Surface>
      </View>
    </View>
  );

  const renderRecentActivity = () => (
    <Card style={{ margin: SPACING.medium, elevation: 4 }}>
      <Card.Content>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.medium }}>
          <Text style={[TEXT_STYLES.heading, { color: COLORS.text }]}>Recent Activity 📈</Text>
          <Button
            mode="text"
            onPress={() => navigation.navigate('ActivityLog')}
            labelStyle={{ color: COLORS.primary }}
          >
            View All
          </Button>
        </View>

        {mockRecentActivities.map((activity, index) => (
          <View
            key={activity.id}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: SPACING.small,
              borderBottomWidth: index < mockRecentActivities.length - 1 ? 1 : 0,
              borderBottomColor: COLORS.border,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 
                  activity.type === 'training' ? COLORS.primary :
                  activity.type === 'video' ? COLORS.success :
                  COLORS.warning,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: SPACING.medium,
              }}
            >
              <Icon
                name={
                  activity.type === 'training' ? 'fitness-center' :
                  activity.type === 'video' ? 'videocam' :
                  'assessment'
                }
                size={20}
                color="white"
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={[TEXT_STYLES.body, { fontWeight: '600' }]}>{activity.player}</Text>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>{activity.activity}</Text>
            </View>

            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>{activity.time}</Text>
          </View>
        ))}
      </Card.Content>
    </Card>
  );

  const renderActionButtons = () => (
    <View style={{ 
      flexDirection: 'row', 
      paddingHorizontal: SPACING.medium, 
      paddingBottom: SPACING.large,
      justifyContent: 'space-between'
    }}>
      <Button
        mode="outlined"
        onPress={() => navigation.navigate('PerformanceReports')}
        style={{ flex: 1, marginRight: SPACING.small }}
        icon="assessment"
      >
        Generate Report
      </Button>

      <Button
        mode="contained"
        onPress={() => navigation.navigate('PerformanceAnalytics')}
        style={{ flex: 1, marginLeft: SPACING.small, backgroundColor: COLORS.primary }}
        icon="analytics"
      >
        Deep Analytics
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
      >
        {renderOverviewCard()}
        {renderTimeframeSelector()}
        {renderMetricSelector()}
        {renderQuickStats()}
        {renderTopPerformers()}
        {renderRecentActivity()}
        {renderActionButtons()}
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
              { text: 'Add Performance Entry', onPress: () => navigation.navigate('AddPerformance') },
              { text: 'Schedule Assessment', onPress: () => navigation.navigate('ScheduleAssessment') },
              { text: 'Create Report', onPress: () => navigation.navigate('CreateReport') },
              { text: 'Cancel', style: 'cancel' },
            ]
          );
        }}
      />
    </View>
  );
};

// Screen configuration for navigation
PerformanceDashboard.navigationOptions = {
  title: 'Performance Dashboard',
  headerShown: true,
  headerStyle: {
    backgroundColor: COLORS.primary,
  },
  headerTintColor: 'white',
  headerTitleStyle: {
    fontWeight: 'bold',
  },
};

export default PerformanceDashboard;