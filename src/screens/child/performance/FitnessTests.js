import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Animated,
  StatusBar,
  Alert,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Modal,
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
  Searchbar,
  TextInput,
  Portal,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '@react-native-blur/blur';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width: screenWidth } = Dimensions.get('window');

const FitnessTests = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const fitnessData = useSelector(state => state.performance.fitnessTests);
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showTestModal, setShowTestModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [testResults, setTestResults] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const modalAnim = useRef(new Animated.Value(0)).current;

  // Mock fitness test data
  const fitnessTestsData = {
    categories: {
      strength: {
        name: 'Strength',
        icon: 'fitness-center',
        color: '#E53E3E',
        tests: ['push_ups', 'sit_ups', 'pull_ups', 'plank']
      },
      speed: {
        name: 'Speed & Agility',
        icon: 'speed',
        color: '#3182CE',
        tests: ['sprint_40m', 'shuttle_run', '20m_sprint']
      },
      endurance: {
        name: 'Endurance',
        icon: 'directions-run',
        color: '#38A169',
        tests: ['cooper_test', 'beep_test', '1_mile_run']
      },
      flexibility: {
        name: 'Flexibility',
        icon: 'accessibility',
        color: '#805AD5',
        tests: ['sit_reach', 'shoulder_flexibility']
      },
      power: {
        name: 'Power',
        icon: 'trending-up',
        color: '#D69E2E',
        tests: ['vertical_jump', 'standing_long_jump', 'medicine_ball_throw']
      }
    },
    tests: {
      push_ups: {
        name: 'Push-ups',
        description: 'Maximum push-ups in 1 minute',
        unit: 'reps',
        category: 'strength',
        instructions: 'Perform as many push-ups as possible in 1 minute with proper form.',
        benchmarks: {
          excellent: { male: 45, female: 35 },
          good: { male: 35, female: 25 },
          average: { male: 25, female: 15 },
          poor: { male: 15, female: 10 }
        }
      },
      sit_ups: {
        name: 'Sit-ups',
        description: 'Maximum sit-ups in 1 minute',
        unit: 'reps',
        category: 'strength',
        instructions: 'Perform as many sit-ups as possible in 1 minute.',
        benchmarks: {
          excellent: { male: 50, female: 45 },
          good: { male: 40, female: 35 },
          average: { male: 30, female: 25 },
          poor: { male: 20, female: 15 }
        }
      },
      pull_ups: {
        name: 'Pull-ups',
        description: 'Maximum pull-ups',
        unit: 'reps',
        category: 'strength',
        instructions: 'Perform as many pull-ups as possible with proper form.',
        benchmarks: {
          excellent: { male: 12, female: 8 },
          good: { male: 8, female: 5 },
          average: { male: 5, female: 3 },
          poor: { male: 2, female: 1 }
        }
      },
      plank: {
        name: 'Plank Hold',
        description: 'Maximum plank hold time',
        unit: 'seconds',
        category: 'strength',
        instructions: 'Hold a plank position for as long as possible.',
        benchmarks: {
          excellent: { male: 120, female: 90 },
          good: { male: 90, female: 60 },
          average: { male: 60, female: 45 },
          poor: { male: 30, female: 20 }
        }
      },
      sprint_40m: {
        name: '40m Sprint',
        description: '40 meter sprint time',
        unit: 'seconds',
        category: 'speed',
        instructions: 'Run 40 meters as fast as possible.',
        benchmarks: {
          excellent: { male: 5.5, female: 6.0 },
          good: { male: 6.0, female: 6.5 },
          average: { male: 6.5, female: 7.0 },
          poor: { male: 7.5, female: 8.0 }
        },
        lowerIsBetter: true
      },
      vertical_jump: {
        name: 'Vertical Jump',
        description: 'Maximum vertical jump height',
        unit: 'cm',
        category: 'power',
        instructions: 'Jump as high as possible from a standing position.',
        benchmarks: {
          excellent: { male: 65, female: 55 },
          good: { male: 55, female: 45 },
          average: { male: 45, female: 35 },
          poor: { male: 35, female: 25 }
        }
      },
      cooper_test: {
        name: 'Cooper Test',
        description: '12-minute run distance',
        unit: 'meters',
        category: 'endurance',
        instructions: 'Run as far as possible in 12 minutes.',
        benchmarks: {
          excellent: { male: 2800, female: 2500 },
          good: { male: 2500, female: 2200 },
          average: { male: 2200, female: 1900 },
          poor: { male: 1900, female: 1600 }
        }
      },
      sit_reach: {
        name: 'Sit & Reach',
        description: 'Flexibility measurement',
        unit: 'cm',
        category: 'flexibility',
        instructions: 'Reach forward as far as possible while seated.',
        benchmarks: {
          excellent: { male: 25, female: 30 },
          good: { male: 20, female: 25 },
          average: { male: 15, female: 20 },
          poor: { male: 10, female: 15 }
        }
      }
    },
    recentTests: [
      {
        id: '1',
        testId: 'push_ups',
        result: 32,
        date: '2024-08-28',
        improvement: '+5',
        rating: 'good'
      },
      {
        id: '2',
        testId: 'sprint_40m',
        result: 6.2,
        date: '2024-08-26',
        improvement: '-0.3',
        rating: 'good'
      },
      {
        id: '3',
        testId: 'vertical_jump',
        result: 48,
        date: '2024-08-24',
        improvement: '+3',
        rating: 'average'
      },
      {
        id: '4',
        testId: 'plank',
        result: 75,
        date: '2024-08-22',
        improvement: '+15',
        rating: 'good'
      }
    ]
  };

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
    ]).start();

    loadFitnessData();
  }, []);

  const loadFitnessData = useCallback(async () => {
    try {
      // In a real app, this would fetch from API or local storage
      console.log('Loading fitness test data...');
    } catch (error) {
      Alert.alert('Error', 'Failed to load fitness test data');
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFitnessData();
    setRefreshing(false);
  }, [loadFitnessData]);

  const openTestModal = (testId) => {
    const test = fitnessTestsData.tests[testId];
    setSelectedTest({ id: testId, ...test });
    setTestResults({});
    setShowTestModal(true);
    Animated.timing(modalAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeTestModal = () => {
    Animated.timing(modalAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowTestModal(false);
      setSelectedTest(null);
    });
  };

  const saveTestResult = () => {
    if (!testResults.value) {
      Alert.alert('Error', 'Please enter a test result');
      return;
    }

    Alert.alert(
      'Test Recorded!',
      `${selectedTest.name}: ${testResults.value} ${selectedTest.unit}`,
      [
        {
          text: 'OK',
          onPress: () => {
            // In a real app, save to Redux/API
            closeTestModal();
          }
        }
      ]
    );
  };

  const getRatingColor = (rating) => {
    switch (rating) {
      case 'excellent': return COLORS.success;
      case 'good': return '#4CAF50';
      case 'average': return COLORS.warning;
      case 'poor': return COLORS.error;
      default: return COLORS.secondary;
    }
  };

  const getBenchmarkRating = (testId, result, gender = 'male') => {
    const test = fitnessTestsData.tests[testId];
    if (!test || !test.benchmarks) return 'average';

    const benchmarks = test.benchmarks;
    const isLowerBetter = test.lowerIsBetter;

    if (isLowerBetter) {
      if (result <= benchmarks.excellent[gender]) return 'excellent';
      if (result <= benchmarks.good[gender]) return 'good';
      if (result <= benchmarks.average[gender]) return 'average';
      return 'poor';
    } else {
      if (result >= benchmarks.excellent[gender]) return 'excellent';
      if (result >= benchmarks.good[gender]) return 'good';
      if (result >= benchmarks.average[gender]) return 'average';
      return 'poor';
    }
  };

  const renderOverviewStats = () => {
    const totalTests = fitnessTestsData.recentTests.length;
    const excellentTests = fitnessTestsData.recentTests.filter(t => t.rating === 'excellent').length;
    const improvementTests = fitnessTestsData.recentTests.filter(t => 
      t.improvement && (t.improvement.startsWith('+') || t.improvement.startsWith('-'))
    ).length;

    return (
      <Card style={styles.overviewCard}>
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.overviewHeader}>
          <Text style={styles.overviewTitle}>🏅 Fitness Assessment</Text>
        </LinearGradient>
        <Card.Content>
          <View style={styles.statsGrid}>
            <View style={styles.overviewStat}>
              <Icon name="assessment" size={24} color={COLORS.primary} />
              <Text style={styles.statNumber}>{totalTests}</Text>
              <Text style={styles.statLabel}>Tests Completed</Text>
            </View>
            <View style={styles.overviewStat}>
              <Icon name="jump-rope" size={24} color={COLORS.success} />
              <Text style={styles.statNumber}>{excellentTests}</Text>
              <Text style={styles.statLabel}>Excellent Scores</Text>
            </View>
            <View style={styles.overviewStat}>
              <Icon name="trending-up" size={24} color={COLORS.warning} />
              <Text style={styles.statNumber}>{improvementTests}</Text>
              <Text style={styles.statLabel}>Improvements</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderTestCategories = () => {
    const categories = Object.entries(fitnessTestsData.categories);
    
    return (
      <Card style={styles.categoriesCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>🎯 Test Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                styles.categoryChip,
                { backgroundColor: selectedCategory === 'all' ? COLORS.primary : COLORS.surface }
              ]}
              onPress={() => setSelectedCategory('all')}
            >
              <Icon 
                name="fitness-center" 
                size={20} 
                color={selectedCategory === 'all' ? '#FFFFFF' : COLORS.secondary} 
              />
              <Text style={[
                styles.categoryChipText,
                { color: selectedCategory === 'all' ? '#FFFFFF' : COLORS.secondary }
              ]}>
                All Tests
              </Text>
            </TouchableOpacity>
            
            {categories.map(([key, category]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.categoryChip,
                  { backgroundColor: selectedCategory === key ? category.color : COLORS.surface }
                ]}
                onPress={() => setSelectedCategory(key)}
              >
                <Icon 
                  name={category.icon} 
                  size={20} 
                  color={selectedCategory === key ? '#FFFFFF' : COLORS.secondary} 
                />
                <Text style={[
                  styles.categoryChipText,
                  { color: selectedCategory === key ? '#FFFFFF' : COLORS.secondary }
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Card.Content>
      </Card>
    );
  };

  const renderTestGrid = () => {
    let testsToShow = Object.entries(fitnessTestsData.tests);
    
    if (selectedCategory !== 'all') {
      testsToShow = testsToShow.filter(([key, test]) => test.category === selectedCategory);
    }

    if (searchQuery) {
      testsToShow = testsToShow.filter(([key, test]) =>
        test.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return (
      <Card style={styles.testsCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>📋 Available Tests</Text>
          <View style={styles.testsGrid}>
            {testsToShow.map(([key, test]) => {
              const category = fitnessTestsData.categories[test.category];
              const recentResult = fitnessTestsData.recentTests.find(r => r.testId === key);
              
              return (
                <TouchableOpacity
                  key={key}
                  style={styles.testCard}
                  onPress={() => openTestModal(key)}
                >
                  <View style={[styles.testIcon, { backgroundColor: category.color + '20' }]}>
                    <Icon name={category.icon} size={24} color={category.color} />
                  </View>
                  <Text style={styles.testName}>{test.name}</Text>
                  <Text style={styles.testDescription} numberOfLines={2}>
                    {test.description}
                  </Text>
                  {recentResult && (
                    <View style={styles.recentResult}>
                      <Text style={styles.resultValue}>
                        {recentResult.result} {test.unit}
                      </Text>
                      <Chip
                        mode="outlined"
                        compact
                        textStyle={{ color: getRatingColor(recentResult.rating) }}
                        style={{ borderColor: getRatingColor(recentResult.rating) }}
                      >
                        {recentResult.rating}
                      </Chip>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderRecentTests = () => {
    return (
      <Card style={styles.recentCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>📈 Recent Test Results</Text>
          {fitnessTestsData.recentTests.map((result) => {
            const test = fitnessTestsData.tests[result.testId];
            const category = fitnessTestsData.categories[test.category];
            
            return (
              <View key={result.id} style={styles.resultItem}>
                <View style={styles.resultHeader}>
                  <View style={[styles.resultIcon, { backgroundColor: category.color + '20' }]}>
                    <Icon name={category.icon} size={20} color={category.color} />
                  </View>
                  <View style={styles.resultInfo}>
                    <Text style={styles.resultTestName}>{test.name}</Text>
                    <Text style={styles.resultDate}>
                      {new Date(result.date).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.resultStats}>
                    <Text style={styles.resultValue}>
                      {result.result} {test.unit}
                    </Text>
                    <View style={styles.resultImprovement}>
                      {result.improvement && (
                        <Text style={[
                          styles.improvementText,
                          { color: result.improvement.startsWith('+') ? COLORS.success : COLORS.error }
                        ]}>
                          {result.improvement}
                        </Text>
                      )}
                      <Chip
                        mode="outlined"
                        compact
                        textStyle={{ color: getRatingColor(result.rating) }}
                        style={{ borderColor: getRatingColor(result.rating) }}
                      >
                        {result.rating}
                      </Chip>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </Card.Content>
      </Card>
    );
  };

  const renderTestModal = () => {
    if (!selectedTest) return null;

    const category = fitnessTestsData.categories[selectedTest.category];
    const benchmarks = selectedTest.benchmarks;

    return (
      <Portal>
        <Modal
          visible={showTestModal}
          transparent
          animationType="none"
          onRequestClose={closeTestModal}
        >
          <BlurView style={styles.modalOverlay} blurType="dark" blurAmount={10}>
            <Animated.View
              style={[
                styles.modalContent,
                {
                  opacity: modalAnim,
                  transform: [{
                    scale: modalAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  }],
                },
              ]}
            >
              <LinearGradient colors={[category.color, category.color + 'CC']} style={styles.modalHeader}>
                <View style={styles.modalTitleContainer}>
                  <Icon name={category.icon} size={28} color="#FFFFFF" />
                  <View style={styles.modalTitleText}>
                    <Text style={styles.modalTitle}>{selectedTest.name}</Text>
                    <Text style={styles.modalCategory}>{category.name}</Text>
                  </View>
                </View>
                <IconButton
                  icon="close"
                  iconColor="#FFFFFF"
                  size={24}
                  onPress={closeTestModal}
                />
              </LinearGradient>

              <ScrollView style={styles.modalBody}>
                <View style={styles.instructionsSection}>
                  <Text style={styles.modalSectionTitle}>📝 Instructions</Text>
                  <Text style={styles.instructionsText}>{selectedTest.instructions}</Text>
                </View>

                <View style={styles.benchmarksSection}>
                  <Text style={styles.modalSectionTitle}>🎯 Performance Benchmarks</Text>
                  {benchmarks && Object.entries(benchmarks).map(([rating, values]) => (
                    <View key={rating} style={styles.benchmarkItem}>
                      <View style={styles.benchmarkHeader}>
                        <View style={[styles.ratingDot, { backgroundColor: getRatingColor(rating) }]} />
                        <Text style={[styles.ratingText, { color: getRatingColor(rating) }]}>
                          {rating.charAt(0).toUpperCase() + rating.slice(1)}
                        </Text>
                      </View>
                      <Text style={styles.benchmarkValues}>
                        Male: {values.male} {selectedTest.unit} | Female: {values.female} {selectedTest.unit}
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={styles.inputSection}>
                  <Text style={styles.modalSectionTitle}>📊 Record Your Result</Text>
                  <TextInput
                    mode="outlined"
                    label={`Result (${selectedTest.unit})`}
                    value={testResults.value}
                    onChangeText={(text) => setTestResults({ ...testResults, value: text })}
                    keyboardType="numeric"
                    style={styles.resultInput}
                  />
                </View>
              </ScrollView>

              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={closeTestModal}
                  style={styles.modalButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={saveTestResult}
                  style={[styles.modalButton, { backgroundColor: category.color }]}
                >
                  Save Result
                </Button>
              </View>
            </Animated.View>
          </BlurView>
        </Modal>
      </Portal>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>🏅 Fitness Tests</Text>
          <Text style={styles.headerSubtitle}>Track your fitness benchmarks</Text>
        </View>
      </LinearGradient>

      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Searchbar
          placeholder="Search fitness tests..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={COLORS.primary}
        />

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
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        >
          {renderOverviewStats()}
          {renderTestCategories()}
          {renderTestGrid()}
          {renderRecentTests()}
        </ScrollView>
      </Animated.View>

      {renderTestModal()}

      <FAB
        icon="add"
        style={[styles.fab, { backgroundColor: COLORS.primary }]}
        onPress={() => Alert.alert('Feature Coming Soon', 'Custom test creation will be available soon!')}
      />
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight || 44,
    paddingBottom: SPACING.large,
    paddingHorizontal: SPACING.medium,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: '#FFFFFF',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.medium,
  },
  searchBar: {
    marginTop: SPACING.medium,
    marginBottom: SPACING.medium,
    elevation: 2,
  },
  scrollView: {
    flex: 1,
  },
  overviewCard: {
    marginBottom: SPACING.medium,
    elevation: 4,
  },
  overviewHeader: {
    padding: SPACING.medium,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  overviewTitle: {
    ...TEXT_STYLES.h3,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.medium,
  },
  overviewStat: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    ...TEXT_STYLES.h2,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginTop: SPACING.xs,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
    textAlign: 'center',
  },
  categoriesCard: {
    marginBottom: SPACING.medium,
    elevation: 2,
  },
  sectionTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.primary,
    marginBottom: SPACING.medium,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: 25,
    marginRight: SPACING.small,
    elevation: 2,
  },
  categoryChipText: {
    marginLeft: SPACING.small,
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
  },
  testsCard: {
    marginBottom: SPACING.medium,
    elevation: 2,
  },
  testsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  testCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.medium,
    marginBottom: SPACING.medium,
    elevation: 2,
    alignItems: 'center',
  },
  testIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.small,
  },
  testName: {
    ...TEXT_STYLES.h4,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  testDescription: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
    textAlign: 'center',
    marginBottom: SPACING.small,
  },
  recentResult: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  resultValue: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  recentCard: {
    marginBottom: SPACING.large,
    elevation: 2,
  },
  resultItem: {
    marginBottom: SPACING.medium,
    paddingBottom: SPACING.medium,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.medium,
  },
  resultInfo: {
    flex: 1,
  },
  resultTestName: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  resultDate: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
  },
  resultStats: {
    alignItems: 'flex-end',
  },
  resultImprovement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.small,
    marginTop: SPACING.xs,
  },
  improvementText: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.medium,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    maxHeight: '90%',
    width: '100%',
    elevation: 10,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.medium,
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalTitleText: {
    marginLeft: SPACING.medium,
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  modalCategory: {
    ...TEXT_STYLES.body,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  modalBody: {
    flex: 1,
    padding: SPACING.medium,
  },
  modalSectionTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.primary,
    marginBottom: SPACING.medium,
  },
  instructionsSection: {
    marginBottom: SPACING.large,
  },
  instructionsText: {
    ...TEXT_STYLES.body,
    color: COLORS.secondary,
    lineHeight: 22,
    backgroundColor: COLORS.surface,
    padding: SPACING.medium,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  benchmarksSection: {
    marginBottom: SPACING.large,
  },
  benchmarkItem: {
    marginBottom: SPACING.medium,
    backgroundColor: COLORS.surface,
    padding: SPACING.medium,
    borderRadius: 8,
  },
  benchmarkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.small,
  },
  ratingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.small,
  },
  ratingText: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
  },
  benchmarkValues: {
    ...TEXT_STYLES.body,
    color: COLORS.secondary,
    marginLeft: SPACING.large,
  },
  inputSection: {
    marginBottom: SPACING.medium,
  },
  resultInput: {
    backgroundColor: '#FFFFFF',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SPACING.medium,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.medium,
  },
  modalButton: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: SPACING.medium,
    bottom: SPACING.medium,
  },
};

export default FitnessTests;