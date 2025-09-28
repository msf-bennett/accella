//src/screens/coach/training/PlanProcessing.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  BackHandler,
} from 'react-native';
import { Card, Button, ProgressBar, Surface } from 'react-native-paper';
import DocumentProcessor from '../../../services/DocumentProcessor';
import { COLORS, SPACING, TEXT_STYLES } from '../../../styles/themes';

const PlanProcessingScreen = ({ navigation, route }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Initializing...');
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState(null);
  const [trainingPlan, setTrainingPlan] = useState(null);

  const { documentId, onComplete } = route.params || {};

  useEffect(() => {
    if (!documentId) {
      Alert.alert('Error', 'No document selected for processing');
      navigation.goBack();
      return;
    }

    processDocument();
  }, [documentId]);

  // Handle back button - prevent going back during processing
  useEffect(() => {
    const backAction = () => {
      if (!isComplete) {
        Alert.alert(
          'Processing in Progress',
          'Document is still being processed. Are you sure you want to cancel?',
          [
            { text: 'Continue Processing', style: 'cancel' },
            { 
              text: 'Cancel Processing', 
              style: 'destructive',
              onPress: () => navigation.goBack()
            },
          ]
        );
        return true; // Prevent default back action
      }
      return false; // Allow default back action
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [isComplete, navigation]);

const processDocument = async () => {
  try {
    setProgress(0.1);
    setStatus('Initializing...');

    const { documentId, forceReprocess } = route.params || {};

    // If force reprocess is enabled, bypass duplicate check
    if (forceReprocess) {
      console.log('Force reprocessing document:', documentId);
      // You might want to add a timestamp or version to distinguish plans
    }

    setProgress(0.3);
    setStatus('Extracting content...');
    
    // Process the document (the duplicate check in processTrainingPlan will handle the rest)
    const result = await DocumentProcessor.processTrainingPlan(documentId, { force: forceReprocess });
      
      setProgress(0.9);
      setStatus('Finalizing...');

      // Small delay for UI responsiveness
      await new Promise(resolve => setTimeout(resolve, 500));

      setProgress(1.0);
      setStatus('Processing complete!');
      setTrainingPlan(result);
      setIsComplete(true);

      // Auto-navigate after 2 seconds
      setTimeout(() => {
        handleNavigateToLibrary(result);
      }, 2000);

    } catch (error) {
      console.error('Processing failed:', error);
      setError(error.message || 'Processing failed');
      setStatus('Processing failed');
      
      Alert.alert(
        'Processing Failed',
        error.message || 'An error occurred while processing your document.',
        [
          {
            text: 'Try Again',
            onPress: () => {
              setError(null);
              setProgress(0);
              setIsComplete(false);
              processDocument();
            }
          },
          {
            text: 'Go Back',
            style: 'cancel',
            onPress: () => navigation.goBack()
          }
        ]
      );
    }
  };

  const handleNavigateToLibrary = (plan) => {
    // Call the onComplete callback if provided
    if (onComplete && typeof onComplete === 'function') {
      onComplete(plan);
      return; // If callback is provided, let it handle navigation
    }

    // Try different navigation approaches based on the navigation structure
    try {
      // First, try to navigate directly to TrainingPlanLibrary
      navigation.navigate('TrainingPlanLibrary', {
        newPlanId: plan?.id,
        showSuccess: true,
        message: `"${plan?.title || 'Training Plan'}" has been successfully created!`
      });
    } catch (error) {
      console.log('Direct navigation failed, trying alternative approaches...');
      
      try {
        // Try navigating to Training tab first, then to library
        navigation.navigate('Training', {
          screen: 'TrainingPlanLibrary',
          params: {
            newPlanId: plan?.id,
            showSuccess: true,
            message: `"${plan?.title || 'Training Plan'}" has been successfully created!`
          }
        });
      } catch (error2) {
        console.log('Tab navigation failed, going back to dashboard...');
        
        // Fallback: go back to dashboard and show success message
        navigation.navigate('Dashboard');
        
        // Show success alert as fallback
        setTimeout(() => {
          Alert.alert(
            'Success!',
            `"${plan?.title || 'Training Plan'}" has been successfully created and saved to your library!`,
            [
              {
                text: 'View Library',
                onPress: () => {
                  try {
                    navigation.navigate('TrainingPlanLibrary');
                  } catch {
                    navigation.navigate('Training');
                  }
                }
              },
              { text: 'OK', style: 'default' }
            ]
          );
        }, 500);
      }
    }
  };

  const handleManualNavigate = () => {
    if (isComplete && trainingPlan) {
      handleNavigateToLibrary(trainingPlan);
    }
  };

  const handleTryAgain = () => {
    setError(null);
    setProgress(0);
    setIsComplete(false);
    setTrainingPlan(null);
    processDocument();
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.surface}>
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            {/* Status Icon */}
            <View style={styles.iconContainer}>
              {error ? (
                <Text style={styles.errorIcon}>❌</Text>
              ) : isComplete ? (
                <Text style={styles.successIcon}>✅</Text>
              ) : (
                <Text style={styles.processingIcon}>⚙️</Text>
              )}
            </View>

            {/* Title */}
            <Text style={styles.title}>
              {error ? 'Processing Failed' : isComplete ? 'Processing Complete!' : 'Processing Training Plan'}
            </Text>

            {/* Progress Bar */}
            {!error && (
              <View style={styles.progressContainer}>
                <ProgressBar
                  progress={progress}
                  color={isComplete ? COLORS.success : COLORS.primary}
                  style={styles.progressBar}
                />
                <Text style={styles.progressText}>
                  {Math.round(progress * 100)}% Complete
                </Text>
              </View>
            )}

            {/* Status Text */}
            <Text style={[
              styles.status,
              { color: error ? COLORS.error : isComplete ? COLORS.success : COLORS.textSecondary }
            ]}>
              {error || status}
            </Text>

            {/* Training Plan Info (when complete) */}
            {isComplete && trainingPlan && (
              <View style={styles.planInfo}>
                <Text style={styles.planTitle}>{trainingPlan.title}</Text>
                <Text style={styles.planDetails}>
                  {trainingPlan.sessionsCount} sessions • {trainingPlan.duration} • {trainingPlan.difficulty}
                </Text>
                <Text style={styles.planCategory}>{trainingPlan.category}</Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              {error ? (
                <>
                  <Button
                    mode="contained"
                    onPress={handleTryAgain}
                    style={[styles.button, { backgroundColor: COLORS.primary }]}
                  >
                    Try Again
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={() => navigation.goBack()}
                    style={[styles.button, styles.secondaryButton]}
                  >
                    Go Back
                  </Button>
                </>
              ) : isComplete ? (
                <>
                  <Button
                    mode="contained"
                    onPress={handleManualNavigate}
                    style={[styles.button, { backgroundColor: COLORS.success }]}
                  >
                    View in Library
                  </Button>
                  <Text style={styles.autoRedirectText}>
                    Redirecting automatically...
                  </Text>
                </>
              ) : (
                <Button
                  mode="outlined"
                  onPress={() => navigation.goBack()}
                  style={[styles.button, styles.secondaryButton]}
                  disabled={progress > 0.3} // Disable once processing really starts
                >
                  Cancel
                </Button>
              )}
            </View>

            {/* Platform indicator */}
            <Text style={styles.platformText}>Web Platform</Text>
          </Card.Content>
        </Card>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  surface: {
    width: '100%',
    maxWidth: 400,
    elevation: 4,
    borderRadius: 16,
  },
  card: {
    borderRadius: 16,
  },
  cardContent: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: SPACING.lg,
  },
  processingIcon: {
    fontSize: 48,
  },
  successIcon: {
    fontSize: 48,
  },
  errorIcon: {
    fontSize: 48,
  },
  title: {
    ...TEXT_STYLES.h2,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  progressContainer: {
    width: '100%',
    marginBottom: SPACING.lg,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.sm,
  },
  progressText: {
    ...TEXT_STYLES.body2,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  status: {
    ...TEXT_STYLES.body1,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  planInfo: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.surfaceVariant || '#f5f5f5',
    borderRadius: 8,
    width: '100%',
  },
  planTitle: {
    ...TEXT_STYLES.h3,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  planDetails: {
    ...TEXT_STYLES.body2,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  planCategory: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    textAlign: 'center',
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    width: '100%',
    marginBottom: SPACING.sm,
  },
  secondaryButton: {
    borderColor: COLORS.textSecondary,
  },
  autoRedirectText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: SPACING.sm,
  },
  platformText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
});

export default PlanProcessingScreen;
