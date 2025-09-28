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
  Divider,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { COLORS, SPACING, TEXT_STYLES } from '../styles/theme';

const { width } = Dimensions.get('window');

const OpenTrainingSessions = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, sessions, loading } = useSelector(state => ({
    user: state.auth.user,
    sessions: state.sessions.openSessions,
    loading: state.sessions.loading,
  }));

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSport, setSelectedSport] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedDate, setSelectedDate] = useState('All');
  const [priceRange, setPriceRange] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const [joinedSessions, setJoinedSessions] = useState(new Set());
  const [sortBy, setSortBy] = useState('date'); // 'date', 'price', 'rating', 'spots'
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Mock data for open training sessions
  const [sessionsData, setSessionsData] = useState([
    {
      id: '1',
      title: 'Football Skills Development',
      sport: 'Football',
      level: 'Intermediate',
      coach: {
        name: 'Coach Michael Otieno',
        avatar: 'https://via.placeholder.com/50',
        rating: 4.8,
        reviews: 156,
        verified: true,
        specialization: 'Youth Development',
      },
      date: '2025-08-25',
      time: '4:00 PM - 6:00 PM',
      duration: '2 hours',
      location: 'Kasarani Sports Complex',
      distance: '5.2 km',
      price: 800,
      currency: 'KES',
      spotsAvailable: 8,
      totalSpots: 15,
      description: 'Focus on ball control, passing accuracy, and tactical awareness. Perfect for players looking to improve their technical skills.',
      requirements: ['Football boots', 'Shin guards', 'Water bottle'],
      focus: ['Ball Control', 'Passing', 'Tactical Awareness'],
      ageRange: '16-25 years',
      equipment: 'Provided',
      recurring: 'Weekly',
      category: 'Skills Training',
      intensity: 'Medium',
      outdoor: true,
      certified: true,
      tags: ['Technical', 'Youth Friendly', 'Team Play'],
    },
    {
      id: '2',
      title: 'Swimming Technique Masterclass',
      sport: 'Swimming',
      level: 'Advanced',
      coach: {
        name: 'Coach Sarah Kimani',
        avatar: 'https://via.placeholder.com/50',
        rating: 4.9,
        reviews: 89,
        verified: true,
        specialization: 'Competitive Swimming',
      },
      date: '2025-08-24',
      time: '6:00 AM - 8:00 AM',
      duration: '2 hours',
      location: 'Aqua Life Swimming Pool',
      distance: '3.8 km',
      price: 1500,
      currency: 'KES',
      spotsAvailable: 3,
      totalSpots: 8,
      description: 'Advanced swimming techniques for competitive swimmers. Focus on stroke efficiency and race strategy.',
      requirements: ['Swimming goggles', 'Swim cap', 'Racing swimwear'],
      focus: ['Stroke Technique', 'Racing Strategy', 'Endurance'],
      ageRange: '18+ years',
      equipment: 'BYO Equipment',
      recurring: 'Bi-weekly',
      category: 'Competitive Training',
      intensity: 'High',
      outdoor: false,
      certified: true,
      tags: ['Competitive', 'Advanced Only', 'Race Prep'],
    },
    {
      id: '3',
      title: 'Basketball Fundamentals',
      sport: 'Basketball',
      level: 'Beginner',
      coach: {
        name: 'Coach James Mwangi',
        avatar: 'https://via.placeholder.com/50',
        rating: 4.6,
        reviews: 234,
        verified: true,
        specialization: 'Youth Basketball',
      },
      date: '2025-08-26',
      time: '5:30 PM - 7:00 PM',
      duration: '1.5 hours',
      location: 'CBD Basketball Courts',
      distance: '6.1 km',
      price: 600,
      currency: 'KES',
      spotsAvailable: 12,
      totalSpots: 20,
      description: 'Learn basketball basics: dribbling, shooting, and defense. Great for beginners wanting to start their basketball journey.',
      requirements: ['Basketball shoes', 'Comfortable clothing', 'Water bottle'],
      focus: ['Dribbling', 'Shooting', 'Defense Basics'],
      ageRange: '12-18 years',
      equipment: 'Provided',
      recurring: 'Weekly',
      category: 'Fundamentals',
      intensity: 'Low',
      outdoor: true,
      certified: true,
      tags: ['Beginner Friendly', 'Youth', 'Fun Learning'],
    },
    {
      id: '4',
      title: 'Tennis Singles Strategy',
      sport: 'Tennis',
      level: 'Intermediate',
      coach: {
        name: 'Coach Emma Wilson',
        avatar: 'https://via.placeholder.com/50',
        rating: 4.7,
        reviews: 67,
        verified: true,
        specialization: 'Singles Play',
      },
      date: '2025-08-27',
      time: '7:00 AM - 9:00 AM',
      duration: '2 hours',
      location: 'Karen Tennis Club',
      distance: '12.3 km',
      price: 2000,
      currency: 'KES',
      spotsAvailable: 6,
      totalSpots: 8,
      description: 'Develop winning strategies for singles tennis. Focus on court positioning, shot selection, and mental game.',
      requirements: ['Tennis racket', 'Tennis shoes', 'Tennis balls'],
      focus: ['Court Positioning', 'Shot Selection', 'Mental Game'],
      ageRange: '16+ years',
      equipment: 'BYO Equipment',
      recurring: 'Weekly',
      category: 'Strategy & Tactics',
      intensity: 'Medium',
      outdoor: true,
      certified: true,
      tags: ['Strategy', 'Singles Focus', 'Mental Training'],
    },
    {
      id: '5',
      title: 'Athletics Sprint Training',
      sport: 'Athletics',
      level: 'All Levels',
      coach: {
        name: 'Coach David Kiptoo',
        avatar: 'https://via.placeholder.com/50',
        rating: 4.9,
        reviews: 198,
        verified: true,
        specialization: 'Sprint & Speed',
      },
      date: '2025-08-23',
      time: '6:30 AM - 8:30 AM',
      duration: '2 hours',
      location: 'Nyayo National Stadium',
      distance: '7.8 km',
      price: 1000,
      currency: 'KES',
      spotsAvailable: 15,
      totalSpots: 25,
      description: 'Improve your sprinting technique and speed. Suitable for all levels with personalized coaching approach.',
      requirements: ['Running spikes', 'Athletic wear', 'Water bottle'],
      focus: ['Sprint Technique', 'Speed Development', 'Starting Blocks'],
      ageRange: '14+ years',
      equipment: 'Some Provided',
      recurring: 'Bi-weekly',
      category: 'Speed & Agility',
      intensity: 'High',
      outdoor: true,
      certified: true,
      tags: ['All Levels', 'Speed Training', 'Olympic Prep'],
    },
  ]);

  const sports = ['All', 'Football', 'Basketball', 'Swimming', 'Tennis', 'Athletics', 'Rugby'];
  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced', 'All Levels'];
  const dateFilters = ['All', 'Today', 'Tomorrow', 'This Week', 'Next Week'];
  const priceRanges = ['All', 'Under KES 500', 'KES 500-1000', 'KES 1000-1500', 'Above KES 1500'];

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

    // Load training sessions
    loadTrainingSessions();
  }, []);

  const loadTrainingSessions = useCallback(async () => {
    try {
      // Simulate API call
      // dispatch(fetchOpenTrainingSessions());
    } catch (error) {
      console.error('Error loading training sessions:', error);
    }
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTrainingSessions();
    setRefreshing(false);
  }, [loadTrainingSessions]);

  const getDateFilter = (session) => {
    const today = new Date();
    const sessionDate = new Date(session.date);
    const diffTime = sessionDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 7) return 'This Week';
    if (diffDays <= 14) return 'Next Week';
    return 'Later';
  };

  const filteredSessions = sessionsData.filter(session => {
    const matchesSearch = session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         session.sport.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         session.coach.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport = selectedSport === 'All' || session.sport === selectedSport;
    const matchesLevel = selectedLevel === 'All' || session.level === selectedLevel;
    const matchesDate = selectedDate === 'All' || getDateFilter(session) === selectedDate;
    const matchesPriceRange = priceRange === 'All' || 
                             (priceRange === 'Under KES 500' && session.price < 500) ||
                             (priceRange === 'KES 500-1000' && session.price >= 500 && session.price <= 1000) ||
                             (priceRange === 'KES 1000-1500' && session.price > 1000 && session.price <= 1500) ||
                             (priceRange === 'Above KES 1500' && session.price > 1500);
    
    return matchesSearch && matchesSport && matchesLevel && matchesDate && matchesPriceRange;
  });

  // Sort filtered sessions
  const sortedSessions = [...filteredSessions].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(a.date) - new Date(b.date);
      case 'price':
        return a.price - b.price;
      case 'rating':
        return b.coach.rating - a.coach.rating;
      case 'spots':
        return b.spotsAvailable - a.spotsAvailable;
      default:
        return 0;
    }
  });

  const toggleFavorite = useCallback((sessionId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(sessionId)) {
        newFavorites.delete(sessionId);
      } else {
        newFavorites.add(sessionId);
      }
      return newFavorites;
    });
  }, []);

  const joinSession = useCallback((session) => {
    if (session.spotsAvailable === 0) {
      Alert.alert('Session Full', 'This session is fully booked. You can join the waiting list.');
      return;
    }

    Alert.alert(
      'Join Training Session',
      `Join "${session.title}" by ${session.coach.name}?\n\nPrice: ${session.currency} ${session.price}\nDate: ${new Date(session.date).toLocaleDateString()}\nTime: ${session.time}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Join Session',
          onPress: () => {
            setJoinedSessions(prev => new Set([...prev, session.id]));
            // Update available spots
            setSessionsData(prevSessions =>
              prevSessions.map(s =>
                s.id === session.id
                  ? { ...s, spotsAvailable: s.spotsAvailable - 1 }
                  : s
              )
            );
            Alert.alert('Success', 'Successfully joined the training session! Check your bookings for details.');
          },
        },
      ]
    );
  }, []);

  const contactCoach = useCallback((coach) => {
    Alert.alert(
      'Contact Coach',
      `Contact ${coach.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Message', onPress: () => Alert.alert('Info', 'Messaging feature coming soon!') },
        { text: 'Call', onPress: () => Alert.alert('Info', 'Calling feature coming soon!') },
      ]
    );
  }, []);

  const getIntensityColor = (intensity) => {
    switch (intensity) {
      case 'Low': return COLORS.success;
      case 'Medium': return '#FFA500';
      case 'High': return COLORS.error;
      default: return COLORS.primary;
    }
  };

  const getSpotAvailabilityColor = (available, total) => {
    const percentage = (available / total) * 100;
    if (percentage > 60) return COLORS.success;
    if (percentage > 30) return '#FFA500';
    return COLORS.error;
  };

  const renderSessionCard = ({ item, index }) => (
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
      <Card style={styles.sessionCard} elevation={4}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.cardHeader}
        >
          <View style={styles.headerContent}>
            <View style={styles.sessionInfo}>
              <View style={styles.titleRow}>
                <Text style={styles.sessionTitle}>{item.title}</Text>
                {item.certified && (
                  <Icon name="verified" size={18} color="white" style={styles.certifiedIcon} />
                )}
              </View>
              <Text style={styles.sessionSport}>{item.sport} • {item.level}</Text>
              <View style={styles.sessionMeta}>
                <View style={styles.dateTimeContainer}>
                  <Icon name="event" size={14} color="white" />
                  <Text style={styles.dateTime}>
                    {new Date(item.date).toLocaleDateString()} • {item.time}
                  </Text>
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
          {/* Coach Information */}
          <TouchableOpacity 
            style={styles.coachContainer}
            onPress={() => contactCoach(item.coach)}
          >
            <Avatar.Image
              size={40}
              source={{ uri: item.coach.avatar }}
              style={styles.coachAvatar}
            />
            <View style={styles.coachInfo}>
              <View style={styles.coachNameRow}>
                <Text style={styles.coachName}>{item.coach.name}</Text>
                {item.coach.verified && (
                  <Icon name="verified" size={14} color={COLORS.primary} />
                )}
              </View>
              <Text style={styles.coachSpecialization}>{item.coach.specialization}</Text>
              <View style={styles.coachRating}>
                <Icon name="star" size={14} color="#FFD700" />
                <Text style={styles.rating}>{item.coach.rating}</Text>
                <Text style={styles.reviewCount}>({item.coach.reviews} reviews)</Text>
              </View>
            </View>
          </TouchableOpacity>

          <Divider style={styles.divider} />

          {/* Session Details */}
          <View style={styles.sessionDetails}>
            <View style={styles.detailRow}>
              <Icon name="location-on" size={16} color={COLORS.primary} />
              <Text style={styles.detailText}>{item.location}</Text>
              <Text style={styles.distance}>• {item.distance}</Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="schedule" size={16} color={COLORS.primary} />
              <Text style={styles.detailText}>{item.duration} • {item.recurring}</Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="fitness-center" size={16} color={COLORS.primary} />
              <Text style={styles.detailText}>Intensity: </Text>
              <Chip
                mode="outlined"
                compact
                style={[styles.intensityChip, { borderColor: getIntensityColor(item.intensity) }]}
                textStyle={[styles.intensityText, { color: getIntensityColor(item.intensity) }]}
              >
                {item.intensity}
              </Chip>
            </View>
          </View>

          {/* Focus Areas */}
          <View style={styles.focusContainer}>
            <Text style={styles.focusTitle}>Focus Areas:</Text>
            <View style={styles.focusChips}>
              {item.focus.map((area, focusIndex) => (
                <Chip
                  key={focusIndex}
                  mode="outlined"
                  compact
                  style={styles.focusChip}
                  textStyle={styles.focusChipText}
                >
                  {area}
                </Chip>
              ))}
            </View>
          </View>

          {/* Spots Available */}
          <View style={styles.spotsContainer}>
            <View style={styles.spotsHeader}>
              <Text style={styles.spotsText}>Available Spots</Text>
              <Text style={[
                styles.spotsCount,
                { color: getSpotAvailabilityColor(item.spotsAvailable, item.totalSpots) }
              ]}>
                {item.spotsAvailable}/{item.totalSpots}
              </Text>
            </View>
            <ProgressBar
              progress={(item.totalSpots - item.spotsAvailable) / item.totalSpots}
              color={getSpotAvailabilityColor(item.spotsAvailable, item.totalSpots)}
              style={styles.spotsProgress}
            />
          </View>

          {/* Tags */}
          <View style={styles.tagsContainer}>
            {item.tags.map((tag, tagIndex) => (
              <Chip
                key={tagIndex}
                mode="outlined"
                compact
                style={styles.tagChip}
                textStyle={styles.tagText}
              >
                {tag}
              </Chip>
            ))}
          </View>

          <Text style={styles.description} numberOfLines={3}>
            {item.description}
          </Text>

          {/* Price and Action */}
          <View style={styles.priceActionContainer}>
            <View style={styles.priceContainer}>
              <Text style={styles.priceAmount}>{item.currency} {item.price}</Text>
              <Text style={styles.priceLabel}>per session</Text>
            </View>
            <Button
              mode="contained"
              onPress={() => joinSession(item)}
              style={[
                styles.joinButton,
                joinedSessions.has(item.id) && styles.joinedButton,
                item.spotsAvailable === 0 && styles.fullButton
              ]}
              labelStyle={styles.joinButtonText}
              disabled={joinedSessions.has(item.id)}
            >
              {joinedSessions.has(item.id) 
                ? 'Joined ✓' 
                : item.spotsAvailable === 0 
                ? 'Full' 
                : 'Join Session'}
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
            <Text style={styles.headerTitle}>Open Training Sessions</Text>
            <Text style={styles.headerSubtitle}>Join group training with expert coaches 🏃‍♂️</Text>
          </View>
          <Avatar.Image
            size={40}
            source={{ uri: user?.avatar || 'https://via.placeholder.com/40' }}
            style={styles.avatar}
          />
        </View>

        <Searchbar
          placeholder="Search sessions, sports, coaches..."
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
              const sortOptions = ['date', 'price', 'rating', 'spots'];
              const currentIndex = sortOptions.indexOf(sortBy);
              const nextIndex = (currentIndex + 1) % sortOptions.length;
              setSortBy(sortOptions[nextIndex]);
            }}
          >
            <Icon name="sort" size={16} color="white" />
            <Text style={styles.sortText}>
              Sort: {sortBy === 'date' ? 'Date' : sortBy === 'price' ? 'Price' : 
                     sortBy === 'rating' ? 'Rating' : 'Spots'}
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
            <Text style={styles.filterSectionTitle}>Sport</Text>
            {renderFilterChip(sports, selectedSport, setSelectedSport)}
            
            <Text style={styles.filterSectionTitle}>Level</Text>
            {renderFilterChip(levels, selectedLevel, setSelectedLevel)}
            
            <Text style={styles.filterSectionTitle}>Date</Text>
            {renderFilterChip(dateFilters, selectedDate, setSelectedDate)}
            
            <Text style={styles.filterSectionTitle}>Price Range</Text>
            {renderFilterChip(priceRanges, priceRange, setPriceRange)}
          </Animated.View>
        )}
      </LinearGradient>

      <View style={styles.statsContainer}>
        <Surface style={styles.statCard} elevation={2}>
          <Text style={styles.statNumber}>{sortedSessions.length}</Text>
          <Text style={styles.statLabel}>Available</Text>
        </Surface>
        <Surface style={styles.statCard} elevation={2}>
          <Text style={styles.statNumber}>{joinedSessions.size}</Text>
          <Text style={styles.statLabel}>Joined</Text>
        </Surface>
        <Surface style={styles.statCard} elevation={2}>
          <Text style={styles.statNumber}>{favorites.size}</Text>
          <Text style={styles.statLabel}>Favorites</Text>
        </Surface>
        <Surface style={styles.statCard} elevation={2}>
          <Text style={styles.statNumber}>
            {sortedSessions.filter(s => getDateFilter(s) === 'Today' || getDateFilter(s) === 'Tomorrow').length}
          </Text>
          <Text style={styles.statLabel}>Soon</Text>
        </Surface>
      </View>

      {sortedSessions.length > 0 ? (
        <FlatList
          data={sortedSessions}
          renderItem={renderSessionCard}
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
          <Icon name="group" size={80} color={COLORS.primary} />
          <Text style={styles.emptyTitle}>No training sessions found</Text>
          <Text style={styles.emptySubtitle}>
            Try adjusting your search or filters
          </Text>
          <Button
            mode="outlined"
            onPress={() => {
              setSelectedSport('All');
              setSelectedLevel('All');
              setSelectedDate('All');
              setPriceRange('All');
            }}
            style={styles.clearFiltersButton}
          >
            Clear All Filters
          </Button>
        </View>
      )}

      <FAB
        icon="calendar-plus"
        style={styles.fab}
        onPress={() => Alert.alert('Info', 'Feature coming soon! Coaches will be able to create open training sessions.')}
        color="white"
        label="Create Session"
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
  avatar: {
    borderWidth: 2,
    borderColor: 'white',
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
  },
  sortText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: SPACING.xs,
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
    fontSize: 12,
    fontWeight: '500',
    marginHorizontal: SPACING.xs,
  },
  filtersContainer: {
    marginTop: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: SPACING.md,
  },
  filterSectionTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  filterScrollView: {
    marginBottom: SPACING.sm,
  },
  filterScrollContent: {
    paddingHorizontal: SPACING.xs,
  },
  filterChip: {
    marginRight: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  selectedFilterChip: {
    backgroundColor: 'white',
    borderColor: 'white',
  },
  filterChipText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  selectedFilterChipText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
    marginHorizontal: SPACING.xs,
    borderRadius: 8,
    backgroundColor: 'white',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  listContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100,
  },
  cardContainer: {
    marginBottom: SPACING.lg,
  },
  sessionCard: {
    borderRadius: 15,
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  cardHeader: {
    padding: SPACING.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sessionInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  certifiedIcon: {
    marginLeft: SPACING.sm,
  },
  sessionSport: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginBottom: SPACING.sm,
  },
  sessionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateTime: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    marginLeft: SPACING.xs,
  },
  favoriteButton: {
    padding: SPACING.sm,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardContent: {
    padding: SPACING.lg,
  },
  coachContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  coachAvatar: {
    marginRight: SPACING.md,
  },
  coachInfo: {
    flex: 1,
  },
  coachNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coachName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginRight: SPACING.xs,
  },
  coachSpecialization: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  coachRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  rating: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: SPACING.xs,
  },
  reviewCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  divider: {
    marginVertical: SPACING.md,
  },
  sessionDetails: {
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  detailText: {
    fontSize: 13,
    color: COLORS.text,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  distance: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  intensityChip: {
    height: 24,
    marginLeft: SPACING.sm,
  },
  intensityText: {
    fontSize: 11,
    fontWeight: '600',
  },
  focusContainer: {
    marginBottom: SPACING.md,
  },
  focusTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  focusChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  focusChip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
    backgroundColor: COLORS.background,
    height: 28,
  },
  focusChipText: {
    fontSize: 11,
    color: COLORS.primary,
  },
  spotsContainer: {
    marginBottom: SPACING.md,
  },
  spotsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  spotsText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  spotsCount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  spotsProgress: {
    height: 4,
    borderRadius: 2,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  tagChip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderColor: 'rgba(102, 126, 234, 0.3)',
    height: 26,
  },
  tagText: {
    fontSize: 10,
    color: COLORS.primary,
  },
  description: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: SPACING.lg,
  },
  priceActionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flex: 1,
  },
  priceAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  priceLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  joinButton: {
    borderRadius: 25,
    paddingHorizontal: SPACING.lg,
  },
  joinedButton: {
    backgroundColor: COLORS.success,
  },
  fullButton: {
    backgroundColor: COLORS.textSecondary,
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.lg,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  clearFiltersButton: {
    borderColor: COLORS.primary,
    borderRadius: 25,
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.lg,
    backgroundColor: COLORS.primary,
    borderRadius: 28,
  },
});

export default OpenTrainingSessions;