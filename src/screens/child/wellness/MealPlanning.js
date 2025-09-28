import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  RefreshControl,
  Animated,
  Vibration,
  Alert,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
} from 'react-native';
import {
  Card,
  Button,
  ProgressBar,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Chip,
  Searchbar,
  Portal,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import your established constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const MealPlanning = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, nutritionData, isLoading } = useSelector(state => ({
    user: state.auth.user,
    nutritionData: state.wellness.nutrition || {},
    isLoading: state.wellness.isLoading,
  }));

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMealType, setSelectedMealType] = useState('all');
  const [activeDay, setActiveDay] = useState('today');
  const [plannedMeals, setPlannedMeals] = useState(nutritionData.plannedMeals || {});
  const [nutritionGoals, setNutritionGoals] = useState(nutritionData.goals || {});
  const [showMealModal, setShowMealModal] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [weeklyProgress, setWeeklyProgress] = useState(75); // Example progress
  
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [rotateAnim] = useState(new Animated.Value(0));
  const scrollY = useRef(new Animated.Value(0)).current;

  // Days of the week
  const [weekDays] = useState([
    { id: 'today', label: 'Today', short: 'T' },
    { id: 'tomorrow', label: 'Tomorrow', short: 'T' },
    { id: 'wednesday', label: 'Wednesday', short: 'W' },
    { id: 'thursday', label: 'Thursday', short: 'T' },
    { id: 'friday', label: 'Friday', short: 'F' },
    { id: 'saturday', label: 'Saturday', short: 'S' },
    { id: 'sunday', label: 'Sunday', short: 'S' },
  ]);

  // Meal categories
  const [mealTypes] = useState([
    { id: 'all', label: 'All Meals', icon: 'restaurant', color: COLORS.primary },
    { id: 'breakfast', label: 'Breakfast', icon: 'free-breakfast', color: '#FF6B6B' },
    { id: 'lunch', label: 'Lunch', icon: 'lunch-dining', color: '#4ECDC4' },
    { id: 'dinner', label: 'Dinner', icon: 'dinner-dining', color: '#45B7D1' },
    { id: 'snack', label: 'Snacks', icon: 'cookie', color: '#96CEB4' },
    { id: 'pre-workout', label: 'Pre-Workout', icon: 'fitness-center', color: '#FFEAA7' },
    { id: 'post-workout', label: 'Recovery', icon: 'sports-bar', color: '#DDA0DD' },
  ]);

  // Sample meal data
  const [mealOptions] = useState([
    {
      id: 1,
      name: 'Power Breakfast Bowl',
      type: 'breakfast',
      calories: 350,
      protein: 18,
      carbs: 45,
      fat: 12,
      ingredients: ['Oats', 'Banana', 'Greek Yogurt', 'Berries', 'Nuts'],
      prepTime: '10 min',
      difficulty: 'Easy',
      benefits: 'High protein, sustained energy',
      icon: '🥣',
      rating: 4.8,
    },
    {
      id: 2,
      name: 'Champion Sandwich',
      type: 'lunch',
      calories: 420,
      protein: 25,
      carbs: 35,
      fat: 18,
      ingredients: ['Whole grain bread', 'Turkey', 'Avocado', 'Spinach', 'Tomato'],
      prepTime: '5 min',
      difficulty: 'Easy',
      benefits: 'Balanced macros, quick energy',
      icon: '🥪',
      rating: 4.6,
    },
    {
      id: 3,
      name: 'Recovery Smoothie',
      type: 'post-workout',
      calories: 280,
      protein: 22,
      carbs: 32,
      fat: 8,
      ingredients: ['Protein powder', 'Banana', 'Spinach', 'Almond milk', 'Honey'],
      prepTime: '3 min',
      difficulty: 'Easy',
      benefits: 'Fast recovery, muscle repair',
      icon: '🥤',
      rating: 4.9,
    },
    {
      id: 4,
      name: 'Energy Pasta',
      type: 'dinner',
      calories: 480,
      protein: 20,
      carbs: 65,
      fat: 15,
      ingredients: ['Whole wheat pasta', 'Chicken', 'Vegetables', 'Olive oil', 'Herbs'],
      prepTime: '25 min',
      difficulty: 'Medium',
      benefits: 'Carb loading, muscle building',
      icon: '🍝',
      rating: 4.7,
    },
    {
      id: 5,
      name: 'Trail Mix Power',
      type: 'snack',
      calories: 180,
      protein: 6,
      carbs: 15,
      fat: 12,
      ingredients: ['Almonds', 'Dried fruit', 'Dark chocolate', 'Seeds'],
      prepTime: '2 min',
      difficulty: 'Easy',
      benefits: 'Quick energy, healthy fats',
      icon: '🥜',
      rating: 4.5,
    },
    {
      id: 6,
      name: 'Pre-Game Fuel',
      type: 'pre-workout',
      calories: 220,
      protein: 8,
      carbs: 40,
      fat: 4,
      ingredients: ['Banana', 'Oats', 'Honey', 'Cinnamon'],
      prepTime: '5 min',
      difficulty: 'Easy',
      benefits: 'Fast-acting carbs, sustained energy',
      icon: '🍌',
      rating: 4.8,
    },
  ]);

  // Nutrition tips
  const [nutritionTips] = useState([
    {
      id: 1,
      title: 'Eat the Rainbow',
      description: 'Include colorful fruits and vegetables for variety of nutrients',
      icon: 'palette',
      category: 'variety',
    },
    {
      id: 2,
      title: 'Pre-Workout Fuel',
      description: 'Eat 30-60 minutes before training for optimal energy',
      icon: 'schedule',
      category: 'timing',
    },
    {
      id: 3,
      title: 'Post-Workout Recovery',
      description: 'Combine protein and carbs within 30 minutes after training',
      icon: 'restore',
      category: 'recovery',
    },
    {
      id: 4,
      title: 'Stay Hydrated',
      description: 'Drink water throughout the day, especially during activities',
      icon: 'opacity',
      category: 'hydration',
    },
  ]);

  // Component mount animation
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

    startRotateAnimation();
  }, []);

  const startRotateAnimation = () => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
      })
    ).start();
  };

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Dispatch action to refresh nutrition data
      // dispatch(refreshNutritionData());
      setTimeout(() => setRefreshing(false), 1000);
    } catch (error) {
      setRefreshing(false);
      Alert.alert('Error', 'Failed to refresh data. Please try again.');
    }
  }, [dispatch]);

  // Add meal to plan
  const addMealToPlan = (meal, day, mealTime) => {
    Vibration.vibrate(50);
    const updatedPlans = { ...plannedMeals };
    
    if (!updatedPlans[day]) {
      updatedPlans[day] = {};
    }
    
    updatedPlans[day][mealTime] = meal;
    setPlannedMeals(updatedPlans);
    setShowMealModal(false);

    Alert.alert(
      '🍽️ Meal Added!',
      `${meal.name} has been added to your ${day} ${mealTime} plan! 🎯`,
      [{ text: 'Great!', style: 'default' }]
    );

    // Save to state/redux
    // dispatch(updateMealPlan(updatedPlans));
  };

  // Filter meals
  const filteredMeals = mealOptions.filter(meal => {
    const matchesType = selectedMealType === 'all' || meal.type === selectedMealType;
    const matchesSearch = meal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         meal.ingredients.some(ing => ing.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const renderHeader = () => {
    const spin = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg']
    });

    return (
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.headerGradient}
      >
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <View style={styles.headerContent}>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Icon name="restaurant-menu" size={48} color="#ffffff" />
          </Animated.View>
          <Text style={[TEXT_STYLES.heading, styles.headerTitle]}>
            Meal Planning 🍽️
          </Text>
          <Text style={[TEXT_STYLES.body, styles.headerSubtitle]}>
            Fuel your performance, plan your success!
          </Text>
        </View>
      </LinearGradient>
    );
  };

  const renderNutritionOverview = () => (
    <Card style={styles.overviewCard}>
      <LinearGradient
        colors={['#4CAF50', '#45A049']}
        style={styles.overviewGradient}
      >
        <View style={styles.overviewContent}>
          <Text style={styles.overviewTitle}>Today's Nutrition 📊</Text>
          
          <View style={styles.macroContainer}>
            <View style={styles.macroItem}>
              <Text style={styles.macroLabel}>Calories</Text>
              <Text style={styles.macroValue}>1,250 / 1,800</Text>
              <ProgressBar progress={0.69} color="#ffffff" style={styles.macroBar} />
            </View>
            
            <View style={styles.macroItem}>
              <Text style={styles.macroLabel}>Protein</Text>
              <Text style={styles.macroValue}>65g / 90g</Text>
              <ProgressBar progress={0.72} color="#ffffff" style={styles.macroBar} />
            </View>
            
            <View style={styles.macroItem}>
              <Text style={styles.macroLabel}>Carbs</Text>
              <Text style={styles.macroValue}>180g / 250g</Text>
              <ProgressBar progress={0.72} color="#ffffff" style={styles.macroBar} />
            </View>
          </View>
        </View>
      </LinearGradient>
    </Card>
  );

  const renderWeekSelector = () => (
    <View style={styles.weekContainer}>
      <Text style={[TEXT_STYLES.heading, styles.sectionTitle]}>
        Weekly Planner 📅
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.weekDaysContainer}
      >
        {weekDays.map((day) => (
          <TouchableOpacity
            key={day.id}
            style={[
              styles.dayButton,
              activeDay === day.id && styles.activeDayButton
            ]}
            onPress={() => setActiveDay(day.id)}
          >
            <Text style={[
              styles.dayButtonText,
              activeDay === day.id && styles.activeDayButtonText
            ]}>
              {day.short}
            </Text>
            <Text style={[
              styles.dayButtonLabel,
              activeDay === day.id && styles.activeDayButtonLabel
            ]}>
              {day.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderMealTypeFilters = () => (
    <View style={styles.filtersContainer}>
      <Text style={[TEXT_STYLES.heading, styles.sectionTitle]}>
        Meal Categories 🥘
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.mealTypesContainer}
      >
        {mealTypes.map((type) => (
          <Chip
            key={type.id}
            mode={selectedMealType === type.id ? 'flat' : 'outlined'}
            selected={selectedMealType === type.id}
            onPress={() => setSelectedMealType(type.id)}
            style={[
              styles.mealTypeChip,
              selectedMealType === type.id && { backgroundColor: type.color }
            ]}
            textStyle={[
              styles.mealTypeChipText,
              selectedMealType === type.id && { color: '#ffffff' }
            ]}
            icon={type.icon}
          >
            {type.label}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const renderMealCard = ({ item }) => {
    const typeInfo = mealTypes.find(type => type.id === item.type);
    
    return (
      <Card style={styles.mealCard}>
        <View style={styles.mealHeader}>
          <View style={styles.mealIconContainer}>
            <Surface style={[styles.mealIcon, { backgroundColor: typeInfo?.color || COLORS.primary }]}>
              <Text style={styles.mealEmoji}>{item.icon}</Text>
            </Surface>
          </View>
          
          <View style={styles.mealInfo}>
            <Text style={[TEXT_STYLES.heading, styles.mealName]}>
              {item.name}
            </Text>
            <View style={styles.mealMeta}>
              <Chip
                mode="outlined"
                style={styles.mealMetaChip}
                textStyle={styles.mealMetaText}
                icon="schedule"
              >
                {item.prepTime}
              </Chip>
              <Chip
                mode="outlined"
                style={styles.mealMetaChip}
                textStyle={styles.mealMetaText}
                icon="trending-up"
              >
                {item.difficulty}
              </Chip>
            </View>
            <Text style={styles.mealBenefits}>
              💡 {item.benefits}
            </Text>
          </View>

          <View style={styles.mealRating}>
            <Icon name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>

        <View style={styles.nutritionInfo}>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionLabel}>Calories</Text>
            <Text style={styles.nutritionValue}>{item.calories}</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionLabel}>Protein</Text>
            <Text style={styles.nutritionValue}>{item.protein}g</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionLabel}>Carbs</Text>
            <Text style={styles.nutritionValue}>{item.carbs}g</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionLabel}>Fat</Text>
            <Text style={styles.nutritionValue}>{item.fat}g</Text>
          </View>
        </View>

        <View style={styles.ingredientsList}>
          <Text style={styles.ingredientsTitle}>Ingredients:</Text>
          <Text style={styles.ingredientsText}>
            {item.ingredients.join(', ')}
          </Text>
        </View>

        <View style={styles.mealActions}>
          <Button
            mode="contained"
            onPress={() => {
              setSelectedMeal(item);
              setShowMealModal(true);
            }}
            style={styles.addButton}
            buttonColor={COLORS.primary}
          >
            Add to Plan
          </Button>
          
          <IconButton
            icon="favorite-border"
            mode="outlined"
            iconColor={COLORS.secondary}
            size={20}
            onPress={() => {
              Vibration.vibrate(50);
              Alert.alert(
                'Favorites',
                'Meal favoriting coming soon! ❤️',
                [{ text: 'Got it!', style: 'default' }]
              );
            }}
          />
          
          <IconButton
            icon="info"
            mode="outlined"
            iconColor={COLORS.primary}
            size={20}
            onPress={() => {
              Alert.alert(
                'Recipe Details',
                'Detailed cooking instructions coming soon! 👨‍🍳',
                [{ text: 'Awesome!', style: 'default' }]
              );
            }}
          />
        </View>
      </Card>
    );
  };

  const renderTipsSection = () => (
    <Card style={styles.tipsCard}>
      <Text style={[TEXT_STYLES.heading, styles.sectionTitle]}>
        Nutrition Tips 💡
      </Text>
      {nutritionTips.map((tip) => (
        <View key={tip.id} style={styles.tipItem}>
          <Surface style={styles.tipIcon}>
            <Icon name={tip.icon} size={20} color={COLORS.primary} />
          </Surface>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>{tip.title}</Text>
            <Text style={styles.tipDescription}>{tip.description}</Text>
          </View>
        </View>
      ))}
    </Card>
  );

  const renderMealModal = () => (
    <Portal>
      <Modal
        visible={showMealModal}
        onDismiss={() => setShowMealModal(false)}
        contentContainerStyle={styles.modalContent}
      >
        <Text style={styles.modalTitle}>Add to Meal Plan 📋</Text>
        <Text style={styles.modalSubtitle}>
          Where would you like to add {selectedMeal?.name}?
        </Text>
        
        <View style={styles.modalOptions}>
          <Button
            mode="contained"
            onPress={() => addMealToPlan(selectedMeal, activeDay, 'breakfast')}
            style={[styles.modalButton, { backgroundColor: '#FF6B6B' }]}
          >
            Breakfast
          </Button>
          <Button
            mode="contained"
            onPress={() => addMealToPlan(selectedMeal, activeDay, 'lunch')}
            style={[styles.modalButton, { backgroundColor: '#4ECDC4' }]}
          >
            Lunch
          </Button>
          <Button
            mode="contained"
            onPress={() => addMealToPlan(selectedMeal, activeDay, 'dinner')}
            style={[styles.modalButton, { backgroundColor: '#45B7D1' }]}
          >
            Dinner
          </Button>
          <Button
            mode="contained"
            onPress={() => addMealToPlan(selectedMeal, activeDay, 'snack')}
            style={[styles.modalButton, { backgroundColor: '#96CEB4' }]}
          >
            Snack
          </Button>
        </View>
        
        <Button
          mode="outlined"
          onPress={() => setShowMealModal(false)}
          style={styles.modalCancelButton}
        >
          Cancel
        </Button>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {renderNutritionOverview()}
          {renderWeekSelector()}
          {renderMealTypeFilters()}
          
          <View style={styles.searchContainer}>
            <Searchbar
              placeholder="Search meals and ingredients..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
              iconColor={COLORS.primary}
            />
          </View>

          <FlatList
            data={filteredMeals}
            renderItem={renderMealCard}
            keyExtractor={item => item.id.toString()}
            scrollEnabled={false}
            contentContainerStyle={styles.mealsList}
          />

          {renderTipsSection()}
          
          <View style={styles.bottomSpacer} />
        </Animated.View>
      </Animated.ScrollView>

      <FAB
        icon="restaurant"
        style={[styles.fab, { backgroundColor: COLORS.primary }]}
        onPress={() => {
          Alert.alert(
            'Custom Meal',
            'Create custom meals and recipes coming soon! 🍳',
            [{ text: 'Exciting!', style: 'default' }]
          );
        }}
      />

      {renderMealModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: SPACING.large,
    paddingHorizontal: SPACING.medium,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: SPACING.small,
  },
  headerSubtitle: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: SPACING.small,
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.medium,
  },
  overviewCard: {
    marginBottom: SPACING.large,
    elevation: 6,
    borderRadius: 16,
    overflow: 'hidden',
  },
  overviewGradient: {
    padding: SPACING.large,
  },
  overviewContent: {
    alignItems: 'center',
  },
  overviewTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: SPACING.large,
  },
  macroContainer: {
    width: '100%',
    gap: SPACING.medium,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroLabel: {
    color: '#ffffff',
    fontSize: 14,
    opacity: 0.9,
    marginBottom: SPACING.tiny,
  },
  macroValue: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: SPACING.small,
  },
  macroBar: {
    width: 120,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  weekContainer: {
    marginBottom: SPACING.large,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.medium,
    textAlign: 'center',
  },
  weekDaysContainer: {
    paddingHorizontal: SPACING.small,
    gap: SPACING.small,
  },
  dayButton: {
    alignItems: 'center',
    padding: SPACING.small,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    minWidth: 60,
  },
  activeDayButton: {
    backgroundColor: COLORS.primary,
  },
  dayButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  activeDayButtonText: {
    color: '#ffffff',
  },
  dayButtonLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  activeDayButtonLabel: {
    color: '#ffffff',
  },
  filtersContainer: {
    marginBottom: SPACING.large,
  },
  mealTypesContainer: {
    paddingRight: SPACING.medium,
  },
  mealTypeChip: {
    marginRight: SPACING.small,
    marginBottom: SPACING.small,
  },
  mealTypeChipText: {
    fontSize: 12,
  },
  searchContainer: {
    marginBottom: SPACING.large,
  },
  searchBar: {
    elevation: 2,
  },
  mealsList: {
    gap: SPACING.medium,
  },
  mealCard: {
    padding: SPACING.medium,
    elevation: 4,
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.medium,
  },
  mealIconContainer: {
    marginRight: SPACING.medium,
  },
  mealIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  mealEmoji: {
    fontSize: 28,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.small,
  },
  mealMeta: {
    flexDirection: 'row',
    gap: SPACING.small,
    marginBottom: SPACING.small,
  },
  mealMetaChip: {
    height: 28,
  },
  mealMetaText: {
    fontSize: 10,
  },
  mealBenefits: {
    fontSize: 12,
    color: COLORS.primary,
    fontStyle: 'italic',
  },
  mealRating: {
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  nutritionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: SPACING.small,
    marginBottom: SPACING.medium,
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  nutritionValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  ingredientsList: {
    marginBottom: SPACING.medium,
  },
  ingredientsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.tiny,
  },
  ingredientsText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  mealActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.small,
  },
  addButton: {
    flex: 1,
  },
  tipsCard: {
    padding: SPACING.medium,
    elevation: 4,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    marginBottom: SPACING.large,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.medium,
  },
  tipIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.small,
    elevation: 2,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.tiny,
  },
  tipDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    padding: SPACING.large,
    margin: SPACING.large,
    borderRadius: 16,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.small,
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.large,
  },
  modalOptions: {
    gap: SPACING.small,
    marginBottom: SPACING.large,
  },
  modalButton: {
    marginVertical: 2,
  },
  modalCancelButton: {
    borderColor: COLORS.textSecondary,
  },
  bottomSpacer: {
    height: 100,
  },
  fab: {
    position: 'absolute',
    right: SPACING.medium,
    bottom: SPACING.large,
    elevation: 8,
  },
});

export default MealPlanning;
