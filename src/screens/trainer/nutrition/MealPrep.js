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
  FlatList,
  Image,
  Alert,
  Animated,
  Vibration,
  ImageBackground,
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
  Checkbox,
  RadioButton,
  TextInput,
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

const MealPrep = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMealType, setSelectedMealType] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [weeklyPlanModal, setWeeklyPlanModal] = useState(false);
  const [shoppingListModal, setShoppingListModal] = useState(false);
  const [prepTrackerModal, setPrepTrackerModal] = useState(false);
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [weeklyMealPlan, setWeeklyMealPlan] = useState({});
  const [shoppingList, setShoppingList] = useState([]);
  const [prepProgress, setPrepProgress] = useState({});
  
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // Mock data for meal prep content
  const mealTypes = [
    { id: 'all', name: 'All Meals', icon: 'restaurant', color: COLORS.primary },
    { id: 'breakfast', name: 'Breakfast', icon: 'breakfast-dining', color: '#f59e0b' },
    { id: 'lunch', name: 'Lunch', icon: 'lunch-dining', color: '#10b981' },
    { id: 'dinner', name: 'Dinner', icon: 'dinner-dining', color: '#8b5cf6' },
    { id: 'snacks', name: 'Snacks', icon: 'cookie', color: '#ec4899' },
    { id: 'post-workout', name: 'Post-Workout', icon: 'fitness-center', color: '#ef4444' },
  ];

  const difficultyLevels = [
    { id: 'all', name: 'All Levels', color: COLORS.textSecondary },
    { id: 'easy', name: 'Easy (15 min)', color: COLORS.success },
    { id: 'medium', name: 'Medium (30 min)', color: COLORS.warning },
    { id: 'hard', name: 'Hard (45+ min)', color: COLORS.error },
  ];

  const mealPrepRecipes = [
    {
      id: 1,
      title: 'High-Protein Chicken & Rice Bowl',
      mealType: 'lunch',
      difficulty: 'easy',
      prepTime: 15,
      cookTime: 25,
      servings: 6,
      calories: 485,
      protein: 42,
      carbs: 38,
      fat: 18,
      image: 'https://via.placeholder.com/300x200?text=Chicken+Bowl',
      rating: 4.8,
      reviews: 124,
      prepFriendly: true,
      freezable: true,
      ingredients: [
        { name: 'Chicken breast', amount: '2 lbs', category: 'protein' },
        { name: 'Brown rice', amount: '2 cups', category: 'carbs' },
        { name: 'Broccoli', amount: '3 cups', category: 'vegetables' },
        { name: 'Olive oil', amount: '2 tbsp', category: 'fats' },
        { name: 'Garlic powder', amount: '1 tsp', category: 'seasonings' },
        { name: 'Salt & pepper', amount: 'to taste', category: 'seasonings' },
      ],
      instructions: [
        'Season chicken with garlic powder, salt, and pepper',
        'Cook chicken in olive oil until golden (6-8 min per side)',
        'Cook rice according to package instructions',
        'Steam broccoli until tender-crisp',
        'Slice chicken and divide into meal containers',
        'Add rice and broccoli to containers'
      ],
      macroBreakdown: {
        protein: 35,
        carbs: 32,
        fat: 33
      },
      tags: ['high-protein', 'meal-prep', 'balanced', 'gluten-free'],
      storageInfo: {
        fridge: '4-5 days',
        freezer: '3 months',
        reheating: 'Microwave 2-3 minutes or oven at 350°F for 10 minutes'
      }
    },
    {
      id: 2,
      title: 'Overnight Protein Oats (5 Ways)',
      mealType: 'breakfast',
      difficulty: 'easy',
      prepTime: 10,
      cookTime: 0,
      servings: 5,
      calories: 320,
      protein: 25,
      carbs: 42,
      fat: 8,
      image: 'https://via.placeholder.com/300x200?text=Protein+Oats',
      rating: 4.9,
      reviews: 89,
      prepFriendly: true,
      freezable: false,
      ingredients: [
        { name: 'Rolled oats', amount: '2.5 cups', category: 'carbs' },
        { name: 'Protein powder', amount: '5 scoops', category: 'protein' },
        { name: 'Greek yogurt', amount: '1.25 cups', category: 'protein' },
        { name: 'Almond milk', amount: '2.5 cups', category: 'dairy' },
        { name: 'Chia seeds', amount: '5 tbsp', category: 'fats' },
        { name: 'Mixed berries', amount: '2.5 cups', category: 'fruits' },
      ],
      instructions: [
        'In 5 mason jars, combine oats, protein powder, and chia seeds',
        'Add Greek yogurt and almond milk to each jar',
        'Top with different fruit combinations',
        'Stir well and refrigerate overnight',
        'Grab and go in the morning!'
      ],
      variations: [
        'Chocolate PB: Chocolate protein + peanut butter + banana',
        'Berry Vanilla: Vanilla protein + mixed berries',
        'Apple Cinnamon: Vanilla protein + diced apple + cinnamon',
        'Tropical: Vanilla protein + mango + coconut flakes',
        'Green Power: Vanilla protein + spinach + banana + almond butter'
      ],
      tags: ['breakfast', 'meal-prep', 'no-cook', 'high-protein'],
      storageInfo: {
        fridge: '5 days',
        freezer: 'Not recommended',
        reheating: 'Enjoy cold or at room temperature'
      }
    },
    {
      id: 3,
      title: 'Power-Packed Energy Balls',
      mealType: 'snacks',
      difficulty: 'easy',
      prepTime: 20,
      cookTime: 0,
      servings: 24,
      calories: 95,
      protein: 4,
      carbs: 12,
      fat: 4,
      image: 'https://via.placeholder.com/300x200?text=Energy+Balls',
      rating: 4.7,
      reviews: 156,
      prepFriendly: true,
      freezable: true,
      ingredients: [
        { name: 'Rolled oats', amount: '2 cups', category: 'carbs' },
        { name: 'Peanut butter', amount: '1/2 cup', category: 'fats' },
        { name: 'Honey', amount: '1/3 cup', category: 'carbs' },
        { name: 'Mini chocolate chips', amount: '1/3 cup', category: 'treats' },
        { name: 'Ground flaxseed', amount: '1/3 cup', category: 'fats' },
        { name: 'Vanilla extract', amount: '1 tsp', category: 'flavorings' },
      ],
      instructions: [
        'Mix all ingredients in a large bowl',
        'Stir until well combined',
        'Refrigerate for 30 minutes',
        'Roll into 24 small balls',
        'Store in refrigerator'
      ],
      tags: ['snacks', 'no-bake', 'energy', 'portable'],
      storageInfo: {
        fridge: '1 week',
        freezer: '3 months',
        reheating: 'Enjoy cold or at room temperature'
      }
    },
    {
      id: 4,
      title: 'Post-Workout Recovery Smoothie Packs',
      mealType: 'post-workout',
      difficulty: 'easy',
      prepTime: 30,
      cookTime: 0,
      servings: 10,
      calories: 280,
      protein: 35,
      carbs: 28,
      fat: 6,
      image: 'https://via.placeholder.com/300x200?text=Smoothie+Packs',
      rating: 4.6,
      reviews: 92,
      prepFriendly: true,
      freezable: true,
      ingredients: [
        { name: 'Protein powder', amount: '10 scoops', category: 'protein' },
        { name: 'Frozen berries', amount: '5 cups', category: 'fruits' },
        { name: 'Spinach', amount: '5 cups', category: 'vegetables' },
        { name: 'Banana', amount: '5 medium', category: 'fruits' },
        { name: 'Chia seeds', amount: '10 tbsp', category: 'fats' },
      ],
      instructions: [
        'Prep 10 freezer bags with smoothie ingredients',
        'Add fruits, vegetables, and chia seeds to each bag',
        'Label with protein powder amount',
        'Freeze bags flat for easy storage',
        'Blend with liquid and protein powder when ready'
      ],
      tags: ['post-workout', 'recovery', 'smoothie', 'freezer-prep'],
      storageInfo: {
        fridge: 'Not applicable',
        freezer: '6 months',
        reheating: 'Blend with 1 cup liquid of choice'
      }
    }
  ];

  const weeklyPlanTemplate = {
    monday: { breakfast: null, lunch: null, dinner: null, snack: null },
    tuesday: { breakfast: null, lunch: null, dinner: null, snack: null },
    wednesday: { breakfast: null, lunch: null, dinner: null, snack: null },
    thursday: { breakfast: null, lunch: null, dinner: null, snack: null },
    friday: { breakfast: null, lunch: null, dinner: null, snack: null },
    saturday: { breakfast: null, lunch: null, dinner: null, snack: null },
    sunday: { breakfast: null, lunch: null, dinner: null, snack: null },
  };

  const prepTasks = [
    { id: 1, task: 'Wash and chop vegetables', completed: false, day: 'sunday' },
    { id: 2, task: 'Cook grains in bulk', completed: false, day: 'sunday' },
    { id: 3, task: 'Prep protein sources', completed: true, day: 'sunday' },
    { id: 4, task: 'Make overnight oats', completed: true, day: 'sunday' },
    { id: 5, task: 'Prepare snack portions', completed: false, day: 'sunday' },
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

    // Load saved data
    loadFavoriteRecipes();
    loadWeeklyPlan();
  }, []);

  const loadFavoriteRecipes = async () => {
    try {
      // Implementation for loading favorite recipes from AsyncStorage
      // const favorites = await AsyncStorage.getItem('favoriteRecipes');
      // setFavoriteRecipes(favorites ? JSON.parse(favorites) : []);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const loadWeeklyPlan = async () => {
    try {
      // Implementation for loading weekly plan from AsyncStorage
      // const plan = await AsyncStorage.getItem('weeklyMealPlan');
      // setWeeklyMealPlan(plan ? JSON.parse(plan) : weeklyPlanTemplate);
      setWeeklyMealPlan(weeklyPlanTemplate);
    } catch (error) {
      console.error('Error loading weekly plan:', error);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const handleMealTypePress = (mealTypeId) => {
    setSelectedMealType(mealTypeId);
    Vibration.vibrate(50);
  };

  const handleRecipePress = (recipe) => {
    setSelectedRecipe(recipe);
    setModalVisible(true);
    Vibration.vibrate(50);
  };

  const handleFavoriteToggle = (recipeId) => {
    const isFavorite = favoriteRecipes.includes(recipeId);
    if (isFavorite) {
      setFavoriteRecipes(prev => prev.filter(id => id !== recipeId));
    } else {
      setFavoriteRecipes(prev => [...prev, recipeId]);
    }
    Vibration.vibrate(50);
  };

  const generateShoppingList = () => {
    // Generate shopping list based on weekly meal plan
    const list = [];
    Object.values(weeklyMealPlan).forEach(day => {
      Object.values(day).forEach(meal => {
        if (meal && meal.ingredients) {
          meal.ingredients.forEach(ingredient => {
            const existing = list.find(item => item.name === ingredient.name);
            if (existing) {
              existing.amount += ` + ${ingredient.amount}`;
            } else {
              list.push({ ...ingredient, checked: false });
            }
          });
        }
      });
    });
    setShoppingList(list);
    setShoppingListModal(true);
  };

  const filteredRecipes = mealPrepRecipes.filter(recipe => {
    const matchesMealType = selectedMealType === 'all' || recipe.mealType === selectedMealType;
    const matchesDifficulty = selectedDifficulty === 'all' || recipe.difficulty === selectedDifficulty;
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         recipe.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesMealType && matchesDifficulty && matchesSearch;
  });

  const renderMealTypeChip = ({ item }) => (
    <Chip
      key={item.id}
      selected={selectedMealType === item.id}
      onPress={() => handleMealTypePress(item.id)}
      style={[
        styles.mealTypeChip,
        selectedMealType === item.id && { backgroundColor: item.color }
      ]}
      textStyle={{
        color: selectedMealType === item.id ? COLORS.surface : COLORS.text
      }}
      icon={() => (
        <Icon 
          name={item.icon} 
          size={16} 
          color={selectedMealType === item.id ? COLORS.surface : COLORS.textSecondary} 
        />
      )}
    >
      {item.name}
    </Chip>
  );

  const renderRecipeCard = ({ item }) => {
    const isFavorite = favoriteRecipes.includes(item.id);
    
    return (
      <Card style={styles.recipeCard} onPress={() => handleRecipePress(item)}>
        <Card.Content style={{ padding: 0 }}>
          <ImageBackground
            source={{ uri: item.image }}
            style={styles.recipeImage}
            imageStyle={{ borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
          >
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.recipeImageOverlay}
            >
              <View style={styles.recipeImageContent}>
                <View style={styles.recipeRating}>
                  <Icon name="star" size={16} color={COLORS.warning} />
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.surface, marginLeft: 4 }]}>
                    {item.rating} ({item.reviews})
                  </Text>
                </View>
                <IconButton
                  icon={isFavorite ? 'favorite' : 'favorite-border'}
                  iconColor={isFavorite ? COLORS.error : COLORS.surface}
                  size={24}
                  onPress={() => handleFavoriteToggle(item.id)}
                />
              </View>
            </LinearGradient>
          </ImageBackground>
          
          <View style={styles.recipeContent}>
            <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.xs }]}>{item.title}</Text>
            
            <View style={styles.recipeMeta}>
              <View style={styles.recipeMetaItem}>
                <Icon name="schedule" size={16} color={COLORS.textSecondary} />
                <Text style={[TEXT_STYLES.caption, { marginLeft: 4 }]}>
                  {item.prepTime + item.cookTime} min
                </Text>
              </View>
              <View style={styles.recipeMetaItem}>
                <Icon name="restaurant" size={16} color={COLORS.textSecondary} />
                <Text style={[TEXT_STYLES.caption, { marginLeft: 4 }]}>
                  {item.servings} servings
                </Text>
              </View>
              <View style={styles.recipeMetaItem}>
                <Icon name="local-fire-department" size={16} color={COLORS.textSecondary} />
                <Text style={[TEXT_STYLES.caption, { marginLeft: 4 }]}>
                  {item.calories} cal
                </Text>
              </View>
            </View>
            
            <View style={styles.macroRow}>
              <View style={styles.macroItem}>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.error }]}>P: {item.protein}g</Text>
              </View>
              <View style={styles.macroItem}>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.warning }]}>C: {item.carbs}g</Text>
              </View>
              <View style={styles.macroItem}>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.success }]}>F: {item.fat}g</Text>
              </View>
            </View>
            
            <View style={styles.recipeFeatures}>
              {item.prepFriendly && (
                <Chip compact style={styles.featureChip}>Meal Prep Friendly</Chip>
              )}
              {item.freezable && (
                <Chip compact style={styles.featureChip}>Freezable</Chip>
              )}
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderQuickStat = (icon, value, label, color = COLORS.primary) => (
    <View style={styles.quickStat}>
      <Icon name={icon} size={24} color={color} />
      <Text style={[TEXT_STYLES.h3, { color }]}>{value}</Text>
      <Text style={TEXT_STYLES.caption}>{label}</Text>
    </View>
  );

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
            Meal Prep Central 🍱
          </Text>
          <Text style={[TEXT_STYLES.bodySecondary, { color: COLORS.surface, opacity: 0.9 }]}>
            Plan, prep, and fuel your performance
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
        {/* Quick Stats */}
        <Animated.View 
          style={[
            styles.section,
            { transform: [{ scale: scaleAnim }], opacity: fadeAnim }
          ]}
        >
          <View style={styles.quickStatsRow}>
            {renderQuickStat('restaurant-menu', '12', 'Meal Plans', COLORS.primary)}
            {renderQuickStat('favorite', favoriteRecipes.length, 'Favorites', COLORS.error)}
            {renderQuickStat('check-circle', '8', 'Prepped', COLORS.success)}
            {renderQuickStat('local-fire-department', '1,850', 'Daily Cals', COLORS.warning)}
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>Quick Actions</Text>
          <View style={styles.quickActionsRow}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
              onPress={() => setWeeklyPlanModal(true)}
            >
              <Icon name="calendar-month" size={24} color={COLORS.surface} />
              <Text style={[TEXT_STYLES.bodySecondary, { color: COLORS.surface, marginTop: 4 }]}>
                Weekly Plan
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: COLORS.success }]}
              onPress={generateShoppingList}
            >
              <Icon name="shopping-cart" size={24} color={COLORS.surface} />
              <Text style={[TEXT_STYLES.bodySecondary, { color: COLORS.surface, marginTop: 4 }]}>
                Shopping List
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: COLORS.warning }]}
              onPress={() => setPrepTrackerModal(true)}
            >
              <Icon name="task-alt" size={24} color={COLORS.surface} />
              <Text style={[TEXT_STYLES.bodySecondary, { color: COLORS.surface, marginTop: 4 }]}>
                Prep Tracker
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.section}>
          <Searchbar
            placeholder="Search recipes, ingredients..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor={COLORS.primary}
          />
        </View>

        {/* Meal Type Filters */}
        <View style={styles.section}>
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>Meal Types</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filtersContainer}>
              {mealTypes.map((mealType) => renderMealTypeChip({ item: mealType }))}
            </View>
          </ScrollView>
        </View>

        {/* Difficulty Filter */}
        <View style={styles.section}>
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>Difficulty Level</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filtersContainer}>
              {difficultyLevels.map((level) => (
                <Chip
                  key={level.id}
                  selected={selectedDifficulty === level.id}
                  onPress={() => setSelectedDifficulty(level.id)}
                  style={[
                    styles.difficultyChip,
                    selectedDifficulty === level.id && { backgroundColor: level.color }
                  ]}
                  textStyle={{
                    color: selectedDifficulty === level.id ? COLORS.surface : COLORS.text
                  }}
                >
                  {level.name}
                </Chip>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Recipes */}
        <View style={styles.section}>
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
            Recipes ({filteredRecipes.length})
          </Text>
          {filteredRecipes.map((recipe) => renderRecipeCard({ item: recipe }))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Recipe Detail Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          {selectedRecipe && (
            <ScrollView style={styles.modalScrollView}>
              <View style={styles.modalHeader}>
                <Text style={[TEXT_STYLES.h2, { flex: 1 }]}>{selectedRecipe.title}</Text>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => setModalVisible(false)}
                />
              </View>
              
              <Image source={{ uri: selectedRecipe.image }} style={styles.modalImage} />
              
              <View style={styles.recipeDetailMeta}>
                <View style={styles.timeInfo}>
                  <Text style={TEXT_STYLES.bodySecondary}>Prep: {selectedRecipe.prepTime}min</Text>
                  <Text style={TEXT_STYLES.bodySecondary}>Cook: {selectedRecipe.cookTime}min</Text>
                  <Text style={TEXT_STYLES.bodySecondary}>Servings: {selectedRecipe.servings}</Text>
                </View>
              </View>
              
              <View style={styles.macroBreakdown}>
                <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.sm }]}>Nutrition Per Serving</Text>
                <View style={styles.macroGrid}>
                  <View style={styles.macroCard}>
                    <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>{selectedRecipe.calories}</Text>
                    <Text style={TEXT_STYLES.caption}>Calories</Text>
                  </View>
                  <View style={styles.macroCard}>
                    <Text style={[TEXT_STYLES.h3, { color: COLORS.error }]}>{selectedRecipe.protein}g</Text>
                    <Text style={TEXT_STYLES.caption}>Protein</Text>
                  </View>
                  <View style={styles.macroCard}>
                    <Text style={[TEXT_STYLES.h3, { color: COLORS.warning }]}>{selectedRecipe.carbs}g</Text>
                    <Text style={TEXT_STYLES.caption}>Carbs</Text>
                  </View>
                  <View style={styles.macroCard}>
                    <Text style={[TEXT_STYLES.h3, { color: COLORS.success }]}>{selectedRecipe.fat}g</Text>
                    <Text style={TEXT_STYLES.caption}>Fat</Text>
                  </View>
                </View>
              </View>
              
              <Divider style={{ marginVertical: SPACING.lg }} />
              
              <View style={styles.ingredientsSection}>
                <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>Ingredients</Text>
                {selectedRecipe.ingredients.map((ingredient, index) => (
                  <View key={index} style={styles.ingredientItem}>
                    <View style={[styles.categoryDot, { backgroundColor: getCategoryColor(ingredient.category) }]} />
                    <Text style={[TEXT_STYLES.body, { flex: 1 }]}>{ingredient.name}</Text>
                    <Text style={[TEXT_STYLES.bodySecondary, { fontWeight: '600' }]}>{ingredient.amount}</Text>
                  </View>
                ))}
              </View>
              
              <Divider style={{ marginVertical: SPACING.lg }} />
              
              <View style={styles.instructionsSection}>
                <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>Instructions</Text>
                {selectedRecipe.instructions.map((instruction, index) => (
                  <View key={index} style={styles.instructionItem}>
                    <View style={styles.stepNumber}>
                      <Text style={[TEXT_STYLES.bodySecondary, { color: COLORS.surface, fontWeight: 'bold' }]}>
                        {index + 1}
                      </Text>
                    </View>
                    <Text style={[TEXT_STYLES.body, { flex: 1, marginLeft: SPACING.md }]}>
                      {instruction}
                    </Text>
                  </View>
                ))}
              </View>
              
              {selectedRecipe.variations && (
                <>
                  <Divider style={{ marginVertical: SPACING.lg }} />
                  <View style={styles.variationsSection}>
                    <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>Variations</Text>
                    {selectedRecipe.variations.map((variation, index) => (
                      <Text key={index} style={[TEXT_STYLES.body, { marginBottom: SPACING.sm }]}>
                        • {variation}
                      </Text>
                    ))}
                  </View>
                </>
              )}
              
              <Divider style={{ marginVertical: SPACING.lg }} />
              
              <View style={styles.storageSection}>
                <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>Storage & Reheating</Text>
                <View style={styles.storageItem}>
                  <Icon name="kitchen" size={20} color={COLORS.primary} />
                  <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.sm }]}>
                    Fridge: {selectedRecipe.storageInfo.fridge}
                  </Text>
                </View>
                <View style={styles.storageItem}>
                  <Icon name="ac-unit" size={20} color={COLORS.secondary} />
                  <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.sm }]}>
                    Freezer: {selectedRecipe.storageInfo.freezer}
                  </Text>
                </View>
                <View style={styles.storageItem}>
                  <Icon name="microwave" size={20} color={COLORS.warning} />
                  <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.sm }]}>
                    {selectedRecipe.storageInfo.reheating}
                  </Text>
                </View>
              </View>
              
              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={() => {
                    Alert.alert('Feature Coming Soon', 'Add to meal plan feature will be available in the next update! 🚀');
                  }}
                  style={[styles.actionButton, { flex: 1, marginRight: SPACING.sm }]}
                >
                  Add to Plan
                </Button>
                <Button
                  mode="contained"
                  onPress={() => {
                    handleFavoriteToggle(selectedRecipe.id);
                    Alert.alert('Recipe Saved! ❤️', 'Added to your favorites');
                  }}
                  style={[styles.actionButton, { flex: 1 }]}
                  buttonColor={COLORS.success}
                >
                  Save Recipe
                </Button>
              </View>
            </ScrollView>
          )}
        </Modal>

        {/* Weekly Plan Modal */}
        <Modal
          visible={weeklyPlanModal}
          onDismiss={() => setWeeklyPlanModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          <ScrollView style={styles.modalScrollView}>
            <View style={styles.modalHeader}>
              <Text style={[TEXT_STYLES.h2, { flex: 1 }]}>Weekly Meal Plan</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setWeeklyPlanModal(false)}
              />
            </View>
            
            <Text style={[TEXT_STYLES.bodySecondary, { marginBottom: SPACING.lg, textAlign: 'center' }]}>
              Plan your meals for the week ahead
            </Text>
            
            {Object.entries(weeklyPlanTemplate).map(([day, meals]) => (
              <Card key={day} style={styles.dayPlanCard}>
                <Card.Content>
                  <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md, textTransform: 'capitalize' }]}>
                    {day}
                  </Text>
                  <View style={styles.mealSlots}>
                    {Object.entries(meals).map(([mealType, meal]) => (
                      <TouchableOpacity
                        key={mealType}
                        style={styles.mealSlot}
                        onPress={() => Alert.alert('Feature Coming Soon', 'Meal planning interface will be available in the next update! 🚀')}
                      >
                        <Text style={[TEXT_STYLES.caption, { textTransform: 'capitalize' }]}>{mealType}</Text>
                        {meal ? (
                          <Text style={TEXT_STYLES.bodySecondary}>{meal.title}</Text>
                        ) : (
                          <View style={styles.emptyMealSlot}>
                            <Icon name="add" size={16} color={COLORS.textSecondary} />
                            <Text style={TEXT_STYLES.caption}>Add meal</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </Card.Content>
              </Card>
            ))}
            
            <Button
              mode="contained"
              onPress={() => {
                Alert.alert('Feature Coming Soon', 'Auto-generate meal plan will be available in the next update! 🚀');
              }}
              style={styles.generatePlanButton}
              buttonColor={COLORS.primary}
            >
              Auto-Generate Plan
            </Button>
          </ScrollView>
        </Modal>

        {/* Shopping List Modal */}
        <Modal
          visible={shoppingListModal}
          onDismiss={() => setShoppingListModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          <ScrollView style={styles.modalScrollView}>
            <View style={styles.modalHeader}>
              <Text style={[TEXT_STYLES.h2, { flex: 1 }]}>Shopping List</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setShoppingListModal(false)}
              />
            </View>
            
            <Text style={[TEXT_STYLES.bodySecondary, { marginBottom: SPACING.lg, textAlign: 'center' }]}>
              Based on your weekly meal plan
            </Text>
            
            {shoppingList.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon name="shopping-cart" size={64} color={COLORS.textSecondary} />
                <Text style={[TEXT_STYLES.h3, { marginTop: SPACING.md, color: COLORS.textSecondary }]}>
                  No items yet
                </Text>
                <Text style={[TEXT_STYLES.bodySecondary, { textAlign: 'center' }]}>
                  Add meals to your weekly plan to generate a shopping list
                </Text>
              </View>
            ) : (
              <View>
                {['protein', 'vegetables', 'carbs', 'fats', 'dairy', 'seasonings', 'fruits'].map(category => {
                  const categoryItems = shoppingList.filter(item => item.category === category);
                  if (categoryItems.length === 0) return null;
                  
                  return (
                    <View key={category} style={styles.shoppingCategory}>
                      <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.sm, textTransform: 'capitalize' }]}>
                        {category}
                      </Text>
                      {categoryItems.map((item, index) => (
                        <View key={index} style={styles.shoppingItem}>
                          <Checkbox
                            status={item.checked ? 'checked' : 'unchecked'}
                            onPress={() => {
                              const updatedList = [...shoppingList];
                              const itemIndex = updatedList.findIndex(listItem => listItem.name === item.name);
                              updatedList[itemIndex].checked = !updatedList[itemIndex].checked;
                              setShoppingList(updatedList);
                            }}
                          />
                          <Text style={[TEXT_STYLES.body, { flex: 1, marginLeft: SPACING.sm }]}>
                            {item.name}
                          </Text>
                          <Text style={TEXT_STYLES.bodySecondary}>{item.amount}</Text>
                        </View>
                      ))}
                    </View>
                  );
                })}
              </View>
            )}
            
            {shoppingList.length > 0 && (
              <Button
                mode="contained"
                onPress={() => Alert.alert('Feature Coming Soon', 'Export shopping list will be available in the next update! 🚀')}
                style={styles.exportButton}
                buttonColor={COLORS.success}
                icon="share"
              >
                Export List
              </Button>
            )}
          </ScrollView>
        </Modal>

        {/* Prep Tracker Modal */}
        <Modal
          visible={prepTrackerModal}
          onDismiss={() => setPrepTrackerModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          <ScrollView style={styles.modalScrollView}>
            <View style={styles.modalHeader}>
              <Text style={[TEXT_STYLES.h2, { flex: 1 }]}>Prep Tracker</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setPrepTrackerModal(false)}
              />
            </View>
            
            <Text style={[TEXT_STYLES.bodySecondary, { marginBottom: SPACING.lg, textAlign: 'center' }]}>
              Track your meal prep progress
            </Text>
            
            <View style={styles.prepProgress}>
              <Text style={TEXT_STYLES.h3}>This Week's Progress</Text>
              <ProgressBar
                progress={prepTasks.filter(task => task.completed).length / prepTasks.length}
                color={COLORS.success}
                style={styles.progressBar}
              />
              <Text style={TEXT_STYLES.caption}>
                {prepTasks.filter(task => task.completed).length} of {prepTasks.length} tasks completed
              </Text>
            </View>
            
            <View style={styles.prepTasks}>
              <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>Sunday Prep Tasks</Text>
              {prepTasks.map(task => (
                <View key={task.id} style={styles.prepTaskItem}>
                  <Checkbox
                    status={task.completed ? 'checked' : 'unchecked'}
                    onPress={() => {
                      const updatedProgress = { ...prepProgress };
                      updatedProgress[task.id] = !task.completed;
                      setPrepProgress(updatedProgress);
                      Vibration.vibrate(50);
                    }}
                  />
                  <Text style={[
                    TEXT_STYLES.body,
                    { 
                      flex: 1,
                      marginLeft: SPACING.sm,
                      textDecorationLine: task.completed ? 'line-through' : 'none',
                      color: task.completed ? COLORS.textSecondary : COLORS.text
                    }
                  ]}>
                    {task.task}
                  </Text>
                  <Icon 
                    name={task.completed ? 'check-circle' : 'radio-button-unchecked'} 
                    size={20} 
                    color={task.completed ? COLORS.success : COLORS.textSecondary} 
                  />
                </View>
              ))}
            </View>
            
            <Button
              mode="contained"
              onPress={() => Alert.alert('Feature Coming Soon', 'Custom prep tasks will be available in the next update! 🚀')}
              style={styles.addTaskButton}
              buttonColor={COLORS.primary}
              icon="add"
            >
              Add Custom Task
            </Button>
          </ScrollView>
        </Modal>
      </Portal>

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => Alert.alert('Feature Coming Soon', 'Create custom recipe will be available in the next update! 🚀')}
      />
    </View>
  );
};

