import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  Alert,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Animated,
} from 'react-native';
import {
  Card,
  Searchbar,
  Button,
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
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const LocationBasedSearch = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { searchResults, isLoading, error } = useSelector((state) => state.discovery);

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('Current Location');
  const [sortBy, setSortBy] = useState('distance');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;

  // Filter categories
  const filterCategories = [
    { id: 'sport', label: '🏀 Sport', options: ['Football', 'Basketball', 'Tennis', 'Swimming', 'Boxing', 'Yoga', 'CrossFit'] },
    { id: 'type', label: '👨‍🏫 Type', options: ['Personal Trainer', 'Coach', 'Sports Academy', 'Gym', 'Studio'] },
    { id: 'experience', label: '⭐ Experience', options: ['Beginner Friendly', '1-3 Years', '3-5 Years', '5+ Years', 'Elite Level'] },
    { id: 'price', label: '💰 Price Range', options: ['$-$$', '$$-$$$', '$$$-$$$$', '$$$$+'] },
    { id: 'rating', label: '⭐ Rating', options: ['4.5+ Stars', '4.0+ Stars', '3.5+ Stars', 'Any Rating'] },
    { id: 'availability', label: '📅 Availability', options: ['Available Now', 'This Week', 'Flexible Schedule', 'Weekends Only'] },
  ];

  // Mock search results data
  const mockResults = [
    {
      id: '1',
      name: 'Mike Johnson',
      type: 'Personal Trainer',
      sport: 'CrossFit',
      rating: 4.8,
      reviews: 127,
      distance: '0.5 mi',
      price: '$45/session',
      image: 'https://via.placeholder.com/60',
      verified: true,
      availability: 'Available Today',
      specialties: ['Strength Training', 'Weight Loss', 'HIIT'],
      location: 'FitLife Gym, Downtown',
    },
    {
      id: '2',
      name: 'Sarah Williams',
      type: 'Yoga Instructor',
      sport: 'Yoga',
      rating: 4.9,
      reviews: 89,
      distance: '0.8 mi',
      price: '$35/session',
      image: 'https://via.placeholder.com/60',
      verified: true,
      availability: 'Available Tomorrow',
      specialties: ['Hatha Yoga', 'Meditation', 'Flexibility'],
      location: 'Zen Studio, Westside',
    },
    {
      id: '3',
      name: 'Elite Basketball Academy',
      type: 'Sports Academy',
      sport: 'Basketball',
      rating: 4.7,
      reviews: 234,
      distance: '1.2 mi',
      price: '$60/session',
      image: 'https://via.placeholder.com/60',
      verified: true,
      availability: 'Group Classes Available',
      specialties: ['Youth Training', 'Skill Development', 'Team Coaching'],
      location: 'Sports Complex, Northside',
    },
  ];

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

    // Load initial search results
    handleSearch();
  }, []);

  const handleSearch = useCallback(async () => {
    try {
      // Simulate API call
      // dispatch(searchProviders({ query: searchQuery, location: selectedLocation, filters: selectedFilters }));
      
      // Mock implementation
      setTimeout(() => {
        console.log('Search completed');
      }, 1000);
    } catch (error) {
      Alert.alert('Search Error', 'Failed to load search results. Please try again.');
    }
  }, [searchQuery, selectedLocation, selectedFilters]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await handleSearch();
    setRefreshing(false);
  }, [handleSearch]);

  const toggleFilter = (filterId, option) => {
    const filterKey = `${filterId}-${option}`;
    setSelectedFilters(prev => 
      prev.includes(filterKey) 
        ? prev.filter(f => f !== filterKey)
        : [...prev, filterKey]
    );
  };

  const clearAllFilters = () => {
    setSelectedFilters([]);
  };

  const renderSearchHeader = () => (
    <Animated.View 
      style={{ 
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }]
      }}
    >
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{
          paddingTop: StatusBar.currentHeight + SPACING.lg,
          paddingHorizontal: SPACING.md,
          paddingBottom: SPACING.md,
          borderBottomLeftRadius: 25,
          borderBottomRightRadius: 25,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
          <IconButton
            icon="arrow-back"
            iconColor={COLORS.white}
            size={24}
            onPress={() => navigation.goBack()}
          />
          <Text style={[TEXT_STYLES.h2, { color: COLORS.white, flex: 1, textAlign: 'center' }]}>
            Find Trainers Near You 🎯
          </Text>
          <IconButton
            icon={viewMode === 'list' ? 'map' : 'view-list'}
            iconColor={COLORS.white}
            size={24}
            onPress={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
          />
        </View>

        {/* Location Selector */}
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: 12,
            padding: SPACING.sm,
            marginBottom: SPACING.md,
          }}
          onPress={() => Alert.alert('Location', 'Location selection feature coming soon!')}
        >
          <Icon name="location-on" size={20} color={COLORS.white} />
          <Text style={[TEXT_STYLES.body, { color: COLORS.white, marginLeft: SPACING.xs, flex: 1 }]}>
            {selectedLocation}
          </Text>
          <Icon name="expand-more" size={20} color={COLORS.white} />
        </TouchableOpacity>

        {/* Search Bar */}
        <Searchbar
          placeholder="Search trainers, gyms, sports..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          style={{
            backgroundColor: COLORS.white,
            borderRadius: 15,
            elevation: 0,
          }}
          inputStyle={TEXT_STYLES.body}
          iconColor={COLORS.primary}
        />
      </LinearGradient>
    </Animated.View>
  );

  const renderQuickFilters = () => (
    <View style={{ paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Chip
            icon="filter-list"
            mode="outlined"
            onPress={() => setShowFilters(true)}
            style={{ 
              marginRight: SPACING.sm,
              backgroundColor: selectedFilters.length > 0 ? COLORS.primary : COLORS.white 
            }}
            textStyle={{ 
              color: selectedFilters.length > 0 ? COLORS.white : COLORS.primary 
            }}
          >
            Filters {selectedFilters.length > 0 && `(${selectedFilters.length})`}
          </Chip>
          
          {['Available Now', 'Nearby', 'Top Rated', '4.5+ Stars', 'Under $50'].map((filter) => (
            <Chip
              key={filter}
              mode={selectedFilters.includes(`quick-${filter}`) ? 'flat' : 'outlined'}
              onPress={() => toggleFilter('quick', filter)}
              style={{ 
                marginRight: SPACING.sm,
                backgroundColor: selectedFilters.includes(`quick-${filter}`) ? COLORS.primary : COLORS.white 
              }}
              textStyle={{ 
                color: selectedFilters.includes(`quick-${filter}`) ? COLORS.white : COLORS.text 
              }}
            >
              {filter}
            </Chip>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const renderResultCard = ({ item, index }) => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{
          translateX: new Animated.Value(width).interpolate({
            inputRange: [0, 1],
            outputRange: [width, 0],
          })
        }],
        marginHorizontal: SPACING.md,
        marginBottom: SPACING.md,
      }}
    >
      <Card style={{ borderRadius: 15, elevation: 3 }}>
        <TouchableOpacity
          onPress={() => navigation.navigate('TrainerProfile', { trainerId: item.id })}
          activeOpacity={0.7}
        >
          <Card.Content style={{ padding: SPACING.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <Avatar.Image
                source={{ uri: item.image }}
                size={60}
                style={{ marginRight: SPACING.md }}
              />
              
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs }}>
                  <Text style={[TEXT_STYLES.h3, { flex: 1 }]}>{item.name}</Text>
                  {item.verified && (
                    <Icon name="verified" size={20} color={COLORS.primary} />
                  )}
                </View>
                
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginBottom: SPACING.xs }]}>
                  {item.type} • {item.sport}
                </Text>
                
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs }}>
                  <Icon name="star" size={16} color="#FFD700" />
                  <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs, color: COLORS.text }]}>
                    {item.rating} ({item.reviews} reviews)
                  </Text>
                  <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.md, color: COLORS.textSecondary }]}>
                    • {item.distance}
                  </Text>
                </View>
                
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginBottom: SPACING.xs }]}>
                  📍 {item.location}
                </Text>
                
                {/* Specialties */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.sm }}>
                  {item.specialties.slice(0, 2).map((specialty) => (
                    <View
                      key={specialty}
                      style={{
                        backgroundColor: COLORS.primaryLight,
                        borderRadius: 8,
                        paddingHorizontal: SPACING.xs,
                        paddingVertical: 2,
                        marginRight: SPACING.xs,
                        marginBottom: SPACING.xs,
                      }}
                    >
                      <Text style={[TEXT_STYLES.caption, { color: COLORS.primary, fontSize: 10 }]}>
                        {specialty}
                      </Text>
                    </View>
                  ))}
                </View>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <Text style={[TEXT_STYLES.h4, { color: COLORS.primary }]}>{item.price}</Text>
                    <Text style={[TEXT_STYLES.caption, { color: COLORS.success }]}>{item.availability}</Text>
                  </View>
                  
                  <View style={{ flexDirection: 'row' }}>
                    <IconButton
                      icon="message"
                      size={20}
                      iconColor={COLORS.primary}
                      onPress={() => Alert.alert('Message', `Send message to ${item.name}`)}
                      style={{ marginRight: SPACING.xs }}
                    />
                    <Button
                      mode="contained"
                      onPress={() => Alert.alert('Book Session', `Book session with ${item.name}`)}
                      style={{ borderRadius: 8 }}
                      contentStyle={{ paddingHorizontal: SPACING.sm }}
                      compact
                    >
                      Book
                    </Button>
                  </View>
                </View>
              </View>
            </View>
          </Card.Content>
        </TouchableOpacity>
      </Card>
    </Animated.View>
  );

  const renderFilterModal = () => (
    <Portal>
      <Modal
        visible={showFilters}
        onDismiss={() => setShowFilters(false)}
        contentContainerStyle={{
          backgroundColor: COLORS.white,
          margin: SPACING.lg,
          borderRadius: 20,
          maxHeight: '80%',
        }}
      >
        <View style={{ padding: SPACING.lg }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg }}>
            <Text style={TEXT_STYLES.h2}>Filter Results 🔍</Text>
            <IconButton
              icon="close"
              size={24}
              onPress={() => setShowFilters(false)}
            />
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            {filterCategories.map((category) => (
              <View key={category.id} style={{ marginBottom: SPACING.lg }}>
                <Text style={[TEXT_STYLES.h4, { marginBottom: SPACING.sm }]}>{category.label}</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {category.options.map((option) => (
                    <Chip
                      key={option}
                      mode={selectedFilters.includes(`${category.id}-${option}`) ? 'flat' : 'outlined'}
                      onPress={() => toggleFilter(category.id, option)}
                      style={{
                        margin: 4,
                        backgroundColor: selectedFilters.includes(`${category.id}-${option}`) 
                          ? COLORS.primary 
                          : COLORS.white
                      }}
                      textStyle={{
                        color: selectedFilters.includes(`${category.id}-${option}`) 
                          ? COLORS.white 
                          : COLORS.text
                      }}
                    >
                      {option}
                    </Chip>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.lg }}>
            <Button
              mode="outlined"
              onPress={clearAllFilters}
              style={{ flex: 0.45 }}
            >
              Clear All
            </Button>
            <Button
              mode="contained"
              onPress={() => {
                setShowFilters(false);
                handleSearch();
              }}
              style={{ flex: 0.45 }}
            >
              Apply Filters
            </Button>
          </View>
        </View>
      </Modal>
    </Portal>
  );

  const renderEmptyState = () => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: SPACING.xl }}>
      <Icon name="search-off" size={80} color={COLORS.textSecondary} />
      <Text style={[TEXT_STYLES.h3, { textAlign: 'center', marginVertical: SPACING.lg }]}>
        No trainers found 🔍
      </Text>
      <Text style={[TEXT_STYLES.body, { textAlign: 'center', color: COLORS.textSecondary, marginBottom: SPACING.lg }]}>
        Try adjusting your search criteria or expanding your location radius
      </Text>
      <Button
        mode="contained"
        onPress={() => {
          setSearchQuery('');
          setSelectedFilters([]);
          handleSearch();
        }}
        style={{ borderRadius: 12 }}
      >
        Clear Filters & Search Again
      </Button>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {renderSearchHeader()}
      {renderQuickFilters()}
      
      {/* Results Count & Sort */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
      }}>
        <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary }]}>
          {mockResults.length} trainers found
        </Text>
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center' }}
          onPress={() => Alert.alert('Sort', 'Sort options coming soon!')}
        >
          <Text style={[TEXT_STYLES.caption, { color: COLORS.primary, marginRight: SPACING.xs }]}>
            Sort by: Distance
          </Text>
          <Icon name="sort" size={16} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Results List */}
      <FlatList
        data={mockResults}
        renderItem={renderResultCard}
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
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={{ 
          flexGrow: 1,
          paddingBottom: SPACING.xl 
        }}
      />

      {/* Filter Modal */}
      {renderFilterModal()}

      {/* Floating Action Button */}
      <FAB
        icon="map"
        style={{
          position: 'absolute',
          margin: SPACING.lg,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.primary,
        }}
        onPress={() => Alert.alert('Map View', 'Map view feature coming soon!')}
      />
    </View>
  );
};

export default LocationBasedSearch;