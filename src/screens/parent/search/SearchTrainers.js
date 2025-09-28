import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  Modal,
  Alert,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../../styles/colors';

const { width, height } = Dimensions.get('window');

const SearchTrainers = ({ navigation, route }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [trainers, setTrainers] = useState([]);
  const [filteredTrainers, setFilteredTrainers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

  // Filter options
  const sports = [
    'Football', 'Basketball', 'Tennis', 'Swimming', 'Athletics',
    'Volleyball', 'Baseball', 'Soccer', 'Hockey', 'Gymnastics',
    'Martial Arts', 'Boxing', 'Cycling', 'Golf', 'Rugby'
  ];

  const locations = [
    'Nairobi CBD', 'Westlands', 'Karen', 'Kilimani', 'Lavington',
    'Kileleshwa', 'Parklands', 'Kasarani', 'Embakasi', 'Ruaraka'
  ];

  // Mock data for trainers
  const mockTrainers = [
    {
      id: '1',
      name: 'John Kamau',
      sport: 'Football',
      specialization: ['Youth Development', 'Technical Skills'],
      rating: 4.8,
      reviews: 142,
      experience: '8 years',
      location: 'Westlands',
      distance: '2.3 km',
      hourlyRate: 800,
      sessionRate: 1500,
      availability: 'Available',
      avatar: 'https://via.placeholder.com/100x100',
      verified: true,
      languages: ['English', 'Swahili'],
      age: 32,
      certifications: ['CAF License C', 'Youth Coaching Certificate'],
      bio: 'Experienced football coach specializing in youth development and technical skills training.',
      successStories: 15,
      nextAvailable: '2025-08-14',
    },
    {
      id: '2',
      name: 'Sarah Wanjiku',
      sport: 'Tennis',
      specialization: ['Beginner Training', 'Tournament Prep'],
      rating: 4.9,
      reviews: 89,
      experience: '6 years',
      location: 'Karen',
      distance: '5.1 km',
      hourlyRate: 1200,
      sessionRate: 2000,
      availability: 'Available',
      avatar: 'https://via.placeholder.com/100x100',
      verified: true,
      languages: ['English'],
      age: 28,
      certifications: ['PTR Certified', 'First Aid Certified'],
      bio: 'Professional tennis instructor with focus on developing young talents.',
      successStories: 23,
      nextAvailable: '2025-08-15',
    },
    {
      id: '3',
      name: 'Mike Ochieng',
      sport: 'Swimming',
      specialization: ['Stroke Technique', 'Competitive Swimming'],
      rating: 4.7,
      reviews: 67,
      experience: '10 years',
      location: 'Kilimani',
      distance: '3.7 km',
      hourlyRate: 1000,
      sessionRate: 1800,
      availability: 'Busy',
      avatar: 'https://via.placeholder.com/100x100',
      verified: true,
      languages: ['English', 'Swahili'],
      age: 35,
      certifications: ['Level 2 Swimming Coach', 'Water Safety Instructor'],
      bio: 'Former competitive swimmer turned coach, specializing in technique and competitive training.',
      successStories: 31,
      nextAvailable: '2025-08-18',
    }
  ];

  useEffect(() => {
    loadTrainers();
  }, []);

  useEffect(() => {
    filterTrainers();
  }, [searchQuery, selectedSport, selectedLocation, selectedRating, priceRange]);

  const loadTrainers = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTrainers(mockTrainers);
      setFilteredTrainers(mockTrainers);
    } catch (error) {
      Alert.alert('Error', 'Failed to load trainers');
    } finally {
      setIsLoading(false);
    }
  };

  const filterTrainers = useCallback(() => {
    let filtered = trainers.filter(trainer => {
      const matchesSearch = trainer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           trainer.sport.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           trainer.specialization.some(spec => 
                             spec.toLowerCase().includes(searchQuery.toLowerCase())
                           );
      
      const matchesSport = !selectedSport || trainer.sport === selectedSport;
      const matchesLocation = !selectedLocation || trainer.location === selectedLocation;
      const matchesRating = trainer.rating >= selectedRating;
      const matchesPrice = trainer.hourlyRate >= priceRange[0] && trainer.hourlyRate <= priceRange[1];

      return matchesSearch && matchesSport && matchesLocation && matchesRating && matchesPrice;
    });

    setFilteredTrainers(filtered);
  }, [trainers, searchQuery, selectedSport, selectedLocation, selectedRating, priceRange]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadTrainers().then(() => setRefreshing(false));
  }, []);

  const toggleFavorite = (trainerId) => {
    setFavorites(prev => 
      prev.includes(trainerId) 
        ? prev.filter(id => id !== trainerId)
        : [...prev, trainerId]
    );
  };

  const clearFilters = () => {
    setSelectedSport('');
    setSelectedLocation('');
    setPriceRange([0, 1000]);
    setSelectedRating(0);
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
    
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Icon key={`empty-${i}`} name="star-outline" size={14} color="#FFD700" />);
    }

    return stars;
  };

  const renderTrainerCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.trainerCard}
      onPress={() => navigation.navigate('TrainerProfile', { trainer: item })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
          {item.verified && (
            <View style={styles.verifiedBadge}>
              <Icon name="checkmark-circle" size={16} color="#4CAF50" />
            </View>
          )}
        </View>
        
        <View style={styles.trainerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.trainerName}>{item.name}</Text>
            <TouchableOpacity 
              onPress={() => toggleFavorite(item.id)}
              style={styles.favoriteBtn}
            >
              <Icon 
                name={favorites.includes(item.id) ? "heart" : "heart-outline"} 
                size={20} 
                color={favorites.includes(item.id) ? "#FF6B6B" : "#666"} 
              />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.sport}>{item.sport}</Text>
          <Text style={styles.specialization}>
            {item.specialization.join(' • ')}
          </Text>
          
          <View style={styles.ratingRow}>
            <View style={styles.stars}>
              {renderStars(item.rating)}
            </View>
            <Text style={styles.ratingText}>
              {item.rating} ({item.reviews} reviews)
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.detailRow}>
          <Icon name="location-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{item.location} • {item.distance}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Icon name="time-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{item.experience} experience</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Icon name="trophy-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{item.successStories} success stories</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>From</Text>
          <Text style={styles.price}>KSh {item.hourlyRate}/hr</Text>
        </View>
        
        <View style={styles.availabilityContainer}>
          <View style={[
            styles.availabilityDot, 
            { backgroundColor: item.availability === 'Available' ? '#4CAF50' : '#FF9800' }
          ]} />
          <Text style={[
            styles.availabilityText,
            { color: item.availability === 'Available' ? '#4CAF50' : '#FF9800' }
          ]}>
            {item.availability}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.bookBtn}
          onPress={() => navigation.navigate('BookSession', { trainer: item })}
        >
          <Text style={styles.bookBtnText}>Book</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const FilterModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.filterModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filters</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.filterContent}>
            {/* Sport Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Sport</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipContainer}>
                  {sports.map(sport => (
                    <TouchableOpacity
                      key={sport}
                      style={[
                        styles.chip,
                        selectedSport === sport && styles.chipSelected
                      ]}
                      onPress={() => setSelectedSport(
                        selectedSport === sport ? '' : sport
                      )}
                    >
                      <Text style={[
                        styles.chipText,
                        selectedSport === sport && styles.chipTextSelected
                      ]}>
                        {sport}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Location Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Location</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipContainer}>
                  {locations.map(location => (
                    <TouchableOpacity
                      key={location}
                      style={[
                        styles.chip,
                        selectedLocation === location && styles.chipSelected
                      ]}
                      onPress={() => setSelectedLocation(
                        selectedLocation === location ? '' : location
                      )}
                    >
                      <Text style={[
                        styles.chipText,
                        selectedLocation === location && styles.chipTextSelected
                      ]}>
                        {location}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Rating Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Minimum Rating</Text>
              <View style={styles.ratingFilter}>
                {[4, 4.5, 4.8].map(rating => (
                  <TouchableOpacity
                    key={rating}
                    style={[
                      styles.ratingChip,
                      selectedRating === rating && styles.chipSelected
                    ]}
                    onPress={() => setSelectedRating(
                      selectedRating === rating ? 0 : rating
                    )}
                  >
                    <View style={styles.ratingChipContent}>
                      <Icon name="star" size={14} color="#FFD700" />
                      <Text style={[
                        styles.chipText,
                        selectedRating === rating && styles.chipTextSelected
                      ]}>
                        {rating}+
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.clearBtn}
              onPress={clearFilters}
            >
              <Text style={styles.clearBtnText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.applyBtn}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.applyBtnText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Find Trainers</Text>
        <TouchableOpacity 
          onPress={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
          style={styles.viewModeBtn}
        >
          <Icon 
            name={viewMode === 'list' ? 'grid-outline' : 'list-outline'} 
            size={24} 
            color="#333" 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search trainers, sports, or specialization..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#666"
          />
        </View>
        
        <TouchableOpacity 
          style={styles.filterBtn}
          onPress={() => setShowFilters(true)}
        >
          <Icon name="options-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Quick Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.quickFilters}
      >
        <TouchableOpacity style={styles.quickFilter}>
          <Icon name="location" size={16} color={COLORS.primary} />
          <Text style={styles.quickFilterText}>Nearby</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickFilter}>
          <Icon name="star" size={16} color={COLORS.primary} />
          <Text style={styles.quickFilterText}>Top Rated</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickFilter}>
          <Icon name="time" size={16} color={COLORS.primary} />
          <Text style={styles.quickFilterText}>Available Now</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickFilter}>
          <Icon name="pricetag" size={16} color={COLORS.primary} />
          <Text style={styles.quickFilterText}>Budget Friendly</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Results */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredTrainers.length} trainers found
        </Text>
        <TouchableOpacity style={styles.sortBtn}>
          <Text style={styles.sortText}>Sort by</Text>
          <Icon name="chevron-down" size={16} color="#666" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Finding trainers...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTrainers}
          renderItem={renderTrainerCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.trainersList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="search" size={64} color="#ccc" />
              <Text style={styles.emptyTitle}>No trainers found</Text>
              <Text style={styles.emptyText}>
                Try adjusting your search criteria or filters
              </Text>
            </View>
          }
        />
      )}

      <FilterModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backBtn: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  viewModeBtn: {
    padding: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 16,
    color: '#333',
  },
  filterBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickFilters: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  quickFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  quickFilterText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortText: {
    fontSize: 14,
    color: '#666',
    marginRight: 5,
  },
  trainersList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  trainerCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 2,
  },
  trainerInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  trainerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  favoriteBtn: {
    padding: 5,
  },
  sport: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '500',
    marginBottom: 3,
  },
  specialization: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
  },
  cardBody: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 15,
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  availabilityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  availabilityText: {
    fontSize: 14,
    fontWeight: '500',
  },
  bookBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bookBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 15,
    marginBottom: 5,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  filterModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  filterContent: {
    paddingHorizontal: 20,
  },
  filterSection: {
    marginVertical: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  chipContainer: {
    flexDirection: 'row',
  },
  chip: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#fff',
  },
  ratingFilter: {
    flexDirection: 'row',
  },
  ratingChip: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  ratingChipContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  clearBtn: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 10,
  },
  clearBtnText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  applyBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyBtnText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});

export default SearchTrainers;
