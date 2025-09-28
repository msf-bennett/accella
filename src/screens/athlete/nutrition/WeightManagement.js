import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Alert,
  Animated,
  Vibration,
  Modal,
  TextInput,
  Dimensions,
} from 'react-native';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
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
  Portal,
  Divider,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { LineChart } from 'react-native-chart-kit';

// Import your design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width: screenWidth } = Dimensions.get('window');

const WeightManagement = ({ navigation }) => {
  // Redux state
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const weightData = useSelector(state => state.weight.weightData || []);
  const goals = useSelector(state => state.weight.goals || {});

  // Component state
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [newEntry, setNewEntry] = useState({
    weight: '',
    bodyFat: '',
    muscleMass: '',
    notes: '',
  });
  const [weightGoal, setWeightGoal] = useState({
    target: '',
    deadline: '',
    type: 'maintain', // lose, gain, maintain
  });

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const chartAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Sample weight data
  const [localWeightData] = useState([
    { id: 1, date: '2025-08-15', weight: 75.2, bodyFat: 12.5, muscleMass: 65.7, notes: 'Morning weigh-in' },
    { id: 2, date: '2025-08-16', weight: 75.0, bodyFat: 12.3, muscleMass: 65.8, notes: 'Post workout' },
    { id: 3, date: '2025-08-17', weight: 74.8, bodyFat: 12.2, muscleMass: 66.0, notes: 'Good hydration' },
    { id: 4, date: '2025-08-18', weight: 75.1, bodyFat: 12.4, muscleMass: 65.9, notes: 'Rest day' },
    { id: 5, date: '2025-08-19', weight: 74.9, bodyFat: 12.1, muscleMass: 66.1, notes: 'Training day' },
    { id: 6, date: '2025-08-20', weight: 74.7, bodyFat: 12.0, muscleMass: 66.2, notes: 'New PR!' },
    { id: 7, date: '2025-08-21', weight: 74.6, bodyFat: 11.9, muscleMass: 66.3, notes: 'Feeling strong' },
    { id: 8, date: '2025-08-22', weight: 74.5, bodyFat: 11.8, muscleMass: 66.4, notes: 'Today' },
  ]);

  const [currentGoals] = useState({
    target: 72.0,
    current: 74.5,
    deadline: '2025-10-01',
    type: 'lose',
    startWeight: 76.0,
  });

  // Chart configuration
  const chartConfig = {
    backgroundGradientFrom: '#667eea',
    backgroundGradientTo: '#764ba2',
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    strokeWidth: 3,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 1,
    propsForBackgroundLines: {
      strokeWidth: 1,
      stroke: 'rgba(255,255,255,0.2)',
    },
  };

  // Prepare chart data
  const getChartData = () => {
    const recentData = localWeightData.slice(-7);
    return {
      labels: recentData.map(entry => {
        const date = new Date(entry.date);
        return date.getDate().toString();
      }),
      datasets: [
        {
          data: recentData.map(entry => entry.weight),
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          strokeWidth: 3,
        },
      ],
    };
  };

  // Calculate progress
  const calculateProgress = () => {
    const { target, current, startWeight, type } = currentGoals;
    let progress = 0;
    
    if (type === 'lose') {
      progress = ((startWeight - current) / (startWeight - target)) * 100;
    } else if (type === 'gain') {
      progress = ((current - startWeight) / (target - startWeight)) * 100;
    } else {
      // maintain - within 1kg range
      const variance = Math.abs(current - target);
      progress = Math.max(0, (1 - variance) * 100);
    }
    
    return Math.min(100, Math.max(0, progress));
  };

  const progressPercentage = calculateProgress();
  const weightChange = (currentGoals.current - localWeightData[0]?.weight || 0);
  const isPositiveChange = weightChange >= 0;

  useEffect(() => {
    // Entrance animations
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
      Animated.timing(chartAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]).start();

    // Progress animation
    setTimeout(() => {
      Animated.timing(progressAnim, {
        toValue: progressPercentage / 100,
        duration: 1500,
        useNativeDriver: false,
      }).start();
    }, 500);
  }, [fadeAnim, slideAnim, chartAnim, progressPercentage]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      // dispatch(fetchWeightData());
    } catch (error) {
      console.error('Error refreshing weight data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const addWeightEntry = useCallback(() => {
    if (!newEntry.weight.trim()) {
      Alert.alert('❌ Error', 'Please enter your current weight');
      return;
    }
    
    if (isNaN(parseFloat(newEntry.weight))) {
      Alert.alert('❌ Error', 'Please enter a valid weight');
      return;
    }
    
    Vibration.vibrate(50);
    setShowAddModal(false);
    setNewEntry({ weight: '', bodyFat: '', muscleMass: '', notes: '' });
    
    Alert.alert(
      '🎉 Weight Logged!',
      'Your weight has been successfully recorded!',
      [{ text: 'OK', onPress: () => {} }]
    );
  }, [newEntry]);

  const setGoal = useCallback(() => {
    if (!weightGoal.target.trim()) {
      Alert.alert('❌ Error', 'Please enter your target weight');
      return;
    }
    
    if (isNaN(parseFloat(weightGoal.target))) {
      Alert.alert('❌ Error', 'Please enter a valid target weight');
      return;
    }
    
    setShowGoalModal(false);
    setWeightGoal({ target: '', deadline: '', type: 'maintain' });
    
    Alert.alert(
      '🎯 Goal Set!',
      'Your weight goal has been updated successfully!',
      [{ text: 'OK', onPress: () => {} }]
    );
  }, [weightGoal]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getGoalEmoji = (type) => {
    switch (type) {
      case 'lose': return '📉';
      case 'gain': return '📈';
      case 'maintain': return '⚖️';
      default: return '🎯';
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return COLORS.success;
    if (progress >= 50) return COLORS.warning;
    return COLORS.error;
  };

  const renderStatsCard = () => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <Card style={{ margin: SPACING.md, elevation: 6 }}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={{ borderRadius: 8 }}
        >
          <Card.Content style={{ padding: SPACING.lg }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg }}>
              <Text style={[TEXT_STYLES.h2, { color: 'white' }]}>
                Weight Progress
              </Text>
              <Badge
                size={24}
                style={{ backgroundColor: getProgressColor(progressPercentage) }}
              >
                {Math.round(progressPercentage)}%
              </Badge>
            </View>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.md }}>
              <View>
                <Text style={[TEXT_STYLES.h1, { color: 'white' }]}>
                  {currentGoals.current} kg
                </Text>
                <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
                  Current Weight
                </Text>
              </View>
              
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[TEXT_STYLES.h3, { color: isPositiveChange ? '#ffcdd2' : '#c8e6c9' }]}>
                  {isPositiveChange ? '+' : ''}{weightChange.toFixed(1)} kg
                </Text>
                <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
                  vs. Start
                </Text>
              </View>
            </View>
            
            <Animated.View style={{ marginBottom: SPACING.md }}>
              <ProgressBar
                progress={progressAnim}
                color="white"
                style={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'rgba(255,255,255,0.3)',
                }}
              />
            </Animated.View>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={[TEXT_STYLES.body, { color: 'white' }]}>
                  {getGoalEmoji(currentGoals.type)} {currentGoals.target} kg
                </Text>
                <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
                  Target
                </Text>
              </View>
              
              <View style={{ alignItems: 'center' }}>
                <Text style={[TEXT_STYLES.body, { color: 'white' }]}>
                  {formatDate(currentGoals.deadline)}
                </Text>
                <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
                  Deadline
                </Text>
              </View>
            </View>
          </Card.Content>
        </LinearGradient>
      </Card>
    </Animated.View>
  );

  const renderChartCard = () => (
    <Animated.View
      style={{
        opacity: chartAnim,
        transform: [{ scale: chartAnim }],
      }}
    >
      <Card style={{ margin: SPACING.md, elevation: 4 }}>
        <Card.Content style={{ padding: SPACING.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md }}>
            <Text style={TEXT_STYLES.h3}>Weight Trend</Text>
            <View style={{ flexDirection: 'row' }}>
              {['7d', '30d', '90d'].map((period) => (
                <Chip
                  key={period}
                  selected={selectedPeriod === period}
                  onPress={() => setSelectedPeriod(period)}
                  compact
                  style={{ marginLeft: SPACING.xs }}
                  textStyle={{ fontSize: 12 }}
                >
                  {period}
                </Chip>
              ))}
            </View>
          </View>
          
          <LineChart
            data={getChartData()}
            width={screenWidth - (SPACING.md * 4)}
            height={200}
            chartConfig={chartConfig}
            bezier
            style={{
              marginVertical: SPACING.sm,
              borderRadius: 8,
            }}
            withInnerLines={false}
            withOuterLines={false}
            withVerticalLines={false}
            withHorizontalLines={true}
            withDots={true}
            withShadow={false}
            fromZero={false}
          />
          
          <Text style={[TEXT_STYLES.caption, { textAlign: 'center', color: COLORS.textSecondary }]}>
            Last 7 days weight progression
          </Text>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderQuickStats = () => (
    <View style={{ marginHorizontal: SPACING.md, marginBottom: SPACING.md }}>
      <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>Quick Stats</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Surface style={{ flex: 1, padding: SPACING.md, marginRight: SPACING.sm, borderRadius: 8, elevation: 2 }}>
          <Icon name="fitness-center" size={24} color={COLORS.primary} style={{ marginBottom: SPACING.xs }} />
          <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>
            {localWeightData[localWeightData.length - 1]?.muscleMass || 0} kg
          </Text>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
            Muscle Mass
          </Text>
        </Surface>
        
        <Surface style={{ flex: 1, padding: SPACING.md, marginHorizontal: SPACING.xs, borderRadius: 8, elevation: 2 }}>
          <Icon name="speed" size={24} color={COLORS.warning} style={{ marginBottom: SPACING.xs }} />
          <Text style={[TEXT_STYLES.h3, { color: COLORS.warning }]}>
            {localWeightData[localWeightData.length - 1]?.bodyFat || 0}%
          </Text>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
            Body Fat
          </Text>
        </Surface>
        
        <Surface style={{ flex: 1, padding: SPACING.md, marginLeft: SPACING.sm, borderRadius: 8, elevation: 2 }}>
          <Icon name="timeline" size={24} color={COLORS.success} style={{ marginBottom: SPACING.xs }} />
          <Text style={[TEXT_STYLES.h3, { color: COLORS.success }]}>
            22.4
          </Text>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
            BMI
          </Text>
        </Surface>
      </View>
    </View>
  );

  const renderRecentEntries = () => (
    <View style={{ margin: SPACING.md }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md }}>
        <Text style={TEXT_STYLES.h3}>Recent Entries</Text>
        <TouchableOpacity
          onPress={() => {
            Alert.alert(
              '🚧 Feature Coming Soon',
              'Weight history and detailed analytics will be available in a future update!',
              [{ text: 'OK', onPress: () => {} }]
            );
          }}
        >
          <Text style={[TEXT_STYLES.body, { color: COLORS.primary }]}>View All</Text>
        </TouchableOpacity>
      </View>
      
      {localWeightData.slice(-3).reverse().map((entry, index) => (
        <Animated.View
          key={entry.id}
          style={{
            opacity: fadeAnim,
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 50],
                  outputRange: [0, (index + 1) * 10],
                }),
              },
            ],
          }}
        >
          <Card style={{ marginBottom: SPACING.sm, elevation: 2 }}>
            <Card.Content style={{ padding: SPACING.md }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={[TEXT_STYLES.h4, { marginBottom: 4 }]}>
                    {entry.weight} kg
                  </Text>
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                    {formatDate(entry.date)}
                  </Text>
                </View>
                
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ alignItems: 'flex-end', marginRight: SPACING.md }}>
                    <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                      BF: {entry.bodyFat}% • MM: {entry.muscleMass}kg
                    </Text>
                    {entry.notes && (
                      <Text style={[TEXT_STYLES.caption, { color: COLORS.primary, marginTop: 2 }]}>
                        "{entry.notes}"
                      </Text>
                    )}
                  </View>
                  
                  <IconButton
                    icon="edit"
                    size={20}
                    onPress={() => {
                      Alert.alert(
                        '🚧 Feature Coming Soon',
                        'Entry editing will be available in a future update!',
                        [{ text: 'OK', onPress: () => {} }]
                      );
                    }}
                  />
                </View>
              </View>
            </Card.Content>
          </Card>
        </Animated.View>
      ))}
    </View>
  );

  const renderAddModal = () => (
    <Portal>
      <Modal
        visible={showAddModal}
        onDismiss={() => setShowAddModal(false)}
        contentContainerStyle={{
          backgroundColor: 'white',
          margin: SPACING.lg,
          borderRadius: 12,
          padding: SPACING.lg,
          maxHeight: '80%',
        }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg }}>
            <Text style={TEXT_STYLES.h2}>Add Weight Entry</Text>
            <IconButton
              icon="close"
              size={24}
              onPress={() => setShowAddModal(false)}
            />
          </View>
          
          <View style={{ marginBottom: SPACING.md }}>
            <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.sm }]}>Weight (kg) *</Text>
            <TextInput
              placeholder="75.5"
              value={newEntry.weight}
              onChangeText={(text) => setNewEntry({...newEntry, weight: text})}
              keyboardType="numeric"
              style={{
                borderWidth: 1,
                borderColor: COLORS.border,
                borderRadius: 8,
                padding: SPACING.md,
                fontSize: 16,
              }}
            />
          </View>
          
          <View style={{ marginBottom: SPACING.md }}>
            <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.sm }]}>Body Fat % (optional)</Text>
            <TextInput
              placeholder="12.5"
              value={newEntry.bodyFat}
              onChangeText={(text) => setNewEntry({...newEntry, bodyFat: text})}
              keyboardType="numeric"
              style={{
                borderWidth: 1,
                borderColor: COLORS.border,
                borderRadius: 8,
                padding: SPACING.md,
                fontSize: 16,
              }}
            />
          </View>
          
          <View style={{ marginBottom: SPACING.md }}>
            <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.sm }]}>Muscle Mass (kg) (optional)</Text>
            <TextInput
              placeholder="65.0"
              value={newEntry.muscleMass}
              onChangeText={(text) => setNewEntry({...newEntry, muscleMass: text})}
              keyboardType="numeric"
              style={{
                borderWidth: 1,
                borderColor: COLORS.border,
                borderRadius: 8,
                padding: SPACING.md,
                fontSize: 16,
              }}
            />
          </View>
          
          <View style={{ marginBottom: SPACING.lg }}>
            <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.sm }]}>Notes (optional)</Text>
            <TextInput
              placeholder="Morning weigh-in, post workout, etc."
              value={newEntry.notes}
              onChangeText={(text) => setNewEntry({...newEntry, notes: text})}
              multiline
              numberOfLines={3}
              style={{
                borderWidth: 1,
                borderColor: COLORS.border,
                borderRadius: 8,
                padding: SPACING.md,
                fontSize: 16,
                textAlignVertical: 'top',
              }}
            />
          </View>
          
          <Button
            mode="contained"
            onPress={addWeightEntry}
            style={{ backgroundColor: COLORS.primary, marginBottom: SPACING.sm }}
            contentStyle={{ paddingVertical: SPACING.sm }}
          >
            Save Entry
          </Button>
          
          <Button
            mode="outlined"
            onPress={() => setShowAddModal(false)}
            style={{ borderColor: COLORS.textSecondary }}
            textColor={COLORS.textSecondary}
          >
            Cancel
          </Button>
        </ScrollView>
      </Modal>
    </Portal>
  );

  const renderGoalModal = () => (
    <Portal>
      <Modal
        visible={showGoalModal}
        onDismiss={() => setShowGoalModal(false)}
        contentContainerStyle={{
          backgroundColor: 'white',
          margin: SPACING.lg,
          borderRadius: 12,
          padding: SPACING.lg,
        }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg }}>
            <Text style={TEXT_STYLES.h2}>Set Weight Goal</Text>
            <IconButton
              icon="close"
              size={24}
              onPress={() => setShowGoalModal(false)}
            />
          </View>
          
          <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.sm }]}>Goal Type:</Text>
          <View style={{ flexDirection: 'row', marginBottom: SPACING.md }}>
            {[
              { key: 'lose', label: '📉 Lose Weight' },
              { key: 'gain', label: '📈 Gain Weight' },
              { key: 'maintain', label: '⚖️ Maintain Weight' }
            ].map((option) => (
              <Chip
                key={option.key}
                selected={weightGoal.type === option.key}
                onPress={() => setWeightGoal({...weightGoal, type: option.key})}
                style={{ marginRight: SPACING.sm }}
              >
                {option.label}
              </Chip>
            ))}
          </View>
          
          <View style={{ marginBottom: SPACING.md }}>
            <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.sm }]}>Target Weight (kg)</Text>
            <TextInput
              placeholder="72.0"
              value={weightGoal.target}
              onChangeText={(text) => setWeightGoal({...weightGoal, target: text})}
              keyboardType="numeric"
              style={{
                borderWidth: 1,
                borderColor: COLORS.border,
                borderRadius: 8,
                padding: SPACING.md,
                fontSize: 16,
              }}
            />
          </View>
          
          <View style={{ marginBottom: SPACING.lg }}>
            <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.sm }]}>Target Date</Text>
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  '🚧 Feature Coming Soon',
                  'Date picker will be available in a future update!',
                  [{ text: 'OK', onPress: () => {} }]
                );
              }}
              style={{
                borderWidth: 1,
                borderColor: COLORS.border,
                borderRadius: 8,
                padding: SPACING.md,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Text style={{ fontSize: 16, color: COLORS.textSecondary }}>
                Select target date
              </Text>
              <Icon name="date-range" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <Button
            mode="contained"
            onPress={setGoal}
            style={{ backgroundColor: COLORS.primary, marginBottom: SPACING.sm }}
            contentStyle={{ paddingVertical: SPACING.sm }}
          >
            Set Goal
          </Button>
          
          <Button
            mode="outlined"
            onPress={() => setShowGoalModal(false)}
            style={{ borderColor: COLORS.textSecondary }}
            textColor={COLORS.textSecondary}
          >
            Cancel
          </Button>
        </ScrollView>
      </Modal>
    </Portal>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{ paddingTop: 50, paddingBottom: SPACING.lg, paddingHorizontal: SPACING.lg }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={[TEXT_STYLES.h1, { color: 'white' }]}>
            Weight Management
          </Text>
          <IconButton
            icon="target"
            size={24}
            iconColor="white"
            onPress={() => setShowGoalModal(true)}
          />
        </View>
      </LinearGradient>

      <ScrollView
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
        {renderStatsCard()}
        {renderChartCard()}
        {renderQuickStats()}
        {renderRecentEntries()}
        
        <View style={{ height: 100 }} />
      </ScrollView>

      <FAB
        icon="add"
        style={{
          position: 'absolute',
          margin: SPACING.lg,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.primary,
        }}
        onPress={() => setShowAddModal(true)}
      />

      {renderAddModal()}
      {renderGoalModal()}
    </View>
  );
};

export default WeightManagement;
