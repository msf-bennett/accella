import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  RefreshControl,
  StatusBar,
  FlatList,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import {
  Card,
  Searchbar,
  Button,
  Chip,
  Avatar,
  Surface,
  IconButton,
  FAB,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../../constants/theme';

const { width } = Dimensions.get('window');

const GymSearch = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { gyms, loading } = useSelector(state => state.gyms || {});

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGymType, setSelectedGymType] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Gym categories and specializations
  const gymCategories = [
    { id: 'general', name: 'General Fitness', icon: 'fitness-center', color: '#4CAF50' },
    { id: 'crossfit', name: 'CrossFit', icon: 'sports-gymnastics', color: '#FF9800' },
    { id: 'powerlifting', name: 'Powerlifting', icon: 'fitness-center', color: '#F44336' },
    { id: 'cardio', name: 'Cardio Focus', icon: 'directions-run', color: '#2196F3' },
    { id: 'yoga', name: 'Yoga Studio', icon: 'self-improvement', color: '#9C27B0' },
    { id: 'boxing', name: 'Boxing Gym', icon: 'sports-mma', color: '#795548' },
    { id: 'swimming', name: 'Swimming Pool', icon: 'pool', color: '#00BCD4' },
    { id: '24hour', name: '24/7 Access', icon: 'access-time', color: '#607D8B' },
  ];

  // Mock gym data
  const [gymData] = useState([
    {
      id: '1',
      name: 'Iron Paradise Gym',
      gymType: 'powerlifting',
      location: 'Westlands, Nairobi',
      rating: 4.8,
      price: 'KSh 4,500/month',
      image: 'https://via.placeholder.com/300x200',
      description: 'Premium powerlifting and strength training facility',
      trainers: 12,
      members: 350,
      established: 2018,
      facilities: ['Free Weights', 'Power Racks', 'Cardio Zone', 'Sauna', 'Locker Rooms'],
      programs: ['Personal Training', 'Group Classes', 'Powerlifting Coaching'],
      distance: '1.8 km',
      verified: true,
      openingHours: '5:00 AM - 11:00 PM',
      specialties: ['Powerlifting', 'Bodybuilding', 'Strength Training'],
      amenities: ['Parking', 'WiFi', 'Air Conditioning', 'Protein Bar'],
    },
    {
      id: '2',
      name: 'FitZone 24/7',
      gymType: '24hour',
      location: 'Karen, Nairobi',
      rating: 4.6,
      price: 'KSh 3,800/month',
      image: 'https://via.placeholder.com/300x200',
      description: '24-hour access gym with modern equipment',
      trainers: 8,
      members: 280,
      established: 2020,
      facilities: ['Cardio Machines', 'Weight Machines', 'Free Weights', 'Stretching Area'],
      programs: ['24/7 Access', 'Personal Training', 'Nutrition Coaching'],
      distance: '3.2 km',
      verified: true,
      openingHours: '24/7',
      specialties: ['General Fitness', 'Weight Loss', 'Muscle Building'],
      amenities: ['24/7 Access', 'Security', 'Parking', 'Vending Machines'],
    },
    {
      id: '3',
      name: 'CrossFit Warriors Box',
      gymType: 'crossfit',
      location: 'Kilimani, Nairobi',
      rating: 4.9,
      price: 'KSh 6,000/month',
      image: 'https://via.placeholder.com/300x200',
      description: 'Authentic CrossFit box with certified trainers',
      trainers: 6,
      members: 120,
      established: 2017,
      facilities: ['CrossFit Equipment', 'Pull-up Bars', 'Olympic Weights', 'Battle Ropes'],
      programs: ['CrossFit Classes', 'Olympic Lifting', 'Mobility Sessions'],
      distance: '2.1 km',
      verified: true,
      openingHours: '5:30 AM - 10:00 PM',
      specialties: ['CrossFit', 'Olympic Lifting', 'HIIT'],
      amenities: ['Community Events', 'Nutrition Coaching', 'Parking'],
    },
    {
      id: '4',
      name: 'Zen Yoga & Wellness',
      gymType: 'yoga',
      location: 'Lavington, Nairobi',
      rating: 4.7,
      price: 'KSh 2,500/month',
      image: 'https://via.placeholder.com/300x200',
      description: 'Peaceful yoga studio for mind and body wellness',
      trainers: 4,
      members: 95,
      established: 2019,
      facilities: ['Yoga Studios', 'Meditation Room', 'Changing Rooms', 'Props Storage'],
      programs: ['Hatha Yoga', 'Vinyasa Flow', 'Meditation', 'Pranayama'],
      distance: '4.5 km',
      verified: true,
      openingHours: '6:00 AM - 9:00 PM',
      specialties: ['Yoga', 'Meditation', 'Wellness'],
      amenities: ['Tea Bar', 'Retail Shop', 'Parking', 'Air Purification'],
    },
  ]);

  const [filteredGyms, setFilteredGyms] = useState(gymData);

  useEffect(() => {
    filterGyms();
  }, [searchQuery, selectedGymType, selectedLocation]);

  const filterGyms = useCallback(() => {
    let filtered = gymData;

    if (searchQuery) {
      filtered = filtered.filter(gym =>
        gym.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gym.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gym.specialties.some(specialty => 
          specialty.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    if (selectedGymType) {
      filtered = filtered.filter(gym => gym.gymType === selectedGymType);
    }

    if (selectedLocation) {
      filtered = filtered.filter(gym =>
        gym.location.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    setFilteredGyms(filtered);
  }, [searchQuery, selectedGymType, selectedLocation, gymData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('Success', 'Gym data refreshed! 💪');
    }, 2000);
  }, []);

  const handleGymPress = (gym) => {
    Alert.alert(
      'Gym Details',
      `Navigate to ${gym.name} details screen.\n\nThis feature is under development.`,
      [{ text: 'OK' }]
    );
  };

  const handleJoinGym = (gym) => {
    Alert.alert(
      'Join Gym',
      `Join ${gym.name}.\n\nMembership signup coming soon! 💪`,
      [{ text: 'OK' }]
    );
  };

  const handleContactGym = (gym) => {
    Alert.alert(
      'Contact Gym',
      `Contact ${gym.name}.\n\nMessaging system coming soon!`,
      [{ text: 'OK' }]
    );
  };

  const handleFreeTrial = (gym) => {
    Alert.alert(
      'Free Trial',
      `Book a free trial at ${gym.name}.\n\nTrial booking system coming soon! 🎯`,
      [{ text: 'OK' }]
    );
  };

  const renderGymCategory = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => setSelectedGymType(item.id === selectedGymType ? '' : item.id)}
    >
      <Surface
        style={[
          styles.categoryCardSurface,
          selectedGymType === item.id && styles.selectedCategory
        ]}
        elevation={2}
      >
        <View style={[styles.categoryIcon, { backgroundColor: item.color }]}>
          <Icon name={item.icon} size={24} color="#FFFFFF" />
        </View>
        <Text style={styles.categoryName}>{item.name}</Text>
      </Surface>
    </TouchableOpacity>
  );

  const renderGymCard = ({ item }) => (
    <Card style={styles.gymCard} onPress={() => handleGymPress(item)}>
      <Card.Cover
        source={{ uri: item.image }}
        style={styles.gymImage}
      />
      <Card.Content style={styles.gymContent}>
        <View style={styles.gymHeader}>
          <View style={styles.gymTitleRow}>
            <Text style={styles.gymName}>{item.name}</Text>
            {item.verified && (
              <Icon name="verified" size={18} color={COLORS.primary} />
            )}
          </View>
          <View style={styles.ratingRow}>
            <Icon name="star" size={16} color="#FFC107" />
            <Text style={styles.rating}>{item.rating}</Text>
          </View>
        </View>

        <View style={styles.locationRow}>
          <Icon name="location-on" size={16} color={COLORS.textSecondary} />
          <Text style={styles.location}>{item.location}</Text>
          <Text style={styles.distance}>• {item.distance}</Text>
        </View>

        <Text style={styles.description}>{item.description}</Text>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Icon name="fitness-center" size={16} color={COLORS.textSecondary} />
            <Text style={styles.statText}>{item.trainers} Trainers</Text>
          </View>
          <View style={styles.stat}>
            <Icon name="group" size={16} color={COLORS.textSecondary} />
            <Text style={styles.statText}>{item.members} Members</Text>
          </View>
          <View style={styles.stat}>
            <Icon name="access-time" size={16} color={COLORS.textSecondary} />
            <Text style={styles.statText}>{item.openingHours}</Text>
          </View>
        </View>

        <View style={styles.specialtiesRow}>
          {item.specialties.slice(0, 3).map((specialty, index) => (
            <Chip
              key={index}
              compact
              style={styles.specialtyChip}
              textStyle={styles.specialtyText}
            >
              {specialty}
            </Chip>
          ))}
          {item.specialties.length > 3 && (
            <Text style={styles.moreSpecialties}>
              +{item.specialties.length - 3} more
            </Text>
          )}
        </View>

        <View style={styles.facilitiesRow}>
          {item.facilities.slice(0, 3).map((facility, index) => (
            <Chip
              key={index}
              compact
              style={styles.facilityChip}
              textStyle={styles.facilityText}
            >
              {facility}
            </Chip>
          ))}
          {item.facilities.length > 3 && (
            <Text style={styles.moreFacilities}>
              +{item.facilities.length - 3} more
            </Text>
          )}
        </View>
      </Card.Content>

      <Card.Actions style={styles.gymActions}>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>{item.price}</Text>
        </View>
        <Button
          mode="outlined"
          compact
          onPress={() => handleFreeTrial(item)}
          style={styles.trialButton}
        >
          Free Trial
        </Button>
        <Button
          mode="contained"
          compact
          onPress={() => handleJoinGym(item)}
          style={styles.joinButton}
        >
          Join Gym
        </Button>
      </Card.Actions>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="search-off" size={80} color={COLORS.textSecondary} />
      <Text style={styles.emptyTitle}>No Gyms Found</Text>
      <Text style={styles.emptySubtitle}>
        Try adjusting your search criteria or explore different gym types
      </Text>
      <Button
        mode="outlined"
        onPress={() => {
          setSearchQuery('');
          setSelectedGymType('');
          setSelectedLocation('');
        }}
        style={styles.clearFiltersButton}
      >
        Clear Filters
      </Button>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Find Your Perfect Gym</Text>
        <Text style={styles.headerSubtitle}>
          Discover the best fitness centers near you 💪
        </Text>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search gyms, equipment, or specialties..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            icon="search"
            clearIcon="close"
          />
          <IconButton
            icon="tune"
            size={24}
            onPress={() => setShowFilters(!showFilters)}
            style={[styles.filterButton, showFilters && styles.activeFilterButton]}
          />
        </View>

        {/* Filters */}
        {showFilters && (
          <View style={styles.filtersContainer}>
            <Text style={styles.filterTitle}>Location Filter</Text>
            <Searchbar
              placeholder="Enter location..."
              onChangeText={setSelectedLocation}
              value={selectedLocation}
              style={styles.locationSearch}
              icon="location-on"
            />
          </View>
        )}

        {/* Gym Categories */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Choose Your Training Style</Text>
          <FlatList
            data={gymCategories}
            renderItem={renderGymCategory}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Results Count */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {filteredGyms.length} gyms found
          </Text>
          {(selectedGymType || searchQuery || selectedLocation) && (
            <TouchableOpacity
              onPress={() => {
                setSelectedGymType('');
                setSearchQuery('');
                setSelectedLocation('');
              }}
            >
              <Text style={styles.clearAll}>Clear all</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Gym List */}
        {filteredGyms.length > 0 ? (
          <FlatList
            data={filteredGyms}
            renderItem={renderGymCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.gymsList}
          />
        ) : (
          renderEmptyState()
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => Alert.alert('List Your Gym', 'Register your gym feature coming soon!')}
        label="List Your Gym"
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
    paddingHorizontal: SPACING.md,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  filterButton: {
    marginLeft: SPACING.xs,
    backgroundColor: '#FFFFFF',
  },
  activeFilterButton: {
    backgroundColor: COLORS.primary,
  },
  filtersContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  filterTitle: {
    ...TEXT_STYLES.subtitle,
    marginBottom: SPACING.xs,
    color: COLORS.textPrimary,
  },
  locationSearch: {
    backgroundColor: '#FFFFFF',
    elevation: 1,
  },
  categoriesSection: {
    paddingVertical: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    color: COLORS.textPrimary,
  },
  categoriesList: {
    paddingHorizontal: SPACING.md,
  },
  categoryCard: {
    marginRight: SPACING.sm,
  },
  categoryCardSurface: {
    padding: SPACING.sm,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    minWidth: 80,
  },
  selectedCategory: {
    backgroundColor: COLORS.primary + '20',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  categoryName: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    color: COLORS.textPrimary,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  resultsCount: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
  },
  clearAll: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    fontWeight: '600',
  },
  gymsList: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 100,
  },
  gymCard: {
    marginBottom: SPACING.md,
    backgroundColor: '#FFFFFF',
    elevation: 3,
  },
  gymImage: {
    height: 150,
  },
  gymContent: {
    padding: SPACING.md,
  },
  gymHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  gymTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  gymName: {
    ...TEXT_STYLES.h4,
    color: COLORS.textPrimary,
    marginRight: SPACING.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    ...TEXT_STYLES.body,
    marginLeft: 4,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  location: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  distance: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  description: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
    flexWrap: 'wrap',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
    marginBottom: SPACING.xs,
  },
  statText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  specialtiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  specialtyChip: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
    backgroundColor: COLORS.success + '20',
  },
  specialtyText: {
    fontSize: 10,
    color: COLORS.success,
  },
  moreSpecialties: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  facilitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  facilityChip: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
    backgroundColor: COLORS.primary + '20',
  },
  facilityText: {
    fontSize: 10,
    color: COLORS.primary,
  },
  moreFacilities: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  gymActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  priceContainer: {
    flex: 1,
  },
  price: {
    ...TEXT_STYLES.h4,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  trialButton: {
    marginRight: SPACING.xs,
  },
  joinButton: {
    backgroundColor: COLORS.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
    paddingHorizontal: SPACING.md,
  },
  emptyTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  clearFiltersButton: {
    borderColor: COLORS.primary,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default GymSearch;