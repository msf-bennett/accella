import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  StatusBar,
  Animated,
  FlatList,
  Alert,
  Vibration
} from 'react-native';
import {
  Card,
  Searchbar,
  Chip,
  Button,
  Avatar,
  IconButton,
  FAB,
  Surface,
  ProgressBar,
  Portal,
  Modal
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';

// Design system imports
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f8f9fa',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e0e0e0'
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textSecondary }
};

const { width, height } = Dimensions.get('window');

const TechniqueLibrary = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTechnique, setSelectedTechnique] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userProgress, setUserProgress] = useState({});

  // Mock data for technique categories
  const categories = [
    { id: 'all', name: 'All', icon: 'sports', color: COLORS.primary },
    { id: 'football', name: 'Football ⚽', icon: 'sports-soccer', color: '#4CAF50' },
    { id: 'basketball', name: 'Basketball 🏀', icon: 'sports-basketball', color: '#FF9800' },
    { id: 'tennis', name: 'Tennis 🎾', icon: 'sports-tennis', color: '#9C27B0' },
    { id: 'swimming', name: 'Swimming 🏊‍♀️', icon: 'pool', color: '#2196F3' },
    { id: 'athletics', name: 'Athletics 🏃', icon: 'directions-run', color: '#F44336' }
  ];

  // Mock technique data with kid-friendly content
  const techniques = [
    {
      id: 1,
      title: 'Basic Dribbling 🏃‍♂️',
      category: 'football',
      difficulty: 'Beginner',
      duration: '5 min',
      description: 'Learn to control the ball while moving! Keep the ball close to your feet and use gentle touches.',
      points: 50,
      completed: userProgress['1'] || false,
      videoUrl: 'technique_video_1',
      keyPoints: [
        'Keep your head up to see the field',
        'Use both feet to touch the ball',
        'Take small steps',
        'Practice with cones for fun!'
      ],
      icon: 'sports-soccer',
      color: '#4CAF50'
    },
    {
      id: 2,
      title: 'Jump Shot Basics 🏀',
      category: 'basketball',
      difficulty: 'Beginner',
      duration: '7 min',
      description: 'Master the perfect shooting form! Remember BEEF - Balance, Eyes, Elbow, Follow-through!',
      points: 60,
      completed: userProgress['2'] || false,
      videoUrl: 'technique_video_2',
      keyPoints: [
        'Square your feet to the basket',
        'Keep your elbow under the ball',
        'Flick your wrist like a goose neck',
        'Follow through with confidence!'
      ],
      icon: 'sports-basketball',
      color: '#FF9800'
    },
    {
      id: 3,
      title: 'Forehand Technique 🎾',
      category: 'tennis',
      difficulty: 'Intermediate',
      duration: '8 min',
      description: 'Hit powerful forehand shots! Turn your body, swing low to high, and watch the ball!',
      points: 70,
      completed: userProgress['3'] || false,
      videoUrl: 'technique_video_3',
      keyPoints: [
        'Turn your shoulders sideways',
        'Step into the shot',
        'Swing from low to high',
        'Keep your eye on the ball!'
      ],
      icon: 'sports-tennis',
      color: '#9C27B0'
    },
    {
      id: 4,
      title: 'Freestyle Stroke 🏊‍♀️',
      category: 'swimming',
      difficulty: 'Intermediate',
      duration: '10 min',
      description: 'Swim faster and smoother! Learn proper arm rotation and breathing technique.',
      points: 80,
      completed: userProgress['4'] || false,
      videoUrl: 'technique_video_4',
      keyPoints: [
        'Rotate your body like a log',
        'Breathe to both sides',
        'High elbow catch',
        'Kick from your hips!'
      ],
      icon: 'pool',
      color: '#2196F3'
    },
    {
      id: 5,
      title: 'Sprint Start 🏃‍♂️',
      category: 'athletics',
      difficulty: 'Advanced',
      duration: '6 min',
      description: 'Get off to a flying start! Perfect your starting blocks technique for racing.',
      points: 90,
      completed: userProgress['5'] || false,
      videoUrl: 'technique_video_5',
      keyPoints: [
        'Set your blocks properly',
        'On your marks - stay relaxed',
        'Set position - be ready to explode',
        'Drive with your arms!'
      ],
      icon: 'directions-run',
      color: '#F44336'
    }
  ];

  // Filter techniques based on search and category
  const filteredTechniques = techniques.filter(technique => {
    const matchesSearch = technique.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         technique.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || technique.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate user stats
  const completedTechniques = techniques.filter(t => userProgress[t.id]).length;
  const totalPoints = techniques.reduce((sum, t) => userProgress[t.id] ? sum + t.points : sum, 0);
  const overallProgress = (completedTechniques / techniques.length) * 100;

  useEffect(() => {
    // Load user progress from storage
    loadUserProgress();
    
    // Entrance animation
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

  const loadUserProgress = useCallback(async () => {
    try {
      setLoading(true);
      // Simulate loading user progress
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock progress data
      setUserProgress({
        '1': true,
        '2': false,
        '3': true,
        '4': false,
        '5': false
      });
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadUserProgress();
    setRefreshing(false);
    Vibration.vibrate(50);
  }, [loadUserProgress]);

  const handleTechniquePress = (technique) => {
    Vibration.vibrate(30);
    setSelectedTechnique(technique);
    setShowModal(true);
  };

  const handleStartTechnique = () => {
    if (selectedTechnique) {
      Alert.alert(
        '🚧 Video Player Coming Soon!',
        'The interactive video technique player is being built. You\'ll be able to watch, practice, and earn points soon!',
        [{ text: 'Awesome! 😎', style: 'default' }]
      );
      setShowModal(false);
    }
  };

  const markTechniqueComplete = (techniqueId) => {
    setUserProgress(prev => ({
      ...prev,
      [techniqueId]: true
    }));
    Vibration.vibrate([50, 100, 50]);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return COLORS.success;
      case 'intermediate': return COLORS.warning;
      case 'advanced': return COLORS.error;
      default: return COLORS.primary;
    }
  };

  const renderStatsHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={{
        padding: SPACING.lg,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        marginBottom: SPACING.md
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text style={[TEXT_STYLES.h2, { color: 'white' }]}>
            Technique Library 📚
          </Text>
          <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
            Learn, practice, and master new skills!
          </Text>
        </View>
        <Avatar.Text 
          size={60} 
          label={completedTechniques.toString()}
          backgroundColor="rgba(255,255,255,0.2)"
          color="white"
        />
      </View>
      
      <View style={{ marginTop: SPACING.md }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm }}>
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>
            Progress: {completedTechniques}/{techniques.length} techniques
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>
            {Math.round(overallProgress)}%
          </Text>
        </View>
        <ProgressBar
          progress={overallProgress / 100}
          color="white"
          style={{ height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.3)' }}
        />
      </View>

      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-around', 
        marginTop: SPACING.md,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 15,
        padding: SPACING.md
      }}>
        <View style={{ alignItems: 'center' }}>
          <MaterialIcons name="star" size={24} color="#FFD700" />
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>{totalPoints}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>Points</Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <MaterialIcons name="trending-up" size={24} color="#4CAF50" />
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>Level 3</Text>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>Rising Star</Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <MaterialIcons name="local-fire-department" size={24} color="#FF5722" />
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>5</Text>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>Day Streak</Text>
        </View>
      </View>
    </LinearGradient>
  );

  const renderCategoryChips = () => (
    <View style={{ marginBottom: SPACING.md }}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: SPACING.md }}
      >
        {categories.map(category => (
          <Chip
            key={category.id}
            mode={selectedCategory === category.id ? 'flat' : 'outlined'}
            selected={selectedCategory === category.id}
            onPress={() => setSelectedCategory(category.id)}
            style={{ 
              marginRight: SPACING.sm,
              backgroundColor: selectedCategory === category.id ? category.color : 'transparent',
            }}
            textStyle={{ 
              color: selectedCategory === category.id ? 'white' : category.color,
              fontWeight: '600'
            }}
            icon={category.icon}
          >
            {category.name}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const renderTechniqueCard = ({ item: technique }) => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        marginHorizontal: SPACING.md,
        marginBottom: SPACING.md
      }}
    >
      <Card
        onPress={() => handleTechniquePress(technique)}
        style={{
          elevation: 4,
          borderRadius: 15,
          overflow: 'hidden'
        }}
      >
        <LinearGradient
          colors={[technique.color + '20', technique.color + '05']}
          style={{ padding: SPACING.md }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1, marginRight: SPACING.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
                <MaterialIcons name={technique.icon} size={28} color={technique.color} />
                <Text style={[TEXT_STYLES.h3, { marginLeft: SPACING.sm, flex: 1 }]}>
                  {technique.title}
                </Text>
              </View>
              
              <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.sm, lineHeight: 22 }]}>
                {technique.description}
              </Text>
              
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
                <Chip 
                  mode="outlined" 
                  compact 
                  style={{ 
                    marginRight: SPACING.sm,
                    borderColor: getDifficultyColor(technique.difficulty),
                    backgroundColor: getDifficultyColor(technique.difficulty) + '20'
                  }}
                  textStyle={{ 
                    color: getDifficultyColor(technique.difficulty),
                    fontSize: 12,
                    fontWeight: '600'
                  }}
                >
                  {technique.difficulty}
                </Chip>
                <MaterialIcons name="schedule" size={16} color={COLORS.textSecondary} />
                <Text style={[TEXT_STYLES.caption, { marginLeft: 4 }]}>
                  {technique.duration}
                </Text>
                <MaterialIcons name="star" size={16} color="#FFD700" style={{ marginLeft: SPACING.sm }} />
                <Text style={[TEXT_STYLES.caption, { marginLeft: 4 }]}>
                  {technique.points} pts
                </Text>
              </View>
            </View>
            
            <View style={{ alignItems: 'center' }}>
              {userProgress[technique.id] ? (
                <Surface style={{
                  padding: SPACING.md,
                  borderRadius: 30,
                  backgroundColor: COLORS.success,
                  elevation: 2
                }}>
                  <MaterialIcons name="check-circle" size={32} color="white" />
                </Surface>
              ) : (
                <Surface style={{
                  padding: SPACING.md,
                  borderRadius: 30,
                  backgroundColor: technique.color,
                  elevation: 2
                }}>
                  <MaterialIcons name="play-arrow" size={32} color="white" />
                </Surface>
              )}
            </View>
          </View>
        </LinearGradient>
      </Card>
    </Animated.View>
  );

  const renderTechniqueModal = () => (
    <Portal>
      <Modal
        visible={showModal}
        onDismiss={() => setShowModal(false)}
        contentContainerStyle={{
          margin: SPACING.lg,
          backgroundColor: 'white',
          borderRadius: 20,
          overflow: 'hidden',
          maxHeight: height * 0.8
        }}
      >
        {selectedTechnique && (
          <>
            <LinearGradient
              colors={[selectedTechnique.color, selectedTechnique.color + 'CC']}
              style={{ padding: SPACING.lg }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={[TEXT_STYLES.h2, { color: 'white' }]}>
                    {selectedTechnique.title}
                  </Text>
                  <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
                    {selectedTechnique.category.toUpperCase()} • {selectedTechnique.duration} • {selectedTechnique.points} POINTS
                  </Text>
                </View>
                <IconButton
                  icon="close"
                  iconColor="white"
                  size={28}
                  onPress={() => setShowModal(false)}
                />
              </View>
            </LinearGradient>
            
            <ScrollView style={{ padding: SPACING.lg }}>
              <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.lg, lineHeight: 24 }]}>
                {selectedTechnique.description}
              </Text>
              
              <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
                Key Points to Remember 🎯
              </Text>
              
              {selectedTechnique.keyPoints.map((point, index) => (
                <View key={index} style={{ 
                  flexDirection: 'row', 
                  alignItems: 'flex-start', 
                  marginBottom: SPACING.sm 
                }}>
                  <MaterialIcons 
                    name="check-circle" 
                    size={20} 
                    color={selectedTechnique.color} 
                    style={{ marginRight: SPACING.sm, marginTop: 2 }}
                  />
                  <Text style={[TEXT_STYLES.body, { flex: 1, lineHeight: 22 }]}>
                    {point}
                  </Text>
                </View>
              ))}
              
              <View style={{ marginTop: SPACING.lg, marginBottom: SPACING.md }}>
                <Button
                  mode="contained"
                  onPress={handleStartTechnique}
                  style={{
                    backgroundColor: selectedTechnique.color,
                    borderRadius: 25,
                    paddingVertical: SPACING.sm
                  }}
                  contentStyle={{ paddingVertical: SPACING.sm }}
                  labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
                  icon="play-arrow"
                >
                  Start Learning 🚀
                </Button>
              </View>
            </ScrollView>
          </>
        )}
      </Modal>
    </Portal>
  );

  const renderEmptyState = () => (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      padding: SPACING.xl 
    }}>
      <MaterialIcons name="search-off" size={80} color={COLORS.textSecondary} />
      <Text style={[TEXT_STYLES.h3, { marginTop: SPACING.lg, textAlign: 'center' }]}>
        No techniques found 🤔
      </Text>
      <Text style={[TEXT_STYLES.body, { textAlign: 'center', marginTop: SPACING.sm }]}>
        Try searching for different keywords or select a different category!
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar 
        translucent 
        backgroundColor="transparent" 
        barStyle="light-content" 
      />
      
      {renderStatsHeader()}
      
      <Searchbar
        placeholder="Search techniques... 🔍"
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={{
          marginHorizontal: SPACING.md,
          marginBottom: SPACING.md,
          elevation: 2,
          borderRadius: 25
        }}
        inputStyle={{ color: COLORS.text }}
        iconColor={COLORS.primary}
      />
      
      {renderCategoryChips()}
      
      <FlatList
        data={filteredTechniques}
        renderItem={renderTechniqueCard}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />
      
      {renderTechniqueModal()}
      
      <FAB
        icon="bookmark"
        style={{
          position: 'absolute',
          bottom: SPACING.xl,
          right: SPACING.lg,
          backgroundColor: COLORS.primary
        }}
        onPress={() => {
          Alert.alert(
            '📖 Saved Techniques',
            'Your bookmarked techniques feature is coming soon! You\'ll be able to save your favorite techniques for quick access.',
            [{ text: 'Cool! 👍', style: 'default' }]
          );
        }}
      />
    </View>
  );
};

export default TechniqueLibrary;