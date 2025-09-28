import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
  Animated,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import {
  Card,
  Text,
  Button,
  Chip,
  Avatar,
  IconButton,
  FAB,
  Searchbar,
  ProgressBar,
  Surface,
  Portal,
  Modal,
  Divider,
  Badge,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import LinearGradient from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';

const { width: screenWidth } = Dimensions.get('window');

// Import your design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#FF5722',
  warning: '#FF9800',
  background: '#f8f9fa',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e0e0e0',
  accent: '#E91E63',
  info: '#2196F3',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

const TEXT_STYLES = {
  title: {
    fontSize: 24,
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
    color: COLORS.textSecondary,
  },
};

const LocalEvents = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  
  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);
  const scaleAnim = new Animated.Value(0.8);
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [events, setEvents] = useState([]);
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('upcoming');

  // Mock data for events
  const mockEvents = [
    {
      id: 1,
      title: '5K Fun Run Challenge',
      type: 'Running',
      date: '2025-09-15',
      time: '07:00 AM',
      location: 'Central Park',
      distance: '1.2 km',
      participants: 156,
      maxParticipants: 200,
      price: 'Free',
      organizer: 'RunClub Kenya',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
      difficulty: 'Beginner',
      tags: ['Running', 'Community', 'Fun'],
      description: 'Join us for a fun 5K run through Central Park. Perfect for beginners!',
      rewards: ['Medal', 'T-shirt', 'Refreshments'],
      isPopular: true,
      attendanceStreak: 0,
    },
    {
      id: 2,
      title: 'Yoga in the Park',
      type: 'Yoga',
      date: '2025-09-12',
      time: '06:30 AM',
      location: 'Uhuru Park',
      distance: '0.8 km',
      participants: 45,
      maxParticipants: 50,
      price: 'KSH 500',
      organizer: 'Zen Wellness',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
      difficulty: 'All Levels',
      tags: ['Yoga', 'Mindfulness', 'Outdoor'],
      description: 'Start your day with peaceful yoga practice in nature.',
      rewards: ['Mat Rental', 'Healthy Snacks'],
      isPopular: false,
      attendanceStreak: 3,
    },
    {
      id: 3,
      title: 'CrossFit Competition',
      type: 'CrossFit',
      date: '2025-09-20',
      time: '02:00 PM',
      location: 'Elite Fitness Center',
      distance: '2.5 km',
      participants: 89,
      maxParticipants: 100,
      price: 'KSH 2000',
      organizer: 'Elite CrossFit',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
      difficulty: 'Advanced',
      tags: ['CrossFit', 'Competition', 'Strength'],
      description: 'Test your fitness in this exciting CrossFit competition.',
      rewards: ['Prizes', 'Certificates', 'Medals'],
      isPopular: true,
      attendanceStreak: 0,
    },
    {
      id: 4,
      title: 'Basketball Tournament',
      type: 'Basketball',
      date: '2025-09-18',
      time: '04:00 PM',
      location: 'Nyayo Stadium',
      distance: '3.1 km',
      participants: 128,
      maxParticipants: 160,
      price: 'KSH 1000',
      organizer: 'Kenya Basketball Federation',
      image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400',
      difficulty: 'Intermediate',
      tags: ['Basketball', 'Team Sport', 'Tournament'],
      description: '3v3 basketball tournament for amateur players.',
      rewards: ['Trophy', 'Cash Prizes', 'Jerseys'],
      isPopular: false,
      attendanceStreak: 1,
    },
    {
      id: 5,
      title: 'Swimming Workshop',
      type: 'Swimming',
      date: '2025-09-14',
      time: '10:00 AM',
      location: 'Aquatic Center',
      distance: '1.8 km',
      participants: 24,
      maxParticipants: 30,
      price: 'KSH 1500',
      organizer: 'SwimTech Academy',
      image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400',
      difficulty: 'Beginner',
      tags: ['Swimming', 'Workshop', 'Technique'],
      description: 'Learn proper swimming techniques from certified instructors.',
      rewards: ['Certificate', 'Swimming Cap', 'Goggles'],
      isPopular: false,
      attendanceStreak: 0,
    },
  ];

  const filterOptions = [
    { id: 'running', label: 'Running', icon: 'directions-run', color: COLORS.success },
    { id: 'yoga', label: 'Yoga', icon: 'self-improvement', color: COLORS.accent },
    { id: 'crossfit', label: 'CrossFit', icon: 'fitness-center', color: COLORS.error },
    { id: 'basketball', label: 'Basketball', icon: 'sports-basketball', color: COLORS.warning },
    { id: 'swimming', label: 'Swimming', icon: 'pool', color: COLORS.info },
    { id: 'cycling', label: 'Cycling', icon: 'directions-bike', color: COLORS.primary },
    { id: 'competition', label: 'Competitions', icon: 'jump-rope', color: COLORS.secondary },
    { id: 'free', label: 'Free Events', icon: 'money-off', color: COLORS.success },
  ];

  const tabs = [
    { id: 'upcoming', label: 'Upcoming', icon: 'schedule' },
    { id: 'today', label: 'Today', icon: 'today' },
    { id: 'weekend', label: 'Weekend', icon: 'weekend' },
    { id: 'joined', label: 'Joined', icon: 'check-circle' },
  ];

  useEffect(() => {
    loadEvents();
    
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setEvents(mockEvents);
        setFeaturedEvents(mockEvents.filter(event => event.isPopular));
        setLoading(false);
      }, 1500);
    } catch (error) {
      Alert.alert('Error', 'Failed to load events. Please try again.');
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  }, [loadEvents]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    // Implement search logic here
  };

  const handleFilterToggle = (filterId) => {
    setSelectedFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  const handleEventPress = (event) => {
    navigation.navigate('EventDetails', { eventId: event.id });
  };

  const handleJoinEvent = (event) => {
    Alert.alert(
      '🎉 Feature in Development',
      `Joining "${event.title}" will be available soon! This feature is currently being developed to provide seamless event registration and payment processing.`,
      [{ text: 'Exciting! 🚀', style: 'default' }]
    );
  };

  const handleShareEvent = (event) => {
    Alert.alert(
      '📱 Feature in Development',
      `Sharing "${event.title}" with friends is coming soon! You'll be able to share events directly through social media and messaging apps.`,
      [{ text: 'Can\'t Wait! 💫', style: 'default' }]
    );
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return COLORS.success;
      case 'intermediate': return COLORS.warning;
      case 'advanced': return COLORS.error;
      default: return COLORS.primary;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getParticipationPercentage = (participants, maxParticipants) => {
    return (participants / maxParticipants) * 100;
  };

  const renderEventCard = ({ item: event, index }) => (
    <Animated.View
      style={[
        styles.eventCard,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 50],
                outputRange: [0, 50],
              })
            },
            { scale: scaleAnim }
          ]
        }
      ]}
    >
      <Card style={styles.card} elevation={4}>
        <TouchableOpacity onPress={() => handleEventPress(event)}>
          {/* Event Image Header */}
          <View style={styles.imageContainer}>
            <Surface style={styles.eventImage}>
              <LinearGradient
                colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
                style={styles.imageOverlay}
              />
              <View style={styles.imageContent}>
                <View style={styles.eventBadges}>
                  {event.isPopular && (
                    <Chip size="small" style={styles.popularBadge} textStyle={styles.badgeText}>
                      🔥 Popular
                    </Chip>
                  )}
                  {event.attendanceStreak > 0 && (
                    <Chip size="small" style={styles.streakBadge} textStyle={styles.badgeText}>
                      🎯 {event.attendanceStreak}x Streak
                    </Chip>
                  )}
                </View>
                <View style={styles.eventTypeContainer}>
                  <Chip 
                    size="small" 
                    style={[styles.typeChip, { backgroundColor: getDifficultyColor(event.difficulty) }]}
                    textStyle={styles.badgeText}
                  >
                    {event.type}
                  </Chip>
                </View>
              </View>
            </Surface>
          </View>

          <Card.Content style={styles.cardContent}>
            {/* Event Header */}
            <View style={styles.eventHeader}>
              <View style={styles.eventTitleContainer}>
                <Text style={[TEXT_STYLES.subtitle, styles.eventTitle]} numberOfLines={2}>
                  {event.title}
                </Text>
                <Text style={[TEXT_STYLES.caption, styles.organizer]}>
                  by {event.organizer}
                </Text>
              </View>
              <View style={styles.priceContainer}>
                <Text style={styles.price}>{event.price}</Text>
              </View>
            </View>

            {/* Event Details */}
            <View style={styles.eventDetails}>
              <View style={styles.detailRow}>
                <Icon name="schedule" size={16} color={COLORS.primary} />
                <Text style={styles.detailText}>
                  {formatDate(event.date)} • {event.time}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Icon name="location-on" size={16} color={COLORS.accent} />
                <Text style={styles.detailText}>
                  {event.location} • {event.distance}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Icon name="group" size={16} color={COLORS.success} />
                <Text style={styles.detailText}>
                  {event.participants}/{event.maxParticipants} joined
                </Text>
              </View>
            </View>

            {/* Participation Progress */}
            <View style={styles.progressContainer}>
              <ProgressBar
                progress={getParticipationPercentage(event.participants, event.maxParticipants) / 100}
                color={COLORS.success}
                style={styles.progressBar}
              />
              <Text style={styles.progressText}>
                {Math.round(getParticipationPercentage(event.participants, event.maxParticipants))}% filled
              </Text>
            </View>

            {/* Tags */}
            <View style={styles.tagsContainer}>
              {event.tags.map((tag, tagIndex) => (
                <Chip
                  key={tagIndex}
                  size="small"
                  style={styles.tag}
                  textStyle={styles.tagText}
                >
                  {tag}
                </Chip>
              ))}
              <Chip 
                size="small" 
                style={[styles.difficultyTag, { backgroundColor: getDifficultyColor(event.difficulty) }]}
                textStyle={styles.badgeText}
              >
                {event.difficulty}
              </Chip>
            </View>

            {/* Description */}
            <Text style={[TEXT_STYLES.body, styles.description]} numberOfLines={2}>
              {event.description}
            </Text>

            {/* Rewards */}
            <View style={styles.rewardsContainer}>
              <Text style={styles.rewardsTitle}>🏆 What you'll get:</Text>
              <Text style={styles.rewardsText}>
                {event.rewards.join(' • ')}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <Button
                mode="contained"
                style={[styles.actionButton, styles.joinButton]}
                onPress={() => handleJoinEvent(event)}
                icon="add-circle"
                labelStyle={styles.buttonText}
              >
                Join Event
              </Button>
              <IconButton
                icon="share"
                size={24}
                onPress={() => handleShareEvent(event)}
                style={styles.shareButton}
              />
            </View>
          </Card.Content>
        </TouchableOpacity>
      </Card>
    </Animated.View>
  );

  const renderFeaturedEvent = ({ item: event }) => (
    <TouchableOpacity onPress={() => handleEventPress(event)}>
      <Surface style={styles.featuredCard} elevation={3}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.featuredGradient}
        >
          <View style={styles.featuredHeader}>
            <Chip size="small" style={styles.featuredBadge} textStyle={styles.badgeText}>
              🔥 Featured
            </Chip>
            <Text style={styles.featuredPrice}>{event.price}</Text>
          </View>
          <Text style={styles.featuredTitle} numberOfLines={2}>
            {event.title}
          </Text>
          <Text style={styles.featuredDate}>
            {formatDate(event.date)} • {event.time}
          </Text>
          <View style={styles.featuredFooter}>
            <View style={styles.featuredParticipants}>
              <Icon name="group" size={14} color="#fff" />
              <Text style={styles.featuredParticipantsText}>
                {event.participants} joined
              </Text>
            </View>
            <Text style={styles.featuredLocation}>{event.location}</Text>
          </View>
        </LinearGradient>
      </Surface>
    </TouchableOpacity>
  );

  const renderFilterChip = (filter) => (
    <Chip
      key={filter.id}
      selected={selectedFilters.includes(filter.id)}
      onPress={() => handleFilterToggle(filter.id)}
      style={[
        styles.filterChip,
        selectedFilters.includes(filter.id) && { backgroundColor: filter.color }
      ]}
      textStyle={[
        styles.filterChipText,
        selectedFilters.includes(filter.id) && styles.selectedFilterChipText
      ]}
      icon={filter.icon}
    >
      {filter.label}
    </Chip>
  );

  const renderTab = (tab) => (
    <TouchableOpacity
      key={tab.id}
      style={[
        styles.tabItem,
        activeTab === tab.id && styles.activeTabItem
      ]}
      onPress={() => setActiveTab(tab.id)}
    >
      <Icon 
        name={tab.icon} 
        size={20} 
        color={activeTab === tab.id ? COLORS.primary : COLORS.textSecondary} 
      />
      <Text style={[
        styles.tabText,
        activeTab === tab.id && styles.activeTabText
      ]}>
        {tab.label}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" translucent backgroundColor="transparent" />
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.loadingGradient}
        >
          <Icon name="event" size={60} color="#fff" style={styles.loadingIcon} />
          <Text style={styles.loadingText}>Discovering amazing events for you... 🎯</Text>
          <ProgressBar
            indeterminate
            color="#fff"
            style={styles.loadingProgress}
          />
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      
      {/* Header with Gradient */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Local Events 🏃‍♀️</Text>
        <Text style={styles.headerSubtitle}>
          Join exciting fitness events near you
        </Text>
        
        <Searchbar
          placeholder="Search events, sports, locations..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          icon="search"
          clearIcon="close"
        />

        {/* Event Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}
        >
          {tabs.map(renderTab)}
        </ScrollView>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Quick Filters */}
        <View style={styles.filtersSection}>
          <View style={styles.filtersHeader}>
            <Text style={[TEXT_STYLES.subtitle, styles.sectionTitle]}>
              Event Types ⚡
            </Text>
            <IconButton
              icon="tune"
              size={24}
              onPress={() => setShowFilters(true)}
              style={styles.filterButton}
            />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersContainer}
          >
            {filterOptions.map(renderFilterChip)}
          </ScrollView>
        </View>

        {/* Featured Events */}
        <View style={styles.featuredSection}>
          <Text style={[TEXT_STYLES.subtitle, styles.sectionTitle]}>
            🌟 Featured Events
          </Text>
          <FlatList
            data={featuredEvents}
            renderItem={renderFeaturedEvent}
            keyExtractor={(item) => `featured-${item.id}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.featuredList}
          />
        </View>

        {/* All Events */}
        <View style={styles.eventsSection}>
          <View style={styles.eventsHeader}>
            <Text style={[TEXT_STYLES.subtitle, styles.sectionTitle]}>
              All Events ({events.length})
            </Text>
            <View style={styles.sortContainer}>
              <Chip size="small" style={styles.sortChip}>
                📅 Date
              </Chip>
            </View>
          </View>
          
          <FlatList
            data={events}
            renderItem={renderEventCard}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => {
          Alert.alert(
            '📅 Feature in Development',
            'Creating your own events is coming soon! You\'ll be able to organize and host fitness events for your community.',
            [{ text: 'Amazing! 🎉', style: 'default' }]
          );
        }}
        label="Create Event"
      />

      {/* Filter Modal */}
      <Portal>
        <Modal
          visible={showFilters}
          onDismiss={() => setShowFilters(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView intensity={20} style={styles.blurContainer}>
            <Surface style={styles.modalContent} elevation={4}>
              <Text style={[TEXT_STYLES.title, styles.modalTitle]}>
                Filter Events 🎯
              </Text>
              
              <Divider style={styles.modalDivider} />
              
              <Text style={[TEXT_STYLES.subtitle, styles.filterSectionTitle]}>
                Event Types
              </Text>
              
              <View style={styles.modalFilters}>
                {filterOptions.map(renderFilterChip)}
              </View>
              
              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={() => {
                    setSelectedFilters([]);
                    setShowFilters(false);
                  }}
                  style={styles.modalButton}
                >
                  Clear All
                </Button>
                <Button
                  mode="contained"
                  onPress={() => setShowFilters(false)}
                  style={styles.modalButton}
                >
                  Apply Filters
                </Button>
              </View>
            </Surface>
          </BlurView>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  loadingIcon: {
    marginBottom: SPACING.lg,
  },
  loadingText: {
    ...TEXT_STYLES.subtitle,
    color: '#fff',
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  loadingProgress: {
    width: '60%',
    height: 4,
  },
  header: {
    paddingTop: SPACING.xxl + SPACING.lg,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  headerTitle: {
    ...TEXT_STYLES.title,
    color: '#fff',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: '#fff',
    opacity: 0.9,
    marginBottom: SPACING.lg,
  },
  searchBar: {
    backgroundColor: '#fff',
    elevation: 2,
    marginBottom: SPACING.md,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  tabsContainer: {
    marginBottom: SPACING.sm,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  activeTabItem: {
    backgroundColor: '#fff',
  },
  tabText: {
    ...TEXT_STYLES.caption,
    color: '#fff',
    marginLeft: SPACING.xs,
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  filtersSection: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  filtersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    marginBottom: SPACING.sm,
  },
  filterButton: {
    margin: 0,
  },
  filtersContainer: {
    marginBottom: SPACING.sm,
  },
  filterChip: {
    marginRight: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  filterChipText: {
    color: COLORS.text,
  },
  selectedFilterChipText: {
    color: '#fff',
  },
  featuredSection: {
    marginBottom: SPACING.lg,
  },
  featuredList: {
    marginBottom: SPACING.sm,
  },
  featuredCard: {
    width: screenWidth * 0.75,
    height: 160,
    marginRight: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
  },
  featuredGradient: {
    flex: 1,
    padding: SPACING.md,
    justifyContent: 'space-between',
  },
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  featuredPrice: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  featuredTitle: {
    ...TEXT_STYLES.subtitle,
    color: '#fff',
    fontSize: 18,
    marginVertical: SPACING.xs,
  },
  featuredDate: {
    color: '#fff',
    opacity: 0.9,
    fontSize: 14,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredParticipants: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredParticipantsText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: SPACING.xs,
  },
  featuredLocation: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.8,
  },
  eventsSection: {
    marginBottom: SPACING.xxl,
  },
  eventsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortChip: {
    backgroundColor: COLORS.primary,
  },
  eventCard: {
    marginBottom: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 120,
    position: 'relative',
  },
  eventImage: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  imageContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
    padding: SPACING.md,
    justifyContent: 'space-between',
  },
  eventBadges: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
  },
  popularBadge: {
    backgroundColor: COLORS.accent,
    marginRight: SPACING.sm,
  },
  streakBadge: {
    backgroundColor: COLORS.success,
  },
  eventTypeContainer: {
    alignSelf: 'flex-end',
  },
  typeChip: {
    backgroundColor: COLORS.primary,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardContent: {
    padding: SPACING.md,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  eventTitleContainer: {
    flex: 1,
    marginRight: SPACING.md,
  },
  eventTitle: {
    marginBottom: SPACING.xs,
    lineHeight: 22,
  },
  organizer: {
    fontStyle: 'italic',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  eventDetails: {
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  detailText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  progressContainer: {
    marginBottom: SPACING.md,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.border,
    marginBottom: SPACING.xs,
  },
  progressText: {
    ...TEXT_STYLES.caption,
    fontSize: 12,
    textAlign: 'right',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  tag: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
    backgroundColor: COLORS.background,
  },
  tagText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  difficultyTag: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  description: {
    marginBottom: SPACING.md,
    lineHeight: 22,
    color: COLORS.textSecondary,
  },
  rewardsContainer: {
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  rewardsTitle: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  rewardsText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  joinButton: {
    backgroundColor: COLORS.primary,
  },
  shareButton: {
    backgroundColor: COLORS.background,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.lg,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  modalDivider: {
    marginBottom: SPACING.md,
  },
  filterSectionTitle: {
    marginBottom: SPACING.md,
  },
  modalFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.lg,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
});

export default LocalEvents;