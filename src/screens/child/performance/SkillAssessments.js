import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Alert,
  Animated,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  Vibration,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import {
  Card,
  Button,
  Chip,
  ProgressBar,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Portal,
  Searchbar,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '@react-native-blur/blur';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const SkillsAssessment = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, assessments, loading, error } = useSelector(state => state.performance);
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [currentAssessment, setCurrentAssessment] = useState(null);
  const [completedSkills, setCompletedSkills] = useState(new Set());
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // Mock data for demonstration
  const skillCategories = [
    { id: 'all', name: 'All Skills', icon: 'apps', color: COLORS.primary },
    { id: 'technical', name: 'Technical', icon: 'build', color: '#e74c3c' },
    { id: 'physical', name: 'Physical', icon: 'fitness-center', color: '#f39c12' },
    { id: 'tactical', name: 'Tactical', icon: 'psychology', color: '#9b59b6' },
    { id: 'mental', name: 'Mental', icon: 'psychology', color: '#1abc9c' },
  ];

  const skillAssessments = [
    {
      id: 1,
      title: 'Ball Control Mastery',
      category: 'technical',
      difficulty: 'Intermediate',
      duration: '15 min',
      points: 150,
      completed: false,
      progress: 65,
      skills: ['First Touch', 'Juggling', 'Close Control', 'Receiving'],
      description: 'Test your ability to control and manipulate the ball in various situations',
      icon: '⚽',
      badge: 'gold',
    },
    {
      id: 2,
      title: 'Speed & Agility Test',
      category: 'physical',
      difficulty: 'Beginner',
      duration: '10 min',
      points: 100,
      completed: true,
      progress: 100,
      skills: ['Sprint Speed', 'Acceleration', 'Change of Direction', 'Reaction Time'],
      description: 'Measure your physical capabilities and athletic performance',
      icon: '🏃‍♂️',
      badge: 'silver',
    },
    {
      id: 3,
      title: 'Game Awareness Challenge',
      category: 'tactical',
      difficulty: 'Advanced',
      duration: '20 min',
      points: 200,
      completed: false,
      progress: 30,
      skills: ['Decision Making', 'Positioning', 'Game Reading', 'Communication'],
      description: 'Evaluate your understanding of game situations and tactical awareness',
      icon: '🧠',
      badge: 'bronze',
    },
    {
      id: 4,
      title: 'Mental Toughness Evaluation',
      category: 'mental',
      difficulty: 'Intermediate',
      duration: '12 min',
      points: 120,
      completed: false,
      progress: 0,
      skills: ['Focus', 'Confidence', 'Resilience', 'Pressure Handling'],
      description: 'Assess your mental strength and psychological readiness',
      icon: '💪',
      badge: null,
    },
  ];

  // Animation effects
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
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      // dispatch(fetchAssessments());
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh assessments');
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  // Filter assessments
  const filteredAssessments = skillAssessments.filter(assessment => {
    const matchesCategory = selectedCategory === 'all' || assessment.category === selectedCategory;
    const matchesSearch = assessment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         assessment.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Start assessment handler
  const handleStartAssessment = (assessment) => {
    Vibration.vibrate(50);
    setCurrentAssessment(assessment);
    setShowAssessmentModal(true);
  };

  // Complete skill handler
  const handleCompleteSkill = (skillId) => {
    Vibration.vibrate(100);
    setCompletedSkills(prev => new Set([...prev, skillId]));
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return '#27ae60';
      case 'Intermediate': return '#f39c12';
      case 'Advanced': return '#e74c3c';
      default: return COLORS.primary;
    }
  };

  // Get badge emoji
  const getBadgeEmoji = (badge) => {
    switch (badge) {
      case 'gold': return '🥇';
      case 'silver': return '🥈';
      case 'bronze': return '🥉';
      default: return '🎯';
    }
  };

  // Calculate overall progress
  const overallProgress = skillAssessments.reduce((acc, curr) => acc + curr.progress, 0) / skillAssessments.length;

  // Render category chip
  const renderCategoryChip = ({ item }) => (
    <Chip
      key={item.id}
      mode={selectedCategory === item.id ? 'flat' : 'outlined'}
      selected={selectedCategory === item.id}
      onPress={() => {
        setSelectedCategory(item.id);
        Vibration.vibrate(30);
      }}
      icon={item.icon}
      style={{
        marginRight: SPACING.sm,
        backgroundColor: selectedCategory === item.id ? item.color : 'transparent',
      }}
      textStyle={{
        color: selectedCategory === item.id ? 'white' : item.color,
        fontSize: 12,
        fontWeight: '600',
      }}
    >
      {item.name}
    </Chip>
  );

  // Render assessment card
  const renderAssessmentCard = (assessment, index) => (
    <Animated.View
      key={assessment.id}
      style={{
        transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        opacity: fadeAnim,
        marginBottom: SPACING.md,
      }}
    >
      <Card style={{
        marginHorizontal: SPACING.md,
        elevation: 4,
        borderRadius: 16,
      }}>
        <LinearGradient
          colors={assessment.completed ? ['#27ae60', '#2ecc71'] : ['#667eea', '#764ba2']}
          style={{
            padding: SPACING.md,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={[TEXT_STYLES.h3, { color: 'white', marginBottom: 4 }]}>
                {assessment.title} {assessment.icon}
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
                {assessment.description}
              </Text>
            </View>
            {assessment.badge && (
              <Surface style={{
                padding: 8,
                borderRadius: 20,
                backgroundColor: 'rgba(255,255,255,0.2)',
              }}>
                <Text style={{ fontSize: 20 }}>{getBadgeEmoji(assessment.badge)}</Text>
              </Surface>
            )}
          </View>
        </LinearGradient>

        <Card.Content style={{ padding: SPACING.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm }}>
            <Chip
              icon="timeline"
              compact
              style={{ backgroundColor: getDifficultyColor(assessment.difficulty) + '20' }}
              textStyle={{ color: getDifficultyColor(assessment.difficulty), fontSize: 10 }}
            >
              {assessment.difficulty}
            </Chip>
            <Chip
              icon="schedule"
              compact
              style={{ backgroundColor: COLORS.primary + '20' }}
              textStyle={{ color: COLORS.primary, fontSize: 10 }}
            >
              {assessment.duration}
            </Chip>
            <Chip
              icon="stars"
              compact
              style={{ backgroundColor: '#f39c12' + '20' }}
              textStyle={{ color: '#f39c12', fontSize: 10 }}
            >
              {assessment.points} pts
            </Chip>
          </View>

          <Text style={[TEXT_STYLES.body2, { marginBottom: SPACING.sm, fontWeight: '600' }]}>
            Skills Assessed:
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.md }}>
            {assessment.skills.map((skill, skillIndex) => (
              <Chip
                key={skillIndex}
                compact
                style={{
                  marginRight: SPACING.xs,
                  marginBottom: SPACING.xs,
                  backgroundColor: completedSkills.has(`${assessment.id}-${skillIndex}`) 
                    ? '#27ae60' + '20' 
                    : COLORS.background,
                }}
                textStyle={{
                  fontSize: 10,
                  color: completedSkills.has(`${assessment.id}-${skillIndex}`) 
                    ? '#27ae60' 
                    : COLORS.text,
                }}
                onPress={() => handleCompleteSkill(`${assessment.id}-${skillIndex}`)}
              >
                {skill} {completedSkills.has(`${assessment.id}-${skillIndex}`) ? '✅' : ''}
              </Chip>
            ))}
          </View>

          <View style={{ marginBottom: SPACING.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={[TEXT_STYLES.caption, { fontWeight: '600' }]}>Progress</Text>
              <Text style={[TEXT_STYLES.caption, { fontWeight: '600', color: COLORS.primary }]}>
                {assessment.progress}%
              </Text>
            </View>
            <ProgressBar
              progress={assessment.progress / 100}
              color={assessment.completed ? '#27ae60' : COLORS.primary}
              style={{ height: 8, borderRadius: 4 }}
            />
          </View>

          <Button
            mode={assessment.completed ? "outlined" : "contained"}
            onPress={() => handleStartAssessment(assessment)}
            style={{
              borderRadius: 25,
              paddingVertical: 4,
            }}
            labelStyle={{ fontWeight: '600' }}
            icon={assessment.completed ? "refresh" : "play-arrow"}
          >
            {assessment.completed ? "Retake Assessment" : "Start Assessment"}
          </Button>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{
          paddingTop: StatusBar.currentHeight + SPACING.lg,
          paddingBottom: SPACING.lg,
          paddingHorizontal: SPACING.md,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text style={[TEXT_STYLES.h2, { color: 'white', marginBottom: 4 }]}>
              Skills Assessment 🎯
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
              Track your progress and improve your game
            </Text>
          </View>
          <Avatar.Text
            size={50}
            label={user?.name?.charAt(0) || 'P'}
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          />
        </View>

        {/* Overall Progress */}
        <Surface style={{
          marginTop: SPACING.md,
          padding: SPACING.md,
          borderRadius: 12,
          backgroundColor: 'rgba(255,255,255,0.1)',
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text style={[TEXT_STYLES.body1, { color: 'white', fontWeight: '600' }]}>
              Overall Progress
            </Text>
            <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>
              {Math.round(overallProgress)}%
            </Text>
          </View>
          <ProgressBar
            progress={overallProgress / 100}
            color="white"
            style={{ height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.3)' }}
          />
        </Surface>
      </LinearGradient>

      {/* Search and Categories */}
      <View style={{ padding: SPACING.md }}>
        <Searchbar
          placeholder="Search skills or assessments..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={{
            marginBottom: SPACING.md,
            elevation: 2,
            borderRadius: 25,
          }}
          iconColor={COLORS.primary}
          inputStyle={{ fontSize: 14 }}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: SPACING.md }}
        >
          {skillCategories.map(renderCategoryChip)}
        </ScrollView>
      </View>

      {/* Assessments List */}
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
        showsVerticalScrollIndicator={false}
      >
        {filteredAssessments.length > 0 ? (
          <Animated.View style={{ opacity: fadeAnim }}>
            {filteredAssessments.map((assessment, index) => 
              renderAssessmentCard(assessment, index)
            )}
          </Animated.View>
        ) : (
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: SPACING.xl,
          }}>
            <Icon name="search-off" size={64} color={COLORS.textSecondary} />
            <Text style={[TEXT_STYLES.h3, { color: COLORS.textSecondary, marginTop: SPACING.md }]}>
              No assessments found
            </Text>
            <Text style={[TEXT_STYLES.body2, { color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.sm }]}>
              Try adjusting your search or category filter
            </Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.primary,
        }}
        onPress={() => {
          Vibration.vibrate(50);
          Alert.alert(
            "Custom Assessment",
            "Create your own skills assessment coming soon! 🚀",
            [{ text: "Got it!", style: "default" }]
          );
        }}
      />

      {/* Assessment Modal */}
      <Portal>
        {showAssessmentModal && currentAssessment && (
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}>
            <BlurView
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
              }}
              blurType="dark"
              blurAmount={10}
            />
            <Surface style={{
              width: width * 0.9,
              borderRadius: 20,
              padding: SPACING.lg,
              maxHeight: height * 0.8,
            }}>
              <View style={{ alignItems: 'center', marginBottom: SPACING.lg }}>
                <Text style={{ fontSize: 40, marginBottom: SPACING.sm }}>
                  {currentAssessment.icon}
                </Text>
                <Text style={[TEXT_STYLES.h2, { textAlign: 'center' }]}>
                  {currentAssessment.title}
                </Text>
                <Text style={[TEXT_STYLES.body2, { textAlign: 'center', color: COLORS.textSecondary }]}>
                  {currentAssessment.description}
                </Text>
              </View>

              <View style={{ marginBottom: SPACING.lg }}>
                <Text style={[TEXT_STYLES.body1, { fontWeight: '600', marginBottom: SPACING.sm }]}>
                  Assessment Details:
                </Text>
                <Text style={[TEXT_STYLES.body2, { marginBottom: 4 }]}>
                  ⏱️ Duration: {currentAssessment.duration}
                </Text>
                <Text style={[TEXT_STYLES.body2, { marginBottom: 4 }]}>
                  ⭐ Points: {currentAssessment.points}
                </Text>
                <Text style={[TEXT_STYLES.body2, { marginBottom: 4 }]}>
                  📊 Difficulty: {currentAssessment.difficulty}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Button
                  mode="outlined"
                  onPress={() => setShowAssessmentModal(false)}
                  style={{ flex: 1, marginRight: SPACING.sm, borderRadius: 25 }}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={() => {
                    setShowAssessmentModal(false);
                    Alert.alert(
                      "Assessment Starting! 🎯",
                      "Detailed assessment functionality coming soon!",
                      [{ text: "Awesome!", style: "default" }]
                    );
                  }}
                  style={{ flex: 1, marginLeft: SPACING.sm, borderRadius: 25 }}
                >
                  Start Now
                </Button>
              </View>
            </Surface>
          </View>
        )}
      </Portal>
    </View>
  );
};

export default SkillsAssessment;
