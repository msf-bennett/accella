import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  Text,
  Dimensions,
  Alert,
  Animated,
  FlatList,
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
  Badge,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';

// Import design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f5f5',
  white: '#FFFFFF',
  text: '#333333',
  textSecondary: '#666666',
  accent: '#FF6B6B',
  quiz: '#9C27B0',
  correct: '#4CAF50',
  incorrect: '#F44336',
  pending: '#FF9800',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subheading: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  body: {
    fontSize: 16,
    color: COLORS.text,
  },
  caption: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
};

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const Quizzes = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, quizzes, quizResults, achievements } = useSelector(
    (state) => ({
      user: state.auth.user,
      quizzes: state.education.quizzes || [],
      quizResults: state.education.quizResults || {},
      achievements: state.education.achievements || [],
    })
  );

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [animatedValue] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));
  const timerRef = useRef(null);

  // Mock quiz data
  const mockQuizzes = [
    {
      id: 1,
      title: 'Football Rules Quiz 🏈',
      category: 'Football',
      difficulty: 'Easy',
      questions: 10,
      timeLimit: 300, // 5 minutes
      points: 100,
      description: 'Test your knowledge of basic football rules and regulations',
      color: '#4CAF50',
      icon: 'sports-football',
      badge: '🏆',
      completed: true,
      bestScore: 8,
      attempts: 2,
      questions: [
        {
          id: 1,
          question: 'How many players are on the field for each team in American football?',
          options: ['10', '11', '12', '13'],
          correct: 1,
          explanation: 'Each team has 11 players on the field at any given time.'
        },
        {
          id: 2,
          question: 'How many points is a touchdown worth?',
          options: ['3 points', '6 points', '7 points', '8 points'],
          correct: 1,
          explanation: 'A touchdown is worth 6 points, with an extra point attempt following.'
        },
        {
          id: 3,
          question: 'What is it called when the defense catches a pass intended for the offense?',
          options: ['Fumble', 'Interception', 'Sack', 'Safety'],
          correct: 1,
          explanation: 'An interception occurs when the defense catches a pass intended for the offensive team.'
        }
      ]
    },
    {
      id: 2,
      title: 'Basketball Basics 🏀',
      category: 'Basketball',
      difficulty: 'Medium',
      questions: 12,
      timeLimit: 360,
      points: 150,
      description: 'Challenge yourself with basketball fundamentals and rules',
      color: '#FF9800',
      icon: 'sports-basketball',
      badge: '🔥',
      completed: false,
      bestScore: null,
      attempts: 0,
      questions: [
        {
          id: 1,
          question: 'How many players are on the court for each team in basketball?',
          options: ['4', '5', '6', '7'],
          correct: 1,
          explanation: 'Each basketball team has 5 players on the court at one time.'
        }
      ]
    },
    {
      id: 3,
      title: 'Soccer Knowledge ⚽',
      category: 'Soccer',
      difficulty: 'Easy',
      questions: 8,
      timeLimit: 240,
      points: 80,
      description: 'Learn about soccer rules, positions, and basic strategies',
      color: '#2196F3',
      icon: 'sports-soccer',
      badge: '⭐',
      completed: true,
      bestScore: 7,
      attempts: 3,
      questions: [
        {
          id: 1,
          question: 'How many players are on the field for each soccer team?',
          options: ['10', '11', '12', '9'],
          correct: 1,
          explanation: 'Each soccer team has 11 players on the field, including the goalkeeper.'
        }
      ]
    },
    {
      id: 4,
      title: 'Tennis Rules 🎾',
      category: 'Tennis',
      difficulty: 'Hard',
      questions: 15,
      timeLimit: 450,
      points: 200,
      description: 'Master the complex rules and scoring system of tennis',
      color: '#9C27B0',
      icon: 'sports-tennis',
      badge: '🎯',
      completed: false,
      bestScore: null,
      attempts: 0,
      questions: [
        {
          id: 1,
          question: 'What is the scoring sequence in tennis?',
          options: ['0, 15, 30, 40', '1, 2, 3, 4', '5, 10, 15, 20', '0, 1, 2, 3'],
          correct: 0,
          explanation: 'Tennis uses the unique scoring system of 0 (love), 15, 30, 40, and game.'
        }
      ]
    }
  ];

  const categories = ['All', 'Football', 'Basketball', 'Soccer', 'Tennis'];
  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

  const filteredQuizzes = mockQuizzes.filter((quiz) => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || quiz.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Timer effect for quiz
  useEffect(() => {
    if (quizStarted && timeLeft > 0 && !quizCompleted) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && quizStarted) {
      handleTimeUp();
    }
    return () => clearTimeout(timerRef.current);
  }, [timeLeft, quizStarted, quizCompleted]);

  // Pulse animation for timer
  useEffect(() => {
    if (timeLeft < 30 && quizStarted) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [timeLeft]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleQuizPress = (quiz) => {
    setSelectedQuiz(quiz);
    setShowQuizModal(true);
    resetQuizState();
  };

  const resetQuizState = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setQuizStarted(false);
    setQuizCompleted(false);
    setTimeLeft(0);
  };

  const startQuiz = () => {
    setQuizStarted(true);
    setTimeLeft(selectedQuiz.timeLimit);
    Vibration.vibrate(50);
  };

  const handleAnswerSelect = (answerIndex) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(answerIndex);
    const currentQ = selectedQuiz.questions[currentQuestion];
    const isCorrect = answerIndex === currentQ.correct;
    
    if (isCorrect) {
      setScore(score + 1);
      Vibration.vibrate([0, 100, 50, 100]);
    } else {
      Vibration.vibrate(200);
    }

    // Show answer feedback for 2 seconds
    setTimeout(() => {
      if (currentQuestion < selectedQuiz.questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      } else {
        completeQuiz();
      }
    }, 2000);
  };

  const completeQuiz = () => {
    setQuizCompleted(true);
    clearTimeout(timerRef.current);
    Vibration.vibrate([0, 100, 100, 100, 100, 200]);
  };

  const handleTimeUp = () => {
    Alert.alert('⏰ Time\'s Up!', 'The quiz time has ended. Let\'s see how you did!', [
      { text: 'View Results', onPress: completeQuiz }
    ]);
  };

  const getScoreMessage = (score, total) => {
    const percentage = (score / total) * 100;
    if (percentage >= 90) return { message: '🏆 Outstanding! You\'re a sports genius!', color: COLORS.success };
    if (percentage >= 80) return { message: '🌟 Excellent work! Keep it up!', color: COLORS.success };
    if (percentage >= 70) return { message: '👍 Good job! You\'re learning well!', color: COLORS.warning };
    if (percentage >= 60) return { message: '📚 Not bad! Keep studying!', color: COLORS.warning };
    return { message: '💪 Keep practicing! You\'ll improve!', color: COLORS.error };
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderQuizCard = ({ item: quiz }) => {
    const completionRate = quiz.bestScore ? Math.round((quiz.bestScore / quiz.questions.length) * 100) : 0;
    
    return (
      <Animated.View
        style={[
          styles.quizCard,
          {
            opacity: animatedValue,
            transform: [
              {
                translateY: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity onPress={() => handleQuizPress(quiz)}>
          <Card style={[styles.card, { borderLeftColor: quiz.color, borderLeftWidth: 4 }]}>
            <LinearGradient
              colors={[quiz.color + '15', COLORS.white]}
              style={styles.cardGradient}
            >
              <Card.Content style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <View style={styles.quizInfo}>
                    <View style={styles.titleRow}>
                      <Text style={styles.quizTitle}>{quiz.title}</Text>
                      {quiz.completed && (
                        <Badge size={20} style={{ backgroundColor: COLORS.success }}>
                          ✓
                        </Badge>
                      )}
                    </View>
                    <View style={styles.metaRow}>
                      <Chip
                        mode="flat"
                        style={[styles.difficultyChip, { backgroundColor: quiz.color + '30' }]}
                        textStyle={{ color: quiz.color, fontWeight: 'bold' }}
                        compact
                      >
                        {quiz.difficulty}
                      </Chip>
                      <Text style={styles.questionCount}>
                        {quiz.questions.length} questions
                      </Text>
                      <Text style={styles.timeLimit}>
                        ⏱️ {Math.floor(quiz.timeLimit / 60)}m
                      </Text>
                    </View>
                  </View>
                  <Avatar.Icon
                    size={50}
                    icon={quiz.icon}
                    style={{ backgroundColor: quiz.color + '30' }}
                    color={quiz.color}
                  />
                </View>

                <Text style={styles.quizDescription}>{quiz.description}</Text>

                {quiz.completed && (
                  <View style={styles.statsSection}>
                    <View style={styles.statRow}>
                      <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{quiz.bestScore}</Text>
                        <Text style={styles.statLabel}>Best Score</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{completionRate}%</Text>
                        <Text style={styles.statLabel}>Accuracy</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{quiz.attempts}</Text>
                        <Text style={styles.statLabel}>Attempts</Text>
                      </View>
                    </View>
                  </View>
                )}

                <View style={styles.actionSection}>
                  <View style={styles.pointsRow}>
                    <Icon name="star" size={20} color={COLORS.warning} />
                    <Text style={styles.pointsText}>+{quiz.points} points</Text>
                  </View>
                  <Button
                    mode={quiz.completed ? 'outlined' : 'contained'}
                    onPress={() => handleQuizPress(quiz)}
                    style={[
                      styles.actionButton,
                      !quiz.completed && { backgroundColor: quiz.color },
                    ]}
                    labelStyle={styles.buttonLabel}
                    icon={quiz.completed ? 'refresh' : 'play-arrow'}
                  >
                    {quiz.completed ? 'Retake Quiz' : 'Start Quiz'}
                  </Button>
                </View>
              </Card.Content>
            </LinearGradient>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderCategoryChip = (category) => (
    <Chip
      key={category}
      mode={selectedCategory === category ? 'flat' : 'outlined'}
      selected={selectedCategory === category}
      onPress={() => setSelectedCategory(category)}
      style={[
        styles.categoryChip,
        selectedCategory === category && { backgroundColor: COLORS.primary + '20' },
      ]}
      textStyle={[
        styles.categoryChipText,
        selectedCategory === category && { color: COLORS.primary, fontWeight: 'bold' },
      ]}
    >
      {category}
    </Chip>
  );

  const renderStatsOverview = () => {
    const totalQuizzes = mockQuizzes.length;
    const completedQuizzes = mockQuizzes.filter(q => q.completed).length;
    const totalPoints = mockQuizzes.reduce((sum, quiz) => {
      return quiz.completed ? sum + quiz.points : sum;
    }, 0);
    const averageScore = completedQuizzes > 0 
      ? mockQuizzes.filter(q => q.completed).reduce((sum, q) => sum + q.bestScore, 0) / completedQuizzes
      : 0;

    return (
      <Card style={styles.overviewCard}>
        <LinearGradient colors={[COLORS.quiz, COLORS.secondary]} style={styles.overviewGradient}>
          <Card.Content style={styles.overviewContent}>
            <Text style={styles.overviewTitle}>🧠 Quiz Master Dashboard</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statBigNumber}>{completedQuizzes}</Text>
                <Text style={styles.statSmallLabel}>Completed</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statBigNumber}>{totalPoints}</Text>
                <Text style={styles.statSmallLabel}>Points</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statBigNumber}>{Math.round(averageScore * 10) / 10}</Text>
                <Text style={styles.statSmallLabel}>Avg Score</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statBigNumber}>{totalQuizzes - completedQuizzes}</Text>
                <Text style={styles.statSmallLabel}>Remaining</Text>
              </View>
            </View>
          </Card.Content>
        </LinearGradient>
      </Card>
    );
  };

  const renderQuizQuestion = () => {
    if (!selectedQuiz || !quizStarted || quizCompleted) return null;

    const question = selectedQuiz.questions[currentQuestion];
    const progress = (currentQuestion + 1) / selectedQuiz.questions.length;

    return (
      <View style={styles.questionContainer}>
        <View style={styles.quizHeader}>
          <View style={styles.progressSection}>
            <Text style={styles.questionProgress}>
              Question {currentQuestion + 1} of {selectedQuiz.questions.length}
            </Text>
            <ProgressBar
              progress={progress}
              color={COLORS.success}
              style={styles.questionProgressBar}
            />
          </View>
          <Animated.View style={[styles.timerContainer, { transform: [{ scale: pulseAnim }] }]}>
            <Text style={[
              styles.timerText,
              timeLeft < 30 && { color: COLORS.error }
            ]}>
              {formatTime(timeLeft)}
            </Text>
          </Animated.View>
        </View>

        <Text style={styles.questionText}>{question.question}</Text>

        <View style={styles.optionsContainer}>
          {question.options.map((option, index) => {
            let buttonStyle = styles.optionButton;
            let textStyle = styles.optionText;

            if (selectedAnswer !== null) {
              if (index === question.correct) {
                buttonStyle = [styles.optionButton, styles.correctOption];
                textStyle = [styles.optionText, styles.correctText];
              } else if (index === selectedAnswer && selectedAnswer !== question.correct) {
                buttonStyle = [styles.optionButton, styles.incorrectOption];
                textStyle = [styles.optionText, styles.incorrectText];
              } else {
                buttonStyle = [styles.optionButton, styles.disabledOption];
                textStyle = [styles.optionText, styles.disabledText];
              }
            }

            return (
              <TouchableOpacity
                key={index}
                style={buttonStyle}
                onPress={() => handleAnswerSelect(index)}
                disabled={selectedAnswer !== null}
              >
                <Text style={textStyle}>{option}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {selectedAnswer !== null && (
          <View style={styles.explanationContainer}>
            <Text style={styles.explanationTitle}>
              {selectedAnswer === question.correct ? '✅ Correct!' : '❌ Incorrect'}
            </Text>
            <Text style={styles.explanationText}>{question.explanation}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderQuizResults = () => {
    if (!quizCompleted) return null;

    const scoreInfo = getScoreMessage(score, selectedQuiz.questions.length);
    const percentage = Math.round((score / selectedQuiz.questions.length) * 100);

    return (
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>🎉 Quiz Complete!</Text>
        
        <View style={styles.scoreCircle}>
          <Text style={styles.scoreNumber}>{score}</Text>
          <Text style={styles.scoreTotal}>/ {selectedQuiz.questions.length}</Text>
          <Text style={styles.scorePercentage}>{percentage}%</Text>
        </View>

        <Text style={[styles.scoreMessage, { color: scoreInfo.color }]}>
          {scoreInfo.message}
        </Text>

        <View style={styles.resultStats}>
          <View style={styles.resultStat}>
            <Icon name="check-circle" size={24} color={COLORS.success} />
            <Text style={styles.resultStatText}>Correct: {score}</Text>
          </View>
          <View style={styles.resultStat}>
            <Icon name="cancel" size={24} color={COLORS.error} />
            <Text style={styles.resultStatText}>Wrong: {selectedQuiz.questions.length - score}</Text>
          </View>
          <View style={styles.resultStat}>
            <Icon name="star" size={24} color={COLORS.warning} />
            <Text style={styles.resultStatText}>Points: +{Math.round(selectedQuiz.points * (score / selectedQuiz.questions.length))}</Text>
          </View>
        </View>

        <View style={styles.resultActions}>
          <Button
            mode="outlined"
            onPress={() => {
              setShowQuizModal(false);
              resetQuizState();
            }}
            style={styles.resultButton}
          >
            Back to Quizzes
          </Button>
          <Button
            mode="contained"
            onPress={() => {
              resetQuizState();
              startQuiz();
            }}
            style={[styles.resultButton, { backgroundColor: selectedQuiz.color }]}
            icon="refresh"
          >
            Try Again
          </Button>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      <LinearGradient
        colors={[COLORS.quiz, COLORS.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>🧠 Sports Quizzes</Text>
            <IconButton
              icon="account-circle"
              size={32}
              iconColor={COLORS.white}
              onPress={() => navigation.navigate('Profile')}
            />
          </View>
          <Text style={styles.headerSubtitle}>
            Test your sports knowledge! 🏆
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.quiz]}
            tintColor={COLORS.quiz}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderStatsOverview()}

        <View style={styles.searchSection}>
          <Searchbar
            placeholder="Search quizzes..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            iconColor={COLORS.quiz}
            inputStyle={styles.searchInput}
          />
        </View>

        <View style={styles.categorySection}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {categories.map(renderCategoryChip)}
          </ScrollView>
        </View>

        <View style={styles.quizzesSection}>
          <Text style={styles.sectionTitle}>
            Available Quizzes ({filteredQuizzes.length})
          </Text>
          <FlatList
            data={filteredQuizzes}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderQuizCard}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ height: SPACING.md }} />}
          />
        </View>
      </ScrollView>

      <Portal>
        <Modal
          visible={showQuizModal}
          onDismiss={() => setShowQuizModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          {selectedQuiz && (
            <Card style={styles.modalCard}>
              <LinearGradient
                colors={[selectedQuiz.color + '20', COLORS.white]}
                style={styles.modalGradient}
              >
                <Card.Content style={styles.modalContent}>
                  {!quizStarted ? (
                    // Quiz intro screen
                    <View style={styles.quizIntro}>
                      <View style={styles.modalHeader}>
                        <View style={styles.modalTitleRow}>
                          <Text style={styles.modalTitle}>{selectedQuiz.title}</Text>
                          <IconButton
                            icon="close"
                            size={24}
                            onPress={() => setShowQuizModal(false)}
                          />
                        </View>
                        <Text style={styles.modalDescription}>{selectedQuiz.description}</Text>
                      </View>

                      <View style={styles.quizDetails}>
                        <View style={styles.detailRow}>
                          <Icon name="quiz" size={20} color={COLORS.textSecondary} />
                          <Text style={styles.detailText}>{selectedQuiz.questions.length} questions</Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Icon name="schedule" size={20} color={COLORS.textSecondary} />
                          <Text style={styles.detailText}>{Math.floor(selectedQuiz.timeLimit / 60)} minutes</Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Icon name="trending-up" size={20} color={COLORS.textSecondary} />
                          <Text style={styles.detailText}>{selectedQuiz.difficulty} difficulty</Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Icon name="star" size={20} color={COLORS.textSecondary} />
                          <Text style={styles.detailText}>Up to {selectedQuiz.points} points</Text>
                        </View>
                      </View>

                      <View style={styles.quizActions}>
                        <Button
                          mode="outlined"
                          onPress={() => setShowQuizModal(false)}
                          style={styles.quizButton}
                        >
                          Maybe Later
                        </Button>
                        <Button
                          mode="contained"
                          onPress={startQuiz}
                          style={[styles.quizButton, { backgroundColor: selectedQuiz.color }]}
                          icon="play-arrow"
                        >
                          Start Quiz!
                        </Button>
                      </View>
                    </View>
                  ) : quizCompleted ? (
                    renderQuizResults()
                  ) : (
                    renderQuizQuestion()
                  )}
                </Card.Content>
              </LinearGradient>
            </Card>
          )}
        </Modal>
      </Portal>

      <FAB
        icon="leaderboard"
        style={[styles.fab, { backgroundColor: COLORS.accent }]}
        onPress={() =>
          Alert.alert(
            '🏅 Leaderboard',
            'See how you rank against other quiz masters! This feature is coming soon!',
            [{ text: 'Got it!' }]
          )
        }
        label="Leaderboard"
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
    paddingTop: 50,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.heading,
    color: COLORS.white,
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.white + 'CC',
    marginTop: SPACING.xs,
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  overviewCard: {
    marginTop: -SPACING.lg,
    marginBottom: SPACING.lg,
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  overviewGradient: {
    borderRadius: 12,
  },
  overviewContent: {
    padding: SPACING.lg,
  },
  overviewTitle: {
    ...TEXT_STYLES.subheading,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    fontSize: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statBigNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  statSmallLabel: {
    fontSize: 12,
    color: COLORS.white + 'CC',
    marginTop: SPACING.xs,
  },
  searchSection: {
    marginBottom: SPACING.lg,
  },
  searchbar: {
    elevation: 2,
    backgroundColor: COLORS.white,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  categorySection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TEXT_STYLES.subheading,
    marginBottom: SPACING.md,
    fontSize: 18,
  },
  categoryScroll: {
    marginHorizontal: -SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  categoryChip: {
    marginRight: SPACING.sm,
  },
  categoryChipText: {
    fontSize: 14,
  },
  quizzesSection: {
    flex: 1,
    paddingBottom: 100,
  },
  quizCard: {
    marginBottom: SPACING.md,
  },
  card: {
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardGradient: {
    borderRadius: 12,
  },
  cardContent: {
    padding: SPACING.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  quizInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  quizTitle: {
    ...TEXT_STYLES.subheading,
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  difficultyChip: {
    height: 28,
  },
  questionCount: {
    ...TEXT_STYLES.caption,
    fontSize: 12,
  },
  timeLimit: {
    ...TEXT_STYLES.caption,
    fontSize: 12,
  },
  quizDescription: {
    ...TEXT_STYLES.body,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  statsSection: {
    backgroundColor: COLORS.background + '80',
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  actionSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsText: {
    ...TEXT_STYLES.caption,
    color: COLORS.warning,
    fontWeight: 'bold',
    marginLeft: SPACING.xs,
  },
  actionButton: {
    borderRadius: 20,
    minWidth: 120,
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalContainer: {
    margin: SPACING.md,
    maxHeight: screenHeight * 0.9,
  },
  modalCard: {
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    maxHeight: screenHeight * 0.9,
  },
  modalGradient: {
    borderRadius: 12,
  },
  modalContent: {
    maxHeight: screenHeight * 0.85,
  },
  quizIntro: {
    padding: SPACING.md,
  },
  modalHeader: {
    marginBottom: SPACING.lg,
  },
  modalTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  modalTitle: {
    ...TEXT_STYLES.heading,
    fontSize: 22,
    flex: 1,
  },
  modalDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
  },
  quizDetails: {
    backgroundColor: COLORS.background + '80',
    borderRadius: 8,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  detailText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.sm,
    fontSize: 14,
  },
  quizActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  quizButton: {
    flex: 1,
  },
  // Quiz Question Styles
  questionContainer: {
    padding: SPACING.md,
  },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  progressSection: {
    flex: 1,
    marginRight: SPACING.lg,
  },
  questionProgress: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  questionProgressBar: {
    height: 6,
    borderRadius: 3,
  },
  timerContainer: {
    backgroundColor: COLORS.warning + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
  },
  timerText: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.warning,
  },
  questionText: {
    ...TEXT_STYLES.heading,
    fontSize: 20,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 28,
  },
  optionsContainer: {
    marginBottom: SPACING.lg,
  },
  optionButton: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  correctOption: {
    backgroundColor: COLORS.success + '20',
    borderColor: COLORS.success,
  },
  incorrectOption: {
    backgroundColor: COLORS.error + '20',
    borderColor: COLORS.error,
  },
  disabledOption: {
    opacity: 0.5,
  },
  optionText: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    fontSize: 16,
  },
  correctText: {
    color: COLORS.success,
    fontWeight: 'bold',
  },
  incorrectText: {
    color: COLORS.error,
    fontWeight: 'bold',
  },
  disabledText: {
    color: COLORS.textSecondary,
  },
  explanationContainer: {
    backgroundColor: COLORS.primary + '10',
    borderRadius: 8,
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  explanationTitle: {
    ...TEXT_STYLES.subheading,
    fontSize: 16,
    marginBottom: SPACING.sm,
  },
  explanationText: {
    ...TEXT_STYLES.body,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  // Results Styles
  resultsContainer: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  resultsTitle: {
    ...TEXT_STYLES.heading,
    fontSize: 26,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  scoreCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  scoreTotal: {
    fontSize: 18,
    color: COLORS.textSecondary,
  },
  scorePercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },
  scoreMessage: {
    ...TEXT_STYLES.subheading,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    fontSize: 18,
  },
  resultStats: {
    width: '100%',
    backgroundColor: COLORS.background + '80',
    borderRadius: 8,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  resultStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  resultStatText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.md,
    fontSize: 16,
  },
  resultActions: {
    flexDirection: 'row',
    width: '100%',
    gap: SPACING.md,
  },
  resultButton: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: SPACING.md,
    bottom: SPACING.lg,
    elevation: 8,
  },
});

export default Quizzes;