import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  Dimensions,
  Animated,
  TouchableOpacity,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  ProgressBar,
  Avatar,
  FAB,
  Searchbar,
  Badge,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  accent: '#9C27B0',
  mentor: '#FF6B35',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold' },
  h2: { fontSize: 24, fontWeight: 'bold' },
  h3: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16 },
  caption: { fontSize: 14 },
  small: { fontSize: 12 },
};

const { width } = Dimensions.get('window');

// Mock data
const MOCK_MENTORSHIP_PROGRAMS = [
  {
    id: '1',
    title: 'Elite Strength Mentorship',
    mentor: {
      name: 'Coach Marcus Thompson',
      avatar: 'https://i.pravatar.cc/150?img=11',
      rating: 4.9,
      experience: '12 years',
      certifications: ['NASM-CPT', 'CSCS'],
      specialties: ['Powerlifting', 'Strength Training'],
    },
    category: 'strength',
    duration: '12 weeks',
    price: 299,
    spots: 3,
    totalSpots: 8,
    difficulty: 'Advanced',
    description: 'Master advanced strength techniques with personalized coaching and weekly check-ins.',
    highlights: ['1-on-1 Sessions', 'Custom Programs', 'Nutrition Guidance', 'Progress Tracking'],
    startDate: '2024-09-15',
    rating: 4.8,
    reviews: 24,
    isEnrolled: false,
    isPending: false,
  },
  {
    id: '2',
    title: 'Cardio Endurance Mastery',
    mentor: {
      name: 'Sarah Martinez',
      avatar: 'https://i.pravatar.cc/150?img=12',
      rating: 4.7,
      experience: '8 years',
      certifications: ['ACSM-CPT', 'Running Coach'],
      specialties: ['Endurance', 'Marathon Training'],
    },
    category: 'cardio',
    duration: '16 weeks',
    price: 399,
    spots: 1,
    totalSpots: 6,
    difficulty: 'Intermediate',
    description: 'Build incredible endurance and cardiovascular fitness with proven training methods.',
    highlights: ['Running Plans', 'Heart Rate Training', 'Recovery Protocols', 'Race Prep'],
    startDate: '2024-09-22',
    rating: 4.9,
    reviews: 18,
    isEnrolled: true,
    isPending: false,
  },
  {
    id: '3',
    title: 'Nutrition & Lifestyle Coaching',
    mentor: {
      name: 'Dr. Emily Chen',
      avatar: 'https://i.pravatar.cc/150?img=13',
      rating: 5.0,
      experience: '10 years',
      certifications: ['RD', 'Sports Nutrition'],
      specialties: ['Nutrition', 'Meal Planning'],
    },
    category: 'nutrition',
    duration: '8 weeks',
    price: 199,
    spots: 5,
    totalSpots: 10,
    difficulty: 'Beginner',
    description: 'Transform your relationship with food and develop sustainable eating habits.',
    highlights: ['Meal Plans', 'Macro Coaching', 'Recipe Library', 'Shopping Guides'],
    startDate: '2024-10-01',
    rating: 4.9,
    reviews: 31,
    isEnrolled: false,
    isPending: true,
  },
  {
    id: '4',
    title: 'Mindset & Performance Psychology',
    mentor: {
      name: 'Michael Rodriguez',
      avatar: 'https://i.pravatar.cc/150?img=14',
      rating: 4.8,
      experience: '15 years',
      certifications: ['Sports Psychologist', 'Mental Performance'],
      specialties: ['Mindset', 'Goal Setting'],
    },
    category: 'mindset',
    duration: '10 weeks',
    price: 349,
    spots: 2,
    totalSpots: 5,
    difficulty: 'All Levels',
    description: 'Develop mental toughness and overcome psychological barriers to peak performance.',
    highlights: ['Mindset Training', 'Goal Setting', 'Visualization', 'Stress Management'],
    startDate: '2024-09-20',
    rating: 4.9,
    reviews: 22,
    isEnrolled: false,
    isPending: false,
  },
];

const MOCK_USER_PROGRAMS = [
  {
    ...MOCK_MENTORSHIP_PROGRAMS[1],
    progress: 65,
    nextSession: '2024-08-30',
    completedModules: 10,
    totalModules: 16,
    status: 'active',
  },
];

