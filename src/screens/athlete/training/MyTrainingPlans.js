import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
  Animated,
  Alert,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {
  Card,
  Text,
  Button,
  Chip,
  ProgressBar,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Searchbar,
  Portal,
  Modal,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';

// Import your design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../styles/designSystem';

const { width, height } = Dimensions.get('window');

const MyTrainingPlans = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, trainingPlans, isLoading } = useSelector(state => ({
    user: state.auth.user,
    trainingPlans: state.training.userTrainingPlans || [],
    isLoading: state.training.isLoading,
  }));

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, active, completed, upcoming
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Mock data - replace with actual Redux data
  const mockTrainingPlans = [
    {
      id: '1',
      title: '12-Week Football Conditioning',
      coach: 'Coach Martinez',
      sport: 'Football',
      totalWeeks: 12,
      currentWeek: 3,
      completedSessions: 18,
      totalSessions: 60,
      status: 'active',
      nextSession: '2024-08-24T09:00:00Z',
      difficulty: 'Intermediate',
      avatar: 'https://example.com/coach1.jpg',
      color: '#667eea',
      streak: 5,
      points: 450,
    },
    {
      id: '2',
      title: 'Pre-Season Basketball Training',
      coach: 'Coach Thompson',
      sport: 'Basketball',
      totalWeeks: 8,
      currentWeek: 6,
      completedSessions: 32,
      totalSessions: 40,
      status: 'active',
      nextSession: '2024-08-25T15:30:00Z',
      difficulty: 'Advanced',
      avatar: 'https://example.com/coach2.jpg',
      color: '#f093fb',
      streak: 12,
      points: 680,
    },
    {
      id: '3',
      title: 'Summer Fitness Bootcamp',
      coach: 'Trainer Sarah',
      sport: 'General Fitness',
      totalWeeks: 6,
      currentWeek: 6,
      completedSessions: 24,
      totalSessions: 24,
      status: 'completed',
      difficulty: 'Beginner',
      avatar: 'https://example.com/trainer1.jpg',
      color: '#a8edea',
      streak: 0,
      points: 720,
    },
  ];

  const loadTrainingPlans = useCallback(async () => {
  try {
    // Dispatch action to load user's training plans
    // dispatch(fetchUserTrainingPlans(user.id));
    Alert.alert(
      'Feature in Development',
      'Training plans will be loaded from your coach assignments. This feature is coming soon!',
      [{ text: 'OK', style: 'default' }]
    );
  } catch (error) {
    console.error('Error loading training plans:', error);
  }
}, [dispatch, user]);

  useEffect(() => {
    // Entrance animation
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
    ]).start();

    // Load training plans
    loadTrainingPlans();
  }, [loadTrainingPlans]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTrainingPlans();
    setRefreshing(false);
  }, [loadTrainingPlans]);

  const filteredPlans = mockTrainingPlans.filter(plan => {
    const matchesSearch = plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         plan.coach.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         plan.sport.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterType === 'all' || plan.status === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return COLORS.primary;
      case 'completed': return COLORS.success;
      case 'upcoming': return COLORS.secondary;
      default: return COLORS.secondary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return 'play-circle-outline';
      case 'completed': return 'check-circle';
      case 'upcoming': return 'schedule';
      default: return 'help-outline';
    }
  };

  const formatNextSession = (dateString) => {
    if (!dateString) return 'No upcoming session';
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      })}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow at ${date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      })}`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      });
    }
  };

  const openPlanDetails = (plan) => {
    setSelectedPlan(plan);
    setModalVisible(true);
  };

  const navigateToSession = (planId) => {
    navigation.navigate('TrainingSession', { planId });
  };

  const renderPlanCard = ({ item: plan, index }) => (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={() => openPlanDetails(plan)}
        activeOpacity={0.9}
      >
        <Card style={styles.planCard} elevation={4}>
          <LinearGradient
            colors={[plan.color, plan.color + '80']}
            style={styles.cardHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.headerContent}>
              <View style={styles.planInfo}>
                <Text style={styles.planTitle}>{plan.title}</Text>
                <View style={styles.coachInfo}>
                  <Avatar.Image 
                    size={24} 
                    source={{ uri: plan.avatar || 'https://via.placeholder.com/100' }}
                  />
                  <Text style={styles.coachName}>{plan.coach}</Text>
                </View>
              </View>
              <View style={styles.statusContainer}>
                <Chip
                  mode="flat"
                  style={[styles.statusChip, { backgroundColor: getStatusColor(plan.status) + '20' }]}
                  textStyle={[styles.statusText, { color: getStatusColor(plan.status) }]}
                  icon={getStatusIcon(plan.status)}
                >
                  {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                </Chip>
              </View>
            </View>
          </LinearGradient>

          <Card.Content style={styles.cardContent}>
            <View style={styles.progressSection}>
              <View style={styles.progressInfo}>
                <Text style={styles.progressLabel}>
                  Week {plan.currentWeek} of {plan.totalWeeks}
                </Text>
                <Text style={styles.progressSubtext}>
                  {plan.completedSessions}/{plan.totalSessions} sessions completed
                </Text>
              </View>
              <ProgressBar
                progress={plan.completedSessions / plan.totalSessions}
                color={plan.color}
                style={styles.progressBar}
              />
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Icon name="local-fire-department" size={20} color={COLORS.error} />
                <Text style={styles.statText}>{plan.streak} day streak</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="stars" size={20} color={COLORS.primary} />
                <Text style={styles.statText}>{plan.points} points</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="fitness-center" size={20} color={COLORS.secondary} />
                <Text style={styles.statText}>{plan.difficulty}</Text>
              </View>
            </View>

            {plan.status === 'active' && plan.nextSession && (
              <Surface style={styles.nextSessionContainer} elevation={2}>
                <View style={styles.nextSessionInfo}>
                  <Icon name="schedule" size={20} color={COLORS.primary} />
                  <Text style={styles.nextSessionText}>
                    Next: {formatNextSession(plan.nextSession)}
                  </Text>
                </View>
                <Button
                  mode="contained"
                  compact
                  onPress={() => navigateToSession(plan.id)}
                  style={styles.sessionButton}
                >
                  Start
                </Button>
              </Surface>
            )}
          </Card.Content>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderFilterChips = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      style={styles.filterContainer}
      contentContainerStyle={styles.filterContent}
    >
      {['all', 'active', 'completed', 'upcoming'].map((filter) => (
        <Chip
          key={filter}
          mode={filterType === filter ? 'flat' : 'outlined'}
          selected={filterType === filter}
          onPress={() => setFilterType(filter)}
          style={[
            styles.filterChip,
            filterType === filter && styles.selectedFilterChip
          ]}
          textStyle={[
            styles.filterChipText,
            filterType === filter && styles.selectedFilterChipText
          ]}
        >
          {filter.charAt(0).toUpperCase() + filter.slice(1)}
        </Chip>
      ))}
    </ScrollView>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="sports" size={80} color={COLORS.secondary} />
      <Text style={styles.emptyStateTitle}>No Training Plans Yet</Text>
      <Text style={styles.emptyStateText}>
        Connect with a coach to get started with personalized training plans
      </Text>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('FindCoaches')}
        style={styles.emptyStateButton}
        icon="search"
      >
        Find Coaches
      </Button>
    </View>
  );

  const renderPlanModal = () => (
    <Portal>
      <Modal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType="light"
          blurAmount={5}
          reducedTransparencyFallbackColor="white"
        />
        {selectedPlan && (
          <Card style={styles.modalCard}>
            <LinearGradient
              colors={[selectedPlan.color, selectedPlan.color + '60']}
              style={styles.modalHeader}
            >
              <View style={styles.modalHeaderContent}>
                <Text style={styles.modalTitle}>{selectedPlan.title}</Text>
                <IconButton
                  icon="close"
                  iconColor="white"
                  size={24}
                  onPress={() => setModalVisible(false)}
                />
              </View>
            </LinearGradient>
            <Card.Content style={styles.modalContent}>
              <View style={styles.modalStats}>
                <View style={styles.modalStatItem}>
                  <Text style={styles.modalStatNumber}>{selectedPlan.totalWeeks}</Text>
                  <Text style={styles.modalStatLabel}>Weeks</Text>
                </View>
                <View style={styles.modalStatItem}>
                  <Text style={styles.modalStatNumber}>{selectedPlan.totalSessions}</Text>
                  <Text style={styles.modalStatLabel}>Sessions</Text>
                </View>
                <View style={styles.modalStatItem}>
                  <Text style={styles.modalStatNumber}>{Math.round((selectedPlan.completedSessions / selectedPlan.totalSessions) * 100)}%</Text>
                  <Text style={styles.modalStatLabel}>Complete</Text>
                </View>
              </View>
              <Button
                mode="contained"
                onPress={() => {
                  setModalVisible(false);
                  navigation.navigate('TrainingPlanDetails', { planId: selectedPlan.id });
                }}
                style={styles.modalButton}
                icon="visibility"
              >
                View Full Details
              </Button>
            </Card.Content>
          </Card>
        )}
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>My Training Plans 💪</Text>
          <Text style={styles.headerSubtitle}>
            {filteredPlans.filter(p => p.status === 'active').length} active plans
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search training plans..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={COLORS.primary}
          inputStyle={styles.searchInput}
        />
      </View>

      {renderFilterChips()}

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary, COLORS.secondary]}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredPlans.length === 0 ? (
          renderEmptyState()
        ) : (
          filteredPlans.map((plan, index) => (
            <View key={plan.id}>
              {renderPlanCard({ item: plan, index })}
            </View>
          ))
        )}
      </ScrollView>

      {renderPlanModal()}

      <FAB
        style={styles.fab}
        icon="add"
        onPress={() => navigation.navigate('FindCoaches')}
        color="white"
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
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: 'white',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'white',
    opacity: 0.9,
    marginTop: SPACING.xs,
  },
  searchContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  searchBar: {
    elevation: 4,
    borderRadius: 25,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  filterContainer: {
    paddingVertical: SPACING.sm,
  },
  filterContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  filterChip: {
    marginRight: SPACING.sm,
  },
  selectedFilterChip: {
    backgroundColor: COLORS.primary + '20',
  },
  filterChipText: {
    ...TEXT_STYLES.caption,
  },
  selectedFilterChipText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl * 2,
  },
  cardContainer: {
    marginBottom: SPACING.md,
  },
  planCard: {
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
  },
  planInfo: {
    flex: 1,
  },
  planTitle: {
    ...TEXT_STYLES.h3,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  coachInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  coachName: {
    ...TEXT_STYLES.caption,
    color: 'white',
    opacity: 0.9,
  },
  statusContainer: {
    marginLeft: SPACING.sm,
  },
  statusChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  statusText: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
  },
  cardContent: {
    padding: SPACING.md,
  },
  progressSection: {
    marginBottom: SPACING.md,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  progressLabel: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  progressSubtext: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  nextSessionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: 8,
    backgroundColor: COLORS.primary + '10',
  },
  nextSessionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    flex: 1,
  },
  nextSessionText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: '500',
  },
  sessionButton: {
    borderRadius: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyStateTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptyStateText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  emptyStateButton: {
    borderRadius: 25,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  modalCard: {
    width: width * 0.9,
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    padding: SPACING.md,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: 'bold',
    flex: 1,
  },
  modalContent: {
    padding: SPACING.lg,
  },
  modalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.lg,
  },
  modalStatItem: {
    alignItems: 'center',
  },
  modalStatNumber: {
    ...TEXT_STYLES.h1,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  modalStatLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  modalButton: {
    borderRadius: 25,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default MyTrainingPlans;