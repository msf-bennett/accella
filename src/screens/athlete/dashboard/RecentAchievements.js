import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
  Animated,
  Alert,
  Dimensions,
  TouchableOpacity,
  Platform,
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
  Searchbar,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#f44336',
  warning: '#ff9800',
  info: '#2196F3',
  background: '#f8f9fa',
  surface: '#ffffff',
  text: '#333333',
  textLight: '#666666',
  border: '#e0e0e0',
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
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
    color: COLORS.textLight,
  },
};

const { width, height } = Dimensions.get('window');

const RecentAchievements = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];
  const scrollY = useRef(new Animated.Value(0)).current;

  // Redux state
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const achievements = useSelector(state => state.user.achievements);
  const stats = useSelector(state => state.user.stats);

  // Mock achievement data
  const achievementData = [
    {
      id: '1',
      title: 'Week Warrior',
      description: 'Completed 7 consecutive days of training',
      emoji: '⚡',
      type: 'consistency',
      tier: 'gold',
      earnedDate: '2025-08-20',
      points: 100,
      rarity: 'common',
      progress: 100,
      isNew: true,
      category: 'Training',
      requirements: 'Train for 7 consecutive days',
      milestones: [
        { day: 1, completed: true },
        { day: 3, completed: true },
        { day: 5, completed: true },
        { day: 7, completed: true },
      ],
    },
    {
      id: '2',
      title: 'Perfect Form Master',
      description: 'Achieved perfect form rating in 10 exercises',
      emoji: '🎯',
      type: 'technique',
      tier: 'silver',
      earnedDate: '2025-08-19',
      points: 75,
      rarity: 'uncommon',
      progress: 100,
      isNew: true,
      category: 'Technique',
      requirements: 'Get perfect form in 10 different exercises',
      milestones: [
        { exercise: 'Push-ups', completed: true },
        { exercise: 'Squats', completed: true },
        { exercise: 'Pull-ups', completed: true },
      ],
    },
    {
      id: '3',
      title: 'Strength Beast',
      description: 'Increased bench press by 20lbs in one month',
      emoji: '💪',
      type: 'strength',
      tier: 'gold',
      earnedDate: '2025-08-18',
      points: 150,
      rarity: 'rare',
      progress: 100,
      isNew: false,
      category: 'Strength',
      requirements: 'Increase bench press by 20+ lbs',
      milestones: [
        { weight: '135 lbs', completed: true },
        { weight: '145 lbs', completed: true },
        { weight: '155 lbs', completed: true },
      ],
    },
    {
      id: '4',
      title: 'Nutrition Champion',
      description: 'Logged meals for 14 consecutive days',
      emoji: '🥗',
      type: 'nutrition',
      tier: 'bronze',
      earnedDate: '2025-08-17',
      points: 50,
      rarity: 'common',
      progress: 100,
      isNew: false,
      category: 'Nutrition',
      requirements: 'Log meals for 14 consecutive days',
    },
    {
      id: '5',
      title: 'Endurance Elite',
      description: 'Completed 5K run under 25 minutes',
      emoji: '🏃‍♂️',
      type: 'cardio',
      tier: 'gold',
      earnedDate: '2025-08-15',
      points: 125,
      rarity: 'rare',
      progress: 100,
      isNew: false,
      category: 'Cardio',
      requirements: 'Complete 5K run in under 25 minutes',
    },
    {
      id: '6',
      title: 'Early Bird',
      description: 'Completed morning workouts for 5 days',
      emoji: '🌅',
      type: 'consistency',
      tier: 'silver',
      earnedDate: '2025-08-14',
      points: 75,
      rarity: 'uncommon',
      progress: 100,
      isNew: false,
      category: 'Training',
      requirements: 'Complete 5 morning workouts',
    },
  ];

  const filterCategories = [
    { label: 'All', value: 'all', icon: 'star' },
    { label: 'Training', value: 'Training', icon: 'fitness-center' },
    { label: 'Strength', value: 'Strength', icon: 'strong' },
    { label: 'Cardio', value: 'Cardio', icon: 'directions-run' },
    { label: 'Technique', value: 'Technique', icon: 'gps-fixed' },
    { label: 'Nutrition', value: 'Nutrition', icon: 'restaurant' },
  ];

  useEffect(() => {
    // Animate screen entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1500));
      // dispatch(refreshAchievements());
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const filteredAchievements = achievementData.filter(achievement => {
    const matchesFilter = selectedFilter === 'all' || achievement.category === selectedFilter;
    const matchesSearch = achievement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         achievement.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getTierColor = (tier) => {
    switch (tier) {
      case 'gold': return COLORS.gold;
      case 'silver': return COLORS.silver;
      case 'bronze': return COLORS.bronze;
      default: return COLORS.primary;
    }
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return COLORS.success;
      case 'uncommon': return COLORS.info;
      case 'rare': return COLORS.warning;
      case 'legendary': return COLORS.secondary;
      default: return COLORS.primary;
    }
  };

  const handleAchievementPress = (achievement) => {
    setSelectedAchievement(achievement);
    setModalVisible(true);
  };

  const shareAchievement = (achievement) => {
    Alert.alert(
      'Share Achievement 🎉',
      `Feature in development - Share your "${achievement.title}" achievement with friends!`,
      [{ text: 'Got it!', style: 'default' }]
    );
  };

  const renderStatsHeader = () => {
    const totalAchievements = achievementData.length;
    const totalPoints = achievementData.reduce((sum, ach) => sum + ach.points, 0);
    const newAchievements = achievementData.filter(ach => ach.isNew).length;

    return (
      <Animated.View
        style={[
          styles.statsContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.statsGradient}
        >
          <Text style={styles.statsTitle}>Achievement Stats 🏆</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{totalAchievements}</Text>
              <Text style={styles.statLabel}>Total Earned</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{totalPoints}</Text>
              <Text style={styles.statLabel}>Total Points</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{newAchievements}</Text>
              <Text style={styles.statLabel}>New This Week</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderFilterChips = () => (
    <View style={styles.filtersContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContent}
      >
        {filterCategories.map((category, index) => (
          <Chip
            key={category.value}
            icon={category.icon}
            selected={selectedFilter === category.value}
            onPress={() => setSelectedFilter(category.value)}
            style={[
              styles.filterChip,
              selectedFilter === category.value && styles.selectedFilterChip,
            ]}
            textStyle={[
              styles.filterChipText,
              selectedFilter === category.value && styles.selectedFilterChipText,
            ]}
          >
            {category.label}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const renderAchievementCard = ({ item: achievement, index }) => {
    const inputRange = [-1, 0, index * 100, (index + 2) * 100];
    const scale = scrollY.interpolate({
      inputRange,
      outputRange: [1, 1, 1, 0.8],
      extrapolate: 'clamp',
    });

    const opacity = scrollY.interpolate({
      inputRange,
      outputRange: [1, 1, 1, 0.5],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={[
          styles.achievementCardContainer,
          {
            transform: [{ scale }],
            opacity,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => handleAchievementPress(achievement)}
          activeOpacity={0.8}
        >
          <Card style={styles.achievementCard}>
            <LinearGradient
              colors={[
                getTierColor(achievement.tier),
                getTierColor(achievement.tier) + '80',
              ]}
              style={styles.achievementHeader}
            >
              <View style={styles.achievementHeaderContent}>
                <View style={styles.achievementIcon}>
                  <Text style={styles.achievementEmoji}>{achievement.emoji}</Text>
                  {achievement.isNew && (
                    <Surface style={styles.newBadge}>
                      <Text style={styles.newBadgeText}>NEW!</Text>
                    </Surface>
                  )}
                </View>
                <View style={styles.achievementTierContainer}>
                  <Chip
                    style={[styles.tierChip, { backgroundColor: getTierColor(achievement.tier) }]}
                    textStyle={styles.tierChipText}
                  >
                    {achievement.tier.toUpperCase()}
                  </Chip>
                </View>
              </View>
            </LinearGradient>

            <Card.Content style={styles.achievementContent}>
              <Text style={styles.achievementTitle}>{achievement.title}</Text>
              <Text style={styles.achievementDescription}>{achievement.description}</Text>
              
              <View style={styles.achievementMeta}>
                <View style={styles.achievementMetaItem}>
                  <Icon name="calendar-today" size={16} color={COLORS.textLight} />
                  <Text style={styles.achievementDate}>
                    {new Date(achievement.earnedDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
                <View style={styles.achievementMetaItem}>
                  <Icon name="stars" size={16} color={getRarityColor(achievement.rarity)} />
                  <Text style={[styles.achievementRarity, { color: getRarityColor(achievement.rarity) }]}>
                    {achievement.rarity}
                  </Text>
                </View>
                <View style={styles.achievementMetaItem}>
                  <Icon name="jump-rope" size={16} color={COLORS.warning} />
                  <Text style={styles.achievementPoints}>+{achievement.points}</Text>
                </View>
              </View>

              <View style={styles.achievementActions}>
                <Button
                  mode="outlined"
                  compact
                  onPress={() => shareAchievement(achievement)}
                  style={styles.shareButton}
                  contentStyle={styles.shareButtonContent}
                >
                  Share
                </Button>
                <Button
                  mode="contained"
                  compact
                  onPress={() => handleAchievementPress(achievement)}
                  style={styles.detailsButton}
                  contentStyle={styles.detailsButtonContent}
                >
                  Details
                </Button>
              </View>
            </Card.Content>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderAchievementModal = () => {
    if (!selectedAchievement) return null;

    return (
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView intensity={100} style={styles.modalBlur}>
            <Card style={styles.modalCard}>
              <LinearGradient
                colors={[
                  getTierColor(selectedAchievement.tier),
                  getTierColor(selectedAchievement.tier) + '80',
                ]}
                style={styles.modalHeader}
              >
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.modalCloseButton}
                >
                  <Icon name="close" size={24} color="white" />
                </TouchableOpacity>
                
                <View style={styles.modalHeaderContent}>
                  <Text style={styles.modalEmoji}>{selectedAchievement.emoji}</Text>
                  <Text style={styles.modalTitle}>{selectedAchievement.title}</Text>
                  <Text style={styles.modalSubtitle}>{selectedAchievement.description}</Text>
                </View>
              </LinearGradient>

              <Card.Content style={styles.modalContent}>
                <View style={styles.modalStats}>
                  <View style={styles.modalStatItem}>
                    <Text style={styles.modalStatLabel}>Points Earned</Text>
                    <Text style={styles.modalStatValue}>+{selectedAchievement.points}</Text>
                  </View>
                  <View style={styles.modalStatItem}>
                    <Text style={styles.modalStatLabel}>Rarity</Text>
                    <Text style={[styles.modalStatValue, { color: getRarityColor(selectedAchievement.rarity) }]}>
                      {selectedAchievement.rarity}
                    </Text>
                  </View>
                  <View style={styles.modalStatItem}>
                    <Text style={styles.modalStatLabel}>Date Earned</Text>
                    <Text style={styles.modalStatValue}>
                      {new Date(selectedAchievement.earnedDate).toLocaleDateString()}
                    </Text>
                  </View>
                </View>

                <Text style={styles.modalSectionTitle}>Requirements</Text>
                <Text style={styles.modalRequirements}>{selectedAchievement.requirements}</Text>

                {selectedAchievement.milestones && (
                  <>
                    <Text style={styles.modalSectionTitle}>Milestones</Text>
                    {selectedAchievement.milestones.map((milestone, index) => (
                      <View key={index} style={styles.milestoneItem}>
                        <Icon
                          name={milestone.completed ? 'check-circle' : 'radio-button-unchecked'}
                          size={20}
                          color={milestone.completed ? COLORS.success : COLORS.border}
                        />
                        <Text style={styles.milestoneText}>
                          {milestone.day ? `Day ${milestone.day}` : 
                           milestone.exercise ? milestone.exercise :
                           milestone.weight ? milestone.weight : 'Milestone'}
                        </Text>
                      </View>
                    ))}
                  </>
                )}

                <Button
                  mode="contained"
                  onPress={() => shareAchievement(selectedAchievement)}
                  style={styles.modalShareButton}
                  contentStyle={styles.modalShareButtonContent}
                  icon="share"
                >
                  Share Achievement
                </Button>
              </Card.Content>
            </Card>
          </BlurView>
        </Modal>
      </Portal>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor="transparent"
        barStyle="light-content"
        translucent={true}
      />

      {renderStatsHeader()}

      <View style={styles.content}>
        <Searchbar
          placeholder="Search achievements..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          inputStyle={styles.searchbarInput}
          iconColor={COLORS.primary}
        />

        {renderFilterChips()}

        <Animated.FlatList
          data={filteredAchievements}
          keyExtractor={(item) => item.id}
          renderItem={renderAchievementCard}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          contentContainerStyle={styles.listContent}
        />
      </View>

      {renderAchievementModal()}

      <FAB
        icon="jump-rope"
        style={styles.fab}
        color="white"
        onPress={() => {
          Alert.alert(
            'Achievement Center 🏆',
            'Feature in development - Browse all available achievements and track your progress.',
            [{ text: 'Got it!', style: 'default' }]
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
  statsContainer: {
    marginBottom: SPACING.md,
  },
  statsGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight + 30,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  statsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: SPACING.sm,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  searchbar: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    elevation: 2,
  },
  searchbarInput: {
    color: COLORS.text,
  },
  filtersContainer: {
    marginBottom: SPACING.md,
  },
  filtersContent: {
    paddingRight: SPACING.md,
  },
  filterChip: {
    marginRight: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  selectedFilterChip: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    color: COLORS.text,
  },
  selectedFilterChipText: {
    color: 'white',
  },
  listContent: {
    paddingBottom: 100,
  },
  achievementCardContainer: {
    marginBottom: SPACING.md,
  },
  achievementCard: {
    overflow: 'hidden',
    elevation: 4,
  },
  achievementHeader: {
    padding: SPACING.md,
  },
  achievementHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  achievementIcon: {
    position: 'relative',
  },
  achievementEmoji: {
    fontSize: 40,
  },
  newBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: COLORS.error,
    borderRadius: 8,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
  },
  newBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  achievementTierContainer: {
    alignItems: 'flex-end',
  },
  tierChip: {
    elevation: 0,
  },
  tierChipText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  achievementContent: {
    padding: SPACING.md,
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  achievementDescription: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  achievementMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  achievementMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementDate: {
    fontSize: 12,
    color: COLORS.textLight,
    marginLeft: SPACING.xs,
  },
  achievementRarity: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: SPACING.xs,
    textTransform: 'capitalize',
  },
  achievementPoints: {
    fontSize: 12,
    color: COLORS.warning,
    fontWeight: 'bold',
    marginLeft: SPACING.xs,
  },
  achievementActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  shareButton: {
    flex: 1,
    marginRight: SPACING.sm,
    borderColor: COLORS.primary,
  },
  shareButtonContent: {
    height: 32,
  },
  detailsButton: {
    flex: 1,
    marginLeft: SPACING.sm,
    backgroundColor: COLORS.primary,
  },
  detailsButtonContent: {
    height: 32,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  modalBlur: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalCard: {
    maxHeight: height * 0.8,
  },
  modalHeader: {
    padding: SPACING.lg,
    position: 'relative',
  },
  modalCloseButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    zIndex: 1,
  },
  modalHeaderContent: {
    alignItems: 'center',
    paddingTop: SPACING.md,
  },
  modalEmoji: {
    fontSize: 60,
    marginBottom: SPACING.sm,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  modalSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  modalContent: {
    padding: SPACING.lg,
  },
  modalStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  modalStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  modalStatLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: SPACING.xs,
  },
  modalStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  modalRequirements: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  milestoneText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  modalShareButton: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.primary,
  },
  modalShareButtonContent: {
    height: 40,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.warning,
  },
});

export default RecentAchievements;