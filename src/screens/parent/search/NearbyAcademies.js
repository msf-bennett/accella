import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  Linking,
  Share,
  Image,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { 
  Card,
  Chip,
  Button,
  Avatar,
  Badge,
  Searchbar,
  FAB,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../../styles/colors';
import * as Location from 'expo-location';

const NearbyAcademies = ({ navigation, route }) => {
  const [academies, setAcademies] = useState([]);
  const [filteredAcademies, setFilteredAcademies] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSports, setSelectedSports] = useState([]);
  const [sortBy, setSortBy] = useState('distance'); // distance, rating, price
  const [favorites, setFavorites] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [maxDistance, setMaxDistance] = useState(10); // km
  const [priceRange, setPriceRange] = useState([0, 1000]); // price range filter

  // Available sports for filtering
  const availableSports = [
    'Football', 'Basketball', 'Tennis', 'Swimming', 'Athletics',
    'Cricket', 'Volleyball', 'Badminton', 'Hockey', 'Boxing',
    'Martial Arts', 'Gymnastics', 'Dancing', 'Cycling'
  ];

  // Mock data - replace with actual API call
  const mockAcademies = [
    {
      id: '1',
      name: 'Elite Sports Academy',
      sports: ['Football', 'Basketball', 'Tennis'],
      location: {
        latitude: -1.2921,
        longitude: 36.8219,
        address: 'Westlands, Nairobi',
      },
      rating: 4.8,
      reviewCount: 156,
      priceRange: '$50-120/session',
      estimatedPrice: 85,
      phone: '+254712345678',
      email: 'info@elitesports.co.ke',
      website: 'www.elitesports.co.ke',
      image: 'https://via.placeholder.com/300x200',
      facilities: ['Indoor Court', 'Swimming Pool', 'Gym', 'Parking'],
      description: 'Premier sports academy with world-class facilities and experienced coaches.',
      verified: true,
      openHours: '6:00 AM - 10:00 PM',
      ageGroups: ['Kids (5-12)', 'Teens (13-17)', 'Adults (18+)'],
      coaches: 12,
      established: 2015,
    },
    {
      id: '2',
      name: 'Champions Training Center',
      sports: ['Swimming', 'Athletics', 'Gymnastics'],
      location: {
        latitude: -1.3030,
        longitude: 36.8070,
        address: 'Karen, Nairobi',
      },
      rating: 4.6,
      reviewCount: 89,
      priceRange: '$40-100/session',
      estimatedPrice: 70,
      phone: '+254722345679',
      email: 'contact@champions.co.ke',
      website: 'www.champions.co.ke',
      image: 'https://via.placeholder.com/300x200',
      facilities: ['Olympic Pool', 'Track Field', 'Gymnasium', 'Cafe'],
      description: 'Specialized in aquatic sports and athletics with Olympic standard facilities.',
      verified: true,
      openHours: '5:30 AM - 9:30 PM',
      ageGroups: ['Kids (6-14)', 'Teens (15-18)', 'Adults (19+)'],
      coaches: 8,
      established: 2018,
    },
    {
      id: '3',
      name: 'Future Stars Academy',
      sports: ['Football', 'Cricket', 'Hockey'],
      location: {
        latitude: -1.2500,
        longitude: 36.8000,
        address: 'Kilimani, Nairobi',
      },
      rating: 4.4,
      reviewCount: 134,
      priceRange: '$30-80/session',
      estimatedPrice: 55,
      phone: '+254733345680',
      email: 'hello@futurestars.co.ke',
      website: 'www.futurestars.co.ke',
      image: 'https://via.placeholder.com/300x200',
      facilities: ['Football Pitch', 'Cricket Ground', 'Changing Rooms', 'Cafeteria'],
      description: 'Nurturing young talent in team sports with professional coaching.',
      verified: false,
      openHours: '7:00 AM - 8:00 PM',
      ageGroups: ['Kids (7-12)', 'Teens (13-17)'],
      coaches: 6,
      established: 2020,
    },
  ];

  useEffect(() => {
    initializeScreen();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedSports, sortBy, maxDistance, priceRange, academies]);

  const initializeScreen = async () => {
    try {
      await getUserLocation();
      loadAcademies();
      loadFavorites();
    } catch (error) {
      console.error('Error initializing screen:', error);
      setLoading(false);
    }
  };

  const getUserLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission',
          'Please enable location services to find nearby academies.',
          [{ text: 'OK' }]
        );
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error('Error getting location:', error);
      // Use default location (Nairobi city center)
      setUserLocation({
        latitude: -1.2921,
        longitude: 36.8219,
      });
    }
  };

  const loadAcademies = async () => {
    try {
      setLoading(true);
      // In real app, fetch from API
      const academiesWithDistance = mockAcademies.map(academy => ({
        ...academy,
        distance: calculateDistance(userLocation, academy.location),
      }));
      setAcademies(academiesWithDistance);
      setFilteredAcademies(academiesWithDistance);
    } catch (error) {
      console.error('Error loading academies:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    // Load from AsyncStorage in real app
    setFavorites(['1', '3']); // Mock favorites
  };

  const calculateDistance = (location1, location2) => {
    if (!location1 || !location2) return 0;
    
    const R = 6371; // Earth's radius in kilometers
    const dLat = (location2.latitude - location1.latitude) * Math.PI / 180;
    const dLon = (location2.longitude - location1.longitude) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(location1.latitude * Math.PI / 180) * Math.cos(location2.latitude * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c * 10) / 10; // Round to 1 decimal
  };

  const applyFilters = () => {
    let filtered = [...academies];

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(academy =>
        academy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        academy.sports.some(sport => 
          sport.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        academy.location.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sports filter
    if (selectedSports.length > 0) {
      filtered = filtered.filter(academy =>
        academy.sports.some(sport => selectedSports.includes(sport))
      );
    }

    // Distance filter
    filtered = filtered.filter(academy => academy.distance <= maxDistance);

    // Price filter
    filtered = filtered.filter(academy =>
      academy.estimatedPrice >= priceRange[0] && academy.estimatedPrice <= priceRange[1]
    );

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return a.distance - b.distance;
        case 'rating':
          return b.rating - a.rating;
        case 'price':
          return a.estimatedPrice - b.estimatedPrice;
        default:
          return 0;
      }
    });

    setFilteredAcademies(filtered);
  };

  const toggleFavorite = async (academyId) => {
    const newFavorites = favorites.includes(academyId)
      ? favorites.filter(id => id !== academyId)
      : [...favorites, academyId];
    
    setFavorites(newFavorites);
    // Save to AsyncStorage in real app
  };

  const handleCall = (phone) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleChat = (academy) => {
    navigation.navigate('CoachChat', { 
      chatType: 'academy',
      academyId: academy.id,
      academyName: academy.name 
    });
  };

  const handleShare = async (academy) => {
    try {
      await Share.share({
        message: `Check out ${academy.name} - ${academy.description}\nLocation: ${academy.location.address}\nRating: ${academy.rating}⭐\n${academy.website}`,
        title: academy.name,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleBookTrial = (academy) => {
    navigation.navigate('BookTrial', { academyId: academy.id });
  };

  const toggleSportFilter = (sport) => {
    setSelectedSports(prev =>
      prev.includes(sport)
        ? prev.filter(s => s !== sport)
        : [...prev, sport]
    );
  };

  const renderAcademyCard = ({ item: academy }) => (
    <Card style={styles.academyCard}>
      <View style={styles.cardHeader}>
        <Image source={{ uri: academy.image }} style={styles.academyImage} />
        <TouchableOpacity
          style={styles.favoriteBtn}
          onPress={() => toggleFavorite(academy.id)}
        >
          <Icon
            name={favorites.includes(academy.id) ? 'favorite' : 'favorite-border'}
            size={24}
            color={favorites.includes(academy.id) ? COLORS.error : COLORS.text}
          />
        </TouchableOpacity>
        {academy.verified && (
          <View style={styles.verifiedBadge}>
            <Icon name="verified" size={16} color="#4CAF50" />
          </View>
        )}
      </View>

      <View style={styles.cardContent}>
        <View style={styles.headerRow}>
          <Text style={styles.academyName}>{academy.name}</Text>
          <View style={styles.ratingContainer}>
            <Icon name="star" size={16} color="#FFD700" />
            <Text style={styles.rating}>{academy.rating}</Text>
            <Text style={styles.reviewCount}>({academy.reviewCount})</Text>
          </View>
        </View>

        <View style={styles.locationRow}>
          <Icon name="location-on" size={14} color={COLORS.textSecondary} />
          <Text style={styles.location}>{academy.location.address}</Text>
          <Text style={styles.distance}>{academy.distance} km</Text>
        </View>

        <View style={styles.sportsContainer}>
          {academy.sports.slice(0, 3).map((sport, index) => (
            <Chip key={index} style={styles.sportChip} textStyle={styles.sportChipText}>
              {sport}
            </Chip>
          ))}
          {academy.sports.length > 3 && (
            <Text style={styles.moreSports}>+{academy.sports.length - 3} more</Text>
          )}
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Icon name="schedule" size={14} color={COLORS.textSecondary} />
            <Text style={styles.infoText}>{academy.openHours}</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="attach-money" size={14} color={COLORS.textSecondary} />
            <Text style={styles.infoText}>${academy.estimatedPrice}/session</Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {academy.description}
        </Text>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.callBtn]}
            onPress={() => handleCall(academy.phone)}
          >
            <Icon name="phone" size={18} color="#fff" />
            <Text style={styles.actionBtnText}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.chatBtn]}
            onPress={() => handleChat(academy)}
          >
            <Icon name="chat" size={18} color="#fff" />
            <Text style={styles.actionBtnText}>Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.shareBtn]}
            onPress={() => handleShare(academy)}
          >
            <Icon name="share" size={18} color={COLORS.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.trialBtn]}
            onPress={() => handleBookTrial(academy)}
          >
            <Text style={styles.trialBtnText}>Book Trial</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  const FilterModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.filterModal}>
        <View style={styles.filterHeader}>
          <Text style={styles.filterTitle}>Filter Academies</Text>
          <TouchableOpacity onPress={() => setShowFilters(false)}>
            <Icon name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.filterContent}>
          {/* Distance Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Maximum Distance: {maxDistance} km</Text>
            <View style={styles.distanceOptions}>
              {[5, 10, 20, 50].map(distance => (
                <TouchableOpacity
                  key={distance}
                  style={[
                    styles.distanceOption,
                    maxDistance === distance && styles.selectedDistanceOption
                  ]}
                  onPress={() => setMaxDistance(distance)}
                >
                  <Text style={[
                    styles.distanceOptionText,
                    maxDistance === distance && styles.selectedDistanceOptionText
                  ]}>
                    {distance} km
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sports Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Sports</Text>
            <View style={styles.sportsFilter}>
              {availableSports.map(sport => (
                <TouchableOpacity
                  key={sport}
                  style={[
                    styles.sportFilterChip,
                    selectedSports.includes(sport) && styles.selectedSportChip
                  ]}
                  onPress={() => toggleSportFilter(sport)}
                >
                  <Text style={[
                    styles.sportFilterText,
                    selectedSports.includes(sport) && styles.selectedSportText
                  ]}>
                    {sport}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sort Options */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Sort By</Text>
            <View style={styles.sortOptions}>
              {[
                { key: 'distance', label: 'Distance' },
                { key: 'rating', label: 'Rating' },
                { key: 'price', label: 'Price' }
              ].map(option => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.sortOption,
                    sortBy === option.key && styles.selectedSortOption
                  ]}
                  onPress={() => setSortBy(option.key)}
                >
                  <Text style={[
                    styles.sortOptionText,
                    sortBy === option.key && styles.selectedSortOptionText
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.filterActions}>
          <Button
            mode="outlined"
            onPress={() => {
              setSelectedSports([]);
              setMaxDistance(10);
              setSortBy('distance');
            }}
            style={styles.clearFiltersBtn}
          >
            Clear All
          </Button>
          <Button
            mode="contained"
            onPress={() => setShowFilters(false)}
            style={styles.applyFiltersBtn}
          >
            Apply Filters
          </Button>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Finding nearby academies...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Search academies, sports, or location..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Icon name="filter-list" size={24} color={COLORS.primary} />
          {(selectedSports.length > 0 || maxDistance !== 10) && (
            <View style={styles.filterBadge} />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>
          {filteredAcademies.length} academies found
        </Text>
        {selectedSports.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.activeFilters}>
              {selectedSports.map(sport => (
                <Chip
                  key={sport}
                  onClose={() => toggleSportFilter(sport)}
                  style={styles.activeFilterChip}
                >
                  {sport}
                </Chip>
              ))}
            </View>
          </ScrollView>
        )}
      </View>

      <FlatList
        data={filteredAcademies}
        renderItem={renderAcademyCard}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.academyList}
      />

      <FAB
        icon="school"
        style={styles.secondMapFab}
        onPress={() => navigation.navigate('CompareAcademies')}
      />

      <FAB
        icon="map"
        style={styles.mapFab}
        onPress={() => navigation.navigate('AcademyMap', { academies: filteredAcademies })}
      />

      <FilterModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
  },
  searchBar: {
    flex: 1,
    marginRight: 12,
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
  },
  resultsHeader: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  resultsText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  activeFilters: {
    flexDirection: 'row',
    gap: 8,
  },
  activeFilterChip: {
    backgroundColor: COLORS.primary,
  },
  academyList: {
    padding: 16,
  },
  academyCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 3,
  },
  cardHeader: {
    position: 'relative',
  },
  academyImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  favoriteBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 8,
  },
  verifiedBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
  },
  cardContent: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  academyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  reviewCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 4,
  },
  location: {
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1,
  },
  distance: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  sportsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  sportChip: {
    backgroundColor: COLORS.primary + '20',
    borderRadius: 16,
  },
  sportChipText: {
    fontSize: 12,
    color: COLORS.primary,
  },
  moreSports: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  callBtn: {
    backgroundColor: COLORS.success,
    flex: 1,
  },
  chatBtn: {
    backgroundColor: COLORS.primary,
    flex: 1,
  },
  shareBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingHorizontal: 8,
  },
  trialBtn: {
    backgroundColor: COLORS.warning,
    flex: 1,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  trialBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },mapFab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  secondMapFab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 80, // Move it up by 80px (56px FAB height + 24px spacing)
    backgroundColor: COLORS.primary,
  },
  // Filter Modal Styles
  filterModal: {
    flex: 1,
    backgroundColor: '#fff',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  filterContent: {
    flex: 1,
  },
  filterSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  distanceOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  distanceOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  selectedDistanceOption: {
    backgroundColor: COLORS.primary,
  },
  distanceOptionText: {
    fontSize: 14,
    color: COLORS.text,
  },
  selectedDistanceOptionText: {
    color: '#fff',
  },
  sportsFilter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sportFilterChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  selectedSportChip: {
    backgroundColor: COLORS.primary,
  },
  sportFilterText: {
    fontSize: 14,
    color: COLORS.text,
  },
  selectedSportText: {
    color: '#fff',
  },
  sortOptions: {
    gap: 8,
  },
  sortOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  selectedSortOption: {
    backgroundColor: COLORS.primary,
  },
  sortOptionText: {
    fontSize: 14,
    color: COLORS.text,
  },
  selectedSortOptionText: {
    color: '#fff',
  },
  filterActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  clearFiltersBtn: {
    flex: 1,
  },
  applyFiltersBtn: {
    flex: 1,
  },
});

export default NearbyAcademies;