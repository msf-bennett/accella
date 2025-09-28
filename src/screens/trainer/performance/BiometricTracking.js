import React, { useState, useEffect, useCallback } from 'react';
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
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LineChart, BarChart } from 'react-native-chart-kit';

// Constants (these would typically be imported from your constants file)
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f5f5',
  white: '#FFFFFF',
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
  h3: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16 },
  caption: { fontSize: 12, color: COLORS.textSecondary },
};

const { width: screenWidth } = Dimensions.get('window');

const PerformanceTracking = ({ navigation }) => {
  // Redux state
  const dispatch = useDispatch();
  const { user, clients, performanceData } = useSelector(state => ({
    user: state.auth.user,
    clients: state.clients.list,
    performanceData: state.performance.data,
  }));

  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('strength');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [animatedValue] = useState(new Animated.Value(0));

  // Mock data for demonstration
  const [mockClients] = useState([
    {
      id: '1',
      name: 'John Smith',
      avatar: null,
      sport: 'Football',
      level: 'Intermediate',
      streak: 12,
      completionRate: 85,
      lastSession: '2 hours ago',
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      avatar: null,
      sport: 'Basketball',
      level: 'Advanced',
      streak: 8,
      completionRate: 92,
      lastSession: '1 day ago',
    },
    {
      id: '3',
      name: 'Mike Davis',
      avatar: null,
      sport: 'Soccer',
      level: 'Beginner',
      streak: 5,
      completionRate: 78,
      lastSession: '3 hours ago',
    },
  ]);

  const [performanceMetrics] = useState({
    strength: {
      title: 'Strength Progress',
      data: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
        datasets: [
          {
            data: [65, 72, 78, 85, 88, 92],
            strokeWidth: 3,
          },
        ],
      },
      improvement: '+15%',
      color: COLORS.success,
    },
    endurance: {
      title: 'Endurance Tracking',
      data: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
        datasets: [
          {
            data: [45, 52, 58, 65, 70, 75],
            strokeWidth: 3,
          },
        ],
      },
      improvement: '+25%',
      color: COLORS.primary,
    },
    speed: {
      title: 'Speed Development',
      data: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
        datasets: [
          {
            data: [8.2, 7.9, 7.6, 7.3, 7.1, 6.8],
            strokeWidth: 3,
          },
        ],
      },
      improvement: '-17%',
      color: COLORS.warning,
    },
  });

  // Animation effect
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  // Refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
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
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 1,
  };

  const renderClientCard = (client) => (
    <Card key={client.id} style={styles.clientCard} elevation={3}>
      <TouchableOpacity
        onPress={() => setSelectedClient(client)}
        activeOpacity={0.7}
      >
        <Card.Content style={styles.clientCardContent}>
          <View style={styles.clientHeader}>
            <Avatar.Text
              size={50}
              label={client.name.split(' ').map(n => n[0]).join('')}
              style={{ backgroundColor: COLORS.primary }}
            />
            <View style={styles.clientInfo}>
              <Text style={[TEXT_STYLES.h3, { color: COLORS.text }]}>
                {client.name}
              </Text>
              <Text style={TEXT_STYLES.caption}>
                {client.sport} • {client.level}
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.success }]}>
                Last session: {client.lastSession}
              </Text>
            </View>
            <View style={styles.streakBadge}>
              <Icon name="local-fire-department" size={20} color={COLORS.warning} />
              <Text style={[TEXT_STYLES.caption, { fontWeight: 'bold' }]}>
                {client.streak}
              </Text>
            </View>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressItem}>
              <Text style={TEXT_STYLES.caption}>Completion Rate</Text>
              <ProgressBar
                progress={client.completionRate / 100}
                color={COLORS.success}
                style={styles.progressBar}
              />
              <Text style={[TEXT_STYLES.caption, { fontWeight: 'bold' }]}>
                {client.completionRate}%
              </Text>
            </View>
          </View>

          <View style={styles.quickActions}>
            <Chip
              icon="analytics"
              mode="outlined"
              compact
              onPress={() => setModalVisible(true)}
              style={styles.actionChip}
            >
              View Analytics
            </Chip>
            <Chip
              icon="note-add"
              mode="outlined"
              compact
              onPress={() => Alert.alert('Add Note', 'Feature coming soon! 📝')}
              style={styles.actionChip}
            >
              Add Note
            </Chip>
          </View>
        </Card.Content>
      </TouchableOpacity>
    </Card>
  );

  const renderMetricChart = () => {
    const metric = performanceMetrics[selectedMetric];
    return (
      <Card style={styles.chartCard} elevation={4}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.chartHeader}
        >
          <Text style={[TEXT_STYLES.h3, { color: COLORS.white }]}>
            {metric.title}
          </Text>
          <View style={styles.improvementBadge}>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.white }]}>
              {metric.improvement}
            </Text>
            <Icon 
              name={metric.improvement.includes('+') ? "trending-up" : "trending-down"} 
              size={16} 
              color={COLORS.white} 
            />
          </View>
        </LinearGradient>
        
        <Card.Content style={styles.chartContent}>
          <LineChart
            data={metric.data}
            width={screenWidth - 60}
            height={200}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => `${metric.color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
            }}
            bezier
            style={styles.chart}
            withDots
            withInnerLines
            withOuterLines
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
        colors={['#667eea', '#764ba2']}
        style={styles.statsHeader}
      >
        <Text style={[TEXT_STYLES.h3, { color: COLORS.white }]}>
          📊 Performance Overview
        </Text>
      </LinearGradient>
      
      <Card.Content style={styles.statsContent}>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Icon name="people" size={24} color={COLORS.primary} />
            <Text style={[TEXT_STYLES.h2, { color: COLORS.text }]}>
              {mockClients.length}
            </Text>
            <Text style={TEXT_STYLES.caption}>Active Clients</Text>
          </View>
          
          <View style={styles.statItem}>
            <Icon name="trending-up" size={24} color={COLORS.success} />
            <Text style={[TEXT_STYLES.h2, { color: COLORS.text }]}>
              87%
            </Text>
            <Text style={TEXT_STYLES.caption}>Avg Progress</Text>
          </View>
          
          <View style={styles.statItem}>
            <Icon name="star" size={24} color={COLORS.warning} />
            <Text style={[TEXT_STYLES.h2, { color: COLORS.text }]}>
              4.8
            </Text>
            <Text style={TEXT_STYLES.caption}>Rating</Text>
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
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={[TEXT_STYLES.h1, { color: COLORS.white }]}>
            📈 Performance Tracking
          </Text>
          <Text style={[TEXT_STYLES.body, { color: COLORS.white, opacity: 0.9 }]}>
            Monitor your clients' progress and achievements
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
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
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
              placeholder="Search clients..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchbar}
              iconColor={COLORS.primary}
            />
          </Surface>

          {/* Stats Overview */}
          {renderStatsOverview()}

          {/* Metric Selection */}
          <Card style={styles.metricSelector} elevation={2}>
            <Card.Content>
              <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
                Performance Metrics
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipContainer}>
                  {Object.keys(performanceMetrics).map((metric) => (
                    <Chip
                      key={metric}
                      selected={selectedMetric === metric}
                      onPress={() => setSelectedMetric(metric)}
                      style={[
                        styles.metricChip,
                        selectedMetric === metric && styles.selectedChip
                      ]}
                      textStyle={selectedMetric === metric && { color: COLORS.white }}
                    >
                      {performanceMetrics[metric].title}
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
              👥 Your Clients ({filteredClients.length})
            </Text>
            {filteredClients.map(renderClientCard)}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Analytics Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card elevation={8}>
            <Card.Content>
              <View style={styles.modalHeader}>
                <Text style={TEXT_STYLES.h3}>📊 Detailed Analytics</Text>
                <IconButton
                  icon="close"
                  onPress={() => setModalVisible(false)}
                />
              </View>
              <Text style={TEXT_STYLES.body}>
                Advanced analytics features coming soon! 🚀
              </Text>
              <Text style={[TEXT_STYLES.caption, { marginTop: SPACING.sm }]}>
                This will include detailed performance breakdowns, comparison charts, and predictive insights.
              </Text>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => Alert.alert('Add Assessment', 'Performance assessment feature coming soon! 📋')}
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
  metricSelector: {
    marginBottom: SPACING.md,
    borderRadius: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  metricChip: {
    marginRight: SPACING.sm,
  },
  selectedChip: {
    backgroundColor: COLORS.primary,
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
  improvementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  chartContent: {
    alignItems: 'center',
  },
  chart: {
    borderRadius: 8,
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
  clientInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  streakBadge: {
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 20,
    padding: SPACING.sm,
  },
  progressSection: {
    marginBottom: SPACING.md,
  },
  progressItem: {
    marginBottom: SPACING.sm,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginVertical: SPACING.xs,
  },
  quickActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionChip: {
    flex: 1,
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
    backgroundColor: COLORS.primary,
  },
});

export default PerformanceTracking;