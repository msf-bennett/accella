import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  RefreshControl,
  Animated,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Alert,
  FlatList,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Badge,
  Searchbar,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f8f9fa',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e0e0e0',
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
  body: { fontSize: 16, fontWeight: 'normal' },
  caption: { fontSize: 14, fontWeight: 'normal' },
};

const { width } = Dimensions.get('window');

const CoachUpdates = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user, coaches, updates } = useSelector(state => ({
    user: state.auth.user,
    coaches: state.coaches.coaches,
    updates: state.updates.coachUpdates,
  }));

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [filteredUpdates, setFilteredUpdates] = useState([]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Mock data for demonstration
  const mockUpdates = [
    {
      id: '1',
      coachId: 'coach1',
      coachName: 'Coach Sarah Wilson',
      coachAvatar: 'https://via.placeholder.com/50',
      type: 'training_plan',
      title: 'New Training Plan Assigned! 🏃‍♂️',
      message: 'Your 4-week strength building program is ready. Let\'s crush those goals together!',
      timestamp: '2024-08-24T09:30:00Z',
      isRead: false,
      priority: 'high',
      actionRequired: true,
      sport: 'Football',
      tags: ['strength', 'endurance'],
    },
    {
      id: '2',
      coachId: 'coach1',
      coachName: 'Coach Sarah Wilson',
      coachAvatar: 'https://via.placeholder.com/50',
      type: 'feedback',
      title: 'Great Progress! 👏',
      message: 'Your sprint times have improved by 0.3 seconds this week. Keep up the excellent work!',
      timestamp: '2024-08-23T16:45:00Z',
      isRead: true,
      priority: 'medium',
      actionRequired: false,
      sport: 'Football',
      tags: ['performance', 'improvement'],
    },
    {
      id: '3',
      coachId: 'coach2',
      coachName: 'Coach Mike Johnson',
      coachAvatar: 'https://via.placeholder.com/50',
      type: 'schedule_change',
      title: 'Schedule Update ⏰',
      message: 'Tomorrow\'s session moved from 3PM to 4PM due to field availability. See you there!',
      timestamp: '2024-08-23T14:20:00Z',
      isRead: false,
      priority: 'high',
      actionRequired: true,
      sport: 'Basketball',
      tags: ['schedule', 'important'],
    },
    {
      id: '4',
      coachId: 'coach1',
      coachName: 'Coach Sarah Wilson',
      coachAvatar: 'https://via.placeholder.com/50',
      type: 'motivation',
      title: 'Motivation Monday! 💪',
      message: 'Remember: Champions are made in practice. Every rep, every drill brings you closer to your goals!',
      timestamp: '2024-08-22T08:00:00Z',
      isRead: true,
      priority: 'low',
      actionRequired: false,
      sport: 'Football',
      tags: ['motivation', 'mindset'],
    },
    {
      id: '5',
      coachId: 'coach2',
      coachName: 'Coach Mike Johnson',
      coachAvatar: 'https://via.placeholder.com/50',
      type: 'achievement',
      title: 'New Achievement Unlocked! 🏆',
      message: 'Congratulations on completing 50 training sessions! You\'ve earned the "Dedicated Athlete" badge.',
      timestamp: '2024-08-21T19:15:00Z',
      isRead: false,
      priority: 'medium',
      actionRequired: false,
      sport: 'Basketball',
      tags: ['achievement', 'milestone'],
    },
  ];

  const filterOptions = [
    { key: 'all', label: 'All Updates', icon: 'list' },
    { key: 'unread', label: 'Unread', icon: 'circle' },
    { key: 'training_plan', label: 'Training Plans', icon: 'fitness-center' },
    { key: 'feedback', label: 'Feedback', icon: 'comment' },
    { key: 'schedule_change', label: 'Schedule', icon: 'schedule' },
    { key: 'achievement', label: 'Achievements', icon: 'jump-rope' },
  ];

  useEffect(() => {
    StatusBar.setBarStyle('light-content', true);
    StatusBar.setTranslucent(true);
    StatusBar.setBackgroundColor('transparent', true);

    // Initialize animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Simulate loading
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  useEffect(() => {
    filterUpdates();
  }, [searchQuery, selectedFilter]);

  const filterUpdates = useCallback(() => {
    let filtered = mockUpdates;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(update =>
        update.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        update.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        update.coachName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by selected filter
    if (selectedFilter !== 'all') {
      if (selectedFilter === 'unread') {
        filtered = filtered.filter(update => !update.isRead);
      } else {
        filtered = filtered.filter(update => update.type === selectedFilter);
      }
    }

    setFilteredUpdates(filtered);
  }, [searchQuery, selectedFilter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('Updates Refreshed', 'Latest updates from your coaches have been loaded!');
    }, 1500);
  }, []);

  const handleUpdatePress = useCallback((update) => {
    // Mark as read and navigate to detail
    Alert.alert(
      'Feature Coming Soon',
      'Update details and actions will be available in the next version!',
      [{ text: 'OK', style: 'default' }]
    );
  }, []);

  const handleCoachPress = useCallback((coachId, coachName) => {
    Alert.alert(
      'Feature Coming Soon',
      `Coach profile and chat with ${coachName} will be available soon!`,
      [{ text: 'OK', style: 'default' }]
    );
  }, []);

  const getUpdateIcon = (type) => {
    const icons = {
      training_plan: 'fitness-center',
      feedback: 'comment',
      schedule_change: 'schedule',
      motivation: 'favorite',
      achievement: 'jump-rope',
    };
    return icons[type] || 'notifications';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: COLORS.error,
      medium: COLORS.warning,
      low: COLORS.success,
    };
    return colors[priority] || COLORS.primary;
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const updateTime = new Date(timestamp);
    const diffInHours = Math.floor((now - updateTime) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const renderUpdateCard = ({ item, index }) => (
    <Animated.View
      style={[
        styles.updateCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Card
        style={[
          styles.card,
          !item.isRead && styles.unreadCard
        ]}
        onPress={() => handleUpdatePress(item)}
      >
        <View style={styles.cardHeader}>
          <TouchableOpacity
            style={styles.coachInfo}
            onPress={() => handleCoachPress(item.coachId, item.coachName)}
          >
            <Avatar.Image
              size={40}
              source={{ uri: item.coachAvatar }}
              style={styles.coachAvatar}
            />
            <View style={styles.coachDetails}>
              <Text style={styles.coachName}>{item.coachName}</Text>
              <Text style={styles.updateTime}>{formatTimeAgo(item.timestamp)}</Text>
            </View>
          </TouchableOpacity>
          
          <View style={styles.cardActions}>
            {!item.isRead && (
              <Badge size={8} style={styles.unreadBadge} />
            )}
            <IconButton
              icon="dots-vertical"
              size={20}
              onPress={() => Alert.alert('Feature Coming Soon', 'Update options will be available soon!')}
            />
          </View>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.updateHeader}>
            <Icon
              name={getUpdateIcon(item.type)}
              size={24}
              color={getPriorityColor(item.priority)}
              style={styles.updateIcon}
            />
            <Text style={styles.updateTitle}>{item.title}</Text>
          </View>
          
          <Text style={styles.updateMessage}>{item.message}</Text>
          
          <View style={styles.updateFooter}>
            <View style={styles.updateTags}>
              {item.tags.map((tag, tagIndex) => (
                <Chip
                  key={tagIndex}
                  mode="outlined"
                  compact
                  style={styles.updateTag}
                  textStyle={styles.tagText}
                >
                  {tag}
                </Chip>
              ))}
            </View>
            
            {item.actionRequired && (
              <Button
                mode="contained"
                compact
                style={styles.actionButton}
                labelStyle={styles.actionButtonText}
                onPress={() => handleUpdatePress(item)}
              >
                View Details
              </Button>
            )}
          </View>
        </View>
      </Card>
    </Animated.View>
  );

  const renderFilterChip = ({ item }) => (
    <Chip
      mode={selectedFilter === item.key ? 'flat' : 'outlined'}
      selected={selectedFilter === item.key}
      onPress={() => setSelectedFilter(item.key)}
      style={[
        styles.filterChip,
        selectedFilter === item.key && styles.selectedFilterChip
      ]}
      textStyle={[
        styles.filterChipText,
        selectedFilter === item.key && styles.selectedFilterChipText
      ]}
      icon={item.icon}
    >
      {item.label}
    </Chip>
  );

  const unreadCount = mockUpdates.filter(update => !update.isRead).length;

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <IconButton
              icon="arrow-back"
              iconColor="#fff"
              size={24}
              onPress={() => navigation.goBack()}
            />
            <View style={styles.headerTitle}>
              <Text style={styles.headerTitleText}>Coach Updates</Text>
              {unreadCount > 0 && (
                <Badge
                  size={20}
                  style={styles.headerBadge}
                >
                  {unreadCount}
                </Badge>
              )}
            </View>
            <IconButton
              icon="filter-list"
              iconColor="#fff"
              size={24}
              onPress={() => Alert.alert('Feature Coming Soon', 'Advanced filtering options will be available soon!')}
            />
          </View>

          <Searchbar
            placeholder="Search updates..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
            iconColor={COLORS.primary}
          />
        </View>
      </LinearGradient>

      {/* Filter Chips */}
      <View style={styles.filtersContainer}>
        <FlatList
          data={filterOptions}
          renderItem={renderFilterChip}
          keyExtractor={item => item.key}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        />
      </View>

      {/* Updates List */}
      <FlatList
        data={filteredUpdates}
        renderItem={renderUpdateCard}
        keyExtractor={item => item.id}
        style={styles.updatesList}
        contentContainerStyle={styles.updatesContent}
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
            <Icon name="notifications-none" size={80} color={COLORS.border} />
            <Text style={styles.emptyStateTitle}>No Updates Yet</Text>
            <Text style={styles.emptyStateMessage}>
              Your coach updates will appear here when available
            </Text>
          </View>
        }
      />

      {/* Floating Action Button */}
      <FAB
        icon="message"
        style={styles.fab}
        onPress={() => Alert.alert('Feature Coming Soon', 'Direct messaging with coaches will be available soon!')}
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
    paddingTop: StatusBar.currentHeight + SPACING.md,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    gap: SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerTitleText: {
    ...TEXT_STYLES.h2,
    color: '#fff',
  },
  headerBadge: {
    backgroundColor: COLORS.error,
  },
  searchBar: {
    backgroundColor: '#fff',
    borderRadius: 25,
    elevation: 2,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  filtersContainer: {
    backgroundColor: '#fff',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filtersContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  filterChip: {
    backgroundColor: '#fff',
    borderColor: COLORS.border,
  },
  selectedFilterChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  selectedFilterChipText: {
    color: '#fff',
  },
  updatesList: {
    flex: 1,
  },
  updatesContent: {
    padding: SPACING.md,
    gap: SPACING.md,
  },
  updateCard: {
    marginBottom: SPACING.sm,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    overflow: 'hidden',
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  coachInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  coachAvatar: {
    marginRight: SPACING.sm,
  },
  coachDetails: {
    flex: 1,
  },
  coachName: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.text,
  },
  updateTime: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    marginRight: SPACING.sm,
  },
  cardContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  updateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  updateIcon: {
    marginRight: SPACING.sm,
  },
  updateTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  updateMessage: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  updateFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  updateTags: {
    flexDirection: 'row',
    flex: 1,
    gap: SPACING.xs,
  },
  updateTag: {
    height: 24,
    backgroundColor: 'transparent',
    borderColor: COLORS.border,
  },
  tagText: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#fff',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyStateTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptyStateMessage: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: COLORS.primary,
  },
});

export default CoachUpdates;