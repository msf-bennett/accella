import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  RefreshControl,
  Alert,
  Animated,
  Vibration,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Image,
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  ProgressBar,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Portal,
  Modal,
  Searchbar,
  Badge,
  Divider,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';

// Constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#f44336',
  warning: '#ff9800',
  info: '#2196F3',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  disabled: '#cccccc',
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
  h1: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 22, fontWeight: '600', color: COLORS.text },
  h3: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 12, color: COLORS.textSecondary },
};

const { width, height } = Dimensions.get('window');

const AcademyFacilities = ({ navigation, route }) => {
  // Redux state
  const dispatch = useDispatch();
  const { user, academyInfo, facilities, loading } = useSelector(state => ({
    user: state.auth.user,
    academyInfo: state.academy.info,
    facilities: state.academy.facilities,
    loading: state.academy.loading,
  }));

  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [showFacilityModal, setShowFacilityModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const scrollViewRef = useRef(null);

  // Mock data for demonstration
  const mockFacilities = [
    {
      id: '1',
      name: 'Main Football Pitch',
      category: 'sports',
      description: 'FIFA standard grass pitch with floodlights and spectator stands',
      features: ['FIFA Standard', 'Floodlights', '500-seat Stand', 'Drainage System'],
      availability: 'Available',
      capacity: '22 players + 500 spectators',
      image: 'https://via.placeholder.com/300x200/4CAF50/white?text=Football+Pitch',
      rating: 4.8,
      amenities: ['Changing Rooms', 'Medical Room', 'Equipment Storage'],
      bookingRequired: true,
    },
    {
      id: '2',
      name: 'Indoor Gymnasium',
      category: 'fitness',
      description: 'Modern gymnasium with state-of-the-art fitness equipment',
      features: ['Air Conditioning', 'Modern Equipment', 'Sound System', 'Mirrors'],
      availability: 'Available',
      capacity: '30 people',
      image: 'https://via.placeholder.com/300x200/2196F3/white?text=Gymnasium',
      rating: 4.6,
      amenities: ['Shower Facilities', 'Lockers', 'First Aid Kit'],
      bookingRequired: false,
    },
    {
      id: '3',
      name: 'Swimming Pool',
      category: 'aquatic',
      description: '25-meter Olympic-style swimming pool with diving board',
      features: ['25m Length', 'Diving Board', 'Lane Markers', 'Poolside Seating'],
      availability: 'Available',
      capacity: '40 swimmers',
      image: 'https://via.placeholder.com/300x200/00BCD4/white?text=Swimming+Pool',
      rating: 4.9,
      amenities: ['Lifeguard Station', 'Pool Equipment', 'Shower Area'],
      bookingRequired: true,
    },
    {
      id: '4',
      name: 'Tennis Courts',
      category: 'sports',
      description: 'Two professional-grade tennis courts with night lighting',
      features: ['Hard Court Surface', 'Net Systems', 'Court Lines', 'Seating Area'],
      availability: 'Partially Available',
      capacity: '4 players per court',
      image: 'https://via.placeholder.com/300x200/FF9800/white?text=Tennis+Courts',
      rating: 4.4,
      amenities: ['Equipment Rental', 'Ball Machine', 'Scoreboard'],
      bookingRequired: true,
    },
    {
      id: '5',
      name: 'Cafeteria',
      category: 'amenities',
      description: 'Healthy meals and refreshments for players and visitors',
      features: ['Healthy Menu', 'Indoor Seating', 'Outdoor Terrace', 'Free WiFi'],
      availability: 'Open Daily',
      capacity: '80 people',
      image: 'https://via.placeholder.com/300x200/4CAF50/white?text=Cafeteria',
      rating: 4.2,
      amenities: ['Nutritionist Approved', 'Vegan Options', 'Sports Drinks'],
      bookingRequired: false,
    },
    {
      id: '6',
      name: 'Medical Center',
      category: 'health',
      description: 'On-site medical facility with qualified sports medicine staff',
      features: ['Sports Medicine', 'Physiotherapy', 'First Aid', 'Recovery Room'],
      availability: 'Mon-Fri 8AM-6PM',
      capacity: '10 patients',
      image: 'https://via.placeholder.com/300x200/f44336/white?text=Medical+Center',
      rating: 4.7,
      amenities: ['X-Ray Machine', 'Rehabilitation Equipment', 'Emergency Kit'],
      bookingRequired: true,
    },
  ];

  const categories = [
    { key: 'all', label: 'All Facilities', icon: 'view-grid', count: mockFacilities.length },
    { key: 'sports', label: 'Sports', icon: 'sports-football', count: mockFacilities.filter(f => f.category === 'sports').length },
    { key: 'fitness', label: 'Fitness', icon: 'fitness-center', count: mockFacilities.filter(f => f.category === 'fitness').length },
    { key: 'aquatic', label: 'Aquatic', icon: 'pool', count: mockFacilities.filter(f => f.category === 'aquatic').length },
    { key: 'amenities', label: 'Amenities', icon: 'local-cafe', count: mockFacilities.filter(f => f.category === 'amenities').length },
    { key: 'health', label: 'Health', icon: 'local-hospital', count: mockFacilities.filter(f => f.category === 'health').length },
  ];

  // Animation setup
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
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Dispatch refresh actions
      // await dispatch(fetchAcademyFacilities());
      
      // Simulate API call
      setTimeout(() => {
        setRefreshing(false);
      }, 1000);
    } catch (error) {
      console.error('Error refreshing:', error);
      setRefreshing(false);
    }
  }, [dispatch]);

  const handleFacilityPress = (facility) => {
    Vibration.vibrate(50);
    setSelectedFacility(facility);
    setShowFacilityModal(true);
  };

  const handleBookFacility = (facility) => {
    Vibration.vibrate(50);
    Alert.alert(
      '📅 Facility Booking',
      `Book ${facility.name}?\n\nThis feature is coming soon! You'll be able to book facilities directly through the app.`,
      [{ text: 'Got it! 🎯', style: 'default' }]
    );
  };

  const handleImagePress = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  const getAvailabilityColor = (availability) => {
    if (availability === 'Available' || availability.includes('Open')) {
      return COLORS.success;
    } else if (availability.includes('Partially')) {
      return COLORS.warning;
    } else {
      return COLORS.info;
    }
  };

  const getAvailabilityIcon = (availability) => {
    if (availability === 'Available' || availability.includes('Open')) {
      return 'check-circle';
    } else if (availability.includes('Partially')) {
      return 'warning';
    } else {
      return 'schedule';
    }
  };

  const filteredFacilities = mockFacilities.filter(facility => {
    const matchesSearch = facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         facility.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || facility.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const averageRating = mockFacilities.reduce((sum, f) => sum + f.rating, 0) / mockFacilities.length;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{
          paddingTop: StatusBar.currentHeight + SPACING.md,
          paddingBottom: SPACING.lg,
          paddingHorizontal: SPACING.md,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
          <IconButton
            icon="arrow-back"
            iconColor="white"
            size={24}
            onPress={() => navigation.goBack()}
          />
          <Text style={[TEXT_STYLES.h2, { color: 'white', flex: 1, marginLeft: SPACING.sm }]}>
            🏟️ Academy Facilities
          </Text>
          <Badge
            visible={true}
            style={{ backgroundColor: COLORS.success }}
          >
            {mockFacilities.length}
          </Badge>
        </View>

        {/* Facilities Summary */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <Surface
            style={{
              borderRadius: 16,
              padding: SPACING.md,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              elevation: 4,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.xs }]}>
                  World-Class Facilities ⭐
                </Text>
                <Text style={TEXT_STYLES.body}>
                  {mockFacilities.length} Premium Facilities Available
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon name="star" size={20} color="#FFD700" />
                  <Text style={[TEXT_STYLES.body, { fontWeight: '600', marginLeft: SPACING.xs }]}>
                    {averageRating.toFixed(1)}
                  </Text>
                </View>
                <Text style={TEXT_STYLES.caption}>Average Rating</Text>
              </View>
            </View>
          </Surface>
        </Animated.View>
      </LinearGradient>

      {/* Search */}
      <View style={{ padding: SPACING.md, paddingBottom: SPACING.sm }}>
        <Searchbar
          placeholder="Search facilities..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={{ elevation: 2 }}
          iconColor={COLORS.primary}
        />
      </View>

      {/* Category Filter */}
      <View style={{ paddingHorizontal: SPACING.md, paddingBottom: SPACING.md }}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: SPACING.md }}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.key}
              onPress={() => setSelectedCategory(category.key)}
              style={{
                marginRight: SPACING.sm,
                paddingHorizontal: SPACING.md,
                paddingVertical: SPACING.sm,
                borderRadius: 25,
                backgroundColor: selectedCategory === category.key ? COLORS.primary : COLORS.surface,
                elevation: selectedCategory === category.key ? 4 : 2,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Icon
                name={category.icon}
                size={18}
                color={selectedCategory === category.key ? 'white' : COLORS.text}
                style={{ marginRight: SPACING.xs }}
              />
              <Text style={{
                color: selectedCategory === category.key ? 'white' : COLORS.text,
                fontWeight: selectedCategory === category.key ? '600' : 'normal',
                marginRight: SPACING.xs,
              }}>
                {category.label}
              </Text>
              <Badge
                style={{
                  backgroundColor: selectedCategory === category.key ? 'rgba(255,255,255,0.3)' : COLORS.primary,
                  color: selectedCategory === category.key ? 'white' : 'white',
                }}
              >
                {category.count}
              </Badge>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Facilities List */}
      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: SPACING.md, paddingTop: 0 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {filteredFacilities.length === 0 ? (
          <Card style={{ padding: SPACING.xl, alignItems: 'center' }}>
            <Icon name="search-off" size={48} color={COLORS.disabled} />
            <Text style={[TEXT_STYLES.body, { marginTop: SPACING.md, textAlign: 'center' }]}>
              No facilities found matching your search
            </Text>
            <Button
              mode="outlined"
              onPress={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              style={{ marginTop: SPACING.md }}
            >
              Clear Filters
            </Button>
          </Card>
        ) : (
          filteredFacilities.map((facility, index) => (
            <Animated.View
              key={facility.id}
              style={{
                opacity: fadeAnim,
                transform: [{
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 50],
                    outputRange: [0, 25 + (index * 10)],
                  })
                }],
              }}
            >
              <Card
                style={{
                  marginBottom: SPACING.md,
                  elevation: 4,
                  borderRadius: 16,
                  overflow: 'hidden',
                }}
                onPress={() => handleFacilityPress(facility)}
              >
                {/* Facility Image */}
                <TouchableOpacity onPress={() => handleImagePress(facility.image)}>
                  <Image
                    source={{ uri: facility.image }}
                    style={{
                      width: '100%',
                      height: 200,
                      backgroundColor: COLORS.disabled,
                    }}
                    resizeMode="cover"
                  />
                  <View style={{
                    position: 'absolute',
                    top: SPACING.md,
                    right: SPACING.md,
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    borderRadius: 20,
                    paddingHorizontal: SPACING.sm,
                    paddingVertical: SPACING.xs,
                  }}>
                    <Icon name="star" size={16} color="#FFD700" />
                    <Text style={{ color: 'white', marginLeft: SPACING.xs, fontSize: 12 }}>
                      {facility.rating}
                    </Text>
                  </View>
                </TouchableOpacity>

                <Card.Content style={{ padding: SPACING.md }}>
                  {/* Header */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
                    <View style={{ flex: 1 }}>
                      <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.xs }]}>
                        {facility.name}
                      </Text>
                      <Text style={TEXT_STYLES.caption} numberOfLines={2}>
                        {facility.description}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', marginLeft: SPACING.sm }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs }}>
                        <Icon
                          name={getAvailabilityIcon(facility.availability)}
                          size={16}
                          color={getAvailabilityColor(facility.availability)}
                        />
                        <Text style={[
                          TEXT_STYLES.caption,
                          { color: getAvailabilityColor(facility.availability), marginLeft: SPACING.xs }
                        ]}>
                          {facility.availability}
                        </Text>
                      </View>
                      <Text style={[TEXT_STYLES.caption]}>
                        {facility.capacity}
                      </Text>
                    </View>
                  </View>

                  {/* Features */}
                  <View style={{ marginBottom: SPACING.sm }}>
                    <ScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ paddingRight: SPACING.md }}
                    >
                      {facility.features.slice(0, 3).map((feature, idx) => (
                        <Chip
                          key={idx}
                          compact
                          style={{ 
                            marginRight: SPACING.sm,
                            backgroundColor: COLORS.background,
                          }}
                          textStyle={{ fontSize: 10 }}
                        >
                          {feature}
                        </Chip>
                      ))}
                      {facility.features.length > 3 && (
                        <Chip
                          compact
                          style={{ 
                            backgroundColor: COLORS.primary,
                          }}
                          textStyle={{ fontSize: 10, color: 'white' }}
                        >
                          +{facility.features.length - 3} more
                        </Chip>
                      )}
                    </ScrollView>
                  </View>

                  {/* Actions */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Button
                      mode="outlined"
                      onPress={() => handleFacilityPress(facility)}
                      style={{ flex: 1, marginRight: SPACING.sm }}
                      contentStyle={{ paddingVertical: SPACING.xs }}
                      labelStyle={{ fontSize: 12 }}
                    >
                      View Details
                    </Button>
                    {facility.bookingRequired && (
                      <Button
                        mode="contained"
                        onPress={() => handleBookFacility(facility)}
                        style={{ 
                          flex: 1,
                          backgroundColor: COLORS.primary,
                        }}
                        contentStyle={{ paddingVertical: SPACING.xs }}
                        labelStyle={{ fontSize: 12 }}
                        icon="calendar-plus"
                      >
                        Book Now
                      </Button>
                    )}
                  </View>
                </Card.Content>
              </Card>
            </Animated.View>
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Facility Details Modal */}
      <Portal>
        <Modal
          visible={showFacilityModal}
          onDismiss={() => setShowFacilityModal(false)}
          contentContainerStyle={{
            backgroundColor: COLORS.surface,
            margin: SPACING.md,
            borderRadius: 16,
            maxHeight: height * 0.8,
          }}
        >
          {selectedFacility && (
            <ScrollView style={{ maxHeight: height * 0.7 }}>
              {/* Modal Header */}
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                padding: SPACING.lg,
                paddingBottom: SPACING.md,
              }}>
                <View style={{ flex: 1 }}>
                  <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.xs }]}>
                    {selectedFacility.name}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon name="star" size={16} color="#FFD700" />
                    <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs }]}>
                      {selectedFacility.rating} rating
                    </Text>
                  </View>
                </View>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => setShowFacilityModal(false)}
                />
              </View>

              <Divider />

              <View style={{ padding: SPACING.lg }}>
                {/* Description */}
                <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.md }]}>
                  {selectedFacility.description}
                </Text>

                {/* Availability & Capacity */}
                <View style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'space-between',
                  marginBottom: SPACING.md,
                }}>
                  <View style={{ flex: 1 }}>
                    <Text style={[TEXT_STYLES.caption, { marginBottom: SPACING.xs }]}>
                      Availability
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Icon
                        name={getAvailabilityIcon(selectedFacility.availability)}
                        size={16}
                        color={getAvailabilityColor(selectedFacility.availability)}
                      />
                      <Text style={[
                        TEXT_STYLES.body,
                        { color: getAvailabilityColor(selectedFacility.availability), marginLeft: SPACING.xs }
                      ]}>
                        {selectedFacility.availability}
                      </Text>
                    </View>
                  </View>
                  <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    <Text style={[TEXT_STYLES.caption, { marginBottom: SPACING.xs }]}>
                      Capacity
                    </Text>
                    <Text style={TEXT_STYLES.body}>
                      {selectedFacility.capacity}
                    </Text>
                  </View>
                </View>

                {/* Features */}
                <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.sm }]}>
                  Features ✨
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.md }}>
                  {selectedFacility.features.map((feature, idx) => (
                    <Chip
                      key={idx}
                      style={{ 
                        marginRight: SPACING.sm,
                        marginBottom: SPACING.sm,
                        backgroundColor: COLORS.background,
                      }}
                    >
                      {feature}
                    </Chip>
                  ))}
                </View>

                {/* Amenities */}
                <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.sm }]}>
                  Amenities 🏆
                </Text>
                {selectedFacility.amenities.map((amenity, idx) => (
                  <View key={idx} style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center',
                    marginBottom: SPACING.sm,
                  }}>
                    <Icon name="check-circle" size={16} color={COLORS.success} />
                    <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.sm }]}>
                      {amenity}
                    </Text>
                  </View>
                ))}

                {/* Actions */}
                <View style={{ marginTop: SPACING.lg }}>
                  {selectedFacility.bookingRequired && (
                    <Button
                      mode="contained"
                      onPress={() => {
                        setShowFacilityModal(false);
                        handleBookFacility(selectedFacility);
                      }}
                      style={{ 
                        marginBottom: SPACING.md,
                        backgroundColor: COLORS.primary,
                      }}
                      icon="calendar-plus"
                    >
                      Book This Facility
                    </Button>
                  )}
                  <Button
                    mode="outlined"
                    onPress={() => setShowFacilityModal(false)}
                  >
                    Close
                  </Button>
                </View>
              </View>
            </ScrollView>
          )}
        </Modal>
      </Portal>

      {/* Image Modal */}
      <Portal>
        <Modal
          visible={showImageModal}
          onDismiss={() => setShowImageModal(false)}
          contentContainerStyle={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.9)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View style={{ position: 'relative' }}>
            <Image
              source={{ uri: selectedImage }}
              style={{
                width: width - SPACING.xl,
                height: (width - SPACING.xl) * 0.75,
                borderRadius: 16,
              }}
              resizeMode="cover"
            />
            <IconButton
              icon="close"
              iconColor="white"
              size={30}
              style={{
                position: 'absolute',
                top: SPACING.md,
                right: SPACING.md,
                backgroundColor: 'rgba(0,0,0,0.5)',
              }}
              onPress={() => setShowImageModal(false)}
            />
          </View>
        </Modal>
      </Portal>

      {/* Quick Book FAB */}
      <FAB
        icon="calendar-plus"
        label="Quick Book"
        onPress={() => {
          Alert.alert(
            '📅 Quick Booking',
            'This feature is coming soon! You\'ll be able to quickly book available facilities.',
            [{ text: 'Got it! 🎯', style: 'default' }]
          );
        }}
        style={{
          position: 'absolute',
          margin: SPACING.md,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.primary,
        }}
      />
    </View>
  );
};

export default AcademyFacilities;