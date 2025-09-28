import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  StatusBar,
  Animated,
  RefreshControl,
  Dimensions,
  Image,
} from 'react-native';
import {
  Card,
  Searchbar,
  Chip,
  Button,
  Avatar,
  Surface,
  ProgressBar,
  Badge,
  IconButton,
  Portal,
  Modal,
  Divider,
  FAB,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import your design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const WorkShopClinics = ({ navigation }) => {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedDuration, setSelectedDuration] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [bookmarkedWorkshops, setBookmarkedWorkshops] = useState([]);

  // Redux hooks
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const fabAnim = useRef(new Animated.Value(0)).current;

  // Mock data for workshops and clinics
  const [workshops, setWorkshops] = useState([
    {
      id: 1,
      title: 'Elite Speed & Agility Masterclass',
      instructor: 'Coach Sarah Johnson',
      organization: 'Peak Performance Academy',
      category: 'Speed Training',
      sport: 'Multi-Sport',
      level: 'Intermediate',
      duration: '3 Days',
      price: 299,
      originalPrice: 399,
      discount: 25,
      location: 'Los Angeles, CA',
      date: '2024-09-28',
      time: '9:00 AM - 4:00 PM',
      spots: 20,
      enrolled: 15,
      rating: 4.9,
      reviews: 127,
      image: 'https://example.com/speed-training.jpg',
      badges: ['BESTSELLER', 'LIMITED'],
      skills: ['Sprint Technique', 'Plyometrics', 'Reaction Time'],
      description: 'Master the fundamentals of speed development with Olympic-level training methods.',
      equipment: ['Cones', 'Ladder', 'Resistance Bands'],
      certification: true,
      isBookmarked: false,
      difficulty: 7,
      videoPreview: true,
    },
    {
      id: 2,
      title: 'Mental Toughness Workshop',
      instructor: 'Dr. Michael Chen',
      organization: 'Sports Psychology Institute',
      category: 'Mental Training',
      sport: 'All Sports',
      level: 'All Levels',
      duration: '1 Day',
      price: 149,
      originalPrice: null,
      discount: 0,
      location: 'Virtual',
      date: '2024-10-05',
      time: '10:00 AM - 6:00 PM',
      spots: 50,
      enrolled: 32,
      rating: 4.8,
      reviews: 89,
      image: 'https://example.com/mental-training.jpg',
      badges: ['VIRTUAL', 'NEW'],
      skills: ['Visualization', 'Focus Control', 'Pressure Management'],
      description: 'Develop unbreakable mental strength for peak athletic performance.',
      equipment: ['Notebook', 'Quiet Space'],
      certification: false,
      isBookmarked: true,
      difficulty: 4,
      videoPreview: false,
    },
    {
      id: 3,
      title: 'Injury Prevention Clinic',
      instructor: 'Dr. Lisa Rodriguez',
      organization: 'Sports Medicine Center',
      category: 'Health & Recovery',
      sport: 'Multi-Sport',
      level: 'Beginner',
      duration: '2 Days',
      price: 199,
      originalPrice: 249,
      discount: 20,
      location: 'New York, NY',
      date: '2024-10-12',
      time: '1:00 PM - 6:00 PM',
      spots: 25,
      enrolled: 8,
      rating: 4.7,
      reviews: 156,
      image: 'https://example.com/injury-prevention.jpg',
      badges: ['MEDICAL', 'CERTIFIED'],
      skills: ['Movement Screening', 'Mobility Work', 'Strength Foundations'],
      description: 'Learn evidence-based strategies to prevent common sports injuries.',
      equipment: ['Exercise Mat', 'Resistance Bands'],
      certification: true,
      isBookmarked: false,
      difficulty: 3,
      videoPreview: true,
    },
    {
      id: 4,
      title: 'Advanced Nutrition for Athletes',
      instructor: 'Nutritionist Emma Wilson',
      organization: 'Elite Nutrition Co.',
      category: 'Nutrition',
      sport: 'All Sports',
      level: 'Intermediate',
      duration: '4 Hours',
      price: 89,
      originalPrice: null,
      discount: 0,
      location: 'Chicago, IL',
      date: '2024-10-20',
      time: '9:00 AM - 1:00 PM',
      spots: 30,
      enrolled: 22,
      rating: 4.6,
      reviews: 94,
      image: 'https://example.com/nutrition.jpg',
      badges: ['PRACTICAL', 'HANDS_ON'],
      skills: ['Meal Planning', 'Hydration Strategy', 'Recovery Nutrition'],
      description: 'Master performance nutrition with personalized meal planning strategies.',
      equipment: ['Calculator', 'Notebook'],
      certification: false,
      isBookmarked: false,
      difficulty: 5,
      videoPreview: false,
    },
  ]);

  const categories = ['All', 'Speed Training', 'Mental Training', 'Health & Recovery', 'Nutrition', 'Technique', 'Strength'];
  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced', 'All Levels'];
  const durations = ['All', '4 Hours', '1 Day', '2 Days', '3 Days', 'Week'];

  // Effects
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
      Animated.timing(fabAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Handlers
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('Success', 'Workshops updated! 🎯');
    }, 1500);
  }, []);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  const toggleBookmark = (workshopId) => {
    setWorkshops(prevWorkshops =>
      prevWorkshops.map(workshop =>
        workshop.id === workshopId
          ? { ...workshop, isBookmarked: !workshop.isBookmarked }
          : workshop
      )
    );
  };

  const enrollWorkshop = (workshop) => {
    Alert.alert(
      'Enroll in Workshop',
      `Enroll in "${workshop.title}" for $${workshop.price}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Enroll', 
          onPress: () => {
            Alert.alert('Enrollment Successful! 🎉', 'You will receive confirmation details shortly.');
          }
        },
      ]
    );
  };

  const getBadgeColor = (badge) => {
    const colors = {
      'BESTSELLER': '#FF6B35',
      'LIMITED': '#E74C3C',
      'VIRTUAL': '#3498DB',
      'NEW': '#2ECC71',
      'MEDICAL': '#9B59B6',
      'CERTIFIED': '#F39C12',
      'PRACTICAL': '#1ABC9C',
      'HANDS_ON': '#34495E',
    };
    return colors[badge] || COLORS.secondary;
  };

  const getDifficultyColor = (difficulty) => {
    if (difficulty <= 3) return COLORS.success;
    if (difficulty <= 6) return '#F39C12';
    return '#E74C3C';
  };

  const renderWorkshopCard = ({ item, index }) => (
    <Animated.View
      style={[
        styles.cardContainer,
        viewMode === 'grid' && styles.gridCard,
        {
          opacity: fadeAnim,
          transform: [{ 
            translateY: Animated.add(
              slideAnim,
              new Animated.Value(index * 50)
            )
          }],
        },
      ]}
    >
      <Card style={[styles.workshopCard, viewMode === 'grid' && styles.gridWorkshopCard]} elevation={6}>
        {/* Image Header */}
        <View style={styles.imageContainer}>
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.imageGradient}
          >
            {item.videoPreview && (
              <View style={styles.videoPreview}>
                <Icon name="play-circle-filled" size={40} color="white" />
              </View>
            )}
            <View style={styles.imageTopRow}>
              <View style={styles.badgeContainer}>
                {item.badges.slice(0, 2).map((badge, index) => (
                  <Chip
                    key={index}
                    mode="flat"
                    compact
                    style={[styles.badge, { backgroundColor: getBadgeColor(badge) }]}
                    textStyle={styles.badgeText}
                  >
                    {badge}
                  </Chip>
                ))}
              </View>
              <IconButton
                icon={item.isBookmarked ? 'bookmark' : 'bookmark-border'}
                size={24}
                iconColor="white"
                style={styles.bookmarkButton}
                onPress={() => toggleBookmark(item.id)}
              />
            </View>
          </LinearGradient>
        </View>

        <View style={styles.cardContent}>
          {/* Title and Instructor */}
          <View style={styles.headerSection}>
            <Text style={styles.workshopTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <View style={styles.instructorRow}>
              <Avatar.Text
                size={32}
                label={item.instructor.charAt(0)}
                style={{ backgroundColor: COLORS.primary }}
              />
              <View style={styles.instructorInfo}>
                <Text style={styles.instructorName}>{item.instructor}</Text>
                <Text style={styles.organizationText}>{item.organization}</Text>
              </View>
            </View>
          </View>

          {/* Details */}
          <View style={styles.detailsSection}>
            <View style={styles.detailRow}>
              <Icon name="location-on" size={16} color={COLORS.secondary} />
              <Text style={styles.detailText}>{item.location}</Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="schedule" size={16} color={COLORS.secondary} />
              <Text style={styles.detailText}>{item.date} • {item.time}</Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="access-time" size={16} color={COLORS.secondary} />
              <Text style={styles.detailText}>{item.duration}</Text>
            </View>
          </View>

          {/* Skills */}
          <View style={styles.skillsSection}>
            <Text style={styles.skillsLabel}>Skills You'll Learn:</Text>
            <View style={styles.skillsContainer}>
              {item.skills.slice(0, 3).map((skill, index) => (
                <Chip
                  key={index}
                  mode="outlined"
                  compact
                  style={styles.skillChip}
                  textStyle={styles.skillText}
                >
                  {skill}
                </Chip>
              ))}
            </View>
          </View>

          {/* Progress and Rating */}
          <View style={styles.progressSection}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressText}>
                {item.enrolled}/{item.spots} enrolled
              </Text>
              <View style={styles.difficultyContainer}>
                <Text style={styles.difficultyLabel}>Difficulty:</Text>
                <View style={styles.difficultyDots}>
                  {[...Array(10)].map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.difficultyDot,
                        {
                          backgroundColor: i < item.difficulty
                            ? getDifficultyColor(item.difficulty)
                            : COLORS.lightGray
                        }
                      ]}
                    />
                  ))}
                </View>
              </View>
            </View>
            <ProgressBar
              progress={item.enrolled / item.spots}
              color={COLORS.primary}
              style={styles.progressBar}
            />
          </View>

          {/* Rating and Price */}
          <View style={styles.bottomSection}>
            <View style={styles.ratingContainer}>
              <Icon name="star" size={18} color="#FFD700" />
              <Text style={styles.ratingText}>
                {item.rating} ({item.reviews})
              </Text>
              {item.certification && (
                <Chip
                  mode="flat"
                  compact
                  style={styles.certificationChip}
                  textStyle={styles.certificationText}
                  icon="verified"
                >
                  Certificate
                </Chip>
              )}
            </View>
            <View style={styles.priceContainer}>
              {item.originalPrice && (
                <Text style={styles.originalPrice}>${item.originalPrice}</Text>
              )}
              <Text style={styles.currentPrice}>${item.price}</Text>
              {item.discount > 0 && (
                <Chip
                  mode="flat"
                  compact
                  style={styles.discountChip}
                  textStyle={styles.discountText}
                >
                  {item.discount}% OFF
                </Chip>
              )}
            </View>
          </View>

          <Divider style={styles.divider} />

          {/* Actions */}
          <View style={styles.actionsContainer}>
            <Button
              mode="outlined"
              compact
              onPress={() => navigation.navigate('WorkshopDetails', { workshop: item })}
              style={styles.detailsButton}
              icon="info"
            >
              Details
            </Button>
            <Button
              mode="contained"
              compact
              onPress={() => enrollWorkshop(item)}
              style={styles.enrollButton}
              disabled={item.enrolled >= item.spots}
              icon="school"
            >
              {item.enrolled >= item.spots ? 'Full' : 'Enroll'}
            </Button>
          </View>
        </View>
      </Card>
    </Animated.View>
  );

  const filteredWorkshops = workshops.filter(workshop => {
    const matchesSearch = workshop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workshop.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workshop.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || workshop.category === selectedCategory;
    const matchesLevel = selectedLevel === 'All' || workshop.level === selectedLevel;
    const matchesDuration = selectedDuration === 'All' || workshop.duration === selectedDuration;
    
    return matchesSearch && matchesCategory && matchesLevel && matchesDuration;
  });

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor="transparent"
        translucent
        barStyle="light-content"
      />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Workshops & Clinics 🎯</Text>
            <View style={styles.headerIcons}>
              <IconButton
                icon={viewMode === 'grid' ? 'view-list' : 'view-module'}
                size={24}
                iconColor="white"
                onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              />
              <IconButton
                icon="filter-list"
                size={24}
                iconColor="white"
                onPress={() => setFilterModalVisible(true)}
              />
            </View>
          </View>
          
          <Text style={styles.headerSubtitle}>
            Intensive training sessions with expert coaches
          </Text>

          {/* Search */}
          <Searchbar
            placeholder="Search workshops, instructors, skills..."
            onChangeText={handleSearch}
            value={searchQuery}
            style={styles.searchbar}
            inputStyle={styles.searchInput}
            iconColor={COLORS.primary}
          />

          {/* Quick Stats */}
          <View style={styles.statsContainer}>
            <Surface style={styles.statCard}>
              <Text style={styles.statNumber}>{filteredWorkshops.length}</Text>
              <Text style={styles.statLabel}>Available</Text>
            </Surface>
            <Surface style={styles.statCard}>
              <Text style={styles.statNumber}>
                {workshops.filter(w => w.isBookmarked).length}
              </Text>
              <Text style={styles.statLabel}>Bookmarked</Text>
            </Surface>
            <Surface style={styles.statCard}>
              <Text style={styles.statNumber}>
                {workshops.filter(w => w.certification).length}
              </Text>
              <Text style={styles.statLabel}>Certified</Text>
            </Surface>
          </View>

          {/* Quick Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersScroll}
          >
            {categories.map((category) => (
              <Chip
                key={category}
                selected={selectedCategory === category}
                onPress={() => setSelectedCategory(category)}
                mode="flat"
                style={[
                  styles.filterChip,
                  selectedCategory === category && styles.selectedChip,
                ]}
                textStyle={[
                  styles.chipText,
                  selectedCategory === category && styles.selectedChipText,
                ]}
              >
                {category}
              </Chip>
            ))}
          </ScrollView>
        </View>
      </LinearGradient>

      {/* Content */}
      <FlatList
        data={filteredWorkshops}
        renderItem={renderWorkshopCard}
        keyExtractor={(item) => item.id.toString()}
        style={styles.listContainer}
        showsVerticalScrollIndicator={false}
        numColumns={viewMode === 'grid' ? 2 : 1}
        key={viewMode} // Force re-render when view mode changes
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        contentContainerStyle={styles.listContent}
      />

      {/* Floating Action Button */}
      <Animated.View
        style={[
          styles.fabContainer,
          {
            opacity: fabAnim,
            transform: [{ scale: fabAnim }],
          },
        ]}
      >
        <FAB
          icon="add"
          style={styles.fab}
          onPress={() => Alert.alert('Feature Coming Soon', 'Create your own workshop! 🚀')}
        />
      </Animated.View>

      {/* Filter Modal */}
      <Portal>
        <Modal
          visible={filterModalVisible}
          onDismiss={() => setFilterModalVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          <BlurView style={styles.blurView} blurType="light" blurAmount={10}>
            <Text style={styles.modalTitle}>Filter Workshops</Text>
            
            <Text style={styles.filterLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.map((category) => (
                <Chip
                  key={category}
                  selected={selectedCategory === category}
                  onPress={() => setSelectedCategory(category)}
                  style={styles.modalChip}
                >
                  {category}
                </Chip>
              ))}
            </ScrollView>

            <Text style={styles.filterLabel}>Level</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {levels.map((level) => (
                <Chip
                  key={level}
                  selected={selectedLevel === level}
                  onPress={() => setSelectedLevel(level)}
                  style={styles.modalChip}
                >
                  {level}
                </Chip>
              ))}
            </ScrollView>

            <Text style={styles.filterLabel}>Duration</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {durations.map((duration) => (
                <Chip
                  key={duration}
                  selected={selectedDuration === duration}
                  onPress={() => setSelectedDuration(duration)}
                  style={styles.modalChip}
                >
                  {duration}
                </Chip>
              ))}
            </ScrollView>

            <Button
              mode="contained"
              onPress={() => setFilterModalVisible(false)}
              style={styles.modalButton}
              icon="check"
            >
              Apply Filters
            </Button>
          </BlurView>
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
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  headerContent: {
    gap: SPACING.sm,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.heading,
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    marginTop: SPACING.xs,
  },
  searchbar: {
    backgroundColor: 'white',
    elevation: 2,
    marginTop: SPACING.md,
  },
  searchInput: {
    color: COLORS.text,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    padding: SPACING.sm,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    elevation: 2,
  },
  statNumber: {
    ...TEXT_STYLES.heading,
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    ...TEXT_STYLES.body,
    fontSize: 12,
    color: COLORS.secondary,
    marginTop: 2,
  },
  filtersScroll: {
    marginTop: SPACING.sm,
  },
  filterChip: {
    marginRight: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  selectedChip: {
    backgroundColor: 'white',
  },
  chipText: {
    color: 'white',
    fontSize: 14,
  },
  selectedChipText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl + 60, // Account for FAB
  },
  cardContainer: {
    marginBottom: SPACING.md,
  },
  gridCard: {
    flex: 0.5,
    marginHorizontal: SPACING.xs,
  },
  workshopCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
  },
  gridWorkshopCard: {
    marginHorizontal: 0,
  },
  imageContainer: {
    height: 120,
    backgroundColor: COLORS.lightGray,
    position: 'relative',
  },
  imageGradient: {
    flex: 1,
    justifyContent: 'space-between',
    padding: SPACING.sm,
  },
  videoPreview: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -20,
    marginLeft: -20,
  },
  imageTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    flex: 1,
  },
  badge: {
    height: 24,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  bookmarkButton: {
    margin: 0,
  },
  cardContent: {
    padding: SPACING.md,
  },
  headerSection: {
    marginBottom: SPACING.sm,
  },
  workshopTitle: {
    ...TEXT_STYLES.heading,
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  instructorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  instructorInfo: {
    flex: 1,
  },
  instructorName: {
    ...TEXT_STYLES.body,
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  organizationText: {
    ...TEXT_STYLES.body,
    fontSize: 12,
    color: COLORS.secondary,
    marginTop: 2,
  },
  detailsSection: {
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  detailText: {
    ...TEXT_STYLES.body,
    color: COLORS.secondary,
    fontSize: 13,
    flex: 1,
  },
  skillsSection: {
    marginBottom: SPACING.sm,
  },
  skillsLabel: {
    ...TEXT_STYLES.body,
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  skillChip: {
    height: 28,
    borderColor: COLORS.primary,
  },
  skillText: {
    fontSize: 11,
    color: COLORS.primary,
  },
  progressSection: {
    marginBottom: SPACING.sm,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  progressText: {
    ...TEXT_STYLES.body,
    fontSize: 13,
    color: COLORS.text,
  },
  difficultyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  difficultyLabel: {
    ...TEXT_STYLES.body,
    fontSize: 12,
    color: COLORS.secondary,
  },
  difficultyDots: {
    flexDirection: 'row',
    gap: 2,
  },
  difficultyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.lightGray,
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    flex: 1,
  },
  ratingText: {
    ...TEXT_STYLES.body,
    fontSize: 13,
    color: COLORS.secondary,
  },
  certificationChip: {
    height: 24,
    backgroundColor: COLORS.success,
    marginLeft: SPACING.xs,
  },
  certificationText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  originalPrice: {
    ...TEXT_STYLES.body,
    fontSize: 14,
    color: COLORS.secondary,
    textDecorationLine: 'line-through',
  },
  currentPrice: {
    ...TEXT_STYLES.heading,
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  discountChip: {
    height: 24,
    backgroundColor: COLORS.error,
  },
  discountText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: SPACING.sm,
    backgroundColor: COLORS.lightGray,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  detailsButton: {
    flex: 1,
    borderColor: COLORS.primary,
  },
  enrollButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  fabContainer: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.lg,
  },
  fab: {
    backgroundColor: COLORS.primary,
  },
  modalContent: {
    backgroundColor: 'white',
    margin: SPACING.md,
    borderRadius: 12,
    overflow: 'hidden',
  },
  blurView: {
    padding: SPACING.lg,
  },
  modalTitle: {
    ...TEXT_STYLES.heading,
    fontSize: 24,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    color: COLORS.text,
  },
  filterLabel: {
    ...TEXT_STYLES.body,
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  modalChip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  modalButton: {
    backgroundColor: COLORS.primary,
    marginTop: SPACING.lg,
  },
  });

  export default WorkShopClinics;