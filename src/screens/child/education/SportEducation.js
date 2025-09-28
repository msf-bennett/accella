import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  Animated,
  TouchableOpacity,
  FlatList,
  Modal,
  Dimensions,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Portal,
  Searchbar,
  ProgressBar,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';
import { useSelector, useDispatch } from 'react-redux';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const SportsEducation = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('Nearby');
  const [showFilters, setShowFilters] = useState(false);
  const [academies, setAcademies] = useState([]);
  const [featuredPrograms, setFeaturedPrograms] = useState([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Mock data for sports academies
  const mockAcademies = [
    {
      id: 1,
      name: 'Elite Football Academy',
      sport: 'Football',
      location: 'Westlands, Nairobi',
      distance: '2.3 km',
      rating: 4.8,
      reviews: 156,
      priceRange: 'KSh 8,000 - 15,000/month',
      image: 'https://example.com/academy1.jpg',
      features: ['Professional Coaches', 'Modern Facilities', 'Age Groups 6-18'],
      description: 'Premier football training academy with FIFA-certified coaches',
      contact: '+254 701 234 567',
      ageGroups: ['6-8 years', '9-12 years', '13-16 years', '17-18 years'],
      programs: ['Basic Skills', 'Advanced Training', 'Competition Team'],
    },
    {
      id: 2,
      name: 'Nairobi Swimming Club',
      sport: 'Swimming',
      location: 'Karen, Nairobi',
      distance: '5.1 km',
      rating: 4.7,
      reviews: 203,
      priceRange: 'KSh 6,000 - 12,000/month',
      image: 'https://example.com/academy2.jpg',
      features: ['Olympic Pool', 'Certified Instructors', 'All Levels'],
      description: 'Professional swimming instruction for all skill levels',
      contact: '+254 702 345 678',
      ageGroups: ['4-6 years', '7-10 years', '11-14 years', '15+ years'],
      programs: ['Learn to Swim', 'Stroke Development', 'Competitive Swimming'],
    },
    {
      id: 3,
      name: 'Basketball Kenya Academy',
      sport: 'Basketball',
      location: 'Kilimani, Nairobi',
      distance: '3.7 km',
      rating: 4.6,
      reviews: 89,
      priceRange: 'KSh 5,000 - 10,000/month',
      image: 'https://example.com/academy3.jpg',
      features: ['Indoor Courts', 'Youth Programs', 'Skill Development'],
      description: 'Develop basketball skills with experienced coaches',
      contact: '+254 703 456 789',
      ageGroups: ['8-10 years', '11-13 years', '14-16 years', '17+ years'],
      programs: ['Fundamentals', 'Team Play', 'Elite Development'],
    },
  ];

  const sportsOptions = ['All', 'Football', 'Swimming', 'Basketball', 'Tennis', 'Athletics', 'Rugby', 'Volleyball'];
  const locationOptions = ['Nearby', 'Nairobi CBD', 'Westlands', 'Karen', 'Kilimani', 'Parklands', 'Langata'];

  useEffect(() => {
    initializeScreen();
  }, []);

  const initializeScreen = useCallback(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setAcademies(mockAcademies);
      setFeaturedPrograms(mockAcademies.slice(0, 2));
      setLoading(false);
      
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
    }, 1000);
  }, [fadeAnim, slideAnim]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('Updated', 'Academy listings refreshed successfully! 🎯');
    }, 1500);
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.length > 2) {
      const filtered = mockAcademies.filter(academy =>
        academy.name.toLowerCase().includes(query.toLowerCase()) ||
        academy.sport.toLowerCase().includes(query.toLowerCase()) ||
        academy.location.toLowerCase().includes(query.toLowerCase())
      );
      setAcademies(filtered);
    } else {
      setAcademies(mockAcademies);
    }
  };

  const handleAcademyPress = (academy) => {
    Alert.alert(
      '🏆 Academy Details',
      `Navigate to ${academy.name} details screen?\n\nFeatures: ${academy.features.join(', ')}\n\nContact: ${academy.contact}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'View Details', onPress: () => console.log('Navigate to academy details') }
      ]
    );
  };

  const handleBookTrial = (academy) => {
    Alert.alert(
      '📅 Book Trial Session',
      `Book a trial session at ${academy.name}?\n\nThis feature will connect you with the academy to schedule a trial class.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Book Now', onPress: () => console.log('Navigate to booking flow') }
      ]
    );
  };

  const renderAcademyCard = ({ item }) => (
    <Animated.View style={[styles.cardContainer, { opacity: fadeAnim }]}>
      <Card style={styles.academyCard} elevation={3}>
        <TouchableOpacity onPress={() => handleAcademyPress(item)}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.cardHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.academyHeader}>
              <View style={styles.academyInfo}>
                <Text style={styles.academyName}>{item.name}</Text>
                <Text style={styles.academySport}>{item.sport}</Text>
              </View>
              <View style={styles.ratingContainer}>
                <Icon name="star" size={16} color="#FFD700" />
                <Text style={styles.rating}>{item.rating}</Text>
                <Text style={styles.reviews}>({item.reviews})</Text>
              </View>
            </View>
          </LinearGradient>
          
          <Card.Content style={styles.cardContent}>
            <View style={styles.locationRow}>
              <Icon name="location-on" size={16} color={COLORS.primary} />
              <Text style={styles.location}>{item.location}</Text>
              <Text style={styles.distance}>• {item.distance}</Text>
            </View>
            
            <Text style={styles.description}>{item.description}</Text>
            
            <View style={styles.featuresContainer}>
              {item.features.map((feature, index) => (
                <Chip
                  key={index}
                  mode="outlined"
                  compact
                  style={styles.featureChip}
                  textStyle={styles.chipText}
                >
                  {feature}
                </Chip>
              ))}
            </View>
            
            <View style={styles.priceRow}>
              <Icon name="payments" size={18} color={COLORS.success} />
              <Text style={styles.price}>{item.priceRange}</Text>
            </View>
            
            <View style={styles.actionButtons}>
              <Button
                mode="outlined"
                style={styles.callButton}
                onPress={() => Alert.alert('📞 Call Academy', `Calling ${item.contact}`)}
                icon="phone"
              >
                Call
              </Button>
              <Button
                mode="contained"
                style={styles.trialButton}
                onPress={() => handleBookTrial(item)}
                buttonColor={COLORS.primary}
                icon="calendar-today"
              >
                Book Trial
              </Button>
            </View>
          </Card.Content>
        </TouchableOpacity>
      </Card>
    </Animated.View>
  );

  const renderFeaturedProgram = ({ item }) => (
    <Surface style={styles.featuredCard} elevation={2}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.featuredGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.featuredTitle}>{item.name}</Text>
        <Text style={styles.featuredSport}>⭐ {item.sport} Program</Text>
        <Text style={styles.featuredLocation}>📍 {item.location}</Text>
        <Button
          mode="contained"
          style={styles.featuredButton}
          buttonColor="rgba(255,255,255,0.2)"
          textColor="white"
          onPress={() => handleAcademyPress(item)}
        >
          Learn More
        </Button>
      </LinearGradient>
    </Surface>
  );

  const FilterModal = () => (
    <Modal
      visible={showFilters}
      transparent
      animationType="slide"
      onRequestClose={() => setShowFilters(false)}
    >
      <BlurView style={styles.blurContainer} blurType="light" blurAmount={10}>
        <View style={styles.modalContainer}>
          <Surface style={styles.filterModal} elevation={5}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Academies 🎯</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setShowFilters(false)}
              />
            </View>
            
            <ScrollView style={styles.filterContent}>
              <Text style={styles.filterSectionTitle}>Sport</Text>
              <View style={styles.chipContainer}>
                {sportsOptions.map((sport) => (
                  <Chip
                    key={sport}
                    selected={selectedSport === sport}
                    onPress={() => setSelectedSport(sport)}
                    style={[
                      styles.filterChip,
                      selectedSport === sport && styles.selectedChip
                    ]}
                  >
                    {sport}
                  </Chip>
                ))}
              </View>
              
              <Text style={styles.filterSectionTitle}>Location</Text>
              <View style={styles.chipContainer}>
                {locationOptions.map((location) => (
                  <Chip
                    key={location}
                    selected={selectedLocation === location}
                    onPress={() => setSelectedLocation(location)}
                    style={[
                      styles.filterChip,
                      selectedLocation === location && styles.selectedChip
                    ]}
                  >
                    {location}
                  </Chip>
                ))}
              </View>
            </ScrollView>
            
            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => {
                  setSelectedSport('All');
                  setSelectedLocation('Nearby');
                }}
                style={styles.clearButton}
              >
                Clear All
              </Button>
              <Button
                mode="contained"
                onPress={() => setShowFilters(false)}
                buttonColor={COLORS.primary}
                style={styles.applyButton}
              >
                Apply Filters
              </Button>
            </View>
          </Surface>
        </View>
      </BlurView>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.loadingGradient}>
          <Icon name="school" size={60} color="white" />
          <Text style={styles.loadingTitle}>Finding Sports Academies</Text>
          <Text style={styles.loadingSubtitle}>Discovering the best programs for your child 🏆</Text>
          <ProgressBar
            indeterminate
            color="white"
            style={styles.loadingProgress}
          />
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerTitle}>Sports Education 🏆</Text>
        <Text style={styles.headerSubtitle}>Find the perfect academy for your child</Text>
        
        <Searchbar
          placeholder="Search academies, sports, locations..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor={COLORS.primary}
        />
        
        <View style={styles.quickFilters}>
          <Chip
            selected={selectedSport !== 'All'}
            onPress={() => setShowFilters(true)}
            icon="tune"
            style={styles.filterChip}
          >
            {selectedSport}
          </Chip>
          <Chip
            selected={selectedLocation !== 'Nearby'}
            onPress={() => setShowFilters(true)}
            icon="location-on"
            style={styles.filterChip}
          >
            {selectedLocation}
          </Chip>
        </View>
      </LinearGradient>

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
        <Animated.View
          style={[
            styles.animatedContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Featured Programs */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⭐ Featured Programs</Text>
            <FlatList
              data={featuredPrograms}
              renderItem={renderFeaturedProgram}
              keyExtractor={(item) => `featured-${item.id}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredList}
            />
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions 🚀</Text>
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity
                style={styles.quickAction}
                onPress={() => Alert.alert('🎯 Feature Coming Soon', 'Compare academies side by side!')}
              >
                <Icon name="compare-arrows" size={30} color={COLORS.primary} />
                <Text style={styles.quickActionText}>Compare</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickAction}
                onPress={() => Alert.alert('💰 Feature Coming Soon', 'Calculate training costs and budgets!')}
              >
                <Icon name="calculate" size={30} color={COLORS.success} />
                <Text style={styles.quickActionText}>Calculator</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickAction}
                onPress={() => Alert.alert('📅 Feature Coming Soon', 'Schedule visits to academies!')}
              >
                <Icon name="event" size={30} color={COLORS.secondary} />
                <Text style={styles.quickActionText}>Schedule</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickAction}
                onPress={() => Alert.alert('⭐ Feature Coming Soon', 'View saved favorite academies!')}
              >
                <Icon name="favorite" size={30} color={COLORS.error} />
                <Text style={styles.quickActionText}>Favorites</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Academy Listings */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🏫 Sports Academies</Text>
              <Text style={styles.resultsCount}>{academies.length} found</Text>
            </View>
            
            <FlatList
              data={academies}
              renderItem={renderAcademyCard}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              contentContainerStyle={styles.academyList}
            />
          </View>
        </Animated.View>
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="filter-list"
        onPress={() => setShowFilters(true)}
        color="white"
      />

      <FilterModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  loadingTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  loadingSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.9)',
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  loadingProgress: {
    marginTop: SPACING.xl,
    width: 200,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: 'white',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: SPACING.lg,
  },
  searchBar: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    marginBottom: SPACING.md,
    borderRadius: 12,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  quickFilters: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  filterChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  content: {
    flex: 1,
  },
  animatedContent: {
    flex: 1,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  resultsCount: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  featuredList: {
    paddingLeft: SPACING.lg,
  },
  featuredCard: {
    width: 280,
    height: 180,
    marginRight: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
  },
  featuredGradient: {
    flex: 1,
    padding: SPACING.lg,
    justifyContent: 'space-between',
  },
  featuredTitle: {
    ...TEXT_STYLES.h3,
    color: 'white',
  },
  featuredSport: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.9)',
    marginTop: SPACING.xs,
  },
  featuredLocation: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
    marginTop: SPACING.xs,
  },
  featuredButton: {
    alignSelf: 'flex-start',
    marginTop: SPACING.sm,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  quickAction: {
    flex: 1,
    minWidth: (width - SPACING.lg * 2 - SPACING.md) / 2,
    backgroundColor: 'white',
    padding: SPACING.lg,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 2,
  },
  quickActionText: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
    fontWeight: '600',
  },
  academyList: {
    paddingHorizontal: SPACING.lg,
  },
  cardContainer: {
    marginBottom: SPACING.lg,
  },
  academyCard: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  cardHeader: {
    padding: SPACING.lg,
  },
  academyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  academyInfo: {
    flex: 1,
  },
  academyName: {
    ...TEXT_STYLES.h3,
    color: 'white',
    marginBottom: SPACING.xs,
  },
  academySport: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.9)',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  rating: {
    ...TEXT_STYLES.caption,
    color: 'white',
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  reviews: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: SPACING.xs,
  },
  cardContent: {
    padding: SPACING.lg,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  location: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    marginLeft: SPACING.xs,
    flex: 1,
  },
  distance: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  description: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  featureChip: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
  },
  chipText: {
    fontSize: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  price: {
    ...TEXT_STYLES.body,
    color: COLORS.success,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  callButton: {
    flex: 1,
    borderColor: COLORS.primary,
  },
  trialButton: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  blurContainer: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  filterModal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
  },
  filterContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  filterSectionTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  selectedChip: {
    backgroundColor: COLORS.primary,
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  clearButton: {
    flex: 1,
    borderColor: COLORS.textSecondary,
  },
  applyButton: {
    flex: 1,
  },
});

export default SportsEducation;