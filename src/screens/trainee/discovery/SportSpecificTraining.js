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
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import your design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mock data for sports-specific training programs
const MOCK_SPORTS_PROGRAMS = [
  {
    id: '1',
    title: 'Football Technical Mastery',
    sport: 'Football',
    category: 'Technical Skills',
    difficulty: 'Intermediate',
    duration: '8 weeks',
    sessionsPerWeek: 3,
    totalSessions: 24,
    completedSessions: 0,
    price: '$89/month',
    rating: 4.8,
    participants: 1247,
    coach: 'Diego Martinez',
    coachImage: 'https://via.placeholder.com/50x50',
    specialization: 'Ex-Professional Player',
    features: ['Ball Control', 'Passing Accuracy', 'First Touch', 'Dribbling'],
    equipment: ['Football', 'Cones', 'Training Vest'],
    description: 'Master the fundamental technical skills that separate good players from great ones.',
    preview: 'Free 3-day trial',
    trending: true,
    verified: true,
  },
  {
    id: '2',
    title: 'Basketball Shooting Academy',
    sport: 'Basketball',
    category: 'Shooting',
    difficulty: 'Beginner',
    duration: '6 weeks',
    sessionsPerWeek: 4,
    totalSessions: 24,
    completedSessions: 0,
    price: '$75/month',
    rating: 4.9,
    participants: 892,
    coach: 'Marcus Johnson',
    coachImage: 'https://via.placeholder.com/50x50',
    specialization: 'NBA Skills Coach',
    features: ['Form Shooting', 'Range Extension', 'Game Situations', 'Mental Focus'],
    equipment: ['Basketball', 'Shooting Machine', 'Resistance Bands'],
    description: 'Transform your shooting mechanics with proven NBA-level techniques.',
    preview: 'Watch preview videos',
    trending: false,
    verified: true,
  },
  {
    id: '3',
    title: 'Tennis Power & Precision',
    sport: 'Tennis',
    category: 'Power Training',
    difficulty: 'Advanced',
    duration: '12 weeks',
    sessionsPerWeek: 2,
    totalSessions: 24,
    completedSessions: 0,
    price: '$120/month',
    rating: 4.7,
    participants: 456,
    coach: 'Ana Rodriguez',
    coachImage: 'https://via.placeholder.com/50x50',
    specialization: 'Former WTA Player',
    features: ['Power Development', 'Precision Training', 'Match Strategy', 'Mental Toughness'],
    equipment: ['Tennis Racket', 'Medicine Ball', 'Agility Ladder'],
    description: 'Develop explosive power while maintaining pinpoint accuracy in every shot.',
    preview: 'Free technique analysis',
    trending: true,
    verified: true,
  },
  {
    id: '4',
    title: 'Swimming Stroke Perfection',
    sport: 'Swimming',
    category: 'Technique',
    difficulty: 'Intermediate',
    duration: '10 weeks',
    sessionsPerWeek: 3,
    totalSessions: 30,
    completedSessions: 0,
    price: '$95/month',
    rating: 4.6,
    participants: 678,
    coach: 'James Thompson',
    coachImage: 'https://via.placeholder.com/50x50',
    specialization: 'Olympic Swimming Coach',
    features: ['Stroke Mechanics', 'Breathing Technique', 'Turn Efficiency', 'Race Strategy'],
    equipment: ['Kickboard', 'Pull Buoy', 'Paddles', 'Fins'],
    description: 'Perfect your swimming technique with Olympic-level coaching methods.',
    preview: 'Stroke analysis video',
    trending: false,
    verified: true,
  },
];

const SPORTS_CATEGORIES = [
  { name: 'All Sports', icon: 'sports', color: '#667eea' },
  { name: 'Football', icon: 'sports-soccer', color: '#2ECC71' },
  { name: 'Basketball', icon: 'sports-basketball', color: '#E74C3C' },
  { name: 'Tennis', icon: 'sports-tennis', color: '#F39C12' },
  { name: 'Swimming', icon: 'pool', color: '#3498DB' },
  { name: 'Athletics', icon: 'directions-run', color: '#9B59B6' },
  { name: 'Volleyball', icon: 'sports-volleyball', color: '#E67E22' },
];

