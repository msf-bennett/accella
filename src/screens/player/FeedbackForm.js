import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const FeedbackForm = ({ route, navigation }) => {
  const { sessionId, sessionTitle, playerName } = route.params || {};
  
  const [feedback, setFeedback] = useState({
    rating: 0,
    effort: 0,
    difficulty: 0,
    enjoyment: 0,
    notes: '',
    improvements: '',
    nextGoals: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Load existing feedback if editing
    if (sessionId) {
      loadExistingFeedback();
    }
  }, [sessionId]);

  const loadExistingFeedback = async () => {
    try {
      // This would typically load from your API or local storage
      // For now, we'll simulate loading
      console.log('Loading existing feedback for session:', sessionId);
    } catch (error) {
      console.error('Error loading feedback:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (feedback.rating === 0) {
      newErrors.rating = 'Please provide an overall rating';
    }
    
    if (feedback.effort === 0) {
      newErrors.effort = 'Please rate your effort level';
    }
    
    if (feedback.notes.trim().length === 0) {
      newErrors.notes = 'Please provide some feedback notes';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Submit feedback to API or local storage
      const feedbackData = {
        sessionId,
        ...feedback,
        submittedAt: new Date().toISOString(),
        playerName
      };
      
      console.log('Submitting feedback:', feedbackData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert(
        'Success',
        'Your feedback has been submitted successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert('Error', 'Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderRatingSection = (title, value, onPress, error) => (
    <View style={styles.ratingSection}>
      <Text style={styles.ratingTitle}>{title}</Text>
      {error && <Text style={styles.errorText}>{error}</Text>}
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((rating) => (
          <TouchableOpacity
            key={rating}
            style={[
              styles.ratingButton,
              value >= rating && styles.ratingButtonActive
            ]}
            onPress={() => onPress(rating)}
          >
            <Text style={[
              styles.ratingButtonText,
              value >= rating && styles.ratingButtonTextActive
            ]}>
              {rating}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.ratingLabels}>
        Poor {'                    '} Excellent
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Session Feedback</Text>
            <Text style={styles.subtitle}>
              {sessionTitle || 'Training Session'}
            </Text>
            {playerName && (
              <Text style={styles.playerName}>Player: {playerName}</Text>
            )}
          </View>

          {/* Overall Rating */}
          {renderRatingSection(
            'Overall Session Rating *',
            feedback.rating,
            (rating) => setFeedback({ ...feedback, rating }),
            errors.rating
          )}

          {/* Effort Level */}
          {renderRatingSection(
            'Your Effort Level *',
            feedback.effort,
            (effort) => setFeedback({ ...feedback, effort }),
            errors.effort
          )}

          {/* Difficulty */}
          {renderRatingSection(
            'Session Difficulty',
            feedback.difficulty,
            (difficulty) => setFeedback({ ...feedback, difficulty })
          )}

          {/* Enjoyment */}
          {renderRatingSection(
            'How Much Did You Enjoy It?',
            feedback.enjoyment,
            (enjoyment) => setFeedback({ ...feedback, enjoyment })
          )}

          {/* Notes Section */}
          <View style={styles.textSection}>
            <Text style={styles.textSectionTitle}>
              Session Notes *
            </Text>
            {errors.notes && <Text style={styles.errorText}>{errors.notes}</Text>}
            <TextInput
              style={[styles.textInput, styles.notesInput]}
              multiline
              numberOfLines={4}
              placeholder="How did the session go? What did you learn? Any challenges?"
              value={feedback.notes}
              onChangeText={(notes) => setFeedback({ ...feedback, notes })}
              textAlignVertical="top"
            />
          </View>

          {/* Improvements Section */}
          <View style={styles.textSection}>
            <Text style={styles.textSectionTitle}>
              Areas for Improvement
            </Text>
            <TextInput
              style={[styles.textInput, styles.notesInput]}
              multiline
              numberOfLines={3}
              placeholder="What would you like to work on next? Any specific skills?"
              value={feedback.improvements}
              onChangeText={(improvements) => setFeedback({ ...feedback, improvements })}
              textAlignVertical="top"
            />
          </View>

          {/* Next Goals Section */}
          <View style={styles.textSection}>
            <Text style={styles.textSectionTitle}>
              Goals for Next Session
            </Text>
            <TextInput
              style={[styles.textInput, styles.notesInput]}
              multiline
              numberOfLines={3}
              placeholder="What do you want to focus on in your next training session?"
              value={feedback.nextGoals}
              onChangeText={(nextGoals) => setFeedback({ ...feedback, nextGoals })}
              textAlignVertical="top"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Feedback</Text>
            )}
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={isSubmitting}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  header: {
    marginBottom: 30,
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 5,
  },
  playerName: {
    fontSize: 16,
    color: '#888',
    fontStyle: 'italic',
  },
  ratingSection: {
    marginBottom: 25,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  ratingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 15,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  ratingButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  ratingButtonActive: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  ratingButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },
  ratingButtonTextActive: {
    color: '#fff',
  },
  ratingLabels: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
  textSection: {
    marginBottom: 25,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  textSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 15,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  notesInput: {
    minHeight: 100,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 14,
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  submitButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6c757d',
  },
  cancelButtonText: {
    color: '#6c757d',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default FeedbackForm;