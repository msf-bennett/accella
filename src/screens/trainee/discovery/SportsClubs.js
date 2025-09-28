import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Animated,
  Vibration,
  Alert,
  Dimensions,
  FlatList,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  Surface,
  Searchbar,
  Portal,
  Modal,
  FAB,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from 'expo-blur';

// Import your design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const SportsClubs = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector(state => state.auth);
  const { clubs, favoriteClubs } = useSelector(state => state.discovery);

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('nearby');
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // list or map
  const [sortBy, setSortBy] = useState('distance');

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fabAnim = useRef(new Animated.Value(1)).current;

  // Sports categories
  const sportsCategories = [
    { id: 'all', label: '🏆 All Sports', color: COLORS.primary },
    { id: 'football', label: '⚽ Football', color: '#4CAF50' },
    { id: 'basketball', label: '🏀 Basketball', color: '#FF9800' },
    { id: 'tennis', label: '🎾 Tennis', color: '#FFEB3B' },
    { id: 'swimming', label: '🏊 Swimming', color: '#2196F3' },
    { id: 'volleyball', label: '🏐 Volleyball', color: '#9C27B0' },
    { id: 'badminton', label: '🏸 Badminton', color: '#795548' },
    { id: 'cricket', label: '🏏 Cricket', color: '#607D8B' },
    { id: 'rugby', label: '🏈 Rugby', color: '#FF5722' },
    { id: 'athletics', label: '🏃 Athletics', color: '#E91E63' },
    { id: 'gym', label: '🏋️ Gym & Fitness', color: '#673AB7' },
    { id: 'martial_arts', label: '🥋 Martial Arts', color: '#3F51B5' },
  ];

  // Location options
  const locationOptions = [
    { id: 'nearby', label: '📍 Nearby (5km)', icon: 'my-location' },
    { id: 'city', label: '🏙️ City Center', icon: 'location-city' },
    { id: 'all', label: '🌍 All Locations', icon: 'public' },
  ];

  // Sort options
  const sortOptions = [
    { id: 'distance', label: 'Distance', icon: 'near-me' },
    { id: 'rating', label: 'Rating', icon: 'star' },
    { id: 'price', label: 'Price', icon: 'attach-money' },
    { id: 'popularity', label: 'Popularity', icon: 'trending-up' },
  ];

  // Sample sports clubs data
  const sampleClubs = [
    {
      id: '1',
      name: 'Elite Sports Academy',
      sports: ['football', 'basketball', 'tennis'],
      rating: 4.8,
      reviews: 234,
      distance: '1.2 km',
      price: 'KES 3,500/month',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
      address: 'Westlands, Nairobi',
      phone: '+254 700 123 456',
      facilities: ['Indoor courts', 'Swimming pool', 'Gym', 'Parking'],
      coaches: 12,
      members: 450,
      established: '2015',
      isOpen: true,
      openHours: '6:00 AM - 10:00 PM',
      featured: true,
      programs: [
        { name: 'Youth Development', age: '8-16 years', price: 'KES 2,500' },
        { name: 'Adult Training', age: '17+ years', price: 'KES 3,500' },
        { name: 'Professional Coaching', age: 'All ages', price: 'KES 5,000' }
      ]
    },
    {
      id: '2',
      name: 'Champions Tennis Club',
      sports: ['tennis'],
      rating: 4.9,
      reviews: 189,
      distance: '2.1 km',
      price: 'KES 4,200/month',
      image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400',
      address: 'Karen, Nairobi',
      phone: '+254 700 234 567',
      facilities: ['8 Tennis courts', 'Pro shop', 'Restaurant', 'Lockers'],
      coaches: 8,
      members: 280,
      established: '2010',
      isOpen: true,
      openHours: '6:30 AM - 9:00 PM',
      featured: false,
      programs: [
        { name: 'Junior Tennis', age: '6-17 years', price: 'KES 3,000' },
        { name: 'Adult Lessons', age: '18+ years', price: 'KES 4,200' },
        { name: 'Tournament Training', age: 'All ages', price: 'KES 6,000' }
      ]
    },
    {
      id: '3',
      name: 'AquaFit Swimming Center',
      sports: ['swimming'],
      rating: 4.7,
      reviews: 156,
      distance: '3.5 km',
      price: 'KES 2,800/month',
      image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400',
      address: 'Kileleshwa, Nairobi',
      phone: '+254 700 345 678',
      facilities: ['Olympic pool', 'Kids pool', 'Sauna', 'Changing rooms'],
      coaches: 6,
      members: 320,
      established: '2018',
      isOpen: true,
      openHours: '5:30 AM - 9:30 PM',
      featured: true,
      programs: [
        { name: 'Learn to Swim', age: '4+ years', price: 'KES 2,000' },
        { name: 'Competitive Swimming', age: '8+ years', price: 'KES 3,500' },
        { name: 'Aqua Fitness', age: 'All ages', price: 'KES 2,800' }
      ]
    },
    {
      id: '4',
      name: 'Fitness Plus Gym',
      sports: ['gym'],
      rating: 4.6,
      reviews: 298,
      distance: '0.8 km',
      price: 'KES 3,000/month',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
      address: 'Kilimani, Nairobi',
      phone: '+254 700 456 789',
      facilities: ['Modern equipment', 'Group classes', 'Personal training', 'Steam room'],
      coaches: 15,
      members: 680,
      established: '2012',
      isOpen: true,
      openHours: '24/7',
      featured: false,
      programs: [
        { name: 'Basic Membership', age: '16+ years', price: 'KES 2,500' },
        { name: 'Premium Access', age: '16+ years', price: 'KES 3,000' },
        { name: 'Personal Training', age: '16+ years', price: 'KES 4,500' }
      ]
    },
    {
      id: '5',
      name: 'Riverside Basketball Academy',
      sports: ['basketball'],
      rating: 4.8,
      reviews: 167,
      distance: '2.8 km',
      price: 'KES 3,200/month',
      image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400',
      address: 'Riverside, Nairobi',
      phone: '+254 700 567 890',
      facilities: ['Indoor courts', 'Outdoor courts', 'Equipment room', 'Spectator area'],
      coaches: 10,
      members: 240,
      established: '2016',
      isOpen: true,
      openHours: '6:00 AM - 10:00 PM',
      featured: true,
      programs: [
        { name: 'Youth League', age: '10-17 years', price: 'KES 2,800' },
        { name: 'Adult Training', age: '18+ years', price: 'KES 3,200' },
        { name: 'Elite Development', age: '14+ years', price: 'KES 4,800' }
      ]
    }
  ];

  // Animation effects
  useEffect(() => {
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
  }, []);

  // Handlers
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleSportSelect = (sportId) => {
    setSelectedSport(sportId);
    Vibration.vibrate(50);
  };

  const handleLocationSelect = (locationId) => {
    setSelectedLocation(locationId);
    Vibration.vibrate(50);
  };

  const handleClubPress = (club) => {
    Vibration.vibrate(50);
    Alert.alert(
      'Feature Coming Soon! 🚀',
      'Club details and booking functionality is currently under development.',
      [{ text: 'OK' }]
    );
  };

  const handleFavoriteToggle = (clubId) => {
    Vibration.vibrate(30);
    // Toggle favorite logic would go here
  };

  const handleCallClub = (phone) => {
    Alert.alert(
      'Call Club',
      `Would you like to call ${phone}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => {
          Alert.alert('Feature Coming Soon!', 'Phone calling functionality will be available soon.');
        }}
      ]
    );
  };

  const handleDirections = (address) => {
    Alert.alert(
      'Get Directions',
      `Navigate to ${address}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Navigate', onPress: () => {
          Alert.alert('Feature Coming Soon!', 'Maps integration will be available soon.');
        }}
      ]
    );
  };

  const handleBookTrial = (club) => {
    Alert.alert(
      'Book Trial Session',
      `Book a trial session at ${club.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Book', onPress: () => {
          Alert.alert('Success! 🎉', 'Trial session booking request sent. The club will contact you soon.');
        }}
      ]
    );
  };

  const filteredClubs = sampleClubs.filter(club => {
    const matchesSearch = club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         club.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport = selectedSport === 'all' || club.sports.includes(selectedSport);
    return matchesSearch && matchesSport;
  });

  const renderSportChip = (sport) => (
    <Chip
      key={sport.id}
      selected={selectedSport === sport.id}
      onPress={() => handleSportSelect(sport.id)}
      style={[
        styles.chip,
        selectedSport === sport.id && { backgroundColor: sport.color }
      ]}
      textStyle={[
        selectedSport === sport.id && { color: '#FFFFFF' }
      ]}
    >
      {sport.label}
    </Chip>
  );

  const renderClubCard = (club) => (
    <TouchableOpacity
      key={club.id}
      onPress={() => handleClubPress(club)}
      style={styles.clubCardWrapper}
    >
      <Card style={[styles.clubCard, club.featured && styles.featuredCard]}>
        {club.featured && (
          <View style={styles.featuredBadge}>
            <Icon name="star" size={16} color="#FFFFFF" />
            <Text style={[TEXT_STYLES.caption, { color: '#FFFFFF', marginLeft: SPACING.xs }]}>
              Featured
            </Text>
          </View>
        )}

        <LinearGradient
          colors={['#FFFFFF', '#F8F9FA']}
          style={styles.clubCardContent}
        >
          {/* Club Image and Basic Info */}
          <View style={styles.clubHeader}>
            <Avatar.Image 
              size={60} 
              source={{ uri: club.image }} 
            />
            <View style={styles.clubBasicInfo}>
              <Text style={[TEXT_STYLES.h3, { flex: 1 }]}>{club.name}</Text>
              <View style={styles.ratingContainer}>
                <Icon name="star" size={16} color="#FFD700" />
                <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs }]}>
                  {club.rating} ({club.reviews} reviews)
                </Text>
              </View>
              <View style={styles.statusContainer}>
                <View style={[styles.statusDot, { backgroundColor: club.isOpen ? '#4CAF50' : '#F44336' }]} />
                <Text style={[TEXT_STYLES.caption, { color: club.isOpen ? '#4CAF50' : '#F44336' }]}>
                  {club.isOpen ? 'Open Now' : 'Closed'}
                </Text>
              </View>
            </View>
            <IconButton
              icon={favoriteClubs?.includes(club.id) ? 'favorite' : 'favorite-border'}
              iconColor={favoriteClubs?.includes(club.id) ? '#E91E63' : '#666'}
              onPress={() => handleFavoriteToggle(club.id)}
            />
          </View>

          {/* Sports offered */}
          <View style={styles.sportsContainer}>
            {club.sports.map(sportId => {
              const sport = sportsCategories.find(s => s.id === sportId);
              return sport ? (
                <Chip
                  key={sportId}
                  style={[styles.sportChip, { backgroundColor: `${sport.color}20` }]}
                  textStyle={{ color: sport.color, fontSize: 12 }}
                >
                  {sport.label}
                </Chip>
              ) : null;
            })}
          </View>

          {/* Club Details */}
          <View style={styles.clubDetails}>
            <View style={styles.detailRow}>
              <Icon name="location-on" size={16} color="#666" />
              <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs, flex: 1 }]}>
                {club.address} • {club.distance}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="schedule" size={16} color="#666" />
              <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs }]}>
                {club.openHours}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="people" size={16} color="#666" />
              <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs }]}>
                {club.members} members • {club.coaches} coaches
              </Text>
            </View>
          </View>

          {/* Facilities */}
          <View style={styles.facilitiesContainer}>
            <Text style={[TEXT_STYLES.body, { fontWeight: 'bold', marginBottom: SPACING.xs }]}>
              Facilities:
            </Text>
            <View style={styles.facilitiesList}>
              {club.facilities.slice(0, 4).map((facility, index) => (
                <View key={index} style={styles.facilityItem}>
                  <Icon name="check-circle" size={14} color="#4CAF50" />
                  <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs }]}>
                    {facility}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Price and Actions */}
          <View style={styles.clubFooter}>
            <View>
              <Text style={[TEXT_STYLES.caption, { color: '#666' }]}>Starting from</Text>
              <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>
                {club.price}
              </Text>
            </View>
            <View style={styles.actionButtons}>
              <Button
                mode="outlined"
                onPress={() => handleCallClub(club.phone)}
                style={styles.actionButton}
                contentStyle={styles.actionButtonContent}
                icon="phone"
              >
                Call
              </Button>
              <Button
                mode="contained"
                onPress={() => handleBookTrial(club)}
                style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
                contentStyle={styles.actionButtonContent}
                labelStyle={{ color: '#FFFFFF' }}
              >
                Trial
              </Button>
            </View>
          </View>
        </LinearGradient>
      </Card>
    </TouchableOpacity>
  );

  const renderFilterModal = () => (
    <Portal>
      <Modal
        visible={showFilters}
        onDismiss={() => setShowFilters(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <View style={styles.modalHeader}>
          <Text style={TEXT_STYLES.h2}>Filter Clubs</Text>
          <IconButton
            icon="close"
            onPress={() => setShowFilters(false)}
          />
        </View>

        <ScrollView style={styles.modalContent}>
          <Text style={[TEXT_STYLES.h3, styles.filterSectionTitle]}>Location</Text>
          {locationOptions.map(location => (
            <TouchableOpacity
              key={location.id}
              style={[
                styles.filterOption,
                selectedLocation === location.id && styles.selectedFilterOption
              ]}
              onPress={() => handleLocationSelect(location.id)}
            >
              <Icon 
                name={location.icon} 
                size={20} 
                color={selectedLocation === location.id ? COLORS.primary : '#666'} 
              />
              <Text style={[
                TEXT_STYLES.body,
                { marginLeft: SPACING.md },
                selectedLocation === location.id && { color: COLORS.primary }
              ]}>
                {location.label}
              </Text>
            </TouchableOpacity>
          ))}

          <Text style={[TEXT_STYLES.h3, styles.filterSectionTitle]}>Sort By</Text>
          {sortOptions.map(sort => (
            <TouchableOpacity
              key={sort.id}
              style={[
                styles.filterOption,
                sortBy === sort.id && styles.selectedFilterOption
              ]}
              onPress={() => setSortBy(sort.id)}
            >
              <Icon 
                name={sort.icon} 
                size={20} 
                color={sortBy === sort.id ? COLORS.primary : '#666'} 
              />
              <Text style={[
                TEXT_STYLES.body,
                { marginLeft: SPACING.md },
                sortBy === sort.id && { color: COLORS.primary }
              ]}>
                {sort.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Button
          mode="contained"
          onPress={() => setShowFilters(false)}
          style={styles.applyButton}
        >
          Apply Filters
        </Button>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <IconButton
            icon="arrow-back"
            iconColor="#FFFFFF"
            size={24}
            onPress={() => navigation.goBack()}
          />
          <Text style={[TEXT_STYLES.h2, { color: '#FFFFFF', flex: 1, textAlign: 'center' }]}>
            Sports Clubs & Academies 🏆
          </Text>
          <IconButton
            icon={viewMode === 'list' ? 'map' : 'view-list'}
            iconColor="#FFFFFF"
            size={24}
            onPress={() => {
              setViewMode(viewMode === 'list' ? 'map' : 'list');
              Alert.alert('Feature Coming Soon!', 'Map view will be available in the next update.');
            }}
          />
        </View>

        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search clubs, sports, locations..."
            onChangeText={handleSearch}
            value={searchQuery}
            style={styles.searchBar}
            iconColor={COLORS.primary}
            inputStyle={TEXT_STYLES.body}
          />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Sports Filter */}
        <Animated.View 
          style={[
            styles.sportsFilter,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsContainer}
          >
            {sportsCategories.map(renderSportChip)}
          </ScrollView>
        </Animated.View>

        {/* Results Summary */}
        <View style={styles.resultsHeader}>
          <Text style={[TEXT_STYLES.h3, styles.resultsTitle]}>
            {filteredClubs.length} clubs found near you 📍
          </Text>
          <TouchableOpacity 
            onPress={() => setShowFilters(true)}
            style={styles.filterButton}
          >
            <Icon name="tune" size={20} color={COLORS.primary} />
            <Text style={[TEXT_STYLES.body, { color: COLORS.primary, marginLeft: SPACING.xs }]}>
              Filters
            </Text>
          </TouchableOpacity>
        </View>

        {/* Featured Clubs Section */}
        <View style={styles.section}>
          <Text style={[TEXT_STYLES.h2, styles.sectionTitle]}>
            ⭐ Featured Clubs
          </Text>
          {sampleClubs
            .filter(club => club.featured)
            .map(renderClubCard)
          }
        </View>

        {/* All Clubs Section */}
        <View style={styles.section}>
          <Text style={[TEXT_STYLES.h2, styles.sectionTitle]}>
            All Clubs & Academies
          </Text>
          {filteredClubs.map(renderClubCard)}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <Animated.View style={[styles.fabContainer, { opacity: fabAnim }]}>
        <FAB
          icon="add"
          style={styles.fab}
          onPress={() => {
            Alert.alert(
              'Add Your Club',
              'Are you a club owner? Register your sports club or academy with us!',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Register', onPress: () => {
                  Alert.alert('Feature Coming Soon!', 'Club registration will be available soon.');
                }}
              ]
            );
          }}
        />
      </Animated.View>

      {renderFilterModal()}
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingBottom: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.md,
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
  },
  searchBar: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  content: {
    flex: 1,
  },
  sportsFilter: {
    paddingVertical: SPACING.md,
  },
  chipsContainer: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  chip: {
    marginRight: SPACING.sm,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  resultsTitle: {
    flex: 1,
    color: '#333',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
    color: '#333',
  },
  clubCardWrapper: {
    marginBottom: SPACING.lg,
  },
  clubCard: {
    elevation: 3,
    borderRadius: 16,
    overflow: 'hidden',
  },
  featuredCard: {
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  featuredBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FFD700',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomLeftRadius: 12,
    zIndex: 1,
  },
  clubCardContent: {
    padding: SPACING.lg,
  },
  clubHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  clubBasicInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.sm,
  },
  sportsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  sportChip: {
    height: 28,
  },
  clubDetails: {
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  facilitiesContainer: {
    marginBottom: SPACING.md,
  },
  facilitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  facilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    width: '48%',
  },
  clubFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    borderRadius: 8,
    minWidth: 80,
  },
  actionButtonContent: {
    height: 36,
  },
  fabContainer: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.lg,
  },
  fab: {
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    margin: SPACING.lg,
    borderRadius: 16,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalContent: {
    padding: SPACING.lg,
  },
  filterSectionTitle: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
    color: '#333',
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.xs,
  },
  selectedFilterOption: {
    backgroundColor: `${COLORS.primary}10`,
  },
  applyButton: {
    margin: SPACING.lg,
    backgroundColor: COLORS.primary,
  },
};

export default SportsClubs;