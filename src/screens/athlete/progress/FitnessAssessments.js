import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  Alert,
  StatusBar,
  Animated,
  Vibration,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { 
  Text,
  Card,
  Button,
  Chip,
  ProgressBar,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Searchbar,
  Divider,
  Portal,
  Modal,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TEXT_STYLES } from '../../constants/theme';

const { width: screenWidth } = Dimensions.get('window');

const FitnessAssessment = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, assessments, loading } = useSelector(state => state.athlete);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [showTestModal, setShowTestModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);

  useEffect(() => {
    // Entrance animation
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

    loadFitnessAssessments();
  }, []);

  const loadFitnessAssessments = useCallback(async () => {
    try {
      // Simulate API call - replace with actual Redux action
      // dispatch(fetchFitnessAssessments());
      console.log('Loading fitness assessments...');
    } catch (error) {
      Alert.alert('Error', 'Failed to load fitness assessments');
    }
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFitnessAssessments();
    Vibration.vibrate(50);
    setRefreshing(false);
  }, [loadFitnessAssessments]);

  const handleStartTest = (test) => {
    Vibration.vibrate(30);
    setSelectedTest(test);
    setShowTestModal(true);
  };

  const handleViewHistory = (testType) => {
    Vibration.vibrate(30);
    navigation.navigate('AssessmentHistory', { testType });
  };

  // Mock data - replace with actual data from Redux store
  const mockAssessments = [
    {
      id: '1',
      name: '40m Sprint',
      category: 'speed',
      icon: 'flash-on',
      unit: 'seconds',
      description: 'Maximum speed test over 40 meters',
      lastResult: 5.2,
      bestResult: 4.9,
      target: 4.8,
      lastTestDate: '2024-03-10',
      trend: 'improving',
      percentile: 85,
      difficulty: 'medium'
    },
    {
      id: '2',
      name: 'Vertical Jump',
      category: 'power',
      icon: 'trending-up',
      unit: 'cm',
      description: 'Explosive leg power measurement',
      lastResult: 65,
      bestResult: 68,
      target: 70,
      lastTestDate: '2024-03-08',
      trend: 'stable',
      percentile: 78,
      difficulty: 'easy'
    },
    {
      id: '3',
      name: 'Beep Test',
      category: 'endurance',
      icon: 'directions-run',
      unit: 'level',
      description: 'Progressive shuttle run test',
      lastResult: 12.4,
      bestResult: 13.1,
      target: 14.0,
      lastTestDate: '2024-03-05',
      trend: 'declining',
      percentile: 72,
      difficulty: 'hard'
    },
    {
      id: '4',
      name: 'Sit & Reach',
      category: 'flexibility',
      icon: 'accessibility',
      unit: 'cm',
      description: 'Hamstring and lower back flexibility',
      lastResult: 28,
      bestResult: 30,
      target: 32,
      lastTestDate: '2024-03-12',
      trend: 'improving',
      percentile: 65,
      difficulty: 'easy'
    },
    {
      id: '5',
      name: 'Push-ups (1 min)',
      category: 'strength',
      icon: 'fitness-center',
      unit: 'reps',
      description: 'Upper body muscular endurance',
      lastResult: 52,
      bestResult: 58,
      target: 60,
      lastTestDate: '2024-03-07',
      trend: 'stable',
      percentile: 82,
      difficulty: 'medium'
    },
    {
      id: '6',
      name: 'Agility T-Test',
      category: 'agility',
      icon: 'shuffle',
      unit: 'seconds',
      description: 'Change of direction speed',
      lastResult: 9.8,
      bestResult: 9.2,
      target: 9.0,
      lastTestDate: '2024-03-09',
      trend: 'improving',
      percentile: 75,
      difficulty: 'hard'
    }
  ];

  const assessments_data = assessments || mockAssessments;

  const filteredAssessments = assessments_data.filter(assessment => {
    const matchesSearch = assessment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         assessment.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || assessment.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'improving': return COLORS.success;
      case 'declining': return COLORS.error;
      case 'stable': return COLORS.secondary;
      default: return COLORS.text.secondary;
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving': return 'trending-up';
      case 'declining': return 'trending-down';
      case 'stable': return 'trending-flat';
      default: return 'remove';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return COLORS.success;
      case 'medium': return COLORS.secondary;
      case 'hard': return COLORS.error;
      default: return COLORS.text.secondary;
    }
  };

  const getProgressToTarget = (lastResult, target, unit) => {
    if (!lastResult || !target) return 0;
    
    // For time-based measurements (lower is better)
    if (unit === 'seconds') {
      if (lastResult <= target) return 1;
      const maxTime = target * 1.5;
      return Math.max(0, 1 - (lastResult - target) / (maxTime - target));
    }
    
    // For other measurements (higher is better)
    return Math.min(1, lastResult / target);
  };

  const renderOverviewStats = () => {
    const totalTests = assessments_data.length;
    const testsThisMonth = assessments_data.filter(a => {
      const testDate = new Date(a.lastTestDate);
      const now = new Date();
      const monthDiff = (now.getFullYear() - testDate.getFullYear()) * 12 + 
                       (now.getMonth() - testDate.getMonth());
      return monthDiff === 0;
    }).length;
    
    const improvingTests = assessments_data.filter(a => a.trend === 'improving').length;
    const avgPercentile = assessments_data.reduce((sum, a) => sum + a.percentile, 0) / assessments_data.length;

    return (
      <Surface style={styles.statsOverview}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.statsGradient}
        >
          <Text style={styles.statsTitle}>Fitness Overview 💪</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statsItem}>
              <Text style={styles.statsNumber}>{totalTests}</Text>
              <Text style={styles.statsLabel}>Total Tests</Text>
            </View>
            <View style={styles.statsItem}>
              <Text style={styles.statsNumber}>{testsThisMonth}</Text>
              <Text style={styles.statsLabel}>This Month</Text>
            </View>
            <View style={styles.statsItem}>
              <Text style={styles.statsNumber}>{improvingTests}</Text>
              <Text style={styles.statsLabel}>Improving</Text>
            </View>
            <View style={styles.statsItem}>
              <Text style={styles.statsNumber}>{Math.round(avgPercentile)}%</Text>
              <Text style={styles.statsLabel}>Avg Percentile</Text>
            </View>
          </View>
        </LinearGradient>
      </Surface>
    );
  };

  const renderCategoryChips = () => (
    <View style={styles.filterContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {[
          { key: 'all', label: 'All Tests', icon: 'fitness-center' },
          { key: 'speed', label: 'Speed', icon: 'flash-on' },
          { key: 'power', label: 'Power', icon: 'trending-up' },
          { key: 'endurance', label: 'Endurance', icon: 'directions-run' },
          { key: 'strength', label: 'Strength', icon: 'fitness-center' },
          { key: 'agility', label: 'Agility', icon: 'shuffle' },
          { key: 'flexibility', label: 'Flexibility', icon: 'accessibility' },
        ].map((category) => (
          <Chip
            key={category.key}
            icon={category.icon}
            selected={selectedCategory === category.key}
            onPress={() => {
              setSelectedCategory(category.key);
              Vibration.vibrate(30);
            }}
            style={[
              styles.filterChip,
              selectedCategory === category.key && styles.selectedFilterChip
            ]}
            textStyle={selectedCategory === category.key ? styles.selectedFilterText : null}
          >
            {category.label}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const renderTestCard = (assessment) => (
    <Card 
      key={assessment.id} 
      style={styles.testCard}
    >
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.testInfo}>
            <View style={styles.testTitleRow}>
              <Icon name={assessment.icon} size={24} color={COLORS.primary} />
              <Text style={[TEXT_STYLES.h3, styles.testName]}>
                {assessment.name}
              </Text>
              <Chip 
                mode="outlined" 
                textStyle={{ 
                  color: getDifficultyColor(assessment.difficulty),
                  fontSize: 10 
                }}
                style={{ 
                  height: 24,
                  borderColor: getDifficultyColor(assessment.difficulty)
                }}
              >
                {assessment.difficulty}
              </Chip>
            </View>
            <Text style={styles.testDescription}>{assessment.description}</Text>
            <Text style={styles.lastTestDate}>
              Last tested: {new Date(assessment.lastTestDate).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={styles.resultsSection}>
          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>Latest Result</Text>
            <View style={styles.resultValueRow}>
              <Text style={styles.resultValue}>
                {assessment.lastResult} {assessment.unit}
              </Text>
              <View style={[styles.trendIndicator, { backgroundColor: getTrendColor(assessment.trend) }]}>
                <Icon name={getTrendIcon(assessment.trend)} size={16} color="white" />
              </View>
            </View>
          </View>
          
          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>Personal Best</Text>
            <Text style={[styles.resultValue, { color: COLORS.success }]}>
              {assessment.bestResult} {assessment.unit}
            </Text>
          </View>
          
          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>Target</Text>
            <Text style={[styles.resultValue, { color: COLORS.secondary }]}>
              {assessment.target} {assessment.unit}
            </Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress to Target</Text>
            <Text style={styles.percentileText}>
              {assessment.percentile}th percentile 📊
            </Text>
          </View>
          <ProgressBar 
            progress={getProgressToTarget(assessment.lastResult, assessment.target, assessment.unit)}
            color={COLORS.primary}
            style={styles.progressBar}
          />
        </View>

        <View style={styles.cardActions}>
          <Button 
            mode="contained" 
            icon="play-arrow"
            onPress={() => handleStartTest(assessment)}
            style={styles.startButton}
          >
            Start Test
          </Button>
          <Button 
            mode="outlined" 
            icon="history"
            onPress={() => handleViewHistory(assessment.name)}
            style={styles.historyButton}
          >
            History
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const renderTestModal = () => (
    <Portal>
      <Modal
        visible={showTestModal}
        onDismiss={() => setShowTestModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        {selectedTest && (
          <Card style={styles.modalCard}>
            <Card.Content>
              <View style={styles.modalHeader}>
                <Icon name={selectedTest.icon} size={32} color={COLORS.primary} />
                <Text style={[TEXT_STYLES.h2, styles.modalTitle]}>
                  {selectedTest.name}
                </Text>
                <IconButton 
                  icon="close" 
                  onPress={() => setShowTestModal(false)}
                  style={styles.closeButton}
                />
              </View>
              
              <Text style={styles.modalDescription}>
                {selectedTest.description}
              </Text>
              
              <View style={styles.testInstructions}>
                <Text style={styles.instructionsTitle}>Instructions:</Text>
                <Text style={styles.instructionsText}>
                  • Warm up properly before starting
                </Text>
                <Text style={styles.instructionsText}>
                  • Follow the test protocol exactly
                </Text>
                <Text style={styles.instructionsText}>
                  • Record your result immediately
                </Text>
                <Text style={styles.instructionsText}>
                  • Cool down after completion
                </Text>
              </View>
              
              <View style={styles.modalActions}>
                <Button 
                  mode="outlined" 
                  onPress={() => setShowTestModal(false)}
                  style={styles.modalCancelButton}
                >
                  Cancel
                </Button>
                <Button 
                  mode="contained" 
                  icon="timer"
                  onPress={() => {
                    setShowTestModal(false);
                    Alert.alert(
                      'Starting Test',
                      `Starting ${selectedTest.name} test. This feature will integrate with timer and recording functionality.`,
                      [{ text: 'Got it', style: 'default' }]
                    );
                  }}
                  style={styles.modalStartButton}
                >
                  Begin Test
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}
      </Modal>
    </Portal>
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
        <Text style={styles.headerTitle}>Fitness Assessment 🏃‍♂️</Text>
        <Text style={styles.headerSubtitle}>Track your physical performance</Text>
      </LinearGradient>

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
          {renderOverviewStats()}

          <View style={styles.searchSection}>
            <Searchbar
              placeholder="Search fitness tests..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchbar}
              iconColor={COLORS.primary}
            />
          </View>

          {renderCategoryChips()}

          <View style={styles.testsSection}>
            <Text style={[TEXT_STYLES.h2, styles.sectionTitle]}>
              Available Tests ({filteredAssessments.length})
            </Text>
            
            {filteredAssessments.length > 0 ? (
              filteredAssessments.map(renderTestCard)
            ) : (
              <Card style={styles.emptyCard}>
                <Card.Content style={styles.emptyContent}>
                  <Icon name="search-off" size={48} color={COLORS.text.secondary} />
                  <Text style={styles.emptyTitle}>No Tests Found</Text>
                  <Text style={styles.emptyText}>
                    {searchQuery ? 'Try adjusting your search terms' : 'No tests match the selected category'}
                  </Text>
                </Card.Content>
              </Card>
            )}
          </View>
        </ScrollView>
      </Animated.View>

      {renderTestModal()}

      <FAB
        icon="assessment"
        style={styles.fab}
        onPress={() => {
          Vibration.vibrate(50);
          navigation.navigate('CreateCustomTest');
        }}
      />
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    paddingTop: SPACING.xl + 20,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: 'white',
    textAlign: 'center',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  content: {
    flex: 1,
    marginTop: -10,
  },
  statsOverview: {
    margin: SPACING.md,
    borderRadius: 16,
    elevation: 4,
    overflow: 'hidden',
  },
  statsGradient: {
    padding: SPACING.lg,
  },
  statsTitle: {
    ...TEXT_STYLES.h3,
    color: 'white',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statsItem: {
    alignItems: 'center',
  },
  statsNumber: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: 'bold',
  },
  statsLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: SPACING.xs,
  },
  searchSection: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  searchbar: {
    backgroundColor: 'white',
    elevation: 2,
  },
  filterContainer: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  filterChip: {
    marginRight: SPACING.sm,
    backgroundColor: 'white',
  },
  selectedFilterChip: {
    backgroundColor: COLORS.primary,
  },
  selectedFilterText: {
    color: 'white',
  },
  testsSection: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
    color: COLORS.text.primary,
  },
  testCard: {
    marginBottom: SPACING.md,
    elevation: 3,
    borderRadius: 12,
  },
  cardHeader: {
    marginBottom: SPACING.md,
  },
  testInfo: {
    flex: 1,
  },
  testTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  testName: {
    marginLeft: SPACING.sm,
    flex: 1,
    color: COLORS.text.primary,
  },
  testDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  lastTestDate: {
    ...TEXT_STYLES.caption,
    color: COLORS.text.secondary,
  },
  resultsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    backgroundColor: COLORS.background.secondary,
    borderRadius: 8,
    padding: SPACING.sm,
  },
  resultItem: {
    alignItems: 'center',
    flex: 1,
  },
  resultLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  resultValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultValue: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  trendIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.xs,
  },
  progressSection: {
    marginBottom: SPACING.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  progressLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.text.secondary,
  },
  percentileText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  startButton: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  historyButton: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  emptyCard: {
    marginTop: SPACING.lg,
    elevation: 2,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text.primary,
    marginTop: SPACING.md,
  },
  emptyText: {
    ...TEXT_STYLES.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  modalContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    flex: 1,
    marginLeft: SPACING.sm,
    color: COLORS.text.primary,
  },
  closeButton: {
    margin: 0,
  },
  modalDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.text.secondary,
    marginBottom: SPACING.md,
  },
  testInstructions: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  instructionsTitle: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  instructionsText: {
    ...TEXT_STYLES.body,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalCancelButton: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  modalStartButton: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
};

export default FitnessAssessment;