import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  StatusBar,
  TouchableOpacity,
  Animated,
  Vibration,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  Avatar,
  Surface,
  Portal,
  Searchbar,
  FAB,
  IconButton,
  ProgressBar,
  Badge,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import constants (these would be defined in your constants file)
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  background: '#f5f5f5',
  white: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e0e0e0',
  warning: '#FF9800',
  info: '#2196F3',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subheading: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  body: {
    fontSize: 16,
    color: COLORS.text,
  },
  caption: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
};

const SearchTrainingPartners = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector(state => state.auth);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedAvailability, setSelectedAvailability] = useState('');
  const [partners, setPartners] = useState([]);
  const [filteredPartners, setFilteredPartners] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [connections, setConnections] = useState(new Set());
  const [sortBy, setSortBy] = useState('distance'); // distance, level, activity, mutual_friends
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Mock data for demonstration
  const mockPartners = [
    {
      id: '1',
      name: 'Alex Johnson',
      age: 24,
      sport: 'Football',
      level: 'Intermediate',
      location: 'Nairobi, Kenya',
      distance: '0.8 km',
      avatar: null,
      isOnline: true,
      lastActive: 'Active now',
      description: 'Looking for football training partners for evening sessions. Love to work on skills and fitness together!',
      preferredTimes: ['Evening', 'Weekend'],
      goals: ['Fitness', 'Skill Development', 'Competition'],
      experience: '3 years',
      trainingFrequency: '4x/week',
      mutualConnections: 3,
      completedSessions: 47,
      reliability: 96,
      interests: ['Outdoor Training', 'Team Sports', 'Fitness'],
      languages: ['English', 'Swahili'],
      achievements: ['Local League Player', 'Fitness Enthusiast'],
      sessionTypes: ['1-on-1', 'Small Group'],
      equipment: ['Football Boots', 'Training Cones', 'Water Bottle'],
    },
    {
      id: '2',
      name: 'Maria Santos',
      age: 22,
      sport: 'Basketball',
      level: 'Advanced',
      location: 'Westlands, Nairobi',
      distance: '2.1 km',
      avatar: null,
      isOnline: false,
      lastActive: '2 hours ago',
      description: 'Former college player seeking serious training partners for skill improvement and competitive play.',
      preferredTimes: ['Morning', 'Afternoon'],
      goals: ['Competition', 'Professional Development'],
      experience: '8 years',
      trainingFrequency: '6x/week',
      mutualConnections: 7,
      completedSessions: 89,
      reliability: 98,
      interests: ['Competitive Basketball', 'Strength Training', 'Mental Training'],
      languages: ['English', 'Spanish'],
      achievements: ['College All-Star', 'Regional Champion', 'MVP Award'],
      sessionTypes: ['1-on-1', 'Team Practice'],
      equipment: ['Basketball', 'Resistance Bands', 'Agility Ladder'],
    },
    {
      id: '3',
      name: 'David Kimutai',
      age: 19,
      sport: 'Athletics',
      level: 'Beginner',
      location: 'Karen, Nairobi',
      distance: '3.5 km',
      avatar: null,
      isOnline: true,
      lastActive: 'Active now',
      description: 'New to athletics, looking for motivating training partners to start my running journey. Let\'s grow together!',
      preferredTimes: ['Morning', 'Evening'],
      goals: ['Fitness', 'Personal Best', 'Marathon Training'],
      experience: '6 months',
      trainingFrequency: '3x/week',
      mutualConnections: 1,
      completedSessions: 12,
      reliability: 85,
      interests: ['Running', 'Endurance Training', 'Health & Wellness'],
      languages: ['English', 'Swahili', 'Kikuyu'],
      achievements: ['First 5K Completed', 'Weight Loss Journey'],
      sessionTypes: ['Running Buddy', 'Group Training'],
      equipment: ['Running Shoes', 'Fitness Tracker', 'Hydration Pack'],
    },
    {
      id: '4',
      name: 'Sarah Mitchell',
      age: 26,
      sport: 'Swimming',
      level: 'Advanced',
      location: 'Kilimani, Nairobi',
      distance: '1.7 km',
      avatar: null,
      isOnline: true,
      lastActive: 'Active now',
      description: 'Competitive swimmer looking for training partners for technique improvement and lap training sessions.',
      preferredTimes: ['Early Morning', 'Evening'],
      goals: ['Competition', 'Technique', 'Endurance'],
      experience: '12 years',
      trainingFrequency: '5x/week',
      mutualConnections: 5,
      completedSessions: 134,
      reliability: 99,
      interests: ['Competitive Swimming', 'Open Water', 'Triathlon'],
      languages: ['English', 'French'],
      achievements: ['National Qualifier', 'Masters Champion', 'Triathlon Finisher'],
      sessionTypes: ['Lap Training', 'Technique Work', 'Open Water'],
      equipment: ['Goggles', 'Kickboard', 'Pull Buoy', 'Fins'],
    },
    {
      id: '5',
      name: 'James Ochieng',
      age: 21,
      sport: 'Tennis',
      level: 'Intermediate',
      location: 'Lavington, Nairobi',
      distance: '4.2 km',
      avatar: null,
      isOnline: false,
      lastActive: '1 hour ago',
      description: 'Tennis enthusiast looking for regular hitting partners. Love to play competitively and improve my game!',
      preferredTimes: ['Afternoon', 'Weekend'],
      goals: ['Competition', 'Skill Development', 'Fun'],
      experience: '5 years',
      trainingFrequency: '4x/week',
      mutualConnections: 2,
      completedSessions: 67,
      reliability: 92,
      interests: ['Singles Play', 'Doubles', 'Tournament Play'],
      languages: ['English', 'Swahili', 'Luo'],
      achievements: ['Club Champion', 'Regional Tournament Winner'],
      sessionTypes: ['Singles', 'Doubles', 'Practice'],
      equipment: ['Tennis Racket', 'Tennis Balls', 'Court Shoes'],
    },
  ];

  const sports = ['Football', 'Basketball', 'Swimming', 'Tennis', 'Athletics', 'Volleyball', 'Rugby'];
  const levels = ['Beginner', 'Intermediate', 'Advanced', 'Professional'];
  const locations = ['Nairobi', 'Westlands', 'Karen', 'Kileleshwa', 'Lavington', 'Kilimani'];
  const availabilityOptions = ['Morning', 'Afternoon', 'Evening', 'Weekend'];

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
    ]).start();

    // Load training partners data
    loadTrainingPartners();
  }, []);

  useEffect(() => {
    filterAndSortPartners();
  }, [searchQuery, selectedSport, selectedLevel, selectedLocation, selectedAvailability, partners, sortBy]);

  const loadTrainingPartners = useCallback(async () => {
    try {
      // In a real app, this would be an API call
      setPartners(mockPartners);
      setFilteredPartners(mockPartners);
    } catch (error) {
      console.error('Error loading training partners:', error);
      Alert.alert('Error', 'Failed to load training partners. Please try again.');
    }
  }, []);

  const filterAndSortPartners = useCallback(() => {
    let filtered = partners.filter(partner => {
      const matchesSearch = partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          partner.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          partner.interests.some(interest => 
                            interest.toLowerCase().includes(searchQuery.toLowerCase())
                          );
      const matchesSport = !selectedSport || partner.sport === selectedSport;
      const matchesLevel = !selectedLevel || partner.level === selectedLevel;
      const matchesLocation = !selectedLocation || partner.location.includes(selectedLocation);
      const matchesAvailability = !selectedAvailability || 
                                partner.preferredTimes.includes(selectedAvailability);
      
      return matchesSearch && matchesSport && matchesLevel && matchesLocation && matchesAvailability;
    });

    // Sort partners
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return parseFloat(a.distance) - parseFloat(b.distance);
        case 'level':
          const levelOrder = { 'Beginner': 0, 'Intermediate': 1, 'Advanced': 2, 'Professional': 3 };
          return levelOrder[a.level] - levelOrder[b.level];
        case 'activity':
          return new Date(b.lastActive) - new Date(a.lastActive);
        case 'mutual_friends':
          return b.mutualConnections - a.mutualConnections;
        default:
          return parseFloat(a.distance) - parseFloat(b.distance);
      }
    });
    
    setFilteredPartners(filtered);
  }, [searchQuery, selectedSport, selectedLevel, selectedLocation, selectedAvailability, partners, sortBy]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Vibration.vibrate(50);
    await loadTrainingPartners();
    setRefreshing(false);
  }, [loadTrainingPartners]);

  const toggleConnection = (partnerId) => {
    Vibration.vibrate(30);
    setConnections(prev => {
      const newConnections = new Set(prev);
      if (newConnections.has(partnerId)) {
        newConnections.delete(partnerId);
      } else {
        newConnections.add(partnerId);
      }
      return newConnections;
    });
  };

  const handleConnect = (partner) => {
    toggleConnection(partner.id);
    Alert.alert(
      '🤝 Connection Request',
      connections.has(partner.id) 
        ? `Connection request cancelled for ${partner.name}`
        : `Connection request sent to ${partner.name}!`,
      [{ text: 'Great!', style: 'default' }]
    );
  };

  const handleMessage = (partner) => {
    Vibration.vibrate(30);
    Alert.alert(
      '💬 Feature Coming Soon!',
      'Direct messaging functionality is under development. You can currently send connection requests!',
      [{ text: 'Understood', style: 'default' }]
    );
  };

  const handleViewProfile = (partner) => {
    Vibration.vibrate(30);
    Alert.alert(
      '👤 Feature Coming Soon!',
      'Detailed partner profiles are under development. More features coming soon!',
      [{ text: 'Awesome!', style: 'default' }]
    );
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'Beginner': return COLORS.info;
      case 'Intermediate': return COLORS.warning;
      case 'Advanced': return COLORS.error;
      case 'Professional': return COLORS.secondary;
      default: return COLORS.textSecondary;
    }
  };

  const renderPartnerCard = (partner) => (
    <Animated.View
      key={partner.id}
      style={[
        styles.cardContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity onPress={() => handleViewProfile(partner)} activeOpacity={0.9}>
        <Card style={styles.partnerCard}>
          <View style={styles.cardHeader}>
            <View style={styles.avatarContainer}>
              <Avatar.Text
                size={55}
                label={partner.name.split(' ').map(n => n[0]).join('')}
                style={{ backgroundColor: COLORS.primary }}
              />
              {partner.isOnline && <Badge style={styles.onlineBadge} />}
            </View>
            
            <View style={styles.headerInfo}>
              <View style={styles.nameRow}>
                <Text style={TEXT_STYLES.subheading}>{partner.name}</Text>
                <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.sm }]}>
                  {partner.age}y
                </Text>
              </View>
              
              <View style={styles.sportLevelRow}>
                <Chip 
                  mode="flat" 
                  compact 
                  style={[styles.levelChip, { backgroundColor: `${getLevelColor(partner.level)}20` }]}
                  textStyle={{ color: getLevelColor(partner.level), fontSize: 12 }}
                >
                  {partner.level}
                </Chip>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.primary, fontWeight: '600' }]}>
                  {partner.sport}
                </Text>
              </View>
              
              <View style={styles.locationRow}>
                <Icon name="location-on" size={14} color={COLORS.textSecondary} />
                <Text style={TEXT_STYLES.caption}>{partner.location}</Text>
                <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.sm }]}>
                  • {partner.distance}
                </Text>
              </View>
              
              <View style={styles.activityRow}>
                <Icon 
                  name="circle" 
                  size={8} 
                  color={partner.isOnline ? COLORS.success : COLORS.textSecondary} 
                />
                <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs }]}>
                  {partner.lastActive}
                </Text>
                {partner.mutualConnections > 0 && (
                  <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.sm, color: COLORS.primary }]}>
                    • {partner.mutualConnections} mutual connections
                  </Text>
                )}
              </View>
            </View>
            
            <IconButton
              icon={connections.has(partner.id) ? "person-remove" : "person-add"}
              iconColor={connections.has(partner.id) ? COLORS.error : COLORS.primary}
              size={24}
              onPress={() => handleConnect(partner)}
            />
          </View>

          <Card.Content>
            <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.md }]}>
              {partner.description}
            </Text>
            
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Icon name="fitness-center" size={18} color={COLORS.primary} />
                <Text style={[TEXT_STYLES.caption, { fontWeight: '600' }]}>
                  {partner.trainingFrequency}
                </Text>
                <Text style={TEXT_STYLES.caption}>Training</Text>
              </View>
              <View style={styles.statCard}>
                <Icon name="star" size={18} color={COLORS.warning} />
                <Text style={[TEXT_STYLES.caption, { fontWeight: '600' }]}>
                  {partner.reliability}%
                </Text>
                <Text style={TEXT_STYLES.caption}>Reliable</Text>
              </View>
              <View style={styles.statCard}>
                <Icon name="groups" size={18} color={COLORS.success} />
                <Text style={[TEXT_STYLES.caption, { fontWeight: '600' }]}>
                  {partner.completedSessions}
                </Text>
                <Text style={TEXT_STYLES.caption}>Sessions</Text>
              </View>
              <View style={styles.statCard}>
                <Icon name="schedule" size={18} color={COLORS.info} />
                <Text style={[TEXT_STYLES.caption, { fontWeight: '600' }]}>
                  {partner.experience}
                </Text>
                <Text style={TEXT_STYLES.caption}>Experience</Text>
              </View>
            </View>

            <View style={styles.timesContainer}>
              <Text style={[TEXT_STYLES.caption, { fontWeight: '600', marginBottom: SPACING.xs }]}>
                Preferred Training Times:
              </Text>
              <View style={styles.timesRow}>
                {partner.preferredTimes.map((time, index) => (
                  <Chip key={index} mode="outlined" compact style={styles.timeChip}>
                    {time}
                  </Chip>
                ))}
              </View>
            </View>

            <View style={styles.goalsContainer}>
              <Text style={[TEXT_STYLES.caption, { fontWeight: '600', marginBottom: SPACING.xs }]}>
                Training Goals:
              </Text>
              <View style={styles.goalsRow}>
                {partner.goals.slice(0, 3).map((goal, index) => (
                  <Chip key={index} mode="flat" compact style={styles.goalChip}>
                    {goal}
                  </Chip>
                ))}
                {partner.goals.length > 3 && (
                  <Text style={TEXT_STYLES.caption}>+{partner.goals.length - 3} more</Text>
                )}
              </View>
            </View>

            <View style={styles.interestsContainer}>
              <Text style={[TEXT_STYLES.caption, { fontWeight: '600', marginBottom: SPACING.xs }]}>
                Interests:
              </Text>
              <View style={styles.interestsRow}>
                {partner.interests.slice(0, 2).map((interest, index) => (
                  <Chip key={index} mode="outlined" compact style={styles.interestChip}>
                    {interest}
                  </Chip>
                ))}
                {partner.interests.length > 2 && (
                  <Text style={TEXT_STYLES.caption}>+{partner.interests.length - 2} more</Text>
                )}
              </View>
            </View>
          </Card.Content>

          <Card.Actions style={styles.cardActions}>
            <View style={styles.achievementContainer}>
              <Icon name="jump-rope" size={16} color={COLORS.warning} />
              <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs }]}>
                {partner.achievements[0]}
              </Text>
            </View>
            <Button
              mode="outlined"
              onPress={() => handleMessage(partner)}
              style={styles.actionButton}
              icon="message"
              compact
            >
              Message
            </Button>
            <Button
              mode="contained"
              onPress={() => handleConnect(partner)}
              style={[
                styles.actionButton, 
                { 
                  backgroundColor: connections.has(partner.id) ? COLORS.error : COLORS.primary 
                }
              ]}
              icon={connections.has(partner.id) ? "person-remove" : "person-add"}
              compact
            >
              {connections.has(partner.id) ? 'Cancel' : 'Connect'}
            </Button>
          </Card.Actions>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <View style={styles.sortContainer}>
        <Text style={[TEXT_STYLES.subheading, { marginBottom: SPACING.md }]}>
          Sort by 📊
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'distance', label: 'Distance', icon: 'location-on' },
            { key: 'level', label: 'Skill Level', icon: 'trending-up' },
            { key: 'activity', label: 'Activity', icon: 'access-time' },
            { key: 'mutual_friends', label: 'Mutual Friends', icon: 'group' },
          ].map((sort) => (
            <Chip
              key={sort.key}
              selected={sortBy === sort.key}
              onPress={() => setSortBy(sort.key)}
              style={styles.filterChip}
              icon={sort.icon}
            >
              {sort.label}
            </Chip>
          ))}
        </ScrollView>
      </View>

      <Text style={[TEXT_STYLES.subheading, { marginBottom: SPACING.md, marginTop: SPACING.lg }]}>
        Filter by Sport 🏆
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Chip
          selected={!selectedSport}
          onPress={() => setSelectedSport('')}
          style={styles.filterChip}
        >
          All Sports
        </Chip>
        {sports.map((sport) => (
          <Chip
            key={sport}
            selected={selectedSport === sport}
            onPress={() => setSelectedSport(sport)}
            style={styles.filterChip}
          >
            {sport}
          </Chip>
        ))}
      </ScrollView>

      <Text style={[TEXT_STYLES.subheading, { marginBottom: SPACING.md, marginTop: SPACING.lg }]}>
        Filter by Skill Level 📈
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Chip
          selected={!selectedLevel}
          onPress={() => setSelectedLevel('')}
          style={styles.filterChip}
        >
          All Levels
        </Chip>
        {levels.map((level) => (
          <Chip
            key={level}
            selected={selectedLevel === level}
            onPress={() => setSelectedLevel(level)}
            style={[styles.filterChip, { backgroundColor: selectedLevel === level ? `${getLevelColor(level)}20` : 'transparent' }]}
            textStyle={{ color: selectedLevel === level ? getLevelColor(level) : COLORS.text }}
          >
            {level}
          </Chip>
        ))}
      </ScrollView>

      <Text style={[TEXT_STYLES.subheading, { marginBottom: SPACING.md, marginTop: SPACING.lg }]}>
        Filter by Availability ⏰
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Chip
          selected={!selectedAvailability}
          onPress={() => setSelectedAvailability('')}
          style={styles.filterChip}
        >
          Any Time
        </Chip>
        {availabilityOptions.map((time) => (
          <Chip
            key={time}
            selected={selectedAvailability === time}
            onPress={() => setSelectedAvailability(time)}
            style={styles.filterChip}
          >
            {time}
          </Chip>
        ))}
      </ScrollView>

      <Text style={[TEXT_STYLES.subheading, { marginBottom: SPACING.md, marginTop: SPACING.lg }]}>
        Filter by Location 📍
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Chip
          selected={!selectedLocation}
          onPress={() => setSelectedLocation('')}
          style={styles.filterChip}
        >
          All Locations
        </Chip>
        {locations.map((location) => (
          <Chip
            key={location}
            selected={selectedLocation === location}
            onPress={() => setSelectedLocation(location)}
            style={styles.filterChip}
          >
            {location}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Find Training Partners 🤝</Text>
        <Text style={styles.headerSubtitle}>
          Connect with like-minded athletes in your area
        </Text>
      </LinearGradient>

      <Surface style={styles.searchContainer}>
        <Searchbar
          placeholder="Search by name, interests, or goals..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={TEXT_STYLES.body}
          iconColor={COLORS.primary}
        />
        <IconButton
          icon="tune"
          iconColor={COLORS.primary}
          size={24}
          onPress={() => setShowFilters(!showFilters)}
        />
      </Surface>

      {showFilters && renderFilters()}

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
        <View style={styles.resultsHeader}>
          <Text style={TEXT_STYLES.subheading}>
            {filteredPartners.length} Training Partners 🎯
          </Text>
          {(selectedSport || selectedLevel || selectedLocation || selectedAvailability || sortBy !== 'distance') && (
            <TouchableOpacity
              onPress={() => {
                setSelectedSport('');
                setSelectedLevel('');
                setSelectedLocation('');
                setSelectedAvailability('');
                setSortBy('distance');
                Vibration.vibrate(30);
              }}
              style={styles.clearFilters}
            >
              <Text style={[TEXT_STYLES.caption, { color: COLORS.primary }]}>
                Reset All
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {filteredPartners.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="search-off" size={80} color={COLORS.textSecondary} />
            <Text style={[TEXT_STYLES.subheading, { marginTop: SPACING.md }]}>
              No training partners found
            </Text>
            <Text style={TEXT_STYLES.caption}>
              Try adjusting your search criteria
            </Text>
          </View>
        ) : (
          filteredPartners.map(renderPartnerCard)
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <FAB
        icon="group-add"
        style={styles.fab}
        onPress={() => {
          Vibration.vibrate(50);
          Alert.alert(
            '👥 Feature Coming Soon!',
            'Group training session creation is under development. Stay tuned!',
            [{ text: 'Exciting!', style: 'default' }]
          );
        }}
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
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  headerTitle: {
    ...TEXT_STYLES.heading,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.white,
    opacity: 0.9,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: SPACING.md,
    borderRadius: 12,
    elevation: 2,
  },
  searchBar: {
    flex: 1,
    backgroundColor: 'transparent',
    elevation: 0,
  },
  filtersContainer: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.md,
  },
  sortContainer: {
    marginBottom: SPACING.md,
  },
  filterChip: {
    marginRight: SPACING.sm,
  },
  content: {
    flex: 1,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  clearFilters: {
    padding: SPACING.xs,
  },
  cardContainer: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  partnerCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.md,
  },
  avatarContainer: {
    position: 'relative',
  },
  onlineBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: COLORS.success,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  headerInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  sportLevelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  levelChip: {
    marginRight: SPACING.sm,
    height: 22,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: `${COLORS.primary}05`,
    borderRadius: 12,
    paddingHorizontal: SPACING.sm,
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  timesContainer: {
    marginBottom: SPACING.md,
  },
  timesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  timeChip: {
    marginRight: SPACING.xs,
    marginTop: SPACING.xs,
    backgroundColor: `${COLORS.info}15`,
  },
  goalsContainer: {
    marginBottom: SPACING.md,
  },
  goalsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  goalChip: {
    marginRight: SPACING.xs,
    marginTop: SPACING.xs,
    backgroundColor: `${COLORS.success}15`,
  },
  interestsContainer: {
    marginTop: SPACING.sm,
  },
  interestsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  interestChip: {
    marginRight: SPACING.xs,
    marginTop: SPACING.xs,
    backgroundColor: `${COLORS.warning}15`,
  },
  cardActions: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  achievementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionButton: {
    marginLeft: SPACING.sm,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    marginTop: SPACING.xl,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default SearchTrainingPartners;