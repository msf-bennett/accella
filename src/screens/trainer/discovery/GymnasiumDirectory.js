import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  RefreshControl,
  Alert,
  Animated,
  FlatList,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from '../../../components/shared/BlurView';
import { BlurView } from '../../../components/shared/BlurView';
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
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Design system constants
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
  accent: '#FF6B6B',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textSecondary },
  small: { fontSize: 12, color: COLORS.textSecondary },
};

const { width } = Dimensions.get('window');

const GymnasiumDirectory = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('Near Me');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Mock data for gymnasiums and facilities
  const [gymnasiums, setGymnasiums] = useState([
    {
      id: '1',
      name: 'Elite Fitness Center',
      type: 'Gymnasium',
      location: 'Downtown, Nairobi',
      distance: '2.1 km',
      rating: 4.8,
      reviews: 124,
      facilities: ['Basketball Court', 'Weight Room', 'Cardio Area', 'Locker Rooms'],
      specializations: ['Basketball', 'Fitness', 'Personal Training'],
      hourlyRate: 2500,
      dailyRate: 15000,
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      verified: true,
      openNow: true,
      contactPhone: '+254712345678',
      capacity: 50,
      amenities: ['Parking', 'WiFi', 'Air Conditioning', 'Sound System'],
      partnershipAvailable: true,
    },
    {
      id: '2',
      name: 'Westlands Sports Complex',
      type: 'Sports Complex',
      location: 'Westlands, Nairobi',
      distance: '4.3 km',
      rating: 4.6,
      reviews: 89,
      facilities: ['Football Field', 'Tennis Court', 'Swimming Pool', 'Gym'],
      specializations: ['Football', 'Tennis', 'Swimming', 'Multi-Sport'],
      hourlyRate: 3000,
      dailyRate: 20000,
      image: 'https://images.unsplash.com/photo-1544966503-7cc72eaecf9e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      verified: true,
      openNow: false,
      contactPhone: '+254723456789',
      capacity: 100,
      amenities: ['Parking', 'Cafeteria', 'First Aid', 'Equipment Rental'],
      partnershipAvailable: true,
    },
    {
      id: '3',
      name: 'Karen Country Club',
      type: 'Country Club',
      location: 'Karen, Nairobi',
      distance: '8.7 km',
      rating: 4.9,
      reviews: 156,
      facilities: ['Golf Course', 'Tennis Courts', 'Fitness Center', 'Pool'],
      specializations: ['Golf', 'Tennis', 'Fitness', 'Swimming'],
      hourlyRate: 5000,
      dailyRate: 35000,
      image: 'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      verified: true,
      openNow: true,
      contactPhone: '+254734567890',
      capacity: 200,
      amenities: ['Valet Parking', 'Restaurant', 'Spa', 'Pro Shop'],
      partnershipAvailable: false,
    },
    {
      id: '4',
      name: 'Community Sports Hub',
      type: 'Community Center',
      location: 'Kasarani, Nairobi',
      distance: '12.1 km',
      rating: 4.2,
      reviews: 67,
      facilities: ['Multi-Purpose Hall', 'Outdoor Court', 'Kids Area'],
      specializations: ['Community Sports', 'Youth Programs', 'Fitness Classes'],
      hourlyRate: 1500,
      dailyRate: 8000,
      image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2075&q=80',
      verified: false,
      openNow: true,
      contactPhone: '+254745678901',
      capacity: 75,
      amenities: ['Basic Parking', 'Water Station'],
      partnershipAvailable: true,
    },
  ]);

  const filterOptions = [
    { id: 'verified', label: 'Verified', icon: 'verified' },
    { id: 'partnership', label: 'Partnership Available', icon: 'handshake' },
    { id: 'open', label: 'Open Now', icon: 'schedule' },
    { id: 'budget', label: 'Budget Friendly', icon: 'attach-money' },
    { id: 'premium', label: 'Premium', icon: 'star' },
    { id: 'basketball', label: 'Basketball', icon: 'sports-basketball' },
    { id: 'football', label: 'Football', icon: 'sports-soccer' },
    { id: 'fitness', label: 'Fitness', icon: 'fitness-center' },
    { id: 'swimming', label: 'Swimming', icon: 'pool' },
    { id: 'tennis', label: 'Tennis', icon: 'sports-tennis' },
  ];

  // Animation setup
  useEffect(() => {
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

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  // Filter gymnasiums based on search and filters
  const filteredGymnasiums = gymnasiums.filter(gym => {
    const matchesSearch = gym.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         gym.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         gym.specializations.some(spec => spec.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilters = selectedFilters.length === 0 || selectedFilters.every(filter => {
      switch (filter) {
        case 'verified':
          return gym.verified;
        case 'partnership':
          return gym.partnershipAvailable;
        case 'open':
          return gym.openNow;
        case 'budget':
          return gym.hourlyRate < 2000;
        case 'premium':
          return gym.hourlyRate > 4000;
        default:
          return gym.specializations.some(spec => spec.toLowerCase().includes(filter));
      }
    });

    return matchesSearch && matchesFilters;
  });

  // Handle filter toggle
  const toggleFilter = (filterId) => {
    setSelectedFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(f => f !== filterId)
        : [...prev, filterId]
    );
  };

  // Handle contact gymnasium
  const handleContact = (gymnasium) => {
    Alert.alert(
      'Contact Gymnasium',
      `Would you like to contact ${gymnasium.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => Alert.alert('Feature Coming Soon', 'Phone integration will be available in the next update! 📱') },
        { text: 'Message', onPress: () => Alert.alert('Feature Coming Soon', 'In-app messaging will be available soon! 💬') },
      ]
    );
  };

  // Handle partnership request
  const handlePartnership = (gymnasium) => {
    if (gymnasium.partnershipAvailable) {
      Alert.alert(
        'Partnership Request',
        `Send partnership proposal to ${gymnasium.name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Send Request', onPress: () => Alert.alert('Feature Coming Soon', 'Partnership requests will be available soon! 🤝') },
        ]
      );
    } else {
      Alert.alert('Not Available', 'This facility is not currently accepting partnership requests.');
    }
  };

  // Handle book venue
  const handleBookVenue = (gymnasium) => {
    Alert.alert(
      'Book Venue',
      `Book ${gymnasium.name} for your training sessions?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'View Availability', onPress: () => Alert.alert('Feature Coming Soon', 'Venue booking system coming soon! 📅') },
      ]
    );
  };

  // Render gymnasium card
  const renderGymnasiumCard = ({ item: gymnasium, index }) => (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Card style={styles.gymCard} elevation={4}>
        <View style={styles.cardHeader}>
          <Image source={{ uri: gymnasium.image }} style={styles.gymImage} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.imageOverlay}
          >
            <View style={styles.headerContent}>
              <View style={styles.ratingContainer}>
                <Icon name="star" size={16} color="#FFD700" />
                <Text style={styles.ratingText}>{gymnasium.rating}</Text>
                <Text style={styles.reviewsText}>({gymnasium.reviews})</Text>
              </View>
              {gymnasium.verified && (
                <Chip
                  icon="verified"
                  style={styles.verifiedChip}
                  textStyle={styles.chipText}
                  compact
                >
                  Verified
                </Chip>
              )}
            </View>
          </LinearGradient>
          <View style={styles.statusIndicator}>
            <View style={[styles.statusDot, gymnasium.openNow ? styles.openDot : styles.closedDot]} />
            <Text style={styles.statusText}>
              {gymnasium.openNow ? 'Open' : 'Closed'}
            </Text>
          </View>
        </View>

        <Card.Content style={styles.cardContent}>
          <View style={styles.titleRow}>
            <Text style={styles.gymName}>{gymnasium.name}</Text>
            {gymnasium.partnershipAvailable && (
              <Icon name="handshake" size={20} color={COLORS.success} />
            )}
          </View>
          
          <View style={styles.locationRow}>
            <Icon name="location-on" size={16} color={COLORS.textSecondary} />
            <Text style={styles.locationText}>{gymnasium.location}</Text>
            <Text style={styles.distanceText}>• {gymnasium.distance}</Text>
          </View>

          <Text style={styles.typeText}>{gymnasium.type}</Text>

          {/* Facilities */}
          <View style={styles.facilitiesContainer}>
            <Text style={styles.sectionLabel}>Facilities:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {gymnasium.facilities.map((facility, index) => (
                <Chip
                  key={index}
                  style={styles.facilityChip}
                  textStyle={styles.facilityChipText}
                  compact
                >
                  {facility}
                </Chip>
              ))}
            </ScrollView>
          </View>

          {/* Specializations */}
          <View style={styles.specializationsContainer}>
            <Text style={styles.sectionLabel}>Specializations:</Text>
            <View style={styles.specializationTags}>
              {gymnasium.specializations.map((spec, index) => (
                <View key={index} style={styles.specTag}>
                  <Text style={styles.specTagText}>{spec}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Pricing */}
          <View style={styles.pricingContainer}>
            <View style={styles.priceItem}>
              <Icon name="schedule" size={16} color={COLORS.primary} />
              <Text style={styles.priceText}>KES {gymnasium.hourlyRate}/hr</Text>
            </View>
            <View style={styles.priceItem}>
              <Icon name="today" size={16} color={COLORS.primary} />
              <Text style={styles.priceText}>KES {gymnasium.dailyRate}/day</Text>
            </View>
            <View style={styles.capacityItem}>
              <Icon name="people" size={16} color={COLORS.textSecondary} />
              <Text style={styles.capacityText}>{gymnasium.capacity} capacity</Text>
            </View>
          </View>

          {/* Action buttons */}
          <View style={styles.actionButtons}>
            <Button
              mode="outlined"
              icon="phone"
              onPress={() => handleContact(gymnasium)}
              style={[styles.actionButton, styles.contactButton]}
              labelStyle={styles.actionButtonText}
              compact
            >
              Contact
            </Button>
            <Button
              mode="contained"
              icon="calendar-today"
              onPress={() => handleBookVenue(gymnasium)}
              style={[styles.actionButton, styles.bookButton]}
              labelStyle={styles.bookButtonText}
              buttonColor={COLORS.primary}
              compact
            >
              Book
            </Button>
            {gymnasium.partnershipAvailable && (
              <Button
                mode="outlined"
                icon="handshake"
                onPress={() => handlePartnership(gymnasium)}
                style={[styles.actionButton, styles.partnershipButton]}
                labelStyle={styles.partnershipButtonText}
                compact
              >
                Partner
              </Button>
            )}
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  // Render filter modal
  const renderFilterModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      transparent
      onRequestClose={() => setShowFilters(false)}
    >
      <BlurView intensity={50} style={styles.modalContainer}>
        <View style={styles.filterModal}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={styles.filterHeader}
          >
            <Text style={styles.filterTitle}>Filter Gymnasiums</Text>
            <IconButton
              icon="close"
              iconColor="#fff"
              onPress={() => setShowFilters(false)}
            />
          </LinearGradient>

          <ScrollView style={styles.filterContent}>
            <Text style={styles.filterSectionTitle}>Categories</Text>
            <View style={styles.filterGrid}>
              {filterOptions.map((filter) => (
                <TouchableOpacity
                  key={filter.id}
                  style={[
                    styles.filterOption,
                    selectedFilters.includes(filter.id) && styles.selectedFilterOption
                  ]}
                  onPress={() => toggleFilter(filter.id)}
                >
                  <Icon
                    name={filter.icon}
                    size={24}
                    color={selectedFilters.includes(filter.id) ? COLORS.surface : COLORS.primary}
                  />
                  <Text style={[
                    styles.filterOptionText,
                    selectedFilters.includes(filter.id) && styles.selectedFilterText
                  ]}>
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.filterActions}>
              <Button
                mode="outlined"
                onPress={() => setSelectedFilters([])}
                style={styles.clearButton}
              >
                Clear All
              </Button>
              <Button
                mode="contained"
                onPress={() => setShowFilters(false)}
                style={styles.applyButton}
                buttonColor={COLORS.primary}
              >
                Apply Filters ({selectedFilters.length})
              </Button>
            </View>
          </ScrollView>
        </View>
      </BlurView>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor={COLORS.primary} translucent />
      
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Gymnasium Directory</Text>
            <TouchableOpacity onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
              <Icon name={viewMode === 'grid' ? 'view-list' : 'view-module'} size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.headerSubtitle}>Find the perfect training venue 🏟️</Text>
          
          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{filteredGymnasiums.length}</Text>
              <Text style={styles.statLabel}>Venues</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{filteredGymnasiums.filter(g => g.verified).length}</Text>
              <Text style={styles.statLabel}>Verified</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{filteredGymnasiums.filter(g => g.partnershipAvailable).length}</Text>
              <Text style={styles.statLabel}>Partnerships</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search gymnasiums, locations, sports..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={COLORS.primary}
          inputStyle={styles.searchInput}
          elevation={2}
        />
        
        <View style={styles.filterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickFilters}>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowFilters(true)}
            >
              <Icon name="filter-list" size={20} color={COLORS.primary} />
              <Text style={styles.filterButtonText}>Filters</Text>
              {selectedFilters.length > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{selectedFilters.length}</Text>
                </View>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.locationButton}>
              <Icon name="location-on" size={16} color={COLORS.primary} />
              <Text style={styles.locationButtonText}>{selectedLocation}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>

      {/* Results */}
      <FlatList
        data={filteredGymnasiums}
        renderItem={renderGymnasiumCard}
        keyExtractor={(item) => item.id}
        style={styles.listContainer}
        contentContainerStyle={styles.listContent}
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
          <View style={styles.emptyContainer}>
            <Icon name="location-off" size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyTitle}>No gymnasiums found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your search criteria or filters
            </Text>
          </View>
        }
      />

      {/* Filter Modal */}
      {renderFilterModal()}

      {/* Floating Action Button */}
      <FAB
        icon="add-location"
        style={styles.fab}
        color="#fff"
        onPress={() => Alert.alert('Feature Coming Soon', 'Add your own gymnasium to the directory! 🏢')}
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
    paddingTop: 50,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    gap: SPACING.sm,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: '#fff',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...TEXT_STYLES.h2,
    color: '#fff',
    fontWeight: 'bold',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  searchContainer: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    elevation: 2,
  },
  searchBar: {
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickFilters: {
    flex: 1,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    marginRight: SPACING.sm,
    elevation: 1,
  },
  filterButtonText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  filterBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.xs,
  },
  filterBadgeText: {
    ...TEXT_STYLES.small,
    color: '#fff',
    fontWeight: 'bold',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    elevation: 1,
  },
  locationButtonText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: SPACING.md,
  },
  cardContainer: {
    marginBottom: SPACING.md,
  },
  gymCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardHeader: {
    position: 'relative',
    height: 200,
  },
  gymImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    justifyContent: 'flex-end',
    padding: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    ...TEXT_STYLES.caption,
    color: '#fff',
    marginLeft: SPACING.xs,
    fontWeight: 'bold',
  },
  reviewsText: {
    ...TEXT_STYLES.small,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: SPACING.xs,
  },
  verifiedChip: {
    backgroundColor: COLORS.success,
    height: 28,
  },
  chipText: {
    ...TEXT_STYLES.small,
    color: '#fff',
  },
  statusIndicator: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  openDot: {
    backgroundColor: COLORS.success,
  },
  closedDot: {
    backgroundColor: COLORS.error,
  },
  statusText: {
    ...TEXT_STYLES.small,
    color: '#fff',
    fontWeight: '500',
  },
  cardContent: {
    padding: SPACING.md,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  gymName: {
    ...TEXT_STYLES.h3,
    flex: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  locationText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
  },
  distanceText: {
    ...TEXT_STYLES.small,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  typeText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: '500',
    marginBottom: SPACING.md,
  },
  facilitiesContainer: {
    marginBottom: SPACING.md,
  },
  sectionLabel: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    marginBottom: SPACING.xs,
    color: COLORS.text,
  },
  facilityChip: {
    backgroundColor: COLORS.background,
    marginRight: SPACING.xs,
    height: 28,
  },
  facilityChipText: {
    ...TEXT_STYLES.small,
    color: COLORS.textSecondary,
  },
  specializationsContainer: {
    marginBottom: SPACING.md,
  },
  specializationTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  specTag: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  specTagText: {
    ...TEXT_STYLES.small,
    color: '#fff',
    fontWeight: '500',
  },
  pricingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    flexWrap: 'wrap',
  },
  priceItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceText: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    marginLeft: SPACING.xs,
    color: COLORS.primary,
  },
  capacityItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  capacityText: {
    ...TEXT_STYLES.small,
    marginLeft: SPACING.xs,
    color: COLORS.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
  },
  contactButton: {
    borderColor: COLORS.primary,
  },
  actionButtonText: {
    ...TEXT_STYLES.small,
    color: COLORS.primary,
  },
  bookButton: {
    elevation: 2,
  },
  bookButtonText: {
    ...TEXT_STYLES.small,
    color: '#fff',
    fontWeight: '600',
  },
  partnershipButton: {
    borderColor: COLORS.success,
  },
  partnershipButtonText: {
    ...TEXT_STYLES.small,
    color: COLORS.success,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  filterModal: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    elevation: 10,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  filterTitle: {
    ...TEXT_STYLES.h3,
    color: '#fff',
  },
  filterContent: {
    padding: SPACING.md,
  },
  filterSectionTitle: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.md,
    color: COLORS.text,
  },
  filterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  filterOption: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    minWidth: (width - (SPACING.md * 2) - (SPACING.sm * 2)) / 3,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedFilterOption: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterOptionText: {
    ...TEXT_STYLES.small,
    color: COLORS.text,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  selectedFilterText: {
    color: COLORS.surface,
    fontWeight: '600',
  },
  filterActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  clearButton: {
    flex: 1,
    borderColor: COLORS.textSecondary,
  },
  applyButton: {
    flex: 2,
    elevation: 2,
  },
  // Empty state styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyTitle: {
    ...TEXT_STYLES.h3,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.xl,
  },
  // FAB styles
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
    elevation: 8,
  },
});

export default GymnasiumDirectory;