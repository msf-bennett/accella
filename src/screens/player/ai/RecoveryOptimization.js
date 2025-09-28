import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Dimensions,
  Alert,
  Animated,
  Vibration,
} from 'react-native';
import { 
  Card,
  Button,
  Text,
  Surface,
  ProgressBar,
  Chip,
  Avatar,
  IconButton,
  FAB,
  Portal,
  Modal,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const RecoveryOptimization = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, recoveryData } = useSelector(state => ({
    user: state.auth.user,
    recoveryData: state.recovery.data,
  }));

  const [refreshing, setRefreshing] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recoveryScore, setRecoveryScore] = useState(75);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Mock recovery data - replace with actual Redux state
  const recoveryMetrics = {
    sleep: { hours: 7.5, quality: 'Good', score: 80 },
    hrv: { value: 42, status: 'Optimal', trend: 'up' },
    restingHR: { value: 58, status: 'Good', trend: 'stable' },
    stress: { level: 'Low', score: 85 },
    hydration: { level: 75, target: 100 },
    nutrition: { score: 72, status: 'Good' },
  };

  const aiRecommendations = [
    {
      id: 1,
      type: 'sleep',
      priority: 'high',
      title: '🌙 Optimize Sleep Window',
      description: 'Based on your HRV patterns, aim for 8+ hours tonight',
      action: 'Set bedtime reminder',
      points: 50,
    },
    {
      id: 2,
      type: 'nutrition',
      priority: 'medium',
      title: '🥤 Post-Workout Nutrition',
      description: 'Consume protein within 30min after training',
      action: 'View meal suggestions',
      points: 30,
    },
    {
      id: 3,
      type: 'active',
      priority: 'medium',
      title: '🧘 Active Recovery',
      description: '15min gentle yoga recommended today',
      action: 'Start session',
      points: 25,
    },
  ];

  const recoveryActivities = [
    { id: 1, name: 'Stretching', duration: '15 min', icon: 'self-improvement', completed: false },
    { id: 2, name: 'Foam Rolling', duration: '10 min', icon: 'fitness-center', completed: true },
    { id: 3, name: 'Meditation', duration: '20 min', icon: 'psychology', completed: false },
    { id: 4, name: 'Ice Bath', duration: '5 min', icon: 'ac-unit', completed: false },
  ];

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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      // dispatch(fetchRecoveryData());
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh recovery data');
    }
    setRefreshing(false);
  }, []);

  const handleMetricPress = (metric) => {
    Vibration.vibrate(50);
    setSelectedMetric(metric);
    // Navigate to detailed metric view or show modal
  };

  const handleRecommendationAction = (recommendation) => {
    Vibration.vibrate(50);
    switch (recommendation.type) {
      case 'sleep':
        Alert.alert(
          '🌙 Sleep Optimization',
          'Setting bedtime reminder for optimal recovery window',
          [{ text: 'OK', onPress: () => {} }]
        );
        break;
      case 'nutrition':
        Alert.alert('Feature Coming Soon', 'Meal suggestions will be available soon!');
        break;
      case 'active':
        Alert.alert('Feature Coming Soon', 'Guided recovery sessions coming soon!');
        break;
    }
  };

  const toggleActivity = (activityId) => {
    Vibration.vibrate(50);
    // dispatch(updateRecoveryActivity(activityId));
  };

  const getScoreColor = (score) => {
    if (score >= 80) return COLORS.success;
    if (score >= 60) return '#FFA726';
    return COLORS.error;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return COLORS.error;
      case 'medium': return '#FFA726';
      default: return COLORS.primary;
    }
  };

  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.header}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.headerContent}>
        <View>
          <Text style={styles.headerTitle}>Recovery Center 🔋</Text>
          <Text style={styles.headerSubtitle}>AI-Powered Optimization</Text>
        </View>
        <View style={styles.recoveryScoreContainer}>
          <Text style={styles.recoveryScoreLabel}>Recovery Score</Text>
          <Text style={styles.recoveryScoreValue}>{recoveryScore}%</Text>
        </View>
      </View>
    </LinearGradient>
  );

  const renderMetricsGrid = () => (
    <Card style={styles.metricsCard}>
      <Card.Content>
        <Text style={styles.sectionTitle}>📊 Today's Metrics</Text>
        <View style={styles.metricsGrid}>
          <Surface style={[styles.metricCard, { backgroundColor: getScoreColor(recoveryMetrics.sleep.score) + '20' }]}>
            <Icon name="bedtime" size={24} color={COLORS.primary} />
            <Text style={styles.metricValue}>{recoveryMetrics.sleep.hours}h</Text>
            <Text style={styles.metricLabel}>Sleep</Text>
            <Text style={styles.metricStatus}>{recoveryMetrics.sleep.quality}</Text>
          </Surface>

          <Surface style={[styles.metricCard, { backgroundColor: COLORS.success + '20' }]}>
            <Icon name="favorite" size={24} color={COLORS.error} />
            <Text style={styles.metricValue}>{recoveryMetrics.hrv.value}ms</Text>
            <Text style={styles.metricLabel}>HRV</Text>
            <Text style={styles.metricStatus}>{recoveryMetrics.hrv.status}</Text>
          </Surface>

          <Surface style={[styles.metricCard, { backgroundColor: COLORS.primary + '20' }]}>
            <Icon name="monitor-heart" size={24} color={COLORS.error} />
            <Text style={styles.metricValue}>{recoveryMetrics.restingHR.value}</Text>
            <Text style={styles.metricLabel}>Resting HR</Text>
            <Text style={styles.metricStatus}>{recoveryMetrics.restingHR.status}</Text>
          </Surface>

          <Surface style={[styles.metricCard, { backgroundColor: '#FFA726' + '20' }]}>
            <Icon name="psychology" size={24} color="#FFA726" />
            <Text style={styles.metricValue}>{recoveryMetrics.stress.score}%</Text>
            <Text style={styles.metricLabel}>Stress</Text>
            <Text style={styles.metricStatus}>{recoveryMetrics.stress.level}</Text>
          </Surface>
        </View>
      </Card.Content>
    </Card>
  );

  const renderAIRecommendations = () => (
    <Card style={styles.recommendationsCard}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🤖 AI Recommendations</Text>
          <Chip
            mode="outlined"
            compact
            textStyle={{ fontSize: 12 }}
            style={{ backgroundColor: COLORS.primary + '10' }}
          >
            Personalized
          </Chip>
        </View>
        
        {aiRecommendations.map((rec, index) => (
          <Surface key={rec.id} style={styles.recommendationCard}>
            <View style={styles.recommendationContent}>
              <View style={styles.recommendationHeader}>
                <Text style={styles.recommendationTitle}>{rec.title}</Text>
                <Chip
                  mode="flat"
                  compact
                  textStyle={{ fontSize: 10, color: 'white' }}
                  style={{ backgroundColor: getPriorityColor(rec.priority) }}
                >
                  {rec.priority}
                </Chip>
              </View>
              <Text style={styles.recommendationDescription}>{rec.description}</Text>
              <View style={styles.recommendationActions}>
                <Button
                  mode="contained"
                  compact
                  onPress={() => handleRecommendationAction(rec)}
                  style={styles.actionButton}
                  contentStyle={{ paddingVertical: 2 }}
                >
                  {rec.action}
                </Button>
                <Text style={styles.pointsText}>+{rec.points} pts</Text>
              </View>
            </View>
          </Surface>
        ))}
      </Card.Content>
    </Card>
  );

  const renderHydrationNutrition = () => (
    <Card style={styles.wellnessCard}>
      <Card.Content>
        <Text style={styles.sectionTitle}>💧 Wellness Tracking</Text>
        
        <View style={styles.wellnessItem}>
          <View style={styles.wellnessHeader}>
            <Icon name="opacity" size={24} color={COLORS.primary} />
            <Text style={styles.wellnessLabel}>Hydration</Text>
            <Text style={styles.wellnessValue}>{recoveryMetrics.hydration.level}%</Text>
          </View>
          <ProgressBar
            progress={recoveryMetrics.hydration.level / 100}
            color={COLORS.primary}
            style={styles.progressBar}
          />
        </View>

        <View style={styles.wellnessItem}>
          <View style={styles.wellnessHeader}>
            <Icon name="restaurant" size={24} color={COLORS.success} />
            <Text style={styles.wellnessLabel}>Nutrition Score</Text>
            <Text style={styles.wellnessValue}>{recoveryMetrics.nutrition.score}%</Text>
          </View>
          <ProgressBar
            progress={recoveryMetrics.nutrition.score / 100}
            color={COLORS.success}
            style={styles.progressBar}
          />
        </View>

        <Button
          mode="outlined"
          icon="add"
          onPress={() => Alert.alert('Feature Coming Soon', 'Manual entry will be available soon!')}
          style={styles.logButton}
        >
          Log Water & Meals
        </Button>
      </Card.Content>
    </Card>
  );

  const renderRecoveryActivities = () => (
    <Card style={styles.activitiesCard}>
      <Card.Content>
        <Text style={styles.sectionTitle}>⚡ Recovery Activities</Text>
        
        {recoveryActivities.map((activity) => (
          <Surface key={activity.id} style={styles.activityItem}>
            <View style={styles.activityContent}>
              <Icon 
                name={activity.icon} 
                size={24} 
                color={activity.completed ? COLORS.success : COLORS.primary} 
              />
              <View style={styles.activityInfo}>
                <Text style={[
                  styles.activityName,
                  activity.completed && { textDecorationLine: 'line-through', opacity: 0.6 }
                ]}>
                  {activity.name}
                </Text>
                <Text style={styles.activityDuration}>{activity.duration}</Text>
              </View>
            </View>
            <IconButton
              icon={activity.completed ? "check-circle" : "radio-button-unchecked"}
              size={24}
              iconColor={activity.completed ? COLORS.success : COLORS.primary}
              onPress={() => toggleActivity(activity.id)}
            />
          </Surface>
        ))}

        <Button
          mode="contained"
          icon="play-arrow"
          onPress={() => Alert.alert('Feature Coming Soon', 'Guided recovery sessions coming soon!')}
          style={styles.startButton}
        >
          Start Guided Recovery
        </Button>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <Animated.View 
        style={[
          styles.content, 
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
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
          {renderHeader()}
          
          <View style={styles.cardsContainer}>
            {renderMetricsGrid()}
            {renderAIRecommendations()}
            {renderHydrationNutrition()}
            {renderRecoveryActivities()}
            
            {/* Bottom spacing */}
            <View style={{ height: 100 }} />
          </View>
        </ScrollView>
      </Animated.View>

      <FAB
        icon="insights"
        style={styles.fab}
        onPress={() => Alert.alert('Feature Coming Soon', 'Advanced analytics coming soon!')}
        color="white"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: SPACING.xs,
  },
  recoveryScoreContainer: {
    alignItems: 'center',
  },
  recoveryScoreLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  recoveryScoreValue: {
    ...TEXT_STYLES.h1,
    color: 'white',
    fontWeight: 'bold',
  },
  cardsContainer: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
    color: COLORS.text,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  metricsCard: {
    marginBottom: SPACING.md,
    elevation: 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: (SCREEN_WIDTH - SPACING.md * 4) / 2,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  metricValue: {
    ...TEXT_STYLES.h2,
    fontWeight: 'bold',
    marginTop: SPACING.xs,
    color: COLORS.text,
  },
  metricLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  metricStatus: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    marginTop: 2,
    color: COLORS.success,
  },
  recommendationsCard: {
    marginBottom: SPACING.md,
    elevation: 4,
  },
  recommendationCard: {
    marginBottom: SPACING.sm,
    padding: SPACING.md,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: 'white',
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  recommendationTitle: {
    ...TEXT_STYLES.subtitle,
    fontWeight: '600',
    flex: 1,
    color: COLORS.text,
  },
  recommendationDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  recommendationActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    borderRadius: 8,
  },
  pointsText: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    color: COLORS.primary,
  },
  wellnessCard: {
    marginBottom: SPACING.md,
    elevation: 4,
  },
  wellnessItem: {
    marginBottom: SPACING.md,
  },
  wellnessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  wellnessLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '500',
    marginLeft: SPACING.sm,
    flex: 1,
    color: COLORS.text,
  },
  wellnessValue: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  logButton: {
    marginTop: SPACING.sm,
    borderColor: COLORS.primary,
  },
  activitiesCard: {
    marginBottom: SPACING.md,
    elevation: 4,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
    borderRadius: 8,
    elevation: 1,
    backgroundColor: 'white',
  },
  activityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityInfo: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  activityName: {
    ...TEXT_STYLES.body,
    fontWeight: '500',
    color: COLORS.text,
  },
  activityDuration: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  startButton: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.success,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default RecoveryOptimization;