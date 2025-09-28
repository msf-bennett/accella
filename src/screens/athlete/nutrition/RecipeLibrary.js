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
  Image,
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
  SegmentedButtons,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your established constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const RecipeLibrary = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, favoriteRecipes, customRecipes } = useSelector(state => state.nutrition);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [favoritesList, setFavoritesList] = useState([]);
  const [sortBy, setSortBy] = useState('popular');
  const [filters, setFilters] = useState({
    difficulty: 'all',
    prepTime: 'all',
    mealType: 'all',
    dietaryRestrictions: []
  });

  // Mock recipe database
  const mockRecipes = [
    {
      id: '1',
      name: 'Power Protein Pancakes',
      category: 'breakfast',
      image: 'https://example.com/pancakes.jpg',
      prepTime: 15,
      cookTime: 10,
      servings: 2,
      difficulty: 'Easy',
      calories: 420,
      protein: 35,
      carbs: 38,
      fats: 12,
      fiber: 8,
      rating: 4.8,
      reviews: 234,
      tags: ['High Protein', 'Gluten Free', 'Breakfast', 'Pre-Workout'],
      dietaryInfo: ['Gluten Free', 'High Protein'],
      author: 'Chef Mike',
      createdDate: '2024-01-15',
      ingredients: [
        '1 cup oat flour',
        '1 scoop vanilla protein powder',
        '2 large eggs',
        '1/2 cup Greek yogurt',
        '1 banana, mashed',
        '1/4 cup almond milk',
        '1 tsp baking powder',
        '1/2 tsp vanilla extract',
        'Pinch of salt',
        'Blueberries for topping'
      ],
      instructions: [
        'Mix dry ingredients in a large bowl',
        'Whisk wet ingredients in separate bowl',
        'Combine wet and dry ingredients until smooth',
        'Heat pan over medium heat with cooking spray',
        'Pour 1/4 cup batter per pancake',
        'Cook 2-3 minutes until bubbles form',
        'Flip and cook 1-2 minutes more',
        'Serve hot with blueberries'
      ],
      nutritionFacts: {
        calories: 420,
        protein: 35,
        carbs: 38,
        fats: 12,
        fiber: 8,
        sugar: 15,
        sodium: 380
      },
      tips: 'Let batter rest for 5 minutes for fluffier pancakes'
    },
    {
      id: '2',
      name: 'Recovery Buddha Bowl',
      category: 'lunch',
      image: 'https://example.com/buddha-bowl.jpg',
      prepTime: 20,
      cookTime: 25,
      servings: 1,
      difficulty: 'Medium',
      calories: 580,
      protein: 32,
      carbs: 62,
      fats: 18,
      fiber: 14,
      rating: 4.6,
      reviews: 189,
      tags: ['Post-Workout', 'Vegan', 'Complete Meal', 'Anti-inflammatory'],
      dietaryInfo: ['Vegan', 'Gluten Free'],
      author: 'Nutritionist Sarah',
      createdDate: '2024-01-10',
      ingredients: [
        '3/4 cup quinoa',
        '1 cup roasted sweet potato cubes',
        '1/2 cup edamame',
        '1 cup massaged kale',
        '1/4 avocado, sliced',
        '2 tbsp hemp seeds',
        '1/4 cup shredded carrots',
        '2 tbsp tahini',
        '1 tbsp lemon juice',
        '1 tsp maple syrup',
        '1 clove garlic, minced'
      ],
      instructions: [
        'Cook quinoa according to package directions',
        'Roast sweet potato at 400°F for 20 minutes',
        'Massage kale with a pinch of salt',
        'Steam edamame for 3-4 minutes',
        'Make dressing by whisking tahini, lemon juice, maple syrup, and garlic',
        'Arrange all ingredients in bowl',
        'Drizzle with dressing and sprinkle hemp seeds'
      ],
      nutritionFacts: {
        calories: 580,
        protein: 32,
        carbs: 62,
        fats: 18,
        fiber: 14,
        sugar: 22,
        sodium: 320
      },
      tips: 'Prep ingredients ahead for quick assembly during the week'
    },
    {
      id: '3',
      name: 'Chocolate Recovery Smoothie',
      category: 'smoothies',
      image: 'https://example.com/chocolate-smoothie.jpg',
      prepTime: 5,
      cookTime: 0,
      servings: 1,
      difficulty: 'Easy',
      calories: 380,
      protein: 28,
      carbs: 42,
      fats: 11,
      fiber: 6,
      rating: 4.9,
      reviews: 456,
      tags: ['Post-Workout', 'Quick', 'Chocolate', 'High Protein'],
      dietaryInfo: ['Vegetarian'],
      author: 'Fitness Coach Alex',
      createdDate: '2024-01-20',
      ingredients: [
        '1 scoop chocolate protein powder',
        '1 frozen banana',
        '1 cup chocolate almond milk',
        '1 tbsp almond butter',
        '1 tbsp cocoa powder',
        '1/2 cup ice',
        '1 tsp vanilla extract',
        '1 date, pitted (optional for sweetness)'
      ],
      instructions: [
        'Add all ingredients to blender',
        'Blend on high for 60-90 seconds',
        'Add more liquid if needed for desired consistency',
        'Pour into glass and enjoy immediately'
      ],
      nutritionFacts: {
        calories: 380,
        protein: 28,
        carbs: 42,
        fats: 11,
        fiber: 6,
        sugar: 28,
        sodium: 280
      },
      tips: 'Use frozen banana for creamier texture'
    },
    {
      id: '4',
      name: 'Grilled Salmon Power Plate',
      category: 'dinner',
      image: 'https://example.com/salmon-plate.jpg',
      prepTime: 15,
      cookTime: 20,
      servings: 1,
      difficulty: 'Medium',
      calories: 650,
      protein: 48,
      carbs: 35,
      fats: 28,
      fiber: 8,
      rating: 4.7,
      reviews: 312,
      tags: ['Omega-3', 'Complete Meal', 'Heart Healthy', 'Anti-inflammatory'],
      dietaryInfo: ['Pescatarian', 'Keto Friendly'],
      author: 'Chef Marina',
      createdDate: '2024-01-08',
      ingredients: [
        '6 oz salmon fillet',
        '1 cup asparagus spears',
        '1/2 cup wild rice',
        '1 tbsp olive oil',
        '1 lemon, sliced',
        '2 cloves garlic, minced',
        '1 tsp dried herbs (thyme, rosemary)',
        'Salt and pepper to taste',
        '1 tbsp pine nuts'
      ],
      instructions: [
        'Season salmon with herbs, salt, and pepper',
        'Cook wild rice according to package directions',
        'Grill salmon 4-5 minutes per side',
        'Sauté asparagus with garlic and olive oil',
        'Plate rice, top with salmon and asparagus',
        'Garnish with lemon slices and pine nuts'
      ],
      nutritionFacts: {
        calories: 650,
        protein: 48,
        carbs: 35,
        fats: 28,
        fiber: 8,
        sugar: 6,
        sodium: 420
      },
      tips: 'Don\'t overcook salmon - aim for medium doneness'
    },
    {
      id: '5',
      name: 'Energy Bite Protein Balls',
      category: 'snacks',
      image: 'https://example.com/protein-balls.jpg',
      prepTime: 15,
      cookTime: 0,
      servings: 12,
      difficulty: 'Easy',
      calories: 120,
      protein: 6,
      carbs: 14,
      fats: 5,
      fiber: 3,
      rating: 4.5,
      reviews: 189,
      tags: ['No-Bake', 'Portable', 'Pre-Workout', 'Natural Sugars'],
      dietaryInfo: ['Vegan', 'Gluten Free'],
      author: 'Wellness Coach Jamie',
      createdDate: '2024-01-12',
      ingredients: [
        '1 cup rolled oats',
        '1/2 cup vanilla protein powder',
        '1/3 cup ground flaxseed',
        '1/3 cup honey',
        '1/3 cup natural peanut butter',
        '1/3 cup mini dark chocolate chips',
        '1 tsp vanilla extract',
        '2 tbsp chia seeds'
      ],
      instructions: [
        'Mix all dry ingredients in large bowl',
        'Stir in honey, peanut butter, and vanilla',
        'Mix until well combined',
        'Chill mixture for 30 minutes',
        'Roll into 12 balls using hands or scoop',
        'Store in refrigerator for up to 1 week'
      ],
      nutritionFacts: {
        calories: 120,
        protein: 6,
        carbs: 14,
        fats: 5,
        fiber: 3,
        sugar: 8,
        sodium: 45
      },
      tips: 'Wet hands slightly when rolling to prevent sticking'
    },
    {
      id: '6',
      name: 'Mediterranean Chicken Bowl',
      category: 'lunch',
      image: 'https://example.com/med-bowl.jpg',
      prepTime: 25,
      cookTime: 15,
      servings: 1,
      difficulty: 'Medium',
      calories: 520,
      protein: 42,
      carbs: 28,
      fats: 22,
      fiber: 7,
      rating: 4.8,
      reviews: 267,
      tags: ['Mediterranean', 'Complete Meal', 'Heart Healthy', 'Fresh'],
      dietaryInfo: ['Gluten Free'],
      author: 'Chef Antonio',
      createdDate: '2024-01-18',
      ingredients: [
        '5 oz grilled chicken breast',
        '1/2 cup cooked quinoa',
        '1/4 cup cucumber, diced',
        '1/4 cup cherry tomatoes, halved',
        '2 tbsp red onion, diced',
        '2 tbsp kalamata olives',
        '2 tbsp feta cheese',
        '2 tbsp tzatziki sauce',
        '1 tbsp olive oil',
        'Fresh herbs (parsley, dill)'
      ],
      instructions: [
        'Season and grill chicken breast until cooked through',
        'Cook quinoa according to package directions',
        'Dice cucumber, tomatoes, and red onion',
        'Arrange quinoa in bowl as base',
        'Top with sliced chicken and vegetables',
        'Add olives and crumbled feta',
        'Drizzle with tzatziki and olive oil',
        'Garnish with fresh herbs'
      ],
      nutritionFacts: {
        calories: 520,
        protein: 42,
        carbs: 28,
        fats: 22,
        fiber: 7,
        sugar: 8,
        sodium: 680
      },
      tips: 'Marinate chicken in lemon juice and herbs for extra flavor'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Recipes', icon: 'restaurant', color: COLORS.primary },
    { id: 'breakfast', name: 'Breakfast', icon: 'free-breakfast', color: COLORS.warning },
    { id: 'lunch', name: 'Lunch', icon: 'lunch-dining', color: COLORS.success },
    { id: 'dinner', name: 'Dinner', icon: 'dinner-dining', color: COLORS.info },
    { id: 'snacks', name: 'Snacks', icon: 'cookie', color: COLORS.error },
    { id: 'smoothies', name: 'Smoothies', icon: 'local-drink', color: COLORS.secondary },
  ];

  const sortOptions = [
    { id: 'popular', name: 'Most Popular', icon: 'star' },
    { id: 'newest', name: 'Newest', icon: 'new-releases' },
    { id: 'quickest', name: 'Quickest', icon: 'speed' },
    { id: 'rating', name: 'Highest Rated', icon: 'thumb-up' },
    { id: 'protein', name: 'High Protein', icon: 'fitness-center' },
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
      // dispatch(fetchRecipes());
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh recipe library');
    }
    
    setRefreshing(false);
  }, [dispatch]);

  const filteredAndSortedRecipes = mockRecipes
    .filter(recipe => {
      const matchesCategory = selectedCategory === 'all' || recipe.category === selectedCategory;
      const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           recipe.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
                           recipe.ingredients.some(ingredient => ingredient.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.reviews - a.reviews;
        case 'newest':
          return new Date(b.createdDate) - new Date(a.createdDate);
        case 'quickest':
          return (a.prepTime + a.cookTime) - (b.prepTime + b.cookTime);
        case 'rating':
          return b.rating - a.rating;
        case 'protein':
          return b.protein - a.protein;
        default:
          return 0;
      }
    });

  const toggleFavorite = (recipeId) => {
    Vibration.vibrate(50);
    setFavoritesList(prev => 
      prev.includes(recipeId) 
        ? prev.filter(id => id !== recipeId)
        : [...prev, recipeId]
    );
  };

  const openRecipeModal = (recipe) => {
    setSelectedRecipe(recipe);
    setShowRecipeModal(true);
  };

  const shareRecipe = (recipe) => {
    Alert.alert(
      '📤 Share Recipe',
      `Share "${recipe.name}" with your team or social media?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Share', onPress: () => Alert.alert('Success!', 'Recipe sharing feature coming soon!') }
      ]
    );
  };

  const addToMealPlan = (recipe) => {
    Vibration.vibrate(50);
    Alert.alert(
      '📅 Add to Meal Plan',
      `Add "${recipe.name}" to your weekly meal plan?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Add', onPress: () => Alert.alert('Success!', 'Meal planning feature coming soon!') }
      ]
    );
  };

  const renderHeader = () => (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{
          paddingTop: 50,
          paddingBottom: SPACING.lg,
          paddingHorizontal: SPACING.lg,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md }}>
          <Text style={[TEXT_STYLES.h2, { color: 'white', fontWeight: 'bold' }]}>
            Recipe Library 📚
          </Text>
          <View style={{ flexDirection: 'row' }}>
            <IconButton
              icon={viewMode === 'grid' ? 'view-list' : 'view-module'}
              iconColor="white"
              onPress={() => {
                setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
                Vibration.vibrate(50);
              }}
            />
            <IconButton
              icon="tune"
              iconColor="white"
              onPress={() => setShowFilterModal(true)}
            />
          </View>
        </View>
        
        <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14, marginBottom: SPACING.lg }}>
          Discover nutrition-focused recipes crafted for athletes 🥗
        </Text>
        
        <Searchbar
          placeholder="Search recipes, ingredients, or dietary needs..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={{ elevation: 2, backgroundColor: 'rgba(255,255,255,0.95)' }}
          inputStyle={{ fontSize: 14 }}
          icon="search"
        />
      </LinearGradient>
    </Animated.View>
  );

  const renderCategoryTabs = () => (
    <View style={{ paddingVertical: SPACING.md }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', paddingHorizontal: SPACING.md }}>
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
                borderRadius: 25,
                backgroundColor: selectedCategory === category.id ? category.color : COLORS.surface,
                elevation: selectedCategory === category.id ? 4 : 2,
                flexDirection: 'row',
                alignItems: 'center',
                minWidth: 100
              }}>
                <Icon 
                  name={category.icon} 
                  size={18} 
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

  const renderSortBar = () => (
    <View style={{ 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
      backgroundColor: COLORS.surface,
      elevation: 1
    }}>
      <Text style={{ color: COLORS.textSecondary, fontSize: 14 }}>
        {filteredAndSortedRecipes.length} recipes found
      </Text>
      <TouchableOpacity
        onPress={() => Alert.alert('Sort Options', 'Advanced sorting coming soon!')}
        style={{ flexDirection: 'row', alignItems: 'center' }}
      >
        <Icon name="sort" size={16} color={COLORS.textSecondary} />
        <Text style={{ color: COLORS.textSecondary, fontSize: 12, marginLeft: SPACING.xs }}>
          {sortOptions.find(opt => opt.id === sortBy)?.name}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderRecipeCard = ({ item: recipe, index }) => {
    const isGrid = viewMode === 'grid';
    const cardWidth = isGrid ? (width / 2) - (SPACING.lg * 1.5) : width - (SPACING.lg * 2);
    
    return (
      <TouchableOpacity onPress={() => openRecipeModal(recipe)}>
        <Card style={{ 
          width: cardWidth,
          margin: SPACING.sm,
          elevation: 4,
          borderRadius: 12,
          overflow: 'hidden'
        }}>
          <View style={{ 
            height: isGrid ? 120 : 80,
            backgroundColor: COLORS.primary + '20',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative'
          }}>
            <Icon name="restaurant" size={isGrid ? 40 : 30} color={COLORS.primary} />
            <View style={{
              position: 'absolute',
              top: SPACING.sm,
              right: SPACING.sm,
              flexDirection: 'row'
            }}>
              <Surface style={{
                borderRadius: 15,
                paddingHorizontal: SPACING.sm,
                paddingVertical: 2,
                backgroundColor: 'rgba(255,255,255,0.9)',
                marginRight: SPACING.xs
              }}>
                <Text style={{ fontSize: 10, color: COLORS.textPrimary, fontWeight: 'bold' }}>
                  {recipe.prepTime + recipe.cookTime}min
                </Text>
              </Surface>
              <IconButton
                icon={favoritesList.includes(recipe.id) ? "favorite" : "favorite-border"}
                iconColor={favoritesList.includes(recipe.id) ? COLORS.error : COLORS.textSecondary}
                size={20}
                onPress={() => toggleFavorite(recipe.id)}
                style={{ margin: 0, backgroundColor: 'rgba(255,255,255,0.9)' }}
              />
            </View>
          </View>
          
          <Card.Content style={{ padding: SPACING.md }}>
            <Text style={[TEXT_STYLES.subtitle, { fontWeight: 'bold', marginBottom: SPACING.xs }]} numberOfLines={1}>
              {recipe.name}
            </Text>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
              <Icon name="person" size={14} color={COLORS.textSecondary} />
              <Text style={{ fontSize: 11, color: COLORS.textSecondary, marginLeft: 4, marginRight: SPACING.md }}>
                {recipe.author}
              </Text>
              <Icon name="star" size={14} color={COLORS.warning} />
              <Text style={{ fontSize: 11, color: COLORS.textSecondary, marginLeft: 2 }}>
                {recipe.rating} ({recipe.reviews})
              </Text>
            </View>
            
            {!isGrid && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 12, color: COLORS.textPrimary }}>{recipe.calories}</Text>
                  <Text style={{ fontSize: 9, color: COLORS.textSecondary }}>kcal</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 12, color: COLORS.primary }}>{recipe.protein}g</Text>
                  <Text style={{ fontSize: 9, color: COLORS.textSecondary }}>protein</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 12, color: COLORS.success }}>{recipe.carbs}g</Text>
                  <Text style={{ fontSize: 9, color: COLORS.textSecondary }}>carbs</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 12, color: COLORS.warning }}>{recipe.fats}g</Text>
                  <Text style={{ fontSize: 9, color: COLORS.textSecondary }}>fats</Text>
                </View>
              </View>
            )}
            
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.sm }}>
              {recipe.tags.slice(0, isGrid ? 2 : 3).map((tag) => (
                <Chip
                  key={tag}
                  compact
                  style={{ 
                    margin: 1, 
                    backgroundColor: COLORS.primary + '15',
                    height: 20
                  }}
                  textStyle={{ fontSize: 8, color: COLORS.primary }}
                >
                  {tag}
                </Chip>
              ))}
            </View>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Button
                mode="outlined"
                onPress={() => addToMealPlan(recipe)}
                style={{ flex: 1, marginRight: SPACING.xs }}
                labelStyle={{ fontSize: 10 }}
                icon="calendar-plus"
                compact
              >
                Add to Plan
              </Button>
              <Button
                mode="contained"
                onPress={() => shareRecipe(recipe)}
                style={{ flex: 1, marginLeft: SPACING.xs }}
                labelStyle={{ fontSize: 10 }}
                icon="share"
                compact
              >
                Share
              </Button>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderRecipeModal = () => (
    <Portal>
      <Modal
        visible={showRecipeModal}
        onDismiss={() => setShowRecipeModal(false)}
        contentContainerStyle={{
          backgroundColor: COLORS.background,
          margin: SPACING.md,
          borderRadius: 16,
          maxHeight: height * 0.85,
        }}
      >
        {selectedRecipe && (
          <ScrollView style={{ maxHeight: height * 0.8 }}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.primary + '80']}
              style={{ padding: SPACING.lg, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={[TEXT_STYLES.h3, { color: 'white', fontWeight: 'bold' }]}>
                    {selectedRecipe.name}
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14, marginTop: SPACING.xs }}>
                    By {selectedRecipe.author}
                  </Text>
                </View>
                <IconButton
                  icon="close"
                  iconColor="white"
                  onPress={() => setShowRecipeModal(false)}
                />
              </View>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: SPACING.lg }}>
                <View style={{ alignItems: 'center' }}>
                  <Icon name="schedule" size={20} color="white" />
                  <Text style={{ color: 'white', fontSize: 12, marginTop: 4 }}>
                    {selectedRecipe.prepTime + selectedRecipe.cookTime} min
                  </Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Icon name="restaurant" size={20} color="white" />
                  <Text style={{ color: 'white', fontSize: 12, marginTop: 4 }}>
                    {selectedRecipe.servings} serving{selectedRecipe.servings > 1 ? 's' : ''}
                  </Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Icon name="bar-chart" size={20} color="white" />
                  <Text style={{ color: 'white', fontSize: 12, marginTop: 4 }}>
                    {selectedRecipe.difficulty}
                  </Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Icon name="star" size={20} color="white" />
                  <Text style={{ color: 'white', fontSize: 12, marginTop: 4 }}>
                    {selectedRecipe.rating} ★
                  </Text>
                </View>
              </View>
            </LinearGradient>
            
            {/* Nutrition Facts */}
            <View style={{ padding: SPACING.lg, backgroundColor: COLORS.primary + '10' }}>
              <Text style={[TEXT_STYLES.subtitle, { fontWeight: 'bold', marginBottom: SPACING.md, textAlign: 'center' }]}>
                Nutrition per serving 📊
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 18, color: COLORS.textPrimary }}>{selectedRecipe.calories}</Text>
                  <Text style={{ fontSize: 11, color: COLORS.textSecondary }}>calories</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 18, color: COLORS.primary }}>{selectedRecipe.protein}g</Text>
                  <Text style={{ fontSize: 11, color: COLORS.textSecondary }}>protein</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 18, color: COLORS.success }}>{selectedRecipe.carbs}g</Text>
                  <Text style={{ fontSize: 11, color: COLORS.textSecondary }}>carbs</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 18, color: COLORS.warning }}>{selectedRecipe.fats}g</Text>
                  <Text style={{ fontSize: 11, color: COLORS.textSecondary }}>fats</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 18, color: COLORS.info }}>{selectedRecipe.fiber}g</Text>
                  <Text style={{ fontSize: 11, color: COLORS.textSecondary }}>fiber</Text>
                </View>
              </View>
            </View>
            
            {/* Dietary Info & Tags */}
            <View style={{ padding: SPACING.lg }}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.lg }}>
                {selectedRecipe.dietaryInfo.map((info) => (
                  <Chip
                    key={info}
                    style={{ 
                      margin: 2, 
                      backgroundColor: COLORS.success + '20',
                    }}
                    textStyle={{ fontSize: 11, color: COLORS.success }}
                    icon="check-circle"
                  >
                    {info}
                  </Chip>
                ))}
                {selectedRecipe.tags.map((tag) => (
                  <Chip
                    key={tag}
                    style={{ 
                      margin: 2, 
                      backgroundColor: COLORS.primary + '15',
                    }}
                    textStyle={{ fontSize: 11, color: COLORS.primary }}
                  >
                    {tag}
                  </Chip>
                ))}
              </View>
              
              {/* Ingredients */}
              <Text style={[TEXT_STYLES.subtitle, { fontWeight: 'bold', marginBottom: SPACING.md }]}>
                Ingredients 🛒
              </Text>
              {selectedRecipe.ingredients.map((ingredient, index) => (
                <View key={index} style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center',
                  paddingVertical: SPACING.xs,
                  paddingLeft: SPACING.md 
                }}>
                  <Icon name="fiber-manual-record" size={6} color={COLORS.primary} />
                  <Text style={{ 
                    fontSize: 14, 
                    color: COLORS.textSecondary, 
                    marginLeft: SPACING.sm,
                    flex: 1
                  }}>
                    {ingredient}
                  </Text>
                </View>
              ))}
              
              {/* Instructions */}
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
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: COLORS.primary,
                    marginRight: SPACING.md,
                    marginTop: 2
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
              
              {/* Pro Tips */}
              {selectedRecipe.tips && (
                <View style={{
                  backgroundColor: COLORS.warning + '10',
                  padding: SPACING.md,
                  borderRadius: 12,
                  marginTop: SPACING.lg,
                  borderLeftWidth: 4,
                  borderLeftColor: COLORS.warning
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs }}>
                    <Icon name="lightbulb" size={18} color={COLORS.warning} />
                    <Text style={[TEXT_STYLES.subtitle, { fontWeight: 'bold', marginLeft: SPACING.sm }]}>
                      Pro Tip 💡
                    </Text>
                  </View>
                  <Text style={{ color: COLORS.textSecondary, fontSize: 14 }}>
                    {selectedRecipe.tips}
                  </Text>
                </View>
              )}
              
              {/* Action Buttons */}
              <View style={{ flexDirection: 'row', marginTop: SPACING.xl, gap: SPACING.sm }}>
                <Button
                  mode="outlined"
                  onPress={() => addToMealPlan(selectedRecipe)}
                  style={{ flex: 1 }}
                  icon="calendar-plus"
                >
                  Add to Plan
                </Button>
                <Button
                  mode="contained"
                  onPress={() => {
                    Alert.alert('🛒 Shopping List', 'Generate shopping list feature coming soon!');
                  }}
                  style={{ flex: 1 }}
                  icon="shopping-cart"
                >
                  Shopping List
                </Button>
              </View>
              
              <View style={{ flexDirection: 'row', marginTop: SPACING.sm, gap: SPACING.sm }}>
                <Button
                  mode="outlined"
                  onPress={() => shareRecipe(selectedRecipe)}
                  style={{ flex: 1 }}
                  icon="share"
                >
                  Share Recipe
                </Button>
                <Button
                  mode="contained"
                  onPress={() => {
                    Alert.alert('📱 Save Offline', 'Offline recipe saving feature coming soon!');
                  }}
                  style={{ flex: 1, backgroundColor: COLORS.success }}
                  icon="download"
                >
                  Save Offline
                </Button>
              </View>
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
            title="Pull to refresh recipes..."
            titleColor={COLORS.textSecondary}
          />
        }
      >
        {renderHeader()}
        {renderCategoryTabs()}
        {renderSortBar()}
        
        <View style={{ 
          flexDirection: viewMode === 'grid' ? 'row' : 'column',
          flexWrap: viewMode === 'grid' ? 'wrap' : 'nowrap',
          paddingHorizontal: viewMode === 'grid' ? SPACING.sm : 0,
          justifyContent: viewMode === 'grid' ? 'space-around' : 'flex-start'
        }}>
          {filteredAndSortedRecipes.map((recipe, index) => (
            <View key={recipe.id} style={{ width: viewMode === 'grid' ? '48%' : '100%' }}>
              {renderRecipeCard({ item: recipe, index })}
            </View>
          ))}
        </View>
        
        {filteredAndSortedRecipes.length === 0 && (
          <View style={{ 
            alignItems: 'center', 
            justifyContent: 'center', 
            paddingVertical: SPACING.xl * 2 
          }}>
            <Icon name="search-off" size={64} color={COLORS.textSecondary} />
            <Text style={[TEXT_STYLES.h3, { color: COLORS.textSecondary, marginTop: SPACING.lg }]}>
              No recipes found
            </Text>
            <Text style={{ color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.sm }}>
              Try adjusting your search terms or category filters
            </Text>
          </View>
        )}
        
        {/* Bottom spacing for FAB */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {renderRecipeModal()}

      <FAB
        icon="add"
        label="Create Recipe"
        onPress={() => Alert.alert('👨‍🍳 Create Recipe', 'Custom recipe creation feature coming soon! Add your own athlete-focused recipes.')}
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

export default RecipeLibrary;