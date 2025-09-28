import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  Animated,
  Alert,
  Vibration,
  FlatList,
  Dimensions,
} from 'react-native';
import {
  Card,
  Searchbar,
  Chip,
  Avatar,
  IconButton,
  FAB,
  Surface,
  ProgressBar,
  Portal,
  Modal,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';

// Import your constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants';

const { width, height } = Dimensions.get('window');

const FacilityFinder = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedDistance, setSelectedDistance] = useState('10');
  const [showFilters, setShowFilters] = useState(false);
  const [facilities, setFacilities] = useState([]);
  const [filteredFacilities, setFilteredFacilities] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [mapVisible, setMapVisible] = useState(false);

  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(-50);

  const sports = [
    { id: 'all', name: 'All Sports', icon: 'sports', color: COLORS.primary },
    { id: 'football', name: 'Football', icon: 'sports-football', color: '#FF6B35' },
    { id: 'basketball', name: 'Basketball', icon: 'sports-basketball', color: '#F7931E' },
    { id: 'tennis', name: 'Tennis', icon: 'sports-tennis', color: '#4CAF50' },
    { id: 'swimming', name: 'Swimming', icon: 'pool', color: '#2196F3' },
    { id: 'soccer', name: 'Soccer', icon: 'sports-soccer', color: '#8BC34A' },
    { id: 'volleyball', name: 'Volleyball', icon: 'sports-volleyball', color: '#E91E63' },
    { id: 'martial-arts', name: 'Martial Arts', icon: 'sports-kabaddi', color: '#9C27B0' },
  ];

  const distances = [
    { id: '5', name: '5 km', label: 'Within 5 km' },
    { id: '10', name: '10 km', label: 'Within 10 km' },
    { id: '25', name: '25 km', label: 'Within 25 km' },
    { id: '50', name: '50 km', label: 'Within 50 km' },
  ];

  // Sample facility data - in real app, this would come from API
  const sampleFacilities = [
    {
      id: 1,
      name: 'Elite Sports Academy',
      description: 'Premium multi-sport facility with professional coaches',
      sports: ['football', 'basketball', 'tennis'],
      rating: 4.8,
      reviewCount: 156,
      distance: '2.3 km',
      priceRange: '$$$',
      image: 'https://via.placeholder.com/300x200/667eea/white?text=Elite+Sports',
      address: '123 Sports Complex, Nairobi',
      features: ['Indoor Courts', 'Professional Coaches', 'Equipment Rental', 'Parking'],
      contact: '+254 700 123 456',
      openHours: 'Mon-Sun: 6:00 AM - 10:00 PM',
      ageGroups: ['6-12', '13-18', 'Adults'],
      programs: ['Beginner Classes', 'Competitive Training', 'Summer Camps'],
    },
    {
      id: 2,
      name: 'Champions Football Club',
      description: 'Specialized football training for all age groups',
      sports: ['football', 'soccer'],
      rating: 4.6,
      reviewCount: 89,
      distance: '4.1 km',
      priceRange: '$$',
      image: 'https://via.placeholder.com/300x200/764ba2/white?text=Champions+FC',
      address: '456 Football Grounds, Westlands',
      features: ['Grass Fields', 'Youth Programs', 'Tournament Prep', 'Fitness Center'],
      contact: '+254 700 789 012',
      openHours: 'Mon-Fri: 4:00 PM - 8:00 PM, Sat-Sun: 8:00 AM - 6:00 PM',
      ageGroups: ['8-16'],
      programs: ['Youth Development', 'Skills Training', 'League Participation'],
    },
    {
      id: 3,
      name: 'Aqua Swim Center',
      description: 'State-of-the-art swimming facility with certified instructors',
      sports: ['swimming'],
      rating: 4.9,
      reviewCount: 203,
      distance: '1.8 km',
      priceRange: '$$',
      image: 'https://via.placeholder.com/300x200/2196F3/white?text=Aqua+Swim',
      address: '789 Pool Avenue, Karen',
      features: ['Olympic Pool', 'Kids Pool', 'Swim Lessons', 'Water Safety'],
      contact: '+254 700 345 678',
      openHours: 'Mon-Sun: 5:00 AM - 9:00 PM',
      ageGroups: ['3+'],
      programs: ['Learn to Swim', 'Competitive Swimming', 'Water Aerobics'],
    },
    {
      id: 4,
      name: 'Courtside Tennis Club',
      description: 'Professional tennis coaching and court rental',
      sports: ['tennis'],
      rating: 4.4,
      reviewCount: 67,
      distance: '6.7 km',
      priceRange: '$$$',
      image: 'https://via.placeholder.com/300x200/4CAF50/white?text=Tennis+Club',
      address: '321 Tennis Courts, Kilimani',
      features: ['Clay Courts', 'Hard Courts', 'Pro Shop', 'Tournament Hosting'],
      contact: '+254 700 567 890',
      openHours: 'Mon-Sun: 6:00 AM - 9:00 PM',
      ageGroups: ['5+'],
      programs: ['Junior Development', 'Adult Lessons', 'Tournament Training'],
    },
  ];

  useEffect(() => {
    loadFacilities();
    animateEntrance();
  }, []);

  useEffect(() => {
    filterFacilities();
  }, [searchQuery, selectedSport, facilities]);

  const animateEntrance = () => {
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
  };

  const loadFacilities = useCallback(async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setFacilities(sampleFacilities);
      setFilteredFacilities(sampleFacilities);
    } catch (error) {
      Alert.alert('Error', 'Failed to load facilities. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFacilities();
    setRefreshing(false);
  }, [loadFacilities]);

  const filterFacilities = () => {
    let filtered = facilities;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(facility =>
        facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        facility.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        facility.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by sport
    if (selectedSport !== 'all') {
      filtered = filtered.filter(facility =>
        facility.sports.includes(selectedSport)
      );
    }

    setFilteredFacilities(filtered);
  };

  const toggleFavorite = (facilityId) => {
    Vibration.vibrate(50);
    const newFavorites = new Set(favorites);
    if (favorites.has(facilityId)) {
      newFavorites.delete(facilityId);
    } else {
      newFavorites.add(facilityId);
    }
    setFavorites(newFavorites);
  };

  const handleFacilityPress = (facility) => {
    Vibration.vibrate(50);
    navigation.navigate('FacilityDetails', { facility });
  };

  const handleBookSession = (facility) => {
    Alert.alert(
      'Book Session',
      `Ready to book a session at ${facility.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Book Now',
          onPress: () => {
            Alert.alert('Feature Coming Soon', 'Session booking will be available in the next update! 🏆');
          }
        }
      ]
    );
  };

  const renderSportFilter = ({ item }) => (
    <TouchableOpacity
      onPress={() => setSelectedSport(item.id)}
      style={{ marginRight: SPACING.sm }}
    >
      <Surface
        style={{
          borderRadius: 20,
          elevation: selectedSport === item.id ? 4 : 2,
          backgroundColor: selectedSport === item.id ? item.color : COLORS.background,
          paddingHorizontal: SPACING.md,
          paddingVertical: SPACING.sm,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <Icon
          name={item.icon}
          size={20}
          color={selectedSport === item.id ? 'white' : item.color}
          style={{ marginRight: SPACING.xs }}
        />
        <Text
          style={[
            TEXT_STYLES.caption,
            { color: selectedSport === item.id ? 'white' : item.color }
          ]}
        >
          {item.name}
        </Text>
      </Surface>
    </TouchableOpacity>
  );

  const renderFacilityCard = ({ item }) => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        marginBottom: SPACING.md,
      }}
    >
      <Card
        style={{
          marginHorizontal: SPACING.md,
          elevation: 4,
          borderRadius: 16,
        }}
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={{
            height: 200,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            justifyContent: 'flex-end',
            padding: SPACING.md,
          }}
        >
          <View
            style={{
              position: 'absolute',
              top: SPACING.sm,
              right: SPACING.sm,
              flexDirection: 'row',
            }}
          >
            <IconButton
              icon={favorites.has(item.id) ? 'favorite' : 'favorite-border'}
              iconColor={favorites.has(item.id) ? '#FF6B6B' : 'white'}
              size={24}
              onPress={() => toggleFavorite(item.id)}
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            />
          </View>
          
          <Text style={[TEXT_STYLES.h3, { color: 'white', fontWeight: 'bold' }]}>
            {item.name}
          </Text>
          <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
            📍 {item.distance} • {item.priceRange}
          </Text>
        </LinearGradient>

        <View style={{ padding: SPACING.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
            <Icon name="star" size={16} color="#FFD700" />
            <Text style={[TEXT_STYLES.caption, { marginLeft: 4, fontWeight: 'bold' }]}>
              {item.rating}
            </Text>
            <Text style={[TEXT_STYLES.caption, { marginLeft: 4, color: COLORS.textSecondary }]}>
              ({item.reviewCount} reviews)
            </Text>
          </View>

          <Text
            style={[TEXT_STYLES.body, { color: COLORS.textSecondary, marginBottom: SPACING.sm }]}
            numberOfLines={2}
          >
            {item.description}
          </Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.sm }}>
            {item.sports.map((sport) => {
              const sportInfo = sports.find(s => s.id === sport);
              return (
                <Chip
                  key={sport}
                  mode="outlined"
                  compact
                  style={{
                    marginRight: SPACING.xs,
                    marginBottom: SPACING.xs,
                    backgroundColor: `${sportInfo?.color}20`,
                  }}
                  textStyle={{ color: sportInfo?.color, fontSize: 10 }}
                >
                  {sportInfo?.name || sport}
                </Chip>
              );
            })}
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <TouchableOpacity
              style={{
                backgroundColor: COLORS.primary,
                paddingHorizontal: SPACING.md,
                paddingVertical: SPACING.sm,
                borderRadius: 8,
                flex: 1,
                marginRight: SPACING.sm,
              }}
              onPress={() => handleFacilityPress(item)}
            >
              <Text style={[TEXT_STYLES.button, { color: 'white', textAlign: 'center' }]}>
                View Details
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                borderColor: COLORS.primary,
                borderWidth: 1,
                paddingHorizontal: SPACING.md,
                paddingVertical: SPACING.sm,
                borderRadius: 8,
                flex: 1,
              }}
              onPress={() => handleBookSession(item)}
            >
              <Text style={[TEXT_STYLES.button, { color: COLORS.primary, textAlign: 'center' }]}>
                Book Now
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Card>
    </Animated.View>
  );

  const renderEmptyState = () => (
    <View style={{ alignItems: 'center', paddingVertical: SPACING.xl }}>
      <Icon name="search-off" size={80} color={COLORS.textSecondary} />
      <Text style={[TEXT_STYLES.h3, { marginTop: SPACING.md, color: COLORS.textSecondary }]}>
        No facilities found
      </Text>
      <Text style={[TEXT_STYLES.body, { marginTop: SPACING.sm, textAlign: 'center', paddingHorizontal: SPACING.xl }]}>
        Try adjusting your search criteria or explore different sports
      </Text>
    </View>
  );

  const renderFilterModal = () => (
    <Portal>
      <Modal
        visible={showFilters}
        onDismiss={() => setShowFilters(false)}
        contentContainerStyle={{
          backgroundColor: 'white',
          margin: SPACING.md,
          borderRadius: 16,
          padding: SPACING.md,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md }}>
          <Text style={TEXT_STYLES.h3}>Filter Facilities</Text>
          <IconButton
            icon="close"
            size={24}
            onPress={() => setShowFilters(false)}
          />
        </View>

        <Text style={[TEXT_STYLES.subtitle, { marginBottom: SPACING.sm }]}>Distance</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.lg }}>
          {distances.map((distance) => (
            <Chip
              key={distance.id}
              mode={selectedDistance === distance.id ? 'flat' : 'outlined'}
              selected={selectedDistance === distance.id}
              onPress={() => setSelectedDistance(distance.id)}
              style={{ marginRight: SPACING.sm, marginBottom: SPACING.sm }}
            >
              {distance.name}
            </Chip>
          ))}
        </View>

        <TouchableOpacity
          style={{
            backgroundColor: COLORS.primary,
            paddingVertical: SPACING.md,
            borderRadius: 8,
            alignItems: 'center',
          }}
          onPress={() => {
            setShowFilters(false);
            filterFacilities();
          }}
        >
          <Text style={[TEXT_STYLES.button, { color: 'white' }]}>Apply Filters</Text>
        </TouchableOpacity>
      </Modal>
    </Portal>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{
          paddingTop: StatusBar.currentHeight + SPACING.md,
          paddingBottom: SPACING.md,
          paddingHorizontal: SPACING.md,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={[TEXT_STYLES.h2, { color: 'white', fontWeight: 'bold' }]}>
              Find Sports Facilities 🏟️
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
              Discover amazing places to train and play
            </Text>
          </View>
          <IconButton
            icon="map"
            iconColor="white"
            size={24}
            onPress={() => setMapVisible(true)}
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          />
        </View>
      </LinearGradient>

      {/* Search Bar */}
      <View style={{ paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm }}>
        <Searchbar
          placeholder="Search facilities, sports, or location..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={{ elevation: 2 }}
          inputStyle={{ fontSize: 14 }}
          iconColor={COLORS.primary}
        />
      </View>

      {/* Sport Filters */}
      <View style={{ marginBottom: SPACING.sm }}>
        <FlatList
          data={sports}
          renderItem={renderSportFilter}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: SPACING.md }}
        />
      </View>

      {/* Results Count & Filter Button */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
      }}>
        <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
          {filteredFacilities.length} facilities found
        </Text>
        <TouchableOpacity
          onPress={() => setShowFilters(true)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: SPACING.sm,
            paddingVertical: SPACING.xs,
            borderRadius: 16,
            backgroundColor: COLORS.primary + '20',
          }}
        >
          <Icon name="filter-list" size={16} color={COLORS.primary} />
          <Text style={[TEXT_STYLES.caption, { color: COLORS.primary, marginLeft: 4 }]}>
            Filters
          </Text>
        </TouchableOpacity>
      </View>

      {/* Facilities List */}
      <FlatList
        data={filteredFacilities}
        renderItem={renderFacilityCard}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={loading ? null : renderEmptyState}
        contentContainerStyle={{
          paddingBottom: 100,
          flexGrow: 1,
        }}
      />

      {/* Loading State */}
      {loading && (
        <View style={{ padding: SPACING.md }}>
          <ProgressBar indeterminate color={COLORS.primary} />
          <Text style={[TEXT_STYLES.caption, { textAlign: 'center', marginTop: SPACING.sm }]}>
            Finding amazing facilities near you... 🔍
          </Text>
        </View>
      )}

      {/* Filter Modal */}
      {renderFilterModal()}

      {/* Floating Action Button */}
      <FAB
        icon="my-location"
        style={{
          position: 'absolute',
          margin: SPACING.md,
          right: 0,
          bottom: 80,
          backgroundColor: COLORS.primary,
        }}
        onPress={() => Alert.alert('Feature Coming Soon', 'Location-based search will be available soon! 📍')}
      />
    </View>
  );
};

export default FacilityFinder;