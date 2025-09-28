import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
  Modal,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../../styles/colors';

const { width, height } = Dimensions.get('window');

// Mock data for coaches
const mockCoaches = [
  {
    id: '1',
    name: 'Sarah Johnson',
    sport: 'Football',
    specialization: 'Youth Development',
    rating: 4.8,
    reviews: 127,
    experience: '8 years',
    location: 'Westlands, Nairobi',
    distance: '2.5 km',
    price: 3500,
    priceType: 'per session',
    image: 'https://images.unsplash.com/photo-1494790108755-2616c9d22b8d?w=200',
    verified: true,
    languages: ['English', 'Swahili'],
    availability: 'Available',
    description: 'Certified youth football coach with FIFA Level 2 certification. Specializes in technical skills development and team tactics.',
    certifications: ['FIFA Level 2', 'CAF C License', 'First Aid Certified'],
    ageGroups: ['6-12 years', '13-17 years'],
    trainingStyle: 'Technical Focus',
  },
  {
    id: '2',
    name: 'Michael Ochieng',
    sport: 'Basketball',
    specialization: 'Elite Performance',
    rating: 4.9,
    reviews: 89,
    experience: '12 years',
    location: 'Karen, Nairobi',
    distance: '5.2 km',
    price: 4500,
    priceType: 'per session',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    verified: true,
    languages: ['English'],
    availability: 'Busy',
    description: 'Former professional basketball player turned coach. Focuses on elite performance training and college preparation.',
    certifications: ['FIBA Level 3', 'Strength & Conditioning', 'Mental Performance'],
    ageGroups: ['14-18 years', '18+ years'],
    trainingStyle: 'Performance Oriented',
  },
  {
    id: '3',
    name: 'Grace Wanjiku',
    sport: 'Swimming',
    specialization: 'Beginner Friendly',
    rating: 4.7,
    reviews: 156,
    experience: '6 years',
    location: 'Kileleshwa, Nairobi',
    distance: '3.1 km',
    price: 2800,
    priceType: 'per session',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
    verified: true,
    languages: ['English', 'Swahili', 'French'],
    availability: 'Available',
    description: 'Patient and experienced swimming instructor. Great with beginners and fear of water issues.',
    certifications: ['Swimming Teachers Association', 'Water Safety Instructor', 'CPR Certified'],
    ageGroups: ['4-8 years', '9-15 years'],
    trainingStyle: 'Patient & Supportive',
  },
  {
    id: '4',
    name: 'David Kiprop',
    sport: 'Athletics',
    specialization: 'Track & Field',
    rating: 4.6,
    reviews: 73,
    experience: '10 years',
    location: 'Kasarani, Nairobi',
    distance: '8.7 km',
    price: 3000,
    priceType: 'per session',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    verified: false,
    languages: ['English', 'Swahili'],
    availability: 'Available',
    description: 'Former national athletics team member. Specializes in sprints, middle distance, and field events.',
    certifications: ['World Athletics Level 2', 'IAAF Coaching Certification'],
    ageGroups: ['10-16 years', '17+ years'],
    trainingStyle: 'Competitive Focus',
  },
];

const sports = ['All Sports', 'Football', 'Basketball', 'Swimming', 'Athletics', 'Tennis', 'Volleyball', 'Rugby'];
const ageGroups = ['All Ages', '4-8 years', '6-12 years', '9-15 years', '13-17 years', '14-18 years', '18+ years'];
const specializations = ['All', 'Youth Development', 'Elite Performance', 'Beginner Friendly', 'Track & Field', 'Technical Focus'];
const priceRanges = ['All Prices', 'Under KSh 2,000', 'KSh 2,000 - 3,500', 'KSh 3,500 - 5,000', 'Above KSh 5,000'];

