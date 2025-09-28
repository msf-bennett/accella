import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  Animated,
  Dimensions,
  FlatList,
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
  TextInput,
  Searchbar,
  Divider,
  Badge,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '../../../components/shared/BlurView';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

// Import established design constants
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
  border: '#e0e0e0',
  gradientStart: '#667eea',
  gradientEnd: '#764ba2',
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

const { width } = Dimensions.get('window');
const chartWidth = width - (SPACING.md * 2);

const ClientProgress = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('weight');
  const [timeRange, setTimeRange] = useState('3months');
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showAddRecordModal, setShowAddRecordModal] = useState(false);
  const [newRecord, setNewRecord] = useState({
    metric: 'weight',
    value: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Mock data - replace with Redux selectors
  const [clients, setClients] = useState([
    {
      id: '1',
      name: 'John Smith',
      avatar: 'https://via.placeholder.com/50',
      joinDate: '2024-09-01',
      currentStreak: 15,
      totalSessions: 45,
      completionRate: 92,
      lastActivity: '2024-11-18',
      progressMetrics: {
        weight: {
          current: 75,
          starting: 82,
          goal: 70,
          unit: 'kg',
          trend: 'decreasing',
          change: -7,
          changePercent: -8.5,
        },
        bodyFat: {
          current: 15.2,
          starting: 22.1,
          goal: 12.0,
          unit: '%',
          trend: 'decreasing',
          change: -6.9,
          changePercent: -31.2,
        },
        muscle: {
          current: 42.5,
          starting: 38.2,
          goal: 45.0,
          unit: 'kg',
          trend: 'increasing',
          change: 4.3,
          changePercent: 11.3,
        },
        strength: {
          current: 95,
          starting: 70,
          goal: 100,
          unit: 'kg',
          trend: 'increasing',
          change: 25,
          changePercent: 35.7,
        },
      },
      progressHistory: {
        weight: [
          { date: '2024-09-01', value: 82 },
          { date: '2024-09-15', value: 81.2 },
          { date: '2024-10-01', value: 79.8 },
          { date: '2024-10-15', value: 78.5 },
          { date: '2024-11-01', value: 76.8 },
          { date: '2024-11-15', value: 75.2 },
          { date: '2024-11-18', value: 75.0 },
        ],
        bodyFat: [
          { date: '2024-09-01', value: 22.1 },
          { date: '2024-09-15', value: 21.2 },
          { date: '2024-10-01', value: 19.8 },
          { date: '2024-10-15', value: 18.5 },
          { date: '2024-11-01', value: 16.8 },
          { date: '2024-11-15', value: 15.5 },
          { date: '2024-11-18', value: 15.2 },
        ],
        strength: [
          { date: '2024-09-01', value: 70 },
          { date: '2024-09-15', value: 75 },
          { date: '2024-10-01', value: 82 },
          { date: '2024-10-15', value: 87 },
          { date: '2024-11-01', value: 91 },
          { date: '2024-11-15', value: 94 },
          { date: '2024-11-18', value: 95 },
        ],
      },
      achievements: [
        { id: 'a1', title: 'First 10kg Lost', icon: 'jump-rope', date: '2024-10-15', color: COLORS.warning },
        { id: 'a2', title: '30-Day Streak', icon: 'local-fire-department', date: '2024-10-01', color: COLORS.error },
        { id: 'a3', title: 'Strength Goal 90%', icon: 'fitness-center', date: '2024-11-01', color: COLORS.success },
      ],
      recentActivities: [
        { id: 'r1', type: 'workout', description: 'Upper Body Strength', date: '2024-11-18', duration: '60 min' },
        { id: 'r2', type: 'measurement', description: 'Weight: 75kg (-0.2kg)', date: '2024-11-18', value: 75 },
        { id: 'r3', type: 'workout', description: 'HIIT Cardio', date: '2024-11-16', duration: '45 min' },
      ],
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      avatar: 'https://via.placeholder.com/50',
      joinDate: '2024-10-15',
      currentStreak: 8,
      totalSessions: 22,
      completionRate: 95,
      lastActivity: '2024-11-17',
      progressMetrics: {
        weight: {
          current: 58,
          starting: 55,
          goal: 62,
          unit: 'kg',
          trend: 'increasing',
          change: 3,
          changePercent: 5.5,
        },
        muscle: {
          current: 24.2,
          starting: 22.1,
          goal: 26.0,
          unit: 'kg',
          trend: 'increasing',
          change: 2.1,
          changePercent: 9.5,
        },
      },
      achievements: [
        { id: 'a4', title: 'Consistency Champion', icon: 'stars', date: '2024-11-10', color: COLORS.primary },
      ],
    },
  ]);

  const progressMetrics = [
    { key: 'weight', label: 'Weight', icon: 'monitor-weight', color: COLORS.primary },
    { key: 'bodyFat', label: 'Body Fat %', icon: 'analytics', color: COLORS.error },
    { key: 'muscle', label: 'Muscle Mass', icon: 'fitness-center', color: COLORS.success },
    { key: 'strength', label: 'Strength', icon: 'trending-up', color: COLORS.warning },
    { key: 'cardio', label: 'Cardio', icon: 'favorite', color: COLORS.secondary },
  ];

  const timeRanges = [
    { key: '1month', label: '1M', days: 30 },
    { key: '3months', label: '3M', days: 90 },
    { key: '6months', label: '6M', days: 180 },
    { key: '1year', label: '1Y', days: 365 },
  ];

  // Animation effects
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
      }),
    ]).start();
  }, []);

  // Refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('Success', 'Progress data refreshed! 📊');
    }, 1500);
  }, []);

  // Filter clients based on search
  const getFilteredClients = useCallback(() => {
    if (!searchQuery) return clients;
    
    return clients.filter(client => 
      client.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [clients, searchQuery]);

  // Get chart data for selected metric
  const getChartData = useCallback((client, metric) => {
    const history = client.progressHistory[metric];
    if (!history || history.length === 0) return null;

    const labels = history.map(item => {
      const date = new Date(item.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });

    const data = history.map(item => item.value);

    return {
      labels,
      datasets: [{
        data,
        color: (opacity = 1) => progressMetrics.find(m => m.key === metric)?.color || COLORS.primary,
        strokeWidth: 3,
      }]
    };
  }, []);

  // Handle add progress record
  const handleAddRecord = () => {
    if (!newRecord.value.trim()) {
      Alert.alert('Error', 'Please enter a value');
      return;
    }

    Alert.alert('Feature Development', 'Progress recording feature is coming soon! 📈', [
      { text: 'OK', style: 'default' }
    ]);

    setShowAddRecordModal(false);
    setNewRecord({
      metric: 'weight',
      value: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };

  // Render client progress card
  const renderClientCard = ({ item: client }) => (
    <Animated.View
      style={[
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        { marginBottom: SPACING.md }
      ]}
    >
      <Card style={styles.clientCard} elevation={3}>
        <TouchableOpacity onPress={() => setSelectedClient(client)}>
          <LinearGradient
            colors={[COLORS.gradientStart, COLORS.gradientEnd]}
            style={styles.cardHeader}
          >
            <View style={styles.cardHeaderContent}>
              <Avatar.Image source={{ uri: client.avatar }} size={50} />
              <View style={styles.headerText}>
                <Text style={styles.clientName}>{client.name}</Text>
                <Text style={styles.joinDate}>
                  Training since {new Date(client.joinDate).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.streakBadge}>
                <Icon name="local-fire-department" size={16} color={COLORS.error} />
                <Text style={styles.streakText}>{client.currentStreak}</Text>
              </View>
            </View>
          </LinearGradient>

          <Card.Content style={styles.cardContent}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{client.totalSessions}</Text>
                <Text style={styles.statLabel}>Sessions</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{client.completionRate}%</Text>
                <Text style={styles.statLabel}>Completion</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {client.achievements?.length || 0}
                </Text>
                <Text style={styles.statLabel}>Achievements</Text>
              </View>
            </View>

            <Divider style={styles.divider} />

            {/* Progress Metrics Preview */}
            <View style={styles.metricsPreview}>
              {Object.entries(client.progressMetrics).slice(0, 3).map(([key, metric]) => (
                <View key={key} style={styles.metricPreview}>
                  <View style={styles.metricHeader}>
                    <Icon 
                      name={progressMetrics.find(m => m.key === key)?.icon || 'trending-up'} 
                      size={16} 
                      color={progressMetrics.find(m => m.key === key)?.color || COLORS.primary} 
                    />
                    <Text style={styles.metricLabel}>
                      {progressMetrics.find(m => m.key === key)?.label || key}
                    </Text>
                  </View>
                  <View style={styles.metricValues}>
                    <Text style={styles.metricCurrent}>
                      {metric.current}{metric.unit}
                    </Text>
                    <Text style={[
                      styles.metricChange,
                      { color: metric.trend === 'increasing' ? COLORS.success : COLORS.primary }
                    ]}>
                      {metric.change > 0 ? '+' : ''}{metric.change}{metric.unit}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Recent Activity */}
            <View style={styles.recentActivity}>
              <Text style={styles.activityTitle}>Recent Activity</Text>
              <Text style={styles.activityText}>
                Last session: {new Date(client.lastActivity).toLocaleDateString()}
              </Text>
            </View>
          </Card.Content>
        </TouchableOpacity>
      </Card>
    </Animated.View>
  );

  // Render overview stats
  const renderOverviewStats = () => {
    const totalClients = clients.length;
    const activeClients = clients.filter(c => {
      const lastActivity = new Date(c.lastActivity);
      const daysSinceActivity = (new Date() - lastActivity) / (1000 * 60 * 60 * 24);
      return daysSinceActivity <= 7;
    }).length;
    
    const avgCompletionRate = Math.round(
      clients.reduce((sum, c) => sum + c.completionRate, 0) / totalClients
    );
    
    const totalSessions = clients.reduce((sum, c) => sum + c.totalSessions, 0);

    return (
      <Surface style={styles.statsContainer} elevation={2}>
        <LinearGradient
          colors={[COLORS.gradientStart, COLORS.gradientEnd]}
          style={styles.statsGradient}
        >
          <Text style={styles.statsTitle}>Progress Overview 📈</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalClients}</Text>
              <Text style={styles.statLabel}>Total Clients</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{activeClients}</Text>
              <Text style={styles.statLabel}>Active This Week</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{avgCompletionRate}%</Text>
              <Text style={styles.statLabel}>Avg Completion</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalSessions}</Text>
              <Text style={styles.statLabel}>Total Sessions</Text>
            </View>
          </View>
        </LinearGradient>
      </Surface>
    );
  };

  // Render detailed progress modal
  const renderProgressModal = () => (
    <Portal>
      <Modal
        visible={showProgressModal && selectedClient}
        onDismiss={() => setShowProgressModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.modalBlur} blurType="light" blurAmount={10}>
          <Surface style={styles.modalContent} elevation={8}>
            <LinearGradient
              colors={[COLORS.gradientStart, COLORS.gradientEnd]}
              style={styles.modalHeader}
            >
              <View style={styles.modalHeaderContent}>
                <Avatar.Image 
                  source={{ uri: selectedClient?.avatar }} 
                  size={40} 
                />
                <View style={styles.modalHeaderText}>
                  <Text style={styles.modalTitle}>{selectedClient?.name}</Text>
                  <Text style={styles.modalSubtitle}>Progress Details</Text>
                </View>
                <IconButton
                  icon="close"
                  iconColor={COLORS.white}
                  onPress={() => setShowProgressModal(false)}
                />
              </View>
            </LinearGradient>

            <ScrollView style={styles.modalForm}>
              {/* Metric Selection */}
              <View style={styles.metricSelection}>
                <Text style={styles.sectionLabel}>Select Metric</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.metricChips}>
                    {progressMetrics.filter(metric => 
                      selectedClient?.progressMetrics[metric.key]
                    ).map((metric) => (
                      <Chip
                        key={metric.key}
                        selected={selectedMetric === metric.key}
                        onPress={() => setSelectedMetric(metric.key)}
                        style={[
                          styles.metricChip,
                          selectedMetric === metric.key && { backgroundColor: metric.color }
                        ]}
                        textStyle={[
                          styles.metricChipText,
                          selectedMetric === metric.key && { color: COLORS.white }
                        ]}
                        icon={metric.icon}
                      >
                        {metric.label}
                      </Chip>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Time Range Selection */}
              <View style={styles.timeRangeSelection}>
                <Text style={styles.sectionLabel}>Time Range</Text>
                <View style={styles.timeRangeChips}>
                  {timeRanges.map((range) => (
                    <Chip
                      key={range.key}
                      selected={timeRange === range.key}
                      onPress={() => setTimeRange(range.key)}
                      style={[
                        styles.timeChip,
                        timeRange === range.key && { backgroundColor: COLORS.primary }
                      ]}
                      textStyle={[
                        styles.timeChipText,
                        timeRange === range.key && { color: COLORS.white }
                      ]}
                    >
                      {range.label}
                    </Chip>
                  ))}
                </View>
              </View>

              {/* Progress Chart */}
              {selectedClient && selectedClient.progressHistory[selectedMetric] && (
                <View style={styles.chartContainer}>
                  <Text style={styles.sectionLabel}>Progress Chart</Text>
                  <Surface style={styles.chartSurface} elevation={2}>
                    <LineChart
                      data={getChartData(selectedClient, selectedMetric)}
                      width={chartWidth - 40}
                      height={220}
                      chartConfig={{
                        backgroundColor: COLORS.white,
                        backgroundGradientFrom: COLORS.white,
                        backgroundGradientTo: COLORS.white,
                        decimalPlaces: 1,
                        color: (opacity = 1) => progressMetrics.find(m => m.key === selectedMetric)?.color || COLORS.primary,
                        labelColor: (opacity = 1) => COLORS.textSecondary,
                        style: {
                          borderRadius: 16,
                        },
                        propsForDots: {
                          r: "4",
                          strokeWidth: "2",
                          stroke: progressMetrics.find(m => m.key === selectedMetric)?.color || COLORS.primary,
                        },
                      }}
                      bezier
                      style={styles.chart}
                    />
                  </Surface>
                </View>
              )}

              {/* Current Metrics */}
              {selectedClient?.progressMetrics[selectedMetric] && (
                <View style={styles.currentMetrics}>
                  <Text style={styles.sectionLabel}>Current Status</Text>
                  <Surface style={styles.metricsCard} elevation={1}>
                    <View style={styles.metricRow}>
                      <Text style={styles.metricRowLabel}>Current</Text>
                      <Text style={styles.metricRowValue}>
                        {selectedClient.progressMetrics[selectedMetric].current}
                        {selectedClient.progressMetrics[selectedMetric].unit}
                      </Text>
                    </View>
                    <View style={styles.metricRow}>
                      <Text style={styles.metricRowLabel}>Starting</Text>
                      <Text style={styles.metricRowValue}>
                        {selectedClient.progressMetrics[selectedMetric].starting}
                        {selectedClient.progressMetrics[selectedMetric].unit}
                      </Text>
                    </View>
                    <View style={styles.metricRow}>
                      <Text style={styles.metricRowLabel}>Goal</Text>
                      <Text style={styles.metricRowValue}>
                        {selectedClient.progressMetrics[selectedMetric].goal}
                        {selectedClient.progressMetrics[selectedMetric].unit}
                      </Text>
                    </View>
                    <Divider style={styles.metricDivider} />
                    <View style={styles.metricRow}>
                      <Text style={styles.metricRowLabel}>Total Change</Text>
                      <Text style={[
                        styles.metricRowValue,
                        { color: selectedClient.progressMetrics[selectedMetric].change > 0 ? COLORS.success : COLORS.primary }
                      ]}>
                        {selectedClient.progressMetrics[selectedMetric].change > 0 ? '+' : ''}
                        {selectedClient.progressMetrics[selectedMetric].change}
                        {selectedClient.progressMetrics[selectedMetric].unit}
                        ({selectedClient.progressMetrics[selectedMetric].changePercent}%)
                      </Text>
                    </View>
                  </Surface>
                </View>
              )}

              {/* Achievements */}
              {selectedClient?.achievements && selectedClient.achievements.length > 0 && (
                <View style={styles.achievementsSection}>
                  <Text style={styles.sectionLabel}>Recent Achievements 🏆</Text>
                  {selectedClient.achievements.map((achievement) => (
                    <Surface key={achievement.id} style={styles.achievementCard} elevation={1}>
                      <View style={styles.achievementContent}>
                        <Icon 
                          name={achievement.icon} 
                          size={24} 
                          color={achievement.color} 
                        />
                        <View style={styles.achievementText}>
                          <Text style={styles.achievementTitle}>{achievement.title}</Text>
                          <Text style={styles.achievementDate}>
                            {new Date(achievement.date).toLocaleDateString()}
                          </Text>
                        </View>
                      </View>
                    </Surface>
                  ))}
                </View>
              )}
            </ScrollView>
          </Surface>
        </BlurView>
      </Modal>
    </Portal>
  );

  // Render add record modal
  const renderAddRecordModal = () => (
    <Portal>
      <Modal
        visible={showAddRecordModal}
        onDismiss={() => setShowAddRecordModal(false)}
        contentContainerStyle={styles.addRecordModalContainer}
      >
        <BlurView style={styles.modalBlur} blurType="light" blurAmount={10}>
          <Surface style={styles.addRecordContent} elevation={8}>
            <View style={styles.addRecordHeader}>
              <Text style={styles.addRecordTitle}>Add Progress Record 📊</Text>
              <IconButton
                icon="close"
                onPress={() => setShowAddRecordModal(false)}
              />
            </View>

            <ScrollView style={styles.addRecordForm}>
              <View style={styles.formSection}>
                <Text style={styles.sectionLabel}>Metric Type</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.metricChips}>
                    {progressMetrics.map((metric) => (
                      <Chip
                        key={metric.key}
                        selected={newRecord.metric === metric.key}
                        onPress={() => setNewRecord(prev => ({ ...prev, metric: metric.key }))}
                        style={[
                          styles.metricChip,
                          newRecord.metric === metric.key && { backgroundColor: metric.color }
                        ]}
                        textStyle={[
                          styles.metricChipText,
                          newRecord.metric === metric.key && { color: COLORS.white }
                        ]}
                        icon={metric.icon}
                      >
                        {metric.label}
                      </Chip>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <TextInput
                label="Value *"
                value={newRecord.value}
                onChangeText={(text) => setNewRecord(prev => ({ ...prev, value: text }))}
                mode="outlined"
                keyboardType="numeric"
                style={styles.formInput}
                left={<TextInput.Icon icon="trending-up" />}
              />

              <TextInput
                label="Date"
                value={newRecord.date}
                onChangeText={(text) => setNewRecord(prev => ({ ...prev, date: text }))}
                mode="outlined"
                style={styles.formInput}
                left={<TextInput.Icon icon="calendar-today" />}
              />

              <TextInput
                label="Notes (Optional)"
                value={newRecord.notes}
                onChangeText={(text) => setNewRecord(prev => ({ ...prev, notes: text }))}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={styles.formInput}
                left={<TextInput.Icon icon="note" />}
              />
            </ScrollView>

            <View style={styles.addRecordActions}>
              <Button
                mode="outlined"
                onPress={() => setShowAddRecordModal(false)}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleAddRecord}
                style={styles.modalButton}
                buttonColor={COLORS.primary}
                icon="add"
              >
                Add Record
              </Button>
            </View>
          </Surface>
        </BlurView>
      </Modal>
    </Portal>
  );

  const filteredClients = getFilteredClients();

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" translucent />
      
      <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Client Progress</Text>
          <IconButton
            icon="analytics"
            iconColor={COLORS.white}
            onPress={() => Alert.alert('Feature Development', 'Advanced analytics coming soon! 📊')}
          />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {renderOverviewStats()}

        <View style={styles.searchSection}>
          <Searchbar
            placeholder="Search clients..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor={COLORS.primary}
            inputStyle={styles.searchInput}
          />
        </View>

        <View style={styles.clientsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Client Progress ({filteredClients.length})
            </Text>
            <Button
              mode="outlined"
              onPress={() => setShowAddRecordModal(true)}
              icon="add"
              compact
            >
              Add Record
            </Button>
          </View>

          <FlatList
            data={filteredClients}
            renderItem={renderClientCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <Surface style={styles.emptyState} elevation={1}>
                <Icon name="trending-up" size={64} color={COLORS.textSecondary} />
                <Text style={styles.emptyTitle}>No Client Progress Data</Text>
                <Text style={styles.emptyMessage}>
                  {searchQuery ? 'Try adjusting your search criteria' : 'Start tracking your clients\' progress'}
                </Text>
                {!searchQuery && (
                  <Button
                    mode="contained"
                    onPress={() => setShowAddRecordModal(true)}
                    icon="add"
                    buttonColor={COLORS.primary}
                    style={styles.emptyButton}
                  >
                    Add First Record
                  </Button>
                )}
              </Surface>
            )}
          />
        </View>
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="assessment"
        onPress={() => {
          if (filteredClients.length > 0) {
            setSelectedClient(filteredClients[0]);
            setShowProgressModal(true);
          } else {
            Alert.alert('No Data', 'Add clients to view detailed progress');
          }
        }}
        label="View Details"
        color={COLORS.white}
        customSize={56}
      />

      {renderProgressModal()}
      {renderAddRecordModal()}
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
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: SPACING.sm,
  },
  headerTitle: {
    ...TEXT_STYLES.title,
    color: COLORS.white,
    flex: 1,
    textAlign: 'center',
    marginRight: SPACING.xl,
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    margin: SPACING.md,
    borderRadius: 12,
    overflow: 'hidden',
  },
  statsGradient: {
    padding: SPACING.lg,
  },
  statsTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.white,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.white,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  searchSection: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  searchBar: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  clientsSection: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
  },
  clientCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: SPACING.md,
  },
  cardHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  clientName: {
    ...TEXT_STYLES.body,
    color: COLORS.white,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  joinDate: {
    ...TEXT_STYLES.caption,
    color: COLORS.white,
    opacity: 0.8,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
  },
  streakText: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    marginLeft: SPACING.xs,
    color: COLORS.error,
  },
  cardContent: {
    padding: SPACING.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  divider: {
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
  metricsPreview: {
    marginBottom: SPACING.md,
  },
  metricPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.sm,
    fontWeight: '600',
  },
  metricValues: {
    alignItems: 'flex-end',
  },
  metricCurrent: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
  },
  metricChange: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
  },
  recentActivity: {
    marginTop: SPACING.sm,
  },
  activityTitle: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  activityText: {
    ...TEXT_STYLES.caption,
  },
  emptyState: {
    alignItems: 'center',
    padding: SPACING.xl,
    margin: SPACING.md,
    borderRadius: 12,
    backgroundColor: COLORS.white,
  },
  emptyTitle: {
    ...TEXT_STYLES.subtitle,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptyMessage: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  emptyButton: {
    marginTop: SPACING.sm,
  },
  fab: {
    position: 'absolute',
    right: SPACING.md,
    bottom: SPACING.xl,
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
  },
  modalBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    width: width - SPACING.lg,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  modalHeader: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalHeaderText: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  modalTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.white,
  },
  modalSubtitle: {
    ...TEXT_STYLES.caption,
    color: COLORS.white,
    opacity: 0.8,
  },
  modalForm: {
    padding: SPACING.md,
    maxHeight: 500,
  },
  metricSelection: {
    marginBottom: SPACING.lg,
  },
  sectionLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: SPACING.md,
    color: COLORS.text,
  },
  metricChips: {
    flexDirection: 'row',
    paddingRight: SPACING.md,
  },
  metricChip: {
    marginRight: SPACING.sm,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  metricChipText: {
    ...TEXT_STYLES.caption,
    fontWeight: '500',
  },
  timeRangeSelection: {
    marginBottom: SPACING.lg,
  },
  timeRangeChips: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeChip: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timeChipText: {
    ...TEXT_STYLES.caption,
    fontWeight: '500',
  },
  chartContainer: {
    marginBottom: SPACING.lg,
  },
  chartSurface: {
    borderRadius: 12,
    padding: SPACING.md,
    backgroundColor: COLORS.white,
  },
  chart: {
    marginVertical: SPACING.sm,
    borderRadius: 16,
  },
  currentMetrics: {
    marginBottom: SPACING.lg,
  },
  metricsCard: {
    padding: SPACING.md,
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  metricRowLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
  },
  metricRowValue: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
  },
  metricDivider: {
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
  achievementsSection: {
    marginBottom: SPACING.lg,
  },
  achievementCard: {
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.white,
  },
  achievementContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementText: {
    marginLeft: SPACING.md,
  },
  achievementTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
  },
  achievementDate: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
  },
  addRecordModalContainer: {
    flex: 1,
  },
  addRecordContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    width: width - SPACING.xl,
    maxHeight: '80%',
  },
  addRecordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  addRecordTitle: {
    ...TEXT_STYLES.subtitle,
  },
  addRecordForm: {
    padding: SPACING.md,
    maxHeight: 400,
  },
  formSection: {
    marginBottom: SPACING.lg,
  },
  formInput: {
    marginBottom: SPACING.md,
  },
  addRecordActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  modalButton: {
    marginLeft: SPACING.sm,
  },
});

export default ClientProgress;