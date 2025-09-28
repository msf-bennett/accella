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
  Dimensions,
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
  Badge,
  ProgressBar,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const ClubFinder = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector(state => state.auth);
  const { clubs, searchResults } = useSelector(state => state.clubs);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [selectedMembership, setSelectedMembership] = useState('');
  const [selectedTrainingDays, setSelectedTrainingDays] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeInAnim = useRef(new Animated.Value(0)).current;

  const sports = [
    { id: 'football', name: 'Football ⚽', icon: 'sports-soccer', color: '#4CAF50' },
    { id: 'basketball', name: 'Basketball 🏀', icon: 'sports-basketball', color: '#FF9800' },
    { id: 'tennis', name: 'Tennis 🎾', icon: 'sports-tennis', color: '#2196F3' },
    { id: 'swimming', name: 'Swimming 🏊', icon: 'pool', color: '#00BCD4' },
    { id: 'athletics', name: 'Athletics 🏃', icon: 'directions-run', color: '#9C27B0' },
    { id: 'volleyball', name: 'Volleyball 🏐', icon: 'sports-volleyball', color: '#F44336' },
    { id: 'badminton', name: 'Badminton 🏸', icon: 'sports-tennis', color: '#795548' },
    { id: 'hockey', name: 'Hockey 🏑', icon: 'sports-hockey', color: '#607D8B' },
  ];

  const locations = [
    'Nairobi CBD', 'Westlands', 'Karen', 'Kilimani', 'Parklands', 'Lavington', 'Runda', 'Kileleshwa'
  ];

  const membershipTypes = ['Monthly', 'Quarterly', 'Annual', 'Pay-per-session', 'Trial Package'];
  const trainingDays = ['Weekdays Only', 'Weekends Only', 'Mon-Wed-Fri', 'Tue-Thu-Sat', 'Daily', 'Flexible'];

  // Mock club data
  const mockClubs = [
    {
      id: '1',
      name: 'Nairobi Sports Club',
      sport: 'Football',
      location: 'Nairobi CBD',
      rating: 4.9,
      membershipFee: 'KSh 8,000/month',
      image: 'https://via.placeholder.com/300x200/667eea/white?text=Football+Club',
      description: 'Premier football club with professional coaching and competitive leagues',
      ageRange: '6-18 years',
      facilities: ['2 Full pitches', 'Gym', 'Physiotherapy', 'Cafeteria'],
      programs: ['Youth League', 'Skills Development', 'Goalkeeper Training'],
      verified: true,
      distance: '1.2 km',
      members: 245,
      trainingDays: ['Mon', 'Wed', 'Fri', 'Sat'],
      established: '1985',
      achievements: ['Regional Champions 2023', 'Youth Cup Winners'],
      socialScore: 92,
      nextTrial: '2024-09-15',
      coachRating: 4.8,
      activePrograms: 6,
    },
    {
      id: '2',
      name: 'Aqua Masters Swimming',
      sport: 'Swimming',
      location: 'Westlands',
      rating: 4.7,
      membershipFee: 'KSh 6,500/month',
      image: 'https://via.placeholder.com/300x200/4facfe/white?text=Swimming+Club',
      description: 'Professional swimming club with Olympic-standard facilities',
      ageRange: '5-25 years',
      facilities: ['50m Olympic pool', '25m Training pool', 'Sauna', 'Equipment room'],
      programs: ['Competitive Swimming', 'Water Polo', 'Synchronized Swimming'],
      verified: true,
      distance: '2.8 km',
      members: 189,
      trainingDays: ['Tue', 'Thu', 'Sat', 'Sun'],
      established: '1992',
      achievements: ['National Championships 2023', '15 National Records'],
      socialScore: 88,
      nextTrial: '2024-09-12',
      coachRating: 4.9,
      activePrograms: 4,
    },
    {
      id: '3',
      name: 'Court Warriors Basketball',
      sport: 'Basketball',
      location: 'Karen',
      rating: 4.6,
      membershipFee: 'KSh 7,200/month',
      image: 'https://via.placeholder.com/300x200/f093fb/white?text=Basketball+Club',
      description: 'Elite basketball club focusing on skill development and teamwork',
      ageRange: '8-20 years',
      facilities: ['2 Indoor courts', 'Weight room', 'Video analysis', 'Sports shop'],
      programs: ['Youth Development', '3x3 Basketball', 'Skills Clinics'],
      verified: false,
      distance: '5.1 km',
      members: 156,
      trainingDays: ['Mon', 'Wed', 'Fri'],
      established: '2010',
      achievements: ['Division 1 Champions', 'Best Youth Program 2023'],
      socialScore: 85,
      nextTrial: '2024-09-20',
      coachRating: 4.5,
      activePrograms: 5,
    },
    {
      id: '4',
      name: 'Tennis Elite Academy',
      sport: 'Tennis',
      location: 'Kilimani',
      rating: 4.8,
      membershipFee: 'KSh 9,500/month',
      image: 'https://via.placeholder.com/300x200/00E676/white?text=Tennis+Club',
      description: 'Premium tennis club with world-class coaching and facilities',
      ageRange: '7-18 years',
      facilities: ['6 Clay courts', '4 Hard courts', 'Pro shop', 'Clubhouse'],
      programs: ['Junior Development', 'Tournament Prep', 'Adult Leagues'],
      verified: true,
      distance: '3.4 km',
      members: 98,
      trainingDays: ['Daily'],
      established: '1998',
      achievements: ['National Junior Champions', 'ITF Recognized'],
      socialScore: 94,
      nextTrial: '2024-09-10',
      coachRating: 4.9,
      activePrograms: 8,
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

    // Simulate loading clubs
    setTimeout(() => {
      // dispatch(loadNearbyClubs());
    }, 1000);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Vibration.vibrate(50);
    
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('🔄 Refreshed!', 'Club listings have been updated with the latest information');
    }, 2000);
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.length > 2) {
      // dispatch(searchClubs({ query, sport: selectedSport, location: selectedLocation }));
    }
  };

  const toggleFavorite = (clubId) => {
    Vibration.vibrate(30);
    const newFavorites = new Set(favoriteIds);
    if (newFavorites.has(clubId)) {
      newFavorites.delete(clubId);
    } else {
      newFavorites.add(clubId);
    }
    setFavoriteIds(newFavorites);
  };

  const handleClubPress = (club) => {
    Vibration.vibrate(50);
    Alert.alert(
      '🏆 Club Profile',
      `View detailed profile for ${club.name}.\n\n📍 ${club.location}\n👥 ${club.members} active members\n⭐ ${club.rating} rating\n\nFeature coming soon!`,
      [
        { text: 'Join Club', onPress: () => handleJoinClub(club) },
        { text: 'Book Trial', onPress: () => handleBookTrial(club) },
        { text: 'View Details', style: 'default' }
      ]
    );
  };

  const handleJoinClub = (club) => {
    Vibration.vibrate(50);
    Alert.alert(
      '🎯 Join Club',
      `Ready to join ${club.name}?\n\n💰 Membership: ${club.membershipFee}\n📅 Training: ${club.trainingDays.join(', ')}\n\nThis will start the membership application process.`,
      [
        {
          text: 'Apply Now',
          onPress: () => Alert.alert('✅ Application Sent!', 'The club will review your application and contact you within 48 hours.')
        },
        { text: 'Later', style: 'cancel' }
      ]
    );
  };

  const handleBookTrial = (club) => {
    Vibration.vibrate(50);
    Alert.alert(
      '🎾 Trial Session',
      `Book a trial session at ${club.name}?\n\n📅 Next available: ${club.nextTrial}\n⏰ Duration: 90 minutes\n💰 Fee: Free for first trial\n\nTrial includes:\n• Skills assessment\n• Meet the coach\n• Facility tour`,
      [
        {
          text: 'Book Trial',
          onPress: () => Alert.alert('📅 Trial Booked!', 'Check your email for confirmation and preparation instructions.')
        },
        { text: 'Later', style: 'cancel' }
      ]
    );
  };

  const handleContactClub = (club) => {
    Alert.alert(
      '📞 Contact Club',
      `Get in touch with ${club.name}:\n\n📧 Email: info@${club.name.toLowerCase().replace(/\s+/g, '')}.com\n📱 WhatsApp: +254 XXX XXX XXX\n🌐 Website: www.${club.name.toLowerCase().replace(/\s+/g, '')}.com\n\nDirect messaging feature coming soon!`
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
            <Avatar.Icon size={50} icon="groups" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
            <View style={{ marginLeft: SPACING.medium, flex: 1 }}>
              <Text style={[TEXT_STYLES.h2, { color: 'white', marginBottom: 4 }]}>
                Find Your Club! 🏅
              </Text>
              <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.8)' }]}>
                Join amazing sports communities near you
              </Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <IconButton
                icon={viewMode === 'grid' ? 'view-list' : 'view-module'}
                iconColor="white"
                size={22}
                onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                style={{ backgroundColor: 'rgba(255,255,255,0.1)', marginRight: SPACING.small }}
              />
              <IconButton
                icon="tune"
                iconColor="white"
                size={22}
                onPress={() => setShowFilters(true)}
                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
              />
            </View>
          </View>

          <Searchbar
            placeholder="Search clubs, sports, locations..."
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
        Sports Categories 🏃‍♂️
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: SPACING.medium }}
      >
        {sports.map((sport) => (
          <TouchableOpacity
            key={sport.id}
            onPress={() => {
              Vibration.vibrate(30);
              setSelectedSport(selectedSport === sport.id ? '' : sport.id);
            }}
            style={{
              marginRight: SPACING.medium,
              alignItems: 'center',
              padding: SPACING.small,
            }}
          >
            <Surface
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: selectedSport === sport.id ? sport.color : COLORS.surface,
                elevation: selectedSport === sport.id ? 6 : 2,
              }}
            >
              <Icon
                name={sport.icon}
                size={28}
                color={selectedSport === sport.id ? 'white' : sport.color}
              />
            </Surface>
            <Text
              style={[
                TEXT_STYLES.caption,
                {
                  marginTop: SPACING.small,
                  fontWeight: selectedSport === sport.id ? 'bold' : 'normal',
                  color: selectedSport === sport.id ? sport.color : COLORS.text,
                  textAlign: 'center',
                  width: 70,
                }
              ]}
            >
              {sport.name.split(' ')[0]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderClubCard = (club, index) => {
    const cardAnim = new Animated.Value(0);
    
    Animated.timing(cardAnim, {
      toValue: 1,
      duration: 500,
      delay: index * 100,
      useNativeDriver: true,
    }).start();

    if (viewMode === 'list') {
      return renderListItem(club, cardAnim);
    }

    return (
      <Animated.View
        key={club.id}
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
            borderRadius: 20,
            elevation: 6,
            backgroundColor: 'white',
          }}
          onPress={() => handleClubPress(club)}
        >
          <View style={{ position: 'relative' }}>
            <Image
              source={{ uri: club.image }}
              style={{
                height: 200,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
              }}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 100,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                justifyContent: 'flex-end',
                paddingHorizontal: SPACING.medium,
                paddingBottom: SPACING.medium,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }}>
                  <Text style={[TEXT_STYLES.h3, { color: 'white', marginBottom: 4 }]}>
                    {club.name}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon name="location-on" size={16} color="white" />
                    <Text style={[TEXT_STYLES.caption, { color: 'white', marginLeft: 4 }]}>
                      {club.location} • {club.distance}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => toggleFavorite(club.id)}>
                  <Icon
                    name={favoriteIds.has(club.id) ? 'favorite' : 'favorite-border'}
                    size={26}
                    color={favoriteIds.has(club.id) ? '#ff6b6b' : 'white'}
                  />
                </TouchableOpacity>
              </View>
            </LinearGradient>
            
            {club.verified && (
              <Surface
                style={{
                  position: 'absolute',
                  top: SPACING.medium,
                  right: SPACING.medium,
                  borderRadius: 15,
                  paddingHorizontal: SPACING.small,
                  paddingVertical: 6,
                  backgroundColor: COLORS.success,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Icon name="verified" size={16} color="white" />
                <Text style={{ color: 'white', fontSize: 12, marginLeft: 4, fontWeight: 'bold' }}>
                  Verified
                </Text>
              </Surface>
            )}

            <Surface
              style={{
                position: 'absolute',
                top: SPACING.medium,
                left: SPACING.medium,
                borderRadius: 12,
                paddingHorizontal: SPACING.small,
                paddingVertical: 4,
                backgroundColor: 'rgba(255,255,255,0.9)',
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Icon name="star" size={14} color="#ffd700" />
              <Text style={{ fontSize: 12, marginLeft: 2, fontWeight: 'bold' }}>
                {club.rating}
              </Text>
            </Surface>
          </View>

          <Card.Content style={{ padding: SPACING.medium }}>
            <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary, marginBottom: SPACING.medium }]}>
              {club.description}
            </Text>

            <View style={{ flexDirection: 'row', marginBottom: SPACING.medium }}>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Members</Text>
                <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>{club.members}</Text>
              </View>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Programs</Text>
                <Text style={[TEXT_STYLES.h3, { color: COLORS.secondary }]}>{club.activePrograms}</Text>
              </View>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Since</Text>
                <Text style={[TEXT_STYLES.h3, { color: COLORS.success }]}>{club.established}</Text>
              </View>
            </View>

            <View style={{ marginBottom: SPACING.medium }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                  Community Score
                </Text>
                <Text style={[TEXT_STYLES.caption, { marginLeft: 'auto', fontWeight: 'bold' }]}>
                  {club.socialScore}%
                </Text>
              </View>
              <ProgressBar
                progress={club.socialScore / 100}
                color={COLORS.primary}
                style={{ height: 6, borderRadius: 3 }}
              />
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.small }}>
              <Icon name="schedule" size={16} color={COLORS.primary} />
              <Text style={[TEXT_STYLES.caption, { marginLeft: 4 }]}>
                Training: {club.trainingDays.join(', ')}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.medium }}>
              <Icon name="attach-money" size={16} color={COLORS.success} />
              <Text style={[TEXT_STYLES.caption, { marginLeft: 4, fontWeight: '600' }]}>
                {club.membershipFee}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.medium }}>
              {club.facilities.slice(0, 2).map((facility, idx) => (
                <Chip
                  key={idx}
                  compact
                  style={{
                    marginRight: SPACING.small,
                    marginBottom: SPACING.small,
                    backgroundColor: COLORS.surface,
                  }}
                  textStyle={{ fontSize: 10 }}
                  icon="check-circle"
                >
                  {facility}
                </Chip>
              ))}
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Button
                mode="outlined"
                onPress={() => handleBookTrial(club)}
                style={{ flex: 0.48, borderColor: COLORS.primary }}
                labelStyle={{ color: COLORS.primary, fontSize: 12 }}
                icon="event-available"
              >
                Trial
              </Button>
              <Button
                mode="contained"
                onPress={() => handleJoinClub(club)}
                style={{ flex: 0.48, backgroundColor: COLORS.primary }}
                labelStyle={{ fontSize: 12 }}
                icon="group-add"
              >
                Join Club
              </Button>
            </View>
          </Card.Content>
        </Card>
      </Animated.View>
    );
  };

  const renderListItem = (club, cardAnim) => (
    <Animated.View
      key={club.id}
      style={{
        opacity: cardAnim,
        transform: [{
          translateX: cardAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [-50, 0],
          }),
        }],
        marginHorizontal: SPACING.medium,
        marginBottom: SPACING.small,
      }}
    >
      <Card
        style={{
          borderRadius: 15,
          elevation: 3,
          backgroundColor: 'white',
        }}
        onPress={() => handleClubPress(club)}
      >
        <Card.Content style={{ padding: SPACING.medium }}>
          <View style={{ flexDirection: 'row' }}>
            <Image
              source={{ uri: club.image }}
              style={{
                width: 80,
                height: 80,
                borderRadius: 12,
              }}
              resizeMode="cover"
            />
            <View style={{ flex: 1, marginLeft: SPACING.medium }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }}>
                  <Text style={[TEXT_STYLES.h4, { marginBottom: 4 }]}>
                    {club.name}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Icon name="location-on" size={14} color={COLORS.primary} />
                    <Text style={[TEXT_STYLES.caption, { marginLeft: 2 }]}>
                      {club.location}
                    </Text>
                    {club.verified && (
                      <Badge
                        style={{ backgroundColor: COLORS.success, marginLeft: SPACING.small }}
                        size={16}
                      />
                    )}
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon name="star" size={14} color="#ffd700" />
                    <Text style={[TEXT_STYLES.caption, { marginLeft: 2, marginRight: SPACING.medium }]}>
                      {club.rating}
                    </Text>
                    <Icon name="group" size={14} color={COLORS.secondary} />
                    <Text style={[TEXT_STYLES.caption, { marginLeft: 2 }]}>
                      {club.members}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => toggleFavorite(club.id)}>
                  <Icon
                    name={favoriteIds.has(club.id) ? 'favorite' : 'favorite-border'}
                    size={20}
                    color={favoriteIds.has(club.id) ? '#ff6b6b' : COLORS.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.success, fontWeight: '600', marginTop: 4 }]}>
                {club.membershipFee}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

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
            Filter Clubs
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

          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.small }]}>Membership Type</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.large }}>
            {membershipTypes.map((type) => (
              <Chip
                key={type}
                selected={selectedMembership === type}
                onPress={() => setSelectedMembership(selectedMembership === type ? '' : type)}
                style={{ marginRight: SPACING.small, marginBottom: SPACING.small }}
              >
                {type}
              </Chip>
            ))}
          </View>

          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.small }]}>Training Schedule</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.large }}>
            {trainingDays.map((schedule) => (
              <Chip
                key={schedule}
                selected={selectedTrainingDays === schedule}
                onPress={() => setSelectedTrainingDays(selectedTrainingDays === schedule ? '' : schedule)}
                style={{ marginRight: SPACING.small, marginBottom: SPACING.small }}
              >
                {schedule}
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
                setSelectedMembership('');
                setSelectedTrainingDays('');
              }}
              style={{ flex: 0.45 }}
            >
              Clear All
            </Button>
            <Button
              mode="contained"
              onPress={() => {
                Vibration.vibrate(50);
                setShowFilters(false);
                Alert.alert('🔍 Filters Applied!', 'Club listings have been filtered based on your preferences');
              }}
              style={{ flex: 0.45, backgroundColor: COLORS.primary }}
            >
              Apply Filters
            </Button>
          </View>
        </ScrollView>
      </Modal>
    </Portal>
  );

  const renderStatsSection = () => (
    <View style={{ 
      marginHorizontal: SPACING.medium,
      marginBottom: SPACING.medium,
    }}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{
          borderRadius: 15,
          padding: SPACING.medium,
        }}
      >
        <Text style={[TEXT_STYLES.h3, { color: 'white', marginBottom: SPACING.medium }]}>
          Club Discovery Stats 📊
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={[TEXT_STYLES.h2, { color: 'white', fontWeight: 'bold' }]}>
              {mockClubs.length}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
              Active Clubs
            </Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={[TEXT_STYLES.h2, { color: 'white', fontWeight: 'bold' }]}>
              {sports.length}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
              Sports Available
            </Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={[TEXT_STYLES.h2, { color: 'white', fontWeight: 'bold' }]}>
              {mockClubs.reduce((sum, club) => sum + club.members, 0)}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
              Total Members
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
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
        No clubs found 🔍
      </Text>
      <Text style={[TEXT_STYLES.body, { textAlign: 'center', color: COLORS.textSecondary, marginTop: SPACING.small }]}>
        Try adjusting your search filters or explore different sports and locations
      </Text>
      <Button
        mode="contained"
        onPress={() => {
          setSearchQuery('');
          setSelectedSport('');
          setSelectedLocation('');
          setSelectedMembership('');
          setSelectedTrainingDays('');
          Vibration.vibrate(50);
        }}
        style={{ marginTop: SPACING.large, backgroundColor: COLORS.primary }}
        icon="refresh"
      >
        Reset Search
      </Button>
    </View>
  );

  const renderQuickActions = () => (
    <View style={{ 
      marginHorizontal: SPACING.medium,
      marginBottom: SPACING.medium,
    }}>
      <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.medium }]}>
        Quick Actions ⚡
      </Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <TouchableOpacity
          onPress={() => {
            Vibration.vibrate(30);
            Alert.alert('📍 Nearby Clubs', 'Finding clubs within 5km of your location...');
          }}
          style={{
            flex: 0.32,
            backgroundColor: COLORS.primary,
            borderRadius: 12,
            padding: SPACING.medium,
            alignItems: 'center',
          }}
        >
          <Icon name="near-me" size={24} color="white" />
          <Text style={[TEXT_STYLES.caption, { color: 'white', marginTop: SPACING.small, textAlign: 'center' }]}>
            Nearby
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => {
            Vibration.vibrate(30);
            Alert.alert('⭐ Top Rated', 'Showing highest rated clubs in your area...');
          }}
          style={{
            flex: 0.32,
            backgroundColor: COLORS.secondary,
            borderRadius: 12,
            padding: SPACING.medium,
            alignItems: 'center',
          }}
        >
          <Icon name="star" size={24} color="white" />
          <Text style={[TEXT_STYLES.caption, { color: 'white', marginTop: SPACING.small, textAlign: 'center' }]}>
            Top Rated
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => {
            Vibration.vibrate(30);
            Alert.alert('🆓 Free Trials', 'Clubs offering free trial sessions...');
          }}
          style={{
            flex: 0.32,
            backgroundColor: COLORS.success,
            borderRadius: 12,
            padding: SPACING.medium,
            alignItems: 'center',
          }}
        >
          <Icon name="event-available" size={24} color="white" />
          <Text style={[TEXT_STYLES.caption, { color: 'white', marginTop: SPACING.small, textAlign: 'center' }]}>
            Free Trials
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const filteredClubs = mockClubs.filter(club => {
    const matchesSearch = !searchQuery || 
      club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      club.sport.toLowerCase().includes(searchQuery.toLowerCase()) ||
      club.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSport = !selectedSport || club.sport.toLowerCase() === selectedSport;
    const matchesLocation = !selectedLocation || club.location.includes(selectedLocation);
    
    return matchesSearch && matchesSport && matchesLocation;
  });

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
        
        {renderStatsSection()}

        {renderQuickActions()}

        <View style={{ marginBottom: SPACING.medium }}>
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginHorizontal: SPACING.medium,
            marginBottom: SPACING.medium 
          }}>
            <Text style={[TEXT_STYLES.h3]}>
              {searchQuery || selectedSport || selectedLocation ? 
                `Search Results (${filteredClubs.length})` : 
                'Featured Clubs Near You 🌟'}
            </Text>
            <Surface
              style={{
                borderRadius: 20,
                paddingHorizontal: SPACING.small,
                paddingVertical: 4,
                backgroundColor: COLORS.primary,
              }}
            >
              <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                {filteredClubs.length} clubs
              </Text>
            </Surface>
          </View>

          {filteredClubs.length > 0 ? (
            filteredClubs.map((club, index) => renderClubCard(club, index))
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

export default ClubFinder;