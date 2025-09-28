import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Vibration,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  TextInput,
} from 'react-native';
import {
  Card,
  Button,
  IconButton,
  Avatar,
  Chip,
  Surface,
  Portal,
  Modal,
  TextInput as PaperTextInput,
  HelperText,
  ProgressBar,
  Divider,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f6fa',
  surface: '#ffffff',
  text: '#2c3e50',
  textSecondary: '#7f8c8d',
  accent: '#e74c3c',
  light: '#ecf0f1',
  info: '#3498db',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textSecondary },
  small: { fontSize: 12, color: COLORS.textSecondary },
};

const { width } = Dimensions.get('window');

const SessionFeedback = ({ route, navigation }) => {
  const { sessionId, sessionData, showThankYou = false } = route?.params || {};
  
  // Redux state
  const user = useSelector(state => state.auth.user);
  const session = useSelector(state => state.training.sessions?.[sessionId]) || sessionData;
  const previousFeedback = useSelector(state => state.training.sessionFeedback?.[sessionId]);
  const dispatch = useDispatch();

  // Component state
  const [overallRating, setOverallRating] = useState(previousFeedback?.overallRating || 0);
  const [difficultyRating, setDifficultyRating] = useState(previousFeedback?.difficultyRating || 3);
  const [enjoymentRating, setEnjoymentRating] = useState(previousFeedback?.enjoymentRating || 0);
  const [exerciseRatings, setExerciseRatings] = useState(previousFeedback?.exerciseRatings || {});
  const [generalFeedback, setGeneralFeedback] = useState(previousFeedback?.generalFeedback || '');
  const [improvements, setImprovements] = useState(previousFeedback?.improvements || '');
  const [favoriteExercise, setFavoriteExercise] = useState(previousFeedback?.favoriteExercise || '');
  const [selectedMoods, setSelectedMoods] = useState(previousFeedback?.moods || []);
  const [energyLevel, setEnergyLevel] = useState(previousFeedback?.energyLevel || 50);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(showThankYou);
  const [currentStep, setCurrentStep] = useState(0);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  // Default session data
  const defaultSession = {
    id: sessionId || 'session_1',
    title: 'Football Training Session',
    coach: 'Coach Sarah',
    date: new Date().toISOString(),
    duration: 90,
    exercises: [
      { id: 'ex_1', name: 'Dynamic Warm-up', type: 'warmup' },
      { id: 'ex_2', name: 'Ball Control Drills', type: 'skill' },
      { id: 'ex_3', name: 'Passing Accuracy', type: 'skill' },
      { id: 'ex_4', name: 'Small-sided Games', type: 'game' },
      { id: 'ex_5', name: 'Cool Down', type: 'cooldown' },
    ],
  };

  const currentSession = session || defaultSession;

  // Feedback steps
  const feedbackSteps = [
    'Overall Rating',
    'Exercise Feedback',
    'Difficulty & Enjoyment',
    'Additional Comments'
  ];

  // Mood options
  const moodOptions = [
    { id: 'happy', label: 'Happy', emoji: '😊', color: COLORS.success },
    { id: 'excited', label: 'Excited', emoji: '🤩', color: COLORS.info },
    { id: 'confident', label: 'Confident', emoji: '💪', color: COLORS.primary },
    { id: 'tired', label: 'Tired', emoji: '😴', color: COLORS.textSecondary },
    { id: 'frustrated', label: 'Frustrated', emoji: '😤', color: COLORS.warning },
    { id: 'proud', label: 'Proud', emoji: '🏆', color: COLORS.accent },
    { id: 'motivated', label: 'Motivated', emoji: '🔥', color: COLORS.error },
    { id: 'relaxed', label: 'Relaxed', emoji: '😌', color: COLORS.info },
  ];

  // Entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  // Success animation
  useEffect(() => {
    if (showSuccess) {
      Animated.sequence([
        Animated.timing(successAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(successAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowSuccess(false);
        navigation.goBack();
      });
    }
  }, [showSuccess, successAnim, navigation]);

  // Star rating component
  const StarRating = ({ rating, onRatingChange, size = 32, disabled = false }) => {
    const renderStar = useCallback((index) => {
      const isFilled = index < rating;
      return (
        <IconButton
          key={index}
          icon={isFilled ? 'star' : 'star-border'}
          iconColor={isFilled ? COLORS.warning : COLORS.textSecondary}
          size={size}
          disabled={disabled}
          onPress={() => !disabled && onRatingChange(index + 1)}
          style={styles.starButton}
        />
      );
    }, [rating, onRatingChange, size, disabled]);

    return (
      <View style={styles.starContainer}>
        {[...Array(5)].map((_, index) => renderStar(index))}
      </View>
    );
  };

  // Handle mood selection
  const toggleMood = useCallback((moodId) => {
    setSelectedMoods(prev => {
      if (prev.includes(moodId)) {
        return prev.filter(id => id !== moodId);
      } else {
        return [...prev, moodId];
      }
    });
    
    if (Platform.OS === 'ios') {
      Vibration.vibrate([0, 50]);
    } else {
      Vibration.vibrate(50);
    }
  }, []);

  // Handle exercise rating
  const handleExerciseRating = useCallback((exerciseId, rating) => {
    setExerciseRatings(prev => ({
      ...prev,
      [exerciseId]: rating,
    }));
  }, []);

  // Validate current step
  const isStepValid = useCallback(() => {
    switch (currentStep) {
      case 0:
        return overallRating > 0;
      case 1:
        return Object.keys(exerciseRatings).length >= Math.ceil(currentSession.exercises.length / 2);
      case 2:
        return enjoymentRating > 0;
      case 3:
        return true; // Comments are optional
      default:
        return false;
    }
  }, [currentStep, overallRating, exerciseRatings, enjoymentRating, currentSession.exercises]);

  // Navigate to next step
  const nextStep = useCallback(() => {
    if (currentStep < feedbackSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
      
      if (Platform.OS === 'ios') {
        Vibration.vibrate([0, 100]);
      } else {
        Vibration.vibrate(100);
      }
    }
  }, [currentStep, feedbackSteps.length]);

  // Navigate to previous step
  const previousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Submit feedback
  const submitFeedback = useCallback(async () => {
    if (!isStepValid()) {
      Alert.alert('Incomplete Feedback', 'Please complete the current section before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      const feedbackData = {
        sessionId: currentSession.id,
        userId: user?.id,
        overallRating,
        difficultyRating,
        enjoymentRating,
        exerciseRatings,
        generalFeedback: generalFeedback.trim(),
        improvements: improvements.trim(),
        favoriteExercise,
        moods: selectedMoods,
        energyLevel,
        submittedAt: new Date().toISOString(),
      };

      // Dispatch to Redux
      dispatch({
        type: 'SUBMIT_SESSION_FEEDBACK',
        payload: feedbackData,
      });

      // Award points for feedback
      dispatch({
        type: 'AWARD_POINTS',
        payload: {
          userId: user?.id,
          points: 20,
          reason: 'Session Feedback',
          sessionId: currentSession.id,
        },
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (Platform.OS === 'ios') {
        Vibration.vibrate([0, 200, 100, 200]);
      } else {
        Vibration.vibrate([200, 100, 200]);
      }

      setShowSuccess(true);

    } catch (error) {
      Alert.alert('Submission Error', 'Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [
    isStepValid,
    currentSession,
    user,
    overallRating,
    difficultyRating,
    enjoymentRating,
    exerciseRatings,
    generalFeedback,
    improvements,
    favoriteExercise,
    selectedMoods,
    energyLevel,
    dispatch,
  ]);

  // Get difficulty label
  const getDifficultyLabel = (rating) => {
    if (rating <= 1) return 'Too Easy 😴';
    if (rating <= 2) return 'Easy 😊';
    if (rating <= 3) return 'Just Right 👍';
    if (rating <= 4) return 'Hard 💪';
    return 'Too Hard 😰';
  };

  // Get energy level label
  const getEnergyLabel = (level) => {
    if (level <= 20) return 'Very Tired 😴';
    if (level <= 40) return 'Tired 😐';
    if (level <= 60) return 'Normal ⚡';
    if (level <= 80) return 'Energized 🔋';
    return 'Super Energized 🚀';
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.stepContent}>
            <Text style={[TEXT_STYLES.h3, styles.stepTitle]}>
              🌟 How was your overall training session?
            </Text>
            <Text style={[TEXT_STYLES.body, styles.stepDescription]}>
              Rate your overall experience from 1 to 5 stars
            </Text>
            
            <View style={styles.ratingSection}>
              <StarRating
                rating={overallRating}
                onRatingChange={setOverallRating}
                size={40}
              />
              <Text style={styles.ratingLabel}>
                {overallRating === 0 ? 'Tap to rate' : 
                 overallRating === 1 ? 'Poor 😞' :
                 overallRating === 2 ? 'Fair 😐' :
                 overallRating === 3 ? 'Good 😊' :
                 overallRating === 4 ? 'Great 😄' : 'Excellent! 🤩'}
              </Text>
            </View>

            <View style={styles.moodSection}>
              <Text style={[TEXT_STYLES.body, styles.moodTitle]}>
                How are you feeling? (Select all that apply)
              </Text>
              <View style={styles.moodGrid}>
                {moodOptions.map(mood => (
                  <Chip
                    key={mood.id}
                    mode={selectedMoods.includes(mood.id) ? 'flat' : 'outlined'}
                    selected={selectedMoods.includes(mood.id)}
                    onPress={() => toggleMood(mood.id)}
                    style={[
                      styles.moodChip,
                      selectedMoods.includes(mood.id) && { backgroundColor: mood.color + '20' }
                    ]}
                    textStyle={[
                      styles.moodChipText,
                      selectedMoods.includes(mood.id) && { color: mood.color }
                    ]}
                  >
                    {mood.emoji} {mood.label}
                  </Chip>
                ))}
              </View>
            </View>
          </View>
        );

      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={[TEXT_STYLES.h3, styles.stepTitle]}>
              💪 Rate Individual Exercises
            </Text>
            <Text style={[TEXT_STYLES.body, styles.stepDescription]}>
              How did each exercise feel? Rate at least {Math.ceil(currentSession.exercises.length / 2)} exercises
            </Text>
            
            <Text style={styles.progressText}>
              Rated: {Object.keys(exerciseRatings).length}/{currentSession.exercises.length}
            </Text>

            {currentSession.exercises.map(exercise => (
              <Card key={exercise.id} style={styles.exerciseRatingCard}>
                <Card.Content>
                  <View style={styles.exerciseRatingHeader}>
                    <Text style={[TEXT_STYLES.body, styles.exerciseName]}>
                      {exercise.name}
                    </Text>
                    <Chip mode="outlined" compact style={styles.exerciseTypeChip}>
                      {exercise.type}
                    </Chip>
                  </View>
                  
                  <StarRating
                    rating={exerciseRatings[exercise.id] || 0}
                    onRatingChange={(rating) => handleExerciseRating(exercise.id, rating)}
                    size={28}
                  />
                </Card.Content>
              </Card>
            ))}
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={[TEXT_STYLES.h3, styles.stepTitle]}>
              🎯 Difficulty & Enjoyment
            </Text>
            
            <View style={styles.difficultySection}>
              <Text style={[TEXT_STYLES.body, styles.sectionLabel]}>
                How difficult was the session?
              </Text>
              <View style={styles.difficultySlider}>
                <View style={styles.sliderLabels}>
                  <Text style={styles.sliderLabel}>Too Easy</Text>
                  <Text style={styles.sliderLabel}>Too Hard</Text>
                </View>
                <View style={styles.difficultyButtons}>
                  {[1, 2, 3, 4, 5].map(level => (
                    <IconButton
                      key={level}
                      icon="circle"
                      iconColor={difficultyRating === level ? COLORS.primary : COLORS.light}
                      size={24}
                      onPress={() => setDifficultyRating(level)}
                    />
                  ))}
                </View>
                <Text style={styles.difficultyLabel}>
                  {getDifficultyLabel(difficultyRating)}
                </Text>
              </View>
            </View>

            <View style={styles.enjoymentSection}>
              <Text style={[TEXT_STYLES.body, styles.sectionLabel]}>
                How much did you enjoy it?
              </Text>
              <StarRating
                rating={enjoymentRating}
                onRatingChange={setEnjoymentRating}
                size={36}
              />
              <Text style={styles.ratingLabel}>
                {enjoymentRating === 0 ? 'Tap to rate' :
                 enjoymentRating === 1 ? 'Not fun 😞' :
                 enjoymentRating === 2 ? 'Okay 😐' :
                 enjoymentRating === 3 ? 'Fun! 😊' :
                 enjoymentRating === 4 ? 'Really fun! 😄' : 'Loved it! 🤩'}
              </Text>
            </View>

            <View style={styles.energySection}>
              <Text style={[TEXT_STYLES.body, styles.sectionLabel]}>
                Energy Level After Training
              </Text>
              <View style={styles.energySlider}>
                <Text style={styles.energyValue}>{energyLevel}%</Text>
                <Text style={styles.energyLabel}>
                  {getEnergyLabel(energyLevel)}
                </Text>
                <View style={styles.energyControls}>
                  <IconButton
                    icon="remove"
                    onPress={() => setEnergyLevel(Math.max(0, energyLevel - 10))}
                    iconColor={COLORS.error}
                  />
                  <ProgressBar
                    progress={energyLevel / 100}
                    color={COLORS.success}
                    style={styles.energyBar}
                  />
                  <IconButton
                    icon="add"
                    onPress={() => setEnergyLevel(Math.min(100, energyLevel + 10))}
                    iconColor={COLORS.success}
                  />
                </View>
              </View>
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={[TEXT_STYLES.h3, styles.stepTitle]}>
              💭 Additional Comments
            </Text>
            <Text style={[TEXT_STYLES.body, styles.stepDescription]}>
              Share any additional thoughts with your coach (optional)
            </Text>

            <PaperTextInput
              label="General Feedback"
              value={generalFeedback}
              onChangeText={setGeneralFeedback}
              multiline
              numberOfLines={4}
              style={styles.textInput}
              placeholder="What went well? What was challenging?"
              mode="outlined"
              outlineColor={COLORS.light}
              activeOutlineColor={COLORS.primary}
            />

            <PaperTextInput
              label="Suggestions for Improvement"
              value={improvements}
              onChangeText={setImprovements}
              multiline
              numberOfLines={3}
              style={styles.textInput}
              placeholder="Any suggestions to make training better?"
              mode="outlined"
              outlineColor={COLORS.light}
              activeOutlineColor={COLORS.primary}
            />

            <PaperTextInput
              label="Favorite Exercise"
              value={favoriteExercise}
              onChangeText={setFavoriteExercise}
              style={styles.textInput}
              placeholder="Which exercise did you enjoy most?"
              mode="outlined"
              outlineColor={COLORS.light}
              activeOutlineColor={COLORS.primary}
            />
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.primary}
        translucent
      />
      
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <IconButton
            icon="arrow-back"
            iconColor="white"
            size={24}
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTitle} numberOfLines={1}>
            Session Feedback
          </Text>
          <View style={styles.headerRight}>
            <Text style={styles.stepIndicator}>
              {currentStep + 1}/{feedbackSteps.length}
            </Text>
          </View>
        </View>
        
        <View style={styles.sessionInfo}>
          <Avatar.Text
            size={32}
            label={currentSession.coach?.charAt(0) || 'C'}
            style={styles.coachAvatar}
          />
          <View style={styles.sessionDetails}>
            <Text style={styles.sessionTitle}>{currentSession.title}</Text>
            <Text style={styles.coachName}>with {currentSession.coach}</Text>
          </View>
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressIndicator}>
          {feedbackSteps.map((step, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index <= currentStep && styles.progressDotActive,
              ]}
            />
          ))}
        </View>
      </LinearGradient>

      <Animated.ScrollView
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[TEXT_STYLES.body, styles.stepTitle]}>
          {feedbackSteps[currentStep]}
        </Text>
        
        {renderStepContent()}
      </Animated.ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigationButtons}>
        {currentStep > 0 && (
          <Button
            mode="outlined"
            onPress={previousStep}
            style={styles.navButton}
            icon="arrow-back"
          >
            Previous
          </Button>
        )}
        
        <View style={styles.navButtonSpacer} />
        
        {currentStep < feedbackSteps.length - 1 ? (
          <Button
            mode="contained"
            onPress={nextStep}
            disabled={!isStepValid()}
            style={[
              styles.navButton,
              !isStepValid() && styles.navButtonDisabled
            ]}
            icon="arrow-forward"
            contentStyle={styles.navButtonContent}
          >
            Next
          </Button>
        ) : (
          <Button
            mode="contained"
            onPress={submitFeedback}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={styles.submitButton}
            icon="check"
            contentStyle={styles.navButtonContent}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        )}
      </View>

      {/* Success Modal */}
      <Portal>
        <Modal
          visible={showSuccess}
          dismissable={false}
          contentContainerStyle={styles.successModal}
        >
          <Animated.View
            style={[
              styles.successContent,
              {
                opacity: successAnim,
                transform: [{
                  scale: successAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                }],
              },
            ]}
          >
            <Icon name="check-circle" size={80} color={COLORS.success} />
            <Text style={[TEXT_STYLES.h2, styles.successTitle]}>
              Thank You! 🎉
            </Text>
            <Text style={[TEXT_STYLES.body, styles.successMessage]}>
              Your feedback has been sent to {currentSession.coach}.
              You earned +20 points for sharing your thoughts!
            </Text>
            <Text style={[TEXT_STYLES.caption, styles.successNote]}>
              Your coach will use this feedback to make your next session even better!
            </Text>
          </Animated.View>
        </Modal>
      </Portal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.sm,
    paddingBottom: SPACING.lg,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: SPACING.md,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  stepIndicator: {
    ...TEXT_STYLES.caption,
    color: 'white',
    fontWeight: 'bold',
  },
  sessionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.md,
  },
  coachAvatar: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  sessionDetails: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  sessionTitle: {
    ...TEXT_STYLES.body,
    color: 'white',
    fontWeight: 'bold',
  },
  coachName: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
  },
  progressIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: SPACING.xs,
  },
  progressDotActive: {
    backgroundColor: 'white',
    width: 24,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  stepContent: {
    paddingBottom: SPACING.xl,
  },
  stepTitle: {
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  stepDescription: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  ratingSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  starButton: {
    margin: 0,
  },
  ratingLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
    fontWeight: '600',
  },
  moodSection: {
    marginBottom: SPACING.lg,
  },
  moodTitle: {
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moodChip: {
    margin: SPACING.xs,
    minWidth: width * 0.25,
  },
  moodChipText: {
    fontSize: 12,
  },
  progressText: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    marginBottom: SPACING.md,
    fontWeight: '600',
  },
  exerciseRatingCard: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  exerciseRatingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  exerciseName: {
    flex: 1,
    fontWeight: '600',
  },
  exerciseTypeChip: {
    backgroundColor: COLORS.light,
  },
  difficultySection: {
    marginBottom: SPACING.xl,
  },
  sectionLabel: {
    textAlign: 'center',
    marginBottom: SPACING.md,
    fontWeight: '600',
  },
  difficultySlider: {
    alignItems: 'center',
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: SPACING.sm,
  },
  sliderLabel: {
    ...TEXT_STYLES.small,
    color: COLORS.textSecondary,
  },
  difficultyButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  difficultyLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  enjoymentSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  energySection: {
    marginBottom: SPACING.lg,
  },
  energySlider: {
    alignItems: 'center',
  },
  energyValue: {
    ...TEXT_STYLES.h2,
    color: COLORS.success,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  energyLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  energyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  energyBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginHorizontal: SPACING.md,
  },
  textInput: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  navigationButtons: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.surface,
    elevation: 8,
  },
  navButton: {
    flex: 1,
  },
  navButtonContent: {
    flexDirection: 'row-reverse',
    paddingVertical: SPACING.xs,
  },
  navButtonSpacer: {
    width: SPACING.md,
  },
  navButtonDisabled: {
    backgroundColor: COLORS.light,
  },
  submitButton: {
    flex: 1,
    backgroundColor: COLORS.success,
  },
  successModal: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  successContent: {
    backgroundColor: COLORS.surface,
    padding: SPACING.xl,
    borderRadius: 20,
    alignItems: 'center',
    maxWidth: width * 0.9,
    elevation: 12,
  },
  successTitle: {
    textAlign: 'center',
    marginVertical: SPACING.lg,
    color: COLORS.success,
  },
  successMessage: {
    textAlign: 'center',
    marginBottom: SPACING.md,
    lineHeight: 22,
  },
  successNote: {
    textAlign: 'center',
    fontStyle: 'italic',
    color: COLORS.textSecondary,
  },
});

export default SessionFeedback;