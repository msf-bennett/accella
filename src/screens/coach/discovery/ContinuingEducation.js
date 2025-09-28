import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Animated,
  RefreshControl,
  Alert,
  StatusBar,
  Dimensions,
  FlatList,
  Modal,
  Vibration,
} from 'react-native';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import { 
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Searchbar,
  Badge,
  Portal,
  ProgressBar,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your design system constants
import { COLORS } from '../../../styles/colors';
import { SPACING } from '../../../styles/spacing';
import { TEXT_STYLES } from '../../../styles/textStyles';
import { TYPOGRAPHY } from '../../../styles/typography';
import { LAYOUT } from '../../../styles/layout';

const { width, height } = Dimensions.get('window');

const ContinuingEducation = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('courses');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedDuration, setSelectedDuration] = useState('all');
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Mock data - replace with actual Redux state
  const [courses, setCourses] = useState([
    {
      id: '1',
      title: 'Advanced Sports Psychology for Coaches',
      instructor: 'Dr. Sarah Mitchell',
      instructorAvatar: 'https://i.pravatar.cc/150?img=1',
      category: 'psychology',
      level: 'advanced',
      duration: '8 weeks',
      hours: '24 hours',
      price: 199,
      originalPrice: 299,
      rating: 4.8,
      students: 1247,
      thumbnail: 'https://i.pravatar.cc/300?img=20',
      progress: 0,
      enrolled: false,
      certificate: true,
      tags: ['Mental Training', 'Performance', 'Leadership'],
      description: 'Master the psychological aspects of coaching and learn to unlock your athletes\' mental potential.',
      lessons: 32,
      upcoming: false,
    },
    {
      id: '2',
      title: 'Youth Development Coaching Methods',
      instructor: 'Coach Mike Johnson',
      instructorAvatar: 'https://i.pravatar.cc/150?img=2',
      category: 'youth',
      level: 'intermediate',
      duration: '6 weeks',
      hours: '18 hours',
      price: 149,
      originalPrice: 199,
      rating: 4.9,
      students: 892,
      thumbnail: 'https://i.pravatar.cc/300?img=21',
      progress: 65,
      enrolled: true,
      certificate: true,
      tags: ['Youth Training', 'Development', 'Fun Games'],
      description: 'Effective strategies for coaching young athletes with age-appropriate training methods.',
      lessons: 24,
      upcoming: false,
    },
    {
      id: '3',
      title: 'Sports Nutrition Fundamentals',
      instructor: 'Dr. Lisa Chen',
      instructorAvatar: 'https://i.pravatar.cc/150?img=3',
      category: 'nutrition',
      level: 'beginner',
      duration: '4 weeks',
      hours: '12 hours',
      price: 89,
      originalPrice: 129,
      rating: 4.7,
      students: 2156,
      thumbnail: 'https://i.pravatar.cc/300?img=22',
      progress: 0,
      enrolled: false,
      certificate: true,
      tags: ['Nutrition', 'Performance', 'Health'],
      description: 'Essential nutrition knowledge every coach needs to optimize athlete performance.',
      lessons: 16,
      upcoming: false,
    },
  ]);

  const [webinars, setWebinars] = useState([
    {
      id: '1',
      title: 'Injury Prevention in Youth Sports 🏥',
      presenter: 'Dr. Robert Kim',
      presenterAvatar: 'https://i.pravatar.cc/150?img=4',
      date: '2024-08-20',
      time: '2:00 PM EST',
      duration: '90 minutes',
      attendees: 456,
      maxAttendees: 500,
      price: 29,
      category: 'health',
      level: 'all',
      registered: false,
      live: true,
      thumbnail: 'https://i.pravatar.cc/300?img=23',
      description: 'Learn the latest techniques and strategies to prevent common injuries in young athletes.',
      topics: ['Warm-up protocols', 'Risk assessment', 'Recovery methods'],
    },
    {
      id: '2',
      title: 'Mental Resilience Training Workshop 🧠',
      presenter: 'Emma Thompson',
      presenterAvatar: 'https://i.pravatar.cc/150?img=5',
      date: '2024-08-22',
      time: '7:00 PM EST',
      duration: '2 hours',
      attendees: 234,
      maxAttendees: 300,
      price: 39,
      category: 'psychology',
      level: 'intermediate',
      registered: true,
      live: true,
      thumbnail: 'https://i.pravatar.cc/300?img=24',
      description: 'Build mental toughness and resilience in your athletes through proven techniques.',
      topics: ['Stress management', 'Goal setting', 'Confidence building'],
    },
  ]);

  const [certifications, setCertifications] = useState([
    {
      id: '1',
      title: 'Certified Youth Sports Coach',
      organization: 'International Coaching Academy',
      orgLogo: 'https://i.pravatar.cc/100?img=10',
      category: 'youth',
      level: 'professional',
      duration: '12 weeks',
      price: 599,
      requirements: ['2+ years coaching experience', 'Basic first aid certification'],
      benefits: ['Industry recognition', 'Career advancement', 'Continuing education credits'],
      nextExam: '2024-09-15',
      validity: '3 years',
      rating: 4.9,
      graduates: 15420,
      thumbnail: 'https://i.pravatar.cc/300?img=25',
      enrolled: false,
    },
    {
      id: '2',
      title: 'Sports Performance Specialist',
      organization: 'Performance Coaching Institute',
      orgLogo: 'https://i.pravatar.cc/100?img=11',
      category: 'performance',
      level: 'advanced',
      duration: '16 weeks',
      price: 899,
      requirements: ['Bachelor\'s degree', '5+ years coaching experience'],
      benefits: ['Higher earning potential', 'Expert status', 'Networking opportunities'],
      nextExam: '2024-10-01',
      validity: '5 years',
      rating: 4.8,
      graduates: 8745,
      thumbnail: 'https://i.pravatar.cc/300?img=26',
      enrolled: false,
    },
  ]);

  const categories = [
    { id: 'all', name: 'All', icon: 'category', color: COLORS.primary },
    { id: 'psychology', name: 'Psychology', icon: 'psychology', color: '#FF6B6B' },
    { id: 'youth', name: 'Youth', icon: 'child-care', color: '#4ECDC4' },
    { id: 'nutrition', name: 'Nutrition', icon: 'restaurant', color: '#45B7D1' },
    { id: 'performance', name: 'Performance', icon: 'trending-up', color: '#96CEB4' },
    { id: 'health', name: 'Health', icon: 'health-and-safety', color: '#FFA726' },
  ];

  const tabs = [
    { id: 'courses', name: 'Courses', icon: 'school' },
    { id: 'webinars', name: 'Webinars', icon: 'video-call' },
    { id: 'certifications', name: 'Certifications', icon: 'workspace-premium' },
    { id: 'progress', name: 'My Progress', icon: 'trending-up' },
  ];

  const levels = [
    { id: 'all', name: 'All Levels' },
    { id: 'beginner', name: 'Beginner' },
    { id: 'intermediate', name: 'Intermediate' },
    { id: 'advanced', name: 'Advanced' },
    { id: 'professional', name: 'Professional' },
  ];

  const durations = [
    { id: 'all', name: 'Any Duration' },
    { id: 'short', name: '< 4 weeks' },
    { id: 'medium', name: '4-8 weeks' },
    { id: 'long', name: '8+ weeks' },
  ];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      Vibration.vibrate(50);
    }, 1500);
  }, []);

  const handleEnrollCourse = useCallback((courseId) => {
    Vibration.vibrate(100);
    setCourses(prev => prev.map(course => {
      if (course.id === courseId) {
        return { ...course, enrolled: !course.enrolled, progress: course.enrolled ? 0 : course.progress };
      }
      return course;
    }));
  }, []);

  const handleRegisterWebinar = useCallback((webinarId) => {
    Vibration.vibrate(100);
    setWebinars(prev => prev.map(webinar => {
      if (webinar.id === webinarId) {
        return { ...webinar, registered: !webinar.registered };
      }
      return webinar;
    }));
  }, []);

  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <View>
          <Text style={[TEXT_STYLES.h1, styles.headerTitle]}>
            Continuing Education 📚
          </Text>
          <Text style={[TEXT_STYLES.caption, styles.headerSubtitle]}>
            Advance your coaching skills & knowledge
          </Text>
        </View>
        <View style={styles.headerStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );

  const renderTabBar = () => (
    <Surface style={styles.tabBar}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tabItem,
              selectedTab === tab.id && styles.activeTabItem
            ]}
            onPress={() => setSelectedTab(tab.id)}
          >
            <Icon
              name={tab.icon}
              size={20}
              color={selectedTab === tab.id ? COLORS.primary : '#666'}
            />
            <Text style={[
              styles.tabText,
              selectedTab === tab.id && styles.activeTabText
            ]}>
              {tab.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Surface>
  );

  const renderCategoryFilters = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.categoryContainer}
    >
      {categories.map((category) => (
        <Chip
          key={category.id}
          selected={selectedCategory === category.id}
          onPress={() => setSelectedCategory(category.id)}
          style={[
            styles.categoryChip,
            selectedCategory === category.id && {
              backgroundColor: category.color + '20',
              borderColor: category.color,
            }
          ]}
          textStyle={[
            styles.categoryText,
            selectedCategory === category.id && { color: category.color }
          ]}
          icon={category.icon}
        >
          {category.name}
        </Chip>
      ))}
    </ScrollView>
  );

  const renderCourseItem = ({ item }) => (
    <Card style={styles.courseCard}>
      <View style={styles.courseHeader}>
        <Avatar.Image size={80} source={{ uri: item.thumbnail }} />
        <View style={styles.courseInfo}>
          <Text style={[TEXT_STYLES.h4, styles.courseTitle]} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={[TEXT_STYLES.caption, styles.instructor]}>
            by {item.instructor}
          </Text>
          
          <View style={styles.courseMeta}>
            <View style={styles.ratingContainer}>
              <Icon name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
            <Text style={styles.metaText}>•</Text>
            <Text style={styles.metaText}>{item.students} students</Text>
            <Text style={styles.metaText}>•</Text>
            <Text style={styles.metaText}>{item.duration}</Text>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>${item.price}</Text>
            <Text style={styles.originalPrice}>${item.originalPrice}</Text>
            <Chip style={styles.discountChip} textStyle={styles.discountText}>
              {Math.round((1 - item.price / item.originalPrice) * 100)}% OFF
            </Chip>
          </View>
        </View>
      </View>

      {item.enrolled && item.progress > 0 && (
        <View style={styles.progressSection}>
          <Text style={styles.progressText}>Progress: {item.progress}%</Text>
          <ProgressBar 
            progress={item.progress / 100} 
            color={COLORS.primary}
            style={styles.progressBar}
          />
        </View>
      )}

      <View style={styles.tagsContainer}>
        {item.tags.map((tag, index) => (
          <Chip key={index} style={styles.courseTag} textStyle={styles.courseTagText}>
            {tag}
          </Chip>
        ))}
      </View>

      <Card.Actions>
        <Button
          mode={item.enrolled ? "outlined" : "contained"}
          style={[
            styles.enrollButton,
            item.enrolled && { borderColor: COLORS.primary }
          ]}
          onPress={() => handleEnrollCourse(item.id)}
        >
          {item.enrolled ? 'Continue Learning' : 'Enroll Now'}
        </Button>
        <IconButton
          icon="bookmark-border"
          size={20}
          onPress={() => {
            Vibration.vibrate(50);
            Alert.alert('Bookmark', 'Course bookmarked!');
          }}
        />
      </Card.Actions>
    </Card>
  );

  const renderWebinarItem = ({ item }) => (
    <Card style={styles.webinarCard}>
      <View style={styles.webinarHeader}>
        <Avatar.Image size={60} source={{ uri: item.thumbnail }} />
        <View style={styles.webinarInfo}>
          <Text style={[TEXT_STYLES.h4, styles.webinarTitle]} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={[TEXT_STYLES.caption, styles.presenter]}>
            by {item.presenter}
          </Text>
          
          <View style={styles.webinarMeta}>
            <Icon name="event" size={16} color="#666" />
            <Text style={styles.dateText}>{item.date}</Text>
            <Text style={styles.metaText}>•</Text>
            <Text style={styles.timeText}>{item.time}</Text>
          </View>

          <View style={styles.attendeeInfo}>
            <Icon name="people" size={16} color="#666" />
            <Text style={styles.attendeeText}>
              {item.attendees}/{item.maxAttendees} registered
            </Text>
            {item.live && (
              <Chip style={styles.liveChip} textStyle={styles.liveText}>
                🔴 LIVE
              </Chip>
            )}
          </View>
        </View>
        <Text style={styles.webinarPrice}>${item.price}</Text>
      </View>

      <Text style={[TEXT_STYLES.body, styles.webinarDescription]} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.topicsContainer}>
        <Text style={styles.topicsLabel}>Topics covered:</Text>
        {item.topics.map((topic, index) => (
          <Text key={index} style={styles.topicItem}>• {topic}</Text>
        ))}
      </View>

      <Card.Actions>
        <Button
          mode={item.registered ? "outlined" : "contained"}
          style={[
            styles.registerButton,
            item.registered && { borderColor: COLORS.success }
          ]}
          onPress={() => handleRegisterWebinar(item.id)}
        >
          {item.registered ? 'Registered ✓' : 'Register Now'}
        </Button>
        <IconButton
          icon="share"
          size={20}
          onPress={() => {
            Alert.alert('Share', 'Feature coming soon!');
          }}
        />
      </Card.Actions>
    </Card>
  );

  const renderCertificationItem = ({ item }) => (
    <Card style={styles.certificationCard}>
      <View style={styles.certificationHeader}>
        <Avatar.Image size={80} source={{ uri: item.thumbnail }} />
        <View style={styles.certificationInfo}>
          <Text style={[TEXT_STYLES.h4, styles.certificationTitle]} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={[TEXT_STYLES.caption, styles.organization]}>
            {item.organization}
          </Text>
          
          <View style={styles.certificationMeta}>
            <View style={styles.ratingContainer}>
              <Icon name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
            <Text style={styles.metaText}>•</Text>
            <Text style={styles.metaText}>{item.graduates} graduates</Text>
          </View>

          <View style={styles.examInfo}>
            <Icon name="event" size={14} color="#666" />
            <Text style={styles.examText}>Next exam: {item.nextExam}</Text>
          </View>
        </View>
        <Text style={styles.certificationPrice}>${item.price}</Text>
      </View>

      <View style={styles.requirementsSection}>
        <Text style={styles.sectionTitle}>Requirements:</Text>
        {item.requirements.map((req, index) => (
          <Text key={index} style={styles.requirementItem}>• {req}</Text>
        ))}
      </View>

      <View style={styles.benefitsSection}>
        <Text style={styles.sectionTitle}>Benefits:</Text>
        {item.benefits.map((benefit, index) => (
          <Text key={index} style={styles.benefitItem}>✓ {benefit}</Text>
        ))}
      </View>

      <Card.Actions>
        <Button
          mode="contained"
          style={styles.startButton}
          onPress={() => {
            Vibration.vibrate(100);
            Alert.alert('Certification', 'Feature coming soon!');
          }}
        >
          Start Certification
        </Button>
        <IconButton
          icon="info"
          size={20}
          onPress={() => {
            Alert.alert('Info', 'More details coming soon!');
          }}
        />
      </Card.Actions>
    </Card>
  );

  const renderProgressTab = () => {
    const enrolledCourses = courses.filter(course => course.enrolled);
    const registeredWebinars = webinars.filter(webinar => webinar.registered);
    
    return (
      <ScrollView style={styles.progressContainer}>
        <Surface style={styles.achievementCard}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.achievementHeader}
          >
            <Text style={styles.achievementTitle}>Your Learning Journey 🎓</Text>
          </LinearGradient>
          <View style={styles.achievementContent}>
            <View style={styles.achievementRow}>
              <View style={styles.achievementItem}>
                <Text style={styles.achievementNumber}>12</Text>
                <Text style={styles.achievementLabel}>Courses Completed</Text>
              </View>
              <View style={styles.achievementItem}>
                <Text style={styles.achievementNumber}>3</Text>
                <Text style={styles.achievementLabel}>Certifications Earned</Text>
              </View>
            </View>
            <View style={styles.achievementRow}>
              <View style={styles.achievementItem}>
                <Text style={styles.achievementNumber}>156</Text>
                <Text style={styles.achievementLabel}>Hours Learned</Text>
              </View>
              <View style={styles.achievementItem}>
                <Text style={styles.achievementNumber}>8</Text>
                <Text style={styles.achievementLabel}>Webinars Attended</Text>
              </View>
            </View>
          </View>
        </Surface>

        <Text style={styles.sectionTitle}>Current Courses</Text>
        {enrolledCourses.map(course => (
          <Card key={course.id} style={styles.progressCourseCard}>
            <Card.Content>
              <Text style={styles.progressCourseTitle}>{course.title}</Text>
              <Text style={styles.progressText}>Progress: {course.progress}%</Text>
              <ProgressBar 
                progress={course.progress / 100} 
                color={COLORS.primary}
                style={styles.progressBar}
              />
              <Text style={styles.progressDetails}>
                {Math.round(course.lessons * course.progress / 100)} of {course.lessons} lessons completed
              </Text>
            </Card.Content>
          </Card>
        ))}

        <Text style={styles.sectionTitle}>Upcoming Webinars</Text>
        {registeredWebinars.map(webinar => (
          <Card key={webinar.id} style={styles.upcomingWebinarCard}>
            <Card.Content>
              <Text style={styles.upcomingWebinarTitle}>{webinar.title}</Text>
              <View style={styles.webinarDateTime}>
                <Icon name="event" size={16} color={COLORS.primary} />
                <Text style={styles.dateTimeText}>{webinar.date} at {webinar.time}</Text>
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    );
  };

  const renderFilterModal = () => (
    <Portal>
      <Modal
        visible={showFilterModal}
        onDismiss={() => setShowFilterModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.modalBlur} blurType="light">
          <Surface style={styles.filterModalContent}>
            <Text style={[TEXT_STYLES.h3, styles.modalTitle]}>Filter Options</Text>
            
            <Text style={styles.filterLabel}>Level</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {levels.map((level) => (
                <Chip
                  key={level.id}
                  selected={selectedLevel === level.id}
                  onPress={() => setSelectedLevel(level.id)}
                  style={styles.filterChip}
                >
                  {level.name}
                </Chip>
              ))}
            </ScrollView>
            
            <Text style={styles.filterLabel}>Duration</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {durations.map((duration) => (
                <Chip
                  key={duration.id}
                  selected={selectedDuration === duration.id}
                  onPress={() => setSelectedDuration(duration.id)}
                  style={styles.filterChip}
                >
                  {duration.name}
                </Chip>
              ))}
            </ScrollView>
            
            <View style={styles.modalActions}>
              <Button 
                mode="outlined" 
                onPress={() => {
                  setSelectedLevel('all');
                  setSelectedDuration('all');
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
        </BlurView>
      </Modal>
    </Portal>
  );

  const renderContent = () => {
    if (selectedTab === 'progress') {
      return renderProgressTab();
    }

    let data = [];
    let renderItem = null;

    switch (selectedTab) {
      case 'courses':
        data = courses.filter(item => 
          (selectedCategory === 'all' || item.category === selectedCategory) &&
          (selectedLevel === 'all' || item.level === selectedLevel)
        );
        renderItem = renderCourseItem;
        break;
      case 'webinars':
        data = webinars.filter(item => 
          selectedCategory === 'all' || item.category === selectedCategory
        );
        renderItem = renderWebinarItem;
        break;
      case 'certifications':
        data = certifications.filter(item => 
          selectedCategory === 'all' || item.category === selectedCategory
        );
        renderItem = renderCertificationItem;
        break;
    }

    return (
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {renderHeader()}
        
        <Searchbar
          placeholder="Search courses, webinars, certifications..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor={COLORS.primary}
        />
        
        {renderTabBar()}
        
        {selectedTab !== 'progress' && renderCategoryFilters()}
        
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
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
        >
          {renderContent()}
        </ScrollView>
      </Animated.View>
      
      {selectedTab !== 'progress' && (
        <FAB
          style={styles.fab}
          icon="tune"
          onPress={() => {
            Vibration.vibrate(50);
            setShowFilterModal(true);
          }}
          color="white"
          customSize={56}
        />
      )}
      
      {renderFilterModal()}
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    marginTop: SPACING.xs,
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
  },
  statNumber: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  searchBar: {
    margin: SPACING.md,
    elevation: 2,
    borderRadius: 12,
  },
  searchInput: {
    fontSize: 14,
  },
  tabBar: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: 12,
    elevation: 2,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.xs,
    borderRadius: 8,
  },
  activeTabItem: {
    backgroundColor: COLORS.primary + '20',
  },
  tabText: {
    marginLeft: SPACING.xs,
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  categoryContainer: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  categoryChip: {
    marginRight: SPACING.xs,
    backgroundColor: 'white',
  },
  categoryText: {
    fontSize: 12,
  },
  scrollView: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 80,
  },
  
  // Course Styles
  courseCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    elevation: 3,
  },
  courseHeader: {
    flexDirection: 'row',
    padding: SPACING.md,
  },
  courseInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  courseTitle: {
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  instructor: {
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  courseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: SPACING.xs,
    fontSize: 12,
    color: '#666',
  },
  metaText: {
    fontSize: 12,
    color: '#999',
    marginHorizontal: SPACING.xs,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
    marginLeft: SPACING.xs,
  },
  discountChip: {
    marginLeft: SPACING.xs,
    backgroundColor: '#FF6B6B',
  },
  discountText: {
    color: 'white',
    fontSize: 10,
  },
  progressSection: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    marginBottom: SPACING.xs,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  courseTag: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
    backgroundColor: '#f5f5f5',
  },
  courseTagText: {
    fontSize: 10,
    color: '#666',
  },
  enrollButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  
  // Webinar Styles
  webinarCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    elevation: 3,
  },
  webinarHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  webinarInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  webinarTitle: {
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  presenter: {
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  webinarMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  dateText: {
    marginLeft: SPACING.xs,
    fontSize: 12,
    color: '#666',
  },
  timeText: {
    fontSize: 12,
    color: '#666',
  },
  attendeeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attendeeText: {
    marginLeft: SPACING.xs,
    fontSize: 12,
    color: '#666',
  },
  liveChip: {
    marginLeft: SPACING.sm,
    backgroundColor: '#FF4444',
  },
  liveText: {
    color: 'white',
    fontSize: 10,
  },
  webinarPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  webinarDescription: {
    paddingHorizontal: SPACING.md,
    color: '#666',
    marginBottom: SPACING.sm,
  },
  topicsContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  topicsLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: SPACING.xs,
  },
  topicItem: {
    fontSize: 12,
    color: '#666',
    marginLeft: SPACING.xs,
  },
  registerButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  
  // Certification Styles
  certificationCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    elevation: 3,
  },
  certificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  certificationInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  certificationTitle: {
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  organization: {
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  certificationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  examInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  examText: {
    marginLeft: SPACING.xs,
    fontSize: 12,
    color: '#666',
  },
  certificationPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  requirementsSection: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  benefitsSection: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: SPACING.xs,
  },
  requirementItem: {
    fontSize: 12,
    color: '#666',
    marginLeft: SPACING.xs,
    marginBottom: 2,
  },
  benefitItem: {
    fontSize: 12,
    color: COLORS.success,
    marginLeft: SPACING.xs,
    marginBottom: 2,
  },
  startButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  
  // Progress Tab Styles
  progressContainer: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  achievementCard: {
    marginBottom: SPACING.lg,
    borderRadius: 12,
    elevation: 3,
    overflow: 'hidden',
  },
  achievementHeader: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  achievementTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  achievementContent: {
    padding: SPACING.md,
  },
  achievementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  achievementItem: {
    alignItems: 'center',
    flex: 1,
  },
  achievementNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  achievementLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  progressCourseCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    elevation: 2,
  },
  progressCourseTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  progressDetails: {
    fontSize: 12,
    color: '#666',
    marginTop: SPACING.xs,
  },
  upcomingWebinarCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    elevation: 2,
  },
  upcomingWebinarTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  webinarDateTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateTimeText: {
    marginLeft: SPACING.xs,
    fontSize: 12,
    color: COLORS.primary,
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  filterModalContent: {
    width: width - 32,
    maxHeight: height * 0.7,
    borderRadius: 12,
    padding: SPACING.lg,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: SPACING.lg,
    fontWeight: 'bold',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
    color: '#333',
  },
  filterChip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
  },
  clearButton: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  applyButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  
  // FAB
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
};

export default ContinuingEducation;