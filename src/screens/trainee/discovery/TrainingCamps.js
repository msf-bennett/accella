import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  FlatList,
  TouchableOpacity,
  Image,
  Animated,
  StatusBar,
  Alert,
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
  Portal,
  Modal,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from 'expo-blur';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const TrainingCamps = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [camps, setCamps] = useState([]);
  const [featuredCamps, setFeaturedCamps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Animation refs
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = useRef(new Animated.Value(1)).current;
  const cardAnimations = useRef([]).current;

  // Mock data for training camps
  const mockCamps = [
    {
      id: '1',
      name: 'Elite Football Academy Summer Camp',
      location: 'Nairobi, Kenya',
      sport: 'Football',
      duration: '2 weeks',
      price: 'KSH 15,000',
      rating: 4.8,
      reviews: 124,
      image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400',
      coach: 'Coach Michael Otieno',
      level: 'Intermediate',
      ageGroup: '12-18 years',
      featured: true,
      description: 'Intensive football training with professional coaches',
      facilities: ['Grass Pitch', 'Gym', 'Accommodation', 'Meals'],
      startDate: '2024-12-15',
      spotsLeft: 8,
    },
    {
      id: '2',
      name: 'Basketball Skills Development Camp',
      location: 'Mombasa, Kenya',
      sport: 'Basketball',
      duration: '1 week',
      price: 'KSH 12,000',
      rating: 4.6,
      reviews: 89,
      image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400',
      coach: 'Coach Sarah Wanjiku',
      level: 'Beginner',
      ageGroup: '10-16 years',
      featured: false,
      description: 'Learn fundamental basketball skills and techniques',
      facilities: ['Indoor Court', 'Training Equipment', 'Coaching Staff'],
      startDate: '2024-12-20',
      spotsLeft: 12,
    },
    {
      id: '3',
      name: 'Swimming Excellence Camp',
      location: 'Kisumu, Kenya',
      sport: 'Swimming',
      duration: '3 weeks',
      price: 'KSH 20,000',
      rating: 4.9,
      reviews: 156,
      image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400',
      coach: 'Coach David Kimani',
      level: 'Advanced',
      ageGroup: '8-20 years',
      featured: true,
      description: 'Professional swimming training for competitive swimmers',
      facilities: ['Olympic Pool', 'Diving Boards', 'Spa', 'Nutrition Plan'],
      startDate: '2024-12-10',
      spotsLeft: 5,
    },
    {
      id: '4',
      name: 'Tennis Junior Academy',
      location: 'Nakuru, Kenya',
      sport: 'Tennis',
      duration: '2 weeks',
      price: 'KSH 18,000',
      rating: 4.7,
      reviews: 92,
      image: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=400',
      coach: 'Coach Grace Muthoni',
      level: 'All Levels',
      ageGroup: '6-18 years',
      featured: false,
      description: 'Comprehensive tennis training for juniors',
      facilities: ['Hard Courts', 'Clay Courts', 'Pro Shop', 'Fitness Center'],
      startDate: '2024-12-25',
      spotsLeft: 15,
    },
  ];

  const categories = ['All', 'Football', 'Basketball', 'Swimming', 'Tennis', 'Athletics', 'Rugby'];
  
  const filterOptions = [
    { id: 'price_low', label: 'Price: Low to High', icon: 'trending-up' },
    { id: 'price_high', label: 'Price: High to Low', icon: 'trending-down' },
    { id: 'rating', label: 'Highest Rated', icon: 'star' },
    { id: 'duration', label: 'Duration', icon: 'schedule' },
    { id: 'spots', label: 'Spots Available', icon: 'group' },
    { id: 'featured', label: 'Featured Only', icon: 'featured-video' },
  ];

  useEffect(() => {
    loadCamps();
    initializeAnimations();
  }, []);

  const initializeAnimations = () => {
    mockCamps.forEach((_, index) => {
      cardAnimations[index] = new Animated.Value(0);
    });
    
    Animated.stagger(100, 
      cardAnimations.map(anim => 
        Animated.timing(anim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        })
      )
    ).start();
  };

  const loadCamps = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCamps(mockCamps);
      setFeaturedCamps(mockCamps.filter(camp => camp.featured));
    } catch (error) {
      Alert.alert('Error', 'Failed to load training camps');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCamps();
    setRefreshing(false);
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query) {
      const filtered = mockCamps.filter(camp => 
        camp.name.toLowerCase().includes(query.toLowerCase()) ||
        camp.location.toLowerCase().includes(query.toLowerCase()) ||
        camp.sport.toLowerCase().includes(query.toLowerCase())
      );
      setCamps(filtered);
    } else {
      setCamps(mockCamps);
    }
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    if (category === 'All') {
      setCamps(mockCamps);
    } else {
      const filtered = mockCamps.filter(camp => camp.sport === category);
      setCamps(filtered);
    }
  };

  const handleCampPress = (camp) => {
    Alert.alert(
      '🏕️ Camp Details',
      `Opening detailed view for ${camp.name}. This feature will show full camp information, booking options, and coach profiles.`,
      [{ text: 'Got it! 👍', style: 'default' }]
    );
  };

  const handleBookCamp = (camp) => {
    Alert.alert(
      '📝 Book Camp',
      `Booking system for ${camp.name} is coming soon! You'll be able to reserve spots, make payments, and get confirmation.`,
      [{ text: 'Notify Me 🔔', style: 'default' }]
    );
  };

  const handleFilterPress = () => {
    setShowFilters(true);
  };

  const applyFilters = (filters) => {
    setSelectedFilters(filters);
    let filtered = [...mockCamps];
    
    filters.forEach(filter => {
      switch(filter) {
        case 'price_low':
          filtered.sort((a, b) => parseInt(a.price.replace(/[^\d]/g, '')) - parseInt(b.price.replace(/[^\d]/g, '')));
          break;
        case 'price_high':
          filtered.sort((a, b) => parseInt(b.price.replace(/[^\d]/g, '')) - parseInt(a.price.replace(/[^\d]/g, '')));
          break;
        case 'rating':
          filtered.sort((a, b) => b.rating - a.rating);
          break;
        case 'featured':
          filtered = filtered.filter(camp => camp.featured);
          break;
      }
    });
    
    setCamps(filtered);
    setShowFilters(false);
  };

  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={{
        paddingTop: StatusBar.currentHeight + SPACING.xl,
        paddingHorizontal: SPACING.md,
        paddingBottom: SPACING.lg,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
        <IconButton
          icon="arrow-back"
          iconColor={COLORS.background}
          onPress={() => navigation.goBack()}
        />
        <Text style={[TEXT_STYLES.header, { color: COLORS.background, flex: 1 }]}>
          Training Camps 🏕️
        </Text>
        <IconButton
          icon="notifications"
          iconColor={COLORS.background}
          onPress={() => Alert.alert('🔔 Notifications', 'Notification center coming soon!')}
        />
      </View>

      <Searchbar
        placeholder="Search camps, locations, sports..."
        value={searchQuery}
        onChangeText={handleSearch}
        style={{
          backgroundColor: COLORS.background,
          elevation: 4,
          marginBottom: SPACING.md,
        }}
        iconColor={COLORS.primary}
        inputStyle={TEXT_STYLES.body}
      />

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: SPACING.md }}
      >
        {categories.map((category, index) => (
          <Chip
            key={category}
            selected={selectedCategory === category}
            onPress={() => handleCategoryFilter(category)}
            style={{
              marginRight: SPACING.sm,
              backgroundColor: selectedCategory === category ? COLORS.background : 'rgba(255,255,255,0.2)',
            }}
            textStyle={{
              color: selectedCategory === category ? COLORS.primary : COLORS.background,
              fontWeight: '600',
            }}
          >
            {category}
          </Chip>
        ))}
      </ScrollView>
    </LinearGradient>
  );

  const renderFeaturedCamps = () => (
    <View style={{ marginVertical: SPACING.md }}>
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        marginBottom: SPACING.sm,
      }}>
        <Text style={[TEXT_STYLES.subheader, { color: COLORS.text }]}>
          ⭐ Featured Camps
        </Text>
        <TouchableOpacity>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.primary }]}>View All</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: SPACING.md }}
      >
        {featuredCamps.map((camp, index) => (
          <TouchableOpacity
            key={camp.id}
            onPress={() => handleCampPress(camp)}
            style={{ marginRight: SPACING.md }}
          >
            <Card style={{ 
              width: width * 0.8, 
              elevation: 6,
              backgroundColor: COLORS.background,
            }}>
              <Card.Cover 
                source={{ uri: camp.image }} 
                style={{ height: 180 }}
              />
              <Card.Content style={{ padding: SPACING.md }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={[TEXT_STYLES.subtitle, { marginBottom: SPACING.xs }]}>
                      {camp.name}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs }}>
                      <Icon name="location-on" size={16} color={COLORS.secondary} />
                      <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs }]}>
                        {camp.location}
                      </Text>
                    </View>
                  </View>
                  <Chip style={{ backgroundColor: COLORS.success + '20' }}>
                    <Text style={{ color: COLORS.success, fontSize: 12, fontWeight: '600' }}>
                      {camp.spotsLeft} spots left
                    </Text>
                  </Chip>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
                  <Icon name="star" size={16} color="#FFD700" />
                  <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs }]}>
                    {camp.rating} ({camp.reviews} reviews)
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={[TEXT_STYLES.subtitle, { color: COLORS.primary, fontWeight: '700' }]}>
                    {camp.price}
                  </Text>
                  <Button
                    mode="contained"
                    onPress={() => handleBookCamp(camp)}
                    style={{ backgroundColor: COLORS.primary }}
                    labelStyle={{ fontSize: 12, fontWeight: '600' }}
                  >
                    Book Now 🎯
                  </Button>
                </View>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderCampCard = ({ item: camp, index }) => {
    const animatedStyle = {
      opacity: cardAnimations[index] || 1,
      transform: [{
        translateY: cardAnimations[index]?.interpolate({
          inputRange: [0, 1],
          outputRange: [50, 0],
        }) || 0
      }]
    };

    return (
      <Animated.View style={[{ marginHorizontal: SPACING.md, marginBottom: SPACING.md }, animatedStyle]}>
        <TouchableOpacity onPress={() => handleCampPress(camp)}>
          <Card style={{ elevation: 4, backgroundColor: COLORS.background }}>
            <View style={{ position: 'relative' }}>
              <Card.Cover source={{ uri: camp.image }} style={{ height: 160 }} />
              {camp.featured && (
                <Surface style={{
                  position: 'absolute',
                  top: SPACING.sm,
                  right: SPACING.sm,
                  backgroundColor: COLORS.primary,
                  paddingHorizontal: SPACING.sm,
                  paddingVertical: SPACING.xs,
                  borderRadius: 12,
                  elevation: 2,
                }}>
                  <Text style={{ color: COLORS.background, fontSize: 10, fontWeight: '600' }}>
                    ⭐ FEATURED
                  </Text>
                </Surface>
              )}
            </View>
            
            <Card.Content style={{ padding: SPACING.md }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.sm }}>
                <View style={{ flex: 1 }}>
                  <Text style={[TEXT_STYLES.subtitle, { marginBottom: SPACING.xs }]}>
                    {camp.name}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs }}>
                    <Icon name="location-on" size={14} color={COLORS.secondary} />
                    <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs }]}>
                      {camp.location}
                    </Text>
                  </View>
                </View>
                <Avatar.Text 
                  size={40} 
                  label={camp.sport.charAt(0)} 
                  style={{ backgroundColor: COLORS.primary }}
                />
              </View>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.sm }}>
                <Chip 
                  style={{ marginRight: SPACING.xs, marginBottom: SPACING.xs, backgroundColor: COLORS.primary + '20' }}
                  textStyle={{ color: COLORS.primary, fontSize: 10 }}
                >
                  {camp.level}
                </Chip>
                <Chip 
                  style={{ marginRight: SPACING.xs, marginBottom: SPACING.xs, backgroundColor: COLORS.secondary + '20' }}
                  textStyle={{ color: COLORS.secondary, fontSize: 10 }}
                >
                  {camp.ageGroup}
                </Chip>
                <Chip 
                  style={{ marginRight: SPACING.xs, marginBottom: SPACING.xs, backgroundColor: COLORS.success + '20' }}
                  textStyle={{ color: COLORS.success, fontSize: 10 }}
                >
                  {camp.duration}
                </Chip>
              </View>

              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginBottom: SPACING.sm }]}>
                {camp.description}
              </Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
                <Icon name="star" size={16} color="#FFD700" />
                <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs }]}>
                  {camp.rating} ({camp.reviews} reviews)
                </Text>
                <View style={{ marginLeft: 'auto', flexDirection: 'row', alignItems: 'center' }}>
                  <Icon name="group" size={16} color={COLORS.success} />
                  <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs, color: COLORS.success }]}>
                    {camp.spotsLeft} spots left
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                    Starting from
                  </Text>
                  <Text style={[TEXT_STYLES.subtitle, { color: COLORS.primary, fontWeight: '700' }]}>
                    {camp.price}
                  </Text>
                </View>
                <Button
                  mode="contained"
                  onPress={() => handleBookCamp(camp)}
                  style={{ backgroundColor: COLORS.primary }}
                  labelStyle={{ fontWeight: '600' }}
                >
                  Book Camp 🏕️
                </Button>
              </View>
            </Card.Content>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderFilterModal = () => (
    <Portal>
      <Modal
        visible={showFilters}
        onDismiss={() => setShowFilters(false)}
        contentContainerStyle={{
          backgroundColor: COLORS.background,
          marginHorizontal: SPACING.lg,
          borderRadius: 12,
          padding: SPACING.lg,
        }}
      >
        <Text style={[TEXT_STYLES.subheader, { marginBottom: SPACING.md, textAlign: 'center' }]}>
          🔍 Filter Camps
        </Text>
        
        {filterOptions.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            onPress={() => {
              const newFilters = selectedFilters.includes(filter.id)
                ? selectedFilters.filter(f => f !== filter.id)
                : [...selectedFilters, filter.id];
              setSelectedFilters(newFilters);
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: SPACING.sm,
              paddingHorizontal: SPACING.md,
              marginBottom: SPACING.sm,
              backgroundColor: selectedFilters.includes(filter.id) ? COLORS.primary + '20' : 'transparent',
              borderRadius: 8,
            }}
          >
            <Icon 
              name={filter.icon} 
              size={24} 
              color={selectedFilters.includes(filter.id) ? COLORS.primary : COLORS.textSecondary} 
            />
            <Text style={[
              TEXT_STYLES.body, 
              { 
                marginLeft: SPACING.md,
                color: selectedFilters.includes(filter.id) ? COLORS.primary : COLORS.text 
              }
            ]}>
              {filter.label}
            </Text>
            {selectedFilters.includes(filter.id) && (
              <Icon name="check" size={20} color={COLORS.primary} style={{ marginLeft: 'auto' }} />
            )}
          </TouchableOpacity>
        ))}

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.lg }}>
          <Button
            mode="outlined"
            onPress={() => {
              setSelectedFilters([]);
              setShowFilters(false);
            }}
            style={{ flex: 1, marginRight: SPACING.sm }}
          >
            Clear
          </Button>
          <Button
            mode="contained"
            onPress={() => applyFilters(selectedFilters)}
            style={{ flex: 1, marginLeft: SPACING.sm, backgroundColor: COLORS.primary }}
          >
            Apply Filters
          </Button>
        </View>
      </Modal>
    </Portal>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {renderHeader()}
      
      <Animated.ScrollView
        style={{ flex: 1 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {featuredCamps.length > 0 && renderFeaturedCamps()}
        
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          paddingHorizontal: SPACING.md,
          marginVertical: SPACING.md,
        }}>
          <Text style={[TEXT_STYLES.subheader, { color: COLORS.text }]}>
            🏕️ All Camps ({camps.length})
          </Text>
          <TouchableOpacity 
            onPress={handleFilterPress}
            style={{ 
              flexDirection: 'row', 
              alignItems: 'center',
              backgroundColor: COLORS.primary + '20',
              paddingHorizontal: SPACING.md,
              paddingVertical: SPACING.sm,
              borderRadius: 20,
            }}
          >
            <Icon name="tune" size={18} color={COLORS.primary} />
            <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs, color: COLORS.primary }]}>
              Filter
            </Text>
            {selectedFilters.length > 0 && (
              <View style={{
                backgroundColor: COLORS.primary,
                borderRadius: 10,
                width: 20,
                height: 20,
                justifyContent: 'center',
                alignItems: 'center',
                marginLeft: SPACING.xs,
              }}>
                <Text style={{ color: COLORS.background, fontSize: 10, fontWeight: '600' }}>
                  {selectedFilters.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <FlatList
          data={camps}
          renderItem={renderCampCard}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: SPACING.xl }}
        />
      </Animated.ScrollView>

      {renderFilterModal()}

      <FAB
        icon="add"
        label="Create Camp"
        onPress={() => Alert.alert(
          '➕ Create Camp',
          'Camp creation feature for coaches and organizations coming soon!',
          [{ text: 'Got it! 👍', style: 'default' }]
        )}
        style={{
          position: 'absolute',
          bottom: SPACING.lg,
          right: SPACING.lg,
          backgroundColor: COLORS.primary,
        }}
        color={COLORS.background}
      />
    </View>
  );
};

export default TrainingCamps;