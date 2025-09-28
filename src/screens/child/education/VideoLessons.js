import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Animated,
  RefreshControl,
  StatusBar,
  Alert,
  Dimensions,
  Vibration,
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
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from 'expo-blur';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const VideoLessons = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, videoLessons, progress, achievements } = useSelector(state => ({
    user: state.auth.user,
    videoLessons: state.learning.videoLessons,
    progress: state.learning.progress,
    achievements: state.gamification.achievements,
  }));

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [completedLessons, setCompletedLessons] = useState(new Set());

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // Mock data for video lessons
  const mockVideoLessons = [
    {
      id: '1',
      title: '⚽ Basic Ball Control',
      description: 'Learn fundamental ball control techniques',
      duration: '8:30',
      difficulty: 'Beginner',
      category: 'football',
      thumbnail: 'https://example.com/thumb1.jpg',
      videoUrl: 'https://example.com/video1.mp4',
      points: 50,
      completed: false,
      rating: 4.8,
      enrolledStudents: 1250,
      skills: ['Ball Control', 'First Touch', 'Coordination'],
    },
    {
      id: '2',
      title: '🏀 Dribbling Mastery',
      description: 'Master advanced dribbling techniques',
      duration: '12:15',
      difficulty: 'Intermediate',
      category: 'basketball',
      thumbnail: 'https://example.com/thumb2.jpg',
      videoUrl: 'https://example.com/video2.mp4',
      points: 75,
      completed: true,
      rating: 4.9,
      enrolledStudents: 890,
      skills: ['Crossover', 'Behind Back', 'Speed'],
    },
    {
      id: '3',
      title: '🎾 Perfect Serve Technique',
      description: 'Develop a powerful and accurate serve',
      duration: '10:45',
      difficulty: 'Advanced',
      category: 'tennis',
      thumbnail: 'https://example.com/thumb3.jpg',
      videoUrl: 'https://example.com/video3.mp4',
      points: 100,
      completed: false,
      rating: 4.7,
      enrolledStudents: 567,
      skills: ['Power', 'Accuracy', 'Spin'],
    },
    {
      id: '4',
      title: '🏊‍♀️ Swimming Strokes',
      description: 'Perfect your freestyle swimming technique',
      duration: '15:20',
      difficulty: 'Beginner',
      category: 'swimming',
      thumbnail: 'https://example.com/thumb4.jpg',
      videoUrl: 'https://example.com/video4.mp4',
      points: 60,
      completed: false,
      rating: 4.6,
      enrolledStudents: 723,
      skills: ['Breathing', 'Stroke Form', 'Endurance'],
    },
  ];

  const categories = [
    { id: 'all', name: 'All Sports', icon: 'sports' },
    { id: 'football', name: 'Football', icon: 'sports-soccer' },
    { id: 'basketball', name: 'Basketball', icon: 'sports-basketball' },
    { id: 'tennis', name: 'Tennis', icon: 'sports-tennis' },
    { id: 'swimming', name: 'Swimming', icon: 'pool' },
  ];

  // Initialize animations
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
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  // Filter lessons based on search and category
  const filteredLessons = mockVideoLessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lesson.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || lesson.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle lesson selection
  const handleLessonPress = (lesson) => {
    Vibration.vibrate(50);
    setSelectedLesson(lesson);
    setShowLessonModal(true);
  };

  // Handle lesson start
  const handleStartLesson = (lesson) => {
    Alert.alert(
      "🎬 Start Video Lesson",
      `Ready to start "${lesson.title}"? You'll earn ${lesson.points} points upon completion!`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Start Learning! 🚀",
          onPress: () => {
            // Navigate to video player or update state
            setShowLessonModal(false);
            Alert.alert("Feature Coming Soon", "Video player integration is under development! 🎥");
          }
        }
      ]
    );
  };

  // Handle lesson completion
  const handleCompleteLesson = (lessonId) => {
    setCompletedLessons(prev => new Set([...prev, lessonId]));
    Vibration.vibrate([100, 50, 100]);
    Alert.alert("🎉 Lesson Complete!", "Great job! You've earned points and unlocked new achievements!");
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return COLORS.success;
      case 'Intermediate': return COLORS.primary;
      case 'Advanced': return COLORS.error;
      default: return COLORS.secondary;
    }
  };

  // Render lesson card
  const renderLessonCard = (lesson, index) => {
    const isCompleted = lesson.completed || completedLessons.has(lesson.id);
    
    return (
      <Animated.View
        key={lesson.id}
        style={{
          transform: [{ scale: scaleAnim }],
          opacity: fadeAnim,
        }}
      >
        <TouchableOpacity
          onPress={() => handleLessonPress(lesson)}
          activeOpacity={0.8}
        >
          <Card style={{
            margin: SPACING.medium,
            marginBottom: SPACING.small,
            elevation: 6,
            borderRadius: 16,
            overflow: 'hidden',
          }}>
            <LinearGradient
              colors={isCompleted ? ['#4CAF50', '#81C784'] : ['#667eea', '#764ba2']}
              style={{ height: 120, position: 'relative' }}
            >
              {isCompleted && (
                <View style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  borderRadius: 20,
                  padding: 5,
                }}>
                  <Icon name="check-circle" size={20} color={COLORS.success} />
                </View>
              )}
              
              <View style={{
                position: 'absolute',
                bottom: 10,
                left: 15,
                right: 15,
              }}>
                <Text style={[TEXT_STYLES.h3, { color: 'white', marginBottom: 5 }]}>
                  {lesson.title}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon name="access-time" size={16} color="white" />
                  <Text style={[TEXT_STYLES.caption, { color: 'white', marginLeft: 5 }]}>
                    {lesson.duration}
                  </Text>
                  <View style={{
                    backgroundColor: getDifficultyColor(lesson.difficulty),
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 10,
                    marginLeft: 10,
                  }}>
                    <Text style={[TEXT_STYLES.caption, { color: 'white', fontWeight: 'bold' }]}>
                      {lesson.difficulty}
                    </Text>
                  </View>
                </View>
              </View>
            </LinearGradient>

            <Card.Content style={{ padding: SPACING.medium }}>
              <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.small }]}>
                {lesson.description}
              </Text>
              
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.small }}>
                <Icon name="star" size={16} color="#FFD700" />
                <Text style={[TEXT_STYLES.caption, { marginLeft: 4 }]}>
                  {lesson.rating} • {lesson.enrolledStudents} students
                </Text>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row' }}>
                  {lesson.skills.map((skill, skillIndex) => (
                    <Chip
                      key={skillIndex}
                      style={{
                        marginRight: SPACING.small,
                        backgroundColor: COLORS.background,
                      }}
                      textStyle={{ fontSize: 12 }}
                    >
                      {skill}
                    </Chip>
                  ))}
                </View>
              </ScrollView>

              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: SPACING.medium,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon name="stars" size={16} color={COLORS.primary} />
                  <Text style={[TEXT_STYLES.caption, { marginLeft: 4, color: COLORS.primary }]}>
                    +{lesson.points} points
                  </Text>
                </View>
                
                <IconButton
                  icon={isCompleted ? "replay" : "play-arrow"}
                  size={24}
                  iconColor={isCompleted ? COLORS.success : COLORS.primary}
                  style={{
                    backgroundColor: isCompleted ? 
                      'rgba(76, 175, 80, 0.1)' : 
                      'rgba(102, 126, 234, 0.1)'
                  }}
                />
              </View>
            </Card.Content>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Render category filter
  const renderCategoryFilter = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginVertical: SPACING.medium }}
      contentContainerStyle={{ paddingHorizontal: SPACING.medium }}
    >
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          onPress={() => {
            setSelectedCategory(category.id);
            Vibration.vibrate(30);
          }}
          style={{
            marginRight: SPACING.small,
          }}
        >
          <Surface
            style={{
              padding: SPACING.medium,
              borderRadius: 20,
              backgroundColor: selectedCategory === category.id ? 
                COLORS.primary : 
                COLORS.background,
              elevation: selectedCategory === category.id ? 4 : 2,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Icon
              name={category.icon}
              size={20}
              color={selectedCategory === category.id ? 'white' : COLORS.primary}
            />
            <Text
              style={[
                TEXT_STYLES.body,
                {
                  marginLeft: SPACING.small,
                  color: selectedCategory === category.id ? 'white' : COLORS.primary,
                  fontWeight: selectedCategory === category.id ? 'bold' : 'normal',
                }
              ]}
            >
              {category.name}
            </Text>
          </Surface>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  // Render progress summary
  const renderProgressSummary = () => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <Card style={{
        margin: SPACING.medium,
        marginBottom: SPACING.small,
        elevation: 4,
        borderRadius: 16,
      }}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={{ borderRadius: 16 }}
        >
          <Card.Content style={{ padding: SPACING.large }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={[TEXT_STYLES.h2, { color: 'white' }]}>
                  Welcome back, {user?.firstName || 'Athlete'}! 👋
                </Text>
                <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.8)', marginTop: 4 }]}>
                  Ready to learn something new today?
                </Text>
              </View>
              <Avatar.Icon
                size={48}
                icon="school"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              />
            </View>
            
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              marginTop: SPACING.large,
            }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>12</Text>
                <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
                  Completed
                </Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>850</Text>
                <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
                  Points Earned
                </Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>7</Text>
                <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
                  Day Streak 🔥
                </Text>
              </View>
            </View>
          </Card.Content>
        </LinearGradient>
      </Card>
    </Animated.View>
  );

  // Render lesson detail modal
  const renderLessonModal = () => (
    <Portal>
      <Modal
        visible={showLessonModal}
        onDismiss={() => setShowLessonModal(false)}
        contentContainerStyle={{
          backgroundColor: 'white',
          margin: SPACING.large,
          borderRadius: 20,
          maxHeight: height * 0.8,
        }}
      >
        {selectedLesson && (
          <ScrollView>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={{
                height: 200,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                position: 'relative',
              }}
            >
              <IconButton
                icon="close"
                size={24}
                iconColor="white"
                style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  backgroundColor: 'rgba(0,0,0,0.3)',
                }}
                onPress={() => setShowLessonModal(false)}
              />
              
              <View style={{
                position: 'absolute',
                bottom: 20,
                left: 20,
                right: 20,
              }}>
                <Text style={[TEXT_STYLES.h2, { color: 'white' }]}>
                  {selectedLesson.title}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                  <Icon name="access-time" size={16} color="white" />
                  <Text style={[TEXT_STYLES.caption, { color: 'white', marginLeft: 5 }]}>
                    {selectedLesson.duration}
                  </Text>
                  <View style={{
                    backgroundColor: getDifficultyColor(selectedLesson.difficulty),
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 10,
                    marginLeft: 10,
                  }}>
                    <Text style={[TEXT_STYLES.caption, { color: 'white', fontWeight: 'bold' }]}>
                      {selectedLesson.difficulty}
                    </Text>
                  </View>
                </View>
              </View>
            </LinearGradient>

            <View style={{ padding: SPACING.large }}>
              <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.medium }]}>
                About This Lesson
              </Text>
              <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.large, lineHeight: 24 }]}>
                {selectedLesson.description}
              </Text>

              <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.medium }]}>
                Skills You'll Learn
              </Text>
              <View style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                marginBottom: SPACING.large,
              }}>
                {selectedLesson.skills.map((skill, index) => (
                  <Chip
                    key={index}
                    style={{
                      margin: 4,
                      backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    }}
                    textStyle={{ color: COLORS.primary }}
                  >
                    {skill}
                  </Chip>
                ))}
              </View>

              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: SPACING.large,
              }}>
                <View>
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.secondary }]}>
                    Reward Points
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon name="stars" size={20} color={COLORS.primary} />
                    <Text style={[TEXT_STYLES.h3, { marginLeft: 4, color: COLORS.primary }]}>
                      {selectedLesson.points}
                    </Text>
                  </View>
                </View>
                
                <View>
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.secondary }]}>
                    Rating
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon name="star" size={20} color="#FFD700" />
                    <Text style={[TEXT_STYLES.h3, { marginLeft: 4 }]}>
                      {selectedLesson.rating}
                    </Text>
                  </View>
                </View>
              </View>

              <Button
                mode="contained"
                onPress={() => handleStartLesson(selectedLesson)}
                style={{
                  backgroundColor: COLORS.primary,
                  borderRadius: 12,
                  paddingVertical: 8,
                }}
                contentStyle={{ paddingVertical: 8 }}
                labelStyle={[TEXT_STYLES.button, { color: 'white' }]}
              >
                {selectedLesson.completed ? '🔄 Watch Again' : '🚀 Start Learning'}
              </Button>
            </View>
          </ScrollView>
        )}
      </Modal>
    </Portal>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {renderProgressSummary()}

        {/* Search Bar */}
        <View style={{ paddingHorizontal: SPACING.medium, marginBottom: SPACING.small }}>
          <Searchbar
            placeholder="Search video lessons..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={{
              backgroundColor: 'white',
              borderRadius: 12,
              elevation: 2,
            }}
            inputStyle={TEXT_STYLES.body}
            iconColor={COLORS.primary}
          />
        </View>

        {/* Category Filter */}
        {renderCategoryFilter()}

        {/* Lessons Header */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: SPACING.medium,
          marginBottom: SPACING.small,
        }}>
          <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>
            🎬 Video Lessons ({filteredLessons.length})
          </Text>
          <IconButton
            icon="filter-list"
            size={24}
            iconColor={COLORS.primary}
            onPress={() => setShowFilterModal(true)}
          />
        </View>

        {/* Video Lessons */}
        {filteredLessons.length > 0 ? (
          filteredLessons.map((lesson, index) => renderLessonCard(lesson, index))
        ) : (
          <Card style={{
            margin: SPACING.medium,
            padding: SPACING.large,
            alignItems: 'center',
          }}>
            <Icon name="video-library" size={64} color={COLORS.secondary} />
            <Text style={[TEXT_STYLES.h3, { marginTop: SPACING.medium, textAlign: 'center' }]}>
              No lessons found
            </Text>
            <Text style={[TEXT_STYLES.body, { textAlign: 'center', color: COLORS.secondary }]}>
              Try adjusting your search or category filter
            </Text>
          </Card>
        )}

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="bookmark"
        label="My Bookmarks"
        style={{
          position: 'absolute',
          right: SPACING.medium,
          bottom: SPACING.large,
          backgroundColor: COLORS.primary,
        }}
        onPress={() => Alert.alert("Feature Coming Soon", "Bookmark functionality is under development! 📚")}
      />

      {/* Lesson Detail Modal */}
      {renderLessonModal()}
    </View>
  );
};

export default VideoLessons;