import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Alert,
  Share,
  Dimensions,
  Image,
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
  Portal,
  Modal,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from 'expo-blur';

// Design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f8f9ff',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e1e5e9',
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

const WishList = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const wishlistItems = useSelector(state => state.equipment.wishlist || []);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('dateAdded');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Equipment categories
  const categories = [
    'All', 'Cardio', 'Strength', 'Functional', 'Recovery', 
    'Accessories', 'Home Gym', 'Wearables'
  ];

  // Sort options
  const sortOptions = [
    { value: 'dateAdded', label: 'Recently Added' },
    { value: 'name', label: 'Name A-Z' },
    { value: 'price', label: 'Price: Low to High' },
    { value: 'priority', label: 'Priority' },
  ];

  // Sample wishlist data (would come from Redux store)
  const sampleWishlistItems = [
    {
      id: '1',
      name: 'Adjustable Dumbbells',
      brand: 'PowerBlock',
      price: 299.99,
      category: 'Strength',
      priority: 'High',
      dateAdded: '2024-01-15',
      image: 'https://via.placeholder.com/150x150',
      inStock: true,
      rating: 4.8,
      notes: 'Perfect for home workouts',
      affiliate: true,
    },
    {
      id: '2',
      name: 'Foam Roller',
      brand: 'TriggerPoint',
      price: 49.99,
      category: 'Recovery',
      priority: 'Medium',
      dateAdded: '2024-01-10',
      image: 'https://via.placeholder.com/150x150',
      inStock: false,
      rating: 4.6,
      notes: 'For post-workout recovery',
      affiliate: false,
    },
    {
      id: '3',
      name: 'Resistance Bands Set',
      brand: 'Bodylastics',
      price: 39.99,
      category: 'Functional',
      priority: 'High',
      dateAdded: '2024-01-08',
      image: 'https://via.placeholder.com/150x150',
      inStock: true,
      rating: 4.7,
      notes: 'Great for travel workouts',
      affiliate: true,
    },
    {
      id: '4',
      name: 'Heart Rate Monitor',
      brand: 'Polar',
      price: 129.99,
      category: 'Wearables',
      priority: 'Low',
      dateAdded: '2024-01-05',
      image: 'https://via.placeholder.com/150x150',
      inStock: true,
      rating: 4.5,
      notes: 'Track training intensity',
      affiliate: false,
    },
  ];

  const displayItems = sampleWishlistItems; // Use sample data for now

  useEffect(() => {
    // Load wishlist data
    loadWishlistData();
  }, []);

  const loadWishlistData = useCallback(async () => {
    try {
      setLoading(true);
      // Dispatch action to load wishlist
      // dispatch(loadWishlist());
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      Alert.alert('Error', 'Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadWishlistData();
    setRefreshing(false);
  }, [loadWishlistData]);

  const filterAndSortItems = useCallback(() => {
    let filtered = displayItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.brand.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort items
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return a.price - b.price;
        case 'priority':
          const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'dateAdded':
        default:
          return new Date(b.dateAdded) - new Date(a.dateAdded);
      }
    });

    return filtered;
  }, [displayItems, searchQuery, selectedCategory, sortBy]);

  const handleRemoveItem = useCallback((itemId) => {
    Alert.alert(
      'Remove Item',
      'Remove this item from your wishlist?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            // dispatch(removeFromWishlist(itemId));
            Alert.alert('Success', 'Item removed from wishlist');
          },
        },
      ]
    );
  }, []);

  const handleUpdatePriority = useCallback((itemId, newPriority) => {
    // dispatch(updateWishlistItemPriority(itemId, newPriority));
    Alert.alert('Updated', `Priority changed to ${newPriority}`);
  }, []);

  const handleShareWishlist = useCallback(async () => {
    try {
      const message = `Check out my fitness equipment wishlist!\n\n${
        filterAndSortItems().slice(0, 3).map(item => 
          `• ${item.name} by ${item.brand} - $${item.price}`
        ).join('\n')
      }\n\nShared from FitCoach App 💪`;

      await Share.share({
        message,
        title: 'My Fitness Equipment Wishlist',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share wishlist');
    }
  }, [filterAndSortItems]);

  const handleViewItem = useCallback((item) => {
    // Navigate to equipment details screen
    navigation.navigate('EquipmentDetails', { equipmentId: item.id });
  }, [navigation]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return COLORS.error;
      case 'Medium': return COLORS.warning;
      case 'Low': return COLORS.success;
      default: return COLORS.textSecondary;
    }
  };

  const getTotalValue = () => {
    return filterAndSortItems().reduce((sum, item) => sum + item.price, 0);
  };

  const renderWishlistStats = () => (
    <Surface style={styles.statsContainer}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.statsGradient}
      >
        <View style={styles.statItem}>
          <Icon name="favorite" size={24} color="white" />
          <Text style={styles.statValue}>{filterAndSortItems().length}</Text>
          <Text style={styles.statLabel}>Items</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Icon name="attach-money" size={24} color="white" />
          <Text style={styles.statValue}>${getTotalValue().toFixed(0)}</Text>
          <Text style={styles.statLabel}>Total Value</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Icon name="trending-up" size={24} color="white" />
          <Text style={styles.statValue}>
            {filterAndSortItems().filter(item => item.priority === 'High').length}
          </Text>
          <Text style={styles.statLabel}>High Priority</Text>
        </View>
      </LinearGradient>
    </Surface>
  );

  const renderCategoryChips = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.categoryScroll}
      contentContainerStyle={styles.categoryContainer}
    >
      {categories.map(category => (
        <Chip
          key={category}
          mode={selectedCategory === category ? 'flat' : 'outlined'}
          selected={selectedCategory === category}
          onPress={() => setSelectedCategory(category)}
          style={[
            styles.categoryChip,
            selectedCategory === category && styles.selectedCategoryChip
          ]}
          textStyle={selectedCategory === category ? styles.selectedCategoryText : styles.categoryText}
        >
          {category}
        </Chip>
      ))}
    </ScrollView>
  );

  const renderWishlistItem = ({ item }) => (
    <Card style={styles.itemCard} onPress={() => handleViewItem(item)}>
      <View style={styles.itemContent}>
        <View style={styles.itemImageContainer}>
          <Image source={{ uri: item.image }} style={styles.itemImage} />
          {item.affiliate && (
            <Chip style={styles.affiliateChip} textStyle={styles.affiliateChipText}>
              💰 Deal
            </Chip>
          )}
        </View>
        
        <View style={styles.itemDetails}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemName}>{item.name}</Text>
            <IconButton
              icon="close"
              size={20}
              onPress={() => handleRemoveItem(item.id)}
              iconColor={COLORS.error}
            />
          </View>
          
          <Text style={styles.itemBrand}>{item.brand}</Text>
          
          <View style={styles.itemMeta}>
            <View style={styles.priceContainer}>
              <Text style={styles.itemPrice}>${item.price}</Text>
              {!item.inStock && (
                <Chip style={styles.stockChip} textStyle={styles.stockChipText}>
                  Out of Stock
                </Chip>
              )}
            </View>
            
            <View style={styles.ratingContainer}>
              <Icon name="star" size={16} color="#FFD700" />
              <Text style={styles.rating}>{item.rating}</Text>
            </View>
          </View>
          
          <View style={styles.itemFooter}>
            <TouchableOpacity
              style={[styles.priorityButton, { borderColor: getPriorityColor(item.priority) }]}
              onPress={() => {
                const priorities = ['Low', 'Medium', 'High'];
                const currentIndex = priorities.indexOf(item.priority);
                const nextPriority = priorities[(currentIndex + 1) % priorities.length];
                handleUpdatePriority(item.id, nextPriority);
              }}
            >
              <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>
                {item.priority} Priority
              </Text>
            </TouchableOpacity>
            
            <Text style={styles.dateAdded}>
              Added {new Date(item.dateAdded).toLocaleDateString()}
            </Text>
          </View>
          
          {item.notes && (
            <Text style={styles.itemNotes}>{item.notes}</Text>
          )}
        </View>
      </View>
    </Card>
  );

  const renderFilterModal = () => (
    <Portal>
      <Modal
        visible={showFilterModal}
        onDismiss={() => setShowFilterModal(false)}
        contentContainerStyle={styles.modalContent}
      >
        <Text style={styles.modalTitle}>Sort & Filter</Text>
        
        <Text style={styles.sectionTitle}>Sort By</Text>
        {sortOptions.map(option => (
          <TouchableOpacity
            key={option.value}
            style={styles.optionItem}
            onPress={() => {
              setSortBy(option.value);
              setShowFilterModal(false);
            }}
          >
            <Text style={styles.optionText}>{option.label}</Text>
            {sortBy === option.value && (
              <Icon name="check" size={20} color={COLORS.primary} />
            )}
          </TouchableOpacity>
        ))}
        
        <Button
          mode="contained"
          onPress={() => setShowFilterModal(false)}
          style={styles.closeButton}
          buttonColor={COLORS.primary}
        >
          Done
        </Button>
      </Modal>
    </Portal>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="favorite-border" size={80} color={COLORS.textSecondary} />
      <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
      <Text style={styles.emptySubtitle}>
        Start adding equipment you want to your wishlist!
      </Text>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('EquipmentBrowse')}
        style={styles.emptyButton}
        buttonColor={COLORS.primary}
        icon="search"
      >
        Browse Equipment
      </Button>
    </View>
  );

  const filteredItems = filterAndSortItems();

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Wishlist 💫</Text>
          <TouchableOpacity onPress={handleShareWishlist}>
            <Icon name="share" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search your wishlist..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={COLORS.primary}
        />
        <IconButton
          icon="tune"
          size={24}
          onPress={() => setShowFilterModal(true)}
          iconColor={COLORS.primary}
          style={styles.filterButton}
        />
      </View>

      {/* Stats */}
      {displayItems.length > 0 && renderWishlistStats()}

      {/* Categories */}
      {renderCategoryChips()}

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {filteredItems.length > 0 ? (
          filteredItems.map(item => renderWishlistItem({ item }))
        ) : (
          renderEmptyState()
        )}
      </ScrollView>

      {/* FAB */}
      {filteredItems.length > 0 && (
        <FAB
          icon="add"
          style={styles.fab}
          onPress={() => navigation.navigate('EquipmentBrowse')}
          color="white"
        />
      )}

      {/* Filter Modal */}
      {renderFilterModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.md,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: SPACING.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: 'white',
    elevation: 2,
  },
  searchBar: {
    flex: 1,
    backgroundColor: COLORS.background,
    elevation: 0,
  },
  filterButton: {
    marginLeft: SPACING.sm,
  },
  statsContainer: {
    margin: SPACING.md,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
  },
  statsGradient: {
    flexDirection: 'row',
    paddingVertical: SPACING.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...TEXT_STYLES.h2,
    color: 'white',
    marginTop: SPACING.xs,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: 'white',
    marginTop: SPACING.xs,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: SPACING.md,
  },
  categoryScroll: {
    backgroundColor: 'white',
    elevation: 1,
  },
  categoryContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  categoryChip: {
    marginRight: SPACING.sm,
    backgroundColor: 'white',
  },
  selectedCategoryChip: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    color: COLORS.textSecondary,
  },
  selectedCategoryText: {
    color: 'white',
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  itemCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    elevation: 3,
  },
  itemContent: {
    flexDirection: 'row',
    padding: SPACING.md,
  },
  itemImageContainer: {
    position: 'relative',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: COLORS.background,
  },
  affiliateChip: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.warning,
    height: 24,
  },
  affiliateChipText: {
    fontSize: 10,
    color: 'white',
  },
  itemDetails: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  itemName: {
    ...TEXT_STYLES.h3,
    flex: 1,
    fontSize: 18,
  },
  itemBrand: {
    ...TEXT_STYLES.caption,
    marginBottom: SPACING.sm,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemPrice: {
    ...TEXT_STYLES.h3,
    color: COLORS.primary,
    marginRight: SPACING.sm,
  },
  stockChip: {
    backgroundColor: COLORS.error,
    height: 24,
  },
  stockChipText: {
    fontSize: 10,
    color: 'white',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
  },
  itemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  priorityButton: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  priorityText: {
    ...TEXT_STYLES.small,
    fontWeight: '600',
  },
  dateAdded: {
    ...TEXT_STYLES.small,
  },
  itemNotes: {
    ...TEXT_STYLES.caption,
    fontStyle: 'italic',
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.xl * 2,
  },
  emptyTitle: {
    ...TEXT_STYLES.h2,
    marginTop: SPACING.lg,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  emptyButton: {
    minWidth: 200,
  },
  fab: {
    position: 'absolute',
    right: SPACING.md,
    bottom: SPACING.md,
    backgroundColor: COLORS.primary,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: SPACING.lg,
    margin: SPACING.lg,
    borderRadius: 12,
  },
  modalTitle: {
    ...TEXT_STYLES.h2,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.md,
    fontSize: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  optionText: {
    ...TEXT_STYLES.body,
  },
  closeButton: {
    marginTop: SPACING.lg,
  },
});

export default WishList;