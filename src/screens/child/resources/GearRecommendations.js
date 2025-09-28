import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  Animated,
  Alert,
  Dimensions,
  FlatList,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import {
  Card,
  Searchbar,
  Chip,
  Avatar,
  Surface,
  Button,
  ProgressBar,
  IconButton,
  Divider,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../../../constants/theme';

const { width } = Dimensions.get('window');

const GearRecommendations = ({ navigation }) => {
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('All');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('All');
  const [wishlistItems, setWishlistItems] = useState(new Set([1, 3, 5]));
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Redux state
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => ({
    user: state.auth.user,
    loading: state.app.loading,
  }));

  // Sports categories
  const sportsCategories = [
    { id: 'All', label: 'All Sports', icon: 'sports', emoji: '🏆' },
    { id: 'football', label: 'Football', icon: 'sports-football', emoji: '⚽' },
    { id: 'basketball', label: 'Basketball', icon: 'sports-basketball', emoji: '🏀' },
    { id: 'tennis', label: 'Tennis', icon: 'sports-tennis', emoji: '🎾' },
    { id: 'swimming', label: 'Swimming', icon: 'pool', emoji: '🏊‍♂️' },
    { id: 'running', label: 'Running', icon: 'directions-run', emoji: '🏃‍♂️' },
    { id: 'general', label: 'General Fitness', icon: 'fitness-center', emoji: '💪' },
  ];

  // Age groups
  const ageGroups = [
    { id: 'All', label: 'All Ages' },
    { id: '6-8', label: '6-8 years' },
    { id: '9-12', label: '9-12 years' },
    { id: '13-15', label: '13-15 years' },
    { id: '16-18', label: '16-18 years' },
  ];

  // Sample gear recommendations
  const gearRecommendations = [
    {
      id: 1,
      sport: 'football',
      ageGroup: '9-12',
      name: 'Youth Soccer Cleats',
      brand: 'Nike Mercurial',
      price: '$45-65',
      rating: 4.8,
      reviews: 234,
      priority: 'Essential',
      description: 'Lightweight cleats perfect for developing players with great traction.',
      features: ['Lightweight design', 'Excellent grip', 'Comfortable fit', 'Durable'],
      sizes: ['10C-6Y'],
      colors: ['Black/White', 'Blue/Orange', 'Red/Black'],
      emoji: '👟',
      category: 'Footwear',
      safetyCertified: true,
      coachRecommended: true,
    },
    {
      id: 2,
      sport: 'basketball',
      ageGroup: '13-15',
      name: 'Youth Basketball Shoes',
      brand: 'Adidas Harden',
      price: '$70-90',
      rating: 4.6,
      reviews: 156,
      priority: 'Essential',
      description: 'High-top basketball shoes with ankle support for growing players.',
      features: ['Ankle support', 'Cushioned sole', 'Breathable material', 'Court grip'],
      sizes: ['3Y-7Y'],
      colors: ['Black/Red', 'White/Blue', 'Grey/Orange'],
      emoji: '🏀',
      category: 'Footwear',
      safetyCertified: true,
      coachRecommended: true,
    },
    {
      id: 3,
      sport: 'general',
      ageGroup: '6-8',
      name: 'Fun Water Bottle',
      brand: 'Hydro Flask Kids',
      price: '$25-35',
      rating: 4.9,
      reviews: 412,
      priority: 'Essential',
      description: 'Colorful, leak-proof water bottle that keeps drinks cold for hours!',
      features: ['BPA-free', 'Leak-proof', 'Easy grip', 'Fun designs'],
      sizes: ['12oz', '16oz'],
      colors: ['Rainbow', 'Space Theme', 'Animal Print', 'Sports'],
      emoji: '💧',
      category: 'Hydration',
      safetyCertified: true,
      coachRecommended: true,
    },
    {
      id: 4,
      sport: 'tennis',
      ageGroup: '9-12',
      name: 'Junior Tennis Racket',
      brand: 'Babolat Drive Jr',
      price: '$40-60',
      rating: 4.7,
      reviews: 89,
      priority: 'Essential',
      description: 'Perfect weight and size for young tennis players learning proper technique.',
      features: ['Lightweight aluminum', 'Proper balance', 'Comfortable grip', 'Colorful design'],
      sizes: ['21"', '23"', '25"'],
      colors: ['Blue/White', 'Pink/Purple', 'Green/Yellow'],
      emoji: '🎾',
      category: 'Equipment',
      safetyCertified: true,
      coachRecommended: false,
    },
    {
      id: 5,
      sport: 'swimming',
      ageGroup: '6-8',
      name: 'Swimming Goggles',
      brand: 'Speedo Vanquisher',
      price: '$15-25',
      rating: 4.5,
      reviews: 178,
      priority: 'Essential',
      description: 'Comfortable, leak-free goggles that make swimming more fun and safe.',
      features: ['Anti-fog coating', 'UV protection', 'Adjustable strap', 'Soft gaskets'],
      sizes: ['Youth Small', 'Youth Medium'],
      colors: ['Clear/Blue', 'Purple/Pink', 'Green/Yellow'],
      emoji: '🥽',
      category: 'Safety',
      safetyCertified: true,
      coachRecommended: true,
    },
    {
      id: 6,
      sport: 'general',
      ageGroup: '13-15',
      name: 'Training Shorts',
      brand: 'Under Armour Youth',
      price: '$20-30',
      rating: 4.4,
      reviews: 267,
      priority: 'Important',
      description: 'Moisture-wicking shorts that keep you cool and comfortable during training.',
      features: ['Moisture-wicking', 'Lightweight', 'Elastic waistband', 'Side pockets'],
      sizes: ['XS-L Youth'],
      colors: ['Black', 'Navy', 'Red', 'Grey'],
      emoji: '🩳',
      category: 'Apparel',
      safetyCertified: true,
      coachRecommended: false,
    },
    {
      id: 7,
      sport: 'running',
      ageGroup: '9-12',
      name: 'Running Shoes',
      brand: 'New Balance FuelCore',
      price: '$50-70',
      rating: 4.6,
      reviews: 198,
      priority: 'Essential',
      description: 'Supportive running shoes designed specifically for young runners.',
      features: ['Cushioned midsole', 'Breathable mesh', 'Reflective details', 'Easy lacing'],
      sizes: ['10C-6Y'],
      colors: ['Blue/Orange', 'Pink/Purple', 'Black/Lime'],
      emoji: '👟',
      category: 'Footwear',
      safetyCertified: true,
      coachRecommended: true,
    },
    {
      id: 8,
      sport: 'general',
      ageGroup: '16-18',
      name: 'Fitness Tracker',
      brand: 'Fitbit Ace 3',
      price: '$80-100',
      rating: 4.3,
      reviews: 145,
      priority: 'Nice to Have',
      description: 'Fun fitness tracker that motivates kids to stay active with games and challenges.',
      features: ['Activity tracking', 'Sleep monitoring', 'Water resistant', 'Parent controls'],
      sizes: ['Adjustable band'],
      colors: ['Black/Red', 'Blue/Green', 'Purple/Pink'],
      emoji: '⌚',
      category: 'Technology',
      safetyCertified: true,
      coachRecommended: false,
    },
  ];

  // Filter gear based on selections
  const filteredGear = gearRecommendations.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport = selectedSport === 'All' || item.sport === selectedSport;
    const matchesAge = selectedAgeGroup === 'All' || item.ageGroup === selectedAgeGroup;
    return matchesSearch && matchesSport && matchesAge;
  });

  // Component did mount animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('Updated! 🛍️', 'Latest gear recommendations have been loaded!');
    }, 1500);
  }, []);

  // Toggle wishlist
  const toggleWishlist = (itemId) => {
    const newWishlist = new Set(wishlistItems);
    if (newWishlist.has(itemId)) {
      newWishlist.delete(itemId);
      Alert.alert('Removed! 💔', 'Item removed from your wishlist');
    } else {
      newWishlist.add(itemId);
      Alert.alert('Added! 💖', 'Item added to your wishlist');
    }
    setWishlistItems(newWishlist);
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Essential': return COLORS.error;
      case 'Important': return COLORS.primary;
      case 'Nice to Have': return COLORS.success;
      default: return COLORS.textSecondary;
    }
  };

  // Render sports filter chips
  const renderSportsFilter = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.filterContainer}
      contentContainerStyle={styles.filterContent}
    >
      {sportsCategories.map((sport) => (
        <Chip
          key={sport.id}
          selected={selectedSport === sport.id}
          onPress={() => setSelectedSport(sport.id)}
          style={[
            styles.filterChip,
            selectedSport === sport.id && styles.selectedFilterChip
          ]}
          textStyle={[
            styles.chipText,
            selectedSport === sport.id && styles.selectedChipText
          ]}
          icon={sport.icon}
        >
          {sport.emoji} {sport.label}
        </Chip>
      ))}
    </ScrollView>
  );

  // Render age group filter
  const renderAgeFilter = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.ageFilterContainer}
      contentContainerStyle={styles.filterContent}
    >
      {ageGroups.map((age) => (
        <Chip
          key={age.id}
          selected={selectedAgeGroup === age.id}
          onPress={() => setSelectedAgeGroup(age.id)}
          style={[
            styles.ageChip,
            selectedAgeGroup === age.id && styles.selectedAgeChip
          ]}
          textStyle={[
            styles.chipText,
            selectedAgeGroup === age.id && styles.selectedChipText
          ]}
        >
          {age.label}
        </Chip>
      ))}
    </ScrollView>
  );

  // Render gear item card
  const renderGearCard = ({ item, index }) => {
    const isWishlisted = wishlistItems.has(item.id);
    const cardScale = useState(new Animated.Value(1))[0];

    const handlePress = () => {
      Animated.sequence([
        Animated.timing(cardScale, { toValue: 0.95, duration: 100, useNativeDriver: true }),
        Animated.timing(cardScale, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start();
      
      Alert.alert(
        `${item.emoji} ${item.name}`,
        'Gear details feature coming soon!',
        [
          { text: 'Add to Wishlist', onPress: () => toggleWishlist(item.id) },
          { text: 'OK', style: 'cancel' }
        ]
      );
    };

    return (
      <Animated.View style={[
        viewMode === 'grid' ? styles.gridItem : styles.listItem,
        { transform: [{ scale: cardScale }] }
      ]}>
        <Card style={styles.gearCard}>
          <TouchableOpacity onPress={handlePress}>
            <View style={styles.cardHeader}>
              <View style={styles.itemImageContainer}>
                <Text style={styles.itemEmoji}>{item.emoji}</Text>
                {item.coachRecommended && (
                  <Surface style={styles.recommendedBadge}>
                    <Icon name="verified" size={12} color={COLORS.success} />
                  </Surface>
                )}
              </View>
              <IconButton
                icon={isWishlisted ? "favorite" : "favorite-outline"}
                iconColor={isWishlisted ? COLORS.error : COLORS.textSecondary}
                size={20}
                onPress={() => toggleWishlist(item.id)}
                style={styles.wishlistButton}
              />
            </View>

            <View style={styles.cardContent}>
              <View style={styles.priorityContainer}>
                <Chip 
                  style={[styles.priorityChip, { backgroundColor: getPriorityColor(item.priority) + '20' }]}
                  textStyle={[styles.priorityText, { color: getPriorityColor(item.priority) }]}
                  compact
                >
                  {item.priority}
                </Chip>
                {item.safetyCertified && (
                  <Icon name="verified-user" size={16} color={COLORS.success} />
                )}
              </View>

              <Text style={styles.itemName} numberOfLines={viewMode === 'grid' ? 2 : 1}>
                {item.name}
              </Text>
              <Text style={styles.itemBrand}>{item.brand}</Text>
              
              {viewMode === 'list' && (
                <Text style={styles.itemDescription} numberOfLines={2}>
                  {item.description}
                </Text>
              )}

              <View style={styles.ratingContainer}>
                <View style={styles.ratingRow}>
                  <Icon name="star" size={16} color="#FFD700" />
                  <Text style={styles.ratingText}>{item.rating}</Text>
                  <Text style={styles.reviewsText}>({item.reviews})</Text>
                </View>
                <Text style={styles.priceText}>{item.price}</Text>
              </View>

              {viewMode === 'list' && (
                <View style={styles.featuresContainer}>
                  {item.features.slice(0, 2).map((feature, index) => (
                    <Chip key={index} style={styles.featureChip} textStyle={styles.featureText} compact>
                      {feature}
                    </Chip>
                  ))}
                </View>
              )}
            </View>
          </TouchableOpacity>
        </Card>
      </Animated.View>
    );
  };

  // Render stats section
  const renderStatsSection = () => (
    <Card style={styles.statsCard}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.statsGradient}
      >
        <Text style={styles.statsTitle}>Your Gear Journey 🎒</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{wishlistItems.size}</Text>
            <Text style={styles.statLabel}>Wishlist Items</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Gear Owned</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>85%</Text>
            <Text style={styles.statLabel}>Gear Score</Text>
          </View>
        </View>
        
        <View style={styles.gearProgress}>
          <Text style={styles.progressLabel}>Gear Completeness</Text>
          <ProgressBar
            progress={0.85}
            color={COLORS.background}
            style={styles.progressBar}
          />
          <Text style={styles.progressText}>You're well equipped! 🌟</Text>
        </View>
      </LinearGradient>
    </Card>
  );

  // Render essential gear section
  const renderEssentialGear = () => {
    const essentialItems = filteredGear.filter(item => item.priority === 'Essential');
    
    if (essentialItems.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="priority-high" size={20} color={COLORS.error} />
          <Text style={styles.sectionTitle}>Essential Gear First! 🎯</Text>
        </View>
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.essentialScroll}
        >
          {essentialItems.map((item, index) => (
            <Card key={`essential-${item.id}`} style={styles.essentialCard}>
              <TouchableOpacity onPress={() => Alert.alert(`${item.emoji} ${item.name}`, 'Essential gear details coming soon!')}>
                <LinearGradient
                  colors={['#ff6b6b20', '#ee576720']}
                  style={styles.essentialContent}
                >
                  <Text style={styles.essentialEmoji}>{item.emoji}</Text>
                  <Text style={styles.essentialName} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={styles.essentialPrice}>{item.price}</Text>
                  <View style={styles.essentialRating}>
                    <Icon name="star" size={14} color="#FFD700" />
                    <Text style={styles.essentialRatingText}>{item.rating}</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Card>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Animated.View
          style={[
            styles.headerContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.headerTitle}>Gear Guide 🛍️</Text>
          <Text style={styles.headerSubtitle}>
            Find the perfect gear for your sport!
          </Text>
          
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.viewToggle}
              onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              <Icon 
                name={viewMode === 'grid' ? 'view-list' : 'view-module'} 
                size={20} 
                color={COLORS.background} 
              />
              <Text style={styles.viewToggleText}>
                {viewMode === 'grid' ? 'List' : 'Grid'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search gear by name or brand..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={COLORS.primary}
          inputStyle={styles.searchInput}
        />
      </View>

      {/* Filters */}
      <Text style={styles.filterTitle}>Sport:</Text>
      {renderSportsFilter()}
      
      <Text style={styles.filterTitle}>Age Group:</Text>
      {renderAgeFilter()}

      {/* Content */}
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
        {/* Stats Section */}
        {renderStatsSection()}

        {/* Essential Gear */}
        {renderEssentialGear()}

        {/* All Gear Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="shopping-cart" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>
              All Recommendations ({filteredGear.length})
            </Text>
          </View>

          {filteredGear.length === 0 ? (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyContent}>
                <Icon name="search-off" size={48} color={COLORS.textSecondary} />
                <Text style={styles.emptyTitle}>No Gear Found</Text>
                <Text style={styles.emptyText}>
                  Try adjusting your filters or search terms
                </Text>
              </View>
            </Card>
          ) : (
            <FlatList
              data={filteredGear}
              renderItem={renderGearCard}
              keyExtractor={(item) => item.id.toString()}
              numColumns={viewMode === 'grid' ? 2 : 1}
              key={viewMode} // Force re-render when view mode changes
              scrollEnabled={false}
              contentContainerStyle={styles.gearGrid}
            />
          )}
        </View>

        {/* Buying Guide Section */}
        <Card style={styles.buyingGuideCard}>
          <LinearGradient
            colors={['#667eea15', '#764ba215']}
            style={styles.buyingGuideContent}
          >
            <Icon name="info-outline" size={32} color={COLORS.primary} />
            <Text style={styles.buyingGuideTitle}>Smart Shopping Tips 🛒</Text>
            <View style={styles.tipsList}>
              <View style={styles.tipItem}>
                <Icon name="check-circle" size={16} color={COLORS.success} />
                <Text style={styles.tipText}>Always try on shoes before buying</Text>
              </View>
              <View style={styles.tipItem}>
                <Icon name="check-circle" size={16} color={COLORS.success} />
                <Text style={styles.tipText}>Look for safety certifications</Text>
              </View>
              <View style={styles.tipItem}>
                <Icon name="check-circle" size={16} color={COLORS.success} />
                <Text style={styles.tipText}>Ask your coach for recommendations</Text>
              </View>
              <View style={styles.tipItem}>
                <Icon name="check-circle" size={16} color={COLORS.success} />
                <Text style={styles.tipText}>Quality over quantity - buy what you need</Text>
              </View>
            </View>
            <Button
              mode="contained"
              onPress={() => Alert.alert('Shopping Guide 📖', 'Complete buying guide coming soon!')}
              style={styles.guideButton}
              contentStyle={styles.buttonContent}
            >
              View Full Guide
            </Button>
          </LinearGradient>
        </Card>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
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
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.heading,
    color: COLORS.background,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.background,
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
  },
  viewToggleText: {
    ...TEXT_STYLES.caption,
    color: COLORS.background,
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  searchBar: {
    backgroundColor: COLORS.surface,
    elevation: 0,
    borderRadius: 12,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  filterTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: SPACING.md,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  filterContainer: {
    backgroundColor: COLORS.background,
  },
  ageFilterContainer: {
    backgroundColor: COLORS.background,
    marginBottom: SPACING.sm,
  },
  filterContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xs,
  },
  filterChip: {
    marginRight: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  selectedFilterChip: {
    backgroundColor: COLORS.primary,
  },
  ageChip: {
    marginRight: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  selectedAgeChip: {
    backgroundColor: COLORS.secondary,
  },
  chipText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textPrimary,
  },
  selectedChipText: {
    color: COLORS.background,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  sectionTitle: {
    ...TEXT_STYLES.subheading,
    color: COLORS.textPrimary,
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  statsCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statsGradient: {
    padding: SPACING.lg,
  },
  statsTitle: {
    ...TEXT_STYLES.subheading,
    color: COLORS.background,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    ...TEXT_STYLES.heading,
    color: COLORS.background,
    fontSize: 24,
    fontWeight: '800',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.background,
    opacity: 0.9,
  },
  gearProgress: {
    alignItems: 'center',
  },
  progressLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.background,
    marginBottom: SPACING.xs,
  },
  progressBar: {
    width: 200,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  progressText: {
    ...TEXT_STYLES.caption,
    color: COLORS.background,
    marginTop: SPACING.xs,
    fontWeight: '600',
  },
  essentialScroll: {
    paddingLeft: SPACING.md,
  },
  essentialCard: {
    width: 140,
    marginRight: SPACING.sm,
    borderRadius: 12,
    overflow: 'hidden',
  },
  essentialContent: {
    padding: SPACING.md,
    alignItems: 'center',
    height: 120,
  },
  essentialEmoji: {
    fontSize: 28,
    marginBottom: SPACING.xs,
  },
  essentialName: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: SPACING.xs,
    color: COLORS.textPrimary,
    fontSize: 12,
  },
  essentialPrice: {
    ...TEXT_STYLES.caption,
    color: COLORS.error,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  essentialRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  essentialRatingText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginLeft: 2,
    fontSize: 11,
  },
  gearGrid: {
    paddingHorizontal: SPACING.sm,
  },
  gridItem: {
    width: (width - SPACING.md * 3) / 2,
    marginHorizontal: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  listItem: {
    width: '100%',
    paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  gearCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: SPACING.sm,
  },
  itemImageContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    backgroundColor: COLORS.surface,
    borderRadius: 30,
  },
  itemEmoji: {
    fontSize: 32,
  },
  recommendedBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  wishlistButton: {
    margin: 0,
  },
  cardContent: {
    padding: SPACING.sm,
    paddingTop: 0,
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  priorityChip: {
    height: 24,
  },
  priorityText: {
    ...TEXT_STYLES.caption,
    fontSize: 10,
    fontWeight: '600',
  },
  itemName: {
    ...TEXT_STYLES.body,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  itemBrand: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  itemDescription: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    lineHeight: 16,
    marginBottom: SPACING.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginLeft: 2,
  },
  reviewsText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginLeft: 2,
  },
  priceText: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    fontWeight: '700',
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.xs,
  },
  featureChip: {
    height: 20,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
    backgroundColor: COLORS.primary + '15',
  },
  featureText: {
    ...TEXT_STYLES.caption,
    fontSize: 9,
    color: COLORS.primary,
  },
  buyingGuideCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
  },
  buyingGuideContent: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  buyingGuideTitle: {
    ...TEXT_STYLES.subheading,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginVertical: SPACING.sm,
  },
  tipsList: {
    width: '100%',
    marginVertical: SPACING.md,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  tipText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  guideButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 25,
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
  },
  buttonContent: {
    paddingHorizontal: SPACING.sm,
  },
  emptyCard: {
    marginHorizontal: SPACING.md,
    borderRadius: 16,
  },
  emptyContent: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyTitle: {
    ...TEXT_STYLES.subheading,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  emptyText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  bottomSpacing: {
    height: SPACING.xl,
  },
});

// Set navigation options
GearRecommendations.navigationOptions = {
  title: 'Gear Recommendations',
  headerShown: false,
};

export default GearRecommendations;