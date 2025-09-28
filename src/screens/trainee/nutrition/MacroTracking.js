import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  RefreshControl,
  Alert,
  Animated,
  Dimensions,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
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
  Dialog,
  TextInput,
  Menu,
  Divider,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Design system imports
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const MacroTracking = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  // Redux state
  const user = useSelector(state => state.user);
  const nutritionData = useSelector(state => state.nutrition);
  
  // Component state
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddFood, setShowAddFood] = useState(false);
  const [showMacroDetails, setShowMacroDetails] = useState(false);
  const [selectedMacro, setSelectedMacro] = useState(null);
  const [mealType, setMealType] = useState('breakfast');
  const [showMealMenu, setShowMealMenu] = useState(false);
  const [foodQuantity, setFoodQuantity] = useState('100');
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // Mock data - in real app this would come from Redux store
  const [dailyGoals] = useState({
    calories: 2200,
    protein: 165, // grams
    carbs: 275, // grams
    fat: 73, // grams
    fiber: 25, // grams
    sugar: 50, // grams
    sodium: 2300, // mg
    water: 8, // glasses
  });
  
  const [currentIntake, setCurrentIntake] = useState({
    calories: 1650,
    protein: 125,
    carbs: 180,
    fat: 65,
    fiber: 18,
    sugar: 35,
    sodium: 1800,
    water: 6,
  });
  
  const [recentFoods] = useState([
    { id: 1, name: 'Greek Yogurt', calories: 130, protein: 15, carbs: 9, fat: 6, portion: '1 cup' },
    { id: 2, name: 'Banana', calories: 105, protein: 1, carbs: 27, fat: 0, portion: '1 medium' },
    { id: 3, name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6, portion: '100g' },
    { id: 4, name: 'Brown Rice', calories: 112, protein: 2.6, carbs: 23, fat: 0.9, portion: '100g' },
    { id: 5, name: 'Almonds', calories: 164, protein: 6, carbs: 6, fat: 14, portion: '28g' },
  ]);
  
  const [todayMeals, setTodayMeals] = useState({
    breakfast: [
      { id: 1, name: 'Oatmeal with Berries', calories: 320, protein: 12, carbs: 65, fat: 6 },
      { id: 2, name: 'Greek Yogurt', calories: 130, protein: 15, carbs: 9, fat: 6 },
    ],
    lunch: [
      { id: 3, name: 'Grilled Chicken Salad', calories: 450, protein: 35, carbs: 25, fat: 25 },
    ],
    dinner: [
      { id: 4, name: 'Salmon with Quinoa', calories: 520, protein: 38, carbs: 45, fat: 20 },
    ],
    snacks: [
      { id: 5, name: 'Apple with Peanut Butter', calories: 230, protein: 8, carbs: 25, fat: 12 },
    ],
  });
  
  const micronutrients = [
    { name: 'Vitamin C', current: 75, goal: 90, unit: 'mg', color: COLORS.success },
    { name: 'Vitamin D', current: 15, goal: 20, unit: 'mcg', color: '#ff9500' },
    { name: 'Iron', current: 12, goal: 18, unit: 'mg', color: '#ff3b30' },
    { name: 'Calcium', current: 800, goal: 1000, unit: 'mg', color: '#007aff' },
    { name: 'Magnesium', current: 280, goal: 320, unit: 'mg', color: '#5856d6' },
    { name: 'Potassium', current: 2800, goal: 3500, unit: 'mg', color: '#ff2d92' },
  ];
  
  useEffect(() => {
    // Entrance animation
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
  }, []);
  
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('Updated! 📊', 'Your nutrition data has been refreshed.');
    }, 2000);
  }, []);
  
  const calculateMacroPercentage = (current, goal) => {
    return Math.min((current / goal) * 100, 100) / 100;
  };
  
  const getMacroColor = (percentage) => {
    if (percentage >= 0.9) return COLORS.success;
    if (percentage >= 0.7) return '#ff9500';
    return COLORS.error;
  };
  
  const addWaterGlass = () => {
    if (currentIntake.water < dailyGoals.water) {
      setCurrentIntake(prev => ({
        ...prev,
        water: prev.water + 1
      }));
    }
  };
  
  const removeWaterGlass = () => {
    if (currentIntake.water > 0) {
      setCurrentIntake(prev => ({
        ...prev,
        water: prev.water - 1
      }));
    }
  };
  
  const addFoodToMeal = (food) => {
    const quantity = parseFloat(foodQuantity) / 100; // Convert to multiplier
    const adjustedFood = {
      ...food,
      calories: Math.round(food.calories * quantity),
      protein: Math.round(food.protein * quantity * 10) / 10,
      carbs: Math.round(food.carbs * quantity * 10) / 10,
      fat: Math.round(food.fat * quantity * 10) / 10,
    };
    
    setTodayMeals(prev => ({
      ...prev,
      [mealType]: [...prev[mealType], { ...adjustedFood, id: Date.now() }]
    }));
    
    // Update current intake
    setCurrentIntake(prev => ({
      ...prev,
      calories: prev.calories + adjustedFood.calories,
      protein: prev.protein + adjustedFood.protein,
      carbs: prev.carbs + adjustedFood.carbs,
      fat: prev.fat + adjustedFood.fat,
    }));
    
    setShowAddFood(false);
    setSearchQuery('');
    setFoodQuantity('100');
  };
  
  const renderMacroCard = (name, current, goal, unit, color, icon) => {
    const percentage = calculateMacroPercentage(current, goal);
    const displayColor = getMacroColor(percentage);
    
    return (
      <TouchableOpacity
        key={name}
        onPress={() => {
          setSelectedMacro({ name, current, goal, unit, percentage });
          setShowMacroDetails(true);
        }}
        style={{
          marginRight: SPACING.md,
          width: width * 0.28,
        }}
      >
        <Card style={{ elevation: 4, backgroundColor: 'white' }}>
          <Card.Content style={{ alignItems: 'center', padding: SPACING.sm }}>
            <Icon name={icon} size={24} color={displayColor} style={{ marginBottom: SPACING.xs }} />
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginBottom: 2 }]}>
              {name.toUpperCase()}
            </Text>
            <Text style={[TEXT_STYLES.h3, { color: displayColor, marginBottom: SPACING.xs }]}>
              {current}
            </Text>
            <ProgressBar
              progress={percentage}
              color={displayColor}
              style={{ width: '100%', height: 4, backgroundColor: '#f0f0f0' }}
            />
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginTop: SPACING.xs }]}>
              of {goal}{unit}
            </Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };
  
  const renderMealSection = (mealName, foods, icon, color) => (
    <Card style={{ marginBottom: SPACING.md, elevation: 3 }}>
      <Card.Content>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name={icon} size={24} color={color} style={{ marginRight: SPACING.sm }} />
            <Text style={[TEXT_STYLES.h3, { textTransform: 'capitalize' }]}>{mealName}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginRight: SPACING.sm }]}>
              {foods.reduce((sum, food) => sum + food.calories, 0)} cal
            </Text>
            <IconButton
              icon="add"
              size={20}
              onPress={() => {
                setMealType(mealName);
                setShowAddFood(true);
              }}
            />
          </View>
        </View>
        
        {foods.length === 0 ? (
          <Surface style={{ padding: SPACING.md, borderRadius: 8, backgroundColor: '#f8f9fa' }}>
            <Text style={[TEXT_STYLES.body, { textAlign: 'center', color: COLORS.textSecondary }]}>
              No foods added yet. Tap + to add foods! 🍽️
            </Text>
          </Surface>
        ) : (
          foods.map((food) => (
            <View key={food.id} style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              paddingVertical: SPACING.xs,
              borderBottomWidth: foods.indexOf(food) === foods.length - 1 ? 0 : 1,
              borderBottomColor: '#f0f0f0'
            }}>
              <View style={{ flex: 1 }}>
                <Text style={TEXT_STYLES.subtitle}>{food.name}</Text>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                  P: {food.protein}g • C: {food.carbs}g • F: {food.fat}g
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[TEXT_STYLES.subtitle, { color: COLORS.primary }]}>
                  {food.calories} cal
                </Text>
              </View>
            </View>
          ))
        )}
      </Card.Content>
    </Card>
  );
  
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <View style={{ flex: 1, backgroundColor: COLORS.background }}>
        {/* Header */}
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={{ paddingTop: StatusBar.currentHeight + SPACING.lg, paddingBottom: SPACING.lg }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.lg }}>
            <IconButton
              icon="arrow-back"
              iconColor="white"
              size={24}
              onPress={() => navigation.goBack()}
            />
            <View style={{ flex: 1 }}>
              <Text style={[TEXT_STYLES.h2, { color: 'white', textAlign: 'center', marginRight: 48 }]}>
                Macro Tracking
              </Text>
            </View>
          </View>
          
          {/* Date selector */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: SPACING.sm }}>
            <IconButton icon="chevron-left" iconColor="white" onPress={() => {}} />
            <Text style={[TEXT_STYLES.subtitle, { color: 'white', minWidth: 120, textAlign: 'center' }]}>
              Today, {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Text>
            <IconButton icon="chevron-right" iconColor="white" onPress={() => {}} />
          </View>
        </LinearGradient>
        
        <Animated.ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: SPACING.lg }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              progressBackgroundColor="white"
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Daily Summary Card */}
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <Card style={{ marginBottom: SPACING.lg, elevation: 6 }}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={{ borderTopLeftRadius: 8, borderTopRightRadius: 8 }}
              >
                <Card.Content style={{ paddingVertical: SPACING.lg }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{ alignItems: 'center' }}>
                      <Text style={[TEXT_STYLES.h1, { color: 'white', fontSize: 36 }]}>
                        {dailyGoals.calories - currentIntake.calories}
                      </Text>
                      <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
                        CALORIES REMAINING
                      </Text>
                    </View>
                  </View>
                  
                  <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: SPACING.lg }}>
                    <View style={{ alignItems: 'center' }}>
                      <Text style={[TEXT_STYLES.subtitle, { color: 'white' }]}>{dailyGoals.calories}</Text>
                      <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>Goal</Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                      <Text style={[TEXT_STYLES.subtitle, { color: 'white' }]}>{currentIntake.calories}</Text>
                      <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>Consumed</Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                      <Text style={[TEXT_STYLES.subtitle, { color: 'white' }]}>0</Text>
                      <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>Burned</Text>
                    </View>
                  </View>
                </Card.Content>
              </LinearGradient>
            </Card>
          </Animated.View>
          
          {/* Macronutrients */}
          <View style={{ marginBottom: SPACING.lg }}>
            <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md, color: COLORS.textPrimary }]}>
              Macronutrients 🥗
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {renderMacroCard('Protein', currentIntake.protein, dailyGoals.protein, 'g', COLORS.success, 'fitness-center')}
              {renderMacroCard('Carbs', currentIntake.carbs, dailyGoals.carbs, 'g', '#ff9500', 'grain')}
              {renderMacroCard('Fat', currentIntake.fat, dailyGoals.fat, 'g', COLORS.primary, 'opacity')}
              {renderMacroCard('Fiber', currentIntake.fiber, dailyGoals.fiber, 'g', '#34c759', 'eco')}
            </ScrollView>
          </View>
          
          {/* Water Intake */}
          <Card style={{ marginBottom: SPACING.lg, elevation: 3 }}>
            <Card.Content>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon name="local-drink" size={24} color="#007aff" style={{ marginRight: SPACING.sm }} />
                  <Text style={TEXT_STYLES.h3}>Water Intake 💧</Text>
                </View>
                <Text style={[TEXT_STYLES.subtitle, { color: COLORS.textSecondary }]}>
                  {currentIntake.water}/{dailyGoals.water} glasses
                </Text>
              </View>
              
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: SPACING.md }}>
                <IconButton icon="remove" onPress={removeWaterGlass} />
                <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'center' }}>
                  {Array.from({ length: dailyGoals.water }).map((_, index) => (
                    <Icon
                      key={index}
                      name="local-drink"
                      size={24}
                      color={index < currentIntake.water ? '#007aff' : '#e0e0e0'}
                      style={{ marginHorizontal: 2 }}
                    />
                  ))}
                </View>
                <IconButton icon="add" onPress={addWaterGlass} />
              </View>
            </Card.Content>
          </Card>
          
          {/* Micronutrients */}
          <View style={{ marginBottom: SPACING.lg }}>
            <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md, color: COLORS.textPrimary }]}>
              Micronutrients 🧪
            </Text>
            <Card style={{ elevation: 3 }}>
              <Card.Content>
                {micronutrients.map((nutrient, index) => {
                  const percentage = nutrient.current / nutrient.goal;
                  return (
                    <View key={nutrient.name} style={{ 
                      marginBottom: index === micronutrients.length - 1 ? 0 : SPACING.md 
                    }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xs }}>
                        <Text style={TEXT_STYLES.subtitle}>{nutrient.name}</Text>
                        <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                          {nutrient.current}/{nutrient.goal} {nutrient.unit}
                        </Text>
                      </View>
                      <ProgressBar
                        progress={Math.min(percentage, 1)}
                        color={nutrient.color}
                        style={{ height: 6, backgroundColor: '#f0f0f0' }}
                      />
                    </View>
                  );
                })}
              </Card.Content>
            </Card>
          </View>
          
          {/* Meals */}
          <View style={{ marginBottom: SPACING.xl }}>
            <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md, color: COLORS.textPrimary }]}>
              Today's Meals 🍽️
            </Text>
            
            {renderMealSection('breakfast', todayMeals.breakfast, 'wb-sunny', '#ff9500')}
            {renderMealSection('lunch', todayMeals.lunch, 'restaurant', '#34c759')}
            {renderMealSection('dinner', todayMeals.dinner, 'dinner-dining', '#ff3b30')}
            {renderMealSection('snacks', todayMeals.snacks, 'cookie', '#5856d6')}
          </View>
        </Animated.ScrollView>
        
        {/* Add Food Modal */}
        <Portal>
          <Modal
            visible={showAddFood}
            onDismiss={() => setShowAddFood(false)}
            contentContainerStyle={{
              backgroundColor: 'white',
              margin: SPACING.lg,
              borderRadius: 12,
              maxHeight: '80%',
            }}
          >
            <View style={{ padding: SPACING.lg }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.lg }}>
                <Text style={TEXT_STYLES.h2}>Add Food to {mealType}</Text>
                <IconButton icon="close" onPress={() => setShowAddFood(false)} />
              </View>
              
              <Searchbar
                placeholder="Search for foods..."
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={{ marginBottom: SPACING.md }}
              />
              
              <TextInput
                label="Quantity (grams)"
                value={foodQuantity}
                onChangeText={setFoodQuantity}
                keyboardType="numeric"
                style={{ marginBottom: SPACING.md }}
              />
              
              <ScrollView style={{ maxHeight: 300 }}>
                {recentFoods
                  .filter(food => food.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((food) => (
                    <TouchableOpacity
                      key={food.id}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: SPACING.md,
                        borderBottomWidth: 1,
                        borderBottomColor: '#f0f0f0'
                      }}
                      onPress={() => addFoodToMeal(food)}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={TEXT_STYLES.subtitle}>{food.name}</Text>
                        <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                          {food.calories} cal • P: {food.protein}g • C: {food.carbs}g • F: {food.fat}g
                        </Text>
                      </View>
                      <Icon name="add" size={24} color={COLORS.primary} />
                    </TouchableOpacity>
                  ))}
              </ScrollView>
            </View>
          </Modal>
        </Portal>
        
        {/* Macro Details Modal */}
        <Portal>
          <Dialog visible={showMacroDetails} onDismiss={() => setShowMacroDetails(false)}>
            <Dialog.Title>{selectedMacro?.name} Details</Dialog.Title>
            <Dialog.Content>
              <View style={{ alignItems: 'center', marginBottom: SPACING.lg }}>
                <Text style={[TEXT_STYLES.h1, { fontSize: 48, color: COLORS.primary }]}>
                  {Math.round((selectedMacro?.percentage || 0) * 100)}%
                </Text>
                <Text style={[TEXT_STYLES.subtitle, { color: COLORS.textSecondary }]}>
                  of daily goal completed
                </Text>
              </View>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={[TEXT_STYLES.h3, { color: COLORS.success }]}>
                    {selectedMacro?.current}
                  </Text>
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                    Current
                  </Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={[TEXT_STYLES.h3, { color: COLORS.textSecondary }]}>
                    {selectedMacro?.goal}
                  </Text>
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                    Goal
                  </Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>
                    {selectedMacro ? selectedMacro.goal - selectedMacro.current : 0}
                  </Text>
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                    Remaining
                  </Text>
                </View>
              </View>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setShowMacroDetails(false)}>Close</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
        
        {/* Floating Action Button */}
        <FAB
          icon="restaurant"
          style={{
            position: 'absolute',
            margin: SPACING.lg,
            right: 0,
            bottom: 0,
            backgroundColor: COLORS.primary,
          }}
          onPress={() => {
            Alert.alert(
              'Quick Add 🚀',
              'Feature coming soon! You\'ll be able to quickly log meals using AI-powered food recognition.',
              [{ text: 'Got it!', style: 'default' }]
            );
          }}
        />
      </View>
    </>
  );
};

export default MacroTracking;