import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  StatusBar,
  TouchableOpacity,
  Animated,
  Vibration,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  Avatar,
  Surface,
  Portal,
  Searchbar,
  FAB,
  IconButton,
  ProgressBar,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import constants (these would be defined in your constants file)
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  background: '#f5f5f5',
  white: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e0e0e0',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subheading: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  body: {
    fontSize: 16,
    color: COLORS.text,
  },
  caption: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
};

const SearchAcademies = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector(state => state.auth);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [academies, setAcademies] = useState([]);
  const [filteredAcademies, setFilteredAcademies] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Mock data for demonstration
  const mockAcademies = [
    {
      id: '1',
      name: 'Elite Football Academy',
      sport: 'Football',
      location: 'Nairobi, Kenya',
      rating: 4.8,
      price: '$50/session',
      distance: '2.5 km',
      image: null,
      description: 'Professional football training for all levels',
      facilities: ['Grass Field', 'Gym', 'Changing Rooms'],
      coaches: 8,
      students: 150,
      achievements: ['National Champions 2023', 'Youth League Winners'],
    },
    {
      id: '2',
      name: 'Champions Basketball Center',
      sport: 'Basketball',
      location: 'Westlands, Nairobi',
      rating: 4.6,
      price: '$40/session',
      distance: '3.8 km',
      image: null,
      description: 'Develop your basketball skills with professional coaches',
      facilities: ['Indoor Court', 'Weight Room', 'Recovery Center'],
      coaches: 5,
      students: 80,
      achievements: ['Regional Champions', 'Development Academy'],
    },
    {
      id: '3',
      name: 'Aquatic Swimming Academy',
      sport: 'Swimming',
      location: 'Karen, Nairobi',
      rating: 4.9,
      price: '$35/session',
      distance: '5.2 km',
      image: null,
      description: 'Olympic-standard swimming training facility',
      facilities: ['Olympic Pool', 'Kids Pool', 'Spa'],
      coaches: 6,
      students: 120,
      achievements: ['Olympic Qualifiers', 'National Records'],
    },
  ];

  const sports = ['Football', 'Basketball', 'Swimming', 'Tennis', 'Athletics', 'Volleyball'];
  const locations = ['Nairobi', 'Westlands', 'Karen', 'Kileleshwa', 'Lavington', 'Kilimani'];

  useEffect(() => {
    // Animate screen entrance
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

    // Load academies data
    loadAcademies();
  }, []);

  useEffect(() => {
    filterAcademies();
  }, [searchQuery, selectedSport, selectedLocation, academies]);

  const loadAcademies = useCallback(async () => {
    try {
      // In a real app, this would be an API call
      setAcademies(mockAcademies);
      setFilteredAcademies(mockAcademies);
    } catch (error) {
      console.error('Error loading academies:', error);
      Alert.alert('Error', 'Failed to load academies. Please try again.');
    }
  }, []);

  const filterAcademies = useCallback(() => {
    let filtered = academies.filter(academy => {
      const matchesSearch = academy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          academy.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSport = !selectedSport || academy.sport === selectedSport;
      const matchesLocation = !selectedLocation || academy.location.includes(selectedLocation);
      
      return matchesSearch && matchesSport && matchesLocation;
    });
    
    setFilteredAcademies(filtered);
  }, [searchQuery, selectedSport, selectedLocation, academies]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Vibration.vibrate(50);
    await loadAcademies();
    setRefreshing(false);
  }, [loadAcademies]);

  const toggleFavorite = (academyId) => {
    Vibration.vibrate(30);
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(academyId)) {
        newFavorites.delete(academyId);
      } else {
        newFavorites.add(academyId);
      }
      return newFavorites;
    });
  };

  const handleBookSession = (academy) => {
    Vibration.vibrate(50);
    Alert.alert(
      '🎯 Feature Coming Soon!',
      'Academy booking functionality is under development. Stay tuned for updates!',
      [{ text: 'Got it!', style: 'default' }]
    );
  };

  const handleContactAcademy = (academy) => {
    Vibration.vibrate(30);
    Alert.alert(
      '📞 Feature Coming Soon!',
      'Direct contact functionality is under development. You can currently save academies to favorites!',
      [{ text: 'Understood', style: 'default' }]
    );
  };

  const renderAcademyCard = (academy) => (
    <Animated.View
      key={academy.id}
      style={[
        styles.cardContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Card style={styles.academyCard}>
        <View style={styles.cardHeader}>
          <Avatar.Text
            size={50}
            label={academy.name.charAt(0)}
            style={{ backgroundColor: COLORS.primary }}
          />
          <View style={styles.headerInfo}>
            <Text style={TEXT_STYLES.subheading}>{academy.name}</Text>
            <View style={styles.locationRow}>
              <Icon name="location-on" size={16} color={COLORS.textSecondary} />
              <Text style={TEXT_STYLES.caption}>{academy.location}</Text>
            </View>
            <View style={styles.ratingRow}>
              <Icon name="star" size={16} color="#FFD700" />
              <Text style={TEXT_STYLES.caption}>{academy.rating}</Text>
              <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.sm }]}>
                • {academy.distance}
              </Text>
            </View>
          </View>
          <IconButton
            icon={favorites.has(academy.id) ? "favorite" : "favorite-border"}
            iconColor={favorites.has(academy.id) ? COLORS.error : COLORS.textSecondary}
            size={24}
            onPress={() => toggleFavorite(academy.id)}
          />
        </View>

        <Card.Content>
          <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.sm }]}>
            {academy.description}
          </Text>
          
          <Chip
            mode="outlined"
            icon="sports"
            style={[styles.sportChip, { marginBottom: SPACING.md }]}
            textStyle={{ color: COLORS.primary }}
          >
            {academy.sport}
          </Chip>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Icon name="group" size={20} color={COLORS.primary} />
              <Text style={TEXT_STYLES.caption}>{academy.coaches} Coaches</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="school" size={20} color={COLORS.primary} />
              <Text style={TEXT_STYLES.caption}>{academy.students} Students</Text>
            </View>
          </View>

          <View style={styles.facilitiesRow}>
            <Text style={[TEXT_STYLES.caption, { fontWeight: '600' }]}>Facilities: </Text>
            {academy.facilities.slice(0, 2).map((facility, index) => (
              <Chip key={index} mode="outlined" compact style={styles.facilityChip}>
                {facility}
              </Chip>
            ))}
            {academy.facilities.length > 2 && (
              <Text style={TEXT_STYLES.caption}>+{academy.facilities.length - 2} more</Text>
            )}
          </View>
        </Card.Content>

        <Card.Actions style={styles.cardActions}>
          <View style={styles.priceContainer}>
            <Text style={[TEXT_STYLES.subheading, { color: COLORS.primary }]}>
              {academy.price}
            </Text>
          </View>
          <Button
            mode="outlined"
            onPress={() => handleContactAcademy(academy)}
            style={styles.actionButton}
          >
            Contact
          </Button>
          <Button
            mode="contained"
            onPress={() => handleBookSession(academy)}
            style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
          >
            Book Session
          </Button>
        </Card.Actions>
      </Card>
    </Animated.View>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <Text style={[TEXT_STYLES.subheading, { marginBottom: SPACING.md }]}>
        Filter by Sport 🏆
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Chip
          selected={!selectedSport}
          onPress={() => setSelectedSport('')}
          style={styles.filterChip}
        >
          All Sports
        </Chip>
        {sports.map((sport) => (
          <Chip
            key={sport}
            selected={selectedSport === sport}
            onPress={() => setSelectedSport(sport)}
            style={styles.filterChip}
          >
            {sport}
          </Chip>
        ))}
      </ScrollView>

      <Text style={[TEXT_STYLES.subheading, { marginBottom: SPACING.md, marginTop: SPACING.lg }]}>
        Filter by Location 📍
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Chip
          selected={!selectedLocation}
          onPress={() => setSelectedLocation('')}
          style={styles.filterChip}
        >
          All Locations
        </Chip>
        {locations.map((location) => (
          <Chip
            key={location}
            selected={selectedLocation === location}
            onPress={() => setSelectedLocation(location)}
            style={styles.filterChip}
          >
            {location}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Find Sports Academies 🏟️</Text>
        <Text style={styles.headerSubtitle}>
          Discover the perfect training academy for your sport
        </Text>
      </LinearGradient>

      <Surface style={styles.searchContainer}>
        <Searchbar
          placeholder="Search academies..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={TEXT_STYLES.body}
          iconColor={COLORS.primary}
        />
        <IconButton
          icon="tune"
          iconColor={COLORS.primary}
          size={24}
          onPress={() => setShowFilters(!showFilters)}
        />
      </Surface>

      {showFilters && renderFilters()}

      <ScrollView
        style={styles.content}
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
        <View style={styles.resultsHeader}>
          <Text style={TEXT_STYLES.subheading}>
            {filteredAcademies.length} Academies Found 🎯
          </Text>
          {(selectedSport || selectedLocation) && (
            <TouchableOpacity
              onPress={() => {
                setSelectedSport('');
                setSelectedLocation('');
                Vibration.vibrate(30);
              }}
              style={styles.clearFilters}
            >
              <Text style={[TEXT_STYLES.caption, { color: COLORS.primary }]}>
                Clear Filters
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {filteredAcademies.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="search-off" size={80} color={COLORS.textSecondary} />
            <Text style={[TEXT_STYLES.subheading, { marginTop: SPACING.md }]}>
              No academies found
            </Text>
            <Text style={TEXT_STYLES.caption}>
              Try adjusting your search criteria
            </Text>
          </View>
        ) : (
          filteredAcademies.map(renderAcademyCard)
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <FAB
        icon="map"
        style={styles.fab}
        onPress={() => {
          Vibration.vibrate(50);
          Alert.alert(
            '🗺️ Feature Coming Soon!',
            'Map view functionality is under development. Stay tuned!',
            [{ text: 'Awesome!', style: 'default' }]
          );
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
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  headerTitle: {
    ...TEXT_STYLES.heading,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.white,
    opacity: 0.9,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: SPACING.md,
    borderRadius: 12,
    elevation: 2,
  },
  searchBar: {
    flex: 1,
    backgroundColor: 'transparent',
    elevation: 0,
  },
  filtersContainer: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.md,
  },
  filterChip: {
    marginRight: SPACING.sm,
  },
  content: {
    flex: 1,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  clearFilters: {
    padding: SPACING.xs,
  },
  cardContainer: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  academyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  headerInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  sportChip: {
    alignSelf: 'flex-start',
    backgroundColor: `${COLORS.primary}15`,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  facilitiesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: SPACING.sm,
  },
  facilityChip: {
    marginRight: SPACING.xs,
    marginTop: SPACING.xs,
  },
  cardActions: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  priceContainer: {
    flex: 1,
  },
  actionButton: {
    marginLeft: SPACING.sm,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    marginTop: SPACING.xl,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default SearchAcademies;