import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  StatusBar,
  Alert,
  RefreshControl,
  Animated,
  Dimensions,
  TouchableOpacity,
  Vibration
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
  TextInput,
  Searchbar,
  Portal,
  Modal,
  RadioButton
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Design System Constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f7fa',
  surface: '#ffffff',
  text: '#2c3e50',
  textSecondary: '#7f8c8d',
  accent: '#e74c3c'
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold' },
  h2: { fontSize: 24, fontWeight: '600' },
  h3: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16 },
  caption: { fontSize: 12 },
  button: { fontSize: 16, fontWeight: '600' }
};

const { width } = Dimensions.get('window');

const CalorieCalculator = ({ navigation }) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('calculator');
  const [showResultModal, setShowResultModal] = useState(false);

  // Calculator form state
  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    age: '',
    gender: 'male',
    activityLevel: 'moderately_active',
    goal: 'maintain'
  });

  // Results state
  const [calculationResult, setCalculationResult] = useState({
    bmr: 0,
    tdee: 0,
    targetCalories: 0,
    macros: { protein: 0, carbs: 0, fats: 0 }
  });

  // Search and client state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);

  // Redux state
  const dispatch = useDispatch();
  const { user, clients } = useSelector(state => state.auth || {});

  // Activity level multipliers
  const activityLevels = {
    sedentary: { value: 1.2, label: '🛋️ Sedentary (desk job)' },
    lightly_active: { value: 1.375, label: '🚶 Lightly Active (1-3 days/week)' },
    moderately_active: { value: 1.55, label: '🏃 Moderately Active (3-5 days/week)' },
    very_active: { value: 1.725, label: '💪 Very Active (6-7 days/week)' },
    extremely_active: { value: 1.9, label: '🏋️ Extremely Active (2x/day)' }
  };

  // Goal adjustments
  const goalAdjustments = {
    lose_weight: { multiplier: 0.8, label: '📉 Lose Weight (-20%)' },
    maintain: { multiplier: 1.0, label: '⚖️ Maintain Weight' },
    gain_weight: { multiplier: 1.2, label: '📈 Gain Weight (+20%)' },
    muscle_gain: { multiplier: 1.15, label: '💪 Muscle Gain (+15%)' }
  };

  // Animation setup
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

  // Calculate BMR using Mifflin-St Jeor Equation
  const calculateBMR = (weight, height, age, gender) => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseFloat(age);

    if (gender === 'male') {
      return (10 * w) + (6.25 * h) - (5 * a) + 5;
    } else {
      return (10 * w) + (6.25 * h) - (5 * a) - 161;
    }
  };

  // Calculate macronutrient distribution
  const calculateMacros = (calories) => {
    return {
      protein: Math.round((calories * 0.3) / 4), // 30% protein
      carbs: Math.round((calories * 0.4) / 4),   // 40% carbs
      fats: Math.round((calories * 0.3) / 9)     // 30% fats
    };
  };

  // Handle calculation
  const handleCalculate = useCallback(() => {
    const { weight, height, age, gender, activityLevel, goal } = formData;

    if (!weight || !height || !age) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    Vibration.vibrate(50);
    setLoading(true);

    setTimeout(() => {
      const bmr = calculateBMR(weight, height, age, gender);
      const tdee = bmr * activityLevels[activityLevel].value;
      const targetCalories = Math.round(tdee * goalAdjustments[goal].multiplier);
      const macros = calculateMacros(targetCalories);

      setCalculationResult({
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        targetCalories,
        macros
      });

      setLoading(false);
      setShowResultModal(true);
    }, 1000);
  }, [formData]);

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  // Handle input change
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Save calculation for client
  const saveCalculationForClient = useCallback(() => {
    if (!selectedClient) {
      Alert.alert('No Client Selected', 'Please select a client first');
      return;
    }

    Alert.alert(
      'Calculation Saved! 🎉',
      `Calorie calculation saved for ${selectedClient.name}\nTarget: ${calculationResult.targetCalories} calories/day`,
      [{ text: 'OK', onPress: () => setShowResultModal(false) }]
    );
  }, [selectedClient, calculationResult]);

  // Filter clients based on search
  const filteredClients = clients?.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.header}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.headerContent}>
        <IconButton
          icon="arrow-back"
          iconColor="white"
          size={24}
          onPress={() => navigation.goBack()}
        />
        <View style={styles.headerTextContainer}>
          <Text style={[TEXT_STYLES.h2, styles.headerTitle]}>
            🍎 Calorie Calculator
          </Text>
          <Text style={styles.headerSubtitle}>
            Calculate daily calorie needs for your clients
          </Text>
        </View>
        <Avatar.Icon size={40} icon="calculator" style={styles.headerAvatar} />
      </View>
    </LinearGradient>
  );

  const renderTabSelector = () => (
    <Surface style={styles.tabContainer} elevation={2}>
      <View style={styles.tabRow}>
        {['calculator', 'clients', 'history'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && styles.activeTab
            ]}
            onPress={() => {
              setActiveTab(tab);
              Vibration.vibrate(30);
            }}
          >
            <Icon
              name={tab === 'calculator' ? 'calculate' : tab === 'clients' ? 'people' : 'history'}
              size={20}
              color={activeTab === tab ? COLORS.primary : COLORS.textSecondary}
            />
            <Text style={[
              styles.tabText,
              activeTab === tab && styles.activeTabText
            ]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </Surface>
  );

  const renderCalculatorForm = () => (
    <Animated.View style={[
      styles.formContainer,
      {
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }]
      }
    ]}>
      <Card style={styles.formCard} elevation={4}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
            📊 Basic Information
          </Text>

          <View style={styles.inputRow}>
            <View style={styles.inputHalf}>
              <TextInput
                label="Weight (kg)"
                value={formData.weight}
                onChangeText={(value) => handleInputChange('weight', value)}
                keyboardType="numeric"
                mode="outlined"
                left={<TextInput.Icon icon="weight-kilogram" />}
                style={styles.input}
              />
            </View>
            <View style={styles.inputHalf}>
              <TextInput
                label="Height (cm)"
                value={formData.height}
                onChangeText={(value) => handleInputChange('height', value)}
                keyboardType="numeric"
                mode="outlined"
                left={<TextInput.Icon icon="human-male-height" />}
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputHalf}>
              <TextInput
                label="Age (years)"
                value={formData.age}
                onChangeText={(value) => handleInputChange('age', value)}
                keyboardType="numeric"
                mode="outlined"
                left={<TextInput.Icon icon="cake-variant" />}
                style={styles.input}
              />
            </View>
            <View style={styles.inputHalf}>
              <Text style={styles.inputLabel}>Gender</Text>
              <RadioButton.Group
                onValueChange={(value) => handleInputChange('gender', value)}
                value={formData.gender}
              >
                <View style={styles.radioRow}>
                  <RadioButton.Item label="Male" value="male" />
                  <RadioButton.Item label="Female" value="female" />
                </View>
              </RadioButton.Group>
            </View>
          </View>

          <Text style={[TEXT_STYLES.h3, styles.sectionTitle, { marginTop: SPACING.lg }]}>
            🏃 Activity & Goals
          </Text>

          <Text style={styles.inputLabel}>Activity Level</Text>
          <View style={styles.chipContainer}>
            {Object.entries(activityLevels).map(([key, { label }]) => (
              <Chip
                key={key}
                selected={formData.activityLevel === key}
                onPress={() => handleInputChange('activityLevel', key)}
                style={[
                  styles.activityChip,
                  formData.activityLevel === key && styles.selectedChip
                ]}
                textStyle={styles.chipText}
              >
                {label}
              </Chip>
            ))}
          </View>

          <Text style={[styles.inputLabel, { marginTop: SPACING.md }]}>Goal</Text>
          <View style={styles.chipContainer}>
            {Object.entries(goalAdjustments).map(([key, { label }]) => (
              <Chip
                key={key}
                selected={formData.goal === key}
                onPress={() => handleInputChange('goal', key)}
                style={[
                  styles.goalChip,
                  formData.goal === key && styles.selectedChip
                ]}
                textStyle={styles.chipText}
              >
                {label}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={handleCalculate}
        loading={loading}
        disabled={loading}
        style={styles.calculateButton}
        contentStyle={styles.buttonContent}
        labelStyle={TEXT_STYLES.button}
        icon="calculator"
      >
        {loading ? 'Calculating...' : 'Calculate Calories 🚀'}
      </Button>
    </Animated.View>
  );

  const renderClientSelector = () => (
    <View style={styles.clientSection}>
      <Searchbar
        placeholder="Search clients..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
        iconColor={COLORS.primary}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.clientScroll}>
        {filteredClients.map((client) => (
          <TouchableOpacity
            key={client.id}
            style={[
              styles.clientCard,
              selectedClient?.id === client.id && styles.selectedClientCard
            ]}
            onPress={() => setSelectedClient(client)}
          >
            <Avatar.Text
              size={50}
              label={client.name.charAt(0)}
              style={styles.clientAvatar}
            />
            <Text style={styles.clientName}>{client.name}</Text>
            <Text style={styles.clientAge}>{client.age}y</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderResultModal = () => (
    <Portal>
      <Modal
        visible={showResultModal}
        onDismiss={() => setShowResultModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Card style={styles.resultCard} elevation={8}>
          <Card.Content>
            <View style={styles.resultHeader}>
              <Icon name="analytics" size={40} color={COLORS.primary} />
              <Text style={[TEXT_STYLES.h2, styles.resultTitle]}>
                📊 Calculation Results
              </Text>
            </View>

            <View style={styles.resultGrid}>
              <Surface style={styles.resultItem} elevation={2}>
                <Text style={styles.resultLabel}>BMR</Text>
                <Text style={styles.resultValue}>{calculationResult.bmr}</Text>
                <Text style={styles.resultUnit}>cal/day</Text>
              </Surface>

              <Surface style={styles.resultItem} elevation={2}>
                <Text style={styles.resultLabel}>TDEE</Text>
                <Text style={styles.resultValue}>{calculationResult.tdee}</Text>
                <Text style={styles.resultUnit}>cal/day</Text>
              </Surface>

              <Surface style={styles.resultItem} elevation={2}>
                <Text style={styles.resultLabel}>Target</Text>
                <Text style={[styles.resultValue, { color: COLORS.primary }]}>
                  {calculationResult.targetCalories}
                </Text>
                <Text style={styles.resultUnit}>cal/day</Text>
              </Surface>
            </View>

            <Text style={[TEXT_STYLES.h3, styles.macrosTitle]}>
              🥗 Macro Distribution
            </Text>

            <View style={styles.macroContainer}>
              {[
                { name: 'Protein', value: calculationResult.macros.protein, color: COLORS.error, unit: 'g' },
                { name: 'Carbs', value: calculationResult.macros.carbs, color: COLORS.warning, unit: 'g' },
                { name: 'Fats', value: calculationResult.macros.fats, color: COLORS.success, unit: 'g' }
              ].map((macro) => (
                <View key={macro.name} style={styles.macroItem}>
                  <Text style={styles.macroName}>{macro.name}</Text>
                  <ProgressBar
                    progress={0.8}
                    color={macro.color}
                    style={styles.macroBar}
                  />
                  <Text style={styles.macroValue}>{macro.value}{macro.unit}</Text>
                </View>
              ))}
            </View>

            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => setShowResultModal(false)}
                style={styles.modalButton}
              >
                Close
              </Button>
              <Button
                mode="contained"
                onPress={saveCalculationForClient}
                style={[styles.modalButton, styles.saveButton]}
                icon="content-save"
              >
                Save for Client
              </Button>
            </View>
          </Card.Content>
        </Card>
      </Modal>
    </Portal>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'calculator':
        return renderCalculatorForm();
      case 'clients':
        return (
          <View style={styles.tabContent}>
            <Text style={[TEXT_STYLES.h3, styles.comingSoonTitle]}>
              👥 Client Management
            </Text>
            <Icon name="construction" size={80} color={COLORS.textSecondary} style={styles.constructionIcon} />
            <Text style={styles.comingSoonText}>
              Feature Coming Soon! 🚧
            </Text>
          </View>
        );
      case 'history':
        return (
          <View style={styles.tabContent}>
            <Text style={[TEXT_STYLES.h3, styles.comingSoonTitle]}>
              📈 Calculation History
            </Text>
            <Icon name="construction" size={80} color={COLORS.textSecondary} style={styles.constructionIcon} />
            <Text style={styles.comingSoonText}>
              Feature Coming Soon! 🚧
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderTabSelector()}
      
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
        {activeTab === 'calculator' && renderClientSelector()}
        {renderTabContent()}
      </ScrollView>

      {renderResultModal()}

      <FAB
        icon="help"
        style={styles.fab}
        onPress={() => {
          Alert.alert(
            'Calorie Calculator Help 💡',
            'BMR = Basal Metabolic Rate (calories at rest)\nTDEE = Total Daily Energy Expenditure\nTarget = Adjusted calories for your goal\n\nThe calculator uses the Mifflin-St Jeor equation for accuracy.'
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
    paddingTop: StatusBar.currentHeight + SPACING.md,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  headerTitle: {
    color: 'white',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  headerAvatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  tabContainer: {
    margin: SPACING.md,
    borderRadius: 12,
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.sm,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: COLORS.primary + '20',
  },
  tabText: {
    marginLeft: SPACING.xs,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  clientSection: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  searchbar: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  clientScroll: {
    marginBottom: SPACING.md,
  },
  clientCard: {
    alignItems: 'center',
    padding: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    elevation: 2,
    width: 80,
  },
  selectedClientCard: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  clientAvatar: {
    marginBottom: SPACING.xs,
  },
  clientName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  clientAge: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  formContainer: {
    paddingHorizontal: SPACING.md,
  },
  formCard: {
    marginBottom: SPACING.lg,
    borderRadius: 16,
  },
  sectionTitle: {
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  inputHalf: {
    flex: 0.48,
  },
  input: {
    backgroundColor: 'transparent',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  radioRow: {
    flexDirection: 'row',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.sm,
  },
  activityChip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  goalChip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  selectedChip: {
    backgroundColor: COLORS.primary + '20',
  },
  chipText: {
    fontSize: 12,
  },
  calculateButton: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.lg,
    borderRadius: 12,
    elevation: 4,
  },
  buttonContent: {
    paddingVertical: SPACING.sm,
  },
  tabContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xl * 2,
  },
  comingSoonTitle: {
    color: COLORS.text,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  constructionIcon: {
    marginBottom: SPACING.lg,
  },
  comingSoonText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  },
  modalContainer: {
    padding: SPACING.md,
    justifyContent: 'center',
  },
  resultCard: {
    borderRadius: 20,
    maxHeight: '90%',
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  resultTitle: {
    color: COLORS.text,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  resultGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.lg,
  },
  resultItem: {
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 12,
    flex: 0.3,
  },
  resultLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  resultValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  resultUnit: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  macrosTitle: {
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  macroContainer: {
    marginBottom: SPACING.lg,
  },
  macroItem: {
    marginBottom: SPACING.md,
  },
  macroName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  macroBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.xs,
  },
  macroValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'right',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 0.45,
    borderRadius: 12,
  },
  saveButton: {
    elevation: 2,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default CalorieCalculator;