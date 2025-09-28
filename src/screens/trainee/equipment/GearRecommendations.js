import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  Vibration,
  Animated,
  Modal,
  TouchableOpacity,
  FlatList,
  Linking,
  Dimensions,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  ProgressBar,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Searchbar,
  Portal,
  Badge,
  Divider,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const GearRecommendations = ({ navigation }) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // Redux state
  const dispatch = useDispatch();
  const { user, workouts, equipment } = useSelector(state => ({
    user: state.auth.user,
    workouts: state.workouts.sessions || [],
    equipment: state.equipment.items || [],
  }));

  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGear, setSelectedGear] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('recommended');
  const [loading, setLoading] = useState(false);

  // AI-powered recommendations based on user data
  const [recommendations, setRecommendations] = useState([
    {
      id: '1',
      name: 'Nike Air Zoom Pegasus 40',
      category: 'footwear',
      type: 'Running Shoes',
      price: 130,
      originalPrice: 150,
      discount: 13,
      rating: 4.6,
      reviews: 2847,
      image: '👟',
      brand: 'Nike',
      aiScore: 95,
      matchReason: 'Perfect for your 5K training program',
      features: ['Responsive Cushioning', 'Breathable Mesh', 'Durable Outsole'],
      pros: ['Excellent for daily training', 'Great value', 'Comfortable fit'],
      cons: ['May run small', 'Limited color options'],
      inStock: true,
      freeShipping: true,
      trending: true,
      tags: ['best-seller', 'recommended', 'popular'],
      workoutTypes: ['running', 'cardio', 'cross-training'],
      experienceLevel: 'intermediate',
      affiliateLink: 'https://nike.com/pegasus-40',
    },
    {
      id: '2',
      name: 'Bowflex SelectTech 552',
      category: 'strength',
      type: 'Adjustable Dumbbells',
      price: 399,
      originalPrice: 449,
      discount: 11,
      rating: 4.4,
      reviews: 1523,
      image: '🏋️',
      brand: 'Bowflex',
      aiScore: 92,
      matchReason: 'Ideal for your home strength training',
      features: ['5-52.5 lbs per dumbbell', 'Space-saving design', 'Quick weight changes'],
      pros: ['Saves space', 'Durable construction', 'Easy weight adjustment'],
      cons: ['Higher price point', 'Can be noisy'],
      inStock: true,
      freeShipping: true,
      trending: false,
      tags: ['space-saver', 'versatile', 'premium'],
      workoutTypes: ['strength', 'bodybuilding', 'functional'],
      experienceLevel: 'all',
      affiliateLink: 'https://bowflex.com/selecttech-552',
    },
    {
      id: '3',
      name: 'Garmin Forerunner 255',
      category: 'wearables',
      type: 'GPS Running Watch',
      price: 349,
      originalPrice: 399,
      discount: 13,
      rating: 4.7,
      reviews: 912,
      image: '⌚',
      brand: 'Garmin',
      aiScore: 89,
      matchReason: 'Track your progress like a pro athlete',
      features: ['Built-in GPS', 'Heart Rate Monitor', '14-day battery life'],
      pros: ['Accurate tracking', 'Long battery life', 'Comprehensive metrics'],
      cons: ['Learning curve', 'Expensive'],
      inStock: true,
      freeShipping: false,
      trending: true,
      tags: ['tech-forward', 'professional', 'analytics'],
      workoutTypes: ['running', 'cycling', 'swimming'],
      experienceLevel: 'intermediate',
      affiliateLink: 'https://garmin.com/forerunner-255',
    },
    {
      id: '4',
      name: 'Resistance Bands Set Pro',
      category: 'accessories',
      type: 'Resistance Training',
      price: 29,
      originalPrice: 39,
      discount: 26,
      rating: 4.3,
      reviews: 3456,
      image: '💪',
      brand: 'FitnessPro',
      aiScore: 87,
      matchReason: 'Perfect for travel and home workouts',
      features: ['5 resistance levels', 'Door anchor', 'Exercise guide included'],
      pros: ['Affordable', 'Portable', 'Versatile exercises'],
      cons: ['May snap with heavy use', 'Limited resistance'],
      inStock: true,
      freeShipping: true,
      trending: false,
      tags: ['budget-friendly', 'portable', 'beginner'],
      workoutTypes: ['strength', 'rehabilitation', 'flexibility'],
      experienceLevel: 'beginner',
      affiliateLink: 'https://fitnesspro.com/resistance-bands',
    },
    {
      id: '5',
      name: 'Hydro Flask Sport Bottle',
      category: 'accessories',
      type: 'Water Bottle',
      price: 44,
      originalPrice: 50,
      discount: 12,
      rating: 4.8,
      reviews: 5621,
      image: '🍼',
      brand: 'Hydro Flask',
      aiScore: 85,
      matchReason: 'Stay hydrated during intense sessions',
      features: ['24oz capacity', 'Double-wall insulation', 'Leak-proof design'],
      pros: ['Keeps drinks cold', 'Durable', 'Easy to clean'],
      cons: ['Heavy when full', 'Can dent'],
      inStock: true,
      freeShipping: true,
      trending: false,
      tags: ['essential', 'quality', 'hydration'],
      workoutTypes: ['all'],
      experienceLevel: 'all',
      affiliateLink: 'https://hydroflask.com/sport-bottle',
    },
    {
      id: '6',
      name: 'Yoga Mat Premium Plus',
      category: 'accessories',
      type: 'Exercise Mat',
      price: 79,
      originalPrice: 99,
      discount: 20,
      rating: 4.5,
      reviews: 2134,
      image: '🧘',
      brand: 'Manduka',
      aiScore: 83,
      matchReason: 'Great for your flexibility training',
      features: ['6mm thickness', 'Non-slip surface', 'Eco-friendly materials'],
      pros: ['Excellent cushioning', 'Non-toxic', 'Durable'],
      cons: ['Heavy to carry', 'Takes time to break in'],
      inStock: false,
      freeShipping: true,
      trending: false,
      tags: ['eco-friendly', 'premium', 'yoga'],
      workoutTypes: ['yoga', 'pilates', 'stretching'],
      experienceLevel: 'all',
      affiliateLink: 'https://manduka.com/yoga-mat-premium',
    },
  ]);

  const categories = [
    { key: 'all', label: 'All Gear', icon: 'shopping-cart', color: COLORS.primary, count: recommendations.length },
    { key: 'footwear', label: 'Footwear', icon: 'sports', color: '#e74c3c', count: 1 },
    { key: 'strength', label: 'Strength', icon: 'fitness-center', color: '#f39c12', count: 1 },
    { key: 'wearables', label: 'Wearables', icon: 'watch', color: '#9b59b6', count: 1 },
    { key: 'accessories', label: 'Accessories', icon: 'extension', color: '#2ecc71', count: 3 },
  ];

  const priceRanges = [
    { key: 'all', label: 'All Prices', min: 0, max: 9999 },
    { key: 'budget', label: 'Under $50', min: 0, max: 50 },
    { key: 'mid', label: '$50 - $200', min: 50, max: 200 },
    { key: 'premium', label: '$200+', min: 200, max: 9999 },
  ];

  const sortOptions = [
    { key: 'recommended', label: 'AI Recommended', icon: 'auto-awesome' },
    { key: 'price-low', label: 'Price: Low to High', icon: 'arrow-upward' },
    { key: 'price-high', label: 'Price: High to Low', icon: 'arrow-downward' },
    { key: 'rating', label: 'Highest Rated', icon: 'star' },
    { key: 'trending', label: 'Trending Now', icon: 'trending-up' },
  ];

  // Initialize animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Filter and sort recommendations
  const getFilteredRecommendations = () => {
    let filtered = recommendations.filter(item => {
      const categoryMatch = selectedCategory === 'all' || item.category === selectedCategory;
      const priceMatch = priceRange === 'all' || 
        (item.price >= priceRanges.find(r => r.key === priceRange).min &&
         item.price <= priceRanges.find(r => r.key === priceRange).max);
      return categoryMatch && priceMatch;
    });

    // Sort recommendations
    switch (sortBy) {
      case 'recommended':
        filtered.sort((a, b) => b.aiScore - a.aiScore);
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'trending':
        filtered.sort((a, b) => b.trending - a.trending);
        break;
    }

    return filtered;
  };

  const filteredRecommendations = getFilteredRecommendations();

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setLoading(true);
    // Simulate AI recommendation refresh
    setTimeout(() => {
      setRefreshing(false);
      setLoading(false);
      Vibration.vibrate(50);
      Alert.alert('🤖 AI Updated!', 'Recommendations refreshed based on your latest activity.');
    }, 2000);
  }, []);

  // Toggle wishlist
  const toggleWishlist = (gearId) => {
    setWishlist(prev => {
      const isWishlisted = prev.includes(gearId);
      Vibration.vibrate(50);
      
      if (isWishlisted) {
        return prev.filter(id => id !== gearId);
      } else {
        Alert.alert('❤️ Added to Wishlist!', 'Item saved for later viewing.');
        return [...prev, gearId];
      }
    });
  };

  // Handle purchase
  const handlePurchase = (gear) => {
    Alert.alert(
      '🛒 External Purchase',
      `You'll be redirected to ${gear.brand} to complete your purchase. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Continue',
          onPress: () => {
            Vibration.vibrate(100);
            // Simulate external link opening
            Alert.alert('🚀 Redirecting...', 'Opening in your browser shortly!');
            // In real app: Linking.openURL(gear.affiliateLink);
          }
        }
      ]
    );
  };

  const renderRecommendationCard = ({ item, index }) => (
    <Animated.View 
      style={[
        styles.cardContainer,
        {
          opacity: fadeAnim,
          transform: [
            { scale: scaleAnim },
            { translateY: slideAnim }
          ]
        }
      ]}
    >
      <Card style={styles.gearCard} onPress={() => setSelectedGear(item)}>
        {item.trending && (
          <View style={styles.trendingBadge}>
            <Icon name="trending-up" size={14} color="white" />
            <Text style={styles.trendingText}>TRENDING</Text>
          </View>
        )}
        
        {item.discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{item.discount}%</Text>
          </View>
        )}

        <Card.Content style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.gearImageContainer}>
              <Text style={styles.gearImage}>{item.image}</Text>
              <View style={styles.aiScoreContainer}>
                <Icon name="auto-awesome" size={12} color={COLORS.primary} />
                <Text style={styles.aiScore}>{item.aiScore}</Text>
              </View>
            </View>
            
            <View style={styles.gearInfo}>
              <Text style={styles.gearBrand}>{item.brand}</Text>
              <Text style={styles.gearName}>{item.name}</Text>
              <Text style={styles.gearType}>{item.type}</Text>
              
              <View style={styles.ratingRow}>
                <View style={styles.starsContainer}>
                  {[...Array(5)].map((_, i) => (
                    <Icon
                      key={i}
                      name="star"
                      size={14}
                      color={i < Math.floor(item.rating) ? '#f39c12' : '#bdc3c7'}
                    />
                  ))}
                </View>
                <Text style={styles.ratingText}>{item.rating}</Text>
                <Text style={styles.reviewsText}>({item.reviews})</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.wishlistButton}
              onPress={() => toggleWishlist(item.id)}
            >
              <Icon 
                name={wishlist.includes(item.id) ? "favorite" : "favorite-border"}
                size={24}
                color={wishlist.includes(item.id) ? COLORS.error : COLORS.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.aiInsight}>
            <Icon name="psychology" size={16} color={COLORS.primary} />
            <Text style={styles.matchReason}>{item.matchReason}</Text>
          </View>

          <View style={styles.tagsContainer}>
            {item.tags.slice(0, 3).map(tag => (
              <Chip 
                key={tag}
                mode="outlined"
                compact
                style={styles.tag}
                textStyle={styles.tagText}
              >
                {tag}
              </Chip>
            ))}
          </View>

          <View style={styles.priceSection}>
            <View style={styles.priceRow}>
              <Text style={styles.currentPrice}>${item.price}</Text>
              {item.originalPrice > item.price && (
                <Text style={styles.originalPrice}>${item.originalPrice}</Text>
              )}
            </View>
            
            <View style={styles.stockInfo}>
              <View style={[styles.stockIndicator, { backgroundColor: item.inStock ? COLORS.success : COLORS.error }]} />
              <Text style={[styles.stockText, { color: item.inStock ? COLORS.success : COLORS.error }]}>
                {item.inStock ? 'In Stock' : 'Out of Stock'}
              </Text>
              {item.freeShipping && (
                <Text style={styles.shippingText}>🚚 Free Shipping</Text>
              )}
            </View>
          </View>

          <View style={styles.cardActions}>
            <Button
              mode="contained"
              style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
              onPress={() => handlePurchase(item)}
              disabled={!item.inStock}
            >
              {item.inStock ? 'Buy Now' : 'Notify Me'}
            </Button>
            <Button
              mode="outlined"
              style={styles.detailsButton}
              onPress={() => setSelectedGear(item)}
            >
              Details
            </Button>
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderStatsHeader = () => (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.statsHeader}>
      <View style={styles.statsContent}>
        <View style={styles.statItem}>
          <Icon name="auto-awesome" size={24} color="white" />
          <Text style={styles.statValue}>{filteredRecommendations.length}</Text>
          <Text style={styles.statLabel}>AI Picks</Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="favorite" size={24} color="white" />
          <Text style={styles.statValue}>{wishlist.length}</Text>
          <Text style={styles.statLabel}>Wishlist</Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="trending-up" size={24} color="white" />
          <Text style={styles.statValue}>
            {recommendations.filter(r => r.trending).length}
          </Text>
          <Text style={styles.statLabel}>Trending</Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="local-offer" size={24} color="white" />
          <Text style={styles.statValue}>
            {recommendations.filter(r => r.discount > 0).length}
          </Text>
          <Text style={styles.statLabel}>On Sale</Text>
        </View>
      </View>
    </LinearGradient>
  );

  const FilterModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFilters(false)}
    >
      <BlurView intensity={20} style={styles.modalOverlay}>
        <Surface style={styles.filterModal}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>🔍 Filter & Sort</Text>
            <IconButton
              icon="close"
              onPress={() => setShowFilters(false)}
            />
          </View>

          <ScrollView style={styles.filterContent}>
            <Text style={styles.filterSectionTitle}>Price Range</Text>
            <View style={styles.filterOptions}>
              {priceRanges.map(range => (
                <TouchableOpacity
                  key={range.key}
                  style={[
                    styles.filterOption,
                    { backgroundColor: priceRange === range.key ? COLORS.primary : 'white' }
                  ]}
                  onPress={() => setPriceRange(range.key)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    { color: priceRange === range.key ? 'white' : COLORS.text }
                  ]}>
                    {range.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.filterSectionTitle}>Sort By</Text>
            <View style={styles.filterOptions}>
              {sortOptions.map(option => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.filterOption,
                    { backgroundColor: sortBy === option.key ? COLORS.primary : 'white' }
                  ]}
                  onPress={() => setSortBy(option.key)}
                >
                  <Icon 
                    name={option.icon} 
                    size={20} 
                    color={sortBy === option.key ? 'white' : COLORS.text}
                  />
                  <Text style={[
                    styles.filterOptionText,
                    { color: sortBy === option.key ? 'white' : COLORS.text, marginLeft: 8 }
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button
              mode="contained"
              onPress={() => setShowFilters(false)}
              style={styles.applyFiltersButton}
            >
              Apply Filters
            </Button>
          </ScrollView>
        </Surface>
      </BlurView>
    </Modal>
  );

  const GearDetailModal = () => (
    <Modal
      visible={!!selectedGear}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setSelectedGear(null)}
    >
      {selectedGear && (
        <BlurView intensity={20} style={styles.modalOverlay}>
          <Surface style={styles.detailModal}>
            <View style={styles.detailHeader}>
              <Text style={styles.detailTitle}>{selectedGear.name}</Text>
              <IconButton
                icon="close"
                onPress={() => setSelectedGear(null)}
              />
            </View>

            <ScrollView style={styles.detailContent}>
              <View style={styles.detailImageSection}>
                <Text style={styles.detailImage}>{selectedGear.image}</Text>
                <View style={styles.detailBadges}>
                  <Chip style={styles.aiScoreChip}>
                    <Icon name="auto-awesome" size={14} color={COLORS.primary} />
                    <Text style={styles.aiScoreChipText}> AI Score: {selectedGear.aiScore}</Text>
                  </Chip>
                  {selectedGear.trending && (
                    <Chip style={styles.trendingChip}>🔥 Trending</Chip>
                  )}
                </View>
              </View>

              <Text style={styles.detailBrand}>{selectedGear.brand}</Text>
              <Text style={styles.detailType}>{selectedGear.type}</Text>
              <Text style={styles.detailMatch}>🤖 {selectedGear.matchReason}</Text>

              <View style={styles.detailPriceSection}>
                <Text style={styles.detailCurrentPrice}>${selectedGear.price}</Text>
                {selectedGear.originalPrice > selectedGear.price && (
                  <Text style={styles.detailOriginalPrice}>${selectedGear.originalPrice}</Text>
                )}
              </View>

              <Text style={styles.sectionHeader}>✨ Key Features</Text>
              {selectedGear.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Icon name="check-circle" size={16} color={COLORS.success} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}

              <Text style={styles.sectionHeader}>👍 Pros</Text>
              {selectedGear.pros.map((pro, index) => (
                <View key={index} style={styles.proItem}>
                  <Text style={styles.proText}>• {pro}</Text>
                </View>
              ))}

              <Text style={styles.sectionHeader}>👎 Cons</Text>
              {selectedGear.cons.map((con, index) => (
                <View key={index} style={styles.conItem}>
                  <Text style={styles.conText}>• {con}</Text>
                </View>
              ))}

              <View style={styles.detailActions}>
                <Button
                  mode="contained"
                  style={styles.detailBuyButton}
                  onPress={() => {
                    setSelectedGear(null);
                    handlePurchase(selectedGear);
                  }}
                  disabled={!selectedGear.inStock}
                >
                  {selectedGear.inStock ? `Buy Now - $${selectedGear.price}` : 'Out of Stock'}
                </Button>
                <Button
                  mode="outlined"
                  style={styles.detailWishlistButton}
                  onPress={() => toggleWishlist(selectedGear.id)}
                  icon={wishlist.includes(selectedGear.id) ? "favorite" : "favorite-border"}
                >
                  {wishlist.includes(selectedGear.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                </Button>
              </View>
            </ScrollView>
          </Surface>
        </BlurView>
      )}
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>🤖 AI Gear Recommendations</Text>
          <Text style={styles.headerSubtitle}>Personalized picks for your fitness journey</Text>
        </View>
      </LinearGradient>

      <Animated.View style={[styles.content, { transform: [{ translateY: slideAnim }] }]}>
        {renderStatsHeader()}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map(category => (
            <TouchableOpacity
              key={category.key}
              style={[
                styles.categoryButton,
                { backgroundColor: selectedCategory === category.key ? category.color : 'white' }
              ]}
              onPress={() => setSelectedCategory(category.key)}
            >
              <Icon 
                name={category.icon} 
                size={20} 
                color={selectedCategory === category.key ? 'white' : category.color} 
              />
              <Text style={[
                styles.categoryButtonText,
                { color: selectedCategory === category.key ? 'white' : category.color }
              ]}>
                {category.label}
              </Text>
              <Badge 
                style={[
                  styles.categoryBadge,
                  { backgroundColor: selectedCategory === category.key ? 'rgba(255,255,255,0.3)' : category.color }
                ]}
              >
                {category.count}
              </Badge>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.controlsRow}>
          <Button
            mode="outlined"
            onPress={() => setShowFilters(true)}
            style={styles.filterButton}
            icon="tune"
          >
            Filters
          </Button>
          <Text style={styles.resultsCount}>
            {filteredRecommendations.length} recommendations
          </Text>
        </View>

        <ScrollView
          style={styles.scrollContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <Icon name="auto-awesome" size={60} color={COLORS.primary} />
              <Text style={styles.loadingText}>🤖 AI is analyzing your preferences...</Text>
              <ProgressBar 
                indeterminate 
                color={COLORS.primary}
                style={styles.loadingBar}
              />
            </View>
          ) : (
            <FlatList
              data={filteredRecommendations}
              renderItem={renderRecommendationCard}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
            />
          )}

          {!loading && filteredRecommendations.length === 0 && (
            <View style={styles.emptyState}>
              <Icon name="search-off" size={80} color="#bdc3c7" />
              <Text style={styles.emptyTitle}>No Recommendations Found</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your filters or let our AI analyze more of your workout data
              </Text>
              <Button
                mode="contained"
                onPress={onRefresh}
                style={styles.refreshButton}
                icon="refresh"
              >
                Refresh Recommendations
              </Button>
            </View>
          )}
        </ScrollView>
      </Animated.View>

      <FAB
        style={[styles.fab, { backgroundColor: COLORS.primary }]}
        icon="favorite"
        onPress={() => {
          if (wishlist.length > 0) {
            Alert.alert(
              '❤️ Your Wishlist',
              `You have ${wishlist.length} item${wishlist.length > 1 ? 's' : ''} saved. View wishlist?`,
              [
                { text: 'Later', style: 'cancel' },
                { text: 'View Wishlist', onPress: () => navigation.navigate('Wishlist') }
              ]
            );
          } else {
            Alert.alert('💡 Tip', 'Add items to your wishlist by tapping the heart icon on any recommendation!');
          }
        }}
        color="white"
      />

      <FilterModal />
      <GearDetailModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    marginTop: -10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: COLORS.background,
  },
  statsHeader: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  statsContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: 'bold',
    marginTop: 4,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  categoriesContainer: {
    marginBottom: SPACING.md,
  },
  categoriesContent: {
    paddingHorizontal: SPACING.md,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 25,
    marginRight: SPACING.sm,
    elevation: 2,
  },
  categoryButtonText: {
    ...TEXT_STYLES.caption,
    marginLeft: 4,
    fontWeight: '600',
  },
  categoryBadge: {
    marginLeft: 6,
    minWidth: 20,
    height: 20,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  filterButton: {
    borderColor: COLORS.primary,
  },
  resultsCount: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  scrollContainer: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 100,
  },
  cardContainer: {
    marginBottom: SPACING.lg,
  },
  gearCard: {
    elevation: 4,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 0,
  },
  trendingBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#e74c3c',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  trendingText: {
    ...TEXT_STYLES.caption,
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 2,
    fontSize: 10,
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: COLORS.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  discountText: {
    ...TEXT_STYLES.caption,
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    padding: SPACING.md,
    alignItems: 'flex-start',
  },
  gearImageContainer: {
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  gearImage: {
    fontSize: 48,
    marginBottom: 4,
  },
  aiScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  aiScore: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginLeft: 2,
    fontSize: 10,
  },
  gearInfo: {
    flex: 1,
  },
  gearBrand: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  gearName: {
    ...TEXT_STYLES.h4,
    color: COLORS.text,
    marginTop: 2,
    marginBottom: 4,
  },
  gearType: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 6,
  },
  ratingText: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    marginRight: 4,
  },
  reviewsText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  wishlistButton: {
    marginTop: -8,
  },
  aiInsight: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(102, 126, 234, 0.05)',
    margin: SPACING.md,
    marginTop: 0,
    padding: SPACING.sm,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  matchReason: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    marginLeft: 8,
    flex: 1,
    fontStyle: 'italic',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  tag: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
    height: 28,
  },
  tagText: {
    fontSize: 11,
  },
  priceSection: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  currentPrice: {
    ...TEXT_STYLES.h3,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  originalPrice: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  stockIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  stockText: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    marginRight: 12,
  },
  shippingText: {
    ...TEXT_STYLES.caption,
    color: COLORS.success,
    fontWeight: '500',
  },
  cardActions: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  actionButton: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  detailsButton: {
    borderColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    elevation: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    ...TEXT_STYLES.h4,
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  loadingBar: {
    width: width * 0.6,
    height: 4,
    borderRadius: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: SPACING.lg,
  },
  emptyTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  refreshButton: {
    paddingHorizontal: SPACING.lg,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  filterModal: {
    width: '90%',
    maxHeight: '70%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.primary,
  },
  filterTitle: {
    ...TEXT_STYLES.h3,
    color: 'white',
  },
  filterContent: {
    padding: SPACING.lg,
  },
  filterSectionTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.text,
    marginBottom: SPACING.md,
    marginTop: SPACING.md,
  },
  filterOptions: {
    marginBottom: SPACING.lg,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  filterOptionText: {
    ...TEXT_STYLES.body,
    fontWeight: '500',
  },
  applyFiltersButton: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  detailModal: {
    width: '95%',
    maxHeight: '90%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.primary,
  },
  detailTitle: {
    ...TEXT_STYLES.h3,
    color: 'white',
    flex: 1,
  },
  detailContent: {
    padding: SPACING.lg,
  },
  detailImageSection: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  detailImage: {
    fontSize: 80,
    marginBottom: SPACING.md,
  },
  detailBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  aiScoreChip: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    marginRight: SPACING.sm,
  },
  aiScoreChipText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  trendingChip: {
    backgroundColor: '#ffebee',
  },
  detailBrand: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  detailType: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  detailMatch: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: SPACING.lg,
  },
  detailPriceSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  detailCurrentPrice: {
    ...TEXT_STYLES.h1,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  detailOriginalPrice: {
    ...TEXT_STYLES.h3,
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
    marginLeft: SPACING.sm,
  },
  sectionHeader: {
    ...TEXT_STYLES.h4,
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  featureText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  proItem: {
    marginBottom: SPACING.xs,
  },
  proText: {
    ...TEXT_STYLES.body,
    color: COLORS.success,
  },
  conItem: {
    marginBottom: SPACING.xs,
  },
  conText: {
    ...TEXT_STYLES.body,
    color: COLORS.error,
  },
  detailActions: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
  },
  detailBuyButton: {
    marginBottom: SPACING.md,
  },
  detailWishlistButton: {
    borderColor: COLORS.primary,
  },
});

export default GearRecommendations;