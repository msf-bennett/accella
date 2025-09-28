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
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { COLORS, SPACING, TEXT_STYLES } from '../styles/theme';

const { width } = Dimensions.get('window');

const EquipmentStores = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, stores, loading } = useSelector(state => ({
    user: state.auth.user,
    stores: state.stores.list,
    loading: state.stores.loading,
  }));

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [priceRange, setPriceRange] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [sortBy, setSortBy] = useState('rating'); // 'rating', 'distance', 'name'
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Mock data for equipment stores
  const [storesData, setStoresData] = useState([
    {
      id: '1',
      name: 'SportZone Kenya',
      category: 'Multi-Sport',
      location: 'Westlands, Nairobi',
      distance: '2.5 km',
      rating: 4.5,
      reviews: 342,
      phone: '+254 712 345 678',
      website: 'www.sportzone.co.ke',
      description: 'Complete sports equipment store with gear for all sports',
      image: require('../assets/store-sportzone.jpg'),
      specialties: ['Football', 'Basketball', 'Athletics', 'Swimming'],
      priceRange: 'Mid-Range',
      openHours: '8:00 AM - 8:00 PM',
      delivery: true,
      inStock: 156,
      totalProducts: 200,
      offers: ['10% Student Discount', 'Free Delivery Above KES 5,000'],
      verified: true,
      establishedYear: 2015,
    },
    {
      id: '2',
      name: 'Athletic Pro Shop',
      category: 'Athletics',
      location: 'CBD, Nairobi',
      distance: '5.2 km',
      rating: 4.8,
      reviews: 128,
      phone: '+254 722 987 654',
      website: 'www.athleticpro.co.ke',
      description: 'Specialized athletics equipment and running gear',
      specialties: ['Running Shoes', 'Track Equipment', 'Marathon Gear'],
      priceRange: 'Premium',
      openHours: '9:00 AM - 7:00 PM',
      delivery: true,
      inStock: 89,
      totalProducts: 120,
      offers: ['Runner\'s Club Discount', 'Shoe Fitting Service'],
      verified: true,
      establishedYear: 2010,
    },
    {
      id: '3',
      name: 'Football World',
      category: 'Football',
      location: 'Kasarani, Nairobi',
      distance: '8.7 km',
      rating: 4.2,
      reviews: 256,
      phone: '+254 733 456 789',
      website: 'www.footballworld.co.ke',
      description: 'Everything football - boots, jerseys, balls, and training equipment',
      specialties: ['Football Boots', 'Jerseys', 'Training Equipment', 'Goal Posts'],
      priceRange: 'Budget-Friendly',
      openHours: '8:30 AM - 9:00 PM',
      delivery: false,
      inStock: 234,
      totalProducts: 280,
      offers: ['Team Bulk Orders', 'Jersey Customization'],
      verified: true,
      establishedYear: 2018,
    },
    {
      id: '4',
      name: 'Aquatic Sports Hub',
      category: 'Swimming',
      location: 'Karen, Nairobi',
      distance: '12.1 km',
      rating: 4.6,
      reviews: 87,
      phone: '+254 744 321 987',
      website: 'www.aquaticsports.co.ke',
      description: 'Premium swimming and water sports equipment',
      specialties: ['Swimwear', 'Goggles', 'Training Equipment', 'Pool Accessories'],
      priceRange: 'Premium',
      openHours: '10:00 AM - 6:00 PM',
      delivery: true,
      inStock: 67,
      totalProducts: 85,
      offers: ['Swimming Club Partnership', 'Competitive Swimmer Discount'],
      verified: true,
      establishedYear: 2012,
    },
  ]);

  const categories = ['All', 'Multi-Sport', 'Football', 'Athletics', 'Swimming', 'Basketball', 'Tennis', 'Rugby'];
  const locations = ['All', 'Westlands', 'CBD', 'Kasarani', 'Karen', 'Kilimani', 'Parklands'];
  const priceRanges = ['All', 'Budget-Friendly', 'Mid-Range', 'Premium'];

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

    // Load stores data
    loadStores();
  }, []);

  const loadStores = useCallback(async () => {
    try {
      // Simulate API call
      // dispatch(fetchStores());
    } catch (error) {
      console.error('Error loading stores:', error);
    }
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadStores();
    setRefreshing(false);
  }, [loadStores]);

  const filteredStores = storesData.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         store.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         store.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || store.category === selectedCategory;
    const matchesLocation = selectedLocation === 'All' || store.location.includes(selectedLocation);
    const matchesPriceRange = priceRange === 'All' || store.priceRange === priceRange;
    
    return matchesSearch && matchesCategory && matchesLocation && matchesPriceRange;
  });

  // Sort filtered stores
  const sortedStores = [...filteredStores].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'distance':
        return parseFloat(a.distance) - parseFloat(b.distance);
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const toggleFavorite = useCallback((storeId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(storeId)) {
        newFavorites.delete(storeId);
      } else {
        newFavorites.add(storeId);
      }
      return newFavorites;
    });
  }, []);

  const callStore = useCallback((phone) => {
    const phoneUrl = `tel:${phone}`;
    Linking.canOpenURL(phoneUrl).then(supported => {
      if (supported) {
        Linking.openURL(phoneUrl);
      } else {
        Alert.alert('Error', 'Unable to make phone call');
      }
    });
  }, []);

  const openWebsite = useCallback((website) => {
    const url = website.startsWith('http') ? website : `https://${website}`;
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open website');
      }
    });
  }, []);

  const getDirections = useCallback((store) => {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.location)}`;
    Linking.canOpenURL(mapsUrl).then(supported => {
      if (supported) {
        Linking.openURL(mapsUrl);
      } else {
        Alert.alert('Error', 'Unable to open maps');
      }
    });
  }, []);

  const renderStoreCard = ({ item, index }) => (
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
      <Card style={styles.storeCard} elevation={4}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.cardHeader}
        >
          <View style={styles.headerContent}>
            <View style={styles.storeInfo}>
              <View style={styles.storeTitleRow}>
                <Text style={styles.storeName}>{item.name}</Text>
                {item.verified && (
                  <Icon name="verified" size={20} color="white" style={styles.verifiedIcon} />
                )}
              </View>
              <Text style={styles.storeCategory}>{item.category} • {item.priceRange}</Text>
              <View style={styles.ratingRow}>
                <Icon name="star" size={16} color="#FFD700" />
                <Text style={styles.rating}>{item.rating}</Text>
                <Text style={styles.reviews}>({item.reviews} reviews)</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => toggleFavorite(item.id)}
              style={styles.favoriteButton}
            >
              <Icon
                name={favorites.has(item.id) ? 'favorite' : 'favorite-border'}
                size={24}
                color={favorites.has(item.id) ? COLORS.error : 'white'}
              />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <Card.Content style={styles.cardContent}>
          <View style={styles.storeDetails}>
            <View style={styles.detailRow}>
              <Icon name="location-on" size={16} color={COLORS.primary} />
              <Text style={styles.detailText}>{item.location}</Text>
              <Text style={styles.distance}>• {item.distance}</Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="access-time" size={16} color={COLORS.primary} />
              <Text style={styles.detailText}>{item.openHours}</Text>
              {item.delivery && (
                <View style={styles.deliveryBadge}>
                  <Icon name="local-shipping" size={12} color="white" />
                  <Text style={styles.deliveryText}>Delivery</Text>
                </View>
              )}
            </View>
            <View style={styles.detailRow}>
              <Icon name="inventory" size={16} color={COLORS.primary} />
              <Text style={styles.detailText}>
                {item.inStock} items in stock
              </Text>
            </View>
          </View>

          <View style={styles.stockContainer}>
            <Text style={styles.stockText}>Stock Availability</Text>
            <ProgressBar
              progress={item.inStock / item.totalProducts}
              color={item.inStock > item.totalProducts * 0.7 ? COLORS.success : 
                     item.inStock > item.totalProducts * 0.4 ? '#FFA500' : COLORS.error}
              style={styles.stockBar}
            />
          </View>

          <View style={styles.specialtiesContainer}>
            <Text style={styles.specialtiesTitle}>Specialties:</Text>
            <View style={styles.specialtiesChips}>
              {item.specialties.slice(0, 3).map((specialty, specIndex) => (
                <Chip
                  key={specIndex}
                  mode="outlined"
                  compact
                  style={styles.specialtyChip}
                  textStyle={styles.specialtyText}
                >
                  {specialty}
                </Chip>
              ))}
              {item.specialties.length > 3 && (
                <Chip
                  mode="outlined"
                  compact
                  style={styles.specialtyChip}
                  textStyle={styles.specialtyText}
                >
                  +{item.specialties.length - 3} more
                </Chip>
              )}
            </View>
          </View>

          {item.offers.length > 0 && (
            <View style={styles.offersContainer}>
              <Icon name="local-offer" size={16} color={COLORS.success} />
              <Text style={styles.offerText}>{item.offers[0]}</Text>
            </View>
          )}

          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.callButton]}
              onPress={() => callStore(item.phone)}
            >
              <Icon name="phone" size={16} color="white" />
              <Text style={styles.actionButtonText}>Call</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.directionsButton]}
              onPress={() => getDirections(item)}
            >
              <Icon name="directions" size={16} color="white" />
              <Text style={styles.actionButtonText}>Directions</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.websiteButton]}
              onPress={() => openWebsite(item.website)}
            >
              <Icon name="language" size={16} color="white" />
              <Text style={styles.actionButtonText}>Website</Text>
            </TouchableOpacity>
          </View>

          <Button
            mode="contained"
            onPress={() => navigation.navigate('StoreDetails', { store: item })}
            style={styles.viewStoreButton}
            labelStyle={styles.viewStoreButtonText}
          >
            View Store & Products
          </Button>
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
            <Text style={styles.headerTitle}>Equipment Stores</Text>
            <Text style={styles.headerSubtitle}>Find sports gear near you 🏪</Text>
          </View>
          <View style={styles.headerActions}>
            <IconButton
              icon={viewMode === 'list' ? 'view-module' : 'view-list'}
              iconColor="white"
              size={20}
              onPress={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            />
            <Avatar.Image
              size={40}
              source={{ uri: user?.avatar || 'https://via.placeholder.com/40' }}
              style={styles.avatar}
            />
          </View>
        </View>

        <Searchbar
          placeholder="Search stores, equipment..."
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
              const sortOptions = ['rating', 'distance', 'name'];
              const currentIndex = sortOptions.indexOf(sortBy);
              const nextIndex = (currentIndex + 1) % sortOptions.length;
              setSortBy(sortOptions[nextIndex]);
            }}
          >
            <Icon name="sort" size={16} color="white" />
            <Text style={styles.sortText}>
              Sort: {sortBy === 'rating' ? 'Rating' : sortBy === 'distance' ? 'Distance' : 'Name'}
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
            <Text style={styles.filterSectionTitle}>Category</Text>
            {renderFilterChip(categories, selectedCategory, setSelectedCategory)}
            
            <Text style={styles.filterSectionTitle}>Location</Text>
            {renderFilterChip(locations, selectedLocation, setSelectedLocation)}
            
            <Text style={styles.filterSectionTitle}>Price Range</Text>
            {renderFilterChip(priceRanges, priceRange, setPriceRange)}
          </Animated.View>
        )}
      </LinearGradient>

      <View style={styles.statsContainer}>
        <Surface style={styles.statCard} elevation={2}>
          <Text style={styles.statNumber}>{sortedStores.length}</Text>
          <Text style={styles.statLabel}>Stores Found</Text>
        </Surface>
        <Surface style={styles.statCard} elevation={2}>
          <Text style={styles.statNumber}>{favorites.size}</Text>
          <Text style={styles.statLabel}>Favorites</Text>
        </Surface>
        <Surface style={styles.statCard} elevation={2}>
          <Text style={styles.statNumber}>
            {sortedStores.filter(s => s.delivery).length}
          </Text>
          <Text style={styles.statLabel}>With Delivery</Text>
        </Surface>
      </View>

      {sortedStores.length > 0 ? (
        <FlatList
          data={sortedStores}
          renderItem={renderStoreCard}
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
          <Icon name="store" size={80} color={COLORS.primary} />
          <Text style={styles.emptyTitle}>No stores found</Text>
          <Text style={styles.emptySubtitle}>
            Try adjusting your search or filters
          </Text>
        </View>
      )}

      <FAB
        icon="map"
        style={styles.fab}
        onPress={() => Alert.alert('Info', 'Map view coming soon!')}
        color="white"
        label="Map View"
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    borderWidth: 2,
    borderColor: 'white',
    marginLeft: SPACING.sm,
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
    flex: 1,
    marginRight: SPACING.sm,
  },
  sortText: {
    color: 'white',
    marginLeft: SPACING.sm,
    ...TEXT_STYLES.body,
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
    marginHorizontal: SPACING.sm,
    ...TEXT_STYLES.body,
  },
  filtersContainer: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterSectionTitle: {
    color: 'white',
    ...TEXT_STYLES.subtitle,
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
  },
  filterScrollView: {
    marginBottom: SPACING.sm,
  },
  filterScrollContent: {
    paddingRight: SPACING.lg,
  },
  filterChip: {
    marginRight: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  selectedFilterChip: {
    backgroundColor: 'white',
  },
  filterChipText: {
    color: 'white',
  },
  selectedFilterChipText: {
    color: COLORS.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  statCard: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 12,
    backgroundColor: 'white',
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  statNumber: {
    ...TEXT_STYLES.h2,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
  listContainer: {
    padding: SPACING.lg,
  },
  cardContainer: {
    marginBottom: SPACING.lg,
  },
  storeCard: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  cardHeader: {
    padding: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  storeInfo: {
    flex: 1,
  },
  storeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  storeName: {
    ...TEXT_STYLES.h3,
    color: 'white',
    fontWeight: 'bold',
  },
  verifiedIcon: {
    marginLeft: SPACING.sm,
  },
  storeCategory: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: SPACING.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    ...TEXT_STYLES.body,
    color: 'white',
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  reviews: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: SPACING.xs,
  },
  favoriteButton: {
    padding: SPACING.xs,
  },
  cardContent: {
    padding: SPACING.md,
  },
  storeDetails: {
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    flexWrap: 'wrap',
  },
  detailText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.sm,
    color: COLORS.text.primary,
    flex: 1,
  },
  distance: {
    ...TEXT_STYLES.caption,
    color: COLORS.text.secondary,
    marginLeft: SPACING.sm,
  },
  deliveryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    marginLeft: SPACING.sm,
  },
  deliveryText: {
    ...TEXT_STYLES.caption,
    color: 'white',
    marginLeft: SPACING.xs,
  },
  stockContainer: {
    marginBottom: SPACING.md,
  },
  stockText: {
    ...TEXT_STYLES.caption,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  stockBar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.background,
  },
  specialtiesContainer: {
    marginBottom: SPACING.md,
  },
  specialtiesTitle: {
    ...TEXT_STYLES.caption,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  specialtiesChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  specialtyChip: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
    backgroundColor: 'transparent',
  },
  specialtyText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
  },
  offersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  offerText: {
    ...TEXT_STYLES.caption,
    color: COLORS.success,
    marginLeft: SPACING.sm,
    fontWeight: '600',
  },
  description: {
    ...TEXT_STYLES.body,
    color: COLORS.text.secondary,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderRadius: 8,
    marginHorizontal: SPACING.xs,
  },
  callButton: {
    backgroundColor: COLORS.success,
  },
  directionsButton: {
    backgroundColor: '#2196F3',
  },
  websiteButton: {
    backgroundColor: '#FF9800',
  },
  actionButtonText: {
    ...TEXT_STYLES.caption,
    color: 'white',
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  viewStoreButton: {
    marginTop: SPACING.sm,
    borderRadius: 25,
  },
  viewStoreButtonText: {
    ...TEXT_STYLES.button,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.text.primary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.lg,
    backgroundColor: COLORS.primary,
  },
});

export default EquipmentStores;