import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  ProgressBar,
  Avatar,
  IconButton,
  Surface,
  Portal,
  Modal,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '@react-native-blur/blur';

// Design System Imports
import { COLORS, SPACING, TEXT_STYLES } from '../styles/designSystem';
import PlaceholderScreen from '../components/PlaceholderScreen';

const { width } = Dimensions.get('window');

const ImprovementAreasScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, improvementAreas, loading } = useSelector(state => state.performance);
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [showPlanModal, setShowPlanModal] = useState(false);
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  // Mock data - replace with actual data from Redux store
  const mockImprovementAreas = [
    {
      id: 1,
      category: 'strength',
      title: 'Upper Body Strength',
      description: 'Need to improve chest, shoulder, and arm strength',
      currentLevel: 3,
      targetLevel: 7,
      progress: 40,
      priority: 'high',
      exercises: ['Push-ups', 'Pull-ups', 'Bench Press'],
      weeklyGoal: 'Complete 3 strength sessions',
      completedSessions: 2,
      totalSessions: 3,
      streak: 5,
      lastUpdated: '2024-08-25',
      coach: 'Mike Johnson',
      aiRecommendations: [
        'Focus on compound movements',
        'Increase protein intake',
        'Add 2.5kg to bench press weekly'
      ]
    },
    {
      id: 2,
      category: 'endurance',
      title: 'Cardiovascular Endurance',
      description: 'Improve stamina and aerobic capacity',
      currentLevel: 5,
      targetLevel: 8,
      progress: 60,
      priority: 'medium',
      exercises: ['Running', 'Cycling', 'Swimming'],
      weeklyGoal: 'Run 15km total distance',
      completedSessions: 3,
      totalSessions: 4,
      streak: 12,
      lastUpdated: '2024-08-24',
      coach: 'Sarah Davis',
      aiRecommendations: [
        'Incorporate interval training',
        'Monitor heart rate zones',
        'Add hill running sessions'
      ]
    },
    {
      id: 3,
      category: 'flexibility',
      title: 'Hip Mobility',
      description: 'Limited hip flexion affecting squat depth',
      currentLevel: 4,
      targetLevel: 7,
      progress: 25,
      priority: 'high',
      exercises: ['Hip Stretches', 'Yoga', 'Foam Rolling'],
      weeklyGoal: 'Daily mobility routine',
      completedSessions: 4,
      totalSessions: 7,
      streak: 3,
      lastUpdated: '2024-08-26',
      coach: 'Emma Wilson',
      aiRecommendations: [
        'Hold stretches for 30+ seconds',
        'Focus on dynamic warm-ups',
        'Consider massage therapy'
      ]
    },
    {
      id: 4,
      category: 'technique',
      title: 'Squat Form',
      description: 'Need to improve knee tracking and depth',
      currentLevel: 4,
      targetLevel: 8,
      progress: 35,
      priority: 'high',
      exercises: ['Bodyweight Squats', 'Goblet Squats', 'Wall Sits'],
      weeklyGoal: 'Practice form 5x per week',
      completedSessions: 3,
      totalSessions: 5,
      streak: 8,
      lastUpdated: '2024-08-25',
      coach: 'Mike Johnson',
      aiRecommendations: [
        'Record form videos',
        'Start with bodyweight only',
        'Focus on controlled movement'
      ]
    }
  ];

  const categories = [
    { key: 'all', label: 'All Areas', icon: 'fitness-center' },
    { key: 'strength', label: 'Strength', icon: 'fitness-center' },
    { key: 'endurance', label: 'Endurance', icon: 'directions-run' },
    { key: 'flexibility', label: 'Flexibility', icon: 'self-improvement' },
    { key: 'technique', label: 'Technique', icon: 'sports' },
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return COLORS.error;
      case 'medium': return '#FF9800';
      case 'low': return COLORS.success;
      default: return COLORS.primary;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'strength': return 'fitness-center';
      case 'endurance': return 'directions-run';
      case 'flexibility': return 'self-improvement';
      case 'technique': return 'sports';
      default: return 'trending-up';
    }
  };

  const filteredAreas = filterCategory === 'all' 
    ? mockImprovementAreas 
    : mockImprovementAreas.filter(area => area.category === filterCategory);

  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={{
        paddingTop: StatusBar.currentHeight + SPACING.lg,
        paddingHorizontal: SPACING.md,
        paddingBottom: SPACING.lg,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
        <IconButton
          icon="arrow-back"
          iconColor={COLORS.white}
          size={24}
          onPress={() => navigation.goBack()}
        />
        <Text style={[TEXT_STYLES.h2, { color: COLORS.white, flex: 1, textAlign: 'center' }]}>
          Improvement Areas 🎯
        </Text>
        <IconButton
          icon="help-outline"
          iconColor={COLORS.white}
          size={24}
          onPress={() => Alert.alert('Help', 'Track and improve your weak areas with personalized plans')}
        />
      </View>

      <Card style={{ backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: SPACING.md }}>
        <Card.Content style={{ padding: SPACING.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.white, opacity: 0.8 }]}>
                Areas to Improve
              </Text>
              <Text style={[TEXT_STYLES.h1, { color: COLORS.white }]}>
                {mockImprovementAreas.length}
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.white, opacity: 0.8 }]}>
                Average Progress
              </Text>
              <Text style={[TEXT_STYLES.h2, { color: COLORS.white }]}>
                {Math.round(mockImprovementAreas.reduce((acc, area) => acc + area.progress, 0) / mockImprovementAreas.length)}%
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.white, opacity: 0.8 }]}>
                Active Streak
              </Text>
              <Text style={[TEXT_STYLES.h2, { color: COLORS.white }]}>
                {Math.max(...mockImprovementAreas.map(area => area.streak))} days
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </LinearGradient>
  );

  const renderCategoryFilter = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ paddingVertical: SPACING.md }}
      contentContainerStyle={{ paddingHorizontal: SPACING.md }}
    >
      {categories.map((category, index) => (
        <TouchableOpacity
          key={category.key}
          onPress={() => setFilterCategory(category.key)}
          style={{ marginRight: SPACING.sm }}
        >
          <Surface
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: SPACING.md,
              paddingVertical: SPACING.sm,
              borderRadius: 20,
              backgroundColor: filterCategory === category.key ? COLORS.primary : COLORS.background,
              elevation: filterCategory === category.key ? 2 : 0,
            }}
          >
            <Icon
              name={category.icon}
              size={20}
              color={filterCategory === category.key ? COLORS.white : COLORS.text}
              style={{ marginRight: SPACING.xs }}
            />
            <Text
              style={[
                TEXT_STYLES.body,
                {
                  color: filterCategory === category.key ? COLORS.white : COLORS.text,
                  fontWeight: filterCategory === category.key ? 'bold' : 'normal',
                }
              ]}
            >
              {category.label}
            </Text>
          </Surface>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderImprovementArea = (area, index) => (
    <Animated.View
      key={area.id}
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        marginHorizontal: SPACING.md,
        marginBottom: SPACING.md,
      }}
    >
      <Card
        style={{
          backgroundColor: COLORS.white,
          elevation: 3,
          borderRadius: 15,
        }}
      >
        <Card.Content style={{ padding: SPACING.md }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
            <Surface
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: `${COLORS.primary}20`,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: SPACING.sm,
              }}
            >
              <Icon name={getCategoryIcon(area.category)} size={20} color={COLORS.primary} />
            </Surface>
            <View style={{ flex: 1 }}>
              <Text style={[TEXT_STYLES.h3, { marginBottom: 2 }]}>{area.title}</Text>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                Coach: {area.coach}
              </Text>
            </View>
            <Chip
              mode="flat"
              style={{
                backgroundColor: `${getPriorityColor(area.priority)}20`,
                borderColor: getPriorityColor(area.priority),
              }}
              textStyle={{ color: getPriorityColor(area.priority), fontSize: 12 }}
            >
              {area.priority.toUpperCase()}
            </Chip>
          </View>

          {/* Description */}
          <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.md, color: COLORS.textSecondary }]}>
            {area.description}
          </Text>

          {/* Progress Section */}
          <View style={{ marginBottom: SPACING.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xs }}>
              <Text style={TEXT_STYLES.body}>Progress</Text>
              <Text style={[TEXT_STYLES.body, { fontWeight: 'bold', color: COLORS.primary }]}>
                {area.progress}%
              </Text>
            </View>
            <ProgressBar
              progress={area.progress / 100}
              color={COLORS.primary}
              style={{ height: 8, borderRadius: 4 }}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.xs }}>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                Level {area.currentLevel}
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                Target: Level {area.targetLevel}
              </Text>
            </View>
          </View>

          {/* Weekly Goal */}
          <View style={{ marginBottom: SPACING.md }}>
            <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.xs }]}>This Week's Goal</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs }}>
              <Icon name="flag" size={16} color={COLORS.primary} style={{ marginRight: SPACING.xs }} />
              <Text style={[TEXT_STYLES.body, { flex: 1, color: COLORS.textSecondary }]}>
                {area.weeklyGoal}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ProgressBar
                progress={area.completedSessions / area.totalSessions}
                color={COLORS.success}
                style={{ flex: 1, height: 6, borderRadius: 3, marginRight: SPACING.sm }}
              />
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                {area.completedSessions}/{area.totalSessions}
              </Text>
            </View>
          </View>

          {/* Stats Row */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: SPACING.md }}>
            <View style={{ alignItems: 'center' }}>
              <Icon name="local-fire-department" size={24} color="#FF5722" />
              <Text style={[TEXT_STYLES.caption, { marginTop: 4 }]}>{area.streak} day streak</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Icon name="fitness-center" size={24} color={COLORS.primary} />
              <Text style={[TEXT_STYLES.caption, { marginTop: 4 }]}>
                {area.exercises.length} exercises
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Icon name="calendar-today" size={24} color={COLORS.success} />
              <Text style={[TEXT_STYLES.caption, { marginTop: 4 }]}>
                Updated {new Date(area.lastUpdated).toLocaleDateString()}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Button
              mode="outlined"
              onPress={() => {
                setSelectedArea(area);
                setShowPlanModal(true);
              }}
              style={{ flex: 1, marginRight: SPACING.xs }}
              contentStyle={{ paddingVertical: 4 }}
            >
              View Plan
            </Button>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('WorkoutSession', { areaId: area.id })}
              style={{ flex: 1, marginLeft: SPACING.xs }}
              contentStyle={{ paddingVertical: 4 }}
            >
              Start Training
            </Button>
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderPlanModal = () => (
    <Portal>
      <Modal
        visible={showPlanModal}
        onDismiss={() => setShowPlanModal(false)}
        contentContainerStyle={{
          backgroundColor: COLORS.white,
          margin: SPACING.lg,
          borderRadius: 15,
          padding: SPACING.lg,
          maxHeight: '80%',
        }}
      >
        {selectedArea && (
          <ScrollView>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
              <Icon name={getCategoryIcon(selectedArea.category)} size={24} color={COLORS.primary} />
              <Text style={[TEXT_STYLES.h3, { marginLeft: SPACING.sm, flex: 1 }]}>
                {selectedArea.title} Plan
              </Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setShowPlanModal(false)}
              />
            </View>

            <Text style={[TEXT_STYLES.h4, { marginBottom: SPACING.sm }]}>Exercises</Text>
            {selectedArea.exercises.map((exercise, index) => (
              <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
                <Icon name="fitness-center" size={16} color={COLORS.primary} />
                <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.sm }]}>{exercise}</Text>
              </View>
            ))}

            <Text style={[TEXT_STYLES.h4, { marginTop: SPACING.md, marginBottom: SPACING.sm }]}>
              AI Recommendations 🤖
            </Text>
            {selectedArea.aiRecommendations.map((rec, index) => (
              <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
                <Icon name="lightbulb-outline" size={16} color="#FFC107" />
                <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.sm, flex: 1 }]}>{rec}</Text>
              </View>
            ))}

            <Button
              mode="contained"
              onPress={() => {
                setShowPlanModal(false);
                navigation.navigate('WorkoutSession', { areaId: selectedArea.id });
              }}
              style={{ marginTop: SPACING.lg }}
            >
              Start Training Session
            </Button>
          </ScrollView>
        )}
      </Modal>
    </Portal>
  );

  if (loading) {
    return (
      <PlaceholderScreen
        icon="trending-up"
        title="Loading Improvement Areas"
        message="Analyzing your performance data..."
      />
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {renderHeader()}
        {renderCategoryFilter()}
        
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {filteredAreas.length > 0 ? (
            filteredAreas.map(renderImprovementArea)
          ) : (
            <View style={{ padding: SPACING.xl, alignItems: 'center' }}>
              <Icon name="jump-rope" size={64} color={COLORS.success} />
              <Text style={[TEXT_STYLES.h3, { marginTop: SPACING.md, textAlign: 'center' }]}>
                No Areas Need Improvement! 🎉
              </Text>
              <Text style={[TEXT_STYLES.body, { marginTop: SPACING.sm, textAlign: 'center', color: COLORS.textSecondary }]}>
                You're performing excellently in all areas. Keep up the great work!
              </Text>
            </View>
          )}
        </Animated.View>

        <View style={{ height: SPACING.xl }} />
      </ScrollView>

      {renderPlanModal()}
    </View>
  );
};

export default ImprovementAreasScreen;