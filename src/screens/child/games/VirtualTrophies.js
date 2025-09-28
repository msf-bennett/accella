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
  FlatList,
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
  Searchbar,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from 'expo-blur';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../../../constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const TROPHY_SIZE = (SCREEN_WIDTH - 60) / 2;

const VirtualTrophiesScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, trophies, stats } = useSelector(state => ({
    user: state.auth.user,
    trophies: state.trophies || [],
    stats: state.userStats || {}
  }));

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTrophy, setSelectedTrophy] = useState(null);
  const [showTrophyModal, setShowTrophyModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);

  // Mock data - would come from Redux store in real app
  const totalTrophies = 15;
  const earnedTrophies = 8;
  const completionRate = (earnedTrophies / totalTrophies) * 100;

  const mockTrophies = [
    {
      id: '1',
      title: 'First Goal Champion',
      description: 'Scored your very first goal in training!',
      category: 'milestone',
      type: 'trophy',
      rarity: 'gold',
      earned: true,
      earnedDate: '2024-08-15',
      sport: 'football',
      icon: 'jump-rope',
      color: '#FFD700',
      celebration: true,
      requirements: 'Score 1 goal in training',
      points: 100,
    },
    {
      id: '2',
      title: 'Speed Demon Medal',
      description: 'Completed sprint drills under target time!',
      category: 'performance',
      type: 'medal',
      rarity: 'silver',
      earned: true,
      earnedDate: '2024-08-20',
      sport: 'athletics',
      icon: 'flash-on',
      color: '#C0C0C0',
      celebration: false,
      requirements: 'Complete 5 sprint drills under target time',
      points: 75,
    },
    {
      id: '3',
      title: 'Team Captain Trophy',
      description: 'Led your team to victory as captain!',
      category: 'leadership',
      type: 'trophy',
      rarity: 'gold',
      earned: true,
      earnedDate: '2024-08-25',
      sport: 'football',
      icon: 'groups',
      color: '#FFD700',
      celebration: true,
      requirements: 'Captain team to 3 victories',
      points: 200,
    },
    {
      id: '4',
      title: 'Perfect Attendance',
      description: 'Never missed a training session this month!',
      category: 'dedication',
      type: 'certificate',
      rarity: 'platinum',
      earned: true,
      earnedDate: '2024-08-28',
      sport: 'general',
      icon: 'schedule',
      color: '#E5E4E2',
      celebration: true,
      requirements: 'Attend all sessions in a month',
      points: 150,
    },
    {
      id: '5',
      title: 'Hat Trick Hero',
      description: 'Score three goals in a single match!',
      category: 'achievement',
      type: 'trophy',
      rarity: 'gold',
      earned: false,
      sport: 'football',
      icon: 'sports-soccer',
      color: '#FFD700',
      celebration: false,
      requirements: 'Score 3 goals in one match',
      points: 250,
      progress: 0.67, // 2 out of 3 goals
    },
    {
      id: '6',
      title: 'Endurance Master',
      description: 'Complete a 5km run without stopping!',
      category: 'fitness',
      type: 'medal',
      rarity: 'bronze',
      earned: false,
      sport: 'athletics',
      icon: 'directions-run',
      color: '#CD7F32',
      celebration: false,
      requirements: 'Complete 5km run without breaks',
      points: 125,
      progress: 0.8, // 4km completed
    },
    {
      id: '7',
      title: 'Skill Master Badge',
      description: 'Master all basic football skills!',
      category: 'skill',
      type: 'badge',
      rarity: 'silver',
      earned: true,
      earnedDate: '2024-08-22',
      sport: 'football',
      icon: 'sports',
      color: '#C0C0C0',
      celebration: false,
      requirements: 'Master 10 basic skills',
      points: 100,
    },
    {
      id: '8',
      title: 'Fair Play Champion',
      description: 'Showed excellent sportsmanship!',
      category: 'character',
      type: 'trophy',
      rarity: 'gold',
      earned: true,
      earnedDate: '2024-08-18',
      sport: 'general',
      icon: 'favorite',
      color: '#FFD700',
      celebration: true,
      requirements: 'Receive 5 fair play nominations',
      points: 175,
    }
  ];

  const categories = [
    { id: 'all', title: 'All', icon: 'apps' },
    { id: 'milestone', title: 'Milestones', icon: 'flag' },
    { id: 'performance', title: 'Performance', icon: 'trending-up' },
    { id: 'leadership', title: 'Leadership', icon: 'star' },
    { id: 'dedication', title: 'Dedication', icon: 'favorite' },
    { id: 'achievement', title: 'Achievements', icon: 'jump-rope' },
    { id: 'fitness', title: 'Fitness', icon: 'fitness-center' },
    { id: 'skill', title: 'Skills', icon: 'sports' },
    { id: 'character', title: 'Character', icon: 'volunteer-activism' },
  ];

  // Animation effects
  useEffect(() => {
    const animations = [
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
    ];

    // Floating animation for trophies
    const floatingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    // Sparkle animation
    const sparklingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    Animated.parallel([...animations, floatingAnimation, sparklingAnimation]).start();

    return () => {
      floatingAnimation.stop();
      sparklingAnimation.stop();
    };
  }, [fadeAnim, slideAnim, floatAnim, sparkleAnim]);

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

  // Filter trophies
  const filteredTrophies = mockTrophies.filter(trophy => {
    const matchesCategory = filterCategory === 'all' || trophy.category === filterCategory;
    const matchesSearch = trophy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         trophy.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Handle trophy press
  const handleTrophyPress = (trophy) => {
    Vibration.vibrate(50);
    setSelectedTrophy(trophy);
    setShowTrophyModal(true);
    
    if (trophy.earned && trophy.celebration) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
  };

  // Get trophy type icon
  const getTrophyTypeIcon = (type) => {
    switch (type) {
      case 'trophy': return 'jump-rope';
      case 'medal': return 'military-tech';
      case 'certificate': return 'workspace-premium';
      case 'badge': return 'verified';
      default: return 'jump-rope';
    }
  };

  // Get rarity gradient
  const getRarityGradient = (rarity) => {
    switch (rarity) {
      case 'bronze': return ['#CD7F32', '#B87333'];
      case 'silver': return ['#C0C0C0', '#A8A8A8'];
      case 'gold': return ['#FFD700', '#FFA500'];
      case 'platinum': return ['#E5E4E2', '#BCC6CC'];
      default: return ['#667eea', '#764ba2'];
    }
  };

  // Render stats header
  const renderStatsHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.statsHeader}
    >
      <View style={styles.statsContent}>
        <Text style={styles.headerTitle}>🏆 Trophy Cabinet 🏆</Text>
        
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Animated.Text style={[styles.statNumber, {
              transform: [{
                scale: sparkleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.1],
                }),
              }],
            }]}>
              {earnedTrophies}
            </Animated.Text>
            <Text style={styles.statLabel}>Earned</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalTrophies}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{Math.round(completionRate)}%</Text>
            <Text style={styles.statLabel}>Complete</Text>
          </View>
        </View>
        
        <View style={styles.progressContainer}>
          <ProgressBar
            progress={completionRate / 100}
            color={COLORS.background}
            style={styles.progressBar}
          />
          <Text style={styles.progressText}>
            Keep going! {totalTrophies - earnedTrophies} more to collect!
          </Text>
        </View>
      </View>
    </LinearGradient>
  );

  // Render category filter
  const renderCategoryFilter = () => (
    <View style={styles.filterContainer}>
      <Text style={styles.filterTitle}>Categories</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.filterChip,
              filterCategory === category.id && styles.activeFilterChip
            ]}
            onPress={() => setFilterCategory(category.id)}
          >
            <Icon
              name={category.icon}
              size={18}
              color={filterCategory === category.id ? COLORS.background : COLORS.primary}
            />
            <Text style={[
              styles.filterText,
              filterCategory === category.id && styles.activeFilterText
            ]}>
              {category.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // Render trophy card
  const renderTrophyCard = ({ item: trophy, index }) => {
    const isEarned = trophy.earned;
    const floatY = floatAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -10],
    });

    return (
      <Animated.View
        style={[
          styles.trophyCardContainer,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, index * 5],
                }),
              },
              { translateY: isEarned ? floatY : 0 },
            ],
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => handleTrophyPress(trophy)}
          activeOpacity={0.8}
        >
          <Card style={[
            styles.trophyCard,
            isEarned && styles.earnedTrophyCard,
            !isEarned && styles.lockedTrophyCard
          ]}>
            <LinearGradient
              colors={isEarned ? getRarityGradient(trophy.rarity) : ['#f5f5f5', '#e0e0e0']}
              style={styles.trophyCardGradient}
            >
              <View style={styles.trophyCardContent}>
                {/* Trophy Icon */}
                <View style={[
                  styles.trophyIconContainer,
                  !isEarned && styles.lockedIconContainer
                ]}>
                  <Animated.View style={{
                    transform: [{
                      rotate: sparkleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '10deg'],
                      }),
                    }],
                  }}>
                    <Icon
                      name={getTrophyTypeIcon(trophy.type)}
                      size={48}
                      color={isEarned ? trophy.color : '#9e9e9e'}
                    />
                  </Animated.View>
                  
                  {isEarned && trophy.celebration && (
                    <Animated.View style={[
                      styles.sparkleContainer,
                      {
                        opacity: sparkleAnim,
                        transform: [{
                          scale: sparkleAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.5, 1.2],
                          }),
                        }],
                      }
                    ]}>
                      <Text style={styles.sparkle}>✨</Text>
                    </Animated.View>
                  )}
                </View>

                {/* Trophy Info */}
                <View style={styles.trophyInfo}>
                  <Text style={[
                    styles.trophyTitle,
                    !isEarned && styles.lockedTrophyTitle
                  ]}>
                    {trophy.title}
                  </Text>
                  
                  <Text style={[
                    styles.trophyDescription,
                    !isEarned && styles.lockedTrophyDescription
                  ]}>
                    {trophy.description}
                  </Text>
                  
                  {isEarned && trophy.earnedDate && (
                    <Text style={styles.earnedDate}>
                      🎉 Earned {new Date(trophy.earnedDate).toLocaleDateString()}
                    </Text>
                  )}
                  
                  {!isEarned && trophy.progress && (
                    <View style={styles.progressSection}>
                      <ProgressBar
                        progress={trophy.progress}
                        color={COLORS.primary}
                        style={styles.trophyProgress}
                      />
                      <Text style={styles.progressLabel}>
                        {Math.round(trophy.progress * 100)}% complete
                      </Text>
                    </View>
                  )}
                </View>

                {/* Rarity Badge */}
                <View style={styles.rarityBadge}>
                  <Chip
                    mode="flat"
                    style={[
                      styles.rarityChip,
                      { backgroundColor: isEarned ? trophy.color + '20' : '#f5f5f5' }
                    ]}
                    textStyle={[
                      styles.rarityText,
                      { color: isEarned ? trophy.color : '#9e9e9e' }
                    ]}
                  >
                    {trophy.rarity?.toUpperCase()}
                  </Chip>
                </View>
              </View>
            </LinearGradient>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      
      <View style={styles.content}>
        {renderStatsHeader()}
        
        <View style={styles.bodyContent}>
          {/* Search Bar */}
          <Searchbar
            placeholder="Search trophies..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor={COLORS.primary}
          />
          
          {renderCategoryFilter()}
          
          {/* Trophy Grid */}
          <FlatList
            data={filteredTrophies}
            renderItem={renderTrophyCard}
            keyExtractor={(item) => item.id}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.trophyGrid}
            columnWrapperStyle={styles.trophyRow}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Icon name="jump-rope" size={64} color={COLORS.secondary} />
                <Text style={styles.emptyTitle}>No trophies found</Text>
                <Text style={styles.emptyText}>
                  Try adjusting your search or filter criteria
                </Text>
              </View>
            )}
          />
        </View>
      </View>

      {/* Trophy Detail Modal */}
      <Portal>
        <Modal
          visible={showTrophyModal}
          onDismiss={() => setShowTrophyModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView style={styles.blurView} blurType="light" blurAmount={10} />
          {selectedTrophy && (
            <Surface style={styles.modalContent}>
              <LinearGradient
                colors={selectedTrophy.earned ? 
                  getRarityGradient(selectedTrophy.rarity) : 
                  ['#f5f5f5', '#e0e0e0']
                }
                style={styles.modalHeader}
              >
                <Icon
                  name={getTrophyTypeIcon(selectedTrophy.type)}
                  size={64}
                  color={selectedTrophy.earned ? selectedTrophy.color : '#9e9e9e'}
                />
                <Text style={[
                  styles.modalTitle,
                  !selectedTrophy.earned && styles.lockedModalTitle
                ]}>
                  {selectedTrophy.title}
                </Text>
                
                <IconButton
                  icon="close"
                  size={24}
                  iconColor={COLORS.background}
                  onPress={() => setShowTrophyModal(false)}
                  style={styles.closeButton}
                />
              </LinearGradient>
              
              <View style={styles.modalBody}>
                <Text style={styles.modalDescription}>
                  {selectedTrophy.description}
                </Text>
                
                <View style={styles.modalStats}>
                  <View style={styles.modalStat}>
                    <Text style={styles.modalStatLabel}>Type</Text>
                    <Text style={styles.modalStatValue}>
                      {selectedTrophy.type?.charAt(0).toUpperCase() + selectedTrophy.type?.slice(1)}
                    </Text>
                  </View>
                  
                  <View style={styles.modalStat}>
                    <Text style={styles.modalStatLabel}>Rarity</Text>
                    <Text style={styles.modalStatValue}>
                      {selectedTrophy.rarity?.toUpperCase()}
                    </Text>
                  </View>
                  
                  <View style={styles.modalStat}>
                    <Text style={styles.modalStatLabel}>Points</Text>
                    <Text style={styles.modalStatValue}>{selectedTrophy.points}</Text>
                  </View>
                </View>
                
                <View style={styles.requirementsContainer}>
                  <Text style={styles.requirementsTitle}>Requirements:</Text>
                  <Text style={styles.requirementsText}>
                    {selectedTrophy.requirements}
                  </Text>
                </View>
                
                {selectedTrophy.earned ? (
                  <Chip
                    icon="check-circle"
                    style={styles.statusChip}
                    textStyle={styles.earnedChipText}
                  >
                    Earned on {new Date(selectedTrophy.earnedDate).toLocaleDateString()}
                  </Chip>
                ) : (
                  <View>
                    {selectedTrophy.progress && (
                      <View style={styles.modalProgress}>
                        <ProgressBar
                          progress={selectedTrophy.progress}
                          color={COLORS.primary}
                          style={styles.modalProgressBar}
                        />
                        <Text style={styles.modalProgressText}>
                          {Math.round(selectedTrophy.progress * 100)}% complete
                        </Text>
                      </View>
                    )}
                    <Chip
                      icon="lock"
                      style={styles.lockedChip}
                      textStyle={styles.lockedChipText}
                    >
                      Not Yet Earned
                    </Chip>
                  </View>
                )}
              </View>
            </Surface>
          )}
        </Modal>
      </Portal>

      {/* Celebration Modal */}
      <Portal>
        <Modal
          visible={showCelebration}
          onDismiss={() => setShowCelebration(false)}
          contentContainerStyle={styles.celebrationModal}
        >
          <Animated.View style={[
            styles.celebrationContent,
            {
              transform: [{
                scale: sparkleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1.2],
                }),
              }],
            }
          ]}>
            <Text style={styles.celebrationText}>🎉 AMAZING! 🎉</Text>
            <Text style={styles.celebrationSubtext}>
              You've unlocked a special trophy!
            </Text>
          </Animated.View>
        </Modal>
      </Portal>

      {/* Floating Action Button */}
      <FAB
        icon="filter-list"
        style={styles.fab}
        onPress={() => Alert.alert(
          'Filter Options',
          'Advanced filtering features coming soon!',
          [{ text: 'OK' }]
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
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
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.background,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: SPACING.lg,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 12,
    minWidth: 80,
  },
  statNumber: {
    ...TEXT_STYLES.h2,
    color: COLORS.background,
    fontWeight: 'bold',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.background,
    opacity: 0.9,
    marginTop: SPACING.xs,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    width: '100%',
  },
  progressText: {
    ...TEXT_STYLES.caption,
    color: COLORS.background,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  bodyContent: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  searchBar: {
    marginVertical: SPACING.md,
    elevation: 4,
  },
  filterContainer: {
    marginBottom: SPACING.lg,
  },
  filterTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  filterScroll: {
    paddingVertical: SPACING.xs,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginRight: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  activeFilterChip: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
    fontWeight: '500',
  },
  activeFilterText: {
    color: COLORS.background,
  },
  trophyGrid: {
    paddingBottom: 100,
  },
  trophyRow: {
    justifyContent: 'space-between',
  },
  trophyCardContainer: {
    width: TROPHY_SIZE,
    marginBottom: SPACING.lg,
  },
  trophyCard: {
    borderRadius: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  earnedTrophyCard: {
    borderWidth: 2,
    borderColor: COLORS.success,
  },
  lockedTrophyCard: {
    opacity: 0.7,
  },
  trophyCardGradient: {
    padding: SPACING.md,
    minHeight: 200,
  },
  trophyCardContent: {
    alignItems: 'center',
    flex: 1,
  },
  trophyIconContainer: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  lockedIconContainer: {
    opacity: 0.5,
  },
  sparkleContainer: {
    position: 'absolute',
    top: -5,
    right: -5,
  },
  sparkle: {
    fontSize: 16,
  },
  trophyInfo: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
  },
  trophyTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.background,
    textAlign: 'center',
    marginBottom: SPACING.xs,
    fontWeight: 'bold',
  },
  lockedTrophyTitle: {
    color: COLORS.secondary,
  },
  trophyDescription: {
    ...TEXT_STYLES.caption,
    color: COLORS.background,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    opacity: 0.9,
  },
  lockedTrophyDescription: {
    color: COLORS.secondary,
  },
  earnedDate: {
    ...TEXT_STYLES.caption,
    color: COLORS.background,
    textAlign: 'center',
    fontSize: 10,
    marginTop: SPACING.xs,
  },
  progressSection: {
    width: '100%',
    marginTop: SPACING.sm,
  },
  trophyProgress: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  progressLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.background,
    textAlign: 'center',
    fontSize: 10,
    marginTop: SPACING.xs,
  },
  rarityBadge: {
    marginTop: SPACING.sm,
  },
  rarityChip: {
    height: 24,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    ...TEXT_STYLES.body,
    color: COLORS.secondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
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
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 20,
  },
  modalHeader: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    position: 'relative',
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.background,
    marginTop: SPACING.md,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  lockedModalTitle: {
    color: COLORS.secondary,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  modalBody: {
    padding: SPACING.xl,
    backgroundColor: COLORS.background,
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
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    borderRadius: 12,
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
    fontWeight: 'bold',
  },
  requirementsContainer: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.lg,
  },
  requirementsTitle: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  requirementsText: {
    ...TEXT_STYLES.body,
    color: COLORS.secondary,
  },
  statusChip: {
    backgroundColor: COLORS.success + '20',
    alignSelf: 'center',
  },
  earnedChipText: {
    color: COLORS.success,
    fontWeight: 'bold',
  },
  lockedChip: {
    backgroundColor: COLORS.secondary + '20',
    alignSelf: 'center',
  },
  lockedChipText: {
    color: COLORS.secondary,
  },
  modalProgress: {
    marginBottom: SPACING.md,
  },
  modalProgressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.surface,
  },
  modalProgressText: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  celebrationModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  celebrationContent: {
    alignItems: 'center',
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderRadius: 20,
    elevation: 10,
  },
  celebrationText: {
    ...TEXT_STYLES.h2,
    color: COLORS.background,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  celebrationSubtext: {
    ...TEXT_STYLES.body,
    color: COLORS.background,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default VirtualTrophiesScreen;