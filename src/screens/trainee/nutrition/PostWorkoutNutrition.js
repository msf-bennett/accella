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
  Switch,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '@react-native-blur/blur';

// Import your design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const PostWorkoutNutrition = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user, workoutSession, nutritionPlan } = useSelector(state => state.nutrition);
  
  const [refreshing, setRefreshing] = useState(false);
  const [recoveryTimer, setRecoveryTimer] = useState(0);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [hydrationGoal, setHydrationGoal] = useState(500); // ml
  const [currentHydration, setCurrentHydration] = useState(0);
  const [quickActionsExpanded, setQuickActionsExpanded] = useState(false);
  const [autoReminders, setAutoReminders] = useState(true);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const timerRef = useRef(null);

  // Mock workout data - could come from route params
  const mockWorkoutData = {
    type: 'Strength Training',
    duration: 75, // minutes
    intensity: 'High',
    caloriesBurned: 420,
    startTime: new Date(Date.now() - 75 * 60 * 1000),
    endTime: new Date(),
    muscleGroups: ['Chest', 'Triceps', 'Shoulders'],
  };

  // Recovery window calculation (30-minute optimal window)
  const RECOVERY_WINDOW = 30 * 60; // 30 minutes in seconds

  const mockRecoveryMeals = [
    {
      id: 1,
      name: "Protein Power Smoothie",
      type: "Quick Recovery",
      prepTime: 5,
      calories: 320,
      protein: 28,
      carbs: 35,
      fat: 8,
      ingredients: ["Whey protein", "Banana", "Greek yogurt", "Almond milk", "Honey"],
      image: "🥤",
      benefits: ["Fast absorption", "Muscle recovery", "Glycogen replenishment"],
      difficulty: "Easy",
      rating: 4.8,
    },
    {
      id: 2,
      name: "Recovery Bowl",
      type: "Complete Meal",
      prepTime: 15,
      calories: 480,
      protein: 32,
      carbs: 52,
      fat: 12,
      ingredients: ["Quinoa", "Grilled chicken", "Sweet potato", "Avocado", "Spinach"],
      image: "🥗",
      benefits: ["Complete amino acids", "Complex carbs", "Anti-inflammatory"],
      difficulty: "Medium",
      rating: 4.9,
    },
    {
      id: 3,
      name: "Chocolate Recovery Shake",
      type: "Quick Recovery",
      prepTime: 3,
      calories: 280,
      protein: 25,
      carbs: 30,
      fat: 6,
      ingredients: ["Casein protein", "Cocoa powder", "Banana", "Milk", "PB2"],
      image: "🍫",
      benefits: ["Slow release protein", "Antioxidants", "Satisfaction"],
      difficulty: "Easy",
      rating: 4.7,
    },
    {
      id: 4,
      name: "Tuna & Rice Power Pack",
      type: "Complete Meal",
      prepTime: 10,
      calories: 420,
      protein: 35,
      carbs: 45,
      fat: 9,
      ingredients: ["Tuna", "Jasmine rice", "Cucumber", "Soy sauce", "Sesame oil"],
      image: "🍱",
      benefits: ["High protein", "Fast carbs", "Omega-3s"],
      difficulty: "Easy",
      rating: 4.6,
    },
  ];

  const supplementRecommendations = [
    { name: "Whey Protein", dosage: "25-30g", timing: "0-30 min", icon: "💊" },
    { name: "Creatine", dosage: "3-5g", timing: "Post-workout", icon: "⚡" },
    { name: "BCAAs", dosage: "10-15g", timing: "During/After", icon: "🧬" },
    { name: "Electrolytes", dosage: "1 serving", timing: "Immediately", icon: "💧" },
  ];

  useEffect(() => {
    // Start recovery timer
    const startTime = mockWorkoutData.endTime.getTime();
    const updateTimer = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      setRecoveryTimer(elapsed);
      
      // Notify when recovery window is closing
      if (elapsed === RECOVERY_WINDOW - 300 && autoReminders) { // 5 min warning
        Alert.alert(
          "Recovery Window Closing! ⏰",
          "You have 5 minutes left in your optimal recovery window. Consider having your post-workout nutrition now!",
          [{ text: "Got it!", onPress: () => Vibration.vibrate(200) }]
        );
      }
    };

    updateTimer();
    timerRef.current = setInterval(updateTimer, 1000);

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
    ]).start();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Vibration.vibrate(50);
    }, 1500);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRecoveryStatus = () => {
    const percentage = (recoveryTimer / RECOVERY_WINDOW) * 100;
    if (percentage <= 50) return { status: "Optimal", color: COLORS.success, icon: "check-circle" };
    if (percentage <= 85) return { status: "Good", color: "#ff9800", icon: "schedule" };
    return { status: "Late", color: COLORS.error, icon: "warning" };
  };

  const calculateNutritionNeeds = () => {
    const { duration, intensity, caloriesBurned } = mockWorkoutData;
    
    // Protein: 0.25-0.3g per kg body weight (assuming 70kg)
    const protein = Math.round(70 * 0.3);
    
    // Carbs: 0.5-1.2g per kg body weight based on intensity
    const carbMultiplier = intensity === 'High' ? 1.0 : 0.7;
    const carbs = Math.round(70 * carbMultiplier);
    
    // Hydration: 150% of fluid lost (estimate based on calories burned)
    const fluidLoss = Math.round(caloriesBurned * 0.5); // rough estimate
    const hydrationNeeded = Math.round(fluidLoss * 1.5);
    
    return { protein, carbs, hydration: hydrationNeeded };
  };

  const handleRecipePress = (recipe) => {
    setSelectedRecipe(recipe);
    setShowRecipeModal(true);
  };

  const addHydration = (amount) => {
    setCurrentHydration(prev => Math.min(prev + amount, hydrationGoal));
    Vibration.vibrate(50);
  };

  const RecoveryTimerCard = () => {
    const recoveryStatus = getRecoveryStatus();
    const percentage = Math.min((recoveryTimer / RECOVERY_WINDOW) * 100, 100);

    return (
      <Surface style={styles.timerCard} elevation={4}>
        <LinearGradient
          colors={recoveryStatus.color === COLORS.success ? ['#4caf50', '#66bb6a'] : 
                  recoveryStatus.color === '#ff9800' ? ['#ff9800', '#ffb74d'] : 
                  ['#f44336', '#ef5350']}
          style={styles.timerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.timerContent}>
            <Icon name={recoveryStatus.icon} size={32} color="white" />
            <Text style={styles.timerTitle}>Recovery Window</Text>
            <Text style={styles.timerStatus}>{recoveryStatus.status}</Text>
            <Text style={styles.timerText}>{formatTime(recoveryTimer)} / {formatTime(RECOVERY_WINDOW)}</Text>
            <ProgressBar
              progress={percentage / 100}
              color="rgba(255,255,255,0.8)"
              style={styles.timerProgress}
            />
          </View>
        </LinearGradient>
      </Surface>
    );
  };

  const WorkoutSummaryCard = () => (
    <Card style={styles.summaryCard}>
      <Card.Content style={styles.summaryContent}>
        <View style={styles.summaryHeader}>
          <Icon name="fitness-center" size={24} color={COLORS.primary} />
          <Text style={styles.summaryTitle}>Workout Summary</Text>
        </View>
        
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Type</Text>
            <Text style={styles.summaryValue}>{mockWorkoutData.type}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Duration</Text>
            <Text style={styles.summaryValue}>{mockWorkoutData.duration} min</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Intensity</Text>
            <Text style={styles.summaryValue}>{mockWorkoutData.intensity}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Calories Burned</Text>
            <Text style={styles.summaryValue}>{mockWorkoutData.caloriesBurned}</Text>
          </View>
        </View>
        
        <View style={styles.muscleGroups}>
          <Text style={styles.muscleGroupsLabel}>Muscle Groups Worked:</Text>
          <View style={styles.muscleChips}>
            {mockWorkoutData.muscleGroups.map((muscle) => (
              <Chip key={muscle} compact style={styles.muscleChip}>
                {muscle}
              </Chip>
            ))}
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const NutritionNeedsCard = () => {
    const needs = calculateNutritionNeeds();
    
    return (
      <Card style={styles.needsCard}>
        <Card.Content>
          <View style={styles.needsHeader}>
            <Icon name="restaurant" size={24} color={COLORS.primary} />
            <Text style={styles.needsTitle}>Your Recovery Needs</Text>
          </View>
          
          <View style={styles.needsGrid}>
            <View style={styles.needItem}>
              <Icon name="fitness-center" size={20} color="#ff6b6b" />
              <Text style={styles.needLabel}>Protein</Text>
              <Text style={styles.needValue}>{needs.protein}g</Text>
              <Text style={styles.needReason}>Muscle repair</Text>
            </View>
            <View style={styles.needItem}>
              <Icon name="grain" size={20} color="#4ecdc4" />
              <Text style={styles.needLabel}>Carbs</Text>
              <Text style={styles.needValue}>{needs.carbs}g</Text>
              <Text style={styles.needReason}>Glycogen refuel</Text>
            </View>
            <View style={styles.needItem}>
              <Icon name="water-drop" size={20} color="#64b5f6" />
              <Text style={styles.needLabel}>Hydration</Text>
              <Text style={styles.needValue}>{needs.hydration}ml</Text>
              <Text style={styles.needReason}>Rehydration</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const HydrationTracker = () => (
    <Card style={styles.hydrationCard}>
      <Card.Content>
        <View style={styles.hydrationHeader}>
          <Icon name="opacity" size={24} color="#64b5f6" />
          <Text style={styles.hydrationTitle}>Hydration Tracker</Text>
          <Text style={styles.hydrationProgress}>{currentHydration}/{hydrationGoal}ml</Text>
        </View>
        
        <ProgressBar
          progress={currentHydration / hydrationGoal}
          color="#64b5f6"
          style={styles.hydrationProgressBar}
        />
        
        <View style={styles.hydrationActions}>
          {[100, 250, 500].map((amount) => (
            <Button
              key={amount}
              mode="outlined"
              onPress={() => addHydration(amount)}
              style={styles.hydrationButton}
              compact
            >
              +{amount}ml
            </Button>
          ))}
        </View>
      </Card.Content>
    </Card>
  );

  const RecipeCard = ({ recipe }) => (
    <Card style={styles.recipeCard} onPress={() => handleRecipePress(recipe)}>
      <Card.Content style={styles.recipeContent}>
        <View style={styles.recipeHeader}>
          <Text style={styles.recipeEmoji}>{recipe.image}</Text>
          <View style={styles.recipeInfo}>
            <Text style={styles.recipeName}>{recipe.name}</Text>
            <Text style={styles.recipeType}>{recipe.type}</Text>
            <View style={styles.recipeDetails}>
              <Icon name="schedule" size={12} color={COLORS.textSecondary} />
              <Text style={styles.recipeTime}>{recipe.prepTime} min</Text>
              <Icon name="star" size={12} color="#ffd700" style={{ marginLeft: SPACING.sm }} />
              <Text style={styles.recipeRating}>{recipe.rating}</Text>
            </View>
          </View>
          <View style={styles.recipeNutrition}>
            <Text style={styles.recipeCalories}>{recipe.calories} kcal</Text>
            <Text style={styles.recipeMacros}>P:{recipe.protein}g C:{recipe.carbs}g F:{recipe.fat}g</Text>
          </View>
        </View>
        
        <View style={styles.recipeBenefits}>
          {recipe.benefits.slice(0, 2).map((benefit) => (
            <Chip key={benefit} compact style={styles.benefitChip} textStyle={styles.benefitText}>
              {benefit}
            </Chip>
          ))}
        </View>
      </Card.Content>
    </Card>
  );

  const SupplementsCard = () => (
    <Card style={styles.supplementsCard}>
      <Card.Content>
        <View style={styles.supplementsHeader}>
          <Icon name="local-pharmacy" size={24} color={COLORS.primary} />
          <Text style={styles.supplementsTitle}>Supplement Recommendations</Text>
        </View>
        
        {supplementRecommendations.map((supplement) => (
          <View key={supplement.name} style={styles.supplementItem}>
            <Text style={styles.supplementIcon}>{supplement.icon}</Text>
            <View style={styles.supplementInfo}>
              <Text style={styles.supplementName}>{supplement.name}</Text>
              <Text style={styles.supplementDetails}>
                {supplement.dosage} • {supplement.timing}
              </Text>
            </View>
            <IconButton
              icon="add-circle"
              size={20}
              iconColor={COLORS.primary}
              onPress={() => Alert.alert("Add Supplement", `Log ${supplement.name}? 💊`)}
            />
          </View>
        ))}
      </Card.Content>
    </Card>
  );

  const QuickActions = () => (
    <Card style={styles.quickActionsCard}>
      <Card.Content>
        <TouchableOpacity
          style={styles.quickActionsHeader}
          onPress={() => setQuickActionsExpanded(!quickActionsExpanded)}
        >
          <Icon name="flash-on" size={24} color={COLORS.primary} />
          <Text style={styles.quickActionsTitle}>Quick Actions</Text>
          <Icon 
            name={quickActionsExpanded ? "expand-less" : "expand-more"} 
            size={24} 
            color={COLORS.textSecondary} 
          />
        </TouchableOpacity>
        
        {quickActionsExpanded && (
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.quickActionItem}
              onPress={() => Alert.alert("Log Meal", "Quick meal logging coming soon! 🍽️")}
            >
              <Icon name="restaurant" size={20} color={COLORS.primary} />
              <Text style={styles.quickActionText}>Log Meal</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionItem}
              onPress={() => Alert.alert("Set Reminder", "Nutrition reminders coming soon! ⏰")}
            >
              <Icon name="notification-add" size={20} color={COLORS.primary} />
              <Text style={styles.quickActionText}>Set Reminder</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionItem}
              onPress={() => Alert.alert("Share Progress", "Social sharing coming soon! 📱")}
            >
              <Icon name="share" size={20} color={COLORS.primary} />
              <Text style={styles.quickActionText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionItem}
              onPress={() => Alert.alert("Meal Plan", "Navigate to meal plan? 📋")}
            >
              <Icon name="calendar-today" size={20} color={COLORS.primary} />
              <Text style={styles.quickActionText}>Meal Plan</Text>
            </TouchableOpacity>
          </View>
        )}
      </Card.Content>
    </Card>
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
            <Text style={styles.headerTitle}>Recovery Nutrition</Text>
            <View style={styles.headerActions}>
              <IconButton
                icon="settings"
                iconColor="white"
                size={24}
                onPress={() => Alert.alert("Settings", "Recovery settings coming soon! ⚙️")}
              />
            </View>
          </View>
          
          <View style={styles.reminderToggle}>
            <Text style={styles.reminderText}>Auto Reminders</Text>
            <Switch
              value={autoReminders}
              onValueChange={setAutoReminders}
              thumbColor="white"
              trackColor={{ false: 'rgba(255,255,255,0.3)', true: 'rgba(255,255,255,0.6)' }}
            />
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
          
          <RecoveryTimerCard />
          
          <WorkoutSummaryCard />
          
          <NutritionNeedsCard />
          
          <HydrationTracker />
          
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recovery Recipes</Text>
            <TouchableOpacity onPress={() => Alert.alert("Filter", "Recipe filters coming soon! 🔍")}>
              <Icon name="tune" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recipesScroll}
          >
            {mockRecoveryMeals.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </ScrollView>
          
          <SupplementsCard />
          
          <QuickActions />

          <View style={styles.bottomPadding} />
        </Animated.View>
      </Animated.ScrollView>

      <Portal>
        <Modal
          visible={showRecipeModal}
          onDismiss={() => setShowRecipeModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          {selectedRecipe && (
            <ScrollView style={styles.recipeDetailContainer}>
              <View style={styles.recipeDetailHeader}>
                <Text style={styles.recipeDetailTitle}>{selectedRecipe.name}</Text>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => setShowRecipeModal(false)}
                />
              </View>
              
              <View style={styles.recipeDetailBody}>
                <Text style={styles.recipeDetailEmoji}>{selectedRecipe.image}</Text>
                
                <View style={styles.recipeDetailInfo}>
                  <View style={styles.recipeDetailRow}>
                    <Icon name="schedule" size={16} color={COLORS.textSecondary} />
                    <Text style={styles.recipeDetailText}>{selectedRecipe.prepTime} minutes</Text>
                  </View>
                  <View style={styles.recipeDetailRow}>
                    <Icon name="restaurant" size={16} color={COLORS.textSecondary} />
                    <Text style={styles.recipeDetailText}>{selectedRecipe.difficulty}</Text>
                  </View>
                  <View style={styles.recipeDetailRow}>
                    <Icon name="star" size={16} color="#ffd700" />
                    <Text style={styles.recipeDetailText}>{selectedRecipe.rating} rating</Text>
                  </View>
                </View>
                
                <View style={styles.nutritionDetailGrid}>
                  <View style={styles.nutritionDetailItem}>
                    <Text style={styles.nutritionDetailLabel}>Calories</Text>
                    <Text style={styles.nutritionDetailValue}>{selectedRecipe.calories}</Text>
                  </View>
                  <View style={styles.nutritionDetailItem}>
                    <Text style={styles.nutritionDetailLabel}>Protein</Text>
                    <Text style={styles.nutritionDetailValue}>{selectedRecipe.protein}g</Text>
                  </View>
                  <View style={styles.nutritionDetailItem}>
                    <Text style={styles.nutritionDetailLabel}>Carbs</Text>
                    <Text style={styles.nutritionDetailValue}>{selectedRecipe.carbs}g</Text>
                  </View>
                  <View style={styles.nutritionDetailItem}>
                    <Text style={styles.nutritionDetailLabel}>Fat</Text>
                    <Text style={styles.nutritionDetailValue}>{selectedRecipe.fat}g</Text>
                  </View>
                </View>
                
                <View style={styles.benefitsSection}>
                  <Text style={styles.benefitsTitle}>Benefits</Text>
                  <View style={styles.benefitsList}>
                    {selectedRecipe.benefits.map((benefit) => (
                      <View key={benefit} style={styles.benefitItem}>
                        <Icon name="check-circle" size={16} color={COLORS.success} />
                        <Text style={styles.benefitItemText}>{benefit}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                
                <View style={styles.ingredientsSection}>
                  <Text style={styles.ingredientsTitle}>Ingredients</Text>
                  {selectedRecipe.ingredients.map((ingredient, index) => (
                    <View key={index} style={styles.ingredientItem}>
                      <Text style={styles.ingredientBullet}>•</Text>
                      <Text style={styles.ingredientText}>{ingredient}</Text>
                    </View>
                  ))}
                </View>
              </View>
              
              <View style={styles.recipeActions}>
                <Button
                  mode="outlined"
                  onPress={() => Alert.alert("Favorite", "Add to favorites? ❤️")}
                  style={styles.recipeActionButton}
                >
                  Favorite
                </Button>
                <Button
                  mode="contained"
                  onPress={() => Alert.alert("Start Cooking", "Recipe instructions coming soon! 👨‍🍳")}
                  style={styles.recipeActionButton}
                  buttonColor={COLORS.primary}
                >
                  Start Cooking
                </Button>
              </View>
            </ScrollView>
          )}
        </Modal>
      </Portal>

      <FAB
        icon="add"
        style={[styles.fab, { backgroundColor: COLORS.primary }]}
        onPress={() => Alert.alert("Quick Log", "Quick nutrition logging coming soon! ⚡")}
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
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
  },
  reminderToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  reminderText: {
    color: 'white',
    fontSize: 14,
    marginRight: SPACING.sm,
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
  timerCard: {
    marginBottom: SPACING.lg,
    borderRadius: 16,
    overflow: 'hidden',
  },
  timerGradient: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  timerContent: {
    alignItems: 'center',
  },
  timerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: SPACING.sm,
  },
  timerStatus: {
    color: 'white',
    fontSize: 14,
    marginVertical: SPACING.xs,
    opacity: 0.9,
  },
  timerText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
  },
  timerProgress: {
    width: width * 0.7,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  summaryCard: {
    marginBottom: SPACING.lg,
    borderRadius: 16,
  },
  summaryContent: {
    padding: SPACING.lg,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  summaryItem: {
    width: '48%',
    marginBottom: SPACING.md,
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    marginTop: SPACING.xs,
  },
  muscleGroups: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: SPACING.md,
  },
  muscleGroupsLabel: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  muscleChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  muscleChip: {
    backgroundColor: '#f0f7ff',
  },
  needsCard: {
    marginBottom: SPACING.lg,
    borderRadius: 16,
  },
  needsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  needsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  needsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  needItem: {
    alignItems: 'center',
    flex: 1,
  },
  needLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: SPACING.xs,
  },
  needValue: {
    fontSize: 18,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    marginTop: SPACING.xs,
  },
  needReason: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  hydrationCard: {
    marginBottom: SPACING.lg,
    borderRadius: 16,
  },
  hydrationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  hydrationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  hydrationProgress: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  hydrationProgressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.md,
  },
  hydrationActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  hydrationButton: {
    borderRadius: 20,
    borderColor: '#64b5f6',
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
  recipesScroll: {
    paddingHorizontal: SPACING.xs,
    paddingBottom: SPACING.md,
  },
  recipeCard: {
    width: width * 0.8,
    marginRight: SPACING.md,
    borderRadius: 16,
  },
  recipeContent: {
    padding: SPACING.md,
  },
  recipeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  recipeEmoji: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  recipeInfo: {
    flex: 1,
  },
  recipeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  recipeType: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginVertical: SPACING.xs,
  },
  recipeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipeTime: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  recipeRating: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  recipeNutrition: {
    alignItems: 'flex-end',
  },
  recipeCalories: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  recipeMacros: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  recipeBenefits: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  benefitChip: {
    backgroundColor: '#e8f5e8',
  },
  benefitText: {
    fontSize: 10,
    color: COLORS.success,
  },
  supplementsCard: {
    marginBottom: SPACING.lg,
    borderRadius: 16,
  },
  supplementsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  supplementsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  supplementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  supplementIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  supplementInfo: {
    flex: 1,
  },
  supplementName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  supplementDetails: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  quickActionsCard: {
    marginBottom: SPACING.lg,
    borderRadius: 16,
  },
  quickActionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  quickActionItem: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: SPACING.sm,
  },
  quickActionText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginTop: SPACING.xs,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 0,
    margin: SPACING.lg,
    borderRadius: 16,
    maxHeight: '90%',
  },
  recipeDetailContainer: {
    maxHeight: '100%',
  },
  recipeDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  recipeDetailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    flex: 1,
  },
  recipeDetailBody: {
    padding: SPACING.lg,
  },
  recipeDetailEmoji: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  recipeDetailInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  recipeDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipeDetailText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  nutritionDetailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  nutritionDetailItem: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    backgroundColor: '#f0f7ff',
    borderRadius: 12,
    marginBottom: SPACING.sm,
  },
  nutritionDetailLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  nutritionDetailValue: {
    fontSize: 18,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    marginTop: SPACING.xs,
  },
  benefitsSection: {
    marginBottom: SPACING.lg,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  benefitsList: {
    backgroundColor: '#e8f5e8',
    borderRadius: 12,
    padding: SPACING.md,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  benefitItemText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  ingredientsSection: {
    marginBottom: SPACING.lg,
  },
  ingredientsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  ingredientBullet: {
    fontSize: 16,
    color: COLORS.primary,
    marginRight: SPACING.sm,
    fontWeight: 'bold',
  },
  ingredientText: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  recipeActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  recipeActionButton: {
    flex: 0.48,
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

export default PostWorkoutNutrition;