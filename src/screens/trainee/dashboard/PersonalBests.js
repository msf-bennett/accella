import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  RefreshControl,
  Animated,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Alert,
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
  Badge,
  Divider,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f8f9fa',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e0e0e0',
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
  record: '#E91E63',
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
  body: { fontSize: 16, fontWeight: 'normal' },
  caption: { fontSize: 14, fontWeight: 'normal' },
  small: { fontSize: 12, fontWeight: 'normal' },
};

const { width } = Dimensions.get('window');

const PersonalBest = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user, personalBests, statistics } = useSelector(state => ({
    user: state.auth.user,
    personalBests: state.records.personalBests,
    statistics: state.statistics.userStats,
  }));

  const [refreshing, setRefreshing] = useState(false);
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('all_time');
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRecord, setExpandedRecord] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const recordAnims = useRef({}).current;

  // Mock data for demonstration
  const mockPersonalBests = [
    {
      id: '1',
      category: 'Speed',
      sport: 'Football',
      exercise: '100m Sprint',
      currentBest: '11.2',
      previousBest: '11.8',
      unit: 'seconds',
      improvement: 0.6,
      improvementPercent: 5.1,
      achievedDate: '2024-08-20',
      icon: 'speed',
      color: COLORS.error,
      isNewRecord: true,
      trend: 'improving',
      history: [
        { date: '2024-07-01', value: 12.1 },
        { date: '2024-07-15', value: 11.8 },
        { date: '2024-08-01', value: 11.5 },
        { date: '2024-08-20', value: 11.2 },
      ],
      rank: 1,
      totalAthletes: 25,
    },
    {
      id: '2',
      category: 'Strength',
      sport: 'Football',
      exercise: 'Bench Press',
      currentBest: '85',
      previousBest: '80',
      unit: 'kg',
      improvement: 5,
      improvementPercent: 6.25,
      achievedDate: '2024-08-18',
      icon: 'fitness-center',
      color: COLORS.success,
      isNewRecord: false,
      trend: 'improving',
      history: [
        { date: '2024-07-01', value: 70 },
        { date: '2024-07-15', value: 75 },
        { date: '2024-08-01', value: 80 },
        { date: '2024-08-18', value: 85 },
      ],
      rank: 3,
      totalAthletes: 25,
    },
    {
      id: '3',
      category: 'Endurance',
      sport: 'Football',
      exercise: '5km Run',
      currentBest: '22:30',
      previousBest: '23:45',
      unit: 'minutes',
      improvement: 1.25,
      improvementPercent: 5.26,
      achievedDate: '2024-08-15',
      icon: 'directions-run',
      color: COLORS.warning,
      isNewRecord: false,
      trend: 'improving',
      history: [
        { date: '2024-07-01', value: 25.5 },
        { date: '2024-07-15', value: 24.2 },
        { date: '2024-08-01', value: 23.75 },
        { date: '2024-08-15', value: 22.5 },
      ],
      rank: 2,
      totalAthletes: 25,
    },
    {
      id: '4',
      category: 'Agility',
      sport: 'Football',
      exercise: 'Cone Drill',
      currentBest: '8.9',
      previousBest: '9.2',
      unit: 'seconds',
      improvement: 0.3,
      improvementPercent: 3.26,
      achievedDate: '2024-08-12',
      icon: 'blur-on',
      color: COLORS.primary,
      isNewRecord: false,
      trend: 'improving',
      history: [
        { date: '2024-07-01', value: 9.8 },
        { date: '2024-07-15', value: 9.5 },
        { date: '2024-08-01', value: 9.2 },
        { date: '2024-08-12', value: 8.9 },
      ],
      rank: 4,
      totalAthletes: 25,
    },
    {
      id: '5',
      category: 'Power',
      sport: 'Football',
      exercise: 'Vertical Jump',
      currentBest: '62',
      previousBest: '58',
      unit: 'cm',
      improvement: 4,
      improvementPercent: 6.9,
      achievedDate: '2024-08-10',
      icon: 'jump-to-element',
      color: COLORS.secondary,
      isNewRecord: true,
      trend: 'improving',
      history: [
        { date: '2024-07-01', value: 54 },
        { date: '2024-07-15', value: 56 },
        { date: '2024-08-01', value: 58 },
        { date: '2024-08-10', value: 62 },
      ],
      rank: 1,
      totalAthletes: 25,
    },
  ];

  const sports = [
    { key: 'all', label: 'All Sports', icon: 'sports' },
    { key: 'Football', label: 'Football', icon: 'sports-football' },
    { key: 'Basketball', label: 'Basketball', icon: 'sports-basketball' },
    { key: 'Track', label: 'Track & Field', icon: 'track-changes' },
  ];

  const timeframes = [
    { key: 'all_time', label: 'All Time' },
    { key: 'this_year', label: 'This Year' },
    { key: 'this_month', label: 'This Month' },
    { key: 'last_30_days', label: 'Last 30 Days' },
  ];

  const categories = [
    { key: 'Speed', color: COLORS.error, icon: 'speed' },
    { key: 'Strength', color: COLORS.success, icon: 'fitness-center' },
    { key: 'Endurance', color: COLORS.warning, icon: 'directions-run' },
    { key: 'Agility', color: COLORS.primary, icon: 'blur-on' },
    { key: 'Power', color: COLORS.secondary, icon: 'jump-to-element' },
  ];

  useEffect(() => {
    StatusBar.setBarStyle('light-content', true);
    StatusBar.setTranslucent(true);
    StatusBar.setBackgroundColor('transparent', true);

    // Initialize animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Initialize record animations
    mockPersonalBests.forEach((record, index) => {
      recordAnims[record.id] = new Animated.Value(0);
      Animated.timing(recordAnims[record.id], {
        toValue: 1,
        duration: 800,
        delay: index * 100,
        useNativeDriver: true,
      }).start();
    });

    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('Records Updated', 'Latest personal best data has been refreshed! 🏆');
    }, 1500);
  }, []);

  const handleRecordPress = useCallback((record) => {
    setExpandedRecord(expandedRecord === record.id ? null : record.id);
  }, [expandedRecord]);

  const handleShareRecord = useCallback((record) => {
    Alert.alert(
      'Share Personal Best',
      `Share your ${record.exercise} record of ${record.currentBest}${record.unit}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Share', onPress: () => Alert.alert('Feature Coming Soon', 'Social sharing will be available soon! 📱') }
      ]
    );
  }, []);

  const getFilteredRecords = () => {
    let filtered = mockPersonalBests;
    if (selectedSport !== 'all') {
      filtered = filtered.filter(record => record.sport === selectedSport);
    }
    return filtered;
  };

  const getTotalRecords = () => mockPersonalBests.length;
  const getNewRecords = () => mockPersonalBests.filter(record => record.isNewRecord).length;
  const getAverageImprovement = () => {
    const improvements = mockPersonalBests.map(record => record.improvementPercent);
    return (improvements.reduce((sum, imp) => sum + imp, 0) / improvements.length).toFixed(1);
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return { icon: 'jump-rope', color: COLORS.gold, text: '1st' };
    if (rank === 2) return { icon: 'jump-rope', color: COLORS.silver, text: '2nd' };
    if (rank === 3) return { icon: 'jump-rope', color: COLORS.bronze, text: '3rd' };
    return { icon: 'jump-rope', color: COLORS.textSecondary, text: `${rank}th` };
  };

  const renderStatsCard = () => (
    <Surface style={styles.statsCard}>
      <LinearGradient
        colors={[COLORS.record, '#C2185B']}
        style={styles.statsGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.statsHeader}>
          <Icon name="jump-rope" size={32} color="#fff" />
          <Text style={styles.statsTitle}>Personal Records 🏆</Text>
        </View>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{getTotalRecords()}</Text>
            <Text style={styles.statLabel}>Total Records</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{getNewRecords()}</Text>
            <Text style={styles.statLabel}>New This Month</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{getAverageImprovement()}%</Text>
            <Text style={styles.statLabel}>Avg Improvement</Text>
          </View>
        </View>
      </LinearGradient>
    </Surface>
  );

  const renderCategoryStats = () => (
    <View style={styles.categorySection}>
      <Text style={styles.sectionTitle}>Performance by Category 📊</Text>
      <View style={styles.categoryGrid}>
        {categories.map(category => {
          const categoryRecords = mockPersonalBests.filter(record => record.category === category.key);
          const avgImprovement = categoryRecords.length > 0 
            ? (categoryRecords.reduce((sum, record) => sum + record.improvementPercent, 0) / categoryRecords.length).toFixed(1)
            : '0.0';
          
          return (
            <Surface key={category.key} style={styles.categoryCard}>
              <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
                <Icon name={category.icon} size={24} color={category.color} />
              </View>
              <Text style={styles.categoryName}>{category.key}</Text>
              <Text style={styles.categoryCount}>{categoryRecords.length} records</Text>
              <Text style={[styles.categoryImprovement, { color: category.color }]}>
                +{avgImprovement}%
              </Text>
            </Surface>
          );
        })}
      </View>
    </View>
  );

  const renderRecordCard = ({ item, index }) => {
    const rankBadge = getRankBadge(item.rank);
    const isExpanded = expandedRecord === item.id;
    
    return (
      <Animated.View
        style={[
          styles.recordCard,
          {
            opacity: recordAnims[item.id] || 1,
            transform: [{
              translateX: recordAnims[item.id] ? recordAnims[item.id].interpolate({
                inputRange: [0, 1],
                outputRange: [100, 0],
              }) : 0
            }],
          },
        ]}
      >
        <Card
          style={[
            styles.card,
            item.isNewRecord && styles.newRecordCard
          ]}
          onPress={() => handleRecordPress(item)}
        >
          <View style={styles.cardHeader}>
            <View style={styles.recordInfo}>
              <View style={[styles.recordIcon, { backgroundColor: item.color + '20' }]}>
                <Icon name={item.icon} size={24} color={item.color} />
              </View>
              <View style={styles.recordDetails}>
                <Text style={styles.recordTitle}>{item.exercise}</Text>
                <Text style={styles.recordCategory}>{item.category} • {item.sport}</Text>
              </View>
            </View>
            
            <View style={styles.recordActions}>
              {item.isNewRecord && (
                <Badge style={styles.newRecordBadge}>NEW</Badge>
              )}
              <View style={styles.rankBadge}>
                <Icon name={rankBadge.icon} size={16} color={rankBadge.color} />
                <Text style={[styles.rankText, { color: rankBadge.color }]}>
                  {rankBadge.text}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.recordContent}>
            <View style={styles.bestSection}>
              <Text style={styles.currentBest}>
                {item.currentBest}<Text style={styles.unit}>{item.unit}</Text>
              </Text>
              <View style={styles.improvementSection}>
                <Icon name="trending-up" size={16} color={COLORS.success} />
                <Text style={styles.improvementText}>
                  +{item.improvementPercent}% improvement
                </Text>
              </View>
            </View>

            <View style={styles.comparisonSection}>
              <Text style={styles.previousLabel}>Previous Best:</Text>
              <Text style={styles.previousBest}>
                {item.previousBest}{item.unit}
              </Text>
            </View>

            <Text style={styles.achievedDate}>
              Achieved on {new Date(item.achievedDate).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </Text>
          </View>

          {isExpanded && (
            <View style={styles.expandedContent}>
              <Divider style={styles.divider} />
              
              <View style={styles.progressHistory}>
                <Text style={styles.historyTitle}>Progress History 📈</Text>
                <View style={styles.historyChart}>
                  {item.history.map((entry, hIndex) => (
                    <View key={hIndex} style={styles.historyEntry}>
                      <Text style={styles.historyValue}>{entry.value}</Text>
                      <View 
                        style={[
                          styles.historyBar,
                          {
                            height: (entry.value / Math.max(...item.history.map(h => h.value))) * 40,
                            backgroundColor: item.color,
                          }
                        ]}
                      />
                      <Text style={styles.historyDate}>
                        {new Date(entry.date).toLocaleDateString('en-US', { month: 'short' })}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.expandedActions}>
                <Button
                  mode="outlined"
                  onPress={() => handleShareRecord(item)}
                  style={styles.actionButton}
                  icon="share"
                >
                  Share
                </Button>
                <Button
                  mode="contained"
                  onPress={() => Alert.alert('Feature Coming Soon', 'Detailed analytics will be available soon!')}
                  style={[styles.actionButton, { backgroundColor: item.color }]}
                  icon="analytics"
                >
                  View Details
                </Button>
              </View>
            </View>
          )}
        </Card>
      </Animated.View>
    );
  };

  const renderSportChip = ({ item }) => (
    <Chip
      mode={selectedSport === item.key ? 'flat' : 'outlined'}
      selected={selectedSport === item.key}
      onPress={() => setSelectedSport(item.key)}
      style={[
        styles.sportChip,
        selectedSport === item.key && styles.selectedSportChip
      ]}
      textStyle={[
        styles.sportChipText,
        selectedSport === item.key && styles.selectedSportChipText
      ]}
      icon={item.icon}
    >
      {item.label}
    </Chip>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <IconButton
              icon="arrow-back"
              iconColor="#fff"
              size={24}
              onPress={() => navigation.goBack()}
            />
            <Text style={styles.headerTitle}>Personal Bests 🏆</Text>
            <IconButton
              icon="leaderboard"
              iconColor="#fff"
              size={24}
              onPress={() => Alert.alert('Feature Coming Soon', 'Leaderboard comparison will be available soon!')}
            />
          </View>
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
        {/* Stats Card */}
        {renderStatsCard()}

        {/* Category Performance */}
        {renderCategoryStats()}

        {/* Sport Filters */}
        <View style={styles.filtersSection}>
          <Text style={styles.filterTitle}>Filter by Sport</Text>
          <FlatList
            data={sports}
            renderItem={renderSportChip}
            keyExtractor={item => item.key}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContent}
          />
        </View>

        {/* Records List */}
        <View style={styles.recordsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Records 🎯</Text>
            <TouchableOpacity onPress={() => Alert.alert('Feature Coming Soon', 'Record comparison will be available soon!')}>
              <Text style={styles.compareText}>Compare</Text>
            </TouchableOpacity>
          </View>
          
          {getFilteredRecords().map((record, index) => (
            <View key={record.id}>
              {renderRecordCard({ item: record, index })}
            </View>
          ))}
        </View>

        <View style={{ height: SPACING.xl * 2 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="add-chart"
        style={styles.fab}
        onPress={() => Alert.alert('Feature Coming Soon', 'Manual record entry will be available soon!')}
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
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    gap: SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: '#fff',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: SPACING.md,
  },
  content: {
    flex: 1,
  },
  statsCard: {
    margin: SPACING.md,
    borderRadius: 16,
    elevation: 4,
    overflow: 'hidden',
  },
  statsGradient: {
    padding: SPACING.lg,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  statsTitle: {
    ...TEXT_STYLES.h3,
    color: '#fff',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    ...TEXT_STYLES.h2,
    color: '#fff',
    fontWeight: 'bold',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: '#fff',
    opacity: 0.8,
    textAlign: 'center',
  },
  categorySection: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  categoryCard: {
    flex: 1,
    minWidth: (width - SPACING.md * 4) / 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    elevation: 2,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  categoryName: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  categoryCount: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  categoryImprovement: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
  },
  filtersSection: {
    marginBottom: SPACING.lg,
  },
  filterTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.text,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  filtersContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  sportChip: {
    backgroundColor: '#fff',
    borderColor: COLORS.border,
  },
  selectedSportChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  sportChipText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  selectedSportChipText: {
    color: '#fff',
  },
  recordsSection: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  compareText: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    fontWeight: '600',
  },
  recordCard: {
    marginBottom: SPACING.md,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 3,
    overflow: 'hidden',
  },
  newRecordCard: {
    borderWidth: 2,
    borderColor: COLORS.record,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  recordInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recordIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  recordDetails: {
    flex: 1,
  },
  recordTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  recordCategory: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  recordActions: {
    alignItems: 'flex-end',
    gap: SPACING.sm,
  },
  newRecordBadge: {
    backgroundColor: COLORS.record,
  },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  rankText: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
  },
  recordContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  bestSection: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  currentBest: {
    ...TEXT_STYLES.h1,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  unit: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
  },
  improvementSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  improvementText: {
    ...TEXT_STYLES.caption,
    color: COLORS.success,
    fontWeight: '600',
  },
  comparisonSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  previousLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  previousBest: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  achievedDate: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  expandedContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  divider: {
    marginVertical: SPACING.md,
  },
  progressHistory: {
    marginBottom: SPACING.md,
  },
  historyTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  historyChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 60,
    marginBottom: SPACING.md,
  },
  historyEntry: {
    alignItems: 'center',
    flex: 1,
  },
  historyValue: {
    ...TEXT_STYLES.small,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  historyBar: {
    width: 20,
    borderRadius: 2,
    marginBottom: SPACING.xs,
  },
  historyDate: {
    ...TEXT_STYLES.small,
    color: COLORS.textSecondary,
  },
  expandedActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  actionButton: {
    flex: 1,
    borderRadius: 20,
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: COLORS.primary,
  },
});

export default PersonalBest;