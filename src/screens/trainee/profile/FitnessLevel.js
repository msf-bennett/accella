import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StatusBar,
  RefreshControl,
  Alert,
  Vibration,
  Animated,
} from 'react-native';
import {
  Card,
  Button,
  IconButton,
  ProgressBar,
  Surface,
  Portal,
  Modal,
  TextInput,
  Chip,
  Divider,
  RadioButton,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';
import { Text } from '../components/StyledText';

const FitnessLevel = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { fitnessAssessment, loading } = useSelector(state => state.profile);

  const [refreshing, setRefreshing] = useState(false);
  const [assessmentVisible, setAssessmentVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [assessmentData, setAssessmentData] = useState({
    experienceLevel: '',
    workoutFrequency: '',
    fitnessGoals: [],
    preferredActivities: [],
    limitations: '',
    currentFitness: '',
    assessmentDate: new Date().toISOString().split('T')[0],
  });

  const experienceLevels = [
    { value: 'beginner', label: 'Beginner', description: 'New to fitness or returning after a long break', icon: 'fitness-center' },
    { value: 'intermediate', label: 'Intermediate', description: 'Regular exercise for 6+ months', icon: 'trending-up' },
    { value: 'advanced', label: 'Advanced', description: 'Consistent training for 2+ years', icon: 'military-tech' },
    { value: 'expert', label: 'Expert/Athlete', description: 'Professional or competitive level', icon: 'jump-rope' },
  ];

  const workoutFrequencies = [
    { value: '1-2', label: '1-2 times per week', icon: 'looks-one' },
    { value: '3-4', label: '3-4 times per week', icon: 'looks-3' },
    { value: '5-6', label: '5-6 times per week', icon: 'looks-5' },
    { value: 'daily', label: 'Daily training', icon: 'today' },
  ];

  const fitnessGoals = [
    { value: 'weight-loss', label: 'Weight Loss', icon: 'trending-down', color: COLORS.error },
    { value: 'muscle-gain', label: 'Muscle Gain', icon: 'fitness-center', color: COLORS.primary },
    { value: 'endurance', label: 'Endurance', icon: 'directions-run', color: COLORS.success },
    { value: 'strength', label: 'Strength', icon: 'strong', color: COLORS.secondary },
    { value: 'flexibility', label: 'Flexibility', icon: 'self-improvement', color: '#9c27b0' },
    { value: 'general-fitness', label: 'General Fitness', icon: 'favorite', color: '#ff5722' },
  ];

  const preferredActivities = [
    { value: 'cardio', label: 'Cardio', icon: 'favorite' },
    { value: 'strength', label: 'Weight Training', icon: 'fitness-center' },
    { value: 'yoga', label: 'Yoga/Pilates', icon: 'self-improvement' },
    { value: 'sports', label: 'Sports', icon: 'sports-basketball' },
    { value: 'swimming', label: 'Swimming', icon: 'pool' },
    { value: 'running', label: 'Running', icon: 'directions-run' },
    { value: 'cycling', label: 'Cycling', icon: 'directions-bike' },
    { value: 'dancing', label: 'Dancing', icon: 'music-note' },
  ];

  const assessmentSteps = [
    { title: 'Experience Level', icon: 'school' },
    { title: 'Workout Frequency', icon: 'schedule' },
    { title: 'Fitness Goals', icon: 'track-changes' },
    { title: 'Preferred Activities', icon: 'favorite' },
    { title: 'Additional Info', icon: 'note' },
  ];

  useEffect(() => {
    loadFitnessAssessment();
  }, []);

  const loadFitnessAssessment = useCallback(async () => {
    try {
      // dispatch(loadUserFitnessAssessment(user.id));
    } catch (error) {
      console.error('Error loading fitness assessment:', error);
    }
  }, [user.id, dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFitnessAssessment();
    setRefreshing(false);
  }, [loadFitnessAssessment]);

  const startAssessment = () => {
    setCurrentStep(0);
    setAssessmentVisible(true);
    Vibration.vibrate(50);
  };

  const nextStep = () => {
    if (currentStep < assessmentSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      Vibration.vibrate(30);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      Vibration.vibrate(30);
    }
  };

  const handleGoalToggle = (goal) => {
    const currentGoals = assessmentData.fitnessGoals;
    const isSelected = currentGoals.includes(goal);
    
    if (isSelected) {
      setAssessmentData({
        ...assessmentData,
        fitnessGoals: currentGoals.filter(g => g !== goal)
      });
    } else {
      setAssessmentData({
        ...assessmentData,
        fitnessGoals: [...currentGoals, goal]
      });
    }
    Vibration.vibrate(30);
  };

  const handleActivityToggle = (activity) => {
    const currentActivities = assessmentData.preferredActivities;
    const isSelected = currentActivities.includes(activity);
    
    if (isSelected) {
      setAssessmentData({
        ...assessmentData,
        preferredActivities: currentActivities.filter(a => a !== activity)
      });
    } else {
      setAssessmentData({
        ...assessmentData,
        preferredActivities: [...currentActivities, activity]
      });
    }
    Vibration.vibrate(30);
  };

  const saveAssessment = async () => {
    try {
      // dispatch(saveFitnessAssessment(assessmentData));
      setAssessmentVisible(false);
      Vibration.vibrate([50, 50, 100]);
      
      Alert.alert(
        '🚧 Feature in Development',
        'Fitness level assessment is being built. This will help create personalized training plans for you.',
        [{ text: 'Got it!', style: 'default' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save fitness assessment. Please try again.');
    }
  };

  const getFitnessLevelColor = (level) => {
    switch (level) {
      case 'beginner': return COLORS.success;
      case 'intermediate': return COLORS.primary;
      case 'advanced': return COLORS.secondary;
      case 'expert': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const calculateOverallScore = () => {
    // Mock calculation based on assessment data
    const experienceScore = {
      beginner: 25,
      intermediate: 50,
      advanced: 75,
      expert: 100
    };
    
    const frequencyScore = {
      '1-2': 25,
      '3-4': 50,
      '5-6': 75,
      'daily': 100
    };

    const baseScore = (experienceScore[mockAssessment.experienceLevel] || 0) * 0.6 +
                     (frequencyScore[mockAssessment.workoutFrequency] || 0) * 0.4;

    return Math.round(baseScore);
  };

  // Mock data for development
  const mockAssessment = {
    experienceLevel: 'intermediate',
    workoutFrequency: '3-4',
    fitnessGoals: ['weight-loss', 'endurance'],
    preferredActivities: ['cardio', 'strength', 'running'],
    limitations: 'Previous knee injury - avoid high impact exercises',
    currentFitness: 'good',
    assessmentDate: '2024-08-15',
    overallScore: calculateOverallScore(),
  };

  const renderAssessmentStep = () => {
    const step = assessmentSteps[currentStep];
    
    switch (currentStep) {
      case 0: // Experience Level
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>What's your fitness experience?</Text>
            <Text style={styles.stepSubtitle}>
              This helps us understand your starting point
            </Text>
            
            <View style={styles.optionsContainer}>
              {experienceLevels.map((level) => (
                <Surface key={level.value} style={styles.optionCard}>
                  <RadioButton.Item
                    label={level.label}
                    value={level.value}
                    status={assessmentData.experienceLevel === level.value ? 'checked' : 'unchecked'}
                    onPress={() => setAssessmentData({ ...assessmentData, experienceLevel: level.value })}
                    style={styles.radioItem}
                  />
                  <Text style={styles.optionDescription}>{level.description}</Text>
                </Surface>
              ))}
            </View>
          </View>
        );

      case 1: // Workout Frequency
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>How often do you currently work out?</Text>
            <Text style={styles.stepSubtitle}>
              Be honest about your current routine
            </Text>
            
            <View style={styles.optionsContainer}>
              {workoutFrequencies.map((freq) => (
                <Surface key={freq.value} style={styles.optionCard}>
                  <RadioButton.Item
                    label={freq.label}
                    value={freq.value}
                    status={assessmentData.workoutFrequency === freq.value ? 'checked' : 'unchecked'}
                    onPress={() => setAssessmentData({ ...assessmentData, workoutFrequency: freq.value })}
                    style={styles.radioItem}
                  />
                </Surface>
              ))}
            </View>
          </View>
        );

      case 2: // Fitness Goals
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>What are your fitness goals?</Text>
            <Text style={styles.stepSubtitle}>
              Select all that apply - you can have multiple goals
            </Text>
            
            <View style={styles.chipGrid}>
              {fitnessGoals.map((goal) => (
                <Chip
                  key={goal.value}
                  icon={goal.icon}
                  mode={assessmentData.fitnessGoals.includes(goal.value) ? 'flat' : 'outlined'}
                  selected={assessmentData.fitnessGoals.includes(goal.value)}
                  onPress={() => handleGoalToggle(goal.value)}
                  style={[
                    styles.goalChip,
                    assessmentData.fitnessGoals.includes(goal.value) && { backgroundColor: goal.color + '20' }
                  ]}
                  textStyle={assessmentData.fitnessGoals.includes(goal.value) && { color: goal.color }}
                >
                  {goal.label}
                </Chip>
              ))}
            </View>
          </View>
        );

      case 3: // Preferred Activities
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>What activities do you enjoy?</Text>
            <Text style={styles.stepSubtitle}>
              Choose activities you like or want to try
            </Text>
            
            <View style={styles.chipGrid}>
              {preferredActivities.map((activity) => (
                <Chip
                  key={activity.value}
                  icon={activity.icon}
                  mode={assessmentData.preferredActivities.includes(activity.value) ? 'flat' : 'outlined'}
                  selected={assessmentData.preferredActivities.includes(activity.value)}
                  onPress={() => handleActivityToggle(activity.value)}
                  style={styles.activityChip}
                >
                  {activity.label}
                </Chip>
              ))}
            </View>
          </View>
        );

      case 4: // Additional Info
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Any limitations or notes?</Text>
            <Text style={styles.stepSubtitle}>
              Help us create a safe and effective plan for you
            </Text>
            
            <TextInput
              label="Injuries, limitations, or special considerations"
              value={assessmentData.limitations}
              onChangeText={(text) => setAssessmentData({ ...assessmentData, limitations: text })}
              mode="outlined"
              multiline
              numberOfLines={4}
              style={styles.textInput}
              placeholder="e.g., knee injury, back problems, heart condition..."
            />

            <View style={styles.fitnessRating}>
              <Text style={styles.ratingLabel}>Current fitness level (self-assessment):</Text>
              <RadioButton.Group
                onValueChange={(value) => setAssessmentData({ ...assessmentData, currentFitness: value })}
                value={assessmentData.currentFitness}
              >
                <View style={styles.ratingOptions}>
                  <RadioButton.Item label="Poor" value="poor" />
                  <RadioButton.Item label="Fair" value="fair" />
                  <RadioButton.Item label="Good" value="good" />
                  <RadioButton.Item label="Excellent" value="excellent" />
                </View>
              </RadioButton.Group>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  const renderCurrentAssessment = () => (
    <View style={styles.assessmentSection}>
      <Card style={styles.scoreCard}>
        <Card.Content>
          <View style={styles.scoreHeader}>
            <Text style={TEXT_STYLES.h2}>Your Fitness Level</Text>
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreNumber}>{mockAssessment.overallScore}</Text>
              <Text style={styles.scoreMax}>/100</Text>
            </View>
          </View>
          
          <ProgressBar
            progress={mockAssessment.overallScore / 100}
            color={getFitnessLevelColor(mockAssessment.experienceLevel)}
            style={styles.progressBar}
          />
          
          <View style={styles.levelBadge}>
            <Chip
              icon="school"
              mode="flat"
              style={[styles.levelChip, { backgroundColor: getFitnessLevelColor(mockAssessment.experienceLevel) + '20' }]}
              textStyle={{ color: getFitnessLevelColor(mockAssessment.experienceLevel) }}
            >
              {mockAssessment.experienceLevel.charAt(0).toUpperCase() + mockAssessment.experienceLevel.slice(1)}
            </Chip>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.detailsCard}>
        <Card.Content>
          <Text style={TEXT_STYLES.h3}>Assessment Details</Text>
          
          <View style={styles.detailRow}>
            <MaterialIcons name="schedule" size={20} color={COLORS.textSecondary} />
            <Text style={styles.detailLabel}>Workout Frequency:</Text>
            <Text style={styles.detailValue}>{mockAssessment.workoutFrequency} times per week</Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialIcons name="track-changes" size={20} color={COLORS.textSecondary} />
            <Text style={styles.detailLabel}>Goals:</Text>
            <View style={styles.goalsList}>
              {mockAssessment.fitnessGoals.map((goalValue) => {
                const goal = fitnessGoals.find(g => g.value === goalValue);
                return goal ? (
                  <Chip
                    key={goalValue}
                    icon={goal.icon}
                    mode="outlined"
                    compact
                    style={styles.goalTag}
                  >
                    {goal.label}
                  </Chip>
                ) : null;
              })}
            </View>
          </View>

          <View style={styles.detailRow}>
            <MaterialIcons name="favorite" size={20} color={COLORS.textSecondary} />
            <Text style={styles.detailLabel}>Preferred Activities:</Text>
            <View style={styles.goalsList}>
              {mockAssessment.preferredActivities.map((activityValue) => {
                const activity = preferredActivities.find(a => a.value === activityValue);
                return activity ? (
                  <Chip
                    key={activityValue}
                    icon={activity.icon}
                    mode="outlined"
                    compact
                    style={styles.activityTag}
                  >
                    {activity.label}
                  </Chip>
                ) : null;
              })}
            </View>
          </View>

          {mockAssessment.limitations && (
            <View style={styles.limitationsSection}>
              <View style={styles.detailRow}>
                <MaterialIcons name="warning" size={20} color={COLORS.warning} />
                <Text style={styles.detailLabel}>Limitations:</Text>
              </View>
              <Text style={styles.limitationsText}>{mockAssessment.limitations}</Text>
            </View>
          )}

          <Divider style={styles.divider} />
          
          <View style={styles.assessmentFooter}>
            <Text style={styles.assessmentDate}>
              Last updated: {new Date(mockAssessment.assessmentDate).toLocaleDateString()}
            </Text>
            <Button
              mode="outlined"
              icon="edit"
              onPress={startAssessment}
              compact
            >
              Update
            </Button>
          </View>
        </Card.Content>
      </Card>
    </View>
  );

  const renderAssessmentModal = () => (
    <Portal>
      <Modal
        visible={assessmentVisible}
        onDismiss={() => setAssessmentVisible(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Surface style={styles.assessmentModal}>
          <View style={styles.modalHeader}>
            <Text style={TEXT_STYLES.h2}>Fitness Assessment</Text>
            <IconButton
              icon="close"
              onPress={() => setAssessmentVisible(false)}
            />
          </View>

          <ProgressBar
            progress={(currentStep + 1) / assessmentSteps.length}
            color={COLORS.primary}
            style={styles.stepProgress}
          />

          <View style={styles.stepIndicator}>
            <Text style={styles.stepText}>
              Step {currentStep + 1} of {assessmentSteps.length}: {assessmentSteps[currentStep].title}
            </Text>
          </View>

          <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
            {renderAssessmentStep()}
          </ScrollView>

          <View style={styles.modalActions}>
            {currentStep > 0 && (
              <Button
                mode="outlined"
                onPress={prevStep}
                style={styles.actionButton}
                icon="chevron-left"
              >
                Previous
              </Button>
            )}
            
            {currentStep < assessmentSteps.length - 1 ? (
              <Button
                mode="contained"
                onPress={nextStep}
                style={styles.actionButton}
                icon="chevron-right"
                contentStyle={{ flexDirection: 'row-reverse' }}
              >
                Next
              </Button>
            ) : (
              <Button
                mode="contained"
                onPress={saveAssessment}
                style={styles.actionButton}
                icon="check"
              >
                Complete Assessment
              </Button>
            )}
          </View>
        </Surface>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Fitness Level</Text>
          <Text style={styles.headerSubtitle}>
            Track your progress and get personalized training 💪
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
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
        {mockAssessment.experienceLevel ? (
          renderCurrentAssessment()
        ) : (
          <View style={styles.emptyState}>
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <MaterialIcons name="fitness-center" size={64} color={COLORS.textSecondary} />
                <Text style={styles.emptyTitle}>Complete Your Fitness Assessment</Text>
                <Text style={styles.emptySubtitle}>
                  Help us understand your fitness level to create the perfect training plan for you
                </Text>
                <Button
                  mode="contained"
                  icon="play-arrow"
                  onPress={startAssessment}
                  style={styles.startButton}
                >
                  Start Assessment
                </Button>
              </Card.Content>
            </Card>
          </View>
        )}
      </ScrollView>

      {renderAssessmentModal()}
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: SPACING.xl + 20,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: '#fff',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  assessmentSection: {
    marginTop: -SPACING.lg,
  },
  scoreCard: {
    marginBottom: SPACING.md,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  scoreCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary + '20',
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  scoreNumber: {
    ...TEXT_STYLES.h1,
    color: COLORS.primary,
    fontSize: 24,
    fontWeight: 'bold',
  },
  scoreMax: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.md,
  },
  levelBadge: {
    alignItems: 'flex-start',
  },
  levelChip: {
    alignSelf: 'flex-start',
  },
  detailsCard: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    flexWrap: 'wrap',
  },
  detailLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '500',
    marginLeft: SPACING.sm,
    minWidth: 120,
  },
  detailValue: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    flex: 1,
  },
  goalsList: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: SPACING.sm,
  },
  goalTag: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  activityTag: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  limitationsSection: {
    marginTop: SPACING.sm,
  },
  limitationsText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginLeft: 28,
    marginTop: SPACING.xs,
    fontStyle: 'italic',
  },
  divider: {
    marginVertical: SPACING.md,
  },
  assessmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assessmentDate: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  emptyState: {
    marginTop: -SPACING.lg,
  },
  emptyCard: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyTitle: {
    ...TEXT_STYLES.h2,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  startButton: {
    paddingHorizontal: SPACING.lg,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: SPACING.sm,
  },
  assessmentModal: {
    maxHeight: '90%',
    borderRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  stepProgress: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    height: 6,
    borderRadius: 3,
  },
  stepIndicator: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  stepText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  stepContent: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  stepContainer: {
    paddingVertical: SPACING.md,
  },
  stepTitle: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.xs,
  },
  stepSubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  optionsContainer: {
    gap: SPACING.sm,
  },
  optionCard: {
    borderRadius: 8,
    elevation: 1,
  },
  radioItem: {
    paddingVertical: SPACING.xs,
  },
  optionDescription: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xl,
    marginTop: -SPACING.xs,
    marginBottom: SPACING.sm,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  goalChip: {
    marginBottom: SPACING.xs,
  },
  activityChip: {
    marginBottom: SPACING.xs,
  },
  textInput: {
    marginBottom: SPACING.md,
  },
  fitnessRating: {
    marginTop: SPACING.md,
  },
  ratingLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '500',
    marginBottom: SPACING.sm,
  },
  ratingOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
  },
};

export default FitnessLevel;