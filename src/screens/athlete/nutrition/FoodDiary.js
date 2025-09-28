import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  Animated,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Vibration,
  FlatList,
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
  Divider,
  Menu,
  Checkbox,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import design constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f7fa',
  white: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e0e0e0',
  info: '#2196F3',
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
  caption: { fontSize: 14, color: COLORS.textSecondary },
  small: { fontSize: 12, color: COLORS.textSecondary },
};

const { width, height } = Dimensions.get('window');

// Default nutrition goals
const DEFAULT_NUTRITION_GOALS = {
  calories: 2500,
  protein: 150,
  carbs: 250,
  fat: 80,
};

const FoodDiary = ({ navigation }) => {
  const dispatch = useDispatch();
  
  // Handle cases where Redux might not be available
  let user, foodHistory, nutritionGoals;
  try {
    const reduxState = useSelector(state => ({
      user: state?.auth?.user,
      foodHistory: state?.nutrition?.foodHistory,
      nutritionGoals: state?.nutrition?.goals,
    }));
    user = reduxState.user;
    foodHistory = reduxState.foodHistory;
    nutritionGoals = reduxState.nutritionGoals || DEFAULT_NUTRITION_GOALS;
  } catch (error) {
    // Fallback for when Redux is not available
    user = null;
    foodHistory = [];
    nutritionGoals = DEFAULT_NUTRITION_GOALS;
  }

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('day'); // 'day', 'week', 'month'
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [filters, setFilters] = useState({
    mealTypes: { breakfast: true, lunch: true, dinner: true, snacks: true },
    showMacros: true,
    showCalories: true,
  });

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Mock data for demonstration
  const [foodEntries] = useState([
    {
      id: '1',
      date: new Date().toISOString(),
      mealType: 'breakfast',
      time: '07:30 AM',
      foods: [
        { name: '🥣 Steel Cut Oats', quantity: '1 cup', calories: 150, protein: 5, carbs: 27, fat: 3 },
        { name: '🫐 Fresh Blueberries', quantity: '1/2 cup', calories: 42, protein: 0.5, carbs: 11, fat: 0.2 },
        { name: '🥜 Almonds', quantity: '1 oz', calories: 164, protein: 6, carbs: 6, fat: 14 },
        { name: '☕ Black Coffee', quantity: '1 cup', calories: 2, protein: 0.3, carbs: 0, fat: 0 },
      ],
    },
    {
      id: '2',
      date: new Date().toISOString(),
      mealType: 'lunch',
      time: '12:45 PM',
      foods: [
        { name: '🍗 Grilled Chicken Breast', quantity: '6 oz', calories: 231, protein: 43.5, carbs: 0, fat: 5 },
        { name: '🥗 Mixed Green Salad', quantity: '2 cups', calories: 20, protein: 2, carbs: 4, fat: 0.2 },
        { name: '🥑 Avocado', quantity: '1/2 medium', calories: 160, protein: 2, carbs: 8.5, fat: 14.7 },
        { name: '🫒 Olive Oil Dressing', quantity: '1 tbsp', calories: 119, protein: 0, carbs: 0, fat: 13.5 },
        { name: '💧 Water', quantity: '16 oz', calories: 0, protein: 0, carbs: 0, fat: 0 },
      ],
    },
    {
      id: '3',
      date: new Date().toISOString(),
      mealType: 'snacks',
      time: '03:20 PM',
      foods: [
        { name: '🥛 Protein Shake', quantity: '1 scoop', calories: 120, protein: 24, carbs: 3, fat: 1 },
        { name: '🍌 Banana', quantity: '1 medium', calories: 105, protein: 1.3, carbs: 27, fat: 0.3 },
      ],
    },
    {
      id: '4',
      date: new Date().toISOString(),
      mealType: 'dinner',
      time: '07:15 PM',
      foods: [
        { name: '🐟 Baked Salmon', quantity: '5 oz', calories: 367, protein: 39, carbs: 0, fat: 22 },
        { name: '🍠 Sweet Potato', quantity: '1 medium', calories: 112, protein: 2, carbs: 26, fat: 0.1 },
        { name: '🥦 Steamed Broccoli', quantity: '1 cup', calories: 31, protein: 3, carbs: 6, fat: 0.4 },
        { name: '🧈 Grass-fed Butter', quantity: '1 tsp', calories: 34, protein: 0, carbs: 0, fat: 4 },
      ],
    },
  ]);

  const [weeklyTrends] = useState([
    { day: 'Mon', calories: 2150, protein: 145, carbs: 220, fat: 85 },
    { day: 'Tue', calories: 2380, protein: 165, carbs: 245, fat: 92 },
    { day: 'Wed', calories: 2250, protein: 152, carbs: 235, fat: 88 },
    { day: 'Thu', calories: 2420, protein: 168, carbs: 250, fat: 95 },
    { day: 'Fri', calories: 2180, protein: 148, carbs: 225, fat: 86 },
    { day: 'Sat', calories: 2350, protein: 160, carbs: 240, fat: 90 },
    { day: 'Sun', calories: 2300, protein: 155, carbs: 238, fat: 89 },
  ]);

  // Animations
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
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, scaleAnim]);

  // Handlers
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('🔄 Refreshed!', 'Your food diary has been updated with the latest data.');
    }, 2000);
  }, []);

  const handleDateChange = (direction) => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setSelectedDate(newDate);
    
    // Safe vibration check
    if (Vibration && typeof Vibration.vibrate === 'function') {
      Vibration.vibrate(50);
    }
  };

  const handleAddMeal = (mealType) => {
    setSelectedMealType(mealType);
    setShowAddMealModal(true);
    
    // Safe vibration check
    if (Vibration && typeof Vibration.vibrate === 'function') {
      Vibration.vibrate(50);
    }
  };

  const handleDeleteEntry = (entryId) => {
    Alert.alert(
      '🗑️ Delete Entry',
      'Are you sure you want to delete this meal entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('✅ Deleted!', 'Meal entry has been removed from your diary.');
            if (Vibration && typeof Vibration.vibrate === 'function') {
              Vibration.vibrate(100);
            }
          },
        },
      ]
    );
  };

  const handleDuplicateEntry = (entry) => {
    Alert.alert('📋 Entry Duplicated!', 'Meal has been copied to your clipboard for easy re-entry.');
    if (Vibration && typeof Vibration.vibrate === 'function') {
      Vibration.vibrate(50);
    }
  };

  const toggleFilter = (filterType, value) => {
    if (filterType === 'mealTypes') {
      setFilters(prev => ({
        ...prev,
        mealTypes: { ...prev.mealTypes, [value]: !prev.mealTypes[value] }
      }));
    } else {
      setFilters(prev => ({ ...prev, [filterType]: !prev[filterType] }));
    }
  };

  // Calculate daily totals - memoized for performance
  const calculateDailyTotals = useCallback(() => {
    return foodEntries.reduce((totals, entry) => {
      const entryTotals = entry.foods.reduce((sum, food) => ({
        calories: sum.calories + food.calories,
        protein: sum.protein + food.protein,
        carbs: sum.carbs + food.carbs,
        fat: sum.fat + food.fat,
      }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

      return {
        calories: totals.calories + entryTotals.calories,
        protein: totals.protein + entryTotals.protein,
        carbs: totals.carbs + entryTotals.carbs,
        fat: totals.fat + entryTotals.fat,
      };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  }, [foodEntries]);

  const dailyTotals = calculateDailyTotals();

  // Get meal type icon and color
  const getMealTypeInfo = (mealType) => {
    const info = {
      breakfast: { icon: '🌅', color: COLORS.warning, label: 'Breakfast' },
      lunch: { icon: '☀️', color: COLORS.info, label: 'Lunch' },
      dinner: { icon: '🌙', color: COLORS.secondary, label: 'Dinner' },
      snacks: { icon: '🍿', color: COLORS.success, label: 'Snacks' },
    };
    return info[mealType] || info.breakfast;
  };

  // Meal types array for quick add buttons
  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];

  // Render food entry item
  const renderFoodEntry = ({ item, index }) => {
    const mealInfo = getMealTypeInfo(item.mealType);
    const mealTotals = item.foods.reduce((sum, food) => ({
      calories: sum.calories + food.calories,
      protein: sum.protein + food.protein,
      carbs: sum.carbs + food.carbs,
      fat: sum.fat + food.fat,
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    return (
      <Animated.View
        style={[
          styles.entryCard,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        <Card style={[styles.mealCard, { borderLeftColor: mealInfo.color }]}>
          <View style={styles.mealHeader}>
            <View style={styles.mealTitleContainer}>
              <Text style={styles.mealIcon}>{mealInfo.icon}</Text>
              <View>
                <Text style={styles.mealTitle}>{mealInfo.label}</Text>
                <Text style={styles.mealTime}>{item.time}</Text>
              </View>
            </View>
            <View style={styles.mealActions}>
              <IconButton
                icon="content-copy"
                size={20}
                iconColor={COLORS.info}
                onPress={() => handleDuplicateEntry(item)}
              />
              <IconButton
                icon="edit"
                size={20}
                iconColor={COLORS.warning}
                onPress={() => Alert.alert('⚡ Feature Coming Soon', 'Edit meal functionality will be available in the next update!')}
              />
              <IconButton
                icon="delete"
                size={20}
                iconColor={COLORS.error}
                onPress={() => handleDeleteEntry(item.id)}
              />
            </View>
          </View>

          {/* Meal Totals */}
          <Surface style={styles.mealTotalsCard}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>📊 Meal Totals:</Text>
              <Text style={[styles.totalValue, { color: mealInfo.color }]}>
                {Math.round(mealTotals.calories)} cal
              </Text>
            </View>
            {filters.showMacros && (
              <View style={styles.macrosRow}>
                <View style={styles.macroItem}>
                  <Text style={styles.macroLabel}>P</Text>
                  <Text style={styles.macroValue}>{Math.round(mealTotals.protein)}g</Text>
                </View>
                <View style={styles.macroItem}>
                  <Text style={styles.macroLabel}>C</Text>
                  <Text style={styles.macroValue}>{Math.round(mealTotals.carbs)}g</Text>
                </View>
                <View style={styles.macroItem}>
                  <Text style={styles.macroLabel}>F</Text>
                  <Text style={styles.macroValue}>{Math.round(mealTotals.fat)}g</Text>
                </View>
              </View>
            )}
          </Surface>

          {/* Food Items */}
          <View style={styles.foodList}>
            {item.foods.map((food, foodIndex) => (
              <View key={foodIndex} style={styles.foodItem}>
                <View style={styles.foodInfo}>
                  <Text style={styles.foodName}>{food.name}</Text>
                  <Text style={styles.foodQuantity}>{food.quantity}</Text>
                </View>
                <View style={styles.foodNutrition}>
                  {filters.showCalories && (
                    <Text style={styles.foodCalories}>{food.calories} cal</Text>
                  )}
                  {filters.showMacros && (
                    <Text style={styles.foodMacros}>
                      P:{Math.round(food.protein)} C:{Math.round(food.carbs)} F:{Math.round(food.fat)}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </Card>
      </Animated.View>
    );
  };

  // Render weekly trend item
  const renderTrendItem = ({ item, index }) => (
    <View style={styles.trendItem}>
      <Text style={styles.trendDay}>{item.day}</Text>
      <View style={styles.trendBars}>
        <View style={[styles.trendBar, { height: (item.calories / 2500) * 40, backgroundColor: COLORS.primary }]} />
        <View style={[styles.trendBar, { height: (item.protein / 200) * 40, backgroundColor: COLORS.success }]} />
        <View style={[styles.trendBar, { height: (item.carbs / 300) * 40, backgroundColor: COLORS.warning }]} />
        <View style={[styles.trendBar, { height: (item.fat / 100) * 40, backgroundColor: COLORS.error }]} />
      </View>
      <Text style={styles.trendCalories}>{item.calories}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <Animated.View
          style={[
            styles.headerContent,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>📖 Food Diary</Text>
              <Text style={styles.headerSubtitle}>Track your nutrition journey</Text>
            </View>
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  size={24}
                  iconColor={COLORS.white}
                  onPress={() => setMenuVisible(true)}
                />
              }
            >
              <Menu.Item onPress={() => setShowFilterModal(true)} title="🔍 Filters" />
              <Menu.Item onPress={() => Alert.alert('📊 Export', 'Export functionality coming soon!')} title="📤 Export" />
              <Menu.Item onPress={() => Alert.alert('⚙️ Settings', 'Diary settings coming soon!')} title="⚙️ Settings" />
            </Menu>
          </View>

          {/* Date Navigator */}
          <Surface style={styles.dateNavigator}>
            <IconButton
              icon="chevron-left"
              size={24}
              iconColor={COLORS.primary}
              onPress={() => handleDateChange('prev')}
            />
            <TouchableOpacity style={styles.dateSelector}>
              <Text style={styles.dateText}>
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </Text>
              <Text style={styles.dateYear}>{selectedDate.getFullYear()}</Text>
            </TouchableOpacity>
            <IconButton
              icon="chevron-right"
              size={24}
              iconColor={COLORS.primary}
              onPress={() => handleDateChange('next')}
            />
          </Surface>

          {/* Daily Summary */}
          <Surface style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>🎯 Daily Summary</Text>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{Math.round(dailyTotals.calories)}</Text>
                <Text style={styles.summaryLabel}>Calories</Text>
                <ProgressBar progress={dailyTotals.calories / nutritionGoals.calories} color={COLORS.primary} style={styles.summaryProgress} />
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: COLORS.success }]}>{Math.round(dailyTotals.protein)}</Text>
                <Text style={styles.summaryLabel}>Protein (g)</Text>
                <ProgressBar progress={dailyTotals.protein / nutritionGoals.protein} color={COLORS.success} style={styles.summaryProgress} />
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: COLORS.warning }]}>{Math.round(dailyTotals.carbs)}</Text>
                <Text style={styles.summaryLabel}>Carbs (g)</Text>
                <ProgressBar progress={dailyTotals.carbs / nutritionGoals.carbs} color={COLORS.warning} style={styles.summaryProgress} />
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: COLORS.error }]}>{Math.round(dailyTotals.fat)}</Text>
                <Text style={styles.summaryLabel}>Fat (g)</Text>
                <ProgressBar progress={dailyTotals.fat / nutritionGoals.fat} color={COLORS.error} style={styles.summaryProgress} />
              </View>
            </View>
          </Surface>
        </Animated.View>
      </LinearGradient>

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* View Mode Tabs */}
        <View style={styles.tabsContainer}>
          <View style={styles.tabs}>
            {['day', 'week', 'month'].map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[styles.tab, viewMode === mode && styles.activeTab]}
                onPress={() => setViewMode(mode)}
              >
                <Text style={[styles.tabText, viewMode === mode && styles.activeTabText]}>
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Day View */}
        {viewMode === 'day' && (
          <View style={styles.dayView}>
            <FlatList
              data={foodEntries.filter(entry => filters.mealTypes[entry.mealType])}
              renderItem={renderFoodEntry}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.entriesList}
            />

            {/* Quick Add Buttons */}
            <Surface style={styles.quickAddCard}>
              <Text style={styles.quickAddTitle}>⚡ Quick Add Meal</Text>
              <View style={styles.quickAddButtons}>
                {mealTypes.map((mealType) => {
                  const info = getMealTypeInfo(mealType);
                  return (
                    <TouchableOpacity
                      key={mealType}
                      style={[styles.quickAddButton, { backgroundColor: `${info.color}15` }]}
                      onPress={() => handleAddMeal(mealType)}
                    >
                      <Text style={styles.quickAddIcon}>{info.icon}</Text>
                      <Text style={[styles.quickAddLabel, { color: info.color }]}>{info.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Surface>
          </View>
        )}

        {/* Week View */}
        {viewMode === 'week' && (
          <View style={styles.weekView}>
            <Text style={styles.sectionTitle}>📈 Weekly Trends</Text>
            <Surface style={styles.trendsCard}>
              <FlatList
                data={weeklyTrends}
                renderItem={renderTrendItem}
                keyExtractor={(item) => item.day}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.trendsList}
              />
              <View style={styles.trendsLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: COLORS.primary }]} />
                  <Text style={styles.legendText}>Calories</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: COLORS.success }]} />
                  <Text style={styles.legendText}>Protein</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: COLORS.warning }]} />
                  <Text style={styles.legendText}>Carbs</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: COLORS.error }]} />
                  <Text style={styles.legendText}>Fat</Text>
                </View>
              </View>
            </Surface>
          </View>
        )}

        {/* Month View */}
        {viewMode === 'month' && (
          <View style={styles.monthView}>
            <Text style={styles.sectionTitle}>📅 Monthly Overview</Text>
            <Surface style={styles.monthCard}>
              <Text style={styles.comingSoonText}>📊 Monthly analytics coming soon!</Text>
              <Text style={styles.comingSoonSubtext}>
                Get detailed insights into your nutrition patterns over time.
              </Text>
            </Surface>
          </View>
        )}
      </ScrollView>

      {/* Filter Modal */}
      <Portal>
        <Modal
          visible={showFilterModal}
          onDismiss={() => setShowFilterModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Surface style={styles.filterModal}>
            <Text style={styles.modalTitle}>🔍 Diary Filters</Text>

            <Text style={styles.filterSectionTitle}>Meal Types</Text>
            {Object.entries(filters.mealTypes).map(([mealType, isEnabled]) => {
              const info = getMealTypeInfo(mealType);
              return (
                <View key={mealType} style={styles.filterItem}>
                  <View style={styles.filterLabel}>
                    <Text style={styles.filterIcon}>{info.icon}</Text>
                    <Text style={styles.filterText}>{info.label}</Text>
                  </View>
                  <Checkbox
                    status={isEnabled ? 'checked' : 'unchecked'}
                    onPress={() => toggleFilter('mealTypes', mealType)}
                    color={COLORS.primary}
                  />
                </View>
              );
            })}

            <Divider style={styles.filterDivider} />

            <Text style={styles.filterSectionTitle}>Display Options</Text>
            <View style={styles.filterItem}>
              <Text style={styles.filterText}>Show Macros</Text>
              <Checkbox
                status={filters.showMacros ? 'checked' : 'unchecked'}
                onPress={() => toggleFilter('showMacros')}
                color={COLORS.primary}
              />
            </View>
            <View style={styles.filterItem}>
              <Text style={styles.filterText}>Show Calories</Text>
              <Checkbox
                status={filters.showCalories ? 'checked' : 'unchecked'}
                onPress={() => toggleFilter('showCalories')}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.filterActions}>
              <Button
                mode="outlined"
                onPress={() => setShowFilterModal(false)}
                style={styles.filterButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={() => {
                  setShowFilterModal(false);
                  Alert.alert('✅ Filters Applied!', 'Your diary view has been updated.');
                }}
                style={styles.filterButton}
                buttonColor={COLORS.primary}
              >
                Apply Filters
              </Button>
            </View>
          </Surface>
        </Modal>
      </Portal>

      {/* Add Meal Modal */}
      <Portal>
        <Modal
          visible={showAddMealModal}
          onDismiss={() => setShowAddMealModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Surface style={styles.addMealModal}>
            <Text style={styles.modalTitle}>
              Add {selectedMealType ? getMealTypeInfo(selectedMealType).label : 'Meal'}
            </Text>
            <Text style={styles.modalSubtitle}>
              Choose from recent foods or search for new items
            </Text>
            
            <Searchbar
              placeholder="Search foods..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
            />

            <View style={styles.addMealContent}>
              <Text style={styles.comingSoonText}>🍽️ Food database coming soon!</Text>
              <Text style={styles.comingSoonSubtext}>
                Advanced food logging with barcode scanning and nutritional analysis.
              </Text>
            </View>

            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => setShowAddMealModal(false)}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={() => {
                  setShowAddMealModal(false);
                  Alert.alert('⚡ Feature Coming Soon', 'Advanced meal logging will be available in the next update!');
                }}
                style={styles.modalButton}
                buttonColor={COLORS.primary}
              >
                Add Food
              </Button>
            </View>
          </Surface>
        </Modal>
      </Portal>

      {/* FAB for quick add */}
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => setShowAddMealModal(true)}
        color={COLORS.white}
      />
    </View>
  );
};

