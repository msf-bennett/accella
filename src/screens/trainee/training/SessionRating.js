import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  Animated,
  TouchableOpacity,
  Dimensions,
  Vibration,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  ProgressBar,
  Avatar,
  IconButton,
  Surface,
  Badge,
  Portal,
  Modal,
  Slider,
  Switch,
  Divider,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import design constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f8f9fa',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e0e0e0',
  rating: '#FFC107',
  excellent: '#4CAF50',
  good: '#8BC34A',
  average: '#FF9800',
  poor: '#F44336',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  body: {
    fontSize: 16,
    color: COLORS.text,
  },
  caption: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
};

const { width, height } = Dimensions.get('window');

const SessionRating = ({ navigation, route }) => {
  // Get session data from route params
  const { sessionId, workoutData } = route.params || {};
  
  // State management
  const [overallRating, setOverallRating] = useState(0);
  const [difficultyRating, setDifficultyRating] = useState(3);
  const [enjoymentRating, setEnjoymentRating] = useState(0);
  const [energyLevel, setEnergyLevel] = useState(5);
  const [perceivedExertion, setPerceivedExertion] = useState(5);
  const [selectedMoods, setSelectedMoods] = useState([]);
  const [selectedChallenges, setSelectedChallenges] = useState([]);
  const [selectedHighlights, setSelectedHighlights] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [trainerRating, setTrainerRating] = useState(0);
  const [wouldRecommend, setWouldRecommend] = useState(null);
  const [submitModalVisible, setSubmitModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDetailedForm, setShowDetailedForm] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const starAnims = useRef(Array(5).fill(0).map(() => new Animated.Value(0))).current;

  // Redux state
  const dispatch = useDispatch();
  const { user, sessionHistory = [] } = useSelector(state => state.training || {});

  // Mock session data
  const mockSessionData = {
    id: sessionId || 1,
    workoutTitle: 'Upper Body Strength 💪',
    trainer: 'Coach Mike Johnson',
    duration: 45,
    completedAt: new Date().toISOString(),
    exercises: [
      { name: 'Push-ups', sets: 3, reps: '12,10,8' },
      { name: 'Pull-ups', sets: 3, reps: '8,6,5' },
      { name: 'Dumbbell Press', sets: 4, reps: '12,10,8,6' },
      { name: 'Rows', sets: 3, reps: '12,10,8' },
    ],
    caloriesBurned: 285,
    heartRateAvg: 142,
    heartRateMax: 178,
  };

  const moodOptions = [
    { id: 'energized', label: 'Energized', emoji: '⚡', color: COLORS.warning },
    { id: 'accomplished', label: 'Accomplished', emoji: '🏆', color: COLORS.success },
    { id: 'motivated', label: 'Motivated', emoji: '🔥', color: COLORS.error },
    { id: 'confident', label: 'Confident', emoji: '💪', color: COLORS.primary },
    { id: 'happy', label: 'Happy', emoji: '😊', color: COLORS.good },
    { id: 'tired', label: 'Tired', emoji: '😴', color: COLORS.textSecondary },
    { id: 'sore', label: 'Sore', emoji: '🤕', color: COLORS.warning },
    { id: 'frustrated', label: 'Frustrated', emoji: '😤', color: COLORS.error },
  ];

  const challengeOptions = [
    { id: 'too_easy', label: 'Too Easy', emoji: '😴' },
    { id: 'just_right', label: 'Just Right', emoji: '👌' },
    { id: 'challenging', label: 'Challenging', emoji: '💪' },
    { id: 'too_hard', label: 'Too Hard', emoji: '😰' },
    { id: 'confusing', label: 'Confusing', emoji: '🤔' },
    { id: 'repetitive', label: 'Repetitive', emoji: '🔄' },
  ];

  const highlightOptions = [
    { id: 'new_pr', label: 'New PR!', emoji: '🎯' },
    { id: 'good_form', label: 'Great Form', emoji: '✨' },
    { id: 'full_completion', label: 'Completed All', emoji: '✅' },
    { id: 'beat_previous', label: 'Beat Previous', emoji: '📈' },
    { id: 'felt_strong', label: 'Felt Strong', emoji: '💪' },
    { id: 'good_pace', label: 'Good Pace', emoji: '⏰' },
  ];

  useEffect(() => {
    // Initialize animations
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
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Animate stars when rating changes
  useEffect(() => {
    if (overallRating > 0) {
      const animations = starAnims.slice(0, overallRating).map((anim, index) =>
        Animated.sequence([
          Animated.delay(index * 100),
          Animated.spring(anim, {
            toValue: 1,
            tension: 100,
            friction: 5,
            useNativeDriver: true,
          }),
        ])
      );
      
      Animated.parallel(animations).start();
    }
  }, [overallRating]);

  const handleStarPress = (rating, type = 'overall') => {
    Vibration.vibrate(30);
    
    if (type === 'overall') {
      setOverallRating(rating);
      // Reset star animations
      starAnims.forEach(anim => anim.setValue(0));
    } else if (type === 'trainer') {
      setTrainerRating(rating);
    } else if (type === 'enjoyment') {
      setEnjoymentRating(rating);
    }
  };

  const toggleMood = (moodId) => {
    Vibration.vibrate(30);
    setSelectedMoods(prev => 
      prev.includes(moodId) 
        ? prev.filter(id => id !== moodId)
        : [...prev, moodId]
    );
  };

  const toggleChallenge = (challengeId) => {
    Vibration.vibrate(30);
    setSelectedChallenges(prev => 
      prev.includes(challengeId) 
        ? prev.filter(id => id !== challengeId)
        : [...prev, challengeId]
    );
  };

  const toggleHighlight = (highlightId) => {
    Vibration.vibrate(30);
    setSelectedHighlights(prev => 
      prev.includes(highlightId) 
        ? prev.filter(id => id !== highlightId)
        : [...prev, highlightId]
    );
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return COLORS.excellent;
    if (rating >= 3.5) return COLORS.good;
    if (rating >= 2.5) return COLORS.average;
    return COLORS.poor;
  };

  const getRatingLabel = (rating) => {
    if (rating >= 4.5) return 'Excellent! 🌟';
    if (rating >= 3.5) return 'Good! 👍';
    if (rating >= 2.5) return 'Average 👌';
    if (rating >= 1.5) return 'Needs Improvement 📈';
    return 'Poor 😔';
  };

  const getCompletionPercentage = () => {
    let completed = 0;
    let total = 8; // Total number of rating categories
    
    if (overallRating > 0) completed++;
    if (difficultyRating > 0) completed++;
    if (enjoymentRating > 0) completed++;
    if (energyLevel > 0) completed++;
    if (selectedMoods.length > 0) completed++;
    if (selectedChallenges.length > 0) completed++;
    if (selectedHighlights.length > 0) completed++;
    if (trainerRating > 0) completed++;
    
    return (completed / total) * 100;
  };

  const validateForm = () => {
    if (overallRating === 0) {
      Alert.alert('Missing Rating', 'Please provide an overall rating for your session.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    Vibration.vibrate(100);
    
    const ratingData = {
      sessionId: mockSessionData.id,
      overallRating,
      difficultyRating,
      enjoymentRating,
      trainerRating,
      energyLevel,
      perceivedExertion,
      selectedMoods,
      selectedChallenges,
      selectedHighlights,
      feedback,
      wouldRecommend,
      submittedAt: new Date().toISOString(),
    };
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // dispatch(submitSessionRating(ratingData));
      
      setSubmitModalVisible(true);
      
      setTimeout(() => {
        setSubmitModalVisible(false);
        navigation.navigate('MyWorkouts', { 
          refresh: true,
          showSuccessMessage: true 
        });
      }, 2500);
      
    } catch (error) {
      Alert.alert('Error', 'Failed to submit rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating, onPress, type = 'overall', size = 32) => (
    <View style={styles.starsContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => onPress(star, type)}
          style={styles.starButton}
          activeOpacity={0.7}
        >
          <Animated.View
            style={[
              styles.starWrapper,
              type === 'overall' && star <= rating && {
                transform: [{ scale: starAnims[star - 1] }],
              },
            ]}
          >
            <Icon
              name={star <= rating ? 'star' : 'star-border'}
              size={size}
              color={star <= rating ? COLORS.rating : COLORS.border}
            />
          </Animated.View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderSessionSummary = () => (
    <Card style={styles.summaryCard}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.summaryGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryTitle}>{mockSessionData.workoutTitle}</Text>
          <Text style={styles.summaryTrainer}>with {mockSessionData.trainer}</Text>
        </View>
        
        <View style={styles.summaryStats}>
          <View style={styles.summaryStatItem}>
            <Icon name="timer" size={20} color="#ffffff" />
            <Text style={styles.summaryStatText}>{mockSessionData.duration}min</Text>
          </View>
          <View style={styles.summaryStatItem}>
            <Icon name="local-fire-department" size={20} color="#ffffff" />
            <Text style={styles.summaryStatText}>{mockSessionData.caloriesBurned} cal</Text>
          </View>
          <View style={styles.summaryStatItem}>
            <Icon name="favorite" size={20} color="#ffffff" />
            <Text style={styles.summaryStatText}>{mockSessionData.heartRateAvg} bpm</Text>
          </View>
        </View>
      </LinearGradient>
    </Card>
  );

  const renderQuickRating = () => (
    <Card style={styles.ratingCard}>
      <Card.Content>
        <View style={styles.ratingHeader}>
          <Text style={styles.ratingTitle}>How was your session? ⭐</Text>
          <Text style={styles.ratingSubtitle}>Tap the stars to rate</Text>
        </View>
        
        {renderStars(overallRating, handleStarPress, 'overall', 40)}
        
        {overallRating > 0 && (
          <Animated.View
            style={[
              styles.ratingFeedback,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={[styles.ratingLabel, { color: getRatingColor(overallRating) }]}>
              {getRatingLabel(overallRating)}
            </Text>
          </Animated.View>
        )}
      </Card.Content>
    </Card>
  );

  const renderDetailedForm = () => {
    if (!showDetailedForm) return null;
    
    return (
      <Animated.View
        style={[
          styles.detailedForm,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Difficulty Rating */}
        <Card style={styles.formCard}>
          <Card.Content>
            <Text style={styles.formSectionTitle}>Difficulty Level 📊</Text>
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>Too Easy</Text>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={5}
                step={1}
                value={difficultyRating}
                onValueChange={setDifficultyRating}
                minimumTrackTintColor={getRatingColor(difficultyRating)}
                maximumTrackTintColor={COLORS.border}
                thumbStyle={{ backgroundColor: getRatingColor(difficultyRating) }}
              />
              <Text style={styles.sliderLabel}>Too Hard</Text>
            </View>
            <Text style={styles.sliderValue}>
              Level: {difficultyRating}/5
            </Text>
          </Card.Content>
        </Card>

        {/* Enjoyment Rating */}
        <Card style={styles.formCard}>
          <Card.Content>
            <Text style={styles.formSectionTitle}>Did you enjoy it? 😊</Text>
            {renderStars(enjoymentRating, handleStarPress, 'enjoyment', 28)}
          </Card.Content>
        </Card>

        {/* Energy & Exertion */}
        <Card style={styles.formCard}>
          <Card.Content>
            <Text style={styles.formSectionTitle}>Energy & Effort 🔋</Text>
            
            <View style={styles.energySection}>
              <Text style={styles.energyLabel}>Energy Level</Text>
              <View style={styles.sliderContainer}>
                <Text style={styles.sliderLabel}>Low</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={1}
                  maximumValue={10}
                  step={1}
                  value={energyLevel}
                  onValueChange={setEnergyLevel}
                  minimumTrackTintColor={COLORS.success}
                  maximumTrackTintColor={COLORS.border}
                  thumbStyle={{ backgroundColor: COLORS.success }}
                />
                <Text style={styles.sliderLabel}>High</Text>
              </View>
              <Text style={styles.sliderValue}>{energyLevel}/10</Text>
            </View>

            <View style={styles.energySection}>
              <Text style={styles.energyLabel}>Perceived Exertion (RPE)</Text>
              <View style={styles.sliderContainer}>
                <Text style={styles.sliderLabel}>Easy</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={1}
                  maximumValue={10}
                  step={1}
                  value={perceivedExertion}
                  onValueChange={setPerceivedExertion}
                  minimumTrackTintColor={COLORS.warning}
                  maximumTrackTintColor={COLORS.border}
                  thumbStyle={{ backgroundColor: COLORS.warning }}
                />
                <Text style={styles.sliderLabel}>Max</Text>
              </View>
              <Text style={styles.sliderValue}>{perceivedExertion}/10</Text>
            </View>
          </Card.Content>
        </Card>

        {/* Mood Selection */}
        <Card style={styles.formCard}>
          <Card.Content>
            <Text style={styles.formSectionTitle}>How do you feel? 🎭</Text>
            <Text style={styles.formSubtitle}>Select all that apply</Text>
            <View style={styles.optionsGrid}>
              {moodOptions.map((mood) => (
                <TouchableOpacity
                  key={mood.id}
                  onPress={() => toggleMood(mood.id)}
                  style={[
                    styles.optionChip,
                    selectedMoods.includes(mood.id) && [
                      styles.selectedOptionChip,
                      { borderColor: mood.color, backgroundColor: mood.color + '20' }
                    ]
                  ]}
                  activeOpacity={0.7}
                >
                  <Text style={styles.optionEmoji}>{mood.emoji}</Text>
                  <Text style={[
                    styles.optionText,
                    selectedMoods.includes(mood.id) && { color: mood.color }
                  ]}>
                    {mood.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Challenges */}
        <Card style={styles.formCard}>
          <Card.Content>
            <Text style={styles.formSectionTitle}>Session Feedback 🎯</Text>
            <Text style={styles.formSubtitle}>How did the workout feel?</Text>
            <View style={styles.optionsGrid}>
              {challengeOptions.map((challenge) => (
                <TouchableOpacity
                  key={challenge.id}
                  onPress={() => toggleChallenge(challenge.id)}
                  style={[
                    styles.optionChip,
                    selectedChallenges.includes(challenge.id) && styles.selectedOptionChip
                  ]}
                  activeOpacity={0.7}
                >
                  <Text style={styles.optionEmoji}>{challenge.emoji}</Text>
                  <Text style={[
                    styles.optionText,
                    selectedChallenges.includes(challenge.id) && styles.selectedOptionText
                  ]}>
                    {challenge.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Highlights */}
        <Card style={styles.formCard}>
          <Card.Content>
            <Text style={styles.formSectionTitle}>Session Highlights 🏆</Text>
            <Text style={styles.formSubtitle}>What went well?</Text>
            <View style={styles.optionsGrid}>
              {highlightOptions.map((highlight) => (
                <TouchableOpacity
                  key={highlight.id}
                  onPress={() => toggleHighlight(highlight.id)}
                  style={[
                    styles.optionChip,
                    selectedHighlights.includes(highlight.id) && styles.selectedOptionChip
                  ]}
                  activeOpacity={0.7}
                >
                  <Text style={styles.optionEmoji}>{highlight.emoji}</Text>
                  <Text style={[
                    styles.optionText,
                    selectedHighlights.includes(highlight.id) && styles.selectedOptionText
                  ]}>
                    {highlight.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Trainer Rating */}
        <Card style={styles.formCard}>
          <Card.Content>
            <Text style={styles.formSectionTitle}>Rate Your Trainer 👨‍💼</Text>
            <Text style={styles.formSubtitle}>{mockSessionData.trainer}</Text>
            {renderStars(trainerRating, handleStarPress, 'trainer', 28)}
          </Card.Content>
        </Card>

        {/* Written Feedback */}
        <Card style={styles.formCard}>
          <Card.Content>
            <Text style={styles.formSectionTitle}>Additional Comments 💬</Text>
            <Text style={styles.formSubtitle}>Share your thoughts (optional)</Text>
            <TextInput
              style={styles.feedbackInput}
              placeholder="Tell us more about your experience..."
              value={feedback}
              onChangeText={setFeedback}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </Card.Content>
        </Card>

        {/* Recommendation */}
        <Card style={styles.formCard}>
          <Card.Content>
            <Text style={styles.formSectionTitle}>Would you recommend this? 🤝</Text>
            <View style={styles.recommendationButtons}>
              <TouchableOpacity
                onPress={() => setWouldRecommend(true)}
                style={[
                  styles.recommendButton,
                  wouldRecommend === true && styles.recommendButtonSelected
                ]}
                activeOpacity={0.7}
              >
                <Icon
                  name="thumb-up"
                  size={24}
                  color={wouldRecommend === true ? '#ffffff' : COLORS.success}
                />
                <Text style={[
                  styles.recommendButtonText,
                  wouldRecommend === true && styles.recommendButtonTextSelected
                ]}>
                  Yes! 👍
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => setWouldRecommend(false)}
                style={[
                  styles.recommendButton,
                  wouldRecommend === false && styles.recommendButtonSelected
                ]}
                activeOpacity={0.7}
              >
                <Icon
                  name="thumb-down"
                  size={24}
                  color={wouldRecommend === false ? '#ffffff' : COLORS.error}
                />
                <Text style={[
                  styles.recommendButtonText,
                  wouldRecommend === false && styles.recommendButtonTextSelected
                ]}>
                  No 👎
                </Text>
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>
      </Animated.View>
    );
  };

  const renderProgressIndicator = () => (
    <Card style={styles.progressCard}>
      <Card.Content>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Completion Progress</Text>
          <Text style={styles.progressPercentage}>{Math.round(getCompletionPercentage())}%</Text>
        </View>
        <ProgressBar
          progress={getCompletionPercentage() / 100}
          color={COLORS.primary}
          style={styles.progressBar}
        />
        <Text style={styles.progressDescription}>
          {getCompletionPercentage() < 100 
            ? 'Complete more sections for better insights!' 
            : 'All done! Ready to submit 🎉'
          }
        </Text>
      </Card.Content>
    </Card>
  );

  const renderSubmitModal = () => (
    <Portal>
      <Modal
        visible={submitModalVisible}
        onDismiss={() => setSubmitModalVisible(false)}
        contentContainerStyle={styles.submitModalContainer}
      >
        <Card style={styles.submitModalCard}>
          <Card.Content style={styles.submitModalContent}>
            <Animated.View
              style={[
                styles.submitModalIcon,
                {
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              <Icon name="check-circle" size={80} color={COLORS.success} />
            </Animated.View>
            <Text style={styles.submitModalTitle}>Thank You! 🎉</Text>
            <Text style={styles.submitModalDescription}>
              Your feedback has been submitted successfully. This helps us improve your training experience!
            </Text>
          </Card.Content>
        </Card>
      </Modal>
    </Portal>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <Text style={styles.headerTitleText}>Session Rating 📝</Text>
            <Text style={styles.headerSubtitle}>
              Help us improve your experience!
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View
          style={[
            styles.animatedContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {renderSessionSummary()}
          {renderQuickRating()}
          {renderProgressIndicator()}
          
          {overallRating > 0 && (
            <TouchableOpacity
              onPress={() => setShowDetailedForm(!showDetailedForm)}
              style={styles.expandButton}
              activeOpacity={0.8}
            >
              <Text style={styles.expandButtonText}>
                {showDetailedForm ? 'Show Less' : 'Add More Details'}
              </Text>
              <Icon
                name={showDetailedForm ? 'expand-less' : 'expand-more'}
                size={24}
                color={COLORS.primary}
              />
            </TouchableOpacity>
          )}
          
          {renderDetailedForm()}
        </Animated.View>
      </ScrollView>

      {overallRating > 0 && (
        <View style={styles.bottomActions}>
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.submitButton}
            labelStyle={styles.submitButtonText}
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Rating 🚀'}
          </Button>
        </View>
      )}

      {renderSubmitModal()}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: SPACING.md,
    padding: SPACING.sm,
  },
  headerTitle: {
    flex: 1,
  },
  headerTitleText: {
    ...TEXT_STYLES.title,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: SPACING.xs,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 120,
  },
  animatedContent: {
    flex: 1,
  },
  summaryCard: {
    borderRadius: 16,
    elevation: 4,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
  },
  summaryGradient: {
    padding: SPACING.lg,
  },
  summaryHeader: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  summaryTitle: {
    ...TEXT_STYLES.title,
    color: '#ffffff',
    textAlign: 'center',
  },
  summaryTrainer: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: SPACING.xs,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryStatText: {
    color: '#ffffff',
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  ratingCard: {
    borderRadius: 16,
    elevation: 3,
    marginBottom: SPACING.lg,
  },
  ratingHeader: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  ratingTitle: {
    ...TEXT_STYLES.subtitle,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  ratingSubtitle: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  starButton: {
    marginHorizontal: SPACING.xs,
  },
  starWrapper: {
    padding: SPACING.xs,
  },
  ratingFeedback: {
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  ratingLabel: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
  },
  progressCard: {
    borderRadius: 16,
    elevation: 2,
    marginBottom: SPACING.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  progressTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
  },
  progressPercentage: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.sm,
  },
  progressDescription: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  expandButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    elevation: 2,
  },
  expandButtonText: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    fontWeight: '600',
    marginRight: SPACING.xs,
  },
  detailedForm: {
    flex: 1,
  },
  formCard: {
    borderRadius: 16,
    elevation: 2,
    marginBottom: SPACING.lg,
  },
  formSectionTitle: {
    ...TEXT_STYLES.subtitle,
    marginBottom: SPACING.sm,
  },
  formSubtitle: {
    ...TEXT_STYLES.caption,
    marginBottom: SPACING.md,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  slider: {
    flex: 1,
    marginHorizontal: SPACING.md,
  },
  sliderLabel: {
    ...TEXT_STYLES.caption,
    minWidth: 60,
    textAlign: 'center',
  },
  sliderValue: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  energySection: {
    marginBottom: SPACING.lg,
  },
  energyLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  selectedOptionChip: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '20',
  },
  optionEmoji: {
    fontSize: 18,
    marginRight: SPACING.xs,
  },
  optionText: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
  },
  selectedOptionText: {
    color: COLORS.primary,
  },
  feedbackInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: SPACING.md,
    fontSize: 16,
    minHeight: 100,
    backgroundColor: COLORS.surface,
  },
  recommendationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.md,
  },
  recommendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  recommendButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  recommendButtonText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.sm,
    fontWeight: '600',
  },
  recommendButtonTextSelected: {
    color: '#ffffff',
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 8,
  },
  submitButton: {
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  submitModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  submitModalCard: {
    borderRadius: 24,
    minWidth: width * 0.8,
    maxWidth: width * 0.9,
  },
  submitModalContent: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  submitModalIcon: {
    marginBottom: SPACING.lg,
  },
  submitModalTitle: {
    ...TEXT_STYLES.title,
    color: COLORS.success,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  submitModalDescription: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    lineHeight: 22,
    color: COLORS.textSecondary,
  },
});

export default SessionRating;