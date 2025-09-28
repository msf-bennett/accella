import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  Alert,
  RefreshControl,
  StatusBar,
  Animated,
  TouchableOpacity,
  Image,
  Vibration,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  Searchbar,
  Avatar,
  IconButton,
  Surface,
  Portal,
  Modal,
  Divider,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const CampSearch = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector(state => state.auth);
  const { camps, searchResults } = useSelector(state => state.camps);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [selectedAge, setSelectedAge] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');

  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeInAnim = useRef(new Animated.Value(0)).current;

  const sports = [
    { id: 'football', name: 'Football ⚽', icon: 'sports-soccer' },
    { id: 'basketball', name: 'Basketball 🏀', icon: 'sports-basketball' },
    { id: 'tennis', name: 'Tennis 🎾', icon: 'sports-tennis' },
    { id: 'swimming', name: 'Swimming 🏊', icon: 'pool' },
    { id: 'athletics', name: 'Athletics 🏃', icon: 'directions-run' },
    { id: 'volleyball', name: 'Volleyball 🏐', icon: 'sports-volleyball' },
    { id: 'rugby', name: 'Rugby 🏈', icon: 'sports-rugby' },
    { id: 'cricket', name: 'Cricket 🏏', icon: 'sports-cricket' },
  ];

  const locations = [
    'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Meru', 'Nyeri', 'Machakos'
  ];

  const ageGroups = ['5-8 years', '9-12 years', '13-16 years', '17+ years'];
  const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];

  // Mock camp data
  const mockCamps = [
    {
      id: '1',
      name: 'Elite Football Academy',
      sport: 'Football',
      location: 'Nairobi',
      rating: 4.8,
      priceRange: 'KSh 5,000 - 15,000',
      image: 'https://via.placeholder.com/300x200/667eea/white?text=Football+Academy',
      description: 'Professional football training for young talents',
      ageRange: '8-18 years',
      facilities: ['Full-size pitch', 'Gym', 'Changing rooms'],
      programs: ['Weekend Training', 'Holiday Camps', 'Professional Track'],
      verified: true,
      distance: '2.5 km',
      reviews: 124,
    },
    {
      id: '2',
      name: 'Splash Swimming Center',
      sport: 'Swimming',
      location: 'Nairobi',
      rating: 4.6,
      priceRange: 'KSh 3,000 - 8,000',
      image: 'https://via.placeholder.com/300x200/4facfe/white?text=Swimming+Center',
      description: 'Learn to swim with certified instructors',
      ageRange: '4-16 years',
      facilities: ['Olympic pool', 'Kids pool', 'Lockers'],
      programs: ['Learn to Swim', 'Competitive Training', 'Water Safety'],
      verified: true,
      distance: '1.8 km',
      reviews: 89,
    },
    {
      id: '3',
      name: 'Court Kings Basketball',
      sport: 'Basketball',
      location: 'Nairobi',
      rating: 4.7,
      priceRange: 'KSh 4,000 - 12,000',
      image: 'https://via.placeholder.com/300x200/f093fb/white?text=Basketball+Court',
      description: 'Develop your basketball skills with pro coaches',
      ageRange: '10-18 years',
      facilities: ['Indoor courts', 'Training equipment', 'Video analysis'],
      programs: ['Skills Camp', 'Team Training', 'Individual Sessions'],
      verified: false,
      distance: '3.2 km',
      reviews: 67,
    },
  ];

  useEffect(() => {
    StatusBar.setBarStyle('light-content', true);
    StatusBar.setTranslucent(true);
    
    Animated.timing(fadeInAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Simulate loading camps
    setTimeout(() => {
      // dispatch(loadNearbyColleges());
    }, 1000);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Vibration.vibrate(50);
    
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('🔄 Refreshed!', 'Camp listings have been updated');
    }, 2000);
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.length > 2) {
      // dispatch(searchCamps({ query, sport: selectedSport, location: selectedLocation }));
    }
  };

  const toggleFavorite = (campId) => {
    Vibration.vibrate(30);
    const newFavorites = new Set(favoriteIds);
    if (newFavorites.has(campId)) {
      newFavorites.delete(campId);
    } else {
      newFavorites.add(campId);
    }
    setFavoriteIds(newFavorites);
  };

  const handleCampPress = (camp) => {
    Vibration.vibrate(50);
    Alert.alert(
      '🏆 Camp Details',
      `Opening detailed view for ${camp.name}. This feature is coming soon!`,
      [
        { text: 'Contact Camp', onPress: () => handleContact(camp) },
        { text: 'OK', style: 'default' }
      ]
    );
  };

  const handleContact = (camp) => {
    Alert.alert(
      '📞 Contact Camp',
      `Contact details for ${camp.name}:\n\n📧 Email: info@${camp.name.toLowerCase().replace(/\s+/g, '')}.com\n📱 Phone: +254 XXX XXX XXX\n\nDirect messaging feature coming soon!`
    );
  };

  const handleBookTrial = (camp) => {
    Vibration.vibrate(50);
    Alert.alert(
      '🎯 Book Trial Session',
      `Book a trial session at ${camp.name}? This will connect you with their booking system.`,
      [
        {
          text: 'Book Now',
          onPress: () => Alert.alert('✅ Booking Request Sent!', 'The camp will contact you within 24 hours.')
        },
        { text: 'Later', style: 'cancel' }
      ]
    );
  };

  const renderHeader = () => {
    const headerOpacity = scrollY.interpolate({
      inputRange: [0, 100],
      outputRange: [1, 0.9],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={{ opacity: headerOpacity }}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={{
            paddingTop: StatusBar.currentHeight + SPACING.large,
            paddingHorizontal: SPACING.medium,
            paddingBottom: SPACING.large,
            borderBottomLeftRadius: 25,
            borderBottomRightRadius: 25,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.medium }}>
            <Avatar.Icon size={50} icon="sports" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
            <View style={{ marginLeft: SPACING.medium, flex: 1 }}>
              <Text style={[TEXT_STYLES.h2, { color: 'white', marginBottom: 4 }]}>
                Find Your Camp! 🏆
              </Text>
              <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.8)' }]}>
                Discover amazing sports academies near you
              </Text>
            </View>
            <IconButton
              icon="filter-list"
              iconColor="white"
              size={24}
              onPress={() => setShowFilters(true)}
              style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
            />
          </View>

          <Searchbar
            placeholder="Search camps, sports, locations..."
            onChangeText={handleSearch}
            value={searchQuery}
            style={{
              backgroundColor: 'white',
              borderRadius: 15,
              elevation: 3,
            }}
            iconColor={COLORS.primary}
            inputStyle={{ fontSize: 16 }}
          />
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderSportsFilter = () => (
    <View style={{ marginVertical: SPACING.medium }}>
      <Text style={[TEXT_STYLES.h3, { marginHorizontal: SPACING.medium, marginBottom: SPACING.small }]}>
        Popular Sports ⚽
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: SPACING.medium }}
      >
        {sports.map((sport) => (
          <Chip
            key={sport.id}
            selected={selectedSport === sport.id}
            onPress={() => {
              Vibration.vibrate(30);
              setSelectedSport(selectedSport === sport.id ? '' : sport.id);
            }}
            style={{
              marginRight: SPACING.small,
              backgroundColor: selectedSport === sport.id ? COLORS.primary : COLORS.background,
            }}
            textStyle={{ color: selectedSport === sport.id ? 'white' : COLORS.text }}
            icon={sport.icon}
          >
            {sport.name}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const renderCampCard = (camp, index) => {
    const cardAnim = new Animated.Value(0);
    
    Animated.timing(cardAnim, {
      toValue: 1,
      duration: 500,
      delay: index * 100,
      useNativeDriver: true,
    }).start();

    return (
      <Animated.View
        key={camp.id}
        style={{
          opacity: cardAnim,
          transform: [{
            translateY: cardAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            }),
          }],
          marginHorizontal: SPACING.medium,
          marginBottom: SPACING.medium,
        }}
      >
        <Card
          style={{
            borderRadius: 15,
            elevation: 4,
            backgroundColor: 'white',
          }}
          onPress={() => handleCampPress(camp)}
        >
          <View style={{ position: 'relative' }}>
            <Image
              source={{ uri: camp.image }}
              style={{
                height: 180,
                borderTopLeftRadius: 15,
                borderTopRightRadius: 15,
              }}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 80,
                borderTopLeftRadius: 15,
                borderTopRightRadius: 15,
                justifyContent: 'flex-end',
                paddingHorizontal: SPACING.medium,
                paddingBottom: SPACING.small,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[TEXT_STYLES.h3, { color: 'white', flex: 1 }]}>
                  {camp.name}
                </Text>
                <TouchableOpacity onPress={() => toggleFavorite(camp.id)}>
                  <Icon
                    name={favoriteIds.has(camp.id) ? 'favorite' : 'favorite-border'}
                    size={24}
                    color={favoriteIds.has(camp.id) ? '#ff6b6b' : 'white'}
                  />
                </TouchableOpacity>
              </View>
            </LinearGradient>
            
            {camp.verified && (
              <Surface
                style={{
                  position: 'absolute',
                  top: SPACING.small,
                  right: SPACING.small,
                  borderRadius: 12,
                  paddingHorizontal: SPACING.small,
                  paddingVertical: 4,
                  backgroundColor: COLORS.success,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Icon name="verified" size={14} color="white" />
                <Text style={{ color: 'white', fontSize: 12, marginLeft: 4, fontWeight: '600' }}>
                  Verified
                </Text>
              </Surface>
            )}
          </View>

          <Card.Content style={{ padding: SPACING.medium }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.small }}>
              <Icon name="location-on" size={16} color={COLORS.primary} />
              <Text style={[TEXT_STYLES.body, { marginLeft: 4, flex: 1 }]}>
                {camp.location} • {camp.distance}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="star" size={16} color="#ffd700" />
                <Text style={[TEXT_STYLES.caption, { marginLeft: 2, fontWeight: '600' }]}>
                  {camp.rating} ({camp.reviews})
                </Text>
              </View>
            </View>

            <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary, marginBottom: SPACING.small }]}>
              {camp.description}
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.small }}>
              <Icon name="groups" size={16} color={COLORS.primary} />
              <Text style={[TEXT_STYLES.caption, { marginLeft: 4 }]}>
                Ages: {camp.ageRange}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.medium }}>
              <Icon name="attach-money" size={16} color={COLORS.success} />
              <Text style={[TEXT_STYLES.caption, { marginLeft: 4, fontWeight: '600' }]}>
                {camp.priceRange}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.medium }}>
              {camp.facilities.slice(0, 3).map((facility, idx) => (
                <Chip
                  key={idx}
                  compact
                  style={{
                    marginRight: SPACING.small,
                    marginBottom: SPACING.small,
                    backgroundColor: COLORS.surface,
                  }}
                  textStyle={{ fontSize: 10 }}
                >
                  {facility}
                </Chip>
              ))}
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Button
                mode="outlined"
                onPress={() => handleContact(camp)}
                style={{ flex: 0.45, borderColor: COLORS.primary }}
                labelStyle={{ color: COLORS.primary }}
                icon="phone"
              >
                Contact
              </Button>
              <Button
                mode="contained"
                onPress={() => handleBookTrial(camp)}
                style={{ flex: 0.45, backgroundColor: COLORS.primary }}
                icon="event"
              >
                Book Trial
              </Button>
            </View>
          </Card.Content>
        </Card>
      </Animated.View>
    );
  };

  const renderFiltersModal = () => (
    <Portal>
      <Modal
        visible={showFilters}
        onDismiss={() => setShowFilters(false)}
        contentContainerStyle={{
          backgroundColor: 'white',
          margin: SPACING.large,
          borderRadius: 20,
          padding: SPACING.large,
          maxHeight: '80%',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.large }}>
          <Icon name="tune" size={24} color={COLORS.primary} />
          <Text style={[TEXT_STYLES.h2, { marginLeft: SPACING.small, flex: 1 }]}>
            Filters
          </Text>
          <IconButton icon="close" onPress={() => setShowFilters(false)} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.small }]}>Location</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: SPACING.large }}
          >
            {locations.map((location) => (
              <Chip
                key={location}
                selected={selectedLocation === location}
                onPress={() => setSelectedLocation(selectedLocation === location ? '' : location)}
                style={{ marginRight: SPACING.small }}
              >
                {location}
              </Chip>
            ))}
          </ScrollView>

          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.small }]}>Age Group</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.large }}>
            {ageGroups.map((age) => (
              <Chip
                key={age}
                selected={selectedAge === age}
                onPress={() => setSelectedAge(selectedAge === age ? '' : age)}
                style={{ marginRight: SPACING.small, marginBottom: SPACING.small }}
              >
                {age}
              </Chip>
            ))}
          </View>

          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.small }]}>Skill Level</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.large }}>
            {skillLevels.map((level) => (
              <Chip
                key={level}
                selected={selectedLevel === level}
                onPress={() => setSelectedLevel(selectedLevel === level ? '' : level)}
                style={{ marginRight: SPACING.small, marginBottom: SPACING.small }}
              >
                {level}
              </Chip>
            ))}
          </View>

          <Divider style={{ marginVertical: SPACING.medium }} />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Button
              mode="outlined"
              onPress={() => {
                setSelectedSport('');
                setSelectedLocation('');
                setSelectedAge('');
                setSelectedLevel('');
              }}
              style={{ flex: 0.45 }}
            >
              Clear All
            </Button>
            <Button
              mode="contained"
              onPress={() => setShowFilters(false)}
              style={{ flex: 0.45, backgroundColor: COLORS.primary }}
            >
              Apply Filters
            </Button>
          </View>
        </ScrollView>
      </Modal>
    </Portal>
  );

  const renderEmptyState = () => (
    <View style={{ 
      alignItems: 'center', 
      justifyContent: 'center', 
      paddingVertical: SPACING.xxLarge,
      paddingHorizontal: SPACING.large 
    }}>
      <Icon name="search-off" size={80} color={COLORS.textSecondary} />
      <Text style={[TEXT_STYLES.h2, { textAlign: 'center', marginTop: SPACING.medium }]}>
        No camps found 🔍
      </Text>
      <Text style={[TEXT_STYLES.body, { textAlign: 'center', color: COLORS.textSecondary, marginTop: SPACING.small }]}>
        Try adjusting your search filters or check back later for new listings
      </Text>
      <Button
        mode="contained"
        onPress={() => {
          setSearchQuery('');
          setSelectedSport('');
          setSelectedLocation('');
        }}
        style={{ marginTop: SPACING.large, backgroundColor: COLORS.primary }}
      >
        Reset Search
      </Button>
    </View>
  );

  return (
    <Animated.View style={{ flex: 1, opacity: fadeInAnim }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {renderHeader()}

      <ScrollView
        style={{ flex: 1, backgroundColor: COLORS.background }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {renderSportsFilter()}

        <View style={{ marginBottom: SPACING.medium }}>
          <Text style={[TEXT_STYLES.h3, { 
            marginHorizontal: SPACING.medium, 
            marginBottom: SPACING.medium 
          }]}>
            {searchQuery ? `Search Results for "${searchQuery}"` : 'Featured Camps Near You 🌟'}
          </Text>

          {mockCamps.length > 0 ? (
            mockCamps.map((camp, index) => renderCampCard(camp, index))
          ) : (
            renderEmptyState()
          )}
        </View>

        <View style={{ height: SPACING.xxLarge }} />
      </ScrollView>

      {renderFiltersModal()}
    </Animated.View>
  );
};

export default CampSearch;