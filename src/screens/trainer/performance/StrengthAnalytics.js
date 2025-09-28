import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  Dimensions,
  Animated,
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
  Portal,
  Modal,
  Searchbar,
} from 'react-native-paper';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';

// Constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#333333',
  textLight: '#666666',
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
  caption: { fontSize: 14, color: COLORS.textLight },
  small: { fontSize: 12, color: COLORS.textLight },
};

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const StrengthAnalysis = ({ navigation }) => {
  const dispatch = useDispatch();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // State Management
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('3months');
  const [searchQuery, setSearchQuery] = useState('');
  const [showClientModal, setShowClientModal] = useState(false);
  const [activeMetric, setActiveMetric] = useState('overall');
  const [strengthData, setStrengthData] = useState({});

  // Redux State
  const user = useSelector(state => state.auth.user);
  const clients = useSelector(state => state.clients.list);
  const strengthMetrics = useSelector(state => state.analytics.strengthMetrics);

  // Mock Data for Demonstration
  const mockClients = [
    { id: '1', name: 'John Smith', avatar: null, level: 'Intermediate', lastSession: '2024-01-15' },
    { id: '2', name: 'Sarah Johnson', avatar: null, level: 'Advanced', lastSession: '2024-01-14' },
    { id: '3', name: 'Mike Davis', avatar: null, level: 'Beginner', lastSession: '2024-01-13' },
    { id: '4', name: 'Emily Wilson', avatar: null, level: 'Intermediate', lastSession: '2024-01-12' },
  ];

  const mockStrengthData = {
    overall: {
      score: 78,
      trend: '+12%',
      improvement: 'excellent',
    },
    upperBody: {
      benchPress: { current: 225, previous: 205, improvement: 9.8 },
      pullUps: { current: 15, previous: 12, improvement: 25 },
      shoulderPress: { current: 135, previous: 125, improvement: 8 },
    },
    lowerBody: {
      squat: { current: 315, previous: 290, improvement: 8.6 },
      deadlift: { current: 405, previous: 375, improvement: 8 },
      legPress: { current: 450, previous: 420, improvement: 7.1 },
    },
    core: {
      plank: { current: 180, previous: 150, improvement: 20 },
      sitUps: { current: 45, previous: 38, improvement: 18.4 },
      russianTwists: { current: 60, previous: 50, improvement: 20 },
    },
  };

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [65, 68, 72, 75, 76, 78],
        color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  const strengthDistribution = [
    { name: 'Upper Body', population: 35, color: COLORS.primary, legendFontColor: COLORS.text },
    { name: 'Lower Body', population: 40, color: COLORS.secondary, legendFontColor: COLORS.text },
    { name: 'Core', population: 25, color: COLORS.success, legendFontColor: COLORS.text },
  ];

  // Animation Effects
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Simulate data loading
    setTimeout(() => setLoading(false), 1500);
  }, []);

  // Handlers
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      // dispatch(fetchStrengthAnalytics());
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleClientSelect = (client) => {
    setSelectedClient(client);
    setShowClientModal(false);
    // Load client-specific strength data
  };

  const handleTimeframeChange = (timeframe) => {
    setSelectedTimeframe(timeframe);
    // Reload data for selected timeframe
  };

  const handleExportData = () => {
    Alert.alert(
      '📊 Export Analytics',
      'Generate detailed strength analysis report?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Export', 
          onPress: () => Alert.alert('Feature Coming Soon', 'Export functionality is under development!')
        },
      ]
    );
  };

  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <View style={styles.headerLeft}>
          <IconButton
            icon="arrow-back"
            iconColor="white"
            size={24}
            onPress={() => navigation.goBack()}
          />
        </View>
        <View style={styles.headerCenter}>
          <Text style={[TEXT_STYLES.h2, { color: 'white' }]}>💪 Strength Analysis</Text>
          <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
            Performance Insights & Progress
          </Text>
        </View>
        <View style={styles.headerRight}>
          <IconButton
            icon="file-export"
            iconColor="white"
            size={24}
            onPress={handleExportData}
          />
        </View>
      </View>
    </LinearGradient>
  );

  const renderClientSelector = () => (
    <Surface style={styles.clientSelector} elevation={2}>
      <TouchableOpacity 
        style={styles.clientSelectorButton}
        onPress={() => setShowClientModal(true)}
      >
        <View style={styles.clientInfo}>
          {selectedClient ? (
            <>
              <Avatar.Text size={40} label={selectedClient.name.split(' ').map(n => n[0]).join('')} />
              <View style={styles.clientDetails}>
                <Text style={TEXT_STYLES.body}>{selectedClient.name}</Text>
                <Text style={TEXT_STYLES.caption}>Level: {selectedClient.level}</Text>
              </View>
            </>
          ) : (
            <>
              <Avatar.Icon size={40} icon="account-multiple" />
              <View style={styles.clientDetails}>
                <Text style={TEXT_STYLES.body}>Select Client</Text>
                <Text style={TEXT_STYLES.caption}>Choose client to analyze</Text>
              </View>
            </>
          )}
        </View>
        <Icon name="keyboard-arrow-down" size={24} color={COLORS.textLight} />
      </TouchableOpacity>
    </Surface>
  );

  const renderTimeframeSelector = () => (
    <View style={styles.timeframeContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {['1month', '3months', '6months', '1year'].map((timeframe) => (
          <Chip
            key={timeframe}
            mode={selectedTimeframe === timeframe ? 'flat' : 'outlined'}
            selected={selectedTimeframe === timeframe}
            onPress={() => handleTimeframeChange(timeframe)}
            style={[
              styles.timeframeChip,
              selectedTimeframe === timeframe && { backgroundColor: COLORS.primary }
            ]}
            textStyle={{
              color: selectedTimeframe === timeframe ? 'white' : COLORS.text
            }}
          >
            {timeframe === '1month' ? '1 Month' :
             timeframe === '3months' ? '3 Months' :
             timeframe === '6months' ? '6 Months' : '1 Year'}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const renderOverallStrengthCard = () => (
    <Card style={styles.overallCard}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.overallCardGradient}
      >
        <Card.Content>
          <View style={styles.overallHeader}>
            <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>🎯 Overall Strength Score</Text>
            <View style={styles.scoreContainer}>
              <Text style={[TEXT_STYLES.h1, { color: 'white', fontSize: 48 }]}>
                {mockStrengthData.overall.score}
              </Text>
              <View style={styles.trendContainer}>
                <Icon name="trending-up" size={20} color={COLORS.success} />
                <Text style={[TEXT_STYLES.caption, { color: COLORS.success }]}>
                  {mockStrengthData.overall.trend}
                </Text>
              </View>
            </View>
          </View>
          <ProgressBar
            progress={mockStrengthData.overall.score / 100}
            color="white"
            style={styles.overallProgress}
          />
          <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)', marginTop: SPACING.sm }]}>
            🔥 Excellent improvement this period!
          </Text>
        </Card.Content>
      </LinearGradient>
    </Card>
  );

  const renderProgressChart = () => (
    <Card style={styles.chartCard}>
      <Card.Content>
        <Text style={[TEXT_STYLES.h3, styles.cardTitle]}>📈 Strength Progress</Text>
        <LineChart
          data={chartData}
          width={screenWidth - 60}
          height={220}
          chartConfig={{
            backgroundColor: 'transparent',
            backgroundGradientFrom: 'transparent',
            backgroundGradientTo: 'transparent',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
            style: { borderRadius: 16 },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: COLORS.primary,
            },
          }}
          style={styles.chart}
          bezier
        />
      </Card.Content>
    </Card>
  );

  const renderStrengthBreakdown = () => (
    <Card style={styles.breakdownCard}>
      <Card.Content>
        <Text style={[TEXT_STYLES.h3, styles.cardTitle]}>🎯 Strength Distribution</Text>
        <PieChart
          data={strengthDistribution}
          width={screenWidth - 60}
          height={200}
          chartConfig={{
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </Card.Content>
    </Card>
  );

  const renderMuscleGroupAnalysis = () => (
    <View style={styles.muscleGroupContainer}>
      <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>💪 Muscle Group Analysis</Text>
      
      {/* Upper Body */}
      <Card style={styles.muscleGroupCard}>
        <Card.Content>
          <View style={styles.muscleGroupHeader}>
            <Text style={TEXT_STYLES.h3}>🏋️‍♂️ Upper Body</Text>
            <Chip mode="flat" style={{ backgroundColor: COLORS.primary }}>
              <Text style={{ color: 'white' }}>Strong</Text>
            </Chip>
          </View>
          {Object.entries(mockStrengthData.upperBody).map(([exercise, data]) => (
            <View key={exercise} style={styles.exerciseRow}>
              <View style={styles.exerciseInfo}>
                <Text style={TEXT_STYLES.body}>
                  {exercise === 'benchPress' ? 'Bench Press' :
                   exercise === 'pullUps' ? 'Pull Ups' : 'Shoulder Press'}
                </Text>
                <Text style={TEXT_STYLES.caption}>
                  {data.current}{exercise === 'pullUps' ? ' reps' : ' lbs'}
                </Text>
              </View>
              <View style={styles.improvementBadge}>
                <Icon name="trending-up" size={16} color={COLORS.success} />
                <Text style={[TEXT_STYLES.small, { color: COLORS.success }]}>
                  +{data.improvement}%
                </Text>
              </View>
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* Lower Body */}
      <Card style={styles.muscleGroupCard}>
        <Card.Content>
          <View style={styles.muscleGroupHeader}>
            <Text style={TEXT_STYLES.h3}>🦵 Lower Body</Text>
            <Chip mode="flat" style={{ backgroundColor: COLORS.secondary }}>
              <Text style={{ color: 'white' }}>Excellent</Text>
            </Chip>
          </View>
          {Object.entries(mockStrengthData.lowerBody).map(([exercise, data]) => (
            <View key={exercise} style={styles.exerciseRow}>
              <View style={styles.exerciseInfo}>
                <Text style={TEXT_STYLES.body}>
                  {exercise === 'squat' ? 'Squat' :
                   exercise === 'deadlift' ? 'Deadlift' : 'Leg Press'}
                </Text>
                <Text style={TEXT_STYLES.caption}>{data.current} lbs</Text>
              </View>
              <View style={styles.improvementBadge}>
                <Icon name="trending-up" size={16} color={COLORS.success} />
                <Text style={[TEXT_STYLES.small, { color: COLORS.success }]}>
                  +{data.improvement}%
                </Text>
              </View>
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* Core */}
      <Card style={styles.muscleGroupCard}>
        <Card.Content>
          <View style={styles.muscleGroupHeader}>
            <Text style={TEXT_STYLES.h3}>🎯 Core</Text>
            <Chip mode="flat" style={{ backgroundColor: COLORS.success }}>
              <Text style={{ color: 'white' }}>Improving</Text>
            </Chip>
          </View>
          {Object.entries(mockStrengthData.core).map(([exercise, data]) => (
            <View key={exercise} style={styles.exerciseRow}>
              <View style={styles.exerciseInfo}>
                <Text style={TEXT_STYLES.body}>
                  {exercise === 'plank' ? 'Plank Hold' :
                   exercise === 'sitUps' ? 'Sit Ups' : 'Russian Twists'}
                </Text>
                <Text style={TEXT_STYLES.caption}>
                  {data.current}{exercise === 'plank' ? ' sec' : ' reps'}
                </Text>
              </View>
              <View style={styles.improvementBadge}>
                <Icon name="trending-up" size={16} color={COLORS.success} />
                <Text style={[TEXT_STYLES.small, { color: COLORS.success }]}>
                  +{data.improvement}%
                </Text>
              </View>
            </View>
          ))}
        </Card.Content>
      </Card>
    </View>
  );

  const renderAIInsights = () => (
    <Card style={styles.insightsCard}>
      <LinearGradient
        colors={[COLORS.success, '#4CAF50']}
        style={styles.insightsGradient}
      >
        <Card.Content>
          <View style={styles.insightsHeader}>
            <Icon name="psychology" size={32} color="white" />
            <Text style={[TEXT_STYLES.h3, { color: 'white', marginLeft: SPACING.sm }]}>
              🤖 AI Insights
            </Text>
          </View>
          <View style={styles.insightsList}>
            <View style={styles.insightItem}>
              <Icon name="check-circle" size={20} color="white" />
              <Text style={[TEXT_STYLES.body, { color: 'white', marginLeft: SPACING.sm }]}>
                Upper body strength showing consistent 9% monthly growth
              </Text>
            </View>
            <View style={styles.insightItem}>
              <Icon name="trending-up" size={20} color="white" />
              <Text style={[TEXT_STYLES.body, { color: 'white', marginLeft: SPACING.sm }]}>
                Core stability improved by 20% - excellent progress
              </Text>
            </View>
            <View style={styles.insightItem}>
              <Icon name="lightbulb-outline" size={20} color="white" />
              <Text style={[TEXT_STYLES.body, { color: 'white', marginLeft: SPACING.sm }]}>
                Recommend increasing squat volume by 10% next week
              </Text>
            </View>
          </View>
        </Card.Content>
      </LinearGradient>
    </Card>
  );

  const renderClientModal = () => (
    <Portal>
      <Modal
        visible={showClientModal}
        onDismiss={() => setShowClientModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.blurContainer} blurType="light" blurAmount={10}>
          <Surface style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={TEXT_STYLES.h3}>👥 Select Client</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setShowClientModal(false)}
              />
            </View>
            
            <Searchbar
              placeholder="Search clients..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchbar}
            />

            <ScrollView style={styles.clientList}>
              {mockClients
                .filter(client => 
                  client.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((client) => (
                <TouchableOpacity
                  key={client.id}
                  style={styles.clientItem}
                  onPress={() => handleClientSelect(client)}
                >
                  <Avatar.Text 
                    size={50} 
                    label={client.name.split(' ').map(n => n[0]).join('')} 
                  />
                  <View style={styles.clientItemDetails}>
                    <Text style={TEXT_STYLES.body}>{client.name}</Text>
                    <Text style={TEXT_STYLES.caption}>Level: {client.level}</Text>
                    <Text style={TEXT_STYLES.small}>Last session: {client.lastSession}</Text>
                  </View>
                  <Icon name="chevron-right" size={24} color={COLORS.textLight} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Surface>
        </BlurView>
      </Modal>
    </Portal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        {renderHeader()}
        <View style={styles.loadingContent}>
          <Icon name="fitness-center" size={80} color={COLORS.primary} />
          <Text style={[TEXT_STYLES.h3, { marginTop: SPACING.lg }]}>
            Analyzing Strength Data...
          </Text>
          <ProgressBar
            indeterminate
            color={COLORS.primary}
            style={styles.loadingProgress}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
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
          {renderClientSelector()}
          {renderTimeframeSelector()}
          {renderOverallStrengthCard()}
          {renderProgressChart()}
          {renderStrengthBreakdown()}
          {renderMuscleGroupAnalysis()}
          {renderAIInsights()}
          
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </Animated.View>

      {renderClientModal()}

      <FAB
        icon="add-chart"
        style={styles.fab}
        onPress={() => {
          Alert.alert('Feature Coming Soon', 'Custom strength assessment creation is under development!');
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
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
  },
  headerLeft: {
    width: 50,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    width: 50,
    alignItems: 'flex-end',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  loadingProgress: {
    width: '80%',
    marginTop: SPACING.lg,
  },
  clientSelector: {
    marginVertical: SPACING.md,
    borderRadius: 12,
  },
  clientSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clientDetails: {
    marginLeft: SPACING.md,
  },
  timeframeContainer: {
    marginBottom: SPACING.md,
  },
  timeframeChip: {
    marginRight: SPACING.sm,
  },
  overallCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  overallCardGradient: {
    borderRadius: 16,
  },
  overallHeader: {
    alignItems: 'center',
  },
  scoreContainer: {
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  overallProgress: {
    height: 8,
    borderRadius: 4,
    marginTop: SPACING.md,
  },
  chartCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
  },
  cardTitle: {
    marginBottom: SPACING.md,
  },
  chart: {
    borderRadius: 16,
  },
  breakdownCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
  },
  muscleGroupContainer: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  muscleGroupCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
  },
  muscleGroupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  exerciseInfo: {
    flex: 1,
  },
  improvementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.success}20`,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  insightsCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    elevation: 4,
  },
  insightsGradient: {
    borderRadius: 16,
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  insightsList: {
    gap: SPACING.md,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.md,
  },
  blurContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    maxHeight: screenHeight * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchbar: {
    margin: SPACING.md,
    elevation: 0,
    backgroundColor: COLORS.background,
  },
  clientList: {
    maxHeight: 400,
  },
  clientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  clientItemDetails: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  fab: {
    position: 'absolute',
    right: SPACING.md,
    bottom: SPACING.md,
    backgroundColor: COLORS.primary,
  },
  bottomSpacer: {
    height: 100,
  },
});

export default StrengthAnalysis;