const getCategoryColor = (category) => {
  const colors = {
    protein: COLORS.error,
    vegetables: COLORS.success,
    carbs: COLORS.warning,
    fats: COLORS.secondary,
    dairy: COLORS.primary,
    seasonings: COLORS.textSecondary,
    fruits: '#ec4899',
    treats: '#8b5cf6',
    flavorings: '#06b6d4',
  };
  return colors[category] || COLORS.textSecondary;
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
  quickStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.lg,
    elevation: 2,
  },
  quickStat: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
    paddingVertical: SPACING.lg,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    backgroundColor: COLORS.surface,
    elevation: 2,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingRight: SPACING.lg,
  },
  mealTypeChip: {
    marginRight: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  difficultyChip: {
    marginRight: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  recipeCard: {
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.surface,
    elevation: 3,
    borderRadius: 12,
  },
  recipeImage: {
    height: 200,
    justifyContent: 'flex-end',
  },
  recipeImageOverlay: {
    height: 200,
    justifyContent: 'flex-end',
  },
  recipeImageContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: SPACING.md,
  },
  recipeRating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  recipeContent: {
    padding: SPACING.md,
  },
  recipeMeta: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  recipeMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  macroRow: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  macroItem: {
    flex: 1,
  },
  recipeFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureChip: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
    backgroundColor: COLORS.background,
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
  modalImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  recipeDetailMeta: {
    padding: SPACING.lg,
  },
  timeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroBreakdown: {
    paddingHorizontal: SPACING.lg,
  },
  macroGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroCard: {
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  ingredientsSection: {
    paddingHorizontal: SPACING.lg,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.md,
  },
  instructionsSection: {
    paddingHorizontal: SPACING.lg,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  variationsSection: {
    paddingHorizontal: SPACING.lg,
  },
  storageSection: {
    paddingHorizontal: SPACING.lg,
  },
  storageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  modalActions: {
    flexDirection: 'row',
    padding: SPACING.lg,
  },
  dayPlanCard: {
    marginBottom: SPACING.md,
  },
  mealSlots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  mealSlot: {
    width: '48%',
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.sm,
    minHeight: 60,
  },
  emptyMealSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  generatePlanButton: {
    marginTop: SPACING.lg,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  shoppingCategory: {
    marginBottom: SPACING.lg,
  },
  shoppingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  exportButton: {
    marginTop: SPACING.lg,
  },
  prepProgress: {
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
    borderRadius: 12,
    marginBottom: SPACING.lg,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    marginVertical: SPACING.sm,
  },
  prepTasks: {
    marginBottom: SPACING.lg,
  },
  prepTaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  addTaskButton: {
    marginTop: SPACING.lg,
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.xl,
    backgroundColor: COLORS.primary,
  },
});

export default MealPrep;