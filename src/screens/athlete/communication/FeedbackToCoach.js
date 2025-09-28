import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  Animated,
  Vibration,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { 
  Card, 
  Button, 
  TextInput, 
  Chip, 
  Avatar, 
  IconButton,
  Surface,
  Portal,
  Modal,
  ProgressBar,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

// Design System Constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4caf50',
  error: '#f44336',
  warning: '#ff9800',
  background: '#f5f7fa',
  surface: '#ffffff',
  text: '#2c3e50',
  textSecondary: '#7f8c8d',
  accent: '#e74c3c',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 22, fontWeight: '600', color: COLORS.text },
  h3: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 12, color: COLORS.textSecondary },
};

const FEEDBACK_CATEGORIES = [
  { id: 'training', label: 'Training Session', icon: 'fitness-center', color: COLORS.primary },
  { id: 'communication', label: 'Communication', icon: 'chat', color: COLORS.success },
  { id: 'motivation', label: 'Motivation', icon: 'trending-up', color: COLORS.warning },
  { id: 'program', label: 'Program Design', icon: 'assignment', color: COLORS.secondary },
  { id: 'general', label: 'General', icon: 'feedback', color: COLORS.accent },
];

const RATING_ASPECTS = [
  { key: 'clarity', label: 'Instructions Clarity' },
  { key: 'engagement', label: 'Engagement Level' },
  { key: 'difficulty', label: 'Appropriate Difficulty' },
  { key: 'feedback', label: 'Coach Feedback Quality' },
  { key: 'motivation', label: 'Motivation & Support' },
];

