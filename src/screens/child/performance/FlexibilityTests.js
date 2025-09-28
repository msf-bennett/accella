import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  Alert,
  RefreshControl,
  StatusBar,
  Vibration
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  ProgressBar,
  Avatar,
  IconButton,
  FAB,
  Surface
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import your established constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width: screenWidth } = Dimensions.get('window');

const FlexibilityTests = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const flexibilityData = useSelector(state => state.performance.flexibilityTests);
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [currentTestProgress, setCurrentTestProgress] = useState(0);
  const [isTestActive, setIsTestActive] = useState(false);
  const [testResults, setTestResults] = useState({});
  const [showResults, setShowResults] = useState(false);
  
  const scrollViewRef = useRef();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Sample flexibility tests data
  const flexibilityTests = [
    {
      id: 1,
      name: 'Sit and Reach',
      description: 'Tests lower back and hamstring flexibility',
      difficulty: 'Beginner',
      duration: '2 minutes',
      icon: 'accessibility',
      points: 50,
      color: '#4CAF50',
      instructions: [
        'Sit with legs extended straight in front',
        'Keep your feet flexed and together',
        'Slowly reach forward as far as comfortable',
        'Hold the position for 15 seconds',
        'Measure the distance reached'
      ]
    },
    {
      id: 2,
      name: 'Shoulder Flexibility',
      description: 'Tests shoulder and upper back mobility',
      difficulty: 'Intermediate',
      duration: '3 minutes',
      icon: 'fitness-center',
      points: 75,
      color: '#FF9800',
      instructions: [
        'Stand with feet shoulder-width apart',
        'Raise one arm overhead, bend elbow behind head',
        'Use other hand to gently pull elbow',
        'Hold for 15 seconds each side',
        'Rate your comfort level'
      ]
    },
    {
      id: 3,
      name: 'Hip Flexor Test',
      description: 'Measures hip flexibility and mobility',
      difficulty: 'Intermediate',
      duration: '4 minutes',
      icon: 'directions-run',
      points: 75,
      color: '#9C27B0',
      instructions: [
        'Lie on your back at edge of table/bed',
        'Pull one knee to chest',
        'Let other leg hang down naturally',
        'Hold position for 20 seconds',
        'Repeat on other side'
      ]
    },
    {
      id: 4,
      name: 'Ankle Mobility',
      description: 'Tests ankle dorsiflexion range',
      difficulty: 'Beginner',
      duration: '2 minutes',
      icon: 'directions-walk',
      points: 50,
      color: '#2196F3',
      instructions: [
        'Stand facing a wall, arm\'s length away',
        'Step one foot back 12 inches',
        'Keep heel down, lean forward',
        'Feel stretch in calf and ankle',
        'Hold for 15 seconds each leg'
      ]
    },
    {
      id: 5,
      name: 'Spinal Rotation',
      description: 'Measures spinal mobility and rotation',
      difficulty: 'Advanced',
      duration: '5 minutes',
      icon: '360',
      points: 100,
      color: '#E91E63',
      instructions: [
        'Sit cross-legged on the floor',
        'Place hands behind head',
        'Slowly rotate torso to one side',
        'Hold for 10 seconds',
        'Rotate to other side and hold'
      ]
    }
  ];

  useEffect(() => {
    // Entrance animations
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
      })
    ]).start();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const startTest = (test) => {
    Vibration.vibrate(50);
    setSelectedTest(test);
    setIsTestActive(true);
    setCurrentTestProgress(0);
    setShowResults(false);
    
    // Simulate test progress
    const progressInterval = setInterval(() => {
      setCurrentTestProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          completeTest(test);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const completeTest = (test) => {
    const score = Math.floor(Math.random() * 30) + 70; // Random score between 70-100
    const newResult = {
      testId: test.id,
      score: score,
      date: new Date().toISOString(),
      points: test.points
    };
    
    setTestResults(prev => ({ ...prev, [test.id]: newResult }));
    setIsTestActive(false);
    setShowResults(true);
    
    // Dispatch to Redux store
    dispatch({
      type: 'ADD_FLEXIBILITY_TEST_RESULT',
      payload: newResult
    });

    Vibration.vibrate([100, 100, 100]);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return '#4CAF50';
      case 'Intermediate': return '#FF9800';
      case 'Advanced': return '#F44336';
      default: return COLORS.primary;
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return '#4CAF50';
    if (score >= 80) return '#8BC34A';
    if (score >= 70) return '#FFC107';
    if (score >= 60) return '#FF9800';
    return '#F44336';
  };

  const renderTestCard = (test) => (
    <Animated.View
      key={test.id}
      style={[
        styles.testCard,
        {
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim }
          ]
        }
      ]}
    >
      <Card style={styles.card} elevation={4}>
        <LinearGradient
          colors={[test.color, `${test.color}90`]}
          style={styles.cardHeader}
        >
          <View style={styles.headerContent}>
            <Avatar.Icon
              size={50}
              icon={test.icon}
              style={[styles.testIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
            />
            <View style={styles.testInfo}>
              <Text style={styles.testName}>{test.name}</Text>
              <Text style={styles.testDescription}>{test.description}</Text>
            </View>
            <Chip
              mode="outlined"
              textStyle={styles.chipText}
              style={[styles.difficultyChip, { borderColor: 'rgba(255,255,255,0.5)' }]}
            >
              {test.difficulty}
            </Chip>
          </View>
        </LinearGradient>

        <Card.Content style={styles.cardContent}>
          <View style={styles.testDetails}>
            <View style={styles.detailRow}>
              <Icon name="schedule" size={16} color={COLORS.textSecondary} />
              <Text style={styles.detailText}>{test.duration}</Text>
              <Icon name="stars" size={16} color={COLORS.secondary} />
              <Text style={styles.pointsText}>{test.points} points</Text>
            </View>
          </View>

          {testResults[test.id] && (
            <Surface style={styles.resultSurface}>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Last Score:</Text>
                <Text style={[
                  styles.scoreText,
                  { color: getScoreColor(testResults[test.id].score) }
                ]}>
                  {testResults[test.id].score}%
                </Text>
              </View>
              <ProgressBar
                progress={testResults[test.id].score / 100}
                color={getScoreColor(testResults[test.id].score)}
                style={styles.scoreProgress}
              />
            </Surface>
          )}

          <Button
            mode="contained"
            onPress={() => startTest(test)}
            style={[styles.startButton, { backgroundColor: test.color }]}
            labelStyle={styles.buttonLabel}
            disabled={isTestActive && selectedTest?.id === test.id}
          >
            {isTestActive && selectedTest?.id === test.id ? 'Testing...' : 'Start Test'}
          </Button>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderActiveTest = () => {
    if (!selectedTest || !isTestActive) return null;

    return (
      <Card style={styles.activeTestCard} elevation={8}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.activeTestHeader}
        >
          <Text style={styles.activeTestTitle}>🏃‍♀️ {selectedTest.name} in Progress</Text>
          <Text style={styles.activeTestSubtitle}>Follow the instructions below</Text>
        </LinearGradient>

        <Card.Content style={styles.activeTestContent}>
          <ProgressBar
            progress={currentTestProgress / 100}
            color={COLORS.primary}
            style={styles.testProgress}
          />
          <Text style={styles.progressText}>{Math.round(currentTestProgress)}% Complete</Text>

          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>📋 Instructions:</Text>
            {selectedTest.instructions.map((instruction, index) => (
              <View key={index} style={styles.instructionRow}>
                <Text style={styles.instructionNumber}>{index + 1}.</Text>
                <Text style={styles.instructionText}>{instruction}</Text>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderResults = () => {
    if (!showResults || !selectedTest) return null;

    const result = testResults[selectedTest.id];
    if (!result) return null;

    return (
      <Card style={styles.resultsCard} elevation={6}>
        <LinearGradient
          colors={[getScoreColor(result.score), `${getScoreColor(result.score)}90`]}
          style={styles.resultsHeader}
        >
          <Text style={styles.resultsTitle}>🎉 Test Complete!</Text>
          <Text style={styles.resultsScore}>{result.score}%</Text>
        </LinearGradient>

        <Card.Content style={styles.resultsContent}>
          <Text style={styles.resultsText}>
            Great job on completing the {selectedTest.name} test! 🌟
          </Text>
          <Text style={styles.pointsEarned}>
            You earned {result.points} points! 🏆
          </Text>
          
          <View style={styles.resultsActions}>
            <Button
              mode="outlined"
              onPress={() => setShowResults(false)}
              style={styles.actionButton}
            >
              Close
            </Button>
            <Button
              mode="contained"
              onPress={() => startTest(selectedTest)}
              style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
            >
              Test Again
            </Button>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const getTotalPoints = () => {
    return Object.values(testResults).reduce((total, result) => total + result.points, 0);
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>🤸‍♀️ Flexibility Tests</Text>
        <Text style={styles.headerSubtitle}>Track your flexibility progress</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{Object.keys(testResults).length}</Text>
            <Text style={styles.statLabel}>Tests Completed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{getTotalPoints()}</Text>
            <Text style={styles.statLabel}>Points Earned</Text>
          </View>
        </View>
      </LinearGradient>

      <Animated.ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
            progressBackgroundColor={COLORS.surface}
          />
        }
        opacity={fadeAnim}
      >
        {renderActiveTest()}
        {renderResults()}

        <View style={styles.testsGrid}>
          {flexibilityTests.map(test => renderTestCard(test))}
        </View>

        <View style={styles.tipsSection}>
          <Card style={styles.tipsCard}>
            <Card.Content>
              <Text style={styles.tipsTitle}>💡 Flexibility Tips</Text>
              <Text style={styles.tipsText}>
                • Warm up before testing{'\n'}
                • Don't force movements{'\n'}
                • Breathe deeply during stretches{'\n'}
                • Stay consistent with practice{'\n'}
                • Track your progress over time
              </Text>
            </Card.Content>
          </Card>
        </View>
      </Animated.ScrollView>

      <FAB
        style={[styles.fab, { backgroundColor: COLORS.primary }]}
        small={false}
        icon="timeline"
        onPress={() => navigation.navigate('FlexibilityProgress')}
        label="View Progress"
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
    paddingTop: StatusBar.currentHeight + SPACING.xl,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: 'white',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: 'bold',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
    marginTop: SPACING.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  testsGrid: {
    gap: SPACING.lg,
  },
  testCard: {
    marginBottom: SPACING.md,
  },
  card: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: SPACING.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  testIcon: {
    marginRight: SPACING.md,
  },
  testInfo: {
    flex: 1,
  },
  testName: {
    ...TEXT_STYLES.h3,
    color: 'white',
    fontWeight: 'bold',
  },
  testDescription: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.9)',
    marginTop: SPACING.xs,
  },
  difficultyChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  chipText: {
    color: 'white',
    fontSize: 12,
  },
  cardContent: {
    padding: SPACING.lg,
  },
  testDetails: {
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  detailText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginRight: SPACING.md,
  },
  pointsText: {
    ...TEXT_STYLES.body,
    color: COLORS.secondary,
    fontWeight: 'bold',
  },
  resultSurface: {
    padding: SPACING.md,
    borderRadius: 10,
    marginBottom: SPACING.md,
    elevation: 2,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  resultLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
  },
  scoreText: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
  },
  scoreProgress: {
    height: 8,
    borderRadius: 4,
  },
  startButton: {
    borderRadius: 25,
    marginTop: SPACING.sm,
  },
  buttonLabel: {
    ...TEXT_STYLES.button,
    color: 'white',
  },
  activeTestCard: {
    marginBottom: SPACING.lg,
    borderRadius: 15,
    overflow: 'hidden',
  },
  activeTestHeader: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  activeTestTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  activeTestSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  activeTestContent: {
    padding: SPACING.lg,
  },
  testProgress: {
    height: 10,
    borderRadius: 5,
    marginBottom: SPACING.sm,
  },
  progressText: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.lg,
  },
  instructionsContainer: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 10,
  },
  instructionsTitle: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.md,
  },
  instructionRow: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  instructionNumber: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginRight: SPACING.sm,
    minWidth: 20,
  },
  instructionText: {
    ...TEXT_STYLES.body,
    flex: 1,
    color: COLORS.text,
  },
  resultsCard: {
    marginBottom: SPACING.lg,
    borderRadius: 15,
    overflow: 'hidden',
  },
  resultsHeader: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  resultsTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resultsScore: {
    ...TEXT_STYLES.h1,
    color: 'white',
    fontWeight: 'bold',
    fontSize: 48,
    marginTop: SPACING.sm,
  },
  resultsContent: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  resultsText: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  pointsEarned: {
    ...TEXT_STYLES.h3,
    color: COLORS.secondary,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  resultsActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  actionButton: {
    flex: 1,
    borderRadius: 25,
  },
  tipsSection: {
    marginTop: SPACING.xl,
  },
  tipsCard: {
    borderRadius: 15,
  },
  tipsTitle: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  tipsText: {
    ...TEXT_STYLES.body,
    lineHeight: 24,
    color: COLORS.textSecondary,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
    borderRadius: 28,
  },
});

export default FlexibilityTests;