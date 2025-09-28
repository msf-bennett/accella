import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  StatusBar,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Animated,
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Searchbar,
  ProgressBar,
  Portal,
  Modal,
  Divider,
  Badge,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../../styles/colors';
import { SPACING } from '../../../styles/spacing';
import { TEXT_STYLES } from '../../../styles/textStyles';
import { TYPOGRAPHY } from '../../../styles/typography';
import { LAYOUT } from '../../../styles/layout';
import PlaceholderScreen from '../components/PlaceholderScreen';
import { Text } from '../components/StyledText';

const { width } = Dimensions.get('window');

const SingleSessionCoachingOpportunities = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { opportunities } = useSelector(state => state.coaching);

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedSport, setSelectedSport] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [animatedValue] = useState(new Animated.Value(0));

  const isCoach = user?.role === 'coach';

  // Mock coaching opportunities data
  const mockOpportunities = [
    {
      id: '1',
      title: 'Football Skills Intensive',
      coachName: 'Marcus Johnson',
      coachImage: 'https://i.pravatar.cc/150?img=1',
      sport: 'Football',
      level: 'Intermediate',
      duration: 90,
      price: 75,
      location: 'Central Sports Complex',
      address: '123 Sports Ave, Downtown',
      date: '2024-12-25',
      time: '10:00 AM',
      spotsTotal: 6,
      spotsBooked: 4,
      rating: 4.8,
      reviews: 42,
      description: 'Intensive football skills training focusing on ball control, passing accuracy, and tactical awareness. Perfect for players looking to elevate their game.',
      specialties: ['Ball Control', 'Tactical Play', 'Fitness'],
      equipment: 'Footballs and cones provided',
      status: 'available',
      featured: true,
      coachExperience: '8 years',
      coachBio: 'Former professional player with extensive youth coaching experience.',
    },
    {
      id: '2',
      title: 'Basketball Shooting Clinic',
      coachName: 'Sarah Mitchell',
      coachImage: 'https://i.pravatar.cc/150?img=2',
      sport: 'Basketball',
      level: 'All Levels',
      duration: 60,
      price: 45,
      location: 'Westside Basketball Courts',
      address: '456 Court St, Westside',
      date: '2024-12-26',
      time: '2:00 PM',
      spotsTotal: 8,
      spotsBooked: 3,
      rating: 4.9,
      reviews: 67,
      description: 'Master your shooting technique with personalized feedback. We\'ll work on form, consistency, and game-situation shooting.',
      specialties: ['Shooting Form', 'Free Throws', 'Game Shots'],
      equipment: 'Basketballs provided',
      status: 'available',
      featured: false,
      coachExperience: '5 years',
      coachBio: 'College basketball player turned coach, specializing in shooting mechanics.',
    },
    {
      id: '3',
      title: 'Tennis Power & Precision',
      coachName: 'David Chen',
      coachImage: 'https://i.pravatar.cc/150?img=3',
      sport: 'Tennis',
      level: 'Advanced',
      duration: 120,
      price: 100,
      location: 'Elite Tennis Academy',
      address: '789 Tennis Blvd, Uptown',
      date: '2024-12-27',
      time: '9:00 AM',
      spotsTotal: 4,
      spotsBooked: 4,
      rating: 4.7,
      reviews: 28,
      description: 'Advanced tennis training focusing on power generation and shot precision. For serious players ready to compete.',
      specialties: ['Power Shots', 'Court Positioning', 'Match Strategy'],
      equipment: 'Rackets available if needed',
      status: 'full',
      featured: false,
      coachExperience: '12 years',
      coachBio: 'Professional tennis instructor with tournament coaching experience.',
    },
    {
      id: '4',
      title: 'Swimming Technique Workshop',
      coachName: 'Emma Rodriguez',
      coachImage: 'https://i.pravatar.cc/150?img=4',
      sport: 'Swimming',
      level: 'Beginner',
      duration: 75,
      price: 60,
      location: 'Aquatic Center',
      address: '321 Pool Lane, Midtown',
      date: '2024-12-28',
      time: '11:00 AM',
      spotsTotal: 5,
      spotsBooked: 2,
      rating: 4.8,
      reviews: 35,
      description: 'Learn proper swimming techniques and build confidence in the water. Focus on stroke mechanics and breathing.',
      specialties: ['Stroke Technique', 'Breathing', 'Water Confidence'],
      equipment: 'Pool equipment provided',
      status: 'available',
      featured: true,
      coachExperience: '10 years',
      coachBio: 'Former competitive swimmer and certified swimming instructor.',
    },
  ];

  // Mock coach's opportunities if user is a coach
  const coachOpportunities = [
    {
      id: 'coach1',
      title: 'Yoga Flow & Flexibility',
      sport: 'Yoga',
      level: 'All Levels',
      duration: 60,
      price: 40,
      location: 'Wellness Studio',
      date: '2024-12-29',
      time: '7:00 AM',
      spotsTotal: 10,
      spotsBooked: 7,
      status: 'available',
      earnings: 280,
    },
    {
      id: 'coach2',
      title: 'HIIT Training Session',
      sport: 'Fitness',
      level: 'Intermediate',
      duration: 45,
      price: 35,
      location: 'City Gym',
      date: '2024-12-30',
      time: '6:00 PM',
      spotsTotal: 12,
      spotsBooked: 12,
      status: 'full',
      earnings: 420,
    },
  ];

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const filters = [
    { key: 'all', label: 'All', count: mockOpportunities.length },
    { key: 'available', label: 'Available', count: 3 },
    { key: 'featured', label: 'Featured', count: 2 },
    { key: 'today', label: 'Today', count: 0 },
  ];

  const sports = [
    { key: 'all', label: 'All Sports' },
    { key: 'Football', label: 'Football' },
    { key: 'Basketball', label: 'Basketball' },
    { key: 'Tennis', label: 'Tennis' },
    { key: 'Swimming', label: 'Swimming' },
    { key: 'Yoga', label: 'Yoga' },
    { key: 'Fitness', label: 'Fitness' },
  ];

  const locations = [
    { key: 'all', label: 'All Locations' },
    { key: 'downtown', label: 'Downtown' },
    { key: 'westside', label: 'Westside' },
    { key: 'uptown', label: 'Uptown' },
    { key: 'midtown', label: 'Midtown' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return COLORS.success;
      case 'full': return COLORS.error;
      case 'cancelled': return COLORS.textSecondary;
      default: return COLORS.warning;
    }
  };

  const getStatusText = (opportunity) => {
    const spotsLeft = opportunity.spotsTotal - opportunity.spotsBooked;
    if (spotsLeft === 0) return 'FULL';
    if (spotsLeft === 1) return '1 SPOT LEFT';
    return `${spotsLeft} SPOTS LEFT`;
  };

  const handleBookSession = (opportunity) => {
    setSelectedOpportunity(opportunity);
    setShowBookingModal(true);
  };

  const confirmBooking = () => {
    Alert.alert(
      '🎉 Booking Confirmed!',
      `You've successfully booked "${selectedOpportunity?.title}". You'll receive a confirmation email with location details.`,
      [
        {
          text: 'View Booking',
          onPress: () => {
            setShowBookingModal(false);
            navigation.navigate('SessionBookings');
          },
        },
      ]
    );
  };

  const handleCreateOpportunity = () => {
    if (!isCoach) {
      Alert.alert('Coach Only', 'Only coaches can create coaching opportunities.');
      return;
    }
    setShowCreateModal(true);
  };

  const filteredOpportunities = mockOpportunities.filter(opportunity => {
    // Filter by search query
    if (searchQuery && !opportunity.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !opportunity.coachName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !opportunity.sport.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Filter by status
    if (selectedFilter === 'available' && opportunity.status !== 'available') return false;
    if (selectedFilter === 'featured' && !opportunity.featured) return false;
    if (selectedFilter === 'today') {
      const today = new Date().toDateString();
      const oppDate = new Date(opportunity.date).toDateString();
      if (today !== oppDate) return false;
    }

    // Filter by sport
    if (selectedSport !== 'all' && opportunity.sport !== selectedSport) return false;

    return true;
  });

  const renderOpportunityCard = ({ item, index }) => {
    const spotsLeft = item.spotsTotal - item.spotsBooked;
    const isFullyBooked = spotsLeft === 0;

    return (
      <Animated.View
        style={[
          styles.opportunityCard,
          {
            opacity: animatedValue,
            transform: [{
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            }],
          },
        ]}
      >
        <Card style={[styles.card, item.featured && styles.featuredCard]} elevation={item.featured ? 6 : 3}>
          {item.featured && (
            <View style={styles.featuredBadge}>
              <Icon name="star" size={16} color="#fff" />
              <Text style={styles.featuredText}>Featured</Text>
            </View>
          )}

          <LinearGradient
            colors={item.featured ? ['#FF6B6B', '#FF8E53'] : [COLORS.primary, '#764ba2']}
            style={styles.cardHeader}
          >
            <View style={styles.headerContent}>
              <View style={styles.coachInfo}>
                <Avatar.Image source={{ uri: item.coachImage }} size={45} />
                <View style={styles.coachDetails}>
                  <Text style={styles.coachName}>{item.coachName}</Text>
                  <View style={styles.ratingContainer}>
                    <Icon name="star" size={14} color="#fff" />
                    <Text style={styles.rating}>{item.rating}</Text>
                    <Text style={styles.reviews}>({item.reviews})</Text>
                  </View>
                </View>
              </View>
              <View style={styles.priceContainer}>
                <Text style={styles.price}>${item.price}</Text>
                <Text style={styles.priceLabel}>per session</Text>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.cardContent}>
            <View style={styles.titleContainer}>
              <Text style={styles.sessionTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <View style={styles.sportChip}>
                <Text style={styles.sportText}>{item.sport}</Text>
              </View>
            </View>

            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>

            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Icon name="schedule" size={16} color={COLORS.primary} />
                <Text style={styles.detailText}>{item.duration} min</Text>
              </View>
              <View style={styles.detailItem}>
                <Icon name="trending-up" size={16} color={COLORS.primary} />
                <Text style={styles.detailText}>{item.level}</Text>
              </View>
              <View style={styles.detailItem}>
                <Icon name="event" size={16} color={COLORS.primary} />
                <Text style={styles.detailText}>
                  {new Date(item.date).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Icon name="access-time" size={16} color={COLORS.primary} />
                <Text style={styles.detailText}>{item.time}</Text>
              </View>
            </View>

            <View style={styles.locationContainer}>
              <Icon name="location-on" size={16} color={COLORS.textSecondary} />
              <Text style={styles.locationText} numberOfLines={1}>
                {item.location}
              </Text>
            </View>

            <View style={styles.spotsContainer}>
              <ProgressBar
                progress={item.spotsBooked / item.spotsTotal}
                color={isFullyBooked ? COLORS.error : COLORS.success}
                style={styles.spotsProgress}
              />
              <Text style={[styles.spotsText, { color: getStatusColor(item.status) }]}>
                {getStatusText(item)}
              </Text>
            </View>

            <View style={styles.specialtiesContainer}>
              {item.specialties.slice(0, 3).map((specialty, idx) => (
                <Chip
                  key={idx}
                  style={styles.specialtyChip}
                  textStyle={styles.specialtyText}
                  mode="outlined"
                  compact
                >
                  {specialty}
                </Chip>
              ))}
            </View>

            <View style={styles.cardActions}>
              <Button
                mode="outlined"
                onPress={() => Alert.alert('🔄 Feature in Development', 'Coach profile view coming soon!')}
                style={styles.actionButton}
                icon="person"
                compact
              >
                View Coach
              </Button>
              <Button
                mode="contained"
                onPress={() => handleBookSession(item)}
                style={[styles.actionButton, isFullyBooked && styles.disabledButton]}
                disabled={isFullyBooked}
                icon={isFullyBooked ? 'block' : 'book'}
              >
                {isFullyBooked ? 'Full' : 'Book Now'}
              </Button>
            </View>
          </View>
        </Card>
      </Animated.View>
    );
  };

  const renderCoachOpportunityCard = ({ item }) => (
    <Card style={styles.coachCard} elevation={2}>
      <View style={styles.coachCardHeader}>
        <View style={styles.coachCardInfo}>
          <Text style={styles.coachCardTitle}>{item.title}</Text>
          <Text style={styles.coachCardSport}>{item.sport} • {item.level}</Text>
        </View>
        <View style={styles.coachCardStatus}>
          <Badge
            style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}
          >
            {item.status.toUpperCase()}
          </Badge>
        </View>
      </View>

      <View style={styles.coachCardDetails}>
        <View style={styles.coachDetailRow}>
          <Icon name="event" size={16} color={COLORS.textSecondary} />
          <Text style={styles.coachDetailText}>
            {new Date(item.date).toLocaleDateString()} at {item.time}
          </Text>
        </View>
        <View style={styles.coachDetailRow}>
          <Icon name="location-on" size={16} color={COLORS.textSecondary} />
          <Text style={styles.coachDetailText}>{item.location}</Text>
        </View>
        <View style={styles.coachDetailRow}>
          <Icon name="people" size={16} color={COLORS.textSecondary} />
          <Text style={styles.coachDetailText}>
            {item.spotsBooked}/{item.spotsTotal} booked
          </Text>
        </View>
      </View>

      <View style={styles.coachCardFooter}>
        <View style={styles.earningsContainer}>
          <Text style={styles.earningsLabel}>Potential Earnings:</Text>
          <Text style={styles.earningsValue}>${item.earnings}</Text>
        </View>
        <View style={styles.coachCardActions}>
          <IconButton
            icon="edit"
            size={20}
            onPress={() => Alert.alert('🔄 Feature in Development', 'Edit opportunity coming soon!')}
          />
          <IconButton
            icon="delete"
            size={20}
            onPress={() => Alert.alert('🔄 Feature in Development', 'Delete opportunity coming soon!')}
          />
        </View>
      </View>
    </Card>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContent}
      >
        {filters.map((filter) => (
          <Chip
            key={filter.key}
            selected={selectedFilter === filter.key}
            onPress={() => setSelectedFilter(filter.key)}
            style={[
              styles.filterChip,
              selectedFilter === filter.key && styles.selectedFilterChip,
            ]}
            textStyle={[
              styles.filterText,
              selectedFilter === filter.key && styles.selectedFilterText,
            ]}
          >
            {filter.label} ({filter.count})
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const renderSportFilters = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.sportFilters}
      contentContainerStyle={styles.sportFiltersContent}
    >
      {sports.map((sport) => (
        <TouchableOpacity
          key={sport.key}
          style={[
            styles.sportFilter,
            selectedSport === sport.key && styles.selectedSportFilter,
          ]}
          onPress={() => setSelectedSport(sport.key)}
        >
          <Text
            style={[
              styles.sportFilterText,
              selectedSport === sport.key && styles.selectedSportFilterText,
            ]}
          >
            {sport.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderStats = () => (
    <Surface style={styles.statsContainer} elevation={2}>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{filteredOpportunities.length}</Text>
          <Text style={styles.statLabel}>Available</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {filteredOpportunities.filter(o => o.featured).length}
          </Text>
          <Text style={styles.statLabel}>Featured</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            ${Math.min(...filteredOpportunities.map(o => o.price))}
          </Text>
          <Text style={styles.statLabel}>From</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {Math.max(...filteredOpportunities.map(o => o.duration))}m
          </Text>
          <Text style={styles.statLabel}>Max Duration</Text>
        </View>
      </View>
    </Surface>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>
              {isCoach ? 'My Coaching Sessions' : 'Coaching Opportunities'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {isCoach 
                ? 'Manage your single session offerings' 
                : 'Discover single session coaching opportunities'
              }
            </Text>
          </View>
          <View style={styles.headerActions}>
            <IconButton
              icon={viewMode === 'grid' ? 'view-list' : 'view-module'}
              iconColor="#fff"
              size={24}
              onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            />
            <IconButton
              icon="filter-list"
              iconColor="#fff"
              size={24}
              onPress={() => Alert.alert('🔄 Feature in Development', 'Advanced filters coming soon!')}
            />
          </View>
        </View>
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
        {!isCoach && (
          <>
            {/* Search Bar */}
            <Surface style={styles.searchContainer} elevation={1}>
              <Searchbar
                placeholder="Search sessions, coaches, or sports..."
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={styles.searchbar}
                iconColor={COLORS.primary}
              />
            </Surface>

            {/* Stats Overview */}
            {renderStats()}

            {/* Sport Filters */}
            {renderSportFilters()}

            {/* Filter Chips */}
            {renderFilters()}

            {/* Opportunities List */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  Available Sessions ⚡ ({filteredOpportunities.length})
                </Text>
                <TouchableOpacity
                  onPress={() => Alert.alert('🔄 Feature in Development', 'Sort options coming soon!')}
                >
                  <Text style={styles.sortText}>Sort</Text>
                </TouchableOpacity>
              </View>

              {filteredOpportunities.length > 0 ? (
                <FlatList
                  data={filteredOpportunities}
                  renderItem={renderOpportunityCard}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                  numColumns={viewMode === 'grid' ? 1 : 1}
                />
              ) : (
                <Card style={styles.emptyCard} elevation={1}>
                  <View style={styles.emptyContainer}>
                    <Icon name="search-off" size={60} color={COLORS.textSecondary} />
                    <Text style={styles.emptyTitle}>No sessions found</Text>
                    <Text style={styles.emptyText}>
                      Try adjusting your search or filters
                    </Text>
                  </View>
                </Card>
              )}
            </View>
          </>
        )}

        {/* Coach View */}
        {isCoach && (
          <View style={styles.coachSection}>
            <View style={styles.coachStats}>
              <Card style={styles.coachStatsCard} elevation={3}>
                <LinearGradient
                  colors={[COLORS.success, '#4CAF50']}
                  style={styles.coachStatsHeader}
                >
                  <Text style={styles.coachStatsTitle}>This Month's Performance</Text>
                </LinearGradient>
                <View style={styles.coachStatsContent}>
                  <View style={styles.coachStatRow}>
                    <View style={styles.coachStatItem}>
                      <Text style={styles.coachStatNumber}>12</Text>
                      <Text style={styles.coachStatLabel}>Sessions</Text>
                    </View>
                    <View style={styles.coachStatItem}>
                      <Text style={styles.coachStatNumber}>$850</Text>
                      <Text style={styles.coachStatLabel}>Earnings</Text>
                    </View>
                    <View style={styles.coachStatItem}>
                      <Text style={styles.coachStatNumber}>4.9</Text>
                      <Text style={styles.coachStatLabel}>Rating</Text>
                    </View>
                  </View>
                </View>
              </Card>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                My Sessions 📅 ({coachOpportunities.length})
              </Text>
              <Button
                mode="contained"
                onPress={handleCreateOpportunity}
                style={styles.createButton}
                icon="add"
                compact
              >
                Create
              </Button>
            </View>

            <FlatList
              data={coachOpportunities}
              renderItem={renderCoachOpportunityCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}
      </ScrollView>

      {/* Booking Modal */}
      <Portal>
        <Modal
          visible={showBookingModal}
          onDismiss={() => setShowBookingModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          {selectedOpportunity && (
            <ScrollView style={styles.modalScrollView}>
              <Card style={styles.modalCard}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Book Session</Text>
                  <IconButton
                    icon="close"
                    size={24}
                    onPress={() => setShowBookingModal(false)}
                  />
                </View>

                <LinearGradient
                  colors={[COLORS.primary, '#764ba2']}
                  style={styles.modalSessionHeader}
                >
                  <View style={styles.modalSessionInfo}>
                    <Text style={styles.modalSessionTitle}>{selectedOpportunity.title}</Text>
                    <Text style={styles.modalCoachName}>with {selectedOpportunity.coachName}</Text>
                    <View style={styles.modalRating}>
                      <Icon name="star" size={16} color="#fff" />
                      <Text style={styles.modalRatingText}>
                        {selectedOpportunity.rating} ({selectedOpportunity.reviews} reviews)
                      </Text>
                    </View>
                  </View>
                  <Avatar.Image source={{ uri: selectedOpportunity.coachImage }} size={60} />
                </LinearGradient>

                <View style={styles.modalContent}>
                  <Text style={styles.modalDescription}>
                    {selectedOpportunity.description}
                  </Text>

                  <View style={styles.modalDetailsGrid}>
                    <View style={styles.modalDetailItem}>
                      <Icon name="event" size={20} color={COLORS.primary} />
                      <View style={styles.modalDetailContent}>
                        <Text style={styles.modalDetailLabel}>Date & Time</Text>
                        <Text style={styles.modalDetailValue}>
                          {new Date(selectedOpportunity.date).toLocaleDateString()} at {selectedOpportunity.time}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.modalDetailItem}>
                      <Icon name="schedule" size={20} color={COLORS.primary} />
                      <View style={styles.modalDetailContent}>
                        <Text style={styles.modalDetailLabel}>Duration</Text>
                        <Text style={styles.modalDetailValue}>{selectedOpportunity.duration} minutes</Text>
                      </View>
                    </View>

                    <View style={styles.modalDetailItem}>
                      <Icon name="location-on" size={20} color={COLORS.primary} />
                      <View style={styles.modalDetailContent}>
                        <Text style={styles.modalDetailLabel}>Location</Text>
                        <Text style={styles.modalDetailValue}>
                          {selectedOpportunity.location}
                        </Text>
                        <Text style={styles.modalDetailAddress}>
                          {selectedOpportunity.address}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.modalDetailItem}>
                      <Icon name="people" size={20} color={COLORS.primary} />
                      <View style={styles.modalDetailContent}>
                        <Text style={styles.modalDetailLabel}>Availability</Text>
                        <Text style={styles.modalDetailValue}>
                          {selectedOpportunity.spotsTotal - selectedOpportunity.spotsBooked} spots remaining
                        </Text>
                      </View>
                    </View>
                  </View>

                  <Divider style={styles.modalDivider} />

                  <View style={styles.modalSpecialties}>
                    <Text style={styles.modalSpecialtiesTitle}>What you'll learn:</Text>
                    <View style={styles.modalSpecialtiesList}>
                      {selectedOpportunity.specialties.map((specialty, index) => (
                        <Chip
                          key={index}
                          style={styles.modalSpecialtyChip}
                          textStyle={styles.modalSpecialtyText}
                          icon="check-circle"
                        >
                          {specialty}
                        </Chip>
                      ))}
                    </View>
                  </View>

                  <View style={styles.modalEquipment}>
                    <View style={styles.modalEquipmentHeader}>
                      <Icon name="sports" size={20} color={COLORS.textSecondary} />
                      <Text style={styles.modalEquipmentTitle}>Equipment</Text>
                    </View>
                    <Text style={styles.modalEquipmentText}>{selectedOpportunity.equipment}</Text>
                  </View>

                  <View style={styles.modalCoachInfo}>
                    <Text style={styles.modalCoachInfoTitle}>About the Coach</Text>
                    <View style={styles.modalCoachInfoContent}>
                      <Text style={styles.modalCoachBio}>{selectedOpportunity.coachBio}</Text>
                      <Text style={styles.modalCoachExperience}>
                        {selectedOpportunity.coachExperience} of coaching experience
                      </Text>
                    </View>
                  </View>

                  <View style={styles.modalPricing}>
                    <View style={styles.modalPriceRow}>
                      <Text style={styles.modalPriceLabel}>Session Price:</Text>
                      <Text style={styles.modalPriceValue}>${selectedOpportunity.price}</Text>
                    </View>
                    <View style={styles.modalPriceRow}>
                      <Text style={styles.modalPriceLabel}>Platform Fee:</Text>
                      <Text style={styles.modalPriceValue}>$5</Text>
                    </View>
                    <Divider style={styles.modalPriceDivider} />
                    <View style={styles.modalPriceRow}>
                      <Text style={styles.modalTotalLabel}>Total:</Text>
                      <Text style={styles.modalTotalValue}>${selectedOpportunity.price + 5}</Text>
                    </View>
                  </View>

                  <View style={styles.modalActions}>
                    <Button
                      mode="outlined"
                      onPress={() => setShowBookingModal(false)}
                      style={styles.modalButton}
                    >
                      Cancel
                    </Button>
                    <Button
                      mode="contained"
                      onPress={confirmBooking}
                      style={styles.modalButton}
                      icon="credit-card"
                    >
                      Book & Pay
                    </Button>
                  </View>
                </View>
              </Card>
            </ScrollView>
          )}
        </Modal>
      </Portal>

      {/* Create Opportunity Modal */}
      <Portal>
        <Modal
          visible={showCreateModal}
          onDismiss={() => setShowCreateModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Session</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setShowCreateModal(false)}
              />
            </View>
            <View style={styles.modalContent}>
              <View style={styles.createFormContainer}>
                <Icon name="construction" size={60} color={COLORS.primary} />
                <Text style={styles.createFormTitle}>Session Creation</Text>
                <Text style={styles.createFormText}>
                  The session creation form is being developed. You'll be able to create and manage your coaching opportunities soon!
                </Text>
                <Button
                  mode="contained"
                  onPress={() => {
                    setShowCreateModal(false);
                    Alert.alert('🔄 Feature in Development', 'Session creation form coming soon!');
                  }}
                  style={styles.createFormButton}
                  icon="add"
                >
                  Coming Soon
                </Button>
              </View>
            </View>
          </Card>
        </Modal>
      </Portal>

      {/* Floating Action Button */}
      <FAB
        icon={isCoach ? "add" : "search"}
        style={styles.fab}
        onPress={isCoach ? handleCreateOpportunity : () => Alert.alert('🔄 Feature in Development', 'Advanced search coming soon!')}
        color="#fff"
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
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: '#fff',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  headerActions: {
    flexDirection: 'row',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  searchContainer: {
    marginVertical: SPACING.md,
    borderRadius: 12,
  },
  searchbar: {
    backgroundColor: '#fff',
    elevation: 0,
  },
  statsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...TEXT_STYLES.h3,
    color: COLORS.primary,
    fontWeight: '700',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  sportFilters: {
    marginBottom: SPACING.sm,
  },
  sportFiltersContent: {
    paddingHorizontal: SPACING.xs,
  },
  sportFilter: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.backgroundSecondary,
  },
  selectedSportFilter: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  sportFilterText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  selectedSportFilterText: {
    color: '#fff',
  },
  filtersContainer: {
    marginBottom: SPACING.lg,
  },
  filtersContent: {
    paddingHorizontal: SPACING.xs,
  },
  filterChip: {
    marginRight: SPACING.sm,
    backgroundColor: '#fff',
  },
  selectedFilterChip: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    color: COLORS.textPrimary,
  },
  selectedFilterText: {
    color: '#fff',
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.textPrimary,
  },
  sortText: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    fontWeight: '600',
  },
  opportunityCard: {
    marginBottom: SPACING.lg,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  featuredCard: {
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  featuredBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    zIndex: 1,
  },
  featuredText: {
    ...TEXT_STYLES.caption,
    color: '#fff',
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  cardHeader: {
    padding: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coachInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  coachDetails: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  coachName: {
    ...TEXT_STYLES.h4,
    color: '#fff',
    marginBottom: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.9)',
    marginLeft: 2,
    marginRight: SPACING.xs,
  },
  reviews: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    ...TEXT_STYLES.h3,
    color: '#fff',
    fontWeight: '700',
  },
  priceLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  cardContent: {
    padding: SPACING.md,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  sessionTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: SPACING.sm,
  },
  sportChip: {
    backgroundColor: COLORS.backgroundSecondary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  sportText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: '600',
  },
  description: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: SPACING.xs,
  },
  detailText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  locationText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
    flex: 1,
  },
  spotsContainer: {
    marginBottom: SPACING.md,
  },
  spotsProgress: {
    height: 6,
    borderRadius: 3,
    marginBottom: SPACING.xs,
  },
  spotsText: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    textAlign: 'center',
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  specialtyChip: {
    height: 28,
  },
  specialtyText: {
    fontSize: 11,
  },
  cardActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
  },
  disabledButton: {
    backgroundColor: COLORS.textSecondary,
  },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  emptyText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  coachSection: {
    flex: 1,
  },
  coachStats: {
    marginBottom: SPACING.lg,
  },
  coachStatsCard: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  coachStatsHeader: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  coachStatsTitle: {
    ...TEXT_STYLES.h4,
    color: '#fff',
  },
  coachStatsContent: {
    padding: SPACING.md,
  },
  coachStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  coachStatItem: {
    alignItems: 'center',
  },
  coachStatNumber: {
    ...TEXT_STYLES.h3,
    color: COLORS.primary,
    fontWeight: '700',
  },
  coachStatLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  createButton: {
    paddingHorizontal: SPACING.sm,
  },
  coachCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: SPACING.md,
  },
  coachCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  coachCardInfo: {
    flex: 1,
  },
  coachCardTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  coachCardSport: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  coachCardStatus: {
    marginLeft: SPACING.md,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  coachCardDetails: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  coachDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  coachDetailText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  coachCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.backgroundSecondary,
  },
  earningsContainer: {
    flex: 1,
  },
  earningsLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  earningsValue: {
    ...TEXT_STYLES.h4,
    color: COLORS.success,
    fontWeight: '700',
  },
  coachCardActions: {
    flexDirection: 'row',
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.xl,
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.md,
  },
  modalScrollView: {
    maxHeight: '90%',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingBottom: 0,
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.textPrimary,
  },
  modalSessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: 12,
  },
  modalSessionInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  modalSessionTitle: {
    ...TEXT_STYLES.h4,
    color: '#fff',
    marginBottom: SPACING.xs,
  },
  modalCoachName: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: SPACING.xs,
  },
  modalRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalRatingText: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.9)',
    marginLeft: SPACING.xs,
  },
  modalContent: {
    padding: SPACING.lg,
  },
  modalDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  modalDetailsGrid: {
    marginBottom: SPACING.lg,
  },
  modalDetailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  modalDetailContent: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  modalDetailLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  modalDetailValue: {
    ...TEXT_STYLES.body,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  modalDetailAddress: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  modalDivider: {
    marginVertical: SPACING.lg,
  },
  modalSpecialties: {
    marginBottom: SPACING.lg,
  },
  modalSpecialtiesTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  modalSpecialtiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  modalSpecialtyChip: {
    backgroundColor: COLORS.backgroundSecondary,
  },
  modalSpecialtyText: {
    color: COLORS.primary,
    fontSize: 12,
  },
  modalEquipment: {
    marginBottom: SPACING.lg,
  },
  modalEquipmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  modalEquipmentTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.textPrimary,
    marginLeft: SPACING.xs,
  },
  modalEquipmentText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
  },
  modalCoachInfo: {
    marginBottom: SPACING.lg,
  },
  modalCoachInfoTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  modalCoachInfoContent: {
    backgroundColor: COLORS.backgroundSecondary,
    padding: SPACING.md,
    borderRadius: 12,
  },
  modalCoachBio: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  modalCoachExperience: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: '600',
  },
  modalPricing: {
    backgroundColor: COLORS.backgroundSecondary,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.xl,
  },
  modalPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  modalPriceLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
  },
  modalPriceValue: {
    ...TEXT_STYLES.body,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  modalPriceDivider: {
    marginVertical: SPACING.sm,
  },
  modalTotalLabel: {
    ...TEXT_STYLES.h4,
    color: COLORS.textPrimary,
  },
  modalTotalValue: {
    ...TEXT_STYLES.h4,
    color: COLORS.primary,
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  modalButton: {
    flex: 1,
  },
  createFormContainer: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  createFormTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  createFormText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
  createFormButton: {
    paddingHorizontal: SPACING.xl,
  },
});

export default SingleSessionCoachingOpportunities;