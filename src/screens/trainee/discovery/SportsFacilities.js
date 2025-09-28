import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Alert,
  Animated,
  FlatList,
} from 'react-native';
import {
  Card,
  Searchbar,
  Chip,
  Button,
  Surface,
  Avatar,
  IconButton,
  Portal,
  Modal,
  ProgressBar,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '@react-native-blur/blur';

import { COLORS, SPACING, TEXT_STYLES } from '../styles/globalStyles';

const { width } = Dimensions.get('window');

const SPORT_TYPES = [
  { id: 'all', name: 'All Sports', icon: 'sports' },
  { id: 'football', name: 'Football', icon: 'sports-football' },
  { id: 'basketball', name: 'Basketball', icon: 'sports-basketball' },
  { id: 'tennis', name: 'Tennis', icon: 'sports-tennis' },
  { id: 'swimming', name: 'Swimming', icon: 'pool' },
  { id: 'fitness', name: 'Fitness', icon: 'fitness-center' },
  { id: 'volleyball', name: 'Volleyball', icon: 'sports-volleyball' },
  { id: 'badminton', name: 'Badminton', icon: 'sports-handball' },
  { id: 'cricket', name: 'Cricket', icon: 'sports-cricket' },
];

const MOCK_FACILITIES = [
  {
    id: '1',
    name: 'Elite Sports Complex',
    type: 'Multi-Sport Facility',
    sports: ['Football', 'Basketball', 'Tennis'],
    rating: 4.8,
    reviews: 124,
    distance: '1.2 km',
    priceRange: '$15-25/hour',
    image: 'https://via.placeholder.com/300x200',
    amenities: ['Parking', 'Changing Rooms', 'Equipment Rental', 'Café'],
    openHours: '6:00 AM - 10:00 PM',
    featured: true,
  },
  {
    id: '2',
    name: 'AquaFit Center',
    type: 'Swimming & Fitness',
    sports: ['Swimming', 'Fitness'],
    rating: 4.6,
    reviews: 89,
    distance: '2.1 km',
    priceRange: '$20-30/session',
    image: 'https://via.placeholder.com/300x200',
    amenities: ['Pool', 'Sauna', 'Personal Training', 'Group Classes'],
    openHours: '5:30 AM - 11:00 PM',
    featured: false,
  },
  {
    id: '3',
    name: 'Champions Tennis Academy',
    type: 'Tennis Facility',
    sports: ['Tennis'],
    rating: 4.9,
    reviews: 76,
    distance: '0.8 km',
    priceRange: '$30-50/hour',
    image: 'https://via.placeholder.com/300x200',
    amenities: ['Professional Courts', 'Coaching', 'Equipment Shop'],
    openHours: '7:00 AM - 9:00 PM',
    featured: true,
  },
];

const SportsFacilities = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('all');
  const [facilities, setFacilities] = useState(MOCK_FACILITIES);
  const [filteredFacilities, setFilteredFacilities] = useState(MOCK_FACILITIES);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [sortBy, setSortBy] = useState('distance');
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const filterFacilities = useCallback(() => {
    let filtered = [...facilities];

    // Filter by sport
    if (selectedSport !== 'all') {
      const sportName = SPORT_TYPES.find(s => s.id === selectedSport)?.name;
      filtered = filtered.filter(facility => 
        facility.sports.some(sport => 
          sport.toLowerCase().includes(sportName.toLowerCase())
        )
      );
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(facility =>
        facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        facility.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        facility.sports.some(sport => 
          sport.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Sort facilities
    switch (sortBy) {
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'distance':
        filtered.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
        break;
      case 'price':
        // Simple price sorting based on first price value
        filtered.sort((a, b) => {
          const aPrice = parseInt(a.priceRange.match(/\d+/)[0]);
          const bPrice = parseInt(b.priceRange.match(/\d+/)[0]);
          return aPrice - bPrice;
        });
        break;
      default:
        break;
    }

    setFilteredFacilities(filtered);
  }, [facilities, selectedSport, searchQuery, sortBy]);

  useEffect(() => {
    filterFacilities();
  }, [filterFacilities]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('Success', 'Facilities updated! 🎯');
    }, 1000);
  }, []);

  const handleFacilityPress = (facility) => {
    Alert.alert(
      'Feature Coming Soon! 🏟️',
      `Detailed view for ${facility.name} will be available soon. This will include booking options, detailed amenities, photos, and reviews.`,
      [{ text: 'Got it!', style: 'default' }]
    );
  };

  const handleBookFacility = (facility) => {
    Alert.alert(
      'Booking System 📅',
      `Booking system for ${facility.name} is under development. You'll soon be able to book sessions, view availability, and make payments directly through the app.`,
      [{ text: 'Notify Me', style: 'default' }]
    );
  };

  const renderSportChip = ({ item }) => (
    <Chip
      key={item.id}
      mode={selectedSport === item.id ? 'flat' : 'outlined'}
      selected={selectedSport === item.id}
      onPress={() => setSelectedSport(item.id)}
      icon={item.icon}
      style={{
        marginRight: SPACING.sm,
        backgroundColor: selectedSport === item.id ? COLORS.primary : 'transparent',
      }}
      textStyle={{
        color: selectedSport === item.id ? '#fff' : COLORS.text.primary,
        fontSize: 12,
      }}
    >
      {item.name}
    </Chip>
  );

  const renderFacilityCard = ({ item, index }) => (
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
          borderRadius: 12,
          overflow: 'hidden',
        }}
        onPress={() => handleFacilityPress(item)}
      >
        {item.featured && (
          <View
            style={{
              position: 'absolute',
              top: SPACING.sm,
              right: SPACING.sm,
              zIndex: 1,
              backgroundColor: COLORS.success,
              paddingHorizontal: SPACING.xs,
              paddingVertical: 2,
              borderRadius: 8,
            }}
          >
            <Text style={[TEXT_STYLES.caption, { color: '#fff', fontWeight: '600' }]}>
              Featured ⭐
            </Text>
          </View>
        )}
        
        <LinearGradient
          colors={['rgba(102, 126, 234, 0.1)', 'rgba(118, 75, 162, 0.1)']}
          style={{
            height: 120,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: COLORS.surface,
          }}
        >
          <Icon name="location-city" size={48} color={COLORS.primary} />
        </LinearGradient>

        <Card.Content style={{ padding: SPACING.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.xs }}>
            <View style={{ flex: 1 }}>
              <Text style={[TEXT_STYLES.h3, { marginBottom: 4 }]}>
                {item.name}
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.text.secondary }]}>
                {item.type}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                <Icon name="star" size={16} color={COLORS.warning} />
                <Text style={[TEXT_STYLES.caption, { marginLeft: 4, fontWeight: '600' }]}>
                  {item.rating}
                </Text>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.text.secondary, marginLeft: 4 }]}>
                  ({item.reviews})
                </Text>
              </View>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.text.secondary }]}>
                📍 {item.distance}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.sm }}>
            {item.sports.map((sport, index) => (
              <Chip
                key={index}
                mode="outlined"
                compact
                style={{
                  marginRight: SPACING.xs,
                  marginBottom: SPACING.xs,
                  height: 24,
                }}
                textStyle={{ fontSize: 10 }}
              >
                {sport}
              </Chip>
            ))}
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm }}>
            <Text style={[TEXT_STYLES.body2, { color: COLORS.success, fontWeight: '600' }]}>
              {item.priceRange}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.text.secondary }]}>
              🕒 {item.openHours}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.sm }}>
            {item.amenities.slice(0, 3).map((amenity, index) => (
              <Text
                key={index}
                style={[
                  TEXT_STYLES.caption,
                  {
                    backgroundColor: COLORS.surface,
                    color: COLORS.text.secondary,
                    paddingHorizontal: SPACING.xs,
                    paddingVertical: 2,
                    marginRight: SPACING.xs,
                    marginBottom: 4,
                    borderRadius: 8,
                    fontSize: 10,
                  }
                ]}
              >
                {amenity}
              </Text>
            ))}
            {item.amenities.length > 3 && (
              <Text style={[TEXT_STYLES.caption, { color: COLORS.text.secondary, fontSize: 10 }]}>
                +{item.amenities.length - 3} more
              </Text>
            )}
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Button
              mode="outlined"
              onPress={() => handleFacilityPress(item)}
              style={{ flex: 1, marginRight: SPACING.xs }}
              labelStyle={{ fontSize: 12 }}
            >
              View Details
            </Button>
            <Button
              mode="contained"
              onPress={() => handleBookFacility(item)}
              style={{ flex: 1, marginLeft: SPACING.xs, backgroundColor: COLORS.primary }}
              labelStyle={{ fontSize: 12 }}
            >
              Book Now 🎯
            </Button>
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderFilterModal = () => (
    <Portal>
      <Modal
        visible={showFilterModal}
        onDismiss={() => setShowFilterModal(false)}
        contentContainerStyle={{
          backgroundColor: '#fff',
          marginHorizontal: SPACING.lg,
          borderRadius: 12,
          padding: SPACING.lg,
        }}
      >
        <Text style={[TEXT_STYLES.h2, { marginBottom: SPACING.md, textAlign: 'center' }]}>
          Filter & Sort 🎛️
        </Text>
        
        <Text style={[TEXT_STYLES.h4, { marginBottom: SPACING.sm }]}>Sort By:</Text>
        
        {['distance', 'rating', 'price'].map((option) => (
          <TouchableOpacity
            key={option}
            onPress={() => setSortBy(option)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: SPACING.sm,
              paddingHorizontal: SPACING.sm,
              backgroundColor: sortBy === option ? COLORS.primary + '20' : 'transparent',
              borderRadius: 8,
              marginBottom: SPACING.xs,
            }}
          >
            <Icon
              name={sortBy === option ? 'radio-button-checked' : 'radio-button-unchecked'}
              size={20}
              color={sortBy === option ? COLORS.primary : COLORS.text.secondary}
            />
            <Text style={[
              TEXT_STYLES.body2,
              {
                marginLeft: SPACING.sm,
                color: sortBy === option ? COLORS.primary : COLORS.text.primary,
                fontWeight: sortBy === option ? '600' : 'normal',
              }
            ]}>
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}

        <Button
          mode="contained"
          onPress={() => setShowFilterModal(false)}
          style={{ marginTop: SPACING.md, backgroundColor: COLORS.primary }}
        >
          Apply Filters ✨
        </Button>
      </Modal>
    </Portal>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" translucent />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{
          paddingTop: StatusBar.currentHeight + SPACING.md,
          paddingBottom: SPACING.md,
          paddingHorizontal: SPACING.md,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md }}>
          <Text style={[TEXT_STYLES.h1, { color: '#fff' }]}>
            Sports Facilities 🏟️
          </Text>
          <IconButton
            icon="tune"
            iconColor="#fff"
            size={24}
            onPress={() => setShowFilterModal(true)}
          />
        </View>

        <Searchbar
          placeholder="Search facilities, sports, or location..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={{
            backgroundColor: 'rgba(255,255,255,0.9)',
            borderRadius: 25,
            elevation: 0,
          }}
          inputStyle={{ fontSize: 14 }}
          icon="search"
        />
      </LinearGradient>

      {/* Sport Filter Chips */}
      <View style={{ paddingVertical: SPACING.md }}>
        <FlatList
          horizontal
          data={SPORT_TYPES}
          renderItem={renderSportChip}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: SPACING.md }}
        />
      </View>

      {/* Results Count */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        marginBottom: SPACING.sm 
      }}>
        <Text style={[TEXT_STYLES.body2, { color: COLORS.text.secondary }]}>
          {filteredFacilities.length} facilities found
        </Text>
        <Text style={[TEXT_STYLES.caption, { color: COLORS.text.secondary }]}>
          Sorted by: {sortBy} 📊
        </Text>
      </View>

      {/* Facilities List */}
      <FlatList
        data={filteredFacilities}
        renderItem={renderFacilityCard}
        keyExtractor={(item) => item.id}
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
          <View style={{ 
            alignItems: 'center', 
            justifyContent: 'center', 
            paddingVertical: SPACING.xxl 
          }}>
            <Icon name="search-off" size={64} color={COLORS.text.secondary} />
            <Text style={[TEXT_STYLES.h3, { color: COLORS.text.secondary, marginTop: SPACING.md }]}>
              No facilities found
            </Text>
            <Text style={[TEXT_STYLES.body2, { color: COLORS.text.secondary, textAlign: 'center', marginTop: SPACING.sm }]}>
              Try adjusting your search or filters 🔍
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: SPACING.xl }}
      />

      {renderFilterModal()}
    </View>
  );
};

export default SportsFacilities;