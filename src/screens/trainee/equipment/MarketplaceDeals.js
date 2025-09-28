import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  RefreshControl,
  StatusBar,
  Animated,
  Vibration,
  Dimensions,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import {
  Card,
  Text,
  Button,
  Chip,
  IconButton,
  FAB,
  Surface,
  Portal,
  Modal,
  Searchbar,
  Avatar,
  Badge,
  Divider,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';

// Import your constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const MarketPlaceDeals = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [favoriteItems, setFavoriteItems] = useState(new Set());
  const [cartItems, setCartItems] = useState(new Set());
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-50));
  
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const deals = useSelector(state => state.marketplace.deals || []);
  
  // Sample marketplace deals data
  const [dealsData, setDealsData] = useState([
    {
      id: '1',
      title: 'PowerFlex Resistance Bands Set',
      category: 'Equipment',
      type: 'equipment',
      originalPrice: 89.99,
      discountPrice: 59.99,
      discount: 33,
      rating: 4.8,
      reviews: 156,
      seller: 'FitGear Pro',
      location: 'New York',
      image: 'fitness-center',
      description: 'Professional resistance bands with door anchor and exercise guide',
      features: ['5 resistance levels', 'Door anchor included', 'Exercise guide', '1-year warranty'],
      inStock: true,
      fastShipping: true,
      verified: true,
      tags: ['Popular', 'Fast Shipping'],
      timeLeft: '2 days',
    },
    {
      id: '2',
      title: 'Premium Whey Protein 5lbs',
      category: 'Supplements',
      type: 'supplement',
      originalPrice: 79.99,
      discountPrice: 49.99,
      discount: 38,
      rating: 4.9,
      reviews: 289,
      seller: 'NutriMax',
      location: 'California',
      image: 'local-drink',
      description: 'High-quality whey protein isolate with 25g protein per serving',
      features: ['25g protein per serving', 'Low carbs & fat', 'Great taste', 'Lab tested'],
      inStock: true,
      fastShipping: true,
      verified: true,
      tags: ['Best Seller', 'Limited Time'],
      timeLeft: '5 hours',
    },
    {
      id: '3',
      title: 'Personal Training Session - 1 Month',
      category: 'Services',
      type: 'service',
      originalPrice: 400.00,
      discountPrice: 299.99,
      discount: 25,
      rating: 5.0,
      reviews: 45,
      seller: 'Elite Fitness Coach',
      location: 'Los Angeles',
      image: 'person',
      description: '4 one-on-one personal training sessions with certified trainer',
      features: ['Certified trainer', 'Custom workout plan', 'Nutrition guidance', 'Progress tracking'],
      inStock: true,
      fastShipping: false,
      verified: true,
      tags: ['Premium', 'Local'],
      timeLeft: '1 day',
    },
    {
      id: '4',
      title: 'Smart Fitness Watch Pro',
      category: 'Wearables',
      type: 'equipment',
      originalPrice: 299.99,
      discountPrice: 199.99,
      discount: 33,
      rating: 4.6,
      reviews: 412,
      seller: 'TechFit Store',
      location: 'Texas',
      image: 'watch',
      description: 'Advanced fitness tracker with heart rate monitoring and GPS',
      features: ['Heart rate monitor', 'GPS tracking', '7-day battery', 'Water resistant'],
      inStock: true,
      fastShipping: true,
      verified: true,
      tags: ['Tech', 'New'],
      timeLeft: '3 days',
    },
    {
      id: '5',
      title: 'Olympic Weight Plate Set - 300lbs',
      category: 'Equipment',
      type: 'equipment',
      originalPrice: 699.99,
      discountPrice: 499.99,
      discount: 29,
      rating: 4.7,
      reviews: 78,
      seller: 'Iron Paradise',
      location: 'Florida',
      image: 'fitness-center',
      description: 'Professional Olympic weight plates with rubber coating',
      features: ['Rubber coated', 'Olympic standard', 'Color coded', 'Free shipping'],
      inStock: false,
      fastShipping: false,
      verified: true,
      tags: ['Heavy Duty', 'Out of Stock'],
      timeLeft: 'Restocking',
    },
    {
      id: '6',
      title: 'Yoga Mat Premium Plus',
      category: 'Equipment',
      type: 'equipment',
      originalPrice: 49.99,
      discountPrice: 29.99,
      discount: 40,
      rating: 4.9,
      reviews: 234,
      seller: 'Zen Fitness',
      location: 'Oregon',
      image: 'self-improvement',
      description: 'Extra thick, non-slip yoga mat with carrying strap',
      features: ['6mm thickness', 'Non-slip surface', 'Eco-friendly', 'Carrying strap'],
      inStock: true,
      fastShipping: true,
      verified: true,
      tags: ['Eco-Friendly', 'Hot Deal'],
      timeLeft: '12 hours',
    },
  ]);

  const categories = [
    { key: 'all', label: 'All Deals', icon: 'store', count: dealsData.length },
    { key: 'Equipment', label: 'Equipment', icon: 'fitness-center', count: dealsData.filter(d => d.category === 'Equipment').length },
    { key: 'Supplements', label: 'Supplements', icon: 'local-drink', count: dealsData.filter(d => d.category === 'Supplements').length },
    { key: 'Services', label: 'Services', icon: 'person', count: dealsData.filter(d => d.category === 'Services').length },
    { key: 'Wearables', label: 'Wearables', icon: 'watch', count: dealsData.filter(d => d.category === 'Wearables').length },
  ];

  const filters = [
    { key: 'all', label: 'All Items', icon: 'view-list' },
    { key: 'discount', label: 'High Discount', icon: 'local-offer' },
    { key: 'rating', label: 'Top Rated', icon: 'star' },
    { key: 'shipping', label: 'Fast Shipping', icon: 'local-shipping' },
    { key: 'verified', label: 'Verified Sellers', icon: 'verified' },
  ];

  useEffect(() => {
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
      })
    ]).start();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      Vibration.vibrate(50);
      Alert.alert('Updated! 🎉', 'Found 3 new deals for you!');
    }, 2000);
  }, []);

  const filteredDeals = dealsData.filter(deal => {
    const matchesSearch = deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         deal.seller.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         deal.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || deal.category === selectedCategory;
    
    let matchesFilter = true;
    if (selectedFilter === 'discount') matchesFilter = deal.discount >= 30;
    else if (selectedFilter === 'rating') matchesFilter = deal.rating >= 4.8;
    else if (selectedFilter === 'shipping') matchesFilter = deal.fastShipping;
    else if (selectedFilter === 'verified') matchesFilter = deal.verified;
    
    return matchesSearch && matchesCategory && matchesFilter;
  });

  const toggleFavorite = (dealId) => {
    const newFavorites = new Set(favoriteItems);
    if (newFavorites.has(dealId)) {
      newFavorites.delete(dealId);
    } else {
      newFavorites.add(dealId);
      Vibration.vibrate(50);
    }
    setFavoriteItems(newFavorites);
  };

  const addToCart = (deal) => {
    if (!deal.inStock) {
      Alert.alert('Out of Stock', 'This item is currently out of stock');
      return;
    }
    
    const newCart = new Set(cartItems);
    newCart.add(deal.id);
    setCartItems(newCart);
    Vibration.vibrate(100);
    Alert.alert('Added to Cart! 🛒', `${deal.title} has been added to your cart`);
  };

  const handleBuyNow = (deal) => {
    if (!deal.inStock) {
      Alert.alert('Out of Stock', 'This item is currently out of stock');
      return;
    }
    
    Alert.alert(
      'Purchase Confirmation 💳',
      `Buy "${deal.title}" for $${deal.discountPrice}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Buy Now',
          onPress: () => {
            Vibration.vibrate(100);
            Alert.alert('Success! 🎉', 'Purchase completed! Check your email for confirmation.');
          }
        }
      ]
    );
  };

  const renderDealCard = ({ item: deal }) => {
    const savings = (deal.originalPrice - deal.discountPrice).toFixed(2);
    const isFavorite = favoriteItems.has(deal.id);
    const inCart = cartItems.has(deal.id);
    
    return (
      <Card style={styles.dealCard} elevation={3}>
        <LinearGradient
          colors={['rgba(102, 126, 234, 0.05)', 'transparent']}
          style={styles.cardGradient}
        >
          <View style={styles.cardHeader}>
            <View style={styles.dealBadge}>
              <Text style={styles.discountText}>{deal.discount}% OFF</Text>
            </View>
            <IconButton
              icon={isFavorite ? 'favorite' : 'favorite-border'}
              size={20}
              iconColor={isFavorite ? COLORS.error : COLORS.textSecondary}
              onPress={() => toggleFavorite(deal.id)}
              style={styles.favoriteButton}
            />
          </View>

          <View style={styles.dealContent}>
            <Avatar.Icon
              size={60}
              icon={deal.image}
              style={[styles.dealImage, { backgroundColor: COLORS.primary }]}
            />
            
            <View style={styles.dealInfo}>
              <Text style={styles.dealTitle} numberOfLines={2}>{deal.title}</Text>
              
              <View style={styles.sellerInfo}>
                <MaterialIcons name="store" size={14} color={COLORS.textSecondary} />
                <Text style={styles.sellerText}>{deal.seller}</Text>
                {deal.verified && (
                  <MaterialIcons name="verified" size={14} color={COLORS.success} />
                )}
              </View>

              <View style={styles.ratingSection}>
                <View style={styles.rating}>
                  <MaterialIcons name="star" size={16} color="#FFD700" />
                  <Text style={styles.ratingText}>{deal.rating}</Text>
                  <Text style={styles.reviewsText}>({deal.reviews})</Text>
                </View>
                <Text style={styles.locationText}>{deal.location}</Text>
              </View>
            </View>
          </View>

          <View style={styles.priceSection}>
            <View style={styles.priceInfo}>
              <Text style={styles.originalPrice}>${deal.originalPrice}</Text>
              <Text style={styles.discountPrice}>${deal.discountPrice}</Text>
              <Text style={styles.savingsText}>Save ${savings}</Text>
            </View>
            
            <View style={styles.timeRemaining}>
              <MaterialIcons name="schedule" size={14} color={COLORS.warning} />
              <Text style={styles.timeText}>{deal.timeLeft}</Text>
            </View>
          </View>

          <View style={styles.featuresSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {deal.features.slice(0, 2).map((feature, index) => (
                <Chip
                  key={index}
                  mode="outlined"
                  compact
                  style={styles.featureChip}
                  textStyle={styles.featureText}
                >
                  {feature}
                </Chip>
              ))}
            </ScrollView>
          </View>

          <View style={styles.tagsSection}>
            {deal.tags.map((tag, index) => (
              <Chip
                key={index}
                mode="flat"
                compact
                style={[styles.tag, tag === 'Out of Stock' && styles.outOfStockTag]}
                textStyle={[styles.tagText, tag === 'Out of Stock' && styles.outOfStockText]}
              >
                {tag}
              </Chip>
            ))}
          </View>

          <Divider style={styles.divider} />

          <View style={styles.actionsSection}>
            <Button
              mode="outlined"
              onPress={() => addToCart(deal)}
              style={[styles.actionButton, styles.cartButton]}
              disabled={!deal.inStock}
              icon={inCart ? "check" : "shopping-cart"}
            >
              {inCart ? "In Cart" : "Add to Cart"}
            </Button>
            
            <Button
              mode="contained"
              onPress={() => handleBuyNow(deal)}
              style={[styles.actionButton, styles.buyButton]}
              buttonColor={deal.inStock ? COLORS.primary : COLORS.textSecondary}
              disabled={!deal.inStock}
            >
              {deal.inStock ? "Buy Now" : "Out of Stock"}
            </Button>
          </View>
        </LinearGradient>
      </Card>
    );
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => setSelectedCategory(item.key)}
      style={[
        styles.categoryItem,
        selectedCategory === item.key && styles.selectedCategory
      ]}
    >
      <MaterialIcons
        name={item.icon}
        size={24}
        color={selectedCategory === item.key ? 'white' : COLORS.primary}
      />
      <Text style={[
        styles.categoryLabel,
        selectedCategory === item.key && styles.selectedCategoryLabel
      ]}>
        {item.label}
      </Text>
      <Badge
        style={[
          styles.categoryBadge,
          selectedCategory === item.key && styles.selectedCategoryBadge
        ]}
      >
        {item.count}
      </Badge>
    </TouchableOpacity>
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
          <View>
            <Text style={styles.headerTitle}>Marketplace Deals 🛒</Text>
            <Text style={styles.headerSubtitle}>Exclusive discounts for you!</Text>
          </View>
          <View style={styles.headerActions}>
            <IconButton
              icon="filter-list"
              size={24}
              iconColor="white"
              onPress={() => setShowFilterModal(true)}
              style={styles.headerButton}
            />
            <View style={styles.cartContainer}>
              <IconButton
                icon="shopping-cart"
                size={24}
                iconColor="white"
                onPress={() => Alert.alert('Cart', `You have ${cartItems.size} items in cart`)}
                style={styles.headerButton}
              />
              {cartItems.size > 0 && (
                <Badge style={styles.cartBadge}>{cartItems.size}</Badge>
              )}
            </View>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search deals, brands, services..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={COLORS.primary}
        />
      </View>

      <Animated.View style={[styles.categoriesContainer, { transform: [{ translateY: slideAnim }] }]}>
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.key}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
        />
      </Animated.View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {filteredDeals.length === 0 ? (
          <Surface style={styles.emptyState}>
            <MaterialIcons name="local-offer" size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyTitle}>No Deals Found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Try adjusting your search or filters' : 'Check back later for new deals!'}
            </Text>
          </Surface>
        ) : (
          <FlatList
            data={filteredDeals}
            renderItem={renderDealCard}
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
            contentContainerStyle={styles.dealsContainer}
          />
        )}
      </Animated.View>

      <Portal>
        <Modal
          visible={showFilterModal}
          onDismiss={() => setShowFilterModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView
            style={styles.modalBlur}
            blurType="light"
            blurAmount={10}
          >
            <Surface style={styles.modalContent}>
              <Text style={styles.modalTitle}>Filter Deals</Text>
              
              <Text style={styles.filterSectionTitle}>Filter by:</Text>
              {filters.map((filter) => (
                <TouchableOpacity
                  key={filter.key}
                  style={[
                    styles.filterOption,
                    selectedFilter === filter.key && styles.selectedFilter
                  ]}
                  onPress={() => setSelectedFilter(filter.key)}
                >
                  <MaterialIcons
                    name={filter.icon}
                    size={20}
                    color={selectedFilter === filter.key ? COLORS.primary : COLORS.textSecondary}
                  />
                  <Text style={[
                    styles.filterOptionText,
                    selectedFilter === filter.key && styles.selectedFilterText
                  ]}>
                    {filter.label}
                  </Text>
                  {selectedFilter === filter.key && (
                    <MaterialIcons name="check" size={20} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              ))}
              
              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={() => setShowFilterModal(false)}
                  style={styles.modalButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={() => setShowFilterModal(false)}
                  style={styles.modalButton}
                  buttonColor={COLORS.primary}
                >
                  Apply Filters
                </Button>
              </View>
            </Surface>
          </BlurView>
        </Modal>
      </Portal>

      <FAB
        icon="local-offer"
        style={styles.fab}
        color="white"
        onPress={() => Alert.alert('Hot Deals! 🔥', 'Subscribe for exclusive deal notifications!')}
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
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  cartContainer: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: COLORS.error,
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  searchBar: {
    backgroundColor: 'white',
    elevation: 2,
  },
  categoriesContainer: {
    paddingVertical: SPACING.md,
  },
  categoriesContent: {
    paddingHorizontal: SPACING.lg,
  },
  categoryItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    marginRight: SPACING.sm,
    borderRadius: 25,
    backgroundColor: 'white',
    minWidth: 80,
    position: 'relative',
    elevation: 1,
  },
  selectedCategory: {
    backgroundColor: COLORS.primary,
  },
  categoryLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    marginTop: SPACING.xs,
    fontWeight: '600',
  },
  selectedCategoryLabel: {
    color: 'white',
  },
  categoryBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: COLORS.error,
  },
  selectedCategoryBadge: {
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
  },
  dealsContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100,
  },
  dealCard: {
    marginBottom: SPACING.lg,
    borderRadius: 15,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: SPACING.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  dealBadge: {
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
  },
  discountText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  favoriteButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  dealContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  dealImage: {
    marginRight: SPACING.md,
  },
  dealInfo: {
    flex: 1,
  },
  dealTitle: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sellerText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    marginRight: SPACING.xs,
    color: COLORS.textSecondary,
  },
  ratingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    fontWeight: 'bold',
  },
  reviewsText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  locationText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  priceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  originalPrice: {
    ...TEXT_STYLES.body,
    textDecorationLine: 'line-through',
    color: COLORS.textSecondary,
    marginRight: SPACING.sm,
  },
  discountPrice: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginRight: SPACING.sm,
  },
  savingsText: {
    ...TEXT_STYLES.caption,
    color: COLORS.success,
    fontWeight: 'bold',
  },
  timeRemaining: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    ...TEXT_STYLES.caption,
    color: COLORS.warning,
    marginLeft: SPACING.xs,
    fontWeight: 'bold',
  },
  featuresSection: {
    marginBottom: SPACING.md,
  },
  featureChip: {
    marginRight: SPACING.sm,
    height: 28,
  },
  featureText: {
    fontSize: 11,
  },
  tagsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  tag: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
    backgroundColor: COLORS.primary,
    height: 24,
  },
  tagText: {
    fontSize: 10,
    color: 'white',
  },
  outOfStockTag: {
    backgroundColor: COLORS.error,
  },
  outOfStockText: {
    color: 'white',
  },
  divider: {
    marginVertical: SPACING.md,
  },
  actionsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  cartButton: {
    borderColor: COLORS.primary,
  },
  buyButton: {
    marginLeft: SPACING.sm,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    marginTop: SPACING.xl,
    marginHorizontal: SPACING.lg,
    borderRadius: 15,
  },
  emptyTitle: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBlur: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: 15,
    maxHeight: '80%',
    width: width * 0.9,
  },
  modalTitle: {
    ...TEXT_STYLES.h2,
    fontWeight: 'bold',
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  filterSectionTitle: {
    ...TEXT_STYLES.h4,
    fontWeight: '600',
    marginBottom: SPACING.md,
    color: COLORS.textPrimary,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.xs,
  },
  selectedFilter: {
    backgroundColor: COLORS.primaryLight || 'rgba(102, 126, 234, 0.1)',
  },
  filterOptionText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.sm,
    flex: 1,
    color: COLORS.textPrimary,
  },
  selectedFilterText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
});

export default MarketPlaceDeals;