const SearchCoaches = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCoaches, setFilteredCoaches] = useState(mockCoaches);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [showCoachDetails, setShowCoachDetails] = useState(false);
  
  // Filter states
  const [selectedSport, setSelectedSport] = useState('All Sports');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('All Ages');
  const [selectedSpecialization, setSelectedSpecialization] = useState('All');
  const [selectedPriceRange, setSelectedPriceRange] = useState('All Prices');
  const [minRating, setMinRating] = useState(0);
  const [maxDistance, setMaxDistance] = useState(50);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedSport, selectedAgeGroup, selectedSpecialization, selectedPriceRange, minRating, maxDistance, verifiedOnly, availableOnly]);

  const applyFilters = () => {
    let filtered = mockCoaches.filter(coach => {
      const matchesSearch = coach.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          coach.sport.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          coach.specialization.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSport = selectedSport === 'All Sports' || coach.sport === selectedSport;
      const matchesAgeGroup = selectedAgeGroup === 'All Ages' || coach.ageGroups.includes(selectedAgeGroup);
      const matchesSpecialization = selectedSpecialization === 'All' || coach.specialization === selectedSpecialization;
      const matchesRating = coach.rating >= minRating;
      const matchesDistance = parseFloat(coach.distance) <= maxDistance;
      const matchesVerified = !verifiedOnly || coach.verified;
      const matchesAvailable = !availableOnly || coach.availability === 'Available';
      
      let matchesPrice = true;
      if (selectedPriceRange !== 'All Prices') {
        const price = coach.price;
        switch (selectedPriceRange) {
          case 'Under KSh 2,000':
            matchesPrice = price < 2000;
            break;
          case 'KSh 2,000 - 3,500':
            matchesPrice = price >= 2000 && price <= 3500;
            break;
          case 'KSh 3,500 - 5,000':
            matchesPrice = price > 3500 && price <= 5000;
            break;
          case 'Above KSh 5,000':
            matchesPrice = price > 5000;
            break;
        }
      }

      return matchesSearch && matchesSport && matchesAgeGroup && matchesSpecialization && 
             matchesPrice && matchesRating && matchesDistance && matchesVerified && matchesAvailable;
    });

    setFilteredCoaches(filtered);
  };

  const clearFilters = () => {
    setSelectedSport('All Sports');
    setSelectedAgeGroup('All Ages');
    setSelectedSpecialization('All');
    setSelectedPriceRange('All Prices');
    setMinRating(0);
    setMaxDistance(50);
    setVerifiedOnly(false);
    setAvailableOnly(false);
    setSearchQuery('');
  };

  const handleCoachPress = (coach) => {
    setSelectedCoach(coach);
    setShowCoachDetails(true);
  };

  const handleBookSession = (coach) => {
    Alert.alert(
      'Book Session',
      `Would you like to book a session with ${coach.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Book Now', 
          onPress: () => {
            // Navigate to booking screen or handle booking logic
            navigation.navigate('SessionBooking', { coach: coach });
          }
        }
      ]
    );
  };

  const handleSendMessage = (coach) => {
    navigation.navigate('CoachChat', { 
      coachId: coach.id, 
      coachName: coach.name,
      coachImage: coach.image 
    });
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Ionicons key={i} name="star" size={14} color="#FFD700" />);
    }
    
    if (hasHalfStar) {
      stars.push(<Ionicons key="half" name="star-half" size={14} color="#FFD700" />);
    }
    
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Ionicons key={`empty-${i}`} name="star-outline" size={14} color="#FFD700" />);
    }
    
    return stars;
  };

  const renderCoachCard = ({ item: coach }) => (
    <TouchableOpacity 
      style={styles.coachCard}
      onPress={() => handleCoachPress(coach)}
      activeOpacity={0.7}
    >
      <View style={styles.coachImageContainer}>
        <Image source={{ uri: coach.image }} style={styles.coachImage} />
        {coach.verified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#fff" />
          </View>
        )}
        <View style={[
          styles.availabilityIndicator,
          { backgroundColor: coach.availability === 'Available' ? COLORS.success : COLORS.warning }
        ]} />
      </View>
      
      <View style={styles.coachInfo}>
        <View style={styles.coachHeader}>
          <Text style={styles.coachName}>{coach.name}</Text>
          <View style={styles.ratingContainer}>
            <View style={styles.starsContainer}>
              {renderStars(coach.rating)}
            </View>
            <Text style={styles.ratingText}>{coach.rating}</Text>
            <Text style={styles.reviewsText}>({coach.reviews})</Text>
          </View>
        </View>
        
        <Text style={styles.sportText}>{coach.sport} • {coach.specialization}</Text>
        <Text style={styles.experienceText}>{coach.experience} experience</Text>
        
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.locationText}>{coach.location} • {coach.distance}</Text>
        </View>
        
        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>KSh {coach.price.toLocaleString()}</Text>
          <Text style={styles.priceTypeText}>/{coach.priceType}</Text>
        </View>
        
        <View style={styles.languagesContainer}>
          {coach.languages.map((lang, index) => (
            <View key={index} style={styles.languageTag}>
              <Text style={styles.languageText}>{lang}</Text>
            </View>
          ))}
        </View>
      </View>
      
      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={styles.messageButton}
          onPress={() => handleSendMessage(coach)}
        >
          <Ionicons name="chatbubble-outline" size={20} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.bookButton}
          onPress={() => handleBookSession(coach)}
        >
          <Text style={styles.bookButtonText}>Book</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const FilterModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={styles.filterModal}>
        <View style={styles.filterHeader}>
          <TouchableOpacity onPress={() => setShowFilters(false)}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.filterTitle}>Filters</Text>
          <TouchableOpacity onPress={clearFilters}>
            <Text style={styles.clearFilters}>Clear All</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.filterContent} showsVerticalScrollIndicator={false}>
          {/* Sport Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Sport</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterOptions}>
                {sports.map((sport) => (
                  <TouchableOpacity
                    key={sport}
                    style={[
                      styles.filterOption,
                      selectedSport === sport && styles.selectedFilterOption
                    ]}
                    onPress={() => setSelectedSport(sport)}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      selectedSport === sport && styles.selectedFilterOptionText
                    ]}>
                      {sport}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Age Group Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Age Group</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterOptions}>
                {ageGroups.map((ageGroup) => (
                  <TouchableOpacity
                    key={ageGroup}
                    style={[
                      styles.filterOption,
                      selectedAgeGroup === ageGroup && styles.selectedFilterOption
                    ]}
                    onPress={() => setSelectedAgeGroup(ageGroup)}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      selectedAgeGroup === ageGroup && styles.selectedFilterOptionText
                    ]}>
                      {ageGroup}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Specialization Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Specialization</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterOptions}>
                {specializations.map((specialization) => (
                  <TouchableOpacity
                    key={specialization}
                    style={[
                      styles.filterOption,
                      selectedSpecialization === specialization && styles.selectedFilterOption
                    ]}
                    onPress={() => setSelectedSpecialization(specialization)}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      selectedSpecialization === specialization && styles.selectedFilterOptionText
                    ]}>
                      {specialization}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Price Range Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Price Range</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterOptions}>
                {priceRanges.map((range) => (
                  <TouchableOpacity
                    key={range}
                    style={[
                      styles.filterOption,
                      selectedPriceRange === range && styles.selectedFilterOption
                    ]}
                    onPress={() => setSelectedPriceRange(range)}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      selectedPriceRange === range && styles.selectedFilterOptionText
                    ]}>
                      {range}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Rating Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Minimum Rating</Text>
            <View style={styles.ratingFilter}>
              {[0, 3, 4, 4.5].map((rating) => (
                <TouchableOpacity
                  key={rating}
                  style={[
                    styles.ratingOption,
                    minRating === rating && styles.selectedRatingOption
                  ]}
                  onPress={() => setMinRating(rating)}
                >
                  <View style={styles.ratingStars}>
                    {rating > 0 && renderStars(rating)}
                    {rating === 0 && <Text>Any Rating</Text>}
                  </View>
                  <Text style={styles.ratingValue}>{rating > 0 ? `${rating}+` : ''}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Additional Filters */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Additional Filters</Text>
            
            <TouchableOpacity
              style={styles.checkboxOption}
              onPress={() => setVerifiedOnly(!verifiedOnly)}
            >
              <Ionicons 
                name={verifiedOnly ? "checkbox" : "square-outline"} 
                size={20} 
                color={COLORS.primary} 
              />
              <Text style={styles.checkboxText}>Verified coaches only</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.checkboxOption}
              onPress={() => setAvailableOnly(!availableOnly)}
            >
              <Ionicons 
                name={availableOnly ? "checkbox" : "square-outline"} 
                size={20} 
                color={COLORS.primary} 
              />
              <Text style={styles.checkboxText}>Available now only</Text>
            </TouchableOpacity>
          </View>

          {/* Distance Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Maximum Distance: {maxDistance} km</Text>
            <View style={styles.distanceSlider}>
              {[5, 10, 25, 50].map((distance) => (
                <TouchableOpacity
                  key={distance}
                  style={[
                    styles.distanceOption,
                    maxDistance === distance && styles.selectedDistanceOption
                  ]}
                  onPress={() => setMaxDistance(distance)}
                >
                  <Text style={[
                    styles.distanceText,
                    maxDistance === distance && styles.selectedDistanceText
                  ]}>
                    {distance}km
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
        
        <View style={styles.filterFooter}>
          <TouchableOpacity 
            style={styles.applyFiltersButton}
            onPress={() => setShowFilters(false)}
          >
            <Text style={styles.applyFiltersText}>
              Show {filteredCoaches.length} Coaches
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const CoachDetailsModal = () => (
    <Modal
      visible={showCoachDetails}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowCoachDetails(false)}
    >
      {selectedCoach && (
        <View style={styles.coachDetailsModal}>
          <View style={styles.detailsHeader}>
            <TouchableOpacity onPress={() => setShowCoachDetails(false)}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.detailsTitle}>Coach Details</Text>
            <TouchableOpacity onPress={() => handleSendMessage(selectedCoach)}>
              <Ionicons name="chatbubble-outline" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.detailsContent}>
            <View style={styles.coachProfile}>
              <View style={styles.profileImageContainer}>
                <Image source={{ uri: selectedCoach.image }} style={styles.profileImage} />
                {selectedCoach.verified && (
                  <View style={styles.profileVerifiedBadge}>
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  </View>
                )}
              </View>
              
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{selectedCoach.name}</Text>
                <Text style={styles.profileSport}>{selectedCoach.sport} Coach</Text>
                <View style={styles.profileRating}>
                  {renderStars(selectedCoach.rating)}
                  <Text style={styles.profileRatingText}>
                    {selectedCoach.rating} ({selectedCoach.reviews} reviews)
                  </Text>
                </View>
              </View>
            </View>
            
            <Text style={styles.description}>{selectedCoach.description}</Text>
            
            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Experience & Specialization</Text>
              <View style={styles.detailRow}>
                <Ionicons name="trophy-outline" size={20} color={COLORS.primary} />
                <Text style={styles.detailText}>{selectedCoach.experience} of experience</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="fitness-outline" size={20} color={COLORS.primary} />
                <Text style={styles.detailText}>{selectedCoach.specialization}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="school-outline" size={20} color={COLORS.primary} />
                <Text style={styles.detailText}>{selectedCoach.trainingStyle}</Text>
              </View>
            </View>
            
            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Certifications</Text>
              {selectedCoach.certifications.map((cert, index) => (
                <View key={index} style={styles.certificationItem}>
                  <Ionicons name="ribbon-outline" size={16} color={COLORS.primary} />
                  <Text style={styles.certificationText}>{cert}</Text>
                </View>
              ))}
            </View>
            
            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Age Groups</Text>
              <View style={styles.ageGroupsContainer}>
                {selectedCoach.ageGroups.map((ageGroup, index) => (
                  <View key={index} style={styles.ageGroupTag}>
                    <Text style={styles.ageGroupText}>{ageGroup}</Text>
                  </View>
                ))}
              </View>
            </View>
            
            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Location & Availability</Text>
              <View style={styles.detailRow}>
                <Ionicons name="location-outline" size={20} color={COLORS.primary} />
                <Text style={styles.detailText}>{selectedCoach.location}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="time-outline" size={20} color={COLORS.primary} />
                <Text style={styles.detailText}>{selectedCoach.availability}</Text>
              </View>
            </View>
            
            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Languages</Text>
              <View style={styles.languagesDetailContainer}>
                {selectedCoach.languages.map((lang, index) => (
                  <View key={index} style={styles.languageDetailTag}>
                    <Text style={styles.languageDetailText}>{lang}</Text>
                  </View>
                ))}
              </View>
            </View>
            
            <View style={styles.priceSection}>
              <Text style={styles.sectionTitle}>Pricing</Text>
              <View style={styles.priceDetail}>
                <Text style={styles.priceAmount}>KSh {selectedCoach.price.toLocaleString()}</Text>
                <Text style={styles.priceUnit}>per {selectedCoach.priceType.replace('per ', '')}</Text>
              </View>
            </View>
          </ScrollView>
          
          <View style={styles.detailsFooter}>
            <TouchableOpacity 
              style={styles.bookSessionButton}
              onPress={() => {
                setShowCoachDetails(false);
                handleBookSession(selectedCoach);
              }}
            >
              <Text style={styles.bookSessionText}>Book Session</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search Coaches</Text>
        <TouchableOpacity onPress={() => setShowFilters(true)}>
          <Ionicons name="options-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search coaches by name, sport, or specialization"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.textSecondary}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredCoaches.length} coach{filteredCoaches.length !== 1 ? 'es' : ''} found
        </Text>
        <TouchableOpacity 
          style={styles.sortButton}
          onPress={() => {/* Handle sort */}}
        >
          <MaterialIcons name="sort" size={20} color={COLORS.primary} />
          <Text style={styles.sortText}>Sort</Text>
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Finding coaches...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredCoaches}
          renderItem={renderCoachCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.coachesList}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="person-outline" size={60} color={COLORS.textSecondary} />
              <Text style={styles.emptyTitle}>No coaches found</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your search criteria or filters
              </Text>
              <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
                <Text style={styles.clearFiltersButtonText}>Clear Filters</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
      
      <FilterModal />
      <CoachDetailsModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: COLORS.text,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  resultsCount: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortText: {
    marginLeft: 5,
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  coachesList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  separator: {
    height: 15,
  },
  coachCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  coachImageContainer: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  coachImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.lightGray,
  },
  verifiedBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  availabilityIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  coachInfo: {
    flex: 1,
    marginLeft: 15,
  },
  coachHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  coachName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 5,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginRight: 3,
  },
  reviewsText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  sportText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
    marginBottom: 3,
  },
  experienceText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 5,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  priceTypeText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  languagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  languageTag: {
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  languageText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  cardActions: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    marginRight: 10,
  },
  bookButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  bookButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
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
    color: COLORS.text,
    marginTop: 15,
    marginBottom: 5,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  clearFiltersButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  clearFiltersButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Filter Modal Styles
  filterModal: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  clearFilters: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  filterContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  filterSection: {
    marginVertical: 15,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    paddingVertical: 5,
  },
  filterOption: {
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  selectedFilterOption: {
    backgroundColor: COLORS.primary,
  },
  filterOptionText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  selectedFilterOptionText: {
    color: COLORS.white,
  },
  ratingFilter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  ratingOption: {
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  selectedRatingOption: {
    backgroundColor: COLORS.primary,
  },
  ratingStars: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  ratingValue: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  checkboxOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  checkboxText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 12,
  },
  distanceSlider: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  distanceOption: {
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
  },
  selectedDistanceOption: {
    backgroundColor: COLORS.primary,
  },
  distanceText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  selectedDistanceText: {
    color: COLORS.white,
  },
  filterFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  applyFiltersButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  applyFiltersText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Coach Details Modal Styles
  coachDetailsModal: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  detailsContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  coachProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.lightGray,
  },
  profileVerifiedBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 20,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 5,
  },
  profileSport: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '500',
    marginBottom: 8,
  },
  profileRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileRatingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  description: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: 25,
  },
  detailsSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 12,
  },
  certificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  certificationText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 8,
  },
  ageGroupsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  ageGroupTag: {
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  ageGroupText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
  },
  languagesDetailContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  languageDetailTag: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  languageDetailText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '500',
  },
  priceSection: {
    marginBottom: 30,
  },
  priceDetail: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  },
  priceUnit: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 5,
  },
  detailsFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  bookSessionButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  bookSessionText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SearchCoaches;