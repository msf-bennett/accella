import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  Dimensions,
  Animated,
  TouchableOpacity,
  Modal,
  TextInput,
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
  Portal,
  Searchbar,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '@react-native-blur/blur';

// Import design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f5f5',
  white: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  card: '#ffffff',
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
  h1: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textSecondary },
  small: { fontSize: 12, color: COLORS.textSecondary },
};

const { width: screenWidth } = Dimensions.get('window');

const ClientProgress = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { clientId } = route.params || {};
  
  // Redux state
  const { user, isLoading } = useSelector(state => state.auth);
  const { clients, progressData } = useSelector(state => state.trainer);

  // Component state
  const [refreshing, setRefreshing] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddProgress, setShowAddProgress] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('weight');
  const [progressEntry, setProgressEntry] = useState({
    weight: '',
    bodyFat: '',
    muscle: '',
    measurements: {
      chest: '',
      waist: '',
      arms: '',
      thighs: '',
    },
    performance: {
      benchPress: '',
      squat: '',
      deadlift: '',
      cardio: '',
    },
    notes: '',
  });

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Mock data for demonstration
  const mockClient = {
    id: 'client1',
    name: 'Sarah Johnson',
    avatar: null,
    age: 28,
    startDate: '2024-01-15',
    program: 'Weight Loss & Strength',
    goals: [
      { id: '1', title: 'Lose 15 lbs', target: 15, current: 8, unit: 'lbs', type: 'weight_loss' },
      { id: '2', title: 'Bench Press 100 lbs', target: 100, current: 75, unit: 'lbs', type: 'strength' },
      { id: '3', title: 'Run 5K under 25 min', target: 25, current: 28, unit: 'min', type: 'cardio' },
    ],
    stats: {
      sessionsCompleted: 42,
      totalSessions: 48,
      streak: 12,
      adherence: 87.5,
    },
    recentProgress: [
      { date: '2024-08-15', weight: 152, bodyFat: 22, muscle: 42 },
      { date: '2024-08-01', weight: 154, bodyFat: 23, muscle: 41 },
      { date: '2024-07-15', weight: 156, bodyFat: 24, muscle: 40 },
      { date: '2024-07-01', weight: 158, bodyFat: 25, muscle: 39 },
      { date: '2024-06-15', weight: 160, bodyFat: 26, muscle: 38 },
    ],
    measurements: {
      chest: [36, 35.5, 35, 34.5],
      waist: [32, 31, 30.5, 30],
      arms: [12, 12.2, 12.5, 12.8],
      thighs: [24, 23.5, 23.2, 23],
    },
    performance: {
      benchPress: [65, 70, 72, 75],
      squat: [95, 100, 105, 110],
      deadlift: [135, 140, 145, 150],
      cardio: [30, 29, 28, 28],
    },
  };

  useEffect(() => {
    if (clientId) {
      // Load client data
      setSelectedClient(mockClient);
    }
    
    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [clientId, fadeAnim, slideAnim]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleAddProgress = () => {
    Alert.alert(
      '✅ Progress Added',
      'Client progress has been successfully recorded!',
      [{ text: 'OK' }]
    );
    setShowAddProgress(false);
    setProgressEntry({
      weight: '',
      bodyFat: '',
      muscle: '',
      measurements: { chest: '', waist: '', arms: '', thighs: '' },
      performance: { benchPress: '', squat: '', deadlift: '', cardio: '' },
      notes: '',
    });
  };

  const handleSetGoal = () => {
    Alert.alert(
      '🎯 Goal Set',
      'New goal has been added for the client!',
      [{ text: 'OK' }]
    );
    setShowGoalModal(false);
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={styles.header}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.headerContent}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        
        <View style={styles.clientInfo}>
          <Avatar.Text
            size={50}
            label={selectedClient?.name?.split(' ').map(n => n[0]).join('') || 'SJ'}
            style={styles.avatar}
          />
          <View style={styles.clientDetails}>
            <Text style={[TEXT_STYLES.h3, { color: COLORS.white }]}>
              {selectedClient?.name}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.white, opacity: 0.9 }]}>
              {selectedClient?.program} • Day {Math.floor(Math.random() * 100)}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.moreButton}>
          <Icon name="dots-vertical" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statsRow}>
        <Surface style={styles.statCard}>
          <Text style={[TEXT_STYLES.h2, { color: COLORS.primary }]}>
            {selectedClient?.stats.streak}
          </Text>
          <Text style={TEXT_STYLES.caption}>Day Streak 🔥</Text>
        </Surface>
        
        <Surface style={styles.statCard}>
          <Text style={[TEXT_STYLES.h2, { color: COLORS.success }]}>
            {selectedClient?.stats.adherence}%
          </Text>
          <Text style={TEXT_STYLES.caption}>Adherence ✅</Text>
        </Surface>
        
        <Surface style={styles.statCard}>
          <Text style={[TEXT_STYLES.h2, { color: COLORS.warning }]}>
            {selectedClient?.stats.sessionsCompleted}
          </Text>
          <Text style={TEXT_STYLES.caption}>Sessions 💪</Text>
        </Surface>
      </View>
    </View>
  );

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {['overview', 'body', 'performance', 'goals'].map((tab) => (
          <Chip
            key={tab}
            selected={activeTab === tab}
            onPress={() => setActiveTab(tab)}
            style={[
              styles.tabChip,
              activeTab === tab && { backgroundColor: COLORS.primary }
            ]}
            textStyle={activeTab === tab ? { color: COLORS.white } : {}}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      {/* Progress Summary */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.sm }]}>
            📈 Progress Summary
          </Text>
          <View style={styles.progressItem}>
            <Text style={TEXT_STYLES.body}>Weight Loss Progress</Text>
            <View style={styles.progressBarContainer}>
              <ProgressBar
                progress={8/15}
                color={COLORS.success}
                style={styles.progressBar}
              />
              <Text style={TEXT_STYLES.caption}>8/15 lbs</Text>
            </View>
          </View>
          
          <View style={styles.progressItem}>
            <Text style={TEXT_STYLES.body}>Strength Goal Progress</Text>
            <View style={styles.progressBarContainer}>
              <ProgressBar
                progress={75/100}
                color={COLORS.primary}
                style={styles.progressBar}
              />
              <Text style={TEXT_STYLES.caption}>75/100 lbs</Text>
            </View>
          </View>

          <View style={styles.progressItem}>
            <Text style={TEXT_STYLES.body}>Cardio Goal Progress</Text>
            <View style={styles.progressBarContainer}>
              <ProgressBar
                progress={0.85}
                color={COLORS.warning}
                style={styles.progressBar}
              />
              <Text style={TEXT_STYLES.caption}>28/25 min</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Recent Activity */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.sm }]}>
            🏃‍♀️ Recent Activity
          </Text>
          <View style={styles.activityItem}>
            <Icon name="fitness-center" size={24} color={COLORS.primary} />
            <View style={styles.activityText}>
              <Text style={TEXT_STYLES.body}>Upper Body Strength</Text>
              <Text style={TEXT_STYLES.caption}>2 hours ago • Great form!</Text>
            </View>
            <Chip style={styles.completedChip}>Completed</Chip>
          </View>
          
          <View style={styles.activityItem}>
            <Icon name="directions-run" size={24} color={COLORS.success} />
            <View style={styles.activityText}>
              <Text style={TEXT_STYLES.body}>Cardio Session</Text>
              <Text style={TEXT_STYLES.caption}>Yesterday • 28 min 5K</Text>
            </View>
            <Chip style={styles.completedChip}>Completed</Chip>
          </View>
        </Card.Content>
      </Card>
    </View>
  );

  const renderBodyTab = () => (
    <View style={styles.tabContent}>
      {/* Weight Progress Chart */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.sm }]}>
            ⚖️ Weight Progress
          </Text>
          <LineChart
            data={{
              labels: ['Jun', 'Jul 1', 'Jul 15', 'Aug 1', 'Aug 15'],
              datasets: [{
                data: [160, 158, 156, 154, 152],
                color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
                strokeWidth: 3,
              }]
            }}
            width={screenWidth - 64}
            height={200}
            chartConfig={{
              backgroundColor: COLORS.white,
              backgroundGradientFrom: COLORS.white,
              backgroundGradientTo: COLORS.white,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
              style: { borderRadius: 16 }
            }}
            style={styles.chart}
          />
        </Card.Content>
      </Card>

      {/* Body Composition */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.sm }]}>
            📊 Body Composition
          </Text>
          <View style={styles.compositionRow}>
            <Surface style={styles.compositionCard}>
              <Text style={[TEXT_STYLES.h2, { color: COLORS.error }]}>22%</Text>
              <Text style={TEXT_STYLES.caption}>Body Fat</Text>
              <Text style={[TEXT_STYLES.small, { color: COLORS.success }]}>↓ -4%</Text>
            </Surface>
            
            <Surface style={styles.compositionCard}>
              <Text style={[TEXT_STYLES.h2, { color: COLORS.primary }]}>42%</Text>
              <Text style={TEXT_STYLES.caption}>Muscle Mass</Text>
              <Text style={[TEXT_STYLES.small, { color: COLORS.success }]}>↑ +4%</Text>
            </Surface>
          </View>
        </Card.Content>
      </Card>

      {/* Measurements */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.sm }]}>
            📏 Measurements (inches)
          </Text>
          {Object.entries(selectedClient?.measurements || {}).map(([key, values]) => (
            <View key={key} style={styles.measurementItem}>
              <Text style={TEXT_STYLES.body}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </Text>
              <View style={styles.measurementValues}>
                <Text style={TEXT_STYLES.caption}>
                  Current: {values[values.length - 1]}"
                </Text>
                <Text style={[
                  TEXT_STYLES.caption,
                  { color: values[0] > values[values.length - 1] ? COLORS.success : COLORS.error }
                ]}>
                  Change: {(values[values.length - 1] - values[0]).toFixed(1)}"
                </Text>
              </View>
            </View>
          ))}
        </Card.Content>
      </Card>
    </View>
  );

  const renderPerformanceTab = () => (
    <View style={styles.tabContent}>
      {/* Strength Progress */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.sm }]}>
            🏋️‍♀️ Strength Progress
          </Text>
          <BarChart
            data={{
              labels: ['Bench', 'Squat', 'Deadlift'],
              datasets: [{
                data: [75, 110, 150]
              }]
            }}
            width={screenWidth - 64}
            height={200}
            chartConfig={{
              backgroundColor: COLORS.white,
              backgroundGradientFrom: COLORS.white,
              backgroundGradientTo: COLORS.white,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(118, 75, 162, ${opacity})`,
              style: { borderRadius: 16 }
            }}
            style={styles.chart}
          />
        </Card.Content>
      </Card>

      {/* Performance Metrics */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.sm }]}>
            📈 Performance Metrics
          </Text>
          {Object.entries(selectedClient?.performance || {}).map(([key, values]) => (
            <View key={key} style={styles.performanceItem}>
              <Text style={TEXT_STYLES.body}>
                {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
              </Text>
              <View style={styles.performanceValues}>
                <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>
                  {values[values.length - 1]}
                  {key === 'cardio' ? ' min' : ' lbs'}
                </Text>
                <Text style={[
                  TEXT_STYLES.caption,
                  { 
                    color: key === 'cardio' 
                      ? (values[0] > values[values.length - 1] ? COLORS.success : COLORS.error)
                      : (values[0] < values[values.length - 1] ? COLORS.success : COLORS.error)
                  }
                ]}>
                  {key === 'cardio' ? '↓' : '↑'} {Math.abs(values[values.length - 1] - values[0])} 
                  {key === 'cardio' ? ' min faster' : ' lbs stronger'}
                </Text>
              </View>
            </View>
          ))}
        </Card.Content>
      </Card>
    </View>
  );

  const renderGoalsTab = () => (
    <View style={styles.tabContent}>
      {/* Active Goals */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text style={[TEXT_STYLES.h3, { flex: 1 }]}>🎯 Active Goals</Text>
            <IconButton
              icon="add"
              size={20}
              onPress={() => setShowGoalModal(true)}
              style={styles.addButton}
            />
          </View>
          
          {selectedClient?.goals.map((goal) => (
            <Surface key={goal.id} style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <Text style={TEXT_STYLES.body}>{goal.title}</Text>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.primary }]}>
                  {goal.current}/{goal.target} {goal.unit}
                </Text>
              </View>
              
              <ProgressBar
                progress={goal.current / goal.target}
                color={
                  goal.type === 'weight_loss' ? COLORS.success :
                  goal.type === 'strength' ? COLORS.primary : COLORS.warning
                }
                style={styles.goalProgress}
              />
              
              <View style={styles.goalFooter}>
                <Chip size="small" style={styles.goalTypeChip}>
                  {goal.type.replace('_', ' ')}
                </Chip>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.success }]}>
                  {Math.round((goal.current / goal.target) * 100)}% Complete
                </Text>
              </View>
            </Surface>
          ))}
        </Card.Content>
      </Card>

      {/* Achievement Badges */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.sm }]}>
            🏆 Recent Achievements
          </Text>
          <View style={styles.badgeContainer}>
            <Surface style={styles.badgeCard}>
              <Text style={styles.badgeEmoji}>🔥</Text>
              <Text style={TEXT_STYLES.caption}>10 Day Streak</Text>
            </Surface>
            
            <Surface style={styles.badgeCard}>
              <Text style={styles.badgeEmoji}>💪</Text>
              <Text style={TEXT_STYLES.caption}>Strength Milestone</Text>
            </Surface>
            
            <Surface style={styles.badgeCard}>
              <Text style={styles.badgeEmoji}>🎯</Text>
              <Text style={TEXT_STYLES.caption}>Goal Crusher</Text>
            </Surface>
          </View>
        </Card.Content>
      </Card>
    </View>
  );

  const renderAddProgressModal = () => (
    <Portal>
      <Modal
        visible={showAddProgress}
        onDismiss={() => setShowAddProgress(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.modalBlur} blurType="light" blurAmount={10} />
        <Surface style={styles.modalContent}>
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
            📊 Add Progress Entry
          </Text>
          
          <ScrollView style={styles.modalScroll}>
            <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.sm }]}>
              Body Metrics
            </Text>
            
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Weight (lbs)"
                value={progressEntry.weight}
                onChangeText={(text) => setProgressEntry(prev => ({...prev, weight: text}))}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                placeholder="Body Fat %"
                value={progressEntry.bodyFat}
                onChangeText={(text) => setProgressEntry(prev => ({...prev, bodyFat: text}))}
                keyboardType="numeric"
              />
            </View>
            
            <Text style={[TEXT_STYLES.body, { marginTop: SPACING.md, marginBottom: SPACING.sm }]}>
              Performance
            </Text>
            
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Bench Press (lbs)"
                value={progressEntry.performance.benchPress}
                onChangeText={(text) => setProgressEntry(prev => ({
                  ...prev, 
                  performance: {...prev.performance, benchPress: text}
                }))}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                placeholder="Squat (lbs)"
                value={progressEntry.performance.squat}
                onChangeText={(text) => setProgressEntry(prev => ({
                  ...prev, 
                  performance: {...prev.performance, squat: text}
                }))}
                keyboardType="numeric"
              />
            </View>
          </ScrollView>
          
          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={() => setShowAddProgress(false)}
              style={styles.modalButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleAddProgress}
              style={[styles.modalButton, { backgroundColor: COLORS.primary }]}
            >
              Add Progress
            </Button>
          </View>
        </Surface>
      </Modal>
    </Portal>
  );

  if (!selectedClient) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={TEXT_STYLES.body}>Loading client data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      
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
          {renderStats()}
          {renderTabBar()}
          
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'body' && renderBodyTab()}
          {activeTab === 'performance' && renderPerformanceTab()}
          {activeTab === 'goals' && renderGoalsTab()}
          
          <View style={styles.bottomPadding} />
        </ScrollView>
      </Animated.View>

      <FAB
        style={styles.fab}
        icon="add"
        onPress={() => setShowAddProgress(true)}
        color={COLORS.white}
      />

      {renderAddProgressModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  backButton: {
    padding: SPACING.sm,
  },
  clientInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  avatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  clientDetails: {
    marginLeft: SPACING.md,
  },
  moreButton: {
    padding: SPACING.sm,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    padding: SPACING.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    padding: SPACING.md,
    marginHorizontal: SPACING.xs,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  tabBar: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  tabChip: {
    marginRight: SPACING.sm,
  },
  tabContent: {
    paddingHorizontal: SPACING.md,
  },
  card: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  addButton: {
    backgroundColor: COLORS.primary,
  },
  progressItem: {
    marginBottom: SPACING.md,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.sm,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  activityText: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  completedChip: {
    backgroundColor: COLORS.success,
  },
  chart: {
    borderRadius: 16,
    marginVertical: SPACING.sm,
  },
  compositionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  compositionCard: {
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 1,
    minWidth: 120,
  },
  measurementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  measurementValues: {
    alignItems: 'flex-end',
  },
  performanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  performanceValues: {
    alignItems: 'flex-end',
  },
  goalCard: {
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: 12,
    elevation: 1,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  goalProgress: {
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.sm,
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalTypeChip: {
    backgroundColor: COLORS.background,
  },
  badgeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  badgeCard: {
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 1,
    minWidth: 80,
    marginBottom: SPACING.sm,
  },
  badgeEmoji: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.lg,
    margin: SPACING.lg,
    maxHeight: '80%',
    width: '90%',
    elevation: 8,
  },
  modalScroll: {
    maxHeight: 300,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.sm,
    marginHorizontal: SPACING.xs,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.white,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  bottomPadding: {
    height: 100,
  },
});

export default ClientProgress;