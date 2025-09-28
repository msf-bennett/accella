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
  FlatList,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Card, ProgressBar, Avatar, Chip, Surface, FAB, Searchbar } from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import your established constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const Badges = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user, badges, badgeStats } = useSelector(state => ({
    user: state.auth.user,
    badges: state.badges.userBadges || [],
    badgeStats: state.badges.stats || {}
  }));

  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [animatedValue] = useState(new Animated.Value(0));
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    StatusBar.setBarStyle('light-content', true);
    StatusBar.setTranslucent(true);
    
    // Entrance animation
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Load badges data
    loadBadges();
  }, []);

  const loadBadges = useCallback(async () => {
    try {
      // In a real app, this would fetch from your API
      // dispatch(fetchUserBadges());
      console.log('Loading badges for child account...');
    } catch (error) {
      console.error('Error loading badges:', error);
    }
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBadges();
    setRefreshing(false);
    Vibration.vibrate(50);
  }, [loadBadges]);

  const handleBadgePress = (badge) => {
    Vibration.vibrate(50);
    Alert.alert(
      `${badge.emoji} ${badge.name}`,
      `${badge.description}\n\n${badge.earned ? `✅ Earned: ${new Date(badge.earnedDate).toLocaleDateString()}` : '⏳ Keep going to unlock this badge!'}${badge.specialReward ? `\n\n🎁 Special Reward: ${badge.specialReward}` : ''}`,
      [
        { text: 'Cool!', style: 'default' },
        badge.earned && { text: 'Share', onPress: () => handleShareBadge(badge) }
      ].filter(Boolean)
    );
  };

  const handleShareBadge = (badge) => {
    Alert.alert(
      '🚧 Feature Coming Soon!',
      'Badge sharing will be available in the next update!',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    setSearchQuery('');
    Vibration.vibrate(30);
  };

  // Mock data - replace with real data from Redux
  const mockBadges = [
    {
      id: 1,
      name: 'First Steps',
      emoji: '👶',
      description: 'Complete your first training session',
      category: 'beginner',
      earned: true,
      earnedDate: '2024-08-15',
      rarity: 'common',
      specialReward: null
    },
    {
      id: 2,
      name: 'Goal Getter',
      emoji: '⚽',
      description: 'Score 10 goals in training',
      category: 'skills',
      earned: true,
      earnedDate: '2024-08-20',
      rarity: 'rare',
      specialReward: 'Custom Goal Celebration Animation'
    },
    {
      id: 3,
      name: 'Speed Runner',
      emoji: '💨',
      description: 'Complete a 100m sprint under 15 seconds',
      category: 'performance',
      earned: true,
      earnedDate: '2024-08-22',
      rarity: 'epic',
      specialReward: null
    },
    {
      id: 4,
      name: 'Team Captain',
      emoji: '👨‍✈️',
      description: 'Lead your team to 5 victories',
      category: 'leadership',
      earned: false,
      progress: 60,
      rarity: 'legendary',
      specialReward: 'Captain Armband Avatar Accessory'
    },
    {
      id: 5,
      name: 'Perfect Week',
      emoji: '🌟',
      description: 'Complete all training sessions in a week',
      category: 'consistency',
      earned: true,
      earnedDate: '2024-08-25',
      rarity: 'rare',
      specialReward: null
    },
    {
      id: 6,
      name: 'Helper',
      emoji: '🤝',
      description: 'Help teammates complete 20 drills',
      category: 'teamwork',
      earned: false,
      progress: 35,
      rarity: 'common',
      specialReward: null
    },
    {
      id: 7,
      name: 'Iron Will',
      emoji: '💪',
      description: 'Train for 30 consecutive days',
      category: 'consistency',
      earned: false,
      progress: 80,
      rarity: 'legendary',
      specialReward: 'Special Workout Playlist'
    },
    {
      id: 8,
      name: 'Skill Master',
      emoji: '🎯',
      description: 'Master 10 different skills',
      category: 'skills',
      earned: false,
      progress: 70,
      rarity: 'epic',
      specialReward: 'Exclusive Skill Tutorial Videos'
    },
    {
      id: 9,
      name: 'Early Bird',
      emoji: '🌅',
      description: 'Attend 10 morning training sessions',
      category: 'dedication',
      earned: true,
      earnedDate: '2024-08-18',
      rarity: 'rare',
      specialReward: null
    },
    {
      id: 10,
      name: 'Champion',
      emoji: '🏆',
      description: 'Win your first tournament',
      category: 'achievements',
      earned: false,
      progress: 0,
      rarity: 'legendary',
      specialReward: 'Golden Trophy Avatar Frame'
    }
  ];

  const mockStats = {
    totalBadges: 10,
    earnedBadges: 5,
    commonBadges: 2,
    rareBadges: 2,
    epicBadges: 1,
    legendaryBadges: 0,
    collectionProgress: 50
  };

  const categories = [
    { id: 'all', name: 'All', icon: 'apps', color: COLORS.primary },
    { id: 'beginner', name: 'Beginner', icon: 'child-care', color: '#27ae60' },
    { id: 'skills', name: 'Skills', icon: 'sports-soccer', color: '#3498db' },
    { id: 'performance', name: 'Performance', icon: 'speed', color: '#e74c3c' },
    { id: 'teamwork', name: 'Teamwork', icon: 'group', color: '#9b59b6' },
    { id: 'leadership', name: 'Leadership', icon: 'military-tech', color: '#f39c12' },
    { id: 'consistency', name: 'Consistency', icon: 'schedule', color: '#1abc9c' },
    { id: 'dedication', name: 'Dedication', icon: 'favorite', color: '#e91e63' },
    { id: 'achievements', name: 'Achievements', icon: 'jump-rope', color: '#ff9800' }
  ];

  const filteredBadges = mockBadges.filter(badge => {
    const matchesCategory = selectedCategory === 'all' || badge.category === selectedCategory;
    const matchesSearch = badge.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         badge.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return '#95a5a6';
      case 'rare': return '#3498db';
      case 'epic': return '#9b59b6';
      case 'legendary': return '#f1c40f';
      default: return '#95a5a6';
    }
  };

  const getRarityGradient = (rarity) => {
    switch (rarity) {
      case 'common': return ['#95a5a6', '#7f8c8d'];
      case 'rare': return ['#3498db', '#2980b9'];
      case 'epic': return ['#9b59b6', '#8e44ad'];
      case 'legendary': return ['#f1c40f', '#f39c12'];
      default: return ['#95a5a6', '#7f8c8d'];
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
        <View style={styles.headerTop}>
          <View style={styles.titleSection}>
            <Text style={styles.headerTitle}>🏅 My Badge Collection</Text>
            <Text style={styles.headerSubtitle}>
              {mockStats.earnedBadges} of {mockStats.totalBadges} collected
            </Text>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={toggleSearch}
              style={styles.searchButton}
            >
              <Icon name="search" size={24} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => {
                setViewMode(viewMode === 'grid' ? 'list' : 'grid');
                Vibration.vibrate(30);
              }}
              style={styles.viewButton}
            >
              <Icon 
                name={viewMode === 'grid' ? 'view-list' : 'view-module'} 
                size={24} 
                color="white" 
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.progressSection}>
          <Text style={styles.progressLabel}>Collection Progress</Text>
          <ProgressBar
            progress={mockStats.collectionProgress / 100}
            color="white"
            style={styles.collectionProgress}
          />
          <Text style={styles.progressText}>{mockStats.collectionProgress}% Complete</Text>
        </View>

        <View style={styles.rarityStats}>
          {[
            { rarity: 'common', count: mockStats.commonBadges, color: '#95a5a6' },
            { rarity: 'rare', count: mockStats.rareBadges, color: '#3498db' },
            { rarity: 'epic', count: mockStats.epicBadges, color: '#9b59b6' },
            { rarity: 'legendary', count: mockStats.legendaryBadges, color: '#f1c40f' }
          ].map((stat) => (
            <View key={stat.rarity} style={styles.rarityItem}>
              <View style={[styles.rarityDot, { backgroundColor: stat.color }]} />
              <Text style={styles.rarityCount}>{stat.count}</Text>
              <Text style={styles.rarityLabel}>{stat.rarity}</Text>
            </View>
          ))}
        </View>
      </Animated.View>
    </LinearGradient>
  );

  const renderSearchBar = () => {
    if (!showSearch) return null;
    
    return (
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search badges..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
        />
      </View>
    );
  };

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
              { borderColor: category.color },
              selectedCategory === category.id && { backgroundColor: category.color }
            ]}
          >
            <Icon 
              name={category.icon} 
              size={18} 
              color={selectedCategory === category.id ? 'white' : category.color} 
            />
            <Text style={[
              styles.categoryText,
              { color: selectedCategory === category.id ? 'white' : category.color }
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderBadgeGrid = () => (
    <View style={styles.badgeGrid}>
      {filteredBadges.map((badge, index) => (
        <Animated.View
          key={badge.id}
          style={[
            styles.badgeGridItem,
            {
              opacity: animatedValue,
              transform: [
                {
                  scale: animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1]
                  })
                }
              ]
            }
          ]}
        >
          <TouchableOpacity
            onPress={() => handleBadgePress(badge)}
            activeOpacity={0.8}
            style={styles.badgeContainer}
          >
            <LinearGradient
              colors={badge.earned ? getRarityGradient(badge.rarity) : ['#ecf0f1', '#bdc3c7']}
              style={[
                styles.badgeCircle,
                !badge.earned && styles.lockedBadge
              ]}
            >
              <Text style={styles.badgeEmoji}>
                {badge.earned ? badge.emoji : '🔒'}
              </Text>
              
              {badge.earned && (
                <View style={styles.earnedIndicator}>
                  <Icon name="check-circle" size={16} color="white" />
                </View>
              )}
            </LinearGradient>
            
            <Text style={[
              styles.badgeName,
              !badge.earned && styles.lockedBadgeName
            ]}>
              {badge.name}
            </Text>
            
            {!badge.earned && badge.progress && (
              <View style={styles.badgeProgressContainer}>
                <ProgressBar
                  progress={badge.progress / 100}
                  color={COLORS.primary}
                  style={styles.badgeProgress}
                />
                <Text style={styles.badgeProgressText}>{badge.progress}%</Text>
              </View>
            )}
            
            <Chip
              mode="outlined"
              textStyle={styles.badgeRarityText}
              style={[styles.badgeRarityChip, { borderColor: getRarityColor(badge.rarity) }]}
            >
              {badge.rarity}
            </Chip>
          </TouchableOpacity>
        </Animated.View>
      ))}
    </View>
  );

  const renderBadgeList = () => (
    <FlatList
      data={filteredBadges}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item: badge, index }) => (
        <Animated.View
          style={[
            styles.listItemWrapper,
            {
              opacity: animatedValue,
              transform: [
                {
                  translateX: animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-50, 0]
                  })
                }
              ]
            }
          ]}
        >
          <TouchableOpacity
            onPress={() => handleBadgePress(badge)}
            activeOpacity={0.8}
          >
            <Card style={styles.listCard}>
              <Card.Content style={styles.listCardContent}>
                <View style={styles.listBadgeInfo}>
                  <LinearGradient
                    colors={badge.earned ? getRarityGradient(badge.rarity) : ['#ecf0f1', '#bdc3c7']}
                    style={styles.listBadgeIcon}
                  >
                    <Text style={styles.listBadgeEmoji}>
                      {badge.earned ? badge.emoji : '🔒'}
                    </Text>
                  </LinearGradient>
                  
                  <View style={styles.listBadgeDetails}>
                    <Text style={styles.listBadgeName}>{badge.name}</Text>
                    <Text style={styles.listBadgeDescription}>{badge.description}</Text>
                    
                    {!badge.earned && badge.progress && (
                      <View style={styles.listProgressContainer}>
                        <ProgressBar
                          progress={badge.progress / 100}
                          color={COLORS.primary}
                          style={styles.listProgress}
                        />
                        <Text style={styles.listProgressText}>{badge.progress}%</Text>
                      </View>
                    )}
                  </View>
                </View>
                
                <View style={styles.listBadgeMeta}>
                  <Chip
                    mode="outlined"
                    textStyle={styles.listRarityText}
                    style={[styles.listRarityChip, { borderColor: getRarityColor(badge.rarity) }]}
                  >
                    {badge.rarity}
                  </Chip>
                  
                  {badge.earned && (
                    <Text style={styles.earnedDate}>
                      {new Date(badge.earnedDate).toLocaleDateString()}
                    </Text>
                  )}
                </View>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        </Animated.View>
      )}
      showsVerticalScrollIndicator={false}
    />
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {renderHeader()}
      
      <View style={styles.content}>
        {renderSearchBar()}
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
          {viewMode === 'grid' ? renderBadgeGrid() : renderBadgeList()}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>

      <FAB
        style={styles.fab}
        icon="share"
        onPress={() => {
          Vibration.vibrate(50);
          Alert.alert(
            '🚧 Feature Coming Soon!',
            'Share your badge collection with friends!',
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
    // Main header content styles
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  titleSection: {
    flex: 1,
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: 'white',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.9)',
    marginTop: SPACING.xs,
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  searchButton: {
    padding: SPACING.xs,
  },
  viewButton: {
    padding: SPACING.xs,
  },
  progressSection: {
    marginBottom: SPACING.lg,
  },
  progressLabel: {
    ...TEXT_STYLES.body,
    color: 'white',
    marginBottom: SPACING.xs,
    fontWeight: '600',
  },
  collectionProgress: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginBottom: SPACING.xs,
  },
  progressText: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
  },
  rarityStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  rarityItem: {
    alignItems: 'center',
  },
  rarityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: SPACING.xs,
  },
  rarityCount: {
    ...TEXT_STYLES.h3,
    color: 'white',
    fontWeight: 'bold',
  },
  rarityLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'capitalize',
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  searchBar: {
    elevation: 2,
  },
  searchInput: {
    fontSize: 16,
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
    backgroundColor: 'white',
  },
  categoryText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.xs,
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: SPACING.md,
  },
  badgeGridItem: {
    width: '45%',
    marginBottom: SPACING.lg,
  },
  badgeContainer: {
    alignItems: 'center',
  },
  badgeCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    position: 'relative',
  },
  lockedBadge: {
    opacity: 0.6,
  },
  badgeEmoji: {
    fontSize: 32,
  },
  earnedIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: COLORS.success,
    borderRadius: 12,
    padding: 2,
  },
  badgeName: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  lockedBadgeName: {
    color: COLORS.textSecondary,
  },
  badgeProgressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  badgeProgress: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    marginBottom: SPACING.xs,
  },
  badgeProgressText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  badgeRarityChip: {
    height: 20,
  },
  badgeRarityText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  listItemWrapper: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  listCard: {
    elevation: 2,
  },
  listCardContent: {
    padding: SPACING.md,
  },
  listBadgeInfo: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  listBadgeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  listBadgeEmoji: {
    fontSize: 24,
  },
  listBadgeDetails: {
    flex: 1,
  },
  listBadgeName: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  listBadgeDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  listProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listProgress: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    marginRight: SPACING.sm,
  },
  listProgressText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: 'bold',
    minWidth: 35,
  },
  listBadgeMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listRarityChip: {
    height: 24,
  },
  listRarityText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  earnedDate: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
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

export default Badges;