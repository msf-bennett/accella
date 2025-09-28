import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Animated,
  TouchableOpacity,
  Dimensions,
  Alert,
  Vibration,
  FlatList,
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  ProgressBar,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Searchbar,
  Badge,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Design system imports
import { COLORS, SPACING, TEXT_STYLES } from '../styles/designSystem';

const { width, height } = Dimensions.get('window');

const SportSpecificCourses = ({ navigation }) => {
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [activeTab, setActiveTab] = useState('courses');
  const [viewMode, setViewMode] = useState('grid'); // grid or list

  // Redux state
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const courses = useSelector(state => state.courses.sportCourses);
  const enrolledCourses = useSelector(state => state.progress.enrolledCourses);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Mock data for courses
  const mockCourses = [
    {
      id: 1,
      title: 'Basketball Fundamentals Pro',
      sport: 'basketball',
      instructor: 'Coach Mike Johnson',
      instructorAvatar: 'https://example.com/avatar1.jpg',
      description: 'Master the essential skills of basketball from dribbling to shooting techniques.',
      level: 'beginner',
      duration: '8 weeks',
      modules: 24,
      enrolled: 1847,
      rating: 4.8,
      reviews: 234,
      price: 'Free',
      thumbnail: 'course_basketball_1.jpg',
      tags: ['Fundamentals', 'Shooting', 'Dribbling', 'Defense'],
      progress: 0,
      isEnrolled: false,
      featured: true,
      completionRate: '89%',
      certificate: true,
      estimatedHours: '12-16 hours',
      skills: ['Ball Handling', 'Shooting Form', 'Court Awareness', 'Basic Defense'],
      prerequisites: 'None - Perfect for beginners',
    },
    {
      id: 2,
      title: 'Advanced Football Tactics',
      sport: 'football',
      instructor: 'Sarah Williams',
      instructorAvatar: 'https://example.com/avatar2.jpg',
      description: 'Deep dive into modern football formations, pressing, and tactical analysis.',
      level: 'advanced',
      duration: '12 weeks',
      modules: 36,
      enrolled: 923,
      rating: 4.9,
      reviews: 187,
      price: '$49.99',
      thumbnail: 'course_football_1.jpg',
      tags: ['Tactics', 'Formations', 'Analysis', 'Strategy'],
      progress: 0.65,
      isEnrolled: true,
      featured: false,
      completionRate: '76%',
      certificate: true,
      estimatedHours: '20-25 hours',
      skills: ['Tactical Understanding', 'Formation Play', 'Pressing Schemes', 'Game Reading'],
      prerequisites: 'Basic football knowledge required',
    },
    {
      id: 3,
      title: 'Tennis Serve Mastery',
      sport: 'tennis',
      instructor: 'Rafael Martinez',
      instructorAvatar: 'https://example.com/avatar3.jpg',
      description: 'Perfect your tennis serve with biomechanics and advanced techniques.',
      level: 'intermediate',
      duration: '6 weeks',
      modules: 18,
      enrolled: 656,
      rating: 4.7,
      reviews: 89,
      price: '$29.99',
      thumbnail: 'course_tennis_1.jpg',
      tags: ['Serve', 'Technique', 'Power', 'Accuracy'],
      progress: 1.0,
      isEnrolled: true,
      featured: false,
      completionRate: '92%',
      certificate: true,
      estimatedHours: '8-12 hours',
      skills: ['Serve Technique', 'Power Generation', 'Spin Variation', 'Consistency'],
      prerequisites: 'Basic tennis experience',
      completed: true,
      completedDate: '1 week ago',
    },
    {
      id: 4,
      title: 'Swimming Stroke Perfection',
      sport: 'swimming',
      instructor: 'Emily Chen',
      instructorAvatar: 'https://example.com/avatar4.jpg',
      description: 'Refine all four competitive swimming strokes with video analysis.',
      level: 'intermediate',
      duration: '10 weeks',
      modules: 28,
      enrolled: 1234,
      rating: 4.6,
      reviews: 156,
      price: '$39.99',
      thumbnail: 'course_swimming_1.jpg',
      tags: ['Technique', 'Freestyle', 'Backstroke', 'Butterfly'],
      progress: 0.3,
      isEnrolled: true,
      featured: true,
      completionRate: '84%',
      certificate: true,
      estimatedHours: '15-20 hours',
      skills: ['Stroke Technique', 'Breathing', 'Turns', 'Pacing'],
      prerequisites: 'Ability to swim all strokes',
    },
    {
      id: 5,
      title: 'Strength Training for Athletes',
      sport: 'fitness',
      instructor: 'Marcus Thompson',
      instructorAvatar: 'https://example.com/avatar5.jpg',
      description: 'Sport-specific strength training programs for peak performance.',
      level: 'beginner',
      duration: '16 weeks',
      modules: 48,
      enrolled: 2156,
      rating: 4.9,
      reviews: 412,
      price: 'Free',
      thumbnail: 'course_fitness_1.jpg',
      tags: ['Strength', 'Conditioning', 'Performance', 'Recovery'],
      progress: 0,
      isEnrolled: false,
      featured: true,
      completionRate: '91%',
      certificate: true,
      estimatedHours: '25-30 hours',
      skills: ['Compound Movements', 'Progressive Overload', 'Recovery', 'Periodization'],
      prerequisites: 'Basic gym safety knowledge',
    },
    {
      id: 6,
      title: 'Golf Short Game Clinic',
      sport: 'golf',
      instructor: 'James Peterson',
      instructorAvatar: 'https://example.com/avatar6.jpg',
      description: 'Master chipping, pitching, and putting for lower scores.',
      level: 'intermediate',
      duration: '8 weeks',
      modules: 20,
      enrolled: 445,
      rating: 4.8,
      reviews: 67,
      price: '$59.99',
      thumbnail: 'course_golf_1.jpg',
      tags: ['Short Game', 'Putting', 'Chipping', 'Course Management'],
      progress: 0,
      isEnrolled: false,
      featured: false,
      completionRate: '88%',
      certificate: true,
      estimatedHours: '10-14 hours',
      skills: ['Chipping Technique', 'Putting Stroke', 'Distance Control', 'Green Reading'],
      prerequisites: 'Basic golf knowledge',
    },
  ];

  const sports = [
    { id: 'all', name: 'All Sports', icon: 'sports', count: 24, color: COLORS.primary },
    { id: 'basketball', name: 'Basketball', icon: 'sports-basketball', count: 8, color: '#ff9800' },
    { id: 'football', name: 'Football', icon: 'sports-soccer', count: 6, color: '#4caf50' },
    { id: 'tennis', name: 'Tennis', icon: 'sports-tennis', count: 4, color: '#e91e63' },
    { id: 'swimming', name: 'Swimming', icon: 'pool', count: 3, color: '#2196f3' },
    { id: 'fitness', name: 'Fitness', icon: 'fitness-center', count: 5, color: '#f44336' },
    { id: 'golf', name: 'Golf', icon: 'sports-golf', count: 3, color: '#8bc34a' },
  ];

  const levels = [
    { id: 'all', name: 'All Levels', icon: 'school' },
    { id: 'beginner', name: 'Beginner', icon: 'star-outline' },
    { id: 'intermediate', name: 'Intermediate', icon: 'star-half' },
    { id: 'advanced', name: 'Advanced', icon: 'star' },
  ];

  const tabs = [
    { id: 'courses', name: 'All Courses', icon: 'school' },
    { id: 'enrolled', name: 'My Courses', icon: 'bookmark' },
    { id: 'completed', name: 'Completed', icon: 'check-circle' },
  ];

  // Component lifecycle
  useEffect(() => {
    initializeAnimations();
    // Simulate loading courses
    // dispatch(fetchSportCourses());
  }, []);

  const initializeAnimations = () => {
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
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Event handlers
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      Vibration.vibrate(50);
    }, 1500);
  }, []);

  const handleCoursePress = (course) => {
    Vibration.vibrate(30);
    if (course.completed) {
      Alert.alert(
        "Course Completed! 🎓",
        `You completed "${course.title}" ${course.completedDate}.\n\nWould you like to review the content or leave a rating?`,
        [
          { text: "Review Content", style: "default" },
          { text: "Rate Course", style: "default" },
          { text: "Cancel", style: "cancel" }
        ]
      );
    } else if (course.isEnrolled) {
      Alert.alert(
        "Continue Learning 📚",
        `Resume "${course.title}"?\n\nProgress: ${Math.round(course.progress * 100)}%`,
        [
          { text: "Continue", style: "default" },
          { text: "Course Details", style: "default" },
          { text: "Cancel", style: "cancel" }
        ]
      );
    } else {
      Alert.alert(
        "Enroll in Course? 🚀",
        `"${course.title}"\n\nInstructor: ${course.instructor}\nDuration: ${course.duration}\nPrice: ${course.price}\n\nReady to start learning?`,
        [
          { text: "View Preview", style: "default" },
          { text: "Enroll Now", style: "default" },
          { text: "Cancel", style: "cancel" }
        ]
      );
    }
  };

  const handleInstructorPress = (course) => {
    Vibration.vibrate(30);
    Alert.alert(
      `Instructor: ${course.instructor} 👨‍🏫`,
      "View instructor profile and other courses?",
      [
        { text: "View Profile", style: "default" },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'beginner': return COLORS.success;
      case 'intermediate': return '#ff9800';
      case 'advanced': return COLORS.error;
      default: return COLORS.primary;
    }
  };

  const getSportColor = (sport) => {
    const sportObj = sports.find(s => s.id === sport);
    return sportObj ? sportObj.color : COLORS.primary;
  };

  const getFilteredCourses = () => {
    let filtered = mockCourses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSport = selectedSport === 'all' || course.sport === selectedSport;
      const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
      
      return matchesSearch && matchesSport && matchesLevel;
    });

    // Apply tab filtering
    switch (activeTab) {
      case 'enrolled':
        filtered = filtered.filter(course => course.isEnrolled && !course.completed);
        break;
      case 'completed':
        filtered = filtered.filter(course => course.completed);
        break;
      default:
        break;
    }

    return filtered;
  };

  // Render components
  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.header}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[TEXT_STYLES.h2, { color: 'white' }]}>
              Sport Courses 🎓
            </Text>
            <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.9)', marginTop: SPACING.xs }]}>
              Learn from expert coaches and athletes
            </Text>
          </View>
          <View style={styles.headerActions}>
            <IconButton
              icon={viewMode === 'grid' ? 'view-list' : 'view-module'}
              iconColor="white"
              size={24}
              onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            />
            <IconButton
              icon="bookmark"
              iconColor="white"
              size={24}
              onPress={() => setActiveTab('enrolled')}
            />
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <Surface style={styles.quickStatCard}>
            <Text style={[TEXT_STYLES.h4, { color: COLORS.primary }]}>3</Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Enrolled</Text>
          </Surface>
          <Surface style={styles.quickStatCard}>
            <Text style={[TEXT_STYLES.h4, { color: COLORS.success }]}>1</Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Completed</Text>
          </Surface>
          <Surface style={styles.quickStatCard}>
            <Text style={[TEXT_STYLES.h4, { color: '#ff9800' }]}>45h</Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Learning</Text>
          </Surface>
          <Surface style={styles.quickStatCard}>
            <Text style={[TEXT_STYLES.h4, { color: '#e91e63' }]}>2</Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Certificates</Text>
          </Surface>
        </View>
      </View>
    </LinearGradient>
  );

  const renderTabsAndSearch = () => (
    <View style={styles.tabsContainer}>
      {/* Tab Navigation */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsScrollView}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && styles.activeTab
            ]}
            onPress={() => setActiveTab(tab.id)}
            activeOpacity={0.7}
          >
            <Icon
              name={tab.icon}
              size={20}
              color={activeTab === tab.id ? 'white' : COLORS.textSecondary}
            />
            <Text style={[
              styles.tabText,
              activeTab === tab.id && styles.activeTabText
            ]}>
              {tab.name}
            </Text>
            {tab.id === 'enrolled' && (
              <Badge style={styles.tabBadge} size={16}>3</Badge>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Search */}
      <Searchbar
        placeholder="Search courses, instructors..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
        iconColor={COLORS.primary}
      />

      {/* Sport Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        {sports.map((sport) => (
          <Chip
            key={sport.id}
            selected={selectedSport === sport.id}
            onPress={() => setSelectedSport(sport.id)}
            style={[
              styles.sportChip,
              selectedSport === sport.id && { backgroundColor: sport.color }
            ]}
            textStyle={{
              color: selectedSport === sport.id ? 'white' : sport.color
            }}
            icon={sport.icon}
          >
            {sport.name}
          </Chip>
        ))}
      </ScrollView>

      {/* Level Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.filterContainer, { paddingTop: SPACING.xs }]}
      >
        {levels.map((level) => (
          <Chip
            key={level.id}
            selected={selectedLevel === level.id}
            onPress={() => setSelectedLevel(level.id)}
            style={[
              styles.levelChip,
              selectedLevel === level.id && { backgroundColor: COLORS.primary }
            ]}
            textStyle={{
              color: selectedLevel === level.id ? 'white' : COLORS.text
            }}
            icon={level.icon}
          >
            {level.name}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const renderCourseCard = (course) => (
    <Animated.View
      key={course.id}
      style={[
        viewMode === 'grid' ? styles.courseCardGrid : styles.courseCardList,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }
      ]}
    >
      <TouchableOpacity
        onPress={() => handleCoursePress(course)}
        activeOpacity={0.9}
      >
        <Card style={styles.courseCard}>
          {/* Course Image/Thumbnail */}
          <View style={styles.courseThumbnail}>
            <LinearGradient
              colors={[getSportColor(course.sport) + 'CC', getSportColor(course.sport)]}
              style={styles.thumbnailGradient}
            >
              <Icon name={sports.find(s => s.id === course.sport)?.icon || 'school'} size={40} color="white" />
              {course.featured && (
                <View style={styles.featuredBadge}>
                  <Icon name="star" size={14} color="#ffc107" />
                  <Text style={styles.featuredText}>Featured</Text>
                </View>
              )}
            </LinearGradient>
            
            {/* Progress Overlay */}
            {course.isEnrolled && course.progress > 0 && (
              <View style={styles.progressOverlay}>
                <ProgressBar
                  progress={course.progress}
                  color="white"
                  style={styles.thumbnailProgress}
                />
                <Text style={styles.progressText}>
                  {Math.round(course.progress * 100)}%
                </Text>
              </View>
            )}
          </View>

          <View style={styles.courseContent}>
            {/* Course Header */}
            <View style={styles.courseHeader}>
              <Text style={[TEXT_STYLES.h4, styles.courseTitle]} numberOfLines={2}>
                {course.title}
              </Text>
              <View style={styles.courseMeta}>
                <Chip
                  style={[styles.levelChip, { backgroundColor: getLevelColor(course.level) + '20' }]}
                  textStyle={{ color: getLevelColor(course.level), fontSize: 11 }}
                >
                  {course.level.toUpperCase()}
                </Chip>
                {course.certificate && (
                  <Icon name="verified" size={16} color="#4caf50" style={{ marginLeft: SPACING.xs }} />
                )}
              </View>
            </View>

            {/* Instructor */}
            <TouchableOpacity
              style={styles.instructorRow}
              onPress={() => handleInstructorPress(course)}
              activeOpacity={0.7}
            >
              <Avatar.Text
                size={32}
                label={course.instructor.split(' ').map(n => n[0]).join('')}
                style={styles.instructorAvatar}
              />
              <Text style={[TEXT_STYLES.body, styles.instructorName]}>
                {course.instructor}
              </Text>
            </TouchableOpacity>

            {/* Description */}
            <Text style={[TEXT_STYLES.body, styles.courseDescription]} numberOfLines={2}>
              {course.description}
            </Text>

            {/* Course Stats */}
            <View style={styles.courseStats}>
              <View style={styles.statItem}>
                <Icon name="schedule" size={14} color={COLORS.textSecondary} />
                <Text style={styles.statText}>{course.duration}</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="play-circle-outline" size={14} color={COLORS.textSecondary} />
                <Text style={styles.statText}>{course.modules} modules</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="people" size={14} color={COLORS.textSecondary} />
                <Text style={styles.statText}>{course.enrolled}</Text>
              </View>
            </View>

            {/* Rating and Price */}
            <View style={styles.courseFooter}>
              <View style={styles.ratingContainer}>
                <Icon name="star" size={16} color="#ffc107" />
                <Text style={styles.ratingText}>{course.rating}</Text>
                <Text style={styles.reviewsText}>({course.reviews})</Text>
              </View>
              <Text style={[
                TEXT_STYLES.h4,
                { color: course.price === 'Free' ? COLORS.success : COLORS.primary }
              ]}>
                {course.price}
              </Text>
            </View>

            {/* Action Button */}
            <Button
              mode={course.completed ? "outlined" : course.isEnrolled ? "contained" : "contained"}
              onPress={() => handleCoursePress(course)}
              style={styles.courseButton}
              buttonColor={
                course.completed ? 'transparent' :
                course.isEnrolled ? COLORS.primary :
                getSportColor(course.sport)
              }
              textColor={
                course.completed ? COLORS.primary :
                'white'
              }
              icon={
                course.completed ? "check-circle" :
                course.isEnrolled ? "play-arrow" :
                "school"
              }
            >
              {course.completed ? 'Completed' :
               course.isEnrolled ? 'Continue' :
               'Enroll Now'}
            </Button>
          </View>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="school" size={64} color={COLORS.textSecondary} />
      <Text style={[TEXT_STYLES.h3, styles.emptyTitle]}>
        {activeTab === 'enrolled' ? 'No enrolled courses' :
         activeTab === 'completed' ? 'No completed courses' :
         'No courses found'}
      </Text>
      <Text style={[TEXT_STYLES.body, styles.emptySubtitle]}>
        {activeTab === 'enrolled' ? 'Start learning by enrolling in courses' :
         activeTab === 'completed' ? 'Complete your enrolled courses to see them here' :
         'Try adjusting your search or filters'}
      </Text>
      <Button
        mode="outlined"
        onPress={() => {
          if (activeTab !== 'courses') {
            setActiveTab('courses');
          } else {
            setSearchQuery('');
            setSelectedSport('all');
            setSelectedLevel('all');
          }
        }}
        style={{ marginTop: SPACING.md }}
      >
        {activeTab === 'courses' ? 'Clear Filters' : 'Browse Courses'}
      </Button>
    </View>
  );

  const filteredCourses = getFilteredCourses();

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderTabsAndSearch()}
        
        <View style={styles.coursesContainer}>
          {filteredCourses.length > 0 ? (
            <>
              <View style={styles.sectionHeader}>
                <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
                  {filteredCourses.length} Course{filteredCourses.length !== 1 ? 's' : ''}
                  {activeTab === 'enrolled' ? ' In Progress' :
                   activeTab === 'completed' ? ' Completed' : ' Available'}
                </Text>
                {viewMode === 'grid' && (
                  <Text style={[TEXT_STYLES.caption, styles.viewModeHint]}>
                    Tap list icon to change view
                  </Text>
                )}
              </View>
              
              <View style={viewMode === 'grid' ? styles.gridContainer : styles.listContainer}>
                {filteredCourses.map(renderCourseCard)}
              </View>
            </>
          ) : (
            renderEmptyState()
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => Alert.alert("Request Course", "Request a specific course or suggest topics! 🎓")}
        color="white"
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
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    marginTop: SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerActions: {
    flexDirection: 'row',
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
  },
  quickStatCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 2,
    elevation: 2,
  },
  content: {
    flex: 1,
  },
  tabsContainer: {
    backgroundColor: 'white',
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabsScrollView: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.background,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    marginLeft: SPACING.xs,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  activeTabText: {
    color: 'white',
  },
  tabBadge: {
    marginLeft: SPACING.xs,
    backgroundColor: COLORS.error,
  },
  searchbar: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.background,
    elevation: 0,
  },
  filterContainer: {
    paddingHorizontal: SPACING.lg,
  },
  sportChip: {
    marginRight: SPACING.sm,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  levelChip: {
    marginRight: SPACING.sm,
    backgroundColor: 'white',
  },
  coursesContainer: {
    padding: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    color: COLORS.text,
  },
  viewModeHint: {
    color: COLORS.textSecondary,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  listContainer: {
    width: '100%',
  },
  courseCardGrid: {
    width: (width - SPACING.lg * 3) / 2,
    marginBottom: SPACING.lg,
  },
  courseCardList: {
    width: '100%',
    marginBottom: SPACING.lg,
  },
  courseCard: {
    backgroundColor: 'white',
    elevation: 3,
    borderRadius: 16,
    overflow: 'hidden',
  },
  courseThumbnail: {
    height: 120,
    position: 'relative',
  },
  thumbnailGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  featuredBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 12,
  },
  featuredText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 2,
    color: '#ffc107',
  },
  progressOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: SPACING.sm,
  },
  thumbnailProgress: {
    height: 4,
    borderRadius: 2,
    marginBottom: SPACING.xs,
  },
  progressText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
  },
  courseContent: {
    padding: SPACING.md,
  },
  courseHeader: {
    marginBottom: SPACING.sm,
  },
  courseTitle: {
    color: COLORS.text,
    marginBottom: SPACING.xs,
    lineHeight: 20,
  },
  courseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  instructorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  instructorAvatar: {
    backgroundColor: COLORS.primary,
  },
  instructorName: {
    marginLeft: SPACING.sm,
    color: COLORS.textSecondary,
    flex: 1,
  },
  courseDescription: {
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  courseStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  courseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: SPACING.xs,
    color: COLORS.text,
  },
  reviewsText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  courseButton: {
    borderRadius: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyTitle: {
    marginTop: SPACING.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  emptySubtitle: {
    marginTop: SPACING.sm,
    textAlign: 'center',
    color: COLORS.textSecondary,
    paddingHorizontal: SPACING.lg,
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.lg,
    backgroundColor: COLORS.primary,
  },
});

export default SportSpecificCourses;