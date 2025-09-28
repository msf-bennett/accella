import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  Animated,
  Vibration,
  Alert,
  Dimensions,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Card, ProgressBar, Avatar, Chip, Surface, FAB } from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import your established constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const Achievement = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user, achievements, stats, currentLevel } = useSelector(state => ({
    user: state.auth.user,
    achievements: state.achievements.userAchievements || [],
    stats: state.achievements.stats || {},
    currentLevel: state.achievements.currentLevel || 1
  }));

  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [animatedValue] = useState(new Animated.Value(0));

  useEffect(() => {
    StatusBar.setBarStyle('light-content', true);
    StatusBar.setTranslucent(true);
    
    // Entrance animation
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Load achievements data
    loadAchievements();
  }, []);

  const loadAchievements = useCallback(async () => {
    try {
      // In a real app, this would fetch from your API
      // dispatch(fetchUserAchievements());
      console.log('Loading achievements for child account...');
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAchievements();
    setRefreshing(false);
    Vibration.vibrate(50);
  }, [loadAchievements]);

  const handleAchievementPress = (achievement) => {
    Vibration.vibrate(50);
    Alert.alert(
      `🏆 ${achievement.title}`,
      `${achievement.description}\n\n${achievement.earned ? '✅ Completed!' : '⏳ In Progress'}`,
      [{ text: 'Awesome!', style: 'default' }]
    );
  };

  const handleShareAchievement = (achievement) => {
    Alert.alert(
      '🚧 Feature Coming Soon!',
      'Achievement sharing will be available in the next update!',
      [{ text: 'OK', style: 'default' }]
    );
  };

  // Mock data - replace with real data from Redux
  const mockAchievements = [
    {
      id: 1,
      title: '⚽ First Goal!',
      description: 'Score your first goal in training',
      category: 'training',
      points: 50,
      earned: true,
      earnedDate: '2024-08-20',
      icon: 'sports-soccer',
      rarity: 'common'
    },
    {
      id: 2,
      title: '🔥 7-Day Streak',
      description: 'Complete 7 consecutive training sessions',
      category: 'consistency',
      points: 100,
      earned: true,
      earnedDate: '2024-08-25',
      icon: 'local-fire-department',
      rarity: 'rare'
    },
    {
      id: 3,
      title: '🏃‍♂️ Speed Demon',
      description: 'Improve your 100m sprint time by 2 seconds',
      category: 'performance',
      points: 150,
      earned: false,
      progress: 65,
      icon: 'speed',
      rarity: 'epic'
    },
    {
      id: 4,
      title: '👥 Team Player',
      description: 'Give 10 assists to teammates',
      category: 'teamwork',
      points: 75,
      earned: false,
      progress: 30,
      icon: 'group',
      rarity: 'common'
    },
    {
      id: 5,
      title: '🌟 Rising Star',
      description: 'Reach Level 10',
      category: 'progression',
      points: 500,
      earned: false,
      progress: 45,
      icon: 'star',
      rarity: 'legendary'
    }
  ];

  const mockStats = {
    totalPoints: 850,
    totalAchievements: 12,
    earnedAchievements: 5,
    currentStreak: 3,
    longestStreak: 7,
    level: 8,
    nextLevelPoints: 200
  };

  const categories = [
    { id: 'all', name: 'All', icon: 'apps' },
    { id: 'training', name: 'Training', icon: 'fitness-center' },
    { id: 'performance', name: 'Performance', icon: 'trending-up' },
    { id: 'consistency', name: 'Consistency', icon: 'schedule' },
    { id: 'teamwork', name: 'Teamwork', icon: 'group' },
    { id: 'progression', name: 'Progress', icon: 'arrow-upward' }
  ];

  const filteredAchievements = selectedCategory === 'all' 
    ? mockAchievements 
    : mockAchievements.filter(achievement => achievement.category === selectedCategory);

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return '#95a5a6';
      case 'rare': return '#3498db';
      case 'epic': return '#9b59b6';
      case 'legendary': return '#f1c40f';
      default: return '#95a5a6';
    }
  };

  const renderHeader = () => (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
      <Animated.View style={[
        styles.headerContent,
        {
          opacity: animatedValue,
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, 0]
              })
            }
          ]
        }
      ]}>
        <View style={styles.levelContainer}>
          <Avatar.Text
            size={60}
            label={mockStats.level.toString()}
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            labelStyle={{ fontSize: 24, fontWeight: 'bold', color: 'white' }}
          />
          <View style={styles.levelInfo}>
            <Text style={styles.levelTitle}>Level {mockStats.level}</Text>
            <Text style={styles.pointsText}>{mockStats.totalPoints} Points</Text>
            <View style={styles.progressContainer}>
              <ProgressBar
                progress={0.65}
                color="white"
                style={styles.levelProgress}
              />
              <Text style={styles.progressText}>
                {mockStats.nextLevelPoints} points to Level {mockStats.level + 1}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{mockStats.earnedAchievements}</Text>
            <Text style={styles.statLabel}>Earned</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{mockStats.currentStreak}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{mockStats.totalAchievements}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>
      </Animated.View>
    </LinearGradient>
  );

  const renderCategoryFilter = () => (
    <View style={styles.categoryContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            onPress={() => {
              setSelectedCategory(category.id);
              Vibration.vibrate(30);
            }}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && styles.activeCategoryChip
            ]}
          >
            <Icon 
              name={category.icon} 
              size={18} 
              color={selectedCategory === category.id ? 'white' : COLORS.primary} 
            />
            <Text style={[
              styles.categoryText,
              selectedCategory === category.id && styles.activeCategoryText
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderAchievementCard = (achievement, index) => (
    <Animated.View
      key={achievement.id}
      style={[
        styles.cardWrapper,
        {
          opacity: animatedValue,
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0]
              })
            }
          ]
        }
      ]}
    >
      <TouchableOpacity
        onPress={() => handleAchievementPress(achievement)}
        activeOpacity={0.8}
      >
        <Card style={[
          styles.achievementCard,
          achievement.earned && styles.earnedCard
        ]}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.achievementHeader}>
              <View style={styles.iconContainer}>
                <LinearGradient
                  colors={achievement.earned 
                    ? [getRarityColor(achievement.rarity), '#f39c12'] 
                    : ['#ecf0f1', '#bdc3c7']
                  }
                  style={styles.iconGradient}
                >
                  <Icon
                    name={achievement.icon}
                    size={28}
                    color="white"
                  />
                </LinearGradient>
                {achievement.earned && (
                  <View style={styles.checkBadge}>
                    <Icon name="check" size={16} color="white" />
                  </View>
                )}
              </View>
              
              <View style={styles.achievementInfo}>
                <Text style={styles.achievementTitle}>{achievement.title}</Text>
                <Text style={styles.achievementDescription}>
                  {achievement.description}
                </Text>
                
                <View style={styles.achievementMeta}>
                  <Chip
                    mode="outlined"
                    textStyle={styles.rarityText}
                    style={[styles.rarityChip, { borderColor: getRarityColor(achievement.rarity) }]}
                  >
                    {achievement.rarity.toUpperCase()}
                  </Chip>
                  <Text style={styles.pointsValue}>+{achievement.points} pts</Text>
                </View>
              </View>

              {!achievement.earned && (
                <TouchableOpacity
                  onPress={() => handleShareAchievement(achievement)}
                  style={styles.shareButton}
                >
                  <Icon name="share" size={20} color={COLORS.primary} />
                </TouchableOpacity>
              )}
            </View>

            {!achievement.earned && achievement.progress && (
              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Progress</Text>
                  <Text style={styles.progressPercentage}>{achievement.progress}%</Text>
                </View>
                <ProgressBar
                  progress={achievement.progress / 100}
                  color={COLORS.primary}
                  style={styles.achievementProgress}
                />
              </View>
            )}

            {achievement.earned && achievement.earnedDate && (
              <View style={styles.earnedSection}>
                <Icon name="event" size={16} color={COLORS.success} />
                <Text style={styles.earnedDate}>
                  Earned on {new Date(achievement.earnedDate).toLocaleDateString()}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {renderHeader()}
      
      <View style={styles.content}>
        {renderCategoryFilter()}
        
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
              progressBackgroundColor="white"
            />
          }
        >
          <View style={styles.achievementsGrid}>
            {filteredAchievements.map((achievement, index) =>
              renderAchievementCard(achievement, index)
            )}
          </View>
          
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>

      <FAB
        style={styles.fab}
        icon="jump-rope"
        onPress={() => {
          Vibration.vibrate(50);
          Alert.alert(
            '🚧 Feature Coming Soon!',
            'Leaderboard and achievement comparison coming soon!',
            [{ text: 'Awesome!', style: 'default' }]
          );
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
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    alignItems: 'center',
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  levelInfo: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  levelTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: 'bold',
  },
  pointsText: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: SPACING.xs,
  },
  progressContainer: {
    alignItems: 'flex-start',
  },
  levelProgress: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    width: width * 0.4,
    marginBottom: SPACING.xs,
  },
  progressText: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: SPACING.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: 'bold',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
    marginTop: SPACING.xs,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  categoryContainer: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginHorizontal: SPACING.xs,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: 'white',
  },
  activeCategoryChip: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
    fontSize: 14,
  },
  activeCategoryText: {
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  achievementsGrid: {
    padding: SPACING.md,
  },
  cardWrapper: {
    marginBottom: SPACING.md,
  },
  achievementCard: {
    backgroundColor: 'white',
    elevation: 4,
    borderRadius: 12,
  },
  earnedCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  cardContent: {
    padding: SPACING.md,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    position: 'relative',
    marginRight: SPACING.md,
  },
  iconGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: COLORS.success,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  achievementDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  achievementMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rarityChip: {
    height: 24,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  pointsValue: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  shareButton: {
    padding: SPACING.xs,
  },
  progressSection: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  progressLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
  },
  progressPercentage: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  achievementProgress: {
    height: 8,
    borderRadius: 4,
  },
  earnedSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  earnedDate: {
    ...TEXT_STYLES.caption,
    color: COLORS.success,
    marginLeft: SPACING.xs,
  },
  bottomSpacing: {
    height: 100,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default Achievement;