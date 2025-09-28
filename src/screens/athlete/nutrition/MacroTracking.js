import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Dimensions,
  Animated,
  Vibration,
  Alert,
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
  TextInput,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your established constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f5f5',
  white: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e0e0e0',
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
  h2: { fontSize: 24, fontWeight: 'bold' },
  h3: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16 },
  caption: { fontSize: 14, color: '#666' },
  small: { fontSize: 12, color: '#999' },
};

const { width } = Dimensions.get('window');

const MacroTracking = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, nutritionData } = useSelector(state => ({
    user: state.user,
    nutritionData: state.nutrition
  }));

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMeal, setSelectedMeal] = useState('breakfast');
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [portion, setPortion] = useState('');

  // Mock data - replace with Redux state
  const [dailyData, setDailyData] = useState({
    target: {
      calories: 2500,
      protein: 150,
      carbs: 300,
      fat: 85,
    },
    consumed: {
      calories: 1847,
      protein: 124,
      carbs: 203,
      fat: 67,
    },
    meals: {
      breakfast: [
        { id: 1, name: 'Oatmeal with Banana', calories: 320, protein: 12, carbs: 58, fat: 6, portion: '1 bowl' },
        { id: 2, name: 'Greek Yogurt', calories: 130, protein: 15, carbs: 9, fat: 0, portion: '150g' },
      ],
      lunch: [
        { id: 3, name: 'Grilled Chicken Breast', calories: 285, protein: 53, carbs: 0, fat: 6, portion: '200g' },
        { id: 4, name: 'Brown Rice', calories: 220, protein: 5, carbs: 45, fat: 2, portion: '100g' },
        { id: 5, name: 'Mixed Vegetables', calories: 80, protein: 3, carbs: 16, fat: 1, portion: '150g' },
      ],
      dinner: [
        { id: 6, name: 'Salmon Fillet', calories: 412, protein: 36, carbs: 0, fat: 28, portion: '180g' },
        { id: 7, name: 'Sweet Potato', calories: 180, protein: 4, carbs: 41, fat: 0, portion: '200g' },
      ],
      snacks: [
        { id: 8, name: 'Protein Shake', calories: 220, protein: 25, carbs: 8, fat: 3, portion: '1 scoop' },
      ],
    }
  });

  // Calculate progress percentages
  const getProgressPercentage = (consumed, target) => Math.min((consumed / target) * 100, 100) / 100;

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
    ]).start();
  }, []);

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      Vibration.vibrate(50);
    }, 1500);
  }, []);

  // Handle add food
  const handleAddFood = () => {
    if (!foodName || !calories || !protein || !carbs || !fat || !portion) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const newFood = {
      id: Date.now(),
      name: foodName,
      calories: parseFloat(calories),
      protein: parseFloat(protein),
      carbs: parseFloat(carbs),
      fat: parseFloat(fat),
      portion: portion,
    };

    setDailyData(prev => ({
      ...prev,
      meals: {
        ...prev.meals,
        [selectedMeal]: [...prev.meals[selectedMeal], newFood]
      },
      consumed: {
        calories: prev.consumed.calories + newFood.calories,
        protein: prev.consumed.protein + newFood.protein,
        carbs: prev.consumed.carbs + newFood.carbs,
        fat: prev.consumed.fat + newFood.fat,
      }
    }));

    // Reset form
    setFoodName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    setPortion('');
    setShowAddModal(false);
    
    Vibration.vibrate(100);
    Alert.alert('Success! 🎉', 'Food item added to your daily intake');
  };

  // Render macro progress card
  const renderMacroProgress = (label, consumed, target, color, icon) => (
    <Surface style={{
      flex: 1,
      margin: SPACING.xs,
      borderRadius: 12,
      elevation: 2,
      backgroundColor: COLORS.white,
    }}>
      <LinearGradient
        colors={[color + '20', color + '05']}
        style={{
          padding: SPACING.md,
          borderRadius: 12,
          alignItems: 'center',
        }}>
        <Icon name={icon} size={28} color={color} style={{ marginBottom: SPACING.xs }} />
        <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginBottom: SPACING.xs }]}>
          {label}
        </Text>
        <Text style={[TEXT_STYLES.h3, { color: COLORS.text, marginBottom: SPACING.xs }]}>
          {consumed}g
        </Text>
        <ProgressBar
          progress={getProgressPercentage(consumed, target)}
          color={color}
          style={{
            height: 6,
            borderRadius: 3,
            backgroundColor: color + '20',
            width: '100%',
            marginBottom: SPACING.xs,
          }}
        />
        <Text style={[TEXT_STYLES.small, { color: COLORS.textSecondary }]}>
          Goal: {target}g
        </Text>
        <Chip
          mode="outlined"
          style={{
            backgroundColor: consumed >= target ? COLORS.success + '20' : color + '10',
            marginTop: SPACING.xs,
            borderColor: consumed >= target ? COLORS.success : color,
          }}
          textStyle={{ fontSize: 10, color: consumed >= target ? COLORS.success : color }}>
          {consumed >= target ? '✓ Complete' : `${Math.round(((consumed / target) * 100))}%`}
        </Chip>
      </LinearGradient>
    </Surface>
  );

  // Render meal section
  const renderMealSection = (mealName, foods, emoji) => (
    <Card style={{
      marginHorizontal: SPACING.md,
      marginBottom: SPACING.md,
      borderRadius: 12,
      elevation: 2,
    }}>
      <Card.Content style={{ padding: SPACING.md }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: SPACING.md,
        }}>
          <Text style={[TEXT_STYLES.h3, { color: COLORS.text }]}>
            {emoji} {mealName.charAt(0).toUpperCase() + mealName.slice(1)}
          </Text>
          <IconButton
            icon="add"
            size={24}
            iconColor={COLORS.primary}
            style={{ backgroundColor: COLORS.primary + '10' }}
            onPress={() => {
              setSelectedMeal(mealName);
              setShowAddModal(true);
            }}
          />
        </View>
        
        {foods.length > 0 ? foods.map((food, index) => (
          <Surface key={food.id} style={{
            borderRadius: 8,
            marginBottom: index === foods.length - 1 ? 0 : SPACING.sm,
            backgroundColor: COLORS.background,
          }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: SPACING.md,
            }}>
              <View style={{ flex: 1 }}>
                <Text style={[TEXT_STYLES.body, { fontWeight: '600', color: COLORS.text }]}>
                  {food.name}
                </Text>
                <Text style={[TEXT_STYLES.caption, { marginTop: 2 }]}>
                  {food.portion}
                </Text>
                <View style={{ flexDirection: 'row', marginTop: SPACING.xs }}>
                  <Chip
                    mode="outlined"
                    compact
                    style={{ marginRight: SPACING.xs, backgroundColor: COLORS.white }}
                    textStyle={{ fontSize: 10 }}>
                    P: {food.protein}g
                  </Chip>
                  <Chip
                    mode="outlined"
                    compact
                    style={{ marginRight: SPACING.xs, backgroundColor: COLORS.white }}
                    textStyle={{ fontSize: 10 }}>
                    C: {food.carbs}g
                  </Chip>
                  <Chip
                    mode="outlined"
                    compact
                    style={{ backgroundColor: COLORS.white }}
                    textStyle={{ fontSize: 10 }}>
                    F: {food.fat}g
                  </Chip>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>
                  {food.calories}
                </Text>
                <Text style={[TEXT_STYLES.caption]}>calories</Text>
              </View>
            </View>
          </Surface>
        )) : (
          <Surface style={{
            borderRadius: 8,
            backgroundColor: COLORS.background,
            alignItems: 'center',
            padding: SPACING.xl,
          }}>
            <Icon name="restaurant" size={32} color={COLORS.textSecondary} style={{ marginBottom: SPACING.sm }} />
            <Text style={[TEXT_STYLES.caption, { textAlign: 'center' }]}>
              No foods logged for {mealName} yet
            </Text>
            <Button
              mode="contained"
              style={{ marginTop: SPACING.sm, backgroundColor: COLORS.primary }}
              onPress={() => {
                setSelectedMeal(mealName);
                setShowAddModal(true);
              }}>
              Add Food
            </Button>
          </Surface>
        )}
      </Card.Content>
    </Card>
  );

  // Render add food modal
  const renderAddFoodModal = () => (
    <Portal>
      <Modal
        visible={showAddModal}
        onDismiss={() => setShowAddModal(false)}
        contentContainerStyle={{
          backgroundColor: COLORS.white,
          margin: SPACING.md,
          borderRadius: 12,
          maxHeight: '80%',
        }}>
        <BlurView
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          blurType="light"
          blurAmount={10}
        />
        <ScrollView style={{ padding: SPACING.md }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: SPACING.md,
          }}>
            <Text style={[TEXT_STYLES.h2, { color: COLORS.text }]}>
              Add Food to {selectedMeal.charAt(0).toUpperCase() + selectedMeal.slice(1)}
            </Text>
            <IconButton
              icon="close"
              size={24}
              onPress={() => setShowAddModal(false)}
            />
          </View>

          <Searchbar
            placeholder="Search foods..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={{ marginBottom: SPACING.md, backgroundColor: COLORS.background }}
          />

          <TextInput
            label="Food Name"
            value={foodName}
            onChangeText={setFoodName}
            style={{ marginBottom: SPACING.md, backgroundColor: COLORS.white }}
            mode="outlined"
            left={<TextInput.Icon icon="food-apple" />}
          />

          <TextInput
            label="Portion Size"
            value={portion}
            onChangeText={setPortion}
            placeholder="e.g., 100g, 1 cup, 1 piece"
            style={{ marginBottom: SPACING.md, backgroundColor: COLORS.white }}
            mode="outlined"
            left={<TextInput.Icon icon="scale" />}
          />

          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: SPACING.md,
          }}>
            <TextInput
              label="Calories"
              value={calories}
              onChangeText={setCalories}
              keyboardType="numeric"
              style={{ flex: 1, marginRight: SPACING.xs, backgroundColor: COLORS.white }}
              mode="outlined"
              left={<TextInput.Icon icon="fire" />}
            />
            <TextInput
              label="Protein (g)"
              value={protein}
              onChangeText={setProtein}
              keyboardType="numeric"
              style={{ flex: 1, marginLeft: SPACING.xs, backgroundColor: COLORS.white }}
              mode="outlined"
            />
          </View>

          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: SPACING.lg,
          }}>
            <TextInput
              label="Carbs (g)"
              value={carbs}
              onChangeText={setCarbs}
              keyboardType="numeric"
              style={{ flex: 1, marginRight: SPACING.xs, backgroundColor: COLORS.white }}
              mode="outlined"
            />
            <TextInput
              label="Fat (g)"
              value={fat}
              onChangeText={setFat}
              keyboardType="numeric"
              style={{ flex: 1, marginLeft: SPACING.xs, backgroundColor: COLORS.white }}
              mode="outlined"
            />
          </View>

          <Button
            mode="contained"
            onPress={handleAddFood}
            style={{ backgroundColor: COLORS.primary, marginBottom: SPACING.sm }}>
            Add Food Item
          </Button>
        </ScrollView>
      </Modal>
    </Portal>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} translucent />
      
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={{ paddingTop: StatusBar.currentHeight + SPACING.md, paddingBottom: SPACING.md }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: SPACING.md,
        }}>
          <View>
            <Text style={[TEXT_STYLES.h1, { color: COLORS.white }]}>
              Macro Tracking 📊
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.white, opacity: 0.9 }]}>
              {new Date(selectedDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
          </View>
          <Avatar.Icon
            size={48}
            icon="account-circle"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          />
        </View>
      </LinearGradient>

      <Animated.View style={{
        flex: 1,
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          showsVerticalScrollIndicator={false}>
          
          {/* Daily Overview Card */}
          <Card style={{
            margin: SPACING.md,
            marginTop: -SPACING.lg,
            borderRadius: 16,
            elevation: 4,
          }}>
            <LinearGradient
              colors={[COLORS.white, COLORS.background]}
              style={{ borderRadius: 16 }}>
              <Card.Content style={{ padding: SPACING.lg }}>
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: SPACING.md,
                }}>
                  <Text style={[TEXT_STYLES.h2, { color: COLORS.text }]}>
                    Daily Summary
                  </Text>
                  <Chip
                    mode="outlined"
                    style={{
                      backgroundColor: dailyData.consumed.calories >= dailyData.target.calories ? 
                        COLORS.success + '20' : COLORS.warning + '20',
                      borderColor: dailyData.consumed.calories >= dailyData.target.calories ? 
                        COLORS.success : COLORS.warning,
                    }}
                    textStyle={{
                      color: dailyData.consumed.calories >= dailyData.target.calories ? 
                        COLORS.success : COLORS.warning
                    }}>
                    {Math.round((dailyData.consumed.calories / dailyData.target.calories) * 100)}% Complete
                  </Chip>
                </View>

                {/* Calories Progress */}
                <Surface style={{
                  borderRadius: 12,
                  padding: SPACING.md,
                  marginBottom: SPACING.md,
                  backgroundColor: COLORS.primary + '10',
                }}>
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: SPACING.sm,
                  }}>
                    <Text style={[TEXT_STYLES.h3, { color: COLORS.text }]}>
                      🔥 Calories
                    </Text>
                    <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary }]}>
                      {dailyData.consumed.calories} / {dailyData.target.calories}
                    </Text>
                  </View>
                  <ProgressBar
                    progress={getProgressPercentage(dailyData.consumed.calories, dailyData.target.calories)}
                    color={COLORS.primary}
                    style={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: COLORS.primary + '20',
                    }}
                  />
                  <Text style={[TEXT_STYLES.caption, { marginTop: SPACING.xs, textAlign: 'center' }]}>
                    {dailyData.target.calories - dailyData.consumed.calories > 0 
                      ? `${dailyData.target.calories - dailyData.consumed.calories} calories remaining`
                      : 'Daily goal achieved! 🎉'
                    }
                  </Text>
                </Surface>

                {/* Macros Grid */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  {renderMacroProgress('Protein', dailyData.consumed.protein, dailyData.target.protein, '#4CAF50', 'fitness-center')}
                  {renderMacroProgress('Carbs', dailyData.consumed.carbs, dailyData.target.carbs, '#FF9800', 'grain')}
                  {renderMacroProgress('Fat', dailyData.consumed.fat, dailyData.target.fat, '#f44336', 'opacity')}
                </View>
              </Card.Content>
            </LinearGradient>
          </Card>

          {/* Meal Sections */}
          {renderMealSection('breakfast', dailyData.meals.breakfast, '🌅')}
          {renderMealSection('lunch', dailyData.meals.lunch, '☀️')}
          {renderMealSection('dinner', dailyData.meals.dinner, '🌙')}
          {renderMealSection('snacks', dailyData.meals.snacks, '🍎')}

          {/* Bottom Spacing */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </Animated.View>

      {/* Add Food Modal */}
      {renderAddFoodModal()}

      {/* Floating Action Button */}
      <FAB
        style={{
          position: 'absolute',
          margin: SPACING.md,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.primary,
        }}
        icon="add"
        onPress={() => setShowAddModal(true)}
        label="Add Food"
      />
    </View>
  );
};

export default MacroTracking;