import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  StatusBar,
  Alert,
  RefreshControl,
  Animated,
  Dimensions,
  TouchableOpacity,
  Vibration,
  FlatList
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
  TextInput,
  Searchbar,
  Portal,
  Modal,
  RadioButton,
  Divider,
  Badge
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Design System Constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f7fa',
  surface: '#ffffff',
  text: '#2c3e50',
  textSecondary: '#7f8c8d',
  accent: '#e74c3c'
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold' },
  h2: { fontSize: 24, fontWeight: '600' },
  h3: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16 },
  caption: { fontSize: 12 },
  button: { fontSize: 16, fontWeight: '600' }
};

const { width, height } = Dimensions.get('window');

const FoodDiary = ({ navigation }) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('diary');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedClient, setSelectedClient] = useState(null);
  const [showAddFoodModal, setShowAddFoodModal] = useState(false);
  const [showNutritionModal, setShowNutritionModal] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);

  // Search and food state
  const [searchQuery, setSearchQuery] = useState('');
  const [foodSearchQuery, setFoodSearchQuery] = useState('');
  const [selectedMeal, setSelectedMeal] = useState('breakfast');
  const [quantity, setQuantity] = useState('100');

  // Redux state
  const dispatch = useDispatch();
  const { user, clients } = useSelector(state => state.auth || {});

  // Sample food database
  const [foodDatabase] = useState([
    { id: 1, name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fats: 3.6, category: 'protein', emoji: '🐔' },
    { id: 2, name: 'Brown Rice', calories: 111, protein: 2.6, carbs: 23, fats: 0.9, category: 'carbs', emoji: '🍚' },
    { id: 3, name: 'Avocado', calories: 160, protein: 2, carbs: 9, fats: 14.7, category: 'fats', emoji: '🥑' },
    { id: 4, name: 'Greek Yogurt', calories: 59, protein: 10, carbs: 3.6, fats: 0.4, category: 'protein', emoji: '🥛' },
    { id: 5, name: 'Banana', calories: 89, protein: 1.1, carbs: 23, fats: 0.3, category: 'carbs', emoji: '🍌' },
    { id: 6, name: 'Almonds', calories: 579, protein: 21, carbs: 22, fats: 50, category: 'fats', emoji: '🌰' },
    { id: 7, name: 'Sweet Potato', calories: 86, protein: 1.6, carbs: 20, fats: 0.1, category: 'carbs', emoji: '🍠' },
    { id: 8, name: 'Salmon', calories: 208, protein: 20, carbs: 0, fats: 12, category: 'protein', emoji: '🐟' },
    { id: 9, name: 'Spinach', calories: 23, protein: 2.9, carbs: 3.6, fats: 0.4, category: 'vegetable', emoji: '🥬' },
    { id: 10, name: 'Quinoa', calories: 120, protein: 4.4, carbs: 22, fats: 1.9, category: 'carbs', emoji: '🌾' }
  ]);

  // Sample diary data
  const [diaryData, setDiaryData] = useState({
    breakfast: [
      { id: 1, food: foodDatabase[3], quantity: 200, timestamp: new Date() },
      { id: 2, food: foodDatabase[4], quantity: 150, timestamp: new Date() }
    ],
    lunch: [
      { id: 3, food: foodDatabase[0], quantity: 150, timestamp: new Date() },
      { id: 4, food: foodDatabase[1], quantity: 200, timestamp: new Date() }
    ],
    dinner: [
      { id: 5, food: foodDatabase[7], quantity: 180, timestamp: new Date() }
    ],
    snacks: [
      { id: 6, food: foodDatabase[5], quantity: 30, timestamp: new Date() }
    ]
  });

  const mealTypes = {
    breakfast: { icon: 'free-breakfast', color: COLORS.warning, emoji: '🌅' },
    lunch: { icon: 'restaurant', color: COLORS.success, emoji: '☀️' },
    dinner: { icon: 'dinner-dining', color: COLORS.primary, emoji: '🌙' },
    snacks: { icon: 'cookie', color: COLORS.accent, emoji: '🍪' }
  };

  // Animation setup
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
      })
    ]).start();
  }, []);

  // Calculate daily totals
  const calculateDailyTotals = useCallback(() => {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFats = 0;

    Object.values(diaryData).forEach(meal => {
      meal.forEach(entry => {
        const multiplier = entry.quantity / 100;
        totalCalories += entry.food.calories * multiplier;
        totalProtein += entry.food.protein * multiplier;
        totalCarbs += entry.food.carbs * multiplier;
        totalFats += entry.food.fats * multiplier;
      });
    });

    return {
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein),
      carbs: Math.round(totalCarbs),
      fats: Math.round(totalFats)
    };
  }, [diaryData]);

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  // Add food to diary
  const addFoodToDiary = useCallback(() => {
    if (!selectedFood || !quantity) {
      Alert.alert('Missing Information', 'Please select food and enter quantity');
      return;
    }

    const newEntry = {
      id: Date.now(),
      food: selectedFood,
      quantity: parseFloat(quantity),
      timestamp: new Date()
    };

    setDiaryData(prev => ({
      ...prev,
      [selectedMeal]: [...prev[selectedMeal], newEntry]
    }));

    setShowAddFoodModal(false);
    setSelectedFood(null);
    setQuantity('100');
    setFoodSearchQuery('');
    
    Vibration.vibrate(50);
    Alert.alert('Added! 🎉', `${selectedFood.name} added to ${selectedMeal}`);
  }, [selectedFood, quantity, selectedMeal]);

  // Remove food from diary
  const removeFoodFromDiary = useCallback((mealType, entryId) => {
    Alert.alert(
      'Remove Food?',
      'Are you sure you want to remove this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setDiaryData(prev => ({
              ...prev,
              [mealType]: prev[mealType].filter(entry => entry.id !== entryId)
            }));
            Vibration.vibrate(100);
          }
        }
      ]
    );
  }, []);

  // Filter food database
  const filteredFoods = foodDatabase.filter(food =>
    food.name.toLowerCase().includes(foodSearchQuery.toLowerCase())
  );

  // Filter clients
  const filteredClients = clients?.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.header}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.headerContent}>
        <IconButton
          icon="arrow-back"
          iconColor="white"
          size={24}
          onPress={() => navigation.goBack()}
        />
        <View style={styles.headerTextContainer}>
          <Text style={[TEXT_STYLES.h2, styles.headerTitle]}>
            📖 Food Diary
          </Text>
          <Text style={styles.headerSubtitle}>
            Track daily nutrition for your clients
          </Text>
        </View>
        <Avatar.Icon size={40} icon="book-open" style={styles.headerAvatar} />
      </View>
    </LinearGradient>
  );

  const renderTabSelector = () => (
    <Surface style={styles.tabContainer} elevation={2}>
      <View style={styles.tabRow}>
        {['diary', 'analytics', 'goals'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && styles.activeTab
            ]}
            onPress={() => {
              setActiveTab(tab);
              Vibration.vibrate(30);
            }}
          >
            <Icon
              name={tab === 'diary' ? 'book' : tab === 'analytics' ? 'analytics' : 'flag'}
              size={20}
              color={activeTab === tab ? COLORS.primary : COLORS.textSecondary}
            />
            <Text style={[
              styles.tabText,
              activeTab === tab && styles.activeTabText
            ]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </Surface>
  );

  const renderClientSelector = () => (
    <View style={styles.clientSection}>
      <Searchbar
        placeholder="Search clients..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
        iconColor={COLORS.primary}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.clientScroll}>
        {filteredClients.map((client) => (
          <TouchableOpacity
            key={client.id}
            style={[
              styles.clientCard,
              selectedClient?.id === client.id && styles.selectedClientCard
            ]}
            onPress={() => setSelectedClient(client)}
          >
            <Avatar.Text
              size={50}
              label={client.name.charAt(0)}
              style={styles.clientAvatar}
            />
            <Text style={styles.clientName}>{client.name}</Text>
            <Text style={styles.clientAge}>{client.age}y</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderNutritionSummary = () => {
    const totals = calculateDailyTotals();
    const targetCalories = 2200; // This would come from user's profile/goals
    const targetProtein = 150;
    const targetCarbs = 250;
    const targetFats = 80;

    return (
      <Animated.View style={[
        styles.summaryContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }
      ]}>
        <Card style={styles.summaryCard} elevation={4}>
          <Card.Content>
            <View style={styles.summaryHeader}>
              <Text style={[TEXT_STYLES.h3, styles.summaryTitle]}>
                📊 Daily Summary
              </Text>
              <TouchableOpacity
                style={styles.dateSelector}
                onPress={() => {
                  Alert.alert('Date Picker', 'Feature Coming Soon! 📅');
                }}
              >
                <Text style={styles.dateText}>
                  {selectedDate.toDateString()}
                </Text>
                <Icon name="calendar-today" size={16} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.caloriesSection}>
              <Text style={styles.caloriesLabel}>Calories</Text>
              <View style={styles.caloriesRow}>
                <Text style={styles.caloriesValue}>{totals.calories}</Text>
                <Text style={styles.caloriesTarget}>/ {targetCalories}</Text>
              </View>
              <ProgressBar
                progress={Math.min(totals.calories / targetCalories, 1)}
                color={totals.calories > targetCalories ? COLORS.warning : COLORS.success}
                style={styles.caloriesProgress}
              />
            </View>

            <View style={styles.macrosRow}>
              {[
                { name: 'Protein', current: totals.protein, target: targetProtein, color: COLORS.error, unit: 'g' },
                { name: 'Carbs', current: totals.carbs, target: targetCarbs, color: COLORS.warning, unit: 'g' },
                { name: 'Fats', current: totals.fats, target: targetFats, color: COLORS.success, unit: 'g' }
              ].map((macro) => (
                <View key={macro.name} style={styles.macroItem}>
                  <Text style={styles.macroName}>{macro.name}</Text>
                  <Text style={styles.macroValue}>
                    {macro.current}<Text style={styles.macroUnit}>/{macro.target}{macro.unit}</Text>
                  </Text>
                  <ProgressBar
                    progress={Math.min(macro.current / macro.target, 1)}
                    color={macro.color}
                    style={styles.macroProgress}
                  />
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>
      </Animated.View>
    );
  };

  const renderMealSection = (mealType, entries) => (
    <Animated.View
      key={mealType}
      style={[
        styles.mealSection,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <Card style={styles.mealCard} elevation={3}>
        <Card.Content>
          <View style={styles.mealHeader}>
            <View style={styles.mealTitleRow}>
              <View style={[styles.mealIcon, { backgroundColor: mealTypes[mealType].color + '20' }]}>
                <Text style={styles.mealEmoji}>{mealTypes[mealType].emoji}</Text>
              </View>
              <View style={styles.mealInfo}>
                <Text style={[TEXT_STYLES.h3, styles.mealTitle]}>
                  {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                </Text>
                <Text style={styles.mealCount}>
                  {entries.length} item{entries.length !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>
            <IconButton
              icon="add"
              iconColor={mealTypes[mealType].color}
              size={24}
              onPress={() => {
                setSelectedMeal(mealType);
                setShowAddFoodModal(true);
              }}
              style={[styles.addButton, { backgroundColor: mealTypes[mealType].color + '20' }]}
            />
          </View>

          {entries.length > 0 ? (
            entries.map((entry) => (
              <View key={entry.id} style={styles.foodEntry}>
                <TouchableOpacity
                  style={styles.foodInfo}
                  onPress={() => {
                    setSelectedFood(entry.food);
                    setShowNutritionModal(true);
                  }}
                >
                  <Text style={styles.foodEmoji}>{entry.food.emoji}</Text>
                  <View style={styles.foodDetails}>
                    <Text style={styles.foodName}>{entry.food.name}</Text>
                    <Text style={styles.foodQuantity}>
                      {entry.quantity}g • {Math.round(entry.food.calories * entry.quantity / 100)} cal
                    </Text>
                  </View>
                </TouchableOpacity>
                <IconButton
                  icon="delete"
                  iconColor={COLORS.error}
                  size={20}
                  onPress={() => removeFoodFromDiary(mealType, entry.id)}
                />
              </View>
            ))
          ) : (
            <View style={styles.emptyMeal}>
              <Icon name="restaurant" size={40} color={COLORS.textSecondary} />
              <Text style={styles.emptyMealText}>No food added yet</Text>
            </View>
          )}
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderAddFoodModal = () => (
    <Portal>
      <Modal
        visible={showAddFoodModal}
        onDismiss={() => setShowAddFoodModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Card style={styles.addFoodCard} elevation={8}>
          <Card.Content>
            <View style={styles.modalHeader}>
              <Text style={[TEXT_STYLES.h3, styles.modalTitle]}>
                🍽️ Add Food to {selectedMeal}
              </Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setShowAddFoodModal(false)}
              />
            </View>

            <Searchbar
              placeholder="Search for food..."
              onChangeText={setFoodSearchQuery}
              value={foodSearchQuery}
              style={styles.foodSearchbar}
              iconColor={COLORS.primary}
            />

            <ScrollView style={styles.foodList} showsVerticalScrollIndicator={false}>
              {filteredFoods.map((food) => (
                <TouchableOpacity
                  key={food.id}
                  style={[
                    styles.foodOption,
                    selectedFood?.id === food.id && styles.selectedFoodOption
                  ]}
                  onPress={() => setSelectedFood(food)}
                >
                  <Text style={styles.foodOptionEmoji}>{food.emoji}</Text>
                  <View style={styles.foodOptionInfo}>
                    <Text style={styles.foodOptionName}>{food.name}</Text>
                    <Text style={styles.foodOptionNutrition}>
                      {food.calories} cal • P: {food.protein}g • C: {food.carbs}g • F: {food.fats}g
                    </Text>
                  </View>
                  <Chip
                    style={[styles.categoryChip, { backgroundColor: COLORS[food.category] || COLORS.textSecondary + '20' }]}
                    textStyle={styles.categoryChipText}
                  >
                    {food.category}
                  </Chip>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {selectedFood && (
              <View style={styles.quantitySection}>
                <TextInput
                  label="Quantity (grams)"
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="numeric"
                  mode="outlined"
                  left={<TextInput.Icon icon="scale" />}
                  style={styles.quantityInput}
                />
                <Text style={styles.previewNutrition}>
                  Preview: {Math.round(selectedFood.calories * quantity / 100)} calories
                </Text>
              </View>
            )}

            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => setShowAddFoodModal(false)}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={addFoodToDiary}
                disabled={!selectedFood || !quantity}
                style={styles.modalButton}
                icon="plus"
              >
                Add Food
              </Button>
            </View>
          </Card.Content>
        </Card>
      </Modal>
    </Portal>
  );

  const renderNutritionModal = () => (
    <Portal>
      <Modal
        visible={showNutritionModal}
        onDismiss={() => setShowNutritionModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        {selectedFood && (
          <Card style={styles.nutritionCard} elevation={8}>
            <Card.Content>
              <View style={styles.nutritionHeader}>
                <Text style={styles.nutritionEmoji}>{selectedFood.emoji}</Text>
                <View style={styles.nutritionInfo}>
                  <Text style={[TEXT_STYLES.h3, styles.nutritionTitle]}>
                    {selectedFood.name}
                  </Text>
                  <Text style={styles.nutritionSubtitle}>
                    Per 100g serving
                  </Text>
                </View>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => setShowNutritionModal(false)}
                />
              </View>

              <View style={styles.nutritionGrid}>
                <Surface style={styles.nutritionItem} elevation={2}>
                  <Text style={styles.nutritionLabel}>Calories</Text>
                  <Text style={[styles.nutritionValue, { color: COLORS.primary }]}>
                    {selectedFood.calories}
                  </Text>
                  <Text style={styles.nutritionUnit}>kcal</Text>
                </Surface>

                <Surface style={styles.nutritionItem} elevation={2}>
                  <Text style={styles.nutritionLabel}>Protein</Text>
                  <Text style={[styles.nutritionValue, { color: COLORS.error }]}>
                    {selectedFood.protein}
                  </Text>
                  <Text style={styles.nutritionUnit}>g</Text>
                </Surface>

                <Surface style={styles.nutritionItem} elevation={2}>
                  <Text style={styles.nutritionLabel}>Carbs</Text>
                  <Text style={[styles.nutritionValue, { color: COLORS.warning }]}>
                    {selectedFood.carbs}
                  </Text>
                  <Text style={styles.nutritionUnit}>g</Text>
                </Surface>

                <Surface style={styles.nutritionItem} elevation={2}>
                  <Text style={styles.nutritionLabel}>Fats</Text>
                  <Text style={[styles.nutritionValue, { color: COLORS.success }]}>
                    {selectedFood.fats}
                  </Text>
                  <Text style={styles.nutritionUnit}>g</Text>
                </Surface>
              </View>
            </Card.Content>
          </Card>
        )}
      </Modal>
    </Portal>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'diary':
        return (
          <View>
            {renderNutritionSummary()}
            {Object.entries(diaryData).map(([mealType, entries]) =>
              renderMealSection(mealType, entries)
            )}
          </View>
        );
      case 'analytics':
        return (
          <View style={styles.tabContent}>
            <Text style={[TEXT_STYLES.h3, styles.comingSoonTitle]}>
              📈 Nutrition Analytics
            </Text>
            <Icon name="construction" size={80} color={COLORS.textSecondary} style={styles.constructionIcon} />
            <Text style={styles.comingSoonText}>
              Feature Coming Soon! 🚧
            </Text>
          </View>
        );
      case 'goals':
        return (
          <View style={styles.tabContent}>
            <Text style={[TEXT_STYLES.h3, styles.comingSoonTitle]}>
              🎯 Nutrition Goals
            </Text>
            <Icon name="construction" size={80} color={COLORS.textSecondary} style={styles.constructionIcon} />
            <Text style={styles.comingSoonText}>
              Feature Coming Soon! 🚧
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderTabSelector()}
      
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
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'diary' && renderClientSelector()}
        {renderTabContent()}
      </ScrollView>

      {renderAddFoodModal()}
      {renderNutritionModal()}

      <FAB
        icon="restaurant-menu"
        style={styles.fab}
        onPress={() => {
          Alert.alert(
            'Quick Actions 🚀',
            'Choose an action:',
            [
              { text: 'Add Food', onPress: () => setShowAddFoodModal(true) },
              { text: 'View Analytics', onPress: () => setActiveTab('analytics') },
              { text: 'Cancel', style: 'cancel' }
            ]
          );
        }}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  headerTitle: {
    color: 'white',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  headerAvatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  tabContainer: {
    margin: SPACING.md,
    borderRadius: 12,
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.sm,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: COLORS.primary + '20',
  },
  tabText: {
    marginLeft: SPACING.xs,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  clientSection: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  searchbar: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  clientScroll: {
    marginBottom: SPACING.md,
  },
  clientCard: {
    alignItems: 'center',
    padding: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    elevation: 2,
    width: 80,
  },
  selectedClientCard: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  clientAvatar: {
    marginBottom: SPACING.xs,
  },
  clientName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  clientAge: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  summaryContainer: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  summaryCard: {
    borderRadius: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  summaryTitle: {
    color: COLORS.text,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
  },
  dateText: {
    color: COLORS.primary,
    fontWeight: '600',
    marginRight: SPACING.xs,
    fontSize: 12,
  },
  caloriesSection: {
    marginBottom: SPACING.lg,
  },
  caloriesLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  caloriesRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING.sm,
  },
  caloriesValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  caloriesTarget: {
    fontSize: 18,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  caloriesProgress: {
    height: 8,
    borderRadius: 4,
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: SPACING.xs,
  },
  macroName: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  macroValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  macroUnit: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  macroProgress: {
    width: '100%',
    height: 6,
    borderRadius: 3,
  },
  mealSection: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  mealCard: {
    borderRadius: 16,
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
  mealIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  mealEmoji: {
    fontSize: 24,
  },
  mealInfo: {
    flex: 1,
  },
  mealTitle: {
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  mealCount: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  addButton: {
    borderRadius: 20,
  },
  foodEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  foodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  foodEmoji: {
    fontSize: 20,
    marginRight: SPACING.md,
  },
  foodDetails: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  foodQuantity: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  emptyMeal: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  emptyMealText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: SPACING.sm,
  },
  tabContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xl * 2,
  },
  comingSoonTitle: {
    color: COLORS.text,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  constructionIcon: {
    marginBottom: SPACING.lg,
  },
  comingSoonText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  },
  modalContainer: {
    padding: SPACING.md,
    justifyContent: 'center',
    maxHeight: height * 0.9,
  },
  addFoodCard: {
    borderRadius: 20,
    maxHeight: height * 0.85,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    color: COLORS.text,
    flex: 1,
  },
  foodSearchbar: {
    marginBottom: SPACING.md,
    elevation: 1,
  },
  foodList: {
    maxHeight: height * 0.4,
    marginBottom: SPACING.md,
  },
  foodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.sm,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    elevation: 1,
  },
  selectedFoodOption: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  foodOptionEmoji: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  foodOptionInfo: {
    flex: 1,
  },
  foodOptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  foodOptionNutrition: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  categoryChip: {
    borderRadius: 16,
  },
  categoryChipText: {
    fontSize: 10,
    color: COLORS.text,
  },
  quantitySection: {
    marginBottom: SPACING.md,
  },
  quantityInput: {
    backgroundColor: 'transparent',
    marginBottom: SPACING.sm,
  },
  previewNutrition: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 0.45,
    borderRadius: 12,
  },
  nutritionCard: {
    borderRadius: 20,
  },
  nutritionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  nutritionEmoji: {
    fontSize: 40,
    marginRight: SPACING.md,
  },
  nutritionInfo: {
    flex: 1,
  },
  nutritionTitle: {
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  nutritionSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 12,
    width: '48%',
    marginBottom: SPACING.md,
  },
  nutritionLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  nutritionValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  nutritionUnit: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
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