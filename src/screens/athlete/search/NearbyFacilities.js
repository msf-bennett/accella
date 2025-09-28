import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  FlatList,
  Alert,
  Animated,
  Dimensions,
  Linking,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  Searchbar,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Portal,
  Modal,
  ProgressBar,
  Badge,
  Switch,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { COLORS, SPACING, TEXT_STYLES } from '../styles/theme';

const { width } = Dimensions.get('window');

const NearbyFacility = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, facilities, loading } = useSelector(state => ({
    user: state.auth.user,
    facilities: state.facilities.list,
    loading: state.facilities.loading,
  }));

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedType, setSelectedType] = useState('All');
  const [selectedRadius, setSelectedRadius] = useState('5km');
  const [priceRange, setPriceRange] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const [bookedFacilities, setBookedFacilities] = useState(new Set());
  const [sortBy, setSortBy] = useState('distance'); // 'distance', 'rating', 'price'
  const [userLocation, setUserLocation] = useState(null);
  const [locationEnabled, setLocationEnabled] = useState(false);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Mock data for nearby facilities
  const [facilitiesData, setFacilitiesData] = useState([
    {
      id: '1',
      name: 'FitZone Westlands',
      type: 'Gym',
      category: 'Fitness Center',
      location: 'Westlands, Nairobi',
      distance: '1.2 km',
      rating: 4.6,
      reviews: 234,
      phone: '+254 712 345 678',
      website: 'www.fitzone.co.ke',
      description: 'Modern fitness center with state-of-the-art equipment',
      image: require('../assets/gym-fitzone.jpg'),
      amenities: ['Cardio Equipment', 'Weight Training', 'Group Classes', 'Locker Rooms', 'Parking'],
      sports: ['Fitness', 'Strength Training', 'Cardio'],
      priceRange: 'Mid-Range',
      hourlyRate: 'KES 500/hour',
      dailyPass: 'KES 1,500',
      monthlyRate: 'KES 8,000',
      openHours: '5:00 AM - 11:00 PM',
      peakHours: '6:00 AM - 9:00 AM, 5:00 PM - 8:00 PM',
      availability: 85,
      verified: true,
      hasParking: true,
      hasShowers: true,
      hasLounge: true,
      coordinates: { lat: -1.2638, lng: 36.7970 },
      bookingAvailable: true,
      instantBooking: true,
    },
    {
      id: '2',
      name: 'Kasarani Sports Complex',
      type: 'Sports Complex',
      category: 'Multi-Sport Facility',
      location: 'Kasarani, Nairobi',
      distance: '8.5 km',
      rating: 4.3,
      reviews: 456,
      phone: '+254 722 987 654',
      website: 'www.kasaranisports.co.ke',
      description: 'Large sports complex with multiple courts and fields',
      amenities: ['Football Field', 'Basketball Courts', 'Swimming Pool', 'Tennis Courts', 'Athletics Track'],
      sports: ['Football', 'Basketball', 'Swimming', 'Tennis', 'Athletics'],
      priceRange: 'Budget-Friendly',
      hourlyRate: 'KES 300/hour',
      dailyPass: 'KES 1,000',
      monthlyRate: 'KES 5,000',
      openHours: '6:00 AM - 10:00 PM',
      peakHours: '4:00 PM - 8:00 PM',
      availability: 65,
      verified: true,
      hasParking: true,
      hasShowers: true,
      hasLounge: false,
      coordinates: { lat: -1.2190, lng: 36.8906 },
      bookingAvailable: true,
      instantBooking: false,
    },
    {
      id: '3',
      name: 'Aqua Life Swimming Pool',
      type: 'Swimming Pool',
      category: 'Aquatic Center',
      location: 'Kilimani, Nairobi',
      distance: '3.8 km',
      rating: 4.8,
      reviews: 128,
      phone: '+254 733 456 789',
      website: 'www.aqualife.co.ke',
      description: 'Olympic-size swimming pool with professional coaching',
      amenities: ['Olympic Pool', 'Kids Pool', 'Sauna', 'Changing Rooms', 'Pool Bar'],
      sports: ['Swimming', 'Water Polo', 'Aqua Aerobics'],
      priceRange: 'Premium',
      hourlyRate: 'KES 800/hour',
      dailyPass: 'KES 2,500',
      monthlyRate: 'KES 15,000',
      openHours: '5:30 AM - 10:30 PM',
      peakHours: '6:00 AM - 8:00 AM, 6:00 PM - 9:00 PM',
      availability: 92,
      verified: true,
      hasParking: true,
      hasShowers: true,
      hasLounge: true,
      coordinates: { lat: -1.2872, lng: 36.7856 },
      bookingAvailable: true,
      instantBooking: true,
    },
    {
      id: '4',
      name: 'Karen Tennis Club',
      type: 'Tennis Court',
      category: 'Racquet Sports',
      location: 'Karen, Nairobi',
      distance: '12.3 km',
      rating: 4.5,
      reviews: 89,
      phone: '+254 744 321 987',
      website: 'www.karentennisclub.co.ke',
      description: 'Exclusive tennis club with clay and hard courts',
      amenities: ['Clay Courts', 'Hard Courts', 'Pro Shop', 'Restaurant', 'Coaching'],
      sports: ['Tennis', 'Badminton'],
      priceRange: 'Premium',
      hourlyRate: 'KES 1,200/hour',
      dailyPass: 'KES 3,000',
      monthlyRate: 'KES 25,000',
      openHours: '6:00 AM - 9:00 PM',
      peakHours: '7:00 AM - 10:00 AM, 5:00 PM - 8:00 PM',
      availability: 78,
      verified: true,
      hasParking: true,
      hasShowers: true,
      hasLounge: true,
      coordinates: { lat: -1.3319, lng: 36.7073 },
      bookingAvailable: true,
      instantBooking: false,
    },
    {
      id: '5',
      name: 'CBD Basketball Courts',
      type: 'Basketball Court',
      category: 'Court Sports',
      location: 'CBD, Nairobi',
      distance: '6.1 km',
      rating: 4.1,
      reviews: 167,
      phone: '+254 755 678 901',
      description: 'Outdoor basketball courts in the city center',
      amenities: ['Outdoor Courts', 'Floodlights', 'Seating', 'Water Points'],
      sports: ['Basketball', 'Streetball'],
      priceRange: 'Budget-Friendly',
      hourlyRate: 'KES 200/hour',
      dailyPass: 'KES 800',
      monthlyRate: 'KES 3,000',
      openHours: '6:00 AM - 11:00 PM',
      peakHours: '5:00 PM - 9:00 PM',
      availability: 45,
      verified: false,
      hasParking: false,
      hasShowers: false,
      hasLounge: false,
      coordinates: { lat: -1.2864, lng: 36.8172 },
      bookingAvailable: true,
      instantBooking: true,
    },
  ]);

  const facilityTypes = ['All', 'Gym', 'Swimming Pool', 'Tennis Court', 'Basketball Court', 'Sports Complex', 'Football Field'];
  const radiusOptions = ['2km', '5km', '10km', '20km', 'All'];
  const priceRanges = ['All', 'Budget-Friendly', 'Mid-Range', 'Premium'];

  useEffect(() => {
    // Entrance animation
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

    // Request location permission and load facilities
    requestLocationPermission();
    loadFacilities();
  }, []);

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to location to find nearby facilities',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setLocationEnabled(true);
          // Get user location here
        }
      } else {
        setLocationEnabled(true);
      }
    } catch (err) {
      console.warn('Location permission error:', err);
    }
  };

  const loadFacilities = useCallback(async () => {
    try {
      // Simulate API call
      // dispatch(fetchNearbyFacilities());
    } catch (error) {
      console.error('Error loading facilities:', error);
    }
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFacilities();
    setRefreshing(false);
  }, [loadFacilities]);

  const filteredFacilities = facilitiesData.filter(facility => {
    const matchesSearch = facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         facility.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         facility.sports.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedType === 'All' || facility.type === selectedType;
    const matchesPriceRange = priceRange === 'All' || facility.priceRange === priceRange;
    const matchesRadius = selectedRadius === 'All' || 
                         parseFloat(facility.distance) <= parseFloat(selectedRadius);
    
    return matchesSearch && matchesType && matchesPriceRange && matchesRadius;
  });

  // Sort filtered facilities
  const sortedFacilities = [...filteredFacilities].sort((a, b) => {
    switch (sortBy) {
      case 'distance':
        return parseFloat(a.distance) - parseFloat(b.distance);
      case 'rating':
        return b.rating - a.rating;
      case 'price':
        const priceOrder = { 'Budget-Friendly': 1, 'Mid-Range': 2, 'Premium': 3 };
        return priceOrder[a.priceRange] - priceOrder[b.priceRange];
      default:
        return 0;
    }
  });

  const toggleFavorite = useCallback((facilityId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(facilityId)) {
        newFavorites.delete(facilityId);
      } else {
        newFavorites.add(facilityId);
      }
      return newFavorites;
    });
  }, []);

  const bookFacility = useCallback((facility) => {
    if (facility.instantBooking) {
      Alert.alert(
        'Quick Booking',
        `Book ${facility.name} for today?\n\nRate: ${facility.hourlyRate}`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Book Now',
            onPress: () => {
              setBookedFacilities(prev => new Set([...prev, facility.id]));
              Alert.alert('Success', 'Facility booked successfully! Check your bookings for details.');
            },
          },
        ]
      );
    } else {
      navigation.navigate('BookingScreen', { facility });
    }
  }, [navigation]);

  const callFacility = useCallback((phone) => {
    const phoneUrl = `tel:${phone}`;
    Linking.canOpenURL(phoneUrl).then(supported => {
      if (supported) {
        Linking.openURL(phoneUrl);
      } else {
        Alert.alert('Error', 'Unable to make phone call');
      }
    });
  }, []);

  const getDirections = useCallback((facility) => {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(facility.location)}`;
    Linking.canOpenURL(mapsUrl).then(supported => {
      if (supported) {
        Linking.openURL(mapsUrl);
      } else {
        Alert.alert('Error', 'Unable to open maps');
      }
    });
  }, []);

  const getAvailabilityColor = (availability) => {
    if (availability > 70) return COLORS.success;
    if (availability > 40) return '#FFA500';
    return COLORS.error;
  };

  const renderFacilityCard = ({ item, index }) => (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 50],
                outputRange: [0, 50],
              }),
            },
          ],
        },
      ]}
    >
      <Card style={styles.facilityCard} elevation={4}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.cardHeader}
        >
          <View style={styles.headerContent}>
            <View style={styles.facilityInfo}>
              <View style={styles.facilityTitleRow}>
                <Text style={styles.facilityName}>{item.name}</Text>
                {item.verified && (
                  <Icon name="verified" size={18} color="white" style={styles.verifiedIcon} />
                )}
                {item.instantBooking && (
                  <View style={styles.instantBadge}>
                    <Icon name="flash-on" size={14} color="white" />
                  </View>
                )}
              </View>
              <Text style={styles.facilityType}>{item.type} • {item.priceRange}</Text>
              <View style={styles.ratingDistanceRow}>
                <View style={styles.ratingContainer}>
                  <Icon name="star" size={14} color="#FFD700" />
                  <Text style={styles.rating}>{item.rating}</Text>
                  <Text style={styles.reviews}>({item.reviews})</Text>
                </View>
                <View style={styles.distanceContainer}>
                  <Icon name="near-me" size={14} color="white" />
                  <Text style={styles.distance}>{item.distance}</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => toggleFavorite(item.id)}
              style={styles.favoriteButton}
            >
              <Icon
                name={favorites.has(item.id) ? 'favorite' : 'favorite-border'}
                size={22}
                color={favorites.has(item.id) ? COLORS.error : 'white'}
              />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <Card.Content style={styles.cardContent}>
          <View style={styles.facilityDetails}>
            <View style={styles.detailRow}>
              <Icon name="location-on" size={16} color={COLORS.primary} />
              <Text style={styles.detailText}>{item.location}</Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="access-time" size={16} color={COLORS.primary} />
              <Text style={styles.detailText}>{item.openHours}</Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="payments" size={16} color={COLORS.primary} />
              <Text style={styles.detailText}>{item.hourlyRate}</Text>
            </View>
          </View>

          <View style={styles.availabilityContainer}>
            <Text style={styles.availabilityText}>Current Availability</Text>
            <View style={styles.availabilityBar}>
              <ProgressBar
                progress={item.availability / 100}
                color={getAvailabilityColor(item.availability)}
                style={styles.progressBar}
              />
              <Text style={[styles.availabilityPercent, { color: getAvailabilityColor(item.availability) }]}>
                {item.availability}%
              </Text>
            </View>
          </View>

          <View style={styles.amenitiesContainer}>
            <Text style={styles.amenitiesTitle}>Amenities:</Text>
            <View style={styles.amenitiesGrid}>
              {item.amenities.slice(0, 4).map((amenity, amenityIndex) => (
                <View key={amenityIndex} style={styles.amenityItem}>
                  <Icon name="check-circle" size={12} color={COLORS.success} />
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
              {item.amenities.length > 4 && (
                <Text style={styles.moreAmenities}>+{item.amenities.length - 4} more</Text>
              )}
            </View>
          </View>

          <View style={styles.sportsContainer}>
            {item.sports.slice(0, 3).map((sport, sportIndex) => (
              <Chip
                key={sportIndex}
                mode="outlined"
                compact
                style={styles.sportChip}
                textStyle={styles.sportText}
              >
                {sport}
              </Chip>
            ))}
          </View>

          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.quickAction, styles.callAction]}
              onPress={() => callFacility(item.phone)}
            >
              <Icon name="phone" size={16} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.quickAction, styles.directionsAction]}
              onPress={() => getDirections(item)}
            >
              <Icon name="directions" size={16} color="white" />
            </TouchableOpacity>
            
            <Button
              mode="contained"
              onPress={() => bookFacility(item)}
              style={[
                styles.bookButton,
                bookedFacilities.has(item.id) && styles.bookedButton
              ]}
              labelStyle={styles.bookButtonText}
              disabled={bookedFacilities.has(item.id)}
              compact
            >
              {bookedFacilities.has(item.id) ? 'Booked ✓' : item.instantBooking ? 'Quick Book' : 'Book Now'}
            </Button>
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderFilterChip = (items, selected, onSelect) => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.filterScrollView}
      contentContainerStyle={styles.filterScrollContent}
    >
      {items.map((item) => (
        <Chip
          key={item}
          mode={selected === item ? 'flat' : 'outlined'}
          selected={selected === item}
          onPress={() => onSelect(item)}
          style={[
            styles.filterChip,
            selected === item && styles.selectedFilterChip
          ]}
          textStyle={[
            styles.filterChipText,
            selected === item && styles.selectedFilterChipText
          ]}
        >
          {item}
        </Chip>
      ))}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View style={styles.welcomeContainer}>
            <Text style={styles.headerTitle}>Nearby Facilities</Text>
            <Text style={styles.headerSubtitle}>Find sports facilities around you 🏟️</Text>
          </View>
          <View style={styles.headerActions}>
            <IconButton
              icon={locationEnabled ? 'my-location' : 'location-disabled'}
              iconColor={locationEnabled ? '#4CAF50' : 'rgba(255,255,255,0.6)'}
              size={20}
              onPress={() => requestLocationPermission()}
            />
            <Avatar.Image
              size={40}
              source={{ uri: user?.avatar || 'https://via.placeholder.com/40' }}
              style={styles.avatar}
            />
          </View>
        </View>

        <Searchbar
          placeholder="Search facilities, sports..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor={COLORS.primary}
        />

        <View style={styles.sortAndFilter}>
          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => {
              const sortOptions = ['distance', 'rating', 'price'];
              const currentIndex = sortOptions.indexOf(sortBy);
              const nextIndex = (currentIndex + 1) % sortOptions.length;
              setSortBy(sortOptions[nextIndex]);
            }}
          >
            <Icon name="sort" size={16} color="white" />
            <Text style={styles.sortText}>
              Sort: {sortBy === 'distance' ? 'Distance' : sortBy === 'rating' ? 'Rating' : 'Price'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterToggle}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Icon name="filter-list" size={16} color="white" />
            <Text style={styles.filterToggleText}>Filters</Text>
            <Icon
              name={showFilters ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
              size={16}
              color="white"
            />
          </TouchableOpacity>
        </View>

        {showFilters && (
          <Animated.View style={styles.filtersContainer}>
            <Text style={styles.filterSectionTitle}>Facility Type</Text>
            {renderFilterChip(facilityTypes, selectedType, setSelectedType)}
            
            <Text style={styles.filterSectionTitle}>Distance</Text>
            {renderFilterChip(radiusOptions, selectedRadius, setSelectedRadius)}
            
            <Text style={styles.filterSectionTitle}>Price Range</Text>
            {renderFilterChip(priceRanges, priceRange, setPriceRange)}
          </Animated.View>
        )}
      </LinearGradient>

      <View style={styles.statsContainer}>
        <Surface style={styles.statCard} elevation={2}>
          <Text style={styles.statNumber}>{sortedFacilities.length}</Text>
          <Text style={styles.statLabel}>Nearby</Text>
        </Surface>
        <Surface style={styles.statCard} elevation={2}>
          <Text style={styles.statNumber}>{favorites.size}</Text>
          <Text style={styles.statLabel}>Favorites</Text>
        </Surface>
        <Surface style={styles.statCard} elevation={2}>
          <Text style={styles.statNumber}>{bookedFacilities.size}</Text>
          <Text style={styles.statLabel}>Booked</Text>
        </Surface>
        <Surface style={styles.statCard} elevation={2}>
          <Text style={styles.statNumber}>
            {sortedFacilities.filter(f => f.instantBooking).length}
          </Text>
          <Text style={styles.statLabel}>Quick Book</Text>
        </Surface>
      </View>

      {sortedFacilities.length > 0 ? (
        <FlatList
          data={sortedFacilities}
          renderItem={renderFacilityCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="place" size={80} color={COLORS.primary} />
          <Text style={styles.emptyTitle}>No facilities found</Text>
          <Text style={styles.emptySubtitle}>
            Try adjusting your search radius or filters
          </Text>
          <Button
            mode="outlined"
            onPress={() => {
              setSelectedRadius('20km');
              setSelectedType('All');
              setPriceRange('All');
            }}
            style={styles.expandSearchButton}
          >
            Expand Search Area
          </Button>
        </View>
      )}

      <FAB
        icon={showMap ? 'list' : 'map'}
        style={styles.fab}
        onPress={() => {
          setShowMap(!showMap);
          Alert.alert('Info', showMap ? 'Switching to list view' : 'Map view coming soon!');
        }}
        color="white"
        label={showMap ? 'List View' : 'Map View'}
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
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  welcomeContainer: {
    flex: 1,
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: 'white',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: SPACING.xs,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    borderWidth: 2,
    borderColor: 'white',
    marginLeft: SPACING.sm,
  },
  searchBar: {
    marginVertical: SPACING.md,
    backgroundColor: 'white',
    borderRadius: 25,
    elevation: 4,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  sortAndFilter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
    flex: 1,
    marginRight: SPACING.sm,
  },
  sortText: {
    color: 'white',
    marginLeft: SPACING.sm,
    ...TEXT_STYLES.body,
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
  },
  filterToggleText: {
    color: 'white',
    marginHorizontal: SPACING.sm,
    ...TEXT_STYLES.body,
  },
  filtersContainer: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterSectionTitle: {
    color: 'white',
    ...TEXT_STYLES.subtitle,
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
  },
  filterScrollView: {
    marginBottom: SPACING.sm,
  },
  filterScrollContent: {
    paddingRight: SPACING.lg,
  },
  filterChip: {
    marginRight: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  selectedFilterChip: {
    backgroundColor: 'white',
  },
  filterChipText: {
    color: 'white',
  },
  selectedFilterChipText: {
    color: COLORS.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  statCard: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderRadius: 12,
    backgroundColor: 'white',
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  statNumber: {
    ...TEXT_STYLES.h3,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
  listContainer: {
    padding: SPACING.lg,
  },
  cardContainer: {
    marginBottom: SPACING.lg,
  },
  facilityCard: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  cardHeader: {
    padding: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  facilityInfo: {
    flex: 1,
  },
  facilityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  facilityName: {
    ...TEXT_STYLES.h3,
    color: 'white',
    fontWeight: 'bold',
    flex: 1,
  },
  verifiedIcon: {
    marginLeft: SPACING.sm,
  },
  instantBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: SPACING.xs,
    marginLeft: SPACING.sm,
  },
  facilityType: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: SPACING.xs,
  },
  ratingDistanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    ...TEXT_STYLES.body,
    color: 'white',
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  reviews: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: SPACING.xs,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distance: {
    ...TEXT_STYLES.body,
    color: 'white',
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  favoriteButton: {
    padding: SPACING.xs,
  },
  cardContent: {
    padding: SPACING.md,
  },
  facilityDetails: {
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  detailText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.sm,
    color: COLORS.text.primary,
    flex: 1,
  },
  availabilityContainer: {
    marginBottom: SPACING.md,
  },
  availabilityText: {
    ...TEXT_STYLES.caption,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  availabilityBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.background,
  },
  availabilityPercent: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    marginLeft: SPACING.sm,
    minWidth: 30,
  },
  amenitiesContainer: {
    marginBottom: SPACING.md,
  },
  amenitiesTitle: {
    ...TEXT_STYLES.caption,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
    marginBottom: SPACING.xs,
  },
  amenityText: {
    ...TEXT_STYLES.caption,
    color: COLORS.text.primary,
    marginLeft: SPACING.xs,
  },
  moreAmenities: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: '600',
  },
  sportsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  sportChip: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
    backgroundColor: 'transparent',
  },
  sportText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
  },
  description: {
    ...TEXT_STYLES.body,
    color: COLORS.text.secondary,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  quickActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quickAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  callAction: {
    backgroundColor: COLORS.success,
  },
  directionsAction: {
    backgroundColor: '#2196F3',
  },
  bookButton: {
    flex: 1,
    borderRadius: 20,
  },
  bookedButton: {
    backgroundColor: COLORS.success,
  },
  bookButtonText: {
    ...TEXT_STYLES.button,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.text.primary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  expandSearchButton: {
    borderRadius: 25,
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.lg,
    backgroundColor: COLORS.primary,
  },
});

export default NearbyFacilities;