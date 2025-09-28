import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  Animated,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
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
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const MyTrainingSessions = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, sessions, loading } = useSelector(state => state.training);
  
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  // Sample training sessions data
  const [localSessions, setLocalSessions] = useState([
    {
      id: 1,
      title: "Soccer Skills Training",
      subject: "Physical Education",
      type: "Skill Development",
      date: "2025-08-30",
      time: "10:00 AM",
      duration: 60,
      difficulty: "Beginner",
      progress: 0,
      status: "upcoming",
      description: "Learn basic dribbling and ball control techniques!",
      instructor: "Coach Johnson",
      points: 75,
      badges: ["First Touch", "Ball Control Master"],
      completionRate: 0,
      level: 1,
      streak: 0
    },
    {
      id: 2,
      title: "Basketball Fundamentals",
      subject: "Physical Education",
      type: "Team Sport",
      date: "2025-08-30",
      time: "2:00 PM",
      duration: 45,
      difficulty: "Intermediate",
      progress: 0,
      status: "upcoming",
      description: "Master shooting form and defensive positioning!",
      instructor: "Coach Smith",
      points: 60,
      badges: ["Sharpshooter", "Defense Star"],
      completionRate: 0,
      level: 2,
      streak: 0
    },
    {
      id: 3,
      title: "Swimming Technique",
      subject: "Aquatics",
      type: "Individual Sport",
      date: "2025-08-29",
      time: "11:00 AM",
      duration: 50,
      difficulty: "Beginner",
      progress: 100,
      status: "completed",
      description: "Perfect your freestyle stroke and breathing!",
      instructor: "Coach Brown",
      points: 85,
      badges: ["Water Warrior", "Stroke Perfectionist"],
      completedAt: "2025-08-29T11:00:00Z",
      score: 92,
      completionRate: 100,
      level: 1,
      streak: 3
    },
    {
      id: 4,
      title: "Tennis Basics",
      subject: "Racquet Sports",
      type: "Individual Sport",
      date: "2025-08-28",
      time: "3:00 PM",
      duration: 40,
      difficulty: "Beginner",
      progress: 100,
      status: "completed",
      description: "Learn forehand and backhand techniques!",
      instructor: "Coach Garcia",
      points: 70,
      badges: ["Racquet Master", "Court Champion"],
      completedAt: "2025-08-28T15:00:00Z",
      score: 88,
      completionRate: 100,
      level: 1,
      streak: 2
    }
  ]);

  const upcomingSessions = localSessions.filter(s => s.status === 'upcoming');
  const completedSessions = localSessions.filter(s => s.status === 'completed');
  const totalPoints = completedSessions.reduce((sum, session) => sum + session.points, 0);
  const currentLevel = Math.floor(totalPoints / 100) + 1;
  const levelProgress = (totalPoints % 100) / 100;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return COLORS.success;
      case 'intermediate': return '#FF9800';
      case 'advanced': return COLORS.error;
      default: return COLORS.primary;
    }
  };

  const getSubjectIcon = (subject) => {
    switch (subject.toLowerCase()) {
      case 'physical education': return 'sports-soccer';
      case 'aquatics': return 'pool';
      case 'racquet sports': return 'sports-tennis';
      default: return 'school';
    }
  };

  const startSession = (sessionId) => {
    Alert.alert(
      "Start Training Session 🏆",
      "Ready to begin your training? Let's achieve greatness together!",
      [
        { text: "Not Yet", style: "cancel" },
        { 
          text: "Let's Go! 🚀", 
          onPress: () => {
            // Navigate to training session
            navigation.navigate('ActiveTraining', { sessionId });
          }
        }
      ]
    );
  };

  const filteredSessions = (sessions) => {
    if (!searchQuery) return sessions;
    return sessions.filter(session =>
      session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.instructor.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const renderSessionCard = (session, isCompleted = false) => (
    <Card key={session.id} style={styles.sessionCard} elevation={4}>
      <LinearGradient
        colors={isCompleted ? ['#4CAF50', '#45a049'] : [COLORS.primary, '#764ba2']}
        style={styles.cardHeader}
      >
        <View style={styles.cardHeaderContent}>
          <Icon 
            name={getSubjectIcon(session.subject)} 
            size={24} 
            color="white" 
          />
          <Text style={styles.cardHeaderText}>{session.title}</Text>
          {isCompleted && (
            <Icon name="check-circle" size={24} color="white" />
          )}
        </View>
      </LinearGradient>

      <Card.Content style={styles.cardContent}>
        <View style={styles.sessionInfo}>
          <Text style={[TEXT_STYLES.h3, styles.sessionTitle]}>{session.subject}</Text>
          <Text style={[TEXT_STYLES.body, styles.sessionType]}>{session.type}</Text>
        </View>

        <View style={styles.sessionDetails}>
          <View style={styles.detailRow}>
            <Icon name="schedule" size={16} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>
              {session.date} at {session.time}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="timer" size={16} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>{session.duration} minutes</Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="person" size={16} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>{session.instructor}</Text>
          </View>
        </View>

        <Text style={[TEXT_STYLES.body, styles.description]}>
          {session.description}
        </Text>

        <View style={styles.badgeContainer}>
          <Chip
            mode="outlined"
            style={[styles.difficultyChip, { borderColor: getDifficultyColor(session.difficulty) }]}
            textStyle={{ color: getDifficultyColor(session.difficulty) }}
          >
            {session.difficulty}
          </Chip>
          
          <View style={styles.pointsContainer}>
            <Icon name="stars" size={16} color="#FFD700" />
            <Text style={styles.pointsText}>{session.points} pts</Text>
          </View>

          {session.streak > 0 && (
            <View style={styles.streakContainer}>
              <Icon name="local-fire-department" size={16} color="#FF4500" />
              <Text style={styles.streakText}>{session.streak} 🔥</Text>
            </View>
          )}
        </View>

        {isCompleted && (
          <View style={styles.completedInfo}>
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreLabel}>Score:</Text>
              <Text style={styles.scoreValue}>{session.score}%</Text>
            </View>
            <ProgressBar 
              progress={session.score / 100} 
              color={COLORS.success}
              style={styles.scoreProgress}
            />
          </View>
        )}

        <View style={styles.badgesList}>
          {session.badges?.map((badge, index) => (
            <Chip key={index} mode="flat" style={styles.badgeChip}>
              🏆 {badge}
            </Chip>
          ))}
        </View>

        {!isCompleted && (
          <Button
            mode="contained"
            onPress={() => startSession(session.id)}
            style={styles.startButton}
            contentStyle={styles.startButtonContent}
            labelStyle={styles.startButtonLabel}
          >
            <Icon name="play-arrow" size={20} color="white" />
            Start Training
          </Button>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <LinearGradient
        colors={[COLORS.primary, '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={[TEXT_STYLES.h1, styles.headerTitle]}>
            My Training Sessions 🏆
          </Text>
          <Text style={styles.headerSubtitle}>
            Keep training and reach new heights! 🚀
          </Text>

          <View style={styles.statsContainer}>
            <Surface style={styles.statCard}>
              <Text style={styles.statNumber}>{totalPoints}</Text>
              <Text style={styles.statLabel}>Total Points</Text>
            </Surface>
            <Surface style={styles.statCard}>
              <Text style={styles.statNumber}>Level {currentLevel}</Text>
              <ProgressBar 
                progress={levelProgress} 
                color="#FFD700"
                style={styles.levelProgress}
              />
            </Surface>
            <Surface style={styles.statCard}>
              <Text style={styles.statNumber}>{completedSessions.length}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </Surface>
          </View>
        </View>
      </LinearGradient>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Searchbar
          placeholder="Search sessions..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={COLORS.primary}
        />

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
            onPress={() => setActiveTab('upcoming')}
          >
            <Icon 
              name="schedule" 
              size={20} 
              color={activeTab === 'upcoming' ? 'white' : COLORS.textSecondary} 
            />
            <Text style={[
              styles.tabText, 
              activeTab === 'upcoming' && styles.activeTabText
            ]}>
              Upcoming ({upcomingSessions.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
            onPress={() => setActiveTab('completed')}
          >
            <Icon 
              name="check-circle" 
              size={20} 
              color={activeTab === 'completed' ? 'white' : COLORS.textSecondary} 
            />
            <Text style={[
              styles.tabText, 
              activeTab === 'completed' && styles.activeTabText
            ]}>
              Completed ({completedSessions.length})
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        >
          {activeTab === 'upcoming' && (
            <View style={styles.sessionsContainer}>
              {filteredSessions(upcomingSessions).length === 0 ? (
                <Surface style={styles.emptyState}>
                  <Icon name="event-available" size={64} color={COLORS.textSecondary} />
                  <Text style={[TEXT_STYLES.h3, styles.emptyTitle]}>
                    No upcoming sessions
                  </Text>
                  <Text style={[TEXT_STYLES.body, styles.emptySubtitle]}>
                    Check back later for new training sessions!
                  </Text>
                </Surface>
              ) : (
                filteredSessions(upcomingSessions).map(session => 
                  renderSessionCard(session, false)
                )
              )}
            </View>
          )}

          {activeTab === 'completed' && (
            <View style={styles.sessionsContainer}>
              {filteredSessions(completedSessions).length === 0 ? (
                <Surface style={styles.emptyState}>
                  <Icon name="jump-rope" size={64} color={COLORS.textSecondary} />
                  <Text style={[TEXT_STYLES.h3, styles.emptyTitle]}>
                    No completed sessions yet
                  </Text>
                  <Text style={[TEXT_STYLES.body, styles.emptySubtitle]}>
                    Complete your first training session to see it here!
                  </Text>
                </Surface>
              ) : (
                filteredSessions(completedSessions).map(session => 
                  renderSessionCard(session, true)
                )
              )}
            </View>
          )}

          <Surface style={styles.motivationCard}>
            <LinearGradient
              colors={['#FF6B6B', '#4ECDC4']}
              style={styles.motivationGradient}
            >
              <Text style={[TEXT_STYLES.h2, styles.motivationTitle]}>
                Keep Up the Amazing Work! 🌟
              </Text>
              <Text style={[TEXT_STYLES.body, styles.motivationText]}>
                Every session makes you stronger and more skilled. You're doing fantastic!
              </Text>
              <View style={styles.motivationTags}>
                <Chip style={styles.motivationTag}>🏃‍♀️ Stay Active</Chip>
                <Chip style={styles.motivationTag}>🎯 Stay Focused</Chip>
                <Chip style={styles.motivationTag}>🏆 Have Fun</Chip>
              </View>
            </LinearGradient>
          </Surface>
        </ScrollView>
      </Animated.View>

      <FAB
        style={styles.fab}
        icon="add"
        onPress={() => Alert.alert(
          "New Session",
          "Feature coming soon! You'll be able to request additional training sessions."
        )}
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
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: SPACING.lg,
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  statCard: {
    flex: 1,
    marginHorizontal: SPACING.xs,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  levelProgress: {
    width: '100%',
    marginTop: SPACING.xs,
    height: 4,
  },
  content: {
    flex: 1,
    marginTop: -20,
  },
  searchBar: {
    margin: SPACING.lg,
    elevation: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: 25,
    padding: SPACING.xs,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    marginLeft: SPACING.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  activeTabText: {
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  sessionsContainer: {
    paddingHorizontal: SPACING.lg,
  },
  sessionCard: {
    marginBottom: SPACING.lg,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardHeader: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  cardHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeaderText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginLeft: SPACING.md,
  },
  cardContent: {
    padding: SPACING.lg,
  },
  sessionInfo: {
    marginBottom: SPACING.md,
  },
  sessionTitle: {
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  sessionType: {
    color: COLORS.textSecondary,
  },
  sessionDetails: {
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  detailText: {
    marginLeft: SPACING.sm,
    color: COLORS.textSecondary,
  },
  description: {
    color: COLORS.text,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  difficultyChip: {
    marginRight: SPACING.md,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  pointsText: {
    marginLeft: SPACING.xs,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakText: {
    marginLeft: SPACING.xs,
    fontWeight: 'bold',
    color: '#FF4500',
  },
  completedInfo: {
    marginBottom: SPACING.md,
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  scoreLabel: {
    color: COLORS.textSecondary,
  },
  scoreValue: {
    fontWeight: 'bold',
    color: COLORS.success,
    fontSize: 16,
  },
  scoreProgress: {
    height: 6,
    borderRadius: 3,
  },
  badgesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  badgeChip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
  },
  startButton: {
    backgroundColor: COLORS.success,
    borderRadius: 25,
  },
  startButtonContent: {
    paddingVertical: SPACING.sm,
  },
  startButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    marginVertical: SPACING.xl,
    borderRadius: 16,
  },
  emptyTitle: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
    color: COLORS.textSecondary,
  },
  motivationCard: {
    margin: SPACING.lg,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
  },
  motivationGradient: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  motivationTitle: {
    color: 'white',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  motivationText: {
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  motivationTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  motivationTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: SPACING.xs,
    marginVertical: SPACING.xs,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default MyTrainingSessions;