import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  Dimensions,
  TouchableOpacity,
  Animated,
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
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const MentalTraining = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, mentalTraining } = useSelector(state => state.user);
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSession, setActiveSession] = useState(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [completedSessions, setCompletedSessions] = useState([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [dailyGoalProgress, setDailyGoalProgress] = useState(0);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef(null);

  // Mental training categories
  const categories = [
    { id: 'all', label: 'All', icon: 'psychology', color: COLORS.primary },
    { id: 'focus', label: 'Focus', icon: 'center-focus-strong', color: '#FF6B6B' },
    { id: 'relaxation', label: 'Relaxation', icon: 'spa', color: '#4ECDC4' },
    { id: 'motivation', label: 'Motivation', icon: 'flash-on', color: '#45B7D1' },
    { id: 'visualization', label: 'Visualization', icon: 'visibility', color: '#96CEB4' },
    { id: 'confidence', label: 'Confidence', icon: 'jump-rope', color: '#FFEAA7' },
  ];

  // Mental training sessions
  const mentalSessions = [
    {
      id: 1,
      title: 'Pre-Game Focus 🎯',
      category: 'focus',
      duration: 10,
      difficulty: 'Beginner',
      description: 'Sharpen your concentration before competition',
      techniques: ['Deep breathing', 'Attention anchoring', 'Present moment awareness'],
      points: 50,
      completed: false,
    },
    {
      id: 2,
      title: 'Power Visualization 💪',
      category: 'visualization',
      duration: 15,
      difficulty: 'Intermediate',
      description: 'Visualize successful performance and outcomes',
      techniques: ['Mental rehearsal', 'Success imagery', 'Outcome visualization'],
      points: 75,
      completed: true,
    },
    {
      id: 3,
      title: 'Stress Release 🧘‍♂️',
      category: 'relaxation',
      duration: 20,
      difficulty: 'Beginner',
      description: 'Release tension and anxiety through relaxation',
      techniques: ['Progressive muscle relaxation', 'Guided imagery', 'Body scan'],
      points: 60,
      completed: false,
    },
    {
      id: 4,
      title: 'Champion Mindset 🏆',
      category: 'confidence',
      duration: 12,
      difficulty: 'Advanced',
      description: 'Build unshakeable confidence and self-belief',
      techniques: ['Positive affirmations', 'Success anchoring', 'Power poses'],
      points: 80,
      completed: false,
    },
    {
      id: 5,
      title: 'Peak Performance Flow 🌊',
      category: 'focus',
      duration: 25,
      difficulty: 'Advanced',
      description: 'Enter the flow state for optimal performance',
      techniques: ['Flow triggers', 'Challenge-skill balance', 'Clear goals'],
      points: 100,
      completed: false,
    },
    {
      id: 6,
      title: 'Recovery Meditation 💤',
      category: 'relaxation',
      duration: 18,
      difficulty: 'Beginner',
      description: 'Enhance recovery through guided meditation',
      techniques: ['Body restoration', 'Sleep preparation', 'Healing imagery'],
      points: 65,
      completed: true,
    },
  ];

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
    ]).start();

    // Pulse animation for active sessions
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Calculate current streak and daily progress
    calculateProgress();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const calculateProgress = () => {
    const completedToday = mentalSessions.filter(session => session.completed).length;
    const dailyGoal = 3; // 3 sessions per day goal
    setDailyGoalProgress(Math.min(completedToday / dailyGoal, 1));
    setCurrentStreak(5); // Mock streak data
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      calculateProgress();
    }, 1500);
  }, []);

  const startSession = (session) => {
    setActiveSession(session);
    setShowSessionModal(true);
    setSessionTimer(0);
    setIsSessionActive(false);
    Vibration.vibrate(50);
  };

  const beginSession = () => {
    setIsSessionActive(true);
    timerRef.current = setInterval(() => {
      setSessionTimer(prev => prev + 1);
    }, 1000);
  };

  const completeSession = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsSessionActive(false);
    setShowSessionModal(false);
    
    // Update session as completed
    const updatedSessions = mentalSessions.map(session => 
      session.id === activeSession.id ? { ...session, completed: true } : session
    );
    
    // Show completion alert
    Alert.alert(
      '🎉 Session Completed!',
      `Great job! You earned ${activeSession.points} points and improved your mental strength.`,
      [
        {
          text: 'Continue Training',
          onPress: () => calculateProgress(),
        },
      ]
    );
    
    Vibration.vibrate([0, 500, 200, 500]);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return COLORS.success;
      case 'Intermediate': return '#FFA726';
      case 'Advanced': return COLORS.error;
      default: return COLORS.primary;
    }
  };

  const filteredSessions = mentalSessions.filter(session => {
    const matchesCategory = selectedCategory === 'all' || session.category === selectedCategory;
    const matchesSearch = session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         session.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Mental Training 🧠</Text>
            <Text style={styles.headerSubtitle}>Strengthen your mind</Text>
          </View>
          <Avatar.Text
            size={50}
            label={user?.name?.charAt(0) || 'U'}
            style={styles.avatar}
          />
        </View>
        
        {/* Progress Overview */}
        <View style={styles.progressContainer}>
          <Surface style={styles.progressCard}>
            <View style={styles.progressRow}>
              <View style={styles.progressItem}>
                <Text style={styles.progressNumber}>{currentStreak}</Text>
                <Text style={styles.progressLabel}>Day Streak 🔥</Text>
              </View>
              <View style={styles.progressDivider} />
              <View style={styles.progressItem}>
                <Text style={styles.progressNumber}>{Math.round(dailyGoalProgress * 100)}%</Text>
                <Text style={styles.progressLabel}>Daily Goal 🎯</Text>
              </View>
              <View style={styles.progressDivider} />
              <View style={styles.progressItem}>
                <Text style={styles.progressNumber}>
                  {mentalSessions.filter(s => s.completed).length}
                </Text>
                <Text style={styles.progressLabel}>Completed ✅</Text>
              </View>
            </View>
            <ProgressBar
              progress={dailyGoalProgress}
              color={COLORS.success}
              style={styles.dailyProgressBar}
            />
          </Surface>
        </View>
      </View>
    </LinearGradient>
  );

  const renderCategories = () => (
    <View style={styles.categoriesContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            onPress={() => {
              setSelectedCategory(category.id);
              Vibration.vibrate(30);
            }}
          >
            <Surface
              style={[
                styles.categoryCard,
                selectedCategory === category.id && styles.categoryCardSelected
              ]}
            >
              <Icon 
                name={category.icon} 
                size={24} 
                color={selectedCategory === category.id ? '#fff' : category.color}
              />
              <Text style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextSelected
              ]}>
                {category.label}
              </Text>
            </Surface>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderSessionCard = (session) => (
    <Animated.View
      key={session.id}
      style={[
        styles.sessionCardContainer,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}
    >
      <Card style={styles.sessionCard}>
        <Card.Content>
          <View style={styles.sessionHeader}>
            <View style={styles.sessionTitleContainer}>
              <Text style={styles.sessionTitle}>{session.title}</Text>
              <View style={styles.sessionMeta}>
                <Chip
                  style={[styles.difficultyChip, { backgroundColor: getDifficultyColor(session.difficulty) + '20' }]}
                  textStyle={[styles.difficultyText, { color: getDifficultyColor(session.difficulty) }]}
                >
                  {session.difficulty}
                </Chip>
                <View style={styles.durationContainer}>
                  <Icon name="access-time" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.durationText}>{session.duration} min</Text>
                </View>
              </View>
            </View>
            {session.completed ? (
              <Icon name="check-circle" size={30} color={COLORS.success} />
            ) : (
              <IconButton
                icon="play-arrow"
                iconColor={COLORS.primary}
                size={30}
                style={styles.playButton}
                onPress={() => startSession(session)}
              />
            )}
          </View>
          
          <Text style={styles.sessionDescription}>{session.description}</Text>
          
          <View style={styles.techniquesContainer}>
            {session.techniques.map((technique, index) => (
              <Chip key={index} style={styles.techniqueChip} compact>
                {technique}
              </Chip>
            ))}
          </View>
          
          <View style={styles.sessionFooter}>
            <View style={styles.pointsContainer}>
              <Icon name="stars" size={16} color="#FFD700" />
              <Text style={styles.pointsText}>{session.points} points</Text>
            </View>
            {session.completed && (
              <Text style={styles.completedText}>✅ Completed</Text>
            )}
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderSessionModal = () => (
    <Portal>
      <Modal
        visible={showSessionModal}
        onDismiss={() => setShowSessionModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.blurView} blurType="dark" blurAmount={10}>
          <Surface style={styles.modalContent}>
            {activeSession && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{activeSession.title}</Text>
                  <IconButton
                    icon="close"
                    size={24}
                    onPress={() => {
                      if (timerRef.current) clearInterval(timerRef.current);
                      setShowSessionModal(false);
                      setIsSessionActive(false);
                    }}
                  />
                </View>
                
                <View style={styles.timerContainer}>
                  <Animated.View
                    style={[
                      styles.timerCircle,
                      { transform: [{ scale: isSessionActive ? pulseAnim : 1 }] }
                    ]}
                  >
                    <Text style={styles.timerText}>{formatTime(sessionTimer)}</Text>
                    <Text style={styles.timerLabel}>
                      {isSessionActive ? 'In Progress' : 'Ready to Start'}
                    </Text>
                  </Animated.View>
                </View>
                
                <Text style={styles.modalDescription}>
                  {activeSession.description}
                </Text>
                
                <View style={styles.modalTechniques}>
                  <Text style={styles.techniquesTitle}>Session Includes:</Text>
                  {activeSession.techniques.map((technique, index) => (
                    <View key={index} style={styles.techniqueItem}>
                      <Icon name="check" size={16} color={COLORS.success} />
                      <Text style={styles.techniqueItemText}>{technique}</Text>
                    </View>
                  ))}
                </View>
                
                <View style={styles.modalActions}>
                  {!isSessionActive ? (
                    <Button
                      mode="contained"
                      style={styles.startButton}
                      onPress={beginSession}
                      icon="play-arrow"
                    >
                      Start Session
                    </Button>
                  ) : (
                    <Button
                      mode="contained"
                      style={styles.completeButton}
                      onPress={completeSession}
                      icon="check"
                    >
                      Complete Session
                    </Button>
                  )}
                </View>
              </>
            )}
          </Surface>
        </BlurView>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {renderHeader()}
      
      <ScrollView
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
        <Searchbar
          placeholder="Search mental training sessions..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          iconColor={COLORS.primary}
        />
        
        {renderCategories()}
        
        <View style={styles.sessionsContainer}>
          <Text style={styles.sectionTitle}>
            Training Sessions ({filteredSessions.length})
          </Text>
          
          {filteredSessions.length > 0 ? (
            filteredSessions.map(renderSessionCard)
          ) : (
            <Surface style={styles.emptyState}>
              <Icon name="psychology" size={64} color={COLORS.textSecondary} />
              <Text style={styles.emptyStateText}>
                No sessions found
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Try adjusting your search or category filter
              </Text>
            </Surface>
          )}
        </View>
      </ScrollView>
      
      {renderSessionModal()}
      
      <FAB
        icon="psychology"
        label="Quick Session"
        style={styles.fab}
        onPress={() => {
          const randomSession = mentalSessions[Math.floor(Math.random() * mentalSessions.length)];
          startSession(randomSession);
        }}
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
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    gap: SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.heading,
    color: '#fff',
    fontSize: 28,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.8)',
    marginTop: SPACING.xs,
  },
  avatar: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  progressContainer: {
    marginTop: SPACING.md,
  },
  progressCard: {
    borderRadius: 16,
    padding: SPACING.md,
    elevation: 4,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  progressItem: {
    alignItems: 'center',
    flex: 1,
  },
  progressNumber: {
    ...TEXT_STYLES.heading,
    fontSize: 24,
    color: COLORS.primary,
  },
  progressLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  progressDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.sm,
  },
  dailyProgressBar: {
    height: 6,
    borderRadius: 3,
  },
  content: {
    flex: 1,
  },
  searchbar: {
    margin: SPACING.md,
    elevation: 2,
  },
  categoriesContainer: {
    marginBottom: SPACING.md,
  },
  categoriesContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  categoryCard: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    elevation: 2,
  },
  categoryCardSelected: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  categoryTextSelected: {
    color: '#fff',
  },
  sessionsContainer: {
    padding: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.subheading,
    marginBottom: SPACING.md,
    color: COLORS.textPrimary,
  },
  sessionCardContainer: {
    marginBottom: SPACING.md,
  },
  sessionCard: {
    borderRadius: 16,
    elevation: 3,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  sessionTitleContainer: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  sessionTitle: {
    ...TEXT_STYLES.subheading,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  sessionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  difficultyChip: {
    height: 24,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  durationText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  playButton: {
    backgroundColor: COLORS.primary + '20',
  },
  sessionDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  techniquesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  techniqueChip: {
    backgroundColor: COLORS.background,
  },
  sessionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  pointsText: {
    ...TEXT_STYLES.caption,
    color: '#FFD700',
    fontWeight: '600',
  },
  completedText: {
    ...TEXT_STYLES.caption,
    color: COLORS.success,
    fontWeight: '600',
  },
  emptyState: {
    padding: SPACING.xl,
    alignItems: 'center',
    borderRadius: 16,
  },
  emptyStateText: {
    ...TEXT_STYLES.subheading,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  emptyStateSubtext: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurView: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    borderRadius: 20,
    padding: SPACING.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    ...TEXT_STYLES.heading,
    color: COLORS.textPrimary,
    flex: 1,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  timerCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: COLORS.primary,
  },
  timerText: {
    ...TEXT_STYLES.heading,
    fontSize: 32,
    color: COLORS.primary,
  },
  timerLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  modalDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  modalTechniques: {
    marginBottom: SPACING.lg,
  },
  techniquesTitle: {
    ...TEXT_STYLES.subheading,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  techniqueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  techniqueItemText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
  },
  modalActions: {
    gap: SPACING.sm,
  },
  startButton: {
    backgroundColor: COLORS.primary,
  },
  completeButton: {
    backgroundColor: COLORS.success,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default MentalTraining;