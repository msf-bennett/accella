import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  Alert,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Animated,
  Vibration,
} from 'react-native';
import {
  Card,
  Searchbar,
  Button,
  Chip,
  Avatar,
  IconButton,
  FAB,
  Surface,
  ProgressBar,
  Portal,
  Modal,
  DataTable,
  Divider,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const PriceComparison = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { comparisonItems, isLoading } = useSelector((state) => state.discovery);

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('monthly');
  const [compareList, setCompareList] = useState([]);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [sortBy, setSortBy] = useState('price');
  const [filterType, setFilterType] = useState('all');
  const [showCalculator, setShowCalculator] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // Mock price comparison data
  const mockPriceData = [
    {
      id: '1',
      name: 'Elite Fitness Center',
      type: 'Gym Membership',
      category: 'gym',
      image: 'https://via.placeholder.com/80',
      priceStructure: {
        single: { amount: 25, period: 'day pass' },
        monthly: { amount: 89, period: 'month', savings: 15 },
        quarterly: { amount: 239, period: '3 months', savings: 28 },
        annual: { amount: 899, period: 'year', savings: 42 },
      },
      features: ['24/7 Access', 'All Equipment', 'Group Classes', 'Parking'],
      rating: 4.6,
      reviews: 342,
      distance: '0.8 mi',
      verified: true,
      popular: true,
      valueScore: 8.5,
      includes: 'Unlimited gym access, group fitness classes, locker room',
      extras: 'Personal training (+$60/session), Nutrition consultation (+$45)',
    },
    {
      id: '2',
      name: 'Mike Johnson - PT',
      type: 'Personal Training',
      category: 'trainer',
      image: 'https://via.placeholder.com/80',
      priceStructure: {
        single: { amount: 75, period: 'session' },
        monthly: { amount: 280, period: '4 sessions', savings: 7 },
        quarterly: { amount: 800, period: '12 sessions', savings: 15 },
        annual: { amount: 2880, period: '48 sessions', savings: 20 },
      },
      features: ['1-on-1 Training', 'Nutrition Plan', 'Progress Tracking', 'Flexible Schedule'],
      rating: 4.9,
      reviews: 127,
      distance: '0.5 mi',
      verified: true,
      popular: false,
      valueScore: 9.2,
      includes: 'Personal training session, workout plan, nutrition guidance',
      extras: 'Meal prep service (+$120/week), Supplement consultation (+$25)',
    },
    {
      id: '3',
      name: 'Yoga Bliss Studio',
      type: 'Yoga Classes',
      category: 'studio',
      image: 'https://via.placeholder.com/80',
      priceStructure: {
        single: { amount: 22, period: 'class' },
        monthly: { amount: 139, period: 'unlimited', savings: 30 },
        quarterly: { amount: 375, period: '3 months', savings: 35 },
        annual: { amount: 1399, period: 'year', savings: 40 },
      },
      features: ['All Yoga Styles', 'Meditation', 'Props Included', 'Community'],
      rating: 4.7,
      reviews: 89,
      distance: '1.2 mi',
      verified: true,
      popular: false,
      valueScore: 8.8,
      includes: 'Unlimited yoga classes, meditation sessions, yoga props',
      extras: 'Private sessions (+$85/session), Retreats (varies)',
    },
    {
      id: '4',
      name: 'CrossFit Box Alpha',
      type: 'CrossFit Training',
      category: 'crossfit',
      image: 'https://via.placeholder.com/80',
      priceStructure: {
        single: { amount: 35, period: 'drop-in' },
        monthly: { amount: 165, period: 'unlimited', savings: 18 },
        quarterly: { amount: 450, period: '3 months', savings: 25 },
        annual: { amount: 1650, period: 'year', savings: 35 },
      },
      features: ['WOD Classes', 'Open Gym', 'Coaching', 'Community Events'],
      rating: 4.8,
      reviews: 156,
      distance: '2.1 mi',
      verified: true,
      popular: true,
      valueScore: 8.9,
      includes: 'Unlimited CrossFit classes, open gym access, coaching',
      extras: 'Personal coaching (+$70/session), Competition prep (+$50/month)',
    },
  ];

  const timeframes = [
    { id: 'single', label: 'Single', icon: '1️⃣' },
    { id: 'monthly', label: 'Monthly', icon: '📅' },
    { id: 'quarterly', label: '3 Months', icon: '📊' },
    { id: 'annual', label: 'Annual', icon: '🎯' },
  ];

  const categories = [
    { id: 'all', label: 'All', icon: '🏃‍♂️' },
    { id: 'gym', label: 'Gyms', icon: '🏋️‍♀️' },
    { id: 'trainer', label: 'Trainers', icon: '👨‍🏫' },
    { id: 'studio', label: 'Studios', icon: '🧘‍♀️' },
    { id: 'crossfit', label: 'CrossFit', icon: '💪' },
  ];

  useEffect(() => {
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
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();

    // Load comparison data from route params if available
    if (route?.params?.compareItems) {
      setCompareList(route.params.compareItems);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const addToComparison = (item) => {
    if (compareList.find(c => c.id === item.id)) {
      Alert.alert('Already Added', 'This item is already in your comparison list');
      return;
    }
    if (compareList.length >= 3) {
      Alert.alert('Limit Reached', 'You can compare up to 3 items at once');
      return;
    }
    setCompareList(prev => [...prev, item]);
    Vibration.vibrate(50);
  };

  const removeFromComparison = (itemId) => {
    setCompareList(prev => prev.filter(item => item.id !== itemId));
    Vibration.vibrate(50);
  };

  const calculateBestValue = () => {
    const filtered = filterType === 'all' 
      ? mockPriceData 
      : mockPriceData.filter(item => item.category === filterType);
    
    return filtered.reduce((best, current) => {
      const currentPrice = current.priceStructure[selectedTimeframe]?.amount || 0;
      const bestPrice = best?.priceStructure[selectedTimeframe]?.amount || Infinity;
      return currentPrice < bestPrice ? current : best;
    }, null);
  };

  const getSortedData = () => {
    let data = filterType === 'all' 
      ? [...mockPriceData] 
      : mockPriceData.filter(item => item.category === filterType);

    return data.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return (a.priceStructure[selectedTimeframe]?.amount || 0) - 
                 (b.priceStructure[selectedTimeframe]?.amount || 0);
        case 'rating':
          return b.rating - a.rating;
        case 'value':
          return b.valueScore - a.valueScore;
        case 'distance':
          return parseFloat(a.distance) - parseFloat(b.distance);
        default:
          return 0;
      }
    });
  };

  const renderHeader = () => (
    <Animated.View 
      style={{ 
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }]
      }}
    >
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{
          paddingTop: StatusBar.currentHeight + SPACING.lg,
          paddingHorizontal: SPACING.md,
          paddingBottom: SPACING.lg,
          borderBottomLeftRadius: 25,
          borderBottomRightRadius: 25,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
          <IconButton
            icon="arrow-back"
            iconColor={COLORS.white}
            size={24}
            onPress={() => navigation.goBack()}
          />
          <Text style={[TEXT_STYLES.h2, { color: COLORS.white, flex: 1, textAlign: 'center' }]}>
            Price Comparison 💰
          </Text>
          <IconButton
            icon="calculate"
            iconColor={COLORS.white}
            size={24}
            onPress={() => setShowCalculator(true)}
          />
        </View>

        {/* Search Bar */}
        <Searchbar
          placeholder="Search fitness options..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={{
            backgroundColor: COLORS.white,
            borderRadius: 15,
            elevation: 0,
            marginBottom: SPACING.md,
          }}
          inputStyle={TEXT_STYLES.body}
          iconColor={COLORS.primary}
        />

        {/* Stats Row */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={[TEXT_STYLES.h3, { color: COLORS.white }]}>
              {getSortedData().length}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
              Options
            </Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={[TEXT_STYLES.h3, { color: COLORS.white }]}>
              ${calculateBestValue()?.priceStructure[selectedTimeframe]?.amount || 0}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
              Best Price
            </Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={[TEXT_STYLES.h3, { color: COLORS.white }]}>
              {compareList.length}/3
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
              Comparing
            </Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderTimeframeSelector = () => (
    <View style={{ paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm }}>
      <Text style={[TEXT_STYLES.h4, { marginBottom: SPACING.sm }]}>Select Timeframe</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row' }}>
          {timeframes.map((timeframe) => (
            <Chip
              key={timeframe.id}
              mode={selectedTimeframe === timeframe.id ? 'flat' : 'outlined'}
              onPress={() => setSelectedTimeframe(timeframe.id)}
              style={{
                marginRight: SPACING.sm,
                backgroundColor: selectedTimeframe === timeframe.id ? COLORS.primary : COLORS.white
              }}
              textStyle={{
                color: selectedTimeframe === timeframe.id ? COLORS.white : COLORS.text
              }}
              icon={() => <Text>{timeframe.icon}</Text>}
            >
              {timeframe.label}
            </Chip>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const renderCategoryFilter = () => (
    <View style={{ paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row' }}>
          {categories.map((category) => (
            <Chip
              key={category.id}
              mode={filterType === category.id ? 'flat' : 'outlined'}
              onPress={() => setFilterType(category.id)}
              style={{
                marginRight: SPACING.sm,
                backgroundColor: filterType === category.id ? COLORS.secondary : COLORS.white
              }}
              textStyle={{
                color: filterType === category.id ? COLORS.white : COLORS.text
              }}
              icon={() => <Text>{category.icon}</Text>}
            >
              {category.label}
            </Chip>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const renderSortOptions = () => (
    <View style={{ 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
    }}>
      <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary }]}>
        {getSortedData().length} options found
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row' }}>
          {[
            { id: 'price', label: '💰 Price', icon: 'attach-money' },
            { id: 'rating', label: '⭐ Rating', icon: 'star' },
            { id: 'value', label: '🎯 Value', icon: 'trending-up' },
            { id: 'distance', label: '📍 Distance', icon: 'location-on' },
          ].map((option) => (
            <Chip
              key={option.id}
              mode={sortBy === option.id ? 'flat' : 'outlined'}
              onPress={() => setSortBy(option.id)}
              style={{
                marginLeft: SPACING.xs,
                backgroundColor: sortBy === option.id ? COLORS.primary : COLORS.white
              }}
              textStyle={{
                color: sortBy === option.id ? COLORS.white : COLORS.text,
                fontSize: 12,
              }}
              compact
            >
              {option.label}
            </Chip>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const renderPriceCard = ({ item, index }) => {
    const isInComparison = compareList.find(c => c.id === item.id);
    const currentPrice = item.priceStructure[selectedTimeframe];
    const isBestValue = calculateBestValue()?.id === item.id;

    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
          marginHorizontal: SPACING.md,
          marginBottom: SPACING.md,
        }}
      >
        <Card style={{ 
          borderRadius: 15, 
          elevation: 3,
          borderWidth: isBestValue ? 2 : 0,
          borderColor: isBestValue ? COLORS.success : 'transparent',
        }}>
          <TouchableOpacity
            onPress={() => {
              setSelectedItem(item);
              setShowDetails(true);
            }}
            activeOpacity={0.7}
          >
            {isBestValue && (
              <View style={{
                position: 'absolute',
                top: -1,
                right: 15,
                backgroundColor: COLORS.success,
                paddingHorizontal: SPACING.sm,
                paddingVertical: 4,
                borderBottomLeftRadius: 8,
                borderBottomRightRadius: 8,
                zIndex: 1,
              }}>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.white, fontWeight: 'bold' }]}>
                  BEST VALUE
                </Text>
              </View>
            )}

            <Card.Content style={{ padding: SPACING.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <Avatar.Image
                  source={{ uri: item.image }}
                  size={60}
                  style={{ marginRight: SPACING.md }}
                />
                
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs }}>
                    <Text style={[TEXT_STYLES.h3, { flex: 1 }]}>{item.name}</Text>
                    {item.verified && (
                      <Icon name="verified" size={18} color={COLORS.primary} />
                    )}
                    {item.popular && (
                      <View style={{
                        backgroundColor: COLORS.error,
                        borderRadius: 10,
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        marginLeft: SPACING.xs,
                      }}>
                        <Text style={[TEXT_STYLES.caption, { color: COLORS.white, fontSize: 9 }]}>
                          POPULAR
                        </Text>
                      </View>
                    )}
                  </View>
                  
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginBottom: SPACING.xs }]}>
                    {item.type} • {item.distance}
                  </Text>
                  
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
                    <Icon name="star" size={16} color="#FFD700" />
                    <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs, color: COLORS.text }]}>
                      {item.rating} ({item.reviews})
                    </Text>
                    <View style={{
                      backgroundColor: COLORS.primaryLight,
                      borderRadius: 8,
                      paddingHorizontal: SPACING.xs,
                      paddingVertical: 2,
                      marginLeft: SPACING.sm,
                    }}>
                      <Text style={[TEXT_STYLES.caption, { color: COLORS.primary, fontSize: 10 }]}>
                        Value: {item.valueScore}/10
                      </Text>
                    </View>
                  </View>
                  
                  {/* Price Display */}
                  <View style={{
                    backgroundColor: COLORS.backgroundLight,
                    borderRadius: 12,
                    padding: SPACING.sm,
                    marginBottom: SPACING.sm,
                  }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View>
                        <Text style={[TEXT_STYLES.h2, { color: COLORS.primary }]}>
                          ${currentPrice?.amount}
                        </Text>
                        <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                          per {currentPrice?.period}
                        </Text>
                      </View>
                      {currentPrice?.savings && (
                        <View style={{
                          backgroundColor: COLORS.success,
                          borderRadius: 15,
                          paddingHorizontal: SPACING.sm,
                          paddingVertical: 4,
                        }}>
                          <Text style={[TEXT_STYLES.caption, { color: COLORS.white }]}>
                            Save {currentPrice.savings}%
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                  
                  {/* Features */}
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.sm }}>
                    {item.features.slice(0, 3).map((feature) => (
                      <View
                        key={feature}
                        style={{
                          backgroundColor: COLORS.backgroundLight,
                          borderRadius: 6,
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                          marginRight: SPACING.xs,
                          marginBottom: 4,
                        }}
                      >
                        <Text style={[TEXT_STYLES.caption, { fontSize: 10 }]}>
                          {feature}
                        </Text>
                      </View>
                    ))}
                    {item.features.length > 3 && (
                      <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                        +{item.features.length - 3} more
                      </Text>
                    )}
                  </View>
                  
                  {/* Action Buttons */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Button
                      mode={isInComparison ? "contained" : "outlined"}
                      onPress={() => isInComparison ? removeFromComparison(item.id) : addToComparison(item)}
                      style={{ flex: 0.4 }}
                      contentStyle={{ paddingHorizontal: 0 }}
                      compact
                    >
                      {isInComparison ? 'Added ✓' : 'Compare'}
                    </Button>
                    <Button
                      mode="contained"
                      onPress={() => Alert.alert('Book Now', `Book ${item.name}`)}
                      style={{ flex: 0.4 }}
                      contentStyle={{ paddingHorizontal: 0 }}
                      compact
                    >
                      Book Now
                    </Button>
                  </View>
                </View>
              </View>
            </Card.Content>
          </TouchableOpacity>
        </Card>
      </Animated.View>
    );
  };

  const renderComparisonBar = () => {
    if (compareList.length === 0) return null;

    return (
      <Surface style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        elevation: 8,
        backgroundColor: COLORS.white,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[TEXT_STYLES.body, { marginRight: SPACING.sm }]}>
              Comparing {compareList.length} items
            </Text>
            {compareList.slice(0, 3).map((item) => (
              <Avatar.Image
                key={item.id}
                source={{ uri: item.image }}
                size={30}
                style={{ marginRight: 4 }}
              />
            ))}
          </View>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('ComparisonDetail', { items: compareList })}
            compact
          >
            Compare
          </Button>
        </View>
      </Surface>
    );
  };

  const renderDetailsModal = () => (
    <Portal>
      <Modal
        visible={showDetails}
        onDismiss={() => setShowDetails(false)}
        contentContainerStyle={{
          backgroundColor: COLORS.white,
          margin: SPACING.lg,
          borderRadius: 20,
          maxHeight: '80%',
        }}
      >
        {selectedItem && (
          <ScrollView style={{ padding: SPACING.lg }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg }}>
              <Text style={[TEXT_STYLES.h2, { flex: 1 }]}>{selectedItem.name}</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setShowDetails(false)}
              />
            </View>

            {/* Price Breakdown */}
            <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.sm }]}>💰 Price Breakdown</Text>
            <DataTable style={{ marginBottom: SPACING.lg }}>
              <DataTable.Header>
                <DataTable.Title>Period</DataTable.Title>
                <DataTable.Title numeric>Price</DataTable.Title>
                <DataTable.Title numeric>Savings</DataTable.Title>
              </DataTable.Header>
              {Object.entries(selectedItem.priceStructure).map(([period, price]) => (
                <DataTable.Row key={period}>
                  <DataTable.Cell>{price.period}</DataTable.Cell>
                  <DataTable.Cell numeric>${price.amount}</DataTable.Cell>
                  <DataTable.Cell numeric>{price.savings ? `${price.savings}%` : '-'}</DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>

            <Divider style={{ marginVertical: SPACING.md }} />

            {/* What's Included */}
            <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.sm }]}>✅ What's Included</Text>
            <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.md }]}>{selectedItem.includes}</Text>

            {/* Additional Services */}
            <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.sm }]}>➕ Additional Services</Text>
            <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.lg }]}>{selectedItem.extras}</Text>

            <Button
              mode="contained"
              onPress={() => {
                setShowDetails(false);
                Alert.alert('Book Now', `Book ${selectedItem.name}`);
              }}
              style={{ borderRadius: 12 }}
            >
              Book Now - ${selectedItem.priceStructure[selectedTimeframe]?.amount}/{selectedItem.priceStructure[selectedTimeframe]?.period}
            </Button>
          </ScrollView>
        )}
      </Modal>
    </Portal>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {renderHeader()}
      {renderTimeframeSelector()}
      {renderCategoryFilter()}
      {renderSortOptions()}
      
      <FlatList
        data={getSortedData()}
        renderItem={renderPriceCard}
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
        contentContainerStyle={{ 
          flexGrow: 1,
          paddingBottom: compareList.length > 0 ? 100 : SPACING.xl
        }}
      />

      {renderDetailsModal()}
      {renderComparisonBar()}

      {/* FAB for Calculator */}
      <FAB
        icon="calculate"
        style={{
          position: 'absolute',
          margin: SPACING.lg,
          right: 0,
          bottom: compareList.length > 0 ? 80 : 0,
          backgroundColor: COLORS.secondary,
        }}
        onPress={() => Alert.alert('Cost Calculator', 'Budget calculator feature coming soon!')}
      />
    </View>
  );
};

export default PriceComparison;