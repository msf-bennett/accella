import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import {FAB} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

const SearchAcademies = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('');
  const [location, setLocation] = useState('');
  const [academies, setAcademies] = useState([]);
  const [filteredAcademies, setFilteredAcademies] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [selectedRating, setSelectedRating] = useState(0);
  const [loading, setLoading] = useState(false);

  const sports = [
    'Football', 'Basketball', 'Tennis', 'Swimming', 'Athletics',
    'Volleyball', 'Baseball', 'Soccer', 'Gymnastics', 'Martial Arts'
  ];

  // Mock data - replace with actual API call
  const mockAcademies = [
    {
      id: 1,
      name: 'Elite Sports Academy',
      sport: 'Football',
      location: 'Downtown District',
      rating: 4.8,
      reviews: 127,
      price: 150,
      currency: 'USD',
      distance: '2.3 km',
      image: 'academy1.jpg',
      features: ['Professional Coaches', 'Modern Equipment', 'Indoor Courts'],
      trialAvailable: true,
      description: 'Professional football training with experienced coaches'
    },
    {
      id: 2,
      name: 'Champions Basketball Hub',
      sport: 'Basketball',
      location: 'North Side',
      rating: 4.6,
      reviews: 89,
      price: 120,
      currency: 'USD',
      distance: '3.1 km',
      image: 'academy2.jpg',
      features: ['NBA Standards', 'Youth Programs', 'Competition Teams'],
      trialAvailable: true,
      description: 'Basketball excellence for all skill levels'
    },
    {
      id: 3,
      name: 'AquaTech Swimming Center',
      sport: 'Swimming',
      location: 'City Center',
      rating: 4.9,
      reviews: 203,
      price: 200,
      currency: 'USD',
      distance: '1.8 km',
      image: 'academy3.jpg',
      features: ['Olympic Pool', 'Certified Instructors', 'All Ages'],
      trialAvailable: false,
      description: 'Premier swimming facility with Olympic-standard pool'
    }
  ];

  useEffect(() => {
    setAcademies(mockAcademies);
    setFilteredAcademies(mockAcademies);
  }, []);

  useEffect(() => {
    filterAcademies();
  }, [searchQuery, selectedSport, location, priceRange, selectedRating]);

  const filterAcademies = () => {
    let filtered = academies.filter(academy => {
      const matchesSearch = academy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           academy.sport.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSport = !selectedSport || academy.sport === selectedSport;
      const matchesLocation = !location || academy.location.toLowerCase().includes(location.toLowerCase());
      const matchesPrice = academy.price >= priceRange.min && academy.price <= priceRange.max;
      const matchesRating = !selectedRating || academy.rating >= selectedRating;

      return matchesSearch && matchesSport && matchesLocation && matchesPrice && matchesRating;
    });

    setFilteredAcademies(filtered);
  };

  const handleBookTrial = (academy) => {
    if (!academy.trialAvailable) {
      Alert.alert('Trial Not Available', 'This academy does not offer trial sessions.');
      return;
    }

    Alert.alert(
      'Book Trial Session',
      `Would you like to book a trial session at ${academy.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Book Now',
          onPress: () => {
            // Navigate to booking screen or handle booking logic
            Alert.alert('Success', 'Trial session booking request sent!');
          }
        }
      ]
    );
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Ionicons
        key={index}
        name={index < Math.floor(rating) ? 'star' : 'star-outline'}
        size={16}
        color="#FFD700"
      />
    ));
  };

  const renderAcademyCard = ({ item }) => (
    <TouchableOpacity
      style={styles.academyCard}
      onPress={() => navigation.navigate('AcademyDetails', { academy: item })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.academyInfo}>
          <Text style={styles.academyName}>{item.name}</Text>
          <Text style={styles.sportType}>{item.sport}</Text>
          <Text style={styles.location}>
            <Ionicons name="location-outline" size={14} color="#666" />
            {item.location} • {item.distance}
          </Text>
        </View>
        <View style={styles.ratingContainer}>
          <View style={styles.stars}>{renderStars(item.rating)}</View>
          <Text style={styles.rating}>{item.rating} ({item.reviews})</Text>
        </View>
      </View>

      <Text style={styles.description}>{item.description}</Text>

      <View style={styles.features}>
        {item.features.slice(0, 2).map((feature, index) => (
          <View key={index} style={styles.featureTag}>
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>{item.currency} {item.price}</Text>
          <Text style={styles.priceUnit}>/month</Text>
        </View>
        <View style={styles.actionButtons}>
          {item.trialAvailable && (
            <TouchableOpacity
              style={styles.trialButton}
              onPress={() => handleBookTrial(item)}
            >
              <Text style={styles.trialButtonText}>Free Trial</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.viewButton}>
            <Text style={styles.viewButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const FilterModal = () => (
    <Modal visible={showFilters} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.filterModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filters</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filterContent}>
            {/* Sport Filter */}
            <Text style={styles.filterLabel}>Sport</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.sportFilters}>
                <TouchableOpacity
                  style={[styles.sportFilter, !selectedSport && styles.activeSportFilter]}
                  onPress={() => setSelectedSport('')}
                >
                  <Text style={[styles.sportFilterText, !selectedSport && styles.activeSportFilterText]}>
                    All Sports
                  </Text>
                </TouchableOpacity>
                {sports.map(sport => (
                  <TouchableOpacity
                    key={sport}
                    style={[styles.sportFilter, selectedSport === sport && styles.activeSportFilter]}
                    onPress={() => setSelectedSport(sport)}
                  >
                    <Text style={[styles.sportFilterText, selectedSport === sport && styles.activeSportFilterText]}>
                      {sport}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Price Range */}
            <Text style={styles.filterLabel}>Price Range (USD/month)</Text>
            <View style={styles.priceRangeContainer}>
              <TextInput
                style={styles.priceInput}
                placeholder="Min"
                value={priceRange.min.toString()}
                onChangeText={(text) => setPriceRange({...priceRange, min: parseInt(text) || 0})}
                keyboardType="numeric"
              />
              <Text style={styles.priceSeparator}>-</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="Max"
                value={priceRange.max.toString()}
                onChangeText={(text) => setPriceRange({...priceRange, max: parseInt(text) || 1000})}
                keyboardType="numeric"
              />
            </View>

            {/* Rating Filter */}
            <Text style={styles.filterLabel}>Minimum Rating</Text>
            <View style={styles.ratingFilters}>
              {[0, 3, 4, 4.5].map(rating => (
                <TouchableOpacity
                  key={rating}
                  style={[styles.ratingFilter, selectedRating === rating && styles.activeRatingFilter]}
                  onPress={() => setSelectedRating(rating)}
                >
                  <Text style={styles.ratingFilterText}>
                    {rating === 0 ? 'Any' : `${rating}+ Stars`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                setSelectedSport('');
                setPriceRange({ min: 0, max: 1000 });
                setSelectedRating(0);
              }}
            >
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>

          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search academies or sports..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="options" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Location Search */}
      <View style={styles.locationBar}>
        <Ionicons name="location" size={16} color="#666" />
        <TextInput
          style={styles.locationInput}
          placeholder="Enter location..."
          value={location}
          onChangeText={setLocation}
        />
      </View>

      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>
          {filteredAcademies.length} academies found
        </Text>
        <TouchableOpacity style={styles.sortButton}>
          <Text style={styles.sortText}>Sort by Rating</Text>
          <Ionicons name="chevron-down" size={16} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Academy List */}
      <FlatList
        data={filteredAcademies}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderAcademyCard}
        contentContainerStyle={styles.academyList}
        showsVerticalScrollIndicator={false}
      />

      <FAB
        icon="location"
              style={styles.fab}
              color="white"
              onPress={() => navigation.navigate('NearbyAcademies')}
            />

      <FilterModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchHeader: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
    paddingHorizontal: 12,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  filterButton: {
    padding: 8,
  },
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  locationInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  resultsText: {
    fontSize: 14,
    color: '#666',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortText: {
    fontSize: 14,
    color: '#666',
    marginRight: 4,
  },
  academyList: {
    padding: 16,
  },
  academyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  academyInfo: {
    flex: 1,
  },
  academyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  sportType: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 4,
  },
  location: {
    fontSize: 12,
    color: '#666',
  },
  ratingContainer: {
    alignItems: 'flex-end',
  },
  stars: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  rating: {
    fontSize: 12,
    color: '#666',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  featureTag: {
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  featureText: {
    fontSize: 11,
    color: '#007AFF',
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  priceUnit: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  trialButton: {
    backgroundColor: '#00C853',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  trialButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  viewButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  filterModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#667eea',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  filterContent: {
    padding: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  sportFilters: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  sportFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  activeSportFilter: {
    backgroundColor: '#007AFF',
  },
  sportFilterText: {
    fontSize: 14,
    color: '#666',
  },
  activeSportFilterText: {
    color: '#fff',
  },
  priceRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  priceSeparator: {
    marginHorizontal: 12,
    fontSize: 16,
    color: '#666',
  },
  ratingFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  ratingFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    marginBottom: 8,
  },
  activeRatingFilter: {
    backgroundColor: '#007AFF',
  },
  ratingFilterText: {
    fontSize: 14,
    color: '#666',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  clearButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#666',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 8,
    marginLeft: 8,
  },
  applyButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});

export default SearchAcademies;