import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StatusBar,
  Animated,
  Alert,
  Dimensions,
  TouchableOpacity,
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
  Badge,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const SportsNutrition = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSport, setSelectedSport] = useState('strength');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedCard, setExpandedCard] = useState(null);
  
  const dispatch = useDispatch();
  const { user, nutritionPlans } = useSelector(state => state.user);
  const { loading } = useSelector(state => state.app);

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const pulseAnim = useState(new Animated.Value(1))[0];

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

    // Pulse animation for interactive elements
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  // Sport-specific nutrition data
  const sportsNutritionData = {
    strength: {
      name: 'Strength Training',
      icon: '💪',
      color: ['#667eea', '#764ba2'],
      macros: { protein: 25, carbs: 45, fats: 30 },
      calories: { male: 2800, female: 2300 },
      timing: {
        preWorkout: 'Focus on carbs + moderate protein 1-2 hours before',
        postWorkout: 'Protein within 30 minutes, carbs within 2 hours',
        daily: '1.6-2.2g protein per kg body weight'
      },
      keyNutrients: [
        { name: 'Protein', amount: '1.6-2.2g/kg', benefit: 'Muscle repair & growth', icon: '🥩' },
        { name: 'Creatine', amount: '3-5g daily', benefit: 'Power & strength gains', icon: '⚡' },
        { name: 'Carbs', amount: '3-5g/kg', benefit: 'Energy for intense sets', icon: '🍞' },
        { name: 'Leucine', amount: '2.5g per meal', benefit: 'Muscle protein synthesis', icon: '🥛' },
      ],
      foods: [
        { name: 'Lean Beef', protein: 26, carbs: 0, icon: '🥩', benefit: 'Complete protein + iron' },
        { name: 'Greek Yogurt', protein: 20, carbs: 6, icon: '🥛', benefit: 'Casein protein + probiotics' },
        { name: 'Sweet Potato', protein: 2, carbs: 27, icon: '🍠', benefit: 'Complex carbs + vitamins' },
        { name: 'Eggs', protein: 12, carbs: 1, icon: '🥚', benefit: 'Complete amino acid profile' },
      ]
    },
    endurance: {
      name: 'Endurance Sports',
      icon: '🏃‍♂️',
      color: ['#11998e', '#38ef7d'],
      macros: { protein: 15, carbs: 65, fats: 20 },
      calories: { male: 3200, female: 2600 },
      timing: {
        preWorkout: 'High carbs 3-4 hours before, avoid fat/fiber',
        postWorkout: '1g carbs per kg within 30 minutes',
        daily: 'Carb loading 2-3 days before events'
      },
      keyNutrients: [
        { name: 'Carbohydrates', amount: '6-10g/kg', benefit: 'Primary fuel source', icon: '🍝' },
        { name: 'Electrolytes', amount: 'Replace losses', benefit: 'Hydration balance', icon: '🧂' },
        { name: 'Iron', amount: '18mg daily', benefit: 'Oxygen transport', icon: '🩸' },
        { name: 'B-Vitamins', amount: 'RDA+', benefit: 'Energy metabolism', icon: '💊' },
      ],
      foods: [
        { name: 'Oats', protein: 6, carbs: 27, icon: '🥣', benefit: 'Sustained energy release' },
        { name: 'Banana', protein: 1, carbs: 27, icon: '🍌', benefit: 'Quick energy + potassium' },
        { name: 'Quinoa', protein: 8, carbs: 39, icon: '🌾', benefit: 'Complete protein + carbs' },
        { name: 'Dates', protein: 2, carbs: 75, icon: '🫐', benefit: 'Natural sugars + minerals' },
      ]
    },
    team: {
      name: 'Team Sports',
      icon: '⚽',
      color: ['#fa709a', '#fee140'],
      macros: { protein: 20, carbs: 50, fats: 30 },
      calories: { male: 3000, female: 2500 },
      timing: {
        preWorkout: 'Mixed macros 2-3 hours before games',
        postWorkout: 'Recovery meal within 2 hours',
        daily: 'Consistent meal timing for training'
      },
      keyNutrients: [
        { name: 'Protein', amount: '1.4-1.7g/kg', benefit: 'Recovery & power', icon: '🍗' },
        { name: 'Carbs', amount: '5-7g/kg', benefit: 'Intermittent energy', icon: '🍚' },
        { name: 'Antioxidants', amount: 'High intake', benefit: 'Reduce inflammation', icon: '🫐' },
        { name: 'Calcium', amount: '1200mg', benefit: 'Bone health', icon: '🥛' },
      ],
      foods: [
        { name: 'Salmon', protein: 25, carbs: 0, icon: '🐟', benefit: 'Omega-3s + protein' },
        { name: 'Brown Rice', protein: 5, carbs: 45, icon: '🍚', benefit: 'Sustained carbs + fiber' },
        { name: 'Berries', protein: 1, carbs: 15, icon: '🫐', benefit: 'Antioxidants + recovery' },
        { name: 'Nuts', protein: 6, carbs: 6, icon: '🥜', benefit: 'Healthy fats + vitamin E' },
      ]
    },
    combat: {
      name: 'Combat Sports',
      icon: '🥊',
      color: ['#ff6b6b', '#ee5a52'],
      macros: { protein: 30, carbs: 40, fats: 30 },
      calories: { male: 2600, female: 2200 },
      timing: {
        preWorkout: 'Light meals, focus on hydration',
        postWorkout: 'Rapid rehydration + protein',
        daily: 'Weight management strategies'
      },
      keyNutrients: [
        { name: 'Protein', amount: '1.8-2.5g/kg', benefit: 'Muscle preservation', icon: '🥩' },
        { name: 'Hydration', amount: '35-40ml/kg', benefit: 'Weight cutting support', icon: '💧' },
        { name: 'Magnesium', amount: '400mg', benefit: 'Muscle function', icon: '🌿' },
        { name: 'Zinc', amount: '15mg', benefit: 'Recovery & immunity', icon: '⚡' },
      ],
      foods: [
        { name: 'Chicken Breast', protein: 31, carbs: 0, icon: '🍗', benefit: 'Lean protein source' },
        { name: 'Spinach', protein: 3, carbs: 4, icon: '🥬', benefit: 'Iron + low calories' },
        { name: 'Avocado', protein: 2, carbs: 9, icon: '🥑', benefit: 'Healthy fats + satiety' },
        { name: 'Cottage Cheese', protein: 25, carbs: 5, icon: '🧀', benefit: 'Casein protein' },
      ]
    }
  };

  const sports = [
    { id: 'strength', label: 'Strength', icon: 'fitness-center' },
    { id: 'endurance', label: 'Endurance', icon: 'directions-run' },
    { id: 'team', label: 'Team Sports', icon: 'sports-soccer' },
    { id: 'combat', label: 'Combat', icon: 'sports-martial-arts' },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'dashboard' },
    { id: 'timing', label: 'Timing', icon: 'schedule' },
    { id: 'foods', label: 'Foods', icon: 'restaurant' },
    { id: 'supplements', label: 'Supplements', icon: 'medication' },
  ];

  const renderSportSelector = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sportsScroll}>
      {sports.map((sport) => (
        <TouchableOpacity
          key={sport.id}
          onPress={() => setSelectedSport(sport.id)}
          style={[
            styles.sportChip,
            selectedSport === sport.id && styles.selectedSportChip
          ]}
        >
          <Icon 
            name={sport.icon} 
            size={24} 
            color={selectedSport === sport.id ? '#fff' : COLORS.primary} 
          />
          <Text style={[
            styles.sportChipText,
            selectedSport === sport.id && styles.selectedSportChipText
          ]}>
            {sport.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderMacroBreakdown = () => {
    const data = sportsNutritionData[selectedSport];
    return (
      <Card style={styles.macroCard}>
        <LinearGradient colors={data.color} style={styles.cardHeader}>
          <Text style={styles.macroIcon}>{data.icon}</Text>
          <Text style={styles.sectionTitle}>{data.name} Macros</Text>
        </LinearGradient>
        <Card.Content style={styles.macroContent}>
          <View style={styles.macroRow}>
            <View style={styles.macroItem}>
              <Text style={styles.macroLabel}>Protein</Text>
              <Text style={styles.macroValue}>{data.macros.protein}%</Text>
              <ProgressBar 
                progress={data.macros.protein / 100} 
                color="#e74c3c" 
                style={styles.macroBar}
              />
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroLabel}>Carbs</Text>
              <Text style={styles.macroValue}>{data.macros.carbs}%</Text>
              <ProgressBar 
                progress={data.macros.carbs / 100} 
                color="#3498db" 
                style={styles.macroBar}
              />
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroLabel}>Fats</Text>
              <Text style={styles.macroValue}>{data.macros.fats}%</Text>
              <ProgressBar 
                progress={data.macros.fats / 100} 
                color="#f39c12" 
                style={styles.macroBar}
              />
            </View>
          </View>
          <Surface style={styles.calorieInfo}>
            <Text style={styles.calorieText}>
              Daily Calories: {data.calories.male} (M) / {data.calories.female} (F)
            </Text>
          </Surface>
        </Card.Content>
      </Card>
    );
  };

  const renderKeyNutrients = () => {
    const data = sportsNutritionData[selectedSport];
    return (
      <Card style={styles.nutrientsCard}>
        <Card.Content>
          <View style={styles.cardTitleRow}>
            <Icon name="star" size={24} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Key Nutrients 🌟</Text>
          </View>
          {data.keyNutrients.map((nutrient, index) => (
            <Surface key={index} style={styles.nutrientItem}>
              <Text style={styles.nutrientIcon}>{nutrient.icon}</Text>
              <View style={styles.nutrientInfo}>
                <Text style={styles.nutrientName}>{nutrient.name}</Text>
                <Text style={styles.nutrientAmount}>{nutrient.amount}</Text>
                <Text style={styles.nutrientBenefit}>{nutrient.benefit}</Text>
              </View>
            </Surface>
          ))}
        </Card.Content>
      </Card>
    );
  };

  const renderTopFoods = () => {
    const data = sportsNutritionData[selectedSport];
    return (
      <Card style={styles.foodsCard}>
        <Card.Content>
          <View style={styles.cardTitleRow}>
            <Icon name="restaurant-menu" size={24} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Top Foods for {data.name} 🍽️</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {data.foods.map((food, index) => (
              <Surface key={index} style={styles.foodCard}>
                <Text style={styles.foodIcon}>{food.icon}</Text>
                <Text style={styles.foodName}>{food.name}</Text>
                <View style={styles.foodNutrition}>
                  <Text style={styles.foodProtein}>{food.protein}g protein</Text>
                  <Text style={styles.foodCarbs}>{food.carbs}g carbs</Text>
                </View>
                <Text style={styles.foodBenefit}>{food.benefit}</Text>
                <Button
                  mode="outlined"
                  compact
                  onPress={() => Alert.alert('Feature Coming Soon', 'Add to meal plan functionality will be available soon!')}
                  style={styles.addFoodButton}
                >
                  Add
                </Button>
              </Surface>
            ))}
          </ScrollView>
        </Card.Content>
      </Card>
    );
  };

  const renderNutrientTiming = () => {
    const data = sportsNutritionData[selectedSport];
    return (
      <Card style={styles.timingCard}>
        <LinearGradient colors={['#4facfe', '#00f2fe']} style={styles.cardHeader}>
          <Icon name="schedule" size={24} color="#fff" />
          <Text style={styles.sectionTitle}>Nutrient Timing Strategy</Text>
        </LinearGradient>
        <Card.Content style={styles.timingContent}>
          <View style={styles.timingItem}>
            <View style={styles.timingHeader}>
              <Icon name="restaurant" size={20} color={COLORS.primary} />
              <Text style={styles.timingTitle}>Pre-Workout</Text>
            </View>
            <Text style={styles.timingDescription}>{data.timing.preWorkout}</Text>
          </View>
          
          <View style={styles.timingItem}>
            <View style={styles.timingHeader}>
              <Icon name="fitness-center" size={20} color={COLORS.success} />
              <Text style={styles.timingTitle}>Post-Workout</Text>
            </View>
            <Text style={styles.timingDescription}>{data.timing.postWorkout}</Text>
          </View>
          
          <View style={styles.timingItem}>
            <View style={styles.timingHeader}>
              <Icon name="today" size={20} color={COLORS.warning} />
              <Text style={styles.timingTitle}>Daily Strategy</Text>
            </View>
            <Text style={styles.timingDescription}>{data.timing.daily}</Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderHydrationGuidelines = () => (
    <Card style={styles.hydrationCard}>
      <Card.Content>
        <View style={styles.cardTitleRow}>
          <Icon name="water-drop" size={24} color="#2196F3" />
          <Text style={styles.cardTitle}>Sport Hydration Guidelines 💧</Text>
        </View>
        
        <Surface style={styles.hydrationTip}>
          <Text style={styles.hydrationTitle}>General Guidelines:</Text>
          <Text style={styles.hydrationText}>
            • 2-3 hours before: 500-600ml water{'\n'}
            • 15-20 minutes before: 200-300ml{'\n'}
            • During: 150-250ml every 15-20 minutes{'\n'}
            • After: 150% of fluid losses
          </Text>
        </Surface>

        <Surface style={styles.electrolyteInfo}>
          <Text style={styles.electrolyteTitle}>Electrolyte Needs:</Text>
          <View style={styles.electrolyteGrid}>
            <View style={styles.electrolyteItem}>
              <Text style={styles.electrolyteName}>Sodium</Text>
              <Text style={styles.electrolyteAmount}>200-700mg/hr</Text>
            </View>
            <View style={styles.electrolyteItem}>
              <Text style={styles.electrolyteName}>Potassium</Text>
              <Text style={styles.electrolyteAmount}>150-300mg/hr</Text>
            </View>
          </View>
        </Surface>
      </Card.Content>
    </Card>
  );

  const renderPersonalizedRecommendations = () => (
    <Card style={styles.personalCard}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.cardHeader}>
        <Icon name="person" size={24} color="#fff" />
        <Text style={styles.sectionTitle}>Your Personalized Plan 🎯</Text>
      </LinearGradient>
      <Card.Content style={styles.personalContent}>
        <Text style={styles.personalText}>
          Based on your profile and {sportsNutritionData[selectedSport].name.toLowerCase()} focus:
        </Text>
        
        <View style={styles.recommendationGrid}>
          <Surface style={styles.recommendationItem}>
            <Icon name="local-fire-department" size={20} color="#e74c3c" />
            <Text style={styles.recommendationLabel}>Daily Calories</Text>
            <Text style={styles.recommendationValue}>2,800 kcal</Text>
          </Surface>
          
          <Surface style={styles.recommendationItem}>
            <Icon name="fitness-center" size={20} color="#3498db" />
            <Text style={styles.recommendationLabel}>Protein Target</Text>
            <Text style={styles.recommendationValue}>140g/day</Text>
          </Surface>
          
          <Surface style={styles.recommendationItem}>
            <Icon name="water-drop" size={20} color="#2196F3" />
            <Text style={styles.recommendationLabel}>Hydration</Text>
            <Text style={styles.recommendationValue}>3.5L/day</Text>
          </Surface>
          
          <Surface style={styles.recommendationItem}>
            <Icon name="schedule" size={20} color="#9b59b6" />
            <Text style={styles.recommendationLabel}>Meal Frequency</Text>
            <Text style={styles.recommendationValue}>5-6 meals</Text>
          </Surface>
        </View>

        <Button
          mode="contained"
          onPress={() => Alert.alert('Feature Coming Soon', 'Personalized meal plan generation will be available soon!')}
          style={styles.generateButton}
          buttonColor={COLORS.primary}
        >
          Generate My Meal Plan
        </Button>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <Text style={styles.headerTitle}>Sports Nutrition 🏆</Text>
        <Text style={styles.headerSubtitle}>Optimize performance with sport-specific nutrition</Text>
      </LinearGradient>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Sport Selector */}
        <View style={styles.sportsContainer}>
          {renderSportSelector()}
        </View>

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
          {/* Macro Breakdown */}
          {renderMacroBreakdown()}

          {/* Key Nutrients */}
          {renderKeyNutrients()}

          {/* Nutrient Timing */}
          {renderNutrientTiming()}

          {/* Top Foods */}
          {renderTopFoods()}

          {/* Hydration Guidelines */}
          {renderHydrationGuidelines()}

          {/* Personalized Recommendations */}
          {renderPersonalizedRecommendations()}

          <View style={{ height: 100 }} />
        </ScrollView>
      </Animated.View>

      {/* Floating Action Button */}
      <Animated.View style={[styles.fabContainer, { transform: [{ scale: pulseAnim }] }]}>
        <FAB
          style={styles.fab}
          icon="calculator"
          onPress={() => Alert.alert('Feature Coming Soon', 'Nutrition calculator will be available soon!')}
          color="#fff"
        />
      </Animated.View>
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 50,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: '#fff',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: '#fff',
    opacity: 0.9,
    marginTop: SPACING.xs,
  },
  content: {
    flex: 1,
    marginTop: -20,
  },
  sportsContainer: {
    paddingVertical: SPACING.lg,
  },
  sportsScroll: {
    paddingHorizontal: SPACING.md,
  },
  sportChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    marginRight: SPACING.md,
    borderRadius: 25,
    elevation: 2,
    minWidth: 120,
  },
  selectedSportChip: {
    backgroundColor: COLORS.primary,
  },
  sportChipText: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    marginLeft: SPACING.sm,
    fontWeight: 'bold',
  },
  selectedSportChipText: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  macroCard: {
    marginVertical: SPACING.md,
    borderRadius: 16,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  macroIcon: {
    fontSize: 28,
    marginRight: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.h2,
    color: '#fff',
    fontWeight: 'bold',
  },
  macroContent: {
    padding: SPACING.lg,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  macroItem: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: SPACING.sm,
  },
  macroLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textLight,
    marginBottom: SPACING.xs,
  },
  macroValue: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  macroBar: {
    width: '100%',
    height: 6,
    borderRadius: 3,
  },
  calorieInfo: {
    backgroundColor: '#f8f9ff',
    padding: SPACING.md,
    borderRadius: 12,
  },
  calorieText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  nutrientsCard: {
    marginVertical: SPACING.md,
    borderRadius: 16,
    elevation: 4,
    backgroundColor: '#fff',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  cardTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
    marginLeft: SPACING.md,
    fontWeight: 'bold',
  },
  nutrientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9ff',
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    borderRadius: 12,
    elevation: 1,
  },
  nutrientIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  nutrientInfo: {
    flex: 1,
  },
  nutrientName: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  nutrientAmount: {
    ...TEXT_STYLES.h3,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  nutrientBenefit: {
    ...TEXT_STYLES.caption,
    color: COLORS.textLight,
  },
  foodsCard: {
    marginVertical: SPACING.md,
    borderRadius: 16,
    elevation: 4,
    backgroundColor: '#fff',
  },
  foodCard: {
    width: 160,
    padding: SPACING.md,
    marginRight: SPACING.md,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 2,
  },
  foodIcon: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  foodName: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  foodNutrition: {
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  foodProtein: {
    ...TEXT_STYLES.caption,
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  foodCarbs: {
    ...TEXT_STYLES.caption,
    color: '#3498db',
    fontWeight: 'bold',
  },
  foodBenefit: {
    ...TEXT_STYLES.caption,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  addFoodButton: {
    borderColor: COLORS.primary,
  },
  timingCard: {
    marginVertical: SPACING.md,
    borderRadius: 16,
    elevation: 4,
  },
  timingContent: {
    padding: SPACING.md,
  },
  timingItem: {
    marginVertical: SPACING.md,
    backgroundColor: '#f0f8ff',
    padding: SPACING.md,
    borderRadius: 12,
  },
  timingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  timingTitle: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: 'bold',
    marginLeft: SPACING.sm,
  },
  timingDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textLight,
    lineHeight: 20,
  },
  hydrationCard: {
    marginVertical: SPACING.md,
    borderRadius: 16,
    elevation: 4,
    backgroundColor: '#fff',
  },
  hydrationTip: {
    backgroundColor: '#e3f2fd',
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.md,
  },
  hydrationTitle: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  hydrationText: {
    ...TEXT_STYLES.body,
    color: COLORS.textLight,
    lineHeight: 20,
  },
  electrolyteInfo: {
    backgroundColor: '#fff3e0',
    padding: SPACING.md,
    borderRadius: 12,
  },
  electrolyteTitle: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
  },
  electrolyteGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  electrolyteItem: {
    alignItems: 'center',
  },
  electrolyteName: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  electrolyteAmount: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  personalCard: {
    marginVertical: SPACING.md,
    borderRadius: 16,
    elevation: 4,
  },
  personalContent: {
    padding: SPACING.lg,
  },
  personalText: {
    ...TEXT_STYLES.body,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  recommendationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  recommendationItem: {
    width: '48%',
    padding: SPACING.md,
    borderRadius: 12,
    backgroundColor: '#f8f9ff',
    elevation: 1,
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  recommendationLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textLight,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  recommendationValue: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    fontWeight: 'bold',
    marginTop: SPACING.xs,
  },
  generateButton: {
    borderRadius: 25,
    paddingVertical: SPACING.sm,
  },
  fabContainer: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 20,
  },
  fab: {
    backgroundColor: COLORS.primary,
  },
};

export default SportsNutrition;