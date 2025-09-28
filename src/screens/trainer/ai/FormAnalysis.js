import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Alert,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
  Animated,
  Dimensions,
  FlatList,
  Image,
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
  Searchbar,
  Portal,
  Modal,
  TextInput,
  Divider,
  Badge,
  Switch,
  ActivityIndicator,
  Menu,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '../../../components/shared/BlurView';

// Design system imports
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const FormAnalysis = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);
  const scaleAnim = new Animated.Value(0);

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('upload');
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedExercise, setSelectedExercise] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);

  // Mock data for analysis
  const [analysisHistory, setAnalysisHistory] = useState([
    {
      id: 1,
      clientName: 'Sarah Johnson',
      exerciseCategory: 'Strength Training',
      exercise: 'Squat',
      date: '2024-08-18',
      overallScore: 87,
      thumbnail: 'https://via.placeholder.com/100x60',
      issues: ['Knee Valgus', 'Depth Issue'],
      improvements: 3,
      status: 'completed',
    },
    {
      id: 2,
      clientName: 'Mike Thompson',
      exerciseCategory: 'Cardio',
      exercise: 'Treadmill Running',
      date: '2024-08-17',
      overallScore: 92,
      thumbnail: 'https://via.placeholder.com/100x60',
      issues: ['Overstriding'],
      improvements: 2,
      status: 'completed',
    },
    {
      id: 3,
      clientName: 'Jennifer Davis',
      exerciseCategory: 'Functional',
      exercise: 'Deadlift',
      date: '2024-08-16',
      overallScore: 78,
      thumbnail: 'https://via.placeholder.com/100x60',
      issues: ['Rounded Back', 'Bar Path', 'Hip Hinge'],
      improvements: 4,
      status: 'in_progress',
    },
  ]);

  const exerciseCategories = [
    { key: 'strength', label: 'Strength Training', icon: 'fitness-center' },
    { key: 'cardio', label: 'Cardio', icon: 'directions-run' },
    { key: 'functional', label: 'Functional', icon: 'accessibility' },
    { key: 'flexibility', label: 'Flexibility', icon: 'self-improvement' },
    { key: 'core', label: 'Core Training', icon: 'center-focus-strong' },
    { key: 'rehabilitation', label: 'Rehabilitation', icon: 'healing' },
  ];

  const exercises = {
    strength: ['Squat', 'Deadlift', 'Bench Press', 'Pull-ups', 'Overhead Press', 'Rows', 'Lunges'],
    cardio: ['Treadmill Running', 'Rowing', 'Cycling', 'Elliptical', 'Burpees', 'Mountain Climbers'],
    functional: ['Kettlebell Swings', 'Box Jumps', 'Battle Ropes', 'Farmer Walks', 'Turkish Get-ups'],
    flexibility: ['Yoga Poses', 'Stretching Routine', 'Foam Rolling', 'Mobility Drills', 'PNF Stretching'],
    core: ['Plank', 'Russian Twists', 'Dead Bug', 'Bird Dog', 'Ab Wheel', 'Hanging Leg Raises'],
    rehabilitation: ['Physical Therapy Exercises', 'Corrective Movements', 'Balance Training', 'Range of Motion'],
  };

  // Sample detailed analysis result
  const sampleAnalysis = {
    overallScore: 85,
    breakdown: {
      form: 88,
      range_of_motion: 82,
      stability: 87,
      tempo: 83,
      safety: 90,
    },
    keyPoints: [
      {
        phase: 'Setup Position',
        score: 90,
        feedback: 'Excellent stance width and foot positioning',
        type: 'positive',
      },
      {
        phase: 'Descent',
        score: 78,
        feedback: 'Slight knee valgus detected during descent',
        type: 'warning',
        suggestion: 'Focus on pushing knees out during the movement',
      },
      {
        phase: 'Bottom Position',
        score: 82,
        feedback: 'Good depth achieved, maintain neutral spine',
        type: 'positive',
      },
      {
        phase: 'Ascent',
        score: 87,
        feedback: 'Strong drive through heels, good hip extension',
        type: 'positive',
      },
    ],
    biomechanics: {
      jointAngles: [
        { joint: 'Hip', angle: 95, optimal: 90, status: 'good' },
        { joint: 'Knee', angle: 85, optimal: 90, status: 'needs_improvement' },
        { joint: 'Ankle', angle: 15, optimal: 12, status: 'excellent' },
        { joint: 'Spine', angle: 5, optimal: 0, status: 'good' },
      ],
      repTempo: '3-1-2-1 sec',
      rangeOfMotion: '92%',
      loadDistribution: 'Balanced',
    },
    recommendations: [
      'Practice bodyweight squats focusing on knee tracking',
      'Perform ankle mobility exercises before squatting',
      'Strengthen glutes with clamshells and bridges',
      'Work on hip flexor flexibility',
    ],
    comparisonData: {
      clientAverage: 85,
      gymAverage: 78,
      traineeLevel: 'Intermediate',
    },
  };

  // Initialize animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  // Analyze video
  const analyzeVideo = async () => {
    if (!selectedCategory || !selectedExercise) {
      Alert.alert('Missing Information', 'Please select an exercise category and specific exercise.');
      return;
    }

    setAnalyzing(true);
    
    // Simulate AI analysis process
    setTimeout(() => {
      setAnalysisResults(sampleAnalysis);
      setAnalyzing(false);
      setShowResultModal(true);
    }, 5000);
  };

  // Upload video handler
  const uploadVideo = () => {
    Alert.alert(
      'Upload Video',
      'Choose video source:',
      [
        { text: 'Camera', onPress: () => console.log('Open camera') },
        { text: 'Gallery', onPress: () => console.log('Open gallery') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return COLORS.success;
      case 'in_progress': return COLORS.warning;
      case 'error': return COLORS.error;
      default: return COLORS.gray;
    }
  };

  // Get feedback type color
  const getFeedbackColor = (type) => {
    switch (type) {
      case 'positive': return COLORS.success;
      case 'warning': return COLORS.warning;
      case 'error': return COLORS.error;
      default: return COLORS.primary;
    }
  };

  // Render upload section
  const renderUploadSection = () => (
    <View style={styles.uploadSection}>
      <Surface style={styles.uploadCard}>
        <TouchableOpacity onPress={uploadVideo} style={styles.uploadArea}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={styles.uploadGradient}
          >
            <Icon name="cloud-upload" size={48} color={COLORS.white} />
            <Text style={styles.uploadText}>Tap to Upload Video</Text>
            <Text style={styles.uploadSubtext}>or drag and drop video file</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Surface>

      {/* Exercise Category and Exercise Selection */}
      <Card style={styles.selectionCard}>
        <Card.Content>
          <Text style={styles.selectionTitle}>💪 Exercise Analysis Settings</Text>
          
          <View style={styles.selectionRow}>
            <Text style={styles.selectionLabel}>Exercise Category:</Text>
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setMenuVisible(true)}
                  style={styles.selectionButton}
                  contentStyle={styles.selectionButtonContent}
                >
                  {selectedCategory || 'Select Category'}
                  <Icon name="arrow-drop-down" size={20} />
                </Button>
              }
            >
              {exerciseCategories.map(category => (
                <Menu.Item
                  key={category.key}
                  onPress={() => {
                    setSelectedCategory(category.label);
                    setSelectedExercise('');
                    setMenuVisible(false);
                  }}
                  title={category.label}
                  leadingIcon={category.icon}
                />
              ))}
            </Menu>
          </View>

          <View style={styles.selectionRow}>
            <Text style={styles.selectionLabel}>Specific Exercise:</Text>
            <Menu
              visible={filterVisible}
              onDismiss={() => setFilterVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setFilterVisible(true)}
                  disabled={!selectedCategory}
                  style={styles.selectionButton}
                  contentStyle={styles.selectionButtonContent}
                >
                  {selectedExercise || 'Select Exercise'}
                  <Icon name="arrow-drop-down" size={20} />
                </Button>
              }
            >
              {selectedCategory && exercises[selectedCategory.toLowerCase().split(' ')[0]]?.map(exercise => (
                <Menu.Item
                  key={exercise}
                  onPress={() => {
                    setSelectedExercise(exercise);
                    setFilterVisible(false);
                  }}
                  title={exercise}
                />
              ))}
            </Menu>
          </View>

          <Button
            mode="contained"
            onPress={analyzeVideo}
            loading={analyzing}
            disabled={analyzing || !selectedCategory || !selectedExercise}
            style={styles.analyzeButton}
            icon="psychology"
          >
            {analyzing ? 'Analyzing Exercise Form...' : 'Start AI Form Analysis'}
          </Button>
        </Card.Content>
      </Card>
    </View>
  );

  // Render analysis history item
  const renderHistoryItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        setAnalysisResults(sampleAnalysis);
        setShowResultModal(true);
      }}
    >
      <Card style={styles.historyCard}>
        <Card.Content>
          <View style={styles.historyHeader}>
            <View style={styles.historyInfo}>
              <Text style={styles.historyPlayer}>{item.clientName}</Text>
              <Text style={styles.historyDetails}>{item.exerciseCategory} • {item.exercise}</Text>
              <Text style={styles.historyDate}>{item.date}</Text>
            </View>
            <View style={styles.historyRight}>
              <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
              <Badge
                style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}
              >
                {item.overallScore}%
              </Badge>
            </View>
          </View>
          
          <View style={styles.historyFooter}>
            <View style={styles.issuesContainer}>
              {item.issues.slice(0, 2).map((issue, index) => (
                <Chip key={index} mode="outlined" compact style={styles.issueChip}>
                  {issue}
                </Chip>
              ))}
              {item.issues.length > 2 && (
                <Text style={styles.moreIssues}>+{item.issues.length - 2} more</Text>
              )}
            </View>
            <Text style={styles.improvements}>
              {item.improvements} improvements suggested
            </Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  // Render detailed analysis modal
  const renderAnalysisModal = () => (
    <Portal>
      <Modal
        visible={showResultModal}
        onDismiss={() => setShowResultModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.modalBlur} blurType="light" blurAmount={10}>
          <Card style={styles.resultCard}>
            <Card.Title 
              title="🎯 Analysis Results" 
              titleStyle={styles.modalTitle}
              right={(props) => (
                <IconButton
                  {...props}
                  icon="close"
                  onPress={() => setShowResultModal(false)}
                />
              )}
            />
            <Card.Content>
              <ScrollView style={styles.resultScroll} showsVerticalScrollIndicator={false}>
                {analysisResults && (
                  <>
                    {/* Overall Score */}
                    <Surface style={styles.scoreSection}>
                      <Text style={styles.scoreTitle}>Overall Score</Text>
                      <View style={styles.scoreDisplay}>
                        <Text style={styles.scoreNumber}>{analysisResults.overallScore}</Text>
                        <Text style={styles.scoreUnit}>%</Text>
                      </View>
                      <ProgressBar
                        progress={analysisResults.overallScore / 100}
                        color={COLORS.primary}
                        style={styles.scoreProgress}
                      />
                    </Surface>

                    {/* Breakdown */}
                    <Text style={styles.sectionTitle}>📊 Detailed Breakdown</Text>
                    {Object.entries(analysisResults.breakdown).map(([category, score]) => (
                      <View key={category} style={styles.breakdownRow}>
                        <Text style={styles.breakdownLabel}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}:
                        </Text>
                        <ProgressBar
                          progress={score / 100}
                          color={score >= 85 ? COLORS.success : score >= 70 ? COLORS.warning : COLORS.error}
                          style={styles.breakdownProgress}
                        />
                        <Text style={styles.breakdownScore}>{score}%</Text>
                      </View>
                    ))}

                    {/* Key Points */}
                    <Text style={styles.sectionTitle}>🔍 Key Analysis Points</Text>
                    {analysisResults.keyPoints.map((point, index) => (
                      <Surface key={index} style={styles.keyPointCard}>
                        <View style={styles.keyPointHeader}>
                          <View style={styles.keyPointInfo}>
                            <Text style={styles.keyPointPhase}>{point.phase}</Text>
                            <Text style={styles.keyPointScore}>{point.score}%</Text>
                          </View>
                          <Icon
                            name={point.type === 'positive' ? 'check-circle' : 'warning'}
                            size={24}
                            color={getFeedbackColor(point.type)}
                          />
                        </View>
                        <Text style={styles.keyPointFeedback}>{point.feedback}</Text>
                        {point.suggestion && (
                          <Text style={styles.keyPointSuggestion}>💡 {point.suggestion}</Text>
                        )}
                      </Surface>
                    ))}

                    {/* Biomechanics */}
                    <Text style={styles.sectionTitle}>⚙️ Biomechanics</Text>
                    <Surface style={styles.biomechanicsCard}>
                      <Text style={styles.biomechanicsTitle}>Joint Angles Analysis</Text>
                      {analysisResults.biomechanics.jointAngles.map((joint, index) => (
                        <View key={index} style={styles.jointRow}>
                          <Text style={styles.jointName}>{joint.joint}:</Text>
                          <Text style={styles.jointAngle}>{joint.angle}°</Text>
                          <Text style={styles.jointOptimal}>(optimal: {joint.optimal}°)</Text>
                          <Chip
                            mode="flat"
                            compact
                            style={[
                              styles.jointStatus,
                              { backgroundColor: 
                                joint.status === 'excellent' ? COLORS.success :
                                joint.status === 'good' ? COLORS.primary :
                                joint.status === 'needs_improvement' ? COLORS.warning : COLORS.error
                              }
                            ]}
                          >
                            {joint.status.replace('_', ' ')}
                          </Chip>
                        </View>
                      ))}
                      
                      <Divider style={styles.biomechanicsDivider} />
                      
                      <View style={styles.metricsRow}>
                        <View style={styles.metric}>
                          <Text style={styles.metricLabel}>Rep Tempo</Text>
                          <Text style={styles.metricValue}>{analysisResults.biomechanics.repTempo}</Text>
                        </View>
                        <View style={styles.metric}>
                          <Text style={styles.metricLabel}>Range of Motion</Text>
                          <Text style={styles.metricValue}>{analysisResults.biomechanics.rangeOfMotion}</Text>
                        </View>
                        <View style={styles.metric}>
                          <Text style={styles.metricLabel}>Load Distribution</Text>
                          <Text style={styles.metricValue}>{analysisResults.biomechanics.loadDistribution}</Text>
                        </View>
                      </View>
                    </Surface>

                    {/* Recommendations */}
                    <Text style={styles.sectionTitle}>💪 Improvement Recommendations</Text>
                    {analysisResults.recommendations.map((recommendation, index) => (
                      <Surface key={index} style={styles.recommendationCard}>
                        <View style={styles.recommendationRow}>
                          <Icon name="lightbulb" size={20} color={COLORS.warning} />
                          <Text style={styles.recommendationText}>{recommendation}</Text>
                        </View>
                      </Surface>
                    ))}

                    {/* Comparison */}
                    <Text style={styles.sectionTitle}>📈 Performance Comparison</Text>
                    <Surface style={styles.comparisonCard}>
                      <View style={styles.comparisonRow}>
                        <Text style={styles.comparisonLabel}>Client Score:</Text>
                        <ProgressBar
                          progress={analysisResults.comparisonData.clientAverage / 100}
                          color={COLORS.primary}
                          style={styles.comparisonProgress}
                        />
                        <Text style={styles.comparisonValue}>{analysisResults.comparisonData.clientAverage}%</Text>
                      </View>
                      <View style={styles.comparisonRow}>
                        <Text style={styles.comparisonLabel}>Gym Average:</Text>
                        <ProgressBar
                          progress={analysisResults.comparisonData.gymAverage / 100}
                          color={COLORS.secondary}
                          style={styles.comparisonProgress}
                        />
                        <Text style={styles.comparisonValue}>{analysisResults.comparisonData.gymAverage}%</Text>
                      </View>
                      <View style={styles.comparisonRow}>
                        <Text style={styles.comparisonLabel}>Fitness Level:</Text>
                        <View style={styles.comparisonProgress} />
                        <Text style={styles.comparisonValue}>{analysisResults.comparisonData.traineeLevel}</Text>
                      </View>
                    </Surface>
                  </>
                )}
              </ScrollView>
            </Card.Content>
            <Card.Actions style={styles.resultActions}>
              <Button onPress={() => setShowResultModal(false)}>Close</Button>
              <Button 
                mode="contained" 
                onPress={() => {
                  Alert.alert('Export Report', 'Analysis report exported successfully!');
                  setShowResultModal(false);
                }}
                icon="download"
              >
                Export Report
              </Button>
            </Card.Actions>
          </Card>
        </BlurView>
      </Modal>
    </Portal>
  );

  // Tab content renderer
  const renderTabContent = () => {
    switch (activeTab) {
      case 'upload':
        return renderUploadSection();
      case 'history':
        return (
          <FlatList
            data={analysisHistory}
            renderItem={renderHistoryItem}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.historyList}
            showsVerticalScrollIndicator={false}
          />
        );
      case 'progress':
        return (
          <View style={styles.progressSection}>
            <Text style={styles.sectionTitle}>📈 Progress Tracking</Text>
            <Card style={styles.progressCard}>
              <Card.Content>
                <Text style={styles.progressTitle}>Overall Improvement</Text>
                <View style={styles.progressStats}>
                  <View style={styles.progressStat}>
                    <Text style={styles.progressNumber}>+12%</Text>
                    <Text style={styles.progressLabel}>This Month</Text>
                  </View>
                  <View style={styles.progressStat}>
                    <Text style={styles.progressNumber}>85</Text>
                    <Text style={styles.progressLabel}>Avg Score</Text>
                  </View>
                  <View style={styles.progressStat}>
                    <Text style={styles.progressNumber}>23</Text>
                    <Text style={styles.progressLabel}>Analyses</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
            
            <Surface style={styles.comingSoonCard}>
              <Icon name="construction" size={48} color={COLORS.textSecondary} />
              <Text style={styles.comingSoonText}>Detailed progress charts coming soon!</Text>
            </Surface>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View 
          style={[
            styles.headerContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.headerTitle}>🎥 Exercise Form Analysis</Text>
          <Text style={styles.headerSubtitle}>AI-powered form analysis and technique feedback for fitness training</Text>
        </Animated.View>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search analyses, clients, exercises..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={COLORS.primary}
          inputStyle={styles.searchInput}
        />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upload' && styles.activeTab]}
          onPress={() => setActiveTab('upload')}
        >
          <Icon name="cloud-upload" size={20} color={activeTab === 'upload' ? COLORS.white : COLORS.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'upload' && styles.activeTabText]}>Upload</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <Icon name="history" size={20} color={activeTab === 'history' ? COLORS.white : COLORS.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'progress' && styles.activeTab]}
          onPress={() => setActiveTab('progress')}
        >
          <Icon name="trending-up" size={20} color={activeTab === 'progress' ? COLORS.white : COLORS.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'progress' && styles.activeTabText]}>Progress</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          {analyzing && (
            <Surface style={styles.analyzingOverlay}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.analyzingText}>Analyzing movement patterns...</Text>
              <Text style={styles.analyzingSubtext}>This may take a few moments</Text>
            </Surface>
          )}
          
          {renderTabContent()}
        </Animated.View>
      </View>

      {renderAnalysisModal()}

      {/* FAB */}
      <FAB
        style={styles.fab}
        icon="video-call"
        label="Live Form Check"
        onPress={() => Alert.alert('Live Form Check', 'Real-time form analysis feature coming soon!')}
        color={COLORS.white}
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
    paddingTop: StatusBar.currentHeight + SPACING.xl,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.white,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchBar: {
    elevation: 0,
    backgroundColor: COLORS.lightGray,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    elevation: 2,
    shadowColor: COLORS.black,
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
    backgroundColor: COLORS.primary,
  },
  tabText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  analyzingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    elevation: 10,
  },
  analyzingText: {
    ...TEXT_STYLES.h4,
    marginTop: SPACING.lg,
    textAlign: 'center',
  },
  analyzingSubtext: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  uploadSection: {
    flex: 1,
  },
  uploadCard: {
    borderRadius: 12,
    marginBottom: SPACING.lg,
    elevation: 4,
  },
  uploadArea: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  uploadGradient: {
    padding: SPACING.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  uploadText: {
    ...TEXT_STYLES.h4,
    color: COLORS.white,
    marginTop: SPACING.md,
    fontWeight: 'bold',
  },
  uploadSubtext: {
    ...TEXT_STYLES.body,
    color: COLORS.white,
    opacity: 0.8,
    marginTop: SPACING.xs,
  },
  selectionCard: {
    borderRadius: 12,
    elevation: 2,
  },
  selectionTitle: {
    ...TEXT_STYLES.h4,
    fontWeight: 'bold',
    marginBottom: SPACING.lg,
  },
  selectionRow: {
    marginBottom: SPACING.lg,
  },
  selectionLabel: {
    ...TEXT_STYLES.subtitle,
    marginBottom: SPACING.sm,
    fontWeight: '600',
  },
  selectionButton: {
    borderRadius: 8,
    borderColor: COLORS.primary,
  },
  selectionButtonContent: {
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  analyzeButton: {
    marginTop: SPACING.md,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },
  historyList: {
    paddingBottom: SPACING.xl,
  },
  historyCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    elevation: 2,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  historyInfo: {
    flex: 1,
  },
  historyPlayer: {
    ...TEXT_STYLES.subtitle,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  historyDetails: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  historyDate: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  historyRight: {
    alignItems: 'center',
  },
  thumbnail: {
    width: 60,
    height: 40,
    borderRadius: 6,
    marginBottom: SPACING.xs,
  },
  statusBadge: {
    alignSelf: 'center',
  },
  historyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  issuesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  issueChip: {
    marginRight: SPACING.xs,
    backgroundColor: COLORS.error + '20',
    borderColor: COLORS.error,
  },
  moreIssues: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  improvements: {
    ...TEXT_STYLES.caption,
    color: COLORS.success,
    fontWeight: '600',
  },
  progressSection: {
    flex: 1,
  },
  progressCard: {
    borderRadius: 12,
    elevation: 2,
    marginBottom: SPACING.lg,
  },
  progressTitle: {
    ...TEXT_STYLES.h4,
    fontWeight: 'bold',
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressStat: {
    alignItems: 'center',
  },
  progressNumber: {
    ...TEXT_STYLES.h2,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  progressLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  comingSoonCard: {
    padding: SPACING.xl,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 1,
  },
  comingSoonText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  resultCard: {
    width: width * 0.95,
    maxHeight: height * 0.9,
    borderRadius: 16,
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
  },
  resultScroll: {
    maxHeight: height * 0.7,
  },
  sectionTitle: {
    ...TEXT_STYLES.h4,
    fontWeight: 'bold',
    marginVertical: SPACING.lg,
    color: COLORS.textPrimary,
  },
  scoreSection: {
    padding: SPACING.lg,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    marginBottom: SPACING.lg,
  },
  scoreTitle: {
    ...TEXT_STYLES.subtitle,
    marginBottom: SPACING.md,
    fontWeight: '600',
  },
  scoreDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING.md,
  },
  scoreNumber: {
    ...TEXT_STYLES.h1,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  scoreUnit: {
    ...TEXT_STYLES.h3,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  scoreProgress: {
    width: '100%',
    height: 8,
    borderRadius: 4,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  breakdownLabel: {
    ...TEXT_STYLES.body,
    width: 80,
    fontWeight: '600',
  },
  breakdownProgress: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    marginHorizontal: SPACING.md,
  },
  breakdownScore: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    width: 40,
    textAlign: 'right',
  },
  keyPointCard: {
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.md,
    elevation: 1,
  },
  keyPointHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  keyPointInfo: {
    flex: 1,
  },
  keyPointPhase: {
    ...TEXT_STYLES.subtitle,
    fontWeight: 'bold',
  },
  keyPointScore: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    fontWeight: '600',
  },
  keyPointFeedback: {
    ...TEXT_STYLES.body,
    marginBottom: SPACING.sm,
  },
  keyPointSuggestion: {
    ...TEXT_STYLES.body,
    color: COLORS.warning,
    fontStyle: 'italic',
    backgroundColor: COLORS.warning + '10',
    padding: SPACING.sm,
    borderRadius: 6,
  },
  biomechanicsCard: {
    padding: SPACING.md,
    borderRadius: 8,
    elevation: 1,
    marginBottom: SPACING.lg,
  },
  biomechanicsTitle: {
    ...TEXT_STYLES.subtitle,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
  },
  jointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  jointName: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    width: 70,
  },
  jointAngle: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    fontWeight: 'bold',
    width: 40,
  },
  jointOptimal: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    flex: 1,
    marginLeft: SPACING.sm,
  },
  jointStatus: {
    alignSelf: 'flex-end',
  },
  biomechanicsDivider: {
    marginVertical: SPACING.md,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metric: {
    alignItems: 'center',
  },
  metricLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  metricValue: {
    ...TEXT_STYLES.subtitle,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  recommendationCard: {
    padding: SPACING.md,
    borderRadius: 8,
    backgroundColor: COLORS.info + '10',
    marginBottom: SPACING.sm,
    elevation: 1,
  },
  recommendationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  recommendationText: {
    ...TEXT_STYLES.body,
    flex: 1,
    marginLeft: SPACING.sm,
  },
  comparisonCard: {
    padding: SPACING.md,
    borderRadius: 8,
    elevation: 1,
    marginBottom: SPACING.lg,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  comparisonLabel: {
    ...TEXT_STYLES.body,
    width: 100,
    fontWeight: '600',
  },
  comparisonProgress: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    marginHorizontal: SPACING.md,
  },
  comparisonValue: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    width: 40,
    textAlign: 'right',
  },
  resultActions: {
    justifyContent: 'space-between',
    paddingTop: SPACING.md,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.error,
  },
});

export default FormAnalysis;