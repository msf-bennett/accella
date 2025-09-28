import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  StatusBar,
  Animated,
  TouchableOpacity,
  RefreshControl,
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
  FAB,
  Surface,
  Portal,
  Modal,
  TextInput,
  Searchbar,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';

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
  disabled: '#cccccc',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  subtitle: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textSecondary },
  small: { fontSize: 12, color: COLORS.textSecondary },
};

const { width, height } = Dimensions.get('window');

const SmartGoalSetting = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const goals = useSelector(state => state.goals.childGoals || []);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Animation references
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  // State management
  const [selectedSport, setSelectedSport] = useState('');
  const [selectedAge, setSelectedAge] = useState(user?.age || 8);
  const [selectedLevel, setSelectedLevel] = useState('beginner');
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [showAIModal, setShowAIModal] = useState(false);
  const [goalInput, setGoalInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [points, setPoints] = useState(user?.points || 0);
  const [streak, setStreak] = useState(user?.goalStreak || 0);

  // Sports data for children
  const childSports = [
    { id: 'soccer', name: 'Soccer ⚽', color: '#4CAF50', icon: 'sports-soccer' },
    { id: 'basketball', name: 'Basketball 🏀', color: '#FF9800', icon: 'sports-basketball' },
    { id: 'swimming', name: 'Swimming 🏊', color: '#03A9F4', icon: 'pool' },
    { id: 'tennis', name: 'Tennis 🎾', color: '#9C27B0', icon: 'sports-tennis' },
    { id: 'running', name: 'Running 🏃', color: '#F44336', icon: 'directions-run' },
    { id: 'gymnastics', name: 'Gymnastics 🤸', color: '#E91E63', icon: 'accessibility' },
    { id: 'martial_arts', name: 'Martial Arts 🥋', color: '#795548', icon: 'sports-kabaddi' },
    { id: 'dance', name: 'Dance 💃', color: '#FF5722', icon: 'music-note' },
  ];

  // Age-appropriate goal templates
  const goalTemplates = {
    beginner: [
      { id: 'fun_first', text: 'Have fun while learning! 😄', points: 50, icon: 'emoji-emotions' },
      { id: 'attend_sessions', text: 'Attend 3 sessions this week 📅', points: 100, icon: 'event' },
      { id: 'make_friends', text: 'Make new sports friends 👫', points: 75, icon: 'group' },
      { id: 'learn_basics', text: 'Learn basic skills 📚', points: 125, icon: 'school' },
    ],
    intermediate: [
      { id: 'improve_technique', text: 'Improve my technique 🎯', points: 150, icon: 'trending-up' },
      { id: 'daily_practice', text: 'Practice every day for 30 mins ⏰', points: 200, icon: 'access-time' },
      { id: 'team_player', text: 'Be a great team player 🤝', points: 125, icon: 'groups' },
      { id: 'competition_ready', text: 'Get ready for competitions 🏆', points: 175, icon: 'jump-rope' },
    ],
    advanced: [
      { id: 'leadership', text: 'Help younger players learn 👨‍🏫', points: 200, icon: 'supervisor-account' },
      { id: 'performance_goals', text: 'Achieve personal best records 📈', points: 250, icon: 'bar-chart' },
      { id: 'consistency', text: 'Train consistently for 4 weeks 💪', points: 300, icon: 'fitness-center' },
      { id: 'mentor_role', text: 'Become a mentor for beginners 🌟', points: 225, icon: 'star' },
    ],
  };

  // AI-generated suggestions based on child's profile
  const generateAISuggestions = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate AI processing with child-friendly suggestions
      const suggestions = [
        {
          id: 'personalized_1',
          title: `Master ${selectedSport} Basics! 🌟`,
          description: `Perfect for ${selectedAge}-year-olds! Let's make learning fun and exciting.`,
          goals: goalTemplates[selectedLevel].slice(0, 2),
          estimatedTime: '4 weeks',
          difficulty: selectedLevel,
          funFactor: '⭐⭐⭐⭐⭐',
          parentApprovalNeeded: selectedAge < 10,
        },
        {
          id: 'personalized_2',
          title: 'Fitness Adventure Quest! 🗺️',
          description: 'Turn fitness into an exciting adventure with challenges and rewards!',
          goals: [
            { id: 'adventure_1', text: 'Complete 10 mini-challenges 🎮', points: 150, icon: 'videogame-asset' },
            { id: 'adventure_2', text: 'Unlock 3 achievement badges 🥇', points: 200, icon: 'military-tech' },
          ],
          estimatedTime: '6 weeks',
          difficulty: 'fun',
          funFactor: '⭐⭐⭐⭐⭐',
          parentApprovalNeeded: false,
        },
        {
          id: 'personalized_3',
          title: 'Social Sports Champion! 👥',
          description: 'Focus on teamwork, friendship, and having fun with others!',
          goals: goalTemplates[selectedLevel].filter(g => g.id.includes('friends') || g.id.includes('team')),
          estimatedTime: '3 weeks',
          difficulty: 'easy',
          funFactor: '⭐⭐⭐⭐⭐',
          parentApprovalNeeded: false,
        },
      ];

      setAiSuggestions(suggestions);
      setShowAIModal(true);
    } catch (error) {
      Alert.alert('Oops! 😅', 'The AI coach is taking a break. Try again in a moment!');
    }
    setLoading(false);
  }, [selectedSport, selectedAge, selectedLevel]);

  // Initialize animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: (currentStep + 1) / 4,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [currentStep]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
      Vibration.vibrate(50);
    }, 1000);
  }, []);

  const handleSportSelect = (sport) => {
    setSelectedSport(sport.id);
    Vibration.vibrate(50);
    setCurrentStep(1);
  };

  const handleLevelSelect = (level) => {
    setSelectedLevel(level);
    Vibration.vibrate(50);
    setCurrentStep(2);
  };

  const handleGoalToggle = (goal) => {
    const isSelected = selectedGoals.find(g => g.id === goal.id);
    if (isSelected) {
      setSelectedGoals(selectedGoals.filter(g => g.id !== goal.id));
    } else {
      setSelectedGoals([...selectedGoals, goal]);
      // Add points for selecting goals
      setPoints(prev => prev + 10);
    }
    Vibration.vibrate(30);
  };

  const handleAISuggestionSelect = (suggestion) => {
    setSelectedGoals(suggestion.goals);
    setShowAIModal(false);
    setCurrentStep(3);
    Alert.alert(
      'Great Choice! 🎉',
      `You've selected "${suggestion.title}". Let's start your journey!`,
      [{ text: 'Let\'s Go! 🚀', style: 'default' }]
    );
  };

  const saveGoals = () => {
    if (selectedGoals.length === 0) {
      Alert.alert('Hold on! 🤔', 'Please select at least one goal to continue your adventure!');
      return;
    }

    Alert.alert(
      'Goals Saved! 🎉',
      `Awesome! You've set ${selectedGoals.length} goals. Your coach and parents will be notified!`,
      [
        {
          text: 'View My Goals 📋',
          onPress: () => navigation.navigate('GoalTracking'),
        },
      ]
    );

    // Add completion points
    setPoints(prev => prev + 100);
    setStreak(prev => prev + 1);
  };

  const renderHeader = () => (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.headerContent}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={[TEXT_STYLES.title, { color: 'white', flex: 1, textAlign: 'center' }]}>
          AI Goal Setting 🎯
        </Text>
        <View style={styles.pointsBadge}>
          <Icon name="star" size={16} color="#FFD700" />
          <Text style={styles.pointsText}>{points}</Text>
        </View>
      </View>
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>Step {currentStep + 1} of 4</Text>
        <Animated.View style={styles.progressBarContainer}>
          <Animated.View 
            style={[
              styles.progressBarFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </Animated.View>
      </View>
    </LinearGradient>
  );

  const renderSportSelection = () => (
    <Surface style={styles.stepContainer}>
      <Text style={[TEXT_STYLES.subtitle, styles.stepTitle]}>
        What sport do you love? 🏃‍♀️
      </Text>
      <Text style={[TEXT_STYLES.caption, styles.stepDescription]}>
        Pick your favorite sport to get started!
      </Text>
      <View style={styles.sportsGrid}>
        {childSports.map((sport) => (
          <TouchableOpacity
            key={sport.id}
            style={[
              styles.sportCard,
              { backgroundColor: sport.color },
              selectedSport === sport.id && styles.selectedSportCard,
            ]}
            onPress={() => handleSportSelect(sport)}
          >
            <Icon name={sport.icon} size={32} color="white" />
            <Text style={styles.sportName}>{sport.name}</Text>
            {selectedSport === sport.id && (
              <Icon name="check-circle" size={20} color="white" style={styles.checkIcon} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </Surface>
  );

  const renderLevelSelection = () => (
    <Surface style={styles.stepContainer}>
      <Text style={[TEXT_STYLES.subtitle, styles.stepTitle]}>
        How would you describe yourself? 🤔
      </Text>
      <Text style={[TEXT_STYLES.caption, styles.stepDescription]}>
        Don't worry, you can always level up!
      </Text>
      <View style={styles.levelContainer}>
        {[
          { id: 'beginner', name: 'Just Starting! 🌱', desc: 'New to sports and excited to learn' },
          { id: 'intermediate', name: 'Getting Better! 📈', desc: 'I know some basics and want to improve' },
          { id: 'advanced', name: 'Super Star! ⭐', desc: 'I\'m experienced and ready for challenges' },
        ].map((level) => (
          <TouchableOpacity
            key={level.id}
            style={[
              styles.levelCard,
              selectedLevel === level.id && styles.selectedLevelCard,
            ]}
            onPress={() => handleLevelSelect(level.id)}
          >
            <Text style={styles.levelName}>{level.name}</Text>
            <Text style={styles.levelDesc}>{level.desc}</Text>
            {selectedLevel === level.id && (
              <Icon name="check-circle" size={24} color={COLORS.primary} style={styles.levelCheck} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </Surface>
  );

  const renderGoalSelection = () => (
    <View>
      <Surface style={styles.stepContainer}>
        <Text style={[TEXT_STYLES.subtitle, styles.stepTitle]}>
          What do you want to achieve? 🎯
        </Text>
        <Text style={[TEXT_STYLES.caption, styles.stepDescription]}>
          Pick goals that excite you! Each goal earns you points ⭐
        </Text>
        
        <Button
          mode="contained"
          onPress={generateAISuggestions}
          loading={loading}
          style={styles.aiButton}
          contentStyle={styles.aiButtonContent}
          labelStyle={styles.aiButtonLabel}
        >
          🤖 Get AI Suggestions
        </Button>

        <View style={styles.goalsContainer}>
          {goalTemplates[selectedLevel]?.map((goal) => (
            <TouchableOpacity
              key={goal.id}
              style={[
                styles.goalCard,
                selectedGoals.find(g => g.id === goal.id) && styles.selectedGoalCard,
              ]}
              onPress={() => handleGoalToggle(goal)}
            >
              <Icon name={goal.icon} size={24} color={COLORS.primary} />
              <View style={styles.goalContent}>
                <Text style={styles.goalText}>{goal.text}</Text>
                <View style={styles.goalPoints}>
                  <Icon name="star" size={16} color="#FFD700" />
                  <Text style={styles.goalPointsText}>{goal.points} points</Text>
                </View>
              </View>
              {selectedGoals.find(g => g.id === goal.id) && (
                <Icon name="check-circle" size={24} color={COLORS.success} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </Surface>
    </View>
  );

  const renderAIModal = () => (
    <Portal>
      <Modal
        visible={showAIModal}
        onDismiss={() => setShowAIModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.modalBlur} blurType="light" blurAmount={10}>
          <Text style={[TEXT_STYLES.title, styles.modalTitle]}>
            AI Recommendations! 🤖✨
          </Text>
          <ScrollView style={styles.suggestionsList}>
            {aiSuggestions.map((suggestion) => (
              <TouchableOpacity
                key={suggestion.id}
                style={styles.suggestionCard}
                onPress={() => handleAISuggestionSelect(suggestion)}
              >
                <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
                <Text style={styles.suggestionDesc}>{suggestion.description}</Text>
                <View style={styles.suggestionDetails}>
                  <Chip icon="schedule" compact style={styles.suggestionChip}>
                    {suggestion.estimatedTime}
                  </Chip>
                  <Text style={styles.funFactor}>{suggestion.funFactor}</Text>
                </View>
                {suggestion.parentApprovalNeeded && (
                  <Chip icon="family-restroom" compact style={styles.parentChip}>
                    Parent approval needed
                  </Chip>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Button
            mode="outlined"
            onPress={() => setShowAIModal(false)}
            style={styles.modalCloseButton}
          >
            I'll choose myself 😊
          </Button>
        </BlurView>
      </Modal>
    </Portal>
  );

  const renderSummary = () => (
    <Surface style={styles.stepContainer}>
      <Text style={[TEXT_STYLES.subtitle, styles.stepTitle]}>
        You're All Set! 🎉
      </Text>
      <Text style={[TEXT_STYLES.caption, styles.stepDescription]}>
        Here's your personalized plan:
      </Text>
      
      <View style={styles.summaryContainer}>
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text style={styles.summaryLabel}>Sport:</Text>
            <Text style={styles.summaryValue}>
              {childSports.find(s => s.id === selectedSport)?.name || 'Not selected'}
            </Text>
            
            <Text style={styles.summaryLabel}>Level:</Text>
            <Text style={styles.summaryValue}>{selectedLevel}</Text>
            
            <Text style={styles.summaryLabel}>Goals Selected:</Text>
            {selectedGoals.map((goal) => (
              <View key={goal.id} style={styles.summaryGoal}>
                <Icon name={goal.icon} size={16} color={COLORS.primary} />
                <Text style={styles.summaryGoalText}>{goal.text}</Text>
                <Text style={styles.summaryGoalPoints}>+{goal.points}⭐</Text>
              </View>
            ))}
          </Card.Content>
        </Card>
        
        <View style={styles.totalPoints}>
          <Text style={styles.totalPointsText}>
            Total Points Available: {selectedGoals.reduce((sum, goal) => sum + goal.points, 0)} ⭐
          </Text>
        </View>
      </View>
    </Surface>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <ScrollView
        style={styles.scrollContainer}
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
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {currentStep === 0 && renderSportSelection()}
          {currentStep === 1 && renderLevelSelection()}
          {currentStep === 2 && renderGoalSelection()}
          {currentStep === 3 && renderSummary()}
        </Animated.View>
      </ScrollView>

      {renderAIModal()}

      {currentStep === 3 && (
        <FAB
          icon="save"
          label="Save My Goals! 🎯"
          style={styles.fab}
          onPress={saveGoals}
          color="white"
          customSize={60}
        />
      )}

      {currentStep > 0 && currentStep < 3 && (
        <Button
          mode="contained"
          onPress={() => setCurrentStep(currentStep + 1)}
          style={styles.nextButton}
          contentStyle={styles.nextButtonContent}
          labelStyle={styles.nextButtonLabel}
        >
          Next Step! 🚀
        </Button>
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
    paddingTop: StatusBar.currentHeight + SPACING.md,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
  },
  pointsText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: SPACING.xs,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressText: {
    color: 'white',
    fontSize: 14,
    marginBottom: SPACING.xs,
  },
  progressBarContainer: {
    width: width - SPACING.xl,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 2,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
  },
  stepContainer: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: 16,
    elevation: 2,
  },
  stepTitle: {
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  stepDescription: {
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  sportsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sportCard: {
    width: (width - SPACING.xl * 2 - SPACING.md) / 2,
    aspectRatio: 1,
    borderRadius: 16,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    elevation: 4,
  },
  selectedSportCard: {
    borderWidth: 3,
    borderColor: 'white',
  },
  sportName: {
    color: 'white',
    fontWeight: 'bold',
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  checkIcon: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
  },
  levelContainer: {
    gap: SPACING.md,
  },
  levelCard: {
    padding: SPACING.md,
    borderRadius: 12,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: COLORS.disabled,
  },
  selectedLevelCard: {
    borderColor: COLORS.primary,
    backgroundColor: '#f0f4ff',
  },
  levelName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  levelDesc: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  levelCheck: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
  },
  aiButton: {
    marginBottom: SPACING.lg,
    borderRadius: 25,
  },
  aiButtonContent: {
    height: 50,
  },
  aiButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  goalsContainer: {
    gap: SPACING.md,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 12,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: COLORS.disabled,
  },
  selectedGoalCard: {
    borderColor: COLORS.success,
    backgroundColor: '#f0fff0',
  },
  goalContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  goalText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  goalPoints: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalPointsText: {
    marginLeft: SPACING.xs,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBlur: {
    width: width - SPACING.xl,
    maxHeight: height * 0.8,
    borderRadius: 20,
    padding: SPACING.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  suggestionsList: {
    maxHeight: height * 0.5,
  },
  suggestionCard: {
    padding: SPACING.md,
    borderRadius: 12,
    backgroundColor: 'white',
    marginBottom: SPACING.md,
    elevation: 2,
  },
  suggestionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  suggestionDesc: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  suggestionDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  suggestionChip: {
    backgroundColor: COLORS.primary,
  },
  funFactor: {
    fontSize: 18,
  },
  parentChip: {
    backgroundColor: COLORS.warning,
  },
  modalCloseButton: {
    marginTop: SPACING.md,
  },
  summaryContainer: {
    gap: SPACING.md,
  },
  summaryCard: {
    elevation: 2,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  summaryValue: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  summaryGoal: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  summaryGoalText: {
    flex: 1,
    marginLeft: SPACING.sm,
    color: COLORS.text,
  },
  summaryGoalPoints: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  totalPoints: {
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.success,
    borderRadius: 12,
  },
  totalPointsText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  nextButton: {
    margin: SPACING.md,
    borderRadius: 25,
  },
  nextButtonContent: {
    height: 50,
  },
  nextButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SmartGoalSetting;