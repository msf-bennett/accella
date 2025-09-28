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
  Badge,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import { BlurView } from '../../../components/shared/BlurView';
import { COLORS } from '../../../styles/colors';
import { SPACING } from '../../../styles/spacing';
import { TEXT_STYLES } from '../../../styles/textStyles';
import { TYPOGRAPHY } from '../../../styles/typography';
import { LAYOUT } from '../../../styles/layout';

const { width } = Dimensions.get('window');

const StressManagement = ({ navigation }) => {
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Redux state
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { players, loading } = useSelector(state => state.players);
  const { stressData, alerts } = useSelector(state => state.wellness);
  
  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('today');

  // Mock stress data
  const mockStressData = [
    {
      id: '1',
      playerName: 'Alex Johnson',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      currentStressLevel: 7.2,
      avgStressLevel: 6.5,
      stressCategory: 'moderate',
      lastCheckIn: '2 hours ago',
      heartRateVariability: 42,
      sleepQuality: 3.8,
      recoveryScore: 72,
      stressFactors: ['Training Load', 'Sleep Deficit'],
      weeklyTrend: [5.5, 6.2, 7.1, 6.8, 7.2, 6.9, 7.2],
      interventionsUsed: 2,
      moodScore: 6.5,
      energyLevel: 7.0,
      mentalFatigue: 6.8,
      needsAttention: false,
    },
    {
      id: '2',
      playerName: 'Sarah Chen',
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
      currentStressLevel: 8.7,
      avgStressLevel: 7.2,
      stressCategory: 'high',
      lastCheckIn: '30 min ago',
      heartRateVariability: 28,
      sleepQuality: 2.1,
      recoveryScore: 45,
      stressFactors: ['Competition Anxiety', 'Academic Pressure', 'Social Issues'],
      weeklyTrend: [6.8, 7.5, 8.1, 8.5, 8.2, 8.9, 8.7],
      interventionsUsed: 5,
      moodScore: 4.2,
      energyLevel: 4.5,
      mentalFatigue: 8.3,
      needsAttention: true,
    },
    {
      id: '3',
      playerName: 'Marcus Williams',
      avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
      currentStressLevel: 4.1,
      avgStressLevel: 4.8,
      stressCategory: 'low',
      lastCheckIn: '1 hour ago',
      heartRateVariability: 58,
      sleepQuality: 4.5,
      recoveryScore: 89,
      stressFactors: [],
      weeklyTrend: [5.2, 4.8, 4.3, 4.0, 4.5, 4.2, 4.1],
      interventionsUsed: 1,
      moodScore: 8.2,
      energyLevel: 8.8,
      mentalFatigue: 3.2,
      needsAttention: false,
    },
    {
      id: '4',
      playerName: 'Emma Davis',
      avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
      currentStressLevel: 9.1,
      avgStressLevel: 8.5,
      stressCategory: 'critical',
      lastCheckIn: '10 min ago',
      heartRateVariability: 22,
      sleepQuality: 1.8,
      recoveryScore: 28,
      stressFactors: ['Injury Recovery', 'Performance Pressure', 'Family Issues'],
      weeklyTrend: [7.9, 8.2, 8.8, 9.2, 9.0, 9.3, 9.1],
      interventionsUsed: 8,
      moodScore: 3.1,
      energyLevel: 3.2,
      mentalFatigue: 9.1,
      needsAttention: true,
    },
  ];

  const stressInterventions = [
    {
      id: 1,
      title: 'Breathing Exercise',
      description: '5-minute guided breathing session',
      icon: 'air',
      duration: '5 min',
      effectiveness: 85,
      category: 'immediate',
    },
    {
      id: 2,
      title: 'Progressive Muscle Relaxation',
      description: 'Systematic muscle tension and release',
      icon: 'spa',
      duration: '15 min',
      effectiveness: 78,
      category: 'immediate',
    },
    {
      id: 3,
      title: 'Mindfulness Meditation',
      description: 'Present moment awareness practice',
      icon: 'self-improvement',
      duration: '10 min',
      effectiveness: 82,
      category: 'daily',
    },
    {
      id: 4,
      title: 'Schedule 1-on-1 Meeting',
      description: 'Personal discussion with coach',
      icon: 'person',
      duration: '30 min',
      effectiveness: 90,
      category: 'intervention',
    },
  ];

  const timeframes = [
    { key: 'today', label: 'Today', icon: 'today' },
    { key: 'week', label: 'Week', icon: 'date-range' },
    { key: 'month', label: 'Month', icon: 'calendar-view-month' },
  ];

  const filterTypes = [
    { key: 'all', label: 'All Players', color: COLORS.primary },
    { key: 'critical', label: 'Critical', color: COLORS.error },
    { key: 'high', label: 'High Stress', color: COLORS.warning },
    { key: 'attention', label: 'Needs Attention', color: COLORS.accent },
    { key: 'recovered', label: 'Well Recovered', color: COLORS.success },
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

    // Start pulse animation for critical alerts
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    loadStressData();
  }, []);

  const loadStressData = useCallback(async () => {
    try {
      console.log('Loading stress management data...');
    } catch (error) {
      Alert.alert('Error', 'Failed to load stress data');
    }
  }, [selectedTimeframe]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadStressData();
    setRefreshing(false);
  }, [loadStressData]);

  const getStressColor = (level) => {
    if (level >= 8.5) return COLORS.error;
    if (level >= 7.0) return COLORS.warning;
    if (level >= 5.0) return COLORS.accent;
    return COLORS.success;
  };

  const getStressLabel = (category) => {
    const labels = {
      critical: 'CRITICAL',
      high: 'HIGH',
      moderate: 'MODERATE',
      low: 'LOW',
    };
    return labels[category] || 'UNKNOWN';
  };

  const getRecoveryColor = (score) => {
    if (score >= 80) return COLORS.success;
    if (score >= 60) return COLORS.warning;
    return COLORS.error;
  };

  const handlePlayerPress = (player) => {
    setSelectedPlayer(player);
    setShowModal(true);
  };

  const handleIntervention = (player, intervention) => {
    Alert.alert(
      `${intervention.title}`,
      `Send ${intervention.title.toLowerCase()} to ${player.playerName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: () => {
            Alert.alert('Sent! 🎯', `${intervention.title} sent to ${player.playerName}`);
            setShowModal(false);
          }
        }
      ]
    );
  };

  const filteredPlayers = mockStressData.filter(player => {
    const matchesSearch = player.playerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = () => {
      switch (filterType) {
        case 'critical':
          return player.stressCategory === 'critical';
        case 'high':
          return player.stressCategory === 'high';
        case 'attention':
          return player.needsAttention;
        case 'recovered':
          return player.recoveryScore >= 80;
        default:
          return true;
      }
    };
    return matchesSearch && matchesFilter();
  });

  const criticalCount = mockStressData.filter(p => p.stressCategory === 'critical').length;
  const needsAttentionCount = mockStressData.filter(p => p.needsAttention).length;

  const renderStressCard = ({ item }) => (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
        item.stressCategory === 'critical' && {
          transform: [{ scale: pulseAnim }],
        },
      ]}
    >
      <Card 
        style={[
          styles.stressCard,
          item.stressCategory === 'critical' && styles.criticalCard,
        ]} 
        onPress={() => handlePlayerPress(item)}
      >
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.playerInfo}>
              <View style={styles.avatarContainer}>
                <Avatar.Image
                  size={50}
                  source={{ uri: item.avatar }}
                  style={styles.avatar}
                />
                {item.needsAttention && (
                  <Badge
                    style={[styles.attentionBadge, { backgroundColor: COLORS.error }]}
                    size={16}
                  />
                )}
              </View>
              <View style={styles.playerDetails}>
                <Text style={styles.playerName}>{item.playerName}</Text>
                <Text style={styles.lastCheckIn}>
                  <Icon name="schedule" size={12} color={COLORS.textSecondary} />
                  {' '}{item.lastCheckIn}
                </Text>
              </View>
            </View>
            <View style={styles.stressIndicator}>
              <Text style={[styles.stressLevel, { color: getStressColor(item.currentStressLevel) }]}>
                {item.currentStressLevel.toFixed(1)}
              </Text>
              <Chip
                mode="flat"
                style={[styles.stressChip, { backgroundColor: getStressColor(item.currentStressLevel) }]}
                textStyle={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}
              >
                {getStressLabel(item.stressCategory)}
              </Chip>
            </View>
          </View>

          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Icon name="favorite" size={18} color={COLORS.error} />
              <Text style={styles.metricValue}>HRV</Text>
              <Text style={styles.metricNumber}>{item.heartRateVariability}</Text>
            </View>
            <View style={styles.metricItem}>
              <Icon name="bedtime" size={18} color={COLORS.accent} />
              <Text style={styles.metricValue}>Sleep</Text>
              <Text style={styles.metricNumber}>{item.sleepQuality.toFixed(1)}</Text>
            </View>
            <View style={styles.metricItem}>
              <Icon name="trending-up" size={18} color={getRecoveryColor(item.recoveryScore)} />
              <Text style={styles.metricValue}>Recovery</Text>
              <Text style={styles.metricNumber}>{item.recoveryScore}%</Text>
            </View>
            <View style={styles.metricItem}>
              <Icon name="psychology" size={18} color={COLORS.primary} />
              <Text style={styles.metricValue}>Mood</Text>
              <Text style={styles.metricNumber}>{item.moodScore.toFixed(1)}</Text>
            </View>
          </View>

          {item.stressFactors.length > 0 && (
            <View style={styles.stressFactors}>
              <Text style={styles.factorsLabel}>Stress Factors:</Text>
              <View style={styles.factorsContainer}>
                {item.stressFactors.slice(0, 2).map((factor, index) => (
                  <Chip
                    key={index}
                    mode="outlined"
                    style={styles.factorChip}
                    textStyle={styles.factorText}
                  >
                    {factor}
                  </Chip>
                ))}
                {item.stressFactors.length > 2 && (
                  <Chip
                    mode="outlined"
                    style={styles.factorChip}
                    textStyle={styles.factorText}
                  >
                    +{item.stressFactors.length - 2} more
                  </Chip>
                )}
              </View>
            </View>
          )}

          <View style={styles.actionContainer}>
            <ProgressBar
              progress={item.currentStressLevel / 10}
              color={getStressColor(item.currentStressLevel)}
              style={styles.stressProgressBar}
            />
            <View style={styles.quickActions}>
              <Button
                mode="outlined"
                compact
                onPress={() => handleIntervention(item, stressInterventions[0])}
                icon="air"
                style={styles.quickActionButton}
              >
                Breathing
              </Button>
              {item.stressCategory === 'critical' && (
                <Button
                  mode="contained"
                  compact
                  onPress={() => handleIntervention(item, stressInterventions[3])}
                  icon="person"
                  buttonColor={COLORS.error}
                  style={styles.quickActionButton}
                >
                  Urgent Meeting
                </Button>
              )}
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
            <Text style={styles.headerTitle}>Stress Management 🧠</Text>
            <Text style={styles.headerSubtitle}>
              Monitor team mental wellness
            </Text>
          </View>
          <View style={styles.headerActions}>
            {criticalCount > 0 && (
              <View style={styles.alertBadge}>
                <Icon name="warning" size={16} color="white" />
                <Text style={styles.alertText}>{criticalCount}</Text>
              </View>
            )}
            <IconButton
              icon="psychology"
              iconColor="white"
              size={24}
              onPress={() => {
                Alert.alert(
                  'AI Stress Insights',
                  'Advanced AI-powered stress analysis coming soon! 🤖',
                  [{ text: 'OK' }]
                );
              }}
            />
          </View>
        </View>
        
        <View style={styles.summaryStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {(mockStressData.reduce((sum, player) => sum + player.currentStressLevel, 0) / mockStressData.length).toFixed(1)}
            </Text>
            <Text style={styles.statLabel}>Avg Stress Level</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {needsAttentionCount}
            </Text>
            <Text style={styles.statLabel}>Need Attention</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {Math.round(mockStressData.reduce((sum, player) => sum + player.recoveryScore, 0) / mockStressData.length)}%
            </Text>
            <Text style={styles.statLabel}>Avg Recovery</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );

  const renderInterventionModal = () => (
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
                    <Text style={[styles.modalStressLevel, { color: getStressColor(selectedPlayer.currentStressLevel) }]}>
                      Stress Level: {selectedPlayer.currentStressLevel.toFixed(1)}/10
                    </Text>
                  </View>
                  <IconButton
                    icon="close"
                    size={24}
                    onPress={() => setShowModal(false)}
                  />
                </View>
                
                <View style={styles.detailMetrics}>
                  <Text style={styles.sectionTitle}>Current Status</Text>
                  <View style={styles.statusGrid}>
                    <View style={styles.statusItem}>
                      <Icon name="psychology" size={24} color={COLORS.primary} />
                      <Text style={styles.statusLabel}>Mental Fatigue</Text>
                      <Text style={styles.statusValue}>{selectedPlayer.mentalFatigue.toFixed(1)}/10</Text>
                    </View>
                    <View style={styles.statusItem}>
                      <Icon name="battery-charging-full" size={24} color={COLORS.success} />
                      <Text style={styles.statusLabel}>Energy Level</Text>
                      <Text style={styles.statusValue}>{selectedPlayer.energyLevel.toFixed(1)}/10</Text>
                    </View>
                  </View>
                </View>

                {selectedPlayer.stressFactors.length > 0 && (
                  <View style={styles.factorsSection}>
                    <Text style={styles.sectionTitle}>Identified Stress Factors</Text>
                    <View style={styles.allFactorsContainer}>
                      {selectedPlayer.stressFactors.map((factor, index) => (
                        <Chip
                          key={index}
                          mode="outlined"
                          style={styles.detailFactorChip}
                          icon="error-outline"
                        >
                          {factor}
                        </Chip>
                      ))}
                    </View>
                  </View>
                )}
                
                <Text style={styles.sectionTitle}>Recommended Interventions</Text>
                <ScrollView style={styles.interventionsList} showsVerticalScrollIndicator={false}>
                  {stressInterventions.map((intervention) => (
                    <TouchableOpacity
                      key={intervention.id}
                      style={styles.interventionItem}
                      onPress={() => handleIntervention(selectedPlayer, intervention)}
                    >
                      <View style={styles.interventionLeft}>
                        <Icon name={intervention.icon} size={24} color={COLORS.primary} />
                        <View style={styles.interventionInfo}>
                          <Text style={styles.interventionTitle}>{intervention.title}</Text>
                          <Text style={styles.interventionDescription}>{intervention.description}</Text>
                          <Text style={styles.interventionMeta}>
                            {intervention.duration} • {intervention.effectiveness}% effective
                          </Text>
                        </View>
                      </View>
                      <Icon name="arrow-forward-ios" size={16} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                
                <Button
                  mode="contained"
                  onPress={() => {
                    setShowModal(false);
                    Alert.alert(
                      'Schedule Meeting',
                      `1-on-1 meeting with ${selectedPlayer.playerName} has been scheduled for tomorrow at 2 PM.`
                    );
                  }}
                  style={styles.scheduleButton}
                  icon="event"
                >
                  Schedule 1-on-1 Meeting
                </Button>
              </Card.Content>
            </Card>
          </View>
        )}
      </Modal>
    </Portal>
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
          renderItem={renderStressCard}
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
        icon="psychology"
        style={styles.fab}
        onPress={() => {
          Alert.alert(
            'Stress Analytics Dashboard',
            'Advanced team stress analytics coming soon! 📊',
            [{ text: 'Got it!' }]
          );
        }}
      />

      {renderInterventionModal()}
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error,
    borderRadius: 12,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    marginRight: SPACING.sm,
  },
  alertText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: SPACING.xs,
    fontSize: 12,
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
  stressCard: {
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  criticalCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
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
  avatarContainer: {
    position: 'relative',
    marginRight: SPACING.md,
  },
  avatar: {},
  attentionBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
  },
  playerDetails: {
    flex: 1,
  },
  playerName: {
    ...TEXT_STYLES.h4,
    fontWeight: 'bold',
  },
  lastCheckIn: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  stressIndicator: {
    alignItems: 'center',
  },
  stressLevel: {
    ...TEXT_STYLES.h2,
    fontWeight: 'bold',
  },
  stressChip: {
    marginTop: SPACING.xs,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  metricNumber: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    marginTop: SPACING.xs,
  },
  stressFactors: {
    marginBottom: SPACING.md,
  },
  factorsLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: SPACING.sm,
    color: COLORS.textPrimary,
  },
  factorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  factorChip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  factorText: {
    fontSize: 12,
  },
  actionContainer: {
    marginTop: SPACING.sm,
  },
  stressProgressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: SPACING.md,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
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
    maxHeight: '85%',
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
  modalStressLevel: {
    ...TEXT_STYLES.body,
    marginTop: SPACING.xs,
    fontWeight: '600',
  },
  detailMetrics: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TEXT_STYLES.h4,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
    color: COLORS.textPrimary,
  },
  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusItem: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: SPACING.md,
    alignItems: 'center',
    marginHorizontal: SPACING.xs,
  },
  statusLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  statusValue: {
    ...TEXT_STYLES.h4,
    fontWeight: 'bold',
    marginTop: SPACING.xs,
  },
  factorsSection: {
    marginBottom: SPACING.lg,
  },
  allFactorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailFactorChip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  interventionsList: {
    maxHeight: 200,
    marginBottom: SPACING.lg,
  },
  interventionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  interventionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  interventionInfo: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  interventionTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  interventionDescription: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  interventionMeta: {
    ...TEXT_STYLES.caption,
    color: COLORS.accent,
    fontWeight: '500',
  },
  scheduleButton: {
    marginTop: SPACING.sm,
  },
});

export default StressManagement;