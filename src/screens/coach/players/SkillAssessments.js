import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Alert,
  StatusBar,
  Animated,
  Dimensions,
  TouchableOpacity,
  Platform,
  Vibration,
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  ProgressBar,
  Avatar,
  IconButton,
  Surface,
  Searchbar,
  FAB,
  Portal,
  Modal,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  accent: '#FF6B35',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subheader: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  body: {
    fontSize: 14,
    color: COLORS.text,
  },
  caption: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
};

const { width, height } = Dimensions.get('window');

const SkillAssessment = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, assessments, isLoading } = useSelector(state => ({
    user: state.auth.user,
    assessments: state.player.assessments || {},
    isLoading: state.player.isLoading || false,
  }));

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [assessmentAnswers, setAssessmentAnswers] = useState({});
  const [assessmentStarted, setAssessmentStarted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [assessmentResults, setAssessmentResults] = useState(null);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Timer ref
  const timerRef = useRef(null);

  // Mock assessment data
  const mockAssessments = [
    {
      id: 1,
      title: 'Football Technical Skills',
      category: 'football',
      description: 'Test your dribbling, passing, and shooting techniques',
      duration: '15 min',
      difficulty: 'Intermediate',
      questions: 12,
      icon: 'sports-soccer',
      color: COLORS.primary,
      lastTaken: '2024-01-10',
      bestScore: 85,
      attempts: 3,
      questions: [
        {
          id: 1,
          type: 'multiple',
          question: 'What is the most effective way to improve ball control?',
          options: ['Daily juggling practice', 'Only match play', 'Strength training', 'Running only'],
          correct: 0,
          explanation: 'Regular juggling practice develops touch, coordination, and ball familiarity.',
        },
        {
          id: 2,
          type: 'video',
          question: 'Watch this technique demonstration. What skill is being shown?',
          videoUrl: 'https://example.com/video1',
          options: ['Step-over', 'Nutmeg', 'Cruyff turn', 'Rabona'],
          correct: 2,
          explanation: 'The Cruyff turn is a deceptive move where you fake a pass or shot.',
        },
        // More questions...
      ],
    },
    {
      id: 2,
      title: 'Basketball Fundamentals',
      category: 'basketball',
      description: 'Assess your shooting, dribbling, and court awareness',
      duration: '12 min',
      difficulty: 'Beginner',
      questions: 10,
      icon: 'sports-basketball',
      color: COLORS.warning,
      lastTaken: null,
      bestScore: null,
      attempts: 0,
    },
    {
      id: 3,
      title: 'Athletic Performance',
      category: 'fitness',
      description: 'Test your speed, agility, and endurance knowledge',
      duration: '20 min',
      difficulty: 'Advanced',
      questions: 15,
      icon: 'fitness-center',
      color: COLORS.success,
      lastTaken: '2024-01-08',
      bestScore: 92,
      attempts: 5,
    },
    {
      id: 4,
      title: 'Mental Toughness',
      category: 'psychology',
      description: 'Evaluate your mental resilience and focus',
      duration: '10 min',
      difficulty: 'Intermediate',
      questions: 8,
      icon: 'psychology',
      color: COLORS.accent,
      lastTaken: '2024-01-12',
      bestScore: 78,
      attempts: 2,
    },
  ];

  const categories = [
    { key: 'all', label: 'All', icon: 'apps' },
    { key: 'football', label: 'Football', icon: 'sports-soccer' },
    { key: 'basketball', label: 'Basketball', icon: 'sports-basketball' },
    { key: 'fitness', label: 'Fitness', icon: 'fitness-center' },
    { key: 'psychology', label: 'Mental', icon: 'psychology' },
  ];

  // Component mount animations
  useEffect(() => {
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
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Timer effect
  useEffect(() => {
    if (assessmentStarted && selectedAssessment) {
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [assessmentStarted, selectedAssessment]);

  // Progress animation
  useEffect(() => {
    if (selectedAssessment && assessmentStarted) {
      const progress = currentQuestion / (selectedAssessment.questions?.length || 1);
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [currentQuestion, selectedAssessment, assessmentStarted]);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      Alert.alert('Assessments Updated! 📚', 'Latest skill tests are now available.');
    } catch (error) {
      Alert.alert('Update Error', 'Unable to refresh assessments.');
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Start assessment
  const startAssessment = (assessment) => {
    setSelectedAssessment(assessment);
    setCurrentQuestion(0);
    setAssessmentAnswers({});
    setTimer(0);
    setShowAssessmentModal(true);
    setAssessmentStarted(true);
    setShowResults(false);
    Vibration.vibrate(50);
  };

  // Answer question
  const answerQuestion = (answerIndex) => {
    if (!selectedAssessment || !selectedAssessment.questions) return;

    const newAnswers = {
      ...assessmentAnswers,
      [currentQuestion]: answerIndex,
    };
    setAssessmentAnswers(newAnswers);

    // Move to next question or finish
    if (currentQuestion < selectedAssessment.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      Vibration.vibrate(30);
    } else {
      finishAssessment(newAnswers);
    }
  };

  // Finish assessment
  const finishAssessment = (answers) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Calculate results
    let correctAnswers = 0;
    if (selectedAssessment.questions) {
      selectedAssessment.questions.forEach((question, index) => {
        if (answers[index] === question.correct) {
          correctAnswers++;
        }
      });
    }

    const score = Math.round((correctAnswers / (selectedAssessment.questions?.length || 1)) * 100);
    const results = {
      score,
      correctAnswers,
      totalQuestions: selectedAssessment.questions?.length || 0,
      timeSpent: timer,
      performance: score >= 90 ? 'Excellent' : score >= 80 ? 'Good' : score >= 70 ? 'Fair' : 'Needs Improvement',
      recommendations: generateRecommendations(score),
    };

    setAssessmentResults(results);
    setShowResults(true);
    setAssessmentStarted(false);
    Vibration.vibrate([100, 50, 100]);
  };

  // Generate recommendations
  const generateRecommendations = (score) => {
    if (score >= 90) {
      return ['🏆 Outstanding performance!', '✅ Consider advanced training modules', '🎯 Mentor other players'];
    } else if (score >= 80) {
      return ['💪 Great job! Room for improvement', '📚 Review missed concepts', '🔄 Practice regularly'];
    } else if (score >= 70) {
      return ['📖 Focus on fundamentals', '🎥 Watch tutorial videos', '💡 Seek coach guidance'];
    } else {
      return ['🎯 Need more practice', '📚 Study basic concepts', '👨‍🏫 Consider extra coaching'];
    }
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Filter assessments
  const filteredAssessments = mockAssessments.filter(assessment => {
    const matchesCategory = activeCategory === 'all' || assessment.category === activeCategory;
    const matchesSearch = assessment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         assessment.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Render header
  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={{
        paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 20,
        paddingBottom: SPACING.lg,
        paddingHorizontal: SPACING.md,
      }}
    >
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Text style={[TEXT_STYLES.header, { color: 'white', marginBottom: SPACING.xs }]}>
              Skill Assessment 🧠
            </Text>
            <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.9)' }]}>
              Test your abilities, track your progress
            </Text>
          </View>
          <Surface style={{ borderRadius: 25, elevation: 4 }}>
            <IconButton
              icon="psychology"
              iconColor={COLORS.primary}
              size={24}
              onPress={() => Alert.alert('AI Coach', 'Personalized assessment recommendations coming soon! 🤖')}
            />
          </Surface>
        </View>

        <Searchbar
          placeholder="Search assessments..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={{
            marginTop: SPACING.md,
            backgroundColor: 'rgba(255,255,255,0.95)',
          }}
          inputStyle={{ fontSize: 14 }}
          iconColor={COLORS.primary}
        />
      </Animated.View>
    </LinearGradient>
  );

  // Render category filters
  const renderCategoryFilters = () => (
    <View style={{ paddingVertical: SPACING.md }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: SPACING.md }}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.key}
            onPress={() => setActiveCategory(category.key)}
            style={{
              marginRight: SPACING.md,
              paddingHorizontal: SPACING.md,
              paddingVertical: SPACING.sm,
              borderRadius: 20,
              backgroundColor: activeCategory === category.key ? COLORS.primary : COLORS.surface,
              elevation: activeCategory === category.key ? 4 : 2,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon
                name={category.icon}
                size={16}
                color={activeCategory === category.key ? 'white' : COLORS.textSecondary}
              />
              <Text style={[
                TEXT_STYLES.caption,
                {
                  marginLeft: SPACING.xs,
                  color: activeCategory === category.key ? 'white' : COLORS.textSecondary,
                  fontWeight: activeCategory === category.key ? 'bold' : 'normal',
                }
              ]}>
                {category.label}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // Render assessment card
  const renderAssessmentCard = (assessment) => (
    <Animated.View
      key={assessment.id}
      style={{
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
        margin: SPACING.md,
        marginTop: 0,
      }}
    >
      <Card style={{ elevation: 4 }}>
        <LinearGradient
          colors={[assessment.color, `${assessment.color}CC`]}
          style={{ padding: SPACING.md, borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs }}>
                <Icon name={assessment.icon} size={24} color="white" />
                <Text style={[TEXT_STYLES.subheader, { color: 'white', marginLeft: SPACING.sm }]}>
                  {assessment.title}
                </Text>
              </View>
              <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.9)' }]}>
                {assessment.description}
              </Text>
            </View>
            <Chip
              mode="outlined"
              textStyle={{ color: 'white', fontSize: 10 }}
              style={{ borderColor: 'rgba(255,255,255,0.5)' }}
            >
              {assessment.difficulty}
            </Chip>
          </View>
        </LinearGradient>

        <Card.Content style={{ padding: SPACING.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.md }}>
            <View style={{ alignItems: 'center' }}>
              <Icon name="access-time" size={16} color={COLORS.textSecondary} />
              <Text style={[TEXT_STYLES.caption, { marginTop: SPACING.xs }]}>
                {assessment.duration}
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Icon name="quiz" size={16} color={COLORS.textSecondary} />
              <Text style={[TEXT_STYLES.caption, { marginTop: SPACING.xs }]}>
                {assessment.questions} Questions
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Icon name="trending-up" size={16} color={COLORS.textSecondary} />
              <Text style={[TEXT_STYLES.caption, { marginTop: SPACING.xs }]}>
                Best: {assessment.bestScore || 'N/A'}%
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Icon name="repeat" size={16} color={COLORS.textSecondary} />
              <Text style={[TEXT_STYLES.caption, { marginTop: SPACING.xs }]}>
                {assessment.attempts} Attempts
              </Text>
            </View>
          </View>

          {assessment.lastTaken && (
            <Text style={[TEXT_STYLES.caption, { marginBottom: SPACING.md, textAlign: 'center' }]}>
              Last taken: {assessment.lastTaken}
            </Text>
          )}

          <Button
            mode="contained"
            onPress={() => startAssessment(assessment)}
            buttonColor={assessment.color}
            style={{ borderRadius: 8 }}
            icon="play-arrow"
          >
            {assessment.attempts > 0 ? 'Retake Assessment' : 'Start Assessment'}
          </Button>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  // Render question
  const renderQuestion = () => {
    if (!selectedAssessment || !selectedAssessment.questions) return null;
    
    const question = selectedAssessment.questions[currentQuestion];
    if (!question) return null;

    return (
      <View style={{ flex: 1, padding: SPACING.lg }}>
        {/* Progress and Timer */}
        <View style={{ marginBottom: SPACING.lg }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm }}>
            <Text style={TEXT_STYLES.caption}>
              Question {currentQuestion + 1} of {selectedAssessment.questions.length}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.primary }]}>
              ⏱️ {formatTime(timer)}
            </Text>
          </View>
          <Animated.View
            style={{
              height: 4,
              backgroundColor: COLORS.background,
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <Animated.View
              style={{
                height: '100%',
                backgroundColor: COLORS.primary,
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              }}
            />
          </Animated.View>
        </View>

        {/* Question */}
        <Card style={{ marginBottom: SPACING.lg, elevation: 4 }}>
          <Card.Content style={{ padding: SPACING.lg }}>
            <Text style={[TEXT_STYLES.subheader, { marginBottom: SPACING.md, lineHeight: 24 }]}>
              {question.question}
            </Text>
            
            {question.type === 'video' && (
              <Surface
                style={{
                  height: 200,
                  marginBottom: SPACING.md,
                  borderRadius: 8,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: COLORS.background,
                }}
              >
                <Icon name="play-circle-outline" size={48} color={COLORS.primary} />
                <Text style={[TEXT_STYLES.caption, { marginTop: SPACING.sm }]}>
                  Video demonstration
                </Text>
              </Surface>
            )}
          </Card.Content>
        </Card>

        {/* Options */}
        <ScrollView style={{ flex: 1 }}>
          {question.options?.map((option, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => answerQuestion(index)}
              style={{
                marginBottom: SPACING.md,
              }}
            >
              <Card style={{ elevation: 2 }}>
                <Card.Content style={{
                  padding: SPACING.md,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                  <Surface
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 15,
                      backgroundColor: COLORS.primary,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: SPACING.md,
                    }}
                  >
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>
                      {String.fromCharCode(65 + index)}
                    </Text>
                  </Surface>
                  <Text style={[TEXT_STYLES.body, { flex: 1, lineHeight: 20 }]}>
                    {option}
                  </Text>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  // Render results
  const renderResults = () => {
    if (!assessmentResults) return null;

    return (
      <View style={{ flex: 1, padding: SPACING.lg }}>
        <View style={{ alignItems: 'center', marginBottom: SPACING.xl }}>
          <Surface
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: assessmentResults.score >= 80 ? COLORS.success : 
                              assessmentResults.score >= 70 ? COLORS.warning : COLORS.error,
              elevation: 8,
              marginBottom: SPACING.md,
            }}
          >
            <Text style={{ color: 'white', fontSize: 32, fontWeight: 'bold' }}>
              {assessmentResults.score}%
            </Text>
          </Surface>
          <Text style={[TEXT_STYLES.header, { textAlign: 'center', marginBottom: SPACING.sm }]}>
            {assessmentResults.performance}
          </Text>
          <Text style={[TEXT_STYLES.body, { textAlign: 'center', color: COLORS.textSecondary }]}>
            {assessmentResults.correctAnswers} out of {assessmentResults.totalQuestions} correct
          </Text>
          <Text style={[TEXT_STYLES.caption, { textAlign: 'center', marginTop: SPACING.sm }]}>
            Completed in {formatTime(assessmentResults.timeSpent)}
          </Text>
        </View>

        <Card style={{ marginBottom: SPACING.lg, elevation: 4 }}>
          <Card.Content style={{ padding: SPACING.lg }}>
            <Text style={[TEXT_STYLES.subheader, { marginBottom: SPACING.md }]}>
              📋 Recommendations
            </Text>
            {assessmentResults.recommendations.map((rec, index) => (
              <Text key={index} style={[TEXT_STYLES.body, { marginBottom: SPACING.sm, lineHeight: 20 }]}>
                {rec}
              </Text>
            ))}
          </Card.Content>
        </Card>

        <View style={{ flexDirection: 'row', gap: SPACING.md }}>
          <Button
            mode="outlined"
            onPress={() => setShowAssessmentModal(false)}
            style={{ flex: 1 }}
          >
            Done
          </Button>
          <Button
            mode="contained"
            onPress={() => {
              setShowResults(false);
              setCurrentQuestion(0);
              setAssessmentAnswers({});
              setTimer(0);
              setAssessmentStarted(true);
            }}
            buttonColor={COLORS.primary}
            style={{ flex: 1 }}
            icon="refresh"
          >
            Retake
          </Button>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {renderHeader()}
      {renderCategoryFilters()}
      
      <ScrollView
        style={{ flex: 1 }}
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
        {filteredAssessments.map(renderAssessmentCard)}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="psychology"
        style={{
          position: 'absolute',
          margin: SPACING.md,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.accent,
        }}
        color="white"
        onPress={() => Alert.alert('AI Assessment', 'Personalized skill assessment powered by AI coming soon! 🤖')}
      />

      {/* Assessment Modal */}
      <Portal>
        <Modal
          visible={showAssessmentModal}
          onDismiss={() => !assessmentStarted && setShowAssessmentModal(false)}
          contentContainerStyle={{
            backgroundColor: COLORS.surface,
            margin: SPACING.sm,
            borderRadius: 12,
            flex: 1,
            marginTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 20,
            marginBottom: Platform.OS === 'ios' ? 30 : 20,
          }}
        >
          <View style={{ flex: 1 }}>
            {/* Modal Header */}
            <LinearGradient
              colors={selectedAssessment ? [selectedAssessment.color, `${selectedAssessment.color}CC`] : [COLORS.primary, COLORS.secondary]}
              style={{
                padding: SPACING.md,
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Text style={[TEXT_STYLES.subheader, { color: 'white', flex: 1 }]}>
                {selectedAssessment?.title}
              </Text>
              {!assessmentStarted && (
                <IconButton
                  icon="close"
                  iconColor="white"
                  size={24}
                  onPress={() => setShowAssessmentModal(false)}
                />
              )}
            </LinearGradient>

            {/* Modal Content */}
            {showResults ? renderResults() : renderQuestion()}
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

export default SkillAssessment;