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
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import LinearGradient from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';

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

const FindTrainers = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  
  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [trainers, setTrainers] = useState([]);
  const [featuredTrainers, setFeaturedTrainers] = useState([]);

  // Mock data for trainers
  const mockTrainers = [
    {
      id: 1,
      name: 'Sarah Johnson',
      specialization: 'Personal Training',
      rating: 4.9,
      reviews: 127,
      location: 'Downtown Fitness Center',
      distance: '0.8 km',
      price: '$75/session',
      avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
      badges: ['Certified', 'Top Rated', 'Nutrition Expert'],
      experience: '8 years',
      description: 'Specialized in weight loss and strength training with proven results.',
      availableSlots: 12,
      responseTime: '< 1 hour',
    },
    {
      id: 2,
      name: 'Mike Rodriguez',
      specialization: 'Crossfit Training',
      rating: 4.8,
      reviews: 89,
      location: 'Elite CrossFit Box',
      distance: '1.2 km',
      price: '$85/session',
      avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
      badges: ['CrossFit L2', 'Competition Coach'],
      experience: '6 years',
      description: 'Former competitive athlete specializing in functional fitness.',
      availableSlots: 8,
      responseTime: '< 2 hours',
    },
    {
      id: 3,
      name: 'Emma Chen',
      specialization: 'Yoga & Pilates',
      rating: 4.9,
      reviews: 156,
      location: 'Zen Wellness Studio',
      distance: '2.1 km',
      price: '$60/session',
      avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
      badges: ['RYT-500', 'Mindfulness Coach'],
      experience: '10 years',
      description: 'Holistic approach to fitness focusing on mind-body connection.',
      availableSlots: 15,
      responseTime: '< 30 mins',
    },
  ];

  const filterOptions = [
    { id: 'personal', label: 'Personal Training', icon: 'person' },
    { id: 'group', label: 'Group Classes', icon: 'group' },
    { id: 'online', label: 'Online Sessions', icon: 'videocam' },
    { id: 'nutrition', label: 'Nutrition', icon: 'restaurant' },
    { id: 'rehabilitation', label: 'Rehabilitation', icon: 'healing' },
    { id: 'sports', label: 'Sports Specific', icon: 'sports-soccer' },
  ];

  useEffect(() => {
    loadTrainers();
    
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
    ]).start();
  }, []);

  const loadTrainers = useCallback(async () => {
    try {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setTrainers(mockTrainers);
        setFeaturedTrainers(mockTrainers.slice(0, 2));
        setLoading(false);
      }, 1500);
    } catch (error) {
      Alert.alert('Error', 'Failed to load trainers. Please try again.');
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTrainers();
    setRefreshing(false);
  }, [loadTrainers]);

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

  const handleTrainerPress = (trainer) => {
    navigation.navigate('TrainerProfile', { trainerId: trainer.id });
  };

  const handleBookSession = (trainer) => {
    Alert.alert(
      '🚀 Feature in Development',
      `Booking session with ${trainer.name} will be available soon! This feature is currently being developed to provide you with seamless trainer booking experience.`,
      [{ text: 'Got it! 👍', style: 'default' }]
    );
  };

  const handleMessageTrainer = (trainer) => {
    Alert.alert(
      '💬 Feature in Development',
      `Direct messaging with ${trainer.name} is coming soon! You'll be able to chat with trainers directly through the app.`,
      [{ text: 'Awesome! 🎉', style: 'default' }]
    );
  };

  const renderTrainerCard = ({ item: trainer, index }) => (
    <Animated.View
      style={[
        styles.trainerCard,
        {
          opacity: fadeAnim,
          transform: [{
            translateY: slideAnim.interpolate({
              inputRange: [0, 50],
              outputRange: [0, 50],
            })
          }]
        }
      ]}
    >
      <Card style={styles.card} elevation={3}>
        <TouchableOpacity onPress={() => handleTrainerPress(trainer)}>
          <Card.Content style={styles.cardContent}>
            {/* Header with Avatar and Basic Info */}
            <View style={styles.trainerHeader}>
              <Avatar.Image
                size={60}
                source={{ uri: trainer.avatar }}
                style={styles.avatar}
              />
              <View style={styles.trainerInfo}>
                <Text style={[TEXT_STYLES.subtitle, styles.trainerName]}>
                  {trainer.name}
                </Text>
                <Text style={[TEXT_STYLES.caption, styles.specialization]}>
                  {trainer.specialization}
                </Text>
                <View style={styles.ratingContainer}>
                  <Icon name="star" size={16} color={COLORS.warning} />
                  <Text style={styles.rating}>{trainer.rating}</Text>
                  <Text style={styles.reviews}>({trainer.reviews} reviews)</Text>
                </View>
              </View>
              <View style={styles.priceContainer}>
                <Text style={styles.price}>{trainer.price}</Text>
                <Chip size="small" style={styles.distanceChip}>
                  {trainer.distance}
                </Chip>
              </View>
            </View>

            {/* Badges */}
            <View style={styles.badgesContainer}>
              {trainer.badges.map((badge, badgeIndex) => (
                <Chip
                  key={badgeIndex}
                  size="small"
                  style={styles.badge}
                  textStyle={styles.badgeText}
                >
                  {badge}
                </Chip>
              ))}
            </View>

            {/* Description */}
            <Text style={[TEXT_STYLES.body, styles.description]} numberOfLines={2}>
              {trainer.description}
            </Text>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Icon name="schedule" size={16} color={COLORS.primary} />
                <Text style={styles.statText}>{trainer.experience}</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="event-available" size={16} color={COLORS.success} />
                <Text style={styles.statText}>{trainer.availableSlots} slots</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="reply" size={16} color={COLORS.secondary} />
                <Text style={styles.statText}>{trainer.responseTime}</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <Button
                mode="contained"
                style={[styles.actionButton, styles.bookButton]}
                onPress={() => handleBookSession(trainer)}
                icon="calendar-plus"
                labelStyle={styles.buttonText}
              >
                Book Session
              </Button>
              <Button
                mode="outlined"
                style={[styles.actionButton, styles.messageButton]}
                onPress={() => handleMessageTrainer(trainer)}
                icon="message"
                labelStyle={styles.buttonText}
              >
                Message
              </Button>
            </View>
          </Card.Content>
        </TouchableOpacity>
      </Card>
    </Animated.View>
  );

  const renderFeaturedTrainer = ({ item: trainer }) => (
    <TouchableOpacity onPress={() => handleTrainerPress(trainer)}>
      <Surface style={styles.featuredCard} elevation={2}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.featuredGradient}
        >
          <Avatar.Image
            size={50}
            source={{ uri: trainer.avatar }}
            style={styles.featuredAvatar}
          />
          <View style={styles.featuredInfo}>
            <Text style={styles.featuredName}>{trainer.name}</Text>
            <Text style={styles.featuredSpecialization}>{trainer.specialization}</Text>
            <View style={styles.featuredRating}>
              <Icon name="star" size={14} color="#fff" />
              <Text style={styles.featuredRatingText}>{trainer.rating}</Text>
            </View>
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
        selectedFilters.includes(filter.id) && styles.selectedFilterChip
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" translucent backgroundColor="transparent" />
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.loadingGradient}
        >
          <Icon name="search" size={60} color="#fff" style={styles.loadingIcon} />
          <Text style={styles.loadingText}>Finding amazing trainers for you... 🏋️‍♀️</Text>
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
        <Text style={styles.headerTitle}>Find Your Perfect Trainer 💪</Text>
        <Text style={styles.headerSubtitle}>
          Discover certified trainers near you
        </Text>
        
        <Searchbar
          placeholder="Search trainers, specializations..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          icon="search"
          clearIcon="close"
        />
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
              Quick Filters ⚡
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

        {/* Featured Trainers */}
        <View style={styles.featuredSection}>
          <Text style={[TEXT_STYLES.subtitle, styles.sectionTitle]}>
            ⭐ Featured Trainers
          </Text>
          <FlatList
            data={featuredTrainers}
            renderItem={renderFeaturedTrainer}
            keyExtractor={(item) => `featured-${item.id}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.featuredList}
          />
        </View>

        {/* All Trainers */}
        <View style={styles.trainersSection}>
          <View style={styles.trainersHeader}>
            <Text style={[TEXT_STYLES.subtitle, styles.sectionTitle]}>
              All Trainers ({trainers.length})
            </Text>
            <Chip size="small" style={styles.resultsChip}>
              Near you
            </Chip>
          </View>
          
          <FlatList
            data={trainers}
            renderItem={renderTrainerCard}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="filter-list"
        style={styles.fab}
        onPress={() => setShowFilters(true)}
        label="Filters"
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
                Filter Trainers 🎯
              </Text>
              
              <Divider style={styles.modalDivider} />
              
              <Text style={[TEXT_STYLES.subtitle, styles.filterSectionTitle]}>
                Specializations
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
    paddingBottom: SPACING.lg,
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
  },
  searchInput: {
    ...TEXT_STYLES.body,
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
  selectedFilterChip: {
    backgroundColor: COLORS.primary,
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
    width: 200,
    height: 120,
    marginRight: SPACING.md,
    borderRadius: 12,
    overflow: 'hidden',
  },
  featuredGradient: {
    flex: 1,
    padding: SPACING.md,
    justifyContent: 'center',
  },
  featuredAvatar: {
    marginBottom: SPACING.sm,
  },
  featuredInfo: {
    flex: 1,
  },
  featuredName: {
    ...TEXT_STYLES.subtitle,
    color: '#fff',
    fontSize: 16,
  },
  featuredSpecialization: {
    ...TEXT_STYLES.caption,
    color: '#fff',
    opacity: 0.9,
    marginBottom: SPACING.xs,
  },
  featuredRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredRatingText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: SPACING.xs,
  },
  trainersSection: {
    marginBottom: SPACING.xxl,
  },
  trainersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  resultsChip: {
    backgroundColor: COLORS.success,
  },
  trainerCard: {
    marginBottom: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
  },
  cardContent: {
    padding: SPACING.md,
  },
  trainerHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  avatar: {
    marginRight: SPACING.md,
  },
  trainerInfo: {
    flex: 1,
  },
  trainerName: {
    marginBottom: SPACING.xs,
  },
  specialization: {
    marginBottom: SPACING.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    marginLeft: SPACING.xs,
  },
  reviews: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  distanceChip: {
    backgroundColor: COLORS.background,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  badge: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
    backgroundColor: COLORS.primary,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
  },
  description: {
    marginBottom: SPACING.md,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  bookButton: {
    backgroundColor: COLORS.primary,
  },
  messageButton: {
    borderColor: COLORS.primary,
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

export default FindTrainers;