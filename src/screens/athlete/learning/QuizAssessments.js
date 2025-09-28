import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Dimensions,
  Animated,
  Alert,
  Vibration,
} from 'react-native';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
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
  RadioButton,
  Checkbox,
  Divider,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f8f9ff',
  white: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e1e8ed',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold' },
  h2: { fontSize: 24, fontWeight: 'bold' },
  h3: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16 },
  caption: { fontSize: 14 },
  small: { fontSize: 12 },
};

const { width, height } = Dimensions.get('window');

const QuizAssessments = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizResults, setQuizResults] = useState({});
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [completedQuizzes, setCompletedQuizzes] = useState([1, 3]);
  const [quizProgress, setQuizProgress] = useState({});
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

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
    ]).start();
  }, []);

  const quizCategories = [
    { id: 'all', name: 'All', icon: 'quiz', color: COLORS.primary },
    { id: 'knowledge', name: 'Knowledge', icon: 'school', color: '#FF6B6B' },
    { id: 'skills', name: 'Skills', icon: 'sports', color: '#4ECDC4' },
    { id: 'rules', name: 'Rules', icon: 'gavel', color: '#45B7D1' },
    { id: 'nutrition', name: 'Nutrition', icon: 'restaurant', color: '#FFA07A' },
    { id: 'psychology', name: 'Psychology', icon: 'psychology', color: '#98D8C8' },
    { id: 'fitness', name: 'Fitness', icon: 'fitness-center', color: '#DDA0DD' },
  ];

  const quizzes = [
    {
      id: 1,
      title: 'Sports Nutrition Fundamentals',
      description: 'Test your knowledge of proper athletic nutrition and hydration',
      category: 'nutrition',
      difficulty: 'Beginner',
      questions: 15,
      timeLimit: 20,
      passingScore: 80,
      rating: 4.8,
      attempts: 1247,
      completed: true,
      lastScore: 92,
      bestScore: 92,
      icon: 'restaurant',
      color: '#FFA07A',
      tags: ['nutrition', 'hydration', 'performance'],
    },
    {
      id: 2,
      title: 'Mental Toughness Assessment',
      description: 'Evaluate your psychological resilience and mental strength',
      category: 'psychology',
      difficulty: 'Intermediate',
      questions: 25,
      timeLimit: 30,
      passingScore: 75,
      rating: 4.9,
      attempts: 892,
      completed: false,
      lastScore: null,
      bestScore: null,
      icon: 'psychology',
      color: '#98D8C8',
      tags: ['mindset', 'resilience', 'confidence'],
    },
    {
      id: 3,
      title: 'Training Principles Quiz',
      description: 'Master the fundamentals of effective training methodologies',
      category: 'knowledge',
      difficulty: 'Advanced',
      questions: 20,
      timeLimit: 25,
      passingScore: 85,
      rating: 4.7,
      attempts: 654,
      completed: true,
      lastScore: 88,
      bestScore: 95,
      icon: 'school',
      color: '#FF6B6B',
      tags: ['training', 'periodization', 'adaptation'],
    },
    {
      id: 4,
      title: 'Injury Prevention Knowledge',
      description: 'Learn essential injury prevention strategies and techniques',
      category: 'fitness',
      difficulty: 'Intermediate',
      questions: 18,
      timeLimit: 22,
      passingScore: 80,
      rating: 4.6,
      attempts: 756,
      completed: false,
      lastScore: null,
      bestScore: null,
      icon: 'fitness-center',
      color: '#DDA0DD',
      tags: ['injury', 'prevention', 'recovery'],
    },
    {
      id: 5,
      title: 'Football Rules & Regulations',
      description: 'Comprehensive test on official football rules and regulations',
      category: 'rules',
      difficulty: 'Beginner',
      questions: 12,
      timeLimit: 15,
      passingScore: 75,
      rating: 4.5,
      attempts: 1156,
      completed: false,
      lastScore: null,
      bestScore: null,
      icon: 'gavel',
      color: '#45B7D1',
      tags: ['rules', 'football', 'officiating'],
    },
  ];

  const sampleQuestions = [
    {
      id: 1,
      question: "What is the recommended daily water intake for athletes during intense training?",
      type: 'multiple-choice',
      options: [
        "2-3 liters",
        "3-4 liters",
        "4-6 liters",
        "6-8 liters"
      ],
      correctAnswer: 2,
      explanation: "Athletes should consume 4-6 liters of water daily during intense training to maintain proper hydration levels.",
    },
    {
      id: 2,
      question: "Which of the following are key components of mental toughness? (Select all that apply)",
      type: 'multiple-select',
      options: [
        "Confidence",
        "Focus under pressure",
        "Resilience",
        "Physical strength",
        "Emotional control"
      ],
      correctAnswers: [0, 1, 2, 4],
      explanation: "Mental toughness includes confidence, focus under pressure, resilience, and emotional control. Physical strength is important but not a component of mental toughness.",
    },
    {
      id: 3,
      question: "Progressive overload is essential for continuous improvement in training.",
      type: 'true-false',
      correctAnswer: true,
      explanation: "Progressive overload is fundamental to training adaptation. Gradually increasing training demands forces the body to adapt and improve.",
    },
  ];

  const stats = {
    totalQuizzes: quizzes.length,
    completedQuizzes: completedQuizzes.length,
    averageScore: 90,
    totalPoints: 1250,
    rank: 'Advanced',
    streak: 7,
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         quiz.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || quiz.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const startQuiz = (quiz) => {
    Vibration.vibrate(50);
    setActiveQuiz(quiz);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowQuizModal(true);
    
    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleAnswerSelect = (questionId, answer) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < sampleQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      
      // Update progress
      const progress = (currentQuestionIndex + 1) / sampleQuestions.length;
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 500,
        useNativeDriver: false,
      }).start();
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    const totalQuestions = sampleQuestions.length;
    let correctAnswers = 0;
    
    sampleQuestions.forEach(question => {
      const userAnswer = selectedAnswers[question.id];
      if (question.type === 'multiple-choice' || question.type === 'true-false') {
        if (userAnswer === question.correctAnswer) correctAnswers++;
      } else if (question.type === 'multiple-select') {
        if (Array.isArray(userAnswer) && Array.isArray(question.correctAnswers)) {
          if (userAnswer.length === question.correctAnswers.length &&
              userAnswer.every(answer => question.correctAnswers.includes(answer))) {
            correctAnswers++;
          }
        }
      }
    });

    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = score >= activeQuiz.passingScore;
    
    setQuizResults({
      quiz: activeQuiz,
      score,
      correctAnswers,
      totalQuestions,
      passed,
      timeSpent: '12:34', // Mock time
    });
    
    setShowQuizModal(false);
    setShowResultsModal(true);
    
    if (passed && !completedQuizzes.includes(activeQuiz.id)) {
      setCompletedQuizzes(prev => [...prev, activeQuiz.id]);
    }
  };

  const renderStatsHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={{
        padding: SPACING.lg,
        borderRadius: 15,
        marginHorizontal: SPACING.md,
        marginBottom: SPACING.lg,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md }}>
        <View>
          <Text style={[TEXT_STYLES.h3, { color: COLORS.white, marginBottom: SPACING.xs }]}>
            Quiz Performance 📊
          </Text>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.white, opacity: 0.9 }]}>
            Test your knowledge & skills
          </Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={[TEXT_STYLES.h1, { color: COLORS.white }]}>{stats.rank}</Text>
          <Text style={[TEXT_STYLES.small, { color: COLORS.white, opacity: 0.9 }]}>Current Level</Text>
        </View>
      </View>
      
      <View style={{ marginBottom: SPACING.md }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs }}>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.white }]}>Overall Progress</Text>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.white }]}>
            {stats.completedQuizzes}/{stats.totalQuizzes}
          </Text>
        </View>
        <ProgressBar 
          progress={stats.completedQuizzes / stats.totalQuizzes} 
          color={COLORS.white}
          style={{ height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.3)' }}
        />
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ alignItems: 'center' }}>
          <Text style={[TEXT_STYLES.body, { color: COLORS.white, fontWeight: 'bold' }]}>{stats.averageScore}%</Text>
          <Text style={[TEXT_STYLES.small, { color: COLORS.white, opacity: 0.9 }]}>Avg Score</Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={[TEXT_STYLES.body, { color: COLORS.white, fontWeight: 'bold' }]}>{stats.totalPoints}</Text>
          <Text style={[TEXT_STYLES.small, { color: COLORS.white, opacity: 0.9 }]}>Total Points</Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={[TEXT_STYLES.body, { color: COLORS.white, fontWeight: 'bold' }]}>{stats.streak}</Text>
          <Text style={[TEXT_STYLES.small, { color: COLORS.white, opacity: 0.9 }]}>Day Streak</Text>
        </View>
      </View>
    </LinearGradient>
  );

  const renderQuickStats = () => (
    <View style={{ marginHorizontal: SPACING.md, marginBottom: SPACING.lg }}>
      <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md, color: COLORS.text }]}>
        Quick Stats 🏆
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {[
          { title: 'Completed', value: stats.completedQuizzes, icon: 'check-circle', color: COLORS.success },
          { title: 'In Progress', value: 2, icon: 'schedule', color: COLORS.warning },
          { title: 'Perfect Scores', value: 3, icon: 'star', color: '#FFD700' },
          { title: 'Certificates', value: 2, icon: 'verified', color: COLORS.primary },
        ].map((stat, index) => (
          <Surface
            key={index}
            style={{
              padding: SPACING.md,
              borderRadius: 12,
              marginRight: SPACING.md,
              minWidth: 100,
              alignItems: 'center',
              backgroundColor: COLORS.white,
              elevation: 2,
            }}
          >
            <Icon name={stat.icon} size={24} color={stat.color} style={{ marginBottom: SPACING.xs }} />
            <Text style={[TEXT_STYLES.h2, { color: stat.color, marginBottom: SPACING.xs }]}>
              {stat.value}
            </Text>
            <Text style={[TEXT_STYLES.small, { color: COLORS.textSecondary, textAlign: 'center' }]}>
              {stat.title}
            </Text>
          </Surface>
        ))}
      </ScrollView>
    </View>
  );

  const renderCategories = () => (
    <View style={{ marginHorizontal: SPACING.md, marginBottom: SPACING.lg }}>
      <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md, color: COLORS.text }]}>
        Quiz Categories 📚
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {quizCategories.map((category, index) => (
          <TouchableOpacity
            key={category.id}
            onPress={() => setSelectedCategory(category.id)}
            style={{ marginRight: SPACING.md, marginLeft: index === 0 ? 0 : 0 }}
          >
            <Chip
              selected={selectedCategory === category.id}
              onPress={() => setSelectedCategory(category.id)}
              style={{
                backgroundColor: selectedCategory === category.id ? category.color : COLORS.white,
                borderWidth: 1,
                borderColor: category.color,
              }}
              textStyle={{
                color: selectedCategory === category.id ? COLORS.white : category.color,
                fontWeight: '600',
              }}
              icon={({ size, color }) => (
                <Icon 
                  name={category.icon} 
                  size={size} 
                  color={selectedCategory === category.id ? COLORS.white : category.color} 
                />
              )}
            >
              {category.name}
            </Chip>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderQuizCard = (quiz) => (
    <Card
      key={quiz.id}
      style={{
        marginHorizontal: SPACING.md,
        marginBottom: SPACING.md,
        backgroundColor: COLORS.white,
        elevation: 3,
      }}
    >
      <Card.Content style={{ padding: SPACING.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
          <View
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: quiz.color,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: SPACING.md,
            }}
          >
            <Icon name={quiz.icon} size={24} color={COLORS.white} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={[TEXT_STYLES.body, { fontWeight: '600', flex: 1 }]}>
                {quiz.title}
              </Text>
              {quiz.completed && (
                <View style={{
                  backgroundColor: COLORS.success,
                  borderRadius: 10,
                  paddingHorizontal: SPACING.sm,
                  paddingVertical: 2,
                }}>
                  <Text style={[TEXT_STYLES.small, { color: COLORS.white }]}>✓ {quiz.bestScore}%</Text>
                </View>
              )}
            </View>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginTop: SPACING.xs }]}>
              {quiz.description}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md }}>
          <View>
            <Text style={[TEXT_STYLES.small, { color: COLORS.textSecondary }]}>
              {quiz.questions} questions • {quiz.timeLimit} min
            </Text>
            <Text style={[TEXT_STYLES.small, { color: COLORS.textSecondary }]}>
              Pass: {quiz.passingScore}% • {quiz.difficulty}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="star" size={16} color={COLORS.warning} style={{ marginRight: SPACING.xs }} />
            <Text style={[TEXT_STYLES.small, { color: COLORS.textSecondary }]}>{quiz.rating}</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.md }}>
          {quiz.tags.map((tag, index) => (
            <Chip
              key={index}
              size="small"
              style={{
                marginRight: SPACING.xs,
                marginBottom: SPACING.xs,
                backgroundColor: COLORS.background,
              }}
              textStyle={{ color: COLORS.textSecondary }}
            >
              {tag}
            </Chip>
          ))}
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Button
            mode={quiz.completed ? "outlined" : "contained"}
            onPress={() => startQuiz(quiz)}
            style={{ flex: 1, borderRadius: 25 }}
            buttonColor={quiz.completed ? COLORS.white : quiz.color}
            textColor={quiz.completed ? quiz.color : COLORS.white}
            icon={quiz.completed ? "refresh" : "play-arrow"}
          >
            {quiz.completed ? "Retake Quiz" : "Start Quiz"}
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const renderQuestion = (question, index) => {
    const userAnswer = selectedAnswers[question.id];

    return (
      <View style={{ marginBottom: SPACING.lg }}>
        <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md, color: COLORS.text }]}>
          Question {index + 1} of {sampleQuestions.length}
        </Text>
        
        <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.lg, lineHeight: 24 }]}>
          {question.question}
        </Text>

        {question.type === 'multiple-choice' && (
          <RadioButton.Group
            onValueChange={(value) => handleAnswerSelect(question.id, parseInt(value))}
            value={userAnswer !== undefined ? userAnswer.toString() : ''}
          >
            {question.options.map((option, optionIndex) => (
              <TouchableOpacity
                key={optionIndex}
                onPress={() => handleAnswerSelect(question.id, optionIndex)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: SPACING.sm,
                  paddingHorizontal: SPACING.md,
                  marginBottom: SPACING.sm,
                  backgroundColor: userAnswer === optionIndex ? COLORS.primary + '20' : COLORS.background,
                  borderRadius: 10,
                }}
              >
                <RadioButton value={optionIndex.toString()} />
                <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.sm, flex: 1 }]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </RadioButton.Group>
        )}

        {question.type === 'multiple-select' && (
          <View>
            {question.options.map((option, optionIndex) => (
              <TouchableOpacity
                key={optionIndex}
                onPress={() => {
                  const currentAnswers = Array.isArray(userAnswer) ? userAnswer : [];
                  const newAnswers = currentAnswers.includes(optionIndex)
                    ? currentAnswers.filter(a => a !== optionIndex)
                    : [...currentAnswers, optionIndex];
                  handleAnswerSelect(question.id, newAnswers);
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: SPACING.sm,
                  paddingHorizontal: SPACING.md,
                  marginBottom: SPACING.sm,
                  backgroundColor: Array.isArray(userAnswer) && userAnswer.includes(optionIndex) 
                    ? COLORS.primary + '20' : COLORS.background,
                  borderRadius: 10,
                }}
              >
                <Checkbox
                  status={Array.isArray(userAnswer) && userAnswer.includes(optionIndex) ? 'checked' : 'unchecked'}
                />
                <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.sm, flex: 1 }]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {question.type === 'true-false' && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <TouchableOpacity
              onPress={() => handleAnswerSelect(question.id, true)}
              style={{
                flex: 1,
                padding: SPACING.md,
                marginRight: SPACING.sm,
                backgroundColor: userAnswer === true ? COLORS.success + '20' : COLORS.background,
                borderRadius: 10,
                alignItems: 'center',
              }}
            >
              <Icon name="check" size={24} color={COLORS.success} />
              <Text style={[TEXT_STYLES.body, { marginTop: SPACING.xs, color: COLORS.success }]}>
                True
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleAnswerSelect(question.id, false)}
              style={{
                flex: 1,
                padding: SPACING.md,
                marginLeft: SPACING.sm,
                backgroundColor: userAnswer === false ? COLORS.error + '20' : COLORS.background,
                borderRadius: 10,
                alignItems: 'center',
              }}
            >
              <Icon name="close" size={24} color={COLORS.error} />
              <Text style={[TEXT_STYLES.body, { marginTop: SPACING.xs, color: COLORS.error }]}>
                False
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderQuizModal = () => (
    <Portal>
      <Modal
        visible={showQuizModal}
        onDismiss={() => setShowQuizModal(false)}
        contentContainerStyle={{
          backgroundColor: COLORS.white,
          margin: SPACING.md,
          borderRadius: 20,
          padding: 0,
          maxHeight: height * 0.9,
        }}
      >
        {activeQuiz && (
          <View style={{ flex: 1 }}>
            <LinearGradient
              colors={[activeQuiz.color, activeQuiz.color + '99']}
              style={{ padding: SPACING.lg }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm }}>
                <Text style={[TEXT_STYLES.h3, { color: COLORS.white, flex: 1 }]}>
                  {activeQuiz.title}
                </Text>
                <IconButton
                  icon="close"
                  iconColor={COLORS.white}
                  size={24}
                  onPress={() => setShowQuizModal(false)}
                />
              </View>
              <Animated.View style={{ marginBottom: SPACING.sm }}>
                <ProgressBar
                  progress={progressAnim}
                  color={COLORS.white}
                  style={{ height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.3)' }}
                />
              </Animated.View>
            </LinearGradient>
            
            <ScrollView style={{ flex: 1, padding: SPACING.lg }}>
              {renderQuestion(sampleQuestions[currentQuestionIndex], currentQuestionIndex)}
            </ScrollView>

            <View style={{ padding: SPACING.lg, borderTopWidth: 1, borderTopColor: COLORS.border }}>
              <Button
                mode="contained"
                onPress={nextQuestion}
                disabled={selectedAnswers[sampleQuestions[currentQuestionIndex].id] === undefined}
                style={{ borderRadius: 25 }}
                buttonColor={activeQuiz.color}
                icon={currentQuestionIndex === sampleQuestions.length - 1 ? "check" : "arrow-forward"}
              >
                {currentQuestionIndex === sampleQuestions.length - 1 ? "Finish Quiz" : "Next Question"}
              </Button>
            </View>
          </View>
        )}
      </Modal>
    </Portal>
  );

  const renderResultsModal = () => (
    <Portal>
      <Modal
        visible={showResultsModal}
        onDismiss={() => setShowResultsModal(false)}
        contentContainerStyle={{
          backgroundColor: COLORS.white,
          margin: SPACING.lg,
          borderRadius: 20,
          padding: 0,
          overflow: 'hidden',
        }}
      >
        {quizResults.quiz && (
          <View>
            <LinearGradient
              colors={quizResults.passed ? [COLORS.success, '#66BB6A'] : [COLORS.error, '#EF5350']}
              style={{ padding: SPACING.lg, alignItems: 'center' }}
            >
              <Icon 
                name={quizResults.passed ? "celebration" : "sentiment-dissatisfied"} 
                size={48} 
                color={COLORS.white} 
                style={{ marginBottom: SPACING.sm }}
              />
              <Text style={[TEXT_STYLES.h2, { color: COLORS.white, marginBottom: SPACING.xs }]}>
                {quizResults.passed ? 'Congratulations! 🎉' : 'Keep Practicing! 💪'}
              </Text>
              <Text style={[TEXT_STYLES.h1, { color: COLORS.white, marginBottom: SPACING.xs }]}>
                {quizResults.score}%
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.white, opacity: 0.9 }]}>
                {quizResults.correctAnswers}/{quizResults.totalQuestions} correct answers
              </Text>
            </LinearGradient>
            
            <View style={{ padding: SPACING.lg }}>
              <View style={{ marginBottom: SPACING.lg }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.md }}>
                  <View style={{ alignItems: 'center' }}>
                    <Icon name="schedule" size={24} color={COLORS.textSecondary} />
                    <Text style={[TEXT_STYLES.body, { fontWeight: '600', marginTop: SPACING.xs }]}>
                      {quizResults.timeSpent}
                    </Text>
                    <Text style={[TEXT_STYLES.small, { color: COLORS.textSecondary }]}>Time</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Icon name="target" size={24} color={COLORS.textSecondary} />
                    <Text style={[TEXT_STYLES.body, { fontWeight: '600', marginTop: SPACING.xs }]}>
                      {quizResults.quiz.passingScore}%
                    </Text>
                    <Text style={[TEXT_STYLES.small, { color: COLORS.textSecondary }]}>Required</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Icon name="jump-rope" size={24} color={COLORS.warning} />
                    <Text style={[TEXT_STYLES.body, { fontWeight: '600', marginTop: SPACING.xs }]}>
                      +{quizResults.score * 10}
                    </Text>
                    <Text style={[TEXT_STYLES.small, { color: COLORS.textSecondary }]}>Points</Text>
                  </View>
                </View>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Button
                  mode="outlined"
                  onPress={() => setShowResultsModal(false)}
                  style={{ flex: 1, marginRight: SPACING.sm, borderRadius: 25 }}
                  textColor={quizResults.passed ? COLORS.success : COLORS.error}
                >
                  Close
                </Button>
                
                <Button
                  mode="contained"
                  onPress={() => {
                    setShowResultsModal(false);
                    startQuiz(quizResults.quiz);
                  }}
                  style={{ flex: 1, marginLeft: SPACING.sm, borderRadius: 25 }}
                  buttonColor={quizResults.passed ? COLORS.success : COLORS.error}
                  icon="refresh"
                >
                  Retake
                </Button>
              </View>
            </View>
          </View>
        )}
      </Modal>
    </Portal>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} translucent />
      
      <Animated.View
        style={{
          flex: 1,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          contentContainerStyle={{ paddingTop: SPACING.lg, paddingBottom: 100 }}
        >
          {renderStatsHeader()}
          
          <Searchbar
            placeholder="Search quizzes and assessments..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={{
              marginHorizontal: SPACING.md,
              marginBottom: SPACING.lg,
              backgroundColor: COLORS.white,
              borderRadius: 25,
            }}
            iconColor={COLORS.primary}
          />

          {renderQuickStats()}
          {renderCategories()}

          <View style={{ marginHorizontal: SPACING.md, marginBottom: SPACING.md }}>
            <Text style={[TEXT_STYLES.h3, { color: COLORS.text }]}>
              Available Quizzes 🧠
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginBottom: SPACING.md }]}>
              {filteredQuizzes.length} quizzes found
            </Text>
          </View>

          {filteredQuizzes.map(renderQuizCard)}
        </ScrollView>
      </Animated.View>

      {renderQuizModal()}
      {renderResultsModal()}

      <FAB
        icon="school"
        style={{
          position: 'absolute',
          margin: SPACING.md,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.primary,
        }}
        onPress={() => Alert.alert('🎓 AI Tutor', 'Personalized quiz recommendations and study plans coming soon!', [
          { text: 'OK', onPress: () => console.log('AI Tutor feature') }
        ])}
      />
    </View>
  );
};

export default QuizAssessments;