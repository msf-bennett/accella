import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  RefreshControl,
  Alert,
  StatusBar,
  TouchableOpacity,
  Vibration,
  FlatList,
  Image,
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
  Modal,
  TextInput,
  Switch,
  Divider,
  List,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Design System Constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  background: '#f5f5f5',
  white: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e0e0e0',
  nutrition: {
    protein: '#FF6B6B',
    carbs: '#4ECDC4',
    fats: '#45B7D1',
    calories: '#96CEB4',
  },
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold' },
  h2: { fontSize: 24, fontWeight: '600' },
  h3: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: '400' },
  caption: { fontSize: 14, fontWeight: '400' },
  small: { fontSize: 12, fontWeight: '400' },
};

const { width, height } = Dimensions.get('window');

const MealPlanGenerator = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, athletes, mealPlans } = useSelector(state => ({
    user: state.auth.user,
    athletes: state.athletes.list,
    mealPlans: state.nutrition.mealPlans,
  }));

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [generatorModalVisible, setGeneratorModalVisible] = useState(false);
  const [planPreviewVisible, setPlanPreviewVisible] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [selectedDietary, setSelectedDietary] = useState([]);
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [customCalories, setCustomCalories] = useState('');
  const [planDuration, setPlanDuration] = useState(7);
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock data for demonstration
  const mockAthletes = [
    {
      id: '1',
      name: 'John Doe',
      avatar: '👨‍🦰',
      sport: 'Football',
      age: 22,
      weight: 80,
      height: 180,
      activityLevel: 'high',
      currentPlan: 'Muscle Gain Program',
      planStatus: 'active',
      compliance: 85,
    },
    {
      id: '2',
      name: 'Jane Smith',
      avatar: '👩‍🦱',
      sport: 'Basketball',
      age: 20,
      weight: 65,
      height: 170,
      activityLevel: 'very_high',
      currentPlan: null,
      planStatus: 'none',
      compliance: 0,
    },
    {
      id: '3',
      name: 'Mike Johnson',
      avatar: '👨‍🦲',
      sport: 'Swimming',
      age: 24,
      weight: 75,
      height: 175,
      activityLevel: 'high',
      currentPlan: 'Endurance Nutrition',
      planStatus: 'paused',
      compliance: 92,
    },
    {
      id: '4',
      name: 'Sarah Wilson',
      avatar: '👩‍🦳',
      sport: 'Tennis',
      age: 19,
      weight: 58,
      height: 165,
      activityLevel: 'moderate',
      currentPlan: 'Performance Optimization',
      planStatus: 'active',
      compliance: 78,
    },
  ];

  const dietaryOptions = [
    { id: 'vegetarian', label: 'Vegetarian', icon: '🥬' },
    { id: 'vegan', label: 'Vegan', icon: '🌱' },
    { id: 'keto', label: 'Ketogenic', icon: '🥑' },
    { id: 'paleo', label: 'Paleo', icon: '🥩' },
    { id: 'mediterranean', label: 'Mediterranean', icon: '🫒' },
    { id: 'gluten_free', label: 'Gluten-Free', icon: '🌾' },
    { id: 'dairy_free', label: 'Dairy-Free', icon: '🥛' },
    { id: 'low_carb', label: 'Low Carb', icon: '🥒' },
  ];

  const nutritionGoals = [
    { id: 'muscle_gain', label: 'Muscle Gain', icon: '💪' },
    { id: 'weight_loss', label: 'Weight Loss', icon: '⚖️' },
    { id: 'endurance', label: 'Endurance', icon: '🏃‍♂️' },
    { id: 'recovery', label: 'Recovery', icon: '🔄' },
    { id: 'performance', label: 'Performance', icon: '🚀' },
    { id: 'maintenance', label: 'Maintenance', icon: '⚖️' },
    { id: 'cutting', label: 'Cutting', icon: '✂️' },
    { id: 'bulking', label: 'Bulking', icon: '📈' },
  ];

  const mockMealPlan = {
    id: 'plan_1',
    athleteId: '1',
    name: 'High-Performance Nutrition Plan',
    duration: 7,
    totalCalories: 2800,
    macros: {
      protein: { grams: 175, percentage: 25 },
      carbs: { grams: 350, percentage: 50 },
      fats: { grams: 78, percentage: 25 },
    },
    meals: [
      {
        id: 'breakfast',
        name: 'Power Breakfast',
        time: '7:00 AM',
        calories: 650,
        foods: [
          { name: 'Oatmeal with berries', portion: '1 cup', calories: 300 },
          { name: 'Greek yogurt', portion: '200g', calories: 150 },
          { name: 'Banana', portion: '1 medium', calories: 100 },
          { name: 'Almonds', portion: '30g', calories: 100 },
        ],
        macros: { protein: 25, carbs: 85, fats: 18 },
      },
      {
        id: 'lunch',
        name: 'Training Fuel',
        time: '1:00 PM',
        calories: 750,
        foods: [
          { name: 'Grilled chicken breast', portion: '150g', calories: 250 },
          { name: 'Brown rice', portion: '1 cup', calories: 220 },
          { name: 'Mixed vegetables', portion: '200g', calories: 80 },
          { name: 'Olive oil', portion: '1 tbsp', calories: 120 },
          { name: 'Avocado', portion: '1/2 medium', calories: 80 },
        ],
        macros: { protein: 35, carbs: 65, fats: 22 },
      },
      {
        id: 'dinner',
        name: 'Recovery Meal',
        time: '7:00 PM',
        calories: 700,
        foods: [
          { name: 'Salmon fillet', portion: '120g', calories: 280 },
          { name: 'Sweet potato', portion: '200g', calories: 180 },
          { name: 'Broccoli', portion: '150g', calories: 40 },
          { name: 'Quinoa', portion: '80g dry', calories: 120 },
          { name: 'Nuts', portion: '20g', calories: 80 },
        ],
        macros: { protein: 32, carbs: 48, fats: 25 },
      },
    ],
    supplements: [
      { name: 'Whey Protein', timing: 'Post-workout', dosage: '25g' },
      { name: 'Creatine', timing: 'Daily', dosage: '5g' },
      { name: 'Omega-3', timing: 'With meals', dosage: '1000mg' },
    ],
    hydration: { daily_target: 3.5, pre_workout: 500, during_workout: 200, post_workout: 600 },
    notes: 'Adjust portions based on training intensity. Increase carbs on heavy training days.',
  };

  const filteredAthletes = mockAthletes.filter(athlete =>
    athlete.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return COLORS.success;
      case 'paused': return COLORS.warning;
      case 'none': return COLORS.textSecondary;
      default: return COLORS.textSecondary;
    }
  };

  const getComplianceColor = (compliance) => {
    if (compliance >= 80) return COLORS.success;
    if (compliance >= 60) return COLORS.warning;
    return COLORS.error;
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Vibration.vibrate(100);
    }, 1500);
  }, []);

  const handleAthletePress = (athlete) => {
    setSelectedAthlete(athlete);
    setGeneratorModalVisible(true);
    Vibration.vibrate(50);
  };

  const toggleDietaryOption = (optionId) => {
    setSelectedDietary(prev =>
      prev.includes(optionId)
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  };

  const toggleGoal = (goalId) => {
    setSelectedGoals(prev =>
      prev.includes(goalId)
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  const generateMealPlan = async () => {
    if (!selectedAthlete) return;
    
    setIsGenerating(true);
    Vibration.vibrate(100);
    
    // Simulate AI generation
    setTimeout(() => {
      setGeneratedPlan(mockMealPlan);
      setIsGenerating(false);
      setGeneratorModalVisible(false);
      setPlanPreviewVisible(true);
      Vibration.vibrate([100, 50, 100]);
    }, 3000);
  };

  const saveMealPlan = () => {
    Alert.alert(
      'Plan Saved! 🎉',
      'The meal plan has been assigned to the athlete and they will receive a notification.',
      [
        {
          text: 'OK',
          onPress: () => {
            setPlanPreviewVisible(false);
            Vibration.vibrate(100);
          }
        }
      ]
    );
  };

  const renderAthleteCard = ({ item: athlete }) => (
    <Card style={styles.athleteCard} onPress={() => handleAthletePress(athlete)}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.athleteHeader}>
          <View style={styles.athleteInfo}>
            <Text style={styles.avatarText}>{athlete.avatar}</Text>
            <View style={styles.athleteDetails}>
              <Text style={[TEXT_STYLES.body, styles.athleteName]}>
                {athlete.name}
              </Text>
              <Text style={[TEXT_STYLES.caption, styles.athleteSport]}>
                {athlete.sport} • {athlete.age} years
              </Text>
              <Text style={[TEXT_STYLES.caption, styles.athleteStats]}>
                {athlete.weight}kg • {athlete.height}cm
              </Text>
            </View>
          </View>
          <View style={styles.statusContainer}>
            <Chip
              mode="outlined"
              style={[styles.statusChip, { borderColor: getStatusColor(athlete.planStatus) }]}
              textStyle={{ color: getStatusColor(athlete.planStatus), fontSize: 10 }}
            >
              {athlete.planStatus.toUpperCase()}
            </Chip>
          </View>
        </View>

        {athlete.currentPlan && (
          <View style={styles.currentPlan}>
            <Text style={[TEXT_STYLES.caption, styles.planLabel]}>Current Plan:</Text>
            <Text style={[TEXT_STYLES.body, styles.planName]}>{athlete.currentPlan}</Text>
            <View style={styles.complianceContainer}>
              <Text style={[TEXT_STYLES.small, styles.complianceLabel]}>
                Compliance: {athlete.compliance}%
              </Text>
              <ProgressBar
                progress={athlete.compliance / 100}
                color={getComplianceColor(athlete.compliance)}
                style={styles.complianceBar}
              />
            </View>
          </View>
        )}

        <View style={styles.quickActions}>
          <Button
            mode="outlined"
            compact
            icon="restaurant"
            onPress={() => handleAthletePress(athlete)}
            style={styles.actionButton}
          >
            {athlete.currentPlan ? 'Modify Plan' : 'Create Plan'}
          </Button>
          {athlete.currentPlan && (
            <Button
              mode="contained"
              compact
              icon="visibility"
              buttonColor={COLORS.primary}
              onPress={() => {
                setGeneratedPlan(mockMealPlan);
                setPlanPreviewVisible(true);
              }}
              style={styles.actionButton}
            >
              View Plan
            </Button>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  const renderGeneratorModal = () => (
    <Portal>
      <Modal
        visible={generatorModalVisible}
        onDismiss={() => setGeneratorModalVisible(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.blurView} blurType="light" blurAmount={10}>
          <Surface style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Icon name="restaurant-menu" size={32} color={COLORS.primary} />
              <View style={styles.modalHeaderText}>
                <Text style={[TEXT_STYLES.h3, styles.modalTitle]}>
                  AI Meal Plan Generator
                </Text>
                <Text style={[TEXT_STYLES.caption, styles.modalSubtitle]}>
                  {selectedAthlete?.name}
                </Text>
              </View>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setGeneratorModalVisible(false)}
                style={styles.closeButton}
              />
            </View>

            <ScrollView style={styles.modalScrollContent}>
              <View style={styles.sectionContainer}>
                <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>Dietary Preferences</Text>
                <View style={styles.optionsGrid}>
                  {dietaryOptions.map((option) => (
                    <Chip
                      key={option.id}
                      selected={selectedDietary.includes(option.id)}
                      onPress={() => toggleDietaryOption(option.id)}
                      style={[
                        styles.optionChip,
                        selectedDietary.includes(option.id) && styles.selectedOptionChip
                      ]}
                      icon={() => <Text>{option.icon}</Text>}
                    >
                      {option.label}
                    </Chip>
                  ))}
                </View>
              </View>

              <View style={styles.sectionContainer}>
                <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>Nutrition Goals</Text>
                <View style={styles.optionsGrid}>
                  {nutritionGoals.map((goal) => (
                    <Chip
                      key={goal.id}
                      selected={selectedGoals.includes(goal.id)}
                      onPress={() => toggleGoal(goal.id)}
                      style={[
                        styles.optionChip,
                        selectedGoals.includes(goal.id) && styles.selectedOptionChip
                      ]}
                      icon={() => <Text>{goal.icon}</Text>}
                    >
                      {goal.label}
                    </Chip>
                  ))}
                </View>
              </View>

              <View style={styles.sectionContainer}>
                <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>Plan Settings</Text>
                <View style={styles.settingsContainer}>
                  <View style={styles.settingItem}>
                    <Text style={[TEXT_STYLES.body, styles.settingLabel]}>
                      Plan Duration (days)
                    </Text>
                    <View style={styles.durationSelector}>
                      {[7, 14, 21, 28].map((days) => (
                        <Chip
                          key={days}
                          selected={planDuration === days}
                          onPress={() => setPlanDuration(days)}
                          style={[
                            styles.durationChip,
                            planDuration === days && styles.selectedDurationChip
                          ]}
                        >
                          {days}d
                        </Chip>
                      ))}
                    </View>
                  </View>

                  <View style={styles.settingItem}>
                    <Text style={[TEXT_STYLES.body, styles.settingLabel]}>
                      Custom Daily Calories (optional)
                    </Text>
                    <TextInput
                      mode="outlined"
                      placeholder="e.g., 2800"
                      value={customCalories}
                      onChangeText={setCustomCalories}
                      keyboardType="numeric"
                      style={styles.calorieInput}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.athleteInfoCard}>
                <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>Athlete Profile</Text>
                <View style={styles.athleteProfileGrid}>
                  <View style={styles.profileItem}>
                    <Text style={styles.profileLabel}>Sport</Text>
                    <Text style={styles.profileValue}>{selectedAthlete?.sport}</Text>
                  </View>
                  <View style={styles.profileItem}>
                    <Text style={styles.profileLabel}>Weight</Text>
                    <Text style={styles.profileValue}>{selectedAthlete?.weight}kg</Text>
                  </View>
                  <View style={styles.profileItem}>
                    <Text style={styles.profileLabel}>Height</Text>
                    <Text style={styles.profileValue}>{selectedAthlete?.height}cm</Text>
                  </View>
                  <View style={styles.profileItem}>
                    <Text style={styles.profileLabel}>Activity</Text>
                    <Text style={styles.profileValue}>{selectedAthlete?.activityLevel}</Text>
                  </View>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => setGeneratorModalVisible(false)}
                style={styles.modalActionButton}
                disabled={isGenerating}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={generateMealPlan}
                style={styles.modalActionButton}
                loading={isGenerating}
                disabled={isGenerating || selectedGoals.length === 0}
              >
                {isGenerating ? 'Generating...' : 'Generate Plan'}
              </Button>
            </View>
          </Surface>
        </BlurView>
      </Modal>
    </Portal>
  );

  const renderMealCard = (meal) => (
    <Card key={meal.id} style={styles.mealCard}>
      <Card.Content style={styles.mealContent}>
        <View style={styles.mealHeader}>
          <Text style={[TEXT_STYLES.h3, styles.mealName]}>{meal.name}</Text>
          <View style={styles.mealMeta}>
            <Text style={[TEXT_STYLES.caption, styles.mealTime]}>{meal.time}</Text>
            <Text style={[TEXT_STYLES.caption, styles.mealCalories]}>
              {meal.calories} kcal
            </Text>
          </View>
        </View>
        
        <View style={styles.macrosContainer}>
          <View style={styles.macroItem}>
            <Text style={[styles.macroValue, { color: COLORS.nutrition.protein }]}>
              {meal.macros.protein}g
            </Text>
            <Text style={styles.macroLabel}>Protein</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={[styles.macroValue, { color: COLORS.nutrition.carbs }]}>
              {meal.macros.carbs}g
            </Text>
            <Text style={styles.macroLabel}>Carbs</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={[styles.macroValue, { color: COLORS.nutrition.fats }]}>
              {meal.macros.fats}g
            </Text>
            <Text style={styles.macroLabel}>Fats</Text>
          </View>
        </View>

        <View style={styles.foodsList}>
          {meal.foods.map((food, index) => (
            <View key={index} style={styles.foodItem}>
              <View style={styles.foodInfo}>
                <Text style={[TEXT_STYLES.body, styles.foodName]}>{food.name}</Text>
                <Text style={[TEXT_STYLES.caption, styles.foodPortion]}>
                  {food.portion}
                </Text>
              </View>
              <Text style={[TEXT_STYLES.caption, styles.foodCalories]}>
                {food.calories} kcal
              </Text>
            </View>
          ))}
        </View>
      </Card.Content>
    </Card>
  );

  const renderPlanPreview = () => (
    <Portal>
      <Modal
        visible={planPreviewVisible}
        onDismiss={() => setPlanPreviewVisible(false)}
        contentContainerStyle={styles.previewModalContainer}
      >
        <BlurView style={styles.blurView} blurType="light" blurAmount={10}>
          <Surface style={styles.previewModalContent}>
            <View style={styles.previewHeader}>
              <View style={styles.previewHeaderLeft}>
                <Icon name="restaurant-menu" size={32} color={COLORS.primary} />
                <View style={styles.previewHeaderText}>
                  <Text style={[TEXT_STYLES.h2, styles.previewTitle]}>
                    {generatedPlan?.name}
                  </Text>
                  <Text style={[TEXT_STYLES.caption, styles.previewSubtitle]}>
                    {generatedPlan?.duration} days • {generatedPlan?.totalCalories} kcal/day
                  </Text>
                </View>
              </View>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setPlanPreviewVisible(false)}
                style={styles.closeButton}
              />
            </View>

            <ScrollView style={styles.previewScrollContent}>
              <View style={styles.macrosSummary}>
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.macrosSummaryGradient}
                >
                  <Text style={[TEXT_STYLES.h3, styles.macrosSummaryTitle]}>
                    Daily Macros Breakdown
                  </Text>
                  <View style={styles.macrosSummaryGrid}>
                    <View style={styles.macroSummaryItem}>
                      <Text style={styles.macroSummaryValue}>
                        {generatedPlan?.macros.protein.grams}g
                      </Text>
                      <Text style={styles.macroSummaryLabel}>Protein</Text>
                      <Text style={styles.macroSummaryPercentage}>
                        {generatedPlan?.macros.protein.percentage}%
                      </Text>
                    </View>
                    <View style={styles.macroSummaryItem}>
                      <Text style={styles.macroSummaryValue}>
                        {generatedPlan?.macros.carbs.grams}g
                      </Text>
                      <Text style={styles.macroSummaryLabel}>Carbs</Text>
                      <Text style={styles.macroSummaryPercentage}>
                        {generatedPlan?.macros.carbs.percentage}%
                      </Text>
                    </View>
                    <View style={styles.macroSummaryItem}>
                      <Text style={styles.macroSummaryValue}>
                        {generatedPlan?.macros.fats.grams}g
                      </Text>
                      <Text style={styles.macroSummaryLabel}>Fats</Text>
                      <Text style={styles.macroSummaryPercentage}>
                        {generatedPlan?.macros.fats.percentage}%
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>

              <View style={styles.mealsSection}>
                <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>Daily Meals 🍽️</Text>
                {generatedPlan?.meals.map(renderMealCard)}
              </View>

              <View style={styles.supplementsSection}>
                <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>Supplements 💊</Text>
                <Card style={styles.supplementsCard}>
                  <Card.Content>
                    {generatedPlan?.supplements.map((supplement, index) => (
                      <View key={index} style={styles.supplementItem}>
                        <Icon name="local-pharmacy" size={20} color={COLORS.primary} />
                        <View style={styles.supplementInfo}>
                          <Text style={[TEXT_STYLES.body, styles.supplementName]}>
                            {supplement.name}
                          </Text>
                          <Text style={[TEXT_STYLES.caption, styles.supplementDetails]}>
                            {supplement.dosage} • {supplement.timing}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </Card.Content>
                </Card>
              </View>

              <View style={styles.hydrationSection}>
                <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>Hydration Guide 💧</Text>
                <Card style={styles.hydrationCard}>
                  <Card.Content>
                    <View style={styles.hydrationItem}>
                      <Icon name="water-drop" size={20} color={COLORS.primary} />
                      <Text style={[TEXT_STYLES.body, styles.hydrationText]}>
                        Daily Target: {generatedPlan?.hydration.daily_target}L
                      </Text>
                    </View>
                    <View style={styles.hydrationItem}>
                      <Icon name="fitness-center" size={20} color={COLORS.warning} />
                      <Text style={[TEXT_STYLES.body, styles.hydrationText]}>
                        Pre-workout: {generatedPlan?.hydration.pre_workout}ml
                      </Text>
                    </View>
                    <View style={styles.hydrationItem}>
                      <Icon name="directions-run" size={20} color={COLORS.success} />
                      <Text style={[TEXT_STYLES.body, styles.hydrationText]}>
                        During workout: {generatedPlan?.hydration.during_workout}ml/15min
                      </Text>
                    </View>
                    <View style={styles.hydrationItem}>
                      <Icon name="restore" size={20} color={COLORS.nutrition.carbs} />
                      <Text style={[TEXT_STYLES.body, styles.hydrationText]}>
                        Post-workout: {generatedPlan?.hydration.post_workout}ml
                      </Text>
                    </View>
                  </Card.Content>
                </Card>
              </View>

              {generatedPlan?.notes && (
                <View style={styles.notesSection}>
                  <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>Coach Notes 📝</Text>
                  <Card style={styles.notesCard}>
                    <Card.Content>
                      <Text style={[TEXT_STYLES.body, styles.notesText]}>
                        {generatedPlan.notes}
                      </Text>
                    </Card.Content>
                  </Card>
                </View>
              )}
            </ScrollView>

            <View style={styles.previewActions}>
              <Button
                mode="outlined"
                onPress={() => setPlanPreviewVisible(false)}
                style={styles.previewActionButton}
                icon="edit"
              >
                Modify
              </Button>
              <Button
                mode="contained"
                onPress={saveMealPlan}
                style={styles.previewActionButton}
                icon="check"
              >
                Save & Assign
              </Button>
            </View>
          </Surface>
        </BlurView>
      </Modal>
    </Portal>
  );

  const renderStatsOverview = () => (
    <Card style={styles.statsCard}>
      <Card.Content>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.statsGradient}
        >
          <Text style={[TEXT_STYLES.h3, styles.statsTitle]}>Nutrition Overview 🍎</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{mockAthletes.length}</Text>
              <Text style={styles.statLabel}>Athletes</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {mockAthletes.filter(a => a.planStatus === 'active').length}
              </Text>
              <Text style={styles.statLabel}>Active Plans</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {Math.round(mockAthletes.reduce((acc, a) => acc + a.compliance, 0) / mockAthletes.length)}%
              </Text>
              <Text style={styles.statLabel}>Avg Compliance</Text>
            </View>
          </View>
        </LinearGradient>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} translucent />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Text style={[TEXT_STYLES.h1, styles.headerTitle]}>Meal Plan Generator 🍽️</Text>
        <Text style={[TEXT_STYLES.caption, styles.headerSubtitle]}>
          AI-powered nutrition plans for your athletes
        </Text>
      </LinearGradient>

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
        showsVerticalScrollIndicator={false}
      >
        {renderStatsOverview()}

        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search athletes..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor={COLORS.primary}
          />
        </View>

        <View style={styles.athletesList}>
          {filteredAthletes.map((athlete) => renderAthleteCard({ item: athlete }))}
        </View>
      </ScrollView>

      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => {
          Alert.alert(
            'Feature Coming Soon! 🎯',
            'Bulk meal plan generation and nutrition templates are under development.',
            [{ text: 'Got it!', onPress: () => Vibration.vibrate(100) }]
          );
        }}
        color={COLORS.white}
      />

      {renderGeneratorModal()}
      {renderPlanPreview()}
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
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    color: COLORS.white,
    opacity: 0.8,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  statsCard: {
    marginBottom: SPACING.md,
    elevation: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  statsGradient: {
    padding: SPACING.lg,
  },
  statsTitle: {
    color: COLORS.white,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.white,
    opacity: 0.8,
    textAlign: 'center',
  },
  searchContainer: {
    marginBottom: SPACING.md,
  },
  searchBar: {
    backgroundColor: COLORS.white,
    elevation: 2,
  },
  athletesList: {
    gap: SPACING.md,
  },
  athleteCard: {
    elevation: 3,
    borderRadius: 12,
    backgroundColor: COLORS.white,
  },
  cardContent: {
    padding: SPACING.md,
  },
  athleteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  athleteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarText: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  athleteDetails: {
    flex: 1,
  },
  athleteName: {
    color: COLORS.text,
    fontWeight: '600',
  },
  athleteSport: {
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  athleteStats: {
    color: COLORS.textSecondary,
    marginTop: SPACING.xs / 2,
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusChip: {
    height: 28,
  },
  currentPlan: {
    marginBottom: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  planLabel: {
    color: COLORS.textSecondary,
  },
  planName: {
    color: COLORS.text,
    fontWeight: '600',
    marginTop: SPACING.xs,
  },
  complianceContainer: {
    marginTop: SPACING.sm,
  },
  complianceLabel: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  complianceBar: {
    height: 6,
    borderRadius: 3,
  },
  quickActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  // Generator Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurView: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    width: width * 0.95,
    maxHeight: height * 0.9,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalHeaderText: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  modalTitle: {
    color: COLORS.text,
  },
  modalSubtitle: {
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  closeButton: {
    margin: 0,
  },
  modalScrollContent: {
    flex: 1,
    padding: SPACING.lg,
  },
  sectionContainer: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  optionChip: {
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedOptionChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  settingsContainer: {
    gap: SPACING.lg,
  },
  settingItem: {
    gap: SPACING.sm,
  },
  settingLabel: {
    color: COLORS.text,
    fontWeight: '500',
  },
  durationSelector: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  durationChip: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedDurationChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  calorieInput: {
    backgroundColor: COLORS.white,
  },
  athleteInfoCard: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: 12,
    marginTop: SPACING.md,
  },
  athleteProfileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  profileItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: 8,
  },
  profileLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  profileValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  modalActions: {
    flexDirection: 'row',
    padding: SPACING.lg,
    gap: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  modalActionButton: {
    flex: 1,
  },
  // Preview Modal Styles
  previewModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewModalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    width: width * 0.98,
    height: height * 0.95,
    elevation: 10,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  previewHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  previewHeaderText: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  previewTitle: {
    color: COLORS.text,
  },
  previewSubtitle: {
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  previewScrollContent: {
    flex: 1,
    padding: SPACING.lg,
  },
  macrosSummary: {
    marginBottom: SPACING.lg,
    borderRadius: 12,
    overflow: 'hidden',
  },
  macrosSummaryGradient: {
    padding: SPACING.lg,
  },
  macrosSummaryTitle: {
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  macrosSummaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  macroSummaryItem: {
    alignItems: 'center',
  },
  macroSummaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  macroSummaryLabel: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: SPACING.xs,
  },
  macroSummaryPercentage: {
    fontSize: 12,
    color: COLORS.white,
    opacity: 0.7,
    marginTop: SPACING.xs / 2,
  },
  mealsSection: {
    marginBottom: SPACING.lg,
  },
  mealCard: {
    marginBottom: SPACING.md,
    elevation: 2,
    borderRadius: 12,
  },
  mealContent: {
    padding: SPACING.md,
  },
  mealHeader: {
    marginBottom: SPACING.md,
  },
  mealName: {
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  mealMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mealTime: {
    color: COLORS.textSecondary,
  },
  mealCalories: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  macroLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  foodsList: {
    gap: SPACING.sm,
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    color: COLORS.text,
  },
  foodPortion: {
    color: COLORS.textSecondary,
    marginTop: SPACING.xs / 2,
  },
  foodCalories: {
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  supplementsSection: {
    marginBottom: SPACING.lg,
  },
  supplementsCard: {
    elevation: 2,
    borderRadius: 12,
  },
  supplementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  supplementInfo: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  supplementName: {
    color: COLORS.text,
    fontWeight: '500',
  },
  supplementDetails: {
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  hydrationSection: {
    marginBottom: SPACING.lg,
  },
  hydrationCard: {
    elevation: 2,
    borderRadius: 12,
  },
  hydrationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  hydrationText: {
    marginLeft: SPACING.md,
    color: COLORS.text,
  },
  notesSection: {
    marginBottom: SPACING.lg,
  },
  notesCard: {
    elevation: 2,
    borderRadius: 12,
  },
  notesText: {
    color: COLORS.text,
    lineHeight: 24,
  },
  previewActions: {
    flexDirection: 'row',
    padding: SPACING.lg,
    gap: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  previewActionButton: {
    flex: 1,
  },
});

export default MealPlanGenerator;