const FeedbackToCoach = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user, currentCoach } = useSelector(state => state.auth);
  
  const [selectedCategory, setSelectedCategory] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [ratings, setRatings] = useState({});
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [currentRatingAspect, setCurrentRatingAspect] = useState(null);
  const [attachments, setAttachments] = useState([]);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
    StatusBar.setBarStyle('light-content', true);
    StatusBar.setTranslucent(true);
    StatusBar.setBackgroundColor('transparent', true);

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
  }, []);

  const handleCategorySelect = useCallback((categoryId) => {
    Vibration.vibrate(10);
    setSelectedCategory(categoryId);
  }, []);

  const handleRatingPress = useCallback((aspect) => {
    setCurrentRatingAspect(aspect);
    setShowRatingModal(true);
  }, []);

  const handleRatingSelect = useCallback((rating) => {
    setRatings(prev => ({
      ...prev,
      [currentRatingAspect.key]: rating
    }));
    setShowRatingModal(false);
    Vibration.vibrate([10, 50, 10]);
  }, [currentRatingAspect]);

  const handleSubmitFeedback = useCallback(async () => {
    if (!selectedCategory || !feedbackText.trim()) {
      Alert.alert(
        '🚨 Missing Information',
        'Please select a category and provide your feedback message.',
        [{ text: 'Got it! 👍', style: 'default' }]
      );
      return;
    }

    setIsSubmitting(true);
    Vibration.vibrate([50, 100, 50]);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const feedbackData = {
        id: Date.now().toString(),
        userId: user.id,
        coachId: currentCoach?.id,
        category: selectedCategory,
        message: feedbackText,
        ratings,
        isAnonymous,
        attachments,
        timestamp: new Date().toISOString(),
        status: 'sent'
      };

      // Dispatch to Redux store
      // dispatch(submitFeedback(feedbackData));

      Alert.alert(
        '🎉 Feedback Sent!',
        'Your feedback has been delivered to your coach. Thank you for helping improve your training experience! 💪',
        [
          {
            text: 'Awesome! ⭐',
            onPress: () => navigation.goBack(),
            style: 'default'
          }
        ]
      );

      // Reset form
      setSelectedCategory('');
      setFeedbackText('');
      setRatings({});
      setIsAnonymous(false);
      setAttachments([]);

    } catch (error) {
      Alert.alert(
        '❌ Submission Failed',
        'Unable to send your feedback right now. Please try again later.',
        [{ text: 'Retry', style: 'default' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedCategory, feedbackText, ratings, isAnonymous, attachments, user, currentCoach, navigation]);

  const renderCategoryChips = () => (
    <View style={styles.categoryContainer}>
      <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>Feedback Category 📝</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chipRow}>
          {FEEDBACK_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => handleCategorySelect(category.id)}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && {
                  backgroundColor: category.color,
                  transform: [{ scale: 1.05 }],
                }
              ]}
            >
              <Icon 
                name={category.icon} 
                size={20} 
                color={selectedCategory === category.id ? '#fff' : category.color} 
              />
              <Text style={[
                styles.categoryText,
                selectedCategory === category.id && { color: '#fff', fontWeight: 'bold' }
              ]}>
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const renderRatingSection = () => (
    <Card style={styles.ratingCard}>
      <Card.Content>
        <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>Rate Your Experience ⭐</Text>
        <Text style={[TEXT_STYLES.caption, styles.ratingSubtitle]}>
          Tap on each aspect to provide a rating (optional)
        </Text>
        
        {RATING_ASPECTS.map((aspect) => (
          <TouchableOpacity
            key={aspect.key}
            style={styles.ratingItem}
            onPress={() => handleRatingPress(aspect)}
          >
            <View style={styles.ratingItemContent}>
              <Text style={TEXT_STYLES.body}>{aspect.label}</Text>
              <View style={styles.ratingDisplay}>
                {ratings[aspect.key] ? (
                  <View style={styles.ratingStars}>
                    {[...Array(5)].map((_, index) => (
                      <Icon
                        key={index}
                        name="star"
                        size={16}
                        color={index < ratings[aspect.key] ? COLORS.warning : '#e0e0e0'}
                      />
                    ))}
                    <Text style={styles.ratingValue}>({ratings[aspect.key]}/5)</Text>
                  </View>
                ) : (
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.primary }]}>
                    Tap to rate
                  </Text>
                )}
              </View>
            </View>
            <Icon name="keyboard-arrow-right" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        ))}
      </Card.Content>
    </Card>
  );

  const renderRatingModal = () => (
    <Portal>
      <Modal
        visible={showRatingModal}
        onDismiss={() => setShowRatingModal(false)}
        contentContainerStyle={styles.ratingModal}
      >
        <BlurView style={styles.blurContainer} blurType="light" blurAmount={10}>
          <Surface style={styles.modalContent}>
            <Text style={[TEXT_STYLES.h3, styles.modalTitle]}>
              Rate: {currentRatingAspect?.label}
            </Text>
            
            <View style={styles.starContainer}>
              {[1, 2, 3, 4, 5].map((rating) => (
                <TouchableOpacity
                  key={rating}
                  onPress={() => handleRatingSelect(rating)}
                  style={styles.starButton}
                >
                  <Icon
                    name="star"
                    size={40}
                    color={COLORS.warning}
                  />
                  <Text style={styles.starLabel}>{rating}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button
              mode="outlined"
              onPress={() => setShowRatingModal(false)}
              style={styles.cancelButton}
            >
              Cancel
            </Button>
          </Surface>
        </BlurView>
      </Modal>
    </Portal>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <IconButton
            icon="arrow-back"
            iconColor="#fff"
            size={24}
            onPress={() => navigation.goBack()}
          />
          <Text style={[TEXT_STYLES.h2, { color: '#fff', flex: 1, textAlign: 'center' }]}>
            Feedback to Coach 💬
          </Text>
          <View style={{ width: 40 }} />
        </View>
        
        {currentCoach && (
          <View style={styles.coachInfo}>
            <Avatar.Image
              size={50}
              source={{ uri: currentCoach.avatar || 'https://via.placeholder.com/150' }}
            />
            <View style={styles.coachDetails}>
              <Text style={styles.coachName}>{currentCoach.name}</Text>
              <Text style={styles.coachTitle}>{currentCoach.specialization}</Text>
            </View>
          </View>
        )}
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
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderCategoryChips()}
          
          <Card style={styles.messageCard}>
            <Card.Content>
              <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>Your Message 💭</Text>
              <TextInput
                mode="outlined"
                multiline
                numberOfLines={6}
                placeholder="Share your thoughts, suggestions, or concerns with your coach..."
                value={feedbackText}
                onChangeText={setFeedbackText}
                style={styles.messageInput}
                activeOutlineColor={COLORS.primary}
              />
            </Card.Content>
          </Card>

          {renderRatingSection()}

          <Card style={styles.optionsCard}>
            <Card.Content>
              <TouchableOpacity
                style={styles.anonymousOption}
                onPress={() => setIsAnonymous(!isAnonymous)}
              >
                <View style={styles.anonymousContent}>
                  <Icon
                    name={isAnonymous ? 'check-box' : 'check-box-outline-blank'}
                    size={24}
                    color={COLORS.primary}
                  />
                  <View style={styles.anonymousText}>
                    <Text style={TEXT_STYLES.body}>Send Anonymous Feedback 🕶️</Text>
                    <Text style={TEXT_STYLES.caption}>
                      Your identity will be hidden from your coach
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </Card.Content>
          </Card>

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleSubmitFeedback}
              style={styles.submitButton}
              loading={isSubmitting}
              disabled={isSubmitting}
              labelStyle={styles.submitButtonText}
            >
              {isSubmitting ? 'Sending Feedback...' : 'Send Feedback 🚀'}
            </Button>
          </View>

          <View style={{ height: SPACING.xl }} />
        </ScrollView>
      </Animated.View>

      {renderRatingModal()}
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
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  coachInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  coachDetails: {
    marginLeft: SPACING.md,
  },
  coachName: {
    ...TEXT_STYLES.h3,
    color: '#fff',
    marginBottom: 2,
  },
  coachTitle: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  categoryContainer: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    marginBottom: SPACING.sm,
  },
  chipRow: {
    flexDirection: 'row',
    paddingVertical: SPACING.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  categoryText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.xs,
    fontSize: 14,
  },
  messageCard: {
    marginVertical: SPACING.sm,
    elevation: 3,
  },
  messageInput: {
    backgroundColor: COLORS.surface,
    marginTop: SPACING.sm,
  },
  ratingCard: {
    marginVertical: SPACING.sm,
    elevation: 3,
  },
  ratingSubtitle: {
    marginBottom: SPACING.md,
    fontStyle: 'italic',
  },
  ratingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  ratingItemContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingDisplay: {
    alignItems: 'flex-end',
  },
  ratingStars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingValue: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
  },
  optionsCard: {
    marginVertical: SPACING.sm,
    elevation: 3,
  },
  anonymousOption: {
    paddingVertical: SPACING.sm,
  },
  anonymousContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  anonymousText: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  buttonContainer: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.xs,
    borderRadius: 25,
    elevation: 4,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  ratingModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurContainer: {
    width: width * 0.9,
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalContent: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: SPACING.lg,
  },
  starButton: {
    alignItems: 'center',
    padding: SPACING.sm,
  },
  starLabel: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
    fontWeight: 'bold',
  },
  cancelButton: {
    marginTop: SPACING.md,
    borderColor: COLORS.textSecondary,
  },
});

export default FeedbackToCoach;