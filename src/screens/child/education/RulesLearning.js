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
  Portal,
  Modal,
  Searchbar,
  Badge,
  Divider,
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
  rules: '#E91E63',
  info: '#2196F3',
  beginner: '#4CAF50',
  intermediate: '#FF9800',
  advanced: '#F44336',
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

const RulesLearning = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, rulesProgress, bookmarkedRules, achievements } = useSelector(
    (state) => ({
      user: state.auth.user,
      rulesProgress: state.education.rulesProgress || {},
      bookmarkedRules: state.education.bookmarkedRules || [],
      achievements: state.education.achievements || [],
    })
  );

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [animatedValue] = useState(new Animated.Value(0));
  const [flipAnim] = useState(new Animated.Value(0));

  // Mock rules data with interactive content
  const mockRules = [
    {
      id: 1,
      title: 'Football Scoring System 🏈',
      sport: 'Football',
      difficulty: 'Beginner',
      category: 'Scoring',
      estimatedTime: '5 min',
      points: 50,
      description: 'Learn how points are scored in American football',
      color: '#4CAF50',
      icon: 'sports-football',
      completed: true,
      progress: 100,
      bookmarked: false,
      steps: [
        {
          id: 1,
          title: 'Touchdown - 6 Points',
          content: 'A touchdown is worth 6 points and occurs when a player carries the ball into the end zone or catches it there.',
          image: '🏈➡️🏁',
          tip: 'The end zone is the area at each end of the field where touchdowns are scored!',
          interactive: {
            type: 'drag_drop',
            question: 'Drag the football to the end zone to score!',
            correctZone: 'endzone'
          }
        },
        {
          id: 2,
          title: 'Extra Point - 1 Point',
          content: 'After a touchdown, teams can kick an extra point through the goal posts for 1 additional point.',
          image: '🦵⚽🥅',
          tip: 'Most teams choose the extra point kick because it\'s easier than a 2-point conversion!',
          interactive: {
            type: 'multiple_choice',
            question: 'How many points is an extra point worth?',
            options: ['1 point', '2 points', '3 points', '6 points'],
            correct: 0
          }
        },
        {
          id: 3,
          title: 'Field Goal - 3 Points',
          content: 'A field goal is worth 3 points and is scored by kicking the ball through the goal posts from anywhere on the field.',
          image: '🦵⚽🥅',
          tip: 'Field goals are often attempted when a team can\'t reach the end zone!',
          interactive: {
            type: 'slider',
            question: 'How many points for a field goal?',
            min: 1,
            max: 6,
            correct: 3
          }
        },
        {
          id: 4,
          title: 'Safety - 2 Points',
          content: 'A safety occurs when the offensive team is tackled in their own end zone, giving the defense 2 points.',
          image: '🛡️2️⃣',
          tip: 'Safeties are rare but exciting plays that can change the game!',
          interactive: {
            type: 'true_false',
            question: 'True or False: A safety gives the defense 2 points.',
            correct: true
          }
        }
      ]
    },
    {
      id: 2,
      title: 'Basketball Court Positions 🏀',
      sport: 'Basketball',
      difficulty: 'Intermediate',
      category: 'Positions',
      estimatedTime: '7 min',
      points: 75,
      description: 'Understand the five key positions in basketball',
      color: '#FF9800',
      icon: 'sports-basketball',
      completed: false,
      progress: 0,
      bookmarked: true,
      steps: [
        {
          id: 1,
          title: 'Point Guard (PG)',
          content: 'The point guard is like the quarterback of basketball - they run plays and distribute the ball.',
          image: '🏀👨‍💼',
          tip: 'Point guards are usually the shortest but smartest players on the court!',
          interactive: {
            type: 'matching',
            question: 'Match the position to its role',
            pairs: [
              { left: 'Point Guard', right: 'Runs plays' },
              { left: 'Center', right: 'Plays near basket' }
            ]
          }
        }
      ]
    },
    {
      id: 3,
      title: 'Soccer Offside Rule ⚽',
      sport: 'Soccer',
      difficulty: 'Advanced',
      category: 'Rules',
      estimatedTime: '8 min',
      points: 100,
      description: 'Master the complex but important offside rule in soccer',
      color: '#2196F3',
      icon: 'sports-soccer',
      completed: false,
      progress: 25,
      bookmarked: false,
      steps: [
        {
          id: 1,
          title: 'What is Offside?',
          content: 'A player is offside if they are nearer to the goal line than both the ball and the second-last opponent when the ball is played by a teammate.',
          image: '⚽👤📏',
          tip: 'Remember: you can\'t be offside in your own half of the field!',
          interactive: {
            type: 'visual_quiz',
            question: 'Is this player offside?',
            scenario: 'Player A is behind the defender when their teammate passes'
          }
        }
      ]
    },
    {
      id: 4,
      title: 'Tennis Scoring System 🎾',
      sport: 'Tennis',
      difficulty: 'Intermediate',
      category: 'Scoring',
      estimatedTime: '6 min',
      points: 80,
      description: 'Learn the unique scoring system used in tennis',
      color: '#9C27B0',
      icon: 'sports-tennis',
      completed: false,
      progress: 0,
      bookmarked: false,
      steps: [
        {
          id: 1,
          title: 'Game Scoring: 15, 30, 40',
          content: 'Tennis uses a unique scoring system: 0 (love), 15, 30, 40, and game. The first to win 4 points wins the game.',
          image: '🎾📊',
          tip: 'Zero is called "love" in tennis - no one knows exactly why!',
          interactive: {
            type: 'sequence',
            question: 'Put the tennis scores in order',
            items: ['Love', '15', '30', '40', 'Game'],
            correct: [0, 1, 2, 3, 4]
          }
        }
      ]
    },
    {
      id: 5,
      title: 'Baseball Diamond Basics ⚾',
      sport: 'Baseball',
      difficulty: 'Beginner',
      category: 'Field',
      estimatedTime: '4 min',
      points: 40,
      description: 'Understand the baseball field layout and base running',
      color: '#795548',
      icon: 'sports-baseball',
      completed: true,
      progress: 100,
      bookmarked: true,
      steps: [
        {
          id: 1,
          title: 'The Four Bases',
          content: 'Baseball has four bases: home plate, first base, second base, and third base, arranged in a diamond shape.',
          image: '⚾💎',
          tip: 'Players run counter-clockwise around the bases!',
          interactive: {
            type: 'path_trace',
            question: 'Trace the path a runner takes around the bases',
            startPoint: 'home',
            endPoint: 'home'
          }
        }
      ]
    }
  ];

  const sports = ['All', 'Football', 'Basketball', 'Soccer', 'Tennis', 'Baseball'];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredRules = mockRules.filter((rule) => {
    const matchesSearch = rule.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         rule.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport = selectedSport === 'All' || rule.sport === selectedSport;
    const matchesDifficulty = selectedDifficulty === 'All' || rule.difficulty === selectedDifficulty;
    return matchesSearch && matchesSport && matchesDifficulty;
  });

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

  const handleRulePress = (rule) => {
    setSelectedRule(rule);
    setCurrentStep(0);
    setCompletedSteps(new Set());
    setShowRuleModal(true);
  };

  const handleStepComplete = () => {
    const newCompletedSteps = new Set(completedSteps);
    newCompletedSteps.add(currentStep);
    setCompletedSteps(newCompletedSteps);

    if (currentStep < selectedRule.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Rule completed
      Alert.alert(
        '🎉 Rule Mastered!',
        `Congratulations! You've completed "${selectedRule.title}" and earned ${selectedRule.points} points!`,
        [
          {
            text: 'Continue Learning',
            onPress: () => {
              setShowRuleModal(false);
              // Update progress in state
            }
          }
        ]
      );
    }
  };

  const handleBookmark = (rule) => {
    Alert.alert(
      rule.bookmarked ? '📌 Remove Bookmark' : '📌 Add Bookmark',
      rule.bookmarked ? 'Remove this rule from your bookmarks?' : 'Add this rule to your bookmarks?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: rule.bookmarked ? 'Remove' : 'Add',
          onPress: () => {
            Alert.alert(
              '✅ Success!',
              rule.bookmarked ? 'Rule removed from bookmarks' : 'Rule added to bookmarks!'
            );
          }
        }
      ]
    );
  };

  const renderRuleCard = ({ item: rule }) => {
    const difficultyColor = {
      'Beginner': COLORS.beginner,
      'Intermediate': COLORS.intermediate,
      'Advanced': COLORS.advanced
    }[rule.difficulty];

    return (
      <Animated.View
        style={[
          styles.ruleCard,
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
        <TouchableOpacity onPress={() => handleRulePress(rule)}>
          <Card style={[styles.card, { borderLeftColor: rule.color, borderLeftWidth: 4 }]}>
            <LinearGradient
              colors={[rule.color + '15', COLORS.white]}
              style={styles.cardGradient}
            >
              <Card.Content style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <View style={styles.ruleInfo}>
                    <View style={styles.titleRow}>
                      <Text style={styles.ruleTitle}>{rule.title}</Text>
                      <View style={styles.statusBadges}>
                        {rule.completed && (
                          <Badge size={20} style={{ backgroundColor: COLORS.success }}>
                            ✓
                          </Badge>
                        )}
                        {rule.bookmarked && (
                          <Badge size={20} style={{ backgroundColor: COLORS.warning, marginLeft: 4 }}>
                            📌
                          </Badge>
                        )}
                      </View>
                    </View>
                    <View style={styles.metaRow}>
                      <Chip
                        mode="flat"
                        style={[styles.difficultyChip, { backgroundColor: difficultyColor + '30' }]}
                        textStyle={{ color: difficultyColor, fontWeight: 'bold' }}
                        compact
                      >
                        {rule.difficulty}
                      </Chip>
                      <Text style={styles.estimatedTime}>{rule.estimatedTime}</Text>
                      <Text style={styles.category}>{rule.category}</Text>
                    </View>
                  </View>
                  <Avatar.Icon
                    size={50}
                    icon={rule.icon}
                    style={{ backgroundColor: rule.color + '30' }}
                    color={rule.color}
                  />
                </View>

                <Text style={styles.ruleDescription}>{rule.description}</Text>

                {rule.progress > 0 && (
                  <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressText}>Progress</Text>
                      <Text style={styles.progressPercentage}>{rule.progress}%</Text>
                    </View>
                    <ProgressBar
                      progress={rule.progress / 100}
                      color={rule.color}
                      style={styles.progressBar}
                    />
                  </View>
                )}

                <View style={styles.actionSection}>
                  <View style={styles.pointsRow}>
                    <Icon name="star" size={20} color={COLORS.warning} />
                    <Text style={styles.pointsText}>+{rule.points} pts</Text>
                  </View>
                  <View style={styles.actionButtons}>
                    <IconButton
                      icon={rule.bookmarked ? 'bookmark' : 'bookmark-border'}
                      size={24}
                      iconColor={rule.bookmarked ? COLORS.warning : COLORS.textSecondary}
                      onPress={() => handleBookmark(rule)}
                    />
                    <Button
                      mode={rule.completed ? 'outlined' : 'contained'}
                      onPress={() => handleRulePress(rule)}
                      style={[
                        styles.actionButton,
                        !rule.completed && { backgroundColor: rule.color },
                      ]}
                      labelStyle={styles.buttonLabel}
                      icon={rule.completed ? 'refresh' : rule.progress > 0 ? 'play-arrow' : 'school'}
                    >
                      {rule.completed ? 'Review' : rule.progress > 0 ? 'Continue' : 'Learn'}
                    </Button>
                  </View>
                </View>
              </Card.Content>
            </LinearGradient>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderFilterChip = (items, selected, setSelected, type) => {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        {items.map((item) => (
          <Chip
            key={item}
            mode={selected === item ? 'flat' : 'outlined'}
            selected={selected === item}
            onPress={() => setSelected(item)}
            style={[
              styles.filterChip,
              selected === item && { backgroundColor: COLORS.primary + '20' },
            ]}
            textStyle={[
              styles.filterChipText,
              selected === item && { color: COLORS.primary, fontWeight: 'bold' },
            ]}
          >
            {item}
          </Chip>
        ))}
      </ScrollView>
    );
  };

  const renderStatsOverview = () => {
    const totalRules = mockRules.length;
    const completedRules = mockRules.filter(r => r.completed).length;
    const inProgressRules = mockRules.filter(r => r.progress > 0 && r.progress < 100).length;
    const totalPoints = mockRules.reduce((sum, rule) => {
      return rule.completed ? sum + rule.points : sum;
    }, 0);

    return (
      <Card style={styles.overviewCard}>
        <LinearGradient colors={[COLORS.rules, COLORS.secondary]} style={styles.overviewGradient}>
          <Card.Content style={styles.overviewContent}>
            <Text style={styles.overviewTitle}>📚 Rules Learning Progress</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statBigNumber}>{completedRules}</Text>
                <Text style={styles.statSmallLabel}>Mastered</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statBigNumber}>{inProgressRules}</Text>
                <Text style={styles.statSmallLabel}>Learning</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statBigNumber}>{totalPoints}</Text>
                <Text style={styles.statSmallLabel}>Points</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statBigNumber}>{totalRules - completedRules}</Text>
                <Text style={styles.statSmallLabel}>Remaining</Text>
              </View>
            </View>
          </Card.Content>
        </LinearGradient>
      </Card>
    );
  };

  const renderRuleContent = () => {
    if (!selectedRule || !selectedRule.steps[currentStep]) return null;

    const step = selectedRule.steps[currentStep];
    const progress = (currentStep + 1) / selectedRule.steps.length;

    return (
      <ScrollView style={styles.ruleContentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.stepHeader}>
          <View style={styles.stepProgress}>
            <Text style={styles.stepText}>
              Step {currentStep + 1} of {selectedRule.steps.length}
            </Text>
            <ProgressBar
              progress={progress}
              color={selectedRule.color}
              style={styles.stepProgressBar}
            />
          </View>
          <IconButton
            icon="close"
            size={24}
            onPress={() => setShowRuleModal(false)}
          />
        </View>

        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>{step.title}</Text>
          
          <View style={styles.visualSection}>
            <Text style={styles.visualEmoji}>{step.image}</Text>
          </View>

          <Text style={styles.stepDescription}>{step.content}</Text>

          <Surface style={styles.tipContainer}>
            <View style={styles.tipHeader}>
              <Icon name="lightbulb" size={20} color={COLORS.warning} />
              <Text style={styles.tipTitle}>Pro Tip!</Text>
            </View>
            <Text style={styles.tipText}>{step.tip}</Text>
          </Surface>

          {step.interactive && (
            <View style={styles.interactiveSection}>
              <Text style={styles.interactiveTitle}>🎯 Test Your Knowledge</Text>
              <Text style={styles.interactiveQuestion}>{step.interactive.question}</Text>
              
              {step.interactive.type === 'multiple_choice' && (
                <View style={styles.optionsContainer}>
                  {step.interactive.options.map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.optionButton}
                      onPress={() => {
                        if (index === step.interactive.correct) {
                          Alert.alert('✅ Correct!', 'Great job! You got it right!', [
                            { text: 'Continue', onPress: handleStepComplete }
                          ]);
                        } else {
                          Alert.alert('❌ Not quite!', 'Try again and think about what you just learned.', [
                            { text: 'Try Again' }
                          ]);
                        }
                      }}
                    >
                      <Text style={styles.optionText}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {step.interactive.type === 'true_false' && (
                <View style={styles.trueFalseContainer}>
                  <TouchableOpacity
                    style={[styles.tfButton, { backgroundColor: COLORS.success + '20' }]}
                    onPress={() => {
                      if (step.interactive.correct === true) {
                        Alert.alert('✅ Correct!', 'You nailed it!', [
                          { text: 'Continue', onPress: handleStepComplete }
                        ]);
                      } else {
                        Alert.alert('❌ Not quite!', 'Think about it again!', [
                          { text: 'Try Again' }
                        ]);
                      }
                    }}
                  >
                    <Icon name="check" size={24} color={COLORS.success} />
                    <Text style={[styles.tfText, { color: COLORS.success }]}>True</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.tfButton, { backgroundColor: COLORS.error + '20' }]}
                    onPress={() => {
                      if (step.interactive.correct === false) {
                        Alert.alert('✅ Correct!', 'You got it right!', [
                          { text: 'Continue', onPress: handleStepComplete }
                        ]);
                      } else {
                        Alert.alert('❌ Not quite!', 'Try again!', [
                          { text: 'Try Again' }
                        ]);
                      }
                    }}
                  >
                    <Icon name="close" size={24} color={COLORS.error} />
                    <Text style={[styles.tfText, { color: COLORS.error }]}>False</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          <View style={styles.stepActions}>
            {currentStep > 0 && (
              <Button
                mode="outlined"
                onPress={() => setCurrentStep(currentStep - 1)}
                style={styles.stepButton}
                icon="arrow-back"
              >
                Previous
              </Button>
            )}
            <View style={{ flex: 1 }} />
            {!step.interactive && (
              <Button
                mode="contained"
                onPress={handleStepComplete}
                style={[styles.stepButton, { backgroundColor: selectedRule.color }]}
                icon={currentStep === selectedRule.steps.length - 1 ? 'check' : 'arrow-forward'}
              >
                {currentStep === selectedRule.steps.length - 1 ? 'Complete' : 'Next'}
              </Button>
            )}
          </View>
        </View>
      </ScrollView>
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
        colors={[COLORS.rules, COLORS.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>📚 Rules Learning</Text>
            <IconButton
              icon="account-circle"
              size={32}
              iconColor={COLORS.white}
              onPress={() => navigation.navigate('Profile')}
            />
          </View>
          <Text style={styles.headerSubtitle}>
            Master the rules of every sport! 🏆
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.rules]}
            tintColor={COLORS.rules}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderStatsOverview()}

        <View style={styles.searchSection}>
          <Searchbar
            placeholder="Search rules and sports..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            iconColor={COLORS.rules}
            inputStyle={styles.searchInput}
          />
        </View>

        <View style={styles.filtersSection}>
          <View style={styles.filterGroup}>
            <Text style={styles.filterTitle}>Sport</Text>
            {renderFilterChip(sports, selectedSport, setSelectedSport, 'sport')}
          </View>
          
          <View style={styles.filterGroup}>
            <Text style={styles.filterTitle}>Difficulty</Text>
            {renderFilterChip(difficulties, selectedDifficulty, setSelectedDifficulty, 'difficulty')}
          </View>
        </View>

        <View style={styles.rulesSection}>
          <Text style={styles.sectionTitle}>
            Available Rules ({filteredRules.length})
          </Text>
          <FlatList
            data={filteredRules}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderRuleCard}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ height: SPACING.md }} />}
          />
        </View>
      </ScrollView>

      <Portal>
        <Modal
          visible={showRuleModal}
          onDismiss={() => setShowRuleModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          {selectedRule && (
            <Card style={styles.modalCard}>
              <LinearGradient
                colors={[selectedRule.color + '10', COLORS.white]}
                style={styles.modalGradient}
              >
                {renderRuleContent()}
              </LinearGradient>
            </Card>
          )}
        </Modal>
      </Portal>

      <FAB
        icon="bookmark"
        style={[styles.fab, { backgroundColor: COLORS.accent }]}
        onPress={() =>
          Alert.alert(
            '📌 My Bookmarks',
            'View all your bookmarked rules in one place! This feature is coming soon!',
            [{ text: 'Got it!' }]
          )
        }
        label="Bookmarks"
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
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderRadius: 16,
  },
  overviewGradient: {
    borderRadius: 16,
  },
  overviewContent: {
    padding: SPACING.lg,
  },
  overviewTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.md,
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
    color: COLORS.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
  statSmallLabel: {
    color: COLORS.white + 'CC',
    fontSize: 12,
    marginTop: 4,
  },
  searchSection: {
    marginBottom: SPACING.md,
  },
  searchbar: {
    elevation: 4,
    borderRadius: 12,
  },
  searchInput: {
    fontSize: 16,
  },
  filtersSection: {
    marginBottom: SPACING.lg,
  },
  filterGroup: {
    marginBottom: SPACING.md,
  },
  filterTitle: {
    ...TEXT_STYLES.subheading,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.xs,
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterChip: {
    marginRight: SPACING.sm,
    marginVertical: SPACING.xs,
  },
  filterChipText: {
    fontSize: 14,
  },
  rulesSection: {
    paddingBottom: 100, // Space for FAB
  },
  sectionTitle: {
    ...TEXT_STYLES.subheading,
    marginBottom: SPACING.md,
    color: COLORS.text,
  },
  ruleCard: {
    marginBottom: SPACING.md,
  },
  card: {
    elevation: 4,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardGradient: {
    borderRadius: 16,
  },
  cardContent: {
    padding: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  ruleInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  ruleTitle: {
    ...TEXT_STYLES.subheading,
    flex: 1,
    marginRight: SPACING.sm,
  },
  statusBadges: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  difficultyChip: {
    marginRight: SPACING.sm,
  },
  estimatedTime: {
    ...TEXT_STYLES.caption,
    marginRight: SPACING.sm,
  },
  category: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
  },
  ruleDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  progressSection: {
    marginBottom: SPACING.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  progressText: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
  },
  progressPercentage: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
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
    fontWeight: 'bold',
    marginLeft: 4,
    color: COLORS.warning,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginLeft: SPACING.sm,
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    margin: SPACING.md,
    marginTop: 60,
    marginBottom: 40,
  },
  modalCard: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalGradient: {
    flex: 1,
    borderRadius: 20,
  },
  ruleContentContainer: {
    flex: 1,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  stepProgress: {
    flex: 1,
    marginRight: SPACING.md,
  },
  stepText: {
    ...TEXT_STYLES.caption,
    marginBottom: SPACING.xs,
  },
  stepProgressBar: {
    height: 4,
    borderRadius: 2,
  },
  stepContent: {
    padding: SPACING.lg,
  },
  stepTitle: {
    ...TEXT_STYLES.heading,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  visualSection: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
    borderRadius: 16,
  },
  visualEmoji: {
    fontSize: 48,
  },
  stepDescription: {
    ...TEXT_STYLES.body,
    lineHeight: 24,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  tipContainer: {
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.warning + '10',
    elevation: 2,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  tipTitle: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    marginLeft: SPACING.xs,
    color: COLORS.warning,
  },
  tipText: {
    ...TEXT_STYLES.body,
    fontSize: 14,
    fontStyle: 'italic',
  },
  interactiveSection: {
    backgroundColor: COLORS.primary + '10',
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  interactiveTitle: {
    ...TEXT_STYLES.subheading,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  interactiveQuestion: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    marginBottom: SPACING.md,
    fontWeight: '600',
  },
  optionsContainer: {
    gap: SPACING.sm,
  },
  optionButton: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary + '30',
  },
  optionText: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    fontWeight: '500',
  },
  trueFalseContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: SPACING.md,
  },
  tfButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  tfText: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    marginTop: SPACING.xs,
  },
  stepActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: SPACING.lg,
  },
  stepButton: {
    borderRadius: 25,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    borderRadius: 16,
  },
});

export default RulesLearning;