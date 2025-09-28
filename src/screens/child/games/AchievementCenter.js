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
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from 'expo-blur';

// Import your established design system
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const AchievementCenter = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, achievements, userStats } = useSelector(state => state.user);
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [animatedValue] = useState(new Animated.Value(0));

  // Mock data for achievements and stats
  const mockUserStats = {
    level: 12,
    totalPoints: 2450,
    currentStreak: 7,
    bestStreak: 15,
    totalTrainingSessions: 45,
    completedChallenges: 23,
    experiencePoints: 2450,
    nextLevelPoints: 2800,
    badges: 18,
    ...userStats
  };

  const mockAchievements = [
    {
      id: 1,
      title: 'First Steps Champion! 🏆',
      description: 'Completed your first training session',
      category: 'training',
      points: 100,
      earned: true,
      earnedDate: '2024-08-15',
      icon: 'jump-rope',
      rarity: 'common',
      progress: 100
    },
    {
      id: 2,
      title: 'Speed Demon ⚡',
      description: 'Improved your sprint time by 10%',
      category: 'performance',
      points: 200,
      earned: true,
      earnedDate: '2024-08-20',
      icon: 'flash-on',
      rarity: 'rare',
      progress: 100
    },
    {
      id: 3,
      title: 'Team Player 🤝',
      description: 'Attended 5 team training sessions',
      category: 'social',
      points: 150,
      earned: true,
      earnedDate: '2024-08-25',
      icon: 'group',
      rarity: 'common',
      progress: 100
    },
    {
      id: 4,
      title: 'Consistency King 👑',
      description: 'Train for 10 days in a row',
      category: 'streak',
      points: 300,
      earned: false,
      icon: 'trending-up',
      rarity: 'epic',
      progress: 70,
      currentProgress: 7,
      totalRequired: 10
    },
    {
      id: 5,
      title: 'Perfect Form 🎯',
      description: 'Complete a drill with 95%+ accuracy',
      category: 'performance',
      points: 250,
      earned: false,
      icon: 'my-location',
      rarity: 'rare',
      progress: 80,
      currentProgress: 4,
      totalRequired: 5
    },
    {
      id: 6,
      title: 'Rising Star ⭐',
      description: 'Reach level 15',
      category: 'level',
      points: 500,
      earned: false,
      icon: 'star',
      rarity: 'legendary',
      progress: 80,
      currentProgress: 12,
      totalRequired: 15
    }
  ];

  const categories = [
    { key: 'all', label: 'All', icon: 'apps' },
    { key: 'training', label: 'Training', icon: 'fitness-center' },
    { key: 'performance', label: 'Performance', icon: 'speed' },
    { key: 'social', label: 'Social', icon: 'group' },
    { key: 'streak', label: 'Streaks', icon: 'local-fire-department' },
    { key: 'level', label: 'Levels', icon: 'trending-up' }
  ];

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return '#4CAF50';
      case 'rare': return '#2196F3';
      case 'epic': return '#9C27B0';
      case 'legendary': return '#FF9800';
      default: return COLORS.primary;
    }
  };

  const filteredAchievements = selectedCategory === 'all' 
    ? mockAchievements 
    : mockAchievements.filter(achievement => achievement.category === selectedCategory);

  const earnedAchievements = filteredAchievements.filter(a => a.earned);
  const unlockedAchievements = filteredAchievements.filter(a => !a.earned);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('🎉 Achievement Center Updated!', 'Your latest achievements have been synced!');
    }, 2000);
  }, []);

  const handleAchievementPress = (achievement) => {
    Vibration.vibrate(50);
    setSelectedAchievement(achievement);
    setShowAchievementModal(true);
  };

  const calculateProgressPercentage = () => {
    return (mockUserStats.experiencePoints - (Math.floor(mockUserStats.level / 5) * 500)) / 
           ((mockUserStats.nextLevelPoints - (Math.floor(mockUserStats.level / 5) * 500)) || 1);
  };

  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.headerGradient}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.headerContent}>
        <View style={styles.levelContainer}>
          <Avatar.Text 
            size={80} 
            label={mockUserStats.level.toString()} 
            style={styles.levelAvatar}
            labelStyle={styles.levelText}
          />
          <Text style={styles.levelLabel}>Level {mockUserStats.level}</Text>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Icon name="stars" size={24} color="#FFD700" />
            <Text style={styles.statValue}>{mockUserStats.totalPoints}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
          
          <View style={styles.statItem}>
            <Icon name="local-fire-department" size={24} color="#FF6B35" />
            <Text style={styles.statValue}>{mockUserStats.currentStreak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          
          <View style={styles.statItem}>
            <Icon name="jump-rope" size={24} color="#FFD700" />
            <Text style={styles.statValue}>{earnedAchievements.length}</Text>
            <Text style={styles.statLabel}>Badges</Text>
          </View>
        </View>
        
        <View style={styles.progressContainer}>
          <Text style={styles.progressLabel}>
            {mockUserStats.experiencePoints} / {mockUserStats.nextLevelPoints} XP
          </Text>
          <ProgressBar 
            progress={calculateProgressPercentage()}
            color="#FFD700"
            style={styles.progressBar}
          />
          <Text style={styles.nextLevelText}>
            {mockUserStats.nextLevelPoints - mockUserStats.experiencePoints} XP to Level {mockUserStats.level + 1} 🚀
          </Text>
        </View>
      </View>
    </LinearGradient>
  );

  const renderCategoryTabs = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.categoryContainer}
      contentContainerStyle={styles.categoryContent}
    >
      {categories.map((category) => (
        <TouchableOpacity
          key={category.key}
          onPress={() => setSelectedCategory(category.key)}
          style={[
            styles.categoryTab,
            selectedCategory === category.key && styles.selectedCategoryTab
          ]}
        >
          <Icon 
            name={category.icon} 
            size={20} 
            color={selectedCategory === category.key ? '#FFF' : COLORS.primary} 
          />
          <Text style={[
            styles.categoryText,
            selectedCategory === category.key && styles.selectedCategoryText
          ]}>
            {category.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderAchievementCard = (achievement, index) => {
    const animatedStyle = {
      opacity: animatedValue,
      transform: [{
        translateY: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [50, 0],
        }),
      }],
    };

    return (
      <Animated.View 
        key={achievement.id} 
        style={[animatedStyle, { 
          transform: [{ 
            translateY: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [50 + (index * 20), 0],
            })
          }]
        }]}
      >
        <TouchableOpacity onPress={() => handleAchievementPress(achievement)}>
          <Card style={[
            styles.achievementCard,
            achievement.earned && styles.earnedCard,
            { borderLeftColor: getRarityColor(achievement.rarity) }
          ]}>
            <Card.Content style={styles.cardContent}>
              <View style={styles.achievementHeader}>
                <Surface style={[
                  styles.iconContainer,
                  { backgroundColor: achievement.earned ? getRarityColor(achievement.rarity) : '#E0E0E0' }
                ]}>
                  <Icon 
                    name={achievement.icon} 
                    size={30} 
                    color={achievement.earned ? '#FFF' : '#999'} 
                  />
                </Surface>
                
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
                  
                  {!achievement.earned && achievement.currentProgress && (
                    <View style={styles.progressSection}>
                      <Text style={styles.progressText}>
                        Progress: {achievement.currentProgress}/{achievement.totalRequired}
                      </Text>
                      <ProgressBar 
                        progress={achievement.progress / 100}
                        color={getRarityColor(achievement.rarity)}
                        style={styles.achievementProgressBar}
                      />
                    </View>
                  )}
                </View>
                
                <View style={styles.achievementMeta}>
                  <Chip 
                    mode="outlined"
                    style={[styles.rarityChip, { borderColor: getRarityColor(achievement.rarity) }]}
                    textStyle={[styles.rarityText, { color: getRarityColor(achievement.rarity) }]}
                  >
                    {achievement.rarity.toUpperCase()}
                  </Chip>
                  <Text style={styles.pointsText}>+{achievement.points} XP</Text>
                </View>
              </View>
              
              {achievement.earned && (
                <View style={styles.earnedBadge}>
                  <Icon name="check-circle" size={20} color="#4CAF50" />
                  <Text style={styles.earnedText}>
                    Earned {new Date(achievement.earnedDate).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderAchievementModal = () => (
    <Portal>
      <Modal
        visible={showAchievementModal}
        onDismiss={() => setShowAchievementModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.blurView} blurType="light" blurAmount={10}>
          {selectedAchievement && (
            <Surface style={styles.modalContent}>
              <LinearGradient
                colors={[getRarityColor(selectedAchievement.rarity), '#FFF']}
                style={styles.modalHeader}
              >
                <IconButton
                  icon="close"
                  size={24}
                  iconColor="#FFF"
                  style={styles.closeButton}
                  onPress={() => setShowAchievementModal(false)}
                />
                <Icon 
                  name={selectedAchievement.icon} 
                  size={60} 
                  color="#FFF"
                  style={styles.modalIcon}
                />
              </LinearGradient>
              
              <View style={styles.modalBody}>
                <Text style={styles.modalTitle}>{selectedAchievement.title}</Text>
                <Text style={styles.modalDescription}>{selectedAchievement.description}</Text>
                
                <View style={styles.modalStats}>
                  <View style={styles.modalStat}>
                    <Text style={styles.modalStatLabel}>Reward</Text>
                    <Text style={styles.modalStatValue}>+{selectedAchievement.points} XP</Text>
                  </View>
                  <View style={styles.modalStat}>
                    <Text style={styles.modalStatLabel}>Rarity</Text>
                    <Text style={[styles.modalStatValue, { color: getRarityColor(selectedAchievement.rarity) }]}>
                      {selectedAchievement.rarity.toUpperCase()}
                    </Text>
                  </View>
                </View>
                
                {selectedAchievement.earned ? (
                  <View style={styles.earnedSection}>
                    <Icon name="check-circle" size={30} color="#4CAF50" />
                    <Text style={styles.completedText}>Achievement Unlocked! 🎉</Text>
                    <Text style={styles.earnedDateText}>
                      Earned on {new Date(selectedAchievement.earnedDate).toLocaleDateString()}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.progressSection}>
                    {selectedAchievement.currentProgress && (
                      <>
                        <Text style={styles.progressTitle}>Your Progress</Text>
                        <ProgressBar 
                          progress={selectedAchievement.progress / 100}
                          color={getRarityColor(selectedAchievement.rarity)}
                          style={styles.modalProgressBar}
                        />
                        <Text style={styles.modalProgressText}>
                          {selectedAchievement.currentProgress} / {selectedAchievement.totalRequired}
                        </Text>
                      </>
                    )}
                    <Text style={styles.encouragementText}>
                      Keep training hard! You're almost there! 💪
                    </Text>
                  </View>
                )}
              </View>
            </Surface>
          )}
        </BlurView>
      </Modal>
    </Portal>
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
            title="Updating achievements..."
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderCategoryTabs()}
        
        <View style={styles.achievementsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🏆 Your Achievements</Text>
            <Text style={styles.sectionSubtitle}>
              {earnedAchievements.length} of {filteredAchievements.length} unlocked
            </Text>
          </View>
          
          {earnedAchievements.map((achievement, index) => 
            renderAchievementCard(achievement, index)
          )}
          
          {unlockedAchievements.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>🔒 Locked Achievements</Text>
                <Text style={styles.sectionSubtitle}>
                  Keep training to unlock these!
                </Text>
              </View>
              
              {unlockedAchievements.map((achievement, index) => 
                renderAchievementCard(achievement, earnedAchievements.length + index)
              )}
            </>
          )}
        </View>
        
        <View style={styles.bottomPadding} />
      </ScrollView>
      
      <FAB
        icon="jump-rope"
        style={styles.fab}
        onPress={() => Alert.alert('🎯 Keep Going!', 'Check back daily for new achievements and challenges!')}
      />
      
      {renderAchievementModal()}
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
  levelContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  levelAvatar: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  levelText: {
    ...TEXT_STYLES.h2,
    fontWeight: 'bold',
  },
  levelLabel: {
    ...TEXT_STYLES.h3,
    color: '#FFF',
    marginTop: SPACING.sm,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: SPACING.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...TEXT_STYLES.h2,
    color: '#FFF',
    fontWeight: 'bold',
    marginTop: SPACING.xs,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
    marginTop: SPACING.xs,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressLabel: {
    ...TEXT_STYLES.body,
    color: '#FFF',
    marginBottom: SPACING.sm,
    fontWeight: '500',
  },
  progressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  nextLevelText: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.9)',
    marginTop: SPACING.sm,
  },
  scrollView: {
    flex: 1,
  },
  categoryContainer: {
    backgroundColor: '#FFF',
    paddingVertical: SPACING.md,
  },
  categoryContent: {
    paddingHorizontal: SPACING.md,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  selectedCategoryTab: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.xs,
    color: COLORS.primary,
  },
  selectedCategoryText: {
    color: '#FFF',
  },
  achievementsSection: {
    padding: SPACING.md,
  },
  sectionHeader: {
    marginBottom: SPACING.lg,
    marginTop: SPACING.md,
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
  achievementCard: {
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  earnedCard: {
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
  },
  cardContent: {
    padding: SPACING.md,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    ...TEXT_STYLES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  lockedTitle: {
    color: COLORS.textSecondary,
  },
  achievementDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  progressSection: {
    marginTop: SPACING.sm,
  },
  progressText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  achievementProgressBar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0E0E0',
  },
  achievementMeta: {
    alignItems: 'flex-end',
    marginLeft: SPACING.sm,
  },
  rarityChip: {
    marginBottom: SPACING.xs,
  },
  rarityText: {
    ...TEXT_STYLES.caption,
    fontSize: 10,
  },
  pointsText: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  earnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  earnedText: {
    ...TEXT_STYLES.caption,
    color: '#4CAF50',
    marginLeft: SPACING.xs,
    fontWeight: '500',
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
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
  },
  modalHeader: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
  },
  modalIcon: {
    marginTop: SPACING.lg,
  },
  modalBody: {
    padding: SPACING.lg,
    backgroundColor: '#FFF',
  },
  modalTitle: {
    ...TEXT_STYLES.h2,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  modalDescription: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  modalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.lg,
  },
  modalStat: {
    alignItems: 'center',
  },
  modalStatLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  modalStatValue: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
    marginTop: SPACING.xs,
  },
  earnedSection: {
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 10,
  },
  completedText: {
    ...TEXT_STYLES.h4,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: SPACING.sm,
  },
  earnedDateText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  progressTitle: {
    ...TEXT_STYLES.h4,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  modalProgressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    marginBottom: SPACING.sm,
  },
  modalProgressText: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: SPACING.md,
  },
  encouragementText: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    color: COLORS.primary,
    fontWeight: '500',
    fontStyle: 'italic',
  },
});

export default AchievementCenter;