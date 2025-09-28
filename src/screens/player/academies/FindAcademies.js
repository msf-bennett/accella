import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Vibration,
  Alert,
  FlatList,
  Dimensions,
  Image,
  Linking,
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
  Text,
  ProgressBar,
  FAB,
  Badge,
  Divider,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '../../../components/shared/BlurView';

// Import your constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants';

const { width } = Dimensions.get('window');

const FindAcademies = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, location, academies, favorites } = useSelector(state => ({
    user: state.auth.user,
    location: state.location.current,
    academies: state.academies.nearbyAcademies || [],
    favorites: state.user.favoriteAcademies || []
  }));

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('All');
  const [selectedDistance, setSelectedDistance] = useState('10km');
  const [selectedRating, setSelectedRating] = useState('All');
  const [selectedAge, setSelectedAge] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list', 'map'
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAcademy, setSelectedAcademy] = useState(null);
  const [filterVisible, setFilterVisible] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const scrollY = useRef(new Animated.Value(0)).current;

  const sports = ['All', 'Football', 'Basketball', 'Tennis', 'Swimming', 'Athletics', 'Cricket', 'Badminton', 'Volleyball', 'Golf'];
  const distances = ['5km', '10km', '25km', '50km', '100km'];
  const ratings = ['All', '4.5+', '4.0+', '3.5+', '3.0+'];
  const ageGroups = ['All', 'Under 8', '8-12', '13-16', '17-21', 'Adult'];

  // Sample academy data - replace with actual data from Redux
  const academyData = [
    {
      id: 'academy_1',
      name: 'Elite Football Academy',
      logo: 'https://via.placeholder.com/100x100/667eea/white?text=EFA',
      coverImage: 'https://via.placeholder.com/400x200/667eea/white?text=Football',
      sports: ['Football', 'Athletics'],
      rating: 4.8,
      totalReviews: 324,
      distance: 2.5,
      location: 'Nairobi Sports Complex, Karen',
      coordinates: { latitude: -1.319, longitude: 36.786 },
      establishedYear: 2015,
      totalStudents: 450,
      ageGroups: ['8-12', '13-16', '17-21'],
      priceRange: '$20-50',
      facilities: ['Football Pitches', 'Gym', 'Changing Rooms', 'Cafeteria'],
      coaches: 12,
      programs: ['Youth Development', 'Elite Training', 'Holiday Camps'],
      achievements: ['Regional Champions 2024', 'Youth League Winners'],
      description: 'Premier football academy focused on developing young talent with world-class facilities and expert coaching.',
      features: ['Professional Coaching', 'Video Analysis', 'Fitness Training', 'Mental Coaching'],
      contactInfo: {
        phone: '+254712345678',
        email: 'info@elitefootball.ke',
        website: 'www.elitefootball.ke'
      },
      socialMedia: {
        facebook: '@elitefootballke',
        instagram: '@elitefootball',
        twitter: '@elitefootball'
      },
      gallery: [
        'https://via.placeholder.com/300x200/667eea/white?text=Training',
        'https://via.placeholder.com/300x200/764ba2/white?text=Facilities',
        'https://via.placeholder.com/300x200/4CAF50/white?text=Matches'
      ],
      isFavorite: true,
      isVerified: true,
      responseTime: '2 hours',
      nextAvailableSession: '2025-08-18T16:00:00Z'
    },
    {
      id: 'academy_2',
      name: 'Champions Basketball Camp',
      logo: 'https://via.placeholder.com/100x100/FF6B35/white?text=CBC',
      coverImage: 'https://via.placeholder.com/400x200/FF6B35/white?text=Basketball',
      sports: ['Basketball', 'Volleyball'],
      rating: 4.6,
      totalReviews: 198,
      distance: 4.2,
      location: 'Westlands Indoor Arena',
      coordinates: { latitude: -1.267, longitude: 36.808 },
      establishedYear: 2018,
      totalStudents: 280,
      ageGroups: ['13-16', '17-21', 'Adult'],
      priceRange: '$25-60',
      facilities: ['Basketball Courts', 'Training Hall', 'Equipment Room'],
      coaches: 8,
      programs: ['Skills Development', 'Team Training', 'Personal Coaching'],
      achievements: ['City League Champions', 'Youth Tournament Winners'],
      description: 'Specialized basketball training facility with focus on skill development and competitive play.',
      features: ['Indoor Courts', 'Strength Training', 'Game Analysis', 'Tournaments'],
      contactInfo: {
        phone: '+254723456789',
        email: 'hello@championsbb.com',
        website: 'www.championsbasketball.com'
      },
      socialMedia: {
        facebook: '@championsbb',
        instagram: '@championsbasketball',
        twitter: '@championsbb'
      },
      gallery: [
        'https://via.placeholder.com/300x200/FF6B35/white?text=Courts',
        'https://via.placeholder.com/300x200/E74C3C/white?text=Training',
        'https://via.placeholder.com/300x200/9B59B6/white?text=Games'
      ],
      isFavorite: false,
      isVerified: true,
      responseTime: '4 hours',
      nextAvailableSession: '2025-08-18T17:00:00Z'
    },
    {
      id: 'academy_3',
      name: 'Aquatic Sports Center',
      logo: 'https://via.placeholder.com/100x100/3498DB/white?text=ASC',
      coverImage: 'https://via.placeholder.com/400x200/3498DB/white?text=Swimming',
      sports: ['Swimming', 'Water Polo'],
      rating: 4.7,
      totalReviews: 156,
      distance: 6.8,
      location: 'Gigiri Aquatic Complex',
      coordinates: { latitude: -1.232, longitude: 36.801 },
      establishedYear: 2012,
      totalStudents: 320,
      ageGroups: ['Under 8', '8-12', '13-16', '17-21', 'Adult'],
      priceRange: '$30-70',
      facilities: ['Olympic Pool', 'Kids Pool', 'Diving Pool', 'Spa'],
      coaches: 15,
      programs: ['Learn to Swim', 'Competitive Swimming', 'Water Safety'],
      achievements: ['National Swimming Records', 'Olympic Qualifiers'],
      description: 'Premier aquatic facility offering comprehensive swimming programs for all ages and skill levels.',
      features: ['Olympic Standard Pool', 'Professional Coaches', 'Video Analysis', 'Fitness Programs'],
      contactInfo: {
        phone: '+254734567890',
        email: 'swim@aquaticcenter.ke',
        website: 'www.aquaticcenter.ke'
      },
      socialMedia: {
        facebook: '@aquaticcenterke',
        instagram: '@aquaticsports',
        twitter: '@aquaticcenter'
      },
      gallery: [
        'https://via.placeholder.com/300x200/3498DB/white?text=Pool',
        'https://via.placeholder.com/300x200/2ECC71/white?text=Training',
        'https://via.placeholder.com/300x200/E67E22/white?text=Events'
      ],
      isFavorite: true,
      isVerified: true,
      responseTime: '1 hour',
      nextAvailableSession: '2025-08-18T15:00:00Z'
    },
    {
      id: 'academy_4',
      name: 'Tennis Excellence Academy',
      logo: 'https://via.placeholder.com/100x100/27AE60/white?text=TEA',
      coverImage: 'https://via.placeholder.com/400x200/27AE60/white?text=Tennis',
      sports: ['Tennis', 'Squash'],
      rating: 4.5,
      totalReviews: 89,
      distance: 8.1,
      location: 'Muthaiga Country Club',
      coordinates: { latitude: -1.245, longitude: 36.812 },
      establishedYear: 2010,
      totalStudents: 180,
      ageGroups: ['8-12', '13-16', '17-21', 'Adult'],
      priceRange: '$35-80',
      facilities: ['Clay Courts', 'Hard Courts', 'Pro Shop', 'Clubhouse'],
      coaches: 10,
      programs: ['Junior Development', 'Adult Lessons', 'Tournament Prep'],
      achievements: ['Junior National Champions', 'ITF Tournament Hosts'],
      description: 'Exclusive tennis academy providing world-class training with international standard facilities.',
      features: ['Professional Courts', 'Match Play', 'Fitness Training', 'Mental Coaching'],
      contactInfo: {
        phone: '+254745678901',
        email: 'tennis@excellence.co.ke',
        website: 'www.tennisexcellence.co.ke'
      },
      socialMedia: {
        facebook: '@tennisexcellence',
        instagram: '@tennisacademy',
        twitter: '@tennisexcellence'
      },
      gallery: [
        'https://via.placeholder.com/300x200/27AE60/white?text=Courts',
        'https://via.placeholder.com/300x200/8E44AD/white?text=Training',
        'https://via.placeholder.com/300x200/F39C12/white?text=Events'
      ],
      isFavorite: false,
      isVerified: false,
      responseTime: '6 hours',
      nextAvailableSession: '2025-08-19T14:00:00Z'
    }
  ];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    loadAcademies();
  }, [selectedSport, selectedDistance, selectedRating, selectedAge]);

  const loadAcademies = useCallback(async () => {
    try {
      setLoading(true);
      // dispatch(loadNearbyAcademiesAction(filters));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200));
    } catch (error) {
      console.error('Error loading academies:', error);
      Alert.alert('Error', 'Failed to load academies. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [dispatch, selectedSport, selectedDistance, selectedRating, selectedAge]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAcademies();
    setRefreshing(false);
    Vibration.vibrate(50);
  }, [loadAcademies]);

  const handleFavoriteToggle = useCallback((academy) => {
    Vibration.vibrate(30);
    // dispatch(toggleFavoriteAcademyAction(academy.id));
    Alert.alert('Feature Coming Soon', 'Favorite academies will be available in the next update! ❤️');
  }, []);

  const handleContact = useCallback((academy, method) => {
    Vibration.vibrate(30);
    
    switch (method) {
      case 'call':
        Linking.openURL(`tel:${academy.contactInfo.phone}`);
        break;
      case 'email':
        Linking.openURL(`mailto:${academy.contactInfo.email}`);
        break;
      case 'website':
        Linking.openURL(`https://${academy.contactInfo.website}`);
        break;
      case 'message':
        Alert.alert('Feature Coming Soon', 'In-app messaging will be available in the next update! 💬');
        break;
      default:
        Alert.alert('Feature Coming Soon', 'This contact method will be available soon! 📞');
    }
  }, []);

  const handleBookTrial = useCallback((academy) => {
    Vibration.vibrate(30);
    Alert.alert(
      'Book Trial Session',
      `Would you like to book a trial session at ${academy.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Book Trial', 
          onPress: () => {
            Alert.alert('Feature Coming Soon', 'Trial booking will be available in the next update! 🎾');
          }
        }
      ]
    );
  }, []);

  const handleViewDetails = useCallback((academy) => {
    setSelectedAcademy(academy);
    setModalVisible(true);
    Vibration.vibrate(30);
  }, []);

  const handleGetDirections = useCallback((academy) => {
    const { coordinates } = academy;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${coordinates.latitude},${coordinates.longitude}`;
    Linking.openURL(url);
    Vibration.vibrate(30);
  }, []);

  const formatDistance = (distance) => {
    return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance}km`;
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Icon key={i} name="star" size={14} color="#FFD700" />);
    }
    
    if (hasHalfStar) {
      stars.push(<Icon key="half" name="star-half" size={14} color="#FFD700" />);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Icon key={`empty-${i}`} name="star-border" size={14} color="#FFD700" />);
    }

    return stars;
  };

  const filteredAcademies = academyData.filter(academy => {
    const matchesSearch = academy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         academy.sports.some(sport => sport.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSport = selectedSport === 'All' || academy.sports.includes(selectedSport);
    const matchesDistance = parseFloat(selectedDistance) >= academy.distance;
    const matchesRating = selectedRating === 'All' || academy.rating >= parseFloat(selectedRating);
    const matchesAge = selectedAge === 'All' || academy.ageGroups.includes(selectedAge);
    
    return matchesSearch && matchesSport && matchesDistance && matchesRating && matchesAge;
  }).sort((a, b) => a.distance - b.distance);

  const renderQuickStats = () => (
    <Surface style={styles.statsContainer} elevation={2}>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{filteredAcademies.length}</Text>
        <Text style={styles.statLabel}>Academies Found</Text>
      </View>
      <Divider style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{filteredAcademies.filter(a => a.distance <= 10).length}</Text>
        <Text style={styles.statLabel}>Within 10km</Text>
      </View>
      <Divider style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{filteredAcademies.filter(a => a.rating >= 4.5).length}</Text>
        <Text style={styles.statLabel}>Top Rated</Text>
      </View>
    </Surface>
  );

  const renderFilterChips = () => (
    <View style={styles.filtersContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContent}
      >
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => {
            setFilterVisible(true);
            Vibration.vibrate(30);
          }}
        >
          <Icon name="tune" size={20} color={COLORS.primary} />
          <Text style={styles.filterButtonText}>Filters</Text>
        </TouchableOpacity>
        
        <Chip
          mode={selectedSport !== 'All' ? 'flat' : 'outlined'}
          selected={selectedSport !== 'All'}
          onPress={() => setFilterVisible(true)}
          style={styles.filterChip}
          textStyle={styles.filterChipText}
        >
          {selectedSport}
        </Chip>
        
        <Chip
          mode={selectedDistance !== '10km' ? 'flat' : 'outlined'}
          selected={selectedDistance !== '10km'}
          onPress={() => setFilterVisible(true)}
          style={styles.filterChip}
          textStyle={styles.filterChipText}
        >
          {selectedDistance}
        </Chip>

        {selectedRating !== 'All' && (
          <Chip
            mode="flat"
            selected={true}
            onPress={() => setFilterVisible(true)}
            style={styles.filterChip}
            textStyle={styles.filterChipText}
          >
            {selectedRating} ⭐
          </Chip>
        )}
      </ScrollView>
    </View>
  );

  const renderAcademyCard = ({ item: academy, index }) => (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          opacity: fadeAnim,
          transform: [{
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0]
            })
          }]
        }
      ]}
    >
      <Card style={styles.academyCard} elevation={4}>
        <TouchableOpacity onPress={() => handleViewDetails(academy)}>
          <View style={styles.cardImageContainer}>
            <Image 
              source={{ uri: academy.coverImage }}
              style={styles.cardImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.cardImageOverlay}
            />
            <View style={styles.cardImageContent}>
              <View style={styles.cardImageTop}>
                <View style={styles.verificationBadge}>
                  {academy.isVerified && (
                    <Icon name="verified" size={16} color="#4CAF50" />
                  )}
                  <Badge style={styles.distanceBadge}>
                    {formatDistance(academy.distance)}
                  </Badge>
                </View>
                <TouchableOpacity
                  style={styles.favoriteButton}
                  onPress={() => handleFavoriteToggle(academy)}
                >
                  <Icon 
                    name={academy.isFavorite ? "favorite" : "favorite-border"} 
                    size={22} 
                    color={academy.isFavorite ? "#E74C3C" : "white"} 
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.cardImageBottom}>
                <View style={styles.ratingContainer}>
                  <View style={styles.starsContainer}>
                    {renderStars(academy.rating)}
                  </View>
                  <Text style={styles.ratingText}>
                    {academy.rating} ({academy.totalReviews})
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        <Card.Content style={styles.cardContent}>
          <View style={styles.academyHeader}>
            <Avatar.Image
              source={{ uri: academy.logo }}
              size={40}
              style={styles.academyLogo}
            />
            <View style={styles.academyInfo}>
              <Text style={styles.academyName}>{academy.name}</Text>
              <Text style={styles.academyLocation}>{academy.location}</Text>
            </View>
            <Text style={styles.priceRange}>{academy.priceRange}</Text>
          </View>

          <View style={styles.sportsContainer}>
            {academy.sports.slice(0, 3).map((sport, idx) => (
              <Chip
                key={idx}
                mode="outlined"
                compact
                style={styles.sportChip}
                textStyle={styles.sportChipText}
              >
                {sport}
              </Chip>
            ))}
            {academy.sports.length > 3 && (
              <Text style={styles.moreSports}>+{academy.sports.length - 3}</Text>
            )}
          </View>

          <View style={styles.academyMeta}>
            <View style={styles.metaItem}>
              <Icon name="people" size={16} color={COLORS.primary} />
              <Text style={styles.metaText}>{academy.totalStudents} students</Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="school" size={16} color={COLORS.primary} />
              <Text style={styles.metaText}>{academy.coaches} coaches</Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="schedule" size={16} color={COLORS.primary} />
              <Text style={styles.metaText}>Est. {academy.establishedYear}</Text>
            </View>
          </View>

          <Text style={styles.description} numberOfLines={2}>
            {academy.description}
          </Text>
        </Card.Content>

        <Card.Actions style={styles.cardActions}>
          <Button
            mode="outlined"
            onPress={() => handleContact(academy, 'message')}
            style={styles.messageButton}
            labelStyle={styles.messageButtonText}
            icon="message"
            compact
          >
            Message
          </Button>
          <Button
            mode="contained"
            onPress={() => handleBookTrial(academy)}
            style={styles.trialButton}
            labelStyle={styles.trialButtonText}
            icon="sports"
            compact
          >
            Book Trial
          </Button>
        </Card.Actions>
      </Card>
    </Animated.View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="search-off" size={64} color={COLORS.primary} />
      <Text style={styles.emptyStateTitle}>No Academies Found</Text>
      <Text style={styles.emptyStateText}>
        {searchQuery || selectedSport !== 'All'
          ? 'Try adjusting your search criteria or filters'
          : 'No academies found in your area'}
      </Text>
      <Button
        mode="contained"
        onPress={() => {
          setSearchQuery('');
          setSelectedSport('All');
          setSelectedDistance('10km');
          setSelectedRating('All');
          setSelectedAge('All');
        }}
        style={styles.resetButton}
        icon="refresh"
      >
        Reset Filters
      </Button>
    </View>
  );

  const renderFiltersModal = () => (
    <Portal>
      <Modal
        visible={filterVisible}
        onDismiss={() => setFilterVisible(false)}
        contentContainerStyle={styles.filterModalContainer}
      >
        <Surface style={styles.filterModal} elevation={8}>
          <View style={styles.filterModalHeader}>
            <Text style={styles.filterModalTitle}>Filter Academies</Text>
            <IconButton
              icon="close"
              size={24}
              onPress={() => setFilterVisible(false)}
            />
          </View>

          <ScrollView style={styles.filterModalContent}>
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Sport</Text>
              <View style={styles.filterOptions}>
                {sports.map(sport => (
                  <Chip
                    key={sport}
                    mode={selectedSport === sport ? 'flat' : 'outlined'}
                    selected={selectedSport === sport}
                    onPress={() => {
                      setSelectedSport(sport);
                      Vibration.vibrate(30);
                    }}
                    style={styles.filterOptionChip}
                  >
                    {sport}
                  </Chip>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Distance</Text>
              <View style={styles.filterOptions}>
                {distances.map(distance => (
                  <Chip
                    key={distance}
                    mode={selectedDistance === distance ? 'flat' : 'outlined'}
                    selected={selectedDistance === distance}
                    onPress={() => {
                      setSelectedDistance(distance);
                      Vibration.vibrate(30);
                    }}
                    style={styles.filterOptionChip}
                  >
                    {distance}
                  </Chip>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Rating</Text>
              <View style={styles.filterOptions}>
                {ratings.map(rating => (
                  <Chip
                    key={rating}
                    mode={selectedRating === rating ? 'flat' : 'outlined'}
                    selected={selectedRating === rating}
                    onPress={() => {
                      setSelectedRating(rating);
                      Vibration.vibrate(30);
                    }}
                    style={styles.filterOptionChip}
                  >
                    {rating}
                  </Chip>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Age Group</Text>
              <View style={styles.filterOptions}>
                {ageGroups.map(age => (
                  <Chip
                    key={age}
                    mode={selectedAge === age ? 'flat' : 'outlined'}
                    selected={selectedAge === age}
                    onPress={() => {
                      setSelectedAge(age);
                      Vibration.vibrate(30);
                    }}
                    style={styles.filterOptionChip}
                  >
                    {age}
                  </Chip>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.filterModalActions}>
            <Button
              mode="outlined"
              onPress={() => {
                setSelectedSport('All');
                setSelectedDistance('10km');
                setSelectedRating('All');
                setSelectedAge('All');
              }}
              style={styles.resetFiltersButton}
            >
              Reset
            </Button>
            <Button
              mode="contained"
              onPress={() => setFilterVisible(false)}
              style={styles.applyFiltersButton}
            >
              Apply Filters
            </Button>
          </View>
        </Surface>
      </Modal>
    </Portal>
  );

  const renderAcademyModal = () => (
    <Portal>
      <Modal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView
          style={styles.blurView}
          blurType="light"
          blurAmount={10}
        >
          <ScrollView style={styles.modalScrollView}>
            <Card style={styles.modalCard}>
              {selectedAcademy && (
                <>
                  <View style={styles.modalImageContainer}>
                    <Image 
                      source={{ uri: selectedAcademy.coverImage }}
                      style={styles.modalImage}
                      resizeMode="cover"
                    />
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.8)']}
                      style={styles.modalImageOverlay}
                    />
                    <View style={styles.modalImageContent}>
                      <IconButton
                        icon="close"
                        size={28}
                        iconColor="white"
                        style={styles.closeButton}
                        onPress={() => setModalVisible(false)}
                      />
                      <View style={styles.modalImageInfo}>
                        <Text style={styles.modalAcademyName}>
                          {selectedAcademy.name}
                        </Text>
                        <Text style={styles.modalAcademyLocation}>
                          {selectedAcademy.location}
                        </Text>
                        <View style={styles.modalRating}>
                          <View style={styles.starsContainer}>
                            {renderStars(selectedAcademy.rating)}
                          </View>
                          <Text style={styles.modalRatingText}>
                            {selectedAcademy.rating} ({selectedAcademy.totalReviews} reviews)
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <Card.Content style={styles.modalContent}>
                    <View style={styles.modalStats}>
                      <View style={styles.modalStatItem}>
                        <Icon name="people" size={20} color={COLORS.primary} />
                        <Text style={styles.modalStatNumber}>{selectedAcademy.totalStudents}</Text>
                        <Text style={styles.modalStatLabel}>Students</Text>
                      </View>
                      <View style={styles.modalStatItem}>
                        <Icon name="school" size={20} color={COLORS.primary} />
                        <Text style={styles.modalStatNumber}>{selectedAcademy.coaches}</Text>
                        <Text style={styles.modalStatLabel}>Coaches</Text>
                      </View>
                      <View style={styles.modalStatItem}>
                        <Icon name="schedule" size={20} color={COLORS.primary} />
                        <Text style={styles.modalStatNumber}>{new Date().getFullYear() - selectedAcademy.establishedYear}</Text>
                        <Text style={styles.modalStatLabel}>Years</Text>
                      </View>
                      <View style={styles.modalStatItem}>
                        <Icon name="location-on" size={20} color={COLORS.primary} />
                        <Text style={styles.modalStatNumber}>{formatDistance(selectedAcademy.distance)}</Text>
                        <Text style={styles.modalStatLabel}>Away</Text>
                      </View>
                    </View>

                    <Text style={styles.modalDescription}>
                      {selectedAcademy.description}
                    </Text>

                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>Sports & Programs</Text>
                      <View style={styles.sportsGrid}>
                        {selectedAcademy.sports.map((sport, idx) => (
                          <Chip
                            key={idx}
                            mode="outlined"
                            style={styles.modalSportChip}
                            textStyle={styles.modalSportChipText}
                          >
                            {sport}
                          </Chip>
                        ))}
                      </View>
                      <View style={styles.programsList}>
                        {selectedAcademy.programs.map((program, idx) => (
                          <View key={idx} style={styles.programItem}>
                            <Icon name="check-circle" size={16} color={COLORS.success} />
                            <Text style={styles.programText}>{program}</Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>Facilities & Features</Text>
                      <View style={styles.facilitiesList}>
                        {selectedAcademy.facilities.map((facility, idx) => (
                          <View key={idx} style={styles.facilityItem}>
                            <Icon name="place" size={16} color={COLORS.primary} />
                            <Text style={styles.facilityText}>{facility}</Text>
                          </View>
                        ))}
                      </View>
                      <View style={styles.featuresList}>
                        {selectedAcademy.features.map((feature, idx) => (
                          <Chip
                            key={idx}
                            mode="flat"
                            compact
                            style={styles.featureChip}
                            textStyle={styles.featureChipText}
                          >
                            ✨ {feature}
                          </Chip>
                        ))}
                      </View>
                    </View>

                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>Age Groups & Pricing</Text>
                      <View style={styles.ageGroupsContainer}>
                        <View style={styles.ageGroups}>
                          {selectedAcademy.ageGroups.map((age, idx) => (
                            <Chip
                              key={idx}
                              mode="outlined"
                              compact
                              style={styles.ageChip}
                            >
                              {age}
                            </Chip>
                          ))}
                        </View>
                        <View style={styles.pricingInfo}>
                          <Text style={styles.priceLabel}>Price Range</Text>
                          <Text style={styles.priceValue}>{selectedAcademy.priceRange}/session</Text>
                        </View>
                      </View>
                    </View>

                    {selectedAcademy.achievements.length > 0 && (
                      <View style={styles.modalSection}>
                        <Text style={styles.modalSectionTitle}>🏆 Achievements</Text>
                        <View style={styles.achievementsList}>
                          {selectedAcademy.achievements.map((achievement, idx) => (
                            <View key={idx} style={styles.achievementItem}>
                              <Icon name="jump-rope" size={16} color="#FFD700" />
                              <Text style={styles.achievementText}>{achievement}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}

                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>📸 Gallery</Text>
                      <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.galleryContainer}
                      >
                        {selectedAcademy.gallery.map((image, idx) => (
                          <TouchableOpacity key={idx} style={styles.galleryImageContainer}>
                            <Image
                              source={{ uri: image }}
                              style={styles.galleryImage}
                              resizeMode="cover"
                            />
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>

                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>📞 Contact Information</Text>
                      <View style={styles.contactOptions}>
                        <TouchableOpacity
                          style={styles.contactOption}
                          onPress={() => handleContact(selectedAcademy, 'call')}
                        >
                          <Icon name="phone" size={20} color={COLORS.primary} />
                          <Text style={styles.contactText}>{selectedAcademy.contactInfo.phone}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.contactOption}
                          onPress={() => handleContact(selectedAcademy, 'email')}
                        >
                          <Icon name="email" size={20} color={COLORS.primary} />
                          <Text style={styles.contactText}>{selectedAcademy.contactInfo.email}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.contactOption}
                          onPress={() => handleContact(selectedAcademy, 'website')}
                        >
                          <Icon name="language" size={20} color={COLORS.primary} />
                          <Text style={styles.contactText}>{selectedAcademy.contactInfo.website}</Text>
                        </TouchableOpacity>
                      </View>
                      
                      <View style={styles.responseTimeInfo}>
                        <Icon name="access-time" size={16} color={COLORS.textSecondary} />
                        <Text style={styles.responseTimeText}>
                          Usually responds within {selectedAcademy.responseTime}
                        </Text>
                      </View>
                    </View>
                  </Card.Content>

                  <Card.Actions style={styles.modalActions}>
                    <Button
                      mode="outlined"
                      onPress={() => handleGetDirections(selectedAcademy)}
                      style={styles.directionsButton}
                      icon="directions"
                    >
                      Directions
                    </Button>
                    <Button
                      mode="outlined"
                      onPress={() => handleContact(selectedAcademy, 'message')}
                      style={styles.messageButton}
                      icon="message"
                    >
                      Message
                    </Button>
                    <Button
                      mode="contained"
                      onPress={() => {
                        setModalVisible(false);
                        handleBookTrial(selectedAcademy);
                      }}
                      style={styles.bookTrialButton}
                      icon="sports"
                    >
                      Book Trial
                    </Button>
                  </Card.Actions>
                </>
              )}
            </Card>
          </ScrollView>
        </BlurView>
      </Modal>
    </Portal>
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
        <Animated.View
          style={[
            styles.headerContent,
            {
              transform: [{
                translateY: scrollY.interpolate({
                  inputRange: [0, 100],
                  outputRange: [0, -20],
                  extrapolate: 'clamp'
                })
              }]
            }
          ]}
        >
          <View style={styles.headerTop}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Find Academies 🏟️</Text>
              <Text style={styles.headerSubtitle}>
                Discover the best sports academies near you
              </Text>
            </View>
            <IconButton
              icon={viewMode === 'grid' ? 'view-list' : 'view-module'}
              size={24}
              iconColor="white"
              onPress={() => {
                setViewMode(viewMode === 'grid' ? 'list' : 'grid');
                Vibration.vibrate(30);
              }}
            />
          </View>
          <View style={styles.locationContainer}>
            <Icon name="location-on" size={16} color="white" />
            <Text style={styles.locationText}>
              {location?.address || 'Nairobi, Kenya'}
            </Text>
          </View>
        </Animated.View>
      </LinearGradient>

      <Surface style={styles.searchContainer} elevation={2}>
        <Searchbar
          placeholder="Search academies, sports, locations..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={COLORS.primary}
          inputStyle={TEXT_STYLES.body}
        />
      </Surface>

      {renderQuickStats()}
      {renderFilterChips()}

      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ProgressBar indeterminate color={COLORS.primary} />
            <Text style={styles.loadingText}>Finding great academies for you...</Text>
          </View>
        ) : filteredAcademies.length > 0 ? (
          <Animated.FlatList
            data={filteredAcademies}
            renderItem={renderAcademyCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
            showsVerticalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
          />
        ) : (
          renderEmptyState()
        )}
      </View>

      {renderFiltersModal()}
      {renderAcademyModal()}

      <FAB
        icon="map"
        style={styles.fab}
        onPress={() => {
          Vibration.vibrate(30);
          Alert.alert('Feature Coming Soon', 'Map view will be available in the next update! 🗺️');
        }}
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
    paddingTop: 60,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    color: 'rgba(255, 255, 255, 0.9)',
    marginLeft: SPACING.xs,
    fontSize: 13,
  },
  searchContainer: {
    elevation: 2,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: 'white',
  },
  searchBar: {
    backgroundColor: 'white',
    elevation: 0,
    borderRadius: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    borderRadius: 12,
    paddingVertical: SPACING.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    ...TEXT_STYLES.h3,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: '60%',
    alignSelf: 'center',
  },
  filtersContainer: {
    backgroundColor: 'white',
    paddingVertical: SPACING.sm,
    elevation: 1,
  },
  filterContent: {
    paddingHorizontal: SPACING.md,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  filterButtonText: {
    color: COLORS.primary,
    marginLeft: SPACING.xs,
    fontSize: 12,
    fontWeight: '600',
  },
  filterChip: {
    marginHorizontal: SPACING.xs,
    backgroundColor: 'white',
    borderColor: COLORS.border,
  },
  filterChipText: {
    fontSize: 12,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  loadingText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  listContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  cardContainer: {
    marginBottom: SPACING.lg,
  },
  academyCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardImageContainer: {
    height: 180,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardImageContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: SPACING.md,
    justifyContent: 'space-between',
  },
  cardImageTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  favoriteButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: SPACING.xs,
  },
  cardImageBottom: {
    alignItems: 'flex-start',
  },
  ratingContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: SPACING.xs,
  },
  ratingText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  cardContent: {
    padding: SPACING.md,
  },
  academyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  academyLogo: {
    marginRight: SPACING.sm,
  },
  academyInfo: {
    flex: 1,
  },
  academyName: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
    fontWeight: 'bold',
    fontSize: 16,
  },
  academyLocation: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  priceRange: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  sportsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    flexWrap: 'wrap',
  },
  sportChip: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
    backgroundColor: COLORS.surface,
    borderColor: COLORS.primary,
  },
  sportChipText: {
    color: COLORS.primary,
    fontSize: 11,
  },
  moreSports: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontStyle: 'italic',
  },
  academyMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  metaText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontSize: 11,
    marginLeft: SPACING.xs,
  },
  description: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    lineHeight: 18,
    fontSize: 13,
    marginBottom: SPACING.sm,
  },
  cardActions: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  messageButton: {
    flex: 1,
    marginRight: SPACING.xs,
    borderColor: COLORS.primary,
  },
  messageButtonText: {
    color: COLORS.primary,
    fontSize: 12,
  },
  trialButton: {
    flex: 1,
    marginLeft: SPACING.xs,
    backgroundColor: COLORS.primary,
  },
  trialButtonText: {
    color: 'white',
    fontSize: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  emptyStateTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptyStateText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  resetButton: {
    backgroundColor: COLORS.primary,
  },
  filterModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  filterModal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterModalTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
  },
  filterModalContent: {
    padding: SPACING.lg,
  },
  filterSection: {
    marginBottom: SPACING.lg,
  },
  filterSectionTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterOptionChip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  filterModalActions: {
    flexDirection: 'row',
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  resetFiltersButton: {
    flex: 1,
    marginRight: SPACING.sm,
    borderColor: COLORS.textSecondary,
  },
  applyFiltersButton: {
    flex: 2,
    marginLeft: SPACING.sm,
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
    margin: SPACING.md,
  },
  blurView: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalScrollView: {
    flex: 1,
  },
  modalCard: {
    margin: 0,
    backgroundColor: 'white',
  },
  modalImageContainer: {
    height: 250,
    position: 'relative',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  modalImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalImageContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: SPACING.lg,
    justifyContent: 'space-between',
  },
  closeButton: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalImageInfo: {
    alignItems: 'flex-start',
  },
  modalAcademyName: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  modalAcademyLocation: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    marginBottom: SPACING.sm,
  },
  modalRating: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalRatingText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
  modalContent: {
    padding: SPACING.lg,
  },
  modalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 12,
  },
  modalStatItem: {
    alignItems: 'center',
  },
  modalStatNumber: {
    ...TEXT_STYLES.h3,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginTop: SPACING.xs,
  },
  modalStatLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  modalDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  modalSection: {
    marginBottom: SPACING.lg,
  },
  modalSectionTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
    fontSize: 16,
  },
  sportsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  modalSportChip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.primary,
  },
  modalSportChipText: {
    color: 'white',
    fontSize: 12,
  },
  programsList: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 8,
  },
  programItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  programText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    marginLeft: SPACING.xs,
    fontSize: 13,
  },
  facilitiesList: {
    marginBottom: SPACING.md,
  },
  facilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
  },
  facilityText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    marginLeft: SPACING.xs,
    fontSize: 13,
  },
  featuresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureChip: {
    backgroundColor: COLORS.primary,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  featureChipText: {
    color: 'white',
    fontSize: 11,
  },
  ageGroupsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ageGroups: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  ageChip: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  pricingInfo: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  priceValue: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  achievementsList: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 8,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  achievementText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    marginLeft: SPACING.xs,
    fontSize: 13,
    fontWeight: '600',
  },
  galleryContainer: {
    paddingVertical: SPACING.sm,
  },
  galleryImageContainer: {
    marginRight: SPACING.sm,
  },
  galleryImage: {
    width: 120,
    height: 80,
    borderRadius: 8,
  },
  contactOptions: {
    marginBottom: SPACING.md,
  },
  contactOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  contactText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    marginLeft: SPACING.sm,
    fontSize: 13,
  },
  responseTimeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    borderRadius: 8,
  },
  responseTimeText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
    fontSize: 12,
  },
  modalActions: {
    padding: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  directionsButton: {
    flex: 1,
    marginRight: SPACING.xs,
    borderColor: COLORS.primary,
  },
  bookTrialButton: {
    flex: 1,
    marginLeft: SPACING.xs,
    backgroundColor: COLORS.primary,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default FindAcademies;