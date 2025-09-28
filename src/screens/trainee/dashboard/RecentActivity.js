import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Animated,
  StatusBar,
  Dimensions,
  Alert,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  Avatar,
  Surface,
  IconButton,
  Searchbar,
  SegmentedButtons,
  ProgressBar,
  Divider,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const RecentActivities = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [expandedItems, setExpandedItems] = useState(new Set());

  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);

  const filterOptions = [
    { value: 'all', label: 'All', icon: 'list' },
    { value: 'workouts', label: 'Workouts', icon: 'fitness-center' },
    { value: 'achievements', label: 'Achievements', icon: 'star' },
    { value: 'social', label: 'Social', icon: 'people' },
  ];

  // Mock activity data
  const activities = [
    {
      id: 1,
      type: 'workout_completed',
      title: 'Upper Body Strength',
      description: 'Completed 45-minute strength training session',
      timestamp: '2024-08-24T14:30:00Z',
      category: 'workouts',
      details: {
        duration: '45 min',
        exercises: 8,
        sets: 24,
        totalWeight: '2,450 kg',
        calories: 320,
        rating: 4,
      },
      icon: 'fitness-center',
      color: COLORS.primary,
      gradient: ['#667eea', '#764ba2'],
      badge: 'NEW',
    },
    {
      id: 2,
      type: 'achievement_unlocked',
      title: 'Consistency Champion! 🏆',
      description: 'Completed 7 consecutive training days',
      timestamp: '2024-08-24T12:15:00Z',
      category: 'achievements',
      details: {
        streak: 7,
        xpEarned: 150,
        level: 'Gold',
        nextGoal: '14 days',
      },
      icon: 'jump-rope',
      color: '#ffd700',
      gradient: ['#ffd700', '#ffed4e'],
      badge: 'ACHIEVEMENT',
    },
    {
      id: 3,
      type: 'coach_feedback',
      title: 'Coach Feedback Received',
      description: 'Your form on deadlifts has improved significantly',
      timestamp: '2024-08-24T10:45:00Z',
      category: 'social',
      details: {
        coach: 'Coach Martinez',
        rating: 'Excellent',
        improvements: ['Form', 'Technique'],
        nextFocus: 'Increase weight gradually',
      },
      icon: 'chat',
      color: COLORS.success,
      gradient: ['#11998e', '#38ef7d'],
      badge: null,
    },
    {
      id: 4,
      type: 'workout_completed',
      title: 'HIIT Cardio Session',
      description: 'High-intensity interval training completed',
      timestamp: '2024-08-23T18:00:00Z',
      category: 'workouts',
      details: {
        duration: '30 min',
        intervals: 12,
        avgHeartRate: 165,
        maxHeartRate: 185,
        calories: 285,
        rating: 5,
      },
      icon: 'favorite',
      color: COLORS.error,
      gradient: ['#ff9a9e', '#fecfef'],
      badge: null,
    },
    {
      id: 5,
      type: 'milestone_reached',
      title: 'Personal Best! 💪',
      description: 'New bench press record: 85kg',
      timestamp: '2024-08-23T16:30:00Z',
      category: 'achievements',
      details: {
        exercise: 'Bench Press',
        newRecord: '85kg',
        previousRecord: '80kg',
        improvement: '+5kg',
        xpEarned: 100,
      },
      icon: 'trending-up',
      color: '#9c27b0',
      gradient: ['#667eea', '#764ba2'],
      badge: 'PB',
    },
    {
      id: 6,
      type: 'nutrition_logged',
      title: 'Daily Nutrition Complete',
      description: 'All meals logged for today',
      timestamp: '2024-08-23T14:20:00Z',
      category: 'workouts',
      details: {
        calories: 2450,
        protein: '140g',
        carbs: '280g',
        fats: '95g',
        waterIntake: '3.2L',
        goals: 'Met all targets',
      },
      icon: 'restaurant',
      color: '#ff9800',
      gradient: ['#ffecd2', '#fcb69f'],
      badge: null,
    },
    {
      id: 7,
      type: 'team_activity',
      title: 'Team Practice Session',
      description: 'Football training with Team Alpha',
      timestamp: '2024-08-23T09:00:00Z',
      category: 'social',
      details: {
        team: 'Team Alpha',
        participants: 18,
        drills: 6,
        scrimmageTime: '20 min',
        performance: 'Above Average',
      },
      icon: 'groups',
      color: COLORS.primary,
      gradient: ['#667eea', '#764ba2'],
      badge: null,
    },
    {
      id: 8,
      type: 'recovery_logged',
      title: 'Recovery Session',
      description: 'Rest day with light stretching',
      timestamp: '2024-08-22T19:30:00Z',
      category: 'workouts',
      details: {
        sleepQuality: 'Excellent',
        sleepHours: 8.5,
        stretching: '15 min',
        mood: 'Great',
        soreness: 'Minimal',
      },
      icon: 'self-improvement',
      color: '#3f51b5',
      gradient: ['#667eea', '#764ba2'],
      badge: null,
    },
  ];

  const statsData = {
    thisWeek: {
      workouts: 5,
      achievements: 2,
      totalTime: '4h 15m',
      xpEarned: 450,
    },
    thisMonth: {
      workouts: 18,
      achievements: 7,
      totalTime: '16h 30m',
      xpEarned: 1850,
    },
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('Activities Updated! 📱', 'Your recent activities have been refreshed.');
    }, 1500);
  }, []);

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now - time) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return time.toLocaleDateString();
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || activity.category === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const toggleExpanded = (itemId) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const renderStatsHeader = () => (
    <Card style={styles.statsCard} elevation={3}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.statsGradient}
      >
        <Text style={[TEXT_STYLES.h4, { color: 'white', marginBottom: SPACING.md }]}>
          Activity Summary 📊
        </Text>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>
              {statsData.thisWeek.workouts}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
              This Week
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>
              {statsData.thisWeek.achievements}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
              Achievements
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>
              {statsData.thisWeek.totalTime}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
              Total Time
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>
              {statsData.thisWeek.xpEarned}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
              XP Earned
            </Text>
          </View>
        </View>
      </LinearGradient>
    </Card>
  );

  const renderActivityDetails = (activity) => (
    <View style={styles.activityDetails}>
      <Divider style={{ marginVertical: SPACING.sm }} />
      {Object.entries(activity.details).map(([key, value]) => (
        <View key={key} style={styles.detailRow}>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.secondary, textTransform: 'capitalize' }]}>
            {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
          </Text>
          <Text style={[TEXT_STYLES.body, { fontWeight: '500' }]}>
            {value}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderActivityItem = ({ item }) => {
    const isExpanded = expandedItems.has(item.id);
    
    return (
      <Card style={styles.activityCard} elevation={2}>
        <TouchableOpacity onPress={() => toggleExpanded(item.id)} activeOpacity={0.8}>
          <View style={styles.activityContent}>
            <LinearGradient
              colors={item.gradient}
              style={styles.activityIconContainer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Icon name={item.icon} size={24} color="white" />
            </LinearGradient>
            
            <View style={styles.activityInfo}>
              <View style={styles.activityHeader}>
                <Text style={[TEXT_STYLES.h5, { flex: 1 }]}>
                  {item.title}
                </Text>
                {item.badge && (
                  <Chip
                    mode="outlined"
                    compact
                    textStyle={{ fontSize: 8 }}
                    style={[styles.badge, { backgroundColor: item.color }]}
                  >
                    {item.badge}
                  </Chip>
                )}
              </View>
              
              <Text style={[TEXT_STYLES.body, { color: COLORS.secondary, marginBottom: SPACING.xs }]}>
                {item.description}
              </Text>
              
              <View style={styles.activityMeta}>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.secondary }]}>
                  {formatTimeAgo(item.timestamp)}
                </Text>
                <Icon
                  name={isExpanded ? 'expand-less' : 'expand-more'}
                  size={20}
                  color={COLORS.secondary}
                />
              </View>
            </View>
          </View>
        </TouchableOpacity>
        
        {isExpanded && renderActivityDetails(item)}
      </Card>
    );
  };

  const renderFilterButtons = () => (
    <View style={styles.filterContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.filterButtons}>
          {filterOptions.map((option) => (
            <Chip
              key={option.value}
              mode={selectedFilter === option.value ? 'flat' : 'outlined'}
              selected={selectedFilter === option.value}
              onPress={() => setSelectedFilter(option.value)}
              icon={option.icon}
              style={[
                styles.filterChip,
                selectedFilter === option.value && { backgroundColor: COLORS.primary }
              ]}
              textStyle={{
                color: selectedFilter === option.value ? 'white' : COLORS.primary
              }}
            >
              {option.label}
            </Chip>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <Animated.View style={[styles.animatedContainer, { opacity: fadeAnim }]}>
        {/* Header */}
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.header}
        >
          <Text style={[TEXT_STYLES.h3, { color: 'white', marginBottom: SPACING.xs }]}>
            Recent Activities 📋
          </Text>
          <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.9)' }]}>
            Your training journey
          </Text>
        </LinearGradient>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search activities..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            inputStyle={TEXT_STYLES.body}
            iconColor={COLORS.primary}
          />
        </View>

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
          {/* Stats Header */}
          {renderStatsHeader()}
          
          {/* Filter Buttons */}
          {renderFilterButtons()}
          
          {/* Activity List */}
          <View style={styles.activitiesContainer}>
            <FlatList
              data={filteredActivities}
              renderItem={renderActivityItem}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{ height: SPACING.md }} />}
              ListEmptyComponent={() => (
                <Card style={styles.emptyCard} elevation={1}>
                  <Card.Content style={styles.emptyContent}>
                    <Icon name="search-off" size={48} color={COLORS.secondary} />
                    <Text style={[TEXT_STYLES.h4, { color: COLORS.secondary, marginTop: SPACING.md }]}>
                      No activities found
                    </Text>
                    <Text style={[TEXT_STYLES.body, { color: COLORS.secondary, textAlign: 'center', marginTop: SPACING.sm }]}>
                      Try adjusting your search or filter options
                    </Text>
                  </Card.Content>
                </Card>
              )}
            />
          </View>
          
          <View style={{ height: SPACING.xl }} />
        </ScrollView>
      </Animated.View>

      {/* Quick Action Buttons */}
      <View style={styles.quickActions}>
        <IconButton
          icon="filter-list"
          size={24}
          iconColor="white"
          style={[styles.quickActionButton, { backgroundColor: COLORS.primary }]}
          onPress={() => Alert.alert('Advanced Filters', 'Feature coming soon! Filter by date range, activity type, and more.')}
        />
        <IconButton
          icon="share"
          size={24}
          iconColor="white"
          style={[styles.quickActionButton, { backgroundColor: COLORS.success }]}
          onPress={() => Alert.alert('Share Progress', 'Feature coming soon! Share your achievements with friends and coaches.')}
        />
      </View>
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  animatedContainer: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl + 30,
    paddingBottom: SPACING.lg,
  },
  searchContainer: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  searchBar: {
    elevation: 2,
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  statsCard: {
    marginBottom: SPACING.lg,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statsGradient: {
    padding: SPACING.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  filterContainer: {
    marginBottom: SPACING.lg,
  },
  filterButtons: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.sm,
  },
  filterChip: {
    marginRight: SPACING.sm,
  },
  activitiesContainer: {
    marginBottom: SPACING.lg,
  },
  activityCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  activityContent: {
    flexDirection: 'row',
    padding: SPACING.md,
    alignItems: 'center',
  },
  activityIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  activityInfo: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  badge: {
    height: 20,
    marginLeft: SPACING.sm,
  },
  activityMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  activityDetails: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  emptyCard: {
    borderRadius: 12,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  quickActions: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.xl,
    gap: SPACING.sm,
  },
  quickActionButton: {
    borderRadius: 28,
  },
};

export default RecentActivities;