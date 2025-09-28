import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  RefreshControl,
  Alert,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  FlatList,
  Modal,
  Vibration,
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
  Searchbar,
  Portal,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import { BlurView } from '@react-native-blur/blur';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4caf50',
  error: '#f44336',
  warning: '#ff9800',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold' },
  h2: { fontSize: 24, fontWeight: 'bold' },
  h3: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16 },
  caption: { fontSize: 14, color: COLORS.textSecondary },
};

const { width } = Dimensions.get('window');

const StudyPlans = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, trainingPlans, isLoading } = useSelector(state => ({
    user: state.auth.user,
    trainingPlans: state.training.plans,
    isLoading: state.training.isLoading,
  }));

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Mock data - replace with actual Redux state
  const mockPlans = [
    {
      id: '1',
      title: '12-Week Strength Building',
      coach: 'Sarah Johnson',
      coachAvatar: 'https://via.placeholder.com/50',
      duration: 12,
      sessionsCompleted: 18,
      totalSessions: 36,
      difficulty: 'Intermediate',
      category: 'Strength',
      progress: 50,
      nextSession: 'Upper Body Strength',
      nextSessionDate: '2025-08-27',
      isActive: true,
      streak: 7,
      points: 450,
      badges: ['consistent', 'strength-warrior'],
    },
    {
      id: '2',
      title: 'Cardio Endurance Pro',
      coach: 'Mike Chen',
      coachAvatar: 'https://via.placeholder.com/50',
      duration: 8,
      sessionsCompleted: 12,
      totalSessions: 24,
      difficulty: 'Advanced',
      category: 'Cardio',
      progress: 50,
      nextSession: 'HIIT Intervals',
      nextSessionDate: '2025-08-28',
      isActive: true,
      streak: 3,
      points: 320,
      badges: ['speed-demon'],
    },
    {
      id: '3',
      title: 'Flexibility & Mobility',
      coach: 'Emma Davis',
      coachAvatar: 'https://via.placeholder.com/50',
      duration: 6,
      sessionsCompleted: 18,
      totalSessions: 18,
      difficulty: 'Beginner',
      category: 'Flexibility',
      progress: 100,
      nextSession: 'Completed! 🎉',
      nextSessionDate: null,
      isActive: false,
      streak: 0,
      points: 180,
      badges: ['flexibility-master', 'plan-finisher'],
    },
  ];

  const filterOptions = [
    { id: 'all', label: 'All Plans', icon: 'fitness-center' },
    { id: 'active', label: 'Active', icon: 'play-circle-filled' },
    { id: 'completed', label: 'Completed', icon: 'check-circle' },
    { id: 'strength', label: 'Strength', icon: 'fitness-center' },
    { id: 'cardio', label: 'Cardio', icon: 'directions-run' },
    { id: 'flexibility', label: 'Flexibility', icon: 'self-improvement' },
  ];

  useEffect(() => {
    // Entrance animations
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
      // Dispatch action to refresh training plans
      // await dispatch(fetchTrainingPlans());
      Vibration.vibrate(50);
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh plans. Please try again.');
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const handlePlanPress = (plan) => {
    Vibration.vibrate(30);
    setSelectedPlan(plan);
    navigation.navigate('PlanDetails', { planId: plan.id });
  };

  const handleStartSession = (plan) => {
    Vibration.vibrate(50);
    if (plan.isActive) {
      navigation.navigate('SessionView', { 
        planId: plan.id, 
        sessionType: plan.nextSession 
      });
    }
  };

  const filteredPlans = mockPlans.filter(plan => {
    const matchesSearch = plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         plan.coach.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    switch (selectedFilter) {
      case 'active':
        return plan.isActive;
      case 'completed':
        return !plan.isActive;
      case 'strength':
        return plan.category.toLowerCase() === 'strength';
      case 'cardio':
        return plan.category.toLowerCase() === 'cardio';
      case 'flexibility':
        return plan.category.toLowerCase() === 'flexibility';
      default:
        return true;
    }
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return COLORS.success;
      case 'Intermediate': return COLORS.warning;
      case 'Advanced': return COLORS.error;
      default: return COLORS.primary;
    }
  };

  const getBadgeIcon = (badge) => {
    const badgeIcons = {
      'consistent': 'stars',
      'strength-warrior': 'fitness-center',
      'speed-demon': 'flash-on',
      'flexibility-master': 'self-improvement',
      'plan-finisher': 'jump-rope',
    };
    return badgeIcons[badge] || 'star';
  };

  const renderPlanCard = ({ item: plan }) => (
    <Animated.View
      style={[
        styles.planCardContainer,
        {
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
        },
      ]}
    >
      <Card style={styles.planCard} onPress={() => handlePlanPress(plan)}>
        <LinearGradient
          colors={plan.isActive ? [COLORS.primary, COLORS.secondary] : ['#e0e0e0', '#bdbdbd']}
          style={styles.cardHeader}
        >
          <View style={styles.headerContent}>
            <View style={styles.planInfo}>
              <Text style={styles.planTitle}>{plan.title}</Text>
              <Text style={styles.coachName}>with {plan.coach}</Text>
              <View style={styles.badgeContainer}>
                {plan.badges.map((badge, index) => (
                  <Surface key={index} style={styles.badge}>
                    <Icon name={getBadgeIcon(badge)} size={12} color={COLORS.primary} />
                  </Surface>
                ))}
              </View>
            </View>
            <Avatar.Image
              size={50}
              source={{ uri: plan.coachAvatar }}
              style={styles.coachAvatar}
            />
          </View>
          
          {plan.isActive && (
            <View style={styles.streakContainer}>
              <Icon name="local-fire-department" size={16} color="#ff6b35" />
              <Text style={styles.streakText}>{plan.streak} day streak</Text>
              <Text style={styles.pointsText}>{plan.points} pts</Text>
            </View>
          )}
        </LinearGradient>

        <Card.Content style={styles.cardContent}>
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressText}>
                {plan.sessionsCompleted}/{plan.totalSessions} sessions
              </Text>
              <Text style={styles.progressPercentage}>{plan.progress}%</Text>
            </View>
            <ProgressBar
              progress={plan.progress / 100}
              color={plan.isActive ? COLORS.primary : COLORS.success}
              style={styles.progressBar}
            />
          </View>

          <View style={styles.planMeta}>
            <Chip
              mode="outlined"
              style={[styles.difficultyChip, { borderColor: getDifficultyColor(plan.difficulty) }]}
              textStyle={{ color: getDifficultyColor(plan.difficulty) }}
            >
              {plan.difficulty}
            </Chip>
            <Chip mode="outlined" style={styles.categoryChip}>
              {plan.category}
            </Chip>
            <Chip mode="outlined" style={styles.durationChip}>
              {plan.duration} weeks
            </Chip>
          </View>

          {plan.isActive ? (
            <View style={styles.nextSessionContainer}>
              <Text style={styles.nextSessionLabel}>Next Session:</Text>
              <Text style={styles.nextSessionTitle}>{plan.nextSession}</Text>
              <Text style={styles.nextSessionDate}>
                {new Date(plan.nextSessionDate).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </View>
          ) : (
            <View style={styles.completedContainer}>
              <Icon name="check-circle" size={24} color={COLORS.success} />
              <Text style={styles.completedText}>Plan Completed! 🎉</Text>
            </View>
          )}

          <View style={styles.cardActions}>
            {plan.isActive ? (
              <Button
                mode="contained"
                onPress={() => handleStartSession(plan)}
                style={styles.startButton}
                labelStyle={styles.buttonLabel}
                icon="play-arrow"
              >
                Start Today's Session
              </Button>
            ) : (
              <Button
                mode="outlined"
                onPress={() => handlePlanPress(plan)}
                style={styles.viewButton}
                labelStyle={styles.buttonLabel}
              >
                View Details
              </Button>
            )}
            <IconButton
              icon="share"
              size={20}
              onPress={() => {
                Vibration.vibrate(30);
                Alert.alert('Feature Coming Soon', 'Sharing functionality will be available in the next update! 🚀');
              }}
            />
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.headerGradient}>
        <Text style={styles.headerTitle}>My Training Plans</Text>
        <Text style={styles.headerSubtitle}>
          Keep pushing your limits! 💪
        </Text>
        
        <View style={styles.statsRow}>
          <Surface style={styles.statCard}>
            <Text style={styles.statNumber}>{mockPlans.filter(p => p.isActive).length}</Text>
            <Text style={styles.statLabel}>Active Plans</Text>
          </Surface>
          <Surface style={styles.statCard}>
            <Text style={styles.statNumber}>
              {mockPlans.reduce((acc, plan) => acc + plan.points, 0)}
            </Text>
            <Text style={styles.statLabel}>Total Points</Text>
          </Surface>
          <Surface style={styles.statCard}>
            <Text style={styles.statNumber}>
              {Math.max(...mockPlans.map(p => p.streak))}
            </Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </Surface>
        </View>
      </LinearGradient>
    </View>
  );

  const renderFilterModal = () => (
    <Portal>
      <Modal
        visible={showFilterModal}
        onDismiss={() => setShowFilterModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.modalBlur} blurType="light" blurAmount={10}>
          <Surface style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter Plans</Text>
            <FlatList
              data={filterOptions}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    selectedFilter === item.id && styles.filterOptionSelected,
                  ]}
                  onPress={() => {
                    setSelectedFilter(item.id);
                    setShowFilterModal(false);
                    Vibration.vibrate(30);
                  }}
                >
                  <Icon
                    name={item.icon}
                    size={20}
                    color={selectedFilter === item.id ? COLORS.primary : COLORS.textSecondary}
                  />
                  <Text
                    style={[
                      styles.filterOptionText,
                      selectedFilter === item.id && styles.filterOptionTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </Surface>
        </BlurView>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {renderHeader()}
      
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search plans or coaches..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          iconColor={COLORS.primary}
        />
        <IconButton
          icon="tune"
          size={24}
          onPress={() => {
            setShowFilterModal(true);
            Vibration.vibrate(30);
          }}
          style={styles.filterButton}
        />
      </View>

      <View style={styles.activeFilters}>
        {selectedFilter !== 'all' && (
          <Chip
            mode="flat"
            onClose={() => setSelectedFilter('all')}
            style={styles.activeFilterChip}
          >
            {filterOptions.find(f => f.id === selectedFilter)?.label}
          </Chip>
        )}
      </View>

      <FlatList
        data={filteredPlans}
        keyExtractor={(item) => item.id}
        renderItem={renderPlanCard}
        contentContainerStyle={styles.plansList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="fitness-center" size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyStateText}>No training plans found</Text>
            <Text style={styles.emptyStateSubtext}>
              Try adjusting your search or filters
            </Text>
          </View>
        }
      />

      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => {
          Vibration.vibrate(50);
          navigation.navigate('BrowsePlans');
        }}
      />

      {renderFilterModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight || 0,
  },
  headerGradient: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: 'white',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: SPACING.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    ...TEXT_STYLES.h2,
    color: COLORS.primary,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  searchbar: {
    flex: 1,
    marginRight: SPACING.sm,
    elevation: 2,
  },
  filterButton: {
    backgroundColor: COLORS.surface,
    elevation: 2,
  },
  activeFilters: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  activeFilterChip: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary + '20',
  },
  plansList: {
    padding: SPACING.md,
  },
  planCardContainer: {
    marginBottom: SPACING.md,
  },
  planCard: {
    elevation: 4,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  planInfo: {
    flex: 1,
  },
  planTitle: {
    ...TEXT_STYLES.h3,
    color: 'white',
    marginBottom: SPACING.xs,
  },
  coachName: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: SPACING.sm,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
    elevation: 1,
  },
  coachAvatar: {
    borderWidth: 2,
    borderColor: 'white',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  streakText: {
    color: 'white',
    marginLeft: SPACING.xs,
    marginRight: SPACING.sm,
    fontWeight: '600',
  },
  pointsText: {
    color: '#ffd700',
    fontWeight: 'bold',
  },
  cardContent: {
    padding: SPACING.md,
  },
  progressSection: {
    marginBottom: SPACING.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  progressText: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
  },
  progressPercentage: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  planMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  difficultyChip: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  categoryChip: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  durationChip: {
    marginBottom: SPACING.xs,
  },
  nextSessionContainer: {
    backgroundColor: COLORS.primary + '10',
    padding: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  nextSessionLabel: {
    ...TEXT_STYLES.caption,
    marginBottom: SPACING.xs,
  },
  nextSessionTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  nextSessionDate: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
  },
  completedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  completedText: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginLeft: SPACING.sm,
    color: COLORS.success,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  startButton: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  viewButton: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: SPACING.md,
    bottom: SPACING.md,
    backgroundColor: COLORS.primary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyStateText: {
    ...TEXT_STYLES.h3,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBlur: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.8,
    maxHeight: '60%',
    borderRadius: 16,
    padding: SPACING.lg,
    elevation: 8,
  },
  modalTitle: {
    ...TEXT_STYLES.h2,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: 8,
  },
  filterOptionSelected: {
    backgroundColor: COLORS.primary + '20',
  },
  filterOptionText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.sm,
  },
  filterOptionTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default StudyPlans;