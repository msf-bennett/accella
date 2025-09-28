import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Image,
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
  ProgressBar,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';

// Import your constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const SecondHandGear = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [savedItems, setSavedItems] = useState(new Set());
  const [messagesCount, setMessagesCount] = useState(3);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-50));
  const scrollY = useRef(new Animated.Value(0)).current;
  
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  
  // Sample second-hand gear data
  const [gearData, setGearData] = useState([
    {
      id: '1',
      title: 'Professional Treadmill - NordicTrack',
      category: 'Cardio',
      type: 'equipment',
      price: 850,
      originalPrice: 1200,
      condition: 'Good',
      conditionScore: 7,
      seller: 'FitLifeGym',
      sellerRating: 4.8,
      sellerReviews: 145,
      location: 'Los Angeles, CA',
      distance: '2.3 mi',
      image: 'directions-run',
      images: ['treadmill1.jpg', 'treadmill2.jpg', 'treadmill3.jpg'],
      description: 'Barely used NordicTrack treadmill with iFit technology. Great condition, selling due to gym upgrade.',
      features: ['iFit Compatible', '3.5 HP Motor', 'Incline/Decline', 'Heart Rate Monitor'],
      specifications: {
        brand: 'NordicTrack',
        model: 'Commercial 1750',
        year: '2022',
        usage: '6 months',
        warranty: '2 years remaining'
      },
      negotiable: true,
      fastPickup: true,
      verified: true,
      postedDate: '3 days ago',
      views: 124,
      interested: 8,
      tags: ['Popular', 'Great Deal', 'Negotiable'],
    },
    {
      id: '2',
      title: 'Olympic Barbell Set - 300lbs',
      category: 'Weights',
      type: 'equipment',
      price: 425,
      originalPrice: 650,
      condition: 'Excellent',
      conditionScore: 9,
      seller: 'PowerLifter_Mike',
      sellerRating: 4.9,
      sellerReviews: 67,
      location: 'New York, NY',
      distance: '1.8 mi',
      image: 'fitness-center',
      images: ['barbell1.jpg', 'barbell2.jpg'],
      description: 'Complete Olympic barbell set with plates. Excellent condition, barely used. Moving sale!',
      features: ['Olympic Standard', 'Rubber Plates', '7ft Barbell', 'Chrome Sleeves'],
      specifications: {
        brand: 'Rep Fitness',
        weight: '300 lbs total',
        barbell: '45 lbs',
        plates: '2x45, 2x35, 2x25, 2x10, 2x5',
        condition: 'Like new'
      },
      negotiable: false,
      fastPickup: true,
      verified: true,
      postedDate: '1 day ago',
      views: 89,
      interested: 12,
      tags: ['Excellent', 'Fast Pickup', 'Complete Set'],
    },
    {
      id: '3',
      title: 'Adjustable Dumbbells - Bowflex',
      category: 'Weights',
      type: 'equipment',
      price: 320,
      originalPrice: 450,
      condition: 'Good',
      conditionScore: 7,
      seller: 'HomeFitness_Store',
      sellerRating: 4.6,
      sellerReviews: 203,
      location: 'Chicago, IL',
      distance: '5.1 mi',
      image: 'fitness-center',
      images: ['dumbbells1.jpg'],
      description: 'Bowflex SelectTech adjustable dumbbells. Some wear but fully functional. Great space saver!',
      features: ['5-52.5 lbs each', 'Quick Adjust', 'Space Saving', 'Bowflex App'],
      specifications: {
        brand: 'Bowflex',
        model: 'SelectTech 552',
        weight: '5-52.5 lbs each',
        year: '2021',
        usage: '1 year'
      },
      negotiable: true,
      fastPickup: false,
      verified: true,
      postedDate: '5 days ago',
      views: 67,
      interested: 5,
      tags: ['Adjustable', 'Space Saver'],
    },
    {
      id: '4',
      title: 'Spin Bike - Peloton Style',
      category: 'Cardio',
      type: 'equipment',
      price: 680,
      originalPrice: 1000,
      condition: 'Very Good',
      conditionScore: 8,
      seller: 'CycleEnthusiast',
      sellerRating: 4.7,
      sellerReviews: 34,
      location: 'Austin, TX',
      distance: '3.7 mi',
      image: 'directions-bike',
      images: ['bike1.jpg', 'bike2.jpg'],
      description: 'High-quality spin bike with digital display. Smooth belt drive, very quiet operation.',
      features: ['Belt Drive', 'Digital Display', 'Adjustable Seat', 'Heart Rate Sensors'],
      specifications: {
        brand: 'Sunny Health',
        model: 'SF-B1805',
        flywheel: '40 lbs',
        resistance: 'Magnetic',
        warranty: '1 year remaining'
      },
      negotiable: true,
      fastPickup: true,
      verified: false,
      postedDate: '2 days ago',
      views: 156,
      interested: 15,
      tags: ['Quiet', 'Belt Drive', 'Popular'],
    },
    {
      id: '5',
      title: 'Power Rack with Lat Pulldown',
      category: 'Strength',
      type: 'equipment',
      price: 1200,
      originalPrice: 1800,
      condition: 'Good',
      conditionScore: 7,
      seller: 'IronTemple_Gym',
      sellerRating: 4.9,
      sellerReviews: 89,
      location: 'Miami, FL',
      distance: '12.4 mi',
      image: 'fitness-center',
      images: ['rack1.jpg', 'rack2.jpg', 'rack3.jpg'],
      description: 'Commercial-grade power rack with lat pulldown attachment. Perfect for home gym setup.',
      features: ['Commercial Grade', 'Lat Pulldown', 'Pull-up Bars', 'Safety Bars'],
      specifications: {
        brand: 'Titan Fitness',
        model: 'T-3 Power Rack',
        height: '83 inches',
        depth: '48 inches',
        weight: '280 lbs'
      },
      negotiable: true,
      fastPickup: false,
      verified: true,
      postedDate: '1 week ago',
      views: 234,
      interested: 22,
      tags: ['Commercial Grade', 'Complete Setup'],
    },
    {
      id: '6',
      title: 'Yoga Mat Bundle - Premium',
      category: 'Accessories',
      type: 'equipment',
      price: 45,
      originalPrice: 80,
      condition: 'Like New',
      conditionScore: 9,
      seller: 'YogaLifestyle',
      sellerRating: 4.8,
      sellerReviews: 156,
      location: 'San Francisco, CA',
      distance: '0.8 mi',
      image: 'self-improvement',
      images: ['yoga1.jpg'],
      description: 'Premium yoga mat bundle with blocks, strap, and carrying case. Barely used, excellent condition.',
      features: ['6mm Thickness', 'Non-slip', 'Eco-friendly', 'Complete Bundle'],
      specifications: {
        brand: 'Liforme',
        material: 'Natural Rubber',
        size: '72" x 24"',
        thickness: '6mm',
        includes: 'Mat, 2 blocks, strap, case'
      },
      negotiable: false,
      fastPickup: true,
      verified: true,
      postedDate: '4 days ago',
      views: 43,
      interested: 7,
      tags: ['Like New', 'Bundle Deal', 'Eco-friendly'],
    },
  ]);

  const categories = [
    { key: 'all', label: 'All Items', icon: 'view-list', count: gearData.length },
    { key: 'Cardio', label: 'Cardio', icon: 'directions-run', count: gearData.filter(g => g.category === 'Cardio').length },
    { key: 'Weights', label: 'Weights', icon: 'fitness-center', count: gearData.filter(g => g.category === 'Weights').length },
    { key: 'Strength', label: 'Strength', icon: 'fitness-center', count: gearData.filter(g => g.category === 'Strength').length },
    { key: 'Accessories', label: 'Accessories', icon: 'sports-gymnastics', count: gearData.filter(g => g.category === 'Accessories').length },
  ];

  const conditions = [
    { key: 'all', label: 'Any Condition', score: 0 },
    { key: 'excellent', label: 'Like New (9-10)', score: 9 },
    { key: 'very_good', label: 'Very Good (8)', score: 8 },
    { key: 'good', label: 'Good (6-7)', score: 6 },
    { key: 'fair', label: 'Fair (4-5)', score: 4 },
  ];

  const priceRanges = [
    { key: 'all', label: 'Any Price', min: 0, max: Infinity },
    { key: 'under_100', label: 'Under $100', min: 0, max: 100 },
    { key: '100_300', label: '$100 - $300', min: 100, max: 300 },
    { key: '300_600', label: '$300 - $600', min: 300, max: 600 },
    { key: '600_1000', label: '$600 - $1000', min: 600, max: 1000 },
    { key: 'over_1000', label: 'Over $1000', min: 1000, max: Infinity },
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
    setTimeout(() => {
      setRefreshing(false);
      Vibration.vibrate(50);
      Alert.alert('Updated! 🔄', 'Found 2 new listings in your area!');
    }, 2000);
  }, []);

  const filteredGear = gearData.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.seller.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    
    const matchesCondition = selectedCondition === 'all' || 
                           (selectedCondition === 'excellent' && item.conditionScore >= 9) ||
                           (selectedCondition === 'very_good' && item.conditionScore === 8) ||
                           (selectedCondition === 'good' && item.conditionScore >= 6 && item.conditionScore < 8) ||
                           (selectedCondition === 'fair' && item.conditionScore >= 4 && item.conditionScore < 6);
    
    const priceRange = priceRanges.find(range => range.key === selectedPriceRange);
    const matchesPrice = !priceRange || (item.price >= priceRange.min && item.price <= priceRange.max);
    
    return matchesSearch && matchesCategory && matchesCondition && matchesPrice;
  });

  const toggleSaved = (itemId) => {
    const newSaved = new Set(savedItems);
    if (newSaved.has(itemId)) {
      newSaved.delete(itemId);
    } else {
      newSaved.add(itemId);
      Vibration.vibrate(50);
    }
    setSavedItems(newSaved);
  };

  const handleMessage = (item) => {
    Vibration.vibrate(100);
    Alert.alert(
      'Message Seller 💬',
      `Send message to ${item.seller} about "${item.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Message',
          onPress: () => {
            setMessagesCount(prev => prev + 1);
            Alert.alert('Message Sent! ✉️', 'Your message has been sent to the seller.');
          }
        }
      ]
    );
  };

  const handleMakeOffer = (item) => {
    if (!item.negotiable) {
      Alert.alert('Fixed Price', 'This item has a fixed price and is not negotiable.');
      return;
    }
    
    Alert.alert(
      'Make an Offer 💰',
      `Current price: $${item.price}\nWhat's your offer?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: '$' + Math.round(item.price * 0.8), onPress: () => handleOfferSubmit(item, item.price * 0.8) },
        { text: '$' + Math.round(item.price * 0.9), onPress: () => handleOfferSubmit(item, item.price * 0.9) },
        { text: 'Custom', onPress: () => Alert.alert('Feature Coming Soon!', 'Custom offer input will be available soon.') }
      ]
    );
  };

  const handleOfferSubmit = (item, offerAmount) => {
    Vibration.vibrate(100);
    Alert.alert('Offer Sent! 🤝', `Your offer of $${Math.round(offerAmount)} has been sent to ${item.seller}.`);
  };

  const getConditionColor = (score) => {
    if (score >= 9) return COLORS.success;
    if (score >= 7) return COLORS.warning;
    return COLORS.error;
  };

  const getConditionText = (score) => {
    if (score >= 9) return 'Like New';
    if (score === 8) return 'Very Good';
    if (score >= 6) return 'Good';
    return 'Fair';
  };

  const renderGearCard = ({ item, index }) => {
    const savings = (item.originalPrice - item.price).toFixed(0);
    const savingsPercent = Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100);
    const isSaved = savedItems.has(item.id);
    
    return (
      <Animated.View style={[
        styles.cardContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}>
        <Card style={styles.gearCard} elevation={3}>
          <TouchableOpacity
            onPress={() => Alert.alert('View Details', `Full details for "${item.title}" coming soon!`)}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['rgba(102, 126, 234, 0.05)', 'transparent']}
              style={styles.cardGradient}
            >
              <View style={styles.cardHeader}>
                <View style={styles.headerLeft}>
                  <View style={styles.savingsBadge}>
                    <Text style={styles.savingsText}>Save ${savings}</Text>
                  </View>
                  <Chip
                    mode="flat"
                    style={[styles.conditionChip, { backgroundColor: getConditionColor(item.conditionScore) }]}
                    textStyle={styles.conditionText}
                  >
                    {getConditionText(item.conditionScore)}
                  </Chip>
                </View>
                <View style={styles.headerRight}>
                  <IconButton
                    icon={isSaved ? 'bookmark' : 'bookmark-border'}
                    size={20}
                    iconColor={isSaved ? COLORS.primary : COLORS.textSecondary}
                    onPress={() => toggleSaved(item.id)}
                    style={styles.saveButton}
                  />
                  {item.verified && (
                    <MaterialIcons name="verified" size={20} color={COLORS.success} />
                  )}
                </View>
              </View>

              <View style={styles.gearContent}>
                <Avatar.Icon
                  size={70}
                  icon={item.image}
                  style={[styles.gearImage, { backgroundColor: COLORS.primary }]}
                />
                
                <View style={styles.gearInfo}>
                  <Text style={styles.gearTitle} numberOfLines={2}>{item.title}</Text>
                  <Text style={styles.gearCategory}>{item.category}</Text>
                  
                  <View style={styles.sellerInfo}>
                    <MaterialIcons name="person" size={14} color={COLORS.textSecondary} />
                    <Text style={styles.sellerText}>{item.seller}</Text>
                    <View style={styles.sellerRating}>
                      <MaterialIcons name="star" size={12} color="#FFD700" />
                      <Text style={styles.ratingText}>{item.sellerRating}</Text>
                    </View>
                  </View>

                  <View style={styles.locationInfo}>
                    <MaterialIcons name="location-on" size={14} color={COLORS.textSecondary} />
                    <Text style={styles.locationText}>{item.location}</Text>
                    <Text style={styles.distanceText}>• {item.distance}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.priceSection}>
                <View style={styles.priceInfo}>
                  <Text style={styles.currentPrice}>${item.price}</Text>
                  <Text style={styles.originalPrice}>${item.originalPrice}</Text>
                  <Text style={styles.discountPercent}>({savingsPercent}% off)</Text>
                </View>
                
                <View style={styles.itemStats}>
                  <View style={styles.statItem}>
                    <MaterialIcons name="visibility" size={14} color={COLORS.textSecondary} />
                    <Text style={styles.statText}>{item.views}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <MaterialIcons name="favorite" size={14} color={COLORS.error} />
                    <Text style={styles.statText}>{item.interested}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.conditionBar}>
                <Text style={styles.conditionLabel}>Condition:</Text>
                <ProgressBar
                  progress={item.conditionScore / 10}
                  color={getConditionColor(item.conditionScore)}
                  style={styles.conditionProgress}
                />
                <Text style={styles.conditionScore}>{item.conditionScore}/10</Text>
              </View>

              <View style={styles.featuresSection}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {item.features.slice(0, 3).map((feature, idx) => (
                    <Chip
                      key={idx}
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
                {item.tags.map((tag, idx) => (
                  <Chip
                    key={idx}
                    mode="flat"
                    compact
                    style={styles.tag}
                    textStyle={styles.tagText}
                  >
                    {tag}
                  </Chip>
                ))}
                {item.negotiable && (
                  <Chip
                    mode="flat"
                    compact
                    style={[styles.tag, styles.negotiableTag]}
                    textStyle={styles.negotiableText}
                  >
                    Negotiable
                  </Chip>
                )}
              </View>

              <View style={styles.timeInfo}>
                <Text style={styles.postedTime}>Posted {item.postedDate}</Text>
                {item.fastPickup && (
                  <View style={styles.fastPickup}>
                    <MaterialIcons name="schedule" size={14} color={COLORS.success} />
                    <Text style={styles.fastPickupText}>Fast Pickup</Text>
                  </View>
                )}
              </View>

              <Divider style={styles.divider} />

              <View style={styles.actionsSection}>
                <Button
                  mode="outlined"
                  onPress={() => handleMessage(item)}
                  style={styles.actionButton}
                  icon="message"
                  compact
                >
                  Message
                </Button>
                
                <Button
                  mode="contained"
                  onPress={() => handleMakeOffer(item)}
                  style={[styles.actionButton, styles.offerButton]}
                  buttonColor={item.negotiable ? COLORS.primary : COLORS.textSecondary}
                  disabled={!item.negotiable}
                  icon="handshake"
                  compact
                >
                  {item.negotiable ? 'Make Offer' : 'Fixed Price'}
                </Button>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Card>
      </Animated.View>
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

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.headerGradient}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Second-Hand Gear 🏋️</Text>
              <Text style={styles.headerSubtitle}>Find quality used equipment nearby</Text>
            </View>
            <View style={styles.headerActions}>
              <IconButton
                icon="filter-list"
                size={24}
                iconColor="white"
                onPress={() => setShowFiltersModal(true)}
                style={styles.headerButton}
              />
              <View style={styles.messagesContainer}>
                <IconButton
                  icon="message"
                  size={24}
                  iconColor="white"
                  onPress={() => Alert.alert('Messages', `You have ${messagesCount} active conversations`)}
                  style={styles.headerButton}
                />
                {messagesCount > 0 && (
                  <Badge style={styles.messagesBadge}>{messagesCount}</Badge>
                )}
              </View>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search equipment, brands, sellers..."
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
        {filteredGear.length === 0 ? (
          <Surface style={styles.emptyState}>
            <MaterialIcons name="search-off" size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyTitle}>No Items Found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Try adjusting your search or filters' : 'Check back later for new listings!'}
            </Text>
            <Button
              mode="contained"
              onPress={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedCondition('all');
                setSelectedPriceRange('all');
              }}
              style={styles.clearFiltersButton}
              buttonColor={COLORS.primary}
            >
              Clear All Filters
            </Button>
          </Surface>
        ) : (
          <FlatList
            data={filteredGear}
            renderItem={renderGearCard}
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
            contentContainerStyle={styles.gearContainer}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: false }
            )}
          />
        )}
      </Animated.View>

      <Portal>
        <Modal
          visible={showFiltersModal}
          onDismiss={() => setShowFiltersModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView
            style={styles.modalBlur}
            blurType="light"
            blurAmount={10}
          >
            <Surface style={styles.modalContent}>
              <Text style={styles.modalTitle}>Filter Items</Text>
              
              <Text style={styles.filterSectionTitle}>Condition:</Text>
              {conditions.map((condition) => (
                <TouchableOpacity
                  key={condition.key}
                  style={[
                    styles.filterOption,
                    selectedCondition === condition.key && styles.selectedFilter
                  ]}
                  onPress={() => setSelectedCondition(condition.key)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    selectedCondition === condition.key && styles.selectedFilterText
                  ]}>
                    {condition.label}
                  </Text>
                  {selectedCondition === condition.key && (
                    <MaterialIcons name="check" size={20} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              ))}
              
              <Text style={styles.filterSectionTitle}>Price Range:</Text>
              {priceRanges.map((range) => (
                <TouchableOpacity
                  key={range.key}
                  style={[
                    styles.filterOption,
                    selectedPriceRange === range.key && styles.selectedFilter
                  ]}
                  onPress={() => setSelectedPriceRange(range.key)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    selectedPriceRange === range.key && styles.selectedFilterText
                  ]}>
                    {range.label}
                  </Text>
                  {selectedPriceRange === range.key && (
                    <MaterialIcons name="check" size={20} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              ))}
              
              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={() => {
                    setSelectedCondition('all');
                    setSelectedPriceRange('all');
                  }}
                  style={styles.modalButton}
                >
                  Clear All
                </Button>
                <Button
                  mode="contained"
                  onPress={() => setShowFiltersModal(false)}
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
        icon="add"
        style={styles.fab}
        color="white"
        onPress={() => Alert.alert('Sell Your Gear! 💰', 'List your fitness equipment for sale. Feature coming soon!')}
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
    position: 'relative',
  },
  headerGradient: {
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
  messagesContainer: {
    position: 'relative',
  },
  messagesBadge: {
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
  gearContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100,
  },
  cardContainer: {
    marginBottom: SPACING.lg,
  },
  gearCard: {
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  savingsBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
    marginRight: SPACING.sm,
  },
  savingsText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  conditionChip: {
    height: 24,
  },
  conditionText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginRight: SPACING.sm,
  },
  gearContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  gearImage: {
    marginRight: SPACING.md,
  },
  gearInfo: {
    flex: 1,
  },
  gearTitle: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  gearCategory: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  sellerText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    color: COLORS.textSecondary,
  },
  sellerRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  ratingText: {
    ...TEXT_STYLES.caption,
    marginLeft: 2,
    fontWeight: 'bold',
    fontSize: 11,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  distanceText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 11,
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
  currentPrice: {
    ...TEXT_STYLES.h2,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginRight: SPACING.sm,
  },
  originalPrice: {
    ...TEXT_STYLES.body,
    textDecorationLine: 'line-through',
    color: COLORS.textSecondary,
    marginRight: SPACING.xs,
  },
  discountPercent: {
    ...TEXT_STYLES.caption,
    color: COLORS.success,
    fontWeight: 'bold',
  },
  itemStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SPACING.md,
  },
  statText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  conditionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  conditionLabel: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    marginRight: SPACING.sm,
    minWidth: 60,
  },
  conditionProgress: {
    flex: 1,
    height: 6,
    marginRight: SPACING.sm,
  },
  conditionScore: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    minWidth: 30,
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
  negotiableTag: {
    backgroundColor: COLORS.warning,
  },
  negotiableText: {
    color: 'white',
    fontWeight: 'bold',
  },
  timeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  postedTime: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  fastPickup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fastPickupText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    color: COLORS.success,
    fontWeight: 'bold',
    fontSize: 11,
  },
  divider: {
    marginVertical: SPACING.sm,
  },
  actionsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  offerButton: {
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
    marginBottom: SPACING.lg,
  },
  clearFiltersButton: {
    marginTop: SPACING.md,
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
    marginTop: SPACING.md,
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
    marginTop: SPACING.xl,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
});

export default SecondHandGear;