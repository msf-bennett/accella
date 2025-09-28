import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StatusBar,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Animated,
  FlatList,
  Vibration,
  Dimensions,
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
  Portal,
  Modal,
  Divider,
  Badge,
  List,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width: screenWidth } = Dimensions.get('window');

// Constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  text: '#212121',
  textSecondary: '#757575',
  purple: '#9C27B0',
  teal: '#009688',
  indigo: '#3F51B5',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 24, fontWeight: '600', color: COLORS.text },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  body1: { fontSize: 16, color: COLORS.text },
  body2: { fontSize: 14, color: COLORS.textSecondary },
  caption: { fontSize: 12, color: COLORS.textSecondary },
};

const ContinuingEducation = ({ navigation }) => {
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, courses, progress, calendar
  const [searchQuery, setSearchQuery] = useState('');
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showAddCeuModal, setShowAddCeuModal] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Mock CEU requirements data
  const ceuRequirements = [
    {
      id: '1',
      certification: 'ACSM Certified Personal Trainer',
      totalRequired: 20,
      completed: 15,
      remaining: 5,
      deadline: '2025-03-15',
      status: 'on_track',
      categories: {
        'General': { required: 10, completed: 8 },
        'Practical': { required: 10, completed: 7 },
      }
    },
    {
      id: '2',
      certification: 'NASM Corrective Exercise Specialist',
      totalRequired: 15,
      completed: 8,
      remaining: 7,
      deadline: '2025-01-20',
      status: 'behind',
      categories: {
        'General': { required: 8, completed: 5 },
        'Specialized': { required: 7, completed: 3 },
      }
    }
  ];

  // Mock courses data
  const availableCourses = [
    {
      id: '1',
      title: 'Advanced Biomechanics in Exercise',
      provider: 'ACSM',
      instructor: 'Dr. Sarah Wilson',
      duration: 120, // minutes
      ceuCredits: 2.0,
      category: 'General',
      difficulty: 'Advanced',
      format: 'online',
      price: 89.99,
      rating: 4.8,
      reviews: 342,
      description: 'Deep dive into biomechanical principles for exercise prescription and injury prevention.',
      thumbnail: 'https://via.placeholder.com/300x200/4CAF50/white?text=Biomechanics',
      featured: true,
      tags: ['Biomechanics', 'Exercise Science', 'Injury Prevention'],
      startDate: '2024-08-25',
      enrolledStudents: 1250,
    },
    {
      id: '2',
      title: 'Nutrition for Athletic Performance',
      provider: 'NSCA',
      instructor: 'Maria Rodriguez, RD',
      duration: 90,
      ceuCredits: 1.5,
      category: 'Specialized',
      difficulty: 'Intermediate',
      format: 'webinar',
      price: 65.00,
      rating: 4.9,
      reviews: 578,
      description: 'Evidence-based nutritional strategies for optimizing athletic performance.',
      thumbnail: 'https://via.placeholder.com/300x200/FF9800/white?text=Nutrition',
      featured: true,
      tags: ['Nutrition', 'Performance', 'Sports'],
      startDate: '2024-08-28',
      enrolledStudents: 890,
    },
    {
      id: '3',
      title: 'Mental Health in Fitness Settings',
      provider: 'NCHEC',
      instructor: 'Dr. James Thompson',
      duration: 180,
      ceuCredits: 3.0,
      category: 'General',
      difficulty: 'Intermediate',
      format: 'workshop',
      price: 125.00,
      rating: 4.7,
      reviews: 234,
      description: 'Understanding and addressing mental health considerations in fitness environments.',
      thumbnail: 'https://via.placeholder.com/300x200/9C27B0/white?text=Mental+Health',
      featured: false,
      tags: ['Mental Health', 'Psychology', 'Client Care'],
      startDate: '2024-09-01',
      enrolledStudents: 456,
    },
    {
      id: '4',
      title: 'Youth Fitness Programming',
      provider: 'ACSM',
      instructor: 'Coach Lisa Chen',
      duration: 60,
      ceuCredits: 1.0,
      category: 'Specialized',
      difficulty: 'Beginner',
      format: 'online',
      price: 45.00,
      rating: 4.6,
      reviews: 167,
      description: 'Safe and effective exercise programming for children and adolescents.',
      thumbnail: 'https://via.placeholder.com/300x200/2196F3/white?text=Youth+Fitness',
      featured: false,
      tags: ['Youth', 'Programming', 'Safety'],
      startDate: '2024-08-30',
      enrolledStudents: 623,
    },
  ];

  // Mock completed courses
  const completedCourses = [
    {
      id: 'c1',
      title: 'Exercise Physiology Fundamentals',
      provider: 'ACSM',
      completedDate: '2024-07-15',
      ceuCredits: 2.5,
      grade: 'A',
      certificateUrl: 'certificate_001.pdf',
    },
    {
      id: 'c2',
      title: 'Injury Prevention Strategies',
      provider: 'NATA',
      completedDate: '2024-06-22',
      ceuCredits: 1.5,
      grade: 'B+',
      certificateUrl: 'certificate_002.pdf',
    },
  ];

  // Mock learning paths
  const learningPaths = [
    {
      id: 'path1',
      title: 'Master Personal Training',
      description: 'Complete pathway to advanced personal training expertise',
      totalCourses: 8,
      completedCourses: 3,
      totalCEUs: 15,
      estimatedTime: '3-4 months',
      difficulty: 'Intermediate to Advanced',
      color: COLORS.primary,
    },
    {
      id: 'path2',
      title: 'Sports Performance Specialist',
      description: 'Specialized training for athletic performance enhancement',
      totalCourses: 6,
      completedCourses: 1,
      totalCEUs: 12,
      estimatedTime: '2-3 months',
      difficulty: 'Advanced',
      color: COLORS.warning,
    },
  ];

  const courseCategories = ['All', 'General', 'Specialized', 'Practical', 'Safety'];
  const courseDifficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];
  const courseFormats = ['All', 'Online', 'Webinar', 'Workshop', 'In-Person'];

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
    ]).start();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'on_track': return COLORS.success;
      case 'behind': return COLORS.warning;
      case 'overdue': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return COLORS.success;
      case 'intermediate': return COLORS.warning;
      case 'advanced': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const getFormatIcon = (format) => {
    switch (format?.toLowerCase()) {
      case 'online': return 'computer';
      case 'webinar': return 'videocam';
      case 'workshop': return 'group';
      case 'in-person': return 'location-on';
      default: return 'school';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleCoursePress = (course) => {
    Vibration.vibrate(30);
    setSelectedCourse(course);
    setShowCourseModal(true);
  };

  const handleQuickAction = (action, item = null) => {
    Vibration.vibrate(30);
    const message = item 
      ? `${action} for ${item.title || item.certification} is under development!`
      : `${action} feature is under development!`;
    
    Alert.alert(
      'Feature Coming Soon',
      `${message} 🚀`,
      [{ text: 'Got it!' }]
    );
  };

  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={{
        paddingTop: StatusBar.currentHeight + SPACING.md,
        paddingBottom: SPACING.lg,
        paddingHorizontal: SPACING.md,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md }}>
        <View>
          <Text style={[TEXT_STYLES.h2, { color: 'white' }]}>
            Continuing Education 📚
          </Text>
          <Text style={[TEXT_STYLES.body2, { color: 'rgba(255,255,255,0.8)' }]}>
            Advance your fitness career
          </Text>
        </View>
        <View style={{ flexDirection: 'row' }}>
          <IconButton
            icon="bookmark"
            size={24}
            iconColor="white"
            onPress={() => handleQuickAction('My Bookmarks')}
          />
          <IconButton
            icon="notifications"
            size={24}
            iconColor="white"
            onPress={() => handleQuickAction('Notifications')}
          />
        </View>
      </View>

      {/* Tab Navigation */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row' }}>
          {[
            { key: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
            { key: 'courses', label: 'Courses', icon: 'school' },
            { key: 'progress', label: 'Progress', icon: 'trending-up' },
            { key: 'calendar', label: 'Calendar', icon: 'event' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={{
                paddingHorizontal: SPACING.md,
                paddingVertical: SPACING.sm,
                marginHorizontal: SPACING.xs,
                backgroundColor: activeTab === tab.key ? 'rgba(255,255,255,0.3)' : 'transparent',
                borderRadius: 20,
                flexDirection: 'row',
                alignItems: 'center',
                minWidth: 100,
                justifyContent: 'center',
              }}
            >
              <Icon
                name={tab.icon}
                size={16}
                color="white"
                style={{ marginRight: SPACING.xs }}
              />
              <Text style={{
                color: 'white',
                fontWeight: activeTab === tab.key ? 'bold' : 'normal',
              }}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );

  const renderDashboard = () => (
    <View style={{ padding: SPACING.md }}>
      {/* CEU Requirements Summary */}
      <Surface style={{
        padding: SPACING.md,
        borderRadius: 12,
        elevation: 3,
        marginBottom: SPACING.md,
      }}>
        <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
          CEU Requirements Overview 📊
        </Text>
        
        {ceuRequirements.map((req) => {
          const progressPercentage = req.completed / req.totalRequired;
          const daysUntilDeadline = Math.ceil((new Date(req.deadline) - new Date()) / (1000 * 60 * 60 * 24));
          
          return (
            <View key={req.id} style={{ marginBottom: SPACING.lg }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm }}>
                <Text style={[TEXT_STYLES.body1, { fontWeight: 'bold', flex: 1 }]} numberOfLines={2}>
                  {req.certification}
                </Text>
                <Chip
                  style={{ backgroundColor: getStatusColor(req.status) }}
                  textStyle={{ color: 'white', fontSize: 10 }}
                >
                  {daysUntilDeadline > 0 ? `${daysUntilDeadline}d left` : 'OVERDUE'}
                </Chip>
              </View>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs }}>
                <Text style={TEXT_STYLES.body2}>
                  Progress: {req.completed}/{req.totalRequired} CEUs
                </Text>
                <Text style={[TEXT_STYLES.body2, { color: req.status === 'behind' ? COLORS.warning : COLORS.success }]}>
                  {req.remaining} remaining
                </Text>
              </View>
              
              <ProgressBar
                progress={progressPercentage}
                color={getStatusColor(req.status)}
                style={{ height: 8, borderRadius: 4, marginBottom: SPACING.sm }}
              />
              
              {/* Category breakdown */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                {Object.entries(req.categories).map(([category, data]) => (
                  <View key={category} style={{ alignItems: 'center' }}>
                    <Text style={TEXT_STYLES.caption}>{category}</Text>
                    <Text style={[TEXT_STYLES.caption, { fontWeight: 'bold' }]}>
                      {data.completed}/{data.required}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })}
      </Surface>

      {/* Learning Paths */}
      <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
        Recommended Learning Paths 🛤️
      </Text>
      
      {learningPaths.map((path) => (
        <TouchableOpacity
          key={path.id}
          onPress={() => handleQuickAction('View Learning Path', path)}
        >
          <Card style={{ marginBottom: SPACING.md, elevation: 2 }}>
            <LinearGradient
              colors={[path.color, `${path.color}80`]}
              style={{ padding: SPACING.md }}
            >
              <Text style={[TEXT_STYLES.body1, { fontWeight: 'bold', color: 'white', marginBottom: SPACING.xs }]}>
                {path.title}
              </Text>
              
              <Text style={[TEXT_STYLES.body2, { color: 'rgba(255,255,255,0.9)', marginBottom: SPACING.sm }]}>
                {path.description}
              </Text>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm }}>
                <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
                  {path.completedCourses}/{path.totalCourses} courses • {path.totalCEUs} CEUs
                </Text>
                <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
                  {path.estimatedTime}
                </Text>
              </View>
              
              <ProgressBar
                progress={path.completedCourses / path.totalCourses}
                color="rgba(255,255,255,0.8)"
                style={{ height: 4, borderRadius: 2 }}
              />
            </LinearGradient>
          </Card>
        </TouchableOpacity>
      ))}

      {/* Recent Activity */}
      <Text style={[TEXT_STYLES.h3, { marginVertical: SPACING.md }]}>
        Recent Activity 📈
      </Text>
      
      <Surface style={{ padding: SPACING.md, borderRadius: 12, elevation: 2 }}>
        {completedCourses.slice(0, 3).map((course) => (
          <View key={course.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
            <Icon name="check-circle" size={24} color={COLORS.success} style={{ marginRight: SPACING.sm }} />
            <View style={{ flex: 1 }}>
              <Text style={[TEXT_STYLES.body1, { fontWeight: 'bold' }]}>{course.title}</Text>
              <Text style={TEXT_STYLES.body2}>
                {course.ceuCredits} CEUs • Grade: {course.grade} • {formatDate(course.completedDate)}
              </Text>
            </View>
            <IconButton
              icon="file-download"
              size={20}
              iconColor={COLORS.primary}
              onPress={() => handleQuickAction('Download Certificate', course)}
            />
          </View>
        ))}
      </Surface>
    </View>
  );

  const renderCourses = () => (
    <View style={{ padding: SPACING.md }}>
      {/* Search Bar */}
      <Searchbar
        placeholder="Search courses..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={{ marginBottom: SPACING.md }}
      />

      {/* Featured Courses */}
      <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
        Featured Courses ⭐
      </Text>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={availableCourses.filter(course => course.featured)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleCoursePress(item)}
            style={{ marginRight: SPACING.md }}
          >
            <Card style={{ width: 280, elevation: 3 }}>
              <View style={{ height: 120, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={[TEXT_STYLES.h3, { color: 'white', textAlign: 'center', paddingHorizontal: SPACING.md }]}>
                  {item.title}
                </Text>
              </View>
              
              <Card.Content style={{ padding: SPACING.md }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs }}>
                  <Avatar.Text
                    size={30}
                    label={item.provider.substring(0, 2)}
                    style={{ marginRight: SPACING.sm, backgroundColor: COLORS.secondary }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[TEXT_STYLES.body2, { fontWeight: 'bold' }]}>{item.provider}</Text>
                    <Text style={TEXT_STYLES.caption}>{item.instructor}</Text>
                  </View>
                </View>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.sm }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon name="schedule" size={16} color={COLORS.textSecondary} />
                    <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs }]}>
                      {item.duration}min
                    </Text>
                  </View>
                  
                  <Chip
                    style={{ backgroundColor: COLORS.success }}
                    textStyle={{ color: 'white', fontSize: 10 }}
                  >
                    {item.ceuCredits} CEUs
                  </Chip>
                  
                  <Text style={[TEXT_STYLES.body1, { fontWeight: 'bold', color: COLORS.primary }]}>
                    ${item.price}
                  </Text>
                </View>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        )}
        style={{ marginBottom: SPACING.lg }}
      />

      {/* All Courses */}
      <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
        All Courses 📖
      </Text>

      {availableCourses.map((course) => (
        <TouchableOpacity
          key={course.id}
          onPress={() => handleCoursePress(course)}
        >
          <Card style={{ marginBottom: SPACING.md, elevation: 2 }}>
            <Card.Content style={{ padding: SPACING.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <View style={{ 
                  width: 60, 
                  height: 60, 
                  backgroundColor: COLORS.primary, 
                  borderRadius: 8, 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  marginRight: SPACING.md 
                }}>
                  <Icon name={getFormatIcon(course.format)} size={24} color="white" />
                </View>
                
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs }}>
                    <Text style={[TEXT_STYLES.body1, { fontWeight: 'bold', flex: 1 }]} numberOfLines={2}>
                      {course.title}
                    </Text>
                    {course.featured && (
                      <Badge style={{ backgroundColor: COLORS.warning, marginLeft: SPACING.sm }}>
                        FEATURED
                      </Badge>
                    )}
                  </View>
                  
                  <Text style={TEXT_STYLES.body2} numberOfLines={1}>
                    {course.provider} • {course.instructor}
                  </Text>
                  
                  <Text style={[TEXT_STYLES.caption, { marginTop: SPACING.xs }]} numberOfLines={2}>
                    {course.description}
                  </Text>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.sm, alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Icon name="star" size={14} color={COLORS.warning} />
                      <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs }]}>
                        {course.rating} ({course.reviews})
                      </Text>
                    </View>
                    
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Chip
                        style={{ backgroundColor: getDifficultyColor(course.difficulty), marginRight: SPACING.sm }}
                        textStyle={{ color: 'white', fontSize: 10 }}
                      >
                        {course.difficulty}
                      </Chip>
                      
                      <Text style={[TEXT_STYLES.body1, { fontWeight: 'bold', color: COLORS.primary }]}>
                        ${course.price}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </Card.Content>
          </Card>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderProgress = () => (
    <View style={{ padding: SPACING.md }}>
      {/* Overall Progress */}
      <Surface style={{
        padding: SPACING.md,
        borderRadius: 12,
        elevation: 3,
        marginBottom: SPACING.md,
      }}>
        <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
          Learning Progress 📈
        </Text>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: SPACING.md }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={[TEXT_STYLES.h2, { color: COLORS.primary }]}>
              {completedCourses.length}
            </Text>
            <Text style={TEXT_STYLES.caption}>Completed</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={[TEXT_STYLES.h2, { color: COLORS.success }]}>
              {completedCourses.reduce((sum, course) => sum + course.ceuCredits, 0)}
            </Text>
            <Text style={TEXT_STYLES.caption}>CEUs Earned</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={[TEXT_STYLES.h2, { color: COLORS.warning }]}>
              2
            </Text>
            <Text style={TEXT_STYLES.caption}>In Progress</Text>
          </View>
        </View>
      </Surface>

      {/* Completed Courses */}
      <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
        Completed Courses 🎓
      </Text>

      {completedCourses.map((course) => (
        <Card key={course.id} style={{ marginBottom: SPACING.md, elevation: 2 }}>
          <Card.Content style={{ padding: SPACING.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <Text style={[TEXT_STYLES.body1, { fontWeight: 'bold' }]}>
                  {course.title}
                </Text>
                <Text style={TEXT_STYLES.body2}>
                  {course.provider}
                </Text>
                <Text style={[TEXT_STYLES.caption, { marginTop: SPACING.xs }]}>
                  Completed: {formatDate(course.completedDate)}
                </Text>
              </View>
              
              <View style={{ alignItems: 'flex-end' }}>
                <Chip
                  style={{ backgroundColor: COLORS.success, marginBottom: SPACING.xs }}
                  textStyle={{ color: 'white' }}
                >
                  Grade: {course.grade}
                </Chip>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.primary, fontWeight: 'bold' }]}>
                  {course.ceuCredits} CEUs
                </Text>
              </View>
            </View>
            
            <Divider style={{ marginVertical: SPACING.sm }} />
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Button
                mode="outlined"
                onPress={() => handleQuickAction('View Certificate', course)}
                icon="file-download"
                compact
              >
                Certificate
              </Button>
              <Button
                mode="text"
                onPress={() => handleQuickAction('Share Achievement', course)}
                icon="share"
                compact
              >
                Share
              </Button>
            </View>
          </Card.Content>
        </Card>
      ))}
    </View>
  );

  const renderCalendar = () => (
    <View style={{ padding: SPACING.md }}>
      {/* Upcoming Deadlines */}
      <Surface style={{
        padding: SPACING.md,
        borderRadius: 12,
        elevation: 3,
        marginBottom: SPACING.md,
      }}>
        <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
          Upcoming Deadlines ⏰
        </Text>
        
        {ceuRequirements.map((req) => {
          const daysUntilDeadline = Math.ceil((new Date(req.deadline) - new Date()) / (1000 * 60 * 60 * 24));
          
          return (
            <TouchableOpacity
              key={req.id}
              onPress={() => handleQuickAction('View Requirement Details', req)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: SPACING.sm,
                borderBottomWidth: 1,
                borderBottomColor: COLORS.background,
              }}
            >
              <View style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: getStatusColor(req.status),
                marginRight: SPACING.md,
              }} />
              
              <View style={{ flex: 1 }}>
                <Text style={[TEXT_STYLES.body1, { fontWeight: 'bold' }]} numberOfLines={1}>
                  {req.certification}
                </Text>
                <Text style={TEXT_STYLES.body2}>
                  Due: {formatDate(req.deadline)}
                </Text>
              </View>
              
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[
                  TEXT_STYLES.body1, 
                  { 
                    fontWeight: 'bold', 
                    color: daysUntilDeadline <= 30 ? COLORS.error : COLORS.textSecondary 
                  }
                ]}>
                  {daysUntilDeadline > 0 ? `${daysUntilDeadline} days` : 'OVERDUE'}
                </Text>
                <Text style={TEXT_STYLES.caption}>
                  {req.remaining} CEUs left
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </Surface>

      {/* Upcoming Courses */}
      <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
        Upcoming Courses 📅
      </Text>

      {availableCourses
        .filter(course => new Date(course.startDate) >= new Date())
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
        .slice(0, 5)
        .map((course) => (
          <TouchableOpacity
            key={course.id}
            onPress={() => handleCoursePress(course)}
          >
            <Card style={{ marginBottom: SPACING.md, elevation: 2 }}>
              <Card.Content style={{ padding: SPACING.md }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
                  <Icon 
                    name={getFormatIcon(course.format)} 
                    size={24} 
                    color={COLORS.primary} 
                    style={{ marginRight: SPACING.md }}
                  />
                  
                  <View style={{ flex: 1 }}>
                    <Text style={[TEXT_STYLES.body1, { fontWeight: 'bold' }]} numberOfLines={1}>
                      {course.title}
                    </Text>
                    <Text style={TEXT_STYLES.body2}>
                      {course.provider} • {course.instructor}
                    </Text>
                  </View>
                  
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[TEXT_STYLES.body2, { fontWeight: 'bold', color: COLORS.primary }]}>
                      {formatDate(course.startDate)}
                    </Text>
                    <Text style={TEXT_STYLES.caption}>
                      {course.duration}min
                    </Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Chip
                      style={{ backgroundColor: COLORS.success, marginRight: SPACING.sm }}
                      textStyle={{ color: 'white', fontSize: 10 }}
                    >
                      {course.ceuCredits} CEUs
                    </Chip>
                    <Chip
                      style={{ backgroundColor: getDifficultyColor(course.difficulty) }}
                      textStyle={{ color: 'white', fontSize: 10 }}
                    >
                      {course.difficulty}
                    </Chip>
                  </View>
                  
                  <Text style={[TEXT_STYLES.body1, { fontWeight: 'bold', color: COLORS.primary }]}>
                    ${course.price}
                  </Text>
                </View>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        ))}

      {/* Monthly CEU Goal */}
      <Surface style={{
        padding: SPACING.md,
        borderRadius: 12,
        elevation: 3,
        marginTop: SPACING.md,
      }}>
        <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
          Monthly CEU Goal 🎯
        </Text>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm }}>
          <Text style={TEXT_STYLES.body1}>August 2024 Progress</Text>
          <Text style={TEXT_STYLES.body1}>3.5 / 5.0 CEUs</Text>
        </View>
        
        <ProgressBar
          progress={0.7}
          color={COLORS.success}
          style={{ height: 8, borderRadius: 4, marginBottom: SPACING.sm }}
        />
        
        <Text style={[TEXT_STYLES.caption, { textAlign: 'center', color: COLORS.success }]}>
          Great progress! You're on track to meet your monthly goal! 🌟
        </Text>
      </Surface>
    </View>
  );

  const renderCourseModal = () => (
    <Portal>
      <Modal
        visible={showCourseModal}
        onDismiss={() => setShowCourseModal(false)}
        contentContainerStyle={{
          backgroundColor: COLORS.surface,
          margin: SPACING.md,
          borderRadius: 12,
          maxHeight: '85%',
        }}
      >
        {selectedCourse && (
          <ScrollView>
            <View style={{ padding: SPACING.lg }}>
              {/* Course Header */}
              <View style={{ marginBottom: SPACING.md }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
                  <View style={{ 
                    width: 60, 
                    height: 60, 
                    backgroundColor: COLORS.primary, 
                    borderRadius: 8, 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    marginRight: SPACING.md 
                  }}>
                    <Icon name={getFormatIcon(selectedCourse.format)} size={28} color="white" />
                  </View>
                  
                  <View style={{ flex: 1 }}>
                    <Text style={TEXT_STYLES.h3} numberOfLines={2}>
                      {selectedCourse.title}
                    </Text>
                    <Text style={TEXT_STYLES.body2}>
                      {selectedCourse.provider}
                    </Text>
                  </View>
                </View>
                
                {selectedCourse.featured && (
                  <Badge style={{ backgroundColor: COLORS.warning, alignSelf: 'flex-start' }}>
                    FEATURED COURSE
                  </Badge>
                )}
              </View>

              <Divider style={{ marginVertical: SPACING.md }} />

              {/* Course Details */}
              <View style={{ marginBottom: SPACING.md }}>
                <Text style={[TEXT_STYLES.body1, { marginBottom: SPACING.sm }]}>
                  {selectedCourse.description}
                </Text>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.md }}>
                  {selectedCourse.tags.map((tag) => (
                    <Chip
                      key={tag}
                      style={{ 
                        backgroundColor: COLORS.background, 
                        margin: 2 
                      }}
                      textStyle={{ fontSize: 10 }}
                    >
                      {tag}
                    </Chip>
                  ))}
                </View>
              </View>

              {/* Course Info Grid */}
              <View style={{ 
                flexDirection: 'row', 
                flexWrap: 'wrap', 
                marginBottom: SPACING.md,
                backgroundColor: COLORS.background,
                padding: SPACING.md,
                borderRadius: 8,
              }}>
                <View style={{ width: '50%', marginBottom: SPACING.sm }}>
                  <Text style={[TEXT_STYLES.caption, { fontWeight: 'bold' }]}>Instructor</Text>
                  <Text style={TEXT_STYLES.body2}>{selectedCourse.instructor}</Text>
                </View>
                
                <View style={{ width: '50%', marginBottom: SPACING.sm }}>
                  <Text style={[TEXT_STYLES.caption, { fontWeight: 'bold' }]}>Duration</Text>
                  <Text style={TEXT_STYLES.body2}>{selectedCourse.duration} minutes</Text>
                </View>
                
                <View style={{ width: '50%', marginBottom: SPACING.sm }}>
                  <Text style={[TEXT_STYLES.caption, { fontWeight: 'bold' }]}>CEU Credits</Text>
                  <Text style={[TEXT_STYLES.body2, { color: COLORS.success, fontWeight: 'bold' }]}>
                    {selectedCourse.ceuCredits} CEUs
                  </Text>
                </View>
                
                <View style={{ width: '50%', marginBottom: SPACING.sm }}>
                  <Text style={[TEXT_STYLES.caption, { fontWeight: 'bold' }]}>Format</Text>
                  <Text style={TEXT_STYLES.body2}>{selectedCourse.format}</Text>
                </View>
                
                <View style={{ width: '50%', marginBottom: SPACING.sm }}>
                  <Text style={[TEXT_STYLES.caption, { fontWeight: 'bold' }]}>Difficulty</Text>
                  <Chip
                    style={{ backgroundColor: getDifficultyColor(selectedCourse.difficulty), alignSelf: 'flex-start' }}
                    textStyle={{ color: 'white', fontSize: 10 }}
                  >
                    {selectedCourse.difficulty}
                  </Chip>
                </View>
                
                <View style={{ width: '50%', marginBottom: SPACING.sm }}>
                  <Text style={[TEXT_STYLES.caption, { fontWeight: 'bold' }]}>Start Date</Text>
                  <Text style={TEXT_STYLES.body2}>{formatDate(selectedCourse.startDate)}</Text>
                </View>
              </View>

              {/* Rating and Reviews */}
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: SPACING.md,
                padding: SPACING.md,
                backgroundColor: COLORS.background,
                borderRadius: 8,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon name="star" size={20} color={COLORS.warning} />
                  <Text style={[TEXT_STYLES.body1, { marginLeft: SPACING.xs, fontWeight: 'bold' }]}>
                    {selectedCourse.rating}
                  </Text>
                  <Text style={[TEXT_STYLES.body2, { marginLeft: SPACING.xs }]}>
                    ({selectedCourse.reviews} reviews)
                  </Text>
                </View>
                
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[TEXT_STYLES.caption]}>
                    {selectedCourse.enrolledStudents} students enrolled
                  </Text>
                </View>
              </View>

              {/* Price */}
              <View style={{ 
                alignItems: 'center', 
                marginBottom: SPACING.lg,
                padding: SPACING.md,
                backgroundColor: COLORS.primary,
                borderRadius: 8,
              }}>
                <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
                  Course Price
                </Text>
                <Text style={[TEXT_STYLES.h2, { color: 'white', fontWeight: 'bold' }]}>
                  ${selectedCourse.price}
                </Text>
              </View>

              {/* Action Buttons */}
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
                flexWrap: 'wrap',
              }}>
                <Button
                  mode="contained"
                  onPress={() => {
                    setShowCourseModal(false);
                    handleQuickAction('Enroll in Course', selectedCourse);
                  }}
                  buttonColor={COLORS.success}
                  icon="school"
                  style={{ marginBottom: SPACING.sm, minWidth: 120 }}
                >
                  Enroll Now
                </Button>
                
                <Button
                  mode="outlined"
                  onPress={() => {
                    setShowCourseModal(false);
                    handleQuickAction('Save Course', selectedCourse);
                  }}
                  icon="bookmark-outline"
                  style={{ marginBottom: SPACING.sm, minWidth: 120 }}
                >
                  Save for Later
                </Button>
                
                <Button
                  mode="text"
                  onPress={() => {
                    setShowCourseModal(false);
                    handleQuickAction('Share Course', selectedCourse);
                  }}
                  icon="share"
                  style={{ minWidth: 120 }}
                >
                  Share
                </Button>
              </View>
            </View>
          </ScrollView>
        )}
      </Modal>
    </Portal>
  );

  const renderAddCeuModal = () => (
    <Portal>
      <Modal
        visible={showAddCeuModal}
        onDismiss={() => setShowAddCeuModal(false)}
        contentContainerStyle={{
          backgroundColor: COLORS.surface,
          margin: SPACING.md,
          borderRadius: 12,
          padding: SPACING.lg,
        }}
      >
        <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md, textAlign: 'center' }]}>
          Add CEU Credits
        </Text>
        
        <Text style={[TEXT_STYLES.body1, { textAlign: 'center', color: COLORS.textSecondary, marginBottom: SPACING.lg }]}>
          Record CEU credits from completed courses or activities
        </Text>

        <View style={{ alignItems: 'center' }}>
          <Icon name="add-circle-outline" size={80} color={COLORS.primary} style={{ marginBottom: SPACING.md }} />
          
          <Button
            mode="contained"
            onPress={() => {
              setShowAddCeuModal(false);
              handleQuickAction('Manual CEU Entry');
            }}
            buttonColor={COLORS.primary}
            icon="edit"
            style={{ marginBottom: SPACING.sm }}
          >
            Manual Entry
          </Button>
          
          <Button
            mode="outlined"
            onPress={() => {
              setShowAddCeuModal(false);
              handleQuickAction('Upload Certificate');
            }}
            icon="file-upload"
            style={{ marginBottom: SPACING.sm }}
          >
            Upload Certificate
          </Button>
          
          <Button
            mode="text"
            onPress={() => setShowAddCeuModal(false)}
          >
            Cancel
          </Button>
        </View>
      </Modal>
    </Portal>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'courses':
        return renderCourses();
      case 'progress':
        return renderProgress();
      case 'calendar':
        return renderCalendar();
      default:
        return renderDashboard();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          flex: 1,
        }}
      >
        {renderHeader()}
        
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
        >
          {renderTabContent()}
          
          {/* Bottom spacing for FAB */}
          <View style={{ height: 80 }} />
        </ScrollView>
      </Animated.View>

      {renderCourseModal()}
      {renderAddCeuModal()}

      <FAB
        icon={activeTab === 'courses' ? 'search' : 'add'}
        style={{
          position: 'absolute',
          margin: SPACING.md,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.primary,
        }}
        onPress={() => {
          if (activeTab === 'courses') {
            handleQuickAction('Advanced Course Search');
          } else {
            setShowAddCeuModal(true);
          }
        }}
      />
    </View>
  );
};

export default ContinuingEducation;