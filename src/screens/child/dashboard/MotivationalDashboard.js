import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  RefreshControl,
  StatusBar,
  Alert,
  Animated,
  TouchableOpacity,
  Vibration,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  Surface,
  Avatar,
  IconButton,
  FAB,
  ProgressBar,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TEXT_STYLES } from '../../../constants';

const { width } = Dimensions.get('window');

const MotivationalDashboard = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { achievements, dailyQuote, challenges } = useSelector(state => state.motivation);
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(sparkleAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(sparkleAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();
    
    loadMotivationalData();
  }, []);

  const loadMotivationalData = useCallback(async () => {
    try {
      // Simulate API call - replace with actual Redux actions
      // dispatch(fetchDailyQuote());
      // dispatch(fetchAchievements());
      // dispatch(fetchChallenges());
    } catch (error) {
      Alert.alert('Error', 'Failed to load motivational content');
    }
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMotivationalData();
    setRefreshing(false);
  }, [loadMotivationalData]);

  const handleCardPress = useCallback((cardId) => {
    Vibration.vibrate(50);
    setSelectedCard(cardId);
    
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    setTimeout(() => setSelectedCard(null), 200);
  }, [bounceAnim]);

  // Mock data - replace with actual data from Redux store
  const mockData = {
    dailyQuote: {
      text: "Champions don't become champions in the ring. They become champions in their training!",
      author: "Muhammad Ali",
      emoji: "🥊"
    },
    todaysGoal: {
      title: "Complete Today's Training",
      progress: 0.75,
      description: "3 out of 4 exercises done"
    },
    weeklyStreak: 5,
    totalPoints: 2450,
    level: "Rising Star",
    achievements: [
      { 
        id: 1, 
        title: "Perfect Week", 
        description: "Completed all sessions this week", 
        icon: "star",
        color: "#FFD700",
        isNew: true,
        points: 100
      },
      { 
        id: 2, 
        title: "Early Bird", 
        description: "5 morning sessions in a row", 
        icon: "wb-sunny",
        color: "#FF6B35",
        isNew: false,
        points: 75
      },
      { 
        id: 3, 
        title: "Team Spirit", 
        description: "Great teamwork this month", 
        icon: "group",
        color: "#4ECDC4",
        isNew: true,
        points: 125
      },
      { 
        id: 4, 
        title: "Speed Demon", 
        description: "Personal best in sprints", 
        icon: "flash-on",
        color: "#9B59B6",
        isNew: false,
        points: 150
      }
    ],
    challenges: [
      {
        id: 1,
        title: "7-Day Streak Challenge",
        description: "Train for 7 days straight",
        progress: 0.71,
        reward: "200 Points + Special Badge",
        daysLeft: 2,
        emoji: "🔥"
      },
      {
        id: 2,
        title: "Skill Master",
        description: "Improve 3 skills this week",
        progress: 0.33,
        reward: "Skill Badge + 150 Points",
        daysLeft: 4,
        emoji: "🎯"
      }
    ],
    milestones: [
      { title: "First Month Complete", achieved: true, date: "Nov 2025" },
      { title: "50 Training Sessions", achieved: true, date: "Dec 2025" },
      { title: "100 Training Sessions", achieved: false, progress: 0.72 },
      { title: "Bronze Level Champion", achieved: false, progress: 0.45 }
    ],
    motivationalTips: [
      "🌟 Every champion was once a beginner who refused to give up!",
      "💪 Your only competition is who you were yesterday!",
      "🚀 Dream big, train hard, achieve greatness!",
      "🏆 Success is earned in practice, celebrated in games!"
    ]
  };

  const renderAchievementCard = (achievement) => (
    <TouchableOpacity
      key={achievement.id}
      onPress={() => handleCardPress(achievement.id)}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          styles.achievementCard,
          selectedCard === achievement.id && {
            transform: [{ scale: bounceAnim }]
          }
        ]}
      >
        <Surface style={[styles.achievementSurface, { borderColor: achievement.color }]}>
          {achievement.isNew && (
            <Animated.View
              style={[
                styles.newBadge,
                {
                  opacity: sparkleAnim
                }
              ]}
            >
              <Text style={styles.newBadgeText}>NEW!</Text>
            </Animated.View>
          )}
          <Icon
            name={achievement.icon}
            size={40}
            color={achievement.color}
            style={styles.achievementIcon}
          />
          <Text style={styles.achievementTitle}>{achievement.title}</Text>
          <Text style={styles.achievementDescription}>{achievement.description}</Text>
          <Chip
            mode="outlined"
            compact
            textStyle={styles.pointsText}
            style={[styles.pointsChip, { borderColor: achievement.color }]}
          >
            +{achievement.points} pts
          </Chip>
        </Surface>
      </Animated.View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <LinearGradient
        colors={['#FF6B35', '#F7931E']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Hey Champion! 🌟</Text>
          <Text style={styles.headerSubtitle}>Ready to be awesome today?</Text>
        </View>
      </LinearGradient>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
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
        >
          {/* Daily Quote */}
          <Card style={styles.quoteCard}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.quoteGradient}
            >
              <Text style={styles.quoteEmoji}>{mockData.dailyQuote.emoji}</Text>
              <Text style={styles.quoteText}>"{mockData.dailyQuote.text}"</Text>
              <Text style={styles.quoteAuthor}>- {mockData.dailyQuote.author}</Text>
            </LinearGradient>
          </Card>

          {/* Today's Goal */}
          <Card style={styles.goalCard}>
            <View style={styles.goalContent}>
              <View style={styles.goalHeader}>
                <Icon name="flag" size={28} color={COLORS.primary} />
                <Text style={styles.goalTitle}>Today's Mission 🎯</Text>
              </View>
              <Text style={styles.goalDescription}>{mockData.todaysGoal.description}</Text>
              <ProgressBar
                progress={mockData.todaysGoal.progress}
                color={COLORS.success}
                style={styles.goalProgressBar}
              />
              <Text style={styles.goalProgress}>
                {Math.round(mockData.todaysGoal.progress * 100)}% Complete!
              </Text>
            </View>
          </Card>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <Surface style={styles.statCard}>
              <Icon name="local-fire-department" size={32} color="#FF6B35" />
              <Text style={styles.statNumber}>{mockData.weeklyStreak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </Surface>
            
            <Surface style={styles.statCard}>
              <Icon name="jump-rope" size={32} color="#FFD700" />
              <Text style={styles.statNumber}>{mockData.totalPoints.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total Points</Text>
            </Surface>
            
            <Surface style={styles.statCard}>
              <Icon name="trending-up" size={32} color={COLORS.success} />
              <Text style={styles.statNumber}>{mockData.level}</Text>
              <Text style={styles.statLabel}>Current Level</Text>
            </Surface>
          </View>

          {/* Recent Achievements */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Awesome Achievements! 🏆</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.achievementsScroll}
            >
              {mockData.achievements.map(renderAchievementCard)}
            </ScrollView>
          </View>

          {/* Active Challenges */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Challenges 🚀</Text>
            {mockData.challenges.map((challenge) => (
              <Card key={challenge.id} style={styles.challengeCard}>
                <View style={styles.challengeContent}>
                  <View style={styles.challengeHeader}>
                    <Text style={styles.challengeEmoji}>{challenge.emoji}</Text>
                    <View style={styles.challengeInfo}>
                      <Text style={styles.challengeTitle}>{challenge.title}</Text>
                      <Text style={styles.challengeDescription}>{challenge.description}</Text>
                    </View>
                    <View style={styles.challengeTimer}>
                      <Text style={styles.challengeDays}>{challenge.daysLeft}</Text>
                      <Text style={styles.challengeDaysLabel}>days left</Text>
                    </View>
                  </View>
                  <ProgressBar
                    progress={challenge.progress}
                    color={COLORS.primary}
                    style={styles.challengeProgressBar}
                  />
                  <View style={styles.challengeFooter}>
                    <Text style={styles.challengeProgress}>
                      {Math.round(challenge.progress * 100)}% Complete
                    </Text>
                    <Text style={styles.challengeReward}>🎁 {challenge.reward}</Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>

          {/* Milestones */}
          <Card style={styles.milestonesCard}>
            <Text style={styles.sectionTitle}>Your Journey Milestones 🛣️</Text>
            <View style={styles.milestonesList}>
              {mockData.milestones.map((milestone, index) => (
                <View key={index} style={styles.milestoneItem}>
                  <Icon
                    name={milestone.achieved ? 'check-circle' : 'radio-button-unchecked'}
                    size={24}
                    color={milestone.achieved ? COLORS.success : COLORS.textSecondary}
                  />
                  <View style={styles.milestoneContent}>
                    <Text style={[
                      styles.milestoneTitle,
                      milestone.achieved && styles.milestoneAchieved
                    ]}>
                      {milestone.title}
                    </Text>
                    {milestone.achieved ? (
                      <Text style={styles.milestoneDate}>{milestone.date}</Text>
                    ) : (
                      <ProgressBar
                        progress={milestone.progress || 0}
                        color={COLORS.primary}
                        style={styles.milestoneProgressBar}
                      />
                    )}
                  </View>
                </View>
              ))}
            </View>
          </Card>

          {/* Motivational Tips */}
          <Card style={styles.tipsCard}>
            <Text style={styles.sectionTitle}>Daily Power-Ups! ⚡</Text>
            <View style={styles.tipsList}>
              {mockData.motivationalTips.map((tip, index) => (
                <View key={index} style={styles.tipItem}>
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          </Card>

          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* Floating Action Button */}
        <FAB
          icon="add"
          style={styles.fab}
          onPress={() => {
            Alert.alert(
              'Quick Actions',
              'Choose an action to boost your motivation!',
              [
                { text: 'View All Achievements', onPress: () => {} },
                { text: 'Start Challenge', onPress: () => {} },
                { text: 'Share Progress', onPress: () => {} },
                { text: 'Cancel', style: 'cancel' }
              ]
            );
          }}
        />
      </Animated.View>
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
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: SPACING.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  quoteCard: {
    marginBottom: SPACING.md,
    elevation: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  quoteGradient: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  quoteEmoji: {
    fontSize: 40,
    marginBottom: SPACING.sm,
  },
  quoteText: {
    ...TEXT_STYLES.body,
    color: '#FFFFFF',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 24,
    marginBottom: SPACING.sm,
  },
  quoteAuthor: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: 'bold',
  },
  goalCard: {
    marginBottom: SPACING.md,
    padding: SPACING.lg,
  },
  goalContent: {},
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  goalTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    fontWeight: 'bold',
    marginLeft: SPACING.sm,
  },
  goalDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  goalProgressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.sm,
  },
  goalProgress: {
    ...TEXT_STYLES.caption,
    color: COLORS.success,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.md,
    marginHorizontal: SPACING.xs,
    borderRadius: 12,
    elevation: 2,
  },
  statNumber: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    fontWeight: 'bold',
    marginTop: SPACING.xs,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
  },
  achievementsScroll: {
    paddingHorizontal: SPACING.xs,
  },
  achievementCard: {
    marginHorizontal: SPACING.xs,
  },
  achievementSurface: {
    width: 150,
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 12,
    elevation: 3,
    borderWidth: 2,
    position: 'relative',
  },
  newBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF6B35',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    elevation: 5,
  },
  newBadgeText: {
    ...TEXT_STYLES.caption,
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 10,
  },
  achievementIcon: {
    marginBottom: SPACING.sm,
  },
  achievementTitle: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  achievementDescription: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  pointsChip: {
    backgroundColor: 'transparent',
  },
  pointsText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  challengeCard: {
    marginBottom: SPACING.md,
    padding: SPACING.lg,
  },
  challengeContent: {},
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  challengeEmoji: {
    fontSize: 32,
    marginRight: SPACING.sm,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  challengeDescription: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  challengeTimer: {
    alignItems: 'center',
    backgroundColor: COLORS.primary + '20',
    borderRadius: 8,
    padding: SPACING.sm,
  },
  challengeDays: {
    ...TEXT_STYLES.h3,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  challengeDaysLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
  },
  challengeProgressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: SPACING.sm,
  },
  challengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  challengeProgress: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  challengeReward: {
    ...TEXT_STYLES.caption,
    color: COLORS.success,
    fontWeight: 'bold',
  },
  milestonesCard: {
    marginBottom: SPACING.md,
    padding: SPACING.lg,
  },
  milestonesList: {},
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  milestoneContent: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  milestoneTitle: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  milestoneAchieved: {
    color: COLORS.success,
  },
  milestoneDate: {
    ...TEXT_STYLES.caption,
    color: COLORS.success,
    marginTop: SPACING.xs,
  },
  milestoneProgressBar: {
    height: 4,
    borderRadius: 2,
    marginTop: SPACING.xs,
  },
  tipsCard: {
    marginBottom: SPACING.md,
    padding: SPACING.lg,
  },
  tipsList: {},
  tipItem: {
    backgroundColor: COLORS.primary + '10',
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  tipText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    lineHeight: 22,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default MotivationalDashboard;