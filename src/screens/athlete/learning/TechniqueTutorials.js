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

const TechniqueTutorials = ({ navigation }) => {
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedBodyPart, setSelectedBodyPart] = useState('all');
  const [activeTab, setActiveTab] = useState('tutorials');
  const [viewMode, setViewMode] = useState('cards'); // cards or list

  // Redux state
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const tutorials = useSelector(state => state.tutorials.techniques);
  const userProgress = useSelector(state => state.progress.techniqueProgress);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Mock data for technique tutorials
  const mockTutorials = [
    {
      id: 1,
      title: 'Perfect Basketball Jump Shot 🏀',
      sport: 'basketball',
      category: 'shooting',
      bodyPart: 'upper',
      difficulty: 'intermediate',
      duration: '8 min',
      steps: 6,
      videos: 3,
      description: 'Master the fundamentals of proper shooting form and consistency.',
      thumbnail: 'basketball_jump_shot.jpg',
      instructor: 'Coach Sarah Johnson',
      views: 12540,
      rating: 4.9,
      likes: 1876,
      bookmarked: false,
      completed: false,
      progress: 0.33,
      lastWatched: '2 days ago',
      keyPoints: [
        'Proper grip and hand placement',
        'Footwork and balance',
        'Arc and follow-through',
        'Mental focus and visualization'
      ],
      equipment: ['Basketball', 'Hoop'],
      commonMistakes: [
        'Inconsistent hand placement',
        'Poor foot alignment',
        'Rushing the shot'
      ],
      prerequisites: 'Basic ball handling skills',
      nextLevel: 'Advanced Shooting Variations',
    },
    {
      id: 2,
      title: 'Football Perfect Free Kick ⚽',
      sport: 'football',
      category: 'kicking',
      bodyPart: 'lower',
      difficulty: 'advanced',
      duration: '12 min',
      steps: 8,
      videos: 4,
      description: 'Learn the technique for curling free kicks around the wall.',
      thumbnail: 'football_free_kick.jpg',
      instructor: 'Marco Silva',
      views: 8930,
      rating: 4.8,
      likes: 1432,
      bookmarked: true,
      completed: false,
      progress: 0.75,
      lastWatched: 'Yesterday',
      keyPoints: [
        'Plant foot positioning',
        'Contact point on ball',
        'Body shape and balance',
        'Follow-through technique'
      ],
      equipment: ['Football', 'Cones', 'Wall/Defenders'],
      commonMistakes: [
        'Wrong plant foot position',
        'Hitting ball too high',
        'Lack of practice consistency'
      ],
      prerequisites: 'Good passing and shooting basics',
      nextLevel: 'Advanced Set Piece Variations',
    },
    {
      id: 3,
      title: 'Tennis Serve Power & Accuracy 🎾',
      sport: 'tennis',
      category: 'serving',
      bodyPart: 'full-body',
      difficulty: 'intermediate',
      duration: '15 min',
      steps: 10,
      videos: 5,
      description: 'Develop a powerful and accurate tennis serve with proper biomechanics.',
      thumbnail: 'tennis_serve.jpg',
      instructor: 'Elena Rodriguez',
      views: 6750,
      rating: 4.7,
      likes: 987,
      bookmarked: false,
      completed: true,
      progress: 1.0,
      lastWatched: '1 week ago',
      completedDate: '1 week ago',
      keyPoints: [
        'Proper grip and stance',
        'Ball toss consistency',
        'Kinetic chain activation',
        'Contact point optimization'
      ],
      equipment: ['Tennis Racket', 'Tennis Balls', 'Court'],
      commonMistakes: [
        'Inconsistent ball toss',
        'Poor timing',
        'Incorrect grip pressure'
      ],
      prerequisites: 'Basic tennis strokes',
      nextLevel: 'Serve Variations and Strategy',
    },
    {
      id: 4,
      title: 'Swimming Freestyle Stroke 🏊‍♂️',
      sport: 'swimming',
      category: 'stroke-technique',
      bodyPart: 'full-body',
      difficulty: 'beginner',
      duration: '10 min',
      steps: 7,
      videos: 4,
      description: 'Perfect your freestyle swimming technique for speed and efficiency.',
      thumbnail: 'swimming_freestyle.jpg',
      instructor: 'Michael Chen',
      views: 15420,
      rating: 4.9,
      likes: 2340,
      bookmarked: true,
      completed: false,
      progress: 0.57,
      lastWatched: '3 days ago',
      keyPoints: [
        'Body position and rotation',
        'Arm stroke mechanics',
        'Breathing technique',
        'Kick timing and rhythm'
      ],
      equipment: ['Pool', 'Kickboard (optional)', 'Pull Buoy (optional)'],
      commonMistakes: [
        'Head position too high',
        'Crossing over centerline',
        'Holding breath too long'
      ],
      prerequisites: 'Basic water comfort',
      nextLevel: 'Advanced Freestyle Techniques',
    },
    {
      id: 5,
      title: 'Deadlift Perfect Form 💪',
      sport: 'fitness',
      category: 'strength',
      bodyPart: 'full-body',
      difficulty: 'intermediate',
      duration: '12 min',
      steps: 9,
      videos: 6,
      description: 'Master the deadlift for maximum strength and injury prevention.',
      thumbnail: 'deadlift_form.jpg',
      instructor: 'Alex Thompson',
      views: 11200,
      rating: 4.8,
      likes: 1654,
      bookmarked: false,
      completed: false,
      progress: 0.22,
      lastWatched: '5 days ago',
      keyPoints: [
        'Hip hinge movement pattern',
        'Neutral spine alignment',
        'Grip and bar position',
        'Breathing and bracing'
      ],
      equipment: ['Barbell', 'Weight Plates', 'Lifting Belt (optional)'],
      commonMistakes: [
        'Rounding the back',
        'Bar drifting away from body',
        'Hyperextending at the top'
      ],
      prerequisites: 'Basic movement patterns',
      nextLevel: 'Advanced Deadlift Variations',
    },
    {
      id: 6,
      title: 'Golf Driver Swing Technique ⛳',
      sport: 'golf',
      category: 'swing',
      bodyPart: 'full-body',
      difficulty: 'advanced',
      duration: '18 min',
      steps: 12,
      videos: 7,
      description: 'Maximize distance and accuracy with proper driver swing mechanics.',
      thumbnail: 'golf_driver.jpg',
      instructor: 'James Wilson',
      views: 4320,
      rating: 4.6,
      likes: 543,
      bookmarked: true,
      completed: false,
      progress: 0.08,
      lastWatched: '1 week ago',
      keyPoints: [
        'Setup and alignment',
        'Backswing plane',
        'Hip rotation and weight transfer',
        'Impact position and follow-through'
      ],
      equipment: ['Driver', 'Golf Balls', 'Tees', 'Driving Range'],
      commonMistakes: [
        'Over-swinging',
        'Poor weight transfer',
        'Incorrect ball position'
      ],
      prerequisites: 'Basic golf fundamentals',
      nextLevel: 'Course Management Strategies',
    },
  ];

  const sports = [
    { id: 'all', name: 'All Sports', icon: 'sports', count: 45, color: COLORS.primary },
    { id: 'basketball', name: 'Basketball', icon: 'sports-basketball', count: 12, color: '#ff9800' },
    { id: 'football', name: 'Football', icon: 'sports-soccer', count: 15, color: '#4caf50' },
    { id: 'tennis', name: 'Tennis', icon: 'sports-tennis', count: 8, color: '#e91e63' },
    { id: 'swimming', name: 'Swimming', icon: 'pool', count: 6, color: '#2196f3' },
    { id: 'fitness', name: 'Fitness', icon: 'fitness-center', count: 18, color: '#f44336' },
    { id: 'golf', name: 'Golf', icon: 'sports-golf', count: 7, color: '#8bc34a' },
  ];

  const difficulties = [
    { id: 'all', name: 'All Levels', color: COLORS.primary },
    { id: 'beginner', name: 'Beginner', color: COLORS.success },
    { id: 'intermediate', name: 'Intermediate', color: '#ff9800' },
    { id: 'advanced', name: 'Advanced', color: COLORS.error },
  ];

  const bodyParts = [
    { id: 'all', name: 'All Body', icon: 'accessibility' },
    { id: 'upper', name: 'Upper Body', icon: 'fitness-center' },
    { id: 'lower', name: 'Lower Body', icon: 'directions-run' },
    { id: 'full-body', name: 'Full Body', icon: 'accessibility-new' },
    { id: 'core', name: 'Core', icon: 'center-focus-strong' },
  ];

  const tabs = [
    { id: 'tutorials', name: 'All Tutorials', icon: 'play-circle-filled' },
    { id: 'bookmarked', name: 'Bookmarked', icon: 'bookmark' },
    { id: 'completed', name: 'Completed', icon: 'check-circle' },
    { id: 'in-progress', name: 'In Progress', icon: 'play-arrow' },
  ];

  // Component lifecycle
  useEffect(() => {
    initializeAnimations();
    // Simulate loading tutorials
    // dispatch(fetchTechniqueTutorials());
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

  const handleTutorialPress = (tutorial) => {
    Vibration.vibrate(30);
    if (tutorial.completed) {
      Alert.alert(
        "Tutorial Completed! ✅",
        `You completed "${tutorial.title}" ${tutorial.completedDate}.\n\nWould you like to review or try advanced variations?`,
        [
          { text: "Review Tutorial", style: "default" },
          { text: "Next Level", style: "default" },
          { text: "Cancel", style: "cancel" }
        ]
      );
    } else if (tutorial.progress > 0) {
      Alert.alert(
        "Continue Learning 📚",
        `Resume "${tutorial.title}"?\n\nProgress: ${Math.round(tutorial.progress * 100)}%\nLast watched: ${tutorial.lastWatched}`,
        [
          { text: "Continue", style: "default" },
          { text: "Start Over", style: "default" },
          { text: "Cancel", style: "cancel" }
        ]
      );
    } else {
      Alert.alert(
        "Start Tutorial? 🎯",
        `"${tutorial.title}"\n\nDuration: ${tutorial.duration}\nSteps: ${tutorial.steps}\nInstructor: ${tutorial.instructor}\n\nReady to learn this technique?`,
        [
          { text: "Preview", style: "default" },
          { text: "Start Learning", style: "default" },
          { text: "Cancel", style: "cancel" }
        ]
      );
    }
  };

  const handleBookmarkToggle = (tutorial) => {
    Vibration.vibrate(20);
    // Simulate bookmark toggle
    Alert.alert(
      tutorial.bookmarked ? "Bookmark Removed" : "Bookmark Added",
      tutorial.bookmarked ? 
        `"${tutorial.title}" removed from bookmarks` :
        `"${tutorial.title}" added to bookmarks`,
      [{ text: "OK", style: "default" }]
    );
  };

  const handleLikeToggle = (tutorial) => {
    Vibration.vibrate(15);
    // Simulate like toggle
  };

  const getDifficultyColor = (difficulty) => {
    const difficultyObj = difficulties.find(d => d.id === difficulty);
    return difficultyObj ? difficultyObj.color : COLORS.primary;
  };

  const getSportColor = (sport) => {
    const sportObj = sports.find(s => s.id === sport);
    return sportObj ? sportObj.color : COLORS.primary;
  };

  const getFilteredTutorials = () => {
    let filtered = mockTutorials.filter(tutorial => {
      const matchesSearch = tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           tutorial.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           tutorial.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           tutorial.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSport = selectedSport === 'all' || tutorial.sport === selectedSport;
      const matchesDifficulty = selectedDifficulty === 'all' || tutorial.difficulty === selectedDifficulty;
      const matchesBodyPart = selectedBodyPart === 'all' || tutorial.bodyPart === selectedBodyPart;
      
      return matchesSearch && matchesSport && matchesDifficulty && matchesBodyPart;
    });

    // Apply tab filtering
    switch (activeTab) {
      case 'bookmarked':
        filtered = filtered.filter(tutorial => tutorial.bookmarked);
        break;
      case 'completed':
        filtered = filtered.filter(tutorial => tutorial.completed);
        break;
      case 'in-progress':
        filtered = filtered.filter(tutorial => tutorial.progress > 0 && !tutorial.completed);
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
              Technique Tutorials 🎯
            </Text>
            <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.9)', marginTop: SPACING.xs }]}>
              Master perfect form step-by-step
            </Text>
          </View>
          <View style={styles.headerActions}>
            <IconButton
              icon={viewMode === 'cards' ? 'view-list' : 'view-module'}
              iconColor="white"
              size={24}
              onPress={() => setViewMode(viewMode === 'cards' ? 'list' : 'cards')}
            />
            <IconButton
              icon="bookmark"
              iconColor="white"
              size={24}
              onPress={() => setActiveTab('bookmarked')}
            />
          </View>
        </View>

        {/* Learning Stats */}
        <View style={styles.learningStats}>
          <Surface style={styles.statCard}>
            <Icon name="play-circle-filled" size={20} color="#2196f3" />
            <Text style={[TEXT_STYLES.caption, styles.statLabel]}>Watching</Text>
            <Text style={[TEXT_STYLES.h4, styles.statValue]}>4</Text>
          </Surface>
          <Surface style={styles.statCard}>
            <Icon name="check-circle" size={20} color={COLORS.success} />
            <Text style={[TEXT_STYLES.caption, styles.statLabel]}>Completed</Text>
            <Text style={[TEXT_STYLES.h4, styles.statValue]}>12</Text>
          </Surface>
          <Surface style={styles.statCard}>
            <Icon name="bookmark" size={20} color="#ff9800" />
            <Text style={[TEXT_STYLES.caption, styles.statLabel]}>Saved</Text>
            <Text style={[TEXT_STYLES.h4, styles.statValue]}>8</Text>
          </Surface>
          <Surface style={styles.statCard}>
            <Icon name="schedule" size={20} color="#9c27b0" />
            <Text style={[TEXT_STYLES.caption, styles.statLabel]}>Hours</Text>
            <Text style={[TEXT_STYLES.h4, styles.statValue]}>34</Text>
          </Surface>
        </View>
      </View>
    </LinearGradient>
  );

  const renderTabsAndFilters = () => (
    <View style={styles.filtersContainer}>
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
              size={18}
              color={activeTab === tab.id ? 'white' : COLORS.textSecondary}
            />
            <Text style={[
              styles.tabText,
              activeTab === tab.id && styles.activeTabText
            ]}>
              {tab.name}
            </Text>
            {((tab.id === 'bookmarked' && 3) || 
              (tab.id === 'completed' && 1) || 
              (tab.id === 'in-progress' && 4)) && (
              <Badge style={styles.tabBadge} size={16}>
                {tab.id === 'bookmarked' ? 3 : tab.id === 'completed' ? 1 : 4}
              </Badge>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Search */}
      <Searchbar
        placeholder="Search techniques, sports, instructors..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
        iconColor={COLORS.primary}
      />

      {/* Sport Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {sports.map((sport) => (
          <Chip
            key={sport.id}
            selected={selectedSport === sport.id}
            onPress={() => setSelectedSport(sport.id)}
            style={[
              styles.filterChip,
              selectedSport === sport.id && { backgroundColor: sport.color }
            ]}
            textStyle={{
              color: selectedSport === sport.id ? 'white' : sport.color,
              fontSize: 12,
            }}
            icon={sport.icon}
          >
            {sport.name}
          </Chip>
        ))}
      </ScrollView>

      {/* Additional Filters Row */}
      <View style={styles.additionalFilters}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          <Text style={styles.filterLabel}>Difficulty:</Text>
          {difficulties.map((difficulty) => (
            <Chip
              key={difficulty.id}
              selected={selectedDifficulty === difficulty.id}
              onPress={() => setSelectedDifficulty(difficulty.id)}
              style={[
                styles.smallChip,
                selectedDifficulty === difficulty.id && { backgroundColor: difficulty.color }
              ]}
              textStyle={{
                color: selectedDifficulty === difficulty.id ? 'white' : difficulty.color,
                fontSize: 11,
              }}
            >
              {difficulty.name}
            </Chip>
          ))}
        </ScrollView>
      </View>

      <View style={styles.additionalFilters}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          <Text style={styles.filterLabel}>Body Part:</Text>
          {bodyParts.map((bodyPart) => (
            <Chip
              key={bodyPart.id}
              selected={selectedBodyPart === bodyPart.id}
              onPress={() => setSelectedBodyPart(bodyPart.id)}
              style={[
                styles.smallChip,
                selectedBodyPart === bodyPart.id && { backgroundColor: COLORS.primary }
              ]}
              textStyle={{
                color: selectedBodyPart === bodyPart.id ? 'white' : COLORS.text,
                fontSize: 11,
              }}
              icon={bodyPart.icon}
            >
              {bodyPart.name}
            </Chip>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  const renderTutorialCard = (tutorial) => (
    <Animated.View
      key={tutorial.id}
      style={[
        viewMode === 'cards' ? styles.tutorialCardContainer : styles.tutorialListContainer,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }
      ]}
    >
      <TouchableOpacity
        onPress={() => handleTutorialPress(tutorial)}
        activeOpacity={0.9}
      >
        <Card style={styles.tutorialCard}>
          {/* Tutorial Thumbnail */}
          <View style={styles.thumbnailContainer}>
            <LinearGradient
              colors={[getSportColor(tutorial.sport) + 'CC', getSportColor(tutorial.sport)]}
              style={styles.thumbnailGradient}
            >
              <Icon 
                name={sports.find(s => s.id === tutorial.sport)?.icon || 'play-circle-filled'} 
                size={36} 
                color="white" 
              />
              
              {/* Play Button Overlay */}
              <View style={styles.playOverlay}>
                <Icon name="play-circle-filled" size={48} color="rgba(255,255,255,0.9)" />
              </View>
              
              {/* Duration Badge */}
              <View style={styles.durationBadge}>
                <Icon name="schedule" size={12} color="white" />
                <Text style={styles.durationText}>{tutorial.duration}</Text>
              </View>
            </LinearGradient>

            {/* Progress Overlay */}
            {tutorial.progress > 0 && !tutorial.completed && (
              <View style={styles.progressOverlay}>
                <ProgressBar
                  progress={tutorial.progress}
                  color="white"
                  style={styles.thumbnailProgress}
                />
                <Text style={styles.progressText}>
                  {Math.round(tutorial.progress * 100)}%
                </Text>
              </View>
            )}

            {/* Completed Badge */}
            {tutorial.completed && (
              <View style={styles.completedBadge}>
                <Icon name="check-circle" size={20} color={COLORS.success} />
              </View>
            )}
          </View>

          <View style={styles.tutorialContent}>
            {/* Title and Difficulty */}
            <View style={styles.tutorialHeader}>
              <Text style={[TEXT_STYLES.h4, styles.tutorialTitle]} numberOfLines={2}>
                {tutorial.title}
              </Text>
              <View style={styles.tutorialMeta}>
                <Chip
                  style={[styles.difficultyChip, { backgroundColor: getDifficultyColor(tutorial.difficulty) + '20' }]}
                  textStyle={{ color: getDifficultyColor(tutorial.difficulty), fontSize: 10 }}
                >
                  {tutorial.difficulty.toUpperCase()}
                </Chip>
              </View>
            </View>

            {/* Instructor */}
            <View style={styles.instructorInfo}>
              <Avatar.Text
                size={24}
                label={tutorial.instructor.split(' ').map(n => n[0]).join('')}
                style={styles.instructorAvatar}
              />
              <Text style={[TEXT_STYLES.caption, styles.instructorName]}>
                {tutorial.instructor}
              </Text>
            </View>

            {/* Description */}
            <Text style={[TEXT_STYLES.body, styles.tutorialDescription]} numberOfLines={2}>
              {tutorial.description}
            </Text>

            {/* Tutorial Stats */}
            <View style={styles.tutorialStats}>
              <View style={styles.statGroup}>
                <Icon name="play-lesson" size={14} color={COLORS.textSecondary} />
                <Text style={styles.statText}>{tutorial.steps} steps</Text>
              </View>
              <View style={styles.statGroup}>
                <Icon name="videocam" size={14} color={COLORS.textSecondary} />
                <Text style={styles.statText}>{tutorial.videos} videos</Text>
              </View>
              <View style={styles.statGroup}>
                <Icon name="visibility" size={14} color={COLORS.textSecondary} />
                <Text style={styles.statText}>{tutorial.views.toLocaleString()}</Text>
              </View>
            </View>

            {/* Rating and Actions */}
            <View style={styles.tutorialFooter}>
              <View style={styles.ratingContainer}>
                <Icon name="star" size={16} color="#ffc107" />
                <Text style={styles.ratingText}>{tutorial.rating}</Text>
              </View>
              
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleLikeToggle(tutorial)}
                  activeOpacity={0.7}
                >
                  <Icon name="thumb-up" size={18} color={COLORS.textSecondary} />
                  <Text style={styles.actionText}>{tutorial.likes}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleBookmarkToggle(tutorial)}
                  activeOpacity={0.7}
                >
                  <Icon 
                    name={tutorial.bookmarked ? "bookmark" : "bookmark-border"} 
                    size={18} 
                    color={tutorial.bookmarked ? COLORS.primary : COLORS.textSecondary} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Key Points Preview */}
            <View style={styles.keyPointsPreview}>
              <Text style={[TEXT_STYLES.caption, styles.keyPointsTitle]}>Key Points:</Text>
              <Text style={[TEXT_STYLES.caption, styles.keyPointsText]} numberOfLines={2}>
                {tutorial.keyPoints.slice(0, 2).join(' • ')}
                {tutorial.keyPoints.length > 2 && '...'}
              </Text>
            </View>

            {/* Action Button */}
            <Button
              mode={tutorial.completed ? "outlined" : "contained"}
              onPress={() => handleTutorialPress(tutorial)}
              style={styles.tutorialButton}
              buttonColor={
                tutorial.completed ? 'transparent' :
                tutorial.progress > 0 ? COLORS.primary :
                getSportColor(tutorial.sport)
              }
              textColor={tutorial.completed ? COLORS.primary : 'white'}
              icon={
                tutorial.completed ? "replay" :
                tutorial.progress > 0 ? "play-arrow" :
                "play-circle-filled"
              }
            >
              {tutorial.completed ? 'Review' :
               tutorial.progress > 0 ? 'Continue' :
               'Start Learning'}
            </Button>
          </View>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon 
        name={
          activeTab === 'bookmarked' ? 'bookmark-border' :
          activeTab === 'completed' ? 'check-circle-outline' :
          activeTab === 'in-progress' ? 'play-circle-outline' :
          'search-off'
        } 
        size={64} 
        color={COLORS.textSecondary} 
      />
      <Text style={[TEXT_STYLES.h3, styles.emptyTitle]}>
        {activeTab === 'bookmarked' ? 'No bookmarked tutorials' :
         activeTab === 'completed' ? 'No completed tutorials' :
         activeTab === 'in-progress' ? 'No tutorials in progress' :
         'No tutorials found'}
      </Text>
      <Text style={[TEXT_STYLES.body, styles.emptySubtitle]}>
        {activeTab === 'bookmarked' ? 'Bookmark tutorials to watch them later' :
         activeTab === 'completed' ? 'Complete tutorials to see them here' :
         activeTab === 'in-progress' ? 'Start watching tutorials to track progress' :
         'Try adjusting your search or filters'}
      </Text>
      <Button
        mode="outlined"
        onPress={() => {
          if (activeTab !== 'tutorials') {
            setActiveTab('tutorials');
          } else {
            setSearchQuery('');
            setSelectedSport('all');
            setSelectedDifficulty('all');
            setSelectedBodyPart('all');
          }
        }}
        style={{ marginTop: SPACING.md }}
        icon={activeTab === 'tutorials' ? 'refresh' : 'explore'}
      >
        {activeTab === 'tutorials' ? 'Clear Filters' : 'Explore Tutorials'}
      </Button>
    </View>
  );

  const filteredTutorials = getFilteredTutorials();

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
        {renderTabsAndFilters()}
        
        <View style={styles.tutorialsContainer}>
          {filteredTutorials.length > 0 ? (
            <>
              <View style={styles.sectionHeader}>
                <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
                  {filteredTutorials.length} Tutorial{filteredTutorials.length !== 1 ? 's' : ''}
                  {activeTab === 'bookmarked' ? ' Bookmarked' :
                   activeTab === 'completed' ? ' Completed' :
                   activeTab === 'in-progress' ? ' In Progress' : ' Available'}
                </Text>
                {viewMode === 'cards' && (
                  <Text style={[TEXT_STYLES.caption, styles.viewModeHint]}>
                    Tap list icon to change view
                  </Text>
                )}
              </View>
              
              <View style={viewMode === 'cards' ? styles.cardsGrid : styles.listView}>
                {filteredTutorials.map(renderTutorialCard)}
              </View>
            </>
          ) : (
            renderEmptyState()
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="video-call"
        style={styles.fab}
        onPress={() => Alert.alert("Request Tutorial", "Request a specific technique tutorial! 🎬")}
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
  learningStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: SPACING.sm,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 2,
    elevation: 2,
  },
  statLabel: {
    marginTop: SPACING.xs,
    color: COLORS.textSecondary,
    fontSize: 10,
  },
  statValue: {
    marginTop: 2,
    color: COLORS.text,
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  filtersContainer: {
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
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    marginRight: SPACING.sm,
    borderRadius: 16,
    backgroundColor: COLORS.background,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    marginLeft: SPACING.xs,
    color: COLORS.textSecondary,
    fontSize: 12,
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
  filterRow: {
    paddingHorizontal: SPACING.lg,
  },
  filterChip: {
    marginRight: SPACING.sm,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  additionalFilters: {
    marginTop: SPACING.xs,
  },
  filterLabel: {
    alignSelf: 'center',
    marginRight: SPACING.sm,
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  smallChip: {
    marginRight: SPACING.xs,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tutorialsContainer: {
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
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  listView: {
    width: '100%',
  },
  tutorialCardContainer: {
    width: (width - SPACING.lg * 3) / 2,
    marginBottom: SPACING.lg,
  },
  tutorialListContainer: {
    width: '100%',
    marginBottom: SPACING.lg,
  },
  tutorialCard: {
    backgroundColor: 'white',
    elevation: 3,
    borderRadius: 16,
    overflow: 'hidden',
  },
  thumbnailContainer: {
    height: 100,
    position: 'relative',
  },
  thumbnailGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  durationBadge: {
    position: 'absolute',
    bottom: SPACING.xs,
    right: SPACING.xs,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 8,
  },
  durationText: {
    color: 'white',
    fontSize: 10,
    marginLeft: 2,
    fontWeight: '600',
  },
  progressOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: SPACING.xs,
  },
  thumbnailProgress: {
    height: 3,
    borderRadius: 2,
    marginBottom: SPACING.xs,
  },
  progressText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'right',
  },
  completedBadge: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    padding: 2,
  },
  tutorialContent: {
    padding: SPACING.md,
  },
  tutorialHeader: {
    marginBottom: SPACING.sm,
  },
  tutorialTitle: {
    color: COLORS.text,
    marginBottom: SPACING.xs,
    lineHeight: 18,
  },
  tutorialMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyChip: {
    paddingHorizontal: SPACING.xs,
  },
  instructorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  instructorAvatar: {
    backgroundColor: COLORS.primary,
  },
  instructorName: {
    marginLeft: SPACING.xs,
    color: COLORS.textSecondary,
    flex: 1,
  },
  tutorialDescription: {
    color: COLORS.textSecondary,
    lineHeight: 16,
    marginBottom: SPACING.md,
    fontSize: 13,
  },
  tutorialStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  statGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginLeft: 2,
  },
  tutorialFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: SPACING.xs,
    color: COLORS.text,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xs,
    marginLeft: SPACING.sm,
  },
  actionText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginLeft: 2,
  },
  keyPointsPreview: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: 8,
  },
  keyPointsTitle: {
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  keyPointsText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 14,
  },
  tutorialButton: {
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

export default TechniqueTutorials;