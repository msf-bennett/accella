import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  StatusBar,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Alert,
  Animated,
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
  Text,
  ProgressBar,
  Badge,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../../styles/colors';
import { SPACING } from '../../../styles/spacing';
import { TEXT_STYLES } from '../../../styles/textStyles';
import { TYPOGRAPHY } from '../../../styles/typography';
import { LAYOUT } from '../../../styles/layout';

const { width } = Dimensions.get('window');

const MentorshipPrograms = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDuration, setSelectedDuration] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  // Mock data for mentorship programs
  const [programs, setPrograms] = useState([
    {
      id: '1',
      title: 'Elite Coaching Mastery Program',
      mentor: {
        name: 'Coach Michael Thompson',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        credentials: 'UEFA Pro License, 25+ years',
        rating: 4.9,
        mentees: 145
      },
      category: 'Tactical Development',
      level: 'Advanced',
      duration: '12 weeks',
      price: 899,
      originalPrice: 1199,
      spots: 8,
      totalSpots: 12,
      startDate: '2025-09-15',
      description: 'Master advanced tactical concepts and leadership skills to elevate your coaching to professional levels.',
      highlights: [
        'Weekly 1-on-1 mentoring sessions',
        'Access to exclusive tactical playbooks',
        'Live match analysis workshops',
        'Professional network access'
      ],
      modules: [
        'Advanced Tactical Systems',
        'Player Psychology & Motivation',
        'Match Preparation & Analysis',
        'Leadership & Communication'
      ],
      includes: [
        '12 weeks of mentoring',
        'Resource library access',
        'Certificate of completion',
        'Alumni network membership'
      ],
      difficulty: 'Expert',
      timeCommitment: '5-8 hours/week',
      nextIntake: 'September 2025'
    },
    {
      id: '2',
      title: 'Youth Development Specialist',
      mentor: {
        name: 'Dr. Sarah Martinez',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616c65c17e9?w=150&h=150&fit=crop&crop=face',
        credentials: 'PhD Sports Science, Former Academy Director',
        rating: 4.8,
        mentees: 89
      },
      category: 'Youth Coaching',
      level: 'Intermediate',
      duration: '8 weeks',
      price: 649,
      originalPrice: 799,
      spots: 15,
      totalSpots: 20,
      startDate: '2025-09-01',
      description: 'Specialize in developing young athletes with age-appropriate training methods and psychological approaches.',
      highlights: [
        'Age-specific training methodologies',
        'Child psychology workshops',
        'Parent communication strategies',
        'Long-term development planning'
      ],
      modules: [
        'Developmental Psychology',
        'Age-Appropriate Training',
        'Talent Identification',
        'Parent & Club Relations'
      ],
      includes: [
        '8 weeks of mentoring',
        'Youth coaching toolkit',
        'Assessment frameworks',
        'Continuing education credits'
      ],
      difficulty: 'Intermediate',
      timeCommitment: '3-5 hours/week',
      nextIntake: 'September 2025'
    },
    {
      id: '3',
      title: 'Sports Psychology Integration',
      mentor: {
        name: 'Dr. James Wilson',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        credentials: 'Licensed Sports Psychologist, Olympic Consultant',
        rating: 4.9,
        mentees: 67
      },
      category: 'Mental Performance',
      level: 'Advanced',
      duration: '10 weeks',
      price: 749,
      originalPrice: 899,
      spots: 5,
      totalSpots: 10,
      startDate: '2025-08-20',
      description: 'Learn to integrate mental performance techniques into your coaching methodology for enhanced athlete development.',
      highlights: [
        'Mental skills training certification',
        'Anxiety & pressure management',
        'Motivation & goal setting',
        'Team dynamics optimization'
      ],
      modules: [
        'Cognitive Behavioral Techniques',
        'Visualization & Mental Rehearsal',
        'Stress & Performance Management',
        'Team Psychology'
      ],
      includes: [
        '10 weeks of expert guidance',
        'Mental training protocols',
        'Assessment tools',
        'Professional certification'
      ],
      difficulty: 'Advanced',
      timeCommitment: '4-6 hours/week',
      nextIntake: 'August 2025'
    }
  ]);

  const categories = [
    'All', 'Tactical Development', 'Youth Coaching', 'Mental Performance', 
    'Strength & Conditioning', 'Injury Prevention', 'Business Skills'
  ];

  const durations = ['All', '4-6 weeks', '8-10 weeks', '12+ weeks'];
  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  useEffect(() => {
    StatusBar.setBarStyle('light-content', true);
    StatusBar.setTranslucent(true);
    StatusBar.setBackgroundColor('transparent', true);
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleEnrollProgram = (program) => {
    Alert.alert(
      '🎓 Program Enrollment',
      `Enrollment for "${program.title}" coming soon! This will include payment processing, schedule coordination, and mentor matching.`,
      [{ text: 'Got it!', style: 'default' }]
    );
  };

  const handleProgramDetails = (program) => {
    Alert.alert(
      '📋 Program Details',
      `Detailed curriculum for "${program.title}" coming soon! This will show full syllabus, mentor bio, student testimonials, and sample content.`,
      [{ text: 'Got it!', style: 'default' }]
    );
  };

  const handleContactMentor = (program) => {
    Alert.alert(
      '📞 Contact Mentor',
      `Direct contact with ${program.mentor.name} coming soon! This will include messaging, scheduling calls, and program inquiries.`,
      [{ text: 'Got it!', style: 'default' }]
    );
  };

  const handleWaitlist = (program) => {
    Alert.alert(
      '⏳ Join Waitlist',
      `Waitlist feature for "${program.title}" coming soon! Get notified when spots open up or new cohorts start.`,
      [{ text: 'Got it!', style: 'default' }]
    );
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Icon key={i} name="star" size={14} color="#FFD700" />);
    }
    if (hasHalfStar) {
      stars.push(<Icon key="half" name="star-half" size={14} color="#FFD700" />);
    }
    return stars;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return COLORS.success;
      case 'intermediate': return '#FF9800';
      case 'advanced': case 'expert': return COLORS.error;
      default: return COLORS.primary;
    }
  };

  const renderProgramCard = ({ item: program }) => (
    <Animated.View style={{ opacity: fadeAnim }}>
      <Card style={styles.programCard} elevation={4}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.cardHeader}
        >
          <View style={styles.headerTop}>
            <View style={styles.titleSection}>
              <Text style={styles.programTitle}>{program.title}</Text>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{program.category}</Text>
              </View>
            </View>
            <View style={styles.priceSection}>
              {program.originalPrice > program.price && (
                <Text style={styles.originalPrice}>${program.originalPrice}</Text>
              )}
              <Text style={styles.currentPrice}>${program.price}</Text>
            </View>
          </View>
          
          <View style={styles.mentorSection}>
            <Avatar.Image 
              source={{ uri: program.mentor.avatar }} 
              size={50}
              style={styles.mentorAvatar}
            />
            <View style={styles.mentorInfo}>
              <Text style={styles.mentorName}>{program.mentor.name}</Text>
              <Text style={styles.mentorCredentials}>{program.mentor.credentials}</Text>
              <View style={styles.mentorStats}>
                <View style={styles.ratingContainer}>
                  <View style={styles.stars}>
                    {renderStars(program.mentor.rating)}
                  </View>
                  <Text style={styles.ratingText}>
                    {program.mentor.rating} • {program.mentor.mentees} mentees
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.cardContent}>
          <Text style={styles.description}>{program.description}</Text>
          
          <View style={styles.programDetails}>
            <View style={styles.detailRow}>
              <Icon name="schedule" size={16} color={COLORS.primary} />
              <Text style={styles.detailText}>{program.duration} • {program.timeCommitment}</Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="trending-up" size={16} color={getDifficultyColor(program.difficulty)} />
              <Text style={styles.detailText}>{program.difficulty} Level</Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="people" size={16} color={COLORS.success} />
              <Text style={styles.detailText}>
                {program.spots} spots available of {program.totalSpots}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="date-range" size={16} color={COLORS.primary} />
              <Text style={styles.detailText}>Next intake: {program.nextIntake}</Text>
            </View>
          </View>

          <View style={styles.spotsContainer}>
            <Text style={styles.spotsLabel}>Available Spots</Text>
            <ProgressBar 
              progress={1 - (program.spots / program.totalSpots)}
              color={program.spots <= 5 ? COLORS.error : COLORS.success}
              style={styles.progressBar}
            />
            <Text style={styles.spotsText}>
              {program.spots} of {program.totalSpots} remaining
            </Text>
          </View>

          <View style={styles.highlightsSection}>
            <Text style={styles.sectionTitle}>Program Highlights</Text>
            {program.highlights.slice(0, 2).map((highlight, index) => (
              <View key={index} style={styles.highlightItem}>
                <Icon name="check-circle" size={16} color={COLORS.success} />
                <Text style={styles.highlightText}>{highlight}</Text>
              </View>
            ))}
            {program.highlights.length > 2 && (
              <TouchableOpacity onPress={() => handleProgramDetails(program)}>
                <Text style={styles.seeMoreText}>
                  +{program.highlights.length - 2} more benefits
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.actionButtons}>
            <Button
              mode="outlined"
              onPress={() => handleProgramDetails(program)}
              style={styles.detailsButton}
              labelStyle={styles.buttonLabel}
            >
              View Details
            </Button>
            <Button
              mode="outlined"
              onPress={() => handleContactMentor(program)}
              icon="chat"
              style={styles.contactButton}
              labelStyle={styles.buttonLabel}
            >
              Contact
            </Button>
            {program.spots > 0 ? (
              <Button
                mode="contained"
                onPress={() => handleEnrollProgram(program)}
                style={styles.enrollButton}
                labelStyle={styles.enrollButtonLabel}
              >
                Enroll Now
              </Button>
            ) : (
              <Button
                mode="contained"
                onPress={() => handleWaitlist(program)}
                style={styles.waitlistButton}
                labelStyle={styles.waitlistButtonLabel}
              >
                Join Waitlist
              </Button>
            )}
          </View>
        </View>
      </Card>
    </Animated.View>
  );

  const renderCategoryChip = ({ item: category }) => (
    <Chip
      selected={selectedCategory === category}
      onPress={() => setSelectedCategory(category)}
      style={[
        styles.categoryChip,
        selectedCategory === category && styles.selectedCategoryChip
      ]}
      textStyle={[
        styles.categoryChipText,
        selectedCategory === category && styles.selectedCategoryChipText
      ]}
    >
      {category}
    </Chip>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Mentorship Programs 🎓</Text>
          <Text style={styles.headerSubtitle}>
            Accelerate your coaching journey with expert guidance
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>150+</Text>
              <Text style={styles.statLabel}>Programs</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>50+</Text>
              <Text style={styles.statLabel}>Expert Mentors</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>95%</Text>
              <Text style={styles.statLabel}>Success Rate</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search programs, mentors, or topics..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
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

      {showFilters && (
        <Surface style={styles.filtersContainer} elevation={2}>
          <Text style={styles.filterTitle}>Categories</Text>
          <FlatList
            data={categories}
            renderItem={renderCategoryChip}
            keyExtractor={(item) => item}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryList}
          />
          
          <View style={styles.filterRow}>
            <View style={styles.filterSection}>
              <Text style={styles.filterSubtitle}>Duration</Text>
              <View style={styles.filterChips}>
                {durations.map((duration) => (
                  <Chip
                    key={duration}
                    selected={selectedDuration === duration}
                    onPress={() => setSelectedDuration(duration)}
                    style={[
                      styles.filterChip,
                      selectedDuration === duration && styles.selectedFilterChip
                    ]}
                    textStyle={styles.filterChipText}
                  >
                    {duration}
                  </Chip>
                ))}
              </View>
            </View>
            
            <View style={styles.filterSection}>
              <Text style={styles.filterSubtitle}>Level</Text>
              <View style={styles.filterChips}>
                {levels.map((level) => (
                  <Chip
                    key={level}
                    selected={selectedLevel === level}
                    onPress={() => setSelectedLevel(level)}
                    style={[
                      styles.filterChip,
                      selectedLevel === level && styles.selectedFilterChip
                    ]}
                    textStyle={styles.filterChipText}
                  >
                    {level}
                  </Chip>
                ))}
              </View>
            </View>
          </View>
        </Surface>
      )}

      <FlatList
        data={programs}
        renderItem={renderProgramCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      />

      <FAB
        icon="school"
        style={styles.fab}
        onPress={() => {
          Alert.alert(
            '🏆 Create Program',
            'Become a mentor and create your own mentorship program! Feature coming soon.',
            [{ text: 'Got it!', style: 'default' }]
          );
        }}
      />
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: SPACING.xl * 2,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.heading,
    color: 'white',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...TEXT_STYLES.heading,
    color: 'white',
    fontWeight: 'bold',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    elevation: 2,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  filterButton: {
    marginLeft: SPACING.sm,
  },
  filtersContainer: {
    margin: SPACING.md,
    padding: SPACING.md,
    borderRadius: 12,
  },
  filterTitle: {
    ...TEXT_STYLES.subtitle,
    marginBottom: SPACING.sm,
    color: COLORS.text,
  },
  categoryList: {
    marginBottom: SPACING.md,
  },
  categoryChip: {
    marginRight: SPACING.sm,
    backgroundColor: 'white',
  },
  selectedCategoryChip: {
    backgroundColor: COLORS.primary,
  },
  categoryChipText: {
    color: COLORS.text,
    fontSize: 12,
  },
  selectedCategoryChipText: {
    color: 'white',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterSection: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  filterSubtitle: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
    color: COLORS.text,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterChip: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
    backgroundColor: 'white',
  },
  selectedFilterChip: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 10,
  },
  listContainer: {
    padding: SPACING.md,
  },
  programCard: {
    marginBottom: SPACING.lg,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  titleSection: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  programTitle: {
    ...TEXT_STYLES.subtitle,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  categoryText: {
    ...TEXT_STYLES.caption,
    color: 'white',
    fontWeight: '600',
  },
  priceSection: {
    alignItems: 'flex-end',
  },
  originalPrice: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.7)',
    textDecorationLine: 'line-through',
  },
  currentPrice: {
    ...TEXT_STYLES.heading,
    color: 'white',
    fontWeight: 'bold',
  },
  mentorSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mentorAvatar: {
    marginRight: SPACING.sm,
  },
  mentorInfo: {
    flex: 1,
  },
  mentorName: {
    ...TEXT_STYLES.body,
    color: 'white',
    fontWeight: '600',
  },
  mentorCredentials: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: SPACING.xs,
  },
  mentorStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stars: {
    flexDirection: 'row',
    marginRight: SPACING.xs,
  },
  ratingText: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  cardContent: {
    padding: SPACING.md,
  },
  description: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  programDetails: {
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  detailText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.sm,
    color: COLORS.textSecondary,
  },
  spotsContainer: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    padding: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  spotsLabel: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: SPACING.xs,
  },
  spotsText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  highlightsSection: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    fontWeight: '600',
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  highlightText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.sm,
    color: COLORS.textSecondary,
    flex: 1,
  },
  seeMoreText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: SPACING.xs,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailsButton: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  contactButton: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  enrollButton: {
    flex: 1.2,
    backgroundColor: COLORS.primary,
  },
  waitlistButton: {
    flex: 1.2,
    backgroundColor: COLORS.secondary,
  },
  buttonLabel: {
    ...TEXT_STYLES.caption,
    fontSize: 11,
  },
  enrollButtonLabel: {
    ...TEXT_STYLES.caption,
    color: 'white',
    fontSize: 11,
  },
  waitlistButtonLabel: {
    ...TEXT_STYLES.caption,
    color: 'white',
    fontSize: 11,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
};

export default MentorshipPrograms;