import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Animated,
  Alert,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ImageBackground,
  Vibration,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  Surface,
  Searchbar,
  Portal,
  Modal,
  ProgressBar,
  FAB,
  Badge,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const TournamentFinder = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { tournaments, loading } = useSelector(state => state.discovery);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;
  const cardAnimations = useRef([]).current;

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [filters, setFilters] = useState({
    ageGroup: 'all',
    location: 'all',
    entryFee: 'all',
    startDate: 'all',
    type: 'all',
  });
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [favoritesList, setFavoritesList] = useState([]);

  // Mock tournament data
  const [tournamentsData] = useState([
    {
      id: '1',
      name: 'Youth Football Championship 2025',
      sport: 'Football',
      type: 'Championship',
      level: 'Intermediate',
      ageGroup: '12-15',
      location: 'Nairobi Sports Club',
      city: 'Nairobi',
      country: 'Kenya',
      startDate: '2025-09-15',
      endDate: '2025-09-17',
      registrationDeadline: '2025-08-15',
      entryFee: 'KSh 2,500',
      maxTeams: 32,
      registeredTeams: 28,
      prizePool: 'KSh 150,000',
      image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400',
      organizer: 'Kenya Football Association',
      rating: 4.8,
      participantReviews: 145,
      format: '11v11',
      surfaceType: 'Grass',
      duration: '3 days',
      amenities: ['Parking', 'Refreshments', 'First Aid', 'Live Streaming'],
      description: 'Premier youth football tournament featuring the best young talents from across Kenya.',
      requirements: ['Birth Certificate', 'Medical Certificate', 'Registration Form'],
      contact: {
        phone: '+254 712 345 678',
        email: 'tournaments@kfa.ke',
        website: 'www.kfa.ke/youth-championship'
      },
      isFavorite: true,
      isRegistered: false,
      badges: ['Popular', 'Verified'],
      difficulty: 'Competitive',
      lastYearParticipants: 480,
    },
    {
      id: '2',
      name: 'Junior Tennis Open',
      sport: 'Tennis',
      type: 'Open Tournament',
      level: 'Beginner',
      ageGroup: '8-12',
      location: 'Parklands Tennis Club',
      city: 'Nairobi',
      country: 'Kenya',
      startDate: '2025-10-05',
      endDate: '2025-10-07',
      registrationDeadline: '2025-09-20',
      entryFee: 'KSh 1,800',
      maxTeams: 64,
      registeredTeams: 45,
      prizePool: 'KSh 80,000',
      image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400',
      organizer: 'Nairobi Tennis Academy',
      rating: 4.6,
      participantReviews: 89,
      format: 'Singles & Doubles',
      surfaceType: 'Hard Court',
      duration: '3 days',
      amenities: ['Equipment Rental', 'Coaching', 'Refreshments', 'Awards Ceremony'],
      description: 'Perfect introduction to competitive tennis for young players.',
      requirements: ['Birth Certificate', 'Parental Consent', 'Club Membership'],
      contact: {
        phone: '+254 720 987 654',
        email: 'juniors@parklandstennis.co.ke',
        website: 'www.parklandstennis.co.ke'
      },
      isFavorite: false,
      isRegistered: true,
      badges: ['Family Friendly', 'Beginner'],
      difficulty: 'Recreational',
      lastYearParticipants: 128,
    },
    {
      id: '3',
      name: 'Swimming Championships',
      sport: 'Swimming',
      type: 'Championship',
      level: 'Advanced',
      ageGroup: '13-16',
      location: 'Aquatic Centre Nairobi',
      city: 'Nairobi',
      country: 'Kenya',
      startDate: '2025-11-12',
      endDate: '2025-11-14',
      registrationDeadline: '2025-10-15',
      entryFee: 'KSh 3,200',
      maxTeams: 24,
      registeredTeams: 19,
      prizePool: 'KSh 200,000',
      image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400',
      organizer: 'Kenya Swimming Federation',
      rating: 4.9,
      participantReviews: 203,
      format: 'Individual & Relay',
      surfaceType: '50m Pool',
      duration: '3 days',
      amenities: ['Timing System', 'Video Analysis', 'Medical Support', 'Live Results'],
      description: 'Elite swimming competition for aspiring champions.',
      requirements: ['Medical Clearance', 'Qualifying Times', 'Insurance'],
      contact: {
        phone: '+254 733 456 789',
        email: 'competitions@swimkenya.org',
        website: 'www.swimkenya.org'
      },
      isFavorite: true,
      isRegistered: false,
      badges: ['Elite', 'Qualifying Event'],
      difficulty: 'Elite',
      lastYearParticipants: 156,
    },
    {
      id: '4',
      name: 'Basketball Skills Challenge',
      sport: 'Basketball',
      type: 'Skills Competition',
      level: 'Intermediate',
      ageGroup: '10-14',
      location: 'Nyayo Stadium',
      city: 'Nairobi',
      country: 'Kenya',
      startDate: '2025-09-28',
      endDate: '2025-09-29',
      registrationDeadline: '2025-09-10',
      entryFee: 'KSh 1,500',
      maxTeams: 40,
      registeredTeams: 32,
      prizePool: 'KSh 75,000',
      image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400',
      organizer: 'Kenya Basketball Federation',
      rating: 4.7,
      participantReviews: 112,
      format: 'Individual Skills',
      surfaceType: 'Indoor Court',
      duration: '2 days',
      amenities: ['Professional Coaching', 'Skills Stations', 'Awards', 'Certificates'],
      description: 'Showcase your basketball skills in various challenge categories.',
      requirements: ['Registration Form', 'Medical Form', 'Team Jersey'],
      contact: {
        phone: '+254 745 123 456',
        email: 'skills@basketballkenya.com',
        website: 'www.basketballkenya.com'
      },
      isFavorite: false,
      isRegistered: false,
      badges: ['Skills Focus', 'Development'],
      difficulty: 'Development',
      lastYearParticipants: 240,
    },
    {
      id: '5',
      name: 'Athletics Meet',
      sport: 'Athletics',
      type: 'Track & Field',
      level: 'All Levels',
      ageGroup: '8-18',
      location: 'Moi International Sports Centre',
      city: 'Kasarani',
      country: 'Kenya',
      startDate: '2025-12-03',
      endDate: '2025-12-05',
      registrationDeadline: '2025-11-15',
      entryFee: 'KSh 2,000',
      maxTeams: 50,
      registeredTeams: 38,
      prizePool: 'KSh 300,000',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
      organizer: 'Athletics Kenya',
      rating: 4.8,
      participantReviews: 267,
      format: 'Individual Events',
      surfaceType: 'Track & Field',
      duration: '3 days',
      amenities: ['Professional Timing', 'Drug Testing', 'Medical Team', 'Broadcasting'],
      description: 'Discover and nurture the next generation of Kenyan athletics stars.',
      requirements: ['Birth Certificate', 'Medical Certificate', 'Club Affiliation'],
      contact: {
        phone: '+254 722 987 321',
        email: 'youth@athleticskenya.or.ke',
        website: 'www.athleticskenya.or.ke'
      },
      isFavorite: true,
      isRegistered: false,
      badges: ['National Event', 'All Ages'],
      difficulty: 'All Levels',
      lastYearParticipants: 890,
    },
  ]);

  const sports = [
    { key: 'all', label: 'All Sports', icon: 'sports', color: COLORS.primary },
    { key: 'football', label: 'Football', icon: 'sports-soccer', color: '#4CAF50' },
    { key: 'basketball', label: 'Basketball', icon: 'sports-basketball', color: '#FF9800' },
    { key: 'tennis', label: 'Tennis', icon: 'sports-tennis', color: '#E91E63' },
    { key: 'swimming', label: 'Swimming', icon: 'pool', color: '#2196F3' },
    { key: 'athletics', label: 'Athletics', icon: 'directions-run', color: '#9C27B0' },
  ];

  const levels = [
    { key: 'all', label: 'All Levels' },
    { key: 'beginner', label: 'Beginner' },
    { key: 'intermediate', label: 'Intermediate' },
    { key: 'advanced', label: 'Advanced' },
  ];

  // Animation setup
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
      }),
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 1000,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Vibration.vibrate(50);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  // Search handler
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  // Filter functions
  const getFilteredTournaments = () => {
    let filtered = tournamentsData;

    if (selectedSport !== 'all') {
      filtered = filtered.filter(tournament => 
        tournament.sport.toLowerCase() === selectedSport.toLowerCase()
      );
    }

    if (selectedLevel !== 'all') {
      filtered = filtered.filter(tournament => 
        tournament.level.toLowerCase() === selectedLevel.toLowerCase()
      );
    }

    if (searchQuery) {
      filtered = filtered.filter(tournament =>
        tournament.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tournament.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tournament.sport.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  // Tournament actions
  const handleRegisterTournament = (tournamentId) => {
    const tournament = tournamentsData.find(t => t.id === tournamentId);
    Vibration.vibrate([100, 200, 100]);
    
    Alert.alert(
      'Register for Tournament',
      `Register your child for "${tournament.name}"?\n\nEntry Fee: ${tournament.entryFee}\nRegistration Deadline: ${new Date(tournament.registrationDeadline).toLocaleDateString()}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Register Now',
          onPress: () => {
            Alert.alert('Success', 'Registration initiated! 🏆 You\'ll receive confirmation details via email.');
          }
        }
      ]
    );
  };

  const handleToggleFavorite = (tournamentId) => {
    setFavoritesList(prev => {
      if (prev.includes(tournamentId)) {
        return prev.filter(id => id !== tournamentId);
      } else {
        Vibration.vibrate(100);
        return [...prev, tournamentId];
      }
    });
    Alert.alert('Success', favoritesList.includes(tournamentId) ? 'Removed from favorites' : 'Added to favorites! ⭐');
  };

  const handleViewDetails = (tournament) => {
    Alert.alert(
      tournament.name,
      `${tournament.description}\n\nLocation: ${tournament.location}\nDates: ${new Date(tournament.startDate).toLocaleDateString()} - ${new Date(tournament.endDate).toLocaleDateString()}\nEntry Fee: ${tournament.entryFee}\nPrize Pool: ${tournament.prizePool}\n\nContact: ${tournament.contact.phone}`,
      [
        { text: 'Close', style: 'cancel' },
        {
          text: 'Register',
          onPress: () => handleRegisterTournament(tournament.id)
        }
      ]
    );
  };

  const handleContactOrganizer = (tournament) => {
    Alert.alert(
      'Contact Organizer',
      `Contact ${tournament.organizer} about "${tournament.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          onPress: () => Alert.alert('Success', `Calling ${tournament.contact.phone} 📞`)
        },
        {
          text: 'Email',
          onPress: () => Alert.alert('Success', `Email sent to ${tournament.contact.email} 📧`)
        }
      ]
    );
  };

  // Get tournament status
  const getTournamentStatus = (tournament) => {
    const today = new Date();
    const startDate = new Date(tournament.startDate);
    const registrationDeadline = new Date(tournament.registrationDeadline);

    if (today > registrationDeadline) {
      return { status: 'closed', label: 'Registration Closed', color: COLORS.error };
    }
    if (tournament.registeredTeams >= tournament.maxTeams) {
      return { status: 'full', label: 'Tournament Full', color: COLORS.warning };
    }
    if (today < registrationDeadline) {
      return { status: 'open', label: 'Open for Registration', color: COLORS.success };
    }
    return { status: 'upcoming', label: 'Starting Soon', color: COLORS.primary };
  };

  // Render tournament card
  const renderTournamentCard = ({ item, index }) => {
    const status = getTournamentStatus(item);
    const availability = ((item.maxTeams - item.registeredTeams) / item.maxTeams) * 100;

    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          marginBottom: SPACING.lg,
        }}
      >
        <Card style={styles.tournamentCard} elevation={4}>
          <View style={styles.tournamentImageContainer}>
            <ImageBackground
              source={{ uri: item.image }}
              style={styles.tournamentImage}
              imageStyle={styles.imageStyle}
            >
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.imageGradient}
              >
                <View style={styles.tournamentBadges}>
                  <View style={styles.badgeContainer}>
                    {item.badges.map((badge, idx) => (
                      <Chip
                        key={idx}
                        mode="flat"
                        style={[styles.badge, { backgroundColor: badge === 'Popular' ? COLORS.error : COLORS.success }]}
                        textStyle={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}
                      >
                        {badge === 'Popular' ? '🔥' : '✓'} {badge}
                      </Chip>
                    ))}
                  </View>
                  <IconButton
                    icon={item.isFavorite || favoritesList.includes(item.id) ? 'favorite' : 'favorite-border'}
                    size={24}
                    iconColor={item.isFavorite || favoritesList.includes(item.id) ? COLORS.error : 'white'}
                    onPress={() => handleToggleFavorite(item.id)}
                    style={styles.favoriteButton}
                  />
                </View>
                
                <View style={styles.tournamentInfo}>
                  <Text style={[TEXT_STYLES.h2, { color: 'white', marginBottom: 4 }]}>
                    {item.name}
                  </Text>
                  <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.9)', marginBottom: 6 }]}>
                    📍 {item.location} • {item.duration}
                  </Text>
                  <View style={styles.ratingContainer}>
                    <Icon name="star" size={16} color={COLORS.warning} />
                    <Text style={[TEXT_STYLES.caption, { color: 'white', marginLeft: 4 }]}>
                      {item.rating} ({item.participantReviews} reviews)
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </ImageBackground>
          </View>

          <Card.Content style={styles.cardContent}>
            <View style={styles.tournamentHeader}>
              <Chip
                mode="outlined"
                style={[styles.sportChip, { borderColor: sports.find(s => s.key === item.sport.toLowerCase())?.color || COLORS.primary }]}
                textStyle={{ color: sports.find(s => s.key === item.sport.toLowerCase())?.color || COLORS.primary, fontSize: 12 }}
                icon={() => <Icon name={sports.find(s => s.key === item.sport.toLowerCase())?.icon || 'sports'} size={16} color={sports.find(s => s.key === item.sport.toLowerCase())?.color || COLORS.primary} />}
              >
                {item.sport}
              </Chip>
              <View style={styles.priceContainer}>
                <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>
                  {item.entryFee}
                </Text>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                  entry fee
                </Text>
              </View>
            </View>

            <View style={styles.tournamentDetails}>
              <View style={styles.detailRow}>
                <Icon name="event" size={16} color={COLORS.textSecondary} />
                <Text style={[TEXT_STYLES.caption, { marginLeft: 6, color: COLORS.textSecondary }]}>
                  {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Icon name="group" size={16} color={COLORS.textSecondary} />
                <Text style={[TEXT_STYLES.caption, { marginLeft: 6, color: COLORS.textSecondary }]}>
                  Ages {item.ageGroup} • {item.level} Level
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Icon name="business" size={16} color={COLORS.textSecondary} />
                <Text style={[TEXT_STYLES.caption, { marginLeft: 6, color: COLORS.textSecondary }]}>
                  by {item.organizer}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Icon name="jump-rope" size={16} color={COLORS.textSecondary} />
                <Text style={[TEXT_STYLES.caption, { marginLeft: 6, color: COLORS.textSecondary }]}>
                  Prize Pool: {item.prizePool}
                </Text>
              </View>
            </View>

            <View style={styles.statusContainer}>
              <Chip
                mode="flat"
                style={[styles.statusChip, { backgroundColor: status.color }]}
                textStyle={{ color: 'white', fontSize: 11, fontWeight: 'bold' }}
              >
                {status.label}
              </Chip>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                {item.maxTeams - item.registeredTeams} spots left
              </Text>
            </View>

            <ProgressBar
              progress={item.registeredTeams / item.maxTeams}
              color={availability < 20 ? COLORS.error : availability < 50 ? COLORS.warning : COLORS.success}
              style={styles.progressBar}
            />

            <View style={styles.amenitiesContainer}>
              <Text style={[TEXT_STYLES.body, { color: COLORS.text, marginBottom: 8, fontWeight: '600' }]}>
                🎯 What's Included:
              </Text>
              <View style={styles.amenitiesList}>
                {item.amenities.slice(0, 3).map((amenity, idx) => (
                  <Chip
                    key={idx}
                    mode="outlined"
                    style={styles.amenityChip}
                    textStyle={{ fontSize: 11 }}
                  >
                    {amenity}
                  </Chip>
                ))}
                {item.amenities.length > 3 && (
                  <TouchableOpacity onPress={() => handleViewDetails(item)}>
                    <Text style={[TEXT_STYLES.caption, { color: COLORS.primary, marginTop: 4 }]}>
                      +{item.amenities.length - 3} more →
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={styles.actionContainer}>
              <Button
                mode={item.isRegistered ? "outlined" : "contained"}
                onPress={() => item.isRegistered ? handleViewDetails(item) : handleRegisterTournament(item.id)}
                style={[
                  styles.registerButton,
                  item.isRegistered && styles.registeredButton
                ]}
                buttonColor={item.isRegistered ? 'transparent' : COLORS.primary}
                textColor={item.isRegistered ? COLORS.primary : 'white'}
                contentStyle={styles.buttonContent}
                labelStyle={{ fontSize: 14, fontWeight: 'bold' }}
                disabled={status.status === 'closed' || status.status === 'full'}
              >
                {item.isRegistered ? 'View Registration ✓' : 
                 status.status === 'closed' ? 'Registration Closed' :
                 status.status === 'full' ? 'Tournament Full' : 'Register Now'}
              </Button>
              <IconButton
                icon="chat"
                size={20}
                onPress={() => handleContactOrganizer(item)}
                style={styles.contactButton}
              />
              <IconButton
                icon="info"
                size={20}
                onPress={() => handleViewDetails(item)}
                style={styles.infoButton}
              />
            </View>
          </Card.Content>
        </Card>
      </Animated.View>
    );
  };

  // Render sport tabs
  const renderSportTabs = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.sportContainer}
      contentContainerStyle={styles.sportContent}
    >
      {sports.map((sport) => (
        <TouchableOpacity
          key={sport.key}
          onPress={() => setSelectedSport(sport.key)}
          style={[
            styles.sportTab,
            selectedSport === sport.key && { backgroundColor: sport.color, borderColor: sport.color }
          ]}
        >
          <Icon
            name={sport.icon}
            size={18}
            color={selectedSport === sport.key ? 'white' : sport.color}
          />
          <Text
            style={[
              TEXT_STYLES.caption,
              {
                color: selectedSport === sport.key ? 'white' : sport.color,
                marginLeft: 6,
                fontWeight: selectedSport === sport.key ? 'bold' : 'normal'
              }
            ]}
          >
            {sport.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  // Render level filter
  const renderLevelFilter = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.levelContainer}
      contentContainerStyle={styles.levelContent}
    >
      {levels.map((level) => (
        <Chip
          key={level.key}
          selected={selectedLevel === level.key}
          onPress={() => setSelectedLevel(level.key)}
          style={[
            styles.levelChip,
            selectedLevel === level.key && styles.selectedLevelChip
          ]}
          selectedColor={selectedLevel === level.key ? 'white' : COLORS.primary}
        >
          {level.label}
        </Chip>
      ))}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="transparent" translucent barStyle="light-content" />
      
      <Animated.View
        style={{
          opacity: headerAnim,
          transform: [{ translateY: Animated.multiply(headerAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [-50, 0]
          }), 1) }]
        }}
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.header}
        >
          <Text style={[TEXT_STYLES.h1, styles.headerTitle]}>Tournament Finder 🏆</Text>
          <Text style={[TEXT_STYLES.body, styles.headerSubtitle]}>
            Discover amazing competitions for your young athlete!
          </Text>
          
          <View style={styles.statsContainer}>
            <Surface style={styles.statCard}>
              <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>50+</Text>
              <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
                Tournaments
              </Text>
            </Surface>
            <Surface style={[styles.statCard, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
              <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>2K+</Text>
              <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
                Young Athletes
              </Text>
            </Surface>
            <Surface style={[styles.statCard, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
              <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>12</Text>
              <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
                Sports
              </Text>
            </Surface>
          </View>
        </LinearGradient>
      </Animated.View>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search tournaments, locations..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchbar}
          iconColor={COLORS.primary}
          inputStyle={TEXT_STYLES.body}
        />
        <IconButton
          icon="filter-variant"
          size={24}
          onPress={() => setShowFilterModal(true)}
          style={styles.filterButton}
          iconColor={COLORS.primary}
        />
      </View>

      {renderSportTabs()}
      
      <View style={styles.levelFilterContainer}>
        <Text style={[TEXT_STYLES.body, styles.filterLabel]}>Competition Level:</Text>
        {renderLevelFilter()}
      </View>

      <FlatList
        data={getFilteredTournaments()}
        renderItem={renderTournamentCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            progressBackgroundColor={COLORS.background}
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Icon name="jump-rope" size={64} color={COLORS.textSecondary} />
            <Text style={[TEXT_STYLES.h3, { color: COLORS.textSecondary, marginTop: SPACING.md }]}>
              No tournaments found
            </Text>
            <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary, textAlign: 'center' }]}>
              Try adjusting your search or filters to discover more competitions
            </Text>
            <Button
              mode="outlined"
              onPress={() => {
                setSearchQuery('');
                setSelectedSport('all');
                setSelectedLevel('all');
              }}
              style={styles.clearFiltersButton}
            >
              Clear Filters
            </Button>
          </View>
        )}
      />

      <FAB
        icon="favorite"
        style={styles.favoritesFab}
        onPress={() => {
          Alert.alert(
            'Favorites',
            `You have ${favoritesList.length} favorite tournaments saved! 💖`,
            [{ text: 'OK', style: 'default' }]
          );
        }}
      />

      {/* Filter Modal */}
      <Portal>
        <Modal
          visible={showFilterModal}
          onDismiss={() => setShowFilterModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Surface style={styles.filterModal}>
            <View style={styles.modalHeader}>
              <Text style={[TEXT_STYLES.h2, { color: COLORS.text }]}>Tournament Filters</Text>
              <IconButton
                icon="close"
                onPress={() => setShowFilterModal(false)}
              />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScrollView}>
              <View style={styles.filterSection}>
                <Text style={[TEXT_STYLES.h3, styles.filterSectionTitle]}>Age Group</Text>
                <View style={styles.filterChips}>
                  {['All Ages', '6-8', '9-11', '12-14', '15-17', '18+'].map((age, index) => (
                    <Chip
                      key={index}
                      selected={filters.ageGroup === age.toLowerCase().replace(' ', '').replace('-', '')}
                      onPress={() => setFilters(prev => ({ ...prev, ageGroup: age.toLowerCase().replace(' ', '').replace('-', '') }))}
                      style={styles.filterChip}
                    >
                      {age}
                    </Chip>
                  ))}
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={[TEXT_STYLES.h3, styles.filterSectionTitle]}>Location</Text>
                <View style={styles.filterChips}>
                  {['All Locations', 'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'].map((location, index) => (
                    <Chip
                      key={index}
                      selected={filters.location === location.toLowerCase().replace(' ', '')}
                      onPress={() => setFilters(prev => ({ ...prev, location: location.toLowerCase().replace(' ', '') }))}
                      style={styles.filterChip}
                    >
                      {location}
                    </Chip>
                  ))}
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={[TEXT_STYLES.h3, styles.filterSectionTitle]}>Entry Fee Range</Text>
                <View style={styles.filterChips}>
                  {['All Fees', 'Free', 'Under KSh 1,000', 'KSh 1,000-2,500', 'KSh 2,500-5,000', 'Above KSh 5,000'].map((fee, index) => (
                    <Chip
                      key={index}
                      selected={filters.entryFee === fee.toLowerCase().replace(' ', '').replace('-', '').replace('ksh', '').replace(',', '')}
                      onPress={() => setFilters(prev => ({ ...prev, entryFee: fee.toLowerCase().replace(' ', '').replace('-', '').replace('ksh', '').replace(',', '') }))}
                      style={styles.filterChip}
                    >
                      {fee}
                    </Chip>
                  ))}
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={[TEXT_STYLES.h3, styles.filterSectionTitle]}>Tournament Type</Text>
                <View style={styles.filterChips}>
                  {['All Types', 'Championship', 'Open Tournament', 'Skills Competition', 'Track & Field', 'League'].map((type, index) => (
                    <Chip
                      key={index}
                      selected={filters.type === type.toLowerCase().replace(' ', '').replace('&', '')}
                      onPress={() => setFilters(prev => ({ ...prev, type: type.toLowerCase().replace(' ', '').replace('&', '') }))}
                      style={styles.filterChip}
                    >
                      {type}
                    </Chip>
                  ))}
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={[TEXT_STYLES.h3, styles.filterSectionTitle]}>Start Date</Text>
                <View style={styles.filterChips}>
                  {['Any Time', 'This Month', 'Next Month', 'Next 3 Months', 'This Year'].map((date, index) => (
                    <Chip
                      key={index}
                      selected={filters.startDate === date.toLowerCase().replace(' ', '')}
                      onPress={() => setFilters(prev => ({ ...prev, startDate: date.toLowerCase().replace(' ', '') }))}
                      style={styles.filterChip}
                    >
                      {date}
                    </Chip>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => {
                  setFilters({
                    ageGroup: 'all',
                    location: 'all',
                    entryFee: 'all',
                    startDate: 'all',
                    type: 'all',
                  });
                }}
                style={styles.clearButton}
              >
                Clear All
              </Button>
              <Button
                mode="contained"
                onPress={() => setShowFilterModal(false)}
                style={styles.applyButton}
              >
                Apply Filters
              </Button>
            </View>
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
    padding: SPACING.lg,
    paddingTop: SPACING.xl + 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    color: 'white',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  statCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: SPACING.sm,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 70,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.background,
  },
  searchbar: {
    flex: 1,
    backgroundColor: COLORS.surface,
    elevation: 0,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterButton: {
    marginLeft: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sportContainer: {
    backgroundColor: COLORS.background,
    paddingVertical: SPACING.sm,
  },
  sportContent: {
    paddingHorizontal: SPACING.lg,
  },
  sportTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  levelFilterContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  filterLabel: {
    color: COLORS.text,
    marginBottom: SPACING.xs,
    fontWeight: '600',
  },
  levelContainer: {
    marginTop: SPACING.xs,
  },
  levelContent: {
    paddingRight: SPACING.lg,
  },
  levelChip: {
    marginRight: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  selectedLevelChip: {
    backgroundColor: COLORS.primary,
  },
  listContainer: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  tournamentCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },
  tournamentImageContainer: {
    height: 200,
    position: 'relative',
  },
  tournamentImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  imageStyle: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  imageGradient: {
    flex: 1,
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  tournamentBadges: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  badge: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  favoriteButton: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    margin: 0,
  },
  tournamentInfo: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardContent: {
    padding: SPACING.lg,
  },
  tournamentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sportChip: {
    backgroundColor: 'transparent',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  tournamentDetails: {
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  statusChip: {
    marginBottom: SPACING.xs,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  amenitiesContainer: {
    marginBottom: SPACING.md,
  },
  amenitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  amenityChip: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderColor: COLORS.primary,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  registerButton: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  registeredButton: {
    borderColor: COLORS.primary,
  },
  buttonContent: {
    paddingVertical: SPACING.xs,
  },
  contactButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.xs,
  },
  infoButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  clearFiltersButton: {
    marginTop: SPACING.lg,
  },
  favoritesFab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 20,
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    margin: SPACING.lg,
  },
  filterModal: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalScrollView: {
    maxHeight: '70%',
  },
  filterSection: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterSectionTitle: {
    color: COLORS.text,
    marginBottom: SPACING.md,
    fontWeight: '600',
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  filterChip: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  clearButton: {
    flex: 0.45,
  },
  applyButton: {
    flex: 0.45,
  },
});

export default TournamentFinder;