const MOCK_APPLICATIONS = [
  {
    id: '3',
    programTitle: 'Nutrition & Lifestyle Coaching',
    mentorName: 'Dr. Emily Chen',
    appliedDate: '2024-08-25',
    status: 'pending',
    message: 'Looking forward to transforming my nutrition habits!',
  },
];

const TABS = [
  { key: 'browse', label: 'Browse', icon: 'search' },
  { key: 'my-programs', label: 'My Programs', icon: 'school' },
  { key: 'applications', label: 'Applications', icon: 'assignment' },
];

const CATEGORIES = [
  { key: 'all', label: 'All Programs', icon: 'fitness-center' },
  { key: 'strength', label: 'Strength', icon: 'fitness-center' },
  { key: 'cardio', label: 'Cardio', icon: 'directions-run' },
  { key: 'nutrition', label: 'Nutrition', icon: 'restaurant' },
  { key: 'mindset', label: 'Mindset', icon: 'psychology' },
];

const DIFFICULTY_COLORS = {
  'Beginner': COLORS.success,
  'Intermediate': COLORS.warning,
  'Advanced': COLORS.error,
  'All Levels': COLORS.primary,
};

const MentorshipProgram = ({ navigation }) => {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('browse');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Redux state
  const currentUser = useSelector(state => state.auth.user);
  const mentorshipPrograms = useSelector(state => state.mentorship.programs);
  const loading = useSelector(state => state.mentorship.loading);
  const dispatch = useDispatch();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Effects
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    loadMentorshipPrograms();
  }, [selectedCategory]);

  // Callbacks
  const loadMentorshipPrograms = useCallback(() => {
    // In real app, dispatch Redux action to fetch data
    // dispatch(fetchMentorshipPrograms({ category: selectedCategory }));
  }, [selectedCategory]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      loadMentorshipPrograms();
      setRefreshing(false);
    }, 1500);
  }, [loadMentorshipPrograms]);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category);
  }, []);

  const handleProgramPress = useCallback((program) => {
    navigation.navigate('ProgramDetails', { program });
  }, [navigation]);

  const handleApplyToProgram = useCallback((programId) => {
    Alert.alert(
      'Apply to Program',
      'Application process feature coming soon! Get ready to connect with amazing mentors! 🌟',
      [{ text: 'OK', style: 'default' }]
    );
  }, []);

  const handleMentorProfile = useCallback((mentorId) => {
    Alert.alert(
      'Mentor Profile',
      'Detailed mentor profile feature coming soon! 👨‍🏫',
      [{ text: 'OK', style: 'default' }]
    );
  }, []);

  const handleStartProgram = useCallback(() => {
    Alert.alert(
      'Start New Program',
      'Program creation wizard coming soon! 🚀',
      [{ text: 'OK', style: 'default' }]
    );
  }, []);

  // Render helper functions
  const renderDifficultyBadge = (difficulty) => (
    <Chip
      compact
      style={[styles.difficultyBadge, { backgroundColor: `${DIFFICULTY_COLORS[difficulty]}20` }]}
      textStyle={[styles.difficultyText, { color: DIFFICULTY_COLORS[difficulty] }]}
    >
      {difficulty}
    </Chip>
  );

  const renderProgramCard = (program, index) => {
    const animatedStyle = {
      opacity: fadeAnim,
      transform: [
        {
          translateY: slideAnim.interpolate({
            inputRange: [0, 50],
            outputRange: [0, 50],
          }),
        },
        { scale: scaleAnim },
      ],
    };

    const availabilityColor = program.spots <= 2 ? COLORS.error : COLORS.success;

    return (
      <Animated.View key={program.id} style={[animatedStyle, { delay: index * 100 }]}>
        <Card style={styles.programCard}>
          <TouchableOpacity
            onPress={() => handleProgramPress(program)}
            style={styles.programCardContent}
          >
            {/* Header */}
            <View style={styles.programHeader}>
              <Text style={[TEXT_STYLES.h3, styles.programTitle]}>{program.title}</Text>
              {program.isEnrolled && (
                <Badge style={styles.enrolledBadge}>Enrolled</Badge>
              )}
              {program.isPending && (
                <Badge style={styles.pendingBadge}>Pending</Badge>
              )}
            </View>

            {/* Mentor Info */}
            <TouchableOpacity
              onPress={() => handleMentorProfile(program.mentor.name)}
              style={styles.mentorSection}
            >
              <Avatar.Image size={50} source={{ uri: program.mentor.avatar }} />
              <View style={styles.mentorInfo}>
                <Text style={styles.mentorName}>{program.mentor.name}</Text>
                <View style={styles.mentorDetails}>
                  <Text style={styles.mentorExperience}>{program.mentor.experience} experience</Text>
                  <View style={styles.ratingContainer}>
                    <Icon name="star" size={16} color={COLORS.warning} />
                    <Text style={styles.ratingText}>{program.mentor.rating}</Text>
                  </View>
                </View>
                <View style={styles.specialtiesContainer}>
                  {program.mentor.specialties.slice(0, 2).map((specialty, idx) => (
                    <Chip key={idx} compact style={styles.specialtyChip}>
                      {specialty}
                    </Chip>
                  ))}
                </View>
              </View>
            </TouchableOpacity>

            {/* Program Details */}
            <View style={styles.programDetails}>
              <Text style={styles.programDescription}>{program.description}</Text>
              
              <View style={styles.programMeta}>
                <View style={styles.metaRow}>
                  <Icon name="schedule" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.metaText}>{program.duration}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Icon name="people" size={16} color={availabilityColor} />
                  <Text style={[styles.metaText, { color: availabilityColor }]}>
                    {program.spots} spots left
                  </Text>
                </View>
                <View style={styles.metaRow}>
                  <Icon name="event" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.metaText}>Starts {program.startDate}</Text>
                </View>
              </View>

              {renderDifficultyBadge(program.difficulty)}
            </View>

            {/* Highlights */}
            <View style={styles.highlightsContainer}>
              <Text style={styles.highlightsTitle}>What's Included:</Text>
              <View style={styles.highlightsList}>
                {program.highlights.map((highlight, idx) => (
                  <View key={idx} style={styles.highlightItem}>
                    <Icon name="check-circle" size={14} color={COLORS.success} />
                    <Text style={styles.highlightText}>{highlight}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Bottom Section */}
            <View style={styles.programBottom}>
              <View style={styles.priceSection}>
                <Text style={styles.priceText}>${program.price}</Text>
                <Text style={styles.priceLabel}>total program</Text>
              </View>
              
              <View style={styles.reviewsSection}>
                <Icon name="star" size={16} color={COLORS.warning} />
                <Text style={styles.reviewsText}>
                  {program.rating} ({program.reviews} reviews)
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Action Buttons */}
          <View style={styles.actionSection}>
            {program.isEnrolled ? (
              <Button
                mode="contained"
                style={styles.continueButton}
                onPress={() => handleProgramPress(program)}
              >
                Continue Program 📚
              </Button>
            ) : program.isPending ? (
              <Button
                mode="outlined"
                disabled
                style={styles.pendingButton}
              >
                Application Pending ⏳
              </Button>
            ) : (
              <Button
                mode="contained"
                style={styles.applyButton}
                onPress={() => handleApplyToProgram(program.id)}
                disabled={program.spots === 0}
              >
                {program.spots === 0 ? 'Program Full 😔' : 'Apply Now 🚀'}
              </Button>
            )}
          </View>
        </Card>
      </Animated.View>
    );
  };

  const renderMyProgramCard = (program) => (
    <Card style={styles.myProgramCard} key={program.id}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.myProgramGradient}>
        <View style={styles.myProgramContent}>
          <Text style={styles.myProgramTitle}>{program.title}</Text>
          <Text style={styles.myProgramMentor}>with {program.mentor.name}</Text>
          
          <View style={styles.progressSection}>
            <Text style={styles.progressLabel}>Progress: {program.progress}%</Text>
            <ProgressBar
              progress={program.progress / 100}
              color={COLORS.surface}
              style={styles.progressBar}
            />
            <Text style={styles.progressDetails}>
              {program.completedModules} of {program.totalModules} modules completed
            </Text>
          </View>

          <View style={styles.nextSessionContainer}>
            <Icon name="event" size={16} color={COLORS.surface} />
            <Text style={styles.nextSessionText}>
              Next session: {program.nextSession}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </Card>
  );

  const renderApplicationCard = (application) => (
    <Card style={styles.applicationCard} key={application.id}>
      <View style={styles.applicationContent}>
        <View style={styles.applicationHeader}>
          <Text style={styles.applicationTitle}>{application.programTitle}</Text>
          <Chip
            style={[
              styles.statusChip,
              application.status === 'pending' && styles.pendingStatusChip,
            ]}
            textStyle={styles.statusChipText}
          >
            {application.status}
          </Chip>
        </View>
        
        <Text style={styles.applicationMentor}>Mentor: {application.mentorName}</Text>
        <Text style={styles.applicationDate}>Applied: {application.appliedDate}</Text>
        
        {application.message && (
          <View style={styles.messageContainer}>
            <Text style={styles.messageLabel}>Your message:</Text>
            <Text style={styles.messageText}>"{application.message}"</Text>
          </View>
        )}
      </View>
    </Card>
  );

  const renderEmptyState = (title, text, buttonText, onPress) => (
    <Card style={styles.emptyStateCard}>
      <View style={styles.emptyState}>
        <Icon name="school" size={64} color={COLORS.textSecondary} />
        <Text style={styles.emptyStateTitle}>{title}</Text>
        <Text style={styles.emptyStateText}>{text}</Text>
        <Button
          mode="contained"
          onPress={onPress}
          style={styles.emptyStateButton}
        >
          {buttonText}
        </Button>
      </View>
    </Card>
  );

  const renderHeader = () => (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
      <Text style={[TEXT_STYLES.h1, styles.headerTitle]}>🎯 Mentorship Programs</Text>
      <Text style={styles.headerSubtitle}>
        Connect with expert coaches and accelerate your fitness journey!
      </Text>
    </LinearGradient>
  );

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      {TABS.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          onPress={() => handleTabChange(tab.key)}
          style={[
            styles.tabButton,
            activeTab === tab.key && styles.activeTabButton,
          ]}
        >
          <Icon
            name={tab.icon}
            size={24}
            color={activeTab === tab.key ? COLORS.primary : COLORS.textSecondary}
          />
          <Text
            style={[
              styles.tabButtonText,
              activeTab === tab.key && styles.activeTabButtonText,
            ]}
          >
            {tab.label}
          </Text>
          {tab.key === 'applications' && MOCK_APPLICATIONS.length > 0 && (
            <Badge style={styles.tabBadge} size={16}>
              {MOCK_APPLICATIONS.length}
            </Badge>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderCategoryFilters = () => (
    <View style={styles.categoryContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.key}
            onPress={() => handleCategoryChange(category.key)}
            style={[
              styles.categoryChip,
              selectedCategory === category.key && styles.selectedCategoryChip,
            ]}
          >
            <Icon
              name={category.icon}
              size={20}
              color={selectedCategory === category.key ? COLORS.surface : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === category.key && styles.selectedCategoryChipText,
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderBrowseContent = () => (
    <View style={styles.browseContent}>
      <Searchbar
        placeholder="Search mentorship programs..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        inputStyle={styles.searchInput}
        iconColor={COLORS.primary}
      />

      {renderCategoryFilters()}

      <View style={styles.programsList}>
        {MOCK_MENTORSHIP_PROGRAMS.map((program, index) => 
          renderProgramCard(program, index)
        )}
      </View>
    </View>
  );

  const renderMyProgramsContent = () => (
    <View style={styles.myProgramsContent}>
      <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
        📚 Active Programs ({MOCK_USER_PROGRAMS.length})
      </Text>
      {MOCK_USER_PROGRAMS.length > 0 ? (
        MOCK_USER_PROGRAMS.map(program => renderMyProgramCard(program))
      ) : (
        renderEmptyState(
          'No Active Programs',
          'Browse and apply to mentorship programs to start your learning journey!',
          'Browse Programs 🔍',
          () => handleTabChange('browse')
        )
      )}
    </View>
  );

  const renderApplicationsContent = () => (
    <View style={styles.applicationsContent}>
      <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
        📋 Pending Applications ({MOCK_APPLICATIONS.length})
      </Text>
      {MOCK_APPLICATIONS.length > 0 ? (
        MOCK_APPLICATIONS.map(application => renderApplicationCard(application))
      ) : (
        renderEmptyState(
          'No Applications',
          'Apply to mentorship programs to track your applications here!',
          'Browse Programs 🚀',
          () => handleTabChange('browse')
        )
      )}
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'browse':
        return renderBrowseContent();
      case 'my-programs':
        return renderMyProgramsContent();
      case 'applications':
        return renderApplicationsContent();
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {renderHeader()}
      {renderTabBar()}
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        <View style={styles.content}>
          {renderContent()}
          <View style={styles.bottomSpacing} />
        </View>
      </ScrollView>

      <FAB
        icon="add"
        style={styles.fab}
        color={COLORS.surface}
        onPress={handleStartProgram}
        label="Create"
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
    paddingTop: StatusBar.currentHeight + SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.lg,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: {
    color: COLORS.surface,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    color: COLORS.surface,
    textAlign: 'center',
    opacity: 0.9,
    fontSize: 16,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    elevation: 2,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.xs,
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabButtonText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  activeTabButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  tabBadge: {
    backgroundColor: COLORS.error,
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.lg,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
  },
  browseContent: {
    flex: 1,
  },
  searchBar: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  searchInput: {
    fontSize: 16,
  },
  categoryContainer: {
    marginBottom: SPACING.md,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: 25,
    backgroundColor: COLORS.surface,
    elevation: 1,
    gap: SPACING.xs,
  },
  selectedCategoryChip: {
    backgroundColor: COLORS.primary,
  },
  categoryChipText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  selectedCategoryChipText: {
    color: COLORS.surface,
  },
  programsList: {
    gap: SPACING.md,
  },
  programCard: {
    elevation: 3,
    backgroundColor: COLORS.surface,
    borderRadius: 15,
    overflow: 'hidden',
  },
  programCardContent: {
    padding: SPACING.md,
  },
  programHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  programTitle: {
    color: COLORS.text,
    flex: 1,
    marginRight: SPACING.sm,
  },
  enrolledBadge: {
    backgroundColor: COLORS.success,
  },
  pendingBadge: {
    backgroundColor: COLORS.warning,
  },
  mentorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  mentorInfo: {
    flex: 1,
  },
  mentorName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  mentorDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  mentorExperience: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  ratingText: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '500',
  },
  specialtiesContainer: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  specialtyChip: {
    backgroundColor: COLORS.background,
    height: 24,
  },
  programDetails: {
    marginBottom: SPACING.md,
  },
  programDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  programMeta: {
    marginBottom: SPACING.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    gap: SPACING.xs,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  highlightsContainer: {
    marginBottom: SPACING.md,
  },
  highlightsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  highlightsList: {
    gap: SPACING.xs,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  highlightText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  programBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceSection: {
    alignItems: 'flex-start',
  },
  priceText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  priceLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  reviewsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  reviewsText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  actionSection: {
    borderTopWidth: 1,
    borderTopColor: COLORS.background,
    padding: SPACING.md,
  },
  applyButton: {
    backgroundColor: COLORS.primary,
  },
  continueButton: {
    backgroundColor: COLORS.success,
  },
  pendingButton: {
    borderColor: COLORS.warning,
  },
  myProgramsContent: {
    flex: 1,
  },
  sectionTitle: {
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  myProgramCard: {
    marginBottom: SPACING.md,
    overflow: 'hidden',
    elevation: 3,
  },
  myProgramGradient: {
    padding: SPACING.lg,
  },
  myProgramContent: {
    alignItems: 'center',
  },
  myProgramTitle: {
    color: COLORS.surface,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  myProgramMentor: {
    color: COLORS.surface,
    fontSize: 14,
    opacity: 0.9,
    marginBottom: SPACING.lg,
  },
  progressSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  progressLabel: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  progressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginBottom: SPACING.sm,
  },
  progressDetails: {
    color: COLORS.surface,
    fontSize: 12,
    opacity: 0.9,
  },
  nextSessionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  nextSessionText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: '500',
  },
  applicationsContent: {
    flex: 1,
  },
  applicationCard: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  applicationContent: {
    padding: SPACING.md,
  },
  applicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  applicationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    marginRight: SPACING.sm,
  },
  statusChip: {
    backgroundColor: COLORS.background,
  },
  pendingStatusChip: {
    backgroundColor: `${COLORS.warning}20`,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  applicationMentor: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  applicationDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  messageContainer: {
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: 8,
  },
  messageLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginBottom: SPACING.xs,
  },
  messageText: {
    fontSize: 14,
    color: COLORS.text,
    fontStyle: 'italic',
  },
  emptyStateCard: {
    padding: SPACING.xl,
    elevation: 2,
  },
  emptyState: {
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptyStateText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  emptyStateButton: {
    backgroundColor: COLORS.primary,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default MentorshipProgram;