import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  RefreshControl,
  Alert,
  Dimensions,
  TouchableOpacity,
  Animated,
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
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your established constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const NutritionalDashboard = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, nutritionData, dailyGoals, mealPlans } = useSelector(state => state.nutrition);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [showNutritionModal, setShowNutritionModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [waterIntake, setWaterIntake] = useState(0);
  const [todaysProgress, setTodaysProgress] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    fiber: 0,
    water: 0
  });

  // Mock data - replace with Redux selectors
  const mockNutritionGoals = {
    calories: 2500,
    protein: 150, // grams
    carbs: 300,
    fats: 80,
    fiber: 25,
    water: 3000 // ml
  };

  const mockMeals = [
    {
      id: '1',
      name: 'Pre-Workout Smoothie',
      time: '07:00',
      calories: 320,
      type: 'breakfast',
      status: 'completed',
      items: ['Banana', 'Protein Powder', 'Oats', 'Almond Milk']
    },
    {
      id: '2',
      name: 'Post-Workout Meal',
      time: '09:30',
      calories: 580,
      type: 'breakfast',
      status: 'completed',
      items: ['Grilled Chicken', 'Sweet Potato', 'Broccoli']
    },
    {
      id: '3',
      name: 'Balanced Lunch',
      time: '13:00',
      calories: 650,
      type: 'lunch',
      status: 'pending',
      items: ['Salmon', 'Quinoa', 'Mixed Vegetables', 'Avocado']
    },
    {
      id: '4',
      name: 'Recovery Dinner',
      time: '19:00',
      calories: 720,
      type: 'dinner',
      status: 'pending',
      items: ['Lean Beef', 'Brown Rice', 'Spinach Salad']
    }
  ];

  const mockSupplements = [
    { id: '1', name: 'Whey Protein', time: 'Post-Workout', status: 'taken' },
    { id: '2', name: 'Creatine', time: 'Pre-Workout', status: 'pending' },
    { id: '3', name: 'Multivitamin', time: 'Morning', status: 'taken' },
    { id: '4', name: 'Omega-3', time: 'Evening', status: 'pending' }
  ];

  // Initialize animations
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
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Mock progress calculation
    const completedMeals = mockMeals.filter(meal => meal.status === 'completed');
    const totalCalories = completedMeals.reduce((sum, meal) => sum + meal.calories, 0);
    
    setTodaysProgress({
      calories: totalCalories,
      protein: Math.round(totalCalories * 0.3 / 4), // 30% protein
      carbs: Math.round(totalCalories * 0.4 / 4), // 40% carbs
      fats: Math.round(totalCalories * 0.3 / 9), // 30% fats
      fiber: Math.round(totalCalories * 0.015), // Rough estimate
      water: waterIntake
    });
  }, [waterIntake]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Vibration.vibrate(50);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // dispatch(fetchNutritionData());
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh nutrition data');
    }
    
    setRefreshing(false);
  }, [dispatch]);

  const handleMealAction = (mealId, action) => {
    Vibration.vibrate(30);
    
    if (action === 'log') {
      Alert.alert(
        '🍽️ Meal Logging',
        'Food logging feature coming soon! Track your meals with photo recognition and barcode scanning.',
        [{ text: 'Got it!', style: 'default' }]
      );
    } else if (action === 'complete') {
      Alert.alert(
        '✅ Mark Complete',
        'Meal completion tracking coming soon! Get points for following your nutrition plan.',
        [{ text: 'Awesome!', style: 'default' }]
      );
    }
  };

  const addWater = (amount) => {
    setWaterIntake(prev => prev + amount);
    Vibration.vibrate(50);
  };

  const renderProgressCard = () => (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{
          margin: SPACING.md,
          borderRadius: 16,
          padding: SPACING.lg,
          elevation: 8,
          shadowColor: COLORS.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md }}>
          <Text style={[TEXT_STYLES.h3, { color: 'white', fontWeight: 'bold' }]}>
            Today's Progress 📊
          </Text>
          <Chip
            mode="outlined"
            textStyle={{ color: 'white', fontSize: 12 }}
            style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderColor: 'white' }}
          >
            {selectedPeriod.toUpperCase()}
          </Chip>
        </View>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.lg }}>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={[TEXT_STYLES.h2, { color: 'white', fontWeight: 'bold' }]}>
              {todaysProgress.calories}
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
              / {mockNutritionGoals.calories} kcal
            </Text>
            <ProgressBar
              progress={todaysProgress.calories / mockNutritionGoals.calories}
              color="white"
              style={{ width: 60, marginTop: SPACING.xs, backgroundColor: 'rgba(255,255,255,0.3)' }}
            />
          </View>
          
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={[TEXT_STYLES.h2, { color: 'white', fontWeight: 'bold' }]}>
              {todaysProgress.protein}g
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
              / {mockNutritionGoals.protein}g protein
            </Text>
            <ProgressBar
              progress={todaysProgress.protein / mockNutritionGoals.protein}
              color="white"
              style={{ width: 60, marginTop: SPACING.xs, backgroundColor: 'rgba(255,255,255,0.3)' }}
            />
          </View>
          
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={[TEXT_STYLES.h2, { color: 'white', fontWeight: 'bold' }]}>
              {(waterIntake / 1000).toFixed(1)}L
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
              / {mockNutritionGoals.water / 1000}L water
            </Text>
            <ProgressBar
              progress={waterIntake / mockNutritionGoals.water}
              color="white"
              style={{ width: 60, marginTop: SPACING.xs, backgroundColor: 'rgba(255,255,255,0.3)' }}
            />
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderMacroBreakdown = () => (
    <Card style={{ margin: SPACING.md, elevation: 4 }}>
      <Card.Content style={{ padding: SPACING.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
          <Icon name="pie-chart" size={24} color={COLORS.primary} />
          <Text style={[TEXT_STYLES.h3, { marginLeft: SPACING.sm, flex: 1 }]}>
            Macro Breakdown 🥗
          </Text>
        </View>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Surface style={{ 
              width: 60, 
              height: 60, 
              borderRadius: 30, 
              justifyContent: 'center', 
              alignItems: 'center',
              backgroundColor: COLORS.success + '20'
            }}>
              <Text style={{ color: COLORS.success, fontWeight: 'bold' }}>
                {Math.round((todaysProgress.carbs * 4 / todaysProgress.calories) * 100) || 0}%
              </Text>
            </Surface>
            <Text style={{ marginTop: SPACING.xs, fontSize: 12, color: COLORS.textSecondary }}>
              Carbs ({todaysProgress.carbs}g)
            </Text>
          </View>
          
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Surface style={{ 
              width: 60, 
              height: 60, 
              borderRadius: 30, 
              justifyContent: 'center', 
              alignItems: 'center',
              backgroundColor: COLORS.primary + '20'
            }}>
              <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>
                {Math.round((todaysProgress.protein * 4 / todaysProgress.calories) * 100) || 0}%
              </Text>
            </Surface>
            <Text style={{ marginTop: SPACING.xs, fontSize: 12, color: COLORS.textSecondary }}>
              Protein ({todaysProgress.protein}g)
            </Text>
          </View>
          
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Surface style={{ 
              width: 60, 
              height: 60, 
              borderRadius: 30, 
              justifyContent: 'center', 
              alignItems: 'center',
              backgroundColor: COLORS.warning + '20'
            }}>
              <Text style={{ color: COLORS.warning, fontWeight: 'bold' }}>
                {Math.round((todaysProgress.fats * 9 / todaysProgress.calories) * 100) || 0}%
              </Text>
            </Surface>
            <Text style={{ marginTop: SPACING.xs, fontSize: 12, color: COLORS.textSecondary }}>
              Fats ({todaysProgress.fats}g)
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderWaterTracker = () => (
    <Card style={{ margin: SPACING.md, elevation: 4 }}>
      <Card.Content style={{ padding: SPACING.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
          <Icon name="opacity" size={24} color={COLORS.info} />
          <Text style={[TEXT_STYLES.h3, { marginLeft: SPACING.sm, flex: 1 }]}>
            Hydration Tracker 💧
          </Text>
          <Text style={{ color: COLORS.textSecondary }}>
            {(waterIntake / 1000).toFixed(1)} / {mockNutritionGoals.water / 1000}L
          </Text>
        </View>
        
        <ProgressBar
          progress={waterIntake / mockNutritionGoals.water}
          color={COLORS.info}
          style={{ height: 8, borderRadius: 4, marginBottom: SPACING.md }}
        />
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
          {[250, 500, 750].map((amount) => (
            <Button
              key={amount}
              mode="contained"
              compact
              onPress={() => addWater(amount)}
              style={{ backgroundColor: COLORS.info }}
              labelStyle={{ fontSize: 12 }}
            >
              +{amount}ml
            </Button>
          ))}
        </View>
      </Card.Content>
    </Card>
  );

  const renderMealPlan = () => (
    <Card style={{ margin: SPACING.md, elevation: 4 }}>
      <Card.Content style={{ padding: SPACING.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
          <Icon name="restaurant" size={24} color={COLORS.primary} />
          <Text style={[TEXT_STYLES.h3, { marginLeft: SPACING.sm, flex: 1 }]}>
            Today's Meal Plan 🍽️
          </Text>
          <IconButton
            icon="add"
            size={24}
            onPress={() => Alert.alert('Add Meal', 'Custom meal creation coming soon!')}
            style={{ backgroundColor: COLORS.primary + '20' }}
          />
        </View>
        
        {mockMeals.map((meal) => (
          <Surface
            key={meal.id}
            style={{
              padding: SPACING.md,
              marginBottom: SPACING.sm,
              borderRadius: 12,
              backgroundColor: meal.status === 'completed' ? COLORS.success + '10' : COLORS.background,
              borderLeftWidth: 4,
              borderLeftColor: meal.status === 'completed' ? COLORS.success : COLORS.primary,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs }}>
                  <Text style={[TEXT_STYLES.subtitle, { fontWeight: 'bold' }]}>
                    {meal.name}
                  </Text>
                  {meal.status === 'completed' && (
                    <Icon name="check-circle" size={16} color={COLORS.success} style={{ marginLeft: SPACING.xs }} />
                  )}
                </View>
                <Text style={{ color: COLORS.textSecondary, fontSize: 12, marginBottom: SPACING.xs }}>
                  {meal.time} • {meal.calories} kcal
                </Text>
                <Text style={{ color: COLORS.textSecondary, fontSize: 11 }}>
                  {meal.items.join(', ')}
                </Text>
              </View>
              
              <View style={{ flexDirection: 'row' }}>
                <IconButton
                  icon="camera"
                  size={20}
                  onPress={() => handleMealAction(meal.id, 'log')}
                  style={{ backgroundColor: COLORS.primary + '20', marginRight: SPACING.xs }}
                />
                {meal.status === 'pending' && (
                  <IconButton
                    icon="check"
                    size={20}
                    onPress={() => handleMealAction(meal.id, 'complete')}
                    style={{ backgroundColor: COLORS.success + '20' }}
                  />
                )}
              </View>
            </View>
          </Surface>
        ))}
      </Card.Content>
    </Card>
  );

  const renderSupplements = () => (
    <Card style={{ margin: SPACING.md, elevation: 4 }}>
      <Card.Content style={{ padding: SPACING.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
          <Icon name="medical-services" size={24} color={COLORS.warning} />
          <Text style={[TEXT_STYLES.h3, { marginLeft: SPACING.sm, flex: 1 }]}>
            Supplements 💊
          </Text>
        </View>
        
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {mockSupplements.map((supplement) => (
            <Chip
              key={supplement.id}
              mode={supplement.status === 'taken' ? 'flat' : 'outlined'}
              style={{
                margin: SPACING.xs,
                backgroundColor: supplement.status === 'taken' ? COLORS.success + '20' : 'transparent'
              }}
              textStyle={{
                color: supplement.status === 'taken' ? COLORS.success : COLORS.textPrimary
              }}
              onPress={() => Alert.alert('Supplement', 'Supplement tracking coming soon!')}
            >
              {supplement.status === 'taken' ? '✅ ' : '⏰ '}
              {supplement.name}
            </Chip>
          ))}
        </View>
      </Card.Content>
    </Card>
  );

  const renderQuickActions = () => (
    <View style={{ 
      flexDirection: 'row', 
      justifyContent: 'space-around', 
      paddingHorizontal: SPACING.lg,
      marginBottom: SPACING.lg 
    }}>
      {[
        { icon: 'qr-code-scanner', label: 'Scan Food', color: COLORS.primary },
        { icon: 'restaurant-menu', label: 'Recipes', color: COLORS.success },
        { icon: 'timeline', label: 'Analytics', color: COLORS.info },
        { icon: 'school', label: 'Learn', color: COLORS.warning }
      ].map((action, index) => (
        <TouchableOpacity
          key={action.label}
          onPress={() => Alert.alert(action.label, `${action.label} feature coming soon!`)}
          style={{
            alignItems: 'center',
            padding: SPACING.md,
          }}
        >
          <Surface style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: action.color + '20',
            elevation: 2
          }}>
            <Icon name={action.icon} size={24} color={action.color} />
          </Surface>
          <Text style={{ marginTop: SPACING.xs, fontSize: 12, color: COLORS.textSecondary }}>
            {action.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
            title="Pull to refresh nutrition data..."
            titleColor={COLORS.textSecondary}
          />
        }
      >
        {renderProgressCard()}
        {renderMacroBreakdown()}
        {renderWaterTracker()}
        {renderQuickActions()}
        {renderMealPlan()}
        {renderSupplements()}
        
        {/* Bottom spacing for FAB */}
        <View style={{ height: 100 }} />
      </ScrollView>

      <FAB
        icon="add"
        label="Log Food"
        onPress={() => Alert.alert('🍎 Food Logging', 'AI-powered food logging coming soon! Scan barcodes, take photos, or search our database.')}
        style={{
          position: 'absolute',
          margin: SPACING.lg,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.primary,
        }}
      />
    </View>
  );
};

export default NutritionalDashboard;