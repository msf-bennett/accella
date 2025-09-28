import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
  Animated,
  Alert,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
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
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import { COLORS } from '../../../styles/colors';
import { SPACING } from '../../../styles/spacing';
import { TEXT_STYLES } from '../../../styles/textStyles';
import { TYPOGRAPHY } from '../../../styles/typography';
import { LAYOUT } from '../../../styles/layout';

const { width } = Dimensions.get('window');

const StepMonitoring = ({ navigation }) => {
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // Redux state
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { players, loading } = useSelector(state => state.players);
  const { stepData, wellness } = useSelector(state => state.wellness);
  
  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');

  // Mock data for demonstration
  const mockStepData = [
    {
      id: '1',
      playerName: 'Alex Johnson',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      todaySteps: 12543,
      goalSteps: 10000,
      weeklyAverage: 11200,
      streak: 7,
      lastSync: '2 min ago',
      trend: 'up',
      weeklyData: [8500, 9200, 11000, 12500, 10800, 13200, 12543],
      wellnessScore: 85,
      heartRate: 68,
      sleepHours: 7.5,
      activeMinutes: 145,
    },
    {
      id: '2',
      playerName: 'Sarah Chen',
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
      todaySteps: 8945,
      goalSteps: 12000,
      weeklyAverage: 9800,
      streak: 4,
      lastSync: '5 min ago',
      trend: 'down',
      weeklyData: [9200, 8800, 10500, 11200, 9400, 8200, 8945],
      wellnessScore: 72,
      heartRate: 72,
      sleepHours: 6.8,
      activeMinutes: 98,
    },
    {
      id: '3',
      playerName: 'Marcus Williams',
      avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
      todaySteps: 15678,
      goalSteps: 15000,
      weeklyAverage: 14500,
      streak: 12,
      lastSync: '1 min ago',
      trend: 'up',
      weeklyData: [14200, 15100, 13800, 16200, 14900, 15500, 15678],
      wellnessScore: 92,
      heartRate: 65,
      sleepHours: 8.2,
      activeMinutes: 187,
    },
  ];

  const timeframes = [
    { key: 'day', label: 'Today', icon: 'today' },
    { key: 'week', label: 'Week', icon: 'date-range' },
    { key: 'month', label: 'Month', icon: 'calendar-view-month' },
  ];

  const filterTypes = [
    { key: 'all', label: 'All Players', color: COLORS.primary },
    { key: 'active', label: 'Active', color: COLORS.success },
    { key: 'low', label: 'Below Goal', color: COLORS.error },
    { key: 'high', label: 'Top Performers', color: COLORS.accent },
  ];

  useEffect(() => {
    // Initialize animations
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

    // Load step data
    loadStepData();
  }, []);

  const loadStepData = useCallback(async () => {
    try {
      // In real implementation, fetch from API/local storage
      // dispatch(fetchStepData({ coachId: user.id, timeframe: selectedTimeframe }));
      console.log('Loading step monitoring data...');
    } catch (error) {
      Alert.alert('Error', 'Failed to load step data');
    }
  }, [selectedTimeframe]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadStepData();
    setRefreshing(false);
  }, [loadStepData]);

  const handlePlayerPress = (player) => {
    setSelectedPlayer(player);
    setShowModal(true);
  };

  const getStepProgress = (steps, goal) => {
    return Math.min(steps / goal, 1);
  };

  const getWellnessColor = (score) => {
    if (score >= 80) return COLORS.success;
    if (score >= 60) return COLORS.warning;
    return COLORS.error;
  };

  const getTrendIcon = (trend) => {
    return trend === 'up' ? 'trending-up' : 'trending-down';
  };

  const getTrendColor = (trend) => {
    return trend === 'up' ? COLORS.success : COLORS.error;
  };

  const filteredPlayers = mockStepData.filter(player => {
    const matchesSearch = player.playerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = () => {
      switch (filterType) {
        case 'active':
          return player.lastSync.includes('min');
        case 'low':
          return player.todaySteps < player.goalSteps;
        case 'high':
          return player.todaySteps > player.goalSteps * 1.1;
        default:
          return true;
      }
    };
    return matchesSearch && matchesFilter();
  });

  const renderStepCard = ({ item }) => (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Card style={styles.stepCard} onPress={() => handlePlayerPress(item)}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.playerInfo}>
              <Avatar.Image
                size={50}
                source={{ uri: item.avatar }}
                style={styles.avatar}
              />
              <View style={styles.playerDetails}>
                <Text style={styles.playerName}>{item.playerName}</Text>
                <Text style={styles.lastSync}>
                  <Icon name="sync" size={12} color={COLORS.textSecondary} />
                  {' '}{item.lastSync}
                </Text>
              </View>
            </View>
            <View style={styles.trendContainer}>
              <Icon
                name={getTrendIcon(item.trend)}
                size={24}
                color={getTrendColor(item.trend)}
              />
              <Chip
                mode="outlined"
                style={[styles.wellnessChip, { borderColor: getWellnessColor(item.wellnessScore) }]}
                textStyle={{ color: getWellnessColor(item.wellnessScore) }}
              >
                {item.wellnessScore}% Well
              </Chip>
            </View>
          </View>

          <View style={styles.stepMetrics}>
            <View style={styles.stepCount}>
              <Text style={styles.stepNumber}>
                {item.todaySteps.toLocaleString()}
              </Text>
              <Text style={styles.stepLabel}>steps today</Text>
            </View>
            <View style={styles.goalComparison}>
              <Text style={styles.goalText}>
                Goal: {item.goalSteps.toLocaleString()}
              </Text>
              <ProgressBar
                progress={getStepProgress(item.todaySteps, item.goalSteps)}
                color={item.todaySteps >= item.goalSteps ? COLORS.success : COLORS.primary}
                style={styles.progressBar}
              />
              <Text style={styles.progressText}>
                {Math.round(getStepProgress(item.todaySteps, item.goalSteps) * 100)}% complete
              </Text>
            </View>
          </View>

          <View style={styles.additionalMetrics}>
            <View style={styles.metricItem}>
              <Icon name="favorite" size={16} color={COLORS.error} />
              <Text style={styles.metricValue}>{item.heartRate}</Text>
              <Text style={styles.metricLabel}>BPM</Text>
            </View>
            <View style={styles.metricItem}>
              <Icon name="bedtime" size={16} color={COLORS.accent} />
              <Text style={styles.metricValue}>{item.sleepHours}h</Text>
              <Text style={styles.metricLabel}>Sleep</Text>
            </View>
            <View style={styles.metricItem}>
              <Icon name="fitness-center" size={16} color={COLORS.success} />
              <Text style={styles.metricValue}>{item.activeMinutes}</Text>
              <Text style={styles.metricLabel}>Active min</Text>
            </View>
            <View style={styles.metricItem}>
              <Icon name="local-fire-department" size={16} color={COLORS.warning} />
              <Text style={styles.metricValue}>{item.streak}</Text>
              <Text style={styles.metricLabel}>Day streak</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderFilterChips = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.filterContainer}
      contentContainerStyle={styles.filterContent}
    >
      {filterTypes.map((filter) => (
        <Chip
          key={filter.key}
          mode={filterType === filter.key ? 'flat' : 'outlined'}
          selected={filterType === filter.key}
          onPress={() => setFilterType(filter.key)}
          style={[
            styles.filterChip,
            filterType === filter.key && { backgroundColor: filter.color }
          ]}
          textStyle={filterType === filter.key ? { color: 'white' } : {}}
        >
          {filter.label}
        </Chip>
      ))}
    </ScrollView>
  );

  const renderTimeframeSelector = () => (
    <View style={styles.timeframeContainer}>
      {timeframes.map((timeframe) => (
        <TouchableOpacity
          key={timeframe.key}
          style={[
            styles.timeframeButton,
            selectedTimeframe === timeframe.key && styles.timeframeButtonActive
          ]}
          onPress={() => setSelectedTimeframe(timeframe.key)}
        >
          <Icon
            name={timeframe.icon}
            size={20}
            color={selectedTimeframe === timeframe.key ? 'white' : COLORS.primary}
          />
          <Text
            style={[
              styles.timeframeText,
              selectedTimeframe === timeframe.key && styles.timeframeTextActive
            ]}
          >
            {timeframe.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Step Monitoring 👟</Text>
            <Text style={styles.headerSubtitle}>
              Track your team's daily activity
            </Text>
          </View>
          <IconButton
            icon="settings"
            iconColor="white"
            size={24}
            onPress={() => {
              Alert.alert(
                'Feature Development',
                'Step monitoring settings are coming soon! 🔧',
                [{ text: 'OK' }]
              );
            }}
          />
        </View>
        
        <View style={styles.summaryStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {mockStepData.reduce((sum, player) => sum + player.todaySteps, 0).toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Total Steps Today</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {Math.round(mockStepData.reduce((sum, player) => sum + player.wellnessScore, 0) / mockStepData.length)}%
            </Text>
            <Text style={styles.statLabel}>Avg Wellness</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {mockStepData.filter(p => p.todaySteps >= p.goalSteps).length}/{mockStepData.length}
            </Text>
            <Text style={styles.statLabel}>Goals Met</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      {renderHeader()}

      <View style={styles.content}>
        {renderTimeframeSelector()}
        
        <Searchbar
          placeholder="Search players..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={COLORS.primary}
          placeholderTextColor={COLORS.textSecondary}
        />

        {renderFilterChips()}

        <FlatList
          data={filteredPlayers}
          renderItem={renderStepCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      </View>

      <FAB
        icon="analytics"
        style={styles.fab}
        onPress={() => {
          Alert.alert(
            'Analytics Dashboard',
            'Detailed step analytics coming soon! 📊',
            [{ text: 'Got it!' }]
          );
        }}
      />

      <Portal>
        <Modal
          visible={showModal}
          onDismiss={() => setShowModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          {selectedPlayer && (
            <View style={styles.modalContainer}>
              <BlurView
                style={StyleSheet.absoluteFill}
                blurType="light"
                blurAmount={10}
              />
              <Card style={styles.detailCard}>
                <Card.Content>
                  <View style={styles.modalHeader}>
                    <Avatar.Image
                      size={60}
                      source={{ uri: selectedPlayer.avatar }}
                    />
                    <View style={styles.modalPlayerInfo}>
                      <Text style={styles.modalPlayerName}>
                        {selectedPlayer.playerName}
                      </Text>
                      <Text style={styles.modalWellnessScore}>
                        Wellness Score: {selectedPlayer.wellnessScore}%
                      </Text>
                    </View>
                    <IconButton
                      icon="close"
                      size={24}
                      onPress={() => setShowModal(false)}
                    />
                  </View>
                  
                  <View style={styles.detailMetrics}>
                    <Text style={styles.sectionTitle}>Today's Activity</Text>
                    <View style={styles.metricGrid}>
                      <View style={styles.gridItem}>
                        <Icon name="directions-walk" size={24} color={COLORS.primary} />
                        <Text style={styles.gridValue}>{selectedPlayer.todaySteps.toLocaleString()}</Text>
                        <Text style={styles.gridLabel}>Steps</Text>
                      </View>
                      <View style={styles.gridItem}>
                        <Icon name="favorite" size={24} color={COLORS.error} />
                        <Text style={styles.gridValue}>{selectedPlayer.heartRate}</Text>
                        <Text style={styles.gridLabel}>Avg BPM</Text>
                      </View>
                      <View style={styles.gridItem}>
                        <Icon name="bedtime" size={24} color={COLORS.accent} />
                        <Text style={styles.gridValue}>{selectedPlayer.sleepHours}h</Text>
                        <Text style={styles.gridLabel}>Sleep</Text>
                      </View>
                      <View style={styles.gridItem}>
                        <Icon name="fitness-center" size={24} color={COLORS.success} />
                        <Text style={styles.gridValue}>{selectedPlayer.activeMinutes}</Text>
                        <Text style={styles.gridLabel}>Active Min</Text>
                      </View>
                    </View>
                  </View>
                  
                  <Button
                    mode="contained"
                    onPress={() => {
                      setShowModal(false);
                      Alert.alert(
                        'Coming Soon',
                        'Detailed player analytics are in development! 🚀'
                      );
                    }}
                    style={styles.detailButton}
                  >
                    View Full Analytics
                  </Button>
                </Card.Content>
              </Card>
            </View>
          )}
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: SPACING.xs,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: SPACING.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...TEXT_STYLES.h3,
    color: 'white',
    fontWeight: 'bold',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  timeframeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: SPACING.md,
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  timeframeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
  },
  timeframeButtonActive: {
    backgroundColor: COLORS.primary,
  },
  timeframeText: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  timeframeTextActive: {
    color: 'white',
  },
  searchBar: {
    marginVertical: SPACING.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  filterContainer: {
    marginBottom: SPACING.md,
  },
  filterContent: {
    paddingHorizontal: SPACING.xs,
  },
  filterChip: {
    marginRight: SPACING.sm,
  },
  listContent: {
    paddingBottom: 100,
  },
  cardContainer: {
    marginBottom: SPACING.md,
  },
  stepCard: {
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    marginRight: SPACING.md,
  },
  playerDetails: {
    flex: 1,
  },
  playerName: {
    ...TEXT_STYLES.h4,
    fontWeight: 'bold',
  },
  lastSync: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  trendContainer: {
    alignItems: 'center',
  },
  wellnessChip: {
    marginTop: SPACING.xs,
  },
  stepMetrics: {
    marginBottom: SPACING.md,
  },
  stepCount: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  stepNumber: {
    ...TEXT_STYLES.h1,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  stepLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
  },
  goalComparison: {
    marginTop: SPACING.sm,
  },
  goalText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.xs,
  },
  progressText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    textAlign: 'right',
  },
  additionalMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: SPACING.md,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    ...TEXT_STYLES.h4,
    fontWeight: 'bold',
    marginTop: SPACING.xs,
  },
  metricLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  fab: {
    position: 'absolute',
    right: SPACING.md,
    bottom: SPACING.xl,
    backgroundColor: COLORS.accent,
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width - 40,
    maxHeight: '80%',
  },
  detailCard: {
    backgroundColor: 'white',
    borderRadius: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalPlayerInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  modalPlayerName: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
  },
  modalWellnessScore: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  detailMetrics: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TEXT_STYLES.h4,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  gridValue: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
    marginTop: SPACING.sm,
  },
  gridLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  detailButton: {
    marginTop: SPACING.md,
  },
});

export default StepMonitoring;