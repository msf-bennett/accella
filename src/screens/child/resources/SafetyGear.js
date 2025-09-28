import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Animated,
  Alert,
  Vibration,
  Dimensions,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  Surface,
  Searchbar,
  Text,
  ProgressBar,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#f44336',
  warning: '#ff9800',
  background: '#f5f5f5',
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
  header: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  subheader: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textSecondary },
};

const { width } = Dimensions.get('window');

const SafetyGear = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [safetyGearData, setSafetyGearData] = useState([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const dispatch = useDispatch();
  const { user, isLoading } = useSelector(state => state.auth);

  // Safety gear categories and items
  const safetyCategories = [
    { id: 'all', name: 'All Equipment', icon: 'category', color: COLORS.primary },
    { id: 'head', name: 'Head Protection', icon: 'sports-hockey', color: '#e74c3c' },
    { id: 'body', name: 'Body Protection', icon: 'shield', color: '#3498db' },
    { id: 'feet', name: 'Foot Protection', icon: 'sports-soccer', color: '#2ecc71' },
    { id: 'accessories', name: 'Accessories', icon: 'fitness-center', color: '#f39c12' },
  ];

  const safetyGearItems = [
    {
      id: '1',
      name: 'Football Helmet',
      category: 'head',
      sport: 'Football',
      price: '$89.99',
      rating: 4.8,
      image: '⛑️',
      description: 'Professional grade football helmet with advanced impact protection',
      features: ['Impact resistant', 'Ventilation system', 'Adjustable fit'],
      ageGroup: '8-18 years',
      safety: 95,
    },
    {
      id: '2',
      name: 'Soccer Shin Guards',
      category: 'body',
      sport: 'Soccer',
      price: '$24.99',
      rating: 4.6,
      image: '🦵',
      description: 'Lightweight shin guards with maximum protection',
      features: ['Lightweight', 'Breathable', 'Secure straps'],
      ageGroup: '6-16 years',
      safety: 88,
    },
    {
      id: '3',
      name: 'Basketball Knee Pads',
      category: 'body',
      sport: 'Basketball',
      price: '$19.99',
      rating: 4.4,
      image: '🏀',
      description: 'Comfortable knee protection for basketball players',
      features: ['Flexible design', 'Moisture-wicking', 'Non-slip'],
      ageGroup: '10-18 years',
      safety: 85,
    },
    {
      id: '4',
      name: 'Cycling Helmet',
      category: 'head',
      sport: 'Cycling',
      price: '$45.99',
      rating: 4.7,
      image: '🚴',
      description: 'Aerodynamic cycling helmet with superior ventilation',
      features: ['Lightweight', '22 vents', 'MIPS technology'],
      ageGroup: '5-18 years',
      safety: 92,
    },
    {
      id: '5',
      name: 'Athletic Mouthguard',
      category: 'accessories',
      sport: 'Multi-Sport',
      price: '$12.99',
      rating: 4.3,
      image: '🦷',
      description: 'Custom-fit mouthguard for various sports',
      features: ['Custom moldable', 'Breathing channel', 'Shock absorption'],
      ageGroup: '8-18 years',
      safety: 78,
    },
    {
      id: '6',
      name: 'Safety Goggles',
      category: 'accessories',
      sport: 'Swimming',
      price: '$16.99',
      rating: 4.5,
      image: '🥽',
      description: 'Anti-fog swimming goggles with UV protection',
      features: ['Anti-fog coating', 'UV protection', 'Adjustable straps'],
      ageGroup: '4-16 years',
      safety: 82,
    },
  ];

  useEffect(() => {
    initializeScreen();
  }, []);

  const initializeScreen = useCallback(() => {
    // Animation entrance
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

    // Load safety gear data
    loadSafetyGearData();
  }, []);

  const loadSafetyGearData = useCallback(() => {
    try {
      setSafetyGearData(safetyGearItems);
    } catch (error) {
      console.error('Error loading safety gear data:', error);
      Alert.alert(
        'Loading Error',
        'Unable to load safety gear information. Please try again.',
        [{ text: 'OK', onPress: () => {} }]
      );
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Vibration.vibrate(50);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      loadSafetyGearData();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [loadSafetyGearData]);

  const filteredGearItems = safetyGearItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.sport.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleGearItemPress = useCallback((item) => {
    Vibration.vibrate(30);
    Alert.alert(
      `${item.name}`,
      `${item.description}\n\nPrice: ${item.price}\nSafety Rating: ${item.safety}%\nAge Group: ${item.ageGroup}`,
      [
        { text: 'View Details', onPress: () => navigation.navigate('GearDetails', { item }) },
        { text: 'Add to Wishlist', onPress: () => handleAddToWishlist(item) },
        { text: 'Close', style: 'cancel' },
      ]
    );
  }, [navigation]);

  const handleAddToWishlist = useCallback((item) => {
    Vibration.vibrate(50);
    Alert.alert(
      'Added to Wishlist! 🎯',
      `${item.name} has been added to your safety gear wishlist.`,
      [{ text: 'OK', onPress: () => {} }]
    );
  }, []);

  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>Safety Gear Guide 🛡️</Text>
        <Text style={styles.headerSubtitle}>
          Essential protective equipment for safe training
        </Text>
        <View style={styles.headerStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>15+</Text>
            <Text style={styles.statLabel}>Equipment Types</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>98%</Text>
            <Text style={styles.statLabel}>Safety Rating</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );

  const renderSearchBar = () => (
    <Surface style={styles.searchContainer} elevation={2}>
      <Searchbar
        placeholder="Search safety equipment..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        iconColor={COLORS.primary}
      />
    </Surface>
  );

  const renderCategoryChips = () => (
    <View style={styles.chipContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipScrollContent}
      >
        {safetyCategories.map((category) => (
          <Chip
            key={category.id}
            selected={selectedCategory === category.id}
            onPress={() => {
              setSelectedCategory(category.id);
              Vibration.vibrate(30);
            }}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && { backgroundColor: category.color }
            ]}
            textStyle={selectedCategory === category.id ? styles.selectedChipText : styles.chipText}
            icon={category.icon}
          >
            {category.name}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const renderSafetyTips = () => (
    <Card style={styles.tipsCard}>
      <Card.Content>
        <View style={styles.tipsHeader}>
          <Icon name="lightbulb" size={24} color={COLORS.warning} />
          <Text style={styles.tipsTitle}>Safety Tips 💡</Text>
        </View>
        <View style={styles.tipsList}>
          <Text style={styles.tipItem}>• Always check equipment condition before use</Text>
          <Text style={styles.tipItem}>• Ensure proper fit for maximum protection</Text>
          <Text style={styles.tipItem}>• Replace damaged gear immediately</Text>
          <Text style={styles.tipItem}>• Clean and maintain equipment regularly</Text>
        </View>
      </Card.Content>
    </Card>
  );

  const renderGearItem = ({ item, index }) => (
    <Animated.View
      style={[
        styles.gearItemContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Card 
        style={styles.gearCard}
        onPress={() => handleGearItemPress(item)}
        elevation={3}
      >
        <Card.Content>
          <View style={styles.gearHeader}>
            <View style={styles.gearInfo}>
              <Text style={styles.gearEmoji}>{item.image}</Text>
              <View style={styles.gearDetails}>
                <Text style={styles.gearName}>{item.name}</Text>
                <Text style={styles.gearSport}>{item.sport}</Text>
                <Text style={styles.gearAge}>{item.ageGroup}</Text>
              </View>
            </View>
            <View style={styles.gearMeta}>
              <Text style={styles.gearPrice}>{item.price}</Text>
              <View style={styles.ratingContainer}>
                <Icon name="star" size={16} color={COLORS.warning} />
                <Text style={styles.rating}>{item.rating}</Text>
              </View>
            </View>
          </View>
          
          <Text style={styles.gearDescription}>{item.description}</Text>
          
          <View style={styles.safetyRating}>
            <Text style={styles.safetyLabel}>Safety Rating</Text>
            <ProgressBar
              progress={item.safety / 100}
              color={item.safety >= 90 ? COLORS.success : item.safety >= 80 ? COLORS.warning : COLORS.error}
              style={styles.safetyProgress}
            />
            <Text style={styles.safetyPercentage}>{item.safety}%</Text>
          </View>
          
          <View style={styles.featuresList}>
            {item.features.map((feature, idx) => (
              <Chip
                key={idx}
                compact
                style={styles.featureChip}
                textStyle={styles.featureText}
              >
                {feature}
              </Chip>
            ))}
          </View>
        </Card.Content>
        
        <Card.Actions style={styles.cardActions}>
          <Button
            mode="outlined"
            onPress={() => handleAddToWishlist(item)}
            style={styles.actionButton}
          >
            Add to Wishlist
          </Button>
          <Button
            mode="contained"
            onPress={() => handleGearItemPress(item)}
            style={styles.actionButton}
            buttonColor={COLORS.primary}
          >
            View Details
          </Button>
        </Card.Actions>
      </Card>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      <ScrollView
        style={styles.scrollView}
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
        {renderHeader()}
        {renderSearchBar()}
        {renderCategoryChips()}
        {renderSafetyTips()}
        
        <View style={styles.gearList}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'all' ? 'All Safety Equipment' : 
             safetyCategories.find(c => c.id === selectedCategory)?.name} 
            ({filteredGearItems.length})
          </Text>
          
          {filteredGearItems.map((item, index) => (
            <View key={item.id}>
              {renderGearItem({ item, index })}
            </View>
          ))}
          
          {filteredGearItems.length === 0 && (
            <Card style={styles.emptyStateCard}>
              <Card.Content style={styles.emptyState}>
                <Icon name="search-off" size={64} color={COLORS.textSecondary} />
                <Text style={styles.emptyStateText}>No safety gear found</Text>
                <Text style={styles.emptyStateSubtext}>
                  Try adjusting your search or category filter
                </Text>
              </Card.Content>
            </Card>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.header,
    color: '#ffffff',
    fontSize: 28,
    textAlign: 'center',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: '#ffffff',
    opacity: 0.9,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  headerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.lg,
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...TEXT_STYLES.header,
    color: '#ffffff',
    fontSize: 24,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: '#ffffff',
    opacity: 0.8,
  },
  searchContainer: {
    margin: SPACING.md,
    borderRadius: 12,
  },
  searchBar: {
    backgroundColor: COLORS.surface,
  },
  chipContainer: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  chipScrollContent: {
    paddingVertical: SPACING.sm,
  },
  categoryChip: {
    marginRight: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  chipText: {
    color: COLORS.textSecondary,
  },
  selectedChipText: {
    color: '#ffffff',
  },
  tipsCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  tipsTitle: {
    ...TEXT_STYLES.subheader,
    marginLeft: SPACING.sm,
  },
  tipsList: {
    marginLeft: SPACING.lg,
  },
  tipItem: {
    ...TEXT_STYLES.body,
    marginBottom: SPACING.xs,
  },
  gearList: {
    paddingHorizontal: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.subheader,
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  gearItemContainer: {
    marginBottom: SPACING.md,
  },
  gearCard: {
    backgroundColor: COLORS.surface,
  },
  gearHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  gearInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  gearEmoji: {
    fontSize: 48,
    marginRight: SPACING.md,
  },
  gearDetails: {
    flex: 1,
  },
  gearName: {
    ...TEXT_STYLES.subheader,
    fontSize: 16,
  },
  gearSport: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: '600',
  },
  gearAge: {
    ...TEXT_STYLES.caption,
  },
  gearMeta: {
    alignItems: 'flex-end',
  },
  gearPrice: {
    ...TEXT_STYLES.subheader,
    color: COLORS.success,
    fontSize: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  rating: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
  },
  gearDescription: {
    ...TEXT_STYLES.body,
    marginBottom: SPACING.md,
    fontSize: 14,
  },
  safetyRating: {
    marginBottom: SPACING.md,
  },
  safetyLabel: {
    ...TEXT_STYLES.caption,
    marginBottom: SPACING.xs,
  },
  safetyProgress: {
    height: 6,
    borderRadius: 3,
  },
  safetyPercentage: {
    ...TEXT_STYLES.caption,
    textAlign: 'right',
    marginTop: SPACING.xs,
    fontWeight: '600',
  },
  featuresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  featureChip: {
    backgroundColor: COLORS.background,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  featureText: {
    fontSize: 12,
  },
  cardActions: {
    paddingTop: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  emptyStateCard: {
    marginTop: SPACING.xl,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyStateText: {
    ...TEXT_STYLES.subheader,
    marginTop: SPACING.md,
  },
  emptyStateSubtext: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
});

export default SafetyGear;