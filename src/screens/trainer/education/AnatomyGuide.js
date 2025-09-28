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
  Dimensions,
  Vibration,
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
  Portal,
  Modal,
  ProgressBar,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '@react-native-blur/blur';

// Design System Constants
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
  accent: '#FF6B6B',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subheader: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  body: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
};

const { width, height } = Dimensions.get('window');

const AnatomyGuide = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector(state => state.auth);
  
  // State Management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBodySystem, setSelectedBodySystem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [favoriteItems, setFavoriteItems] = useState(new Set());
  const [studyProgress, setStudyProgress] = useState({});
  const [currentLevel, setCurrentLevel] = useState(1);
  const [points, setPoints] = useState(1250);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Anatomy Categories and Body Systems Data
  const anatomyCategories = [
    { id: 'all', name: 'All Systems', icon: 'accessibility', color: COLORS.primary },
    { id: 'muscular', name: 'Muscular', icon: 'fitness-center', color: '#E74C3C' },
    { id: 'skeletal', name: 'Skeletal', icon: 'healing', color: '#9B59B6' },
    { id: 'cardiovascular', name: 'Cardiovascular', icon: 'favorite', color: '#E91E63' },
    { id: 'respiratory', name: 'Respiratory', icon: 'air', color: '#2196F3' },
    { id: 'nervous', name: 'Nervous', icon: 'psychology', color: '#FF9800' },
    { id: 'digestive', name: 'Digestive', icon: 'restaurant', color: '#4CAF50' },
  ];

  const bodySystemsData = {
    muscular: [
      {
        id: 'ms1',
        name: 'Major Muscle Groups',
        description: 'Understanding the primary muscle groups for effective training',
        difficulty: 'Beginner',
        duration: '15 min',
        points: 50,
        topics: ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core'],
        image: '💪',
        completed: false,
      },
      {
        id: 'ms2',
        name: 'Muscle Fiber Types',
        description: 'Fast-twitch vs slow-twitch fibers and training implications',
        difficulty: 'Intermediate',
        duration: '20 min',
        points: 75,
        topics: ['Type I Fibers', 'Type II Fibers', 'Training Adaptations'],
        image: '🔬',
        completed: true,
      },
      {
        id: 'ms3',
        name: 'Muscle Contraction Types',
        description: 'Concentric, eccentric, and isometric contractions',
        difficulty: 'Advanced',
        duration: '25 min',
        points: 100,
        topics: ['Concentric', 'Eccentric', 'Isometric', 'Applications'],
        image: '⚡',
        completed: false,
      },
    ],
    skeletal: [
      {
        id: 'sk1',
        name: 'Bone Structure & Function',
        description: 'Understanding bone composition and role in movement',
        difficulty: 'Beginner',
        duration: '18 min',
        points: 60,
        topics: ['Bone Composition', 'Joint Types', 'Movement Patterns'],
        image: '🦴',
        completed: false,
      },
      {
        id: 'sk2',
        name: 'Joint Mechanics',
        description: 'How joints work and their impact on exercise selection',
        difficulty: 'Intermediate',
        duration: '22 min',
        points: 80,
        topics: ['Synovial Joints', 'Range of Motion', 'Joint Health'],
        image: '🔄',
        completed: false,
      },
    ],
    cardiovascular: [
      {
        id: 'cv1',
        name: 'Heart & Circulation',
        description: 'Cardiovascular system and exercise response',
        difficulty: 'Beginner',
        duration: '20 min',
        points: 70,
        topics: ['Heart Structure', 'Blood Flow', 'Exercise Response'],
        image: '❤️',
        completed: true,
      },
      {
        id: 'cv2',
        name: 'Energy Systems',
        description: 'Understanding aerobic vs anaerobic energy pathways',
        difficulty: 'Advanced',
        duration: '30 min',
        points: 120,
        topics: ['ATP-PC', 'Glycolytic', 'Oxidative', 'Training Zones'],
        image: '⚡',
        completed: false,
      },
    ],
  };

  useEffect(() => {
    // Initialize animations
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

    // Load user progress
    loadUserProgress();
  }, []);

  const loadUserProgress = useCallback(async () => {
    try {
      // Simulate API call for user progress
      const mockProgress = {
        'ms2': { completed: true, score: 85 },
        'cv1': { completed: true, score: 92 },
      };
      setStudyProgress(mockProgress);
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadUserProgress();
    setRefreshing(false);
    Vibration.vibrate(50);
  }, [loadUserProgress]);

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    Vibration.vibrate(30);
  };

  const handleSystemStudy = (system) => {
    setSelectedBodySystem(system);
    setModalVisible(true);
    Vibration.vibrate(50);
  };

  const toggleFavorite = (itemId) => {
    const newFavorites = new Set(favoriteItems);
    if (newFavorites.has(itemId)) {
      newFavorites.delete(itemId);
    } else {
      newFavorites.add(itemId);
      setPoints(prev => prev + 10);
    }
    setFavoriteItems(newFavorites);
    Vibration.vibrate(30);
  };

  const startStudySession = (item) => {
    setModalVisible(false);
    Alert.alert(
      '🎓 Study Session Starting',
      `Starting "${item.name}" study session. This feature will provide interactive anatomy lessons with 3D models, quizzes, and progress tracking.`,
      [
        {
          text: 'Start Learning! 🚀',
          onPress: () => {
            setPoints(prev => prev + item.points);
            // Navigate to detailed study screen
            navigation.navigate('StudySession', { item });
          },
        },
      ]
    );
  };

  const getFilteredSystems = () => {
    if (selectedCategory === 'all') {
      return Object.entries(bodySystemsData).reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});
    }
    return { [selectedCategory]: bodySystemsData[selectedCategory] || [] };
  };

  const getCompletionRate = () => {
    const totalItems = Object.values(bodySystemsData).flat().length;
    const completedItems = Object.keys(studyProgress).length;
    return totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={{
        padding: SPACING.lg,
        paddingTop: StatusBar.currentHeight + SPACING.lg,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flex: 1 }}>
          <Text style={[TEXT_STYLES.header, { color: 'white', marginBottom: SPACING.xs }]}>
            🧠 Anatomy Guide
          </Text>
          <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
            Master human anatomy for better training
          </Text>
        </View>
        <Surface style={{ borderRadius: 20, padding: SPACING.sm }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.primary }]}>Level {currentLevel}</Text>
            <Text style={[TEXT_STYLES.subheader, { color: COLORS.primary }]}>{points} XP</Text>
          </View>
        </Surface>
      </View>

      <View style={{ marginTop: SPACING.lg }}>
        <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)', marginBottom: SPACING.xs }]}>
          Overall Progress: {Math.round(getCompletionRate())}% Complete
        </Text>
        <ProgressBar
          progress={getCompletionRate() / 100}
          color="rgba(255,255,255,0.9)"
          style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10 }}
        />
      </View>
    </LinearGradient>
  );

  const renderSearchAndCategories = () => (
    <View style={{ padding: SPACING.md, backgroundColor: COLORS.background }}>
      <Searchbar
        placeholder="Search anatomy topics..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        icon="search"
        style={{ marginBottom: SPACING.md, elevation: 2 }}
        iconColor={COLORS.primary}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: SPACING.sm }}
      >
        {anatomyCategories.map((category, index) => (
          <Animated.View
            key={category.id}
            style={{
              marginRight: SPACING.sm,
              transform: [{
                translateX: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50 * (index + 1), 0],
                })
              }]
            }}
          >
            <Chip
              selected={selectedCategory === category.id}
              onPress={() => handleCategorySelect(category.id)}
              icon={category.icon}
              style={{
                backgroundColor: selectedCategory === category.id ? category.color : COLORS.surface,
                marginBottom: SPACING.sm,
              }}
              textStyle={{
                color: selectedCategory === category.id ? 'white' : COLORS.text,
                fontWeight: selectedCategory === category.id ? 'bold' : 'normal',
              }}
            >
              {category.name}
            </Chip>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );

  const renderSystemCard = (system, categoryKey) => {
    const isCompleted = studyProgress[system.id]?.completed;
    const score = studyProgress[system.id]?.score;

    return (
      <Animated.View
        key={system.id}
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          marginBottom: SPACING.md,
        }}
      >
        <Card style={{ margin: SPACING.sm, elevation: 3 }}>
          <Card.Content>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
              <Text style={{ fontSize: 32, marginRight: SPACING.sm }}>{system.image}</Text>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={TEXT_STYLES.subheader}>{system.name}</Text>
                  <IconButton
                    icon={favoriteItems.has(system.id) ? 'favorite' : 'favorite-border'}
                    iconColor={favoriteItems.has(system.id) ? COLORS.error : COLORS.textSecondary}
                    size={20}
                    onPress={() => toggleFavorite(system.id)}
                  />
                </View>
                <Text style={[TEXT_STYLES.caption, { marginBottom: SPACING.xs }]}>
                  {system.description}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.sm }}>
              {system.topics.slice(0, 3).map((topic, index) => (
                <Chip
                  key={index}
                  style={{
                    marginRight: SPACING.xs,
                    marginBottom: SPACING.xs,
                    backgroundColor: COLORS.background,
                  }}
                  textStyle={{ fontSize: 12 }}
                >
                  {topic}
                </Chip>
              ))}
              {system.topics.length > 3 && (
                <Chip
                  style={{
                    marginRight: SPACING.xs,
                    marginBottom: SPACING.xs,
                    backgroundColor: COLORS.primary,
                  }}
                  textStyle={{ fontSize: 12, color: 'white' }}
                >
                  +{system.topics.length - 3} more
                </Chip>
              )}
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Chip
                  icon="schedule"
                  style={{
                    backgroundColor:
                      system.difficulty === 'Beginner' ? COLORS.success :
                      system.difficulty === 'Intermediate' ? COLORS.warning : COLORS.error,
                    marginRight: SPACING.xs,
                  }}
                  textStyle={{ color: 'white', fontSize: 10 }}
                >
                  {system.difficulty}
                </Chip>
                <Text style={TEXT_STYLES.caption}>
                  {system.duration} • {system.points} XP
                </Text>
              </View>

              {isCompleted && (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon name="check-circle" size={16} color={COLORS.success} />
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.success, marginLeft: SPACING.xs }]}>
                    {score}%
                  </Text>
                </View>
              )}
            </View>
          </Card.Content>

          <Card.Actions>
            <Button
              mode={isCompleted ? 'outlined' : 'contained'}
              onPress={() => handleSystemStudy(system)}
              icon={isCompleted ? 'refresh' : 'play-arrow'}
              buttonColor={isCompleted ? undefined : COLORS.primary}
            >
              {isCompleted ? 'Review' : 'Study'}
            </Button>
          </Card.Actions>
        </Card>
      </Animated.View>
    );
  };

  const renderSystemsGrid = () => {
    const filteredSystems = getFilteredSystems();

    return (
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {Object.entries(filteredSystems).map(([categoryKey, systems]) => (
          <View key={categoryKey}>
            {selectedCategory === 'all' && (
              <Text style={[TEXT_STYLES.subheader, { 
                padding: SPACING.md, 
                paddingBottom: SPACING.sm,
                textTransform: 'capitalize' 
              }]}>
                {categoryKey} System
              </Text>
            )}
            {systems.map(system => renderSystemCard(system, categoryKey))}
          </View>
        ))}
      </ScrollView>
    );
  };

  const renderStudyModal = () => (
    <Portal>
      <Modal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        contentContainerStyle={{
          backgroundColor: COLORS.surface,
          margin: SPACING.lg,
          borderRadius: 16,
          maxHeight: height * 0.8,
        }}
      >
        {selectedBodySystem && (
          <ScrollView style={{ padding: SPACING.lg }}>
            <View style={{ alignItems: 'center', marginBottom: SPACING.lg }}>
              <Text style={{ fontSize: 48, marginBottom: SPACING.sm }}>
                {selectedBodySystem.image}
              </Text>
              <Text style={TEXT_STYLES.header}>{selectedBodySystem.name}</Text>
              <Text style={[TEXT_STYLES.caption, { textAlign: 'center', marginTop: SPACING.sm }]}>
                {selectedBodySystem.description}
              </Text>
            </View>

            <Surface style={{ padding: SPACING.md, borderRadius: 12, marginBottom: SPACING.lg }}>
              <Text style={[TEXT_STYLES.subheader, { marginBottom: SPACING.sm }]}>
                📚 What You'll Learn
              </Text>
              {selectedBodySystem.topics.map((topic, index) => (
                <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs }}>
                  <Icon name="check-circle" size={16} color={COLORS.success} />
                  <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.sm }]}>{topic}</Text>
                </View>
              ))}
            </Surface>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.lg }}>
              <View style={{ alignItems: 'center' }}>
                <Icon name="schedule" size={24} color={COLORS.primary} />
                <Text style={TEXT_STYLES.caption}>Duration</Text>
                <Text style={TEXT_STYLES.body}>{selectedBodySystem.duration}</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Icon name="stars" size={24} color={COLORS.warning} />
                <Text style={TEXT_STYLES.caption}>Difficulty</Text>
                <Text style={TEXT_STYLES.body}>{selectedBodySystem.difficulty}</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Icon name="jump-rope" size={24} color={COLORS.accent} />
                <Text style={TEXT_STYLES.caption}>Reward</Text>
                <Text style={TEXT_STYLES.body}>{selectedBodySystem.points} XP</Text>
              </View>
            </View>

            <Button
              mode="contained"
              onPress={() => startStudySession(selectedBodySystem)}
              icon="play-arrow"
              buttonColor={COLORS.primary}
              style={{ marginBottom: SPACING.sm }}
            >
              Start Learning! 🚀
            </Button>
            <Button
              mode="outlined"
              onPress={() => setModalVisible(false)}
            >
              Cancel
            </Button>
          </ScrollView>
        )}
      </Modal>
    </Portal>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {renderHeader()}
      {renderSearchAndCategories()}
      {renderSystemsGrid()}
      {renderStudyModal()}

      <FAB
        icon="quiz"
        style={{
          position: 'absolute',
          margin: SPACING.lg,
          right: 0,
          bottom: 80,
          backgroundColor: COLORS.accent,
        }}
        color="white"
        onPress={() => {
          Alert.alert(
            '🧪 Quick Quiz',
            'Test your anatomy knowledge with a quick quiz! This feature will provide randomized questions based on your study progress.',
            [
              {
                text: 'Start Quiz! 🎯',
                onPress: () => navigation.navigate('AnatomyQuiz'),
              },
            ]
          );
        }}
      />
    </View>
  );
};

export default AnatomyGuide;