// Comprehensive StyleSheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TEXT_STYLES.caption,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: SPACING.xs,
  },
  dateNavigator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: SPACING.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dateSelector: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  dateText: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    fontWeight: '600',
  },
  dateYear: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.md,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  summaryTitle: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  summaryValue: {
    ...TEXT_STYLES.h2,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  summaryLabel: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  summaryProgress: {
    width: '100%',
    height: 6,
    marginTop: SPACING.xs,
    borderRadius: 3,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  tabsContainer: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.xs,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.white,
  },
  dayView: {
    flex: 1,
  },
  entriesList: {
    padding: SPACING.md,
  },
  entryCard: {
    marginBottom: SPACING.md,
  },
  mealCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.md,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    borderLeftWidth: 4,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  mealTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealIcon: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  mealTitle: {
    ...TEXT_STYLES.h3,
    fontWeight: '600',
  },
  mealTime: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
  },
  mealActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealTotalsCard: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  totalLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '500',
  },
  totalValue: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  macroItem: {
    alignItems: 'center',
  },
  macroLabel: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
  },
  macroValue: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  foodList: {
    gap: SPACING.sm,
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    ...TEXT_STYLES.body,
    fontWeight: '500',
  },
  foodQuantity: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
  },
  foodNutrition: {
    alignItems: 'flex-end',
  },
  foodCalories: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.primary,
  },
  foodMacros: {
    ...TEXT_STYLES.small,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  quickAddCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.md,
    margin: SPACING.md,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  quickAddTitle: {
    ...TEXT_STYLES.h3,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  quickAddButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAddButton: {
    width: '48%',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.sm,
  },
  quickAddIcon: {
    fontSize: 28,
    marginBottom: SPACING.xs,
  },
  quickAddLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '500',
  },
  weekView: {
    padding: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.h2,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  trendsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.md,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  trendsList: {
    paddingHorizontal: SPACING.sm,
  },
  trendItem: {
    alignItems: 'center',
    marginHorizontal: SPACING.sm,
    width: 60,
  },
  trendDay: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  trendBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 50,
    marginBottom: SPACING.xs,
    gap: 2,
  },
  trendBar: {
    width: 8,
    borderRadius: 4,
    minHeight: 4,
  },
  trendCalories: {
    ...TEXT_STYLES.small,
    fontWeight: '500',
    color: COLORS.primary,
  },
  trendsLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.xs,
  },
  legendText: {
    ...TEXT_STYLES.small,
  },
  monthView: {
    padding: SPACING.md,
  },
  monthCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.xl,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  comingSoonText: {
    ...TEXT_STYLES.h3,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  comingSoonSubtext: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    color: COLORS.textSecondary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  filterModal: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.lg,
    width: width * 0.9,
    maxHeight: height * 0.8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  addMealModal: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.lg,
    width: width * 0.9,
    maxHeight: height * 0.7,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  modalTitle: {
    ...TEXT_STYLES.h2,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  modalSubtitle: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  filterSectionTitle: {
    ...TEXT_STYLES.h3,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  filterItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  filterLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  filterIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  filterText: {
    ...TEXT_STYLES.body,
  },
  filterDivider: {
    marginVertical: SPACING.md,
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  filterButton: {
    flex: 1,
  },
  searchBar: {
    backgroundColor: COLORS.background,
    marginBottom: SPACING.md,
  },
  addMealContent: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  modalButton: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default FoodDiary;