import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  StatusBar,
  Alert,
  RefreshControl,
  Animated,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Platform,
} from 'react-native';
import {
  Card,
  Button,
  Text,
  Surface,
  IconButton,
  Chip,
  ProgressBar,
  Portal,
  Modal,
  Searchbar,
  FAB,
  Badge,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';

// Import design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#f44336',
  warning: '#ff9800',
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
  h1: { fontSize: 32, fontWeight: 'bold' },
  h2: { fontSize: 24, fontWeight: 'bold' },
  h3: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16 },
  caption: { fontSize: 14, color: COLORS.textSecondary },
};

const { width, height } = Dimensions.get('window');

const SkillDemos = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDemo, setSelectedDemo] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [animatedValue] = useState(new Animated.Value(0));
  const [favoriteSkills, setFavoriteSkills] = useState(new Set());
  const scrollY = useRef(new Animated.Value(0)).current;

  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const userProgress = useSelector(state => state.progress.skills);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const skillCategories = [
    { id: 'all', name: 'All Skills', icon: 'dashboard', count: 24 },
    { id: 'ball-control', name: 'Ball Control', icon: 'sports-soccer', count: 8 },
    { id: 'passing', name: 'Passing', icon: 'trending-up', count: 6 },
    { id: 'shooting', name: 'Shooting', icon: 'gps-fixed', count: 5 },
    { id: 'defending', name: 'Defending', icon: 'security', count: 5 },
  ];

  const skillDemos = [
    {
      id: 1,
      title: 'Basic Ball Control',
      category: 'ball-control',
      difficulty: 'Beginner',
      duration: '3:45',
      thumbnail: '⚽',
      description: 'Master the fundamentals of ball control with simple touches and movements.',
      steps: 4,
      completedSteps: 2,
      views: 1250,
      likes: 156,
      isFavorite: false,
      coach: 'Coach Martinez',
      tags: ['fundamentals', 'touch', 'control'],
    },
    {
      id: 2,
      title: 'Advanced Dribbling',
      category: 'ball-control',
      difficulty: 'Advanced',
      duration: '5:20',
      thumbnail: '🤹',
      description: 'Learn advanced dribbling techniques to beat defenders in tight spaces.',
      steps: 6,
      completedSteps: 0,
      views: 2100,
      likes: 298,
      isFavorite: true,
      coach: 'Coach Silva',
      tags: ['dribbling', 'skills', 'advanced'],
    },
    {
      id: 3,
      title: 'Perfect Passing',
      category: 'passing',
      difficulty: 'Intermediate',
      duration: '4:15',
      thumbnail: '🎯',
      description: 'Improve your passing accuracy and technique with professional tips.',
      steps: 5,
      completedSteps: 5,
      views: 1800,
      likes: 234,
      isFavorite: false,
      coach: 'Coach Johnson',
      tags: ['passing', 'accuracy', 'technique'],
    },
    {
      id: 4,
      title: 'Power Shooting',
      category: 'shooting',
      difficulty: 'Intermediate',
      duration: '6:00',
      thumbnail: '⚡',
      description: 'Develop powerful and accurate shots from various positions on the field.',
      steps: 7,
      completedSteps: 3,
      views: 3200,
      likes: 445,
      isFavorite: true,
      coach: 'Coach Thompson',
      tags: ['shooting', 'power', 'accuracy'],
    },
    {
      id: 5,
      title: 'Defensive Positioning',
      category: 'defending',
      difficulty: 'Beginner',
      duration: '4:30',
      thumbnail: '🛡️',
      description: 'Learn proper defensive positioning and timing for effective defending.',
      steps: 4,
      completedSteps: 1,
      views: 950,
      likes: 123,
      isFavorite: false,
      coach: 'Coach Davis',
      tags: ['defending', 'position', 'tactics'],
    },
    {
      id: 6,
      title: 'Free Kick Mastery',
      category: 'shooting',
      difficulty: 'Advanced',
      duration: '7:15',
      thumbnail: '🥅',
      description: 'Master the art of free kicks with professional techniques and practice drills.',
      steps: 8,
      completedSteps: 0,
      views: 4100,
      likes: 567,
      isFavorite: false,
      coach: 'Coach Rodriguez',
      tags: ['free-kicks', 'advanced', 'shooting'],
    },
  ];

  const filteredDemos = skillDemos.filter(demo => {
    const matchesSearch = demo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         demo.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || demo.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFavorite = (skillId) => {
    const newFavorites = new Set(favoriteSkills);
    if (newFavorites.has(skillId)) {
      newFavorites.delete(skillId);
    } else {
      newFavorites.add(skillId);
    }
    setFavoriteSkills(newFavorites);
  };

  const openSkillDemo = (demo) => {
    setSelectedDemo(demo);
    setModalVisible(true);
  };

  const startPractice = (demo) => {
    Alert.alert(
      'Start Practice',
      `Ready to practice ${demo.title}? Let's get started! 🚀`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Start', onPress: () => {
          setModalVisible(false);
          Alert.alert('Practice Started', 'Great! Follow the step-by-step instructions. You got this! 💪');
        }}
      ]
    );
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return COLORS.success;
      case 'intermediate': return COLORS.warning;
      case 'advanced': return COLORS.error;
      default: return COLORS.primary;
    }
  };

  const renderCategoryChips = () => (
    <View style={{ paddingHorizontal: SPACING.md, marginBottom: SPACING.md }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {skillCategories.map((category) => (
          <TouchableOpacity
            key={category.id}
            onPress={() => setSelectedCategory(category.id)}
            style={{ marginRight: SPACING.sm }}
          >
            <Surface
              style={{
                padding: SPACING.md,
                borderRadius: 25,
                backgroundColor: selectedCategory === category.id ? COLORS.primary : COLORS.surface,
                elevation: selectedCategory === category.id ? 4 : 2,
                flexDirection: 'row',
                alignItems: 'center',
                minWidth: 100,
              }}
            >
              <MaterialIcons
                name={category.icon}
                size={20}
                color={selectedCategory === category.id ? '#fff' : COLORS.primary}
                style={{ marginRight: SPACING.xs }}
              />
              <Text
                style={[
                  TEXT_STYLES.caption,
                  {
                    color: selectedCategory === category.id ? '#fff' : COLORS.text,
                    fontWeight: selectedCategory === category.id ? '600' : 'normal',
                  }
                ]}
              >
                {category.name}
              </Text>
              <Badge
                style={{
                  backgroundColor: selectedCategory === category.id ? 'rgba(255,255,255,0.3)' : COLORS.primary,
                  marginLeft: SPACING.xs,
                }}
                size={18}
              >
                {category.count}
              </Badge>
            </Surface>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderSkillCard = ({ item: demo, index }) => {
    const progress = demo.completedSteps / demo.steps;
    const isCompleted = progress === 1;

    return (
      <Animated.View
        style={{
          opacity: animatedValue,
          transform: [{
            translateY: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            }),
          }],
        }}
      >
        <TouchableOpacity onPress={() => openSkillDemo(demo)}>
          <Card style={{ margin: SPACING.md, elevation: 4 }}>
            <LinearGradient
              colors={isCompleted ? ['#4CAF50', '#45a049'] : ['#ffffff', '#f8f9fa']}
              style={{ borderRadius: 8 }}
            >
              <Card.Content style={{ padding: SPACING.lg }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.md }}>
                  <View style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    backgroundColor: isCompleted ? 'rgba(255,255,255,0.2)' : COLORS.primary + '20',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: SPACING.md,
                  }}>
                    <Text style={{ fontSize: 24 }}>{demo.thumbnail}</Text>
                    {isCompleted && (
                      <View style={{
                        position: 'absolute',
                        top: -5,
                        right: -5,
                        backgroundColor: '#fff',
                        borderRadius: 12,
                        width: 24,
                        height: 24,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <MaterialIcons name="check" size={16} color={COLORS.success} />
                      </View>
                    )}
                  </View>

                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs }}>
                      <Text style={[
                        TEXT_STYLES.h3,
                        { color: isCompleted ? '#fff' : COLORS.text, flex: 1 }
                      ]}>
                        {demo.title}
                      </Text>
                      <IconButton
                        icon={favoriteSkills.has(demo.id) ? 'heart' : 'heart-outline'}
                        iconColor={isCompleted ? '#fff' : COLORS.accent}
                        size={20}
                        onPress={() => toggleFavorite(demo.id)}
                      />
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
                      <Chip
                        mode="flat"
                        textStyle={{
                          color: getDifficultyColor(demo.difficulty),
                          fontSize: 12,
                          fontWeight: '600',
                        }}
                        style={{
                          backgroundColor: getDifficultyColor(demo.difficulty) + '20',
                          height: 24,
                          marginRight: SPACING.xs,
                        }}
                      >
                        {demo.difficulty}
                      </Chip>
                      <Text style={[
                        TEXT_STYLES.caption,
                        { color: isCompleted ? '#fff' : COLORS.textSecondary }
                      ]}>
                        {demo.duration} • {demo.coach}
                      </Text>
                    </View>

                    <Text style={[
                      TEXT_STYLES.caption,
                      { color: isCompleted ? '#fff' : COLORS.textSecondary, marginBottom: SPACING.sm }
                    ]}>
                      {demo.description}
                    </Text>
                  </View>
                </View>

                <ProgressBar
                  progress={progress}
                  color={isCompleted ? '#fff' : COLORS.success}
                  style={{
                    height: 6,
                    borderRadius: 3,
                    marginBottom: SPACING.sm,
                    backgroundColor: isCompleted ? 'rgba(255,255,255,0.3)' : COLORS.background,
                  }}
                />

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={[
                    TEXT_STYLES.caption,
                    { color: isCompleted ? '#fff' : COLORS.textSecondary }
                  ]}>
                    {demo.completedSteps}/{demo.steps} steps • {demo.views} views
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialIcons
                      name="thumb-up"
                      size={16}
                      color={isCompleted ? '#fff' : COLORS.textSecondary}
                      style={{ marginRight: SPACING.xs }}
                    />
                    <Text style={[
                      TEXT_STYLES.caption,
                      { color: isCompleted ? '#fff' : COLORS.textSecondary }
                    ]}>
                      {demo.likes}
                    </Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: SPACING.sm }}>
                  {demo.tags.slice(0, 3).map((tag, tagIndex) => (
                    <Chip
                      key={tagIndex}
                      mode="outlined"
                      textStyle={{
                        color: isCompleted ? '#fff' : COLORS.primary,
                        fontSize: 10,
                      }}
                      style={{
                        height: 24,
                        margin: 2,
                        backgroundColor: isCompleted ? 'rgba(255,255,255,0.2)' : 'transparent',
                        borderColor: isCompleted ? '#fff' : COLORS.primary,
                      }}
                    >
                      #{tag}
                    </Chip>
                  ))}
                </View>
              </Card.Content>
            </LinearGradient>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderSkillModal = () => (
    <Portal>
      <Modal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        contentContainerStyle={{ margin: SPACING.md, maxHeight: height * 0.8 }}
      >
        <BlurView
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          blurType="light"
          blurAmount={10}
        />
        {selectedDemo && (
          <Surface style={{ borderRadius: 16, padding: SPACING.lg, maxHeight: height * 0.8 }}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg }}>
                <View style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: COLORS.primary + '20',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: SPACING.md,
                }}>
                  <Text style={{ fontSize: 28 }}>{selectedDemo.thumbnail}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.xs }]}>
                    {selectedDemo.title}
                  </Text>
                  <Text style={TEXT_STYLES.caption}>
                    {selectedDemo.duration} • {selectedDemo.coach}
                  </Text>
                </View>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => setModalVisible(false)}
                />
              </View>

              <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.lg, lineHeight: 22 }]}>
                {selectedDemo.description}
              </Text>

              <View style={{ flexDirection: 'row', marginBottom: SPACING.lg }}>
                <Chip
                  mode="flat"
                  textStyle={{ color: getDifficultyColor(selectedDemo.difficulty), fontWeight: '600' }}
                  style={{
                    backgroundColor: getDifficultyColor(selectedDemo.difficulty) + '20',
                    marginRight: SPACING.sm,
                  }}
                >
                  {selectedDemo.difficulty}
                </Chip>
                <Chip
                  mode="flat"
                  icon="play-circle"
                  textStyle={{ color: COLORS.primary }}
                  style={{ backgroundColor: COLORS.primary + '20' }}
                >
                  {selectedDemo.steps} Steps
                </Chip>
              </View>

              <Card style={{ marginBottom: SPACING.lg, elevation: 2 }}>
                <Card.Content style={{ padding: SPACING.md }}>
                  <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
                    📋 What You'll Learn
                  </Text>
                  {[
                    'Proper technique and form',
                    'Common mistakes to avoid',
                    'Progressive skill building',
                    'Practice drills and exercises',
                  ].map((item, index) => (
                    <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs }}>
                      <MaterialIcons name="check-circle" size={16} color={COLORS.success} style={{ marginRight: SPACING.sm }} />
                      <Text style={TEXT_STYLES.body}>{item}</Text>
                    </View>
                  ))}
                </Card.Content>
              </Card>

              <ProgressBar
                progress={selectedDemo.completedSteps / selectedDemo.steps}
                color={COLORS.success}
                style={{ height: 8, borderRadius: 4, marginBottom: SPACING.md }}
              />
              <Text style={[TEXT_STYLES.caption, { textAlign: 'center', marginBottom: SPACING.lg }]}>
                Progress: {selectedDemo.completedSteps}/{selectedDemo.steps} steps completed
              </Text>

              <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
                <Button
                  mode="contained"
                  onPress={() => startPractice(selectedDemo)}
                  style={{ flex: 1 }}
                  buttonColor={COLORS.primary}
                  icon="play"
                >
                  Start Practice
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => toggleFavorite(selectedDemo.id)}
                  icon={favoriteSkills.has(selectedDemo.id) ? 'heart' : 'heart-outline'}
                >
                  {favoriteSkills.has(selectedDemo.id) ? 'Saved' : 'Save'}
                </Button>
              </View>
            </ScrollView>
          </Surface>
        )}
      </Modal>
    </Portal>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{ paddingTop: 50, paddingBottom: SPACING.lg }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md }}>
          <IconButton
            icon="arrow-left"
            iconColor="#fff"
            size={24}
            onPress={() => navigation.goBack()}
          />
          <Text style={[TEXT_STYLES.h2, { color: '#fff', flex: 1, marginLeft: SPACING.sm }]}>
            Skill Demos
          </Text>
          <IconButton
            icon="bookmark"
            iconColor="#fff"
            size={24}
            onPress={() => Alert.alert('Saved Skills', 'View your saved skill demonstrations! 📚')}
          />
        </View>

        <View style={{ paddingHorizontal: SPACING.md }}>
          <Text style={[TEXT_STYLES.caption, { color: '#fff', opacity: 0.9, textAlign: 'center' }]}>
            Master new skills with step-by-step video tutorials! 🎥⚽
          </Text>
        </View>
      </LinearGradient>

      <Searchbar
        placeholder="Search skills, techniques..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={{ margin: SPACING.md, elevation: 2 }}
        iconColor={COLORS.primary}
      />

      {renderCategoryChips()}

      <FlatList
        data={filteredDemos}
        renderItem={renderSkillCard}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', padding: SPACING.xl }}>
            <Text style={{ fontSize: 48, marginBottom: SPACING.md }}>🔍</Text>
            <Text style={[TEXT_STYLES.h3, { textAlign: 'center', marginBottom: SPACING.sm }]}>
              No skills found
            </Text>
            <Text style={[TEXT_STYLES.caption, { textAlign: 'center' }]}>
              Try adjusting your search or category filter
            </Text>
          </View>
        }
      />

      <FAB
        icon="plus"
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.primary,
        }}
        onPress={() => Alert.alert('Request Skill', 'Request a new skill demo from your coach! 📝')}
      />

      {renderSkillModal()}
    </View>
  );
};

export default SkillDemos;