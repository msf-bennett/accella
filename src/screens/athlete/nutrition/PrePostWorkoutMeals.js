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
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your established constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const PostWorkoutMeals = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, workoutData, nutritionPreferences } = useSelector(state => state.nutrition);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [workoutIntensity, setWorkoutIntensity] = useState('moderate');
  const [timeWindow, setTimeWindow] = useState('immediate'); // immediate, 1hour, 2hour
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);

  // Mock workout data
  const mockLastWorkout = {
    type: 'Strength Training',
    duration: 75, // minutes
    intensity: 'High',
    caloriesBurned: 450,
    endTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    muscleGroups: ['Chest', 'Triceps', 'Shoulders']
  };

  // Mock post-workout meal recommendations
  const mockMealRecommendations = [
    {
      id: '1',
      name: 'Power Recovery Smoothie',
      category: 'smoothies',
      prepTime: 5,
      calories: 380,
      protein: 35,
      carbs: 45,
      fats: 8,
      difficulty: 'Easy',
      rating: 4.8,
      tags: ['Quick', 'High Protein', 'Recovery'],
      ingredients: [
        '1 banana',
        '1 scoop whey protein',
        '1 cup almond milk',
        '1 tbsp peanut butter',
        '1/2 cup oats',
        'Ice cubes'
      ],
      instructions: [
        'Add all ingredients to blender',
        'Blend on high for 60 seconds',
        'Pour and enjoy immediately'
      ],
      benefits: 'Fast-absorbing proteins for muscle recovery',
      bestTime: 'Within 30 minutes post-workout'
    },
    {
      id: '2',
      name: 'Grilled Chicken & Sweet Potato',
      category: 'meals',
      prepTime: 25,
      calories: 520,
      protein: 45,
      carbs: 38,
      fats: 18,
      difficulty: 'Medium',
      rating: 4.6,
      tags: ['Complete Meal', 'Muscle Building', 'Clean'],
      ingredients: [
        '6oz grilled chicken breast',
        '1 medium sweet potato',
        '1 cup broccoli',
        '1 tbsp olive oil',
        'Herbs and spices'
      ],
      instructions: [
        'Season and grill chicken breast',
        'Roast sweet potato at 400°F for 20 minutes',
        'Steam broccoli until tender',
        'Drizzle with olive oil and serve'
      ],
      benefits: 'Complete amino acid profile with complex carbs',
      bestTime: '30-60 minutes post-workout'
    },
    {
      id: '3',
      name: 'Greek Yogurt Parfait Bowl',
      category: 'bowls',
      prepTime: 10,
      calories: 420,
      protein: 28,
      carbs: 52,
      fats: 12,
      difficulty: 'Easy',
      rating: 4.7,
      tags: ['Probiotics', 'Antioxidants', 'Quick'],
      ingredients: [
        '1 cup Greek yogurt',
        '1/2 cup mixed berries',
        '1/4 cup granola',
        '1 tbsp honey',
        '2 tbsp chopped nuts',
        'Chia seeds'
      ],
      instructions: [
        'Layer yogurt in bowl',
        'Add berries and granola',
        'Drizzle with honey',
        'Top with nuts and chia seeds'
      ],
      benefits: 'Probiotics aid digestion and nutrient absorption',
      bestTime: 'Within 2 hours post-workout'
    },
    {
      id: '4',
      name: 'Tuna & Quinoa Power Bowl',
      category: 'bowls',
      prepTime: 15,
      calories: 485,
      protein: 38,
      carbs: 42,
      fats: 16,
      difficulty: 'Easy',
      rating: 4.5,
      tags: ['Omega-3', 'Complete Protein', 'Anti-inflammatory'],
      ingredients: [
        '1 can tuna in water',
        '3/4 cup cooked quinoa',
        '1 cup mixed vegetables',
        '1/2 avocado',
        'Lemon vinaigrette'
      ],
      instructions: [
        'Cook quinoa according to package',
        'Steam mixed vegetables',
        'Combine tuna with quinoa',
        'Top with avocado and dressing'
      ],
      benefits: 'Omega-3s reduce inflammation and aid recovery',
      bestTime: '1-2 hours post-workout'
    },
    {
      id: '5',
      name: 'Chocolate Recovery Shake',
      category: 'smoothies',
      prepTime: 3,
      calories: 325,
      protein: 30,
      carbs: 35,
      fats: 9,
      difficulty: 'Easy',
      rating: 4.9,
      tags: ['Chocolate', 'Fast Absorption', 'Creatine'],
      ingredients: [
        '1 scoop chocolate whey protein',
        '1 cup chocolate milk',
        '1 banana',
        '1 tsp creatine',
        'Ice'
      ],
      instructions: [
        'Add all ingredients to shaker',
        'Shake vigorously for 30 seconds',
        'Drink immediately'
      ],
      benefits: 'Chocolate milk provides ideal carb-protein ratio',
      bestTime: 'Immediately post-workout'
    },
    {
      id: '6',
      name: 'Salmon & Rice Recovery Plate',
      category: 'meals',
      prepTime: 30,
      calories: 580,
      protein: 42,
      carbs: 48,
      fats: 22,
      difficulty: 'Medium',
      rating: 4.8,
      tags: ['Omega-3', 'Complete Meal', 'Heart Healthy'],
      ingredients: [
        '6oz salmon fillet',
        '3/4 cup jasmine rice',
        '1 cup asparagus',
        '1 tbsp sesame oil',
        'Ginger and garlic'
      ],
      instructions: [
        'Season salmon with ginger and garlic',
        'Pan-sear salmon 4-5 minutes per side',
        'Cook rice according to package',
        'Sauté asparagus with sesame oil'
      ],
      benefits: 'High-quality protein with anti-inflammatory fats',
      bestTime: '1-2 hours post-workout'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Meals', icon: 'restaurant' },
    { id: 'smoothies', name: 'Smoothies', icon: 'local-drink' },
    { id: 'meals', name: 'Full Meals', icon: 'dinner-dining' },
    { id: 'bowls', name: 'Power Bowls', icon: 'rice-bowl' },
  ];

  const intensityLevels = [
    { id: 'light', name: 'Light', color: COLORS.success, multiplier: 0.8 },
    { id: 'moderate', name: 'Moderate', color: COLORS.warning, multiplier: 1.0 },
    { id: 'high', name: 'High', color: COLORS.error, multiplier: 1.2 },
    { id: 'intense', name: 'Intense', color: COLORS.primary, multiplier: 1.4 }
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
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Vibration.vibrate(50);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // dispatch(fetchPostWorkoutMeals());
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh meal recommendations');
    }
    
    setRefreshing(false);
  }, [dispatch]);

  const filteredMeals = mockMealRecommendations.filter(meal => {
    const matchesCategory = selectedCategory === 'all' || meal.category === selectedCategory;
    const matchesSearch = meal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         meal.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const toggleFavorite = (recipeId) => {
    Vibration.vibrate(50);
    setFavoriteRecipes(prev => 
      prev.includes(recipeId) 
        ? prev.filter(id => id !== recipeId)
        : [...prev, recipeId]
    );
  };

  const openRecipeModal = (recipe) => {
    setSelectedRecipe(recipe);
    setShowRecipeModal(true);
  };

  const trackMeal = (recipe) => {
    Vibration.vibrate(50);
    Alert.alert(
      '🍽️ Track Meal',
      `Track "${recipe.name}" to your nutrition log?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Track It!', 
          onPress: () => Alert.alert('Success!', 'Meal tracking feature coming soon!') 
        }
      ]
    );
  };

  const renderWorkoutSummary = () => (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{
          margin: SPACING.md,
          borderRadius: 16,
          padding: SPACING.lg,
          elevation: 8,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md }}>
          <Text style={[TEXT_STYLES.h3, { color: 'white', fontWeight: 'bold' }]}>
            Last Workout 🏋️‍♂️
          </Text>
          <Chip
            mode="outlined"
            textStyle={{ color: 'white', fontSize: 11 }}
            style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderColor: 'white' }}
          >
            {Math.round((Date.now() - mockLastWorkout.endTime) / 60000)}m ago
          </Chip>
        </View>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm }}>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Icon name="fitness-center" size={24} color="white" />
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16, marginTop: SPACING.xs }}>
              {mockLastWorkout.type}
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
              {mockLastWorkout.duration} minutes
            </Text>
          </View>
          
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Icon name="whatshot" size={24} color="white" />
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16, marginTop: SPACING.xs }}>
              {mockLastWorkout.caloriesBurned}
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
              calories burned
            </Text>
          </View>
          
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Icon name="speed" size={24} color="white" />
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16, marginTop: SPACING.xs }}>
              {mockLastWorkout.intensity}
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
              intensity
            </Text>
          </View>
        </View>
        
        <Text style={{ color: 'rgba(255,255,255,0.9)', textAlign: 'center', fontSize: 12 }}>
          Targeted: {mockLastWorkout.muscleGroups.join(', ')}
        </Text>
      </LinearGradient>
    </Animated.View>
  );

  const renderRecoveryWindow = () => (
    <Card style={{ margin: SPACING.md, elevation: 4 }}>
      <Card.Content style={{ padding: SPACING.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
          <Icon name="schedule" size={24} color={COLORS.primary} />
          <Text style={[TEXT_STYLES.h3, { marginLeft: SPACING.sm, flex: 1 }]}>
            Recovery Window ⏰
          </Text>
        </View>
        
        <Text style={{ color: COLORS.textSecondary, marginBottom: SPACING.md, fontSize: 14 }}>
          Optimize your recovery by eating the right nutrients at the right time
        </Text>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {[
            { time: '0-30min', label: 'Critical', color: COLORS.error, current: true },
            { time: '30-60min', label: 'Optimal', color: COLORS.warning, current: false },
            { time: '1-2hrs', label: 'Good', color: COLORS.success, current: false },
          ].map((window) => (
            <View key={window.time} style={{ alignItems: 'center', flex: 1 }}>
              <Surface style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: window.current ? window.color + '20' : COLORS.surface,
                borderWidth: window.current ? 2 : 0,
                borderColor: window.color
              }}>
                <Text style={{ 
                  color: window.current ? window.color : COLORS.textSecondary, 
                  fontWeight: window.current ? 'bold' : 'normal',
                  fontSize: 10
                }}>
                  {window.time}
                </Text>
              </Surface>
              <Text style={{ 
                marginTop: SPACING.xs, 
                fontSize: 11, 
                color: window.current ? window.color : COLORS.textSecondary,
                fontWeight: window.current ? 'bold' : 'normal'
              }}>
                {window.label}
              </Text>
            </View>
          ))}
        </View>
        
        <Text style={{ 
          textAlign: 'center', 
          fontSize: 12, 
          color: COLORS.textSecondary, 
          marginTop: SPACING.md,
          fontStyle: 'italic'
        }}>
          💡 Consume protein + carbs within 30 minutes for best results
        </Text>
      </Card.Content>
    </Card>
  );

  const renderCategoryTabs = () => (
    <View style={{ paddingHorizontal: SPACING.md, marginBottom: SPACING.md }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', paddingHorizontal: SPACING.sm }}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => {
                setSelectedCategory(category.id);
                Vibration.vibrate(50);
              }}
              style={{ marginRight: SPACING.md }}
            >
              <Surface style={{
                paddingHorizontal: SPACING.lg,
                paddingVertical: SPACING.md,
                borderRadius: 20,
                backgroundColor: selectedCategory === category.id ? COLORS.primary : COLORS.surface,
                elevation: selectedCategory === category.id ? 4 : 2,
                flexDirection: 'row',
                alignItems: 'center'
              }}>
                <Icon 
                  name={category.icon} 
                  size={16} 
                  color={selectedCategory === category.id ? 'white' : COLORS.textSecondary} 
                />
                <Text style={{
                  marginLeft: SPACING.xs,
                  color: selectedCategory === category.id ? 'white' : COLORS.textSecondary,
                  fontWeight: selectedCategory === category.id ? 'bold' : 'normal',
                  fontSize: 12
                }}>
                  {category.name}
                </Text>
              </Surface>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const renderMealCard = ({ item: meal }) => (
    <Card style={{ 
      margin: SPACING.md, 
      elevation: 4,
      borderRadius: 16,
      overflow: 'hidden'
    }}>
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: SPACING.md,
        backgroundColor: COLORS.primary + '10'
      }}>
        <View style={{ flex: 1 }}>
          <Text style={[TEXT_STYLES.subtitle, { fontWeight: 'bold', color: COLORS.textPrimary }]}>
            {meal.name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: SPACING.xs }}>
            <Icon name="schedule" size={14} color={COLORS.textSecondary} />
            <Text style={{ color: COLORS.textSecondary, fontSize: 12, marginLeft: SPACING.xs }}>
              {meal.prepTime} min • {meal.difficulty}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: SPACING.md }}>
              <Icon name="star" size={14} color={COLORS.warning} />
              <Text style={{ color: COLORS.textSecondary, fontSize: 12, marginLeft: 2 }}>
                {meal.rating}
              </Text>
            </View>
          </View>
        </View>
        
        <IconButton
          icon={favoriteRecipes.includes(meal.id) ? "favorite" : "favorite-border"}
          iconColor={favoriteRecipes.includes(meal.id) ? COLORS.error : COLORS.textSecondary}
          size={24}
          onPress={() => toggleFavorite(meal.id)}
        />
      </View>
      
      <Card.Content style={{ padding: SPACING.lg }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.md }}>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={{ fontWeight: 'bold', color: COLORS.textPrimary }}>{meal.calories}</Text>
            <Text style={{ fontSize: 11, color: COLORS.textSecondary }}>kcal</Text>
          </View>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={{ fontWeight: 'bold', color: COLORS.primary }}>{meal.protein}g</Text>
            <Text style={{ fontSize: 11, color: COLORS.textSecondary }}>protein</Text>
          </View>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={{ fontWeight: 'bold', color: COLORS.success }}>{meal.carbs}g</Text>
            <Text style={{ fontSize: 11, color: COLORS.textSecondary }}>carbs</Text>
          </View>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={{ fontWeight: 'bold', color: COLORS.warning }}>{meal.fats}g</Text>
            <Text style={{ fontSize: 11, color: COLORS.textSecondary }}>fats</Text>
          </View>
        </View>
        
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.md }}>
          {meal.tags.map((tag) => (
            <Chip
              key={tag}
              compact
              style={{ 
                margin: 2, 
                backgroundColor: COLORS.primary + '15',
                height: 24
              }}
              textStyle={{ fontSize: 10, color: COLORS.primary }}
            >
              {tag}
            </Chip>
          ))}
        </View>
        
        <Text style={{ 
          fontSize: 12, 
          color: COLORS.textSecondary, 
          marginBottom: SPACING.md,
          fontStyle: 'italic'
        }}>
          💡 {meal.benefits}
        </Text>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Button
            mode="outlined"
            onPress={() => openRecipeModal(meal)}
            style={{ flex: 1, marginRight: SPACING.sm }}
            labelStyle={{ fontSize: 12 }}
            icon="menu-book"
          >
            Recipe
          </Button>
          <Button
            mode="contained"
            onPress={() => trackMeal(meal)}
            style={{ flex: 1, marginLeft: SPACING.sm }}
            labelStyle={{ fontSize: 12 }}
            icon="add"
          >
            Track Meal
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const renderRecipeModal = () => (
    <Portal>
      <Modal
        visible={showRecipeModal}
        onDismiss={() => setShowRecipeModal(false)}
        contentContainerStyle={{
          backgroundColor: COLORS.background,
          margin: SPACING.lg,
          borderRadius: 16,
          maxHeight: height * 0.8,
        }}
      >
        {selectedRecipe && (
          <ScrollView style={{ maxHeight: height * 0.7 }}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.primary + '80']}
              style={{ padding: SPACING.lg, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[TEXT_STYLES.h3, { color: 'white', fontWeight: 'bold', flex: 1 }]}>
                  {selectedRecipe.name}
                </Text>
                <IconButton
                  icon="close"
                  iconColor="white"
                  onPress={() => setShowRecipeModal(false)}
                />
              </View>
              <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>
                {selectedRecipe.bestTime}
              </Text>
            </LinearGradient>
            
            <View style={{ padding: SPACING.lg }}>
              <Text style={[TEXT_STYLES.subtitle, { fontWeight: 'bold', marginBottom: SPACING.md }]}>
                Ingredients 🥘
              </Text>
              {selectedRecipe.ingredients.map((ingredient, index) => (
                <Text key={index} style={{ 
                  fontSize: 14, 
                  color: COLORS.textSecondary, 
                  marginBottom: SPACING.xs,
                  paddingLeft: SPACING.md 
                }}>
                  • {ingredient}
                </Text>
              ))}
              
              <Text style={[TEXT_STYLES.subtitle, { fontWeight: 'bold', marginTop: SPACING.lg, marginBottom: SPACING.md }]}>
                Instructions 👩‍🍳
              </Text>
              {selectedRecipe.instructions.map((step, index) => (
                <View key={index} style={{ 
                  flexDirection: 'row', 
                  marginBottom: SPACING.md,
                  paddingLeft: SPACING.md 
                }}>
                  <Surface style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: COLORS.primary,
                    marginRight: SPACING.md
                  }}>
                    <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                      {index + 1}
                    </Text>
                  </Surface>
                  <Text style={{ 
                    flex: 1, 
                    fontSize: 14, 
                    color: COLORS.textSecondary,
                    lineHeight: 20 
                  }}>
                    {step}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        )}
      </Modal>
    </Portal>
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
            title="Pull to refresh meal recommendations..."
            titleColor={COLORS.textSecondary}
          />
        }
      >
        {renderWorkoutSummary()}
        {renderRecoveryWindow()}
        
        <View style={{ paddingHorizontal: SPACING.md, marginBottom: SPACING.md }}>
          <Searchbar
            placeholder="Search meals, ingredients, or tags..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={{ elevation: 2 }}
            inputStyle={{ fontSize: 14 }}
            icon="search"
          />
        </View>
        
        {renderCategoryTabs()}
        
        <FlatList
          data={filteredMeals}
          renderItem={renderMealCard}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        />
        
        {/* Bottom spacing for FAB */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {renderRecipeModal()}

      <FAB
        icon="restaurant-menu"
        label="Meal Planner"
        onPress={() => Alert.alert('🍽️ Meal Planner', 'AI meal planning feature coming soon! Get personalized post-workout meal plans.')}
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

export default PostWorkoutMeals;