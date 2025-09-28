import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Dimensions,
  Animated,
  TextInput,
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
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';

// Design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f5f5',
  white: '#FFFFFF',
  dark: '#2c3e50',
  gray: '#95a5a6',
  lightGray: '#ecf0f1',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold', color: COLORS.dark },
  h2: { fontSize: 24, fontWeight: 'bold', color: COLORS.dark },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.dark },
  body: { fontSize: 16, color: COLORS.dark },
  caption: { fontSize: 14, color: COLORS.gray },
  small: { fontSize: 12, color: COLORS.gray },
};

const { width, height } = Dimensions.get('window');

const ProgressiveOverloadScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState('All Clients');
  const [selectedTimeframe, setSelectedTimeframe] = useState('4 weeks');
  const [showProgressionModal, setShowProgressionModal] = useState(false);
  const [progressionData, setProgressionData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Mock data for progressive overload tracking
  const mockProgressionData = [
    {
      id: 1,
      clientId: 'client1',
      clientName: 'John Smith',
      exercise: 'Bench Press',
      category: 'Chest',
      progressions: [
        { week: 1, weight: 80, reps: 10, sets: 3, volume: 2400, rpe: 7 },
        { week: 2, weight: 82.5, reps: 10, sets: 3, volume: 2475, rpe: 7 },
        { week: 3, weight: 85, reps: 9, sets: 3, volume: 2295, rpe: 8 },
        { week: 4, weight: 87.5, reps: 8, sets: 3, volume: 2100, rpe: 8 },
      ],
      trend: 'increasing',
      nextProgression: 'Increase weight by 2.5kg',
      plateauRisk: 'low',
    },
    {
      id: 2,
      clientId: 'client1',
      clientName: 'John Smith',
      exercise: 'Squats',
      category: 'Legs',
      progressions: [
        { week: 1, weight: 100, reps: 8, sets: 3, volume: 2400, rpe: 8 },
        { week: 2, weight: 102.5, reps: 8, sets: 3, volume: 2460, rpe: 8 },
        { week: 3, weight: 102.5, reps: 8, sets: 3, volume: 2460, rpe: 9 },
        { week: 4, weight: 102.5, reps: 7, sets: 3, volume: 2153, rpe: 9 },
      ],
      trend: 'plateau',
      nextProgression: 'Deload or technique focus',
      plateauRisk: 'high',
    },
    {
      id: 3,
      clientId: 'client2',
      clientName: 'Sarah Johnson',
      exercise: 'Deadlift',
      category: 'Back',
      progressions: [
        { week: 1, weight: 90, reps: 5, sets: 3, volume: 1350, rpe: 8 },
        { week: 2, weight: 95, reps: 5, sets: 3, volume: 1425, rpe: 8 },
        { week: 3, weight: 100, reps: 5, sets: 3, volume: 1500, rpe: 8 },
        { week: 4, weight: 105, reps: 5, sets: 3, volume: 1575, rpe: 9 },
      ],
      trend: 'increasing',
      nextProgression: 'Continue progression',
      plateauRisk: 'low',
    },
    {
      id: 4,
      clientId: 'client2',
      clientName: 'Sarah Johnson',
      exercise: 'Pull-ups',
      category: 'Back',
      progressions: [
        { week: 1, weight: 0, reps: 6, sets: 3, volume: 18, rpe: 8 },
        { week: 2, weight: 2.5, reps: 5, sets: 3, volume: 15, rpe: 8 },
        { week: 3, weight: 5, reps: 5, sets: 3, volume: 15, rpe: 9 },
        { week: 4, weight: 5, reps: 6, sets: 3, volume: 18, rpe: 8 },
      ],
      trend: 'increasing',
      nextProgression: 'Add more weight',
      plateauRisk: 'low',
    },
    {
      id: 5,
      clientId: 'client3',
      clientName: 'Mike Davis',
      exercise: 'Shoulder Press',
      category: 'Shoulders',
      progressions: [
        { week: 1, weight: 50, reps: 12, sets: 3, volume: 1800, rpe: 7 },
        { week: 2, weight: 50, reps: 12, sets: 3, volume: 1800, rpe: 7 },
        { week: 3, weight: 50, reps: 13, sets: 3, volume: 1950, rpe: 7 },
        { week: 4, weight: 52.5, reps: 12, sets: 3, volume: 1890, rpe: 7 },
      ],
      trend: 'increasing',
      nextProgression: 'Continue weight increase',
      plateauRisk: 'low',
    },
  ];

  const clients = ['All Clients', 'John Smith', 'Sarah Johnson', 'Mike Davis'];
  const timeframes = ['2 weeks', '4 weeks', '8 weeks', '12 weeks'];
  const progressionTypes = ['Weight', 'Reps', 'Sets', 'Volume', 'RPE'];

  // Effects
  useEffect(() => {
    setProgressionData(mockProgressionData);
    setFilteredData(mockProgressionData);
    
    // Entrance animation
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
  }, []);

  useEffect(() => {
    filterData();
  }, [searchQuery, selectedClient, progressionData]);

  // Filter data based on search and client
  const filterData = useCallback(() => {
    let filtered = progressionData;

    if (selectedClient !== 'All Clients') {
      filtered = filtered.filter(item => item.clientName === selectedClient);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(item =>
        item.exercise.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.clientName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredData(filtered);
  }, [progressionData, searchQuery, selectedClient]);

  // Refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  // Calculate progression statistics
  const calculateStats = (progressions) => {
    if (progressions.length < 2) return { change: 0, trend: 'stable' };
    
    const first = progressions[0];
    const last = progressions[progressions.length - 1];
    const volumeChange = ((last.volume - first.volume) / first.volume) * 100;
    
    return {
      volumeChange: volumeChange.toFixed(1),
      weightChange: last.weight - first.weight,
      trend: volumeChange > 5 ? 'increasing' : volumeChange < -5 ? 'decreasing' : 'stable',
    };
  };

  // Get trend color
  const getTrendColor = (trend) => {
    switch (trend) {
      case 'increasing': return COLORS.success;
      case 'decreasing': return COLORS.error;
      case 'plateau': return COLORS.warning;
      default: return COLORS.gray;
    }
  };

  // Get trend icon
  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'increasing': return 'trending-up';
      case 'decreasing': return 'trending-down';
      case 'plateau': return 'trending-flat';
      default: return 'remove';
    }
  };

  // Handle progression planning
  const handleProgressionPlanning = (exercise) => {
    setSelectedExercise(exercise);
    setShowProgressionModal(true);
  };

  // Apply progression suggestion
  const applyProgressionSuggestion = (exerciseId, suggestion) => {
    Alert.alert(
      'Apply Progression',
      `Apply: ${suggestion}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Apply',
          onPress: () => {
            Alert.alert('Success', 'Progression applied to next workout! 🎯');
            setShowProgressionModal(false);
          }
        },
      ]
    );
  };

  // Render progression card
  const renderProgressionCard = (item) => {
    const stats = calculateStats(item.progressions);
    const latestProgression = item.progressions[item.progressions.length - 1];
    
    return (
      <Animated.View
        key={item.id}
        style={[
          styles.progressionCard,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Card style={styles.card} elevation={3}>
          <View style={styles.cardHeader}>
            <View style={styles.exerciseInfo}>
              <Text style={styles.exerciseName}>{item.exercise}</Text>
              <View style={styles.clientInfo}>
                <Icon name="person" size={14} color={COLORS.gray} />
                <Text style={styles.clientName}>{item.clientName}</Text>
                <Chip style={styles.categoryChip} textStyle={styles.categoryChipText}>
                  {item.category}
                </Chip>
              </View>
            </View>
            <View style={styles.trendIndicator}>
              <Icon
                name={getTrendIcon(item.trend)}
                size={24}
                color={getTrendColor(item.trend)}
              />
            </View>
          </View>

          <Card.Content style={styles.cardContent}>
            <View style={styles.progressionStats}>
              <Surface style={styles.statCard} elevation={1}>
                <Text style={styles.statValue}>{latestProgression.weight}kg</Text>
                <Text style={styles.statLabel}>Current Weight</Text>
                {stats.weightChange !== 0 && (
                  <Text style={[styles.statChange, { color: stats.weightChange > 0 ? COLORS.success : COLORS.error }]}>
                    {stats.weightChange > 0 ? '+' : ''}{stats.weightChange}kg
                  </Text>
                )}
              </Surface>

              <Surface style={styles.statCard} elevation={1}>
                <Text style={styles.statValue}>{latestProgression.volume}</Text>
                <Text style={styles.statLabel}>Volume</Text>
                <Text style={[styles.statChange, { color: parseFloat(stats.volumeChange) > 0 ? COLORS.success : COLORS.error }]}>
                  {stats.volumeChange > 0 ? '+' : ''}{stats.volumeChange}%
                </Text>
              </Surface>

              <Surface style={styles.statCard} elevation={1}>
                <Text style={styles.statValue}>{latestProgression.rpe}/10</Text>
                <Text style={styles.statLabel}>RPE</Text>
                <View style={styles.rpeIndicator}>
                  <View style={[styles.rpeDot, { backgroundColor: latestProgression.rpe >= 8 ? COLORS.error : latestProgression.rpe >= 6 ? COLORS.warning : COLORS.success }]} />
                </View>
              </Surface>
            </View>

            <View style={styles.progressionChart}>
              <Text style={styles.chartTitle}>4-Week Progression</Text>
              <View style={styles.chartBars}>
                {item.progressions.map((prog, index) => {
                  const maxVolume = Math.max(...item.progressions.map(p => p.volume));
                  const barHeight = (prog.volume / maxVolume) * 40;
                  
                  return (
                    <View key={index} style={styles.barContainer}>
                      <View style={[styles.progressBar, { height: barHeight }]} />
                      <Text style={styles.weekLabel}>W{prog.week}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            <View style={styles.recommendationSection}>
              <View style={styles.recommendationHeader}>
                <Icon name="lightbulb-outline" size={18} color={COLORS.primary} />
                <Text style={styles.recommendationTitle}>Next Progression</Text>
                <View style={[styles.riskBadge, { backgroundColor: item.plateauRisk === 'high' ? COLORS.error : item.plateauRisk === 'medium' ? COLORS.warning : COLORS.success }]}>
                  <Text style={styles.riskText}>
                    {item.plateauRisk === 'high' ? 'High Risk' : item.plateauRisk === 'medium' ? 'Med Risk' : 'Low Risk'}
                  </Text>
                </View>
              </View>
              <Text style={styles.recommendationText}>{item.nextProgression}</Text>
              
              <View style={styles.actionButtons}>
                <Button
                  mode="outlined"
                  onPress={() => handleProgressionPlanning(item)}
                  style={styles.planButton}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.buttonLabel}
                >
                  Plan Next
                </Button>
                <Button
                  mode="contained"
                  onPress={() => applyProgressionSuggestion(item.id, item.nextProgression)}
                  style={styles.applyButton}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.buttonLabel}
                >
                  Apply
                </Button>
              </View>
            </View>
          </Card.Content>
        </Card>
      </Animated.View>
    );
  };

  // Render progression modal
  const renderProgressionModal = () => (
    <Portal>
      <Modal
        visible={showProgressionModal}
        onDismiss={() => setShowProgressionModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.blurContainer}>
          <Surface style={styles.modalSurface} elevation={5}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Progression Planning: {selectedExercise?.exercise}
              </Text>
              <IconButton
                icon="close"
                onPress={() => setShowProgressionModal(false)}
              />
            </View>

            <ScrollView style={styles.modalContent}>
              {selectedExercise && (
                <>
                  <View style={styles.currentStats}>
                    <Text style={styles.sectionTitle}>Current Performance</Text>
                    <View style={styles.statsGrid}>
                      {selectedExercise.progressions.slice(-1).map((prog, index) => (
                        <View key={index} style={styles.statItem}>
                          <Text style={styles.statValue}>{prog.weight}kg × {prog.reps} × {prog.sets}</Text>
                          <Text style={styles.statLabel}>Weight × Reps × Sets</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  <View style={styles.progressionOptions}>
                    <Text style={styles.sectionTitle}>Progression Options</Text>
                    
                    <TouchableOpacity style={styles.optionCard}>
                      <LinearGradient colors={[COLORS.success, '#66BB6A']} style={styles.optionGradient}>
                        <Icon name="fitness-center" size={24} color={COLORS.white} />
                        <View style={styles.optionContent}>
                          <Text style={styles.optionTitle}>Increase Weight</Text>
                          <Text style={styles.optionDescription}>Add 2.5kg for next session</Text>
                        </View>
                        <Text style={styles.optionArrow}>→</Text>
                      </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.optionCard}>
                      <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.optionGradient}>
                        <Icon name="repeat" size={24} color={COLORS.white} />
                        <View style={styles.optionContent}>
                          <Text style={styles.optionTitle}>Increase Reps</Text>
                          <Text style={styles.optionDescription}>Add 1-2 reps per set</Text>
                        </View>
                        <Text style={styles.optionArrow}>→</Text>
                      </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.optionCard}>
                      <LinearGradient colors={[COLORS.warning, '#FFB74D']} style={styles.optionGradient}>
                        <Icon name="layers" size={24} color={COLORS.white} />
                        <View style={styles.optionContent}>
                          <Text style={styles.optionTitle}>Add Set</Text>
                          <Text style={styles.optionDescription}>Increase volume with extra set</Text>
                        </View>
                        <Text style={styles.optionArrow}>→</Text>
                      </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.optionCard}>
                      <LinearGradient colors={['#9C27B0', '#E91E63']} style={styles.optionGradient}>
                        <Icon name="speed" size={24} color={COLORS.white} />
                        <View style={styles.optionContent}>
                          <Text style={styles.optionTitle}>Tempo Change</Text>
                          <Text style={styles.optionDescription}>Slower eccentric for intensity</Text>
                        </View>
                        <Text style={styles.optionArrow}>→</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.aiRecommendation}>
                    <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.aiHeader}>
                      <Icon name="psychology" size={20} color={COLORS.white} />
                      <Text style={styles.aiTitle}>AI Recommendation</Text>
                    </LinearGradient>
                    <View style={styles.aiContent}>
                      <Text style={styles.aiText}>
                        Based on RPE progression and volume trends, recommend increasing weight by 2.5kg. 
                        Client shows consistent form and recovery capacity.
                      </Text>
                      <View style={styles.confidenceBar}>
                        <Text style={styles.confidenceLabel}>Confidence: 87%</Text>
                        <ProgressBar progress={0.87} color={COLORS.success} style={styles.confidenceProgress} />
                      </View>
                    </View>
                  </View>
                </>
              )}
            </ScrollView>
          </Surface>
        </BlurView>
      </Modal>
    </Portal>
  );

  // Calculate overall stats
  const overallStats = {
    totalExercises: filteredData.length,
    increasing: filteredData.filter(item => item.trend === 'increasing').length,
    plateau: filteredData.filter(item => item.trend === 'plateau').length,
    highRisk: filteredData.filter(item => item.plateauRisk === 'high').length,
  };

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
          <Text style={styles.headerTitle}>Progressive Overload</Text>
          <Text style={styles.headerSubtitle}>
            Track and optimize training progressions 📈
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search exercises or clients..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor={COLORS.primary}
        />
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        >
          <Text style={styles.filterLabel}>Clients:</Text>
          {clients.map((client) => (
            <Chip
              key={client}
              selected={selectedClient === client}
              onPress={() => setSelectedClient(client)}
              style={[
                styles.filterChip,
                selectedClient === client && styles.selectedFilterChip
              ]}
              textStyle={[
                styles.filterChipText,
                selectedClient === client && styles.selectedFilterChipText
              ]}
            >
              {client}
            </Chip>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        <View style={styles.overviewCard}>
          <Surface style={styles.overviewSurface} elevation={2}>
            <Text style={styles.overviewTitle}>Progression Overview</Text>
            <View style={styles.overviewStats}>
              <View style={styles.overviewStat}>
                <Text style={styles.overviewValue}>{overallStats.totalExercises}</Text>
                <Text style={styles.overviewLabel}>Exercises</Text>
              </View>
              <View style={styles.overviewStat}>
                <Text style={[styles.overviewValue, { color: COLORS.success }]}>
                  {overallStats.increasing}
                </Text>
                <Text style={styles.overviewLabel}>Progressing</Text>
              </View>
              <View style={styles.overviewStat}>
                <Text style={[styles.overviewValue, { color: COLORS.warning }]}>
                  {overallStats.plateau}
                </Text>
                <Text style={styles.overviewLabel}>Plateau</Text>
              </View>
              <View style={styles.overviewStat}>
                <Text style={[styles.overviewValue, { color: COLORS.error }]}>
                  {overallStats.highRisk}
                </Text>
                <Text style={styles.overviewLabel}>High Risk</Text>
              </View>
            </View>
          </Surface>
        </View>

        {filteredData.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📈</Text>
            <Text style={styles.emptyTitle}>No Progression Data</Text>
            <Text style={styles.emptyText}>
              {searchQuery ? 'Try adjusting your search' : 'Start tracking exercise progressions'}
            </Text>
          </View>
        ) : (
          filteredData.map(renderProgressionCard)
        )}
      </ScrollView>

      <FAB
        icon="add-chart"
        style={styles.fab}
        onPress={() => Alert.alert('Add Progression', 'Add new exercise progression tracking! 📊')}
        color={COLORS.white}
      />

      {renderProgressionModal()}
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
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.white,
    opacity: 0.9,
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    marginTop: -SPACING.lg,
    marginBottom: SPACING.md,
  },
  searchBar: {
    backgroundColor: COLORS.white,
    elevation: 3,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  filtersContainer: {
    marginBottom: SPACING.md,
  },
  filtersContent: {
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
  },
  filterLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginRight: SPACING.md,
    color: COLORS.dark,
  },
  filterChip: {
    marginRight: SPACING.sm,
    backgroundColor: COLORS.white,
  },
  selectedFilterChip: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    color: COLORS.dark,
  },
  selectedFilterChipText: {
    color: COLORS.white,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl * 3,
  },
  overviewCard: {
    marginBottom: SPACING.lg,
  },
  overviewSurface: {
    borderRadius: 12,
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
  },
  overviewTitle: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  overviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  overviewStat: {
    alignItems: 'center',
  },
  overviewValue: {
    ...TEXT_STYLES.h2,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  overviewLabel: {
    ...TEXT_STYLES.caption,
  },
  progressionCard: {
    marginBottom: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.xs,
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  clientName: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    marginRight: SPACING.sm,
  },
  categoryChip: {
    backgroundColor: COLORS.lightGray,
    height: 24,
  },
  categoryChipText: {
    ...TEXT_STYLES.small,
    color: COLORS.dark,
  },
  trendIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    paddingTop: SPACING.md,
  },
  progressionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    marginHorizontal: SPACING.xs,
    padding: SPACING.sm,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    alignItems: 'center',
  },
  statValue: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    ...TEXT_STYLES.small,
    textAlign: 'center',
  },
  statChange: {
    ...TEXT_STYLES.small,
    fontWeight: '600',
    marginTop: SPACING.xs,
  },
  rpeIndicator: {
    marginTop: SPACING.xs,
  },
  rpeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  progressionChart: {
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
  },
  chartTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 60,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  progressBar: {
    width: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
    marginBottom: SPACING.xs,
    minHeight: 10,
  },
  weekLabel: {
    ...TEXT_STYLES.small,
  },
  recommendationSection: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    padding: SPACING.md,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  recommendationTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginLeft: SPACING.sm,
    flex: 1,
  },
  riskBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  riskText: {
    ...TEXT_STYLES.small,
    color: COLORS.white,
    fontWeight: '600',
  },
  recommendationText: {
    ...TEXT_STYLES.body,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  planButton: {
    flex: 1,
    marginRight: SPACING.sm,
    borderColor: COLORS.primary,
  },
  applyButton: {
    flex: 1,
    marginLeft: SPACING.sm,
    backgroundColor: COLORS.primary,
  },
  buttonContent: {
    paddingVertical: SPACING.xs,
  },
  buttonLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    opacity: 0.7,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  blurContainer: {
    width: width * 0.95,
    maxHeight: height * 0.85,
  },
  modalSurface: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
    flex: 1,
  },
  modalContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    maxHeight: height * 0.7,
  },
  currentStats: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.md,
  },
  statsGrid: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    padding: SPACING.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  progressionOptions: {
    marginBottom: SPACING.xl,
  },
  optionCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    overflow: 'hidden',
  },
  optionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  optionContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  optionTitle: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  optionDescription: {
    ...TEXT_STYLES.caption,
    color: COLORS.white,
    opacity: 0.9,
  },
  optionArrow: {
    ...TEXT_STYLES.h2,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  aiRecommendation: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
    elevation: 2,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  aiTitle: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.white,
    marginLeft: SPACING.sm,
  },
  aiContent: {
    padding: SPACING.md,
  },
  aiText: {
    ...TEXT_STYLES.body,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  confidenceBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceLabel: {
    ...TEXT_STYLES.caption,
    marginRight: SPACING.sm,
    fontWeight: '600',
  },
  confidenceProgress: {
    flex: 1,
    height: 6,
  },
});

export default ProgressiveOverload;