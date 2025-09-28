import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  StatusBar,
  Alert,
  Animated,
  TouchableOpacity,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Vibration,
} from 'react-native';
import {
  Card,
  Button,
  TextInput,
  Chip,
  Avatar,
  Surface,
  ProgressBar,
  IconButton,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '@react-native-blur/blur';

// Design system imports
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const SessionRating = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector(state => state.auth);
  const { sessions } = useSelector(state => state.training);
  
  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);
  const scaleAnim = new Animated.Value(0.9);

  // Component state
  const [session] = useState(route?.params?.session || {
    id: '1',
    title: 'Football Training - Dribbling Basics',
    coach: 'Coach Michael',
    date: '2024-08-29',
    duration: '60 min',
    type: 'Individual',
    completed: true,
  });
  
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState('');
  const [enjoymentLevel, setEnjoymentLevel] = useState('');
  const [selectedMoods, setSelectedMoods] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasRated, setHasRated] = useState(false);

  const difficultyOptions = ['Too Easy', 'Just Right', 'Challenging', 'Too Hard'];
  const enjoymentOptions = ['Loved It! 😍', 'Really Fun 😊', 'It Was OK 😐', 'Not Fun 😞'];
  const moodOptions = ['Energetic ⚡', 'Confident 💪', 'Happy 😊', 'Proud 🏆', 'Tired 😴', 'Frustrated 😤'];

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
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleStarPress = useCallback((starRating) => {
    Vibration.vibrate(50);
    setRating(starRating);
    
    // Animate star selection
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim]);

  const handleMoodToggle = useCallback((mood) => {
    setSelectedMoods(prev => 
      prev.includes(mood) 
        ? prev.filter(m => m !== mood)
        : [...prev, mood]
    );
    Vibration.vibrate(30);
  }, []);

  const handleSubmitRating = useCallback(async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please give us a star rating! ⭐');
      return;
    }

    setIsSubmitting(true);
    Vibration.vibrate(50);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Dispatch rating action
      dispatch({
        type: 'SUBMIT_SESSION_RATING',
        payload: {
          sessionId: session.id,
          rating,
          feedback,
          difficultyLevel,
          enjoymentLevel,
          moods: selectedMoods,
          timestamp: new Date().toISOString(),
        }
      });

      setHasRated(true);
      
      // Success animation and feedback
      Alert.alert(
        'Thank You! 🌟',
        'Your feedback helps your coach make training even better!',
        [
          {
            text: 'Awesome!',
            onPress: () => navigation.goBack(),
          }
        ]
      );

    } catch (error) {
      Alert.alert('Oops!', 'Something went wrong. Please try again! 😅');
    } finally {
      setIsSubmitting(false);
    }
  }, [rating, feedback, difficultyLevel, enjoymentLevel, selectedMoods, session.id, dispatch, navigation]);

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => handleStarPress(i)}
          style={styles.starButton}
          activeOpacity={0.8}
        >
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Icon
              name={i <= rating ? 'star' : 'star-border'}
              size={40}
              color={i <= rating ? '#FFD700' : COLORS.gray}
            />
          </Animated.View>
        </TouchableOpacity>
      );
    }
    return stars;
  };

  if (hasRated) {
    return (
      <View style={styles.container}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.successContainer}>
          <Animated.View style={[styles.successContent, { opacity: fadeAnim }]}>
            <Icon name="check-circle" size={80} color="#fff" />
            <Text style={styles.successTitle}>Rating Submitted! 🎉</Text>
            <Text style={styles.successSubtitle}>Thank you for your feedback!</Text>
            <Button
              mode="contained"
              onPress={() => navigation.goBack()}
              style={styles.successButton}
              labelStyle={styles.buttonText}
            >
              Back to Sessions
            </Button>
          </Animated.View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <IconButton
            icon="arrow-back"
            iconColor="#fff"
            size={24}
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTitle}>Rate Your Session</Text>
          <View style={{ width: 48 }} />
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Session Info Card */}
            <Card style={styles.sessionCard}>
              <Card.Content>
                <View style={styles.sessionHeader}>
                  <Avatar.Icon
                    size={50}
                    icon="sports-soccer"
                    style={styles.sessionAvatar}
                  />
                  <View style={styles.sessionInfo}>
                    <Text style={styles.sessionTitle}>{session.title}</Text>
                    <Text style={styles.sessionDetails}>
                      {session.coach} • {session.duration}
                    </Text>
                    <Text style={styles.sessionDate}>
                      {new Date(session.date).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>

            {/* Star Rating */}
            <Surface style={styles.ratingSection}>
              <Text style={styles.sectionTitle}>How was your session? ⭐</Text>
              <Text style={styles.sectionSubtitle}>Tap the stars to rate!</Text>
              <View style={styles.starsContainer}>
                {renderStars()}
              </View>
              {rating > 0 && (
                <Text style={styles.ratingText}>
                  {rating === 1 ? "Let's work on making it better!" :
                   rating === 2 ? "Room for improvement!" :
                   rating === 3 ? "Good session!" :
                   rating === 4 ? "Great job today!" :
                   "Amazing work! 🌟"}
                </Text>
              )}
            </Surface>

            {/* Difficulty Level */}
            <Surface style={styles.section}>
              <Text style={styles.sectionTitle}>How did it feel? 🎯</Text>
              <View style={styles.chipsContainer}>
                {difficultyOptions.map((option) => (
                  <Chip
                    key={option}
                    selected={difficultyLevel === option}
                    onPress={() => setDifficultyLevel(option)}
                    style={[
                      styles.chip,
                      difficultyLevel === option && styles.selectedChip
                    ]}
                    textStyle={[
                      styles.chipText,
                      difficultyLevel === option && styles.selectedChipText
                    ]}
                  >
                    {option}
                  </Chip>
                ))}
              </View>
            </Surface>

            {/* Enjoyment Level */}
            <Surface style={styles.section}>
              <Text style={styles.sectionTitle}>Did you have fun? 🎉</Text>
              <View style={styles.chipsContainer}>
                {enjoymentOptions.map((option) => (
                  <Chip
                    key={option}
                    selected={enjoymentLevel === option}
                    onPress={() => setEnjoymentLevel(option)}
                    style={[
                      styles.chip,
                      enjoymentLevel === option && styles.selectedChip
                    ]}
                    textStyle={[
                      styles.chipText,
                      enjoymentLevel === option && styles.selectedChipText
                    ]}
                  >
                    {option}
                  </Chip>
                ))}
              </View>
            </Surface>

            {/* Mood Selection */}
            <Surface style={styles.section}>
              <Text style={styles.sectionTitle}>How do you feel? 😊</Text>
              <Text style={styles.sectionSubtitle}>You can pick more than one!</Text>
              <View style={styles.chipsContainer}>
                {moodOptions.map((mood) => (
                  <Chip
                    key={mood}
                    selected={selectedMoods.includes(mood)}
                    onPress={() => handleMoodToggle(mood)}
                    style={[
                      styles.chip,
                      selectedMoods.includes(mood) && styles.selectedChip
                    ]}
                    textStyle={[
                      styles.chipText,
                      selectedMoods.includes(mood) && styles.selectedChipText
                    ]}
                  >
                    {mood}
                  </Chip>
                ))}
              </View>
            </Surface>

            {/* Feedback Text */}
            <Surface style={styles.section}>
              <Text style={styles.sectionTitle}>Tell us more! 💬</Text>
              <TextInput
                multiline
                numberOfLines={4}
                placeholder="What did you like most? What could be better? (Optional)"
                value={feedback}
                onChangeText={setFeedback}
                style={styles.textInput}
                mode="outlined"
                outlineColor={COLORS.gray}
                activeOutlineColor={COLORS.primary}
              />
            </Surface>

            {/* Progress Indicator */}
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                Rating Progress
              </Text>
              <ProgressBar
                progress={
                  (rating > 0 ? 0.4 : 0) +
                  (difficultyLevel ? 0.2 : 0) +
                  (enjoymentLevel ? 0.2 : 0) +
                  (selectedMoods.length > 0 ? 0.2 : 0)
                }
                color={COLORS.primary}
                style={styles.progressBar}
              />
            </View>

            {/* Submit Button */}
            <Button
              mode="contained"
              onPress={handleSubmitRating}
              loading={isSubmitting}
              disabled={rating === 0 || isSubmitting}
              style={[
                styles.submitButton,
                rating === 0 && styles.submitButtonDisabled
              ]}
              labelStyle={styles.buttonText}
              icon="send"
            >
              {isSubmitting ? 'Sending Feedback...' : 'Submit Rating 🌟'}
            </Button>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.md,
    paddingBottom: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.sm,
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: '#fff',
    fontWeight: 'bold',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  sessionCard: {
    marginBottom: SPACING.lg,
    elevation: 4,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionAvatar: {
    backgroundColor: COLORS.primary,
    marginRight: SPACING.md,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  sessionDetails: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  sessionDate: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  ratingSection: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  section: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  sectionSubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: SPACING.md,
  },
  starButton: {
    padding: SPACING.xs,
    marginHorizontal: SPACING.xs,
  },
  ratingText: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  chip: {
    marginVertical: SPACING.xs,
    backgroundColor: COLORS.lightGray,
  },
  selectedChip: {
    backgroundColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.text,
    fontSize: 14,
  },
  selectedChipText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  textInput: {
    backgroundColor: 'transparent',
    marginTop: SPACING.sm,
  },
  progressContainer: {
    marginVertical: SPACING.lg,
  },
  progressText: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    color: COLORS.textSecondary,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  submitButton: {
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primary,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.gray,
  },
  buttonText: {
    ...TEXT_STYLES.button,
    color: '#fff',
    fontWeight: 'bold',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successContent: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  successTitle: {
    ...TEXT_STYLES.h1,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: SPACING.lg,
    textAlign: 'center',
  },
  successSubtitle: {
    ...TEXT_STYLES.h3,
    color: '#fff',
    marginTop: SPACING.md,
    textAlign: 'center',
    opacity: 0.9,
  },
  successButton: {
    marginTop: SPACING.xl,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.xl,
  },
});

export default SessionRating;