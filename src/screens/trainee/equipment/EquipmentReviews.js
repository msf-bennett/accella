import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  Dimensions,
  Animated,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import {
  Card,
  Text,
  Button,
  Chip,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Portal,
  Modal,
  TextInput,
  Searchbar,
  Divider,
  Rating,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from 'expo-blur';

// Import your design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#f44336',
  warning: '#ff9800',
  background: '#f8f9fa',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e0e0e0',
  gold: '#FFD700',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold' },
  h2: { fontSize: 24, fontWeight: 'bold' },
  h3: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16 },
  caption: { fontSize: 12 },
};

const { width } = Dimensions.get('window');

const EquipmentReviews = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);
  
  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('rating');
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  
  const [equipment, setEquipment] = useState([
    {
      id: 1,
      name: 'PowerTech Pro Dumbbells',
      category: 'Weights',
      brand: 'PowerTech',
      image: '🏋️',
      rating: 4.8,
      reviewCount: 324,
      priceRange: '$50-150',
      tags: ['Adjustable', 'Durable', 'Space-Saving'],
      description: 'Premium adjustable dumbbells perfect for home workouts',
      verified: true,
    },
    {
      id: 2,
      name: 'FlexiMat Yoga Mat Premium',
      category: 'Yoga',
      brand: 'FlexiMat',
      image: '🧘‍♀️',
      rating: 4.6,
      reviewCount: 198,
      priceRange: '$25-45',
      tags: ['Non-slip', 'Eco-friendly', 'Thick'],
      description: 'Ultra-grip yoga mat with superior cushioning',
      verified: true,
    },
    {
      id: 3,
      name: 'CardioMax Treadmill X1',
      category: 'Cardio',
      brand: 'CardioMax',
      image: '🏃‍♂️',
      rating: 4.3,
      reviewCount: 89,
      priceRange: '$800-1200',
      tags: ['Foldable', 'Bluetooth', 'Heart Rate Monitor'],
      description: 'Professional treadmill with advanced tracking features',
      verified: false,
    },
    {
      id: 4,
      name: 'ResistBand Pro Set',
      category: 'Resistance',
      brand: 'ResistBand',
      image: '💪',
      rating: 4.9,
      reviewCount: 456,
      priceRange: '$15-35',
      tags: ['Portable', 'Multiple Levels', 'Door Anchor'],
      description: 'Complete resistance band system for full-body workouts',
      verified: true,
    },
    {
      id: 5,
      name: 'StabilityCore Balance Ball',
      category: 'Core',
      brand: 'StabilityCore',
      image: '⚽',
      rating: 4.2,
      reviewCount: 167,
      priceRange: '$20-40',
      tags: ['Anti-burst', 'Size Options', 'Pump Included'],
      description: 'Professional-grade exercise ball for core strengthening',
      verified: true,
    },
  ]);

  const [reviews, setReviews] = useState([
    {
      id: 1,
      equipmentId: 1,
      userName: 'FitnessFan22',
      userAvatar: '👨‍💪',
      rating: 5,
      title: 'Excellent Quality & Durability! 💪',
      review: 'Been using these dumbbells for 6 months now. The weight adjustment is smooth and the grip is comfortable even during intense workouts. Worth every penny!',
      date: '2024-03-10',
      helpful: 45,
      verified: true,
      pros: ['Durable construction', 'Easy weight adjustment', 'Space-saving design'],
      cons: ['Slightly expensive', 'Heavy for storage'],
    },
    {
      id: 2,
      equipmentId: 1,
      userName: 'HomeGymHero',
      userAvatar: '👩‍🏋️',
      rating: 4,
      title: 'Great for home workouts',
      review: 'Perfect for my small apartment. The adjustable feature saves so much space. Only wish they had more weight options.',
      date: '2024-03-05',
      helpful: 23,
      verified: false,
      pros: ['Compact design', 'Quality materials'],
      cons: ['Limited weight range'],
    },
  ]);

  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    review: '',
    pros: [''],
    cons: [''],
  });

  const categories = ['All', 'Weights', 'Cardio', 'Yoga', 'Resistance', 'Core', 'Accessories'];
  const sortOptions = [
    { label: 'Highest Rated', value: 'rating' },
    { label: 'Most Reviews', value: 'reviews' },
    { label: 'Newest', value: 'newest' },
    { label: 'Price: Low to High', value: 'price_low' },
    { label: 'Price: High to Low', value: 'price_high' },
  ];

  useEffect(() => {
    // Entrance animations
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
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleWriteReview = () => {
    if (!newReview.title || !newReview.review) {
      Alert.alert('Missing Information', 'Please fill in the title and review');
      return;
    }

    const review = {
      id: Date.now(),
      equipmentId: selectedEquipment.id,
      userName: user?.name || 'Anonymous User',
      userAvatar: '👤',
      ...newReview,
      date: new Date().toISOString().split('T')[0],
      helpful: 0,
      verified: user?.verified || false,
    };

    setReviews(prev => [review, ...prev]);
    
    // Update equipment review count and rating
    setEquipment(prev => prev.map(item => 
      item.id === selectedEquipment.id 
        ? { 
            ...item, 
            reviewCount: item.reviewCount + 1,
            rating: ((item.rating * item.reviewCount + newReview.rating) / (item.reviewCount + 1)).toFixed(1)
          }
        : item
    ));

    setNewReview({
      rating: 5,
      title: '',
      review: '',
      pros: [''],
      cons: [''],
    });
    setShowWriteReview(false);
    setSelectedEquipment(null);

    Alert.alert('Success! 🎉', 'Your review has been posted and will help others make better equipment choices!');
  };

  const filteredEquipment = equipment.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedEquipment = [...filteredEquipment].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'reviews':
        return b.reviewCount - a.reviewCount;
      case 'newest':
        return b.id - a.id;
      default:
        return 0;
    }
  });

  const renderStars = (rating, size = 16) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Icon key={i} name="star" size={size} color={COLORS.gold} />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Icon key="half" name="star-half" size={size} color={COLORS.gold} />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Icon key={`empty-${i}`} name="star-border" size={size} color={COLORS.gold} />
      );
    }

    return stars;
  };

  const renderEquipmentCard = (item) => (
    <Card 
      key={item.id} 
      style={styles.equipmentCard} 
      elevation={3}
      onPress={() => navigation.navigate('EquipmentDetail', { equipment: item })}
    >
      <Card.Content>
        <View style={styles.equipmentHeader}>
          <View style={styles.equipmentImage}>
            <Text style={styles.equipmentEmoji}>{item.image}</Text>
            {item.verified && (
              <View style={styles.verifiedBadge}>
                <Icon name="verified" size={16} color={COLORS.primary} />
              </View>
            )}
          </View>
          
          <View style={styles.equipmentInfo}>
            <View style={styles.equipmentTitleRow}>
              <Text style={[TEXT_STYLES.h3, { color: COLORS.text, flex: 1 }]} numberOfLines={1}>
                {item.name}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setSelectedEquipment(item);
                  setShowWriteReview(true);
                }}
                style={styles.reviewButton}
              >
                <Icon name="edit" size={16} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
              {item.brand} • {item.category}
            </Text>
            
            <View style={styles.ratingRow}>
              <View style={styles.stars}>
                {renderStars(item.rating)}
              </View>
              <Text style={[TEXT_STYLES.body, { color: COLORS.text, marginLeft: SPACING.sm }]}>
                {item.rating}
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginLeft: SPACING.xs }]}>
                ({item.reviewCount} reviews)
              </Text>
            </View>

            <Text style={[TEXT_STYLES.body, { color: COLORS.primary, fontWeight: '600', marginTop: SPACING.xs }]}>
              {item.priceRange}
            </Text>

            <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary, marginTop: SPACING.sm }]} numberOfLines={2}>
              {item.description}
            </Text>

            <View style={styles.tagsContainer}>
              {item.tags.slice(0, 2).map((tag, index) => (
                <Chip
                  key={index}
                  mode="outlined"
                  compact
                  style={styles.tagChip}
                  textStyle={styles.tagText}
                >
                  {tag}
                </Chip>
              ))}
              {item.tags.length > 2 && (
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                  +{item.tags.length - 2} more
                </Text>
              )}
            </View>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const addProOrCon = (type) => {
    setNewReview(prev => ({
      ...prev,
      [type]: [...prev[type], '']
    }));
  };

  const updateProOrCon = (type, index, value) => {
    setNewReview(prev => ({
      ...prev,
      [type]: prev[type].map((item, i) => i === index ? value : item)
    }));
  };

  const removeProOrCon = (type, index) => {
    if (newReview[type].length > 1) {
      setNewReview(prev => ({
        ...prev,
        [type]: prev[type].filter((_, i) => i !== index)
      }));
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="transparent" translucent barStyle="light-content" />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <Animated.View 
          style={[
            styles.headerContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.headerTop}>
            <Text style={[TEXT_STYLES.h1, { color: 'white' }]}>
              Equipment Reviews ⭐
            </Text>
            <IconButton
              icon="filter-list"
              iconColor="white"
              size={24}
              onPress={() => setShowFilters(true)}
            />
          </View>

          <Surface style={styles.statsOverview} elevation={4}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[TEXT_STYLES.h2, { color: COLORS.primary }]}>
                  {equipment.length}
                </Text>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                  Equipment
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={[TEXT_STYLES.h2, { color: COLORS.success }]}>
                  {reviews.length}
                </Text>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                  Reviews
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={[TEXT_STYLES.h2, { color: COLORS.warning }]}>
                  4.6
                </Text>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                  Avg Rating
                </Text>
              </View>
            </View>
          </Surface>
        </Animated.View>
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
        <View style={styles.searchSection}>
          <Searchbar
            placeholder="Search equipment, brands..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor={COLORS.primary}
          />
        </View>

        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categoryChips}>
              {categories.map((category) => (
                <Chip
                  key={category}
                  mode={selectedCategory === category ? 'flat' : 'outlined'}
                  selected={selectedCategory === category}
                  onPress={() => setSelectedCategory(category)}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category && styles.selectedCategoryChip,
                  ]}
                  textStyle={{
                    color: selectedCategory === category ? 'white' : COLORS.primary,
                  }}
                >
                  {category}
                </Chip>
              ))}
            </View>
          </ScrollView>

          <View style={styles.sortSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.sortChips}>
                {sortOptions.map((option) => (
                  <Chip
                    key={option.value}
                    mode={sortBy === option.value ? 'flat' : 'outlined'}
                    selected={sortBy === option.value}
                    onPress={() => setSortBy(option.value)}
                    style={[
                      styles.sortChip,
                      sortBy === option.value && styles.selectedSortChip,
                    ]}
                    textStyle={{
                      color: sortBy === option.value ? 'white' : COLORS.textSecondary,
                      fontSize: 12,
                    }}
                  >
                    {option.label}
                  </Chip>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>

        <View style={styles.equipmentSection}>
          <View style={styles.sectionHeader}>
            <Text style={[TEXT_STYLES.h3, { color: COLORS.text }]}>
              Equipment Reviews
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
              {sortedEquipment.length} items
            </Text>
          </View>

          {sortedEquipment.length === 0 ? (
            <Card style={styles.emptyCard} elevation={1}>
              <Card.Content style={styles.emptyContent}>
                <Icon name="search-off" size={64} color={COLORS.border} />
                <Text style={[TEXT_STYLES.h3, { color: COLORS.textSecondary, marginTop: SPACING.md }]}>
                  No equipment found
                </Text>
                <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary, textAlign: 'center' }]}>
                  Try adjusting your search or filters
                </Text>
              </Card.Content>
            </Card>
          ) : (
            sortedEquipment.map(renderEquipmentCard)
          )}
        </View>
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="rate-review"
        label="Write Review"
        onPress={() => Alert.alert('Select Equipment', 'Tap the edit icon on any equipment card to write a review')}
        color="white"
        extended={true}
      />

      <Portal>
        <Modal
          visible={showWriteReview}
          onDismiss={() => setShowWriteReview(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView intensity={20} style={StyleSheet.absoluteFillObject} />
          <Surface style={styles.modalContent} elevation={8}>
            <View style={styles.modalHeader}>
              <Text style={[TEXT_STYLES.h2, { color: COLORS.text }]}>
                Write Review ✍️
              </Text>
              <IconButton
                icon="close"
                onPress={() => setShowWriteReview(false)}
              />
            </View>

            {selectedEquipment && (
              <View style={styles.equipmentPreview}>
                <Text style={styles.equipmentEmoji}>{selectedEquipment.image}</Text>
                <Text style={[TEXT_STYLES.h3, { color: COLORS.text }]}>
                  {selectedEquipment.name}
                </Text>
              </View>
            )}

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.ratingSection}>
                <Text style={[TEXT_STYLES.body, { color: COLORS.text, marginBottom: SPACING.sm }]}>
                  Your Rating
                </Text>
                <View style={styles.ratingInput}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => setNewReview(prev => ({ ...prev, rating: star }))}
                    >
                      <Icon
                        name={star <= newReview.rating ? "star" : "star-border"}
                        size={32}
                        color={COLORS.gold}
                        style={{ marginRight: SPACING.sm }}
                      />
                    </TouchableOpacity>
                  ))}
                  <Text style={[TEXT_STYLES.body, { color: COLORS.text, marginLeft: SPACING.md }]}>
                    {newReview.rating}/5
                  </Text>
                </View>
              </View>

              <TextInput
                label="Review Title *"
                value={newReview.title}
                onChangeText={(text) => setNewReview(prev => ({ ...prev, title: text }))}
                style={styles.input}
                mode="outlined"
                outlineColor={COLORS.border}
                activeOutlineColor={COLORS.primary}
              />

              <TextInput
                label="Your Review *"
                value={newReview.review}
                onChangeText={(text) => setNewReview(prev => ({ ...prev, review: text }))}
                style={styles.input}
                mode="outlined"
                multiline
                numberOfLines={4}
                outlineColor={COLORS.border}
                activeOutlineColor={COLORS.primary}
              />

              <View style={styles.prosConsSection}>
                <Text style={[TEXT_STYLES.body, { color: COLORS.text, marginBottom: SPACING.sm }]}>
                  Pros (Optional)
                </Text>
                {newReview.pros.map((pro, index) => (
                  <View key={index} style={styles.prosConsInput}>
                    <TextInput
                      value={pro}
                      onChangeText={(text) => updateProOrCon('pros', index, text)}
                      style={[styles.input, { flex: 1 }]}
                      mode="outlined"
                      placeholder="What did you like?"
                      outlineColor={COLORS.border}
                      activeOutlineColor={COLORS.success}
                      left={<TextInput.Icon icon="thumb-up" iconColor={COLORS.success} />}
                    />
                    <IconButton
                      icon="delete"
                      size={20}
                      iconColor={COLORS.error}
                      onPress={() => removeProOrCon('pros', index)}
                    />
                  </View>
                ))}
                <Button
                  mode="outlined"
                  onPress={() => addProOrCon('pros')}
                  style={styles.addButton}
                  icon="add"
                >
                  Add Pro
                </Button>
              </View>

              <View style={styles.prosConsSection}>
                <Text style={[TEXT_STYLES.body, { color: COLORS.text, marginBottom: SPACING.sm }]}>
                  Cons (Optional)
                </Text>
                {newReview.cons.map((con, index) => (
                  <View key={index} style={styles.prosConsInput}>
                    <TextInput
                      value={con}
                      onChangeText={(text) => updateProOrCon('cons', index, text)}
                      style={[styles.input, { flex: 1 }]}
                      mode="outlined"
                      placeholder="What could be improved?"
                      outlineColor={COLORS.border}
                      activeOutlineColor={COLORS.error}
                      left={<TextInput.Icon icon="thumb-down" iconColor={COLORS.error} />}
                    />
                    <IconButton
                      icon="delete"
                      size={20}
                      iconColor={COLORS.error}
                      onPress={() => removeProOrCon('cons', index)}
                    />
                  </View>
                ))}
                <Button
                  mode="outlined"
                  onPress={() => addProOrCon('cons')}
                  style={styles.addButton}
                  icon="add"
                >
                  Add Con
                </Button>
              </View>

              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={() => setShowWriteReview(false)}
                  style={styles.cancelButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleWriteReview}
                  style={styles.submitButton}
                  buttonColor={COLORS.primary}
                >
                  Post Review
                </Button>
              </View>
            </ScrollView>
          </Surface>
        </Modal>
      </Portal>
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
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  statsOverview: {
    borderRadius: 16,
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  searchSection: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  searchBar: {
    elevation: 2,
    backgroundColor: COLORS.surface,
  },
  filterSection: {
    marginBottom: SPACING.lg,
  },
  categoryChips: {
    flexDirection: 'row',
    paddingVertical: SPACING.sm,
  },
  categoryChip: {
    marginRight: SPACING.sm,
    borderColor: COLORS.primary,
  },
  selectedCategoryChip: {
    backgroundColor: COLORS.primary,
  },
  sortSection: {
    marginTop: SPACING.md,
  },
  sortChips: {
    flexDirection: 'row',
    paddingVertical: SPACING.sm,
  },
  sortChip: {
    marginRight: SPACING.sm,
    borderColor: COLORS.border,
  },
  selectedSortChip: {
    backgroundColor: COLORS.textSecondary,
  },
  equipmentSection: {
    marginBottom: 120,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  equipmentCard: {
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
  },
  equipmentHeader: {
    flexDirection: 'row',
  },
  equipmentImage: {
    position: 'relative',
    marginRight: SPACING.md,
  },
  equipmentEmoji: {
    fontSize: 48,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 2,
  },
  equipmentInfo: {
    flex: 1,
  },
  equipmentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reviewButton: {
    padding: SPACING.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  stars: {
    flexDirection: 'row',
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    flexWrap: 'wrap',
  },
  tagChip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
    height: 24,
  },
  tagText: {
    fontSize: 10,
  },
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
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
    padding: SPACING.lg,
  },
  modalContent: {
    width: width * 0.9,
    maxHeight: '80%',
    borderRadius: 16,
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  equipmentPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.lg,
  },
  ratingSection: {
    marginBottom: SPACING.lg,
  },
  ratingInput: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  prosConsSection: {
    marginBottom: SPACING.lg,
  },
  prosConsInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  addButton: {
    borderColor: COLORS.primary,
    marginTop: SPACING.xs,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  cancelButton: {
    flex: 0.4,
    borderColor: COLORS.textSecondary,
  },
  submitButton: {
    flex: 0.55,
  },
});

export default EquipmentReviews;