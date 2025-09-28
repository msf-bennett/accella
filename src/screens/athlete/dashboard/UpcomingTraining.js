import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  Dimensions,
  Vibration,
} from 'react-native';
import { Card, Button, Chip, ProgressBar, Avatar, IconButton, FAB, Surface } from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Design system imports (assumed to be available in your project)
import { COLORS, SPACING, TEXT_STYLES } from '../../../constants/theme';

const { width } = Dimensions.get('window');

const UpcomingTraining = ({ navigation }) => {
  const [trainingData, setTrainingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [expandedSession, setExpandedSession] = useState(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fabAnim = useRef(new Animated.Value(0)).current;
  
  const dispatch = useDispatch();
  const userProfile = useSelector(state => state.user.profile);
  const trainingProgress = useSelector(state => state.training.progress);
  const upcomingSessions = useSelector(state => state.training.upcomingSessions);

  useEffect(() => {
    StatusBar.setTranslucent(true);
    StatusBar.setBarStyle('light-content');
    
    loadTrainingData();
    
    // Entrance animations
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
      Animated.timing(fabAnim, {
        toValue: 1,
        duration: 1000,
        delay: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadTrainingData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Mock training data - in real implementation, this would fetch from API
      const mockTrainingData = {
        weeklyOverview: {
          completedSessions: 4,
          totalSessions: 6,
          streakDays: 12,
          nextMilestone: 15,
          weeklyGoalProgress: 67,
        },
        upcomingSessions: [
          {
            id: '1',
            title: 'High Intensity Interval Training',
            coach: {
              name: 'Coach Sarah',
              avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786',
              rating: 4.9,
            },
            date: '2025-08-23',
            time: '07:00',
            duration: 60,
            location: 'Training Ground A',
            type: 'cardio',
            difficulty: 'high',
            equipment: ['Cones', 'Timer', 'Water bottle'],
            objectives: ['Improve VO2 Max', 'Build endurance', 'Sprint technique'],
            completionRate: 0,
            status: 'scheduled',
            weatherSuitability: 'excellent',
            participants: 8,
            maxParticipants: 12,
            price: 25,
            description: 'Intense cardio session focusing on sprint intervals and recovery periods.',
            tags: ['HIIT', 'Cardio', 'Sprint'],
            isOnline: false,
            reminderSet: true,
            nutritionTips: 'Light meal 2 hours before, hydrate well',
            recoveryTips: 'Cool down stretching, protein within 30 minutes',
          },
          {
            id: '2',
            title: 'Strength & Conditioning',
            coach: {
              name: 'Coach Marcus',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
              rating: 4.8,
            },
            date: '2025-08-23',
            time: '18:30',
            duration: 90,
            location: 'Gym Studio B',
            type: 'strength',
            difficulty: 'medium',
            equipment: ['Dumbbells', 'Resistance bands', 'Medicine ball'],
            objectives: ['Build muscle strength', 'Core stability', 'Functional movement'],
            completionRate: 0,
            status: 'scheduled',
            weatherSuitability: 'indoor',
            participants: 6,
            maxParticipants: 10,
            price: 30,
            description: 'Comprehensive strength training with focus on functional movements.',
            tags: ['Strength', 'Core', 'Functional'],
            isOnline: false,
            reminderSet: false,
            nutritionTips: 'Protein-rich meal 1 hour before',
            recoveryTips: '8 hours sleep, gentle stretching tomorrow',
          },
          {
            id: '3',
            title: 'Technical Skills Workshop',
            coach: {
              name: 'Coach Elena',
              avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
              rating: 5.0,
            },
            date: '2025-08-24',
            time: '10:00',
            duration: 120,
            location: 'Practice Field',
            type: 'technical',
            difficulty: 'medium',
            equipment: ['Balls', 'Cones', 'Goals'],
            objectives: ['Ball control', 'Passing accuracy', 'First touch'],
            completionRate: 0,
            status: 'scheduled',
            weatherSuitability: 'good',
            participants: 12,
            maxParticipants: 15,
            price: 35,
            description: 'Focus on technical skills development with game-like scenarios.',
            tags: ['Technical', 'Skills', 'Practice'],
            isOnline: false,
            reminderSet: true,
            nutritionTips: 'Complex carbs 2-3 hours before',
            recoveryTips: 'Active recovery, foam rolling',
          },
          {
            id: '4',
            title: 'Recovery & Mobility Session',
            coach: {
              name: 'Coach David',
              avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
              rating: 4.7,
            },
            date: '2025-08-24',
            time: '16:00',
            duration: 45,
            location: 'Wellness Center',
            type: 'recovery',
            difficulty: 'low',
            equipment: ['Yoga mats', 'Foam rollers', 'Bands'],
            objectives: ['Muscle recovery', 'Flexibility', 'Mental relaxation'],
            completionRate: 0,
            status: 'optional',
            weatherSuitability: 'indoor',
            participants: 4,
            maxParticipants: 8,
            price: 20,
            description: 'Gentle recovery session with stretching and mobility work.',
            tags: ['Recovery', 'Stretching', 'Wellness'],
            isOnline: true,
            reminderSet: false,
            nutritionTips: 'Stay hydrated, light snacks if needed',
            recoveryTips: 'Perfect for active recovery',
          },
          {
            id: '5',
            title: 'Match Preparation Training',
            coach: {
              name: 'Coach Sarah',
              avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786',
              rating: 4.9,
            },
            date: '2025-08-25',
            time: '15:00',
            duration: 75,
            location: 'Main Stadium',
            type: 'tactical',
            difficulty: 'high',
            equipment: ['Full kit', 'Training vests', 'Tactics board'],
            objectives: ['Game tactics', 'Set pieces', 'Team coordination'],
            completionRate: 0,
            status: 'mandatory',
            weatherSuitability: 'excellent',
            participants: 20,
            maxParticipants: 22,
            price: 0,
            description: 'Final preparation session before the weekend match.',
            tags: ['Tactical', 'Match Prep', 'Team'],
            isOnline: false,
            reminderSet: true,
            nutritionTips: 'Balanced meal 3 hours before, energy snack 1 hour before',
            recoveryTips: 'Early rest, match day preparation',
          },
        ],
        quickActions: [
          { id: 'reschedule', title: 'Reschedule', icon: 'schedule', color: COLORS.primary },
          { id: 'feedback', title: 'Feedback', icon: 'feedback', color: COLORS.secondary },
          { id: 'nutrition', title: 'Nutrition', icon: 'restaurant', color: COLORS.success },
          { id: 'performance', title: 'Stats', icon: 'analytics', color: COLORS.error },
        ]
      };
      
      setTrainingData(mockTrainingData);
    } catch (error) {
      console.error('Error loading training data:', error);
      Alert.alert(
        'Training Update',
        'Unable to load upcoming training sessions. Please check your internet connection.',
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTrainingData();
    setRefreshing(false);
  }, [loadTrainingData]);

  const getTypeColor = (type) => {
    const colors = {
      cardio: COLORS.error,
      strength: COLORS.primary,
      technical: COLORS.success,
      recovery: COLORS.secondary,
      tactical: '#9c27b0',
    };
    return colors[type] || COLORS.primary;
  };

  const getTypeIcon = (type) => {
    const icons = {
      cardio: 'favorite',
      strength: 'fitness-center',
      technical: 'sports-soccer',
      recovery: 'self-improvement',
      tactical: 'psychology',
    };
    return icons[type] || 'sports';
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      low: COLORS.success,
      medium: '#ff9800',
      high: COLORS.error,
    };
    return colors[difficulty] || COLORS.primary;
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: COLORS.primary,
      mandatory: COLORS.error,
      optional: COLORS.secondary,
      completed: COLORS.success,
    };
    return colors[status] || COLORS.primary;
  };

  const toggleSessionExpansion = (sessionId) => {
    Vibration.vibrate(50);
    setExpandedSession(expandedSession === sessionId ? null : sessionId);
  };

  const handleSessionAction = (action, session) => {
    Vibration.vibrate(100);
    
    switch (action) {
      case 'join':
        navigation.navigate('SessionDetails', { sessionId: session.id });
        break;
      case 'reschedule':
        Alert.alert(
          'Reschedule Session',
          `Would you like to reschedule "${session.title}"?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Reschedule', onPress: () => handleReschedule(session.id) },
          ]
        );
        break;
      case 'reminder':
        toggleReminder(session.id);
        break;
      case 'share':
        Alert.alert('Share', `Sharing "${session.title}" with your team!`);
        break;
      default:
        break;
    }
  };

  const handleReschedule = (sessionId) => {
    // Implementation for rescheduling
    Alert.alert('Feature Coming Soon', 'Rescheduling feature will be available in the next update! 🚧');
  };

  const toggleReminder = (sessionId) => {
    setTrainingData(prev => ({
      ...prev,
      upcomingSessions: prev.upcomingSessions.map(session =>
        session.id === sessionId
          ? { ...session, reminderSet: !session.reminderSet }
          : session
      )
    }));
    Alert.alert('Reminder Updated', 'Your reminder settings have been updated! 🔔');
  };

  const renderWeeklyOverview = () => {
    if (!trainingData?.weeklyOverview) return null;

    const { weeklyOverview } = trainingData;
    const progressPercentage = (weeklyOverview.completedSessions / weeklyOverview.totalSessions) * 100;

    return (
      <Card style={styles.overviewCard} elevation={4}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.overviewGradient}
        >
          <View style={styles.overviewContent}>
            <View style={styles.overviewHeader}>
              <Text style={styles.overviewTitle}>This Week's Progress 🎯</Text>
              <Text style={styles.overviewSubtitle}>Keep up the amazing work!</Text>
            </View>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressInfo}>
                <Text style={styles.progressLabel}>Sessions Completed</Text>
                <Text style={styles.progressValue}>
                  {weeklyOverview.completedSessions}/{weeklyOverview.totalSessions}
                </Text>
              </View>
              <ProgressBar
                progress={progressPercentage / 100}
                color="#fff"
                style={styles.progressBar}
              />
            </View>
            
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Icon name="local-fire-department" size={24} color="#fff" />
                <Text style={styles.statValue}>{weeklyOverview.streakDays}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
              
              <View style={styles.statItem}>
                <Icon name="trending-up" size={24} color="#fff" />
                <Text style={styles.statValue}>{Math.round(progressPercentage)}%</Text>
                <Text style={styles.statLabel}>Weekly Goal</Text>
              </View>
              
              <View style={styles.statItem}>
                <Icon name="jump-rope" size={24} color="#fff" />
                <Text style={styles.statValue}>{weeklyOverview.nextMilestone - weeklyOverview.streakDays}</Text>
                <Text style={styles.statLabel}>To Milestone</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </Card>
    );
  };

  const renderFilterChips = () => {
    const filters = [
      { key: 'all', label: 'All Sessions', icon: 'sports' },
      { key: 'today', label: 'Today', icon: 'today' },
      { key: 'mandatory', label: 'Mandatory', icon: 'priority-high' },
      { key: 'optional', label: 'Optional', icon: 'schedule' },
    ];

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScrollContent}
        style={styles.filterContainer}
      >
        {filters.map((filter) => (
          <Chip
            key={filter.key}
            selected={selectedFilter === filter.key}
            onPress={() => setSelectedFilter(filter.key)}
            icon={filter.icon}
            style={[
              styles.filterChip,
              selectedFilter === filter.key && styles.selectedFilterChip,
            ]}
            textStyle={[
              styles.filterChipText,
              selectedFilter === filter.key && styles.selectedFilterChipText,
            ]}
          >
            {filter.label}
          </Chip>
        ))}
      </ScrollView>
    );
  };

  const renderSessionCard = (session) => {
    const isExpanded = expandedSession === session.id;
    const sessionDate = new Date(session.date + 'T' + session.time);
    const timeUntil = Math.ceil((sessionDate.getTime() - new Date().getTime()) / (1000 * 60 * 60));

    return (
      <Card key={session.id} style={styles.sessionCard} elevation={3}>
        <TouchableOpacity
          onPress={() => toggleSessionExpansion(session.id)}
          activeOpacity={0.7}
        >
          <View style={styles.sessionHeader}>
            <View style={styles.sessionHeaderLeft}>
              <Surface style={[styles.typeIndicator, { backgroundColor: getTypeColor(session.type) }]}>
                <Icon name={getTypeIcon(session.type)} size={20} color="#fff" />
              </Surface>
              
              <View style={styles.sessionHeaderInfo}>
                <Text style={styles.sessionTitle} numberOfLines={1}>
                  {session.title}
                </Text>
                <View style={styles.sessionMeta}>
                  <Text style={styles.sessionTime}>
                    {session.time} • {session.duration}min
                  </Text>
                  {timeUntil > 0 && timeUntil <= 24 && (
                    <Chip size="small" style={styles.timeChip}>
                      {timeUntil}h left
                    </Chip>
                  )}
                </View>
              </View>
            </View>
            
            <View style={styles.sessionHeaderRight}>
              <Chip
                style={[styles.statusChip, { backgroundColor: getStatusColor(session.status) }]}
                textStyle={styles.statusChipText}
                compact
              >
                {session.status}
              </Chip>
              
              <IconButton
                icon={isExpanded ? 'expand-less' : 'expand-more'}
                size={20}
                iconColor={COLORS.primary}
              />
            </View>
          </View>
        </TouchableOpacity>
        
        {isExpanded && (
          <Animated.View style={styles.expandedContent}>
            <View style={styles.coachInfo}>
              <Avatar.Image
                source={{ uri: session.coach.avatar }}
                size={40}
              />
              <View style={styles.coachDetails}>
                <Text style={styles.coachName}>{session.coach.name}</Text>
                <View style={styles.ratingContainer}>
                  <Icon name="star" size={16} color="#ffc107" />
                  <Text style={styles.rating}>{session.coach.rating}</Text>
                </View>
              </View>
              
              <View style={styles.sessionPricing}>
                <Text style={styles.price}>
                  {session.price === 0 ? 'Free' : `$${session.price}`}
                </Text>
                <Text style={styles.participants}>
                  {session.participants}/{session.maxParticipants}
                </Text>
              </View>
            </View>
            
            <Text style={styles.sessionDescription}>{session.description}</Text>
            
            <View style={styles.detailsSection}>
              <View style={styles.detailRow}>
                <Icon name="location-on" size={18} color={COLORS.primary} />
                <Text style={styles.detailText}>{session.location}</Text>
                {session.isOnline && (
                  <Chip size="small" icon="video-call" style={styles.onlineChip}>
                    Online
                  </Chip>
                )}
              </View>
              
              <View style={styles.detailRow}>
                <Icon name="fitness-center" size={18} color={COLORS.primary} />
                <Text style={styles.detailText}>
                  Equipment: {session.equipment.join(', ')}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Icon name="signal-cellular-alt" size={18} color={getDifficultyColor(session.difficulty)} />
                <Text style={styles.detailText}>
                  Difficulty: {session.difficulty.toUpperCase()}
                </Text>
              </View>
            </View>
            
            <View style={styles.objectivesSection}>
              <Text style={styles.sectionTitle}>Session Objectives:</Text>
              {session.objectives.map((objective, index) => (
                <View key={index} style={styles.objectiveItem}>
                  <Icon name="check-circle" size={16} color={COLORS.success} />
                  <Text style={styles.objectiveText}>{objective}</Text>
                </View>
              ))}
            </View>
            
            <View style={styles.tagsContainer}>
              {session.tags.map((tag, index) => (
                <Chip key={index} size="small" style={styles.tagChip}>
                  {tag}
                </Chip>
              ))}
            </View>
            
            <View style={styles.tipsSection}>
              <View style={styles.tipItem}>
                <Icon name="restaurant" size={18} color={COLORS.success} />
                <Text style={styles.tipText}>{session.nutritionTips}</Text>
              </View>
              
              <View style={styles.tipItem}>
                <Icon name="self-improvement" size={18} color={COLORS.secondary} />
                <Text style={styles.tipText}>{session.recoveryTips}</Text>
              </View>
            </View>
            
            <View style={styles.sessionActions}>
              <Button
                mode="contained"
                onPress={() => handleSessionAction('join', session)}
                style={styles.primaryAction}
                contentStyle={styles.actionButtonContent}
                icon="play-arrow"
              >
                Join Session
              </Button>
              
              <View style={styles.secondaryActions}>
                <IconButton
                  icon={session.reminderSet ? 'notifications-active' : 'notifications-none'}
                  mode="contained"
                  iconColor={session.reminderSet ? COLORS.success : COLORS.textSecondary}
                  onPress={() => handleSessionAction('reminder', session)}
                />
                
                <IconButton
                  icon="schedule"
                  mode="contained"
                  iconColor={COLORS.primary}
                  onPress={() => handleSessionAction('reschedule', session)}
                />
                
                <IconButton
                  icon="share"
                  mode="contained"
                  iconColor={COLORS.secondary}
                  onPress={() => handleSessionAction('share', session)}
                />
              </View>
            </View>
          </Animated.View>
        )}
      </Card>
    );
  };

  const renderQuickActions = () => {
    if (!trainingData?.quickActions) return null;

    return (
      <Card style={styles.quickActionsCard} elevation={2}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          <Icon name="flash-on" size={20} color={COLORS.primary} />
        </View>
        
        <View style={styles.quickActionsGrid}>
          {trainingData.quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={[styles.quickActionItem, { borderColor: action.color }]}
              onPress={() => Alert.alert('Feature Coming Soon', `${action.title} feature will be available in the next update! 🚧`)}
            >
              <Icon name={action.icon} size={32} color={action.color} />
              <Text style={[styles.quickActionText, { color: action.color }]}>
                {action.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Icon name="fitness-center" size={48} color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading your training schedule...</Text>
      </View>
    );
  }

  const filteredSessions = trainingData?.upcomingSessions?.filter(session => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      return session.date === today;
    }
    return session.status === selectedFilter;
  }) || [];

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {renderWeeklyOverview()}
          {renderQuickActions()}
          
          <View style={styles.sessionsSection}>
            <Text style={styles.sectionTitle}>Upcoming Sessions 📅</Text>
            {renderFilterChips()}
            
            {filteredSessions.length === 0 ? (
              <Card style={styles.emptyStateCard}>
                <View style={styles.emptyState}>
                  <Icon name="event-available" size={64} color={COLORS.textSecondary} />
                  <Text style={styles.emptyStateTitle}>No Sessions Found</Text>
                  <Text style={styles.emptyStateText}>
                    {selectedFilter === 'all' 
                      ? "You're all caught up! New sessions will appear here."
                      : `No ${selectedFilter} sessions scheduled.`}
                  </Text>
                </View>
              </Card>
            ) : (
              filteredSessions.map(renderSessionCard)
            )}
          </View>
        </View>
      </ScrollView>
      
      <Animated.View
        style={[
          styles.fabContainer,
          {
            opacity: fabAnim,
            transform: [
              {
                scale: fabAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              },
            ],
          },
        ]}
      >
        <FAB
          icon="add"
          style={styles.fab}
          onPress={() => Alert.alert('Feature Coming Soon', 'Book new session feature will be available in the next update! 🚧')}
        />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
    paddingTop: SPACING.xl,
  },
  
  // Weekly Overview Styles
  overviewCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
  },
  overviewGradient: {
    padding: SPACING.lg,
  },
  overviewContent: {
    alignItems: 'center',
  },
  overviewHeader: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  overviewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  overviewSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: SPACING.xs,
  },
  progressContainer: {
    width: '100%',
    marginBottom: SPACING.lg,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  progressLabel: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  progressValue: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: SPACING.xs,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  
  // Quick Actions Styles
  quickActionsCard: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  cardTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickActionItem: {
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: 'rgba(102, 126, 234, 0.05)',
    minWidth: 70,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  
  // Filter Chips Styles
  filterContainer: {
    marginBottom: SPACING.md,
  },
  filterScrollContent: {
    paddingHorizontal: SPACING.xs,
  },
  filterChip: {
    marginHorizontal: SPACING.xs,
    backgroundColor: COLORS.surface,
  },
  selectedFilterChip: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    color: COLORS.textPrimary,
  },
  selectedFilterChipText: {
    color: '#fff',
  },
  
  // Sessions Section Styles
  sessionsSection: {
    marginTop: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  
  // Session Card Styles
  sessionCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
  },
  sessionHeader: {
    flexDirection: 'row',
    padding: SPACING.md,
    alignItems: 'center',
  },
  sessionHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  sessionHeaderInfo: {
    flex: 1,
  },
  sessionTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  sessionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  sessionTime: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginRight: SPACING.sm,
  },
  timeChip: {
    backgroundColor: COLORS.error,
    height: 24,
  },
  sessionHeaderRight: {
    alignItems: 'flex-end',
  },
  statusChip: {
    marginBottom: SPACING.xs,
  },
  statusChipText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  
  // Expanded Content Styles
  expandedContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  coachInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  coachDetails: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  coachName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  rating: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  sessionPricing: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  participants: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  sessionDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  
  // Details Section Styles
  detailsSection: {
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  onlineChip: {
    backgroundColor: COLORS.success,
    marginLeft: SPACING.sm,
  },
  
  // Objectives Section Styles
  objectivesSection: {
    marginBottom: SPACING.md,
  },
  objectiveItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  objectiveText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  
  // Tags Styles
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  tagChip: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  
  // Tips Section Styles
  tipsSection: {
    backgroundColor: 'rgba(102, 126, 234, 0.05)',
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.md,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  tipText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
    flex: 1,
    lineHeight: 18,
  },
  
  // Session Actions Styles
  sessionActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  primaryAction: {
    flex: 1,
    marginRight: SPACING.sm,
    backgroundColor: COLORS.primary,
  },
  actionButtonContent: {
    paddingVertical: SPACING.xs,
  },
  secondaryActions: {
    flexDirection: 'row',
  },
  
  // Empty State Styles
  emptyStateCard: {
    padding: SPACING.xl,
    borderRadius: 16,
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
  },
  emptyStateTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginTop: SPACING.md,
  },
  emptyStateText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 20,
  },
  
  // FAB Styles
  fabContainer: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.lg,
  },
  fab: {
    backgroundColor: COLORS.primary,
  },
});

export default UpcomingTraining;