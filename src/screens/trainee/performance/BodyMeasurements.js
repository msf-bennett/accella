import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  RefreshControl,
  Dimensions,
  Vibration,
} from 'react-native';
import {
  Card,
  Button,
  TextInput,
  Chip,
  ProgressBar,
  Surface,
  Portal,
  Modal,
  IconButton,
  FAB,
  Avatar,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LineChart } from 'react-native-chart-kit';

// Design system imports
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4caf50',
  error: '#f44336',
  warning: '#ff9800',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
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
  h3: { fontSize: 20, fontWeight: 'bold' },
  body: { fontSize: 16 },
  caption: { fontSize: 12 },
};

const { width } = Dimensions.get('window');

const BodyMeasurements = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, measurements } = useSelector(state => ({
    user: state.auth.user,
    measurements: state.performance.measurements || {},
  }));

  // State for measurements
  const [currentMeasurements, setCurrentMeasurements] = useState({
    height: '',
    weight: '',
    bodyFat: '',
    muscleMass: '',
    waist: '',
    chest: '',
    hips: '',
    neck: '',
    bicep: '',
    thigh: '',
    forearm: '',
    calf: '',
  });

  // Modal and UI state
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMeasurement, setSelectedMeasurement] = useState('weight');
  const [measurementHistory, setMeasurementHistory] = useState([]);
  const [showCalculations, setShowCalculations] = useState(true);
  const [unitSystem, setUnitSystem] = useState('metric'); // metric or imperial

  useEffect(() => {
    loadMeasurementHistory();
  }, []);

  const loadMeasurementHistory = useCallback(() => {
    // Load from Redux store or local storage
    const history = measurements.history || [];
    setMeasurementHistory(history);
    
    if (history.length > 0) {
      const latest = history[history.length - 1];
      setCurrentMeasurements(latest);
    }
  }, [measurements]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadMeasurementHistory();
    setTimeout(() => setRefreshing(false), 1000);
  }, [loadMeasurementHistory]);

  // Calculations
  const calculateBMI = () => {
    const height = parseFloat(currentMeasurements.height);
    const weight = parseFloat(currentMeasurements.weight);
    
    if (!height || !weight) return null;
    
    if (unitSystem === 'metric') {
      return (weight / Math.pow(height / 100, 2)).toFixed(1);
    } else {
      return ((weight / Math.pow(height, 2)) * 703).toFixed(1);
    }
  };

  const getBMICategory = (bmi) => {
    if (!bmi) return '';
    const bmiValue = parseFloat(bmi);
    
    if (bmiValue < 18.5) return { category: 'Underweight', color: COLORS.warning };
    if (bmiValue < 25) return { category: 'Normal', color: COLORS.success };
    if (bmiValue < 30) return { category: 'Overweight', color: COLORS.warning };
    return { category: 'Obese', color: COLORS.error };
  };

  const calculateBodyFatPercentage = () => {
    // Navy method calculation
    const height = parseFloat(currentMeasurements.height);
    const waist = parseFloat(currentMeasurements.waist);
    const neck = parseFloat(currentMeasurements.neck);
    const hips = parseFloat(currentMeasurements.hips);
    
    if (!height || !waist || !neck) return null;
    
    let bodyFat;
    if (user.gender === 'male') {
      bodyFat = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
    } else {
      if (!hips) return null;
      bodyFat = 495 / (1.29579 - 0.35004 * Math.log10(waist + hips - neck) + 0.22100 * Math.log10(height)) - 450;
    }
    
    return Math.max(0, bodyFat).toFixed(1);
  };

  const calculateWaistToHipRatio = () => {
    const waist = parseFloat(currentMeasurements.waist);
    const hips = parseFloat(currentMeasurements.hips);
    
    if (!waist || !hips) return null;
    return (waist / hips).toFixed(2);
  };

  const calculateIdealWeight = () => {
    const height = parseFloat(currentMeasurements.height);
    if (!height) return null;
    
    let ideal;
    if (unitSystem === 'metric') {
      // Robinson formula
      const heightCm = height;
      if (user.gender === 'male') {
        ideal = 52 + 1.9 * ((heightCm - 152.4) / 2.54);
      } else {
        ideal = 49 + 1.7 * ((heightCm - 152.4) / 2.54);
      }
    } else {
      // Imperial calculation
      if (user.gender === 'male') {
        ideal = 106 + 6 * (height - 60);
      } else {
        ideal = 100 + 5 * (height - 60);
      }
    }
    
    return ideal.toFixed(1);
  };

  const saveMeasurements = () => {
    const newEntry = {
      ...currentMeasurements,
      date: new Date().toISOString(),
      id: Date.now().toString(),
    };
    
    const updatedHistory = [...measurementHistory, newEntry];
    setMeasurementHistory(updatedHistory);
    
    // Dispatch to Redux
    dispatch({
      type: 'UPDATE_MEASUREMENTS',
      payload: {
        current: newEntry,
        history: updatedHistory,
      },
    });
    
    setShowAddModal(false);
    Vibration.vibrate(50);
    Alert.alert('Success! 💪', 'Your measurements have been saved.');
  };

  const convertUnits = (value, from, to) => {
    if (!value) return '';
    const val = parseFloat(value);
    
    if (from === 'cm' && to === 'in') return (val / 2.54).toFixed(1);
    if (from === 'in' && to === 'cm') return (val * 2.54).toFixed(1);
    if (from === 'kg' && to === 'lbs') return (val * 2.20462).toFixed(1);
    if (from === 'lbs' && to === 'kg') return (val / 2.20462).toFixed(1);
    
    return value;
  };

  const renderMeasurementInput = (label, key, unit) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        mode="outlined"
        value={currentMeasurements[key]}
        onChangeText={(value) => setCurrentMeasurements(prev => ({ ...prev, [key]: value }))}
        keyboardType="numeric"
        right={<TextInput.Affix text={unit} />}
        style={styles.input}
        theme={{ colors: { primary: COLORS.primary } }}
      />
    </View>
  );

  const renderCalculationCard = () => {
    const bmi = calculateBMI();
    const bmiCategory = getBMICategory(bmi);
    const bodyFat = calculateBodyFatPercentage();
    const waistHipRatio = calculateWaistToHipRatio();
    const idealWeight = calculateIdealWeight();
    
    return (
      <Card style={styles.calculationCard}>
        <Card.Content>
          <View style={styles.calculationHeader}>
            <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>
              📊 Body Composition Analysis
            </Text>
            <IconButton
              icon={showCalculations ? "expand-less" : "expand-more"}
              onPress={() => setShowCalculations(!showCalculations)}
            />
          </View>
          
          {showCalculations && (
            <View style={styles.calculationsContainer}>
              {bmi && (
                <Surface style={styles.calculationItem}>
                  <View style={styles.calculationRow}>
                    <Text style={TEXT_STYLES.body}>BMI</Text>
                    <View style={styles.calculationValue}>
                      <Text style={[TEXT_STYLES.h3, { color: bmiCategory.color }]}>
                        {bmi}
                      </Text>
                      <Chip
                        mode="outlined"
                        style={[styles.categoryChip, { borderColor: bmiCategory.color }]}
                        textStyle={{ color: bmiCategory.color }}
                      >
                        {bmiCategory.category}
                      </Chip>
                    </View>
                  </View>
                </Surface>
              )}
              
              {bodyFat && (
                <Surface style={styles.calculationItem}>
                  <View style={styles.calculationRow}>
                    <Text style={TEXT_STYLES.body}>Body Fat %</Text>
                    <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>
                      {bodyFat}%
                    </Text>
                  </View>
                </Surface>
              )}
              
              {waistHipRatio && (
                <Surface style={styles.calculationItem}>
                  <View style={styles.calculationRow}>
                    <Text style={TEXT_STYLES.body}>Waist-to-Hip Ratio</Text>
                    <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>
                      {waistHipRatio}
                    </Text>
                  </View>
                </Surface>
              )}
              
              {idealWeight && (
                <Surface style={styles.calculationItem}>
                  <View style={styles.calculationRow}>
                    <Text style={TEXT_STYLES.body}>Ideal Weight</Text>
                    <Text style={[TEXT_STYLES.h3, { color: COLORS.success }]}>
                      {idealWeight} {unitSystem === 'metric' ? 'kg' : 'lbs'}
                    </Text>
                  </View>
                </Surface>
              )}
              
              {/* Unit Conversions */}
              {currentMeasurements.height && (
                <Surface style={styles.calculationItem}>
                  <View style={styles.calculationRow}>
                    <Text style={TEXT_STYLES.body}>Height Conversion</Text>
                    <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary }]}>
                      {unitSystem === 'metric' 
                        ? `${convertUnits(currentMeasurements.height, 'cm', 'in')}" (${currentMeasurements.height} cm)`
                        : `${currentMeasurements.height}" (${convertUnits(currentMeasurements.height, 'in', 'cm')} cm)`
                      }
                    </Text>
                  </View>
                </Surface>
              )}
              
              {currentMeasurements.weight && (
                <Surface style={styles.calculationItem}>
                  <View style={styles.calculationRow}>
                    <Text style={TEXT_STYLES.body}>Weight Conversion</Text>
                    <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary }]}>
                      {unitSystem === 'metric' 
                        ? `${convertUnits(currentMeasurements.weight, 'kg', 'lbs')} lbs (${currentMeasurements.weight} kg)`
                        : `${currentMeasurements.weight} lbs (${convertUnits(currentMeasurements.weight, 'lbs', 'kg')} kg)`
                      }
                    </Text>
                  </View>
                </Surface>
              )}
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  const renderProgressChart = () => {
    if (measurementHistory.length < 2) return null;
    
    const data = measurementHistory.slice(-10).map(entry => ({
      date: new Date(entry.date).getMonth() + 1,
      weight: parseFloat(entry.weight) || 0,
      bodyFat: parseFloat(entry.bodyFat) || 0,
    }));
    
    return (
      <Card style={styles.chartCard}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, { color: COLORS.primary, marginBottom: SPACING.md }]}>
            📈 Progress Tracking
          </Text>
          <LineChart
            data={{
              labels: data.map(d => d.date.toString()),
              datasets: [
                {
                  data: data.map(d => d.weight),
                  color: () => COLORS.primary,
                  strokeWidth: 2,
                },
              ],
            }}
            width={width - 60}
            height={200}
            yAxisSuffix={unitSystem === 'metric' ? 'kg' : 'lbs'}
            chartConfig={{
              backgroundColor: COLORS.background,
              backgroundGradientFrom: COLORS.surface,
              backgroundGradientTo: COLORS.surface,
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
              labelColor: () => COLORS.textSecondary,
              style: { borderRadius: 16 },
              propsForDots: {
                r: "4",
                strokeWidth: "2",
                stroke: COLORS.primary,
              },
            }}
            bezier
            style={styles.chart}
          />
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <Text style={[TEXT_STYLES.h1, { color: 'white' }]}>
          📏 Body Measurements
        </Text>
        <Text style={[TEXT_STYLES.body, { color: 'white', opacity: 0.9 }]}>
          Track your kinanthropometric progress
        </Text>
      </LinearGradient>

      <ScrollView
        style={styles.content}
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
        {/* Unit Toggle */}
        <Surface style={styles.unitToggle}>
          <Text style={[TEXT_STYLES.body, { marginRight: SPACING.md }]}>Units:</Text>
          <View style={styles.chipContainer}>
            <Chip
              selected={unitSystem === 'metric'}
              onPress={() => setUnitSystem('metric')}
              style={[styles.unitChip, unitSystem === 'metric' && { backgroundColor: COLORS.primary }]}
              textStyle={unitSystem === 'metric' && { color: 'white' }}
            >
              Metric
            </Chip>
            <Chip
              selected={unitSystem === 'imperial'}
              onPress={() => setUnitSystem('imperial')}
              style={[styles.unitChip, unitSystem === 'imperial' && { backgroundColor: COLORS.primary }]}
              textStyle={unitSystem === 'imperial' && { color: 'white' }}
            >
              Imperial
            </Chip>
          </View>
        </Surface>

        {/* Current Measurements Card */}
        <Card style={styles.measurementCard}>
          <Card.Content>
            <Text style={[TEXT_STYLES.h3, { color: COLORS.primary, marginBottom: SPACING.md }]}>
              📝 Current Measurements
            </Text>
            
            <View style={styles.quickStats}>
              {currentMeasurements.weight && (
                <Surface style={styles.statItem}>
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Weight</Text>
                  <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>
                    {currentMeasurements.weight} {unitSystem === 'metric' ? 'kg' : 'lbs'}
                  </Text>
                </Surface>
              )}
              
              {currentMeasurements.height && (
                <Surface style={styles.statItem}>
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Height</Text>
                  <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>
                    {currentMeasurements.height} {unitSystem === 'metric' ? 'cm' : 'in'}
                  </Text>
                </Surface>
              )}
              
              {currentMeasurements.bodyFat && (
                <Surface style={styles.statItem}>
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Body Fat</Text>
                  <Text style={[TEXT_STYLES.h3, { color: COLORS.success }]}>
                    {currentMeasurements.bodyFat}%
                  </Text>
                </Surface>
              )}
            </View>
          </Card.Content>
        </Card>

        {/* Calculations */}
        {renderCalculationCard()}

        {/* Progress Chart */}
        {renderProgressChart()}

        {/* Measurement History */}
        {measurementHistory.length > 0 && (
          <Card style={styles.historyCard}>
            <Card.Content>
              <Text style={[TEXT_STYLES.h3, { color: COLORS.primary, marginBottom: SPACING.md }]}>
                📚 Measurement History
              </Text>
              
              {measurementHistory.slice(-5).reverse().map((entry, index) => (
                <Surface key={entry.id} style={styles.historyItem}>
                  <Text style={[TEXT_STYLES.body, { fontWeight: 'bold' }]}>
                    {new Date(entry.date).toLocaleDateString()}
                  </Text>
                  <View style={styles.historyDetails}>
                    {entry.weight && (
                      <Text style={styles.historyText}>
                        Weight: {entry.weight} {unitSystem === 'metric' ? 'kg' : 'lbs'}
                      </Text>
                    )}
                    {entry.bodyFat && (
                      <Text style={styles.historyText}>Body Fat: {entry.bodyFat}%</Text>
                    )}
                  </View>
                </Surface>
              ))}
            </Card.Content>
          </Card>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Add Measurements Modal */}
      <Portal>
        <Modal
          visible={showAddModal}
          onDismiss={() => setShowAddModal(false)}
          contentContainerStyle={styles.modal}
        >
          <ScrollView>
            <Text style={[TEXT_STYLES.h2, { textAlign: 'center', marginBottom: SPACING.lg }]}>
              📏 Add Measurements
            </Text>
            
            {/* Basic Measurements */}
            <Text style={[TEXT_STYLES.h3, { marginVertical: SPACING.md }]}>
              Basic Measurements
            </Text>
            {renderMeasurementInput('Height', 'height', unitSystem === 'metric' ? 'cm' : 'in')}
            {renderMeasurementInput('Weight', 'weight', unitSystem === 'metric' ? 'kg' : 'lbs')}
            {renderMeasurementInput('Body Fat %', 'bodyFat', '%')}
            {renderMeasurementInput('Muscle Mass', 'muscleMass', unitSystem === 'metric' ? 'kg' : 'lbs')}
            
            {/* Body Measurements */}
            <Text style={[TEXT_STYLES.h3, { marginVertical: SPACING.md }]}>
              Body Measurements
            </Text>
            {renderMeasurementInput('Waist', 'waist', unitSystem === 'metric' ? 'cm' : 'in')}
            {renderMeasurementInput('Chest', 'chest', unitSystem === 'metric' ? 'cm' : 'in')}
            {renderMeasurementInput('Hips', 'hips', unitSystem === 'metric' ? 'cm' : 'in')}
            {renderMeasurementInput('Neck', 'neck', unitSystem === 'metric' ? 'cm' : 'in')}
            {renderMeasurementInput('Bicep', 'bicep', unitSystem === 'metric' ? 'cm' : 'in')}
            {renderMeasurementInput('Thigh', 'thigh', unitSystem === 'metric' ? 'cm' : 'in')}
            {renderMeasurementInput('Forearm', 'forearm', unitSystem === 'metric' ? 'cm' : 'in')}
            {renderMeasurementInput('Calf', 'calf', unitSystem === 'metric' ? 'cm' : 'in')}
            
            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => setShowAddModal(false)}
                style={styles.cancelButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={saveMeasurements}
                style={styles.saveButton}
                buttonColor={COLORS.primary}
              >
                Save Measurements
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>

      {/* FAB */}
      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => setShowAddModal(true)}
        color="white"
        customSize={56}
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
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  unitToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: 12,
    elevation: 2,
  },
  chipContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  unitChip: {
    marginHorizontal: SPACING.xs,
  },
  measurementCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    elevation: 4,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 12,
    minWidth: 80,
  },
  calculationCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    elevation: 4,
  },
  calculationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  calculationsContainer: {
    gap: SPACING.sm,
  },
  calculationItem: {
    padding: SPACING.md,
    borderRadius: 12,
    elevation: 1,
  },
  calculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calculationValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  categoryChip: {
    height: 28,
  },
  chartCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    elevation: 4,
  },
  chart: {
    marginVertical: SPACING.sm,
    borderRadius: 16,
  },
  historyCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    elevation: 4,
  },
  historyItem: {
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: 12,
    elevation: 1,
  },
  historyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
  },
  historyText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  modal: {
    backgroundColor: 'white',
    margin: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: 16,
    maxHeight: '90%',
  },
  inputContainer: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    ...TEXT_STYLES.body,
    marginBottom: SPACING.xs,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'white',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
    gap: SPACING.md,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.lg,
    backgroundColor: COLORS.primary,
  },
  bottomSpacer: {
    height: 80,
  },
});

export default BodyMeasurements;