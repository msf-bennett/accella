import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  RefreshControl,
  StatusBar,
  Alert,
  Dimensions,
  TouchableOpacity,
  Animated,
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
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

// Design System Imports
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#f44336',
  warning: '#ff9800',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  accent: '#e91e63',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  h3: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 14, color: COLORS.text },
  caption: { fontSize: 12, color: COLORS.textSecondary },
};

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const DataVisualization = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user, clients, performanceData, isLoading } = useSelector(state => state.trainer);
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const animatedValue = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Load performance data
    loadPerformanceData();
  }, [selectedTimeframe, selectedClient]);

  const loadPerformanceData = useCallback(async () => {
    try {
      // Simulate API call - replace with actual data loading
      // dispatch(fetchPerformanceData({ timeframe: selectedTimeframe, clientId: selectedClient }));
      console.log('Loading performance data...');
    } catch (error) {
      Alert.alert('Error', 'Failed to load performance data');
    }
  }, [selectedTimeframe, selectedClient, dispatch]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPerformanceData();
    setRefreshing(false);
  }, [loadPerformanceData]);

  // Mock data for demonstration
  const mockPerformanceData = {
    clientProgress: [
      { name: 'Jan', strength: 75, endurance: 65, flexibility: 80 },
      { name: 'Feb', strength: 78, endurance: 70, flexibility: 82 },
      { name: 'Mar', strength: 82, endurance: 75, flexibility: 85 },
      { name: 'Apr', strength: 85, endurance: 80, flexibility: 87 },
      { name: 'May', strength: 88, endurance: 85, flexibility: 90 },
      { name: 'Jun', strength: 92, endurance: 88, flexibility: 92 },
    ],
    clientDistribution: [
      { name: 'Beginner', population: 35, color: COLORS.primary, legendFontColor: COLORS.text },
      { name: 'Intermediate', population: 45, color: COLORS.secondary, legendFontColor: COLORS.text },
      { name: 'Advanced', population: 20, color: COLORS.success, legendFontColor: COLORS.text },
    ],
    sessionCompletion: {
      completed: 85,
      missed: 10,
      postponed: 5,
    },
  };

  const chartConfig = {
    backgroundGradientFrom: COLORS.surface,
    backgroundGradientTo: COLORS.surface,
    color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={styles.header}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.headerContent}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Performance Analytics</Text>
            <Text style={styles.headerSubtitle}>📊 Data-driven insights</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => setShowFilters(true)}
          style={styles.filterButton}
        >
          <Icon name="filter-list" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  const renderOverviewCards = () => (
    <View style={styles.overviewContainer}>
      <View style={styles.overviewRow}>
        <Surface style={[styles.overviewCard, { backgroundColor: COLORS.success }]}>
          <Icon name="trending-up" size={28} color="white" />
          <Text style={styles.overviewNumber}>92%</Text>
          <Text style={styles.overviewLabel}>Avg Progress</Text>
        </Surface>
        <Surface style={[styles.overviewCard, { backgroundColor: COLORS.primary }]}>
          <Icon name="people" size={28} color="white" />
          <Text style={styles.overviewNumber}>45</Text>
          <Text style={styles.overviewLabel}>Active Clients</Text>
        </Surface>
      </View>
      <View style={styles.overviewRow}>
        <Surface style={[styles.overviewCard, { backgroundColor: COLORS.accent }]}>
          <Icon name="fitness-center" size={28} color="white" />
          <Text style={styles.overviewNumber}>127</Text>
          <Text style={styles.overviewLabel}>Sessions</Text>
        </Surface>
        <Surface style={[styles.overviewCard, { backgroundColor: COLORS.warning }]}>
          <Icon name="star" size={28} color="white" />
          <Text style={styles.overviewNumber}>4.9</Text>
          <Text style={styles.overviewLabel}>Rating</Text>
        </Surface>
      </View>
    </View>
  );

  const renderProgressChart = () => (
    <Card style={styles.chartCard}>
      <Card.Content>
        <View style={styles.chartHeader}>
          <Text style={TEXT_STYLES.h3}>Client Progress Trends</Text>
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
              <Text style={styles.legendText}>Strength</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.success }]} />
              <Text style={styles.legendText}>Endurance</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.accent }]} />
              <Text style={styles.legendText}>Flexibility</Text>
            </View>
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <LineChart
            data={{
              labels: mockPerformanceData.clientProgress.map(item => item.name),
              datasets: [
                {
                  data: mockPerformanceData.clientProgress.map(item => item.strength),
                  color: () => COLORS.primary,
                  strokeWidth: 2,
                },
                {
                  data: mockPerformanceData.clientProgress.map(item => item.endurance),
                  color: () => COLORS.success,
                  strokeWidth: 2,
                },
                {
                  data: mockPerformanceData.clientProgress.map(item => item.flexibility),
                  color: () => COLORS.accent,
                  strokeWidth: 2,
                },
              ],
            }}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </ScrollView>
      </Card.Content>
    </Card>
  );

  const renderClientDistribution = () => (
    <Card style={styles.chartCard}>
      <Card.Content>
        <Text style={TEXT_STYLES.h3}>Client Level Distribution</Text>
        <View style={styles.pieChartContainer}>
          <PieChart
            data={mockPerformanceData.clientDistribution}
            width={screenWidth - 80}
            height={200}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            center={[10, 0]}
          />
        </View>
      </Card.Content>
    </Card>
  );

  const renderSessionCompletion = () => (
    <Card style={styles.chartCard}>
      <Card.Content>
        <Text style={TEXT_STYLES.h3}>Session Completion Rate</Text>
        <View style={styles.completionContainer}>
          <View style={styles.completionItem}>
            <View style={styles.completionHeader}>
              <Icon name="check-circle" size={20} color={COLORS.success} />
              <Text style={styles.completionLabel}>Completed</Text>
            </View>
            <ProgressBar
              progress={mockPerformanceData.sessionCompletion.completed / 100}
              color={COLORS.success}
              style={styles.progressBar}
            />
            <Text style={styles.completionPercentage}>
              {mockPerformanceData.sessionCompletion.completed}%
            </Text>
          </View>
          
          <View style={styles.completionItem}>
            <View style={styles.completionHeader}>
              <Icon name="cancel" size={20} color={COLORS.error} />
              <Text style={styles.completionLabel}>Missed</Text>
            </View>
            <ProgressBar
              progress={mockPerformanceData.sessionCompletion.missed / 100}
              color={COLORS.error}
              style={styles.progressBar}
            />
            <Text style={styles.completionPercentage}>
              {mockPerformanceData.sessionCompletion.missed}%
            </Text>
          </View>
          
          <View style={styles.completionItem}>
            <View style={styles.completionHeader}>
              <Icon name="schedule" size={20} color={COLORS.warning} />
              <Text style={styles.completionLabel}>Postponed</Text>
            </View>
            <ProgressBar
              progress={mockPerformanceData.sessionCompletion.postponed / 100}
              color={COLORS.warning}
              style={styles.progressBar}
            />
            <Text style={styles.completionPercentage}>
              {mockPerformanceData.sessionCompletion.postponed}%
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderTopPerformers = () => (
    <Card style={styles.chartCard}>
      <Card.Content>
        <View style={styles.topPerformersHeader}>
          <Text style={TEXT_STYLES.h3}>🏆 Top Performers</Text>
          <Chip mode="outlined" compact>This Month</Chip>
        </View>
        <View style={styles.performersList}>
          {[1, 2, 3, 4, 5].map((rank) => (
            <Surface key={rank} style={styles.performerItem}>
              <View style={styles.performerRank}>
                <Text style={styles.rankNumber}>{rank}</Text>
              </View>
              <Avatar.Text
                size={40}
                label={`C${rank}`}
                style={{ backgroundColor: rank <= 3 ? COLORS.primary : COLORS.secondary }}
              />
              <View style={styles.performerInfo}>
                <Text style={TEXT_STYLES.h3}>Client {rank}</Text>
                <Text style={TEXT_STYLES.caption}>
                  {95 - rank * 2}% completion rate • 🔥 {10 - rank} day streak
                </Text>
              </View>
              <View style={styles.performerScore}>
                <Text style={styles.scoreText}>{95 - rank * 2}</Text>
              </View>
            </Surface>
          ))}
        </View>
      </Card.Content>
    </Card>
  );

  const renderFiltersModal = () => (
    <Portal>
      <Modal
        visible={showFilters}
        onDismiss={() => setShowFilters(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Surface style={styles.modalContent}>
          <Text style={TEXT_STYLES.h2}>Filter Analytics</Text>
          
          <Text style={styles.filterLabel}>Timeframe</Text>
          <View style={styles.chipContainer}>
            {['week', 'month', 'quarter', 'year'].map((timeframe) => (
              <Chip
                key={timeframe}
                selected={selectedTimeframe === timeframe}
                onPress={() => setSelectedTimeframe(timeframe)}
                style={styles.filterChip}
              >
                {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
              </Chip>
            ))}
          </View>

          <Text style={styles.filterLabel}>Metrics</Text>
          <View style={styles.chipContainer}>
            {['all', 'strength', 'endurance', 'flexibility', 'weight'].map((metric) => (
              <Chip
                key={metric}
                selected={selectedMetric === metric}
                onPress={() => setSelectedMetric(metric)}
                style={styles.filterChip}
              >
                {metric.charAt(0).toUpperCase() + metric.slice(1)}
              </Chip>
            ))}
          </View>

          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={() => setShowFilters(false)}
              style={styles.modalButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={() => {
                setShowFilters(false);
                loadPerformanceData();
              }}
              style={styles.modalButton}
            >
              Apply Filters
            </Button>
          </View>
        </Surface>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <Animated.ScrollView
        style={[styles.scrollView, { opacity: fadeAnim }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        <Searchbar
          placeholder="Search clients or metrics..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          icon="analytics"
        />

        {renderOverviewCards()}
        {renderProgressChart()}
        {renderSessionCompletion()}
        {renderClientDistribution()}
        {renderTopPerformers()}
        
        <View style={{ height: 100 }} />
      </Animated.ScrollView>

      {renderFiltersModal()}

      <FAB
        style={styles.fab}
        icon="file-export"
        onPress={() => Alert.alert('Export', 'Feature coming soon! 📊')}
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
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: SPACING.md,
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: 'white',
  },
  headerSubtitle: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  filterButton: {
    padding: SPACING.sm,
  },
  scrollView: {
    flex: 1,
  },
  searchbar: {
    margin: SPACING.md,
    elevation: 2,
  },
  overviewContainer: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  overviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  overviewCard: {
    flex: 0.48,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  overviewNumber: {
    ...TEXT_STYLES.h1,
    color: 'white',
    marginVertical: SPACING.xs,
  },
  overviewLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  chartCard: {
    margin: SPACING.md,
    elevation: 2,
    borderRadius: 12,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    flexWrap: 'wrap',
  },
  chartLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  legendText: {
    ...TEXT_STYLES.caption,
  },
  chart: {
    marginVertical: SPACING.sm,
    borderRadius: 8,
  },
  pieChartContainer: {
    alignItems: 'center',
    marginVertical: SPACING.sm,
  },
  completionContainer: {
    marginTop: SPACING.md,
  },
  completionItem: {
    marginBottom: SPACING.md,
  },
  completionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  completionLabel: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.xs,
    flex: 1,
  },
  completionPercentage: {
    ...TEXT_STYLES.caption,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  topPerformersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  performersList: {
    gap: SPACING.sm,
  },
  performerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 8,
    elevation: 1,
  },
  performerRank: {
    width: 24,
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  rankNumber: {
    ...TEXT_STYLES.h3,
    color: COLORS.primary,
  },
  performerInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  performerScore: {
    alignItems: 'center',
  },
  scoreText: {
    ...TEXT_STYLES.h3,
    color: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    padding: SPACING.lg,
    borderRadius: 12,
    maxHeight: screenHeight * 0.8,
  },
  filterLabel: {
    ...TEXT_STYLES.h3,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  filterChip: {
    marginBottom: SPACING.xs,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  modalButton: {
    flex: 0.4,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default DataVisualization;