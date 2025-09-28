import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StatusBar,
  Animated,
  Dimensions,
  TouchableOpacity,
  Alert,
  Vibration,
  FlatList,
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
  Badge,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from 'expo-blur';

// Import your established constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const GamificationHub = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  
  // Player Stats
  const [playerStats, setPlayerStats] = useState({
    level: 12,
    totalPoints: 2850,
    streakDays: 15,
    completedChallenges: 47,
    totalWorkouts: 89,
    badgesEarned: 23,
    rank: 5,
    weeklyPoints: 180,
  });
  
  const scrollViewRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Bounce animation for new achievements
    const bounceAnimation = () => {
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1.1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setTimeout(bounceAnimation, 3000);
      });
    };
    bounceAnimation();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate refresh with new data
    await new Promise(resolve => setTimeout(resolve, 1000));
    setPlayerStats(prev => ({
      ...prev,
      weeklyPoints: prev.weeklyPoints + Math.floor(Math.random() * 20),
    }));
    setRefreshing(false);
  }, []);

  const activeChallenges = [
    {
      id: 1,
      title: '🔥 Week Warrior',
      description: 'Complete 7 workouts this week',
      progress: 5,
      target: 7,
      reward: 100,
      timeLeft: '2 days left',
      type: 'weekly',
      difficulty: 'Medium',
      icon: 'local-fire-department',
    },
    {
      id: 2,
      title: '⚡ Speed Demon',
      description: 'Complete 3 activities under 10 minutes',
      progress: 1,
      target: 3,
      reward: 75,
      timeLeft: '5 days left',
      type: 'skill',
      difficulty: 'Hard',
      icon: 'flash-on',
    },
    {
      id: 3,
      title: '🌟 Perfect Form',
      description: 'Get 5-star ratings on 5 exercises',
      progress: 3,
      target: 5,
      reward: 50,
      timeLeft: '1 week left',
      type: 'quality',
      difficulty: 'Easy',
      icon: 'star',
    },
  ];

  const recentAchievements = [
    { id: 1, title: 'Streak Master', icon: '🔥', description: '15 day streak!', date: 'Today', points: 150 },
    { id: 2, title: 'Soccer Star', icon: '⚽', description: 'Completed soccer challenge', date: 'Yesterday', points: 100 },
    { id: 3, title: 'Team Player', icon: '👥', description: 'Helped a teammate', date: '2 days ago', points: 75 },
    { id: 4, title: 'Early Bird', icon: '🌅', description: 'Morning workout completed', date: '3 days ago', points: 50 },
  ];

  const leaderboardData = [
    { id: 1, name: 'Alex Champion', points: 3200, level: 15, avatar: 'AC', position: 1 },
    { id: 2, name: 'Maya Swift', points: 3100, level: 14, avatar: 'MS', position: 2 },
    { id: 3, name: 'Jake Thunder', points: 2950, level: 13, avatar: 'JT', position: 3 },
    { id: 4, name: 'Emma Flash', points: 2900, level: 13, avatar: 'EF', position: 4 },
    { id: 5, name: user?.name || 'You', points: playerStats.totalPoints, level: playerStats.level, avatar: user?.name?.charAt(0) || 'Y', position: 5, isCurrentUser: true },
  ];

  const badges = [
    { id: 1, name: 'First Steps', icon: '👶', unlocked: true, rarity: 'common' },
    { id: 2, name: 'Week Warrior', icon: '⚔️', unlocked: true, rarity: 'rare' },
    { id: 3, name: 'Streak Legend', icon: '🔥', unlocked: true, rarity: 'epic' },
    { id: 4, name: 'Perfect Form', icon: '⭐', unlocked: true, rarity: 'rare' },
    { id: 5, name: 'Speed Demon', icon: '⚡', unlocked: false, rarity: 'legendary' },
    { id: 6, name: 'Team Captain', icon: '🏆', unlocked: false, rarity: 'legendary' },
  ];

  const handleChallengePress = (challenge) => {
    Vibration.vibrate(10);
    setSelectedChallenge(challenge);
    setShowChallengeModal(true);
  };

  const joinChallenge = () => {
    Alert.alert(
      '🚀 Feature Coming Soon!',
      'Challenge participation is being developed and will be available soon!',
      [{ text: 'Got it! 👍', style: 'default' }]
    );
    setShowChallengeModal(false);
  };

  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={{
        paddingTop: SPACING.xl,
        paddingBottom: SPACING.lg,
        paddingHorizontal: SPACING.md,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg }}>
        <Avatar.Text
          size={60}
          label={user?.name?.charAt(0) || 'C'}
          style={{ backgroundColor: COLORS.secondary }}
        />
        <View style={{ marginLeft: SPACING.md, flex: 1 }}>
          <Text style={[TEXT_STYLES.h2, { color: 'white' }]}>
            Level {playerStats.level} Champion! 🏆
          </Text>
          <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.8)' }]}>
            Rank #{playerStats.rank} • {playerStats.totalPoints} total points
          </Text>
        </View>
        <IconButton
          icon="leaderboard"
          iconColor="white"
          size={28}
          onPress={() => setShowLeaderboardModal(true)}
        />
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.md }}>
        <Surface style={styles.headerStatCard}>
          <Icon name="local-fire-department" size={24} color={COLORS.error} />
          <Text style={[TEXT_STYLES.h3, { color: COLORS.error }]}>{playerStats.streakDays}</Text>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Day Streak</Text>
        </Surface>
        <Surface style={styles.headerStatCard}>
          <Icon name="jump-rope" size={24} color={COLORS.primary} />
          <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>{playerStats.badgesEarned}</Text>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Badges</Text>
        </Surface>
        <Surface style={styles.headerStatCard}>
          <Icon name="trending-up" size={24} color={COLORS.success} />
          <Text style={[TEXT_STYLES.h3, { color: COLORS.success }]}>{playerStats.weeklyPoints}</Text>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>This Week</Text>
        </Surface>
      </View>

      <View>
        <Text style={[TEXT_STYLES.body, { color: 'white', marginBottom: 8 }]}>
          Progress to Level {playerStats.level + 1}
        </Text>
        <ProgressBar
          progress={0.72}
          color="white"
          style={{ height: 10, borderRadius: 5 }}
        />
        <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.7)', marginTop: 4 }]}>
          720 / 1000 XP
        </Text>
      </View>
    </LinearGradient>
  );

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      {[
        { key: 'overview', title: 'Overview', icon: 'dashboard' },
        { key: 'challenges', title: 'Challenges', icon: 'flag' },
        { key: 'achievements', title: 'Achievements', icon: 'jump-rope' },
        { key: 'badges', title: 'Badges', icon: 'military-tech' },
      ].map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.tabItem,
            selectedTab === tab.key && styles.activeTab
          ]}
          onPress={() => setSelectedTab(tab.key)}
        >
          <Icon 
            name={tab.icon} 
            size={20} 
            color={selectedTab === tab.key ? COLORS.primary : COLORS.textSecondary} 
          />
          <Text style={[
            TEXT_STYLES.caption,
            { color: selectedTab === tab.key ? COLORS.primary : COLORS.textSecondary }
          ]}>
            {tab.title}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderOverview = () => (
    <View style={{ padding: SPACING.md }}>
      <View style={styles.overviewGrid}>
        <TouchableOpacity 
          style={[styles.overviewCard, { backgroundColor: COLORS.primary }]}
          onPress={() => setSelectedTab('challenges')}
        >
          <Icon name="flag" size={32} color="white" />
          <Text style={[TEXT_STYLES.h3, { color: 'white', marginTop: 8 }]}>3</Text>
          <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>Active Challenges</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.overviewCard, { backgroundColor: COLORS.success }]}
          onPress={() => setSelectedTab('achievements')}
        >
          <Icon name="jump-rope" size={32} color="white" />
          <Text style={[TEXT_STYLES.h3, { color: 'white', marginTop: 8 }]}>4</Text>
          <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>Recent Achievements</Text>
        </TouchableOpacity>
      </View>

      <Card style={[styles.quickStatsCard, { marginTop: SPACING.md }]}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
            This Week's Progress 📈
          </Text>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Icon name="fitness-center" size={20} color={COLORS.primary} />
              <Text style={TEXT_STYLES.body}>{playerStats.totalWorkouts} Workouts</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="check-circle" size={20} color={COLORS.success} />
              <Text style={TEXT_STYLES.body}>{playerStats.completedChallenges} Completed</Text>
            </View>
          </View>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Icon name="schedule" size={20} color={COLORS.secondary} />
              <Text style={TEXT_STYLES.body}>12 Hours Active</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="star" size={20} color={COLORS.warning} />
              <Text style={TEXT_STYLES.body}>4.8 Avg Rating</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </View>
  );

  const renderChallenges = () => (
    <View style={{ padding: SPACING.md }}>
      <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
        Active Challenges 🎯
      </Text>
      {activeChallenges.map((challenge) => (
        <TouchableOpacity
          key={challenge.id}
          onPress={() => handleChallengePress(challenge)}
          activeOpacity={0.7}
        >
          <Card style={[styles.challengeCard, { marginBottom: SPACING.md }]}>
            <Card.Content>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
                <Icon name={challenge.icon} size={28} color={COLORS.primary} />
                <View style={{ marginLeft: SPACING.sm, flex: 1 }}>
                  <Text style={TEXT_STYLES.h4}>{challenge.title}</Text>
                  <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary }]}>
                    {challenge.description}
                  </Text>
                </View>
                <Chip mode="outlined" textStyle={{ fontSize: 10 }}>
                  {challenge.difficulty}
                </Chip>
              </View>
              
              <View style={{ marginBottom: SPACING.sm }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={TEXT_STYLES.caption}>
                    Progress: {challenge.progress}/{challenge.target}
                  </Text>
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.primary }]}>
                    +{challenge.reward} points
                  </Text>
                </View>
                <ProgressBar
                  progress={challenge.progress / challenge.target}
                  color={COLORS.primary}
                  style={{ height: 6, borderRadius: 3 }}
                />
              </View>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.secondary }]}>
                  ⏰ {challenge.timeLeft}
                </Text>
                <Button
                  mode="contained"
                  compact
                  onPress={() => handleChallengePress(challenge)}
                  buttonColor={COLORS.primary}
                >
                  View Details
                </Button>
              </View>
            </Card.Content>
          </Card>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderAchievements = () => (
    <View style={{ padding: SPACING.md }}>
      <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
        Recent Achievements 🌟
      </Text>
      {recentAchievements.map((achievement) => (
        <Animated.View
          key={achievement.id}
          style={{ transform: [{ scale: achievement.id === 1 ? bounceAnim : 1 }] }}
        >
          <Card style={[styles.achievementCard, { marginBottom: SPACING.sm }]}>
            <Card.Content>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Surface style={styles.achievementIcon}>
                  <Text style={{ fontSize: 24 }}>{achievement.icon}</Text>
                </Surface>
                <View style={{ marginLeft: SPACING.md, flex: 1 }}>
                  <Text style={TEXT_STYLES.h4}>{achievement.title}</Text>
                  <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary }]}>
                    {achievement.description}
                  </Text>
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.success }]}>
                    +{achievement.points} points • {achievement.date}
                  </Text>
                </View>
                {achievement.id === 1 && (
                  <Badge style={{ backgroundColor: COLORS.error }}>New!</Badge>
                )}
              </View>
            </Card.Content>
          </Card>
        </Animated.View>
      ))}
    </View>
  );

  const renderBadges = () => (
    <View style={{ padding: SPACING.md }}>
      <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
        Badge Collection 🎖️
      </Text>
      <View style={styles.badgeGrid}>
        {badges.map((badge) => (
          <TouchableOpacity
            key={badge.id}
            style={[
              styles.badgeCard,
              { opacity: badge.unlocked ? 1 : 0.4 },
              badge.rarity === 'legendary' && { borderColor: '#FFD700', borderWidth: 2 },
              badge.rarity === 'epic' && { borderColor: '#9C27B0', borderWidth: 2 },
              badge.rarity === 'rare' && { borderColor: '#2196F3', borderWidth: 1 },
            ]}
            onPress={() => {
              if (badge.unlocked) {
                Alert.alert(
                  `${badge.icon} ${badge.name}`,
                  `You've earned this ${badge.rarity} badge! Keep up the great work!`,
                  [{ text: 'Awesome! 🎉', style: 'default' }]
                );
              } else {
                Alert.alert(
                  `${badge.icon} ${badge.name}`,
                  `This ${badge.rarity} badge is still locked. Complete more challenges to unlock it!`,
                  [{ text: 'Got it! 💪', style: 'default' }]
                );
              }
            }}
          >
            <Text style={{ fontSize: 32, marginBottom: 4 }}>{badge.icon}</Text>
            <Text style={[TEXT_STYLES.caption, { textAlign: 'center', fontSize: 10 }]}>
              {badge.name}
            </Text>
            {badge.unlocked && (
              <Icon name="check-circle" size={12} color={COLORS.success} style={{ position: 'absolute', top: 4, right: 4 }} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderContent = () => {
    switch (selectedTab) {
      case 'challenges':
        return renderChallenges();
      case 'achievements':
        return renderAchievements();
      case 'badges':
        return renderBadges();
      default:
        return renderOverview();
    }
  };

  const renderChallengeModal = () => (
    <Portal>
      <Modal
        visible={showChallengeModal}
        onDismiss={() => setShowChallengeModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        {selectedChallenge && (
          <View>
            <View style={{ alignItems: 'center', marginBottom: SPACING.lg }}>
              <Surface style={styles.modalIconContainer}>
                <Icon name={selectedChallenge.icon} size={48} color={COLORS.primary} />
              </Surface>
              <Text style={[TEXT_STYLES.h2, { marginTop: SPACING.md, textAlign: 'center' }]}>
                {selectedChallenge.title}
              </Text>
              <Text style={[TEXT_STYLES.body, { textAlign: 'center', color: COLORS.textSecondary }]}>
                {selectedChallenge.description}
              </Text>
            </View>

            <Card style={{ marginBottom: SPACING.lg }}>
              <Card.Content>
                <Text style={[TEXT_STYLES.h4, { marginBottom: SPACING.sm }]}>Progress</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={TEXT_STYLES.body}>
                    {selectedChallenge.progress} / {selectedChallenge.target} completed
                  </Text>
                  <Text style={[TEXT_STYLES.body, { color: COLORS.primary, fontWeight: 'bold' }]}>
                    {Math.round((selectedChallenge.progress / selectedChallenge.target) * 100)}%
                  </Text>
                </View>
                <ProgressBar
                  progress={selectedChallenge.progress / selectedChallenge.target}
                  color={COLORS.primary}
                  style={{ height: 8, borderRadius: 4 }}
                />
              </Card.Content>
            </Card>

            <View style={{ marginBottom: SPACING.lg }}>
              <View style={styles.modalDetailRow}>
                <Icon name="schedule" size={20} color={COLORS.secondary} />
                <Text style={TEXT_STYLES.body}>{selectedChallenge.timeLeft}</Text>
              </View>
              <View style={styles.modalDetailRow}>
                <Icon name="star" size={20} color={COLORS.warning} />
                <Text style={TEXT_STYLES.body}>Reward: +{selectedChallenge.reward} points</Text>
              </View>
              <View style={styles.modalDetailRow}>
                <Icon name="fitness-center" size={20} color={COLORS.error} />
                <Text style={TEXT_STYLES.body}>Difficulty: {selectedChallenge.difficulty}</Text>
              </View>
            </View>

            <Button
              mode="contained"
              onPress={joinChallenge}
              buttonColor={COLORS.primary}
              contentStyle={{ paddingVertical: 8 }}
            >
              Continue Challenge! 🚀
            </Button>
          </View>
        )}
      </Modal>
    </Portal>
  );

  const renderLeaderboardModal = () => (
    <Portal>
      <Modal
        visible={showLeaderboardModal}
        onDismiss={() => setShowLeaderboardModal(false)}
        contentContainerStyle={[styles.modalContainer, { maxHeight: height * 0.8 }]}
      >
        <View>
          <Text style={[TEXT_STYLES.h2, { textAlign: 'center', marginBottom: SPACING.lg }]}>
            🏆 Leaderboard
          </Text>
          <FlatList
            data={leaderboardData}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <Card style={[
                styles.leaderboardCard,
                item.isCurrentUser && { backgroundColor: COLORS.primaryLight }
              ]}>
                <Card.Content>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[TEXT_STYLES.h3, { 
                      marginRight: SPACING.md,
                      color: item.position <= 3 ? COLORS.warning : COLORS.textSecondary
                    }]}>
                      #{item.position}
                    </Text>
                    <Avatar.Text
                      size={40}
                      label={item.avatar}
                      style={{ 
                        backgroundColor: item.isCurrentUser ? COLORS.primary : COLORS.secondary,
                        marginRight: SPACING.md 
                      }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={[TEXT_STYLES.h4, { 
                        color: item.isCurrentUser ? COLORS.primary : COLORS.text
                      }]}>
                        {item.name}
                      </Text>
                      <Text style={TEXT_STYLES.caption}>Level {item.level}</Text>
                    </View>
                    <Text style={[TEXT_STYLES.h4, { color: COLORS.success }]}>
                      {item.points.toLocaleString()}
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            )}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Modal>
    </Portal>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              progressBackgroundColor={COLORS.background}
            />
          }
        >
          {renderHeader()}
          {renderTabBar()}
          {renderContent()}
        </ScrollView>

        <FAB
          icon="add-task"
          style={[styles.fab, { backgroundColor: COLORS.primary }]}
          onPress={() => Alert.alert('🚀 Feature Coming Soon!', 'Custom challenge creation coming soon!')}
        />

        {renderChallengeModal()}
        {renderLeaderboardModal()}
      </Animated.View>
    </View>
  );
};

const styles = {
  headerStatCard: {
    padding: SPACING.md,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    minWidth: width * 0.28,
    elevation: 3,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: COLORS.primaryLight,
  },
  overviewGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  overviewCard: {
    flex: 1,
    padding: SPACING.lg,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 4,
  },
  quickStatsCard: {
    elevation: 3,
    borderRadius: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  challengeCard: {
    elevation: 3,
    borderRadius: 16,
  },
  achievementCard: {
    elevation: 2,
    borderRadius: 12,
  },
  achievementIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badgeCard: {
    width: (width - SPACING.md * 3) / 3,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: SPACING.sm,
    elevation: 2,
    position: 'relative',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: SPACING.lg,
    margin: SPACING.lg,
    borderRadius: 16,
    elevation: 5,
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  modalDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  leaderboardCard: {
    marginBottom: SPACING.sm,
    elevation: 2,
    borderRadius: 12,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
  },
};

export default GamificationHub;