const TRAINING_CATEGORIES = ['All Categories', 'Technical Skills', 'Shooting', 'Power Training', 'Technique', 'Tactics', 'Fitness'];
const DIFFICULTY_LEVELS = ['All Levels', 'Beginner', 'Intermediate', 'Advanced', 'Professional'];

const SportsSpecificTraining = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('All Sports');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All Levels');
  const [programs, setPrograms] = useState(MOCK_SPORTS_PROGRAMS);
  const [filteredPrograms, setFilteredPrograms] = useState(MOCK_SPORTS_PROGRAMS);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [enrolledPrograms, setEnrolledPrograms] = useState(new Set());
  const [wishlist, setWishlist] = useState(new Set());
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  
  // Initialize animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Filter programs based on search and filters
  useEffect(() => {
    let filtered = programs.filter(program => {
      const matchesSearch = program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          program.coach.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          program.features.some(feature => feature.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesSport = selectedSport === 'All Sports' || program.sport === selectedSport;
      const matchesCategory = selectedCategory === 'All Categories' || program.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'All Levels' || program.difficulty === selectedDifficulty;
      
      return matchesSearch && matchesSport && matchesCategory && matchesDifficulty;
    });
    
    setFilteredPrograms(filtered);
  }, [searchQuery, selectedSport, selectedCategory, selectedDifficulty, programs]);

  // Refresh functionality
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setRefreshing(false);
    } catch (error) {
      setRefreshing(false);
      Alert.alert('Error', 'Failed to refresh training programs');
    }
  }, []);

  // Toggle wishlist
  const toggleWishlist = useCallback((programId) => {
    Vibration.vibrate(50);
    const newWishlist = new Set(wishlist);
    if (newWishlist.has(programId)) {
      newWishlist.delete(programId);
    } else {
      newWishlist.add(programId);
    }
    setWishlist(newWishlist);
  }, [wishlist]);

  // Handle program enrollment
  const handleEnrollment = (program) => {
    Vibration.vibrate(50);
    Alert.alert(
      '🚀 Enroll in Program',
      `Ready to start "${program.title}"? This feature is coming soon!`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Enroll Now', style: 'default' }
      ]
    );
  };

  // Handle program preview
  const handlePreview = (program) => {
    Vibration.vibrate(30);
    Alert.alert(
      '👀 Preview Program',
      `${program.preview} - Feature coming soon for "${program.title}"!`,
      [{ text: 'OK' }]
    );
  };

  // Handle program details
  const handleProgramPress = (program) => {
    Vibration.vibrate(30);
    Alert.alert(
      'Program Details',
      `This feature is coming soon! You selected: ${program.title}`,
      [{ text: 'OK' }]
    );
  };

  // Render sport category cards
  const renderSportCategory = ({ item: sport }) => (
    <TouchableOpacity
      onPress={() => setSelectedSport(sport.name)}
      style={[
        styles.sportCard,
        selectedSport === sport.name && styles.selectedSportCard
      ]}
    >
      <LinearGradient
        colors={[sport.color, `${sport.color}80`]}
        style={styles.sportCardGradient}
      >
        <Icon 
          name={sport.icon} 
          size={32} 
          color="white" 
          style={styles.sportIcon} 
        />
        <Text style={styles.sportName}>{sport.name}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  // Render training program card
  const renderProgramCard = ({ item: program }) => (
    <Animated.View style={[styles.programCardContainer, { 
      opacity: fadeAnim,
      transform: [{ scale: scaleAnim }]
    }]}>
      <Card style={styles.programCard} elevation={4}>
        <TouchableOpacity onPress={() => handleProgramPress(program)}>
          {/* Card Header */}
          <View style={styles.cardHeader}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.headerGradient}
            >
              <View style={styles.headerContent}>
                <View style={styles.headerTop}>
                  <View style={styles.titleSection}>
                    <Text style={styles.programTitle} numberOfLines={2}>
                      {program.title}
                    </Text>
                    <View style={styles.badgesRow}>
                      {program.trending && (
                        <Badge style={styles.trendingBadge}>🔥 Trending</Badge>
                      )}
                      {program.verified && (
                        <Icon name="verified" size={18} color="#FFD700" />
                      )}
                    </View>
                  </View>
                  
                  <TouchableOpacity 
                    onPress={() => toggleWishlist(program.id)}
                    style={styles.wishlistButton}
                  >
                    <Icon 
                      name={wishlist.has(program.id) ? "bookmark" : "bookmark-border"} 
                      size={24} 
                      color="white" 
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.coachSection}>
                  <Avatar.Image 
                    source={{ uri: program.coachImage }} 
                    size={40}
                    style={styles.coachAvatar}
                  />
                  <View style={styles.coachInfo}>
                    <Text style={styles.coachName}>{program.coach}</Text>
                    <Text style={styles.coachSpecialization}>{program.specialization}</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Program Details */}
          <View style={styles.programDetails}>
            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <Icon name="timeline" size={16} color={COLORS.primary} />
                <Text style={styles.detailText}>{program.duration}</Text>
              </View>
              <View style={styles.detailItem}>
                <Icon name="fitness-center" size={16} color={COLORS.primary} />
                <Text style={styles.detailText}>{program.sessionsPerWeek}/week</Text>
              </View>
              <View style={styles.detailItem}>
                <Icon name="trending-up" size={16} color={COLORS.primary} />
                <Text style={styles.detailText}>{program.difficulty}</Text>
              </View>
            </View>

            <Text style={styles.description} numberOfLines={2}>
              {program.description}
            </Text>

            {/* Features */}
            <View style={styles.featuresSection}>
              <Text style={styles.sectionTitle}>Key Features:</Text>
              <View style={styles.featuresGrid}>
                {program.features.slice(0, 4).map((feature, index) => (
                  <View key={index} style={styles.featureChip}>
                    <Icon name="check-circle" size={14} color={COLORS.success} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Equipment */}
            <View style={styles.equipmentSection}>
              <Text style={styles.sectionTitle}>Equipment Needed:</Text>
              <Text style={styles.equipmentText}>
                {program.equipment.join(' • ')}
              </Text>
            </View>

            {/* Stats & Rating */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Icon name="star" size={16} color="#FFD700" />
                <Text style={styles.statText}>{program.rating}</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="people" size={16} color={COLORS.textSecondary} />
                <Text style={styles.statText}>{program.participants} enrolled</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="play-circle-outline" size={16} color={COLORS.textSecondary} />
                <Text style={styles.statText}>{program.totalSessions} sessions</Text>
              </View>
            </View>

            <Divider style={styles.divider} />

            {/* Card Footer */}
            <View style={styles.cardFooter}>
              <View style={styles.priceSection}>
                <Text style={styles.priceText}>{program.price}</Text>
                <TouchableOpacity onPress={() => handlePreview(program)}>
                  <Text style={styles.previewText}>{program.preview}</Text>
                </TouchableOpacity>
              </View>
              
              <Button 
                mode="contained" 
                style={styles.enrollButton}
                labelStyle={styles.enrollButtonText}
                onPress={() => handleEnrollment(program)}
              >
                Start Training
              </Button>
            </View>
          </View>
        </TouchableOpacity>
      </Card>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header with gradient */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Animated.View style={[styles.headerContent, { transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.headerTitle}>⚽ Sport-Specific Training</Text>
          <Text style={styles.headerSubtitle}>Master your sport with expert coaching</Text>
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
            placeholder="Search programs, coaches, skills..."
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

        {/* Sports Categories */}
        <View style={styles.sportsSection}>
          <Text style={styles.sectionHeaderTitle}>Choose Your Sport</Text>
          <FlatList
            data={SPORTS_CATEGORIES}
            renderItem={renderSportCategory}
            keyExtractor={(item) => item.name}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sportsContainer}
          />
        </View>

        {/* Results header */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}>
            {filteredPrograms.length} programs available
          </Text>
          <View style={styles.sortButton}>
            <Icon name="sort" size={16} color={COLORS.textSecondary} />
            <Text style={styles.sortText}>Best Rated</Text>
          </View>
        </View>

        {/* Training Programs */}
        <View style={styles.programsSection}>
          <FlatList
            data={filteredPrograms}
            renderItem={renderProgramCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Icon name="sports" size={64} color={COLORS.textSecondary} />
                <Text style={styles.emptyTitle}>No programs found</Text>
                <Text style={styles.emptySubtitle}>
                  Try adjusting your search or filters
                </Text>
              </View>
            )}
          />
        </View>
      </ScrollView>

      {/* Filter Modal */}
      <Portal>
        <Modal
          visible={showFilters}
          onDismiss={() => setShowFilters(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Text style={styles.modalTitle}>Filter Programs</Text>
          
          <Text style={styles.filterSectionTitle}>Training Category</Text>
          <View style={styles.filterOptionsRow}>
            {TRAINING_CATEGORIES.map((category) => (
              <Chip
                key={category}
                mode={selectedCategory === category ? "flat" : "outlined"}
                selected={selectedCategory === category}
                onPress={() => setSelectedCategory(category)}
                style={styles.modalFilterChip}
                textStyle={styles.modalFilterChipText}
              >
                {category}
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

          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => {
                setSelectedSport('All Sports');
                setSelectedCategory('All Categories');
                setSelectedDifficulty('All Levels');
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
  sportsSection: {
    backgroundColor: 'white',
    paddingVertical: SPACING.lg,
    elevation: 1,
  },
  sectionHeaderTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.textPrimary,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    fontWeight: '600',
  },
  sportsContainer: {
    paddingHorizontal: SPACING.lg,
  },
  sportCard: {
    marginRight: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
  },
  selectedSportCard: {
    elevation: 6,
    transform: [{ scale: 1.05 }],
  },
  sportCardGradient: {
    width: 100,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.sm,
  },
  sportIcon: {
    marginBottom: SPACING.xs,
  },
  sportName: {
    ...TEXT_STYLES.caption,
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
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
  programsSection: {
    padding: SPACING.lg,
  },
  programCardContainer: {
    marginBottom: SPACING.lg,
  },
  programCard: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  cardHeader: {
    height: 140,
  },
  headerGradient: {
    flex: 1,
    padding: SPACING.md,
  },
  headerContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleSection: {
    flex: 1,
    marginRight: SPACING.md,
  },
  programTitle: {
    ...TEXT_STYLES.h3,
    color: 'white',
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendingBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginRight: SPACING.sm,
    fontSize: 10,
  },
  wishlistButton: {
    padding: SPACING.xs,
  },
  coachSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coachAvatar: {
    marginRight: SPACING.sm,
  },
  coachInfo: {
    flex: 1,
  },
  coachName: {
    ...TEXT_STYLES.body,
    color: 'white',
    fontWeight: '600',
  },
  coachSpecialization: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
  },
  programDetails: {
    padding: SPACING.lg,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  detailText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textPrimary,
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  description: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  featuresSection: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.body,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  featureText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textPrimary,
    marginLeft: SPACING.xs / 2,
    fontSize: 11,
  },
  equipmentSection: {
    marginBottom: SPACING.md,
  },
  equipmentText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  statText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  divider: {
    marginBottom: SPACING.md,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceSection: {
    flex: 1,
  },
  priceText: {
    ...TEXT_STYLES.h4,
    color: COLORS.primary,
    fontWeight: '700',
  },
  previewText: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
    textDecorationLine: 'underline',
  },
  enrollButton: {
    borderRadius: 25,
    paddingHorizontal: SPACING.lg,
  },
  enrollButtonText: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
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
};

export default SportsSpecificTraining;