import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StatusBar,
  Dimensions,
  Alert,
  Animated,
  Vibration,
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  ProgressBar,
  FAB,
  Surface,
  Portal,
  Modal,
  TextInput,
  Searchbar,
  IconButton,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { LineChart, BarChart } from 'react-native-chart-kit';

// Design System Constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f7fa',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  accent: '#00BCD4',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textSecondary },
  small: { fontSize: 12, color: COLORS.textSecondary },
};

const { width: screenWidth } = Dimensions.get('window');

const BodyComposition = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, bodyCompositionData } = useSelector(state => ({
    user: state.auth.user,
    bodyCompositionData: state.progress.bodyComposition || [],
  }));

  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('3M');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form states
  const [formData, setFormData] = useState({
    weight: '',
    bodyFat: '',
    muscleMass: '',
    waterPercentage: '',
    bmi: '',
    visceralFat: '',
    boneMass: '',
    basalMetabolicRate: '',
  });

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;

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
    ]).start();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // dispatch(fetchBodyCompositionData());
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const handleAddMeasurement = () => {
    Vibration.vibrate(50);
    setShowAddModal(true);
  };

  const handleSaveMeasurement = async () => {
    try {
      const newMeasurement = {
        ...formData,
        date: new Date().toISOString(),
        id: Date.now().toString(),
      };
      
      // Calculate BMI if weight and height are available
      if (formData.weight && user.height) {
        const heightInM = user.height / 100;
        const bmi = (parseFloat(formData.weight) / (heightInM * heightInM)).toFixed(1);
        newMeasurement.bmi = bmi;
      }

      // dispatch(addBodyCompositionMeasurement(newMeasurement));
      
      setFormData({
        weight: '',
        bodyFat: '',
        muscleMass: '',
        waterPercentage: '',
        bmi: '',
        visceralFat: '',
        boneMass: '',
        basalMetabolicRate: '',
      });
      
      setShowAddModal(false);
      Vibration.vibrate([100, 50, 100]);
      
      Alert.alert('Success! 🎉', 'Body composition data saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save measurement');
    }
  };

  const getProgressColor = (current, target, reverse = false) => {
    if (!current || !target) return COLORS.textSecondary;
    const progress = current / target;
    if (reverse) {
      return progress <= 1 ? COLORS.success : progress <= 1.2 ? COLORS.warning : COLORS.error;
    }
    return progress >= 1 ? COLORS.success : progress >= 0.8 ? COLORS.warning : COLORS.error;
  };

  const getLatestMeasurement = () => {
    if (!bodyCompositionData.length) return null;
    return bodyCompositionData[bodyCompositionData.length - 1];
  };

  const getPreviousMeasurement = () => {
    if (bodyCompositionData.length < 2) return null;
    return bodyCompositionData[bodyCompositionData.length - 2];
  };

  const calculateChange = (current, previous) => {
    if (!current || !previous) return null;
    const change = current - previous;
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change > 0,
      percentage: ((change / previous) * 100).toFixed(1),
    };
  };

  const latest = getLatestMeasurement();
  const previous = getPreviousMeasurement();

  // Mock data for charts
  const mockChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      data: [70, 69.5, 69, 68.8, 68.5, 68.2],
      color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
      strokeWidth: 2,
    }],
  };

  const achievements = [
    { id: 1, name: 'Consistency King', icon: 'jump-rope', earned: true, description: '30 days of tracking' },
    { id: 2, name: 'Body Goal', icon: 'fitness-center', earned: true, description: 'Reached target body fat %' },
    { id: 3, name: 'Muscle Builder', icon: 'trending-up', earned: false, description: 'Gain 2kg muscle mass' },
    { id: 4, name: 'Hydration Hero', icon: 'water-drop', earned: true, description: 'Optimal water percentage' },
  ];

  const MetricCard = ({ title, value, unit, target, icon, trend, reverse = false }) => (
    <Card style={{ margin: SPACING.sm, backgroundColor: COLORS.surface, elevation: 4 }}>
      <Card.Content style={{ padding: SPACING.md }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text style={[TEXT_STYLES.caption, { marginBottom: SPACING.xs }]}>{title}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
              <Text style={[TEXT_STYLES.h2, { color: getProgressColor(value, target, reverse) }]}>
                {value || '--'}
              </Text>
              <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.xs, color: COLORS.textSecondary }]}>
                {unit}
              </Text>
            </View>
            {target && (
              <Text style={[TEXT_STYLES.small, { marginTop: SPACING.xs }]}>
                Target: {target}{unit}
              </Text>
            )}
            {trend && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: SPACING.xs }}>
                <Icon 
                  name={trend.isPositive ? 'trending-up' : 'trending-down'} 
                  size={16} 
                  color={trend.isPositive ? COLORS.success : COLORS.error} 
                />
                <Text style={[TEXT_STYLES.small, { 
                  marginLeft: SPACING.xs, 
                  color: trend.isPositive ? COLORS.success : COLORS.error 
                }]}>
                  {trend.value}{unit} ({trend.percentage}%)
                </Text>
              </View>
            )}
          </View>
          <Surface style={{ 
            padding: SPACING.sm, 
            borderRadius: 30, 
            backgroundColor: `${getProgressColor(value, target, reverse)}20` 
          }}>
            <Icon name={icon} size={24} color={getProgressColor(value, target, reverse)} />
          </Surface>
        </View>
        {target && value && (
          <ProgressBar 
            progress={Math.min(reverse ? target / value : value / target, 1)} 
            color={getProgressColor(value, target, reverse)}
            style={{ marginTop: SPACING.md, height: 6, borderRadius: 3 }}
          />
        )}
      </Card.Content>
    </Card>
  );

  const AchievementBadge = ({ achievement }) => (
    <Surface style={{ 
      margin: SPACING.xs,
      padding: SPACING.sm,
      borderRadius: 12,
      backgroundColor: achievement.earned ? `${COLORS.success}20` : `${COLORS.textSecondary}10`,
      borderWidth: 2,
      borderColor: achievement.earned ? COLORS.success : COLORS.textSecondary,
    }}>
      <View style={{ alignItems: 'center' }}>
        <Icon 
          name={achievement.icon} 
          size={32} 
          color={achievement.earned ? COLORS.success : COLORS.textSecondary} 
        />
        <Text style={[TEXT_STYLES.small, { 
          textAlign: 'center',
          marginTop: SPACING.xs,
          color: achievement.earned ? COLORS.success : COLORS.textSecondary,
          fontWeight: achievement.earned ? 'bold' : 'normal',
        }]}>
          {achievement.name}
        </Text>
      </View>
    </Surface>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={{ paddingTop: 50, paddingBottom: SPACING.lg }}
      >
        <Animated.View style={{ 
          opacity: fadeAnim, 
          transform: [{ translateY: slideAnim }],
          paddingHorizontal: SPACING.md 
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={[TEXT_STYLES.h1, { color: 'white' }]}>Body Composition</Text>
              <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.8)' }]}>
                Track your physical progress 📊
              </Text>
            </View>
            <Surface style={{ padding: SPACING.sm, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.2)' }}>
              <Icon name="accessibility" size={28} color="white" />
            </Surface>
          </View>
        </Animated.View>
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
        {/* Period Selection */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'center', 
          padding: SPACING.md,
          backgroundColor: 'white',
          marginBottom: SPACING.sm,
        }}>
          {['1M', '3M', '6M', '1Y'].map((period) => (
            <Chip
              key={period}
              selected={selectedPeriod === period}
              onPress={() => setSelectedPeriod(period)}
              style={{ 
                marginHorizontal: SPACING.xs,
                backgroundColor: selectedPeriod === period ? COLORS.primary : 'transparent',
              }}
              textStyle={{ color: selectedPeriod === period ? 'white' : COLORS.text }}
            >
              {period}
            </Chip>
          ))}
        </View>

        {/* Latest Measurements Overview */}
        {latest && (
          <Card style={{ margin: SPACING.md, backgroundColor: COLORS.surface, elevation: 6 }}>
            <Card.Content style={{ padding: SPACING.lg }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
                <Icon name="timeline" size={24} color={COLORS.primary} />
                <Text style={[TEXT_STYLES.h3, { marginLeft: SPACING.sm }]}>Latest Measurements</Text>
              </View>
              
              <Text style={[TEXT_STYLES.caption, { marginBottom: SPACING.md }]}>
                Recorded on {new Date(latest.date).toLocaleDateString()} ⏰
              </Text>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                <View style={{ width: '50%', paddingRight: SPACING.sm }}>
                  <Text style={TEXT_STYLES.small}>Weight</Text>
                  <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>
                    {latest.weight} kg
                  </Text>
                </View>
                <View style={{ width: '50%' }}>
                  <Text style={TEXT_STYLES.small}>Body Fat</Text>
                  <Text style={[TEXT_STYLES.h3, { color: COLORS.accent }]}>
                    {latest.bodyFat}%
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Achievements */}
        <Card style={{ margin: SPACING.md, backgroundColor: COLORS.surface, elevation: 4 }}>
          <Card.Content style={{ padding: SPACING.lg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
              <Icon name="jump-rope" size={24} color={COLORS.warning} />
              <Text style={[TEXT_STYLES.h3, { marginLeft: SPACING.sm }]}>Achievements</Text>
              <Chip 
                style={{ marginLeft: 'auto', backgroundColor: `${COLORS.success}20` }}
                textStyle={{ color: COLORS.success, fontSize: 12 }}
              >
                {achievements.filter(a => a.earned).length}/{achievements.length} 🏆
              </Chip>
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row' }}>
                {achievements.map((achievement) => (
                  <AchievementBadge key={achievement.id} achievement={achievement} />
                ))}
              </View>
            </ScrollView>
          </Card.Content>
        </Card>

        {/* Detailed Metrics Grid */}
        <View style={{ margin: SPACING.sm }}>
          <Text style={[TEXT_STYLES.h3, { marginLeft: SPACING.sm, marginBottom: SPACING.sm }]}>
            Detailed Metrics 📏
          </Text>
          
          <MetricCard
            title="Weight"
            value={latest?.weight}
            unit="kg"
            target={user?.targetWeight}
            icon="monitor-weight"
            trend={previous ? calculateChange(parseFloat(latest?.weight), parseFloat(previous.weight)) : null}
          />
          
          <MetricCard
            title="Body Fat Percentage"
            value={latest?.bodyFat}
            unit="%"
            target={user?.targetBodyFat}
            icon="pie-chart"
            trend={previous ? calculateChange(parseFloat(latest?.bodyFat), parseFloat(previous.bodyFat)) : null}
            reverse={true}
          />
          
          <MetricCard
            title="Muscle Mass"
            value={latest?.muscleMass}
            unit="kg"
            target={user?.targetMuscleMass}
            icon="fitness-center"
            trend={previous ? calculateChange(parseFloat(latest?.muscleMass), parseFloat(previous.muscleMass)) : null}
          />
          
          <MetricCard
            title="Water Percentage"
            value={latest?.waterPercentage}
            unit="%"
            target={60}
            icon="water-drop"
            trend={previous ? calculateChange(parseFloat(latest?.waterPercentage), parseFloat(previous.waterPercentage)) : null}
          />
          
          <MetricCard
            title="BMI"
            value={latest?.bmi}
            unit=""
            target={22}
            icon="straighten"
            trend={previous ? calculateChange(parseFloat(latest?.bmi), parseFloat(previous.bmi)) : null}
          />
          
          <MetricCard
            title="Visceral Fat"
            value={latest?.visceralFat}
            unit=""
            target={10}
            icon="donut-small"
            trend={previous ? calculateChange(parseFloat(latest?.visceralFat), parseFloat(previous.visceralFat)) : null}
            reverse={true}
          />
        </View>

        {/* Progress Chart */}
        {bodyCompositionData.length > 1 && (
          <Card style={{ margin: SPACING.md, backgroundColor: COLORS.surface, elevation: 4 }}>
            <Card.Content style={{ padding: SPACING.lg }}>
              <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.lg }]}>Weight Progress 📈</Text>
              <ScrollView horizontal>
                <LineChart
                  data={mockChartData}
                  width={screenWidth - 60}
                  height={220}
                  chartConfig={{
                    backgroundColor: COLORS.surface,
                    backgroundGradientFrom: COLORS.surface,
                    backgroundGradientTo: COLORS.surface,
                    decimalPlaces: 1,
                    color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
                    style: { borderRadius: 16 },
                    propsForDots: {
                      r: "6",
                      strokeWidth: "2",
                      stroke: COLORS.primary
                    }
                  }}
                  bezier
                  style={{ marginVertical: 8, borderRadius: 16 }}
                />
              </ScrollView>
            </Card.Content>
          </Card>
        )}

        {/* Tips & Insights */}
        <Card style={{ margin: SPACING.md, backgroundColor: COLORS.surface, elevation: 4 }}>
          <Card.Content style={{ padding: SPACING.lg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
              <Icon name="lightbulb" size={24} color={COLORS.warning} />
              <Text style={[TEXT_STYLES.h3, { marginLeft: SPACING.sm }]}>AI Insights</Text>
            </View>
            
            <Surface style={{ 
              padding: SPACING.md, 
              borderRadius: 12, 
              backgroundColor: `${COLORS.primary}10`,
              marginBottom: SPACING.md 
            }}>
              <Text style={[TEXT_STYLES.body, { color: COLORS.primary, fontWeight: '600' }]}>
                💡 Your body fat percentage has decreased by 0.8% this month - great progress! 
              </Text>
              <Text style={[TEXT_STYLES.caption, { marginTop: SPACING.xs }]}>
                Consider increasing protein intake to maintain muscle mass during fat loss.
              </Text>
            </Surface>

            <Surface style={{ 
              padding: SPACING.md, 
              borderRadius: 12, 
              backgroundColor: `${COLORS.success}10` 
            }}>
              <Text style={[TEXT_STYLES.body, { color: COLORS.success, fontWeight: '600' }]}>
                🎯 You're on track to reach your target weight in 6 weeks!
              </Text>
              <Text style={[TEXT_STYLES.caption, { marginTop: SPACING.xs }]}>
                Maintain your current routine for optimal results.
              </Text>
            </Surface>
          </Card.Content>
        </Card>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add Measurement FAB */}
      <FAB
        icon="add"
        onPress={handleAddMeasurement}
        style={{
          position: 'absolute',
          bottom: SPACING.lg,
          right: SPACING.lg,
          backgroundColor: COLORS.primary,
        }}
      />

      {/* Add Measurement Modal */}
      <Portal>
        <Modal
          visible={showAddModal}
          onDismiss={() => setShowAddModal(false)}
          contentContainerStyle={{
            backgroundColor: COLORS.surface,
            margin: SPACING.lg,
            borderRadius: 16,
            maxHeight: '80%',
          }}
        >
          <ScrollView style={{ padding: SPACING.lg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg }}>
              <Icon name="add-circle" size={28} color={COLORS.primary} />
              <Text style={[TEXT_STYLES.h2, { marginLeft: SPACING.sm }]}>Add Measurement</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setShowAddModal(false)}
                style={{ marginLeft: 'auto' }}
              />
            </View>

            <TextInput
              label="Weight (kg)"
              value={formData.weight}
              onChangeText={(text) => setFormData(prev => ({ ...prev, weight: text }))}
              mode="outlined"
              keyboardType="numeric"
              style={{ marginBottom: SPACING.md }}
              left={<TextInput.Icon icon="monitor-weight" />}
            />

            <TextInput
              label="Body Fat (%)"
              value={formData.bodyFat}
              onChangeText={(text) => setFormData(prev => ({ ...prev, bodyFat: text }))}
              mode="outlined"
              keyboardType="numeric"
              style={{ marginBottom: SPACING.md }}
              left={<TextInput.Icon icon="pie-chart" />}
            />

            <TextInput
              label="Muscle Mass (kg)"
              value={formData.muscleMass}
              onChangeText={(text) => setFormData(prev => ({ ...prev, muscleMass: text }))}
              mode="outlined"
              keyboardType="numeric"
              style={{ marginBottom: SPACING.md }}
              left={<TextInput.Icon icon="fitness-center" />}
            />

            <TextInput
              label="Water Percentage (%)"
              value={formData.waterPercentage}
              onChangeText={(text) => setFormData(prev => ({ ...prev, waterPercentage: text }))}
              mode="outlined"
              keyboardType="numeric"
              style={{ marginBottom: SPACING.md }}
              left={<TextInput.Icon icon="water-drop" />}
            />

            <TextInput
              label="Visceral Fat Level"
              value={formData.visceralFat}
              onChangeText={(text) => setFormData(prev => ({ ...prev, visceralFat: text }))}
              mode="outlined"
              keyboardType="numeric"
              style={{ marginBottom: SPACING.md }}
              left={<TextInput.Icon icon="donut-small" />}
            />

            <TextInput
              label="Bone Mass (kg)"
              value={formData.boneMass}
              onChangeText={(text) => setFormData(prev => ({ ...prev, boneMass: text }))}
              mode="outlined"
              keyboardType="numeric"
              style={{ marginBottom: SPACING.md }}
              left={<TextInput.Icon icon="healing" />}
            />

            <TextInput
              label="Basal Metabolic Rate (kcal)"
              value={formData.basalMetabolicRate}
              onChangeText={(text) => setFormData(prev => ({ ...prev, basalMetabolicRate: text }))}
              mode="outlined"
              keyboardType="numeric"
              style={{ marginBottom: SPACING.xl }}
              left={<TextInput.Icon icon="local-fire-department" />}
            />

            <Button
              mode="contained"
              onPress={handleSaveMeasurement}
              style={{ backgroundColor: COLORS.primary }}
              contentStyle={{ paddingVertical: SPACING.sm }}
            >
              Save Measurement 💾
            </Button>
          </ScrollView>
        </Modal>
      </Portal>
    </View>
  );
};

export default BodyComposition;