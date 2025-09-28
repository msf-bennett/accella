import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  RefreshControl,
  Animated,
  StatusBar,
  TouchableOpacity,
  Modal,
  Dimensions,
  Vibration,
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
  Portal,
  Searchbar,
  Divider,
  Badge,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const ImprovementTrackingScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, goals } = useSelector(state => state.user);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState('month');
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);
  const [celebrationData, setCelebrationData] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  // Improvement metrics categories
  const improvementMetrics = [
    { id: 'all', name: 'All Metrics', icon: 'timeline', color: COLORS.primary },
    { id: 'speed', name: 'Speed 🏃‍♂️', icon: 'speed', color: '#FF6B6B' },
    { id: 'strength', name: 'Strength 💪', icon: 'fitness-center', color: '#4ECDC4' },
    { id: 'endurance', name: 'Endurance ❤️', icon: 'favorite', color: '#45B7D1' },
    { id: 'skill', name: 'Skills ⚽', icon: 'sports-soccer', color: '#96CEB4' },
    { id: 'flexibility', name: 'Flexibility 🤸‍♂️', icon: 'accessibility', color: '#FECA57' },
    { id: 'coordination', name: 'Coordination 🎯', icon: 'center-focus-strong', color: '#FF8A65' },
  ];

  // Time range options
  const timeRanges = [
    { id: 'week', name: '7 Days', duration: 7 },
    { id: 'month', name: '30 Days', duration: 30 },
    { id: 'quarter', name: '90 Days', duration: 90 },
    { id: 'year', name: '1 Year', duration: 365 },
  ];

  // Sample improvement data with detailed analytics
  const [improvementData, setImprovementData] = useState({
    overallStats: {
      totalImprovements: 15,
      averageImprovement: 18.5,
      bestImprovement: 45,
      improvementStreak: 8,
      milestones: 4,
      personalBests: 6,
    },
    recentImprovements: [
      {
        id: 1,
        metric: 'speed',
        activity: '100m Sprint',
        previousValue: '15.2s',
        currentValue: '14.8s',
        improvement: 2.6,
        improvementType: 'percentage',
        date: '2025-08-29',
        trend: 'up',
        isPersonalBest: true,
        celebrationLevel: 'major',
        notes: 'Amazing improvement in sprint time! 🏃‍♂️'
      },
      {
        id: 2,
        metric: 'skill',
        activity: 'Ball Juggling',
        previousValue: '6 juggles',
        currentValue: '12 juggles',
        improvement: 100,
        improvementType: 'percentage',
        date: '2025-08-28',
        trend: 'up',
        isPersonalBest: true,
        celebrationLevel: 'major',
        notes: 'Doubled the juggling record! ⚽'
      },
      {
        id: 3,
        metric: 'endurance',
        activity: '1 Mile Run',
        previousValue: '8:45',
        currentValue: '8:20',
        improvement: 4.8,
        improvementType: 'percentage',
        date: '2025-08-27',
        trend: 'up',
        isPersonalBest: false,
        celebrationLevel: 'good',
        notes: 'Steady improvement in endurance! ❤️'
      },
      {
        id: 4,
        metric: 'strength',
        activity: 'Push-ups',
        previousValue: '12 reps',
        currentValue: '18 reps',
        improvement: 50,
        improvementType: 'percentage',
        date: '2025-08-26',
        trend: 'up',
        isPersonalBest: true,
        celebrationLevel: 'excellent',
        notes: 'Incredible strength gains! 💪'
      },
    ],
    milestones: [
      {
        id: 1,
        title: 'First Sub-15s Sprint',
        date: '2025-08-29',
        category: 'speed',
        achievement: 'Broke the 15-second barrier!',
        points: 500,
        badge: '⚡',
      },
      {
        id: 2,
        title: 'Double-Digit Juggling',
        date: '2025-08-28',
        category: 'skill',
        achievement: 'Reached 10+ consecutive juggles',
        points: 300,
        badge: '⚽',
      },
      {
        id: 3,
        title: 'Consistency Champion',
        date: '2025-08-25',
        category: 'endurance',
        achievement: '7 days of consistent training',
        points: 200,
        badge: '🏆',
      },
    ],
    weeklyTrends: {
      improvements: [8, 12, 15, 18, 22, 25, 28],
      consistency: [85, 90, 88, 95, 92, 98, 94],
      effort: [4.2, 4.5, 4.3, 4.8, 4.6, 4.9, 4.7],
    },
    motivationalInsights: [
      "You've improved in 4 different areas this month! 🌟",
      "Your consistency is paying off - 8 days of steady progress! 🔥",
      "That sprint time improvement is incredible! You're getting faster! ⚡",
    ]
  });

  useEffect(() => {
    // Animation on mount
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

    // Sparkle animation for celebrations
    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const getMetricColor = (metric) => {
    const metricData = improvementMetrics.find(m => m.id === metric);
    return metricData ? metricData.color : COLORS.primary;
  };

  const getMetricIcon = (metric) => {
    const metricData = improvementMetrics.find(m => m.id === metric);
    return metricData ? metricData.icon : 'trending-up';
  };

  const getCelebrationLevel = (level) => {
    switch (level) {
      case 'excellent': return { color: '#9C27B0', icon: 'star', emoji: '🌟' };
      case 'major': return { color: '#FF6B6B', icon: 'celebration', emoji: '🎉' };
      case 'good': return { color: '#4CAF50', icon: 'thumb-up', emoji: '👍' };
      default: return { color: COLORS.primary, icon: 'trending-up', emoji: '📈' };
    }
  };

  const formatImprovement = (value, type) => {
    if (type === 'percentage') {
      return `+${value.toFixed(1)}%`;
    }
    return `+${value}`;
  };

  const handleImprovementPress = (improvement) => {
    setCelebrationData(improvement);
    setShowCelebrationModal(true);
    
    // Bounce animation
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 1.1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    
    Vibration.vibrate(100);
  };

  const viewDetailedAnalytics = (improvement) => {
    Alert.alert(
      '📊 Detailed Analytics',
      `Activity: ${improvement.activity}\nImprovement: ${formatImprovement(improvement.improvement, improvement.improvementType)}\nDate: ${improvement.date}\n\n${improvement.notes}`,
      [
        { text: 'View Chart', onPress: () => Alert.alert('📈 Charts', 'Interactive charts coming soon!') },
        { text: 'Share Progress', onPress: () => Alert.alert('📤 Share', 'Share feature coming soon!') },
        { text: 'OK', style: 'cancel' }
      ]
    );
  };

  const filteredImprovements = improvementData.recentImprovements.filter(improvement => 
    selectedMetric === 'all' || improvement.metric === selectedMetric
  );

  const renderOverallStatsCard = () => (
    <Card style={styles.statsCard}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.statsGradient}>
        <View style={styles.statsHeader}>
          <Text style={styles.statsTitle}>📈 Improvement Summary</Text>
          <Animated.Text 
            style={[
              styles.sparkleText,
              {
                opacity: sparkleAnim,
                transform: [{
                  scale: sparkleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.2],
                  })
                }]
              }
            ]}
          >
            ✨
          </Animated.Text>
        </View>
        
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{improvementData.overallStats.totalImprovements}</Text>
            <Text style={styles.statLabel}>Total Improvements</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{improvementData.overallStats.personalBests}</Text>
            <Text style={styles.statLabel}>Personal Bests</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{improvementData.overallStats.improvementStreak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{improvementData.overallStats.averageImprovement.toFixed(1)}%</Text>
            <Text style={styles.statLabel}>Avg Improvement</Text>
          </View>
        </View>
      </LinearGradient>
    </Card>
  );

  const renderMilestoneCard = (milestone) => (
    <TouchableOpacity key={milestone.id} style={styles.milestoneCard}>
      <Surface style={[styles.milestone, { borderLeftColor: getMetricColor(milestone.category) }]}>
        <View style={styles.milestoneHeader}>
          <Text style={styles.milestoneBadge}>{milestone.badge}</Text>
          <Badge style={styles.pointsBadge}>+{milestone.points}</Badge>
        </View>
        <Text style={styles.milestoneTitle}>{milestone.title}</Text>
        <Text style={styles.milestoneDescription}>{milestone.achievement}</Text>
        <Text style={styles.milestoneDate}>{milestone.date}</Text>
      </Surface>
    </TouchableOpacity>
  );

  const renderImprovementCard = (improvement) => {
    const celebration = getCelebrationLevel(improvement.celebrationLevel);
    
    return (
      <Animated.View
        key={improvement.id}
        style={[
          styles.improvementCard,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: bounceAnim }
            ]
          }
        ]}
      >
        <TouchableOpacity onPress={() => handleImprovementPress(improvement)}>
          <Card style={[styles.card, improvement.isPersonalBest && styles.personalBestCard]}>
            <Card.Content>
              <View style={styles.improvementHeader}>
                <View style={styles.activityInfo}>
                  <Icon 
                    name={getMetricIcon(improvement.metric)} 
                    size={24} 
                    color={getMetricColor(improvement.metric)}
                  />
                  <View style={styles.activityDetails}>
                    <Text style={styles.activityName}>{improvement.activity}</Text>
                    <Text style={styles.activityCategory}>
                      {improvement.metric.toUpperCase()}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.improvementBadge}>
                  {improvement.isPersonalBest && (
                    <Surface style={styles.personalBestBadge}>
                      <Text style={styles.personalBestText}>PB!</Text>
                    </Surface>
                  )}
                  <Surface style={[styles.celebrationBadge, { backgroundColor: celebration.color }]}>
                    <Text style={styles.celebrationEmoji}>{celebration.emoji}</Text>
                  </Surface>
                </View>
              </View>

              <View style={styles.progressComparison}>
                <View style={styles.valueComparison}>
                  <View style={styles.valueBox}>
                    <Text style={styles.valueLabel}>Before</Text>
                    <Text style={styles.previousValue}>{improvement.previousValue}</Text>
                  </View>
                  <Icon name="trending-up" size={24} color={celebration.color} />
                  <View style={styles.valueBox}>
                    <Text style={styles.valueLabel}>After</Text>
                    <Text style={styles.currentValue}>{improvement.currentValue}</Text>
                  </View>
                </View>
                
                <Surface style={[styles.improvementChip, { backgroundColor: celebration.color }]}>
                  <Text style={styles.improvementText}>
                    {formatImprovement(improvement.improvement, improvement.improvementType)}
                  </Text>
                </Surface>
              </View>

              <View style={styles.improvementFooter}>
                <Text style={styles.improvementDate}>{improvement.date}</Text>
                <TouchableOpacity 
                  onPress={() => viewDetailedAnalytics(improvement)}
                  style={styles.analyticsButton}
                >
                  <Icon name="analytics" size={16} color={COLORS.primary} />
                  <Text style={styles.analyticsText}>Details</Text>
                </TouchableOpacity>
              </View>
            </Card.Content>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderMotivationalInsights = () => (
    <Card style={styles.insightsCard}>
      <Card.Content>
        <View style={styles.insightsHeader}>
          <Text style={styles.insightsTitle}>💡 Your Progress Insights</Text>
        </View>
        {improvementData.motivationalInsights.map((insight, index) => (
          <Surface key={index} style={styles.insightItem}>
            <Text style={styles.insightText}>{insight}</Text>
          </Surface>
        ))}
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} translucent />
      
      {/* Header */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Improvement Tracker 🚀</Text>
          <Text style={styles.headerSubtitle}>Celebrate every step forward!</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Overall Stats */}
        <View style={styles.section}>
          {renderOverallStatsCard()}
        </View>

        {/* Motivational Insights */}
        <View style={styles.section}>
          {renderMotivationalInsights()}
        </View>

        {/* Time Range Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⏰ Time Range</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeRangeScroll}>
            {timeRanges.map(range => (
              <Chip
                key={range.id}
                selected={selectedTimeRange === range.id}
                onPress={() => setSelectedTimeRange(range.id)}
                style={[
                  styles.timeRangeChip,
                  selectedTimeRange === range.id && { backgroundColor: COLORS.primary }
                ]}
                textStyle={[
                  styles.timeRangeText,
                  selectedTimeRange === range.id && { color: 'white' }
                ]}
              >
                {range.name}
              </Chip>
            ))}
          </ScrollView>
        </View>

        {/* Metric Filter */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Filter by Metric</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.metricScroll}>
            {improvementMetrics.map(metric => (
              <Chip
                key={metric.id}
                selected={selectedMetric === metric.id}
                onPress={() => setSelectedMetric(metric.id)}
                style={[
                  styles.metricChip,
                  selectedMetric === metric.id && { backgroundColor: metric.color }
                ]}
                textStyle={[
                  styles.metricText,
                  selectedMetric === metric.id && { color: 'white' }
                ]}
              >
                {metric.name}
              </Chip>
            ))}
          </ScrollView>
        </View>

        {/* Recent Milestones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Recent Milestones</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.milestonesScroll}>
            {improvementData.milestones.map(renderMilestoneCard)}
          </ScrollView>
        </View>

        {/* Recent Improvements */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              📈 Recent Improvements ({filteredImprovements.length})
            </Text>
            <IconButton
              icon="share"
              size={24}
              iconColor="white"
              containerColor={COLORS.primary}
              onPress={() => Alert.alert('📤 Share', 'Share your amazing progress!')}
            />
          </View>
          
          {filteredImprovements.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <Icon name="trending-up" size={48} color={COLORS.secondary} />
                <Text style={styles.emptyTitle}>No Improvements Yet</Text>
                <Text style={styles.emptySubtitle}>
                  Keep training and your improvements will show up here!
                </Text>
              </Card.Content>
            </Card>
          ) : (
            filteredImprovements.map(renderImprovementCard)
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Quick Add FAB */}
      <FAB
        icon="add-chart"
        style={styles.fab}
        onPress={() => Alert.alert('⚡ Quick Log', 'Quick improvement logging coming soon!')}
        color="white"
        customSize={56}
      />

      {/* Celebration Modal */}
      <Portal>
        <Modal
          visible={showCelebrationModal}
          onRequestClose={() => setShowCelebrationModal(false)}
          animationType="slide"
        >
          <BlurView style={styles.modalBlur} blurType="light" blurAmount={10}>
            <View style={styles.modalContainer}>
              {celebrationData && (
                <Card style={styles.celebrationModal}>
                  <LinearGradient 
                    colors={[getCelebrationLevel(celebrationData.celebrationLevel).color, '#764ba2']} 
                    style={styles.celebrationGradient}
                  >
                    <IconButton
                      icon="close"
                      iconColor="white"
                      size={24}
                      style={styles.closeButton}
                      onPress={() => setShowCelebrationModal(false)}
                    />
                    
                    <View style={styles.celebrationContent}>
                      <Animated.Text 
                        style={[
                          styles.celebrationEmoji,
                          {
                            transform: [{
                              scale: sparkleAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [1, 1.3],
                              })
                            }]
                          }
                        ]}
                      >
                        {getCelebrationLevel(celebrationData.celebrationLevel).emoji}
                      </Animated.Text>
                      
                      <Text style={styles.celebrationTitle}>Amazing Improvement!</Text>
                      <Text style={styles.celebrationActivity}>{celebrationData.activity}</Text>
                      
                      <View style={styles.celebrationProgress}>
                        <Text style={styles.celebrationFrom}>{celebrationData.previousValue}</Text>
                        <Icon name="trending-up" size={32} color="white" />
                        <Text style={styles.celebrationTo}>{celebrationData.currentValue}</Text>
                      </View>
                      
                      <Surface style={styles.celebrationImprovement}>
                        <Text style={styles.celebrationImprovementText}>
                          {formatImprovement(celebrationData.improvement, celebrationData.improvementType)} Better!
                        </Text>
                      </Surface>
                      
                      <Text style={styles.celebrationNotes}>{celebrationData.notes}</Text>
                      
                      <Button
                        mode="contained"
                        onPress={() => setShowCelebrationModal(false)}
                        style={styles.celebrationButton}
                        buttonColor="white"
                        textColor={getCelebrationLevel(celebrationData.celebrationLevel).color}
                      >
                        Keep Going! 🚀
                      </Button>
                    </View>
                  </LinearGradient>
                </Card>
              )}
            </View>
          </BlurView>
        </Modal>
      </Portal>
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
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.heading,
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'white',
    opacity: 0.9,
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.heading,
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  statsCard: {
    borderRadius: 16,
    elevation: 4,
    overflow: 'hidden',
    marginTop: SPACING.lg,
  },
  statsGradient: {
    padding: SPACING.lg,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  statsTitle: {
    ...TEXT_STYLES.heading,
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  sparkleText: {
    fontSize: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statBox: {
    width: '48%',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  statNumber: {
    ...TEXT_STYLES.heading,
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  insightsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    elevation: 2,
  },
  insightsHeader: {
    marginBottom: SPACING.md,
  },
  insightsTitle: {
    ...TEXT_STYLES.heading,
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  insightItem: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  insightText: {
    ...TEXT_STYLES.body,
    color: '#1565C0',
    fontSize: 14,
  },
  timeRangeScroll: {
    paddingVertical: SPACING.sm,
  },
  timeRangeChip: {
    marginRight: SPACING.sm,
    backgroundColor: 'white',
  },
  timeRangeText: {
    fontSize: 12,
  },
  metricScroll: {
    paddingVertical: SPACING.sm,
  },
  metricChip: {
    marginRight: SPACING.sm,
    backgroundColor: 'white',
  },
  metricText: {
    fontSize: 11,
  },
  milestonesScroll: {
    paddingVertical: SPACING.sm,
  },
  milestoneCard: {
    marginRight: SPACING.md,
  },
  milestone: {
    padding: SPACING.md,
    borderRadius: 12,
    minWidth: 200,
    backgroundColor: 'white',
    borderLeftWidth: 4,
    elevation: 2,
  },
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  milestoneBadge: {
    fontSize: 24,
  },
  pointsBadge: {
    backgroundColor: '#FFD700',
  },
  milestoneTitle: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  milestoneDescription: {
    ...TEXT_STYLES.caption,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  milestoneDate: {
    ...TEXT_STYLES.caption,
    color: COLORS.text.secondary,
    fontSize: 10,
  },
  improvementCard: {
    marginBottom: SPACING.md,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    elevation: 3,
  },
  personalBestCard: {
    borderColor: '#FFD700',
    borderWidth: 2,
  },
  improvementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  activityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityDetails: {
    marginLeft: SPACING.sm,
  },
  activityName: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    fontSize: 16,
  },
  activityCategory: {
    ...TEXT_STYLES.caption,
    color: COLORS.text.secondary,
    fontSize: 10,
    marginTop: 2,
  },
  improvementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  personalBestBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  personalBestText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  celebrationBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  celebrationEmoji: {
    fontSize: 16,
  },
  progressComparison: {
    marginBottom: SPACING.md,
  },
  valueComparison: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  valueBox: {
    alignItems: 'center',
    flex: 1,
  },
  valueLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.text.secondary,
    fontSize: 10,
  },
  previousValue: {
    ...TEXT_STYLES.body,
    color: COLORS.text.secondary,
    fontSize: 14,
    marginTop: 2,
  },
  currentValue: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.primary,
    fontSize: 14,
    marginTop: 2,
  },
  improvementChip: {
    alignSelf: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
  },
  improvementText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  improvementFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  improvementDate: {
    ...TEXT_STYLES.caption,
    color: COLORS.text.secondary,
  },
  analyticsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  analyticsText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  emptyCard: {
    backgroundColor: 'white',
    borderRadius: 16,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyTitle: {
    ...TEXT_STYLES.heading,
    marginTop: SPACING.md,
    color: COLORS.text.primary,
  },
  emptySubtitle: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    color: COLORS.text.secondary,
    marginTop: SPACING.sm,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  modalBlur: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  celebrationModal: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  celebrationGradient: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  celebrationContent: {
    alignItems: 'center',
    paddingTop: SPACING.lg,
  },
  celebrationEmoji: {
    fontSize: 60,
    marginBottom: SPACING.md,
  },
  celebrationTitle: {
    ...TEXT_STYLES.heading,
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  celebrationActivity: {
    ...TEXT_STYLES.body,
    color: 'white',
    opacity: 0.9,
    fontSize: 16,
    marginBottom: SPACING.lg,
  },
  celebrationProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  celebrationFrom: {
    ...TEXT_STYLES.body,
    color: 'white',
    opacity: 0.8,
    fontSize: 18,
  },
  celebrationTo: {
    ...TEXT_STYLES.heading,
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  celebrationImprovement: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 20,
    marginBottom: SPACING.lg,
  },
  celebrationImprovementText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  celebrationNotes: {
    ...TEXT_STYLES.body,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    fontSize: 14,
  },
  celebrationButton: {
    paddingHorizontal: SPACING.xl,
  },
});

export default ImprovementTrackingScreen;
