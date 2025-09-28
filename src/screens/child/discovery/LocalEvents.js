import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Animated,
  Alert,
  TouchableOpacity,
  FlatList,
  Dimensions,
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
  ProgressBar,
  FAB,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const LocalEvents = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { events, loading } = useSelector(state => state.discovery);

  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);
  const fabAnim = new Animated.Value(0);

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('upcoming');
  const [filters, setFilters] = useState({
    sport: 'all',
    eventType: 'all',
    distance: '10km',
    ageGroup: 'all',
    price: 'all',
  });
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Mock data for local events
  const [eventsData] = useState([
    {
      id: '1',
      title: 'Youth Soccer Tournament 2025',
      type: 'Tournament',
      sport: 'Football',
      date: '2025-09-15',
      time: '09:00 AM',
      endDate: '2025-09-17',
      venue: 'Central Park Sports Complex',
      address: '123 Sports Ave, New York, NY',
      distance: '2.3 km',
      price: 'Free',
      ageGroups: ['12-14', '15-17'],
      organizer: 'NYC Youth Sports League',
      participants: 127,
      maxParticipants: 200,
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
      description: 'Annual youth soccer tournament featuring teams from across the city. Great opportunity for young players to showcase their skills!',
      features: ['Trophies', 'Certificates', 'Refreshments', 'Photo Gallery'],
      registrationDeadline: '2025-09-10',
      difficulty: 'All Levels',
      isRegistered: false,
      isFavorite: true,
    },
    {
      id: '2',
      title: 'Basketball Skills Camp',
      type: 'Camp',
      sport: 'Basketball',
      date: '2025-09-20',
      time: '10:00 AM',
      endDate: '2025-09-22',
      venue: 'Brooklyn Basketball Academy',
      address: '456 Court St, Brooklyn, NY',
      distance: '5.7 km',
      price: '$50',
      ageGroups: ['13-15'],
      organizer: 'Elite Basketball Training',
      participants: 45,
      maxParticipants: 60,
      image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400',
      description: '3-day intensive basketball skills camp focusing on fundamentals, shooting, and game strategy.',
      features: ['Professional Coaches', 'Equipment Provided', 'Lunch Included', 'Certificate'],
      registrationDeadline: '2025-09-15',
      difficulty: 'Beginner to Intermediate',
      isRegistered: true,
      isFavorite: false,
    },
    {
      id: '3',
      title: 'Tennis Open Day',
      type: 'Open Day',
      sport: 'Tennis',
      date: '2025-09-12',
      time: '02:00 PM',
      endDate: '2025-09-12',
      venue: 'Manhattan Tennis Club',
      address: '789 Racket Rd, Manhattan, NY',
      distance: '8.1 km',
      price: 'Free',
      ageGroups: ['All Ages'],
      organizer: 'Manhattan Tennis Club',
      participants: 23,
      maxParticipants: 50,
      image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400',
      description: 'Free tennis open day with coaching sessions, equipment trials, and mini tournaments.',
      features: ['Free Coaching', 'Equipment Trial', 'Refreshments', 'Club Tour'],
      registrationDeadline: '2025-09-10',
      difficulty: 'All Levels',
      isRegistered: false,
      isFavorite: false,
    },
    {
      id: '4',
      title: 'Swimming Championships',
      type: 'Competition',
      sport: 'Swimming',
      date: '2025-09-25',
      time: '08:00 AM',
      endDate: '2025-09-25',
      venue: 'Aquatic Sports Center',
      address: '321 Pool Lane, Queens, NY',
      distance: '12.4 km',
      price: '$25',
      ageGroups: ['14-16', '17-18'],
      organizer: 'Metro Swimming Association',
      participants: 89,
      maxParticipants: 120,
      image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400',
      description: 'Regional swimming championships with multiple events and divisions.',
      features: ['Medals', 'Live Timing', 'Video Recording', 'Awards Ceremony'],
      registrationDeadline: '2025-09-20',
      difficulty: 'Intermediate to Advanced',
      isRegistered: false,
      isFavorite: true,
    },
    {
      id: '5',
      title: 'Multi-Sport Fun Day',
      type: 'Fun Day',
      sport: 'Multi-Sport',
      date: '2025-09-18',
      time: '11:00 AM',
      endDate: '2025-09-18',
      venue: 'Community Sports Ground',
      address: '654 Play St, Bronx, NY',
      distance: '15.2 km',
      price: 'Free',
      ageGroups: ['10-16'],
      organizer: 'Bronx Youth Foundation',
      participants: 156,
      maxParticipants: 200,
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
      description: 'Family-friendly multi-sport event with activities for all skill levels and ages.',
      features: ['Multiple Sports', 'Family Activities', 'Food Stalls', 'Entertainment'],
      registrationDeadline: '2025-09-15',
      difficulty: 'All Levels',
      isRegistered: false,
      isFavorite: false,
    },
  ]);

  const eventTabs = [
    { key: 'upcoming', label: 'Upcoming', icon: 'event' },
    { key: 'registered', label: 'Registered', icon: 'check-circle' },
    { key: 'favorites', label: 'Favorites', icon: 'favorite' },
  ];

  const eventTypes = ['All Types', 'Tournament', 'Camp', 'Competition', 'Open Day', 'Fun Day', 'Workshop'];
  const sports = ['All Sports', 'Football', 'Basketball', 'Tennis', 'Swimming', 'Baseball', 'Multi-Sport'];
  const distances = ['5 km', '10 km', '25 km', '50 km', 'Any Distance'];
  const ageGroups = ['All Ages', '10-12', '13-15', '16-18', '18+'];
  const priceRanges = ['All Prices', 'Free', '$1-$25', '$26-$50', '$51-$100', '$100+'];

  // Entrance animation
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
      Animated.timing(fabAnim, {
        toValue: 1,
        duration: 1000,
        delay: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    // Implement search logic here
  }, []);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value.toLowerCase().replace(' ', '').replace('-', '')
    }));
  };

  const handleEventRegistration = (eventId) => {
    const event = eventsData.find(e => e.id === eventId);
    if (event.isRegistered) {
      Alert.alert(
        'Unregister',
        'Are you sure you want to unregister from this event?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Unregister',
            style: 'destructive',
            onPress: () => {
              Alert.alert('Success', 'Successfully unregistered from event! 📝');
            }
          }
        ]
      );
    } else {
      Alert.alert(
        'Register for Event',
        `Register for "${event.title}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Register',
            onPress: () => {
              Alert.alert('Success', 'Registration successful! You\'ll receive a confirmation email soon. 🎉');
            }
          }
        ]
      );
    }
  };

  const handleToggleFavorite = (eventId) => {
    // Implement favorite toggle logic
    Alert.alert('Success', 'Favorite status updated! ⭐');
  };

  const handleShareEvent = (event) => {
    Alert.alert(
      'Feature Development',
      'Event sharing feature is coming soon! 📤',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const handleViewEventDetails = (event) => {
    Alert.alert(
      'Feature Development',
      'Detailed event view is coming soon! 📋',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const getEventTypeColor = (type) => {
    switch (type.toLowerCase()) {
      case 'tournament': return COLORS.primary;
      case 'camp': return COLORS.success;
      case 'competition': return COLORS.error;
      case 'open day': return COLORS.warning;
      case 'fun day': return COLORS.secondary;
      case 'workshop': return COLORS.info;
      default: return COLORS.text;
    }
  };

  const getFilteredEvents = () => {
    let filtered = eventsData;

    if (selectedTab === 'registered') {
      filtered = filtered.filter(event => event.isRegistered);
    } else if (selectedTab === 'favorites') {
      filtered = filtered.filter(event => event.isFavorite);
    }

    return filtered;
  };

  const renderEventCard = ({ item, index }) => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        marginBottom: SPACING.md,
      }}
    >
      <Card style={styles.eventCard} elevation={3}>
        <View style={styles.eventImageContainer}>
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.imageGradient}
          >
            <View style={styles.eventHeader}>
              <Chip
                mode="flat"
                style={[styles.typeChip, { backgroundColor: getEventTypeColor(item.type) }]}
                textStyle={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}
              >
                {item.type}
              </Chip>
              <IconButton
                icon={item.isFavorite ? 'favorite' : 'favorite-border'}
                size={24}
                iconColor={item.isFavorite ? COLORS.error : 'white'}
                onPress={() => handleToggleFavorite(item.id)}
                style={styles.favoriteButton}
              />
            </View>
            
            <View style={styles.eventTitleContainer}>
              <Text style={[TEXT_STYLES.h3, { color: 'white', marginBottom: 4 }]}>
                {item.title}
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.9)' }]}>
                📍 {item.distance} • {item.venue}
              </Text>
            </View>
          </LinearGradient>
        </View>

        <Card.Content style={styles.cardContent}>
          <View style={styles.eventInfo}>
            <View style={styles.dateTimeContainer}>
              <View style={styles.dateInfo}>
                <Icon name="event" size={16} color={COLORS.primary} />
                <Text style={[TEXT_STYLES.body, { marginLeft: 6, color: COLORS.text }]}>
                  {new Date(item.date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </Text>
              </View>
              <View style={styles.timeInfo}>
                <Icon name="schedule" size={16} color={COLORS.textSecondary} />
                <Text style={[TEXT_STYLES.caption, { marginLeft: 6, color: COLORS.textSecondary }]}>
                  {item.time}
                </Text>
              </View>
            </View>

            <View style={styles.priceContainer}>
              <Text style={[TEXT_STYLES.h3, { color: item.price === 'Free' ? COLORS.success : COLORS.primary }]}>
                {item.price}
              </Text>
            </View>
          </View>

          <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginVertical: SPACING.sm }]}>
            {item.description}
          </Text>

          <View style={styles.participantsContainer}>
            <View style={styles.participantsInfo}>
              <Icon name="people" size={16} color={COLORS.textSecondary} />
              <Text style={[TEXT_STYLES.caption, { marginLeft: 6, color: COLORS.textSecondary }]}>
                {item.participants}/{item.maxParticipants} participants
              </Text>
            </View>
            <ProgressBar
              progress={item.participants / item.maxParticipants}
              color={COLORS.primary}
              style={styles.progressBar}
            />
          </View>

          <View style={styles.detailsContainer}>
            <Chip
              mode="outlined"
              style={styles.detailChip}
              textStyle={{ fontSize: 12 }}
            >
              {item.sport}
            </Chip>
            <Chip
              mode="outlined"
              style={styles.detailChip}
              textStyle={{ fontSize: 12 }}
            >
              {item.ageGroups.join(', ')}
            </Chip>
            <Chip
              mode="outlined"
              style={styles.detailChip}
              textStyle={{ fontSize: 12 }}
            >
              {item.difficulty}
            </Chip>
          </View>

          {item.features.length > 0 && (
            <View style={styles.featuresContainer}>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginBottom: 6 }]}>
                ✨ What's included:
              </Text>
              <View style={styles.featuresList}>
                {item.features.slice(0, 3).map((feature, idx) => (
                  <Chip
                    key={idx}
                    mode="flat"
                    style={styles.featureChip}
                    textStyle={{ fontSize: 11 }}
                  >
                    {feature}
                  </Chip>
                ))}
                {item.features.length > 3 && (
                  <Chip
                    mode="flat"
                    style={styles.featureChip}
                    textStyle={{ fontSize: 11 }}
                  >
                    +{item.features.length - 3} more
                  </Chip>
                )}
              </View>
            </View>
          )}

          <View style={styles.actionContainer}>
            <Button
              mode={item.isRegistered ? "outlined" : "contained"}
              onPress={() => handleEventRegistration(item.id)}
              style={[
                styles.actionButton,
                item.isRegistered && styles.registeredButton
              ]}
              buttonColor={item.isRegistered ? 'transparent' : COLORS.primary}
              textColor={item.isRegistered ? COLORS.primary : 'white'}
              contentStyle={styles.buttonContent}
              labelStyle={{ fontSize: 14 }}
            >
              {item.isRegistered ? 'Registered ✓' : 'Register'}
            </Button>
            <IconButton
              icon="share"
              size={20}
              onPress={() => handleShareEvent(item)}
              style={styles.shareButton}
            />
            <IconButton
              icon="info"
              size={20}
              onPress={() => handleViewEventDetails(item)}
              style={styles.infoButton}
            />
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      {eventTabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          onPress={() => setSelectedTab(tab.key)}
          style={[
            styles.tabButton,
            selectedTab === tab.key && styles.activeTabButton
          ]}
        >
          <Icon
            name={tab.icon}
            size={20}
            color={selectedTab === tab.key ? 'white' : COLORS.textSecondary}
          />
          <Text
            style={[
              TEXT_STYLES.caption,
              {
                color: selectedTab === tab.key ? 'white' : COLORS.textSecondary,
                marginLeft: 6,
                fontWeight: selectedTab === tab.key ? 'bold' : 'normal'
              }
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderFilterModal = () => (
    <Portal>
      <Modal
        visible={showFilterModal}
        onDismiss={() => setShowFilterModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Surface style={styles.filterModal}>
          <View style={styles.modalHeader}>
            <Text style={[TEXT_STYLES.h2, { color: COLORS.text }]}>Event Filters</Text>
            <IconButton
              icon="close"
              onPress={() => setShowFilterModal(false)}
            />
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.filterSection}>
              <Text style={[TEXT_STYLES.h3, styles.filterTitle]}>Event Type</Text>
              <View style={styles.filterChips}>
                {eventTypes.map((type, index) => (
                  <Chip
                    key={index}
                    selected={filters.eventType === type.toLowerCase().replace(' ', '')}
                    onPress={() => handleFilterChange('eventType', type)}
                    style={styles.filterChip}
                  >
                    {type}
                  </Chip>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={[TEXT_STYLES.h3, styles.filterTitle]}>Sport</Text>
              <View style={styles.filterChips}>
                {sports.map((sport, index) => (
                  <Chip
                    key={index}
                    selected={filters.sport === sport.toLowerCase().replace(' ', '').replace('-', '')}
                    onPress={() => handleFilterChange('sport', sport)}
                    style={styles.filterChip}
                  >
                    {sport}
                  </Chip>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={[TEXT_STYLES.h3, styles.filterTitle]}>Distance</Text>
              <View style={styles.filterChips}>
                {distances.map((distance, index) => (
                  <Chip
                    key={index}
                    selected={filters.distance === distance.toLowerCase().replace(' ', '')}
                    onPress={() => handleFilterChange('distance', distance)}
                    style={styles.filterChip}
                  >
                    {distance}
                  </Chip>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={[TEXT_STYLES.h3, styles.filterTitle]}>Age Group</Text>
              <View style={styles.filterChips}>
                {ageGroups.map((age, index) => (
                  <Chip
                    key={index}
                    selected={filters.ageGroup === age.toLowerCase().replace(' ', '').replace('-', '')}
                    onPress={() => handleFilterChange('ageGroup', age)}
                    style={styles.filterChip}
                  >
                    {age}
                  </Chip>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={[TEXT_STYLES.h3, styles.filterTitle]}>Price Range</Text>
              <View style={styles.filterChips}>
                {priceRanges.map((price, index) => (
                  <Chip
                    key={index}
                    selected={filters.price === price.toLowerCase().replace(' ', '').replace('-', '').replace('$', '').replace('+', '')}
                    onPress={() => handleFilterChange('price', price)}
                    style={styles.filterChip}
                  >
                    {price}
                  </Chip>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => {
                setFilters({
                  sport: 'all',
                  eventType: 'all',
                  distance: '10km',
                  ageGroup: 'all',
                  price: 'all',
                });
              }}
              style={styles.clearButton}
            >
              Clear All
            </Button>
            <Button
              mode="contained"
              onPress={() => setShowFilterModal(false)}
              style={styles.applyButton}
            >
              Apply Filters
            </Button>
          </View>
        </Surface>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="transparent" translucent barStyle="light-content" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Text style={[TEXT_STYLES.h1, styles.headerTitle]}>Local Events 🏆</Text>
        <Text style={[TEXT_STYLES.body, styles.headerSubtitle]}>
          Discover amazing sports events near you!
        </Text>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search events..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchbar}
          iconColor={COLORS.primary}
          inputStyle={TEXT_STYLES.body}
        />
        <IconButton
          icon="filter-variant"
          size={24}
          onPress={() => setShowFilterModal(true)}
          style={styles.filterButton}
          iconColor={COLORS.primary}
        />
      </View>

      {renderTabBar()}

      <FlatList
        data={getFilteredEvents()}
        renderItem={renderEventCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            progressBackgroundColor={COLORS.background}
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Icon name="event-busy" size={64} color={COLORS.textSecondary} />
            <Text style={[TEXT_STYLES.h3, { color: COLORS.textSecondary, marginTop: SPACING.md }]}>
              No events found
            </Text>
            <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary, textAlign: 'center' }]}>
              Try adjusting your filters or check back later for new events
            </Text>
          </View>
        )}
      />

      <Animated.View
        style={[
          styles.fabContainer,
          {
            opacity: fabAnim,
            transform: [{ scale: fabAnim }]
          }
        ]}
      >
        <FAB
          icon="add"
          style={styles.fab}
          onPress={() => {
            Alert.alert(
              'Feature Development',
              'Event creation feature is coming soon! 📅',
              [{ text: 'OK', style: 'default' }]
            );
          }}
        />
      </Animated.View>

      {renderFilterModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.lg,
    paddingTop: SPACING.xl + 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    color: 'white',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  searchbar: {
    flex: 1,
    elevation: 2,
    backgroundColor: 'white',
  },
  filterButton: {
    marginLeft: SPACING.sm,
    backgroundColor: 'white',
    elevation: 2,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
    marginHorizontal: SPACING.xs,
  },
  activeTabButton: {
    backgroundColor: COLORS.primary,
  },
  listContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl * 2,
  },
  eventCard: {
    borderRadius: 16,
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  eventImageContainer: {
    height: 120,
    backgroundColor: COLORS.primaryLight,
  },
  imageGradient: {
    flex: 1,
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  typeChip: {
    height: 28,
  },
  favoriteButton: {
    margin: 0,
  },
  eventTitleContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  cardContent: {
    padding: SPACING.md,
  },
  eventInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  dateTimeContainer: {
    flex: 1,
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  participantsContainer: {
    marginVertical: SPACING.sm,
  },
  participantsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  detailsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: SPACING.sm,
  },
  detailChip: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
    height: 28,
  },
  featuresContainer: {
    marginVertical: SPACING.sm,
  },
  featuresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureChip: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
    backgroundColor: COLORS.primaryLight,
    height: 26,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    marginRight: SPACING.sm,
    borderRadius: 20,
  },
  registeredButton: {
    borderColor: COLORS.success,
  },
  buttonContent: {
    paddingHorizontal: SPACING.sm,
  },
  shareButton: {
    marginRight: SPACING.xs,
  },
  infoButton: {
    marginLeft: SPACING.xs,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
  },
  filterModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterSection: {
    padding: SPACING.md,
  },
  filterTitle: {
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterChip: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  clearButton: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  applyButton: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  fabContainer: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.lg,
  },
  fab: {
    backgroundColor: COLORS.primary,
  },
});

export default LocalEvents;