import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  RefreshControl,
  Alert,
  Animated,
  Dimensions,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
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
  Dialog,
  TextInput,
  Menu,
  Divider,
  Switch,
  RadioButton,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Design system imports
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const MealPlanning = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  // Redux state
  const user = useSelector(state => state.user);
  const mealPlans = useSelector(state => state.mealPlanning);
  
  // Component state
  const [refreshing, setRefreshing] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(0); // 0 = Sunday
  const [activeView, setActiveView] = useState('week'); // 'week', 'day', 'recipes'
  const [searchQuery, setSearchQuery] = useState('');
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showMealPlanModal, setShowMealPlanModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState('breakfast');
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [autoGenerate, setAutoGenerate] = useState(false);
  
  // Filter states
  const [dietaryFilters, setDietaryFilters] = useState({
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    dairyFree: false,
    lowCarb: false,
    highProtein: false,
  });
  const [cuisineFilter, setCuisineFilter] = useState('all');
  const [prepTimeFilter, setPrepTimeFilter] = useState('all');
  const [calorieRange, setCalorieRange] = useState([200, 800]);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const fullWeekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // Mock data - in real app this would come from Redux store
  const [weeklyMealPlan, setWeeklyMealPlan] = useState({
    0: { // Sunday
      breakfast: { id: 1, name: 'Greek Yogurt Bowl', calories: 320, prepTime: 5, image: '🥣' },
      lunch: { id: 2, name: 'Chicken Salad Wrap', calories: 450, prepTime: 10, image: '🌯' },
      dinner: { id: 3, name: 'Salmon with Quinoa', calories: 520, prepTime: 25, image: '🐟' },
      snack: { id: 4, name: 'Apple & Almonds', calories: 180, prepTime: 2, image: '🍎' },
    },
    1: { // Monday
      breakfast: { id: 5, name: 'Protein Smoothie', calories: 280, prepTime: 5, image: '🥤' },
      lunch: null,
      dinner: { id: 6, name: 'Turkey Meatballs', calories: 480, prepTime: 30, image: '🍝' },
      snack: null,
    },
    2: { // Tuesday
      breakfast: null,
      lunch: { id: 7, name: 'Buddha Bowl', calories: 520, prepTime: 15, image: '🥗' },
      dinner: null,
      snack: { id: 8, name: 'Protein Bar', calories: 200, prepTime: 0, image: '🍫' },
    },
    3: { breakfast: null, lunch: null, dinner: null, snack: null }, // Wednesday
    4: { breakfast: null, lunch: null, dinner: null, snack: null }, // Thursday
    5: { breakfast: null, lunch: null, dinner: null, snack: null }, // Friday
    6: { breakfast: null, lunch: null, dinner: null, snack: null }, // Saturday
  });
  
  const [recommendedRecipes] = useState([
    {
      id: 1,
      name: 'High-Protein Overnight Oats',
      image: '🥣',
      calories: 340,
      protein: 25,
      prepTime: 5,
      cookTime: 0,
      difficulty: 'Easy',
      tags: ['High Protein', 'Make Ahead', 'Vegetarian'],
      rating: 4.8,
      ingredients: ['Oats', 'Greek Yogurt', 'Protein Powder', 'Berries'],
      description: 'Perfect breakfast to fuel your workouts and keep you satisfied until lunch.',
    },
    {
      id: 2,
      name: 'Grilled Chicken Power Bowl',
      image: '🥗',
      calories: 480,
      protein: 42,
      prepTime: 15,
      cookTime: 20,
      difficulty: 'Medium',
      tags: ['High Protein', 'Gluten Free', 'Low Carb'],
      rating: 4.9,
      ingredients: ['Chicken Breast', 'Quinoa', 'Vegetables', 'Avocado'],
      description: 'Complete post-workout meal packed with lean protein and complex carbs.',
    },
    {
      id: 3,
      name: 'Veggie-Packed Smoothie Bowl',
      image: '🍓',
      calories: 290,
      protein: 18,
      prepTime: 10,
      cookTime: 0,
      difficulty: 'Easy',
      tags: ['Vegetarian', 'Antioxidant Rich', 'Quick'],
      rating: 4.6,
      ingredients: ['Spinach', 'Banana', 'Protein Powder', 'Berries'],
      description: 'Nutrient-dense smoothie bowl that tastes like dessert but fuels your day.',
    },
    {
      id: 4,
      name: 'Mediterranean Tuna Salad',
      image: '🐟',
      calories: 380,
      protein: 35,
      prepTime: 12,
      cookTime: 0,
      difficulty: 'Easy',
      tags: ['High Protein', 'Mediterranean', 'Quick'],
      rating: 4.7,
      ingredients: ['Tuna', 'Chickpeas', 'Olives', 'Feta Cheese'],
      description: 'Light yet satisfying meal perfect for lunch or post-workout recovery.',
    },
    {
      id: 5,
      name: 'Sweet Potato & Black Bean Curry',
      image: '🍠',
      calories: 420,
      protein: 16,
      prepTime: 10,
      cookTime: 25,
      difficulty: 'Medium',
      tags: ['Vegan', 'Fiber Rich', 'Comfort Food'],
      rating: 4.5,
      ingredients: ['Sweet Potato', 'Black Beans', 'Coconut Milk', 'Spices'],
      description: 'Hearty plant-based meal that\'s both comforting and nutritious.',
    },
    {
      id: 6,
      name: 'Lean Turkey Meatballs',
      image: '🍝',
      calories: 350,
      protein: 30,
      prepTime: 15,
      cookTime: 20,
      difficulty: 'Medium',
      tags: ['High Protein', 'Make Ahead', 'Family Friendly'],
      rating: 4.8,
      ingredients: ['Ground Turkey', 'Zucchini Noodles', 'Marinara', 'Herbs'],
      description: 'Protein-packed comfort food that fits perfectly into your fitness goals.',
    },
  ]);
  
  const [mealPlanTemplates] = useState([
    {
      id: 1,
      name: 'Muscle Building Plan',
      description: 'High protein meals for strength training',
      calories: 2800,
      protein: 220,
      duration: '7 days',
      image: '💪',
      popularity: 95,
    },
    {
      id: 2,
      name: 'Fat Loss Focus',
      description: 'Calorie-controlled meals for weight loss',
      calories: 1800,
      protein: 150,
      duration: '7 days',
      image: '🔥',
      popularity: 88,
    },
    {
      id: 3,
      name: 'Endurance Athlete',
      description: 'Carb-focused meals for endurance sports',
      calories: 3200,
      protein: 180,
      duration: '7 days',
      image: '🏃‍♂️',
      popularity: 82,
    },
    {
      id: 4,
      name: 'Plant-Based Power',
      description: 'Complete vegan nutrition for fitness',
      calories: 2400,
      protein: 120,
      duration: '7 days',
      image: '🌱',
      popularity: 76,
    },
  ]);
  
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
  }, []);
  
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('Updated! 🍽️', 'Your meal plans have been refreshed with new recipes.');
    }, 2000);
  }, []);
  
  const addMealToPlan = (recipe, dayIndex, mealType) => {
    setWeeklyMealPlan(prev => ({
      ...prev,
      [dayIndex]: {
        ...prev[dayIndex],
        [mealType]: {
          id: recipe.id,
          name: recipe.name,
          calories: recipe.calories,
          prepTime: recipe.prepTime,
          image: recipe.image,
        }
      }
    }));
    setShowRecipeModal(false);
    Alert.alert('Added! 🎉', `${recipe.name} has been added to your ${mealType} plan.`);
  };
  
  const removeMealFromPlan = (dayIndex, mealType) => {
    setWeeklyMealPlan(prev => ({
      ...prev,
      [dayIndex]: {
        ...prev[dayIndex],
        [mealType]: null
      }
    }));
  };
  
  const generateMealPlan = (template) => {
    Alert.alert(
      'Generate Meal Plan 🤖',
      `This will create a ${template.duration} meal plan based on "${template.name}". Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Generate', onPress: () => {
          // In real app, this would call AI service
          Alert.alert('Success! 🎯', 'Your personalized meal plan has been generated!');
          setShowMealPlanModal(false);
        }}
      ]
    );
  };
  
  const getWeekCalories = () => {
    let totalCalories = 0;
    Object.values(weeklyMealPlan).forEach(day => {
      Object.values(day).forEach(meal => {
        if (meal) totalCalories += meal.calories;
      });
    });
    return totalCalories;
  };
  
  const getWeekCompleteness = () => {
    let totalSlots = 0;
    let filledSlots = 0;
    Object.values(weeklyMealPlan).forEach(day => {
      Object.values(day).forEach(meal => {
        totalSlots++;
        if (meal) filledSlots++;
      });
    });
    return Math.round((filledSlots / totalSlots) * 100);
  };
  
  const filteredRecipes = recommendedRecipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         recipe.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesDietary = Object.entries(dietaryFilters).every(([filter, enabled]) => {
      if (!enabled) return true;
      return recipe.tags.some(tag => tag.toLowerCase().includes(filter.replace(/([A-Z])/g, ' $1').toLowerCase()));
    });
    
    const matchesCalories = recipe.calories >= calorieRange[0] && recipe.calories <= calorieRange[1];
    
    return matchesSearch && matchesDietary && matchesCalories;
  });
  
  const renderDayCard = (dayIndex) => {
    const dayMeals = weeklyMealPlan[dayIndex];
    const dayCalories = Object.values(dayMeals).reduce((sum, meal) => sum + (meal?.calories || 0), 0);
    const filledMeals = Object.values(dayMeals).filter(meal => meal !== null).length;
    
    return (
      <TouchableOpacity
        key={dayIndex}
        onPress={() => {
          setSelectedDay(dayIndex);
          setActiveView('day');
        }}
        style={{ marginRight: SPACING.md, width: width * 0.28 }}
      >
        <Card style={{ elevation: 3, backgroundColor: selectedDay === dayIndex ? COLORS.primary : 'white' }}>
          <Card.Content style={{ alignItems: 'center', padding: SPACING.sm }}>
            <Text style={[
              TEXT_STYLES.caption, 
              { 
                color: selectedDay === dayIndex ? 'white' : COLORS.textSecondary, 
                marginBottom: SPACING.xs 
              }
            ]}>
              {weekDays[dayIndex].toUpperCase()}
            </Text>
            <Text style={[
              TEXT_STYLES.subtitle, 
              { 
                color: selectedDay === dayIndex ? 'white' : COLORS.textPrimary, 
                marginBottom: SPACING.xs 
              }
            ]}>
              {filledMeals}/4
            </Text>
            <ProgressBar
              progress={filledMeals / 4}
              color={selectedDay === dayIndex ? 'white' : COLORS.success}
              style={{ 
                width: '100%', 
                height: 3, 
                backgroundColor: selectedDay === dayIndex ? 'rgba(255,255,255,0.3)' : '#f0f0f0' 
              }}
            />
            <Text style={[
              TEXT_STYLES.caption, 
              { 
                color: selectedDay === dayIndex ? 'rgba(255,255,255,0.8)' : COLORS.textSecondary, 
                marginTop: SPACING.xs 
              }
            ]}>
              {dayCalories} cal
            </Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };
  
  const renderMealSlot = (mealType, meal, dayIndex, icon, color) => (
    <Card style={{ marginBottom: SPACING.md, elevation: 2 }}>
      <Card.Content>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Icon name={icon} size={24} color={color} style={{ marginRight: SPACING.sm }} />
            <View style={{ flex: 1 }}>
              <Text style={[TEXT_STYLES.subtitle, { textTransform: 'capitalize' }]}>{mealType}</Text>
              {meal ? (
                <View>
                  <Text style={[TEXT_STYLES.body, { color: COLORS.textPrimary }]}>{meal.name}</Text>
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                    {meal.calories} cal • {meal.prepTime} min prep
                  </Text>
                </View>
              ) : (
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                  Tap + to add a meal
                </Text>
              )}
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {meal && (
              <IconButton
                icon="delete"
                size={20}
                iconColor={COLORS.error}
                onPress={() => removeMealFromPlan(dayIndex, mealType)}
              />
            )}
            <IconButton
              icon="add"
              size={20}
              iconColor={COLORS.primary}
              onPress={() => {
                setSelectedMealType(mealType);
                setSelectedDayIndex(dayIndex);
                setShowRecipeModal(true);
              }}
            />
          </View>
        </View>
      </Card.Content>
    </Card>
  );
  
  const renderRecipeCard = (recipe) => (
    <TouchableOpacity
      onPress={() => setSelectedRecipe(recipe)}
      style={{ marginRight: SPACING.md, width: width * 0.7 }}
    >
      <Card style={{ elevation: 4 }}>
        <Card.Content>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
            <Text style={{ fontSize: 32, marginRight: SPACING.sm }}>{recipe.image}</Text>
            <View style={{ flex: 1 }}>
              <Text style={TEXT_STYLES.subtitle} numberOfLines={1}>{recipe.name}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                <Icon name="star" size={14} color="#ffc107" />
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginLeft: 2 }]}>
                  {recipe.rating}
                </Text>
              </View>
            </View>
          </View>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.primary, fontWeight: 'bold' }]}>
                {recipe.calories}
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>calories</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.success, fontWeight: 'bold' }]}>
                {recipe.protein}g
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>protein</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={[TEXT_STYLES.caption, { color: '#ff9500', fontWeight: 'bold' }]}>
                {recipe.prepTime + recipe.cookTime}
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>min total</Text>
            </View>
          </View>
          
          <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginBottom: SPACING.xs }]} numberOfLines={2}>
            {recipe.description}
          </Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row' }}>
              {recipe.tags.map((tag, index) => (
                <Chip
                  key={index}
                  compact
                  textStyle={{ fontSize: 10 }}
                  style={{ marginRight: SPACING.xs, height: 24 }}
                >
                  {tag}
                </Chip>
              ))}
            </View>
          </ScrollView>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
  
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <View style={{ flex: 1, backgroundColor: COLORS.background }}>
        {/* Header */}
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={{ paddingTop: StatusBar.currentHeight + SPACING.lg, paddingBottom: SPACING.lg }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.lg }}>
            <IconButton
              icon="arrow-back"
              iconColor="white"
              size={24}
              onPress={() => navigation.goBack()}
            />
            <View style={{ flex: 1 }}>
              <Text style={[TEXT_STYLES.h2, { color: 'white', textAlign: 'center', marginRight: 48 }]}>
                Meal Planning
              </Text>
            </View>
          </View>
          
          {/* Quick Stats */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: SPACING.md, paddingHorizontal: SPACING.lg }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>{getWeekCompleteness()}%</Text>
              <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>Complete</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>{getWeekCalories()}</Text>
              <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>Week Calories</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>28</Text>
              <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>Total Meals</Text>
            </View>
          </View>
        </LinearGradient>
        
        {/* View Toggle */}
        <Surface style={{ elevation: 2, backgroundColor: 'white' }}>
          <View style={{ flexDirection: 'row', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm }}>
            {[
              { key: 'week', label: 'Week View', icon: 'view-week' },
              { key: 'day', label: 'Day View', icon: 'today' },
              { key: 'recipes', label: 'Recipes', icon: 'restaurant-menu' },
            ].map((view) => (
              <TouchableOpacity
                key={view.key}
                onPress={() => setActiveView(view.key)}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: SPACING.sm,
                  backgroundColor: activeView === view.key ? COLORS.primary : 'transparent',
                  borderRadius: 8,
                  marginHorizontal: 2,
                }}
              >
                <Icon 
                  name={view.icon} 
                  size={18} 
                  color={activeView === view.key ? 'white' : COLORS.textSecondary} 
                  style={{ marginRight: 4 }}
                />
                <Text style={[
                  TEXT_STYLES.caption,
                  { color: activeView === view.key ? 'white' : COLORS.textSecondary }
                ]}>
                  {view.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Surface>
        
        <Animated.ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: SPACING.lg }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              progressBackgroundColor="white"
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Week View */}
          {activeView === 'week' && (
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
              {/* Week Navigation */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.lg }}>
                <IconButton icon="chevron-left" onPress={() => {}} />
                <Text style={[TEXT_STYLES.h3, { minWidth: 200, textAlign: 'center' }]}>
                  This Week
                </Text>
                <IconButton icon="chevron-right" onPress={() => {}} />
              </View>
              
              {/* Week Overview Cards */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.lg }}>
                {Array.from({ length: 7 }).map((_, index) => renderDayCard(index))}
              </ScrollView>
              
              {/* Quick Actions */}
              <View style={{ flexDirection: 'row', marginBottom: SPACING.lg }}>
                <Button
                  mode="outlined"
                  onPress={() => setShowMealPlanModal(true)}
                  style={{ flex: 1, marginRight: SPACING.sm }}
                  icon="auto-fix-high"
                >
                  Generate Plan
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => setShowFilterModal(true)}
                  style={{ flex: 1, marginLeft: SPACING.sm }}
                  icon="tune"
                >
                  Preferences
                </Button>
              </View>
              
              {/* Weekly Summary */}
              <Card style={{ elevation: 4 }}>
                <Card.Content>
                  <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>Weekly Progress 📊</Text>
                  
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm }}>
                    <Text style={TEXT_STYLES.subtitle}>Planned Meals</Text>
                    <Text style={[TEXT_STYLES.subtitle, { color: COLORS.primary }]}>
                      {Object.values(weeklyMealPlan).reduce((count, day) => 
                        count + Object.values(day).filter(meal => meal !== null).length, 0
                      )}/28
                    </Text>
                  </View>
                  
                  <ProgressBar
                    progress={getWeekCompleteness() / 100}
                    color={COLORS.success}
                    style={{ height: 6, marginBottom: SPACING.md }}
                  />
                  
                  <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                    <View style={{ alignItems: 'center' }}>
                      <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>
                        {Math.round(getWeekCalories() / 7)}
                      </Text>
                      <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Avg Daily Calories</Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                      <Text style={[TEXT_STYLES.h3, { color: COLORS.success }]}>85%</Text>
                      <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Protein Target</Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                      <Text style={[TEXT_STYLES.h3, { color: '#ff9500' }]}>4.2</Text>
                      <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Avg Prep Time</Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            </Animated.View>
          )}
          
          {/* Day View */}
          {activeView === 'day' && (
            <Animated.View style={{ opacity: fadeAnim }}>
              <Text style={[TEXT_STYLES.h2, { marginBottom: SPACING.lg, textAlign: 'center' }]}>
                {fullWeekDays[selectedDay]} Meals 🍽️
              </Text>
              
              {renderMealSlot('breakfast', weeklyMealPlan[selectedDay].breakfast, selectedDay, 'wb-sunny', '#ff9500')}
              {renderMealSlot('lunch', weeklyMealPlan[selectedDay].lunch, selectedDay, 'restaurant', '#34c759')}
              {renderMealSlot('dinner', weeklyMealPlan[selectedDay].dinner, selectedDay, 'dinner-dining', '#ff3b30')}
              {renderMealSlot('snack', weeklyMealPlan[selectedDay].snack, selectedDay, 'cookie', '#5856d6')}
              
              {/* Day Summary */}
              <Card style={{ marginTop: SPACING.lg, elevation: 3 }}>
                <Card.Content>
                  <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>Day Summary 📈</Text>
                  
                  <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                    <View style={{ alignItems: 'center' }}>
                      <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>
                        {Object.values(weeklyMealPlan[selectedDay]).reduce((sum, meal) => sum + (meal?.calories || 0), 0)}
                      </Text>
                      <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Total Calories</Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                      <Text style={[TEXT_STYLES.h3, { color: COLORS.success }]}>
                        {Object.values(weeklyMealPlan[selectedDay]).filter(meal => meal !== null).length}
                      </Text>
                      <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Meals Planned</Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                      <Text style={[TEXT_STYLES.h3, { color: '#ff9500' }]}>
                        {Object.values(weeklyMealPlan[selectedDay]).reduce((sum, meal) => sum + (meal?.prepTime || 0), 0)}
                      </Text>
                      <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Total Prep Time</Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            </Animated.View>
          )}
          
          {/* Recipes View */}
          {activeView === 'recipes' && (
            <Animated.View style={{ opacity: fadeAnim }}>
              {/* Search and Filter */}
              <View style={{ marginBottom: SPACING.lg }}>
                <Searchbar
                  placeholder="Search recipes, ingredients, or tags..."
                  onChangeText={setSearchQuery}
                  value={searchQuery}
                  style={{ marginBottom: SPACING.md }}
                />
                
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row' }}>
                      {Object.entries(dietaryFilters).map(([filter, enabled]) => (
                        <Chip
                          key={filter}
                          selected={enabled}
                          onPress={() => setDietaryFilters(prev => ({
                            ...prev,
                            [filter]: !prev[filter]
                          }))}
                          style={{ marginRight: SPACING.sm }}
                        >
                          {filter.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </Chip>
                      ))}
                    </View>
                  </ScrollView>
                  <IconButton
                    icon="tune"
                    onPress={() => setShowFilterModal(true)}
                  />
                </View>
              </View>
              
              {/* Featured Recipes */}
              <View style={{ marginBottom: SPACING.lg }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.md }}>
                  <Text style={TEXT_STYLES.h3}>Featured Recipes ⭐</Text>
                  <TouchableOpacity>
                    <Text style={[TEXT_STYLES.caption, { color: COLORS.primary }]}>View All</Text>
                  </TouchableOpacity>
                </View>
                
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {filteredRecipes.slice(0, 3).map((recipe) => renderRecipeCard(recipe))}
                </ScrollView>
              </View>
              
              {/* All Recipes */}
              <View style={{ marginBottom: SPACING.xl }}>
                <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
                  All Recipes ({filteredRecipes.length}) 🍳
                </Text>
                
                {filteredRecipes.map((recipe) => (
                  <TouchableOpacity
                    key={recipe.id}
                    onPress={() => setSelectedRecipe(recipe)}
                    style={{ marginBottom: SPACING.md }}
                  >
                    <Card style={{ elevation: 2 }}>
                      <Card.Content>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={{ fontSize: 40, marginRight: SPACING.md }}>{recipe.image}</Text>
                          
                          <View style={{ flex: 1 }}>
                            <Text style={TEXT_STYLES.subtitle}>{recipe.name}</Text>
                            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginVertical: 2 }]} numberOfLines={2}>
                              {recipe.description}
                            </Text>
                            
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: SPACING.xs }}>
                              <Icon name="star" size={14} color="#ffc107" />
                              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginLeft: 2, marginRight: SPACING.sm }]}>
                                {recipe.rating}
                              </Text>
                              <Icon name="access-time" size={14} color={COLORS.textSecondary} />
                              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginLeft: 2, marginRight: SPACING.sm }]}>
                                {recipe.prepTime + recipe.cookTime}min
                              </Text>
                              <Icon name="local-fire-department" size={14} color={COLORS.error} />
                              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginLeft: 2 }]}>
                                {recipe.calories} cal
                              </Text>
                            </View>
                            
                            <View style={{ flexDirection: 'row', marginTop: SPACING.xs }}>
                              {recipe.tags.slice(0, 2).map((tag, index) => (
                                <Chip key={index} compact textStyle={{ fontSize: 10 }} style={{ marginRight: 4, height: 20 }}>
                                  {tag}
                                </Chip>
                              ))}
                            </View>
                          </View>
                          
                          <IconButton
                            icon="add"
                            iconColor={COLORS.primary}
                            onPress={() => {
                              Alert.alert(
                                'Add to Meal Plan 🍽️',
                                'Which meal would you like to add this recipe to?',
                                [
                                  { text: 'Cancel', style: 'cancel' },
                                  { text: 'Breakfast', onPress: () => addMealToPlan(recipe, selectedDay, 'breakfast') },
                                  { text: 'Lunch', onPress: () => addMealToPlan(recipe, selectedDay, 'lunch') },
                                  { text: 'Dinner', onPress: () => addMealToPlan(recipe, selectedDay, 'dinner') },
                                  { text: 'Snack', onPress: () => addMealToPlan(recipe, selectedDay, 'snack') },
                                ]
                              );
                            }}
                          />
                        </View>
                      </Card.Content>
                    </Card>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          )}
        </Animated.ScrollView>
        
        {/* Recipe Selection Modal */}
        <Portal>
          <Modal
            visible={showRecipeModal}
            onDismiss={() => setShowRecipeModal(false)}
            contentContainerStyle={{
              backgroundColor: 'white',
              margin: SPACING.lg,
              borderRadius: 12,
              maxHeight: '80%',
            }}
          >
            <View style={{ padding: SPACING.lg }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.lg }}>
                <Text style={TEXT_STYLES.h2}>Choose Recipe for {selectedMealType}</Text>
                <IconButton icon="close" onPress={() => setShowRecipeModal(false)} />
              </View>
              
              <Searchbar
                placeholder="Search recipes..."
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={{ marginBottom: SPACING.md }}
              />
              
              <FlatList
                data={filteredRecipes}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: SPACING.md,
                      borderBottomWidth: 1,
                      borderBottomColor: '#f0f0f0'
                    }}
                    onPress={() => addMealToPlan(item, selectedDayIndex, selectedMealType)}
                  >
                    <Text style={{ fontSize: 32, marginRight: SPACING.md }}>{item.image}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={TEXT_STYLES.subtitle}>{item.name}</Text>
                      <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                        {item.calories} cal • {item.prepTime + item.cookTime} min • {item.protein}g protein
                      </Text>
                    </View>
                    <Icon name="add" size={24} color={COLORS.primary} />
                  </TouchableOpacity>
                )}
                style={{ maxHeight: 400 }}
              />
            </View>
          </Modal>
        </Portal>
        
        {/* Recipe Details Modal */}
        <Portal>
          <Modal
            visible={selectedRecipe !== null}
            onDismiss={() => setSelectedRecipe(null)}
            contentContainerStyle={{
              backgroundColor: 'white',
              margin: SPACING.lg,
              borderRadius: 12,
              maxHeight: '90%',
            }}
          >
            {selectedRecipe && (
              <ScrollView style={{ padding: SPACING.lg }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.lg }}>
                  <Text style={TEXT_STYLES.h2} numberOfLines={2}>{selectedRecipe.name}</Text>
                  <IconButton icon="close" onPress={() => setSelectedRecipe(null)} />
                </View>
                
                <View style={{ alignItems: 'center', marginBottom: SPACING.lg }}>
                  <Text style={{ fontSize: 80, marginBottom: SPACING.sm }}>{selectedRecipe.image}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
                    <Icon name="star" size={20} color="#ffc107" />
                    <Text style={[TEXT_STYLES.subtitle, { marginLeft: 4 }]}>{selectedRecipe.rating}</Text>
                    <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginLeft: SPACING.sm }]}>
                      ({selectedRecipe.difficulty})
                    </Text>
                  </View>
                </View>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: SPACING.lg }}>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>{selectedRecipe.calories}</Text>
                    <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>calories</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={[TEXT_STYLES.h3, { color: COLORS.success }]}>{selectedRecipe.protein}g</Text>
                    <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>protein</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={[TEXT_STYLES.h3, { color: '#ff9500' }]}>{selectedRecipe.prepTime}</Text>
                    <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>prep min</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={[TEXT_STYLES.h3, { color: COLORS.error }]}>{selectedRecipe.cookTime}</Text>
                    <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>cook min</Text>
                  </View>
                </View>
                
                <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary, marginBottom: SPACING.lg }]}>
                  {selectedRecipe.description}
                </Text>
                
                <View style={{ marginBottom: SPACING.lg }}>
                  <Text style={[TEXT_STYLES.subtitle, { marginBottom: SPACING.sm }]}>Tags</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {selectedRecipe.tags.map((tag, index) => (
                      <Chip key={index} style={{ margin: 2 }}>{tag}</Chip>
                    ))}
                  </View>
                </View>
                
                <View style={{ marginBottom: SPACING.lg }}>
                  <Text style={[TEXT_STYLES.subtitle, { marginBottom: SPACING.sm }]}>Main Ingredients</Text>
                  {selectedRecipe.ingredients.map((ingredient, index) => (
                    <Text key={index} style={[TEXT_STYLES.body, { color: COLORS.textSecondary, marginBottom: 4 }]}>
                      • {ingredient}
                    </Text>
                  ))}
                </View>
                
                <View style={{ flexDirection: 'row', marginBottom: SPACING.lg }}>
                  <Button
                    mode="contained"
                    onPress={() => {
                      Alert.alert(
                        'Add to Meal Plan 🍽️',
                        'Which meal would you like to add this recipe to?',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Breakfast', onPress: () => addMealToPlan(selectedRecipe, selectedDay, 'breakfast') },
                          { text: 'Lunch', onPress: () => addMealToPlan(selectedRecipe, selectedDay, 'lunch') },
                          { text: 'Dinner', onPress: () => addMealToPlan(selectedRecipe, selectedDay, 'dinner') },
                          { text: 'Snack', onPress: () => addMealToPlan(selectedRecipe, selectedDay, 'snack') },
                        ]
                      );
                    }}
                    style={{ flex: 1, marginRight: SPACING.sm }}
                  >
                    Add to Plan
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={() => {
                      Alert.alert('Coming Soon! 📝', 'Full recipe details and cooking instructions will be available soon.');
                    }}
                    style={{ flex: 1, marginLeft: SPACING.sm }}
                  >
                    View Recipe
                  </Button>
                </View>
              </ScrollView>
            )}
          </Modal>
        </Portal>
        
        {/* Meal Plan Generation Modal */}
        <Portal>
          <Modal
            visible={showMealPlanModal}
            onDismiss={() => setShowMealPlanModal(false)}
            contentContainerStyle={{
              backgroundColor: 'white',
              margin: SPACING.lg,
              borderRadius: 12,
              maxHeight: '80%',
            }}
          >
            <ScrollView style={{ padding: SPACING.lg }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.lg }}>
                <Text style={TEXT_STYLES.h2}>Generate Meal Plan</Text>
                <IconButton icon="close" onPress={() => setShowMealPlanModal(false)} />
              </View>
              
              <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary, marginBottom: SPACING.lg }]}>
                Choose a meal plan template that matches your fitness goals and let AI create a personalized weekly plan for you! 🤖
              </Text>
              
              {mealPlanTemplates.map((template) => (
                <TouchableOpacity
                  key={template.id}
                  onPress={() => generateMealPlan(template)}
                  style={{ marginBottom: SPACING.md }}
                >
                  <Card style={{ elevation: 2 }}>
                    <Card.Content>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontSize: 40, marginRight: SPACING.md }}>{template.image}</Text>
                        
                        <View style={{ flex: 1 }}>
                          <Text style={TEXT_STYLES.subtitle}>{template.name}</Text>
                          <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginVertical: 2 }]}>
                            {template.description}
                          </Text>
                          
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: SPACING.xs }}>
                            <Icon name="local-fire-department" size={14} color={COLORS.error} />
                            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginLeft: 2, marginRight: SPACING.sm }]}>
                              {template.calories} cal/day
                            </Text>
                            <Icon name="fitness-center" size={14} color={COLORS.success} />
                            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginLeft: 2, marginRight: SPACING.sm }]}>
                              {template.protein}g protein
                            </Text>
                            <Icon name="schedule" size={14} color={COLORS.primary} />
                            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginLeft: 2 }]}>
                              {template.duration}
                            </Text>
                          </View>
                          
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: SPACING.xs }}>
                            <Icon name="trending-up" size={14} color="#ffc107" />
                            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginLeft: 2 }]}>
                              {template.popularity}% match rate
                            </Text>
                          </View>
                        </View>
                        
                        <Icon name="arrow-forward" size={24} color={COLORS.primary} />
                      </View>
                    </Card.Content>
                  </Card>
                </TouchableOpacity>
              ))}
              
              <Divider style={{ marginVertical: SPACING.lg }} />
              
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={TEXT_STYLES.subtitle}>Auto-generate weekly plans</Text>
                <Switch
                  value={autoGenerate}
                  onValueChange={setAutoGenerate}
                />
              </View>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginTop: 4 }]}>
                Automatically create new meal plans based on your preferences and goals
              </Text>
            </ScrollView>
          </Modal>
        </Portal>
        
        {/* Filter Modal */}
        <Portal>
          <Modal
            visible={showFilterModal}
            onDismiss={() => setShowFilterModal(false)}
            contentContainerStyle={{
              backgroundColor: 'white',
              margin: SPACING.lg,
              borderRadius: 12,
              maxHeight: '80%',
            }}
          >
            <ScrollView style={{ padding: SPACING.lg }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.lg }}>
                <Text style={TEXT_STYLES.h2}>Meal Preferences</Text>
                <IconButton icon="close" onPress={() => setShowFilterModal(false)} />
              </View>
              
              <View style={{ marginBottom: SPACING.lg }}>
                <Text style={[TEXT_STYLES.subtitle, { marginBottom: SPACING.md }]}>Dietary Restrictions</Text>
                {Object.entries(dietaryFilters).map(([filter, enabled]) => (
                  <View key={filter} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.sm }}>
                    <Text style={TEXT_STYLES.body}>
                      {filter.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </Text>
                    <Switch
                      value={enabled}
                      onValueChange={(value) => setDietaryFilters(prev => ({
                        ...prev,
                        [filter]: value
                      }))}
                    />
                  </View>
                ))}
              </View>
              
              <Divider style={{ marginVertical: SPACING.lg }} />
              
              <View style={{ marginBottom: SPACING.lg }}>
                <Text style={[TEXT_STYLES.subtitle, { marginBottom: SPACING.md }]}>Cuisine Preference</Text>
                {['all', 'mediterranean', 'asian', 'american', 'mexican', 'italian'].map((cuisine) => (
                  <TouchableOpacity
                    key={cuisine}
                    onPress={() => setCuisineFilter(cuisine)}
                    style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}
                  >
                    <RadioButton
                      value={cuisine}
                      status={cuisineFilter === cuisine ? 'checked' : 'unchecked'}
                      onPress={() => setCuisineFilter(cuisine)}
                    />
                    <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.sm, textTransform: 'capitalize' }]}>
                      {cuisine === 'all' ? 'All Cuisines' : cuisine}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <Divider style={{ marginVertical: SPACING.lg }} />
              
              <View style={{ marginBottom: SPACING.lg }}>
                <Text style={[TEXT_STYLES.subtitle, { marginBottom: SPACING.md }]}>Prep Time</Text>
                {['all', 'quick', 'medium', 'extended'].map((time) => (
                  <TouchableOpacity
                    key={time}
                    onPress={() => setPrepTimeFilter(time)}
                    style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}
                  >
                    <RadioButton
                      value={time}
                      status={prepTimeFilter === time ? 'checked' : 'unchecked'}
                      onPress={() => setPrepTimeFilter(time)}
                    />
                    <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.sm }]}>
                      {time === 'all' ? 'Any prep time' : 
                       time === 'quick' ? 'Under 15 minutes' :
                       time === 'medium' ? '15-30 minutes' :
                       'Over 30 minutes'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <View style={{ flexDirection: 'row', marginTop: SPACING.lg }}>
                <Button
                  mode="outlined"
                  onPress={() => {
                    setDietaryFilters({
                      vegetarian: false,
                      vegan: false,
                      glutenFree: false,
                      dairyFree: false,
                      lowCarb: false,
                      highProtein: false,
                    });
                    setCuisineFilter('all');
                    setPrepTimeFilter('all');
                    setCalorieRange([200, 800]);
                  }}
                  style={{ flex: 1, marginRight: SPACING.sm }}
                >
                  Reset
                </Button>
                <Button
                  mode="contained"
                  onPress={() => setShowFilterModal(false)}
                  style={{ flex: 1, marginLeft: SPACING.sm }}
                >
                  Apply Filters
                </Button>
              </View>
            </ScrollView>
          </Modal>
        </Portal>
        
        {/* Floating Action Button */}
        <FAB
          icon="add"
          style={{
            position: 'absolute',
            margin: SPACING.lg,
            right: 0,
            bottom: 0,
            backgroundColor: COLORS.primary,
          }}
          onPress={() => {
            Alert.alert(
              'Quick Add 🚀',
              'What would you like to add?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Recipe', onPress: () => setActiveView('recipes') },
                { text: 'Meal Plan', onPress: () => setShowMealPlanModal(true) },
                { text: 'Custom Recipe', onPress: () => Alert.alert('Coming Soon! 👨‍🍳', 'Create your own recipes feature coming soon!') },
              ]
            );
          }}
        />
      </View>
    </>
  );
};

export default MealPlanning;