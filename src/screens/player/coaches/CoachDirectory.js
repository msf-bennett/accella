import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  Alert,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import { 
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Searchbar,
  Portal,
  ProgressBar,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const CoachDirectory = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { coaches, loading, error } = useSelector(state => state.coaches);

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCoaches, setFilteredCoaches] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Mock data - replace with Redux actions
  const mockCoaches = [
    {
      id: '1',
      name: 'Sarah Johnson',
      sport: 'Football',
      specialization: 'Youth Development',
      location: 'Nairobi, Kenya',
      rating: 4.8,
      reviewCount: 127,
      hourlyRate: 2500,
      experience: '8 years',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
      verified: true,
      distance: '2.1 km',
      achievements: ['FIFA Level 2', 'Youth Coach Certified'],
      bio: 'Experienced youth football coach specializing in technical skills development and team tactics.',
      availability: 'Mon-Fri 4-8 PM',
      languages: ['English', 'Swahili'],
    },
    {
      id: '2',
      name: 'Michael Ochieng',
      sport: 'Basketball',
      specialization: 'Performance Training',
      location: 'Westlands, Nairobi',
      rating: 4.9,
      reviewCount: 89,
      hourlyRate: 3000,
      experience: '12 years',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      verified: true,
      distance: '5.3 km',
      achievements: ['FIBA Level 3', 'Strength & Conditioning'],
      bio: 'Former professional player turned coach, focusing on athletic performance and skill development.',
      availability: 'Flexible schedule',
      languages: ['English', 'Swahili'],
    },
    {
      id: '3',
      name: 'Grace Wanjiku',
      sport: 'Tennis',
      specialization: 'Beginner Coaching',
      location: 'Karen, Nairobi',
      rating: 4.7,
      reviewCount: 156,
      hourlyRate: 2800,
      experience: '6 years',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      verified: true,
      distance: '8.7 km',
      achievements: ['ITF Certified', 'Junior Development'],
      bio: 'Passionate tennis coach helping beginners discover their love for the game.',
      availability: 'Weekends & Evenings',
      languages: ['English', 'Swahili', 'French'],
    },
  ];

  const sports = ['All Sports', 'Football', 'Basketball', 'Tennis', 'Rugby', 'Swimming', 'Athletics'];
  const locations = ['All Locations', 'Nairobi Central', 'Westlands', 'Karen', 'Kilimani', 'Lavington'];
  const sortOptions = [
    { label: 'Rating', value: 'rating' },
    { label: 'Distance', value: 'distance' },
    { label: 'Price (Low to High)', value: 'price_asc' },
    { label: 'Price (High to Low)', value: 'price_desc' },
    { label: 'Experience', value: 'experience' },
  ];

  // Animation setup
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Filter and search logic
  useEffect(() => {
    let filtered = mockCoaches;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(coach =>
        coach.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coach.sport.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coach.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coach.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sport filter
    if (selectedSport !== 'all' && selectedSport !== 'All Sports') {
      filtered = filtered.filter(coach => coach.sport === selectedSport);
    }

    // Location filter
    if (selectedLocation !== 'all' && selectedLocation !== 'All Locations') {
      filtered = filtered.filter(coach => 
        coach.location.includes(selectedLocation)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'distance':
          return parseFloat(a.distance) - parseFloat(b.distance);
        case 'price_asc':
          return a.hourlyRate - b.hourlyRate;
        case 'price_desc':
          return b.hourlyRate - a.hourlyRate;
        case 'experience':
          return parseInt(b.experience) - parseInt(a.experience);
        default:
          return 0;
      }
    });

    setFilteredCoaches(filtered);
  }, [searchQuery, selectedSport, selectedLocation, sortBy]);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Dispatch action to fetch coaches
      // await dispatch(fetchCoaches());
      Alert.alert('Success', 'Coach directory updated! 🎯');
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh coaches');
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  // Booking handler
  const handleBookSession = (coach) => {
    setSelectedCoach(coach);
    setBookingModalVisible(true);
  };

  // Contact handler
  const handleContact = (coach) => {
    Alert.alert(
      'Contact Coach',
      `Connect with ${coach.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Message', onPress: () => navigation.navigate('Chat', { coachId: coach.id }) },
        { text: 'Call', onPress: () => Alert.alert('Feature Coming Soon', 'Voice calling will be available in the next update! 📞') },
      ]
    );
  };

  // Render coach card
  const renderCoachCard = (coach, index) => (
    <Animated.View
      key={coach.id}
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <Card
        style={{
          marginHorizontal: SPACING.md,
          marginBottom: SPACING.md,
          elevation: 4,
          borderRadius: 12,
        }}
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={{
            padding: SPACING.md,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Avatar.Image
                size={60}
                source={{ uri: coach.avatar }}
                style={{ marginRight: SPACING.md }}
              />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[TEXT_STYLES.h3, { color: 'white', flex: 1 }]}>
                    {coach.name}
                  </Text>
                  {coach.verified && (
                    <Icon name="verified" size={20} color="#4CAF50" />
                  )}
                </View>
                <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.9)' }]}>
                  {coach.sport} • {coach.specialization}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <Icon name="star" size={16} color="#FFD700" />
                  <Text style={[TEXT_STYLES.caption, { color: 'white', marginLeft: 4 }]}>
                    {coach.rating} ({coach.reviewCount} reviews)
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>

        <Card.Content style={{ padding: SPACING.md }}>
          <View style={{ flexDirection: 'row', marginBottom: SPACING.sm }}>
            <Icon name="location-on" size={16} color={COLORS.primary} />
            <Text style={[TEXT_STYLES.body, { marginLeft: 4, color: COLORS.textSecondary }]}>
              {coach.location} • {coach.distance}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', marginBottom: SPACING.sm }}>
            <Icon name="schedule" size={16} color={COLORS.primary} />
            <Text style={[TEXT_STYLES.body, { marginLeft: 4, color: COLORS.textSecondary }]}>
              {coach.availability}
            </Text>
          </View>

          <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.md, color: COLORS.text }]}>
            {coach.bio}
          </Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.md }}>
            {coach.achievements.map((achievement, idx) => (
              <Chip
                key={idx}
                mode="outlined"
                style={{ marginRight: SPACING.xs, marginBottom: SPACING.xs }}
                textStyle={{ fontSize: 11 }}
              >
                {achievement}
              </Chip>
            ))}
          </View>

          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            paddingTop: SPACING.sm,
            borderTopWidth: 1,
            borderTopColor: COLORS.border,
          }}>
            <View>
              <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>
                KSh {coach.hourlyRate.toLocaleString()}/hr
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                {coach.experience} experience
              </Text>
            </View>
            
            <View style={{ flexDirection: 'row' }}>
              <IconButton
                icon="message"
                mode="contained"
                iconColor="white"
                containerColor={COLORS.primary}
                size={20}
                onPress={() => handleContact(coach)}
              />
              <Button
                mode="contained"
                onPress={() => handleBookSession(coach)}
                style={{ 
                  marginLeft: SPACING.sm,
                  backgroundColor: COLORS.success,
                }}
                labelStyle={{ color: 'white' }}
              >
                Book Session
              </Button>
            </View>
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  // Render filter chips
  const renderFilterChips = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ paddingHorizontal: SPACING.md, marginBottom: SPACING.md }}
    >
      {sports.map((sport) => (
        <Chip
          key={sport}
          selected={selectedSport === sport || (selectedSport === 'all' && sport === 'All Sports')}
          onPress={() => setSelectedSport(sport === 'All Sports' ? 'all' : sport)}
          style={{ marginRight: SPACING.sm }}
          selectedColor={COLORS.primary}
        >
          {sport}
        </Chip>
      ))}
    </ScrollView>
  );

  // Filter modal content
  const renderFilterModal = () => (
    <Portal>
      <Modal
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={{ paddingTop: 50, paddingBottom: SPACING.lg, paddingHorizontal: SPACING.md }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={[TEXT_STYLES.h2, { color: 'white' }]}>Filters & Sort</Text>
              <IconButton
                icon="close"
                iconColor="white"
                onPress={() => setFilterModalVisible(false)}
              />
            </View>
          </LinearGradient>

          <ScrollView style={{ flex: 1, padding: SPACING.md }}>
            {/* Location Filter */}
            <Surface style={{ padding: SPACING.md, marginBottom: SPACING.md, borderRadius: 12 }}>
              <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.sm }]}>Location</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {locations.map((location) => (
                  <Chip
                    key={location}
                    selected={selectedLocation === location || (selectedLocation === 'all' && location === 'All Locations')}
                    onPress={() => setSelectedLocation(location === 'All Locations' ? 'all' : location)}
                    style={{ marginRight: SPACING.sm, marginBottom: SPACING.sm }}
                    selectedColor={COLORS.primary}
                  >
                    {location}
                  </Chip>
                ))}
              </View>
            </Surface>

            {/* Sort Options */}
            <Surface style={{ padding: SPACING.md, marginBottom: SPACING.md, borderRadius: 12 }}>
              <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.sm }]}>Sort By</Text>
              {sortOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => setSortBy(option.value)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: SPACING.sm,
                    borderBottomWidth: 1,
                    borderBottomColor: COLORS.border,
                  }}
                >
                  <Icon
                    name={sortBy === option.value ? 'radio-button-checked' : 'radio-button-unchecked'}
                    size={20}
                    color={sortBy === option.value ? COLORS.primary : COLORS.textSecondary}
                  />
                  <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.sm, flex: 1 }]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </Surface>

            {/* Quick Stats */}
            <Surface style={{ padding: SPACING.md, borderRadius: 12 }}>
              <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.sm }]}>Search Results</Text>
              <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary }]}>
                {filteredCoaches.length} coaches found matching your criteria
              </Text>
            </Surface>
          </ScrollView>

          <View style={{ 
            padding: SPACING.md,
            borderTopWidth: 1,
            borderTopColor: COLORS.border,
            backgroundColor: 'white',
          }}>
            <Button
              mode="contained"
              onPress={() => setFilterModalVisible(false)}
              style={{ backgroundColor: COLORS.primary }}
            >
              Apply Filters ({filteredCoaches.length} results)
            </Button>
          </View>
        </View>
      </Modal>
    </Portal>
  );

  // Booking modal
  const renderBookingModal = () => (
    <Portal>
      <Modal
        visible={bookingModalVisible}
        onRequestClose={() => setBookingModalVisible(false)}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {selectedCoach && (
          <View style={{ flex: 1, backgroundColor: COLORS.background }}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={{ paddingTop: 50, paddingBottom: SPACING.lg, paddingHorizontal: SPACING.md }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={[TEXT_STYLES.h2, { color: 'white' }]}>Book Session</Text>
                <IconButton
                  icon="close"
                  iconColor="white"
                  onPress={() => setBookingModalVisible(false)}
                />
              </View>
            </LinearGradient>

            <ScrollView style={{ flex: 1, padding: SPACING.md }}>
              <Card style={{ marginBottom: SPACING.md }}>
                <Card.Content style={{ padding: SPACING.md }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
                    <Avatar.Image
                      size={50}
                      source={{ uri: selectedCoach.avatar }}
                      style={{ marginRight: SPACING.md }}
                    />
                    <View>
                      <Text style={TEXT_STYLES.h3}>{selectedCoach.name}</Text>
                      <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary }]}>
                        {selectedCoach.sport} Coach
                      </Text>
                    </View>
                  </View>
                  
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm }}>
                    <Text style={TEXT_STYLES.body}>Hourly Rate:</Text>
                    <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>
                      KSh {selectedCoach.hourlyRate.toLocaleString()}
                    </Text>
                  </View>
                  
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={TEXT_STYLES.body}>Availability:</Text>
                    <Text style={[TEXT_STYLES.body, { color: COLORS.success }]}>
                      {selectedCoach.availability}
                    </Text>
                  </View>
                </Card.Content>
              </Card>

              {/* Session Type Selection */}
              <Surface style={{ padding: SPACING.md, marginBottom: SPACING.md, borderRadius: 12 }}>
                <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.sm }]}>Session Type</Text>
                {['1-on-1 Training', 'Group Session', 'Assessment Session', 'Consultation'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: SPACING.sm,
                      borderBottomWidth: 1,
                      borderBottomColor: COLORS.border,
                    }}
                  >
                    <Icon name="radio-button-unchecked" size={20} color={COLORS.primary} />
                    <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.sm }]}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </Surface>

              {/* Quick Actions */}
              <View style={{ flexDirection: 'row', marginBottom: SPACING.md }}>
                <Button
                  mode="outlined"
                  onPress={() => navigation.navigate('CoachProfile', { coachId: selectedCoach.id })}
                  style={{ flex: 1, marginRight: SPACING.sm }}
                  icon="account"
                >
                  View Profile
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => handleContact(selectedCoach)}
                  style={{ flex: 1, marginLeft: SPACING.sm }}
                  icon="message"
                >
                  Message
                </Button>
              </View>
            </ScrollView>

            <View style={{ 
              padding: SPACING.md,
              borderTopWidth: 1,
              borderTopColor: COLORS.border,
              backgroundColor: 'white',
            }}>
              <Button
                mode="contained"
                onPress={() => {
                  setBookingModalVisible(false);
                  Alert.alert(
                    'Booking Request Sent! 📅',
                    `Your session request has been sent to ${selectedCoach.name}. They will respond within 24 hours.`
                  );
                }}
                style={{ backgroundColor: COLORS.success }}
                icon="calendar-today"
              >
                Send Booking Request
              </Button>
            </View>
          </View>
        )}
      </Modal>
    </Portal>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{ paddingTop: 50, paddingBottom: SPACING.lg, paddingHorizontal: SPACING.md }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={[TEXT_STYLES.h1, { color: 'white' }]}>Find Coaches</Text>
            <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.9)' }]}>
              Discover expert coaches near you 🏆
            </Text>
          </View>
          <IconButton
            icon="tune"
            iconColor="white"
            onPress={() => setFilterModalVisible(true)}
          />
        </View>

        {/* Search Bar */}
        <Searchbar
          placeholder="Search coaches, sports, or specializations..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={{
            marginTop: SPACING.md,
            elevation: 4,
            borderRadius: 25,
          }}
          iconColor={COLORS.primary}
          inputStyle={{ color: COLORS.text }}
        />
      </LinearGradient>

      {/* Filter Chips */}
      {renderFilterChips()}

      {/* Results Header */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        marginBottom: SPACING.sm 
      }}>
        <Text style={[TEXT_STYLES.h3, { color: COLORS.text }]}>
          {filteredCoaches.length} Coaches Available
        </Text>
        <TouchableOpacity
          onPress={() => setFilterModalVisible(true)}
          style={{ flexDirection: 'row', alignItems: 'center' }}
        >
          <Icon name="sort" size={16} color={COLORS.primary} />
          <Text style={[TEXT_STYLES.caption, { color: COLORS.primary, marginLeft: 4 }]}>
            Sort
          </Text>
        </TouchableOpacity>
      </View>

      {/* Coaches List */}
      <ScrollView
        style={{ flex: 1 }}
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
        {loading ? (
          <View style={{ padding: SPACING.md }}>
            {[1, 2, 3].map((_, index) => (
              <Card key={index} style={{ marginBottom: SPACING.md }}>
                <Card.Content style={{ padding: SPACING.md }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
                    <Surface style={{ width: 60, height: 60, borderRadius: 30, marginRight: SPACING.md }} />
                    <View style={{ flex: 1 }}>
                      <Surface style={{ height: 20, borderRadius: 4, marginBottom: SPACING.xs }} />
                      <Surface style={{ height: 16, borderRadius: 4, width: '70%' }} />
                    </View>
                  </View>
                  <ProgressBar indeterminate color={COLORS.primary} />
                </Card.Content>
              </Card>
            ))}
          </View>
        ) : filteredCoaches.length > 0 ? (
          <View style={{ paddingBottom: 100 }}>
            {filteredCoaches.map((coach, index) => renderCoachCard(coach, index))}
          </View>
        ) : (
          <View style={{ 
            flex: 1, 
            justifyContent: 'center', 
            alignItems: 'center', 
            paddingHorizontal: SPACING.lg,
            paddingVertical: 100,
          }}>
            <Icon name="search-off" size={80} color={COLORS.textSecondary} />
            <Text style={[TEXT_STYLES.h2, { marginTop: SPACING.md, textAlign: 'center' }]}>
              No Coaches Found
            </Text>
            <Text style={[TEXT_STYLES.body, { 
              color: COLORS.textSecondary, 
              textAlign: 'center',
              marginTop: SPACING.sm,
              marginBottom: SPACING.lg,
            }]}>
              Try adjusting your search filters or expanding your location radius
            </Text>
            <Button
              mode="contained"
              onPress={() => {
                setSearchQuery('');
                setSelectedSport('all');
                setSelectedLocation('all');
              }}
              style={{ backgroundColor: COLORS.primary }}
            >
              Clear All Filters
            </Button>
          </View>
        )}
      </ScrollView>

      {/* Quick Action FAB */}
      <FAB
        icon="add"
        style={{
          position: 'absolute',
          margin: SPACING.md,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.primary,
        }}
        onPress={() => {
          Alert.alert(
            'Quick Actions',
            'What would you like to do?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Become a Coach', onPress: () => navigation.navigate('BecomeCoach') },
              { text: 'Invite Coach', onPress: () => Alert.alert('Feature Coming Soon', 'Coach invitation system will be available soon! 📧') },
            ]
          );
        }}
      />

      {/* Modals */}
      {renderFilterModal()}
      {renderBookingModal()}
    </View>
  );
};

// Screen options for navigation
CoachDirectory.options = {
  title: 'Find Coaches',
  headerShown: false,
};

export default CoachDirectory;