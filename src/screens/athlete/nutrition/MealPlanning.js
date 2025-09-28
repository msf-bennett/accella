import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Animated,
  Dimensions,
  FlatList,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
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
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Design system imports (assumed to be available)
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const MealPlanning = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const nutritionData = useSelector(state => state.nutrition.mealPlans);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDay, setSelectedDay] = useState('today');
  const [showMealModal, setShowMealModal] = useState(false);
  const [dailyProgress, setDailyProgress] = useState({
    calories: 1850,
    targetCalories: 2400,
    protein: 95,
    targetProtein: 120,
    carbs: 180,
    targetCarbs: 300,
    fat: 65,
    targetFat: 80,
  });
  const [weeklyStreak, setWeeklyStreak] = useState(5);
  
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    StatusBar.setBackgroundColor(COLORS.primary, true);
    
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
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

  const daysOfWeek = [
    { key: 'today', label: 'Today', date: '22', active: true },
    { key: 'tomorrow', label: 'Sat', date: '23', active: false },
    { key: 'day3', label: 'Sun', date: '24', active: false },
    { key: 'day4', label: 'Mon', date: '25', active: false },
    { key: 'day5', label: 'Tue', date: '26', active: false },
    { key: 'day6', label: 'Wed', date: '27', active: false },
    { key: 'day7', label: 'Thu', date: '28', active: false },
  ];

  const todaysMeals = [
    {
      id: '1',
      type: 'Breakfast',
      time: '7:00 AM',
      calories: 450,
      protein: 25,
      carbs: 55,
      fat: 18,
      foods: ['Oatmeal with berries', 'Greek yogurt', 'Almonds'],
      completed: true,
      icon: 'breakfast-dining',
    },
    {
      id: '2',
      type: 'Pre-Workout',
      time: '9:30 AM',
      calories: 200,
      protein: 5,
      carbs: 45,
      fat: 2,
      foods: ['Banana', 'Energy bar'],
      completed: true,
      icon: 'fitness-center',
    },
    {
      id: '3',
      type: 'Lunch',
      time: '12:30 PM',
      calories: 650,
      protein: 40,
      carbs: 65,
      fat: 25,
      foods: ['Grilled chicken', 'Brown rice', 'Mixed vegetables'],
      completed: true,
      icon: 'lunch-dining',
    },
    {
      id: '4',
      type: 'Post-Workout',
      time: '4:00 PM',
      calories: 300,
      protein: 20,
      carbs: 35,
      fat: 8,
      foods: ['Protein shake', 'Sweet potato'],
      completed: false,
      icon: 'sports',
    },
    {
      id: '5',
      type: 'Dinner',
      time: '7:00 PM',
      calories: 550,
      protein: 35,
      carbs: 45,
      fat: 22,
      foods: ['Salmon', 'Quinoa', 'Steamed broccoli'],
      completed: false,
      icon: 'dinner-dining',
    },
  ];

  const nutritionTips = [
    { tip: 'Hydrate 30 mins before training! 💧', type: 'hydration' },
    { tip: 'Protein within 2hrs post-workout 💪', type: 'recovery' },
    { tip: 'Complex carbs for sustained energy ⚡', type: 'energy' },
  ];

  const achievements = [
    { id: '1', title: 'Meal Prep Master', icon: 'restaurant', earned: true },
    { id: '2', title: 'Hydration Hero', icon: 'water-drop', earned: true },
    { id: '3', title: 'Protein Power', icon: 'fitness-center', earned: false },
  ];

  const handleMealPress = (meal) => {
    Alert.alert(
      `${meal.type} Details`,
      `Time: ${meal.time}\nCalories: ${meal.calories}\nProtein: ${meal.protein}g\nCarbs: ${meal.carbs}g\nFat: ${meal.fat}g\n\nFoods:\n${meal.foods.join('\n')}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: meal.completed ? 'Mark Incomplete' : 'Mark Complete', 
          onPress: () => toggleMealComplete(meal.id)
        },
        { text: 'Edit Meal', onPress: () => editMeal(meal.id) },
      ]
    );
  };

  const toggleMealComplete = (mealId) => {
    // Implementation for toggling meal completion
    Alert.alert('Success! 🎉', 'Meal status updated');
  };

  const editMeal = (mealId) => {
    Alert.alert('Feature Coming Soon! 🚧', 'Meal editing will be available in the next update');
  };

  const addCustomMeal = () => {
    Alert.alert('Feature Coming Soon! 🚧', 'Custom meal creation will be available in the next update');
  };

  const generateMealPlan = () => {
    Alert.alert('AI Meal Plan Generator 🤖', 'Generating personalized meal plan based on your goals and preferences...');
  };

  const renderMealCard = ({ item }) => (
    <Surface style={styles.mealCard} elevation={2}>
      <TouchableOpacity onPress={() => handleMealPress(item)}>
        <View style={styles.mealHeader}>
          <View style={styles.mealTitleContainer}>
            <Icon 
              name={item.icon} 
              size={24} 
              color={item.completed ? COLORS.success : COLORS.primary}
            />
            <View style={styles.mealInfo}>
              <Text style={[TEXT_STYLES.subtitle, { color: COLORS.text }]}>
                {item.type}
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                {item.time}
              </Text>
            </View>
          </View>
          <Chip 
            style={[
              styles.calorieChip, 
              { backgroundColor: item.completed ? COLORS.success : COLORS.primary }
            ]}
            textStyle={{ color: 'white', fontSize: 12 }}
          >
            {item.calories} cal
          </Chip>
        </View>
        
        <View style={styles.macrosContainer}>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{item.protein}g</Text>
            <Text style={styles.macroLabel}>Protein</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{item.carbs}g</Text>
            <Text style={styles.macroLabel}>Carbs</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{item.fat}g</Text>
            <Text style={styles.macroLabel}>Fat</Text>
          </View>
        </View>
        
        <Text style={styles.foodsList}>
          {item.foods.join(' • ')}
        </Text>
        
        {item.completed && (
          <View style={styles.completedBadge}>
            <Icon name="check-circle" size={16} color={COLORS.success} />
            <Text style={styles.completedText}>Completed ✨</Text>
          </View>
        )}
      </TouchableOpacity>
    </Surface>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Meal Planning 🍽️</Text>
              <Text style={styles.headerSubtitle}>
                Fuel your performance • Day {weeklyStreak} streak 🔥
              </Text>
            </View>
            <TouchableOpacity onPress={generateMealPlan}>
              <Surface style={styles.aiButton} elevation={3}>
                <Icon name="auto-awesome" size={24} color={COLORS.primary} />
              </Surface>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <Animated.ScrollView
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
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Daily Progress Overview */}
        <Surface style={styles.progressCard} elevation={2}>
          <Text style={[TEXT_STYLES.subtitle, { marginBottom: SPACING.md }]}>
            Today's Progress 📊
          </Text>
          
          <View style={styles.progressRow}>
            <View style={styles.progressItem}>
              <Text style={styles.progressLabel}>Calories</Text>
              <ProgressBar
                progress={dailyProgress.calories / dailyProgress.targetCalories}
                color={COLORS.primary}
                style={styles.progressBar}
              />
              <Text style={styles.progressText}>
                {dailyProgress.calories}/{dailyProgress.targetCalories}
              </Text>
            </View>
          </View>
          
          <View style={styles.macrosRow}>
            <View style={styles.macroProgress}>
              <Text style={styles.macroLabel}>Protein</Text>
              <ProgressBar
                progress={dailyProgress.protein / dailyProgress.targetProtein}
                color={COLORS.success}
                style={styles.miniProgressBar}
              />
              <Text style={styles.macroText}>
                {dailyProgress.protein}g/{dailyProgress.targetProtein}g
              </Text>
            </View>
            <View style={styles.macroProgress}>
              <Text style={styles.macroLabel}>Carbs</Text>
              <ProgressBar
                progress={dailyProgress.carbs / dailyProgress.targetCarbs}
                color={COLORS.secondary}
                style={styles.miniProgressBar}
              />
              <Text style={styles.macroText}>
                {dailyProgress.carbs}g/{dailyProgress.targetCarbs}g
              </Text>
            </View>
            <View style={styles.macroProgress}>
              <Text style={styles.macroLabel}>Fat</Text>
              <ProgressBar
                progress={dailyProgress.fat / dailyProgress.targetFat}
                color={COLORS.warning}
                style={styles.miniProgressBar}
              />
              <Text style={styles.macroText}>
                {dailyProgress.fat}g/{dailyProgress.targetFat}g
              </Text>
            </View>
          </View>
        </Surface>

        {/* Week Calendar */}
        <View style={styles.calendarContainer}>
          <Text style={[TEXT_STYLES.subtitle, { marginBottom: SPACING.sm }]}>
            Weekly Plan 📅
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {daysOfWeek.map((day) => (
              <TouchableOpacity
                key={day.key}
                style={[
                  styles.dayCard,
                  day.active && styles.activeDayCard
                ]}
                onPress={() => setSelectedDay(day.key)}
              >
                <Text style={[
                  styles.dayLabel,
                  day.active && styles.activeDayLabel
                ]}>
                  {day.label}
                </Text>
                <Text style={[
                  styles.dayDate,
                  day.active && styles.activeDayDate
                ]}>
                  {day.date}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Nutrition Tips */}
        <Surface style={styles.tipsCard} elevation={1}>
          <Text style={[TEXT_STYLES.subtitle, { marginBottom: SPACING.sm }]}>
            Today's Tips 💡
          </Text>
          {nutritionTips.map((tip, index) => (
            <Chip
              key={index}
              mode="outlined"
              style={styles.tipChip}
              textStyle={{ fontSize: 12 }}
            >
              {tip.tip}
            </Chip>
          ))}
        </Surface>

        {/* Meals List */}
        <View style={styles.mealsSection}>
          <View style={styles.mealsSectionHeader}>
            <Text style={[TEXT_STYLES.subtitle, { flex: 1 }]}>
              Today's Meals 🥗
            </Text>
            <IconButton
              icon="add"
              size={24}
              iconColor={COLORS.primary}
              onPress={addCustomMeal}
            />
          </View>
          
          <FlatList
            data={todaysMeals}
            renderItem={renderMealCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ height: SPACING.sm }} />}
          />
        </View>

        {/* Achievements */}
        <Surface style={styles.achievementsCard} elevation={1}>
          <Text style={[TEXT_STYLES.subtitle, { marginBottom: SPACING.sm }]}>
            Nutrition Achievements 🏆
          </Text>
          <View style={styles.achievementsContainer}>
            {achievements.map((achievement) => (
              <View key={achievement.id} style={styles.achievementItem}>
                <Avatar.Icon
                  size={40}
                  icon={achievement.icon}
                  style={[
                    styles.achievementIcon,
                    { backgroundColor: achievement.earned ? COLORS.success : COLORS.disabled }
                  ]}
                />
                <Text style={[
                  styles.achievementTitle,
                  { color: achievement.earned ? COLORS.text : COLORS.textSecondary }
                ]}>
                  {achievement.title}
                </Text>
              </View>
            ))}
          </View>
        </Surface>
      </Animated.ScrollView>

      {/* Floating Action Button */}
      <FAB
        style={styles.fab}
        icon="restaurant-menu"
        onPress={() => Alert.alert('Quick Actions', 'Log food, scan barcode, or view recipes?')}
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
    paddingTop: 50,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    flexDirection: 'column',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  aiButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    marginTop: -20,
  },
  progressCard: {
    padding: SPACING.lg,
    borderRadius: 16,
    marginBottom: SPACING.lg,
    backgroundColor: 'white',
  },
  progressRow: {
    marginBottom: SPACING.md,
  },
  progressItem: {
    flex: 1,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'right',
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroProgress: {
    flex: 1,
    marginHorizontal: 4,
  },
  miniProgressBar: {
    height: 4,
    borderRadius: 2,
    marginVertical: 2,
  },
  macroText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  calendarContainer: {
    marginBottom: SPACING.lg,
  },
  dayCard: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginRight: SPACING.sm,
    borderRadius: 12,
    backgroundColor: 'white',
    alignItems: 'center',
    minWidth: 60,
  },
  activeDayCard: {
    backgroundColor: COLORS.primary,
  },
  dayLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  activeDayLabel: {
    color: 'white',
  },
  dayDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  activeDayDate: {
    color: 'white',
  },
  tipsCard: {
    padding: SPACING.lg,
    borderRadius: 16,
    marginBottom: SPACING.lg,
    backgroundColor: 'white',
  },
  tipChip: {
    marginBottom: SPACING.sm,
    marginRight: SPACING.sm,
  },
  mealsSection: {
    marginBottom: SPACING.lg,
  },
  mealsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  mealCard: {
    padding: SPACING.lg,
    borderRadius: 16,
    backgroundColor: 'white',
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  mealTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  mealInfo: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  calorieChip: {
    height: 28,
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 8,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  macroLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  foodsList: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: SPACING.sm,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  completedText: {
    fontSize: 12,
    color: COLORS.success,
    marginLeft: 4,
    fontWeight: '600',
  },
  achievementsCard: {
    padding: SPACING.lg,
    borderRadius: 16,
    marginBottom: SPACING.lg,
    backgroundColor: 'white',
  },
  achievementsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  achievementItem: {
    alignItems: 'center',
    flex: 1,
  },
  achievementIcon: {
    marginBottom: SPACING.sm,
  },
  achievementTitle: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default MealPlanning;