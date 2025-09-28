import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Animated,
  Dimensions,
  Image,
  Platform,
  Vibration,
  FlatList,
  ImageBackground
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
  Divider
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const HealthRecipes = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, isDarkMode } = useSelector(state => state.auth);
  const { favoriteRecipes, mealPlan } = useSelector(state => state.nutrition);

  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [activeTab, setActiveTab] = useState('discover');
  const [favorites, setFavorites] = useState(new Set());

  // Mock data for recipes
  const mockRecipes = [
    {
      id: 1,
      title: 'Grilled Chicken Power Bowl',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
      cookTime: '25 min',
      difficulty: 'Easy',
      calories: 485,
      protein: 42,
      carbs: 35,
      fats: 18,
      rating: 4.8,
      reviews: 1247,
      tags: ['High Protein', 'Muscle Building', 'Post Workout'],
      category: 'lunch',
      ingredients: [
        '200g Chicken Breast',
        '1 cup Quinoa',
        '1 cup Broccoli',
        '1/2 Avocado',
        '2 tbsp Olive Oil',
        'Lemon & Herbs'
      ],
      instructions: [
        'Season and grill chicken breast until cooked through',
        'Cook quinoa according to package instructions',
        'Steam broccoli until tender',
        'Slice avocado and prepare bowl',
        'Combine all ingredients and drizzle with olive oil'
      ],
      nutritionGoals: ['Weight Loss', 'Muscle Building'],
      author: 'Chef Marcus',
      prepTime: '15 min'
    },
    {
      id: 2,
      title: 'Overnight Oats Energy Bowl',
      image: 'https://images.unsplash.com/photo-1571091655789-405eb7a3a3a8?w=400',
      cookTime: '5 min',
      difficulty: 'Easy',
      calories: 320,
      protein: 15,
      carbs: 58,
      fats: 8,
      rating: 4.6,
      reviews: 892,
      tags: ['Pre Workout', 'Energy Boost', 'Quick'],
      category: 'breakfast',
      ingredients: [
        '1/2 cup Rolled Oats',
        '1 cup Almond Milk',
        '1 tbsp Chia Seeds',
        '1/2 Banana',
        '2 tbsp Greek Yogurt',
        '1 tbsp Honey'
      ],
      instructions: [
        'Mix oats, almond milk, and chia seeds',
        'Refrigerate overnight',
        'Top with banana, yogurt, and honey',
        'Enjoy cold or warm'
      ],
      nutritionGoals: ['Energy', 'Endurance'],
      author: 'Nutrition Pro',
      prepTime: '5 min'
    },
    {
      id: 3,
      title: 'Salmon & Sweet Potato',
      image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
      cookTime: '30 min',
      difficulty: 'Medium',
      calories: 420,
      protein: 35,
      carbs: 28,
      fats: 18,
      rating: 4.9,
      reviews: 2156,
      tags: ['Omega-3', 'Heart Healthy', 'Anti-Inflammatory'],
      category: 'dinner',
      ingredients: [
        '150g Salmon Fillet',
        '1 medium Sweet Potato',
        '1 cup Asparagus',
        '2 tbsp Olive Oil',
        'Lemon & Dill',
        'Sea Salt & Pepper'
      ],
      instructions: [
        'Preheat oven to 400°F',
        'Cube sweet potato and roast for 20 minutes',
        'Season salmon with herbs and bake for 12 minutes',
        'Steam asparagus until tender',
        'Plate and serve with lemon wedges'
      ],
      nutritionGoals: ['Heart Health', 'Recovery'],
      author: 'Chef Sarah',
      prepTime: '10 min'
    },
    {
      id: 4,
      title: 'Green Recovery Smoothie',
      image: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400',
      cookTime: '5 min',
      difficulty: 'Easy',
      calories: 180,
      protein: 12,
      carbs: 25,
      fats: 6,
      rating: 4.4,
      reviews: 634,
      tags: ['Post Workout', 'Recovery', 'Antioxidants'],
      category: 'snack',
      ingredients: [
        '1 cup Spinach',
        '1/2 Banana',
        '1 scoop Protein Powder',
        '1/2 Avocado',
        '1 cup Coconut Water',
        '1 tbsp Almond Butter'
      ],
      instructions: [
        'Add all ingredients to blender',
        'Blend until smooth',
        'Add ice if desired',
        'Serve immediately'
      ],
      nutritionGoals: ['Recovery', 'Hydration'],
      author: 'FitNutrition',
      prepTime: '3 min'
    }
  ];

  const filterCategories = [
    { key: 'all', label: 'All', icon: 'restaurant' },
    { key: 'breakfast', label: 'Breakfast', icon: 'free-breakfast' },
    { key: 'lunch', label: 'Lunch', icon: 'lunch-dining' },
    { key: 'dinner', label: 'Dinner', icon: 'dinner-dining' },
    { key: 'snack', label: 'Snacks', icon: 'cookie' }
  ];

  const nutritionGoals = [
    { key: 'weight-loss', label: 'Weight Loss', color: '#E91E63' },
    { key: 'muscle-building', label: 'Muscle Building', color: '#4CAF50' },
    { key: 'energy', label: 'Energy Boost', color: '#FF9800' },
    { key: 'recovery', label: 'Recovery', color: '#2196F3' },
    { key: 'heart-health', label: 'Heart Health', color: '#9C27B0' }
  ];

  const tabs = [
    { key: 'discover', label: 'Discover', icon: 'explore' },
    { key: 'favorites', label: 'Favorites', icon: 'favorite' },
    { key: 'meal-plan', label: 'Meal Plan', icon: 'event-note' }
  ];

  // Entrance animations
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
      })
    ]).start();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // dispatch(refreshRecipes());
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh recipes');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const toggleFavorite = (recipeId) => {
    Vibration.vibrate(30);
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(recipeId)) {
        newFavorites.delete(recipeId);
      } else {
        newFavorites.add(recipeId);
      }
      return newFavorites;
    });
  };

  const handleRecipePress = (recipe) => {
    setSelectedRecipe(recipe);
    setShowRecipeModal(true);
  };

  const addToMealPlan = (recipe, mealType) => {
    Vibration.vibrate(50);
    Alert.alert(
      'Added to Meal Plan! 📅',
      `${recipe.title} has been added to your ${mealType} plan for tomorrow.`,
      [{ text: 'Great!', style: 'default' }]
    );
  };

  const filteredRecipes = mockRecipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         recipe.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = selectedFilter === 'all' || recipe.category === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const favoriteRecipesList = mockRecipes.filter(recipe => favorites.has(recipe.id));

  const renderHeader = () => (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Healthy Recipes</Text>
          <TouchableOpacity onPress={() => setShowFiltersModal(true)}>
            <Icon name="tune" size={28} color="white" />
          </TouchableOpacity>
        </View>
        
        <Searchbar
          placeholder="Search recipes, ingredients..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchBar}
          iconColor="white"
          placeholderTextColor="rgba(255,255,255,0.7)"
          inputStyle={{ color: 'white' }}
        />
      </View>
    </LinearGradient>
  );

  const renderTabs = () => (
    <Surface style={styles.tabsContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && styles.activeTab
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Icon
              name={tab.icon}
              size={20}
              color={activeTab === tab.key ? COLORS.primary : '#666'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.activeTabText
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Surface>
  );

  const renderFilterChips = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.filtersContainer}
      contentContainerStyle={styles.filtersContent}
    >
      {filterCategories.map((filter) => (
        <Chip
          key={filter.key}
          mode={selectedFilter === filter.key ? 'flat' : 'outlined'}
          selected={selectedFilter === filter.key}
          onPress={() => setSelectedFilter(filter.key)}
          style={[
            styles.filterChip,
            selectedFilter === filter.key && styles.selectedFilterChip
          ]}
          textStyle={[
            styles.filterChipText,
            selectedFilter === filter.key && styles.selectedFilterChipText
          ]}
          icon={filter.icon}
        >
          {filter.label}
        </Chip>
      ))}
    </ScrollView>
  );

  const renderRecipeCard = ({ item: recipe }) => (
    <TouchableOpacity
      style={styles.recipeCard}
      onPress={() => handleRecipePress(recipe)}
      activeOpacity={0.9}
    >
      <Card style={styles.cardContainer}>
        <ImageBackground
          source={{ uri: recipe.image }}
          style={styles.recipeImage}
          imageStyle={{ borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
        >
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.imageGradient}
          >
            <View style={styles.imageOverlay}>
              <View style={styles.recipeStats}>
                <Surface style={styles.statBadge}>
                  <Icon name="schedule" size={14} color={COLORS.primary} />
                  <Text style={styles.statText}>{recipe.cookTime}</Text>
                </Surface>
                <Surface style={styles.statBadge}>
                  <Icon name="local-fire-department" size={14} color="#E91E63" />
                  <Text style={styles.statText}>{recipe.calories}</Text>
                </Surface>
              </View>
              <TouchableOpacity
                style={styles.favoriteButton}
                onPress={() => toggleFavorite(recipe.id)}
              >
                <Icon
                  name={favorites.has(recipe.id) ? 'favorite' : 'favorite-border'}
                  size={24}
                  color={favorites.has(recipe.id) ? '#E91E63' : 'white'}
                />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </ImageBackground>

        <Card.Content style={styles.cardContent}>
          <Text style={styles.recipeTitle} numberOfLines={2}>
            {recipe.title}
          </Text>
          
          <View style={styles.recipeInfo}>
            <View style={styles.ratingContainer}>
              <Icon name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>{recipe.rating}</Text>
              <Text style={styles.reviewsText}>({recipe.reviews})</Text>
            </View>
            <Text style={styles.difficultyText}>{recipe.difficulty}</Text>
          </View>

          <View style={styles.macrosContainer}>
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{recipe.protein}g</Text>
              <Text style={styles.macroLabel}>Protein</Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{recipe.carbs}g</Text>
              <Text style={styles.macroLabel}>Carbs</Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{recipe.fats}g</Text>
              <Text style={styles.macroLabel}>Fats</Text>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsContainer}>
            {recipe.tags.map((tag, index) => (
              <Chip
                key={index}
                mode="outlined"
                compact
                style={styles.tagChip}
                textStyle={styles.tagText}
              >
                {tag}
              </Chip>
            ))}
          </ScrollView>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderFeaturedSection = () => (
    <View style={styles.featuredSection}>
      <Text style={styles.sectionTitle}>🔥 Trending This Week</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {mockRecipes.slice(0, 3).map((recipe) => (
          <TouchableOpacity
            key={recipe.id}
            style={styles.featuredCard}
            onPress={() => handleRecipePress(recipe)}
          >
            <ImageBackground
              source={{ uri: recipe.image }}
              style={styles.featuredImage}
              imageStyle={{ borderRadius: 12 }}
            >
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.featuredGradient}
              >
                <Text style={styles.featuredTitle}>{recipe.title}</Text>
                <View style={styles.featuredStats}>
                  <Text style={styles.featuredStat}>⏱ {recipe.cookTime}</Text>
                  <Text style={styles.featuredStat}>🔥 {recipe.calories} cal</Text>
                </View>
              </LinearGradient>
            </ImageBackground>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderNutritionGoals = () => (
    <View style={styles.goalsSection}>
      <Text style={styles.sectionTitle}>🎯 Recipe Goals</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {nutritionGoals.map((goal) => (
          <TouchableOpacity
            key={goal.key}
            style={[styles.goalCard, { borderColor: goal.color }]}
            onPress={() => Alert.alert('Goal Filter', `Filtering by ${goal.label} recipes coming soon!`)}
          >
            <View style={[styles.goalIndicator, { backgroundColor: goal.color }]} />
            <Text style={styles.goalLabel}>{goal.label}</Text>
            <Text style={styles.goalCount}>
              {mockRecipes.filter(r => 
                r.nutritionGoals.some(g => g.toLowerCase().includes(goal.key.split('-')[0]))
              ).length} recipes
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderDiscoverTab = () => (
    <Animated.View
      style={[
        styles.tabContent,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      {renderFeaturedSection()}
      {renderNutritionGoals()}
      
      <View style={styles.recipesSection}>
        <Text style={styles.sectionTitle}>
          📚 All Recipes ({filteredRecipes.length})
        </Text>
        {renderFilterChips()}
        
        <FlatList
          data={filteredRecipes}
          renderItem={renderRecipeCard}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.recipeRow}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      </View>
    </Animated.View>
  );

  const renderFavoritesTab = () => (
    <View style={styles.tabContent}>
      {favoriteRecipesList.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>
            ❤️ Your Favorites ({favoriteRecipesList.length})
          </Text>
          <FlatList
            data={favoriteRecipesList}
            renderItem={renderRecipeCard}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={styles.recipeRow}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </>
      ) : (
        <View style={styles.emptyState}>
          <Icon name="favorite-border" size={64} color="#E0E0E0" />
          <Text style={styles.emptyStateTitle}>No Favorites Yet</Text>
          <Text style={styles.emptyStateText}>
            Start exploring recipes and tap the ❤️ to save your favorites!
          </Text>
          <Button
            mode="contained"
            onPress={() => setActiveTab('discover')}
            style={styles.emptyStateButton}
          >
            Discover Recipes
          </Button>
        </View>
      )}
    </View>
  );

  const renderMealPlanTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.mealPlanHeader}>
        <Text style={styles.sectionTitle}>📅 This Week's Meal Plan</Text>
        <Button
          mode="outlined"
          onPress={() => Alert.alert('AI Meal Planner', 'AI-powered meal planning coming soon! 🤖')}
          compact
        >
          Generate Plan
        </Button>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, dayIndex) => (
          <Card key={day} style={styles.dayCard}>
            <Card.Content>
              <Text style={styles.dayTitle}>{day}</Text>
              {['Breakfast', 'Lunch', 'Dinner'].map((meal) => (
                <View key={meal} style={styles.mealSlot}>
                  <View style={styles.mealHeader}>
                    <Icon
                      name={meal === 'Breakfast' ? 'free-breakfast' : meal === 'Lunch' ? 'lunch-dining' : 'dinner-dining'}
                      size={20}
                      color={COLORS.primary}
                    />
                    <Text style={styles.mealSlotTitle}>{meal}</Text>
                  </View>
                  {dayIndex < 2 && meal !== 'Dinner' ? (
                    <TouchableOpacity
                      style={styles.plannedMeal}
                      onPress={() => handleRecipePress(mockRecipes[dayIndex])}
                    >
                      <Image
                        source={{ uri: mockRecipes[dayIndex].image }}
                        style={styles.plannedMealImage}
                      />
                      <View style={styles.plannedMealInfo}>
                        <Text style={styles.plannedMealTitle}>
                          {mockRecipes[dayIndex].title}
                        </Text>
                        <Text style={styles.plannedMealStats}>
                          {mockRecipes[dayIndex].calories} cal • {mockRecipes[dayIndex].cookTime}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.emptyMealSlot}
                      onPress={() => Alert.alert('Add Recipe', 'Recipe selection for meal planning coming soon!')}
                    >
                      <Icon name="add-circle-outline" size={24} color="#BDBDBD" />
                      <Text style={styles.emptyMealText}>Add Recipe</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    </View>
  );

  const renderRecipeModal = () => (
    <Portal>
      <Modal
        visible={showRecipeModal}
        onDismiss={() => setShowRecipeModal(false)}
        contentContainerStyle={styles.recipeModalContainer}
      >
        <ScrollView style={styles.recipeModal} showsVerticalScrollIndicator={false}>
          {selectedRecipe && (
            <>
              <ImageBackground
                source={{ uri: selectedRecipe.image }}
                style={styles.modalImage}
                imageStyle={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
              >
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.8)']}
                  style={styles.modalImageGradient}
                >
                  <View style={styles.modalImageOverlay}>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setShowRecipeModal(false)}
                    >
                      <Icon name="close" size={28} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.modalFavoriteButton}
                      onPress={() => toggleFavorite(selectedRecipe.id)}
                    >
                      <Icon
                        name={favorites.has(selectedRecipe.id) ? 'favorite' : 'favorite-border'}
                        size={28}
                        color={favorites.has(selectedRecipe.id) ? '#E91E63' : 'white'}
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.modalTitleContainer}>
                    <Text style={styles.modalTitle}>{selectedRecipe.title}</Text>
                    <Text style={styles.modalAuthor}>by {selectedRecipe.author}</Text>
                  </View>
                </LinearGradient>
              </ImageBackground>

              <View style={styles.modalContent}>
                <View style={styles.modalStats}>
                  <View style={styles.modalStatItem}>
                    <Icon name="schedule" size={20} color={COLORS.primary} />
                    <Text style={styles.modalStatText}>{selectedRecipe.prepTime}</Text>
                    <Text style={styles.modalStatLabel}>Prep</Text>
                  </View>
                  <View style={styles.modalStatItem}>
                    <Icon name="schedule" size={20} color={COLORS.primary} />
                    <Text style={styles.modalStatText}>{selectedRecipe.cookTime}</Text>
                    <Text style={styles.modalStatLabel}>Cook</Text>
                  </View>
                  <View style={styles.modalStatItem}>
                    <Icon name="local-fire-department" size={20} color="#E91E63" />
                    <Text style={styles.modalStatText}>{selectedRecipe.calories}</Text>
                    <Text style={styles.modalStatLabel}>Calories</Text>
                  </View>
                  <View style={styles.modalStatItem}>
                    <Icon name="star" size={20} color="#FFD700" />
                    <Text style={styles.modalStatText}>{selectedRecipe.rating}</Text>
                    <Text style={styles.modalStatLabel}>Rating</Text>
                  </View>
                </View>

                <Divider style={styles.modalDivider} />

                <View style={styles.modalNutrition}>
                  <Text style={styles.modalSectionTitle}>Nutrition Per Serving</Text>
                  <View style={styles.modalMacros}>
                    <View style={styles.modalMacroItem}>
                      <Text style={styles.modalMacroValue}>{selectedRecipe.protein}g</Text>
                      <Text style={styles.modalMacroLabel}>Protein</Text>
                      <ProgressBar
                        progress={selectedRecipe.protein / 50}
                        color="#4CAF50"
                        style={styles.modalMacroBar}
                      />
                    </View>
                    <View style={styles.modalMacroItem}>
                      <Text style={styles.modalMacroValue}>{selectedRecipe.carbs}g</Text>
                      <Text style={styles.modalMacroLabel}>Carbs</Text>
                      <ProgressBar
                        progress={selectedRecipe.carbs / 100}
                        color="#FF9800"
                        style={styles.modalMacroBar}
                      />
                    </View>
                    <View style={styles.modalMacroItem}>
                      <Text style={styles.modalMacroValue}>{selectedRecipe.fats}g</Text>
                      <Text style={styles.modalMacroLabel}>Fats</Text>
                      <ProgressBar
                        progress={selectedRecipe.fats / 30}
                        color="#E91E63"
                        style={styles.modalMacroBar}
                      />
                    </View>
                  </View>
                </View>

                <Divider style={styles.modalDivider} />

                <View style={styles.modalIngredients}>
                  <Text style={styles.modalSectionTitle}>Ingredients</Text>
                  {selectedRecipe.ingredients.map((ingredient, index) => (
                    <View key={index} style={styles.ingredientItem}>
                      <Icon name="check-circle-outline" size={16} color={COLORS.primary} />
                      <Text style={styles.ingredientText}>{ingredient}</Text>
                    </View>
                  ))}
                </View>

                <Divider style={styles.modalDivider} />

                <View style={styles.modalInstructions}>
                  <Text style={styles.modalSectionTitle}>Instructions</Text>
                  {selectedRecipe.instructions.map((instruction, index) => (
                    <View key={index} style={styles.instructionItem}>
                      <View style={styles.instructionNumber}>
                        <Text style={styles.instructionNumberText}>{index + 1}</Text>
                      </View>
                      <Text style={styles.instructionText}>{instruction}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.modalActions}>
                  <Button
                    mode="outlined"
                    onPress={() => Alert.alert('Shopping List', 'Add ingredients to shopping list coming soon! 🛒')}
                    style={styles.modalActionButton}
                    icon="shopping-cart"
                  >
                    Shopping List
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => {
                      setShowRecipeModal(false);
                      Alert.alert(
                        'Add to Meal Plan',
                        'Which meal would you like to add this recipe to?',
                        [
                          { text: 'Breakfast', onPress: () => addToMealPlan(selectedRecipe, 'breakfast') },
                          { text: 'Lunch', onPress: () => addToMealPlan(selectedRecipe, 'lunch') },
                          { text: 'Dinner', onPress: () => addToMealPlan(selectedRecipe, 'dinner') },
                          { text: 'Cancel', style: 'cancel' }
                        ]
                      );
                    }}
                    style={styles.modalActionButton}
                    icon="event-note"
                  >
                    Add to Plan
                  </Button>
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </Modal>
    </Portal>
  );

  const renderFiltersModal = () => (
    <Portal>
      <Modal
        visible={showFiltersModal}
        onDismiss={() => setShowFiltersModal(false)}
        contentContainerStyle={styles.filtersModalContainer}
      >
        <BlurView intensity={80} style={styles.filtersModalBlur}>
          <Card style={styles.filtersModalCard}>
            <Card.Content>
              <View style={styles.filtersModalHeader}>
                <Text style={styles.filtersModalTitle}>Recipe Filters</Text>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => setShowFiltersModal(false)}
                />
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>Meal Type</Text>
                  <View style={styles.filterOptions}>
                    {filterCategories.map((filter) => (
                      <Chip
                        key={filter.key}
                        mode={selectedFilter === filter.key ? 'flat' : 'outlined'}
                        selected={selectedFilter === filter.key}
                        onPress={() => setSelectedFilter(filter.key)}
                        style={styles.filterOption}
                        icon={filter.icon}
                      >
                        {filter.label}
                      </Chip>
                    ))}
                  </View>
                </View>

                <Divider style={styles.filterDivider} />

                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>Difficulty Level</Text>
                  <View style={styles.filterOptions}>
                    {['Easy', 'Medium', 'Hard'].map((difficulty) => (
                      <Chip
                        key={difficulty}
                        mode="outlined"
                        onPress={() => Alert.alert('Filter', `${difficulty} difficulty filter coming soon!`)}
                        style={styles.filterOption}
                      >
                        {difficulty}
                      </Chip>
                    ))}
                  </View>
                </View>

                <Divider style={styles.filterDivider} />

                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>Cooking Time</Text>
                  <View style={styles.filterOptions}>
                    {['Under 15 min', '15-30 min', '30-60 min', 'Over 1 hour'].map((time) => (
                      <Chip
                        key={time}
                        mode="outlined"
                        onPress={() => Alert.alert('Filter', `${time} filter coming soon!`)}
                        style={styles.filterOption}
                      >
                        {time}
                      </Chip>
                    ))}
                  </View>
                </View>

                <Divider style={styles.filterDivider} />

                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>Dietary Preferences</Text>
                  <View style={styles.filterOptions}>
                    {['Vegetarian', 'Vegan', 'Gluten-Free', 'Keto', 'Paleo', 'Low-Carb'].map((diet) => (
                      <Chip
                        key={diet}
                        mode="outlined"
                        onPress={() => Alert.alert('Filter', `${diet} filter coming soon!`)}
                        style={styles.filterOption}
                      >
                        {diet}
                      </Chip>
                    ))}
                  </View>
                </View>
              </ScrollView>

              <View style={styles.filtersModalActions}>
                <Button
                  mode="outlined"
                  onPress={() => {
                    setSelectedFilter('all');
                    Alert.alert('Filters Cleared', 'All filters have been reset! 🔄');
                  }}
                  style={styles.filtersModalButton}
                >
                  Clear All
                </Button>
                <Button
                  mode="contained"
                  onPress={() => setShowFiltersModal(false)}
                  style={styles.filtersModalButton}
                >
                  Apply Filters
                </Button>
              </View>
            </Card.Content>
          </Card>
        </BlurView>
      </Modal>
    </Portal>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'discover':
        return renderDiscoverTab();
      case 'favorites':
        return renderFavoritesTab();
      case 'meal-plan':
        return renderMealPlanTab();
      default:
        return renderDiscoverTab();
    }
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderTabs()}
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {renderContent()}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => Alert.alert('Create Recipe', 'Recipe creation coming soon! 👨‍🍳')}
        color="white"
      />

      {renderRecipeModal()}
      {renderFiltersModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 20,
    paddingBottom: SPACING.large,
    paddingHorizontal: SPACING.medium,
  },
  headerContent: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.large,
  },
  headerTitle: {
    ...TEXT_STYLES.headerLarge,
    color: 'white',
    fontWeight: '700',
  },
  searchBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    elevation: 0,
    borderRadius: 25,
  },
  tabsContainer: {
    marginTop: -20,
    marginHorizontal: SPACING.medium,
    borderRadius: 25,
    elevation: 4,
    marginBottom: SPACING.medium,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.large,
    paddingVertical: SPACING.medium,
    marginHorizontal: SPACING.small,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    ...TEXT_STYLES.body,
    color: '#666',
    marginLeft: SPACING.small,
    fontWeight: '500',
  },
  activeTabText: {
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
  },
  featuredSection: {
    paddingHorizontal: SPACING.medium,
    marginBottom: SPACING.large,
  },
  sectionTitle: {
    ...TEXT_STYLES.headerMedium,
    color: '#333',
    fontWeight: '700',
    marginBottom: SPACING.medium,
  },
  featuredCard: {
    width: 200,
    height: 120,
    marginRight: SPACING.medium,
  },
  featuredImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  featuredGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: SPACING.medium,
    borderRadius: 12,
  },
  featuredTitle: {
    ...TEXT_STYLES.body,
    color: 'white',
    fontWeight: '600',
    marginBottom: SPACING.small,
  },
  featuredStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  featuredStat: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  goalsSection: {
    paddingHorizontal: SPACING.medium,
    marginBottom: SPACING.large,
  },
  goalCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: SPACING.medium,
    marginRight: SPACING.medium,
    minWidth: 120,
    borderWidth: 2,
    elevation: 2,
  },
  goalIndicator: {
    width: 4,
    height: 30,
    borderRadius: 2,
    marginBottom: SPACING.small,
  },
  goalLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: '#333',
    marginBottom: SPACING.small,
  },
  goalCount: {
    ...TEXT_STYLES.caption,
    color: '#666',
  },
  recipesSection: {
    paddingHorizontal: SPACING.medium,
  },
  filtersContainer: {
    marginBottom: SPACING.large,
  },
  filtersContent: {
    paddingRight: SPACING.medium,
  },
  filterChip: {
    marginRight: SPACING.small,
  },
  selectedFilterChip: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    color: '#666',
  },
  selectedFilterChipText: {
    color: 'white',
  },
  recipeRow: {
    justifyContent: 'space-between',
    marginBottom: SPACING.medium,
  },
  recipeCard: {
    width: (width - SPACING.medium * 3) / 2,
  },
  cardContainer: {
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recipeImage: {
    height: 150,
    justifyContent: 'flex-end',
  },
  imageGradient: {
    flex: 1,
    justifyContent: 'space-between',
    padding: SPACING.small,
  },
  imageOverlay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  recipeStats: {
    flexDirection: 'row',
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingHorizontal: SPACING.small,
    paddingVertical: 4,
    marginRight: SPACING.small,
  },
  statText: {
    ...TEXT_STYLES.caption,
    color: '#333',
    marginLeft: 2,
    fontSize: 10,
  },
  favoriteButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    padding: 4,
  },
  cardContent: {
    padding: SPACING.medium,
  },
  recipeTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: '#333',
    marginBottom: SPACING.small,
    lineHeight: 20,
  },
  recipeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.medium,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    ...TEXT_STYLES.caption,
    color: '#333',
    marginLeft: 2,
    fontWeight: '600',
  },
  reviewsText: {
    ...TEXT_STYLES.caption,
    color: '#666',
    marginLeft: 2,
  },
  difficultyText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: '500',
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.medium,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    ...TEXT_STYLES.caption,
    fontWeight: '700',
    color: '#333',
  },
  macroLabel: {
    ...TEXT_STYLES.caption,
    color: '#666',
    fontSize: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
  },
  tagChip: {
    marginRight: SPACING.small,
    height: 24,
  },
  tagText: {
    ...TEXT_STYLES.caption,
    fontSize: 10,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xlarge,
    paddingHorizontal: SPACING.large,
  },
  emptyStateTitle: {
    ...TEXT_STYLES.headerMedium,
    color: '#666',
    marginTop: SPACING.medium,
    marginBottom: SPACING.small,
  },
  emptyStateText: {
    ...TEXT_STYLES.body,
    color: '#999',
    textAlign: 'center',
    marginBottom: SPACING.large,
    lineHeight: 22,
  },
  emptyStateButton: {
    paddingHorizontal: SPACING.large,
  },
  mealPlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.medium,
    marginBottom: SPACING.large,
  },
  dayCard: {
    marginHorizontal: SPACING.medium,
    marginBottom: SPACING.medium,
    borderRadius: 16,
    elevation: 2,
  },
  dayTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '700',
    color: '#333',
    marginBottom: SPACING.medium,
  },
  mealSlot: {
    marginBottom: SPACING.medium,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.small,
  },
  mealSlotTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: '#333',
    marginLeft: SPACING.small,
  },
  plannedMeal: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: SPACING.medium,
  },
  plannedMealImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: SPACING.medium,
  },
  plannedMealInfo: {
    flex: 1,
  },
  plannedMealTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  plannedMealStats: {
    ...TEXT_STYLES.caption,
    color: '#666',
  },
  emptyMealSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: SPACING.large,
  },
  emptyMealText: {
    ...TEXT_STYLES.body,
    color: '#BDBDBD',
    marginLeft: SPACING.small,
  },
  recipeModalContainer: {
    flex: 1,
    justifyContent: 'center',
    margin: 0,
  },
  recipeModal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.9,
  },
  modalImage: {
    height: 250,
    justifyContent: 'space-between',
  },
  modalImageGradient: {
    flex: 1,
    justifyContent: 'space-between',
    padding: SPACING.medium,
  },
  modalImageOverlay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  closeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: SPACING.small,
  },
  modalFavoriteButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: SPACING.small,
  },
  modalTitleContainer: {
    alignItems: 'flex-start',
  },
  modalTitle: {
    ...TEXT_STYLES.headerLarge,
    color: 'white',
    fontWeight: '700',
    marginBottom: SPACING.small,
  },
  modalAuthor: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  modalContent: {
    padding: SPACING.large,
  },
  modalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.large,
  },
  modalStatItem: {
    alignItems: 'center',
  },
  modalStatText: {
    ...TEXT_STYLES.body,
    fontWeight: '700',
    color: '#333',
    marginTop: SPACING.small,
  },
  modalStatLabel: {
    ...TEXT_STYLES.caption,
    color: '#666',
  },
  modalDivider: {
    marginVertical: SPACING.large,
  },
  modalSectionTitle: {
    ...TEXT_STYLES.headerMedium,
    color: '#333',
    fontWeight: '600',
    marginBottom: SPACING.medium,
  },
  modalNutrition: {
    marginBottom: SPACING.medium,
  },
  modalMacros: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalMacroItem: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: SPACING.small,
  },
  modalMacroValue: {
    ...TEXT_STYLES.body,
    fontWeight: '700',
    color: '#333',
    fontSize: 18,
  },
  modalMacroLabel: {
    ...TEXT_STYLES.caption,
    color: '#666',
    marginBottom: SPACING.small,
  },
  modalMacroBar: {
    height: 4,
    borderRadius: 2,
    width: '100%',
  },
  modalIngredients: {
    marginBottom: SPACING.medium,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.small,
  },
  ingredientText: {
    ...TEXT_STYLES.body,
    color: '#333',
    marginLeft: SPACING.small,
  },
  modalInstructions: {
    marginBottom: SPACING.medium,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.medium,
  },
  instructionNumber: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.medium,
    marginTop: 2,
  },
  instructionNumberText: {
    ...TEXT_STYLES.caption,
    color: 'white',
    fontWeight: '700',
  },
  instructionText: {
    ...TEXT_STYLES.body,
    color: '#333',
    flex: 1,
    lineHeight: 22,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.medium,
  },
  modalActionButton: {
    flex: 1,
  },
  filtersModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersModalBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  filtersModalCard: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    borderRadius: 20,
  },
  filtersModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.large,
  },
  filtersModalTitle: {
    ...TEXT_STYLES.headerMedium,
    color: '#333',
    fontWeight: '600',
  },
  filterSection: {
    marginBottom: SPACING.large,
  },
  filterSectionTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: '#333',
    marginBottom: SPACING.medium,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterOption: {
    marginRight: SPACING.small,
    marginBottom: SPACING.small,
  },
  filterDivider: {
    marginVertical: SPACING.medium,
  },
  filtersModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.large,
    gap: SPACING.medium,
  },
  filtersModalButton: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default HealthRecipes;