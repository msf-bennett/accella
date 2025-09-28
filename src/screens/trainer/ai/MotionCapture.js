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
  Platform,
  PermissionsAndroid,
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
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RNCamera } from 'react-native-camera';
import Video from 'react-native-video';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const MotionCapture = ({ navigation }) => {
  // Redux state
  const dispatch = useDispatch();
  const { user, theme } = useSelector(state => state.auth);
  const { sessions, isLoading } = useSelector(state => state.training);

  // Component state
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [showExerciseLibrary, setShowExerciseLibrary] = useState(false);
  const [motionPoints, setMotionPoints] = useState([]);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [cameraPermission, setCameraPermission] = useState(false);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const cameraRef = useRef(null);

  // Exercise library data
  const exerciseLibrary = [
    { id: 1, name: 'Squat Analysis', icon: '🏋️', category: 'Lower Body', difficulty: 'Beginner' },
    { id: 2, name: 'Push-up Form', icon: '💪', category: 'Upper Body', difficulty: 'Beginner' },
    { id: 3, name: 'Deadlift Technique', icon: '🏃', category: 'Full Body', difficulty: 'Advanced' },
    { id: 4, name: 'Running Gait', icon: '🏃‍♂️', category: 'Cardio', difficulty: 'Intermediate' },
    { id: 5, name: 'Jump Landing', icon: '🦘', category: 'Plyometric', difficulty: 'Advanced' },
    { id: 6, name: 'Overhead Press', icon: '🏋️‍♀️', category: 'Upper Body', difficulty: 'Intermediate' },
  ];

  // Mock analysis data
  const mockAnalysisData = {
    overallScore: 85,
    formAccuracy: 92,
    rangeOfMotion: 78,
    symmetry: 88,
    tempo: 82,
    keyPoints: [
      { point: 'Knee Alignment', status: 'good', score: 90 },
      { point: 'Hip Depth', status: 'warning', score: 75 },
      { point: 'Back Position', status: 'excellent', score: 95 },
      { point: 'Foot Placement', status: 'good', score: 85 },
    ],
    recommendations: [
      'Focus on achieving greater hip depth for optimal squat range',
      'Maintain consistent tempo throughout the movement',
      'Consider warming up hip flexors before training',
    ]
  };

  // Initialize animations
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    startPulseAnimation();
    requestCameraPermission();
  }, []);

  const startPulseAnimation = () => {
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start(() => startPulseAnimation());
  };

  const requestCameraPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'Motion Capture needs camera access for video recording',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        setCameraPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
      } else {
        setCameraPermission(true);
      }
    } catch (error) {
      console.log('Camera permission error:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleStartRecording = async () => {
    if (!selectedExercise) {
      Alert.alert('Select Exercise', 'Please choose an exercise type for analysis');
      return;
    }

    if (!cameraRef.current) return;

    try {
      setIsRecording(true);
      Vibration.vibrate(50);
      
      const options = {
        quality: RNCamera.Constants.VideoQuality['720p'],
        maxDuration: 30,
        maxFileSize: 100 * 1024 * 1024, // 100MB
      };

      const data = await cameraRef.current.recordAsync(options);
      setRecordedVideo(data.uri);
      setIsRecording(false);
      
      // Start AI analysis
      startAnalysis();
    } catch (error) {
      setIsRecording(false);
      Alert.alert('Recording Error', 'Failed to record video. Please try again.');
    }
  };

  const handleStopRecording = () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
      setIsRecording(false);
    }
  };

  const startAnalysis = () => {
    setAnalysisProgress(0);
    setShowAnalysisModal(true);
    
    // Simulate AI analysis progress
    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setAnalysisResults(mockAnalysisData);
          Vibration.vibrate([100, 200, 100]);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const renderExerciseCard = (exercise) => (
    <TouchableOpacity
      key={exercise.id}
      style={styles.exerciseCard}
      onPress={() => {
        setSelectedExercise(exercise);
        setShowExerciseLibrary(false);
        Vibration.vibrate(30);
      }}
    >
      <Surface style={styles.exerciseSurface} elevation={2}>
        <Text style={styles.exerciseIcon}>{exercise.icon}</Text>
        <Text style={styles.exerciseName}>{exercise.name}</Text>
        <Chip
          mode="outlined"
          compact
          style={styles.categoryChip}
          textStyle={styles.chipText}
        >
          {exercise.category}
        </Chip>
        <Chip
          mode="outlined"
          compact
          style={[styles.difficultyChip, {
            backgroundColor: exercise.difficulty === 'Beginner' ? COLORS.success + '20' :
                           exercise.difficulty === 'Intermediate' ? COLORS.primary + '20' :
                           COLORS.error + '20'
          }]}
          textStyle={styles.chipText}
        >
          {exercise.difficulty}
        </Chip>
      </Surface>
    </TouchableOpacity>
  );

  const renderAnalysisResults = () => {
    if (!analysisResults) return null;

    return (
      <View style={styles.analysisContainer}>
        <Text style={styles.analysisTitle}>📊 Motion Analysis Results</Text>
        
        {/* Overall Score */}
        <Card style={styles.scoreCard}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.scoreGradient}
          >
            <Text style={styles.scoreLabel}>Overall Score</Text>
            <Text style={styles.scoreValue}>{analysisResults.overallScore}/100</Text>
            <Text style={styles.scoreEmoji}>
              {analysisResults.overallScore >= 90 ? '🏆' : 
               analysisResults.overallScore >= 80 ? '🥈' : 
               analysisResults.overallScore >= 70 ? '🥉' : '💪'}
            </Text>
          </LinearGradient>
        </Card>

        {/* Key Metrics */}
        <View style={styles.metricsGrid}>
          {[
            { label: 'Form', value: analysisResults.formAccuracy },
            { label: 'ROM', value: analysisResults.rangeOfMotion },
            { label: 'Symmetry', value: analysisResults.symmetry },
            { label: 'Tempo', value: analysisResults.tempo },
          ].map((metric, index) => (
            <Surface key={index} style={styles.metricCard} elevation={2}>
              <Text style={styles.metricLabel}>{metric.label}</Text>
              <ProgressBar
                progress={metric.value / 100}
                color={metric.value >= 90 ? COLORS.success : 
                       metric.value >= 80 ? COLORS.primary : COLORS.error}
                style={styles.metricProgress}
              />
              <Text style={styles.metricValue}>{metric.value}%</Text>
            </Surface>
          ))}
        </View>

        {/* Key Points Analysis */}
        <Card style={styles.pointsCard}>
          <Text style={styles.sectionTitle}>🎯 Key Points Analysis</Text>
          {analysisResults.keyPoints.map((point, index) => (
            <View key={index} style={styles.pointRow}>
              <Icon
                name={point.status === 'excellent' ? 'check-circle' : 
                      point.status === 'good' ? 'check' : 'warning'}
                size={20}
                color={point.status === 'excellent' ? COLORS.success :
                       point.status === 'good' ? COLORS.primary : COLORS.error}
              />
              <Text style={styles.pointText}>{point.point}</Text>
              <Text style={styles.pointScore}>{point.score}%</Text>
            </View>
          ))}
        </Card>

        {/* Recommendations */}
        <Card style={styles.recommendationsCard}>
          <Text style={styles.sectionTitle}>💡 AI Recommendations</Text>
          {analysisResults.recommendations.map((rec, index) => (
            <View key={index} style={styles.recommendationRow}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.recommendationText}>{rec}</Text>
            </View>
          ))}
        </Card>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <Text style={styles.headerTitle}>🎥 AI Motion Capture</Text>
        <Text style={styles.headerSubtitle}>
          Analyze movement patterns with AI precision
        </Text>
      </LinearGradient>

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
        {/* Selected Exercise */}
        {selectedExercise && (
          <Animated.View style={[styles.selectedExerciseContainer, { opacity: fadeAnim }]}>
            <Card style={styles.selectedExerciseCard}>
              <Text style={styles.selectedExerciseTitle}>Selected Exercise</Text>
              <View style={styles.selectedExerciseInfo}>
                <Text style={styles.selectedExerciseIcon}>{selectedExercise.icon}</Text>
                <View>
                  <Text style={styles.selectedExerciseName}>{selectedExercise.name}</Text>
                  <Text style={styles.selectedExerciseCategory}>{selectedExercise.category}</Text>
                </View>
              </View>
              <Button
                mode="outlined"
                onPress={() => setShowExerciseLibrary(true)}
                icon="swap-horiz"
                compact
              >
                Change Exercise
              </Button>
            </Card>
          </Animated.View>
        )}

        {/* Camera View */}
        <Card style={styles.cameraCard}>
          <Text style={styles.cameraTitle}>📹 Motion Capture Zone</Text>
          
          {cameraPermission ? (
            <View style={styles.cameraContainer}>
              {recordedVideo ? (
                <Video
                  source={{ uri: recordedVideo }}
                  style={styles.camera}
                  controls
                  resizeMode="cover"
                />
              ) : (
                <RNCamera
                  ref={cameraRef}
                  style={styles.camera}
                  type={RNCamera.Constants.Type.back}
                  flashMode={RNCamera.Constants.FlashMode.off}
                  androidCameraPermissionOptions={{
                    title: 'Permission to use camera',
                    message: 'We need your permission to use your camera',
                    buttonPositive: 'Ok',
                    buttonNegative: 'Cancel',
                  }}
                />
              )}
              
              {/* Recording Indicator */}
              {isRecording && (
                <Animated.View style={[styles.recordingIndicator, { transform: [{ scale: pulseAnim }] }]}>
                  <View style={styles.recordingDot} />
                  <Text style={styles.recordingText}>Recording...</Text>
                </Animated.View>
              )}

              {/* Camera Controls */}
              <View style={styles.cameraControls}>
                {!recordedVideo ? (
                  <TouchableOpacity
                    style={[styles.recordButton, isRecording && styles.recordButtonActive]}
                    onPress={isRecording ? handleStopRecording : handleStartRecording}
                  >
                    <Icon
                      name={isRecording ? 'stop' : 'videocam'}
                      size={30}
                      color="white"
                    />
                  </TouchableOpacity>
                ) : (
                  <View style={styles.videoControls}>
                    <IconButton
                      icon="replay"
                      size={24}
                      onPress={() => setRecordedVideo(null)}
                      iconColor="white"
                      style={styles.controlButton}
                    />
                    <IconButton
                      icon="analytics"
                      size={24}
                      onPress={startAnalysis}
                      iconColor="white"
                      style={styles.controlButton}
                    />
                  </View>
                )}
              </View>
            </View>
          ) : (
            <View style={styles.permissionContainer}>
              <Icon name="camera-alt" size={60} color={COLORS.primary} />
              <Text style={styles.permissionText}>Camera permission required</Text>
              <Button
                mode="contained"
                onPress={requestCameraPermission}
                style={styles.permissionButton}
              >
                Grant Permission
              </Button>
            </View>
          )}
        </Card>

        {/* Analysis Results */}
        {analysisResults && renderAnalysisResults()}

        {/* Quick Actions */}
        <Card style={styles.actionsCard}>
          <Text style={styles.actionsTitle}>⚡ Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowExerciseLibrary(true)}
            >
              <Icon name="fitness-center" size={24} color={COLORS.primary} />
              <Text style={styles.actionText}>Exercise Library</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => Alert.alert('Feature Coming Soon', 'Session history will be available in the next update')}
            >
              <Icon name="history" size={24} color={COLORS.primary} />
              <Text style={styles.actionText}>Session History</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => Alert.alert('Feature Coming Soon', 'AI coaching tips will be available in the next update')}
            >
              <Icon name="psychology" size={24} color={COLORS.primary} />
              <Text style={styles.actionText}>AI Coach Tips</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => Alert.alert('Feature Coming Soon', 'Progress reports will be available in the next update')}
            >
              <Icon name="assessment" size={24} color={COLORS.primary} />
              <Text style={styles.actionText}>Progress Report</Text>
            </TouchableOpacity>
          </View>
        </Card>
      </ScrollView>

      {/* Exercise Library Modal */}
      <Portal>
        <Modal
          visible={showExerciseLibrary}
          onDismiss={() => setShowExerciseLibrary(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🏋️ Exercise Library</Text>
            <IconButton
              icon="close"
              onPress={() => setShowExerciseLibrary(false)}
              iconColor={COLORS.primary}
            />
          </View>
          
          <Searchbar
            placeholder="Search exercises..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchBar}
          />
          
          <ScrollView style={styles.exerciseList}>
            <View style={styles.exerciseGrid}>
              {exerciseLibrary
                .filter(exercise => 
                  exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  exercise.category.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map(renderExerciseCard)}
            </View>
          </ScrollView>
        </Modal>
      </Portal>

      {/* Analysis Progress Modal */}
      <Portal>
        <Modal
          visible={showAnalysisModal && !analysisResults}
          contentContainerStyle={styles.progressModalContainer}
        >
          <View style={styles.progressContent}>
            <Text style={styles.progressTitle}>🤖 AI Analyzing Motion...</Text>
            <ProgressBar
              progress={analysisProgress / 100}
              color={COLORS.primary}
              style={styles.analysisProgressBar}
            />
            <Text style={styles.progressText}>{analysisProgress}% Complete</Text>
            <Text style={styles.progressSteps}>
              {analysisProgress < 30 ? '🔍 Detecting key points...' :
               analysisProgress < 60 ? '📏 Measuring angles...' :
               analysisProgress < 90 ? '⚖️ Analyzing symmetry...' :
               '✨ Generating insights...'}
            </Text>
          </View>
        </Modal>
      </Portal>

      {/* Floating Action Button */}
      {selectedExercise && !isRecording && (
        <FAB
          icon="play-arrow"
          style={styles.fab}
          onPress={handleStartRecording}
          label="Start Capture"
        />
      )}
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
  scrollView: {
    flex: 1,
    padding: SPACING.md,
  },
  selectedExerciseContainer: {
    marginBottom: SPACING.md,
  },
  selectedExerciseCard: {
    padding: SPACING.md,
  },
  selectedExerciseTitle: {
    ...TEXT_STYLES.h4,
    marginBottom: SPACING.sm,
  },
  selectedExerciseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  selectedExerciseIcon: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  selectedExerciseName: {
    ...TEXT_STYLES.h4,
    color: COLORS.primary,
  },
  selectedExerciseCategory: {
    ...TEXT_STYLES.caption,
    color: COLORS.text + '80',
  },
  cameraCard: {
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  cameraTitle: {
    ...TEXT_STYLES.h4,
    padding: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  cameraContainer: {
    height: 300,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  permissionContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  permissionText: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    marginVertical: SPACING.md,
  },
  permissionButton: {
    marginTop: SPACING.md,
  },
  recordingIndicator: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
    marginRight: SPACING.xs,
  },
  recordingText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cameraControls: {
    position: 'absolute',
    bottom: SPACING.md,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  recordButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  recordButtonActive: {
    backgroundColor: COLORS.error + '80',
  },
  videoControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    marginHorizontal: SPACING.sm,
  },
  analysisContainer: {
    marginBottom: SPACING.md,
  },
  analysisTitle: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  scoreCard: {
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  scoreGradient: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  scoreLabel: {
    ...TEXT_STYLES.body,
    color: 'white',
    marginBottom: SPACING.xs,
  },
  scoreValue: {
    ...TEXT_STYLES.h1,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  scoreEmoji: {
    fontSize: 32,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  metricCard: {
    width: (width - SPACING.md * 3) / 2,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    alignItems: 'center',
  },
  metricLabel: {
    ...TEXT_STYLES.caption,
    marginBottom: SPACING.xs,
  },
  metricProgress: {
    width: '100%',
    marginVertical: SPACING.xs,
  },
  metricValue: {
    ...TEXT_STYLES.h4,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  pointsCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.h4,
    marginBottom: SPACING.md,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  pointText: {
    ...TEXT_STYLES.body,
    flex: 1,
    marginLeft: SPACING.sm,
  },
  pointScore: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  recommendationsCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  recommendationRow: {
    flexDirection: 'row',
    paddingVertical: SPACING.sm,
  },
  bulletPoint: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    marginRight: SPACING.sm,
  },
  recommendationText: {
    ...TEXT_STYLES.body,
    flex: 1,
  },
  actionsCard: {
    padding: SPACING.md,
    marginBottom: SPACING.xl,
  },
  actionsTitle: {
    ...TEXT_STYLES.h4,
    marginBottom: SPACING.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: (width - SPACING.md * 3) / 2,
    aspectRatio: 1,
    backgroundColor: COLORS.primary + '10',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  actionText: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: SPACING.md,
    borderRadius: 12,
    maxHeight: height * 0.8,
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
  },
  searchBar: {
    margin: SPACING.md,
  },
  exerciseList: {
    flex: 1,
  },
  exerciseGrid: {
    padding: SPACING.md,
  },
  exerciseCard: {
    marginBottom: SPACING.md,
  },
  exerciseSurface: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  exerciseIcon: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  exerciseName: {
    ...TEXT_STYLES.h4,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  categoryChip: {
    marginBottom: SPACING.xs,
  },
  difficultyChip: {
    marginBottom: SPACING.xs,
  },
  chipText: {
    fontSize: 12,
  },
  progressModalContainer: {
    backgroundColor: 'white',
    margin: SPACING.lg,
    borderRadius: 12,
    padding: SPACING.lg,
  },
  progressContent: {
    alignItems: 'center',
  },
  progressTitle: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  analysisProgressBar: {
    width: '100%',
    height: 8,
    marginBottom: SPACING.md,
  },
  progressText: {
    ...TEXT_STYLES.h4,
    marginBottom: SPACING.sm,
    color: COLORS.primary,
  },
  progressSteps: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    color: COLORS.text + '80',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default MotionCapture;