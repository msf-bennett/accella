import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  RefreshControl,
  Alert,
  StatusBar,
  Dimensions,
  TouchableOpacity,
  Vibration,
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
  Modal,
  Divider,
  Badge,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LineChart, AreaChart, BarChart, PieChart } from 'react-native-chart-kit';

// Constants (these would typically be imported from your constants file)
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',
  background: '#f5f5f5',
  white: '#FFFFFF',
  text: '#333333',
  textSecondary: '#666666',
  cardio: '#E91E63',
  heartRate: '#FF5722',
  vo2max: '#009688',
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
  h3: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16 },
  caption: { fontSize: 12, color: COLORS.textSecondary },
};

const { width: screenWidth } = Dimensions.get('window');

const CardioAnalysis = ({ navigation }) => {
  // Redux state
  const dispatch = useDispatch();
  const { user, clients, cardioData } = useSelector(state => ({
    user: state.auth.user,
    clients: state.clients.list,
    cardioData: state.cardio.data,
  }));

  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedMetric, setSelectedMetric] = useState('heartRate');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [animatedValue] = useState(new Animated.Value(0));
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  // Mock cardio data
  const [mockClients] = useState([
    {
      id: '1',
      name: 'Alex Rivera',
      avatar: null,
      sport: 'Running',
      level: 'Advanced',
      restingHR: 52,
      maxHR: 186,
      vo2Max: 58.2,
      lastWorkout: '2 hours ago',
      weeklyMinutes: 420,
      zone2Time: 65,
      improvement: '+12%',
      hrVariability: 42,
      recoveryScore: 85,
    },
    {
      id: '2',
      name: 'Emma Wilson',
      avatar: null,
      sport: 'Cycling',
      level: 'Intermediate',
      restingHR: 58,
      maxHR: 192,
      vo2Max: 45.8,
      lastWorkout: '1 day ago',
      weeklyMinutes: 380,
      zone2Time: 58,
      improvement: '+8%',
      hrVariability: 38,
      recoveryScore: 78,
    },
    {
      id: '3',
      name: 'James Chen',
      avatar: null,
      sport: 'Swimming',
      level: 'Expert',
      restingHR: 48,
      maxHR: 184,
      vo2Max: 62.1,
      lastWorkout: '4 hours ago',
      weeklyMinutes: 450,
      zone2Time: 72,
      improvement: '+15%',
      hrVariability: 45,
      recoveryScore: 92,
    },
  ]);

  const [cardioMetrics] = useState({
    heartRate: {
      title: 'Heart Rate Analysis',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            data: [65, 72, 68, 78, 75, 82, 70],
            color: (opacity = 1) => `rgba(233, 30, 99, ${opacity})`,
            strokeWidth: 3,
          },
        ],
      },
      unit: 'bpm',
      icon: 'favorite',
      color: COLORS.cardio,
    },
    vo2max: {
      title: 'VO2 Max Progression',
      data: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
          {
            data: [48.2, 49.1, 50.8, 52.3],
            color: (opacity = 1) => `rgba(0, 150, 136, ${opacity})`,
            strokeWidth: 3,
          },
        ],
      },
      unit: 'ml/kg/min',
      icon: 'speed',
      color: COLORS.vo2max,
    },
    zones: {
      title: 'Training Zones',
      data: [
        {
          name: 'Zone 1',
          percentage: 20,
          color: '#4CAF50',
          legendFontColor: COLORS.text,
          legendFontSize: 12,
        },
        {
          name: 'Zone 2',
          percentage: 35,
          color: '#2196F3',
          legendFontColor: COLORS.text,
          legendFontSize: 12,
        },
        {
          name: 'Zone 3',
          percentage: 25,
          color: '#FF9800',
          legendFontColor: COLORS.text,
          legendFontSize: 12,
        },
        {
          name: 'Zone 4',
          percentage: 15,
          color: '#FF5722',
          legendFontColor: COLORS.text,
          legendFontSize: 12,
        },
        {
          name: 'Zone 5',
          percentage: 5,
          color: '#E91E63',
          legendFontColor: COLORS.text,
          legendFontSize: 12,
        },
      ],
      unit: '%',
      icon: 'donut-large',
      color: COLORS.primary,
    },
  });

  // Heart rate zones configuration
  const heartRateZones = [
    { name: 'Recovery', range: '50-60%', color: '#4CAF50', description: 'Active recovery' },
    { name: 'Aerobic Base', range: '60-70%', color: '#2196F3', description: 'Fat burning zone' },
    { name: 'Aerobic', range: '70-80%', color: '#FF9800', description: 'Cardio fitness' },
    { name: 'Threshold', range: '80-90%', color: '#FF5722', description: 'Lactate threshold' },
    { name: 'Neuromuscular', range: '90-100%', color: '#E91E63', description: 'Max effort' },
  ];

  // Pulse animation effect
  useEffect(() => {
    const createPulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start(() => createPulse());
    };
    createPulse();
  }, []);

  // Main animation effect
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  // Refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Vibration.vibrate(100);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  // Filter clients based on search
  const filteredClients = mockClients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.sport.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Chart configuration
  const chartConfig = {
    backgroundGradientFrom: COLORS.white,
    backgroundGradientTo: COLORS.white,
    color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
    strokeWidth: 3,
    barPercentage: 0.7,
    useShadowColorFromDataset: true,
    decimalPlaces: 1,
    fillShadowGradient: COLORS.primary,
    fillShadowGradientOpacity: 0.3,
  };

  const getHeartRateZone = (hr, maxHR) => {
    const percentage = (hr / maxHR) * 100;
    if (percentage < 60) return { zone: 1, color: '#4CAF50' };
    if (percentage < 70) return { zone: 2, color: '#2196F3' };
    if (percentage < 80) return { zone: 3, color: '#FF9800' };
    if (percentage < 90) return { zone: 4, color: '#FF5722' };
    return { zone: 5, color: '#E91E63' };
  };

  const renderClientCard = (client) => {
    const avgHRZone = getHeartRateZone(70, client.maxHR);
    
    return (
      <Card key={client.id} style={styles.clientCard} elevation={4}>
        <TouchableOpacity
          onPress={() => {
            setSelectedClient(client);
            setDetailModalVisible(true);
            Vibration.vibrate(50);
          }}
          activeOpacity={0.8}
        >
          <Card.Content style={styles.clientCardContent}>
            <View style={styles.clientHeader}>
              <View style={styles.avatarContainer}>
                <Avatar.Text
                  size={60}
                  label={client.name.split(' ').map(n => n[0]).join('')}
                  style={{ backgroundColor: COLORS.primary }}
                />
                <Badge
                  visible
                  style={[styles.sportBadge, { backgroundColor: avgHRZone.color }]}
                >
                  Z{avgHRZone.zone}
                </Badge>
              </View>
              
              <View style={styles.clientInfo}>
                <Text style={[TEXT_STYLES.h3, { color: COLORS.text }]}>
                  {client.name}
                </Text>
                <Text style={TEXT_STYLES.caption}>
                  {client.sport} • {client.level}
                </Text>
                <View style={styles.improvementRow}>
                  <Icon name="trending-up" size={16} color={COLORS.success} />
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.success, fontWeight: 'bold' }]}>
                    {client.improvement} this month
                  </Text>
                </View>
              </View>

              <Animated.View
                style={[
                  styles.heartIcon,
                  { transform: [{ scale: pulseAnimation }] }
                ]}
              >
                <Icon name="favorite" size={24} color={COLORS.cardio} />
              </Animated.View>
            </View>

            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.cardio }]}>
                  Resting HR
                </Text>
                <Text style={[TEXT_STYLES.h3, { color: COLORS.cardio }]}>
                  {client.restingHR}
                </Text>
                <Text style={TEXT_STYLES.caption}>bpm</Text>
              </View>
              
              <View style={styles.metricItem}>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.vo2max }]}>
                  VO2 Max
                </Text>
                <Text style={[TEXT_STYLES.h3, { color: COLORS.vo2max }]}>
                  {client.vo2Max}
                </Text>
                <Text style={TEXT_STYLES.caption}>ml/kg/min</Text>
              </View>
              
              <View style={styles.metricItem}>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.warning }]}>
                  HRV
                </Text>
                <Text style={[TEXT_STYLES.h3, { color: COLORS.warning }]}>
                  {client.hrVariability}
                </Text>
                <Text style={TEXT_STYLES.caption}>ms</Text>
              </View>
            </View>

            <View style={styles.progressSection}>
              <View style={styles.progressRow}>
                <Text style={TEXT_STYLES.caption}>Weekly Zone 2 Target</Text>
                <Text style={[TEXT_STYLES.caption, { fontWeight: 'bold' }]}>
                  {client.zone2Time}%
                </Text>
              </View>
              <ProgressBar
                progress={client.zone2Time / 100}
                color={COLORS.info}
                style={styles.progressBar}
              />
            </View>

            <View style={styles.recoverySection}>
              <View style={styles.recoveryItem}>
                <Icon name="restore" size={20} color={COLORS.success} />
                <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs }]}>
                  Recovery Score: {client.recoveryScore}/100
                </Text>
              </View>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                Last workout: {client.lastWorkout}
              </Text>
            </View>
          </Card.Content>
        </TouchableOpacity>
      </Card>
    );
  };

  const renderMetricChart = () => {
    const metric = cardioMetrics[selectedMetric];
    
    if (selectedMetric === 'zones') {
      return (
        <Card style={styles.chartCard} elevation={4}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.chartHeader}
          >
            <Text style={[TEXT_STYLES.h3, { color: COLORS.white }]}>
              💫 {metric.title}
            </Text>
            <Icon name={metric.icon} size={24} color={COLORS.white} />
          </LinearGradient>
          
          <Card.Content style={styles.chartContent}>
            <PieChart
              data={metric.data}
              width={screenWidth - 60}
              height={200}
              chartConfig={chartConfig}
              accessor="percentage"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
            <View style={styles.zonesLegend}>
              {heartRateZones.map((zone, index) => (
                <View key={index} style={styles.zoneItem}>
                  <View style={[styles.zoneColor, { backgroundColor: zone.color }]} />
                  <View style={styles.zoneInfo}>
                    <Text style={[TEXT_STYLES.caption, { fontWeight: 'bold' }]}>
                      {zone.name} ({zone.range})
                    </Text>
                    <Text style={TEXT_STYLES.caption}>
                      {zone.description}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>
      );
    }

    return (
      <Card style={styles.chartCard} elevation={4}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.chartHeader}
        >
          <Text style={[TEXT_STYLES.h3, { color: COLORS.white }]}>
            ❤️ {metric.title}
          </Text>
          <Icon name={metric.icon} size={24} color={COLORS.white} />
        </LinearGradient>
        
        <Card.Content style={styles.chartContent}>
          <AreaChart
            data={metric.data}
            width={screenWidth - 60}
            height={200}
            chartConfig={{
              ...chartConfig,
              color: metric.color ? 
                (opacity = 1) => `${metric.color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}` :
                chartConfig.color,
            }}
            bezier
            style={styles.chart}
            withDots
            withInnerLines={false}
            withOuterLines={false}
            withVerticalLabels
            withHorizontalLabels
          />
        </Card.Content>
      </Card>
    );
  };

  const renderStatsOverview = () => (
    <Card style={styles.statsCard} elevation={3}>
      <LinearGradient
        colors={['#E91E63', '#AD1457']}
        style={styles.statsHeader}
      >
        <View style={styles.statsHeaderContent}>
          <Text style={[TEXT_STYLES.h3, { color: COLORS.white }]}>
            ❤️ Cardio Analytics Dashboard
          </Text>
          <Animated.View style={{ transform: [{ scale: pulseAnimation }] }}>
            <Icon name="favorite" size={32} color={COLORS.white} />
          </Animated.View>
        </View>
      </LinearGradient>
      
      <Card.Content style={styles.statsContent}>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Icon name="people" size={28} color={COLORS.primary} />
            <Text style={[TEXT_STYLES.h2, { color: COLORS.text }]}>
              {mockClients.length}
            </Text>
            <Text style={TEXT_STYLES.caption}>Active Athletes</Text>
          </View>
          
          <View style={styles.statItem}>
            <Icon name="trending-up" size={28} color={COLORS.success} />
            <Text style={[TEXT_STYLES.h2, { color: COLORS.text }]}>
              {Math.round(mockClients.reduce((acc, client) => acc + client.vo2Max, 0) / mockClients.length)}
            </Text>
            <Text style={TEXT_STYLES.caption}>Avg VO2 Max</Text>
          </View>
          
          <View style={styles.statItem}>
            <Icon name="schedule" size={28} color={COLORS.info} />
            <Text style={[TEXT_STYLES.h2, { color: COLORS.text }]}>
              {Math.round(mockClients.reduce((acc, client) => acc + client.weeklyMinutes, 0) / mockClients.length)}
            </Text>
            <Text style={TEXT_STYLES.caption}>Avg Weekly Min</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      <LinearGradient
        colors={['#E91E63', '#AD1457']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={[TEXT_STYLES.h1, { color: COLORS.white }]}>
            💓 Cardio Analysis
          </Text>
          <Text style={[TEXT_STYLES.body, { color: COLORS.white, opacity: 0.9 }]}>
            Advanced cardiovascular performance tracking
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.cardio]}
            tintColor={COLORS.cardio}
          />
        }
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: animatedValue,
              transform: [
                {
                  translateY: animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Search Bar */}
          <Surface style={styles.searchContainer} elevation={2}>
            <Searchbar
              placeholder="Search athletes..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchbar}
              iconColor={COLORS.cardio}
            />
          </Surface>

          {/* Stats Overview */}
          {renderStatsOverview()}

          {/* Period Selection */}
          <Card style={styles.periodSelector} elevation={2}>
            <Card.Content>
              <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
                📊 Analysis Period
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipContainer}>
                  {['week', 'month', 'quarter', 'year'].map((period) => (
                    <Chip
                      key={period}
                      selected={selectedPeriod === period}
                      onPress={() => setSelectedPeriod(period)}
                      style={[
                        styles.periodChip,
                        selectedPeriod === period && { backgroundColor: COLORS.cardio }
                      ]}
                      textStyle={selectedPeriod === period && { color: COLORS.white }}
                    >
                      {period.charAt(0).toUpperCase() + period.slice(1)}
                    </Chip>
                  ))}
                </View>
              </ScrollView>
            </Card.Content>
          </Card>

          {/* Metric Selection */}
          <Card style={styles.metricSelector} elevation={2}>
            <Card.Content>
              <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
                💪 Cardio Metrics
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipContainer}>
                  {Object.keys(cardioMetrics).map((metric) => (
                    <Chip
                      key={metric}
                      selected={selectedMetric === metric}
                      onPress={() => setSelectedMetric(metric)}
                      style={[
                        styles.metricChip,
                        selectedMetric === metric && { backgroundColor: cardioMetrics[metric].color }
                      ]}
                      textStyle={selectedMetric === metric && { color: COLORS.white }}
                      icon={() => <Icon name={cardioMetrics[metric].icon} size={16} color={
                        selectedMetric === metric ? COLORS.white : cardioMetrics[metric].color
                      } />}
                    >
                      {cardioMetrics[metric].title}
                    </Chip>
                  ))}
                </View>
              </ScrollView>
            </Card.Content>
          </Card>

          {/* Chart */}
          {renderMetricChart()}

          {/* Client List */}
          <View style={styles.clientSection}>
            <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
              🏃‍♂️ Your Athletes ({filteredClients.length})
            </Text>
            {filteredClients.map(renderClientCard)}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Detail Modal */}
      <Portal>
        <Modal
          visible={detailModalVisible}
          onDismiss={() => setDetailModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card elevation={8}>
            <Card.Content>
              <View style={styles.modalHeader}>
                <Text style={TEXT_STYLES.h3}>❤️ Detailed Cardio Analysis</Text>
                <IconButton
                  icon="close"
                  onPress={() => setDetailModalVisible(false)}
                />
              </View>
              {selectedClient && (
                <>
                  <Text style={[TEXT_STYLES.h3, { color: COLORS.cardio, marginBottom: SPACING.sm }]}>
                    {selectedClient.name}
                  </Text>
                  <Text style={TEXT_STYLES.body}>
                    Comprehensive cardio analysis with AI-powered insights coming soon! 🚀
                  </Text>
                  <Text style={[TEXT_STYLES.caption, { marginTop: SPACING.sm }]}>
                    This will include detailed heart rate variability analysis, recovery recommendations, and personalized training zone optimization.
                  </Text>
                </>
              )}
            </Card.Content>
          </Card>
        </Modal>
      </Portal>

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={[styles.fab, { backgroundColor: COLORS.cardio }]}
        onPress={() => Alert.alert('New Assessment', 'Cardio assessment feature coming soon! 🏃‍♂️')}
        color={COLORS.white}
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
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    alignItems: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
  },
  searchContainer: {
    marginBottom: SPACING.md,
    borderRadius: 12,
  },
  searchbar: {
    elevation: 0,
    backgroundColor: 'transparent',
  },
  statsCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    overflow: 'hidden',
  },
  statsHeader: {
    padding: SPACING.md,
  },
  statsHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsContent: {
    padding: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  periodSelector: {
    marginBottom: SPACING.md,
    borderRadius: 12,
  },
  metricSelector: {
    marginBottom: SPACING.md,
    borderRadius: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  periodChip: {
    marginRight: SPACING.sm,
  },
  metricChip: {
    marginRight: SPACING.sm,
  },
  chartCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    overflow: 'hidden',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
  },
  chartContent: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  chart: {
    borderRadius: 8,
  },
  zonesLegend: {
    marginTop: SPACING.md,
    width: '100%',
  },
  zoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  zoneColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: SPACING.sm,
  },
  zoneInfo: {
    flex: 1,
  },
  clientSection: {
    marginTop: SPACING.md,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
    color: COLORS.text,
  },
  clientCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
  },
  clientCardContent: {
    padding: SPACING.md,
  },
  clientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatarContainer: {
    position: 'relative',
  },
  sportBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
  },
  clientInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  improvementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  heartIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  metricItem: {
    alignItems: 'center',
  },
  progressSection: {
    marginBottom: SPACING.md,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  recoverySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recoveryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalContainer: {
    margin: SPACING.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
  },
});

export default CardioAnalysis;