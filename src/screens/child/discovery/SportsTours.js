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
  ImageBackground,
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
  Badge,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const SportsTours = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { tours, loading } = useSelector(state => state.discovery);

  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);
  const headerAnim = new Animated.Value(0);

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filters, setFilters] = useState({
    duration: 'all',
    destination: 'all',
    sport: 'all',
    ageGroup: 'all',
    budget: 'all',
  });
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedTour, setSelectedTour] = useState(null);
  const [showWishlist, setShowWishlist] = useState(false);

  // Mock data for sports tours
  const [toursData] = useState([
    {
      id: '1',
      title: 'European Football Academy Tour',
      category: 'Training Camp',
      sport: 'Football',
      destination: 'Barcelona, Spain',
      country: 'Spain',
      duration: '10 days',
      dates: '2025-07-15 to 2025-07-25',
      price: '$2,499',
      currency: 'USD',
      ageGroup: '14-18',
      maxParticipants: 24,
      currentParticipants: 18,
      image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400',
      organizer: 'Elite Sports Adventures',
      rating: 4.8,
      reviews: 127,
      highlights: [
        'Train at FC Barcelona facilities',
        'Meet professional coaches',
        'Stadium tours & matches',
        'Cultural city exploration',
        'Certificate of completion'
      ],
      included: ['Accommodation', 'Meals', 'Training', 'Equipment', 'Insurance'],
      difficulty: 'Intermediate to Advanced',
      isWishlisted: true,
      isBooked: false,
      earlyBird: true,
      featured: true,
      testimonial: 'Amazing experience! Learned so much from world-class coaches.',
    },
    {
      id: '2',
      title: 'Basketball Skills Camp USA',
      category: 'Skills Development',
      sport: 'Basketball',
      destination: 'Los Angeles, USA',
      country: 'USA',
      duration: '7 days',
      dates: '2025-08-10 to 2025-08-17',
      price: '$1,899',
      currency: 'USD',
      ageGroup: '13-17',
      maxParticipants: 30,
      currentParticipants: 22,
      image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400',
      organizer: 'Pro Basketball Tours',
      rating: 4.6,
      reviews: 89,
      highlights: [
        'NBA-style training sessions',
        'Visit Lakers training facility',
        'Meet former NBA players',
        'Hollywood & beach visits',
        'Skills assessment report'
      ],
      included: ['Hotel Stay', 'All Meals', 'Training Gear', 'Transportation', 'Activities'],
      difficulty: 'All Levels',
      isWishlisted: false,
      isBooked: true,
      earlyBird: false,
      featured: false,
      testimonial: 'Perfect mix of training and fun activities!',
    },
    {
      id: '3',
      title: 'Tennis Excellence Tour',
      category: 'Competition',
      sport: 'Tennis',
      destination: 'Wimbledon, UK',
      country: 'UK',
      duration: '12 days',
      dates: '2025-06-20 to 2025-07-02',
      price: '$3,299',
      currency: 'USD',
      ageGroup: '15-18',
      maxParticipants: 16,
      currentParticipants: 12,
      image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400',
      organizer: 'Championship Tennis Tours',
      rating: 4.9,
      reviews: 156,
      highlights: [
        'Wimbledon Championships attendance',
        'Train at All England Club',
        'Meet Grand Slam champions',
        'London cultural tour',
        'Competition matches'
      ],
      included: ['Premium Hotels', 'Gourmet Meals', 'Event Tickets', 'Coaching', 'Transfers'],
      difficulty: 'Advanced',
      isWishlisted: true,
      isBooked: false,
      earlyBird: false,
      featured: true,
      testimonial: 'Unforgettable experience at the most prestigious tennis venue!',
    },
    {
      id: '4',
      title: 'Swimming Performance Camp',
      category: 'Training Camp',
      sport: 'Swimming',
      destination: 'Gold Coast, Australia',
      country: 'Australia',
      duration: '14 days',
      dates: '2025-09-05 to 2025-09-19',
      price: '$2,799',
      currency: 'USD',
      ageGroup: '14-17',
      maxParticipants: 20,
      currentParticipants: 15,
      image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400',
      organizer: 'Aquatic Excellence Tours',
      rating: 4.7,
      reviews: 94,
      highlights: [
        'Train with Olympic coaches',
        'World-class aquatic center',
        'Video technique analysis',
        'Beach and city activities',
        'Performance tracking'
      ],
      included: ['Beachside Resort', 'All Meals', 'Pool Access', 'Equipment', 'Excursions'],
      difficulty: 'Intermediate',
      isWishlisted: false,
      isBooked: false,
      earlyBird: true,
      featured: false,
      testimonial: 'Incredible facilities and coaching quality!',
    },
    {
      id: '5',
      title: 'Multi-Sport Adventure Tour',
      category: 'Adventure',
      sport: 'Multi-Sport',
      destination: 'Whistler, Canada',
      country: 'Canada',
      duration: '8 days',
      dates: '2025-08-15 to 2025-08-23',
      price: '$2,199',
      currency: 'USD',
      ageGroup: '13-16',
      maxParticipants: 28,
      currentParticipants: 21,
      image: 'https://images.unsplash.com/photo-1551524164-6cf53ac14d55?w=400',
      organizer: 'Mountain Sports Adventures',
      rating: 4.5,
      reviews: 72,
      highlights: [
        'Mountain biking & hiking',
        'Rock climbing lessons',
        'Water sports activities',
        'Olympic venue visits',
        'Nature exploration'
      ],
      included: ['Mountain Lodge', 'Outdoor Meals', 'All Equipment', 'Safety Gear', 'Guides'],
      difficulty: 'All Levels',
      isWishlisted: false,
      isBooked: false,
      earlyBird: false,
      featured: false,
      testimonial: 'Perfect for adventure-loving athletes!',
    },
  ]);

  const categories = [
    { key: 'all', label: 'All Tours', icon: 'explore' },
    { key: 'training', label: 'Training', icon: 'fitness-center' },
    { key: 'competition', label: 'Competition', icon: 'jump-rope' },
    { key: 'adventure', label: 'Adventure', icon: 'terrain' },
    { key: 'skills', label: 'Skills', icon: 'school' },
  ];

  const durations = ['All Durations', '3-7 days', '8-14 days', '15+ days'];
  const destinations = ['All Destinations', 'Europe', 'USA', 'Australia', 'Asia', 'Canada'];
  const sports = ['All Sports', 'Football', 'Basketball', 'Tennis', 'Swimming', 'Multi-Sport'];
  const ageGroups = ['All Ages', '12-14', '15-17', '18+'];
  const budgets = ['All Budgets', 'Under $1,500', '$1,500-$2,500', '$2,500-$3,500', '$3,500+'];

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
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 1000,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value.toLowerCase().replace(' ', '').replace('-', '').replace('$', '').replace('+', '')
    }));
  };

  const handleBookTour = (tourId) => {
    const tour = toursData.find(t => t.id === tourId);
    Alert.alert(
      'Book Tour',
      `Book "${tour.title}" for ${tour.price}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Book Now',
          onPress: () => {
            Alert.alert('Success', 'Tour booking initiated! You\'ll receive booking details via email. 🎉');
          }
        }
      ]
    );
  };

  const handleToggleWishlist = (tourId) => {
    Alert.alert('Success', 'Wishlist updated! ⭐');
  };

  const handleViewDetails = (tour) => {
    Alert.alert(
      'Feature Development',
      'Detailed tour information view is coming soon! 📋',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const handleContactOrganizer = (tour) => {
    Alert.alert(
      'Contact Organizer',
      `Would you like to contact ${tour.organizer} about "${tour.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Message',
          onPress: () => {
            Alert.alert('Success', 'Message sent to organizer! 📧');
          }
        }
      ]
    );
  };

  const getCategoryColor = (category) => {
    switch (category.toLowerCase()) {
      case 'training camp': return COLORS.primary;
      case 'skills development': return COLORS.success;
      case 'competition': return COLORS.error;
      case 'adventure': return COLORS.warning;
      default: return COLORS.secondary;
    }
  };

  const getFilteredTours = () => {
    let filtered = toursData;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(tour => 
        tour.category.toLowerCase().includes(selectedCategory) ||
        tour.sport.toLowerCase().includes(selectedCategory)
      );
    }

    return filtered;
  };

  const renderTourCard = ({ item, index }) => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        marginBottom: SPACING.lg,
      }}
    >
      <Card style={styles.tourCard} elevation={4}>
        <View style={styles.tourImageContainer}>
          <ImageBackground
            source={{ uri: item.image }}
            style={styles.tourImage}
            imageStyle={styles.imageStyle}
          >
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.imageGradient}
            >
              <View style={styles.tourBadges}>
                {item.featured && (
                  <Chip
                    mode="flat"
                    style={[styles.featuredBadge, { backgroundColor: COLORS.error }]}
                    textStyle={{ color: 'white', fontSize: 11, fontWeight: 'bold' }}
                  >
                    ⭐ FEATURED
                  </Chip>
                )}
                {item.earlyBird && (
                  <Chip
                    mode="flat"
                    style={[styles.earlyBirdBadge, { backgroundColor: COLORS.success }]}
                    textStyle={{ color: 'white', fontSize: 11, fontWeight: 'bold' }}
                  >
                    🎯 EARLY BIRD
                  </Chip>
                )}
                <IconButton
                  icon={item.isWishlisted ? 'favorite' : 'favorite-border'}
                  size={24}
                  iconColor={item.isWishlisted ? COLORS.error : 'white'}
                  onPress={() => handleToggleWishlist(item.id)}
                  style={styles.wishlistButton}
                />
              </View>
              
              <View style={styles.tourInfo}>
                <Text style={[TEXT_STYLES.h2, { color: 'white', marginBottom: 4 }]}>
                  {item.title}
                </Text>
                <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.9)', marginBottom: 6 }]}>
                  🌍 {item.destination} • {item.duration}
                </Text>
                <View style={styles.ratingContainer}>
                  <Icon name="star" size={16} color={COLORS.warning} />
                  <Text style={[TEXT_STYLES.caption, { color: 'white', marginLeft: 4 }]}>
                    {item.rating} ({item.reviews} reviews)
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </ImageBackground>
        </View>

        <Card.Content style={styles.cardContent}>
          <View style={styles.tourHeader}>
            <Chip
              mode="outlined"
              style={[styles.categoryChip, { borderColor: getCategoryColor(item.category) }]}
              textStyle={{ color: getCategoryColor(item.category), fontSize: 12 }}
            >
              {item.category}
            </Chip>
            <View style={styles.priceContainer}>
              <Text style={[TEXT_STYLES.h2, { color: COLORS.primary }]}>
                {item.price}
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                per person
              </Text>
            </View>
          </View>

          <View style={styles.tourDetails}>
            <View style={styles.detailRow}>
              <Icon name="event" size={16} color={COLORS.textSecondary} />
              <Text style={[TEXT_STYLES.caption, { marginLeft: 6, color: COLORS.textSecondary }]}>
                {item.dates}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="group" size={16} color={COLORS.textSecondary} />
              <Text style={[TEXT_STYLES.caption, { marginLeft: 6, color: COLORS.textSecondary }]}>
                Ages {item.ageGroup} • {item.difficulty}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="business" size={16} color={COLORS.textSecondary} />
              <Text style={[TEXT_STYLES.caption, { marginLeft: 6, color: COLORS.textSecondary }]}>
                by {item.organizer}
              </Text>
            </View>
          </View>

          <View style={styles.availabilityContainer}>
            <View style={styles.participantsInfo}>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                {item.maxParticipants - item.currentParticipants} spots remaining
              </Text>
            </View>
            <ProgressBar
              progress={item.currentParticipants / item.maxParticipants}
              color={item.currentParticipants / item.maxParticipants > 0.8 ? COLORS.error : COLORS.success}
              style={styles.progressBar}
            />
          </View>

          <View style={styles.highlightsContainer}>
            <Text style={[TEXT_STYLES.body, { color: COLORS.text, marginBottom: 8, fontWeight: '600' }]}>
              ✨ Tour Highlights:
            </Text>
            <View style={styles.highlightsList}>
              {item.highlights.slice(0, 3).map((highlight, idx) => (
                <View key={idx} style={styles.highlightItem}>
                  <Icon name="check-circle" size={14} color={COLORS.success} />
                  <Text style={[TEXT_STYLES.caption, { marginLeft: 6, flex: 1, color: COLORS.textSecondary }]}>
                    {highlight}
                  </Text>
                </View>
              ))}
              {item.highlights.length > 3 && (
                <TouchableOpacity onPress={() => handleViewDetails(item)}>
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.primary, marginTop: 4 }]}>
                    +{item.highlights.length - 3} more highlights →
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {item.testimonial && (
            <View style={styles.testimonialContainer}>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, fontStyle: 'italic' }]}>
                💬 "{item.testimonial}"
              </Text>
            </View>
          )}

          <View style={styles.actionContainer}>
            <Button
              mode={item.isBooked ? "outlined" : "contained"}
              onPress={() => item.isBooked ? handleViewDetails(item) : handleBookTour(item.id)}
              style={[
                styles.bookButton,
                item.isBooked && styles.bookedButton
              ]}
              buttonColor={item.isBooked ? 'transparent' : COLORS.primary}
              textColor={item.isBooked ? COLORS.primary : 'white'}
              contentStyle={styles.buttonContent}
              labelStyle={{ fontSize: 14, fontWeight: 'bold' }}
            >
              {item.isBooked ? 'View Booking ✓' : 'Book Tour'}
            </Button>
            <IconButton
              icon="chat"
              size={20}
              onPress={() => handleContactOrganizer(item)}
              style={styles.contactButton}
            />
            <IconButton
              icon="info"
              size={20}
              onPress={() => handleViewDetails(item)}
              style={styles.infoButton}
            />
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderCategoryTabs = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoryContainer}
      contentContainerStyle={styles.categoryContent}
    >
      {categories.map((category) => (
        <TouchableOpacity
          key={category.key}
          onPress={() => setSelectedCategory(category.key)}
          style={[
            styles.categoryTab,
            selectedCategory === category.key && styles.activeCategoryTab
          ]}
        >
          <Icon
            name={category.icon}
            size={18}
            color={selectedCategory === category.key ? 'white' : COLORS.textSecondary}
          />
          <Text
            style={[
              TEXT_STYLES.caption,
              {
                color: selectedCategory === category.key ? 'white' : COLORS.textSecondary,
                marginLeft: 6,
                fontWeight: selectedCategory === category.key ? 'bold' : 'normal'
              }
            ]}
          >
            {category.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
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
            <Text style={[TEXT_STYLES.h2, { color: COLORS.text }]}>Tour Filters</Text>
            <IconButton
              icon="close"
              onPress={() => setShowFilterModal(false)}
            />
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.filterSection}>
              <Text style={[TEXT_STYLES.h3, styles.filterTitle]}>Duration</Text>
              <View style={styles.filterChips}>
                {durations.map((duration, index) => (
                  <Chip
                    key={index}
                    selected={filters.duration === duration.toLowerCase().replace(' ', '').replace('-', '')}
                    onPress={() => handleFilterChange('duration', duration)}
                    style={styles.filterChip}
                  >
                    {duration}
                  </Chip>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={[TEXT_STYLES.h3, styles.filterTitle]}>Destination</Text>
              <View style={styles.filterChips}>
                {destinations.map((destination, index) => (
                  <Chip
                    key={index}
                    selected={filters.destination === destination.toLowerCase().replace(' ', '')}
                    onPress={() => handleFilterChange('destination', destination)}
                    style={styles.filterChip}
                  >
                    {destination}
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
              <Text style={[TEXT_STYLES.h3, styles.filterTitle]}>Budget</Text>
              <View style={styles.filterChips}>
                {budgets.map((budget, index) => (
                  <Chip
                    key={index}
                    selected={filters.budget === budget.toLowerCase().replace(' ', '').replace('-', '').replace('$', '').replace('+', '')}
                    onPress={() => handleFilterChange('budget', budget)}
                    style={styles.filterChip}
                  >
                    {budget}
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
                  duration: 'all',
                  destination: 'all',
                  sport: 'all',
                  ageGroup: 'all',
                  budget: 'all',
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
      
      <Animated.View
        style={{
          opacity: headerAnim,
          transform: [{ translateY: Animated.multiply(headerAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [-50, 0]
          }), 1) }]
        }}
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.header}
        >
          <Text style={[TEXT_STYLES.h1, styles.headerTitle]}>Sports Tours ✈️</Text>
          <Text style={[TEXT_STYLES.body, styles.headerSubtitle]}>
            Embark on amazing sports adventures worldwide!
          </Text>
          
          <View style={styles.statsContainer}>
            <Surface style={styles.statCard}>
              <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>25+</Text>
              <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
                Destinations
              </Text>
            </Surface>
            <Surface style={[styles.statCard, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
              <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>500+</Text>
              <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
                Happy Athletes
              </Text>
            </Surface>
            <Surface style={[styles.statCard, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
              <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>15</Text>
              <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
                Sports
              </Text>
            </Surface>
          </View>
        </LinearGradient>
      </Animated.View>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search tours, destinations..."
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

      {renderCategoryTabs()}

      <FlatList
        data={getFilteredTours()}
        renderItem={renderTourCard}
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
            <Icon name="flight" size={64} color={COLORS.textSecondary} />
            <Text style={[TEXT_STYLES.h3, { color: COLORS.textSecondary, marginTop: SPACING.md }]}>
              No tours found
            </Text>
            <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary, textAlign: 'center' }]}>
              Try adjusting your filters or search terms
            </Text>
          </View>
        )}
      />

      <FAB
        icon="favorite"
        style={styles.wishlistFab}
        onPress={() => {
          Alert.alert(
            'Feature Development',
            'Wishlist view is coming soon! 💖',
            [{ text: 'OK', style: 'default' }]
          );
        }}
      />

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
    marginBottom: SPACING.
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  statCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: SPACING.sm,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 70,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.background,
  },
  searchbar: {
    flex: 1,
    backgroundColor: COLORS.surface,
    elevation: 0,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterButton: {
    marginLeft: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryContainer: {
    backgroundColor: COLORS.background,
    paddingVertical: SPACING.sm,
  },
  categoryContent: {
    paddingHorizontal: SPACING.lg,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeCategoryTab: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  listContainer: {
    padding: SPACING.lg,
    paddingBottom: 100, // Space for FAB
  },
  tourCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },
  tourImageContainer: {
    height: 200,
    position: 'relative',
  },
  tourImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  imageStyle: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  imageGradient: {
    flex: 1,
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  tourBadges: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  featuredBadge: {
    marginRight: SPACING.xs,
  },
  earlyBirdBadge: {
    marginRight: SPACING.xs,
  },
  wishlistButton: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    margin: 0,
  },
  tourInfo: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardContent: {
    padding: SPACING.lg,
  },
  tourHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  categoryChip: {
    backgroundColor: 'transparent',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  tourDetails: {
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  availabilityContainer: {
    marginBottom: SPACING.md,
  },
  participantsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.border,
  },
  highlightsContainer: {
    marginBottom: SPACING.md,
  },
  highlightsList: {
    marginLeft: SPACING.xs,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  testimonialContainer: {
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bookButton: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  bookedButton: {
    borderColor: COLORS.primary,
  },
  buttonContent: {
    paddingVertical: SPACING.xs,
  },
  contactButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.xs,
  },
  infoButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    margin: SPACING.lg,
  },
  filterModal: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterSection: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterTitle: {
    color: COLORS.text,
    marginBottom: SPACING.md,
    fontWeight: '600',
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  filterChip: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  clearButton: {
    flex: 0.45,
  },
  applyButton: {
    flex: 0.45,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  wishlistFab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 20,
    backgroundColor: COLORS.primary,
  },
});

// Export statement at the end of the file
export default SportsTours;