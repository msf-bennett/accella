import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Animated,
  Vibration,
  StatusBar,
  Dimensions,
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
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const QuizzesTestsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [showResults, setShowResults] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const timerRef = useRef(null);

  // Mock data for quizzes and tests
  const [quizzes] = useState([
    {
      id: 1,
      title: 'Basic Fitness Fundamentals 💪',
      description: 'Test your knowledge of basic fitness principles',
      category: 'fitness',
      difficulty: 'Beginner',
      questions: 10,
      timeLimit: 300, // 5 minutes
      points: 100,
      completed: true,
      score: 85,
      badge: 'fitness-fundamentals',
      questions_data: [
        {
          question: 'How many days per week should beginners exercise?',
          options: ['2-3 days', '4-5 days', '6-7 days', 'Every day'],
          correct: 0,
          explanation: 'Beginners should start with 2-3 days to allow proper recovery.'
        },
        {
          question: 'What is the recommended rest time between sets for strength training?',
          options: ['30 seconds', '1-2 minutes', '2-5 minutes', '10 minutes'],
          correct: 2,
          explanation: '2-5 minutes allows for proper muscle recovery and performance.'
        }
      ]
    },
    {
      id: 2,
      title: 'Nutrition Basics 🥗',
      description: 'Learn about proper nutrition for fitness',
      category: 'nutrition',
      difficulty: 'Intermediate',
      questions: 15,
      timeLimit: 450,
      points: 150,
      completed: false,
      badge: 'nutrition-expert',
      questions_data: [
        {
          question: 'How much protein should you consume per kg of body weight?',
          options: ['0.5g', '0.8-1g', '1.2-2g', '3g'],
          correct: 2,
          explanation: '1.2-2g per kg is optimal for active individuals.'
        }
      ]
    },
    {
      id: 3,
      title: 'Exercise Form & Technique 🏋️',
      description: 'Master proper exercise form and techniques',
      category: 'technique',
      difficulty: 'Advanced',
      questions: 12,
      timeLimit: 600,
      points: 200,
      completed: false,
      badge: 'form-master',
      questions_data: []
    },
    {
      id: 4,
      title: 'Recovery & Rest 😴',
      description: 'Understanding the importance of recovery',
      category: 'recovery',
      difficulty: 'Beginner',
      questions: 8,
      timeLimit: 240,
      points: 80,
      completed: true,
      score: 95,
      badge: 'recovery-pro',
      questions_data: []
    }
  ]);

  const [achievements] = useState([
    { id: 1, title: 'Quiz Master', icon: 'quiz', unlocked: true, description: 'Complete 5 quizzes' },
    { id: 2, title: 'Perfect Score', icon: 'star', unlocked: false, description: 'Get 100% on any quiz' },
    { id: 3, title: 'Speed Demon', icon: 'flash-on', unlocked: false, description: 'Complete a quiz in under 2 minutes' },
    { id: 4, title: 'Knowledge Seeker', icon: 'school', unlocked: true, description: 'Take your first quiz' }
  ]);

  const categories = [
    { key: 'all', label: 'All', icon: 'quiz' },
    { key: 'fitness', label: 'Fitness', icon: 'fitness-center' },
    { key: 'nutrition', label: 'Nutrition', icon: 'restaurant' },
    { key: 'technique', label: 'Technique', icon: 'sports' },
    { key: 'recovery', label: 'Recovery', icon: 'bed' }
  ];

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

  useEffect(() => {
    if (activeQuiz && !showResults) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [activeQuiz, showResults]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
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
    if (quiz.questions_data.length === 0) {
      Alert.alert('Coming Soon! 🚀', 'This quiz is currently under development. Stay tuned for updates!');
      return;
    }
    
    Vibration.vibrate(50);
    setActiveQuiz(quiz);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setTimeLeft(30);
    setShowResults(false);
    setUserAnswers([]);
  };

  const selectAnswer = (answerIndex) => {
    setSelectedAnswer(answerIndex);
    Vibration.vibrate(25);
  };

  const nextQuestion = () => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = {
      selected: selectedAnswer,
      correct: activeQuiz.questions_data[currentQuestion].correct,
      isCorrect: selectedAnswer === activeQuiz.questions_data[currentQuestion].correct
    };
    setUserAnswers(newAnswers);

    if (selectedAnswer === activeQuiz.questions_data[currentQuestion].correct) {
      setScore(prev => prev + 1);
      Vibration.vibrate([50, 100, 50]);
    }

    if (currentQuestion + 1 < activeQuiz.questions_data.length) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setTimeLeft(30);
    } else {
      finishQuiz();
    }
  };

  const handleTimeUp = () => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = {
      selected: null,
      correct: activeQuiz.questions_data[currentQuestion].correct,
      isCorrect: false
    };
    setUserAnswers(newAnswers);

    if (currentQuestion + 1 < activeQuiz.questions_data.length) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setTimeLeft(30);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setShowResults(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const exitQuiz = () => {
    Alert.alert(
      'Exit Quiz? 🤔',
      'Your progress will be lost. Are you sure you want to exit?',
      [
        { text: 'Continue Quiz', style: 'cancel' },
        { text: 'Exit', onPress: () => {
          setActiveQuiz(null);
          setCurrentQuestion(0);
          setSelectedAnswer(null);
          setScore(0);
          setShowResults(false);
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
        }}
      ]
    );
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setTimeLeft(30);
    setShowResults(false);
    setUserAnswers([]);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return COLORS.success;
      case 'Intermediate': return COLORS.warning;
      case 'Advanced': return COLORS.error;
      default: return COLORS.primary;
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (activeQuiz && !showResults) {
    const currentQ = activeQuiz.questions_data[currentQuestion];
    const progress = (currentQuestion + 1) / activeQuiz.questions_data.length;

    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background }}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        
        {/* Header */}
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={{
            paddingTop: StatusBar.currentHeight + SPACING.md,
            paddingHorizontal: SPACING.lg,
            paddingBottom: SPACING.lg,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <IconButton
              icon="close"
              iconColor="white"
              size={24}
              onPress={exitQuiz}
            />
            <Text style={[TEXT_STYLES.h3, { color: 'white', flex: 1, textAlign: 'center' }]}>
              Question {currentQuestion + 1} of {activeQuiz.questions_data.length}
            </Text>
            <View style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              paddingHorizontal: SPACING.sm,
              paddingVertical: SPACING.xs,
              borderRadius: 20,
            }}>
              <Text style={[TEXT_STYLES.body, { color: 'white', fontWeight: 'bold' }]}>
                {formatTime(timeLeft)}
              </Text>
            </View>
          </View>
          
          <ProgressBar
            progress={progress}
            color="white"
            style={{ marginTop: SPACING.md, backgroundColor: 'rgba(255,255,255,0.3)' }}
          />
        </LinearGradient>

        <ScrollView style={{ flex: 1, padding: SPACING.lg }}>
          <Card style={{ marginBottom: SPACING.lg, elevation: 4 }}>
            <Card.Content style={{ padding: SPACING.xl }}>
              <Text style={[TEXT_STYLES.h2, { marginBottom: SPACING.lg, textAlign: 'center' }]}>
                {currentQ.question}
              </Text>
              
              {currentQ.options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={{
                    padding: SPACING.md,
                    marginBottom: SPACING.sm,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: selectedAnswer === index ? COLORS.primary : COLORS.lightGray,
                    backgroundColor: selectedAnswer === index ? COLORS.primary + '20' : 'white',
                  }}
                  onPress={() => selectAnswer(index)}
                >
                  <Text style={[
                    TEXT_STYLES.body,
                    { color: selectedAnswer === index ? COLORS.primary : COLORS.text }
                  ]}>
                    {String.fromCharCode(65 + index)}. {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </Card.Content>
          </Card>

          <Button
            mode="contained"
            onPress={nextQuestion}
            disabled={selectedAnswer === null}
            style={{ marginBottom: SPACING.lg }}
            buttonColor={COLORS.primary}
          >
            {currentQuestion + 1 === activeQuiz.questions_data.length ? 'Finish Quiz' : 'Next Question'}
          </Button>
        </ScrollView>
      </View>
    );
  }

  if (activeQuiz && showResults) {
    const percentage = Math.round((score / activeQuiz.questions_data.length) * 100);
    const isPassing = percentage >= 70;

    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background }}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        
        <LinearGradient
          colors={isPassing ? ['#4CAF50', '#45a049'] : ['#f44336', '#d32f2f']}
          style={{ flex: 1 }}
        >
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: SPACING.xl,
          }}>
            <Icon
              name={isPassing ? 'celebration' : 'sentiment-dissatisfied'}
              size={80}
              color="white"
              style={{ marginBottom: SPACING.lg }}
            />
            
            <Text style={[TEXT_STYLES.h1, { color: 'white', marginBottom: SPACING.sm }]}>
              {isPassing ? 'Congratulations! 🎉' : 'Keep Trying! 💪'}
            </Text>
            
            <Text style={[TEXT_STYLES.h2, { color: 'white', marginBottom: SPACING.lg }]}>
              {score}/{activeQuiz.questions_data.length} ({percentage}%)
            </Text>
            
            <Card style={{ width: '100%', marginBottom: SPACING.lg }}>
              <Card.Content>
                <Text style={[TEXT_STYLES.body, { textAlign: 'center', marginBottom: SPACING.md }]}>
                  {isPassing 
                    ? 'Great job! You have a solid understanding of the material.' 
                    : 'Review the material and try again. You can do it!'}
                </Text>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={TEXT_STYLES.caption}>Points Earned</Text>
                    <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>
                      {Math.round((percentage / 100) * activeQuiz.points)}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={TEXT_STYLES.caption}>Time Saved</Text>
                    <Text style={[TEXT_STYLES.h3, { color: COLORS.success }]}>
                      {formatTime(activeQuiz.timeLimit - (activeQuiz.questions_data.length * 30))}
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
            
            <View style={{ flexDirection: 'row', gap: SPACING.md }}>
              <Button
                mode="outlined"
                onPress={restartQuiz}
                buttonColor="transparent"
                textColor="white"
                style={{ borderColor: 'white' }}
              >
                Retry Quiz
              </Button>
              <Button
                mode="contained"
                onPress={() => setActiveQuiz(null)}
                buttonColor="white"
                textColor={isPassing ? COLORS.success : COLORS.error}
              >
                Continue
              </Button>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <Animated.View style={{ 
      flex: 1, 
      backgroundColor: COLORS.background,
      opacity: fadeAnim,
      transform: [{ translateY: slideAnim }]
    }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{
          paddingTop: StatusBar.currentHeight + SPACING.md,
          paddingHorizontal: SPACING.lg,
          paddingBottom: SPACING.lg,
        }}
      >
        <Text style={[TEXT_STYLES.h1, { color: 'white', marginBottom: SPACING.sm }]}>
          Quizzes & Tests 🧠
        </Text>
        <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.8)' }]}>
          Test your knowledge and track your learning progress
        </Text>
      </LinearGradient>

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
      >
        {/* Search Bar */}
        <View style={{ padding: SPACING.lg }}>
          <Searchbar
            placeholder="Search quizzes and tests..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={{ marginBottom: SPACING.md }}
          />
        </View>

        {/* Categories */}
        <View style={{ paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg }}>
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((category) => (
              <Chip
                key={category.key}
                selected={selectedCategory === category.key}
                onPress={() => setSelectedCategory(category.key)}
                icon={category.icon}
                style={{ marginRight: SPACING.sm }}
                selectedColor={COLORS.primary}
              >
                {category.label}
              </Chip>
            ))}
          </ScrollView>
        </View>

        {/* Stats Overview */}
        <View style={{ paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg }}>
          <Card style={{ elevation: 2 }}>
            <Card.Content>
              <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>Your Progress 📊</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={TEXT_STYLES.caption}>Completed</Text>
                  <Text style={[TEXT_STYLES.h2, { color: COLORS.success }]}>
                    {quizzes.filter(q => q.completed).length}
                  </Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={TEXT_STYLES.caption}>Average Score</Text>
                  <Text style={[TEXT_STYLES.h2, { color: COLORS.primary }]}>
                    {Math.round(
                      quizzes
                        .filter(q => q.completed)
                        .reduce((acc, q) => acc + q.score, 0) /
                      quizzes.filter(q => q.completed).length
                    ) || 0}%
                  </Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={TEXT_STYLES.caption}>Total Points</Text>
                  <Text style={[TEXT_STYLES.h2, { color: COLORS.warning }]}>
                    {quizzes
                      .filter(q => q.completed)
                      .reduce((acc, q) => acc + Math.round((q.score / 100) * q.points), 0)}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Achievements Preview */}
        <View style={{ paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md }}>
            <Text style={TEXT_STYLES.h3}>Recent Achievements 🏆</Text>
            <TouchableOpacity>
              <Text style={[TEXT_STYLES.body, { color: COLORS.primary }]}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {achievements.slice(0, 3).map((achievement) => (
              <Card
                key={achievement.id}
                style={{
                  width: 150,
                  marginRight: SPACING.sm,
                  opacity: achievement.unlocked ? 1 : 0.6,
                  elevation: achievement.unlocked ? 3 : 1,
                }}
              >
                <Card.Content style={{ alignItems: 'center', padding: SPACING.md }}>
                  <Icon
                    name={achievement.icon}
                    size={32}
                    color={achievement.unlocked ? COLORS.warning : COLORS.lightGray}
                    style={{ marginBottom: SPACING.sm }}
                  />
                  <Text style={[TEXT_STYLES.caption, { textAlign: 'center' }]}>
                    {achievement.title}
                  </Text>
                </Card.Content>
              </Card>
            ))}
          </ScrollView>
        </View>

        {/* Quiz List */}
        <View style={{ paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl }}>
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
            Available Quizzes ({filteredQuizzes.length})
          </Text>
          
          {filteredQuizzes.map((quiz) => (
            <Card key={quiz.id} style={{ marginBottom: SPACING.md, elevation: 3 }}>
              <Card.Content style={{ padding: SPACING.lg }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.sm }}>
                  <Text style={[TEXT_STYLES.h3, { flex: 1, marginRight: SPACING.sm }]}>
                    {quiz.title}
                  </Text>
                  {quiz.completed && (
                    <Chip
                      icon="check-circle"
                      style={{ backgroundColor: COLORS.success + '20' }}
                      textStyle={{ color: COLORS.success }}
                    >
                      {quiz.score}%
                    </Chip>
                  )}
                </View>
                
                <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary, marginBottom: SPACING.md }]}>
                  {quiz.description}
                </Text>
                
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
                  <Chip
                    size="small"
                    style={{ 
                      backgroundColor: getDifficultyColor(quiz.difficulty) + '20',
                      marginRight: SPACING.sm 
                    }}
                    textStyle={{ color: getDifficultyColor(quiz.difficulty) }}
                  >
                    {quiz.difficulty}
                  </Chip>
                  
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: SPACING.md }}>
                    <Icon name="quiz" size={16} color={COLORS.textSecondary} />
                    <Text style={[TEXT_STYLES.caption, { marginLeft: 4 }]}>
                      {quiz.questions} questions
                    </Text>
                  </View>
                  
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: SPACING.md }}>
                    <Icon name="schedule" size={16} color={COLORS.textSecondary} />
                    <Text style={[TEXT_STYLES.caption, { marginLeft: 4 }]}>
                      {Math.round(quiz.timeLimit / 60)} min
                    </Text>
                  </View>
                  
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon name="stars" size={16} color={COLORS.warning} />
                    <Text style={[TEXT_STYLES.caption, { marginLeft: 4 }]}>
                      {quiz.points} pts
                    </Text>
                  </View>
                </View>
                
                <Button
                  mode="contained"
                  onPress={() => startQuiz(quiz)}
                  buttonColor={quiz.completed ? COLORS.success : COLORS.primary}
                  style={{ marginTop: SPACING.sm }}
                  icon={quiz.completed ? "refresh" : "play-arrow"}
                >
                  {quiz.completed ? 'Retake Quiz' : 'Start Quiz'}
                </Button>
              </Card.Content>
            </Card>
          ))}
          
          {filteredQuizzes.length === 0 && (
            <Card style={{ padding: SPACING.xl, alignItems: 'center' }}>
              <Icon name="quiz" size={64} color={COLORS.lightGray} style={{ marginBottom: SPACING.md }} />
              <Text style={[TEXT_STYLES.h3, { color: COLORS.textSecondary, marginBottom: SPACING.sm }]}>
                No quizzes found
              </Text>
              <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary, textAlign: 'center' }]}>
                Try adjusting your search or category filters
              </Text>
            </Card>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={{
          position: 'absolute',
          margin: SPACING.lg,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.primary,
        }}
        onPress={() => Alert.alert('Coming Soon! 🚀', 'Custom quiz creation feature is coming soon!')}
      />
    </Animated.View>
  );
};

export default QuizzesTestsScreen;