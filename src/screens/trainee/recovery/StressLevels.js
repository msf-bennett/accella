import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Dimensions,
  Alert,
  RefreshControl,
  Animated,
  TouchableOpacity,
  Vibration,
} from 'react-native';
import {
  Card,
  Button,
  ProgressBar,
  Avatar,
  Surface,
  Portal,
  Modal,
  Chip,
  IconButton,
  FAB,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from 'expo-blur';

// Design system imports
import { COLORS, SPACING, TEXT_STYLES } from '../../../constants/theme';

const { width: screenWidth } = Dimensions.get('window');

const StressLevels = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { stressData, loading } = useSelector(state => state.recovery);

  // State management
  const [currentStressLevel, setCurrentStressLevel] = useState(3);
  const [stressFactors, setStressFactors] = useState([]);
  const [showStressModal, setShowStressModal] = useState(false);
  const [weeklyTrend, setWeeklyTrend] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Stress level options
  const stressLevels = [
    { value: 1, label: '😌 Very Low', color: COLORS.success, description: 'Feeling calm and relaxed' },
    { value: 2, label: '🙂 Low', color: '#4CAF50', description: 'Slightly aware of stress' },
    { value: 3, label: '😐 Moderate', color: '#FF9800', description: 'Noticeable stress levels' },
    { value: 4, label: '😰 High', color: '#FF5722', description: 'Feeling quite stressed' },
    { value: 5, label: '😫 Very High', color: COLORS.error, description: 'Overwhelming stress' }
  ];

  // Common stress factors
  const stressFactorOptions = [
    { id: 'work', label: 'Work/School', icon: 'work' },
    { id: 'training', label: 'Training Load', icon: 'fitness-center' },
    { id: 'sleep', label: 'Poor Sleep', icon: 'bedtime' },
    { id: 'nutrition', label: 'Diet Issues', icon: 'restaurant' },
    { id: 'relationships', label: 'Relationships', icon: 'people' },
    { id: 'finances', label: 'Financial', icon: 'attach-money' },
    { id: 'health', label: 'Health Concerns', icon: 'healing' },
    { id: 'competition', label: 'Competition', icon: 'jump-rope' }
  ];

  // Sample data - replace with Redux data
  const mockWeeklyData = [
    { day: 'Mon', stress: 2, recovery: 85 },
    { day: 'Tue', stress: 3, recovery: 78 },
    { day: 'Wed', stress: 4, recovery: 65 },
    { day: 'Thu', stress: 3, recovery: 72 },
    { day: 'Fri', stress: 2, recovery: 80 },
    { day: 'Sat', stress: 1, recovery: 92 },
    { day: 'Sun', stress: 2, recovery: 88 }
  ];

  // Animation setup
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  // Handle refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Dispatch action to refresh stress data
      // await dispatch(refreshStressData());
      setTimeout(() => setRefreshing(false), 1000);
    } catch (error) {
      setRefreshing(false);
      Alert.alert('Error', 'Failed to refresh data');
    }
  }, [dispatch]);

  // Handle stress level logging
  const handleLogStress = useCallback(() => {
    Vibration.vibrate(50);
    const stressEntry = {
      level: currentStressLevel,
      factors: stressFactors,
      timestamp: new Date().toISOString(),
      userId: user?.id
    };

    try {
      // Dispatch action to log stress level
      // dispatch(logStressLevel(stressEntry));
      Alert.alert(
        '✅ Stress Level Logged',
        `Your stress level (${currentStressLevel}/5) has been recorded with ${stressFactors.length} contributing factors.`,
        [{ text: 'Great!', style: 'default' }]
      );
      setShowStressModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to log stress level');
    }
  }, [currentStressLevel, stressFactors, user, dispatch]);

  // Toggle stress factor
  const toggleStressFactor = useCallback((factorId) => {
    setStressFactors(prev => 
      prev.includes(factorId) 
        ? prev.filter(id => id !== factorId)
        : [...prev, factorId]
    );
  }, []);

  // Get stress level color
  const getStressColor = (level) => {
    const stressLevel = stressLevels.find(s => s.value === level);
    return stressLevel ? stressLevel.color : COLORS.primary;
  };

  // Calculate average stress
  const averageStress = mockWeeklyData.reduce((sum, day) => sum + day.stress, 0) / mockWeeklyData.length;

  // Render stress level selector
  const renderStressLevelSelector = () => (
    <View style={styles.stressLevelContainer}>
      <Text style={styles.modalTitle}>How stressed do you feel today?</Text>
      <Text style={styles.modalSubtitle}>Rate your overall stress level from 1-5</Text>
      
      <View style={styles.stressLevelsGrid}>
        {stressLevels.map((level) => (
          <TouchableOpacity
            key={level.value}
            style={[
              styles.stressLevelButton,
              currentStressLevel === level.value && { 
                backgroundColor: level.color + '20',
                borderColor: level.color,
                borderWidth: 2
              }
            ]}
            onPress={() => {
              setCurrentStressLevel(level.value);
              Vibration.vibrate(30);
            }}
          >
            <Text style={[styles.stressLevelEmoji, { color: level.color }]}>
              {level.label}
            </Text>
            <Text style={styles.stressLevelDescription}>
              {level.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Render stress factors
  const renderStressFactors = () => (
    <View style={styles.stressFactorsContainer}>
      <Text style={styles.modalTitle}>What's contributing to your stress?</Text>
      <Text style={styles.modalSubtitle}>Select all that apply (optional)</Text>
      
      <View style={styles.factorsGrid}>
        {stressFactorOptions.map((factor) => (
          <TouchableOpacity
            key={factor.id}
            style={[
              styles.factorChip,
              stressFactors.includes(factor.id) && styles.factorChipSelected
            ]}
            onPress={() => toggleStressFactor(factor.id)}
          >
            <Icon 
              name={factor.icon} 
              size={20} 
              color={stressFactors.includes(factor.id) ? COLORS.primary : '#666'} 
            />
            <Text style={[
              styles.factorText,
              stressFactors.includes(factor.id) && styles.factorTextSelected
            ]}>
              {factor.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Render trend chart
  const renderTrendChart = () => (
    <Card style={styles.trendCard}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.trendHeader}
      >
        <Text style={styles.trendTitle}>Weekly Stress Trend</Text>
        <Text style={styles.trendSubtitle}>
          Average: {averageStress.toFixed(1)}/5
        </Text>
      </LinearGradient>
      
      <View style={styles.chartContainer}>
        <View style={styles.chartGrid}>
          {mockWeeklyData.map((day, index) => (
            <View key={day.day} style={styles.chartBar}>
              <View style={styles.barContainer}>
                <View 
                  style={[
                    styles.stressBar,
                    { 
                      height: (day.stress / 5) * 80,
                      backgroundColor: getStressColor(day.stress)
                    }
                  ]} 
                />
              </View>
              <Text style={styles.chartDay}>{day.day}</Text>
              <Text style={styles.chartValue}>{day.stress}</Text>
            </View>
          ))}
        </View>
      </View>
    </Card>
  );

  // Render recommendations
  const renderRecommendations = () => (
    <Card style={styles.recommendationsCard}>
      <View style={styles.recommendationsHeader}>
        <Icon name="psychology" size={24} color={COLORS.primary} />
        <Text style={styles.recommendationsTitle}>AI Recommendations</Text>
      </View>
      
      <View style={styles.recommendationsList}>
        <View style={styles.recommendationItem}>
          <Icon name="self-improvement" size={20} color={COLORS.success} />
          <Text style={styles.recommendationText}>
            Try 5-10 minutes of deep breathing before training
          </Text>
        </View>
        
        <View style={styles.recommendationItem}>
          <Icon name="schedule" size={20} color={COLORS.secondary} />
          <Text style={styles.recommendationText}>
            Consider reducing training intensity by 10-15% today
          </Text>
        </View>
        
        <View style={styles.recommendationItem}>
          <Icon name="bedtime" size={20} color={COLORS.primary} />
          <Text style={styles.recommendationText}>
            Prioritize 8+ hours of sleep to improve stress recovery
          </Text>
        </View>
      </View>
    </Card>
  );

  // Render quick stats
  const renderQuickStats = () => (
    <View style={styles.statsContainer}>
      <Surface style={styles.statCard}>
        <Text style={styles.statValue}>
          {mockWeeklyData[mockWeeklyData.length - 1]?.stress || 0}
        </Text>
        <Text style={styles.statLabel}>Today's Level</Text>
        <Text style={styles.statEmoji}>😌</Text>
      </Surface>
      
      <Surface style={styles.statCard}>
        <Text style={styles.statValue}>{averageStress.toFixed(1)}</Text>
        <Text style={styles.statLabel}>Week Average</Text>
        <ProgressBar 
          progress={averageStress / 5} 
          color={getStressColor(Math.round(averageStress))}
          style={styles.statProgress}
        />
      </Surface>
      
      <Surface style={styles.statCard}>
        <Text style={styles.statValue}>
          {mockWeeklyData.filter(d => d.stress <= 2).length}
        </Text>
        <Text style={styles.statLabel}>Low Stress Days</Text>
        <Text style={styles.statEmoji}>✅</Text>
      </Surface>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar 
        translucent 
        backgroundColor="transparent" 
        barStyle="light-content" 
      />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Stress Levels</Text>
        <Text style={styles.headerSubtitle}>
          Monitor and manage your stress for better recovery 🧘‍♂️
        </Text>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
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
        <Animated.View 
          style={[
            styles.content,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }]
            }
          ]}
        >
          {renderQuickStats()}
          {renderTrendChart()}
          {renderRecommendations()}
          
          <Card style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>💡 Stress Management Tips</Text>
            <Text style={styles.tipItem}>• Regular exercise helps reduce cortisol levels</Text>
            <Text style={styles.tipItem}>• Practice mindfulness or meditation daily</Text>
            <Text style={styles.tipItem}>• Maintain consistent sleep schedule</Text>
            <Text style={styles.tipItem}>• Stay connected with supportive people</Text>
          </Card>
        </Animated.View>
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="add"
        label="Log Stress"
        onPress={() => setShowStressModal(true)}
        color={COLORS.background}
        customSize={56}
      />

      <Portal>
        <Modal
          visible={showStressModal}
          onDismiss={() => setShowStressModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView
            style={styles.blurView}
            blurType="light"
            blurAmount={10}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              {renderStressLevelSelector()}
              {renderStressFactors()}
              
              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={() => setShowStressModal(false)}
                  style={styles.cancelButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleLogStress}
                  style={styles.logButton}
                  buttonColor={COLORS.primary}
                >
                  Log Stress Level
                </Button>
              </View>
            </ScrollView>
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
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: COLORS.background,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.background + 'CC',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: 100,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    padding: SPACING.md,
    marginHorizontal: SPACING.xs,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    ...TEXT_STYLES.h2,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: '#666',
    textAlign: 'center',
  },
  statEmoji: {
    fontSize: 20,
    marginTop: SPACING.xs,
  },
  statProgress: {
    marginTop: SPACING.xs,
    width: '100%',
  },
  trendCard: {
    marginBottom: SPACING.lg,
    borderRadius: 16,
    overflow: 'hidden',
  },
  trendHeader: {
    padding: SPACING.md,
  },
  trendTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.background,
    marginBottom: SPACING.xs,
  },
  trendSubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.background + 'CC',
  },
  chartContainer: {
    padding: SPACING.md,
  },
  chartGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    height: 80,
    justifyContent: 'flex-end',
    marginBottom: SPACING.xs,
  },
  stressBar: {
    width: 20,
    borderRadius: 10,
    minHeight: 4,
  },
  chartDay: {
    ...TEXT_STYLES.caption,
    color: '#666',
    marginBottom: SPACING.xs,
  },
  chartValue: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  recommendationsCard: {
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderRadius: 16,
  },
  recommendationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  recommendationsTitle: {
    ...TEXT_STYLES.h3,
    marginLeft: SPACING.sm,
  },
  recommendationsList: {
    gap: SPACING.md,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    backgroundColor: COLORS.background + '40',
    borderRadius: 8,
  },
  recommendationText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  tipsCard: {
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderRadius: 16,
  },
  tipsTitle: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.md,
  },
  tipItem: {
    ...TEXT_STYLES.body,
    marginBottom: SPACING.sm,
    color: '#666',
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.md,
  },
  blurView: {
    borderRadius: 20,
    padding: SPACING.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    maxHeight: '90%',
  },
  stressLevelContainer: {
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    ...TEXT_STYLES.h2,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  modalSubtitle: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    color: '#666',
    marginBottom: SPACING.lg,
  },
  stressLevelsGrid: {
    gap: SPACING.sm,
  },
  stressLevelButton: {
    padding: SPACING.md,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  stressLevelEmoji: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  stressLevelDescription: {
    ...TEXT_STYLES.caption,
    color: '#666',
  },
  stressFactorsContainer: {
    marginBottom: SPACING.lg,
  },
  factorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  factorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  factorChipSelected: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
  },
  factorText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.xs,
    color: '#666',
  },
  factorTextSelected: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  cancelButton: {
    flex: 1,
  },
  logButton: {
    flex: 1,
  },
});

export default StressLevels;
