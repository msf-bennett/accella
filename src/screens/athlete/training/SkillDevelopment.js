import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  Animated,
  Alert,
  Dimensions,
  Vibration,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Text,
  Button,
  IconButton,
  Surface,
  Portal,
  Modal,
  Chip,
  ProgressBar,
  Searchbar,
  FAB,
  Avatar,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';

// Import your design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../styles/designSystem';

const { width, height } = Dimensions.get('window');

const SkillDevelopment = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, skillProgress, currentSport, achievements } = useSelector(state => ({
    user: state.auth.user,
    skillProgress: state.training.skillProgress || {},
    currentSport: state.user.currentSport || 'Football',
    achievements: state.gamification.achievements || [],
  }));

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [practiceModalVisible, setPracticeModalVisible] = useState(false);
  const [completedDrills, setCompletedDrills] = useState(new Set());

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Mock skill data - replace with actual Redux data
  const skillCategories = [
    { id: 'all', name: 'All Skills', icon: 'sports', color: COLORS.primary },
    { id: 'technical', name: 'Technical', icon: 'precision-manufacturing', color: '#FF6B6B' },
    { id: 'tactical', name: 'Tactical', icon: 'psychology', color: '#4ECDC4' },
    { id: 'physical', name: 'Physical', icon: 'fitness-center', color: '#45B7D1' },
    { id: 'mental', name: 'Mental', icon: 'psychology-alt', color: '#96CEB4' },
  ];

  const mockSkills = [
    {
      id: '1',
      name: 'Ball Control',
      category: 'technical',
      sport: 'Football',
      level: 'Intermediate',
      progress: 65,
      xp: 650,
      maxXP: 1000,
      streak: 7,
      description: 'Master close ball control and first touch techniques',
      icon: '⚽',
      difficulty: 3,
      estimatedTime: '15-20 min',
      lastPracticed: '2024-08-23T10:30:00Z',
      totalPractices: 12,
      drills: [
        { id: 'd1', name: 'Cone Weaving', duration: '3 min', completed: false },
        { id: 'd2', name: 'First Touch Control', duration: '5 min', completed: true },
        { id: 'd3', name: 'Juggling Practice', duration: '5 min', completed: false },
        { id: 'd4', name: 'Wall Passes', duration: '7 min', completed: false },
      ],
      keyMetrics: ['Touch Quality', 'Ball Retention', 'Speed of Control'],
      tips: [
        'Keep your head up while controlling the ball',
        'Use both feet equally for better balance',
        'Practice with different ball speeds and angles',
      ],
    },
    {
      id: '2',
      name: 'Passing Accuracy',
      category: 'technical',
      sport: 'Football',
      level: 'Advanced',
      progress: 82,
      xp: 820,
      maxXP: 1000,
      streak: 3,
      description: 'Improve short and long passing precision',
      icon: '🎯',
      difficulty: 4,
      estimatedTime: '20-25 min',
      lastPracticed: '2024-08-22T16:45:00Z',
      totalPractices: 18,
      drills: [
        { id: 'd5', name: 'Target Passing', duration: '5 min', completed: true },
        { id: 'd6', name: 'Long Ball Practice', duration: '8 min', completed: false },
        { id: 'd7', name: 'One-Touch Passing', duration: '6 min', completed: true },
        { id: 'd8', name: 'Under Pressure Passing', duration: '6 min', completed: false },
      ],
      keyMetrics: ['Accuracy %', 'Pass Speed', 'Decision Making'],
      tips: [
        'Plant your supporting foot firmly',
        'Follow through in direction of target',
        'Practice with both feet regularly',
      ],
    },
    {
      id: '3',
      name: 'Game Reading',
      category: 'tactical',
      sport: 'Football',
      level: 'Beginner',
      progress: 35,
      xp: 350,
      maxXP: 1000,
      streak: 0,
      description: 'Develop tactical awareness and decision making',
      icon: '🧠',
      difficulty: 5,
      estimatedTime: '25-30 min',
      lastPracticed: '2024-08-20T14:20:00Z',
      totalPractices: 6,
      drills: [
        { id: 'd9', name: 'Position Analysis', duration: '8 min', completed: false },
        { id: 'd10', name: 'Pattern Recognition', duration: '10 min', completed: false },
        { id: 'd11', name: 'Decision Trees', duration: '7 min', completed: false },
        { id: 'd12', name: 'Video Analysis', duration: '10 min', completed: false },
      ],
      keyMetrics: ['Decision Speed', 'Correct Choices', 'Field Vision'],
      tips: [
        'Watch professional games to learn patterns',
        'Practice scanning the field regularly',
        'Think two moves ahead',
      ],
    },
    {
      id: '4',
      name: 'Sprint Speed',
      category: 'physical',
      sport: 'Football',
      level: 'Intermediate',
      progress: 58,
      xp: 580,
      maxXP: 1000,
      streak: 12,
      description: 'Improve acceleration and top speed',
      icon: '💨',
      difficulty: 3,
      estimatedTime: '15-20 min',
      lastPracticed: '2024-08-23T08:15:00Z',
      totalPractices: 15,
      drills: [
        { id: 'd13', name: 'Sprint Intervals', duration: '6 min', completed: true },
        { id: 'd14', name: 'Acceleration Drills', duration: '5 min', completed: true },
        { id: 'd15', name: 'Flying Sprints', duration: '4 min', completed: false },
        { id: 'd16', name: 'Hill Sprints', duration: '5 min', completed: false },
      ],
      keyMetrics: ['40-yard Time', 'Acceleration', 'Top Speed'],
      tips: [
        'Focus on proper running form',
        'Drive with your arms for momentum',
        'Practice explosive starts',
      ],
    },
    {
      id: '5',
      name: 'Mental Focus',
      category: 'mental',
      sport: 'Football',
      level: 'Beginner',
      progress: 28,
      xp: 280,
      maxXP: 1000,
      streak: 2,
      description: 'Build concentration and mental resilience',
      icon: '🎯',
      difficulty: 2,
      estimatedTime: '10-15 min',
      lastPracticed: '2024-08-23T19:00:00Z',
      totalPractices: 4,
      drills: [
        { id: 'd17', name: 'Breathing Exercises', duration: '3 min', completed: true },
        { id: 'd18', name: 'Visualization', duration: '5 min', completed: false },
        { id: 'd19', name: 'Pressure Scenarios', duration: '4 min', completed: false },
        { id: 'd20', name: 'Mindfulness Practice', duration: '3 min', completed: false },
      ],
      keyMetrics: ['Focus Duration', 'Stress Response', 'Confidence Level'],
      tips: [
        'Practice daily meditation',
        'Visualize successful outcomes',
        'Use positive self-talk',
      ],
    },
  ];

  useEffect(() => {
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

    loadSkillData();
  }, []);

  const loadSkillData = useCallback(async () => {
    try {
      // Load user's skill progress and achievements
      // dispatch(fetchSkillProgress(user.id));
      Alert.alert(
        'Feature in Development',
        'Skill development tracking will sync with your training plans. Advanced analytics coming soon!',
        [{ text: 'OK', style: 'default' }]
      );
    } catch (error) {
      console.error('Error loading skill data:', error);
    }
  }, [user]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSkillData();
    setRefreshing(false);
  }, [loadSkillData]);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const filteredSkills = mockSkills.filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         skill.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || skill.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getLevelColor = (level) => {
    switch (level) {
      case 'Beginner': return COLORS.success;
      case 'Intermediate': return COLORS.secondary;
      case 'Advanced': return COLORS.primary;
      case 'Expert': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const getDifficultyStars = (difficulty) => {
    return '★'.repeat(difficulty) + '☆'.repeat(5 - difficulty);
  };

  const formatLastPracticed = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const startPractice = (skill) => {
    setSelectedSkill(skill);
    setPracticeModalVisible(true);
    startPulseAnimation();
  };

  const completeDrill = (drillId) => {
    const newCompleted = new Set(completedDrills);
    if (newCompleted.has(drillId)) {
      newCompleted.delete(drillId);
    } else {
      newCompleted.add(drillId);
      Vibration.vibrate(100);
    }
    setCompletedDrills(newCompleted);
  };

  const finishPractice = () => {
    if (selectedSkill) {
      const completedDrillsCount = selectedSkill.drills.filter(drill => 
        completedDrills.has(drill.id)
      ).length;
      
      const xpGained = completedDrillsCount * 25;
      
      Alert.alert(
        '🎉 Great Practice!',
        `You completed ${completedDrillsCount}/${selectedSkill.drills.length} drills and earned ${xpGained} XP!`,
        [
          {
            text: 'Continue Training',
            onPress: () => {
              // Update skill progress
              dispatch({
                type: 'training/updateSkillProgress',
                payload: {
                  skillId: selectedSkill.id,
                  completedDrills: Array.from(completedDrills),
                  xpGained,
                  practiceDate: new Date().toISOString(),
                },
              });
              
              setPracticeModalVisible(false);
              setCompletedDrills(new Set());
              setSelectedSkill(null);
            },
          },
        ]
      );
    }
  };

  const renderSkillCard = (skill) => (
    <Animated.View
      key={skill.id}
      style={[
        styles.skillCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={() => {
          setSelectedSkill(skill);
          setModalVisible(true);
        }}
        activeOpacity={0.9}
      >
        <Card style={styles.card} elevation={4}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.primary + '80']}
            style={styles.cardHeader}
          >
            <View style={styles.cardHeaderContent}>
              <View style={styles.skillIcon}>
                <Text style={styles.skillEmoji}>{skill.icon}</Text>
              </View>
              <View style={styles.skillHeaderInfo}>
                <Text style={styles.skillName}>{skill.name}</Text>
                <View style={styles.skillMeta}>
                  <Chip
                    mode="flat"
                    style={[styles.levelChip, { backgroundColor: getLevelColor(skill.level) + '20' }]}
                    textStyle={[styles.levelText, { color: getLevelColor(skill.level) }]}
                    compact
                  >
                    {skill.level}
                  </Chip>
                  <Text style={styles.difficultyText}>
                    {getDifficultyStars(skill.difficulty)}
                  </Text>
                </View>
              </View>
              {skill.streak > 0 && (
                <View style={styles.streakBadge}>
                  <Icon name="local-fire-department" size={16} color="#FF4444" />
                  <Text style={styles.streakText}>{skill.streak}</Text>
                </View>
              )}
            </View>
          </LinearGradient>

          <Card.Content style={styles.cardContent}>
            <Text style={styles.skillDescription}>{skill.description}</Text>
            
            <View style={styles.progressSection}>
              <View style={styles.progressInfo}>
                <Text style={styles.progressLabel}>Progress</Text>
                <Text style={styles.progressXP}>
                  {skill.xp}/{skill.maxXP} XP
                </Text>
              </View>
              <ProgressBar
                progress={skill.progress / 100}
                color={COLORS.success}
                style={styles.progressBar}
              />
              <Text style={styles.progressPercentage}>{skill.progress}% Complete</Text>
            </View>

            <View style={styles.skillStats}>
              <View style={styles.statItem}>
                <Icon name="schedule" size={16} color={COLORS.textSecondary} />
                <Text style={styles.statText}>{skill.estimatedTime}</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="repeat" size={16} color={COLORS.textSecondary} />
                <Text style={styles.statText}>{skill.totalPractices} sessions</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="access-time" size={16} color={COLORS.textSecondary} />
                <Text style={styles.statText}>{formatLastPracticed(skill.lastPracticed)}</Text>
              </View>
            </View>

            <Button
              mode="contained"
              onPress={() => startPractice(skill)}
              style={styles.practiceButton}
              contentStyle={styles.practiceButtonContent}
              icon="play-arrow"
            >
              Start Practice
            </Button>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderCategoryFilters = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      style={styles.categoryContainer}
      contentContainerStyle={styles.categoryContent}
    >
      {skillCategories.map((category) => (
        <TouchableOpacity
          key={category.id}
          onPress={() => setSelectedCategory(category.id)}
          style={[
            styles.categoryChip,
            selectedCategory === category.id && styles.selectedCategoryChip,
            { borderColor: category.color }
          ]}
        >
          <Icon 
            name={category.icon} 
            size={20} 
            color={selectedCategory === category.id ? 'white' : category.color} 
          />
          <Text style={[
            styles.categoryText,
            selectedCategory === category.id && styles.selectedCategoryText,
            { color: selectedCategory === category.id ? 'white' : category.color }
          ]}>
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderSkillModal = () => (
    <Portal>
      <Modal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType="light"
          blurAmount={5}
          reducedTransparencyFallbackColor="white"
        />
        {selectedSkill && (
          <Card style={styles.modalCard}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.primary + '60']}
              style={styles.modalHeader}
            >
              <View style={styles.modalHeaderContent}>
                <Text style={styles.modalTitle}>{selectedSkill.name}</Text>
                <IconButton
                  icon="close"
                  iconColor="white"
                  size={24}
                  onPress={() => setModalVisible(false)}
                />
              </View>
            </LinearGradient>
            <ScrollView style={styles.modalContent}>
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Key Metrics</Text>
                {selectedSkill.keyMetrics.map((metric, index) => (
                  <Text key={index} style={styles.modalListItem}>• {metric}</Text>
                ))}
              </View>
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Pro Tips</Text>
                {selectedSkill.tips.map((tip, index) => (
                  <Text key={index} style={styles.modalListItem}>💡 {tip}</Text>
                ))}
              </View>
              <Button
                mode="contained"
                onPress={() => {
                  setModalVisible(false);
                  startPractice(selectedSkill);
                }}
                style={styles.modalButton}
                icon="play-arrow"
              >
                Start Practice Session
              </Button>
            </ScrollView>
          </Card>
        )}
      </Modal>
    </Portal>
  );

  const renderPracticeModal = () => (
    <Portal>
      <Modal
        visible={practiceModalVisible}
        onDismiss={() => setPracticeModalVisible(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType="light"
          blurAmount={5}
          reducedTransparencyFallbackColor="white"
        />
        {selectedSkill && (
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Card style={styles.practiceModalCard}>
              <LinearGradient
                colors={[COLORS.success, COLORS.success + '60']}
                style={styles.modalHeader}
              >
                <View style={styles.modalHeaderContent}>
                  <Text style={styles.modalTitle}>Practice Session</Text>
                  <IconButton
                    icon="close"
                    iconColor="white"
                    size={24}
                    onPress={() => setPracticeModalVisible(false)}
                  />
                </View>
                <Text style={styles.practiceSubtitle}>{selectedSkill.name}</Text>
              </LinearGradient>
              <ScrollView style={styles.modalContent}>
                <Text style={styles.drillsTitle}>Complete the drills below:</Text>
                {selectedSkill.drills.map((drill) => (
                  <TouchableOpacity
                    key={drill.id}
                    onPress={() => completeDrill(drill.id)}
                    style={[
                      styles.drillItem,
                      completedDrills.has(drill.id) && styles.completedDrill
                    ]}
                  >
                    <View style={styles.drillContent}>
                      <Icon 
                        name={completedDrills.has(drill.id) ? "check-circle" : "radio-button-unchecked"} 
                        size={24} 
                        color={completedDrills.has(drill.id) ? COLORS.success : COLORS.textSecondary} 
                      />
                      <View style={styles.drillInfo}>
                        <Text style={[
                          styles.drillName,
                          completedDrills.has(drill.id) && styles.completedDrillText
                        ]}>
                          {drill.name}
                        </Text>
                        <Text style={styles.drillDuration}>{drill.duration}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
                <Button
                  mode="contained"
                  onPress={finishPractice}
                  style={styles.finishButton}
                  icon="check"
                  disabled={completedDrills.size === 0}
                >
                  Finish Practice
                </Button>
              </ScrollView>
            </Card>
          </Animated.View>
        )}
      </Modal>
    </Portal>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="psychology" size={80} color={COLORS.textSecondary} />
      <Text style={styles.emptyStateTitle}>No Skills Found</Text>
      <Text style={styles.emptyStateText}>
        Try adjusting your search or category filter
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Skill Development 🚀</Text>
          <Text style={styles.headerSubtitle}>
            Master your {currentSport} skills
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search skills..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={COLORS.primary}
          inputStyle={styles.searchInput}
        />
      </View>

      {renderCategoryFilters()}

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary, COLORS.secondary]}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredSkills.length === 0 ? (
          renderEmptyState()
        ) : (
          filteredSkills.map(skill => renderSkillCard(skill))
        )}
      </ScrollView>

      {renderSkillModal()}
      {renderPracticeModal()}

      <FAB
        style={styles.fab}
        icon="add"
        onPress={() => navigation.navigate('CreateCustomSkill')}
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
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: 'white',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'white',
    opacity: 0.9,
    marginTop: SPACING.xs,
  },
  searchContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  searchBar: {
    elevation: 4,
    borderRadius: 25,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  categoryContainer: {
    paddingVertical: SPACING.sm,
  },
  categoryContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    borderWidth: 2,
    backgroundColor: 'white',
    marginRight: SPACING.sm,
    gap: SPACING.xs,
  },
  selectedCategoryChip: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    ...TEXT_STYLES.caption,
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: 'white',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl * 2,
  },
  skillCard: {
    marginBottom: SPACING.md,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: SPACING.md,
  },
  cardHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skillIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  skillEmoji: {
    fontSize: 24,
  },
  skillHeaderInfo: {
    flex: 1,
  },
  skillName: {
    ...TEXT_STYLES.h3,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  skillMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  levelChip: {
    height: 24,
  },
  levelText: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    fontSize: 10,
  },
  difficultyText: {
    ...TEXT_STYLES.caption,
    color: '#FFD700',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    gap: SPACING.xs,
  },
  streakText: {
    ...TEXT_STYLES.caption,
    color: 'white',
    fontWeight: 'bold',
  },
  cardContent: {
    padding: SPACING.md,
  },
  skillDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  progressSection: {
    marginBottom: SPACING.md,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  progressLabel: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  progressXP: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.xs,
  },
  progressPercentage: {
    ...TEXT_STYLES.caption,
    color: COLORS.success,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  skillStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  practiceButton: {
    borderRadius: 20,
  },
  practiceButtonContent: {
    paddingVertical: SPACING.xs,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyStateTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptyStateText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  modalCard: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  practiceModalCard: {
    width: width * 0.9,
    maxHeight: height * 0.7,
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    padding: SPACING.md,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: 'bold',
    flex: 1,
  },
  practiceSubtitle: {
    ...TEXT_STYLES.body,
    color: 'white',
    opacity: 0.9,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  modalContent: {
    padding: SPACING.lg,
    maxHeight: height * 0.5,
  },
  modalSection: {
    marginBottom: SPACING.lg,
  },
  modalSectionTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  modalListItem: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    paddingLeft: SPACING.sm,
  },
  modalButton: {
    borderRadius: 25,
    marginTop: SPACING.md,
  },
  drillsTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
  },
  drillItem: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  completedDrill: {
    backgroundColor: COLORS.success + '10',
    borderColor: COLORS.success,
  },
  drillContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  drillInfo: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  drillName: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: '500',
    marginBottom: SPACING.xs,
  },
  completedDrillText: {
    color: COLORS.success,
    textDecorationLine: 'line-through',
  },
  drillDuration: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  finishButton: {
    borderRadius: 25,
    marginTop: SPACING.lg,
  },
});

export default SkillDevelopment;