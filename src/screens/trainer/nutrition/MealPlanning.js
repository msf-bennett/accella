import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Animated,
  RefreshControl,
  Alert,
  TouchableOpacity,
  TextInput,
  Modal,
  Dimensions,
  Vibration,
  FlatList,
  Image,
} from 'react-native';
import { 
  Card,
  Button,
  ProgressBar,
  Avatar,
  Surface,
  Portal,
  Searchbar,
  FAB,
  IconButton,
  Chip,
  Divider,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '../../../components/shared/BlurView';

// Design system imports (assumed to be available)
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f8f9fa',
  surface: '#ffffff',
  text: '#2c3e50',
  textSecondary: '#7f8c8d',
  accent: '#e74c3c',
  info: '#3498db',
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
  bodySmall: { fontSize: 14, color: COLORS.textSecondary },
  caption: { fontSize: 12, color: COLORS.textSecondary },
};

const { width, height } = Dimensions.get('window');

const MealPlanning = ({ navigation, route }) => {
  // Redux state
  const user = useSelector(state => state.auth.user);
  const clients = useSelector(state => state.clients?.list || []);
  const mealPlans = useSelector(state => state.nutrition?.mealPlans || []);
  const dispatch = useDispatch();

  // Component state
  const [refreshing, setRefreshing] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [activeTab, setActiveTab] = useState('weekly');
  const [showMealModal, setShowMealModal] = useState(false);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Mock data for demonstration
  const [weeklyMealPlan, setWeeklyMealPlan] = useState({
    Monday: {
      breakfast: { name: 'Oatmeal & Berries', calories: 320, protein: 12, time: '7:30 AM', image: null },
      lunch: { name: 'Grilled Chicken Salad', calories: 450, protein: 35, time: '12:30 PM', image: null },
      dinner: { name: 'Salmon & Vegetables', calories: 520, protein: 40, time: '7:00 PM', image: null },
      snacks: [{ name: 'Greek Yogurt', calories: 100, protein: 17, time: '3:00 PM' }],
    },
    Tuesday: {
      breakfast: { name: 'Protein Smoothie', calories: 280, protein: 25, time: '7:30 AM', image: null },
      lunch: { name: 'Turkey Wrap', calories: 380, protein: 28, time: '12:30 PM', image: null },
      dinner: { name: 'Lean Beef Stir-fry', calories: 480, protein: 35, time: '7:00 PM', image: null },
      snacks: [{ name: 'Almonds', calories: 160, protein: 6, time: '10:00 AM' }],
    },
    Wednesday: {
      breakfast: { name: 'Eggs & Toast', calories: 350, protein: 20, time: '7:30 AM', image: null },
      lunch: { name: 'Quinoa Bowl', calories: 420, protein: 18, time: '12:30 PM', image: null },
      dinner: { name: 'Chicken Breast & Rice', calories: 500, protein: 42, time: '7:00 PM', image: null },
      snacks: [{ name: 'Protein Bar', calories: 190, protein: 20, time: '4:00 PM' }],
    },
    Thursday: {
      breakfast: { name: 'Avocado Toast', calories: 340, protein: 14, time: '7:30 AM', image: null },
      lunch: { name: 'Tuna Salad', calories: 310, protein: 30, time: '12:30 PM', image: null },
      dinner: { name: 'Pork Tenderloin', calories: 460, protein: 38, time: '7:00 PM', image: null },
      snacks: [{ name: 'Apple & PB', calories: 180, protein: 8, time: '2:30 PM' }],
    },
    Friday: {
      breakfast: { name: 'Pancakes & Fruit', calories: 380, protein: 15, time: '8:00 AM', image: null },
      lunch: { name: 'Chicken Caesar', calories: 440, protein: 32, time: '1:00 PM', image: null },
      dinner: { name: 'Fish Tacos', calories: 420, protein: 28, time: '7:30 PM', image: null },
      snacks: [{ name: 'Trail Mix', calories: 150, protein: 5, time: '11:00 AM' }],
    },
    Saturday: {
      breakfast: { name: 'French Toast', calories: 420, protein: 16, time: '9:00 AM', image: null },
      lunch: { name: 'BBQ Chicken', calories: 480, protein: 36, time: '1:30 PM', image: null },
      dinner: { name: 'Pasta Primavera', calories: 520, protein: 22, time: '8:00 PM', image: null },
      snacks: [{ name: 'Cheese & Crackers', calories: 200, protein: 10, time: '4:00 PM' }],
    },
    Sunday: {
      breakfast: { name: 'Breakfast Burrito', calories: 450, protein: 22, time: '9:30 AM', image: null },
      lunch: { name: 'Soup & Sandwich', calories: 360, protein: 18, time: '1:00 PM', image: null },
      dinner: { name: 'Roast Chicken', calories: 510, protein: 45, time: '7:00 PM', image: null },
      snacks: [{ name: 'Smoothie Bowl', calories: 220, protein: 12, time: '3:30 PM' }],
    },
  });

  const [mealTemplates, setMealTemplates] = useState([
    {
      id: '1',
      name: 'High Protein Plan',
      description: 'Perfect for muscle building and recovery',
      totalCalories: 2200,
      totalProtein: 180,
      meals: 4,
      tags: ['High Protein', 'Muscle Building'],
      rating: 4.8,
      image: null,
    },
    {
      id: '2',
      name: 'Weight Loss Plan',
      description: 'Balanced meals for sustainable weight loss',
      totalCalories: 1800,
      totalProtein: 120,
      meals: 5,
      tags: ['Weight Loss', 'Low Calorie'],
      rating: 4.6,
      image: null,
    },
    {
      id: '3',
      name: 'Balanced Nutrition',
      description: 'Well-rounded meals for overall health',
      totalCalories: 2000,
      totalProtein: 140,
      meals: 4,
      tags: ['Balanced', 'Healthy'],
      rating: 4.7,
      image: null,
    },
    {
      id: '4',
      name: 'Athletic Performance',
      description: 'Optimized for peak athletic performance',
      totalCalories: 2500,
      totalProtein: 200,
      meals: 6,
      tags: ['Performance', 'High Energy'],
      rating: 4.9,
      image: null,
    },
  ]);

  const [recipes, setRecipes] = useState([
    {
      id: '1',
      name: 'Grilled Chicken & Quinoa',
      description: 'High protein, nutrient-dense meal',
      calories: 420,
      protein: 35,
      carbs: 32,
      fat: 12,
      prepTime: '25 min',
      difficulty: 'Easy',
      rating: 4.8,
      ingredients: ['Chicken breast', 'Quinoa', 'Broccoli', 'Olive oil'],
      instructions: ['Season chicken', 'Cook quinoa', 'Steam broccoli', 'Combine and serve'],
      image: null,
      tags: ['High Protein', 'Gluten-Free'],
    },
    {
      id: '2',
      name: 'Salmon Power Bowl',
      description: 'Omega-3 rich superfood bowl',
      calories: 480,
      protein: 32,
      carbs: 28,
      fat: 24,
      prepTime: '20 min',
      difficulty: 'Medium',
      rating: 4.9,
      ingredients: ['Salmon fillet', 'Sweet potato', 'Spinach', 'Avocado'],
      instructions: ['Bake salmon', 'Roast sweet potato', 'Prepare salad', 'Assemble bowl'],
      image: null,
      tags: ['Omega-3', 'Heart Healthy'],
    },
  ]);

  const [shoppingList, setShoppingList] = useState([
    { id: '1', item: 'Chicken breast', quantity: '2 lbs', category: 'Protein', checked: false },
    { id: '2', item: 'Quinoa', quantity: '1 bag', category: 'Grains', checked: false },
    { id: '3', item: 'Broccoli', quantity: '2 heads', category: 'Vegetables', checked: true },
    { id: '4', item: 'Greek yogurt', quantity: '32 oz', category: 'Dairy', checked: false },
    { id: '5', item: 'Salmon fillet', quantity: '1.5 lbs', category: 'Protein', checked: false },
  ]);

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];

  useEffect(() => {
    // Entrance animations
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
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Vibration.vibrate(50);
    }, 1000);
  }, []);

  const handleAddMeal = (day, mealType) => {
    setSelectedMeal({ day, mealType });
    setShowMealModal(true);
  };

  const handleViewRecipe = (recipe) => {
    setSelectedRecipe(recipe);
    setShowRecipeModal(true);
  };

  const toggleShoppingItem = (itemId) => {
    setShoppingList(prev => prev.map(item => 
      item.id === itemId ? { ...item, checked: !item.checked } : item
    ));
    Vibration.vibrate(30);
  };

  const generateShoppingList = () => {
    Alert.alert(
      'Generate Shopping List 🛒',
      'Create a shopping list based on your meal plan for this week?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Generate', 
          onPress: () => {
            Vibration.vibrate(100);
            Alert.alert('Success! ✅', 'Shopping list has been generated based on your meal plan');
          }
        }
      ]
    );
  };

  const renderWeeklyCalendar = () => (
    <Card style={styles.calendarCard}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.calendarHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>Weekly Meal Plan 📅</Text>
        <View style={styles.weekNavigator}>
          <IconButton
            icon="chevron-left"
            size={20}
            iconColor="white"
            onPress={() => setSelectedWeek(prev => prev - 1)}
          />
          <Text style={[TEXT_STYLES.body, { color: 'white' }]}>
            Week {selectedWeek + 1}
          </Text>
          <IconButton
            icon="chevron-right"
            size={20}
            iconColor="white"
            onPress={() => setSelectedWeek(prev => prev + 1)}
          />
        </View>
      </LinearGradient>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daysScroll}>
        {daysOfWeek.map((day, index) => (
          <TouchableOpacity
            key={day}
            style={[styles.dayCard, selectedDay === index && styles.selectedDayCard]}
            onPress={() => setSelectedDay(index)}
            activeOpacity={0.8}
          >
            <Text style={[
              TEXT_STYLES.bodySmall,
              { color: selectedDay === index ? COLORS.primary : COLORS.textSecondary }
            ]}>
              {day.substring(0, 3).toUpperCase()}
            </Text>
            <Text style={[
              TEXT_STYLES.h3,
              { color: selectedDay === index ? COLORS.primary : COLORS.text }
            ]}>
              {index + 1}
            </Text>
            <View style={styles.dayMealsIndicator}>
              {weeklyMealPlan[day] && Object.keys(weeklyMealPlan[day]).map((meal, mealIndex) => (
                <View
                  key={mealIndex}
                  style={[
                    styles.mealDot,
                    { backgroundColor: selectedDay === index ? COLORS.primary : COLORS.textSecondary }
                  ]}
                />
              ))}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Card>
  );

  const renderDayMeals = () => {
    const currentDay = daysOfWeek[selectedDay];
    const dayMeals = weeklyMealPlan[currentDay] || {};

    return (
      <Card style={styles.dayMealsCard}>
        <View style={styles.dayMealsHeader}>
          <Text style={TEXT_STYLES.h3}>{currentDay}'s Meals 🍽️</Text>
          <View style={styles.dayStats}>
            <Chip mode="outlined" compact style={styles.statChip}>
              2,180 cal
            </Chip>
            <Chip mode="outlined" compact style={styles.statChip}>
              145g protein
            </Chip>
          </View>
        </View>

        {mealTypes.map((mealType) => {
          const meal = dayMeals[mealType];
          const isSnacks = mealType === 'snacks';
          
          return (
            <View key={mealType} style={styles.mealSection}>
              <View style={styles.mealTypeHeader}>
                <View style={styles.mealTypeInfo}>
                  <Icon 
                    name={getMealIcon(mealType)} 
                    size={20} 
                    color={COLORS.primary} 
                  />
                  <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.sm }]}>
                    {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                  </Text>
                </View>
                <IconButton
                  icon="add-circle-outline"
                  size={20}
                  iconColor={COLORS.primary}
                  onPress={() => handleAddMeal(currentDay, mealType)}
                />
              </View>

              {isSnacks ? (
                meal && meal.length > 0 ? meal.map((snack, index) => (
                  <Surface key={index} style={styles.mealItem} elevation={1}>
                    <View style={styles.mealItemContent}>
                      <View style={styles.mealItemInfo}>
                        <Text style={TEXT_STYLES.body}>{snack.name}</Text>
                        <Text style={TEXT_STYLES.bodySmall}>
                          {snack.time} • {snack.calories} cal • {snack.protein}g protein
                        </Text>
                      </View>
                      <IconButton
                        icon="dots-vertical"
                        size={16}
                        iconColor={COLORS.textSecondary}
                        onPress={() => Alert.alert('Meal Options', 'Edit or remove this meal')}
                      />
                    </View>
                  </Surface>
                )) : (
                  <TouchableOpacity
                    style={styles.emptyMealSlot}
                    onPress={() => handleAddMeal(currentDay, mealType)}
                  >
                    <Icon name="add" size={24} color={COLORS.textSecondary} />
                    <Text style={[TEXT_STYLES.bodySmall, { marginTop: SPACING.xs }]}>
                      Add {mealType}
                    </Text>
                  </TouchableOpacity>
                )
              ) : meal ? (
                <Surface style={styles.mealItem} elevation={1}>
                  <View style={styles.mealItemContent}>
                    <View style={styles.mealItemInfo}>
                      <Text style={TEXT_STYLES.body}>{meal.name}</Text>
                      <Text style={TEXT_STYLES.bodySmall}>
                        {meal.time} • {meal.calories} cal • {meal.protein}g protein
                      </Text>
                    </View>
                    <IconButton
                      icon="dots-vertical"
                      size={16}
                      iconColor={COLORS.textSecondary}
                      onPress={() => Alert.alert('Meal Options', 'Edit or remove this meal')}
                    />
                  </View>
                </Surface>
              ) : (
                <TouchableOpacity
                  style={styles.emptyMealSlot}
                  onPress={() => handleAddMeal(currentDay, mealType)}
                >
                  <Icon name="add" size={24} color={COLORS.textSecondary} />
                  <Text style={[TEXT_STYLES.bodySmall, { marginTop: SPACING.xs }]}>
                    Add {mealType}
                  </Text>
                </TouchableOpacity>
              )}

              {mealType !== mealTypes[mealTypes.length - 1] && <Divider style={styles.mealDivider} />}
            </View>
          );
        })}
      </Card>
    );
  };

  const getMealIcon = (mealType) => {
    switch (mealType) {
      case 'breakfast': return 'free-breakfast';
      case 'lunch': return 'lunch-dining';
      case 'dinner': return 'dinner-dining';
      case 'snacks': return 'cookie';
      default: return 'restaurant';
    }
  };

  const renderMealTemplates = () => (
    <Card style={styles.templatesCard}>
      <View style={styles.sectionHeader}>
        <Text style={TEXT_STYLES.h3}>Meal Plan Templates 📋</Text>
        <Button
          mode="outlined"
          compact
          onPress={() => setShowTemplateModal(true)}
        >
          View All
        </Button>
      </View>

      <FlatList
        data={mealTemplates}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.templateCard}
            onPress={() => Alert.alert(
              `Apply ${item.name}? 🍽️`,
              'This will replace your current meal plan for the selected week.',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Apply', 
                  onPress: () => {
                    Vibration.vibrate(100);
                    Alert.alert('Success! ✅', `${item.name} has been applied to your meal plan`);
                  }
                }
              ]
            )}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[COLORS.info + '20', COLORS.info + '10']}
              style={styles.templateGradient}
            >
              <View style={styles.templateHeader}>
                <Text style={TEXT_STYLES.body} numberOfLines={2}>{item.name}</Text>
                <View style={styles.templateRating}>
                  <Icon name="star" size={16} color={COLORS.warning} />
                  <Text style={TEXT_STYLES.caption}>{item.rating}</Text>
                </View>
              </View>

              <Text style={[TEXT_STYLES.bodySmall, { marginVertical: SPACING.sm }]} numberOfLines={2}>
                {item.description}
              </Text>

              <View style={styles.templateStats}>
                <View style={styles.templateStat}>
                  <Text style={TEXT_STYLES.caption}>{item.totalCalories}</Text>
                  <Text style={TEXT_STYLES.caption}>calories</Text>
                </View>
                <View style={styles.templateStat}>
                  <Text style={TEXT_STYLES.caption}>{item.totalProtein}g</Text>
                  <Text style={TEXT_STYLES.caption}>protein</Text>
                </View>
                <View style={styles.templateStat}>
                  <Text style={TEXT_STYLES.caption}>{item.meals}</Text>
                  <Text style={TEXT_STYLES.caption}>meals</Text>
                </View>
              </View>

              <View style={styles.templateTags}>
                {item.tags.slice(0, 2).map((tag, index) => (
                  <Chip key={index} mode="outlined" compact style={styles.templateTag}>
                    {tag}
                  </Chip>
                ))}
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingHorizontal: SPACING.lg }}
      />
    </Card>
  );

  const renderQuickActions = () => (
    <Card style={styles.quickActionsCard}>
      <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.lg }]}>Quick Actions ⚡</Text>
      
      <View style={styles.actionsGrid}>
        <TouchableOpacity
          style={styles.actionItem}
          onPress={() => navigation.navigate('MacroTracking')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[COLORS.accent, COLORS.accent + 'CC']}
            style={styles.actionGradient}
          >
            <Icon name="local-fire-department" size={24} color="white" />
          </LinearGradient>
          <Text style={TEXT_STYLES.bodySmall}>Track Macros</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionItem}
          onPress={generateShoppingList}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[COLORS.success, COLORS.success + 'CC']}
            style={styles.actionGradient}
          >
            <Icon name="shopping-cart" size={24} color="white" />
          </LinearGradient>
          <Text style={TEXT_STYLES.bodySmall}>Shopping List</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionItem}
          onPress={() => setShowRecipeModal(true)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[COLORS.warning, COLORS.warning + 'CC']}
            style={styles.actionGradient}
          >
            <Icon name="menu-book" size={24} color="white" />
          </LinearGradient>
          <Text style={TEXT_STYLES.bodySmall}>Browse Recipes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionItem}
          onPress={() => Alert.alert('Coming Soon! 🚀', 'AI meal planning features are under development')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[COLORS.info, COLORS.info + 'CC']}
            style={styles.actionGradient}
          >
            <Icon name="psychology" size={24} color="white" />
          </LinearGradient>
          <Text style={TEXT_STYLES.bodySmall}>AI Planner</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  const renderShoppingList = () => (
    <Card style={styles.shoppingCard}>
      <View style={styles.sectionHeader}>
        <Text style={TEXT_STYLES.h3}>Shopping List 🛒</Text>
        <Button
          mode="text"
          compact
          onPress={() => Alert.alert('Clear List', 'Clear all checked items from your shopping list?')}
        >
          Clear Done
        </Button>
      </View>

      {shoppingList.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.shoppingItem}
          onPress={() => toggleShoppingItem(item.id)}
          activeOpacity={0.8}
        >
          <Icon
            name={item.checked ? 'check-box' : 'check-box-outline-blank'}
            size={20}
            color={item.checked ? COLORS.success : COLORS.textSecondary}
          />
          <View style={styles.shoppingItemContent}>
            <Text style={[
              TEXT_STYLES.body,
              item.checked && { textDecorationLine: 'line-through', color: COLORS.textSecondary }
            ]}>
              {item.item}
            </Text>
            <Text style={TEXT_STYLES.bodySmall}>{item.quantity} • {item.category}</Text>
          </View>
        </TouchableOpacity>
      ))}

      <Button
        mode="outlined"
        onPress={generateShoppingList}
        style={{ marginTop: SPACING.md }}
        icon="refresh"
      >
        Regenerate from Meal Plan
      </Button>
    </Card>
  );

  const renderMealModal = () => (
    <Portal>
      <Modal
        visible={showMealModal}
        onDismiss={() => setShowMealModal(false)}
        transparent
        animationType="slide"
      >
        <BlurView style={styles.modalOverlay} blurType="dark" blurAmount={10}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={TEXT_STYLES.h2}>
                Add {selectedMeal?.mealType} for {selectedMeal?.day} 🍽️
              </Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setShowMealModal(false)}
              />
            </View>

            <ScrollView style={styles.modalBody}>
              <Searchbar
                placeholder="Search meals or recipes..."
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={styles.searchBar}
                iconColor={COLORS.primary}
              />

              <Text style={[TEXT_STYLES.body, { marginVertical: SPACING.md }]}>
                Quick Add Options
              </Text>

              {recipes.slice(0, 3).map((recipe) => (
                <TouchableOpacity
                  key={recipe.id}
                  style={styles.recipeOption}
                  onPress={() => {
                    setShowMealModal(false);
                    Alert.alert('Added! ✅', `${recipe.name} added to ${selectedMeal?.day}`);
                  }}
                  activeOpacity={0.8}
                >
                  <View style={styles.recipeOptionContent}>
                    <Text style={TEXT_STYLES.body}>{recipe.name}</Text>
                    <Text style={TEXT_STYLES.bodySmall}>
                      {recipe.calories} cal • {recipe.protein}g protein • {recipe.prepTime}
                    </Text>
                  </View>
                  <Icon name="add-circle-outline" size={20} color={COLORS.primary} />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                mode="outlined"
                onPress={() => setShowMealModal(false)}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={() => setShowRecipeModal(true)}
                style={styles.modalButton}
                buttonColor={COLORS.primary}
              >
                Browse Recipes
              </Button>
            </View>
          </View>
        </BlurView>
      </Modal>
    </Portal>
  );

  const renderRecipeModal = () => (
    <Portal>
      <Modal
        visible={showRecipeModal}
        onDismiss={() => setShowRecipeModal(false)}
        transparent
        animationType="slide"
      >
        <BlurView style={styles.modalOverlay} blurType="dark" blurAmount={10}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={TEXT_STYLES.h2}>Recipe Library 👨‍🍳</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setShowRecipeModal(false)}
              />
            </View>

            <ScrollView style={styles.modalBody}>
              <Searchbar
                placeholder="Search recipes..."
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={styles.searchBar}
                iconColor={COLORS.primary}
              />

              <View style={styles.recipeCategoriesContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {['All', 'High Protein', 'Low Carb', 'Vegetarian', 'Quick Meals'].map((category) => (
                    <Chip
                      key={category}
                      mode="outlined"
                      style={styles.categoryChip}
                      onPress={() => Alert.alert('Filter', `Showing ${category} recipes`)}
                    >
                      {category}
                    </Chip>
                  ))}
                </ScrollView>
              </View>

              {recipes.map((recipe) => (
                <Card key={recipe.id} style={styles.recipeCard}>
                  <View style={styles.recipeHeader}>
                    <View style={styles.recipeInfo}>
                      <Text style={TEXT_STYLES.body}>{recipe.name}</Text>
                      <Text style={TEXT_STYLES.bodySmall}>{recipe.description}</Text>
                    </View>
                    <View style={styles.recipeRating}>
                      <Icon name="star" size={16} color={COLORS.warning} />
                      <Text style={TEXT_STYLES.caption}>{recipe.rating}</Text>
                    </View>
                  </View>

                  <View style={styles.recipeStats}>
                    <View style={styles.recipeStat}>
                      <Text style={TEXT_STYLES.bodySmall}>{recipe.calories}</Text>
                      <Text style={TEXT_STYLES.caption}>calories</Text>
                    </View>
                    <View style={styles.recipeStat}>
                      <Text style={TEXT_STYLES.bodySmall}>{recipe.protein}g</Text>
                      <Text style={TEXT_STYLES.caption}>protein</Text>
                    </View>
                    <View style={styles.recipeStat}>
                      <Text style={TEXT_STYLES.bodySmall}>{recipe.prepTime}</Text>
                      <Text style={TEXT_STYLES.caption}>prep time</Text>
                    </View>
                    <View style={styles.recipeStat}>
                      <Text style={TEXT_STYLES.bodySmall}>{recipe.difficulty}</Text>
                      <Text style={TEXT_STYLES.caption}>difficulty</Text>
                    </View>
                  </View>

                  <View style={styles.recipeTags}>
                    {recipe.tags.map((tag, index) => (
                      <Chip key={index} mode="outlined" compact style={styles.recipeTag}>
                        {tag}
                      </Chip>
                    ))}
                  </View>

                  <View style={styles.recipeActions}>
                    <Button
                      mode="outlined"
                      compact
                      onPress={() => handleViewRecipe(recipe)}
                    >
                      View Recipe
                    </Button>
                    <Button
                      mode="contained"
                      compact
                      buttonColor={COLORS.primary}
                      onPress={() => {
                        setShowRecipeModal(false);
                        Alert.alert('Added! ✅', `${recipe.name} added to your meal plan`);
                      }}
                    >
                      Add to Plan
                    </Button>
                  </View>
                </Card>
              ))}
            </ScrollView>
          </View>
        </BlurView>
      </Modal>
    </Portal>
  );

  const renderTemplateModal = () => (
    <Portal>
      <Modal
        visible={showTemplateModal}
        onDismiss={() => setShowTemplateModal(false)}
        transparent
        animationType="slide"
      >
        <BlurView style={styles.modalOverlay} blurType="dark" blurAmount={10}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={TEXT_STYLES.h2}>Meal Plan Templates 📋</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setShowTemplateModal(false)}
              />
            </View>

            <ScrollView style={styles.modalBody}>
              {mealTemplates.map((template) => (
                <Card key={template.id} style={styles.templateModalCard}>
                  <LinearGradient
                    colors={[COLORS.primary + '10', COLORS.secondary + '10']}
                    style={styles.templateModalGradient}
                  >
                    <View style={styles.templateModalHeader}>
                      <Text style={TEXT_STYLES.body}>{template.name}</Text>
                      <View style={styles.templateRating}>
                        <Icon name="star" size={16} color={COLORS.warning} />
                        <Text style={TEXT_STYLES.caption}>{template.rating}</Text>
                      </View>
                    </View>

                    <Text style={[TEXT_STYLES.bodySmall, { marginVertical: SPACING.sm }]}>
                      {template.description}
                    </Text>

                    <View style={styles.templateModalStats}>
                      <View style={styles.templateStat}>
                        <Text style={TEXT_STYLES.body}>{template.totalCalories}</Text>
                        <Text style={TEXT_STYLES.caption}>calories/day</Text>
                      </View>
                      <View style={styles.templateStat}>
                        <Text style={TEXT_STYLES.body}>{template.totalProtein}g</Text>
                        <Text style={TEXT_STYLES.caption}>protein/day</Text>
                      </View>
                      <View style={styles.templateStat}>
                        <Text style={TEXT_STYLES.body}>{template.meals}</Text>
                        <Text style={TEXT_STYLES.caption}>meals/day</Text>
                      </View>
                    </View>

                    <View style={styles.templateTags}>
                      {template.tags.map((tag, index) => (
                        <Chip key={index} mode="outlined" compact style={styles.templateTag}>
                          {tag}
                        </Chip>
                      ))}
                    </View>

                    <View style={styles.templateActions}>
                      <Button
                        mode="outlined"
                        compact
                        onPress={() => Alert.alert('Preview', `Preview ${template.name} meal plan`)}
                      >
                        Preview
                      </Button>
                      <Button
                        mode="contained"
                        compact
                        buttonColor={COLORS.primary}
                        onPress={() => {
                          setShowTemplateModal(false);
                          Alert.alert(
                            `Apply ${template.name}? 🍽️`,
                            'This will replace your current meal plan for the selected week.',
                            [
                              { text: 'Cancel', style: 'cancel' },
                              { 
                                text: 'Apply', 
                                onPress: () => {
                                  Vibration.vibrate(100);
                                  Alert.alert('Success! ✅', `${template.name} has been applied to your meal plan`);
                                }
                              }
                            ]
                          );
                        }}
                      >
                        Apply Template
                      </Button>
                    </View>
                  </LinearGradient>
                </Card>
              ))}
            </ScrollView>
          </View>
        </BlurView>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={[TEXT_STYLES.h2, { color: 'white' }]}>Meal Planning</Text>
            <Text style={[TEXT_STYLES.bodySmall, { color: 'rgba(255,255,255,0.8)' }]}>
              Plan your nutrition success 🥗
            </Text>
          </View>
          <Avatar.Icon 
            size={40} 
            icon="restaurant-menu" 
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          />
        </View>
      </LinearGradient>

      <Animated.ScrollView
        style={{ 
          flex: 1, 
          opacity: fadeAnim, 
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }] 
        }}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            progressBackgroundColor={COLORS.surface}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {['weekly', 'templates', 'shopping'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[
                TEXT_STYLES.body,
                { color: activeTab === tab ? COLORS.primary : COLORS.textSecondary }
              ]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'weekly' && (
          <>
            {renderWeeklyCalendar()}
            {renderDayMeals()}
            {renderQuickActions()}
          </>
        )}

        {activeTab === 'templates' && (
          <>
            {renderMealTemplates()}
            
            {/* Custom Plan Creator */}
            <Card style={styles.customPlanCard}>
              <LinearGradient
                colors={[COLORS.accent + '20', COLORS.accent + '10']}
                style={styles.customPlanGradient}
              >
                <Text style={TEXT_STYLES.h3}>Create Custom Plan 🎨</Text>
                <Text style={[TEXT_STYLES.bodySmall, { marginVertical: SPACING.sm }]}>
                  Build your own personalized meal plan from scratch
                </Text>
                <Button
                  mode="contained"
                  buttonColor={COLORS.accent}
                  onPress={() => Alert.alert('Coming Soon! 🚀', 'Custom meal plan creator is under development')}
                >
                  Start Building
                </Button>
              </LinearGradient>
            </Card>

            {/* AI Suggestions */}
            <Card style={styles.aiSuggestionsCard}>
              <View style={styles.sectionHeader}>
                <Text style={TEXT_STYLES.h3}>AI Suggestions 🤖</Text>
                <Chip mode="outlined" compact>Beta</Chip>
              </View>
              
              <Text style={[TEXT_STYLES.bodySmall, { marginBottom: SPACING.lg }]}>
                Get personalized meal recommendations based on your goals and preferences
              </Text>

              <View style={styles.aiOptions}>
                <TouchableOpacity style={styles.aiOption} activeOpacity={0.8}>
                  <Icon name="psychology" size={24} color={COLORS.info} />
                  <Text style={TEXT_STYLES.bodySmall}>Smart Recommendations</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.aiOption} activeOpacity={0.8}>
                  <Icon name="auto-fix-high" size={24} color={COLORS.warning} />
                  <Text style={TEXT_STYLES.bodySmall}>Optimize Current Plan</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.aiOption} activeOpacity={0.8}>
                  <Icon name="science" size={24} color={COLORS.success} />
                  <Text style={TEXT_STYLES.bodySmall}>Nutritional Analysis</Text>
                </TouchableOpacity>
              </View>
            </Card>
          </>
        )}

        {activeTab === 'shopping' && (
          <>
            {renderShoppingList()}
            
            {/* Shopping Preferences */}
            <Card style={styles.preferencesCard}>
              <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.lg }]}>Shopping Preferences ⚙️</Text>
              
              <View style={styles.preferenceItem}>
                <Text style={TEXT_STYLES.body}>Auto-generate weekly lists</Text>
                <IconButton
                  icon="toggle-switch"
                  size={24}
                  iconColor={COLORS.success}
                  onPress={() => Alert.alert('Setting', 'Auto-generation enabled')}
                />
              </View>
              
              <View style={styles.preferenceItem}>
                <Text style={TEXT_STYLES.body}>Include nutritional info</Text>
                <IconButton
                  icon="toggle-switch-off"
                  size={24}
                  iconColor={COLORS.textSecondary}
                  onPress={() => Alert.alert('Setting', 'Nutritional info disabled')}
                />
              </View>
              
              <View style={styles.preferenceItem}>
                <Text style={TEXT_STYLES.body}>Group by store sections</Text>
                <IconButton
                  icon="toggle-switch"
                  size={24}
                  iconColor={COLORS.success}
                  onPress={() => Alert.alert('Setting', 'Store sections enabled')}
                />
              </View>
            </Card>
          </>
        )}

        {/* Add spacing for FAB */}
        <View style={{ height: 80 }} />
      </Animated.ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon={activeTab === 'weekly' ? 'add' : activeTab === 'templates' ? 'bookmark-plus' : 'shopping-cart-plus'}
        style={styles.fab}
        onPress={() => {
          if (activeTab === 'weekly') {
            setShowMealModal(true);
          } else if (activeTab === 'templates') {
            setShowTemplateModal(true);
          } else {
            Alert.alert('Add Item', 'Add custom item to shopping list');
          }
        }}
        color="white"
      />

      {/* Modals */}
      {renderMealModal()}
      {renderRecipeModal()}
      {renderTemplateModal()}
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
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.xs,
    marginBottom: SPACING.lg,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: COLORS.primary + '20',
  },
  calendarCard: {
    marginBottom: SPACING.lg,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
  },
  calendarHeader: {
    padding: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weekNavigator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  daysScroll: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.md,
  },
  dayCard: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    marginHorizontal: SPACING.xs,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    minWidth: 60,
  },
  selectedDayCard: {
    backgroundColor: COLORS.primary + '20',
    elevation: 2,
  },
  dayMealsIndicator: {
    flexDirection: 'row',
    marginTop: SPACING.xs,
  },
  mealDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 1,
  },
  dayMealsCard: {
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: 16,
    elevation: 3,
  },
  dayMealsHeader: {
    marginBottom: SPACING.lg,
  },
  dayStats: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
    gap: SPACING.sm,
  },
  statChip: {
    backgroundColor: COLORS.primary + '10',
  },
  mealSection: {
    marginBottom: SPACING.md,
  },
  mealTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  mealTypeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealItem: {
    marginBottom: SPACING.sm,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
  },
  mealItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
  },
  mealItemInfo: {
    flex: 1,
  },
  emptyMealSlot: {
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.textSecondary + '30',
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: COLORS.background,
  },
  mealDivider: {
    marginVertical: SPACING.md,
  },
  templatesCard: {
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: 16,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  templateCard: {
    width: 280,
    marginRight: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
  },
  templateGradient: {
    padding: SPACING.lg,
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  templateRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  templateStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: SPACING.md,
  },
  templateStat: {
    alignItems: 'center',
  },
  templateTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  templateTag: {
    backgroundColor: COLORS.surface + '80',
  },
  quickActionsCard: {
    padding: SPACING.lg,
    borderRadius: 16,
    marginBottom: SPACING.lg,
    elevation: 3,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  actionItem: {
    alignItems: 'center',
    marginBottom: SPACING.md,
    width: '22%',
  },
  actionGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  shoppingCard: {
    padding: SPACING.lg,
    borderRadius: 16,
    marginBottom: SPACING.lg,
    elevation: 3,
  },
  shoppingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.textSecondary + '20',
  },
  shoppingItemContent: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  customPlanCard: {
    marginBottom: SPACING.lg,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
  },
  customPlanGradient: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  aiSuggestionsCard: {
    padding: SPACING.lg,
    borderRadius: 16,
    marginBottom: SPACING.lg,
    elevation: 3,
  },
  aiOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  aiOption: {
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    minWidth: 80,
  },
  preferencesCard: {
    padding: SPACING.lg,
    borderRadius: 16,
    elevation: 3,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.textSecondary + '20',
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    width: width * 0.9,
    maxHeight: height * 0.85,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.textSecondary + '20',
  },
  modalBody: {
    padding: SPACING.lg,
    maxHeight: height * 0.65,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.textSecondary + '20',
  },
  modalButton: {
    flex: 0.45,
  },
  searchBar: {
    marginBottom: SPACING.lg,
    elevation: 2,
  },
  recipeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: 12,
    backgroundColor: COLORS.background,
  },
  recipeOptionContent: {
    flex: 1,
  },
  recipeCategoriesContainer: {
    marginBottom: SPACING.lg,
  },
  categoryChip: {
    marginRight: SPACING.sm,
  },
  recipeCard: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderRadius: 12,
    elevation: 2,
  },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  recipeInfo: {
    flex: 1,
  },
  recipeStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  recipeStat: {
    alignItems: 'center',
  },
  recipeTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginVertical: SPACING.sm,
  },
  recipeTag: {
    backgroundColor: COLORS.primary + '10',
  },
  recipeActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.md,
  },
  templateModalCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
  },
  templateModalGradient: {
    padding: SPACING.lg,
  },
  templateModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  templateModalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: SPACING.lg,
  },
  templateActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.lg,
  },
});

export default MealPlanning;