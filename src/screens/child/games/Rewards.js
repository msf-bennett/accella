import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Animated,
  TouchableOpacity,
  Alert,
  Dimensions,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from 'expo-blur';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const RewardsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, rewards, achievements, stats } = useSelector(state => ({
    user: state.auth.user,
    rewards: state.rewards || {},
    achievements: state.achievements || [],
    stats: state.userStats || {}
  }));

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pointsAnim = useRef(new Animated.Value(0)).current;

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [activeTab, setActiveTab] = useState('achievements');
  const [celebrationVisible, setCelebrationVisible] = useState(false);

  // Mock data - would come from Redux store in real app
  const userLevel = stats.level || 1;
  const totalPoints = stats.totalPoints || 250;
  const streakDays = stats.streakDays || 5;
  const completedSessions = stats.completedSessions || 12;
  const nextLevelPoints = (userLevel * 100) + 100;
  const currentLevelProgress = (totalPoints % 100) / 100;

  const mockAchievements = [
    {
      id: '1',
      title: 'First Goal! ⚽',
      description: 'Complete your first training session',
      icon: 'sports-soccer',
      earned: true,
      points: 50,
      rarity: 'common',
      earnedDate: '2024-08-25'
    },
    {
      id: '2',
      title: 'Week Warrior 💪',
      description: 'Complete 7 training sessions',
      icon: 'fitness-center',
      earned: true,
      points: 100,
      rarity: 'rare',
      earnedDate: '2024-08-28'
    },
    {
      id: '3',
      title: 'Perfect Week 🌟',
      description: 'Complete all sessions in a week',
      icon: 'star',
      earned: false,
      points: 200,
      rarity: 'epic',
      progress: 0.7
    },
    {
      id: '4',
      title: 'Speed Demon ⚡',
      description: 'Improve sprint time by 10%',
      icon: 'flash-on',
      earned: false,
      points: 150,
      rarity: 'rare',
      progress: 0.3
    },
    {
      id: '5',
      title: 'Team Player 🤝',
      description: 'Help 5 teammates in training',
      icon: 'group',
      earned: true,
      points: 75,
      rarity: 'common',
      earnedDate: '2024-08-20'
    }
  ];

  const mockRewards = [
    {
      id: '1',
      title: 'Extra Rest Day',
      description: 'Skip one training session guilt-free',
      cost: 200,
      icon: 'hotel',
      available: true,
      category: 'training'
    },
    {
      id: '2',
      title: 'Choose Your Drill',
      description: 'Pick the drill for next team practice',
      cost: 150,
      icon: 'sports',
      available: totalPoints >= 150,
      category: 'training'
    },
    {
      id: '3',
      title: 'Special Equipment',
      description: 'Use premium training equipment',
      cost: 300,
      icon: 'sports-basketball',
      available: totalPoints >= 300,
      category: 'equipment'
    },
    {
      id: '4',
      title: 'Healthy Snack',
      description: 'Get a nutritious post-workout snack',
      cost: 100,
      icon: 'local-dining',
      available: true,
      category: 'nutrition'
    }
  ];

  // Animation effects
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
      Animated.timing(pointsAnim, {
        toValue: totalPoints,
        duration: 1500,
        useNativeDriver: false,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, pointsAnim, totalPoints]);

  // Refresh functionality
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1500));
      // dispatch refresh actions here
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Handle reward redemption
  const handleRedeemReward = (reward) => {
    if (totalPoints < reward.cost) {
      Alert.alert(
        'Not Enough Points! 😅',
        `You need ${reward.cost - totalPoints} more points to redeem this reward.`,
        [{ text: 'Keep Training!', style: 'default' }]
      );
      return;
    }

    Alert.alert(
      'Redeem Reward? 🎁',
      `Use ${reward.cost} points to redeem "${reward.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Redeem',
          style: 'default',
          onPress: () => {
            Vibration.vibrate(100);
            // dispatch(redeemReward(reward.id));
            setCelebrationVisible(true);
            setTimeout(() => setCelebrationVisible(false), 2000);
          }
        }
      ]
    );
  };

  // Handle achievement view
  const handleAchievementPress = (achievement) => {
    setSelectedReward(achievement);
    setShowRewardModal(true);
  };

  // Get rarity color
  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return COLORS.success;
      case 'rare': return COLORS.primary;
      case 'epic': return '#9c27b0';
      case 'legendary': return '#ff9800';
      default: return COLORS.secondary;
    }
  };

  // Render stats header
  const renderStatsHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.statsHeader}
    >
      <View style={styles.statsContent}>
        <View style={styles.levelContainer}>
          <Text style={styles.levelText}>Level {userLevel}</Text>
          <View style={styles.progressContainer}>
            <ProgressBar
              progress={currentLevelProgress}
              color={COLORS.background}
              style={styles.levelProgress}
            />
            <Text style={styles.progressText}>
              {totalPoints}/{nextLevelPoints} XP
            </Text>
          </View>
        </View>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Icon name="stars" size={24} color={COLORS.background} />
            <Animated.Text style={styles.statValue}>
              {pointsAnim}
            </Animated.Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
          
          <View style={styles.statItem}>
            <Icon name="local-fire-department" size={24} color="#ff6b35" />
            <Text style={styles.statValue}>{streakDays}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          
          <View style={styles.statItem}>
            <Icon name="check-circle" size={24} color="#4caf50" />
            <Text style={styles.statValue}>{completedSessions}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );

  // Render tab selector
  const renderTabSelector = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'achievements' && styles.activeTab]}
        onPress={() => setActiveTab('achievements')}
      >
        <Icon
          name="jump-rope"
          size={20}
          color={activeTab === 'achievements' ? COLORS.primary : COLORS.secondary}
        />
        <Text style={[
          styles.tabText,
          activeTab === 'achievements' && styles.activeTabText
        ]}>
          Achievements
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'rewards' && styles.activeTab]}
        onPress={() => setActiveTab('rewards')}
      >
        <Icon
          name="card-giftcard"
          size={20}
          color={activeTab === 'rewards' ? COLORS.primary : COLORS.secondary}
        />
        <Text style={[
          styles.tabText,
          activeTab === 'rewards' && styles.activeTabText
        ]}>
          Rewards
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Render achievement card
  const renderAchievementCard = (achievement, index) => (
    <Animated.View
      key={achievement.id}
      style={[
        styles.cardContainer,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, index * 10],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        onPress={() => handleAchievementPress(achievement)}
        activeOpacity={0.7}
      >
        <Card style={[
          styles.achievementCard,
          achievement.earned && styles.earnedCard
        ]}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.achievementHeader}>
              <View style={[
                styles.iconContainer,
                { backgroundColor: getRarityColor(achievement.rarity) + '20' }
              ]}>
                <Icon
                  name={achievement.icon}
                  size={32}
                  color={achievement.earned ? getRarityColor(achievement.rarity) : COLORS.secondary}
                />
              </View>
              
              <View style={styles.achievementInfo}>
                <Text style={[
                  styles.achievementTitle,
                  !achievement.earned && styles.lockedTitle
                ]}>
                  {achievement.title}
                </Text>
                <Text style={styles.achievementDescription}>
                  {achievement.description}
                </Text>
                
                {achievement.earned && achievement.earnedDate && (
                  <Text style={styles.earnedDate}>
                    Earned {new Date(achievement.earnedDate).toLocaleDateString()}
                  </Text>
                )}
              </View>
              
              <View style={styles.achievementMeta}>
                <Chip
                  mode="outlined"
                  style={[
                    styles.rarityChip,
                    { borderColor: getRarityColor(achievement.rarity) }
                  ]}
                  textStyle={[
                    styles.rarityText,
                    { color: getRarityColor(achievement.rarity) }
                  ]}
                >
                  {achievement.rarity.toUpperCase()}
                </Chip>
                
                <Text style={styles.pointsText}>
                  {achievement.points} pts
                </Text>
              </View>
            </View>
            
            {!achievement.earned && achievement.progress && (
              <View style={styles.progressSection}>
                <ProgressBar
                  progress={achievement.progress}
                  color={getRarityColor(achievement.rarity)}
                  style={styles.achievementProgress}
                />
                <Text style={styles.progressPercentage}>
                  {Math.round(achievement.progress * 100)}% complete
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );

  // Render reward card
  const renderRewardCard = (reward, index) => (
    <Animated.View
      key={reward.id}
      style={[
        styles.cardContainer,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, index * 10],
              }),
            },
          ],
        },
      ]}
    >
      <Card style={[
        styles.rewardCard,
        !reward.available && styles.unavailableCard
      ]}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.rewardHeader}>
            <View style={[
              styles.iconContainer,
              { backgroundColor: COLORS.primary + '20' }
            ]}>
              <Icon
                name={reward.icon}
                size={32}
                color={reward.available ? COLORS.primary : COLORS.secondary}
              />
            </View>
            
            <View style={styles.rewardInfo}>
              <Text style={[
                styles.rewardTitle,
                !reward.available && styles.unavailableTitle
              ]}>
                {reward.title}
              </Text>
              <Text style={styles.rewardDescription}>
                {reward.description}
              </Text>
              
              <View style={styles.costContainer}>
                <Icon name="stars" size={16} color={COLORS.primary} />
                <Text style={styles.costText}>{reward.cost} points</Text>
              </View>
            </View>
          </View>
          
          <Button
            mode={reward.available ? "contained" : "outlined"}
            disabled={!reward.available}
            onPress={() => handleRedeemReward(reward)}
            style={styles.redeemButton}
            contentStyle={styles.buttonContent}
          >
            {reward.available ? 'Redeem' : 'Locked'}
          </Button>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      
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
        {renderStatsHeader()}
        {renderTabSelector()}
        
        <View style={styles.content}>
          {activeTab === 'achievements' ? (
            <View>
              <Text style={styles.sectionTitle}>🏆 Your Achievements</Text>
              {mockAchievements.map(renderAchievementCard)}
            </View>
          ) : (
            <View>
              <Text style={styles.sectionTitle}>🎁 Available Rewards</Text>
              {mockRewards.map(renderRewardCard)}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Reward Detail Modal */}
      <Portal>
        <Modal
          visible={showRewardModal}
          onDismiss={() => setShowRewardModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView style={styles.blurView} blurType="light" blurAmount={10} />
          {selectedReward && (
            <Surface style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Icon
                  name={selectedReward.icon}
                  size={48}
                  color={getRarityColor(selectedReward.rarity)}
                />
                <Text style={styles.modalTitle}>{selectedReward.title}</Text>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => setShowRewardModal(false)}
                  style={styles.closeButton}
                />
              </View>
              
              <Text style={styles.modalDescription}>
                {selectedReward.description}
              </Text>
              
              <View style={styles.modalStats}>
                <View style={styles.modalStat}>
                  <Text style={styles.modalStatLabel}>Points</Text>
                  <Text style={styles.modalStatValue}>{selectedReward.points}</Text>
                </View>
                <View style={styles.modalStat}>
                  <Text style={styles.modalStatLabel}>Rarity</Text>
                  <Text style={styles.modalStatValue}>
                    {selectedReward.rarity?.toUpperCase()}
                  </Text>
                </View>
              </View>
            </Surface>
          )}
        </Modal>
      </Portal>

      {/* Celebration Modal */}
      <Portal>
        <Modal
          visible={celebrationVisible}
          onDismiss={() => setCelebrationVisible(false)}
          contentContainerStyle={styles.celebrationModal}
        >
          <Text style={styles.celebrationText}>🎉 Reward Redeemed! 🎉</Text>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  statsHeader: {
    paddingTop: 60,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  statsContent: {
    alignItems: 'center',
  },
  levelContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  levelText: {
    ...TEXT_STYLES.h2,
    color: COLORS.background,
    marginBottom: SPACING.sm,
  },
  progressContainer: {
    width: SCREEN_WIDTH - 80,
    alignItems: 'center',
  },
  levelProgress: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  progressText: {
    ...TEXT_STYLES.caption,
    color: COLORS.background,
    marginTop: SPACING.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...TEXT_STYLES.h3,
    color: COLORS.background,
    marginTop: SPACING.xs,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.background,
    opacity: 0.9,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
    borderRadius: 12,
    padding: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: COLORS.primary + '20',
  },
  tabText: {
    ...TEXT_STYLES.body,
    color: COLORS.secondary,
    marginLeft: SPACING.xs,
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  cardContainer: {
    marginBottom: SPACING.md,
  },
  achievementCard: {
    borderRadius: 16,
    elevation: 4,
  },
  earnedCard: {
    borderWidth: 2,
    borderColor: COLORS.success,
  },
  rewardCard: {
    borderRadius: 16,
    elevation: 4,
  },
  unavailableCard: {
    opacity: 0.6,
  },
  cardContent: {
    padding: SPACING.lg,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  rewardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  achievementInfo: {
    flex: 1,
  },
  rewardInfo: {
    flex: 1,
  },
  achievementTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  rewardTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  lockedTitle: {
    color: COLORS.secondary,
  },
  unavailableTitle: {
    color: COLORS.secondary,
  },
  achievementDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.secondary,
    marginBottom: SPACING.xs,
  },
  rewardDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.secondary,
    marginBottom: SPACING.sm,
  },
  earnedDate: {
    ...TEXT_STYLES.caption,
    color: COLORS.success,
  },
  costContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  costText: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginLeft: SPACING.xs,
  },
  achievementMeta: {
    alignItems: 'flex-end',
  },
  rarityChip: {
    marginBottom: SPACING.xs,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  pointsText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  progressSection: {
    marginTop: SPACING.md,
  },
  achievementProgress: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.surface,
  },
  progressPercentage: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  redeemButton: {
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: SPACING.xs,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  blurView: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: SPACING.xl,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
    position: 'relative',
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: -10,
    right: -10,
  },
  modalDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.secondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  modalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalStat: {
    alignItems: 'center',
  },
  modalStatLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
    marginBottom: SPACING.xs,
  },
  modalStatValue: {
    ...TEXT_STYLES.h4,
    color: COLORS.text,
  },
  celebrationModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  celebrationText: {
    ...TEXT_STYLES.h2,
    color: COLORS.background,
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderRadius: 16,
    textAlign: 'center',
  },
});

export default RewardsScreen;