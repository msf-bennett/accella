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
  Divider,
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

const SupplementTracking = ({ navigation }) => {
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const warningPulse = useRef(new Animated.Value(1)).current;
  
  // Redux state
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { players, loading } = useSelector(state => state.players);
  const { supplementData, alerts } = useSelector(state => state.wellness);
  
  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showAddSupplement, setShowAddSupplement] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');

  // memoization for expensive renders
  const MemoizedSupplementCard = React.memo(renderSupplementCard);

  // Mock supplement data
  const mockSupplementData = [
    {
      id: '1',
      playerName: 'Alex Johnson',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      totalSupplements: 5,
      complianceRate: 92,
      lastTaken: '2 hours ago',
      riskLevel: 'low',
      supplements: [
        {
          id: 's1',
          name: 'Whey Protein',
          dosage: '30g',
          frequency: '2x daily',
          timing: ['Post-workout', 'Before bed'],
          compliance: 95,
          category: 'protein',
          status: 'taken',
          lastTaken: '2 hours ago',
          sideEffects: [],
          approved: true,
        },
        {
          id: 's2',
          name: 'Creatine Monohydrate',
          dosage: '5g',
          frequency: 'Daily',
          timing: ['Pre-workout'],
          compliance: 88,
          category: 'performance',
          status: 'taken',
          lastTaken: '4 hours ago',
          sideEffects: [],
          approved: true,
        },
        {
          id: 's3',
          name: 'Omega-3 Fish Oil',
          dosage: '1000mg',
          frequency: '2x daily',
          timing: ['Breakfast', 'Dinner'],
          compliance: 94,
          category: 'health',
          status: 'missed',
          lastTaken: '1 day ago',
          sideEffects: [],
          approved: true,
        },
      ],
      weeklyIntake: [95, 88, 92, 96, 90, 94, 92],
      alerts: [],
      nutritionist: 'Dr. Sarah Wilson',
    },
    {
      id: '2',
      playerName: 'Sarah Chen',
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
      totalSupplements: 7,
      complianceRate: 76,
      lastTaken: '6 hours ago',
      riskLevel: 'medium',
      supplements: [
        {
          id: 's4',
          name: 'Pre-Workout Complex',
          dosage: '1 scoop',
          frequency: 'As needed',
          timing: ['30min before training'],
          compliance: 82,
          category: 'performance',
          status: 'taken',
          lastTaken: '6 hours ago',
          sideEffects: ['Jitters', 'Sleep issues'],
          approved: true,
        },
        {
          id: 's5',
          name: 'Iron Supplement',
          dosage: '65mg',
          frequency: 'Daily',
          timing: ['Morning'],
          compliance: 68,
          category: 'health',
          status: 'missed',
          lastTaken: '2 days ago',
          sideEffects: ['Nausea'],
          approved: true,
        },
        {
          id: 's6',
          name: 'Vitamin D3',
          dosage: '2000 IU',
          frequency: 'Daily',
          timing: ['Morning'],
          compliance: 78,
          category: 'vitamin',
          status: 'overdue',
          lastTaken: '1 day ago',
          sideEffects: [],
          approved: true,
        },
      ],
      weeklyIntake: [82, 68, 75, 80, 72, 78, 76],
      alerts: ['Low iron compliance', 'Caffeine sensitivity reported'],
      nutritionist: 'Dr. Mark Rodriguez',
    },
    {
      id: '3',
      playerName: 'Marcus Williams',
      avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
      totalSupplements: 3,
      complianceRate: 98,
      lastTaken: '1 hour ago',
      riskLevel: 'low',
      supplements: [
        {
          id: 's7',
          name: 'Multivitamin',
          dosage: '1 tablet',
          frequency: 'Daily',
          timing: ['Morning'],
          compliance: 97,
          category: 'vitamin',
          status: 'taken',
          lastTaken: '1 hour ago',
          sideEffects: [],
          approved: true,
        },
        {
          id: 's8',
          name: 'Magnesium',
          dosage: '400mg',
          frequency: 'Daily',
          timing: ['Before bed'],
          compliance: 99,
          category: 'mineral',
          status: 'scheduled',
          lastTaken: '20 hours ago',
          sideEffects: [],
          approved: true,
        },
      ],
      weeklyIntake: [97, 99, 98, 97, 100, 98, 98],
      alerts: [],
      nutritionist: 'Dr. Sarah Wilson',
    },
    {
      id: '4',
      playerName: 'Emma Davis',
      avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
      totalSupplements: 8,
      complianceRate: 58,
      lastTaken: '12 hours ago',
      riskLevel: 'high',
      supplements: [
        {
          id: 's9',
          name: 'BCAA Complex',
          dosage: '10g',
          frequency: '3x daily',
          timing: ['Pre-workout', 'Intra-workout', 'Post-workout'],
          compliance: 45,
          category: 'performance',
          status: 'missed',
          lastTaken: '2 days ago',
          sideEffects: [],
          approved: true,
        },
        {
          id: 's10',
          name: 'Testosterone Booster',
          dosage: '2 capsules',
          frequency: 'Daily',
          timing: ['Morning'],
          compliance: 72,
          category: 'hormone',
          status: 'flagged',
          lastTaken: '12 hours ago',
          sideEffects: ['Mood swings', 'Acne'],
          approved: false,
        },
      ],
      weeklyIntake: [72, 45, 52, 68, 55, 62, 58],
      alerts: ['Unapproved supplement detected', 'Poor compliance', 'Side effects reported'],
      nutritionist: 'Pending assignment',
    },
  ];

  const supplementCategories = [
    { key: 'protein', label: 'Protein', color: COLORS.success, icon: 'fitness-center' },
    { key: 'performance', label: 'Performance', color: COLORS.primary, icon: 'flash-on' },
    { key: 'vitamin', label: 'Vitamins', color: COLORS.warning, icon: 'local-pharmacy' },
    { key: 'mineral', label: 'Minerals', color: COLORS.accent, icon: 'scatter-plot' },
    { key: 'health', label: 'Health', color: COLORS.info, icon: 'favorite' },
    { key: 'hormone', label: 'Hormonal', color: COLORS.error, icon: 'warning' },
  ];

  const timeframes = [
    { key: 'day', label: 'Today', icon: 'today' },
    { key: 'week', label: 'Week', icon: 'date-range' },
    { key: 'month', label: 'Month', icon: 'calendar-view-month' },
  ];

  const filterTypes = [
    { key: 'all', label: 'All Players', color: COLORS.primary },
    { key: 'high-risk', label: 'High Risk', color: COLORS.error },
    { key: 'low-compliance', label: 'Low Compliance', color: COLORS.warning },
    { key: 'flagged', label: 'Flagged', color: COLORS.error },
    { key: 'compliant', label: 'Compliant', color: COLORS.success },
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
          toValue: 1.05,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(warningPulse, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    loadSupplementData();
  }, []);

  const loadSupplementData = useCallback(async () => {
    try {
      console.log('Loading supplement tracking data...');
    } catch (error) {
      Alert.alert('Error', 'Failed to load supplement data');
    }
  }, [selectedTimeframe]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSupplementData();
    setRefreshing(false);
  }, [loadSupplementData]);

  const getRiskColor = (level) => {
    switch (level) {
      case 'high': return COLORS.error;
      case 'medium': return COLORS.warning;
      case 'low': return COLORS.success;
      default: return COLORS.textSecondary;
    }
  };

  const getComplianceColor = (rate) => {
    if (rate >= 90) return COLORS.success;
    if (rate >= 70) return COLORS.warning;
    return COLORS.error;
  };

  const getSupplementStatusColor = (status) => {
    switch (status) {
      case 'taken': return COLORS.success;
      case 'scheduled': return COLORS.primary;
      case 'missed': return COLORS.warning;
      case 'overdue': return COLORS.error;
      case 'flagged': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const getSupplementStatusIcon = (status) => {
    switch (status) {
      case 'taken': return 'check-circle';
      case 'scheduled': return 'schedule';
      case 'missed': return 'error';
      case 'overdue': return 'warning';
      case 'flagged': return 'flag';
      default: return 'help';
    }
  };

  const getCategoryIcon = (category) => {
    const cat = supplementCategories.find(c => c.key === category);
    return cat ? cat.icon : 'help';
  };

  const getCategoryColor = (category) => {
    const cat = supplementCategories.find(c => c.key === category);
    return cat ? cat.color : COLORS.textSecondary;
  };

  const handlePlayerPress = (player) => {
    setSelectedPlayer(player);
    setShowModal(true);
  };

  const handleSupplementAction = (player, supplement, action) => {
    const actionMessages = {
      approve: `${supplement.name} approved for ${player.playerName}`,
      flag: `${supplement.name} flagged for review`,
      remove: `${supplement.name} removed from ${player.playerName}'s regimen`,
      reminder: `Reminder sent to ${player.playerName} for ${supplement.name}`,
    };

    Alert.alert('Action Completed', actionMessages[action]);
    setShowModal(false);
  };

  const filteredPlayers = mockSupplementData.filter(player => {
    const matchesSearch = player.playerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = () => {
      switch (filterType) {
        case 'high-risk':
          return player.riskLevel === 'high';
        case 'low-compliance':
          return player.complianceRate < 70;
        case 'flagged':
          return player.alerts.length > 0;
        case 'compliant':
          return player.complianceRate >= 90;
        default:
          return true;
      }
    };
    return matchesSearch && matchesFilter();
  });

  const totalAlerts = mockSupplementData.reduce((sum, player) => sum + player.alerts.length, 0);
  const avgCompliance = Math.round(
    mockSupplementData.reduce((sum, player) => sum + player.complianceRate, 0) / mockSupplementData.length
  );

  const renderSupplementCard = ({ item }) => (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
        item.riskLevel === 'high' && {
          transform: [{ scale: warningPulse }],
        },
      ]}
    >
      <Card 
        style={[
          styles.supplementCard,
          item.riskLevel === 'high' && styles.highRiskCard,
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
              </View>
              <View style={styles.playerDetails}>
                <Text style={styles.playerName}>{item.playerName}</Text>
                <Text style={styles.lastTaken}>
                  <Icon name="schedule" size={12} color={COLORS.textSecondary} />
                  {' '}Last taken: {item.lastTaken}
                </Text>
                <Text style={styles.nutritionist}>
                  <Icon name="person" size={12} color={COLORS.textSecondary} />
                  {' '}{item.nutritionist}
                </Text>
              </View>
            </View>
            <View style={styles.riskIndicator}>
              <Chip
                mode="flat"
                style={[styles.riskChip, { backgroundColor: getRiskColor(item.riskLevel) }]}
                textStyle={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}
              >
                {item.riskLevel.toUpperCase()} RISK
              </Chip>
            </View>
          </View>

          <View style={styles.complianceSection}>
            <View style={styles.complianceHeader}>
              <Text style={styles.complianceLabel}>Compliance Rate</Text>
              <Text style={[styles.complianceRate, { color: getComplianceColor(item.complianceRate) }]}>
                {item.complianceRate}%
              </Text>
            </View>
            <ProgressBar
              progress={item.complianceRate / 100}
              color={getComplianceColor(item.complianceRate)}
              style={styles.complianceBar}
            />
          </View>

          <View style={styles.supplementsOverview}>
            <View style={styles.overviewHeader}>
              <Text style={styles.overviewTitle}>
                Supplements ({item.totalSupplements})
              </Text>
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => handlePlayerPress(item)}
              >
                <Text style={styles.viewAllText}>View All</Text>
                <Icon name="arrow-forward-ios" size={12} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.supplementsList}
            >
              {item.supplements.slice(0, 3).map((supplement) => (
                <View key={supplement.id} style={styles.supplementPreview}>
                  <Icon
                    name={getCategoryIcon(supplement.category)}
                    size={16}
                    color={getCategoryColor(supplement.category)}
                  />
                  <Text style={styles.supplementName} numberOfLines={1}>
                    {supplement.name}
                  </Text>
                  <Icon
                    name={getSupplementStatusIcon(supplement.status)}
                    size={12}
                    color={getSupplementStatusColor(supplement.status)}
                  />
                </View>
              ))}
              {item.totalSupplements > 3 && (
                <View style={styles.supplementPreview}>
                  <Text style={styles.moreSupplements}>
                    +{item.totalSupplements - 3}
                  </Text>
                </View>
              )}
            </ScrollView>
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
            <Text style={styles.headerTitle}>Supplement Tracking 💊</Text>
            <Text style={styles.headerSubtitle}>
              Monitor nutrition & safety compliance
            </Text>
          </View>
          <View style={styles.headerActions}>
            {totalAlerts > 0 && (
              <View style={styles.alertBadgeHeader}>
                <Icon name="warning" size={16} color="white" />
                <Text style={styles.alertTextHeader}>{totalAlerts}</Text>
              </View>
            )}
            <IconButton
              icon="add"
              iconColor="white"
              size={24}
              onPress={() => {
                Alert.alert(
                  'Add Supplement',
                  'Supplement addition feature coming soon! 🚀',
                  [{ text: 'OK' }]
                );
              }}
            />
          </View>
        </View>
        
        <View style={styles.summaryStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {mockSupplementData.reduce((sum, player) => sum + player.totalSupplements, 0)}
            </Text>
            <Text style={styles.statLabel}>Total Supplements</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {avgCompliance}%
            </Text>
            <Text style={styles.statLabel}>Avg Compliance</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {mockSupplementData.filter(p => p.riskLevel === 'high').length}
            </Text>
            <Text style={styles.statLabel}>High Risk</Text>
          </View>
        </View>
      </View>
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
                      <Text style={styles.modalCompliance}>
                        Compliance: {selectedPlayer.complianceRate}% • Risk: {selectedPlayer.riskLevel}
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
                  
                  <Text style={styles.sectionTitle}>Current Supplements</Text>
                  {selectedPlayer.supplements.map((supplement) => (
                    <Card key={supplement.id} style={styles.supplementDetailCard}>
                      <Card.Content>
                        <View style={styles.supplementDetailHeader}>
                          <View style={styles.supplementInfo}>
                            <View style={styles.supplementTitleRow}>
                              <Icon
                                name={getCategoryIcon(supplement.category)}
                                size={20}
                                color={getCategoryColor(supplement.category)}
                              />
                              <Text style={styles.supplementDetailName}>
                                {supplement.name}
                              </Text>
                              {!supplement.approved && (
                                <Chip
                                  mode="flat"
                                  style={styles.unapprovedChip}
                                  textStyle={{ color: 'white', fontSize: 10 }}
                                >
                                  UNAPPROVED
                                </Chip>
                              )}
                            </View>
                            <Text style={styles.supplementDosage}>
                              {supplement.dosage} • {supplement.frequency}
                            </Text>
                            <Text style={styles.supplementTiming}>
                              Timing: {supplement.timing.join(', ')}
                            </Text>
                          </View>
                          <View style={styles.supplementStatus}>
                            <Icon
                              name={getSupplementStatusIcon(supplement.status)}
                              size={24}
                              color={getSupplementStatusColor(supplement.status)}
                            />
                            <Text style={[styles.statusText, { color: getSupplementStatusColor(supplement.status) }]}>
                              {supplement.status.toUpperCase()}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.complianceDetail}>
                          <Text style={styles.complianceDetailLabel}>
                            Compliance: {supplement.compliance}%
                          </Text>
                          <ProgressBar
                            progress={supplement.compliance / 100}
                            color={getComplianceColor(supplement.compliance)}
                            style={styles.complianceDetailBar}
                          />
                        </View>

                        {supplement.sideEffects.length > 0 && (
                          <View style={styles.sideEffectsSection}>
                            <Text style={styles.sideEffectsLabel}>⚠️ Reported Side Effects:</Text>
                            <View style={styles.sideEffectsContainer}>
                              {supplement.sideEffects.map((effect, index) => (
                                <Chip
                                  key={index}
                                  mode="outlined"
                                  style={styles.sideEffectChip}
                                  textStyle={{ color: COLORS.error }}
                                >
                                  {effect}
                                </Chip>
                              ))}
                            </View>
                          </View>
                        )}

                        <View style={styles.supplementActions}>
                          {!supplement.approved && (
                            <Button
                              mode="outlined"
                              compact
                              onPress={() => handleSupplementAction(selectedPlayer, supplement, 'approve')}
                              icon="check"
                              buttonColor={COLORS.success}
                              textColor="white"
                            >
                              Approve
                            </Button>
                          )}
                          <Button
                            mode="outlined"
                            compact
                            onPress={() => handleSupplementAction(selectedPlayer, supplement, 'reminder')}
                            icon="notifications"
                          >
                            Remind
                          </Button>
                          <Button
                            mode="outlined"
                            compact
                            onPress={() => handleSupplementAction(selectedPlayer, supplement, 'flag')}
                            icon="flag"
                            textColor={COLORS.error}
                          >
                            Flag
                          </Button>
                        </View>
                      </Card.Content>
                    </Card>
                  ))}
                  
                  <View style={styles.modalActions}>
                    <Button
                      mode="contained"
                      onPress={() => {
                        setShowModal(false);
                        Alert.alert(
                          'Consultation Scheduled',
                          `Nutritionist consultation scheduled with ${selectedPlayer.nutritionist}`
                        );
                      }}
                      style={styles.consultationButton}
                      icon="person"
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
          renderItem={renderSupplementCard}
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
        icon="local-pharmacy"
        style={styles.fab}
        onPress={() => {
          Alert.alert(
            'Supplement Analytics',
            'Advanced supplement analytics dashboard coming soon! 📊',
            [{ text: 'Got it!' }]
          );
        }}
      />

      {renderDetailModal()}
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
  alertBadgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error,
    borderRadius: 12,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    marginRight: SPACING.sm,
  },
  alertTextHeader: {
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
  supplementCard: {
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  highRiskCard: {
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
  alertBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
  playerDetails: {
    flex: 1,
  },
  playerName: {
    ...TEXT_STYLES.h4,
    fontWeight: 'bold',
  },
  lastTaken: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  nutritionist: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  riskIndicator: {
    alignItems: 'center',
  },
  riskChip: {
    borderRadius: 12,
  },
  complianceSection: {
    marginBottom: SPACING.md,
  },
  complianceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  complianceLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
  },
  complianceRate: {
    ...TEXT_STYLES.h4,
    fontWeight: 'bold',
  },
  complianceBar: {
    height: 6,
    borderRadius: 3,
  },
  supplementsOverview: {
    marginBottom: SPACING.md,
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  overviewTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: '600',
    marginRight: SPACING.xs,
  },
  supplementsList: {
    maxHeight: 80,
  },
  supplementPreview: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: SPACING.sm,
    marginRight: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    maxWidth: 80,
  },
  supplementName: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    marginVertical: SPACING.xs,
  },
  moreSupplements: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  alertsSection: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderRadius: 8,
    padding: SPACING.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.error,
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
  modalCompliance: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
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
  supplementDetailCard: {
    marginBottom: SPACING.md,
    elevation: 1,
  },
  supplementDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  supplementInfo: {
    flex: 1,
  },
  supplementTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  supplementDetailName: {
    ...TEXT_STYLES.h4,
    fontWeight: 'bold',
    marginLeft: SPACING.sm,
    flex: 1,
  },
  unapprovedChip: {
    backgroundColor: COLORS.error,
    borderRadius: 8,
  },
  supplementDosage: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  supplementTiming: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  supplementStatus: {
    alignItems: 'center',
  },
  statusText: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    marginTop: SPACING.xs,
  },
  complianceDetail: {
    marginBottom: SPACING.md,
  },
  complianceDetailLabel: {
    ...TEXT_STYLES.body,
    marginBottom: SPACING.sm,
  },
  complianceDetailBar: {
    height: 4,
    borderRadius: 2,
  },
  sideEffectsSection: {
    marginBottom: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: 'rgba(244, 67, 54, 0.05)',
    borderRadius: 6,
  },
  sideEffectsLabel: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    color: COLORS.error,
    marginBottom: SPACING.sm,
  },
  sideEffectsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sideEffectChip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
    borderColor: COLORS.error,
  },
  supplementActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.sm,
  },
  modalActions: {
    marginTop: SPACING.lg,
  },
  consultationButton: {
    marginTop: SPACING.sm,
  },
});

export default SupplementTracking;