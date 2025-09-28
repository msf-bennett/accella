import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Animated,
  Dimensions,
  Alert,
  TouchableOpacity,
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
  Searchbar,
  Divider,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your established constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const PersonalBest = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRecord, setExpandedRecord] = useState(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Redux state
  const user = useSelector(state => state.auth.user);
  const dispatch = useDispatch();

  // Mock data - replace with actual Redux state
  const personalBestData = {
    totalRecords: 28,
    recentlyBroken: 3,
    thisMonthImprovement: 12,
    categories: ['all', 'speed', 'strength', 'endurance', 'flexibility', 'skill'],
    timeframes: ['all', 'week', 'month', '3months', 'year'],
    records: [
      {
        id: 1,
        name: '100m Sprint',
        value: '11.2',
        unit: 'seconds',
        category: 'speed',
        previousBest: '11.8',
        improvement: '-0.6',
        achievedDate: '2024-08-15',
        isNew: true,
        icon: 'speed',
        color: '#FF6B35',
        progressHistory: [
          { date: '2024-01-15', value: 12.5 },
          { date: '2024-03-10', value: 12.1 },
          { date: '2024-05-22', value: 11.8 },
          { date: '2024-08-15', value: 11.2 },
        ],
        notes: 'Perfect weather conditions, new running shoes helped!'
      },
      {
        id: 2,
        name: 'Bench Press',
        value: '185',
        unit: 'lbs',
        category: 'strength',
        previousBest: '175',
        improvement: '+10',
        achievedDate: '2024-08-12',
        isNew: true,
        icon: 'fitness-center',
        color: '#4CAF50',
        progressHistory: [
          { date: '2024-02-01', value: 155 },
          { date: '2024-04-15', value: 165 },
          { date: '2024-06-20', value: 175 },
          { date: '2024-08-12', value: 185 },
        ],
        notes: 'Focused on proper form and progressive overload'
      },
      {
        id: 3,
        name: '5K Run',
        value: '19:45',
        unit: 'min:sec',
        category: 'endurance',
        previousBest: '20:30',
        improvement: '-0:45',
        achievedDate: '2024-08-10',
        isNew: false,
        icon: 'directions-run',
        color: '#2196F3',
        progressHistory: [
          { date: '2024-01-20', value: 22.5 },
          { date: '2024-04-05', value: 21.2 },
          { date: '2024-06-18', value: 20.5 },
          { date: '2024-08-10', value: 19.75 },
        ],
        notes: 'Consistent training and improved pacing strategy'
      },
      {
        id: 4,
        name: 'Deadlift',
        value: '315',
        unit: 'lbs',
        category: 'strength',
        previousBest: '295',
        improvement: '+20',
        achievedDate: '2024-08-08',
        isNew: false,
        icon: 'fitness-center',
        color: '#4CAF50',
        progressHistory: [
          { date: '2024-01-10', value: 265 },
          { date: '2024-03-25', value: 280 },
          { date: '2024-06-12', value: 295 },
          { date: '2024-08-08', value: 315 },
        ],
        notes: 'Improved hip hinge technique made the difference'
      },
      {
        id: 5,
        name: 'Plank Hold',
        value: '4:30',
        unit: 'min:sec',
        category: 'endurance',
        previousBest: '4:00',
        improvement: '+0:30',
        achievedDate: '2024-08-05',
        isNew: false,
        icon: 'timer',
        color: '#FF9800',
        progressHistory: [
          { date: '2024-02-15', value: 2.5 },
          { date: '2024-04-20', value: 3.25 },
          { date: '2024-06-30', value: 4.0 },
          { date: '2024-08-05', value: 4.5 },
        ],
        notes: 'Mental focus training really helped push through'
      },
      {
        id: 6,
        name: 'Vertical Jump',
        value: '28.5',
        unit: 'inches',
        category: 'skill',
        previousBest: '27.0',
        improvement: '+1.5',
        achievedDate: '2024-07-28',
        isNew: false,
        icon: 'trending-up',
        color: '#9C27B0',
        progressHistory: [
          { date: '2024-01-05', value: 25.0 },
          { date: '2024-03-15', value: 26.0 },
          { date: '2024-05-10', value: 27.0 },
          { date: '2024-07-28', value: 28.5 },
        ],
        notes: 'Plyometric training program paying off!'
      }
    ],
    recentAchievements: [
      { name: '100m Sprint', improvement: '5.1%', date: '3 days ago' },
      { name: 'Bench Press', improvement: '5.7%', date: '1 week ago' },
      { name: '5K Run', improvement: '3.7%', date: '2 weeks ago' },
    ]
  };

  const categories = [
    { key: 'all', label: 'All', icon: 'fitness-center' },
    { key: 'speed', label: 'Speed', icon: 'speed' },
    { key: 'strength', label: 'Strength', icon: 'fitness-center' },
    { key: 'endurance', label: 'Endurance', icon: 'timer' },
    { key: 'flexibility', label: 'Flexibility', icon: 'accessibility' },
    { key: 'skill', label: 'Skills', icon: 'sports-basketball' },
  ];

  const timeframes = [
    { key: 'all', label: 'All Time' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: '3months', label: '3 Months' },
    { key: 'year', label: 'This Year' },
  ];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('🏆 Records Updated!', 'Your latest personal bests have been synced.', [
        { text: 'Awesome! 💪' }
      ]);
    }, 1500);
  }, []);

  const filteredRecords = personalBestData.records.filter(record => {
    const matchesCategory = selectedCategory === 'all' || record.category === selectedCategory;
    const matchesSearch = record.name.toLowerCase().includes(searchQuery.toLowerCase());
    // Add timeframe filtering logic here based on achievedDate
    return matchesCategory && matchesSearch;
  });

  const handleRecordPress = (recordId) => {
    setExpandedRecord(expandedRecord === recordId ? null : recordId);
  };

  const handleAddRecord = () => {
    Alert.alert('📝 Feature Coming Soon', 'Manual record entry will be available in the next update!', [
      { text: 'Got it!' }
    ]);
  };

  const formatValue = (value, unit) => {
    return `${value} ${unit}`;
  };

  const calculateImprovementPercentage = (current, previous, unit) => {
    if (unit === 'seconds' || unit === 'min:sec') {
      // For time-based metrics, lower is better
      const currentNum = parseFloat(current);
      const prevNum = parseFloat(previous);
      return (((prevNum - currentNum) / prevNum) * 100).toFixed(1);
    } else {
      // For other metrics, higher is better
      const currentNum = parseFloat(current);
      const prevNum = parseFloat(previous);
      return (((currentNum - prevNum) / prevNum) * 100).toFixed(1);
    }
  };

  const renderHeader = () => (
    <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <IconButton
              icon="arrow-back"
              iconColor="white"
              size={24}
              onPress={() => navigation.goBack()}
            />
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Personal Bests 🏆</Text>
              <Text style={styles.headerSubtitle}>Track your progress & achievements</Text>
            </View>
          </View>
          <IconButton
            icon="share"
            iconColor="white"
            size={24}
            onPress={() => Alert.alert('📤 Feature Coming Soon', 'Share your achievements with friends!')}
          />
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderStatsOverview = () => (
    <Animated.View style={[styles.statsContainer, { opacity: fadeAnim }]}>
      <View style={styles.statsRow}>
        <Surface style={styles.statCard} elevation={2}>
          <Text style={styles.statNumber}>{personalBestData.totalRecords}</Text>
          <Text style={styles.statLabel}>Total Records</Text>
        </Surface>
        <Surface style={styles.statCard} elevation={2}>
          <Text style={[styles.statNumber, { color: COLORS.success }]}>
            {personalBestData.recentlyBroken}
          </Text>
          <Text style={styles.statLabel}>New This Week</Text>
        </Surface>
        <Surface style={styles.statCard} elevation={2}>
          <Text style={[styles.statNumber, { color: COLORS.primary }]}>
            {personalBestData.thisMonthImprovement}%
          </Text>
          <Text style={styles.statLabel}>Monthly Growth</Text>
        </Surface>
      </View>
    </Animated.View>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <Searchbar
        placeholder="Search records..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        iconColor={COLORS.primary}
      />
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryFilters}
      >
        {categories.map((category) => (
          <Chip
            key={category.key}
            mode={selectedCategory === category.key ? 'flat' : 'outlined'}
            selected={selectedCategory === category.key}
            onPress={() => setSelectedCategory(category.key)}
            style={[
              styles.categoryChip,
              selectedCategory === category.key && { backgroundColor: COLORS.primary + '20' }
            ]}
            icon={category.icon}
          >
            {category.label}
          </Chip>
        ))}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.timeframeFilters}
      >
        {timeframes.map((timeframe) => (
          <Chip
            key={timeframe.key}
            mode={selectedTimeframe === timeframe.key ? 'flat' : 'outlined'}
            selected={selectedTimeframe === timeframe.key}
            onPress={() => setSelectedTimeframe(timeframe.key)}
            style={[
              styles.timeframeChip,
              selectedTimeframe === timeframe.key && { backgroundColor: COLORS.secondary + '20' }
            ]}
          >
            {timeframe.label}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const renderRecentAchievements = () => (
    <Card style={styles.achievementsCard} elevation={3}>
      <Card.Content>
        <View style={styles.achievementsHeader}>
          <Text style={styles.sectionTitle}>Recent Improvements 🚀</Text>
          <IconButton
            icon="trending-up"
            size={20}
            iconColor={COLORS.success}
          />
        </View>
        {personalBestData.recentAchievements.map((achievement, index) => (
          <View key={index} style={styles.achievementItem}>
            <View style={styles.achievementLeft}>
              <Icon name="jump-rope" size={20} color="#FFD700" />
              <View style={styles.achievementText}>
                <Text style={styles.achievementName}>{achievement.name}</Text>
                <Text style={styles.achievementDate}>{achievement.date}</Text>
              </View>
            </View>
            <View style={styles.improvementBadge}>
              <Text style={styles.improvementText}>+{achievement.improvement}</Text>
            </View>
          </View>
        ))}
      </Card.Content>
    </Card>
  );

  const renderRecordItem = ({ item, index }) => {
    const isExpanded = expandedRecord === item.id;
    const improvementPercentage = calculateImprovementPercentage(item.value, item.previousBest, item.unit);
    
    return (
      <Animated.View
        style={[
          styles.recordCard,
          {
            opacity: fadeAnim,
            transform: [{
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              })
            }]
          }
        ]}
      >
        <TouchableOpacity onPress={() => handleRecordPress(item.id)}>
          <Surface style={styles.recordSurface} elevation={2}>
            <View style={styles.recordHeader}>
              <View style={styles.recordLeft}>
                <View style={[styles.recordIcon, { backgroundColor: item.color + '20' }]}>
                  <Icon name={item.icon} size={24} color={item.color} />
                </View>
                <View style={styles.recordInfo}>
                  <View style={styles.recordTitleRow}>
                    <Text style={styles.recordName}>{item.name}</Text>
                    {item.isNew && (
                      <Chip
                        mode="flat"
                        style={styles.newBadge}
                        textStyle={styles.newBadgeText}
                      >
                        NEW! 🔥
                      </Chip>
                    )}
                  </View>
                  <Text style={styles.recordCategory}>{item.category.toUpperCase()}</Text>
                </View>
              </View>
              <View style={styles.recordRight}>
                <Text style={[styles.recordValue, { color: item.color }]}>
                  {formatValue(item.value, item.unit)}
                </Text>
                <View style={styles.improvementContainer}>
                  <Icon
                    name="trending-up"
                    size={16}
                    color={COLORS.success}
                  />
                  <Text style={[styles.improvementValue, { color: COLORS.success }]}>
                    {improvementPercentage}%
                  </Text>
                </View>
              </View>
            </View>

            {isExpanded && (
              <View style={styles.recordDetails}>
                <Divider style={styles.divider} />
                <View style={styles.recordStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statItemLabel}>Previous Best</Text>
                    <Text style={styles.statItemValue}>
                      {formatValue(item.previousBest, item.unit)}
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statItemLabel}>Improvement</Text>
                    <Text style={[styles.statItemValue, { color: COLORS.success }]}>
                      {item.improvement} {item.unit}
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statItemLabel}>Achieved On</Text>
                    <Text style={styles.statItemValue}>
                      {new Date(item.achievedDate).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                
                {item.notes && (
                  <View style={styles.notesContainer}>
                    <Text style={styles.notesLabel}>Notes:</Text>
                    <Text style={styles.notesText}>{item.notes}</Text>
                  </View>
                )}

                <View style={styles.recordActions}>
                  <Button
                    mode="outlined"
                    onPress={() => Alert.alert('📈 Feature Coming Soon', 'Detailed progress chart coming soon!')}
                    style={styles.actionButton}
                    icon="show-chart"
                  >
                    View Progress
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={() => Alert.alert('🎯 Feature Coming Soon', 'Goal setting feature coming soon!')}
                    style={styles.actionButton}
                    icon="flag"
                  >
                    Set Goal
                  </Button>
                </View>
              </View>
            )}
          </Surface>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      {renderHeader()}
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {renderStatsOverview()}
        {renderRecentAchievements()}
        {renderFilters()}
        
        <View style={styles.recordsList}>
          <Text style={styles.sectionTitle}>Your Records ({filteredRecords.length})</Text>
          <FlatList
            data={filteredRecords}
            renderItem={renderRecordItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </ScrollView>

      <FAB
        icon="add"
        style={styles.fab}
        onPress={handleAddRecord}
        label="Add Record"
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  headerGradient: {
    paddingTop: StatusBar.currentHeight + SPACING.sm,
    paddingBottom: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerText: {
    marginLeft: SPACING.sm,
  },
  headerTitle: {
    ...TEXT_STYLES.h6,
    color: 'white',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 120,
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100,
  },
  statsContainer: {
    marginBottom: SPACING.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    padding: SPACING.md,
    marginHorizontal: SPACING.xs,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  statNumber: {
    ...TEXT_STYLES.h5,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  achievementsCard: {
    marginBottom: SPACING.lg,
    borderRadius: 12,
  },
  achievementsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.h6,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  achievementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  achievementLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  achievementText: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  achievementName: {
    ...TEXT_STYLES.body2,
    fontWeight: '600',
    color: COLORS.text,
  },
  achievementDate: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  improvementBadge: {
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 16,
  },
  improvementText: {
    ...TEXT_STYLES.caption,
    color: COLORS.success,
    fontWeight: 'bold',
  },
  filtersContainer: {
    marginBottom: SPACING.lg,
  },
  searchBar: {
    marginBottom: SPACING.md,
    backgroundColor: 'white',
  },
  categoryFilters: {
    paddingRight: SPACING.md,
    marginBottom: SPACING.md,
  },
  categoryChip: {
    marginRight: SPACING.sm,
    backgroundColor: 'white',
  },
  timeframeFilters: {
    paddingRight: SPACING.md,
  },
  timeframeChip: {
    marginRight: SPACING.sm,
    backgroundColor: 'white',
  },
  recordsList: {
    marginTop: SPACING.md,
  },
  recordCard: {
    marginBottom: SPACING.md,
  },
  recordSurface: {
    borderRadius: 12,
    backgroundColor: 'white',
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  recordLeft: {
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
  recordInfo: {
    flex: 1,
  },
  recordTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  recordName: {
    ...TEXT_STYLES.body1,
    fontWeight: 'bold',
    color: COLORS.text,
    marginRight: SPACING.sm,
  },
  newBadge: {
    backgroundColor: '#FFD700',
    height: 24,
  },
  newBadgeText: {
    ...TEXT_STYLES.caption,
    fontSize: 10,
    fontWeight: 'bold',
  },
  recordCategory: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  recordRight: {
    alignItems: 'flex-end',
  },
  recordValue: {
    ...TEXT_STYLES.h6,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  improvementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  improvementValue: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  recordDetails: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  divider: {
    marginBottom: SPACING.lg,
  },
  recordStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statItemLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  statItemValue: {
    ...TEXT_STYLES.body2,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  notesContainer: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.lg,
  },
  notesLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  notesText: {
    ...TEXT_STYLES.body2,
    color: COLORS.text,
    fontStyle: 'italic',
  },
  recordActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default PersonalBest;
