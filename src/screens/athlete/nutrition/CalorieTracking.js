import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  Animated,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
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
  Searchbar,
  Portal,
  Modal,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import design constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f7fa',
  white: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e0e0e0',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textSecondary },
  small: { fontSize: 12, color: COLORS.textSecondary },
};

const { width, height } = Dimensions.get('window');

const CalorieTracking = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, dailyGoals, nutritionData } = useSelector(state => ({
    user: state.auth.user,
    dailyGoals: state.nutrition.dailyGoals,
    nutritionData: state.nutrition.todayData,
  }));

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState('breakfast');
  const [todayCalories, setTodayCalories] = useState(0);
  const [goalCalories, setGoalCalories] = useState(2500);
  const [waterIntake, setWaterIntake] = useState(0);
  const [waterGoal] = useState(8);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Mock data for demonstration
  const [recentFoods] = useState([
    { id: '1', name: '🥓 Grilled Chicken Breast', calories: 231, protein: 43.5, carbs: 0, fat: 5 },
    { id: '2', name: '🍚 Brown Rice', calories: 216, protein: 5, carbs: 45, fat: 1.8 },
    { id: '3', name: '🥑 Avocado', calories: 234, protein: 2.9, carbs: 12, fat: 21 },
    { id: '4', name: '🍌 Banana', calories: 105, protein: 1.3, carbs: 27, fat: 0.3 },
    { id: '5', name: '🥛 Protein Shake', calories: 150, protein: 30, carbs: 5, fat: 2 },
  ]);

  const [todayMeals] = useState({
    breakfast: [
      { id: 'b1', name: '🥣 Oatmeal with Berries', calories: 320, time: '07:30 AM' },
      { id: 'b2', name: '☕ Coffee with Milk', calories: 45, time: '07:30 AM' },
    ],
    lunch: [
      { id: 'l1', name: '🥗 Caesar Salad', calories: 470, time: '12:45 PM' },
      { id: 'l2', name: '🍗 Grilled Chicken', calories: 231, time: '12:45 PM' },
    ],
    dinner: [
      { id: 'd1', name: '🐟 Salmon Fillet', calories: 367, time: '07:15 PM' },
      { id: 'd2', name: '🥦 Steamed Broccoli', calories: 55, time: '07:15 PM' },
    ],
    snacks: [
      { id: 's1', name: '🍎 Apple', calories: 95, time: '03:20 PM' },
      { id: 's2', name: '🥜 Mixed Nuts', calories: 166, time: '09:30 PM' },
    ],
  });

  // Calculate today's total calories
  useEffect(() => {
    const total = Object.values(todayMeals).flat().reduce((sum, meal) => sum + meal.calories, 0);
    setTodayCalories(total);
  }, [todayMeals]);

  // Animations
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
      Animated.timing(progressAnim, {
        toValue: todayCalories / goalCalories,
        duration: 1000,
        useNativeDriver: false,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, progressAnim, todayCalories, goalCalories]);

  // Handlers
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('📱 Sync Complete', 'Your nutrition data has been updated!');
    }, 2000);
  }, []);

  const handleAddFood = (meal) => {
    setSelectedMeal(meal);
    setShowAddModal(true);
    Vibration.vibrate(50);
  };

  const handleQuickAdd = (food) => {
    Alert.alert('🍽️ Food Added!', `${food.name} added to ${selectedMeal}`, [
      { text: 'Add Another', onPress: () => {} },
      { text: 'Done', onPress: () => setShowAddModal(false) },
    ]);
    Vibration.vibrate(100);
  };

  const addWater = () => {
    if (waterIntake < waterGoal) {
      setWaterIntake(prev => prev + 1);
      Vibration.vibrate(50);
    }
  };

  const removeWater = () => {
    if (waterIntake > 0) {
      setWaterIntake(prev => prev - 1);
      Vibration.vibrate(50);
    }
  };

  // Calculate progress metrics
  const calorieProgress = Math.min(todayCalories / goalCalories, 1);
  const waterProgress = waterIntake / waterGoal;
  const remainingCalories = Math.max(goalCalories - todayCalories, 0);

  // Render meal section
  const renderMealSection = (mealType, mealTitle, icon) => (
    <Card style={styles.mealCard} key={mealType}>
      <View style={styles.mealHeader}>
        <View style={styles.mealTitleContainer}>
          <Text style={styles.mealIcon}>{icon}</Text>
          <View>
            <Text style={styles.mealTitle}>{mealTitle}</Text>
            <Text style={styles.mealCalories}>
              {todayMeals[mealType].reduce((sum, meal) => sum + meal.calories, 0)} cal
            </Text>
          </View>
        </View>
        <IconButton
          icon="add"
          size={24}
          iconColor={COLORS.primary}
          onPress={() => handleAddFood(mealType)}
        />
      </View>
      
      {todayMeals[mealType].map((meal, index) => (
        <View key={meal.id} style={styles.mealItem}>
          <View style={styles.mealItemContent}>
            <Text style={styles.mealName}>{meal.name}</Text>
            <Text style={styles.mealTime}>{meal.time}</Text>
          </View>
          <View style={styles.mealCaloriesContainer}>
            <Text style={styles.mealCaloriesText}>{meal.calories} cal</Text>
            <IconButton
              icon="edit"
              size={16}
              iconColor={COLORS.textSecondary}
              onPress={() => Alert.alert('⚡ Feature Coming Soon', 'Edit meal functionality will be available in the next update!')}
            />
          </View>
        </View>
      ))}
    </Card>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <Animated.View
          style={[
            styles.headerContent,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerGreeting}>Good morning, {user?.name || 'Athlete'}! 👋</Text>
              <Text style={styles.headerDate}>{new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</Text>
            </View>
            <Avatar.Image
              size={50}
              source={{ uri: user?.avatar || 'https://via.placeholder.com/100' }}
            />
          </View>

          {/* Calorie Progress */}
          <Surface style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>🔥 Daily Calories</Text>
              <Chip
                icon="target"
                mode="outlined"
                textStyle={styles.chipText}
                style={styles.goalChip}
              >
                Goal: {goalCalories}
              </Chip>
            </View>
            
            <View style={styles.calorieStats}>
              <View style={styles.calorieStatItem}>
                <Text style={styles.calorieNumber}>{todayCalories.toLocaleString()}</Text>
                <Text style={styles.calorieLabel}>Consumed</Text>
              </View>
              <View style={styles.calorieStatItem}>
                <Text style={[styles.calorieNumber, { color: COLORS.success }]}>
                  {remainingCalories.toLocaleString()}
                </Text>
                <Text style={styles.calorieLabel}>Remaining</Text>
              </View>
              <View style={styles.calorieStatItem}>
                <Text style={[styles.calorieNumber, { color: COLORS.warning }]}>
                  {Math.round(calorieProgress * 100)}%
                </Text>
                <Text style={styles.calorieLabel}>Progress</Text>
              </View>
            </View>
            
            <Animated.View style={styles.progressBarContainer}>
              <ProgressBar
                progress={progressAnim}
                color={calorieProgress > 0.9 ? COLORS.success : COLORS.warning}
                style={styles.progressBar}
              />
            </Animated.View>
          </Surface>

          {/* Water Intake */}
          <Surface style={styles.waterCard}>
            <View style={styles.waterHeader}>
              <Text style={styles.waterTitle}>💧 Water Intake</Text>
              <Text style={styles.waterProgress}>{waterIntake}/{waterGoal} glasses</Text>
            </View>
            <View style={styles.waterControls}>
              <View style={styles.waterGlasses}>
                {Array.from({ length: waterGoal }).map((_, index) => (
                  <Icon
                    key={index}
                    name="local-drink"
                    size={24}
                    color={index < waterIntake ? COLORS.primary : COLORS.border}
                  />
                ))}
              </View>
              <View style={styles.waterButtons}>
                <IconButton
                  icon="remove"
                  size={20}
                  iconColor={COLORS.error}
                  onPress={removeWater}
                  disabled={waterIntake === 0}
                />
                <IconButton
                  icon="add"
                  size={20}
                  iconColor={COLORS.success}
                  onPress={addWater}
                  disabled={waterIntake >= waterGoal}
                />
              </View>
            </View>
            <ProgressBar
              progress={waterProgress}
              color={COLORS.primary}
              style={styles.waterProgressBar}
            />
          </Surface>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
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
        <Animated.View
          style={[
            styles.mealsContainer,
            { opacity: fadeAnim }
          ]}
        >
          <Text style={styles.sectionTitle}>🍽️ Today's Meals</Text>
          
          {renderMealSection('breakfast', 'Breakfast', '🌅')}
          {renderMealSection('lunch', 'Lunch', '☀️')}
          {renderMealSection('dinner', 'Dinner', '🌙')}
          {renderMealSection('snacks', 'Snacks', '🍿')}

          {/* Quick Stats */}
          <Card style={styles.statsCard}>
            <Text style={styles.statsTitle}>📊 Nutrition Breakdown</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>156g</Text>
                <Text style={styles.statLabel}>Protein</Text>
                <ProgressBar progress={0.78} color={COLORS.success} style={styles.statProgress} />
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>234g</Text>
                <Text style={styles.statLabel}>Carbs</Text>
                <ProgressBar progress={0.65} color={COLORS.warning} style={styles.statProgress} />
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>89g</Text>
                <Text style={styles.statLabel}>Fat</Text>
                <ProgressBar progress={0.72} color={COLORS.primary} style={styles.statProgress} />
              </View>
            </View>
          </Card>

          {/* Achievements */}
          <Card style={styles.achievementsCard}>
            <Text style={styles.achievementsTitle}>🏆 Today's Achievements</Text>
            <View style={styles.achievementsList}>
              <Chip icon="check-circle" style={styles.achievementChip}>
                Breakfast logged ✅
              </Chip>
              <Chip icon="trending-up" style={styles.achievementChip}>
                Protein goal met 💪
              </Chip>
              <Chip icon="local-drink" style={styles.achievementChip}>
                Stay hydrated 💧
              </Chip>
            </View>
          </Card>
        </Animated.View>
      </ScrollView>

      {/* Add Food Modal */}
      <Portal>
        <Modal
          visible={showAddModal}
          onDismiss={() => setShowAddModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView style={styles.modalBlur} blurType="light" blurAmount={10}>
            <Surface style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add to {selectedMeal}</Text>
              
              <Searchbar
                placeholder="Search foods..."
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={styles.searchBar}
              />

              <ScrollView style={styles.foodList}>
                <Text style={styles.foodSectionTitle}>🔥 Quick Add</Text>
                {recentFoods.map(food => (
                  <TouchableOpacity
                    key={food.id}
                    style={styles.foodItem}
                    onPress={() => handleQuickAdd(food)}
                  >
                    <View>
                      <Text style={styles.foodName}>{food.name}</Text>
                      <Text style={styles.foodMacros}>
                        P: {food.protein}g | C: {food.carbs}g | F: {food.fat}g
                      </Text>
                    </View>
                    <Text style={styles.foodCalories}>{food.calories} cal</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={() => setShowAddModal(false)}
                  style={styles.modalButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={() => Alert.alert('⚡ Feature Coming Soon', 'Custom food entry will be available soon!')}
                  style={styles.modalButton}
                  buttonColor={COLORS.primary}
                >
                  Custom Entry
                </Button>
              </View>
            </Surface>
          </BlurView>
        </Modal>
      </Portal>

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => {
          Alert.alert('🍽️ Quick Add', 'Choose meal type:', [
            { text: 'Breakfast', onPress: () => handleAddFood('breakfast') },
            { text: 'Lunch', onPress: () => handleAddFood('lunch') },
            { text: 'Dinner', onPress: () => handleAddFood('dinner') },
            { text: 'Snack', onPress: () => handleAddFood('snacks') },
          ]);
        }}
        color={COLORS.white}
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
    paddingTop: StatusBar.currentHeight + SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    gap: SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerGreeting: {
    ...TEXT_STYLES.h2,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  headerDate: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  progressCard: {
    padding: SPACING.md,
    borderRadius: 12,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  progressTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
  },
  goalChip: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
  },
  chipText: {
    ...TEXT_STYLES.small,
    color: COLORS.primary,
  },
  calorieStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  calorieStatItem: {
    alignItems: 'center',
  },
  calorieNumber: {
    ...TEXT_STYLES.h2,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  calorieLabel: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
  },
  progressBarContainer: {
    marginTop: SPACING.sm,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  waterCard: {
    padding: SPACING.md,
    borderRadius: 12,
    elevation: 2,
  },
  waterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  waterTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
  },
  waterProgress: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    fontWeight: '600',
  },
  waterControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  waterGlasses: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  waterButtons: {
    flexDirection: 'row',
  },
  waterProgressBar: {
    height: 6,
    borderRadius: 3,
  },
  content: {
    flex: 1,
    paddingTop: SPACING.md,
  },
  mealsContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 100,
  },
  sectionTitle: {
    ...TEXT_STYLES.h2,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  mealCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    elevation: 2,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  mealTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  mealIcon: {
    fontSize: 24,
  },
  mealTitle: {
    ...TEXT_STYLES.h3,
  },
  mealCalories: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: '600',
  },
  mealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  mealItemContent: {
    flex: 1,
  },
  mealName: {
    ...TEXT_STYLES.body,
    marginBottom: SPACING.xs,
  },
  mealTime: {
    ...TEXT_STYLES.small,
    color: COLORS.textSecondary,
  },
  mealCaloriesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealCaloriesText: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.primary,
    marginRight: SPACING.xs,
  },
  statsCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: 12,
    elevation: 2,
  },
  statsTitle: {
    ...TEXT_STYLES.h3,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    minWidth: 80,
  },
  statValue: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  statProgress: {
    width: 60,
    height: 4,
    borderRadius: 2,
  },
  achievementsCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: 12,
    elevation: 2,
  },
  achievementsTitle: {
    ...TEXT_STYLES.h3,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  achievementsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    justifyContent: 'center',
  },
  achievementChip: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  modalBlur: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.md,
  },
  modalContent: {
    maxHeight: height * 0.8,
    borderRadius: 16,
    padding: SPACING.md,
    elevation: 8,
  },
  modalTitle: {
    ...TEXT_STYLES.h2,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  searchBar: {
    marginBottom: SPACING.md,
    elevation: 0,
    backgroundColor: COLORS.background,
  },
  foodList: {
    maxHeight: 300,
  },
  foodSectionTitle: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.sm,
    color: COLORS.primary,
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  foodName: {
    ...TEXT_STYLES.body,
    marginBottom: SPACING.xs,
  },
  foodMacros: {
    ...TEXT_STYLES.small,
    color: COLORS.textSecondary,
  },
  foodCalories: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.primary,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  modalButton: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default CalorieTracking;