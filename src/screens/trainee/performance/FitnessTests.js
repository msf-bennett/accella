import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  RefreshControl,
  Dimensions,
  Vibration,
  Animated,
} from 'react-native';
import {
  Card,
  Button,
  TextInput,
  Chip,
  ProgressBar,
  Surface,
  Portal,
  Modal,
  IconButton,
  FAB,
  Avatar,
  Searchbar,
  Badge,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LineChart, BarChart, RadarChart } from 'react-native-chart-kit';

// Design system imports
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4caf50',
  error: '#f44336',
  warning: '#ff9800',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  strength: '#e91e63',
  endurance: '#2196f3',
  flexibility: '#9c27b0',
  power: '#ff5722',
  balance: '#00bcd4',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold' },
  h2: { fontSize: 24, fontWeight: 'bold' },
  h3: { fontSize: 20, fontWeight: 'bold' },
  body: { fontSize: 16 },
  caption: { fontSize: 12 },
};

const { width } = Dimensions.get('window');

const FitnessTests = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, fitnessTests } = useSelector(state => ({
    user: state.auth.user,
    fitnessTests: state.performance.fitnessTests || {},
  }));

  // State for test data
  const [currentTest, setCurrentTest] = useState({
    testId: '',
    result: '',
    notes: '',
    conditions: '',
    equipment: '',
  });

  // UI State
  const [showTestModal, setShowTestModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [testHistory, setTestHistory] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTest, setSelectedTest] = useState(null);
  const [animatedValues] = useState({
    strength: new Animated.Value(0),
    endurance: new Animated.Value(0),
    flexibility: new Animated.Value(0),
    power: new Animated.Value(0),
    balance: new Animated.Value(0),
  });

  // Standardized Fitness Tests Database
  const fitnessTestsDB = {
    // Strength Tests
    pushUps: {
      id: 'pushUps',
      name: 'Push-ups Test',
      category: 'strength',
      unit: 'reps',
      icon: '💪',
      description: 'Maximum push-ups in 1 minute',
      instructions: 'Perform as many proper push-ups as possible in 60 seconds',
      norms: {
        male: { excellent: 47, good: 39, average: 30, below: 17, poor: 0 },
        female: { excellent: 36, good: 30, average: 23, below: 12, poor: 0 },
      },
    },
    sitUps: {
      id: 'sitUps',
      name: 'Sit-ups Test',
      category: 'strength',
      unit: 'reps',
      icon: '🏋️‍♂️',
      description: 'Maximum sit-ups in 1 minute',
      instructions: 'Perform as many proper sit-ups as possible in 60 seconds',
      norms: {
        male: { excellent: 50, good: 43, average: 37, below: 28, poor: 0 },
        female: { excellent: 45, good: 38, average: 32, below: 23, poor: 0 },
      },
    },
    plankHold: {
      id: 'plankHold',
      name: 'Plank Hold',
      category: 'strength',
      unit: 'seconds',
      icon: '🤸‍♂️',
      description: 'Maximum plank hold time',
      instructions: 'Hold proper plank position for as long as possible',
      norms: {
        male: { excellent: 120, good: 90, average: 60, below: 30, poor: 0 },
        female: { excellent: 90, good: 70, average: 50, below: 25, poor: 0 },
      },
    },

    // Endurance Tests
    cooper12Min: {
      id: 'cooper12Min',
      name: 'Cooper 12-Min Run',
      category: 'endurance',
      unit: 'meters',
      icon: '🏃‍♂️',
      description: '12-minute run test for aerobic fitness',
      instructions: 'Run as far as possible in 12 minutes',
      norms: {
        male: { excellent: 2800, good: 2400, average: 2000, below: 1600, poor: 0 },
        female: { excellent: 2300, good: 1900, average: 1600, below: 1200, poor: 0 },
      },
    },
    stepTest: {
      id: 'stepTest',
      name: 'Harvard Step Test',
      category: 'endurance',
      unit: 'index',
      icon: '📶',
      description: 'Cardiovascular fitness step test',
      instructions: 'Step up and down for 5 minutes, measure recovery heart rate',
      norms: {
        male: { excellent: 90, good: 80, average: 65, below: 55, poor: 0 },
        female: { excellent: 86, good: 76, average: 61, below: 51, poor: 0 },
      },
    },
    vo2Max: {
      id: 'vo2Max',
      name: 'VO2 Max Test',
      category: 'endurance',
      unit: 'ml/kg/min',
      icon: '💨',
      description: 'Maximum oxygen uptake test',
      instructions: 'Estimated from submaximal exercise tests',
      norms: {
        male: { excellent: 56, good: 51, average: 45, below: 40, poor: 0 },
        female: { excellent: 49, good: 43, average: 39, below: 35, poor: 0 },
      },
    },

    // Flexibility Tests
    sitReach: {
      id: 'sitReach',
      name: 'Sit and Reach',
      category: 'flexibility',
      unit: 'cm',
      icon: '🧘‍♀️',
      description: 'Hamstring and lower back flexibility',
      instructions: 'Sit with legs extended, reach forward as far as possible',
      norms: {
        male: { excellent: 20, good: 16, average: 12, below: 7, poor: -8 },
        female: { excellent: 24, good: 20, average: 16, below: 11, poor: -5 },
      },
    },
    shoulderFlex: {
      id: 'shoulderFlex',
      name: 'Shoulder Flexibility',
      category: 'flexibility',
      unit: 'cm',
      icon: '🤲',
      description: 'Shoulder joint range of motion',
      instructions: 'Reach behind back with both hands, measure gap between fingers',
      norms: {
        male: { excellent: -5, good: 0, average: 5, below: 15, poor: 25 },
        female: { excellent: -8, good: -3, average: 2, below: 12, poor: 22 },
      },
    },

    // Power Tests
    verticalJump: {
      id: 'verticalJump',
      name: 'Vertical Jump',
      category: 'power',
      unit: 'cm',
      icon: '🦘',
      description: 'Lower body explosive power',
      instructions: 'Jump vertically as high as possible from standing position',
      norms: {
        male: { excellent: 65, good: 55, average: 45, below: 35, poor: 0 },
        female: { excellent: 55, good: 45, average: 35, below: 25, poor: 0 },
      },
    },
    standingLongJump: {
      id: 'standingLongJump',
      name: 'Standing Long Jump',
      category: 'power',
      unit: 'cm',
      icon: '🏃‍♂️',
      description: 'Horizontal jump for leg power',
      instructions: 'Jump forward as far as possible from standing position',
      norms: {
        male: { excellent: 250, good: 230, average: 210, below: 190, poor: 0 },
        female: { excellent: 200, good: 180, average: 160, below: 140, poor: 0 },
      },
    },

    // Balance Tests
    singleLegStand: {
      id: 'singleLegStand',
      name: 'Single Leg Stand',
      category: 'balance',
      unit: 'seconds',
      icon: '🦩',
      description: 'Static balance on one leg',
      instructions: 'Stand on one leg with eyes closed for as long as possible',
      norms: {
        male: { excellent: 45, good: 35, average: 25, below: 15, poor: 0 },
        female: { excellent: 40, good: 30, average: 20, below: 12, poor: 0 },
      },
    },
    yBalance: {
      id: 'yBalance',
      name: 'Y-Balance Test',
      category: 'balance',
      unit: 'score',
      icon: '⚖️',
      description: 'Dynamic balance and stability',
      instructions: 'Perform Y-balance test in three directions',
      norms: {
        male: { excellent: 95, good: 85, average: 75, below: 65, poor: 0 },
        female: { excellent: 90, good: 80, average: 70, below: 60, poor: 0 },
      },
    },
  };

  const categories = [
    { key: 'all', label: 'All Tests', color: COLORS.primary, icon: '📋' },
    { key: 'strength', label: 'Strength', color: COLORS.strength, icon: '💪' },
    { key: 'endurance', label: 'Endurance', color: COLORS.endurance, icon: '🏃‍♂️' },
    { key: 'flexibility', label: 'Flexibility', color: COLORS.flexibility, icon: '🧘‍♀️' },
    { key: 'power', label: 'Power', color: COLORS.power, icon: '⚡' },
    { key: 'balance', label: 'Balance', color: COLORS.balance, icon: '⚖️' },
  ];

  useEffect(() => {
    loadTestHistory();
    animateCategories();
  }, []);

  const animateCategories = () => {
    Object.keys(animatedValues).forEach((key, index) => {
      Animated.timing(animatedValues[key], {
        toValue: 1,
        duration: 800,
        delay: index * 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const loadTestHistory = useCallback(() => {
    const history = fitnessTests.history || {};
    setTestHistory(history);
  }, [fitnessTests]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadTestHistory();
    setTimeout(() => setRefreshing(false), 1000);
  }, [loadTestHistory]);

  // Performance calculations
  const getPerformanceLevel = (testId, result, gender = user?.gender || 'male') => {
    const test = fitnessTestsDB[testId];
    if (!test || !result) return { level: 'N/A', color: COLORS.textSecondary, percentage: 0 };
    
    const norms = test.norms[gender];
    const value = parseFloat(result);
    
    if (value >= norms.excellent) return { level: 'Excellent', color: COLORS.success, percentage: 1 };
    if (value >= norms.good) return { level: 'Good', color: COLORS.primary, percentage: 0.8 };
    if (value >= norms.average) return { level: 'Average', color: COLORS.warning, percentage: 0.6 };
    if (value >= norms.below) return { level: 'Below Average', color: COLORS.error, percentage: 0.4 };
    return { level: 'Needs Improvement', color: COLORS.error, percentage: 0.2 };
  };

  const calculateFitnessScore = () => {
    const categoryScores = {};
    let totalScore = 0;
    let testCount = 0;
    
    Object.keys(fitnessTestsDB).forEach(testId => {
      const test = fitnessTestsDB[testId];
      const history = testHistory[testId];
      
      if (history && history.length > 0) {
        const latestResult = history[history.length - 1];
        const performance = getPerformanceLevel(testId, latestResult.result);
        
        if (!categoryScores[test.category]) {
          categoryScores[test.category] = { total: 0, count: 0 };
        }
        
        categoryScores[test.category].total += performance.percentage;
        categoryScores[test.category].count += 1;
        
        totalScore += performance.percentage;
        testCount += 1;
      }
    });
    
    // Calculate category averages
    Object.keys(categoryScores).forEach(category => {
      categoryScores[category].average = categoryScores[category].total / categoryScores[category].count;
    });
    
    const overallScore = testCount > 0 ? totalScore / testCount : 0;
    
    return {
      overall: overallScore,
      categories: categoryScores,
      testsCompleted: testCount,
      totalTests: Object.keys(fitnessTestsDB).length,
    };
  };

  const saveTestResult = () => {
    if (!currentTest.testId || !currentTest.result) {
      Alert.alert('Error', 'Please select a test and enter a result.');
      return;
    }
    
    const newResult = {
      result: currentTest.result,
      notes: currentTest.notes,
      conditions: currentTest.conditions,
      equipment: currentTest.equipment,
      date: new Date().toISOString(),
      id: Date.now().toString(),
    };
    
    const updatedHistory = {
      ...testHistory,
      [currentTest.testId]: [...(testHistory[currentTest.testId] || []), newResult],
    };
    
    setTestHistory(updatedHistory);
    
    // Dispatch to Redux
    dispatch({
      type: 'UPDATE_FITNESS_TESTS',
      payload: {
        history: updatedHistory,
      },
    });
    
    setCurrentTest({
      testId: '',
      result: '',
      notes: '',
      conditions: '',
      equipment: '',
    });
    
    setShowTestModal(false);
    Vibration.vibrate(50);
    
    const test = fitnessTestsDB[currentTest.testId];
    const performance = getPerformanceLevel(currentTest.testId, currentTest.result);
    
    Alert.alert(
      'Test Recorded! 🎯', 
      `${test.name}: ${currentTest.result} ${test.unit}\nPerformance: ${performance.level}`
    );
  };

  const getFilteredTests = () => {
    let filtered = Object.values(fitnessTestsDB);
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(test => test.category === selectedCategory);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(test => 
        test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        test.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };

  const renderFitnessScoreCard = () => {
    const fitnessScore = calculateFitnessScore();
    
    return (
      <Card style={styles.scoreCard}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, { color: COLORS.primary, marginBottom: SPACING.md }]}>
            🏆 Fitness Score Overview
          </Text>
          
          <View style={styles.overallScoreContainer}>
            <View style={styles.scoreCircle}>
              <Text style={[TEXT_STYLES.h1, { color: COLORS.primary }]}>
                {Math.round(fitnessScore.overall * 100)}
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                Overall Score
              </Text>
            </View>
            
            <View style={styles.scoreDetails}>
              <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary }]}>
                Tests Completed: {fitnessScore.testsCompleted}/{fitnessScore.totalTests}
              </Text>
              <ProgressBar
                progress={fitnessScore.testsCompleted / fitnessScore.totalTests}
                color={COLORS.primary}
                style={styles.completionProgress}
              />
            </View>
          </View>
          
          <View style={styles.categoryScores}>
            {Object.entries(fitnessScore.categories).map(([category, data]) => {
              const categoryInfo = categories.find(c => c.key === category);
              
              return (
                <Animated.View 
                  key={category}
                  style={[
                    styles.categoryScore,
                    { opacity: animatedValues[category] || 1 }
                  ]}
                >
                  <View style={styles.categoryHeader}>
                    <Text style={styles.categoryIcon}>{categoryInfo?.icon}</Text>
                    <Text style={[TEXT_STYLES.body, { flex: 1, textTransform: 'capitalize' }]}>
                      {category}
                    </Text>
                    <Text style={[TEXT_STYLES.h3, { color: categoryInfo?.color }]}>
                      {Math.round(data.average * 100)}
                    </Text>
                  </View>
                  <ProgressBar
                    progress={data.average}
                    color={categoryInfo?.color}
                    style={styles.categoryProgress}
                  />
                </Animated.View>
              );
            })}
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderRadarChart = () => {
    const fitnessScore = calculateFitnessScore();
    
    if (Object.keys(fitnessScore.categories).length < 3) return null;
    
    const data = {
      labels: Object.keys(fitnessScore.categories).map(cat => 
        categories.find(c => c.key === cat)?.label || cat
      ),
      datasets: [
        {
          data: Object.values(fitnessScore.categories).map(cat => cat.average * 100),
          color: () => COLORS.primary,
          strokeWidth: 2,
        },
      ],
    };
    
    return (
      <Card style={styles.radarCard}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, { color: COLORS.primary, marginBottom: SPACING.md }]}>
            📊 Fitness Profile
          </Text>
          
          <RadarChart
            data={data}
            width={width - 60}
            height={220}
            chartConfig={{
              backgroundColor: COLORS.background,
              backgroundGradientFrom: COLORS.surface,
              backgroundGradientTo: COLORS.surface,
              color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
              labelColor: () => COLORS.textSecondary,
            }}
            style={styles.radarChart}
          />
        </Card.Content>
      </Card>
    );
  };

  const renderTestCard = (test) => {
    const history = testHistory[test.id] || [];
    const latestResult = history.length > 0 ? history[history.length - 1] : null;
    const performance = latestResult ? getPerformanceLevel(test.id, latestResult.result) : null;
    const categoryInfo = categories.find(c => c.key === test.category);
    
    return (
      <Card key={test.id} style={styles.testCard}>
        <Card.Content>
          <View style={styles.testHeader}>
            <View style={styles.testTitleContainer}>
              <Text style={styles.testIcon}>{test.icon}</Text>
              <View style={styles.testInfo}>
                <Text style={[TEXT_STYLES.body, { fontWeight: 'bold' }]}>
                  {test.name}
                </Text>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                  {test.description}
                </Text>
              </View>
            </View>
            
            <Chip
              style={[styles.categoryChip, { backgroundColor: categoryInfo?.color }]}
              textStyle={{ color: 'white', fontSize: 10 }}
            >
              {categoryInfo?.label}
            </Chip>
          </View>
          
          {latestResult && (
            <Surface style={styles.resultContainer}>
              <View style={styles.resultRow}>
                <Text style={[TEXT_STYLES.body, { fontWeight: 'bold' }]}>
                  Latest: {latestResult.result} {test.unit}
                </Text>
                <Chip
                  style={[styles.performanceChip, { backgroundColor: performance.color }]}
                  textStyle={{ color: 'white', fontSize: 10 }}
                >
                  {performance.level}
                </Chip>
              </View>
              
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                {new Date(latestResult.date).toLocaleDateString()}
              </Text>
              
              {history.length > 1 && (
                <View style={styles.progressIndicator}>
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.success }]}>
                    {history.length} tests recorded
                  </Text>
                </View>
              )}
            </Surface>
          )}
          
          <View style={styles.testActions}>
            <Button
              mode="outlined"
              onPress={() => {
                setSelectedTest(test);
                Alert.alert(
                  test.name,
                  `${test.description}\n\nInstructions:\n${test.instructions}`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                      text: 'Record Result', 
                      onPress: () => {
                        setCurrentTest(prev => ({ ...prev, testId: test.id }));
                        setShowTestModal(true);
                      }
                    },
                  ]
                );
              }}
              style={styles.testButton}
            >
              {latestResult ? 'Retest' : 'Start Test'}
            </Button>
            
            {history.length > 0 && (
              <IconButton
                icon="trending-up"
                onPress={() => {
                  // Navigate to detailed test history
                  Alert.alert('Progress', `${history.length} results recorded for ${test.name}`);
                }}
                iconColor={COLORS.primary}
              />
            )}
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <Text style={[TEXT_STYLES.h1, { color: 'white' }]}>
          🎯 Fitness Tests
        </Text>
        <Text style={[TEXT_STYLES.body, { color: 'white', opacity: 0.9 }]}>
          Standardized assessments & benchmarks
        </Text>
      </LinearGradient>

      <ScrollView
        style={styles.content}
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
        {renderFitnessScoreCard()}
        {renderRadarChart()}
        
        {/* Category Filter */}
        <Card style={styles.filterCard}>
          <Card.Content>
            <Text style={[TEXT_STYLES.h3, { color: COLORS.primary, marginBottom: SPACING.md }]}>
              📋 Test Categories
            </Text>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoryFilters}>
                {categories.map((category) => (
                  <Chip
                    key={category.key}
                    selected={selectedCategory === category.key}
                    onPress={() => setSelectedCategory(category.key)}
                    style={[
                      styles.categoryFilter,
                      selectedCategory === category.key && { backgroundColor: category.color }
                    ]}
                    textStyle={selectedCategory === category.key && { color: 'white' }}
                  >
                    {category.icon} {category.label}
                  </Chip>
                ))}
              </View>
            </ScrollView>
            
            <Searchbar
              placeholder="Search tests..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchbar}
              inputStyle={{ fontSize: 14 }}
            />
          </Card.Content>
        </Card>
        
        {/* Test Cards */}
        {getFilteredTests().map(test => renderTestCard(test))}
        
        {getFilteredTests().length === 0 && (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <View style={styles.emptyState}>
                <Text style={[TEXT_STYLES.h3, { color: COLORS.textSecondary, textAlign: 'center' }]}>
                  🔍 No tests found
                </Text>
                <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary, textAlign: 'center' }]}>
                  Try adjusting your search or category filter
                </Text>
              </View>
            </Card.Content>
          </Card>
        )}
        
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Test Recording Modal */}
      <Portal>
        <Modal
          visible={showTestModal}
          onDismiss={() => setShowTestModal(false)}
          contentContainerStyle={styles.modal}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {currentTest.testId && (
              <>
                <Text style={[TEXT_STYLES.h2, { textAlign: 'center', marginBottom: SPACING.md }]}>
                  {fitnessTestsDB[currentTest.testId]?.icon} Record Test Result
                </Text>
                
                <Text style={[TEXT_STYLES.h3, { textAlign: 'center', marginBottom: SPACING.lg }]}>
                  {fitnessTestsDB[currentTest.testId]?.name}
                </Text>
                
                <Surface style={styles.instructionsCard}>
                  <Text style={[TEXT_STYLES.body, { fontWeight: 'bold', marginBottom: SPACING.sm }]}>
                    Instructions:
                  </Text>
                  <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary }]}>
                    {fitnessTestsDB[currentTest.testId]?.instructions}
                  </Text>
                </Surface>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>
                    Result ({fitnessTestsDB[currentTest.testId]?.unit})
                  </Text>
                  <TextInput
                    mode="outlined"
                    value={currentTest.result}
                    onChangeText={(value) => setCurrentTest(prev => ({ ...prev, result: value }))}
                    keyboardType="numeric"
                    placeholder={`Enter result in ${fitnessTestsDB[currentTest.testId]?.unit}`}
                    style={styles.input}
                    theme={{ colors: { primary: COLORS.primary } }}
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Test Conditions (Optional)</Text>
                  <TextInput
                    mode="outlined"
                    value={currentTest.conditions}
                    onChangeText={(value) => setCurrentTest(prev => ({ ...prev, conditions: value }))}
                    placeholder="Indoor/outdoor, temperature, etc."
                    style={styles.input}
                    theme={{ colors: { primary: COLORS.primary } }}
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Equipment Used (Optional)</Text>
                  <TextInput
                    mode="outlined"
                    value={currentTest.equipment}
                    onChangeText={(value) => setCurrentTest(prev => ({ ...prev, equipment: value }))}
                    placeholder="Equipment or modifications"
                    style={styles.input}
                    theme={{ colors: { primary: COLORS.primary } }}
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Notes (Optional)</Text>
                  <TextInput
                    mode="outlined"
                    value={currentTest.notes}
                    onChangeText={(value) => setCurrentTest(prev => ({ ...prev, notes: value }))}
                    placeholder="How did you feel? Any observations..."
                    multiline
                    numberOfLines={3}
                    style={styles.input}
                    theme={{ colors: { primary: COLORS.primary } }}
                  />
                </View>
                
                {/* Performance Prediction */}
                {currentTest.result && (
                  <Surface style={styles.performancePrediction}>
                    {(() => {
                      const performance = getPerformanceLevel(currentTest.testId, currentTest.result);
                      return (
                        <View style={styles.predictionContent}>
                          <Text style={[TEXT_STYLES.body, { fontWeight: 'bold' }]}>
                            Predicted Performance:
                          </Text>
                          <Chip
                            style={[styles.predictionChip, { backgroundColor: performance.color }]}
                            textStyle={{ color: 'white' }}
                          >
                            {performance.level}
                          </Chip>
                        </View>
                      );
                    })()}
                  </Surface>
                )}
              </>
            )}
            
            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => setShowTestModal(false)}
                style={styles.cancelButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={saveTestResult}
                style={styles.saveButton}
                buttonColor={COLORS.primary}
                disabled={!currentTest.testId || !currentTest.result}
              >
                Save Result
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>

      {/* Quick Add FAB */}
      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => {
          Alert.alert(
            'Quick Test Entry',
            'Select a test category to get started',
            categories.slice(1).map(category => ({
              text: `${category.icon} ${category.label}`,
              onPress: () => {
                setSelectedCategory(category.key);
                // Auto-select first test in category
                const categoryTests = Object.values(fitnessTestsDB).filter(
                  test => test.category === category.key
                );
                if (categoryTests.length > 0) {
                  setCurrentTest(prev => ({ ...prev, testId: categoryTests[0].id }));
                  setShowTestModal(true);
                }
              },
            })).concat([{ text: 'Cancel', style: 'cancel' }])
          );
        }}
        color="white"
        customSize={56}
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
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  scoreCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    elevation: 4,
  },
  overallScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.lg,
    elevation: 2,
  },
  scoreDetails: {
    flex: 1,
  },
  completionProgress: {
    marginTop: SPACING.sm,
    height: 8,
    borderRadius: 4,
  },
  categoryScores: {
    gap: SPACING.md,
  },
  categoryScore: {
    marginBottom: SPACING.sm,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  categoryProgress: {
    height: 6,
    borderRadius: 3,
  },
  radarCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    elevation: 4,
  },
  radarChart: {
    marginVertical: SPACING.sm,
    borderRadius: 16,
  },
  filterCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    elevation: 4,
  },
  categoryFilters: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  categoryFilter: {
    marginRight: SPACING.sm,
  },
  searchbar: {
    marginTop: SPACING.md,
    elevation: 2,
  },
  testCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    elevation: 4,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  testTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  testIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  testInfo: {
    flex: 1,
  },
  categoryChip: {
    height: 24,
  },
  resultContainer: {
    padding: SPACING.md,
    borderRadius: 12,
    elevation: 1,
    marginBottom: SPACING.md,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  performanceChip: {
    height: 24,
  },
  progressIndicator: {
    marginTop: SPACING.xs,
  },
  testActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  testButton: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  emptyCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    elevation: 2,
  },
  emptyState: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    margin: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: 16,
    maxHeight: '90%',
  },
  instructionsCard: {
    padding: SPACING.md,
    borderRadius: 12,
    elevation: 1,
    marginBottom: SPACING.lg,
  },
  inputContainer: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    ...TEXT_STYLES.body,
    marginBottom: SPACING.xs,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'white',
  },
  performancePrediction: {
    padding: SPACING.md,
    borderRadius: 12,
    elevation: 1,
    marginBottom: SPACING.lg,
  },
  predictionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  predictionChip: {
    height: 32,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
    gap: SPACING.md,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.lg,
    backgroundColor: COLORS.primary,
  },
  bottomSpacer: {
    height: 80,
  },
});

export default FitnessTests;