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

const MacroTracking = ({ navigation, route }) => {
  // Redux state
  const user = useSelector(state => state.auth.user);
  const clients = useSelector(state => state.clients?.list || []);
  const macroData = useSelector(state => state.nutrition?.macroData || {});
  const dispatch = useDispatch();

  // Component state
  const [refreshing, setRefreshing] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [showMealPlanModal, setShowMealPlanModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('today');
  const [newFoodEntry, setNewFoodEntry] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    quantity: '1',
    meal: 'breakfast',
  });

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Mock data for demonstration
  const [todaysMacros, setTodaysMacros] = useState({
    calories: { consumed: 1850, target: 2200, percentage: 0.84 },
    protein: { consumed: 125, target: 150, percentage: 0.83 },
    carbs: { consumed: 180, target: 220, percentage: 0.82 },
    fat: { consumed: 65, target: 80, percentage: 0.81 },
  });

  const [recentFoods, setRecentFoods] = useState([
    { id: '1', name: 'Grilled Chicken Breast', calories: 231, protein: 43.5, carbs: 0, fat: 5, lastUsed: '2 hours ago' },
    { id: '2', name: 'Brown Rice (1 cup)', calories: 216, protein: 5, carbs: 45, fat: 1.8, lastUsed: '1 day ago' },
    { id: '3', name: 'Avocado (1 medium)', calories: 322, protein: 4, carbs: 17, fat: 29, lastUsed: '1 day ago' },
    { id: '4', name: 'Greek Yogurt (1 cup)', calories: 100, protein: 17, carbs: 6, fat: 0, lastUsed: '2 days ago' },
  ]);

  const [mealEntries, setMealEntries] = useState([
    {
      id: '1',
      meal: 'Breakfast',
      time: '08:30 AM',
      foods: [
        { name: 'Oatmeal with berries', calories: 320, protein: 12, carbs: 58, fat: 6 },
        { name: 'Greek Yogurt', calories: 100, protein: 17, carbs: 6, fat: 0 },
      ],
      totalCalories: 420,
    },
    {
      id: '2',
      meal: 'Lunch',
      time: '12:45 PM',
      foods: [
        { name: 'Grilled Chicken Salad', calories: 450, protein: 35, carbs: 12, fat: 28 },
        { name: 'Brown Rice', calories: 216, protein: 5, carbs: 45, fat: 1.8 },
      ],
      totalCalories: 666,
    },
  ]);

  const [weeklyProgress, setWeeklyProgress] = useState([
    { day: 'Mon', calories: 2100, target: 2200, percentage: 0.95 },
    { day: 'Tue', calories: 2050, target: 2200, percentage: 0.93 },
    { day: 'Wed', calories: 2180, target: 2200, percentage: 0.99 },
    { day: 'Thu', calories: 1950, target: 2200, percentage: 0.89 },
    { day: 'Fri', calories: 2250, target: 2200, percentage: 1.02 },
    { day: 'Sat', calories: 2100, target: 2200, percentage: 0.95 },
    { day: 'Sun', calories: 1850, target: 2200, percentage: 0.84 },
  ]);

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
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      Vibration.vibrate(50);
    }, 1000);
  }, []);

  const handleAddFood = () => {
    if (!newFoodEntry.name || !newFoodEntry.calories) {
      Alert.alert('Missing Information', 'Please enter food name and calories.');
      return;
    }

    const newEntry = {
      id: Date.now().toString(),
      ...newFoodEntry,
      calories: parseInt(newFoodEntry.calories),
      protein: parseInt(newFoodEntry.protein) || 0,
      carbs: parseInt(newFoodEntry.carbs) || 0,
      fat: parseInt(newFoodEntry.fat) || 0,
      quantity: parseFloat(newFoodEntry.quantity) || 1,
    };

    // Update today's macros
    setTodaysMacros(prev => ({
      calories: {
        ...prev.calories,
        consumed: prev.calories.consumed + newEntry.calories,
        percentage: (prev.calories.consumed + newEntry.calories) / prev.calories.target,
      },
      protein: {
        ...prev.protein,
        consumed: prev.protein.consumed + newEntry.protein,
        percentage: (prev.protein.consumed + newEntry.protein) / prev.protein.target,
      },
      carbs: {
        ...prev.carbs,
        consumed: prev.carbs.consumed + newEntry.carbs,
        percentage: (prev.carbs.consumed + newEntry.carbs) / prev.carbs.target,
      },
      fat: {
        ...prev.fat,
        consumed: prev.fat.consumed + newEntry.fat,
        percentage: (prev.fat.consumed + newEntry.fat) / prev.fat.target,
      },
    }));

    // Reset form
    setNewFoodEntry({
      name: '',
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      quantity: '1',
      meal: 'breakfast',
    });

    setShowFoodModal(false);
    Vibration.vibrate(100);
    Alert.alert('Success! 🎉', 'Food entry added successfully');
  };

  const handleQuickAdd = (food) => {
    setTodaysMacros(prev => ({
      calories: {
        ...prev.calories,
        consumed: prev.calories.consumed + food.calories,
        percentage: (prev.calories.consumed + food.calories) / prev.calories.target,
      },
      protein: {
        ...prev.protein,
        consumed: prev.protein.consumed + food.protein,
        percentage: (prev.protein.consumed + food.protein) / prev.protein.target,
      },
      carbs: {
        ...prev.carbs,
        consumed: prev.carbs.consumed + food.carbs,
        percentage: (prev.carbs.consumed + food.carbs) / prev.carbs.target,
      },
      fat: {
        ...prev.fat,
        consumed: prev.fat.consumed + food.fat,
        percentage: (prev.fat.consumed + food.fat) / prev.fat.target,
      },
    }));

    Vibration.vibrate(50);
    Alert.alert('Added! ✅', `${food.name} added to your diary`);
  };

  const renderMacroCard = (macro, value, color) => (
    <Surface style={styles.macroCard} elevation={2}>
      <View style={styles.macroHeader}>
        <Icon name={getMacroIcon(macro)} size={24} color={color} />
        <Text style={[TEXT_STYLES.bodySmall, { textTransform: 'uppercase', letterSpacing: 1 }]}>
          {macro}
        </Text>
      </View>
      
      <Text style={[TEXT_STYLES.h2, { color }]}>
        {Math.round(value.consumed)}
        <Text style={[TEXT_STYLES.bodySmall, { color: COLORS.textSecondary }]}>
          /{value.target}{macro === 'calories' ? '' : 'g'}
        </Text>
      </Text>

      <Animated.View style={styles.progressContainer}>
        <ProgressBar
          progress={progressAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, Math.min(value.percentage, 1)],
          })}
          color={color}
          style={styles.progressBar}
        />
        <Text style={[TEXT_STYLES.caption, { marginTop: SPACING.xs }]}>
          {Math.round(value.percentage * 100)}% of goal
        </Text>
      </Animated.View>
    </Surface>
  );

  const getMacroIcon = (macro) => {
    switch (macro) {
      case 'calories': return 'local-fire-department';
      case 'protein': return 'fitness-center';
      case 'carbs': return 'grain';
      case 'fat': return 'opacity';
      default: return 'circle';
    }
  };

  const renderMealEntry = (meal) => (
    <Card key={meal.id} style={styles.mealCard}>
      <View style={styles.mealHeader}>
        <View style={styles.mealInfo}>
          <Text style={TEXT_STYLES.h3}>{meal.meal}</Text>
          <Text style={TEXT_STYLES.bodySmall}>{meal.time} • {meal.totalCalories} cal</Text>
        </View>
        <IconButton
          icon="add"
          size={20}
          iconColor={COLORS.primary}
          onPress={() => setShowFoodModal(true)}
        />
      </View>

      {meal.foods.map((food, index) => (
        <View key={index} style={styles.foodItem}>
          <View style={styles.foodInfo}>
            <Text style={TEXT_STYLES.body}>{food.name}</Text>
            <Text style={TEXT_STYLES.bodySmall}>
              {food.calories}cal • P:{food.protein}g • C:{food.carbs}g • F:{food.fat}g
            </Text>
          </View>
          <IconButton
            icon="dots-vertical"
            size={16}
            iconColor={COLORS.textSecondary}
            onPress={() => Alert.alert('Food Options', 'Edit or remove this food item')}
          />
        </View>
      ))}
    </Card>
  );

  const renderQuickAddCard = () => (
    <Card style={styles.quickAddCard}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.quickAddGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>Quick Add 🚀</Text>
        <Text style={[TEXT_STYLES.bodySmall, { color: 'rgba(255,255,255,0.8)' }]}>
          Recently used foods
        </Text>
      </LinearGradient>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickAddScroll}>
        {recentFoods.map((food) => (
          <TouchableOpacity
            key={food.id}
            style={styles.quickAddItem}
            onPress={() => handleQuickAdd(food)}
            activeOpacity={0.8}
          >
            <View style={styles.quickAddItemContent}>
              <Text style={TEXT_STYLES.body} numberOfLines={2}>{food.name}</Text>
              <Text style={TEXT_STYLES.bodySmall}>{food.calories} cal</Text>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                {food.lastUsed}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Card>
  );

  const renderWeeklyChart = () => (
    <Card style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <Text style={TEXT_STYLES.h3}>Weekly Progress 📊</Text>
        <Chip mode="outlined" compact>This Week</Chip>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chartContainer}>
          {weeklyProgress.map((day, index) => (
            <View key={index} style={styles.chartBar}>
              <View
                style={[
                  styles.bar,
                  {
                    height: (day.percentage * 120),
                    backgroundColor: day.percentage >= 1 ? COLORS.success : 
                                   day.percentage >= 0.8 ? COLORS.primary : COLORS.warning,
                  }
                ]}
              />
              <Text style={[TEXT_STYLES.caption, { marginTop: SPACING.xs }]}>{day.day}</Text>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                {day.calories}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </Card>
  );

  const renderAddFoodModal = () => (
    <Portal>
      <Modal
        visible={showFoodModal}
        onDismiss={() => setShowFoodModal(false)}
        transparent
        animationType="slide"
      >
        <BlurView style={styles.modalOverlay} blurType="dark" blurAmount={10}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={TEXT_STYLES.h2}>Add Food Entry 🍎</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setShowFoodModal(false)}
              />
            </View>

            <ScrollView style={styles.modalBody}>
              <Searchbar
                placeholder="Search foods..."
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={styles.searchBar}
                iconColor={COLORS.primary}
              />

              <View style={styles.mealSelector}>
                <Text style={TEXT_STYLES.body}>Meal</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {['breakfast', 'lunch', 'dinner', 'snacks'].map((meal) => (
                    <Chip
                      key={meal}
                      selected={newFoodEntry.meal === meal}
                      onPress={() => setNewFoodEntry(prev => ({ ...prev, meal }))}
                      style={styles.mealChip}
                    >
                      {meal.charAt(0).toUpperCase() + meal.slice(1)}
                    </Chip>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.inputContainer}>
                <Text style={TEXT_STYLES.body}>Food Name *</Text>
                <TextInput
                  style={styles.textInput}
                  value={newFoodEntry.name}
                  onChangeText={(text) => setNewFoodEntry(prev => ({ ...prev, name: text }))}
                  placeholder="e.g., Grilled Chicken"
                  placeholderTextColor={COLORS.textSecondary}
                />
              </View>

              <View style={styles.macroInputs}>
                {['calories', 'protein', 'carbs', 'fat'].map((macro) => (
                  <View key={macro} style={styles.macroInputContainer}>
                    <Text style={TEXT_STYLES.bodySmall}>
                      {macro.charAt(0).toUpperCase() + macro.slice(1)}
                      {macro === 'calories' ? ' *' : ' (g)'}
                    </Text>
                    <TextInput
                      style={styles.macroInput}
                      value={newFoodEntry[macro]}
                      onChangeText={(text) => setNewFoodEntry(prev => ({ ...prev, [macro]: text }))}
                      placeholder="0"
                      keyboardType="numeric"
                      placeholderTextColor={COLORS.textSecondary}
                    />
                  </View>
                ))}
              </View>

              <View style={styles.inputContainer}>
                <Text style={TEXT_STYLES.body}>Quantity</Text>
                <TextInput
                  style={styles.textInput}
                  value={newFoodEntry.quantity}
                  onChangeText={(text) => setNewFoodEntry(prev => ({ ...prev, quantity: text }))}
                  placeholder="1"
                  keyboardType="numeric"
                  placeholderTextColor={COLORS.textSecondary}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                mode="outlined"
                onPress={() => setShowFoodModal(false)}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleAddFood}
                style={styles.modalButton}
                buttonColor={COLORS.primary}
              >
                Add Food
              </Button>
            </View>
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
            <Text style={[TEXT_STYLES.h2, { color: 'white' }]}>Macro Tracking</Text>
            <Text style={[TEXT_STYLES.bodySmall, { color: 'rgba(255,255,255,0.8)' }]}>
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
          </View>
          <Avatar.Icon 
            size={40} 
            icon="nutrition" 
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          />
        </View>
      </LinearGradient>

      <Animated.ScrollView
        style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
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
          {['today', 'week', 'goals'].map((tab) => (
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

        {activeTab === 'today' && (
          <>
            {/* Daily Macros Overview */}
            <View style={styles.macrosGrid}>
              {renderMacroCard('calories', todaysMacros.calories, COLORS.accent)}
              {renderMacroCard('protein', todaysMacros.protein, COLORS.primary)}
              {renderMacroCard('carbs', todaysMacros.carbs, COLORS.warning)}
              {renderMacroCard('fat', todaysMacros.fat, COLORS.success)}
            </View>

            {/* Quick Add Section */}
            {renderQuickAddCard()}

            {/* Today's Meals */}
            <View style={styles.sectionHeader}>
              <Text style={TEXT_STYLES.h3}>Today's Meals 🍽️</Text>
              <IconButton
                icon="restaurant-menu"
                size={20}
                iconColor={COLORS.primary}
                onPress={() => setShowMealPlanModal(true)}
              />
            </View>

            {mealEntries.map(renderMealEntry)}

            {/* Add spacing for FAB */}
            <View style={{ height: 80 }} />
          </>
        )}

        {activeTab === 'week' && (
          <>
            {renderWeeklyChart()}
            
            {/* Weekly Summary */}
            <Card style={styles.summaryCard}>
              <Text style={TEXT_STYLES.h3}>Weekly Summary 📈</Text>
              <View style={styles.summaryStats}>
                <View style={styles.statItem}>
                  <Text style={TEXT_STYLES.h2}>6.2</Text>
                  <Text style={TEXT_STYLES.bodySmall}>Avg Daily Score</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={TEXT_STYLES.h2}>14,650</Text>
                  <Text style={TEXT_STYLES.bodySmall}>Total Calories</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={TEXT_STYLES.h2}>5/7</Text>
                  <Text style={TEXT_STYLES.bodySmall}>Goals Met</Text>
                </View>
              </View>
            </Card>
          </>
        )}

        {activeTab === 'goals' && (
          <Card style={styles.placeholderCard}>
            <View style={styles.placeholderContent}>
              <Icon name="flag" size={48} color={COLORS.textSecondary} />
              <Text style={TEXT_STYLES.h3}>Goal Setting</Text>
              <Text style={[TEXT_STYLES.body, { textAlign: 'center', marginTop: SPACING.sm }]}>
                Set personalized macro targets based on your fitness goals
              </Text>
              <Button
                mode="contained"
                onPress={() => Alert.alert('Coming Soon! 🚀', 'Goal setting features are under development')}
                style={{ marginTop: SPACING.lg }}
                buttonColor={COLORS.primary}
              >
                Configure Goals
              </Button>
            </View>
          </Card>
        )}
      </Animated.ScrollView>

      {/* Floating Action Button */}
      {activeTab === 'today' && (
        <FAB
          icon="add"
          style={styles.fab}
          onPress={() => setShowFoodModal(true)}
          color="white"
        />
      )}

      {/* Add Food Modal */}
      {renderAddFoodModal()}
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
  macrosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  macroCard: {
    width: '48%',
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  macroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.xs,
  },
  progressContainer: {
    marginTop: SPACING.sm,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  quickAddCard: {
    marginBottom: SPACING.lg,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
  },
  quickAddGradient: {
    padding: SPACING.md,
  },
  quickAddScroll: {
    padding: SPACING.md,
  },
  quickAddItem: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginRight: SPACING.sm,
    padding: SPACING.sm,
    width: 120,
    elevation: 2,
  },
  quickAddItemContent: {
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  mealCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    overflow: 'hidden',
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.primary + '10',
  },
  mealInfo: {
    flex: 1,
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.textSecondary + '20',
  },
  foodInfo: {
    flex: 1,
  },
  chartCard: {
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    borderRadius: 12,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
  },
  chartBar: {
    alignItems: 'center',
    minWidth: 40,
  },
  bar: {
    width: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
  },
  summaryCard: {
    padding: SPACING.lg,
    borderRadius: 12,
    marginBottom: SPACING.lg,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  placeholderCard: {
    padding: SPACING.xl,
    borderRadius: 16,
    margin: SPACING.md,
  },
  placeholderContent: {
    alignItems: 'center',
    justifyContent: 'center',
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
    maxHeight: height * 0.8,
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
    maxHeight: height * 0.6,
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
  mealSelector: {
    marginBottom: SPACING.lg,
  },
  mealChip: {
    marginRight: SPACING.sm,
    marginTop: SPACING.sm,
  },
  inputContainer: {
    marginBottom: SPACING.lg,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.textSecondary + '30',
    borderRadius: 8,
    padding: SPACING.md,
    marginTop: SPACING.sm,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
  },
  macroInputs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  macroInputContainer: {
    width: '48%',
    marginBottom: SPACING.sm,
  },
  macroInput: {
    borderWidth: 1,
    borderColor: COLORS.textSecondary + '30',
    borderRadius: 8,
    padding: SPACING.sm,
    marginTop: SPACING.xs,
    fontSize: 14,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
    textAlign: 'center',
  },
});

export default MacroTracking;