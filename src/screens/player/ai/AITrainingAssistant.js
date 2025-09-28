import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Vibration,
  StatusBar,
  RefreshControl,
  Animated,
  Modal,
  Dimensions,
} from 'react-native';
import { 
  Card,
  Button,
  Avatar,
  IconButton,
  Surface,
  Chip,
  ProgressBar,
  FAB,
  Portal,
  Searchbar,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';

// Design system imports
import { COLORS, SPACING, TEXT_STYLES } from '../styles/theme';

const { width, height } = Dimensions.get('window');

const AITrainingAssistant = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector(state => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('generate');
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('football');
  const [trainingLevel, setTrainingLevel] = useState('intermediate');
  const [trainingGoal, setTrainingGoal] = useState('performance');
  const [weeklyDays, setWeeklyDays] = useState(4);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [savedPlans, setSavedPlans] = useState([]);
  const [analysisData, setAnalysisData] = useState(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scrollViewRef = useRef();

  // Sports options
  const sportsOptions = [
    { id: 'football', label: 'Football ⚽', color: '#27ae60' },
    { id: 'basketball', label: 'Basketball 🏀', color: '#e67e22' },
    { id: 'tennis', label: 'Tennis 🎾', color: '#3498db' },
    { id: 'running', label: 'Running 🏃‍♂️', color: '#e74c3c' },
    { id: 'swimming', label: 'Swimming 🏊‍♂️', color: '#16a085' },
    { id: 'cycling', label: 'Cycling 🚴‍♂️', color: '#f39c12' },
  ];

  // Training levels
  const trainingLevels = [
    { id: 'beginner', label: 'Beginner', description: 'New to training', color: '#95a5a6' },
    { id: 'intermediate', label: 'Intermediate', description: '6+ months experience', color: '#3498db' },
    { id: 'advanced', label: 'Advanced', description: '2+ years experience', color: '#e74c3c' },
    { id: 'elite', label: 'Elite', description: 'Competitive athlete', color: '#9b59b6' },
  ];

  // Training goals
  const trainingGoals = [
    { id: 'performance', label: 'Performance', icon: 'trending-up', color: '#e74c3c' },
    { id: 'strength', label: 'Strength', icon: 'fitness-center', color: '#34495e' },
    { id: 'endurance', label: 'Endurance', icon: 'directions-run', color: '#27ae60' },
    { id: 'flexibility', label: 'Flexibility', icon: 'accessibility', color: '#9b59b6' },
    { id: 'recovery', label: 'Recovery', icon: 'spa', color: '#16a085' },
    { id: 'weight-loss', label: 'Weight Loss', icon: 'trending-down', color: '#f39c12' },
  ];

  // Quick analysis cards
  const quickAnalysis = [
    {
      id: 1,
      title: 'Weekly Progress',
      value: '85%',
      change: '+12%',
      icon: 'assessment',
      color: '#27ae60',
      description: 'Completion rate this week'
    },
    {
      id: 2,
      title: 'Training Load',
      value: 'Optimal',
      change: 'Balanced',
      icon: 'speed',
      color: '#3498db',
      description: 'Current intensity level'
    },
    {
      id: 3,
      title: 'Recovery Score',
      value: '92/100',
      change: '+5',
      icon: 'healing',
      color: '#9b59b6',
      description: 'Based on sleep & HRV'
    },
    {
      id: 4,
      title: 'Next Session',
      value: 'Tomorrow',
      change: 'Strength',
      icon: 'schedule',
      color: '#e74c3c',
      description: 'Upper body focus'
    },
  ];

  useEffect(() => {
    initializeData();
    animateEntrance();
    loadSavedPlans();
    loadAnalysisData();
  }, []);

  const animateEntrance = () => {
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
  };

  const initializeData = () => {
    // Initialize with user's sport preference if available
    if (user?.sport) {
      setSelectedSport(user.sport.toLowerCase());
    }
    if (user?.level) {
      setTrainingLevel(user.level.toLowerCase());
    }
  };

  const loadSavedPlans = async () => {
    try {
      // Simulate loading saved plans
      const mockPlans = [
        {
          id: 1,
          name: 'Summer Conditioning',
          sport: 'football',
          duration: '8 weeks',
          sessions: 32,
          completed: 24,
          createdAt: new Date('2024-07-01'),
        },
        {
          id: 2,
          name: 'Pre-Season Prep',
          sport: 'football',
          duration: '6 weeks',
          sessions: 24,
          completed: 24,
          createdAt: new Date('2024-06-01'),
        },
      ];
      setSavedPlans(mockPlans);
    } catch (error) {
      console.error('Error loading saved plans:', error);
    }
  };

  const loadAnalysisData = async () => {
    try {
      // Simulate loading analysis data
      const mockAnalysis = {
        weeklyStats: {
          sessionsCompleted: 5,
          totalDuration: 420, // minutes
          avgIntensity: 7.2,
          caloriesBurned: 2840,
        },
        trends: {
          strength: '+15%',
          endurance: '+8%',
          flexibility: '+5%',
          recovery: '+12%',
        },
        recommendations: [
          'Increase recovery time between high-intensity sessions',
          'Add more mobility work to your routine',
          'Consider periodization for better results',
        ],
      };
      setAnalysisData(mockAnalysis);
    } catch (error) {
      console.error('Error loading analysis data:', error);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([
      loadSavedPlans(),
      loadAnalysisData(),
    ]).finally(() => {
      setRefreshing(false);
    });
  }, []);

  const generateTrainingPlan = async () => {
    setGeneratingPlan(true);
    Vibration.vibrate(50);

    try {
      // Simulate AI plan generation
      setTimeout(() => {
        const mockPlan = {
          id: Date.now(),
          name: `${selectedSport.charAt(0).toUpperCase() + selectedSport.slice(1)} ${trainingGoal} Plan`,
          sport: selectedSport,
          level: trainingLevel,
          goal: trainingGoal,
          duration: '8 weeks',
          sessionsPerWeek: weeklyDays,
          totalSessions: weeklyDays * 8,
          weeks: generateWeeklyPlan(),
          createdAt: new Date(),
        };
        
        setGeneratedPlan(mockPlan);
        setGeneratingPlan(false);
        setShowPlanModal(true);
        
        // Show success alert
        Alert.alert(
          '🎉 Plan Generated!',
          `Your personalized ${trainingGoal} plan is ready! This ${mockPlan.duration} program is tailored for your ${trainingLevel} level.`,
          [{ text: 'View Plan', onPress: () => {} }]
        );
      }, 2500);
    } catch (error) {
      setGeneratingPlan(false);
      Alert.alert('Error', 'Failed to generate training plan. Please try again.');
    }
  };

  const generateWeeklyPlan = () => {
    const weeks = [];
    const exerciseTypes = {
      football: ['Ball Control', 'Shooting', 'Passing', 'Dribbling', 'Fitness'],
      basketball: ['Shooting', 'Dribbling', 'Defense', 'Conditioning', 'Agility'],
      tennis: ['Serve', 'Forehand', 'Backhand', 'Footwork', 'Conditioning'],
      running: ['Interval', 'Long Run', 'Tempo', 'Recovery', 'Strength'],
      swimming: ['Freestyle', 'Technique', 'Endurance', 'Sprint', 'Recovery'],
      cycling: ['Endurance', 'Intervals', 'Hill Training', 'Recovery', 'Technique'],
    };

    for (let week = 1; week <= 8; week++) {
      const weekPlan = {
        week,
        focus: week <= 2 ? 'Foundation' : week <= 4 ? 'Build' : week <= 6 ? 'Peak' : 'Recovery',
        sessions: [],
      };

      for (let day = 1; day <= weeklyDays; day++) {
        const exercises = exerciseTypes[selectedSport] || exerciseTypes.football;
        const sessionType = exercises[Math.floor(Math.random() * exercises.length)];
        
        weekPlan.sessions.push({
          day,
          type: sessionType,
          duration: 60 + Math.floor(Math.random() * 30),
          intensity: Math.floor(Math.random() * 3) + 1, // 1-3
          exercises: Math.floor(Math.random() * 3) + 4, // 4-6 exercises
        });
      }
      
      weeks.push(weekPlan);
    }
    
    return weeks;
  };

  const savePlan = (plan) => {
    setSavedPlans(prev => [plan, ...prev]);
    setShowPlanModal(false);
    Alert.alert('Success', 'Training plan saved successfully!');
    Vibration.vibrate(100);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'generate':
        return renderGeneratePlan();
      case 'saved':
        return renderSavedPlans();
      case 'analysis':
        return renderAnalysis();
      default:
        return renderGeneratePlan();
    }
  };

  const renderGeneratePlan = () => (
    <Animated.View style={[styles.tabContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      {/* Sport Selection */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>🏆 Select Your Sport</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipContainer}
          >
            {sportsOptions.map((sport) => (
              <Chip
                key={sport.id}
                mode={selectedSport === sport.id ? 'flat' : 'outlined'}
                selected={selectedSport === sport.id}
                onPress={() => setSelectedSport(sport.id)}
                style={[
                  styles.sportChip,
                  selectedSport === sport.id && { backgroundColor: sport.color }
                ]}
                textStyle={selectedSport === sport.id ? { color: '#fff' } : {}}
              >
                {sport.label}
              </Chip>
            ))}
          </ScrollView>
        </Card.Content>
      </Card>

      {/* Training Level */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>📊 Training Level</Text>
          <View style={styles.levelGrid}>
            {trainingLevels.map((level) => (
              <TouchableOpacity
                key={level.id}
                style={[
                  styles.levelCard,
                  trainingLevel === level.id && styles.selectedLevelCard,
                  { borderColor: level.color }
                ]}
                onPress={() => setTrainingLevel(level.id)}
              >
                <Text style={[
                  styles.levelTitle,
                  trainingLevel === level.id && styles.selectedLevelTitle
                ]}>
                  {level.label}
                </Text>
                <Text style={styles.levelDescription}>{level.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Training Goals */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>🎯 Primary Goal</Text>
          <View style={styles.goalsGrid}>
            {trainingGoals.map((goal) => (
              <TouchableOpacity
                key={goal.id}
                style={[
                  styles.goalCard,
                  trainingGoal === goal.id && { backgroundColor: goal.color }
                ]}
                onPress={() => setTrainingGoal(goal.id)}
              >
                <Icon 
                  name={goal.icon} 
                  size={24} 
                  color={trainingGoal === goal.id ? '#fff' : goal.color} 
                />
                <Text style={[
                  styles.goalText,
                  trainingGoal === goal.id && { color: '#fff' }
                ]}>
                  {goal.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Weekly Schedule */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>📅 Sessions Per Week</Text>
          <View style={styles.daysSelector}>
            {[3, 4, 5, 6].map((days) => (
              <TouchableOpacity
                key={days}
                style={[
                  styles.dayButton,
                  weeklyDays === days && styles.selectedDayButton
                ]}
                onPress={() => setWeeklyDays(days)}
              >
                <Text style={[
                  styles.dayButtonText,
                  weeklyDays === days && styles.selectedDayButtonText
                ]}>
                  {days}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Generate Button */}
      <TouchableOpacity
        style={styles.generateButton}
        onPress={generateTrainingPlan}
        disabled={generatingPlan}
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.generateGradient}
        >
          {generatingPlan ? (
            <View style={styles.generatingContainer}>
              <Text style={styles.generateButtonText}>Generating...</Text>
              <View style={styles.loadingDots}>
                <View style={[styles.dot, styles.dot1]} />
                <View style={[styles.dot, styles.dot2]} />
                <View style={[styles.dot, styles.dot3]} />
              </View>
            </View>
          ) : (
            <>
              <Icon name="auto-awesome" size={24} color="#fff" />
              <Text style={styles.generateButtonText}>Generate AI Plan</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderSavedPlans = () => (
    <Animated.View style={[styles.tabContent, { opacity: fadeAnim }]}>
      <Searchbar
        placeholder="Search plans..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
        iconColor={COLORS.primary}
      />
      
      {savedPlans.map((plan) => (
        <Card key={plan.id} style={styles.planCard}>
          <Card.Content>
            <View style={styles.planHeader}>
              <Text style={styles.planName}>{plan.name}</Text>
              <Chip icon="schedule" textStyle={styles.chipText}>
                {plan.duration}
              </Chip>
            </View>
            
            <View style={styles.planStats}>
              <View style={styles.planStat}>
                <Icon name="fitness-center" size={20} color={COLORS.primary} />
                <Text style={styles.planStatText}>
                  {plan.completed}/{plan.sessions} sessions
                </Text>
              </View>
              
              <View style={styles.planStat}>
                <Icon name="sports" size={20} color={COLORS.secondary} />
                <Text style={styles.planStatText}>
                  {plan.sport.charAt(0).toUpperCase() + plan.sport.slice(1)}
                </Text>
              </View>
            </View>
            
            <ProgressBar 
              progress={plan.completed / plan.sessions} 
              color={COLORS.primary}
              style={styles.progressBar}
            />
            
            <View style={styles.planActions}>
              <Button 
                mode="outlined" 
                onPress={() => Alert.alert('Feature Coming Soon', 'Plan editing will be available in the next update!')}
                style={styles.planActionButton}
              >
                View Details
              </Button>
              <Button 
                mode="contained" 
                onPress={() => Alert.alert('Feature Coming Soon', 'Plan continuation will be available in the next update!')}
                style={styles.planActionButton}
              >
                Continue
              </Button>
            </View>
          </Card.Content>
        </Card>
      ))}
    </Animated.View>
  );

  const renderAnalysis = () => (
    <Animated.View style={[styles.tabContent, { opacity: fadeAnim }]}>
      {/* Quick Stats */}
      <View style={styles.analysisGrid}>
        {quickAnalysis.map((item) => (
          <Card key={item.id} style={styles.analysisCard}>
            <Card.Content style={styles.analysisCardContent}>
              <View style={[styles.analysisIcon, { backgroundColor: `${item.color}20` }]}>
                <Icon name={item.icon} size={24} color={item.color} />
              </View>
              <Text style={styles.analysisTitle}>{item.title}</Text>
              <Text style={[styles.analysisValue, { color: item.color }]}>
                {item.value}
              </Text>
              <Text style={styles.analysisChange}>{item.change}</Text>
              <Text style={styles.analysisDescription}>{item.description}</Text>
            </Card.Content>
          </Card>
        ))}
      </View>

      {/* Weekly Overview */}
      {analysisData && (
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>📈 This Week's Performance</Text>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{analysisData.weeklyStats.sessionsCompleted}</Text>
                <Text style={styles.statLabel}>Sessions</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{Math.floor(analysisData.weeklyStats.totalDuration / 60)}h</Text>
                <Text style={styles.statLabel}>Duration</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{analysisData.weeklyStats.avgIntensity}/10</Text>
                <Text style={styles.statLabel}>Intensity</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{analysisData.weeklyStats.caloriesBurned}</Text>
                <Text style={styles.statLabel}>Calories</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* AI Recommendations */}
      {analysisData && (
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>🤖 AI Recommendations</Text>
            {analysisData.recommendations.map((rec, index) => (
              <View key={index} style={styles.recommendationItem}>
                <Icon name="lightbulb" size={20} color="#f39c12" />
                <Text style={styles.recommendationText}>{rec}</Text>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}
    </Animated.View>
  );

  const renderPlanModal = () => (
    <Portal>
      <Modal
        visible={showPlanModal}
        onDismiss={() => setShowPlanModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView
          style={styles.modalBlur}
          blurType="light"
          blurAmount={10}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🎉 Your AI Training Plan</Text>
            
            {generatedPlan && (
              <>
                <Text style={styles.modalSubtitle}>{generatedPlan.name}</Text>
                
                <View style={styles.modalStats}>
                  <View style={styles.modalStat}>
                    <Icon name="schedule" size={24} color={COLORS.primary} />
                    <Text style={styles.modalStatText}>{generatedPlan.duration}</Text>
                  </View>
                  <View style={styles.modalStat}>
                    <Icon name="fitness-center" size={24} color={COLORS.secondary} />
                    <Text style={styles.modalStatText}>{generatedPlan.totalSessions} sessions</Text>
                  </View>
                  <View style={styles.modalStat}>
                    <Icon name="trending-up" size={24} color="#27ae60" />
                    <Text style={styles.modalStatText}>{generatedPlan.goal}</Text>
                  </View>
                </View>
                
                <Text style={styles.modalDescription}>
                  This personalized plan is designed for your {generatedPlan.level} level in {generatedPlan.sport}. 
                  It includes {generatedPlan.sessionsPerWeek} sessions per week with progressive difficulty.
                </Text>
                
                <View style={styles.modalActions}>
                  <Button 
                    mode="outlined" 
                    onPress={() => setShowPlanModal(false)}
                    style={styles.modalButton}
                  >
                    Preview First
                  </Button>
                  <Button 
                    mode="contained" 
                    onPress={() => savePlan(generatedPlan)}
                    style={styles.modalButton}
                  >
                    Save & Start
                  </Button>
                </View>
              </>
            )}
          </View>
        </BlurView>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>AI Training Assistant</Text>
            <Text style={styles.headerSubtitle}>Personalized training plans powered by AI 🤖</Text>
          </View>
          
          <TouchableOpacity style={styles.helpButton}>
            <Icon name="help" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {[
          { id: 'generate', label: 'Generate', icon: 'auto-awesome' },
          { id: 'saved', label: 'My Plans', icon: 'bookmark' },
          { id: 'analysis', label: 'Analysis', icon: 'analytics' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && styles.activeTab
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Icon 
              name={tab.icon} 
              size={20} 
              color={activeTab === tab.id ? COLORS.primary : '#666'} 
            />
            <Text style={[
              styles.tabText,
              activeTab === tab.id && styles.activeTabText
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
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
      </ScrollView>

      {/* FAB */}
      <FAB
        icon="chat"
        style={styles.fab}
        onPress={() => navigation.navigate('AICoachChat')}
        color="#fff"
      />

      {renderPlanModal()}
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
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: '#fff',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
    textAlign: 'center',
  },
  helpButton: {
    padding: SPACING.xs,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: `${COLORS.primary}10`,
  },
  tabText: {
    ...TEXT_STYLES.body,
    color: '#666',
    marginLeft: SPACING.xs,
    fontSize: 12,
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.md,
  },
  tabContent: {
    flex: 1,
  },
  sectionCard: {
    marginBottom: SPACING.md,
    elevation: 3,
    borderRadius: 15,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    color: '#333',
    marginBottom: SPACING.md,
  },
  chipContainer: {
    paddingVertical: SPACING.sm,
  },
  sportChip: {
    marginRight: SPACING.sm,
    marginVertical: SPACING.xs,
  },
  levelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  levelCard: {
    width: '48%',
    padding: SPACING.md,
    borderWidth: 2,
    borderRadius: 12,
    marginVertical: SPACING.xs,
    backgroundColor: '#fff',
  },
  selectedLevelCard: {
    backgroundColor: `${COLORS.primary}10`,
  },
  levelTitle: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: '#333',
  },
  selectedLevelTitle: {
    color: COLORS.primary,
  },
  levelDescription: {
    ...TEXT_STYLES.caption,
    color: '#666',
    marginTop: SPACING.xs,
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  goalCard: {
    width: '31%',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 12,
    marginVertical: SPACING.xs,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  goalText: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
    textAlign: 'center',
    fontWeight: '500',
  },
  daysSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.sm,
  },
  dayButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  selectedDayButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dayButtonText: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: '#666',
  },
  selectedDayButtonText: {
    color: '#fff',
  },
  generateButton: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
  },
  generateGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
  },
  generateButtonText: {
    ...TEXT_STYLES.h3,
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: SPACING.sm,
  },
  generatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    marginLeft: SPACING.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginHorizontal: 2,
    opacity: 0.6,
  },
  dot1: {
    // Animation would be added here
  },
  dot2: {
    // Animation would be added here
  },
  dot3: {
    // Animation would be added here
  },
  searchbar: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  planCard: {
    marginBottom: SPACING.md,
    elevation: 3,
    borderRadius: 15,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  planName: {
    ...TEXT_STYLES.h3,
    color: '#333',
    flex: 1,
  },
  chipText: {
    fontSize: 12,
  },
  planStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: SPACING.sm,
  },
  planStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planStatText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    color: '#666',
  },
  progressBar: {
    marginVertical: SPACING.sm,
    height: 8,
    borderRadius: 4,
  },
  planActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  planActionButton: {
    flex: 0.48,
  },
  analysisGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  analysisCard: {
    width: '48%',
    marginVertical: SPACING.xs,
    elevation: 2,
    borderRadius: 12,
  },
  analysisCardContent: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  analysisIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  analysisTitle: {
    ...TEXT_STYLES.caption,
    color: '#666',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  analysisValue: {
    ...TEXT_STYLES.h2,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  analysisChange: {
    ...TEXT_STYLES.caption,
    color: '#27ae60',
    fontWeight: '500',
    marginTop: 2,
  },
  analysisDescription: {
    ...TEXT_STYLES.caption,
    color: '#999',
    textAlign: 'center',
    marginTop: SPACING.xs,
    fontSize: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    ...TEXT_STYLES.h3,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: '#666',
    marginTop: SPACING.xs,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
  },
  recommendationText: {
    ...TEXT_STYLES.body,
    color: '#333',
    marginLeft: SPACING.sm,
    flex: 1,
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBlur: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: SPACING.lg,
    padding: SPACING.xl,
    borderRadius: 20,
    elevation: 10,
    maxWidth: width * 0.9,
  },
  modalTitle: {
    ...TEXT_STYLES.h2,
    color: '#333',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  modalSubtitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  modalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.lg,
  },
  modalStat: {
    alignItems: 'center',
  },
  modalStatText: {
    ...TEXT_STYLES.caption,
    color: '#666',
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  modalDescription: {
    ...TEXT_STYLES.body,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 0.48,
  },
});

export default AITrainingAssistant;