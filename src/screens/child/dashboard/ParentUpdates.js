import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StatusBar,
  Animated,
  Alert,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  Card,
  Button,
  Avatar,
  Chip,
  ProgressBar,
  Badge,
  IconButton,
  Surface,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';

// Import your design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/styles';

const { width } = Dimensions.get('window');

const ParentUpdates = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, updates, loading } = useSelector(state => state.child);
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    StatusBar.setTranslucent(true);
    
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Load parent updates
    loadParentUpdates();
  }, []);

  const loadParentUpdates = useCallback(async () => {
    try {
      // Simulate API call for parent updates
      // dispatch(fetchParentUpdates(user.id));
      
      // For now, show development alert
      setTimeout(() => {
        Alert.alert(
          'Feature Development',
          'Parent Updates feature is currently being developed. This will show real-time updates about your child\'s training progress, achievements, and coach feedback.',
          [{ text: 'OK' }]
        );
      }, 1000);
    } catch (error) {
      console.error('Error loading parent updates:', error);
    }
  }, [user?.id, dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadParentUpdates();
    setRefreshing(false);
  }, [loadParentUpdates]);

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    // Filter updates based on selection
  };

  const handleUpdatePress = (update) => {
    // Navigate to detailed update view
    navigation.navigate('UpdateDetail', { updateId: update.id });
  };

  const renderUpdateCard = (update, index) => {
    const cardOpacity = scrollY.interpolate({
      inputRange: [0, 50 * index, 50 * (index + 2)],
      outputRange: [1, 1, 0.3],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        key={update.id}
        style={[
          styles.updateCard,
          { opacity: cardOpacity }
        ]}
      >
        <Card style={styles.card} onPress={() => handleUpdatePress(update)}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.updateHeader}>
              <View style={styles.updateInfo}>
                <View style={styles.updateTypeContainer}>
                  <Icon 
                    name={getUpdateIcon(update.type)} 
                    size={20} 
                    color={getUpdateColor(update.type)} 
                  />
                  <Text style={[styles.updateType, { color: getUpdateColor(update.type) }]}>
                    {update.type}
                  </Text>
                </View>
                <Text style={styles.updateTime}>{update.timeAgo}</Text>
              </View>
              {update.urgent && (
                <Chip 
                  mode="flat" 
                  style={[styles.urgentChip, { backgroundColor: COLORS.error + '20' }]}
                  textStyle={{ color: COLORS.error, fontSize: 11 }}
                >
                  Urgent
                </Chip>
              )}
            </View>

            <Text style={styles.updateTitle}>{update.title}</Text>
            <Text style={styles.updateDescription} numberOfLines={2}>
              {update.description}
            </Text>

            <View style={styles.updateFooter}>
              <View style={styles.coachInfo}>
                <Avatar.Text
                  size={24}
                  label={update.coach.initials}
                  style={styles.coachAvatar}
                />
                <Text style={styles.coachName}>{update.coach.name}</Text>
              </View>
              
              {update.hasAttachment && (
                <Icon name="attachment" size={16} color={COLORS.primary} />
              )}
            </View>
          </Card.Content>
        </Card>
      </Animated.View>
    );
  };

  const getUpdateIcon = (type) => {
    const icons = {
      'Progress': 'trending-up',
      'Achievement': 'star',
      'Attendance': 'event',
      'Performance': 'assessment',
      'Communication': 'message',
      'Schedule': 'schedule',
      'Health': 'favorite',
      'Feedback': 'comment',
    };
    return icons[type] || 'info';
  };

  const getUpdateColor = (type) => {
    const colors = {
      'Progress': COLORS.primary,
      'Achievement': '#FFD700',
      'Attendance': COLORS.success,
      'Performance': '#FF6B35',
      'Communication': COLORS.secondary,
      'Schedule': '#764ba2',
      'Health': '#E74C3C',
      'Feedback': COLORS.primary,
    };
    return colors[type] || COLORS.primary;
  };

  // Mock data for development
  const mockUpdates = [
    {
      id: 1,
      type: 'Achievement',
      title: 'New Personal Best! 🎉',
      description: 'Your child achieved a new personal best in the 100m sprint today with a time of 14.2 seconds!',
      timeAgo: '2 hours ago',
      urgent: false,
      coach: { name: 'Coach Sarah', initials: 'CS' },
      hasAttachment: false,
    },
    {
      id: 2,
      type: 'Progress',
      title: 'Weekly Progress Update',
      description: 'Great improvement in endurance training this week. Completed all sessions with excellent form.',
      timeAgo: '1 day ago',
      urgent: false,
      coach: { name: 'Coach Mike', initials: 'CM' },
      hasAttachment: true,
    },
    {
      id: 3,
      type: 'Schedule',
      title: 'Schedule Change Notice',
      description: 'Tomorrow\'s training session has been moved from 4:00 PM to 3:30 PM due to facility maintenance.',
      timeAgo: '2 days ago',
      urgent: true,
      coach: { name: 'Coach Sarah', initials: 'CS' },
      hasAttachment: false,
    },
    {
      id: 4,
      type: 'Attendance',
      title: 'Perfect Attendance Week! ⭐',
      description: 'Congratulations! Your child attended all training sessions this week with great enthusiasm.',
      timeAgo: '3 days ago',
      urgent: false,
      coach: { name: 'Coach Mike', initials: 'CM' },
      hasAttachment: false,
    },
  ];

  const filterOptions = [
    { key: 'all', label: 'All Updates', count: mockUpdates.length },
    { key: 'urgent', label: 'Urgent', count: mockUpdates.filter(u => u.urgent).length },
    { key: 'achievement', label: 'Achievements', count: mockUpdates.filter(u => u.type === 'Achievement').length },
    { key: 'progress', label: 'Progress', count: mockUpdates.filter(u => u.type === 'Progress').length },
  ];

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Parent Updates</Text>
            <IconButton
              icon="notifications"
              iconColor="white"
              size={24}
              onPress={() => navigation.navigate('Notifications')}
            />
          </View>
          <Text style={styles.headerSubtitle}>
            Stay updated on {user?.firstName || 'your child'}'s training journey
          </Text>
        </View>
      </LinearGradient>

      {/* Filter Chips */}
      <View style={styles.filterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          {filterOptions.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              onPress={() => handleFilterChange(filter.key)}
              style={[
                styles.filterChip,
                selectedFilter === filter.key && styles.filterChipActive
              ]}
            >
              <Text style={[
                styles.filterChipText,
                selectedFilter === filter.key && styles.filterChipTextActive
              ]}>
                {filter.label} ({filter.count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Updates List */}
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Quick Stats */}
          <View style={styles.statsRow}>
            <Surface style={styles.statCard}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>This Week</Text>
            </Surface>
            <Surface style={styles.statCard}>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Unread</Text>
            </Surface>
            <Surface style={styles.statCard}>
              <Text style={styles.statNumber}>5</Text>
              <Text style={styles.statLabel}>Achievements</Text>
            </Surface>
          </View>

          {/* Updates */}
          <Text style={styles.sectionTitle}>Recent Updates</Text>
          
          {mockUpdates.map((update, index) => renderUpdateCard(update, index))}

          {/* Load More Button */}
          <Button
            mode="outlined"
            onPress={() => Alert.alert('Load More', 'Loading more updates...')}
            style={styles.loadMoreButton}
            contentStyle={styles.loadMoreContent}
          >
            Load More Updates
          </Button>
        </Animated.View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: SPACING.xs,
  },
  filterContainer: {
    backgroundColor: 'white',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterContent: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    ...TEXT_STYLES.caption,
    color: COLORS.text,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: SPACING.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  statNumber: {
    ...TEXT_STYLES.h3,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
  sectionTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: SPACING.lg,
  },
  updateCard: {
    marginBottom: SPACING.md,
  },
  card: {
    borderRadius: 12,
    elevation: 3,
  },
  cardContent: {
    padding: SPACING.md,
  },
  updateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  updateInfo: {
    flex: 1,
  },
  updateTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  updateType: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  updateTime: {
    ...TEXT_STYLES.caption,
    color: COLORS.textLight,
  },
  urgentChip: {
    height: 24,
  },
  updateTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  updateDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textLight,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  updateFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coachInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coachAvatar: {
    backgroundColor: COLORS.primary,
    marginRight: SPACING.sm,
  },
  coachName: {
    ...TEXT_STYLES.caption,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  loadMoreButton: {
    marginTop: SPACING.lg,
    borderColor: COLORS.primary,
  },
  loadMoreContent: {
    paddingVertical: SPACING.sm,
  },
};

export default ParentUpdates;