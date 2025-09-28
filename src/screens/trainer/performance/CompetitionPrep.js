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
  List,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LineChart, AreaChart, BarChart, ProgressChart } from 'react-native-chart-kit';

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
  competition: '#9C27B0',
  peak: '#FF6F00',
  taper: '#00BCD4',
  recovery: '#4CAF50',
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
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

const CompetitionPrep = ({ navigation }) => {
  // Redux state
  const dispatch = useDispatch();
  const { user, athletes, competitions } = useSelector(state => ({
    user: state.auth.user,
    athletes: state.athletes.list,
    competitions: state.competitions.data,
  }));

  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [selectedPhase, setSelectedPhase] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [competitionModalVisible, setCompetitionModalVisible] = useState(false);
  const [animatedValue] = useState(new Animated.Value(0));
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  // Mock competition data
  const [mockAthletes] = useState([
    {
      id: '1',
      name: 'Emma Thompson',
      avatar: null,
      sport: 'Track & Field',
      event: '100m Sprint',
      level: 'Elite',
      nextCompetition: {
        name: 'National Championships',
        date: '2024-09-15',
        daysLeft: 45,
        priority: 'high',
      },
      currentPhase: 'peak',
      peakingScore: 92,
      readinessScore: 88,
      personalBest: '10.85s',
      seasonBest: '10.92s',
      targetTime: '10.80s',
      completionRate: 94,
      trainingLoad: 'optimal',
      recoveryStatus: 'good',
      confidence: 85,
    },
    {
      id: '2',
      name: 'Marcus Rodriguez',
      avatar: null,
      sport: 'Swimming',
      event: '200m Freestyle',
      level: 'Professional',
      nextCompetition: {
        name: 'Regional Meet',
        date: '2024-08-28',
        daysLeft: 28,
        priority: 'medium',
      },
      currentPhase: 'taper',
      peakingScore: 85,
      readinessScore: 91,
      personalBest: '1:45.32',
      seasonBest: '1:46.15',
      targetTime: '1:44.50',
      completionRate: 89,
      trainingLoad: 'reduced',
      recoveryStatus: 'excellent',
      confidence: 78,
    },
    {
      id: '3',
      name: 'Sarah Chen',
      avatar: null,
      sport: 'Weightlifting',
      event: 'Clean & Jerk',
      level: 'International',
      nextCompetition: {
        name: 'World Championships',
        date: '2024-10-02',
        daysLeft: 62,
        priority: 'high',
      },
      currentPhase: 'build',
      peakingScore: 78,
      readinessScore: 82,
      personalBest: '145kg',
      seasonBest: '142kg',
      targetWeight: '150kg',
      completionRate: 96,
      trainingLoad: 'high',
      recoveryStatus: 'fair',
      confidence: 90,
    },
  ]);

  const [preparationPhases] = useState({
    all: { name: 'All Phases', color: COLORS.primary, icon: 'view-list' },
    base: { name: 'Base Building', color: COLORS.info, icon: 'fitness-center' },
    build: { name: 'Build Phase', color: COLORS.warning, icon: 'trending-up' },
    peak: { name: 'Peak Phase', color: COLORS.peak, icon: 'star' },
    taper: { name: 'Taper Phase', color: COLORS.taper, icon: 'restore' },
    competition: { name: 'Competition', color: COLORS.competition, icon: 'jump-rope' },
    recovery: { name: 'Recovery', color: COLORS.recovery, icon: 'spa' },
  });

  const [performanceMetrics] = useState({
    peaking: {
      title: 'Peaking Timeline',
      data: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
        datasets: [
          {
            data: [72, 78, 84, 88, 92, 95],
            color: (opacity = 1) => `rgba(156, 39, 176, ${opacity})`,
            strokeWidth: 4,
          },
        ],
      },
      unit: '%',
      icon: 'timeline',
      color: COLORS.competition,
    },
    readiness: {
      title: 'Competition Readiness',
      data: {
        labels: ['Physical', 'Technical', 'Tactical', 'Mental'],
        data: [0.88, 0.92, 0.85, 0.79],
      },
      unit: '%',
      icon: 'radar',
      color: COLORS.success,
    },
    training: {
      title: 'Training Load Management',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            data: [85, 92, 78, 88, 95, 65, 45],
            color: (opacity = 1) => `rgba(255, 111, 0, ${opacity})`,
            strokeWidth: 3,
          },
        ],
      },
      unit: 'TSS',
      icon: 'show-chart',
      color: COLORS.peak,
    },
  });

  // Competition countdown animation
  useEffect(() => {
    const createPulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1000,
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
      duration: 1200,
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

  // Filter athletes based on search and phase
  const filteredAthletes = mockAthletes.filter(athlete => {
    const matchesSearch = athlete.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         athlete.sport.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         athlete.event.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPhase = selectedPhase === 'all' || athlete.currentPhase === selectedPhase;
    return matchesSearch && matchesPhase;
  });

  const getPhaseColor = (phase) => {
    return preparationPhases[phase]?.color || COLORS.primary;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return COLORS.error;
      case 'medium': return COLORS.warning;
      case 'low': return COLORS.success;
      default: return COLORS.primary;
    }
  };

  const getTrainingLoadColor = (load) => {
    switch (load) {
      case 'high': return COLORS.error;
      case 'optimal': return COLORS.success;
      case 'reduced': return COLORS.info;
      default: return COLORS.primary;
    }
  };

  const getDaysLeftColor = (days) => {
    if (days <= 14) return COLORS.error;
    if (days <= 30) return COLORS.warning;
    return COLORS.success;
  };

  const renderAthleteCard = (athlete) => (
    <Card key={athlete.id} style={styles.athleteCard} elevation={4}>
      <TouchableOpacity
        onPress={() => {
          setSelectedAthlete(athlete);
          setModalVisible(true);
          Vibration.vibrate(50);
        }}
        activeOpacity={0.8}
      >
        <Card.Content style={styles.athleteCardContent}>
          <View style={styles.athleteHeader}>
            <View style={styles.avatarContainer}>
              <Avatar.Text
                size={65}
                label={athlete.name.split(' ').map(n => n[0]).join('')}
                style={{ backgroundColor: getPhaseColor(athlete.currentPhase) }}
              />
              <Badge
                visible
                style={[styles.phaseBadge, { backgroundColor: getPriorityColor(athlete.nextCompetition.priority) }]}
              >
                {athlete.nextCompetition.priority.toUpperCase()}
              </Badge>
            </View>
            
            <View style={styles.athleteInfo}>
              <Text style={[TEXT_STYLES.h3, { color: COLORS.text }]}>
                {athlete.name}
              </Text>
              <Text style={[TEXT_STYLES.caption, { fontWeight: 'bold' }]}>
                {athlete.sport} • {athlete.event}
              </Text>
              <Text style={TEXT_STYLES.caption}>
                {athlete.level}
              </Text>
              <View style={styles.phaseRow}>
                <Chip
                  icon={preparationPhases[athlete.currentPhase]?.icon}
                  mode="outlined"
                  compact
                  style={[styles.phaseChip, { borderColor: getPhaseColor(athlete.currentPhase) }]}
                  textStyle={{ color: getPhaseColor(athlete.currentPhase), fontSize: 10 }}
                >
                  {preparationPhases[athlete.currentPhase]?.name}
                </Chip>
              </View>
            </View>

            <View style={styles.countdownContainer}>
              <Animated.View
                style={[
                  styles.countdownCircle,
                  { 
                    backgroundColor: getDaysLeftColor(athlete.nextCompetition.daysLeft),
                    transform: [{ scale: pulseAnimation }]
                  }
                ]}
              >
                <Text style={[TEXT_STYLES.h2, { color: COLORS.white, fontWeight: 'bold' }]}>
                  {athlete.nextCompetition.daysLeft}
                </Text>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.white }]}>
                  days
                </Text>
              </Animated.View>
            </View>
          </View>

          <View style={styles.competitionInfo}>
            <View style={styles.competitionRow}>
              <Icon name="jump-rope" size={20} color={COLORS.competition} />
              <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.sm, fontWeight: 'bold' }]}>
                {athlete.nextCompetition.name}
              </Text>
            </View>
            <Text style={[TEXT_STYLES.caption, { marginLeft: 28 }]}>
              {new Date(athlete.nextCompetition.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </View>

          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.competition }]}>
                Peaking
              </Text>
              <Text style={[TEXT_STYLES.h3, { color: COLORS.competition }]}>
                {athlete.peakingScore}%
              </Text>
              <ProgressBar
                progress={athlete.peakingScore / 100}
                color={COLORS.competition}
                style={styles.miniProgressBar}
              />
            </View>
            
            <View style={styles.metricItem}>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.success }]}>
                Readiness
              </Text>
              <Text style={[TEXT_STYLES.h3, { color: COLORS.success }]}>
                {athlete.readinessScore}%
              </Text>
              <ProgressBar
                progress={athlete.readinessScore / 100}
                color={COLORS.success}
                style={styles.miniProgressBar}
              />
            </View>
            
            <View style={styles.metricItem}>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.info }]}>
                Confidence
              </Text>
              <Text style={[TEXT_STYLES.h3, { color: COLORS.info }]}>
                {athlete.confidence}%
              </Text>
              <ProgressBar
                progress={athlete.confidence / 100}
                color={COLORS.info}
                style={styles.miniProgressBar}
              />
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.performanceSection}>
            <View style={styles.performanceRow}>
              <View style={styles.performanceItem}>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                  Personal Best
                </Text>
                <Text style={[TEXT_STYLES.body, { fontWeight: 'bold', color: COLORS.gold }]}>
                  {athlete.personalBest}
                </Text>
              </View>
              
              <View style={styles.performanceItem}>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                  Season Best
                </Text>
                <Text style={[TEXT_STYLES.body, { fontWeight: 'bold', color: COLORS.silver }]}>
                  {athlete.seasonBest}
                </Text>
              </View>
              
              <View style={styles.performanceItem}>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                  Target
                </Text>
                <Text style={[TEXT_STYLES.body, { fontWeight: 'bold', color: COLORS.error }]}>
                  {athlete.targetTime || athlete.targetWeight}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.statusSection}>
            <View style={styles.statusItem}>
              <Icon name="fitness-center" size={16} color={getTrainingLoadColor(athlete.trainingLoad)} />
              <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs }]}>
                Training: {athlete.trainingLoad}
              </Text>
            </View>
            
            <View style={styles.statusItem}>
              <Icon name="spa" size={16} color={COLORS.success} />
              <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs }]}>
                Recovery: {athlete.recoveryStatus}
              </Text>
            </View>
          </View>
        </Card.Content>
      </TouchableOpacity>
    </Card>
  );

  const renderMetricChart = () => {
    const metric = performanceMetrics.readiness;
    
    return (
      <Card style={styles.chartCard} elevation={4}>
        <LinearGradient
          colors={['#9C27B0', '#7B1FA2']}
          style={styles.chartHeader}
        >
          <Text style={[TEXT_STYLES.h3, { color: COLORS.white }]}>
            🎯 Competition Readiness
          </Text>
          <Icon name="radar" size={24} color={COLORS.white} />
        </LinearGradient>
        
        <Card.Content style={styles.chartContent}>
          <ProgressChart
            data={metric.data}
            width={screenWidth - 60}
            height={200}
            strokeWidth={16}
            radius={32}
            chartConfig={{
              backgroundColor: COLORS.white,
              backgroundGradientFrom: COLORS.white,
              backgroundGradientTo: COLORS.white,
              color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
            }}
            hideLegend={false}
          />
          <View style={styles.readinessLegend}>
            {metric.data.labels.map((label, index) => (
              <View key={index} style={styles.legendItem}>
                <Text style={[TEXT_STYLES.caption, { fontWeight: 'bold' }]}>
                  {label}: {Math.round(metric.data.data[index] * 100)}%
                </Text>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderStatsOverview = () => (
    <Card style={styles.statsCard} elevation={3}>
      <LinearGradient
        colors={['#9C27B0', '#7B1FA2']}
        style={styles.statsHeader}
      >
        <View style={styles.statsHeaderContent}>
          <Text style={[TEXT_STYLES.h3, { color: COLORS.white }]}>
            🏆 Competition Dashboard
          </Text>
          <Animated.View style={{ transform: [{ scale: pulseAnimation }] }}>
            <Icon name="jump-rope" size={32} color={COLORS.gold} />
          </Animated.View>
        </View>
      </LinearGradient>
      
      <Card.Content style={styles.statsContent}>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Icon name="people" size={28} color={COLORS.primary} />
            <Text style={[TEXT_STYLES.h2, { color: COLORS.text }]}>
              {mockAthletes.length}
            </Text>
            <Text style={TEXT_STYLES.caption}>Athletes</Text>
          </View>
          
          <View style={styles.statItem}>
            <Icon name="event" size={28} color={COLORS.warning} />
            <Text style={[TEXT_STYLES.h2, { color: COLORS.text }]}>
              {mockAthletes.filter(a => a.nextCompetition.daysLeft <= 30).length}
            </Text>
            <Text style={TEXT_STYLES.caption}>Upcoming</Text>
          </View>
          
          <View style={styles.statItem}>
            <Icon name="trending-up" size={28} color={COLORS.success} />
            <Text style={[TEXT_STYLES.h2, { color: COLORS.text }]}>
              {Math.round(mockAthletes.reduce((acc, a) => acc + a.readinessScore, 0) / mockAthletes.length)}%
            </Text>
            <Text style={TEXT_STYLES.caption}>Avg Readiness</Text>
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
        colors={['#9C27B0', '#7B1FA2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={[TEXT_STYLES.h1, { color: COLORS.white }]}>
            🏆 Competition Prep
          </Text>
          <Text style={[TEXT_STYLES.body, { color: COLORS.white, opacity: 0.9 }]}>
            Peak performance preparation and planning
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
            colors={[COLORS.competition]}
            tintColor={COLORS.competition}
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
              iconColor={COLORS.competition}
            />
          </Surface>

          {/* Stats Overview */}
          {renderStatsOverview()}

          {/* Phase Filter */}
          <Card style={styles.phaseSelector} elevation={2}>
            <Card.Content>
              <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
                📊 Training Phases
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipContainer}>
                  {Object.keys(preparationPhases).map((phase) => (
                    <Chip
                      key={phase}
                      selected={selectedPhase === phase}
                      onPress={() => setSelectedPhase(phase)}
                      style={[
                        styles.phaseFilterChip,
                        selectedPhase === phase && { backgroundColor: preparationPhases[phase].color }
                      ]}
                      textStyle={selectedPhase === phase && { color: COLORS.white }}
                      icon={() => <Icon 
                        name={preparationPhases[phase].icon} 
                        size={16} 
                        color={selectedPhase === phase ? COLORS.white : preparationPhases[phase].color} 
                      />}
                    >
                      {preparationPhases[phase].name}
                    </Chip>
                  ))}
                </View>
              </ScrollView>
            </Card.Content>
          </Card>

          {/* Readiness Chart */}
          {renderMetricChart()}

          {/* Athletes List */}
          <View style={styles.athleteSection}>
            <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
              🏃‍♂️ Your Athletes ({filteredAthletes.length})
            </Text>
            {filteredAthletes.map(renderAthleteCard)}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Detail Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card elevation={8}>
            <Card.Content>
              <View style={styles.modalHeader}>
                <Text style={TEXT_STYLES.h3}>🏆 Detailed Competition Plan</Text>
                <IconButton
                  icon="close"
                  onPress={() => setModalVisible(false)}
                />
              </View>
              {selectedAthlete && (
                <>
                  <Text style={[TEXT_STYLES.h3, { color: COLORS.competition, marginBottom: SPACING.sm }]}>
                    {selectedAthlete.name}
                  </Text>
                  <Text style={TEXT_STYLES.body}>
                    Advanced competition preparation features coming soon! 🚀
                  </Text>
                  <Text style={[TEXT_STYLES.caption, { marginTop: SPACING.sm }]}>
                    This will include detailed periodization plans, peak performance optimization, tapering strategies, and competition day protocols.
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
        style={[styles.fab, { backgroundColor: COLORS.competition }]}
        onPress={() => Alert.alert('New Competition', 'Competition planning feature coming soon! 🏆')}
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
  phaseSelector: {
    marginBottom: SPACING.md,
    borderRadius: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  phaseFilterChip: {
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
  readinessLegend: {
    marginTop: SPACING.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  legendItem: {
    alignItems: 'center',
  },
  athleteSection: {
    marginTop: SPACING.md,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
    color: COLORS.text,
  },
  athleteCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
  },
  athleteCardContent: {
    padding: SPACING.md,
  },
  athleteHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  avatarContainer: {
    position: 'relative',
  },
  phaseBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
  },
  athleteInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  phaseRow: {
    marginTop: SPACING.xs,
  },
  phaseChip: {
    alignSelf: 'flex-start',
  },
  countdownContainer: {
    alignItems: 'center',
  },
  countdownCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  competitionInfo: {
    marginBottom: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  competitionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
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
    flex: 1,
  },
  miniProgressBar: {
    width: 50,
    height: 4,
    borderRadius: 2,
    marginTop: SPACING.xs,
  },
  divider: {
    marginVertical: SPACING.md,
    backgroundColor: COLORS.background,
  },
  performanceSection: {
    marginBottom: SPACING.md,
  },
  performanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  performanceItem: {
    alignItems: 'center',
    flex: 1,
  },
  statusSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: SPACING.sm,
  },
  statusItem: {
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

export default CompetitionPrep;