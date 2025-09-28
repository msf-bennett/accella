import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Animated,
  Alert,
  Dimensions,
  Vibration,
  ImageBackground,
} from 'react-native';
import {
  Card,
  Searchbar,
  Button,
  Chip,
  Avatar,
  Surface,
  Portal,
  Modal,
  IconButton,
  ProgressBar,
  Badge,
  Divider,
  FAB,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import your design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mock data for fitness competitions
const MOCK_COMPETITIONS = [
  {
    id: '1',
    title: '30-Day Push-Up Challenge',
    type: 'Individual Challenge',
    category: 'Strength',
    difficulty: 'Beginner',
    duration: '30 days',
    startDate: '2024-09-01',
    endDate: '2024-09-30',
    participants: 2547,
    maxParticipants: 5000,
    prize: '$500 Cash Prize',
    entryFee: 'Free',
    status: 'Open',
    organizer: 'FitLife Community',
    organizerImage: 'https://via.placeholder.com/50x50',
    description: 'Transform your upper body strength with our progressive 30-day push-up challenge.',
    rules: ['Daily push-up targets', 'Photo/video proof required', 'Rest days allowed'],
    requirements: ['Smartphone camera', 'Basic fitness level'],
    leaderboard: [
      { name: 'John Smith', score: 450, rank: 1 },
      { name: 'Sarah Johnson', score: 420, rank: 2 },
      { name: 'Mike Wilson', score: 395, rank: 3 },
    ],
    hashtags: ['#PushUpChallenge', '#StrengthTraining', '#30DayFit'],
    featured: true,
    verified: true,
    joinedUsers: new Set(),
  },
  {
    id: '2',
    title: 'Virtual Marathon Series',
    type: 'Group Competition',
    category: 'Endurance',
    difficulty: 'Intermediate',
    duration: '3 months',
    startDate: '2024-10-01',
    endDate: '2024-12-31',
    participants: 1250,
    maxParticipants: 2000,
    prize: 'Medal + Certificate',
    entryFee: '$25',
    status: 'Registration Open',
    organizer: 'Global Running Club',
    organizerImage: 'https://via.placeholder.com/50x50',
    description: 'Complete marathon distances over 3 months with runners worldwide.',
    rules: ['42.195km total distance', 'GPS tracking required', 'Monthly checkpoints'],
    requirements: ['Running app', 'GPS device', 'Medical clearance'],
    leaderboard: [
      { name: 'Emma Davis', score: '3:45:22', rank: 1 },
      { name: 'Alex Rodriguez', score: '3:52:10', rank: 2 },
      { name: 'Lisa Chen', score: '4:01:33', rank: 3 },
    ],
    hashtags: ['#VirtualMarathon', '#RunningChallenge', '#Endurance'],
    featured: false,
    verified: true,
    joinedUsers: new Set(),
  },
  {
    id: '3',
    title: 'Yoga Flow Championship',
    type: 'Skill Competition',
    category: 'Flexibility',
    difficulty: 'Advanced',
    duration: '2 weeks',
    startDate: '2024-09-15',
    endDate: '2024-09-30',
    participants: 345,
    maxParticipants: 500,
    prize: 'Yoga Retreat Prize',
    entryFee: '$15',
    status: 'Starting Soon',
    organizer: 'Zen Wellness Studio',
    organizerImage: 'https://via.placeholder.com/50x50',
    description: 'Showcase your yoga skills in this prestigious flow championship.',
    rules: ['3-minute routine', 'Video submission', 'Original choreography'],
    requirements: ['Yoga mat', 'Video equipment', '2+ years experience'],
    leaderboard: [
      { name: 'Maya Patel', score: '9.5/10', rank: 1 },
      { name: 'Jennifer Kim', score: '9.2/10', rank: 2 },
      { name: 'Rachel Green', score: '8.9/10', rank: 3 },
    ],
    hashtags: ['#YogaChampionship', '#FlexibilityChallenge', '#Mindfulness'],
    featured: true,
    verified: true,
    joinedUsers: new Set(),
  },
  {
    id: '4',
    title: 'CrossFit Open Qualifier',
    type: 'Team Competition',
    category: 'CrossFit',
    difficulty: 'Advanced',
    duration: '5 weeks',
    startDate: '2024-10-15',
    endDate: '2024-11-20',
    participants: 892,
    maxParticipants: 1500,
    prize: 'Championship Entry',
    entryFee: '$50',
    status: 'Coming Soon',
    organizer: 'CrossFit Elite',
    organizerImage: 'https://via.placeholder.com/50x50',
    description: 'Qualify for the regional championships in this intense CrossFit challenge.',
    rules: ['5 weekly workouts', 'RX and scaled divisions', 'Video judge required'],
    requirements: ['CrossFit gym access', 'Basic equipment', 'Judge certification'],
    leaderboard: [
      { name: 'Team Alpha', score: '2150 pts', rank: 1 },
      { name: 'Iron Warriors', score: '2098 pts', rank: 2 },
      { name: 'Fit Squad', score: '2045 pts', rank: 3 },
    ],
    hashtags: ['#CrossFitOpen', '#TeamChallenge', '#Elite'],
    featured: false,
    verified: true,
    joinedUsers: new Set(),
  },
];

const COMPETITION_CATEGORIES = [
  { name: 'All', icon: 'fitness-center', color: '#667eea' },
  { name: 'Strength', icon: 'fitness-center', color: '#E74C3C' },
  { name: 'Endurance', icon: 'directions-run', color: '#2ECC71' },
  { name: 'Flexibility', icon: 'self-improvement', color: '#9B59B6' },
  { name: 'CrossFit', icon: 'sports-gymnastics', color: '#F39C12' },
  { name: 'Sports', icon: 'sports', color: '#3498DB' },
];

const COMPETITION_TYPES = ['All Types', 'Individual Challenge', 'Group Competition', 'Skill Competition', 'Team Competition'];
const DIFFICULTY_LEVELS = ['All Levels', 'Beginner', 'Intermediate', 'Advanced', 'Professional'];
const STATUS_FILTERS = ['All Status', 'Open', 'Registration Open', 'Starting Soon', 'Active', 'Completed'];

const FitnessCompetitions = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All Levels');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [competitions, setCompetitions] = useState(MOCK_COMPETITIONS);
  const [filteredCompetitions, setFilteredCompetitions] = useState(MOCK_COMPETITIONS);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [joinedCompetitions, setJoinedCompetitions] = useState(new Set(['1'])); // User joined competition 1
  const [watchlist, setWatchlist] = useState(new Set(['3'])); // User watching competition 3
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Initialize animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for featured competitions
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();
  }, []);

  // Filter competitions
  useEffect(() => {
    let filtered = competitions.filter(competition => {
      const matchesSearch = competition.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          competition.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          competition.hashtags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'All' || competition.category === selectedCategory;
      const matchesType = selectedType === 'All Types' || competition.type === selectedType;
      const matchesDifficulty = selectedDifficulty === 'All Levels' || competition.difficulty === selectedDifficulty;
      const matchesStatus = selectedStatus === 'All Status' || competition.status === selectedStatus;
      
      return matchesSearch && matchesCategory && matchesType && matchesDifficulty && matchesStatus;
    });
    
    // Sort by featured first, then by participants
    filtered.sort((a, b) => {
      if (a.featured !== b.featured) return b.featured - a.featured;
      return b.participants - a.participants;
    });
    
    setFilteredCompetitions(filtered);
  }, [searchQuery, selectedCategory, selectedType, selectedDifficulty, selectedStatus, competitions]);

  // Refresh functionality
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setRefreshing(false);
    } catch (error) {
      setRefreshing(false);
      Alert.alert('Error', 'Failed to refresh competitions');
    }
  }, []);

  // Toggle watchlist
  const toggleWatchlist = useCallback((competitionId) => {
    Vibration.vibrate(50);
    const newWatchlist = new Set(watchlist);
    if (newWatchlist.has(competitionId)) {
      newWatchlist.delete(competitionId);
    } else {
      newWatchlist.add(competitionId);
    }
    setWatchlist(newWatchlist);
  }, [watchlist]);

  // Handle competition join
  const handleJoinCompetition = (competition) => {
    Vibration.vibrate(50);
    if (joinedCompetitions.has(competition.id)) {
      Alert.alert(
        '🏆 Already Joined',
        `You're already participating in "${competition.title}"! Check your progress in the app.`,
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        '🚀 Join Competition',
        `Ready to join "${competition.title}"? Entry fee: ${competition.entryFee}. This feature is coming soon!`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Join Now', style: 'default' }
        ]
      );
    }
  };

  // Handle leaderboard view
  const handleViewLeaderboard = (competition) => {
    Vibration.vibrate(30);
    setSelectedCompetition(competition);
    setShowLeaderboard(true);
  };

  // Handle competition details
  const handleCompetitionPress = (competition) => {
    Vibration.vibrate(30);
    Alert.alert(
      'Competition Details',
      `This feature is coming soon! You selected: ${competition.title}`,
      [{ text: 'OK' }]
    );
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return COLORS.success;
      case 'Registration Open': return COLORS.primary;
      case 'Starting Soon': return COLORS.secondary;
      case 'Active': return '#FF6B35';
      case 'Completed': return COLORS.textSecondary;
      default: return COLORS.textSecondary;
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Open': return 'play-circle-filled';
      case 'Registration Open': return 'how-to-reg';
      case 'Starting Soon': return 'schedule';
      case 'Active': return 'trending-up';
      case 'Completed': return 'check-circle';
      default: return 'info';
    }
  };

  // Render category chips
  const renderCategoryChip = ({ item: category }) => (
    <TouchableOpacity
      onPress={() => setSelectedCategory(category.name)}
      style={[
        styles.categoryChip,
        selectedCategory === category.name && styles.selectedCategoryChip
      ]}
    >
      <LinearGradient
        colors={selectedCategory === category.name ? [category.color, `${category.color}CC`] : ['#f8f9fa', '#f8f9fa']}
        style={styles.categoryChipGradient}
      >
        <Icon 
          name={category.icon} 
          size={20} 
          color={selectedCategory === category.name ? 'white' : category.color} 
        />
        <Text style={[
          styles.categoryChipText,
          selectedCategory === category.name && styles.selectedCategoryChipText
        ]}>
          {category.name}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  // Render competition card
  const renderCompetitionCard = ({ item: competition }) => {
    const isJoined = joinedCompetitions.has(competition.id);
    const isWatched = watchlist.has(competition.id);
    const participationRate = (competition.participants / competition.maxParticipants) * 100;
    
    return (
      <Animated.View style={[
        styles.competitionCardContainer,
        { 
          opacity: fadeAnim,
          transform: competition.featured ? [{ scale: pulseAnim }] : []
        }
      ]}>
        <Card style={[
          styles.competitionCard,
          competition.featured && styles.featuredCard
        ]} elevation={competition.featured ? 6 : 3}>
          <TouchableOpacity onPress={() => handleCompetitionPress(competition)}>
            
            {/* Card Header */}
            <View style={styles.cardHeader}>
              {competition.featured && (
                <LinearGradient
                  colors={['#FFD700', '#FFA500']}
                  style={styles.featuredBanner}
                >
                  <Icon name="star" size={16} color="white" />
                  <Text style={styles.featuredText}>FEATURED</Text>
                </LinearGradient>
              )}
              
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.headerGradient}
              >
                <View style={styles.headerContent}>
                  <View style={styles.headerTop}>
                    <View style={styles.titleSection}>
                      <Text style={styles.competitionTitle} numberOfLines={2}>
                        {competition.title}
                      </Text>
                      <View style={styles.typeRow}>
                        <Chip 
                          mode="outlined" 
                          textStyle={styles.typeChipText}
                          style={styles.typeChip}
                        >
                          {competition.type}
                        </Chip>
                        {competition.verified && (
                          <Icon name="verified" size={18} color="#FFD700" style={styles.verifiedIcon} />
                        )}
                      </View>
                    </View>
                    
                    <TouchableOpacity 
                      onPress={() => toggleWatchlist(competition.id)}
                      style={styles.watchButton}
                    >
                      <Icon 
                        name={isWatched ? "bookmark" : "bookmark-border"} 
                        size={24} 
                        color="white" 
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.organizerSection}>
                    <Avatar.Image 
                      source={{ uri: competition.organizerImage }} 
                      size={32}
                      style={styles.organizerAvatar}
                    />
                    <Text style={styles.organizerName}>by {competition.organizer}</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>

            {/* Status Badge */}
            <View style={styles.statusContainer}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(competition.status) }]}>
                <Icon name={getStatusIcon(competition.status)} size={16} color="white" />
                <Text style={styles.statusText}>{competition.status}</Text>
              </View>
              
              <View style={styles.difficultyBadge}>
                <Text style={styles.difficultyText}>{competition.difficulty}</Text>
              </View>
            </View>

            {/* Competition Details */}
            <View style={styles.competitionDetails}>
              <Text style={styles.description} numberOfLines={2}>
                {competition.description}
              </Text>

              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <Icon name="schedule" size={16} color={COLORS.primary} />
                  <Text style={styles.detailText}>{competition.duration}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Icon name="people" size={16} color={COLORS.primary} />
                  <Text style={styles.detailText}>{competition.participants} joined</Text>
                </View>
                <View style={styles.detailItem}>
                  <Icon name="jump-rope" size={16} color={COLORS.primary} />
                  <Text style={styles.detailText}>{competition.prize}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Icon name="payment" size={16} color={COLORS.primary} />
                  <Text style={styles.detailText}>{competition.entryFee}</Text>
                </View>
              </View>

              {/* Participation Progress */}
              <View style={styles.participationSection}>
                <View style={styles.participationHeader}>
                  <Text style={styles.participationText}>
                    {competition.participants} / {competition.maxParticipants} participants
                  </Text>
                  <Text style={styles.participationPercentage}>
                    {Math.round(participationRate)}% full
                  </Text>
                </View>
                <ProgressBar 
                  progress={participationRate / 100} 
                  color={participationRate > 80 ? COLORS.error : COLORS.success}
                  style={styles.participationBar}
                />
              </View>

              {/* Hashtags */}
              <View style={styles.hashtagsSection}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {competition.hashtags.map((hashtag, index) => (
                    <Chip 
                      key={index}
                      mode="outlined"
                      textStyle={styles.hashtagText}
                      style={styles.hashtagChip}
                    >
                      {hashtag}
                    </Chip>
                  ))}
                </ScrollView>
              </View>

              <Divider style={styles.divider} />

              {/* Card Footer */}
              <View style={styles.cardFooter}>
                <Button 
                  mode="outlined" 
                  icon="leaderboard"
                  style={styles.leaderboardButton}
                  labelStyle={styles.leaderboardButtonText}
                  onPress={() => handleViewLeaderboard(competition)}
                >
                  Leaderboard
                </Button>
                
                <Button 
                  mode="contained" 
                  icon={isJoined ? "check" : "add"}
                  style={[
                    styles.joinButton,
                    isJoined && styles.joinedButton
                  ]}
                  labelStyle={styles.joinButtonText}
                  onPress={() => handleJoinCompetition(competition)}
                  disabled={isJoined}
                >
                  {isJoined ? 'Joined' : 'Join Now'}
                </Button>
              </View>
            </View>
          </TouchableOpacity>
        </Card>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header with gradient */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Animated.View style={[styles.headerContent, { transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.headerTitle}>🏆 Fitness Competitions</Text>
          <Text style={styles.headerSubtitle}>Challenge yourself and compete globally</Text>
        </Animated.View>
      </LinearGradient>

      <ScrollView
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
        {/* Search bar */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search competitions, organizers, hashtags..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            inputStyle={styles.searchInput}
            iconColor={COLORS.primary}
          />
          
          <IconButton
            icon="tune"
            size={24}
            iconColor={COLORS.primary}
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          />
        </View>

        {/* Categories */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Competition Categories</Text>
          <FlatList
            data={COMPETITION_CATEGORIES}
            renderItem={renderCategoryChip}
            keyExtractor={(item) => item.name}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          />
        </View>

        {/* Results header */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}>
            {filteredCompetitions.length} competitions available
          </Text>
          <View style={styles.sortButton}>
            <Icon name="sort" size={16} color={COLORS.textSecondary} />
            <Text style={styles.sortText}>Featured First</Text>
          </View>
        </View>

        {/* Competitions List */}
        <View style={styles.competitionsSection}>
          <FlatList
            data={filteredCompetitions}
            renderItem={renderCompetitionCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Icon name="jump-rope" size={64} color={COLORS.textSecondary} />
                <Text style={styles.emptyTitle}>No competitions found</Text>
                <Text style={styles.emptySubtitle}>
                  Try adjusting your search or filters to find more competitions
                </Text>
              </View>
            )}
          />
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => Alert.alert('Create Competition', 'Feature coming soon!')}
        label="Create"
      />

      {/* Filter Modal */}
      <Portal>
        <Modal
          visible={showFilters}
          onDismiss={() => setShowFilters(false)}
          contentContainerStyle={styles.modalContent}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>Filter Competitions</Text>
            
            <Text style={styles.filterSectionTitle}>Competition Type</Text>
            <View style={styles.filterOptionsRow}>
              {COMPETITION_TYPES.map((type) => (
                <Chip
                  key={type}
                  mode={selectedType === type ? "flat" : "outlined"}
                  selected={selectedType === type}
                  onPress={() => setSelectedType(type)}
                  style={styles.modalFilterChip}
                  textStyle={styles.modalFilterChipText}
                >
                  {type}
                </Chip>
              ))}
            </View>

            <Text style={styles.filterSectionTitle}>Difficulty Level</Text>
            <View style={styles.filterOptionsRow}>
              {DIFFICULTY_LEVELS.map((level) => (
                <Chip
                  key={level}
                  mode={selectedDifficulty === level ? "flat" : "outlined"}
                  selected={selectedDifficulty === level}
                  onPress={() => setSelectedDifficulty(level)}
                  style={styles.modalFilterChip}
                  textStyle={styles.modalFilterChipText}
                >
                  {level}
                </Chip>
              ))}
            </View>

            <Text style={styles.filterSectionTitle}>Status</Text>
            <View style={styles.filterOptionsRow}>
              {STATUS_FILTERS.map((status) => (
                <Chip
                  key={status}
                  mode={selectedStatus === status ? "flat" : "outlined"}
                  selected={selectedStatus === status}
                  onPress={() => setSelectedStatus(status)}
                  style={styles.modalFilterChip}
                  textStyle={styles.modalFilterChipText}
                >
                  {status}
                </Chip>
              ))}
            </View>

            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => {
                  setSelectedCategory('All');
                  setSelectedType('All Types');
                  setSelectedDifficulty('All Levels');
                  setSelectedStatus('All Status');
                }}
                style={styles.clearButton}
              >
                Clear All
              </Button>
              <Button
                mode="contained"
                onPress={() => setShowFilters(false)}
                style={styles.applyButton}
              >
                Apply Filters
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>

      {/* Leaderboard Modal */}
      <Portal>
        <Modal
          visible={showLeaderboard}
          onDismiss={() => setShowLeaderboard(false)}
          contentContainerStyle={styles.leaderboardModal}
        >
          {selectedCompetition && (
            <View>
              <Text style={styles.leaderboardTitle}>
                🏆 {selectedCompetition.title} Leaderboard
              </Text>
              
              <View style={styles.leaderboardContainer}>
                {selectedCompetition.leaderboard.map((entry, index) => (
                  <View key={index} style={styles.leaderboardEntry}>
                    <View style={styles.rankSection}>
                      <View style={[
                        styles.rankBadge,
                        { backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32' }
                      ]}>
                        <Text style={styles.rankText}>{entry.rank}</Text>
                      </View>
                      <Text style={styles.entryName}>{entry.name}</Text>
                    </View>
                    <Text style={styles.entryScore}>{entry.score}</Text>
                  </View>
                ))}
              </View>
              
              <Button
                mode="contained"
                onPress={() => setShowLeaderboard(false)}
                style={styles.closeLeaderboardButton}
              >
                Close
              </Button>
            </View>
          )}
        </Modal>
      </Portal>
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: 'white',
    elevation: 2,
  },
  searchbar: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  filterButton: {
    marginLeft: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  categoriesSection: {
    backgroundColor: 'white',
    paddingVertical: SPACING.lg,
    elevation: 1,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.textPrimary,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    fontWeight: '600',
  },
  categoriesContainer: {
    paddingHorizontal: SPACING.lg,
  },
  categoryChip: {
    marginRight: SPACING.md,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 2,
  },
  selectedCategoryChip: {
    elevation: 4,
  },
  categoryChipGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minWidth: 80,
    justifyContent: 'center',
  },
  categoryChipText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  selectedCategoryChipText: {
    color: 'white',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  resultsTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  competitionsSection: {
    padding: SPACING.lg,
  },
  competitionCardContainer: {
    marginBottom: SPACING.lg,
  },
  competitionCard: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  featuredCard: {
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  cardHeader: {
    position: 'relative',
  },
  featuredBanner: {
    position: 'absolute',
    top: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderBottomLeftRadius: 12,
    zIndex: 10,
  },
  featuredText: {
    ...TEXT_STYLES.caption,
    color: 'white',
    fontWeight: 'bold',
    fontSize: 10,
    marginLeft: SPACING.xs / 2,
  },
  headerGradient: {
    padding: SPACING.md,
    minHeight: 120,
  },
  headerContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flex: 1,
  },
  titleSection: {
    flex: 1,
    marginRight: SPACING.md,
  },
  competitionTitle: {
    ...TEXT_STYLES.h3,
    color: 'white',
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    height: 24,
  },
  typeChipText: {
    ...TEXT_STYLES.caption,
    color: 'white',
    fontSize: 10,
  },
  verifiedIcon: {
    marginLeft: SPACING.sm,
  },
  watchButton: {
    padding: SPACING.xs,
  },
  organizerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  organizerAvatar: {
    marginRight: SPACING.sm,
  },
  organizerName: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: 16,
  },
  statusText: {
    ...TEXT_STYLES.caption,
    color: 'white',
    fontWeight: '600',
    marginLeft: SPACING.xs / 2,
  },
  difficultyBadge: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: 12,
  },
  difficultyText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  competitionDetails: {
    padding: SPACING.lg,
  },
  description: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 22,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: SPACING.sm,
  },
  detailText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textPrimary,
    marginLeft: SPACING.xs,
    fontWeight: '500',
  },
  participationSection: {
    marginBottom: SPACING.md,
  },
  participationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  participationText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  participationPercentage: {
    ...TEXT_STYLES.caption,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  participationBar: {
    height: 6,
    borderRadius: 3,
  },
  hashtagsSection: {
    marginBottom: SPACING.md,
  },
  hashtagChip: {
    marginRight: SPACING.sm,
    height: 28,
    backgroundColor: COLORS.surface,
  },
  hashtagText: {
    ...TEXT_STYLES.caption,
    fontSize: 11,
    color: COLORS.primary,
  },
  divider: {
    marginBottom: SPACING.md,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leaderboardButton: {
    flex: 1,
    marginRight: SPACING.sm,
    borderRadius: 25,
    borderColor: COLORS.primary,
  },
  leaderboardButtonText: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
  },
  joinButton: {
    flex: 1,
    marginLeft: SPACING.sm,
    borderRadius: 25,
  },
  joinedButton: {
    backgroundColor: COLORS.success,
  },
  joinButtonText: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: SPACING.xxl,
  },
  emptyTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
  },
  modalContent: {
    backgroundColor: 'white',
    margin: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    fontWeight: '600',
  },
  filterSectionTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
    fontWeight: '600',
  },
  filterOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  modalFilterChip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  modalFilterChipText: {
    ...TEXT_STYLES.caption,
    fontSize: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  clearButton: {
    flex: 1,
    marginRight: SPACING.sm,
    borderRadius: 25,
  },
  applyButton: {
    flex: 1,
    marginLeft: SPACING.sm,
    borderRadius: 25,
  },
  leaderboardModal: {
    backgroundColor: 'white',
    margin: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: 20,
    maxHeight: '70%',
  },
  leaderboardTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    fontWeight: '700',
  },
  leaderboardContainer: {
    marginBottom: SPACING.lg,
  },
  leaderboardEntry: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
  },
  rankSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  rankText: {
    ...TEXT_STYLES.caption,
    color: 'white',
    fontWeight: 'bold',
  },
  entryName: {
    ...TEXT_STYLES.body,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  entryScore: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    fontWeight: '700',
  },
  closeLeaderboardButton: {
    borderRadius: 25,
  },
};

export default FitnessCompetitions.js