import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Animated,
  Dimensions,
  Image,
  Platform,
  Vibration
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
  Modal
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const FoodDiary = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, isDarkMode } = useSelector(state => state.auth);
  const { foodEntries, dailyGoals, nutritionStats } = useSelector(state => state.nutrition);

  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // State management
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState('breakfast');
  const [todayEntries, setTodayEntries] = useState([]);
  const [nutritionBreakdown, setNutritionBreakdown] = useState({
    calories: { consumed: 1847, goal: 2200, percentage: 0.84 },
    protein: { consumed: 89, goal: 110, percentage: 0.81 },
    carbs: { consumed: 234, goal: 275, percentage: 0.85 },
    fats: { consumed: 67, goal: 73, percentage: 0.92 },
    fiber: { consumed: 18, goal: 25, percentage: 0.72 },
    water: { consumed: 6, goal: 8, percentage: 0.75 }
  });

  // Mock data for food entries
  const mockFoodEntries = [
    {
      id: 1,
      meal: 'breakfast',
      time: '08:30 AM',
      foods: [
        { name: 'Oatmeal with Berries', calories: 320, protein: 12, carbs: 58, fats: 6 },
        { name: 'Greek Yogurt', calories: 130, protein: 15, carbs: 9, fats: 6 },
        { name: 'Coffee with Milk', calories: 35, protein: 2, carbs: 4, fats: 2 }
      ],
      totalCalories: 485,
      image: null
    },
    {
      id: 2,
      meal: 'lunch',
      time: '12:45 PM',
      foods: [
        { name: 'Grilled Chicken Salad', calories: 420, protein: 35, carbs: 18, fats: 22 },
        { name: 'Quinoa Bowl', calories: 280, protein: 10, carbs: 52, fats: 4 },
        { name: 'Avocado', calories: 160, protein: 2, carbs: 9, fats: 15 }
      ],
      totalCalories: 860,
      image: null
    },
    {
      id: 3,
      meal: 'snack',
      time: '03:30 PM',
      foods: [
        { name: 'Protein Shake', calories: 180, protein: 25, carbs: 8, fats: 3 },
        { name: 'Banana', calories: 105, protein: 1, carbs: 27, fats: 0 }
      ],
      totalCalories: 285,
      image: null
    },
    {
      id: 4,
      meal: 'dinner',
      time: '07:15 PM',
      foods: [
        { name: 'Salmon Fillet', calories: 206, protein: 22, carbs: 0, fats: 12 },
        { name: 'Sweet Potato', calories: 112, protein: 2, carbs: 26, fats: 0 },
        { name: 'Steamed Broccoli', calories: 25, protein: 3, carbs: 5, fats: 0 }
      ],
      totalCalories: 343,
      image: null
    }
  ];

  const mealTypes = [
    { key: 'breakfast', label: 'Breakfast', icon: 'free-breakfast', color: '#FF9800' },
    { key: 'lunch', label: 'Lunch', icon: 'restaurant', color: '#4CAF50' },
    { key: 'snack', label: 'Snacks', icon: 'cookie', color: '#9C27B0' },
    { key: 'dinner', label: 'Dinner', icon: 'dinner-dining', color: '#3F51B5' }
  ];

  const quickAddFoods = [
    { name: 'Water Glass', calories: 0, icon: 'local-drink', type: 'water' },
    { name: 'Apple', calories: 95, icon: 'apple', type: 'snack' },
    { name: 'Protein Shake', calories: 180, icon: 'fitness-center', type: 'supplement' },
    { name: 'Coffee', calories: 5, icon: 'coffee', type: 'beverage' }
  ];

  // Entrance animations
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
      })
    ]).start();
  }, []);

  useEffect(() => {
    setTodayEntries(mockFoodEntries);
  }, [selectedDate]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // dispatch(refreshNutritionData());
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleAddFood = (mealType) => {
    Vibration.vibrate(50);
    setSelectedMeal(mealType);
    setShowAddModal(true);
  };

  const handleQuickAdd = (food) => {
    Vibration.vibrate(30);
    if (food.type === 'water') {
      setNutritionBreakdown(prev => ({
        ...prev,
        water: {
          ...prev.water,
          consumed: Math.min(prev.water.consumed + 1, prev.water.goal),
          percentage: Math.min((prev.water.consumed + 1) / prev.water.goal, 1)
        }
      }));
    }
    Alert.alert('Added!', `${food.name} added to your diary 🎉`);
  };

  const renderHeader = () => (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Food Diary</Text>
          <TouchableOpacity onPress={() => Alert.alert('AI Insights', 'AI nutrition recommendations coming soon! 🤖')}>
            <Icon name="psychology" size={28} color="white" />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerDate}>
          {selectedDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Text>
      </View>
    </LinearGradient>
  );

  const renderDailyOverview = () => (
    <Animated.View
      style={[
        styles.overviewContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <Card style={styles.overviewCard}>
        <Card.Content>
          <View style={styles.calorieHeader}>
            <View style={styles.calorieInfo}>
              <Text style={styles.caloriesConsumed}>
                {nutritionBreakdown.calories.consumed}
              </Text>
              <Text style={styles.caloriesLabel}>Calories Consumed</Text>
            </View>
            <View style={styles.calorieGoal}>
              <Text style={styles.goalText}>
                Goal: {nutritionBreakdown.calories.goal}
              </Text>
              <Text style={styles.remainingText}>
                {nutritionBreakdown.calories.goal - nutritionBreakdown.calories.consumed} remaining
              </Text>
            </View>
          </View>
          
          <ProgressBar
            progress={nutritionBreakdown.calories.percentage}
            color={COLORS.primary}
            style={styles.progressBar}
          />

          <View style={styles.macrosContainer}>
            {['protein', 'carbs', 'fats'].map((macro) => (
              <View key={macro} style={styles.macroItem}>
                <Text style={styles.macroValue}>
                  {nutritionBreakdown[macro].consumed}g
                </Text>
                <Text style={styles.macroLabel}>
                  {macro.charAt(0).toUpperCase() + macro.slice(1)}
                </Text>
                <ProgressBar
                  progress={nutritionBreakdown[macro].percentage}
                  color={macro === 'protein' ? '#4CAF50' : macro === 'carbs' ? '#FF9800' : '#E91E63'}
                  style={styles.macroProgress}
                />
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderWaterTracking = () => (
    <Card style={styles.waterCard}>
      <Card.Content>
        <View style={styles.waterHeader}>
          <Icon name="local-drink" size={24} color={COLORS.primary} />
          <Text style={styles.waterTitle}>Water Intake</Text>
          <Text style={styles.waterGoal}>
            {nutritionBreakdown.water.consumed}/{nutritionBreakdown.water.goal} glasses
          </Text>
        </View>
        
        <View style={styles.waterGlasses}>
          {Array.from({ length: nutritionBreakdown.water.goal }).map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleQuickAdd({ name: 'Water Glass', type: 'water' })}
              style={[
                styles.waterGlass,
                index < nutritionBreakdown.water.consumed && styles.waterGlassFilled
              ]}
            >
              <Icon
                name="local-drink"
                size={20}
                color={index < nutritionBreakdown.water.consumed ? COLORS.primary : '#E0E0E0'}
              />
            </TouchableOpacity>
          ))}
        </View>
        
        <ProgressBar
          progress={nutritionBreakdown.water.percentage}
          color="#2196F3"
          style={styles.waterProgress}
        />
      </Card.Content>
    </Card>
  );

  const renderMealSection = (mealType) => {
    const meal = mealTypes.find(m => m.key === mealType);
    const entries = todayEntries.filter(entry => entry.meal === mealType);
    const totalCalories = entries.reduce((sum, entry) => sum + entry.totalCalories, 0);

    return (
      <Card key={mealType} style={styles.mealCard}>
        <Card.Content>
          <View style={styles.mealHeader}>
            <View style={styles.mealTitleContainer}>
              <Avatar.Icon
                size={40}
                icon={meal.icon}
                style={[styles.mealIcon, { backgroundColor: meal.color }]}
              />
              <View style={styles.mealInfo}>
                <Text style={styles.mealTitle}>{meal.label}</Text>
                <Text style={styles.mealCalories}>{totalCalories} calories</Text>
              </View>
            </View>
            <IconButton
              icon="add"
              iconColor={COLORS.primary}
              size={24}
              onPress={() => handleAddFood(mealType)}
            />
          </View>

          {entries.length > 0 ? (
            <View style={styles.foodEntries}>
              {entries.map((entry) => (
                <View key={entry.id} style={styles.entryContainer}>
                  <Text style={styles.entryTime}>{entry.time}</Text>
                  {entry.foods.map((food, index) => (
                    <View key={index} style={styles.foodItem}>
                      <View style={styles.foodInfo}>
                        <Text style={styles.foodName}>{food.name}</Text>
                        <Text style={styles.foodMacros}>
                          {food.calories}cal • P:{food.protein}g • C:{food.carbs}g • F:{food.fats}g
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => Alert.alert('Edit Food', 'Food editing coming soon!')}
                        style={styles.editButton}
                      >
                        <Icon name="edit" size={16} color={COLORS.primary} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          ) : (
            <TouchableOpacity
              style={styles.emptyMeal}
              onPress={() => handleAddFood(mealType)}
            >
              <Icon name="add-circle-outline" size={32} color="#BDBDBD" />
              <Text style={styles.emptyMealText}>Add food to {meal.label.toLowerCase()}</Text>
            </TouchableOpacity>
          )}
        </Card.Content>
      </Card>
    );
  };

  const renderQuickActions = () => (
    <Card style={styles.quickActionsCard}>
      <Card.Content>
        <Text style={styles.quickActionsTitle}>Quick Add</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickActionsScroll}>
          {quickAddFoods.map((food, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickActionItem}
              onPress={() => handleQuickAdd(food)}
            >
              <Surface style={styles.quickActionSurface}>
                <Icon name={food.icon} size={24} color={COLORS.primary} />
                <Text style={styles.quickActionText}>{food.name}</Text>
                <Text style={styles.quickActionCalories}>{food.calories} cal</Text>
              </Surface>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Card.Content>
    </Card>
  );

  const renderAddFoodModal = () => (
    <Portal>
      <Modal
        visible={showAddModal}
        onDismiss={() => setShowAddModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView intensity={80} style={styles.modalBlur}>
          <Card style={styles.modalCard}>
            <Card.Content>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add to {selectedMeal}</Text>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => setShowAddModal(false)}
                />
              </View>

              <Searchbar
                placeholder="Search foods..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchBar}
              />

              <ScrollView style={styles.modalContent}>
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Recent Foods</Text>
                  {['Grilled Chicken Breast', 'Brown Rice', 'Mixed Vegetables', 'Protein Shake'].map((food, index) => (
                    <TouchableOpacity key={index} style={styles.foodOption}>
                      <Text style={styles.foodOptionName}>{food}</Text>
                      <Text style={styles.foodOptionInfo}>Tap to add</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Popular Foods</Text>
                  {['Banana', 'Greek Yogurt', 'Almonds', 'Whole Wheat Bread'].map((food, index) => (
                    <TouchableOpacity key={index} style={styles.foodOption}>
                      <Text style={styles.foodOptionName}>{food}</Text>
                      <Text style={styles.foodOptionInfo}>Tap to add</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={() => Alert.alert('Barcode Scanner', 'Barcode scanning coming soon! 📱')}
                  style={styles.modalButton}
                >
                  Scan Barcode
                </Button>
                <Button
                  mode="contained"
                  onPress={() => Alert.alert('Create Custom', 'Custom food creation coming soon!')}
                  style={styles.modalButton}
                >
                  Create Custom
                </Button>
              </View>
            </Card.Content>
          </Card>
        </BlurView>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {renderDailyOverview()}
        {renderWaterTracking()}
        {renderQuickActions()}
        
        <View style={styles.mealsContainer}>
          {mealTypes.map(meal => renderMealSection(meal.key))}
        </View>

        <Card style={styles.insightsCard}>
          <Card.Content>
            <View style={styles.insightsHeader}>
              <Icon name="insights" size={24} color={COLORS.primary} />
              <Text style={styles.insightsTitle}>AI Insights</Text>
            </View>
            <Text style={styles.insightsText}>
              🎯 Great job staying within your calorie goal! Consider adding more fiber-rich foods for better digestion.
            </Text>
            <Text style={styles.insightsText}>
              💪 Your protein intake is on track for muscle recovery after today's training session.
            </Text>
            <Button
              mode="outlined"
              onPress={() => Alert.alert('AI Coach', 'Detailed AI nutrition coaching coming soon! 🤖')}
              style={styles.insightsButton}
            >
              Get More Insights
            </Button>
          </Card.Content>
        </Card>

        <View style={styles.bottomSpacing} />
      </Animated.ScrollView>

      <FAB
        icon="camera"
        style={styles.fab}
        onPress={() => Alert.alert('Photo Food Log', 'Photo food logging coming soon! 📸')}
        color="white"
      />

      {renderAddFoodModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 20,
    paddingBottom: SPACING.large,
    paddingHorizontal: SPACING.medium,
  },
  headerContent: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.small,
  },
  headerTitle: {
    ...TEXT_STYLES.headerLarge,
    color: 'white',
    fontWeight: '700',
  },
  headerDate: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  overviewContainer: {
    marginTop: -20,
    paddingHorizontal: SPACING.medium,
    marginBottom: SPACING.medium,
  },
  overviewCard: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderRadius: 16,
  },
  calorieHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.medium,
  },
  calorieInfo: {
    flex: 1,
  },
  caloriesConsumed: {
    ...TEXT_STYLES.headerLarge,
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 32,
  },
  caloriesLabel: {
    ...TEXT_STYLES.body,
    color: '#666',
  },
  calorieGoal: {
    alignItems: 'flex-end',
  },
  goalText: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: '#333',
  },
  remainingText: {
    ...TEXT_STYLES.caption,
    color: '#666',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.large,
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroItem: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: SPACING.small,
  },
  macroValue: {
    ...TEXT_STYLES.body,
    fontWeight: '700',
    fontSize: 18,
    color: '#333',
  },
  macroLabel: {
    ...TEXT_STYLES.caption,
    color: '#666',
    marginBottom: SPACING.small,
  },
  macroProgress: {
    height: 4,
    borderRadius: 2,
    width: '100%',
  },
  waterCard: {
    marginHorizontal: SPACING.medium,
    marginBottom: SPACING.medium,
    borderRadius: 16,
    elevation: 2,
  },
  waterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.medium,
  },
  waterTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    flex: 1,
    marginLeft: SPACING.small,
  },
  waterGoal: {
    ...TEXT_STYLES.caption,
    color: '#666',
  },
  waterGlasses: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.medium,
  },
  waterGlass: {
    margin: SPACING.small,
    padding: SPACING.small,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  waterGlassFilled: {
    backgroundColor: '#E3F2FD',
  },
  waterProgress: {
    height: 6,
    borderRadius: 3,
  },
  quickActionsCard: {
    marginHorizontal: SPACING.medium,
    marginBottom: SPACING.medium,
    borderRadius: 16,
    elevation: 2,
  },
  quickActionsTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: SPACING.medium,
    color: '#333',
  },
  quickActionsScroll: {
    flexDirection: 'row',
  },
  quickActionItem: {
    marginRight: SPACING.medium,
  },
  quickActionSurface: {
    padding: SPACING.medium,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 80,
    elevation: 1,
  },
  quickActionText: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    marginTop: SPACING.small,
    color: '#333',
  },
  quickActionCalories: {
    ...TEXT_STYLES.caption,
    color: '#666',
    fontSize: 10,
  },
  mealsContainer: {
    paddingHorizontal: SPACING.medium,
  },
  mealCard: {
    marginBottom: SPACING.medium,
    borderRadius: 16,
    elevation: 2,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.medium,
  },
  mealTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  mealIcon: {
    marginRight: SPACING.medium,
  },
  mealInfo: {
    flex: 1,
  },
  mealTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: '#333',
  },
  mealCalories: {
    ...TEXT_STYLES.caption,
    color: '#666',
  },
  foodEntries: {
    marginTop: SPACING.small,
  },
  entryContainer: {
    marginBottom: SPACING.medium,
  },
  entryTime: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: SPACING.small,
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.small,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    ...TEXT_STYLES.body,
    color: '#333',
    fontWeight: '500',
  },
  foodMacros: {
    ...TEXT_STYLES.caption,
    color: '#666',
    marginTop: 2,
  },
  editButton: {
    padding: SPACING.small,
  },
  emptyMeal: {
    alignItems: 'center',
    paddingVertical: SPACING.large,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
  },
  emptyMealText: {
    ...TEXT_STYLES.body,
    color: '#BDBDBD',
    marginTop: SPACING.small,
  },
  insightsCard: {
    marginHorizontal: SPACING.medium,
    marginBottom: SPACING.medium,
    borderRadius: 16,
    elevation: 2,
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.medium,
  },
  insightsTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginLeft: SPACING.small,
    color: '#333',
  },
  insightsText: {
    ...TEXT_STYLES.body,
    color: '#666',
    marginBottom: SPACING.small,
    lineHeight: 22,
  },
  insightsButton: {
    marginTop: SPACING.small,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modalCard: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    borderRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.medium,
  },
  modalTitle: {
    ...TEXT_STYLES.headerMedium,
    color: '#333',
    textTransform: 'capitalize',
  },
  searchBar: {
    marginBottom: SPACING.medium,
    elevation: 0,
    backgroundColor: '#F5F5F5',
  },
  modalContent: {
    maxHeight: 300,
  },
  modalSection: {
    marginBottom: SPACING.large,
  },
  modalSectionTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: '#333',
    marginBottom: SPACING.medium,
  },
  foodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.medium,
    paddingHorizontal: SPACING.small,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  foodOptionName: {
    ...TEXT_STYLES.body,
    color: '#333',
    flex: 1,
  },
  foodOptionInfo: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.large,
    gap: SPACING.medium,
  },
  modalButton: {
    flex: 1,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default FoodDiary;