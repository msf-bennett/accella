import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  Animated,
  Alert,
  Vibration,
  FlatList,
  Dimensions,
} from 'react-native';
import {
  Card,
  Searchbar,
  Chip,
  Avatar,
  IconButton,
  FAB,
  Surface,
  ProgressBar,
  Portal,
  Modal,
  Badge,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import your constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants';

const { width, height } = Dimensions.get('window');

const FindCoaches = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedExperience, setSelectedExperience] = useState('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [coaches, setCoaches] = useState([]);
  const [filteredCoaches, setFilteredCoaches] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(-50);

  const sports = [
    { id: 'all', name: 'All Sports', icon: 'sports', color: COLORS.primary },
    { id: 'football', name: 'Football', icon: 'sports-football', color: '#FF6B35' },
    { id: 'basketball', name: 'Basketball', icon: 'sports-basketball', color: '#F7931E' },
    { id: 'tennis', name: 'Tennis', icon: 'sports-tennis', color: '#4CAF50' },
    { id: 'swimming', name: 'Swimming', icon: 'pool', color: '#2196F3' },
    { id: 'soccer', name: 'Soccer', icon: 'sports-soccer', color: '#8BC34A' },
    { id: 'volleyball', name: 'Volleyball', icon: 'sports-volleyball', color: '#E91E63' },
    { id: 'martial-arts', name: 'Martial Arts', icon: 'sports-kabaddi', color: '#9C27B0' },
    { id: 'fitness', name: 'Fitness', icon: 'fitness-center', color: '#FF5722' },
  ];

  const experienceLevels = [
    { id: 'all', name: 'All Levels' },
    { id: 'beginner', name: 'Beginner Friendly' },
    { id: 'intermediate', name: 'Intermediate' },
    { id: 'advanced', name: 'Advanced/Pro' },
    { id: 'youth', name: 'Youth Specialist' },
  ];

  const priceRanges = [
    { id: 'all', name: 'All Prices' },
    { id: 'budget', name: '$20-50/session' },
    { id: 'moderate', name: '$51-100/session' },
    { id: 'premium', name: '$100+/session' },
  ];

  // Sample coach data - in real app, this would come from API
  const sampleCoaches = [
    {
      id: 1,
      name: 'Sarah Johnson',
      title: 'Elite Tennis Coach',
      avatar: 'https://via.placeholder.com/100x100/4CAF50/white?text=SJ',
      sports: ['tennis'],
      specializations: ['Youth Development', 'Tournament Prep', 'Technical Skills'],
      rating: 4.9,
      reviewCount: 127,
      experience: '8 years',
      location: 'Westlands, Nairobi',
      priceRange: 'premium',
      sessionPrice: '$120/session',
      languages: ['English', 'Swahili'],
      certifications: ['ITF Certified', 'Youth Specialist', 'First Aid'],
      availability: 'Available',
      responseTime: '< 2 hours',
      students: 45,
      bio: 'Former professional player with 8+ years coaching experience. Specialized in developing young talent and tournament preparation.',
      achievements: ['Regional Champion 2019', 'Top Youth Coach Award', '95% Student Improvement Rate'],
      ageGroups: ['6-12', '13-18'],
      isVerified: true,
      isOnline: true,
      lastActive: 'Active now',
    },
    {
      id: 2,
      name: 'Michael Thompson',
      title: 'Football Performance Coach',
      avatar: 'https://via.placeholder.com/100x100/FF6B35/white?text=MT',
      sports: ['football', 'fitness'],
      specializations: ['Strength & Conditioning', 'Speed Training', 'Position Skills'],
      rating: 4.7,
      reviewCount: 89,
      experience: '12 years',
      location: 'Karen, Nairobi',
      priceRange: 'moderate',
      sessionPrice: '$80/session',
      languages: ['English'],
      certifications: ['NSCA Certified', 'Football Coaching License', 'Nutrition Specialist'],
      availability: 'Available',
      responseTime: '< 1 hour',
      students: 38,
      bio: 'Ex-professional footballer turned performance coach. Helping athletes reach their peak potential through scientific training methods.',
      achievements: ['Former National Team Player', 'Performance Coach Certification', '200+ Athletes Trained'],
      ageGroups: ['13-18', 'Adults'],
      isVerified: true,
      isOnline: false,
      lastActive: '2 hours ago',
    },
    {
      id: 3,
      name: 'Emma Wilson',
      title: 'Swimming Instructor',
      avatar: 'https://via.placeholder.com/100x100/2196F3/white?text=EW',
      sports: ['swimming'],
      specializations: ['Learn to Swim', 'Stroke Technique', 'Water Safety'],
      rating: 4.8,
      reviewCount: 156,
      experience: '6 years',
      location: 'Kilimani, Nairobi',
      priceRange: 'budget',
      sessionPrice: '$45/session',
      languages: ['English', 'French', 'Swahili'],
      certifications: ['Swim Instructor Certified', 'Lifeguard Certified', 'Water Safety Instructor'],
      availability: 'Busy until next week',
      responseTime: '< 4 hours',
      students: 62,
      bio: 'Passionate swimming instructor dedicated to water safety and technique development for all ages.',
      achievements: ['100+ Swimmers Taught', 'Safety Excellence Award', 'Community Swimming Program Leader'],
      ageGroups: ['3-6', '7-12', '13-18', 'Adults'],
      isVerified: true,
      isOnline: true,
      lastActive: 'Active now',
    },
    {
      id: 4,
      name: 'David Kariuki',
      title: 'Basketball Skills Trainer',
      avatar: 'https://via.placeholder.com/100x100/F7931E/white?text=DK',
      sports: ['basketball'],
      specializations: ['Ball Handling', 'Shooting Form', 'Game Strategy'],
      rating: 4.6,
      reviewCount: 73,
      experience: '5 years',
      location: 'Eastlands, Nairobi',
      priceRange: 'budget',
      sessionPrice: '$35/session',
      languages: ['English', 'Swahili', 'Kikuyu'],
      certifications: ['Basketball Coaching Certificate', 'Youth Development Specialist'],
      availability: 'Available',
      responseTime: '< 3 hours',
      students: 29,
      bio: 'Local basketball enthusiast focused on developing fundamental skills and basketball IQ in young players.',
      achievements: ['Local League Champion', 'Youth Development Award', 'Community Coach of the Year'],
      ageGroups: ['8-16'],
      isVerified: false,
      isOnline: true,
      lastActive: '30 minutes ago',
    },
    {
      id: 5,
      name: 'Lisa Mwangi',
      title: 'Fitness & Wellness Coach',
      avatar: 'https://via.placeholder.com/100x100/FF5722/white?text=LM',
      sports: ['fitness'],
      specializations: ['Weight Loss', 'Strength Training', 'Nutrition Planning'],
      rating: 4.9,
      reviewCount: 201,
      experience: '10 years',
      location: 'CBD, Nairobi',
      priceRange: 'moderate',
      sessionPrice: '$75/session',
      languages: ['English', 'Swahili'],
      certifications: ['ACSM Certified', 'Nutrition Specialist', 'Wellness Coach'],
      availability: 'Available',
      responseTime: '< 1 hour',
      students: 85,
      bio: 'Holistic fitness coach combining physical training with nutrition and mental wellness for complete health transformation.',
      achievements: ['Fitness Transformation Expert', 'Wellness Program Creator', '500+ Clients Transformed'],
      ageGroups: ['18+'],
      isVerified: true,
      isOnline: true,
      lastActive: 'Active now',
    },
  ];

  useEffect(() => {
    loadCoaches();
    animateEntrance();
  }, []);

  useEffect(() => {
    filterCoaches();
  }, [searchQuery, selectedSport, selectedExperience, selectedPriceRange, coaches]);

  const animateEntrance = () => {
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
  };

  const loadCoaches = useCallback(async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCoaches(sampleCoaches);
      setFilteredCoaches(sampleCoaches);
    } catch (error) {
      Alert.alert('Error', 'Failed to load coaches. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCoaches();
    setRefreshing(false);
  }, [loadCoaches]);

  const filterCoaches = () => {
    let filtered = coaches;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(coach =>
        coach.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coach.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coach.specializations.some(spec => 
          spec.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        coach.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by sport
    if (selectedSport !== 'all') {
      filtered = filtered.filter(coach =>
        coach.sports.includes(selectedSport)
      );
    }

    // Filter by experience level
    if (selectedExperience !== 'all') {
      if (selectedExperience === 'youth') {
        filtered = filtered.filter(coach =>
          coach.ageGroups.some(age => 
            age.includes('3-6') || age.includes('7-12') || age.includes('6-12') || age.includes('8-16')
          )
        );
      }
    }

    // Filter by price range
    if (selectedPriceRange !== 'all') {
      filtered = filtered.filter(coach => coach.priceRange === selectedPriceRange);
    }

    setFilteredCoaches(filtered);
  };

  const toggleFavorite = (coachId) => {
    Vibration.vibrate(50);
    const newFavorites = new Set(favorites);
    if (favorites.has(coachId)) {
      newFavorites.delete(coachId);
    } else {
      newFavorites.add(coachId);
    }
    setFavorites(newFavorites);
  };

  const handleCoachPress = (coach) => {
    Vibration.vibrate(50);
    navigation.navigate('CoachProfile', { coach });
  };

  const handleMessageCoach = (coach) => {
    Alert.alert(
      'Message Coach',
      `Send a message to ${coach.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Message',
          onPress: () => {
            Alert.alert('Feature Coming Soon', 'Direct messaging will be available in the next update! 💬');
          }
        }
      ]
    );
  };

  const handleBookSession = (coach) => {
    Alert.alert(
      'Book Session',
      `Ready to book a session with ${coach.name}?\nPrice: ${coach.sessionPrice}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Book Now',
          onPress: () => {
            Alert.alert('Feature Coming Soon', 'Session booking will be available in the next update! 🏆');
          }
        }
      ]
    );
  };

  const renderSportFilter = ({ item }) => (
    <TouchableOpacity
      onPress={() => setSelectedSport(item.id)}
      style={{ marginRight: SPACING.sm }}
    >
      <Surface
        style={{
          borderRadius: 20,
          elevation: selectedSport === item.id ? 4 : 2,
          backgroundColor: selectedSport === item.id ? item.color : COLORS.background,
          paddingHorizontal: SPACING.md,
          paddingVertical: SPACING.sm,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <Icon
          name={item.icon}
          size={20}
          color={selectedSport === item.id ? 'white' : item.color}
          style={{ marginRight: SPACING.xs }}
        />
        <Text
          style={[
            TEXT_STYLES.caption,
            { color: selectedSport === item.id ? 'white' : item.color }
          ]}
        >
          {item.name}
        </Text>
      </Surface>
    </TouchableOpacity>
  );

  const renderCoachCard = ({ item }) => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        marginBottom: SPACING.md,
      }}
    >
      <Card
        style={{
          marginHorizontal: SPACING.md,
          elevation: 4,
          borderRadius: 16,
        }}
      >
        <TouchableOpacity onPress={() => handleCoachPress(item)}>
          <View style={{ padding: SPACING.md }}>
            {/* Header Section */}
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.sm }}>
              <View style={{ position: 'relative' }}>
                <Avatar.Image
                  size={60}
                  source={{ uri: item.avatar }}
                  style={{ backgroundColor: COLORS.primary }}
                />
                {item.isOnline && (
                  <Badge
                    size={16}
                    style={{
                      position: 'absolute',
                      bottom: 2,
                      right: 2,
                      backgroundColor: '#4CAF50',
                    }}
                  />
                )}
                {item.isVerified && (
                  <View
                    style={{
                      position: 'absolute',
                      top: -2,
                      right: -2,
                      backgroundColor: '#2196F3',
                      borderRadius: 10,
                      width: 20,
                      height: 20,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Icon name="verified" size={12} color="white" />
                  </View>
                )}
              </View>

              <View style={{ flex: 1, marginLeft: SPACING.md }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={[TEXT_STYLES.subtitle, { fontWeight: 'bold' }]}>
                      {item.name}
                    </Text>
                    <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                      {item.title}
                    </Text>
                    <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, fontSize: 11 }]}>
                      📍 {item.location} • {item.experience}
                    </Text>
                  </View>
                  <IconButton
                    icon={favorites.has(item.id) ? 'favorite' : 'favorite-border'}
                    iconColor={favorites.has(item.id) ? '#FF6B6B' : COLORS.textSecondary}
                    size={20}
                    onPress={() => toggleFavorite(item.id)}
                  />
                </View>
              </View>
            </View>

            {/* Rating and Price */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="star" size={16} color="#FFD700" />
                <Text style={[TEXT_STYLES.caption, { marginLeft: 4, fontWeight: 'bold' }]}>
                  {item.rating}
                </Text>
                <Text style={[TEXT_STYLES.caption, { marginLeft: 4, color: COLORS.textSecondary }]}>
                  ({item.reviewCount} reviews)
                </Text>
              </View>
              <Text style={[TEXT_STYLES.caption, { fontWeight: 'bold', color: COLORS.primary }]}>
                {item.sessionPrice}
              </Text>
            </View>

            {/* Specializations */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.sm }}>
              {item.specializations.slice(0, 3).map((spec, index) => (
                <Chip
                  key={index}
                  mode="outlined"
                  compact
                  style={{
                    marginRight: SPACING.xs,
                    marginBottom: SPACING.xs,
                    backgroundColor: `${COLORS.primary}10`,
                  }}
                  textStyle={{ color: COLORS.primary, fontSize: 10 }}
                >
                  {spec}
                </Chip>
              ))}
            </View>

            {/* Stats */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={[TEXT_STYLES.caption, { fontWeight: 'bold' }]}>
                  {item.students}
                </Text>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, fontSize: 10 }]}>
                  Students
                </Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={[TEXT_STYLES.caption, { fontWeight: 'bold' }]}>
                  {item.responseTime}
                </Text>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, fontSize: 10 }]}>
                  Response
                </Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={[TEXT_STYLES.caption, { fontWeight: 'bold', color: item.availability === 'Available' ? '#4CAF50' : '#FF9800' }]}>
                  {item.availability}
                </Text>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, fontSize: 10 }]}>
                  Status
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.sm }}>
              <TouchableOpacity
                style={{
                  backgroundColor: COLORS.primary,
                  paddingHorizontal: SPACING.md,
                  paddingVertical: SPACING.sm,
                  borderRadius: 8,
                  flex: 1,
                  marginRight: SPACING.sm,
                }}
                onPress={() => handleBookSession(item)}
              >
                <Text style={[TEXT_STYLES.button, { color: 'white', textAlign: 'center' }]}>
                  Book Session
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  borderColor: COLORS.primary,
                  borderWidth: 1,
                  paddingHorizontal: SPACING.md,
                  paddingVertical: SPACING.sm,
                  borderRadius: 8,
                  flex: 1,
                }}
                onPress={() => handleMessageCoach(item)}
              >
                <Text style={[TEXT_STYLES.button, { color: COLORS.primary, textAlign: 'center' }]}>
                  Message
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Card>
    </Animated.View>
  );

  const renderEmptyState = () => (
    <View style={{ alignItems: 'center', paddingVertical: SPACING.xl }}>
      <Icon name="person-search" size={80} color={COLORS.textSecondary} />
      <Text style={[TEXT_STYLES.h3, { marginTop: SPACING.md, color: COLORS.textSecondary }]}>
        No coaches found
      </Text>
      <Text style={[TEXT_STYLES.body, { marginTop: SPACING.sm, textAlign: 'center', paddingHorizontal: SPACING.xl }]}>
        Try adjusting your search criteria or explore different sports
      </Text>
    </View>
  );

  const renderFilterModal = () => (
    <Portal>
      <Modal
        visible={showFilters}
        onDismiss={() => setShowFilters(false)}
        contentContainerStyle={{
          backgroundColor: 'white',
          margin: SPACING.md,
          borderRadius: 16,
          padding: SPACING.md,
          maxHeight: height * 0.8,
        }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md }}>
            <Text style={TEXT_STYLES.h3}>Filter Coaches</Text>
            <IconButton
              icon="close"
              size={24}
              onPress={() => setShowFilters(false)}
            />
          </View>

          {/* Experience Level */}
          <Text style={[TEXT_STYLES.subtitle, { marginBottom: SPACING.sm }]}>Experience Level</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.lg }}>
            {experienceLevels.map((level) => (
              <Chip
                key={level.id}
                mode={selectedExperience === level.id ? 'flat' : 'outlined'}
                selected={selectedExperience === level.id}
                onPress={() => setSelectedExperience(level.id)}
                style={{ marginRight: SPACING.sm, marginBottom: SPACING.sm }}
              >
                {level.name}
              </Chip>
            ))}
          </View>

          {/* Price Range */}
          <Text style={[TEXT_STYLES.subtitle, { marginBottom: SPACING.sm }]}>Price Range</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.lg }}>
            {priceRanges.map((range) => (
              <Chip
                key={range.id}
                mode={selectedPriceRange === range.id ? 'flat' : 'outlined'}
                selected={selectedPriceRange === range.id}
                onPress={() => setSelectedPriceRange(range.id)}
                style={{ marginRight: SPACING.sm, marginBottom: SPACING.sm }}
              >
                {range.name}
              </Chip>
            ))}
          </View>

          <TouchableOpacity
            style={{
              backgroundColor: COLORS.primary,
              paddingVertical: SPACING.md,
              borderRadius: 8,
              alignItems: 'center',
            }}
            onPress={() => {
              setShowFilters(false);
              filterCoaches();
            }}
          >
            <Text style={[TEXT_STYLES.button, { color: 'white' }]}>Apply Filters</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </Portal>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{
          paddingTop: StatusBar.currentHeight + SPACING.md,
          paddingBottom: SPACING.md,
          paddingHorizontal: SPACING.md,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={[TEXT_STYLES.h2, { color: 'white', fontWeight: 'bold' }]}>
              Find Amazing Coaches 🥇
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
              Connect with expert trainers and coaches
            </Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <IconButton
              icon={viewMode === 'grid' ? 'view-list' : 'view-module'}
              iconColor="white"
              size={24}
              onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            />
          </View>
        </View>
      </LinearGradient>

      {/* Search Bar */}
      <View style={{ paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm }}>
        <Searchbar
          placeholder="Search coaches by name, sport, or specialization..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={{ elevation: 2 }}
          inputStyle={{ fontSize: 14 }}
          iconColor={COLORS.primary}
        />
      </View>

      {/* Sport Filters */}
      <View style={{ marginBottom: SPACING.sm }}>
        <FlatList
          data={sports}
          renderItem={renderSportFilter}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: SPACING.md }}
        />
      </View>

      {/* Results Count & Filter Button */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
      }}>
        <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
          {filteredCoaches.length} coaches found
        </Text>
        <TouchableOpacity
          onPress={() => setShowFilters(true)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: SPACING.sm,
            paddingVertical: SPACING.xs,
            borderRadius: 16,
            backgroundColor: COLORS.primary + '20',
          }}
        >
          <Icon name="tune" size={16} color={COLORS.primary} />
          <Text style={[TEXT_STYLES.caption, { color: COLORS.primary, marginLeft: 4 }]}>
            Filters
          </Text>
        </TouchableOpacity>
      </View>

      {/* Coaches List */}
      <FlatList
        data={filteredCoaches}
        renderItem={renderCoachCard}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={loading ? null : renderEmptyState}
        contentContainerStyle={{
          paddingBottom: 100,
          flexGrow: 1,
        }}
      />

      {/* Loading State */}
      {loading && (
        <View style={{ padding: SPACING.md }}>
          <ProgressBar indeterminate color={COLORS.primary} />
          <Text style={[TEXT_STYLES.caption, { textAlign: 'center', marginTop: SPACING.sm }]}>
            Finding amazing coaches for you... 🔍
          </Text>
        </View>
      )}

      {/* Filter Modal */}
      {renderFilterModal()}

      {/* Floating Action Button */}
      <FAB
        icon="person-add"
        style={{
          position: 'absolute',
          margin: SPACING.md,
          right: 0,
          bottom: 80,
          backgroundColor: COLORS.primary,
        }}
        onPress={() => Alert.alert('Feature Coming Soon', 'Coach registration will be available soon! 👨‍🏫')}
      />
    </View>
  );
};

export default FindCoaches;