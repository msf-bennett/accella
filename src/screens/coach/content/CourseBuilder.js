import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  Alert,
  Animated,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Vibration,
} from 'react-native';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
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
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your design system constants
import { COLORS } from '../../../styles/colors';
import { SPACING } from '../../../styles/spacing';
import { TEXT_STYLES } from '../../../styles/textStyles';
import { TYPOGRAPHY } from '../../../styles/typography';
import { LAYOUT } from '../../../styles/layout';

const CourseBuilder = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { courses, loading } = useSelector(state => state.courses);
  
  // Animation references
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    sport: '',
    ageGroup: '',
    duration: '12', // weeks
    difficulty: 'beginner',
    sessions: [],
    objectives: [],
    equipment: [],
    tags: []
  });
  const [newSession, setNewSession] = useState({
    title: '',
    description: '',
    duration: '60', // minutes
    exercises: [],
    notes: ''
  });

  // Course templates for different sports
  const courseTemplates = [
    {
      id: 1,
      title: 'Football Fundamentals',
      sport: '⚽ Football',
      duration: '8 weeks',
      sessions: 24,
      difficulty: 'Beginner',
      color: '#4CAF50'
    },
    {
      id: 2,
      title: 'Basketball Skills',
      sport: '🏀 Basketball',
      duration: '10 weeks',
      sessions: 30,
      difficulty: 'Intermediate',
      color: '#FF9800'
    },
    {
      id: 3,
      title: 'Athletic Conditioning',
      sport: '🏃 Fitness',
      duration: '12 weeks',
      sessions: 36,
      difficulty: 'Advanced',
      color: '#9C27B0'
    }
  ];

  const difficultyLevels = ['Beginner', 'Intermediate', 'Advanced', 'Elite'];
  const ageGroups = ['Under 10', '10-14', '15-18', 'Adult', 'Senior'];
  const sportsCategories = ['Football', 'Basketball', 'Tennis', 'Swimming', 'Athletics', 'Fitness'];

  useEffect(() => {
    // Entrance animations
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
    ]).start();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // dispatch(fetchCourses());
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh courses');
    }
    setRefreshing(false);
  }, []);

  const handleCreateCourse = () => {
    Vibration.vibrate(50);
    setShowModal(true);
    setCurrentStep(1);
    setCourseData({
      title: '',
      description: '',
      sport: '',
      ageGroup: '',
      duration: '12',
      difficulty: 'beginner',
      sessions: [],
      objectives: [],
      equipment: [],
      tags: []
    });
  };

  const handleSaveCourse = async () => {
    if (!courseData.title.trim() || !courseData.sport || !courseData.ageGroup) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    try {
      Vibration.vibrate(100);
      // dispatch(createCourse(courseData));
      Alert.alert(
        'Course Created! 🎉',
        `Your "${courseData.title}" course has been saved successfully.`,
        [
          {
            text: 'View Course',
            onPress: () => {
              setShowModal(false);
              // navigation.navigate('CourseDetails', { courseId: newCourseId });
            }
          },
          {
            text: 'Create Another',
            onPress: () => setCurrentStep(1)
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create course. Please try again.');
    }
  };

  const addSession = () => {
    if (!newSession.title.trim()) return;
    
    const session = {
      id: Date.now(),
      ...newSession,
      week: Math.ceil(courseData.sessions.length / 3) + 1,
      sessionNumber: courseData.sessions.length + 1
    };
    
    setCourseData(prev => ({
      ...prev,
      sessions: [...prev.sessions, session]
    }));
    
    setNewSession({
      title: '',
      description: '',
      duration: '60',
      exercises: [],
      notes: ''
    });
    
    Vibration.vibrate(50);
  };

  const removeSession = (sessionId) => {
    setCourseData(prev => ({
      ...prev,
      sessions: prev.sessions.filter(s => s.id !== sessionId)
    }));
  };

  const renderStepIndicator = () => {
    const steps = ['Basic Info', 'Content', 'Review'];
    return (
      <View style={styles.stepIndicator}>
        {steps.map((step, index) => (
          <View key={index} style={styles.stepItem}>
            <View style={[
              styles.stepCircle,
              { backgroundColor: currentStep > index ? COLORS.primary : COLORS.background }
            ]}>
              <Text style={[styles.stepNumber, { color: currentStep > index ? '#fff' : COLORS.text }]}>
                {index + 1}
              </Text>
            </View>
            <Text style={styles.stepLabel}>{step}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderBasicInfo = () => (
    <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.modalTitle}>Course Information 📚</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Course Title *</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g., Advanced Football Training"
          value={courseData.title}
          onChangeText={(text) => setCourseData(prev => ({ ...prev, title: text }))}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Description</Text>
        <TextInput
          style={[styles.textInput, styles.multilineInput]}
          placeholder="Describe what this course covers..."
          value={courseData.description}
          onChangeText={(text) => setCourseData(prev => ({ ...prev, description: text }))}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Sport *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
          {sportsCategories.map((sport) => (
            <Chip
              key={sport}
              mode={courseData.sport === sport ? 'flat' : 'outlined'}
              selected={courseData.sport === sport}
              onPress={() => setCourseData(prev => ({ ...prev, sport }))}
              style={[styles.chip, { backgroundColor: courseData.sport === sport ? COLORS.primary : 'transparent' }]}
              textStyle={{ color: courseData.sport === sport ? '#fff' : COLORS.text }}
            >
              {sport}
            </Chip>
          ))}
        </ScrollView>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Age Group *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
          {ageGroups.map((age) => (
            <Chip
              key={age}
              mode={courseData.ageGroup === age ? 'flat' : 'outlined'}
              selected={courseData.ageGroup === age}
              onPress={() => setCourseData(prev => ({ ...prev, ageGroup: age }))}
              style={[styles.chip, { backgroundColor: courseData.ageGroup === age ? COLORS.primary : 'transparent' }]}
              textStyle={{ color: courseData.ageGroup === age ? '#fff' : COLORS.text }}
            >
              {age}
            </Chip>
          ))}
        </ScrollView>
      </View>

      <View style={styles.row}>
        <View style={styles.halfInput}>
          <Text style={styles.inputLabel}>Duration (weeks)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="12"
            value={courseData.duration}
            onChangeText={(text) => setCourseData(prev => ({ ...prev, duration: text }))}
            keyboardType="numeric"
          />
        </View>
        
        <View style={styles.halfInput}>
          <Text style={styles.inputLabel}>Difficulty</Text>
          <TouchableOpacity 
            style={styles.textInput}
            onPress={() => {
              // Show difficulty picker
              Alert.alert(
                'Select Difficulty',
                '',
                difficultyLevels.map(level => ({
                  text: level,
                  onPress: () => setCourseData(prev => ({ ...prev, difficulty: level.toLowerCase() }))
                }))
              );
            }}
          >
            <Text style={styles.pickerText}>
              {courseData.difficulty.charAt(0).toUpperCase() + courseData.difficulty.slice(1)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Button
        mode="contained"
        onPress={() => setCurrentStep(2)}
        style={styles.nextButton}
        contentStyle={styles.buttonContent}
      >
        Next: Add Content →
      </Button>
    </ScrollView>
  );

  const renderContentBuilder = () => (
    <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.modalTitle}>Course Content 🏋️‍♂️</Text>
      
      <Card style={styles.sessionCard}>
        <Card.Content>
          <Text style={styles.cardTitle}>Add Training Session</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Session Title</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., Dribbling Techniques"
              value={newSession.title}
              onChangeText={(text) => setNewSession(prev => ({ ...prev, title: text }))}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.textInput, styles.multilineInput]}
              placeholder="What will be covered in this session?"
              value={newSession.description}
              onChangeText={(text) => setNewSession(prev => ({ ...prev, description: text }))}
              multiline
              numberOfLines={2}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Duration (minutes)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="60"
              value={newSession.duration}
              onChangeText={(text) => setNewSession(prev => ({ ...prev, duration: text }))}
              keyboardType="numeric"
            />
          </View>

          <Button
            mode="contained"
            onPress={addSession}
            style={styles.addButton}
            icon="plus"
            compact
          >
            Add Session
          </Button>
        </Card.Content>
      </Card>

      {courseData.sessions.length > 0 && (
        <View style={styles.sessionsContainer}>
          <Text style={styles.sectionTitle}>
            Sessions ({courseData.sessions.length}) 📋
          </Text>
          
          {courseData.sessions.map((session, index) => (
            <Card key={session.id} style={styles.sessionItem}>
              <Card.Content style={styles.sessionContent}>
                <View style={styles.sessionHeader}>
                  <View style={styles.sessionInfo}>
                    <Text style={styles.sessionTitle}>
                      {index + 1}. {session.title}
                    </Text>
                    <Text style={styles.sessionMeta}>
                      Week {session.week} • {session.duration} min
                    </Text>
                  </View>
                  <IconButton
                    icon="delete"
                    size={20}
                    onPress={() => removeSession(session.id)}
                  />
                </View>
                {session.description && (
                  <Text style={styles.sessionDescription}>{session.description}</Text>
                )}
              </Card.Content>
            </Card>
          ))}
        </View>
      )}

      <View style={styles.buttonRow}>
        <Button
          mode="outlined"
          onPress={() => setCurrentStep(1)}
          style={styles.backButton}
        >
          ← Back
        </Button>
        <Button
          mode="contained"
          onPress={() => setCurrentStep(3)}
          style={styles.nextButton}
          disabled={courseData.sessions.length === 0}
        >
          Review →
        </Button>
      </View>
    </ScrollView>
  );

  const renderReview = () => (
    <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.modalTitle}>Review Course 👀</Text>
      
      <Card style={styles.reviewCard}>
        <Card.Content>
          <Text style={styles.reviewTitle}>{courseData.title}</Text>
          <Text style={styles.reviewMeta}>
            {courseData.sport} • {courseData.ageGroup} • {courseData.difficulty}
          </Text>
          <Text style={styles.reviewDescription}>{courseData.description}</Text>
          
          <View style={styles.reviewStats}>
            <View style={styles.statItem}>
              <Icon name="schedule" size={20} color={COLORS.primary} />
              <Text style={styles.statText}>{courseData.duration} weeks</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="fitness-center" size={20} color={COLORS.primary} />
              <Text style={styles.statText}>{courseData.sessions.length} sessions</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Text style={styles.sectionTitle}>Sessions Overview 📚</Text>
      {courseData.sessions.map((session, index) => (
        <Surface key={session.id} style={styles.reviewSession}>
          <Text style={styles.reviewSessionTitle}>
            {index + 1}. {session.title}
          </Text>
          <Text style={styles.reviewSessionMeta}>
            Week {session.week} • {session.duration} minutes
          </Text>
        </Surface>
      ))}

      <View style={styles.buttonRow}>
        <Button
          mode="outlined"
          onPress={() => setCurrentStep(2)}
          style={styles.backButton}
        >
          ← Back
        </Button>
        <Button
          mode="contained"
          onPress={handleSaveCourse}
          style={styles.saveButton}
          icon="check"
        >
          Create Course 🚀
        </Button>
      </View>
    </ScrollView>
  );

  const renderCourseTemplate = (template) => (
    <Card key={template.id} style={styles.templateCard}>
      <Card.Content>
        <View style={styles.templateHeader}>
          <View>
            <Text style={styles.templateTitle}>{template.title}</Text>
            <Text style={styles.templateSport}>{template.sport}</Text>
          </View>
          <Chip
            mode="flat"
            style={[styles.difficultyChip, { backgroundColor: template.color }]}
            textStyle={{ color: '#fff', fontSize: 12 }}
          >
            {template.difficulty}
          </Chip>
        </View>
        
        <View style={styles.templateStats}>
          <View style={styles.templateStat}>
            <Icon name="schedule" size={16} color={COLORS.textSecondary} />
            <Text style={styles.templateStatText}>{template.duration}</Text>
          </View>
          <View style={styles.templateStat}>
            <Icon name="fitness-center" size={16} color={COLORS.textSecondary} />
            <Text style={styles.templateStatText}>{template.sessions} sessions</Text>
          </View>
        </View>

        <Button
          mode="outlined"
          onPress={() => {
            Alert.alert(
              'Use Template',
              `Create a new course based on "${template.title}"?`,
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Use Template', 
                  onPress: () => {
                    // Pre-populate course data with template
                    setCourseData(prev => ({
                      ...prev,
                      title: template.title,
                      sport: template.sport.split(' ')[1],
                      difficulty: template.difficulty.toLowerCase(),
                      duration: template.duration.split(' ')[0]
                    }));
                    handleCreateCourse();
                  }
                }
              ]
            );
          }}
          style={styles.useTemplateButton}
          compact
        >
          Use Template
        </Button>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Course Builder</Text>
          <TouchableOpacity onPress={() => Alert.alert('Feature Coming Soon', 'AI Course Generator will be available soon!')}>
            <Icon name="auto-awesome" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.quickStats}>
            <Surface style={styles.statCard}>
              <Icon name="school" size={24} color={COLORS.primary} />
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Courses Created</Text>
            </Surface>
            <Surface style={styles.statCard}>
              <Icon name="people" size={24} color={COLORS.success} />
              <Text style={styles.statNumber}>84</Text>
              <Text style={styles.statLabel}>Active Students</Text>
            </Surface>
            <Surface style={styles.statCard}>
              <Icon name="trending-up" size={24} color={COLORS.warning} />
              <Text style={styles.statNumber}>96%</Text>
              <Text style={styles.statLabel}>Completion Rate</Text>
            </Surface>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Start Templates 🚀</Text>
            <Text style={styles.sectionSubtitle}>
              Get started with proven course structures
            </Text>
            
            {courseTemplates.map(renderCourseTemplate)}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Courses 📚</Text>
            
            <Card style={styles.courseCard}>
              <Card.Content>
                <View style={styles.courseHeader}>
                  <Avatar.Icon
                    size={40}
                    icon="school"
                    style={{ backgroundColor: COLORS.primary }}
                  />
                  <View style={styles.courseInfo}>
                    <Text style={styles.courseTitle}>Youth Football Basics</Text>
                    <Text style={styles.courseMeta}>8 weeks • 24 sessions</Text>
                  </View>
                  <Chip mode="outlined" compact>Draft</Chip>
                </View>
                
                <ProgressBar
                  progress={0.6}
                  color={COLORS.primary}
                  style={styles.progressBar}
                />
                <Text style={styles.progressText}>60% Complete</Text>
              </Card.Content>
            </Card>

            <Card style={styles.courseCard}>
              <Card.Content>
                <View style={styles.courseHeader}>
                  <Avatar.Icon
                    size={40}
                    icon="fitness-center"
                    style={{ backgroundColor: COLORS.success }}
                  />
                  <View style={styles.courseInfo}>
                    <Text style={styles.courseTitle}>Strength & Conditioning</Text>
                    <Text style={styles.courseMeta}>12 weeks • 36 sessions</Text>
                  </View>
                  <Chip mode="flat" style={{ backgroundColor: COLORS.success }} textStyle={{ color: '#fff' }} compact>
                    Live
                  </Chip>
                </View>
                
                <ProgressBar
                  progress={1.0}
                  color={COLORS.success}
                  style={styles.progressBar}
                />
                <Text style={styles.progressText}>Published • 23 enrolled</Text>
              </Card.Content>
            </Card>
          </View>
        </ScrollView>
      </Animated.View>

      <Portal>
        <Modal
          visible={showModal}
          onDismiss={() => setShowModal(false)}
          contentContainerStyle={styles.modal}
        >
          <BlurView style={styles.blurOverlay} blurType="light" blurAmount={10}>
            <View style={styles.modalContainer}>
              {renderStepIndicator()}
              
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoid}
              >
                {currentStep === 1 && renderBasicInfo()}
                {currentStep === 2 && renderContentBuilder()}
                {currentStep === 3 && renderReview()}
              </KeyboardAvoidingView>
              
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowModal(false)}
              >
                <Icon name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
          </BlurView>
        </Modal>
      </Portal>

      <FAB
        style={styles.fab}
        icon="add"
        onPress={handleCreateCourse}
        label="New Course"
      />
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: '#fff',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: SPACING.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.md,
    marginHorizontal: SPACING.xs,
    borderRadius: 12,
    elevation: 2,
  },
  statNumber: {
    ...TEXT_STYLES.h2,
    fontWeight: 'bold',
    marginVertical: SPACING.xs,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    color: COLORS.textSecondary,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  sectionSubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  templateCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    elevation: 2,
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  templateTitle: {
    ...TEXT_STYLES.h4,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  templateSport: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
  },
  difficultyChip: {
    alignSelf: 'flex-start',
  },
  templateStats: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  templateStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  templateStatText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    color: COLORS.textSecondary,
  },
  useTemplateButton: {
    alignSelf: 'flex-start',
  },
  courseCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    elevation: 2,
  },
  courseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  courseInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  courseTitle: {
    ...TEXT_STYLES.h4,
    fontWeight: 'bold',
  },
  courseMeta: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: SPACING.xs,
  },
  progressText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  modal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    elevation: 10,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  stepItem: {
    alignItems: 'center',
    marginHorizontal: SPACING.md,
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  stepNumber: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
  },
  stepLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  modalContent: {
    flex: 1,
    padding: SPACING.lg,
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: SPACING.xs,
    color: COLORS.text,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  chipContainer: {
    flexDirection: 'row',
    paddingVertical: SPACING.xs,
  },
  chip: {
    marginRight: SPACING.sm,
    marginVertical: SPACING.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 0.48,
  },
  pickerText: {
    fontSize: 16,
    color: COLORS.text,
  },
  nextButton: {
    marginTop: SPACING.xl,
    backgroundColor: COLORS.primary,
  },
  buttonContent: {
    paddingVertical: SPACING.xs,
  },
  sessionCard: {
    marginBottom: SPACING.lg,
    borderRadius: 12,
    elevation: 2,
  },
  cardTitle: {
    ...TEXT_STYLES.h4,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
  },
  addButton: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.primary,
  },
  sessionsContainer: {
    marginTop: SPACING.lg,
  },
  sessionItem: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    elevation: 1,
  },
  sessionContent: {
    paddingVertical: SPACING.sm,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  sessionMeta: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  sessionDescription: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    fontStyle: 'italic',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xl,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  backButton: {
    flex: 0.3,
    borderColor: COLORS.primary,
  },
  saveButton: {
    flex: 0.65,
    backgroundColor: COLORS.success,
  },
  reviewCard: {
    marginBottom: SPACING.lg,
    borderRadius: 12,
    elevation: 2,
  },
  reviewTitle: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  reviewMeta: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  reviewDescription: {
    ...TEXT_STYLES.body,
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  reviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  reviewSession: {
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: 8,
    elevation: 1,
  },
  reviewSessionTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  reviewSessionMeta: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  closeButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
  },
  keyboardAvoid: {
    flex: 1,
  },
};

export default CourseBuilder;