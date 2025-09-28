import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  RefreshControl,
  Animated,
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
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '@react-native-blur/blur';

// Import your design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const MealPlan = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, mealPlans, nutritionGoals, dailyIntake } = useSelector(state => state.nutrition);
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [showMealModal, setShowMealModal] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('today');
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

  // Mock data for demonstration
  const mockNutritionGoals = {
    calories: 2200,
    protein: 165, // grams
    carbs: 275,   // grams
    fat: 73,      // grams
    water: 3000,  // ml
  };

  const mockDailyIntake = {
    calories: 1650,
    protein: 120,
    carbs: 180,
    fat: 55,
    water: 2100,
  };

  const mockMeals = {
    breakfast: {
      name: "Protein Oatmeal Bowl",
      calories: 420,
      protein: 25,
      carbs: 45,
      fat: 12,
      time: "08:00 AM",
      image: "🥣",
      completed: true,
    },
    lunch: {
      name: "Grilled Chicken Salad",
      calories: 580,
      protein: 45,
      carbs: 35,
      fat: 28,
      time: "01:00 PM",
      image: "🥗",
      completed: true,
    },
    dinner: {
      name: "Salmon with Sweet Potato",
      calories: 650,
      protein: 50,
      carbs: 100,
      fat: 15,
      time: "07:00 PM",
      image: "🐟",
      completed: false,
    },
    snacks: {
      name: "Greek Yogurt & Berries",
      calories: 180,
      protein: 15,
      carbs: 25,
      fat: 3,
      time: "03:30 PM",
      image: "🫐",
      completed: false,
    },
  };

  useEffect(() => {
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
      Vibration.vibrate(50);
    }, 1500);
  }, []);

  const handleMealPress = (mealType, mealData) => {
    setSelectedMeal({ type: mealType, ...mealData });
    setShowMealModal(true);
  };

  const toggleMealCompletion = (mealType) => {
    Alert.alert(
      "Mark as Consumed",
      `Did you complete your ${mealType}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Yes", 
          onPress: () => {
            Vibration.vibrate(100);
            // Dispatch action to update meal completion
          }
        },
      ]
    );
  };

  const calculateProgress = (current, goal) => {
    return Math.min(current / goal, 1);
  };

  const NutritionOverview = () => (
    <Surface style={styles.nutritionCard} elevation={4}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.nutritionHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.nutritionTitle}>Today's Nutrition</Text>
        <Text style={styles.caloriesText}>
          {mockDailyIntake.calories} / {mockNutritionGoals.calories} kcal
        </Text>
        <ProgressBar
          progress={calculateProgress(mockDailyIntake.calories, mockNutritionGoals.calories)}
          color={COLORS.success}
          style={styles.mainProgressBar}
        />
      </LinearGradient>
      
      <View style={styles.macroGrid}>
        {[
          { name: 'Protein', current: mockDailyIntake.protein, goal: mockNutritionGoals.protein, unit: 'g', color: '#ff6b6b' },
          { name: 'Carbs', current: mockDailyIntake.carbs, goal: mockNutritionGoals.carbs, unit: 'g', color: '#4ecdc4' },
          { name: 'Fat', current: mockDailyIntake.fat, goal: mockNutritionGoals.fat, unit: 'g', color: '#ffe66d' },
          { name: 'Water', current: mockDailyIntake.water, goal: mockNutritionGoals.water, unit: 'ml', color: '#a8e6cf' },
        ].map((macro) => (
          <View key={macro.name} style={styles.macroItem}>
            <Text style={styles.macroName}>{macro.name}</Text>
            <Text style={styles.macroValue}>
              {macro.current} / {macro.goal} {macro.unit}
            </Text>
            <ProgressBar
              progress={calculateProgress(macro.current, macro.goal)}
              color={macro.color}
              style={styles.macroProgress}
            />
          </View>
        ))}
      </View>
    </Surface>
  );

  const MealCard = ({ mealType, mealData }) => (
    <Card style={styles.mealCard} onPress={() => handleMealPress(mealType, mealData)}>
      <Card.Content style={styles.mealContent}>
        <View style={styles.mealHeader}>
          <View style={styles.mealTitleRow}>
            <Text style={styles.mealEmoji}>{mealData.image}</Text>
            <View style={styles.mealInfo}>
              <Text style={styles.mealType}>{mealType}</Text>
              <Text style={styles.mealName}>{mealData.name}</Text>
              <Text style={styles.mealTime}>{mealData.time}</Text>
            </View>
          </View>
          <View style={styles.mealActions}>
            <IconButton
              icon={mealData.completed ? "check-circle" : "check-circle-outline"}
              iconColor={mealData.completed ? COLORS.success : COLORS.secondary}
              size={24}
              onPress={() => toggleMealCompletion(mealType)}
            />
          </View>
        </View>
        
        <View style={styles.nutritionRow}>
          <Chip icon="local-fire-department" compact textStyle={styles.chipText}>
            {mealData.calories} kcal
          </Chip>
          <Chip icon="fitness-center" compact textStyle={styles.chipText}>
            P: {mealData.protein}g
          </Chip>
          <Chip icon="grain" compact textStyle={styles.chipText}>
            C: {mealData.carbs}g
          </Chip>
          <Chip icon="opacity" compact textStyle={styles.chipText}>
            F: {mealData.fat}g
          </Chip>
        </View>
      </Card.Content>
    </Card>
  );

  const WeekNavigation = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.weekScroll}
      contentContainerStyle={styles.weekScrollContent}
    >
      {daysOfWeek.map((day, index) => {
        const isToday = index === new Date().getDay();
        const isSelected = index === selectedDay;
        
        return (
          <TouchableOpacity
            key={day}
            style={[
              styles.dayButton,
              isSelected && styles.selectedDayButton,
              isToday && styles.todayButton,
            ]}
            onPress={() => setSelectedDay(index)}
          >
            <Text style={[
              styles.dayText,
              isSelected && styles.selectedDayText,
              isToday && styles.todayText,
            ]}>
              {day.substring(0, 3)}
            </Text>
            <Text style={[
              styles.dateText,
              isSelected && styles.selectedDateText,
            ]}>
              {new Date().getDate() + (index - new Date().getDay())}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" translucent />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <IconButton
              icon="arrow-back"
              iconColor="white"
              size={24}
              onPress={() => navigation.goBack()}
            />
            <Text style={styles.headerTitle}>Meal Plan</Text>
            <IconButton
              icon="settings"
              iconColor="white"
              size={24}
              onPress={() => Alert.alert("Settings", "Nutrition settings coming soon! 🍎")}
            />
          </View>
          
          <View style={styles.streakContainer}>
            <Icon name="local-fire-department" size={20} color="#ff6b6b" />
            <Text style={styles.streakText}>7 day nutrition streak! 🔥</Text>
          </View>
        </View>
      </LinearGradient>

      <Animated.ScrollView
        style={[styles.scrollView, { opacity: fadeAnim }]}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
            progressBackgroundColor={COLORS.background}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.content, { transform: [{ translateY: slideAnim }] }]}>
          
          <NutritionOverview />
          
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Weekly Overview</Text>
            <TouchableOpacity onPress={() => Alert.alert("Calendar", "Full calendar view coming soon! 📅")}>
              <Icon name="calendar-today" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          
          <WeekNavigation />
          
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Meals</Text>
            <TouchableOpacity onPress={() => Alert.alert("Add Meal", "Custom meal creation coming soon! ➕")}>
              <Icon name="add-circle" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.mealsContainer}>
            {Object.entries(mockMeals).map(([mealType, mealData]) => (
              <MealCard
                key={mealType}
                mealType={mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                mealData={mealData}
              />
            ))}
          </View>

          <Card style={styles.tipsCard}>
            <Card.Content>
              <View style={styles.tipsHeader}>
                <Icon name="lightbulb" size={20} color="#ffd700" />
                <Text style={styles.tipsTitle}>Nutrition Tips</Text>
              </View>
              <Text style={styles.tipsText}>
                • Drink water before meals to improve satiety 💧{'\n'}
                • Include protein in every meal for muscle recovery 💪{'\n'}
                • Eat colorful vegetables for micronutrient diversity 🌈{'\n'}
                • Time carbs around your workouts for energy ⚡
              </Text>
            </Card.Content>
          </Card>

          <View style={styles.bottomPadding} />
        </Animated.View>
      </Animated.ScrollView>

      <Portal>
        <Modal
          visible={showMealModal}
          onDismiss={() => setShowMealModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          {selectedMeal && (
            <View style={styles.mealDetailContainer}>
              <View style={styles.mealDetailHeader}>
                <Text style={styles.mealDetailTitle}>{selectedMeal.name}</Text>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => setShowMealModal(false)}
                />
              </View>
              
              <View style={styles.mealDetailBody}>
                <Text style={styles.mealDetailEmoji}>{selectedMeal.image}</Text>
                <Text style={styles.mealDetailType}>{selectedMeal.type}</Text>
                <Text style={styles.mealDetailTime}>{selectedMeal.time}</Text>
                
                <View style={styles.nutritionDetails}>
                  <View style={styles.nutritionDetailItem}>
                    <Text style={styles.nutritionLabel}>Calories</Text>
                    <Text style={styles.nutritionValue}>{selectedMeal.calories} kcal</Text>
                  </View>
                  <View style={styles.nutritionDetailItem}>
                    <Text style={styles.nutritionLabel}>Protein</Text>
                    <Text style={styles.nutritionValue}>{selectedMeal.protein}g</Text>
                  </View>
                  <View style={styles.nutritionDetailItem}>
                    <Text style={styles.nutritionLabel}>Carbs</Text>
                    <Text style={styles.nutritionValue}>{selectedMeal.carbs}g</Text>
                  </View>
                  <View style={styles.nutritionDetailItem}>
                    <Text style={styles.nutritionLabel}>Fat</Text>
                    <Text style={styles.nutritionValue}>{selectedMeal.fat}g</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.mealActions}>
                <Button
                  mode="outlined"
                  onPress={() => Alert.alert("Edit", "Meal editing coming soon! ✏️")}
                  style={styles.actionButton}
                >
                  Edit Meal
                </Button>
                <Button
                  mode="contained"
                  onPress={() => toggleMealCompletion(selectedMeal.type)}
                  style={styles.actionButton}
                  buttonColor={COLORS.primary}
                >
                  {selectedMeal.completed ? "Mark Incomplete" : "Mark Complete"}
                </Button>
              </View>
            </View>
          )}
        </Modal>
      </Portal>

      <FAB
        icon="restaurant"
        style={[styles.fab, { backgroundColor: COLORS.primary }]}
        onPress={() => Alert.alert("Quick Add", "Quick meal logging coming soon! 📱")}
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
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    marginTop: SPACING.sm,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    ...TEXT_STYLES.header,
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  streakText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: SPACING.md,
  },
  nutritionCard: {
    marginBottom: SPACING.lg,
    borderRadius: 16,
    overflow: 'hidden',
  },
  nutritionHeader: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  nutritionTitle: {
    ...TEXT_STYLES.header,
    color: 'white',
    fontSize: 20,
    marginBottom: SPACING.xs,
  },
  caloriesText: {
    color: 'white',
    fontSize: 16,
    marginBottom: SPACING.md,
    fontWeight: '600',
  },
  mainProgressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  macroGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SPACING.lg,
    justifyContent: 'space-between',
  },
  macroItem: {
    width: '48%',
    marginBottom: SPACING.md,
  },
  macroName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  macroValue: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  macroProgress: {
    height: 4,
    borderRadius: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.header,
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  weekScroll: {
    marginBottom: SPACING.lg,
  },
  weekScrollContent: {
    paddingHorizontal: SPACING.xs,
  },
  dayButton: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginHorizontal: SPACING.xs,
    borderRadius: 12,
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedDayButton: {
    backgroundColor: COLORS.primary,
  },
  todayButton: {
    borderWidth: 2,
    borderColor: COLORS.success,
  },
  dayText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  selectedDayText: {
    color: 'white',
  },
  todayText: {
    color: COLORS.success,
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
  },
  selectedDateText: {
    color: 'white',
  },
  mealsContainer: {
    marginBottom: SPACING.lg,
  },
  mealCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    elevation: 3,
  },
  mealContent: {
    padding: SPACING.md,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  mealTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  mealEmoji: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  mealInfo: {
    flex: 1,
  },
  mealType: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  mealName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginVertical: SPACING.xs,
  },
  mealTime: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  mealActions: {
    alignItems: 'center',
  },
  nutritionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  chipText: {
    fontSize: 10,
  },
  tipsCard: {
    marginBottom: SPACING.lg,
    borderRadius: 16,
    backgroundColor: '#fffbf0',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  tipsText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 0,
    margin: SPACING.lg,
    borderRadius: 16,
    maxHeight: '80%',
  },
  mealDetailContainer: {
    padding: SPACING.lg,
  },
  mealDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  mealDetailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    flex: 1,
  },
  mealDetailBody: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  mealDetailEmoji: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  mealDetailType: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  mealDetailTime: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  nutritionDetails: {
    width: '100%',
  },
  nutritionDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  nutritionLabel: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  nutritionValue: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  actionButton: {
    marginVertical: SPACING.xs,
    borderRadius: 12,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 80,
    borderRadius: 28,
  },
  bottomPadding: {
    height: 100,
  },
});

export default NutritionPlan;
