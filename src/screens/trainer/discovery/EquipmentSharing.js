import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Animated,
  StatusBar,
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
  Searchbar,
  ProgressBar,
  Text,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f8f9fa',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textSecondary },
  small: { fontSize: 12, color: COLORS.textSecondary },
};

const { width } = Dimensions.get('window');

const EquipmentSharing = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  // Mock data for equipment sharing
  const [equipmentData, setEquipmentData] = useState([
    {
      id: 1,
      type: 'share',
      title: 'Olympic Barbell Set',
      description: '45lb Olympic barbell with 300lbs of plates',
      owner: 'Mike Johnson',
      ownerAvatar: 'MJ',
      location: '2.3 km away',
      price: 'Free',
      availability: 'Available Now',
      rating: 4.8,
      category: 'Strength',
      condition: 'Excellent',
      images: 1,
      likes: 12,
      trusted: true,
    },
    {
      id: 2,
      type: 'rent',
      title: 'Resistance Bands Set',
      description: 'Complete resistance training kit with handles',
      owner: 'Sarah Chen',
      ownerAvatar: 'SC',
      location: '1.8 km away',
      price: '$5/day',
      availability: 'Next week',
      rating: 4.9,
      category: 'Flexibility',
      condition: 'Like New',
      images: 3,
      likes: 8,
      verified: true,
    },
    {
      id: 3,
      type: 'borrow',
      title: 'Kettlebell Collection',
      description: 'Various weights from 15-50lbs',
      owner: 'Fit Zone Gym',
      ownerAvatar: 'FZ',
      location: '3.1 km away',
      price: '$15/week',
      availability: 'Book in advance',
      rating: 4.6,
      category: 'Functional',
      condition: 'Good',
      images: 2,
      likes: 20,
      business: true,
    },
    {
      id: 4,
      type: 'share',
      title: 'Battle Ropes',
      description: '40ft heavy training ropes',
      owner: 'CrossFit Central',
      ownerAvatar: 'CC',
      location: '4.2 km away',
      price: 'Trade',
      availability: 'Weekends only',
      rating: 4.7,
      category: 'Cardio',
      condition: 'Good',
      images: 1,
      likes: 15,
      business: true,
    },
  ]);

  const [myListings, setMyListings] = useState([
    {
      id: 5,
      title: 'Adjustable Dumbbells',
      description: 'PowerBlocks adjustable up to 90lbs each',
      category: 'Strength',
      price: '$10/day',
      requests: 3,
      views: 24,
      status: 'Active',
    },
  ]);

  const filters = [
    { key: 'all', label: 'All Equipment', icon: 'fitness-center' },
    { key: 'strength', label: 'Strength', icon: 'fitness-center' },
    { key: 'cardio', label: 'Cardio', icon: 'directions-run' },
    { key: 'functional', label: 'Functional', icon: 'sports-gymnastics' },
    { key: 'flexibility', label: 'Flexibility', icon: 'self-improvement' },
  ];

  // Animation effects
  useEffect(() => {
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

    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, [fadeAnim, slideAnim]);

  // Handlers
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('✅ Equipment Updated', 'Latest equipment listings loaded!');
    }, 1500);
  }, []);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  const handleFilterSelect = useCallback((filter) => {
    setSelectedFilter(filter);
  }, []);

  const handleEquipmentPress = (equipment) => {
    Alert.alert(
      '🏋️ Equipment Details',
      `View details for ${equipment.title}?\n\nThis will open the detailed equipment view with photos, availability calendar, and booking options.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'View Details', onPress: () => console.log('Navigate to equipment details') }
      ]
    );
  };

  const handleContactOwner = (equipment) => {
    Alert.alert(
      '💬 Contact Owner',
      `Send a message to ${equipment.owner}?\n\nYou can discuss availability, pricing, and pickup/delivery options.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send Message', onPress: () => console.log('Open chat') }
      ]
    );
  };

  const handleBookEquipment = (equipment) => {
    Alert.alert(
      '📅 Book Equipment',
      `Book ${equipment.title}?\n\nThis will open the booking calendar to select dates and confirm your reservation.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Book Now', onPress: () => console.log('Open booking flow') }
      ]
    );
  };

  const handleAddListing = () => {
    Alert.alert(
      '➕ Add Equipment Listing',
      'Create a new equipment listing?\n\nYou can share your equipment for free, rent it out, or offer it for trade with other trainers.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Create Listing', onPress: () => console.log('Navigate to add listing') }
      ]
    );
  };

  // Filtered equipment
  const filteredEquipment = equipmentData.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || 
                         item.category.toLowerCase() === selectedFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  // Render equipment card
  const renderEquipmentCard = (equipment) => {
    const getTypeColor = (type) => {
      switch (type) {
        case 'share': return COLORS.success;
        case 'rent': return COLORS.primary;
        case 'borrow': return COLORS.warning;
        default: return COLORS.textSecondary;
      }
    };

    const getTypeLabel = (type) => {
      switch (type) {
        case 'share': return 'Free Share';
        case 'rent': return 'For Rent';
        case 'borrow': return 'Borrow';
        default: return type;
      }
    };

    return (
      <Card key={equipment.id} style={styles.equipmentCard}>
        <TouchableOpacity
          onPress={() => handleEquipmentPress(equipment)}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <View style={styles.ownerInfo}>
              <Avatar.Text
                size={40}
                label={equipment.ownerAvatar}
                style={{
                  backgroundColor: equipment.business ? COLORS.primary : COLORS.secondary
                }}
              />
              <View style={styles.ownerDetails}>
                <Text style={styles.ownerName}>{equipment.owner}</Text>
                <View style={styles.locationRow}>
                  <Icon name="location-on" size={14} color={COLORS.textSecondary} />
                  <Text style={styles.locationText}>{equipment.location}</Text>
                  {equipment.trusted && (
                    <Icon name="verified" size={16} color={COLORS.success} style={styles.verifiedIcon} />
                  )}
                  {equipment.business && (
                    <Icon name="business" size={16} color={COLORS.primary} style={styles.businessIcon} />
                  )}
                </View>
              </View>
            </View>
            <Chip
              style={[styles.typeChip, { backgroundColor: getTypeColor(equipment.type) + '20' }]}
              textStyle={{ color: getTypeColor(equipment.type), fontSize: 12 }}
            >
              {getTypeLabel(equipment.type)}
            </Chip>
          </View>

          <View style={styles.cardContent}>
            <Text style={styles.equipmentTitle}>{equipment.title}</Text>
            <Text style={styles.equipmentDescription}>{equipment.description}</Text>

            <View style={styles.equipmentMeta}>
              <View style={styles.metaRow}>
                <Icon name="category" size={16} color={COLORS.textSecondary} />
                <Text style={styles.metaText}>{equipment.category}</Text>
                <Text style={styles.metaDot}>•</Text>
                <Text style={styles.metaText}>{equipment.condition}</Text>
              </View>
              <View style={styles.metaRow}>
                <Icon name="schedule" size={16} color={COLORS.textSecondary} />
                <Text style={styles.metaText}>{equipment.availability}</Text>
              </View>
            </View>

            <View style={styles.cardFooter}>
              <View style={styles.priceRow}>
                <Text style={styles.price}>{equipment.price}</Text>
                <View style={styles.ratingRow}>
                  <Icon name="star" size={16} color={COLORS.warning} />
                  <Text style={styles.rating}>{equipment.rating}</Text>
                </View>
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.likeButton}
                  onPress={() => console.log('Toggle like')}
                >
                  <Icon name="favorite-border" size={20} color={COLORS.error} />
                  <Text style={styles.likeCount}>{equipment.likes}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleContactOwner(equipment)}
                >
                  <Icon name="message" size={18} color={COLORS.primary} />
                  <Text style={styles.actionText}>Message</Text>
                </TouchableOpacity>

                <Button
                  mode="contained"
                  onPress={() => handleBookEquipment(equipment)}
                  style={styles.bookButton}
                  labelStyle={styles.bookButtonText}
                >
                  Book
                </Button>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Card>
    );
  };

  // Render my listing card
  const renderMyListingCard = (listing) => (
    <Card key={listing.id} style={styles.myListingCard}>
      <View style={styles.listingHeader}>
        <Text style={styles.listingTitle}>{listing.title}</Text>
        <Chip
          style={[
            styles.statusChip,
            { backgroundColor: listing.status === 'Active' ? COLORS.success + '20' : COLORS.textSecondary + '20' }
          ]}
          textStyle={{
            color: listing.status === 'Active' ? COLORS.success : COLORS.textSecondary,
            fontSize: 11
          }}
        >
          {listing.status}
        </Chip>
      </View>
      
      <Text style={styles.listingDescription}>{listing.description}</Text>
      
      <View style={styles.listingStats}>
        <View style={styles.statItem}>
          <Icon name="visibility" size={16} color={COLORS.primary} />
          <Text style={styles.statText}>{listing.views} views</Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="notifications" size={16} color={COLORS.warning} />
          <Text style={styles.statText}>{listing.requests} requests</Text>
        </View>
        <Text style={styles.listingPrice}>{listing.price}</Text>
      </View>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.loadingGradient}>
          <Icon name="fitness-center" size={60} color="white" />
          <Text style={styles.loadingText}>Loading Equipment...</Text>
          <ProgressBar indeterminate color="white" style={styles.loadingProgress} />
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Equipment Sharing</Text>
            <Text style={styles.headerSubtitle}>Share, rent, or borrow equipment with other trainers 🏋️</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => console.log('Open equipment management')}
          >
            <Icon name="inventory" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search equipment..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchbar}
          iconColor={COLORS.primary}
          inputStyle={styles.searchInput}
        />
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            onPress={() => handleFilterSelect(filter.key)}
          >
            <Chip
              selected={selectedFilter === filter.key}
              onPress={() => handleFilterSelect(filter.key)}
              style={[
                styles.filterChip,
                selectedFilter === filter.key && styles.selectedFilterChip
              ]}
              textStyle={[
                styles.filterChipText,
                selectedFilter === filter.key && styles.selectedFilterChipText
              ]}
              icon={filter.icon}
            >
              {filter.label}
            </Chip>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <ScrollView
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
          {/* My Listings Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Equipment Listings</Text>
              <TouchableOpacity onPress={() => console.log('View all my listings')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollContent}
            >
              {myListings.map(renderMyListingCard)}
            </ScrollView>
          </View>

          {/* Available Equipment */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Available Equipment ({filteredEquipment.length})
            </Text>
            
            {filteredEquipment.length === 0 ? (
              <Surface style={styles.emptyState}>
                <Icon name="search-off" size={60} color={COLORS.textSecondary} />
                <Text style={styles.emptyStateTitle}>No Equipment Found</Text>
                <Text style={styles.emptyStateSubtitle}>
                  Try adjusting your search or filters
                </Text>
              </Surface>
            ) : (
              filteredEquipment.map(renderEquipmentCard)
            )}
          </View>
        </ScrollView>
      </Animated.View>

      {/* Floating Action Button */}
      <FAB
        style={styles.fab}
        icon="add"
        label="Add Listing"
        onPress={handleAddListing}
        color="white"
      />
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
  },
  loadingText: {
    ...TEXT_STYLES.h3,
    color: 'white',
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  loadingProgress: {
    width: width * 0.6,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  header: {
    paddingTop: 60,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
  },
  profileButton: {
    padding: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },
  searchContainer: {
    paddingHorizontal: SPACING.md,
    marginTop: -SPACING.md,
    zIndex: 1,
  },
  searchbar: {
    backgroundColor: 'white',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  filtersContainer: {
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  filtersContent: {
    paddingHorizontal: SPACING.md,
  },
  filterChip: {
    marginRight: SPACING.sm,
    backgroundColor: 'white',
  },
  selectedFilterChip: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    color: COLORS.textSecondary,
  },
  selectedFilterChipText: {
    color: 'white',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  seeAllText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: '600',
  },
  horizontalScrollContent: {
    paddingHorizontal: SPACING.md,
  },
  myListingCard: {
    width: 200,
    marginRight: SPACING.md,
    padding: SPACING.md,
  },
  listingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  listingTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    flex: 1,
    marginRight: SPACING.sm,
  },
  statusChip: {
    height: 24,
  },
  listingDescription: {
    ...TEXT_STYLES.caption,
    marginBottom: SPACING.md,
  },
  listingStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    ...TEXT_STYLES.small,
    marginLeft: SPACING.xs,
  },
  listingPrice: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.primary,
  },
  equipmentCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  ownerDetails: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  ownerName: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    ...TEXT_STYLES.small,
    marginLeft: 2,
  },
  verifiedIcon: {
    marginLeft: SPACING.xs,
  },
  businessIcon: {
    marginLeft: SPACING.xs,
  },
  typeChip: {
    height: 28,
  },
  cardContent: {
    paddingHorizontal: SPACING.md,
  },
  equipmentTitle: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.xs,
  },
  equipmentDescription: {
    ...TEXT_STYLES.caption,
    marginBottom: SPACING.md,
  },
  equipmentMeta: {
    marginBottom: SPACING.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  metaText: {
    ...TEXT_STYLES.small,
    marginLeft: SPACING.xs,
  },
  metaDot: {
    ...TEXT_STYLES.small,
    marginHorizontal: SPACING.xs,
  },
  cardFooter: {
    paddingBottom: SPACING.md,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  price: {
    ...TEXT_STYLES.h3,
    color: COLORS.primary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  likeCount: {
    ...TEXT_STYLES.small,
    marginLeft: SPACING.xs,
    color: COLORS.error,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.primary + '20',
    borderRadius: 8,
  },
  actionText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  bookButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  bookButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
    marginHorizontal: SPACING.md,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  emptyStateTitle: {
    ...TEXT_STYLES.h3,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptyStateSubtitle: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default EquipmentSharing;