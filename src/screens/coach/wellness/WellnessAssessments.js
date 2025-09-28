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
  Vibration,
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
  Divider,
  TextInput,
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

const WellnessAssessment = ({ navigation }) => {
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const warningPulse = useRef(new Animated.Value(1)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // Redux state
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { players, loading } = useSelector(state => state.players);
  const { wellnessData, assessments } = useSelector(state => state.wellness);
  
  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showAssessmentForm, setShowAssessmentForm] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [assessmentType, setAssessmentType] = useState('daily');
  const [newAssessment, setNewAssessment] = useState({
    sleep: 5,
    energy: 5,
    stress: 5,
    motivation: 5,
    muscle_soreness: 5,
    mood: 5,
    recovery: 5,
    notes: '',
  });

  // Mock wellness data
  const mockWellnessData = [
    {
      id: '1',
      playerName: 'Alex Johnson',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      position: 'Forward',
      team: 'Elite Squad',
      overallWellness: 8.2,
      wellnessStatus: 'excellent',
      lastAssessment: '2 hours ago',
      assessmentStreak: 12,
      riskLevel: 'low',
      weeklyTrend: 'improving',
      alerts: [],
      recentMetrics: {
        sleep: { value: 8.5, trend: 'up', history: [7.5, 8.0, 8.2, 8.5, 8.8, 8.5, 8.5] },
        energy: { value: 8.0, trend: 'stable', history: [7.8, 8.2, 7.9, 8.0, 8.1, 8.0, 8.0] },
        stress: { value: 3.2, trend: 'down', history: [4.5, 4.2, 3.8, 3.5, 3.2, 3.0, 3.2] },
        motivation: { value: 8.8, trend: 'up', history: [8.0, 8.2, 8.5, 8.6, 8.8, 8.7, 8.8] },
        muscle_soreness: { value: 2.8, trend: 'stable', history: [3.2, 2.9, 2.8, 3.0, 2.8, 2.7, 2.8] },
        mood: { value: 8.3, trend: 'up', history: [7.8, 8.0, 8.1, 8.2, 8.3, 8.4, 8.3] },
        recovery: { value: 8.1, trend: 'stable', history: [8.0, 8.2, 7.9, 8.1, 8.0, 8.2, 8.1] },
      },
      trainingLoad: 'moderate',
      recommendations: [
        'Maintain current sleep schedule',
        'Consider light recovery session',
        'Monitor stress levels closely'
      ],
    },
    {
      id: '2',
      playerName: 'Sarah Chen',
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
      position: 'Midfielder',
      team: 'Elite Squad',
      overallWellness: 6.1,
      wellnessStatus: 'concerning',
      lastAssessment: '1 day ago',
      assessmentStreak: 8,
      riskLevel: 'medium',
      weeklyTrend: 'declining',
      alerts: ['High stress levels', 'Poor sleep quality', 'Low energy reported'],
      recentMetrics: {
        sleep: { value: 5.2, trend: 'down', history: [7.0, 6.8, 6.2, 5.8, 5.5, 5.0, 5.2] },
        energy: { value: 4.8, trend: 'down', history: [6.5, 6.2, 5.8, 5.2, 4.9, 4.6, 4.8] },
        stress: { value: 7.8, trend: 'up', history: [5.5, 6.2, 6.8, 7.2, 7.5, 7.8, 7.8] },
        motivation: { value: 5.5, trend: 'down', history: [7.2, 6.8, 6.5, 6.0, 5.8, 5.2, 5.5] },
        muscle_soreness: { value: 6.8, trend: 'up', history: [4.2, 4.8, 5.5, 6.0, 6.5, 6.8, 6.8] },
        mood: { value: 5.2, trend: 'down', history: [6.8, 6.5, 6.0, 5.8, 5.5, 5.0, 5.2] },
        recovery: { value: 4.9, trend: 'down', history: [6.2, 5.8, 5.5, 5.2, 5.0, 4.8, 4.9] },
      },
      trainingLoad: 'high',
      recommendations: [
        'Immediate rest day required',
        'Schedule wellness consultation',
        'Reduce training intensity',
        'Focus on stress management'
      ],
    },
    {
      id: '3',
      playerName: 'Marcus Williams',
      avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
      position: 'Defender',
      team: 'Elite Squad',
      overallWellness: 7.6,
      wellnessStatus: 'good',
      lastAssessment: '4 hours ago',
      assessmentStreak: 25,
      riskLevel: 'low',
      weeklyTrend: 'stable',
      alerts: [],
      recentMetrics: {
        sleep: { value: 7.8, trend: 'stable', history: [7.5, 7.8, 7.6, 7.8, 7.9, 7.7, 7.8] },
        energy: { value: 7.5, trend: 'stable', history: [7.2, 7.5, 7.8, 7.3, 7.5, 7.6, 7.5] },
        stress: { value: 4.2, trend: 'stable', history: [4.5, 4.0, 4.2, 4.3, 4.1, 4.2, 4.2] },
        motivation: { value: 7.8, trend: 'up', history: [7.2, 7.5, 7.6, 7.7, 7.8, 7.9, 7.8] },
        muscle_soreness: { value: 3.8, trend: 'stable', history: [4.0, 3.8, 3.9, 3.7, 3.8, 3.9, 3.8] },
        mood: { value: 7.9, trend: 'stable', history: [7.8, 7.9, 7.7, 7.9, 8.0, 7.8, 7.9] },
        recovery: { value: 7.2, trend: 'stable', history: [7.0, 7.2, 7.3, 7.1, 7.2, 7.4, 7.2] },
      },
      trainingLoad: 'moderate',
      recommendations: [
        'Continue current routine',
        'Monitor muscle soreness',
        'Maintain motivation levels'
      ],
    },
    {
      id: '4',
      playerName: 'Emma Davis',
      avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
      position: 'Goalkeeper',
      team: 'Elite Squad',
      overallWellness: 4.8,
      wellnessStatus: 'critical',
      lastAssessment: '3 days ago',
      assessmentStreak: 2,
      riskLevel: 'high',
      weeklyTrend: 'declining',
      alerts: ['No assessment for 3 days', 'Extreme fatigue reported', 'High injury risk'],
      recentMetrics: {
        sleep: { value: 3.2, trend: 'down', history: [5.5, 4.8, 4.2, 3.8, 3.5, 3.2, 3.2] },
        energy: { value: 2.8, trend: 'down', history: [4.2, 3.8, 3.5, 3.2, 2.9, 2.8, 2.8] },
        stress: { value: 9.2, trend: 'up', history: [7.8, 8.2, 8.5, 8.9, 9.0, 9.2, 9.2] },
        motivation: { value: 3.5, trend: 'down', history: [5.8, 5.2, 4.8, 4.2, 3.8, 3.5, 3.5] },
        muscle_soreness: { value: 8.8, trend: 'up', history: [6.2, 6.8, 7.2, 7.8, 8.2, 8.5, 8.8] },
        mood: { value: 3.8, trend: 'down', history: [5.2, 4.8, 4.5, 4.2, 3.9, 3.8, 3.8] },
        recovery: { value: 2.5, trend: 'down', history: [4.2, 3.8, 3.5, 3.2, 2.8, 2.5, 2.5] },
      },
      trainingLoad: 'very_high',
      recommendations: [
        'URGENT: Complete rest required',
        'Medical evaluation needed',
        'Immediate intervention required',
        'Schedule emergency consultation'
      ],
    },
  ];

  const wellnessMetrics = [
    { key: 'sleep', label: 'Sleep Quality', icon: 'bedtime', unit: '/10', goodRange: [7, 10] },
    { key: 'energy', label: 'Energy Level', icon: 'battery-charging-full', unit: '/10', goodRange: [7, 10] },
    { key: 'stress', label: 'Stress Level', icon: 'psychology', unit: '/10', goodRange: [1, 4] },
    { key: 'motivation', label: 'Motivation', icon: 'psychology-alt', unit: '/10', goodRange: [7, 10] },
    { key: 'muscle_soreness', label: 'Muscle Soreness', icon: 'fitness-center', unit: '/10', goodRange: [1, 4] },
    { key: 'mood', label: 'Mood', icon: 'sentiment-satisfied', unit: '/10', goodRange: [7, 10] },
    { key: 'recovery', label: 'Recovery', icon: 'self-improvement', unit: '/10', goodRange: [7, 10] },
  ];

  const wellnessStatusConfig = {
    excellent: { color: COLORS.success, icon: 'sentiment-very-satisfied', emoji: '🌟' },
    good: { color: COLORS.primary, icon: 'sentiment-satisfied', emoji: '😊' },
    concerning: { color: COLORS.warning, icon: 'sentiment-neutral', emoji: '😐' },
    critical: { color: COLORS.error, icon: 'sentiment-very-dissatisfied', emoji: '😰' },
  };

  const filterTypes = [
    { key: 'all', label: 'All Players', color: COLORS.primary },
    { key: 'critical', label: 'Critical', color: COLORS.error },
    { key: 'concerning', label: 'Concerning', color: COLORS.warning },
    { key: 'excellent', label: 'Excellent', color: COLORS.success },
    { key: 'overdue', label: 'Overdue', color: COLORS.error },
  ];

  const timeframes = [
    { key: 'day', label: 'Today', icon: 'today' },
    { key: 'week', label: 'Week', icon: 'date-range' },
    { key: 'month', label: 'Month', icon: 'calendar-view-month' },
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

    // Start warning pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(warningPulse, {
          toValue: 1.02,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(warningPulse, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    loadWellnessData();
  }, [selectedTimeframe]);

  const loadWellnessData = useCallback(async () => {
    try {
      console.log('Loading wellness assessment data...');
      // Implement actual data loading logic here
    } catch (error) {
      Alert.alert('Error', 'Failed to load wellness data');
    }
  }, [selectedTimeframe]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadWellnessData();
    setRefreshing(false);
  }, [loadWellnessData]);

  const getWellnessStatusColor = (status) => wellnessStatusConfig[status]?.color || COLORS.textSecondary;
  const getWellnessStatusIcon = (status) => wellnessStatusConfig[status]?.icon || 'help';

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return COLORS.success;
      case 'down': return COLORS.error;
      case 'stable': return COLORS.primary;
      default: return COLORS.textSecondary;
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return 'trending-up';
      case 'down': return 'trending-down';
      case 'stable': return 'trending-flat';
      default: return 'help';
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'high': return COLORS.error;
      case 'medium': return COLORS.warning;
      case 'low': return COLORS.success;
      default: return COLORS.textSecondary;
    }
  };

  const handlePlayerPress = (player) => {
    setSelectedPlayer(player);
    setShowModal(true);
  };

  const handleSendReminder = (player) => {
    Vibration.vibrate(50);
    Alert.alert(
      'Reminder Sent',
      `Wellness assessment reminder sent to ${player.playerName} 📲`,
      [{ text: 'OK' }]
    );
  };

  const handleScheduleConsultation = (player) => {
    Alert.alert(
      'Schedule Consultation',
      `Would you like to schedule a wellness consultation with ${player.playerName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Schedule', 
          onPress: () => {
            Vibration.vibrate(100);
            Alert.alert('Success', 'Wellness consultation scheduled! 📅');
          }
        }
      ]
    );
  };

  const filteredPlayers = mockWellnessData.filter(player => {
    const matchesSearch = player.playerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = () => {
      switch (filterType) {
        case 'critical':
          return player.wellnessStatus === 'critical';
        case 'concerning':
          return player.wellnessStatus === 'concerning';
        case 'excellent':
          return player.wellnessStatus === 'excellent';
        case 'overdue':
          return player.lastAssessment.includes('day');
        default:
          return true;
      }
    };
    return matchesSearch && matchesFilter();
  });

  const criticalCount = mockWellnessData.filter(p => p.wellnessStatus === 'critical').length;
  const concerningCount = mockWellnessData.filter(p => p.wellnessStatus === 'concerning').length;
  const avgWellness = (mockWellnessData.reduce((sum, p) => sum + p.overallWellness, 0) / mockWellnessData.length).toFixed(1);

  const renderWellnessCard = ({ item }) => (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
        (item.wellnessStatus === 'critical' || item.wellnessStatus === 'concerning') && {
          transform: [{ scale: warningPulse }],
        },
      ]}
    >
      <Card 
        style={[
          styles.wellnessCard,
          item.wellnessStatus === 'critical' && styles.criticalCard,
          item.wellnessStatus === 'concerning' && styles.concerningCard,
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
                {item.alerts.length > 0 && (
                  <Badge
                    style={[styles.alertBadge, { backgroundColor: COLORS.error }]}
                    size={18}
                  >
                    {item.alerts.length}
                  </Badge>
                )}
                <Badge
                  style={[styles.streakBadge, { backgroundColor: COLORS.success }]}
                  size={16}
                >
                  {item.assessmentStreak}
                </Badge>
              </View>
              <View style={styles.playerDetails}>
                <Text style={styles.playerName}>{item.playerName}</Text>
                <Text style={styles.playerPosition}>{item.position} • {item.team}</Text>
                <Text style={styles.lastAssessment}>
                  <Icon name="schedule" size={12} color={COLORS.textSecondary} />
                  {' '}Last: {item.lastAssessment}
                </Text>
              </View>
            </View>
            <View style={styles.statusIndicator}>
              <View style={styles.wellnessScore}>
                <Text style={[styles.scoreNumber, { color: getWellnessStatusColor(item.wellnessStatus) }]}>
                  {item.overallWellness}
                </Text>
                <Text style={styles.scoreMax}>/10</Text>
              </View>
              <Chip
                mode="flat"
                style={[styles.statusChip, { backgroundColor: getWellnessStatusColor(item.wellnessStatus) }]}
                textStyle={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}
                icon={getWellnessStatusIcon(item.wellnessStatus)}
              >
                {wellnessStatusConfig[item.wellnessStatus]?.emoji} {item.wellnessStatus.toUpperCase()}
              </Chip>
            </View>
          </View>

          {item.alerts.length > 0 && (
            <View style={styles.alertsSection}>
              <View style={styles.alertHeader}>
                <Icon name="warning" size={16} color={COLORS.error} />
                <Text style={styles.alertTitle}>Active Alerts</Text>
              </View>
              <Text style={styles.alertText} numberOfLines={2}>
                {item.alerts[0]}
                {item.alerts.length > 1 && ` (+${item.alerts.length - 1} more)`}
              </Text>
            </View>
          )}

          <View style={styles.metricsPreview}>
            <View style={styles.metricsHeader}>
              <Text style={styles.metricsTitle}>Key Metrics</Text>
              <View style={styles.trendIndicator}>
                <Icon
                  name={getTrendIcon(item.weeklyTrend)}
                  size={16}
                  color={getTrendColor(item.weeklyTrend)}
                />
                <Text style={[styles.trendText, { color: getTrendColor(item.weeklyTrend) }]}>
                  {item.weeklyTrend}
                </Text>
              </View>
            </View>
            
            <View style={styles.metricsGrid}>
              {['sleep', 'energy', 'stress', 'motivation'].map((metric) => {
                const data = item.recentMetrics[metric];
                const metricConfig = wellnessMetrics.find(m => m.key === metric);
                return (
                  <View key={metric} style={styles.metricItem}>
                    <Icon
                      name={metricConfig.icon}
                      size={16}
                      color={getTrendColor(data.trend)}
                    />
                    <Text style={styles.metricValue}>{data.value}</Text>
                    <Text style={styles.metricLabel}>{metricConfig.label}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          <View style={styles.quickActions}>
            <Button
              mode="outlined"
              compact
              onPress={() => handleSendReminder(item)}
              icon="notifications"
              style={styles.actionButton}
            >
              Remind
            </Button>
            <Button
              mode="outlined"
              compact
              onPress={() => handlePlayerPress(item)}
              icon="visibility"
              style={styles.actionButton}
            >
              Details
            </Button>
            {item.wellnessStatus === 'critical' || item.wellnessStatus === 'concerning' ? (
              <Button
                mode="contained"
                compact
                onPress={() => handleScheduleConsultation(item)}
                icon="event"
                buttonColor={COLORS.error}
                style={styles.actionButton}
              >
                Consult
              </Button>
            ) : null}
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
      <Animated.View 
        style={[
          styles.headerContent,
          {
            transform: [
              {
                translateY: scrollY.interpolate({
                  inputRange: [0, 100],
                  outputRange: [0, -20],
                  extrapolate: 'clamp',
                }),
              },
            ],
          }
        ]}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Wellness Assessment 🧠</Text>
            <Text style={styles.headerSubtitle}>
              Monitor player mental & physical wellness
            </Text>
          </View>
          <View style={styles.headerActions}>
            {(criticalCount > 0 || concerningCount > 0) && (
              <View style={styles.urgentBadge}>
                <Icon name="warning" size={16} color="white" />
                <Text style={styles.urgentText}>
                  {criticalCount + concerningCount}
                </Text>
              </View>
            )}
            <IconButton
              icon="add-chart"
              iconColor="white"
              size={24}
              onPress={() => setShowAssessmentForm(true)}
            />
          </View>
        </View>
        
        <View style={styles.summaryStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{avgWellness}</Text>
            <Text style={styles.statLabel}>Avg Wellness</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: criticalCount > 0 ? '#ff6b6b' : 'white' }]}>
              {criticalCount}
            </Text>
            <Text style={styles.statLabel}>Critical</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: concerningCount > 0 ? '#ffa726' : 'white' }]}>
              {concerningCount}
            </Text>
            <Text style={styles.statLabel}>Concerning</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {mockWellnessData.filter(p => p.wellnessStatus === 'excellent').length}
            </Text>
            <Text style={styles.statLabel}>Excellent</Text>
          </View>
        </View>
      </Animated.View>
    </LinearGradient>
  );

  const renderDetailModal = () => (
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
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={styles.modalHeader}>
                    <Avatar.Image
                      size={60}
                      source={{ uri: selectedPlayer.avatar }}
                    />
                    <View style={styles.modalPlayerInfo}>
                      <Text style={styles.modalPlayerName}>
                        {selectedPlayer.playerName}
                      </Text>
                      <Text style={styles.modalPlayerMeta}>
                        {selectedPlayer.position} • {selectedPlayer.team}
                      </Text>
                      <Text style={styles.modalWellnessScore}>
                        Overall: {selectedPlayer.overallWellness}/10 • Streak: {selectedPlayer.assessmentStreak} days
                      </Text>
                    </View>
                    <IconButton
                      icon="close"
                      size={24}
                      onPress={() => setShowModal(false)}
                    />
                  </View>

                  {selectedPlayer.alerts.length > 0 && (
                    <View style={styles.alertsModal}>
                      <Text style={styles.sectionTitle}>🚨 Active Alerts</Text>
                      {selectedPlayer.alerts.map((alert, index) => (
                        <View key={index} style={styles.alertItem}>
                          <Icon name="warning" size={16} color={COLORS.error} />
                          <Text style={styles.alertItemText}>{alert}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  
                  <Text style={styles.sectionTitle}>📊 Detailed Metrics</Text>
                  {wellnessMetrics.map((metric) => {
                    const data = selectedPlayer.recentMetrics[metric.key];
                    const isGoodRange = data.value >= metric.goodRange[0] && data.value <= metric.goodRange[1];
                    return (
                      <Card key={metric.key} style={styles.metricDetailCard}>
                        <Card.Content>
                          <View style={styles.metricDetailHeader}>
                            <View style={styles.metricInfo}>
                              <Icon
                                name={metric.icon}
                                size={24}
                                color={isGoodRange ? COLORS.success : COLORS.error}
                              />
                              <View style={styles.metricTitleContainer}>
                                <Text style={styles.metricDetailName}>{metric.label}</Text>
                                <Text style={styles.metricDetailValue}>
                                  {data.value}{metric.unit}
                                </Text>
                              </View>
                            </View>
                            <View style={styles.metricTrend}>
                              <Icon
                                name={getTrendIcon(data.trend)}
                                size={20}
                                color={getTrendColor(data.trend)}
                              />
                              <Text style={[styles.trendLabel, { color: getTrendColor(data.trend) }]}>
                                {data.trend}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.progressContainer}>
                            <ProgressBar
                              progress={data.value / 10}
                              color={isGoodRange ? COLORS.success : COLORS.error}
                              style={styles.metricProgress}
                            />
                            <Text style={styles.rangeLabel}>
                              Good range: {metric.goodRange[0]}-{metric.goodRange[1]}{metric.unit}
                            </Text>
                          </View>
                          <View style={styles.historyChart}>
                            <Text style={styles.historyLabel}>7-Day History</Text>
                            <View style={styles.chartBars}>
                              {data.history.map((value, index) => (
                                <View key={index} style={styles.chartBar}>
                                  <View
                                    style={[
                                      styles.bar,
                                      {
                                        height: (value / 10) * 40,
                                        backgroundColor: value >= metric.goodRange[0] && value <= metric.goodRange[1] 
                                          ? COLORS.success 
                                          : COLORS.error,
                                      }
                                    ]}
                                  />
                                  <Text style={styles.barLabel}>{index + 1}</Text>
                                </View>
                              ))}
                            </View>
                          </View>
                        </Card.Content>
                      </Card>
                    );
                  })}
                  
                  <View style={styles.recommendationsSection}>
                    <Text style={styles.sectionTitle}>💡 Recommendations</Text>
                    {selectedPlayer.recommendations.map((rec, index) => (
                      <View key={index} style={styles.recommendationItem}>
                        <Icon 
                          name="lightbulb" 
                          size={16} 
                          color={COLORS.warning} 
                        />
                        <Text style={styles.recommendationText}>{rec}</Text>
                      </View>
                    ))}
                  </View>
                  
                  <View style={styles.modalActions}>
                    <Button
                      mode="contained"
                      onPress={() => {
                        setShowModal(false);
                        handleSendReminder(selectedPlayer);
                      }}
                      style={styles.modalActionButton}
                      icon="notifications"
                    >
                      Send Reminder
                    </Button>
                    <Button
                      mode="outlined"
                      onPress={() => {
                        setShowModal(false);
                        handleScheduleConsultation(selectedPlayer);
                      }}
                      style={styles.modalActionButton}
                      icon="event"
                    >
                      Schedule Consultation
                    </Button>
                  </View>
                </ScrollView>
              </Card.Content>
            </Card>
          </View>
        )}
      </Modal>
    </Portal>
  );

  const renderAssessmentForm = () => (
    <Portal>
      <Modal
        visible={showAssessmentForm}
        onDismiss={() => setShowAssessmentForm(false)}
        contentContainerStyle={styles.modalContent}
      >
        <View style={styles.modalContainer}>
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="light"
            blurAmount={10}
          />
          <Card style={styles.detailCard}>
            <Card.Content>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.formHeader}>
                  <Text style={styles.formTitle}>New Assessment 📝</Text>
                  <IconButton
                    icon="close"
                    size={24}
                    onPress={() => setShowAssessmentForm(false)}
                  />
                </View>

                <View style={styles.playerSelector}>
                  <Text style={styles.sectionTitle}>Select Player</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {mockWellnessData.map((player) => (
                      <TouchableOpacity
                        key={player.id}
                        style={[
                          styles.playerSelectItem,
                          selectedPlayer?.id === player.id && styles.playerSelectItemActive
                        ]}
                        onPress={() => setSelectedPlayer(player)}
                      >
                        <Avatar.Image
                          size={40}
                          source={{ uri: player.avatar }}
                        />
                        <Text style={styles.playerSelectName}>{player.playerName.split(' ')[0]}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.assessmentMetrics}>
                  <Text style={styles.sectionTitle}>Assessment Metrics</Text>
                  {wellnessMetrics.map((metric) => (
                    <View key={metric.key} style={styles.metricInput}>
                      <View style={styles.metricInputHeader}>
                        <Icon name={metric.icon} size={20} color={COLORS.primary} />
                        <Text style={styles.metricInputLabel}>{metric.label}</Text>
                        <Text style={styles.metricInputValue}>
                          {newAssessment[metric.key]}{metric.unit}
                        </Text>
                      </View>
                      <View style={styles.sliderContainer}>
                        <Text style={styles.sliderLabel}>1</Text>
                        <View style={styles.sliderTrack}>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                            <TouchableOpacity
                              key={value}
                              style={[
                                styles.sliderDot,
                                newAssessment[metric.key] >= value && styles.sliderDotActive
                              ]}
                              onPress={() => setNewAssessment(prev => ({ ...prev, [metric.key]: value }))}
                            />
                          ))}
                        </View>
                        <Text style={styles.sliderLabel}>10</Text>
                      </View>
                      <Text style={styles.metricHint}>
                        Good range: {metric.goodRange[0]}-{metric.goodRange[1]}
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={styles.notesSection}>
                  <Text style={styles.sectionTitle}>Additional Notes</Text>
                  <TextInput
                    mode="outlined"
                    placeholder="Any additional observations or notes..."
                    value={newAssessment.notes}
                    onChangeText={(text) => setNewAssessment(prev => ({ ...prev, notes: text }))}
                    multiline
                    numberOfLines={4}
                    style={styles.notesInput}
                  />
                </View>

                <View style={styles.formActions}>
                  <Button
                    mode="outlined"
                    onPress={() => setShowAssessmentForm(false)}
                    style={styles.formActionButton}
                  >
                    Cancel
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => {
                      Vibration.vibrate(100);
                      Alert.alert(
                        'Assessment Saved',
                        `Wellness assessment saved for ${selectedPlayer?.playerName || 'selected player'} ✅`,
                        [{ text: 'OK', onPress: () => setShowAssessmentForm(false) }]
                      );
                    }}
                    style={styles.formActionButton}
                    icon="save"
                    disabled={!selectedPlayer}
                  >
                    Save Assessment
                  </Button>
                </View>
              </ScrollView>
            </Card.Content>
          </Card>
        </View>
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

      <Animated.ScrollView
        style={styles.content}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
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
          renderItem={renderWellnessCard}
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
          scrollEnabled={false}
        />
      </Animated.ScrollView>

      <FAB
        icon="assessment"
        style={styles.fab}
        onPress={() => {
          Vibration.vibrate(50);
          Alert.alert(
            'Wellness Analytics',
            'Advanced wellness analytics dashboard coming soon! 📊\n\n• Team wellness trends\n• Predictive insights\n• Performance correlations',
            [{ text: 'Exciting!' }]
          );
        }}
      />

      {renderDetailModal()}
      {renderAssessmentForm()}
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
  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error,
    borderRadius: 12,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    marginRight: SPACING.sm,
  },
  urgentText: {
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
  wellnessCard: {
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
  concerningCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
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
  alertBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
  streakBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
  },
  playerDetails: {
    flex: 1,
  },
  playerName: {
    ...TEXT_STYLES.h4,
    fontWeight: 'bold',
  },
  playerPosition: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  lastAssessment: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  statusIndicator: {
    alignItems: 'center',
  },
  wellnessScore: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING.xs,
  },
  scoreNumber: {
    ...TEXT_STYLES.h2,
    fontWeight: 'bold',
  },
  scoreMax: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  statusChip: {
    borderRadius: 12,
  },
  alertsSection: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderRadius: 8,
    padding: SPACING.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.error,
    marginBottom: SPACING.md,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  alertTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.error,
    marginLeft: SPACING.sm,
  },
  alertText: {
    ...TEXT_STYLES.caption,
    color: COLORS.error,
  },
  metricsPreview: {
    marginBottom: SPACING.md,
  },
  metricsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  metricsTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    marginLeft: SPACING.xs,
    textTransform: 'capitalize',
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: SPACING.sm,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    ...TEXT_STYLES.h4,
    fontWeight: 'bold',
    marginVertical: SPACING.xs,
  },
  metricLabel: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    color: COLORS.textSecondary,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.sm,
  },
  actionButton: {
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
    maxHeight: '90%',
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
  modalPlayerMeta: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  modalWellnessScore: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    marginTop: SPACING.xs,
    fontWeight: '600',
  },
  alertsModal: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  alertItemText: {
    ...TEXT_STYLES.caption,
    color: COLORS.error,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  sectionTitle: {
    ...TEXT_STYLES.h4,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
    color: COLORS.textPrimary,
  },
  metricDetailCard: {
    marginBottom: SPACING.md,
    elevation: 1,
  },
  metricDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  metricInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  metricTitleContainer: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  metricDetailName: {
    ...TEXT_STYLES.h4,
    fontWeight: 'bold',
  },
  metricDetailValue: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    fontWeight: '600',
  },
  metricTrend: {
    alignItems: 'center',
  },
  trendLabel: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  progressContainer: {
    marginBottom: SPACING.md,
  },
  metricProgress: {
    height: 6,
    borderRadius: 3,
    marginBottom: SPACING.sm,
  },
  rangeLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  historyChart: {
    marginTop: SPACING.sm,
  },
  historyLabel: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 50,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 8,
    borderRadius: 4,
    marginBottom: SPACING.xs,
  },
  barLabel: {
    ...TEXT_STYLES.caption,
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  recommendationsSection: {
    marginTop: SPACING.lg,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    padding: SPACING.sm,
    borderRadius: 8,
  },
  recommendationText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.sm,
    flex: 1,
    color: COLORS.textPrimary,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.lg,
  },
  modalActionButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  formTitle: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
  },
  playerSelector: {
    marginBottom: SPACING.lg,
  },
  playerSelectItem: {
    alignItems: 'center',
    marginRight: SPACING.md,
    padding: SPACING.sm,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  playerSelectItemActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
  },
  playerSelectName: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  assessmentMetrics: {
    marginBottom: SPACING.lg,
  },
  metricInput: {
    marginBottom: SPACING.lg,
  },
  metricInputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  metricInputLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    flex: 1,
    marginLeft: SPACING.sm,
  },
  metricInputValue: {
    ...TEXT_STYLES.h4,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sliderLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    width: 20,
    textAlign: 'center',
  },
  sliderTrack: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: SPACING.md,
  },
  sliderDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.textSecondary,
  },
  sliderDotActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  metricHint: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  notesSection: {
    marginBottom: SPACING.lg,
  },
  notesInput: {
    backgroundColor: 'white',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  formActionButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
});

export default WellnessAssessment;