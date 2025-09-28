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
  ImageBackground,
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
  Divider,
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
  biomechanic: '#8E44AD',
  kinetic: '#E67E22',
  kinematic: '#3498DB',
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
  formula: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: COLORS.biomechanic,
    fontWeight: 'bold',
  },
};

const { width, height } = Dimensions.get('window');

const BiomechanicsLearning = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector(state => state.auth);
  
  // State Management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedModule, setSelectedModule] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [completedModules, setCompletedModules] = useState(new Set(['bm1', 'bm4']));
  const [currentStreak, setCurrentStreak] = useState(7);
  const [totalPoints, setTotalPoints] = useState(2150);
  const [currentLevel, setCurrentLevel] = useState(3);
  const [showFormulas, setShowFormulas] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Biomechanics Categories
  const biomechanicsCategories = [
    { id: 'all', name: 'All Topics', icon: 'science', color: COLORS.primary },
    { id: 'kinematics', name: 'Kinematics', icon: 'timeline', color: COLORS.kinematic },
    { id: 'kinetics', name: 'Kinetics', icon: 'flash-on', color: COLORS.kinetic },
    { id: 'biomechanics', name: 'Applied Bio', icon: 'fitness-center', color: COLORS.biomechanic },
    { id: 'analysis', name: 'Movement Analysis', icon: 'analytics', color: COLORS.accent },
  ];

  // Biomechanics Learning Modules
  const biomechanicsModules = {
    kinematics: [
      {
        id: 'km1',
        name: 'Linear Motion Fundamentals',
        description: 'Understanding displacement, velocity, and acceleration in human movement',
        difficulty: 'Beginner',
        duration: '25 min',
        points: 80,
        formula: 'v = d/t, a = Δv/t',
        concepts: ['Displacement', 'Velocity', 'Acceleration', 'Time'],
        applications: ['Sprint Mechanics', 'Jump Analysis', 'Gait Patterns'],
        icon: '📏',
        color: COLORS.kinematic,
        completed: false,
        practicalExercises: 3,
      },
      {
        id: 'km2',
        name: 'Angular Motion & Rotation',
        description: 'Rotational kinematics in joint movements and sports actions',
        difficulty: 'Intermediate',
        duration: '30 min',
        points: 100,
        formula: 'ω = θ/t, α = Δω/t',
        concepts: ['Angular Displacement', 'Angular Velocity', 'Angular Acceleration'],
        applications: ['Throwing Mechanics', 'Kicking Technique', 'Rotation Exercises'],
        icon: '🌀',
        color: COLORS.kinematic,
        completed: false,
        practicalExercises: 4,
      },
      {
        id: 'km3',
        name: 'Projectile Motion in Sports',
        description: 'Analyzing projectile motion in athletic movements',
        difficulty: 'Advanced',
        duration: '35 min',
        points: 120,
        formula: 'y = y₀ + v₀t - ½gt²',
        concepts: ['Launch Angle', 'Initial Velocity', 'Range', 'Flight Time'],
        applications: ['Shot Put', 'Basketball Shooting', 'Long Jump'],
        icon: '🏀',
        color: COLORS.kinematic,
        completed: false,
        practicalExercises: 5,
      },
    ],
    kinetics: [
      {
        id: 'kt1',
        name: 'Forces in Human Movement',
        description: 'Understanding internal and external forces affecting motion',
        difficulty: 'Beginner',
        duration: '28 min',
        points: 85,
        formula: 'F = ma, ΣF = 0 (equilibrium)',
        concepts: ['Force Types', 'Newtons Laws', 'Force Vectors', 'Equilibrium'],
        applications: ['Resistance Training', 'Ground Reaction Forces', 'Balance'],
        icon: '⚡',
        color: COLORS.kinetic,
        completed: true,
        practicalExercises: 4,
      },
      {
        id: 'kt2',
        name: 'Work, Power & Energy',
        description: 'Energy systems and mechanical work in exercise',
        difficulty: 'Intermediate',
        duration: '32 min',
        points: 110,
        formula: 'W = F×d, P = W/t, KE = ½mv²',
        concepts: ['Mechanical Work', 'Power Output', 'Kinetic Energy', 'Potential Energy'],
        applications: ['Power Training', 'Plyometrics', 'Energy Efficiency'],
        icon: '💪',
        color: COLORS.kinetic,
        completed: false,
        practicalExercises: 6,
      },
    ],
    biomechanics: [
      {
        id: 'bm1',
        name: 'Muscle Mechanics',
        description: 'Force production and muscle contraction biomechanics',
        difficulty: 'Beginner',
        duration: '30 min',
        points: 95,
        formula: 'Force = Tension × cos(θ)',
        concepts: ['Length-Tension Relationship', 'Force-Velocity Curve', 'Muscle Architecture'],
        applications: ['Exercise Selection', 'Rep Ranges', 'Training Angles'],
        icon: '💪',
        color: COLORS.biomechanic,
        completed: true,
        practicalExercises: 5,
      },
      {
        id: 'bm2',
        name: 'Lever Systems in Body',
        description: 'Understanding mechanical advantage in human joints',
        difficulty: 'Intermediate',
        duration: '25 min',
        points: 90,
        formula: 'MA = Effort Arm / Load Arm',
        concepts: ['1st Class Levers', '2nd Class Levers', '3rd Class Levers', 'Mechanical Advantage'],
        applications: ['Joint Efficiency', 'Exercise Modifications', 'Load Distribution'],
        icon: '⚖️',
        color: COLORS.biomechanic,
        completed: false,
        practicalExercises: 4,
      },
      {
        id: 'bm3',
        name: 'Center of Mass & Stability',
        description: 'Balance, stability, and center of gravity principles',
        difficulty: 'Advanced',
        duration: '40 min',
        points: 130,
        formula: 'COM = Σ(mass × position) / total mass',
        concepts: ['Center of Mass', 'Base of Support', 'Stability Triangle', 'Balance'],
        applications: ['Balance Training', 'Injury Prevention', 'Functional Movement'],
        icon: '⚖️',
        color: COLORS.biomechanic,
        completed: false,
        practicalExercises: 7,
      },
    ],
    analysis: [
      {
        id: 'bm4',
        name: 'Movement Pattern Analysis',
        description: 'Systematic approach to analyzing human movement',
        difficulty: 'Intermediate',
        duration: '35 min',
        points: 115,
        formula: 'Movement Quality = Efficiency × Safety',
        concepts: ['Movement Screening', 'Compensation Patterns', 'Quality Assessment'],
        applications: ['Exercise Prescription', 'Injury Prevention', 'Performance Optimization'],
        icon: '📊',
        color: COLORS.accent,
        completed: true,
        practicalExercises: 8,
      },
      {
        id: 'bm5',
        name: 'Gait Analysis Fundamentals',
        description: 'Understanding walking and running biomechanics',
        difficulty: 'Advanced',
        duration: '45 min',
        points: 140,
        formula: 'Stride Frequency × Stride Length = Speed',
        concepts: ['Gait Cycle', 'Stance Phase', 'Swing Phase', 'Ground Contact'],
        applications: ['Running Form', 'Walking Rehabilitation', 'Performance Analysis'],
        icon: '🚶',
        color: COLORS.accent,
        completed: false,
        practicalExercises: 6,
      },
    ],
  };

  useEffect(() => {
    // Initialize animations
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
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    loadUserProgress();
  }, []);

  const loadUserProgress = useCallback(async () => {
    try {
      // Simulate API call
      console.log('Loading biomechanics progress...');
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

  const handleModuleSelect = (module) => {
    setSelectedModule(module);
    setModalVisible(true);
    Vibration.vibrate(50);
  };

  const startLearningModule = (module) => {
    setModalVisible(false);
    Alert.alert(
      '🧠 Biomechanics Learning',
      `Starting "${module.name}" module. This will include interactive diagrams, video demonstrations, practical exercises, and formula applications.`,
      [
        {
          text: 'Start Learning! 🚀',
          onPress: () => {
            setTotalPoints(prev => prev + module.points);
            setCompletedModules(prev => new Set([...prev, module.id]));
            navigation.navigate('BiomechanicsModule', { module });
          },
        },
      ]
    );
  };

  const getFilteredModules = () => {
    if (selectedCategory === 'all') {
      return biomechanicsModules;
    }
    return { [selectedCategory]: biomechanicsModules[selectedCategory] || [] };
  };

  const getOverallProgress = () => {
    const totalModules = Object.values(biomechanicsModules).flat().length;
    const completed = completedModules.size;
    return totalModules > 0 ? (completed / totalModules) * 100 : 0;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return COLORS.success;
      case 'Intermediate': return COLORS.warning;
      case 'Advanced': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.biomechanic, COLORS.kinetic]}
      style={{
        padding: SPACING.lg,
        paddingTop: StatusBar.currentHeight + SPACING.lg,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flex: 1 }}>
          <Text style={[TEXT_STYLES.header, { color: 'white', marginBottom: SPACING.xs }]}>
            ⚙️ Biomechanics Lab
          </Text>
          <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
            Master movement science & mechanics
          </Text>
        </View>
        <Surface style={{ borderRadius: 20, padding: SPACING.md }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.biomechanic }]}>Level {currentLevel}</Text>
            <Text style={[TEXT_STYLES.subheader, { color: COLORS.biomechanic }]}>{totalPoints} XP</Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.accent }]}>{currentStreak} day streak 🔥</Text>
          </View>
        </Surface>
      </View>

      <View style={{ marginTop: SPACING.lg }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs }}>
          <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
            Progress: {Math.round(getOverallProgress())}% Complete
          </Text>
          <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
            {completedModules.size}/{Object.values(biomechanicsModules).flat().length} modules
          </Text>
        </View>
        <ProgressBar
          progress={getOverallProgress() / 100}
          color="rgba(255,255,255,0.9)"
          style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10 }}
        />
      </View>
    </LinearGradient>
  );

  const renderSearchAndCategories = () => (
    <View style={{ padding: SPACING.md, backgroundColor: COLORS.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
        <Searchbar
          placeholder="Search biomechanics topics..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          icon="search"
          style={{ flex: 1, elevation: 2, marginRight: SPACING.sm }}
          iconColor={COLORS.biomechanic}
        />
        <IconButton
          icon={showFormulas ? 'functions' : 'functions'}
          iconColor={showFormulas ? COLORS.biomechanic : COLORS.textSecondary}
          style={{ backgroundColor: COLORS.surface }}
          onPress={() => setShowFormulas(!showFormulas)}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: SPACING.sm }}
      >
        {biomechanicsCategories.map((category, index) => (
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

  const renderModuleCard = (module, categoryKey) => {
    const isCompleted = completedModules.has(module.id);

    return (
      <Animated.View
        key={module.id}
        style={{
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim }
          ],
          marginBottom: SPACING.md,
        }}
      >
        <Card style={{ margin: SPACING.sm, elevation: 4 }}>
          <LinearGradient
            colors={[module.color + '20', 'transparent']}
            style={{ padding: SPACING.md }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.sm }}>
              <Text style={{ fontSize: 32, marginRight: SPACING.sm }}>{module.icon}</Text>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={[TEXT_STYLES.subheader, { flex: 1 }]}>{module.name}</Text>
                  {isCompleted && (
                    <Surface style={{ borderRadius: 12, padding: SPACING.xs }}>
                      <Icon name="check-circle" size={20} color={COLORS.success} />
                    </Surface>
                  )}
                </View>
                <Text style={[TEXT_STYLES.caption, { marginTop: SPACING.xs, marginBottom: SPACING.sm }]}>
                  {module.description}
                </Text>
              </View>
            </View>

            {showFormulas && (
              <Surface style={{ padding: SPACING.sm, borderRadius: 8, marginBottom: SPACING.sm }}>
                <Text style={[TEXT_STYLES.caption, { marginBottom: SPACING.xs }]}>Key Formula:</Text>
                <Text style={TEXT_STYLES.formula}>{module.formula}</Text>
              </Surface>
            )}

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.sm }}>
              {module.concepts.slice(0, 3).map((concept, index) => (
                <Chip
                  key={index}
                  style={{
                    marginRight: SPACING.xs,
                    marginBottom: SPACING.xs,
                    backgroundColor: module.color + '30',
                  }}
                  textStyle={{ fontSize: 11, color: module.color }}
                >
                  {concept}
                </Chip>
              ))}
              {module.concepts.length > 3 && (
                <Chip
                  style={{
                    marginRight: SPACING.xs,
                    marginBottom: SPACING.xs,
                    backgroundColor: module.color,
                  }}
                  textStyle={{ fontSize: 11, color: 'white' }}
                >
                  +{module.concepts.length - 3} more
                </Chip>
              )}
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.sm }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Chip
                  icon="school"
                  style={{
                    backgroundColor: getDifficultyColor(module.difficulty),
                    marginRight: SPACING.xs,
                  }}
                  textStyle={{ color: 'white', fontSize: 10 }}
                >
                  {module.difficulty}
                </Chip>
                <Text style={[TEXT_STYLES.caption, { marginRight: SPACING.md }]}>
                  {module.duration}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="fitness-center" size={14} color={COLORS.textSecondary} />
                <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs, marginRight: SPACING.md }]}>
                  {module.practicalExercises} exercises
                </Text>
                <Icon name="stars" size={14} color={COLORS.warning} />
                <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs }]}>
                  {module.points} XP
                </Text>
              </View>
            </View>

            <Divider style={{ marginBottom: SPACING.sm }} />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={[TEXT_STYLES.caption, { flex: 1 }]}>
                Applications: {module.applications.slice(0, 2).join(', ')}
                {module.applications.length > 2 && '...'}
              </Text>
              <Button
                mode={isCompleted ? 'outlined' : 'contained'}
                onPress={() => handleModuleSelect(module)}
                icon={isCompleted ? 'refresh' : 'play-arrow'}
                buttonColor={isCompleted ? undefined : module.color}
                compact
              >
                {isCompleted ? 'Review' : 'Learn'}
              </Button>
            </View>
          </LinearGradient>
        </Card>
      </Animated.View>
    );
  };

  const renderModulesGrid = () => {
    const filteredModules = getFilteredModules();

    return (
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.biomechanic]}
            tintColor={COLORS.biomechanic}
          />
        }
      >
        {Object.entries(filteredModules).map(([categoryKey, modules]) => (
          <View key={categoryKey}>
            {selectedCategory === 'all' && (
              <Text style={[TEXT_STYLES.subheader, { 
                padding: SPACING.md, 
                paddingBottom: SPACING.sm,
                textTransform: 'capitalize',
                color: biomechanicsCategories.find(c => c.id === categoryKey)?.color || COLORS.text
              }]}>
                {biomechanicsCategories.find(c => c.id === categoryKey)?.name || categoryKey}
              </Text>
            )}
            {modules.map(module => renderModuleCard(module, categoryKey))}
          </View>
        ))}
      </ScrollView>
    );
  };

  const renderModuleModal = () => (
    <Portal>
      <Modal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        contentContainerStyle={{
          backgroundColor: COLORS.surface,
          margin: SPACING.lg,
          borderRadius: 16,
          maxHeight: height * 0.85,
        }}
      >
        {selectedModule && (
          <ScrollView style={{ padding: SPACING.lg }}>
            <LinearGradient
              colors={[selectedModule.color + '20', 'transparent']}
              style={{ padding: SPACING.md, borderRadius: 12, marginBottom: SPACING.lg }}
            >
              <View style={{ alignItems: 'center', marginBottom: SPACING.md }}>
                <Text style={{ fontSize: 48, marginBottom: SPACING.sm }}>
                  {selectedModule.icon}
                </Text>
                <Text style={TEXT_STYLES.header}>{selectedModule.name}</Text>
                <Text style={[TEXT_STYLES.caption, { textAlign: 'center', marginTop: SPACING.sm }]}>
                  {selectedModule.description}
                </Text>
              </View>

              <Surface style={{ padding: SPACING.md, borderRadius: 8, marginBottom: SPACING.md }}>
                <Text style={[TEXT_STYLES.subheader, { marginBottom: SPACING.sm, color: selectedModule.color }]}>
                  🧮 Key Formula
                </Text>
                <Text style={[TEXT_STYLES.formula, { fontSize: 16 }]}>{selectedModule.formula}</Text>
              </Surface>
            </LinearGradient>

            <Surface style={{ padding: SPACING.md, borderRadius: 12, marginBottom: SPACING.lg }}>
              <Text style={[TEXT_STYLES.subheader, { marginBottom: SPACING.sm }]}>
                📚 Core Concepts
              </Text>
              {selectedModule.concepts.map((concept, index) => (
                <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs }}>
                  <Icon name="lightbulb" size={16} color={selectedModule.color} />
                  <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.sm }]}>{concept}</Text>
                </View>
              ))}
            </Surface>

            <Surface style={{ padding: SPACING.md, borderRadius: 12, marginBottom: SPACING.lg }}>
              <Text style={[TEXT_STYLES.subheader, { marginBottom: SPACING.sm }]}>
                🎯 Real-World Applications
              </Text>
              {selectedModule.applications.map((application, index) => (
                <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs }}>
                  <Icon name="fitness-center" size={16} color={COLORS.success} />
                  <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.sm }]}>{application}</Text>
                </View>
              ))}
            </Surface>

            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: SPACING.lg }}>
              <View style={{ alignItems: 'center' }}>
                <Icon name="schedule" size={28} color={selectedModule.color} />
                <Text style={TEXT_STYLES.caption}>Duration</Text>
                <Text style={TEXT_STYLES.body}>{selectedModule.duration}</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Icon name="school" size={28} color={getDifficultyColor(selectedModule.difficulty)} />
                <Text style={TEXT_STYLES.caption}>Level</Text>
                <Text style={TEXT_STYLES.body}>{selectedModule.difficulty}</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Icon name="fitness-center" size={28} color={COLORS.accent} />
                <Text style={TEXT_STYLES.caption}>Exercises</Text>
                <Text style={TEXT_STYLES.body}>{selectedModule.practicalExercises}</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Icon name="jump-rope" size={28} color={COLORS.warning} />
                <Text style={TEXT_STYLES.caption}>Reward</Text>
                <Text style={TEXT_STYLES.body}>{selectedModule.points} XP</Text>
              </View>
            </View>

            <Button
              mode="contained"
              onPress={() => startLearningModule(selectedModule)}
              icon="play-arrow"
              buttonColor={selectedModule.color}
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
      {renderModulesGrid()}
      {renderModuleModal()}

      <FAB
        icon="calculate"
        style={{
          position: 'absolute',
          margin: SPACING.lg,
          right: 0,
          bottom: 80,
          backgroundColor: COLORS.biomechanic,
        }}
        color="white"
        onPress={() => {
          Alert.alert(
            '🧮 Biomechanics Calculator',
            'Access interactive calculators for force, power, velocity, and other biomechanical measurements. Perfect for real-world applications!',
            [
              {
                text: 'Open Calculator! 📱',
                onPress: () => navigation.navigate('BiomechanicsCalculator'),
              },
            ]
          );
        }}
      />

      <FAB
        icon="slow-motion-video"
        style={{
          position: 'absolute',
          margin: SPACING.lg,
          right: 80,
          bottom: 80,
          backgroundColor: COLORS.kinetic,
        }}
        color="white"
        onPress={() => {
          Alert.alert(
            '🎬 Movement Analysis Lab',
            'Access video analysis tools for biomechanical assessment. Upload videos and get detailed movement breakdowns with angle measurements and force vectors.',
            [
              {
                text: 'Open Lab! 🔬',
                onPress: () => navigation.navigate('MovementAnalysisLab'),
              },
            ]
          );
        }}
      />
    </View>
  );
};

export default BiomechanicsLearning;