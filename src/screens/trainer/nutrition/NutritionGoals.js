import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
  Alert,
  Animated,
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
  TextInput,
  Portal,
  Modal,
  RadioButton,
  Slider,
  Switch,
  Divider,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '@react-native-blur/ios';

// Design system imports
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4ade80',
  error: '#ef4444',
  warning: '#f59e0b',
  background: '#f8fafc',
  surface: '#ffffff',
  text: '#1e293b',
  textSecondary: '#64748b',
  border: '#e2e8f0',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 32, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  bodySecondary: { fontSize: 14, color: COLORS.textSecondary },
  caption: { fontSize: 12, color: COLORS.textSecondary },
};

const { width, height } = Dimensions.get('window');

const NutritionalGoals = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  
  const [refreshing, setRefreshing] = useState(false);
  const [goalSetupModal, setGoalSetupModal] = useState(false);
  const [editGoalModal, setEditGoalModal] = useState(false);
  const [progressDetailModal, setProgressDetailModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [activeTimeframe, setActiveTimeframe] = useState('daily');
  
  // Goal setup states
  const [goalType, setGoalType] = useState('weight_loss');
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [customCalories, setCustomCalories] = useState('2000');
  const [proteinPercentage, setProteinPercentage] = useState(30);
  const [carbPercentage, setCarbPercentage] = useState(40);
  const [fatPercentage, setFatPercentage] = useState(30);
  const [waterGoal, setWaterGoal] = useState(2.5);
  const [fiberGoal, setFiberGoal] = useState(25);
  
  // User profile for calculations
  const [userProfile, setUserProfile] = useState({
    age: 28,
    weight: 75,
    height: 175,
    gender: 'male',
    bodyFat: 15,
  });
  
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // Current nutritional goals
  const [currentGoals, setCurrentGoals] = useState({
    calories: { target: 2200, consumed: 1850, unit: 'kcal' },
    protein: { target: 165, consumed: 142, unit: 'g' },
    carbs: { target: 220, consumed: 185, unit: 'g' },
    fat: { target: 73, consumed: 68, unit: 'g' },
    fiber: { target: 25, consumed: 18, unit: 'g' },
    water: { target: 2.5, consumed: 1.8, unit: 'L' },
    sodium: { target: 2300, consumed: 1850, unit: 'mg' },
    sugar: { target: 50, consumed: 35, unit: 'g' },
  });

  // Weekly progress data
  const [weeklyProgress, setWeeklyProgress] = useState({
    calories: [95, 102, 88, 110, 92, 98, 84],
    protein: [89, 95, 82, 105, 88, 92, 78],
    carbs: [102, 98, 85, 115, 95, 102, 82],
    fat: [85, 92, 78, 98, 85, 88, 75],
  });

  // Goal presets
  const goalPresets = [
    {
      id: 'weight_loss',
      name: 'Weight Loss',
      icon: 'trending-down',
      color: COLORS.error,
      description: 'Moderate caloric deficit for sustainable fat loss',
      macros: { protein: 35, carbs: 30, fat: 35 },
      calorieMultiplier: 0.8,
    },
    {
      id: 'muscle_gain',
      name: 'Muscle Gain',
      icon: 'fitness-center',
      color: COLORS.success,
      description: 'Caloric surplus optimized for lean muscle growth',
      macros: { protein: 30, carbs: 45, fat: 25 },
      calorieMultiplier: 1.15,
    },
    {
      id: 'maintenance',
      name: 'Maintenance',
      icon: 'balance',
      color: COLORS.primary,
      description: 'Balanced nutrition to maintain current weight',
      macros: { protein: 25, carbs: 45, fat: 30 },
      calorieMultiplier: 1.0,
    },
    {
      id: 'performance',
      name: 'Athletic Performance',
      icon: 'sports',
      color: COLORS.warning,
      description: 'High carb intake for optimal training performance',
      macros: { protein: 25, carbs: 55, fat: 20 },
      calorieMultiplier: 1.2,
    },
    {
      id: 'custom',
      name: 'Custom Goals',
      icon: 'tune',
      color: COLORS.secondary,
      description: 'Set your own targets based on specific needs',
      macros: { protein: 30, carbs: 40, fat: 30 },
      calorieMultiplier: 1.0,
    },
  ];

  const activityLevels = [
    { id: 'sedentary', name: 'Sedentary', multiplier: 1.2, description: 'Little to no exercise' },
    { id: 'light', name: 'Lightly Active', multiplier: 1.375, description: '1-3 days/week light exercise' },
    { id: 'moderate', name: 'Moderately Active', multiplier: 1.55, description: '3-5 days/week moderate exercise' },
    { id: 'very', name: 'Very Active', multiplier: 1.725, description: '6-7 days/week intense exercise' },
    { id: 'extra', name: 'Extra Active', multiplier: 1.9, description: 'Physical job + daily exercise' },
  ];

  const achievements = [
    { id: 1, title: 'Goal Getter', description: 'Set your first nutritional goal', icon: 'flag', earned: true },
    { id: 2, title: 'Consistent Tracker', description: 'Track nutrition for 7 days straight', icon: 'streak', earned: true },
    { id: 3, title: 'Macro Master', description: 'Hit all macros within 5% for 3 days', icon: 'bullseye', earned: false },
    { id: 4, title: 'Hydration Hero', description: 'Meet water goal for 14 days', icon: 'water-drop', earned: true },
    { id: 5, title: 'Protein Pro', description: 'Exceed protein goal 10 times', icon: 'egg', earned: false },
    { id: 6, title: 'Fiber Focus', description: 'Meet fiber goal for 30 days', icon: 'eco', earned: false },
  ];

  useEffect(() => {
    // Initialize animations
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Load saved goals
    loadNutritionalGoals();
  }, []);

  const loadNutritionalGoals = async () => {
    try {
      // Implementation for loading goals from AsyncStorage
      // const goals = await AsyncStorage.getItem('nutritionalGoals');
      // setCurrentGoals(goals ? JSON.parse(goals) : currentGoals);
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call to refresh progress data
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const calculateBMR = () => {
    const { weight, height, age, gender } = userProfile;
    
    if (gender === 'male') {
      return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
  };

  const calculateTDEE = () => {
    const bmr = calculateBMR();
    const activityMultiplier = activityLevels.find(level => level.id === activityLevel)?.multiplier || 1.55;
    return Math.round(bmr * activityMultiplier);
  };

  const calculateMacros = (calories, proteinPct, carbPct, fatPct) => {
    return {
      protein: Math.round((calories * (proteinPct / 100)) / 4),
      carbs: Math.round((calories * (carbPct / 100)) / 4),
      fat: Math.round((calories * (fatPct / 100)) / 9),
    };
  };

  const handleGoalSetup = () => {
    const selectedPreset = goalPresets.find(preset => preset.id === goalType);
    const tdee = calculateTDEE();
    const targetCalories = goalType === 'custom' 
      ? parseInt(customCalories) 
      : Math.round(tdee * selectedPreset.calorieMultiplier);
    
    const macros = calculateMacros(
      targetCalories,
      goalType === 'custom' ? proteinPercentage : selectedPreset.macros.protein,
      goalType === 'custom' ? carbPercentage : selectedPreset.macros.carbs,
      goalType === 'custom' ? fatPercentage : selectedPreset.macros.fat
    );

    const newGoals = {
      ...currentGoals,
      calories: { ...currentGoals.calories, target: targetCalories },
      protein: { ...currentGoals.protein, target: macros.protein },
      carbs: { ...currentGoals.carbs, target: macros.carbs },
      fat: { ...currentGoals.fat, target: macros.fat },
      water: { ...currentGoals.water, target: waterGoal },
      fiber: { ...currentGoals.fiber, target: fiberGoal },
    };

    setCurrentGoals(newGoals);
    setGoalSetupModal(false);
    
    Alert.alert(
      'Goals Updated! 🎯',
      `Your nutritional targets have been set based on your ${selectedPreset.name.toLowerCase()} goals.`,
      [{ text: 'Great!', onPress: () => Vibration.vibrate(100) }]
    );
  };

  const getProgressColor = (current, target) => {
    const percentage = (current / target) * 100;
    if (percentage >= 95 && percentage <= 105) return COLORS.success;
    if (percentage >= 80 && percentage <= 120) return COLORS.warning;
    return COLORS.error;
  };

  const renderNutrientCard = (nutrientKey) => {
    const nutrient = currentGoals[nutrientKey];
    const progress = nutrient.consumed / nutrient.target;
    const percentage = Math.round(progress * 100);
    const remaining = Math.max(0, nutrient.target - nutrient.consumed);
    
    return (
      <Card 
        key={nutrientKey}
        style={styles.nutrientCard} 
        onPress={() => {
          setSelectedGoal({ key: nutrientKey, ...nutrient });
          setProgressDetailModal(true);
        }}
      >
        <Card.Content>
          <View style={styles.nutrientHeader}>
            <View style={styles.nutrientInfo}>
              <Text style={[TEXT_STYLES.h3, { textTransform: 'capitalize' }]}>
                {nutrientKey}
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: getProgressColor(nutrient.consumed, nutrient.target) }]}>
                {percentage}% of goal
              </Text>
            </View>
            <View style={styles.nutrientIcon}>
              <Icon 
                name={getNutrientIcon(nutrientKey)} 
                size={24} 
                color={getProgressColor(nutrient.consumed, nutrient.target)} 
              />
            </View>
          </View>
          
          <View style={styles.nutrientProgress}>
            <View style={styles.progressNumbers}>
              <Text style={TEXT_STYLES.body}>
                <Text style={{ fontWeight: 'bold' }}>{nutrient.consumed}</Text>
                <Text style={{ color: COLORS.textSecondary }}> / {nutrient.target} {nutrient.unit}</Text>
              </Text>
              {remaining > 0 && (
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                  {remaining.toFixed(1)} {nutrient.unit} remaining
                </Text>
              )}
            </View>
            <ProgressBar
              progress={Math.min(progress, 1)}
              color={getProgressColor(nutrient.consumed, nutrient.target)}
              style={styles.progressBar}
            />
          </View>
          
          {progress > 1 && (
            <View style={styles.overageIndicator}>
              <Icon name="warning" size={16} color={COLORS.warning} />
              <Text style={[TEXT_STYLES.caption, { marginLeft: 4, color: COLORS.warning }]}>
                {((progress - 1) * 100).toFixed(0)}% over target
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  const getNutrientIcon = (nutrient) => {
    const icons = {
      calories: 'local-fire-department',
      protein: 'egg',
      carbs: 'grain',
      fat: 'opacity',
      fiber: 'eco',
      water: 'water-drop',
      sodium: 'grain',
      sugar: 'cake',
    };
    return icons[nutrient] || 'circle';
  };

  const renderGoalPreset = (preset) => (
    <TouchableOpacity
      key={preset.id}
      style={[
        styles.presetCard,
        goalType === preset.id && { borderColor: preset.color, borderWidth: 2 }
      ]}
      onPress={() => {
        setGoalType(preset.id);
        Vibration.vibrate(50);
      }}
    >
      <View style={[styles.presetIcon, { backgroundColor: preset.color }]}>
        <Icon name={preset.icon} size={24} color={COLORS.surface} />
      </View>
      <Text style={[TEXT_STYLES.body, { fontWeight: '600', marginTop: SPACING.sm }]}>
        {preset.name}
      </Text>
      <Text style={[TEXT_STYLES.caption, { textAlign: 'center', marginTop: SPACING.xs }]}>
        {preset.description}
      </Text>
      {goalType === preset.id && (
        <View style={styles.selectedIndicator}>
          <Icon name="check-circle" size={20} color={preset.color} />
        </View>
      )}
    </TouchableOpacity>
  );

  const renderAchievementBadge = (achievement) => (
    <Surface 
      key={achievement.id}
      style={[styles.achievementBadge, achievement.earned && styles.achievementEarned]}
    >
      <Icon 
        name={achievement.icon} 
        size={32} 
        color={achievement.earned ? COLORS.warning : COLORS.textSecondary} 
      />
      <Text style={[TEXT_STYLES.caption, { marginTop: SPACING.xs, textAlign: 'center' }]}>
        {achievement.title}
      </Text>
      {achievement.earned && (
        <View style={styles.earnedBadge}>
          <Icon name="check" size={12} color={COLORS.surface} />
        </View>
      )}
    </Surface>
  );

  const renderWeeklyChart = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const maxHeight = 60;
    
    return (
      <View style={styles.weeklyChart}>
        <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>Weekly Progress</Text>
        <View style={styles.chartContainer}>
          {days.map((day, index) => {
            const calorieProgress = weeklyProgress.calories[index] / 100;
            const barHeight = Math.max(calorieProgress * maxHeight, 4);
            const barColor = calorieProgress >= 0.95 && calorieProgress <= 1.05 
              ? COLORS.success 
              : calorieProgress < 0.8 || calorieProgress > 1.2 
                ? COLORS.error 
                : COLORS.warning;
            
            return (
              <View key={day} style={styles.chartBar}>
                <View 
                  style={[
                    styles.bar,
                    { 
                      height: barHeight,
                      backgroundColor: barColor,
                    }
                  ]}
                />
                <Text style={[TEXT_STYLES.caption, { marginTop: SPACING.xs }]}>{day}</Text>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                  {weeklyProgress.calories[index]}%
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} translucent />
      
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <Animated.View 
          style={[
            styles.headerContent,
            {
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-30, 0],
                  }),
                },
              ],
              opacity: fadeAnim,
            },
          ]}
        >
          <Text style={[TEXT_STYLES.h2, { color: COLORS.surface }]}>
            Nutritional Goals 🎯
          </Text>
          <Text style={[TEXT_STYLES.bodySecondary, { color: COLORS.surface, opacity: 0.9 }]}>
            Track and achieve your nutrition targets
          </Text>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Quick Overview */}
        <Animated.View 
          style={[
            styles.section,
            { transform: [{ scale: scaleAnim }], opacity: fadeAnim }
          ]}
        >
          <Surface style={styles.overviewCard}>
            <View style={styles.overviewHeader}>
              <Text style={TEXT_STYLES.h3}>Today's Progress</Text>
              <View style={styles.timeframeSelector}>
                {['daily', 'weekly', 'monthly'].map(timeframe => (
                  <Chip
                    key={timeframe}
                    compact
                    selected={activeTimeframe === timeframe}
                    onPress={() => setActiveTimeframe(timeframe)}
                    style={[
                      styles.timeframeChip,
                      activeTimeframe === timeframe && { backgroundColor: COLORS.primary }
                    ]}
                    textStyle={{
                      color: activeTimeframe === timeframe ? COLORS.surface : COLORS.text,
                      fontSize: 12
                    }}
                  >
                    {timeframe}
                  </Chip>
                ))}
              </View>
            </View>
            
            <View style={styles.overviewStats}>
              <View style={styles.overviewStat}>
                <Text style={[TEXT_STYLES.h2, { color: COLORS.primary }]}>
                  {currentGoals.calories.consumed}
                </Text>
                <Text style={TEXT_STYLES.caption}>Calories</Text>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                  of {currentGoals.calories.target}
                </Text>
              </View>
              <View style={styles.overviewStat}>
                <Text style={[TEXT_STYLES.h2, { color: COLORS.error }]}>
                  {currentGoals.protein.consumed}g
                </Text>
                <Text style={TEXT_STYLES.caption}>Protein</Text>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                  of {currentGoals.protein.target}g
                </Text>
              </View>
              <View style={styles.overviewStat}>
                <Text style={[TEXT_STYLES.h2, { color: COLORS.secondary }]}>
                  {((currentGoals.water.consumed / currentGoals.water.target) * 100).toFixed(0)}%
                </Text>
                <Text style={TEXT_STYLES.caption}>Hydration</Text>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                  {currentGoals.water.consumed}L / {currentGoals.water.target}L
                </Text>
              </View>
            </View>
          </Surface>
        </Animated.View>

        {/* Weekly Progress Chart */}
        <View style={styles.section}>
          {renderWeeklyChart()}
        </View>

        {/* Main Nutrients */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={TEXT_STYLES.h3}>Primary Goals</Text>
            <TouchableOpacity onPress={() => setGoalSetupModal(true)}>
              <Text style={[TEXT_STYLES.bodySecondary, { color: COLORS.primary }]}>
                Adjust Goals
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.nutrientsGrid}>
            {['calories', 'protein', 'carbs', 'fat'].map(nutrient => 
              renderNutrientCard(nutrient)
            )}
          </View>
        </View>

        {/* Secondary Nutrients */}
        <View style={styles.section}>
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>Additional Targets</Text>
          <View style={styles.nutrientsGrid}>
            {['fiber', 'water', 'sodium', 'sugar'].map(nutrient => 
              renderNutrientCard(nutrient)
            )}
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={TEXT_STYLES.h3}>Achievements 🏆</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Achievements')}>
              <Text style={[TEXT_STYLES.bodySecondary, { color: COLORS.primary }]}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.achievementsContainer}>
              {achievements.slice(0, 5).map(achievement => renderAchievementBadge(achievement))}
            </View>
          </ScrollView>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => Alert.alert('Feature Coming Soon', 'Food logging will be available in the next update! 🚀')}
            >
              <Icon name="restaurant" size={32} color={COLORS.primary} />
              <Text style={TEXT_STYLES.bodySecondary}>Log Food</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => Alert.alert('Feature Coming Soon', 'Water tracking will be available in the next update! 🚀')}
            >
              <Icon name="water-drop" size={32} color={COLORS.secondary} />
              <Text style={TEXT_STYLES.bodySecondary}>Add Water</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => Alert.alert('Feature Coming Soon', 'Photo food logging will be available in the next update! 🚀')}
            >
              <Icon name="camera-alt" size={32} color={COLORS.success} />
              <Text style={TEXT_STYLES.bodySecondary}>Scan Food</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => Alert.alert('Feature Coming Soon', 'Progress reports will be available in the next update! 🚀')}
            >
              <Icon name="assessment" size={32} color={COLORS.warning} />
              <Text style={TEXT_STYLES.bodySecondary}>View Report</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Goal Setup Modal */}
      <Portal>
        <Modal
          visible={goalSetupModal}
          onDismiss={() => setGoalSetupModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          <ScrollView style={styles.modalScrollView}>
            <View style={styles.modalHeader}>
              <Text style={[TEXT_STYLES.h2, { flex: 1 }]}>Set Nutritional Goals</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setGoalSetupModal(false)}
              />
            </View>
            
            <Text style={[TEXT_STYLES.bodySecondary, { marginBottom: SPACING.lg, textAlign: 'center' }]}>
              Choose a goal type or customize your own targets
            </Text>
            
            {/* Goal Type Selection */}
            <View style={styles.presetsGrid}>
              {goalPresets.map(preset => renderGoalPreset(preset))}
            </View>
            
            <Divider style={{ marginVertical: SPACING.xl }} />
            
            {/* Activity Level */}
            <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>Activity Level</Text>
            <RadioButton.Group
              onValueChange={value => setActivityLevel(value)}
              value={activityLevel}
            >
              {activityLevels.map(level => (
                <View key={level.id} style={styles.radioItem}>
                  <RadioButton value={level.id} />
                  <View style={{ flex: 1, marginLeft: SPACING.sm }}>
                    <Text style={TEXT_STYLES.body}>{level.name}</Text>
                    <Text style={TEXT_STYLES.caption}>{level.description}</Text>
                  </View>
                </View>
              ))}
            </RadioButton.Group>
            
            {goalType === 'custom' && (
              <>
                <Divider style={{ marginVertical: SPACING.xl }} />
                
                {/* Custom Calories */}
                <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>Daily Calories</Text>
                <TextInput
                  mode="outlined"
                  value={customCalories}
                  onChangeText={setCustomCalories}
                  keyboardType="numeric"
                  right={<TextInput.Affix text="kcal" />}
                  style={{ marginBottom: SPACING.lg }}
                />
                
                {/* Macro Percentages */}
                <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>Macro Distribution</Text>
                
                <View style={styles.macroSlider}>
                  <Text style={TEXT_STYLES.body}>Protein: {proteinPercentage}%</Text>
                  <Slider
                    style={{ flex: 1, marginHorizontal: SPACING.md }}
                    minimumValue={15}
                    maximumValue={50}
                    value={proteinPercentage}
                    onValueChange={setProteinPercentage}
                    step={5}
                    thumbStyle={{ backgroundColor: COLORS.error }}
                    trackStyle={{ backgroundColor: COLORS.border }}
                    minimumTrackTintColor={COLORS.error}
                  />
                </View>
                
                <View style={styles.macroSlider}>
                  <Text style={TEXT_STYLES.body}>Carbs: {carbPercentage}%</Text>
                  <Slider
                    style={{ flex: 1, marginHorizontal: SPACING.md }}
                    minimumValue={20}
                    maximumValue={65}
                    value={carbPercentage}
                    onValueChange={setCarbPercentage}
                    step={5}
                    thumbStyle={{ backgroundColor: COLORS.warning }}
                    trackStyle={{ backgroundColor: COLORS.border }}
                    minimumTrackTintColor={COLORS.warning}
                  />
                </View>
                
                <View style={styles.macroSlider}>
                  <Text style={TEXT_STYLES.body}>Fat: {fatPercentage}%</Text>
                  <Slider
                    style={{ flex: 1, marginHorizontal: SPACING.md }}
                    minimumValue={15}
                    maximumValue={50}
                    value={fatPercentage}
                    onValueChange={setFatPercentage}
                    step={5}
                    thumbStyle={{ backgroundColor: COLORS.success }}
                    trackStyle={{ backgroundColor: COLORS.border }}
                    minimumTrackTintColor={COLORS.success}
                  />
                </View>
                
                {/* Macro Total Check */}
                <View style={styles.macroTotal}>
                  <Text style={[
                    TEXT_STYLES.bodySecondary,
                    { 
                      color: (proteinPercentage + carbPercentage + fatPercentage) === 100 
                        ? COLORS.success 
                        : COLORS.error 
                    }
                  ]}>
                    Total: {proteinPercentage + carbPercentage + fatPercentage}% 
                    {(proteinPercentage + carbPercentage + fatPercentage) !== 100 && ' (Must equal 100%)'}
                  </Text>
                </View>
                
                {/* Additional Goals */}
                <Divider style={{ marginVertical: SPACING.lg }} />
                
                <View style={styles.additionalGoals}>
                  <View style={styles.goalInput}>
                    <Text style={TEXT_STYLES.body}>Daily Water Goal: {waterGoal}L</Text>
                    <Slider
                      style={{ flex: 1, marginHorizontal: SPACING.md }}
                      minimumValue={1.5}
                      maximumValue={5.0}
                      value={waterGoal}
                      onValueChange={setWaterGoal}
                      step={0.1}
                      thumbStyle={{ backgroundColor: COLORS.secondary }}
                      minimumTrackTintColor={COLORS.secondary}
                    />
                  </View>
                  
                  <View style={styles.goalInput}>
                    <Text style={TEXT_STYLES.body}>Daily Fiber Goal: {fiberGoal}g</Text>
                    <Slider
                      style={{ flex: 1, marginHorizontal: SPACING.md }}
                      minimumValue={20}
                      maximumValue={50}
                      value={fiberGoal}
                      onValueChange={setFiberGoal}
                      step={1}
                      thumbStyle={{ backgroundColor: COLORS.success }}
                      minimumTrackTintColor={COLORS.success}
                    />
                  </View>
                </View>
              </>
            )}
            
            {/* Calculated TDEE Display */}
            <View style={styles.calculatedTdee}>
              <Text style={[TEXT_STYLES.h3, { textAlign: 'center' }]}>
                Estimated Daily Calories: {calculateTDEE()}
              </Text>
              <Text style={[TEXT_STYLES.caption, { textAlign: 'center', marginTop: SPACING.xs }]}>
                Based on your activity level and body stats
              </Text>
            </View>
            
            <Button
              mode="contained"
              onPress={handleGoalSetup}
              style={styles.saveGoalsButton}
              buttonColor={COLORS.primary}
              disabled={goalType === 'custom' && (proteinPercentage + carbPercentage + fatPercentage) !== 100}
            >
              Save Goals
            </Button>
          </ScrollView>
        </Modal>

        {/* Progress Detail Modal */}
        <Modal
          visible={progressDetailModal}
          onDismiss={() => setProgressDetailModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          {selectedGoal && (
            <ScrollView style={styles.modalScrollView}>
              <View style={styles.modalHeader}>
                <Text style={[TEXT_STYLES.h2, { flex: 1, textTransform: 'capitalize' }]}>
                  {selectedGoal.key} Progress
                </Text>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => setProgressDetailModal(false)}
                />
              </View>
              
              <View style={styles.progressDetailContent}>
                <View style={styles.progressCircle}>
                  <Text style={[TEXT_STYLES.h1, { color: COLORS.primary }]}>
                    {Math.round((selectedGoal.consumed / selectedGoal.target) * 100)}%
                  </Text>
                  <Text style={TEXT_STYLES.caption}>of daily goal</Text>
                </View>
                
                <View style={styles.progressStats}>
                  <View style={styles.progressStat}>
                    <Text style={[TEXT_STYLES.h3, { color: COLORS.success }]}>
                      {selectedGoal.consumed}
                    </Text>
                    <Text style={TEXT_STYLES.caption}>Consumed</Text>
                  </View>
                  <View style={styles.progressStat}>
                    <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>
                      {selectedGoal.target}
                    </Text>
                    <Text style={TEXT_STYLES.caption}>Target</Text>
                  </View>
                  <View style={styles.progressStat}>
                    <Text style={[TEXT_STYLES.h3, { color: COLORS.textSecondary }]}>
                      {Math.max(0, selectedGoal.target - selectedGoal.consumed).toFixed(1)}
                    </Text>
                    <Text style={TEXT_STYLES.caption}>Remaining</Text>
                  </View>
                </View>
                
                {/* Weekly Trend */}
                <View style={styles.weeklyTrend}>
                  <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>Weekly Trend</Text>
                  <View style={styles.trendChart}>
                    {weeklyProgress[selectedGoal.key] && weeklyProgress[selectedGoal.key].map((value, index) => (
                      <View key={index} style={styles.trendBar}>
                        <View 
                          style={[
                            styles.trendBarFill,
                            { 
                              height: (value / 120) * 40,
                              backgroundColor: value >= 95 && value <= 105 
                                ? COLORS.success 
                                : COLORS.warning 
                            }
                          ]}
                        />
                        <Text style={[TEXT_STYLES.caption, { marginTop: SPACING.xs }]}>
                          {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
                
                {/* Recommendations */}
                <View style={styles.recommendations}>
                  <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>Recommendations</Text>
                  {getRecommendations(selectedGoal).map((rec, index) => (
                    <View key={index} style={styles.recommendation}>
                      <Icon name="lightbulb" size={16} color={COLORS.warning} />
                      <Text style={[TEXT_STYLES.bodySecondary, { marginLeft: SPACING.sm, flex: 1 }]}>
                        {rec}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
              
              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={() => setEditGoalModal(true)}
                  style={{ flex: 1, marginRight: SPACING.sm }}
                >
                  Edit Goal
                </Button>
                <Button
                  mode="contained"
                  onPress={() => Alert.alert('Feature Coming Soon', 'Quick logging will be available in the next update! 🚀')}
                  style={{ flex: 1 }}
                  buttonColor={COLORS.primary}
                >
                  Quick Log
                </Button>
              </View>
            </ScrollView>
          )}
        </Modal>
      </Portal>

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => Alert.alert('Feature Coming Soon', 'Quick food logging will be available in the next update! 🚀')}
      />
    </View>
  );
};

const getRecommendations = (goal) => {
  const percentage = (goal.consumed / goal.target) * 100;
  
  switch (goal.key) {
    case 'protein':
      if (percentage < 80) return [
        'Add a protein shake after your workout',
        'Include lean meats, eggs, or legumes in each meal',
        'Try Greek yogurt or cottage cheese as snacks'
      ];
      if (percentage > 120) return [
        'Consider reducing portion sizes of protein sources',
        'Balance with more vegetables and complex carbs'
      ];
      return ['Great protein intake! Keep it consistent'];
      
    case 'water':
      if (percentage < 80) return [
        'Set hourly reminders to drink water',
        'Keep a water bottle visible at all times',
        'Add lemon or cucumber for flavor'
      ];
      return ['Excellent hydration! Your body thanks you'];
      
    case 'calories':
      if (percentage < 80) return [
        'Add healthy calorie-dense foods like nuts or avocado',
        'Include more complex carbohydrates',
        'Consider adding a healthy snack between meals'
      ];
      if (percentage > 120) return [
        'Focus on nutrient-dense, lower-calorie foods',
        'Increase vegetable portions',
        'Consider smaller, more frequent meals'
      ];
      return ['Perfect calorie balance for your goals'];
      
    default:
      return ['Keep tracking for better insights'];
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  overviewCard: {
    borderRadius: 16,
    padding: SPACING.lg,
    elevation: 3,
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  timeframeSelector: {
    flexDirection: 'row',
  },
  timeframeChip: {
    marginLeft: SPACING.xs,
    height: 28,
  },
  overviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  overviewStat: {
    alignItems: 'center',
    flex: 1,
  },
  weeklyChart: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.lg,
    elevation: 2,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 80,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 24,
    borderRadius: 12,
    marginBottom: SPACING.sm,
  },
  nutrientsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  nutrientCard: {
    width: (width - (SPACING.lg * 3)) / 2,
    marginBottom: SPACING.md,
    elevation: 2,
    borderRadius: 12,
  },
  nutrientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  nutrientInfo: {
    flex: 1,
  },
  nutrientIcon: {
    marginLeft: SPACING.sm,
  },
  nutrientProgress: {
    marginBottom: SPACING.sm,
  },
  progressNumbers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  progressBar: {
    height: 6,
  },
  overageIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
  },
  achievementsContainer: {
    flexDirection: 'row',
    paddingRight: SPACING.lg,
  },
  achievementBadge: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    position: 'relative',
  },
  achievementEarned: {
    backgroundColor: COLORS.surface,
  },
  earnedBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.success,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: (width - (SPACING.lg * 3)) / 2,
    height: 100,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    elevation: 2,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    margin: SPACING.lg,
    borderRadius: 16,
    maxHeight: height * 0.9,
  },
  modalScrollView: {
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  presetCard: {
    width: (width - (SPACING.lg * 4)) / 2,
    padding: SPACING.md,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    marginBottom: SPACING.md,
    position: 'relative',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  presetIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  macroSlider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  macroTotal: {
    alignItems: 'center',
    marginVertical: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  additionalGoals: {
    marginTop: SPACING.md,
  },
  goalInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  calculatedTdee: {
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
    borderRadius: 12,
    marginVertical: SPACING.lg,
  },
  saveGoalsButton: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  progressDetailContent: {
    padding: SPACING.lg,
  },
  progressCircle: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  progressStat: {
    alignItems: 'center',
    flex: 1,
  },
  weeklyTrend: {
    marginBottom: SPACING.xl,
  },
  trendChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 60,
  },
  trendBar: {
    alignItems: 'center',
    flex: 1,
  },
  trendBarFill: {
    width: 20,
    borderRadius: 10,
    marginBottom: SPACING.sm,
  },
  recommendations: {
    marginBottom: SPACING.lg,
  },
  recommendation: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  modalActions: {
    flexDirection: 'row',
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.xl,
    backgroundColor: COLORS.primary,
  },
});

export default NutritionalGoals;