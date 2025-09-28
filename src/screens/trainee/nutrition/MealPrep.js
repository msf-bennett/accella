import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
  TouchableOpacity,
  StatusBar,
  Animated,
  Dimensions,
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
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '@react-native-blur/blur';

// Design System Constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f7fa',
  surface: '#ffffff',
  text: '#2c3e50',
  textSecondary: '#7f8c8d',
  accent: '#e74c3c',
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
  h2: { fontSize: 22, fontWeight: 'bold', color: COLORS.text },
  h3: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textSecondary },
  small: { fontSize: 12, color: COLORS.textSecondary },
};

const { width, height } = Dimensions.get('window');

const MealPrep = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, mealPlans, nutritionGoals } = useSelector((state) => state.nutrition);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDay, setSelectedDay] = useState(0); // 0 = today
  const [showMealPlanner, setShowMealPlanner] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [scrollY] = useState(new Animated.Value(0));

  // Sample data - would come from Redux store
  const [weeklyMeals, setWeeklyMeals] = useState([
    {
      day: 'Today',
      date: 'Mon, Jan 15',
      meals: [
        {
          id: 1,
          name: 'Power Breakfast Bowl',
          type: 'breakfast',
          calories: 420,
          protein: 25,
          carbs: 45,
          fats: 18,
          prepTime: 15,
          difficulty: 'Easy',
          ingredients: ['Oats', 'Greek Yogurt', 'Berries', 'Almonds'],
          status: 'completed',
          rating: 4.5,
        },
        {
          id: 2,
          name: 'Grilled Chicken Salad',
          type: 'lunch',
          calories: 380,
          protein: 35,
          carbs: 20,
          fats: 15,
          prepTime: 25,
          difficulty: 'Medium',
          ingredients: ['Chicken Breast', 'Mixed Greens', 'Quinoa', 'Avocado'],
          status: 'planned',
          rating: 4.8,
        },
        {
          id: 3,
          name: 'Post-Workout Smoothie',
          type: 'snack',
          calories: 280,
          protein: 20,
          carbs: 35,
          fats: 8,
          prepTime: 5,
          difficulty: 'Easy',
          ingredients: ['Protein Powder', 'Banana', 'Spinach', 'Almond Milk'],
          status: 'planned',
          rating: 4.3,
        },
      ],
      totalCalories: 1080,
      targetCalories: 2200,
      macrosBalance: { protein: 36, carbs: 45, fats: 19 },
    },
  ]);

  const [achievements] = useState([
    { id: 1, title: 'Meal Prep Master', description: '7 days streak', icon: 'restaurant', earned: true },
    { id: 2, title: 'Macro Tracker', description: 'Hit protein goals 5 days', icon: 'fitness-center', earned: true },
    { id: 3, title: 'Recipe Explorer', description: 'Tried 10 new recipes', icon: 'explore', earned: false },
  ]);

  const [nutritionStats] = useState({
    weeklyStreak: 7,
    mealsCompleted: 18,
    totalMeals: 21,
    avgRating: 4.6,
    caloriesOnTrack: 85,
  });

  const mealTypes = [
    { key: 'all', label: 'All Meals', icon: 'restaurant-menu' },
    { key: 'breakfast', label: 'Breakfast', icon: 'free-breakfast' },
    { key: 'lunch', label: 'Lunch', icon: 'lunch-dining' },
    { key: 'dinner', label: 'Dinner', icon: 'dinner-dining' },
    { key: 'snack', label: 'Snacks', icon: 'local-cafe' },
  ];

  const quickActions = [
    { title: 'AI Meal Plan', subtitle: 'Generate custom plan', icon: 'auto-awesome', color: COLORS.primary },
    { title: 'Grocery List', subtitle: 'Shopping made easy', icon: 'shopping-cart', color: COLORS.success },
    { title: 'Recipe Search', subtitle: 'Find new recipes', icon: 'search', color: COLORS.warning },
    { title: 'Macro Calculator', subtitle: 'Track your macros', icon: 'calculate', color: COLORS.accent },
  ];

  useEffect(() => {
    // Load nutrition data
    loadNutritionData();
  }, []);

  const loadNutritionData = useCallback(async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // dispatch(loadMealPlans());
    } catch (error) {
      Alert.alert('Error', 'Failed to load nutrition data');
    }
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNutritionData();
    setRefreshing(false);
  }, [loadNutritionData]);

  const handleMealComplete = (mealId) => {
    setWeeklyMeals(prev => 
      prev.map(day => ({
        ...day,
        meals: day.meals.map(meal => 
          meal.id === mealId 
            ? { ...meal, status: meal.status === 'completed' ? 'planned' : 'completed' }
            : meal
        )
      }))
    );
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'AI Meal Plan':
        Alert.alert('AI Meal Planner', 'Generate personalized meal plans based on your goals, preferences, and training schedule.');
        break;
      case 'Grocery List':
        navigation.navigate('GroceryList');
        break;
      case 'Recipe Search':
        setShowMealPlanner(true);
        break;
      case 'Macro Calculator':
        navigation.navigate('MacroCalculator');
        break;
      default:
        Alert.alert('Feature Coming Soon', 'This feature is under development! 🚀');
    }
  };

  const getMealTypeColor = (type) => {
    const colors = {
      breakfast: '#FF6B35',
      lunch: '#4ECDC4',
      dinner: '#45B7D1',
      snack: '#96CEB4',
    };
    return colors[type] || COLORS.primary;
  };

  const getMealIcon = (type) => {
    const icons = {
      breakfast: 'free-breakfast',
      lunch: 'lunch-dining',
      dinner: 'dinner-dining',
      snack: 'local-cafe',
    };
    return icons[type] || 'restaurant-menu';
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={[TEXT_STYLES.h2, { color: 'white' }]}>
              Meal Prep 🍽️
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
              Fuel your fitness journey
            </Text>
          </View>
          <IconButton
            icon="notifications"
            iconColor="white"
            size={24}
            onPress={() => Alert.alert('Notifications', 'Meal reminders and tips!')}
          />
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{nutritionStats.weeklyStreak}</Text>
            <Text style={styles.statLabel}>Day Streak 🔥</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{nutritionStats.mealsCompleted}/{nutritionStats.totalMeals}</Text>
            <Text style={styles.statLabel}>Meals Done</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{nutritionStats.caloriesOnTrack}%</Text>
            <Text style={styles.statLabel}>On Track 📈</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );

  const renderQuickActions = () => (
    <Surface style={styles.quickActionsContainer}>
      <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
        Quick Actions ⚡
      </Text>
      <View style={styles.quickActionsGrid}>
        {quickActions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.quickActionCard, { backgroundColor: `${action.color}15` }]}
            onPress={() => handleQuickAction(action.title)}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
              <Icon name={action.icon} size={24} color="white" />
            </View>
            <Text style={styles.quickActionTitle}>{action.title}</Text>
            <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </Surface>
  );

  const renderMealFilters = () => (
    <View style={styles.filtersContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {mealTypes.map((type) => (
          <Chip
            key={type.key}
            selected={activeFilter === type.key}
            onPress={() => setActiveFilter(type.key)}
            style={[
              styles.filterChip,
              activeFilter === type.key && styles.activeFilterChip
            ]}
            textStyle={[
              styles.filterChipText,
              activeFilter === type.key && styles.activeFilterChipText
            ]}
            icon={type.icon}
          >
            {type.label}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const renderDailyProgress = () => {
    const today = weeklyMeals[selectedDay];
    const progressPercentage = (today.totalCalories / today.targetCalories) * 100;

    return (
      <Surface style={styles.progressContainer}>
        <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.sm }]}>
          Today's Progress 📊
        </Text>
        
        <View style={styles.caloriesRow}>
          <Text style={TEXT_STYLES.body}>
            {today.totalCalories} / {today.targetCalories} kcal
          </Text>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.success }]}>
            {Math.round(progressPercentage)}% Complete
          </Text>
        </View>
        
        <ProgressBar
          progress={Math.min(progressPercentage / 100, 1)}
          color={COLORS.success}
          style={styles.progressBar}
        />

        <View style={styles.macrosContainer}>
          <View style={styles.macroItem}>
            <Text style={styles.macroLabel}>Protein</Text>
            <Text style={[styles.macroValue, { color: COLORS.accent }]}>
              {today.macrosBalance.protein}%
            </Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroLabel}>Carbs</Text>
            <Text style={[styles.macroValue, { color: COLORS.warning }]}>
              {today.macrosBalance.carbs}%
            </Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroLabel}>Fats</Text>
            <Text style={[styles.macroValue, { color: COLORS.success }]}>
              {today.macrosBalance.fats}%
            </Text>
          </View>
        </View>
      </Surface>
    );
  };

  const renderMealCard = (meal) => (
    <Card key={meal.id} style={styles.mealCard}>
      <View style={styles.mealCardHeader}>
        <View style={styles.mealTypeContainer}>
          <View style={[styles.mealTypeIcon, { backgroundColor: getMealTypeColor(meal.type) }]}>
            <Icon name={getMealIcon(meal.type)} size={20} color="white" />
          </View>
          <View>
            <Text style={TEXT_STYLES.h3}>{meal.name}</Text>
            <Text style={TEXT_STYLES.caption}>
              {meal.prepTime} min • {meal.difficulty}
            </Text>
          </View>
        </View>
        
        <IconButton
          icon={meal.status === 'completed' ? 'check-circle' : 'radio-button-unchecked'}
          iconColor={meal.status === 'completed' ? COLORS.success : COLORS.textSecondary}
          size={24}
          onPress={() => handleMealComplete(meal.id)}
        />
      </View>

      <View style={styles.mealNutrition}>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionValue}>{meal.calories}</Text>
          <Text style={styles.nutritionLabel}>kcal</Text>
        </View>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionValue}>{meal.protein}g</Text>
          <Text style={styles.nutritionLabel}>protein</Text>
        </View>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionValue}>{meal.carbs}g</Text>
          <Text style={styles.nutritionLabel}>carbs</Text>
        </View>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionValue}>{meal.fats}g</Text>
          <Text style={styles.nutritionLabel}>fats</Text>
        </View>
      </View>

      <View style={styles.mealIngredients}>
        <Text style={[TEXT_STYLES.caption, { marginBottom: SPACING.xs }]}>
          Ingredients:
        </Text>
        <View style={styles.ingredientChips}>
          {meal.ingredients.slice(0, 3).map((ingredient, index) => (
            <Chip key={index} style={styles.ingredientChip} textStyle={styles.ingredientChipText}>
              {ingredient}
            </Chip>
          ))}
          {meal.ingredients.length > 3 && (
            <Chip style={styles.ingredientChip} textStyle={styles.ingredientChipText}>
              +{meal.ingredients.length - 3} more
            </Chip>
          )}
        </View>
      </View>

      <View style={styles.mealActions}>
        <Button
          mode="outlined"
          compact
          onPress={() => Alert.alert('Recipe Details', 'View full recipe with instructions')}
          style={styles.mealActionButton}
        >
          View Recipe
        </Button>
        <Button
          mode="contained"
          compact
          onPress={() => Alert.alert('Add to Plan', 'Add this meal to your weekly plan')}
          style={styles.mealActionButton}
          buttonColor={getMealTypeColor(meal.type)}
        >
          Add to Plan
        </Button>
      </View>
    </Card>
  );

  const renderAchievements = () => (
    <Surface style={styles.achievementsContainer}>
      <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
        Achievements 🏆
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {achievements.map((achievement) => (
          <View key={achievement.id} style={[
            styles.achievementCard,
            achievement.earned && styles.achievementEarned
          ]}>
            <Icon
              name={achievement.icon}
              size={32}
              color={achievement.earned ? COLORS.warning : COLORS.textSecondary}
            />
            <Text style={[
              styles.achievementTitle,
              achievement.earned && styles.achievementTitleEarned
            ]}>
              {achievement.title}
            </Text>
            <Text style={styles.achievementDescription}>
              {achievement.description}
            </Text>
          </View>
        ))}
      </ScrollView>
    </Surface>
  );

  const filteredMeals = weeklyMeals[selectedDay]?.meals.filter(meal => 
    activeFilter === 'all' || meal.type === activeFilter
  ) || [];

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      {renderHeader()}
      
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {renderQuickActions()}
        {renderDailyProgress()}
        {renderAchievements()}
        {renderMealFilters()}
        
        <View style={styles.mealsContainer}>
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
            Today's Meals 🍽️
          </Text>
          {filteredMeals.map(renderMealCard)}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => setShowMealPlanner(true)}
        label="Add Meal"
      />

      {/* Meal Planner Modal would be implemented here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight || 44,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    marginTop: SPACING.sm,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  headerLeft: {
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  quickActionsContainer: {
    marginTop: -SPACING.lg,
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    borderRadius: 16,
    elevation: 2,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: (width - SPACING.md * 4) / 2,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  quickActionTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    textAlign: 'center',
  },
  quickActionSubtitle: {
    ...TEXT_STYLES.small,
    textAlign: 'center',
    marginTop: 2,
  },
  progressContainer: {
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    borderRadius: 16,
    elevation: 2,
  },
  caloriesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.md,
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  macroItem: {
    alignItems: 'center',
  },
  macroLabel: {
    ...TEXT_STYLES.small,
    marginBottom: 2,
  },
  macroValue: {
    ...TEXT_STYLES.h3,
    fontSize: 16,
  },
  achievementsContainer: {
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    borderRadius: 16,
    elevation: 2,
  },
  achievementCard: {
    alignItems: 'center',
    padding: SPACING.md,
    marginRight: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    width: 120,
  },
  achievementEarned: {
    backgroundColor: `${COLORS.warning}15`,
  },
  achievementTitle: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: SPACING.xs,
    color: COLORS.textSecondary,
  },
  achievementTitleEarned: {
    color: COLORS.text,
  },
  achievementDescription: {
    ...TEXT_STYLES.small,
    textAlign: 'center',
    marginTop: 2,
  },
  filtersContainer: {
    marginBottom: SPACING.lg,
  },
  filterChip: {
    marginRight: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  activeFilterChip: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    color: COLORS.text,
  },
  activeFilterChipText: {
    color: 'white',
  },
  mealsContainer: {
    marginBottom: SPACING.xl,
  },
  mealCard: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderRadius: 16,
    elevation: 2,
  },
  mealCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  mealTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  mealTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  mealNutrition: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.md,
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    ...TEXT_STYLES.h3,
    fontSize: 16,
  },
  nutritionLabel: {
    ...TEXT_STYLES.small,
  },
  mealIngredients: {
    marginBottom: SPACING.md,
  },
  ingredientChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  ingredientChip: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
    height: 28,
  },
  ingredientChipText: {
    fontSize: 12,
  },
  mealActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mealActionButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default MealPrep;