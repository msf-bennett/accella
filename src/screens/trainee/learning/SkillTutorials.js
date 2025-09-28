import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Animated,
  Vibration,
  StatusBar,
  Dimensions,
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
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const SkillTutorialsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [bookmarkedTutorials, setBookmarkedTutorials] = useState([]);
  const [completedTutorials, setCompletedTutorials] = useState([1, 3, 8]);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;

  const categories = [
    { key: 'all', label: 'All Skills', icon: 'fitness-center', count: 24 },
    { key: 'strength', label: 'Strength', icon: 'fitness-center', count: 8 },
    { key: 'cardio', label: 'Cardio', icon: 'directions-run', count: 6 },
    { key: 'flexibility', label: 'Flexibility', icon: 'self-improvement', count: 5 },
    { key: 'technique', label: 'Technique', icon: 'sports', count: 5 }
  ];

  const difficulties = [
    { key: 'all', label: 'All Levels' },
    { key: 'beginner', label: 'Beginner' },
    { key: 'intermediate', label: 'Intermediate' },
    { key: 'advanced', label: 'Advanced' }
  ];

  const [tutorials] = useState([
    {
      id: 1,
      title: 'Perfect Push-Up Form 💪',
      description: 'Master the fundamental push-up with proper form and technique',
      category: 'strength',
      difficulty: 'beginner',
      duration: '8:30',
      views: 1250,
      rating: 4.8,
      instructor: 'Sarah Johnson',
      instructorAvatar: 'https://example.com/avatar1.jpg',
      thumbnail: 'https://example.com/pushup-thumb.jpg',
      videoUrl: 'https://example.com/pushup-video.mp4',
      skills: ['Upper Body', 'Core Stability', 'Body Alignment'],
      equipment: ['None Required'],
      steps: [
        'Start in plank position with hands shoulder-width apart',
        'Keep your body in a straight line from head to heels',
        'Lower chest to the ground while maintaining form',
        'Push back up to starting position'
      ],
      tips: [
        'Keep your core engaged throughout the movement',
        'Don\'t let your hips sag or pike up',
        'Control the descent - don\'t just drop down'
      ],
      progressionExercises: [
        'Wall Push-ups',
        'Incline Push-ups',
        'Knee Push-ups',
        'Full Push-ups'
      ]
    },
    {
      id: 2,
      title: 'Squat Mechanics & Form 🦵',
      description: 'Learn the foundation of lower body strength training',
      category: 'strength',
      difficulty: 'beginner',
      duration: '12:15',
      views: 2100,
      rating: 4.9,
      instructor: 'Mike Rodriguez',
      instructorAvatar: 'https://example.com/avatar2.jpg',
      thumbnail: 'https://example.com/squat-thumb.jpg',
      videoUrl: 'https://example.com/squat-video.mp4',
      skills: ['Lower Body', 'Hip Mobility', 'Balance'],
      equipment: ['None Required'],
      steps: [
        'Stand with feet shoulder-width apart',
        'Lower hips back and down as if sitting in a chair',
        'Keep chest up and knees tracking over toes',
        'Return to standing position'
      ]
    },
    {
      id: 3,
      title: 'Plank Progressions 🏋️',
      description: 'Build core strength with progressive plank variations',
      category: 'strength',
      difficulty: 'intermediate',
      duration: '15:45',
      views: 890,
      rating: 4.7,
      instructor: 'Emma Chen',
      instructorAvatar: 'https://example.com/avatar3.jpg',
      thumbnail: 'https://example.com/plank-thumb.jpg',
      videoUrl: 'https://example.com/plank-video.mp4',
      skills: ['Core Strength', 'Stability', 'Endurance'],
      equipment: ['Yoga Mat']
    },
    {
      id: 4,
      title: 'HIIT Cardio Fundamentals 🔥',
      description: 'High-intensity interval training for maximum results',
      category: 'cardio',
      difficulty: 'intermediate',
      duration: '20:00',
      views: 3200,
      rating: 4.6,
      instructor: 'David Park',
      instructorAvatar: 'https://example.com/avatar4.jpg',
      thumbnail: 'https://example.com/hiit-thumb.jpg',
      videoUrl: 'https://example.com/hiit-video.mp4',
      skills: ['Cardiovascular Endurance', 'Metabolic Conditioning'],
      equipment: ['Timer', 'Water Bottle']
    },
    {
      id: 5,
      title: 'Dynamic Stretching Routine 🤸',
      description: 'Prepare your body with dynamic warm-up movements',
      category: 'flexibility',
      difficulty: 'beginner',
      duration: '10:30',
      views: 1800,
      rating: 4.5,
      instructor: 'Lisa Thompson',
      instructorAvatar: 'https://example.com/avatar5.jpg',
      thumbnail: 'https://example.com/stretch-thumb.jpg',
      videoUrl: 'https://example.com/stretch-video.mp4',
      skills: ['Mobility', 'Flexibility', 'Movement Preparation'],
      equipment: ['None Required']
    },
    {
      id: 6,
      title: 'Deadlift Technique Mastery 🏋️‍♂️',
      description: 'Master the king of all exercises with perfect form',
      category: 'strength',
      difficulty: 'advanced',
      duration: '18:20',
      views: 950,
      rating: 4.9,
      instructor: 'Alex Morrison',
      instructorAvatar: 'https://example.com/avatar6.jpg',
      thumbnail: 'https://example.com/deadlift-thumb.jpg',
      videoUrl: 'https://example.com/deadlift-video.mp4',
      skills: ['Posterior Chain', 'Hip Hinge', 'Full Body Power'],
      equipment: ['Barbell', 'Weight Plates']
    },
    {
      id: 7,
      title: 'Yoga Flow for Athletes 🧘‍♀️',
      description: 'Improve flexibility and mental focus with yoga',
      category: 'flexibility',
      difficulty: 'intermediate',
      duration: '25:00',
      views: 1400,
      rating: 4.8,
      instructor: 'Rachel Green',
      instructorAvatar: 'https://example.com/avatar7.jpg',
      thumbnail: 'https://example.com/yoga-thumb.jpg',
      videoUrl: 'https://example.com/yoga-video.mp4',
      skills: ['Flexibility', 'Balance', 'Mind-Body Connection'],
      equipment: ['Yoga Mat', 'Yoga Block']
    },
    {
      id: 8,
      title: 'Olympic Lifting Basics 🥇',
      description: 'Introduction to clean and jerk fundamentals',
      category: 'technique',
      difficulty: 'advanced',
      duration: '30:15',
      views: 650,
      rating: 4.7,
      instructor: 'Tom Anderson',
      instructorAvatar: 'https://example.com/avatar8.jpg',
      thumbnail: 'https://example.com/olympic-thumb.jpg',
      videoUrl: 'https://example.com/olympic-video.mp4',
      skills: ['Power Development', 'Coordination', 'Technical Precision'],
      equipment: ['Olympic Barbell', 'Bumper Plates', 'Lifting Platform']
    }
  ]);

  const [userProgress] = useState({
    totalCompleted: 3,
    totalWatched: 8,
    skillPoints: 450,
    currentStreak: 5,
    favoriteCategory: 'strength'
  });

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
    ]).start();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const filteredTutorials = tutorials.filter(tutorial => {
    const matchesSearch = tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tutorial.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tutorial.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tutorial.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || tutorial.difficulty === selectedDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const toggleBookmark = (tutorialId) => {
    Vibration.vibrate(50);
    setBookmarkedTutorials(prev => 
      prev.includes(tutorialId)
        ? prev.filter(id => id !== tutorialId)
        : [...prev, tutorialId]
    );
  };

  const startTutorial = (tutorial) => {
    Alert.alert(
      `Start Tutorial: ${tutorial.title}`,
      `Duration: ${tutorial.duration}\nInstructor: ${tutorial.instructor}\n\nReady to begin your learning journey?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Watch Later', onPress: () => toggleBookmark(tutorial.id) },
        { text: 'Start Now', onPress: () => playTutorial(tutorial) }
      ]
    );
  };

  const playTutorial = (tutorial) => {
    // In a real app, this would navigate to a video player screen
    Alert.alert('Video Player 🎥', 'Video player integration coming soon! This would open the tutorial video with interactive features.');
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return COLORS.success;
      case 'intermediate': return COLORS.warning;
      case 'advanced': return COLORS.error;
      default: return COLORS.primary;
    }
  };

  const formatDuration = (duration) => {
    return duration;
  };

  const renderTutorialCard = ({ item, index }) => {
    const isCompleted = completedTutorials.includes(item.id);
    const isBookmarked = bookmarkedTutorials.includes(item.id);

    return (
      <Card style={{ 
        marginBottom: SPACING.md, 
        marginHorizontal: viewMode === 'grid' ? SPACING.xs : 0,
        width: viewMode === 'grid' ? (width / 2) - (SPACING.lg + SPACING.xs) : '100%',
        elevation: 3 
      }}>
        <TouchableOpacity onPress={() => startTutorial(item)} activeOpacity={0.7}>
          {/* Thumbnail Area */}
          <View style={{ 
            height: 120, 
            backgroundColor: COLORS.lightGray,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative'
          }}>
            <Icon name="play-circle-filled" size={48} color={COLORS.primary} />
            
            {/* Duration Badge */}
            <Surface style={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 12,
              backgroundColor: 'rgba(0,0,0,0.7)'
            }}>
              <Text style={[TEXT_STYLES.caption, { color: 'white' }]}>
                {item.duration}
              </Text>
            </Surface>

            {/* Completion Badge */}
            {isCompleted && (
              <Surface style={{
                position: 'absolute',
                top: 8,
                left: 8,
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 12,
                backgroundColor: COLORS.success
              }}>
                <Text style={[TEXT_STYLES.caption, { color: 'white' }]}>
                  ✓ Completed
                </Text>
              </Surface>
            )}

            {/* Bookmark Button */}
            <IconButton
              icon={isBookmarked ? "bookmark" : "bookmark-border"}
              iconColor={isBookmarked ? COLORS.warning : 'white'}
              size={20}
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                backgroundColor: 'rgba(0,0,0,0.5)'
              }}
              onPress={() => toggleBookmark(item.id)}
            />
          </View>

          <Card.Content style={{ padding: SPACING.md }}>
            <Text style={[TEXT_STYLES.h4, { marginBottom: 4 }]} numberOfLines={2}>
              {item.title}
            </Text>
            
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginBottom: SPACING.sm }]} numberOfLines={2}>
              {item.description}
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
              <Chip
                size="small"
                style={{ 
                  backgroundColor: getDifficultyColor(item.difficulty) + '20',
                  marginRight: SPACING.xs 
                }}
                textStyle={{ 
                  color: getDifficultyColor(item.difficulty),
                  fontSize: 10 
                }}
              >
                {item.difficulty}
              </Chip>
              
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Icon name="star" size={14} color={COLORS.warning} />
                <Text style={[TEXT_STYLES.caption, { marginLeft: 2, marginRight: SPACING.sm }]}>
                  {item.rating}
                </Text>
                
                <Icon name="visibility" size={14} color={COLORS.textSecondary} />
                <Text style={[TEXT_STYLES.caption, { marginLeft: 2 }]}>
                  {item.views}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Avatar.Text
                size={24}
                label={item.instructor.split(' ').map(n => n[0]).join('')}
                style={{ backgroundColor: COLORS.primary + '30', marginRight: SPACING.sm }}
                labelStyle={{ fontSize: 10, color: COLORS.primary }}
              />
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, flex: 1 }]} numberOfLines={1}>
                {item.instructor}
              </Text>
            </View>
          </Card.Content>
        </TouchableOpacity>
      </Card>
    );
  };

  return (
    <Animated.View style={{ 
      flex: 1, 
      backgroundColor: COLORS.background,
      opacity: fadeAnim,
      transform: [{ translateY: slideAnim }]
    }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{
          paddingTop: StatusBar.currentHeight + SPACING.md,
          paddingHorizontal: SPACING.lg,
          paddingBottom: SPACING.lg,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.sm }}>
          <View style={{ flex: 1 }}>
            <Text style={[TEXT_STYLES.h1, { color: 'white' }]}>
              Skill Tutorials 🎯
            </Text>
            <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.8)' }]}>
              Master fitness skills with expert guidance
            </Text>
          </View>
          <IconButton
            icon={viewMode === 'grid' ? 'view-list' : 'view-module'}
            iconColor="white"
            size={24}
            onPress={() => setViewMode(prev => prev === 'grid' ? 'list' : 'grid')}
          />
        </View>

        {/* Progress Stats */}
        <Card style={{ elevation: 2, marginTop: SPACING.md }}>
          <Card.Content style={{ padding: SPACING.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={[TEXT_STYLES.h3, { color: COLORS.success }]}>
                  {userProgress.totalCompleted}
                </Text>
                <Text style={TEXT_STYLES.caption}>Completed</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>
                  {userProgress.skillPoints}
                </Text>
                <Text style={TEXT_STYLES.caption}>Skill Points</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={[TEXT_STYLES.h3, { color: COLORS.warning }]}>
                  {userProgress.currentStreak}
                </Text>
                <Text style={TEXT_STYLES.caption}>Day Streak</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </LinearGradient>

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
        stickyHeaderIndices={[1]}
      >
        {/* Search Bar */}
        <View style={{ padding: SPACING.lg }}>
          <Searchbar
            placeholder="Search tutorials, instructors, skills..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={{ marginBottom: SPACING.md }}
          />
        </View>

        {/* Sticky Filters */}
        <View style={{ backgroundColor: COLORS.background, paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md }}>
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.md }}>
            {categories.map((category) => (
              <View key={category.key} style={{ marginRight: SPACING.sm }}>
                <Chip
                  selected={selectedCategory === category.key}
                  onPress={() => setSelectedCategory(category.key)}
                  icon={category.icon}
                  selectedColor={COLORS.primary}
                >
                  {category.label}
                  {category.count && ` (${category.count})`}
                </Chip>
              </View>
            ))}
          </ScrollView>

          <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.sm }]}>Difficulty Level</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {difficulties.map((difficulty) => (
              <Chip
                key={difficulty.key}
                selected={selectedDifficulty === difficulty.key}
                onPress={() => setSelectedDifficulty(difficulty.key)}
                style={{ marginRight: SPACING.sm }}
                selectedColor={COLORS.primary}
              >
                {difficulty.label}
              </Chip>
            ))}
          </ScrollView>
        </View>

        {/* Tutorials List/Grid */}
        <View style={{ paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md }}>
            <Text style={TEXT_STYLES.h3}>
              Tutorials ({filteredTutorials.length})
            </Text>
            
            {bookmarkedTutorials.length > 0 && (
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center' }}
                onPress={() => Alert.alert('Coming Soon! 🚀', 'Bookmarked tutorials view is being developed.')}
              >
                <Icon name="bookmark" size={16} color={COLORS.warning} />
                <Text style={[TEXT_STYLES.caption, { color: COLORS.warning, marginLeft: 4 }]}>
                  {bookmarkedTutorials.length} saved
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {filteredTutorials.length > 0 ? (
            <FlatList
              data={filteredTutorials}
              renderItem={renderTutorialCard}
              keyExtractor={(item) => item.id.toString()}
              numColumns={viewMode === 'grid' ? 2 : 1}
              key={viewMode} // Force re-render when view mode changes
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              columnWrapperStyle={viewMode === 'grid' ? { justifyContent: 'space-between' } : null}
            />
          ) : (
            <Card style={{ padding: SPACING.xl, alignItems: 'center' }}>
              <Icon name="video-library" size={64} color={COLORS.lightGray} style={{ marginBottom: SPACING.md }} />
              <Text style={[TEXT_STYLES.h3, { color: COLORS.textSecondary, marginBottom: SPACING.sm }]}>
                No tutorials found
              </Text>
              <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary, textAlign: 'center', marginBottom: SPACING.md }]}>
                Try adjusting your search or filter criteria
              </Text>
              <Button
                mode="outlined"
                onPress={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedDifficulty('all');
                }}
              >
                Clear Filters
              </Button>
            </Card>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="video-plus"
        style={{
          position: 'absolute',
          margin: SPACING.lg,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.primary,
        }}
        onPress={() => Alert.alert('Coming Soon! 🚀', 'Tutorial request feature is being developed. Soon you\'ll be able to request specific tutorials!')}
      />
    </Animated.View>
  );
};

export default SkillTutorialsScreen;