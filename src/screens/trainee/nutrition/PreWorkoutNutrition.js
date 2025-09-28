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
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const PreWorkoutNutrition = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTiming, setSelectedTiming] = useState('30min');
  const [showNutritionTips, setShowNutritionTips] = useState(false);
  
  const dispatch = useDispatch();
  const { user, nutritionPlans, workoutSchedule } = useSelector(state => state.user);
  const { loading } = useSelector(state => state.app);

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

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
    }, 2000);
  }, []);

  // Pre-workout nutrition recommendations based on timing
  const nutritionRecommendations = {
    '30min': {
      title: '30 Minutes Before Workout',
      foods: [
        { name: 'Banana', icon: '🍌', calories: 105, carbs: 27, description: 'Quick energy and potassium' },
        { name: 'Energy Bar', icon: '🍫', calories: 200, carbs: 30, description: 'Convenient portable fuel' },
        { name: 'Sports Drink', icon: '🥤', calories: 80, carbs: 20, description: 'Hydration + quick carbs' },
        { name: 'Dates', icon: '🫐', calories: 66, carbs: 18, description: 'Natural sugar boost' },
      ],
      tips: ['Focus on simple carbs', 'Avoid fiber and fat', 'Stay hydrated', 'Keep portions small']
    },
    '1hour': {
      title: '1 Hour Before Workout',
      foods: [
        { name: 'Oatmeal + Berries', icon: '🥣', calories: 250, carbs: 45, description: 'Sustained energy release' },
        { name: 'Toast + Honey', icon: '🍞', calories: 180, carbs: 35, description: 'Simple and effective' },
        { name: 'Greek Yogurt', icon: '🥛', calories: 130, carbs: 15, description: 'Protein + quick carbs' },
        { name: 'Rice Cakes', icon: '🍘', calories: 70, carbs: 16, description: 'Light and digestible' },
      ],
      tips: ['Mix simple and complex carbs', 'Add small amount of protein', 'Moderate portions', 'Include some electrolytes']
    },
    '2hours': {
      title: '2-3 Hours Before Workout',
      foods: [
        { name: 'Chicken + Rice', icon: '🍗', calories: 400, carbs: 60, description: 'Complete balanced meal' },
        { name: 'Pasta + Sauce', icon: '🍝', calories: 350, carbs: 70, description: 'Carb loading option' },
        { name: 'Smoothie Bowl', icon: '🥤', calories: 280, carbs: 45, description: 'Nutrients + hydration' },
        { name: 'Sandwich', icon: '🥪', calories: 320, carbs: 40, description: 'Balanced macro profile' },
      ],
      tips: ['Full balanced meal OK', 'Include lean protein', 'Complex carbs preferred', 'Allow proper digestion time']
    }
  };

  // Hydration guidelines
  const hydrationPlan = [
    { time: '2-3 hours before', amount: '500-600ml', type: 'water', icon: '💧' },
    { time: '15-20 minutes before', amount: '200-300ml', type: 'water or sports drink', icon: '🥤' },
    { time: 'During workout', amount: '150-250ml every 15-20min', type: 'sports drink if >1hr', icon: '⚡' },
  ];

  // Supplement recommendations
  const supplements = [
    { name: 'Caffeine', timing: '30-45 min before', benefit: 'Energy & Focus', icon: '☕', dosage: '100-200mg' },
    { name: 'Creatine', timing: 'Anytime', benefit: 'Power & Strength', icon: '💪', dosage: '3-5g' },
    { name: 'Beta-Alanine', timing: '30 min before', benefit: 'Endurance', icon: '🔥', dosage: '2-5g' },
    { name: 'BCAAs', timing: '30 min before', benefit: 'Muscle Protection', icon: '🏃', dosage: '10-15g' },
  ];

  const categories = [
    { id: 'all', label: 'All', icon: 'restaurant' },
    { id: 'quick', label: 'Quick Fuel', icon: 'flash-on' },
    { id: 'energy', label: 'Energy Boost', icon: 'battery-charging-full' },
    { id: 'hydration', label: 'Hydration', icon: 'water-drop' },
    { id: 'supplements', label: 'Supplements', icon: 'medication' },
  ];

  const renderNutritionCard = (item, timing) => (
    <Card key={item.name} style={styles.nutritionCard}>
      <Card.Content>
        <View style={styles.foodHeader}>
          <Text style={styles.foodIcon}>{item.icon}</Text>
          <View style={styles.foodInfo}>
            <Text style={styles.foodName}>{item.name}</Text>
            <Text style={styles.foodDescription}>{item.description}</Text>
          </View>
          <View style={styles.nutritionStats}>
            <Text style={styles.calories}>{item.calories} cal</Text>
            <Text style={styles.carbs}>{item.carbs}g carbs</Text>
          </View>
        </View>
        <Button
          mode="outlined"
          onPress={() => Alert.alert('Feature Coming Soon', 'Add to meal plan functionality will be available in the next update!')}
          style={styles.addButton}
          labelStyle={styles.addButtonText}
        >
          Add to Plan
        </Button>
      </Card.Content>
    </Card>
  );

  const renderHydrationCard = () => (
    <Card style={styles.sectionCard}>
      <LinearGradient colors={['#4facfe', '#00f2fe']} style={styles.cardHeader}>
        <Icon name="water-drop" size={24} color="#fff" />
        <Text style={styles.sectionTitle}>Hydration Strategy 💧</Text>
      </LinearGradient>
      <Card.Content style={styles.cardContent}>
        {hydrationPlan.map((item, index) => (
          <View key={index} style={styles.hydrationItem}>
            <Text style={styles.hydrationIcon}>{item.icon}</Text>
            <View style={styles.hydrationInfo}>
              <Text style={styles.hydrationTime}>{item.time}</Text>
              <Text style={styles.hydrationAmount}>{item.amount}</Text>
              <Text style={styles.hydrationType}>{item.type}</Text>
            </View>
          </View>
        ))}
        <Surface style={styles.hydrationTip}>
          <Text style={styles.tipText}>
            💡 Monitor your urine color - aim for pale yellow to ensure proper hydration!
          </Text>
        </Surface>
      </Card.Content>
    </Card>
  );

  const renderSupplementsCard = () => (
    <Card style={styles.sectionCard}>
      <LinearGradient colors={['#fa709a', '#fee140']} style={styles.cardHeader}>
        <Icon name="medication" size={24} color="#fff" />
        <Text style={styles.sectionTitle}>Pre-Workout Supplements ⚡</Text>
      </LinearGradient>
      <Card.Content style={styles.cardContent}>
        {supplements.map((supplement, index) => (
          <Surface key={index} style={styles.supplementItem}>
            <View style={styles.supplementHeader}>
              <Text style={styles.supplementIcon}>{supplement.icon}</Text>
              <View style={styles.supplementInfo}>
                <Text style={styles.supplementName}>{supplement.name}</Text>
                <Text style={styles.supplementBenefit}>{supplement.benefit}</Text>
              </View>
              <View style={styles.supplementDosage}>
                <Text style={styles.dosageText}>{supplement.dosage}</Text>
                <Text style={styles.timingText}>{supplement.timing}</Text>
              </View>
            </View>
          </Surface>
        ))}
        <Surface style={styles.supplementWarning}>
          <Icon name="warning" size={20} color={COLORS.warning} />
          <Text style={styles.warningText}>
            Always consult with a healthcare professional before starting any supplement regimen
          </Text>
        </Surface>
      </Card.Content>
    </Card>
  );

  const renderTimingSelector = () => (
    <View style={styles.timingContainer}>
      <Text style={styles.timingLabel}>Workout starts in:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timingScroll}>
        {Object.keys(nutritionRecommendations).map((timing) => (
          <Chip
            key={timing}
            selected={selectedTiming === timing}
            onPress={() => setSelectedTiming(timing)}
            style={[
              styles.timingChip,
              selectedTiming === timing && styles.selectedChip
            ]}
            textStyle={[
              styles.chipText,
              selectedTiming === timing && styles.selectedChipText
            ]}
          >
            {nutritionRecommendations[timing].title.split(' ')[0]}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const renderQuickTips = () => (
    <Card style={styles.tipsCard}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.cardHeader}>
        <Icon name="lightbulb" size={24} color="#fff" />
        <Text style={styles.sectionTitle}>Pro Tips 🎯</Text>
      </LinearGradient>
      <Card.Content style={styles.cardContent}>
        {nutritionRecommendations[selectedTiming].tips.map((tip, index) => (
          <View key={index} style={styles.tipItem}>
            <Icon name="check-circle" size={18} color={COLORS.success} />
            <Text style={styles.tipItemText}>{tip}</Text>
          </View>
        ))}
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <Text style={styles.headerTitle}>Pre-Workout Nutrition 🍎</Text>
        <Text style={styles.headerSubtitle}>Fuel your performance with smart choices</Text>
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
          {/* Timing Selector */}
          {renderTimingSelector()}

          {/* Current Recommendations */}
          <Card style={styles.recommendationCard}>
            <LinearGradient colors={['#11998e', '#38ef7d']} style={styles.cardHeader}>
              <Icon name="restaurant-menu" size={24} color="#fff" />
              <Text style={styles.sectionTitle}>{nutritionRecommendations[selectedTiming].title}</Text>
            </LinearGradient>
            <Card.Content style={styles.cardContent}>
              {nutritionRecommendations[selectedTiming].foods.map((food) => 
                renderNutritionCard(food, selectedTiming)
              )}
            </Card.Content>
          </Card>

          {/* Quick Tips */}
          {renderQuickTips()}

          {/* Hydration Strategy */}
          {renderHydrationCard()}

          {/* Supplements */}
          {renderSupplementsCard()}

          {/* Performance Tracking */}
          <Card style={styles.trackingCard}>
            <Card.Content>
              <View style={styles.trackingHeader}>
                <Icon name="trending-up" size={24} color={COLORS.primary} />
                <Text style={styles.trackingTitle}>Track Your Fuel 📊</Text>
              </View>
              <Text style={styles.trackingDescription}>
                Log what you eat before workouts to optimize your performance
              </Text>
              <Button
                mode="contained"
                onPress={() => Alert.alert('Feature Coming Soon', 'Nutrition logging will be available soon!')}
                style={styles.trackingButton}
                buttonColor={COLORS.primary}
              >
                <Icon name="add" size={18} color="#fff" />
                Log Pre-Workout Meal
              </Button>
            </Card.Content>
          </Card>

          <View style={{ height: 100 }} />
        </ScrollView>
      </Animated.View>

      {/* Floating Action Button */}
      <FAB
        style={styles.fab}
        icon="timer"
        onPress={() => Alert.alert('Feature Coming Soon', 'Pre-workout timer functionality coming soon!')}
        color="#fff"
      />
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
  scrollView: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  timingContainer: {
    marginVertical: SPACING.lg,
  },
  timingLabel: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  timingScroll: {
    paddingHorizontal: SPACING.sm,
  },
  timingChip: {
    marginRight: SPACING.md,
    backgroundColor: '#fff',
  },
  selectedChip: {
    backgroundColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.text,
  },
  selectedChipText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  sectionCard: {
    marginVertical: SPACING.md,
    borderRadius: 16,
    elevation: 4,
  },
  recommendationCard: {
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
  sectionTitle: {
    ...TEXT_STYLES.h2,
    color: '#fff',
    marginLeft: SPACING.md,
    fontWeight: 'bold',
  },
  cardContent: {
    padding: SPACING.md,
  },
  nutritionCard: {
    marginVertical: SPACING.sm,
    backgroundColor: '#f8f9ff',
  },
  foodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  foodIcon: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  foodDescription: {
    ...TEXT_STYLES.caption,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
  nutritionStats: {
    alignItems: 'flex-end',
  },
  calories: {
    ...TEXT_STYLES.h3,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  carbs: {
    ...TEXT_STYLES.caption,
    color: COLORS.textLight,
  },
  addButton: {
    borderColor: COLORS.primary,
    borderWidth: 1,
  },
  addButtonText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  hydrationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.md,
    backgroundColor: '#f0f8ff',
    padding: SPACING.md,
    borderRadius: 12,
  },
  hydrationIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  hydrationInfo: {
    flex: 1,
  },
  hydrationTime: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  hydrationAmount: {
    ...TEXT_STYLES.h3,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  hydrationType: {
    ...TEXT_STYLES.caption,
    color: COLORS.textLight,
  },
  hydrationTip: {
    backgroundColor: '#e3f2fd',
    padding: SPACING.md,
    borderRadius: 12,
    marginTop: SPACING.md,
  },
  tipText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    textAlign: 'center',
  },
  supplementItem: {
    marginVertical: SPACING.sm,
    padding: SPACING.md,
    borderRadius: 12,
    backgroundColor: '#fff5f5',
    elevation: 2,
  },
  supplementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  supplementIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  supplementInfo: {
    flex: 1,
  },
  supplementName: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  supplementBenefit: {
    ...TEXT_STYLES.caption,
    color: COLORS.textLight,
  },
  supplementDosage: {
    alignItems: 'flex-end',
  },
  dosageText: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  timingText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textLight,
  },
  supplementWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    padding: SPACING.md,
    borderRadius: 12,
    marginTop: SPACING.md,
  },
  warningText: {
    ...TEXT_STYLES.caption,
    color: COLORS.warning,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  tipsCard: {
    marginVertical: SPACING.md,
    borderRadius: 16,
    elevation: 4,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.sm,
  },
  tipItemText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    marginLeft: SPACING.md,
    flex: 1,
  },
  trackingCard: {
    marginVertical: SPACING.md,
    borderRadius: 16,
    elevation: 4,
    backgroundColor: '#fff',
  },
  trackingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  trackingTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
    marginLeft: SPACING.md,
    fontWeight: 'bold',
  },
  trackingDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textLight,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  trackingButton: {
    borderRadius: 25,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 20,
    backgroundColor: COLORS.primary,
  },
};

export default PreWorkoutNutrition;
