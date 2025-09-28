import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Animated,
  TouchableOpacity,
  Alert,
  StatusBar,
  Vibration,
  Dimensions,
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
  Checkbox,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from 'expo-blur';

// Import your established design system
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const DailyQuest = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, dailyQuests, streakData } = useSelector(state => state.quests);
  
  const [refreshing, setRefreshing] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [animatedValue] = useState(new Animated.Value(0));
  const [questAnimations] = useState(new Animated.Value(0));

  // Mock data for daily quests and user progress
  const mockStreakData = {
    currentStreak: 7,
    bestStreak: 21,
    totalDaysCompleted: 45,
    streakRewards: [
      { day: 3, reward: 'Bronze Badge', claimed: true },
      { day: 7, reward: 'Silver Badge', claimed: false },
      { day: 14, reward: 'Gold Badge', claimed: false },
      { day: 21, reward: 'Diamond Badge', claimed: false },
      { day: 30, reward: 'Legendary Title', claimed: false },
    ]
  };

  const mockDailyQuests = [
    {
      id: 1,
      title: 'Morning Warm-Up Champion! 🌅',
      description: 'Complete 5 minutes of warm-up exercises',
      category: 'training',
      difficulty: 'easy',
      xpReward: 50,
      bonusReward: 'Energy Boost Badge',
      icon: 'wb-sunny',
      color: ['#FF9800', '#F57C00'],
      completed: true,
      completedAt: '2024-08-29T08:30:00',
      progress: 100,
      maxProgress: 100,
      timeRequired: 5,
      type: 'timer'
    },
    {
      id: 2,
      title: 'Ball Juggling Master ⚽',
      description: 'Juggle the ball 25 times without dropping',
      category: 'skill',
      difficulty: 'medium',
      xpReward: 75,
      bonusReward: 'Skillful Hands Badge',
      icon: 'sports-soccer',
      color: ['#4CAF50', '#388E3C'],
      completed: false,
      progress: 18,
      maxProgress: 25,
      currentCount: 18,
      type: 'counter'
    },
    {
      id: 3,
      title: 'Team Helper Hero 🤝',
      description: 'Help or encourage 3 teammates today',
      category: 'social',
      difficulty: 'easy',
      xpReward: 60,
      bonusReward: 'Friendship Star',
      icon: 'favorite',
      color: ['#E91E63', '#C2185B'],
      completed: false,
      progress: 1,
      maxProgress: 3,
      currentCount: 1,
      type: 'counter'
    },
    {
      id: 4,
      title: 'Speed Demon Challenge 🏃‍♂️',
      description: 'Complete 3 sprint drills at max effort',
      category: 'fitness',
      difficulty: 'hard',
      xpReward: 100,
      bonusReward: 'Lightning Bolt Badge',
      icon: 'flash-on',
      color: ['#9C27B0', '#7B1FA2'],
      completed: false,
      progress: 1,
      maxProgress: 3,
      currentCount: 1,
      type: 'counter'
    },
    {
      id: 5,
      title: 'Perfect Form Focus 🎯',
      description: 'Practice shooting technique for 10 minutes',
      category: 'technique',
      difficulty: 'medium',
      xpReward: 80,
      bonusReward: 'Precision Master Badge',
      icon: 'my-location',
      color: ['#2196F3', '#1976D2'],
      completed: false,
      progress: 6,
      maxProgress: 10,
      timeRequired: 10,
      type: 'timer'
    }
  ];

  const todayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const completedQuests = mockDailyQuests.filter(quest => quest.completed);
  const totalXpEarned = completedQuests.reduce((sum, quest) => sum + quest.xpReward, 0);
  const totalXpPossible = mockDailyQuests.reduce((sum, quest) => sum + quest.xpReward, 0);
  const completionPercentage = (completedQuests.length / mockDailyQuests.length) * 100;

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'hard': return '#F44336';
      default: return COLORS.primary;
    }
  };

  const getNextStreakReward = () => {
    return mockStreakData.streakRewards.find(reward => !reward.claimed);
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.stagger(100, 
        mockDailyQuests.map((_, index) => 
          Animated.timing(questAnimations, {
            toValue: 1,
            duration: 800,
            delay: index * 100,
            useNativeDriver: true,
          })
        )
      )
    ]).start();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('🎯 Daily Quests Updated!', 'Your progress has been synced! Keep up the great work!');
    }, 2000);
  }, []);

  const handleQuestComplete = (quest) => {
    if (quest.completed) return;

    Vibration.vibrate(100);
    Alert.alert(
      '🎉 Quest Completed!',
      `Awesome! You've completed "${quest.title}" and earned ${quest.xpReward} XP!`,
      [
        {
          text: 'Claim Reward! ✨',
          onPress: () => {
            setSelectedReward({
              title: quest.title,
              xpReward: quest.xpReward,
              bonusReward: quest.bonusReward,
              icon: quest.icon,
              color: quest.color
            });
            setShowRewardModal(true);
          }
        }
      ]
    );
  };

  const handleStreakReward = () => {
    const nextReward = getNextStreakReward();
    if (nextReward && mockStreakData.currentStreak >= nextReward.day) {
      setShowStreakModal(true);
      Vibration.vibrate([100, 50, 100]);
    }
  };

  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.headerGradient}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>🗓️ Daily Quests</Text>
        <Text style={styles.headerDate}>{todayDate}</Text>
        
        <View style={styles.progressOverview}>
          <View style={styles.progressStats}>
            <Text style={styles.progressLabel}>Today's Progress</Text>
            <Text style={styles.progressValue}>
              {completedQuests.length}/{mockDailyQuests.length} Complete
            </Text>
          </View>
          
          <ProgressBar 
            progress={completionPercentage / 100}
            color="#FFD700"
            style={styles.overallProgressBar}
          />
          
          <View style={styles.xpInfo}>
            <Icon name="stars" size={20} color="#FFD700" />
            <Text style={styles.xpText}>
              {totalXpEarned} / {totalXpPossible} XP Today
            </Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );

  const renderStreakSection = () => (
    <TouchableOpacity onPress={handleStreakReward}>
      <Card style={styles.streakCard}>
        <LinearGradient
          colors={['#FF6B35', '#F7931E']}
          style={styles.streakGradient}
        >
          <View style={styles.streakContent}>
            <View style={styles.streakIcon}>
              <Icon name="local-fire-department" size={40} color="#FFF" />
            </View>
            
            <View style={styles.streakInfo}>
              <Text style={styles.streakTitle}>🔥 Daily Streak</Text>
              <Text style={styles.streakDays}>{mockStreakData.currentStreak} Days</Text>
              <Text style={styles.streakBest}>
                Best: {mockStreakData.bestStreak} days
              </Text>
            </View>
            
            <View style={styles.streakReward}>
              {getNextStreakReward() && (
                <>
                  <Text style={styles.nextRewardText}>Next Reward:</Text>
                  <Text style={styles.nextRewardTitle}>
                    {getNextStreakReward().reward}
                  </Text>
                  <Text style={styles.nextRewardDays}>
                    In {getNextStreakReward().day - mockStreakData.currentStreak} days
                  </Text>
                </>
              )}
            </View>
          </View>
        </LinearGradient>
      </Card>
    </TouchableOpacity>
  );

  const renderQuestCard = (quest, index) => {
    const animatedStyle = {
      opacity: questAnimations,
      transform: [{
        translateY: questAnimations.interpolate({
          inputRange: [0, 1],
          outputRange: [50 + (index * 20), 0],
        }),
      }],
    };

    const progressPercentage = (quest.progress / quest.maxProgress) * 100;

    return (
      <Animated.View key={quest.id} style={animatedStyle}>
        <TouchableOpacity 
          onPress={() => handleQuestComplete(quest)}
          disabled={quest.completed}
        >
          <Card style={[
            styles.questCard,
            quest.completed && styles.completedQuestCard
          ]}>
            <LinearGradient
              colors={quest.completed ? ['#E0E0E0', '#BDBDBD'] : quest.color}
              style={styles.questHeader}
            >
              <View style={styles.questHeaderContent}>
                <View style={styles.questIconContainer}>
                  <Icon 
                    name={quest.completed ? 'check-circle' : quest.icon} 
                    size={30} 
                    color="#FFF" 
                  />
                </View>
                
                <View style={styles.questInfo}>
                  <Text style={styles.questTitle}>{quest.title}</Text>
                  <Text style={styles.questDescription}>{quest.description}</Text>
                </View>
                
                <View style={styles.questMeta}>
                  <Chip 
                    mode="outlined"
                    style={styles.difficultyChip}
                    textStyle={styles.difficultyText}
                  >
                    {quest.difficulty.toUpperCase()}
                  </Chip>
                </View>
              </View>
            </LinearGradient>
            
            <Card.Content style={styles.questContent}>
              <View style={styles.questProgress}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressTitle}>Progress</Text>
                  <Text style={styles.progressPercentage}>
                    {Math.round(progressPercentage)}%
                  </Text>
                </View>
                
                <ProgressBar 
                  progress={progressPercentage / 100}
                  color={quest.completed ? '#4CAF50' : quest.color[0]}
                  style={styles.questProgressBar}
                />
                
                <View style={styles.progressDetails}>
                  {quest.type === 'counter' ? (
                    <Text style={styles.progressText}>
                      {quest.currentCount || quest.progress} / {quest.maxProgress} completed
                    </Text>
                  ) : (
                    <Text style={styles.progressText}>
                      {quest.progress} / {quest.maxProgress} minutes
                    </Text>
                  )}
                  
                  {quest.completed && (
                    <View style={styles.completedBadge}>
                      <Icon name="check-circle" size={16} color="#4CAF50" />
                      <Text style={styles.completedText}>Completed!</Text>
                    </View>
                  )}
                </View>
              </View>
              
              <View style={styles.questRewards}>
                <View style={styles.rewardItem}>
                  <Icon name="stars" size={16} color="#FFD700" />
                  <Text style={styles.rewardText}>+{quest.xpReward} XP</Text>
                </View>
                
                <View style={styles.rewardItem}>
                  <Icon name="jump-rope" size={16} color="#FF9800" />
                  <Text style={styles.rewardText}>{quest.bonusReward}</Text>
                </View>
              </View>
              
              {!quest.completed && (
                <Button
                  mode="contained"
                  onPress={() => handleQuestComplete(quest)}
                  style={[styles.questButton, { backgroundColor: quest.color[0] }]}
                  labelStyle={styles.questButtonText}
                  disabled={progressPercentage < 100}
                >
                  {progressPercentage >= 100 ? 'Complete Quest! 🎉' : 'Keep Going! 💪'}
                </Button>
              )}
            </Card.Content>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderRewardModal = () => (
    <Portal>
      <Modal
        visible={showRewardModal}
        onDismiss={() => setShowRewardModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.blurView} blurType="light" blurAmount={10}>
          {selectedReward && (
            <Surface style={styles.rewardModalContent}>
              <LinearGradient
                colors={selectedReward.color}
                style={styles.rewardModalHeader}
              >
                <Icon name="celebration" size={60} color="#FFF" />
                <Text style={styles.rewardModalTitle}>Quest Complete! 🎉</Text>
              </LinearGradient>
              
              <View style={styles.rewardModalBody}>
                <Text style={styles.rewardQuestTitle}>{selectedReward.title}</Text>
                
                <View style={styles.rewardsList}>
                  <View style={styles.rewardItem}>
                    <Icon name="stars" size={24} color="#FFD700" />
                    <Text style={styles.rewardItemText}>+{selectedReward.xpReward} XP</Text>
                  </View>
                  
                  <View style={styles.rewardItem}>
                    <Icon name="jump-rope" size={24} color="#FF9800" />
                    <Text style={styles.rewardItemText}>{selectedReward.bonusReward}</Text>
                  </View>
                </View>
                
                <Text style={styles.encouragementText}>
                  Amazing work! Keep completing quests to earn more rewards! 🌟
                </Text>
                
                <Button
                  mode="contained"
                  onPress={() => setShowRewardModal(false)}
                  style={styles.claimButton}
                  labelStyle={styles.claimButtonText}
                >
                  Claim Rewards! ✨
                </Button>
              </View>
            </Surface>
          )}
        </BlurView>
      </Modal>
    </Portal>
  );

  const renderStreakModal = () => (
    <Portal>
      <Modal
        visible={showStreakModal}
        onDismiss={() => setShowStreakModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.blurView} blurType="light" blurAmount={10}>
          <Surface style={styles.streakModalContent}>
            <LinearGradient
              colors={['#FF6B35', '#F7931E']}
              style={styles.streakModalHeader}
            >
              <Icon name="local-fire-department" size={60} color="#FFF" />
              <Text style={styles.streakModalTitle}>Streak Rewards! 🔥</Text>
            </LinearGradient>
            
            <ScrollView style={styles.streakModalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.streakModalText}>
                Your {mockStreakData.currentStreak}-day streak is incredible! Here are your rewards:
              </Text>
              
              <View style={styles.streakRewardsList}>
                {mockStreakData.streakRewards.map((reward, index) => (
                  <View 
                    key={index} 
                    style={[
                      styles.streakRewardItem,
                      reward.claimed && styles.claimedRewardItem,
                      mockStreakData.currentStreak >= reward.day && !reward.claimed && styles.availableRewardItem
                    ]}
                  >
                    <View style={styles.streakRewardIcon}>
                      <Text style={styles.streakRewardDay}>{reward.day}</Text>
                    </View>
                    
                    <Text style={[
                      styles.streakRewardText,
                      reward.claimed && styles.claimedRewardText,
                      mockStreakData.currentStreak >= reward.day && !reward.claimed && styles.availableRewardText
                    ]}>
                      {reward.reward}
                    </Text>
                    
                    <Icon 
                      name={
                        reward.claimed ? 'check-circle' : 
                        mockStreakData.currentStreak >= reward.day ? 'stars' : 'lock'
                      }
                      size={24}
                      color={
                        reward.claimed ? '#4CAF50' : 
                        mockStreakData.currentStreak >= reward.day ? '#FFD700' : '#BDBDBD'
                      }
                    />
                  </View>
                ))}
              </View>
              
              <Button
                mode="contained"
                onPress={() => setShowStreakModal(false)}
                style={styles.closeStreakButton}
                labelStyle={styles.closeStreakButtonText}
              >
                Keep The Streak Going! 🚀
              </Button>
            </ScrollView>
          </Surface>
        </BlurView>
      </Modal>
    </Portal>
  );

  const renderDailyTip = () => (
    <Card style={styles.tipCard}>
      <Card.Content style={styles.tipContent}>
        <View style={styles.tipHeader}>
          <Icon name="lightbulb" size={24} color="#FFD700" />
          <Text style={styles.tipTitle}>💡 Daily Tip</Text>
        </View>
        <Text style={styles.tipText}>
          Complete your easiest quests first to build momentum for the day! 
          Small wins lead to big victories! 🌟
        </Text>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
            title="Updating quests..."
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderStreakSection()}
        {renderDailyTip()}
        
        <View style={styles.questsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🎯 Today's Quests</Text>
            <Text style={styles.sectionSubtitle}>
              Complete all quests to maximize your XP!
            </Text>
          </View>
          
          {mockDailyQuests.map((quest, index) => 
            renderQuestCard(quest, index)
          )}
        </View>
        
        <View style={styles.bottomPadding} />
      </ScrollView>
      
      <FAB
        icon="refresh"
        style={styles.fab}
        onPress={() => Alert.alert('🔄 New Quests!', 'Fresh daily quests will be available tomorrow! Keep up the great work!')}
      />
      
      {renderRewardModal()}
      {renderStreakModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerGradient: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: '#FFF',
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  headerDate: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: SPACING.lg,
  },
  progressOverview: {
    width: '100%',
    alignItems: 'center',
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: SPACING.sm,
  },
  progressLabel: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.9)',
  },
  progressValue: {
    ...TEXT_STYLES.body,
    color: '#FFF',
    fontWeight: 'bold',
  },
  overallProgressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginBottom: SPACING.sm,
  },
  xpInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  xpText: {
    ...TEXT_STYLES.body,
    color: '#FFF',
    marginLeft: SPACING.xs,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  // Streak section
  streakCard: {
    margin: SPACING.md,
    marginBottom: SPACING.sm,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  streakGradient: {
    padding: SPACING.md,
  },
  streakContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakIcon: {
    marginRight: SPACING.md,
  },
  streakInfo: {
    flex: 1,
  },
  streakTitle: {
    ...TEXT_STYLES.h4,
    color: '#FFF',
    fontWeight: 'bold',
  },
  streakDays: {
    ...TEXT_STYLES.h2,
    color: '#FFF',
    fontWeight: 'bold',
    marginTop: SPACING.xs,
  },
  streakBest: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
    marginTop: SPACING.xs,
  },
  streakReward: {
    alignItems: 'flex-end',
  },
  nextRewardText: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
  },
  nextRewardTitle: {
    ...TEXT_STYLES.body,
    color: '#FFF',
    fontWeight: 'bold',
    textAlign: 'right',
  },
  nextRewardDays: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
    marginTop: SPACING.xs,
  },
  // Tip section
  tipCard: {
    margin: SPACING.md,
    marginBottom: SPACING.sm,
    elevation: 2,
    borderRadius: 12,
  },
  tipContent: {
    padding: SPACING.md,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  tipTitle: {
    ...TEXT_STYLES.h4,
    fontWeight: 'bold',
    marginLeft: SPACING.sm,
    color: COLORS.text,
  },
  tipText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  // Quests section
  questsSection: {
    padding: SPACING.md,
  },
  sectionHeader: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  sectionSubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  questCard: {
    marginBottom: SPACING.lg,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  completedQuestCard: {
    opacity: 0.8,
  },
  questHeader: {
    padding: SPACING.md,
  },
  questHeaderContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  questIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  questInfo: {
    flex: 1,
  },
  questTitle: {
    ...TEXT_STYLES.h4,
    color: '#FFF',
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  questDescription: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.9)',
  },
  questMeta: {
    alignItems: 'flex-end',
  },
  difficultyChip: {
    borderColor: 'rgba(255,255,255,0.5)',
  },
  difficultyText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  questContent: {
    padding: SPACING.md,
  },
  questProgress: {
    marginBottom: SPACING.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  progressTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.text,
  },
  progressPercentage: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  questProgressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E0E0E0',
    marginBottom: SPACING.sm,
  },
  progressDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedText: {
    ...TEXT_STYLES.caption,
    color: '#4CAF50',
    marginLeft: SPACING.xs,
    fontWeight: '500',
  },
  questRewards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    color: COLORS.text,
    fontWeight: '500',
  },
  questButton: {
    borderRadius: 25,
    paddingVertical: SPACING.sm,
  },
  questButtonText: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  bottomPadding: {
    height: 100,
  },
  // Modal styles
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
    padding: SPACING.lg,
  },
  // Reward modal
  rewardModalContent: {
    width: '100%',
    maxWidth: 350,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
  },
  rewardModalHeader: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  rewardModalTitle: {
    ...TEXT_STYLES.h2,
    color: '#FFF',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  rewardModalBody: {
    backgroundColor: '#FFF',
    padding: SPACING.lg,
    alignItems: 'center',
  },
  rewardQuestTitle: {
    ...TEXT_STYLES.h4,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.lg,
    color: COLORS.text,
  },
  rewardsList: {
    width: '100%',
    marginBottom: SPACING.lg,
  },
  rewardItemText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.sm,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  encouragementText: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    fontStyle: 'italic',
  },
  claimButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 25,
    paddingHorizontal: SPACING.xl,
  },
  claimButtonText: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Streak modal
  streakModalContent: {
    width: '100%',
    maxWidth: 400,
    maxHeight: height * 0.8,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
  },
  streakModalHeader: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  streakModalTitle: {
    ...TEXT_STYLES.h2,
    color: '#FFF',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  streakModalBody: {
    backgroundColor: '#FFF',
    padding: SPACING.lg,
    maxHeight: height * 0.5,
  },
  streakModalText: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    color: COLORS.text,
    marginBottom: SPACING.lg,
    fontWeight: '500',
  },
  streakRewardsList: {
    marginBottom: SPACING.lg,
  },
  streakRewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginBottom: SPACING.sm,
  },
  claimedRewardItem: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  availableRewardItem: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  streakRewardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  streakRewardDay: {
    ...TEXT_STYLES.body,
    color: '#FFF',
    fontWeight: 'bold',
  },
  streakRewardText: {
    ...TEXT_STYLES.body,
    flex: 1,
    fontWeight: '500',
    color: COLORS.text,
  },
  claimedRewardText: {
    color: '#4CAF50',
    textDecorationLine: 'line-through',
  },
  availableRewardText: {
    color: '#FF9800',
    fontWeight: 'bold',
  },
  closeStreakButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 25,
    paddingVertical: SPACING.sm,
    marginTop: SPACING.md,
  },
  closeStreakButtonText: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default DailyQuests;