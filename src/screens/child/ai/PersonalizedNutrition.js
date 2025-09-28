import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  Animated,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  ProgressBar,
  Avatar,
  IconButton,
  Surface,
  Searchbar,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your established constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const PersonalizedNutrition = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dailyProgress, setDailyProgress] = useState({
    water: 4,
    targetWater: 8,
    meals: 2,
    targetMeals: 5,
    fruits: 1,
    targetFruits: 3,
    vegetables: 2,
    targetVegetables: 4,
  });
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Nutrition education content for children
  const nutritionTips = [
    {
      id: 1,
      title: "Power Up with Breakfast! 🌅",
      description: "Start your day strong with a healthy breakfast to fuel your training",
      icon: "breakfast-dining",
      color: "#FF6B6B",
      category: "energy",
    },
    {
      id: 2,
      title: "Hydration Station 💧",
      description: "Drink water like a champion - your body needs it for peak performance!",
      icon: "local-drink",
      color: "#4ECDC4",
      category: "hydration",
    },
    {
      id: 3,
      title: "Rainbow Plate Challenge 🌈",
      description: "Eat fruits and vegetables of different colors for superhero strength!",
      icon: "eco",
      color: "#45B7D1",
      category: "vitamins",
    },
    {
      id: 4,
      title: "Pre-Training Fuel ⚡",
      description: "Eat a banana or some crackers 30 minutes before training",
      icon: "flash-on",
      color: "#96CEB4",
      category: "energy",
    },
    {
      id: 5,
      title: "Recovery Foods 🏆",
      description: "After training, help your muscles recover with protein-rich snacks",
      icon: "fitness-center",
      color: "#FFEAA7",
      category: "recovery",
    },
  ];

  const mealPlan = [
    {
      id: 1,
      type: "breakfast",
      title: "Champion's Breakfast",
      items: ["Whole grain cereal", "Banana slices", "Milk", "Orange juice"],
      emoji: "🥣",
      completed: true,
    },
    {
      id: 2,
      type: "snack",
      title: "Energy Booster",
      items: ["Apple slices", "Peanut butter", "Water"],
      emoji: "🍎",
      completed: true,
    },
    {
      id: 3,
      type: "lunch",
      title: "Power Lunch",
      items: ["Chicken sandwich", "Carrot sticks", "Yogurt", "Water"],
      emoji: "🥪",
      completed: false,
    },
    {
      id: 4,
      type: "snack",
      title: "Pre-Training Fuel",
      items: ["Granola bar", "Banana", "Water bottle"],
      emoji: "🍌",
      completed: false,
    },
    {
      id: 5,
      type: "dinner",
      title: "Recovery Meal",
      items: ["Grilled fish", "Rice", "Steamed broccoli", "Milk"],
      emoji: "🐟",
      completed: false,
    },
  ];

  const achievements = [
    { id: 1, title: "Hydration Hero", icon: "local-drink", earned: true, points: 50 },
    { id: 2, title: "Rainbow Eater", icon: "eco", earned: false, points: 75 },
    { id: 3, title: "Breakfast Champion", icon: "breakfast-dining", earned: true, points: 25 },
    { id: 4, title: "Veggie Victor", icon: "spa", earned: false, points: 100 },
  ];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const handleMealComplete = (mealId) => {
    Alert.alert("Great Job! 🎉", "You've logged another healthy meal!");
  };

  const handleAIRecommendation = () => {
    Alert.alert(
      "AI Nutrition Coach 🤖",
      "Based on your training schedule, I recommend having a protein-rich snack after practice today! Try chocolate milk or a turkey sandwich.",
      [
        { text: "Got it!", style: "default" },
        { text: "More tips", onPress: () => navigation.navigate('NutritionTips') }
      ]
    );
  };

  const categories = [
    { key: 'all', label: 'All Tips', icon: 'star' },
    { key: 'energy', label: 'Energy', icon: 'flash-on' },
    { key: 'hydration', label: 'Hydration', icon: 'local-drink' },
    { key: 'vitamins', label: 'Vitamins', icon: 'eco' },
    { key: 'recovery', label: 'Recovery', icon: 'fitness-center' },
  ];

  const filteredTips = selectedCategory === 'all' 
    ? nutritionTips 
    : nutritionTips.filter(tip => tip.category === selectedCategory);

  const renderHeader = () => (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Hey {user?.name || 'Champion'}! 👋</Text>
            <Text style={styles.subtitle}>Let's fuel your success today</Text>
          </View>
          <TouchableOpacity onPress={handleAIRecommendation}>
            <Surface style={styles.aiButton}>
              <Icon name="psychology" size={24} color={COLORS.primary} />
            </Surface>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );

  const renderDailyProgress = () => (
    <Animated.View 
      style={[
        styles.progressContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <Card style={styles.progressCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Today's Nutrition Goals 🎯</Text>
          
          <View style={styles.progressItem}>
            <View style={styles.progressHeader}>
              <Icon name="local-drink" size={24} color="#4ECDC4" />
              <Text style={styles.progressLabel}>Water Glasses</Text>
              <Text style={styles.progressCount}>
                {dailyProgress.water}/{dailyProgress.targetWater}
              </Text>
            </View>
            <ProgressBar
              progress={dailyProgress.water / dailyProgress.targetWater}
              color="#4ECDC4"
              style={styles.progressBar}
            />
          </View>

          <View style={styles.progressItem}>
            <View style={styles.progressHeader}>
              <Icon name="restaurant" size={24} color="#FF6B6B" />
              <Text style={styles.progressLabel}>Healthy Meals</Text>
              <Text style={styles.progressCount}>
                {dailyProgress.meals}/{dailyProgress.targetMeals}
              </Text>
            </View>
            <ProgressBar
              progress={dailyProgress.meals / dailyProgress.targetMeals}
              color="#FF6B6B"
              style={styles.progressBar}
            />
          </View>

          <View style={styles.progressItem}>
            <View style={styles.progressHeader}>
              <Icon name="local-florist" size={24} color="#96CEB4" />
              <Text style={styles.progressLabel}>Fruits & Veggies</Text>
              <Text style={styles.progressCount}>
                {dailyProgress.fruits + dailyProgress.vegetables}/{dailyProgress.targetFruits + dailyProgress.targetVegetables}
              </Text>
            </View>
            <ProgressBar
              progress={(dailyProgress.fruits + dailyProgress.vegetables) / (dailyProgress.targetFruits + dailyProgress.targetVegetables)}
              color="#96CEB4"
              style={styles.progressBar}
            />
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderMealPlan = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Today's Meal Plan 📋</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.mealPlanScroll}
      >
        {mealPlan.map((meal, index) => (
          <TouchableOpacity
            key={meal.id}
            onPress={() => handleMealComplete(meal.id)}
            style={styles.mealCard}
          >
            <Surface style={[styles.mealSurface, meal.completed && styles.completedMeal]}>
              <Text style={styles.mealEmoji}>{meal.emoji}</Text>
              <Text style={styles.mealTitle}>{meal.title}</Text>
              <Text style={styles.mealType}>{meal.type.toUpperCase()}</Text>
              {meal.completed && (
                <Icon name="check-circle" size={20} color={COLORS.success} style={styles.checkIcon} />
              )}
            </Surface>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderAchievements = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Nutrition Achievements 🏆</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.achievementsScroll}
      >
        {achievements.map((achievement) => (
          <Surface key={achievement.id} style={[
            styles.achievementCard,
            achievement.earned && styles.earnedAchievement
          ]}>
            <Icon 
              name={achievement.icon} 
              size={32} 
              color={achievement.earned ? COLORS.primary : '#ccc'} 
            />
            <Text style={[
              styles.achievementTitle,
              achievement.earned && styles.earnedText
            ]}>
              {achievement.title}
            </Text>
            <Text style={styles.achievementPoints}>+{achievement.points} pts</Text>
            {achievement.earned && (
              <Icon name="stars" size={16} color="#FFD700" style={styles.starIcon} />
            )}
          </Surface>
        ))}
      </ScrollView>
    </View>
  );

  const renderCategoryFilter = () => (
    <View style={styles.categoryContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
      >
        {categories.map((category) => (
          <Chip
            key={category.key}
            selected={selectedCategory === category.key}
            onPress={() => setSelectedCategory(category.key)}
            style={[
              styles.categoryChip,
              selectedCategory === category.key && styles.selectedChip
            ]}
            icon={category.icon}
          >
            {category.label}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const renderNutritionTips = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Nutrition Tips for Champions 💪</Text>
      
      {renderCategoryFilter()}
      
      {filteredTips.map((tip) => (
        <Card key={tip.id} style={styles.tipCard}>
          <Card.Content style={styles.tipContent}>
            <View style={styles.tipHeader}>
              <Surface style={[styles.tipIcon, { backgroundColor: tip.color + '20' }]}>
                <Icon name={tip.icon} size={24} color={tip.color} />
              </Surface>
              <View style={styles.tipTextContainer}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipDescription}>{tip.description}</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <ScrollView
        style={styles.scrollView}
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
        {renderDailyProgress()}
        {renderMealPlan()}
        {renderAchievements()}
        {renderNutritionTips()}
        
        <View style={styles.bottomSpacing} />
      </ScrollView>
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
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: 'bold',
  },
  subtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: SPACING.xs,
  },
  aiButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    elevation: 4,
  },
  scrollView: {
    flex: 1,
  },
  progressContainer: {
    margin: SPACING.lg,
    marginTop: -SPACING.xl,
  },
  progressCard: {
    elevation: 4,
    borderRadius: 16,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
    color: COLORS.text,
  },
  progressItem: {
    marginBottom: SPACING.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  progressLabel: {
    ...TEXT_STYLES.body,
    flex: 1,
    marginLeft: SPACING.sm,
    fontWeight: '600',
  },
  progressCount: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  mealPlanScroll: {
    marginTop: SPACING.sm,
  },
  mealCard: {
    marginRight: SPACING.md,
  },
  mealSurface: {
    width: 120,
    height: 140,
    padding: SPACING.md,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  completedMeal: {
    backgroundColor: COLORS.success + '20',
  },
  mealEmoji: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  mealTitle: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  mealType: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontSize: 10,
  },
  checkIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  achievementsScroll: {
    marginTop: SPACING.sm,
  },
  achievementCard: {
    width: 100,
    height: 120,
    padding: SPACING.sm,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    elevation: 2,
  },
  earnedAchievement: {
    backgroundColor: COLORS.primary + '10',
  },
  achievementTitle: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    marginTop: SPACING.xs,
    fontSize: 11,
  },
  earnedText: {
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  achievementPoints: {
    ...TEXT_STYLES.caption,
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  starIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  categoryContainer: {
    marginBottom: SPACING.lg,
  },
  categoryScroll: {
    flexGrow: 0,
  },
  categoryChip: {
    marginRight: SPACING.sm,
    backgroundColor: 'white',
  },
  selectedChip: {
    backgroundColor: COLORS.primary + '20',
  },
  tipCard: {
    marginBottom: SPACING.md,
    elevation: 2,
    borderRadius: 12,
  },
  tipContent: {
    padding: SPACING.md,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  tipTextContainer: {
    flex: 1,
  },
  tipTitle: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  tipDescription: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  bottomSpacing: {
    height: SPACING.xl * 2,
  },
});

export default PersonalizedNutrition;