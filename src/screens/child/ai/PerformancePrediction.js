import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Alert,
  Animated,
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
  Modal,
  Badge,
  ActivityIndicator,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import established design system
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const PerformancePrediction = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [selectedMetric, setSelectedMetric] = useState('overall');
  const [predictionModal, setPredictionModal] = useState(false);
  const [goalModal, setGoalModal] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.9));
  const [chartAnim] = useState(new Animated.Value(0));
  const [predictionProgress, setPredictionProgress] = useState(0);

  const progressTimer = useRef();

  // Redux state
  const { user, isLoading } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    // Animate screen entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(chartAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: false,
      }),
    ]).start();

    return () => {
      clearInterval(progressTimer.current);
    };
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Vibration.vibrate(50);
    
    // Simulate AI prediction calculation
    setPredictionProgress(0);
    progressTimer.current = setInterval(() => {
      setPredictionProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressTimer.current);
          return 100;
        }
        return prev + 10;
      });
    }, 150);

    await new Promise(resolve => setTimeout(resolve, 2000));
    setRefreshing(false);
  }, []);

  const handleTimeframeChange = useCallback((timeframe) => {
    setSelectedTimeframe(timeframe);
    Vibration.vibrate(30);
    
    // Animate chart update
    Animated.sequence([
      Animated.timing(chartAnim, {
        toValue: 0.5,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(chartAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  const handleMetricChange = useCallback((metric) => {
    setSelectedMetric(metric);
    Vibration.vibrate(30);
  }, []);

  const handleShowPrediction = useCallback((prediction) => {
    setPredictionModal(true);
    Vibration.vibrate([50, 100, 50]);
  }, []);

  const handleSetGoal = useCallback(() => {
    setGoalModal(true);
    Vibration.vibrate(30);
  }, []);

  const handleAIInsight = useCallback((insight) => {
    const messages = {
      improvement: "🚀 Your AI Coach predicts amazing improvements ahead! Based on your current progress, you're going to smash your goals!",
      strength: "💪 Your strength is growing steadily! Keep up the great work and you'll see incredible results by next month!",
      endurance: "🏃‍♂️ Your endurance is improving faster than expected! You're becoming a real athlete superhero!",
      technique: "🎯 Your technique scores are getting better every day! Soon you'll be moving like a pro!"
    };

    Alert.alert(
      "🤖 AI Insight",
      messages[insight],
      [{ text: "That's awesome! 🌟", style: "default" }]
    );
  }, []);

  // Mock prediction data
  const currentStats = {
    overall: { current: 78, predicted: 85, trend: '+7', color: '#4ECDC4' },
    strength: { current: 72, predicted: 82, trend: '+10', color: '#FF6B6B' },
    endurance: { current: 84, predicted: 89, trend: '+5', color: '#45B7D1' },
    technique: { current: 69, predicted: 79, trend: '+10', color: '#96CEB4' },
    speed: { current: 75, predicted: 83, trend: '+8', color: '#FFD93D' }
  };

  const predictions = [
    {
      id: 1,
      title: "Next Week Prediction 📅",
      description: "You're going to have an amazing week!",
      metrics: [
        { name: "Overall Score", value: 85, improvement: "+7 points" },
        { name: "Training Days", value: 5, improvement: "+1 day" },
        { name: "Skill Level", value: "Intermediate", improvement: "Level up!" }
      ],
      confidence: 92,
      color: "#4ECDC4"
    },
    {
      id: 2,
      title: "Monthly Goal Achievement 🎯",
      description: "Your monthly goals look very achievable!",
      metrics: [
        { name: "Strength Gain", value: "+15%", improvement: "Excellent" },
        { name: "Endurance Boost", value: "+20%", improvement: "Outstanding" },
        { name: "Technique Score", value: 90, improvement: "+21 points" }
      ],
      confidence: 87,
      color: "#FF6B6B"
    },
    {
      id: 3,
      title: "Season End Forecast 🏆",
      description: "By season end, you'll be incredibly strong!",
      metrics: [
        { name: "Championship Ready", value: "Yes!", improvement: "Amazing!" },
        { name: "Skills Mastered", value: 8, improvement: "+5 skills" },
        { name: "Confidence Level", value: "High", improvement: "Superstar!" }
      ],
      confidence: 94,
      color: "#45B7D1"
    }
  ];

  const achievements = [
    { id: 1, name: "Week Streak", current: 3, target: 5, icon: "local-fire-department", color: "#FF6B6B" },
    { id: 2, name: "Skills Learned", current: 6, target: 10, icon: "star", color: "#FFD93D" },
    { id: 3, name: "Perfect Forms", current: 12, target: 20, icon: "verified", color: "#4ECDC4" },
    { id: 4, name: "Training Hours", current: 8, target: 15, icon: "timer", color: "#96CEB4" }
  ];

  const timeframes = [
    { key: 'week', label: 'This Week', icon: 'date-range' },
    { key: 'month', label: 'This Month', icon: 'calendar-month' },
    { key: 'season', label: 'Season', icon: 'event' }
  ];

  const metrics = [
    { key: 'overall', label: 'Overall', icon: 'trending-up' },
    { key: 'strength', label: 'Strength', icon: 'fitness-center' },
    { key: 'endurance', label: 'Endurance', icon: 'directions-run' },
    { key: 'technique', label: 'Technique', icon: 'precision-manufacturing' },
    { key: 'speed', label: 'Speed', icon: 'speed' }
  ];

  const getProgressColor = (current, predicted) => {
    const improvement = predicted - current;
    if (improvement >= 10) return '#4CAF50';
    if (improvement >= 5) return '#FFC107';
    return '#FF9800';
  };

  const formatPredictionText = (timeframe) => {
    const texts = {
      week: "This week you'll improve by",
      month: "This month you'll grow by",
      season: "This season you'll achieve"
    };
    return texts[timeframe] || "You'll improve by";
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Animated.View 
          style={[
            styles.headerContent,
            { 
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <View style={styles.headerTop}>
            <View style={styles.predictionInfo}>
              <Avatar.Icon 
                size={50} 
                icon="psychology"
                style={styles.predictionAvatar}
              />
              <View style={styles.predictionDetails}>
                <Text style={[TEXT_STYLES.h2, styles.headerTitle]}>
                  Performance Prediction 🔮
                </Text>
                <Text style={[TEXT_STYLES.body, styles.headerSubtitle]}>
                  AI-powered future insights!
                </Text>
              </View>
            </View>
            
            <Surface style={styles.confidenceBadge}>
              <Text style={styles.confidenceText}>94%</Text>
              <Text style={styles.confidenceLabel}>Accuracy</Text>
            </Surface>
          </View>

          {/* Prediction loading bar */}
          {refreshing && (
            <View style={styles.predictionLoading}>
              <Text style={styles.loadingText}>
                🤖 AI calculating your future performance...
              </Text>
              <ProgressBar
                progress={predictionProgress / 100}
                color="#FFD700"
                style={styles.loadingBar}
              />
            </View>
          )}
        </Animated.View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary, COLORS.secondary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Timeframe and Metric Selectors */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.sectionContainer}>
            <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
              📊 Choose Your View
            </Text>
            
            {/* Timeframe Selector */}
            <View style={styles.selectorContainer}>
              <Text style={styles.selectorLabel}>⏰ Time Period:</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.selectorScroll}
              >
                {timeframes.map((timeframe) => (
                  <TouchableOpacity
                    key={timeframe.key}
                    onPress={() => handleTimeframeChange(timeframe.key)}
                    activeOpacity={0.7}
                  >
                    <Surface
                      style={[
                        styles.selectorChip,
                        selectedTimeframe === timeframe.key && styles.selectedChip
                      ]}
                    >
                      <Icon 
                        name={timeframe.icon} 
                        size={20} 
                        color={selectedTimeframe === timeframe.key ? 'white' : COLORS.primary}
                      />
                      <Text
                        style={[
                          styles.selectorText,
                          selectedTimeframe === timeframe.key && styles.selectedText
                        ]}
                      >
                        {timeframe.label}
                      </Text>
                    </Surface>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Metric Selector */}
            <View style={styles.selectorContainer}>
              <Text style={styles.selectorLabel}>🎯 What to Track:</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.selectorScroll}
              >
                {metrics.map((metric) => (
                  <TouchableOpacity
                    key={metric.key}
                    onPress={() => handleMetricChange(metric.key)}
                    activeOpacity={0.7}
                  >
                    <Surface
                      style={[
                        styles.selectorChip,
                        selectedMetric === metric.key && styles.selectedChip
                      ]}
                    >
                      <Icon 
                        name={metric.icon} 
                        size={20} 
                        color={selectedMetric === metric.key ? 'white' : COLORS.primary}
                      />
                      <Text
                        style={[
                          styles.selectorText,
                          selectedMetric === metric.key && styles.selectedText
                        ]}
                      >
                        {metric.label}
                      </Text>
                    </Surface>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Animated.View>

        {/* Current Prediction Display */}
        <Animated.View 
          style={{
            opacity: fadeAnim,
            transform: [{ scale: chartAnim }]
          }}
        >
          <Card style={styles.predictionCard}>
            <LinearGradient
              colors={[currentStats[selectedMetric].color, `${currentStats[selectedMetric].color}80`]}
              style={styles.predictionGradient}
            >
              <View style={styles.predictionContent}>
                <View style={styles.predictionHeader}>
                  <Text style={[TEXT_STYLES.h3, styles.predictionTitle]}>
                    {metrics.find(m => m.key === selectedMetric)?.label} Prediction
                  </Text>
                  <Text style={[TEXT_STYLES.body, styles.predictionSubtitle]}>
                    {formatPredictionText(selectedTimeframe)} {currentStats[selectedMetric].trend} points! 🚀
                  </Text>
                </View>

                <View style={styles.scoreComparison}>
                  <View style={styles.scoreItem}>
                    <Text style={styles.scoreLabel}>Current</Text>
                    <Text style={styles.scoreValue}>
                      {currentStats[selectedMetric].current}
                    </Text>
                  </View>
                  
                  <Icon name="trending-up" size={32} color="white" style={styles.trendIcon} />
                  
                  <View style={styles.scoreItem}>
                    <Text style={styles.scoreLabel}>Predicted</Text>
                    <Text style={styles.scoreValue}>
                      {currentStats[selectedMetric].predicted}
                    </Text>
                  </View>
                </View>

                <View style={styles.improvementSection}>
                  <Text style={styles.improvementText}>
                    🎯 Improvement: {currentStats[selectedMetric].trend} points
                  </Text>
                  <ProgressBar
                    progress={currentStats[selectedMetric].predicted / 100}
                    color="white"
                    style={styles.improvementBar}
                  />
                </View>
              </View>
            </LinearGradient>
          </Card>
        </Animated.View>

        {/* Future Predictions */}
        <View style={styles.sectionContainer}>
          <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
            🔮 Future Predictions
          </Text>
          {predictions.map((prediction, index) => (
            <Animated.View
              key={prediction.id}
              style={{
                opacity: fadeAnim,
                transform: [{
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  })
                }]
              }}
            >
              <TouchableOpacity
                onPress={() => handleShowPrediction(prediction)}
                activeOpacity={0.7}
              >
                <Card style={[styles.futurePredictionCard, { marginTop: index > 0 ? SPACING.md : 0 }]}>
                  <View style={styles.futurePredictionContent}>
                    <LinearGradient
                      colors={[prediction.color, `${prediction.color}80`]}
                      style={styles.predictionIconContainer}
                    >
                      <Icon name="auto-awesome" size={24} color="white" />
                    </LinearGradient>
                    
                    <View style={styles.futurePredictionInfo}>
                      <Text style={[TEXT_STYLES.h4, styles.futurePredictionTitle]}>
                        {prediction.title}
                      </Text>
                      <Text style={[TEXT_STYLES.body, styles.futurePredictionDesc]}>
                        {prediction.description}
                      </Text>
                      
                      <View style={styles.confidenceSection}>
                        <Surface style={styles.confidenceChip}>
                          <Text style={styles.confidenceChipText}>
                            {prediction.confidence}% confident 🎯
                          </Text>
                        </Surface>
                      </View>
                    </View>

                    <IconButton
                      icon="arrow-forward"
                      iconColor={prediction.color}
                      size={20}
                      onPress={() => handleShowPrediction(prediction)}
                    />
                  </View>
                </Card>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* Goal Progress */}
        <View style={styles.sectionContainer}>
          <View style={styles.goalHeader}>
            <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
              🏆 Goal Progress
            </Text>
            <Button
              mode="outlined"
              onPress={handleSetGoal}
              style={styles.setGoalButton}
              labelStyle={styles.setGoalText}
            >
              Set New Goal 🎯
            </Button>
          </View>

          <View style={styles.achievementsGrid}>
            {achievements.map((achievement, index) => (
              <Animated.View
                key={achievement.id}
                style={{
                  opacity: fadeAnim,
                  transform: [{
                    scale: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    })
                  }]
                }}
              >
                <Card style={styles.achievementCard}>
                  <View style={styles.achievementContent}>
                    <Surface style={[
                      styles.achievementIcon,
                      { backgroundColor: `${achievement.color}20` }
                    ]}>
                      <Icon name={achievement.icon} size={24} color={achievement.color} />
                    </Surface>
                    
                    <Text style={[TEXT_STYLES.body, styles.achievementName]}>
                      {achievement.name}
                    </Text>
                    
                    <Text style={styles.achievementProgress}>
                      {achievement.current}/{achievement.target}
                    </Text>
                    
                    <ProgressBar
                      progress={achievement.current / achievement.target}
                      color={achievement.color}
                      style={styles.achievementBar}
                    />
                    
                    <Text style={styles.achievementPercent}>
                      {Math.round((achievement.current / achievement.target) * 100)}%
                    </Text>
                  </View>
                </Card>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* AI Insights */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.sectionContainer}>
            <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
              🧠 AI Insights
            </Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.insightsContainer}
            >
              {[
                { key: 'improvement', title: 'Growth Prediction 📈', color: '#4ECDC4' },
                { key: 'strength', title: 'Strength Forecast 💪', color: '#FF6B6B' },
                { key: 'endurance', title: 'Endurance Outlook 🏃‍♂️', color: '#45B7D1' },
                { key: 'technique', title: 'Skill Development 🎯', color: '#96CEB4' }
              ].map((insight) => (
                <TouchableOpacity
                  key={insight.key}
                  onPress={() => handleAIInsight(insight.key)}
                  activeOpacity={0.7}
                >
                  <Surface style={styles.insightCard}>
                    <LinearGradient
                      colors={[insight.color, `${insight.color}80`]}
                      style={styles.insightGradient}
                    >
                      <Icon name="psychology" size={28} color="white" />
                      <Text style={styles.insightTitle}>{insight.title}</Text>
                      <Text style={styles.insightSubtitle}>Tap for details</Text>
                    </LinearGradient>
                  </Surface>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Prediction Details Modal */}
      <Portal>
        <Modal
          visible={predictionModal}
          onDismiss={() => setPredictionModal(false)}
          contentContainerStyle={styles.predictionDetailsModal}
        >
          <View style={styles.modalHeader}>
            <Text style={[TEXT_STYLES.h3, styles.modalTitle]}>
              🔮 Prediction Details
            </Text>
            <IconButton
              icon="close"
              size={24}
              onPress={() => setPredictionModal(false)}
            />
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Text style={[TEXT_STYLES.body, styles.modalDescription]}>
              🤖 Your AI Coach has analyzed your training patterns and predicts amazing results ahead! Here's what the future holds:
            </Text>
            
            <View style={styles.predictionMetrics}>
              <Text style={[TEXT_STYLES.h4, styles.metricsTitle]}>
                📊 Predicted Improvements:
              </Text>
              {/* Mock metrics would be displayed here */}
              <View style={styles.metricItem}>
                <Text style={styles.metricName}>• Overall Performance: +12%</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricName}>• Strength Gains: +15%</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricName}>• Technique Score: +8 points</Text>
              </View>
            </View>
            
            <Button
              mode="contained"
              style={styles.modalButton}
              onPress={() => setPredictionModal(false)}
            >
              Awesome! Let's make it happen! 🚀
            </Button>
          </ScrollView>
        </Modal>
      </Portal>

      {/* Goal Setting Modal */}
      <Portal>
        <Modal
          visible={goalModal}
          onDismiss={() => setGoalModal(false)}
          contentContainerStyle={styles.goalModal}
        >
          <View style={styles.modalHeader}>
            <Text style={[TEXT_STYLES.h3, styles.modalTitle]}>
              🎯 Set New Goal
            </Text>
            <IconButton
              icon="close"
              size={24}
              onPress={() => setGoalModal(false)}
            />
          </View>
          
          <View style={styles.modalContent}>
            <Text style={[TEXT_STYLES.body, styles.modalDescription]}>
              🌟 What would you like to achieve next? Your AI Coach will help you create a personalized plan!
            </Text>
            
            <View style={styles.goalOptions}>
              {[
                "🏃‍♂️ Run faster",
                "💪 Get stronger", 
                "🎯 Perfect my technique",
                "⚡ Build endurance",
                "🏆 Win competitions"
              ].map((goal, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.goalOption}
                  onPress={() => {
                    Alert.alert("Goal Set! 🎉", `Great choice! Your AI Coach will help you ${goal.slice(2)}!`);
                    setGoalModal(false);
                  }}
                >
                  <Text style={styles.goalOptionText}>{goal}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Button
              mode="outlined"
              style={styles.modalButton}
              onPress={() => setGoalModal(false)}
            >
              I'll think about it 🤔
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* Floating Action Button */}
      <FAB
        icon="auto-awesome"
        label="New Prediction"
        style={styles.fab}
        onPress={onRefresh}
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
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  predictionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  predictionAvatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  predictionDetails: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  headerTitle: {
    color: 'white',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'white',
    opacity: 0.9,
    marginTop: SPACING.xs,
  },
  confidenceBadge: {
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  confidenceText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  confidenceLabel: {
    color: 'white',
    fontSize: 10,
    opacity: 0.8,
  },
  predictionLoading: {
    marginTop: SPACING.md,
  },
  loadingText: {
    color: 'white',
    fontSize: 12,
    marginBottom: SPACING.xs,
    opacity: 0.9,
  },
  loadingBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  sectionContainer: {
    marginBottom: SPACING.xl,
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
    color: COLORS.text,
  },
  selectorContainer: {
    marginBottom: SPACING.md,
  },
  selectorLabel: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: SPACING.xs,
    fontWeight: '600',
  },
  selectorScroll: {
    flexDirection: 'row',
  },
  selectorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: 25,
    backgroundColor: 'white',
    elevation: 2,
  },
  selectedChip: {
    backgroundColor: COLORS.primary,
  },
  selectorText: {
    marginLeft: SPACING.xs,
    color: COLORS.primary,
    fontSize: 12,
  },
  selectedText: {
    color: 'white',
  },
  predictionCard: {
    marginBottom: SPACING.lg,
    elevation: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  predictionGradient: {
    padding: SPACING.xl,
  },
  predictionContent: {
    alignItems: 'center',
  },
  predictionHeader: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  predictionTitle: {
    color: 'white',
    marginBottom: SPACING.xs,
  },
  predictionSubtitle: {
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
  },
  scoreComparison: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: SPACING.lg,
  },
  scoreItem: {
    alignItems: 'center',
    },
  scoreLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginBottom: SPACING.xs,
  },
  scoreValue: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  trendIcon: {
    opacity: 0.8,
  },
  improvementSection: {
    width: '100%',
    alignItems: 'center',
  },
  improvementText: {
    color: 'white',
    fontSize: 14,
    marginBottom: SPACING.sm,
    fontWeight: '600',
  },
  improvementBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    width: '100%',
  },
  futurePredictionCard: {
    elevation: 4,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  futurePredictionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  predictionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  futurePredictionInfo: {
    flex: 1,
  },
  futurePredictionTitle: {
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  futurePredictionDesc: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  confidenceSection: {
    marginTop: SPACING.xs,
  },
  confidenceChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    backgroundColor: COLORS.background,
  },
  confidenceChipText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  setGoalButton: {
    borderColor: COLORS.primary,
  },
  setGoalText: {
    fontSize: 12,
    color: COLORS.primary,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementCard: {
    width: (width - SPACING.lg * 3) / 2,
    marginBottom: SPACING.md,
    elevation: 3,
    borderRadius: 12,
  },
  achievementContent: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  achievementName: {
    textAlign: 'center',
    marginBottom: SPACING.xs,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  achievementProgress: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  achievementBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.background,
    width: '100%',
    marginBottom: SPACING.xs,
  },
  achievementPercent: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  insightsContainer: {
    marginTop: SPACING.sm,
  },
  insightCard: {
    width: 150,
    height: 120,
    marginRight: SPACING.md,
    borderRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  insightGradient: {
    flex: 1,
    padding: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightTitle: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  insightSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    textAlign: 'center',
  },
  predictionDetailsModal: {
    backgroundColor: 'white',
    margin: SPACING.lg,
    borderRadius: 16,
    maxHeight: height * 0.8,
  },
  goalModal: {
    backgroundColor: 'white',
    margin: SPACING.lg,
    borderRadius: 16,
    maxHeight: height * 0.7,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    color: COLORS.text,
  },
  modalContent: {
    padding: SPACING.lg,
  },
  modalDescription: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  predictionMetrics: {
    marginBottom: SPACING.lg,
  },
  metricsTitle: {
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  metricItem: {
    paddingVertical: SPACING.sm,
  },
  metricName: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  modalButton: {
    marginTop: SPACING.lg,
  },
  goalOptions: {
    marginBottom: SPACING.lg,
  },
  goalOption: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  goalOptionText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default PerformancePrediction;