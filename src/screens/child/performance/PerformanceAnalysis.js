import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Dimensions,
  Alert,
  StatusBar,
  Animated,
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
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

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
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subheading: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  body: {
    fontSize: 16,
    color: COLORS.text,
  },
  caption: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
};

const { width } = Dimensions.get('window');

const PerformanceAnalysis = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');
  const [fadeAnim] = useState(new Animated.Value(0));

  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const performanceData = useSelector(state => state.performance.childData);

  // Mock performance data for demonstration
  const mockPerformanceData = {
    overallScore: 85,
    improvement: 12,
    totalSessions: 24,
    streakDays: 7,
    level: 'Rising Star',
    badges: [
      { id: 1, name: 'Consistent Trainer', icon: 'star', earned: true },
      { id: 2, name: 'Speed Demon', icon: 'flash-on', earned: true },
      { id: 3, name: 'Team Player', icon: 'group', earned: false },
      { id: 4, name: 'Perfect Week', icon: 'calendar-today', earned: true },
    ],
    skillAreas: [
      { name: 'Speed', current: 78, target: 85, improvement: 8 },
      { name: 'Strength', current: 82, target: 90, improvement: 15 },
      { name: 'Endurance', current: 75, target: 80, improvement: 5 },
      { name: 'Technique', current: 88, target: 95, improvement: 12 },
      { name: 'Teamwork', current: 92, target: 95, improvement: 3 },
    ],
    recentTests: [
      { date: '2024-08-25', test: '40m Sprint', score: '6.2s', improvement: '+0.3s' },
      { date: '2024-08-20', test: 'Vertical Jump', score: '45cm', improvement: '+5cm' },
      { date: '2024-08-15', test: 'Agility Ladder', score: '12.8s', improvement: '+0.5s' },
      { date: '2024-08-10', test: 'Ball Control', score: '8.5/10', improvement: '+1.5' },
    ],
    weeklyProgress: [
      { week: 'W1', score: 72 },
      { week: 'W2', score: 76 },
      { week: 'W3', score: 78 },
      { week: 'W4', score: 85 },
    ],
    upcomingGoals: [
      { goal: 'Complete 10 training sessions', progress: 7, target: 10 },
      { goal: 'Improve sprint time by 0.5s', progress: 0.3, target: 0.5 },
      { goal: 'Master 5 new techniques', progress: 3, target: 5 },
    ],
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert('Success! 🎉', 'Performance data refreshed successfully!');
    } catch (error) {
      Alert.alert('Oops! 😅', 'Unable to refresh data. Please try again later.');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleViewDetails = (category) => {
    Alert.alert(
      'Feature Coming Soon! 🚀',
      `Detailed ${category} analysis will be available in the next update!`
    );
  };

  const renderOverviewCard = () => (
    <Card style={styles.overviewCard} elevation={4}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.overviewGradient}
      >
        <View style={styles.overviewContent}>
          <View style={styles.overviewLeft}>
            <Text style={styles.overviewTitle}>Overall Performance</Text>
            <Text style={styles.overviewScore}>{mockPerformanceData.overallScore}%</Text>
            <View style={styles.improvementRow}>
              <Icon name="trending-up" size={16} color="#fff" />
              <Text style={styles.improvementText}>
                +{mockPerformanceData.improvement}% this month
              </Text>
            </View>
          </View>
          <View style={styles.overviewRight}>
            <Surface style={styles.levelBadge}>
              <Icon name="military-tech" size={20} color={COLORS.primary} />
              <Text style={styles.levelText}>{mockPerformanceData.level}</Text>
            </Surface>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{mockPerformanceData.totalSessions}</Text>
                <Text style={styles.statLabel}>Sessions</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{mockPerformanceData.streakDays}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>
    </Card>
  );

  const renderBadges = () => (
    <Card style={styles.sectionCard} elevation={2}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <Icon name="jump-rope" size={24} color={COLORS.primary} />
          <Text style={[TEXT_STYLES.subheading, { marginLeft: SPACING.sm }]}>
            Achievement Badges 🏆
          </Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.badgesContainer}>
            {mockPerformanceData.badges.map((badge) => (
              <Surface key={badge.id} style={[
                styles.badgeItem,
                { opacity: badge.earned ? 1 : 0.5 }
              ]}>
                <Icon 
                  name={badge.icon} 
                  size={24} 
                  color={badge.earned ? COLORS.warning : COLORS.textSecondary} 
                />
                <Text style={styles.badgeText}>{badge.name}</Text>
                {badge.earned && <Icon name="check-circle" size={16} color={COLORS.success} />}
              </Surface>
            ))}
          </View>
        </ScrollView>
      </Card.Content>
    </Card>
  );

  const renderSkillProgress = () => (
    <Card style={styles.sectionCard} elevation={2}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <Icon name="trending-up" size={24} color={COLORS.primary} />
          <Text style={[TEXT_STYLES.subheading, { marginLeft: SPACING.sm }]}>
            Skill Development 📈
          </Text>
        </View>
        {mockPerformanceData.skillAreas.map((skill, index) => (
          <View key={index} style={styles.skillItem}>
            <View style={styles.skillHeader}>
              <Text style={styles.skillName}>{skill.name}</Text>
              <View style={styles.skillProgress}>
                <Text style={styles.skillScore}>{skill.current}%</Text>
                <Text style={styles.skillImprovement}>+{skill.improvement}%</Text>
              </View>
            </View>
            <ProgressBar 
              progress={skill.current / 100} 
              color={COLORS.primary}
              style={styles.progressBar}
            />
            <Text style={styles.skillTarget}>Target: {skill.target}%</Text>
          </View>
        ))}
      </Card.Content>
    </Card>
  );

  const renderRecentTests = () => (
    <Card style={styles.sectionCard} elevation={2}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <Icon name="assessment" size={24} color={COLORS.primary} />
          <Text style={[TEXT_STYLES.subheading, { marginLeft: SPACING.sm }]}>
            Recent Performance Tests 🎯
          </Text>
        </View>
        {mockPerformanceData.recentTests.map((test, index) => (
          <Surface key={index} style={styles.testItem}>
            <View style={styles.testContent}>
              <View>
                <Text style={styles.testName}>{test.test}</Text>
                <Text style={styles.testDate}>{test.date}</Text>
              </View>
              <View style={styles.testResults}>
                <Text style={styles.testScore}>{test.score}</Text>
                <Chip 
                  mode="outlined" 
                  textStyle={styles.improvementChipText}
                  style={[styles.improvementChip, { 
                    backgroundColor: test.improvement.includes('+') ? '#E8F5E8' : '#FFF3E0' 
                  }]}
                >
                  {test.improvement}
                </Chip>
              </View>
            </View>
          </Surface>
        ))}
      </Card.Content>
    </Card>
  );

  const renderUpcomingGoals = () => (
    <Card style={styles.sectionCard} elevation={2}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <Icon name="flag" size={24} color={COLORS.primary} />
          <Text style={[TEXT_STYLES.subheading, { marginLeft: SPACING.sm }]}>
            Goals in Progress 🎯
          </Text>
        </View>
        {mockPerformanceData.upcomingGoals.map((goal, index) => (
          <View key={index} style={styles.goalItem}>
            <Text style={styles.goalText}>{goal.goal}</Text>
            <View style={styles.goalProgress}>
              <Text style={styles.goalProgressText}>
                {goal.progress}/{goal.target}
              </Text>
              <ProgressBar 
                progress={goal.progress / goal.target} 
                color={COLORS.success}
                style={styles.goalProgressBar}
              />
            </View>
          </View>
        ))}
      </Card.Content>
    </Card>
  );

  const renderQuickActions = () => (
    <Card style={styles.sectionCard} elevation={2}>
      <Card.Content>
        <Text style={[TEXT_STYLES.subheading, styles.sectionTitle]}>
          Quick Actions ⚡
        </Text>
        <View style={styles.actionGrid}>
          <Button 
            mode="contained" 
            onPress={() => handleViewDetails('detailed')}
            style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
            labelStyle={styles.actionButtonText}
            icon="analytics"
          >
            Detailed Report
          </Button>
          <Button 
            mode="contained" 
            onPress={() => handleViewDetails('compare')}
            style={[styles.actionButton, { backgroundColor: COLORS.success }]}
            labelStyle={styles.actionButtonText}
            icon="compare"
          >
            Compare Progress
          </Button>
          <Button 
            mode="contained" 
            onPress={() => handleViewDetails('share')}
            style={[styles.actionButton, { backgroundColor: COLORS.warning }]}
            labelStyle={styles.actionButtonText}
            icon="share"
          >
            Share with Coach
          </Button>
          <Button 
            mode="outlined" 
            onPress={() => handleViewDetails('goals')}
            style={styles.actionButton}
            labelStyle={[styles.actionButtonText, { color: COLORS.primary }]}
            icon="add-task"
          >
            Set New Goals
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Performance Analysis</Text>
        <Text style={styles.headerSubtitle}>Track your amazing progress! 🌟</Text>
      </LinearGradient>

      <Animated.ScrollView
        style={[styles.content, { opacity: fadeAnim }]}
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
        {renderOverviewCard()}
        {renderBadges()}
        {renderSkillProgress()}
        {renderRecentTests()}
        {renderUpcomingGoals()}
        {renderQuickActions()}
        
        <View style={styles.bottomSpacing} />
      </Animated.ScrollView>
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
  headerTitle: {
    ...TEXT_STYLES.heading,
    color: '#fff',
    textAlign: 'center',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
    marginTop: SPACING.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    marginTop: -SPACING.md,
  },
  overviewCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    overflow: 'hidden',
  },
  overviewGradient: {
    padding: SPACING.lg,
  },
  overviewContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  overviewLeft: {
    flex: 1,
  },
  overviewTitle: {
    ...TEXT_STYLES.body,
    color: '#fff',
    opacity: 0.9,
  },
  overviewScore: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: SPACING.xs,
  },
  improvementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  improvementText: {
    ...TEXT_STYLES.caption,
    color: '#fff',
    marginLeft: SPACING.xs,
  },
  overviewRight: {
    alignItems: 'flex-end',
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: 20,
    marginBottom: SPACING.sm,
  },
  levelText: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    marginLeft: SPACING.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: '#fff',
    opacity: 0.8,
  },
  sectionCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingRight: SPACING.md,
  },
  badgeItem: {
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: 8,
    minWidth: 80,
    elevation: 1,
  },
  badgeText: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    marginTop: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  skillItem: {
    marginBottom: SPACING.md,
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  skillName: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
  },
  skillProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  skillScore: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  skillImprovement: {
    ...TEXT_STYLES.caption,
    color: COLORS.success,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  skillTarget: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
  },
  testItem: {
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    borderRadius: 8,
    elevation: 1,
  },
  testContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  testName: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
  },
  testDate: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
  },
  testResults: {
    alignItems: 'flex-end',
  },
  testScore: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  improvementChip: {
    marginTop: SPACING.xs,
    height: 24,
  },
  improvementChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  goalItem: {
    marginBottom: SPACING.md,
  },
  goalText: {
    ...TEXT_STYLES.body,
    marginBottom: SPACING.sm,
  },
  goalProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  goalProgressText: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    minWidth: 40,
  },
  goalProgressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    minWidth: (width - SPACING.md * 3) / 2 - SPACING.sm,
    marginBottom: SPACING.sm,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: SPACING.xl,
  },
});

export default PerformanceAnalysis;