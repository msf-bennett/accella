import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  RefreshControl,
  StatusBar,
  Animated,
  TouchableOpacity,
  Alert,
  Vibration,
} from 'react-native';
import {
  Card,
  Avatar,
  Chip,
  ProgressBar,
  IconButton,
  Surface,
  Portal,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/styles';

const RecentActivity = ({ navigation, route }) => {
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  // Redux state
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const activities = useSelector(state => state.activities.recent || []);
  const loading = useSelector(state => state.activities.loading);
  const achievements = useSelector(state => state.achievements.recent || []);

  // Mock data for demonstration (replace with Redux store data)
  const mockActivities = [
    {
      id: 1,
      type: 'training_completed',
      title: '⚽ Soccer Fundamentals Session',
      description: 'Completed dribbling and passing drills',
      timestamp: '2 hours ago',
      points: 25,
      coach: 'Coach Sarah',
      duration: '45 min',
      completion: 100,
      icon: 'sports-soccer',
      color: COLORS.success,
    },
    {
      id: 2,
      type: 'achievement_unlocked',
      title: '🏆 First Week Champion',
      description: 'Completed all sessions this week!',
      timestamp: '1 day ago',
      points: 50,
      badge: 'champion',
      icon: 'jump-rope',
      color: COLORS.primary,
    },
    {
      id: 3,
      type: 'feedback_received',
      title: '📝 Coach Feedback',
      description: 'Great improvement in ball control!',
      timestamp: '2 days ago',
      coach: 'Coach Mike',
      rating: 4.5,
      icon: 'feedback',
      color: '#FF9800',
    },
    {
      id: 4,
      type: 'training_scheduled',
      title: '📅 New Session Available',
      description: 'Speed and Agility Training',
      timestamp: '3 days ago',
      coach: 'Coach Sarah',
      scheduledFor: 'Tomorrow 4:00 PM',
      icon: 'event',
      color: COLORS.secondary,
    },
    {
      id: 5,
      type: 'milestone_reached',
      title: '🎯 Milestone Achieved',
      description: 'Completed 10 training sessions',
      timestamp: '1 week ago',
      points: 100,
      progress: 10,
      total: 10,
      icon: 'flag',
      color: '#4CAF50',
    },
  ];

  // Animation setup
  useEffect(() => {
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
  }, [fadeAnim, slideAnim]);

  // Pull to refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Vibration.vibrate(50);
    
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  // Activity item press handler
  const handleActivityPress = useCallback((activity) => {
    Vibration.vibrate(30);
    setSelectedActivity(activity);
    setShowDetails(true);
  }, []);

  // Get activity icon color
  const getActivityIconColor = (type) => {
    switch (type) {
      case 'training_completed':
        return COLORS.success;
      case 'achievement_unlocked':
        return COLORS.primary;
      case 'feedback_received':
        return '#FF9800';
      case 'training_scheduled':
        return COLORS.secondary;
      case 'milestone_reached':
        return '#4CAF50';
      default:
        return COLORS.primary;
    }
  };

  // Render activity item
  const renderActivityItem = (activity, index) => (
    <Animated.View
      key={activity.id}
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        marginBottom: SPACING.medium,
      }}
    >
      <TouchableOpacity
        onPress={() => handleActivityPress(activity)}
        activeOpacity={0.7}
      >
        <Card style={styles.activityCard}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.activityHeader}>
              <Surface style={[styles.iconContainer, { backgroundColor: activity.color + '20' }]}>
                <Icon
                  name={activity.icon}
                  size={24}
                  color={activity.color}
                />
              </Surface>
              
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.activityDescription} numberOfLines={2}>
                  {activity.description}
                </Text>
                
                {activity.coach && (
                  <View style={styles.coachInfo}>
                    <Avatar.Text size={20} label={activity.coach.split(' ')[1]?.[0] || 'C'} />
                    <Text style={styles.coachName}>{activity.coach}</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.activityMeta}>
                <Text style={styles.timestamp}>{activity.timestamp}</Text>
                {activity.points && (
                  <Chip
                    style={styles.pointsChip}
                    textStyle={styles.pointsText}
                    compact
                  >
                    +{activity.points} pts
                  </Chip>
                )}
              </View>
            </View>
            
            {/* Progress indicators */}
            {activity.completion !== undefined && (
              <View style={styles.progressContainer}>
                <Text style={styles.progressLabel}>
                  Completion: {activity.completion}%
                </Text>
                <ProgressBar
                  progress={activity.completion / 100}
                  color={activity.color}
                  style={styles.progressBar}
                />
              </View>
            )}
            
            {activity.progress !== undefined && (
              <View style={styles.progressContainer}>
                <Text style={styles.progressLabel}>
                  Progress: {activity.progress}/{activity.total}
                </Text>
                <ProgressBar
                  progress={activity.progress / activity.total}
                  color={activity.color}
                  style={styles.progressBar}
                />
              </View>
            )}
            
            {/* Rating display */}
            {activity.rating && (
              <View style={styles.ratingContainer}>
                <Icon name="star" size={16} color="#FFD700" />
                <Text style={styles.ratingText}>{activity.rating}/5</Text>
              </View>
            )}
          </Card.Content>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="history" size={80} color={COLORS.primary + '40'} />
      <Text style={styles.emptyTitle}>No Recent Activity</Text>
      <Text style={styles.emptyDescription}>
        Complete your first training session to see activity here! 🏃‍♂️
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Recent Activity 📊</Text>
          <Text style={styles.headerSubtitle}>
            Track your progress and achievements
          </Text>
        </View>
      </LinearGradient>
      
      {/* Content */}
      <ScrollView
        style={styles.content}
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
        {/* Activity List */}
        <View style={styles.activitiesContainer}>
          {mockActivities.length > 0 ? (
            mockActivities.map((activity, index) =>
              renderActivityItem(activity, index)
            )
          ) : (
            renderEmptyState()
          )}
        </View>
        
        {/* Bottom spacing */}
        <View style={{ height: SPACING.large * 2 }} />
      </ScrollView>
      
      {/* Activity Details Modal */}
      <Portal>
        {showDetails && selectedActivity && (
          <View style={styles.modalOverlay}>
            <BlurView
              style={styles.blurView}
              blurType="light"
              blurAmount={10}
            />
            <View style={styles.modalContent}>
              <Surface style={styles.modal}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Activity Details</Text>
                  <IconButton
                    icon="close"
                    size={24}
                    onPress={() => setShowDetails(false)}
                  />
                </View>
                
                <View style={styles.modalBody}>
                  <View style={styles.modalActivityHeader}>
                    <Surface style={[styles.iconContainer, { backgroundColor: selectedActivity.color + '20' }]}>
                      <Icon
                        name={selectedActivity.icon}
                        size={32}
                        color={selectedActivity.color}
                      />
                    </Surface>
                    <Text style={styles.modalActivityTitle}>
                      {selectedActivity.title}
                    </Text>
                  </View>
                  
                  <Text style={styles.modalDescription}>
                    {selectedActivity.description}
                  </Text>
                  
                  {selectedActivity.duration && (
                    <View style={styles.modalDetail}>
                      <Icon name="schedule" size={20} color={COLORS.primary} />
                      <Text style={styles.modalDetailText}>
                        Duration: {selectedActivity.duration}
                      </Text>
                    </View>
                  )}
                  
                  {selectedActivity.scheduledFor && (
                    <View style={styles.modalDetail}>
                      <Icon name="event" size={20} color={COLORS.primary} />
                      <Text style={styles.modalDetailText}>
                        Scheduled: {selectedActivity.scheduledFor}
                      </Text>
                    </View>
                  )}
                  
                  {selectedActivity.points && (
                    <View style={styles.modalDetail}>
                      <Icon name="stars" size={20} color="#FFD700" />
                      <Text style={styles.modalDetailText}>
                        Points Earned: {selectedActivity.points}
                      </Text>
                    </View>
                  )}
                </View>
              </Surface>
            </View>
          </View>
        )}
      </Portal>
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.large,
    paddingBottom: SPACING.large,
    paddingHorizontal: SPACING.large,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.title,
    color: 'white',
    marginBottom: SPACING.small,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.medium,
  },
  activitiesContainer: {
    paddingTop: SPACING.medium,
  },
  activityCard: {
    backgroundColor: 'white',
    elevation: 3,
    borderRadius: 12,
  },
  cardContent: {
    padding: SPACING.medium,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.medium,
  },
  activityInfo: {
    flex: 1,
    marginRight: SPACING.small,
  },
  activityTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
    marginBottom: SPACING.tiny,
  },
  activityDescription: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.small,
  },
  coachInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.small,
  },
  coachName: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    marginLeft: SPACING.small,
  },
  activityMeta: {
    alignItems: 'flex-end',
  },
  timestamp: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.small,
  },
  pointsChip: {
    backgroundColor: COLORS.primary + '20',
  },
  pointsText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginTop: SPACING.medium,
  },
  progressLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.small,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.small,
  },
  ratingText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginLeft: SPACING.tiny,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.large * 2,
  },
  emptyTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
    marginTop: SPACING.medium,
    marginBottom: SPACING.small,
  },
  emptyDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.large,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.medium,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
  },
  modalBody: {
    padding: SPACING.medium,
  },
  modalActivityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.medium,
  },
  modalActivityTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
    marginLeft: SPACING.medium,
    flex: 1,
  },
  modalDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.medium,
    lineHeight: 22,
  },
  modalDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.small,
  },
  modalDetailText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    marginLeft: SPACING.small,
  },
};

export default RecentActivity;