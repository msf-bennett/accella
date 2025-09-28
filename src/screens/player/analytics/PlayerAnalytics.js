import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  RefreshControl,
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
  Surface,
  Searchbar,
  Portal,
  Modal,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

// Constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#f44336',
  warning: '#ff9800',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  h3: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 14, color: COLORS.text },
  caption: { fontSize: 12, color: COLORS.textSecondary },
};

const screenWidth = Dimensions.get('window').width;
const chartConfig = {
  backgroundGradientFrom: COLORS.surface,
  backgroundGradientTo: COLORS.surface,
  color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.7,
  decimalPlaces: 1,
};

const PlayerAnalytics = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const playerStats = useSelector(state => state.player.analytics);
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [searchQuery, setSearchQuery] = useState('');
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('overall');

  // Mock data for demonstration
  const [analyticsData, setAnalyticsData] = useState({
    overallStats: {
      totalSessions: 48,
      completionRate: 92,
      currentStreak: 7,
      bestStreak: 15,
      totalPoints: 2340,
      level: 12,
      nextLevelPoints: 2500,
    },
    performanceMetrics: {
      fitness: 85,
      technique: 78,
      tactical: 82,
      mental: 90,
      teamwork: 88,
    },
    recentPerformance: [
      { date: '2024-01', score: 75 },
      { date: '2024-02', score: 78 },
      { date: '2024-03', score: 82 },
      { date: '2024-04', score: 79 },
      { date: '2024-05', score: 85 },
      { date: '2024-06', score: 88 },
    ],
    skillProgress: [
      { skill: 'Speed', current: 85, target: 90, improvement: +5 },
      { skill: 'Strength', current: 78, target: 85, improvement: +8 },
      { skill: 'Agility', current: 92, target: 95, improvement: +3 },
      { skill: 'Endurance', current: 88, target: 92, improvement: +6 },
    ],
    achievements: [
      { id: 1, title: '🔥 Week Warrior', description: '7-day training streak', earned: true },
      { id: 2, title: '💪 Strength Master', description: 'Complete 20 strength sessions', earned: true },
      { id: 3, title: '🎯 Precision Pro', description: '90% accuracy in drills', earned: false },
      { id: 4, title: '⚡ Speed Demon', description: 'Improve sprint time by 10%', earned: false },
    ],
  });

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod]);

  const loadAnalyticsData = useCallback(async () => {
    try {
      // Simulate API call
      // dispatch(fetchPlayerAnalytics({ userId: user.id, period: selectedPeriod }));
    } catch (error) {
      Alert.alert('Error', 'Failed to load analytics data');
    }
  }, [selectedPeriod, user.id, dispatch]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAnalyticsData().finally(() => setRefreshing(false));
  }, [loadAnalyticsData]);

  const handleGoalSet = () => {
    Vibration.vibrate(50);
    setShowGoalModal(true);
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={{
        padding: SPACING.lg,
        paddingTop: StatusBar.currentHeight + SPACING.lg,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
        <Avatar.Image
          size={50}
          source={{ uri: user?.avatar || 'https://via.placeholder.com/50' }}
          style={{ marginRight: SPACING.md }}
        />
        <View style={{ flex: 1 }}>
          <Text style={[TEXT_STYLES.h2, { color: 'white' }]}>
            {user?.name || 'Player'}'s Analytics
          </Text>
          <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
            Track your progress and achievements
          </Text>
        </View>
        <IconButton
          icon="settings"
          iconColor="white"
          size={24}
          onPress={() => Alert.alert('Settings', 'Analytics settings coming soon!')}
        />
      </View>
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
        {['week', 'month', 'quarter', 'year'].map(period => (
          <Chip
            key={period}
            selected={selectedPeriod === period}
            onPress={() => setSelectedPeriod(period)}
            selectedColor="white"
            style={{
              backgroundColor: selectedPeriod === period ? 'rgba(255,255,255,0.2)' : 'transparent',
            }}
            textStyle={{ color: 'white', fontSize: 12 }}
          >
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </Chip>
        ))}
      </View>
    </LinearGradient>
  );

  const renderOverallStats = () => (
    <Card style={{ margin: SPACING.md, elevation: 4 }}>
      <Card.Content>
        <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
          📊 Overall Performance
        </Text>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.md }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={[TEXT_STYLES.h2, { color: COLORS.primary }]}>
              {analyticsData.overallStats.totalSessions}
            </Text>
            <Text style={TEXT_STYLES.caption}>Sessions</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={[TEXT_STYLES.h2, { color: COLORS.success }]}>
              {analyticsData.overallStats.completionRate}%
            </Text>
            <Text style={TEXT_STYLES.caption}>Completion</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={[TEXT_STYLES.h2, { color: COLORS.warning }]}>
              {analyticsData.overallStats.currentStreak}
            </Text>
            <Text style={TEXT_STYLES.caption}>Day Streak</Text>
          </View>
        </View>

        <View style={{ marginTop: SPACING.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs }}>
            <Text style={TEXT_STYLES.body}>Level {analyticsData.overallStats.level} Progress</Text>
            <Text style={TEXT_STYLES.caption}>
              {analyticsData.overallStats.totalPoints} / {analyticsData.overallStats.nextLevelPoints} XP
            </Text>
          </View>
          <ProgressBar
            progress={analyticsData.overallStats.totalPoints / analyticsData.overallStats.nextLevelPoints}
            color={COLORS.primary}
            style={{ height: 8, borderRadius: 4 }}
          />
        </View>
      </Card.Content>
    </Card>
  );

  const renderPerformanceChart = () => (
    <Card style={{ margin: SPACING.md, elevation: 4 }}>
      <Card.Content>
        <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
          📈 Performance Trend
        </Text>
        
        <LineChart
          data={{
            labels: analyticsData.recentPerformance.map(item => item.date.split('-')[1]),
            datasets: [
              {
                data: analyticsData.recentPerformance.map(item => item.score),
                strokeWidth: 3,
              },
            ],
          }}
          width={screenWidth - SPACING.lg * 2 - SPACING.md}
          height={200}
          chartConfig={chartConfig}
          bezier
          style={{ borderRadius: 8 }}
        />
      </Card.Content>
    </Card>
  );

  const renderSkillRadar = () => (
    <Card style={{ margin: SPACING.md, elevation: 4 }}>
      <Card.Content>
        <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
          🎯 Skill Assessment
        </Text>
        
        <PieChart
          data={Object.entries(analyticsData.performanceMetrics).map(([key, value], index) => ({
            name: key.charAt(0).toUpperCase() + key.slice(1),
            population: value,
            color: [COLORS.primary, COLORS.secondary, COLORS.success, COLORS.warning, COLORS.error][index % 5],
            legendFontColor: COLORS.text,
            legendFontSize: 12,
          }))}
          width={screenWidth - SPACING.lg * 2 - SPACING.md}
          height={200}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </Card.Content>
    </Card>
  );

  const renderSkillProgress = () => (
    <Card style={{ margin: SPACING.md, elevation: 4 }}>
      <Card.Content>
        <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
          📊 Skill Progress
        </Text>
        
        {analyticsData.skillProgress.map((skill, index) => (
          <View key={skill.skill} style={{ marginBottom: SPACING.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs }}>
              <Text style={TEXT_STYLES.body}>{skill.skill}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[TEXT_STYLES.caption, { marginRight: SPACING.xs }]}>
                  {skill.current}% / {skill.target}%
                </Text>
                <Icon
                  name={skill.improvement > 0 ? 'trending-up' : 'trending-down'}
                  size={16}
                  color={skill.improvement > 0 ? COLORS.success : COLORS.error}
                />
                <Text style={[TEXT_STYLES.caption, { 
                  color: skill.improvement > 0 ? COLORS.success : COLORS.error 
                }]}>
                  {skill.improvement > 0 ? '+' : ''}{skill.improvement}%
                </Text>
              </View>
            </View>
            <ProgressBar
              progress={skill.current / 100}
              color={COLORS.primary}
              style={{ height: 6, borderRadius: 3 }}
            />
            <ProgressBar
              progress={skill.target / 100}
              color="rgba(102, 126, 234, 0.3)"
              style={{ height: 6, borderRadius: 3, marginTop: -6 }}
            />
          </View>
        ))}
      </Card.Content>
    </Card>
  );

  const renderAchievements = () => (
    <Card style={{ margin: SPACING.md, elevation: 4 }}>
      <Card.Content>
        <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
          🏆 Achievements
        </Text>
        
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {analyticsData.achievements.map(achievement => (
            <Surface
              key={achievement.id}
              style={{
                padding: SPACING.md,
                margin: SPACING.xs,
                borderRadius: 12,
                width: (screenWidth - SPACING.lg * 2 - SPACING.md - SPACING.xs * 4) / 2,
                opacity: achievement.earned ? 1 : 0.5,
                elevation: achievement.earned ? 2 : 1,
              }}
            >
              <Text style={[TEXT_STYLES.body, { fontWeight: '600', marginBottom: SPACING.xs }]}>
                {achievement.title}
              </Text>
              <Text style={[TEXT_STYLES.caption, { fontSize: 10 }]}>
                {achievement.description}
              </Text>
              {!achievement.earned && (
                <Chip
                  compact
                  mode="outlined"
                  style={{ marginTop: SPACING.xs, alignSelf: 'flex-start' }}
                  textStyle={{ fontSize: 8 }}
                >
                  In Progress
                </Chip>
              )}
            </Surface>
          ))}
        </View>
      </Card.Content>
    </Card>
  );

  const renderActionButtons = () => (
    <View style={{ 
      flexDirection: 'row', 
      justifyContent: 'space-around', 
      margin: SPACING.md,
      marginBottom: SPACING.xl 
    }}>
      <Button
        mode="contained"
        onPress={() => Alert.alert('Export', 'Export analytics coming soon!')}
        style={{ flex: 1, marginRight: SPACING.xs }}
        icon="download"
      >
        Export Data
      </Button>
      <Button
        mode="outlined"
        onPress={handleGoalSet}
        style={{ flex: 1, marginLeft: SPACING.xs }}
        icon="flag"
      >
        Set Goals
      </Button>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {renderHeader()}
      
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
        {renderOverallStats()}
        {renderPerformanceChart()}
        {renderSkillRadar()}
        {renderSkillProgress()}
        {renderAchievements()}
        {renderActionButtons()}
      </ScrollView>

      {/* Goal Setting Modal */}
      <Portal>
        <Modal
          visible={showGoalModal}
          onDismiss={() => setShowGoalModal(false)}
          contentContainerStyle={{
            backgroundColor: COLORS.surface,
            margin: SPACING.lg,
            padding: SPACING.lg,
            borderRadius: 12,
          }}
        >
          <Text style={[TEXT_STYLES.h2, { marginBottom: SPACING.md }]}>
            🎯 Set New Goals
          </Text>
          <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.lg }]}>
            Goal setting feature is coming soon! You'll be able to set personalized targets for all your skills and track progress towards them.
          </Text>
          <Button
            mode="contained"
            onPress={() => setShowGoalModal(false)}
            style={{ alignSelf: 'flex-end' }}
          >
            Got it!
          </Button>
        </Modal>
      </Portal>
    </View>
  );
};

export default PlayerAnalytics;