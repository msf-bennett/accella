import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  RefreshControl,
  Animated,
  TouchableOpacity,
  Dimensions,
  FlatList,
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
  Badge,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f5f5',
  white: '#FFFFFF',
  text: '#333333',
  textLight: '#666666',
  nutrition: {
    fruits: '#FF6B6B',
    vegetables: '#4ECDC4',
    grains: '#F4A261',
    protein: '#E76F51',
    dairy: '#2A9D8F',
    water: '#48CAE4',
  }
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
  body: { fontSize: 16 },
  caption: { fontSize: 14 },
  small: { fontSize: 12 },
};

const { width, height } = Dimensions.get('window');

const NutritionGuide = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, nutrition } = useSelector((state) => state.user);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFoodGroup, setSelectedFoodGroup] = useState('all');
  const [dailyProgress, setDailyProgress] = useState({
    fruits: 2,
    vegetables: 3,
    water: 5,
    protein: 1,
    grains: 2,
    dairy: 1,
  });
  const [animatedValue] = useState(new Animated.Value(0));
  const [bounceAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Bounce animation for water drops
    const bounceAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    bounceAnimation.start();

    return () => bounceAnimation.stop();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const foodGroups = [
    {
      id: 'fruits',
      name: 'Fruits',
      emoji: '🍎',
      color: COLORS.nutrition.fruits,
      dailyGoal: 3,
      benefits: 'Vitamins & Energy',
      examples: ['Apples', 'Bananas', 'Berries', 'Oranges'],
    },
    {
      id: 'vegetables',
      name: 'Vegetables',
      emoji: '🥕',
      color: COLORS.nutrition.vegetables,
      dailyGoal: 5,
      benefits: 'Strong & Healthy',
      examples: ['Carrots', 'Broccoli', 'Spinach', 'Peppers'],
    },
    {
      id: 'grains',
      name: 'Grains',
      emoji: '🍞',
      color: COLORS.nutrition.grains,
      dailyGoal: 4,
      benefits: 'Energy & Fuel',
      examples: ['Rice', 'Bread', 'Oats', 'Pasta'],
    },
    {
      id: 'protein',
      name: 'Protein',
      emoji: '🥩',
      color: COLORS.nutrition.protein,
      dailyGoal: 2,
      benefits: 'Strong Muscles',
      examples: ['Chicken', 'Fish', 'Eggs', 'Beans'],
    },
    {
      id: 'dairy',
      name: 'Dairy',
      emoji: '🥛',
      color: COLORS.nutrition.dairy,
      dailyGoal: 2,
      benefits: 'Strong Bones',
      examples: ['Milk', 'Cheese', 'Yogurt', 'Butter'],
    },
  ];

  const superFoods = [
    {
      id: 1,
      name: 'Blueberries',
      emoji: '🫐',
      category: 'fruits',
      superPower: 'Brain Booster',
      description: 'Makes you smarter and helps you remember!',
      color: COLORS.nutrition.fruits,
    },
    {
      id: 2,
      name: 'Spinach',
      emoji: '🥬',
      category: 'vegetables',
      superPower: 'Strength Builder',
      description: 'Like Popeye - gives you super strength!',
      color: COLORS.nutrition.vegetables,
    },
    {
      id: 3,
      name: 'Salmon',
      emoji: '🐟',
      category: 'protein',
      superPower: 'Heart Helper',
      description: 'Keeps your heart happy and healthy!',
      color: COLORS.nutrition.protein,
    },
    {
      id: 4,
      name: 'Sweet Potato',
      emoji: '🍠',
      category: 'vegetables',
      superPower: 'Eye Guardian',
      description: 'Helps you see clearly and bright!',
      color: COLORS.nutrition.vegetables,
    },
    {
      id: 5,
      name: 'Greek Yogurt',
      emoji: '🥄',
      category: 'dairy',
      superPower: 'Tummy Friend',
      description: 'Keeps your belly happy and healthy!',
      color: COLORS.nutrition.dairy,
    },
    {
      id: 6,
      name: 'Oats',
      emoji: '🥣',
      category: 'grains',
      superPower: 'Energy Champion',
      description: 'Gives you lasting energy all day!',
      color: COLORS.nutrition.grains,
    },
  ];

  const nutritionTips = [
    {
      id: 1,
      tip: "Eat the rainbow! Different colored foods give you different superpowers! 🌈",
      icon: "palette",
    },
    {
      id: 2,
      tip: "Drink water like a champion! Your body is mostly water - keep it happy! 💧",
      icon: "water-drop",
    },
    {
      id: 3,
      tip: "Try new foods - you might discover your new favorite superfood! 🚀",
      icon: "explore",
    },
    {
      id: 4,
      tip: "Breakfast is your morning fuel! Don't skip it - you need energy to be awesome! ⚡",
      icon: "wb-sunny",
    },
  ];

  const mealPlanSuggestions = [
    {
      id: 1,
      meal: 'Breakfast',
      icon: 'wb-sunny',
      suggestions: [
        { name: 'Superhero Smoothie', ingredients: 'Banana + Berries + Yogurt', emoji: '🥤' },
        { name: 'Power Pancakes', ingredients: 'Oats + Eggs + Berries', emoji: '🥞' },
        { name: 'Energy Bowl', ingredients: 'Cereal + Milk + Fruit', emoji: '🥣' },
      ]
    },
    {
      id: 2,
      meal: 'Lunch',
      icon: 'wb-sunny',
      suggestions: [
        { name: 'Rainbow Wrap', ingredients: 'Tortilla + Veggies + Chicken', emoji: '🌯' },
        { name: 'Hero Sandwich', ingredients: 'Bread + Turkey + Cheese', emoji: '🥪' },
        { name: 'Power Bowl', ingredients: 'Rice + Beans + Vegetables', emoji: '🍲' },
      ]
    },
    {
      id: 3,
      meal: 'Dinner',
      icon: 'nightlight',
      suggestions: [
        { name: 'Family Feast', ingredients: 'Fish + Sweet Potato + Broccoli', emoji: '🍽️' },
        { name: 'Pasta Power', ingredients: 'Pasta + Tomatoes + Cheese', emoji: '🍝' },
        { name: 'Taco Tuesday', ingredients: 'Tortilla + Beans + Salsa', emoji: '🌮' },
      ]
    },
  ];

  const handleFoodGroupPress = (groupId) => {
    setSelectedFoodGroup(groupId === selectedFoodGroup ? 'all' : groupId);
  };

  const handleAddFood = (groupId) => {
    const newProgress = { ...dailyProgress };
    newProgress[groupId] = Math.min(newProgress[groupId] + 1, foodGroups.find(g => g.id === groupId)?.dailyGoal || 0);
    setDailyProgress(newProgress);
    
    Alert.alert(
      'Great Choice! 🎉',
      `You added a healthy ${groupId} to your day! Keep up the awesome eating!`,
      [{ text: 'Thanks!', style: 'default' }]
    );
  };

  const filteredSuperFoods = selectedFoodGroup === 'all' 
    ? superFoods 
    : superFoods.filter(food => food.category === selectedFoodGroup);

  const renderWaterTracker = () => (
    <Card style={styles.card}>
      <LinearGradient
        colors={[COLORS.nutrition.water, '#87CEEB']}
        style={styles.waterGradient}
      >
        <View style={styles.waterContent}>
          <Text style={styles.waterTitle}>Water Champion 💧</Text>
          <Text style={styles.waterSubtitle}>
            {dailyProgress.water} of 8 glasses today!
          </Text>
          <View style={styles.waterDrops}>
            {[...Array(8)].map((_, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.waterDrop,
                  index < dailyProgress.water && styles.waterDropFilled,
                  index === dailyProgress.water - 1 && {
                    transform: [{ scale: bounceAnim }]
                  }
                ]}
              >
                <Icon 
                  name="water-drop" 
                  size={20} 
                  color={index < dailyProgress.water ? COLORS.white : 'rgba(255,255,255,0.3)'} 
                />
              </Animated.View>
            ))}
          </View>
          <Button
            mode="contained"
            onPress={() => {
              if (dailyProgress.water < 8) {
                setDailyProgress(prev => ({ ...prev, water: prev.water + 1 }));
              }
            }}
            style={styles.waterButton}
            buttonColor={COLORS.white}
            textColor={COLORS.nutrition.water}
          >
            I Drank Water! 🥤
          </Button>
        </View>
      </LinearGradient>
    </Card>
  );

  const renderFoodGroups = () => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <Icon name="restaurant" size={24} color={COLORS.primary} />
          <Text style={[TEXT_STYLES.h3, { marginLeft: SPACING.sm }]}>
            Food Groups 🍽️
          </Text>
        </View>
        <Text style={[TEXT_STYLES.caption, { color: COLORS.textLight, marginBottom: SPACING.md }]}>
          Tap to track what you've eaten today!
        </Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {foodGroups.map((group) => (
            <TouchableOpacity
              key={group.id}
              style={[
                styles.foodGroupCard,
                selectedFoodGroup === group.id && { borderColor: group.color, borderWidth: 2 }
              ]}
              onPress={() => handleFoodGroupPress(group.id)}
            >
              <Surface style={[styles.foodGroupIcon, { backgroundColor: group.color + '20' }]}>
                <Text style={styles.foodGroupEmoji}>{group.emoji}</Text>
              </Surface>
              <Text style={styles.foodGroupName}>{group.name}</Text>
              <Text style={styles.foodGroupBenefits}>{group.benefits}</Text>
              <View style={styles.progressContainer}>
                <ProgressBar
                  progress={dailyProgress[group.id] / group.dailyGoal}
                  color={group.color}
                  style={styles.foodProgressBar}
                />
                <Text style={styles.progressText}>
                  {dailyProgress[group.id]}/{group.dailyGoal}
                </Text>
              </View>
              <Button
                mode="outlined"
                onPress={() => handleAddFood(group.id)}
                style={[styles.addFoodButton, { borderColor: group.color }]}
                textColor={group.color}
              >
                Add +1
              </Button>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Card.Content>
    </Card>
  );

  const renderSuperFoods = () => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <Icon name="stars" size={24} color={COLORS.primary} />
          <Text style={[TEXT_STYLES.h3, { marginLeft: SPACING.sm }]}>
            Super Foods 🦸‍♀️
          </Text>
        </View>
        <Text style={[TEXT_STYLES.caption, { color: COLORS.textLight, marginBottom: SPACING.md }]}>
          These foods have special powers to make you stronger!
        </Text>
        
        <View style={styles.superFoodsGrid}>
          {filteredSuperFoods.map((food) => (
            <TouchableOpacity
              key={food.id}
              style={styles.superFoodCard}
              onPress={() => {
                Alert.alert(
                  `${food.name} ${food.emoji}`,
                  `Superpower: ${food.superPower}\n\n${food.description}\n\nTry adding this to your meals for extra nutrition power!`,
                  [{ text: 'Cool!', style: 'default' }]
                );
              }}
            >
              <Surface style={[styles.superFoodIcon, { backgroundColor: food.color + '20' }]}>
                <Text style={styles.superFoodEmoji}>{food.emoji}</Text>
              </Surface>
              <Text style={styles.superFoodName}>{food.name}</Text>
              <Chip
                mode="flat"
                style={[styles.superPowerChip, { backgroundColor: food.color }]}
                textStyle={styles.superPowerText}
              >
                {food.superPower}
              </Chip>
            </TouchableOpacity>
          ))}
        </View>
      </Card.Content>
    </Card>
  );

  const renderMealSuggestions = () => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <Icon name="restaurant-menu" size={24} color={COLORS.primary} />
          <Text style={[TEXT_STYLES.h3, { marginLeft: SPACING.sm }]}>
            Meal Ideas 🍽️
          </Text>
        </View>
        <Text style={[TEXT_STYLES.caption, { color: COLORS.textLight, marginBottom: SPACING.md }]}>
          Delicious and healthy meal ideas just for you!
        </Text>
        
        {mealPlanSuggestions.map((meal) => (
          <Surface key={meal.id} style={styles.mealSection}>
            <View style={styles.mealHeader}>
              <Icon name={meal.icon} size={20} color={COLORS.primary} />
              <Text style={styles.mealTitle}>{meal.meal}</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {meal.suggestions.map((suggestion, index) => (
                <Surface key={index} style={styles.mealCard}>
                  <Text style={styles.mealEmoji}>{suggestion.emoji}</Text>
                  <Text style={styles.mealName}>{suggestion.name}</Text>
                  <Text style={styles.mealIngredients}>{suggestion.ingredients}</Text>
                </Surface>
              ))}
            </ScrollView>
          </Surface>
        ))}
      </Card.Content>
    </Card>
  );

  const renderNutritionTips = () => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <Icon name="lightbulb" size={24} color={COLORS.primary} />
          <Text style={[TEXT_STYLES.h3, { marginLeft: SPACING.sm }]}>
            Nutrition Tips 💡
          </Text>
        </View>
        
        {nutritionTips.map((tip) => (
          <Surface key={tip.id} style={styles.tipCard}>
            <Icon name={tip.icon} size={24} color={COLORS.primary} />
            <Text style={styles.tipText}>{tip.tip}</Text>
          </Surface>
        ))}
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" translucent />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Nutrition Guide 🥗</Text>
          <Text style={styles.headerSubtitle}>
            Fuel your body with super foods! 💪
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: animatedValue,
              transform: [
                {
                  translateY: animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {renderWaterTracker()}
          {renderFoodGroups()}
          {renderSuperFoods()}
          {renderMealSuggestions()}
          {renderNutritionTips()}
        </Animated.View>
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="restaurant"
        onPress={() => {
          Alert.alert(
            'Healthy Eating Challenge! 🏆',
            'Try to eat something from each food group today! You can do it, nutrition champion! 🌟',
            [{ text: 'Challenge Accepted!', style: 'default' }]
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
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  content: {
    padding: SPACING.md,
  },
  card: {
    marginBottom: SPACING.md,
    elevation: 4,
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  waterGradient: {
    borderRadius: 12,
    padding: SPACING.lg,
  },
  waterContent: {
    alignItems: 'center',
  },
  waterTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.white,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  waterSubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: SPACING.lg,
  },
  waterDrops: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  waterDrop: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  waterDropFilled: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  waterButton: {
    elevation: 2,
  },
  foodGroupCard: {
    alignItems: 'center',
    padding: SPACING.md,
    marginRight: SPACING.md,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    elevation: 2,
    width: 140,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  foodGroupIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    elevation: 2,
  },
  foodGroupEmoji: {
    fontSize: 28,
  },
  foodGroupName: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  foodGroupBenefits: {
    ...TEXT_STYLES.small,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: SPACING.sm,
    width: '100%',
  },
  foodProgressBar: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.background,
    marginBottom: SPACING.xs,
  },
  progressText: {
    ...TEXT_STYLES.small,
    color: COLORS.textLight,
    fontWeight: 'bold',
  },
  addFoodButton: {
    backgroundColor: 'transparent',
  },
  superFoodsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  superFoodCard: {
    width: (width - 64) / 2,
    alignItems: 'center',
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    elevation: 2,
  },
  superFoodIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    elevation: 2,
  },
  superFoodEmoji: {
    fontSize: 24,
  },
  superFoodName: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  superPowerChip: {
    elevation: 1,
  },
  superPowerText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  mealSection: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: 8,
    elevation: 1,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  mealTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
  mealCard: {
    alignItems: 'center',
    padding: SPACING.md,
    marginRight: SPACING.md,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    elevation: 1,
    minWidth: 120,
  },
  mealEmoji: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  mealName: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  mealIngredients: {
    ...TEXT_STYLES.small,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 16,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    elevation: 1,
  },
  tipText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.md,
    flex: 1,
    lineHeight: 22,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.nutrition.fruits,
  },
});

export default NutritionGuide;