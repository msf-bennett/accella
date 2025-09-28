import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  RefreshControl,
  StatusBar,
  Alert,
  Vibration,
  Dimensions,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  ProgressBar,
  Avatar,
  IconButton,
  Surface,
  Portal,
  Modal,
  Searchbar,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your established constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const NutritionBasics = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);
  const userProgress = useSelector(state => state.progress.nutrition || {});
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const headerScrollY = useRef(new Animated.Value(0)).current;
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('macros');
  const [completedTopics, setCompletedTopics] = useState(new Set(userProgress.completedTopics || []));
  const [currentStreak, setCurrentStreak] = useState(userProgress.streak || 0);
  const [totalPoints, setTotalPoints] = useState(userProgress.points || 0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [newAchievement, setNewAchievement] = useState(null);

  // Nutrition content data
  const nutritionCategories = [
    { 
      id: 'macros', 
      title: 'Macronutrients', 
      icon: 'restaurant', 
      color: COLORS.primary,
      description: 'Learn about proteins, carbs, and fats' 
    },
    { 
      id: 'micros', 
      title: 'Micronutrients', 
      icon: 'local-pharmacy', 
      color: COLORS.secondary,
      description: 'Essential vitamins and minerals' 
    },
    { 
      id: 'hydration', 
      title: 'Hydration', 
      icon: 'local-drink', 
      color: '#4fc3f7',
      description: 'Water and electrolyte balance' 
    },
    { 
      id: 'timing', 
      title: 'Meal Timing', 
      icon: 'access-time', 
      color: '#ff7043',
      description: 'When and how to eat for performance' 
    },
    { 
      id: 'supplements', 
      title: 'Supplements', 
      icon: 'healing', 
      color: '#ab47bc',
      description: 'Safe and effective supplementation' 
    },
  ];

  const nutritionTopics = {
    macros: [
      {
        id: 'protein',
        title: 'Protein Power 💪',
        difficulty: 'Beginner',
        duration: '5 min',
        points: 50,
        content: 'Building blocks for muscle growth and recovery',
        keyPoints: [
          'Aim for 0.8-2g per kg body weight daily',
          'Complete proteins contain all essential amino acids',
          'Best sources: lean meats, fish, eggs, dairy, legumes',
          'Timing: Within 2 hours post-workout for optimal recovery'
        ],
        quiz: {
          question: 'How much protein should a 70kg athlete consume daily?',
          options: ['35-70g', '56-140g', '140-210g', '210-280g'],
          correct: 1,
          explanation: 'Athletes need 0.8-2g per kg body weight, so 70kg × 0.8-2 = 56-140g daily.'
        }
      },
      {
        id: 'carbohydrates',
        title: 'Carb Fuel ⚡',
        difficulty: 'Beginner',
        duration: '6 min',
        points: 50,
        content: 'Your body\'s preferred energy source for training',
        keyPoints: [
          'Primary fuel for high-intensity exercise',
          'Complex carbs provide sustained energy',
          '3-7g per kg body weight for athletes',
          'Best sources: oats, rice, fruits, vegetables'
        ],
        quiz: {
          question: 'Which type of carbohydrate is best for sustained energy?',
          options: ['Simple sugars', 'Complex carbohydrates', 'Fiber', 'Starches only'],
          correct: 1,
          explanation: 'Complex carbohydrates provide steady, long-lasting energy release.'
        }
      },
      {
        id: 'fats',
        title: 'Healthy Fats 🥑',
        difficulty: 'Intermediate',
        duration: '7 min',
        points: 75,
        content: 'Essential for hormone production and nutrient absorption',
        keyPoints: [
          '20-35% of total daily calories',
          'Omega-3 and Omega-6 fatty acids are essential',
          'Support hormone production and recovery',
          'Best sources: nuts, seeds, fish, olive oil, avocado'
        ],
        quiz: {
          question: 'What percentage of daily calories should come from fats?',
          options: ['5-15%', '20-35%', '40-50%', '60-70%'],
          correct: 1,
          explanation: 'Healthy fat intake should comprise 20-35% of total daily calories.'
        }
      }
    ],
    micros: [
      {
        id: 'vitamins',
        title: 'Vital Vitamins 🌟',
        difficulty: 'Beginner',
        duration: '8 min',
        points: 60,
        content: 'Essential nutrients for optimal performance',
        keyPoints: [
          'Vitamin D supports bone health and immune function',
          'B-vitamins aid energy metabolism',
          'Vitamin C boosts immunity and collagen synthesis',
          'Best approach: eat a rainbow of fruits and vegetables'
        ]
      },
      {
        id: 'minerals',
        title: 'Mighty Minerals ⚡',
        difficulty: 'Intermediate',
        duration: '6 min',
        points: 75,
        content: 'Iron, calcium, magnesium and more for peak function',
        keyPoints: [
          'Iron prevents fatigue and supports oxygen transport',
          'Calcium and magnesium for strong bones and muscles',
          'Zinc supports immune function and protein synthesis',
          'Electrolytes (sodium, potassium) maintain fluid balance'
        ]
      }
    ],
    hydration: [
      {
        id: 'water-basics',
        title: 'H2O Essentials 💧',
        difficulty: 'Beginner',
        duration: '4 min',
        points: 40,
        content: 'The foundation of all bodily functions',
        keyPoints: [
          '60% of your body weight is water',
          'Aim for 35ml per kg body weight daily',
          'Increase intake during exercise and hot weather',
          'Clear urine indicates good hydration'
        ]
      },
      {
        id: 'electrolytes',
        title: 'Electrolyte Balance ⚡',
        difficulty: 'Advanced',
        duration: '9 min',
        points: 100,
        content: 'Maintaining proper mineral balance during training',
        keyPoints: [
          'Sodium, potassium, magnesium, and calcium',
          'Lost through sweat during exercise',
          'Critical for muscle contractions and nerve function',
          'Natural sources: coconut water, bananas, salt'
        ]
      }
    ],
    timing: [
      {
        id: 'pre-workout',
        title: 'Pre-Workout Fuel 🚀',
        difficulty: 'Intermediate',
        duration: '7 min',
        points: 75,
        content: 'Optimize energy for training sessions',
        keyPoints: [
          'Eat 1-3 hours before training',
          'Focus on carbohydrates with some protein',
          'Avoid high fiber and fat close to training',
          'Stay hydrated but don\'t overdrink'
        ]
      },
      {
        id: 'post-workout',
        title: 'Recovery Nutrition 🔄',
        difficulty: 'Intermediate',
        duration: '8 min',
        points: 75,
        content: 'Maximize recovery and adaptations',
        keyPoints: [
          'Eat within 2 hours post-workout',
          '3:1 or 4:1 carb to protein ratio',
          'Replenish glycogen stores',
          'Support muscle protein synthesis'
        ]
      }
    ],
    supplements: [
      {
        id: 'basics',
        title: 'Supplement Safety 🛡️',
        difficulty: 'Advanced',
        duration: '10 min',
        points: 100,
        content: 'Evidence-based supplementation approach',
        keyPoints: [
          'Food first, supplements second',
          'Only use third-party tested products',
          'Common beneficial supplements: protein powder, creatine, vitamin D',
          'Consult professionals before starting new supplements'
        ]
      }
    ]
  };

  // Initialize animations
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
    ]).start();
  }, []);

  // Handle refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Sync progress data
      dispatch({ type: 'SYNC_NUTRITION_PROGRESS' });
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  // Complete topic
  const completeTopic = useCallback((topicId) => {
    if (!completedTopics.has(topicId)) {
      const newCompleted = new Set(completedTopics);
      newCompleted.add(topicId);
      setCompletedTopics(newCompleted);
      
      // Add points
      const topic = Object.values(nutritionTopics).flat().find(t => t.id === topicId);
      const points = topic?.points || 50;
      setTotalPoints(prev => prev + points);
      setCurrentStreak(prev => prev + 1);
      
      // Vibration feedback
      Vibration.vibrate(100);
      
      // Check for achievements
      checkAchievements(newCompleted.size, points);
      
      // Dispatch to Redux
      dispatch({
        type: 'UPDATE_NUTRITION_PROGRESS',
        payload: {
          completedTopics: Array.from(newCompleted),
          points: totalPoints + points,
          streak: currentStreak + 1
        }
      });
    }
  }, [completedTopics, totalPoints, currentStreak, dispatch]);

  // Check for new achievements
  const checkAchievements = (completedCount, newPoints) => {
    const achievements = [
      { id: 'first_lesson', threshold: 1, title: 'First Steps', icon: '🎯', description: 'Completed your first nutrition lesson!' },
      { id: 'macros_master', threshold: 3, title: 'Macros Master', icon: '💪', description: 'Mastered macronutrients!' },
      { id: 'nutrition_scholar', threshold: 10, title: 'Nutrition Scholar', icon: '🎓', description: 'Completed 10 lessons!' },
      { id: 'point_collector', threshold: 500, title: 'Point Collector', icon: '⭐', description: 'Earned 500 points!' }
    ];
    
    const newAchievement = achievements.find(a => 
      (a.id === 'point_collector' && totalPoints + newPoints >= a.threshold && totalPoints < a.threshold) ||
      (a.id !== 'point_collector' && completedCount >= a.threshold && completedCount - 1 < a.threshold)
    );
    
    if (newAchievement) {
      setNewAchievement(newAchievement);
      setShowAchievementModal(true);
    }
  };

  // Start quiz
  const startQuiz = (topic) => {
    if (topic.quiz) {
      setSelectedQuiz(topic);
      setShowQuizModal(true);
    }
  };

  // Answer quiz
  const answerQuiz = (selectedAnswer) => {
    const correct = selectedAnswer === selectedQuiz.quiz.correct;
    
    if (correct) {
      Alert.alert(
        '🎉 Correct!',
        selectedQuiz.quiz.explanation,
        [{ text: 'Continue', onPress: () => {
          setShowQuizModal(false);
          completeTopic(selectedQuiz.id);
        }}]
      );
    } else {
      Alert.alert(
        '❌ Not quite right',
        selectedQuiz.quiz.explanation + '\n\nTry reviewing the content again!',
        [{ text: 'OK', onPress: () => setShowQuizModal(false) }]
      );
    }
  };

  // Filter topics based on search
  const filteredTopics = searchQuery
    ? Object.values(nutritionTopics).flat().filter(topic =>
        topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : nutritionTopics[selectedCategory] || [];

  // Calculate progress
  const totalTopics = Object.values(nutritionTopics).flat().length;
  const progressPercentage = (completedTopics.size / totalTopics) * 100;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Animated Header */}
      <Animated.View
        style={{
          transform: [{
            translateY: headerScrollY.interpolate({
              inputRange: [0, 100],
              outputRange: [0, -50],
              extrapolate: 'clamp',
            }),
          }],
        }}
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={{
            paddingTop: 50,
            paddingBottom: SPACING.lg,
            paddingHorizontal: SPACING.md,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
            <IconButton
              icon="arrow-back"
              iconColor="white"
              size={24}
              onPress={() => navigation.goBack()}
            />
            <Text style={[TEXT_STYLES.h2, { color: 'white', flex: 1, textAlign: 'center', marginRight: 40 }]}>
              Nutrition Basics 🥗
            </Text>
          </View>
          
          {/* Progress Overview */}
          <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: SPACING.md, borderRadius: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>{completedTopics.size}</Text>
                <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>Completed</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>{totalPoints}</Text>
                <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>Points</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>{currentStreak} 🔥</Text>
                <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>Streak</Text>
              </View>
            </View>
            <ProgressBar progress={progressPercentage / 100} color="white" style={{ height: 6, borderRadius: 3 }} />
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginTop: SPACING.xs }]}>
              {Math.round(progressPercentage)}% Complete
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Search Bar */}
      <View style={{ paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, backgroundColor: 'white' }}>
        <Searchbar
          placeholder="Search nutrition topics..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={{ elevation: 2 }}
        />
      </View>

      {/* Category Filters */}
      {!searchQuery && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm }}
          style={{ backgroundColor: 'white', maxHeight: 80 }}
        >
          {nutritionCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => setSelectedCategory(category.id)}
              style={{ marginRight: SPACING.sm }}
            >
              <Chip
                selected={selectedCategory === category.id}
                onPress={() => setSelectedCategory(category.id)}
                icon={category.icon}
                mode={selectedCategory === category.id ? 'flat' : 'outlined'}
                style={{
                  backgroundColor: selectedCategory === category.id ? category.color : 'transparent',
                }}
                textStyle={{
                  color: selectedCategory === category.id ? 'white' : category.color,
                }}
              >
                {category.title}
              </Chip>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Topics List */}
      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: headerScrollY } } }], { useNativeDriver: false })}
          contentContainerStyle={{ padding: SPACING.md }}
          showsVerticalScrollIndicator={false}
        >
          {filteredTopics.map((topic, index) => {
            const isCompleted = completedTopics.has(topic.id);
            const difficultyColor = topic.difficulty === 'Beginner' ? COLORS.success : 
                                   topic.difficulty === 'Intermediate' ? '#ff9800' : COLORS.error;

            return (
              <Animated.View
                key={topic.id}
                style={{
                  opacity: fadeAnim,
                  transform: [{
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 50],
                      outputRange: [0, 50 + (index * 10)],
                    }),
                  }],
                }}
              >
                <Card style={{ marginBottom: SPACING.md, elevation: 4 }}>
                  <Card.Content style={{ padding: SPACING.md }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
                      <Avatar.Icon
                        size={40}
                        icon={isCompleted ? 'check-circle' : 'play-circle'}
                        style={{
                          backgroundColor: isCompleted ? COLORS.success : COLORS.primary,
                          marginRight: SPACING.sm,
                        }}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={[TEXT_STYLES.h4, { color: COLORS.text }]}>
                          {topic.title}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                          <Chip
                            mode="outlined"
                            compact
                            style={{
                              borderColor: difficultyColor,
                              marginRight: SPACING.xs,
                            }}
                            textStyle={{ color: difficultyColor, fontSize: 12 }}
                          >
                            {topic.difficulty}
                          </Chip>
                          <Icon name="access-time" size={14} color={COLORS.textSecondary} />
                          <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginLeft: 4 }]}>
                            {topic.duration}
                          </Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: SPACING.sm }}>
                            <Icon name="stars" size={14} color="#ffc107" />
                            <Text style={[TEXT_STYLES.caption, { color: '#ffc107', marginLeft: 2 }]}>
                              {topic.points}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                    
                    <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary, marginBottom: SPACING.sm }]}>
                      {topic.content}
                    </Text>
                    
                    {topic.keyPoints && (
                      <View style={{ marginBottom: SPACING.sm }}>
                        <Text style={[TEXT_STYLES.subtitle, { color: COLORS.text, marginBottom: SPACING.xs }]}>
                          Key Points:
                        </Text>
                        {topic.keyPoints.map((point, idx) => (
                          <View key={idx} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 }}>
                            <Text style={{ color: COLORS.primary, marginRight: 8, marginTop: 2 }}>•</Text>
                            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, flex: 1 }]}>
                              {point}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                    
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      {isCompleted ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                          <Icon name="check-circle" size={20} color={COLORS.success} />
                          <Text style={[TEXT_STYLES.body, { color: COLORS.success, marginLeft: SPACING.xs }]}>
                            Completed! ✨
                          </Text>
                        </View>
                      ) : (
                        <Button
                          mode="contained"
                          onPress={() => {
                            if (topic.quiz) {
                              startQuiz(topic);
                            } else {
                              completeTopic(topic.id);
                            }
                          }}
                          style={{ backgroundColor: COLORS.primary, flex: 1, marginRight: SPACING.sm }}
                          contentStyle={{ paddingVertical: 4 }}
                        >
                          {topic.quiz ? 'Take Quiz' : 'Mark Complete'}
                        </Button>
                      )}
                      
                      {topic.quiz && (
                        <IconButton
                          icon="quiz"
                          size={24}
                          iconColor={isCompleted ? COLORS.success : COLORS.primary}
                          onPress={() => startQuiz(topic)}
                          disabled={!isCompleted && !topic.quiz}
                        />
                      )}
                    </View>
                  </Card.Content>
                </Card>
              </Animated.View>
            );
          })}
          
          {filteredTopics.length === 0 && (
            <View style={{ alignItems: 'center', paddingVertical: SPACING.xl }}>
              <Icon name="search-off" size={64} color={COLORS.textSecondary} />
              <Text style={[TEXT_STYLES.h3, { color: COLORS.textSecondary, marginTop: SPACING.md }]}>
                No topics found
              </Text>
              <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary, textAlign: 'center' }]}>
                Try adjusting your search or explore different categories
              </Text>
            </View>
          )}
          
          {/* Bottom spacing for better scroll experience */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </Animated.View>

      {/* Quiz Modal */}
      <Portal>
        <Modal
          visible={showQuizModal}
          onDismiss={() => setShowQuizModal(false)}
          contentContainerStyle={{
            backgroundColor: 'white',
            margin: SPACING.lg,
            borderRadius: 16,
            padding: SPACING.lg,
            maxHeight: height * 0.8,
          }}
        >
          {selectedQuiz && (
            <ScrollView>
              <View style={{ alignItems: 'center', marginBottom: SPACING.lg }}>
                <Avatar.Icon
                  size={60}
                  icon="quiz"
                  style={{ backgroundColor: COLORS.primary, marginBottom: SPACING.sm }}
                />
                <Text style={[TEXT_STYLES.h3, { color: COLORS.text, textAlign: 'center' }]}>
                  {selectedQuiz.title}
                </Text>
              </View>
              
              <Text style={[TEXT_STYLES.h4, { color: COLORS.text, marginBottom: SPACING.lg }]}>
                {selectedQuiz.quiz.question}
              </Text>
              
              {selectedQuiz.quiz.options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => answerQuiz(index)}
                  style={{
                    backgroundColor: COLORS.surface,
                    padding: SPACING.md,
                    borderRadius: 12,
                    marginBottom: SPACING.sm,
                    borderWidth: 1,
                    borderColor: COLORS.border,
                  }}
                >
                  <Text style={[TEXT_STYLES.body, { color: COLORS.text }]}>
                    {String.fromCharCode(65 + index)}. {option}
                  </Text>
                </TouchableOpacity>
              ))}
              
              <Button
                mode="outlined"
                onPress={() => setShowQuizModal(false)}
                style={{ marginTop: SPACING.lg }}
              >
                Cancel
              </Button>
            </ScrollView>
          )}
        </Modal>
      </Portal>

      {/* Achievement Modal */}
      <Portal>
        <Modal
          visible={showAchievementModal}
          onDismiss={() => setShowAchievementModal(false)}
          contentContainerStyle={{
            backgroundColor: 'white',
            margin: SPACING.lg,
            borderRadius: 16,
            padding: SPACING.xl,
          }}
        >
          {newAchievement && (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 48, marginBottom: SPACING.md }}>
                {newAchievement.icon}
              </Text>
              <Text style={[TEXT_STYLES.h2, { color: COLORS.primary, textAlign: 'center', marginBottom: SPACING.sm }]}>
                Achievement Unlocked!
              </Text>
              <Text style={[TEXT_STYLES.h3, { color: COLORS.text, textAlign: 'center', marginBottom: SPACING.sm }]}>
                {newAchievement.title}
              </Text>
              <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary, textAlign: 'center', marginBottom: SPACING.lg }]}>
                {newAchievement.description}
              </Text>
              <Button
                mode="contained"
                onPress={() => setShowAchievementModal(false)}
                style={{ backgroundColor: COLORS.primary }}
              >
                Awesome! 🎉
              </Button>
            </View>
          )}
        </Modal>
      </Portal>
    </View>
  );
};

export default NutritionBasics;