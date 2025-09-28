import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Alert,
  StatusBar,
  Animated,
  Dimensions,
  TouchableOpacity,
  Platform,
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
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { Portal, Modal } from 'react-native-paper';

// Import your design system constants
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
  accent: '#FF6B35',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subheader: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  body: {
    fontSize: 14,
    color: COLORS.text,
  },
  caption: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
};

const { width, height } = Dimensions.get('window');

const PlayerStats = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, playerStats, isLoading } = useSelector(state => ({
    user: state.auth.user,
    playerStats: state.player.stats || {},
    isLoading: state.player.isLoading || false,
  }));

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [searchQuery, setSearchQuery] = useState('');
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedStat, setSelectedStat] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Mock data for demonstration
  const mockStats = {
    overview: {
      totalSessions: 45,
      completionRate: 89,
      currentStreak: 7,
      totalPoints: 2850,
      level: 12,
      nextLevelPoints: 3000,
      achievements: 23,
    },
    performance: {
      speed: { current: 85, previous: 82, trend: 'up' },
      strength: { current: 78, previous: 75, trend: 'up' },
      endurance: { current: 92, previous: 88, trend: 'up' },
      agility: { current: 80, previous: 83, trend: 'down' },
      technique: { current: 88, previous: 85, trend: 'up' },
    },
    recentActivities: [
      { id: 1, type: 'Training', name: 'Speed & Agility', date: '2024-01-15', score: 95, duration: '45min' },
      { id: 2, type: 'Match', name: 'vs Team Alpha', date: '2024-01-13', score: 87, duration: '90min' },
      { id: 3, type: 'Training', name: 'Strength Building', date: '2024-01-12', score: 82, duration: '60min' },
      { id: 4, type: 'Recovery', name: 'Yoga Session', date: '2024-01-11', score: 90, duration: '30min' },
    ],
    achievements: [
      { id: 1, title: '🔥 Weekly Warrior', description: '7 days streak', unlocked: true, progress: 100 },
      { id: 2, title: '⚡ Speed Demon', description: 'Top speed improved by 10%', unlocked: true, progress: 100 },
      { id: 3, title: '💪 Strength Master', description: 'Complete 50 strength sessions', unlocked: false, progress: 78 },
      { id: 4, title: '🎯 Perfect Form', description: 'Technique score above 90', unlocked: false, progress: 45 },
    ],
  };

  // Component mount animations
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
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      Alert.alert('Stats Updated! 📊', 'Your latest performance data has been synced.');
    } catch (error) {
      Alert.alert('Sync Error', 'Unable to update stats. Please try again.');
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Tab handler
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start(() => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    });
  };

  // Stat detail handler
  const handleStatPress = (statName, statData) => {
    setSelectedStat({ name: statName, data: statData });
    setShowStatsModal(true);
  };

  // Render header
  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={{
        paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 20,
        paddingBottom: SPACING.lg,
        paddingHorizontal: SPACING.md,
      }}
    >
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={[TEXT_STYLES.header, { color: 'white', marginBottom: SPACING.xs }]}>
              Performance Dashboard 📈
            </Text>
            <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.9)' }]}>
              Track your progress, {user?.name || 'Player'}!
            </Text>
          </View>
          <Avatar.Text
            size={50}
            label={user?.name?.charAt(0) || 'P'}
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            labelStyle={{ color: 'white', fontWeight: 'bold' }}
          />
        </View>
      </Animated.View>
    </LinearGradient>
  );

  // Render stats overview
  const renderStatsOverview = () => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
        margin: SPACING.md,
      }}
    >
      <Card style={{ marginBottom: SPACING.md }}>
        <Card.Content>
          <Text style={[TEXT_STYLES.subheader, { marginBottom: SPACING.md, textAlign: 'center' }]}>
            🏆 Current Level: {mockStats.overview.level}
          </Text>
          <ProgressBar
            progress={mockStats.overview.totalPoints / mockStats.overview.nextLevelPoints}
            color={COLORS.primary}
            style={{ height: 8, marginBottom: SPACING.sm }}
          />
          <Text style={[TEXT_STYLES.caption, { textAlign: 'center' }]}>
            {mockStats.overview.totalPoints} / {mockStats.overview.nextLevelPoints} XP
          </Text>
        </Card.Content>
      </Card>

      {/* Quick Stats Grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {[
          { label: 'Sessions', value: mockStats.overview.totalSessions, icon: 'fitness-center', color: COLORS.primary },
          { label: 'Completion', value: `${mockStats.overview.completionRate}%`, icon: 'check-circle', color: COLORS.success },
          { label: 'Streak', value: `${mockStats.overview.currentStreak} days`, icon: 'local-fire-department', color: COLORS.accent },
          { label: 'Achievements', value: mockStats.overview.achievements, icon: 'jump-rope', color: COLORS.warning },
        ].map((stat, index) => (
          <Surface
            key={index}
            style={{
              width: (width - SPACING.md * 3) / 2,
              marginBottom: SPACING.md,
              borderRadius: 12,
              elevation: 2,
            }}
          >
            <TouchableOpacity
              style={{
                padding: SPACING.md,
                alignItems: 'center',
              }}
              onPress={() => Alert.alert(`${stat.label} Details`, 'Feature coming soon! 🚀')}
            >
              <Icon name={stat.icon} size={32} color={stat.color} />
              <Text style={[TEXT_STYLES.subheader, { marginTop: SPACING.sm, color: stat.color }]}>
                {stat.value}
              </Text>
              <Text style={TEXT_STYLES.caption}>{stat.label}</Text>
            </TouchableOpacity>
          </Surface>
        ))}
      </View>
    </Animated.View>
  );

  // Render performance metrics
  const renderPerformanceMetrics = () => (
    <View style={{ margin: SPACING.md }}>
      <Text style={[TEXT_STYLES.subheader, { marginBottom: SPACING.md }]}>
        📊 Performance Metrics
      </Text>
      {Object.entries(mockStats.performance).map(([key, value]) => (
        <TouchableOpacity
          key={key}
          onPress={() => handleStatPress(key, value)}
          style={{ marginBottom: SPACING.md }}
        >
          <Card>
            <Card.Content>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={[TEXT_STYLES.body, { textTransform: 'capitalize', fontWeight: '600' }]}>
                    {key}
                  </Text>
                  <ProgressBar
                    progress={value.current / 100}
                    color={value.trend === 'up' ? COLORS.success : COLORS.error}
                    style={{ marginVertical: SPACING.sm }}
                  />
                  <Text style={TEXT_STYLES.caption}>
                    Current: {value.current}% | Previous: {value.previous}%
                  </Text>
                </View>
                <View style={{ alignItems: 'center', marginLeft: SPACING.md }}>
                  <Icon
                    name={value.trend === 'up' ? 'trending-up' : 'trending-down'}
                    size={24}
                    color={value.trend === 'up' ? COLORS.success : COLORS.error}
                  />
                  <Chip
                    mode="outlined"
                    textStyle={{ fontSize: 10 }}
                    style={{ marginTop: SPACING.xs }}
                  >
                    {value.trend === 'up' ? '+' : '-'}{Math.abs(value.current - value.previous)}%
                  </Chip>
                </View>
              </View>
            </Card.Content>
          </Card>
        </TouchableOpacity>
      ))}
    </View>
  );

  // Render recent activities
  const renderRecentActivities = () => (
    <View style={{ margin: SPACING.md }}>
      <Text style={[TEXT_STYLES.subheader, { marginBottom: SPACING.md }]}>
        🕐 Recent Activities
      </Text>
      {mockStats.recentActivities.map((activity) => (
        <Card key={activity.id} style={{ marginBottom: SPACING.sm }}>
          <Card.Content>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={[TEXT_STYLES.body, { fontWeight: '600' }]}>
                  {activity.name}
                </Text>
                <Text style={TEXT_STYLES.caption}>
                  {activity.type} • {activity.date} • {activity.duration}
                </Text>
              </View>
              <Chip
                mode="outlined"
                textStyle={{ fontWeight: 'bold' }}
                style={{
                  backgroundColor: activity.score >= 90 ? COLORS.success : 
                                  activity.score >= 80 ? COLORS.warning : COLORS.error,
                }}
              >
                {activity.score}
              </Chip>
            </View>
          </Card.Content>
        </Card>
      ))}
    </View>
  );

  // Render achievements
  const renderAchievements = () => (
    <View style={{ margin: SPACING.md }}>
      <Text style={[TEXT_STYLES.subheader, { marginBottom: SPACING.md }]}>
        🏅 Achievements
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {mockStats.achievements.map((achievement) => (
          <Surface
            key={achievement.id}
            style={{
              width: 200,
              marginRight: SPACING.md,
              borderRadius: 12,
              elevation: 2,
              opacity: achievement.unlocked ? 1 : 0.6,
            }}
          >
            <TouchableOpacity
              style={{ padding: SPACING.md }}
              onPress={() => Alert.alert(achievement.title, achievement.description)}
            >
              <Text style={[TEXT_STYLES.body, { fontWeight: 'bold', marginBottom: SPACING.sm }]}>
                {achievement.title}
              </Text>
              <Text style={[TEXT_STYLES.caption, { marginBottom: SPACING.md }]}>
                {achievement.description}
              </Text>
              <ProgressBar
                progress={achievement.progress / 100}
                color={achievement.unlocked ? COLORS.success : COLORS.primary}
              />
              <Text style={[TEXT_STYLES.caption, { marginTop: SPACING.xs, textAlign: 'right' }]}>
                {achievement.progress}%
              </Text>
            </TouchableOpacity>
          </Surface>
        ))}
      </ScrollView>
    </View>
  );

  // Render tab navigation
  const renderTabNavigation = () => (
    <View style={{
      flexDirection: 'row',
      backgroundColor: COLORS.surface,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      elevation: 4,
    }}>
      {[
        { key: 'overview', label: 'Overview', icon: 'dashboard' },
        { key: 'performance', label: 'Performance', icon: 'trending-up' },
        { key: 'activities', label: 'Activities', icon: 'history' },
        { key: 'achievements', label: 'Awards', icon: 'jump-rope' },
      ].map((tab) => (
        <TouchableOpacity
          key={tab.key}
          onPress={() => handleTabChange(tab.key)}
          style={{
            flex: 1,
            alignItems: 'center',
            paddingVertical: SPACING.sm,
            borderRadius: 8,
            backgroundColor: activeTab === tab.key ? COLORS.primary : 'transparent',
          }}
        >
          <Icon
            name={tab.icon}
            size={20}
            color={activeTab === tab.key ? 'white' : COLORS.textSecondary}
          />
          <Text style={[
            TEXT_STYLES.caption,
            {
              color: activeTab === tab.key ? 'white' : COLORS.textSecondary,
              fontWeight: activeTab === tab.key ? 'bold' : 'normal',
              marginTop: SPACING.xs,
            }
          ]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'performance':
        return renderPerformanceMetrics();
      case 'activities':
        return renderRecentActivities();
      case 'achievements':
        return renderAchievements();
      default:
        return renderStatsOverview();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {renderHeader()}
      {renderTabNavigation()}
      
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderTabContent()}
        
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Stats Detail Modal */}
      <Portal>
        <Modal
          visible={showStatsModal}
          onDismiss={() => setShowStatsModal(false)}
          contentContainerStyle={{
            backgroundColor: COLORS.surface,
            margin: SPACING.lg,
            borderRadius: 12,
            padding: SPACING.lg,
          }}
        >
          {selectedStat && (
            <>
              <Text style={[TEXT_STYLES.subheader, { marginBottom: SPACING.md, textTransform: 'capitalize' }]}>
                {selectedStat.name} Details
              </Text>
              <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.lg }]}>
                Current Score: {selectedStat.data.current}%
              </Text>
              <Button
                mode="contained"
                onPress={() => setShowStatsModal(false)}
                buttonColor={COLORS.primary}
              >
                Close
              </Button>
            </>
          )}
        </Modal>
      </Portal>
    </View>
  );
};

export default PlayerStats;