import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  Animated,
  Dimensions,
  RefreshControl,
  FlatList,
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
  Searchbar,
  TextInput,
  RadioButton,
  Checkbox,
  Slider,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const PersonalizedPlans = ({ navigation }) => {
  // Redux state
  const dispatch = useDispatch();
  const { user, theme } = useSelector(state => state.auth);
  const { plans, isLoading } = useSelector(state => state.training);

  // Component state
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('myPlans');
  const [showPlanGenerator, setShowPlanGenerator] = useState(false);
  const [showPlanDetails, setShowPlanDetails] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [userProfile, setUserProfile] = useState({
    fitnessLevel: 'intermediate',
    primaryGoal: 'strength',
    workoutDays: 4,
    sessionDuration: 60,
    availableEquipment: ['dumbbells', 'barbell', 'bodyweight'],
    injuries: [],
    preferences: {
      intensity: 'moderate',
      workoutTypes: ['strength', 'cardio'],
      focusAreas: ['fullBody']
    }
  });

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Mock data
  const myPlans = [
    {
      id: 1,
      title: '🏋️ Strength Builder Pro',
      type: 'Strength Training',
      duration: '12 weeks',
      difficulty: 'Intermediate',
      progress: 65,
      sessionsCompleted: 26,
      totalSessions: 40,
      aiGenerated: true,
      tags: ['Upper Body', 'Lower Body', 'Core'],
      nextWorkout: 'Push Day - Upper Focus',
      estimatedCalories: 320,
      lastUpdated: '2 days ago',
    },
    {
      id: 2,
      title: '🏃‍♂️ HIIT Cardio Blast',
      type: 'Cardio',
      duration: '8 weeks',
      difficulty: 'Advanced',
      progress: 80,
      sessionsCompleted: 25,
      totalSessions: 32,
      aiGenerated: true,
      tags: ['HIIT', 'Fat Loss', 'Endurance'],
      nextWorkout: 'Tabata Intervals',
      estimatedCalories: 450,
      lastUpdated: '1 day ago',
    },
    {
      id: 3,
      title: '🧘‍♀️ Flexibility & Mobility',
      type: 'Recovery',
      duration: '6 weeks',
      difficulty: 'Beginner',
      progress: 45,
      sessionsCompleted: 14,
      totalSessions: 24,
      aiGenerated: false,
      tags: ['Stretching', 'Yoga', 'Recovery'],
      nextWorkout: 'Morning Flow Routine',
      estimatedCalories: 180,
      lastUpdated: '3 days ago',
    },
  ];

  const recommendedPlans = [
    {
      id: 4,
      title: '🎯 Targeted Fat Loss',
      type: 'Weight Loss',
      duration: '10 weeks',
      difficulty: 'Intermediate',
      rating: 4.8,
      participants: 2840,
      aiGenerated: true,
      tags: ['Fat Loss', 'Cardio', 'Strength'],
      description: 'AI-optimized plan combining cardio and strength training',
      estimatedResults: 'Lose 8-12 lbs, gain muscle tone',
    },
    {
      id: 5,
      title: '💪 Muscle Building Mastery',
      type: 'Muscle Gain',
      duration: '16 weeks',
      difficulty: 'Advanced',
      rating: 4.9,
      participants: 1560,
      aiGenerated: true,
      tags: ['Hypertrophy', 'Progressive Overload'],
      description: 'Science-backed hypertrophy program',
      estimatedResults: 'Gain 5-8 lbs lean muscle',
    },
  ];

  const planTemplates = [
    { id: 1, name: 'Strength Training', icon: '🏋️', popular: true },
    { id: 2, name: 'Weight Loss', icon: '🔥', popular: true },
    { id: 3, name: 'Muscle Building', icon: '💪', popular: false },
    { id: 4, name: 'Endurance', icon: '🏃‍♂️', popular: false },
    { id: 5, name: 'Flexibility', icon: '🧘‍♀️', popular: false },
    { id: 6, name: 'Sport-Specific', icon: '⚽', popular: false },
  ];

  // Initialize animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const handleGeneratePlan = () => {
    setGeneratingPlan(true);
    setGenerationProgress(0);
    setShowPlanGenerator(false);
    
    // Simulate AI plan generation
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setGeneratingPlan(false);
          Vibration.vibrate([100, 200, 100]);
          Alert.alert(
            '🎉 Plan Generated!',
            'Your personalized AI training plan is ready!',
            [{ text: 'View Plan', onPress: () => setActiveTab('myPlans') }]
          );
          return 100;
        }
        return prev + 8;
      });
    }, 300);
  };

  const renderPlanCard = (plan, isRecommended = false) => (
    <TouchableOpacity
      key={plan.id}
      style={styles.planCard}
      onPress={() => {
        setSelectedPlan(plan);
        setShowPlanDetails(true);
        Vibration.vibrate(30);
      }}
    >
      <Card style={styles.card} elevation={3}>
        {/* Plan Header */}
        <View style={styles.planHeader}>
          <View style={styles.planTitleSection}>
            <Text style={styles.planTitle}>{plan.title}</Text>
            <View style={styles.planMeta}>
              <Text style={styles.planType}>{plan.type}</Text>
              <Text style={styles.planDuration}>{plan.duration}</Text>
              {plan.aiGenerated && (
                <Chip
                  mode="outlined"
                  compact
                  icon="auto-awesome"
                  style={styles.aiChip}
                  textStyle={styles.aiChipText}
                >
                  AI
                </Chip>
              )}
            </View>
          </View>
          
          <View style={styles.planActions}>
            {isRecommended ? (
              <View style={styles.ratingContainer}>
                <Icon name="star" size={16} color={COLORS.warning} />
                <Text style={styles.rating}>{plan.rating}</Text>
              </View>
            ) : (
              <Text style={styles.progressText}>{Math.round(plan.progress)}%</Text>
            )}
          </View>
        </View>

        {/* Progress Bar (for my plans) */}
        {!isRecommended && (
          <View style={styles.progressSection}>
            <ProgressBar
              progress={plan.progress / 100}
              color={COLORS.primary}
              style={styles.progressBar}
            />
            <Text style={styles.sessionProgress}>
              {plan.sessionsCompleted}/{plan.totalSessions} sessions completed
            </Text>
          </View>
        )}

        {/* Tags */}
        <View style={styles.tagsContainer}>
          {plan.tags.map((tag, index) => (
            <Chip
              key={index}
              mode="outlined"
              compact
              style={styles.tag}
              textStyle={styles.tagText}
            >
              {tag}
            </Chip>
          ))}
        </View>

        {/* Plan Stats */}
        <View style={styles.planStats}>
          <View style={styles.statItem}>
            <Icon name="fitness-center" size={16} color={COLORS.primary} />
            <Text style={styles.statText}>
              {isRecommended ? plan.difficulty : plan.nextWorkout}
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Icon name="local-fire-department" size={16} color={COLORS.error} />
            <Text style={styles.statText}>
              {isRecommended ? `${plan.participants} users` : `~${plan.estimatedCalories} cal`}
            </Text>
          </View>
        </View>

        {/* Action Button */}
        <Button
          mode={isRecommended ? "contained" : "outlined"}
          onPress={() => {
            if (isRecommended) {
              Alert.alert('Add Plan', `Add "${plan.title}" to your training plans?`);
            } else {
              navigation.navigate('WorkoutSession', { plan });
            }
          }}
          style={styles.planButton}
          icon={isRecommended ? "add" : "play-arrow"}
        >
          {isRecommended ? 'Add Plan' : 'Continue Training'}
        </Button>
      </Card>
    </TouchableOpacity>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'myPlans':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>📋 My Training Plans</Text>
            {myPlans.map(plan => renderPlanCard(plan))}
          </View>
        );
      
      case 'recommended':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>🎯 Recommended for You</Text>
            <Text style={styles.sectionDescription}>
              AI-curated plans based on your goals and progress
            </Text>
            {recommendedPlans.map(plan => renderPlanCard(plan, true))}
          </View>
        );
      
      case 'templates':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>📝 Plan Templates</Text>
            <Text style={styles.sectionDescription}>
              Quick-start templates for common fitness goals
            </Text>
            <View style={styles.templatesGrid}>
              {planTemplates.map(template => (
                <TouchableOpacity
                  key={template.id}
                  style={styles.templateCard}
                  onPress={() => {
                    setUserProfile({...userProfile, primaryGoal: template.name.toLowerCase()});
                    setShowPlanGenerator(true);
                  }}
                >
                  <Surface style={styles.templateSurface} elevation={2}>
                    <Text style={styles.templateIcon}>{template.icon}</Text>
                    <Text style={styles.templateName}>{template.name}</Text>
                    {template.popular && (
                      <Chip
                        mode="outlined"
                        compact
                        style={styles.popularChip}
                        textStyle={styles.popularText}
                      >
                        Popular
                      </Chip>
                    )}
                  </Surface>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      
      default:
        return null;
    }
  };

  const renderPlanGenerator = () => (
    <Portal>
      <Modal
        visible={showPlanGenerator}
        onDismiss={() => setShowPlanGenerator(false)}
        contentContainerStyle={styles.generatorModal}
      >
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>🤖 AI Plan Generator</Text>
          <IconButton
            icon="close"
            onPress={() => setShowPlanGenerator(false)}
            iconColor={COLORS.primary}
          />
        </View>

        <ScrollView style={styles.generatorContent}>
          {/* Fitness Level */}
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>💪 Fitness Level</Text>
            <RadioButton.Group
              onValueChange={value => setUserProfile({...userProfile, fitnessLevel: value})}
              value={userProfile.fitnessLevel}
            >
              {['beginner', 'intermediate', 'advanced'].map(level => (
                <View key={level} style={styles.radioItem}>
                  <RadioButton value={level} />
                  <Text style={styles.radioLabel}>{level.charAt(0).toUpperCase() + level.slice(1)}</Text>
                </View>
              ))}
            </RadioButton.Group>
          </View>

          {/* Primary Goal */}
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>🎯 Primary Goal</Text>
            <View style={styles.chipGroup}>
              {['strength', 'weight loss', 'muscle gain', 'endurance', 'flexibility'].map(goal => (
                <Chip
                  key={goal}
                  mode={userProfile.primaryGoal === goal ? 'flat' : 'outlined'}
                  selected={userProfile.primaryGoal === goal}
                  onPress={() => setUserProfile({...userProfile, primaryGoal: goal})}
                  style={styles.goalChip}
                >
                  {goal.charAt(0).toUpperCase() + goal.slice(1)}
                </Chip>
              ))}
            </View>
          </View>

          {/* Workout Frequency */}
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>📅 Workout Days per Week: {userProfile.workoutDays}</Text>
            <Slider
              value={userProfile.workoutDays}
              onValueChange={value => setUserProfile({...userProfile, workoutDays: Math.round(value)})}
              minimumValue={2}
              maximumValue={7}
              step={1}
              thumbStyle={{ backgroundColor: COLORS.primary }}
              trackStyle={{ backgroundColor: COLORS.primary + '30' }}
            />
          </View>

          {/* Session Duration */}
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>⏱️ Session Duration: {userProfile.sessionDuration} min</Text>
            <Slider
              value={userProfile.sessionDuration}
              onValueChange={value => setUserProfile({...userProfile, sessionDuration: Math.round(value)})}
              minimumValue={30}
              maximumValue={120}
              step={15}
              thumbStyle={{ backgroundColor: COLORS.primary }}
              trackStyle={{ backgroundColor: COLORS.primary + '30' }}
            />
          </View>

          {/* Equipment */}
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>🏋️ Available Equipment</Text>
            <View style={styles.equipmentGrid}>
              {['bodyweight', 'dumbbells', 'barbell', 'resistance bands', 'kettlebells', 'cables'].map(equipment => (
                <TouchableOpacity
                  key={equipment}
                  style={[
                    styles.equipmentItem,
                    userProfile.availableEquipment.includes(equipment) && styles.equipmentSelected
                  ]}
                  onPress={() => {
                    const newEquipment = userProfile.availableEquipment.includes(equipment)
                      ? userProfile.availableEquipment.filter(e => e !== equipment)
                      : [...userProfile.availableEquipment, equipment];
                    setUserProfile({...userProfile, availableEquipment: newEquipment});
                  }}
                >
                  <Text style={styles.equipmentText}>{equipment}</Text>
                  {userProfile.availableEquipment.includes(equipment) && (
                    <Icon name="check" size={16} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.generatorActions}>
          <Button
            mode="contained"
            onPress={handleGeneratePlan}
            style={styles.generateButton}
            icon="auto-awesome"
          >
            Generate AI Plan
          </Button>
        </View>
      </Modal>
    </Portal>
  );

  const renderPlanDetails = () => (
    <Portal>
      <Modal
        visible={showPlanDetails}
        onDismiss={() => setShowPlanDetails(false)}
        contentContainerStyle={styles.detailsModal}
      >
        {selectedPlan && (
          <>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedPlan.title}</Text>
              <IconButton
                icon="close"
                onPress={() => setShowPlanDetails(false)}
                iconColor={COLORS.primary}
              />
            </View>

            <ScrollView style={styles.detailsContent}>
              {/* Plan Overview */}
              <Card style={styles.overviewCard}>
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.overviewGradient}
                >
                  <Text style={styles.overviewTitle}>Plan Overview</Text>
                  <View style={styles.overviewStats}>
                    <View style={styles.overviewStat}>
                      <Text style={styles.overviewStatValue}>{selectedPlan.duration}</Text>
                      <Text style={styles.overviewStatLabel}>Duration</Text>
                    </View>
                    <View style={styles.overviewStat}>
                      <Text style={styles.overviewStatValue}>{selectedPlan.difficulty}</Text>
                      <Text style={styles.overviewStatLabel}>Level</Text>
                    </View>
                    <View style={styles.overviewStat}>
                      <Text style={styles.overviewStatValue}>{selectedPlan.progress || 0}%</Text>
                      <Text style={styles.overviewStatLabel}>Progress</Text>
                    </View>
                  </View>
                </LinearGradient>
              </Card>

              {/* Weekly Schedule */}
              <Card style={styles.scheduleCard}>
                <Text style={styles.cardTitle}>📅 Weekly Schedule</Text>
                <View style={styles.weeklySchedule}>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                    <View key={day} style={styles.dayItem}>
                      <Text style={styles.dayLabel}>{day}</Text>
                      <View style={[
                        styles.dayIndicator,
                        { backgroundColor: [1, 3, 5].includes(index) ? COLORS.primary : COLORS.border }
                      ]} />
                    </View>
                  ))}
                </View>
              </Card>

              {/* Exercise Preview */}
              <Card style={styles.exercisesCard}>
                <Text style={styles.cardTitle}>🏋️ Sample Exercises</Text>
                {[
                  { name: 'Barbell Squats', sets: '4x8-10', muscle: 'Legs' },
                  { name: 'Bench Press', sets: '3x6-8', muscle: 'Chest' },
                  { name: 'Deadlifts', sets: '3x5', muscle: 'Back' },
                  { name: 'Overhead Press', sets: '3x8', muscle: 'Shoulders' },
                ].map((exercise, index) => (
                  <View key={index} style={styles.exerciseItem}>
                    <View style={styles.exerciseInfo}>
                      <Text style={styles.exerciseName}>{exercise.name}</Text>
                      <Text style={styles.exerciseMuscle}>{exercise.muscle}</Text>
                    </View>
                    <Text style={styles.exerciseSets}>{exercise.sets}</Text>
                  </View>
                ))}
              </Card>

              {/* AI Insights */}
              {selectedPlan.aiGenerated && (
                <Card style={styles.insightsCard}>
                  <Text style={styles.cardTitle}>🤖 AI Insights</Text>
                  <Text style={styles.insightText}>
                    This plan is optimized for your {selectedPlan.type.toLowerCase()} goals using machine learning algorithms that analyze thousands of successful training programs.
                  </Text>
                  <View style={styles.insightPoints}>
                    <Text style={styles.insightPoint}>• Progressive overload automatically adjusted</Text>
                    <Text style={styles.insightPoint}>• Exercise selection based on your preferences</Text>
                    <Text style={styles.insightPoint}>• Recovery periods optimized for your fitness level</Text>
                  </View>
                </Card>
              )}
            </ScrollView>

            <View style={styles.detailsActions}>
              <Button
                mode="contained"
                onPress={() => {
                  setShowPlanDetails(false);
                  navigation.navigate('WorkoutSession', { plan: selectedPlan });
                }}
                style={styles.startButton}
                icon="play-arrow"
              >
                Start Workout
              </Button>
            </View>
          </>
        )}
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <Text style={styles.headerTitle}>🎯 Personalized Plans</Text>
        <Text style={styles.headerSubtitle}>
          AI-powered training plans tailored to your goals
        </Text>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {[
          { key: 'myPlans', label: 'My Plans', icon: 'fitness-center' },
          { key: 'recommended', label: 'Recommended', icon: 'recommend' },
          { key: 'templates', label: 'Templates', icon: 'view-module' },
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => {
              setActiveTab(tab.key);
              Vibration.vibrate(30);
            }}
          >
            <Icon
              name={tab.icon}
              size={20}
              color={activeTab === tab.key ? COLORS.primary : COLORS.text + '60'}
            />
            <Text style={[
              styles.tabLabel,
              activeTab === tab.key && styles.activeTabLabel
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search plans..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchBar}
          iconColor={COLORS.primary}
        />
      </View>

      {/* Content */}
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        >
          {renderTabContent()}
        </ScrollView>
      </Animated.View>

      {/* Plan Generation Progress */}
      {generatingPlan && (
        <Portal>
          <Modal
            visible={generatingPlan}
            contentContainerStyle={styles.progressModal}
          >
            <View style={styles.progressContent}>
              <Text style={styles.progressTitle}>🤖 Generating Your Plan...</Text>
              <ProgressBar
                progress={generationProgress / 100}
                color={COLORS.primary}
                style={styles.generationProgressBar}
              />
              <Text style={styles.progressText}>{generationProgress}% Complete</Text>
              <Text style={styles.progressSteps}>
                {generationProgress < 25 ? '🎯 Analyzing your goals...' :
                 generationProgress < 50 ? '📊 Calculating optimal volume...' :
                 generationProgress < 75 ? '🏋️ Selecting exercises...' :
                 '✨ Finalizing your plan...'}
              </Text>
            </View>
          </Modal>
        </Portal>
      )}

      {/* Modals */}
      {renderPlanGenerator()}
      {renderPlanDetails()}

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => setShowPlanGenerator(true)}
        label="Create Plan"
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
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabLabel: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    color: COLORS.text + '60',
  },
  activeTabLabel: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  searchContainer: {
    padding: SPACING.md,
    backgroundColor: 'white',
  },
  searchBar: {
    elevation: 0,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  tabContent: {
    padding: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.sm,
  },
  sectionDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.text + '80',
    marginBottom: SPACING.lg,
  },
  planCard: {
    marginBottom: SPACING.md,
  },
  card: {
    padding: SPACING.md,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  planTitleSection: {
    flex: 1,
  },
  planTitle: {
    ...TEXT_STYLES.h4,
    marginBottom: SPACING.xs,
  },
  planMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  planType: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    marginRight: SPACING.sm,
  },
  planDuration: {
    ...TEXT_STYLES.caption,
    color: COLORS.text + '80',
    marginRight: SPACING.sm,
  },
  aiChip: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
  },
  aiChipText: {
    color: COLORS.primary,
    fontSize: 10,
  },
  planActions: {
    alignItems: 'flex-end',
  },
  progressText: {
    ...TEXT_STYLES.h4,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.xs,
    fontWeight: 'bold',
  },
 progressSection: {
    marginBottom: SPACING.md,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: SPACING.xs,
  },
  sessionProgress: {
    ...TEXT_STYLES.caption,
    color: COLORS.text + '80',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  tag: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
    backgroundColor: COLORS.background,
  },
  tagText: {
    fontSize: 11,
  },
  planStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    color: COLORS.text + '80',
    flex: 1,
  },
  planButton: {
    marginTop: SPACING.xs,
  },
  templatesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  templateCard: {
    width: (width - SPACING.md * 3) / 2,
    marginBottom: SPACING.md,
  },
  templateSurface: {
    padding: SPACING.md,
    alignItems: 'center',
    borderRadius: 12,
  },
  templateIcon: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  templateName: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  popularChip: {
    backgroundColor: COLORS.warning + '20',
    borderColor: COLORS.warning,
  },
  popularText: {
    color: COLORS.warning,
    fontSize: 10,
  },
  generatorModal: {
    backgroundColor: 'white',
    margin: SPACING.md,
    borderRadius: 12,
    maxHeight: height * 0.8,
  },
  detailsModal: {
    backgroundColor: 'white',
    margin: SPACING.md,
    borderRadius: 12,
    maxHeight: height * 0.85,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
    flex: 1,
  },
  generatorContent: {
    flex: 1,
    padding: SPACING.md,
  },
  formSection: {
    marginBottom: SPACING.lg,
  },
  formLabel: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  radioLabel: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.sm,
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  goalChip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  equipmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  equipmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.sm,
    margin: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    minWidth: (width - SPACING.md * 2 - SPACING.xs * 6) / 3,
  },
  equipmentSelected: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
  },
  equipmentText: {
    ...TEXT_STYLES.caption,
    flex: 1,
  },
  generatorActions: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  generateButton: {
    marginTop: SPACING.sm,
  },
  detailsContent: {
    flex: 1,
    padding: SPACING.md,
  },
  overviewCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    overflow: 'hidden',
  },
  overviewGradient: {
    padding: SPACING.lg,
  },
  overviewTitle: {
    ...TEXT_STYLES.h3,
    color: 'white',
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  overviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  overviewStat: {
    alignItems: 'center',
  },
  overviewStatValue: {
    ...TEXT_STYLES.h3,
    color: 'white',
    fontWeight: 'bold',
  },
  overviewStatLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: SPACING.xs,
  },
  scheduleCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  cardTitle: {
    ...TEXT_STYLES.h4,
    marginBottom: SPACING.md,
  },
  weeklySchedule: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayItem: {
    alignItems: 'center',
  },
  dayLabel: {
    ...TEXT_STYLES.caption,
    marginBottom: SPACING.xs,
  },
  dayIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  exercisesCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border + '30',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
  },
  exerciseMuscle: {
    ...TEXT_STYLES.caption,
    color: COLORS.text + '60',
  },
  exerciseSets: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  insightsCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.primary + '10',
  },
  insightText: {
    ...TEXT_STYLES.body,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  insightPoints: {
    marginLeft: SPACING.sm,
  },
  insightPoint: {
    ...TEXT_STYLES.caption,
    marginBottom: SPACING.xs,
    color: COLORS.text + '80',
  },
  detailsActions: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  startButton: {
    marginTop: SPACING.sm,
  },
  progressModal: {
    backgroundColor: 'white',
    margin: SPACING.xl,
    borderRadius: 12,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  progressContent: {
    alignItems: 'center',
    width: '100%',
  },
  progressTitle: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  generationProgressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.md,
  },
  progressText: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  progressSteps: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    color: COLORS.text + '80',
  },
  fab: {
    position: 'absolute',
    right: SPACING.md,
    bottom: SPACING.xl,
    backgroundColor: COLORS.primary,
  },
});

export default PersonalizedPlans;