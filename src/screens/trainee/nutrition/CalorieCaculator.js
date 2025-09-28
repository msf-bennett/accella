import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  Animated,
  Alert,
  RefreshControl,
  Vibration,
  Dimensions,
} from 'react-native';
import {
  Card,
  Button,
  Surface,
  ProgressBar,
  Avatar,
  IconButton,
  FAB,
  Chip,
  Portal,
  Modal,
  TextInput,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Design system imports (assumed to be available)
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const CaloryCalculator = ({ navigation }) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Redux state
  const user = useSelector(state => state.auth.user);
  const nutritionData = useSelector(state => state.nutrition);
  const dispatch = useDispatch();

  // Component state
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  
  // Calculator inputs
  const [gender, setGender] = useState('male');
  const [age, setAge] = useState('25');
  const [weight, setWeight] = useState('70');
  const [height, setHeight] = useState('175');
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [goal, setGoal] = useState('maintain');
  
  // Results
  const [bmr, setBMR] = useState(0);
  const [tdee, setTDEE] = useState(0);
  const [targetCalories, setTargetCalories] = useState(0);
  const [macros, setMacros] = useState({
    protein: 0,
    carbs: 0,
    fats: 0,
  });

  // Activity level multipliers
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    veryActive: 1.9,
  };

  // Goal adjustments (calorie surplus/deficit)
  const goalAdjustments = {
    lose2: -1000, // Lose 2 lbs/week
    lose1: -500,  // Lose 1 lb/week
    lose0_5: -250, // Lose 0.5 lbs/week
    maintain: 0,   // Maintain weight
    gain0_5: 250,  // Gain 0.5 lbs/week
    gain1: 500,    // Gain 1 lb/week
    gain2: 1000,   // Gain 2 lbs/week (muscle building)
  };

  useEffect(() => {
    // Entrance animations
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
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const calculateCalories = useCallback(() => {
    try {
      setLoading(true);
      Vibration.vibrate(50);

      const weightNum = parseFloat(weight);
      const heightNum = parseFloat(height);
      const ageNum = parseFloat(age);

      if (!weightNum || !heightNum || !ageNum) {
        Alert.alert('Invalid Input', 'Please enter valid numbers for all fields.');
        setLoading(false);
        return;
      }

      // Calculate BMR using Mifflin-St Jeor Equation
      let bmrResult;
      if (gender === 'male') {
        bmrResult = 10 * weightNum + 6.25 * heightNum - 5 * ageNum + 5;
      } else {
        bmrResult = 10 * weightNum + 6.25 * heightNum - 5 * ageNum - 161;
      }

      // Calculate TDEE
      const tdeeResult = bmrResult * activityMultipliers[activityLevel];

      // Calculate target calories based on goal
      const targetResult = tdeeResult + goalAdjustments[goal];

      // Calculate macros (40% carbs, 30% protein, 30% fats)
      const macrosResult = {
        protein: Math.round((targetResult * 0.3) / 4), // 4 calories per gram
        carbs: Math.round((targetResult * 0.4) / 4),   // 4 calories per gram
        fats: Math.round((targetResult * 0.3) / 9),    // 9 calories per gram
      };

      setBMR(Math.round(bmrResult));
      setTDEE(Math.round(tdeeResult));
      setTargetCalories(Math.round(targetResult));
      setMacros(macrosResult);

      // Show results with animation
      setTimeout(() => {
        setLoading(false);
        setShowResultsModal(true);
      }, 1000);

      // Save to Redux store
      dispatch({
        type: 'SAVE_CALORIE_CALCULATION',
        payload: {
          bmr: Math.round(bmrResult),
          tdee: Math.round(tdeeResult),
          targetCalories: Math.round(targetResult),
          macros: macrosResult,
          timestamp: new Date().toISOString(),
        },
      });

    } catch (error) {
      setLoading(false);
      Alert.alert('Calculation Error', 'An error occurred while calculating calories.');
    }
  }, [weight, height, age, gender, activityLevel, goal, dispatch]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const getActivityLevelText = (level) => {
    const texts = {
      sedentary: 'Little/no exercise',
      light: 'Light exercise 1-3 days/week',
      moderate: 'Moderate exercise 3-5 days/week',
      active: 'Hard exercise 6-7 days/week',
      veryActive: 'Very hard exercise, physical job',
    };
    return texts[level];
  };

  const getGoalText = (goalKey) => {
    const texts = {
      lose2: 'Lose 2 lbs/week (Aggressive)',
      lose1: 'Lose 1 lb/week',
      lose0_5: 'Lose 0.5 lbs/week (Mild)',
      maintain: 'Maintain current weight',
      gain0_5: 'Gain 0.5 lbs/week (Lean)',
      gain1: 'Gain 1 lb/week',
      gain2: 'Gain 2 lbs/week (Bulk)',
    };
    return texts[goalKey];
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{
          paddingTop: StatusBar.currentHeight + SPACING.lg,
          paddingBottom: SPACING.lg,
          paddingHorizontal: SPACING.md,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <IconButton
            icon="arrow-back"
            iconColor="white"
            size={24}
            onPress={() => navigation.goBack()}
          />
          <Text style={[TEXT_STYLES.header, { color: 'white', marginLeft: SPACING.sm }]}>
            🔥 Calorie Calculator
          </Text>
        </View>
        <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.9)', marginTop: SPACING.xs }]}>
          Calculate your daily calorie needs and macros
        </Text>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
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
          style={{
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim },
            ],
            padding: SPACING.md,
          }}
        >
          {/* Basic Information Card */}
          <Card style={{ marginBottom: SPACING.md }}>
            <Card.Content style={{ padding: SPACING.md }}>
              <Text style={[TEXT_STYLES.subheader, { marginBottom: SPACING.md }]}>
                📋 Basic Information
              </Text>

              {/* Gender Selection */}
              <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.sm, fontWeight: 'bold' }]}>
                Gender
              </Text>
              <View style={{ flexDirection: 'row', marginBottom: SPACING.md }}>
                <Chip
                  selected={gender === 'male'}
                  onPress={() => setGender('male')}
                  style={{ marginRight: SPACING.sm }}
                  icon="account"
                >
                  Male
                </Chip>
                <Chip
                  selected={gender === 'female'}
                  onPress={() => setGender('female')}
                  icon="account"
                >
                  Female
                </Chip>
              </View>

              {/* Age Input */}
              <TextInput
                label="Age (years)"
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                mode="outlined"
                left={<TextInput.Icon icon="cake" />}
                style={{ marginBottom: SPACING.md }}
              />

              {/* Weight Input */}
              <TextInput
                label="Weight (kg)"
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
                mode="outlined"
                left={<TextInput.Icon icon="scale-bathroom" />}
                style={{ marginBottom: SPACING.md }}
              />

              {/* Height Input */}
              <TextInput
                label="Height (cm)"
                value={height}
                onChangeText={setHeight}
                keyboardType="numeric"
                mode="outlined"
                left={<TextInput.Icon icon="human-male-height" />}
                style={{ marginBottom: SPACING.md }}
              />
            </Card.Content>
          </Card>

          {/* Activity Level Card */}
          <Card style={{ marginBottom: SPACING.md }}>
            <Card.Content style={{ padding: SPACING.md }}>
              <Text style={[TEXT_STYLES.subheader, { marginBottom: SPACING.md }]}>
                🏃‍♂️ Activity Level
              </Text>
              
              {Object.entries(activityMultipliers).map(([key, value]) => (
                <Surface
                  key={key}
                  style={{
                    padding: SPACING.sm,
                    marginBottom: SPACING.sm,
                    borderRadius: 8,
                    backgroundColor: activityLevel === key ? COLORS.primary + '20' : 'transparent',
                    borderWidth: activityLevel === key ? 2 : 1,
                    borderColor: activityLevel === key ? COLORS.primary : COLORS.surface,
                  }}
                >
                  <Button
                    mode="text"
                    onPress={() => setActivityLevel(key)}
                    contentStyle={{ justifyContent: 'flex-start' }}
                  >
                    <View>
                      <Text style={[TEXT_STYLES.body, { fontWeight: 'bold' }]}>
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </Text>
                      <Text style={[TEXT_STYLES.caption]}>
                        {getActivityLevelText(key)}
                      </Text>
                    </View>
                  </Button>
                </Surface>
              ))}
            </Card.Content>
          </Card>

          {/* Goal Selection Card */}
          <Card style={{ marginBottom: SPACING.md }}>
            <Card.Content style={{ padding: SPACING.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={[TEXT_STYLES.subheader, { marginBottom: SPACING.md }]}>
                  🎯 Your Goal
                </Text>
                <IconButton
                  icon="help-circle-outline"
                  size={20}
                  onPress={() => setShowGoalModal(true)}
                />
              </View>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {Object.entries(goalAdjustments).map(([key, adjustment]) => (
                  <Chip
                    key={key}
                    selected={goal === key}
                    onPress={() => setGoal(key)}
                    style={{ marginRight: SPACING.sm, marginBottom: SPACING.sm }}
                    icon={
                      adjustment < 0 ? "trending-down" : 
                      adjustment === 0 ? "trending-flat" : "trending-up"
                    }
                  >
                    {key.includes('lose') ? '📉' : key.includes('gain') ? '📈' : '⚖️'} {getGoalText(key).split(' ')[1]}
                  </Chip>
                ))}
              </ScrollView>
            </Card.Content>
          </Card>

          {/* Previous Results Card */}
          {nutritionData?.lastCalculation && (
            <Card style={{ marginBottom: SPACING.md }}>
              <Card.Content style={{ padding: SPACING.md }}>
                <Text style={[TEXT_STYLES.subheader, { marginBottom: SPACING.md }]}>
                  📊 Last Calculation
                </Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={[TEXT_STYLES.caption]}>Target Calories</Text>
                    <Text style={[TEXT_STYLES.subheader, { color: COLORS.primary }]}>
                      {nutritionData.lastCalculation.targetCalories}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={[TEXT_STYLES.caption]}>Protein</Text>
                    <Text style={[TEXT_STYLES.subheader, { color: COLORS.success }]}>
                      {nutritionData.lastCalculation.macros?.protein}g
                    </Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={[TEXT_STYLES.caption]}>Carbs</Text>
                    <Text style={[TEXT_STYLES.subheader, { color: COLORS.secondary }]}>
                      {nutritionData.lastCalculation.macros?.carbs}g
                    </Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={[TEXT_STYLES.caption]}>Fats</Text>
                    <Text style={[TEXT_STYLES.subheader, { color: COLORS.error }]}>
                      {nutritionData.lastCalculation.macros?.fats}g
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          )}

          {/* Tips Card */}
          <Card style={{ marginBottom: SPACING.xl }}>
            <Card.Content style={{ padding: SPACING.md }}>
              <Text style={[TEXT_STYLES.subheader, { marginBottom: SPACING.md }]}>
                💡 Pro Tips
              </Text>
              <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.sm }]}>
                • Weigh yourself at the same time each day for consistency
              </Text>
              <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.sm }]}>
                • Adjust calories based on weekly weight changes
              </Text>
              <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.sm }]}>
                • Stay hydrated - drink at least 8 glasses of water daily
              </Text>
              <Text style={[TEXT_STYLES.body]}>
                • Focus on whole foods for better results
              </Text>
            </Card.Content>
          </Card>
        </Animated.View>
      </ScrollView>

      {/* Calculate FAB */}
      <FAB
        icon="calculator"
        label="Calculate Calories"
        onPress={calculateCalories}
        loading={loading}
        style={{
          position: 'absolute',
          margin: SPACING.md,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.primary,
        }}
      />

      {/* Goal Help Modal */}
      <Portal>
        <Modal
          visible={showGoalModal}
          onDismiss={() => setShowGoalModal(false)}
          contentContainerStyle={{
            backgroundColor: 'white',
            padding: SPACING.lg,
            margin: SPACING.lg,
            borderRadius: 12,
          }}
        >
          <Text style={[TEXT_STYLES.subheader, { marginBottom: SPACING.md }]}>
            🎯 Goal Guidelines
          </Text>
          <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.sm }]}>
            <Text style={{ fontWeight: 'bold' }}>Weight Loss:</Text> Create a calorie deficit
          </Text>
          <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.sm }]}>
            <Text style={{ fontWeight: 'bold' }}>Maintenance:</Text> Balance calories in vs out
          </Text>
          <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.md }]}>
            <Text style={{ fontWeight: 'bold' }}>Weight Gain:</Text> Create a calorie surplus
          </Text>
          <Button mode="contained" onPress={() => setShowGoalModal(false)}>
            Got it!
          </Button>
        </Modal>
      </Portal>

      {/* Results Modal */}
      <Portal>
        <Modal
          visible={showResultsModal}
          onDismiss={() => setShowResultsModal(false)}
          contentContainerStyle={{
            backgroundColor: 'white',
            padding: SPACING.lg,
            margin: SPACING.lg,
            borderRadius: 12,
            maxHeight: '80%',
          }}
        >
          <ScrollView>
            <Text style={[TEXT_STYLES.header, { textAlign: 'center', marginBottom: SPACING.lg }]}>
              🎉 Your Results
            </Text>

            {/* BMR */}
            <Surface style={{ padding: SPACING.md, marginBottom: SPACING.md, borderRadius: 8 }}>
              <Text style={[TEXT_STYLES.subheader, { color: COLORS.primary }]}>
                Basal Metabolic Rate (BMR)
              </Text>
              <Text style={[TEXT_STYLES.title, { fontSize: 24 }]}>{bmr} calories/day</Text>
              <Text style={[TEXT_STYLES.caption]}>
                Calories burned at rest
              </Text>
            </Surface>

            {/* TDEE */}
            <Surface style={{ padding: SPACING.md, marginBottom: SPACING.md, borderRadius: 8 }}>
              <Text style={[TEXT_STYLES.subheader, { color: COLORS.secondary }]}>
                Total Daily Energy Expenditure (TDEE)
              </Text>
              <Text style={[TEXT_STYLES.title, { fontSize: 24 }]}>{tdee} calories/day</Text>
              <Text style={[TEXT_STYLES.caption]}>
                Total calories burned including activity
              </Text>
            </Surface>

            {/* Target Calories */}
            <Surface style={{ padding: SPACING.md, marginBottom: SPACING.md, borderRadius: 8 }}>
              <Text style={[TEXT_STYLES.subheader, { color: COLORS.success }]}>
                Target Daily Calories
              </Text>
              <Text style={[TEXT_STYLES.title, { fontSize: 28, fontWeight: 'bold' }]}>
                {targetCalories} calories/day
              </Text>
              <Text style={[TEXT_STYLES.caption]}>
                To achieve your goal: {getGoalText(goal)}
              </Text>
            </Surface>

            {/* Macros */}
            <Surface style={{ padding: SPACING.md, marginBottom: SPACING.lg, borderRadius: 8 }}>
              <Text style={[TEXT_STYLES.subheader, { marginBottom: SPACING.md }]}>
                📊 Recommended Macros
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ alignItems: 'center', flex: 1 }}>
                  <Text style={[TEXT_STYLES.body, { color: COLORS.success, fontWeight: 'bold' }]}>
                    Protein
                  </Text>
                  <Text style={[TEXT_STYLES.title]}>{macros.protein}g</Text>
                  <Text style={[TEXT_STYLES.caption]}>30%</Text>
                </View>
                <View style={{ alignItems: 'center', flex: 1 }}>
                  <Text style={[TEXT_STYLES.body, { color: COLORS.secondary, fontWeight: 'bold' }]}>
                    Carbs
                  </Text>
                  <Text style={[TEXT_STYLES.title]}>{macros.carbs}g</Text>
                  <Text style={[TEXT_STYLES.caption]}>40%</Text>
                </View>
                <View style={{ alignItems: 'center', flex: 1 }}>
                  <Text style={[TEXT_STYLES.body, { color: COLORS.error, fontWeight: 'bold' }]}>
                    Fats
                  </Text>
                  <Text style={[TEXT_STYLES.title]}>{macros.fats}g</Text>
                  <Text style={[TEXT_STYLES.caption]}>30%</Text>
                </View>
              </View>
            </Surface>

            <Button
              mode="contained"
              onPress={() => {
                setShowResultsModal(false);
                navigation.navigate('NutritionPlanner', { calculatedCalories: targetCalories });
              }}
              style={{ marginBottom: SPACING.sm }}
            >
              Create Meal Plan
            </Button>
            
            <Button mode="outlined" onPress={() => setShowResultsModal(false)}>
              Close
            </Button>
          </ScrollView>
        </Modal>
      </Portal>
    </View>
  );
};

export default CaloryCalculator;