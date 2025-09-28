import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { 
  Card,
  Button,
  FAB,
  Avatar,
  Surface,
  Portal,
  Dialog,
  TextInput,
  Chip,
  ProgressBar,
} from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { StatusBar } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

// Design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4caf50',
  error: '#f44336',
  warning: '#ff9800',
  background: '#f8f9fa',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e0e0e0',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  body: {
    fontSize: 16,
    color: COLORS.text,
  },
  caption: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
};

const BodyComposition = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { clientId } = route.params || {};
  
  // Redux state
  const user = useSelector(state => state.auth.user);
  const clients = useSelector(state => state.clients.list);
  const bodyCompositionData = useSelector(state => state.bodyComposition.data);
  
  // Local state
  const [selectedClient, setSelectedClient] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('3M');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [currentMetrics, setCurrentMetrics] = useState({
    weight: '',
    bodyFat: '',
    muscleMass: '',
    visceralFat: '',
    bmi: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (clientId) {
      const client = clients.find(c => c.id === clientId);
      setSelectedClient(client);
    }
  }, [clientId, clients]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const timeframeOptions = [
    { label: '1M', value: '1M' },
    { label: '3M', value: '3M' },
    { label: '6M', value: '6M' },
    { label: '1Y', value: '1Y' },
    { label: 'All', value: 'ALL' },
  ];

  const mockBodyCompositionData = {
    weight: [70.5, 71.2, 70.8, 71.5, 72.1, 71.8, 72.5],
    bodyFat: [15.2, 14.8, 14.5, 14.2, 13.9, 13.6, 13.3],
    muscleMass: [58.2, 58.5, 58.8, 59.1, 59.4, 59.7, 60.0],
    dates: ['Jan 1', 'Jan 15', 'Feb 1', 'Feb 15', 'Mar 1', 'Mar 15', 'Mar 30'],
  };

  const calculateBMI = (weight, height = 175) => {
    return (weight / ((height / 100) ** 2)).toFixed(1);
  };

  const getBodyFatCategory = (bodyFat, gender = 'male') => {
    if (gender === 'male') {
      if (bodyFat < 6) return { category: 'Essential Fat', color: COLORS.error };
      if (bodyFat < 14) return { category: 'Athletic', color: COLORS.success };
      if (bodyFat < 18) return { category: 'Fitness', color: COLORS.primary };
      if (bodyFat < 25) return { category: 'Average', color: COLORS.warning };
      return { category: 'Above Average', color: COLORS.error };
    } else {
      if (bodyFat < 14) return { category: 'Essential Fat', color: COLORS.error };
      if (bodyFat < 21) return { category: 'Athletic', color: COLORS.success };
      if (bodyFat < 25) return { category: 'Fitness', color: COLORS.primary };
      if (bodyFat < 32) return { category: 'Average', color: COLORS.warning };
      return { category: 'Above Average', color: COLORS.error };
    }
  };

  const handleAddMeasurement = async () => {
    if (!currentMetrics.weight || !currentMetrics.bodyFat) {
      Alert.alert('Missing Data', 'Please enter at least weight and body fat percentage.');
      return;
    }

    setLoading(true);
    try {
      // Calculate BMI if height is available
      const bmi = calculateBMI(parseFloat(currentMetrics.weight));
      
      const newMeasurement = {
        id: Date.now().toString(),
        clientId: selectedClient?.id,
        date: new Date().toISOString(),
        weight: parseFloat(currentMetrics.weight),
        bodyFat: parseFloat(currentMetrics.bodyFat),
        muscleMass: currentMetrics.muscleMass ? parseFloat(currentMetrics.muscleMass) : null,
        visceralFat: currentMetrics.visceralFat ? parseFloat(currentMetrics.visceralFat) : null,
        bmi: parseFloat(bmi),
        notes: currentMetrics.notes,
      };

      // Dispatch to Redux store
      // dispatch(addBodyCompositionMeasurement(newMeasurement));

      // Reset form
      setCurrentMetrics({
        weight: '',
        bodyFat: '',
        muscleMass: '',
        visceralFat: '',
        bmi: '',
        notes: '',
      });
      setShowAddDialog(false);
      
      Alert.alert('Success! 🎉', 'Body composition measurement added successfully.');
    } catch (error) {
      console.error('Add measurement error:', error);
      Alert.alert('Error', 'Failed to add measurement. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <View style={styles.clientInfo}>
          <Avatar.Text
            size={60}
            label={selectedClient?.name?.charAt(0) || 'C'}
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            labelStyle={{ color: 'white' }}
          />
          <View style={styles.clientDetails}>
            <Text style={styles.clientName}>
              {selectedClient?.name || 'Select Client'}
            </Text>
            <Text style={styles.clientMeta}>
              Body Composition Tracking 📊
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.headerAction}>
          <Icon name="timeline" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  const renderTimeframeSelector = () => (
    <View style={styles.timeframeContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {timeframeOptions.map((option) => (
          <Chip
            key={option.value}
            mode={selectedTimeframe === option.value ? 'flat' : 'outlined'}
            selected={selectedTimeframe === option.value}
            onPress={() => setSelectedTimeframe(option.value)}
            style={[
              styles.timeframeChip,
              selectedTimeframe === option.value && styles.selectedChip,
            ]}
            textStyle={{
              color: selectedTimeframe === option.value ? 'white' : COLORS.primary,
            }}
          >
            {option.label}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const renderCurrentMetrics = () => {
    const latestData = {
      weight: 72.5,
      bodyFat: 13.3,
      muscleMass: 60.0,
      visceralFat: 4.2,
      bmi: 23.7,
    };

    const bodyFatInfo = getBodyFatCategory(latestData.bodyFat);

    return (
      <Card style={styles.metricsCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Current Metrics 📏</Text>
          <View style={styles.metricsGrid}>
            <Surface style={styles.metricItem}>
              <Icon name="monitor-weight" size={24} color={COLORS.primary} />
              <Text style={styles.metricValue}>{latestData.weight} kg</Text>
              <Text style={styles.metricLabel}>Weight</Text>
            </Surface>
            <Surface style={styles.metricItem}>
              <Icon name="fitness-center" size={24} color={COLORS.success} />
              <Text style={styles.metricValue}>{latestData.bodyFat}%</Text>
              <Text style={styles.metricLabel}>Body Fat</Text>
            </Surface>
            <Surface style={styles.metricItem}>
              <Icon name="accessibility" size={24} color={COLORS.secondary} />
              <Text style={styles.metricValue}>{latestData.muscleMass} kg</Text>
              <Text style={styles.metricLabel}>Muscle Mass</Text>
            </Surface>
            <Surface style={styles.metricItem}>
              <Icon name="favorite" size={24} color={COLORS.warning} />
              <Text style={styles.metricValue}>{latestData.visceralFat}</Text>
              <Text style={styles.metricLabel}>Visceral Fat</Text>
            </Surface>
          </View>
          <View style={styles.bmiContainer}>
            <Text style={styles.bmiLabel}>BMI: {latestData.bmi}</Text>
            <Chip
              mode="flat"
              style={{ backgroundColor: bodyFatInfo.color }}
              textStyle={{ color: 'white' }}
            >
              {bodyFatInfo.category}
            </Chip>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderProgressChart = () => (
    <Card style={styles.chartCard}>
      <Card.Content>
        <Text style={styles.sectionTitle}>Progress Trends 📈</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <LineChart
            data={{
              labels: mockBodyCompositionData.dates,
              datasets: [
                {
                  data: mockBodyCompositionData.bodyFat,
                  color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
                  strokeWidth: 3,
                },
              ],
            }}
            width={screenWidth + 50}
            height={220}
            chartConfig={{
              backgroundColor: 'transparent',
              backgroundGradientFrom: 'white',
              backgroundGradientTo: 'white',
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: COLORS.primary,
              },
            }}
            bezier
            style={styles.chart}
          />
        </ScrollView>
        <Text style={styles.chartCaption}>Body Fat % Over Time</Text>
      </Card.Content>
    </Card>
  );

  const renderProgressIndicators = () => (
    <Card style={styles.progressCard}>
      <Card.Content>
        <Text style={styles.sectionTitle}>Goal Progress 🎯</Text>
        <View style={styles.progressItem}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Weight Loss Goal</Text>
            <Text style={styles.progressValue}>75% Complete</Text>
          </View>
          <ProgressBar
            progress={0.75}
            color={COLORS.success}
            style={styles.progressBar}
          />
          <Text style={styles.progressNote}>2.5 kg remaining to reach target</Text>
        </View>
        <View style={styles.progressItem}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Body Fat Reduction</Text>
            <Text style={styles.progressValue}>60% Complete</Text>
          </View>
          <ProgressBar
            progress={0.6}
            color={COLORS.primary}
            style={styles.progressBar}
          />
          <Text style={styles.progressNote}>2% body fat remaining to target</Text>
        </View>
        <View style={styles.progressItem}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Muscle Gain</Text>
            <Text style={styles.progressValue}>40% Complete</Text>
          </View>
          <ProgressBar
            progress={0.4}
            color={COLORS.warning}
            style={styles.progressBar}
          />
          <Text style={styles.progressNote}>3 kg muscle mass to gain</Text>
        </View>
      </Card.Content>
    </Card>
  );

  const renderRecentMeasurements = () => (
    <Card style={styles.measurementsCard}>
      <Card.Content>
        <Text style={styles.sectionTitle}>Recent Measurements 📋</Text>
        {[1, 2, 3].map((item, index) => (
          <Surface key={index} style={styles.measurementItem}>
            <View style={styles.measurementDate}>
              <Text style={styles.dateText}>Mar {30 - index * 7}</Text>
              <Text style={styles.dayText}>2024</Text>
            </View>
            <View style={styles.measurementData}>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Weight:</Text>
                <Text style={styles.dataValue}>{72.5 - index * 0.3} kg</Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Body Fat:</Text>
                <Text style={styles.dataValue}>{13.3 + index * 0.2}%</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.viewButton}>
              <Icon name="visibility" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </Surface>
        ))}
      </Card.Content>
    </Card>
  );

  const renderAddMeasurementDialog = () => (
    <Portal>
      <Dialog visible={showAddDialog} onDismiss={() => setShowAddDialog(false)}>
        <Dialog.Title>Add New Measurement 📊</Dialog.Title>
        <Dialog.Content>
          <TextInput
            label="Weight (kg) *"
            value={currentMetrics.weight}
            onChangeText={(text) => setCurrentMetrics({...currentMetrics, weight: text})}
            keyboardType="numeric"
            mode="outlined"
            style={styles.dialogInput}
          />
          <TextInput
            label="Body Fat (%) *"
            value={currentMetrics.bodyFat}
            onChangeText={(text) => setCurrentMetrics({...currentMetrics, bodyFat: text})}
            keyboardType="numeric"
            mode="outlined"
            style={styles.dialogInput}
          />
          <TextInput
            label="Muscle Mass (kg)"
            value={currentMetrics.muscleMass}
            onChangeText={(text) => setCurrentMetrics({...currentMetrics, muscleMass: text})}
            keyboardType="numeric"
            mode="outlined"
            style={styles.dialogInput}
          />
          <TextInput
            label="Visceral Fat Level"
            value={currentMetrics.visceralFat}
            onChangeText={(text) => setCurrentMetrics({...currentMetrics, visceralFat: text})}
            keyboardType="numeric"
            mode="outlined"
            style={styles.dialogInput}
          />
          <TextInput
            label="Notes (optional)"
            value={currentMetrics.notes}
            onChangeText={(text) => setCurrentMetrics({...currentMetrics, notes: text})}
            multiline
            numberOfLines={3}
            mode="outlined"
            style={styles.dialogInput}
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setShowAddDialog(false)}>Cancel</Button>
          <Button
            onPress={handleAddMeasurement}
            loading={loading}
            mode="contained"
            style={{ backgroundColor: COLORS.primary }}
          >
            Add Measurement
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );

  if (!selectedClient) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="person-search" size={80} color={COLORS.textSecondary} />
        <Text style={styles.emptyTitle}>Select a Client</Text>
        <Text style={styles.emptyText}>
          Choose a client to view their body composition data
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
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
        {renderTimeframeSelector()}
        {renderCurrentMetrics()}
        {renderProgressChart()}
        {renderProgressIndicators()}
        {renderRecentMeasurements()}
        
        <View style={styles.bottomSpacing} />
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="add"
        onPress={() => setShowAddDialog(true)}
        color="white"
      />

      {renderAddMeasurementDialog()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 50,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  clientDetails: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  clientName: {
    ...TEXT_STYLES.title,
    color: 'white',
    fontSize: 20,
  },
  clientMeta: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
  },
  headerAction: {
    padding: SPACING.sm,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  timeframeContainer: {
    marginVertical: SPACING.md,
  },
  timeframeChip: {
    marginRight: SPACING.sm,
    borderColor: COLORS.primary,
  },
  selectedChip: {
    backgroundColor: COLORS.primary,
  },
  metricsCard: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  sectionTitle: {
    ...TEXT_STYLES.subtitle,
    marginBottom: SPACING.md,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricItem: {
    width: '48%',
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.sm,
    borderRadius: 12,
    elevation: 1,
  },
  metricValue: {
    ...TEXT_STYLES.title,
    fontSize: 18,
    marginVertical: SPACING.xs,
  },
  metricLabel: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
  },
  bmiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  bmiLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
  },
  chartCard: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  chart: {
    marginVertical: SPACING.sm,
    borderRadius: 16,
  },
  chartCaption: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  progressCard: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  progressItem: {
    marginBottom: SPACING.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  progressLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '500',
  },
  progressValue: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    color: COLORS.primary,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  progressNote: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
    fontStyle: 'italic',
  },
  measurementsCard: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  measurementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: 8,
    elevation: 1,
  },
  measurementDate: {
    alignItems: 'center',
    marginRight: SPACING.md,
    minWidth: 60,
  },
  dateText: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  dayText: {
    ...TEXT_STYLES.caption,
  },
  measurementData: {
    flex: 1,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  dataLabel: {
    ...TEXT_STYLES.caption,
  },
  dataValue: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
  },
  viewButton: {
    padding: SPACING.sm,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  dialogInput: {
    marginBottom: SPACING.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    ...TEXT_STYLES.title,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  emptyText: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default BodyComposition;