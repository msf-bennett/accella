import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  Alert,
  RefreshControl,
  StatusBar,
  Vibration,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  Card,
  Button,
  TextInput,
  Avatar,
  IconButton,
  Surface,
  Chip,
  ProgressBar,
  Portal,
  Modal,
  Searchbar,
  FAB,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '@react-native-blur/blur';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const GoalsPreferences = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showCustomGoalModal, setShowCustomGoalModal] = useState(false);
  const [showParentalModal, setShowParentalModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [customGoal, setCustomGoal] = useState('');

  const [goalPreferences, setGoalPreferences] = useState({
    selectedGoals: user?.goals || [],
    completedGoals: user?.completedGoals || [],
    activeGoals: user?.activeGoals || [],
    difficulty: user?.goalDifficulty || 'beginner',
    reminderTime: user?.goalReminders || '17:00',
    weeklyTarget: user?.weeklyTarget || 3,
  });

  const scrollViewRef = useRef();
  const progressAnim = useRef(new Animated.Value(0)).current;

  const goalCategories = [
    { id: 'all', name: 'All Goals', icon: 'star', color: '#667eea' },
    { id: 'fitness', name: 'Fitness', icon: 'fitness-center', color: '#4facfe' },
    { id: 'skills', name: 'Skills', icon: 'sports-soccer', color: '#43e97b' },
    { id: 'fun', name: 'Fun', icon: 'celebration', color: '#f093fb' },
    { id: 'team', name: 'Teamwork', icon: 'group', color: '#ffecd2' },
  ];

  const predefinedGoals = {
    fitness: [
      { id: 1, title: 'Run for 10 minutes', description: 'Build your endurance! 🏃‍♂️', difficulty: 'beginner', points: 50, icon: 'directions-run' },
      { id: 2, title: 'Do 20 jumping jacks', description: 'Get your heart pumping! ❤️', difficulty: 'beginner', points: 30, icon: 'accessibility' },
      { id: 3, title: 'Touch my toes', description: 'Improve flexibility! 🤸‍♀️', difficulty: 'beginner', points: 25, icon: 'self-improvement' },
      { id: 4, title: 'Plank for 30 seconds', description: 'Build core strength! 💪', difficulty: 'intermediate', points: 40, icon: 'fitness-center' },
      { id: 5, title: 'Climb 3 flights of stairs', description: 'Level up your legs! 🦵', difficulty: 'beginner', points: 35, icon: 'stairs' },
    ],
    skills: [
      { id: 6, title: 'Learn a new soccer trick', description: 'Impress your friends! ⚽', difficulty: 'intermediate', points: 60, icon: 'sports-soccer' },
      { id: 7, title: 'Practice dribbling daily', description: 'Master ball control! 🏀', difficulty: 'beginner', points: 40, icon: 'sports-basketball' },
      { id: 8, title: 'Perfect my free throw', description: 'Nail that shot! 🎯', difficulty: 'intermediate', points: 70, icon: 'gps-fixed' },
      { id: 9, title: 'Learn proper form', description: 'Technique is everything! 📐', difficulty: 'beginner', points: 50, icon: 'straighten' },
      { id: 10, title: 'Master a swimming stroke', description: 'Swim like a fish! 🏊‍♀️', difficulty: 'intermediate', points: 80, icon: 'pool' },
    ],
    fun: [
      { id: 11, title: 'High-five teammates', description: 'Spread the positive vibes! ✋', difficulty: 'beginner', points: 20, icon: 'back-hand' },
      { id: 12, title: 'Celebrate small wins', description: 'Every victory counts! 🎉', difficulty: 'beginner', points: 25, icon: 'celebration' },
      { id: 13, title: 'Try a new sport', description: 'Adventure awaits! 🌟', difficulty: 'beginner', points: 100, icon: 'explore' },
      { id: 14, title: 'Dance during warm-up', description: 'Make training fun! 💃', difficulty: 'beginner', points: 30, icon: 'music-note' },
      { id: 15, title: 'Create a victory dance', description: 'Express your style! 🕺', difficulty: 'beginner', points: 40, icon: 'emoji-emotions' },
    ],
    team: [
      { id: 16, title: 'Help a teammate', description: 'Teamwork makes the dream work! 🤝', difficulty: 'beginner', points: 45, icon: 'volunteer-activism' },
      { id: 17, title: 'Encourage others', description: 'Be a positive force! 📢', difficulty: 'beginner', points: 35, icon: 'campaign' },
      { id: 18, title: 'Share equipment nicely', description: 'Sharing is caring! 🤗', difficulty: 'beginner', points: 30, icon: 'share' },
      { id: 19, title: 'Listen to my coach', description: 'Great athletes are great listeners! 👂', difficulty: 'beginner', points: 40, icon: 'hearing' },
      { id: 20, title: 'Include everyone in games', description: 'Nobody left behind! 👫', difficulty: 'beginner', points: 50, icon: 'groups' },
    ],
  };

  const difficultyLevels = [
    { id: 'beginner', name: 'Explorer 🌱', description: 'Perfect for starting your journey!', color: '#43e97b' },
    { id: 'intermediate', name: 'Champion 🏆', description: 'Ready for bigger challenges!', color: '#667eea' },
    { id: 'advanced', name: 'Superstar ⭐', description: 'For the ultimate athletes!', color: '#f5576c' },
  ];

  useEffect(() => {
    // Entrance animation
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

    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: goalPreferences.selectedGoals.length / 5, // Max 5 goals
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [goalPreferences.selectedGoals]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Vibration.vibrate(50);
    }, 1500);
  }, []);

  const getAllGoals = () => {
    return Object.values(predefinedGoals).flat();
  };

  const getFilteredGoals = () => {
    let goals = selectedCategory === 'all' ? getAllGoals() : predefinedGoals[selectedCategory] || [];
    
    if (searchQuery) {
      goals = goals.filter(goal => 
        goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        goal.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return goals;
  };

  const handleGoalToggle = (goal) => {
    const isSelected = goalPreferences.selectedGoals.some(g => g.id === goal.id);
    
    if (isSelected) {
      setGoalPreferences(prev => ({
        ...prev,
        selectedGoals: prev.selectedGoals.filter(g => g.id !== goal.id),
      }));
    } else {
      if (goalPreferences.selectedGoals.length >= 5) {
        Alert.alert(
          "🎯 Goal Limit Reached!",
          "You can have up to 5 active goals. Remove one first to add a new one!",
          [{ text: "Got it! 👍", onPress: () => Vibration.vibrate(25) }]
        );
        return;
      }
      
      setGoalPreferences(prev => ({
        ...prev,
        selectedGoals: [...prev.selectedGoals, goal],
      }));
    }
    
    Vibration.vibrate(25);
  };

  const handleDifficultyChange = (difficulty) => {
    setGoalPreferences(prev => ({
      ...prev,
      difficulty: difficulty,
    }));
    Vibration.vibrate(25);
  };

  const handleCustomGoal = () => {
    if (customGoal.trim().length < 5) {
      Alert.alert(
        "📝 Goal Too Short",
        "Your custom goal needs at least 5 letters to be awesome!",
        [{ text: "OK! ✏️", onPress: () => Vibration.vibrate(25) }]
      );
      return;
    }

    if (goalPreferences.selectedGoals.length >= 5) {
      Alert.alert(
        "🎯 Goal Limit Reached!",
        "You can have up to 5 active goals. Remove one first!",
        [{ text: "Got it! 👍", onPress: () => Vibration.vibrate(25) }]
      );
      return;
    }

    const newGoal = {
      id: Date.now(),
      title: customGoal,
      description: 'Your personal goal! 🌟',
      difficulty: 'custom',
      points: 75,
      icon: 'star',
      isCustom: true,
    };

    setGoalPreferences(prev => ({
      ...prev,
      selectedGoals: [...prev.selectedGoals, newGoal],
    }));

    setCustomGoal('');
    setShowCustomGoalModal(false);
    Vibration.vibrate([25, 50, 25]);

    Alert.alert(
      "🎉 Custom Goal Added!",
      "Your personal goal has been added! Time to crush it!",
      [{ text: "Let's Go! 🚀", onPress: () => Vibration.vibrate(25) }]
    );
  };

  const handleSaveGoals = () => {
    if (goalPreferences.selectedGoals.length === 0) {
      Alert.alert(
        "🎯 No Goals Selected",
        "Pick at least one goal to get started on your awesome journey!",
        [{ text: "Choose Goals! ✨", onPress: () => Vibration.vibrate(25) }]
      );
      return;
    }

    dispatch({ type: 'UPDATE_GOAL_PREFERENCES', payload: goalPreferences });
    
    Alert.alert(
      "🎉 Goals Set Successfully!",
      `Amazing! You've set ${goalPreferences.selectedGoals.length} goals. Time to become a superstar athlete!`,
      [
        { 
          text: "Let's Train! 🚀", 
          onPress: () => {
            Vibration.vibrate([25, 50, 25, 50]);
            navigation.goBack();
          }
        }
      ]
    );
  };

  const getDifficultyColor = (difficulty) => {
    const level = difficultyLevels.find(d => d.id === difficulty);
    return level?.color || COLORS.primary;
  };

  const calculateProgress = () => {
    return (goalPreferences.selectedGoals.length / 5) * 100;
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient 
        colors={['#667eea', '#764ba2']} 
        style={styles.header}
      >
        <Animated.View 
          style={[
            styles.headerContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <View style={styles.headerTop}>
            <IconButton
              icon="arrow-back"
              size={24}
              iconColor="white"
              onPress={() => navigation.goBack()}
            />
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>My Training Goals 🎯</Text>
              <Text style={styles.headerSubtitle}>Dream big, train hard!</Text>
            </View>
            <IconButton
              icon="help"
              size={24}
              iconColor="white"
              onPress={() => setShowParentalModal(true)}
            />
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              Goals Selected: {goalPreferences.selectedGoals.length}/5 🌟
            </Text>
            <Animated.View style={styles.progressBarContainer}>
              <ProgressBar
                progress={progressAnim}
                color="rgba(255,255,255,0.9)"
                style={styles.progressBar}
              />
            </Animated.View>
            <Text style={styles.progressSubtext}>
              {goalPreferences.selectedGoals.length === 0 ? "Let's pick some goals!" :
               goalPreferences.selectedGoals.length < 3 ? "Great start! Add more?" :
               "Perfect! You're ready to train! 🚀"}
            </Text>
          </View>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        ref={scrollViewRef}
        style={styles.content}
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
        {/* Difficulty Level */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <Text style={styles.sectionTitle}>🌟 My Level</Text>
          <Text style={styles.sectionDescription}>
            Choose your adventure level! You can always level up! 📈
          </Text>
          
          <View style={styles.difficultyContainer}>
            {difficultyLevels.map((level) => (
              <TouchableOpacity
                key={level.id}
                onPress={() => handleDifficultyChange(level.id)}
                style={styles.difficultyCard}
              >
                <Card style={[
                  styles.difficultyCardInner,
                  goalPreferences.difficulty === level.id && {
                    borderColor: level.color,
                    borderWidth: 3,
                  }
                ]}>
                  <LinearGradient
                    colors={goalPreferences.difficulty === level.id ? 
                      [level.color, level.color + '99'] : 
                      ['#f8f9fa', '#e9ecef']
                    }
                    style={styles.difficultyGradient}
                  >
                    <Card.Content style={styles.difficultyContent}>
                      <Text style={[
                        styles.difficultyName,
                        { color: goalPreferences.difficulty === level.id ? 'white' : COLORS.text }
                      ]}>
                        {level.name}
                      </Text>
                      <Text style={[
                        styles.difficultyDescription,
                        { color: goalPreferences.difficulty === level.id ? 'rgba(255,255,255,0.9)' : COLORS.textSecondary }
                      ]}>
                        {level.description}
                      </Text>
                      {goalPreferences.difficulty === level.id && (
                        <Icon name="check-circle" size={20} color="white" style={styles.selectedIcon} />
                      )}
                    </Card.Content>
                  </LinearGradient>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Category Filter */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <Text style={styles.sectionTitle}>📂 Goal Categories</Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
          >
            {goalCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => {
                  setSelectedCategory(category.id);
                  Vibration.vibrate(25);
                }}
                style={styles.categoryChip}
              >
                <Surface style={[
                  styles.categorySurface,
                  selectedCategory === category.id && {
                    backgroundColor: category.color,
                  }
                ]}>
                  <Icon 
                    name={category.icon} 
                    size={20} 
                    color={selectedCategory === category.id ? 'white' : category.color} 
                  />
                  <Text style={[
                    styles.categoryText,
                    { color: selectedCategory === category.id ? 'white' : COLORS.text }
                  ]}>
                    {category.name}
                  </Text>
                </Surface>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Search */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <Searchbar
            placeholder="Search for awesome goals! 🔍"
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor={COLORS.primary}
          />
        </Animated.View>

        {/* Available Goals */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <Text style={styles.sectionTitle}>🎯 Available Goals</Text>
          
          {getFilteredGoals().map((goal, index) => {
            const isSelected = goalPreferences.selectedGoals.some(g => g.id === goal.id);
            const isCompleted = goalPreferences.completedGoals.includes(goal.id);
            
            return (
              <TouchableOpacity
                key={goal.id}
                onPress={() => handleGoalToggle(goal)}
                style={styles.goalCard}
              >
                <Card style={[
                  styles.goalCardInner,
                  isSelected && styles.selectedGoalCard,
                  isCompleted && styles.completedGoalCard,
                ]}>
                  <Card.Content style={styles.goalContent}>
                    <View style={styles.goalHeader}>
                      <Surface style={[
                        styles.goalIcon,
                        { backgroundColor: getDifficultyColor(goal.difficulty) + '20' }
                      ]}>
                        <Icon 
                          name={goal.icon} 
                          size={24} 
                          color={getDifficultyColor(goal.difficulty)} 
                        />
                      </Surface>
                      
                      <View style={styles.goalInfo}>
                        <Text style={[
                          styles.goalTitle,
                          isCompleted && styles.completedText
                        ]}>
                          {goal.title}
                        </Text>
                        <Text style={styles.goalDescription}>
                          {goal.description}
                        </Text>
                      </View>
                      
                      <View style={styles.goalActions}>
                        <Chip
                          style={[
                            styles.pointsChip,
                            { backgroundColor: getDifficultyColor(goal.difficulty) + '20' }
                          ]}
                          textStyle={{ 
                            color: getDifficultyColor(goal.difficulty),
                            fontSize: 12,
                            fontWeight: '600'
                          }}
                        >
                          {goal.points}pts
                        </Chip>
                        
                        {isSelected && (
                          <Icon 
                            name="check-circle" 
                            size={28} 
                            color={COLORS.success} 
                            style={styles.selectedIcon}
                          />
                        )}
                        
                        {isCompleted && (
                          <Icon 
                            name="jump-rope" 
                            size={28} 
                            color="#ffd700" 
                            style={styles.completedIcon}
                          />
                        )}
                      </View>
                    </View>
                  </Card.Content>
                </Card>
              </TouchableOpacity>
            );
          })}
        </Animated.View>

        {/* My Active Goals */}
        {goalPreferences.selectedGoals.length > 0 && (
          <Animated.View
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }
            ]}
          >
            <Text style={styles.sectionTitle}>⭐ My Active Goals</Text>
            
            <Card style={styles.activeGoalsCard}>
              <LinearGradient 
                colors={['#4facfe', '#00f2fe']} 
                style={styles.activeGoalsGradient}
              >
                <Card.Content>
                  {goalPreferences.selectedGoals.map((goal, index) => (
                    <View key={goal.id} style={styles.activeGoalItem}>
                      <Icon name={goal.icon} size={20} color="white" />
                      <Text style={styles.activeGoalText}>
                        {goal.title}
                      </Text>
                      <Text style={styles.activeGoalPoints}>
                        {goal.points}pts
                      </Text>
                    </View>
                  ))}
                  
                  <View style={styles.totalPointsContainer}>
                    <Text style={styles.totalPointsText}>
                      Total Possible Points: {goalPreferences.selectedGoals.reduce((sum, goal) => sum + goal.points, 0)} 🏆
                    </Text>
                  </View>
                </Card.Content>
              </LinearGradient>
            </Card>
          </Animated.View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => setShowCustomGoalModal(true)}
        label="Custom Goal"
      />

      {/* Save Button */}
      <Animated.View 
        style={[
          styles.saveButtonContainer,
          { opacity: fadeAnim }
        ]}
      >
        <Button
          mode="contained"
          onPress={handleSaveGoals}
          style={styles.saveButton}
          contentStyle={styles.saveButtonContent}
          labelStyle={styles.saveButtonText}
          disabled={goalPreferences.selectedGoals.length === 0}
        >
          Start My Training Journey! 🚀
        </Button>
      </Animated.View>

      {/* Custom Goal Modal */}
      <Portal>
        <Modal
          visible={showCustomGoalModal}
          onDismiss={() => setShowCustomGoalModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView
            style={styles.modalBlur}
            blurType="light"
            blurAmount={10}
          >
            <Card style={styles.modalCard}>
              <Card.Content style={styles.modalContent}>
                <Icon name="star" size={48} color={COLORS.primary} />
                <Text style={styles.modalTitle}>Create Your Own Goal! ✨</Text>
                <Text style={styles.modalDescription}>
                  What special goal do you want to achieve? Make it awesome!
                </Text>
                
                <TextInput
                  label="My Custom Goal 🎯"
                  value={customGoal}
                  onChangeText={setCustomGoal}
                  mode="outlined"
                  style={styles.modalInput}
                  maxLength={50}
                  placeholder="I want to..."
                  multiline
                />
                
                <View style={styles.modalActions}>
                  <Button
                    mode="outlined"
                    onPress={() => setShowCustomGoalModal(false)}
                    style={styles.modalCancelButton}
                  >
                    Cancel
                  </Button>
                  <Button
                    mode="contained"
                    onPress={handleCustomGoal}
                    style={styles.modalButton}
                    disabled={customGoal.trim().length < 5}
                  >
                    Add Goal! 🌟
                  </Button>
                </View>
              </Card.Content>
            </Card>
          </BlurView>
        </Modal>
      </Portal>

      {/* Help Modal */}
      <Portal>
        <Modal
          visible={showParentalModal}
          onDismiss={() => setShowParentalModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView
            style={styles.modalBlur}
            blurType="light"
            blurAmount={10}
          >
            <Card style={styles.modalCard}>
              <Card.Content style={styles.modalContent}>
                <Icon name="family-restroom" size={48} color={COLORS.primary} />
                <Text style={styles.modalTitle}>Goal Setting Help 🤔</Text>
                <Text style={styles.modalDescription}>
                  🎯 Pick goals that excite you!{'\n'}
                  💪 Start with easier goals and level up{'\n'}
                  🏆 Each goal gives you points when completed{'\n'}
                  👨‍👩‍👧‍👦 Your parents can see your progress{'\n'}
                  🌟 Custom goals are worth 75 points!
                </Text>
                <View style={styles.modalActions}>
                  <Button
                    mode="contained"
                    onPress={() => setShowParentalModal(false)}
                    style={styles.modalButton}
                  >
                    Got it! Thanks! 👍
                  </Button>
                </View>
              </Card.Content>
            </Card>
          </BlurView>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.md,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: SPACING.lg,
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: '700',
    textAlign: 'center',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressText: {
    ...TEXT_STYLES.body,
    color: 'white',
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  progressBarContainer: {
    width: '80%',
    marginVertical: SPACING.xs,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  progressSubtext: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  section: {
    marginVertical: SPACING.lg,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  sectionDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  difficultyContainer: {
    gap: SPACING.md,
  },
  difficultyCard: {
    marginBottom: SPACING.xs,
  },
  difficultyCardInner: {
    elevation: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  difficultyGradient: {
    padding: 0,
  },
  difficultyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
  },
  difficultyName: {
    ...TEXT_STYLES.body,
    fontWeight: '700',
    flex: 1,
  },
  difficultyDescription: {
    ...TEXT_STYLES.caption,
    flex: 2,
    marginLeft: SPACING.md,
  },
  selectedIcon: {
    marginLeft: SPACING.md,
  },
  categoriesScroll: {
    marginBottom: SPACING.md,
  },
  categoryChip: {
    marginRight: SPACING.md,
  },
  categorySurface: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 25,
    elevation: 1,
  },
  categoryText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  searchBar: {
    elevation: 2,
    borderRadius: 25,
  },
  goalCard: {
    marginBottom: SPACING.md,
  },
  goalCardInner: {
    elevation: 2,
    borderRadius: 12,
  },
  selectedGoalCard: {
    borderColor: COLORS.success,
    borderWidth: 2,
  },
  completedGoalCard: {
    opacity: 0.7,
    borderColor: '#ffd700',
    borderWidth: 2,
  },
  goalContent: {
    paddingVertical: SPACING.md,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
  },
  goalInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  goalTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.text,
  },
  goalDescription: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs / 2,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: COLORS.textSecondary,
  },
  goalActions: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  pointsChip: {
    height: 28,
  },
  completedIcon: {
    marginTop: SPACING.xs,
  },
  activeGoalsCard: {
    elevation: 3,
    borderRadius: 16,
    overflow: 'hidden',
  },
  activeGoalsGradient: {
    padding: 0,
  },
  activeGoalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  activeGoalText: {
    ...TEXT_STYLES.body,
    color: 'white',
    fontWeight: '600',
    flex: 1,
    marginLeft: SPACING.md,
  },
  activeGoalPoints: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '700',
  },
  totalPointsContainer: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
  },
  totalPointsText: {
    ...TEXT_STYLES.body,
    color: 'white',
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 80,
    backgroundColor: COLORS.primary,
  },
  saveButtonContainer: {
    position: 'absolute',
    bottom: SPACING.lg,
    left: SPACING.lg,
    right: SPACING.lg,
    zIndex: 1000,
  },
  saveButton: {
    borderRadius: 25,
    elevation: 5,
  },
  saveButtonContent: {
    paddingVertical: SPACING.xs,
  },
  saveButtonText: {
    ...TEXT_STYLES.body,
    fontWeight: '700',
  },
  bottomPadding: {
    height: 120,
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
  modalCard: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 20,
    elevation: 5,
  },
  modalContent: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  modalTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  modalDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  modalInput: {
    width: '100%',
    marginBottom: SPACING.lg,
    backgroundColor: 'transparent',
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    width: '100%',
  },
  modalButton: {
    borderRadius: 25,
    flex: 1,
  },
  modalCancelButton: {
    borderRadius: 25,
    flex: 1,
  },
});

export default GoalsPreferences;